
import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
export const firebaseConfig = {
  apiKey: "AIzaSyDCelVT6SG5-vJvwNRQ3fpR4hiRC19Pj8E",
  authDomain: "thambnail-downloader.firebaseapp.com",
  projectId: "thambnail-downloader",
  storageBucket: "thambnail-downloader.firebasestorage.app",
  messagingSenderId: "22788421317",
  appId: "1:22788421317:web:885e8e4e67fac383a622ac",
  measurementId: "G-Q31YDWT76B"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);

    