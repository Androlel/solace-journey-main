import { StyleSheet, Dimensions } from "react-native";

const screenWidth = Dimensions.get('window').width;

const styles = StyleSheet.create({
  container: {
        marginTop: 40,
        width: screenWidth, // Each item takes the full width of the screen
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: 'white',
        borderRadius: 8,
        borderWidth: 2, // Set border width
        borderColor: '#080640', // Set your desired border color here
        elevation: 2, // for shadow on Android
        padding: 10, // Inner padding
    },
    img: {
        height: 150, 
        width: 150, 
        borderRadius: 8,
       marginRight: 10,
     
    },
    rightContainer: {
      flex: 1,
      paddingRight: 5
    },
    row: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    name: {
        fontWeight: 'bold',
        fontSize: 18, // Size for word display
    },
    content: {
      marginTop: 2, // how far is the current to the one atop it
      fontSize: 14, //Size of word display
    },
});
export default styles