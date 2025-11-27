// بدل localStorage بـ Firebase
import { initializeApp } from 'firebase/app';
import { getFirestore, collection, addDoc } from 'firebase/firestore';

const firebaseConfig = {
    apiKey: "YOUR_API_KEY",
    projectId: "YOUR_PROJECT_ID",
    // ... باقي البيانات
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);