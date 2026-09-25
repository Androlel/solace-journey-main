import { Image, ImageBackground, StyleSheet, FlatList, View, RefreshControl, ScrollView, Text } from 'react-native';
import {useEffect, useState} from 'react';
import PrivateChatItem from '../PrivateChat';
//import chatRoomsData from '../../assets/dummy-data/ChatRooms';
//import chatRoomsData from '../../assets/dummy-data/ChatRoomsTest';
//import { useRoute } from '@react-navigation/native';

import axios from 'axios';
import { curUser, ipAdandP } from './IPsAndOther';
//import axios from 'axios';

//let friendListCache = []
//var friendList = []

/**
 * 
 * @returns Display of every friends you have and last messages one sent
 */
export default function PrivateChatList() {
  const [friendList, setFriendList] = useState([])
  const [refreshing, setRefreshing] = useState(false);
  const [loading, setLoading] = useState()
  useEffect(() => {
    loadChatList()
  }, [])
  
  const loadChatList = () => {
    setRefreshing(true)
    setLoading(true)  
    axios.get(`http://${ipAdandP}/friends?username=${curUser.user}`).then((response) => {
      const {data} = response
      //console.log('this is friend page', data)
      setFriendList(data)
      setLoading(false)
    }).catch((err) => {
      console.error(err)
    })
  }
  
  useEffect(() => {
    if (refreshing) {
         console.log('Starting to refresh...');
       const timeoutId = setTimeout(() => {
            setRefreshing(false);
            console.log('Finished refreshing');
       }, 2000);
        return () => clearTimeout(timeoutId);
    }
    
},[refreshing])

  return (
    loading?(<ScrollView refreshControl={<RefreshControl setRefreshing={refreshing} onRefresh={loadChatList} />}>
      <View style={styles.container}>
        <Text style={styles.loadingText}>Loading...</Text>
      </View> 
    </ScrollView>):
    <View style = {styles.page}>
      <FlatList
        //data={chatRoomsData[curUser.user]}
        data={friendList}
        renderItem={({ item }) => <PrivateChatItem chatRoom={item}/>}      
        showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl setRefreshing={refreshing} onRefresh={loadChatList}/>}
      />  
    </View>
  );
}

const styles = StyleSheet.create({
  page: {
    backgroundColor: 'whitesmoke',
    
    flex: 1
  },
  container: {
        flex: 1,
        paddingVertical: 350,
        alignItems: 'center',
      backgroundColor: '#f0f0f0',
    },
   loadingText: {
        fontSize: 24,
        fontWeight: '500',
        color: '#333', // Tomato color
        fontFamily: 'Cochin', // Or any custom font you prefer
    },
});