import React from 'react';
import type { Order, Table } from '../types';
import { OrderStatus } from '../types';
import { CheckCircle, Clock } from 'lucide-react';

interface KitchenPanelProps {
  orders: Order[];
  tables: Table[];
  onUpdateStatus: (orderId: string, status: OrderStatus) => void;
}

const KitchenPanel: React.FC<KitchenPanelProps> = ({ orders, tables, onUpdateStatus }) => {
  // Filtramos solo las órdenes que están PENDIENTES (Cocinándose)
  const pendingOrders = orders.filter(o => o.status === OrderStatus.PENDING);

  // Filtramos las que ya están LISTAS (Esperando ser recogidas)
  const readyOrders = orders.filter(o => o.status === OrderStatus.READY);

  return (
    <div className="p-6 bg-slate-100 min-h-screen">
      <h2 className="text-3xl font-bold text-slate-800 mb-6 flex items-center gap-3">
        <UtensilsIcon /> Monitor de Cocina
      </h2>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {/* MENSAJE DE VACÍO */}
        {pendingOrders.length === 0 && readyOrders.length === 0 && (
           <div className="col-span-full text-center text-slate-400 py-20">
             <p className="text-xl">Todo tranquilo en la cocina... 😴</p>
           </div>
        )}

        {/* TARJETAS DE ÓRDENES PENDIENTES */}
        {pendingOrders.map(order => {
          const tableNumber = tables.find(t => t.id === order.tableId)?.number || '?';
          
          return (
            <div key={order.id} className="bg-white rounded-xl shadow-lg border-l-8 border-yellow-400 overflow-hidden flex flex-col animate-in fade-in zoom-in">
              <div className="bg-yellow-50 p-3 border-b border-yellow-100 flex justify-between items-center">
                <span className="font-bold text-xl text-slate-800">MESA {tableNumber}</span>
                <span className="text-xs font-bold bg-yellow-200 text-yellow-800 px-2 py-1 rounded flex gap-1 items-center">
                  <Clock size={14}/> COCINANDO
                </span>
              </div>
              
              <div className="p-4 flex-1">
                <ul className="space-y-3">
                  {order.items.map((item: any, i: number) => {
                    // 1. Detección inteligente del nombre (Backend vs Frontend)
                    const productName = item.menuItem?.name || item.menu_item?.name || 'Producto Desconocido';
                    
                    return (
                        <li key={i} className="border-b border-dashed pb-2 last:border-0">
                            {/* Nombre y Cantidad */}
                            <div className="flex justify-between items-start">
                                <span className="font-bold text-lg text-slate-700">
                                    {item.quantity}x {productName}
                                </span>
                            </div>

                            {/* 2. Notas del Mesero (DENTRO DEL LI) */}
                            {item.note && (
                                <p className="text-sm italic text-slate-500 mt-1 pl-2 border-l-2 border-orange-300 bg-orange-50 p-1 rounded">
                                    📝 "{item.note}"
                                </p>
                            )}

                            {/* 3. Cargos Extras (DENTRO DEL LI) */}
                            {item.extraCharge && item.extraCharge > 0 && (
                                <p className="text-xs font-bold text-red-600 mt-1 text-right">
                                    +${Number(item.extraCharge).toFixed(2)} Extra
                                </p>
                            )}
                        </li>
                    );
                  })}
                </ul>
              </div>

              <div className="p-3 bg-slate-50 border-t flex gap-2">
                 {/* BOTÓN: ORDEN LISTA */}
                 <button 
                    onClick={() => onUpdateStatus(order.id, OrderStatus.READY)}
                    className="flex-1 bg-green-600 hover:bg-green-700 text-white py-3 rounded-lg font-bold flex items-center justify-center gap-2 shadow transition-transform active:scale-95"
                 >
                    <CheckCircle /> ¡ORDEN LISTA!
                 </button>
              </div>
            </div>
          );
        })}

        {/* TARJETAS DE ÓRDENES LISTAS (VISUALIZACIÓN) */}
        {readyOrders.map(order => {
            const tableNumber = tables.find(t => t.id === order.tableId)?.number || '?';
            return (
                <div key={order.id} className="bg-green-50 rounded-xl border border-green-200 opacity-70 scale-95">
                    <div className="p-3 border-b border-green-100 flex justify-between items-center">
                        <span className="font-bold text-slate-600">Mesa {tableNumber}</span>
                        <span className="text-xs font-bold bg-green-200 text-green-800 px-2 py-1 rounded">¡ESPERANDO MESERO!</span>
                    </div>
                    <div className="p-4 flex justify-center">
                        <CheckCircle size={48} className="text-green-500"/>
                    </div>
                </div>
            )
        })}
      </div>
    </div>
  );
};

// Icono simple para el título
const UtensilsIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 2v7c0 1.1.9 2 2 2h4a2 2 0 0 0 2-2V2"/><path d="M7 2v20"/><path d="M21 15V2v0a5 5 0 0 0-5 5v6c0 1.1.9 2 2 2h3Zm0 0v7"/></svg>
);

export default KitchenPanel;