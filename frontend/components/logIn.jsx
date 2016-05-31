import React from 'react';
import Form from "../mixins/form";
import UserActions from "../actions/userActions";
import CSRFStore from "../stores/csrfStore";

class LogIn extends React.Component {
    constructor(props) {
        super(props);
    }
    static PropTypes = {
    	username: React.PropTypes.string,
    	password: React.PropTypes.string,
    	_handleSubmit: React.PropTypes.func,
    	_updateField: React.PropTypes.func
    }

    render() {
        return <div className="forms">
          <form onSubmit={this.props._handleSubmit.bind(null, UserActions.logIn) }>
            <h3>Log In</h3>
            { this.props._csrf() }
             <div>
          		<label for="username">Username</label>
          		<input type="text" id="username" value={this.props.username}
                    onChange={this.props._updateField.bind(null, "username")}
                    required/>
            </div>
            <div>
          		<label for="password">Password</label>
          		<input type="password" id="password" value={this.props.password}
                    onChange={this.props._updateField.bind(null, "password")}
                    required/>
            </div>
            <input type="submit" value="Log In"/>
          </form>
        </div>;
    }
}
let fields = {
	username: "",
	password: ""
};

LogIn = Form(LogIn, fields, CSRFStore, UserActions);
export default LogIn;
