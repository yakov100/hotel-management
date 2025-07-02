const getBaseStyles = () => `
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

export const getReminderTemplate = (data, tenantInfo) => `
  <!DOCTYPE html>
  <html dir="rtl" lang="he">
  <head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>תזכורת: ${data.title}</title>
    ${getBaseStyles()}
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

export const getTaskTemplate = (data, tenantInfo) => `
  <!DOCTYPE html>
  <html dir="rtl" lang="he">
  <head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>משימה: ${data.title}</title>
    ${getBaseStyles()}
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

export const getEmailTemplate = (type, data, tenantInfo) => {
  if (type === 'reminder') {
    return getReminderTemplate(data, tenantInfo);
  }

  if (type === 'task') {
    return getTaskTemplate(data, tenantInfo);
  }

  return '';
}; 