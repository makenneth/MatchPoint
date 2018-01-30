import Club from "../models/club";
// import { client } from "../helpers/appModules";
import Mailer from "../helpers/mailer";
import ClubHelper from "../helpers/clubHelper";
import ClubValidation from "../validations/club";

export default () => {
  return {
    get: (req, res, next) => {
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
    },

    create: async (req, res, next) => {
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
    },

    all: (req, res, next) => {
      const { geolocation } = req.body;
      Club.all(geolocation)
        .then(clubs => res.status(200).send({ clubs }))
        .catch(err => next({ code: 500, message: err }));
    },

    mobileDetail: async (req, res, next) => {
      const { id } = req.params.clubId;
      try {
        const detail = await Club.mobileDetail(id);
        res.status(200).send({ detail });
      } catch (e) {
        next({ code: 400, message: e });
      }
    },

    getActiveClubs: () => {
      // this will be in nosql or redis
    },
  };
}
