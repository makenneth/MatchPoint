// require("babel-polyfill");
import mysql from "mysql";
// import History from "../sqlmodel/history";
// import Roundrobin from "../sqlmodel/roundrobin";
// import { players, club } from "./seeds";
// import bcrypt from "bcrypt";
import db from '../utils/connection';

db.connect().then(
  () => {
    // const Player = require("../models/player");
    const Club = require("../models/club");
    console.log("\x1B[32mConnected   ✓\x1B[0m");
    console.log("\x1B[96mCreating Mock data   \x1B[0m");
    const user = {
      username: 'testuser',
      password: 'password',
      email: 'testuser@test.com',
      clubName: 'test club',
      city: 'San Francisco',
      state: 'CA',
    };
    Club.create(user).then((res) => {
      console.log(res);
      process.exit(0);
    }).catch((err) => {
      console.log("\x1B[91mFailed to create mock data   ✗\x1B[0m");
      console.log(err);
      process.exit(1);
    });
  },
  (err) => {
    console.log("\x1B[91mFailed to connect to the database   ✗\x1B[0m");
    console.error(err);
    process.exit(1);
  }
)
