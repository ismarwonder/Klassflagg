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
  remove
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
var app = initializeApp(firebaseConfig);
var database = getDatabase(app);

// DOM-element
var loginScreen = document.getElementById('login-screen');
var studentScreen = document.getElementById('student-screen');
var teacherScreen = document.getElementById('teacher-screen');
var sessionCodeInput = document.getElementById('session-code-input');
var sessionCodeDisplay = document.getElementById('session-code-display');
var toggleFlagBtn = document.getElementById('toggle-flag');
var resetFlagsBtn = document.getElementById('reset-flags');
var currentFlagEl = document.getElementById('current-flag');
var flagChartCtx = document.getElementById('flag-chart').getContext('2d');

// Nya element
var joinSessionBtn = document.getElementById('join-session-btn'); // Lagt till denna rad
var teacherLoginBtn = document.getElementById('teacher-login-btn');
var teacherLoginScreen = document.getElementById('teacher-login-screen');
var teacherUsernameInput = document.getElementById('teacher-username');
var teacherPasswordInput = document.getElementById('teacher-password');
var teacherLoginSubmitBtn = document.getElementById('teacher-login-submit-btn');
var teacherLoginBackBtn = document.getElementById('teacher-login-back-btn');

var isTeacher = false;
var currentFlag = 'red';
var flagChart;
var sessionCode = '';
var anonymousId = ''; // Ny variabel för anonymt elev-ID

// Händelsehanterare för "Anslut till Session"-knappen (Elev)
joinSessionBtn.addEventListener('click', function() {
  var sessionCodeValue = sessionCodeInput.value.trim().toUpperCase();
  if (sessionCodeValue === '') {
    alert('Var god ange sessionskoden.');
    return;
  }
  sessionCode = sessionCodeValue;
  isTeacher = false;

  // Kontrollera om sessionen existerar
  var sessionRef = ref(database, 'sessions/' + sessionCode);
  get(sessionRef).then(function(snapshot) {
    if (snapshot.exists()) {
      // Generera ett unikt anonymt ID för eleven
      anonymousId = generateAnonymousId();
      loginScreen.style.display = 'none';
      studentScreen.style.display = 'block';
      initStudentView();
    } else {
      alert('Sessionskoden är ogiltig. Var god kontrollera och försök igen.');
    }
  }).catch(function(error) {
    console.error(error);
    alert('Ett fel uppstod vid anslutning till sessionen.');
  });
});

// Funktion för att generera ett unikt anonymt ID
function generateAnonymousId() {
  return 'student_' + Math.random().toString(36).substr(2, 9);
}

// Händelsehanterare för "Lärarinloggning"-knappen
teacherLoginBtn.addEventListener('click', function() {
  loginScreen.style.display = 'none';
  teacherLoginScreen.style.display = 'block';
});

// Händelsehanterare för "Tillbaka"-knappen på lärarinloggningsskärmen
teacherLoginBackBtn.addEventListener('click', function() {
  teacherLoginScreen.style.display = 'none';
  loginScreen.style.display = 'block';
});

// Händelsehanterare för "Logga in"-knappen på lärarinloggningsskärmen
teacherLoginSubmitBtn.addEventListener('click', function() {
  var teacherUsername = teacherUsernameInput.value.trim();
  var teacherPassword = teacherPasswordInput.value;

  if (teacherUsername === '') {
    alert('Var god ange användarnamn.');
    return;
  }
  if (teacherPassword === '') {
    alert('Var god ange lösenord.');
    return;
  }

  // Här skulle du implementera riktig autentisering
  // För tillfället använder vi hårdkodat användarnamn och lösenord för demonstration
  if (teacherUsername === 'larare' && teacherPassword === 'losenord') {
    isTeacher = true;
    sessionCode = generateSessionCode();
    teacherLoginScreen.style.display = 'none';
    teacherScreen.style.display = 'block';
    sessionCodeDisplay.textContent = sessionCode;
    initTeacherView();
  } else {
    alert('Fel användarnamn eller lösenord.');
  }
});

// Funktion för att generera en unik sessionskod
function generateSessionCode() {
  var code = Math.random().toString(36).substr(2, 6).toUpperCase();
  return code;
}

// Funktion för elevens vy
function initStudentView() {
  var userRef = ref(database, 'sessions/' + sessionCode + '/users/' + anonymousId);
  set(userRef, { flag: currentFlag });
  onDisconnect(userRef).remove();

  toggleFlagBtn.addEventListener('click', function() {
    currentFlag = currentFlag === 'red' ? 'green' : 'red';
    update(userRef, { flag: currentFlag });
    updateFlagStatus();
  });

  onValue(userRef, function(snapshot) {
    var data = snapshot.val();
    if (data) {
      currentFlag = data.flag;
      updateFlagStatus();
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
  var sessionRef = ref(database, 'sessions/' + sessionCode);
  set(sessionRef, { createdAt: Date.now() });

  resetFlagsBtn.addEventListener('click', resetAllFlags);
  onValue(ref(database, 'sessions/' + sessionCode + '/users'), function(snapshot) {
    var users = snapshot.val() || {};
    var greenCount = 0;
    var redCount = 0;

    for (var key in users) {
      if (users.hasOwnProperty(key)) {
        var user = users[key];
        if (user.flag === 'green') {
          greenCount++;
        } else {
          redCount++;
        }
      }
    }

    updateChart(greenCount, redCount);
  });
}

// Funktion för att återställa alla flaggor
function resetAllFlags() {
  var usersRef = ref(database, 'sessions/' + sessionCode + '/users');
  get(usersRef).then(function(snapshot) {
    var users = snapshot.val() || {};
    for (var userId in users) {
      if (users.hasOwnProperty(userId)) {
        var userRef = ref(database, 'sessions/' + sessionCode + '/users/' + userId);
        update(userRef, { flag: 'red' });
      }
    }
  });
}

// Funktion för att uppdatera cirkeldiagrammet
function updateChart(greenCount, redCount) {
  var data = {
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