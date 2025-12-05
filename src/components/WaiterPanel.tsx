// 1. ¡ESTA ERA LA LÍNEA QUE FALTABA!
import React, { useState } from 'react';

// 2. Interfaces (Imaginarias): Llevan "import type"
import type { MenuItem, MenuCategory, OrderItem, Table, Order } from '../types';

// 3. Enums (Reales): Llevan "import" normal
import { OrderStatus } from '../types';

import { ShoppingCart, Plus, Minus, X, ArrowLeft, Bell } from 'lucide-react';

interface WaiterPanelProps {
  tables: Table[];
  categories: MenuCategory[];
  menuItems: MenuItem[];
  orders: Order[];
  onPlaceOrder: (tableId: string, items: OrderItem[]) => void;
}

const WaiterPanel: React.FC<WaiterPanelProps> = ({ tables, categories, menuItems, orders, onPlaceOrder }) => {
  const [selectedTableId, setSelectedTableId] = useState<string | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<string>(categories[0]?.id || '');
  const [cart, setCart] = useState<OrderItem[]>([]);

  const addToCart = (item: MenuItem) => {
    setCart(prev => {
      const exist = prev.find(i => i.menuItem.id === item.id);
      return exist ? prev.map(i => i.menuItem.id === item.id ? { ...i, quantity: i.quantity + 1 } : i) 
                   : [...prev, { menuItem: item, quantity: 1 }];
    });
  };

  const handleSend = () => {
    if (selectedTableId && cart.length > 0) {
      onPlaceOrder(selectedTableId, cart);
      setCart([]);
      setSelectedTableId(null);
    }
  };

  if (!selectedTableId) {
    return (
      <div className="p-6">
        <h2 className="text-2xl font-bold text-slate-800 mb-6">Seleccionar Mesa</h2>
        <div className="grid grid-cols-4 gap-4">
          {tables.map(t => {
            // CORRECCIÓN EXTRA: Usamos OrderStatus en lugar de texto plano para evitar errores
            const active = orders.find(o => o.tableId === t.id && o.status !== OrderStatus.PAID && o.status !== OrderStatus.CANCELLED);
            const ready = active?.status === OrderStatus.READY;
            
            return (
              <button key={t.id} onClick={() => setSelectedTableId(t.id)} 
                className={`p-8 rounded-xl border-2 flex flex-col items-center transition-all ${ready ? 'bg-green-500 text-white animate-pulse shadow-lg scale-105' : active ? 'bg-orange-100 border-orange-300' : 'bg-white hover:border-primary hover:shadow-md'}`}>
                <span className="text-3xl font-bold">{t.number}</span>
                <span className="text-xs uppercase font-bold">{ready ? '¡LISTO!' : active ? 'Ocupada' : 'Libre'}</span>
                {ready && <Bell className="mt-2 animate-bounce"/>}
              </button>
            )
          })}
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-full">
      <div className="flex-1 flex flex-col bg-slate-50">
        <div className="p-2 bg-white border-b flex gap-2 overflow-x-auto">
          <button onClick={() => setSelectedTableId(null)} className="p-2 bg-slate-200 rounded hover:bg-slate-300 transition"><ArrowLeft/></button>
          {categories.map(c => (
            <button key={c.id} onClick={() => setSelectedCategory(c.id)} className={`px-4 py-2 rounded font-bold transition-colors ${selectedCategory === c.id ? 'bg-primary text-white' : 'bg-white text-slate-600 hover:bg-slate-100'}`}>
              {c.icon} {c.name}
            </button>
          ))}
        </div>
        <div className="p-4 grid grid-cols-3 gap-4 overflow-y-auto">
          {menuItems.filter(i => i.categoryId === selectedCategory).map(item => (
            <div key={item.id} onClick={() => addToCart(item)} className="bg-white p-4 rounded-xl shadow cursor-pointer hover:border-primary border-2 border-transparent transition-all hover:-translate-y-1">
              <h3 className="font-bold text-slate-800">{item.name}</h3>
              <p className="text-xs text-slate-500 mb-2 line-clamp-2">{item.description}</p>
              <p className="text-primary font-bold text-lg">${item.price}</p>
            </div>
          ))}
        </div>
      </div>
      <div className="w-96 bg-white border-l shadow-xl flex flex-col">
        <div className="p-4 bg-slate-100 border-b font-bold text-lg">Pedido Mesa {tables.find(t=>t.id === selectedTableId)?.number}</div>
        <div className="flex-1 p-4 overflow-y-auto space-y-2">
           {cart.length === 0 && <div className="text-center text-slate-400 mt-10"><ShoppingCart className="mx-auto mb-2 opacity-20" size={48}/>Carrito Vacío</div>}
           {cart.map((item, i) => (
             <div key={i} className="flex justify-between items-center bg-orange-50 p-3 rounded-lg border border-orange-100">
                <div>
                  <p className="font-bold text-sm">{item.menuItem.name}</p>
                  <p className="text-xs text-orange-700 font-bold">${item.menuItem.price * item.quantity}</p>
                </div>
                <div className="flex items-center gap-2">
                   <span className="font-bold w-6 text-center">{item.quantity}</span>
                   <button onClick={() => setCart(prev => prev.filter(x => x.menuItem.id !== item.menuItem.id))} className="text-red-400 hover:text-red-600 p-1"><X size={18}/></button>
                </div>
             </div>
           ))}
        </div>
        <div className="p-4 border-t bg-slate-50">
          <div className="flex justify-between mb-4 font-bold text-xl text-slate-800">
             <span>Total</span>
             <span>${cart.reduce((sum, i) => sum + (i.menuItem.price * i.quantity), 0).toFixed(2)}</span>
          </div>
          <button onClick={handleSend} disabled={cart.length === 0} className="w-full bg-primary text-white py-4 rounded-xl font-bold disabled:bg-slate-300 shadow-lg hover:bg-orange-600 transition-colors flex justify-center gap-2">
            <ShoppingCart size={20}/> Enviar Pedido
          </button>
        </div>
      </div>
    </div>
  );
};
export default WaiterPanel;