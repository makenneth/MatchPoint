import RoundRobin from "../models/roundrobin";
import { client } from "../helpers/appModules";
import { clearAllSessionCache } from '../helpers/redisHelpers';

export default {
  authorizedGet: (req, res, next) => {
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
  },

  get: (req, res, next) => {
    const clubId = req.params.clubId;
    client.get(`sessions:${clubId}:${req.params.id}`, (err, reply) => {
      if (!reply) {
        const id = req.params.id;
        RoundRobin.findDetail(clubId, id)
          .then(
            roundrobin => {
              res.status(200).send({ roundrobin });
              try {
                const json = JSON.stringify(roundrobin);
                client.setex(`sessions:${clubId}:${req.params.id}`, 12*60*60, json);
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
  },

  postResult: async (req, res, next) => {
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
  },

  update: async (req, res, next) => {
    const clubId = req.club.id;
    const id = req.params.id;
    const data = req.body.session;
    RoundRobin.update(clubId, id, data.id, data.players, data.date, data.selectedSchema)
      .then(
        async (id) => {
          client.del(`session:${clubId}:${id}`);
          client.del(`sessions:${clubId}`);
          const roundrobin = await RoundRobin.findDetail(clubId, id);
          res.status(200).send({ roundrobin });
          try {
            const data = JSON.stringify(roundrobin);
            client.set(`session:${clubId}:${id}`, data);
          } catch (e) {
            console.warn(e);
          }
        },
        err => {
          console.log(err);
          throw err;
        }
      ).catch((err) => {
        console.log(err);
        next({ code: 500, message: err });
      });
  },

  create: (req, res, next) => {
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
  },

  delete: (req, res, next) => {
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
  },


  getEditStatus: (req, res, next) => {
    RoundRobin.findEditStatus(req.club.id, req.params.id)
      .then(
        (editable) => {
          res.status(200).send({ editable });
        },
        (err) => {
          next({ code: err.roundrobin ? 400 : 500, message: err });
        }
      )
  },

  getLatestDate: (req, res, next) => {
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
  },

  all: (req, res, err) => {
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
  }
};
