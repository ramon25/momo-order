'use client';

import { useState, useEffect, Fragment } from 'react';
import { Document, Page, Text, View, StyleSheet, pdf } from '@react-pdf/renderer';

interface Order {
  name: string;
  meatMomos: number;
  veggieMomos: number;
  wantsSoySauce: boolean;
}

const styles = StyleSheet.create({
  page: {
    padding: 40,
    fontFamily: 'Helvetica',
  },
  header: {
    marginBottom: 30,
  },
  title: {
    fontSize: 24,
    marginBottom: 8,
    fontWeight: 'bold',
    color: '#1a365d',
  },
  subtitle: {
    fontSize: 14,
    color: '#4a5568',
    marginBottom: 20,
  },
  orderSection: {
    marginBottom: 30,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#2d3748',
    marginBottom: 12,
    paddingBottom: 8,
    borderBottom: 1,
    borderBottomColor: '#e2e8f0',
  },
  order: {
    marginBottom: 20,
    padding: 12,
    backgroundColor: '#f7fafc',
    borderRadius: 8,
  },
  orderHeader: {
    flexDirection: 'row' as const,
    justifyContent: 'space-between' as const,
    marginBottom: 8,
  },
  orderName: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#2d3748',
  },
  orderTotal: {
    fontSize: 14,
    color: '#2b6cb0',
    fontWeight: 'bold',
  },
  orderDetails: {
    marginLeft: 12,
  },
  orderItem: {
    fontSize: 12,
    color: '#4a5568',
    marginBottom: 4,
  },
  totalSection: {
    marginTop: 30,
    paddingTop: 16,
    borderTop: 2,
    borderTopColor: '#e2e8f0',
  },
  totalRow: {
    flexDirection: 'row' as const,
    justifyContent: 'space-between' as const,
    marginBottom: 8,
  },
  totalLabel: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#2d3748',
  },
  totalAmount: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#2b6cb0',
  },
  footer: {
    position: 'absolute' as const,
    bottom: 40,
    left: 40,
    right: 40,
    fontSize: 10,
    color: '#718096',
    textAlign: 'center' as const,
  },
});

