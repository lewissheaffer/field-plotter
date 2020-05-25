import MapView from 'react-native-maps';
import React, { Component } from 'react';
import { StyleSheet, Text, View, Button, AsyncStorage, Animated, Alert, TouchableHighlight, Image} from 'react-native';
import styles from '../AppStyles';
import ApiKeys from '../constants/ApiKeys'
import DialogInput from 'react-native-dialog-input';
import MapActionButton from '../components/MapActionButton'
import * as Permissions from 'expo-permissions';
import * as Location from 'expo-location';
import * as firebase from 'firebase';
import * as shortid from 'shortid';

export default class map extends Component{
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
      //this.props.navigation.setOptions({}) 
    });
    }
    catch(err){
      console.log(err);
   }
  }

  _toggleSubview() {
    var toValue = 100;
    this.setState({actionActive:false});
    if(this.state.isHidden) {
      toValue = 0;
    }

    //This will animate the transalteY of the subview between 0 & 100 depending on its current state
    //100 comes from the style below, which is the height of the subview.
    Animated.spring(
      this.state.bounceValue,
      {
        toValue: toValue,
        velocity: 5,
        tension: 5,
        friction: 3,
      }
    ).start();
    this.setState(prevState => ({
      isHidden: !prevState.isHidden,
    }));
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
   //Remove any reference to marker in polyline coordinates
   let polylines = [...this.state.polylines];
   for(let i = 0; i < polylines.length; i++) {
     let polyline = {...polylines[i]};
     let coordinates = [...polyline.coordinates];
     //Find and delete all references to this marker in each polyline coordinates
     //Going backwards to prevent any index shifting.
     for(let j = polylines[i].coordinates.length-1; j >= 0 ; j--) {
       if (coordinates[j].key == marker.key) {
         coordinates.splice(j,1);
       }
     }
     polylines[i].coordinates = coordinates;
   }
   this.setState({
     markers:newArray,
     polylines,
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

  onPolylinePress(polyline) {
    //If this polyline is already selected, deselect this polyine
    if (this.state.polyline == polyline.pkey) {
      this.deselectPolyline(polyline.pkey);
    }
    else {
      //If another polyline is selected, delselect that polyline and select this polyline.
      if (this.state.polyline != '') {
        this.deselectPolyline(this.state.polyline);
      }
      //With the previous line deselected, this will account for no lines being selected
      //Selecting this polyline
      this.selectPolyline(polyline.pkey);
    }
  }

  //Reverts to default polyline color and its marker colors
  deselectPolyline(pkey) {
    let polylineIndex = this.state.polylines.findIndex(p => p.pkey == pkey);
    //Turn any selected markers red
    let markers = this.state.markers;
    for (var i in markers) {
      markers[i].color = 'red';
    }
    this.setState({
      polyline: '',
      markers,
    });
  }

  selectPolyline(pkey) {
    let polylineIndex = this.state.polylines.findIndex(p => p.pkey == pkey);
    let polyline = this.state.polylines[polylineIndex];
    let markers = this.state.markers;
    //Might need to change, a bit inefficient
    for (var c of polyline.coordinates) {
      for(let i = 0; i < markers.length; i++) {
        if (markers[i].key == c.key) {
          markers[i].color = "green";
        }
      }
    }
    this.setState({
      polyline:pkey,
      markers,
    })
  }

  //Method that is executed when polyline button is clicked
  //This simply creates a new polyline and allows markers to be added
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

  //Method to update marker location after event (dragging), also updates polylines.
  updateMarkerLocation(marker, e) {
    let index = this.state.markers.indexOf(marker);
    let tempMarkers = this.state.markers;
    tempMarkers[index].longitude = e.nativeEvent.coordinate.longitude;
    tempMarkers[index].latitude = e.nativeEvent.coordinate.latitude;
    //Update the coordinates for each polyline that matches;
    let polylines = [...this.state.polylines];
    for(let i = 0; i < polylines.length; i++) {
      let polyline = {...polylines[i]};
      let coordinates = [...polyline.coordinates];
      //Find and delete all references to this marker in each polyline coordinates
      for(let j = 0; j < polylines[i].coordinates.length; j++) {
        if (coordinates[j].key == marker.key) {
          let coordinate = {
            latitude: e.nativeEvent.coordinate.latitude,
            longitude: e.nativeEvent.coordinate.longitude,
            key: marker.key,
          }
          coordinates[j] = coordinate;
        }
      }
      polylines[i].coordinates = coordinates;
    }
    this.setState({
      markers: tempMarkers,
      polylines,
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
          mapType = {"standard"}
          onPress = {() => {this._toggleSubview()}}
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
              tracksViewChanges = {false}
              >
            </MapView.Marker>
          ))
        }

        {
          this.state.polylines.map((polyline, i) => (
            <MapView.Polyline
              coordinates = {polyline.coordinates}
              key = {shortid.generate()}
              tappable = {true}
              onPress = {() => {this.onPolylinePress(polyline);}}
              strokeWidth = {(this.state.polyline == polyline.pkey) ? 3 : 1}
              strokeColor = {(this.state.polyline == polyline.pkey) ? 'red' : 'black'}
            />
          ))
        }
      	</MapView>
        <Animated.View degrees = {90} pointerEvents="box-none" style={[styles.subView, {transform: [{translateY: this.state.bounceValue}]}]}>
          <MapActionButton resetToken = {this.state.isHidden} draggable = {this.state.draggable} onAddMarker = {() => this.setState({isDialogVisible:true})} onCreatePolyline = {() => this.togglePolyline()} onDraggable = {() => this.setState(prevState => ({draggable: !prevState.draggable}))}/>
        </Animated.View>
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
