export async function signUp(user, token) {
  // with token, it will be associated with club
  // without...
  // but it can always accept invite
  // which will be from email -> open app -> either accept invite or signup
  return request('https://matchpoints.org/user?type=m', {
    method: 'POST',
    body: JSON.stringify({ user, token }),
  });
}

export async function logIn(user) {
  return request('https://matchpoints.org/session?type=m', {
    method: 'POST',
    body: JSON.stringify({ user })
  });
}

export async function acceptInvite(token) {

}

