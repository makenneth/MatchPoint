import React, { Component } from "react"
import { fetchCurrentClub, logIn } from "../../actions/clubActions"
import ClubStore from "../../stores/clubStore"
import { browserHistory } from 'react-router'  
import TextField from 'material-ui/TextField'
import RaisedButton from 'material-ui/RaisedButton'
export default class LogInForm extends Component {
  constructor(props){
    super(props);

    this.state = {
      username: "",
      password: "",
      error: ""
    }
  }
  componentWillMount() {
    if (ClubStore.getCurrentClub()){
      browserHistory.push("/club");
    } else {
      this.csListener = ClubStore.addListener(this._clubStoreChange);
      fetchCurrentClub();
    }
  }
  updateField(field, e){
    let newField = {[field]: e.target.value};

    if (this.state.error) { 
      newField.error = "";
    }
    this.setState(newField)
  }
  _clubStoreChange = () => {
    const error = ClubStore.getError(),
          club = ClubStore.getCurrentClub();
    if (club){
      browserHistory.push("/club");
    } else if (error){
      this.setState({ error });
    }
  }
  handleSubmit = (e) => {
    if (e) {
      e.preventDefault();
     if (e.target.tagName !== "BUTTON"){
      logIn(this.state);
      }
    } else {
      logIn(this.state)
    }
  }
  guestLogIn = (e) => {
    e.preventDefault();
    const user = "guest",
          password = "password";
    let count = 0;
    let int = setInterval( () => {
      if (count < 5){
        this.setState({username: this.state.username + user[count++]})
      } else if (count < 13){
        this.setState({password: this.state.password + password[count++ - 5]})
      } else {
        clearInterval(int);
        this.handleSubmit();
      }
    }, 200)
  }
  componentWillUnmount() {
    this.csListener.remove();
  }
  render() {
    return <div className="forms">
      <form onSubmit={this.handleSubmit}>
        <h3>Log In</h3>
        { this.state.error }
        <div>     
          <TextField type="text"
                 hintText="username" 
                 floatingLabelText="Username"
                 value={this.state.username}
                 onChange={this.updateField.bind(this, "username")} />
        </div>
        <div>
          <TextField type="password"
                hintText="password" 
                floatingLabelText="Password"
                value={this.state.password}
                onChange={this.updateField.bind(this, "password")} />
        </div>
        <div className="button-div">
          <RaisedButton label="Log In" style={{marginRight: '10px'}} onClick={this.handleSubmit}/>
          <RaisedButton label="Guest" onClick={this.guestLogIn} />
        </div>
        <div className="redirect-signup">
          Don't have an account yet?&nbsp;&nbsp;<a onClick={() => this.props.setTab(2)}>Sign Up</a>
        </div>
      </form>
    </div>;
  }
}