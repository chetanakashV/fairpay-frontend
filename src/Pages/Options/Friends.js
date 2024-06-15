import React, {useState} from "react";
import Sidebar from '../../Components/Sidebar'
import Profile from "../../Components/Profile";
import Title from '../../Components/Title'
import './styles.css'
import {motion} from 'framer-motion'
import { Done, Close } from "@mui/icons-material";

const Friends = () => {
    const [bar, setBar] = useState(false);
    const [option, setOption] = useState("Friends")
    const handleBar = (state) => {setBar(state);}

    const [people, setPeople] = useState({
        Friends: [ {userName: "Pawan Kalyan", userPhoto: "https://encrypted-tbn3.gstatic.com/images?q=tbn:ANd9GcSBnDOhJoKGTLWetfGZajHJ5AbQKAprUQ4WsEpQtEs53NYC0OJD"}], 
        Suggestions: [{userName: "Chiranjeevi ", userPhoto: "https://www.deccanchronicle.com/h-upload/2024/01/26/1072672-chirupadmavibhushan1.webp"}], 
        Requests: [{userName: "Ram Charan", userPhoto: "https://in.bmscdn.com/iedb/artist/images/website/poster/large/ram-charan-teja-1046368-19-09-2017-02-37-43.jpg"}]
    })

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
                            {people[option].map(person => (
                                 <div className="friends-list-element">
                                    <div className="fle-image">
                                        <img src={person.userPhoto} style={{height: "100%", width: "100%"}}/>
                                    </div>
                                    <div className="fle-name"> {person.userName}</div>
                                    <div className="fle-options" id={option=="Suggestions"?"one": option=="Requests"? "two": "three"}>
                                        {
                                            option=="Suggestions"?
                                                <motion.button
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