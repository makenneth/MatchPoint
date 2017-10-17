import express from "express";
import Club from "../models/club";
import RoundRobin from "../models/roundrobin";
import { clubMethods, jsonParser, csrfProtection, client } from "../helpers/appModules";
import ScoreCalculation from '../helpers/scoreCalculation';
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
.get("/sessions", (req, res, err) => {
  const clubId = req.club.id;
  // client.get(`sessions:${clubId}`, (err, reply) => {
    // if (!reply) {
      RoundRobin.findAllByClub(clubId)
        .then(
          (roundrobins) => {
          // client.set(`sessions:${clubId}`, JSON.stringify(roundrobins));
            res.status(200).send({ roundrobins });
          },
          (err) => {
            next({ code: 400, message: err });
          }
        ).catch(err => next({ code: 500, message: err }))
    // } else {
      // res.status(200).send(JSON.parse(reply));
    // }
  // })
})
.get("/sessions/:id", (req, res, next) => {
  const clubId = req.club.id;
  const id = req.params.id;
  RoundRobin.findDetail(clubId, id)
    .then(
      roundrobin => res.status(200).send({ roundrobin }),
      err => {
        console.log(err);
        throw err;
      }
    )
    .catch((err) => next({ code: 500, message: err }));
})
.delete("/sessions/:id", (req, res, next) => {
  const id = req.params.id;
  RoundRobin.deleteRoundRobin(req.club.id, id)
    .then(() => {
      client.del(`sessions:${req.club.id}`);
      return res.status(200).send(id);
    }).catch((err) => {
      return next({ code: 500, message: err });
    });
})
.post("/sessions/:id", jsonParser, csrfProtection, async (req, res, next) => {
  const id = req.params.id;
  const { date, results } = req.body;
  let roundrobin;
  try {
    roundrobin = await RoundRobin.findDetail(req.club.id, id);
  } catch (e) {
    console.log(e);
    next({ code: 500, message: e });
  }

    const calculation = new ScoreCalculation(roundrobin.players, roundrobin.schema, results);
    const sortedPlayers = calculation.sortPlayers();
    const [scoreChange, ratingChange] = calculation.calculateScoreChange();
    console.log(sortedPlayers);
    console.log(scoreChange);
    console.log(ratingChange);
    res.status(200);
  // RoundRobin.postResult(req.club.id, id, roundrobin, results)
  //   .then(() => {
  //     // client.del(`players:${req.club.id}`);
  //     // client.del(`sessions:${req.club.id}`);
  //     return res.status(200).send(session);
  //   }).catch((err) => {
  //     console.log(err);
  //     next({ code: 500, message: err });
  //     // res.status(422).send(err);
  //   });
})
.post("/sessions", jsonParser, csrfProtection, (req, res, next) => {
  const clubId = req.club.id;
  const data = req.body.session;
  console.log(clubId, data);
  RoundRobin.create(clubId, data.players, data.date, data.selectedSchema)
    .then(
      async (id) => {
        console.log(id);
        // client.del(`sessions:${clubId}`);
        const roundrobin = await RoundRobin.findByClub(clubId, id);
        console.log(roundrobin);
        res.status(200).send({ roundrobin });
      },
      err => {
        console.log(err);
        throw err;
      }
    ).catch((err) => {
      next({ code: 500, message: err });
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
