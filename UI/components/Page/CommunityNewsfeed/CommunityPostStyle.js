/**
 * Style for post screen
 */

import { StyleSheet } from 'react-native';

const styles = StyleSheet.create({
  page: {
    backgroundColor: 'whitesmoke',
    flex: 1
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
});

export default styles;