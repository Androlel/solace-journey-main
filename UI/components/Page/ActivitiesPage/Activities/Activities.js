/**
 * Activities to be display in a list
 */
import {  Image, ImageBackground, Pressable, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { React, useState } from 'react';
import { Ionicons } from '@expo/vector-icons';
import styles from './ActivitiesStyle';
import { useNavigation } from '@react-navigation/native';


const Activities = ({ ActivityItem }) => {

    const activity = ActivityItem
    const navigation = useNavigation()
    console.log('This is activity lists' + activity)
    var activityID = activity["ID"]
    var activityContent = activity["Contents"]
    var activityMainImg = activity["Picture"]
    var activityName = activity["Name"]

    const handleActivityPress = () => {
        //console.log('Activity pressed ' + activityMainImg)
        navigation.navigate("Individual Activity",{activityID, activityContent, activityMainImg, activityName})
    }

    return (
        <Pressable style={styles.container} onPress={handleActivityPress}>
            <Image source={{ uri: activityMainImg }} style={styles.img} />
            <View style ={styles.rightContainer}>
                <View style={styles.row}>
                        <Text style={styles.name}>{activityName}</Text>                  
                </View>

                <Text style={styles.content}>{activityContent}</Text>
                </View>

        </Pressable>
    )
}

export default Activities