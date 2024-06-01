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
            <IoMdClose className="icon" onClick={handleClose}/>
            <h3>Email Verification</h3>
            <p> Otp is successfully sent to your email !!  Enter it below to verify</p>
            <OTPInput
                value={otp}
                onChange={setOtp}
                numInputs={6}
                renderSeparator={<span>--</span>}
                renderInput={(props) => <input {...props} />}
            />
            <span className="resend" onClick={resendOtp}>Resend OTP?</span>
            <motion.button
            className="button2"
            whileHover={{scale: 1.1}}
            whileTap={{scale: 0.9}}
            onClick={verifyOTP}
            > Verify </motion.button>
        </div>
    )
}

export default OtpPop; 