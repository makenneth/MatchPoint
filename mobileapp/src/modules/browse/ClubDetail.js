/* @flow */
import React, { Component } from 'react';
import {
  Text,
  View,
  Button,
} from 'react-native';
import moment from 'moment';
import ScrollableTabView from 'react-native-scrollable-tab-view';
import styles from './styles/ClubDetail';
import Info from './components/Info';
import PastSessions from './components/PastSessions';
import DefaultTabBar from '../_global/scrollableTabView/DefaultTabBar';
// show hohurs
// have directions... possibly with lat lng of the club
// below should have a tab container
// one tab - showing past sessions - which should come from an api call
export default class ClubDetail extends Component<{}> {
  static defaultProps = {
    details: {
      1: {
        id: 1,
        name: 'SoMaTTC',
        address: '360 4th Street, San Francisco, CA 94107',
        phone: '(415) 490-7233',
        lat: 37.7812231,
        lng: -122.4007153,
        pastSessions: [
         // 5 most recent ones
          {
            id: 1,
            date: '2018-01-31',
            numOfPlayers: 10,
          },
          {
            id: 2,
            date: '2018-01-30',
            numOfPlayers: 10,
          },
          {
            id: 3,
            date: '2018-01-29',
            numOfPlayers: 10,
          },
          {
            id: 4,
            date: '2018-01-28',
            numOfPlayers: 10,
          },
        ],
        roundrobinHours: [
          [], [], [],
          [], [], [],
          [
            {
              start: '19:00',
              end: '21:30'
            }
          ]
        ],
        operatinghours: [
          [], [], [
            {
              start: '17:30',
              end: '21:30'
            }
          ],
          [], [], [],
          [
            {
              start: '17:30',
              end: '21:30'
            }
          ]
        ],
      },
      2: {
        id: 2,
        name: 'Alameda Table Tennis Club',
        address: '2050 Lincoln Ave, Alameda, CA 94501',
        phone: '(510) 306-1150',
        roundrobinHours: [
          [
          ], [], [],
          [
            {
              start: '19:00',
              end: '21:00'
            }
          ], [], [],
          [
            {
              start: '15:00',
              end: '17:00'
            }
          ],
        ],
        operatinghours: [
          [
            {
              start: '14:00',
              end: '20:00',
            }
          ],
          [
            {
              start: '17:00',
              end: '22:00',
            }
          ],
          [
            {
              start: '15:30',
              end: '22:00'
            }
          ],
          [
            {
              start: '17:00',
              end: '22:00',
            }
          ],
          [
            {
              start: '15:30',
              end: '22:00'
            }
          ],
          [
            {
              start: '10:00',
              end: '12:00',
            },
            {
              start: '17:00',
              end: '22:00',
            }
          ],
          [
            {
              start: '17:30',
              end: '21:30'
            }
          ],
        ],
      }
    }
  };

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
