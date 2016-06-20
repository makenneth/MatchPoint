import React from 'react';
import { Link, browserHistory } from 'react-router';
import UserActions from '../actions/userActions';
import UserStore from "../stores/userStore";

export default class NavBar extends React.Component {
    constructor(props) {
        super(props);
        this.displayName = 'NavBar';
        this.state = { currentUser: null };
    }
    componentDidMount() {
        this.cuListener = UserStore.addListener(this.setCurrentUser);
        if (!this.state.currentUser){
            UserActions.fetchCurrentUser();
        }
    }

    componentWillUnmount() {
        if (this.cuListener) this.cuListener.remove();   
    }

    setCurrentUser = () => {
        let currentUser = UserStore.getCurrentUser();
        if (currentUser){
          this.setState({currentUser: currentUser});
        } else {
          if (this.state.currentUser) this.setState({currentUser: null});
          browserHistory.push("/");
        }
    }
    rightNav() {
        if (this.state.currentUser){
            return  <ul><li>Welcome, { this.state.currentUser.username }</li>
                <li onClick={this.logOut}>Log Out</li></ul>;
        } else {
            return  <ul><li><Link to="/login" activeClassName="active" className="links">Log In</Link></li>
                <li><Link to="/signup" activeClassName="active"  className="links">Sign Up</Link></li></ul>;
        }
    }

    logOut() {
        UserActions.logOut();
    }

    render() {
        return <div className="nav-bar">
            <div>
            	<div className="logo links" href="/">Match.Point</div>
                { this.rightNav() }
            </div>
        </div>;
    }
}

