class Club {
  validateUsername(username) {
    if (username && username.length < 8) {
      return { username: "Username must be at least 8 characters long" };
    }

    return null;
  }

  validatePassword(password) {
    if (password && password.length < 8) {
      return { password: "Password must be at least 8 characters long" };
    }

    return null;
  };

  validateEmail(email) {
    const emailRegex = new RegExp(".+@.+..+", "i");

    if (!emailRegex.test(email)) {
      return { email: "Email is not a valid format" };
    }

    return null;
  };

  validateClubName(clubName) {
    if (clubName && clubName.length === 0) {
      return { clubName: "Club name cannot be empty" };
    }
  }

  validateCity(city) {
    if (city && city.length === 0) {
      return { city: "City cannot be empty" };
    }
  }

  validateState(stateName) {
    if (stateName && stateName.length === 0) {
      return { stateName: "State cannot be empty" };
    }
  }
  validateInfo(club) {
    let err = this.validateEmail(club.email);
    if (err) return err;
    err = this.validateCity(club.city);
    if (err) return err;
    err = this.validateState(club.state);
    if (err) return err;
  }

  validate(club) {
    let err = this.validateUsername(club.username);
    if (err) return err;
    err = this.validatePassword(club.password);
    if (err) return err;
    err = this.validateClubName(club.clubName);
    if (err) return err;
    err = this.validateCity(club.city);
    if (err) return err;
    err = this.validateState(club.stateName);
    if (err) return err;
  }
}

const clubValidation = new Club();
export default clubValidation;
