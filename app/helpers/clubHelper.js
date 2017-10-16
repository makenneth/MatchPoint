import ClubModel from "../models/club";

export default class ClubHelper {
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
    const sessionToken = club.session_token;
    delete club.session_token;
    delete club.password_digest;
    delete club.confirm_token;

    res.status(200).cookie(
      "matchpoint_session",
      sessionToken,
      { maxAge: 14 * 24 * 60 * 60 * 1000, httpOnly: true, domain: 'localhost' }
    ).send({ club });
  }
}
