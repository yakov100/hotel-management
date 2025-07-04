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
    const [isChangingMonth, setIsChangingMonth] = useState(false);

    const monthStart = startOfMonth(currentDate);
    const monthEnd = endOfMonth(currentDate);
    const days = eachDayOfInterval({ start: monthStart, end: monthEnd });

    const weekDays = ['ראשון', 'שני', 'שלישי', 'רביעי', 'חמישי', 'שישי', 'שבת'];

    const handlePrevMonth = () => {
        setIsChangingMonth(true);
        setTimeout(() => {
            setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1));
            setSelectedBooking(null);
            setIsChangingMonth(false);
        }, 150);
    };

    const handleNextMonth = () => {
        setIsChangingMonth(true);
        setTimeout(() => {
            setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1));
            setSelectedBooking(null);
            setIsChangingMonth(false);
        }, 150);
    };

    const handleBookingClick = (booking, event) => {
        event.stopPropagation();
        setCardPosition({ x: 0, y: 0 }); // לא נשתמש בערכים האלה עכשיו
        setSelectedBooking(booking);
    };

    const closeBookingDetails = () => {
        setSelectedBooking(null);
    };

    // פונקציה שמחזירה צבע קבוע לפי שם - צבעי פסטל רכים ומודרניים
    function getGuestColor(name) {
        const colors = [
            'bg-blue-100 text-blue-700 border-blue-200 hover:bg-blue-200', 
            'bg-green-100 text-green-700 border-green-200 hover:bg-green-200', 
            'bg-purple-100 text-purple-700 border-purple-200 hover:bg-purple-200', 
            'bg-pink-100 text-pink-700 border-pink-200 hover:bg-pink-200', 
            'bg-orange-100 text-orange-700 border-orange-200 hover:bg-orange-200',
            'bg-teal-100 text-teal-700 border-teal-200 hover:bg-teal-200', 
            'bg-indigo-100 text-indigo-700 border-indigo-200 hover:bg-indigo-200', 
            'bg-cyan-100 text-cyan-700 border-cyan-200 hover:bg-cyan-200', 
            'bg-red-100 text-red-700 border-red-200 hover:bg-red-200',
            'bg-yellow-100 text-yellow-700 border-yellow-200 hover:bg-yellow-200',
            'bg-emerald-100 text-emerald-700 border-emerald-200 hover:bg-emerald-200',
            'bg-rose-100 text-rose-700 border-rose-200 hover:bg-rose-200',
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
            <div className="p-8 text-center bg-white/90 backdrop-blur-xl rounded-3xl shadow-lg border border-white/20">
                <div className="w-16 h-16 bg-gradient-to-br from-blue-50 to-purple-100 rounded-2xl mx-auto mb-4 flex items-center justify-center">
                    <CalendarIcon className="w-8 h-8 text-blue-400" />
                </div>
                <h3 className="text-lg font-medium text-gray-700 mb-2">אין הזמנות להצגה</h3>
                <p className="text-gray-500">לחץ על יום כדי להוסיף הזמנה חדשה</p>
            </div>
        );
    }

    return (
        <div className="p-4 bg-white/90 backdrop-blur-xl rounded-3xl shadow-lg border border-white/20">
            {/* Header */}
            <div className="flex items-center justify-between mb-4">
                <button
                    onClick={handlePrevMonth}
                    className="w-10 h-10 bg-white/60 backdrop-blur-sm hover:bg-white/80 text-gray-600 rounded-xl border border-white/40 hover:border-blue-200 transition-all duration-200 flex items-center justify-center hover:scale-105 shadow-sm hover:shadow-md"
                >
                    <span className="text-base font-medium">←</span>
                </button>
                <h2 className="text-2xl font-light text-gray-800">
                    {formatMonth(currentDate)}
                </h2>
                <button
                    onClick={handleNextMonth}
                    className="w-10 h-10 bg-white/60 backdrop-blur-sm hover:bg-white/80 text-gray-600 rounded-xl border border-white/40 hover:border-blue-200 transition-all duration-200 flex items-center justify-center hover:scale-105 shadow-sm hover:shadow-md"
                >
                    <span className="text-base font-medium">→</span>
                </button>
            </div>

            {/* Calendar Grid */}
            <div className="bg-gradient-to-br from-blue-50/60 via-white to-purple-50/40 rounded-2xl p-4 relative overflow-hidden backdrop-blur-sm border border-white/30">
                {/* Modern glass overlay */}
                <div className="absolute inset-0 bg-white/20 backdrop-blur-sm opacity-60"></div>
                <div className="relative z-10">
                    <div className="grid grid-cols-7 gap-3">
                        {/* Week Days */}
                        {weekDays.map((day) => (
                            <div key={day} className="text-center py-2 px-1">
                                <span className="week-day-header text-sm font-medium text-gray-600">
                                    {day}
                                </span>
                            </div>
                        ))}

                        {/* Calendar Days */}
                        {days.map((day, index) => {
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
                                        calendar-day-border relative min-h-[120px] p-3 rounded-2xl cursor-pointer transition-all duration-200 
                                        ${isCurrentMonth 
                                            ? 'bg-white/90 backdrop-blur-sm shadow-sm' 
                                            : 'bg-gray-100/90 border-gray-300/60'
                                        }
                                        ${isCurrentDay ? 'current-day bg-gradient-to-br from-blue-50 to-purple-50 shadow-md' : ''}
                                        hover:shadow-lg hover:scale-[1.02] hover:bg-white/95 hover:backdrop-blur-md
                                    `}
                                >
                                    {/* Day Number */}
                                    <div className="text-right mb-2">
                                        <span className={`
                                            text-base font-bold px-3 py-1.5 rounded-lg
                                            ${isCurrentDay ? 'bg-blue-500 text-white shadow-sm' : 'text-gray-800 bg-gray-50/50'}
                                        `}>
                                            {format(day, 'd')}
                                        </span>
                                    </div>
                                    
                                    {/* Bookings */}
                                    <div className="space-y-1.5">
                                        {dayBookings.map((booking) => (
                                            <div
                                                key={booking.id}
                                                onClick={(e) => handleBookingClick(booking, e)}
                                                className={`
                                                    text-xs font-medium py-1.5 px-2.5 rounded-lg cursor-pointer border transition-all duration-200
                                                    ${getGuestColor(booking.guestName)}
                                                `}
                                            >
                                                <div className="text-center truncate" style={{ direction: 'rtl' }}>
                                                    {booking.guestName}
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                    
                                    {/* Notes */}
                                    {dayNotes.length > 0 && (
                                        <div className="mt-1.5 space-y-1">
                                            {dayNotes.map((note) => (
                                                <div
                                                    key={note.id}
                                                    className="text-xs p-1.5 rounded-lg bg-blue-50/80 text-blue-700 border border-blue-200/60 backdrop-blur-sm"
                                                >
                                                    <div className="truncate text-center">
                                                        {note.text}
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            );
                        })}
                    </div>
                </div>
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