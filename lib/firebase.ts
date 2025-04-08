// firebase.js
import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';

const firebaseConfig = {
    apiKey: "AIzaSyC0zEWK49uZ74i8IITwq7m58q_XOGfgHWM",
    authDomain: "devaid-34003.firebaseapp.com",
    projectId: "devaid-34003",
    storageBucket: "devaid-34003.firebasestorage.app",
    messagingSenderId: "347279373642",
    appId: "1:347279373642:web:0303c2c0d38226a003bdb3"
  };
// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

export { db };