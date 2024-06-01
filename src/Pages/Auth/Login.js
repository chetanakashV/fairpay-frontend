import React, {useState, useContext} from "react";
import Navbar from "../../Components/Navbar";
import { useNavigate } from "react-router-dom";
import '../styles.css'
import ReCAPTCHA from "react-google-recaptcha";
import Axios from "axios";
import { motion } from "framer-motion";
import { ToastContainer, toast } from "react-toastify";
import { useCookies, CookiesProvider} from "react-cookie";
import {LogInContext, UserContext, SocketContext} from '../../Helper/UserContext'


const Login = () => {
    const navigate = useNavigate(); 
    const [captcha, setCaptcha] = useState(false); 
    const [mail, setMail] = useState(""); 
    const [pwd, setPwd] = useState("");

    const {logIn, setLogIn} = useContext(LogInContext); 
    const {user, setUser} = useContext(UserContext); 
    const {connect} = useContext(SocketContext);

    const handleCaptcha = () => {
        setCaptcha(true)
    }

    const handleMailChange = (e) => {
        setMail(e.target.value)
    }

    const handlePwdChange = (e) => {
        setPwd(e.target.value)
    }

    const handleSubmit = (e) => {
        e.preventDefault(); 
        if(!captcha){ toast.error("Captcha Not Verified!"); return; }
        Axios.post(`${process.env.REACT_APP_SERVER_URI}/users/login`, {
            userEmail: mail, 
            password: pwd
        }).then(response => {
            if(response.data.response.status == 400) toast.error(response.data.response.message)
                else if(response.data.response.status == 200){ 
                    toast.success("You're successfully logged In")
                    setLogIn(true);
                    setUser(response.data.user);
                    sessionStorage.setItem("logIn", true)
            }
            return "done"
        }).then(response => {
            navigate('/dashboard')
        })
    }


    return(
        <div className="setbg">
            <Navbar isSelected = "Login"/>
            <ToastContainer/>
            <form className="login-container" onSubmit={handleSubmit}>
                <span className="login-heading">Log In</span><br/><br/>
                <span className="lab2">Email address</span> <br/>
             <input type = "text" required className="log-inp" onChange={handleMailChange}/> <br/>
                <span className="lab2p">Password</span> <br/>
             <input type = "password" required className="log-inp" onChange={handlePwdChange}/> <br/>
                <ReCAPTCHA
                sitekey={process.env.REACT_APP_SITE_KEY}
                onChange={handleCaptcha}
                className="login-recaptcha"
                />
                <motion.button className="login-button" type="submit"> Log in</motion.button>
                <br/><br/>
                <span className="forgot-password"> Forgot your password?</span>
            </form>
        </div>
    )
}

export default Login; 