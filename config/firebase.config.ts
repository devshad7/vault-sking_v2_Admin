import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyCIcIrj7E8b6bl68oEUsH-mdeH5VXRQmJg",
  authDomain: "vault-skin.firebaseapp.com",
  projectId: "vault-skin",
  storageBucket: "vault-skin.firebasestorage.app",
  messagingSenderId: "809146996576",
  appId: "1:809146996576:web:6a18aca7ee4c9596753005",
};

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
