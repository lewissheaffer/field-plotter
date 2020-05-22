import * as React from 'react';
import Icon from 'react-native-vector-icons/Ionicons';
export default function TabBarIcon(props) {
  return (<Icon name = {props.name} size = {35} style = {{marginBottom:-8}} color = {props.focused ? 'darkgreen' : 'mediumseagreen'} />);
}
