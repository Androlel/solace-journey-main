import { StatusBar } from 'expo-status-bar';
import { Image, ImageBackground, StyleSheet, Text, View } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useForm } from 'react-hook-form';
import InputText from './InputField';
import MyButton from '../../Button';
import axios from 'axios';
import { ipAdandP } from './IPsAndOther';
import DismissKeyboard from '../../DismissKeyboard';

const EMAIL_REGEX = /^[A-Za-z0-9._%-]+@[A-Za-z0-9.-]+[.][A-Za-z]{2,4}$/

const SignUp = () => {
  const navigation = useNavigation();
  const { control, handleSubmit, watch } = useForm();
  const pwd = watch('password')
  
  /**
   * 
   * @param {*} credentials contains new user email and password
   */
 const handleSignUp = (credentials) => {
    const { Email, password} = credentials;
    const url = `http://${ipAdandP}/register?pwd=${encodeURIComponent(password)}&email=${encodeURIComponent(Email)}`;

    console.log({Email,password})
    axios.post(url).then((response) => {
      const { message, status, data } = response;
      console.log(status)
      if (status !== 200) {
        handleMessage(message);
      } else {
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
      <ImageBackground source={require('../../assets/Login-img.png')} 
        opacity = {0.4}
        style={styles.backgroundImage}>
        
        <Text style={styles.text}>Create a new account</Text>     
        <InputText
          name ={"Email"}
          placeholder={"Email"}
          control={control}
          rules={{
            required: 'Email is required',
            pattern: { value: EMAIL_REGEX, message: 'Email is invalid' }
          }}
          top={200} />
        

        <InputText
          placeholder={"Password"}
          name="password"
          control={control}
          rules={{
            required: 'Password is required',
            minLength:{value: 8, message: 'Password should be at least 8 characters long'}  }}
          top={50} secureEntry />
        
        <InputText placeholder={"Password re-enter"}
          name="Password re-enter"
          control={control}
          rules={{
            required: 'Please re-enter your password',
          validate: value=> value === pwd || 'Password do not match' }}
          top={50} secureEntry />
        
        <MyButton text={"Sign up"} top={30} onPress={handleSubmit(handleSignUp)} />
        <MyButton text={"To login"} top={30} onPress={onReturnToLoginPressed} />
        
      </ImageBackground>
      <StatusBar style="auto" />
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
  text: {
    top: 150,
    alignSelf: 'center',
    fontSize: 30,
    fontWeight:'bold'
  }
});

export default SignUp;