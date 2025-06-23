import React, { useState } from 'react';
// Commented out useCollection import since it causes errors without tenantId
// import { useCollection } from '../hooks/useCollection';
import { formatDate, toDateSafe } from '../utils/dateUtils';

export default function DebugPanel({ bookings = [] }) {
    const [isOpen, setIsOpen] = useState(false);
    // Commented out problematic useCollection call
    // const { data: bookings, loading, error } = useCollection('bookings');
    const loading = false;
    const error = null;

    if (!isOpen) {
        return (
            <div className="fixed bottom-4 left-4 z-50">
                <button
                    onClick={() => setIsOpen(true)}
                    className="bg-red-600 text-white p-3 rounded-full shadow-lg hover:bg-red-700 transition-colors"
                    title="פתח חלון דיבוג"
                >
                    🐛
                </button>
            </div>
        );
    }

    return (
        <div className="fixed bottom-4 left-4 z-50 bg-white border border-gray-300 rounded-lg shadow-xl p-4 max-w-md max-h-96 overflow-y-auto">
            <div className="flex justify-between items-center mb-3">
                <h3 className="font-bold text-lg">דיבוג הזמנות</h3>
                <button
                    onClick={() => setIsOpen(false)}
                    className="text-gray-500 hover:text-gray-700"
                >
                    ✕
                </button>
            </div>
            
            <div className="space-y-2 text-sm">
                <div>
                    <strong>סטטוס:</strong> {loading ? 'טוען...' : error ? 'שגיאה' : 'מוכן'}
                </div>
                
                <div>
                    <strong>מספר הזמנות:</strong> {bookings?.length || 0}
                </div>
                
                {error && (
                    <div className="text-red-600">
                        <strong>שגיאה:</strong> {error.message}
                    </div>
                )}
                
                <div>
                    <strong>תאריך נוכחי:</strong> {formatDate(new Date())}
                </div>
                
                {bookings && bookings.length > 0 && (
                    <div>
                        <strong>הזמנות אחרונות:</strong>
                        <div className="mt-2 space-y-1">
                            {bookings.slice(0, 5).map(booking => (
                                <div key={booking.id} className="bg-gray-50 p-2 rounded text-xs">
                                    <div><strong>{booking.guestName}</strong></div>
                                    <div>כניסה: {formatDate(toDateSafe(booking.checkIn))}</div>
                                    <div>יציאה: {formatDate(toDateSafe(booking.checkOut))}</div>
                                    <div>סטטוס: {booking.status}</div>
                                    <div>ID: {booking.id}</div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}
                
                <button
                    onClick={() => {
                        console.log('כל ההזמנות:', bookings);
                        alert('נתונים הודפסו לקונסול');
                    }}
                    className="bg-blue-500 text-white px-3 py-1 rounded text-xs hover:bg-blue-600"
                >
                    הדפס לקונסול
                </button>
            </div>
        </div>
    );
} 