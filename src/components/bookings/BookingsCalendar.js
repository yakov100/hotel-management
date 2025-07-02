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

    // פונקציה שמחזירה צבע קבוע לפי שם - צבעים פשוטים וברורים
    function getGuestColor(name) {
        const colors = [
            'bg-blue-500 text-white border-blue-600', 
            'bg-green-500 text-white border-green-600', 
            'bg-purple-500 text-white border-purple-600', 
            'bg-pink-500 text-white border-pink-600', 
            'bg-orange-500 text-white border-orange-600',
            'bg-teal-500 text-white border-teal-600', 
            'bg-indigo-500 text-white border-indigo-600', 
            'bg-cyan-500 text-white border-cyan-600', 
            'bg-red-500 text-white border-red-600',
            'bg-yellow-500 text-white border-yellow-600',
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
            <div className="p-8 text-center bg-white rounded-lg shadow-md border">
                <div className="w-16 h-16 bg-blue-500 rounded-lg mx-auto mb-4 flex items-center justify-center">
                    <CalendarIcon className="w-8 h-8 text-white" />
                </div>
                <h3 className="text-lg font-semibold text-gray-800 mb-2">אין הזמנות להצגה</h3>
                <p className="text-gray-600">לחץ על יום כדי להוסיף הזמנה חדשה</p>
            </div>
        );
    }

    return (
        <div className="p-4 bg-white rounded-lg shadow-md border">
            {/* Header */}
            <div className="flex items-center justify-between mb-6">
                <Button
                    onClick={handlePrevMonth}
                    variant="secondary"
                    size="sm"
                    icon={<span className="text-lg font-bold">←</span>}
                    className="px-3 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 border border-gray-300 rounded-md transition-colors duration-200"
                />
                <h2 className="text-2xl font-bold text-gray-800">
                    {formatMonth(currentDate)}
                </h2>
                <Button
                    onClick={handleNextMonth}
                    variant="secondary"
                    size="sm"
                    icon={<span className="text-lg font-bold">→</span>}
                    className="px-3 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 border border-gray-300 rounded-md transition-colors duration-200"
                />
            </div>

            {/* Calendar Grid */}
            <div className="bg-gray-50 rounded-lg p-4 border">
                <div className="grid grid-cols-7 gap-2">
                    {/* Week Days */}
                    {weekDays.map((day) => (
                        <div key={day} className="text-center py-3 font-semibold text-gray-700 border-b border-gray-300">
                            {day}
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
                                    relative min-h-[120px] p-2 border border-gray-200 cursor-pointer transition-colors duration-200
                                    ${isCurrentMonth ? 'bg-white' : 'bg-gray-100'}
                                    ${isCurrentDay ? 'bg-blue-50 border-blue-400 border-2' : ''}
                                    hover:bg-blue-50
                                `}
                            >
                                {/* Day Number */}
                                <div className="text-right mb-2">
                                    <span className={`
                                        text-sm font-semibold px-2 py-1 rounded
                                        ${isCurrentDay ? 'bg-blue-500 text-white' : 'text-gray-700'}
                                    `}>
                                        {format(day, 'd')}
                                    </span>
                                </div>
                                
                                {/* Bookings */}
                                <div className="space-y-1">
                                    {dayBookings.map((booking) => (
                                        <div
                                            key={booking.id}
                                            onClick={(e) => handleBookingClick(booking, e)}
                                            className={`
                                                text-xs font-medium py-1 px-2 rounded cursor-pointer border
                                                hover:opacity-80 transition-opacity duration-200
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
                                    <div className="mt-1">
                                        {dayNotes.map((note) => (
                                            <div
                                                key={note.id}
                                                className="text-xs p-1 rounded bg-yellow-100 text-yellow-800 border border-yellow-300"
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