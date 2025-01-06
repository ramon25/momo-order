import { useState } from 'react';
import { NameConfig } from '../../types';

interface NameConfigurationProps {
  nameConfigs: NameConfig[];
  onAddName: (name: string, defaultSoySauce: boolean) => void;
  onRemoveName: (name: string) => void;
  onUpdatePreference: (name: string, defaultSoySauce: boolean) => void;
}

export function NameConfiguration({
  nameConfigs,
  onAddName,
  onRemoveName,
  onUpdatePreference,
}: NameConfigurationProps) {
  const [newName, setNewName] = useState('');
  const [newNameSoySauce, setNewNameSoySauce] = useState(true);

  const handleAddName = () => {
    if (newName.trim() && !nameConfigs.some(c => c.name === newName.trim())) {
      onAddName(newName.trim(), newNameSoySauce);
      setNewName('');
      setNewNameSoySauce(true);
    }
  };

  return (
    <div className="mb-8 bg-white/70 backdrop-blur-sm rounded-2xl p-8 border border-gray-100 shadow-sm">
      <h2 className="text-2xl font-light text-[#1d4f91] mb-6">Name Configuration</h2>
      
      {/* Add New Name */}
      <div className="flex gap-4 mb-6">
        <div className="flex-1">
          <input
            type="text"
            value={newName}
            onChange={(e) => setNewName(e.target.value)}
            placeholder="Enter new name"
            className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:border-[#1d4f91] focus:ring-1 focus:ring-[#1d4f91]"
          />
        </div>
        <div className="flex items-center gap-2">
          <input
            type="checkbox"
            id="newNameSoySauce"
            checked={newNameSoySauce}
            onChange={(e) => setNewNameSoySauce(e.target.checked)}
            className="w-4 h-4 text-[#1d4f91] rounded-lg border-gray-300 focus:ring-[#1d4f91]"
          />
          <label htmlFor="newNameSoySauce" className="text-sm text-gray-600">
            Default Soy Sauce
          </label>
        </div>
        <button
          onClick={handleAddName}
          disabled={!newName.trim()}
          className="px-4 py-2 bg-[#1d4f91] text-white rounded-xl hover:bg-[#15396d] disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Add Name
        </button>
      </div>

      {/* Name List */}
      <div className="space-y-3">
        {nameConfigs.map((config) => (
          <div key={config.name} className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
            <span className="font-medium text-gray-700">{config.name}</span>
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id={`soySauce_${config.name}`}
                  checked={config.defaultSoySauce}
                  onChange={(e) => onUpdatePreference(config.name, e.target.checked)}
                  className="w-4 h-4 text-[#1d4f91] rounded-lg border-gray-300 focus:ring-[#1d4f91]"
                />
                <label htmlFor={`soySauce_${config.name}`} className="text-sm text-gray-600">
                  Default Soy Sauce
                </label>
              </div>
              <button
                onClick={() => onRemoveName(config.name)}
                className="p-2 text-gray-400 hover:text-red-500 rounded-lg"
              >
                <svg className="w-5 h-5" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                </svg>
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
} 