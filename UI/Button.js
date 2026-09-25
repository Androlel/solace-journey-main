import {
  StyleSheet,
  Text,
  Pressable,
  SafeAreaView,
  Alert,
} from 'react-native';
import * as React from 'react';

const MyButton = ({ text, top, onPress, buttonStyle, textStyle }) => {
  /*Using the default style of the button or if there is a different style use the different one instead */
  return (
    <Pressable
      style={buttonStyle ? buttonStyle : styles.button}  
      marginTop={top}
      onPress={onPress}>
      <Text style={textStyle ? textStyle: styles.text}>{text}</Text>    
    </Pressable>
  );
};

const styles = StyleSheet.create({
  button: {
    height: 40,
    width: "30%",
    alignSelf: 'center',
    padding: 10,
    backgroundColor: 'white',
      borderRadius: 6,
    },

    text: {
    fontWeight: '150',
    textAlign: 'center',
    letterSpacing: 0.25,
  }
});

export default MyButton;