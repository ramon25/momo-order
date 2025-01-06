import { useState } from 'react';
import { Order, NameConfig } from '../../types';

interface OrderFormProps {
  nameConfigs: NameConfig[];
  onSubmit: (order: Order) => void;
  editingOrder: { index: number; order: Order } | null;
  onCancelEdit: () => void;
  isSubmitting: boolean;
}

interface FormErrors {
  name: string;
  meatMomos: string;
  veggieMomos: string;
  total: string;
}

const quickOrders = [
  { meat: 5, veggie: 5, label: '5 Meat + 5 Veggie', price: 20 },
  { meat: 4, veggie: 4, label: '4 Meat + 4 Veggie', price: 16 },
  { meat: 8, veggie: 0, label: '8 Meat', price: 16 },
  { meat: 0, veggie: 8, label: '8 Veggie', price: 16 },
];

export function OrderForm({
  nameConfigs,
  onSubmit,
  editingOrder,
  onCancelEdit,
  isSubmitting,
}: OrderFormProps) {
  const [name, setName] = useState(editingOrder?.order.name || '');
  const [meatMomos, setMeatMomos] = useState(editingOrder?.order.meatMomos || 0);
  const [veggieMomos, setVeggieMomos] = useState(editingOrder?.order.veggieMomos || 0);
  const [wantsSoySauce, setWantsSoySauce] = useState(editingOrder?.order.wantsSoySauce ?? true);
  const [errors, setErrors] = useState<FormErrors>({
    name: '',
    meatMomos: '',
    veggieMomos: '',
    total: ''
  });

  const validateForm = () => {
    const newErrors = {
      name: '',
      meatMomos: '',
      veggieMomos: '',
      total: ''
    };
    let isValid = true;

    // Name validation
    if (!name.trim()) {
      newErrors.name = 'Name is required';
      isValid = false;
    } else if (name.trim().length < 2) {
      newErrors.name = 'Name must be at least 2 characters';
      isValid = false;
    }

    // Momo quantity validations
    if (meatMomos < 0) {
      newErrors.meatMomos = 'Cannot be negative';
      isValid = false;
    }
    if (veggieMomos < 0) {
      newErrors.veggieMomos = 'Cannot be negative';
      isValid = false;
    }
    
    // Total momos validation
    const totalMomos = meatMomos + veggieMomos;
    if (totalMomos === 0) {
      newErrors.total = 'Please order at least one momo';
      isValid = false;
    } else if (totalMomos > 20) {
      newErrors.total = 'Maximum 20 momos per order';
      isValid = false;
    }

    setErrors(newErrors);
    return isValid;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (validateForm()) {
      onSubmit({
        name,
        meatMomos,
        veggieMomos,
        wantsSoySauce
      });
      if (!editingOrder) {
        setName('');
        setMeatMomos(0);
        setVeggieMomos(0);
        setWantsSoySauce(true);
      }
    }
  };

  const handleNameSelect = (selectedName: string) => {
    setName(selectedName);
    const config = nameConfigs.find(c => c.name === selectedName);
    if (config) {
      setWantsSoySauce(config.defaultSoySauce);
    }
    setErrors(prev => ({ ...prev, name: '' }));
  };

  const handleNumberInput = (value: string, setter: (num: number) => void, field: 'meatMomos' | 'veggieMomos') => {
    const num = value === '' ? 0 : parseInt(value);
    if (!isNaN(num)) {
      setter(num);
      setErrors(prev => ({ ...prev, [field]: '', total: '' }));
    }
  };

  const setQuickOrder = (meat: number, veggie: number) => {
    setMeatMomos(meat);
    setVeggieMomos(veggie);
  };

  const isQuickOrderSelected = (meat: number, veggie: number) => {
    return meatMomos === meat && veggieMomos === veggie;
  };

  return (
    <div className="bg-white/70 backdrop-blur-sm rounded-2xl p-8 border border-gray-100 shadow-sm">
      <h2 className="text-2xl font-light text-[#1d4f91] mb-8">Place Your Order</h2>

      {/* Quick Order Buttons */}
      <div className="mb-8">
        <p className="text-sm font-medium text-gray-500 mb-4">Quick Order Options:</p>
        <div className="grid grid-cols-2 gap-3">
          {quickOrders.map((order) => (
            <button
              key={order.label}
              type="button"
              onClick={() => setQuickOrder(order.meat, order.veggie)}
              className={`px-4 py-3 text-sm rounded-xl transition-all duration-200 ${
                isQuickOrderSelected(order.meat, order.veggie)
                  ? 'bg-gradient-to-br from-[#1d4f91] to-[#15396d] text-white shadow-md'
                  : 'bg-white border border-gray-200 text-gray-600 hover:border-[#1d4f91]/30 hover:shadow-sm'
              }`}
            >
              {order.label}
              <span className={`block text-xs mt-1 ${
                isQuickOrderSelected(order.meat, order.veggie)
                  ? 'text-blue-100'
                  : 'text-[#1d4f91]'
              }`}>
                CHF {order.price}
              </span>
            </button>
          ))}
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="space-y-4">
          <label className="block text-sm font-medium text-gray-500 mb-3">Your Name</label>
          
          {/* Predefined Names */}
          {nameConfigs.length > 0 && (
            <div className="grid grid-cols-3 gap-2 mb-4">
              {nameConfigs.map((config) => (
                <button
                  key={config.name}
                  type="button"
                  onClick={() => handleNameSelect(config.name)}
                  className={`px-3 py-2.5 text-sm rounded-xl transition-all duration-200 ${
                    name === config.name
                      ? 'bg-gradient-to-br from-[#1d4f91] to-[#15396d] text-white shadow-md'
                      : 'bg-white border border-gray-200 text-gray-600 hover:border-[#1d4f91]/30 hover:shadow-sm'
                  }`}
                >
                  {config.name}
                </button>
              ))}
            </div>
          )}

          {/* Custom Name Input */}
          <div className="space-y-1">
            <div className="relative">
              <input
                type="text"
                value={name}
                onChange={(e) => {
                  setName(e.target.value);
                  setErrors(prev => ({ ...prev, name: '' }));
                }}
                className={`w-full px-4 py-2.5 rounded-xl border ${
                  errors.name 
                    ? 'border-red-300 bg-red-50'
                    : 'border-gray-200 hover:border-[#1d4f91]/30 focus:border-[#1d4f91] focus:ring-1 focus:ring-[#1d4f91]'
                } bg-white transition-all duration-200`}
                placeholder="Or enter a custom name"
                required
              />
              {name && (
                <button
                  type="button"
                  onClick={() => setName('')}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                >
                  ✕
                </button>
              )}
            </div>
            {errors.name && (
              <p className="text-red-500 text-sm mt-1">{errors.name}</p>
            )}
          </div>
        </div>

        {/* Number inputs */}
        <div className="space-y-4">
          <div className="space-y-1">
            <label className="block text-sm font-medium text-gray-500 mb-2">
              Meat Momos (CHF 2 each)
            </label>
            <input
              type="number"
              min="0"
              max="20"
              value={meatMomos || ''}
              onChange={(e) => handleNumberInput(e.target.value, setMeatMomos, 'meatMomos')}
              className={`w-full px-4 py-2.5 rounded-xl border ${
                errors.meatMomos 
                  ? 'border-red-300 bg-red-50'
                  : 'border-gray-200 hover:border-[#1d4f91]/30 focus:border-[#1d4f91] focus:ring-1 focus:ring-[#1d4f91]'
              } bg-white transition-all duration-200`}
              placeholder="0"
            />
            {errors.meatMomos && (
              <p className="text-red-500 text-sm mt-1">{errors.meatMomos}</p>
            )}
          </div>

          <div className="space-y-1">
            <label className="block text-sm font-medium text-gray-500 mb-2">
              Veggie Momos (CHF 2 each)
            </label>
            <input
              type="number"
              min="0"
              max="20"
              value={veggieMomos || ''}
              onChange={(e) => handleNumberInput(e.target.value, setVeggieMomos, 'veggieMomos')}
              className={`w-full px-4 py-2.5 rounded-xl border ${
                errors.veggieMomos 
                  ? 'border-red-300 bg-red-50'
                  : 'border-gray-200 hover:border-[#1d4f91]/30 focus:border-[#1d4f91] focus:ring-1 focus:ring-[#1d4f91]'
              } bg-white transition-all duration-200`}
              placeholder="0"
            />
            {errors.veggieMomos && (
              <p className="text-red-500 text-sm mt-1">{errors.veggieMomos}</p>
            )}
          </div>
        </div>

        {errors.total && (
          <p className="text-red-500 text-sm bg-red-50 p-3 rounded-xl border border-red-100">
            {errors.total}
          </p>
        )}

        <div className="flex items-center bg-gray-50 p-3 rounded-xl">
          <input
            type="checkbox"
            id="soySauce"
            checked={wantsSoySauce}
            onChange={(e) => setWantsSoySauce(e.target.checked)}
            className="w-4 h-4 text-[#1d4f91] rounded-lg border-gray-300 focus:ring-[#1d4f91] transition-all duration-200"
          />
          <label
            htmlFor="soySauce"
            className="ml-3 text-sm font-medium text-gray-600"
          >
            Include Soy Sauce 🥢
          </label>
        </div>
        
        <div className="flex gap-3">
          <button
            type="submit"
            disabled={isSubmitting}
            className={`flex-1 bg-gradient-to-br from-[#1d4f91] to-[#15396d] hover:from-[#15396d] hover:to-[#102a4f] text-white font-normal py-3.5 px-4 rounded-xl shadow-sm hover:shadow-md transition-all duration-200 ${
              isSubmitting ? 'opacity-75 cursor-not-allowed' : ''
            }`}
          >
            {isSubmitting ? (
              <span className="flex items-center justify-center">
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                {editingOrder ? 'Updating...' : 'Adding...'}
              </span>
            ) : (
              editingOrder ? 'Update Order' : 'Add Order'
            )}
          </button>
          {editingOrder && (
            <button
              type="button"
              onClick={onCancelEdit}
              className="px-4 py-3.5 text-gray-600 hover:text-gray-800 font-normal rounded-xl border border-gray-200 hover:bg-gray-50 transition-colors"
            >
              Cancel
            </button>
          )}
        </div>
      </form>
    </div>
  );
} 