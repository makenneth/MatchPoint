import Note from "../models/note";
import { client } from "../helpers/appModules";

export default {
  update: async (req, res, next) => {
    const clubId = req.user.accountId;
    const { type, note } = req.body;
    if (['address', 'roundrobin', 'operation'].includes(type)) {
      return next({ code: 400, message: { type: 'Type is not valid.' } });
    }
    return Note.create(type, note)
      .then(
        async (noteId) => {
          try {
            const note = await Note.find(noteId);
          } catch (e) {
            next({ code: 500, message: e });
          }
          res.status(200).send({ node: { note, type } });
        },
        (err) => {
          next({ code: err.note ? 422 : 500, message: err });
        }
      );
  },
};
