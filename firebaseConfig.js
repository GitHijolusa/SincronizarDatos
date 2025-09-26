// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getDatabase, ref, onValue, update, get } from "firebase/database"
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyC1wb5r8FWk8X3OiWdYqiIOpmEh3-zp8oM",
  authDomain: "order-board-e8g89.firebaseapp.com",
  databaseURL: "https://order-board-e8g89-default-rtdb.europe-west1.firebasedatabase.app",
  projectId: "order-board-e8g89",
  storageBucket: "order-board-e8g89.firebasestorage.app",
  messagingSenderId: "876574247344",
  appId: "1:876574247344:web:424ee3d6ff53736e6aae75"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const database = getDatabase(app);
export { ref, onValue, update, get };