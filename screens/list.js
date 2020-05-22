import * as React from 'react';
import {View, FlatList, ScrollView, RefreshControl} from 'react-native'
export default class list extends React.Component {
  constructor(props) {
    super(props);
    this.state = {

    }
  }
  render() {
    return(
      <FlatList/>
    );
  }
}
