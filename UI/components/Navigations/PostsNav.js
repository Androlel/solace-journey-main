/**
 * Stack for private chat lists and rivate chat rooms
 */

import { createNativeStackNavigator } from "@react-navigation/native-stack"
import IndividualPost from '../Page/CommunityNewsfeed/IndividualPost/IndividualPost'
import CommunityPost from '../Page/CommunityNewsfeed/CommunityPost';



const Stack = createNativeStackNavigator();
const PostNav = () => {
    return (
        <Stack.Navigator >
            <Stack.Screen screenOptions={{ headerShown: false }}name="Discussions" component = {CommunityPost}/>
            <Stack.Screen screenOptions={{ headerShown: true}}name="Individual Post" component={IndividualPost} />
            </Stack.Navigator>)   
};
export default PostNav;