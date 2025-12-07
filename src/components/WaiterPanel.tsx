import React, { useState, useMemo } from 'react';
// Importamos los tipos, pero usaremos "any" en el map para evitar conflictos de tipado con la API
import type { MenuItem, MenuCategory, OrderItem, Table, Order } from '../types';
import { OrderStatus } from '../types';
import { ShoppingCart, X, ArrowLeft, Bell, Utensils } from 'lucide-react';

interface WaiterPanelProps {
  tables: Table[];
  categories: MenuCategory[]; // Estas vienen de App.tsx, pero las ignoraremos si no coinciden
  menuItems: MenuItem[];
  orders: Order[];
  onPlaceOrder: (tableId: string, items: OrderItem[]) => void;
}

const WaiterPanel: React.FC<WaiterPanelProps> = ({ tables, menuItems, orders, onPlaceOrder }) => {
  const [selectedTableId, setSelectedTableId] = useState<string | null>(null);
  
  // ESTADO: 'all' por defecto para que siempre se vea algo al principio
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [cart, setCart] = useState<OrderItem[]>([]);

  // 1. GENERACIÓN DINÁMICA DE CATEGORÍAS (Solución al problema de "Tacos" vs "Hamburguesas")
  // Esto extrae las categorías reales que vienen de la API (ej: "Tacos", "Bebidas")
  const dynamicCategories = useMemo(() => {
    // Extraemos todas las categorías de los productos
    const cats = new Set(menuItems.map((i: any) => i.category || i.categoryId || 'General'));
    return Array.from(cats);
  }, [menuItems]);

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

  // VISTA DE SELECCIÓN DE MESA
  if (!selectedTableId) {
    return (
      <div className="p-6">
        <h2 className="text-2xl font-bold text-slate-800 mb-6">Seleccionar Mesa</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {tables.map(t => {
            const active = orders.find(o => o.tableId === t.id && o.status !== OrderStatus.PAID && o.status !== OrderStatus.CANCELLED);
            const ready = active?.status === OrderStatus.READY;
            
            return (
              <button key={t.id} onClick={() => setSelectedTableId(t.id)} 
                className={`p-8 rounded-xl border-2 flex flex-col items-center transition-all ${ready ? 'bg-green-500 text-white animate-pulse shadow-lg scale-105' : active ? 'bg-orange-100 border-orange-300' : 'bg-white hover:border-primary hover:shadow-md'}`}>
                <span className="text-3xl font-bold">{t.number}</span>
                <span className="text-xs uppercase font-bold mt-2">{ready ? '¡LISTO!' : active ? 'Ocupada' : 'Libre'}</span>
                {ready && <Bell className="mt-2 animate-bounce"/>}
              </button>
            )
          })}
        </div>
      </div>
    );
  }

  // VISTA DE TOMA DE PEDIDOS
  return (
    <div className="flex flex-col md:flex-row h-[calc(100vh-80px)]"> {/* Ajuste de altura para móvil */}
      
      {/* COLUMNA IZQUIERDA: MENÚ */}
      <div className="flex-1 flex flex-col bg-slate-50 overflow-hidden">
        
        {/* BARRA DE CATEGORÍAS */}
        <div className="p-2 bg-white border-b flex gap-2 overflow-x-auto whitespace-nowrap scrollbar-hide">
          <button onClick={() => setSelectedTableId(null)} className="p-3 bg-slate-200 rounded hover:bg-slate-300 transition flex items-center justify-center shrink-0">
            <ArrowLeft size={20}/>
          </button>
          
          {/* BOTÓN "TODOS" (Failsafe) */}
          <button 
            onClick={() => setSelectedCategory('all')} 
            className={`px-4 py-2 rounded-lg font-bold transition-colors shrink-0 ${selectedCategory === 'all' ? 'bg-slate-800 text-white' : 'bg-white border text-slate-600'}`}
          >
            Todos
          </button>

          {/* CATEGORÍAS DINÁMICAS (Aquí aparecerá "Tacos") */}
          {dynamicCategories.map(cat => (
            <button 
              key={cat} 
              onClick={() => setSelectedCategory(cat)} 
              className={`px-4 py-2 rounded-lg font-bold transition-colors shrink-0 flex items-center gap-2 ${selectedCategory === cat ? 'bg-orange-500 text-white' : 'bg-white border text-slate-600 hover:bg-orange-50'}`}
            >
               {cat}
            </button>
          ))}
        </div>

        {/* LISTA DE PRODUCTOS */}
        <div className="p-4 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 overflow-y-auto pb-20">
          {menuItems
            .filter((i: any) => {
                // 2. CORRECCIÓN DEL FILTRO: Comprobamos 'category' (API) y 'categoryId' (Legacy)
                if (selectedCategory === 'all') return true;
                const itemCat = i.category || i.categoryId;
                return itemCat === selectedCategory;
            })
            .map(item => (
            <button key={item.id} onClick={() => addToCart(item)} className="bg-white p-4 rounded-xl shadow-sm border border-slate-200 hover:border-orange-500 hover:shadow-md transition-all text-left flex flex-col h-full">
              <div className="flex justify-between items-start w-full">
                <h3 className="font-bold text-slate-800 text-lg leading-tight">{item.name}</h3>
                <span className="text-orange-600 font-bold bg-orange-50 px-2 py-1 rounded text-sm">${item.price}</span>
              </div>
              <p className="text-xs text-slate-500 mt-2 line-clamp-2">{item.description || 'Sin descripción'}</p>
            </button>
          ))}
          
          {/* Mensaje si no hay productos */}
          {menuItems.length === 0 && (
             <div className="col-span-full text-center p-10 text-slate-400">
               <Utensils className="mx-auto mb-2 opacity-50" size={48} />
               <p>No hay productos cargados en el sistema.</p>
             </div>
          )}
        </div>
      </div>

      {/* COLUMNA DERECHA: CARRITO (Panel Lateral) */}
      <div className="w-full md:w-96 bg-white border-l shadow-2xl flex flex-col h-1/3 md:h-auto z-20">
        <div className="p-4 bg-slate-100 border-b font-bold text-lg flex justify-between items-center">
            <span>Mesa {tables.find(t=>t.id === selectedTableId)?.number}</span>
            <span className="text-xs bg-slate-200 px-2 py-1 rounded text-slate-600">{cart.reduce((acc, el) => acc + el.quantity, 0)} items</span>
        </div>
        
        <div className="flex-1 p-4 overflow-y-auto space-y-2">
           {cart.length === 0 && <div className="text-center text-slate-400 mt-10"><ShoppingCart className="mx-auto mb-2 opacity-20" size={48}/>Agrega productos del menú</div>}
           {cart.map((item, i) => (
             <div key={i} className="flex justify-between items-center bg-orange-50 p-3 rounded-lg border border-orange-100 animate-in fade-in slide-in-from-right-4">
                <div className="overflow-hidden">
                  <p className="font-bold text-sm truncate">{item.menuItem.name}</p>
                  <p className="text-xs text-orange-700 font-bold">${item.menuItem.price * item.quantity}</p>
                </div>
                <div className="flex items-center gap-3 shrink-0">
                   <span className="font-bold bg-white w-8 h-8 flex items-center justify-center rounded-full shadow-sm text-sm">{item.quantity}</span>
                   <button onClick={() => setCart(prev => prev.filter(x => x.menuItem.id !== item.menuItem.id))} className="text-red-400 hover:text-red-600 p-2 hover:bg-red-50 rounded-full transition"><X size={18}/></button>
                </div>
             </div>
           ))}
        </div>
        
        <div className="p-4 border-t bg-slate-50 safe-area-bottom">
          <div className="flex justify-between mb-4 font-bold text-2xl text-slate-800">
             <span>Total</span>
             <span>${cart.reduce((sum, i) => sum + (i.menuItem.price * i.quantity), 0).toFixed(2)}</span>
          </div>
          <button onClick={handleSend} disabled={cart.length === 0} className="w-full bg-orange-600 text-white py-4 rounded-xl font-bold disabled:bg-slate-300 disabled:cursor-not-allowed shadow-lg hover:bg-orange-700 active:scale-95 transition-all flex justify-center gap-2 items-center">
            <ShoppingCart size={20}/> ENVIAR PEDIDO
          </button>
        </div>
      </div>
    </div>
  );
};

export default WaiterPanel;