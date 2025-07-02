import React, { useState } from 'react';
import { UserPlusIcon } from '@heroicons/react/24/outline';
import { db } from '../../firebase/config';
import { doc, getDoc, updateDoc, collection, query, where, getDocs } from 'firebase/firestore';
import { getPermissionsByRole } from '../../utils/permissions';

export default function UserInviteForm({ onInvite, isOwner, isManager }) {
    const [inviteEmail, setInviteEmail] = useState('');
    const [inviteRole, setInviteRole] = useState('member');
    const [inviting, setInviting] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        
        if (!inviteEmail.trim()) {
            return;
        }

        setInviting(true);
        const success = await onInvite(inviteEmail, inviteRole);
        
        if (success) {
            setInviteEmail('');
            setInviteRole('member');
        }
        
        setInviting(false);
    };

    if (!isOwner && !isManager) {
        return null;
    }

    return (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-6">
            <h2 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
                <UserPlusIcon className="w-5 h-5 ml-2" />
                הזמן משתמש חדש
            </h2>
            
            <form onSubmit={handleSubmit} className="flex gap-4 items-end">
                <div className="flex-1">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                        כתובת אימייל
                    </label>
                    <input
                        type="email"
                        value={inviteEmail}
                        onChange={(e) => setInviteEmail(e.target.value)}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        placeholder="user@example.com"
                        required
                    />
                </div>
                
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                        תפקיד
                    </label>
                    <select
                        value={inviteRole}
                        onChange={(e) => setInviteRole(e.target.value)}
                        className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    >
                        <option value="member">חבר</option>
                        {isOwner && <option value="manager">מנהל</option>}
                    </select>
                </div>
                
                <button
                    type="submit"
                    disabled={inviting}
                    className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                    {inviting ? 'מזמין...' : 'הזמן'}
                </button>
            </form>
        </div>
    );
} 