import { StyleSheet } from "react-native";

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    paddingVertical: 10,
    backgroundColor: 'whitesmoke',
    borderWidth: 1,
    paddingHorizontal:10
  },
  rightContainer: {
    flex: 1,
    justifyContent: 'center'
    },
    content: {
      flex: 1,
      marginTop:20
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
  flatListContainer: {
    borderWidth: 1,
    backgroundColor: 'white',
  },
  badgeText: {
    color: 'white',
    fontSize: 12
    
  },
  text: {
    color: 'black',
    fontSize: 15
  },
  img: {
    height: 150,
    width: 150,
    borderWidth:1,
    marginRight: 10,  
    borderColor: 'black'
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
})
export default styles;