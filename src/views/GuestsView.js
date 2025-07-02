import React, { useState } from 'react';
import { useBugDetector } from '../utils/debugUtils';
import { isValidEmail } from '../utils/emailUtils';
import { useGuestEmail } from '../hooks/useGuestEmail';
import { PlusCircleIcon, UsersIcon } from '../components/Icons';
import Button from '../components/common/Button';
import CrudList from '../components/common/CrudList';
import GuestForm from '../components/guests/GuestForm';

export default function GuestsView({ guests = [], onSave, onDelete, settings = {}, bookings = [] }) {
    const { logError, validateProps } = useBugDetector('GuestsView');
    const { sendEmail } = useGuestEmail(settings, bookings);
    
    // בדיקת Props
    React.useEffect(() => {
        validateProps({ guests, onSave, onDelete }, ['onSave', 'onDelete']);
        
        if (!Array.isArray(guests)) {
            logError(new Error('guests prop must be an array'), { guests });
        }
    }, [guests, onSave, onDelete, validateProps, logError]);
    
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingGuest, setEditingGuest] = useState(null);
    const [editGuestData, setEditGuestData] = useState({
        name: '',
        phone: '',
        email: '',
        notes: ''
    });
    const [error, setError] = useState(null);

    const handleEditClick = (guest) => {
        setEditingGuest(guest.id);
        setEditGuestData({
            name: guest.name || '',
            phone: guest.phone || '',
            email: guest.email || '',
            notes: guest.notes || ''
        });
        setIsModalOpen(true);
    };

    const handleAdd = () => {
        setEditingGuest(null);
        setEditGuestData({
            name: '',
            phone: '',
            email: '',
            notes: ''
        });
        setIsModalOpen(true);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        
        // Validate email if provided
        if (editGuestData.email && !isValidEmail(editGuestData.email)) {
            setError('כתובת המייל אינה תקינה');
            return;
        }

        try {
            if (editingGuest) {
                await onSave(editingGuest, editGuestData);
            } else {
                await onSave(null, editGuestData);
            }
            setIsModalOpen(false);
            setEditingGuest(null);
            setEditGuestData({ name: '', phone: '', email: '', notes: '' });
            setError(null);
        } catch (error) {
            setError('שגיאה בשמירת האורח');
            console.error('Error saving guest:', error);
        }
    };

    const handleCloseModal = () => {
        setIsModalOpen(false);
        setEditingGuest(null);
        setError(null);
    };

    if (error) {
        return (
            <div className="flex justify-center items-center h-full p-8">
                <div className="modern-card p-8 text-center max-w-md border-error-200 bg-error-50/50">
                    <div className="w-16 h-16 bg-gradient-error rounded-2xl mx-auto mb-4 flex items-center justify-center">
                        <span className="text-white text-2xl">⚠️</span>
                    </div>
                    <h3 className="text-xl font-semibold text-error-800 mb-2">שגיאה בטעינת הנתונים</h3>
                    <p className="text-error-600">{error}</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-full p-6 animate-fade-in">
            {/* Header */}
            <div className="bg-white rounded-2xl shadow-lg p-6 mb-8 flex flex-col md:flex-row md:justify-between md:items-center gap-4 border border-white/20">
                <div className="flex items-center gap-4">
                    <div className="p-3 bg-gradient-to-l from-purple-500 to-blue-400 rounded-2xl text-white shadow-lg flex items-center justify-center">
                        <span className="text-2xl"><UsersIcon /></span>
                    </div>
                    <h2 className="text-2xl font-bold text-primary-900">ניהול אורחים</h2>
                </div>
                <Button
                    onClick={handleAdd}
                    variant="accent"
                    size="md"
                    icon={<PlusCircleIcon className="w-5 h-5" />}
                    className="min-w-[140px]"
                >
                    אורח חדש
                </Button>
            </div>

            {/* Guests List */}
            <div className="modern-card overflow-auto">
                <CrudList
                    items={guests}
                    onEdit={handleEditClick}
                    onDelete={onDelete}
                    onSendEmail={sendEmail}
                    showEmailButton={true}
                    getTitle={guest => guest.name}
                    getSubtitle={guest => guest.phone}
                    getMetadata={guest => [
                        { label: 'טלפון', value: guest.phone },
                        { label: 'אימייל', value: guest.email },
                        { label: 'הערות', value: guest.notes }
                    ]}
                    hideAddButton={true}
                />
            </div>

            {/* Guest Form Modal */}
            <GuestForm
                isOpen={isModalOpen}
                onClose={handleCloseModal}
                onSubmit={handleSubmit}
                editingGuest={editingGuest}
                guestData={editGuestData}
                setGuestData={setEditGuestData}
                error={error}
            />
        </div>
    );
} 