import fs from "fs";
import readline from "readline";
import Club from "../models/club";
import { Player } from "../models/player";

export default class PlayerParser {
  static csvToPlayers(file, id) {
    const rd = readline.createInterface({
      input: fs.createReadStream(file)
    });
    const players = [];
    let name;
    let rating;

    return new Promise((resolve, reject) => {
      rd.on("line", (line) => {
        if (name === undefined) {
          const row = this.csvToArray(line);
          row.forEach((label, i) => {
            if ((/name/i).test(label)) {
              name = i;
            } else if ((/rating/i).test(label)) {
              rating = i;
            }
          });
          if (name === undefined || rating === undefined) {
            reject("No labels found");
          }
        } else {
          const data = this.csvToArray(line);
          if (data[rating] && data[name]) {
            const newPlayer = new Player({
              name: data[name],
              rating: +data[rating]
            });
            newPlayer.markModified("player");
            players.push(newPlayer);
          }
        }
      });
      rd.on("close", () => {
        Club.addPlayers(id, players)
          .then((group) => {
            resolve(group);
          }).catch((err) => {
            reject(err);
          });
      });
    });
  }

  static csvToArray(text) {
    const reValid = /^\s*(?:'[^'\\]*(?:\\[\S\s][^'\\]*)*'|"[^"\\]*(?:\\[\S\s][^"\\]*)*"|[^,'"\s\\]*(?:\s+[^,'"\s\\]+)*)\s*(?:,\s*(?:'[^'\\]*(?:\\[\S\s][^'\\]*)*'|"[^"\\]*(?:\\[\S\s][^"\\]*)*"|[^,'"\s\\]*(?:\s+[^,'"\s\\]+)*)\s*)*$/;
    const reValue = /(?!\s*$)\s*(?:'([^'\\]*(?:\\[\S\s][^'\\]*)*)'|"([^"\\]*(?:\\[\S\s][^"\\]*)*)"|([^,'"\s\\]*(?:\s+[^,'"\s\\]+)*))\s*(?:,|$)/g;
    if (!reValid.test(text)) return null;
    const a = [];
    text.replace(reValue,
      (m0, m1, m2, m3) => {
        if (m1 !== undefined) a.push(m1.replace(/\\'/g, "'"));
        else if (m2 !== undefined) a.push(m2.replace(/\\"/g, "'"));
        else if (m3 !== undefined) a.push(m3);
        return "";
      });
    if (/,\s*$/.test(text)) a.push("");
    return a;
  }

  static jsonToPlayers(file, id) {
    return new Promise((resolve, reject) => {
      fs.readFile(file, "utf8", (err, data) => {
        if (err) {
          reject(err);
        } else {
          const playersData = JSON.parse(data);
          const players = playersData.map((player) => {
            const newPlayer = new Player({
              name: player.name,
              rating: +player.rating
            });
            newPlayer.markModified("player");
            return newPlayer;
          });
          Club.addPlayers(id, players)
            .then((group) => {
              resolve(group);
            }).catch((e) => {
              reject(e);
            });
        }
      });
    });
  }
}
