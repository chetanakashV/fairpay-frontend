import React, {useContext, useState, useEffect} from 'react'
import { useNavigate } from 'react-router-dom';
import {UserContext, LogInContext} from '../Helper/UserContext'
import animationData from '../Lotties/ProfileLoading.json'
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown';
import KeyboardArrowUpIcon from '@mui/icons-material/KeyboardArrowUp';
import {support} from '../Assets/Templates'
import './styles.css'

const Profile = () => {
    var {user, setUser} = useContext(UserContext); 
    const navigate = useNavigate();
    // const {logIn, setLogIn} = useContext(LogInContext);
    const [loading, setLoading] = useState(true);  
    const [menu, setMenu] = useState(false); 

    const  loadUser = async () => {
        user = await JSON.parse(sessionStorage.getItem("user")); 
        setLoading(false)
        return "done"
    }

    const handleNavigate = (path) => {
        navigate(`/${path}`)
    }

    const handleSupport = () => {
        const email = process.env.REACT_APP_EMAIL;
        const subject = "Request For Support"
        const body = support; 
        const mailtoLink = `mailto:${email}`;

        window.location.href = mailtoLink;
    }

    const handleToggle = () => {setMenu(!menu)}

    useEffect(() => {
        loadUser();
    }, [])

    const defaultOptions = {
        loop: true,
        autoplay: true,
        animationData: animationData,
        rendererSettings: {
          preserveAspectRatio: "xMidYMid slice"
        }
      };
    
    const handleClicks = () => {
        if(menu) setMenu(false);
    }
    
    return(
        <div className='profile-container'>    
            <div className='profile' onClick={handleToggle}>
                <div className='profile-image'>
                     <img src ={user?.imageUrl} height = {"100%"} width={"100%"} alt="dp" />
                </div>
                <div className='profile-name' >
                     {user?.userName}
                </div>
                <div className='profile-icon' >
                 {menu? <KeyboardArrowUpIcon/>: <KeyboardArrowDownIcon/>}
                </div>
            </div>    
            {menu && <div className='profile-options'>
                <div className='profile-option' onClick={() => handleNavigate("account")}>
                 My Profile</div>
                <div className='profile-option' onClick={handleSupport}>
                 Contact Support
                 </div>
                <div className='profile-option' onClick={() => handleNavigate("login")}> Logout</div>
            </div>}
        </div>
    )
}


export default Profile; 