/**
 * Tab screen for user relation, 1 for chatting, 1 for adding friends
 */
import { StyleSheet,View } from 'react-native';
import { createMaterialTopTabNavigator , createNativeStackNavigator} from '@react-navigation/material-top-tabs';
import FriendRequestPage from '../Page/UserRelation/FriendRequestPage/FriendRequestPage';
import PrivateChatNav from './PrivateChatNav';

const Tab = createMaterialTopTabNavigator();
const UserRelationNav = () => {
    return (
        <View style={styles.tabContainer}> 
        <Tab.Navigator >
            <Tab.Screen name="Private chat" component={PrivateChatNav} />
            <Tab.Screen name="Friends request" component={FriendRequestPage} />   
        </Tab.Navigator>
        </View>
)};
export default UserRelationNav;

const styles = StyleSheet.create({
    tabContainer: {
        marginTop: 50, // Adjust this value to lower the tab
        flex: 1, // Make sure the container takes the full height
    },
})
