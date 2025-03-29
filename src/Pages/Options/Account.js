import {useState, useContext, useEffect, useCallback, memo} from 'react'
import Sidebar from '../../Components/Sidebar'
import Profile from '../../Components/Profile';
import { ToastContainer, toast } from 'react-toastify';
import { UserContext } from '../../Helper/UserContext';
import {motion} from 'framer-motion'
import animationData from '../../Lotties/Invite.json'
import Title from '../../Components/Title'
import Lottie from 'react-lottie';
import Axios from 'axios';
import { invitation } from '../../Assets/Templates';
import './styles.css'

// Memoized form input component
const FormInput = memo(({ label, type, name, value, onChange }) => (
    <div className='form-input'>
        <label id='lbl'>{label}</label>
        <input 
            type={type} 
            id='inp' 
            name={name} 
            value={value}
            onChange={onChange}
            autoComplete={type === 'password' ? 'new-password' : 'off'}
        />
    </div>
));

// Password change component
const PasswordChange = memo(({ password, cnfPassword, onChange, onCancel }) => (
    <div className='password-change-container'>
        <div className='password-fields'>
            <FormInput 
                label="New Password"
                type="password"
                name="password"
                value={password}
                onChange={onChange}
            />
            <FormInput 
                label="Confirm New Password"
                type="password"
                name="cnfPassword"
                value={cnfPassword}
                onChange={onChange}
            />
        </div>
        <div className='button-container-2'>
            <motion.button
                className='button-13'
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={onCancel}
                type='button'
            >
                Cancel
            </motion.button>
        </div>
    </div>
));

