function validation() {
  return {
    validate: function(hours) {
      if (!['roundrobin', 'operation'].includes(hours.type)) {
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
