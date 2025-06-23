# Firebase MCP Setup for Cursor

מדריך זה מסביר כיצד לחבר את Firebase ל-Cursor באמצעות MCP (Model Context Protocol).

## התקנה

### 1. התקן את התלויות
```bash
npm install
```

### 2. הגדר משתני סביבה
עדכן את הקובץ `mcp-config.json` עם פרטי Firebase שלך:

```json
{
  "mcpServers": {
    "firebase": {
      "command": "node",
      "args": ["mcp-firebase.js"],
      "env": {
        "FIREBASE_API_KEY": "your-actual-api-key",
        "FIREBASE_AUTH_DOMAIN": "your-project.firebaseapp.com",
        "FIREBASE_PROJECT_ID": "your-project-id",
        "FIREBASE_STORAGE_BUCKET": "your-project.appspot.com",
        "FIREBASE_MESSAGING_SENDER_ID": "your-sender-id",
        "FIREBASE_APP_ID": "your-app-id"
      }
    }
  }
}
```

### 3. הגדר את MCP ב-Cursor
1. פתח את Cursor
2. לך ל-Settings (Ctrl/Cmd + ,)
3. חפש "MCP" או "Model Context Protocol"
4. הוסף את הנתיב לקובץ `mcp-config.json` שלך

## כלים זמינים

### 1. get_collection
מחזיר את כל המסמכים מקולקציה:
```javascript
// דוגמה: קבלת כל ההזמנות
get_collection("bookings")
```

### 2. add_document
מוסיף מסמך חדש לקולקציה:
```javascript
// דוגמה: הוספת הזמנה חדשה
add_document("bookings", {
  guestName: "יוסי כהן",
  checkIn: "2024-01-15",
  checkOut: "2024-01-20",
  roomNumber: "101",
  totalPrice: 1500
})
```

### 3. update_document
מעדכן מסמך קיים:
```javascript
// דוגמה: עדכון פרטי הזמנה
update_document("bookings", "document-id", {
  totalPrice: 1600,
  notes: "הוספת ארוחת בוקר"
})
```

### 4. delete_document
מוחק מסמך:
```javascript
// דוגמה: מחיקת הזמנה
delete_document("bookings", "document-id")
```

### 5. query_documents
מבצע שאילתה מורכבת:
```javascript
// דוגמה: הזמנות עם מחיר מעל 1000, ממוינות לפי תאריך
query_documents("bookings", [
  { field: "totalPrice", operator: ">", value: 1000 }
], "checkIn", 10)
```

## דוגמאות שימוש

### קבלת כל ההזמנות
```
אני רוצה לראות את כל ההזמנות במערכת
```

### הוספת הזמנה חדשה
```
הוסף הזמנה חדשה עבור משפחת כהן, 3 לילות מ-15 בינואר, חדר 102, מחיר 1800 ש"ח
```

### חיפוש הזמנות לפי תאריך
```
הצג לי את כל ההזמנות לחודש ינואר 2024
```

### עדכון פרטי הזמנה
```
עדכן את ההזמנה של משפחת כהן - הוסף ארוחת בוקר והעלה את המחיר ב-200 ש"ח
```

## פתרון בעיות

### שגיאת חיבור ל-Firebase
- ודא שמשתני הסביבה נכונים
- בדוק שהפרויקט פעיל ב-Firebase Console
- ודא שיש לך הרשאות מתאימות

### שגיאת MCP
- ודא שהקובץ `mcp-firebase.js` קיים
- בדוק שהתלויות הותקנו כראוי
- נסה להפעיל מחדש את Cursor

## אבטחה

⚠️ **חשוב**: אל תשמור את מפתחות Firebase בקוד או בקובץ הקונפיגורציה בקונטרול גרסאות. השתמש במשתני סביבה או בקובץ `.env` נפרד.

## תמיכה

אם אתה נתקל בבעיות, בדוק:
1. לוגים של Firebase Console
2. לוגים של Cursor
3. קונפיגורציית MCP 