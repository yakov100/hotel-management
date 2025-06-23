import React, { useState, useEffect } from 'react';
import { signInWithPopup, GoogleAuthProvider, signOut, signInWithEmailAndPassword, createUserWithEmailAndPassword } from 'firebase/auth';
import { auth, db } from '../firebase/config';
import { doc, setDoc, getDoc, collection, query, where, getDocs } from 'firebase/firestore';
import { isBrowserExtensionError } from '../utils/errorUtils';

const Auth = ({ onAuthSuccess }) => {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [isRegister, setIsRegister] = useState(false);

    // המרת שם משתמש לאימייל
    const usernameToEmail = (username) => {
        return `${username}@hotel-manager.com`.toLowerCase();
    };

    const createTenantProfile = async (uid, email, username, photoURL) => {
        try {
            const userRef = doc(db, 'users', uid);
            await setDoc(userRef, {
                email,
                username,
                photoURL,
                createdAt: new Date().toISOString(),
                lastLogin: new Date().toISOString(),
                role: 'user'
            });
            return true;
        } catch (error) {
            console.error('Error creating tenant profile:', error);
            throw error;
        }
    };

    const handleGoogleAuth = async () => {
        setLoading(true);
        setError('');

        try {
            const provider = new GoogleAuthProvider();
            // Add additional OAuth scopes
            provider.addScope('profile');
            provider.addScope('email');
            
            // Add custom parameters
            provider.setCustomParameters({
                prompt: 'select_account',
                locale: 'he'
            });

            console.log('Starting Google sign-in popup...');
            const result = await signInWithPopup(auth, provider);
            
            if (result.user) {
                console.log('Google sign-in successful:', result.user);
                await createTenantProfile(
                    result.user.uid,
                    result.user.email,
                    result.user.displayName,
                    ''
                );
                onAuthSuccess?.(result.user);
            }
        } catch (error) {
            // Ignore browser extension interference
            if (isBrowserExtensionError(error)) {
                console.warn('🔌 Browser extension interference in auth popup, ignoring:', error.message);
                return;
            }
            
            console.error('Google sign-in error:', {
                code: error.code,
                message: error.message,
                email: error.customData?.email,
                credential: error.credential,
            });

            setError(getErrorMessage(error.code));
        } finally {
            setLoading(false);
        }
    };

    const handleEmailAuth = async (e) => {
        e.preventDefault();
        
        // בדיקת תקינות שם משתמש
        if (username.length < 3 || username.length > 20) {
            setError('שם המשתמש חייב להיות באורך 3-20 תווים');
            return;
        }
        
        if (!/^[a-zA-Z0-9_-]*$/.test(username)) {
            setError('שם המשתמש יכול להכיל רק אותיות באנגלית, מספרים, מקף ותחתון');
            return;
        }

        if (!password || password.length < 6) {
            setError('הסיסמה חייבת להכיל לפחות 6 תווים');
            return;
        }

        setLoading(true);
        setError('');
        
        try {
            const email = usernameToEmail(username);
            let userCredential;
            
            if (isRegister) {
                // בדיקה אם המשתמש קיים בקולקציית users רק אם מנסים להירשם
                const usersRef = collection(db, 'users');
                const q = query(usersRef, where('username', '==', username));
                const querySnapshot = await getDocs(q);
                
                if (!querySnapshot.empty) {
                    setError('שם המשתמש כבר תפוס');
                    setLoading(false);
                    return;
                }

                userCredential = await createUserWithEmailAndPassword(auth, email, password);
                // צור פרופיל tenant חדש
                await createTenantProfile(
                    userCredential.user.uid,
                    email,
                    username,
                    ''
                );
            } else {
                userCredential = await signInWithEmailAndPassword(auth, email, password);
            }
            
            onAuthSuccess?.(userCredential.user);
        } catch (error) {
            console.error('Auth error:', error);
            setError(getErrorMessage(error.code));
        } finally {
            setLoading(false);
        }
    };

    const handleSignOut = async () => {
        setLoading(true);
        setError('');

        try {
            await signOut(auth);
            console.log('User signed out successfully');
            window.location.reload(); // רענון הדף אחרי התנתקות
        } catch (error) {
            console.error('Sign out error:', error);
            setError('שגיאה בהתנתקות מהמערכת');
        } finally {
            setLoading(false);
        }
    };

    const getErrorMessage = (errorCode) => {
        switch (errorCode) {
            case 'auth/operation-not-allowed':
                return 'אימות לא מופעל. אנא פנה למנהל המערכת';
            case 'auth/popup-blocked':
                return 'הדפדפן חסם את החלון. נסה לאפשר חלונות קופצים ונסה שוב';
            case 'auth/popup-closed-by-user':
                return 'החלון נסגר. נסה שוב';
            case 'auth/cancelled-popup-request':
                return 'בקשת ההתחברות בוטלה. נסה שוב';
            case 'auth/unauthorized-domain':
                return 'הדומיין לא מורשה. אנא פנה למנהל המערכת';
            case 'auth/invalid-oauth-provider':
                return 'ספק OAuth לא תקין. אנא פנה למנהל המערכת';
            case 'auth/network-request-failed':
                return 'אין חיבור לאינטרנט. נא לבדוק את החיבור ולנסות שוב';
            case 'auth/email-already-in-use':
                return 'שם המשתמש כבר תפוס. נסה שם אחר';
            case 'auth/invalid-email':
                return 'שם המשתמש לא תקין';
            case 'auth/weak-password':
                return 'הסיסמה חלשה מדי. יש להשתמש בלפחות 6 תווים';
            case 'auth/user-not-found':
                return 'משתמש לא נמצא. בדוק את שם המשתמש או הירשם';
            case 'auth/wrong-password':
                return 'סיסמה שגויה. נסה שוב';
            case 'auth/too-many-requests':
                return 'יותר מדי ניסיונות כניסה. נסה שוב מאוחר יותר';
            case 'auth/invalid-credential':
                return 'פרטי ההתחברות שגויים. נסה שוב';
            default:
                console.error('Unhandled auth error:', errorCode);
                return 'שגיאה בהתחברות. נסה שוב מאוחר יותר';
        }
    };

    // אם המשתמש מחובר, נציג כפתור התנתקות
    if (auth.currentUser) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
                <div className="max-w-md w-full">
                    <div className="bg-white rounded-2xl shadow-xl p-8">
                        <div className="text-center mb-8">
                            <h1 className="text-xl font-bold text-gray-900 mb-2">
                                שלום, {auth.currentUser.displayName || auth.currentUser.email}
                            </h1>
                            <p className="text-gray-600">
                                מחובר למערכת
                            </p>
                        </div>

                        {error && (
                            <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded-lg text-sm">
                                {error}
                            </div>
                        )}

                        <div className="space-y-4">
                            <button
                                onClick={handleSignOut}
                                disabled={loading}
                                className="w-full flex items-center justify-center gap-2 bg-red-500 text-white rounded-lg px-4 py-2 hover:bg-red-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 disabled:opacity-50"
                            >
                                {loading ? 'מתנתק...' : 'התנתק מהמערכת'}
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    // אם המשתמש לא מחובר, נציג טופס אימייל/סיסמה + כפתור Google
    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
            <div className="max-w-md w-full">
                <div className="bg-white rounded-2xl shadow-xl p-8">
                    <div className="text-center mb-8">
                        <h1 className="text-3xl font-bold text-gray-900 mb-2">
                            התחברות למערכת
                        </h1>
                        <p className="text-gray-600">
                            נהל את דירת הנופש שלך
                        </p>
                    </div>

                    {error && (
                        <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded-lg text-sm">
                            {error}
                        </div>
                    )}

                    <form onSubmit={handleEmailAuth} className="space-y-4 mb-4">
                        <input
                            type="text"
                            placeholder="שם משתמש"
                            value={username}
                            onChange={e => setUsername(e.target.value)}
                            className="w-full border rounded-lg px-3 py-2 text-right"
                            required
                            autoComplete="username"
                            minLength="3"
                            maxLength="20"
                        />
                        <input
                            type="password"
                            placeholder="סיסמה"
                            value={password}
                            onChange={e => setPassword(e.target.value)}
                            className="w-full border rounded-lg px-3 py-2 text-right"
                            required
                            autoComplete="current-password"
                        />
                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full bg-blue-600 text-white rounded-lg px-4 py-2 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
                        >
                            {loading ? (isRegister ? 'נרשם...' : 'מתחבר...') : (isRegister ? 'הרשמה' : 'התחברות')}
                        </button>
                    </form>
                    <div className="flex justify-between mb-4">
                        <button
                            type="button"
                            className="text-sm text-blue-600 hover:underline"
                            onClick={() => setIsRegister(!isRegister)}
                        >
                            {isRegister ? 'כבר רשום? התחבר' : 'אין לך חשבון? הרשם'}
                        </button>
                    </div>
                    <div className="space-y-4">
                        <button
                            onClick={handleGoogleAuth}
                            disabled={loading}
                            className="w-full flex items-center justify-center gap-2 bg-white border border-gray-300 rounded-lg px-4 py-2 text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
                        >
                            <img src="https://www.google.com/favicon.ico" alt="Google" className="w-5 h-5" />
                            {loading ? 'מתחבר...' : 'התחבר עם Google'}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Auth; 