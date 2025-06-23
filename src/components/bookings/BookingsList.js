import React, { useState } from 'react';
import { EditIcon, Trash2Icon } from '../Icons';
import ConfirmationModal from '../common/ConfirmationModal';
import { formatDateTime } from '../../utils/dateUtils';
import { sendEmailToGuest, isValidEmail } from '../../utils/emailUtils';
import CrudList from '../common/CrudList';

const getStatusText = (status) => {
    const statusMap = {
        confirmed: 'מאושר',
        pending: 'ממתין',
        cancelled: 'בוטל'
    };
    return statusMap[status] || status;
};

export default function BookingsList({ bookings, onEdit, onDelete }) {
    const [deleteConfirm, setDeleteConfirm] = useState(null);

    const confirmDelete = () => {
        if (deleteConfirm) {
            onDelete(deleteConfirm);
            setDeleteConfirm(null);
        }
    };

    const handleSendEmail = async (booking) => {
        if (!booking.guestEmail) {
            alert('לא ניתן לשלוח מייל - אין כתובת מייל לאורח זה');
            return;
        }

        if (!isValidEmail(booking.guestEmail)) {
            alert('כתובת המייל לא תקינה');
            return;
        }

        try {
            console.log('📧 שולח מייל לאורח:', booking.guestName);
            console.log('🎯 פרטי ההזמנה המלאים:', booking);
            console.log('⏰ שעת צ\'ק-אין:', booking.checkInTime);
            console.log('📅 תאריך צ\'ק-אין:', booking.checkIn);
            console.log('⏰ שעת צ\'ק-אאוט:', booking.checkOutTime);
            console.log('📅 תאריך צ\'ק-אאוט:', booking.checkOut);

            const result = await sendEmailToGuest(
                booking.guestEmail,
                booking.guestName,
                'מחכים לך!',
                '',
                booking.checkInTime,
                booking.checkInTime,
                booking.checkOutTime
            );

            if (result.success) {
                alert(`המייל נשלח בהצלחה ל-${booking.guestName} (${booking.guestEmail})`);
            } else {
                throw new Error(result.error);
            }
        } catch (error) {
            console.error('שגיאה בשליחת המייל:', error);
            alert(`שגיאה בשליחת המייל ל-${booking.guestName}: ${error.message}`);
        }
    };

    const sortedBookings = [...bookings].sort(
        (a, b) => (b.checkIn?.seconds || 0) - (a.checkIn?.seconds || 0)
    );

    if (!bookings?.length) {
        return (
            <div className="text-center py-8 text-gray-500">
                אין הזמנות להצגה
            </div>
        );
    }

    const columns = [
        { key: 'guestName', label: 'אורח', render: (value, booking) => value || booking?.guestName || '' },
        { 
            key: 'contact', 
            label: 'פרטי קשר',
            render: (_, booking) => (
                <div className="space-y-1">
                    {booking?.guestPhone && (
                        <div className="flex items-center gap-1">
                            <span className="text-gray-400">📞</span>
                            <span>{booking.guestPhone}</span>
                        </div>
                    )}
                    {booking?.guestEmail && (
                        <div className="flex items-center gap-1">
                            <span className="text-gray-400">✉️</span>
                            <span className="text-blue-600">{booking.guestEmail}</span>
                        </div>
                    )}
                </div>
            )
        },
        { 
            key: 'checkIn', 
            label: 'צ\'ק-אין',
            render: (value) => formatDateTime(value)
        },
        { 
            key: 'checkOut', 
            label: 'צ\'ק-אאוט',
            render: (value) => formatDateTime(value)
        },
        { 
            key: 'status', 
            label: 'סטטוס',
            render: (value) => getStatusText(value)
        },
        { 
            key: 'notes', 
            label: 'הערות',
            render: (value) => value || ''
        }
    ];

    return (
        <div className="overflow-x-auto" dir="rtl">
            <CrudList
                items={sortedBookings}
                columns={columns}
                onEdit={onEdit}
                onDelete={onDelete}
                onSendEmail={handleSendEmail}
                showEmailButton={true}
                hideAddButton={true}
            />
            {deleteConfirm && (
                <ConfirmationModal
                    title="אישור מחיקה"
                    message="האם אתה בטוח שברצונך למחוק הזמנה זו?"
                    onConfirm={confirmDelete}
                    onCancel={() => setDeleteConfirm(null)}
                />
            )}
        </div>
    );
} 