import React, { useState, useEffect } from 'react';
import { Input, Textarea, Select } from '../common/FormInputs';
import Button from '../common/Button';

export default function BookingForm({ booking, onSubmit, onCancel }) {
    const [formData, setFormData] = useState({
        guestName: '',
        guestPhone: '',
        guestEmail: '',
        checkIn: '',
        checkInTime: '14:00',
        checkOut: '',
        checkOutTime: '10:00',
        status: 'confirmed',
        notes: ''
    });

    useEffect(() => {
        if (booking) {
            const checkInDate = booking.checkIn ? booking.checkIn.toDate() : null;
            const checkOutDate = booking.checkOut ? booking.checkOut.toDate() : null;
            
            setFormData({
                guestName: booking.guestName || '',
                guestPhone: booking.guestPhone || '',
                guestEmail: booking.guestEmail || '',
                checkIn: checkInDate ? checkInDate.toISOString().split('T')[0] : '',
                checkInTime: checkInDate ? checkInDate.toLocaleTimeString('he-IL', { hour: '2-digit', minute: '2-digit' }) : '14:00',
                checkOut: checkOutDate ? checkOutDate.toISOString().split('T')[0] : '',
                checkOutTime: checkOutDate ? checkOutDate.toLocaleTimeString('he-IL', { hour: '2-digit', minute: '2-digit' }) : '10:00',
                status: booking.status || 'confirmed',
                notes: booking.notes || ''
            });
        }
    }, [booking]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        
        // יצירת אובייקטי תאריך לצ'ק-אין וצ'ק-אאוט
        const checkInDateTime = new Date(formData.checkIn);
        const [checkInHours, checkInMinutes] = formData.checkInTime.split(':');
        checkInDateTime.setHours(parseInt(checkInHours, 10), parseInt(checkInMinutes, 10));

        const checkOutDateTime = new Date(formData.checkOut);
        const [checkOutHours, checkOutMinutes] = formData.checkOutTime.split(':');
        checkOutDateTime.setHours(parseInt(checkOutHours, 10), parseInt(checkOutMinutes, 10));

        // שליחת הנתונים עם השעות בפורמט מחרוזת
        onSubmit({
            ...formData,
            checkIn: checkInDateTime,
            checkOut: checkOutDateTime,
            // שמירת השעות כמחרוזות נפרדות
            checkInTimeStr: formData.checkInTime,
            checkOutTimeStr: formData.checkOutTime
        });
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-4" dir="rtl">
            <Input
                label="שם האורח"
                type="text"
                id="guestName"
                name="guestName"
                value={formData.guestName}
                onChange={handleChange}
                required
                placeholder="הכנס שם מלא"
            />
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="w-full">
                    <Input
                        label="טלפון"
                        type="tel"
                        id="guestPhone"
                        name="guestPhone"
                        value={formData.guestPhone}
                        onChange={handleChange}
                        required
                        placeholder="לדוג' 050-1234567"
                    />
                </div>
                <div className="w-full">
                    <Input
                        label="אימייל"
                        type="email"
                        id="guestEmail"
                        name="guestEmail"
                        value={formData.guestEmail}
                        onChange={handleChange}
                        required
                        placeholder="example@email.com"
                    />
                </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="w-full">
                    <label className="block text-sm font-medium text-gray-700 mb-1">צ'ק-אין</label>
                    <div className="grid grid-cols-2 gap-2">
                        <Input
                            type="time"
                            id="checkInTime"
                            name="checkInTime"
                            value={formData.checkInTime}
                            onChange={handleChange}
                            required
                        />
                        <Input
                            type="date"
                            id="checkIn"
                            name="checkIn"
                            value={formData.checkIn}
                            onChange={handleChange}
                            required
                        />
                    </div>
                </div>
                <div className="w-full">
                    <label className="block text-sm font-medium text-gray-700 mb-1">צ'ק-אאוט</label>
                    <div className="grid grid-cols-2 gap-2">
                        <Input
                            type="time"
                            id="checkOutTime"
                            name="checkOutTime"
                            value={formData.checkOutTime}
                            onChange={handleChange}
                            required
                        />
                        <Input
                            type="date"
                            id="checkOut"
                            name="checkOut"
                            value={formData.checkOut}
                            onChange={handleChange}
                            required
                        />
                    </div>
                </div>
            </div>
            <Select
                label="סטטוס"
                id="status"
                name="status"
                value={formData.status}
                onChange={handleChange}
            >
                <option value="confirmed">מאושר</option>
                <option value="pending">ממתין</option>
                <option value="cancelled">בוטל</option>
            </Select>
            <Textarea
                label="הערות"
                id="notes"
                name="notes"
                value={formData.notes}
                onChange={handleChange}
                rows={3}
                placeholder="הערות נוספות להזמנה..."
            />
            <div className="flex justify-end gap-3 mt-6">
                <Button type="button" variant="secondary" onClick={onCancel}>
                    ביטול
                </Button>
                <Button type="submit" variant="primary">
                    {booking ? 'עדכן' : 'צור'} הזמנה
                </Button>
            </div>
        </form>
    );
} 