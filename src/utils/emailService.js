import { getFunctions, httpsCallable } from 'firebase/functions';
import { isBrowserExtensionError } from './errorUtils';
import { getEmailTemplate } from './email/emailTemplates';
import { 
  calculateEmailSendTime, 
  prepareRecipients, 
  generateEmailSubject 
} from './email/emailUtils';

// Initialize Firebase Functions
const functions = getFunctions();

// Schedule email sending
export const scheduleEmail = async (type, data, emailSettings, tenantInfo) => {
  try {
    const sendTime = calculateEmailSendTime(
      data.date || data.dueDate, 
      emailSettings.emailTime, 
      emailSettings.emailDaysBefore
    );
    
    if (!sendTime || sendTime < new Date()) {
      console.log('Email send time has passed or is invalid');
      return null;
    }
    
    const emailContent = getEmailTemplate(type, data, tenantInfo);
    const recipients = prepareRecipients(tenantInfo);
    const subject = generateEmailSubject(type, data);
    
    // Call Firebase Function to schedule email
    const scheduleEmailFunction = httpsCallable(functions, 'scheduleEmail');
    
    const result = await scheduleEmailFunction({
      to: recipients.length > 0 ? recipients : [], // Will be handled by emailScheduler to use default emails
      subject: subject,
      html: emailContent,
      scheduledTime: sendTime.toISOString(),
      type: type,
      itemId: data.id,
      apartmentId: tenantInfo?.id
    });
    
    console.log('Email scheduled successfully:', result.data);
    return result.data;
    
  } catch (error) {
    // Ignore browser extension interference
    if (isBrowserExtensionError(error)) {
      console.warn('🔌 Browser extension interference in email scheduling, ignoring:', error.message);
      return null;
    }
    console.error('Error scheduling email:', error);
    throw error;
  }
};

// Cancel scheduled email
export const cancelScheduledEmail = async (emailId) => {
  try {
    const cancelEmailFunction = httpsCallable(functions, 'cancelScheduledEmail');
    const result = await cancelEmailFunction({ emailId });
    
    console.log('Email cancelled successfully:', result.data);
    return result.data;
    
  } catch (error) {
    // Ignore browser extension interference
    if (isBrowserExtensionError(error)) {
      console.warn('🔌 Browser extension interference in email cancelling, ignoring:', error.message);
      return null;
    }
    console.error('Error cancelling email:', error);
    throw error;
  }
};

// Send immediate email (for testing)
export const sendImmediateEmail = async (type, data, tenantInfo) => {
  try {
    const emailContent = getEmailTemplate(type, data, tenantInfo);
    const recipients = prepareRecipients(tenantInfo);
    const subject = generateEmailSubject(type, data);
    
    const sendEmailFunction = httpsCallable(functions, 'sendEmail');
    
    const result = await sendEmailFunction({
      to: recipients.length > 0 ? recipients : [], // Will be handled by emailScheduler to use default emails
      subject: subject,
      html: emailContent
    });
    
    console.log('Email sent successfully:', result.data);
    return result.data;
    
  } catch (error) {
    // Ignore browser extension interference
    if (isBrowserExtensionError(error)) {
      console.warn('🔌 Browser extension interference in immediate email sending, ignoring:', error.message);
      return null;
    }
    console.error('Error sending email:', error);
    throw error;
  }
};

// Re-export utilities for backward compatibility
export { calculateEmailSendTime } from './email/emailUtils'; 