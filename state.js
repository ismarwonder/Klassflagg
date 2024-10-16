// state.js

const FLAG_STATES = {
  RED: 'red',
  GREEN: 'green',
};

const appState = {
  username: '',
  isTeacher: false,
  currentFlag: FLAG_STATES.RED,
  flagChart: null,
  sessionCode: '',
};

export { appState, FLAG_STATES };
