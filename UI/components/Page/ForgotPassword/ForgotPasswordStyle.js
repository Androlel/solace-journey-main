import { StyleSheet } from 'react-native';

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
    fontWeight: 'bold'
    },
   text1: {
    top: 150,
    alignSelf: 'center',
    fontSize: 15,
    fontWeight: 'light' 
    
   }
});

export default styles;