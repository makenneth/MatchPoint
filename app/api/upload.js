import express from "express";
import multer from "multer";
import path from "path";
import fs from "fs";
import shortid from "shortid";
import PlayerParser from "../../utils/fileParser";
import { parseUrlEncoded, clubMethods, csrfProtection } from "../helpers/appModules";

shortid.characters('0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ-_');
const router = express.Router();
const upload = multer({
  dest: path.join(__dirname, "..", "..", "utils", "uploads")
});

router.post("/players", parseUrlEncoded, csrfProtection, (req, res) => {
  const [filetype, filedata] = req.body.data_uri.split(",");
  const filename = shortid.generate();
  const filepath = path.join(__dirname, "..", "..", "utils", "uploads", filename);
  let clubId;
  let promise;
  if (/csv/.test(filetype) || /json/.test(filetype)) {
    let buffer = new Buffer(filedata, "base64");
    promise = new Promise((resolve, reject) => {
      fs.writeFile(`${filepath}`, buffer, (err) => {
        if (err) {
          reject("Unable to parse file");
          return;
        }
        resolve();
      });
    }).then(() => {
      return clubMethods.currentClub(req);
    }).then((club) => {
      if (/json/.test(filetype)) {
        return PlayerParser.JSONToPlayers(filepath, club._id);
      }
      return PlayerParser.CSVToPlayers(filepath, club._id);
    });
  } else {
    res.status(422).send("Invalid file type");
    return;
  }

  promise.then(data => {
    fs.unlinkSync(filepath);
    res.status(200).send(data);
  }).catch(err => {
    fs.unlinkSync(filepath);
    res.status(422).send(err);
  });
});

export default router;