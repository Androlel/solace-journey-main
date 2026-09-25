/**
 * Stack for private chat lists and rivate chat rooms
 */
import { useRoute,useNavigation } from '@react-navigation/native';

import Post from '../Posts/Posts';
import Comments from '../Comments/Comments';
import { View, FlatList, Text } from 'react-native';
import { curUser, ipAdandP } from '../../IPsAndOther';
import axios from 'axios';
import { useEffect, useState } from 'react';




const IndividualPost = () => {
    //const [loading, setLoading] = useState()
    const route = useRoute();
    console.log(route.params.likes)
    const { likeCounter ,post } = route.params
    console.log("post user liked:", post['User Liked'])
    
    const navigation = useNavigation();
    const [comments, setComments] = useState([]);
    const [loadingComments, setLoadingComments] = useState(false)
    console.log("this is user likes",post["User Liked"])
    useEffect(() => {
        setLoadingComments(true)
        navigation.setOptions({ title: post["Administrator"]})
         axios.get(`http://${ipAdandP}/postComments?postID=${post['postID']}&user=${curUser.user}`).
                then((response => {
                    setComments(response.data);
                    setLoadingComments(false)
        }))
    }, [navigation, post])
    
    return (
        <View flex={1}>
            <Post PostItem={post} disabledCommentsForIndividualPost={true} likes={likeCounter } />
            {loadingComments ? <Text>Loading</Text> :
                <FlatList
                    data={comments}
                    renderItem={({ item }) => <Comments CommentItems={item} CommentsWithReply={true} />} />}
        </View>
    )
}

export default IndividualPost