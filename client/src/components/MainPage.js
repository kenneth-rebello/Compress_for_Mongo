import React, {useState, useEffect, Fragment} from 'react'
import axios from 'axios'
import imageCompression from 'browser-image-compression';

const MainPage = props => {

    useEffect(()=>{
        getPhotos();
    },[])

    useEffect(() => {
        return () => {
            localStorage.removeItem('token')
        }
    },[])
    if(!localStorage.token){
        props.history.push('/');
    }

    const [photos, setPhotos] = useState([]);
    const [fileData, setFileData] = useState('');

    const getPhotos =async () =>{
        const result = await axios.get('/files');
        
        if(result.data.err){
            localStorage.removeItem('token')
            alert(result.data.err)
        }
        setPhotos(result.data);
    }

    const Changer = e => {
        setFileData(e.target.files[0]);
    }

    const Submitter = async e => {
        e.preventDefault();
        const imageFile = fileData;
        
        console.log(`originalFile size ${imageFile.size} MB`);
        
        const options = {
            maxWidthOrHeight: 1080,
            useWebWorker: true
        }
        try {
            const compressedFile = await imageCompression(imageFile, options);
            console.log(`compressedFile size ${compressedFile.size} MB`); 
            
            const formData = new FormData();
            formData.append("file", compressedFile);
            console.log('Compressed file');
            console.log(compressedFile);
            const config = {
                headers: {
                    'Content-Type': 'application/json'
                }
            }
            console.log('Formdata');
            console.log(formData);
            await axios.post('/upload', formData, config);

        } catch (error) {
            console.log(error);
        }
    }

    let i =1;

    return (
        <div className="container">
            <h1 className="text-center display-4 my-4">MongoDB File Upload</h1>
            <form onSubmit={e => Submitter(e)}>
                <div className="custom-file mb-3">
                    <input name="upload" type="file" className="btn btn-light" onChange ={e =>Changer(e)} accept=".jpg, .jpeg, .bmp, .png, .gif"/>
                </div>
                <input type="submit" value="Upload" className="btn btn-gold btn-block"/>
            </form>
            {photos.length>0 && photos.map(photo => (
                <Fragment key={photo._id}>
                    <h4>{i++}) {photo.filename}</h4>
                    <img src={`image/${photo.filename}`} alt=""/>
                    <form method="POST" action={`/files/${photo._id}?_method=DELETE`}>
                        <button className="btn btn-danger btn-block mt-4">
                            Delete
                        </button>
                    </form>
                </Fragment>                
            ))}
        </div>
    )
}


export default MainPage