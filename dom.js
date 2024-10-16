// dom.js

const dom = {
    loginScreen: document.getElementById('login-screen'),
    studentScreen: document.getElementById('student-screen'),
    teacherScreen: document.getElementById('teacher-screen'),
    usernameInput: document.getElementById('username'),
    passwordGroup: document.getElementById('password-group'),
    passwordInput: document.getElementById('password'),
    createSessionBtn: document.getElementById('create-session-btn'),
    joinSessionBtn: document.getElementById('join-session-btn'),
    sessionCodeInput: document.getElementById('session-code-input'),
    sessionCodeGroup: document.getElementById('session-code-group'),
    sessionCodeDisplay: document.getElementById('session-code-display'),
    studentNameEl: document.getElementById('student-name'),
    toggleFlagBtn: document.getElementById('toggle-flag'),
    resetFlagsBtn: document.getElementById('reset-flags'),
    currentFlagEl: document.getElementById('current-flag'),
    flagChartCtx: document.getElementById('flag-chart').getContext('2d'),
  };
  
  const DISPLAY = {
    BLOCK: 'block',
    NONE: 'none'
  };
  
  const showElement = (element) => {
    element.style.display = DISPLAY.BLOCK;
  };
  
  const hideElement = (element) => {
    element.style.display = DISPLAY.NONE;
  };

  
  export { dom, showElement, hideElement, DISPLAY };