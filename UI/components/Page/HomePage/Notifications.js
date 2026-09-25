import io from 'socket.io-client'
//import { updateReceiverChat, updateSenderChat } from './MessageInput/MessageInput.js' 
//import { tcpIPandP } from './Page/IPsAndOther.js'
import * as Device from 'expo-device'
import * as ExpoNotifications from 'expo-notifications'
import React, { useState, useEffect, useRef } from 'react'
import { Text, View, Button, Platform } from 'react-native';
//import { curUser,ipAdandP } from './IPsAndOther';
import { readAsStringAsync, getInfoAsync, documentDirectory, writeAsStringAsync } from 'expo-file-system'
//import axios from 'axios';import { useEffect } from 'react'
import Constants from 'expo-constants'



var chatDir = documentDirectory + "Chats/"

const Notifications = () => {
    const [expoPushToken, setExpoPushToken] = useState('');
    const [notification, setNotification] = useState(false);
    const notificationListener = useRef();
    const responseListener = useRef();

    useEffect(() => {
        regForPushNotifsAsync().then(token => setExpoPushToken(token));

        notificationListener.current = ExpoNotifications.addNotificationReceivedListener(notification => {
            setNotification(notification);
        });

        responseListener.current = ExpoNotifications.addNotificationResponseReceivedListener(response => {
            console.log(response);
            // response variables: sender, message, image buffer?, 
            // let jsonFile = `${chatdir}${curUser.user.replace(/ /g, "_")}-${sender.replace(/ /g, "_")}.json`
            // let fileexists = await getInfoAsync(jsonFile) // make async
            // console.log("fileexists", fileexists.exists)
            // let chatarray = JSON.parse(await readAsStringAsync(jsonFile))
            // chatArray.push(message)
            // writeAsStringAsync(jsonFile, JSON.stringify(chatarray, null, 2))
            // axios.put(`http://${ipAdandP}/api/chats/update?user=${curUser.user}&friend=${receiver}&data=${JSON.stringify([message], null, 2)}&msgCounter=1&lastmsg=${JSON.stringify(message, null, 2)}`).then(response => {

            // })

        });

        return () => {
            ExpoNotifications.removeNotificationSubscription(notificationListener.current);
            ExpoNotifications.removeNotificationSubscription(responseListener.current);
        }
    }, []);
    return (
        <View
          style={{
            flex: 1,
            alignItems: 'center',
            justifyContent: 'space-around',
          }}>
          <Text>Your expo push token: {expoPushToken}</Text>
          <View style={{ alignItems: 'center', justifyContent: 'center' }}>
            <Text>Notification Title: {notification && notification.request.content.title} </Text>
            <Text>Notification Body: {notification && notification.request.content.body}</Text>
            <Text>Notification Data: {notification && JSON.stringify(notification.request.content.data)}</Text>
          </View>
          <Button
            title="Press to Send Notification"
            onPress={async () => {
              await sendPushNotification(expoPushToken);
            }}
          />
        </View>
      );
}

async function sendPushNotification(expoPushToken) {

    await ExpoNotifications.scheduleNotificationAsync({
        content: {
          title: "You've got mail! 📬",
          body: 'yippee!!',
          data: { data: 'goes here', test: { test1: 'more data' } },
        },
        trigger: { seconds: 1 },
      });
    // const message = {
    //   to: expoPushToken,
    //   sound: 'default',
    //   title: 'Solace Journey',
    //   body: 'You got a message',
    //   data: { someData: 'image' },
    // };
  
    // await fetch('https://exp.host/--/api/v2/push/send', {
    //   method: 'POST',
    //   headers: {
    //     Accept: 'application/json',
    //     'Accept-encoding': 'gzip, deflate',
    //     'Content-Type': 'application/json',
    //   },
    //   body: JSON.stringify(message),
    // });
  }


export default Notifications


ExpoNotifications.setNotificationHandler({
    handleNotification: async () => ({
        shouldShowAlert: true,
        shouldPlaySound: false,
        shouldSetBadge: false,
    }),
});

async function regForPushNotifsAsync() {
    let token;
  if (Platform.OS === 'android') {
    await Notifications.setNotificationChannelAsync('default', {
      name: 'default',
      importance: Notifications.AndroidImportance.MAX,
      vibrationPattern: [0, 250, 250, 250],
      lightColor: '#FF231F7C',
    });
  }

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
    // try {
    //   const projectId =
    //     Constants?.expoConfig?.extra?.eas?.projectId ?? Constants?.easConfig?.projectId;
    //   if (!projectId) {
    //     throw new Error('Project ID not found');
    //   }
    //   token = (
    //     await Notifications.getExpoPushTokenAsync({
    //       projectId,
    //     })
    //   ).data;
    //   console.log(token);
    try {
      let res = await ExpoNotifications.getExpoPushTokenAsync()
       token = res.data
       console.log(token);
    } catch (e) {
      token = `${e}`;
    }
  } else {
    alert('Must use physical device for Push Notifications');
  }

  return token;
}