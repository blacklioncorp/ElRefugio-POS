import React, { useState, useEffect, useCallback } from 'react';
import { LayoutGrid, UtensilsCrossed, Settings, LogOut, Bike } from 'lucide-react';
import { Toaster, toast } from 'sonner'; // Importación de notificaciones
import WaiterPanel from './components/WaiterPanel';
import KitchenPanel from './components/KitchenPanel';
import AdminPanel from './components/AdminPanel';
import DeliveryPanel from './components/DeliveryPanel';
import LoginScreen from './components/LoginScreen';
import { MenuItem, MenuCategory, Table, Order, OrderStatus, AppView, OrderItem, User, UserRole } from './types';
import { api } from './services/api'; // Tu cable a Render

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
      const serverOrders = await api.get('/orders/');
      if (Array.isArray(serverOrders)) {
        setOrders(serverOrders);
        // Actualizar ocupación de mesas basado en órdenes vivas
        const occupiedTables = serverOrders
            .filter((o: Order) => o.status !== OrderStatus.PAID && o.status !== OrderStatus.CANCELLED)
            .map((o: Order) => o.tableId);
            
        setTables(prev => prev.map(t => 
            occupiedTables.includes(t.id) ? { ...t, isOccupied: true } : { ...t, isOccupied: false }
        ));
      }
    } catch (error) {
      console.error("Error fetching orders:", error);
    }
  }, []);

  const fetchProducts = async () => {
      try {
        const products = await api.get('/products/');
        if (products.length > 0) setMenuItems(products);
      } catch (error) {
        console.error("Error fetching products:", error);
      }
  };

  // 2. EFECTO DE INICIO Y POLLING (Auto-refresco)
  useEffect(() => {
    if (user) { // Solo sincronizar si hay usuario logueado
        console.log("🔌 Sincronizando sistema...");
        fetchProducts();
        fetchOrders();

        const interval = setInterval(fetchOrders, 5000); // Cada 5 seg
        return () => clearInterval(interval);
    }
  }, [fetchOrders, user]);

  const handleLogin = (role: UserRole, username: string) => {
    setUser({ role, username });
    
    // CORRECCIÓN: Usamos 'KITCHEN' en lugar de 'COOK'
    if (role === 'KITCHEN') {
        setView('KITCHEN');
    } else if (role === 'ADMIN') {
        setView('ADMIN');
    } else {
        setView('WAITER');
    }
  };
 
  // CREAR ORDEN (Corregido para evitar Error 422)
  const placeOrder = async (tableId: string, items: OrderItem[]) => {
    // 1. UI Optimista (Lo que ve el usuario inmediatamente)
    const tempId = `TEMP-${Date.now()}`;
    const newOrderVisual: Order = {
      id: tempId,
      type: 'DINE_IN',
      tableId, // React lo necesita así
      items,
      status: OrderStatus.PENDING,
      timestamp: Date.now(),
      dateStr: new Date().toLocaleDateString('en-CA'),
      total: items.reduce((sum, i) => sum + (i.menuItem.price * i.quantity), 0)
    };

    setOrders(prev => [...prev, newOrderVisual]);
    
    // Si la mesa estaba libre, la marcamos ocupada visualmente
    setTables(prev => prev.map(t => t.id === tableId ? { ...t, isOccupied: true } : t));

    try {
        // 2. TRADUCCIÓN DE DATOS (El secreto para que Python entienda)
        const orderPayload = {
            table_id: tableId,  // <--- AQUÍ ESTÁ LA CLAVE (tableId -> table_id)
            status: "PENDING",
            total: newOrderVisual.total,
            // Transformamos los items para mandar solo lo que la BD necesita
            items: items.map(item => ({
                product_id: item.menuItem.id, // Mandamos el ID, no el objeto entero
                quantity: item.quantity,
                price: item.menuItem.price      // Precio al momento de la venta
            }))
        };

        // 3. Enviar el paquete traducido
        await api.post('/orders/', orderPayload);
        
        toast.success("Orden enviada a cocina");
        fetchOrders(); // Recargar para obtener el ID real de la BD
    } catch (e) {
        console.error("❌ Error guardando orden", e);
        toast.error("Error de conexión al guardar orden");
        // Opcional: Podrías eliminar la orden visual si falló
    }
  };

  // src/App.tsx (Añadir dentro del componente App: React.FC)

const handlePayOrder = async (orderId: string, tableId: string) => {
    try {
        // 1. Marcar la orden como PAGADA en el Backend
        await api.put(`/orders/${orderId}/status`, { status: OrderStatus.PAID });
        
        // 2. Liberar la mesa en el Backend (si no hay más órdenes activas en esa mesa)
        
        // Verificamos si hay otras órdenes activas en esa mesa, excluyendo la que se acaba de pagar
        const remainingActiveOrders = orders.filter(o => 
            o.tableId === tableId && 
            o.id !== orderId &&
            o.status !== OrderStatus.PAID &&
            o.status !== OrderStatus.CANCELLED
        ).length;
        
        if (remainingActiveOrders === 0) {
            // Si es la última orden activa de la mesa, la liberamos
            await api.put(`/tables/${tableId}/occupancy`, { is_occupied: false });
            
            // 3. Actualizar el estado local de la mesa
            setTables(prev => prev.map(t => t.id === tableId ? { ...t, isOccupied: false } : t));
        }

        toast.success(`Cuenta pagada. Mesa ${tableId} liberada.`);
        fetchOrders(); // Recargar el estado global
    } catch (e) {
        console.error("Error al pagar la cuenta", e);
        toast.error("Error al procesar el pago.");
    }
};



  // ACTUALIZAR ESTADO
  const handleUpdateOrderStatus = async (orderId: string, newStatus: OrderStatus) => {
    try {
      await api.put(`/orders/${orderId}/status`, { status: newStatus });
      await fetchOrders(); 
      
      // NOTIFICACIÓN (TOAST)
      if (newStatus === OrderStatus.READY) {
         const order = orders.find(o => o.id === orderId || o.id === parseInt(orderId));
         const table = tables.find(t => t.id === order?.tableId);
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

  const handleGenerateMenu = async (concept: string) => {
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

  // src/App.tsx (Solo reemplaza la sección del return)

  if (!user) return <LoginScreen onLogin={handleLogin} />;

  return (
    <div className="min-h-screen bg-slate-100 font-sans flex flex-col">
      <Toaster /> 

      <nav className="bg-slate-900 text-white h-16 flex items-center px-6 justify-between shadow-lg z-50">
        <div className="flex items-center gap-3 font-bold text-xl"><div className="w-8 h-8 bg-primary rounded flex items-center justify-center">R</div> El Refugio</div>
        <div className="flex gap-2">
          {/* CORRECCIÓN: Usamos user?.role para prevenir el error de "Cannot read properties of null" */}
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
        orders={orders} // <--- NUEVO
        tables={tables} // <--- NUEVO
    />
)}
        
        {view === 'DELIVERY' && <DeliveryPanel orders={orders} />}
      </main>
    </div>
  );
};

export default App;