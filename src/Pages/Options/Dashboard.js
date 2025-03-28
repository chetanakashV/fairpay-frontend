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

    const [groupFilter, setGroupFilter] = useState('all');

    const handleBar = setBar;
    const {client, connected} = useContext(SocketContext);
    const {user} = useContext(UserContext);

    const defaultOptions = {
        loop: true,
        autoplay: true,
        animationData: animationData,
        rendererSettings: {
          preserveAspectRatio: "xMidYMid meet"
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
        let retryTimeout, timer;
    
        const subscribe = () => {
            if (connected && client) {
                const timer = setTimeout(() =>{
                    subscription = client.subscribe(`/dashboard/${user._id}`, (msg) => {
                        try {
                            const response = JSON.parse(msg.body);
                            if (response.messageType === "dashboardDetails") {
                                fetchDashboard(response);
                            }
                            console.log(msg);
                        } catch (error) {
                            console.error("Error parsing message:", error);
                        }
                    });
                    
                    setSub(true);
                    console.log("Subscribed");
                }, 2000)
            }
        };
    
        const retrySubscription = () => {
            retryTimeout = setTimeout(() => {
                console.log("Retrying subscription...");
                subscribe();
            }, 2000);
        };
    
        if (connected && client) {
            subscribe();
        } else {
            retrySubscription();
        }
    
        return () => {
            clearTimeout(retryTimeout);
            clearTimeout(timer);
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
            if(element.groupBalance === 0){
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

    const formatCurrency = (amount) => {
        return new Intl.NumberFormat('en-IN', {
            style: 'currency',
            currency: 'INR',
            minimumFractionDigits: 2,
            maximumFractionDigits: 2
        }).format(Math.abs(amount)).replace('₹', '')
    }

    const getBalanceColor = (amount) => {
        if (amount > 0) return "#1cc29f"
        if (amount < 0) return "#ff6632"
        return "#636e72"
    }

    const renderBalanceCard = (title, amount, icon) => (
        <div className='dashboard-balance-container1'>
            <div className='dashboard-balance-title'>
                {title}
            </div>
            <div 
                className='dashboard-balance-amount' 
                style={{ color: getBalanceColor(amount) }}
            >
                {amount < 0 ? "-" : amount > 0 ? "+" : ""}₹{formatCurrency(amount)}
            </div>
        </div>
    )

    const renderGroupElement = (group) => (
        <div className='dashboard-group-element' key={group.id}>
            <div className='dashboard-group-element-image'>
                <img 
                    src={group.groupPhoto} 
                    alt={group.groupName}
                    style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                />
            </div>
            <div className='dashboard-group-element-name'>
                {group.groupName}
            </div>
            <div 
                className='dashboard-group-element-amount'
                style={{ color: getBalanceColor(group.groupBalance) }}
            >
                ₹{formatCurrency(Math.abs(group.groupBalance))}
            </div>
        </div>
    )

    const renderGroupSection = (title, groups) => (
        <div className='dashboard-group-container1'>
            <div className='dashboard-group-container-title'>
                {title}
            </div>
            <div className='dashboard-group-container-body'>
                {groups && groups.map(renderGroupElement)}
                {groups && groups.length === 0 && (
                    <div style={{ 
                        textAlign: 'center', 
                        color: '#636e72', 
                        marginTop: '20px',
                        fontSize: '0.9rem'
                    }}>
                        No groups to display
                    </div>
                )}
            </div>
        </div>
    )

    const getFilteredGroups = () => {
        switch(groupFilter) {
            case 'owe':
                return [{
                    title: "Groups You Owe",
                    groups: groups1
                }];
            case 'owed':
                return [{
                    title: "Groups Owe to You",
                    groups: groups2
                }];
            default:
                return [
                    {
                        title: "Groups You Owe",
                        groups: groups1
                    },
                    {
                        title: "Groups Owe to You",
                        groups: groups2
                    },
                    {
                        title: "Settled Up Groups",
                        groups: groups3
                    }
                ];
        }
    }

    const isFilterActive = () => groupFilter !== 'all';

    const renderGroupFilter = () => (
        <div className="dashboard-group-filter">
            <button 
                className={`filter-button ${groupFilter === 'all' ? 'active' : ''}`}
                onClick={() => setGroupFilter('all')}
            >
                All Groups
            </button>
            <button 
                className={`filter-button ${groupFilter === 'owe' ? 'active' : ''}`}
                onClick={() => setGroupFilter('owe')}
            >
                You Owe
            </button>
            <button 
                className={`filter-button ${groupFilter === 'owed' ? 'active' : ''}`}
                onClick={() => setGroupFilter('owed')}
            >
                You're Owed
            </button>
        </div>
    )

    return(
        <div className='page-container'>
            <Sidebar option="Dashboard" handleBar={handleBar}/> 
            <Profile/> 
            <Title title="Dashboard" bar={bar}/>

            {load ? (
                <div className={bar? 'dashboard-main-container-closed': 'dashboard-main-container'} 
                     style={{height: "100vh", width: "100vw", display: 'flex', justifyContent: 'center', alignItems: 'center'}}>
                    <Lottie
                        options={defaultOptions}
                        height={600}
                        width={600}
                        isClickToPauseDisabled={true}
                    />
                </div> 
            ) : (
                <div className={bar? 'dashboard-main-container-closed':'dashboard-main-container'}>
                    <div className='dashboard-summary-container'>
                        <div className='dashboard-ts'> Total Summary</div>
                        <div className='dashboard-balances'>
                            {renderBalanceCard("Total Balance", balance.totalBalance)}
                            {renderBalanceCard("Total Amount You Owe", -balance.amountYouOwe)}
                            {renderBalanceCard("Total Amount You're Owed", balance.amountOwed)}
                        </div>
                    </div>

                    <div className='dashboard-group-summary-container'>
                        <div className="dashboard-group-header">
                            <div className='dashboard-gs'>Group Summary</div>
                            {renderGroupFilter()}
                        </div>
                        <div className={`dashboard-groups-container ${isFilterActive() ? 'single-column' : ''}`} 
                             ref={groupRef}>
                            {getFilteredGroups().map(({title, groups}) => 
                                renderGroupSection(title, groups)
                            )}
                        </div>
                    </div>
                </div>
            )}
        </div>
    )
}

export default Dashboard; 