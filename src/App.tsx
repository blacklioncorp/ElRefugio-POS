import React, { useState, useEffect, useCallback } from 'react';
import { LayoutGrid, UtensilsCrossed, Settings, LogOut, Bike } from 'lucide-react';
import { Toaster, toast } from 'sonner';
import WaiterPanel from './components/WaiterPanel';
import KitchenPanel from './components/KitchenPanel';
import AdminPanel from './components/AdminPanel';
import DeliveryPanel from './components/DeliveryPanel';
import LoginScreen from './components/LoginScreen';
import { MenuItem, MenuCategory, Table, Order, OrderStatus, AppView, OrderItem, User, UserRole } from './types';
import { api } from './services/api';

// Datos Iniciales
const INITIAL_CATEGORIES: MenuCategory[] = [
  { id: '1', name: 'Hamburguesas', icon: '🍔' },
  { id: '2', name: 'Bebidas', icon: '🥤' },
  { id: '3', name: 'Tacos', icon: '🌮' },
];
const INITIAL_TABLES: Table[] = Array.from({ length: 6 }, (_, i) => ({ id: `t-${i+1}`, number: i + 1, isOccupied: false }));

const App: React.FC = () => {
  const [user, setUser] = useState<User | null>(null);
  const [view, setView] = useState<AppView>('WAITER');
  
  const [tables, setTables] = useState<Table[]>(INITIAL_TABLES);
  const [orders, setOrders] = useState<Order[]>([]);
  const [generatedMenu, setGeneratedMenu] = useState<MenuItem[]>([]);
  const [categories] = useState(INITIAL_CATEGORIES);
  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);

  // 1. FUNCIÓN CENTRAL DE CARGA
  const fetchOrders = useCallback(async () => {
    try {
      const serverOrders: Order[] = await api.get('/orders/');
      if (Array.isArray(serverOrders)) {
        setOrders(serverOrders);
        
        // Determinar ocupación de mesas basándose en IDs de cadena
        const occupiedTables = serverOrders
            .filter((o: Order) => o.status !== OrderStatus.PAID && o.status !== OrderStatus.CANCELLED)
            .map((o: Order) => String(o.tableId)); // Convertir IDs a string para la comparación
            
        setTables(prev => prev.map(t => {
            const isOccupied = occupiedTables.includes(String(t.id)); 
            return { ...t, isOccupied: isOccupied };
        }));
        return serverOrders; // Importante: retorna la lista fresca
      }
      return [];
    } catch (error) {
      console.error("Error fetching orders:", error);
      return [];
    }
  }, []);

  const fetchProducts = async () => {
      try {
        const products = await api.get('/products/');
        // Asegurar que el ID y la categoría son consistentes
        const standardizedProducts = products.map((p: any) => ({
            ...p,
            id: String(p.id),
            category: p.category || p.category_id || 'General',
        }));
        if (standardizedProducts.length > 0) setMenuItems(standardizedProducts);
      } catch (error) {
        console.error("Error fetching products:", error);
      }
  };

  // 2. EFECTO DE INICIO Y POLLING (Auto-refresco)
  useEffect(() => {
    if (user) { 
        console.log("🔌 Sincronizando sistema...");
        fetchProducts();
        fetchOrders();

        const interval = setInterval(fetchOrders, 5000); 
        return () => clearInterval(interval);
    }
  }, [fetchOrders, user]);

  const handleLogin = (role: UserRole, username: string) => {
    setUser({ role, username });
    
    if (role === 'KITCHEN') {
        setView('KITCHEN');
    } else if (role === 'ADMIN') {
        setView('ADMIN');
    } else {
        setView('WAITER');
    }
  };
 
  // CREAR ORDEN
  const placeOrder = async (tableId: string, items: OrderItem[]) => {
    const tempId = `TEMP-${Date.now()}`;
    const totalWithExtras = items.reduce((sum, i) => sum + ((i.menuItem.price + (i.extraCharge || 0)) * i.quantity), 0);

    const newOrderVisual: Order = {
      id: tempId,
      type: 'DINE_IN',
      tableId,
      items,
      status: OrderStatus.PENDING,
      timestamp: Date.now(),
      dateStr: new Date().toLocaleDateString('en-CA'),
      total: totalWithExtras
    };

    setOrders(prev => [...prev, newOrderVisual]);
    setTables(prev => prev.map(t => t.id === tableId ? { ...t, isOccupied: true } : t));

    try {
        const orderPayload = {
            table_id: tableId, 
            status: "PENDING",
            total: totalWithExtras, 
            items: items.map(item => ({
                product_id: item.menuItem.id,
                quantity: item.quantity,
                price: item.menuItem.price,
                note: item.note,
                extra_charge: item.extraCharge, // Usar snake_case para Python
            }))
        };

        await api.post('/orders/', orderPayload);
        toast.success("Orden enviada a cocina");
        fetchOrders();
    } catch (e) {
        console.error("❌ Error guardando orden", e);
        toast.error("Error de conexión al guardar orden");
    }
  };

