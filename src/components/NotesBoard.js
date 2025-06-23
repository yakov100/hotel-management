import React, { useState } from 'react';
import { PlusCircleIcon, EditIcon, Trash2Icon, StickyNoteIcon } from './Icons';
import { useCollection } from '../hooks/useCollection';
import { db } from '../firebase/config';
import { collection, addDoc, updateDoc, deleteDoc, doc, serverTimestamp } from 'firebase/firestore';

function NoteForm({ initial, onSave, onCancel }) {
  const [title, setTitle] = useState(initial?.title || '');
  const [content, setContent] = useState(initial?.content || '');
  const [date, setDate] = useState(initial?.date || '');
  
  return (
    <form
      onSubmit={e => { e.preventDefault(); onSave({ title, content, date }); }}
      className="space-y-4 animate-fade-in"
      dir="rtl"
    >
      <input
        className="modern-input"
        placeholder="כותרת הפתק..."
        value={title}
        onChange={e => setTitle(e.target.value)}
        maxLength={40}
        required
        autoFocus
      />
      <textarea
        className="modern-input resize-none"
        placeholder="תוכן הפתק..."
        value={content}
        onChange={e => setContent(e.target.value)}
        rows={4}
        maxLength={300}
        required
      />
      <input
        type="date"
        className="modern-input"
        value={date}
        onChange={e => setDate(e.target.value)}
        placeholder="תאריך (אופציונלי)"
      />
      <div className="flex gap-3 justify-end pt-2">
        <button 
          type="button" 
          onClick={onCancel} 
          className="btn-secondary text-sm"
        >
          ביטול
        </button>
        <button 
          type="submit" 
          className="btn-primary text-sm"
        >
          שמור פתק
        </button>
      </div>
    </form>
  );
}

export default function NotesBoard({ tenantId }) {
  // Only fetch notes if tenantId is available
  const { data: notes = [], loading } = useCollection(tenantId ? 'notes' : '', tenantId || '');
  const [editing, setEditing] = useState(null);
  const [saving, setSaving] = useState(false);

  const handleSave = async (data) => {
    setSaving(true);
    try {
      if (editing === 'new') {
        await addDoc(collection(db, 'notes'), { ...data, createdAt: serverTimestamp() });
      } else if (typeof editing === 'string') {
        await updateDoc(doc(db, 'notes', editing), data);
      }
      setEditing(null);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('האם למחוק פתק זה?')) return;
    await deleteDoc(doc(db, 'notes', id));
  };

  if (loading) {
    return (
      <div className="modern-card p-6 animate-pulse">
        <div className="h-6 bg-primary-200 rounded-lg mb-4"></div>
        <div className="space-y-3">
          <div className="h-20 bg-primary-100 rounded-lg"></div>
          <div className="h-20 bg-primary-100 rounded-lg"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="modern-card p-6 max-h-[80vh] flex flex-col animate-slide-up" dir="rtl">
      {/* Header */}
      <div className="flex items-center justify-between mb-6 pb-4 border-b border-primary-100">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-gradient-warning rounded-xl">
            <StickyNoteIcon className="w-5 h-5 text-white" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-primary-800">לוח פתקים</h2>
            <p className="text-sm text-primary-600">
              {notes?.length || 0} פתקים פעילים
            </p>
          </div>
        </div>
        
        <button
          className="group relative p-3 bg-gradient-warning rounded-xl text-white shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1"
          title="פתק חדש"
          onClick={() => setEditing('new')}
          disabled={saving}
        >
          <PlusCircleIcon className="w-5 h-5 transition-transform group-hover:rotate-90" />
          <div className="absolute inset-0 bg-gradient-glass opacity-0 group-hover:opacity-100 transition-opacity rounded-xl pointer-events-none" />
        </button>
      </div>

      {/* Notes Container */}
      <div className="flex-1 overflow-y-auto space-y-4 pr-2">
        {/* Empty State */}
        {(!notes || notes.length === 0) && editing !== 'new' && (
          <div className="text-center py-12 animate-fade-in">
            <div className="w-16 h-16 bg-gradient-to-br from-warning-100 to-warning-200 rounded-2xl mx-auto mb-4 flex items-center justify-center">
              <StickyNoteIcon className="w-8 h-8 text-warning-600" />
            </div>
            <p className="text-primary-600 font-medium">אין פתקים עדיין</p>
            <p className="text-primary-400 text-sm mt-1">לחץ על + כדי להוסיף פתק ראשון</p>
          </div>
        )}

        {/* New Note Form */}
        {editing === 'new' && (
          <div className="note-card bg-gradient-to-br from-warning-50 to-warning-100 border-2 border-warning-200 animate-scale-in">
            <NoteForm
              initial={{}}
              onSave={handleSave}
              onCancel={() => setEditing(null)}
            />
          </div>
        )}

        {/* Existing Notes */}
        {notes?.map((note, index) => (
          <div 
            key={note.id} 
            className="note-card group animate-slide-up"
            style={{ animationDelay: `${index * 0.1}s` }}
          >
            {editing === note.id ? (
              <NoteForm
                initial={note}
                onSave={data => handleSave({ ...note, ...data })}
                onCancel={() => setEditing(null)}
              />
            ) : (
              <div className="relative">
                {/* Note Header */}
                <div className="flex items-start justify-between mb-3">
                  <h3 className="font-semibold text-primary-800 flex-1 leading-tight">
                    {note.title}
                  </h3>
                  
                  {/* Action Buttons */}
                  <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button
                      className="p-1.5 text-primary-400 hover:text-accent-600 hover:bg-white/50 rounded-lg transition-all duration-200"
                      onClick={() => setEditing(note.id)}
                      title="ערוך פתק"
                    >
                      <EditIcon className="w-4 h-4" />
                    </button>
                    <button
                      className="p-1.5 text-primary-400 hover:text-error-600 hover:bg-white/50 rounded-lg transition-all duration-200"
                      onClick={() => handleDelete(note.id)}
                      title="מחק פתק"
                    >
                      <Trash2Icon className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                {/* Note Content */}
                <div className="text-primary-700 text-sm leading-relaxed whitespace-pre-line mb-3">
                  {note.content}
                </div>

                {/* Note Date */}
                {note.date && (
                  <div className="flex items-center gap-2 pt-2 border-t border-primary-100">
                    <div className="w-2 h-2 bg-accent-400 rounded-full"></div>
                    <span className="text-xs text-accent-600 font-medium">
                      {new Date(note.date).toLocaleDateString('he-IL', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric'
                      })}
                    </span>
                  </div>
                )}

                {/* Decorative corner */}
                <div className="absolute top-0 left-0 w-6 h-6 bg-gradient-to-br from-warning-200/50 to-transparent rounded-tl-xl pointer-events-none"></div>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Loading State */}
      {saving && (
        <div className="flex items-center justify-center gap-2 mt-4 p-3 bg-white/50 backdrop-blur-sm rounded-xl border border-white/30 animate-fade-in">
          <div className="w-4 h-4 border-2 border-accent-500 border-t-transparent rounded-full animate-spin"></div>
          <span className="text-primary-600 text-sm font-medium">שומר פתק...</span>
        </div>
      )}
    </div>
  );
} 