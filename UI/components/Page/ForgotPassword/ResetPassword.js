import { StatusBar } from 'expo-status-bar';
import {ImageBackground,Text, View } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useForm } from 'react-hook-form';
import InputText from '../InputField';
import MyButton from '../../../Button';
import axios from 'axios';
import styles from './ResetPasswordStyle';
import { ipAdandP } from '../IPsAndOther';

const EMAIL_REGEX = /^[A-Za-z0-9._%-]+@[A-Za-z0-9.-]+[.][A-Za-z]{2,4}$/

const ResetPassword = ({ route }) => {
  const navigation = useNavigation();
  const { control, handleSubmit, watch } = useForm();
  const pwd = watch('password')
  
  /**
   * 
   * @param {*} credentials contains new user email and password
   */
 const handleSubmitPressed = (credentials) => {
     const { password } = credentials;

     //TODO: change if necessary Save the customer email
     Email = route.params.inputEmail
     console.log(Email)
   
    const url = `http://${ipAdandP}/api/users/pwd?newPassword=${encodeURIComponent(password)}&email=${encodeURIComponent(Email)}`;
     
    axios.put(url).then((response) => {
      const { message, status, data } = response;
      console.log(status)
      if (status !== 200) {
        handleMessage(message);
      } else {
        navigation.navigate("Login page");
      }

    }).catch(error => {
      console.log("Error catched: ", error.response.data);
      handleMessage("An error occured");
    });
  };

  /**
   * Handle it when the user tab on the to login button, take the user back to the login screen
   */
  const onReturnToLoginPressed = () => {
    navigation.navigate("Login page");
  };

  return (
    <View style={styles.container}>
      <ImageBackground source={require('../../../assets/Login-img.png')} 
        opacity = {0.4}
        style={styles.backgroundImage}>
        
        <Text style={styles.text}>Create a new password</Text>     
       
    
        <InputText
          placeholder={"Password"}
          name="password"
          control={control}
          rules={{
            required: 'Password is required',
            minLength:{value: 8, message: 'Password should be at least 8 characters long'}  }}
          top={250} secureEntry />
        
        <InputText placeholder={"Password re-enter"}
          name="Password re-enter"
          control={control}
          rules={{
            required: 'Please re-enter your password',
          validate: value=> value === pwd || 'Password do not match' }}
          top={50} secureEntry />
        
        <MyButton text={"Submit"} top={30} onPress={handleSubmit(handleSubmitPressed)} />
        <MyButton text={"To login"} top={30} onPress={onReturnToLoginPressed} />
        
      </ImageBackground>
      <StatusBar style="auto" />
      </View>
  );
}

export default ResetPassword;