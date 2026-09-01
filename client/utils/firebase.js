// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider } from "firebase/auth";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: "cortexai-5b81b.firebaseapp.com",
  projectId: "cortexai-5b81b",
  storageBucket: "cortexai-5b81b.firebasestorage.app",
  messagingSenderId: "886069533871",
  appId: "1:886069533871:web:fc2e40c26c52eb9bf4885a"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();