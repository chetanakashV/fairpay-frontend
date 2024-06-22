import {createContext, useEffect, useState} from 'react'
import {over} from 'stompjs';
import SockJS from 'sockjs-client'

export const LogInContext = createContext({}); 

export const UserContext = createContext({}); 

export const SocketContext = createContext({}); 


const UserProvider = ({children}) => {
    const [logIn, setLogIn] = useState(false); 
    const [user, setUser] = useState();
    const [loading, setLoading] = useState(true); 

    const [client, setClient] = useState(null);
    const [connected, setConnected] = useState(false)


    useEffect(() => {
        const savedUser = sessionStorage.getItem("user"); 
        if(savedUser){
            setUser(JSON.parse(savedUser)); 
        }
        if(sessionStorage.getItem("logIn")){
            setLogIn(sessionStorage.getItem("logIn"))
        }
        setLoading(false);
    },[])



    useEffect(() => {
        if(logIn && user){
            sessionStorage.setItem("user", JSON.stringify(user))
        }else{
            sessionStorage.removeItem("user")
        }
    },[user, logIn])

    useEffect(() => {
        if(!logIn){
            setLogIn(sessionStorage.getItem("logIn")=="true")
        }
    }, [logIn])

    
   useEffect(() => {
    if (!client && connected) {
      const Sock = new SockJS(`${process.env.REACT_APP_SERVER_URI}/ws`);
      setClient(over(Sock));
      console.log("socket connected")
    }
    }, [client, connected]);

    useEffect(() => {
        if (logIn) {
          setConnected(true);
        } 
        else {
            if(client){ 
                client.disconnect();
                setClient(null); 
                console.log("socket disconnected")
            } 
            setConnected(false);
        }

        const reconnect = () => {
          if (!client && connected) {
            const Sock = new SockJS(`${process.env.REACT_APP_SERVER_URI}/ws`);
            setClient(over(Sock));
            console.log("socket reconnected")
          }
        };
    
        const interval = setInterval(reconnect, 5000); 
    
        return () => clearInterval(interval);
      }, [client, connected,  logIn]);

      useEffect(() => {
        if(client)
        client.connect({}, () => {
            
          }, (error) => {
            console.log(error)
          })
      },[client])
    

    return(
        <LogInContext.Provider value = {{logIn, setLogIn, loading}}>
            <UserContext.Provider value = {{user, setUser, loading}}>
                <SocketContext.Provider value={{client, connected}}>
                    {children}
                </SocketContext.Provider>
            </UserContext.Provider>
        </LogInContext.Provider>
    )
}

export default UserProvider; 