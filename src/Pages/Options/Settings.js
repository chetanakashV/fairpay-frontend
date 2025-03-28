import React, { useContext, useEffect, useState } from "react";
import Sidebar from '../../Components/Sidebar';
import Profile from "../../Components/Profile";
import Title from "../../Components/Title";
import { motion } from 'framer-motion';
import { Email } from "@mui/icons-material";
import { SocketContext, UserContext } from "../../Helper/UserContext";
import './styles.css';
import { ToastContainer, toast } from "react-toastify";

const Settings = () => {
    const [bar, setBar] = useState(false);
    const handleBar = (state) => { setBar(state); }
    const [sub, setSub] = useState(false);
    const [refresh, setRefresh] = useState(false);
    
    const {user} = useContext(UserContext);
    const {client, connected} = useContext(SocketContext);

    const [preferences, setPreferences] = useState({
        _id: "",
        newGroup: true,
        updateGroup: false,
        newExpense: true,
        deleteExpense: false,
        sendRequest: true,
        acceptRequest: false,
        fairPayUpdates: true,
        monthlySummaries: false
    });

    const fetchPreferences = (body) =>{
        const data = JSON.parse(body); 
        console.log(data);
        setPreferences(data);
    }

    

    useEffect(() => {
        let subscription; 
        if(client && connected){
            const timer = setTimeout(() => {
                subscription = client.subscribe(`/settings/${user._id}`, (msg) =>{
                    const res = JSON.parse(msg.body);
                    if(res.messageType === "userPreferences") fetchPreferences(res.body);
                    else console.log(msg); 
                })
                setSub(true);
          }, 1000)

          return () => {
            clearTimeout(timer);
            if(subscription){
                subscription.unsubscribe();
                setSub(false);
            }
          }
        }
    }, [connected, client])

    useEffect(() => {
        if(sub){
            client.send(`/app/getPreferences/${user._id}`, {}, "");
        }
    }, [sub])

    const handleInput = (e) => {
        const titleAccess = e.currentTarget.getAttribute('data-value');
        let value = preferences[titleAccess];
        setPreferences((prev) => ({
            ...prev, 
            [titleAccess]: !value
        }))
    }

    const handleSave = () => {
        if(client && connected){
            client.send(`/app/updatePreferences/${user._id}`, {}, JSON.stringify(preferences));

            setTimeout( () => {toast.success("Updated Successfully!!")} , 1000)
        }
    }

    const getIconStyle = (preferenceKey) => {
        return preferences[preferenceKey] ?
            { scale: "1.1", cursor: "pointer"} :
            { scale: "1.1", cursor: "pointer", color: "#959595"};
    }

    return (
        <div className="page-container">
            <ToastContainer/>
            <Sidebar option="Settings" handleBar={handleBar} />
            <Profile /> <Title title="Settings" bar={bar} />
            <div className={bar ? "settings-container-closed" : "settings-container"}>
                <div className="notification-container">
                    <div className="section-title">Notifications</div>
                    <div className="settings-options-container">
                        <div id="soc-1">
                            <div className="soc-title">GROUPS AND EXPENSES</div>
                            <div className="soc-container">
                                <div className="soc-element">
                                    <div id="icon">
                                        <Email
                                            style={getIconStyle("newGroup")}
                                            onClick={handleInput}
                                            data-value="newGroup"
                                        />
                                    </div>
                                    <div id="name">When someone adds me to a group</div>
                                </div>
                                <div className="soc-element">
                                    <div id="icon">
                                        <Email
                                            style={getIconStyle("updateGroup")}
                                            onClick={handleInput}
                                            data-value="updateGroup"
                                        />
                                    </div>
                                    <div id="name">When group details are updated</div>
                                </div>
                                <div className="soc-element">
                                    <div id="icon">
                                        <Email
                                            style={getIconStyle("newExpense")}
                                            onClick={handleInput}
                                            data-value="newExpense"
                                        />
                                    </div>
                                    <div id="name">When an expense is added</div>
                                </div>
                                <div className="soc-element">
                                    <div id="icon">
                                        <Email
                                            style={getIconStyle("deleteExpense")}
                                            onClick={handleInput}
                                            data-value="deleteExpense"
                                        />
                                    </div>
                                    <div id="name">When an expense is deleted</div>
                                </div>
                            </div>
                        </div>
                        <div id="soc-2">
                            <div className="soc-title">FRIENDS AND UPDATES</div>
                            <div className="soc-container">
                                <div className="soc-element">
                                    <div id="icon">
                                        <Email
                                            style={getIconStyle("sendRequest")}
                                            onClick={handleInput}
                                            data-value="sendRequest"
                                        />
                                    </div>
                                    <div id="name">When someone sends me a friend request</div>
                                </div>
                                <div className="soc-element">
                                    <div id="icon">
                                        <Email
                                            style={getIconStyle("acceptRequest")}
                                            onClick={handleInput}
                                            data-value="acceptRequest"
                                        />
                                    </div>
                                    <div id="name">When someone accepts my friend request</div>
                                </div>
                                <div className="soc-element">
                                    <div id="icon">
                                        <Email
                                            style={getIconStyle("fairPayUpdates")}
                                            onClick={handleInput}
                                            data-value="fairPayUpdates"
                                        />
                                    </div>
                                    <div id="name">Major FairPay News and Updates</div>
                                </div>
                                <div className="soc-element">
                                    <div id="icon">
                                        <Email
                                            style={getIconStyle("monthlySummaries")}
                                            onClick={handleInput}
                                            data-value="monthlySummaries"
                                        />
                                    </div>
                                    <div id="name">Monthly Summary of My Activities</div>
                                </div>
                            </div>
                        </div>
                    </div>
                    <div className="soc-button-container">
                        <motion.button style={{
                            background: "none",
                            border: "2px solid #1cc29f",
                            color: "#1cc29f",
                            borderRadius: "5px",
                            height: "75%",
                            width: "10%",
                            fontSize: "medium",
                            cursor: "pointer"
                        }}
                            whileHover={{ scale: 1.1 }}
                            whileTap={{ scale: 0.9 }}
                            onClick={handleSave}
                        >
                            SAVE
                        </motion.button>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default Settings;
