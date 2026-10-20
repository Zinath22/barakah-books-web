


import { initializeApp } from "firebase/app";
import { getAuth, setPersistence, browserLocalPersistence, GoogleAuthProvider } from "firebase/auth";

// 🔥 Firebase config
const firebaseConfig = {
   apiKey: "AIzaSyDx1zPoZqhEu9si-4k3xo9LQUTbrcov_Ic",
   authDomain: "beauty-mart-9043d.firebaseapp.com",
   projectId: "beauty-mart-9043d",
   storageBucket: "beauty-mart-9043d.firebasestorage.app",
   messagingSenderId: "1033442923939",
   appId: "1:1033442923939:web:9d50a16497f2054e497616"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Auth
export const auth = getAuth(app);

// ✅ Google Provider
export const googleProvider = new GoogleAuthProvider();

// 🔥 IMPORTANT: persist login state (fix logout on refresh / weird behavior)
if (typeof window !== "undefined") {
  setPersistence(auth, browserLocalPersistence).catch((error) => {
    console.log("Auth persistence error:", error);
  });
}

export default app;