'use client';

import { useState, useEffect, useCallback } from 'react';
import { Document, Page, Text, View, StyleSheet, pdf, Image } from '@react-pdf/renderer';
import QRCode from 'qrcode';
import { Logo } from '../components/ui/Logo';
import { OrderForm } from '../components/order/OrderForm';
import { Order, NameConfig, OrderHistoryState } from '../types';
import { ConfirmDialog } from '../components/ui/ConfirmDialog';
import { OrderPDF } from '../components/pdf/OrderPDF';

const anonymizeName = (name: string) => {
  if (name.length <= 2) return name;
  return `${name[0]}${'.'.repeat(Math.min(3, name.length - 2))}${name[name.length - 1]}`;
};

// ... existing code ...

export default function Home() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [nameConfigs, setNameConfigs] = useState<NameConfig[]>([]);
  const [isLoaded, setIsLoaded] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isConfirmDialogOpen, setIsConfirmDialogOpen] = useState(false);
  const [editingOrder, setEditingOrder] = useState<{ index: number; order: Order } | null>(null);
  const [isConfiguring, setIsConfiguring] = useState(false);
  const [newName, setNewName] = useState('');
  const [newNameSoySauce, setNewNameSoySauce] = useState(true);
  const [orderHistory, setOrderHistory] = useState<OrderHistoryState>({
    orders: [],
    currentIndex: -1
  });

  // Load data from localStorage
  useEffect(() => {
    const loadData = async () => {
      setIsLoading(true);
      try {
        const savedOrders = localStorage.getItem('momoOrders');
        const savedNameConfigs = localStorage.getItem('momoNameConfigs');
        
        if (savedOrders) {
          setOrders(JSON.parse(savedOrders));
        }
        if (savedNameConfigs) {
          setNameConfigs(JSON.parse(savedNameConfigs));
        } else {
          setNameConfigs([]);
          localStorage.setItem('momoNameConfigs', JSON.stringify([]));
        }
      } catch (error) {
        console.error('Error loading data:', error);
      }
      setIsLoaded(true);
      setIsLoading(false);
    };
    loadData();
  }, []);

  // Initialize order history
  useEffect(() => {
    if (isLoaded) {
      const savedOrders = localStorage.getItem('momoOrders');
      const initialOrders = savedOrders ? JSON.parse(savedOrders) : [];
      setOrderHistory({
        orders: [initialOrders],
        currentIndex: 0
      });
    }
  }, [isLoaded]);

  const addToHistory = useCallback((newOrders: Order[]) => {
    setOrderHistory(prev => {
      const newHistory = {
        orders: [...prev.orders.slice(0, prev.currentIndex + 1), [...newOrders]],
        currentIndex: prev.currentIndex + 1
      };
      return newHistory;
    });
  }, []);

  const undo = useCallback(() => {
    setOrderHistory(prev => {
      if (prev.currentIndex <= 0) return prev;
      const newIndex = prev.currentIndex - 1;
      const previousOrders = [...prev.orders[newIndex]];
      setOrders(previousOrders);
      return {
        ...prev,
        currentIndex: newIndex
      };
    });
  }, []);

  const redo = useCallback(() => {
    setOrderHistory(prev => {
      if (prev.currentIndex >= prev.orders.length - 1) return prev;
      const newIndex = prev.currentIndex + 1;
      const nextOrders = [...prev.orders[newIndex]];
      setOrders(nextOrders);
      return {
        ...prev,
        currentIndex: newIndex
      };
    });
  }, []);

  // Save orders to localStorage whenever they change
  useEffect(() => {
    if (isLoaded) {
      localStorage.setItem('momoOrders', JSON.stringify(orders));
    }
  }, [orders, isLoaded]);

  // Save name configs to localStorage whenever they change
  useEffect(() => {
    if (isLoaded) {
      localStorage.setItem('momoNameConfigs', JSON.stringify(nameConfigs));
    }
  }, [nameConfigs, isLoaded]);

  const handleCancelEdit = useCallback(() => {
    setEditingOrder(null);
  }, []);

  // Handle keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) {
        return;
      }

      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'z') {
        e.preventDefault();
        if (e.shiftKey) {
          redo();
        } else {
          undo();
        }
      } else if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'y') {
        e.preventDefault();
        redo();
      } else if (e.key === 'Escape' && editingOrder) {
        e.preventDefault();
        handleCancelEdit();
      }
    };

    window.addEventListener('keydown', handleKeyDown, { capture: true });
    return () => window.removeEventListener('keydown', handleKeyDown, { capture: true });
  }, [editingOrder, undo, redo, handleCancelEdit]);

  const handleAddName = () => {
    if (newName.trim() && !nameConfigs.some(c => c.name === newName.trim())) {
      setNameConfigs(prev => [...prev, { name: newName.trim(), defaultSoySauce: newNameSoySauce }]);
      setNewName('');
      setNewNameSoySauce(true);
    }
  };

  const handleRemoveName = (nameToRemove: string) => {
    setNameConfigs(prev => prev.filter(c => c.name !== nameToRemove));
  };

  const handleUpdateNamePreference = (name: string, defaultSoySauce: boolean) => {
    setNameConfigs(prev => prev.map(c => 
      c.name === name ? { ...c, defaultSoySauce } : c
    ));
  };

  const handleSubmit = async (orderData: Omit<Order, 'id'>) => {
    setIsSubmitting(true);
    try {
      let newOrders: Order[];
      if (editingOrder !== null) {
        newOrders = orders.map(o => o.id === editingOrder.order.id ? { ...orderData, id: o.id } : o);
        setOrders(newOrders);
        setEditingOrder(null);
      } else {
        const newOrder = { ...orderData, id: crypto.randomUUID() };
        newOrders = [...orders, newOrder];
        setOrders(newOrders);
      }
      addToHistory(newOrders);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEdit = (order: Order, index: number) => {
    setEditingOrder({ index, order });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleDuplicate = (orderToDuplicate: Order) => {
    setEditingOrder(null);
    const duplicatedOrder = { ...orderToDuplicate, id: crypto.randomUUID() };
    handleSubmit(duplicatedOrder);
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

  const handleDeleteOrder = (indexToDelete: number, e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    const newOrders = orders.filter((_, index) => index !== indexToDelete);
    setOrders(newOrders);
    addToHistory(newOrders);
  };

  const handleClearOrders = () => {
    setOrders([]);
    addToHistory([]);
    setIsConfirmDialogOpen(false);
  };

  return (
    <main className="min-h-screen p-8 bg-gradient-to-br from-gray-50 to-gray-100">
      <div className="flex justify-center mb-8">
        <Logo className="w-16 h-16" />
      </div>
      <div className="max-w-4xl mx-auto">
        <ConfirmDialog
          isOpen={isConfirmDialogOpen}
          onClose={() => setIsConfirmDialogOpen(false)}
          onConfirm={handleClearOrders}
          title="Clear All Orders"
          message="Are you sure you want to clear all orders? This action cannot be undone."
          confirmText="Clear All"
          confirmStyle="danger"
        />

        <div className="min-h-screen bg-gradient-to-br from-gray-50 to-white pb-20">
          <main className="container mx-auto px-4 sm:px-6 py-8 sm:py-12 max-w-5xl">
            <div className="text-center mb-12">
              <h1 className="text-4xl font-light text-[#1d4f91] mb-3 tracking-tight">Monday Momo Order</h1>
              <p className="text-gray-500 text-lg">Order your favorite momos for Monday delivery</p>
              
              {/* Configuration Button */}
              <button
                onClick={() => setIsConfiguring(!isConfiguring)}
                className="mt-4 px-4 py-2 text-sm text-gray-600 hover:text-[#1d4f91] bg-white border border-gray-200 rounded-lg hover:border-[#1d4f91]/30 transition-colors"
              >
                {isConfiguring ? 'Hide Configuration' : 'Configure Names'}
              </button>
            </div>

            {/* Name Configuration Section */}
            {isConfiguring && (
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
                            onChange={(e) => handleUpdateNamePreference(config.name, e.target.checked)}
                            className="w-4 h-4 text-[#1d4f91] rounded-lg border-gray-300 focus:ring-[#1d4f91]"
                          />
                          <label htmlFor={`soySauce_${config.name}`} className="text-sm text-gray-600">
                            Default Soy Sauce
                          </label>
                        </div>
                        <button
                          onClick={() => handleRemoveName(config.name)}
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
            )}

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

            {/* Order Form and Summary */}
            <div className="grid lg:grid-cols-2 gap-6 lg:gap-10">
              <OrderForm
                nameConfigs={nameConfigs}
                onSubmit={handleSubmit}
                editingOrder={editingOrder}
                onCancelEdit={handleCancelEdit}
                isSubmitting={isSubmitting}
              />

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
                        <h3 className="font-medium text-gray-800 mb-3">{name}&apos;s Orders</h3>
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
                  <div className="flex gap-2 mr-2">
                    <button
                      onClick={undo}
                      disabled={orderHistory.currentIndex <= 0}
                      className="p-2 text-gray-400 hover:text-[#1d4f91] disabled:opacity-30 disabled:hover:text-gray-400 rounded-lg transition-colors"
                      title="Undo (⌘Z)"
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 10h10a8 8 0 018 8v2M3 10l6 6m-6-6l6-6" />
                      </svg>
                    </button>
                    <button
                      onClick={redo}
                      disabled={orderHistory.currentIndex >= orderHistory.orders.length - 1}
                      className="p-2 text-gray-400 hover:text-[#1d4f91] disabled:opacity-30 disabled:hover:text-gray-400 rounded-lg transition-colors"
                      title="Redo (⌘⇧Z)"
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 10h-10a8 8 0 00-8 8v2M21 10l-6 6m6-6l-6-6" />
                      </svg>
                    </button>
                  </div>
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

        {/* Add keyboard shortcuts info */}
        <div className="fixed bottom-4 right-4 text-sm text-gray-500">
          <div className="bg-white/90 backdrop-blur-sm rounded-xl p-4 shadow-sm border border-gray-100">
            <p className="font-medium mb-2">Keyboard Shortcuts:</p>
            <ul className="space-y-1">
              <li>
                <kbd className="px-2 py-1 text-xs bg-gray-100 rounded">Enter</kbd>
                <span className="ml-2">Submit order</span>
              </li>
              <li>
                <kbd className="px-2 py-1 text-xs bg-gray-100 rounded">Esc</kbd>
                <span className="ml-2">Cancel edit</span>
              </li>
              <li>
                <kbd className="px-2 py-1 text-xs bg-gray-100 rounded">⌘</kbd>
                +
                <kbd className="px-2 py-1 text-xs bg-gray-100 rounded">Z</kbd>
                <span className="ml-2">Undo</span>
              </li>
              <li>
                <kbd className="px-2 py-1 text-xs bg-gray-100 rounded">⌘</kbd>
                +
                <kbd className="px-2 py-1 text-xs bg-gray-100 rounded">⇧</kbd>
                +
                <kbd className="px-2 py-1 text-xs bg-gray-100 rounded">Z</kbd>
                <span className="ml-2">Redo</span>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </main>
  );
}
