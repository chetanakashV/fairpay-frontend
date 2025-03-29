import React, {useContext, useEffect, useState, useCallback, memo, useRef} from "react";
import Sidebar from '../../Components/Sidebar'
import Profile from "../../Components/Profile";
import Title from '../../Components/Title';
import { SocketContext, UserContext } from "../../Helper/UserContext";
import animationData from '../../Lotties/ActivityLoading.json'
import Lottie from "react-lottie";
import { motion, AnimatePresence } from "framer-motion";
import { 
    Paid, Group, Person, Receipt,
    AddCircle, RemoveCircle, Edit,
    GroupAdd, GroupRemove, 
    PersonAdd, PersonRemove,
    AddCard, BlockOutlined
} from '@mui/icons-material';
import './styles.css'

const defaultOptions = {
    loop: true,
    autoplay: true,
    animationData: animationData,
    rendererSettings: {
        preserveAspectRatio: "xMidYMid slice"
    }
};

// Memoized activity item component for better performance
const ActivityItem = memo(({ activity, index }) => {
    const getActivityIconAndColor = (name) => {
        const lowerName = name.toLowerCase();
        
        // Expense related activities
        if (lowerName.includes('expense')) {
            if (lowerName.includes('added') || lowerName.includes('created')) {
                return { icon: <AddCard />, color: '#1cc29f' };
            }
            if (lowerName.includes('deleted') || lowerName.includes('removed')) {
                return { icon: <BlockOutlined />, color: '#ff652f' };
            }
            if (lowerName.includes('updated') || lowerName.includes('modified')) {
                return { icon: <Edit />, color: '#ffd93d' };
            }
            return { icon: <Paid />, color: '#1cc29f' };
        }
        
        // Group related activities
        if (lowerName.includes('group')) {
            if (lowerName.includes('added') || lowerName.includes('created') || lowerName.includes('joined')) {
                return { icon: <GroupAdd />, color: '#1cc29f' };
            }
            if (lowerName.includes('deleted') || lowerName.includes('removed') || lowerName.includes('left')) {
                return { icon: <GroupRemove />, color: '#ff652f' };
            }
            if (lowerName.includes('updated') || lowerName.includes('modified')) {
                return { icon: <Edit />, color: '#ffd93d' };
            }
            return { icon: <Group />, color: '#1cc29f' };
        }
        
        // Friend related activities
        if (lowerName.includes('friend')) {
            if (lowerName.includes('added') || lowerName.includes('request') || lowerName.includes('accepted')) {
                return { icon: <PersonAdd />, color: '#1cc29f' };
            }
            if (lowerName.includes('deleted') || lowerName.includes('removed') || lowerName.includes('rejected')) {
                return { icon: <PersonRemove />, color: '#ff652f' };
            }
            if (lowerName.includes('updated')) {
                return { icon: <Edit />, color: '#ffd93d' };
            }
            return { icon: <Person />, color: '#1cc29f' };
        }

        // Generic add/remove/update activities
        if (lowerName.includes('added') || lowerName.includes('created')) {
            return { icon: <AddCircle />, color: '#1cc29f' };
        }
        if (lowerName.includes('deleted') || lowerName.includes('removed')) {
            return { icon: <RemoveCircle />, color: '#ff652f' };
        }
        if (lowerName.includes('updated') || lowerName.includes('modified')) {
            return { icon: <Edit />, color: '#ffd93d' };
        }

        // Default
        return { icon: <Receipt />, color: '#1cc29f' };
    };

    const { icon, color } = getActivityIconAndColor(activity.name);

    return (
        <motion.div 
            className="activity-element"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: index * 0.05 }}
        >
            <div className="activity-icon" style={{ color: color }}>
                {icon}
            </div>
            <div className="activity-content">
                <div className="activity-name">{activity.name}</div>
                <div className="activity-date">{formatDate(activity.date)}</div>
            </div>
        </motion.div>
    );
});

const formatDate = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffTime = now - date;
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
    const diffHours = Math.floor(diffTime / (1000 * 60 * 60));
    const diffMinutes = Math.floor(diffTime / (1000 * 60));

    // For activities less than 1 minute ago
    if (diffMinutes < 1) {
        return 'Just now';
    }

    // For activities less than 1 hour ago
    if (diffHours < 1) {
        return `${diffMinutes} ${diffMinutes === 1 ? 'minute' : 'minutes'} ago`;
    }

    // For activities less than 24 hours ago
    if (diffDays < 1) {
        return `${diffHours} ${diffHours === 1 ? 'hour' : 'hours'} ago`;
    }

    // For activities from yesterday
    if (diffDays === 1) {
        return `Yesterday at ${date.toLocaleTimeString('en-US', { 
            hour: 'numeric', 
            minute: '2-digit',
            hour12: true 
        })}`;
    }

    // For activities less than 7 days ago
    if (diffDays < 7) {
        return `${diffDays} days ago at ${date.toLocaleTimeString('en-US', { 
            hour: 'numeric', 
            minute: '2-digit',
            hour12: true 
        })}`;
    }

    // For activities in the current year
    if (date.getFullYear() === now.getFullYear()) {
        return date.toLocaleDateString('en-US', { 
            month: 'short',
            day: 'numeric',
            hour: 'numeric',
            minute: '2-digit',
            hour12: true
        });
    }

    // For older activities
    return date.toLocaleDateString('en-US', { 
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: 'numeric',
        minute: '2-digit',
        hour12: true
    });
};

