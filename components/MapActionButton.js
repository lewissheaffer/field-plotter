import ActionButton from 'react-native-action-button';
import Icon from 'react-native-vector-icons/Ionicons';
import * as React from 'react';
import {StyleSheet, Text} from 'react-native'

export default class MapActionButton extends React.Component {
  constructor(props) {
    super(props);

  }

  render() {
    //let draggableText = this.props.draggable ? ('On') : ('Off');
    return(
      <ActionButton offsetY = {80} resetToken = {this.props.resetToken} autoInactive = {false} buttonColor='mediumseagreen' spacing = {10} backgroundTappable = {true}>
          <ActionButton.Item buttonColor='teal' title="New marker" onPress={() => {this.props.onAddMarker()}}>
            <Icon name="md-pin" style={styles.actionButtonIcon} />
          </ActionButton.Item>
          <ActionButton.Item buttonColor='#9b59b6' title="Create Polyline" onPress={() => this.props.onCreatePolyline()}>
            <Icon name="md-resize" style={styles.actionButtonIcon} />
          </ActionButton.Item>
          <ActionButton.Item buttonColor={this.props.draggable ? 'green' : 'crimson'} title="Toggle Draggable" onPress={() => this.props.onDraggable()}>
            {
              this.props.draggable ? <Text style = {{color:'white'}}>On</Text> : <Text style = {{color:'white'}}>Off</Text>
            }
          </ActionButton.Item>
      </ActionButton>
    );
  }
}

const styles = StyleSheet.create({
  actionButtonIcon: {
    fontSize: 20,
    height: 22,
    color: 'white',
  },
});
