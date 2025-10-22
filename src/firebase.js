// Import des fonctions nécessaires
import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";

// Configuration Firebase (celle que tu as déjà)
const firebaseConfig = {
  apiKey: "AIzaSyCyu1hI6_QR8kXpws008ktudqIL_L_4Hno",
  authDomain: "tp1web2-7a99d.firebaseapp.com",
  projectId: "tp1web2-7a99d",
  storageBucket: "tp1web2-7a99d.firebasestorage.app",
  messagingSenderId: "571981965131",
  appId: "1:571981965131:web:565bd6e7166c9f23d56ace",
};

// Initialisation Firebase
const app = initializeApp(firebaseConfig);

// Initialisation des services Firebase
export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();
export const db = getFirestore(app);
export const storage = getStorage(app);
