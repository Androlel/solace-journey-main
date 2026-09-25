/**
 * Stack for private chat lists and rivate chat rooms
 */

import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from "@react-navigation/native-stack"
import ActivitiesPage from '../Page/ActivitiesPage/ActivitiesPage';
import IndivdualActivity from '../Page/ActivitiesPage/IndividualActivity/IndividualActivity';
import Maps from "../maps/Maps";


const Stack = createNativeStackNavigator();
const ActivitiesNav = () => {
    return (
        <Stack.Navigator >
            <Stack.Screen screenOptions={{ headerShown: false }}name="Activity" component={ActivitiesPage} />
            <Stack.Screen screenOptions={{ headerShown: true  }}name="Individual Activity" component = {IndivdualActivity}/>
            <Stack.Screen screenOptions={{ headerShown: false  }}name="Maps" component = {Maps}/>
        </Stack.Navigator>)
};
export default ActivitiesNav;