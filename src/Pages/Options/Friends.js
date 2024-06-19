import React, {useContext, useEffect, useState} from "react";
import Sidebar from '../../Components/Sidebar'
import Profile from "../../Components/Profile";
import Title from '../../Components/Title'
import Axios from 'axios'
import {motion} from 'framer-motion'
import { ToastContainer, toast } from "react-toastify";
import { Done, Close } from "@mui/icons-material";
import { SocketContext, UserContext } from "../../Helper/UserContext";
import animationData from '../../Lotties/FriendsLoading.json'
import animationData2 from '../../Lotties/FChatsLoading.json'
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

const defaultOptions2 = {
    loop: true,
    autoplay: true,
    animationData: animationData2,
    rendererSettings: {
      preserveAspectRatio: "xMidYMid slice"
    }
  };

const Friends = () => {
    const [bar, setBar] = useState(false);
    const [option, setOption] = useState("Friends");
    const [sub, setSub] = useState(false);
    
    const [friendsLoad, setFriendsLoad] = useState(true);
    const [detailsLoad, setDetailsLoad] = useState(false);

    const [groups, setGroups] = useState([]);
    const [selectedUser, setSelectedUser] = useState({});
    const [isUserSelected, setIsUserSelected] = useState(false);

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
        let body; 
        if(type == "sendRequest")
        {   body = {
                type: type, 
                senderId: user._id, 
                receiverId: item
            }
        }
        else{
            body = {
                type: type, 
                senderId: item, 
                receiverId: user._id
            }
        }
        
        Axios.post(`${process.env.REACT_APP_SERVER_URI}/friends/handleRequest`, body)
        .then(response => {
            if(response.data.status == 400){
                toast.error("Error Processing the Request");
                console.log(response)
            }
        })
    }
    
    const handleBar = (state) => {setBar(state);}
    const getUser = (userId) => {
        return userLookup[userId] || {userName: "not found" };
    }

    const fetchGroups = (body) =>{
        const data = JSON.parse(body); 
        setGroups(data);
        setDetailsLoad(false);
    }

    const handleSelecteUser = (item) => {
        if(option !== "Friends") return;
        if(client && connected){
            setSelectedUser(item);
            setIsUserSelected(true);
            setDetailsLoad(true);
            client.send(`/app/getDetails/${user._id}`, {}, item);
        }
    }

    useEffect(() => {
        let subscription; 
        if(client && connected){
            const timer = setTimeout(() => {
                subscription = client.subscribe(`/friends/${user._id}`, (msg) => {
                    const response = JSON.parse(msg.body);
                    
                    if(response.messageType == "userFriends") fetchData(response.body)
                    else if(response.messageType == "commonGroups") fetchGroups(response.body)
                    else console.log(response);
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
             <ToastContainer/>
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
                                <Lottie options={defaultOptions} isClickToPauseDisabled={true} height={300} width={300} /> </div>
                            : people[option].map(person => (
                                 <div className="friends-list-element" onClick={() => {handleSelecteUser(person)}}>
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
                {!!isUserSelected ? detailsLoad ?
                <div className="friends-details-container" style={{display:"flex", alignItems: "center"}}>
                <Lottie options={defaultOptions2} isClickToPauseDisabled={true} height={300} width={300} />
                </div>: 
                <div className="friends-details-container">
                    <div className="fdc-head">
                        <div id="image"><img src={getUser(selectedUser).userPhoto} style={{width: "100%", height: "100%"}}/></div>
                        <div id="name">
                           <div id="title">{getUser(selectedUser).userName}</div> 
                           <div id="email">{getUser(selectedUser).userEmail}</div> 
                        </div>
                    </div>
                    <div className="fdc-body">
                    {groups && groups.map(element => {
                        return(
                            <div className="fdc-group-element"> 
                                <div id="image"><img  src={element.groupPhoto} 
                                width="100%" height="100%"/></div>
                                <div id="name">{element.groupName}</div>
                                <div id="expense">
                                    <div id="name" >
                                    {element.groupBalance>0? "You lent": "You Owe"}</div>
                                    <div id="amount" style={element.groupBalance>0?
                                    {color: "#1cc29f"}:element.groupBalance < 0 ?{color: "#ff652f"}: {}}>₹{Math.abs(element.groupBalance).toFixed(2)}</div>
                                </div>
                            </div>
                        )
                    }) }
                    </div>
                </div>: 
                <div className="friends-details-container"></div>}
             </div>
        </div>
    )
}

export default Friends; 