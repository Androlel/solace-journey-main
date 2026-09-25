/**
 * This is where the placement and style of the post and comment got created for display in CommunityPost
 */

import styles from './PostsStyle';
import { FlatList, Image, Pressable, Text, TouchableOpacity, View, ScrollView } from 'react-native';
import { React, useState, useEffect,useRef } from 'react';
import { Ionicons } from '@expo/vector-icons';
import Comments from '../Comments/Comments';
import MessageInput from '../../../MessageInput';
import { useNavigation } from '@react-navigation/native';
import { ipAdandP, curUser } from '../../IPsAndOther';
import axios from 'axios';


var postCommentCache = {}
var postsCache = {}

const Post = ({ PostItem, disabledCommentsForIndividualPost, likes }) => {
    //console.log("PostItem:", PostItem)
    const navigation = useNavigation()
    const [comments, setComments] = useState([]);
    const [likeCounter, setLikeCounter] = useState(likes ? likes : PostItem['Post Likes']);
    const [postLiked, setPostLiked] = useState(PostItem['User Liked'])
    const [loadingComments, setLoadingComments] = useState(false);
    const flatListRef = useRef(null); // Create a reference for FlatList
    

    //Update UI component for comment on a specific post
    const updateCommentsList = (commentID) => {
          setComments(prevRequest => {
            const updatedRequests = prevRequest.filter((_, index) => index !== commentID);
        // Reassign IDs based on the new index
        updatedRequests.forEach((element, index) => {
            element.id = index; 
        });
        return updatedRequests;
          });
        console.log('updated')
    }

    const updatePostComments = (message, postID) => {
        //Setting a new comments
        const newComment = {
            User: curUser.user,
            Picture: curUser.avatar,
            'Comment Content': message,
            createdAt: new Date().toJSON().slice(0, 19).replace('T', ' '),
        };
        console.log(newComment.createdAt)
        //TODO: if the DB is updated then update the local otherwise resend
        //TODO: when displaying comments make it shorter if the paragraph is too long
        axios.post(`http://${ipAdandP}/api/posts/comment?user=${newComment.User}&content=${newComment['Comment Content']}&posted=${newComment.createdAt}&postID=${postID}`, { timeout: 10000 }).
            then(response => {
                //Update the old list of comments with new one
                disabledCommentsForIndividualPost || !buttonState.commentsVisible ? setComments(prevComments => {
                    const updatedComments = [...prevComments, newComment]
                    return updatedComments
                }) : setComments(prevComments => {
                    const updatedComments = [...prevComments, newComment];
                    flatListRef.current.scrollToEnd({ animated: true });
                    return updatedComments;
                })
            }).catch(error => {
                console.log("Error catched: ", error.response.data);
            })
    }

    const handleNewMessage = (message) => {
        updatePostComments(message, PostItem['postID']);
    };


    // Initialized the state of liked, shared and comments
    const [buttonState, setButtonState] = useState({
        liked: PostItem['User Liked'],
        commentsVisible: false,
        more: false
    });

    const handleIconPressed = (button) => {
        setButtonState(prevState => ({
            ...prevState,
            [button]: !prevState[button],
        }));
    }
    
   
    //Keep the commentsVisible State in check, if changed make an axios called to the DB
    useEffect(() => {
        if (buttonState.commentsVisible) {
            setLoadingComments(true);
            //Fetching data from the database
            axios.get(`http://${ipAdandP}/postComments?postID=${PostItem['postID']}&user=${curUser.user}`,{ timeout: 1000000})
                .then(response => {
                    setComments(response.data);
                    setLoadingComments(false);
                })
                .catch(error => console.error("Error fetching comments:", error));
        }
    }, [buttonState.commentsVisible]);
    
    //Keep the like State in check, if changed make an axios called to the DB to update likes counter
    useEffect(() => {
        if (buttonState.liked && !postLiked) {
            //Fetching data from the database
            axios.put(`http://${ipAdandP}/api/posts/likes?postID=${PostItem['postID']}&user=${curUser.user}&increase=${buttonState.liked ? 1 : 0}`)
                .then(response => {
                    setLikeCounter(prevLikes => {
                        const newLikes = prevLikes + 1
                        PostItem["User Liked"] = 1
                        return newLikes
                    })
                    setPostLiked(true)

                })
                .catch(error => console.error("Error fetching liking post:", error));
        }
        else if(postLiked && !buttonState.liked) {
             axios.put(`http://${ipAdandP}/api/posts/likes?postID=${PostItem['postID']}&user=${curUser.user}&increase=${buttonState.liked ? 1 : 0}`)
                .then(response => {
                    setLikeCounter(prevLikes => {
                        var newLikes = 0
                        if (prevLikes >= 1) {
                           newLikes = prevLikes - 1
                        }
                        PostItem["User Liked"] = 0
                        return newLikes
                    })
                    setPostLiked(false)
                })
                .catch(error => console.error("Error fetching liking post:", error));
        }
}, [buttonState.liked,postLiked]);
    
    /**
     * Navigate to the post that the user clicked on
     */
    const handlePostPress = () => {
        if (!disabledCommentsForIndividualPost) {
            var post = PostItem
            navigation.navigate('Individual Post', { post, likeCounter })
        }
    }

    return (
        <Pressable style={styles.container} onPress={handlePostPress} disabled={disabledCommentsForIndividualPost} >
            <Image source={{ uri: PostItem["Picture"]}} style={styles.img} />
            <View style ={styles.rightContainer}>
                <View style={styles.row}>
                    <Text style={styles.name}>{PostItem["Administrator"]}</Text>   
                    
                </View>

                <Text style={styles.text}>{PostItem["Post Content"]}</Text>
                
                <View flexDirection={'row'}  >
                     {/* Render the buttons for the post*/}
                    <TouchableOpacity onPress={() => handleIconPressed('liked')}>
                        <Ionicons name={buttonState.liked ? 'thumbs-up' : 'thumbs-up-outline'} size={25} />
                        <Text>{likeCounter} {likeCounter > 1 ? 'Likes' : 'Like'}</Text>
                    </TouchableOpacity>

                    {!disabledCommentsForIndividualPost && <TouchableOpacity onPress={() => handleIconPressed('commentsVisible')}>
                        <Ionicons name={buttonState.commentsVisible ? 'chatbubble' : 'chatbubble-outline'} size={25} paddingHorizontal={15} style={{ marginLeft: 10 }} />
                        <Text style={{marginLeft:10}}>Comments</Text>
                    </TouchableOpacity>}
                </View>

                {/*The user can post their comments using this
                TODO: make the comment that the user post visible*/}
                <MessageInput updateList={handleNewMessage} postComments={true} postID ={ PostItem.id}/>
                
                    {/* Conditionally render the chat section */}
                {buttonState.commentsVisible && (loadingComments ? <Text>loading</Text> :
                    <ScrollView nestedScrollEnabled>
                    <FlatList 
                        data={comments}
                        ref={flatListRef}
                        extraData={comments}
                            renderItem={({ item }) => <Comments CommentItems={item} hide={!disabledCommentsForIndividualPost} updateCommList={ updateCommentsList} />} />    
                    </ScrollView>
                )}

            </View> 
        </Pressable>
    )
}


export default Post;