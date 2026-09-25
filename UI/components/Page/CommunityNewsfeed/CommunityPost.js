/**
 * Read the list of posts of the DB and display it
 */
import {FlatList, View, Text, RefreshControl, ScrollView } from 'react-native';
import { useState, useEffect , useCallback } from 'react'
import styles from './CommunityPostStyle';
import Post from './Posts/Posts'
import axios from 'axios';
import { ipAdandP, curUser } from '../IPsAndOther';


var postCache = []


const CommunityPost = () => {

  //Get posts from db
  const [loading, setLoading] = useState()
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    loadPostData()
  }, [])
  
  //TODO: find a way to refresh the post and other flatlist






  const loadPostData =() => {
    setLoading(true)  
    axios.get(`http://${ipAdandP}/posts?user=${curUser.user}`, { timeout: 10000000000 }).then((response) => {
        
        const { data } = response
        postCache = data
        console.log("This is commpost:" + postCache)
        
        setLoading(false)
      }).catch((error) =>{
        console.log('there is an error', error)
      })
    
    return () => {
      //TODO: do something after com post unmount/ keep track of likes or sth lol
    }
  }
 
  return (
    loading ? (
      <ScrollView refreshControl={<RefreshControl setRefreshing={refreshing} onRefresh={loadPostData}/>}>
        <View style={styles.container}>
            <Text style={styles.loadingText}>Loading...</Text>
        </View>
      </ScrollView>) :
    <View style={styles.page}>
       {/* Render the post from a list of posts.*/}
      <FlatList 
        data={postCache}
          renderItem={({ item }) => <Post PostItem={item} disabledCommentsForIndividualPost={false} />}
          refreshControl={<RefreshControl setRefreshing={refreshing} onRefresh={loadPostData}/>}
      />       
    </View>
  );
}

export default CommunityPost;
