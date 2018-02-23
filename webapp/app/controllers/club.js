import Club from "../models/club";
import Hour from "../models/hour";
import { client } from "../helpers/appModules";
import Mailer from "../helpers/mailer";
import ClubHelper from "../helpers/clubHelper";
import ClubValidation from "../validations/club";
import * as GoogleApi from '../helpers/googleApi';

function parseLocation(info) {
  let city = '';
  let state = '';
  let country = '';
  if (info.address.terms.length === 4) {
    [, city, state, country] = info.address.terms.map(t => t.value);
  } else if (info.address.terms.length === 5) {
    [, , city, state, country] = info.address.terms.map(t => t.value);
  }

  return [city, state, country];
}

export default {
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
    const clubId = req.user.accountId;
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
    const clubId = req.user.accountId;
    const hourId = req.params.hourId;
    const { hours } = req.body;
    Hour.updateHour(clubId, hourId, hours)
      .then(() => {
        res.status(200).send({ success: true });
      }).catch((err) => {
        next({ code: err.hours ? 400 : 500, message: err });
      });
  },

  deleteHour: (req, res, next) => {
    const clubId = req.user.accountId;
    const hourId = req.params.hourId;
    Hour.deleteHour(clubId, hourId)
      .then(() => {
        res.status(200).send({ id: hourId });
      }).catch((err) => {
        next({ code: err.hours ? 400 : 500, message: err });
      });
  },

  getHours: (req, res, next) => {
    const clubId = req.user.accountId;
    Hour.getHours(clubId)
      .then((hours) => {
        res.status(200).send({ hours });
      }).catch((err) => {
        next({ code: 500, message: err });
      });
  },

  setInitInfo: async (req, res, next) => {
    const userId = req.user.id;
    const { info } = req.body;
    let geolat;
    let geolng;
    try {
      const result = await GoogleApi.getGeoCode(info.address.description);
      geolat = result.lat;
      geolng = result.lng;
      if (!geolat || !geolng) {
        return next({ code: 422, message: { address: 'Cannot get geocode of address.' } });
      }
    } catch (e) {
      console.log(e);
      return res.status(500).send({ message: e });
    }
    const [city, state, country] = parseLocation(info);
    Club.updateInformation(userId, {
      ...info, geolat, geolng,
      city, state, country,
      address: info.address.description,
    }).then(
      async () => {
        const user = await Club.detail(req.user.accountId);
        res.status(200).send({ user });
      },
      (err) => {
        console.log(err);
        next({ code: err.clubName ? 422 : 500, message: err });
      }
    );
  },

  updateInfo: async (req, res, next) => {
    const userId = req.user.id;
    const { info } = req.body.data;
    const data = { ...info };
    if (!Object.keys(data).length) {
      const user = await Club.detail(req.user.accountId);
      return res.status(200).send({ user });
    }
    if (info.address) {
      try {
        const result = await GoogleApi.getGeoCode(info.address.description);
        data.geolat = result.lat;
        data.geolng = result.lng;
        if (!data.geolat || !data.geolng) {
          return next({ code: 400, message: { address: 'Cannot get geocode of address.' } });
        }
      } catch (e) {
        console.log(e);
        return res.status(500).send({ message: e });
      }
      const [city, state, country] = parseLocation(info);
      data.city = city;
      data.state = state;
      data.country = country;
      data.address = info.address.description;
    }

    Club.updateInformation(userId, data).then(
      async () => {
        const user = await Club.detail(req.user.accountId);
        res.status(200).send({ user });
      },
      (err) => {
        next({ code: err.clubName ? 422 : 500, message: err });
      }
    );
  },

  detail: async (req, res, next) => {
    let id = req.user ? req.user.accountId : req.params.id;
    try {
      const club = await Club.detail(id);
      res.status(200).send({ club });
    } catch (e) {
      next({ code: 500, message: e });
    }
  },

  search: async (req, res, next) => {
    const search = req.query.search;
    console.log('search', search);
    try {
      const clubs = await Club.search(search);
      res.status(200).send({ clubs });
    } catch (e) {
      next({ code: 500, message: e });
    }
  },
};
