import React, { Component } from 'react';
import { connect } from 'react-redux';
import FlatButton from 'material-ui/FlatButton';
import RaisedButton from 'material-ui/RaisedButton';
import { Card, CardActions, CardHeader, CardText } from 'material-ui/Card';
import { PasswordChange, OperationInfo } from 'components';
import { changePassword, changeInfo } from 'redux/modules/profile';
import { addressAutoComplete, clearPredictions } from 'redux/modules/autocomplete';
import { setMessage } from 'redux/modules/main';
import { enableTutorial, disableTutorial, isTutorialEnabled } from 'redux/modules/tutorial';
import { updateClubHour, addClubHour, deleteClubHour } from 'redux/modules/hour';
import { updateClubNote } from 'redux/modules/clubNotes';
import { fetchClubDetail } from 'redux/modules/ownClubDetail';
import './styles.scss';

@connect(
  ({
    auth: { user }, autocomplete, passwordChange,
    infoChange, ownClubDetail, hour, clubNotes
  }) =>
    ({
      user, autocomplete, passwordChange,
      infoChange, ownClubDetail, hour, clubNotes,
    }),
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
    fetchClubDetail,
    updateClubNote,
  }
)
export default class Profile extends Component {
  constructor(props) {
    super(props);
    this.state = { tab: 0 };
  }

  componentWillMount() {
    if (!this.props.ownClubDetail.isLoaded && !this.props.ownClubDetail.isLoading) {
      this.props.fetchClubDetail();
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
            label="Operation Info"
            onClick={() => this.setTab(1)}
          />
          <FlatButton
            label="Settings"
            onClick={() => this.setTab(2)}
          />
        </CardActions>
        {this.state.tab === 0 && <CardText style={{ overflowY: 'auto' }}>
          <PasswordChange
            user={this.props.user}
            submitChange={this.props.changePassword}
            setMessage={this.props.setMessage}
            passwordChange={this.props.passwordChange}
          />
        </CardText>}
        {this.state.tab === 1 && <CardText style={{ overflowY: 'auto' }}>
          <OperationInfo
            clubNotes={this.props.clubNotes}
            updateClubNote={this.props.updateClubNote}
            infoChange={this.props.infoChange}
            autocomplete={this.props.autocomplete}
            user={this.props.ownClubDetail}
            submitChange={this.props.changeInfo}
            setMessage={this.props.setMessage}
            addressAutoComplete={this.props.addressAutoComplete}
            clearPredictions={this.props.clearPredictions}
            updateClubHour={this.props.updateClubHour}
            addClubHour={this.props.addClubHour}
            deleteClubHour={this.props.deleteClubHour}
            hoursState={this.props.ownClubDetail}
            hourState={this.props.hour}
          />
        </CardText>}
        {this.state.tab === 2 && <CardText style={{ overflowY: 'auto' }}>
          <div className="setting-container">
            <div className={tutorialEnabled ? 'enabled' : 'disabled'}>
              <span>Tutorial:</span>{tutorialEnabled ? 'Enabled' : 'Disabled'}
              <RaisedButton
                label={tutorialEnabled ? 'Disable' : 'Enable'}
                onClick={this.handleToggleTutorial}
                labelColor="#FFFFFF"
                style={{ marginLeft: '30px' }}
              />
            </div>
          </div>
        </CardText>}
      </Card>
    </div>);
  }
}
