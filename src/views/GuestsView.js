import React, { useState } from 'react';
import { exportToCSV, exportToExcel, mapGuestsForExport } from '../utils/exportUtils';
import { useBugDetector } from '../utils/debugUtils';
import { sendEmailToGuest, isValidEmail, isEmailServiceConfigured } from '../utils/emailUtils';
import { PlusCircleIcon, UsersIcon } from '../components/Icons';
import Button from '../components/common/Button';
import Modal from '../components/common/Modal';
import CrudList from '../components/common/CrudList';
import { Input, Textarea } from '../components/common/FormInputs';

export default function GuestsView({ guests = [], onSave, onDelete, settings = {}, bookings = [] }) {
    const { logError, logWarning, validateProps } = useBugDetector('GuestsView');
    
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

    const handleSendEmail = async (guest) => {
        if (!guest.email) {
            logWarning('Cannot send email - no email address', { guest });
            alert('לא ניתן לשלוח מייל - אין כתובת מייל לאורח זה');
            return;
        }

        if (!isValidEmail(guest.email)) {
            logWarning('Invalid email address', { email: guest.email });
            alert('כתובת המייל לא תקינה');
            return;
        }

        if (!isEmailServiceConfigured()) {
            alert('שירות המייל לא מוגדר. אנא הגדר את EmailJS לפני שליחת מיילים.');
            return;
        }

        try {
            // הצגת הודעת טעינה
            const sendingMessage = `שולח מייל ל-${guest.name}...`;
            console.log(sendingMessage);
            
            // חיפוש ההזמנה של האורח כדי לקבל את שעת הצ'ק-אין
            let checkInTimeToSend = settings?.checkInTime || '';
            let checkOutTimeToSend = settings?.checkOutTime || '';
            
            console.log('🔍 מחפש הזמנה לאורח:', guest.name, guest.email);
            console.log('📋 כל ההזמנות:', bookings);
            
            // מחפש הזמנה של האורח לפי אימייל או שם
            const guestBooking = bookings.find(booking => 
                booking.guestEmail === guest.email || 
                booking.guestName === guest.name
            );
            
            console.log('🎯 הזמנה שנמצאה:', guestBooking);
            
            if (guestBooking) {
                console.log('⏰ שעת צ\'ק-אין מההזמנה:', guestBooking.checkInTime);
                console.log('📅 תאריך צ\'ק-אין מההזמנה:', guestBooking.checkIn);
                console.log('⏰ שעת צ\'ק-אאוט מההזמנה:', guestBooking.checkOutTime);
                console.log('📅 תאריך צ\'ק-אאוט מההזמנה:', guestBooking.checkOut);
                
                if (guestBooking.checkInTime) {
                    checkInTimeToSend = guestBooking.checkInTime;
                    console.log('✅ נמצאה הזמנה לאורח עם שעת צ\'ק-אין:', checkInTimeToSend);
                } else {
                    console.log('⚠️ אין שעת צ\'ק-אין בהזמנה');
                }

                if (guestBooking.checkOutTime) {
                    checkOutTimeToSend = guestBooking.checkOutTime;
                    console.log('✅ נמצאה הזמנה לאורח עם שעת צ\'ק-אאוט:', checkOutTimeToSend);
                } else {
                    console.log('⚠️ אין שעת צ\'ק-אאוט בהזמנה');
                }
            } else {
                console.log('❌ לא נמצאה הזמנה לאורח');
            }
            
            console.log('📤 שולח מייל עם שעת צ\'ק-אין:', checkInTimeToSend);
            console.log('📤 שולח מייל עם שעת צ\'ק-אאוט:', checkOutTimeToSend);
            
            const result = await sendEmailToGuest(
                guest.email, 
                guest.name,
                'מחכים לך!',
                '', // Empty message to use the default template
                checkInTimeToSend,
                checkInTimeToSend, // שליחת השעה גם כ-checkInTimeStr
                checkOutTimeToSend
            );
            
            if (result.success) {
                alert(`המייל נשלח בהצלחה ל-${guest.name} (${guest.email})`);
                logWarning('Email sent successfully', { guest: guest.name, email: guest.email });
            } else {
                throw new Error(result.error);
            }
        } catch (error) {
            logError(error, { action: 'send_email', guest });
            alert(`שגיאה בשליחת המייל ל-${guest.name}: ${error.message}`);
        }
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
            <div className="modern-card overflow-hidden">
                <CrudList
                    items={guests}
                    onEdit={handleEditClick}
                    onDelete={onDelete}
                    onSendEmail={handleSendEmail}
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
            <Modal isOpen={isModalOpen} onClose={() => {
                setIsModalOpen(false);
                setEditingGuest(null);
                setEditGuestData({ name: '', phone: '', email: '', notes: '' });
                setError(null);
            }}>
                <div className="p-6">
                    <h3 className="text-xl font-bold mb-4">
                        {editingGuest ? 'עריכת אורח' : 'אורח חדש'}
                    </h3>
                    
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <Input
                            label="שם האורח"
                            value={editGuestData.name}
                            onChange={e => setEditGuestData(prev => ({ ...prev, name: e.target.value }))}
                            required
                        />
                        
                        <Input
                            label="טלפון"
                            type="tel"
                            value={editGuestData.phone}
                            onChange={e => setEditGuestData(prev => ({ ...prev, phone: e.target.value }))}
                        />
                        
                        <Input
                            label="אימייל"
                            type="email"
                            value={editGuestData.email}
                            onChange={e => setEditGuestData(prev => ({ ...prev, email: e.target.value }))}
                        />
                        
                        <Textarea
                            label="הערות"
                            value={editGuestData.notes}
                            onChange={e => setEditGuestData(prev => ({ ...prev, notes: e.target.value }))}
                        />

                        {error && (
                            <div className="text-error-600 text-sm">{error}</div>
                        )}
                        
                        <div className="flex justify-end gap-2">
                            <Button
                                type="button"
                                variant="ghost"
                                onClick={() => {
                                    setIsModalOpen(false);
                                    setEditingGuest(null);
                                    setEditGuestData({ name: '', phone: '', email: '', notes: '' });
                                    setError(null);
                                }}
                            >
                                ביטול
                            </Button>
                            <Button type="submit" variant="primary">
                                {editingGuest ? 'שמור שינויים' : 'הוסף אורח'}
                            </Button>
                        </div>
                    </form>
                </div>
            </Modal>
        </div>
    );
} 