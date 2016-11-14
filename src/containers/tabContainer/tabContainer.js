import React, { Component } from "react";
import { Tabs, Tab } from "material-ui/Tabs";
import { connect } from "react-redux";
import { openNewModal } from "redux/modules/modals";
import { setDate, toggleRegister } from "redux/modules/newSession";
import { Grouping, Participants } from "containers";
import RaisedButton from "material-ui/RaisedButton";
import DatePicker from "material-ui/DatePicker";

@connect(
  ({ newSession }) => ({
    date: newSession.date,
    allPlayers: newSession.allPlayers,
    addedPlayers: newSession.addedPlayers
  }),
  ({ openNewModal, toggleRegister, setDate })
)
export default class TabContainer extends Component {
  constructor(props) {
    super(props);
    this.state = {
      tab: 0
    };
  }

  toggleTab = (tab) => {
    if (tab.target) return;

    this.setState({ tab });
  }

  render() {
    const today = new Date();
    const minDate = new Date(today.setYear(today.getFullYear() - 1));

    const sortedPlayers = Object.keys(this.props.addedPlayers)
      .map((_id => this.props.addedPlayers[_id]))
      .sort((a, b) => b.rating - a.rating);

    const playerContent = (<div>
      <RaisedButton
        onClick={this.props.openNewModal}
        label="New Player"
        secondary={Boolean(true)}
        style={{
          position: "absolute", right: 0
        }}
      />
      <RaisedButton
        onClick={() => this.handleOpen("uploadDialogOpen")}
        label="Upload Players"
        secondary={Boolean(true)}
        style={{
          position: "absolute", right: "150px"
        }}
      />
      <div className="date" style={{ cursor: "pointer" }}>
        <DatePicker
          floatingLabelText="Date of Session"
          hintText="Date" value={this.props.date}
          onChange={(_, date) => this.props.setDate(date)}
          minDate={minDate}
        />
      </div>
      <Participants
        toggleRegister={this.props.toggleRegister}
        sortedPlayers={sortedPlayers}
        addedPlayers={this.props.addedPlayers}
        allPlayers={this.props.allPlayers}
      />
    </div>);

    return (<Tabs
      tabItemContainerStyle={{ backgroundColor: "#673AB7" }}
      contentContainerStyle={{
        padding: "20px",
        border: "1px solid #E0E0E0",
        minHeight: "400px"
      }}
      value={this.state.tab}
      onChange={this.toggleTab}
    >
      <Tab label="Registration" value={0}>
        { playerContent }
      </Tab>
      <Tab label="Grouping" value={1}>
        <Grouping sortedPlayers={sortedPlayers} />
      </Tab>
    </Tabs>);
  }
}
