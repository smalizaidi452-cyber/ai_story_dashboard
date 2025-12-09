import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";

const firebaseConfig = {
  apiKey: "AIzaSy....",
  authDomain: "drama-breakdown-crm.firebaseapp.com",
  projectId: "drama-breakdown-crm",
  storageBucket: "drama-breakdown-crm.appspot.com",
  messagingSenderId: "123456789",
  appId: "1:123456789:web:abcd1234"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
