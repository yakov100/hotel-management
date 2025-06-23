import React, { useState } from 'react';

export default function SettingsView({ settings = {}, tenant = {}, onSave }) {
    const [formData, setFormData] = useState({
        propertyName: tenant.propertyName || settings.propertyName || '',
        address: tenant.address || settings.address || '',
        phone: tenant.phone || settings.phone || '',
        email: tenant.email || settings.email || '',
        additionalEmails: settings.additionalEmails || ['sb0534135898@gmail.com'],
        checkInTime: settings.checkInTime || '15:00',
        checkOutTime: settings.checkOutTime || '11:00',
        currency: settings.currency || 'ILS',
        language: settings.language || 'he',
        notifications: settings.notifications || {
            email: true,
            sms: false
        }
    });

    const handleSubmit = (e) => {
        e.preventDefault();
        onSave(null, formData);
    };

    const addEmailField = () => {
        setFormData({
            ...formData,
            additionalEmails: [...formData.additionalEmails, '']
        });
    };

    const removeEmailField = (indexToRemove) => {
        setFormData({
            ...formData,
            additionalEmails: formData.additionalEmails.filter((_, index) => index !== indexToRemove)
        });
    };

    const updateEmail = (index, newValue) => {
        const newEmails = [...formData.additionalEmails];
        newEmails[index] = newValue;
        setFormData({
            ...formData,
            additionalEmails: newEmails
        });
    };

    return (
        <div className="p-6">
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-2xl font-bold">הגדרות</h1>
            </div>

            <div className="bg-white rounded shadow p-6">
                <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                            <label className="block text-sm font-medium text-gray-700">שם הנכס</label>
                            <input
                                type="text"
                                value={formData.propertyName}
                                onChange={(e) => setFormData({ ...formData, propertyName: e.target.value })}
                                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700">כתובת</label>
                            <input
                                type="text"
                                value={formData.address}
                                onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                            />
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700">אימייל ראשי</label>
                        <input
                            type="email"
                            value={formData.email}
                            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">כתובות מייל נוספות להתראות</label>
                        <div className="space-y-2">
                            {formData.additionalEmails.map((email, index) => (
                                <div key={index} className="flex gap-2">
                                    <input
                                        type="email"
                                        value={email}
                                        onChange={(e) => updateEmail(index, e.target.value)}
                                        className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                                        placeholder="הכנס כתובת מייל"
                                    />
                                    <button
                                        type="button"
                                        onClick={() => removeEmailField(index)}
                                        className="px-2 py-1 text-red-600 hover:text-red-800"
                                    >
                                        ❌
                                    </button>
                                </div>
                            ))}
                            <button
                                type="button"
                                onClick={addEmailField}
                                className="mt-2 text-blue-600 hover:text-blue-800 text-sm flex items-center"
                            >
                                + הוסף כתובת מייל
                            </button>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                            <label className="block text-sm font-medium text-gray-700">שעת צ'ק-אין</label>
                            <input
                                type="time"
                                value={formData.checkInTime}
                                onChange={(e) => setFormData({ ...formData, checkInTime: e.target.value })}
                                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700">שעת צ'ק-אאוט</label>
                            <input
                                type="time"
                                value={formData.checkOutTime}
                                onChange={(e) => setFormData({ ...formData, checkOutTime: e.target.value })}
                                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                            />
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                            <label className="block text-sm font-medium text-gray-700">מטבע</label>
                            <select
                                value={formData.currency}
                                onChange={(e) => setFormData({ ...formData, currency: e.target.value })}
                                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                            >
                                <option value="ILS">שקל (₪)</option>
                                <option value="USD">דולר ($)</option>
                                <option value="EUR">אירו (€)</option>
                            </select>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700">שפה</label>
                            <select
                                value={formData.language}
                                onChange={(e) => setFormData({ ...formData, language: e.target.value })}
                                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                            >
                                <option value="he">עברית</option>
                                <option value="en">English</option>
                            </select>
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">התראות</label>
                        <div className="space-y-2">
                            <div className="flex items-center">
                                <input
                                    type="checkbox"
                                    checked={formData.notifications.email}
                                    onChange={(e) => setFormData({
                                        ...formData,
                                        notifications: {
                                            ...formData.notifications,
                                            email: e.target.checked
                                        }
                                    })}
                                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                                />
                                <label className="mr-2 text-sm text-gray-700">התראות אימייל</label>
                            </div>
                            <div className="flex items-center">
                                <input
                                    type="checkbox"
                                    checked={formData.notifications.sms}
                                    onChange={(e) => setFormData({
                                        ...formData,
                                        notifications: {
                                            ...formData.notifications,
                                            sms: e.target.checked
                                        }
                                    })}
                                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                                />
                                <label className="mr-2 text-sm text-gray-700">התראות SMS</label>
                            </div>
                        </div>
                    </div>

                    <div className="flex justify-end">
                        <button
                            type="submit"
                            className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600"
                        >
                            שמור הגדרות
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
} 