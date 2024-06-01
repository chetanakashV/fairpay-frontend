import React from "react";

import Navbar from "../Components/Navbar";
import Lottie from "react-lottie";
import animationData from '../Lotties/Animation - 1715485093970.json'
import './styles.css'


const Landing = () => {
    const defaultOptions = {
        loop: true,
        autoplay: true,
        animationData: animationData,
        rendererSettings: {
          preserveAspectRatio: "xMidYMid slice"
        }
      };
   
      
    return(
        <div className="auth-container">
            <Navbar isSelected = "Landing"/> 
            <div className="landing-container">
               <Lottie
                  options={defaultOptions}
                  height={600}
                  width={600}
                />
            </div>
           
        </div>
       
    )
}

export default Landing; 