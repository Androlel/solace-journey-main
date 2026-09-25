/**
 * Forgot password screen for user to input email to make a new password
 */

import { StatusBar } from 'expo-status-bar';
import { ImageBackground, Text, View } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useForm } from 'react-hook-form';
import InputText from '../InputField';
import MyButton from '../../../Button';
import axios from 'axios';
import styles from './ForgotPasswordStyle';
import { ipAdandP } from '../IPsAndOther';
import DismissKeyboard from '../../../DismissKeyboard';

const EMAIL_REGEX = /^[A-Za-z0-9._%-]+@[A-Za-z0-9.-]+[.][A-Za-z]{2,4}$/

const ForgotPassword = () => {

  const navigation = useNavigation();
  const { control, handleSubmit, watch } = useForm();
  const pwd = watch('password')
  
  /**
   * 
   * @param {*} credentials contains user email, who wanted to retrieve their password
   */
    const handleSubmitPressed = (credentials) => {
    const { Email } = credentials;
    const url = `http://${ipAdandP}/fpemail?email=${encodeURIComponent(Email)}`;
        
    axios.get(url).then((response) => {
      const { message, status, data } = response;
      console.log(status)
      if (status !== 200) {
        handleMessage(message);
      }
      else
      {
        navigation.navigate("Email verification");
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
    <DismissKeyboard>
    <View style={styles.container}>
      <ImageBackground source={require('../../../assets/Login-img.png')} 
        opacity = {0.4}
        style={styles.backgroundImage}>
        
        <Text style={styles.text}>Forgot your password?</Text>
        <Text style={styles.text1}>Please input the email you register with us</Text>       
             
        <InputText
          name ={"Email"}
          placeholder={"Email"}
          control={control}
          rules={{
            required: 'Email is required',
            pattern: { value: EMAIL_REGEX, message: 'Email is invalid' }
          }}
          top={200} />   
        
        <MyButton text={"Submit"} top={30} onPress={handleSubmit(handleSubmitPressed)} />
        <MyButton text={"To login"} top={30} onPress={onReturnToLoginPressed} />
        
      </ImageBackground>
      <StatusBar style="auto" />
      </View>
      </DismissKeyboard>
  );
}

export default ForgotPassword;