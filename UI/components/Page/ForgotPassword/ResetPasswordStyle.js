import { Image, ImageBackground, StyleSheet, Text, View } from 'react-native';
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
    top: 200,
    alignSelf: 'center',
    fontSize: 30
  }
});
export default styles