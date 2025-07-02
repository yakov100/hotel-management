import React from 'react';
import { StickyNoteIcon } from '../Icons';

export default function RemindersEmptyState({ hasError = false }) {
  if (hasError) {
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

  return (
    <div className="text-center py-8 animate-fade-in">
      <div className="w-12 h-12 bg-gradient-to-br from-yellow-100 to-orange-200 rounded-xl mx-auto mb-3 flex items-center justify-center">
        <StickyNoteIcon className="w-6 h-6 text-yellow-600" />
      </div>
      <p className="text-primary-600 font-medium text-sm">אין תזכורות עדיין</p>
      <p className="text-primary-400 text-xs mt-1">לחץ על + כדי להוסיף תזכורת</p>
    </div>
  );
} 