import Player from "../models/player";
import { client } from "../helpers/appModules";
import PlayerValidation from "../validations/player";

export default {
  getPromotedPlayers: async (req, res, next) => {
    console.log('get promotoed');
    try {
      const promoted = await Player.findPromotedPlayers(req.user.accountId);
      res.status(200).send({ promoted });
    } catch (e) {
      console.log(e);
      next({ code: 500, message, e });
    }
  },

  getPlayers: (req, res, next) => {
    const { accountId } = req.user;

    client.get(`players:${accountId}`, (err, reply) => {
      if (err) throw err;
      if (!reply) {
        Player.findPlayers(accountId)
          .then((players) => {
            res.status(200).send({ players });
            try {
              const json = JSON.stringify(players);
              client.setex(`players:${accountId}`, 24*60*60, json);
            } catch (e) {
              next({ code: 500, messgae: e });
            }
          }).catch(err => next({ code: 500, message: err }));
      } else {
        try {
          const players = JSON.parse(reply);
          res.status(200).send({ players });
        } catch (_e) {
          next({ code: 500, message: 'Failed to parse redis data.' });
        }
      }
    });
  },

  createPlayer: (req, res, next) => {
    console.log('at create Player');
    const clubId = req.user.accountId;
    const data = req.body.player;
    console.log(data);
    const [hasError, err] = PlayerValidation(data);
    console.log('after validate');
    if (hasError) {
      console.log(err);
      return next({ code: 422, message: err });
    }

    Player.createPlayer(clubId, data)
      .then(
        async (playerId) => {
          try {
            const player = await Player.find(clubId, playerId);
            client.del(`players:${clubId}`);
            res.status(200).send({ player });
          } catch (e) {
            console.log(e);
            next({ code: 500, message: e });
          }
        }
      ).catch(err => {
        console.log(err);
        next({ code: 500, message: err })
      });
  },

  updatePlayer: (req, res, next) => {
    const clubId = req.user.accountId;
    const id = req.params.id;
    const player = req.body.player;

    Player.updatePlayer(clubId, id, player)
      .then(
        async () => {
          try {
            const player = await Player.find(clubId, id);
            client.del(`players:${clubId}`);
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
        }
      ).catch(err => next({ code: 500, message: err }));
  },

  deletePlayer: (req, res, next) => {
    const clubId = req.user.accountId;
    const playerId = req.params.id;
    Player.removePlayer(clubId, playerId)
      .then(
        () => {
          client.del(`players:${clubId}`);
          res.status(200).send({ playerId });
        },
        (err) => {
          if (err.player) {
            return next({ code: 422, message: err });
          }
          throw err;
        }
      ).catch(err => next({ code: 500, message: err }));
  }
}
