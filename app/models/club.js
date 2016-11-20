import mongoose from "mongoose";
import URLSafeBase64 from "urlsafe-base64";
import crypto from "crypto";
import bcrypt from "bcrypt-as-promised";
import shortid from "shortid";
import { playerSchema, Player } from "./player";
import { History } from "./history";
import ClubValidation from "../validations/clubValidation";

mongoose.Promise = require("bluebird");

const Schema = mongoose.Schema;
const clubSchema = new Schema({
  username: {
    type: String,
    index: { unique: [true, "Username has been taken."] }
  },
  passwordDigest: { type: String, required: true },
  sessionToken: { type: String, default: URLSafeBase64.encode(crypto.randomBytes(32)) },
  clubName: { type: String, required: true },
  email: { type: String, required: true },
  location: {
    city: { type: String, required: true },
    state: { type: String, required: true }
  },
  token: { type: String },
  confirmed: { type: Boolean, default: false },
  confirmToken: { type: String, default: URLSafeBase64.encode(crypto.randomBytes(32)) },
  id: { type: String, default: shortid.generate, index: true },
  players: [playerSchema]
});

clubSchema.statics.changeInfo = function(clubId, info) {
  const { email, city, state } = info;

  const error = new ClubValidation().validateInfo(info);
  if (error) {
    return Promise.reject(error);
  }

  this.generatePasswordDigest(oldPassword)
    .then((digest) => {
      return this.findOneAndUpdate(
        { passwordDigest: digest, _id: clubId },
        { email, location: { city, state } }
      );
    }).catch((err) => {
      console.log(err);
      return Promise.reject("Old password does not match.");
    });
};

clubSchema.statics.changePassword = function(clubId, info) {
  const { oldPassword, newPassword } = info;
  if (newPassword.length < 8) {
    return Promise.reject("Password must have at least 8 characters.");
  }

  if (oldPassword === newPassword) {
    return Promise.resolve();
  }
  return this.generatePasswordDigest(oldPassword)
    .then((digest) => {
      return this.findOneAndUpdate(
        { passwordDigest: digest, _id: clubId },
        { password: newPassword }
      );
    }).catch((err) => {
      console.log(err);
      return Promise.reject("Old password does not match.")
    });
};

clubSchema.statics.newUser = function(user) {
  const err = new ClubValidation().validate(user);
  if (err) {
    return Promise.reject(err);
  }

  return this.generatePasswordDigest(user.password)
    .then((digest) => {
      return this.create({
        username: user.username,
        location: {
          city: user.city,
          state: user.stateName
        },
        email: user.email,
        clubName: user.clubName,
        passwordDigest: digest
      });
    });
}

clubSchema.statics.resetSessionToken = function(club) {
  const token = URLSafeBase64.encode(crypto.randomBytes(32));
  return this.update(
    { username: club.username },
    { sessionToken: token }
  );
};

clubSchema.statics.resetSessionTokenWithOldToken = function(token) {
  const newToken = URLSafeBase64.encode(crypto.randomBytes(32));
  return this.update(
    { sessionToken: token },
    { $set: { sessionToken: newToken } }
  );
};

clubSchema.statics.confirmUser = function(token) {
  return this.findOneAndUpdate(
    { confirmToken: token },
    { confirmed: true, confirmationToken: undefined },
    { new: true }
  ).catch((err) => {
    return Promise.reject("The token may have expired.");
  });
};

clubSchema.statics.findPlayers = function(clubId) {
  return this.findOne({ _id: clubId }, { players: true, _id: false });
};

clubSchema.statics.addPlayer = function(clubId, player) {
  const newPlayer = new Player({ name: player.name, rating: player.rating });
  newPlayer.markModified("player");
  return this.update(
    { _id: clubId },
    { $push: { players: newPlayer } },
  ).then(() => Promise.resolve(newPlayer));
};

clubSchema.statics.addPlayers = function(clubId, players) {
  return this.findOneAndUpdate(
    { _id: clubId },
    { $push: { players: { $each: players } } },
    { new: true, select: "players" }
  );
};

clubSchema.statics.postPlayersRating = function(clubId, updateList, date) {
  return this.findOne({ _id: clubId }).then((club) => {
    const players = club.players;
    for (let i = 0; i < players.length; i++) {
      const curPlayer = players[i];
      if (updateList[curPlayer._id]) {
        const updatedRating = +updateList[curPlayer._id].change + curPlayer.rating;
        const newHistory = new History({
          date: date,
          oldRating: curPlayer.rating,
          newRating: updatedRating,
          ratingChange: +updateList[curPlayer._id].change
        });
        newHistory.markModified("history");
        curPlayer.ratingHistory.push(newHistory);
        curPlayer.rating = updatedRating;
        curPlayer.markModified("player");
      }
    }
    return club.save();
  });
};
clubSchema.statics.removePlayer = function(clubId, id) {
  return this.findOneAndUpdate(
    { _id: clubId },
    { $pull: { players: { _id: id } } },
    { new: true }
  );
};

clubSchema.statics.updatePlayer = function(clubId, id, player) {
  return this.update(
    { _id: clubId, "players._id": id },
    { $set: { "players.$.rating": player.rating, "players.$.name": player.name } },
    { new: true, select: "players" }
  );
};

clubSchema.methods.isPassword = function(password) {
  return bcrypt.compare(password, this.passwordDigest);
};

clubSchema.statics.findByUsernameAndPassword = function(username, password) {
  let club;
  return this.findOne({ username: username })
    .then((cl) => {
      club = cl;
      return cl.isPassword(password);
    }).then((bool) => {
      console.log(bool);
      return Promise.resolve(club);
    });
};

clubSchema.statics.findBySessionToken = function(sessionToken) {
  return this.findOne(
    { sessionToken: sessionToken },
    { passwordDigest: false, sessionToken: false, players: false, confirmToken: false }
  );
};

clubSchema.statics.generatePasswordDigest = function(password) {
  return bcrypt.hash(password, 10);
};

clubSchema.statics.findClub = function(id) {
  return this.find({ _id: id }, { passwordDigest: false, sessionToken: false, confirmToken: false });
};
clubSchema.statics.findAll = function() {
  return this.find({},
    { passwordDigest: false, sessionToken: false, confirmToken: false, username: false, players: false }
  );
};

clubSchema.statics.resetPasswordWithToken = function(token, newPassword) {
  return this.generatePasswordDigest(newPassword)
    .then((digest) => {
      return this.findOneAndUpdate(
        { token: token },
        { $set: { passwordDigest: digest, token: undefined } }
      );
    });
};

const Club = mongoose.model("Club", clubSchema);

export default Club;
