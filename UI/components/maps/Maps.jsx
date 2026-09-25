import React, { useRef, useState, useEffect } from "react";
import MapView, { Marker } from "react-native-maps";
import {
  View,
  Text,
  Button,
  TouchableOpacity,
  ActionSheetIOS,
  Platform,
} from "react-native";
import styles from "./maps.style";
import { PROVIDER_GOOGLE } from "react-native-maps";
import { GooglePlacesAutocomplete } from "react-native-google-places-autocomplete";
import MapViewDirections from "react-native-maps-directions";
import axios from "axios";
import * as Location from "expo-location";
import * as Linking from "expo-linking";
import {
  getDistance,
  computeDestinationPoint,
  getPathLength,
  convertArea,
} from "geolib";
import { useRoute, useNavigation } from "@react-navigation/native";

// importLibrary(google.maps)

import { Picker } from "@react-native-picker/picker";
import { Slider } from "@react-native-assets/slider";

//Ignoring warning log boxes
import { ipAdandP } from "../Page/IPsAndOther";
import { LogBox } from "react-native";
LogBox.ignoreLogs(["Warning: ..."]); // Ignore log notification by message
LogBox.ignoreAllLogs(); //Ignore all log notifications
let map;

//The hash map route data will be stored in
const routes = new Map();
const wpts = new Map();

