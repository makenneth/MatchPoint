export default function() {
  return {
    validate: function(type, hours) {
      if (!['roundrobin_hours', 'operation_hours'].includes(type)) {

      }
      if (hours.length !== 7) {
        return { hours: 'Schedule does not have the right number of days.' };
      }
      const areValid = hours.every((day) => (
        day.length === 0 || day.every((session) => (
          new Date(session.close).toString() !== 'Invalid Date' ||
          new Date(session.open).toString() !== 'Invalid Date'
        ))
      ));

      if (!areValid) {
        return { hours: 'Date format is not recognized' };
      }

      return null;
    }
  };
};
