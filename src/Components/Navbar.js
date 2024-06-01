import React from 'react'
import './styles.css'
import appLogo from '../Assets/Images/logo1.png'
import { useNavigate } from 'react-router-dom'
import { motion } from "framer-motion";



const Navbar = (props) => {
    const navigate = useNavigate(); 

    const handleSignUp = () => {
        navigate('/signup')
    }

    const handleLogo = () => {
        navigate("/")
    }

    const handleSignIn = () => {
        navigate("/login")
    }

    return(
        <div className='navbar-container'>
            <img src = {appLogo}  width="65%"  className='appLogo'  alt = 'applogo' onClick={handleLogo}/>
            <div className='button-container'>
                <motion.button 
                    className='button1'
                    initial = {props.isSelected == "Register"? { scale: 1.1,
                    backgroundColor: 'white' }: {scale: 1}}
                    whileHover={{scale: 1.2}}
                    whileTap={{scale: 0.9}}
                    onClick={handleSignUp}
                >
                    Sign Up
                </motion.button>

                <motion.button 
                    className='button1'
                    initial = {props.isSelected == "Login"? { scale: 1.1, 
                    backgroundColor: "white" }: {scale: 1}}
                    whileHover={{scale: 1.2}}
                    whileTap={{scale: 0.9}}
                    onClick={handleSignIn}
                >
                     Log In
                </motion.button>
            </div>       
        </div>
    )
}

export default Navbar; 