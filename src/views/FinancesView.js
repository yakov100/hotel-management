import React, { useState } from 'react';
import { PlusCircleIcon, DollarSignIcon } from '../components/Icons';
import Button from '../components/common/Button';
import Modal from '../components/common/Modal';
import CrudList from '../components/common/CrudList';
import { Input, Textarea, Select } from '../components/common/FormInputs';
import { BarChart, Bar, XAxis, YAxis, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { exportToCSV, exportToExcel, mapFinancesForExport } from '../utils/exportUtils';

export default function FinancesView({ finances = [], onSave, onDelete }) {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedTransaction, setSelectedTransaction] = useState(null);
    const [transactionData, setTransactionData] = useState({
        description: '',
        amount: '',
        type: 'income',
        date: new Date().toISOString().split('T')[0],
        notes: ''
    });
    const [error, setError] = useState(null);
    const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth() + 1);
    const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());

    const months = [
        'ינואר', 'פברואר', 'מרץ', 'אפריל', 'מאי', 'יוני',
        'יולי', 'אוגוסט', 'ספטמבר', 'אוקטובר', 'נובמבר', 'דצמבר'
    ];

    const filteredFinances = finances.filter(t => {
        if (!t.date) return false;
        const d = new Date(t.date);
        return d.getMonth() + 1 === selectedMonth && d.getFullYear() === selectedYear;
    });

    const handleAdd = () => {
        setSelectedTransaction(null);
        setTransactionData({
            description: '',
            amount: '',
            type: 'income',
            date: new Date().toISOString().split('T')[0],
            notes: ''
        });
        setIsModalOpen(true);
    };

    const handleEdit = (transaction) => {
        setSelectedTransaction(transaction);
        setTransactionData({
            description: transaction.description || '',
            amount: transaction.amount || '',
            type: transaction.type || 'income',
            date: transaction.date || new Date().toISOString().split('T')[0],
            notes: transaction.notes || ''
        });
        setIsModalOpen(true);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        
        try {
            if (selectedTransaction) {
                await onSave(selectedTransaction.id, transactionData);
            } else {
                await onSave(null, transactionData);
            }
            setIsModalOpen(false);
            setSelectedTransaction(null);
            setTransactionData({
                description: '',
                amount: '',
                type: 'income',
                date: new Date().toISOString().split('T')[0],
                notes: ''
            });
            setError(null);
        } catch (error) {
            setError('שגיאה בשמירת העסקה');
            console.error('Error saving transaction:', error);
        }
    };

    const getTotalIncome = () => {
        return finances
            .filter(t => t.type === 'income')
            .reduce((sum, t) => sum + Number(t.amount), 0);
    };

    const getTotalExpenses = () => {
        return finances
            .filter(t => t.type === 'expense')
            .reduce((sum, t) => sum + Number(t.amount), 0);
    };

    const getBalance = () => {
        return getTotalIncome() - getTotalExpenses();
    };

    // חישוב נתונים לגרף חודשי
    const monthlyData = Array.from({ length: 12 }, (_, i) => {
        const monthNum = i + 1;
        const monthName = months[i];
        const monthIncomes = finances.filter(t => t.type === 'income' && t.date && (new Date(t.date)).getMonth() + 1 === monthNum && (new Date(t.date)).getFullYear() === selectedYear);
        const monthExpenses = finances.filter(t => t.type === 'expense' && t.date && (new Date(t.date)).getMonth() + 1 === monthNum && (new Date(t.date)).getFullYear() === selectedYear);
        return {
            month: monthName,
            הכנסות: monthIncomes.reduce((sum, t) => sum + Number(t.amount), 0),
            הוצאות: monthExpenses.reduce((sum, t) => sum + Number(t.amount), 0),
        };
    });

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
                        <span className="text-2xl"><DollarSignIcon /></span>
                    </div>
                    <h2 className="text-2xl font-bold text-primary-900">ניהול כספים</h2>
                </div>
                <Button
                    onClick={handleAdd}
                    variant="accent"
                    size="md"
                    icon={<PlusCircleIcon className="w-5 h-5" />}
                    className="min-w-[140px]"
                >
                    עסקה חדשה
                </Button>
            </div>

            {/* Summary Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                <div className="bg-white rounded-2xl shadow-lg p-6 flex flex-col items-center border border-white/20">
                    <h3 className="text-lg font-semibold text-primary-700 mb-2">הכנסות</h3>
                    <p className="text-3xl font-bold text-green-600">₪{getTotalIncome().toLocaleString()}</p>
                </div>
                <div className="bg-white rounded-2xl shadow-lg p-6 flex flex-col items-center border border-white/20">
                    <h3 className="text-lg font-semibold text-primary-700 mb-2">הוצאות</h3>
                    <p className="text-3xl font-bold text-red-600">₪{getTotalExpenses().toLocaleString()}</p>
                </div>
                <div className="bg-white rounded-2xl shadow-lg p-6 flex flex-col items-center border border-white/20">
                    <h3 className="text-lg font-semibold text-primary-700 mb-2">יתרה</h3>
                    <p className={`text-3xl font-bold ${getBalance() >= 0 ? 'text-green-600' : 'text-red-600'}`}>₪{getBalance().toLocaleString()}</p>
                </div>
            </div>

            {/* Monthly Chart */}
            <div className="bg-white rounded-2xl shadow-lg p-6 mb-8 border border-white/20">
                <h3 className="text-lg font-bold text-primary-800 mb-4">גרף חודשי</h3>
                <div className="w-full h-72">
                    <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={monthlyData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                            <XAxis dataKey="month" tick={{ fontSize: 12 }} />
                            <YAxis tick={{ fontSize: 12 }} />
                            <Tooltip />
                            <Legend />
                            <Bar dataKey="הכנסות" fill="#22c55e" radius={[8, 8, 0, 0]} />
                            <Bar dataKey="הוצאות" fill="#ef4444" radius={[8, 8, 0, 0]} />
                        </BarChart>
                    </ResponsiveContainer>
                </div>
            </div>

            {/* Finances List */}
            <div className="bg-white rounded-2xl shadow-lg overflow-hidden border border-white/20">
                <CrudList
                    items={finances}
                    onEdit={handleEdit}
                    onDelete={onDelete}
                    getTitle={transaction => transaction.description}
                    getSubtitle={transaction => `${transaction.type === 'income' ? 'הכנסה' : 'הוצאה'}: ₪${transaction.amount}`}
                    getMetadata={transaction => [
                        { label: 'סכום', value: `₪${transaction.amount}` },
                        { label: 'סוג', value: transaction.type === 'income' ? 'הכנסה' : 'הוצאה' },
                        { label: 'תאריך', value: new Date(transaction.date).toLocaleDateString('he-IL') },
                        { label: 'הערות', value: transaction.notes }
                    ]}
                />
            </div>

            {/* Transaction Form Modal */}
            <Modal isOpen={isModalOpen} onClose={() => {
                setIsModalOpen(false);
                setSelectedTransaction(null);
                setTransactionData({
                    description: '',
                    amount: '',
                    type: 'income',
                    date: new Date().toISOString().split('T')[0],
                    notes: ''
                });
                setError(null);
            }}>
                <div className="p-6">
                    <h3 className="text-xl font-bold mb-4">
                        {selectedTransaction ? 'עריכת עסקה' : 'עסקה חדשה'}
                    </h3>
                    
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <Input
                            label="תיאור"
                            value={transactionData.description}
                            onChange={e => setTransactionData(prev => ({ ...prev, description: e.target.value }))}
                            required
                        />
                        
                        <Input
                            label="סכום"
                            type="number"
                            value={transactionData.amount}
                            onChange={e => setTransactionData(prev => ({ ...prev, amount: e.target.value }))}
                            required
                        />
                        
                        <Select
                            label="סוג"
                            value={transactionData.type}
                            onChange={e => setTransactionData(prev => ({ ...prev, type: e.target.value }))}
                        >
                            <option value="income">הכנסה</option>
                            <option value="expense">הוצאה</option>
                        </Select>
                        
                        <Input
                            label="תאריך"
                            type="date"
                            value={transactionData.date}
                            onChange={e => setTransactionData(prev => ({ ...prev, date: e.target.value }))}
                            required
                        />
                        
                        <Textarea
                            label="הערות"
                            value={transactionData.notes}
                            onChange={e => setTransactionData(prev => ({ ...prev, notes: e.target.value }))}
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
                                    setSelectedTransaction(null);
                                    setTransactionData({
                                        description: '',
                                        amount: '',
                                        type: 'income',
                                        date: new Date().toISOString().split('T')[0],
                                        notes: ''
                                    });
                                    setError(null);
                                }}
                            >
                                ביטול
                            </Button>
                            <Button type="submit" variant="primary">
                                {selectedTransaction ? 'שמור שינויים' : 'הוסף עסקה'}
                            </Button>
                        </div>
                    </form>
                </div>
            </Modal>
        </div>
    );
} 