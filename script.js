// script.js

// Importera Firebase-moduler
import { initializeApp } from 'https://www.gstatic.com/firebasejs/9.23.0/firebase-app.js';
import {
  getDatabase,
  ref,
  set,
  get,
  onValue,
  update,
  onDisconnect,
} from 'https://www.gstatic.com/firebasejs/9.23.0/firebase-database.js';

// Firebase-konfiguration
const firebaseConfig = {
  apiKey: 'AIzaSyCEnhv-697OiE56F0ghAuhSMh1wxm-ppnM',
  authDomain: 'klassflagg.firebaseapp.com',
  projectId: 'klassflagg',
  databaseURL:
    'https://klassflagg-default-rtdb.europe-west1.firebasedatabase.app/',
  storageBucket: 'klassflagg.appspot.com',
  messagingSenderId: '85254934938',
  appId: '1:85254934938:web:830f4b9e1e078566e5aa23',
  measurementId: 'G-5Z0Y08ZQYB',
};

// Initialisera Firebase
const app = initializeApp(firebaseConfig);
const database = getDatabase(app);

// DOM-element
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

// Konstanter
const TEACHER_PASSWORD = 'LARARLOSENORD'; // Byt ut mot ditt eget lösenord
const FLAG_STATES = {
  RED: 'red',
  GREEN: 'green',
};
const DISPLAY = {
  BLOCK: 'block',
  NONE: 'none',
};

// Applikationsstatus
const appState = {
  username: '',
  isTeacher: false,
  currentFlag: FLAG_STATES.RED,
  flagChart: null,
  sessionCode: '',
};

// Initialisera applikationen
const initialize = () => {
  setupEventListeners();
};

// Sätt upp alla händelsehanterare
const setupEventListeners = () => {
  dom.usernameInput.addEventListener('input', handleUsernameInput);
  dom.createSessionBtn.addEventListener('click', handleCreateSession);
  dom.joinSessionBtn.addEventListener('click', handleJoinSession);
  dom.toggleFlagBtn.addEventListener('click', handleToggleFlag);
  dom.resetFlagsBtn.addEventListener('click', handleResetFlags);
};

// Hantera inmatning av användarnamn
const handleUsernameInput = () => {
  const username = dom.usernameInput.value.trim().toLowerCase();
  appState.isTeacher = username === 'teacher';
  appState.isTeacher ? showTeacherOptions() : showStudentOptions();
};

// Visa alternativ för lärare
const showTeacherOptions = () => {
  toggleDisplay(dom.sessionCodeGroup, DISPLAY.NONE);
  toggleDisplay(dom.joinSessionBtn, DISPLAY.NONE);
  toggleDisplay(dom.passwordGroup, DISPLAY.BLOCK);
  toggleDisplay(dom.createSessionBtn, DISPLAY.BLOCK);
};

// Visa alternativ för studenter
const showStudentOptions = () => {
  toggleDisplay(dom.sessionCodeGroup, DISPLAY.BLOCK);
  toggleDisplay(dom.joinSessionBtn, DISPLAY.BLOCK);
  toggleDisplay(dom.passwordGroup, DISPLAY.NONE);
  toggleDisplay(dom.createSessionBtn, DISPLAY.NONE);
};

// Hantera skapande av ny session
const handleCreateSession = async () => {
  const username = dom.usernameInput.value.trim();
  const password = dom.passwordInput.value;

  if (!validateUsername(username) || !validateTeacherPassword(password)) return;

  appState.username = username;
  appState.sessionCode = generateSessionCode();
  appState.isTeacher = true;

  hideElement(dom.loginScreen);
  showElement(dom.teacherScreen);
  dom.sessionCodeDisplay.textContent = appState.sessionCode;

  await initTeacherView();
};

// Hantera anslutning till en session
const handleJoinSession = async () => {
  const username = dom.usernameInput.value.trim();
  const sessionCode = dom.sessionCodeInput.value.trim().toUpperCase();

  if (!validateUsername(username) || !validateSessionCode(sessionCode)) return;

  const exists = await verifySessionExists(sessionCode);
  if (!exists) {
    alert('Sessionskoden är ogiltig. Var god kontrollera och försök igen.');
    return;
  }

  appState.username = username;
  appState.sessionCode = sessionCode;
  appState.isTeacher = false;

  hideElement(dom.loginScreen);
  showElement(dom.studentScreen);
  dom.studentNameEl.textContent = appState.username;

  await initStudentView();
};

// Validera användarnamn
const validateUsername = (username) => {
  if (!username) {
    alert('Var god ange ditt namn.');
    return false;
  }
  return true;
};

// Validera lösenord för lärare
const validateTeacherPassword = (password) => {
  if (password !== TEACHER_PASSWORD) {
    alert('Fel lösenord. Var god försök igen.');
    return false;
  }
  return true;
};

// Validera sessionskod
const validateSessionCode = (sessionCode) => {
  if (!sessionCode) {
    alert('Var god ange sessionskoden.');
    return false;
  }
  return true;
};

// Generera en unik sessionskod
const generateSessionCode = () => {
  return Math.random().toString(36).substr(2, 6).toUpperCase();
};