const Activity = () => {
    const [bar, setBar] = useState(false); 
    const [sub, setSub] = useState(false);
    const [activities, setActivities] = useState([]);
    const [load, setLoad] = useState(true);
    const [page, setPage] = useState(1);
    const [hasMore, setHasMore] = useState(true);
    const [loadingMore, setLoadingMore] = useState(false);
    const itemsPerPage = 20;
    const loadMoreRef = useRef(null);

    const {client, connected} = useContext(SocketContext);
    const {user} = useContext(UserContext);
    
    const handleBar = useCallback((state) => {
        setBar(state);
    }, []);

    const fetchActivities = useCallback((body) => {
        const data = JSON.parse(body);
        setActivities(data.content);
        setHasMore(data.content.length >= itemsPerPage);
        setLoad(false);
    }, []);

    const fetchMoreActivities = useCallback(() => {
        if (!loadingMore && hasMore) {
            setLoadingMore(true);
            client.send(`/app/getActivities/${user._id}`, {}, JSON.stringify({ page: page + 1 }));
            setPage(prev => prev + 1);
        }
    }, [client, user._id, page, loadingMore, hasMore]);

    const handleScroll = useCallback((entries) => {
        const target = entries[0];
        if (target.isIntersecting && !loadingMore && hasMore) {
            fetchMoreActivities();
        }
    }, [fetchMoreActivities, loadingMore, hasMore]);

    useEffect(() => {
        const observer = new IntersectionObserver(handleScroll, {
            root: null,
            rootMargin: '20px',
            threshold: 1.0
        });

        if (loadMoreRef.current) {
            observer.observe(loadMoreRef.current);
        }

        return () => {
            if (loadMoreRef.current) {
                observer.unobserve(loadMoreRef.current);
            }
        };
    }, [handleScroll]);

    useEffect(() => {
        let subscription; 
        if(connected && client){
            const timer = setTimeout(() => {
                subscription = client.subscribe(`/activity/${user._id}`, (msg) => {
                    const response = JSON.parse(msg.body);
                    if(response.messageType === "getActivities") {
                        const data = JSON.parse(response.body);
                        if (page === 1) {
                            setActivities(data.content);
                        } else {
                            setActivities(prev => [...prev, ...data.content]);
                        }
                        setHasMore(data.content.length >= itemsPerPage);
                        setLoad(false);
                        setLoadingMore(false);
                    }
                });
                setSub(true);
            }, 1000);
            
            return () => {
                clearTimeout(timer);
                if(subscription){
                    subscription.unsubscribe(); 
                    setSub(false);
                }
            };
        }
    }, [client, connected, user._id, page]);

    useEffect(() => {
        if(sub){
            client.send(`/app/getActivities/${user._id}`, {}, JSON.stringify({ page: 1 }));
        }
    }, [sub, client, user._id]);

    return(
        <div className="page-container">
            <Sidebar option="Activity" handleBar={handleBar}/>
            <Profile/> 
            <Title title="Activity" bar={bar}/>
            <div className={bar ? "activity-container-closed" : "activity-container"}>
                <div className="activity-main-container">
                    <AnimatePresence>
                        {load ? (
                            <motion.div 
                                className="recent-activity-container loading"
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                exit={{ opacity: 0 }}
                            >
                                <Lottie 
                                    options={defaultOptions} 
                                    isClickToPauseDisabled={true} 
                                    height={300} 
                                    width={300} 
                                />
                                <div className="loading-text">Loading your activities...</div>
                            </motion.div>
                        ) : (
                            <motion.div 
                                className="recent-activity-container"
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                exit={{ opacity: 0 }}
                            >
                                {activities.length > 0 ? (
                                    <div className="activities-list">
                                        {activities.map((activity, index) => (
                                            <ActivityItem 
                                                key={activity._id || index}
                                                activity={activity}
                                                index={index}
                                            />
                                        ))}
                                        {hasMore && (
                                            <div ref={loadMoreRef} className="load-more-indicator">
                                                <div className="loading-dots">
                                                    <span></span>
                                                    <span></span>
                                                    <span></span>
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                ) : (
                                    <div className="no-activities">
                                        <Receipt style={{ fontSize: 48, color: '#d8d8d8' }} />
                                        <h3>No activities yet</h3>
                                        <p>Your recent activities will appear here</p>
                                    </div>
                                )}
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>
            </div>
        </div>
    );
};

export default memo(Activity); 