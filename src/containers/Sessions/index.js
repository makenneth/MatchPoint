import React, { Component } from 'react';
import { asyncConnect } from 'redux-async-connect';
import { browserHistory } from 'react-router';
import { connect } from 'react-redux';
import { List, ListItem } from 'material-ui/List';
import { fetchUserRRSessions } from 'redux/modules/sessions';
import { setSession } from 'redux/modules/selectedSession';
import Avatar from 'material-ui/Avatar';
import Subheader from 'material-ui/Subheader';
import Divider from 'material-ui/Divider';
import Edit from 'react-icons/lib/md/edit';
import View from 'react-icons/lib/md/pageview';
import Event from 'react-icons/lib/md/event';
import Warning from 'react-icons/lib/md/warning';
import moment from 'moment';

@asyncConnect([{
  promise: ({ store }) => {
    let promise;
    const sessions = store.getState().sessions;
    if (!sessions.loaded && !sessions.loading) {
      promise = store.dispatch(fetchUserRRSessions());
    }

    return promise;
  },
}])
@connect(({ sessions }) => ({ sessions: sessions.sessions }), { setSession })
export default class RoundRobinSessions extends Component {
  handleClick = (id) => {
    const session = this.props.sessions.find(s => s.id === id);
    new Promise((resolve) => {
      return resolve(this.props.setSession(session));
    }).then(() => {
      browserHistory.push(`/club/sessions/${id}`);
    });
  }
  render() {
    const finalized = [];
    const notFinalized = [];
    const sessions = this.props.sessions || [];

    for (let i = 0; i < sessions.length; i++) {
      const curSession = sessions[i];
      if (curSession.finalized) {
        const session = (<ListItem
          key={curSession.id}
          onClick={() => this.handleClick(curSession.id)}
          leftAvatar={<Avatar icon={<Event />} />}
          primaryText={moment(curSession.date).utc().format('MMMM DD, YYYY')}
          rightIcon={<View />}
        />);
        finalized.push(session);
      } else {
        const session = (<ListItem
          key={curSession.id}
          onClick={() => this.handleClick(curSession.id)}
          leftAvatar={<Avatar icon={<Event />} />}
          primaryText={moment(curSession.date).utc().format('MMMM DD, YYYY')}
          rightIcon={<Edit />}
        />);
        notFinalized.push(session);
      }
    }

    return (<div className="sessions-list">
      <List>
        <Subheader
          style={{
            fontSize: '28px',
            textAlign: 'center',
            marginBottom: '10px',
            fontFamily: '"Ropa Sans", sans-serif',
          }}
        >Previous Sessions</Subheader>
        <Divider />
        <Subheader inset={Boolean(true)}>Pending Sessions</Subheader>
        {
          !notFinalized.length &&
            <ListItem
              key={'noth'}
              primaryText="There are no pending sessions..."
              leftAvatar={<Avatar icon={<Warning />} />}
              disabled
            />
        }
        {notFinalized}
      </List>
      <Divider inset={Boolean(true)} />
      <List>
        <Subheader inset={Boolean(true)}>Saved Sessions</Subheader>
        {
          !finalized.length &&
            <ListItem
              key={'noth'}
              primaryText="There are no saved sessions..."
              leftAvatar={<Avatar icon={<Warning />} />}
              disabled
            />
        }
        {finalized}
      </List>
    </div>);
  }
}
