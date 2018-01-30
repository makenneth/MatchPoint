import ClubHelper from "../helpers/clubHelper";
import Club from "../models/club";

export default () => {
  return {
    post: (req, res, next) => {
      const data = req.body.user;
      Club.findByUsernameAndPassword(data.username.toLowerCase(), data.password)
        .then(
          (club) => {
            return ClubHelper.logIn(club, res);
          },
          (err) => {
            if (err.password || err.username) {
              next({ code: 422, message: err });
            } else {
              next({ code: 500, message: err });
            }
          }
        ).catch(err => next({ code: 500, message: err }));
    },

    delete: (req, res, next) => {
      Club.resetSessionTokenWithOldToken(req.cookies.matchpoint_session)
        .then(() => {
          res.status(204).clearCookie("matchpoint_session");
          res.end();
        }).catch((err) => {
          res.clearCookie("matchpoint_session");
          next({ code: err.token ? 404 : 500, message: err });
        });
    }
  };
}
