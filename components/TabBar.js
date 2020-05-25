import {View, Text, TouchableOpacity} from 'react-native';
import * as React from 'react';
import TabBarIcon from './TabBarIcon'
export default function TabBar({ state, descriptors, navigation }) {
  return (
    <View style={{ position:'absolute', bottom:0,right:0, left:0, zIndex:2, flexDirection: 'row' }}>
      {state.routes.map((route, index) => {
        const { options } = descriptors[route.key];
        const label =
          options.tabBarLabel !== undefined
            ? options.tabBarLabel
            : options.title !== undefined
            ? options.title
            : route.name;

        const isFocused = state.index === index;

        const onPress = () => {
          const event = navigation.emit({
            type: 'tabPress',
            target: route.key,
          });

          if (!isFocused && !event.defaultPrevented) {
            navigation.navigate(route.name);
          }
        };

        const onLongPress = () => {
          navigation.emit({
            type: 'tabLongPress',
            target: route.key,
          });
        };

        return (
          <TouchableOpacity
            accessibilityRole="button"
            accessibilityStates={isFocused ? ['selected'] : []}
            accessibilityLabel={options.tabBarAccessibilityLabel}
            activeOpacity = {1}
            key = {index}
            testID={options.tabBarTestID}
            onPress={onPress}
            onLongPress={onLongPress}
            style={{ flex: 1, height:50, backgroundColor:'seagreen',}}
          >
            <View style = {{alignItems:'center'}}>
              {
              (label == 'Map') ? <TabBarIcon name="md-map" focused = {isFocused}/>
              : <TabBarIcon name="md-list" focused = {isFocused}/>
              }
              <Text style={{ marginTop:3, fontSize: 12, textAlign: 'center', color: 'lightgreen' }}>
                {label}
              </Text>
            </View>
          </TouchableOpacity>
        );
      })}
    </View>
  );
}
