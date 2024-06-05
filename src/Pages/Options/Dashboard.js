import React, {useState, useContext, useRef, useEffect} from 'react'
import { useNavigate } from 'react-router-dom'
import Sidebar from '../../Components/Sidebar'
import Profile from '../../Components/Profile'
import { SocketContext, UserContext } from '../../Helper/UserContext'
import Title from '../../Components/Title'

import Lottie from 'react-lottie';
import animationData from '../../Lotties/DashboardLoading.json'

import './styles.css'


const Dashboard = () => {
    const [bar, setBar] = useState(false);
    const [sub, setSub] = useState(false);
    const [load, setLoad] = useState(true);
    const groupRef = useRef(null);
    const [groupOverflow, setGroupOverflow] = useState(false);
    const [groupsOpen, setGroupsOpen] = useState(false);
    const [balance, setBalance] = useState({
        totalBalance: 0, 
        amountYouOwe: 0, 
        amountOwed: 0
    })

    const handleBar = (state) => {setBar(state);}
    const {client, connected} = useContext(SocketContext);
    const {user} = useContext(UserContext);

    const defaultOptions = {
        loop: true,
        autoplay: true,
        animationData: animationData,
        rendererSettings: {
          preserveAspectRatio: "xMidYMid slice"
        }
      };

    const checkOverflow = () => {
        if(groupRef.current){
            setGroupOverflow(groupRef.current.scrollHeight > groupRef.current.clientHeight)
        }
    }

    useEffect(() => {
        if(!load) checkOverflow();
    }, [load])
    

    useEffect(() => {
        var subscription; 
        if(connected && client){
            const timer = setTimeout(() => {

                subscription = client.subscribe(`/dashboard/${user._id}`, (msg) => {
                    const response = JSON.parse(msg.body);
                    if(response.messageType == "dashboardDetails") fetchDashboard(response);
                    console.log(msg);
                })
                setSub(true);
                console.log("subscribed")
            }, 1000)
            
            return() => {
                clearTimeout(timer);
                if(subscription){
                    subscription.unsubscribe(); 
                    setSub(false);
                }
            };
        }

    }, [client, connected])


    useEffect(() => {
        if(sub){
            client.send(`/app/getDashboard/${user._id}`, {}, "");
        }
    }, [sub])

    useEffect(() => {

    })

    const fetchDashboard = (data) => {
        const res = JSON.parse(data.body);

        setBalance({
            totalBalance: res.totalBalance, 
            amountOwed: res.amountOwed, 
            amountYouOwe: res.amountYouOwe
        })        

        setLoad(false)

    }

    return(
        <div className='page-container'>
        <Sidebar option = "Dashboard" handleBar={handleBar}/> 
        <Profile/> <Title title="Dashboard" bar = {bar}/>

            {load ? 
                
                <div className={bar? 'dashboard-main-container-closed': 'dashboard-main-container'}>
                    <Lottie
                        options={defaultOptions}
                        height={500}
                        width={500}
                    />
                </div> 
            :
            <div className={bar? 'dashboard-main-container-closed':'dashboard-main-container'}>
                
                <div className='dashboard-summary-container'>
                    <div className='dashboard-ts'> Total Summary</div>
                    <div className='dashboard-balances'>
                        <div className='dashboard-balance-container1'>
                            <div className='dashboard-balance-title'> Total Balance</div>
                            <div className='dashboard-balance-amount' 
                            style={balance.totalBalance >= 0? {
                                color: "#1cc29f"
                            } : {
                                color: "#ff6632"
                            }} >
                            {balance.totalBalance<0 ? "-" : "+"}₹
                            {Math.abs(balance.totalBalance).toFixed(2)}
                            </div>
                        </div>
                        <div className='dashboard-balance-container2'>
                            <div className='dashboard-balance-title'> Total Amount You Owe</div>
                            <div className='dashboard-balance-amount' 
                            style={balance.amountYouOwe>0 ? {color: "#ff6632"} : {}}>₹
                            {balance.amountYouOwe.toFixed(2)}</div>
                        </div>
                        <div className='dashboard-balance-container3'>
                            <div className='dashboard-balance-title'> Total Amount You're Owed</div>
                            <div className='dashboard-balance-amount' 
                            style={balance.amountYouOwe>0 ? {color: "#1cc29f"} : {}}>₹
                            {balance.amountOwed.toFixed(2)}</div>
                        </div>
                    </div>
                </div>

                <div className='dashboard-group-summary-container' 
                style={groupsOpen? {height:"fit-content"}: {}}>
                    <div className='dashboard-gs'>Group Summary</div>
                    <div className='dashboard-groups-container' 
                style={groupsOpen? {height:"fit-content"}: {}} ref={groupRef}>
                       
                    </div>
                    {groupOverflow &&
                     <div className='dashboard-groups-va' onClick={() => {setGroupsOpen(!groupsOpen)}}>
                        {groupsOpen? "Hide all":"View all"}
                    </div>}
                </div>

            </div>}

        </div>
    )
}

export default Dashboard; 