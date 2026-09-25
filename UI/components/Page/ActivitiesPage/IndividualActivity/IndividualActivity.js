/**
 * For display activity individually
 */
import { useRoute, useNavigation } from '@react-navigation/native';
import { View, Image, Text, FlatList, ScrollView } from 'react-native';
import { useState,useEffect } from 'react';
import styles from './IndividualActivityStyle'
import { ipAdandP } from '../../IPsAndOther';
import axios from 'axios';
import ActivityStep from '../ActivitySteps/ActivitySteps';

//import { get} from 'axios';

var images, videos, mainVideo;

const IndivdualActivity = () => {
    const route = useRoute();
    const navigation = useNavigation();
    const { activityID,activityContent,activityMainImg,activityName } = route.params
    const [loading, setLoading] = useState()
 
    useEffect(() => {
    navigation.setOptions({ title: activityName})
    setLoading(true)
    console.log('before axios call', activityID)
    axios.get(`http://${ipAdandP}/activity?activityID=${activityID}`).then((response) => {
      const {data} = response
        console.log("this is individual activity" + data)
        const [{'Main Video': _mainVideo , 'Images': _images, 'Videos': _videos}] = data
        mainVideo = _mainVideo
        images = _images
        videos = _videos

      setLoading(false)
    })
  }, [])
    
    //TODO: displaying new content of actvities check for videos or pictures for step by step
    //TODO: look up react-native to display media and play it
    
  return (
      <ScrollView>
        <View style ={styles.container}>
            <Image source={{ uri: activityMainImg}} style={styles.img} />
            <View style ={styles.rightContainer}>
                <View style={styles.row}>
                        <Text style={styles.name}>{"Description: "}</Text>                  
                </View>
                <Text style={styles.text}>{activityContent}</Text>
                
        </View>
        
      </View>
    
      {images && <FlatList
        style ={styles.flatListContainer}
          data={images}
          renderItem={({item}) => <ActivityStep ActivityItem={item}/>}
      />}
      {videos &&
        <FlatList
         style ={styles.flatListContainer}
          data={videos}
          renderItem={({item}) => <ActivityStep ActivityItem={item}/>}
        />}
       
   
    </ScrollView>
    )
    
}
export default IndivdualActivity