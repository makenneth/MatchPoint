import express from "express";
import Club from "../models/club";
import Player from "../models/Player";
import { csrfProtection, clubMethods, client } from "../helpers/appModules";
import PlayerValidation from "../validations/player";

const router = express.Router();
router.route("/players").get((req, res, next) => {
  const clubId = req.club.id;

  // client.get(`players:${clubId}`, (err, reply) => {
    // if (!reply) {
      Player.findPlayers(clubId)
        .then((players) => {
          // client.set(`players:${clubId}`, JSON.stringify(data.players));
          res.status(200).send({ players });
        }).catch(err => next({ code: 500, message: err }));
    // } else {
    //   let players;
    //   try {
    //     players = JSON.parse(reply);
    //     res.status(200).send({ players });
    //   } catch (_e) {
    //     next({ code: 500, message: 'Failed to parse redis data.' });
    //   }
    // }
  // })
})
.post(csrfProtection, (req, res, next) => {
  const clubId = req.club.id;
  const data = req.body.player;
  const [hasError, err] = PlayerValidation(data);
  if (hasError) {
    return next({ code: 422, message: err });
  }
  console.log(req.club);
  Player.createPlayer(clubId, data)
    .then(
      async (playerId) => {
        try {
          const player = await Player.find(clubId, playerId);
          res.status(200).send({ player });
        } catch (e) {
          console.log(e);
          next({ code: 500, message: e });
        }
        // client.del(`players:${clubId}`);
      }
    ).catch(err => {
      console.log(err);
      next({ code: 500, message: err })
    });
});

router.route("/players/active").get((req, res, next) => {
  // not tested...
  const clubId = req.club.id;
  Player.getMostActivePlayers(clubId)
    .then((data) => {
      res.status(200).send({ players: data });
    }).catch(err => next({ code: 500, message: err }));
});

router.route("/players/:id")
  .delete(csrfProtection, (req, res, next) => {
    const clubId = req.club.id;
    const playerId = req.params.id;
    Player.removePlayer(clubId, playerId)
      .then(
        () => {
          res.status(200).send({ playerId });
          // client.del(`players:${clubId}`);
        },
        (err) => {
          if (err.player) {
            return next({ code: 422, message: err });
          }
          throw err;
        }
      ).catch(err => next({ code: 500, message: err }));
  })
  .patch(csrfProtection, (req, res, next) => {
    const clubId = req.club.id;
    const id = req.params.id;
    const player = req.body.player;

    Player.updatePlayer(clubId, id, player)
      .then(
        async () => {
          // client.del(`players:${clubId}`);
          try {
            const player = await Player.find(clubId, id);
            res.status(200).send({ player });
          } catch (e) {
            console.log(e);
            next({ code: 500, message: e });
          }
        },
        (err) => {
          if (err.player) {
            return next({ code: 422, message: err });
          }
          throw err;
        }).catch(err => next({ code: 500, message: err }));
  });

export default router;
