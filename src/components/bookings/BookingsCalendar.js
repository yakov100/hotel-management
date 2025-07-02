import React, { useState } from 'react';
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameMonth, isToday } from 'date-fns';
import { formatMonth, isDateInRange, toDateSafe } from '../../utils/dateUtils';
import { CalendarIcon } from '../Icons';
import Button from '../common/Button';
import BookingDetailsCard from './BookingDetailsCard';

export default function BookingsCalendar({ bookings, onEdit, onDelete, onDateClick, notes = [] }) {
    const [currentDate, setCurrentDate] = useState(new Date());
    const [selectedBooking, setSelectedBooking] = useState(null);
    const [cardPosition, setCardPosition] = useState({ x: 0, y: 0 });

    const monthStart = startOfMonth(currentDate);
    const monthEnd = endOfMonth(currentDate);
    const days = eachDayOfInterval({ start: monthStart, end: monthEnd });

    const weekDays = ['א', 'ב', 'ג', 'ד', 'ה', 'ו', 'ש'];

    const handlePrevMonth = () => {
        setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1));
        setSelectedBooking(null);
    };

    const handleNextMonth = () => {
        setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1));
        setSelectedBooking(null);
    };

    const handleBookingClick = (booking, event) => {
        event.stopPropagation();
        setCardPosition({ x: 0, y: 0 }); // לא נשתמש בערכים האלה עכשיו
        setSelectedBooking(booking);
    };

    const closeBookingDetails = () => {
        setSelectedBooking(null);
    };

    // פונקציה שמחזירה צבע קבוע לפי שם
    function getGuestColor(name) {
        const colors = [
            'bg-blue-500', 'bg-green-500', 'bg-purple-500', 'bg-pink-500', 'bg-yellow-500',
            'bg-teal-500', 'bg-orange-500', 'bg-indigo-500', 'bg-emerald-500', 'bg-cyan-500',
        ];
        let hash = 0;
        for (let i = 0; i < name.length; i++) {
            hash = name.charCodeAt(i) + ((hash << 5) - hash);
        }
        const idx = Math.abs(hash) % colors.length;
        return colors[idx];
    }

    if (!bookings?.length) {
        return (
            <div className="p-12 text-center animate-fade-in bg-white rounded-2xl shadow-lg">
                <div className="w-20 h-20 bg-gradient-primary rounded-2xl mx-auto mb-6 flex items-center justify-center">
                    <CalendarIcon className="w-10 h-10 text-white" />
                </div>
                <h3 className="text-xl font-semibold text-primary-900 mb-2">אין הזמנות להצגה</h3>
                <p className="text-primary-700 font-medium">לחץ על יום כדי להוסיף הזמנה חדשה</p>
            </div>
        );
    }

    return (
        <div className="p-4 animate-fade-in bg-white rounded-2xl shadow-lg">
            {/* Header */}
            <div className="flex items-center justify-between mb-6">
                <Button
                    onClick={handlePrevMonth}
                    variant="glass"
                    size="sm"
                    icon={<span className="text-lg">←</span>}
                    className="w-10 h-10 rounded-full bg-white/80 backdrop-blur-sm border border-white/30 shadow-lg hover:shadow-xl transition-all duration-200"
                />
                <h2 className="text-3xl font-bold text-primary-900 bg-gradient-to-r from-primary-600 to-accent-500 bg-clip-text text-transparent">
                    {formatMonth(currentDate)}
                </h2>
                <Button
                    onClick={handleNextMonth}
                    variant="glass"
                    size="sm"
                    icon={<span className="text-lg">→</span>}
                    className="w-10 h-10 rounded-full bg-white/80 backdrop-blur-sm border border-white/30 shadow-lg hover:shadow-xl transition-all duration-200"
                />
            </div>

            {/* Calendar Grid */}
            <div className="grid grid-cols-7 gap-3 p-1 bg-gradient-to-br from-gray-100/50 to-primary-100/20 rounded-3xl backdrop-blur-sm">
                {/* Week Days */}
                {weekDays.map(day => (
                    <div key={day} className="text-center text-base font-bold bg-gradient-to-br from-primary-600 to-accent-500 bg-clip-text text-transparent py-3 border-b border-primary-100/30">
                        {day}
                    </div>
                ))}

                {/* Calendar Days */}
                {days.map(day => {
                    const dayBookings = bookings.filter(b => 
                        isDateInRange(day, toDateSafe(b.checkIn), toDateSafe(b.checkOut))
                    );
                    const dayNotes = notes.filter(note => 
                        isDateInRange(day, toDateSafe(note.date), toDateSafe(note.date))
                    );
                    const isCurrentMonth = isSameMonth(day, currentDate);
                    const isCurrentDay = isToday(day);
                    return (
                        <div
                            key={day.toString()}
                            onClick={() => onDateClick(day)}
                            className={`
                                relative min-h-[120px] p-2 rounded-2xl transition-all duration-200 cursor-pointer flex flex-col
                                ${isCurrentMonth ? 'bg-white/90 backdrop-blur-sm' : 'bg-gray-100/60'}
                                ${isCurrentDay ? 'border-2 border-accent-500/50 shadow-lg shadow-accent-200/50' : 'border border-primary-100/30'}
                                hover:bg-gradient-to-br hover:from-white hover:to-accent-50 hover:shadow-xl hover:scale-[1.02]
                                after:absolute after:inset-0 after:rounded-2xl after:shadow-[inset_0_0_0.5px_rgba(0,0,0,0.1)] after:pointer-events-none
                            `}
                        >
                            {/* Day Number */}
                            <div className="text-right mb-2 relative z-10">
                                <span className={`
                                    text-base font-bold px-3 py-1 rounded-xl
                                    ${isCurrentDay ? 'bg-gradient-to-r from-accent-500 to-primary-500 text-white shadow-lg' : 'text-primary-700'}
                                `}>
                                    {format(day, 'd')}
                                </span>
                            </div>
                            {/* Bookings */}
                            <div className="space-y-2 relative z-10 flex flex-col items-center">
                                {dayBookings.map(booking => (
                                    <div
                                        key={booking.id}
                                        onClick={(e) => handleBookingClick(booking, e)}
                                        className={`
                                            text-[10px] font-medium py-1.5 px-1 rounded text-white cursor-pointer 
                                            hover:opacity-90 transition-all shadow-sm backdrop-blur-sm mx-auto
                                            ${getGuestColor(booking.guestName)}
                                        `}
                                        style={{ minWidth: 0, maxWidth: '120px' }}
                                    >
                                        <span className="truncate block text-center mx-auto" style={{ direction: 'rtl' }}>{booking.guestName}</span>
                                    </div>
                                ))}
                            </div>
                            {/* Notes */}
                            {dayNotes.length > 0 && (
                                <div className="mt-2 relative z-10">
                                    {dayNotes.map(note => (
                                        <div
                                            key={note.id}
                                            className="text-xs p-2 rounded-xl bg-gradient-to-r from-yellow-100 to-orange-100 text-yellow-800 border border-yellow-200/50 shadow-md backdrop-blur-sm"
                                        >
                                            {note.text}
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    );
                })}
            </div>
            {/* Booking Details Modal */}
            <BookingDetailsCard
                booking={selectedBooking}
                isOpen={!!selectedBooking}
                onClose={closeBookingDetails}
                onEdit={onEdit}
                onDelete={onDelete}
            />
        </div>
    );
} 