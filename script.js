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
import {
  getAuth,
  sendSignInLinkToEmail,
  isSignInWithEmailLink,
  signInWithEmailLink,
  onAuthStateChanged
} from "https://www.gstatic.com/firebasejs/9.23.0/firebase-auth.js";

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
const auth = getAuth(app);

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
var teacherLogoutBtn = document.getElementById('teacher-logout-btn');

// Nya element
var joinSessionBtn = document.getElementById('join-session-btn');
var teacherLoginBtn = document.getElementById('teacher-login-btn');
var teacherLoginScreen = document.getElementById('teacher-login-screen');
var teacherEmailInput = document.getElementById('teacher-email');
var teacherLoginSubmitBtn = document.getElementById('teacher-login-submit-btn');
var teacherLoginBackBtn = document.getElementById('teacher-login-back-btn');
var teacherLoginInstructions = document.getElementById('teacher-login-instructions');

var isTeacher = false;
var currentFlag = 'red';
var flagChart;
var sessionCode = '';
var anonymousId = '';

// Funktion för att hantera visningen av skärmar
function showScreen(screenName) {
  // Dölj alla skärmar
  loginScreen.style.display = 'none';
  teacherLoginScreen.style.display = 'none';
  teacherLoginInstructions.style.display = 'none';
  teacherScreen.style.display = 'none';
  studentScreen.style.display = 'none';

  // Visa önskad skärm
  switch(screenName) {
    case 'login':
      loginScreen.style.display = 'block';
      break;
    case 'teacherLogin':
      teacherLoginScreen.style.display = 'block';
      break;
    case 'teacherInstructions':
      teacherLoginInstructions.style.display = 'block';
      break;
    case 'teacher':
      teacherScreen.style.display = 'block';
      break;
    case 'student':
      studentScreen.style.display = 'block';
      break;
  }
}

// Kontrollera om det är en inloggningslänk
if (isSignInWithEmailLink(auth, window.location.href)) {
  var teacherEmail = window.localStorage.getItem('teacherEmailForSignIn');
  if (!teacherEmail) {
    teacherEmail = window.prompt('Ange din e-postadress för att bekräfta inloggningen:');
  }

  signInWithEmailLink(auth, teacherEmail, window.location.href)
    .then(function(result) {
      window.localStorage.removeItem('teacherEmailForSignIn');
      window.history.replaceState({}, document.title, window.location.pathname);
      isTeacher = true;
      sessionCode = generateSessionCode();
      showScreen('teacher'); // Visa lärarpanelen
      sessionCodeDisplay.textContent = sessionCode;
      initTeacherView();
    })
    .catch(function(error) {
      console.error(error);
      alert('Inloggningen misslyckades.');
      showScreen('login'); // Visa inloggningsskärmen igen
    });
}

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
      showScreen('student'); // Visa elevpanelen
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
  showScreen('teacherLogin'); // Visa lärarinloggningsskärmen
});

// Händelsehanterare för "Tillbaka"-knappen på lärarinloggningsskärmen
teacherLoginBackBtn.addEventListener('click', function() {
  showScreen('login'); // Återgå till inloggningsskärmen
});

// Händelsehanterare för "Skicka inloggningslänk"-knappen på lärarinloggningsskärmen
teacherLoginSubmitBtn.addEventListener('click', function() {
  var teacherEmail = teacherEmailInput.value.trim();

  if (teacherEmail === '') {
    alert('Var god ange din e-postadress.');
    return;
  }

  var actionCodeSettings = {
    url: window.location.origin, // Använd webbappens URL
    handleCodeInApp: true,
  };

  // Skicka inloggningslänken
  sendSignInLinkToEmail(auth, teacherEmail, actionCodeSettings)
    .then(function() {
      window.localStorage.setItem('teacherEmailForSignIn', teacherEmail);
      showScreen('teacherInstructions'); // Visa instruktioner
    })
    .catch(function(error) {
      console.error(error);
      alert('Ett fel uppstod vid skickandet av inloggningslänken.');
      showScreen('login'); // Återgå till inloggningsskärmen
    });
});

// Hantera autentiseringsstatus
onAuthStateChanged(auth, (user) => {
  if (user && isTeacher) {
    showScreen('teacher'); // Visa lärarpanelen
    sessionCodeDisplay.textContent = sessionCode;
    initTeacherView();
  }
});

// Händelsehanterare för "Logga ut"-knappen
teacherLogoutBtn.addEventListener('click', function() {
  auth.signOut().then(function() {
    isTeacher = false; // Återställ isTeacher-flaggan
    showScreen('login'); // Visa inloggningsskärmen
  }).catch(function(error) {
    console.error(error);
    alert('Ett fel uppstod vid utloggningen.');
  });
});

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
  if (auth.currentUser) {
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
  } else {
    alert('Du måste vara inloggad för att komma åt lärarpanelen.');
    showScreen('login'); // Visa inloggningsskärmen
  }
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

// Funktion för att generera en unik sessionskod
function generateSessionCode() {
  var code = Math.random().toString(36).substr(2, 6).toUpperCase();
  return code;
}