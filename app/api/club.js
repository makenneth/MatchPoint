import express from "express";
import ClubModel from "../models/club";
// import RoundRobinModel from "../models/roundrobin";
import { jsonParser, csrfProtection, client } from "../helpers/appModules";
import Mailer from "../helpers/mailer";
import ClubHelper from "../helpers/clubHelper";
import ClubValidation from "../validations/club";

const router = express.Router();

router.get("/", (req, res, next) => {
  ClubModel.findBySessionToken(req.cookies.matchpoint_session)
    .then(
      club => res.status(200).send({ club }),
      err => next({ code: 404, message: err }),
    )
    .catch(err => next({ code: 500, message: err }));
})
.get("/all", (req, res, next) => {
  ClubModel.all()
    .then(clubs => res.status(200).send({ clubs }))
    .catch(err => next({ code: 500, message: err }));
})
.get("/:clubId/sessions", (req, res, next) => {
  const clubId = req.params.clubId;
  client.get(`sessions:${clubId}`, (err, reply) => {
    if (!reply) {
      RoundRobinModel.findRoundRobinsByClub(clubId)
        .then((roundrobins) => {
          client.set(`sessions:${clubId}`, JSON.stringify(roundrobins));
          res.status(200).send(roundrobins);
        }).catch(err => next({ code: 500, message: err }));
    } else {
      try {
        res.status(200).send(JSON.parse(reply));
      } catch (e) {
        next({ code: 500, message: 'Redis session data corrupted.' });
      }
    }
  })
})
// .get("/:clubId/roundrobins", (req, res, next) => {
//   const clubId = req.params.clubId;
//   RoundRobinModel.findRoundRobinsByClub(clubId)
//     .then((roundrobins) => {
//       res.status(200).send({ clubId, roundrobins });
//       res.end();
//     }).catch(err => next({ code: 500, message: err }));
// })
.post("/", jsonParser, (req, res, next) => {
  const user = req.body.user;
  const err = ClubValidation.validate(user);
  if (err) {
    return next({ code: 422, message: err });
  }
  ClubModel.create(user)
    .then(
      (userId) => {
        // new Mailer(userId).sendConfirmationEmail();
        ClubModel.detail(userId)
          .then(club => ClubHelper.logIn(club, res))
          .catch((err) => next({ code: 500, message: err }));
      },
      (err) => {
        if (err.username) {
          next({ code: 422, message: err });
        } else {
          next({ code: 500, message: err });
        }
      }
    ).catch(err => next({ code: 500, message: err }))
});

export default router;
