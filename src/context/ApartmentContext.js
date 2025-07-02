import React, { createContext, useContext, useState, useEffect } from 'react';
import { auth, db } from '../firebase/config';
import { doc, getDoc, collection, query, where, getDocs, onSnapshot } from 'firebase/firestore';

const ApartmentContext = createContext();

export const useApartment = () => {
  const context = useContext(ApartmentContext);
  if (!context) {
    throw new Error('useApartment must be used within ApartmentProvider');
  }
  return context;
};

export const ApartmentProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [userApartments, setUserApartments] = useState([]);
  const [selectedApartment, setSelectedApartment] = useState(null);
  const [userRole, setUserRole] = useState(null);
  const [loading, setLoading] = useState(true);

  // Load user apartments when user changes
  useEffect(() => {
    if (!user) {
      setUserApartments([]);
      setSelectedApartment(null);
      setUserRole(null);
      setLoading(false);
      return;
    }

    const loadUserApartments = async () => {
      try {
        setLoading(true);
        
        // Get user document to see which apartments they belong to
        const userDoc = await getDoc(doc(db, 'users', user.uid));
        if (!userDoc.exists()) {
          setUserApartments([]);
          setLoading(false);
          return;
        }

        const userData = userDoc.data();
        const apartmentIds = Object.keys(userData.apartments || {});

        if (apartmentIds.length === 0) {
          setUserApartments([]);
          setLoading(false);
          return;
        }

        // Get apartment details
        const apartmentPromises = apartmentIds.map(async (apartmentId) => {
          const apartmentDoc = await getDoc(doc(db, 'apartments', apartmentId));
          if (apartmentDoc.exists()) {
            return {
              id: apartmentId,
              ...apartmentDoc.data(),
              userRole: userData.apartments[apartmentId].role,
              userPermissions: userData.apartments[apartmentId].permissions || []
            };
          }
          return null;
        });

        const apartments = (await Promise.all(apartmentPromises)).filter(Boolean);
        setUserApartments(apartments);

        // Auto-select apartment (try to restore from localStorage or select first)
        if (!selectedApartment && apartments.length > 0) {
          const lastSelectedId = localStorage.getItem('selectedApartmentId');
          const lastSelected = lastSelectedId ? apartments.find(apt => apt.id === lastSelectedId) : null;
          const apartmentToSelect = lastSelected || apartments[0];
          
          setSelectedApartment(apartmentToSelect);
          setUserRole(apartmentToSelect.userRole);
        }

      } catch (error) {
        console.error('Error loading user apartments:', error);
        setUserApartments([]);
      } finally {
        setLoading(false);
      }
    };

    loadUserApartments();
  }, [user]);

  // Update user role when selected apartment changes
  useEffect(() => {
    if (selectedApartment && user) {
      const apartment = userApartments.find(apt => apt.id === selectedApartment.id);
      setUserRole(apartment?.userRole || null);
    }
  }, [selectedApartment, userApartments, user]);

  // Listen to auth state changes
  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((currentUser) => {
      setUser(currentUser);
    });

    return unsubscribe;
  }, []);

  const selectApartment = (apartment) => {
    setSelectedApartment(apartment);
    localStorage.setItem('selectedApartmentId', apartment.id);
  };

  const hasPermission = (permission) => {
    if (!selectedApartment || !userRole) return false;
    
    // Owner has all permissions
    if (userRole === 'owner') return true;
    
    // Check specific permissions
    const apartment = userApartments.find(apt => apt.id === selectedApartment.id);
    return apartment?.userPermissions?.includes(permission) || false;
  };

  const isOwner = () => userRole === 'owner';
  const isManager = () => userRole === 'manager' || userRole === 'owner';
  const isMember = () => ['member', 'manager', 'owner'].includes(userRole);

  const refreshUserApartments = async () => {
    if (!user) return;
    
    try {
      setLoading(true);
      
      // Get user document to see which apartments they belong to
      const userDoc = await getDoc(doc(db, 'users', user.uid));
      if (!userDoc.exists()) {
        setUserApartments([]);
        setLoading(false);
        return;
      }

      const userData = userDoc.data();
      const apartmentIds = Object.keys(userData.apartments || {});

      if (apartmentIds.length === 0) {
        setUserApartments([]);
        setLoading(false);
        return;
      }

      // Get apartment details
      const apartmentPromises = apartmentIds.map(async (apartmentId) => {
        const apartmentDoc = await getDoc(doc(db, 'apartments', apartmentId));
        if (apartmentDoc.exists()) {
          return {
            id: apartmentId,
            ...apartmentDoc.data(),
            userRole: userData.apartments[apartmentId].role,
            userPermissions: userData.apartments[apartmentId].permissions || []
          };
        }
        return null;
      });

      const apartments = (await Promise.all(apartmentPromises)).filter(Boolean);
      setUserApartments(apartments);

      // Auto-select apartment (try to restore from localStorage or select first)
      if (!selectedApartment && apartments.length > 0) {
        const lastSelectedId = localStorage.getItem('selectedApartmentId');
        const lastSelected = lastSelectedId ? apartments.find(apt => apt.id === lastSelectedId) : null;
        const apartmentToSelect = lastSelected || apartments[0];
        
        setSelectedApartment(apartmentToSelect);
        setUserRole(apartmentToSelect.userRole);
      }

    } catch (error) {
      console.error('Error refreshing user apartments:', error);
      setUserApartments([]);
    } finally {
      setLoading(false);
    }
  };

  const value = {
    user,
    userApartments,
    selectedApartment,
    userRole,
    loading,
    selectApartment,
    refreshUserApartments,
    hasPermission,
    isOwner,
    isManager,
    isMember,
    // Legacy compatibility
    tenantId: selectedApartment?.id || null,
    tenant: selectedApartment || null
  };

  return (
    <ApartmentContext.Provider value={value}>
      {children}
    </ApartmentContext.Provider>
  );
}; 