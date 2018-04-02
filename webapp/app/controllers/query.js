import { Player, Club } from '../models';

export default {
  aggregatePlayerRecordWithinRange: async (req, res, next) => {
    const { startDate, endDate } = req.query;
    const { clubId } = req.params;
    try {
      const record = await Club.aggregatePlayerRecordWithinRange(clubId, startDate, endDate);
      res.status(200).send({ record });
    } catch (err) {
      next({ code: err.club || err.date ? 400 : 500, message: err });
    }
  },
}
