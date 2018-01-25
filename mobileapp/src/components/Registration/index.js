/* @flow */
import React, { Component } from 'react';
import {
  Text,
  View,
  StyleSheet,
  FlatList,
  TouchableHighlight
} from 'react-native';
import Icon from 'react-native-vector-icons/FontAwesome';
import moment from 'moment';

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: 20,
    width: '100%',
    backgroundColor: '#f6f6f6',
  },
  item: {
    marginBottom: 10,
    display: 'flex',
    alignItems: 'flex-start',
    padding: 10,
    paddingTop: 20,
    paddingBottom: 20,
    width: '100%',
    backgroundColor: 'white',
    shadowColor: '#cccccc',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 1,
    shadowRadius: 0,
    elevation: 1,
  },
  title: {
    fontWeight: 'bold',
    fontSize: 20
  },
  location: {
    fontSize: 16
  },
  statusIndicator: {
    position: 'absolute',
    right: 20,
    top: '50%',
    alignItems: 'flex-end'
  }
});

// poll server every 30 seconds
export default class Registration extends Component<{}> {
  static defaultProps = {
    clubs: [
      {
        id: 1,
        clubName: 'SoMaTTC',
        address: '360 4th Street, San Francisco, CA 94107',
        startHour: '14:15',
        city: 'San Francisco',
        state: 'CA',
        status: 'active',
        joined: 10,
      },
      {
        id: 2,
        clubName: 'Alameda Table Tennis Club',
        address: '2050 Lincoln Ave, Alameda, CA 94501',
        startHour: '15:00',
        city: 'Alameda',
        state: 'CA',
        status: 'inactive',
        joined: 20,
      }
    ],
  }

  viewDetail(club) {
    this.props.navigator.push({
      screen: 'matchpoints.ClubDetail',
      title: club.clubName,
      passProps: { club }
    });
  }

  renderStatusIndicator(status, timeDiff) {
    let color = 'red';
    let statusText = 'Inactive';
    console.log(timeDiff);
    if (status === 'active' && timeDiff >= 0) {
      color = timeDiff >= 15 ? 'green' : 'yellow';
      statusText = timeDiff >= 15 ? 'Active' :  'Starting Soon';
    }
    return (
      <View style={styles.statusIndicator}>
        <Text>
          <Icon name="circle" size={16} color={color} />
        </Text>
        <Text style={{ fontSize: 12, color: '#999', fontStyle: 'italic', backgroundColor: 'transparent' }}>{statusText}</Text>
      </View>
    );
  }

  renderItem = ({ item, index }) => {
    const time = moment(item.startHour, 'hh:mm');
    const timeDiff = time.diff(moment(), 'minutes');
    return (<TouchableHighlight onPress={() => this.viewDetail(item)} underlayColor="#e6e6e6" style={{ backgroundColor: 'transparent' }}>
      <View style={styles.item} key={item.id}>
        <Text style={styles.title}>{item.clubName}</Text>
        <Text style={styles.location}>{`${item.city}, ${item.state}`}</Text>
        {this.renderStatusIndicator(item.status, timeDiff)}
        {item.status === 'active' && <View style={{ position: 'absolute', bottom: 10, right: 10, flexDirection: 'row' }}>
          <Text style={{ marginRight: 10 }}>
            <Icon name="user" size={16} /> {item.joined}
          </Text>
          <Text style={{ marginRight: 10 }}>
            <Icon name="clock-o" size={16} /> {item.startHour}
          </Text>
        </View>}
      </View>
    </TouchableHighlight>);
  }

  render() {
    return (
      <View style={styles.container}>
        <FlatList
          keyExtractor={item => item.id}
          data={this.props.clubs}
          renderItem={this.renderItem}
        />
      </View>
    );
  }
}
