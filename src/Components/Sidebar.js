import React, {useContext, useState} from 'react'
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Dashboard, Groups, Person, Timeline, Settings, Diversity3, Logout, Speed } from '@mui/icons-material';
import {ReactComponent as LogoSVG} from '../Assets/Svg/logo.svg'
import {ReactComponent as Logo2SVG} from '../Assets/Svg/logo2.svg'
import { SocketContext } from '../Helper/UserContext';
import './styles.css'


const Sidebar = (props) => {
    
    const [collapse, setCollapse] = useState(true); 
    const [option, setOption] = useState(props.option); 
    const {logIn, setLogIn, loading} = useContext(SocketContext);

    const navigate = useNavigate(); 

   const handleNavigate = (link) => {
        navigate(`/${link}`)
   }

   const handleOpen = () => {
        setCollapse(false)
        props.handleBar(true)
   }

    const handleClose = () => {
        setCollapse(true)
        props.handleBar(false)
    }

    const handleOpenOption = (item) => {
        setOption(item)
    }

    const handleCloseOption = () => {
        setOption(props.option)
    }

    const handleLogout = async() => {
        sessionStorage.setItem("logIn", false)
        navigate('/login')
    }

    return(
       <motion.div className={collapse?'sidebar-closed':'sidebar'}
        onMouseEnter={handleOpen} onMouseLeave={handleClose}>
            <div  className='sidebar-logo' onClick={() => handleNavigate("dashboard")}>
               <div className='sidebar-icon' id='logo'> 
               {collapse?<Logo2SVG />: <LogoSVG/>}
               </div> 
               <div  id='logo'> Fair Pay </div> 
            </div>
            <div className='sidebar-container-1'>
            <div className={option==="Dashboard"? 'sidebar-hovered': 'sidebar-option'}
            onMouseEnter={() => handleOpenOption("Dashboard")} onMouseLeave={handleCloseOption}
            onClick={() => handleNavigate("dashboard")}>
               <div className='sidebar-icon'> <Dashboard/>  </div> 
               <div className= {collapse?'hide-text':'sidebar-text'}> Dashboard </div> 
            </div>
            <div className={option==="Groups"? 'sidebar-hovered': 'sidebar-option'}
            onMouseEnter={() => handleOpenOption("Groups")} onMouseLeave={handleCloseOption}
             onClick={() => handleNavigate("groups")}>
                <div className='sidebar-icon'><Groups /></div>
                <div className= {collapse?'hide-text':'sidebar-text'}> Groups </div>
            </div>
            <div className={option==="Friends"? 'sidebar-hovered': 'sidebar-option'}
            onMouseEnter={() => handleOpenOption("Friends")} onMouseLeave={handleCloseOption}
             onClick={() => handleNavigate("friends")}>
                <div className='sidebar-icon'><Diversity3/></div>
                <div className= {collapse?'hide-text':'sidebar-text'}> Friends </div>
            </div>
            <div className={option==="Activity"? 'sidebar-hovered': 'sidebar-option'} 
            onMouseEnter={() => handleOpenOption("Activity")} onMouseLeave={handleCloseOption}
            onClick={() => handleNavigate("activity")}>
               <div className='sidebar-icon'><Timeline/></div>
               <div className= {collapse?'hide-text':'sidebar-text'}> Activity </div>
            </div>
            <div className={option==="Account"? 'sidebar-hovered': 'sidebar-option'} 
            onMouseEnter={() => handleOpenOption("Account")} onMouseLeave={handleCloseOption}
            onClick={() => handleNavigate("Account")}>
                <div className='sidebar-icon'><Person/></div>
                <div className= {collapse?'hide-text':'sidebar-text'}>Account</div>
            </div>
            <div className={option==="Settings"? 'sidebar-hovered': 'sidebar-option'} 
            onMouseEnter={() => handleOpenOption("Settings")} onMouseLeave={handleCloseOption}
            onClick={() => handleNavigate("settings")}>
                <div className='sidebar-icon'><Settings/></div>
                <div className= {collapse?'hide-text':'sidebar-text'}>Settings</div>
            </div>
            </div>
            <div className='sidebar-container-2'>
            <div className='sidebar-logout' onClick={handleLogout}
            onMouseEnter={() => handleOpenOption("Logout")} onMouseLeave={handleCloseOption}>
                <div className='sidebar-icon'><Logout/></div>
                <div className= {collapse?'hide-text':'sidebar-text'}>Logout</div>
            </div>
            </div>
       </motion.div>
    )
}

export default Sidebar; 