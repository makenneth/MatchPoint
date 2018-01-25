export default function validatePlayer(player) {
  const err = {}
  let hasError = false;
  if (player.rating === "0") {
    err.rating = "Rating cannot be empty.";
    hasError = true;
  }
  if (player.name === "") {
    err.name = "Name cannot be empty.";
    hasError = true;
  }

  return [hasError, err];
}
