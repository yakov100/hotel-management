import React, { useState, useEffect } from 'react';
import Modal from './common/Modal';
import { addDoc, collection, doc, setDoc } from 'firebase/firestore';
import { db } from '../firebase/config';
import { useApartment } from '../context/ApartmentContext';

export default function CreateApartmentModal({ isOpen, onClose, onSuccess }) {
    const { user, refreshUserApartments } = useApartment();
    const [formData, setFormData] = useState({
        name: '',
        address: '',
        description: ''
    });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    // Debug modal state
    useEffect(() => {
        console.log('CreateApartmentModal render - isOpen:', isOpen);
        console.log('CreateApartmentModal render - user:', user ? user.uid : 'no user');
    }, [isOpen, user]);

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        
        if (!user) {
            setError('אין משתמש מחובר');
            return;
        }

        if (!formData.name.trim()) {
            setError('שם הדירה הוא שדה חובה');
            return;
        }

        setLoading(true);
        setError('');

        try {
            console.log('Creating apartment with data:', formData);
            
            const apartmentData = {
                name: formData.name.trim(),
                address: formData.address.trim() || '',
                description: formData.description.trim() || '',
                ownerId: user.uid,
                users: [user.uid], // הוסף את היוצר כמשתמש ראשון
                userRoles: {
                    [user.uid]: 'owner'
                },
                createdAt: new Date(),
                updatedAt: new Date(),
                settings: {
                    currency: 'ILS',
                    language: 'he',
                    timezone: 'Asia/Jerusalem'
                }
            };

            const docRef = await addDoc(collection(db, 'apartments'), apartmentData);
            console.log('Apartment created successfully with ID:', docRef.id);
            
            // Update user profile to include the new apartment
            await setDoc(doc(db, 'users', user.uid), {
                apartments: {
                    [docRef.id]: {
                        role: 'owner',
                        permissions: [],
                        joinedAt: new Date()
                    }
                }
            }, { merge: true });
            
            console.log('User profile updated with new apartment');
            
            // Refresh apartments list
            await refreshUserApartments();
            
            // Reset form
            setFormData({
                name: '',
                address: '',
                description: ''
            });
            
            onSuccess?.(docRef.id);
        } catch (error) {
            console.error('Error creating apartment:', error);
            setError('שגיאה ביצירת הדירה: ' + error.message);
        } finally {
            setLoading(false);
        }
    };

    if (!isOpen) {
        console.log('Modal not open, returning null');
        return null;
    }

    console.log('Rendering CreateApartmentModal with isOpen:', isOpen);

    return (
        <Modal isOpen={isOpen} onClose={onClose} title="צור דירה חדשה">
            <form onSubmit={handleSubmit} className="space-y-4">
                {error && (
                    <div className="p-3 bg-red-100 border border-red-400 text-red-700 rounded-lg text-sm">
                        {error}
                    </div>
                )}
                
                <div>
                    <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
                        שם הדירה *
                    </label>
                    <input
                        type="text"
                        id="name"
                        name="name"
                        value={formData.name}
                        onChange={handleInputChange}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder="הזן שם לדירה"
                        required
                        autoFocus
                    />
                </div>

                <div>
                    <label htmlFor="address" className="block text-sm font-medium text-gray-700 mb-1">
                        כתובת
                    </label>
                    <input
                        type="text"
                        id="address"
                        name="address"
                        value={formData.address}
                        onChange={handleInputChange}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder="כתובת הדירה"
                    />
                </div>

                <div>
                    <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">
                        תיאור
                    </label>
                    <textarea
                        id="description"
                        name="description"
                        value={formData.description}
                        onChange={handleInputChange}
                        rows={3}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder="תיאור קצר של הדירה"
                    />
                </div>

                <div className="flex gap-3 pt-4">
                    <button
                        type="submit"
                        disabled={loading}
                        className="flex-1 bg-blue-500 text-white py-2 px-4 rounded-lg hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {loading ? 'יוצר...' : 'צור דירה'}
                    </button>
                    <button
                        type="button"
                        onClick={onClose}
                        className="flex-1 bg-gray-300 text-gray-700 py-2 px-4 rounded-lg hover:bg-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2"
                    >
                        בטל
                    </button>
                </div>
            </form>
        </Modal>
    );
} 