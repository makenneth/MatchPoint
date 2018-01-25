// require("babel-polyfill");
var chai = require("chai");
var db = require('../../utils/connection');
var expect = chai.expect;
var PlayerModel = require('../../models/player');
var ClubModel = require('../../models/club');

describe('PlayerModel Test', () => {
  before(function(done) {
    // return new Promise((resolve) => {
    db.connect().then(() => {
      setTimeout(done, 300);
    }, done);
  });

  describe('#createPlayer', () => {
    it('should return the new id after insert success', (done) => {
      const player = {
        name: 'Test Player 1',
        rating: 1000,
      };

      PlayerModel.createPlayer(1, player).then((res) => {
        expect(res).to.equal(1);
        done();
      }).catch(done);
    });

    // it('should add return error if the name is missing', (done) => {
    //   const player = {
    //     rating: 1000,
    //   };
    //   PlayerModel.createPlayer(1, player)
    //     .then(done, (res) => {
    //       console.log(res.sqlMessage);
    //       expect(res.sqlMessage).to.exist;
    //       done();
    //     });
    // });
  });

  describe('#findPlayers', () => {
    it ('should return the added players', (done) => {
      PlayerModel.findPlayers(1).then((players) => {
        expect(players.length).to.equal(1)
        expect(players[0].id).to.equal(1)
        expect(players[0].rating).to.equal(1000)
        done();
      }).catch(done);
    });
  });

  describe('#createPlayers', () => {
    it('should add all the players passed in', (done) => {
      const players = [...Array(5)].map((_, i) => ({
        name: `Test Player ${i}`,
        rating: 1000,
      }));

      PlayerModel.createPlayers(1, players).then((players) => {
        expect(players.length).to.equal(5);
        done();
      }).catch(done);
    });
  });

  describe('#findPlayers', () => {
    it ('should return the added players', (done) => {
      PlayerModel.findPlayers(1).then((players) => {
        expect(players.length).to.equal(6)
        done();
      }).catch(done);
    });
  });

  describe('#updatePlayer', () => {
    it('should resolve promise upon success', (done) => {
      const player = {
        id: 1,
        rating: 1500,
        name: 'Test Player 20',
      };
      PlayerModel.updatePlayer(player).then((res) => {
        expect(res.affectedRows).to.equal(1);
        PlayerModel.findPlayers(1).then((players) => {
          expect(players[0].rating).to.equal(1500);
          done();
        });
      }).catch(done);
    });
  });

  describe('#removePlayer', () => {
    it('should resolve promise upon success', (done) => {
      PlayerModel.removePlayer(1).then((res) => {
        expect(res.affectedRows).to.equal(1);
        PlayerModel.findPlayers(1).then((players) => {
          expect(players.find(p => p.id === 1)).to.be.undefined;
          console.log(players);
          done();
        });
      }).catch(done);
    });
  });
});
