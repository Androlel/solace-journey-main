import React from 'react';
import { Text, Image, View, StyleSheet } from 'react-native';

//const myID = 'u1';

const Message = ({message}) => {
    //console.log("message:", message)
    // TODO: have a tag that notifies the sender if the message was delivered
    const isMe = message.sent
    return (
        <View
          style={[styles.container,
          isMe ? styles.otherContainer : styles.meContainer]}>
          {message.image && <Image 
                                source={{uri: message.image}}
                                width={300}
                                height={300}
                            />
          }
          {message.content && <Text style={{ color: isMe ? 'white' : 'black' }}>
            {message.content}
          </Text>
          }
        </View>
    );  
}

const styles = StyleSheet.create({
    container: {
        backgroundColor: '#3777f0',
        padding: 10,
        margin: 10,
        borderRadius: 10,
        maxWidth: '75%',
    },
    otherContainer: {
        backgroundColor:'#3777f0',
        marginLeft: 10,
        marginRight:'auto',
    },
    meContainer: {
        backgroundColor:'lightgrey',
        marginLeft: 'auto',
        marginRight:10,
    }
});

export default Message;
