import { getFunctions, httpsCallable } from 'firebase/functions';
import { isBrowserExtensionError } from './errorUtils';

// Initialize Firebase Functions
const functions = getFunctions();

// Templates for styled emails
const getEmailTemplate = (type, data, tenantInfo) => {
  const baseStyles = `
    <style>
      body { 
        font-family: 'Segoe UI', Arial, sans-serif; 
        line-height: 1.6; 
        color: #333; 
        margin: 0; 
        padding: 0; 
        background-color: #f4f4f4; 
      }
      .container { 
        max-width: 600px; 
        margin: 0 auto; 
        background: white; 
        border-radius: 12px; 
        overflow: hidden; 
        box-shadow: 0 4px 6px rgba(0,0,0,0.1); 
      }
      .header { 
        background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); 
        color: white; 
        padding: 30px 20px; 
        text-align: center; 
      }
      .content { 
        padding: 30px 20px; 
      }
      .title { 
        font-size: 24px; 
        font-weight: bold; 
        margin: 0 0 10px 0; 
      }
      .subtitle { 
        font-size: 14px; 
        opacity: 0.9; 
        margin: 0; 
      }
      .card { 
        background: #f8f9fa; 
        border-radius: 8px; 
        padding: 20px; 
        margin: 20px 0; 
        border-right: 4px solid; 
      }
      .reminder-card { 
        border-right-color: #ffc107; 
        background: linear-gradient(135deg, #fff8e1 0%, #fff3c4 100%); 
      }
      .task-card { 
        border-right-color: #007bff; 
        background: linear-gradient(135deg, #e3f2fd 0%, #bbdefb 100%); 
      }
      .footer { 
        background: #f8f9fa; 
        padding: 20px; 
        text-align: center; 
        font-size: 12px; 
        color: #666; 
      }
      .button { 
        display: inline-block; 
        background: #007bff; 
        color: white; 
        padding: 12px 24px; 
        text-decoration: none; 
        border-radius: 6px; 
        font-weight: bold; 
        margin: 10px 0; 
      }
      .date-badge { 
        background: #e9ecef; 
        padding: 4px 8px; 
        border-radius: 4px; 
        font-size: 12px; 
        font-weight: bold; 
        color: #495057; 
      }
      .priority-high { color: #dc3545; font-weight: bold; }
      .priority-medium { color: #ffc107; font-weight: bold; }
      .priority-low { color: #28a745; font-weight: bold; }
    </style>
  `;

  if (type === 'reminder') {
    return `
      <!DOCTYPE html>
      <html dir="rtl" lang="he">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>תזכורת: ${data.title}</title>
        ${baseStyles}
      </head>
      <body>
        <div class="container">
          <div class="header">
            <div class="title">📝 תזכורת חשובה</div>
            <div class="subtitle">מ${tenantInfo?.propertyName || 'מערכת הניהול'}</div>
          </div>
          
          <div class="content">
            <div class="card reminder-card">
              <h2 style="margin: 0 0 15px 0; color: #856404;">🗓️ ${data.title}</h2>
              <p style="margin: 10px 0; line-height: 1.6;">${data.content}</p>
              
              ${data.date ? `
                <div style="margin: 15px 0;">
                  <span class="date-badge">📅 ${new Date(data.date).toLocaleDateString('he-IL', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric',
                    weekday: 'long'
                  })}</span>
                </div>
              ` : ''}
            </div>
            
            <p style="text-align: center; margin: 25px 0;">
              <a href="#" class="button">👀 צפה במערכת</a>
            </p>
          </div>
          
          <div class="footer">
            <p>נשלח מ${tenantInfo?.propertyName || 'מערכת ניהול הנכס'}</p>
            <p>תזכורת זו נשלחה אוטומטית מהמערכת</p>
          </div>
        </div>
      </body>
      </html>
    `;
  }

  if (type === 'task') {
    return `
      <!DOCTYPE html>
      <html dir="rtl" lang="he">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>משימה: ${data.title}</title>
        ${baseStyles}
      </head>
      <body>
        <div class="container">
          <div class="header">
            <div class="title">✅ תזכורת משימה</div>
            <div class="subtitle">מ${tenantInfo?.propertyName || 'מערכת הניהול'}</div>
          </div>
          
          <div class="content">
            <div class="card task-card">
              <h2 style="margin: 0 0 15px 0; color: #004085;">📋 ${data.title}</h2>
              
              ${data.description ? `
                <p style="margin: 10px 0; line-height: 1.6;">${data.description}</p>
              ` : ''}
              
              <div style="margin: 15px 0;">
                <div style="display: inline-block; margin-left: 10px;">
                  <strong>עדיפות:</strong> 
                  <span class="priority-${data.priority}">
                    ${data.priority === 'high' ? '🔴 גבוהה' : 
                      data.priority === 'medium' ? '🟡 בינונית' : '🟢 נמוכה'}
                  </span>
                </div>
                
                <div style="display: inline-block;">
                  <strong>סטטוס:</strong> 
                  <span style="color: ${data.status === 'completed' ? '#28a745' : 
                    data.status === 'in_progress' ? '#007bff' : '#ffc107'};">
                    ${data.status === 'completed' ? '✅ הושלם' : 
                      data.status === 'in_progress' ? '🔄 בביצוע' : '⏳ ממתין'}
                  </span>
                </div>
              </div>
              
              ${data.dueDate ? `
                <div style="margin: 15px 0;">
                  <span class="date-badge">🗓️ תאריך יעד: ${new Date(data.dueDate).toLocaleDateString('he-IL', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric'
                  })}</span>
                </div>
              ` : ''}
            </div>
            
            <p style="text-align: center; margin: 25px 0;">
              <a href="#" class="button">📱 פתח במערכת</a>
            </p>
          </div>
          
          <div class="footer">
            <p>נשלח מ${tenantInfo?.propertyName || 'מערכת ניהול הנכס'}</p>
            <p>תזכורת זו נשלחה אוטומטית מהמערכת</p>
          </div>
        </div>
      </body>
      </html>
    `;
  }

  return '';
};

