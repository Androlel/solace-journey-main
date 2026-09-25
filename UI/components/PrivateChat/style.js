import { Image, ImageBackground, StyleSheet, Text, View } from 'react-native';

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'whitesmoke',
    borderWidth: 1,
    borderColor: 'black',
    padding: 10,
   
    
  },
  rightContainer: {
    flex: 1,
    justifyContent: 'center',
    marginLeft: 10, // Add spacing between the image and text content
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 5,
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
    top: 10, // Bring badge closer to the top of the image
    left: 50, // Fine-tune the horizontal position to overlap the right edge of the image
  },
  badgeText: {
    color: 'white',
    fontSize: 12,
    fontWeight: 'bold',
  },
  text: {
    color: 'grey',
    fontSize: 14,
  },
  img: {
    height: 50,
    width: 50,
    borderRadius: 25, // Circular image
    marginRight: 10,
  },
  name: {
    fontWeight: 'bold',
    fontSize: 16,
    color: '#000',
  },
});



export default styles;