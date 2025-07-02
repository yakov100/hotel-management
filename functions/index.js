/**
 * Import function triggers from their respective submodules:
 *
 * const {onCall} = require("firebase-functions/v2/https");
 * const {onDocumentWritten} = require("firebase-functions/v2/firestore");
 *
 * See a full list of supported triggers at https://firebase.google.com/docs/functions
 */

const functions = require("firebase-functions");
const admin = require("firebase-admin");
const nodemailer = require("nodemailer");
const { onDocumentCreated } = require("firebase-functions/v2/firestore");
const { onCall } = require("firebase-functions/v2/https");

// Import email scheduler functions
const emailScheduler = require('./emailScheduler');

// Create and deploy your first functions
// https://firebase.google.com/docs/functions/get-started

// exports.helloWorld = onRequest((request, response) => {
//   logger.info("Hello logs!", {structuredData: true});
//   response.send("Hello from Firebase!");
// });

// Initialize Firebase Admin SDK - check if already initialized
if (!admin.apps.length) {
  admin.initializeApp();
}

const gmailEmail = "yafried100@gmail.com";
const gmailPassword = "ceyb mpae pnrw xakw"; // הכנס כאן את סיסמת האפליקציה של Gmail

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: gmailEmail,
    pass: gmailPassword,
  },
});

// נוסיף פונקציית עזר חדשה בתחילת הקובץ
const getAllNotificationEmails = async (apartmentId = null) => {
  try {
    // הוספת כתובת המייל הראשית כברירת מחדל
    const emails = [gmailEmail]; // כתובת ברירת המחדל
    
    // אם יש apartmentId, נקרא את ההגדרות מהדירה
    if (apartmentId) {
      const apartmentDoc = await admin.firestore().collection('apartments').doc(apartmentId).get();
      if (apartmentDoc.exists) {
        const apartmentData = apartmentDoc.data();
        const settings = apartmentData.settings || {};
        
        console.log('Settings found for apartment:', apartmentId, JSON.stringify(settings, null, 2));
        
        // הוספת האימייל הראשי מההגדרות אם קיים
        if (settings.email) {
          emails.push(settings.email);
          console.log('Added main email from settings:', settings.email);
        }
        
        // הוספת כתובות נוספות מההגדרות
        if (settings.additionalEmails && Array.isArray(settings.additionalEmails)) {
          emails.push(...settings.additionalEmails);
          console.log('Added additional emails from settings:', settings.additionalEmails);
        }
      } else {
        console.log('No apartment document found for ID:', apartmentId);
      }
    } else {
      // נסיון חזרה למיקום הישן (לתאימות לאחור)
      const settingsDoc = await admin.firestore().collection('settings').doc('general').get();
      const settings = settingsDoc.data() || {};
      
      // הוספת האימייל הראשי מההגדרות אם קיים
      if (settings.email) {
        emails.push(settings.email);
      }
      
      // הוספת כתובות נוספות מההגדרות
      if (settings.additionalEmails && Array.isArray(settings.additionalEmails)) {
        emails.push(...settings.additionalEmails);
      }
    }
    
    // הסרת כפילויות וכתובות ריקות
    const finalEmails = [...new Set(emails.filter(email => email && email.trim()))];
    console.log('Final notification emails:', finalEmails);
    return finalEmails;
  } catch (error) {
    console.error('שגיאה בקבלת כתובות מייל להתראות:', error);
    return [gmailEmail]; // במקרה של שגיאה, החזרת כתובת ברירת המחדל
  }
};

exports.sendGuestEmail = onDocumentCreated("guests/{guestId}", async (event) => {
  const guest = event.data.data();
  const notificationEmails = await getAllNotificationEmails(guest.apartmentId);
  
  const mailOptions = {
    from: gmailEmail,
    to: notificationEmails.join(', '), // שליחה לכל הכתובות
    subject: "אורח חדש נוסף!",
    text: `אורח חדש: ${guest.guestName || guest.name}, טלפון: ${guest.phone || ""}, אימייל: ${guest.email || ""}`,
  };
  
  await transporter.sendMail(mailOptions);
});

