import { StyleSheet } from "react-native";

const styles = StyleSheet.create({
  buttonContainer: {
    position: 'absolute',
    right: 20,
    bottom: 20,
    backgroundColor: 'blue',
    borderRadius: 50,
    padding: 10,
  },
  modalOverlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalContainer: {
    backgroundColor: 'white',
    padding: 20,
    width: 300,
    borderRadius: 10,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  input: {
    height: 40,
    borderColor: 'gray',
    borderWidth: 1,
    marginBottom: 10,
    paddingLeft: 8,
  },
  addEventButton: {
    paddingBottom: 5
  },
  pressable: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 5,
  },
  editButton: {
    marginRight: 10
  }
});
export default styles