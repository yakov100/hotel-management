// Utility functions for handling browser extension interference errors

export const isBrowserExtensionError = (error) => {
    if (!error) return false;
    
    const message = error.message || error.reason?.message || '';
    
    return message.includes('message channel closed') ||
           message.includes('listener indicated an asynchronous response') ||
           message.includes('Extension context invalidated') ||
           message.includes('Could not establish connection') ||
           // Suppress Pegasus transport extension errors
           message.includes('pegasus-transport') ||
           message.includes('No handler registered');
};

export const suppressBrowserExtensionErrors = () => {
    const handleError = (event) => {
        if (isBrowserExtensionError(event.error)) {
            console.warn('🔌 Browser extension interference detected - suppressing error:', event.error.message);
            event.preventDefault();
            return false;
        }
    };

    const handleUnhandledRejection = (event) => {
        if (isBrowserExtensionError(event.reason)) {
            console.warn('🔌 Browser extension promise rejection - suppressing:', event.reason.message);
            event.preventDefault();
            return false;
        }
    };

    window.addEventListener('error', handleError);
    window.addEventListener('unhandledrejection', handleUnhandledRejection);

    return () => {
        window.removeEventListener('error', handleError);
        window.removeEventListener('unhandledrejection', handleUnhandledRejection);
    };
};

export const logBrowserExtensionWarning = () => {
    console.warn(`
🔌 הודעה: זוהתה התערבות של תוספי דפדפן
   
   השגיאות הבאות נחסמו אוטומטית:
   - "message channel closed"
   - "listener indicated an asynchronous response"
   
   זה לא משפיע על פעולת האפליקציה - המערכת פועלת כרגיל!
   
   אם אתה רוצה להפסיק את ההודעות האלה, נסה:
   1. לפתוח חלון פרטי (Incognito/Private)
   2. לכבות תוספים זמנית
   3. להשתמש בדפדפן אחר
   
   ⚠️ השגיאה שראית היא נפוצה ולא משפיעה על תזמון המיילים!
`);
}; 