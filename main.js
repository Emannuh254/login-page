// firebase.js or inside main.js

// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";

// Your Firebase config
const firebaseConfig = {
  apiKey: "AIzaSyAo_lUHTFOnAGIOj9Z1lzjnYKM0NO4xYMw",
  authDomain: "mannuh-ecommerce.firebaseapp.com",
  projectId: "mannuh-ecommerce",
  storageBucket: "mannuh-ecommerce.firebasestorage.app",
  messagingSenderId: "401619236359",
  appId: "1:401619236359:web:73456f85b170e875709ca2",
  measurementId: "G-1R44JH919Z",
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);
