import Activities from "../../ActivitiesPage/Activities/Activities"
import { FlatList,View, StatusBar,StyleSheet, Dimensions  } from "react-native"
import RecPathsData from "../../../../assets/dummy-data/RecActivities"
import IndivdualRecPaths from "./IndividualRecPath";

const screenWidth = Dimensions.get('window').width;

const RecPaths = () => {
    return (
        <View>
        <FlatList 
        data={RecPathsData}
        renderItem={({ item }) => <IndivdualRecPaths ActivityItem={item} />}
        horizontal={true}  
        snapToInterval={screenWidth}
        pagingEnabled={true}
        decelerationRate="fast"
        bounces={false}
      />       
      <StatusBar style="auto" />
      </View>
    )
}
export default RecPaths

const styles = StyleSheet.create({
    container: {
        flexDirection: 'row',
    paddingVertical: 50,
    backgroundColor: 'white',
    }
})
