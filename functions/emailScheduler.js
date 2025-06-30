const functions = require('firebase-functions');
const { onSchedule } = require('firebase-functions/v2/scheduler');
const { onCall } = require('firebase-functions/v2/https');
const admin = require('firebase-admin');
const nodemailer = require('nodemailer');

// Initialize Firebase Admin SDK - check if already initialized
if (!admin.apps.length) {
  admin.initializeApp();
}

const db = admin.firestore();

// Configure email transporter using the same settings as index.js
const gmailEmail = "yafried100@gmail.com";
const gmailPassword = "ceyb mpae pnrw xakw";

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: gmailEmail,
    pass: gmailPassword
  }
});

// Function to get all notification emails from settings
const getAllNotificationEmails = async () => {
  try {
    // Get settings from Firestore
    const settingsDoc = await admin.firestore().collection('settings').doc('general').get();
    const settings = settingsDoc.data() || {};
    
    // Add main email and additional emails
    const emails = [gmailEmail]; // Default email
    
    // Add main email from settings if exists
    if (settings.email) {
      emails.push(settings.email);
    }
    
    // Add additional emails from settings
    if (settings.additionalEmails && Array.isArray(settings.additionalEmails)) {
      emails.push(...settings.additionalEmails);
    }
    
    // Remove duplicates and empty emails
    return [...new Set(emails.filter(email => email && email.trim()))];
  } catch (error) {
    console.error('Error getting notification emails:', error);
    return [gmailEmail]; // Return default email in case of error
  }
};

// Schedule email function
exports.scheduleEmail = onCall(async (request) => {
  const { data } = request;
  try {
    // Verify user is authenticated
    if (!request.auth) {
      throw new functions.https.HttpsError('unauthenticated', 'User must be authenticated');
    }

    const { to, subject, html, scheduledTime, type, itemId, tenantId } = data;

    // Validate input
    if (!to || !subject || !html || !scheduledTime) {
      throw new functions.https.HttpsError('invalid-argument', 'Missing required fields');
    }

    // Create scheduled email document
    const scheduledEmail = {
      to: Array.isArray(to) ? to : [to],
      subject,
      html,
      scheduledTime: admin.firestore.Timestamp.fromDate(new Date(scheduledTime)),
      type,
      itemId,
      tenantId,
      status: 'scheduled',
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
      createdBy: request.auth.uid
    };

    const docRef = await db.collection('scheduledEmails').add(scheduledEmail);

    return {
      success: true,
      emailId: docRef.id,
      message: 'Email scheduled successfully'
    };

  } catch (error) {
    console.error('Error scheduling email:', error);
    throw new functions.https.HttpsError('internal', 'Failed to schedule email');
  }
});

// Send immediate email function
exports.sendEmail = onCall(async (request) => {
  const { data } = request;
  try {
    // Verify user is authenticated
    if (!request.auth) {
      throw new functions.https.HttpsError('unauthenticated', 'User must be authenticated');
    }

    const { to, subject, html } = data;

    // Validate input
    if (!to || !subject || !html) {
      throw new functions.https.HttpsError('invalid-argument', 'Missing required fields');
    }

    const recipients = Array.isArray(to) ? to : [to];
    
    // Get notification emails if recipients are empty or only contain default
    let finalRecipients = recipients;
    if (!recipients || recipients.length === 0) {
      finalRecipients = await getAllNotificationEmails();
    }
    
    // Send email to each recipient
    const emailPromises = finalRecipients.map(email => {
      return transporter.sendMail({
        from: gmailEmail,
        to: email,
        subject,
        html
      });
    });

    await Promise.all(emailPromises);

    return {
      success: true,
      message: `Email sent to ${finalRecipients.length} recipient(s)`
    };

  } catch (error) {
    console.error('Error sending email:', error);
    throw new functions.https.HttpsError('internal', 'Failed to send email');
  }
});

// Cancel scheduled email function
exports.cancelScheduledEmail = onCall(async (request) => {
  const { data } = request;
  try {
    // Verify user is authenticated
    if (!request.auth) {
      throw new functions.https.HttpsError('unauthenticated', 'User must be authenticated');
    }

    const { emailId } = data;

    if (!emailId) {
      throw new functions.https.HttpsError('invalid-argument', 'Email ID is required');
    }

    // Update email status to cancelled
    await db.collection('scheduledEmails').doc(emailId).update({
      status: 'cancelled',
      cancelledAt: admin.firestore.FieldValue.serverTimestamp(),
      cancelledBy: request.auth.uid
    });

    return {
      success: true,
      message: 'Email cancelled successfully'
    };

  } catch (error) {
    console.error('Error cancelling email:', error);
    throw new functions.https.HttpsError('internal', 'Failed to cancel email');
  }
});

// Scheduled function to process emails (runs every minute)
exports.processScheduledEmails = onSchedule('every 1 minutes', async (event) => {
  try {
    const now = admin.firestore.Timestamp.now();
    
    // Query for emails that should be sent
    const query = await db.collection('scheduledEmails')
      .where('status', '==', 'scheduled')
      .where('scheduledTime', '<=', now)
      .limit(50) // Process max 50 emails per run
      .get();

    if (query.empty) {
      console.log('No scheduled emails to process');
      return null;
    }

    const emailPromises = query.docs.map(async (doc) => {
      const emailData = doc.data();
      
      try {
        // Send email to each recipient
        let recipients = emailData.to;
        
        // Get notification emails if recipients are empty
        if (!recipients || recipients.length === 0) {
          recipients = await getAllNotificationEmails();
        }
        
        const emailPromises = recipients.map(email => {
          return transporter.sendMail({
            from: gmailEmail,
            to: email,
            subject: emailData.subject,
            html: emailData.html
          });
        });

        await Promise.all(emailPromises);

        // Update status to sent
        await doc.ref.update({
          status: 'sent',
          sentAt: admin.firestore.FieldValue.serverTimestamp()
        });

        console.log(`Email ${doc.id} sent successfully to ${recipients.length} recipient(s)`);

      } catch (error) {
        console.error(`Failed to send email ${doc.id}:`, error);
        
        // Update status to failed
        await doc.ref.update({
          status: 'failed',
          error: error.message,
          failedAt: admin.firestore.FieldValue.serverTimestamp()
        });
      }
    });

    await Promise.all(emailPromises);
    console.log(`Processed ${query.docs.length} scheduled emails`);

    return null;

  } catch (error) {
    console.error('Error processing scheduled emails:', error);
    return null;
  }
});

// Clean up old emails (runs daily at midnight)
exports.cleanupOldEmails = onSchedule('0 0 * * *', async (event) => {
  try {
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    
    const query = await db.collection('scheduledEmails')
      .where('createdAt', '<', admin.firestore.Timestamp.fromDate(thirtyDaysAgo))
      .limit(500)
      .get();

    if (query.empty) {
      console.log('No old emails to clean up');
      return null;
    }

    const batch = db.batch();
    query.docs.forEach(doc => {
      batch.delete(doc.ref);
    });

    await batch.commit();
    console.log(`Cleaned up ${query.docs.length} old email records`);

    return null;

  } catch (error) {
    console.error('Error cleaning up old emails:', error);
    return null;
  }
}); 