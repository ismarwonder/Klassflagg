// main.js

import { dom, showElement, hideElement } from './dom.js';
import { appState } from './state.js';
import { handleCreateSession, handleJoinSession } from './auth.js';
import { handleToggleFlag, handleResetFlags } from './session.js';

const setupEventListeners = () => {
  dom.usernameInput.addEventListener('input', handleUsernameInput);
  dom.createSessionBtn.addEventListener('click', handleCreateSession);
  dom.joinSessionBtn.addEventListener('click', handleJoinSession);
  dom.toggleFlagBtn.addEventListener('click', handleToggleFlag);
  dom.resetFlagsBtn.addEventListener('click', handleResetFlags);
};

const handleUsernameInput = () => {
  const username = dom.usernameInput.value.trim().toLowerCase();
  appState.isTeacher = username === 'teacher';
  appState.isTeacher ? showTeacherOptions() : showStudentOptions();
};

const showTeacherOptions = () => {
  hideElement(dom.sessionCodeGroup);
  hideElement(dom.joinSessionBtn);
  showElement(dom.passwordGroup);
  showElement(dom.createSessionBtn);
};

const showStudentOptions = () => {
  showElement(dom.sessionCodeGroup);
  showElement(dom.joinSessionBtn);
  hideElement(dom.passwordGroup);
  hideElement(dom.createSessionBtn);
};

const initialize = () => {
  setupEventListeners();
};

document.addEventListener('DOMContentLoaded', initialize);
