import React, {useContext, useEffect, useState} from "react";
import Sidebar from '../../Components/Sidebar'
import Profile from "../../Components/Profile";
import Title from '../../Components/Title'
import {motion} from 'framer-motion'
import { Done, Close } from "@mui/icons-material";
import { SocketContext, UserContext } from "../../Helper/UserContext";
import animationData from '../../Lotties/FriendsLoading.json'
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

const Friends = () => {
    const [bar, setBar] = useState(false);
    const [option, setOption] = useState("Friends");
    const [sub, setSub] = useState(false);
    
    const [friendsLoad, setFriendsLoad] = useState(true);
    
    const {client, connected} = useContext(SocketContext);
    const {user} = useContext(UserContext);
    const [userLookup, setUserLookup] = useState({});

    const [people, setPeople] = useState({
        Friends: [], 
        Suggestions: [], 
        Requests: []
    })

    const fetchData = (body) => {
        const data = JSON.parse(body);
        
        data.users.forEach(element => {
            setUserLookup((prev) => ({
                ...prev, 
                [element.userId]: element
            }))
        });
        
        setPeople({
            Friends: data.friends, 
            Suggestions: data.suggestions, 
            Requests: data.requests
        })

        setFriendsLoad(false);
    }

    const handleRequest = (item, type) => {
        if(client && connected){
            const body = {
                type: type, 
                senderId: user._id, 
                receiverId: item
            }
            client.send(`/app/friendRequest/${user._id}`, {}, JSON.stringify(body))
        }
    }
    
    const handleBar = (state) => {setBar(state);}
    const getUser = (userId) => {
        return userLookup[userId] || {userName: "not found" };
    }

    useEffect(() => {
        let subscription; 
        if(client && connected){
            const timer = setTimeout(() => {
                subscription = client.subscribe(`/friends/${user._id}`, (msg) => {
                    const response = JSON.parse(msg.body);
                    
                    if(response.messageType == "userFriends") fetchData(response.body)
                })
                setSub(true)
            }, 1000)

            return () => {
                clearTimeout(timer);
                if(subscription)
                    {subscription.unsubscribe();
                    setSub(false);}
            }
        }
    }, [client, connected])   
    
    useEffect(() => {
        if(sub){
            client.send(`/app/getFriends/${user._id}`, {}, "")
        }
    }, [sub])

    const handleOption = (e) => {
        setOption(e.currentTarget.getAttribute("data-value"));
    }

    return(
        <div className="page-container">
             <Sidebar option = "Friends" handleBar={handleBar}/>
             <Profile/> <Title title="Friends" bar={bar}/>
             <div className={bar? "friends-container-closed": "friends-container"}>
               <div className="friends-list-container">
                    <div className="friends-options-bar">
                        <div className="fob-option" data-value = "Friends"
                         onClick={handleOption} style={option=="Friends"? {backgroundColor: "white"}: {}} id="end"> Friends</div>
                        <div className="fob-option" data-value = "Suggestions"
                         onClick={handleOption} style={option=="Suggestions"? {backgroundColor: "white"}: {}}> Suggestions</div>
                        <div className="fob-option" data-value = "Requests" 
                        onClick={handleOption} style={option=="Requests"? {backgroundColor: "white"}: {}} id="end">  Requests</div>
                    </div>
                    <div className="friends-list">
                            {friendsLoad ? 
                                <div className="friends-list-container">
                                <Lottie options={defaultOptions} height={300} width={300} /> </div>
                            : people[option].map(person => (
                                 <div className="friends-list-element">
                                    <div className="fle-image">
                                        <img src={option == "Suggestions"? getUser(person.userId).userPhoto : getUser(person).userPhoto} style={{height: "100%", width: "100%", backgroundColor: "black"}}/>
                                    </div>
                                    <div className="fle-name"> {option == "Suggestions"? getUser(person.userId).userName : getUser(person).userName}</div>
                                    <div className="fle-options" id={option=="Suggestions"?"one": option=="Requests"? "two": "three"}>
                                        {
                                            option=="Suggestions"?
                                                person.sent?
                                                <div style={{
                                                    fontSize: "medium", 
                                                    cursor: "default", 
                                                    color: "#959595"
                                                }}> sent</div>
                                                :<motion.button
                                                style={{
                                                    background: "none", 
                                                    border: "2px solid #1cc29f", 
                                                    borderRadius: "5px", 
                                                    height: "70%", 
                                                    fontSize: "medium",
                                                    width: "75%", 
                                                    color: "#1cc29f", 
                                                    cursor: "pointer"
                                                }}
                                                whileHover={{scale: 1.1}}
                                                whileTap={{scale: 0.9}}
                                                onClick={() => 
                                                {handleRequest(person.userId, "sendRequest")}}
                                                >
                                                    Add
                                                </motion.button>
                                            :
                                            option == "Requests"?
                                                <div style={{display: "flex", paddingLeft: "5%", columnGap: "10%", justifyContent: "center", alignItems: "center", paddingTop: "10%"}}>
                                                <motion.button
                                                style={{
                                                    background: "none", 
                                                    border: "2px solid #1cc29f", 
                                                    borderRadius: "5px", 
                                                    height: "70%", 
                                                    width: "40%", 
                                                    color: "#1cc29f", 
                                                    cursor: "pointer",
                                                    display: "flex", 
                                                    justifyContent: "center",
                                                    alignItems: "center",
                                                }}
                                                whileHover={{scale: 1.1}}
                                                whileTap={{scale: 0.9}}
                                                onClick={() => {handleRequest(person, "acceptRequest")}}
                                                >
                                                    <Done/>
                                                </motion.button>
                                                <motion.button
                                                style={{
                                                    background: "none", 
                                                    border: "2px solid #ff652f", 
                                                    borderRadius: "5px", 
                                                    height: "70%", 
                                                    width: "40%", 
                                                    display: "flex", 
                                                    justifyContent: "center",
                                                    alignItems: "center",
                                                    color: "#ff652f", 
                                                    cursor: "pointer"
                                                }}
                                                whileHover={{scale: 1.1}}
                                                whileTap={{scale: 0.9}}
                                                onClick={() => {handleRequest(person, "rejectRequest")}}
                                                >
                                                    <Close/>
                                                </motion.button>
                                                </div>
                                            :
                                            null
                                        }
                                    </div>
                                </div>
                            ))}
                    </div>
                </div>
                <div className="friends-details-container">

                </div>
             </div>
        </div>
    )
}

export default Friends; 