export const RESTORE_TEMP_SESSION = 'mp/tempSession/RESTORE_TEMP_SESSION';

export const saveTempSession = () => {
  return (dispatch, getState) => {
    const { newSession } = getState();
    window.localStorage.setItem(
      'matchpoint_session',
      JSON.stringify(Object.assign({}, newSession, { date: new Date() }))
    );
  };
};

export const clearTempSession = () => {
  window.localStorage.removeItem('matchpoint_session');
};

export const getTempSession = () => {
  let session = window.localStorage.getItem('matchpoint_session');
  if (session) {
    const date = JSON.parse(session).date;

    if (!date || date - new Date() > 60 * 1000 * 15) {
      clearTempSession();
      session = null;
    }
  }
  return session;
};

export const restoreTempSession = () => {
  const session = window.localStorage.getItem('matchpoint_session');
  return {
    type: RESTORE_TEMP_SESSION,
    payload: JSON.parse(session),
  };
};
