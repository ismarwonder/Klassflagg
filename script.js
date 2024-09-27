// script.js

// Importera Firebase-moduler
import { initializeApp } from "https://www.gstatic.com/firebasejs/9.23.0/firebase-app.js";
import {
  getDatabase,
  ref,
  set,
  get,
  onValue,
  update,
  onDisconnect,
} from "https://www.gstatic.com/firebasejs/9.23.0/firebase-database.js";

// Firebase-konfiguration
const firebaseConfig = {
  apiKey: "AIzaSyCEnhv-697OiE56F0ghAuhSMh1wxm-ppnM",
  authDomain: "klassflagg.firebaseapp.com",
  projectId: "klassflagg",
  databaseURL: "https://klassflagg-default-rtdb.europe-west1.firebasedatabase.app/",
  storageBucket: "klassflagg.appspot.com",
  messagingSenderId: "85254934938",
  appId: "1:85254934938:web:830f4b9e1e078566e5aa23",
  measurementId: "G-5Z0Y08ZQYB"
};

// Initialisera Firebase
const app = initializeApp(firebaseConfig);
const database = getDatabase(app);

// DOM-element
const loginScreen = document.getElementById('login-screen');
const studentScreen = document.getElementById('student-screen');
const teacherScreen = document.getElementById('teacher-screen');
const usernameInput = document.getElementById('username');
const passwordGroup = document.getElementById('password-group');
const passwordInput = document.getElementById('password');
const createSessionBtn = document.getElementById('create-session-btn');
const joinSessionBtn = document.getElementById('join-session-btn');
const sessionCodeInput = document.getElementById('session-code-input');
const sessionCodeGroup = document.getElementById('session-code-group');
const sessionCodeDisplay = document.getElementById('session-code-display');
const studentNameEl = document.getElementById('student-name');
const toggleFlagBtn = document.getElementById('toggle-flag');
const resetFlagsBtn = document.getElementById('reset-flags');
const currentFlagEl = document.getElementById('current-flag');
const flagChartCtx = document.getElementById('flag-chart').getContext('2d');

let username = '';
let isTeacher = false;
let currentFlag = 'red';
let flagChart;
let sessionCode = '';

// Hemligt lösenord för läraren (ändra detta till ditt eget lösenord)
const teacherPassword = 'teacherpassword'; // Byt ut mot ditt eget lösenord

// Händelsehanterare för användarnamn inmatning
usernameInput.addEventListener('input', () => {
  const usernameValue = usernameInput.value.trim().toLowerCase();
  if (usernameValue === 'teacher') {
    isTeacher = true;
    // Dölj sessionskodfältet och anslutningsknappen
    sessionCodeGroup.style.display = 'none';
    joinSessionBtn.style.display = 'none';
    // Visa lösenordsfältet och knappen för att skapa session
    passwordGroup.style.display = 'block';
    createSessionBtn.style.display = 'block';
  } else {
    isTeacher = false;
    // Visa sessionskodfältet och anslutningsknappen
    sessionCodeGroup.style.display = 'block';
    joinSessionBtn.style.display = 'block';
    // Dölj lösenordsfältet och knappen för att skapa session
    passwordGroup.style.display = 'none';
    createSessionBtn.style.display = 'none';
  }
});

// Händelsehanterare för "Skapa Ny Session"-knappen (Lärare)
createSessionBtn.addEventListener('click', () => {
  username = usernameInput.value.trim();
  const password = passwordInput.value;

  if (username === '') {
    alert('Var god ange ditt namn.');
    return;
  }
  if (password !== teacherPassword) {
    alert('Fel lösenord. Var god försök igen.');
    return;
  }

  isTeacher = true;
  sessionCode = generateSessionCode();
  loginScreen.style.display = 'none';
  teacherScreen.style.display = 'block';
  sessionCodeDisplay.textContent = sessionCode;
  initTeacherView();
});

