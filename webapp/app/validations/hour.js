function validation() {
  return {
    validate: function(hours, type) {
      const t = type || hours.type;
      if (!['roundrobin', 'operation'].includes(t)) {
        return { hours: 'Invalid parameters' };
      }
      const areValid = new Date(hours.close).toString() !== 'Invalid Date' ||
        new Date(hours.open).toString() !== 'Invalid Date';

      if (!areValid) {
        return { hours: 'Date format is not recognized' };
      }

      return null;
    }
  };
};

export default validation();
