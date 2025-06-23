import { httpsCallable } from 'firebase/functions';
import { functions } from '../firebase/config';

// יצירת קישור לפונקציית Firebase
const sendEmailToGuestFunction = httpsCallable(functions, 'sendEmailToGuest');

// פונקציה לשליחת מייל אמיתי לאורח דרך Firebase Functions
export const sendEmailToGuest = async (guestEmail, guestName = '', subject = 'מחכים לך!', message = '', checkInTime = '', checkInTimeStr = '') => {
    try {
        console.log('🚀 emailUtils - פרמטרים שהתקבלו:', {
            guestEmail,
            guestName,
            subject,
            message,
            checkInTime,
            checkInTimeStr
        });

        const dataToSend = {
            guestEmail,
            guestName,
            subject,
            message,
            checkInTime,
            checkInTimeStr
        };

        console.log('📤 emailUtils - נתונים שנשלחים ל-Firebase:', dataToSend);

        const result = await sendEmailToGuestFunction(dataToSend);

        console.log('✅ emailUtils - תגובה מ-Firebase:', result.data);
        return { success: true, result: result.data };
    } catch (error) {
        console.error('❌ emailUtils - שגיאה:', error);
        return { 
            success: false, 
            error: error.message || 'שגיאה בשליחת המייל'
        };
    }
};

// פונקציה לבדיקת תקינות כתובת מייל
export const isValidEmail = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
};

// פונקציה לשליחת מייל עם נוסח מותאם אישית
export const sendCustomEmailToGuest = async (guestEmail, guestName, subject, message) => {
    return await sendEmailToGuest(guestEmail, guestName, subject, message);
};

// פונקציה לבדיקה אם שירות המייל זמין (תמיד true עם Firebase)
export const isEmailServiceConfigured = () => {
    return true; // Firebase Functions תמיד זמין
}; 