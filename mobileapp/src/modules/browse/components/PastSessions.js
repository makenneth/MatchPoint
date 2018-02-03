/* @flow */
import React, { Component } from 'react';
import { Text, View, Button, FlatList, TouchableHighlight } from 'react-native';
import moment from 'moment';
import styles from './styles/PastSessions';

export default class PastSessions extends Component<{}> {
  viewDetail = () => {

  }

  renderItem = ({ item }) => {
    const date = moment(item.date, 'YYYY-MM-DD');
    return (<TouchableHighlight
      underlayColor="#e6e6e6"
      style={{ backgroundColor: 'transparent' }}
    >
      <View style={styles.itemContainer}>
        <View style={styles.item}>
          <Text style={styles.title}>Date:</Text>
          <Text style={styles.players}>{date.format('MMM D, YYYY')}</Text>
        </View>
        <View style={styles.item}>
          <Text style={styles.title}>Players Joined:</Text>
          <Text style={styles.players}>{item.numOfPlayers}</Text>
        </View>
        <Button
          style={styles.viewResult}
          onPress={() => this.viewDetail(item)}
          title="View Result"
        />
      </View>
    </TouchableHighlight>);
  }

  render() {
    const { pastSessions } = this.props;
    return (<View style={styles.detailList}>
      <FlatList
        keyExtractor={item => item.id}
        data={pastSessions}
        renderItem={this.renderItem}
      />
    </View>);
  }
}
