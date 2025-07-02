import { useMemo } from 'react';
import { where } from 'firebase/firestore';
import { useCollection } from './useCollection';
import { toDateSafe } from '../utils/dateUtils';

export function useAppData(apartmentId) {
    // Collection queries with apartment filter - always call hooks first
    const apartmentFilter = useMemo(() => 
        apartmentId ? [where('apartmentId', '==', apartmentId)] : [], 
        [apartmentId]
    );
    
    // Use Firebase orderBy, but fallback to JavaScript sorting if index isn't ready
    const { 
        documents: rawBookings = [], 
        error: bookingsError, 
        isLoading: bookingsLoading,
        indexFallback: bookingsIndexFallback
    } = useCollection(
        apartmentId ? 'bookings' : null, 
        apartmentFilter,
        'checkIn'  // Try Firebase orderBy first
    );

    // Apply JavaScript sorting when Firebase index fallback is active
    const bookings = useMemo(() => {
        if (!apartmentId || !rawBookings || rawBookings.length === 0) return [];
        
        // If Firebase orderBy worked, data is already sorted
        if (!bookingsIndexFallback) {
            return rawBookings;
        }
        
        // If fallback is active, sort in JavaScript
        console.log('📊 Applying JavaScript sorting for bookings (Firebase index not ready)');
        return [...rawBookings].sort((a, b) => {
            const dateA = toDateSafe(a.checkIn);
            const dateB = toDateSafe(b.checkIn);
            return dateA - dateB;
        });
    }, [apartmentId, rawBookings, bookingsIndexFallback]);
    
    const { documents: guests = [] } = useCollection(
        apartmentId ? 'guests' : null, 
        apartmentFilter
    );
    
    const { documents: tasks = [] } = useCollection(
        apartmentId ? 'tasks' : null, 
        apartmentFilter
    );
    
    const { documents: inventory = [] } = useCollection(
        apartmentId ? 'inventory' : null, 
        apartmentFilter
    );
    
    const { documents: finances = [] } = useCollection(
        apartmentId ? 'finances' : null, 
        apartmentFilter
    );
    
    const { documents: maintenance = [] } = useCollection(
        apartmentId ? 'maintenance' : null, 
        apartmentFilter
    );

    // Return empty arrays if no apartmentId (but still call all hooks first)
    if (!apartmentId) {
        return {
            bookings: [],
            guests: [],
            tasks: [],
            inventory: [],
            finances: [],
            maintenance: [],
            bookingsError: null,
            bookingsLoading: false,
            bookingsIndexFallback: false
        };
    }

    return {
        bookings,
        guests,
        tasks,
        inventory,
        finances,
        maintenance,
        bookingsError,
        bookingsLoading,
        bookingsIndexFallback // Expose this for debugging
    };
} 