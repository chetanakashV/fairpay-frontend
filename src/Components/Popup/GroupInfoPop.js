import React from 'react';
import Backdrop from '../Backdrop';
import {motion} from 'framer-motion'
import './styles.css'
import { Close } from '@mui/icons-material';

const GroupInfoPop = ({handleClose, users, fetchUser}) =>{
    
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

    return(
        <>
          <Backdrop onClick={handleClose}>
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
              <div className='group-info-container-1'>
                 <div style={{
                    fontSize: "larger", fontWeight: "500"
                 }}> Group Info</div>
                 <Close style={{cursor: "pointer"}} onClick={handleClose}
                 />
              </div>
              <div className='group-info-details-container'>
                {users.map((element) =>{
                    return(
                        <div className='gid-element'>
                            <img src={fetchUser(element.userId).userPhoto} style={{
                                width:"8%", height: "75%", backgroundColor: "black", borderRadius: "50px", marginRight: "1%", overflow: "hidden", marginLeft: "15%"
                            }}/>
                            <div style={{
                                fontSize: "large", 
                                width: "40%", 
                                height: "90%",
                            }}>
                            {fetchUser(element.userId).userName}
                            <div style={{fontSize: "small"}}>
                            {"" + element.balance == 0? 
                             <span style={{color: "#959595"}}> settled up </span> :
                             element.balance > 0 ?
                             <span style={{color: "#1cc29f"}}>gets back <span style={{fontWeight: "500"}}>₹{element.balance}</span></span>:
                             <span style={{color: "#ff652f"}}>owes <span style={{fontWeight: "500"}}>₹{-1*element.balance}</span></span>}
                            </div>
                            </div>
                        </div>
                    )
                })}
              </div>
            </div>
            </motion.div>
          </Backdrop>
        </>
    )
}

export default GroupInfoPop;