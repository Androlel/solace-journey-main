import MyButton from "../../../Button";
import { View,Text } from "react-native";
import styles from "./MenuStyle";
import { useNavigation } from '@react-navigation/native';
import { disconnect } from "../../PrivateClient";

const Menu = () => {
    const navigation = useNavigation();
    /**
     * Handle the logout button clicked
     */
    const handleLogOutButtonClicked = () => {
        console.log('CLicked')
        disconnect()
        console.log("logged out")
        navigation.navigate("Login page")
    }

    /**
     * Handle the logout button clicked
     */
    const handleSettingButtonClicked = () => {
        console.log('CLicked')
    }

    /**
     * Handle the logout button clicked
     */
    const handleMyProfileButtonClicked = () => {
        console.log('CLicked')
    }
    return (
        <View>
            {/* TODO:Uncomments if necessary */}
            {/* <MyButton top={50} text={'My profile'} onPress={handleMyProfileButtonClicked}/> */}
            <MyButton top={50} text={'Logout'} onPress={handleLogOutButtonClicked} />
            {/* <MyButton top={50} text={'Settings'} onPress={handleSettingButtonClicked}/> */}
        </View>
    )
    
}

export default Menu