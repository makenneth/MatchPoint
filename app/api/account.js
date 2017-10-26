import express from "express";
import URLSafeBase64 from "urlsafe-base64";
import crypto from "crypto";
import Mailer from "../helpers/mailer";
import Club from "../models/club";
import { csrfProtection, jsonParser } from "../helpers/appModules";

const router = express.Router();

router.get("/activate", (req, res, next) => {
  const token = req.query.token;
  Club.confirm(token)
    .then(
      () => res.redirect("/activate/success"),
      message => {
        res.redirect("/activate/error");
      }
    ).catch(err => next({ status: 500, message: err }));
})
.post("/reset/request", csrfProtection, async (req, res, next) => {
  const email = req.query.email;
  const username = req.query.username;
  if (!email && !username) {
    return next({ code: 400 })
  }
  try {
    const club = await Club.resetPassword({ email, username });
    const ok2 = new Mailer(club).sendResetEmail();
    res.status(204).send();
  } catch (e) {
    console.log(e);
    if (e.user) {
      next({ code: 404, message: e });
    } else {
      next({ code: 500, message: e });
    }
  }
})
.post("/reset", jsonParser, csrfProtection, (req, res, next) => {
  const { token, newPassword } = req.body;
  Club.resetPasswordWithToken(token, newPassword)
    .then(
      (club) => {
        Club.resetSessionToken(club.sessionToken);
        res.status(200).send({ success: true });
      },
      (err) => {
        next({ code: 404, message: err });
      }
    );
});

export default router;
