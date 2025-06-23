# מדריך שליחת מיילים דרך Firebase Functions

## איך זה עובד

המערכת משתמשת ב-Firebase Functions לשליחת מיילים אמיתיים לאורחים. כאשר לוחצים על כפתור "📧 מייל" בניהול האורחים, הפעולה הבאה מתרחשת:

1. **המערכת שולחת בקשה** ל-Firebase Functions
2. **הפונקציה בענן** מקבלת את הנתונים ושולחת מייל
3. **המייל נשלח** מכתובת Gmail המוגדרת לכתובת האורח
4. **המערכת מקבלת אישור** על שליחה מוצלחת

## הגדרות נוכחיות

המיילים נשלחים מכתובת: `yafried100@gmail.com`

הנוסח הנוכחי:
- **נושא**: "מחכים לך!"
- **תוכן**: "שלום [שם האורח], מחכים לך! בברכה, צוות דירת הנופש"

## שימוש במערכת

### בניהול האורחים:
1. לחץ על כפתור "📧 מייל" ליד האורח
2. המערכת תשלח מייל אוטומטית
3. תקבל הודעת אישור או שגיאה

### דרישות:
- האורח חייב להיות עם כתובת מייל תקינה
- חיבור לאינטרנט
- Firebase Functions פעיל

## פתרון בעיות

### "שגיאה בשליחת המייל"
- בדוק חיבור לאינטרנט
- ודא שכתובת המייל תקינה
- בדוק את ה-Console בדפדפן לפרטים

### המייל לא מגיע
- בדוק תיקיית SPAM/זבל
- ודא שכתובת המייל נכונה
- המייל יכול להיות מעוכב בשרתי המייל

### שגיאות טכניות
- בדוק שה-Firebase Functions פעיל
- ודא שיש הרשאות מתאימות
- בדוק לוגים ב-Firebase Console

## עלויות

- **Firebase Functions**: חינם עד 2 מיליון קריאות בחודש
- **Gmail SMTP**: חינם עד 500 מיילים ביום
- לשימוש מסחרי רחב יותר - שקול שדרוג

## התאמה אישית

לשינוי הנוסח או כתובת השולח, ערוך את הקובץ:
`functions/index.js` - פונקציית `sendEmailToGuest`

אחרי שינויים, הרץ:
```bash
firebase deploy --only functions
``` 