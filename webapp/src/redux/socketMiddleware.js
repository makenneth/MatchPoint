import { Socket } from 'phoenix-socket';

let socket;

const CHANNEL_EVENTS = {
  close: 'phx_close',
  error: 'phx_error',
  join: 'phx_join',
  reply: 'phx_reply',
  leave: 'phx_leave',
};

export default function startWebsocket() {
  const [, token] = document.cookie.match(/_s=(.*?)(;|$)/);
  socket = new Socket('ws://localhost:4000/socket', {
    params: { session_token: token },
  });
  socket.connect();

  const room = socket.channel('session:abcd', {});

  room.on('INITIAL_STATE', (res) => {
    console.log(res);
  });

  room.join().receive('ok', () => {
    console.log('Connected!!');
  });
}

export function socketMiddleware(store) {
  return next => action => {
    if (!socket) return next(action);
    switch (action.type) {

      default:
        break;
    }

    return next(action);
  }
}
