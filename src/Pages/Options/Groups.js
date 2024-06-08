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

import Axios from "axios";

import { Add, MoreVert, Paid, Info, Delete, Analytics, Close } from '@mui/icons-material';
import './styles.css';

const Groups = () => {
    const [bar, setBar] = useState(false);

    const { client, connected } = useContext(SocketContext);
    const { user } = useContext(UserContext);
    const [sub, setSub] = useState(false);

    const [showPop, setShowPop] = useState(false);
    const [showExpensePop, setShowExpensePop] = useState(false);
    const [load, setLoad] = useState(true);
    const [groupLoad, setGroupLoad] = useState(false);

    const [expenses, setExpenses] = useState([]);
    const [users, setUsers] = useState([]);
    const [groups, setGroups] = useState([]);
    
    const [isGroupSelected, setIsGroupSelected] = useState(false);
    const [selectedGroup, setSelectedGroup] = useState([]);

    const [groupMenu, setGroupMenu] = useState(false);
    const [groupMenuOptions, setGroupMenuOptions] = useState(false);
    const [userLookup, setUserLookup] = useState({});

    const showToast = (type, text) => {
        if(type === "success") toast.success(text);
        else if(type === "error") toast.error(text);
    }

    const handleClose = () => {
        setShowPop(false);
    }

    const handleExpenseClose = () => {
        setShowExpensePop(false);
    }

    const handleBar = (state) => {
        setBar(state);
    }

    const handleGroupMenu = () => {
        setGroupMenuOptions(!groupMenuOptions);
    }

    const handleSelectGroup = (item) => {
        setIsGroupSelected(true);
        client.send(`/app/groupDetails/${user._id}`, {}, item[3]);
        setGroupLoad(true);
    }

    const handleDeleteExpense = (item) => {
        Axios.post(`${process.env.REACT_APP_SERVER_URI}/expenses/deleteExpense`,
            {expenseId: item}).then((response) => {
        })
    }

    const fetchUserGroups = async (body) => {
        try {
            setGroups([]);
            const tempGroups = JSON.parse(body).map(dataEl => [
                dataEl.groupPhoto,
                dataEl.groupName,
                dataEl.groupDescription,
                dataEl._id
            ]);
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
        const newItem = [newGroup.groupPhoto, newGroup.groupName, newGroup.groupDescription, newGroup._id];
        console.table(newItem);

        setGroups((prevGroups) => {
            const groupExists = prevGroups.some(group => group[3] === newItem[3]);
            if (!groupExists) {
                return [...prevGroups, newItem];
            }
        });
    }

    const getGroupDetails = async (res) => {
        let group = JSON.parse(res);
        setSelectedGroup(group);
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
        console.log(data);
        setExpenses((prevExpenses) => {
            const newExpenses = [...prevExpenses, newItem].sort((a, b) => new Date(b.transactionDate) - new Date(a.transactionDate));
            return newExpenses;
        });
    }

    const setDeletedExpense = (expenseId) => {
        setExpenses((prevExpenses) => prevExpenses.filter(expense => expense._id !== expenseId));
    }

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

    return (
        <div className="page-container">
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

            <div className={bar ? "group-container-closed" : "group-container"}>
                <div className="group-name-container">
                    <div className="group-been-in">
                        Groups you've been in
                        {!showPop && !showExpensePop && <Add className="create-group-icon" onClick={() => setShowPop(true)} />}
                    </div>
                    <div className="group-list-container">
                        {load ?
                            <div>
                                <Lottie options={defaultOptions} height={300} width={300} />
                            </div> :
                            groups.map((dataEl) => (
                                <div className="group-element"
                                    style={selectedGroup.groupId === dataEl[3] ? { backgroundColor: "#d8d8d8" } : { backgroundColor: "white" }}
                                    onClick={() => handleSelectGroup(dataEl)}>
                                    <img src={dataEl[0]} className="group-item-image" />
                                    <div className="group-item-container">
                                        <div className="group-item-name" title={dataEl[1]}> {dataEl[1]} </div>
                                        <div className="group-item-description" title={dataEl[2]}> {dataEl[2]} </div>
                                    </div>
                                </div>
                            ))
                        }
                    </div>
                </div>
                {isGroupSelected ?
                    !groupLoad ?
                        <div className="group-main-container">
                            <div className={groupMenu ? "group-details-container-closed" : "group-details-container"}>
                                <div className="group-details-heading">
                                    <div className="group-details-container1">
                                        <img src={selectedGroup.groupPhoto} height="80%" style={{ borderRadius: "50px" }} />
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
                                                <div className="more-verti-option"> <Info /> Group Info</div>
                                                <div className="more-verti-option"> <Analytics /> Group Summary</div>
                                            </div>}
                                        </div>
                                    </div>
                                </div>
                                <div className="group-details-body">
                                    {expenses && expenses.map((dataEl) => (
                                        <div className="group-expense-element-container">
                                            <div className="group-expense-element" title={getISO(dataEl.transactionDate)}>
                                                <div className="group-expense-date">
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
                                                            dataEl.contributorId === user._id ? "You " :
                                                            getUserById(dataEl.contributorId).userName + " "}
                                                        lent
                                                    </div>
                                                    <div id="cont2" style={dataEl.contributorId === user._id ? { color: "#1cc29f" } : { color: "#ff652f" }}>
                                                        ₹
                                                        {users &&
                                                            dataEl.contributorId === user._id ?
                                                            (dataEl.totalAmount - getAmountFromExpense(dataEl)).toFixed(2) :
                                                            getAmountFromExpense(dataEl)}
                                                    </div>
                                                </div>
                                                <div className="group-expense-delete">
                                                    <Close
                                                      onClick={() => handleDeleteExpense
                                                      (dataEl._id)}/>
                                                </div>
                                            </div>
                                        </div>
                                    ))}

                                </div>
                            </div>
                            {groupMenu && <div className="group-menu-container">
                            </div>}
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
