import React, { Component } from 'react';
import { NewRoundrobin } from 'containers';
import Dialog from 'material-ui/Dialog';
import FlatButton from 'material-ui/FlatButton';
import './styles.scss';

export default class EditDetailModal extends Component {
  componentWillMount() {
    this.props.startEditSavedSession(this.props.session);
  }

  render() {
    const actions = [
      <FlatButton
        label="Cancel"
        primary={Boolean(true)}
        onClick={this.props.onClose}
      />,
    ];
    return (
      <Dialog
        actions={actions}
        modal={Boolean(true)}
        open={Boolean(true)}
        bodyStyle={{ paddingRight: 0, paddingLeft: 0, paddingTop: 0 }}
        bodyClassName="edit-roundrobin-detail-modal"
      >
        <NewRoundrobin
          editingId={this.props.session.short_id}
          editMode
        />
      </Dialog>
    );
  }
}
