import * as GoogleApi from '../helpers/googleApi';

export default () => {
  return {
    autocomplete: async (req, res, next) => {
      try {
        const predictions = await GoogleApi.getPredictions(req.query.address);
        res.status(200).send({ predictions });
      } catch (e) {
        console.log(e);
        next({ code: 500, message: e });
      }
    }
  };
}
