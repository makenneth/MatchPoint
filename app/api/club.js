import express from "express";
import Club from "../models/club";
import RoundRobin from "../models/roundrobin";
import { jsonParser, csrfProtection, client } from "../helpers/appModules";
import Mailer from "../helpers/mailer";
import ClubHelper from "../helpers/clubHelper";
import ClubValidation from "../validations/club";

const router = express.Router();

router.get("/", (req, res, next) => {
  Club.findBySessionToken(req.cookies.matchpoint_session)
    .then(
      club => {
        delete club.password_digest;
        delete club.confirm_token;
        delete club.token;
        res.status(200).send({ club })
      },
      err => next({ code: 404, message: err }),
    )
    .catch(err => next({ code: 500, message: err }));
})
.get("/all", (req, res, next) => {
  Club.all()
    .then(clubs => res.status(200).send({ clubs }))
    .catch(err => next({ code: 500, message: err }));
})
.get("/:clubId/sessions/:id", (req, res, next) => {
  const clubId = req.params.clubId;
  client.get(`sessions:${clubId}`, (err, reply) => {
    if (!reply) {
      const id = req.params.id;
      RoundRobin.findDetail(clubId, id)
        .then(
          roundrobin => {
            res.status(200).send({ roundrobin });
            try {
              const json = JSON.stringify(roundrobin);
              client.set(`sessions:${clubId}`, json);
            } catch (e) {
              next({ code: 500, message: e });
            }
          },
          err => {
            console.log(err);
            throw err;
          }
        )
        .catch((err) => next({ code: 500, message: err }));
    } else {
      try {
        res.status(200).send({ roundrobin: JSON.parse(reply) });
      } catch (e) {
        next({ code: 500, message: 'Redis session data corrupted.' });
      }
    }
  })
})
.post("/", jsonParser, async (req, res, next) => {
  const user = req.body.user;
  {
    const err = ClubValidation.validate(user);
    if (err) {
      console.log(err);
      return next({ code: 422, message: err });
    }
  }
  let userId;
  try {
    userId = await Club.create(user);
  } catch (err) {
    if (err.username || err.clubName || err.email) {
      return next({ code: 422, message: err });
    } else {
      return next({ code: 500, message: err });
    }
  }
  try {
    const club = await Club.detail(userId);
    new Mailer(club).sendConfirmationEmail();
    ClubHelper.logIn(club, res);
  } catch (e) {
    return next({ code: 500, message: e });
  }
});

export default router;
