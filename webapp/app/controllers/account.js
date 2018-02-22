import User from "../models/user";
import URLSafeBase64 from "urlsafe-base64";
import crypto from "crypto";
import Mailer from "../helpers/mailer";

export default {
  activate: (req, res, next) => {
    const token = req.query.token;
    User.confirm(token)
      .then(
        () => res.redirect("/activate/success"),
        message => {
          res.redirect("/activate/error");
        }
      ).catch(err => next({ status: 500, message: err }));
  },

  resetRequest: async (req, res, next) => {
    const email = req.query.email;
    const username = req.query.username;
    if (!email && !username) {
      return next({ code: 400 });
    }
    try {
      const token = await User.resetPassword(email || username);
      const user = await User.findByResetToken(token);
      new Mailer({ ...user, token }).sendResetEmail();
      res.status(200).send({ success: true });
    } catch (e) {
      if (e.user) {
        next({ code: 404, message: e });
      } else {
        next({ code: 500, message: e });
      }
    }
  },

  reset: async (req, res, next) => {
    const { token, newPassword } = req.body;
    console.log(token, newPassword);
    const user = await User.findByResetToken(token);
    console.log('user', user);
    User.resetPasswordWithToken(token, newPassword)
      .then(
        async () => {
          const ok1 = await User.clearAllSessionTokens(user.id);
          await new Mailer(user).sendFinishedResetEmail();
          res.status(200).send({ success: true });
        },
        (err) => {
          next({ code: 404, message: err });
        }
      ).catch(err => next({ code: 500, message: err }));

  },

  resend: (req, res, next) => {
    new Mailer(req.user).sendConfirmationEmail()
      .then(
        () => {
          res.status(200).send({ status: "An email has been sent to your inbox." });
        },
        (err) => {
          next({ code: 400, message: "Something went wrong. Please try again later." });
        }
      );
  }
};
