import { useState, useEffect } from 'react';
import { db } from '../firebase/config';
import { doc, getDoc, updateDoc, deleteField, collection, query, where, getDocs } from 'firebase/firestore';
import { getPermissionsByRole } from '../utils/permissions';

export function useApartmentUsers(selectedApartment) {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!selectedApartment) {
      setUsers([]);
      setLoading(false);
      return;
    }

    loadApartmentUsers();
  }, [selectedApartment]);

  const loadApartmentUsers = async () => {
    try {
      setLoading(true);
      const apartmentUsers = [];

      // Get all users who have this apartment in their apartments object
      const usersRef = collection(db, 'users');
      const q = query(usersRef);
      const querySnapshot = await getDocs(q);

      for (const userDoc of querySnapshot.docs) {
        const userData = userDoc.data();
        if (userData.apartments && userData.apartments[selectedApartment.id]) {
          apartmentUsers.push({
            id: userDoc.id,
            ...userData,
            apartmentRole: userData.apartments[selectedApartment.id].role,
            joinedAt: userData.apartments[selectedApartment.id].joinedAt?.toDate()
          });
        }
      }

      // Sort by role priority (owner first, then manager, then member)
      apartmentUsers.sort((a, b) => {
        const roleOrder = { owner: 0, manager: 1, member: 2 };
        return roleOrder[a.apartmentRole] - roleOrder[b.apartmentRole];
      });

      setUsers(apartmentUsers);
    } catch (error) {
      console.error('Error loading apartment users:', error);
      setError('שגיאה בטעינת רשימת המשתמשים');
    } finally {
      setLoading(false);
    }
  };

  const inviteUser = async (email, role, selectedApartment) => {
    try {
      setError('');

      // Find user by email
      const usersRef = collection(db, 'users');
      const q = query(usersRef, where('email', '==', email.trim()));
      const querySnapshot = await getDocs(q);

      if (querySnapshot.empty) {
        throw new Error('משתמש לא נמצא. המשתמש צריך להירשם למערכת קודם');
      }

      const userDoc = querySnapshot.docs[0];
      const userData = userDoc.data();

      // Check if user is already in this apartment
      if (userData.apartments && userData.apartments[selectedApartment.id]) {
        throw new Error('המשתמש כבר חבר בדירה זו');
      }

      // Add apartment to user's apartments
      await updateDoc(doc(db, 'users', userDoc.id), {
        [`apartments.${selectedApartment.id}`]: {
          role: role,
          joinedAt: new Date(),
          permissions: getPermissionsByRole(role)
        }
      });

      // Update apartment's members/managers list
      const apartmentRef = doc(db, 'apartments', selectedApartment.id);
      const apartmentDoc = await getDoc(apartmentRef);
      const apartmentData = apartmentDoc.data();

      if (role === 'manager') {
        await updateDoc(apartmentRef, {
          managers: [...(apartmentData.managers || []), userDoc.id]
        });
      } else if (role === 'member') {
        await updateDoc(apartmentRef, {
          members: [...(apartmentData.members || []), userDoc.id]
        });
      }

      await loadApartmentUsers();
      return true;
    } catch (error) {
      console.error('Error inviting user:', error);
      setError(error.message || 'שגיאה בהזמנת המשתמש');
      return false;
    }
  };

  const removeUser = async (userId, userRole, selectedApartment) => {
    try {
      if (userRole === 'owner') {
        throw new Error('לא ניתן להסיר את הבעלים');
      }

      // Remove apartment from user's apartments
      await updateDoc(doc(db, 'users', userId), {
        [`apartments.${selectedApartment.id}`]: deleteField()
      });

      // Remove user from apartment's members/managers list
      const apartmentRef = doc(db, 'apartments', selectedApartment.id);
      const apartmentDoc = await getDoc(apartmentRef);
      const apartmentData = apartmentDoc.data();

      if (userRole === 'manager') {
        await updateDoc(apartmentRef, {
          managers: (apartmentData.managers || []).filter(id => id !== userId)
        });
      } else if (userRole === 'member') {
        await updateDoc(apartmentRef, {
          members: (apartmentData.members || []).filter(id => id !== userId)
        });
      }

      await loadApartmentUsers();
      return true;
    } catch (error) {
      console.error('Error removing user:', error);
      setError(error.message || 'שגיאה בהסרת המשתמש');
      return false;
    }
  };

  const changeUserRole = async (userId, currentRole, newRole, selectedApartment) => {
    try {
      if (currentRole === 'owner') {
        throw new Error('לא ניתן לשנות תפקיד הבעלים');
      }

      // Update user's role
      await updateDoc(doc(db, 'users', userId), {
        [`apartments.${selectedApartment.id}.role`]: newRole,
        [`apartments.${selectedApartment.id}.permissions`]: getPermissionsByRole(newRole)
      });

      // Update apartment's members/managers lists
      const apartmentRef = doc(db, 'apartments', selectedApartment.id);
      const apartmentDoc = await getDoc(apartmentRef);
      const apartmentData = apartmentDoc.data();

      let updates = {};

      // Remove from old role list
      if (currentRole === 'manager') {
        updates.managers = (apartmentData.managers || []).filter(id => id !== userId);
      } else if (currentRole === 'member') {
        updates.members = (apartmentData.members || []).filter(id => id !== userId);
      }

      // Add to new role list
      if (newRole === 'manager') {
        updates.managers = [...(updates.managers || apartmentData.managers || []), userId];
      } else if (newRole === 'member') {
        updates.members = [...(updates.members || apartmentData.members || []), userId];
      }

      await updateDoc(apartmentRef, updates);
      await loadApartmentUsers();
      return true;
    } catch (error) {
      console.error('Error changing user role:', error);
      setError(error.message || 'שגיאה בשינוי תפקיד המשתמש');
      return false;
    }
  };

  return {
    users,
    loading,
    error,
    setError,
    inviteUser,
    removeUser,
    changeUserRole,
    reloadUsers: loadApartmentUsers
  };
}

 