// Calculate when to send email based on settings
export const calculateEmailSendTime = (targetDate, emailTime, daysBefore) => {
  if (!targetDate) return null;
  
  const target = new Date(targetDate);
  const send = new Date(target);
  
  // Subtract days
  send.setDate(send.getDate() - daysBefore);
  
  // Set time
  const [hours, minutes] = emailTime.split(':');
  send.setHours(parseInt(hours), parseInt(minutes), 0, 0);
  
  return send;
};

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
    
    // Call Firebase Function to schedule email
    const scheduleEmailFunction = httpsCallable(functions, 'scheduleEmail');
    
    // Prepare recipient emails - include main email and additional emails
    const recipients = [];
    if (tenantInfo?.email) {
      recipients.push(tenantInfo.email);
    }
    if (tenantInfo?.additionalEmails && Array.isArray(tenantInfo.additionalEmails)) {
      recipients.push(...tenantInfo.additionalEmails);
    }
    
    const result = await scheduleEmailFunction({
      to: recipients.length > 0 ? recipients : [], // Will be handled by emailScheduler to use default emails
      subject: type === 'reminder' ? `תזכורת: ${data.title}` : `משימה: ${data.title}`,
      html: emailContent,
      scheduledTime: sendTime.toISOString(),
      type: type,
      itemId: data.id,
      tenantId: tenantInfo?.id
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
    
    const sendEmailFunction = httpsCallable(functions, 'sendEmail');
    
    // Prepare recipient emails - include main email and additional emails
    const recipients = [];
    if (tenantInfo?.email) {
      recipients.push(tenantInfo.email);
    }
    if (tenantInfo?.additionalEmails && Array.isArray(tenantInfo.additionalEmails)) {
      recipients.push(...tenantInfo.additionalEmails);
    }
    
    const result = await sendEmailFunction({
      to: recipients.length > 0 ? recipients : [], // Will be handled by emailScheduler to use default emails
      subject: type === 'reminder' ? `תזכורת: ${data.title}` : `משימה: ${data.title}`,
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