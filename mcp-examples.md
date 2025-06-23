# Firebase MCP Examples

דוגמאות שימוש ב-Firebase MCP עם Cursor.

## דוגמאות בסיסיות

### 1. קבלת כל ההזמנות
```
אני רוצה לראות את כל ההזמנות במערכת
```
**תגובה צפויה:**
```json
[
  {
    "id": "booking1",
    "guestName": "יוסי כהן",
    "checkIn": "2024-01-15",
    "checkOut": "2024-01-20",
    "roomNumber": "101",
    "totalPrice": 1500
  },
  {
    "id": "booking2",
    "guestName": "שרה לוי",
    "checkIn": "2024-01-22",
    "checkOut": "2024-01-25",
    "roomNumber": "102",
    "totalPrice": 1200
  }
]
```

### 2. הוספת הזמנה חדשה
```
הוסף הזמנה חדשה עבור משפחת כהן, 3 לילות מ-15 בינואר, חדר 102, מחיר 1800 ש"ח
```
**תגובה צפויה:**
```
Document added successfully with ID: booking3
```

### 3. עדכון הזמנה
```
עדכן את ההזמנה של משפחת כהן - הוסף ארוחת בוקר והעלה את המחיר ב-200 ש"ח
```
**תגובה צפויה:**
```
Document booking3 updated successfully
```

## דוגמאות מתקדמות

### 4. חיפוש הזמנות לפי תאריך
```
הצג לי את כל ההזמנות לחודש ינואר 2024
```
**שאילתה:**
```javascript
query_documents("bookings", [
  { field: "checkIn", operator: ">=", value: "2024-01-01" },
  { field: "checkIn", operator: "<=", value: "2024-01-31" }
], "checkIn")
```

### 5. חיפוש הזמנות יקרות
```
הצג לי את כל ההזמנות עם מחיר מעל 1000 ש"ח
```
**שאילתה:**
```javascript
query_documents("bookings", [
  { field: "totalPrice", operator: ">", value: 1000 }
], "totalPrice", 10)
```

### 6. חיפוש לפי חדר
```
הצג לי את כל ההזמנות לחדר 101
```
**שאילתה:**
```javascript
query_documents("bookings", [
  { field: "roomNumber", operator: "==", value: "101" }
], "checkIn")
```

## דוגמאות לניהול אורחים

### 7. קבלת כל האורחים
```
הצג לי את רשימת כל האורחים
```
**תגובה צפויה:**
```json
[
  {
    "id": "guest1",
    "name": "יוסי כהן",
    "email": "yossi@example.com",
    "phone": "050-1234567",
    "totalBookings": 5
  }
]
```

### 8. הוספת אורח חדש
```
הוסף אורח חדש: משה לוי, טלפון 052-9876543, אימייל moshe@example.com
```
**תגובה צפויה:**
```
Document added successfully with ID: guest2
```

## דוגמאות לניהול פיננסים

### 9. קבלת כל התשלומים
```
הצג לי את כל התשלומים
```
**תגובה צפויה:**
```json
[
  {
    "id": "payment1",
    "bookingId": "booking1",
    "amount": 1500,
    "date": "2024-01-10",
    "method": "credit_card",
    "status": "completed"
  }
]
```

### 10. חיפוש תשלומים לפי סכום
```
הצג לי את כל התשלומים מעל 1000 ש"ח
```
**שאילתה:**
```javascript
query_documents("payments", [
  { field: "amount", operator: ">", value: 1000 }
], "date")
```

## דוגמאות לניהול תחזוקה

### 11. קבלת כל המשימות
```
הצג לי את כל משימות התחזוקה
```
**תגובה צפויה:**
```json
[
  {
    "id": "task1",
    "title": "תיקון מזגן בחדר 101",
    "description": "המזגן לא עובד",
    "priority": "high",
    "status": "pending",
    "assignedTo": "חשמלאי"
  }
]
```

### 12. הוספת משימת תחזוקה
```
הוסף משימת תחזוקה: ניקוי מזגן בחדר 102, עדיפות נמוכה
```
**תגובה צפויה:**
```
Document added successfully with ID: task2
```

## דוגמאות לשאילתות מורכבות

### 13. הזמנות עם פרטי אורחים
```
הצג לי את כל ההזמנות עם פרטי האורחים
```
**תגובה צפויה:**
```json
[
  {
    "id": "booking1",
    "guestName": "יוסי כהן",
    "guestEmail": "yossi@example.com",
    "guestPhone": "050-1234567",
    "checkIn": "2024-01-15",
    "checkOut": "2024-01-20",
    "roomNumber": "101",
    "totalPrice": 1500
  }
]
```

### 14. סטטיסטיקות הזמנות
```
הצג לי סטטיסטיקות של ההזמנות
```
**תגובה צפויה:**
```json
{
  "totalBookings": 25,
  "totalRevenue": 37500,
  "averageBookingValue": 1500,
  "mostPopularRoom": "101",
  "busiestMonth": "יולי"
}
```

## טיפים לשימוש

### 1. שימוש בשאילתות מורכבות
- השתמש במספר פילטרים יחד
- הוסף מיון לפי שדה רלוונטי
- הגבל את מספר התוצאות

### 2. ניהול שגיאות
- תמיד בדוק שהקולקציה קיימת
- השתמש בשמות שדות נכונים
- ודא שהערכים בפורמט הנכון

### 3. ביצועים
- השתמש בלימיטים לשאילתות גדולות
- הוסף אינדקסים לשדות שמשמשים לשאילתות
- הימנע משליפת כל המסמכים בקולקציה גדולה

## פתרון בעיות נפוצות

### שגיאת חיבור
```
Error: Failed to connect to Firebase
```
**פתרון:** בדוק את משתני הסביבה ב-`.env`

### שגיאת הרשאות
```
Error: Permission denied
```
**פתרון:** בדוק את כללי האבטחה ב-Firestore

### שגיאת שאילתה
```
Error: Invalid query
```
**פתרון:** ודא שהשדות והאופרטורים נכונים 