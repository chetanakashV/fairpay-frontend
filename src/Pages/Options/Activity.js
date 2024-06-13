import React, {useContext, useEffect, useState} from "react";
import Sidebar from '../../Components/Sidebar'
import Profile from "../../Components/Profile";
import Title from '../../Components/Title';
import './styles.css'
import { SocketContext, UserContext } from "../../Helper/UserContext";

const Activity = () => {
    const [bar, setBar] = useState(false); 
    const [sub, setSub] = useState(false);
    const [activities, setActivities] = useState([]);
    const handleBar = (state) => {setBar(state);}
    const {client, connected} = useContext(SocketContext);
    const {user} = useContext(UserContext)

    useEffect(() => {
        var subscription; 
        if(connected && client){
            const timer = setTimeout(() => {

                subscription = client.subscribe(`/activity/${user._id}`, (msg) => {
                    console.log(msg.body);
                })
                setSub(true);
                console.log("subscribed")
            }, 1000)
            
            return() => {
                clearTimeout(timer);
                if(subscription){
                    subscription.unsubscribe(); 
                    setSub(false);
                }
            };
        }

    }, [client, connected])

    useEffect(() => {
        if(sub){
            client.send(`/app/getActivities/${user._id}`, {}, "")
        }
    }, [sub])

    return(
        <div className="page-container">
             <Sidebar option = "Activity" handleBar={handleBar}/>
             <Profile/> <Title title="Activity" bar={bar}/>
             <div className={bar?"activity-container-closed" :"activity-container"}>
                <div className="activity-main-container">
                   <div className="recent-activity-container"></div>
                   <div className="recent-activity-container"></div>
                   <div className="recent-activity-container"></div>
                </div>
             </div>
        </div>
    )
}

export default Activity; 