import Navbar from "../Components/Navbar";
import React from "react";
import './styles.css'

const About = () => { 
    const content = `I'm Chetan Akash, Final Year Computer Science Undergrad at Bits Pilani, Hyderabad Campus. My interests lie in the fields of Machine Learning, Competitive Coding, and Web Development. 

I’m a highly motivated individual and passionate about my work. I have a steady source of motivation that drives me to do my best. I have good Problem-Solving Skills. I look Forward to Using my Skills and Knowledge to Contribute as much as possible to the Computer Science field.`;
    const linkedIn = "https://www.linkedin.com/in/chetanakash-vankadara-3a0548217";
    return(
        <div className="auth-container" >
         <Navbar isSelected = "About"/> 
         <div className="about-main-container">
            <div className="about-me">
                <div id="heading">About Me</div>
                <div id="description">
                    {content}
                </div>
                <div id="contact-me"><a href = {linkedIn} target="blank" style={{ color: "black"}}>Contact Me?</a></div>
            </div>
         </div>
        </div>
    )
}

export default About; 