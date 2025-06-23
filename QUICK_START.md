# 🚀 Firebase MCP - התחלה מהירה

## מה זה MCP?
MCP (Model Context Protocol) מאפשר ל-Cursor לגשת ישירות ל-Firebase ולבצע פעולות על הנתונים.

## התקנה מהירה (5 דקות)

### 1. התקן תלויות
```bash
npm install
```

### 2. הגדר משתני סביבה
עדכן את הקובץ `.env` עם פרטי Firebase שלך:
```env
FIREBASE_API_KEY=your-api-key
FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
FIREBASE_PROJECT_ID=your-project-id
FIREBASE_STORAGE_BUCKET=your-project.appspot.com
FIREBASE_MESSAGING_SENDER_ID=your-sender-id
FIREBASE_APP_ID=your-app-id
```

### 3. הגדר MCP ב-Cursor
1. פתח Cursor
2. Settings (Ctrl/Cmd + ,)
3. חפש "MCP"
4. הוסף נתיב: `mcp-config.json`

### 4. הפעל מחדש את Cursor

## שימוש מהיר

### דוגמאות פשוטות
```
הצג לי את כל ההזמנות
הוסף הזמנה חדשה עבור משפחת כהן
עדכן את המחיר של ההזמנה האחרונה
```

### דוגמאות מתקדמות
```
הצג לי הזמנות לחודש ינואר
הצג לי הזמנות יקרות (מעל 1000 ש"ח)
הצג לי הזמנות לחדר 101
```

## כלים זמינים

| כלי | תיאור | דוגמה |
|-----|-------|-------|
| `get_collection` | קבלת כל המסמכים | `get_collection("bookings")` |
| `add_document` | הוספת מסמך חדש | `add_document("bookings", {...})` |
| `update_document` | עדכון מסמך | `update_document("bookings", "id", {...})` |
| `delete_document` | מחיקת מסמך | `delete_document("bookings", "id")` |
| `query_documents` | שאילתה מורכבת | `query_documents("bookings", [...])` |

## פתרון בעיות

### MCP לא עובד?
- בדוק שהקובץ `mcp-config.json` קיים
- ודא שמשתני הסביבה נכונים
- הפעל מחדש את Cursor

### שגיאת Firebase?
- בדוק את פרטי הפרויקט
- ודא שהפרויקט פעיל
- בדוק הרשאות Firestore

## קישורים שימושיים

- 📖 [מדריך מפורט](MCP_SETUP.md)
- 💡 [דוגמאות שימוש](mcp-examples.md)
- 🔧 [פתרון בעיות](MCP_SETUP.md#פתרון-בעיות)

## תמיכה

אם אתה נתקל בבעיות:
1. בדוק את הלוגים של Cursor
2. ודא שכל הקבצים קיימים
3. בדוק את קונפיגורציית Firebase 