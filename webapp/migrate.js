import fs from 'fs';
import path from 'path';
import Player from './models/player';
import Club from './models/club';
import RoundRobin from './models/roundrobin';
import ScoreCalculation form './helpers/scoreCalculation';

function reverseResult(schema, results, players) {
  const before = {};
  players.forEach((player) => {
    before[player.id] = {};
  });
  let start = 0;
  for (let k = 0; k < schema.length; k++) {
    const groupPlayers = players.slice(start, start + schema[k]);
    start += schema[k];
    results[k].forEach((row, i) => {
      const self = groupPlayers[i];
      row.forEach((change, j) => {
        const other = groupPlayers[j];
        if (self.id !== other.id) {
          if (change === 0) {
            if (self.rating - other.rating >= 400) {
              before[self.id][other.id] = [3, 0];
            } else if (other.rating - self.rating >= 400) {
              before[self.id][other.id] = [0, 3];
            } else {
              before[self.id][other.id] = [0, 0];
            }
          } else  {
            // but take into account where player win but lose points
            // maybe check if point is less than 6 and self.rating > other.rating
            // because there is no way for it
            if (change > 0) {
              if (self.rating < other.rating && change <= 4) {
                before[self.id][other.id] = [Math.round(change / 2), 3];
              } else {
              // subtract with the actual change would be the game lost
                const winAdjustment = parseInt(16 -
                  ((self.rating - other.rating) * 0.04), 10);
                const adjustment = winAdjustment - change;
                console.log(change, winAdjustment);
                console.log('game lost', (winAdjustment - change) / 2);
                before[self.id][other.id] = [3, Math.round(adjustment / 2)];
              }
            } else if (change < 0) {
              if (self.rating > other.rating && change >= -4) {
                before[self.id][other.id] = [3, -Math.round(change / 2)];
              } else {
                const loseAdjustment = -(parseInt(16 +
                  ((self.rating - other.rating) * 0.04), 10));
                console.log(change, loseAdjustment);
                console.log('game won', (change - loseAdjustment) / 2);
                const adjustment = change - loseAdjustment;
                before[self.id][other.id] = [Math.round(adjustment / 2), 3];
              }
            }
          }
        }
      });
    });
  }
  return before;
}

export async function start() {
  const playerIdMaps = {};
  const lastRating = {};
  const clubId = 1;
  const recordsData = await new Promise((resolve, reject) => {
    fs.readFile(path.join(__dirname, 'roundrobin.txt'), (err, data) => {
      if (err) throw(err);
      console.log('read success');
      resolve(JSON.parse(data));
    });
  });
  const records = recordsData.map(r => (
    Object.assign({}, r, { date: new Date(r.date) })
  ));
  for (const record of records) {
    const players = [];
    console.log('now onto record', record.date);
    for (const player of record.players) {
      if (!playerIdMaps[player._id]) {
        try {
          const id = await Player.createPlayer(clubId, { name: player.name, rating: player.rating })
          console.log('created player', id, player.name);
          playerIdMaps[player._id] = id;
        } catch (e) {
          console.log('create error', e.stack);
          process.exit(1);
        }
      } else if (lastRating[playerIdMaps[player._id]] &&
        lastRating[playerIdMaps[player._id]] !== player.rating) {
        console.log(player.name, player.rating, lastRating[playerIdMaps[player._id]]);
        try {
          const update = await Player.updatePlayer(clubId, playerIdMaps[player._id], { name: player.name, rating: player.rating });
          console.log('updatedPlayer', player.name);
        } catch (e) {
          console.log('error in update', e, e.stack);
          process.exit(1);
        }
      }
      players.push({
        id: playerIdMaps[player._id],
        name: player.name,
        rating: +player.rating,
      });
    }
    console.log(players);
    let roundrobinId;
    try {
      roundrobinId = await RoundRobin.create(clubId, players, record.date, record.selectedSchema);
      console.log('created session', roundrobinId)
    } catch (e) {
      console.log(e.stack);
      process.exit(1);
    }
    console.log(record.selectedSchema);
    const results = reverseResult(record.selectedSchema, record.scoreChange, players);
    const roundrobin = {
      id: roundrobinId,
      players,
      selected_schema: record.selectedSchema,
    };
    try {
      console.log('posting result');
      const post = await RoundRobin.postResult(clubId, roundrobin, results);
      console.log('posted results');
    } catch (e) {
      console.log(e.stack);
      process.exit(1);
    }

    const scoreCalculaion = new ScoreCalculation(players, record.selectedSchema, results);
    const [, ratingChange] = scoreCalculaion.calculateScoreChange();
    const sortedPlayers = scoreCalculaion.sortPlayers();
    sortedPlayers.forEach((player) => {
      console.log(player.id, player.rating, ratingChange);
      lastRating[player.id] = player.rating + ratingChange[player.id];
    });
    console.log('lastRating', lastRating);
  }
  console.log(lastRating);
  process.exit(0);
}
