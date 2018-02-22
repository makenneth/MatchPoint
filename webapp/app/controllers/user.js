import ClubHelper from "../helpers/clubHelper";
import { Club, User } from "../models";
import { user as UserValidation } from "../validations";
import Mailer from '../helpers/mailer';
import Clubs from '../controllers/club';
import bcrypt from '../helpers/bcrypt';

async function updatePassword(req, res, next) {
  const user = req.user;
  const { oldPassword, newPassword, email } = req.body.data;
  let isPassword;
  try {
    isPassword = await bcrypt.isPassword(oldPassword, user.passwordDigest);
  } catch (e) {
    isPassword = false;
  }
  let conn;
  if (!isPassword) {
    return next({ code: 404, message: { oldPassword: 'Password is incorrect.' } });
  }
  if (newPassword.length > 0) {
    if (newPassword.length < 8) {
      next({ code: 422, message: { newPassword: "Password must have at least 8 characters." } });
    } else if (oldPassword !== newPassword) {
      try {
        console.log('changing password');
        conn = await User.changePassword(user.id, newPassword);
      } catch (e) {
        return next({ code: 500, message: e });
      }
    }
  }

  if (email !== user.email) {
    try {
      const token = await User.changeEmail(user.id, email, conn);
      new Mailer({ ...user, email, verified: 0, confirmToken: token }).sendConfirmationEmail();
    } catch (e) {
      return next({ code: e.email ? 422 : 500, message: e });
    }
  }
  const updatedUser = await User.findById(user.id, req.cookies._d, true);
  res.status(200).send({ user: updatedUser });
}

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
    const type = req.query.type;
    if (type === "password") {
      return updatePassword(req, res, next);
    } else if (type === "info") {
      const user = req.user;
      if (user.accountType === 'club') {
        return Clubs.updateInfo(req, res, next);
      }
    }
      //   if (data.info.address !== req.club.address) {
      //     const { lat, lng } = await GoogleApi.getGeoCode(data.info.address);
      //     console.log(lat, lng)
      //     data.lat = lat;
      //     data.lng = lng;
      //   }
      //   const ok = await Club.changeInfo(req.club, data);
      // }
    // } catch (err) {
    //   console.log(err);
    //   if (err.password || err.city || err.state || err.address || err.email) {
    //     return next({ code: 422, message: err });
    //   }
    // }
    //   return next({ code: 500, message: err });
    // }
  },

  findBySessionToken: (req, res, next) => {
    User.findBySessionToken(req.cookies._s, req.cookies._d)
      .then(
        user => {
          delete user.passwordDigest;
          delete user.confirmToken;
          delete user.token;
          res.status(200).send({ user });
        },
        err => next({ code: 404, message: err }),
      )
      .catch(err => next({ code: 500, message: err }));
  },
};
