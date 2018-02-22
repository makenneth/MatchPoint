import express from "express";
import { csrfProtection, jsonParser } from "../helpers/appModules";
import Players from '../controllers/player';

const router = express.Router();
router.route("/players")
  .get(Players.getPlayers)
  .post(csrfProtection, jsonParser, Players.createPlayer);

// router.route("/players/active").get((req, res, next) => {
//   // not tested...
//   const clubId = req.club.id;
//   Player.getMostActivePlayers(clubId)
//     .then((data) => {
//       res.status(200).send({ players: data });
//     }).catch(err => next({ code: 500, message: err }));
// });

router.route("/players/:id")
  .delete(csrfProtection, Players.deletePlayer)
  .patch(csrfProtection, jsonParser, Players.updatePlayer);

router.route("/players/promotion")
  .get(Players.getPromotedPlayers);

export default router;
