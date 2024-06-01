import React, {useEffect, useState} from "react";

import Navbar from "../Components/Navbar";
import Lottie from "react-lottie";
import animationData from '../Lotties/Animation - 1715485093970.json'
import { MotionConfig } from "framer-motion";


const Landing = () => {
    const [index, setIndex] = useState(0);
    const defaultOptions = {
        loop: true,
        autoplay: true,
        animationData: animationData,
        rendererSettings: {
          preserveAspectRatio: "xMidYMid slice"
        }
      };
   
      
    return(
        <div className="setbg">
            <Navbar isSelected = "Landing"/> 
            <div style = {{margin: "50px 0 0 0"}}>
            <motion></motion>
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