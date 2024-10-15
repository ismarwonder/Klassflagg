// main.js

import { dom, toggleDisplay, DISPLAY } from './dom.js';
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
  toggleDisplay(dom.sessionCodeGroup, DISPLAY.NONE);
  toggleDisplay(dom.joinSessionBtn, DISPLAY.NONE);
  toggleDisplay(dom.passwordGroup, DISPLAY.BLOCK);
  toggleDisplay(dom.createSessionBtn, DISPLAY.BLOCK);
};

const showStudentOptions = () => {
  toggleDisplay(dom.sessionCodeGroup, DISPLAY.BLOCK);
  toggleDisplay(dom.joinSessionBtn, DISPLAY.BLOCK);
  toggleDisplay(dom.passwordGroup, DISPLAY.NONE);
  toggleDisplay(dom.createSessionBtn, DISPLAY.NONE);
};

const initialize = () => {
  setupEventListeners();
};

document.addEventListener('DOMContentLoaded', initialize);