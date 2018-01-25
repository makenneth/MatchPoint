const schema = {};
const findSchemata = (numPlayers, rangeOfPlayers = [6, 5, 4]) => {
  if (numPlayers < 0) return null;
  if (numPlayers === 0) return [[]];
  let possibilities = [];
  const recursions = [];

  if (!schema[numPlayers]) {
    schema[numPlayers] = {};
  }
  if (!schema[numPlayers][rangeOfPlayers[0]]) {
    rangeOfPlayers.forEach((range, i) => {
      recursions.push([range, findSchemata(numPlayers - range, rangeOfPlayers.slice(i))]);
    });

    if (recursions.every(result => (result[1] === false))) return null;

    recursions.forEach((test) => {
      if (test[1]) {
        possibilities = possibilities.concat(test[1].map(
          result => [test[0]].concat(result)
        ));
      }
    });
    schema[numPlayers][rangeOfPlayers] = possibilities;
  }

  return schema[numPlayers][rangeOfPlayers];
};

export default findSchemata;
