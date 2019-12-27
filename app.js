const express = require('express');
const path = require('path');
const bodyParser = require('body-parser');
const crypto = require('crypto');
const mongoose = require('mongoose');
const multer = require('multer');
const GridFsStorage = require('multer-gridfs-storage');
const Grid = require('gridfs-stream');
const methodOverride = require('method-override');

const app = express();

app.use(bodyParser.json());
app.use(methodOverride('_method'));

let gfs;
let storage;
let upload;
let conn;


app.post('/login', (req, res)=>{
    const mongoURI = req.body.URI;
    conn = mongoose.createConnection(mongoURI, {
        useNewUrlParser: true,
        useCreateIndex: true,
        useFindAndModify: false,
        useUnifiedTopology: true
    });


    storage = new GridFsStorage({
        url: mongoURI,
        file: (req, file) => {
            return new Promise((resolve, reject) => {
                crypto.randomBytes(16, (err, buf) => {
                    if (err) {
                    return reject(err);
                    }
                    const filename = buf.toString('hex') + path.extname(file.originalname);
                    const fileInfo = {
                    filename: filename,
                    bucketName: 'uploads'
                    };
                    resolve(fileInfo);
                });
            });
        }
    });

    upload = multer({ storage }).single('file');

    conn.once('open', () => {
        console.log('MongoDB connected');
        gfs = Grid(conn.db, mongoose.mongo);
        gfs.collection('uploads');
    });

})

app.post('/upload', (req,res)=>{
    upload(req, res, ()=>{
        console.log('Success');
        console.log(res);
    });
});

app.get('/files', (req, res) => {
    if(!conn){
        return res.json({err: 'No connection to MongoDB databse', files: []})
    }
    if(gfs){
        gfs.files.find().toArray((err, files)=>{
            if(!files || files.length === 0){
                return res.status(404).json({err: 'No files exist', files: []})
            }

            return res.json(files);
        });
    }
});

app.get('/files/:filename', (req, res) => {
    gfs.files.findOne({filename: req.params.filename}, (err, file) => {
        if(!file){
            return res.status(404).json({err: 'No files exist'})
        }

        return res.json(file);
    });
});

app.get('/image/:filename', (req, res)=>{
    gfs.files.findOne({filename: req.params.filename}, (err, file) => {
        if(!file){
            return res.status(404).json({err: 'No files exist'})
        }

        if(file.contentType === 'image/jpeg' || file.contentType === 'image/png'){
            const readstream = gfs.createReadStream(file.filename);
            readstream.pipe(res);
        }else{
            res.status(404).json({
                err: "Not an image"
            })
        }
    });
});

app.delete('/files/:id', (req, res)=>{
    gfs.remove({_id: req.params.id, root: 'uploads'}, (err, gridStore) => {
        if(err){
            return res.status(404).json({err: err});
        }
        res.redirect('/mongo')
    });
});


const PORT = 5000

app.listen(PORT, ()=> console.log(`Server started on ${PORT}`))