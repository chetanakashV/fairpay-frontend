import {useState, useContext, useEffect} from 'react'
import Sidebar from '../../Components/Sidebar'
import Profile from '../../Components/Profile';
import PublishIcon from '@mui/icons-material/Publish';
import { UserContext } from '../../Helper/UserContext';
import {motion} from 'framer-motion'
import Title from '../../Components/Title'
import './styles.css'

const Account = () => {
    const [bar, setBar] = useState(false);
    var {user, loading} = useContext(UserContext);
    const handleBar = (state) => {setBar(state);}

    if(loading)
    return(
    <>
        Loading
    </>
    )
    else 
    return(
        <div className='page-container'>
            <Sidebar option="Account" handleBar={handleBar}/>
            <Profile/> <Title title="Account" bar = {bar}/>
            <div className={bar?"settings-container-closed":"settings-container"}>
                 
                 <div className="profile-settings">
                    <div className='display-picture'>
                    <img src = {user.imageUrl} className='account-image'/>
                    <motion.button className='button-2'
                        initial={{scale: 1}}
                        whileHover={{scale:1.05}}
                        whileTap={{scale:0.95}}
                    > 
                        Upload new picture  
                    </motion.button>
                    <motion.button className='button-2' id='dlt' 
                        initial={{scale: 1}}
                        whileHover={{scale:1.05}}
                        whileTap={{scale:0.95}}
                    > 
                        delete picture  
                    </motion.button> 
                    </div>
                    <form className='second-container'>
                    <div className='third-container'>
                    <div className='user-details'>
                        <label className='label-1'>User Name</label> <br/>
                        <input type="text" className='input-1'
                        placeholder = {user.userName} id='username'/> <br/>
                        <label className='label-1'>Email</label> <br/>
                        <input type="text" className='input-1'
                        placeholder={user.userEmail}
                        /> <br/>
                    </div>
                    <div className='user-details'>
                        <label className='label-1'>Mobile Number</label> <br/>
                        <input type="number" minLength={10} maxLength={10} className='input-1' id='username'
                        placeholder = {user.userMobile} 
                        /> <br/>
                        <label className='label-1'>New Password</label> <br/>
                        <input type="password"  className='input-1'
                        /> <br/>
                    </div>
                    </div>
                    <div className='fourth-container'>
                        <motion.button className='button-3' id='reset'>
                            RESET
                        </motion.button>
                        <motion.button className='button-3' id='save' type='submit'>
                            SAVE
                        </motion.button>
                    </div>
                    </form>
                 </div>
             </div>
        </div>
    )
}


export default Account; 