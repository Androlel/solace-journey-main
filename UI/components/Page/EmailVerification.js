/**
 * Verify your email is yours for signup and forgot password
 */
import { StatusBar } from 'expo-status-bar';
import { Image, ImageBackground, StyleSheet, Text, View } from 'react-native';
import InputText from './InputField';
import MyButton from '../../Button';
import { useForm } from 'react-hook-form';
import { useNavigation } from '@react-navigation/native';
import axios from 'axios';
import { ipAdandP } from './IPsAndOther';
import DismissKeyboard from '../../DismissKeyboard'; 

const EmailVerification = () => {
    const navigation = useNavigation();
    const { control, handleSubmit } = useForm();
    
    /**
    Handle when the user input verification code
````@param {*} credentials */
    const handleVerify = (credentials) => {
    let { otp } = credentials
    const url = `http://${ipAdandP}/verify?otp=${otp}`;
        axios.get(url).then((response) => {
          const { message, status, data } = response;
          console.log('THis is status')
          console.log(status)
          console.log('THis is message')
          console.log(message)
          console.log('THis is data')
          console.log(data)
          if (status === 201)
          {
            const user = data["name"]
            console.log(user);
            navigation.navigate("Login page", { username: user });
          }
          else if (status === 200)
          {
            navigation.navigate("Reset Password", { inputEmail: data })
          }
          else
          {
            handleMessage(message);
          }
        }).catch(error => {
            console.log("Error catched: ", error.response.data);
            handleMessage("An error occured");
        });
    }

    return (
    <DismissKeyboard>
    <View style={styles.container}>
      <ImageBackground source={require('../../assets/Login-img.png')} 
        opacity = {0.4}
        style={styles.backgroundImage}>

        <Text style={styles.text} top={140}>Verification code</Text>
        <Text style={styles.text} top={140}>Input the verification code that was sent to your registered email</Text>
        <InputText
          placeholder={""}
          name="otp"
          control={control} top={200}
          rules={{ required: 'Verification code is required' }} />

        <MyButton text={"Submit"} top={50} onPress={handleSubmit(handleVerify)} />
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
    fontSize: 15,
    marginHorizontal: 100
  }
});

export default EmailVerification;