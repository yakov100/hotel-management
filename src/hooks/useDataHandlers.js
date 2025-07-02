import { useCallback } from 'react';
import { addDoc, setDoc, doc, collection, deleteDoc } from 'firebase/firestore';
import { db } from '../firebase/config';

export function useDataHandlers(apartmentId, hasPermission) {
    const handleSave = useCallback((collectionName) => async (id, data) => {
        if (!db || !apartmentId || !hasPermission('write')) return;
        try {
            // Add apartmentId to all data
            const dataWithApartment = { ...data, apartmentId };
            
            if (id) {
                await setDoc(doc(db, collectionName, id), dataWithApartment, { merge: true });
            } else {
                await addDoc(collection(db, collectionName), dataWithApartment);
            }
        } catch (e) {
            console.error(`Save error to ${collectionName}:`, e);
        }
    }, [apartmentId, hasPermission]);

    const handleDelete = useCallback((collectionName) => async (id) => {
        if (!db || !apartmentId || !hasPermission('delete')) return;
        try {
            await deleteDoc(doc(db, collectionName, id));
        } catch (e) {
            console.error(`Delete error from ${collectionName}:`, e);
        }
    }, [apartmentId, hasPermission]);

    const handleSettingsSave = useCallback((selectedApartment) => async (id, data) => {
        if (!apartmentId || !hasPermission('manage_settings')) return;
        try {
            await setDoc(doc(db, 'apartments', apartmentId), {
                ...selectedApartment,
                settings: data
            }, { merge: true });
        } catch (e) {
            console.error('Settings save error:', e);
        }
    }, [apartmentId, hasPermission]);

    return {
        handleSave,
        handleDelete,
        handleSettingsSave
    };
} 