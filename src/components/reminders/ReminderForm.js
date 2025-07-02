import React, { useState } from 'react';

export default function ReminderForm({ initial, onSave, onCancel }) {
  const [title, setTitle] = useState(initial?.title || '');
  const [content, setContent] = useState(initial?.content || '');
  const [date, setDate] = useState(initial?.date || '');
  const [emailEnabled, setEmailEnabled] = useState(initial?.emailEnabled || false);
  const [emailTime, setEmailTime] = useState(initial?.emailTime || '09:00');
  const [emailDaysBefore, setEmailDaysBefore] = useState(initial?.emailDaysBefore || 0);
  
  const handleSubmit = (e) => {
    e.preventDefault();
    onSave({ 
      title, 
      content, 
      date,
      emailEnabled,
      emailTime,
      emailDaysBefore
    });
  };
  
  return (
    <form
      onSubmit={handleSubmit}
      className="space-y-3 animate-fade-in"
      dir="rtl"
    >
      <input
        className="modern-input text-sm"
        placeholder="כותרת התזכורת..."
        value={title}
        onChange={e => setTitle(e.target.value)}
        maxLength={40}
        required
        autoFocus
      />
      <textarea
        className="modern-input resize-none text-sm"
        placeholder="תוכן התזכורת..."
        value={content}
        onChange={e => setContent(e.target.value)}
        rows={3}
        maxLength={200}
        required
      />
      <input
        type="date"
        className="modern-input text-sm"
        value={date}
        onChange={e => setDate(e.target.value)}
        placeholder="תאריך (אופציונלי)"
      />
      
      {/* Email Notification Settings */}
      <div className="border-t border-yellow-200 pt-3 space-y-2">
        <div className="flex items-center gap-2">
          <input
            type="checkbox"
            id="emailEnabled"
            checked={emailEnabled}
            onChange={e => setEmailEnabled(e.target.checked)}
            className="w-4 h-4 text-yellow-600 bg-gray-100 border-gray-300 rounded focus:ring-yellow-500"
          />
          <label htmlFor="emailEnabled" className="text-sm text-primary-700 font-medium">
            📧 שלח תזכורת במייל
          </label>
        </div>
        
        {emailEnabled && (
          <div className="space-y-2 pr-6 animate-fade-in">
            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="block text-xs text-primary-600 mb-1">שעת שליחה</label>
                <input
                  type="time"
                  value={emailTime}
                  onChange={e => setEmailTime(e.target.value)}
                  className="modern-input text-xs w-full"
                />
              </div>
              <div>
                <label className="block text-xs text-primary-600 mb-1">ימים מראש</label>
                <select
                  value={emailDaysBefore}
                  onChange={e => setEmailDaysBefore(parseInt(e.target.value))}
                  className="modern-input text-xs w-full"
                >
                  <option value={0}>ביום עצמו</option>
                  <option value={1}>יום מראש</option>
                  <option value={2}>יומיים מראש</option>
                  <option value={3}>3 ימים מראש</option>
                  <option value={7}>שבוע מראש</option>
                </select>
              </div>
            </div>
          </div>
        )}
      </div>
      
      <div className="flex gap-2 justify-end pt-1">
        <button 
          type="button" 
          onClick={onCancel} 
          className="btn-secondary text-xs px-3 py-1"
        >
          ביטול
        </button>
        <button 
          type="submit" 
          className="btn-primary text-xs px-3 py-1"
        >
          שמור
        </button>
      </div>
    </form>
  );
} 