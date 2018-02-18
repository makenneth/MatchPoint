import ClubHelper from "../helpers/clubHelper";
import { Session, Club, User, Device } from '../models';

export default {
  // post: (req, res, next) => {
  //   const data = req.body.user;
  //   Club.findByUsernameAndPassword(data.username.toLowerCase(), data.password)
  //     .then(
  //       (club) => {
  //         return ClubHelper.logIn(club, res);
  //       },
  //       (err) => {
  //         if (err.password || err.username) {
  //           next({ code: 422, message: err });
  //         } else {
  //           next({ code: 500, message: err });
  //         }
  //       }
  //     ).catch(err => next({ code: 500, message: err }));
  // },

  // delete: (req, res, next) => {
  //   Club.resetSessionTokenWithOldToken(req.cookies.matchpoint_session)
  //     .then(() => {
  //       res.status(204).clearCookie("_d");
  //     }).catch((err) => {
  //       res.clearCookie("_d");
  //       next({ code: err.token ? 404 : 500, message: err });
  //     });
  // },

  create: async (req, res, next) => {
    const data = req.body.user;
    let user;
    try {
      user = await User.findByUsernameAndPassword(data.username.toLowerCase(), data.password);
    } catch (err) {
      if (err.password || err.username) {
        return next({ code: 404, message: err });
      } else {
        return next({ code: 500, message: err });
      }
    }

    const token = await Device.findDevice(user.id, req.cookies._d);
    user.sessionToken = token;
    if (!token) {
      try {
        const _ = await Device.addDevice(user.id, req.cookies._d);
        const token = await Session.insertToken(req.cookies._d);
        user.sessionToken = token;
      } catch (e) {
        return next({ code: 500, message: e });
      }
    }
    try {
      ClubHelper.logIn(user, res);
    } catch (e) {
      return next({ code: 500, message: e });
    }
  },

  delete: (req, res, next) => {
    console.log('session delete');
    Session.resetToken(req.cookies._s)
      .then(() => {
        console.log('clear cookie');
        res.status(204).clearCookie("_s").send();
      }).catch((err) => {
        res.clearCookie("_d");
        next({ code: err.token ? 404 : 500, message: err });
      });
  },
};
