import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from "@react-navigation/native-stack"
import Login from '../Page/LoginPage';
import TabNavigator from './TabNavigator';
import SignUp from '../Page/SignUp';
import EmailVerification from '../Page/EmailVerification';
import ForgotPassword from '../Page/ForgotPassword/ForgotPassword';
import ResetPassword from '../Page/ForgotPassword/ResetPassword';
const Stack = createNativeStackNavigator();
const Navigation = () => {
    return (<NavigationContainer>
        <Stack.Navigator screenOptions={{ headerShown: false }}>
            <Stack.Screen name="Login page" component={Login} />
            <Stack.Screen name="SignUp" component={SignUp} />
            <Stack.Screen name="Email verification" component={EmailVerification} />
            <Stack.Screen name="Forgot Password" component={ForgotPassword} />
            <Stack.Screen name ="Reset Password" component ={ResetPassword}/>
            <Stack.Screen name="TabNavigator" component={TabNavigator} />
        </Stack.Navigator>
    </NavigationContainer>);
};
export default Navigation;