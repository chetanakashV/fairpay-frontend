import React, {useState} from "react";
import Sidebar from '../../Components/Sidebar'
import Profile from "../../Components/Profile";
import Title from '../../Components/Title'
import './styles.css'

const Friends = () => {
    const [bar, setBar] = useState(false);
    const handleBar = (state) => {setBar(state);}

    return(
        <div className="page-container">
             <Sidebar option = "Friends" handleBar={handleBar}/>
             <Profile/> <Title title="Friends" bar={bar}/>
        </div>
    )
}

export default Friends; 