import ScoreCalculation from './app/helpers/scoreCalculation';

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
                if (other.rating - self.rating >= 400) {
                  before[self.id][other.id] = [Math.round(change / 2), 3];
                } else {
                  const loseAdjustment = -(parseInt(16 +
                    ((self.rating - other.rating) * 0.04), 10));
                  const adjustment = change - loseAdjustment;
                  before[self.id][other.id] = [Math.round(adjustment / 2), 3];
                }
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
                if (self.rating - other.rating >= 400) {
                  before[self.id][other.id] = [3, -Math.round(change / 2)];
                } else {
                  const winAdjustment = (parseInt(16 -
                    ((self.rating - other.rating) * 0.04), 10));
                  const adjustment = change - winAdjustment;
                  before[self.id][other.id] = [3, Math.round(adjustment / 2)];
                }
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

const record = [
   {
   "_id":"582bd643a65d3b45d7fe73f1",
   "_clubId":"57f99997be4f846fc288e6a5",
   "numOfPlayers":16,
   "schemata":[
      [
         7,
         6,
         3
      ],
      [
         7,
         5,
         4
      ],
      [
         7,
         3,
         3,
         3
      ],
      [
         6,
         6,
         4
      ],
      [
         6,
         5,
         5
      ],
      [
         6,
         4,
         3,
         3
      ],
      [
         5,
         5,
         3,
         3
      ],
      [
         5,
         4,
         4,
         3
      ],
      [
         4,
         4,
         4,
         4
      ],
      [
         4,
         3,
         3,
         3,
         3
      ]
   ],
   "selectedSchema":[
      4,
      4,
      4,
      4
   ],
   "id":"ryjBL8YWl",
   "scoreChange":[
      [
         [0, -18, 0, 6 ],
         [18, 0, 12, -15 ],
         [0, -12, 0, -15 ],
         [-6, 15, 15, 0 ]
      ],
      [
         [0, 14, 3, 0 ],
         [-14, 0, 4, 5 ],
         [-3, -4, 0, -13 ],
         [0, -5, 13, 0 ]
      ],
      [
         [0, -17, 0, 6 ],
         [17, 0, 8, 6 ],
         [0, -8, 0, -16 ],
         [-6, -6, 16, 0 ]
      ],
      [
         [0, 11, 0, 0 ],
         [-11, 0, 0, 0 ],
         [0, 0, 0, 11 ],
         [0, 0, -11, 0 ]
      ]
   ],
   "finalized":true,
   "players":[
      {
         "_id":"57f99e2748326770eed65163",
         "rating":1862,
         "name":"Joseph Tam"
      },
      {
         "_id":"5827d98a7bf17b0b5baa419c",
         "rating":1700,
         "name":"Matthew Wu"
      },
      {
         "_id":"57f99e2748326770eed651af",
         "rating":1700,
         "name":"Guo Jun Lin"
      },
      {
         "_id":"57f99e2748326770eed65169",
         "rating":1667,
         "name":"Ken Yu"
      },
      {
         "_id":"57f99e2748326770eed6512d",
         "rating":1575,
         "name":"Brian Togtok"
      },
      {
         "_id":"57f99e2748326770eed6518c",
         "rating":1537,
         "name":"Scott Hu"
      },
      {
         "_id":"57f99e2748326770eed65130",
         "rating":1352,
         "name":"Carol Liu"
      },
      {
         "_id":"57f99e2748326770eed65162",
         "rating":1325,
         "name":"Joseph Louie"
      },
      {
         "_id":"581e8f67d75e7132e2d7a04d",
         "rating":1226,
         "name":"Patrick Keville"
      },
      {
         "_id":"57f99e2748326770eed6519f",
         "rating":1177,
         "name":"William Luk"
      },
      {
         "_id":"580c1c47c97d8759b54d953d",
         "rating":994,
         "name":"Jason Wan "
      },
      {
         "_id":"581555d8d75e7132e2d7a03f",
         "rating":990,
         "name":"Greg Bennett"
      },
      {
         "rating":"919",
         "name":"Vincent Tam",
         "_id":"581e8e97d75e7132e2d7a04a"
      },
      {
         "rating":"908",
         "name":"Jonathan Li",
         "_id":"57f99e2748326770eed65161"
      },
      {
         "_id":"581e8ea2d75e7132e2d7a04b",
         "rating":525,
         "name":"Richard Tam"
      },
      {
         "_id":"582bd61fa65d3b45d7fe73f0",
         "rating":400,
         "name":"Stan Li"
      }
   ],
   "date":"2016-11-13T00:00:00.000Z",
   "__v":0
}
][0];

const players = record.players.map((p, i) => {
  return Object.assign({}, p, { id: i + 1, rating: +p.rating });
});
const before = reverseResult(record.selectedSchema, record.scoreChange, players);
console.log(before)
const scoreCalculaion = new ScoreCalculation(players, record.selectedSchema, before);
const [change, ratingChange] = scoreCalculaion.calculateScoreChange();

console.log(ratingChange);
console.log(change)
