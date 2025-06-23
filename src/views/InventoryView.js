import React, { useState } from 'react';
import { exportToCSV, exportToExcel, mapInventoryForExport } from '../utils/exportUtils';
import { PlusCircleIcon, PackageIcon } from '../components/Icons';
import Button from '../components/common/Button';
import Modal from '../components/common/Modal';
import CrudList from '../components/common/CrudList';
import { Input, Textarea } from '../components/common/FormInputs';

export default function InventoryView({ inventory = [], onSave, onDelete }) {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedItem, setSelectedItem] = useState(null);
    const [itemData, setItemData] = useState({
        name: '',
        quantity: '',
        location: '',
        notes: ''
    });
    const [error, setError] = useState(null);

    const handleAdd = () => {
        setSelectedItem(null);
        setItemData({
            name: '',
            quantity: '',
            location: '',
            notes: ''
        });
        setIsModalOpen(true);
    };

    const handleEdit = (item) => {
        setSelectedItem(item);
        setItemData({
            name: item.name || '',
            quantity: item.quantity || '',
            location: item.location || '',
            notes: item.notes || ''
        });
        setIsModalOpen(true);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        
        try {
            if (selectedItem) {
                await onSave(selectedItem.id, itemData);
            } else {
                await onSave(null, itemData);
            }
            setIsModalOpen(false);
            setSelectedItem(null);
            setItemData({
                name: '',
                quantity: '',
                location: '',
                notes: ''
            });
            setError(null);
        } catch (error) {
            setError('שגיאה בשמירת הפריט');
            console.error('Error saving inventory item:', error);
        }
    };

    const getQuantityColor = (quantity, minQuantity) => {
        if (quantity <= minQuantity) return 'text-red-600';
        if (quantity <= minQuantity * 1.5) return 'text-yellow-600';
        return 'text-green-600';
    };

    if (error) {
        return (
            <div className="flex justify-center items-center h-full p-8">
                <div className="modern-card p-8 text-center max-w-md border-error-200 bg-error-50/50">
                    <div className="w-16 h-16 bg-gradient-error rounded-2xl mx-auto mb-4 flex items-center justify-center">
                        <span className="text-white text-2xl">⚠️</span>
                    </div>
                    <h3 className="text-xl font-semibold text-error-800 mb-2">שגיאה בטעינת הנתונים</h3>
                    <p className="text-error-600">{error}</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-full p-6 animate-fade-in">
            {/* Header */}
            <div className="bg-white rounded-2xl shadow-lg p-6 mb-8 flex flex-col md:flex-row md:justify-between md:items-center gap-4 border border-white/20">
                <div className="flex items-center gap-4">
                    <div className="p-3 bg-gradient-to-l from-purple-500 to-blue-400 rounded-2xl text-white shadow-lg flex items-center justify-center">
                        <span className="text-2xl"><PackageIcon /></span>
                    </div>
                    <h2 className="text-2xl font-bold text-primary-900">ניהול מלאי</h2>
                </div>
                <Button
                    onClick={handleAdd}
                    variant="accent"
                    size="md"
                    icon={<PlusCircleIcon className="w-5 h-5" />}
                    className="min-w-[140px]"
                >
                    פריט חדש
                </Button>
            </div>

            {/* Inventory List */}
            <div className="bg-white rounded-2xl shadow-lg overflow-hidden border border-white/20">
                <CrudList
                    items={inventory}
                    onEdit={handleEdit}
                    onDelete={onDelete}
                    getTitle={item => item.name}
                    getSubtitle={item => `כמות: ${item.quantity || 0}`}
                    getMetadata={item => [
                        { label: 'כמות', value: item.quantity },
                        { label: 'מיקום', value: item.location },
                        { label: 'הערות', value: item.notes }
                    ]}
                    hideAddButton={true}
                />
            </div>

            {/* Item Form Modal */}
            <Modal isOpen={isModalOpen} onClose={() => {
                setIsModalOpen(false);
                setSelectedItem(null);
                setItemData({
                    name: '',
                    quantity: '',
                    location: '',
                    notes: ''
                });
                setError(null);
            }}>
                <div className="p-6">
                    <h3 className="text-xl font-bold mb-4">
                        {selectedItem ? 'עריכת פריט' : 'פריט חדש'}
                    </h3>
                    
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <Input
                            label="שם הפריט"
                            value={itemData.name}
                            onChange={e => setItemData(prev => ({ ...prev, name: e.target.value }))}
                            required
                        />
                        
                        <Input
                            label="כמות"
                            type="number"
                            value={itemData.quantity}
                            onChange={e => setItemData(prev => ({ ...prev, quantity: e.target.value }))}
                        />
                        
                        <Input
                            label="מיקום"
                            value={itemData.location}
                            onChange={e => setItemData(prev => ({ ...prev, location: e.target.value }))}
                        />
                        
                        <Textarea
                            label="הערות"
                            value={itemData.notes}
                            onChange={e => setItemData(prev => ({ ...prev, notes: e.target.value }))}
                        />

                        {error && (
                            <div className="text-error-600 text-sm">{error}</div>
                        )}
                        
                        <div className="flex justify-end gap-2">
                            <Button
                                type="button"
                                variant="ghost"
                                onClick={() => {
                                    setIsModalOpen(false);
                                    setSelectedItem(null);
                                    setItemData({
                                        name: '',
                                        quantity: '',
                                        location: '',
                                        notes: ''
                                    });
                                    setError(null);
                                }}
                            >
                                ביטול
                            </Button>
                            <Button type="submit" variant="primary">
                                {selectedItem ? 'שמור שינויים' : 'הוסף פריט'}
                            </Button>
                        </div>
                    </form>
                </div>
            </Modal>
        </div>
    );
} 