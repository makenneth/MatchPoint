import React from 'react';
import ReactDOM from 'react-dom';
import { Router, Route, browserHistory, IndexRoute } from 'react-router';
import Players from "./components/rrSession/players";
import NavBar from './components/navBar';
import Splash from "./components/splash";
import SignUp from "./components/users/signUp";
import RoundrobinResultList from "./components/rrSession/roundrobinResultList";
import RoundrobinSession from "./components/rrSession/roundrobinSession";
import Club from "./components/club";
import NewRRSession from "./components/rrSession/newRRSession";
import LogIn from "./components/users/logIn";
import UserStore from "./stores/userStore";
import Modal from "react-modal";

class App extends React.Component {
  constructor(props){
    super(props);
    this.state = {currentUser: null};
  }
  componentWillMount() {
    let el = document.getElementById("root");
    Modal.setAppElement(el);    
  }

  componentDidMount(){
    this.cuListener = UserStore.addListener(this.setCurrentUser);
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
  render() {
    return (<div>
      <NavBar {...this.state} />
      { this.props.children }
    </div>);
  }
}

let Routes = (
  <Route path="/" component={App}>
    <IndexRoute component={Splash}/>
    <Route path="login" component={LogIn} />
    <Route path="signup" component={SignUp} />
    <Route path="club" component={Club} >
      <Route path="rrResults" component={RoundrobinResultList} >
        <Route path=":date" component={RoundrobinSession} />
       </Route> 
      <Route path="newRRSession" component={NewRRSession} >
        <Route path="players" component={Players} />
      </Route>
    </Route>
  </Route>
)


document.addEventListener("DOMContentLoaded", ()=>{
    ReactDOM.render(
      <Router history={browserHistory}>
        {Routes}
      </Router>,
      document.getElementById("root")
    );
});
