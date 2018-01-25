// require("babel-polyfill");
var chai = require("chai");
var db = require('../../utils/connection');
var expect = chai.expect;
var ClubModel = require('../../models/club');

describe('ClubModal Test', () => {
  before(function(done) {
    // return new Promise((resolve) => {
    db.connect().then(() => {
      setTimeout(done, 300);
    }).catch(done);
  });

  describe('#findByUsernameAndPassword', () => {
    it('should succeed', (done) => {

      ClubModel.findByUsernameAndPassword('testuser', 'password').then((club) => {
        expect(club.id).to.equal(1);
        done();
      }).catch(done);
    });
  });

  describe('#resetSessionToken', () => {
    it('should succeed and be able to find user with that token', (done) => {
      ClubModel.resetSessionToken(1).then((token) => {
        expect(token.length).to.be.above(32);
        ClubModel.findBySessionToken(token).then((club) => {
          expect(club.id).to.equal(1);
          done();
        });
      }).catch(done);
    });
  });

  describe('#find', () => {
    it('should be able to find with id', (done) => {
      ClubModel.find(1).then((club) => {
        expect(club.username).to.equal('testuser');
        done();
      }).catch(done);
    });
  });

  describe('#resetSessionTokenWithOldToken', () => {
    it('should return token', (done) => {
      ClubModel.findByUsernameAndPassword('testuser', 'password').then(({ session_token }) => {
        ClubModel.resetSessionTokenWithOldToken(session_token).then((token) => {
          expect(token.length).to.be.above(32);
          ClubModel.findByUsernameAndPassword('testuser', 'password').then((club) => {
            expect(club.session_token).to.equal(token);
            done();
          }).catch(done);
        }).catch(done);
      }).catch(done);
    });

    it('with non existent token should return errro', (done) => {
      ClubModel.resetSessionTokenWithOldToken('abcdef')
        .then(done)
        .catch((res) => {
          expect(res.token).to.equal('Token doesn\'t exist.');
          done();
        });
    });
  });
});
