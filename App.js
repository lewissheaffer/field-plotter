import React, { Component } from 'react';
import {StyleSheet, View, Animated, TouchableHighlight} from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import {createBottomTabNavigator} from '@react-navigation/bottom-tabs';
import styles from './AppStyles';
import TabBarIcon from './components/TabBarIcon'
import ApiKeys from './constants/ApiKeys'
import map from './screens/map';
import list from './screens/list';
import * as firebase from 'firebase';

const Tab = createBottomTabNavigator();

export default class App extends Component{
  constructor(props) {
    super(props);
    this.state = {
      location: {},
      markers: [],
      polylines: [],
      //polyline is a pkey for reference
      polyline: "",
      region: {
        latitude: 0,
        longitude: 0,
        latitudeDelta:32,
        longitudeDelta: 90,
      },
      isDialogVisible: false,
      draggable: false,
      dialogMessage: "Enter Your Desired Title.",
      mapReady:false,
      bounceValue: new Animated.Value(0),
      isHidden: false,
    }
  }
  render() {
    return(
      <NavigationContainer>
        <Tab.Navigator tabBarOptions={{
          activeTintColor: 'lightgreen',
          inactiveTintColor: 'lightgreen',
          activeBackgroundColor: 'seagreen',
          inactiveBackgroundColor: 'seagreen',
          shifting: true,
        }}
        >
          <Tab.Screen name = "map" component = {map} options = {{
            title:'Map',
            tabBarIcon: ({focused}) => <TabBarIcon name="md-map" focused = {focused}/>
          }}/>
          <Tab.Screen name = "list" component = {list} options = {{
            title:'Plot List',
            tabBarIcon: ({focused}) => <TabBarIcon name="md-list" focused = {focused}/>
          }}/>
        </Tab.Navigator>
      </NavigationContainer>
    );
  }

}
