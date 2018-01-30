import express from "express";
import { csrfProtection } from "../helpers/appModules";

const router = express.Router();
router.route("/players")
  .get(Controller.getPlayers)
  .post(csrfProtection, Controller.createPlayer);

// router.route("/players/active").get((req, res, next) => {
//   // not tested...
//   const clubId = req.club.id;
//   Player.getMostActivePlayers(clubId)
//     .then((data) => {
//       res.status(200).send({ players: data });
//     }).catch(err => next({ code: 500, message: err }));
// });

router.route("/players/:id")
  .delete(csrfProtection, Controller.deletePlayer)
  .patch(csrfProtection, Controller.updatePlayer);

router.route("/players/promotion")
  .get(Controller.getPromotedPlayers);

export default router;
