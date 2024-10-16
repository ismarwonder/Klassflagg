// auth.js

import { database } from './firebase.js';
import {
  ref,
  get,
} from 'https://www.gstatic.com/firebasejs/9.23.0/firebase-database.js';
import { appState } from './state.js';
import {
  validateUsername,
  validateTeacherPassword,
  validateSessionCode,
  generateSessionCode,
} from './utils.js';
import { dom, showElement, hideElement } from './dom.js';
import { initTeacherView, initStudentView } from './views.js';

const TEACHER_PASSWORD = 'LARARLOSENORD';

const handleCreateSession = async () => {
  const username = dom.usernameInput.value.trim();
  const password = dom.passwordInput.value;

  if (
    !validateUsername(username) ||
    !validateTeacherPassword(password, TEACHER_PASSWORD)
  )
    return;

  appState.username = username;
  appState.sessionCode = generateSessionCode();
  appState.isTeacher = true;

  hideElement(dom.loginScreen);
  showElement(dom.teacherScreen);
  dom.sessionCodeDisplay.textContent = appState.sessionCode;

  await initTeacherView();
};

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

export { handleCreateSession, handleJoinSession };
