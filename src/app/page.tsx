'use client';

import { useState, useEffect, Fragment, useCallback } from 'react';
import { Document, Page, Text, View, StyleSheet, pdf, Svg, Path, Image } from '@react-pdf/renderer';
import QRCode from 'qrcode';

interface NameConfig {
  name: string;
  defaultSoySauce: boolean;
}

interface Order {
  name: string;
  meatMomos: number;
  veggieMomos: number;
  wantsSoySauce: boolean;
}

interface OrderHistoryState {
  orders: Order[][];
  currentIndex: number;
}

const anonymizeName = (name: string) => {
  if (name.length <= 2) return name;
  return `${name[0]}${'.'.repeat(Math.min(3, name.length - 2))}${name[name.length - 1]}`;
};

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
  graphSection: {
    marginBottom: 30,
    padding: 16,
    backgroundColor: '#f7fafc',
    borderRadius: 8,
  },
  graph: {
    marginTop: 16,
    gap: 12,
  },
  graphBar: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  graphLabel: {
    width: 60,
    fontSize: 12,
    color: '#4a5568',
  },
  barContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  bar: {
    height: 20,
    borderRadius: 4,
  },
  barValue: {
    fontSize: 12,
    color: '#4a5568',
  },
  qrCodeSection: {
    marginTop: 30,
    alignItems: 'center',
    marginBottom: 20,
  },
  qrCodeTitle: {
    fontSize: 12,
    color: '#4a5568',
    marginBottom: 8,
  },
  qrCodeSubtitle: {
    fontSize: 10,
    color: '#718096',
    marginTop: 4,
  },
  qrCode: {
    width: 100,
    height: 100,
  },
});

