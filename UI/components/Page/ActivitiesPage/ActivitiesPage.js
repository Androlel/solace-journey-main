import { StatusBar } from 'expo-status-bar';
import {  FlatList , ImageBackground,  View, Text,RefreshControl } from 'react-native';
import styles from './ActivitiesPageStyle';
import Activities from './Activities/Activities';
import axios from 'axios';
import { useState, useEffect } from 'react'
import { ipAdandP } from '../IPsAndOther';

var activityData = []

export default function ActivitiesPage() {
  const [loading, setLoading] = useState()
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => { loadActivityData()}, [])
  
  const loadActivityData = () => {
    setLoading(true)
    axios.get(`http://${ipAdandP}/activities`).then((response) => {
      const { data } = response
      console.log("activity" + data)
      activityData = data
      setLoading(false)
      setRefreshing(true)
    })
  }

  return (
    loading ? <View style={styles.page}><Text style={styles.loadingText}>Loading...</Text></View> :
      <View style={styles.container}>
      <FlatList 
        data={activityData}
        renderItem={({ item }) => <Activities ActivityItem={item} />}
        refreshControl={<RefreshControl setRefreshing={refreshing} onRefresh={loadActivityData} />}
      />       
      <StatusBar style="auto" />
      </View>
  );
}
