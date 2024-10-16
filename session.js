// session.js

import { database } from './firebase.js';
import {
  ref,
  update,
  get,
} from 'https://www.gstatic.com/firebasejs/9.23.0/firebase-database.js';
import { appState, FLAG_STATES } from './state.js';
import { updateFlagStatus } from './views.js';
import { updateChart } from './chart.js';
import { countFlags } from './utils.js';

const handleToggleFlag = () => {
  const newFlag =
    appState.currentFlag === FLAG_STATES.RED
      ? FLAG_STATES.GREEN
      : FLAG_STATES.RED;
  updateUserFlag(newFlag);
};

/**
 * @param {string} newFlag
 */
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
    const { greenCount, redCount } = countFlags(users);
    updateChart(greenCount, redCount);
  } catch (error) {
    console.error('Fel vid återställning av flaggor:', error);
  }
};

export { handleToggleFlag, updateUserFlag, handleResetFlags };
