import ClubModel from "../models/club";

export default class ClubHelper {
  static findCurrentClub(req) {
    return ClubModel.findBySessionToken.call(ClubModel, req.cookies.matchpoint_session);
  }

  static findClub(username, password) {
    let club;
    return ClubModel.findByUsernameAndPassword.call(ClubModel, username)
      .then((c) => {
        console.log(c);
        club = c;
        return club.isPassword(password);
      }).then(
        () => Promise.resolve(club),
        err => Promise.reject(err)
      );
  }

  static logIn(club, res) {
    if (!club) return Promise.reject();
    const sessionToken = club.sessionToken;

    delete club.sessionToken;
    delete club.passwordDigest;
    delete club.confirmToken;

    res.cookie("matchpoint_session", sessionToken,
      { maxAge: 14 * 24 * 60 * 60 * 1000 }).send(club);
  }
}
