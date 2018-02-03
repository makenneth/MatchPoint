import React, { Component, PropTypes } from 'react';
import {
  RefreshControl,
  ScrollView,
  Text,
  View,
  FlatList,
  TouchableHighlight
} from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
// import LinearGradient from 'react-native-linear-gradient';
// import ScrollableTabView from 'react-native-scrollable-tab-view';
// import Swiper from 'react-native-swiper';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import moment from 'moment';

import * as clubActions from '../../actions/clubs';
import ProgressBar from '../_global/ProgressBar';
import Color from '../_global/constants/Color';
import styles from './styles/Browse';

class Browse extends Component {
   static defaultProps = {
    activeClubs: {
      1: {
        id: 1,
        status: 'active',
        joined: 10,
        roundrobinHour: {
          start: '19:00',
          end: '21:30'
        },
      },
    },
  }

  constructor(props) {
    super(props);

    this.state = {
      isRefreshing: false,
    };

    this.handleRefresh = this.handleRefresh.bind(this);
  }

  componentWillMount() {
    this.getClubs();
  }

  getClubs() {
    if (!this.props.clubState.isLoaded) {
      this.props.actions.getClubs();
    }
  }
  // _retrieveDetails(isRefreshed) {
  //   this.props.actions.retrieveMovieDetails(this.props.movieId)
  //     .then(() => {
  //       this._retrieveYoutubeDetails();
  //     });
  //   if (isRefreshed && this.setState({ isRefreshing: false }));
  // }

  // _retrieveSimilarMovies() {
  //   this.props.actions.retrieveSimilarMovies(this.props.movieId, 1);
  // }

  handleRefresh() {
    // this.setState({ isRefreshing: true });
    this.getClubs();
  }

  handleScroll(event) {
    const contentOffsetY = event.nativeEvent.contentOffset.y.toFixed();
    if (contentOffsetY > 150) {
      // this._toggleNavbar('hidden');
    } else {
      // this._toggleNavbar('shown');
    }
  }

  _getTabHeight(tabName, height) {
    if (tabName === 'casts') this.setState({ castsTabHeight: height });
    if (tabName === 'trailers') this.setState({ trailersTabHeight: height });
  }

  viewDetail(club) {
    const { activeClubs } = this.props;
    this.props.navigator.push({
      screen: 'movieapp.ClubDetail',
      title: club.clubName,
      passProps: { club, activeDetail: activeClubs[club.id] }
    });
  }

  renderStatusIndicator(isActive, timeDiff) {
    let color = Color.RED;
    let statusText = 'Inactive';
    if (isActive && timeDiff >= 0) {
      color = timeDiff >= 15 ? Color.GREEN : Color.YELLOW;
      statusText = timeDiff >= 15 ? 'Active' :  'Starting Soon';
    }
    return (
      <View style={styles.statusIndicator}>
        <Text>
          <Icon name="ios-radio-button-on" size={16} color={color} />
        </Text>
        <Text style={{ fontSize: 12, color: '#999', fontStyle: 'italic', backgroundColor: 'transparent' }}>{statusText}</Text>
      </View>
    );
  }

  renderItem = ({ item }) => {
    const time = moment(item.startHour, 'hh:mm');
    const timeDiff = time.diff(moment(), 'minutes');
    const isActive = this.props.activeClubs[item.id];
    return (<TouchableHighlight onPress={() => this.viewDetail(item)} underlayColor="#e6e6e6" style={{ backgroundColor: 'transparent' }}>
      <View style={styles.item} key={item.id}>
        <Text style={styles.title}>{item.clubName}</Text>
        <Text style={styles.location}>{`${item.city}, ${item.state}`}</Text>
        {this.renderStatusIndicator(isActive, timeDiff)}
        {isActive && <View style={{ position: 'absolute', bottom: 10, right: 10, flexDirection: 'row' }}>
          <Text style={{ marginRight: 10 }}>
            <Icon name="ios-person" size={16} /> {isActive.joined}
          </Text>
          <Text style={{ marginRight: 10 }}>
            <Icon name="ios-clock" size={16} /> {isActive.roundrobinHour.start}
          </Text>
        </View>}
      </View>
    </TouchableHighlight>);
  }

  render() {
    // if (this.state.tab === 0) height = this.state.infoTabHeight;
    // if (this.state.tab === 1) height = this.state.castsTabHeight;
    // if (this.state.tab === 2) height = this.state.trailersTabHeight;
    const { clubState } = this.props;
    if (this.state.isLoading) {
      return <View style={styles.progressBar}><ProgressBar /></View> ;
    }
    return (
      <ScrollView
        style={styles.container}
        // {// onScroll={this.onScroll.bind(this)}}
        scrollEventThrottle={100}
        // onContentSizeChange={this._onContentSizeChange}
        refreshControl={
          <RefreshControl
            refreshing={clubState.isLoading}
            onRefresh={this.handleRefresh}
            colors={['#EA0000']}
            tintColor="white"
            title="loading..."
            titleColor="white"
            progressBackgroundColor="white"
          />
        }
      >
        <View style={styles.container}>
          <FlatList
            keyExtractor={item => item.id}
            data={clubState.clubs}
            renderItem={this.renderItem}
          />
        </View>
      </ScrollView>
    );
  }
}

Browse.navigatorStyle = {
  // navBarTransparent: true,
  // drawUnderNavBar: true,
  // navBarTranslucent: true,
  // statusBarHidden: true,
  // navBarTextColor: 'white',
  // navBarButtonColor: 'white'
};

Browse.propTypes = {
  clubs: PropTypes.array.isRequired,
  actions: PropTypes.object.isRequired,
};

function mapStateToProps(state) {
  return {
    clubState: state.clubs,
  };
}

function mapDispatchToProps(dispatch) {
  return {
    actions: bindActionCreators(clubActions, dispatch)
  };
}

export default connect(mapStateToProps, mapDispatchToProps)(Browse);
