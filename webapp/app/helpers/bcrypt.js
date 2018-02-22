import bcrypt from "bcrypt-as-promised";

function BcryptHelpers() {
  return {
    isPassword: function(password, passwordDigest) {
      return bcrypt.compare(password, passwordDigest);
    },

    generatePasswordDigest: function(password) {
      return bcrypt.hash(password, 10);
    }
  };
}

export default BcryptHelpers();
