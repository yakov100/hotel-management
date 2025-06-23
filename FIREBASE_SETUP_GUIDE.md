# 🔥 מדריך הגדרת Firebase - שלב אחר שלב

## שלב 1: כניסה ל-Firebase Console

1. לך ל-[Firebase Console](https://console.firebase.google.com/)
2. התחבר עם חשבון Google שלך

## שלב 2: יצירת פרויקט

### אם אין לך פרויקט:
1. לחץ על **"Create a project"**
2. תן שם לפרויקט (למשל: "hotel-management")
3. לחץ על **"Continue"**
4. בחר אם להפעיל Google Analytics (אופציונלי)
5. לחץ על **"Create project"**

### אם יש לך פרויקט:
1. בחר את הפרויקט מהרשימה

## שלב 3: הוספת אפליקציה

1. בדף הראשי של הפרויקט, לחץ על **"Add app"** (סמל `</>`)
2. בחר **Web** (סמל `</>`)
3. תן שם לאפליקציה (למשל: "hotel-web-app")
4. לחץ על **"Register app"**

## שלב 4: קבלת פרטי הקונפיגורציה

לאחר הרישום, Firebase יציג לך קוד שנראה כך:

```javascript
const firebaseConfig = {
  apiKey: "AIzaSyC-xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx",
  authDomain: "your-project.firebaseapp.com",
  projectId: "your-project-id",
  storageBucket: "your-project.appspot.com",
  messagingSenderId: "123456789012",
  appId: "1:123456789012:web:abcdef1234567890"
};
```

**העתק את הערכים האלה!**

## שלב 5: הגדרת משתני סביבה

### אופציה א': שימוש בסקריפט (מומלץ)
```bash
npm run setup-env
```
הסקריפט יבקש ממך את הערכים אחד אחד.

### אופציה ב': יצירה ידנית
צור קובץ `.env` בתיקיית הפרויקט עם התוכן הבא:

```env
# Firebase Configuration
FIREBASE_API_KEY=AIzaSyC-xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
FIREBASE_PROJECT_ID=your-project-id
FIREBASE_STORAGE_BUCKET=your-project.appspot.com
FIREBASE_MESSAGING_SENDER_ID=123456789012
FIREBASE_APP_ID=1:123456789012:web:abcdef1234567890

# React App Firebase Configuration
REACT_APP_FIREBASE_API_KEY=AIzaSyC-xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
REACT_APP_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
REACT_APP_FIREBASE_PROJECT_ID=your-project-id
REACT_APP_FIREBASE_STORAGE_BUCKET=your-project.appspot.com
REACT_APP_FIREBASE_MESSAGING_SENDER_ID=123456789012
REACT_APP_FIREBASE_APP_ID=1:123456789012:web:abcdef1234567890
```

## שלב 6: הפעלת Firestore Database

1. בתפריט הצד, לחץ על **"Firestore Database"**
2. לחץ על **"Create database"**
3. בחר **"Start in test mode"** (לפיתוח)
4. בחר מיקום (למשל: `us-central1`)
5. לחץ על **"Done"**

## שלב 7: הגדרת כללי אבטחה

1. בלשונית **"Rules"** ב-Firestore
2. החלף את הכללים עם התוכן מ-`firestore.rules`
3. לחץ על **"Publish"**

## שלב 8: בדיקת החיבור

1. הפעל את האפליקציה:
```bash
npm start
```

2. פתח את Developer Tools (F12)
3. בדוק שאין שגיאות Firebase בקונסול

## 🔧 פתרון בעיות נפוצות

### שגיאה: "Firebase App named '[DEFAULT]' already exists"
**פתרון:** ודא שיש רק אפליקציה אחת מוגדרת

### שגיאה: "Permission denied"
**פתרון:** בדוק שכללי האבטחה מוגדרים נכון

### שגיאה: "API key not valid"
**פתרון:** ודא שהעתקת את ה-API key נכון

## 📋 רשימת בדיקה

- [ ] יצרת פרויקט Firebase
- [ ] הוספת אפליקציה Web
- [ ] העתקת פרטי הקונפיגורציה
- [ ] יצרת קובץ `.env`
- [ ] הפעלת Firestore Database
- [ ] הגדרת כללי אבטחה
- [ ] בדקת שהאפליקציה עובדת

## 🎉 סיום

לאחר השלמת כל השלבים, תוכל להשתמש ב-Firebase MCP עם Cursor!

**דוגמאות שימוש:**
```
הצג לי את כל ההזמנות
הוסף הזמנה חדשה
עדכן פרטי אורח
``` 