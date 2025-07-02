import { useState } from 'react';
import { sendEmailToGuest, isValidEmail, isEmailServiceConfigured } from '../utils/emailUtils';
import { useBugDetector } from '../utils/debugUtils';

export function useGuestEmail(settings, bookings) {
    const { logError, logWarning } = useBugDetector('useGuestEmail');
    const [sending, setSending] = useState(false);

    const findGuestBooking = (guest) => {
        return bookings.find(booking => 
            booking.guestEmail === guest.email || 
            booking.guestName === guest.name
        );
    };

    const getCheckInOutTimes = (guest) => {
        let checkInTimeToSend = settings?.checkInTime || '';
        let checkOutTimeToSend = settings?.checkOutTime || '';
        
        console.log('🔍 מחפש הזמנה לאורח:', guest.name, guest.email);
        console.log('📋 כל ההזמנות:', bookings);
        
        const guestBooking = findGuestBooking(guest);
        console.log('🎯 הזמנה שנמצאה:', guestBooking);
        
        if (guestBooking) {
            console.log('⏰ שעת צ\'ק-אין מההזמנה:', guestBooking.checkInTime);
            console.log('📅 תאריך צ\'ק-אין מההזמנה:', guestBooking.checkIn);
            console.log('⏰ שעת צ\'ק-אאוט מההזמנה:', guestBooking.checkOutTime);
            console.log('📅 תאריך צ\'ק-אאוט מההזמנה:', guestBooking.checkOut);
            
            if (guestBooking.checkInTime) {
                checkInTimeToSend = guestBooking.checkInTime;
                console.log('✅ נמצאה הזמנה לאורח עם שעת צ\'ק-אין:', checkInTimeToSend);
            } else {
                console.log('⚠️ אין שעת צ\'ק-אין בהזמנה');
            }

            if (guestBooking.checkOutTime) {
                checkOutTimeToSend = guestBooking.checkOutTime;
                console.log('✅ נמצאה הזמנה לאורח עם שעת צ\'ק-אאוט:', checkOutTimeToSend);
            } else {
                console.log('⚠️ אין שעת צ\'ק-אאוט בהזמנה');
            }
        } else {
            console.log('❌ לא נמצאה הזמנה לאורח');
        }
        
        return { checkInTimeToSend, checkOutTimeToSend };
    };

    const sendEmail = async (guest) => {
        if (!guest.email) {
            logWarning('Cannot send email - no email address', { guest });
            alert('לא ניתן לשלוח מייל - אין כתובת מייל לאורח זה');
            return;
        }

        if (!isValidEmail(guest.email)) {
            logWarning('Invalid email address', { email: guest.email });
            alert('כתובת המייל לא תקינה');
            return;
        }

        if (!isEmailServiceConfigured()) {
            alert('שירות המייל לא מוגדר. אנא הגדר את EmailJS לפני שליחת מיילים.');
            return;
        }

        setSending(true);
        try {
            const sendingMessage = `שולח מייל ל-${guest.name}...`;
            console.log(sendingMessage);
            
            const { checkInTimeToSend, checkOutTimeToSend } = getCheckInOutTimes(guest);
            
            console.log('📤 שולח מייל עם שעת צ\'ק-אין:', checkInTimeToSend);
            console.log('📤 שולח מייל עם שעת צ\'ק-אאוט:', checkOutTimeToSend);
            
            const result = await sendEmailToGuest(
                guest.email, 
                guest.name,
                'מחכים לך!',
                '', // Empty message to use the default template
                checkInTimeToSend,
                checkInTimeToSend, // שליחת השעה גם כ-checkInTimeStr
                checkOutTimeToSend
            );
            
            if (result.success) {
                alert(`המייל נשלח בהצלחה ל-${guest.name} (${guest.email})`);
                logWarning('Email sent successfully', { guest: guest.name, email: guest.email });
            } else {
                throw new Error(result.error);
            }
        } catch (error) {
            logError(error, { action: 'send_email', guest });
            alert(`שגיאה בשליחת המייל ל-${guest.name}: ${error.message}`);
        } finally {
            setSending(false);
        }
    };

    return {
        sendEmail,
        sending
    };
} 