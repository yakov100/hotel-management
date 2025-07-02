import React from 'react';
import Button from '../common/Button';
import Modal from '../common/Modal';
import { Input, Textarea } from '../common/FormInputs';

export default function GuestForm({
    isOpen,
    onClose,
    onSubmit,
    editingGuest,
    guestData,
    setGuestData,
    error
}) {
    const handleSubmit = (e) => {
        e.preventDefault();
        onSubmit(e);
    };

    const handleClose = () => {
        setGuestData({ name: '', phone: '', email: '', notes: '' });
        onClose();
    };

    return (
        <Modal isOpen={isOpen} onClose={handleClose}>
            <div className="p-6">
                <h3 className="text-xl font-bold mb-4">
                    {editingGuest ? 'עריכת אורח' : 'אורח חדש'}
                </h3>
                
                <form onSubmit={handleSubmit} className="space-y-4">
                    <Input
                        label="שם האורח"
                        value={guestData.name}
                        onChange={e => setGuestData(prev => ({ ...prev, name: e.target.value }))}
                        required
                    />
                    
                    <Input
                        label="טלפון"
                        type="tel"
                        value={guestData.phone}
                        onChange={e => setGuestData(prev => ({ ...prev, phone: e.target.value }))}
                    />
                    
                    <Input
                        label="אימייל"
                        type="email"
                        value={guestData.email}
                        onChange={e => setGuestData(prev => ({ ...prev, email: e.target.value }))}
                    />
                    
                    <Textarea
                        label="הערות"
                        value={guestData.notes}
                        onChange={e => setGuestData(prev => ({ ...prev, notes: e.target.value }))}
                    />

                    {error && (
                        <div className="text-error-600 text-sm">{error}</div>
                    )}
                    
                    <div className="flex justify-end gap-2">
                        <Button
                            type="button"
                            variant="ghost"
                            onClick={handleClose}
                        >
                            ביטול
                        </Button>
                        <Button type="submit" variant="primary">
                            {editingGuest ? 'שמור שינויים' : 'הוסף אורח'}
                        </Button>
                    </div>
                </form>
            </div>
        </Modal>
    );
} 