// Händelsehanterare för "Anslut till Session"-knappen (Elev)
joinSessionBtn.addEventListener('click', () => {
  username = usernameInput.value.trim();
  if (username === '') {
    alert('Var god ange ditt namn.');
    return;
  }
  if (sessionCodeInput.value.trim() === '') {
    alert('Var god ange sessionskoden.');
    return;
  }
  sessionCode = sessionCodeInput.value.trim().toUpperCase();
  isTeacher = false;

  // Kontrollera om sessionen existerar
  const sessionRef = ref(database, `sessions/${sessionCode}`);
  get(sessionRef).then((snapshot) => {
    if (snapshot.exists()) {
      loginScreen.style.display = 'none';
      studentScreen.style.display = 'block';
      studentNameEl.textContent = username;
      initStudentView();
    } else {
      alert('Sessionskoden är ogiltig. Var god kontrollera och försök igen.');
    }
  });
});

// Funktion för att generera en unik sessionskod
function generateSessionCode() {
  const code = Math.random().toString(36).substr(2, 6).toUpperCase();
  return code;
}

// Funktion för elevens vy
function initStudentView() {
  const userRef = ref(database, `sessions/${sessionCode}/users/${username}`);
  get(userRef).then((snapshot) => {
    if (snapshot.exists()) {
      alert('Användarnamnet är redan taget i denna session. Vänligen välj ett annat namn.');
      window.location.reload();
    } else {
      set(userRef, { flag: currentFlag });
      onDisconnect(userRef).remove();

      toggleFlagBtn.addEventListener('click', () => {
        currentFlag = currentFlag === 'red' ? 'green' : 'red';
        update(userRef, { flag: currentFlag });
        updateFlagStatus();
      });

      onValue(userRef, (snapshot) => {
        const data = snapshot.val();
        if (data) {
          currentFlag = data.flag;
          updateFlagStatus();
        }
      });
    }
  });
}

// Funktion för att uppdatera flaggstatus på elevens skärm
function updateFlagStatus() {
  currentFlagEl.textContent = currentFlag === 'red' ? 'Röd' : 'Grön';
  if (currentFlag === 'red') {
    currentFlagEl.style.color = 'red';
    toggleFlagBtn.textContent = 'Sätt Grön Flagg';
    toggleFlagBtn.classList.remove('btn-danger');
    toggleFlagBtn.classList.add('btn-success');
  } else {
    currentFlagEl.style.color = 'green';
    toggleFlagBtn.textContent = 'Sätt Röd Flagg';
    toggleFlagBtn.classList.remove('btn-success');
    toggleFlagBtn.classList.add('btn-danger');
  }
}

// Funktion för lärarens vy
function initTeacherView() {
  // Spara sessionskoden i databasen
  const sessionRef = ref(database, `sessions/${sessionCode}`);
  set(sessionRef, { createdAt: Date.now() });

  resetFlagsBtn.addEventListener('click', resetAllFlags);
  onValue(ref(database, `sessions/${sessionCode}/users`), (snapshot) => {
    const users = snapshot.val() || {};
    let greenCount = 0;
    let redCount = 0;

    Object.values(users).forEach(user => {
      if (user.flag === 'green') {
        greenCount++;
      } else {
        redCount++;
      }
    });

    updateChart(greenCount, redCount);
  });
}

// Funktion för att återställa alla flaggor
function resetAllFlags() {
  const usersRef = ref(database, `sessions/${sessionCode}/users`);
  get(usersRef).then((snapshot) => {
    const users = snapshot.val() || {};
    Object.keys(users).forEach(userName => {
      const userRef = ref(database, `sessions/${sessionCode}/users/${userName}`);
      update(userRef, { flag: 'red' });
    });
  });
}

// Funktion för att uppdatera cirkeldiagrammet
function updateChart(greenCount, redCount) {
  const data = {
    labels: ['Grön Flagg', 'Röd Flagg'],
    datasets: [{
      data: [greenCount, redCount],
      backgroundColor: ['#28a745', '#dc3545'],
    }],
  };

  if (flagChart) {
    flagChart.data = data;
    flagChart.update();
  } else {
    flagChart = new Chart(flagChartCtx, {
      type: 'doughnut',
      data: data,
      options: {
        responsive: true,
        maintainAspectRatio: false,
      },
    });
  }
}