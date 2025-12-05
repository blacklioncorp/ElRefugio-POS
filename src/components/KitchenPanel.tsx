import React from 'react';
import { Order, OrderStatus, Table } from '../types';
import { ChefHat, CheckCircle, Clock, Bike } from 'lucide-react';

interface KitchenPanelProps {
  orders: Order[];
  tables: Table[];
  onUpdateStatus: (orderId: string, status: OrderStatus) => void;
}

const KitchenPanel: React.FC<KitchenPanelProps> = ({ orders, tables, onUpdateStatus }) => {
  const activeOrders = orders.filter(o => 
    o.status !== OrderStatus.PAID && 
    o.status !== OrderStatus.DELIVERED && 
    o.status !== OrderStatus.CANCELLED &&
    o.status !== OrderStatus.OUT_FOR_DELIVERY
  );

  const getNextStatus = (current: OrderStatus) => {
    if (current === OrderStatus.PENDING) return OrderStatus.COOKING;
    if (current === OrderStatus.COOKING) return OrderStatus.READY;
    return null; 
  };

  return (
    <div className="p-6 bg-slate-800 min-h-full">
      <h2 className="text-3xl font-bold text-white mb-6 flex gap-2"><ChefHat/> Comandas Activas: {activeOrders.length}</h2>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {activeOrders.map(order => (
          <div key={order.id} className={`rounded-lg shadow-lg bg-white overflow-hidden flex flex-col ${order.status === 'PENDING' ? 'border-l-8 border-red-500' : 'border-l-8 border-yellow-500'}`}>
            <div className="p-4 border-b flex justify-between bg-slate-50">
               <div>
                  <h3 className="text-xl font-bold">{order.type === 'DELIVERY' ? <span className="flex gap-1 text-blue-600"><Bike/> Domicilio</span> : `Mesa ${tables.find(t=>t.id===order.tableId)?.number}`}</h3>
                  <p className="text-xs text-slate-500">#{order.id.slice(-4)}</p>
               </div>
               <div className="text-right">
                 <span className="font-bold uppercase text-sm block">{order.status}</span>
                 <span className="text-xs text-slate-400 flex items-center justify-end gap-1"><Clock size={12}/> {new Date(order.timestamp).toLocaleTimeString()}</span>
               </div>
            </div>
            <div className="p-4 flex-1">
              {order.items.map((item, i) => (
                <div key={i} className="flex justify-between py-1 border-b last:border-0">
                  <span className="font-bold text-lg">{item.quantity}x</span>
                  <div className="flex-1 px-2">
                    <span className="font-medium text-lg block leading-tight">{item.menuItem.name}</span>
                    {item.notes && <span className="text-red-600 font-bold text-sm bg-red-50 px-1 rounded">⚠️ {item.notes}</span>}
                  </div>
                </div>
              ))}
            </div>
            {getNextStatus(order.status) && (
              <button onClick={() => onUpdateStatus(order.id, getNextStatus(order.status)!)} className="w-full py-4 bg-slate-900 text-white font-bold hover:bg-slate-700 flex justify-center gap-2">
                Avanzar <CheckCircle/>
              </button>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};
export default KitchenPanel;