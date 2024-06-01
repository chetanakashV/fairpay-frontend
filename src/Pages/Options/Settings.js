import React, {useState} from "react";
import Sidebar from '../../Components/Sidebar'
import Profile from "../../Components/Profile";
import './styles.css'
import Title from "../../Components/Title";

const Settings = () => {
    const [bar, setBar] = useState(false);
    const handleBar = (state) => {setBar(state);}

    return(
        <div className="page-container">
             <Sidebar option = "Settings" handleBar={handleBar}/>
             <Profile/> <Title title="Settings" bar = {bar}/>
             <div className={bar?"settings-container-closed":"settings-container"}>
                 
                 <div className="notification-settings">
                    <div className="section-title"> Notifications</div>
                 </div>
             </div>
        </div>
    )
}

export default Settings; 