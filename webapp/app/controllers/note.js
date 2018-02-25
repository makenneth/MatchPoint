import Note from "../models/note";
import { client } from "../helpers/appModules";

export default {
  update: async (req, res, next) => {
    const clubId = req.user.accountId;
    const { type, note } = req.body;
    if (!['direction', 'roundrobin', 'operation'].includes(type)) {
      return next({ code: 400, message: { type: 'Type is not valid.' } });
    }
    Note.create(clubId, type, note)
      .then(
        () => {
          client.del(`club:query:${clubId}`);
          res.status(200).send({ note: { note, type } });
        },
        (err) => {
          next({ code: err.note ? 422 : 500, message: err });
        }
      );
  },
};
