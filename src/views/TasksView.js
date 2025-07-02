import React, { useState } from 'react';
import { PlusCircleIcon, BellIcon } from '../components/Icons';
import Button from '../components/common/Button';
import Modal from '../components/common/Modal';
import TaskForm from '../components/tasks/TaskForm';
import TasksTable from '../components/tasks/TasksTable';
import RemindersBoard from '../components/RemindersBoard';
// import { exportToCSV, exportToExcel, mapTasksForExport } from '../utils/exportUtils';
import { useTaskContext } from '../context/TaskContext';

export default function TasksView({ apartmentId, apartmentInfo }) {
    const { tasks, loading, error, addTask, updateTask, deleteTask } = useTaskContext();
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedTask, setSelectedTask] = useState(null);

    const handleAdd = () => {
        setSelectedTask(null);
        setIsModalOpen(true);
    };

    const handleEdit = (task) => {
        setSelectedTask(task);
        setIsModalOpen(true);
    };

    const handleSubmit = async (taskData) => {
        try {
            if (selectedTask) {
                await updateTask(selectedTask.id, taskData);
            } else {
                await addTask(taskData);
            }
            setIsModalOpen(false);
            setSelectedTask(null);
        } catch (error) {
            console.error('Error saving task:', error);
        }
    };

    // const getPriorityColor = (priority) => {
    //     switch (priority) {
    //         case 'high': return 'text-red-600';
    //         case 'medium': return 'text-yellow-600';
    //         case 'low': return 'text-green-600';
    //         default: return 'text-gray-600';
    //     }
    // };

    // const getStatusColor = (status) => {
    //     switch (status) {
    //         case 'completed': return 'bg-green-100 text-green-800';
    //         case 'in_progress': return 'bg-blue-100 text-blue-800';
    //         case 'pending': return 'bg-yellow-100 text-yellow-800';
    //         default: return 'bg-gray-100 text-gray-800';
    //     }
    // };

    if (loading) {
        return (
            <div className="flex justify-center items-center h-full p-8 animate-fade-in">
                <div className="modern-card p-8 text-center max-w-md">
                    <div className="w-16 h-16 bg-gradient-primary rounded-2xl mx-auto mb-4 flex items-center justify-center animate-pulse-soft">
                        <div className="w-8 h-8 border-4 border-white border-t-transparent rounded-full animate-spin"></div>
                    </div>
                    <h3 className="text-xl font-semibold text-primary-800 mb-2">טוען משימות...</h3>
                    <p className="text-primary-600">מביא נתונים מהשרת</p>
                </div>
            </div>
        );
    }

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
            <div className="modern-card p-4 mb-6 flex justify-between items-center">
                <div className="flex items-center gap-4">
                    <div className="p-3 bg-gradient-to-l from-purple-500 to-blue-400 rounded-2xl text-white shadow-lg flex items-center justify-center">
                        <span className="text-2xl"><BellIcon /></span>
                    </div>
                    <h2 className="text-xl font-bold text-primary-900">משימות ותזכורות</h2>
                </div>
                <Button
                    onClick={handleAdd}
                    variant="accent"
                    size="md"
                    icon={<PlusCircleIcon className="w-5 h-5" />}
                >
                    משימה חדשה
                </Button>
            </div>

            {/* שילוב משימות ותזכורות בשני חצאים */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-full">
                {/* חלק המשימות - 2/3 מהרוחב */}
                <div className="lg:col-span-2">
                    <div className="modern-card overflow-auto h-full">
                        <div className="p-4 border-b border-primary-100 bg-gradient-to-r from-primary-50 to-accent-50">
                            <h3 className="text-lg font-semibold text-primary-800">רשימת משימות</h3>
                            <p className="text-sm text-primary-600">{tasks?.length || 0} משימות פעילות</p>
                        </div>
                        <div className="p-4">
                            <TasksTable
                                tasks={tasks}
                                onEdit={handleEdit}
                                onDelete={deleteTask}
                            />
                        </div>
                    </div>
                </div>

                {/* חלק התזכורות - 1/3 מהרוחב */}
                <div className="lg:col-span-1">
                    <div className="modern-card h-full">
                        <div className="p-4 h-full">
                            <RemindersBoard apartmentId={apartmentId} apartmentInfo={apartmentInfo} />
                        </div>
                    </div>
                </div>
            </div>

            <Modal isOpen={isModalOpen} onClose={() => {
                setIsModalOpen(false);
                setSelectedTask(null);
            }}>
                <div className="p-6">
                    <h3 className="text-xl font-bold mb-4">
                        {selectedTask ? 'עריכת משימה' : 'משימה חדשה'}
                    </h3>
                    
                    <TaskForm
                        task={selectedTask}
                        onSubmit={handleSubmit}
                        onCancel={() => {
                            setIsModalOpen(false);
                            setSelectedTask(null);
                        }}
                    />
                </div>
            </Modal>
        </div>
    );
} 