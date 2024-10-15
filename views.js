// views.js

import { database } from './firebase.js';
import { ref, set, get, onValue, onDisconnect } from "https://www.gstatic.com/firebasejs/9.23.0/firebase-database.js";
import { appState, FLAG_STATES } from './state.js';
import { dom } from './dom.js';
import { countFlags } from './utils.js';
import { updateChart } from './chart.js';

const initStudentView = async () => {
  const userRef = ref(database, `sessions/${appState.sessionCode}/users/${appState.username}`);
  try {
    const snapshot = await get(userRef);
    if (snapshot.exists()) {
      alert('Användarnamnet är redan taget i denna session. Vänligen välj ett annat namn.');
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

const listenToUserFlag = (userRef) => {
  onValue(userRef, (snapshot) => {
    const data = snapshot.val();
    if (data && data.flag !== appState.currentFlag) {
      appState.currentFlag = data.flag;
      updateFlagStatus();
    }
  });
};

const initTeacherView = async () => {
  const sessionRef = ref(database, `sessions/${appState.sessionCode}`);
  try {
    await set(sessionRef, { createdAt: Date.now() });

    onValue(ref(database, `sessions/${appState.sessionCode}/users`), (snapshot) => {
      const users = snapshot.val() || {};
      const { greenCount, redCount } = countFlags(users);
      updateChart(greenCount, redCount);
    });
  } catch (error) {
    console.error('Fel vid initiering av läraryv:', error);
  }
};

const updateFlagStatus = () => {
  const isRed = appState.currentFlag === FLAG_STATES.RED;
  dom.currentFlagEl.textContent = isRed ? 'Röd' : 'Grön';
  dom.currentFlagEl.style.color = isRed ? 'red' : 'green';
  dom.toggleFlagBtn.textContent = isRed ? 'Sätt Grön Flagg' : 'Sätt Röd Flagg';
  dom.toggleFlagBtn.classList.toggle('btn-danger', isRed);
  dom.toggleFlagBtn.classList.toggle('btn-success', !isRed);
};

export { initTeacherView, initStudentView, updateFlagStatus };