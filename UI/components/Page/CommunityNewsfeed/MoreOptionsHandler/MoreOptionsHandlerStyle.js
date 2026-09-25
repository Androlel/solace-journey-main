import { StyleSheet } from "react-native";
const styles = StyleSheet.create({
  popover: {
    position: 'absolute',
    right:-80, // Ensure the component is anchored to the right
    padding: 12,
    backgroundColor: 'white',
    borderRadius: 8,
    shadowColor: 'black',
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 5,
  },
  optionText: {
    fontSize: 16,
    color: 'black',
  },
});


export default styles