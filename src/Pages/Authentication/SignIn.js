import {useState, useContext} from 'react'
import { useNavigate } from 'react-router-dom'
import Navbar from '../../Components/Navbar'
import ReCAPTCHA from "react-google-recaptcha";
import { motion, AnimatePresence } from "framer-motion";
import Axios from "axios";
import {toast, ToastContainer} from 'react-toastify'
import {LogInContext, UserContext, SocketContext} from '../../Helper/UserContext'
import OtpLoginPop from '../../Components/Popup/OtpLoginPop';
import './styles.css'


const SignIn = () => {
    const navigate = useNavigate(); 

    const [logInDetails, setLogInDetails] = useState({
        userMail: "", 
        userPwd: ""
    })

    const showToast = (status, message) =>{
        if(status === "success") toast.success(message);
        else toast.error(message);
    }
 
    const [showPop, setShowPop] = useState(false);
    const [captcha, setCaptcha] = useState(false); 
    const {user, setUser} = useContext(UserContext);
    const {logIn, setLogIn} = useContext(LogInContext);
    const {connect} = useContext(SocketContext)

    const handleCaptcha = () => { setCaptcha(true); }

    const handleShowPop = () => {
        if(!captcha){toast.error("Captcha Unverified!!");}
        else if(/^([a-zA-Z0-9._%-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,})$/.test(logInDetails.userMail)){
            setShowPop(true);
            Axios.post(`${process.env.REACT_APP_SERVER_URI}/email/generateOTP`, {
                email: logInDetails.userMail,
                type: "numeric",
                organization: "FairPay"
            }).then((response) => {
                if(response.data.status === 400) toast.error(response.data.message)
                else if(response.data.status === 200) toast.success(response.data.message)
            })
        }
        else {
            toast.error("Please Enter a Valid Email!");
        }
    }

    const handleClose = () => {
        setShowPop(false);
    }

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
            if(response.data.response.status === 400){
                 toast.error(response.data.response.message);
                return "error";}
                else if(response.data.response.status === 200){ 
                    toast.success("You're successfully logged In")
                    setLogIn(true);
                    setUser(response.data.user);
                    sessionStorage.setItem("logIn", true)
            }
            return "done";
        }).then(response => {
            if(response === "done") navigate('/dashboard')
        })
        
    }

    return(
        <div className='auth-container'>
            <Navbar isSelected = "Login"/>
            <ToastContainer/>

            <AnimatePresence
                initial={false}
                mode="wait"
                onExitComplete={() => null}
            >
                {showPop && <OtpLoginPop handleClose={handleClose} showToast={showToast} mail = {logInDetails.userMail} />}
            </AnimatePresence>

            <div  className='signin-main-container'>
                <form className='signin-container' onSubmit={handleSubmit}>
                  <div className='signin-heading'> Log In</div>
                     <div className='signin-details'>
                        <div className='signin-element'>
                            <label >Email address</label>
                            <input type='email' className='signin-input' required
                             name='userMail' onChange={handleChange}/>
                        </div>
                        <div className='signin-element'>
                            <label >Password</label>
                            <input type='password' className='signin-input' required
                             name='userPwd' onChange={handleChange}/>
                        </div>
                  <ReCAPTCHA
                    sitekey={process.env.REACT_APP_SITE_KEY}
                    onChange={handleCaptcha}
                    className="login-recaptcha"
                   />
                  </div>
                  <motion.button className='signin-button'> Log in</motion.button>
                  
                  <div className='signin-fyp'><span style={{cursor:"pointer"}} 
                  onClick={handleShowPop} >
                  Sign In With OTP
                  </span></div>

                </form>
            </div>
        </div>
    )
}

export default SignIn; 