import {
  Button,
  Image,
  Pressable,
  Text,
  View,
  TouchableOpacity,
} from "react-native";
import React, { useState, useEffect } from "react";
import styles from "./ActivityStepsStyle";
import WebView from "react-native-webview";
import { useRoute, useNavigation } from "@react-navigation/native";
import { ipAdandP } from "../../IPsAndOther";
import axios from "axios";
import * as Location from "expo-location";

const ActivityStep = ({ ActivityItem }) => {
  const activitySteps = ActivityItem;
  const route = useRoute();
  const navigation = useNavigation();

  const [userLocation, setUserLocation] = useState(null);

  useEffect(() => {
    // Get location once when the component mounts
    const fetchLocation = async () => {
      const location = await getLocation();
      setUserLocation(location);
    };

    fetchLocation();
  }, []);

  const { activityID, activityContent, activityMainImg, activityName } =
    route.params || {}; // Handle potential undefined params
  let activityTrailName = activityName;
  let fromHike = false;

  if (activityTrailName?.includes("Hike")) {
    fromHike = true;
    activityTrailName = activityName.replace(" Hike", "");
  }

  const navToMap = async () => {
    
    try {
      const response = await axios.get(
        `http://${ipAdandP}/trail?name=${activityTrailName}`
      );
      if (response.status === 200) {
        var locationCoords
        if(userLocation === null){
          locationCoords = {latitude: 40.7677, longitude: -111.8450}
        } else{
          locationCoords = userLocation
        }
        const data = response.data;
        const fetchedOrigin = {
          latitude: data[0]["Origin Latitude"],
          longitude: data[0]["Origin Longitude"],
        };
        const fetchedDestination = {
          latitude: data[0]["Destination Latitude"],
          longitude: data[0]["Destination Longitude"],
        };

        let actOrigin;
        let actDestination;

        if (activitySteps.Step === 1) {
          actOrigin = locationCoords
          actDestination = fetchedOrigin;
        } else if (activitySteps.Step === 2) {
          actOrigin = fetchedOrigin;
          actDestination = fetchedDestination;
        }

        navigation.navigate("Maps", {
          activityID,
          actOrigin,
          actDestination,
          activityTrailName,
        });
      }
    } catch (error) {
      console.error("Error fetching trail data:", error.message);
    }
  };

  const getLocation = async () => {
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== "granted") {
        console.log("Permission to access location was denied");
        return null;
      }
      const location = await Promise.race([
        Location.getCurrentPositionAsync({}),
        new Promise((_, reject) =>
          setTimeout(() => reject(new Error("Location fetch timed out")), 5000)
        ),
      ]);
      const { latitude, longitude } = location.coords;
      return { latitude, longitude };
    } catch (err) {
      console.error("Error fetching location:", err.message);
      return { latitude: 40.7677, longitude: -111.8450 }; // Default fallback
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.rightContainer}>
        <View style={styles.row}>
          {activitySteps["Picture"] ? (
            <Image
              source={{
                uri: activitySteps["Picture"],
              }}
              style={styles.img}
            />
          ) : (
            <WebView
              source={{ uri: activitySteps["Video"] }}
              style={styles.video}
              allowsFullscreenVideo={false}
              allowsInlineMediaPlayback={true}
              mediaPlaybackRequiresUserAction={true}
            />
          )}
          <View style={styles.contentContainer}>
            <Text style={styles.name}>
              {"Step " + activitySteps["Step"] + ":"}
            </Text>
            <Text style={styles.text}>{activitySteps["Step Description"]}</Text>
            {fromHike === true &&
              (activitySteps["Step"] === 1 || activitySteps["Step"] === 2) && (
                <TouchableOpacity onPress={navToMap} style={styles.button}>
                  <Text style={styles.buttonText}>Navigate to map</Text>
                </TouchableOpacity>
              )}
          </View>
        </View>
      </View>
    </View>
  );
};

export default ActivityStep;
