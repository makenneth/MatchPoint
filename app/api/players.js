import express from "express";
import Club from "../models/club";
import { csrfProtection, clubMethods, client } from "../helpers/appModules";
import ClubModel from "../models/club";
import { validatePlayer } from "../models/player";

const router = express.Router();
router.route("/players").get((req, res, next) => {
  const clubId = req.club._id;

  client.get(`players:${clubId}`, (err, reply) => {
    if (!reply) {
      ClubModel.findPlayers(clubId)
        .then((data) => {
          client.set(`players:${clubId}`, JSON.stringify(data.players));
          res.status(200).send({ players: data.players });
        }).catch((err) => {
          next({ code: 404, message: "Unable to fetch players, please try again later." });
        });
    } else {
      let players;
      try {
        players = JSON.parse(reply);
        res.status(200).send({ players });
      } catch (_e) {
        next({ code: 500 });
      }
    }
  })
});

router.route("/players/active").get((req, res, next) => {
  const clubId = req.club._id;
  ClubModel.getMostActivePlayers(clubId)
    .then((data) => {
      res.status(200).send({ players: data });
    }).catch((_) => {
      next({ code: 500 });
    })
});

router.route("/players/new")
  .post(csrfProtection, (req, res) => {
    const clubId = req.club._id;
    const data = req.body.player;

    const [hasError, err] = validatePlayer(data);
    if (hasError) {
      return res.status(422).send(err);
    }

    ClubModel.addPlayer(clubId, data)
      .then((player) => {
        client.del(`players:${clubId}`);
        res.status(200).send(player);
      }).catch((err) => {
        res.status(422).send(err);
      });
  });

router.route("/players/:id")
  .delete(csrfProtection, (req, res) => {
    const clubId = req.club._id;
    const id = req.params.id;
    Club.removePlayer(clubId, id)
      .then((club) => {
        client.del(`players:${clubId}`);
        res.status(200).send(id);
      }).catch((err) => {
        console.log(err)
        res.status(422).send("Unable to remove player");
      });
  })
  .patch(csrfProtection, (req, res) => {
    const clubId = req.club._id;
    const id = req.params.id;
    const player = req.body.player;

    Club.updatePlayer(clubId, id, player)
      .then(() => {
        client.del(`players:${clubId}`);
        res.status(200).send(player);
      }).catch((err) => {
        console.log(err);
        res.status(422).send("Unable to update player");
      });
  });

export default router;
