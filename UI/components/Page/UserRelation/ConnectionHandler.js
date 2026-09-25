/**
 * Hanlding user relation such as adding and removing other user (friends)
 */

import { Alert, Modal, Text, Pressable, View} from 'react-native';
import InputText from '../InputField';
import styles from './ConnectionsHandleStyle'
import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import MyButton from '../../../Button';
import { curUser, ipAdandP } from '../IPsAndOther';
import { sendFriendRequest } from '../../PrivateClient';
import axios from 'axios';



const ConnectionHandler = ({ modalVisible, setModalVisible, potentialFriendName }) => {

  const { control, handleSubmit, formState: { errors }, } = useForm();
  
    //Handle when confirm button is pressed
    const handleConfirm = (msg) =>
    {
      console.log('This is from connection handler ', msg.userID)
        //Talk with the server for adding friends
      axios.post(`http://${ipAdandP}/api/friendRequests/add?sender=${curUser.user}&receiver=${potentialFriendName}&msg=${msg.userID}`).
        then((response) => {
          const { data } = response
          console.log(data)
          setModalVisible(!modalVisible)
        })
    }


    return (
      <View style={styles.centeredView}>
      <Modal
        animationType="slide"
        transparent={true}
        visible={modalVisible}
        >
        <View style={styles.centeredView}>
          <View style={styles.modalView}>
            <Text style={styles.modalText}>Add {potentialFriendName} as a Friend?</Text>
             <InputText
                name="userID"
                placeholder={"Send a message to your soon to be friend!"}
                control ={control}/>
                <MyButton text={"Confirm"} onPress={handleSubmit(handleConfirm)} />
                <MyButton text={"Cancel"} onPress={() => setModalVisible(!modalVisible)}/> 
          </View>
        </View>
      </Modal>
    </View>
  );
}


export default ConnectionHandler

