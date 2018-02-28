import React from 'react';
import Dialog from 'material-ui/Dialog';
import FlatButton from 'material-ui/FlatButton';
import { RecordTableContainer } from 'containers';
import moment from 'moment';
import MenuBar from './MenuBar';
import EditDetailModal from './EditDetailModal';

export default class EditSession extends React.PureComponent {
  constructor(props) {
    super(props);
    this.state = {
      currentTab: 0,
      open: false,
      editModalOpen: false,
    };
  }

  componentWillReceiveProps(nextProps) {
    if (this.props.session !== nextProps.session) {
      this.setState({ editModalOpen: false });
    }
  }

  setTab = (currentTab) => {
    this.setState({ currentTab });
  }

  saveSession = () => {
    const session = this.props.session;
    if (this.props.editable) {
      this.props.postResult(
        session.short_id,
        moment(session.date).format('YYYY-MM-DD'),
        this.props.results
      );
    }
  }

  handleClose = () => {
    this.setState({ open: false });
  }
  handleDelete = () => {
    this.props.deleteSession(this.props.id);
  }

  handleBack = () => {
    this.props.push('/club/sessions');
  }

  handleEdit = () => {
    if (this.props.session.date && !this.props.session.finalized) {
      this.setState({ editModalOpen: true });
    }
  }
  endEditModal = () => {
    this.setState({ editModalOpen: false });
  }
  render() {
    const actions = [
      <FlatButton
        label="Cancel"
        primary={Boolean(true)}
        onTouchTap={this.handleClose}
      />,
      <FlatButton
        label="Delete"
        secondary={Boolean(true)}
        keyboardFocused={Boolean(true)}
        onTouchTap={this.handleDelete}
      />,
    ];
    const {
     session: { date, selected_schema: selectedSchema, players, finalized },
     editable,
     isLoading,
     session,
    } = this.props;

    let countedPlayers = 0;
    return (<div className="session-container">
      {this.state.editModalOpen && <EditDetailModal
        session={session}
        onClose={this.endEditModal}
        startEditSavedSession={this.props.startEditSavedSession}
      />}
      <MenuBar
        handleBack={this.handleBack}
        handleEdit={this.handleEdit}
        saveSession={this.saveSession}
        date={date}
        finalized={finalized}
        editable={editable}
        isLoading={isLoading}
        handleDelete={() => this.setState({ open: true })}
      />
      <div className="session-container-body">
        {
          selectedSchema.map((sizeOfGroup, i) => {
            const joinedPlayers = players.slice(
              countedPlayers,
              countedPlayers + sizeOfGroup
            );
            countedPlayers += +sizeOfGroup;
            return (<RecordTableContainer
              key={i}
              editable={editable}
              groupNum={i + 1}
              finalized={finalized}
              joinedPlayers={joinedPlayers}
              sizeOfGroup={+sizeOfGroup}
              results={this.props.results}
              updateScore={this.props.updateScore}
              updateResult={this.props.updateResult}
              sortedPlayerList={this.props.sortedPlayerList[i]}
              ratingChange={this.props.ratingChange}
              ratingChangeDetail={this.props.ratingChangeDetail}
            />);
          })
        }
      </div>
      <Dialog
        title="Delete Session"
        actions={actions}
        modal={false}
        open={this.state.open}
        onRequestClose={this.handleClose}
      >
        Are you sure you want to delete this session?
      </Dialog>
    </div>);
  }
}
