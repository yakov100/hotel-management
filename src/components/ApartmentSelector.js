import React, { useState } from 'react';
import { useApartment } from '../context/ApartmentContext';
import { ChevronDownIcon, BuildingOfficeIcon, PlusIcon } from '@heroicons/react/24/outline';

export default function ApartmentSelector({ onCreateApartment }) {
  const { userApartments, selectedApartment, selectApartment, loading } = useApartment();
  const [isOpen, setIsOpen] = useState(false);

  console.log('ApartmentSelector render:', {
    hasOnCreateApartment: !!onCreateApartment,
    userApartmentsLength: userApartments.length,
    loading,
    selectedApartment: selectedApartment?.name
  });

  if (loading) {
    return (
      <div className="flex items-center space-x-2 bg-white/10 rounded-lg px-3 py-2">
        <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
        <span className="text-white/80 text-sm">טוען דירות...</span>
      </div>
    );
  }

  if (userApartments.length === 0) {
    return (
      <button
        onClick={() => {
          console.log('ApartmentSelector - No apartments button clicked');
          console.log('onCreateApartment function:', !!onCreateApartment);
          onCreateApartment?.();
        }}
        className="flex items-center space-x-2 bg-white/10 hover:bg-white/20 rounded-lg px-3 py-2 transition-colors"
      >
        <PlusIcon className="w-4 h-4 text-white" />
        <span className="text-white text-sm font-medium">צור דירה חדשה</span>
      </button>
    );
  }

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center space-x-2 bg-white/10 hover:bg-white/20 rounded-lg px-3 py-2 transition-colors min-w-48"
        dir="rtl"
      >
        <BuildingOfficeIcon className="w-4 h-4 text-white flex-shrink-0" />
        <div className="flex-1 text-right">
          <div className="text-white text-sm font-medium truncate">
            {selectedApartment?.name || 'בחר דירה'}
          </div>
          {selectedApartment?.address && (
            <div className="text-white/70 text-xs truncate">
              {selectedApartment.address}
            </div>
          )}
        </div>
        <ChevronDownIcon 
          className={`w-4 h-4 text-white transition-transform ${isOpen ? 'rotate-180' : ''}`} 
        />
      </button>

      {isOpen && (
        <>
          {/* Backdrop */}
          <div 
            className="fixed inset-0 z-10" 
            onClick={() => setIsOpen(false)}
          />
          
          {/* Dropdown */}
          <div className="absolute top-full left-0 right-0 mt-1 bg-white rounded-lg shadow-xl border border-gray-200 z-20 max-h-64 overflow-y-auto">
            {userApartments.map((apartment) => (
              <button
                key={apartment.id}
                onClick={() => {
                  selectApartment(apartment);
                  setIsOpen(false);
                }}
                className={`w-full text-right px-4 py-3 hover:bg-gray-50 border-b border-gray-100 last:border-b-0 transition-colors ${
                  selectedApartment?.id === apartment.id ? 'bg-blue-50 text-blue-700' : 'text-gray-700'
                }`}
                dir="rtl"
              >
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <div className="font-medium text-sm">
                      {apartment.name}
                    </div>
                    {apartment.address && (
                      <div className="text-xs text-gray-500 mt-1">
                        {apartment.address}
                      </div>
                    )}
                  </div>
                  <div className="flex items-center space-x-2 mr-3">
                    <span className={`px-2 py-1 text-xs rounded-full ${
                      apartment.userRole === 'owner' 
                        ? 'bg-purple-100 text-purple-700' 
                        : apartment.userRole === 'manager'
                        ? 'bg-blue-100 text-blue-700'
                        : 'bg-green-100 text-green-700'
                    }`}>
                      {apartment.userRole === 'owner' ? 'בעלים' : 
                       apartment.userRole === 'manager' ? 'מנהל' : 'חבר'}
                    </span>
                  </div>
                </div>
              </button>
            ))}
            
            {/* Create new apartment option */}
            <button
              onClick={() => {
                console.log('ApartmentSelector - Dropdown create button clicked');
                console.log('onCreateApartment function:', !!onCreateApartment);
                onCreateApartment?.();
                setIsOpen(false);
              }}
              className="w-full text-right px-4 py-3 hover:bg-gray-50 border-t border-gray-200 text-blue-600 transition-colors"
              dir="rtl"
            >
              <div className="flex items-center">
                <PlusIcon className="w-4 h-4 ml-2" />
                <span className="text-sm font-medium">צור דירה חדשה</span>
              </div>
            </button>
          </div>
        </>
      )}
    </div>
  );
} 