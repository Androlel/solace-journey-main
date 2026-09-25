import io from 'socket.io-client'
import { updateReceiverChat, updateSenderChat } from './MessageInput/MessageInput.js' 
import { curUser, tcpIPandP, ipAdandP } from './Page/IPsAndOther.js'
//import * as Device from 'expo-device'
//import * as Notifications from 'expo-notifications'
//import { useEffect } from 'react'
import { readAsStringAsync, getInfoAsync, documentDirectory, writeAsStringAsync } from 'expo-file-system'
import axios from 'axios'
import * as Device from 'expo-device'
import * as Notifications from 'expo-notifications'
import { useEffect } from 'react'

let clientSocket = undefined
let user = ""
var chatDir = documentDirectory + "Chats/"

export function socketinit(username) {
    user = username
    clientSocket = io(`http://${tcpIPandP}`)
    //const [expoPushToken, setExpoPushToken] = useState('');
    //const [notification, setNotification] = useState(false);
    //const notificationListener = useRef();
    //const responseListener = useRef();


    
    clientSocket.on('connect', () => {
        console.log('connected to server as:', user)
        clientSocket.emit('User add', user)
    })

    clientSocket.on('server message', async (sender, msg, imageBuffer) => {
        console.log('Hit update receiver message')
        //console.log('Message to receiver:', msg)
        //console.log('Image to receiver:', imageBuffer)
        // Updates the receiver's local chat file if the chat room componenet isn't rendered
        if (!updateReceiverChat(msg, imageBuffer)) {
            console.log("in if statement")
            let message = {
                content: msg,
                image: imageBuffer,
                createdAt: new Date().toJSON().slice(0, 19).replace('T', ' '),
                sent: false
            }
            let jsonFile = `${chatDir}${curUser.user.replace(/ /g, "_")}-${sender.replace(/ /g, "_")}.json`
            let fileexists = await getInfoAsync(jsonFile)
            console.log("fileexists:", fileexists.exists)
            let chatArray = JSON.parse(await readAsStringAsync(jsonFile))
            chatArray.push(message)
            console.log("Chat array updated")
            writeAsStringAsync(jsonFile, JSON.stringify(chatArray, null, 2))
            console.log("Chat file written")
            axios.put(`http://${ipAdandP}/api/chats/update?user=${curUser.user}&friend=${sender}&data=${JSON.stringify([message], null, 2)}&msgCounter=${1}&lastmsg=${JSON.stringify(message, null, 2)}`).then(response => {
                console.log("Chat file updated at DB")
            }).catch(err => {
                console.error("err:", err)
            })
        }
        console.log("Went past if statement")
    })

    clientSocket.on('update sender', (message, imageBuffer) => {
        console.log('Hit update sender message')
        updateSenderChat(message, imageBuffer)
    })

    clientSocket.on('server friend accepted', (newFriend) => {
        writeAsStringAsync(`${chatDir}${curUser.user.replace(/ /g, "_")}-${newFriend.replace(/ /g, "_")}.json`, "[]")
        console.log("New friend chat file written")
    })

    clientSocket.on('remove user on client', () => {
        console.log('remove user on client hit')
        clientSocket.emit('user remove', user)
    })

    clientSocket.on('disconnect', (reason, details) => {
        console.log('disconnected from server')
        console.log('Reason:', reason, 'Detatils:', details)
    })

    clientSocket.on('connect_error', (err) => {
        console.log('client error event listener activated')
        console.error("Client error:", err)
    })

    clientSocket.on("send notification", (msg, imageBuffer) => {
        // async () => {
        //     await Notifications.scheduleNotificationAsync({
        //         content: {
        //             title: "Notification!",
        //             body: "Yippee!!!"
        //         },
        //         trigger: { seconds: 1 }
        //     });
        // }
    })
}

export function sendUserMessage(friend, message, imageBuffer) {
    clientSocket.emit('user message', curUser.user, friend, message, imageBuffer)
}

export function disconnect() {
    clientSocket.emit('disconnect')
    clientSocket = undefined
}

export function acceptFriendRequest() {
    clientSocket.emit('accept friend request', curUser.user)
}

/*
Notifications.setNotificationHandler({
    handleNotification: async () => ({
        shouldShowAlert: true,
        shouldPlaySound: false,
        shouldSetBadge: false,
    }),
});

async function regForPushNotifsAsync() {
    let token;
    if (Device.isDevice) {
        const { status: existingStatus } = await Notifications.getPermissionsAsync();
        let finalStatus = existingStatus;
        if (existingStatus !== 'granted') {
          const { status } = await Notifications.requestPermissionsAsync();
          finalStatus = status;
        }
        if (finalStatus !== 'granted') {
          alert('Failed to get push token for push notification!');
          return;
        }
        token = (await Notifications.getExpoPushTokenAsync()).data;
        console.log("Expo push token:", token);
      } else {
        alert('Must use physical device for Push Notifications');
      }
     
      if (Platform.OS === 'android') {
        Notifications.setNotificationChannelAsync('default', {
          name: 'default',
          importance: Notifications.AndroidImportance.MAX,
          vibrationPattern: [0, 250, 250, 250],
          lightColor: '#FF231F7C',
        });
      }
    return token; 
}
*/
export function handleFriendRequest(user, friendReqSender, accepted=true) {
    clientSocket.emit('handle friend response', user, friendReqSender, accepted)
}





