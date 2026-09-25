import { Button, StyleSheet } from "react-native";
import { Dimensions } from "react-native";
import Constants from "expo-constants";

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#E0F7F7", // Soft blue-green background
    alignItems: "center",
    justifyContent: "center",
  },
  map: {
    width: Dimensions.get("window").width,
    height: Dimensions.get("window").height,
  },
  searchContainer: {
    position: "absolute",
    width: "80%",
    backgroundColor: "rgba(191, 233, 191, 0.9)", // Solid soft green
    paddingHorizontal: 4,
    paddingVertical: 4,
    paddingTop: 15,
    paddingBottom: 15,
    borderRadius: 8,
    elevation: 0,
    top: Constants.statusBarHeight + 10,
  },  
  input: {
    borderColor: "#3E773E", // Dark green
    borderWidth: 1,
    padding: 6,
    borderRadius: 4,
    width: "100%",
    color: "#3E773E", // Text color matching the border
  },
  button: {
    backgroundColor: "#68B8B8", // Teal
    paddingVertical: 8,
    marginTop: 12,
    borderRadius: 4,
    width: "90%",
    alignSelf: "center",
  },
  buttonText: {
    textAlign: "center",
    fontSize: 14,
    color: "white",
  },
  routeInformationContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 8,
    marginVertical: 6,
  },
  directionsButton: {
    backgroundColor: "#68B8B8", // Teal
    flex: 1,
    paddingVertical: 8,
    marginTop: 12,
    marginLeft: 8,
    borderRadius: 4,
    width: "90%",
    alignSelf: "center",
  },
  picker: {
    minHeight: 20,
    borderColor: "#3E773E", // Dark green
    borderWidth: 1,
    borderRadius: 1,
    marginTop: 0,
    width: "80%",
    alignSelf: "center",
    color: "#3E773E", // Dark green text
    backgroundColor: "rgba(191, 233, 191, 0.8)", // Soft green background with transparency
  },
  pickerItem: {
    color: "#3E773E", // Dark green text
  },
  slider: {
    width: "80%",
    marginTop: 4,
    alignSelf: "center",
  },trailSearchText: {
    textAlign: "center",
    fontSize: 14,
    color: "#3E773E", // Dark green text
  },
  pickerSelection: {
    backgroundColor: "rgba(191, 233, 191, 1)", // Light green 
    padding: 8,
    color: "#3E773E", // Dark green
    fontSize: 16,
    width: "80%",
    alignSelf: "center", 
    marginVertical: 8,
  },
});

export default styles;
