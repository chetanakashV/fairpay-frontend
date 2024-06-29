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

    const [groups1, setGroups1] = useState([])
    const [groups2, setGroups2] = useState([])
    const [groups3, setGroups3] = useState([])

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
        let subscription;
        let retryTimeout;

        const subscribe = () => {
            if (connected && client) {
                subscription = client.subscribe(`/dashboard/${user._id}`, (msg) => {
                    const response = JSON.parse(msg.body);
                    if (response.messageType === "dashboardDetails") {
                        fetchDashboard(response);
                    }
                    console.log(msg);
                });

                setSub(true);
                console.log("Subscribed");
            }
        };

        const retrySubscription = () => {
            retryTimeout = setTimeout(() => {
                console.log("Retrying subscription...");
                subscribe();
            }, 10000); // Retry after 10 seconds
        };

        if (connected && client) {
            subscribe();
        } else {
            retrySubscription();
        }

        return () => {
            clearTimeout(retryTimeout);
            if (subscription) {
                subscription.unsubscribe();
                setSub(false);
            }
        };
    }, [client, connected]);


    useEffect(() => {
        if(sub && client && connected){
           try{
            client.send(`/app/getDashboard/${user._id}`, {}, "");
           }
           catch(e){
            console.log(e);
           }
        }
    }, [sub])

    useEffect(() => {

    })

    const fetchDashboard = async (data) => {
        const res = JSON.parse(data.body);

        setBalance({
            totalBalance: res.totalBalance, 
            amountOwed: res.amountOwed, 
            amountYouOwe: res.amountYouOwe
        })        

        console.log(res.groups)
        
        let tempGroups = [[],[],[]];

        await res.groups.forEach(element => {
            if(element.groupBalance == 0){
                tempGroups[2].push(element);
            }
            else if(element.groupBalance > 0){
                tempGroups[1].push(element);
            }
            else {
                tempGroups[0].push(element);
            }
        });

        setGroups1(tempGroups[0]);
        setGroups2(tempGroups[1]);
        setGroups3(tempGroups[2]);

        setLoad(false)

    }

    return(
        <div className='page-container'>
        <Sidebar option = "Dashboard" handleBar={handleBar}/> 
        <Profile/> <Title title="Dashboard" bar = {bar}/>

            {load ? 
                
                <div className={bar? 'dashboard-main-container-closed': 'dashboard-main-container'} >
                    <Lottie
                        options={defaultOptions}
                        height={500}
                        width={500}
                        isClickToPauseDisabled={true}
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
                            style={balance.totalBalance > 0? {
                                color: "#1cc29f"
                            } :
                            balance.totalBalance<0 ? {
                                color: "#ff6632"
                            } :
                            {

                            }
                            } >
                            {balance.totalBalance<0 ? "-" : balance.totalBalance>0? "+": ""}₹
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
                            style={balance.amountOwed>0 ? {color: "#1cc29f"} : {}}>₹
                            {balance.amountOwed.toFixed(2)}</div>
                        </div>
                    </div>
                </div>

                <div className='dashboard-group-summary-container'  
                style={groupsOpen? {height:"auto"}: {height:"55%", overflow:"hidden"}}
                >
                    <div className='dashboard-gs'>Group Summary</div>
                    <div className='dashboard-groups-container' 
                    // style={groupsOpen? {height:""}: {}}
                ref={groupRef}>

                     <div className='dashboard-group-container1' 
                     onClick={() => {console.log(groups1);}}
                        >
                            <div className='dashboard-group-container-title'>
                                Groups You Owe
                            </div>
                            <div className='dashboard-group-container-body'>
                                {groups1 && groups1.map((dataEl) => {
                                    return(
                                        <div className='dashboard-group-element'>
                                            <div className='dashboard-group-element-image'>
                                                <img src = {dataEl.groupPhoto} width="100%" height="100%"/>
                                            </div>
                                            <div className='dashboard-group-element-name'>
                                                {dataEl.groupName} 
                                            </div>
                                            <div className='dashboard-group-element-amount'>
                                            ₹{(-1*dataEl.groupBalance).toFixed(2)}
                                            </div>
                                        </div>
                                    )
                                })}
                            </div>
                     </div>
                     <div className='dashboard-group-container2'
                     onClick={() => {console.log( groups2);}}>
                            <div className='dashboard-group-container-title'>
                                Groups Owe to You
                            </div>
                            <div className='dashboard-group-container-body'>
                                {groups2 && groups2.map((dataEl) =>{
                                    return(
                                        <div className='dashboard-group-element'>
                                            <div className='dashboard-group-element-image'>
                                                <img src = {dataEl.groupPhoto} width="100%" height="100%"/>
                                            </div>
                                            <div className='dashboard-group-element-name'>
                                                {dataEl.groupName}
                                            </div>
                                            <div className='dashboard-group-element-amount'>
                                            ₹{dataEl.groupBalance.toFixed(2)}
                                            </div>
                                        </div>
                                    )
                                })}
                            </div>

                     </div>
                     <div className='dashboard-group-container3'
                     onClick={() => {console.log( groups3);}}>
                            <div className='dashboard-group-container-title'>
                                Settled Up Groups
                            </div>
                            <div className='dashboard-group-container-body'>
                                {groups3 && groups3.map((dataEl) => {
                                    return(
                                        <div className='dashboard-group-element'>
                                            <div className='dashboard-group-element-image'>
                                                <img src = {dataEl.groupPhoto} width="100%" height="97%"/>
                                            </div>
                                            <div className='dashboard-group-element-name'>
                                                {dataEl.groupName}
                                            </div>
                                            <div className='dashboard-group-element-amount'>
                                            {/* ₹{dataEl.groupBalance.toFixed(2)} */}
                                            </div>
                                        </div>
                                    )
                                })}
                            </div>

                     </div>

                    </div>
                </div>

            </div>}

        </div>
    )
}

export default Dashboard; 