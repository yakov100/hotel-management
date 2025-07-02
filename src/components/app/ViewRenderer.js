import React from 'react';
import BookingsView from '../../views/BookingsView';
import GuestsView from '../../views/GuestsView';
import TasksView from '../../views/TasksView';
import InventoryView from '../../views/InventoryView';
import FinancesView from '../../views/FinancesView';
import MaintenanceView from '../../views/MaintenanceView';
import ReportsView from '../../views/ReportsView';
import SettingsView from '../../views/SettingsView';
import ApartmentUsersView from '../../views/ApartmentUsersView';

export default function ViewRenderer({
    activeView,
    selectedApartment,
    appData,
    dataHandlers,
    appHandlers,
    settings
}) {
    if (!selectedApartment) {
        return (
            <div style={{ 
                display: 'flex', 
                flexDirection: 'column', 
                justifyContent: 'center', 
                alignItems: 'center', 
                height: '100%', 
                padding: '32px' 
            }}>
                <div style={{ 
                    backgroundColor: 'white', 
                    padding: '32px', 
                    textAlign: 'center', 
                    maxWidth: '384px',
                    borderRadius: '16px',
                    boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1)'
                }}>
                    <h3 style={{ fontSize: '20px', fontWeight: 'bold', color: '#1e3a8a', marginBottom: '8px' }}>בחר דירה</h3>
                    <p style={{ color: '#3730a3' }}>יש לבחור דירה כדי להמשיך</p>
                </div>
            </div>
        );
    }

    switch (activeView) {
        case 'bookings':
            return (
                <BookingsView
                    bookings={appData.bookings}
                    loading={appData.bookingsLoading}
                    error={appData.bookingsError}
                    onSave={dataHandlers.handleSave('bookings')}
                    onDelete={dataHandlers.handleDelete('bookings')}
                    settings={settings}
                    currentProjectId={appHandlers.currentProjectId}
                    onProjectSelect={appHandlers.handleProjectSelect}
                    selectedApartment={selectedApartment}
                />
            );
        case 'guests':
            return (
                <GuestsView
                    guests={appData.guests}
                    onSave={dataHandlers.handleSave('guests')}
                    onDelete={dataHandlers.handleDelete('guests')}
                    settings={settings}
                    bookings={appData.bookings}
                />
            );
        case 'tasks':
            return (
                <TasksView
                    tasks={appData.tasks}
                    onSave={dataHandlers.handleSave('tasks')}
                    onDelete={dataHandlers.handleDelete('tasks')}
                    apartmentId={selectedApartment?.id}
                    apartmentInfo={selectedApartment}
                />
            );
        case 'inventory':
            return (
                <InventoryView
                    inventory={appData.inventory}
                    onSave={dataHandlers.handleSave('inventory')}
                    onDelete={dataHandlers.handleDelete('inventory')}
                />
            );
        case 'finances':
            return (
                <FinancesView
                    finances={appData.finances}
                    onSave={dataHandlers.handleSave('finances')}
                    onDelete={dataHandlers.handleDelete('finances')}
                />
            );
        case 'maintenance':
            return (
                <MaintenanceView
                    maintenance={appData.maintenance}
                    onSave={dataHandlers.handleSave('maintenance')}
                    onDelete={dataHandlers.handleDelete('maintenance')}
                />
            );
        case 'reports':
            return <ReportsView bookings={appData.bookings} finances={appData.finances} />;
        case 'settings':
            return (
                <SettingsView
                    settings={settings}
                    onSave={dataHandlers.handleSettingsSave(selectedApartment)}
                    tenant={selectedApartment}
                />
            );
        case 'users':
            return <ApartmentUsersView />;
        default:
            return (
                <div style={{ 
                    display: 'flex', 
                    justifyContent: 'center', 
                    alignItems: 'center', 
                    height: '100%' 
                }}>
                    <div style={{ 
                        backgroundColor: 'white', 
                        padding: '32px', 
                        textAlign: 'center',
                        borderRadius: '16px',
                        boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1)'
                    }}>
                        <p style={{ fontSize: '18px', color: '#374151' }}>יש לבחור תצוגה</p>
                    </div>
                </div>
            );
    }
} 