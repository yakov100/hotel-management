import { useState, useMemo } from 'react';
import { useCollection } from './useCollection';
import { db } from '../firebase/config';
import { collection, addDoc, updateDoc, deleteDoc, doc, serverTimestamp, where } from 'firebase/firestore';
import { scheduleEmail } from '../utils/emailService';
import { isBrowserExtensionError } from '../utils/errorUtils';

export function useReminders(apartmentId, apartmentInfo) {
  // Create apartment filter for useCollection
  const apartmentFilter = useMemo(() => 
    apartmentId ? [where('apartmentId', '==', apartmentId)] : [], 
    [apartmentId]
  );
  
  const { documents: reminders = [], isLoading: loading } = useCollection(
    apartmentId ? 'reminders' : null, 
    apartmentFilter
  );
  
  const [editing, setEditing] = useState(null);
  const [saving, setSaving] = useState(false);

  const handleSave = async (data) => {
    setSaving(true);
    try {
      let savedReminder;
      
      if (editing === 'new') {
        const reminderData = { 
          ...data, 
          apartmentId,
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
            apartmentInfo: apartmentInfo,
            emailSettings: {
              emailTime: data.emailTime,
              emailDaysBefore: data.emailDaysBefore
            }
          });
          
          await scheduleEmail('reminder', savedReminder, {
            emailTime: data.emailTime,
            emailDaysBefore: data.emailDaysBefore
          }, apartmentInfo);
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
    await deleteDoc(doc(db, 'reminders', id));
  };

  const startEditing = (id) => {
    setEditing(id);
  };

  const cancelEditing = () => {
    setEditing(null);
  };

  return {
    reminders,
    loading,
    editing,
    saving,
    handleSave,
    handleDelete,
    startEditing,
    cancelEditing
  };
} 