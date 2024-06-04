import Backdrop from "../Backdrop";
import { motion } from "framer-motion";
import { ToastContainer, toast } from "react-toastify";
import { SocketContext, UserContext } from "../../Helper/UserContext";
import {useContext, useEffect, useState} from 'react'; 
import './styles.css'
import { Close } from "@mui/icons-material";

const CreateExpensePop = ({handleClose, selectedGroup}) => {

    const date = new Date(); 

    const {client, connected} = useContext(SocketContext); 
    const {user} = useContext(UserContext)

    const [users, setUsers] = useState([]);
    const [page, setPage] = useState(0);
    const [sub, setSub] = useState(false); 
    const [show1, setShow1] = useState(false)
    const [userLoad, setUserLoad] = useState(true)

    const [total, setTotal] = useState(0); 
    const [tLoad, setTLoad] = useState(false);


    const [selectedUser, setSelectedUser] = useState({
        userId: "", 
        userName: "", 
        userPhoto: ""
    })
    
    const [paymentDetails, setPaymentDetails] = useState({
        description: "",
        contributorId: "", 
        transactionDate: date,
        totalAmount: 0.0,
        participants: [] 
    })
    
    const handleInput = (e) => {
        setPaymentDetails((prev) => ({
            ...prev, 
            [e.target.name]: e.target.value
        }))
    }

    const handleNumber = (item,e) => {
        paymentDetails.participants.forEach((dataEl) =>{
            if(dataEl[0] == item.userId){
                dataEl[1] = Number(e.target.value)
                setTLoad(!tLoad)
            }
        })
      
    }

    useEffect(() => {
        let temp = 0; 
        paymentDetails.participants.forEach((dataEl) => {
            temp += dataEl[1];
        })
        setTotal(temp)
    }, [tLoad])

    const handleSubmit = () => {
        if(total != paymentDetails.totalAmount) toast.error("The Numbers doesn't add up!!")
        else {
            toast.success("Adding Expense")
        }
    }


    const handleNextPage = () => {
        if(!/\S/.test(paymentDetails.description)) toast.error("Description Cannot be empty!!")
        else if(paymentDetails.totalAmount <= 0) toast.error("Amount Cannot be 0 or less!!")
        else {
            setPaymentDetails((prev) => ({
                ...prev, 
                contributorId: selectedUser.userId
            }))
            let tempPart = [];
            users.map((dataEl) => {
                tempPart.push([dataEl.userId, 0.0])
            })

            setPaymentDetails((prev) => ({
                ...prev, 
                participants: tempPart
            }))

            setPage(1)
        }

    }

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
                  style={{overflow: "hidden"}}
            >
            <div style={{ display: "flex", alignItems: "center", justifyContent: "end" }}>
               <Close style={{cursor: "pointer"}} onClick={handleClose}/>
            </div>
                <h2 id="title"> Add Expense</h2> 

            {page==0 && 
            <div style={{
                height: "80%", 
                width: "100%", 
                padding: "1%",
            }}>
                <div style={{
                    display: "grid", 
                    width: "100%", 
                    height: "50%",
                    alignItems: "center", 
                    justifyContent: "center", 
                    rowGap: "1%", 
                    overflow: "hidden"
                }}>
                    <input type="text" className="input-3" placeholder="Enter a description..."
                    onChange={handleInput} name="description"
                    />
                    <div
                    style={{
                        width: "100%",
                        display: "flex", 
                        justifyContent: "center",
                        
                        height: "100%"
                    }}
                    >
                   <div
                   style={{
                    display: "grid", 
                    alignItems: "center", 
                    fontSize: "x-large", 
                    justifyContent: "center", 
                    height: "50%"
                   }}
                   >
                   ₹
                   </div> 
                    <input type="number" className="input-3" id="price" placeholder="0.00"
                        style={{
                            width: "50%", 
                            border: "none",
                            borderBottom: "1px dotted #959595", 
                            height: "50%"
                        }}
                        name="totalAmount" onChange={handleInput}
                    />
                    </div>
                </div>
                <div style={{
                    display: "flex", 
                    justifyContent: "center",
                    height: "20%" , 
                    alignItems: "start",
                    width: "100%",
                }}>
                    Paid by  

                { !userLoad && 
                  <div style={{
                     display: "grid", 
                     height: "fit-content",
                     width: "18%", 
                     zIndex: 100
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

                    <div>
                        on
                    </div> 

                </div>
                 <div style={{
                    height: "30%", 
                    width: "100%",  
                    display: "flex", 
                    alignItems: "center", 
                    justifyContent: "center"
                }}>
                    {!show1 &&<motion.button
                     whileHover={{scale: 1.1}}
                     whileTap={{scale: 0.9}}
                     style={{
                        background: "none", 
                        border: "2px solid #1cc29f", 
                        height: "40%",
                        width: "20%", 
                        borderRadius: "10px", 
                        color: "#1cc29f", 
                        cursor: "pointer"
                     }}
                     onClick={handleNextPage}
                    > Next
                     </motion.button>}

                </div>
            </div>}

            {page==1 && <div style={{
                height: "80%", 
                width: "100%", 
                padding: "1%",

            }}>

            <div style={{fontSize: "larger",height: "10%", display: "grid", alignItems: "center",
            paddingLeft: "4%", fontWeight: "500"}}> Choose Split Options</div>

            <div style={{
                height: "60%", 
                width: "100%", 

                display: "block"
            }}>
                {/* split options */}
                <div style={{
                    height: "10%", 
                    width: "12%", 
                    marginLeft: "45%",
                    display:  "flex",
                        marginBottom: "1%",
                    backgroundColor: "white", 
                }}>

                      <motion.button style={{
                        width: "100%", 
                        height: "100%", 
                        cursor: "pointer", 
                        backgroundColor: "#ededed", 
                        fontSize: "larger", 
                        display: "grid", 
                        borderRadius: "5px",
                        alignContent: "center", 
                        border: "1px solid lightgray", 
                      }}
                      onClick={() => {console.log(paymentDetails)}}
                      whileHover={{
                        boxShadow: "inset 0px 0px 3px #c1c1c1"
                      }}
                      title="distribute equally"
                      >
                        =
                      </motion.button>

                </div>

                <div style={{
                    height: "70%", 
                    width: "80%", 
                    marginLeft: "10%", 
                    backgroundColor: "white", 
                    overflowY: "auto",
                    overflowX: "hidden",
                    scrollbarWidth: "2px",
                    borderRadius: "10px",
                    border: "1px solid #959595", 
                }}>

                {
                    users.map((dataEl) => {
                        return(
                           <div style={{
                            height: "25%", width: "100%", margin: "1%", display: "flex", alignItems: "center", padding: "0% 1%"
                           }}>
                           <div style={{
                            height: "85%",  backgroundColor: "black", width: "7%", borderRadius: "50px", overflow: "hidden"
                           }}>
                            <img src={dataEl.userPhoto}  width="100%" height="100%"  />
                           </div>
                            <div style={{
                                height: "85%", width: "25%", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", paddingLeft: "2%", display: "grid", alignItems: "center"
                            }}>
                            {dataEl.userName}
                            </div>

                            <div style={{
                                height: "85%", width: "25%", marginLeft: "41%", borderRadius: "5px", display: "flex", alignItems:  "center", padding: "1%", overflow: "hidden", border: "1px solid #d8d8d8", columnGap: "3%", 
                                backgroundColor: "#d8d8d8"
                            }}>
                             ₹
                             <input type="number" placeholder="0.00" height="1%" width="75%"
                               onChange={(e) => {handleNumber(dataEl,e)}}
                              style={{border: "none"}} />
                            </div>

                           </div>
                        )
                    })
                }
               
                </div>

                <div style={{
            
                    width: "80%", 
                    height: "20%", 
                    marginLeft: "10%", 
                    display: "flex", 
                    columnGap: "40%"
                }}>

                <div style={{
                  
                    height: "100%", 
                    width: "30%",  
                    display: "flex", 
                    alignItems: "center", 
                    justifyContent: "center", 
                    fontSize: "larger", 
                    fontWeight: "500"
                }}>
                    TOTAL
                </div>

                <div style={{
                  
                    height: "100%", 
                    width: "30%", 
                }}>
                    <div style={{
                       
                        height: "60%", 
                        width: "100%", 
                        paddingLeft: "30%",
                        fontSize: "larger"
                    }}
                    >
                        ₹{total.toFixed(2)}
                    </div>
                    <div style={{
                         color: "#959595",
                        height: "40%", 
                        width: "100%", 
                        fontSize: "small", 
                        paddingLeft: "30%"
                    }}>
                        ₹{(paymentDetails.totalAmount - total).toFixed(2)} left
                    </div>
                </div>

                </div>

            </div>

            {/* Add Expense Button */}
            <div style={{
                height: "30%", 
                width: "100%", 
                display: "flex", 
                alignItems: "center", 
                justifyContent: "center"
            }}>
                <motion.button
                  whileTap={{scale: 0.9}}
                  whileHover={{scale: 1.1}}
                  style={{
                    background: "none", 
                    border: "2px solid #1cc29f", 
                    borderRadius: "10px", 
                    color: "#1cc29f", 
                    height: "40%", 
                    width: "20%", 
                    cursor: "pointer"
                  }}

                  onClick={handleSubmit}

                >
                    Add Expense
                </motion.button>
            </div>


            </div>
            }


            </motion.div>
        </Backdrop>
        </>
    )
}

export default CreateExpensePop; 