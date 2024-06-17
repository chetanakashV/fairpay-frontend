import React, {useContext, useState} from "react";
import OTPInput from "react-otp-input";
import { motion } from "framer-motion";
import { IoMdClose } from "react-icons/io";
import Backdrop from "../Backdrop";
import { useNavigate } from "react-router-dom";
import Axios from "axios";

import './styles.css'
import { LogInContext, UserContext } from "../../Helper/UserContext";

 const dropIn = { 
        hidden: {
            y: "-100vh",
            opacity: 0
        }, 
        visible: {
            y: 0,
            opacity: 1, 
            transition: {
                duration: 0.1, 
                type: "spring", 
                damping: 100, 
                stiffness: 500
            }
        },
        exit: {
            y: "100vh",
            opacity: 0
        }
    }

const OtpLoginPop = ({handleClose, mail, setOtpVerified, showToast}) => {
    const [otp, setOtp] = useState(""); 
    const navigate = useNavigate();
    const isNumeric = (string) => /^[+-]?\d+(\.\d+)?$/.test(string)
    const {setUser} = useContext(UserContext);
    const {setLogIn} = useContext(LogInContext)

    const verifyOTP = () => {
        console.log(otp);
        if(otp == "" || otp.length < 6 || !isNumeric(otp)) {showToast("error", "Invalid OTP!"); return; }

        Axios.post(`${process.env.REACT_APP_SERVER_URI}/email/verifyOTP`, {
            email: mail, 
            otp: otp
        }).then(response => {
            if(response.data.status == 200) {
                Axios.post(`${process.env.REACT_APP_SERVER_URI}/users/loginOtp`, {
                    userEmail: mail, 
                    password: "temp"
                }).then(response => {
                    if(response.data.response.status == 400){
                        showToast("error",response.data.response.message);
                        return "error";
                    }
                    else if(response.data.response.status == 200){ 
                        showToast("success","You're successfully logged In")
                        setUser(response.data.user);
                        setLogIn(true);
                        sessionStorage.setItem("logIn", true);
                    }
                    return "done";
                }).then(response => {
                    if(response == "done") navigate('/dashboard')
                })
            }
            else {showToast("error", "Incorrect OTP!")}
        })
    }

    const resendOtp = () => {
        Axios.post(`${process.env.REACT_APP_SERVER_URI}/email/resendOTP`, {
            email: mail, 
            otp: 6969
        }).then(response =>{
            if(response.data.status == 200) {showToast("success", "OTP Resent Successfully!");}
            else { showToast("error", response.data.message);}
        })
    }

    return(
        <Backdrop onClick={handleClose} >
            <motion.div className="Pop"
                onClick={(e) => e.stopPropagation()}
                variants={dropIn}
                initial="hidden"
                animate="visible"
                exit="exit"
                drag
            >
        
        <div className="otp-container">
            <div style={{width: "100%", height: "10%", display: "flex", justifyContent: "end", alignItems: "center"}}>
            <IoMdClose  onClick={handleClose} style={{cursor: "pointer"}}/>
            </div>
            <div style={{width: "100%", display: "flex", fontWeight: "500", height: "10%"}}>
            Sign In</div> 
            <div style={{fontSize: "large", marginTop: "3%", marginBottom: "3%"}}> Enter the OTP sent to your mail to login</div>
            <OTPInput
                value={otp}
                onChange={setOtp}
                numInputs={6}
                isInputNum={true}
                renderSeparator={<span style={{ width: "5px"}}></span>}
                inputStyle={{
                  border: "1px solid #d8d8d8",
                  borderRadius: "8px",
                  width: "54px",
                  height: "54px",
                  fontSize: "large",
                  color: "#000",
                  fontWeight: "400",
                  caretColor: "blue"
                }}
                focusStyle={{
                  border: "1px solid #CFD3DB",
                  outline: "none"
                }}
                renderInput={(props) => <input {...props} />}
            />
            <div style={{width: "100%", style: "10%",  marginTop: "2%", fontSize: "medium",  paddingLeft: "2%"}} onClick={resendOtp}>
            <u style={{cursor: "pointer"}}>Resend OTP?</u></div>
            <motion.button
            whileHover={{scale: 1.1}}
            whileTap={{scale: 0.9}}
            onClick={verifyOTP}
            style={{
                background: "none", 
                border: "1px solid #1cc29f", 
                color: "#1cc29f", 
                height: "15%",
                marginTop: "5%", 
                width: "25%", 
                fontSize: "large", 
                cursor: "pointer", 
                borderRadius: "10px"
            }}
            > Verify </motion.button>
        </div>
            </motion.div>
        </Backdrop>
    )
}

export default OtpLoginPop; 