// Visa ett DOM-element
const showElement = (element) => {
  element.style.display = DISPLAY.BLOCK;
};

// Dölj ett DOM-element
const hideElement = (element) => {
  element.style.display = DISPLAY.NONE;
};

// Ändra visningsläge för ett DOM-element
const toggleDisplay = (element, displayStyle) => {
  element.style.display = displayStyle;
};

// Verifiera om en session existerar
const verifySessionExists = async (sessionCode) => {
  try {
    const sessionRef = ref(database, `sessions/${sessionCode}`);
    const snapshot = await get(sessionRef);
    return snapshot.exists();
  } catch (error) {
    console.error('Fel vid verifiering av session:', error);
    return false;
  }
};

// Initiera studentens vy
const initStudentView = async () => {
  const userRef = ref(
    database,
    `sessions/${appState.sessionCode}/users/${appState.username}`
  );
  try {
    const snapshot = await get(userRef);
    if (snapshot.exists()) {
      alert(
        'Användarnamnet är redan taget i denna session. Vänligen välj ett annat namn.'
      );
      window.location.reload();
      return;
    }

    await set(userRef, { flag: appState.currentFlag });
    onDisconnect(userRef).remove();
    listenToUserFlag(userRef);
    updateFlagStatus();
  } catch (error) {
    console.error('Fel vid initiering av studentvy:', error);
  }
};

// Lyssna på förändringar av användarens flagga
const listenToUserFlag = (userRef) => {
  onValue(userRef, (snapshot) => {
    const data = snapshot.val();
    if (data && data.flag !== appState.currentFlag) {
      appState.currentFlag = data.flag;
      updateFlagStatus();
    }
  });
};

// Hantera toggling av flagga
const handleToggleFlag = () => {
  const newFlag =
    appState.currentFlag === FLAG_STATES.RED
      ? FLAG_STATES.GREEN
      : FLAG_STATES.RED;
  updateUserFlag(newFlag);
};

// Uppdatera användarens flagga i databasen
const updateUserFlag = async (newFlag) => {
  const userRef = ref(
    database,
    `sessions/${appState.sessionCode}/users/${appState.username}`
  );
  try {
    appState.currentFlag = newFlag;
    await update(userRef, { flag: newFlag });
    updateFlagStatus();
  } catch (error) {
    console.error('Fel vid uppdatering av flagga:', error);
  }
};

// Uppdatera flaggstatus på elevens skärm
const updateFlagStatus = () => {
  const isRed = appState.currentFlag === FLAG_STATES.RED;
  dom.currentFlagEl.textContent = isRed ? 'Röd' : 'Grön';
  dom.currentFlagEl.style.color = isRed ? 'red' : 'green';
  dom.toggleFlagBtn.textContent = isRed ? 'Sätt Grön Flagg' : 'Sätt Röd Flagg';
  dom.toggleFlagBtn.classList.toggle('btn-danger', isRed);
  dom.toggleFlagBtn.classList.toggle('btn-success', !isRed);
};

// Initiera lärarens vy
const initTeacherView = async () => {
  const sessionRef = ref(database, `sessions/${appState.sessionCode}`);
  try {
    await set(sessionRef, { createdAt: Date.now() });

    onValue(
      ref(database, `sessions/${appState.sessionCode}/users`),
      (snapshot) => {
        const users = snapshot.val() || {};
        const { greenCount, redCount } = countFlags(users);
        updateChart(greenCount, redCount);
      }
    );
  } catch (error) {
    console.error('Fel vid initiering av läraryv:', error);
  }
};

// Räkna antalet gröna och röda flaggor
const countFlags = (users) => {
  return Object.values(users).reduce(
    (acc, user) => {
      if (user.flag === FLAG_STATES.GREEN) acc.greenCount += 1;
      else acc.redCount += 1;
      return acc;
    },
    { greenCount: 0, redCount: 0 }
  );
};

// Hantera återställning av alla flaggor
const handleResetFlags = async () => {
  const usersRef = ref(database, `sessions/${appState.sessionCode}/users`);
  try {
    const snapshot = await get(usersRef);
    const users = snapshot.val() || {};
    const updates = {};

    Object.keys(users).forEach((username) => {
      updates[`${username}/flag`] = FLAG_STATES.RED;
    });

    await update(usersRef, updates);
  } catch (error) {
    console.error('Fel vid återställning av flaggor:', error);
  }
};

// Uppdatera cirkeldiagrammet
const updateChart = (greenCount, redCount) => {
  const data = {
    labels: ['Grön Flagg', 'Röd Flagg'],
    datasets: [
      {
        data: [greenCount, redCount],
        backgroundColor: ['#28a745', '#dc3545'],
      },
    ],
  };

  if (appState.flagChart) {
    appState.flagChart.data = data;
    appState.flagChart.update();
  } else {
    // eslint-disable-next-line no-undef
    appState.flagChart = new Chart(dom.flagChartCtx, {
      type: 'doughnut',
      data,
      options: {
        responsive: true,
        maintainAspectRatio: false,
      },
    });
  }
};

// Starta applikationen
document.addEventListener('DOMContentLoaded', initialize);
