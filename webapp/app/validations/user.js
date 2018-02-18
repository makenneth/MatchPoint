import { merge } from 'lodash';

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

  return {
    validate: function(club) {
      const error = {};
      let isValid = true;
      let err = validateUsername(club.username);
      if (err) {
        isValid = false;
        merge(error, err);
      }
      err = validatePassword(club.password);
      if (err) {
        isValid = false;
        merge(error, err);
      }
      err = validateEmail(club.email)
      if (err) {
        isValid = false;
        merge(error, err);
      }

      return [isValid, error];
    },
  }
}

export default clubValidation();
