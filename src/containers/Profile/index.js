import React, { Component } from 'react';
import { connect } from 'react-redux';
import FlatButton from 'material-ui/FlatButton';
import RaisedButton from 'material-ui/RaisedButton';
import { Card, CardActions, CardHeader, CardText } from 'material-ui/Card';
import { changePassword, changeInfo } from 'redux/modules/profile';
import { setMessage } from 'redux/modules/main';
import { PasswordChange, InfoChange } from 'components';
import { enableTutorial, disableTutorial, isTutorialEnabled } from 'redux/modules/tutorial';
import './styles.scss';

@connect(
  ({ auth: { club } }) => ({ club }),
  { changePassword, changeInfo, setMessage, enableTutorial, disableTutorial }
)
export default class Profile extends Component {
  constructor(props) {
    super(props);
    this.state = { tab: 0 };
  }

  setTab(tab) {
    this.setState({ tab });
  }

  handleToggleTutorial = () => {
    if (JSON.parse(isTutorialEnabled())) {
      this.props.disableTutorial();
    } else {
      this.props.enableTutorial();
    }
    this.forceUpdate();
  }

  render() {
    const tutorialEnabled = JSON.parse(isTutorialEnabled());
    return (<div className="profile-container">
      <Card containerStyle={{ padding: '15px', height: '100%' }}>
        <CardHeader
          title="Member Profile"
          titleStyle={{
            fontSize: '28px',
            fontFamily: '"Ropa Sans", sans-serif',
          }}
        />
        <CardActions style={{ borderBottom: '1px solid #e0e0e0' }}>
          <FlatButton
            label="Change Password"
            onClick={() => this.setTab(0)}
          />
          <FlatButton
            label="Change Info"
            onClick={() => this.setTab(1)}
          />
          <FlatButton
            label="Settings"
            onClick={() => this.setTab(2)}
          />
        </CardActions>
        <CardText style={{ display: this.state.tab === 0 ? 'block' : 'none' }}>
          <PasswordChange
            club={this.props.club}
            submitChange={this.props.changePassword}
            setMessage={this.props.setMessage}
          />
        </CardText>
        <CardText style={{ display: this.state.tab === 1 ? 'block' : 'none' }}>
          <InfoChange
            club={this.props.club}
            submitChange={this.props.changeInfo}
            setMessage={this.props.setMessage}
          />
        </CardText>
        <CardText style={{ display: this.state.tab === 2 ? 'block' : 'none' }}>
          <div className="setting-container">
            <div className={tutorialEnabled ? 'enabled' : 'disabled'}>
              <span>Tutorial:</span>{tutorialEnabled ? 'Enabled' : 'Disabled'}
              <RaisedButton
                label={tutorialEnabled ? 'Disable' : 'Enable'}
                onClick={this.handleToggleTutorial}
                labelColor="white"
                style={{ marginLeft: '30px' }}
              />
            </div>
          </div>
        </CardText>
      </Card>
    </div>);
  }
}
