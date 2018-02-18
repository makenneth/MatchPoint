import ClubHelper from "../helpers/clubHelper";
import { Club, User } from "../models";
import { user as UserValidation } from "../validations";
import Mailer from '../helpers/mailer';

export default {
  /* call when a new device is connected */
  getApiKey: (req, res, next) => {
    const deviceId = req.something;
    User.getOrCreateApiKey();

  },

  create: async (req, res, next) => {
    const { user } = req.body;
    console.log(req.baseUrl);
    // if (req.baseUrl === '/api') {
    //   type = 'club';
    // } else if (req.baseUrl === '/m/api') {
    //   type = 'user';
    // }
    {
      const [isValid, error] = UserValidation.validate(user);
      if (!isValid) {
        console.log('validation', error);
        return next({ code: 422, message: error });
      }
    }
    let userId;
    try {
      userId = await User.create('club', user, req.cookies._d);
    } catch (err) {
      console.log('after create', err);
      if (err.username || err.email) {
        return next({ code: 422, message: err });
      } else {
        return next({ code: 500, message: err });
      }
    }
    try {
      const user = await User.findById(userId, req.cookies._d, false);
      console.log('created', user);
      new Mailer(user).sendConfirmationEmail();
      ClubHelper.logIn(user, res);
    } catch (e) {
      console.log('after login', e);
      return next({ code: 500, message: e });
    }
  },

  update: (req, res, next) => {
    const data = req.body.user;
    User.update();
  },


  findBySessionToken: (req, res, next) => {
    User.findBySessionToken(req.cookies._s, req.cookies._d)
      .then(
        user => {
          delete user.password_digest;
          delete user.confirm_token;
          delete user.token;
          res.status(200).send({ user });
        },
        err => next({ code: 404, message: err }),
      )
      .catch(err => next({ code: 500, message: err }));
  },
};
