import React, { Component } from "react";
import moment from "moment";
import { Table, TableBody, TableRow,
  TableHeader, TableHeaderColumn, TableRowColumn } from "material-ui/Table";
import Graph from "./graph";
import PlayerStore from "../../stores/playerStore";

export default class PlayerResult extends Component {
  constructor(props) {
    super(props);
    this.state = {
      player: null
    };
  }

  componentWillReceiveProps(nextProps) {
    if (nextProps.player) {
      this.setState({ player: PlayerStore.find(nextProps.player) });
    }
  }

  parseData() {
    return this.state.player.ratingHistory.map(history => history.newRating);
  }

  render() {
    const player = this.state.player;
    if (!player) return <div className="player-query">No players are selected.</div>;
    const history = player.ratingHistory;
    return (<div className="player-query">
      <Table selectable={false} multiSelectable={false}>
        <TableHeader displaySelectAll={false} adjustForCheckbox={false}>
          <TableRow>
            <TableHeaderColumn>Date</TableHeaderColumn>
            <TableHeaderColumn>Rating Before</TableHeaderColumn>
            <TableHeaderColumn>Rating Change</TableHeaderColumn>
            <TableHeaderColumn>Rating After</TableHeaderColumn>
          </TableRow>
        </TableHeader>
        <TableBody displayRowCheckbox={false}>
          {
            history.map(date => (
              (<TableRow key={date._id}>
                <TableRowColumn>{ moment(date.date).format("MMMM DD, YYYY")}</TableRowColumn>
                <TableRowColumn>{ date.oldRating }</TableRowColumn>
                <TableRowColumn>{ date.ratingChange }</TableRowColumn>
                <TableRowColumn>{ date.newRating }</TableRowColumn>
              </TableRow>)
            ))
          }
        </TableBody>
      </Table>
      <div className="big-container">
        <Graph data={this.parseData()} />
      </div>
    </div>);
  }
}
