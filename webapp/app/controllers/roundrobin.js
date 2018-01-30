import RoundRobin from "../models/roundrobin";
import { client } from "../helpers/appModules";

export default () => {
  return {
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
  };
}
