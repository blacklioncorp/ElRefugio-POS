import React, { useState, useEffect } from 'react'; // <--- Agregamos useEffect
import { LayoutGrid, UtensilsCrossed, Settings, LogOut, Bike } from 'lucide-react';
import WaiterPanel from './components/WaiterPanel';
import KitchenPanel from './components/KitchenPanel';
import AdminPanel from './components/AdminPanel';
import DeliveryPanel from './components/DeliveryPanel';
import LoginScreen from './components/LoginScreen';
import { MenuItem, MenuCategory, Table, Order, OrderStatus, AppView, OrderItem, User, UserRole } from './types';
import { api } from './services/api'; // <--- Importamos nuestro cable

// Mock Data Estática (Solo categorías y mesas por ahora)
const INITIAL_CATEGORIES: MenuCategory[] = [
  { id: '1', name: 'Hamburguesas', icon: '🍔' },
  { id: '2', name: 'Bebidas', icon: '🥤' },
];
const INITIAL_TABLES: Table[] = Array.from({ length: 6 }, (_, i) => ({ id: `t-${i+1}`, number: i + 1, isOccupied: false }));

const App: React.FC = () => {
  const [user, setUser] = useState<User | null>(null);
  const [view, setView] = useState<AppView>('WAITER');
  
  const [tables, setTables] = useState<Table[]>(INITIAL_TABLES);
  const [orders, setOrders] = useState<Order[]>([]);
  const [generatedMenu, setGeneratedMenu] = useState<MenuItem[]>([]);
  const [categories] = useState(INITIAL_CATEGORIES);
  
  // ESTADO DE MENU ITEMS (Inicia vacío, se llena desde Python)
  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);

  

  // EFECTO DE CARGA: Al iniciar, pedir TODO a Python
  useEffect(() => {
    const loadData = async () => {
      console.log("🔌 Sincronizando sistema...");
      
      // 1. Cargar Menú
      const products = await api.getProducts();
      if (products.length > 0) setMenuItems(products);

      // 2. Cargar Pedidos Activos (¡NUEVO!)
      const serverOrders = await api.getOrders();
      if (serverOrders.length > 0) {
        setOrders(serverOrders);
        // Marcar mesas ocupadas
        const occupiedTables = serverOrders.map(o => o.tableId);
        setTables(prev => prev.map(t => occupiedTables.includes(t.id) ? { ...t, isOccupied: true } : t));
      }
    };
    
    // Polling: Actualizar cada 5 segundos (Para que la cocina vea cambios sin recargar)
    loadData();
    const interval = setInterval(loadData, 5000); 
    return () => clearInterval(interval);

  }, []);

  const handleLogin = (role: UserRole, username: string) => {
    setUser({ role, username });
    setView(role === 'COOK' ? 'KITCHEN' : role === 'ADMIN' ? 'ADMIN' : 'WAITER');
  };

  const placeOrder = async (tableId: string, items: OrderItem[]) => {
    // 1. Crear la orden visualmente (Optimistic UI)
    const newOrder: Order = {
      id: `ORD-${Date.now().toString().slice(-4)}`,
      type: 'DINE_IN',
      tableId,
      items,
      status: OrderStatus.PENDING,
      timestamp: Date.now(),
      dateStr: new Date().toLocaleDateString('en-CA'),
      total: items.reduce((sum, i) => sum + (i.menuItem.price * i.quantity), 0)
    };
    setOrders(prev => [...prev, newOrder]);
    setTables(prev => prev.map(t => t.id === tableId ? { ...t, isOccupied: true } : t));

    // 2. Enviar la orden al Backend (Silenciosamente)
    try {
        await api.createOrder(newOrder);
        console.log("✅ Orden guardada en Base de Datos");
    } catch (e) {
        console.error("❌ Error guardando orden en BD", e);
        alert("Ojo: La orden se ve en pantalla pero no se guardó en la base de datos (Error de conexión)");
    }
  };

  // Lógica para Generar el Menú con IA (Simulación por ahora)
  const handleGenerateMenu = (concept: string) => {
    console.log('🤖 Solicitando menú con el concepto:', concept);
    // **PENDIENTE: LLAMAR A LA API DE PYTHON PARA USAR GEMINI AQUÍ**
    
    // SIMULACIÓN DE RESPUESTA DE GEMINI:
    const dummyMenu: MenuItem[] = [
      { id: '901', name: 'Taco Cósmico', price: 35.00, categoryId: '2', description: 'Carne al pastor con piña caramelizada, cebolla morada encurtida y chispas de chile de árbol.', imageUrl: '' },
      { id: '902', name: 'Quesadilla Espacial', price: 65.00, categoryId: '2', description: 'Queso oaxaca y flor de calabaza en tortilla azul nixtamalizada, acompañada de crema de rancho.', imageUrl: '' },
      { id: '903', name: 'Aguas Frescas Intergalácticas', price: 25.00, categoryId: '4', description: 'Agua de jamaica con un toque de jengibre y miel de agave.', imageUrl: '' },
    ];
    
    setGeneratedMenu(dummyMenu); 
    alert('Menú generado (simulación). Revisa la pestaña de Generador IA.');
    
    // Una vez implementes la API de Python, esta función se actualizará para llamar a api.generateMenu()
  };

  const updateOrderStatus = (orderId: string, status: OrderStatus) => {
    setOrders(prev => prev.map(o => {
      if (o.id === orderId) {
        if (status === OrderStatus.PAID || status === OrderStatus.CANCELLED) {
             if (o.tableId) setTables(tbls => tbls.map(t => t.id === o.tableId ? { ...t, isOccupied: false } : t));
        }
        return { ...o, status };
      }
      return o;
    }));
  };

  if (!user) return <LoginScreen onLogin={handleLogin} />;

  return (
    <div className="min-h-screen bg-slate-100 font-sans flex flex-col">
      <nav className="bg-slate-900 text-white h-16 flex items-center px-6 justify-between shadow-lg z-50">
        <div className="flex items-center gap-3 font-bold text-xl"><div className="w-8 h-8 bg-primary rounded flex items-center justify-center">R</div> El Refugio</div>
        <div className="flex gap-2">
          {user.role !== 'COOK' && <button onClick={() => setView('WAITER')} className={`flex gap-2 px-4 py-2 rounded ${view === 'WAITER' ? 'bg-primary' : 'hover:bg-white/10'}`}><LayoutGrid size={20}/> Mesas</button>}
          {(user.role === 'COOK' || user.role === 'ADMIN') && <button onClick={() => setView('KITCHEN')} className={`flex gap-2 px-4 py-2 rounded ${view === 'KITCHEN' ? 'bg-primary' : 'hover:bg-white/10'}`}><UtensilsCrossed size={20}/> Cocina</button>}
          {user.role === 'ADMIN' && <button onClick={() => setView('ADMIN')} className={`flex gap-2 px-4 py-2 rounded ${view === 'ADMIN' ? 'bg-primary' : 'hover:bg-white/10'}`}><Settings size={20}/> Admin</button>}
          <button onClick={() => setView('DELIVERY')} className={`flex gap-2 px-4 py-2 rounded ${view === 'DELIVERY' ? 'bg-primary' : 'hover:bg-white/10'}`}><Bike size={20}/></button>
          <button onClick={() => setUser(null)} className="p-2 hover:bg-red-600 rounded ml-4"><LogOut size={20}/></button>
        </div>
      </nav>

      <main className="flex-1 overflow-hidden relative">
        {view === 'WAITER' && <WaiterPanel tables={tables} categories={categories} menuItems={menuItems} orders={orders} onPlaceOrder={placeOrder} />}
        {view === 'KITCHEN' && <KitchenPanel orders={orders} tables={tables} onUpdateStatus={updateOrderStatus} />}
        {view === 'ADMIN' && <AdminPanel menuItems={menuItems} 
      generatedMenu={generatedMenu}
      onGenerateMenu={handleGenerateMenu} />}
        {view === 'DELIVERY' && <DeliveryPanel orders={orders} />}
      </main>
    </div>
  );
};

export default App;