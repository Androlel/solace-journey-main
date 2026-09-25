/**
 * Stack for private chat lists and rivate chat rooms
 */
import { createNativeStackNavigator } from "@react-navigation/native-stack"
import PrivateChatRoom from '../Page/PrivateChatRoom';
import PrivateChatList from '../Page/PrivateChatList';
import { StyleSheet,View } from "react-native";


const Stack = createNativeStackNavigator();
const PrivateChatNav = () => {
    return (
        <View style = {styles.stackContainer}>
        <Stack.Navigator >
            <Stack.Screen options={{ headerShown: false }} name="Friend List" component={PrivateChatList} />
                <Stack.Screen options={{ headerShown: false }} name="Chat room" component={PrivateChatRoom} />
            </Stack.Navigator>
        </View>)
};

const styles = StyleSheet.create({
    stackContainer: {
        
        flex: 1, // Make sure the container takes the full height
    },
    privateChatroomContainer: {
        marginTop:-50
    }
})
export default PrivateChatNav;