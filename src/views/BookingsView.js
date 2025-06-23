import React, { useState } from 'react';
import { CalendarIcon, ListIcon, PlusCircleIcon } from '../components/Icons';
import Button from '../components/common/Button';
import BookingsCalendar from '../components/bookings/BookingsCalendar';
import BookingsList from '../components/bookings/BookingsList';
import BookingForm from '../components/bookings/BookingForm';
import Modal from '../components/common/Modal';
import { addDoc, updateDoc, deleteDoc, doc, collection } from 'firebase/firestore';
import { db, auth } from '../firebase/config';
import { toDateSafe } from '../utils/dateUtils';
import { useCollection } from '../hooks/useCollection';

export default function BookingsView({
    bookings = [],
    loading = false,
    error = null,
    onSave,
    onDelete,
    settings = null,
    currentProjectId = null,
    onProjectSelect
}) {
    const [viewMode, setViewMode] = useState('calendar');
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedBooking, setSelectedBooking] = useState(null);
    const [localError, setLocalError] = useState(null);
    const [duplicateModalOpen, setDuplicateModalOpen] = useState(false);
    
    const handleError = (error, message) => {
        console.error(error);
        setLocalError(message || 'שגיאה בלתי צפויה');
    };

    const handleEdit = (booking) => {
        setSelectedBooking(booking);
        setIsModalOpen(true);
    };

    const handleAdd = () => {
        setSelectedBooking(null);
        setIsModalOpen(true);
    };

    const handleCloseModal = () => {
        setIsModalOpen(false);
        setSelectedBooking(null);
        setLocalError(null);
    };

    // פונקציה לבדיקת חפיפה בין טווחי תאריכים
    function isOverlap(start1, end1, start2, end2) {
        return start1 < end2 && start2 < end1;
    }

    const handleSave = async (bookingData) => {
        console.log('[BookingsView] התחלת שמירת הזמנה:', bookingData);
        
        if (!auth.currentUser) {
            handleError(new Error('לא מחובר למערכת'), 'נדרשת התחברות כדי לשמור הזמנות');
            return;
        }

        // שמירת השעות כשדות נפרדים
        const { checkInTimeStr, checkOutTimeStr, ...restBookingData } = bookingData;
        const dataToSave = {
            ...restBookingData,
            checkInTime: checkInTimeStr,
            checkOutTime: checkOutTimeStr,
            createdAt: new Date(),
            updatedAt: new Date(),
            tenantId: auth.currentUser.uid
        };
        
        console.log('[BookingsView] נתונים לשמירה:', {
            checkInTimeStr,
            checkOutTimeStr,
            checkInTime: checkInTimeStr,
            checkOutTime: checkOutTimeStr,
            dataToSave
        });
        
        // המרת תאריכים לאובייקט Date בצורה בטוחה
        const newCheckIn = toDateSafe(bookingData.checkIn);
        const newCheckOut = toDateSafe(bookingData.checkOut);

        console.log('[BookingsView] תאריכים לאחר המרה:', {
            checkIn: newCheckIn,
            checkOut: newCheckOut
        });

        // בדיקת חפיפה עם כל ההזמנות הקיימות (למעט הזמנה שנערכת כרגע)
        const hasOverlap = bookings.some(b => {
            if (selectedBooking && b.id === selectedBooking.id) return false;
            const bCheckIn = toDateSafe(b.checkIn);
            const bCheckOut = toDateSafe(b.checkOut);
            const overlap = isOverlap(newCheckIn, newCheckOut, bCheckIn, bCheckOut);
            console.log('[BookingsView] בדיקת חפיפה עם הזמנה:', {
                existing: b.guestName,
                existingCheckIn: bCheckIn,
                existingCheckOut: bCheckOut,
                hasOverlap: overlap
            });
            return overlap;
        });

        if (hasOverlap) {
            console.log('[BookingsView] נמצאה חפיפה - מציג אזהרה');
            setDuplicateModalOpen(true);
            return;
        }

        try {
            // אם זו הזמנה חדשה, נצור גם אורח חדש
            if (!selectedBooking && bookingData.guestName && bookingData.guestPhone && bookingData.guestEmail) {
                try {
                    console.log('[BookingsView] יוצר אורח חדש');
                    await addDoc(collection(db, 'guests'), {
                        name: bookingData.guestName,
                        phone: bookingData.guestPhone,
                        email: bookingData.guestEmail,
                        notes: `נוצר אוטומטית מהזמנה - ${new Date().toLocaleDateString('he-IL')}`,
                        tenantId: auth.currentUser.uid
                    });
                    console.log('[BookingsView] אורח נוצר בהצלחה');
                } catch (guestError) {
                    console.warn('שגיאה ביצירת אורח:', guestError);
                    // נמשיך עם ההזמנה גם אם יצירת האורח נכשלה
                }
            }

            if (selectedBooking) {
                console.log('[BookingsView] מעדכן הזמנה קיימת:', selectedBooking.id);
                await updateDoc(doc(db, 'bookings', selectedBooking.id), dataToSave);
            } else {
                console.log('[BookingsView] יוצר הזמנה חדשה');
                const docRef = await addDoc(collection(db, 'bookings'), dataToSave);
                console.log('[BookingsView] הזמנה נוצרה עם ID:', docRef.id);
            }
            
            console.log('[BookingsView] הזמנה נשמרה בהצלחה');
            handleCloseModal();
        } catch (error) {
            console.error('[BookingsView] שגיאה בשמירת ההזמנה:', error);
            handleError(error, 'שגיאה בשמירת ההזמנה');
        }
    };

    const handleDelete = async (bookingId) => {
        try {
            await deleteDoc(doc(db, 'bookings', bookingId));
        } catch (error) {
            handleError(error, 'שגיאה במחיקת ההזמנה');
        }
    };

    const handleDateClick = (date) => {
        setSelectedBooking(null);
        setIsModalOpen(true);
    };

    const handleBookingClick = (booking) => {
        if (onProjectSelect) {
            onProjectSelect(booking.id);
        }
        setSelectedBooking(booking);
        setIsModalOpen(true);
    };

    if (loading) {
        return (
            <div className="flex justify-center items-center h-full p-8 animate-fade-in">
                <div className="modern-card p-8 text-center max-w-md">
                    <div className="w-16 h-16 bg-gradient-primary rounded-2xl mx-auto mb-4 flex items-center justify-center animate-pulse-soft">
                        <div className="w-8 h-8 border-4 border-white border-t-transparent rounded-full animate-spin"></div>
                    </div>
                    <h3 className="text-xl font-semibold text-primary-800 mb-2">טוען הזמנות...</h3>
                    <p className="text-primary-600">מביא נתונים מהשרת</p>
                </div>
            </div>
        );
    }

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
                        <span className="text-2xl"><CalendarIcon /></span>
                    </div>
                    <h2 className="text-2xl font-bold text-primary-900">ניהול הזמנות</h2>
                </div>
                <div className="flex items-center gap-2">
                    <Button
                        onClick={() => setViewMode(viewMode === 'calendar' ? 'list' : 'calendar')}
                        variant="ghost"
                        size="md"
                        icon={viewMode === 'calendar' ? <ListIcon className="w-5 h-5" /> : <CalendarIcon className="w-5 h-5" />}
                    >
                        {viewMode === 'calendar' ? 'תצוגת רשימה' : 'תצוגת לוח שנה'}
                    </Button>
                    <Button
                        onClick={handleAdd}
                        variant="accent"
                        size="md"
                        icon={<PlusCircleIcon className="w-5 h-5" />}
                        className="min-w-[140px]"
                    >
                        הזמנה חדשה
                    </Button>
                </div>
            </div>
            
            {/* Main Content */}
            <div className="flex-1">
                {viewMode === 'calendar' ? (
                    <BookingsCalendar
                        bookings={bookings}
                        onEdit={handleEdit}
                        onDelete={handleDelete}
                        onDateClick={handleDateClick}
                    />
                ) : (
                    <BookingsList 
                        bookings={bookings} 
                        onEdit={handleEdit} 
                        onDelete={handleDelete}
                    />
                )}
            </div>

            {/* Booking Form Modal */}
            <Modal isOpen={isModalOpen} onClose={handleCloseModal}>
                <div className="p-6 max-w-2xl w-full">
                    <div className="flex items-center gap-3 mb-6 pb-4 border-b border-primary-100">
                        <div className="p-2 bg-gradient-primary rounded-xl">
                            <CalendarIcon className="w-5 h-5 text-white" />
                        </div>
                        <h2 className="text-xl font-bold text-primary-800">
                            {selectedBooking ? 'עריכת הזמנה' : 'הזמנה חדשה'}
                        </h2>
                    </div>
                    
                    <BookingForm
                        booking={selectedBooking}
                        onSubmit={handleSave}
                        onCancel={handleCloseModal}
                    />
                </div>
            </Modal>

            {/* Duplicate Warning Modal */}
            <Modal isOpen={duplicateModalOpen} onClose={() => setDuplicateModalOpen(false)}>
                <div className="p-6 text-center max-w-md">
                    <div className="w-16 h-16 bg-gradient-error rounded-2xl mx-auto mb-4 flex items-center justify-center">
                        <span className="text-white text-2xl">⚠️</span>
                    </div>
                    <h2 className="text-xl font-bold text-error-800 mb-4">שגיאת כפילות</h2>
                    <p className="text-error-600 mb-6">כבר קיימת הזמנה בתאריכים אלו!</p>
                    <Button
                        onClick={() => setDuplicateModalOpen(false)}
                        variant="error"
                        size="md"
                        className="w-full"
                    >
                        הבנתי
                    </Button>
                </div>
            </Modal>
        </div>
    );
} 