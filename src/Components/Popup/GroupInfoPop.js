import React, {useContext, useEffect, useState} from 'react';
import Backdrop from '../Backdrop';
import {motion} from 'framer-motion'
import { Close } from '@mui/icons-material';
import { SocketContext, UserContext } from '../../Helper/UserContext';
import './styles.css'
import Axios from 'axios';
import { ToastContainer } from 'react-toastify';


 const dropIn = { 
     hidden: {
         y: "-100vh",
         opacity: 0
     }, 
     visible: {
         y: 0,
         opacity: 1, 
         transition: {
             duration: 0.1, 
             type: "spring", 
             damping: 100, 
             stiffness: 500
         }
     },
     exit: {
         y: "100vh",
         opacity: 0
     }
 }

const GroupInfoPop = ({handleClose, users, fetchUser, showToast, selectedGroup}) =>{

    const {client, connected} = useContext(SocketContext);
    const [balances, setBalances] = useState([]);
    const [load, setLoad] = useState(true);
    const [sub, setSub] = useState(false);
    const {user} = useContext(UserContext);

    const fetchBalances = (data) => {
        setBalances(JSON.parse(data));
        setLoad(false);
        console.log(JSON.parse(data));
    }
    

    useEffect(() => {
        var subscription; 
        if(client && connected){
            subscription = client.subscribe(`/groups/selectedGroup/${selectedGroup.groupId}`, msg => {
                const response = JSON.parse(msg.body);
                if(response.messageType === "groupBalances") fetchBalances(response.body); 
            })
            setSub(true);
            
            return() => {
                subscription.unsubscribe(); 
            }
        }
    }, [client, connected])

    useEffect(() => {
        if(sub){
            client.send(`/app/groups/getGroupBalances/${selectedGroup.groupId}`, {}, "");
        }
    }, [sub])

    const getBalance = (userId) => {
        let data = 0;
        balances.forEach(element => {
            if(element.userId === userId) data = element.balance; 
        })

        return data; 
    }

    const sendRemainder = (receiverId) => {
        Axios.post(`${process.env.REACT_APP_SERVER_URI}/email/sendRemainder`, {
            senderName: user.userName, 
            receiverName: fetchUser(receiverId).userName, 
            groupName: selectedGroup.groupName, 
            receiverEmail: fetchUser(receiverId).userEmail
        }).then(response => {
            
            if(response.data.status === 200) showToast("success", response.data.message);
            else showToast("error", response.data.message);
        })
    }

    const getBalances = (userId) => {
       let data = []; 
       balances.forEach(element => {
            if(element.userId === userId) data = element.items;
       });

       return data; 
        
    }
     
    return(
        <>
          <Backdrop onClick={handleClose}>
          <ToastContainer/>
            <motion.div 
            className="group-info-pop"
            onClick={(e) => e.stopPropagation()}
            variants={dropIn}
            initial="hidden"
            animate="visible"
            exit="exit"
            style={{overflow: "hidden"}}
            >
            <div className='group-info-container'>
            <div style={{display: "flex",alignItems: "center", justifyContent: "end", marginTop: "2%"}}><Close style={{cursor: "pointer"}} onClick={handleClose}/></div>
              <div className='group-info-container-1'>
                 <div style={{
                    fontSize: "larger", fontWeight: "500"
                 }}> Group Balances</div>
                 
              </div>
              {  <div className='group-info-details-container'>
                {users.map(element => {
                    return(
                        <div className='gid-element'>
                           <div style={{height: "50px", width: "50px", display: "flex", alignItems: "center", justifyContent: "center"}}>
                                <img src={fetchUser(element.userId).userPhoto} style={{width: "90%", height: "80%", backgroundColor: "black", borderRadius: "50px"}}/>
                           </div>
                           <div style={{minHeight: "100%", width: "28%", padding: "1%",alignItems: "center",overflow: "hidden"}}>
                                <span style={{fontWeight: "400", fontSize: "medium"}}>
                                {fetchUser(element.userId).userName}
                                <span style={{fontSize: "small", fontWeight: "300"}}>
                                {getBalance(element.userId)>0? " gets ": " owes " }
                                </span> 
                                </span><br/>
                                <span style={getBalance(element.userId)>0?
                                 {color: "#1cc29f", fontSize: "larger"}: getBalance(element.userId)<0 ? {color: "#ff652f", fontSize: "larger"}:{color: "#959595", fontSize: "larger"}}>
                                ₹{Math.abs(getBalance(element.userId)).toFixed(2) + " "}
                                </span>
                                <span style={{fontSize: "small", fontWeight: "300"}}>in total</span> 
                           </div>
                           <div style={{height: "100%", width: "47%",overflow: "auto", scrollbarWidth: "none", textAlign: "left", padding: "1%"}}>
                                {getBalances(element.userId) && getBalances(element.userId).map(dataEl => {
                                    return(
                                        <div style={{fontSize: "medium"}}>
                                            { dataEl}
                                        </div>
                                    )
                                })}
                           </div>
                           <div style={{minHeight: "100%", width: "17%", display: "flex", alignItems: "center", justifyContent: "center"}}>
                                 <motion.button
                                 style={{
                                    fontSize: "x-small", 
                                    borderRadius: "3px", 
                                    border: "1px solid #d8d8d8", 
                                    cursor: "pointer", 
                                    minHeight: "3vh"
                                 }}
                                 onClick={() => {sendRemainder(element.userId)}}
                                 whileHover={{boxShadow: "inset 0px 0px 2px #c1c1c1"}}
                                 whileTap={{boxShadow: "inset 0px 0px 4px #c1c1c1", scale: "0.95"}}
                                 >
                                    Send Remainder
                                 </motion.button>
                           </div>
                        </div>
                    )
                })}
              </div>}
            </div>
            </motion.div>
          </Backdrop>
        </>
    )
}

export default GroupInfoPop;