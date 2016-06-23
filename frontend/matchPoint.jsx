import React from 'react';
import ReactDOM from 'react-dom';
import { Router, Route, browserHistory, IndexRoute } from 'react-router';
import Modal from "react-modal";
import { NavBar, Splash, SignUp, LogIn, 
          Club, Players, NewRRSession, ErrorPage,
          RoundRobinSessions, RoundRobinSession } from './routes';

class App extends React.Component {
  constructor(props){
    super(props);
    
  }
  componentWillMount() {
    var el = document.getElementById("root");
    Modal.setAppElement(el);    
  }
  render() {
    return (<div>
      <NavBar {...this.state} />
      { this.props.children }
    </div>);
  }
}

const Routes = (
  <Route path="/" component={App}>
    <IndexRoute component={Splash}/>
    <Route path="login" component={LogIn} />
    <Route path="signup" component={SignUp} />
    <Route path="club" component={Club} >
      <Route path="sessions" component={RoundRobinSessions} >
       </Route> 
      <Route path="newSession" component={NewRRSession} >
        <Route path="players" component={Players} />
      </Route>
    </Route>
    <Route path="*" component={ ErrorPage } />
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
