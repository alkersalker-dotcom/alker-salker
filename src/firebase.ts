import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyAvJQHkHMtWoHc-6JGtiwxizsuKyTkIf0",
  authDomain: "alker-salker.firebaseapp.com",
  projectId: "alker-salker",
  storageBucket: "alker-salker.firebasestorage.app",
  messagingSenderId: "695660597282",
  appId: "1:695660597282:web:377c77a9ae2ca432e7fa7b"
};

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
