import React, { Component } from 'react';
import {StyleSheet, View, Animated, TouchableHighlight} from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import {createBottomTabNavigator} from '@react-navigation/bottom-tabs';
import Icon from 'react-native-vector-icons/Ionicons';
import styles from './AppStyles';
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
        <Tab.Navigator>
          <Tab.Screen name = "map" component = {map} options = {{
            title:'Map',
            tabBarIcon: ({focused}) => <Icon name="md-map" />
          }}/>
          <Tab.Screen name = "list" component = {list} options = {{
            title:'Plot List',
            tabBarIcon: ({focused}) => <Icon name="md-list"/>
          }}/>
        </Tab.Navigator>
      </NavigationContainer>
    );
  }

}
