import { StatusBar } from 'expo-status-bar';
import { Image, ImageBackground, StyleSheet, Text, View } from 'react-native';


export default function MapPage() {
  return (
    <View style={styles.container}>
      <ImageBackground
        opacity = {0.4}
        style={styles.backgroundImage}
        source={require('../assets/act-icon.png')}>
      </ImageBackground>
      <StatusBar style="auto" />
      </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
  }
  ,
  backgroundImage:{
    flex: 1,
    resizeMode: 'cover',
    width: "100%"
  },
});