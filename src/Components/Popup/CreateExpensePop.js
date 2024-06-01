import Backdrop from "../Backdrop";
import { motion } from "framer-motion";
import { ToastContainer, toast } from "react-toastify";
import { SocketContext, UserContext } from "../../Helper/UserContext";
import {useContext, useEffect, useState} from 'react'; 
import './styles.css'

const CreateExpensePop = ({handleClose, selectedGroup}) => {

    const {client, connected} = useContext(SocketContext); 
    const date = new Date(); 
    const {user} = useContext(UserContext)
    const [users, setUsers] = useState([]);
    const [sub, setSub] = useState(false); 
    const [selectedUser, setSelectedUser] = useState({
        userId: "", 
        userName: "", 
        userPhoto: ""
    })
    const [show1, setShow1] = useState(false)
    const [paymentDetails, setPaymentDetails] = useState({
        contributorId: "", 
        transactionDate: date,
        totalAmount: 0.0,
        participants: [] 
    })
    const [userLoad, setUserLoad] = useState(true)


    useEffect(() => {
        var subscription; 
        if(client && connected){
            subscription = client.subscribe(`/groups/${user.userId}`, (msg) => {
                const data = JSON.parse(msg.body); 
                
                if(data.messageType == "groupUserDetails") fetchUsers(data);
                else {
                    console.log(data)
                }
            })
            setSub(true)
        }

        return(() =>{
            if(sub){
                subscription.unsubscribe()
            }
        })
    },[])

    useEffect(() => {
        if(sub){
            setUsers([]); 
            client.send(`/app/getGroupUsers/${user.userId}`, {}, selectedGroup.groupId)
        }
        
    }, [sub])

    const fetchUsers = async (data) => {
        const temp = JSON.parse(data.body); 
        let tempUsers = [];
        setUsers([]);  
        temp.forEach((dataEl) => {
           tempUsers.push(dataEl)
        } )
        setUsers(tempUsers)
    }

    useEffect(() => {
        if(users.length > 0){
            
            setUserLoad(false);
            setSelectedUser({
                userId: user._id, 
                userName: user.userName, 
                userPhoto: user.imageUrl
            })
        }
    }, [users])

    const handleSelect = (data) => {
        setSelectedUser({
            userId: data.userId, 
            userName: data.userName, 
            userPhoto: data.userPhoto
        })
        setShow1(false)
    }

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

    const showSuccessToast = (text) => {
        toast.success(text)
    }

    return(
        <>
        <ToastContainer/>
        <Backdrop onClick={handleClose}>
            <motion.div className="create-expense-pop"
            onClick={(e) => e.stopPropagation()}
                  variants={dropIn}
                  initial="hidden"
                  animate="visible"
                  exit="exit"
            >
              
                <h2 id="title"> Add Expense</h2>
            {<div>
                <div style={{
                    display: "grid", 
                    width: "100%", 
                    alignItems: "center", 
                    height: "29%", 
                    justifyContent: "center", 
                    rowGap: "15%", 
                    overflow: "hidden"
                }}>
                    <input type="text" className="input-3" placeholder="Enter a description..."/>
                    <div
                    style={{
                        width: "100%",
                        display: "flex", 
                        justifyContent: "center",
                    }}
                    >
                   <div
                   style={{
                    display: "grid", 
                    alignItems: "center", 
                    fontSize: "x-large", 
                    justifyContent: "center"
                   }}
                   >
                   ₹
                   </div> 
                    <input type="number" className="input-3" id="price" placeholder="0.00"
                        style={{
                            width: "50%", 
                            border: "none",
                        borderBottom: "1px dotted #d8d8d8"
                        }}
                    />
                    </div>
                </div>
                <div style={{
                    display: "flex", 
                    justifyContent: "center",
                    height: "10%" , 
                    width: "100%",
                    marginTop: "5%", 
                }}>
                    Paid by  

                { !userLoad && 
                  <div style={{
                     display: "grid", 
                     height: "fit-content", 
                     width: "18%"
                    }}>
                        <button
                         onClick = {() => setShow1(!show1)}
                         style={{
                        background: "none", 
                        border: "1px solid #959595", 
                        fontFamily: "-moz-initial",
                        borderRadius: "10px",
                        marginLeft: "0.5vw",
                        fontSize: "large", 
                        width: "100%",
                        cursor: "pointer", 
                     }}>
                        {selectedUser.userId == user._id ? " You" : selectedUser.userName}
                     </button>

                     {show1 && <div style={{
                        overflow: "hidden", 
                        whiteSpace: "nowrap", 
                        border: "1px solid #d8d8d8",
                        paddingLeft: "2%",
                        borderRadius: "10px",
                        marginLeft: "0.5vw", 
                        textOverflow: "ellipsis", 
                        width: "100%"
                     }}
                    
                     >
                        {
                            !userLoad && users.map((dataEl) => {
                                return(
                                    <motion.div style={{
                                        display: "flex", 
                                        marginTop: "2%", 
                                        marginBottom: "2%",
                                        alignItems: "center", 
                                        justifyContent: "center", 
                                        width: "100%", 
                                    }}
                                    className="temp-1"
                                    onClick = {() => handleSelect(dataEl)}
                                    >
                                       <div style={{
                                        backgroundColor: "black", 
                                        width: "25%", 
                                        height: "50%",
                                        borderRadius: "100px", 
                                        display: "grid", 
                                        overflow: "hidden",
                                       }}
                                      
                                       >
                                       <img src = {dataEl.userPhoto} width="90%" />
                                       </div>
                                       <div style={{
                                        display: "grid", 
                                        alignItems: "center", 
                                        justifyContent: "start", 
                                        overflow: "hidden", 
                                        whiteSpace: "nowrap",
                                        textOverflow: "ellipsis", 
                                        marginLeft: "5%",
                                        width: "70%",
                                        cursor: "pointer",
                                       }}>  {dataEl.userId == user._id ? "You" : dataEl.userName} </div>
                                    </motion.div>
                                )
                            })
                        }
                     </div>}

                     </div>
                    }
                    
                </div>
            </div>}
            </motion.div>
        </Backdrop>
        </>
    )
}

export default CreateExpensePop; 