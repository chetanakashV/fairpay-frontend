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

const EditGroup = ({handleClose, selectedGroup, groupUsers}) => {

    const [type, setType] = useState("Work");
    const [page, setPage] = useState(0);
    const [addLoad, setAddLoad] = useState(false);
    const [users, setUsers] = useState([]);
    const [email, setEmail] = useState("");
    const [selectedFile, setSelectedFile] = useState("");
    
    const {client, connected} = useContext(SocketContext); 
    const {user} = useContext(UserContext);

    
    const handleFileChange = (event) => {
        setSelectedFile(event.target.files[0]);
    };

    useEffect(() => {
        const handleFileUpload = async () => {
            if (!selectedFile) return;

            const formData = new FormData();
            formData.append('image', selectedFile);

            try {
                const response = await Axios.post(`https://api.imgbb.com/1/upload?key=${process.env.REACT_APP_IMAGE_API}`, formData);

                if (response.data.success) {
                    setNewDetails((prev) => ({
                        ...prev, 
                        groupPhoto: response.data.data.url
                    }))
                    toast.success('Image uploaded successfully!');
                } else {
                    toast.error('Uploading image failed');
                }
            } catch (error) {
                toast.error('An error occurred while uploading the image');
            }
        };

        handleFileUpload();
    }, [selectedFile]);
 

    const handleInput = (e) => {
        setNewDetails((prev) => ({
            ...prev, 
            [e.target.name]: e.target.value
        }))
    }

    const [newDetails, setNewDetails] = useState({
        groupName: "", 
        groupDescription: "", 
        groupType: "", 
        groupPhoto: "",
        newUsers: []
    })
    
    useEffect(() => {
        setNewDetails({
            groupName: selectedGroup.groupName, 
            groupDescription: selectedGroup.groupDescription, 
            groupType: selectedGroup.groupType, 
            groupPhoto: selectedGroup.groupPhoto,
            newUsers:  []
        })  
    },[])


    const defaultOptions = {
        loop: true,
        autoplay: true,
        animationData: animationData,
        rendererSettings: {
          preserveAspectRatio: "xMidYMid slice"
        }
      };

    const updateGroup = async () => {
        var members = [];
        newDetails.newUsers.forEach(dataEl => {
            members.push(dataEl.userId);
        })

        Axios.put(`${process.env.REACT_APP_SERVER_URI}/groups/updateGroup`, {
            groupId: selectedGroup.groupId, 
            groupName: newDetails.groupName,
            groupType: newDetails.groupType, 
            groupDescription: newDetails.groupDescription,
            groupPhoto: newDetails.groupPhoto,
            newUsers: members
        }).then(response => {
            if(response.data.status == 200){
                toast.success(response.data.message);
                setTimeout(() => {
                    handleClose()
                }, 500)
            }
            else {
                toast.error(response.data.message);
            }
        })
    }

    const removeUser = (item) => {
        let temp = newDetails.newUsers.filter(user => user.userEmail !== item.userEmail);

        setNewDetails(prev => ({
            ...prev, 
            newUsers: temp
        }));
    }
      
    const nextPage = () => {
       
        setPage(1);

        client.subscribe(`/groups/${user._id}`, (msg) => {
            const res = JSON.parse(msg.body)

            if(res.messageType == "userByEmail"){
                fetchUser(res)
                setAddLoad(false)
            }

        })

    }


    const fetchUser = async (res) => {
        setEmail('')
        if(res.response.status == 404) {
            toast.error(res.response.message)
        }
        else {
            const newUser = JSON.parse(res.body) ;
            const newItem = {
                userId: newUser._id, 
                userName: newUser.userName, 
                userEmail: newUser.userEmail,
                userPhoto: newUser.imageUrl
            } 
            
            console.log(newDetails)
            

            setNewDetails(prev => {
                const userExists = prev.newUsers.some(user => user.userEmail === newItem.userEmail);
                const alreadyUser = groupUsers.some(user => user.userEmail === newItem.userEmail);
            
                if (userExists || alreadyUser) {
                    if (userExists) {
                        toast.error("User is Added before!");
                    }
                    if (alreadyUser) {
                        toast.error("User is already a part of group!");
                    }
                    return prev; // Return the previous state without changes
                } else {
                    console.log("Adding new user:", newItem);
                    return {
                        ...prev,
                        newUsers: [...prev.newUsers, newItem]
                    };
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

    const handleKeyDown = (e) => {
        if (e.key === 'Enter') {
          sendMsg();
        }
    };

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
                    <h2 id="title">Edit Group</h2> 
                    <div style={{
                        display: "flex",
                        paddingLeft: "10%",
                        height: "14%",
                    }}>
                    <input type="file" style={{display: "none"}} id="fileInput"
                     onChange={handleFileChange}/>
                    
                    <div
                     onClick={() => {document.getElementById("fileInput").click()}}
                     style={{
                        width: "14%",
                        display: "grid",
                        alignItems: "center",
                        justifyContent: "center",
                        backgroundColor: "#d8d8d8",
                        borderRadius: "50px",
                    }}>
                        {newDetails.groupPhoto == ""? 
                            <CameraAltIcon scale="1.1" style={{color:"#959595", 
                        transform: "scale(2)", cursor: "pointer" }} />
                        : 
                        <img src={newDetails.groupPhoto} alt="upload" style={{ 
                        fontSize: "small", cursor: "pointer", width: "100%", height: "100%", borderRadius: "50px", border: "1px solid #d8d8d8"}}/>
                        }
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
                        value={newDetails.groupName} name="groupName"
                       onChange={handleInput}
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
                        value={newDetails.groupDescription}
                        onChange = {handleInput} name="groupDescription"
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
                            name="groupType"
                            value="Work"
                            className={
                                newDetails.groupType=="Work"?"group-type-selected":"group-type"}
                            onClick={handleInput}
                            >
                                Work
                            </motion.button>
                            <motion.button
                            name="groupType"
                            value="House"
                            className={ newDetails.groupType=="House"?"group-type-selected":"group-type"}
                            onClick={handleInput}
                            >
                                House
                            </motion.button>
                            <motion.button
                            name="groupType"
                            className={ newDetails.groupType=="Travel"?"group-type-selected":"group-type"}
                            value="Travel"
                            onClick={handleInput}
                            >
                                Travel
                            </motion.button>
                            <motion.button
                            name="groupType"
                            style={{border: "none"}}
                            className={ newDetails.groupType=="Others"?"group-type-selected":"group-type"}
                            value="Others"
                            onClick={handleInput}
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
                    <h2 id="title">Edit Group</h2>
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

                        {groupUsers && groupUsers.map((dataEl, key) => {
                            return(
                                <div className="add-users-group">
                                    <img src = {dataEl.userPhoto}  height={"40px"} width={"40px"} className="add-users-image" title={dataEl.userEmail}/>
                                    <div className="add-users-text">{dataEl.userName}</div>
                                   {/* {dataEl.userEmail != user.userEmail ? <div className="add-users-icon"><CloseIcon onClick = {() => {removeUser(dataEl)}}
                                   /></div>:  */
                                   <div className="add-users-icon"></div>}
                                </div>
                            )
                        })}
                        {newDetails.newUsers && newDetails.newUsers.map((dataEl, key) => {
                            return(
                                <div className="add-users-group">
                                    <img src = {dataEl.userPhoto}  height={"40px"} width={"40px"} className="add-users-image" title={dataEl.userEmail}/>
                                    <div className="add-users-text">{dataEl.userName}</div>
                                    <div className="add-users-icon"><CloseIcon onClick = {() => {removeUser(dataEl)}}
                                   /></div>
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
                        <input type="email" className="input-5" value={email} placeholder="e.g. user@gmail.com"  onKeyDown={handleKeyDown}
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
                 onClick={updateGroup}
                 >
                    Update
                 </motion.button>
                    </div>
                 </motion.div>
                  }

                </motion.div>
            </Backdrop>
        </>
    )
}

export default EditGroup; 