const ConfirmDialog = ({ 
  isOpen, 
  onClose, 
  onConfirm,
  title,
  message,
  confirmText = 'Confirm',
  confirmStyle = 'danger'
}: { 
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  message: string;
  confirmText?: string;
  confirmStyle?: 'danger' | 'primary';
}) => {
  if (!isOpen) return null;

  const buttonStyles = {
    danger: 'bg-red-600 hover:bg-red-700 focus:ring-red-500',
    primary: 'bg-[#1d4f91] hover:bg-[#15396d] focus:ring-[#1d4f91]'
  };

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
                {title}
              </h3>
              <div className="mt-2">
                <p className="text-sm text-gray-500">
                  {message}
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
              className={`w-full sm:w-auto px-4 py-2 text-sm font-medium text-white ${buttonStyles[confirmStyle]} rounded-lg focus:outline-none focus:ring-2 focus:ring-offset-2`}
            >
              {confirmText}
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
  const [qrCodeUrl, setQrCodeUrl] = useState<string>('');

  useEffect(() => {
    const generateQRCode = async () => {
      try {
        const orderData = {
          orders,
          timestamp: new Date().toISOString(),
          totalAmount: orders.reduce((acc, order) => acc + (order.meatMomos + order.veggieMomos) * 2, 0),
        };
        const qrCode = await QRCode.toDataURL(JSON.stringify(orderData), {
          errorCorrectionLevel: 'M',
          margin: 2,
          width: 200,
        });
        setQrCodeUrl(qrCode);
      } catch (err) {
        console.error('Error generating QR code:', err);
      }
    };
    generateQRCode();
  }, [orders]);

  const totalAmount = orders.reduce((acc, order) => 
    acc + (order.meatMomos + order.veggieMomos) * 2, 0
  );
  const totalMomos = orders.reduce((acc, order) => 
    acc + order.meatMomos + order.veggieMomos, 0
  );
  const totalMeatMomos = orders.reduce((acc, order) => acc + order.meatMomos, 0);
  const totalVeggieMomos = orders.reduce((acc, order) => acc + order.veggieMomos, 0);

  // Calculate max value for graph scaling
  const maxMomos = Math.max(totalMeatMomos, totalVeggieMomos);
  const graphScale = maxMomos > 0 ? 200 / maxMomos : 1;

  // Group orders by name and anonymize the names
  const groupedOrders = orders.reduce((groups, order) => {
    const anonymizedName = anonymizeName(order.name);
    if (!groups[anonymizedName]) {
      groups[anonymizedName] = [];
    }
    groups[anonymizedName].push(order);
    return groups;
  }, {} as Record<string, Order[]>);

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

        {/* Order Summary Graph */}
        <View style={styles.graphSection}>
          <Text style={styles.sectionTitle}>Order Summary</Text>
          <View style={styles.graph}>
            {/* Meat Momos Bar */}
            <View style={styles.graphBar}>
              <Text style={styles.graphLabel}>Meat</Text>
              <View style={styles.barContainer}>
                <View style={[styles.bar, { width: totalMeatMomos * graphScale, backgroundColor: '#1d4f91' }]} />
                <Text style={styles.barValue}>{totalMeatMomos}</Text>
              </View>
            </View>
            {/* Veggie Momos Bar */}
            <View style={styles.graphBar}>
              <Text style={styles.graphLabel}>Veggie</Text>
              <View style={styles.barContainer}>
                <View style={[styles.bar, { width: totalVeggieMomos * graphScale, backgroundColor: '#34d399' }]} />
                <Text style={styles.barValue}>{totalVeggieMomos}</Text>
              </View>
            </View>
          </View>
        </View>

        <View style={styles.orderSection}>
          <Text style={styles.sectionTitle}>Order Details</Text>
          {Object.entries(groupedOrders).map(([anonymizedName, userOrders]) => (
            <View key={anonymizedName} style={styles.order}>
              <View style={styles.orderHeader}>
                <Text style={styles.orderName}>{anonymizedName}</Text>
                <Text style={styles.orderTotal}>
                  CHF {userOrders.reduce((sum, order) => sum + (order.meatMomos + order.veggieMomos) * 2, 0)}
                </Text>
              </View>
              <View style={styles.orderDetails}>
                {userOrders.map((order, index) => (
                  <View key={index}>
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
                ))}
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

        {qrCodeUrl && (
          <View style={styles.qrCodeSection}>
            <Text style={styles.qrCodeTitle}>Digital Verification</Text>
            <Image src={qrCodeUrl} style={styles.qrCode} />
            <Text style={styles.qrCodeSubtitle}>Scan to verify order details</Text>
          </View>
        )}

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
  const [nameConfigs, setNameConfigs] = useState<NameConfig[]>([]);
  const [name, setName] = useState('');
  const [meatMomos, setMeatMomos] = useState(0);
  const [veggieMomos, setVeggieMomos] = useState(0);
  const [wantsSoySauce, setWantsSoySauce] = useState(true);
  const [isLoaded, setIsLoaded] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isConfirmDialogOpen, setIsConfirmDialogOpen] = useState(false);
  const [editingOrder, setEditingOrder] = useState<{ index: number; order: Order } | null>(null);
  const [isConfiguring, setIsConfiguring] = useState(false);
  const [newName, setNewName] = useState('');
  const [newNameSoySauce, setNewNameSoySauce] = useState(true);
  const [errors, setErrors] = useState({
    name: '',
    meatMomos: '',
    veggieMomos: '',
    total: ''
  });
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
          // Initialize with empty array
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

  // Initialize order history
  useEffect(() => {
    if (isLoaded) {
      setOrderHistory({
        orders: [orders],
        currentIndex: 0
      });
    }
  }, [isLoaded]);

  const addToHistory = useCallback((newOrders: Order[]) => {
    setOrderHistory(prev => {
      const newHistory = {
        orders: [...prev.orders.slice(0, prev.currentIndex + 1), newOrders],
        currentIndex: prev.currentIndex + 1
      };
      return newHistory;
    });
  }, []);

  const undo = useCallback(() => {
    setOrderHistory(prev => {
      if (prev.currentIndex <= 0) return prev;
      const newIndex = prev.currentIndex - 1;
      setOrders([...prev.orders[newIndex]]);
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
      setOrders([...prev.orders[newIndex]]);
      return {
        ...prev,
        currentIndex: newIndex
      };
    });
  }, []);

  const handleCancelEdit = () => {
    setEditingOrder(null);
    setName('');
    setMeatMomos(0);
    setVeggieMomos(0);
    setWantsSoySauce(true);
    setErrors({ name: '', meatMomos: '', veggieMomos: '', total: '' });
  };

  // Handle keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Don't handle shortcuts when typing in input fields
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) {
        return;
      }

      // Handle shortcuts only when not typing in input fields
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

  const handleNameSelect = (selectedName: string) => {
    setName(selectedName);
    const config = nameConfigs.find(c => c.name === selectedName);
    if (config) {
      setWantsSoySauce(config.defaultSoySauce);
    }
    setErrors(prev => ({ ...prev, name: '' }));
  };

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
    if (!isSubmitting && validateForm()) {
      setIsSubmitting(true);
      try {
        let newOrders: Order[];
        if (editingOrder !== null) {
          newOrders = [...orders];
          newOrders[editingOrder.index] = { name, meatMomos, veggieMomos, wantsSoySauce };
          setOrders(newOrders);
          setEditingOrder(null);
        } else {
          newOrders = [...orders, { name, meatMomos, veggieMomos, wantsSoySauce }];
          setOrders(newOrders);
        }
        addToHistory(newOrders);
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
    <>
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

          {/* Order Form */}
          <div className="grid lg:grid-cols-2 gap-6 lg:gap-10">
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
    </>
  );
}
