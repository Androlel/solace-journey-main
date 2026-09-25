/**
 * This the style sheet for the individual comments on the posts
 */
import { StyleSheet } from "react-native";

const styles = StyleSheet.create({
    container: {
    flexDirection: 'row',
    paddingVertical: 10,
    backgroundColor: 'whitesmoke',
    
  },
  rightContainer: {
    flex: 1,
    justifyContent: 'center'
    },
    content: {
       flex: 1,
  marginTop: 20,
  borderWidth: 1, 
  paddingHorizontal: 10,
  paddingVertical: 15,   // Adding vertical padding for height
  borderRadius: 50,      // This creates the oval shape (increase value for more roundness)
  alignItems: 'center',  // This centers the content horizontally (optional)
  justifyContent: 'center', // This centers the content vertically (optional)
  },
  badgeContainer: {
    backgroundColor: '#3777f0',
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: 'white',
    justifyContent: 'center',
    alignItems: 'center',
    position: 'absolute',
    left: 45,
    top: 10
  },
  
  badgeText: {
    color: 'white',
    fontSize: 12
    
  },
  text: {
    color: 'grey',
    fontSize: 12
  },
  img: {
    height: 50,
    width: 50,
    borderRadius: 30,
    marginRight: 10,  
  },
  name: {
    fontWeight: 'bold',
    fontSize: 18,
    marginBottom: 3
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  backgroundImage:{
    flex: 1,
    resizeMode: 'cover',
    width: "100%"
  },
   
});

export default styles;