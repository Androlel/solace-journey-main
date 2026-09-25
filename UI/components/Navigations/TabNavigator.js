/**
 * Tab for navigating between screens (only home and activities for now)
 */

import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';
import HomePage from '../Page/HomePage/HomePage';
import ActivitiesNav from './ActivitiesNav';
import Maps from '../maps/Maps';
import PostNav from './PostsNav';
import UserRelationNav from './UserRelationNav';
import Menu from '../Page/Menu/Menu';

const Tab = createBottomTabNavigator();

export default TabNavigator = () => {
  return (
    <Tab.Navigator initialRouteName='Home'
      screenOptions={({ route }) => ({
        tabBarIcon: ({ focused, color, size }) => {
          let iconName;

          if (route.name === 'Home') {
            iconName = focused ? 'home' : 'home-outline';
          } else if (route.name === 'Activities') {
            iconName = focused ? 'accessibility' : 'accessibility-outline';
          }
          else if (route.name === 'Map') {
            iconName = focused ? 'map' : 'map-outline';
          }
          else if (route.name === 'Friends') {
            iconName = focused ? 'chatbubbles' : 'chatbubbles-outline';
          }
          else if (route.name === 'Discussions') {
            iconName = focused ? 'newspaper' : 'newspaper-outline';
          }
          else if (route.name === 'Menu') {
            iconName = focused ? 'menu' : 'menu-outline';
          }
          return <Ionicons name={iconName} size={size} color={color} />;
        },
        headerShown: false 
      })}>
      <Tab.Screen name="Home" component={HomePage}/>
      <Tab.Screen name="Friends" component={UserRelationNav} />
      <Tab.Screen name="Discussions" component={PostNav} />
      <Tab.Screen name="Activities" component={ActivitiesNav} />
      <Tab.Screen name="Map" component={Maps} />   
      <Tab.Screen name ="Menu" component={Menu}/>
    </Tab.Navigator>
  );
};
