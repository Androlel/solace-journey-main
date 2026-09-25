import {readFileSync} from 'fs'
import { Server } from 'socket.io'
import * as Device from 'expo-device'
import * as Notifications from 'expo-notifications'
//import f from 'firebase'
//import 'expo-notifications'

const userToSocket = {}
const sockidToUser = {}

const server = new Server({
    maxHttpBufferSize: 1e10
})





// Can add any event name to emit, use to send data, emit using emit('event name', ...args)
server.on('connection', (socket) => {
    console.log("client connected")
    socket.on('disconnect', () => {
        console.log("user disconnected")
        console.log('socket id being disconnected:', socket.id)
        let user = sockidToUser[socket.id]
        delete userToSocket[user]
        delete sockidToUser[socket.id]
    })
    socket.on('User add', (username) => {
        console.log('user being added from socket id:', socket.id, 'as user:', username)
        userToSocket[username] = socket
        sockidToUser[socket.id] = username
    })
    socket.on('user message', (sender, receivingUser, message, imageBuffer) => {
        //console.log('user go message')
        let curSocket = userToSocket[receivingUser]
        if (curSocket === undefined || receivingUser != sockidToUser[curSocket.id]) {
            // TODO: Send notification from firebase since the receiving user isn't online
            socket.emit("send notification", sender, message, imageBuffer)
            console.log(receivingUser, "isn't online now")
            //socket.emit('send notification', receivingUser, message, imageBuffer)
        }
        else {
            //socket.emit('send notification', receivingUser, message, imageBuffer)
            console.log("server sending message:", message, "to", receivingUser)
            curSocket.emit('server message', sender, message, imageBuffer)
            console.log("Message sent from Server to:", curSocket.id)
            socket.emit('update sender', message, imageBuffer)
            console.log("update sender emitted")
        }
    })
    socket.on('accept friend request', (newFriend) => {
        let curSocket = userToSocket[newFriend]
        if (curSocket === undefined || newFriend != sockidToUser[curSocket.id]) {
            // TODO: Send notification from firebase since the receiving user isn't online
            console.log(receivingUser, "isn't online now")
            
        }
        else {
            curSocket.emit('server friend accepted', newFriend)
            console.log("server friend accepted sent")
        }
    })
})

function shutdown() {
    const sockets = Object.values(userToSocket)
    sockets.forEach((socket) => {
        if (socket !== undefined)
            socket.disconnect(true)
    })
    server.close()
    console.log("Server is shut down")
    process.exit()
}

process.on('SIGINT', shutdown)

server.listen(6000, () => {
    console.log("Server running at port 6000")
})