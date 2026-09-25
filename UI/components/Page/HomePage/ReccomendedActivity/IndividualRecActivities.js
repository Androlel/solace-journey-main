/**
 * Activities to be display in a horizontal reccomended list
 */
import {  Image, ImageBackground, Pressable, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { React, useState } from 'react';
import { Ionicons } from '@expo/vector-icons';
import styles from './RecActivitiesStyle';
import { useNavigation } from '@react-navigation/native';



const IndivdualRecActivities = ({ ActivityItem }) => {

    console.log(ActivityItem)
    const activity = ActivityItem.activities
    const navigation = useNavigation()
    
    //TODO: navigate to correct activity
    const handleActivityPress = () => {
        console.log('Rec Activity pressed ')
       
    }

    return (
        <Pressable style={styles.container} onPress={handleActivityPress}>
            <Image source={{ uri: activity.imageUri }} style={styles.img} />
            <View style ={styles.rightContainer}>
                
                <Text style={styles.name}>{activity.name}</Text>       
                <Text>Ratings : {activity.rating}</Text>
                <Text style={styles.content}>Content: {activity.content}</Text>  
            </View>

        </Pressable>
    )
}

export default IndivdualRecActivities