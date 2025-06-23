const { initializeApp } = require('firebase/app');
const { getFirestore, collection, getDocs } = require('firebase/firestore');
require('dotenv').config();

const firebaseConfig = {
  apiKey: process.env.FIREBASE_API_KEY,
  authDomain: process.env.FIREBASE_AUTH_DOMAIN,
  projectId: process.env.FIREBASE_PROJECT_ID,
  storageBucket: process.env.FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.FIREBASE_APP_ID
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

(async () => {
  try {
    const snapshot = await getDocs(collection(db, 'bookings'));
    if (snapshot.empty) {
      console.log('הקולקציה bookings ריקה או לא קיימת. החיבור ל-Firebase תקין.');
    } else {
      console.log('הקולקציה bookings קיימת. מסמכים לדוגמה:');
      snapshot.forEach(doc => {
        console.log(doc.id, doc.data());
      });
    }
  } catch (err) {
    console.error('שגיאה בחיבור ל-Firebase:', err.message);
  }
})(); 