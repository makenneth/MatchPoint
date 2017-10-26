export default class ScoreCalculation {
  constructor(players, schema, results) {
    this.players = players;
    this.results = results;
    this.schema = schema;
  }

  sortPlayers() {
    let start = 0;
    return this.schema.reduce((arr, playerInGroup) => {
      const players = this.players.slice(start, start + playerInGroup);
      console.log(players);
      console.log(start);
      start += playerInGroup;
      return [...arr, ...this.sortPlayerWithinGroup(players)];
    }, []);
  }

  sortPlayerWithinGroup(players) {
    const playerRecords = players.map((player) => {
      const versusRecords = this.results[player.id];
      const record = {
        id: player.id,
        rating: player.rating,
        wins: 0,
        losses: 0,
      };
      Object.keys(versusRecords).forEach((otherPlayer) => {
        const [wins, losses] = versusRecords[otherPlayer];
        record.wins += wins;
        record.losses += losses;
      });

      return record;
    });

    return playerRecords.sort((p1, p2) => {
      if (p1.wins > p2.wins) {
        return -1;
      } else if (p1.wins < p2.wins) {
        return 1;
      } else if (p1.losses < p2.losses) {
        return -1;
      }
      const [player1GameWon, player2GameWon] = this.results[p1.id][p2.id];
      return player1GameWon - player2GameWon;
    });
  }

  calculateScoreChange() {
    const scoreChange = {};
    const rc = {};
    const players = {};
    this.players.forEach((player) => {
      players[player.id] = player;
      rc[player.id] = 0;
      scoreChange[player.id] = {};
    });
    for (const curPlayerId of Object.keys(this.results)) {
      const personalResult = this.results[curPlayerId];
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
}
