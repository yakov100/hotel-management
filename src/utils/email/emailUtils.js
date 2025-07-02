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

// Prepare recipient emails - include main email and additional emails
export const prepareRecipients = (tenantInfo) => {
  const recipients = [];
  if (tenantInfo?.email) {
    recipients.push(tenantInfo.email);
  }
  if (tenantInfo?.additionalEmails && Array.isArray(tenantInfo.additionalEmails)) {
    recipients.push(...tenantInfo.additionalEmails);
  }
  return recipients;
};

// Generate email subject based on type and data
export const generateEmailSubject = (type, data) => {
  return type === 'reminder' ? `תזכורת: ${data.title}` : `משימה: ${data.title}`;
}; 