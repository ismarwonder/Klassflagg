// firebase.js

import { initializeApp } from 'https://www.gstatic.com/firebasejs/9.23.0/firebase-app.js';
import { getDatabase } from 'https://www.gstatic.com/firebasejs/9.23.0/firebase-database.js';

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

const app = initializeApp(firebaseConfig);
const database = getDatabase(app);

export { database };
