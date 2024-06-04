import React, {useState, useContext} from 'react'
import { useNavigate } from 'react-router-dom'
import Sidebar from '../../Components/Sidebar'
import Profile from '../../Components/Profile'
import { LogInContext } from '../../Helper/UserContext'
import Title from '../../Components/Title'
import './styles.css'


const Dashboard = () => {
    const navigate = useNavigate();
    const [bar, setBar] = useState(false);
    const {logIn} = useContext(LogInContext);
    const handleBar = (state) => {setBar(state);}
    return(
        <div className='page-container'>
        <Sidebar option = "Dashboard" handleBar={handleBar}/> 
        <Profile/> <Title title="Dashboard" bar = {bar}/>

            <div className={bar? 'dashboard-main-container-closed':'dashboard-main-container'}>
                <div className='dashboard-summary-container'>
                    hello
                </div>
            </div>

        </div>
    )
}

export default Dashboard; 