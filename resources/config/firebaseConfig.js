import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider } from "firebase/auth";
import { getDatabase } from "firebase/database";

// Firebase configuration
const firebaseConfig = {
    apiKey: "AIzaSyA0HJecSj2mJbhTfIuaYCByWOqooiPC7bo",
    authDomain: "health-monitor-system-6875d.firebaseapp.com",
    databaseURL: "https://health-monitor-system-6875d-default-rtdb.firebaseio.com/",
    projectId: "health-monitor-system-6875d",
    storageBucket: "health-monitor-system-6875d.appspot.com",
    messagingSenderId: "764779490121",
    appId: "1:764779490121:web:ef58025ecee092256cc898",
    measurementId: "G-BSZ2HC7S38"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const database = getDatabase(app);
export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();

export { database };
