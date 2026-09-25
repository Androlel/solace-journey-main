import Activities from "../../ActivitiesPage/Activities/Activities"
import { FlatList,View, StatusBar,StyleSheet, Dimensions  } from "react-native"
import RecActivitiesData from "../../../../assets/dummy-data/RecActivities"
import IndivdualRecActivities from "./IndividualRecActivities"

const screenWidth = Dimensions.get('window').width;

const RecActivities = () => {
    return (
        <View>
        <FlatList 
        data={RecActivitiesData}
        renderItem={({ item }) => <IndivdualRecActivities ActivityItem={item} />}
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
export default RecActivities


