import { format } from 'date-fns';
import { he } from 'date-fns/locale';

export function toDateSafe(val) {
    if (!val) return null;
    if (typeof val === 'string') return new Date(val);
    if (val instanceof Date) return val;
    if (val.toDate) return val.toDate();
    return null;
}

export function formatDateTime(date) {
    if (!date) return '';
    const dateObj = toDateSafe(date);
    if (!dateObj) return '';
    return format(dateObj, 'dd/MM/yyyy HH:mm', { locale: he });
}

export function formatDate(date) {
    if (!date) return '';
    const dateObj = toDateSafe(date);
    if (!dateObj) return '';
    return format(dateObj, 'dd/MM/yyyy', { locale: he });
}

export function formatMonth(date) {
    if (!date) return '';
    const dateObj = toDateSafe(date);
    if (!dateObj) return '';
    return format(dateObj, 'MMMM yyyy', { locale: he });
}

export function getStartOfMonth(date) {
    const dateObj = toDateSafe(date);
    if (!dateObj) return null;
    return new Date(dateObj.getFullYear(), dateObj.getMonth(), 1);
}

export function getEndOfMonth(date) {
    const dateObj = toDateSafe(date);
    if (!dateObj) return null;
    return new Date(dateObj.getFullYear(), dateObj.getMonth() + 1, 0);
}

export function addMonths(date, months) {
    const dateObj = toDateSafe(date);
    if (!dateObj) return null;
    return new Date(dateObj.setMonth(dateObj.getMonth() + months));
}

export function isSameDay(date1, date2) {
    if (!date1 || !date2) return false;
    const d1 = toDateSafe(date1);
    const d2 = toDateSafe(date2);
    if (!d1 || !d2) return false;
    return d1.getFullYear() === d2.getFullYear() &&
           d1.getMonth() === d2.getMonth() &&
           d1.getDate() === d2.getDate();
}

export function isDateInRange(date, start, end) {
    if (!date || !start || !end) return false;
    const checkDate = toDateSafe(date);
    const startDate = toDateSafe(start);
    const endDate = toDateSafe(end);
    
    if (!checkDate || !startDate || !endDate) return false;
    
    // נרמל את התאריכים לתחילת היום כדי להשוות רק תאריכים ולא שעות
    const normalizedCheckDate = new Date(checkDate.getFullYear(), checkDate.getMonth(), checkDate.getDate());
    const normalizedStartDate = new Date(startDate.getFullYear(), startDate.getMonth(), startDate.getDate());
    const normalizedEndDate = new Date(endDate.getFullYear(), endDate.getMonth(), endDate.getDate());
    
    return normalizedCheckDate >= normalizedStartDate && normalizedCheckDate <= normalizedEndDate;
}

export const formatTime = (date) => {
    const d = toDateSafe(date);
    return d ? d.toTimeString().slice(0, 5) : '';
};

export const parseDateTime = (dateString, timeString) => {
    if (!dateString || !timeString) return null;
    const date = new Date(`${dateString}T${timeString}`);
    return isNaN(date.getTime()) ? null : date;
}; 