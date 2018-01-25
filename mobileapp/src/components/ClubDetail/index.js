/* @flow */
import React, { Component } from 'react';
import {
  Text,
  View,
  StyleSheet,
  Button,
} from 'react-native';
import Icon from 'react-native-vector-icons/FontAwesome';

const styles = StyleSheet.create({
  container: {
    paddingTop: 20,
    width: '100%',
    alignItems: 'center',
    backgroundColor: '#f6f6f6',
  },
  address: {
    width: '80%',
    flexDirection: 'row'
  }
});

export default class ClubDetail extends Component<{}> {
  render() {
    const { club, isRegistered = false } = this.props;

    return (
      <View style={styles.container}>
        <View>
          <View style={styles.address}>
            <Text style={{ fontWeight: 'bold' }}>Address: </Text>
            <Text>{club.address}</Text>
          </View>
          {isRegistered ? <Text>You have registered!</Text> : <Button title="Register" />}
        </View>
      </View>
    );
  }
}
