# Vacation Rental Manager

מערכת ניהול הזמנות לבתי נופש עם Firebase ו-React.

## תכונות

- 📅 ניהול הזמנות
- 👥 ניהול אורחים
- 💰 ניהול פיננסים
- 🛠️ ניהול תחזוקה
- 📊 דוחות וסטטיסטיקות
- 🎨 ממשק משתמש מודרני עם Tailwind CSS

## התקנה מהירה

### 1. התקן תלויות
```bash
npm install
```

### 2. הגדר Firebase
1. צור פרויקט Firebase חדש
2. העתק את פרטי הקונפיגורציה
3. עדכן את הקובץ `.env` עם הפרטים שלך

### 3. הפעל את האפליקציה
```bash
npm start
```

## Firebase MCP Integration

הפרויקט כולל אינטגרציה עם Firebase באמצעות MCP (Model Context Protocol) עבור Cursor.

### התקנת MCP
```bash
npm run setup-mcp
```

### הגדרת MCP ב-Cursor
1. פתח את Cursor
2. לך ל-Settings (Ctrl/Cmd + ,)
3. חפש "MCP" או "Model Context Protocol"
4. הוסף את הנתיב לקובץ `mcp-config.json`

### כלים זמינים
- `get_collection` - קבלת כל המסמכים מקולקציה
- `add_document` - הוספת מסמך חדש
- `update_document` - עדכון מסמך קיים
- `delete_document` - מחיקת מסמך
- `query_documents` - שאילתות מורכבות

### דוגמאות שימוש
```
הצג לי את כל ההזמנות לחודש ינואר
הוסף הזמנה חדשה עבור משפחת כהן
עדכן את המחיר של ההזמנה האחרונה
```

## מבנה הפרויקט

```
src/
├── components/          # רכיבי React
│   ├── bookings/       # רכיבי הזמנות
│   ├── common/         # רכיבים משותפים
│   └── Sidebar.js      # תפריט צד
├── firebase/           # קונפיגורציית Firebase
├── hooks/              # React Hooks
├── utils/              # פונקציות עזר
└── views/              # דפי האפליקציה
```

## פיתוח

### הפעלת שרת פיתוח
```bash
npm start
```

### בנייה לפרודקשן
```bash
npm run build
```

### פריסה ל-Firebase
```bash
npm run build-deploy
```

## תלויות עיקריות

- React 18
- Firebase 10
- Tailwind CSS
- Recharts (גרפים)
- date-fns (ניהול תאריכים)
- xlsx (ייצוא לאקסל)

## אבטחה

⚠️ **חשוב**: אל תשמור את מפתחות Firebase בקוד. השתמש במשתני סביבה.

## תמיכה

לפרטים נוספים על הגדרת MCP, ראה `MCP_SETUP.md`.

## Contributing

1. Fork the repository
2. Create your feature branch
3. Commit your changes
4. Push to the branch
5. Create a new Pull Request

## License

This project is licensed under the MIT License. 