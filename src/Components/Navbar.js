import React from 'react'
import './styles.css'
import appLogo from '../Assets/Images/logo1.png'
import { useNavigate } from 'react-router-dom'
import { motion } from "framer-motion";



const Navbar = (props) => {
    const navigate = useNavigate(); 

    const handleNavigate = (e) => {
        navigate(`/${e.target.name}`)
    }

    return(
        <div className='navbar-container'>
            <img src = {appLogo}  width="65%"  className='appLogo' name=''  alt = 'applogo' onClick={handleNavigate}/>
            <div className='button-container'>
                {/* <motion.button 
                    className='button1'
                    name='about'
                    initial = {props.isSelected == "About"? { scale: 1.1,
                    backgroundColor: 'white' }: {scale: 1}}
                    whileHover={{scale: 1.2}}
                    whileTap={{scale: 0.9}}
                    onClick={handleNavigate}
                >
                    About
                </motion.button> */}

                <motion.button 
                    className='button1'
                    name='signup'
                    initial = {props.isSelected == "Register"? { scale: 1.1,
                    backgroundColor: 'white' }: {scale: 1}}
                    whileHover={{scale: 1.2}}
                    whileTap={{scale: 0.9}}
                    onClick={handleNavigate}
                >
                    Sign Up
                </motion.button>

                <motion.button 
                    className='button1'
                    name='login'
                    initial = {props.isSelected == "Login"? { scale: 1.1, 
                    backgroundColor: "white" }: {scale: 1}}
                    whileHover={{scale: 1.2}}
                    whileTap={{scale: 0.9}}
                    onClick={handleNavigate}
                >
                     Log In
                </motion.button>
            </div>       
        </div>
    )
}

export default Navbar; 