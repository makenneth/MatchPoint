import React, { Component } from 'react';
import { Tabs, Tab } from 'material-ui/Tabs';
import RaisedButton from 'material-ui/RaisedButton';
import { RecordTableEnter, RecordTableView } from 'components';

export default class RecordTableContainer extends Component {
  state = {
    tab: 0,
    // storing results in state due to poor performance to update in reducer
    results: {},
  };

  componentWillMount() {
    const { joinedPlayers, results } = this.props;
    const newResults = {};
    joinedPlayers.forEach((player, i) => {
      if (results[player.id]) {
        newResults[player.id] = results[player.id];
      } else {
        newResults[player.id] = {};
        [...joinedPlayers.slice(0, i), ...joinedPlayers.slice(i + 1)].forEach((other) => {
          results[player.id][other.id] = [0, 0];
        });
      }
    });
    this.setState({ results: newResults });
  }

  componentWillUnmount() {
    if (this.props.updateResult) {
      this.props.updateResult(this.state.results);
    }
  }

  handleCalculate = () => {
    if (this.props.editable) {
      const [scoreChange, playerRatingChange] = this.calculateScore();
      this.props.updateScore(
        scoreChange,
        playerRatingChange,
        this.state.results,
        this.props.groupNum - 1
      );
    }
  }

  changeTab = (tab) => {
    this.setState({ tab });
  }

  calculateScore() {
    const { results } = this.state;
    const joinedPlayers = this.props.joinedPlayers;
    const scoreChange = {};
    const rc = {};
    const players = {};
    joinedPlayers.forEach((player) => {
      players[player.id] = player;
      rc[player.id] = 0;
      scoreChange[player.id] = {};
    });
    for (const curPlayerId of Object.keys(results)) {
      const personalResult = results[curPlayerId];
      for (const otherId of Object.keys(personalResult)) {
        const record = personalResult[otherId];
        if (record[0] - record[1] === 0) {
          scoreChange[curPlayerId][otherId] = 0;
        } else {
          const sign = record[0] - record[1] > 0 ? 1 : -1;
          const player1 = players[curPlayerId];
          const player2 = players[otherId];

          let scoreAdjust;
          if (sign === 1) {
            scoreAdjust = parseInt(16 -
              ((player1.rating - player2.rating) * 0.04), 10) - (record[1] * 2);
          } else {
            scoreAdjust = -(parseInt(16 +
              ((player1.rating - player2.rating) * 0.04), 10)) + (record[0] * 2);
          }

          if (sign === 1 && scoreAdjust < 0) {
            scoreAdjust = 0 - (record[1] * 2);
          }
          rc[curPlayerId] += scoreAdjust;
          scoreChange[curPlayerId][otherId] = scoreAdjust;
        }
      }
    }
    return [scoreChange, rc];
  }

  updateResult = (self, other, idx, val) => {
    if (this.props.editable) {
      const { results } = this.state;
      const selfResult = results[self];
      const otherResult = results[other];
      const opponentResult = {
        ...otherResult,
        [self]: [
          idx === 1 ? val : otherResult[self][0],
          idx === 0 ? val : otherResult[self][1],
        ],
      };
      const personalResult = {
        ...selfResult,
        [other]: [
          idx === 0 ? val : selfResult[other][0],
          idx === 1 ? val : selfResult[other][1],
        ],
      };
      this.setState({
        results: {
          ...results,
          [self]: personalResult,
          [other]: opponentResult,
        },
      });
    }
  }

  render() {
    const { editable } = this.props;
    return (<div className="tab-container" style={{ width: '100%' }}>
      <Tabs
        value={this.state.tab}
        onChange={this.changeTab}
        tabItemContainerStyle={{ backgroundColor: 'white' }}
        contentContainerStyle={{
          padding: '20px',
          overflow: 'auto',
        }}
      >
        <Tab label={editable ? "Enter Result" : "Results"} value={0} className="tab-menu-tab">
          {editable && <RaisedButton
            backgroundColor="#E64A19"
            labelColor="white"
            label="Calculate Score"
            onTouchTap={this.handleCalculate}
          />}
          <RecordTableEnter
            {...this.props}
            results={this.state.results}
            updateResult={this.updateResult}
          />
        </Tab>
        <Tab label={editable ? "View Result" : "Rating Changes"} value={1} className="tab-menu-tab">
          <RecordTableView
            {...this.props}
            result={this.state.results}
          />
        </Tab>
      </Tabs>
    </div>);
  }
}