const Maps = () => {
  //Set origin and destination to null initally
  const [origin, setOrigin] = useState();
  const [destination, setDestination] = useState();

  const [waypoints, setWaypoints] = useState([]);
  const [showDirections, setShowDirections] = useState(false);

  //Distance and duration modifiers
  const [distance, setDistance] = useState(0);
  const [duration, setDuration] = useState(0);

  const initialLocation = { latitude: 40.7649, longitude: -111.8421 };
  const [myLocation, setMyLocation] = useState(initialLocation);

  const [selectedRoute, setSelectedRoute] = useState();

  const mapRef = useRef(null);

  //Additional points of intrests
  poi = useState();
  const [routesMap, setRoutesMap] = useState();

  const [radius, setRadius] = useState(1);
  const [centercoords, setCenterCoords] = useState(initialLocation);

  const [searchText, setSearchText] = useState("");

  //URL to access database
  const url = `http://${ipAdandP}/trails`;

  const exampleNames = [
    "The Living Room",
    "Jordan River Parkway Trail",
    "Bonneville Shoreline Trail",
  ];

  const apiKey = "AIzaSyDhy3Qxl4MlDXmmL17ghu5HB4gwU_mBO_E";
  const minDistance = 500;

  const fromActivity = useRoute();
  const [activityProcessed, setActivityProcessed] = useState(false);

  //Takes the data from the database then stores them in a hash map for later use
  const populateRoutes = (databaseData, routes, routeName) => {
    for (let route of databaseData) {
      //Formatting is like this because of spaces in the databse data
      routes.set(routeName, [
        route["Origin Latitude"],
        route["Origin Longitude"],
        route["Destination Latitude"],
        route["Destination Longitude"],
      ]);

      //Adds markers to each trail
      if (routeName === "The Living Room") {
        values = routes.get(routeName);
        values.push("Lizard :)", 40.763277, -111.811598);
        values.push("Trail splits", 40.766993, -111.810182);

        routes.set(routeName, values);
      }
      if (routeName === "Bonneville Shoreline Trail") {
        values = routes.get(routeName);
        values.push(
          "Natural History Museum of Utah",
          40.764137157276785,
          -111.82267462600039
        );
        values.push(
          "Red Butte Garden",
          40.766582956939146,
          -111.82664972982543
        );
        routes.set(routeName, values);
      }
      if (routeName === "Jordan River Parkway Trail") {
        values = routes.get(routeName);
        values.push(
          "International Peace Gardens",
          40.747544287006654,
          -111.92094492571346
        );
        values.push("Playground", 40.743500801235484, -111.91902418422121);
        values.push(
          "Three Creeks Confluence",
          40.741580085670115,
          -111.91760958262037
        );
        values.push("Some Structure", 40.744326740656255, -111.92042761492638);
        routes.set(routeName, values);
      }
    }
    //Forces an update onto a dummy value to update the UI
    setRoutesMap(routes);
  };

  //Get the data from the database only when the internal hash map has not been updated
  if (routes.size === 0) {
    //Get the DB
    for (let i = 0; i < exampleNames.length; i++) {
      axios
        .get(`http://${ipAdandP}/trail?name=${exampleNames[i]}`)
        .then((response) => {
          // console.log("original response =", response)
          const { message, status, data } = response;
          if (status !== 200) {
          } else {
            populateRoutes(data, routes, exampleNames[i]);
          }
        })
        .catch((error) => {
          console.log("Error catched: ", error.response.data);
        });
    }
  }

  //Take data from activity page if applicable
  processActivity = async (
    activityID,
    actOrigin,
    actDestination,
    activityTrailName
  ) => {
    setOrigin(actOrigin);
    setDestination(actDestination);
    setActivityProcessed(true);
  };

  useEffect(() => {
    if (origin && destination && activityProcessed) {
      traceRoute();
    }
  }, [origin, destination, activityProcessed]); // Ensure all dependencies are included

  let activityID = "none";
  let actOrigin = "none";
  let actDestination = "none";
  let activityTrailName = "none";

  const handleProcessActivity = async () => {
    if (fromActivity && fromActivity.params) {
      ({ activityID, actOrigin, actDestination, activityTrailName } =
        fromActivity.params);

      await processActivity(
        activityID,
        actOrigin,
        actDestination,
        activityTrailName
      );
    }
  };

  // Call handleProcessActivity in an async context (e.g., useEffect or another async function)
  useEffect(() => {
    handleProcessActivity();
  }, [
    activityProcessed,
    activityID,
    actOrigin,
    actDestination,
    activityTrailName,
  ]);

  //Hacky bug fix for bug involving invoking a use state before data is inputted
  const defaultValue = "defaultValue";
  let mountedOn;

  useEffect(() => {
    mountedOn = Date.now();
  });

  //Settings for panning the camera
  const edgePaddingValue = 70;
  const edgePadding = {
    //Top is higher to account for UI
    top: 400,
    right: edgePaddingValue,
    bottom: edgePaddingValue,
    left: edgePaddingValue,
  };

  //Pans the camera, used when a route is selected
  const moveTo = async (position) => {
    const camera = await mapRef.current?.getCamera();
    if (camera) {
      camera.center = position;
      mapRef.current?.animateCamera(camera, { duration: 1000 });
    }
  };

  //Traces a route if the origin and destination are set
const traceRoute = () => {
  console.log("Tracing route...");
  console.log("Origin:", origin, "Destination:", destination);

  if (origin && destination) {
    try {
      setShowDirections(true);

      addPOI(); // Ensure this returns valid coordinates

    } catch (error) {
      console.error("Error tracing route:", error.message);
    }
  } else {
    console.warn("Origin or destination is undefined. Cannot trace route.");
  }
};

  //Sets origin or destination if a flag is set
  const onPlaceSelected = (details, flag) => {
    const set = flag === "origin" ? setOrigin : setDestination;
    const position = {
      latitude: details?.geometry.location.lat || 0,
      longitude: details?.geometry.location.lng || 0,
    };
    setShowDirections(false);
    set(position);
    moveTo(position);
  };

  const onPresetSelected = (details) => {
    setWaypoints([]);
    setSelectedRoute(details);
    console.log("details = " + details);
    //Placeholder coordinate vales position and destination
    originPosition = {
      latitude: 0,
      longitude: 0,
    };
    destPosition = {
      latitude: 0,
      longitude: 0,
    };

    //Integrate with database and get details from that
    //No edge cases for now
    coordinates = routes.get(details);
    originPosition = {
      latitude: coordinates[0],
      longitude: coordinates[1],
    };
    destPosition = {
      latitude: coordinates[2],
      longitude: coordinates[3],
    };

    newWaypoints = [];
    if (wpts.get(details)) {
      console.log("found waypoints for " + details);
      currWaypoints = wpts.get(details);
      //Structure of array is [name, lat, long]
      for (let i = 0; i < currWaypoints.length; i++) {
        newWaypoints.push({
          latitude: currWaypoints[i][1],
          longitude: currWaypoints[i][2],
        });
      }
    }

    setShowDirections(false);
    setOrigin(originPosition);
    setDestination(destPosition);
    setWaypoints(newWaypoints);

    //could be rewritten as seperate function with ...waypoints, will skip over for now
    mapRef.current?.fitToCoordinates(
      [originPosition, destPosition, ...newWaypoints],
      {
        edgePadding,
      }
    );
  };

  //Puts established routes into the picker UI
  const routesInPicker = () => {
    const pickerItems = [];
    for (let [key] of routes) {
      pickerItems.push(<Picker.Item label={key} key={key} value={key} />);
    }
    return pickerItems;
  };

  //Loops through all the points of interest in the given route and adds them to the map
  const addPOI = () => {
    const markers = [];
    if (selectedRoute) {
      route = routes.get(selectedRoute);

      if (route.length > 4) {
        for (let i = 4; i < route.length; i += 3) {
          markers.push(
            <Marker
              coordinate={{ latitude: route[i + 1], longitude: route[i + 2] }}
              title={route[i]}
              key={route[i]}
              pinColor="teal"
            />
          );
        }
      }
    }
    return markers;
  };

  //Finds the distance from a given route
  const traceRouteOnReady = (args) => {
    if (args) {
      // args.distance
      setDistance(args.distance);
      // args.duration
      setDuration(args.duration);
    }
  };

  useEffect(() => {
    getLocation();
  }, []);

  //Pulls location from phone permissions
  const getLocation = async () => {
    try {
      let { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== "granted") {
        console.log("Permission to access location was denied");
        return;
      }
      let location = await Location.getCurrentPositionAsync({});
      setMyLocation(location.coords);
    } catch (err) {
      console.warn(err);
    }
  };

  //Pans Camera tp current location, not in use will delete later
  const focusOnLocation = () => {
    if (myLocation.latitude && myLocation.longitude) {
      const newRegion = {
        latitude: parseFloat(myLocation.latitude),
        longitude: parseFloat(myLocation.longitude),
        latitudeDelta: 0.0922,
        longitudeDelta: 0.0421,
      };
      if (mapRef.current) {
        mapRef.current.animateToRegion(newRegion, 1000);
      }
    }
  };

  //Formats a url to be sent to google maps, includes origin and destination
  const getDirections = () => {
    originCoords = origin.latitude + "," + origin.longitude;
    destinationCoords = destination.latitude + "," + destination.longitude;
    waypointsCoords = "";
    for (let i = 0; i < waypoints.length; i++) {
      waypointsCoords +=
        "|" + waypoints[i].latitude + "," + waypoints[i].longitude;
    }
    header = "https://www.google.com/maps/dir/?api=1&travelmode=walking";
    var url =
      header +
      "&origin=" +
      originCoords +
      "&destination=" +
      destinationCoords +
      "&waypoints=" +
      waypointsCoords;
    openURL(url);
  };

  //Formats a url to get directions from current location to the origin of the route
  const getDirectionsToOrigin = () => {
    originCoords = myLocation.latitude + "," + myLocation.longitude;
    destinationCoords = origin.latitude + "," + origin.longitude;
    header = "https://www.google.com/maps/dir/?api=1&travelmode=walking";
    var url =
      header + "&origin=" + originCoords + "&destination=" + destinationCoords;
    openURL(url);
  };

  const openURL = (url) => {
    Linking.canOpenURL(url)
      .then((supported) => {
        if (!supported) {
          console.log("Can't handle url: " + url);
        } else {
          return Linking.openURL(url);
        }
      })
      .catch((err) => console.error("An error occurred", err));
  };

  const fetchOverpass = async () => {
    setSearchText("Searching the area for paths...");

    // console.log("getting overpass");

    var radMeter = radius * 1609.34;

    sw = computeDestinationPoint(
      { latitude: centercoords.latitude, longitude: centercoords.longitude },
      radMeter,
      225
    );

    ne = computeDestinationPoint(
      { latitude: centercoords.latitude, longitude: centercoords.longitude },
      radMeter,
      45
    );

    swLat = sw.latitude;
    swLon = sw.longitude;

    neLat = ne.latitude;
    neLon = ne.longitude;

    var result = await fetch("https://overpass-api.de/api/interpreter", {
      method: "POST",
      body:
        "data=" +
        encodeURIComponent(`
          [out:json][timeout:25];
          (
          way["highway"="path"](${swLat},${swLon},${neLat},${neLon});
          way["highway"="footway"](${swLat},${swLon},${neLat},${neLon});
          );
          out geom;
          `),
    }).then((data) => data.json());
    strResult = JSON.stringify(result, null, 2);
    filterWays(strResult);
  };

  const filterWays = async (data) => {
    console.log("filtering ways");
    data = JSON.parse(data);
    var elements = data.elements;
    var properTrails = [];

    for (let i in elements) {
      elementDistance = getDistance(
        {
          latitude: elements[i].bounds.maxlat,
          longitude: elements[i].bounds.maxlat,
        },
        {
          latitude: elements[i].bounds.minlat,
          longitude: elements[i].bounds.minlat,
        }
      );
      if (elementDistance >= minDistance) {
        properTrails.push(elements[i]);
      }
    }

    //go through each trail marked w 500+ meters

    for (let i = 0; i < properTrails.length; i++) {
      // console.log("proper trail number ", i);
      currTrail = properTrails[i];
      // console.log(currTrail.id);
      var currName;
      if (currTrail.tags.name) {
        currName = currTrail.tags.name;

        routes.set(currName, [
          currTrail.geometry[0].lat,
          currTrail.geometry[0].lon,
          currTrail.geometry[currTrail.geometry.length - 1].lat,
          currTrail.geometry[currTrail.geometry.length - 1].lon,
        ]);
        sortedNodes = await optimizeNodes(currTrail.geometry);

        for (let i = 1; i < sortedNodes.length - 1; i++) {
          if (wpts.get(currName)) {
            wpts
              .get(currName)
              .push([
                "Waypoint " + [i],
                sortedNodes[i].lat,
                sortedNodes[i].lon,
              ]);
          } else {
            wpts.set(currName, [
              ["Waypoint 1", sortedNodes[i].lat, sortedNodes[i].lon],
            ]);
          }
        }
      }
    } //remove for name
    console.log("finished gatehring trails");
    setSearchText("Finished searching paths!");
  };

  const optimizeNodes = async (sortedNodes) => {
    var index = 0;

    while (index < sortedNodes.length - 2) {
      var [indToind2, indToind1, ind1Toind2] = await Promise.all([
        (indToind2 = getDistance(sortedNodes[index], sortedNodes[index + 2])),
        (indToind1 = getDistance(sortedNodes[index], sortedNodes[index + 1])),
        (ind1Toind2 = getDistance(
          sortedNodes[index + 1],
          sortedNodes[index + 2]
        )),
      ]);

      waypointDisplacment = Math.abs(indToind2 - (indToind1 + ind1Toind2));

      //manual threshold 20m
      if (waypointDisplacment <= 20) {
        sortedNodes.splice(index + 1, 1);
      } else {
        index++;
      }
    }
    return sortedNodes;
  };

  const handleRegionChangeComplete = (region) => {
    const { latitude, longitude } = region;
    setCenterCoords({ latitude, longitude });
  };

  const showActionSheetIOS = (routes, onSelect, defaultValue) => {
    ActionSheetIOS.showActionSheetWithOptions(
      {
        options: [...routes, "Cancel"],
        cancelButtonIndex: routes.length,
        title: "Routes",
      },
      (buttonIndex) => {
        if (buttonIndex < routes.length) {
          const selectedItem = routes[buttonIndex];
          if (selectedItem !== defaultValue) {
            onSelect(selectedItem);
          }
        }
      }
    );
  };

  return (
    <View style={styles.container}>
      {/* Initial view for the map */}
      <MapView
        ref={mapRef}
        onLayout={() =>
          mapRef.current?.fitToCoordinates([origin, destination], {
            edgePadding,
          })
        }
        style={styles.map}
        initialRegion={{
          latitude: myLocation.latitude,
          longitude: myLocation.longitude,
          //Zooming in amount
          latitudeDelta: 0.05,
          longitudeDelta: 0.05,
        }}
        onRegionChangeComplete={handleRegionChangeComplete}
      >
        {/* Marking origin and destination values */}
        {origin && <Marker coordinate={origin} title="Origin" />}
        {destination && <Marker coordinate={destination} title="Destination" />}

        {/*Render waypoints */}
        {waypoints.map((waypoint, index) => (
          <Marker
            key={`waypoint-${index}`}
            coordinate={waypoint}
            title={`Waypoint ${index + 1}`}
            pinColor="orange"
          />
        ))}

        {/* If navigate has been pressed and origin and destination are set */}
        {showDirections && origin && destination && (
          <>
            <MapViewDirections
              origin={origin}
              destination={destination}
              waypoints={waypoints.map((wp) => wp)}
              optimizeWaypoints={false}
              apikey="AIzaSyDhy3Qxl4MlDXmmL17ghu5HB4gwU_mBO_E"
              strokeColor="#6644ff"
              strokeWidth={4}
              mode={"WALKING"}
              onReady={traceRouteOnReady}
            />
            {addPOI()}
          </>
        )}
      </MapView>

      {/* Views for the origin and destination route finder */}
      <View style={styles.searchContainer}>
        {/* Get trails within given radius */}
        <View>
          {activityProcessed === false && (
            <>
              <Text style={styles.trailSearchText}>
                Trail search radius: {radius} miles
              </Text>
              <Slider
                style={styles.slider}
                value={radius}
                minimumValue={Math.round(0.25)}
                maximumValue={Math.round(2.5)}
                step={Math.round(0.25)}
                onValueChange={setRadius}
              />
              <TouchableOpacity style={styles.button} onPress={fetchOverpass}>
                <Text style={styles.buttonText}>Find Paths in this Area</Text>
              </TouchableOpacity>
              <Text style={styles.trailSearchText}>{searchText}</Text>
            </>
          )}
        </View>

        {/* Select Presets */}
        {activityProcessed === false && (
          <>
            <Picker
              style={styles.picker}
              itemStyle={styles.pickerItem}
              selectedValue={selectedRoute}
              itemValue={defaultValue}
              onValueChange={(itemValue) => {
                if (
                  itemValue !== defaultValue &&
                  Date.now() - mountedOn > 1000
                ) {
                  onPresetSelected(itemValue);
                }
              }}
              prompt="Routes"
            >
              {routesInPicker()}
            </Picker>

            {/* Trace Route Button */}
            <TouchableOpacity style={styles.button} onPress={traceRoute}>
              <Text style={styles.buttonText}>Navigate</Text>
            </TouchableOpacity>
          </>
        )}

        {/* Display distane and duration */}
        {distance && duration ? (
          <View style={styles.routeInformationContainer}>
            {/* Auto selects kilometers */}
            <View>
              <Text>Distance: {(distance * 0.621371).toFixed(2)} Miles</Text>
              <Text>Duration: {Math.ceil(duration)} Minutes</Text>
            </View>

            {/* Navigate button */}
            <TouchableOpacity
              style={styles.directionsButton}
              onPress={getDirections}
            >
              <Text style={styles.buttonText}>Get Directions</Text>
            </TouchableOpacity>
            {activityProcessed === false && (
              <>
                <TouchableOpacity
                  style={styles.directionsButton}
                  onPress={getDirectionsToOrigin}
                >
                  <Text style={styles.buttonText}>
                    Get Directions to Origin
                  </Text>
                </TouchableOpacity>
              </>
            )}
          </View>
        ) : null}
      </View>
    </View>
  );
};

export default Maps;
