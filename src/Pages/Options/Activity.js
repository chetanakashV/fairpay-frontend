import React, {useContext, useEffect, useState} from "react";
import Sidebar from '../../Components/Sidebar'
import Profile from "../../Components/Profile";
import Title from '../../Components/Title';
import { SocketContext, UserContext } from "../../Helper/UserContext";
import animationData from '../../Lotties/ActivityLoading.json'
import Lottie from "react-lottie";
import './styles.css'

const defaultOptions = {
    loop: true,
    autoplay: true,
    animationData: animationData,
    rendererSettings: {
        preserveAspectRatio: "xMidYMid slice"
    }
};

const Activity = () => {
    const [bar, setBar] = useState(false); 
    const [sub, setSub] = useState(false);
    const [activities, setActivities] = useState([]);
    const [load, setLoad] = useState(true);

    const {client, connected} = useContext(SocketContext);
    const {user} = useContext(UserContext);
    const handleBar = (state) => {setBar(state);}

    const fetchActivities = (body) => {
        const data = JSON.parse(body);
        console.table(data.content);

        setActivities(data.content);
        setLoad(false);
    }

    const formatDate = (dateString) => {
        const date = new Date(dateString);
        const options = { year: 'numeric', month: 'long', day: 'numeric' };
        return date.toLocaleDateString('en-US', options);
      };

    useEffect(() => {
        var subscription; 
        if(connected && client){
            const timer = setTimeout(() => {

                subscription = client.subscribe(`/activity/${user._id}`, (msg) => {
                    const response = JSON.parse(msg.body);

                    if(response.messageType === "getActivities") fetchActivities(response.body);
                    else console.log(response);
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
                  {load?
                  <div className="recent-activity-container" style={{display: "flex", justifyContent: "center", alignItems: "start", paddingTop: "10%"}}>
                  <Lottie options={defaultOptions} isClickToPauseDisabled={true} height={300} width={300} />
                  </div>:
                   <div className="recent-activity-container">
                      {activities.map(dataEl => {
                        return(
                            <div className="activity-element" >
                                <div id="name" >{dataEl.name} </div>
                                <div id="date"> {formatDate(dataEl.date)} </div>
                            </div>
                        )
                      })}
                   </div>}
                </div>
             </div>
        </div>
    )
}

export default Activity; 