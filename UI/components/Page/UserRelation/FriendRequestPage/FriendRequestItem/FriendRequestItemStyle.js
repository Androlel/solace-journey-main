/**
 * This the style sheet for the individual friend request
 */
import { StyleSheet } from "react-native";

const styles = StyleSheet.create({
    container: {
    flexDirection: 'row',
    paddingVertical: 10,
    borderWidth: 1
  },
  accceptButton: {
    backgroundColor: '#3E97FE',
    height: 40,
    width: "30%",
    alignSelf: 'center',
    padding: 10,
    borderRadius: 6,
  },

  rightContainer: {
    flex: 1,
    justifyContent: 'center'
    },
    content: {
      flex: 1,
      marginTop: 10,
      paddingBottom: 10
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
  buttonText: {
    fontWeight: '700',
    textAlign: 'center',
    letterSpacing: 0.25,
    
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
    justifyContent: 'space-evenly',
  },
  backgroundImage:{
    flex: 1,
    resizeMode: 'cover',
    width: "100%"
  },
   chatTitle: {
        fontWeight: 'bold',
        marginBottom: 5,
    },
    chatMessage: {
        flexDirection: 'row',
        marginBottom: 5,
    },
    chatUser: {
        fontWeight: 'bold',
        marginRight: 5,
    },
});

export default styles;