const ConfirmDialog = ({ 
  isOpen, 
  onClose, 
  onConfirm 
}: { 
  isOpen: boolean; 
  onClose: () => void; 
  onConfirm: () => void;
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex min-h-full items-end justify-center p-4 text-center sm:items-center sm:p-0">
        <div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" onClick={onClose} />
        
        <div className="relative transform overflow-hidden rounded-2xl bg-white px-4 pb-4 pt-5 text-left shadow-xl transition-all sm:my-8 sm:w-full sm:max-w-lg sm:p-6">
          <div className="sm:flex sm:items-start">
            <div className="mx-auto flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-full bg-red-100 sm:mx-0 sm:h-10 sm:w-10">
              <svg className="h-6 w-6 text-red-600" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z" />
              </svg>
            </div>
            <div className="mt-3 text-center sm:ml-4 sm:mt-0 sm:text-left">
              <h3 className="text-lg font-medium leading-6 text-gray-900">
                Clear All Orders
              </h3>
              <div className="mt-2">
                <p className="text-sm text-gray-500">
                  Are you sure you want to clear all orders? This action cannot be undone.
                </p>
              </div>
            </div>
          </div>
          <div className="mt-5 sm:mt-4 sm:flex sm:flex-row-reverse gap-3">
            <button
              type="button"
              onClick={() => {
                onConfirm();
                onClose();
              }}
              className="w-full sm:w-auto px-4 py-2 text-sm font-medium text-white bg-red-600 hover:bg-red-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2"
            >
              Clear All
            </button>
            <button
              type="button"
              onClick={onClose}
              className="mt-3 sm:mt-0 w-full sm:w-auto px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-[#1d4f91] focus:ring-offset-2"
            >
              Cancel
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

const OrderPDF = ({ orders }: { orders: Order[] }) => {
  const totalAmount = orders.reduce((acc, order) => 
    acc + (order.meatMomos + order.veggieMomos) * 2, 0
  );
  const totalMomos = orders.reduce((acc, order) => 
    acc + order.meatMomos + order.veggieMomos, 0
  );

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        <View style={styles.header}>
          <Text style={styles.title}>Monday Momo Order</Text>
          <Text style={styles.subtitle}>Order Date: {new Date().toLocaleDateString('en-CH', {
            weekday: 'long',
            year: 'numeric',
            month: 'long',
            day: 'numeric'
          })}</Text>
        </View>

        <View style={styles.orderSection}>
          <Text style={styles.sectionTitle}>Order Details</Text>
          {orders.map((order, index) => (
            <View key={index} style={styles.order}>
              <View style={styles.orderHeader}>
                <Text style={styles.orderName}>{order.name}</Text>
                <Text style={styles.orderTotal}>CHF {(order.meatMomos + order.veggieMomos) * 2}</Text>
              </View>
              <View style={styles.orderDetails}>
                {order.meatMomos > 0 && (
                  <Text style={styles.orderItem}>• Meat Momos: {order.meatMomos} × CHF 2 = CHF {order.meatMomos * 2}</Text>
                )}
                {order.veggieMomos > 0 && (
                  <Text style={styles.orderItem}>• Veggie Momos: {order.veggieMomos} × CHF 2 = CHF {order.veggieMomos * 2}</Text>
                )}
                <Text style={[styles.orderItem, { color: '#718096' }]}>
                  {order.wantsSoySauce ? '• With soy sauce' : '• No soy sauce'}
                </Text>
              </View>
            </View>
          ))}
        </View>

        <View style={styles.totalSection}>
          <View style={styles.totalRow}>
            <Text style={styles.totalLabel}>Total Momos</Text>
            <Text style={styles.totalAmount}>{totalMomos} pieces</Text>
          </View>
          <View style={styles.totalRow}>
            <Text style={styles.totalLabel}>Total Amount</Text>
            <Text style={styles.totalAmount}>CHF {totalAmount}</Text>
          </View>
        </View>

        <Text style={styles.footer}>
          This order was generated on {new Date().toLocaleString('en-CH', {
            timeZone: 'Europe/Zurich',
            hour: '2-digit',
            minute: '2-digit',
            hour12: false
          })}
        </Text>
      </Page>
    </Document>
  );
};

export default function Home() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [name, setName] = useState('');
  const [meatMomos, setMeatMomos] = useState(0);
  const [veggieMomos, setVeggieMomos] = useState(0);
  const [wantsSoySauce, setWantsSoySauce] = useState(true);
  const [isLoaded, setIsLoaded] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState({
    name: '',
    meatMomos: '',
    veggieMomos: '',
    total: ''
  });
  const [isConfirmDialogOpen, setIsConfirmDialogOpen] = useState(false);
  const [editingOrder, setEditingOrder] = useState<{ index: number; order: Order } | null>(null);

  // Load orders from localStorage only after component mounts
  useEffect(() => {
    const loadOrders = async () => {
      setIsLoading(true);
      try {
        const savedOrders = localStorage.getItem('momoOrders');
        if (savedOrders) {
          setOrders(JSON.parse(savedOrders));
        }
      } catch (error) {
        console.error('Error loading orders:', error);
      }
      setIsLoaded(true);
      setIsLoading(false);
    };
    loadOrders();
  }, []);

  // Save orders to localStorage whenever they change
  useEffect(() => {
    if (isLoaded) {
      localStorage.setItem('momoOrders', JSON.stringify(orders));
    }
  }, [orders, isLoaded]);

  const predefinedNames = [
    'Ramon',
    'Roger',
    'Sandro',
    'Paavo',
    'Janik'
  ];

  const quickOrders = [
    { meat: 5, veggie: 5, label: '5 Meat + 5 Veggie', price: 20 },
    { meat: 4, veggie: 4, label: '4 Meat + 4 Veggie', price: 16 },
    { meat: 8, veggie: 0, label: '8 Meat', price: 16 },
    { meat: 0, veggie: 8, label: '8 Veggie', price: 16 },
  ];

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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (validateForm()) {
      setIsSubmitting(true);
      try {
        if (editingOrder !== null) {
          // Update existing order
          setOrders(prevOrders => {
            const newOrders = [...prevOrders];
            newOrders[editingOrder.index] = { name, meatMomos, veggieMomos, wantsSoySauce };
            return newOrders;
          });
          setEditingOrder(null);
        } else {
          // Add new order
          setOrders([...orders, { name, meatMomos, veggieMomos, wantsSoySauce }]);
        }
        setName('');
        setMeatMomos(0);
        setVeggieMomos(0);
        setWantsSoySauce(true);
        setErrors({ name: '', meatMomos: '', veggieMomos: '', total: '' });
      } finally {
        setIsSubmitting(false);
      }
    }
  };

  const handleEdit = (order: Order, index: number) => {
    setName(order.name);
    setMeatMomos(order.meatMomos);
    setVeggieMomos(order.veggieMomos);
    setWantsSoySauce(order.wantsSoySauce);
    setEditingOrder({ index, order });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleCancelEdit = () => {
    setEditingOrder(null);
    setName('');
    setMeatMomos(0);
    setVeggieMomos(0);
    setWantsSoySauce(true);
    setErrors({ name: '', meatMomos: '', veggieMomos: '', total: '' });
  };

  const handleDuplicate = (orderToDuplicate: Order) => {
    setName(orderToDuplicate.name);
    setMeatMomos(orderToDuplicate.meatMomos);
    setVeggieMomos(orderToDuplicate.veggieMomos);
    setWantsSoySauce(orderToDuplicate.wantsSoySauce);
  };

  // Group orders by name
  const groupedOrders = orders.reduce((groups, order) => {
    const name = order.name;
    if (!groups[name]) {
      groups[name] = [];
    }
    groups[name].push(order);
    return groups;
  }, {} as Record<string, Order[]>);

  // Calculate totals
  const totalMeatMomos = orders.reduce((acc, order) => acc + order.meatMomos, 0);
  const totalVeggieMomos = orders.reduce((acc, order) => acc + order.veggieMomos, 0);
  const totalAmount = orders.reduce((acc, order) => acc + (order.meatMomos + order.veggieMomos) * 2, 0);

  const handleNumberInput = (value: string, setter: (num: number) => void, field: 'meatMomos' | 'veggieMomos') => {
    const num = value === '' ? 0 : parseInt(value);
    if (!isNaN(num)) {
      setter(num);
      // Clear the specific error when user starts typing
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

  const handleDeleteOrder = (indexToDelete: number, e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setOrders(prevOrders => {
      const newOrders = prevOrders.filter((_, index) => index !== indexToDelete);
      return newOrders;
    });
  };

  const handleClearOrders = () => {
    setOrders([]);
    setIsConfirmDialogOpen(false);
  };

  return (
    <>
      <ConfirmDialog
        isOpen={isConfirmDialogOpen}
        onClose={() => setIsConfirmDialogOpen(false)}
        onConfirm={handleClearOrders}
      />

      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-white pb-20">
        <main className="container mx-auto px-4 sm:px-6 py-8 sm:py-12 max-w-5xl">
          <div className="text-center mb-12">
            <h1 className="text-4xl font-light text-[#1d4f91] mb-3 tracking-tight">Monday Momo Order</h1>
            <p className="text-gray-500 text-lg">Order your favorite momos for Monday delivery</p>
          </div>

          {/* Order Statistics */}
          {orders.length > 0 && (
            <div className="grid grid-cols-2 gap-4 mb-8">
              <div className="bg-blue-50/50 rounded-xl p-4 text-center">
                <p className="text-[#1d4f91] text-2xl font-medium">{totalMeatMomos}</p>
                <p className="text-gray-600 text-sm">Total Meat Momos</p>
              </div>
              <div className="bg-green-50/50 rounded-xl p-4 text-center">
                <p className="text-[#1d4f91] text-2xl font-medium">{totalVeggieMomos}</p>
                <p className="text-gray-600 text-sm">Total Veggie Momos</p>
              </div>
            </div>
          )}
          
          <div className="grid lg:grid-cols-2 gap-6 lg:gap-10">
            {/* Order Form */}
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
                  <div className="grid grid-cols-3 gap-2">
                    {predefinedNames.map((predefinedName) => (
                      <button
                        key={predefinedName}
                        type="button"
                        onClick={() => {
                          setName(predefinedName);
                          setErrors(prev => ({ ...prev, name: '' }));
                        }}
                        className={`px-3 py-2.5 text-sm rounded-xl transition-all duration-200 ${
                          name === predefinedName
                            ? 'bg-gradient-to-br from-[#1d4f91] to-[#15396d] text-white shadow-md'
                            : 'bg-white border border-gray-200 text-gray-600 hover:border-[#1d4f91]/30 hover:shadow-sm'
                        }`}
                      >
                        {predefinedName}
                      </button>
                    ))}
                  </div>

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

                {/* Number inputs with modern styling */}
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
                      onClick={handleCancelEdit}
                      className="px-4 py-3.5 text-gray-600 hover:text-gray-800 font-normal rounded-xl border border-gray-200 hover:bg-gray-50 transition-colors"
                    >
                      Cancel
                    </button>
                  )}
                </div>
              </form>
            </div>

            {/* Order Summary */}
            <div className="bg-white/70 backdrop-blur-sm rounded-2xl p-8 border border-gray-100 shadow-sm">
              <div className="flex justify-between items-center mb-8">
                <h2 className="text-2xl font-light text-[#1d4f91]">Order Summary</h2>
                {orders.length > 0 && (
                  <span className="text-sm text-gray-500 bg-gray-100 px-2 py-1 rounded-lg">
                    {orders.length} order{orders.length !== 1 ? 's' : ''}
                  </span>
                )}
              </div>
              
              {isLoading ? (
                <div className="flex flex-col items-center justify-center py-12 space-y-4">
                  <div className="animate-spin rounded-full h-10 w-10 border-2 border-[#1d4f91] border-b-transparent"></div>
                  <p className="text-gray-500">Loading orders...</p>
                </div>
              ) : orders.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-12 space-y-4 text-gray-500">
                  <svg className="w-16 h-16 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M9 13h6m-3-3v6m-9 1V7a2 2 0 012-2h6l2 2h6a2 2 0 012 2v8a2 2 0 01-2 2H5a2 2 0 01-2-2z" />
                  </svg>
                  <p>No orders yet. Add your first order!</p>
                </div>
              ) : (
                <div className="space-y-6">
                  {Object.entries(groupedOrders).map(([name, userOrders]) => (
                    <div key={name} className="bg-gray-50 rounded-xl p-4">
                      <h3 className="font-medium text-gray-800 mb-3">{name}'s Orders</h3>
                      <div className="space-y-3">
                        {userOrders.map((order, index) => (
                          <div key={index} className="bg-white rounded-xl p-4 border border-gray-100 shadow-sm group relative hover:shadow-md transition-all duration-200">
                            <div className="absolute top-3 right-3 flex space-x-2 opacity-0 group-hover:opacity-100 transition-all duration-200">
                              <button
                                onClick={() => handleEdit(order, index)}
                                className="p-2 text-gray-400 hover:text-[#1d4f91] hover:bg-blue-50 rounded-lg transition-colors"
                                title="Edit order"
                              >
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                                </svg>
                              </button>
                              <button
                                onClick={() => handleDuplicate(order)}
                                className="p-2 text-gray-400 hover:text-[#1d4f91] hover:bg-blue-50 rounded-lg transition-colors"
                                title="Duplicate order"
                              >
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                                </svg>
                              </button>
                              <button
                                onClick={(e) => handleDeleteOrder(index, e)}
                                className="p-2 hover:bg-red-50 text-gray-400 hover:text-red-500 rounded-lg transition-colors"
                                title="Delete order"
                              >
                                <svg className="w-4 h-4" viewBox="0 0 20 20" fill="currentColor">
                                  <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                                </svg>
                              </button>
                            </div>
                            <div className="flex justify-between items-center mb-3">
                              <span className="text-[#1d4f91] font-medium">
                                CHF {(order.meatMomos + order.veggieMomos) * 2}
                              </span>
                            </div>
                            <div className="text-sm text-gray-600 space-y-1.5">
                              {order.meatMomos > 0 && (
                                <p>🥩 Meat Momos: {order.meatMomos}</p>
                              )}
                              {order.veggieMomos > 0 && (
                                <p>🥬 Veggie Momos: {order.veggieMomos}</p>
                              )}
                              <p className="text-gray-500 text-xs">
                                {order.wantsSoySauce ? '🥢 With soy sauce' : '❌ No soy sauce'}
                              </p>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </main>

        {/* Sticky Total Bar */}
        {orders.length > 0 && (
          <div className="fixed bottom-0 left-0 right-0 bg-white/80 backdrop-blur-md border-t border-gray-200 shadow-lg">
            <div className="container mx-auto px-4 sm:px-6 py-4 max-w-5xl flex flex-col sm:flex-row justify-between items-center gap-4">
              <div className="text-lg">
                <span className="text-gray-600">Total:</span>
                <span className="ml-2 text-[#1d4f91] font-medium">
                  CHF {totalAmount}
                </span>
              </div>
              <div className="flex gap-3 w-full sm:w-auto">
                <button
                  onClick={async () => {
                    try {
                      const blob = await pdf(<OrderPDF orders={orders} />).toBlob();
                      const url = URL.createObjectURL(blob);
                      const link = document.createElement('a');
                      link.href = url;
                      link.download = `momo-order-${new Date().toISOString().split('T')[0]}.pdf`;
                      document.body.appendChild(link);
                      link.click();
                      document.body.removeChild(link);
                      URL.revokeObjectURL(url);
                    } catch (error) {
                      console.error('Error generating PDF:', error);
                      alert('Error generating PDF. Please try again.');
                    }
                  }}
                  className="flex-1 sm:flex-none bg-gradient-to-br from-[#1d4f91] to-[#15396d] hover:from-[#15396d] hover:to-[#102a4f] text-white font-normal py-2.5 px-6 rounded-xl shadow-sm hover:shadow-md transition-all duration-200"
                >
                  Download PDF
                </button>
                <button
                  onClick={() => setIsConfirmDialogOpen(true)}
                  className="flex-1 sm:flex-none bg-white border border-gray-200 hover:border-red-200 hover:bg-red-50 text-gray-600 hover:text-red-600 font-normal py-2.5 px-6 rounded-xl transition-all duration-200 text-sm"
                >
                  Clear All
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </>
  );
}
