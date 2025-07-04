import React from 'react';
import { createPortal } from 'react-dom';
import { formatDateTime, toDateSafe } from '../../utils/dateUtils';
import { EditIcon, Trash2Icon, UserIcon, CalendarIcon, ClockIcon, NotebookIcon } from '../Icons';
import Button from '../common/Button';

export default function BookingDetailsCard({ booking, isOpen, onClose, onEdit, onDelete }) {
    if (!isOpen || !booking) return null;

    const handleEdit = () => {
        onEdit(booking);
        onClose();
    };

    const handleDelete = () => {
        if (window.confirm('האם אתה בטוח שברצונך למחוק הזמנה זו?')) {
            onDelete(booking.id);
            onClose();
        }
    };

    return createPortal(
        <div 
            className="fixed inset-0 bg-black/30 backdrop-blur-sm z-[60] flex items-start justify-center pt-16 p-4"
            onClick={onClose}
            style={{ 
                zIndex: 9999,
                position: 'fixed',
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                transform: 'none'
            }}
        >
            {/* Card */}
            <div 
                className="bg-white/95 backdrop-blur-xl rounded-3xl shadow-2xl w-full max-w-md max-h-[90vh] overflow-y-auto animate-scale-in border border-white/20 relative"
                onClick={e => e.stopPropagation()}
            >
                {/* Header */}
                <div className="p-6 pb-4 border-b border-primary-100 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-gradient-to-l from-purple-500 to-blue-400 rounded-xl">
                            <UserIcon className="w-5 h-5 text-white" />
                        </div>
                        <div>
                            <h3 className="text-xl font-bold text-primary-800">
                                {booking.guestName}
                            </h3>
                            <p className="text-sm text-primary-600">פרטי הזמנה</p>
                        </div>
                    </div>
                    <button
                        onClick={onClose}
                        className="p-2 rounded-xl bg-white/80 hover:bg-white border border-white/30 text-primary-600 hover:text-primary-800 transition-all duration-200"
                        aria-label="סגור כרטיס"
                    >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>
                </div>
                {/* Content */}
                <div className="p-6 space-y-4">
                    {/* Contact Info */}
                    {(booking?.guestPhone || booking?.guestEmail) && (
                        <div className="space-y-3">
                            {booking?.guestPhone && (
                                <div className="flex items-center gap-3 p-3 bg-blue-50/60 rounded-xl">
                                    <span className="text-blue-600 text-lg">📞</span>
                                    <div>
                                        <p className="text-sm text-primary-600 font-medium">טלפון</p>
                                        <p className="text-primary-800 font-semibold">{booking.guestPhone}</p>
                                    </div>
                                </div>
                            )}
                            {booking?.guestEmail && (
                                <div className="flex items-center gap-3 p-3 bg-purple-50/60 rounded-xl">
                                    <span className="text-purple-600 text-lg">✉️</span>
                                    <div>
                                        <p className="text-sm text-primary-600 font-medium">אימייל</p>
                                        <p className="text-blue-600 font-semibold">{booking.guestEmail}</p>
                                    </div>
                                </div>
                            )}
                        </div>
                    )}
                    {/* Dates */}
                    <div className="space-y-3">
                        <div className="flex items-center gap-3 p-3 bg-primary-50/60 rounded-xl">
                            <CalendarIcon className="w-5 h-5 text-success-600" />
                            <div>
                                <p className="text-sm text-primary-600 font-medium">תאריך כניסה</p>
                                <p className="text-primary-800 font-semibold">
                                    {formatDateTime(toDateSafe(booking.checkIn))}
                                </p>
                            </div>
                        </div>
                        <div className="flex items-center gap-3 p-3 bg-primary-50/60 rounded-xl">
                            <CalendarIcon className="w-5 h-5 text-error-600" />
                            <div>
                                <p className="text-sm text-primary-600 font-medium">תאריך יציאה</p>
                                <p className="text-primary-800 font-semibold">
                                    {formatDateTime(toDateSafe(booking.checkOut))}
                                </p>
                            </div>
                        </div>
                    </div>
                    {/* Duration */}
                    <div className="flex items-center gap-3 p-3 bg-accent-50/60 rounded-xl">
                        <ClockIcon className="w-5 h-5 text-accent-600" />
                        <div>
                            <p className="text-sm text-primary-600 font-medium">משך השהייה</p>
                            <p className="text-primary-800 font-semibold">
                                {(() => {
                                    const checkIn = toDateSafe(booking.checkIn);
                                    const checkOut = toDateSafe(booking.checkOut);
                                    const diffTime = checkOut - checkIn;
                                    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
                                    return diffDays > 0 ? `${diffDays} לילות` : 'פחות מיום';
                                })()}
                            </p>
                        </div>
                    </div>
                    {/* Status */}
                    <div className="flex items-center gap-3 p-3 bg-success-50/60 rounded-xl">
                        <div className="w-3 h-3 bg-success-500 rounded-full"></div>
                        <div>
                            <p className="text-sm text-primary-600 font-medium">סטטוס</p>
                            <p className="text-success-700 font-semibold">
                                {booking.status === 'confirmed' ? 'מאושר' : booking.status}
                            </p>
                        </div>
                    </div>
                    {/* Notes */}
                    {booking.notes && (
                        <div className="p-3 bg-warning-50/60 rounded-xl">
                            <div className="flex items-start gap-3">
                                <NotebookIcon className="w-5 h-5 text-warning-600 mt-0.5" />
                                <div>
                                    <p className="text-sm text-primary-600 font-medium mb-1">הערות</p>
                                    <p className="text-primary-700 text-sm leading-relaxed">
                                        {booking.notes}
                                    </p>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
                {/* Actions */}
                <div className="p-6 pt-4 border-t border-primary-100">
                    <div className="flex gap-3">
                        <Button
                            onClick={handleEdit}
                            variant="primary"
                            size="md"
                            className="flex-1"
                            icon={<EditIcon className="w-4 h-4" />}
                        >
                            ערוך הזמנה
                        </Button>
                        <Button
                            onClick={handleDelete}
                            variant="error"
                            size="md"
                            className="flex-1"
                            icon={<Trash2Icon className="w-4 h-4" />}
                        >
                            מחק הזמנה
                        </Button>
                    </div>
                </div>
            </div>
        </div>,
        document.body
    );
} 