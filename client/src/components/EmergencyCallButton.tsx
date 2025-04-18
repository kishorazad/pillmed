import React, { useState } from 'react';
import { Phone, X, AlertTriangle, Heart, Plus } from 'lucide-react';
import { useLanguage } from './LanguageSwitcher';

const EmergencyCallButton: React.FC = () => {
  const { t } = useLanguage();
  const [isOpen, setIsOpen] = useState(false);

  const emergencyNumbers = [
    { name: t('hospital'), number: '8770762307', icon: <AlertTriangle size={16} /> },
    { name: t('ambulance'), number: '108', icon: <Heart size={16} /> },
    { name: t('relative'), number: '', icon: <Plus size={16} />, editable: true }
  ];

  const [numbers, setNumbers] = useState(emergencyNumbers);

  const handleEditRelative = (e: React.ChangeEvent<HTMLInputElement>) => {
    const updatedNumbers = [...numbers];
    const relativeIndex = updatedNumbers.findIndex(item => item.editable);
    
    if (relativeIndex !== -1) {
      updatedNumbers[relativeIndex] = {
        ...updatedNumbers[relativeIndex],
        number: e.target.value
      };
      setNumbers(updatedNumbers);
      
      // Save to localStorage for persistence
      localStorage.setItem('relativeNumber', e.target.value);
    }
  };

  // Load relative's number from localStorage
  React.useEffect(() => {
    const savedNumber = localStorage.getItem('relativeNumber');
    if (savedNumber) {
      const updatedNumbers = [...numbers];
      const relativeIndex = updatedNumbers.findIndex(item => item.editable);
      
      if (relativeIndex !== -1) {
        updatedNumbers[relativeIndex] = {
          ...updatedNumbers[relativeIndex],
          number: savedNumber
        };
        setNumbers(updatedNumbers);
      }
    }
  }, []);

  return (
    <div className="fixed bottom-20 right-4 z-50 flex flex-col items-end">
      {isOpen && (
        <div className="mb-2 bg-white rounded-lg shadow-lg overflow-hidden">
          <div className="p-3 bg-red-600 text-white font-medium text-center">
            {t('emergency_numbers')}
          </div>
          
          <div className="p-2">
            {numbers.map((item, index) => (
              <div key={index} className="flex items-center p-2 hover:bg-gray-100 rounded">
                <div className="w-8 h-8 rounded-full bg-red-100 text-red-600 flex items-center justify-center mr-3">
                  {item.icon}
                </div>
                
                <div className="flex-grow">
                  <div className="text-gray-700 font-medium">{item.name}</div>
                  {item.editable ? (
                    <input
                      type="tel"
                      value={item.number}
                      onChange={handleEditRelative}
                      placeholder={t('add_relative_number')}
                      className="text-sm w-full border rounded px-2 py-1 mt-1 focus:outline-none focus:ring-1 focus:ring-red-500"
                    />
                  ) : (
                    <div className="text-gray-600 text-sm">{item.number}</div>
                  )}
                </div>
                
                {!item.editable && (
                  <a
                    href={`tel:${item.number}`}
                    className="ml-2 w-8 h-8 bg-red-600 text-white rounded-full flex items-center justify-center"
                  >
                    <Phone size={16} />
                  </a>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
      
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-14 h-14 rounded-full bg-red-600 text-white flex items-center justify-center shadow-lg hover:bg-red-700 transition-colors"
        aria-label={isOpen ? t('close_emergency_contacts') : t('open_emergency_contacts')}
      >
        {isOpen ? <X size={24} /> : <Phone size={24} />}
      </button>
    </div>
  );
};

export default EmergencyCallButton;