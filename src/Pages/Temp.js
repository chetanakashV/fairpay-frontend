import React, {useState, useEffect, useContext} from 'react'
import {SocketContext, UserContext} from '../Helper/UserContext'
import {over} from 'stompjs';
import SockJS from 'sockjs-client';

var stompClient =null;
const Temp = () => {
    const {client} = useContext(SocketContext);
    const {user} = useContext(UserContext);

    const subscribe = () => {
        if(client) {
            client.subscribe(`/groups/${user._id}`, (res) => {
                console.log(res)
            })
        }
        else {
            console.log("no client")
        }
    }
    

    const sendMessage = () => {
        if(client) {
            try{
                client.send(`/app/getGroups/${user._id}`, {}, user._id);
            }
            catch(error){
                console.log(error)
            }
        }
        else alert('client disconnected')
    }

    return(
        <>
            <button onClick={subscribe}> Subscribe</button>
            <button onClick={sendMessage}> Message</button>
        </>
    )
}

export default Temp; 