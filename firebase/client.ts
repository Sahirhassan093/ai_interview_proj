import { getApp, getApps, initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyCALcNEYYTJxwfB_ajG1F5rHkfvfgwYtzY",
  authDomain: "prep-ai-d37e5.firebaseapp.com",
  projectId: "prep-ai-d37e5",
  storageBucket: "prep-ai-d37e5.firebasestorage.app",
  messagingSenderId: "144375182619",
  appId: "1:144375182619:web:5ec6ab6c104ad6aa624fbe",
  measurementId: "G-CNS94DT27Z"
};
console.log(process.env.NEXT_PUBLIC_FIREBASE_API_KEY)
// Initialize Firebase
const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();
// const analytics = getAnalytics(app);

export const auth = getAuth(app);
export const db = getFirestore(app);