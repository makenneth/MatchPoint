function clubValidation() {
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
    validate: function(club) {
      let err = validateEmail(club.email);
      if (err) return err;
      err = validateCity(club.city);
      if (err) return err;
      err = validateState(club.state);
      if (err) return err;
    },
  };
}

export default clubValidation();
