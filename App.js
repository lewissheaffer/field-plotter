import React, { Component } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import {createBottomTabNavigator} from '@react-navigation/bottom-tabs';
import TabBar from './components/TabBar'
import map from './screens/map';
import list from './screens/list';

const Tab = createBottomTabNavigator();

export default class App extends Component{
  constructor(props) {
    super(props);
  }
  render() {
    return(
      <NavigationContainer>
        <Tab.Navigator tabBar = {({navigation, state, descriptors}) => <TabBar navigation = {navigation} descriptors = {descriptors} state = {state}/>} >
          <Tab.Screen name = "map" component = {map} options = {{title:'Map', }}/>
          <Tab.Screen name = "list" component = {list} options = {{title:'Plot List',}}/>
        </Tab.Navigator>
      </NavigationContainer>
    );
  }
}