exports.sendBookingEmail = onDocumentCreated("bookings/{bookingId}", async (event) => {
  const booking = event.data.data();
  const notificationEmails = await getAllNotificationEmails(booking.apartmentId);
  
  // הדפסת המידע לדיבוג
  console.log('Booking data received:', JSON.stringify(booking, null, 2));
  
  // פרמוט התאריכים
  let checkInDate = '';
  let checkOutDate = '';
  
  try {
    if (booking.checkIn) {
      // בודק אם זה Timestamp של Firebase
      if (booking.checkIn.toDate && typeof booking.checkIn.toDate === 'function') {
        const d = booking.checkIn.toDate();
        checkInDate = `${d.toLocaleDateString('he-IL')} ${d.toLocaleTimeString('he-IL', { hour: '2-digit', minute: '2-digit' })}`;
      } else if (booking.checkIn instanceof Date) {
        checkInDate = `${booking.checkIn.toLocaleDateString('he-IL')} ${booking.checkIn.toLocaleTimeString('he-IL', { hour: '2-digit', minute: '2-digit' })}`;
      } else {
        const d = new Date(booking.checkIn);
        checkInDate = `${d.toLocaleDateString('he-IL')} ${d.toLocaleTimeString('he-IL', { hour: '2-digit', minute: '2-digit' })}`;
      }
    }
    
    if (booking.checkOut) {
      // בודק אם זה Timestamp של Firebase
      if (booking.checkOut.toDate && typeof booking.checkOut.toDate === 'function') {
        const d = booking.checkOut.toDate();
        checkOutDate = `${d.toLocaleDateString('he-IL')} ${d.toLocaleTimeString('he-IL', { hour: '2-digit', minute: '2-digit' })}`;
      } else if (booking.checkOut instanceof Date) {
        checkOutDate = `${booking.checkOut.toLocaleDateString('he-IL')} ${booking.checkOut.toLocaleTimeString('he-IL', { hour: '2-digit', minute: '2-digit' })}`;
      } else {
        const d = new Date(booking.checkOut);
        checkOutDate = `${d.toLocaleDateString('he-IL')} ${d.toLocaleTimeString('he-IL', { hour: '2-digit', minute: '2-digit' })}`;
      }
    }
  } catch (error) {
    console.error('Error formatting dates:', error);
    console.log('Raw checkIn:', booking.checkIn);
    console.log('Raw checkOut:', booking.checkOut);
    checkInDate = booking.checkIn ? booking.checkIn.toString() : '';
    checkOutDate = booking.checkOut ? booking.checkOut.toString() : '';
  }
  
  console.log('Formatted dates - checkIn:', checkInDate, 'checkOut:', checkOutDate);
  
  // הכנת תוכן המייל
  let emailContent = `הוזנה הזמנה חדשה!

פרטי ההזמנה:
🏠 אורח: ${booking.guestName || 'לא צוין'}
📞 טלפון: ${booking.guestPhone || 'לא צוין'}
✉️ מייל: ${booking.guestEmail || 'לא צוין'}
📅 תאריך כניסה: ${checkInDate}
📅 תאריך יציאה: ${checkOutDate}
📊 סטטוס: ${booking.status === 'confirmed' ? 'מאושר' : booking.status === 'pending' ? 'ממתין' : booking.status === 'cancelled' ? 'בוטל' : booking.status || 'לא צוין'}`;

  // הוספת הערות אם יש
  if (booking.notes && booking.notes.trim()) {
    emailContent += `\n📝 הערות: ${booking.notes}`;
  }

  emailContent += `\n\n---\nמערכת ניהול דירת הנופש`;

  const mailOptions = {
    from: gmailEmail,
    to: notificationEmails.join(', '), // שליחה לכל הכתובות
    subject: "🏠 הזמנה חדשה נוספה למערכת",
    text: emailContent,
    html: `
      <div style="font-family: Arial, sans-serif; direction: rtl; text-align: right; max-width: 600px; margin: 0 auto;">
        <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 20px; border-radius: 10px 10px 0 0;">
          <h2 style="margin: 0;">🏠 הזמנה חדשה נוספה!</h2>
        </div>
        
        <div style="background: #f8f9fa; padding: 20px; border: 1px solid #e9ecef; border-radius: 0 0 10px 10px;">
          <h3 style="color: #495057; margin-top: 0;">פרטי ההזמנה:</h3>
          
          <div style="background: white; padding: 15px; border-radius: 8px; margin-bottom: 15px; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
            <p style="margin: 5px 0;"><strong>🏠 שם האורח:</strong> ${booking.guestName || 'לא צוין'}</p>
            <p style="margin: 5px 0;"><strong>📞 טלפון:</strong> ${booking.guestPhone || 'לא צוין'}</p>
            <p style="margin: 5px 0;"><strong>✉️ מייל:</strong> ${booking.guestEmail || 'לא צוין'}</p>
          </div>
          
          <div style="background: white; padding: 15px; border-radius: 8px; margin-bottom: 15px; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
            <p style="margin: 5px 0;"><strong>📅 תאריך כניסה:</strong> ${checkInDate}</p>
            <p style="margin: 5px 0;"><strong>📅 תאריך יציאה:</strong> ${checkOutDate}</p>
            <p style="margin: 5px 0;"><strong>📊 סטטוס:</strong> 
              <span style="padding: 3px 8px; border-radius: 12px; font-size: 12px; 
                ${booking.status === 'confirmed' ? 'background: #d4edda; color: #155724;' : 
                  booking.status === 'pending' ? 'background: #fff3cd; color: #856404;' : 
                  booking.status === 'cancelled' ? 'background: #f8d7da; color: #721c24;' : 
                  'background: #e2e3e5; color: #383d41;'}">
                ${booking.status === 'confirmed' ? 'מאושר' : booking.status === 'pending' ? 'ממתין' : booking.status === 'cancelled' ? 'בוטל' : booking.status || 'לא צוין'}
              </span>
            </p>
          </div>
          
          ${booking.notes && booking.notes.trim() ? `
          <div style="background: #fff3cd; padding: 15px; border-radius: 8px; border-right: 4px solid #ffc107;">
            <p style="margin: 0;"><strong>📝 הערות:</strong></p>
            <p style="margin: 10px 0 0 0; font-style: italic;">${booking.notes}</p>
          </div>
          ` : ''}
          
          <hr style="margin: 20px 0; border: none; border-top: 1px solid #dee2e6;">
          <p style="text-align: center; color: #6c757d; font-size: 12px; margin: 0;">
            מערכת ניהול דירת הנופש • ${new Date().toLocaleDateString('he-IL')}
          </p>
        </div>
      </div>
    `
  };
  await transporter.sendMail(mailOptions);
});

