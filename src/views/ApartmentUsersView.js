import React from 'react';
import { useApartment } from '../context/ApartmentContext';
import { useApartmentUsers } from '../hooks/useApartmentUsers';
import UserInviteForm from '../components/apartment/UserInviteForm';
import UsersList from '../components/apartment/UsersList';

export default function ApartmentUsersView() {
  const { selectedApartment, isOwner, isManager } = useApartment();
  const { 
    users, 
    loading, 
    error, 
    setError, 
    inviteUser, 
    removeUser, 
    changeUserRole 
  } = useApartmentUsers(selectedApartment);

  const handleInviteUser = async (email, role) => {
    if (!isOwner() && !isManager()) {
      setError('אין לך הרשאה להזמין משתמשים');
      return false;
    }

    return await inviteUser(email, role, selectedApartment);
  };

  const handleRemoveUser = async (userId, userRole) => {
    if (!isOwner()) {
      setError('רק בעלים יכול להסיר משתמשים');
      return;
    }

    return await removeUser(userId, userRole, selectedApartment);
  };

  const handleChangeRole = async (userId, currentRole, newRole) => {
    if (!isOwner()) {
      setError('רק בעלים יכול לשנות תפקידים');
      return;
    }

    return await changeUserRole(userId, currentRole, newRole, selectedApartment);
  };

  if (!selectedApartment) {
    return (
      <div className="p-6 text-center">
        <p className="text-gray-500">נא לבחור דירה כדי לנהל משתמשים</p>
      </div>
    );
  }

  return (
    <div className="p-6" dir="rtl">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-800">ניהול משתמשים</h1>
        <div className="text-sm text-gray-500">
          {selectedApartment.name}
        </div>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
          <p className="text-red-700">{error}</p>
        </div>
      )}

      <UserInviteForm 
        onInvite={handleInviteUser}
        isOwner={isOwner()}
        isManager={isManager()}
      />

      <UsersList 
        users={users}
        loading={loading}
        isOwner={isOwner()}
        onRemoveUser={handleRemoveUser}
        onChangeRole={handleChangeRole}
      />
    </div>
  );
} 