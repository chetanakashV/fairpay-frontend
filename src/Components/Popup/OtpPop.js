import React, {useState} from "react";
import OTPInput from "react-otp-input";
import { motion } from "framer-motion";
import { IoMdClose } from "react-icons/io";
import Axios from "axios";

import './styles.css'

const OtpPop = ({handleClose, mail, setOtpVerified }) => {
    const [otp, setOtp] = useState(""); 

    const verifyOTP = () => {
        Axios.post(`${process.env.REACT_APP_SERVER_URI}/email/verifyOTP`, {
            email: mail, 
            otp: otp
        }).then(response => {
            if(response.data.status == 200) {setOtpVerified(true);  }
            else {alert("no")}
        })
    }

    const resendOtp = () => {
        Axios.post(`${process.env.REACT_APP_SERVER_URI}/email/resendOTP`, {
            email: mail, 
            otp: 6969
        })
    }

    return(
        <div className="otp-container">
            <div style={{width: "100%", height: "10%", display: "flex", justifyContent: "end", alignItems: "center"}}>
            <IoMdClose  onClick={handleClose} style={{cursor: "pointer"}}/>
            </div>
            <div style={{width: "100%", display: "flex", fontWeight: "500", height: "10%"}}>Email Verification</div> 
            <div style={{fontSize: "large", marginTop: "3%", marginBottom: "3%"}}> Otp is successfully sent to your email !!  Enter it below to verify</div>
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
    )
}

export default OtpPop; 