exports.sendTaskEmail = onDocumentCreated("tasks/{taskId}", async (event) => {
  const task = event.data.data();
  const notificationEmails = await getAllNotificationEmails(task.apartmentId);
  
  const mailOptions = {
    from: gmailEmail,
    to: notificationEmails.join(', '), // שליחה לכל הכתובות
    subject: "משימה חדשה נוספה!",
    text: `משימה חדשה: ${task.title || ""}, תיאור: ${task.description || ""}, עדיפות: ${task.priority || ""}, סטטוס: ${task.status || ""}`,
  };
  
  await transporter.sendMail(mailOptions);
});

exports.sendReminderEmail = onDocumentCreated("reminders/{reminderId}", async (event) => {
  const reminder = event.data.data();
  const notificationEmails = await getAllNotificationEmails(reminder.apartmentId);
  
  const mailOptions = {
    from: gmailEmail,
    to: notificationEmails.join(', '), // שליחה לכל הכתובות
    subject: "תזכורת חדשה נוספה!",
    text: `תזכורת חדשה: ${reminder.title || ""}, תיאור: ${reminder.description || ""}, תאריך: ${reminder.date || ""}`,
  };
  
  await transporter.sendMail(mailOptions);
});

// פונקציה לשליחת מייל לאורח
exports.sendEmailToGuest = onCall(async (request) => {
  try {
    const { guestEmail, guestName, subject = "מחכים לך!", message, checkInTime, checkInTimeStr, checkOutTime } = request.data;
    
    console.log('📨 נתוני הבקשה שהתקבלו:', {
      guestEmail,
      guestName,
      subject,
      message,
      checkInTime,
      checkInTimeStr,
      checkOutTime
    });
    
    // נשתמש בשעה כמחרוזת אם היא קיימת, אחרת ננסה להשתמש בשעה מהתאריך המלא
    const timeToUse = checkInTimeStr || checkInTime;
    
    console.log('🕒 שעה לשימוש:', timeToUse);
    
    // בדיקת נתונים
    if (!guestEmail) {
      throw new functions.https.HttpsError('invalid-argument', 'כתובת מייל נדרשת');
    }

    // עיבוד שעת הצ'ק אין
    let formattedCheckInTime = '';
    let formattedCheckOutTime = '';
    
    if (timeToUse) {
      console.log('שעת צ׳ק-אין מקורית:', timeToUse);
      
      // מנקה את הפורמט מסוגריים מסולסלות אם קיימות
      formattedCheckInTime = timeToUse.toString().replace(/{|}/g, '');
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

    // עיבוד שעת הצ'ק אאוט
    if (checkOutTime) {
      console.log('שעת צ׳ק-אאוט מקורית:', checkOutTime);
      
      formattedCheckOutTime = checkOutTime.toString().replace(/{|}/g, '');
      formattedCheckOutTime = formattedCheckOutTime.replace('.', ':');
      
      if (!formattedCheckOutTime.match(/^\d{2}:\d{2}$/)) {
        formattedCheckOutTime = 'טרם נקבע';
      }
    } else {
      formattedCheckOutTime = 'טרם נקבע';
    }
    
    console.log('שעת צ׳ק-אין סופית:', formattedCheckInTime);
    console.log('שעת צ׳ק-אאוט סופית:', formattedCheckOutTime);

    // הגדרת תוכן המייל
    const mailOptions = {
      from: gmailEmail,
      to: guestEmail,
      subject: subject,
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
                ${guestName ? `שלום ${guestName},` : 'שלום,'} אנחנו מתרגשים לקבל את פניכם בדירת הנופש שלנו! 🌟
              </p>
              <p style="margin: 10px 0 0 0; font-size: 16px; line-height: 1.6;">
                הכל מוכן ומחכה לכם - המיטות מוצעות, המטבח מצויד, והבית מלא באהבה ובציפייה לביקורכם.
              </p>
            </div>

            <!-- פרטי הגעה -->
            <div style="background: white; padding: 20px; border-radius: 8px; margin-bottom: 15px; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
              <h3 style="margin: 0 0 15px 0; color: #4a5568; border-bottom: 2px solid #667eea; padding-bottom: 8px; display: inline-block;">
                📍 פרטי הגעה ושהייה
              </h3>
              <div style="margin: 15px 0;">
                <p style="margin: 5px 0; font-size: 16px;">
                  <strong>כתובת:</strong> נתיבות המשפט 22 מודיעין עילית
                </p>
                <p style="margin: 5px 0; font-size: 16px;">
                  <strong>כניסה:</strong> על ידי קוד
                </p>
                <p style="margin: 5px 0; font-size: 16px;">
                  <strong>צ'ק-אין:</strong> <span style="color: #2b6cb0;">${formattedCheckInTime}</span>
                </p>
                <p style="margin: 5px 0; font-size: 16px;">
                  <strong>צ'ק-אאוט:</strong> <span style="color: #2b6cb0;">${formattedCheckOutTime}</span>
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

${guestName ? `שלום ${guestName},` : 'שלום,'} אנחנו מתרגשים לקבל את פניכם בדירת הנופש שלנו!
הכל מוכן ומחכה לכם - המיטות מוצעות, המטבח מצויד, והבית מלא באהבה ובציפייה לביקורכם.

📍 פרטי הגעה ושהייה:
כתובת: נתיבות המשפט 22 מודיעין עילית
כניסה: על ידי קוד
צ'ק-אין: ${formattedCheckInTime}
צ'ק-אאוט: ${formattedCheckOutTime}

אם יש לכם שאלות או אם אתם זקוקים לעזרה כלשהי, אל תהססו לפנות אלינו בכל עת.
אנחנו מאחלים לכם נופש נפלא ומרגיע! תיהנו מכל רגע 😊

סוויטה בעיר
${new Date().toLocaleDateString('he-IL')}`
    };

    // שליחת המייל
    const result = await transporter.sendMail(mailOptions);
    
    console.log('Email sent successfully:', result.messageId);
    
    return {
      success: true,
      messageId: result.messageId,
      message: `מייל נשלח בהצלחה ל-${guestEmail}`
    };
    
  } catch (error) {
    console.error('Error sending email:', error);
    throw new functions.https.HttpsError('internal', `שגיאה בשליחת המייל: ${error.message}`);
  }
});

// Export email scheduler functions
exports.scheduleEmail = emailScheduler.scheduleEmail;
exports.sendEmail = emailScheduler.sendEmail;
exports.cancelScheduledEmail = emailScheduler.cancelScheduledEmail;
exports.processScheduledEmails = emailScheduler.processScheduledEmails;
exports.cleanupOldEmails = emailScheduler.cleanupOldEmails;
