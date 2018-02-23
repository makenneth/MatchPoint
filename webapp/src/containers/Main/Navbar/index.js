import React, { Component } from 'react';
import { push } from 'react-router-redux';
import Drawer from 'material-ui/Drawer';
import MenuItem from 'material-ui/MenuItem';
import { connect } from 'react-redux';
import { openLogin, setPage } from 'redux/modules/splash';
import { logIn, logOut } from 'redux/modules/auth';
import { open, close, setTab, preSetTab } from 'redux/modules/navbar';
import Search from './Search';

import './styles.scss';

@connect(
  ({ auth: { user, loading }, navbar }) => ({ user, navbar, loading }),
  { openLogin, logIn, logOut, open, close, setTab, preSetTab, setPage, push }
)
export default class Navbar extends Component {
  state = {
    expanded: true,
    searchValue: '',
    inputFocused: false,
  }

  componentWillMount() {
    this.props.preSetTab(this.props.pathname);
    window.addEventListener('resize', this.handleResize);
    this.handleResize();
  }

  // shouldComponentUpdate(nextProps, nextState) {
  //   // if (this.props.pathname !== nextProps.pathname ||
  //   //   this.props.navbar !== nextProps.navbar || this.state !== nextState) {
  //   //   return true;
  //   // }
  //   // if ((!this.props.user && nextProps.user) ||
  //   //   (!nextProps.user.id && this.props.user && this.props.user.id)) {
  //   //   return true;
  //   // }
  //   // return false;
  //   return true;
  // }

  componentWillUnmount() {
    window.removeEventListener('resize', this.handleResize);
  }

  handleResize = () => {
    const width = window.innerWidth;
    if (!this.state.expanded && width > 800) {
      this.setState({ expanded: true });
    } else if (this.state.expanded && width <= 800) {
      this.setState({ expanded: false });
    }
  }

  handleLogout = () => {
    this.props.logOut();
  }

  handleLink(link, tab) {
    if (tab === 0) {
      this.props.setPage(0);
    }

    this.props.setTab(tab);
    this.props.push(link);
  }

  openLogin = () => {
    this.props.push('/');
    this.props.openLogin();
  }

  renderSideNav() {
    const { tab, opened } = this.props.navbar;

    if (this.props.user.id) {
      return (<Drawer
        open={opened}
        openSecondary={Boolean(true)}
        docked={false}
        onRequestChange={this.props.close}
        zDepth={5}
        className="sliding-menu"
      >
        <MenuItem
          onTouchTap={() => this.handleLink('/club', 0)}
          primaryText="Home"
          insetChildren={Boolean(true)}
          checked={tab === 0}
        />
        <MenuItem
          onTouchTap={() => this.handleLink('/club/profile', 4)}
          primaryText="Profile"
          insetChildren={Boolean(true)}
          checked={tab === 4}
        />
        <MenuItem
          onTouchTap={() => this.handleLink('/club/sessions/new', 1)}
          primaryText="New Session"
          insetChildren={Boolean(true)}
          checked={tab === 1}
        />
        <MenuItem
          onTouchTap={() => this.handleLink('/club/sessions', 2)}
          primaryText="Old Sessions"
          insetChildren={Boolean(true)}
          checked={tab === 2}
        />
        <MenuItem
          onTouchTap={() => this.handleLink('/results', 3)}
          primaryText="Browse Results"
          insetChildren={Boolean(true)}
          checked={tab === 3}
        />
        <MenuItem
          onTouchTap={this.handleLogout}
          primaryText="Log Out"
          insetChildren={Boolean(true)}
        />
      </Drawer>);
    }

    return (<Drawer
      open={opened}
      openSecondary={Boolean(true)}
      docked={false}
      onRequestChange={this.props.close}
      className="sliding-menu"
    >
      <MenuItem
        onTouchTap={() => this.handleLink('/', 0)}
        primaryText="Home"
        checked={tab === 0}
        insetChildren={Boolean(true)}
      />
      <MenuItem
        onTouchTap={() => this.handleLink('/results', 3)}
        primaryText="Browse Results"
        insetChildren={Boolean(true)}
        checked={tab === 3}
      />
      {
        this.props.pathname === '/' ||
          <MenuItem
            primaryText="Log In"
            onClick={this.openLogin}
            onTouchTap={this.openLogin}
            insetChildren={Boolean(true)}
          />
      }
    </Drawer>);
  }

  renderNormalNav() {
    const tab = this.props.navbar.tab;
    if (this.props.user.id) {
      return (<ul className="nav">
        <li
          onClick={() => this.handleLink('/club/profile', 4)}
          className={tab === 4 ? 'active-links' : ''}
        >
          Profile
        </li>
        <li
          onClick={() => this.handleLink('/club', 1)}
          className={tab === 1 ? 'active-links' : ''}
        >
          New Session
        </li>
        <li
          onClick={() => this.handleLink('/club/sessions', 2)}
          className={tab === 2 ? 'active-links' : ''}
        >
          Old Sessions
        </li>
        <li
          onClick={() => this.handleLink('/results', 3)}
          className={tab === 3 ? 'active-links' : ''}
        >
          Browse Results
        </li>
        <li onClick={this.handleLogout}>Log Out</li>
      </ul>);
    }
    return (<ul className="nav">
      <li onClick={() => this.handleLink('/results', 3)} className={tab === 3 ? 'active-links' : ''}>Browse Results</li>
      {
        this.props.pathname === '/' ||
          <li className="nav-links" onClick={this.openLogin}>Log In</li>
      }
    </ul>);
  }

  render() {
    const { expanded } = this.state;
    const { loading } = this.props;

    return (<div
      className={`nav-bar ${this.props.pathname === '/' ||
        this.props.pathname === '/reset' ||
        this.props.pathname === '/activate/success' ? 'no-color' : 'color'}`
      }
    >
      <div>
        <div className="logo" onClick={() => this.handleLink(this.props.user.id ? '/club' : '/', 0)}>
          MatchPoints
        </div>
        <Search />
        {!loading && !expanded && <div className="collapsed-icon" onClick={this.props.open}>&#9776;</div>}
        {!loading && expanded && this.renderNormalNav()}
        {!loading && !expanded && this.renderSideNav()}
      </div>
    </div>);
  }
}
