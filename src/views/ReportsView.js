import React, { useState } from 'react';
import { exportToCSV } from '../utils/exportUtils';
import Button from '../components/common/Button';
import { BarChartIcon } from '../components/Icons';

export default function ReportsView({ bookings = [], finances = [] }) {
    const [dateRange, setDateRange] = useState({
        start: '',
        end: ''
    });

    const getFilteredData = () => {
        const filteredBookings = bookings.filter(booking => {
            const bookingDate = new Date(booking.checkIn);
            return (!dateRange.start || bookingDate >= new Date(dateRange.start)) &&
                   (!dateRange.end || bookingDate <= new Date(dateRange.end));
        });
        const filteredFinances = finances.filter(finance => {
            const financeDate = new Date(finance.date);
            return (!dateRange.start || financeDate >= new Date(dateRange.start)) &&
                   (!dateRange.end || financeDate <= new Date(dateRange.end));
        });
        return { bookings: filteredBookings, finances: filteredFinances };
    };

    const { bookings: filteredBookings, finances: filteredFinances } = getFilteredData();

    const getOccupancyRate = () => {
        if (!filteredBookings.length) return 0;
        const totalDays = filteredBookings.reduce((sum, booking) => {
            const checkIn = new Date(booking.checkIn);
            const checkOut = new Date(booking.checkOut);
            return sum + Math.ceil((checkOut - checkIn) / (1000 * 60 * 60 * 24));
        }, 0);
        return (totalDays / filteredBookings.length).toFixed(1);
    };

    const getTotalRevenue = () => {
        return filteredFinances
            .filter(f => f.type === 'income')
            .reduce((sum, f) => sum + Number(f.amount), 0);
    };

    const getTotalExpenses = () => {
        return filteredFinances
            .filter(f => f.type === 'expense')
            .reduce((sum, f) => sum + Number(f.amount), 0);
    };

    const getNetIncome = () => {
        return getTotalRevenue() - getTotalExpenses();
    };

    const getAverageBookingValue = () => {
        if (!filteredBookings.length) return 0;
        const totalValue = filteredBookings.reduce((sum, booking) => sum + Number(booking.totalPrice), 0);
        return (totalValue / filteredBookings.length).toFixed(2);
    };

    return (
        <div className="p-6">
            <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-4 mb-8">
                <div className="flex items-center gap-4">
                    <div className="p-3 bg-gradient-to-l from-purple-500 to-blue-400 rounded-2xl text-white shadow-lg flex items-center justify-center">
                        <span className="text-2xl"><BarChartIcon /></span>
                    </div>
                    <h1 className="text-2xl font-bold text-primary-900">דוחות</h1>
                </div>
                <div className="flex flex-wrap gap-2 items-end">
                    <Button
                        onClick={() => exportToCSV(filteredBookings, 'bookings_report.csv')}
                        variant="primary"
                        size="sm"
                        className="min-w-[120px]"
                    >
                        ייצוא הזמנות
                    </Button>
                    <Button
                        onClick={() => exportToCSV(filteredFinances, 'finances_report.csv')}
                        variant="success"
                        size="sm"
                        className="min-w-[120px]"
                    >
                        ייצוא פיננסים
                    </Button>
                    <div>
                        <label className="block text-xs font-medium text-gray-700 mb-1">מתאריך</label>
                        <input
                            type="date"
                            value={dateRange.start}
                            onChange={(e) => setDateRange({ ...dateRange, start: e.target.value })}
                            className="w-full rounded-xl border border-gray-300 px-3 py-2 focus:border-accent-400 focus:ring-2 focus:ring-accent-300 transition placeholder-gray-400 text-sm bg-white"
                        />
                    </div>
                    <div>
                        <label className="block text-xs font-medium text-gray-700 mb-1">עד תאריך</label>
                        <input
                            type="date"
                            value={dateRange.end}
                            onChange={(e) => setDateRange({ ...dateRange, end: e.target.value })}
                            className="w-full rounded-xl border border-gray-300 px-3 py-2 focus:border-accent-400 focus:ring-2 focus:ring-accent-300 transition placeholder-gray-400 text-sm bg-white"
                        />
                    </div>
                </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                <div className="bg-white rounded-2xl shadow-lg p-6 flex flex-col items-center border border-white/20">
                    <h3 className="text-lg font-semibold text-primary-700 mb-2">הכנסות</h3>
                    <p className="text-3xl font-bold text-green-600">₪{getTotalRevenue().toLocaleString()}</p>
                </div>
                <div className="bg-white rounded-2xl shadow-lg p-6 flex flex-col items-center border border-white/20">
                    <h3 className="text-lg font-semibold text-primary-700 mb-2">הוצאות</h3>
                    <p className="text-3xl font-bold text-red-600">₪{getTotalExpenses().toLocaleString()}</p>
                </div>
                <div className="bg-white rounded-2xl shadow-lg p-6 flex flex-col items-center border border-white/20">
                    <h3 className="text-lg font-semibold text-primary-700 mb-2">רווח נקי</h3>
                    <p className={`text-3xl font-bold ${getNetIncome() >= 0 ? 'text-green-600' : 'text-red-600'}`}>₪{getNetIncome().toLocaleString()}</p>
                </div>
                <div className="bg-white rounded-2xl shadow-lg p-6 flex flex-col items-center border border-white/20">
                    <h3 className="text-lg font-semibold text-primary-700 mb-2">הכנסה ממוצעת להזמנה</h3>
                    <p className="text-3xl font-bold text-blue-600">₪{getAverageBookingValue()}</p>
                </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="bg-white rounded-2xl shadow-lg p-6 border border-white/20">
                    <h2 className="text-xl font-bold mb-4 text-primary-800">סיכום הזמנות</h2>
                    <div className="space-y-4">
                        <div>
                            <p className="text-sm text-primary-600">מספר הזמנות</p>
                            <p className="text-2xl font-bold">{filteredBookings.length}</p>
                        </div>
                        <div>
                            <p className="text-sm text-primary-600">אחוז תפוסה ממוצע</p>
                            <p className="text-2xl font-bold">{getOccupancyRate()}%</p>
                        </div>
                    </div>
                </div>
                <div className="bg-white rounded-2xl shadow-lg p-6 border border-white/20">
                    <h2 className="text-xl font-bold mb-4 text-primary-800">סיכום פיננסי</h2>
                    <div className="space-y-4">
                        <div>
                            <p className="text-sm text-primary-600">הכנסות</p>
                            <p className="text-2xl font-bold text-green-600">₪{getTotalRevenue().toLocaleString()}</p>
                        </div>
                        <div>
                            <p className="text-sm text-primary-600">הוצאות</p>
                            <p className="text-2xl font-bold text-red-600">₪{getTotalExpenses().toLocaleString()}</p>
                        </div>
                        <div>
                            <p className="text-sm text-primary-600">רווח נקי</p>
                            <p className={`text-2xl font-bold ${getNetIncome() >= 0 ? 'text-green-600' : 'text-red-600'}`}>₪{getNetIncome().toLocaleString()}</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
} 