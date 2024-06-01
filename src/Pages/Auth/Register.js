import React, { useState, useEffect} from "react";
import Axios  from 'axios'
import { useNavigate } from "react-router-dom";
import Navbar from '../../Components/Navbar'
import ReCAPTCHA from "react-google-recaptcha";
import Logo from '../../Assets/Images/logo1.png'
import '../styles.css'
import { AnimatePresence, motion } from "framer-motion";
import CheckRegister from "../../Validations/CheckRegister";
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import Pop from "../../Components/Popup/Pop";


const Register = () => {
    const navigate = useNavigate(); 
    const handleLogo = () => {navigate("/")}
    const [toggle, setToggle] = useState(false); 

    const [name, setName] = useState("");
    const [mail,setMail] = useState("");
    const [pwd, setPwd] = useState("");
    
    const [showPop, setShowPop] = useState(false);
    const [captcha, setCaptcha] = useState(false);
    const [otpVerified, setOtpVerified] = useState(false);
  
    const showPopUp = () => {setShowPop(true)}
    const hidePopUp = () => {
        setShowPop(false); 
        if(!otpVerified) toast.error("otp not verified");
    }

    useEffect(() => {
        if(!otpVerified) return; 
        hidePopUp();
        Axios.post(`${process.env.REACT_APP_SERVER_URI}/users/register`, {
            userName: name, 
            userEmail: mail, 
            userMobile: 0, 
            password: pwd
        }).then(response => {
            console.log(response)
            if(response.data.status == 400) toast.error(response.data.message)
            else toast.success(response.data.message)
            setOtpVerified(false)
        })
    }, [otpVerified])

    const handleCaptcha = (e) => {
        setCaptcha(true)
    }

    

    const handleNameChange = (e) => {
        setToggle(true);
        setName(e.target.value)
    }

    const handleMailChange = (e) => {
        setMail(e.target.value)
    }

    const handlePasswordChange = (e) => {
        setPwd(e.target.value)
    }

    const handleSubmit = (e) => {
        e.preventDefault(); 
        if(!captcha) {toast.error("Captcha Unverified"); return; }
        const body = {name, mail, pwd}; 
        var {status, message} = CheckRegister(body); 
        if(status == "400") {
            toast.error(message); return; 
        }
        else {
            showPopUp(); 
            Axios.post(`${process.env.REACT_APP_SERVER_URI}/email/generateOTP`, {
                email: mail,
                type: "numeric",
                organization: "FairPay"
            }).then((response) => {
                if(response.data.status == 400) toast.error(response.data.message)
                else if(response.data.status == 200) toast.success(response.data.message)
            })
        }
    }

    return(
        <div className="setbg">
        <Navbar isSelected = "Register"/>
        <ToastContainer/>
        <AnimatePresence
        initial={false}
        mode="wait"
        onExitComplete={() => null}
        >
            {showPop && <Pop handleClose={hidePopUp} type="otp" mail = {mail}  setOtpVerified={setOtpVerified}/>}
        </AnimatePresence>
        <div className="container">
            <div className="logo-container" onClick={handleLogo}>
             <img src = {Logo} />
            </div>
            <form className="form-container" onSubmit={handleSubmit} >
            <span className="heading">
                <h3>INTRODUCE YOURSELF</h3>
            </span>
              <span className="lab"> Hi there! My name is </span> <br/>
              <input type="text" maxLength={8} minLength={3} required onChange={handleNameChange}/> <br/> <br/>
              <AnimatePresence>
              {toggle && <motion.div
              initial={{opacity: 0}}
              animate = {{ opacity: 1}}
              exit = {{opacity: 0}}
              >
              <span className="lab"> Here's my email address: </span> <br/>
              <input type="email" required  onChange={handleMailChange}/> <br/> <br/>
              <span className="lab"> and here's my password: </span> <br/>
              <input type="password" required  onChange={handlePasswordChange}/> <br/> <br/>
              <ReCAPTCHA
                sitekey={process.env.REACT_APP_SITE_KEY}
                onChange={handleCaptcha}
                className="recaptcha"
                required
                />
              </motion.div>} 
              </AnimatePresence>
                <br/>
            <motion.button  type="submit" className="register-button"
                initial = {{scale: 1}}
                whileHover={{scale: 1.1}}
                whileTap={{scale: 0.9}}
            >Sign me up!</motion.button>
            </form>
        </div>
        </div>
    )
}

export default Register;