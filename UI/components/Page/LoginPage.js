/**
 * Login page
 */
import { StatusBar } from 'expo-status-bar';
import { Image, ImageBackground, StyleSheet, Text, TouchableWithoutFeedback, View, Keyboard } from 'react-native';
import InputText from './InputField';
import MyButton from '../../Button';
import { useForm, Controller,setError, set } from 'react-hook-form';
import { useNavigation } from '@react-navigation/native';
import axios from 'axios';
import { useState,  } from 'react';
import {curUser, ipAdandP} from './IPsAndOther'
import DismissKeyboard from '../../DismissKeyboard';


const Login = ({ route }) => {

  const navigation = useNavigation();
  const { control, handleSubmit,setError, formState:{errors},} = useForm();


  
  /**
   * Send information to the DB, on login page
   * @param {*} credentials: an object containing userID and password
   */
  const handleLogin = (credentials) => {
    const {userID, password} = credentials;
    const url = `http://${ipAdandP}/login?loginID=${encodeURIComponent(userID)}&pwd=${encodeURIComponent(password)}`;
    console.log('login pressed', credentials)
    //navigation.navigate("TabNavigator");

    
    axios.get(url).then((response) => {
      const { message, status, data } = response;
      const {loggedInUser, loggedInAvatar,loggedInIsAdmin} = data
      console.log(status)
      if (status !== 200) {
        handleMessage(message);
      } else {
        
        let accessString = response.headers['set-cookie'][0]
        let accessToken = accessString.slice(13, accessString.indexOf(';'))
        curUser.user = loggedInUser
        curUser.token = accessToken
        curUser.avatar = loggedInAvatar
        curUser.isAdmin = loggedInIsAdmin
        console.log('im here')
        navigation.navigate("TabNavigator");
      }
    }).catch(error => {
      console.log("Error catched: ", error.response.data);
     
      // If the error message indicates an issue with the userID or password, set the error accordingly
      if (error.response.data.includes('Username')) {
        setError('userID', { type: 'manual', message: error.response.data });
        
      } else if (error.response.data.includes('Password')) {
         setError('password', { type: 'manual', message: error.response.data });
      }
    })
  };


  /**
   * Handle navigation to sign up page 
   */
  const onSignupPressed = () => {
    navigation.navigate("SignUp")
  }

  /**
   * Navigate to forgot password page
   */
  const onForgotPasswordPressed = () => {
    navigation.navigate("Forgot Password")
  }

  return (
    <DismissKeyboard>
    <View style={styles.container}>
      <ImageBackground source={require('../../assets/Login-img.png')} 
        opacity = {0.4}
        style={styles.backgroundImage}>
        
        {/*Textbox for user to input their login name/email*/}
        <Text style={styles.title}>Login to your account</Text>
        <InputText
          name="userID"
          placeholder={"Username/Email"}
          control={control} top={140}
          rules={{
            required: 'Username or email is required',
            validate: errors.userID? errors.userID.message : ''}} />
        
        {/*Textbox for user to input their password*/}
        <InputText
          name="password"
          placeholder={"Password"}
          control={control}
          top={50} secureEntry
          
          rules={{
                  required: 'Password is required',
            minLength: { value: 8, message: 'Password should be at least 8 characters long' },
            validate: errors.password? errors.password.message : '' }} />
        
        <MyButton text={"Log in"} top={50} onPress={handleSubmit(handleLogin)}/>
        <MyButton text={"Sign up"} top={30} onPress={onSignupPressed} />
        <MyButton  top={30} text={"Forgot Password?"} onPress={onForgotPasswordPressed} />
        
      </ImageBackground>
      <StatusBar style="auto"/>
      </View>
      </DismissKeyboard>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
  },
  backgroundImage:{
    flex: 1,
    resizeMode: 'cover',
    width: "100%"
  },
  title: {
    textAlign: 'center',
    padding: 15,
    marginTop: 30,
    fontWeight: 'bold',
    fontSize: 30,
    top: 100 
  }
});

export default Login;