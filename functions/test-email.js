const functions = require("firebase-functions");
const admin = require("firebase-admin");
const nodemailer = require("nodemailer");

// אתחול Firebase Admin
admin.initializeApp();

const gmailEmail = "yafried100@gmail.com";
const gmailPassword = "ceyb mpae pnrw xakw";

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: gmailEmail,
    pass: gmailPassword,
  },
});

// פונקציית בדיקה לשליחת מייל
async function testSendEmail() {
  try {
    // נדמה קריאה לפונקציה עם שעת צ'ק-אין
    const testData = {
      guestEmail: "test@example.com", // שנה לכתובת מייל אמיתית לבדיקה
      guestName: "אורח בדיקה",
      subject: "מחכים לך!",
      checkInTime: "{14.00}"
    };

    // עיבוד שעת הצ'ק אין
    let formattedCheckInTime = '';
    if (testData.checkInTime) {
      console.log('שעת צ׳ק-אין מקורית:', testData.checkInTime);
      
      // מנקה את הפורמט מסוגריים מסולסלות אם קיימות
      formattedCheckInTime = testData.checkInTime.replace(/{|}/g, '');
      console.log('אחרי הסרת סוגריים:', formattedCheckInTime);
      
      // מחליף נקודה בנקודתיים אם צריך
      formattedCheckInTime = formattedCheckInTime.replace('.', ':');
      console.log('אחרי החלפת נקודה בנקודתיים:', formattedCheckInTime);
      
      // אם אין שעה תקינה, מציג "טרם נקבע"
      if (!formattedCheckInTime.match(/^\d{2}:\d{2}$/)) {
        console.log('פורמט שעה לא תקין');
        formattedCheckInTime = 'טרם נקבע';
      }
    } else {
      console.log('אין שעת צ׳ק-אין');
      formattedCheckInTime = 'טרם נקבע';
    }
    
    console.log('שעת צ׳ק-אין סופית:', formattedCheckInTime);

    // הגדרת תוכן המייל
    const mailOptions = {
      from: gmailEmail,
      to: testData.guestEmail,
      subject: testData.subject,
      html: `
        <div style="font-family: Arial, sans-serif; direction: rtl; text-align: right; max-width: 600px; margin: 0 auto;">
          <!-- כותרת ראשית -->
          <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 20px; border-radius: 10px 10px 0 0;">
            <h2 style="margin: 0; text-align: center;">🏡 ברוכים הבאים!</h2>
          </div>
          
          <div style="background: #f8f9fa; padding: 20px; border: 1px solid #e9ecef; border-radius: 0 0 10px 10px;">
            <!-- ברכת פתיחה -->
            <div style="background: white; padding: 20px; border-radius: 8px; margin-bottom: 15px; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
              <p style="margin: 0; font-size: 16px; line-height: 1.6;">
                אנחנו מתרגשים לקבל את פניכם בדירת הנופש שלנו! 🌟
              </p>
              <p style="margin: 10px 0 0 0; font-size: 16px; line-height: 1.6;">
                הכל מוכן ומחכה לכם - המיטות מוצעות, המטבח מצויד, והבית מלא באהבה ובציפייה לביקורכם.
              </p>
            </div>

            <!-- פרטי הגעה -->
            <div style="background: white; padding: 20px; border-radius: 8px; margin-bottom: 15px; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
              <h3 style="margin: 0 0 15px 0; color: #4a5568; border-bottom: 2px solid #667eea; padding-bottom: 8px; display: inline-block;">
                📍 פרטי הגעה
              </h3>
              <div style="margin: 15px 0;">
                <p style="margin: 5px 0; font-size: 16px;">
                  <strong>כתובת:</strong> נתיבות המשפט 22 מודיעין עילית
                </p>
                <p style="margin: 5px 0; font-size: 16px;">
                  <strong>כניסה:</strong> על ידי קוד
                </p>
                <p style="margin: 5px 0; font-size: 16px;">
                  <strong>צ'ק-אין:</strong> ${formattedCheckInTime}
                </p>
              </div>
            </div>

            <!-- סיום ופרטי קשר -->
            <div style="background: white; padding: 20px; border-radius: 8px; margin-bottom: 15px; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
              <p style="margin: 0; font-size: 16px; line-height: 1.6;">
                אם יש לכם שאלות או אם אתם זקוקים לעזרה כלשהי, אל תהססו לפנות אלינו בכל עת.
              </p>
              <p style="margin: 10px 0 0 0; font-size: 16px; line-height: 1.6;">
                אנחנו מאחלים לכם נופש נפלא ומרגיע! תיהנו מכל רגע 😊
              </p>
            </div>

            <!-- חתימה -->
            <hr style="margin: 20px 0; border: none; border-top: 1px solid #dee2e6;">
            <div style="text-align: center;">
              <p style="margin: 0; color: #4a5568; font-weight: bold; font-size: 18px;">
                סוויטה בעיר
              </p>
              <p style="margin: 5px 0 0 0; color: #718096; font-size: 14px;">
                ${new Date().toLocaleDateString('he-IL')}
              </p>
            </div>
          </div>
        </div>
      `,
      text: `ברוכים הבאים! 🏡

אנחנו מתרגשים לקבל את פניכם בדירת הנופש שלנו!
הכל מוכן ומחכה לכם - המיטות מוצעות, המטבח מצויד, והבית מלא באהבה ובציפייה לביקורכם.

📍 פרטי הגעה:
כתובת: נתיבות המשפט 22 מודיעין עילית
כניסה: על ידי קוד
צ'ק-אין: ${formattedCheckInTime}

אם יש לכם שאלות או אם אתם זקוקים לעזרה כלשהי, אל תהססו לפנות אלינו בכל עת.
אנחנו מאחלים לכם נופש נפלא ומרגיע! תיהנו מכל רגע 😊

סוויטה בעיר
${new Date().toLocaleDateString('he-IL')}`
    };

    // שליחת המייל
    const result = await transporter.sendMail(mailOptions);
    console.log('מייל נשלח בהצלחה:', result.messageId);
    
  } catch (error) {
    console.error('שגיאה בשליחת המייל:', error);
  }
}

// הרצת הבדיקה
testSendEmail(); 