import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: "AIzaSyDQO-69vVBhmBK8oLt0DzfyigBmjxzu7b4",
  authDomain: "gestao-amovin.firebaseapp.com",
  projectId: "gestao-amovin",
  storageBucket: "gestao-amovin.firebasestorage.app",
  messagingSenderId: "316793420445",
  appId: "1:316793420445:web:68e9898bbfcd30853f3274",
  measurementId: "G-WTKFCF0LRD"
};

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
