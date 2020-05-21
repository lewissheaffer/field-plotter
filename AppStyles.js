import {StyleSheet} from 'react-native';

export default StyleSheet.create({
  container: {
    flex:1,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'flex-start',
  },
  map: {
    flex:1,
   },
   button: {
    position: 'absolute',
    flex:1,
    height:35,
    width:100,
    marginLeft: -50,
    marginBottom:50,
    borderRadius: 10,
    left:'50%',
    bottom:0,
    justifyContent:'flex-end',
    shadowColor: '#000000',
    shadowOffset: {
      width: 0,
      height: 3
    },
    shadowRadius: 10,
    shadowOpacity: .25
  },
  subView: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    height: 300,
  },
});
