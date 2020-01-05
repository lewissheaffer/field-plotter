import MapView from 'react-native-maps';
import Modal from 'react-native-modal';
import React, { Component } from 'react';
import { StyleSheet, Text, View, Button, Alarm, AsyncStorage, Alert, TouchableHighlight, Image} from 'react-native';
import RNAndroidLocationEnabler from 'react-native-android-location-enabler';
import styles from './AppStyles';
import ApiKeys from './constants/ApiKeys'
import DialogInput from 'react-native-dialog-input';
import * as Permissions from 'expo-permissions';
import * as Location from 'expo-location';
import * as firebase from 'firebase';

export default class App extends Component{
  constructor(props) {
    super(props);
    this.state = {
      location: {},
      markers: [],
      region: {
        latitude: 0,
        longitude: 0,
        latitudeDelta:32,
        longitudeDelta: 90,
      },
      isDialogVisible: false,
      draggableColor: "",
      markerModalVisible: false,
      draggable: false,
      dialogMessage: "Enter Your Desired Title.",
      mapReady:false,
    }
/*
    if(!firebase.apps.length) {
      firebase.initializeApp(ApiKeys.firebaseConfig);
      //firebase.analytics();
    }*/
  }

  componentDidMount() {
    try {
    this.getLocation();
    this.setRegion();
    AsyncStorage.getItem('@ListofMarkers: markers').then(markers => {
      if(markers != null) {
        this.setState({markers:JSON.parse(markers)});
      }
      else {
        AsyncStorage.setItem('@ListofMarkers: markers', []);
      }
    });
    }
    catch(err){
      console.log(err);
   }
  }

  updateDisplay() {
    this.setState(prevState => {
      {number: ++prevState.number}
      alert(JSON.stringify(this.state.location));
    });
  }

  getLocation = async () => {
    // permissions returns only for location permissions on iOS and under certain conditions, see Permissions.LOCATION
    const { status, permissions } = await Permissions.askAsync(Permissions.LOCATION);
    if (status !== 'granted') {
      throw new Error('Location permission not granted');
    }
    const userLocation = await Location.getCurrentPositionAsync();
    this.setState({
      location: userLocation
    });
  }

  openControlModal() {
    this.setState({
      markerModalVisible: true,
    });
  }

  closeControlModal() {
    this.setState({
      markerModalVisible: false,
    });
  }

  async setRegion() {
    await this.getLocation();
    let region = {
      latitude:this.state.location.coords.latitude,
      longitude:this.state.location.coords.longitude,
      latitudeDelta: .004,
      longitudeDelta: .009,
    }
    this.setState({
      region: region,
    });
    if(this.state.mapReady) {
      this.mapView.animateToRegion(region,0);
    }
  }

  deleteMarker(marker) {
   let index = this.state.markers.indexOf(marker);
   let newArray = this.state.markers;
   newArray.splice(index, 1);
   this.setState({
     markers:newArray,
   });
   AsyncStorage.setItem('@ListofMarkers: markers', JSON.stringify(this.state.markers));
  }

  async addMarker(title) {
    //To ensure that the location state is updated before marker is created
    await this.getLocation();
    let marker = {
      latitude: this.state.location.coords.latitude,
      longitude: this.state.location.coords.longitude,
      title: title,
    }
    this.setState({
      markers: [...this.state.markers, marker]
    });
    AsyncStorage.setItem('@ListofMarkers: markers', JSON.stringify(this.state.markers));
    this.setRegion();
  }

  mapReady() {
    this.setState({
      mapReady:true,
    });
  }

  dragButtonClick() {
    if(!this.state.draggable) {
      this.setState({
        draggableColor:"#005A9A",
        draggable:true,
      });
    }
    else {
      this.setState({
        draggableColor:"",
        draggable:false,
      });
    }
  }

  openDialog() {
    this.setState({
      isDialogVisible: true,
    })
  }

  updateMarkerLocation(marker, e) {
    let index = this.state.markers.indexOf(marker);
    let tempMarkers = this.state.markers;
    tempMarkers[index].longitude = e.nativeEvent.coordinate.longitude;
    tempMarkers[index].latitude = e.nativeEvent.coordinate.latitude;
    this.setState({
      markers: tempMarkers,
    });
    AsyncStorage.setItem('@ListofMarkers: markers', JSON.stringify(this.state.markers));
  }

  dialogSubmit(title) {
    for(const marker of this.state.markers) {
      if(marker.title == title) {
        this.setState({
          dialogMessage: "Marker title is already being used. Choose a different name."
        });
        return;
      }
    }
    this.setState({
      dialogMessage: "Enter Your Desired Title.",
      isDialogVisible: false,
    });
    this.addMarker(title);
  }

  cancelDialog() {
    this.setState({
      isDialogVisible: false,
    });
  }

  render() {
    return (
    	<React.Fragment>
      	<MapView
          ref={ map => { this.mapView = map }}
          onMapReady={() => {this.mapReady()}}
          style={styles.map}
          initialRegion={this.state.region}
      		showsUserLocation={true}
      	>
        {
            this.state.markers.map((marker, i) => (
            <MapView.Marker
              onCalloutPress = {() => {Alert.alert(
                'Delete Marker',
                'Click OK to confirm',
                [
                  {text: 'Cancel' },
                  {text: 'OK', onPress: () => {this.deleteMarker(marker)}}
                ]
              )}}
              key = {i}
              draggable = {this.state.draggable}
              onDragEnd = {(e) => {
                this.updateMarkerLocation(marker, e);
              }}
              coordinate = {{longitude: marker.longitude, latitude: marker.latitude}}
              title={marker.title}
              description= "Click to Delete">
            </MapView.Marker>
          ))
        }
      	</MapView>

        <View style = {styles.button}>
           <Button title = "Place Marker" color="#D73816" onPress={() => {this.openDialog()}}/>
        </View>

        <View style = {styles.modal}>
          <Modal isVisible = {this.state.markerModalVisible} onBackdropPress={() => this.setState({ markerModalVisible: false })} animationIn = {'slideInDown'} animationOut = {'slideOutUp'}>
            <View style = {{flex:1}}>
              <View style = {{alignItems:'center'}}>
                <Text style = {{fontSize:50, color: "#005EA1", fontFamily: 'sans-serif'}}>Menu</Text>
              </View>
              <View style = {{marginBottom:5,}}>
                <Button title = "Drag" color = {this.state.draggableColor} onPress = {() => {this.dragButtonClick()}}/>
              </View>
              <Button title = "Close" onPress = {() => {this.closeControlModal()}}/>
            </View>
          </Modal>
        </View>

        <View style = {styles.arrow}>
          <TouchableHighlight onPress={() => {this.openControlModal()}}>
            <Image style = {{height: 30, width: 55}}resizeMode = 'contain' source={require('./assets/downArrow.png')}/>
          </TouchableHighlight>
        </View>

        <DialogInput
          isDialogVisible={this.state.isDialogVisible}
          title={"Add New Marker"}
          message={this.state.dialogMessage}
          hintInput ={"Example: A2:R3"}
          submitInput={ (inputText) => {this.dialogSubmit(inputText)} }
          closeDialog={ () => {this.cancelDialog()}}>
        </DialogInput>
    	</React.Fragment>
    );
  }
}