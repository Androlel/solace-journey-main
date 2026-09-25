import React, {useState,useEffect} from 'react'
import { View, Text, StyleSheet, TextInput, Pressable, Keyboard, Image } from 'react-native'
import {
    SimpleLineIcons,
    Feather,
    MaterialCommunityIcons,
    Ionicons,
    AntDesign
} from '@expo/vector-icons';
import { sendUserMessage } from '../PrivateClient';
import { updatePostComments } from '../Page/CommunityNewsfeed/CommunityPost';
import * as ImagePicker from 'expo-image-picker'


var update = undefined
var isChatRendered = false

/**
 * Handle when the user sending a message
 * @returns 
 */

const MessageInput = ({friendUsername, updateList, chat, postComments, replyItems, postID}) => {

    const [message, setMessage] = useState('');
    const [image, setImage] = useState(undefined)
    update = updateList
    isChatRendered = (chat === undefined) ? false : true
    const sendMessage = (message, imageBuffer) => {
        // TODO: send image across messaging server
        console.log("imageBuffer:", imageBuffer)
        sendUserMessage(friendUsername, message, imageBuffer)
        console.log('Message sent:', message)
    }

    const onSendPress = () => {
        if (message || image) {
            // TODO: put image into comment and reply
            console.log("message sent:", message, ", image sent:", image)
            if (postComments)
                updateList(message, image !== undefined ? image.buffer : undefined)
            else if (replyItems)
                updateList(message, image !== undefined ? image.buffer : undefined)
            else
                sendMessage(message, image !== undefined ? image.buffer : undefined)

            setMessage('')
            setImage(undefined)
        }
        else {
            onPlusClicked();
        }
    }
    const onPlusClicked = async () => {
        console.warn("Plus click");
        console.log("Plus")
        const response = await ImagePicker.requestMediaLibraryPermissionsAsync()
        console.log("response:", response)
        if (response.granted) {
            let result = await ImagePicker.launchImageLibraryAsync({
                mediaTypes: ImagePicker.MediaTypeOptions.Images,
                allowsEditing: false,
                base64: true,
                quality: 1
            })
            //console.log("image result:", result.assets[0])
            if (!result.canceled) {
                setImage({
                    buffer: `data:${result.assets[0].mimeType};base64,${result.assets[0].base64}`,
                    uri: result.assets[0].uri
                })
            }
        }
    }

    const onCameraClicked = async () => {
        console.log("Camera Clicked")
        // Gets user's camera permissions
        const response = await ImagePicker.requestCameraPermissionsAsync()
        //console.log("response:", response)
        if (response.granted) {
            let result = await ImagePicker.launchCameraAsync({
                allowsEditing: false,
                base64: true,
                quality: 1
            })
            console.log("result:", result.assets[0])
            if (!result.canceled) {
                setImage({
                    buffer: `data:image/jpeg;base64,${result.assets[0].base64}`,
                    uri: result.assets[0].uri
                })
            }
        }
    }

    const onPictureXClicked = () => {
        setImage(undefined)
    }

    // Resets update variable when message input is unmounted
    useEffect(() => {
        return () => update = undefined
    }, [])

    return (
        <View style ={styles.root}>
            <View style={styles.inputContainer}>
                <SimpleLineIcons name="emotsmile" size={24} style={styles.icon} />

                {image ? <View style={styles.input}>
                            <Image 
                                source={{uri: image.uri}}
                                width={200}
                                height={200}
                            />  
                            <Ionicons name="close-outline" onPress={onPictureXClicked} style={styles.x_icon}/>
                            <TextInput
                                style={styles.image_comment}
                                placeholder="Add comment or Send"
                                onChangeText={setMessage}
                                value={message}
                                //ref={parentRef}
                                multiline={true}
                            />    
                        </View>              
                        : 
                        <TextInput style={styles.input}
                            placeholder="Enter message here..."
                            onChangeText={setMessage}
                            value={message}
                            //ref={parentRef}
                            multiline={true}
                        />
                }
                {!image && <View>
                    <Pressable onPress={onCameraClicked}>
                        <Feather name="camera" size={24} style={styles.icon} />
                    </Pressable>
                    <MaterialCommunityIcons name="microphone-outline" size={24}  style={styles.icon} />
                </View>
                }
                
            </View>
            <Pressable onPress ={onSendPress} style ={styles.buttonContainer}>
                {(message || image) ? <Ionicons name="send-outline" size={18} color="white"/> : <AntDesign name="plus" size={24} color="white" /> }
            </Pressable>
        </View>
    )
};

/**
 * Updates the local friend's chat file
 * 
 * 
 * 
 * @param {*} msg 
 * @param {*} image 
 * @returns true if the chat room component is rendered and has the update global variable with it's update function, otherwise false 
 */
export let updateReceiverChat = (msg, image) => {
    console.log("update receiver chat typeof:", typeof update)
    console.log("isChatRendered:", isChatRendered)
    if (update === undefined || !isChatRendered)
        return false
    update(msg, image, false)
    return true
}

/**
 * Updates the local sender's chat file
 * 
 * 
 * 
 * @param {*} msg 
 * @param {*} image 
 */
export const updateSenderChat = (msg, image) => {
    //console.log("update sender chat typeof:", typeof update)
    update(msg, image)
}

const styles = StyleSheet.create({
    root: {
        flexDirection: 'row',
        padding: 10
    },
    inputContainer: {
        backgroundColor: '#ECEBEB',
        flex: 1,
        marginRight: 10,
        borderRadius: 25,
        borderWidth: 1,
        borderColor: '#E5E4E4',
        alignItems: 'center',
        flexDirection: 'row',
        padding: 5
    },
    buttonContainer: {
        width: 40,
        height: 40,
        backgroundColor: '#3777f0',
        borderRadius: 25,
        justifyContent: 'center',
        alignItems: 'center'
    },
    buttonText: {
        color: 'white',
        fontSize: 35,
    },
    input: {
        flex: 1,
        marginHorizontal: 5
    },
    icon: {
        marginHorizontal: 5,
    },
    x_icon: {
        position: 'absolute',
        color: 'black',
        size: 18,
        right: 20,
        top: 20,
        backgroundColor: 'gray',
        borderRadius: 25,
        borderColor: 'white'
    },
    image_comment: {
        borderColor: 'gray',
        borderStyle: 'solid',
        borderWidth: 1,
        paddingLeft: 3
    }
})
export default MessageInput