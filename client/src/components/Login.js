import React ,{useState} from 'react'
import {Link} from 'react-router-dom'
import axios from 'axios';

const Login = props => {


    const [URI, setURI] = useState('')

    const Changer = e => {
        setURI( e.target.value);
    }

    const Submitter = e => {
        e.preventDefault();
        loadURI();
        localStorage.setItem("token",URI);
    }

    const loadURI = async () => {
        if(URI){
            const body = JSON.stringify({URI});
            const config = {
                headers:{
                    'Content-Type': 'application/json'
                }
            }

            await axios.post('/login', body, config);
            setURI('')    
        }
    }

    return (
        <div className="bg">
            <div className="container">
                <h1 className="title">MongoDB Compress and Upload</h1>
                <form onSubmit={e => Submitter(e)}>
                    <label className="custom-file-label">Enter MongoDB URI</label>
                    <div className="form-group">
                        <input type="text" style={{display:'block', width:'100%'}} value={URI} onChange ={e =>Changer(e)}/>
                    </div>
                    <input type="submit" value="Connect to MongoDB" className="btn btn-success"/>
                </form>
                <Link to="/mongo">
                    <button type="button" className="btn btn-gold">
                        Next
                    </button>
                </Link>
            </div>
        </div>
    )
}


export default Login
