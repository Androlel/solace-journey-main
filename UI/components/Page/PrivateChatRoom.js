import React, { useEffect, useState, useRef } from 'react';
import { Text, View,StyleSheet, FlatList, SafeAreaView, Platform, KeyboardAvoidingView } from 'react-native';
import Message from '../Message';
import { useRoute,useNavigation,useIsFocused } from '@react-navigation/native';
//import chatRoomData from '../../assets/dummy-data/Chats';
import chatsData from '../../assets/dummy-data/ChatsTest';
import MessageInput from '../MessageInput';
import { curUser,ipAdandP } from './IPsAndOther';
import { readAsStringAsync, getInfoAsync, documentDirectory, writeAsStringAsync } from 'expo-file-system'
import axios from 'axios';


var jsonChatFile = ""
var chatDir = documentDirectory + "Chats/"
var chatUri = undefined
var chatCache = {
    receiver: '',
    data: []
}
var appendingChats = []

/**
 * 
 * @returns A view of the whole chat room with chat messages on both sides
 */
export default function PrivateChatRoom({ navigation }) {
    const route = useRoute();
    const {receiver} = route.params
    const [chatData, setChatData] = useState(chatCache.data)
    const renderItem = ({ item }) => <Message message={item}/>;

    const updateChat = (msg, im, isSender=true) => {
        console.log("Hit updateChat from", isSender ? "sender" : "receiver")
        let message = {
            content: msg,
            image: im,
            createdAt: new Date().toJSON().slice(0, 19).replace('T', ' '),
            sent: isSender
        }
        //console.log("New message created:", message)
        console.log("Update chat on device:", Platform.OS, "and is sender:", isSender)
        
        setChatData(prevData => {
            chatCache.data = [...prevData, message]
            writeAsStringAsync(chatUri, chatCache.data.toString())
            appendingChats.push(message)
            return chatCache.data
        })
    }
    // Activated when component is mounted and array is empty
    useEffect(() => {
        navigation.setOptions({title: receiver})
        async function getChatInfo() {
            console.log("Inside getChatInfo")
            console.log("current user:", curUser.user, ", receiver:", receiver)
            jsonChatFile = `${curUser.user.replace(/ /g, "_")}-${receiver.replace(/ /g, "_")}.json`
            chatUri = chatDir + jsonChatFile
            let fileExists = await getInfoAsync(chatUri)
            console.log("file exists:", fileExists.exists)
            if (fileExists.exists) {
                if (chatCache.receiver != receiver)
                    chatCache.receiver = receiver
                chatCache.data = JSON.parse(await readAsStringAsync(chatUri))
                setChatData(chatCache.data)
            }
        }
        getChatInfo()
        // Resets the user, friend new message counter
        axios.put(`http://${ipAdandP}/api/chats/resetNM?user=${curUser.user}&friend=${receiver}`)
        // Triggers when component unmounts
        return () => {
            // Make axios call
            console.log("axios call made")
            console.log("appendingChats before axios:", appendingChats)
            if (appendingChats.length > 0) {
                const chatsReversed = appendingChats.reverse()
                axios.put(`http://${ipAdandP}/api/chats/update?user=${curUser.user}&friend=${receiver}&data=${JSON.stringify(chatsReversed, null, 2)}&msgCounter=${appendingChats.length}&lastmsg=${JSON.stringify(chatsReversed[0], null, 2)}`).then(response => {
                    appendingChats.length = 0
                    console.log("appendingChats:", appendingChats)
                })
            }   
        }
    }, []);

    // TODO: Implement KeyboardAvoidingView component to make sure the keyboard doesn't block the bottom components
    return (
        <View style={styles.container}>
            <FlatList
                keyboardDismissMode='interactive'
                data={chatData}
                renderItem={renderItem}
                extraData={chatData}
            />
            <MessageInput friendUsername={receiver} updateList={updateChat} chat={true}/>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        backgroundColor:'white',
        flex: 1
    },
});