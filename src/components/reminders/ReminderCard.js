import React from 'react';
import { EditIcon, Trash2Icon } from '../Icons';
import ReminderForm from './ReminderForm';

export default function ReminderCard({ 
  reminder, 
  index, 
  isEditing, 
  onEdit, 
  onSave, 
  onCancelEdit, 
  onDelete 
}) {
  return (
    <div 
      className="group p-3 bg-white border border-primary-100 rounded-lg shadow-sm hover:shadow-md transition-all duration-200 animate-slide-up"
      style={{ animationDelay: `${index * 0.1}s` }}
    >
      {isEditing ? (
        <ReminderForm
          initial={reminder}
          onSave={data => onSave({ ...reminder, ...data })}
          onCancel={onCancelEdit}
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
                onClick={() => onEdit(reminder.id)}
                title="ערוך תזכורת"
              >
                <EditIcon className="w-3 h-3" />
              </button>
              <button
                className="p-1 text-primary-400 hover:text-error-600 hover:bg-white/50 rounded transition-all duration-200"
                onClick={() => {
                  if (window.confirm('האם למחוק תזכורת זו?')) {
                    onDelete(reminder.id);
                  }
                }}
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
  );
} 