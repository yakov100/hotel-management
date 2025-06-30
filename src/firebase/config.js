import { initializeApp } from 'firebase/app';
import { getFirestore, collection, getDocs, query, limit, enableIndexedDbPersistence, CACHE_SIZE_UNLIMITED } from 'firebase/firestore';
import { getFunctions } from 'firebase/functions';
import { getAuth, connectAuthEmulator, GoogleAuthProvider } from 'firebase/auth';
import { getAnalytics } from 'firebase/analytics';
import { getStorage } from 'firebase/storage';

// Firebase configuration from mcp-config.json
const firebaseConfig = {
    apiKey: "AIzaSyAQ4U09vWrkJZGefdmW2rYu3DuxUUcIRiA",
    authDomain: "hotel-2a869.firebaseapp.com",
    projectId: "hotel-2a869",
    storageBucket: "hotel-2a869.appspot.com",
    messagingSenderId: "935721343400",
    appId: "1:935721343400:web:4e519f4fbf920dc162259d",
    measurementId: "G-RQ1LCZ8NET"
};

console.log('Initializing Firebase app with projectId:', firebaseConfig.projectId);

let app, db, functions, auth, analytics, googleProvider, storage;

// Function to test Firebase connection
export async function testFirebaseConnection() {
    if (!db) return { success: false, error: 'Firebase not initialized' };
    
    try {
        // Try to fetch a single document from any collection
        const testQuery = query(collection(db, 'test_connection'), limit(1));
        await getDocs(testQuery);
        return { success: true };
    } catch (error) {
        console.error('Firebase connection test failed:', error);
        return { 
            success: false, 
            error: error.message
        };
    }
}

try {
    // Initialize Firebase
    app = initializeApp(firebaseConfig);
    
    // Initialize Auth first
    auth = getAuth(app);
    auth.useDeviceLanguage(); // Set language to device language
    
    // Initialize Analytics with error handling
    try {
        analytics = getAnalytics(app);
        console.log('✅ Analytics initialized successfully');
    } catch (analyticsError) {
        console.warn('⚠️ Analytics initialization failed:', analyticsError);
        analytics = null;
    }
    
    // Configure Google Auth Provider
    googleProvider = new GoogleAuthProvider();
    googleProvider.setCustomParameters({
        prompt: 'select_account',
        locale: 'he'
    });
    
    // Initialize other services
    db = getFirestore(app);
    functions = getFunctions(app);
    storage = getStorage(app);
    
    // Configure Storage with proper CORS settings
    console.log('✅ Storage initialized with bucket:', storage.app.options.storageBucket);
    
    // Test connection immediately
    testFirebaseConnection().then(result => {
        if (result.success) {
            console.log('✅ Firebase connection test successful');
        } else {
            console.error('❌ Firebase connection test failed:', result.error);
        }
    });
    
    // Add auth state change listener
    auth.onAuthStateChanged((user) => {
        if (user) {
            console.log('👤 User signed in:', user.uid);
        } else {
            console.log('👤 User signed out');
        }
    });
    
    console.log('✅ Firebase initialized successfully');
} catch (error) {
    console.error('❌ Firebase initialization error:', error);
    throw error;
}

export { db, functions, auth, analytics, googleProvider, storage };
export default firebaseConfig; 