import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider, GithubAuthProvider } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";

const firebaseConfig = {
  apiKey: "AIzaSyCyu1hI6_QR8kXpws008ktudqIL_L_4Hno",
  authDomain: "tp1web2-7a99d.firebaseapp.com",
  projectId: "tp1web2-7a99d",
  storageBucket: "tp1web2-7a99d.firebasestorage.app",
  messagingSenderId: "571981965131",
  appId: "1:571981965131:web:565bd6e7166c9f23d56ace",
};

const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();
export const githubProvider = new GithubAuthProvider();
export const db = getFirestore(app);
export const storage = getStorage(app);
