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

const mongoURI = "mongodb://localhost/uploader";
const conn = mongoose.createConnection(mongoURI);

let gfs;
conn.once('open', () => {
    console.log('MongoDB connected');
    gfs = Grid(conn.db, mongoose.mongo);
    gfs.collection('uploads');
})

const storage = new GridFsStorage({
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
const upload = multer({ storage });


app.post('/upload', upload.single('file'), (req,res)=>{
    console.log('Success');
});

app.get('/files', (req, res) => {
    gfs.files.find().toArray((err, files)=>{
        if(!files || files.length === 0){
            return res.status(404).json({err: 'No files exist'})
        }

        return res.json(files);
    });
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
    });
});


const PORT = 5000

app.listen(PORT, ()=> console.log(`Server started on ${PORT}`))