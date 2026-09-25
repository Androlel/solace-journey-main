/**
 * Display comment from a post
 */

import styles from './CommentsStyle';
import { Image, Text, TouchableOpacity, View, FlatList, Pressable, ScrollView,Dimensions } from 'react-native';
import { React, useState, useRef, useEffect } from 'react';
import MessageInput from '../../../MessageInput';
import { Ionicons } from '@expo/vector-icons';
import ConnectionHandler, { setAvatarClicked } from '../../UserRelation/ConnectionHandler';
import { ipAdandP,curUser } from '../../IPsAndOther';
import axios from 'axios';
import ReplyToComments from '../Replies/ReplyToComments';
import MoreOptions from '../MoreOptionsHandler/MoreOptionsHandler';


var postReplyCache = {}

const Comments = ({ CommentItems, hide, updateCommList, likes}) => {
    //console.log("CommentItems:", CommentItems)
    const [replies, setReplies] = useState([]);
    const [loadingComments, setLoadingComments] = useState(false);
    const flatListRef = useRef(null); // Create a reference for FlatList
    //Set the more options menu to be below the icons
    const [ellipsisPosition, setEllipsisPosition] = useState(null);
    //Get the screen width prevent more options menu to be off screen
    const screenWidth = Dimensions.get('window').width;
     // Check if the comment is from the current user
    const isCurrentUser = CommentItems['User'] === curUser.user;
    //Check if the targeted commentor is an admin or a user than compare against the current user
    const areBothAdminsorUsers = CommentItems['Admin'] === curUser.isAdmin;
       // State for modal visibility
    const [modalVisible, setModalVisible] = useState(false);
    const [likeCounter, setLikeCounter] = useState(likes ? likes : CommentItems['Comment Likes']);
    const [postLiked, setPostLiked] = useState(CommentItems['User Liked'])

    
    /**
     * Hide: to distinguish between comments from the post list 
     * and the comments display in the individual post
     */
    let comment = CommentItems
    console.log('this is the admin',comment["Admin"])
    /**
     * Setting the initial state for all your button
     */
    const [buttonState, setButtonState] = useState({
        liked: CommentItems['User Liked'],
        commentsVisible: false,
        more: false
    });
    
    const handleIconPressed = (button) => {
       setButtonState(prevState => ({
            ...prevState,
            [button]: !prevState[button],
        }));
   }

  

    const handleAvatarPressed = () => {
        console.log("Avatar pressed");
        //Check if the avatar pressed is the current user or not 
       if(!isCurrentUser) setModalVisible(true);
    }

    //Keeping track of the state of comments if they are visible or not
    useEffect(() => {
        if (buttonState.commentsVisible) {
        setLoadingComments(true)
        axios.get(`http://${ipAdandP}/commentReplies?commentID=${comment['commentID']}&user=${curUser.user}`,{ timeout: 1000000}).
            then((response => {
                setReplies(response.data)
                setLoadingComments(false)
            })) .catch(error => console.error("Error fetching comments:", error));
    }
    }, [buttonState.commentsVisible]);

      
    //Keep the like State in check, if changed make an axios called to the DB to update likes counter
    useEffect(() => {
        if (buttonState.liked && !postLiked) {
            
            //Fetching data from the database
            axios.put(`http://${ipAdandP}/api/posts/commentLikes?commentID=${comment['commentID']}&user=${curUser.user}&increase=${buttonState.liked ? 1 : 0}`)
                .then(response => {
                    console.log('liked')
                    setLikeCounter(prevLikes => { const newLikes = prevLikes + 1
                        return newLikes
                    })
                    setPostLiked(true)
                })
                .catch(error => console.error("Error fetching liking post:", error));
        }
        else if (!buttonState.liked && postLiked) {
             axios.put(`http://${ipAdandP}/api/posts/commentLikes?commentID=${comment['commentID']}&user=${curUser.user}&increase=${buttonState.liked ? 1 : 0}`)
                 .then(response => {
                    console.log('unliked')
                    setLikeCounter(prevLikes => {
                        var newLikes = 0
                        if (prevLikes >= 1) {
                           newLikes = prevLikes - 1
                        }
                        return newLikes
                    })
                    setPostLiked(false)
                })
                .catch(error => console.error("Error fetching liking post:", error));}
    }, [buttonState.liked, postLiked]);
    
    const updatePostComments = (message, image, commentID) => {
        //Setting a new comments
        const newReply = {
            User: curUser.user,
            Picture: curUser.avatar,
            'Reply Content': message, //Making sure it's format correctly for reply to comments
            createdAt: new Date().toJSON().slice(0, 19).replace('T', ' '),
        };
    
        
        // Get the reply from the DB
        axios.post(`http://${ipAdandP}/api/posts/reply?user=${newReply.User}&content=${newReply['Reply Content']}&posted=${newReply.createdAt}&commentID=${commentID}`,{ timeout: 10000}).
            then(response => {
                console.log('New replies generated')
                //Update the old list of comments with new one
                 setReplies(prevComments => {
                     const updatedComments = [...prevComments, newReply];
                        flatListRef.current.scrollToEnd({ animated: true });
                    return updatedComments;
                });
            }).catch(error => {
                console.log("Error catched: ", error.response.data);
            })
    }

      const handleNewMessage = (message, image=undefined) => {
         updatePostComments(message, image, comment['commentID']);
    };


    //This funtion hanlde deleting user comments
    const handleOnDeletePressed = () => {
        axios.delete(`http://${ipAdandP}/api/posts/delete/comment?commentID=${comment['commentID']}`).catch((error) => {
            console.log('Error caught in comments delete', error)
        })
    }

    const handleOnReportPressed = () => {
        axios.post(`http://${ipAdandP}/api/moderation/add?commentID=${comment['commentID']}`).
            catch((error) => {
                console.log('Error caught in comments report', error)
            }
        )
    }

    const handleOnAddFriendPressed = () => {
         setModalVisible(true);
    }
    
    return (
        <View style={styles.container}>
            {/**Make the avater of the user pressable */}
            {/* <Pressable onPress = {handleAvatarPressed}>  */}
            <Image source={{ uri: CommentItems['Picture'] }} style={styles.img} />
            {/* </Pressable> */}
            <ConnectionHandler modalVisible={modalVisible} setModalVisible={setModalVisible} potentialFriendName={CommentItems['User']} />
            <View style ={styles.rightContainer}>
                <View style={styles.row}>
                    <Text style={styles.name}>{CommentItems['User']}</Text>   

                     {/* This part of the code is more options for when user want to delete their comments */}
                    <TouchableOpacity onPress={() => handleIconPressed('more')}
                        onLayout={(event) => {
                        const layout = event.nativeEvent.layout;
                        setEllipsisPosition({
                            x: layout.x,
                            y: layout.y + layout.height, // Position it right below the icon
                            width: layout.width,
                            height: layout.height,
                        });
                    }}>
                        <Ionicons name={buttonState.more ? 'ellipsis-vertical' : 'ellipsis-vertical-outline'} size={25} />
                </TouchableOpacity>
                    {buttonState.more &&
                        (<View style={{
                        position: 'absolute',
                            // Align to the left of the ellipsis, if individual post then minus 150 else 200
                                left: Math.min(ellipsisPosition.x, screenWidth - (hide? 200: 150)),  
                                top: ellipsisPosition.y,    // Position it right below the ellipsis
                                zIndex: 1,                  // Ensure it's above other elements
                    }}>
                        
                            <MoreOptions 
                            onDelete={handleOnDeletePressed}
                            isCurrentUser={isCurrentUser}
                            isAdmin = {areBothAdminsorUsers}
                            onReport={handleOnReportPressed}
                            onAddFriend={handleOnAddFriendPressed}
                        />
                        </View>)}
                </View>
                <Text>{CommentItems['Comment Content'] }</Text>
                 <View flexDirection={'row'}  >
                     {/* Render the buttons for the post*/}
                    <TouchableOpacity onPress={() => handleIconPressed('liked')}>
                        <Ionicons name={buttonState.liked ? 'thumbs-up' : 'thumbs-up-outline'} size={25} />
                         <Text>{likeCounter} {likeCounter > 1 ? 'Likes' : 'Like'}</Text>
                    </TouchableOpacity>

                    {!hide && <TouchableOpacity onPress={() => handleIconPressed('commentsVisible')}>
                        <Ionicons name={buttonState.commentsVisible ? 'chatbubble' : 'chatbubble-outline'} size={25} paddingHorizontal={10} style ={{marginLeft:10}} />
                        <Text style={{marginLeft:10}}>Comments</Text>
                    </TouchableOpacity>}
                </View>
                
                {/* Conditionally render the chat section */}
                {buttonState.commentsVisible && (loadingComments? <Text>Loading</Text>:
                    <ScrollView nestedScrollEnabled>
                        <FlatList 
                            data={replies}
                            ref={flatListRef}
                            renderItem={({ item }) => <ReplyToComments ReplyItems={item}  />} />
                        <MessageInput updateList={handleNewMessage} replyItems={true} /> 
                    </ScrollView>
                )}

            </View> 
            
         </View> 
            
    )
}

export default Comments;
