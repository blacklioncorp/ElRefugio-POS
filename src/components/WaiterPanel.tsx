import React, { useState, useMemo } from 'react';
import type { MenuItem, MenuCategory, OrderItem, Table, Order } from '../types'; // Eliminamos OrderItem as OrderItemType
import { OrderStatus } from '../types';
import { ShoppingCart, ArrowLeft, Bell, Trash2, Clock, Utensils, LayoutGrid } from 'lucide-react';

// ==========================================================
// INTERFACES (Props)
// ==========================================================

interface WaiterPanelProps {
  tables: Table[];
  categories: MenuCategory[];
  menuItems: MenuItem[];
  orders: Order[];
  onPlaceOrder: (tableId: string, items: OrderItem[]) => void;
  // Propiedades Obligatorias para la lógica de Botones
  onUpdateOrderStatus: (orderId: string, status: OrderStatus) => void;
  onPayOrder: (orderId: string, tableId: string) => void; 
}

// ==========================================================
// COMPONENTE PRINCIPAL
// ==========================================================

const WaiterPanel: React.FC<WaiterPanelProps> = ({ tables, menuItems, orders, onPlaceOrder, onUpdateOrderStatus, onPayOrder }) => {
  const [selectedTableId, setSelectedTableId] = useState<string | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [cart, setCart] = useState<OrderItem[]>([]);

  // Categorías dinámicas
  const dynamicCategories = useMemo(() => {
    const cats = new Set(menuItems.map((i: any) => i.category || i.category_id || 'General'));
    return Array.from(cats);
  }, [menuItems]);

  // Órdenes activas para la mesa seleccionada
  const activeTableOrders = useMemo(() => {
    if (!selectedTableId) return [];
    return orders.filter(o => 
      o.tableId === selectedTableId && 
      o.status !== OrderStatus.PAID && 
      o.status !== OrderStatus.CANCELLED
    );
  }, [orders, selectedTableId]);
  
  // ==========================================================
  // LÓGICA DE GESTIÓN DEL CARRITO (CON NOTAS Y EXTRAS)
  // ==========================================================

  const addToCart = (item: MenuItem) => {
    setCart(prev => {
      const exist = prev.find(i => i.menuItem.id === item.id);
      return exist ? prev.map(i => i.menuItem.id === item.id ? { ...i, quantity: i.quantity + 1 } : i) 
                   : [...prev, { menuItem: item, quantity: 1, note: '', extraCharge: 0 }];
    });
  };

  const handleUpdateItem = (itemId: string, updates: { note?: string, extraCharge?: number }) => {
    setCart(prevItems => prevItems.map(item => {
        if (item.menuItem.id === itemId) {
            const newExtraCharge = updates.extraCharge !== undefined ? updates.extraCharge : item.extraCharge;
            return {
                ...item,
                note: updates.note !== undefined ? updates.note : item.note,
                extraCharge: newExtraCharge !== null && newExtraCharge !== undefined ? newExtraCharge : 0,
            };
        }
        return item;
    }));
  };

  const handleSend = () => {
    if (selectedTableId && cart.length > 0) {
      onPlaceOrder(selectedTableId, cart);
      setSelectedCategory('all'); 
      setCart([]); 
    }
  };

  const handleCancelOrder = (orderId: string) => {
    if (window.confirm("¿Seguro que deseas CANCELAR esta orden de cocina?")) {
        onUpdateOrderStatus(orderId, OrderStatus.CANCELLED);
    }
  };

  // Cálculo de totales con extras
  const totalWithExtras = cart.reduce((sum, item) => {
    const basePrice = item.menuItem.price || 0;
    const extra = item.extraCharge || 0;
    return sum + ((basePrice + extra) * item.quantity);
  }, 0);


  if (!selectedTableId) {
    return (
      <div className="p-6">
        <h2 className="text-2xl font-bold text-slate-800 mb-6 flex items-center gap-2"><LayoutGrid/> Seleccionar Mesa</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
          {tables.map(t => {
            const active = orders.find(o => o.tableId === t.id && o.status !== OrderStatus.PAID && o.status !== OrderStatus.CANCELLED);
            const ready = active?.status === OrderStatus.READY;
            return (
              <button key={t.id} onClick={() => setSelectedTableId(t.id)} 
                className={`p-6 rounded-xl border-2 flex flex-col items-center transition-all shadow-md 
                ${ready ? 'bg-green-500 text-white animate-pulse shadow-lg scale-105 border-green-700' : active ? 'bg-orange-100 border-orange-300 text-slate-800' : 'bg-white hover:border-primary hover:shadow-lg'}`}>
                <span className="text-4xl font-extrabold">{t.number}</span>
                <span className="text-xs uppercase font-bold mt-2">{ready ? '¡LISTO!' : active ? 'Ocupada' : 'Libre'}</span>
                {ready && <Bell className="mt-2 animate-bounce"/>}
              </button>
            )
          })}
        </div>
      </div>
    );
  }

  // Vista de Orden
  return (
    <div className="flex flex-col md:flex-row h-[calc(100vh-64px)]">
      {/* IZQUIERDA: MENÚ */}
      <div className="flex-1 flex flex-col bg-slate-50 overflow-hidden">
        <div className="p-2 bg-white border-b flex gap-2 overflow-x-auto whitespace-nowrap scrollbar-hide">
          <button onClick={() => setSelectedTableId(null)} className="p-3 bg-slate-200 rounded hover:bg-slate-300 transition shrink-0"><ArrowLeft size={20}/></button>
          <button onClick={() => setSelectedCategory('all')} className={`px-4 py-2 rounded-lg font-bold shrink-0 ${selectedCategory === 'all' ? 'bg-slate-800 text-white' : 'bg-white border text-slate-600'}`}>Todos</button>
          {dynamicCategories.map(cat => (
            <button key={cat} onClick={() => setSelectedCategory(cat)} className={`px-4 py-2 rounded-lg font-bold shrink-0 ${selectedCategory === cat ? 'bg-orange-500 text-white' : 'bg-white border text-slate-600'}`}>{cat}</button>
          ))}
        </div>
        <div className="p-4 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 overflow-y-auto pb-20">
          {menuItems.filter((i: any) => selectedCategory === 'all' || (i.category || i.category_id) === selectedCategory).map(item => (
            <button key={item.id} onClick={() => addToCart(item)} className="bg-white p-4 rounded-xl shadow-sm border border-slate-200 hover:border-orange-500 text-left transition transform hover:scale-[1.01]">
              <div className="flex justify-between items-start w-full">
                <h3 className="font-bold text-slate-800">{item.name}</h3>
                <span className="text-orange-600 font-bold bg-orange-50 px-2 py-1 rounded text-sm">${item.price.toFixed(2)}</span>
              </div>
              <p className="text-xs text-slate-500 mt-2 line-clamp-2">{item.description}</p>
            </button>
          ))}
        </div>
      </div>

      {/* DERECHA: CARRITO + PEDIDOS EN COCINA */}
      <div className="w-full md:w-96 bg-white border-l shadow-2xl flex flex-col h-1/3 md:h-auto z-20">
        <div className="p-3 bg-slate-100 border-b font-bold text-lg flex justify-between items-center">
            <span className="flex items-center gap-2"><Utensils size={18}/> Mesa {tables.find(t=>t.id === selectedTableId)?.number}</span>
            <span className="text-xs text-slate-500">Nuevo Pedido</span>
        </div>
        
        {/* ZONA 1: EL CARRITO (Lo que vamos a pedir) */}
        <div className="flex-1 p-4 overflow-y-auto space-y-4 bg-white min-h-[150px]">
           {cart.length === 0 && <div className="text-center text-slate-400 text-sm mt-4">Carrito vacío</div>}
           {cart.map((item, i) => (
             <div key={i} className="bg-orange-50 p-3 rounded border border-orange-100 shadow-sm">
                {/* LÍNEA PRINCIPAL DEL ÍTEM */}
                <div className="flex justify-between items-center mb-2">
                    <p className="font-bold text-sm text-slate-700">
                        {item.quantity}x {item.menuItem.name} 
                        {item.extraCharge && item.extraCharge > 0 && <span className="ml-2 text-red-500 text-xs"> (+${item.extraCharge.toFixed(2)})</span>}
                    </p>
                    <div className="flex items-center gap-1">
                        <span className="text-sm font-bold">${((item.menuItem.price + (item.extraCharge || 0)) * item.quantity).toFixed(2)}</span>
                        <button onClick={() => setCart(prev => prev.filter(x => x.menuItem.id !== item.menuItem.id))} className="text-red-400 p-1 rounded-full hover:bg-red-100 transition"><Trash2 size={16}/></button>
                    </div>
                </div>
                
                {/* CAMPO DE NOTAS */}
                <textarea
                    placeholder="Nota: sin cebolla, mayonesa extra, etc."
                    value={item.note || ''}
                    onChange={(e) => handleUpdateItem(item.menuItem.id, { note: e.target.value })}
                    className="w-full p-2 border rounded-lg text-xs mt-1 focus:ring-1 ring-orange-400 outline-none"
                    rows={2}
                />
                
                {/* CAMPO DE CARGO EXTRA */}
                <div className="flex items-center mt-2 gap-2">
                    <span className="text-xs font-semibold text-slate-600">Cargo Extra ($):</span>
                    <input
                        type="number"
                        placeholder="0.00"
                        value={item.extraCharge || ''} 
                        onChange={(e) => handleUpdateItem(item.menuItem.id, { extraCharge: parseFloat(e.target.value) || 0 })}
                        className="w-20 p-1 border rounded-lg text-xs text-right focus:ring-1 ring-red-400 outline-none"
                    />
                </div>
             </div>
           ))}
        </div>
        
        {/* BOTÓN ENVIAR */}
        <div className="p-3 border-t bg-slate-50">
          <button 
            onClick={handleSend} 
            disabled={cart.length === 0} 
            className="w-full bg-orange-600 text-white py-3 rounded-lg font-bold disabled:bg-slate-300 shadow hover:bg-orange-700 flex justify-center gap-2 items-center"
          >
            <ShoppingCart size={18}/> ENVIAR A COCINA (${totalWithExtras.toFixed(2)})
          </button>
        </div>

        {/* ZONA 2: PEDIDOS YA ENVIADOS (Para Cancelar / Pagar) */}
        <div className="border-t-4 border-slate-200 flex-1 bg-slate-50 flex flex-col overflow-hidden">
            <div className="p-2 bg-slate-200 text-xs font-bold text-slate-600 uppercase tracking-wider flex items-center gap-2">
                <Clock size={12}/> En Cocina (Mesa {tables.find(t=>t.id === selectedTableId)?.number})
            </div>
            <div className="overflow-y-auto p-2 space-y-2">
                {activeTableOrders.length === 0 && <div className="text-center text-slate-400 text-xs mt-4">Nada cocinándose.</div>}
                {activeTableOrders.map(order => (
                    <div key={order.id} className="bg-white p-3 rounded border border-slate-200 shadow-sm">
                        <div className="flex justify-between items-start mb-2">
                            <span className="text-xs font-bold text-slate-400">Orden #{order.id}</span>
                            <span className={`text-xs px-2 py-0.5 rounded-full font-bold ${order.status === 'READY' ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'}`}>
                                {order.status === 'READY' ? 'LISTO' : 'COCINANDO'}
                            </span>
                        </div>
                        <ul className="text-sm space-y-1 mb-2">
                            {order.items.map((item, idx) => (
                                // Usamos la corrección defensiva en caso de que el API no devuelva menuItem completo
                                <li key={idx} className="text-slate-700 flex justify-between">
                                    <span>{item.quantity}x {(item as any).menuItem?.name || (item as any).menu_item?.name || 'Producto Desconocido'}</span>
                                </li>
                            ))}
                        </ul>
                        
                        {/* BOTÓN DE CANCELAR (Solo si no está servido/pagado) */}
                        {onUpdateOrderStatus && order.status !== OrderStatus.READY && (
                            <button 
                                onClick={() => handleCancelOrder(order.id)}
                                className="w-full py-1 bg-red-50 text-red-600 border border-red-200 rounded hover:bg-red-100 text-xs font-bold flex items-center justify-center gap-1 mt-2"
                            >
                                <Trash2 size={12}/> CANCELAR ORDEN
                            </button>
                        )}
                        {/* BOTÓN DE PAGO (Si está lista y aún no se paga) */}
                        {order.status === OrderStatus.READY && (
                            <button 
                                onClick={() => onPayOrder(order.id, selectedTableId!)} 
                                className="w-full py-2 bg-green-600 text-white rounded font-bold hover:bg-green-700 mt-2 transition"
                            >
                                PAGAR CUENTA (${(order.total || 0).toFixed(2)})
                            </button>
                        )}
                    </div>
                ))}
            </div>
        </div>
      </div>
    </div>
  );
};
export default WaiterPanel;