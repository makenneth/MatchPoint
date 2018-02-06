import Club from "../models/club";
import Hour from "../models/hour";
// import { client } from "../helpers/appModules";
import Mailer from "../helpers/mailer";
import ClubHelper from "../helpers/clubHelper";
import ClubValidation from "../validations/club";

export default {
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


  update:  async (req, res, next) => {
    const data = req.body.data;
    const type = req.query.type;
    // const club = req.club;
    console.log(data);
    try {
      if (type === "password") {
        const ok = await Club.changePassword(req.club, data);
      } else if (type === "info") {
        if (data.info.address !== req.club.address) {
          const { lat, lng } = await GoogleApi.getGeoCode(data.info.address);
          console.log(lat, lng)
          data.lat = lat;
          data.lng = lng;
        }
        const ok = await Club.changeInfo(req.club, data);
      }
    } catch (err) {
      console.log(err);
      if (err.password || err.city || err.state || err.address || err.email) {
        return next({ code: 422, message: err });
      }

      return next({ code: 500, message: err });
    }

    try {
      const club = await Club.detail(req.club.id);
      if (club.email !== req.club.email) {
        new Mailer(club).sendConfirmationEmail();
      }
      delete club.password_digest;
      delete club.session_token;
      delete club.confirm_token;
      return res.status(200).send({ club });
    } catch (e) {
      return next({ code: 500, message: e });
    }
  },

  all: (req, res, next) => {
    const { geolocation } = req.query;
    Club.all(geolocation)
      .then(clubs => res.status(200).send({ clubs }))
      .catch(err => next({ code: 500, message: err }));
  },

  mobileAll: (req, res, next) => {
    const { geolocation } = req.query;
    Club.mobileAll(geolocation)
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

  createHour: (req, res, next) => {
    const clubId = req.club.id;
    const { hours, type } = req.body;
    Hour.createHour(clubId, type, hours)
      .then(async (id) => {
        try {
          const hour = await Hour.getHour(clubId, id);
          res.status(200).send({ hour });
        } catch (e) {
          next({ code: 500, message: err });
        }
      }).catch((err) => {
        next({ code: err.hours ? 400 : 500, message: err });
      });
  },

  updateHour: (req, res, next) => {
    const clubId = req.club.id;
    const hourId = req.params.hourId;
    const { hours } = req.body;
    Hour.updateHour(clubId, hourId, hours)
      .then(() => {
        res.status(204).send();
      }).catch((err) => {
        next({ code: err.hours ? 400 : 500, message: err });
      });
  },

  deleteHour: (req, res, next) => {
    console.log('delete');
    const clubId = req.club.id;
    const hourId = req.params.hourId;
    console.log(clubId, hourId)
    Hour.deleteHour(clubId, hourId)
      .then(() => {
        console.log('success');
        res.status(200).send({ id: hourId });
      }).catch((err) => {
        next({ code: err.hours ? 400 : 500, message: err });
      });
  },

  getHours: (req, res, next) => {
    const clubId = req.club.id;
    Hour.getHours(clubId)
      .then((hours) => {
        res.status(200).send({ hours });
      }).catch((err) => {
        next({ code: 500, message: err });
      });
  },
};
