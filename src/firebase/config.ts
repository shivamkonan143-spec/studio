
import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
export const firebaseConfig = {
  apiKey: "AIzaSyAv-6b6y4qIILixgJhh1zoimOMc78M2RFk",
  authDomain: "studio-2008852960-a9318.firebaseapp.com",
  projectId: "studio-2008852960-a9318",
  storageBucket: "studio-2008852960-a9318.appspot.com",
  messagingSenderId: "",
  appId: "",
  measurementId: ""
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);

    