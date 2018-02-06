function clubValidation() {
  function validateUsername(username) {
    if (username && username.length < 8) {
      return { username: "Username must be at least 8 characters long" };
    }

    return null;
  }

  function validatePassword(password) {
    if (password && password.length < 8) {
      return { password: "Password must be at least 8 characters long" };
    }

    return null;
  };

  function validateEmail(email) {
    const emailRegex = new RegExp(".+@.+..+", "i");

    if (!emailRegex.test(email)) {
      return { email: "Email is not a valid format" };
    }

    return null;
  };

  function validateClubName(clubName) {
    if (clubName && clubName.length === 0) {
      return { clubName: "Club name cannot be empty" };
    }
  }

  function validateCity(city) {
    if (city && city.length === 0) {
      return { city: "City cannot be empty" };
    }
  }

  function validateState(stateName) {
    if (stateName && stateName.length === 0) {
      return { stateName: "State cannot be empty" };
    }
  }

  return {
    validateInfo: function(club) {
      let err = validateEmail(club.email);
      if (err) return err;
      err = validateCity(club.city);
      if (err) return err;
      err = validateState(club.state);
      if (err) return err;
    },

    validate: function(club) {
      let err = validateUsername(club.username);
      if (err) return err;
      err = validatePassword(club.password);
      if (err) return err;
      err = validateClubName(club.clubName);
      if (err) return err;
      err = validateCity(club.city);
      if (err) return err;
      err = validateState(club.stateName);
      if (err) return err;
    },
  }
}

export default clubValidation();
