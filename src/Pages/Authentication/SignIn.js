import {useState, useContext} from 'react'
import { useNavigate } from 'react-router-dom'
import Navbar from '../../Components/Navbar'
import ReCAPTCHA from "react-google-recaptcha";
import { motion } from "framer-motion";
import Axios from "axios";
import {toast, ToastContainer} from 'react-toastify'
import {LogInContext, UserContext, SocketContext} from '../../Helper/UserContext'
import './styles.css'


const SignIn = () => {
    const navigate = useNavigate(); 

    const [logInDetails, setLogInDetails] = useState({
        userMail: "", 
        userPwd: ""
    })

    const [captcha, setCaptcha] = useState(false); 
    const {user, setUser} = useContext(UserContext);
    const {logIn, setLogIn} = useContext(LogInContext);
    const {connect} = useContext(SocketContext)

    const handleCaptcha = () => { setCaptcha(true); }

    const handleChange = (e) => {
        setLogInDetails((prev) =>({
            ...prev,
            [e.target.name]: e.target.value
        }))
    }

    const handleSubmit = (e) => {
        e.preventDefault(); 

        if(!captcha){ toast.error("Captcha Not Verified!"); return; }

        Axios.post(`${process.env.REACT_APP_SERVER_URI}/users/login`, {
            userEmail: logInDetails.userMail, 
            password: logInDetails.userPwd
        }).then(response => {
            if(response.data.response.status == 400){
                 toast.error(response.data.response.message);
                return "error";}
                else if(response.data.response.status == 200){ 
                    toast.success("You're successfully logged In")
                    setLogIn(true);
                    setUser(response.data.user);
                    sessionStorage.setItem("logIn", true)
            }
            return "done";
        }).then(response => {
            if(response == "done") navigate('/dashboard')
        })
        
    }


    return(
        <div className='auth-container'>
            <Navbar isSelected = "Login"/>
            <ToastContainer/>
            <div  className='signin-main-container'>
                <form className='signin-container' onSubmit={handleSubmit}>
                  <div className='signin-heading'> Log In</div>
                     <div className='signin-details'>
                        <div className='signin-element'>
                            <label >Email address</label>
                            <input type='text' className='signin-input' required
                             name='userMail' onChange={handleChange}/>
                        </div>
                        <div className='signin-element'>
                            <label >Password</label>
                            <input type='password' className='signin-input' 
                             name='userPwd' onChange={handleChange}/>
                        </div>
                  <ReCAPTCHA
                    sitekey={process.env.REACT_APP_SITE_KEY}
                    onChange={handleCaptcha}
                    className="login-recaptcha"
                   />
                  </div>
                  <motion.button className='signin-button'> Log in</motion.button>
                  
                  <div className='signin-fyp'> Forgot Your Password? </div>

                </form>
            </div>
        </div>
    )
}

export default SignIn; 