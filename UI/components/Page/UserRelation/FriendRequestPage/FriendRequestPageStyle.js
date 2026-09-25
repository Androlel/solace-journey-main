import { StyleSheet } from "react-native";

const styles = StyleSheet.create({
emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#555',
    textAlign: 'center',
  },
  subText: {
    fontSize: 14,
    color: '#888',
    marginTop: 10,
    textAlign: 'center',
  },
  container: {
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
})

export default styles