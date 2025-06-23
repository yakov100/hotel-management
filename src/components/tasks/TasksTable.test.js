import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import TasksTable from './TasksTable';

describe('TasksTable', () => {
    const mockTasks = [
        {
            id: '1',
            title: 'Task 1',
            description: 'Description 1',
            status: 'pending',
            priority: 'high',
            dueDate: '2024-03-20'
        },
        {
            id: '2',
            title: 'Task 2',
            description: 'Description 2',
            status: 'completed',
            priority: 'low',
            dueDate: '2024-03-21'
        }
    ];

    const mockEdit = jest.fn();
    const mockDelete = jest.fn();

    beforeEach(() => {
        jest.clearAllMocks();
    });

    test('renders table headers', () => {
        render(<TasksTable tasks={mockTasks} onEdit={mockEdit} onDelete={mockDelete} />);
        
        expect(screen.getByText(/כותרת/i)).toBeInTheDocument();
        expect(screen.getByText(/תיאור/i)).toBeInTheDocument();
        expect(screen.getByText(/סטטוס/i)).toBeInTheDocument();
        expect(screen.getByText(/עדיפות/i)).toBeInTheDocument();
        expect(screen.getByText(/תאריך יעד/i)).toBeInTheDocument();
        expect(screen.getByText(/פעולות/i)).toBeInTheDocument();
    });

    test('renders task data correctly', () => {
        render(<TasksTable tasks={mockTasks} onEdit={mockEdit} onDelete={mockDelete} />);
        
        mockTasks.forEach(task => {
            expect(screen.getByText(task.title)).toBeInTheDocument();
            expect(screen.getByText(task.description)).toBeInTheDocument();
            expect(screen.getByText(task.dueDate)).toBeInTheDocument();
        });
    });

    test('calls onEdit when row is clicked', () => {
        render(<TasksTable tasks={mockTasks} onEdit={mockEdit} onDelete={mockDelete} />);
        
        fireEvent.click(screen.getByText(mockTasks[0].title));
        expect(mockEdit).toHaveBeenCalledTimes(1);
        expect(mockEdit).toHaveBeenCalledWith(mockTasks[0]);
    });

    test('calls onDelete when delete button is clicked', () => {
        render(<TasksTable tasks={mockTasks} onEdit={mockEdit} onDelete={mockDelete} />);
        
        const deleteButtons = screen.getAllByText(/מחק/i);
        fireEvent.click(deleteButtons[0]);
        expect(mockDelete).toHaveBeenCalledTimes(1);
        expect(mockDelete).toHaveBeenCalledWith(mockTasks[0].id);
    });

    test('displays correct status text', () => {
        render(<TasksTable tasks={mockTasks} onEdit={mockEdit} onDelete={mockDelete} />);
        
        expect(screen.getByText('ממתין')).toBeInTheDocument();
        expect(screen.getByText('הושלם')).toBeInTheDocument();
    });

    test('displays correct priority text', () => {
        render(<TasksTable tasks={mockTasks} onEdit={mockEdit} onDelete={mockDelete} />);
        
        expect(screen.getByText('גבוהה')).toBeInTheDocument();
        expect(screen.getByText('נמוכה')).toBeInTheDocument();
    });
}); 