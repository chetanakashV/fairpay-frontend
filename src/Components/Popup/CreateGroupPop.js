import { useContext, useRef,useEffect, useState } from "react";
import Backdrop from "../Backdrop";
import {motion} from 'framer-motion'
import Axios from 'axios'
import CameraAltIcon from '@mui/icons-material/CameraAlt';
import CloseIcon from '@mui/icons-material/Close';
import Lottie from "react-lottie";
import animationData from '../../Lotties/AddLoading.json'
import { ToastContainer, toast } from "react-toastify";
import { SocketContext, UserContext } from "../../Helper/UserContext";
import './styles.css'

const CreateGroup = ({handleClose, showToast}) => {

    const [type, setType] = useState("Work");
    const [page, setPage] = useState(0);
    const [addLoad, setAddLoad] = useState(false);
    const [users, setUsers] = useState([]);
    const [email, setEmail] = useState("");
    
    const {client, connected} = useContext(SocketContext); 
    const {user} = useContext(UserContext);

    const [groupName, setGroupName] = useState("");
    const [groupDescription, setGroupDescription] = useState(""); 
    



    const defaultOptions = {
        loop: true,
        autoplay: true,
        animationData: animationData,
        rendererSettings: {
          preserveAspectRatio: "xMidYMid slice"
        }
      };

    const createGroup = async () => {
        var members = []; 
        users.forEach((dataEl) => {
           members.push(dataEl[2])
        })

        Axios.post(`${process.env.REACT_APP_SERVER_URI}/groups/createGroup`, {
            groupName, 
            groupDescription, 
            groupType: type,
            groupMembers: members, 
            createdBy: user._id
        }).then(() => {
            toast.success("Group Created Successfully!!");
            setTimeout(() => {
                handleClose();
            }, 500) 
        })
    }


    const removeUser = (item) => {
        setUsers(l => l.filter(el => el[2] != item[2]));
    }
      
    const nextPage = () => {
        if(groupName == "") {toast.error("Group Name Cannot be Empty!!"); return; }
        setPage(1);

        client.subscribe(`/groups/${user._id}`, (msg) => {
            const res = JSON.parse(msg.body)

            if(res.messageType == "userByEmail"){
                fetchUser(res)
                setAddLoad(false)
            }

        })

    }

    useEffect(() => {
        if(users.length == 0) setUsers([[user.imageUrl, user.userName, user.userEmail]]) 
    },[user])


    const fetchUser = async (res) => {
        setEmail('')
        if(res.response.status == 404) {
            toast.error(res.response.message)
        }
        else {
            const newUser = JSON.parse(res.body) 
            const newItem = [newUser.imageUrl, newUser.userName, newUser.userEmail] 
            
            setUsers((prevUsers) => {
                const userExists = prevUsers.some(user =>
                  user[2] === newItem[2]
                );
        
                if (userExists) {
                  toast.error("User Already Added!!");
                  return prevUsers;
                } if(!userExists) {
                  return [...prevUsers, newItem];
                }
            });
        }
    }

    const sendMsg = () => {
        if(email == "") toast.error("Email Cannot be empty")
        else if(client){
            setAddLoad(true)
            client.send(`/app/getUser/${user._id}`, {}, email)
        }
    }

    const handleType = (item) => {
        setType(item)
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

    return(
        <>
            <ToastContainer/>
            <Backdrop onClick={handleClose}>
                <motion.div className="create-group-pop"
                  onClick={(e) => e.stopPropagation()}
                  variants={dropIn}
                  initial="hidden"
                  animate="visible"
                  exit="exit"
                >
                <div style={{width: "100%",display: "flex", flexDirection:"row-reverse",alignItems:"end", marginTop: "2%", cursor: "pointer"}}>
                 <CloseIcon onClick={handleClose}/> </div>
                { page==0 ? <motion.div 
                className="create-group-container">
                    <h2 id="title">Create Group</h2> 
                    <div style={{
                        display: "flex",
                        paddingLeft: "10%",
                        height: "14%",
                    }}>
                    
                    <div style={{
                        width: "14%",
                        display: "grid",
                        alignItems: "center",
                        justifyContent: "center",
                        backgroundColor: "#d8d8d8",
                        borderRadius: "50px",
                    }}>
                        <CameraAltIcon scale="1.1" style={{color:"#959595", 
                        transform: "scale(2)", cursor: "pointer" }}/>
                    </div>
                    <div style={{
                        display: "grid",
                        fontSize: "larger",
                        justifyContent: "center",
                        width: "65%",
                        height: "18%",
                        marginTop: "0.8%"
                    }}>
                    <label>Group Name</label>
                    <input type="text" className="input-2" placeholder="Thunder Buddies..."
                       onChange={e => {setGroupName(e.target.value)}}
                    />
                    </div>
                    </div>
                    <div  style={{
                        display: "grid",
                        fontSize: "larger",
                        justifyContent: "center",
                        width: "100%",
                        height: "27%",
                        marginTop: "3%",
                        alignContent: "start",
                        alignItems: "start",
                    }}>
                        <label> Group Description </label>
                        <textarea 
                        onChange = {e => setGroupDescription(e.target.value)}
                        style={{
                            border: "1px solid #d8d8d8", borderRadius: "5px", 
                            height: "13vh",
                            width: "28vw",
                            fontSize: "larger",
                            outline: "none", 
                            border: "1px solid #d8d8d8"
                        }}/>
                    </div>
                    <div  style={{
                        display: "grid",
                        fontSize: "larger",
                        width: "100%",
                        height: "20%",
                        alignContent:"start",
                        justifyContent: "center",
                    }}>
                        <label> Group Type </label>
                        <div className="sliding-options">
                            <motion.button 
                            className={type=="Work"?"group-type-selected":"group-type"}
                            onClick={() => handleType("Work")}
                            >
                                Work
                            </motion.button>
                            <motion.button
                            className={type=="House"?"group-type-selected":"group-type"}
                            onClick={() => handleType("House")}
                            >
                                House
                            </motion.button>
                            <motion.button
                            className={type=="Travel"?"group-type-selected":"group-type"}
                            onClick={() => handleType("Travel")}
                            >
                                Travel
                            </motion.button>
                            <motion.button
                            style={{border: "none"}}
                            className={type=="Others"?"group-type-selected":"group-type"}
                            onClick={() => handleType("Others")}
                            >
                                Others
                            </motion.button>
                        </div>
                    </div>
                    <div style={{
                        display: "flex",
                        justifyContent: "center",
                        height: "8%",
                    }}>
                 <motion.button
                 style={{ width: "20%", background: "none",fontSize: "larger", borderRadius: "10px",cursor: "pointer", border: "2px solid #1cc29f", color: "#1cc29f"}}
                 initial={{scale: 1}}
                 whileHover={{scale: 1.1}}
                 whileTap={{scale: 0.9}}
                 onClick={nextPage}
                 >
                    Next
                 </motion.button>
                    </div>
                 </motion.div>:

                 //second page
                 <motion.div 
                className="create-group-container">
                    <h2 id="title">Create Group</h2>
                    <div style={{
                        height: "62%", 
                        width: "100%",
                        marginBottom: "2%",
                        paddingLeft: "2%",
                    }}>
                    <span style={{marginLeft: "5%", fontSize: "x-large",  fontWeight: "600"}}>Users</span>
                    <div style={{
                        height: "70%", 
                        width: "90%",
                        border: "1px solid #d8d8d8",
                        marginLeft: "5%",
                        borderRadius: "10px",
                        overflowY: "auto",
                        overflowX: "hidden"
                    }}>
                    <div style={{
                        width: "110%",
                        display:"flex",
                        flexWrap:"wrap",
                        flexBasis: "0%",
                        scrollbarWidth: "none"
                    }}>

                        {users && users.map((dataEl, key) => {
                            return(
                                <div className="add-users-group">
                                    <img src = {dataEl[0]}  height={"40px"} width={"40px"} className="add-users-image" title={dataEl[2]}/>
                                    <div className="add-users-text">{dataEl[1]}</div>
                                   {dataEl[2] != user.userEmail ? <div className="add-users-icon"><CloseIcon onClick = {() => {removeUser(dataEl)}}
                                   /></div>: 
                                   <div className="add-users-icon"></div>}
                                </div>
                            )
                        })}
                    </div>
                    </div>
                    <div style={{
                        height: "20%", 
                        width: "90%",
                        marginTop: "1%",
                        marginLeft: "5%"
                    }}>
                        <input type="email" className="input-5" value={email} placeholder="e.g. user@gmail.com"  
                        onChange={e => setEmail(e.target.value)} 
                        style={{
                            width: "70%", 
                            height: "50%",
                            marginTop: "1%",
                            marginLeft: "7%",
                        }} />
                        <motion.button style={{
                            width: "16%",
                            height: "54%",
                            color: "#1cc29f",
                            fontSize: "large",
                            background: "none",
                            border: "1px solid #1cc29f",
                            borderRadius: "10px",
                            marginLeft: "2%",
                            cursor: "pointer",
                            backgroundColor: "white"
                        }}
                        onClick={sendMsg}
                        initial={{scale: 1}}
                        whileHover={{scale: 1.1}}
                        whileTap={{scale: 0.9}}
                        >
                            {
                                addLoad? 
                                <Lottie
                                    options={defaultOptions}
                                    height={20}
                                    width={20}
                                    style={{
                                        marginBottom: "10%",
                                    }}
                                />:
                                <>Add</>
                            }
                        </motion.button>
                    </div>
                    </div>
                    <div style={{
                        display: "flex",
                        justifyContent: "center",
                        height: "8%",
                    }}>
                 <motion.button
                 style={{ width: "20%", background: "none",fontSize: "larger", borderRadius: "10px",cursor: "pointer", border: "2px solid #1cc29f", color: "#1cc29f"}}
                 initial={{scale: 1}}
                 whileHover={{scale: 1.1}}
                 whileTap={{scale: 0.9}}
                 onClick={createGroup}
                 >
                    Create
                 </motion.button>
                    </div>
                 </motion.div>
                  }

                </motion.div>
            </Backdrop>
        </>
    )
}

export default CreateGroup; 