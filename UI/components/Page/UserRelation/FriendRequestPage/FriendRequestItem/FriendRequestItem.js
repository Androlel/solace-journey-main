/**
 * For display each friend request
 */
import { useState } from 'react-hook-form';
import { View, Image, Text, Pressable } from 'react-native';
import styles from './FriendRequestItemStyle';
import MyButton from '../../../../../Button';
import axios from 'axios';
import { curUser, ipAdandP } from '../../../IPsAndOther';
import { writeAsStringAsync, documentDirectory } from 'expo-file-system';
import { acceptFriendRequest } from '../../../../PrivateClient';


const FriendRequestItem = ({ friendRequest, updateRequestList}) => {
    
    console.log('this is friend request item', friendRequest)
    
    //Remove the correct friend request when user accept or deny the friend request
    const handleAcceptPressed = () => {
        console.log("Accept pressed in friend request item ", friendRequest['Sender']);
         // axios add friend
        // Saves new local chat file for new friend
        axios.post(`http://${ipAdandP}/api/chats/addFriend?user=${friendRequest['Sender']}&friend=${curUser.user}`).then(
            (response) => {
                console.log('this is accept', response)
                writeAsStringAsync(`${documentDirectory}/Chats/${curUser.user.replace(/ /g, "_")}-${friendRequest['Sender'].replace(/ /g, "_")}.json`, "[]")
                // notify parent to update the list
                acceptFriendRequest() 
                updateRequestList(friendRequest['id'])
            })
            .catch((error) => {
                console.log(' Accepting request error: ',error)
            })
    };

    //Remove the request if user pressed the decline button
    const handleDeclinePressed = () => {
        console.log("Delete pressed in friend request item at ", friendRequest['Sender']);
        //DELETE: /api/friendRequests/delete?sender=<sender name>&receiver=<receiver name></receiver>
        axios.delete(`http://${ipAdandP}/api/friendRequests/delete?sender=${friendRequest['Sender']}&receiver=${curUser.user}`).then(
            (response) => {
                updateRequestList(friendRequest['id'])
            }
        )
    };

    return (
        <View style ={styles.container}>
            <Image source={{ uri: friendRequest['Sender Avatar']}} style={styles.img} />
            <View style ={styles.rightContainer}>
                <Text style={styles.name}>{friendRequest['Sender']}</Text>                  
                <Text style={styles.content}>Message: {friendRequest['Message']}</Text>
                <View style ={styles.row}>
                    <MyButton text={"Accept"} textStyle={ styles.buttonText} buttonStyle={styles.accceptButton} onPress={handleAcceptPressed} />
                    <MyButton text={"Decline"} textStyle={ styles.buttonText} onPress={handleDeclinePressed}/>
                </View>
            </View>
        </View>
    )
    
}

export default FriendRequestItem 