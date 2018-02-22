require('dotenv').config();
import ClubModel from "../models/club";

function ClubHelper() {
  return {
    logIn: function(club, res) {
      if (!club) return Promise.reject();
      const {
        sessionToken,
        passwordDigest,
        confirmToken,
        ...rest,
      } = club;
      res.status(200).cookie(
        "_s",
        sessionToken,
        { maxAge: 14 * 24 * 60 * 60 * 1000, httpOnly: true, domain: process.env.DOMAIN }
      ).send({ user: rest });
    }
  };
}

export default ClubHelper();
