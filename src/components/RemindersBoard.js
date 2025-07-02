import React from 'react';
import { PlusCircleIcon, StickyNoteIcon } from './Icons';
import { useReminders } from '../hooks/useReminders';
import ReminderForm from './reminders/ReminderForm';
import ReminderCard from './reminders/ReminderCard';
import RemindersEmptyState from './reminders/RemindersEmptyState';

export default function RemindersBoard({ apartmentId, apartmentInfo }) {
  const {
    reminders,
    loading,
    editing,
    saving,
    handleSave,
    handleDelete,
    startEditing,
    cancelEditing
  } = useReminders(apartmentId, apartmentInfo);

  // Return early if no apartmentId
  if (!apartmentId) {
    return <RemindersEmptyState hasError={true} />;
  }

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
          onClick={() => startEditing('new')}
          disabled={saving}
        >
          <PlusCircleIcon className="w-4 h-4 transition-transform group-hover:rotate-90" />
        </button>
      </div>

      {/* Reminders Container */}
      <div className="flex-1 overflow-y-auto space-y-3 pr-1">
        {/* Empty State */}
        {(!reminders || reminders.length === 0) && editing !== 'new' && (
          <RemindersEmptyState />
        )}

        {/* New Reminder Form */}
        {editing === 'new' && (
          <div className="p-3 bg-gradient-to-br from-yellow-50 to-orange-50 border-2 border-yellow-200 rounded-lg animate-scale-in">
            <ReminderForm
              initial={{}}
              onSave={handleSave}
              onCancel={cancelEditing}
            />
          </div>
        )}

        {/* Existing Reminders */}
        {reminders?.map((reminder, index) => (
          <ReminderCard
            key={reminder.id}
            reminder={reminder}
            index={index}
            isEditing={editing === reminder.id}
            onEdit={startEditing}
            onSave={handleSave}
            onCancelEdit={cancelEditing}
            onDelete={handleDelete}
          />
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