import { StyleSheet } from "react-native";

const styles = StyleSheet.create({
  container: {
    
    backgroundColor: 'white',
    
  }
  ,
  backgroundImage:{
    flex: 1,
    resizeMode: 'cover',
    width: "100%"
  },
  page: {
        flex: 1,
        paddingVertical: 350,
        alignItems: 'center',
      backgroundColor: '#f0f0f0',
    },
   loadingText: {
        fontSize: 24,
        fontWeight: '500',
        color: '#333', // Tomato color
        fontFamily: 'Cochin', // Or any custom font you prefer
    },
});
export default styles