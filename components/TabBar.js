import {View, Text, TouchableOpacity, Animated} from 'react-native';
import * as React from 'react';
import TabBarIcon from './TabBarIcon'
export default class TabBar extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      bounceValue: new Animated.Value(0),
    }
  }
  componentDidUpdate(props) {
    const oldState = this.props.state;
    const oldRoute = oldState.routes[oldState.index];
    const oldParams = oldRoute.params;
    const wasVisible = !oldParams || oldParams.isHidden;
    const newState = props.state;
    const newRoute = newState.routes[newState.index];
    const newParams = newRoute.params;
    const makeHidden = !newParams || newParams.isHidden;
    if(wasVisible !== undefined && (wasVisible != makeHidden)) {
      var toValue = 50;
      if(!makeHidden) {
        toValue = 0;
      }
      //This will animate the transalteY of the subview between 0 & 100 depending on its current state
      //100 comes from the style below, which is the height of the subview.
      Animated.spring(
        this.state.bounceValue,
        {
          toValue: toValue,
          velocity: 5,
          tension: 0,
          friction: 5,
        }
      ).start();
    }
  }

  render(){
    return (
      <Animated.View degrees = {90} pointerEvents="box-none" style={[{ position:'absolute', bottom:0 ,right:0, left:0,  flexDirection: 'row' },{transform: [{translateY: this.state.bounceValue}]}]}>
        {this.props.state.routes.map((route, index) => {
          const { options } = this.props.descriptors[route.key];
          const label =
            options.tabBarLabel !== undefined
              ? options.tabBarLabel
              : options.title !== undefined
              ? options.title
              : route.name;

          const isFocused = this.props.state.index === index;

          const onPress = () => {
            const event = this.props.navigation.emit({
              type: 'tabPress',
              target: route.key,
            });

            if (!isFocused && !event.defaultPrevented) {
              this.props.navigation.navigate(route.name);
            }
          };

          const onLongPress = () => {
            this.props.navigation.emit({
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
      </Animated.View>
    );
}
}
