import React, {useContext, useEffect, useState, useMemo} from "react";
import Sidebar from '../../Components/Sidebar'
import Profile from "../../Components/Profile";
import Title from '../../Components/Title'
import Axios from 'axios'
import {motion, AnimatePresence} from 'framer-motion'
import { ToastContainer, toast } from "react-toastify";
import { Done, Close, PersonAdd, Check, WifiOff, Sync } from "@mui/icons-material";
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

const ConnectionStatus = ({ status }) => {
    const messages = {
        connecting: {
            icon: <Sync style={{ fontSize: 48, color: "#1cc29f" }} className="rotating" />,
            text: "Establishing connection...",
        },
        disconnected: {
            icon: <WifiOff style={{ fontSize: 48, color: "#ff652f" }} />,
            text: "Connection not established\nPlease wait while we reconnect...",
        }
    };

    const currentStatus = messages[status];

    return (
        <div style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            height: "100%",
            color: "#666",
            gap: "16px",
            textAlign: "center"
        }}>
            {currentStatus.icon}
            <div style={{ fontSize: "16px", whiteSpace: "pre-line" }}>
                {currentStatus.text}
            </div>
        </div>
    );
};

const FriendsList = React.memo(({ option, people, userLookup, handleRequest, handleSelectUser }) => {
    return (
        <div className="friends-list">
            {people[option].map(person => {
                const userId = option === "Suggestions" ? person.userId : person;
                const userData = userLookup[userId] || { userName: "not found", userPhoto: "" };
                
                return (
                    <motion.div 
                        key={userId}
                        className="friends-list-element" 
                        onClick={() => handleSelectUser(person)}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.3 }}
                    >
                        <div className="fle-image">
                            <img src={userData.userPhoto} alt={userData.userName} style={{height: "100%", width: "100%"}}/>
                        </div>
                        <div className="fle-name">{userData.userName}</div>
                        <div className="fle-options">
                            {option === "Suggestions" && (
                                person.sent ? (
                                    <motion.div
                                        style={{
                                            fontSize: "14px",
                                            color: "#959595",
                                            display: "flex",
                                            alignItems: "center",
                                            gap: "4px"
                                        }}
                                    >
                                        <Check fontSize="small" /> Sent
                                    </motion.div>
                                ) : (
                                    <motion.button
                                        style={{
                                            border: "2px solid #1cc29f",
                                            background: "none",
                                            color: "#1cc29f"
                                        }}
                                        whileHover={{ scale: 1.05, backgroundColor: "#1cc29f", color: "white" }}
                                        whileTap={{ scale: 0.95 }}
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            handleRequest(userId, "sendRequest");
                                        }}
                                    >
                                        <PersonAdd fontSize="small" /> Add
                                    </motion.button>
                                )
                            )}
                            {option === "Requests" && (
                                <div style={{display: "flex", gap: "8px"}}>
                                    <motion.button
                                        style={{
                                            border: "2px solid #1cc29f",
                                            background: "none",
                                            color: "#1cc29f"
                                        }}
                                        whileHover={{ scale: 1.05, backgroundColor: "#1cc29f", color: "white" }}
                                        whileTap={{ scale: 0.95 }}
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            handleRequest(person, "acceptRequest");
                                        }}
                                    >
                                        <Done fontSize="small" />
                                    </motion.button>
                                    <motion.button
                                        style={{
                                            border: "2px solid #ff652f",
                                            background: "none",
                                            color: "#ff652f"
                                        }}
                                        whileHover={{ scale: 1.05, backgroundColor: "#ff652f", color: "white" }}
                                        whileTap={{ scale: 0.95 }}
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            handleRequest(person, "rejectRequest");
                                        }}
                                    >
                                        <Close fontSize="small" />
                                    </motion.button>
                                </div>
                            )}
                        </div>
                    </motion.div>
                );
            })}
        </div>
    );
});

const FriendDetails = React.memo(({ selectedUser, userLookup, groups, detailsLoad }) => {
    if (!selectedUser) {
        return (
            <div className="friends-details-container" style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                color: "#666",
                fontSize: "16px"
            }}>
                Select a friend to view details
            </div>
        );
    }

    if (detailsLoad) {
        return (
            <div className="friends-details-container" style={{display:"flex", alignItems: "center", justifyContent: "center"}}>
                <Lottie options={defaultOptions2} isClickToPauseDisabled={true} height={200} width={200} />
            </div>
        );
    }

    const userData = userLookup[selectedUser] || {};

    return (
        <div className="friends-details-container">
            <div className="fdc-head">
                <div id="image">
                    <img src={userData.userPhoto} alt={userData.userName} style={{width: "100%", height: "100%"}}/>
                </div>
                <div id="name">
                    <div id="title">{userData.userName}</div>
                    <div id="email">{userData.userEmail}</div>
                </div>
            </div>
            <div className="fdc-body">
                <AnimatePresence>
                    {groups.map((element, index) => (
                        <motion.div 
                            key={element.groupId}
                            className="fdc-group-element"
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -20 }}
                            transition={{ duration: 0.3, delay: index * 0.1 }}
                        >
                            <div id="image">
                                <img src={element.groupPhoto} alt={element.groupName} width="100%" height="100%"/>
                            </div>
                            <div id="name">{element.groupName}</div>
                            <div id="expense">
                                <div id="name">
                                    {element.groupBalance > 0 ? "You lent" : "You Owe"}
                                </div>
                                <div id="amount" style={{
                                    color: element.groupBalance > 0 ? "#1cc29f" : 
                                           element.groupBalance < 0 ? "#ff652f" : "inherit"
                                }}>
                                    ₹{Math.abs(element.groupBalance).toFixed(2)}
                                </div>
                            </div>
                        </motion.div>
                    ))}
                </AnimatePresence>
            </div>
        </div>
    );
});

