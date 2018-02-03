/* @flow */
import React, { Component } from 'react';
import {
  Text,
  View,
  Button,
  Switch,
} from 'react-native';
import moment from 'moment';

export default class ClubDetail extends Component<{}> {
  state = {
    tab: 0,
  };

  handleTabChange = ({ i, ref }) => {
    this.setState({ tab: i });
  }

  findNextSession({ roundrobinHours }) {
    // show up coming sessions
    const today = moment();
    let currentDay = moment();
    for (let i = 0; i < 200; i++) {
      let dayOfWeek = currentDay.day();
      for (const { start } of roundrobinHours[dayOfWeek]) {
        const [hour, minute] = start.split(':');
        currentDay.set({ hour, minute });
        if (currentDay.isAfter(today)) {
          return currentDay.format('MMM DD, YYYY  h:mm A');
        }
      }
      currentDay.add(1, 'day');
    }
    return null;
  }

  render() {
    const { club, isRegistered = false, details, activeDetail } = this.props;
    const detail = details[club.id];
    return (
      <View style={styles.container}>
        {
          activeDetail &&
          <View>
            <View style={styles.detailListItem}>
              <Text style={styles.mainLabel}>Start Time: </Text>
              <Text style={{ paddingLeft: 15 }}>{activeDetail.roundrobinHour.start}</Text>
            </View>
            <View style={styles.detailListItem}>
              <Text style={styles.mainLabel}>Number of Players Signed up</Text>
              <Text style={{ paddingLeft: 15 }}>{activeDetail.joined}</Text>
            </View>
            {isRegistered ? <Text>You have registered!</Text> : <Button title="Register" />}
          </View>
        }
        {
          !activeDetail &&
          <View>
            <Text>No active session.</Text>
            <Text>Next Session on {this.findNextSession(detail)}</Text>
          </View>
        }
        <View style={styles.contentContainer}>
          <ScrollableTabView
            onChangeTab={this.handleTabChange}
            renderTabBar={() => (
              <DefaultTabBar
                textStyle={styles.textStyle}
                underlineStyle={styles.underlineStyle}
                style={styles.tabBar}
              />
            )}
          >
            <Info tabLabel="INFO" detail={detail} />
            <PastSessions tabLabel="PAST SESSIONS" pastSessions={detail.pastSessions} />
          </ScrollableTabView>
        </View>
      </View>
    );
  }
}
