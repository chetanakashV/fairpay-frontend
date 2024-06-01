import React, {useState} from "react";
import Sidebar from '../../Components/Sidebar'
import Profile from "../../Components/Profile";
import Title from '../../Components/Title';
import './styles.css'

const Activity = () => {
    const [bar, setBar] = useState(false);
    const handleBar = (state) => {setBar(state);}

    return(
        <div className="page-container">
             <Sidebar option = "Activity" handleBar={handleBar}/>
             <Profile/> <Title title="Activity" bar={bar}/>
        </div>
    )
}

export default Activity; 