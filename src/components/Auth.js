import React, { useState } from 'react';
import { signInWithPopup, GoogleAuthProvider, signInWithEmailAndPassword, createUserWithEmailAndPassword, signOut } from 'firebase/auth';
import { auth, db } from '../firebase/config';
import { doc, setDoc, getDoc, collection, query, where, getDocs } from 'firebase/firestore';
import { isBrowserExtensionError } from '../utils/errorUtils';
import AuthForm from './auth/AuthForm';
import GoogleAuthButton from './auth/GoogleAuthButton';

const Auth = ({ onAuthSuccess }) => {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [isRegister, setIsRegister] = useState(false);
    const [authMode, setAuthMode] = useState('google'); // 'google' or 'email'

    // המרת שם משתמש לאימייל
    const usernameToEmail = (username) => {
        return `${username}@hotel-manager.com`.toLowerCase();
    };

    const createUserProfile = async (uid, email, username, displayName, photoURL) => {
        try {
            const userRef = doc(db, 'users', uid);
            
            // Check if user already exists
            const existingUser = await getDoc(userRef);
            if (existingUser.exists()) {
                // Update last login only
                await setDoc(userRef, {
                    lastLogin: new Date()
                }, { merge: true });
                return true;
            }
            
            // Create new user
            await setDoc(userRef, {
                email,
                username: username || displayName || email?.split('@')[0],
                displayName: displayName || username || email?.split('@')[0],
                photoURL: photoURL || '',
                apartments: {}, // Will be populated when user creates or joins apartments
                createdAt: new Date(),
                lastLogin: new Date()
            });
            return true;
        } catch (error) {
            console.error('Error creating user profile:', error);
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
                await createUserProfile(
                    result.user.uid,
                    result.user.email,
                    null,
                    result.user.displayName,
                    result.user.photoURL
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
                // יצירת משתמש חדש - Firebase יטפל ברמת המערכת בבדיקת ייחודיות האימייל
                userCredential = await createUserWithEmailAndPassword(auth, email, password);
                
                // צור פרופיל משתמש חדש אחרי שהמשתמש מחובר
                try {
                    await createUserProfile(
                        userCredential.user.uid,
                        email,
                        username,
                        username,
                        ''
                    );
                } catch (profileError) {
                    console.warn('Profile creation failed, but user was created:', profileError);
                    // אל תמנע מהמשתמש להתחבר אם יצירת הפרופיל נכשלה
                }
            } else {
                userCredential = await signInWithEmailAndPassword(auth, email, password);
            }
            
            onAuthSuccess?.(userCredential.user);
        } catch (error) {
            // Ignore browser extension interference
            if (isBrowserExtensionError(error)) {
                console.warn('🔌 Browser extension interference in email auth, ignoring:', error.message);
                return;
            }
            
            console.error('Auth error:', error);
            
            // Handle Firebase permission errors specifically
            if (error.message && error.message.includes('Missing or insufficient permissions')) {
                setError('רענן את הדף ונסה שוב. אם הבעיה נמשכת, נסה חלון פרטי');
            } else {
                setError(getErrorMessage(error.code));
            }
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
                return 'סיסמה שגויה';
            case 'auth/too-many-requests':
                return 'יותר מדי ניסיונות התחברות. נסה שוב מאוחר יותר';
            case 'auth/user-disabled':
                return 'החשבון הושבת. אנא פנה למנהל המערכת';
            case 'auth/requires-recent-login':
                return 'יש צורך בהתחברות מחדש לביצוע פעולה זו';
            case 'permission-denied':
            case 'missing-permissions':
                return 'רענן את הדף ונסה שוב. אם הבעיה נמשכת, נסה חלון פרטי';
            default:
                return 'שגיאה בהתחברות. נסה שוב';
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

    if (authMode === 'google') {
        return (
            <GoogleAuthButton 
                onGoogleAuth={handleGoogleAuth}
                loading={loading}
                onSwitchToEmail={() => setAuthMode('email')}
            />
        );
    }

    return (
        <AuthForm
            username={username}
            setUsername={setUsername}
            password={password}
            setPassword={setPassword}
            isRegister={isRegister}
            setIsRegister={setIsRegister}
            loading={loading}
            error={error}
            onSubmit={handleEmailAuth}
            onSwitchToGoogle={() => setAuthMode('google')}
        />
    );
};

export default Auth; 