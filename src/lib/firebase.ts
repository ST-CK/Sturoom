// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyAH7X4UVpOBweH-7lv6PBmXVItGkeceopY",
  authDomain: "sturoom-d2647.firebaseapp.com",
  projectId: "sturoom-d2647",
  storageBucket: "sturoom-d2647.firebasestorage.app",
  messagingSenderId: "848493935926",
  appId: "1:848493935926:web:aa08a6c979f555e7134797",
  measurementId: "G-8DJQF709CV"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);

// npm install -g firebase-tools