import MapView from 'react-native-maps';
import React, { Component } from 'react';
import { StyleSheet, Text, View, Button, AsyncStorage, Alert, TouchableHighlight, Image} from 'react-native';
import styles from './AppStyles';
import ApiKeys from './constants/ApiKeys'
import DialogInput from 'react-native-dialog-input';
import MapActionButton from './components/MapActionButton'
import * as Permissions from 'expo-permissions';
import * as Location from 'expo-location';
import * as firebase from 'firebase';
import * as shortid from 'shortid';

export default class App extends Component{
  constructor(props) {
    super(props);
    this.state = {
      location: {},
      markers: [],
      polylines: [],
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
        let markersList = JSON.parse(markers);
        for(var i in markersList) {
          //Correct any green markers
          markersList[i].color = 'red';
        }
        this.setState({markers: markersList});
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
      key:shortid.generate(),
      title: title,
      color: 'red',
    }
    this.setState({
      markers: [...this.state.markers, marker]
    });
    AsyncStorage.setItem('@ListofMarkers: markers', JSON.stringify(this.state.markers));
    this.setRegion();
  }

  onMarkerPress(marker) {
    if(this.state.polyline != '') {
      //Finding the current polyine in polylines based on pkey
      let polylineIndex = this.state.polylines.findIndex(p => p.pkey == this.state.polyline);
      let polylines = this.state.polylines;
      let polyline = this.state.polylines[polylineIndex];

      //M
      let markerIndex = this.state.markers.indexOf(marker);
      if (marker.color == 'green') {
        marker.color = 'red';
        //Remove marker coordinate from polyline coordinate list
        let coordinateIndex = polyline.coordinates.findIndex(c => c.key == marker.key);
        //Must create a shallow copy of this array, look-up 'spread operator'
        let coordinates = [...polyline.coordinates];
        coordinates.splice(coordinateIndex, 1);
        polyline.coordinates = coordinates;
      }
      else {
        marker.color = 'green';
        //Add marker coordinate/key to polyline coordinate list
        let coordinate = {
          latitude:marker.latitude,
          longitude:marker.longitude,
          key: marker.key,
        }
        polyline.coordinates = [...polyline.coordinates, coordinate];
      }
      polylines[polylineIndex] = polyline;
      let markersList = this.state.markers;
      markersList[markerIndex] = marker;
      this.setState({
        markers:markersList,
        polylines,
      });
    }
    else {
    }
  }

  //Method that is executed when polyline button is clicked
  togglePolyline() {
    if(this.state.polyline == '') {
      let polyline = {
        coordinates: [],
        pkey: shortid.generate(),
        title: '',
      }
      let polylineList = this.state.polylines;
      this.setState({
        polyline: polyline.pkey,
        polylines: [...this.state.polylines, polyline],
      })
    }
    else {
      let markers = this.state.markers;
      for(var i in markers) {
        //Correct any green markers
        markers[i].color = 'red';
      }
      this.setState ({
        polyline: '',
        markers,
      });
    }
  }

  //Method to update marker location after event (dragging)
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

  //Method for create a marker submission click
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

  render() {
    return (
    	<React.Fragment>
      	<MapView
          ref={ map => { this.mapView = map }}
          onMapReady={() => {this.setState({mapReady:true})}}
          style={styles.map}
          initialRegion={this.state.region}
      		showsUserLocation={true}
      	>
        {
            this.state.markers.map((marker, i) => (
            <MapView.Marker
              onPress = {() => {this.onMarkerPress(marker)}}
              onCalloutPress = {() => {Alert.alert(
                'Delete Marker',
                'Click OK to confirm',
                [
                  {text: 'Cancel' },
                  {text: 'OK', onPress: () => {this.deleteMarker(marker)}}
                ]
              )}}
              key = {shortid.generate()}
              draggable = {this.state.draggable}
              onDragEnd = {(e) => {
                this.updateMarkerLocation(marker, e);
              }}
              coordinate = {{longitude: marker.longitude, latitude: marker.latitude}}
              title={marker.title}
              description= "Click to Delete"
              pinColor = {marker.color}
              >
            </MapView.Marker>
          ))
        }

        {
          this.state.polylines.map((polyline, i) => (
            <MapView.Polyline
              coordinates = {polyline.coordinates}
              key = {shortid.generate()}
            />
          ))
        }
      	</MapView>

        <MapActionButton draggable = {this.state.draggable} onAddMarker = {() => this.setState({isDialogVisible:true})} onCreatePolyline = {() => this.togglePolyline()} onDraggable = {() => this.setState(prevState => ({draggable: !prevState.draggable}))}/>

        <DialogInput
          isDialogVisible={this.state.isDialogVisible}
          title={"Add New Marker"}
          message={this.state.dialogMessage}
          hintInput ={"Example: A2:R3"}
          submitInput={ (inputText) => {this.dialogSubmit(inputText)} }
          closeDialog={ () => {this.setState({isDialogVisible: false})}}>
        </DialogInput>
    	</React.Fragment>
    );
  }
}