// GESTIÓN DE PAGO Y LIBERACIÓN DE MESA (CORREGIDO)
const handlePayOrder = async (orderId: string, tableId: string) => {
    try {
        // 1. Marcar la orden como PAGADA en el Backend
        await api.put(`/orders/${orderId}/status`, { status: OrderStatus.PAID });
        
        // 2. Ejecutar fetchOrders Y USAR EL RESULTADO FRESCO
        const updatedOrders: Order[] = await fetchOrders(); 
        
        // 3. Liberar la mesa en el Backend si no hay más órdenes activas.
        
        const remainingActiveOrders = updatedOrders.filter(o => 
            String(o.tableId) === tableId && // Usar String() para tolerar IDs
            o.status !== OrderStatus.PAID &&
            o.status !== OrderStatus.CANCELLED
        ).length;
        
        if (remainingActiveOrders === 0) {
            await api.put(`/tables/${tableId}/occupancy`, { is_occupied: false });
            
            // 4. Actualizar el estado local (redundante, pero asegura el estado)
            setTables(prev => prev.map(t => String(t.id) === tableId ? { ...t, isOccupied: false } : t));
        }

        toast.success(`Cuenta pagada. Mesa ${tableId} liberada.`);
    } catch (e) {
        console.error("Error al pagar la cuenta", e);
        toast.error("Error al procesar el pago.");
    }
};

  // ACTUALIZAR ESTADO (READY/CANCELLED) (CORREGIDO)
  const handleUpdateOrderStatus = async (orderId: string, newStatus: OrderStatus) => {
    try {
      // 1. Marcar la orden en el Backend
      await api.put(`/orders/${orderId}/status`, { status: newStatus });
      
      // 2. Forzar la recarga de datos
      const currentOrders: Order[] = await fetchOrders(); 
      
      // 3. NOTIFICACIÓN (TOAST) - Usando los datos FRESCOS (currentOrders)
      if (newStatus === OrderStatus.READY) {
         // Buscamos la orden en los datos frescos
         const order = currentOrders.find(o => String(o.id) === String(orderId));
         const table = tables.find(t => String(t.id) === String(order?.tableId)); 
         const tableName = table ? `MESA ${table.number}` : 'Una orden';
         
         toast.success(`🔔 ¡${tableName} ESTÁ LISTA!`, {
            duration: 8000,
            position: 'top-center',
            style: { border: '2px solid #22c55e', padding: '16px', fontSize: '1.2em' }
         });
      }
      
      if (newStatus === OrderStatus.CANCELLED) toast.info("Orden cancelada");
      
    } catch (error) {
      console.error("Error updating order:", error);
      toast.error("Error al actualizar orden");
    }
  };

  const handleProductAction = () => {
    fetchProducts();
  };

  const handleGenerateMenu = async (concept: string) => {
    // ... (Tu código de generateMenu se mantiene)
    toast.info("Generando menú con IA... espere.");
    try {
        const generated = await api.post('/ai/generate_menu', { concept });
        if (Array.isArray(generated)) {
            setGeneratedMenu(generated);
            toast.success("Menú generado por IA");
        } else {
             const dummyMenu: MenuItem[] = [
                { id: '901', name: 'Taco Cósmico', price: 35.00, category: 'Tacos', description: 'Carne al pastor con piña caramelizada.', imageUrl: '' },
                { id: '902', name: 'Quesadilla Espacial', price: 65.00, category: 'Tacos', description: 'Queso oaxaca y flor de calabaza.', imageUrl: '' },
            ];
            setGeneratedMenu(dummyMenu);
            toast.success("Menú simulado recibido");
        }
    } catch (error) {
        console.error(error);
        toast.error("Error generando menú");
    }
  };

  // RENDERIZADO
  if (!user) return <LoginScreen onLogin={handleLogin} />;

  return (
    <div className="min-h-screen bg-slate-100 font-sans flex flex-col">
      <Toaster /> 
      {/* ... (Tu navbar) ... */}
      <nav className="bg-slate-900 text-white h-16 flex items-center px-6 justify-between shadow-lg z-50">
        <div className="flex items-center gap-3 font-bold text-xl"><div className="w-8 h-8 bg-primary rounded flex items-center justify-center">R</div> El Refugio</div>
        <div className="flex gap-2">
          {user?.role !== 'KITCHEN' && <button onClick={() => setView('WAITER')} className={`flex gap-2 px-4 py-2 rounded ${view === 'WAITER' ? 'bg-primary' : 'hover:bg-white/10'}`}><LayoutGrid size={20}/> Mesas</button>}
          
          {(user?.role === 'KITCHEN' || user?.role === 'ADMIN') && <button onClick={() => setView('KITCHEN')} className={`flex gap-2 px-4 py-2 rounded ${view === 'KITCHEN' ? 'bg-primary' : 'hover:bg-white/10'}`}><UtensilsCrossed size={20}/> Cocina</button>}
          
          {user?.role === 'ADMIN' && <button onClick={() => setView('ADMIN')} className={`flex gap-2 px-4 py-2 rounded ${view === 'ADMIN' ? 'bg-primary' : 'hover:bg-white/10'}`}><Settings size={20}/> Admin</button>}
          
          <button onClick={() => setView('DELIVERY')} className={`flex gap-2 px-4 py-2 rounded ${view === 'DELIVERY' ? 'bg-primary' : 'hover:bg-white/10'}`}><Bike size={20}/></button>
          <button onClick={() => setUser(null)} className="p-2 hover:bg-red-600 rounded ml-4"><LogOut size={20}/></button>
        </div>
      </nav>

      <main className="flex-1 overflow-hidden relative">
        {view === 'WAITER' && (
            <WaiterPanel 
                tables={tables} 
                categories={categories} 
                menuItems={menuItems} 
                orders={orders} 
                onPlaceOrder={placeOrder} 
                onUpdateOrderStatus={handleUpdateOrderStatus}
                onPayOrder={handlePayOrder}
            />
        )}
        
        {view === 'KITCHEN' && (
            <KitchenPanel 
                orders={orders} 
                tables={tables} 
                onUpdateStatus={handleUpdateOrderStatus} 
            />
        )}
        
        {view === 'ADMIN' && (
    <AdminPanel 
        menuItems={menuItems} 
        generatedMenu={generatedMenu}
        onGenerateMenu={handleGenerateMenu}
        orders={orders}
        tables={tables}
        onProductAction={handleProductAction}
    />
)}
        
        {view === 'DELIVERY' && <DeliveryPanel orders={orders} />}
      </main>
    </div>
  );
};

export default App;