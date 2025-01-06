import { Order } from '../../types';

interface OrderSummaryProps {
  orders: Order[];
  isLoading: boolean;
  onEdit: (order: Order, index: number) => void;
  onDuplicate: (order: Order) => void;
  onDelete: (index: number, e: React.MouseEvent) => void;
}

export function OrderSummary({
  orders,
  isLoading,
  onEdit,
  onDuplicate,
  onDelete,
}: OrderSummaryProps) {
  // Group orders by name
  const groupedOrders = orders.reduce<Record<string, Order[]>>((groups, order) => {
    const name = order.name;
    if (!groups[name]) {
      groups[name] = [];
    }
    groups[name].push(order);
    return groups;
  }, {});

  return (
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
                        onClick={() => onEdit(order, index)}
                        className="p-2 text-gray-400 hover:text-[#1d4f91] hover:bg-blue-50 rounded-lg transition-colors"
                        title="Edit order"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                        </svg>
                      </button>
                      <button
                        onClick={() => onDuplicate(order)}
                        className="p-2 text-gray-400 hover:text-[#1d4f91] hover:bg-blue-50 rounded-lg transition-colors"
                        title="Duplicate order"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                        </svg>
                      </button>
                      <button
                        onClick={(e) => onDelete(index, e)}
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
  );
} 