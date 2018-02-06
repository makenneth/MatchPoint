import React, { Component } from 'react';
import { connect } from 'react-redux';
import FlatButton from 'material-ui/FlatButton';
import RaisedButton from 'material-ui/RaisedButton';
import { Card, CardActions, CardHeader, CardText } from 'material-ui/Card';
import { PasswordChange, InfoChange, OperationInfo } from 'components';
import { changePassword, changeInfo } from 'redux/modules/profile';
import { addressAutoComplete, clearPredictions } from 'redux/modules/autocomplete';
import { setMessage } from 'redux/modules/main';
import { enableTutorial, disableTutorial, isTutorialEnabled } from 'redux/modules/tutorial';
import { updateClubHour, addClubHour, deleteClubHour } from 'redux/modules/hour';
import { fetchClubHours } from 'redux/modules/hours';
import './styles.scss';

@connect(
  ({ auth: { club }, autocomplete, passwordChange, infoChange, hours, hour }) =>
    ({ club, autocomplete, passwordChange, infoChange, hours, hour }),
  {
    changePassword,
    changeInfo,
    setMessage,
    enableTutorial,
    disableTutorial,
    addressAutoComplete,
    clearPredictions,
    updateClubHour,
    addClubHour,
    deleteClubHour,
    fetchClubHours,
  }
)
export default class Profile extends Component {
  constructor(props) {
    super(props);
    this.state = { tab: 2 };
  }

  componentWillMount() {
    if (!this.props.hours.isLoaded && !this.props.hours.isLoading) {
      this.props.fetchClubHours();
    }
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
      <Card className="profile-tab-container">
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
            label="Operation Info"
            onClick={() => this.setTab(2)}
          />
          <FlatButton
            label="Settings"
            onClick={() => this.setTab(3)}
          />
        </CardActions>
        <CardText style={{ display: this.state.tab === 0 ? 'block' : 'none' }}>
          <PasswordChange
            club={this.props.club}
            submitChange={this.props.changePassword}
            setMessage={this.props.setMessage}
            passwordChange={this.props.passwordChange}
          />
        </CardText>
        <CardText style={{ display: this.state.tab === 1 ? 'block' : 'none', overflowY: 'auto' }}>
          <InfoChange
            infoChange={this.props.infoChange}
            autocomplete={this.props.autocomplete}
            club={this.props.club}
            submitChange={this.props.changeInfo}
            setMessage={this.props.setMessage}
            addressAutoComplete={this.props.addressAutoComplete}
            clearPredictions={this.props.clearPredictions}
          />
        </CardText>
        <CardText style={{ display: this.state.tab === 2 ? 'block' : 'none', overflowY: 'auto' }}>
          <OperationInfo
            updateClubHour={this.props.updateClubHour}
            addClubHour={this.props.addClubHour}
            deleteClubHour={this.props.deleteClubHour}
            hoursState={this.props.hours}
            hourState={this.props.hour}
          />
        </CardText>
        <CardText style={{ display: this.state.tab === 3 ? 'block' : 'none' }}>
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
