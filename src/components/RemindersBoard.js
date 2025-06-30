import React, { useState, useMemo } from 'react';
import { PlusCircleIcon, EditIcon, Trash2Icon, StickyNoteIcon } from './Icons';
import { useCollection } from '../hooks/useCollection';
import { db } from '../firebase/config';
import { collection, addDoc, updateDoc, deleteDoc, doc, serverTimestamp, where } from 'firebase/firestore';
import { scheduleEmail, cancelScheduledEmail } from '../utils/emailService';
import { isBrowserExtensionError } from '../utils/errorUtils';

function ReminderForm({ initial, onSave, onCancel }) {
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

export default function RemindersBoard({ tenantId, tenantInfo }) {
  // Create tenant filter for useCollection
  const tenantFilter = useMemo(() => 
    tenantId ? [where('tenantId', '==', tenantId)] : [], 
    [tenantId]
  );
  
  const { documents: reminders = [], isLoading: loading } = useCollection(
    tenantId ? 'reminders' : null, 
    tenantFilter
  );
  const [editing, setEditing] = useState(null);
  const [saving, setSaving] = useState(false);

  // Return early if no tenantId
  if (!tenantId) {
    return (
      <div className="h-full flex flex-col items-center justify-center" dir="rtl">
        <div className="text-center py-8">
          <div className="w-12 h-12 bg-gradient-to-br from-gray-100 to-gray-200 rounded-xl mx-auto mb-3 flex items-center justify-center">
            <StickyNoteIcon className="w-6 h-6 text-gray-400" />
          </div>
          <p className="text-gray-500 font-medium text-sm">אין זיהוי משתמש</p>
          <p className="text-gray-400 text-xs mt-1">נא להתחבר למערכת</p>
        </div>
      </div>
    );
  }

  const handleSave = async (data) => {
    setSaving(true);
    try {
      let savedReminder;
      
      if (editing === 'new') {
        const reminderData = { 
          ...data, 
          tenantId,
          createdAt: serverTimestamp() 
        };
        const docRef = await addDoc(collection(db, 'reminders'), reminderData);
        savedReminder = { ...reminderData, id: docRef.id };
      } else if (typeof editing === 'string') {
        await updateDoc(doc(db, 'reminders', editing), data);
        savedReminder = { ...data, id: editing };
      }
      
      // Schedule email if enabled
      if (data.emailEnabled && savedReminder) {
        try {
          console.log('Scheduling email for reminder:', {
            title: savedReminder.title,
            tenantInfo: tenantInfo,
            emailSettings: {
              emailTime: data.emailTime,
              emailDaysBefore: data.emailDaysBefore
            }
          });
          
          await scheduleEmail('reminder', savedReminder, {
            emailTime: data.emailTime,
            emailDaysBefore: data.emailDaysBefore
          }, tenantInfo);
          console.log('Email scheduled for reminder:', savedReminder.title);
        } catch (emailError) {
          // Ignore browser extension interference
          if (isBrowserExtensionError(emailError)) {
            console.warn('🔌 Browser extension interference in email scheduling, ignoring:', emailError.message);
          } else {
            console.error('Failed to schedule email:', emailError);
            // Don't fail the whole operation if email scheduling fails
          }
        }
      }
      
      setEditing(null);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('האם למחוק תזכורת זו?')) return;
    await deleteDoc(doc(db, 'reminders', id));
  };

  if (loading) {
    return (
      <div className="animate-pulse">
        <div className="h-4 bg-primary-200 rounded mb-3"></div>
        <div className="space-y-2">
          <div className="h-16 bg-primary-100 rounded"></div>
          <div className="h-16 bg-primary-100 rounded"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col" dir="rtl">
      {/* Header */}
      <div className="flex items-center justify-between mb-4 pb-3 border-b border-primary-100">
        <div className="flex items-center gap-2">
          <div className="p-2 bg-gradient-to-r from-yellow-400 to-orange-400 rounded-lg">
            <StickyNoteIcon className="w-4 h-4 text-white" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-primary-800">תזכורות</h3>
            <p className="text-xs text-primary-600">
              {reminders?.length || 0} תזכורות פעילות
            </p>
          </div>
        </div>
        
        <button
          className="group p-2 bg-gradient-to-r from-yellow-400 to-orange-400 rounded-lg text-white shadow-md hover:shadow-lg transition-all duration-200 hover:-translate-y-0.5"
          title="תזכורת חדשה"
          onClick={() => setEditing('new')}
          disabled={saving}
        >
          <PlusCircleIcon className="w-4 h-4 transition-transform group-hover:rotate-90" />
        </button>
      </div>

      {/* Reminders Container */}
      <div className="flex-1 overflow-y-auto space-y-3 pr-1">
        {/* Empty State */}
        {(!reminders || reminders.length === 0) && editing !== 'new' && (
          <div className="text-center py-8 animate-fade-in">
            <div className="w-12 h-12 bg-gradient-to-br from-yellow-100 to-orange-200 rounded-xl mx-auto mb-3 flex items-center justify-center">
              <StickyNoteIcon className="w-6 h-6 text-yellow-600" />
            </div>
            <p className="text-primary-600 font-medium text-sm">אין תזכורות עדיין</p>
            <p className="text-primary-400 text-xs mt-1">לחץ על + כדי להוסיף תזכורת</p>
          </div>
        )}

        {/* New Reminder Form */}
        {editing === 'new' && (
          <div className="p-3 bg-gradient-to-br from-yellow-50 to-orange-50 border-2 border-yellow-200 rounded-lg animate-scale-in">
            <ReminderForm
              initial={{}}
              onSave={handleSave}
              onCancel={() => setEditing(null)}
            />
          </div>
        )}

        {/* Existing Reminders */}
        {reminders?.map((reminder, index) => (
          <div 
            key={reminder.id} 
            className="group p-3 bg-white border border-primary-100 rounded-lg shadow-sm hover:shadow-md transition-all duration-200 animate-slide-up"
            style={{ animationDelay: `${index * 0.1}s` }}
          >
            {editing === reminder.id ? (
              <ReminderForm
                initial={reminder}
                onSave={data => handleSave({ ...reminder, ...data })}
                onCancel={() => setEditing(null)}
              />
            ) : (
              <div className="relative">
                {/* Reminder Header */}
                <div className="flex items-start justify-between mb-2">
                  <h4 className="font-semibold text-primary-800 flex-1 leading-tight text-sm">
                    {reminder.title}
                  </h4>
                  
                  {/* Action Buttons */}
                  <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button
                      className="p-1 text-primary-400 hover:text-accent-600 hover:bg-white/50 rounded transition-all duration-200"
                      onClick={() => setEditing(reminder.id)}
                      title="ערוך תזכורת"
                    >
                      <EditIcon className="w-3 h-3" />
                    </button>
                    <button
                      className="p-1 text-primary-400 hover:text-error-600 hover:bg-white/50 rounded transition-all duration-200"
                      onClick={() => handleDelete(reminder.id)}
                      title="מחק תזכורת"
                    >
                      <Trash2Icon className="w-3 h-3" />
                    </button>
                  </div>
                </div>

                {/* Reminder Content */}
                <div className="text-primary-700 text-xs leading-relaxed whitespace-pre-line mb-2">
                  {reminder.content}
                </div>

                {/* Reminder Date and Email Info */}
                <div className="space-y-1 pt-2 border-t border-primary-100">
                  {reminder.date && (
                    <div className="flex items-center gap-1">
                      <div className="w-1.5 h-1.5 bg-yellow-400 rounded-full"></div>
                      <span className="text-xs text-yellow-600 font-medium">
                        {new Date(reminder.date).toLocaleDateString('he-IL', {
                          month: 'short',
                          day: 'numeric'
                        })}
                      </span>
                    </div>
                  )}
                  
                  {reminder.emailEnabled && (
                    <div className="flex items-center gap-1">
                      <span className="text-xs">📧</span>
                      <span className="text-xs text-blue-600 font-medium">
                        מייל בשעה {reminder.emailTime || '09:00'}
                        {reminder.emailDaysBefore > 0 && ` (${reminder.emailDaysBefore} ימים מראש)`}
                      </span>
                    </div>
                  )}
                </div>

                {/* Decorative corner */}
                <div className="absolute top-0 left-0 w-4 h-4 bg-gradient-to-br from-yellow-200/50 to-transparent rounded-tl-lg pointer-events-none"></div>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Loading State */}
      {saving && (
        <div className="flex items-center justify-center gap-2 mt-3 p-2 bg-white/50 backdrop-blur-sm rounded-lg border border-white/30 animate-fade-in">
          <div className="w-3 h-3 border-2 border-yellow-500 border-t-transparent rounded-full animate-spin"></div>
          <span className="text-primary-600 text-xs font-medium">שומר תזכורת...</span>
        </div>
      )}
    </div>
  );
}