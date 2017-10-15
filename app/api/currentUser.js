import express from "express";
import Club from "../models/club";
import RuondRobin from "../models/roundrobin";
import { clubMethods, jsonParser, csrfProtection, client } from "../helpers/appModules";
import Mailer from "../helpers/mailer";

const router = express.Router();
router.post("/accounts/resend", (req, res, next) => {
  new Mailer(req.club).sendConfirmationEmail()
    .then(
      () => {
        res.status(200).send({ status: "An email has been sent to your inbox." });
      },
      (err) => {
        next({ code: 400, message: "Something went wrong. Please try again later." });
      }
    );
})
.get("/sessions", (req, res) => {
  const clubId = req.club._id;
  client.get(`sessions:${clubId}`, (err, reply) => {
    if (!reply) {
      RoundRobinModel.findRoundRobinsByClub(clubId)
        .then((roundrobins) => {
          client.set(`sessions:${clubId}`, JSON.stringify(roundrobins));
          return res.status(200).send(roundrobins);
        });
    } else {
      res.status(200).send(JSON.parse(reply));
    }
  })
})
.get("/sessions/:id", (req, res) => {
  const clubId = req.club._id;
  const id = req.params.id;

  RoundRobinModel.findRoundRobin(clubId, id)
    .then(roundrobin => res.status(200).send(roundrobin))
    .catch(() => res.status(422).send("Cannot retrieve the session data."));
})
.delete("/sessions/:id", (req, res, next) => {
  const id = req.params.id;
  RoundRobinModel.deleteRoundRobin(req.club._id, id)
    .then(() => {
      client.del(`sessions:${req.club._id}`);
      return res.status(200).send(id);
    }).catch((err) => {
      return next({ code: 500, message: err });
    });
})
.post("/sessions/:id", jsonParser, csrfProtection, (req, res) => {
  const id = req.params.id;
  const { date, data, ratingUpdateList } = req.body.result;

  Club.postPlayersRating(req.club._id, date, ratingUpdateList)
    .then(() => RoundRobinModel.saveResult(id, data))
    .then((session) => {
      client.del(`players:${req.club._id}`);
      client.del(`sessions:${req.club._id}`);
      return res.status(200).send(session);
    }).catch((err) => {
      console.log(err);
      res.status(422).send(err);
    });
})
.post("/sessions", jsonParser, csrfProtection, (req, res) => {
  const clubId = req.club.id;
  const data = req.body.session;

  Roundrobin.create(clubId, data.players, data.date, data.selectedSchema)
    .then(async (id) => {
      // client.del(`sessions:${clubId}`);
      const roundrobin = await Roundrobin.find(clubId, id);
      res.status(200).send({ roundrobin });
    }).catch((err) => {
      console.log(err);
      res.status(422).send("Something went wrong...");
    });
}).patch("", jsonParser, (req, res) => {
  const data = req.body.data;
  const type = req.query.type;

  let promise;
  if (type === "password") {
    promise = Club.changePassword(req.club, data);
  } else if (type === "info") {
    promise = Club.changeInfo(req.club, data);
  } else {
    res.status(404).send("No changes were made.");
    return;
  }

  promise.then((club) => {
    delete club.passwordDigest;
    return res.status(200).send(club);
  }).catch((err) => {
    console.log(err);
    res.status(422).send(err);
  });

});

export default router;
