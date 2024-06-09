import {useState, useContext, useEffect} from 'react'
import Sidebar from '../../Components/Sidebar'
import Profile from '../../Components/Profile';
import { ToastContainer, toast } from 'react-toastify';
import { UserContext } from '../../Helper/UserContext';
import {motion} from 'framer-motion'
import animationData from '../../Lotties/Invite.json'
import Title from '../../Components/Title'
import Lottie from 'react-lottie';
import './styles.css'
import Axios  from 'axios';

const Account = () => {
    const [bar, setBar] = useState(false);
    var {user, loading} = useContext(UserContext);
    const [load, setLoad] = useState(true);
    const [reset, setReset] = useState(false)
    const [newDetails, setNewDetails] = useState({
        userName: "", 
        userEmail: "",
        userMobile: "",
        userPhoto: "", 
        password: "", 
        cnfPassword: ""
    })

    const defaultOptions = {
        loop: true,
        autoplay: true,
        animationData: animationData,
        rendererSettings: {
            preserveAspectRatio: "xMidYMid slice"
        }
    };

    const handleInputChange = (e) => {
        setNewDetails((prev) => ({
            ...prev, 
            [e.target.name]: e.target.name=="userMobile"? Number(e.target.value) : e.target.value
        }))
    }

    const handleReset = () => {
        setReset(!reset)
    }

    function checkPassword(str)
    {
        var re = /^(?=.*\d)(?=.*[!@#$%^&*])(?=.*[a-z])(?=.*[A-Z]).{8,}$/;
        return re.test(str);
    }

    useEffect(() => {
        if(user){
            setNewDetails({
                userName: user.userName, 
                userEmail: user.userEmail, 
                userMobile: user.userMobile, 
                userPhoto: user.imageUrl,
                password: "", 
                cnfPassword: ""
            })
        setLoad(false)
            }
    }, [user, reset])

    const handleBar = (state) => {setBar(state);}

    const handleSubmit = (e) => {
        e.preventDefault(); 
        if(!checkPassword(newDetails.password) && newDetails.password!="") 
            toast.error("Weak Password")
        else if(newDetails.password != newDetails.cnfPassword) {
            toast.error("Passwords are not matching!!")
        }
        else{
            Axios.post(`${process.env.REACT_APP_SERVER_URI}/users/updateUser`, {
                userId: user._id, 
                userName: newDetails.userName, 
                userEmail: newDetails.userEmail, 
                userMobile: newDetails.userMobile, 
                password: newDetails.password, 
                userPhoto: newDetails.userPhoto
            }).then(response => {
                if(response.data.status == 200) toast.success("Updated!! Changes Will be reflected on Next Login.")
                else {toast.error(response.data.message)}
            })
        }
    }

   
    return(
        <div className='page-container'>
            <Sidebar option="Account" handleBar={handleBar}/>
            <Profile/> <Title title="Account" bar = {bar}/>
            <ToastContainer/>
            <div className={bar?"account-container-closed":"account-container"}>
                 
                {load?
                 <div>  </div> 
                :
                <div className="profile-settings">
                    <div className='picture-settings'>
                        <div className='profile-picture'>
                            <img src={newDetails.userPhoto} alt='display-picture' style={{backgroundColor: "black", borderRadius: "200px",minHeight: "80%", width: "75%", display: "flex", textAlign:"center", alignItems: "center", color: "white"}}/>
                        </div>
                        <div className='operations-container'>
                            <div className='button-container-5'>
                                <motion.button
                                    className='button-12'
                                    whileHover={{scale: "1.1"}}
                                    whileTap={{scale: "0.9"}}
                                >
                                    Upload New Picture
                                </motion.button>
                            </div>
                            <div className='button-container-5'>
                                <motion.button
                                    className='button-12' id='dlt'
                                    whileHover={{scale: "1.1"}}
                                    whileTap={{scale: "0.9"}}
                                >
                                    Delete Picture
                                </motion.button>
                            </div>
                        </div>
                    </div>
                    <form className='details-settings' onSubmit={handleSubmit}>
                        <div className='ds-container' >
                           <div className='form-input'>
                                <label id='lbl'>
                                User Name: 
                                </label>
                                <input type='text' id='inp' name='userName' value={newDetails.userName} 
                                onChange={handleInputChange} />
                           </div>
                           <div className='form-input'>
                                <label id='lbl'>
                                Email Address: 
                                </label>
                                <input type='text' id='inp' name='userEmail' value={newDetails.userEmail}
                                onChange={handleInputChange}
                                />
                           </div>
                           <div className='form-input'>
                                <label id='lbl'>
                                Mobile Number: 
                                </label>
                                <input type='number' id='inp' name='userMobile' value={newDetails.userMobile}
                                onChange={handleInputChange}
                                />
                           </div>
                           <div className='form-input'>
                                <label id='lbl'>
                                Password: 
                                </label>
                                <input type='password' id='inp' name='password' value={newDetails.password} onChange={handleInputChange}/>
                           </div>
                           <div className='form-input'>
                                <label id='lbl'>
                                Confirm Password: 
                                </label>
                                <input type='password' id='inp' name='cnfPassword'  onChange={handleInputChange}/>
                           </div>
                        </div> 
                        <div className='button-container-2'>
                            <motion.button
                            className='button-13' 
                            whileHover={{scale: "1.1"}}
                            whileTap={{scale: "0.9"}}
                            onClick={handleReset}
                            type='button'
                            >
                                RESET
                            </motion.button>
                            <motion.button
                            className='button-13' id='save'
                            whileHover={{scale: "1.1"}}
                            whileTap={{scale: "0.9"}}
                            type='submit'
                            >
                                SAVE
                            </motion.button>
                        </div>
                    </form>
                    <div className='invite-container'>
                    <div className='ic-lottie-container'>
                    <Lottie options={defaultOptions} height={200} width={200} />
                    </div>
                    <input type='text' style={{width: "90%", marginLeft: "5%", fontSize: "medium", height: "7%", paddingLeft: "2%"}} placeholder="example@gmail.com"/>
                    <div className='button-container-3'>
                    <motion.button
                    className='button-14'
                    whileHover={{scale:"1.1"}}
                    whileTap={{scale: "0.9"}}
                    > Send </motion.button>
                    </div>
                    </div>
                </div>}
            </div>
        </div>
    )
}


export default Account; 