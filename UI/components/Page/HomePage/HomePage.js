import { StatusBar } from 'expo-status-bar';
import { Image, ImageBackground, Pressable, StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Calendar } from 'react-native-calendars';
import { useNavigation, useRoute } from '@react-navigation/native';
import { useState, useEffect } from 'react'
import { socketinit } from '../../PrivateClient';
import { getInfoAsync, makeDirectoryAsync, readDirectoryAsync, deleteAsync, writeAsStringAsync, documentDirectory } from 'expo-file-system'
import axios from 'axios';
import { curUser,ipAdandP } from '../IPsAndOther';
import MyCalendar from '../MyCalendar/MyCalendar';
import RecActivities from './ReccomendedActivity/RecActivities';
import RecPaths from './ReccommendedPath/RecPaths';
import Notifications from './Notifications'


/**
 
@returns a home screen with calender and tabs navigating to other features
*/
const HomePage = ({ route }) => {


  const connectToWebSocketServer = () => {
    console.log('Hit web socket server function as user:',curUser.user)
    socketinit(curUser.user)
  };

  useEffect(() => {
    connectToWebSocketServer();
    // TODO: Check if Chats directory exists, if not, make one and axios call all the chat data
    const makeD = async () => {
      const fillChat = async () => {
        await makeDirectoryAsync(documentDirectory + "Chats")
        console.log("Chats directory made")
        // Get all user chat logs from db
        axios.get(`http://${ipAdandP}/userchats?user=${curUser.user}`).then((response) => {
          const {data} = response
          console.log("Chat data:", data)
          // Save those chat logs
          data.forEach((file) => {
            writeAsStringAsync(`${documentDirectory}/Chats/${file.filename}`, file.filedata)
          })
          console.log("Files written")
        })
      }
      let dir = await getInfoAsync(documentDirectory + "Chats")
      console.log("Exists:", dir.exists, "and is directory:", dir.isDirectory)
      if (dir.exists && dir.isDirectory) {
        let chatFiles = await readDirectoryAsync(documentDirectory + "Chats")
        // Check if current user's chat log files are on this device
        if (!chatFiles.some(file => file.startsWith(curUser.user))) {
          await deleteAsync(documentDirectory + "Chats")
          console.log("Deleted Chats directory")
          fillChat() 
        }
      }
      else
        fillChat()
    }
    makeD()
  }, []);


 // Get time-based greeting
  const getTimeBasedGreeting = () => {
    const currentHour = new Date().getHours();
    if (currentHour < 12) {
      return 'Good Morning';
    } else if (currentHour < 18) {
      return 'Good Afternoon';
    } else {
      return 'Good Evening';
    }
  };


  return (
    <View style={styles.container}>
      <ImageBackground
        opacity = {0.5}
        style={styles.backgroundImage}
        source={require('../../../assets/Login-img.png')}>
        <StatusBar style="auto" />
          <Text style={styles.welcomeText}>
          {`${getTimeBasedGreeting()}, ${curUser.user}!`}
        </Text>
        <MyCalendar/>
      
        </ImageBackground>
      <Notifications>
      </Notifications>
      </View>
  );
}

export default HomePage
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 30
  }
  ,
  backgroundImage:{
    flex: 1,
    resizeMode: 'cover',
    width: "100%",
  },
    welcomeText: {
    marginTop: 10,
    fontWeight: 'bold',
    fontSize: 24,
    color: '#008080',  // Teal color
    textAlign: 'center',
  },
  messageText: {
    fontSize: 18,
    color: '#008080',  // Teal color
    marginTop: 5,
    textAlign: 'center',
  },
});