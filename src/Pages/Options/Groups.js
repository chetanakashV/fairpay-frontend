import { useState, useEffect, useContext } from "react";
import Sidebar from '../../Components/Sidebar';
import Profile from "../../Components/Profile";
import Title from '../../Components/Title';

import { SocketContext, UserContext } from "../../Helper/UserContext";
import { ToastContainer, toast } from "react-toastify";
import { AnimatePresence, motion } from "framer-motion";

import Lottie from "react-lottie";
import animationData from '../../Lotties/ChatsLoading.json';
import animationData2 from '../../Lotties/GroupsLoading.json';

import CreateGroup from '../../Components/Popup/CreateGroupPop';
import CreateExpensePop from "../../Components/Popup/CreateExpensePop";
import GroupInfoPop from "../../Components/Popup/GroupInfoPop";

import Axios from "axios";

import { Add, MoreVert, Paid, Info, Delete, Analytics, Close, Edit, Celebration } from '@mui/icons-material';
import './styles.css';
import EditGroup from "../../Components/Popup/EditGroupPop";

const Groups = () => {
    const [bar, setBar] = useState(false);

    const { client, connected } = useContext(SocketContext);
    const { user } = useContext(UserContext);
    const [sub, setSub] = useState(false);

    const [showPop, setShowPop] = useState(false);
    const [showExpensePop, setShowExpensePop] = useState(false);
    const [showGroupInfoPop, setShowGroupInfoPop] = useState(false);
    const [showEditGroupPop, setShowEditGroupPop] = useState(false);

    const [load, setLoad] = useState(true);
    const [groupLoad, setGroupLoad] = useState(false);

    const [expenses, setExpenses] = useState([]);
    const [users, setUsers] = useState([]);
    const [groupParticipants, setGroupParticipants] = useState([]);
    const [groups, setGroups] = useState([]);
    
    const [isGroupSelected, setIsGroupSelected] = useState(false);
    const [selectedGroup, setSelectedGroup] = useState([]);
    const [selectedExpense, setSelectedExpense] = useState("");
    const [recentExpense, setRecentExpense] = useState({});

    const [groupMenuOptions, setGroupMenuOptions] = useState(false);
    const [userLookup, setUserLookup] = useState({});

    const showToast = (type, text) => {
        if(type === "success") toast.success(text);
        else if(type === "error") toast.error(text);
    }

    const handleClose = () => {
        setShowPop(false);
    }

    const handleEditGroupClose = () => {
        setShowEditGroupPop(false);
    }

    const handleExpenseClose = () => {
        setShowExpensePop(false);
    }

    const handleGroupInfoClose = () => {
        setShowGroupInfoPop(false);
    }

    const handleBar = (state) => {
        setBar(state);
    }

    const handleGroupMenu = () => {
        setGroupMenuOptions(!groupMenuOptions);
    }

    const handleSelectGroup = (item) => {
        setIsGroupSelected(true);
        client.send(`/app/groupDetails/${user._id}`, {}, item.groupId);
        setGroupLoad(true);
    }

    const handleDeleteExpense = (item,e) => {
        
            setRecentExpense(item);
            Axios.post(`${process.env.REACT_APP_SERVER_URI}/expenses/deleteExpense`,
            {expenseId: item._id}).then((response) => {
        })
     
    
}

    const handleSelectExpense = (id) => {
        if(selectedExpense == id) setSelectedExpense("");
        else setSelectedExpense(id);
    }

    const fetchUserGroups = async (body) => {
        try {
            setGroups([]);
            // const tempGroups = JSON.parse(body).map(dataEl => [
            //     dataEl.groupPhoto,
            //     dataEl.groupName,
            //     dataEl.groupDescription,
            //     dataEl._id
            // ]);
            let tempGroups = [];
            JSON.parse(body).map(dataEl =>{
                tempGroups.push({
                    groupPhoto: dataEl.groupPhoto, 
                    groupName: dataEl.groupName, 
                    groupDescription: dataEl.groupDescription, 
                    groupId: dataEl._id, 
                    groupTypes: dataEl.groupType
                })
            })
            setGroups(tempGroups);
            console.table(tempGroups);
            setLoad(false);
        } catch (error) {
            console.error("Error parsing user groups:", error);
            showToast("error", "Failed to load groups.");
        }
    }

    const getMonth = (timestamp) => {
        let date = new Date(timestamp);
        let month = date.toLocaleString('en-US', { month: 'long', timeZone: 'Asia/Kolkata' });
        return month;
    }

    const getDate = (timestamp) => {
        let date = new Date(timestamp);
        let day = String(date.getDate()).padStart(2, "0");
        return day;
    }

    const getISO = (timestamp) => {
        let date = new Date(timestamp);
        return date.toISOString().split('T')[0];
    }

    const defaultOptions = {
        loop: true,
        autoplay: true,
        animationData: animationData,
        rendererSettings: {
            preserveAspectRatio: "xMidYMid slice"
        }
    };

    const defaultOptions2 = {
        loop: true,
        autoplay: true,
        animationData: animationData2,
        rendererSettings: {
            preserveAspectRatio: "xMidYMid slice"
        }
    };

    const addNewGroup = (res) => {
        const newGroup = JSON.parse(res);
        const newItem = {
            groupId: newGroup._id, 
            groupName: newGroup.groupName, 
            groupPhoto: newGroup.groupPhoto, 
            groupDescription: newGroup.groupDescription
        };

        console.table(newItem);

        setGroups((prevGroups) => {
            const groupExists = prevGroups.some(group => group.groupId === newItem.groupId);
            if (!groupExists) {
                return [...prevGroups, newItem];
            }
        });
    }

    const getGroupDetails = async (res) => {
        let group = JSON.parse(res);
        setSelectedGroup(group);
        let gmBody = JSON.parse(group.groupMembersBody); 
        setGroupParticipants(gmBody.groupParticipants);

        console.table(gmBody.groupParticipants);
        let userTemp = JSON.parse(group.groupUsersBody);
        setUsers(userTemp);
        console.log("Users:", userTemp);

        const parsedExpenses = JSON.parse(group.expensesBody).map(expense => {
            return {
                ...expense,
                transactionDate: new Date(expense.transactionDate)
            };
        });
        const sortedExpenses = parsedExpenses.sort((a, b) => b.transactionDate - a.transactionDate);
        setExpenses(sortedExpenses);
        setGroupLoad(false);
    }
  
    const getUserById = (userId) => {
        return userLookup[userId] || { userName: "not found" };
    }

    const getAmountFromExpense = (dataEl) => {
        let value = 5.5;
        dataEl.participants.forEach((element) => {
            if (element.userId === user._id) value = element.balance.toFixed(2);
        });

        return value;
    }

    const addNewExpense = async (data) => {
        let newItem = JSON.parse(data);
    
        setExpenses((prevExpenses) => {
            const newExpenses = [...prevExpenses, newItem].sort((a, b) => new Date(b.transactionDate) - new Date(a.transactionDate));
            return newExpenses;
        });
    
        
    }


    const setDeletedExpense = async (expenseId) => {

        setExpenses((prevExpenses) => prevExpenses.filter(expense => expense._id !== expenseId));
    }

    // const updateGroup = (data) => {
    //     let newItem = JSON.parse(data);

    //     let newGroup = {
    //         groupId: newItem._id, 
    //         groupName: newItem.groupName, 
    //         groupDescription: newItem.groupDescription, 
    //         groupPhoto: newItem.groupPhoto, 
    //         groupType: newItem.groupType
    //     }

    //     setGroups(prevGroups => 
    //         prevGroups.map(group => 
    //             group.groupId === newGroup.groupId ? newGroup : group
    //         )
    //     );

    //     if(isGroupSelected && selectedGroup.groupId == newGroup.groupId){ 
    //         setSelectedGroup(newGroup); console.log("selected group modified")}
    //     else {
    //         console.log("no selected group")
    //     }
    // }

    const updateGroup = (data) => {
        let newItem = JSON.parse(data);
    
        let newGroup = {
            groupId: newItem._id, 
            groupName: newItem.groupName, 
            groupDescription: newItem.groupDescription, 
            groupPhoto: newItem.groupPhoto, 
            groupType: newItem.groupType
        };
    
        setGroups(prevGroups => 
            prevGroups.map(group => 
                group.groupId === newGroup.groupId ? newGroup : group
            )
        );

        if(selectedGroup.groupId == newItem._id){
            setSelectedGroup(newGroup);
        }
    };
    
    

    useEffect(() => {
        if (users.length > 0) {
            users.forEach((dataEl) => {
                setUserLookup((prev) => ({
                    ...prev,
                    [dataEl.userId]: dataEl
                }));
            });
        }
    }, [users]);

    useEffect(() => {
        if (!groupLoad && selectedGroup && selectedGroup.expensesBody) {
            const parsedExpenses = JSON.parse(selectedGroup.expensesBody).map(expense => {
                return {
                    ...expense,
                    transactionDate: new Date(expense.transactionDate)
                };
            });
            const sortedExpenses = parsedExpenses.sort((a, b) => b.transactionDate - a.transactionDate);
            setExpenses(sortedExpenses);
        }
    }, [groupLoad, selectedGroup]);

    useEffect(() => {
        let selSub;
        if (client && connected && selectedGroup) {
            const timer = setTimeout(() => {
                selSub = client.subscribe(`/groups/selectedGroup/${selectedGroup.groupId}`,
                    (msg) => {
                        const response = JSON.parse(msg.body);
                        if (response.messageType === "newExpense") addNewExpense(response.body);
                        else if(response.messageType === "deletedExpense") 
                            setDeletedExpense(response.body)
                        else console.log(msg)
                    });
                console.log("subscribed to group " + selectedGroup.groupName);
            }, 500);

            return () => {
                clearTimeout(timer);
                if (selSub) {
                    selSub.unsubscribe();
                }
            }
        }
    }, [selectedGroup, client, connected]);

    useEffect(() => {
        var subscription;
        if (connected && client) {
            const timer = setTimeout(() => {
                subscription = client.subscribe(`/groups/${user._id}`, (msg) => {
                    const response = JSON.parse(msg.body);
                    if (response.messageType === "userGroups") fetchUserGroups(response.body);
                    else if (response.messageType === "NewGroup") addNewGroup(response.body);
                    else if (response.messageType === "groupDetails") getGroupDetails(response.body);
                    else if (response.messageType == "groupUpdated") updateGroup(response.body);
                    else console.log(response);
                });
                console.log("subscribed!!");
                setSub(true);
            }, 1000);

            return () => {
                clearTimeout(timer);
                if (subscription) {
                    subscription.unsubscribe();
                    setSub(false);
                }
            };
        }
    }, [client, connected]);

    useEffect(() => {
        if (sub) {
            client.send(`/app/getGroups/${user._id}`, {}, "");
        }
    }, [sub]);

    const handleClicks = () =>{
        if(groupMenuOptions) setGroupMenuOptions(false);
    }

    return (
        <div className="page-container" onClick={handleClicks}>
            <Sidebar option="Groups" handleBar={handleBar} />
            <Profile /> <Title title="Groups" bar={bar} />
            <AnimatePresence
                initial={false}
                mode="wait"
                onExitComplete={() => null}
            >
                {showPop && <CreateGroup handleClose={handleClose} showToast={showToast} />}
            </AnimatePresence>

            <AnimatePresence
                initial={false}
                mode="wait"
                onExitComplete={() => null}
            >
                {showExpensePop && <CreateExpensePop
                    handleClose={handleExpenseClose} showToast={showToast} selectedGroup={selectedGroup} />}
            </AnimatePresence>

            <AnimatePresence
                initial={false}
                mode="wait"
                onExitComplete={() => null}
            >
                {showEditGroupPop && <EditGroup
                    handleClose={handleEditGroupClose} groupUsers={users} 
                     selectedGroup={selectedGroup} />}
            </AnimatePresence>


            <AnimatePresence
                initial={false}
                mode="wait"
                onExitComplete={() => null}
            >
                {showGroupInfoPop && <GroupInfoPop
                    handleClose={handleGroupInfoClose} showToast = {showToast} 
                    users={groupParticipants} fetchUser = {getUserById} selectedGroup={selectedGroup}/>}
            </AnimatePresence>

            <div className={bar ? "group-container-closed" : "group-container"}>
                <div className="group-name-container">
                    <div className="group-been-in">
                        Groups you've been in
                        {!showPop && !showExpensePop && !showEditGroupPop && !showGroupInfoPop && <Add className="create-group-icon" onClick={() => setShowPop(true)} />}
                    </div>
                    <div className="group-list-container">
                        {load ?
                            <div>
                                <Lottie options={defaultOptions} height={300} width={300} />
                            </div> :
                            groups.map((dataEl) => (
                                <div className="group-element"
                                    style={selectedGroup.groupId == dataEl.groupId ? { backgroundColor: "#d8d8d8" } : { backgroundColor: "white" }}
                                    onClick={() => handleSelectGroup(dataEl)}>
                                    <div className="group-item-image" >
                                    <img src={dataEl.groupPhoto} style={{width: "100%", height: "100%"}} />
                                    </div>
                                    <div className="group-item-container">
                                        <div className="group-item-name" title={dataEl.groupName}> {dataEl.groupName} </div>
                                        <div className="group-item-description" title={dataEl.groupDescription}> {dataEl.groupDescription} </div>
                                    </div>
                                </div>
                            ))
                        }
                    </div>
                </div>
                {isGroupSelected ?
                    !groupLoad ?
                        <div className="group-main-container">
                            <div className="group-details-container">
                                <div className="group-details-heading">
                                    <div className="group-details-container1">
                                        <img src={selectedGroup.groupPhoto} height="90%" width="90%" style={{ borderRadius: "50px", border: "1px solid #d8d8d8" }} />
                                    </div>
                                    <div className="group-details-container2">
                                        <div className="group-details-container2-1">
                                            {selectedGroup.groupName}
                                        </div>
                                        <div className="group-details-container2-2">
                                            {users.length > 0 && (
                                                <div className="group-details-container2-2-1">
                                                    {users.map(user => user.userName).join(', ')}
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                    <div className="group-details-container3">
                                        <div>
                                            <MoreVert onClick={handleGroupMenu} style={{ transform: "scale(1.5)", borderRadius: "2px", cursor: "pointer" }} />
                                            {groupMenuOptions && <div className="more-verti-options">
                                                <div className="more-verti-option" onClick={() => {
                                                    setGroupMenuOptions(false);
                                                    setShowExpensePop(true);
                                                }}> <Paid /> Add Expense</div>
                                                <div className="more-verti-option" onClick={() => {setShowEditGroupPop(true);}}> <Edit/>  Edit Group</div>
                                                <div className="more-verti-option" 
                                                onClick={() => {
                                                     setShowGroupInfoPop(true);
                                                     setGroupMenuOptions(false);
                                                     }}> <Info /> Group Balances</div>
                                              
                                            </div>}
                                        </div>
                                    </div>
                                </div>
                                <div className="group-details-body">
                                    {expenses && expenses.map((dataEl) => (
                                        <div className="group-expense-element-container" style={
                                            dataEl._id == selectedExpense ? {
                                                height: "55%"
                                            }:{ }
                                        }>
                                            <div className="group-expense-element"
                                            style={dataEl._id == selectedExpense ? {
                                                height: "25%", transition: "height 0s"
                                            }: {}}
                                             onClick={() => {handleSelectExpense(dataEl._id)}} >
                                                <div className="group-expense-date" title={getISO(dataEl.transactionDate)}>
                                                    <div className="group-expense-date-month">
                                                        {getMonth(dataEl.transactionDate)}
                                                    </div>
                                                    <div className="group-expense-date-day">
                                                        {getDate(dataEl.transactionDate)}
                                                    </div>
                                                </div>
                                                <div className="group-expense-description">
                                                    {dataEl.description}
                                                </div>
                                                <div className="group-expense-paid">
                                                    <div id="cont1">
                                                        {users &&
                                                            dataEl.contributorId === user._id ? "You " :
                                                            getUserById(dataEl.contributorId).userName + " "}
                                                        paid
                                                    </div>
                                                    <div id="cont2">
                                                        ₹
                                                        {dataEl.totalAmount.toFixed(2)}
                                                    </div>
                                                </div>
                                                <div className="group-expense-lent">
                                                    <div id="cont1">
                                                        {users &&
                                                            dataEl.contributorId === user._id ? "You lent" :
                                                            "You Owe "}
                                                        
                                                    </div>
                                                    <div id="cont2" style={dataEl.contributorId === user._id ? { color: "#1cc29f" } : { color: "#ff652f" }}>
                                                        ₹
                                                        {users &&
                                                            dataEl.contributorId === user._id ?
                                                            (dataEl.totalAmount - getAmountFromExpense(dataEl)).toFixed(2) :
                                                            getAmountFromExpense(dataEl)}
                                                    </div>
                                                </div>
                                                <div className="group-expense-delete" >
                                                    <Close id="expense-delete"
                                                      onClick={(e) => handleDeleteExpense
                                                      (dataEl,e)}/>
                                                </div>
                                            </div>
                                             {dataEl._id==selectedExpense &&
                                             <div className="expense-details">
                                        

                                                {dataEl.participants.map((el) => {
                                                return(
                                                    <div className="expense-details-element">
                                                        <div  className="expense-details-element-image">
                                                    <img src={getUserById(el.userId).userPhoto} width="100%" height="100%"/>
                                                        </div>
                                                        <div
                                                        className="expense-details-element-content"
                                                     >
                                                         {el.userId == dataEl.contributorId? getUserById(el.userId).userName + " paid " + dataEl.totalAmount + " and owes " : getUserById(el.userId).userName + " owes " }
                                                         {el.balance}
                                                        </div>
                                                    </div>
                                                )
                                                })}

                                             </div>}
                                        </div>
                                    ))}

                                </div>
                            </div>
                        </div> :
                        <div className="group-main-container"
                            style={{ display: "grid", alignItems: "start", justifyContent: "center" }}>
                            <Lottie options={defaultOptions2} height={500} width={500} />
                        </div> :
                    <div className="group-main-container"></div>
                }
            </div>
        </div>
    );
}

export default Groups;
