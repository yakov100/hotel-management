import React, { useState } from 'react';
import { EditIcon, Trash2Icon } from '../Icons';
import { PlusCircleIcon } from '../Icons';
import Button from './Button';
import ConfirmationModal from './ConfirmationModal';

export default function CrudList({
    title,
    items = [],
    columns,
    onSave,
    onDelete,
    onEdit,
    onSendEmail,
    form: FormComponent,
    getTitle,
    getSubtitle,
    getMetadata,
    showEmailButton = false,
    hideAddButton = false,
    ...props
}) {
    const [modalOpen, setModalOpen] = useState(false);
    const [selectedItem, setSelectedItem] = useState(null);
    const [deleteConfirm, setDeleteConfirm] = useState(null);

    const handleEdit = (item) => {
        if (onEdit) {
            onEdit(item);
        } else {
            setSelectedItem(item);
            setModalOpen(true);
        }
    };

    const handleAddNew = () => {
        setSelectedItem(null);
        setModalOpen(true);
    };

    const confirmDelete = () => {
        if (deleteConfirm) {
            onDelete(deleteConfirm);
            setDeleteConfirm(null);
        }
    };

    const renderListItem = (item) => {
        return (
            <div key={item.id} className="border-b border-gray-100 last:border-b-0">
                <div className="p-4 hover:bg-blue-50/40 rounded-2xl transition-all flex flex-col gap-2">
                    <div className="flex justify-between items-start gap-2">
                        <div>
                            <h3 className="text-lg font-bold text-primary-900">
                                {getTitle ? getTitle(item) : item.title}
                            </h3>
                            {getSubtitle && (
                                <p className="text-sm text-primary-600">
                                    {getSubtitle(item)}
                                </p>
                            )}
                        </div>
                        <div className="flex gap-2 items-center">
                            {showEmailButton && item.email && (
                                <button
                                    onClick={() => onSendEmail(item)}
                                    className="text-purple-600 hover:text-white hover:bg-gradient-to-l hover:from-purple-400 hover:to-blue-400 p-2 rounded-lg transition-all"
                                    title="שלח מייל 'מחכים לך'"
                                >
                                    📧
                                </button>
                            )}
                            <button
                                onClick={() => handleEdit(item)}
                                className="text-indigo-600 hover:text-white hover:bg-gradient-to-l hover:from-indigo-400 hover:to-blue-400 p-2 rounded-lg transition-all"
                                title="ערוך"
                            >
                                <EditIcon />
                            </button>
                            <button
                                onClick={() => setDeleteConfirm(item.id)}
                                className="text-red-600 hover:text-white hover:bg-gradient-to-l hover:from-red-400 hover:to-pink-500 p-2 rounded-lg transition-all"
                                title="מחק"
                            >
                                <Trash2Icon />
                            </button>
                        </div>
                    </div>
                    {getMetadata && (
                        <div className="mt-2 grid grid-cols-1 sm:grid-cols-2 gap-2">
                            {getMetadata(item).map((meta, index) => (
                                <div key={index} className="text-sm">
                                    <span className="font-medium text-primary-700">{meta.label}: </span>
                                    <span className="text-primary-600">{meta.value}</span>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        );
    };

    const renderTable = () => {
        return (
            <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-100">
                    <thead className="bg-gradient-to-l from-blue-50 to-purple-50">
                        <tr>
                            {columns.map(col => (
                                <th
                                    key={col.key}
                                    className="px-6 py-3 text-right text-xs font-bold text-primary-700 uppercase"
                                >
                                    {col.label}
                                </th>
                            ))}
                            <th></th>
                        </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-50">
                        {items.map(item => (
                            <tr key={item.id} className="hover:bg-blue-50/40 transition-all">
                                {columns.map(col => (
                                    <td
                                        key={col.key}
                                        className="px-6 py-4 whitespace-nowrap text-sm text-primary-700"
                                    >
                                        {col.render
                                            ? col.render(item[col.key])
                                            : item[col.key]}
                                    </td>
                                ))}
                                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium flex gap-2 justify-end">
                                    {showEmailButton && item.email && (
                                        <button
                                            onClick={() => onSendEmail(item)}
                                            className="text-purple-600 hover:text-white hover:bg-gradient-to-l hover:from-purple-400 hover:to-blue-400 p-2 rounded-lg transition-all"
                                            title="שלח מייל 'מחכים לך'"
                                        >
                                            📧
                                        </button>
                                    )}
                                    <button
                                        onClick={() => handleEdit(item)}
                                        className="text-indigo-600 hover:text-white hover:bg-gradient-to-l hover:from-indigo-400 hover:to-blue-400 p-2 rounded-lg transition-all"
                                        title="ערוך"
                                    >
                                        <EditIcon />
                                    </button>
                                    <button
                                        onClick={() => setDeleteConfirm(item.id)}
                                        className="text-red-600 hover:text-white hover:bg-gradient-to-l hover:from-red-400 hover:to-pink-500 p-2 rounded-lg transition-all"
                                        title="מחק"
                                    >
                                        <Trash2Icon />
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        );
    };

    return (
        <div className="p-4 sm:p-6 bg-white rounded-2xl shadow-lg border border-white/20">
            <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl sm:text-2xl font-bold text-primary-800">
                    {title}
                </h2>
                {!hideAddButton && (
                    <Button
                        onClick={handleAddNew}
                        className="bg-gradient-to-l from-green-400 to-emerald-500 text-white shadow-md hover:from-green-500 hover:to-emerald-600"
                        icon={<PlusCircleIcon />}
                    >
                        הוסף חדש
                    </Button>
                )}
            </div>
            {columns ? renderTable() : (
                <div className="divide-y divide-gray-100">
                    {items.map(renderListItem)}
                </div>
            )}
            {modalOpen && FormComponent && (
                <FormComponent
                    item={selectedItem}
                    onClose={() => setModalOpen(false)}
                    onSave={onSave}
                    {...props}
                />
            )}
            {deleteConfirm && (
                <ConfirmationModal
                    title="אישור מחיקה"
                    message="האם למחוק פריט זה?"
                    onConfirm={confirmDelete}
                    onCancel={() => setDeleteConfirm(null)}
                />
            )}
        </div>
    );
} 