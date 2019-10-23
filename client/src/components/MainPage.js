import React, {useState, useEffect, Fragment} from 'react'
import axios from 'axios'
import imageCompression from 'browser-image-compression';

const MainPage = props => {

    useEffect(()=>{
        getPhotos();
    },[])

    const [photos, setPhotos] = useState([]);
    const [fileData, setFileData] = useState('');

    const getPhotos =async () =>{
        const result = await axios.get('/files');
        console.log(result);
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
            const config = {
                headers: {
                    'Content-Type': 'application/json'
                }
            }
            await axios.post('/upload', formData, config);

        } catch (error) {
            console.log(error);
        }
    }

    return (
        <div className="container">
            <div className="row">
                <div className="col-md-6 m-auto">
                    <h1 className="text-center display-4 my-4">MongoDB File Upload</h1>
                    <form onSubmit={e => Submitter(e)}>
                        <div className="custom-file mb-3">
                        <input name="upload" type="file" className="btn btn-light" onChange ={e =>Changer(e)} accept=".jpg, .jpeg, .bmp, .png, .gif"/>
                            <label htmlFor="file" className="custom-file-label">Choose File</label>
                        </div>
                        <input type="submit" value="Upload" className="btn btn-primary btn-block"/>
                    </form>
                </div>
            </div>
            {photos.map(photo => (
                <Fragment>
                    <img src={`image/${photo.filename}`} key={photo._id} style={{height:"250px", width:"500px"}}/>
                    <br/>>
                </Fragment>                
            ))}
        </div>
    )
}


export default MainPage