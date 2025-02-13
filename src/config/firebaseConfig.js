import { initializeApp } from "firebase/app";
import { getAuth, createUserWithEmailAndPassword } from "firebase/auth";
import { getDatabase, ref, set } from "firebase/database";
import { getAnalytics } from "firebase/analytics";

const firebaseConfig = {
  apiKey: "AIzaSyBDuZI5wlxbFDfY4Szc7G5Ozyk8gSF1eq0",
  authDomain: "grocerymate-79375.firebaseapp.com",
  databaseURL: "https://grocerymate-79375-default-rtdb.asia-southeast1.firebasedatabase.app",
  projectId: "grocerymate-79375",
  storageBucket: "grocerymate-79375.firebasestorage.app",
  messagingSenderId: "423654054148",
  appId: "1:423654054148:web:a98d9fb604719c1360d851"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app); 
const analytics = getAnalytics(app);
const database = getDatabase(app); // ✅ Now this will work

export { auth, app, database };
