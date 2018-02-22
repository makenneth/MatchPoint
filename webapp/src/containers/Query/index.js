import React, { Component } from 'react';
import { connect } from 'react-redux';
// import { Tabs, Tab } from 'material-ui/Tabs';
import { fetchAllClubs } from 'redux/modules/query';
import ClubQuery from './ClubQuery';

import './styles.scss';

@connect(({ query }) => ({ loading: query.loading }), { fetchAllClubs })
export default class Query extends Component {
  constructor(props) {
    super(props);
    this.state = {
      tab: 0,
    };
  }

  componentWillMount() {
    this.props.fetchAllClubs();
  }

  handleTabChange = (tab) => {
    this.setState({ tab });
  }

  render() {
    return (<div className={`result-query-container${this.props.loading ? ' loading' : ''}`}>
{/*      <Tabs
        value={this.state.tab}
        onChange={this.handleTabChange}
        style={{
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
        }}
        tabItemContainerStyle={{ backgroundColor: 'white' }}
        contentContainerStyle={{
          padding: '20px',
          height: '100%',
        }}
      >
        <Tab label="Club" value={0} className="tab-menu-tab">*/}
      <ClubQuery />
{/*        </Tab>
      </Tabs>*/}
    </div>);
  }
}
