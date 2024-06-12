import Backdrop from "../Backdrop";
import { motion } from "framer-motion";
import OtpPop from "./OtpPop";
import { ToastContainer, toast } from "react-toastify";
import './styles.css'

const Pop = ({handleClose,mail, setOtpVerified, type }) => {

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
        <Backdrop onClick={handleClose}>
        <motion.div className="Pop"
        onClick={(e) => e.stopPropagation()}
        variants={dropIn}
        initial="hidden"
        animate="visible"
        exit="exit"
        drag
        >
         <OtpPop handleClose={handleClose} setOtpVerified = {setOtpVerified} mail={mail} showSuccessToast = {showSuccessToast}/>
        </motion.div>
        </Backdrop>
    )
}

export default Pop; 