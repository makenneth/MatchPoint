import { client } from "./appModules";

export function clearAllSessionCache(clubId) {
  return new Promise((resolve, reject) => {
    client.keys(`session:${clubId}:*`, function (err, rows) {
      if (err) {
        return reject(err);
      }
      for (const row of rows) {
        client.del(row);
      }
      return resolve();
    });
  });
}
