import {useState, useEffect} from 'react'
import Axios from 'axios'
import { useNavigate } from 'react-router-dom';
import ReCAPTCHA from 'react-google-recaptcha';
import logo from '../../Assets/Images/logo1.png'
import Navbar from '../../Components/Navbar';
import { AnimatePresence, motion } from 'framer-motion';
import {toast, ToastContainer} from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import Pop from "../../Components/Popup/Pop";
import './styles.css'

const SignUp = () => {
    const navigate = useNavigate(); 

    const [userDetails, setUserDetails] = useState({
        userName: "", 
        userEmail: "", 
        userPwd: ""
    });
    const [toggle, setToggle] = useState(false);

    const [captcha, setCaptcha] = useState(false);
    const [showPop, setShowPop] = useState(false)
    const [otpVerified, setOtpVerified] = useState(false);

    const showPopUp = () => {setShowPop(true);}
    const hidePopUp = () => {setShowPop(false); setOtpVerified(false);}
    const handleCaptcha = () => {setCaptcha(true);}

    const handleChange = (e) => {
        if(e.target.name == "userName") setToggle(true)

        setUserDetails((prev) => ({
            ...prev, 
            [e.target.name]: e.target.value
        }))

    }

    useEffect(() => {
        if(!otpVerified) return; 
        hidePopUp();
        Axios.post(`${process.env.REACT_APP_SERVER_URI}/users/register`, {
            userName: userDetails.userName, 
            userEmail: userDetails.userEmail, 
            userMobile: 0, 
            password: userDetails.userPwd
        }).then(response => {
            console.log(response)
            if(response.data.status == 400) toast.error(response.data.message)
            else toast.success(response.data.message)
            setOtpVerified(false)
        })
    }, [otpVerified])

    const handleSubmit = (e)  => {
        e.preventDefault(); 

        if(!captcha){ toast.error('Captcha Not Verified!!'); return;}

        // have to perform checks on inputs

        showPopUp(); 
        Axios.post(`${process.env.REACT_APP_SERVER_URI}/email/generateOTP`, {
            email: userDetails.userEmail,
            type: "numeric",
            organization: "FairPay"
        }).then((response) => {
            if(response.data.status == 400) toast.error(response.data.message)
            else if(response.data.status == 200) toast.success(response.data.message)
        })

    }

    return(
        <div className='auth-container'>
        <Navbar isSelected = "Register"/>
            <ToastContainer isSelected="Register"/>
            <AnimatePresence
              initial={false}
              mode="wait"
              onExitComplete={() => null}
            >

            {showPop && <Pop handleClose={hidePopUp} type="otp" mail = {userDetails.userEmail}  setOtpVerified={setOtpVerified}/>}
            </AnimatePresence>

            <div className='signup-main-container'>
                 <div className='signup-container'>
                       <div className='signup-image-container'>
                            <img src={logo} width="130%" />
                       </div>
                       <form className='signup-details-container' onSubmit={handleSubmit}>
                            <div className='signup-iy'> INTRODUCE YOURSELF</div>
                            <div className='signup-element'>
                            <label> Hi there! My name is</label>
                            <input type='text' name='userName' className='inp' onChange={handleChange}/>
                            </div>
                            <AnimatePresence>
                            {toggle && <motion.div>
                              <div className='signup-element'>
                                <label> Here's my email address:</label>
                                <input type='text' name='userEmail' className='inp' onChange={handleChange}/>
                              </div>
                              <div className='signup-element'>
                                <label> and here's my password:</label>
                                <input type='text' name='userPwd' className='inp' onChange={handleChange}/>
                              </div>
                              <ReCAPTCHA
                                sitekey={process.env.REACT_APP_SITE_KEY}
                                onChange={handleCaptcha}
                                className="recaptcha"
                                />
                            </motion.div>}
                            </AnimatePresence>
                                <motion.button className='signup-button' type='submit'
                                 initial = {{scale: 1}}
                                 whileHover={{scale: 1.1}}
                                 whileTap={{scale: 0.9}}
                                 >
                                    Sign me up!
                                </motion.button>
                       </form>
                 </div>
            </div>
        </div>
    )
}

export default SignUp; 