const Account = () => {
    const [bar, setBar] = useState(false);
    const {user, setUser, loading} = useContext(UserContext);
    const [load, setLoad] = useState(true);
    const [reset, setReset] = useState(false);
    const [showPasswordChange, setShowPasswordChange] = useState(false);
    const [showInvite, setShowInvite] = useState(false);
    const [newDetails, setNewDetails] = useState({
        userName: "", 
        userEmail: "",
        userMobile: "",
        userPhoto: "", 
        password: "", 
        cnfPassword: ""
    });
    const [inviteEmail, setInviteEmail] = useState("");
    const [selectedFile, setSelectedFile] = useState(null);
    const [isSubmitting, setIsSubmitting] = useState(false);
        
    const defaultOptions = {
        loop: true,
        autoplay: true,
        animationData: animationData,
        rendererSettings: {
            preserveAspectRatio: "xMidYMid slice"
        }
    };

    const handleInputChange = useCallback((e) => {
        const {name, value, type} = e.target;
        setNewDetails(prev => ({
            ...prev,
            [name]: type === "number" ? Number(value) : value
        }));
    }, []);

    const handleReset = useCallback(() => {
        setReset(prev => !prev);
    }, []);

    const checkPassword = useCallback((str) => {
        const re = /^(?=.*\d)(?=.*[!@#$%^&*])(?=.*[a-z])(?=.*[A-Z]).{8,}$/;
        return re.test(str);
    }, []);

    const handleFileChange = useCallback((event) => {
        const file = event.target.files[0];
        if (file && file.type.startsWith('image/')) {
            setSelectedFile(file);
        } else {
            toast.error('Please select a valid image file');
        }
    }, []);

    const handleDeleteImage = useCallback(() => {
        setNewDetails(prev => ({
            ...prev,
            userPhoto: user?.imageUrl || ''
        }));
    }, [user?.imageUrl]);

    useEffect(() => {
        const handleFileUpload = async () => {
            if (!selectedFile) return;

            const formData = new FormData();
            formData.append('image', selectedFile);

            try {
                const response = await Axios.post(
                    `https://api.imgbb.com/1/upload?key=${process.env.REACT_APP_IMAGE_API}`, 
                    formData
                );

                if (response.data.success) {
                    setNewDetails(prev => ({
                        ...prev,
                        userPhoto: response.data.data.url
                    }));
                    toast.success('Image uploaded successfully!');
                } else {
                    toast.error('Failed to upload image');
                }
            } catch (error) {
                toast.error('An error occurred while uploading the image');
                console.error('Image upload error:', error);
            }
        };

        handleFileUpload();
    }, [selectedFile]);

    useEffect(() => {
        if (user) {
            setNewDetails({
                userName: user.userName || '', 
                userEmail: user.userEmail || '', 
                userMobile: user.userMobile || '', 
                userPhoto: user.imageUrl || '',
                password: '', 
                cnfPassword: ''
            });
            setLoad(false);
        }
    }, [user, reset]);

    const handleBar = useCallback((state) => {
        setBar(state);
    }, []);

    const handleInvitation = useCallback(async () => {
        if (!/^([a-zA-Z0-9._%-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,})$/.test(inviteEmail)) {
            toast.error("Please enter a valid email address");
            return;
        }

        const email = inviteEmail;
        const subject = "Join Me on FairPay";
        const body = invitation + user?.userName;
        const mailtoLink = `mailto:${email}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}"`;

        window.location.href = mailtoLink;
    }, [inviteEmail, user?.userName]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        
        if (isSubmitting) return;
        
        if (newDetails.password && !checkPassword(newDetails.password)) {
            toast.error("Password must contain at least 8 characters, including uppercase, lowercase, number and special character");
            return;
        }
        
        if (newDetails.password !== newDetails.cnfPassword) {
            toast.error("Passwords do not match");
            return;
        }

        setIsSubmitting(true);

        try {
            const response = await Axios.post(`${process.env.REACT_APP_SERVER_URI}/users/updateUser`, {
                userId: user._id,
                userName: newDetails.userName,
                userEmail: newDetails.userEmail,
                userMobile: newDetails.userMobile,
                password: newDetails.password || "dontChange",
                userPhoto: newDetails.userPhoto
            });

            if (response.data.status === 200) {
                toast.success("Changes saved successfully!");
                setUser(prev => ({
                    ...prev,
                    userName: newDetails.userName,
                    userMobile: newDetails.userMobile,
                    userEmail: newDetails.userEmail,
                    imageUrl: newDetails.userPhoto
                }));
            } else {
                toast.error(response.data.message || 'Failed to update profile');
            }
        } catch (error) {
            toast.error('An error occurred while updating your profile');
            console.error('Profile update error:', error);
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleInviteChange = useCallback((e) => {
        setInviteEmail(e.target.value);
    }, []);

    if (loading || load) {
        return (
            <div className='page-container'>
                <Sidebar option="Account" handleBar={handleBar}/>
                <Profile/> 
                <Title title="Account" bar={bar}/>
                <div className={bar ? "account-container-closed" : "account-container"}>
                    <div style={{ 
                        height: '100%', 
                        display: 'flex', 
                        justifyContent: 'center', 
                        alignItems: 'center' 
                    }}>
                        <Lottie 
                            options={defaultOptions}
                            height={200}
                            width={200}
                            isClickToPauseDisabled={true}
                        />
                    </div>
                </div>
            </div>
        );
    }

    return(
        <div className='page-container'>
            <Sidebar option="Account" handleBar={handleBar}/>
            <Profile/> 
            <Title title="Account" bar={bar}/>
            <ToastContainer position="top-right" autoClose={3000} />
            <div className={bar ? "account-container-closed" : "account-container"}>
                <div className="profile-settings">
                    <div className="profile-content">
                        <div className='picture-settings'>
                            <div className='profile-picture'>
                                <motion.img 
                                    src={newDetails.userPhoto} 
                                    alt='Profile' 
                                    initial={{ scale: 0.9 }}
                                    animate={{ scale: 1 }}
                                    whileHover={{ scale: 1.05 }}
                                    transition={{ duration: 0.2 }}
                                />
                            </div>
                            <div className='operations-container'>
                                <input 
                                    type="file" 
                                    onChange={handleFileChange} 
                                    accept="image/*"
                                    style={{ display: 'none' }} 
                                    id="fileInput" 
                                />
                                <motion.button
                                    className='button-12'
                                    whileHover={{ scale: 1.02 }}
                                    whileTap={{ scale: 0.98 }}
                                    onClick={() => document.getElementById('fileInput').click()}
                                >
                                    Upload New Picture
                                </motion.button>
                                <motion.button
                                    className='button-12' 
                                    id='dlt'
                                    whileHover={{ scale: 1.02 }}
                                    whileTap={{ scale: 0.98 }}
                                    onClick={handleDeleteImage}
                                >
                                    Delete Picture
                                </motion.button>
                                <motion.button
                                    className='button-12'
                                    id='invite'
                                    whileHover={{ scale: 1.02 }}
                                    whileTap={{ scale: 0.98 }}
                                    onClick={() => {
                                        setShowInvite(true);
                                        setTimeout(() => {
                                            const inviteSection = document.getElementById('invite-section');
                                            if (inviteSection) {
                                                inviteSection.scrollIntoView({ behavior: 'smooth' });
                                            }
                                        }, 100);
                                    }}
                                >
                                    <span>👋</span> Invite Friends
                                </motion.button>
                            </div>
                        </div>
                        <div className='details-settings'>
                            <form className='ds-container' onSubmit={handleSubmit}>
                                <FormInput 
                                    label="Full Name"
                                    type="text"
                                    name="userName"
                                    value={newDetails.userName}
                                    onChange={handleInputChange}
                                />
                                <FormInput 
                                    label="Email Address"
                                    type="email"
                                    name="userEmail"
                                    value={newDetails.userEmail}
                                    onChange={handleInputChange}
                                />
                                <FormInput 
                                    label="Mobile Number"
                                    type="number"
                                    name="userMobile"
                                    value={newDetails.userMobile}
                                    onChange={handleInputChange}
                                />
                                <div className='password-section'>
                                    {!showPasswordChange ? (
                                        <motion.button
                                            type="button"
                                            className='button-change-password'
                                            onClick={() => setShowPasswordChange(true)}
                                            whileHover={{ scale: 1.02 }}
                                            whileTap={{ scale: 0.98 }}
                                        >
                                            Change Password
                                        </motion.button>
                                    ) : (
                                        <PasswordChange 
                                            password={newDetails.password}
                                            cnfPassword={newDetails.cnfPassword}
                                            onChange={handleInputChange}
                                            onCancel={() => {
                                                setShowPasswordChange(false);
                                                setNewDetails(prev => ({
                                                    ...prev,
                                                    password: '',
                                                    cnfPassword: ''
                                                }));
                                            }}
                                        />
                                    )}
                                </div>
                                <div className='button-container-2'>
                                    <motion.button
                                        className='button-13'
                                        whileHover={{ scale: 1.02 }}
                                        whileTap={{ scale: 0.98 }}
                                        onClick={handleReset}
                                        type='button'
                                        disabled={isSubmitting}
                                    >
                                        Reset
                                    </motion.button>
                                    <motion.button
                                        className='button-13' 
                                        id='save'
                                        whileHover={{ scale: 1.02 }}
                                        whileTap={{ scale: 0.98 }}
                                        type='submit'
                                        disabled={isSubmitting}
                                    >
                                        {isSubmitting ? 'Saving...' : 'Save Changes'}
                                    </motion.button>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
                {showInvite && (
                    <motion.div 
                        id="invite-section"
                        className='invite-section'
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.3 }}
                    >
                        <h2>Invite Friends</h2>
                        <p>Share FairPay with your friends and make group expenses easier</p>
                        <div className='invite-input-container'>
                            <input 
                                type='email'
                                placeholder="Enter friend's email address"
                                value={inviteEmail}
                                onChange={handleInviteChange}
                            />
                            <motion.button
                                className='button-14'
                                onClick={handleInvitation}
                                whileHover={{ scale: 1.02 }}
                                whileTap={{ scale: 0.98 }}
                            >
                                Send Invite
                            </motion.button>
                        </div>
                    </motion.div>
                )}
            </div>
        </div>
    );
};

export default memo(Account); 