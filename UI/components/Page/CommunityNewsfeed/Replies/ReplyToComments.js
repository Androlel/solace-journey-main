import styles from "./ReplyToCommentsStyle"
import { View, Text, TouchableOpacity,Pressable, Image , Dimensions} from "react-native"
import { useState, useEffect } from "react";
import { Ionicons } from '@expo/vector-icons';
import { curUser,ipAdandP } from "../../IPsAndOther";
import MoreOptions from "../MoreOptionsHandler/MoreOptionsHandler";
import ConnectionHandler from "../../UserRelation/ConnectionHandler";

const ReplyToComments = ({ ReplyItems, likes }) => {
    //Set the more options menu to be below the icons
    const [ellipsisPosition, setEllipsisPosition] = useState(null);
    //Get the screen width prevent more options menu to be off screen
    const screenWidth = Dimensions.get('window').width;
     // Check if the comment is from the current user
    const isCurrentUser = ReplyItems['User'] === curUser.user;
    //Check if the targeted commentor is an admin or a user than compare against the current user
    const areBothAdminsorUsers = ReplyItems['Admin'] === curUser.isAdmin;
       // State for modal visibility
    const [modalVisible, setModalVisible] = useState(false);
    const [likeCounter, setLikeCounter] = useState(likes ? likes : ReplyItems['Reply Likes']);
    const [postLiked, setPostLiked] = useState(ReplyItems['User Liked'])

    /**
     * Setting the initial state for all your button
     */
    const [buttonState, setButtonState] = useState({
        liked: ReplyItems['User Liked'],
        more: false
    });
    
    const handleIconPressed = (button) => {
       setButtonState(prevState => ({
            ...prevState,
            [button]: !prevState[button],
        }));
    }
    
     //Keep the like State in check, if changed make an axios called to the DB to update likes counter
    useEffect(() => {
        if (buttonState.liked && !postLiked) {
            //Fetching data from the database
            axios.put(`http://${ipAdandP}/api/posts/replyLikes?replyID=${ReplyItems['replyID']}&user=${curUser.user}&increase=${buttonState.liked ? 1 : 0}`)
                .then(response => {
                    setLikeCounter(prevLikes => {
                        const newLikes = prevLikes + 1
                        return newLikes
                    })
                    setPostLiked(true)
                })
                .catch(error => console.error("Error fetching liking post:", error));
        }
        else if (!buttonState.liked && postLiked) {
             axios.put(`http://${ipAdandP}/api/posts/replyLikes?replyID=${ReplyItems['replyID']}&user=${curUser.user}&increase=${buttonState.liked ? 1 : 0}`)
                .then(response => {
                    setLikeCounter(prevLikes => {
                        var newLikes = 0
                        if (prevLikes >= 1) {
                             newLikes = prevLikes - 1
                        }
                        return newLikes
                    })
                    setPostLiked(false)
                })
                .catch(error => console.error("Error fetching liking for replies to comments:", error));}
    }, [buttonState.liked, postLiked]);

    //This funtion hanlde deleting user comments
    const handleOnDeletePressed = () => {
         axios.delete(`http://${ipAdandP}/api/posts/delete/reply?replyID=${ReplyItems['replyID']}`).
        catch(error => console.error("Error deleting replies:", error));
    }

    const handleOnReportPressed = () => {
        //TODO: rewired this report add reason to the report by poping up a modal
         axios.post(`http://${ipAdandP}/api/moderation/add?replyID=${ReplyItems['replyID']}`).
            then(
                repsonse => {}
            ).
            catch((error) => {
                console.log('Error caught in replies to comments report', error)
            }

        )
    }

    const handleOnAddFriendPressed = () => {
         setModalVisible(true);
    }
    
    return (
        <View style={styles.container}>
            {/**Make the avater of the user pressable */}
            <Image source={{ uri: ReplyItems['Picture'] }} style={styles.img} />
            <ConnectionHandler modalVisible={modalVisible} setModalVisible={setModalVisible} name={ReplyItems['User']} />
               <View style={styles.rightContainer}>
                <View style={styles.row}>
                    <Text style={styles.name}>{ReplyItems['User']}</Text>  

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
                                left: Math.min(ellipsisPosition.x, screenWidth -  200),  
                                top: ellipsisPosition.y,    // Position it right below the ellipsis
                                zIndex: 1,                  // Ensure it's above other elements
                            }}>
                            <MoreOptions 
                            onDelete={handleOnDeletePressed}
                            isCurrentUser={isCurrentUser}
                            isAdmin={areBothAdminsorUsers}
                            onReport={handleOnReportPressed}
                            onAddFriend={handleOnAddFriendPressed}
                        />
                        </View>)}
                    
                </View>
                <Text>{ReplyItems['Reply Content'] }</Text>
                 <View flexDirection={'row'}  >
                     {/* Render the buttons for the post*/}
                    <TouchableOpacity onPress={() => handleIconPressed('liked')}>
                        <Ionicons name={buttonState.liked ? 'thumbs-up' : 'thumbs-up-outline'} size={25} />
                        <Text>{ReplyItems['Reply Likes'] } {buttonState.liked ? 'Liked' : 'Like'}</Text>
                    </TouchableOpacity>
                     
                   
                </View>
            </View>
        </View>)
}
export default ReplyToComments