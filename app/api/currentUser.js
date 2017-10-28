import express from "express";
import Club from "../models/club";
import RoundRobin from "../models/roundrobin";
import { clubMethods, jsonParser, csrfProtection, client } from "../helpers/appModules";
import ScoreCalculation from '../helpers/scoreCalculation';
import { clearAllSessionCache } from '../helpers/redisHelpers';
import * as GoogleApi from '../helpers/googleApi';
import Mailer from "../helpers/mailer";

const router = express.Router();
router.post("/accounts/resend", (req, res, next) => {
  new Mailer(req.club).sendConfirmationEmail()
    .then(
      () => {
        res.status(200).send({ status: "An email has been sent to your inbox." });
      },
      (err) => {
        next({ code: 400, message: "Something went wrong. Please try again later." });
      }
    );
})
.get("/sessions/edit-status/:id", (req, res, err) => {
  RoundRobin.findEditStatus(req.club.id, req.params.id)
    .then(
      (editable) => {
        res.status(200).send({ editable });
      },
      (err) => {
        next({ code: err.roundrobin ? 400 : 500, message: err });
      }
    )
})
.get("/sessions/latest-date", (req, res, err) => {
  RoundRobin.findLatestDate(req.club.id)
    .then(
      (date) => {
        res.status(200).send({ date });
      },
      (err) => {
        if (err.roundrobin) {
          res.status(200).send({ date: null });
        } else {
          next({ code: 400, message: err });
        }
      }
    )
})
.get("/sessions", (req, res, err) => {
  const clubId = req.club.id;
  client.get(`sessions:${clubId}`, (err, reply) => {
    if (err) throw err;
    if (!reply) {
      RoundRobin.findAllByClub(clubId)
        .then(
          (roundrobins) => {
            try {
              res.status(200).send({ roundrobins });
              const json = JSON.stringify(roundrobins);
              client.set(`sessions:${clubId}`, json);
            } catch (e) {
              next({ code: 500, message: e });
            }
          },
          (err) => {
            next({ code: 400, message: err });
          }
        ).catch(err => next({ code: 500, message: err }))
    } else {
      try {
        const roundrobins = JSON.parse(reply);
        res.status(200).send({ roundrobins });
      } catch (e) {
        console.warn('Failed to parse roundrobin data from redi');
        next({ code: 500, message: e });
      }
    }
  });
})
.get("/sessions/:id", (req, res, next) => {
  const clubId = req.club.id;
  const id = req.params.id;
  client.get(`sessions:${id}`, (err, reply) => {
    if (!reply) {
      RoundRobin.findDetail(clubId, id)
        .then(
          roundrobin => {
            try {
              res.status(200).send({ roundrobin });
              const json = JSON.stringify(roundrobin);
              client.set(`session:${clubId}:${roundrobin.short_id}`, json);
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
        const roundrobin = JSON.parse(reply);
        res.status(200).send({ roundrobin });
      } catch (e) {
        console.warn('Failed to parse roundrobin data from redi');
        next({ code: 500, message: e });
      }
    }
  });
})
.delete("/sessions/:id", (req, res, next) => {
  const id = req.params.id;
  RoundRobin.delete(req.club.id, id)
    .then(async () => {
      try {
        const clear = await clearAllSessionCache(req.club.id);
      } catch (e) {
        console.warn(e);
      }
      client.del(`sessions:${req.club.id}`);
      client.del(`players:${req.club.id}`);
      client.del(`session:${req.club.id}:${id}`);
      return res.status(200).send({ id });
    }).catch((err) => {
      console.log(err);
      return next({ code: 500, message: err });
    });
})
.post("/sessions/:id", jsonParser, csrfProtection, async (req, res, next) => {
  const id = req.params.id;
  const { date, results } = req.body;
  let roundrobin;
  try {
    roundrobin = await RoundRobin.findDetail(req.club.id, id);
  } catch (e) {
    console.log(e);
    next({ code: 500, message: e });
  }
  RoundRobin.postResult(req.club.id, roundrobin, results)
    .then(async () => {
      try {
        const clear = await clearAllSessionCache(req.club.id);
      } catch (e) {
        console.warn(e);
      }
      client.del(`players:${req.club.id}`);
      client.del(`sessions:${req.club.id}`);
      return res.status(204).send();
    }).catch((err) => {
      console.log(err);
      next({ code: 500, message: err });
      res.status(422).send(err);
    });
})
.post("/sessions", jsonParser, csrfProtection, (req, res, next) => {
  const clubId = req.club.id;
  const data = req.body.session;
  RoundRobin.create(clubId, data.players, data.date, data.selectedSchema)
    .then(
      async (id) => {
        client.del(`sessions:${clubId}`);
        const roundrobin = await RoundRobin.findByClub(clubId, id);
        res.status(200).send({ roundrobin });
      },
      err => {
        console.log(err);
        throw err;
      }
    ).catch((err) => {
      next({ code: 500, message: err });
    });
}).patch("", jsonParser, async (req, res, next) => {
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
}).get('/geolocation/autocomplete', async (req, res, next) => {
  try {
    const predictions = await GoogleApi.getPredictions(req.query.address);
    res.status(200).send({ predictions });
  } catch (e) {
    console.log(e);
    next({ code: 500, message: e });
  }
});

export default router;
