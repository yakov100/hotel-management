import React from 'react';
import { TrashIcon } from '@heroicons/react/24/outline';

function getRoleDisplay(role) {
  switch (role) {
    case 'owner': return 'בעלים';
    case 'manager': return 'מנהל';
    case 'member': return 'חבר';
    default: return role;
  }
}

function getRoleBadgeClass(role) {
  switch (role) {
    case 'owner': return 'bg-purple-100 text-purple-700';
    case 'manager': return 'bg-blue-100 text-blue-700';
    case 'member': return 'bg-green-100 text-green-700';
    default: return 'bg-gray-100 text-gray-700';
  }
}

export default function UsersList({ 
  users, 
  loading, 
  isOwner, 
  onRemoveUser, 
  onChangeRole 
}) {
  if (loading) {
    return (
      <div className="bg-white rounded-xl shadow-sm border border-gray-200">
        <div className="p-6 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-800">
            משתמשי הדירה
          </h2>
        </div>
        <div className="p-8 text-center">
          <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-2"></div>
          <p className="text-gray-500">טוען משתמשים...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200">
      <div className="p-6 border-b border-gray-200">
        <h2 className="text-lg font-semibold text-gray-800">
          משתמשי הדירה ({users.length})
        </h2>
      </div>

      {users.length === 0 ? (
        <div className="p-8 text-center text-gray-500">
          אין משתמשים בדירה זו
        </div>
      ) : (
        <div className="divide-y divide-gray-200">
          {users.map((user) => (
            <div key={user.id} className="p-6 flex items-center justify-between">
              <div className="flex items-center space-x-4" dir="ltr">
                <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
                  <span className="text-white font-medium text-sm">
                    {user.displayName?.charAt(0) || user.email?.charAt(0) || '?'}
                  </span>
                </div>
                <div dir="rtl">
                  <div className="font-medium text-gray-800">
                    {user.displayName || user.username || 'ללא שם'}
                  </div>
                  <div className="text-sm text-gray-500">{user.email}</div>
                  {user.joinedAt && (
                    <div className="text-xs text-gray-400">
                      הצטרף ב-{user.joinedAt.toLocaleDateString('he-IL')}
                    </div>
                  )}
                </div>
              </div>

              <div className="flex items-center space-x-3" dir="ltr">
                <span className={`px-3 py-1 text-xs font-medium rounded-full ${getRoleBadgeClass(user.apartmentRole)}`}>
                  {getRoleDisplay(user.apartmentRole)}
                </span>

                {isOwner && user.apartmentRole !== 'owner' && (
                  <div className="flex items-center space-x-2">
                    <select
                      value={user.apartmentRole}
                      onChange={(e) => onChangeRole(user.id, user.apartmentRole, e.target.value)}
                      className="text-xs border border-gray-300 rounded px-2 py-1"
                    >
                      <option value="member">חבר</option>
                      <option value="manager">מנהל</option>
                    </select>
                    
                    <button
                      onClick={() => {
                        if (window.confirm('האם אתה בטוח שברצונך להסיר את המשתמש מהדירה?')) {
                          onRemoveUser(user.id, user.apartmentRole);
                        }
                      }}
                      className="p-1 text-red-600 hover:bg-red-50 rounded"
                      title="הסר משתמש"
                    >
                      <TrashIcon className="w-4 h-4" />
                    </button>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
} 