const Friends = () => {
    const [bar, setBar] = useState(false);
    const [option, setOption] = useState("Friends");
    const [sub, setSub] = useState(false);
    
    const [friendsLoad, setFriendsLoad] = useState(true);
    const [detailsLoad, setDetailsLoad] = useState(false);
    const [connectionStatus, setConnectionStatus] = useState('connecting');

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
    });

    const fetchData = (body) => {
        const data = JSON.parse(body);
        setUserLookup(prevLookup => {
            const newLookup = { ...prevLookup };
            data.users.forEach(element => {
                newLookup[element.userId] = element;
            });
            return newLookup;
        });
        
        setPeople({
            Friends: data.friends || [], 
            Suggestions: data.suggestions || [], 
            Requests: data.requests || []
        });

        setFriendsLoad(false);
        setConnectionStatus('connected');
    };

    const handleRequest = (item, type) => {
        if (!connected) {
            toast.error("Cannot process request: No connection");
            return;
        }

        const body = type === "sendRequest" 
            ? { type, senderId: user._id, receiverId: item }
            : { type, senderId: item, receiverId: user._id };
        
        Axios.post(`${process.env.REACT_APP_SERVER_URI}/friends/handleRequest`, body)
            .then(response => {
                if(response.data.status === 400){
                    toast.error("Error Processing the Request");
                    console.error(response);
                }
            })
            .catch(error => {
                toast.error("Network Error");
                console.error(error);
            });
    };

    const handleSelectUser = (item) => {
        if(option !== "Friends") return;
        if(!connected) {
            toast.error("Cannot fetch details: No connection");
            return;
        }
        if(client && connected){
            setSelectedUser(item);
            setIsUserSelected(true);
            setDetailsLoad(true);
            client.send(`/app/getDetails/${user._id}`, {}, item);
        }
    };

    useEffect(() => {
        let subscription;
        let retryTimeout;
        let retryCount = 0;
        const maxRetries = 5;

        const setupConnection = () => {
            if (client && connected) {
                try {
                    setConnectionStatus('connecting');
                    subscription = client.subscribe(`/friends/${user._id}`, (msg) => {
                        const response = JSON.parse(msg.body);
                        
                        if(response.messageType === "userFriends") fetchData(response.body);
                        else if(response.messageType === "commonGroups") {
                            setGroups(JSON.parse(response.body));
                            setDetailsLoad(false);
                        }
                    });
                    setSub(true);
                    retryCount = 0;
                    // Initial data fetch
                    client.send(`/app/getFriends/${user._id}`, {}, "");
                } catch (error) {
                    console.error("Connection error:", error);
                    setConnectionStatus('disconnected');
                    if (retryCount < maxRetries) {
                        retryCount++;
                        retryTimeout = setTimeout(setupConnection, 3000);
                    }
                }
            } else {
                setConnectionStatus('disconnected');
                if (retryCount < maxRetries) {
                    retryCount++;
                    retryTimeout = setTimeout(setupConnection, 3000);
                }
            }
        };

        setupConnection();

        return () => {
            if(subscription) {
                subscription.unsubscribe();
                setSub(false);
            }
            if(retryTimeout) {
                clearTimeout(retryTimeout);
            }
        };
    }, [client, connected]);

    return(
        <div className="page-container">
            <Sidebar option="Friends" handleBar={setBar}/>
            <Profile/>
            <Title title="Friends" bar={bar}/>
            <ToastContainer/>
            <div className={bar ? "friends-container-closed" : "friends-container"}>
               <div className="friends-list-container">
                    <div className="friends-options-bar">
                        {["Friends", "Suggestions", "Requests"].map((opt) => (
                            <div
                                key={opt}
                                className={`fob-option ${option === opt ? 'active' : ''}`}
                                onClick={() => setOption(opt)}
                            >
                                {opt}
                            </div>
                        ))}
                    </div>
                    {connectionStatus !== 'connected' ? (
                        <ConnectionStatus status={connectionStatus} />
                    ) : friendsLoad ? (
                        <div style={{display: "flex", justifyContent: "center", alignItems: "center", height: "calc(100% - 68px)"}}>
                            <Lottie options={defaultOptions} isClickToPauseDisabled={true} height={200} width={200} />
                        </div>
                    ) : (
                        <FriendsList 
                            option={option}
                            people={people}
                            userLookup={userLookup}
                            handleRequest={handleRequest}
                            handleSelectUser={handleSelectUser}
                        />
                    )}
                </div>
                <FriendDetails
                    selectedUser={isUserSelected ? selectedUser : null}
                    userLookup={userLookup}
                    groups={groups}
                    detailsLoad={detailsLoad}
                />
            </div>
            <style>
                {`
                    @keyframes rotate {
                        from { transform: rotate(0deg); }
                        to { transform: rotate(360deg); }
                    }
                    .rotating {
                        animation: rotate 2s linear infinite;
                    }
                `}
            </style>
        </div>
    );
};

export default Friends; 