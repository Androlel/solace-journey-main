import React, { useState } from 'react';
import { Image, Text, View, Pressable } from 'react-native';
import styles from './style';
import { useNavigation } from '@react-navigation/native';

/**
 * 
 * @returns handle when the user tab on a chat
 */
export default function PrivateChatItem({ chatRoom }) {
  
  const navigation = useNavigation()
  const [NM, setNM] = useState(chatRoom["New Messages"])
  //console.log("chatRoom:", chatRoom)
  const receiver = chatRoom["Friend"]
  console.log("PCI receiver:", receiver)
  
  return (
    <Pressable onPress={() => {setNM(0); navigation.navigate("Chat room", { receiver })}} style ={styles.container}>
    <Image source={{uri: chatRoom["Picture"]}} style={styles.img} />

      <View style={styles.badgeContainer}>
        <Text style={styles.badgeText}>{NM}</Text>
      </View>  
      
      <View style ={styles.rightContainer}>
        <View style={styles.row}>
          <Text style={styles.name}>{receiver}</Text>
          <Text style={styles.text}>{chatRoom["Creation Date"]}</Text>
      </View>
        <Text numberOfLines={1} style={styles.text}>{chatRoom["Last Message"]}</Text>
      </View>
    </Pressable>
  );
}

