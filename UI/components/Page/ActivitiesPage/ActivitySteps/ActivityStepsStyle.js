import { StyleSheet } from "react-native";

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    paddingVertical: 10,
    backgroundColor: 'white',
  },
  rightContainer: {
    flex: 1,
    flexDirection: 'row', 
    alignItems: 'flex-start',
  },
  //Button and content stacking
  contentContainer: {
    flex: 1,
    flexDirection: 'column',
    marginLeft: 10, 
  },
  text: {
    color: 'black',
    fontSize: 15,
    marginBottom: 8,  
  },
  button: {
    backgroundColor: "#bbb",
    paddingVertical: 12,
    borderRadius: 4,
    width: '80%',
    marginRight: '10%',
  },
  buttonText: {
    textAlign: "center",
  },
  img: {
    height: 150,
    width: 150,
    borderWidth: 1,
    borderColor: 'black',
    marginRight: 10,
  },
  video: {
    height: 150,
    width: 150,
    borderWidth: 1,
    borderColor: 'black',
    marginRight: 10,
  },
  name: {
    fontWeight: 'bold',
    fontSize: 18,
    marginBottom: 3,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
});

export default styles;
