import React, { useState } from 'react';
import { exportToCSV, exportToExcel, mapMaintenanceForExport } from '../utils/exportUtils';
import { PlusCircleIcon, WrenchIcon } from '../components/Icons';
import Button from '../components/common/Button';
import Modal from '../components/common/Modal';
import CrudList from '../components/common/CrudList';
import { Input, Textarea, Select } from '../components/common/FormInputs';

export default function MaintenanceView({ maintenance = [], onSave, onDelete }) {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedItem, setSelectedItem] = useState(null);
    const [itemData, setItemData] = useState({
        title: '',
        description: '',
        status: 'pending',
        priority: 'medium',
        dueDate: new Date().toISOString().split('T')[0],
        notes: ''
    });
    const [error, setError] = useState(null);

    const handleAdd = () => {
        setSelectedItem(null);
        setItemData({
            title: '',
            description: '',
            status: 'pending',
            priority: 'medium',
            dueDate: new Date().toISOString().split('T')[0],
            notes: ''
        });
        setIsModalOpen(true);
    };

    const handleEdit = (item) => {
        setSelectedItem(item);
        setItemData({
            title: item.title || '',
            description: item.description || '',
            status: item.status || 'pending',
            priority: item.priority || 'medium',
            dueDate: item.dueDate || new Date().toISOString().split('T')[0],
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
                title: '',
                description: '',
                status: 'pending',
                priority: 'medium',
                dueDate: new Date().toISOString().split('T')[0],
                notes: ''
            });
            setError(null);
        } catch (error) {
            setError('שגיאה בשמירת המשימה');
            console.error('Error saving maintenance item:', error);
        }
    };

    const getPriorityColor = (priority) => {
        switch (priority) {
            case 'high': return 'text-red-600';
            case 'medium': return 'text-yellow-600';
            case 'low': return 'text-green-600';
            default: return 'text-gray-600';
        }
    };

    const getStatusColor = (status) => {
        switch (status) {
            case 'completed': return 'bg-green-100 text-green-800';
            case 'in_progress': return 'bg-blue-100 text-blue-800';
            case 'pending': return 'bg-yellow-100 text-yellow-800';
            default: return 'bg-gray-100 text-gray-800';
        }
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
                        <span className="text-2xl"><WrenchIcon /></span>
                    </div>
                    <h2 className="text-2xl font-bold text-primary-900">ניהול תחזוקה</h2>
                </div>
                <Button
                    onClick={handleAdd}
                    variant="accent"
                    size="md"
                    icon={<PlusCircleIcon className="w-5 h-5" />}
                    className="min-w-[140px]"
                >
                    משימה חדשה
                </Button>
            </div>

            {/* Maintenance List */}
            <div className="bg-white rounded-2xl shadow-lg overflow-hidden border border-white/20">
                <CrudList
                    items={maintenance}
                    onEdit={handleEdit}
                    onDelete={onDelete}
                    getTitle={item => item.title}
                    getSubtitle={item => `עדיפות: ${getPriorityText(item.priority)} | סטטוס: ${getStatusText(item.status)}`}
                    getMetadata={item => [
                        { label: 'תיאור', value: item.description },
                        { label: 'תאריך יעד', value: new Date(item.dueDate).toLocaleDateString('he-IL') },
                        { label: 'עדיפות', value: getPriorityText(item.priority) },
                        { label: 'סטטוס', value: getStatusText(item.status) },
                        { label: 'הערות', value: item.notes }
                    ]}
                />
            </div>

            {/* Maintenance Form Modal */}
            <Modal isOpen={isModalOpen} onClose={() => {
                setIsModalOpen(false);
                setSelectedItem(null);
                setItemData({
                    title: '',
                    description: '',
                    status: 'pending',
                    priority: 'medium',
                    dueDate: new Date().toISOString().split('T')[0],
                    notes: ''
                });
                setError(null);
            }}>
                <div className="p-6">
                    <h3 className="text-xl font-bold mb-4">
                        {selectedItem ? 'עריכת משימת תחזוקה' : 'משימת תחזוקה חדשה'}
                    </h3>
                    
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <Input
                            label="כותרת"
                            value={itemData.title}
                            onChange={e => setItemData(prev => ({ ...prev, title: e.target.value }))}
                            required
                        />
                        
                        <Textarea
                            label="תיאור"
                            value={itemData.description}
                            onChange={e => setItemData(prev => ({ ...prev, description: e.target.value }))}
                        />
                        
                        <Select
                            label="סטטוס"
                            value={itemData.status}
                            onChange={e => setItemData(prev => ({ ...prev, status: e.target.value }))}
                        >
                            <option value="pending">ממתין</option>
                            <option value="in_progress">בטיפול</option>
                            <option value="completed">הושלם</option>
                        </Select>
                        
                        <Select
                            label="עדיפות"
                            value={itemData.priority}
                            onChange={e => setItemData(prev => ({ ...prev, priority: e.target.value }))}
                        >
                            <option value="low">נמוכה</option>
                            <option value="medium">בינונית</option>
                            <option value="high">גבוהה</option>
                            <option value="urgent">דחוף</option>
                        </Select>
                        
                        <Input
                            label="תאריך יעד"
                            type="date"
                            value={itemData.dueDate}
                            onChange={e => setItemData(prev => ({ ...prev, dueDate: e.target.value }))}
                            required
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
                                        title: '',
                                        description: '',
                                        status: 'pending',
                                        priority: 'medium',
                                        dueDate: new Date().toISOString().split('T')[0],
                                        notes: ''
                                    });
                                    setError(null);
                                }}
                            >
                                ביטול
                            </Button>
                            <Button type="submit" variant="primary">
                                {selectedItem ? 'שמור שינויים' : 'הוסף משימה'}
                            </Button>
                        </div>
                    </form>
                </div>
            </Modal>
        </div>
    );
}

function getPriorityText(priority) {
    switch (priority) {
        case 'low': return 'נמוכה';
        case 'medium': return 'בינונית';
        case 'high': return 'גבוהה';
        case 'urgent': return 'דחוף';
        default: return priority;
    }
}

function getStatusText(status) {
    switch (status) {
        case 'pending': return 'ממתין';
        case 'in_progress': return 'בטיפול';
        case 'completed': return 'הושלם';
        default: return status;
    }
} 