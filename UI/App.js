
import { SafeAreaView } from 'react-native-web';
import { AppRegistry } from 'react-native';
import Navigation from './components/Navigations/Navigation';
import { name as appName } from './app.json';
import { readAsStringAsync, getInfoAsync, documentDirectory, writeAsStringAsync } from 'expo-file-system'


export let curUser = {
  user: '',
  token: '',
  avatar: ''
}

let cookieURI = documentDirectory + "Cookies/current.txt";
let readToken = async () => {
  let fileExists = await getInfoAsync(chatUri)
  console.log("file exists:", fileExists.exists)
  if (fileExists.exists) {
    curUser.token = await readAsStringAsync(chatUri)
  }
  return {
    
  }
}





export const ipAdandP = "25.48.33.217:10000"
export const tcpIPandP = "25.48.33.217:6000"
export const ipAD = "25.48.33.217";



export default function App() {

  return (
    
      <Navigation />
    
  );
}

AppRegistry.registerComponent(appName, () => App)


