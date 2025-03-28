import React, {useContext, useState} from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import Navbar from "../Components/Navbar";
import Lottie from "react-lottie";
import Axios from 'axios';
import animationData from '../Lotties/Animation - 1715485093970.json'
import './styles.css'
import { ToastContainer, toast} from "react-toastify";
import {UserContext, LogInContext} from "../Helper/UserContext"


const Landing = () => {
    const navigate = useNavigate();
    const defaultOptions = {
        loop: true,
        autoplay: true,
        animationData: animationData,
        rendererSettings: {
          preserveAspectRatio: "xMidYMid slice"
        }
      };
   
      const [hovered, setHovered] = useState(false);
      const [hovered2, setHovered2] = useState(false);

      const {setUser} = useContext(UserContext);
      const {setLogIn} = useContext(LogInContext);

      const handleDemo = () => {
        Axios.post(`${process.env.REACT_APP_SERVER_URI}/users/loginOtp`, {
          userEmail: "chetanakash1234@gmail.com", 
          password: "demo"
        }).then(response => {
          if(response.data.response.status === 400){
              return "error";
          }
          else if(response.data.response.status === 200){ 
              setUser(response.data.user);
              setLogIn(true);
              sessionStorage.setItem("logIn", true);
          }
          return "done";
        }).then(response => {
          if(response === "done") navigate('/dashboard')
        })
      }
      
    return(
        <div className="auth-container">
            <Navbar isSelected = "Landing"/> 
            <div className="landing-container">
            <ToastContainer/>
            <div className="landing-text">
              <div id="main-text">
                Less Stress when sharing expenses
              </div>
              <div id="desc-text">
              Keep track of your shared expenses and balances with housemates, trips, groups, friends, and family.
              </div>
              <div className="landing-button-container">
              <motion.button
              onMouseEnter={() => {setHovered(true);}}
              onMouseLeave={() => {setHovered(false);}}
              style={
                hovered?
                {
                backgroundColor: "#1cc29f", 
                border: "none", 
                color: "white", 
                minHeight: "75%", 
                minWidth: "40%", 
                borderRadius: "5px",
                fontSize: "large", 
                // boxShadow: "0 2px 0 0 rgb(55, 59, 63, 0.5)", 
                cursor: "pointer", 
                translateY: "2px", 
                fontSize: "large", 
                fontWeight: "500"
              }: 
              {
                backgroundColor: "#1cc29f", 
                border: "none", 
                color: "white", 
                minHeight: "75%", 
                minWidth: "40%", 
                borderRadius: "5px",
                fontSize: "large", 
                boxShadow: "0 2px 0 0 rgb(55, 59, 63, 0.5)", 
                cursor: "pointer",
                fontWeight: "500"
              }}
              onClick={() => {navigate('/signup')}}
              >
                Sign Up
              </motion.button>
              <motion.button
              onMouseEnter={() => {setHovered2(true);}}
              onMouseLeave={() => {setHovered2(false);}}
              style={
                hovered2?
                {
                backgroundColor: "#1cc29f", 
                border: "none", 
                color: "white", 
                minHeight: "75%", 
                minWidth: "40%", 
                borderRadius: "5px",
                fontSize: "large", 
                // boxShadow: "0 2px 0 0 rgb(55, 59, 63, 0.5)", 
                cursor: "pointer", 
                translateY: "2px", 
                fontSize: "large", 
                fontWeight: "500"
              }: 
              {
                backgroundColor: "#1cc29f", 
                border: "none", 
                color: "white", 
                minHeight: "75%", 
                minWidth: "40%", 
                borderRadius: "5px",
                fontSize: "large", 
                boxShadow: "0 2px 0 0 rgb(55, 59, 63, 0.5)", 
                cursor: "pointer",
                fontWeight: "500"
              }}
              onClick={handleDemo}
              >
                Demo Login
              </motion.button>
              </div>
              <span style={{paddingLeft: "3%", cursor: "pointer", fontSize: "smaller"}} onClick={() => {navigate('/about')}}> <u>Wanna Know More About Me?</u></span>
            </div>
            <div className="landing-lottie">
               <Lottie
                  options={defaultOptions}
                  height={500}
                  width={500}
                  isClickToPauseDisabled={true}
                />
            </div>
            </div>
           
        </div>
       
    )
}

export default Landing; 