import { useState, useEffect } from 'react';
import { Document, Page, Text, View, StyleSheet, Image } from '@react-pdf/renderer';
import QRCode from 'qrcode';
import { Order } from '../../types';

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

const anonymizeName = (name: string) => {
  if (name.length <= 2) return name;
  return `${name[0]}${'.'.repeat(Math.min(3, name.length - 2))}${name[name.length - 1]}`;
};

export function OrderPDF({ orders }: { orders: Order[] }) {
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
} 