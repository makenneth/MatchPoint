/* @flow */
import React, { Component } from 'react';
import { Text, View, StyleSheet, Button } from 'react-native';
import { showLocation } from 'react-native-map-link'
import moment from 'moment';
import styles from './styles/Info';

export default class Info extends Component<{}> {

  openDirection = (club) => {
    showLocation({
      latitude: club.lat,
      longitude: club.lng,
      name: club.name,
    });
  }

  renderTimeList(timeList, verb) {
    return (<View style={styles.timeList}>
      {timeList.filter(day => day.length > 0).map((day, i) => (
        <View key={i} style={styles.timeListItem}>
          <View style={styles.dayTimeList}>
            <Text style={styles.label}>{moment().day(i).format('dddd')}:</Text>
            <Text style={styles.time}>
              {!day.length && `Not ${verb}`}
              {day.map(period => `${period.start}-${period.end}`).join(", ")}
            </Text>
          </View>
        </View>
      ))}
    </View>);
  }

  render() {
    const { detail } = this.props;

    return (<View style={styles.detailList}>
      <View style={styles.detailListItem}>
        <Text style={styles.mainLabel}>Address: </Text>
        <Text style={{ paddingLeft: 15 }}>{detail.address}</Text>
        <Button title="Get Direction" onPress={() => this.openDirection(detail)}/>
      </View>
      <View style={styles.detailListItem}>
        <Text style={styles.mainLabel}>Operating Hours: </Text>
        {this.renderTimeList(detail.operatinghours, 'open')}
      </View>
      <View style={styles.detailListItem}>
        <Text style={styles.mainLabel}>Round Robin Hours: </Text>
        {this.renderTimeList(detail.roundrobinHours, 'hosted')}
      </View>
    </View>);
  }
}
