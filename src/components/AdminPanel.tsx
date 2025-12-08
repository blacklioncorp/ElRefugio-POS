import React, { useState } from 'react';
import type { MenuItem, Order, Table } from '../types'; 
import { Sparkles, Save, Monitor } from 'lucide-react'; 
import { api } from '../services/api';
import { toast } from 'sonner';
import { OrderStatus } from '../types'; 
// Asegúrate de que ProductManager existe en src/components/
import ProductManager from './ProductManager'; 

// ==========================================================
// COMPONENTE AUXILIAR: MONITOR DE MESAS
// ==========================================================
const TableMonitor: React.FC<{ tables: Table[], orders: Order[] }> = ({ tables, orders }) => {
    
    // Obtenemos solo las órdenes activas (PENDIENTE o LISTA)
    const activeOrders = orders.filter(o => o.status !== OrderStatus.PAID && o.status !== OrderStatus.CANCELLED);
    
    // Filtramos las mesas ocupadas que tienen órdenes activas
    const occupiedTables = tables.filter(t => t.isOccupied);

    const calculateTotal = (tableId: string): number => {
        const tableOrders = activeOrders.filter(o => o.tableId === tableId);
        if (tableOrders.length === 0) return 0;
        
        let total = 0;
        tableOrders.forEach(order => {
             order.items.forEach(item => {
                // CORRECCIÓN: Usar la estructura segura para el precio
                const itemPrice = item.menuItem?.price || (item as any).menu_item?.price || 0; 
                const extra = item.extraCharge || 0;
                total += (itemPrice + extra) * item.quantity;
            });
        });
        return total;
    };

    return (
        <div className="bg-white p-6 rounded-xl shadow-sm border">
            <h3 className="text-2xl font-bold mb-4 text-slate-800 flex items-center gap-2">
                <Monitor size={24} className="text-red-500"/> Mesas Ocupadas (Cuentas Activas)
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-4">
                {occupiedTables.length === 0 ? (
                    <p className="text-slate-500 col-span-full text-center py-10">No hay mesas con cuentas abiertas.</p>
                ) : (
                    occupiedTables.map(table => (
                        <div key={table.id} className="p-4 border rounded-lg bg-white shadow hover:border-red-400 transition">
                            <h4 className="font-bold text-xl text-slate-800">Mesa {table.number}</h4>
                            <p className="text-xs text-red-500 mb-2">Orden(es) en curso</p>
                            <div className="text-3xl font-extrabold text-red-700 mt-2">
                                ${calculateTotal(table.id).toFixed(2)}
                            </div>
                            <p className="text-xs text-slate-400 mt-2">Órdenes Activas: {activeOrders.filter(o => o.tableId === table.id).length}</p>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
};
// ==========================================================


// ==========================================================
// COMPONENTE PRINCIPAL: ADMIN PANEL
// ==========================================================
interface AdminPanelProps {
  menuItems: MenuItem[];
  generatedMenu: MenuItem[];
  onGenerateMenu: (concept: string) => void;
  orders: Order[];
  tables: Table[];
  onProductAdded?: () => void;
  onProductAction: () => void; // Prop obligatoria para recargar el menú
  
}
// CORRECCIÓN: Desestructuramos onProductAction de las props
const AdminPanel: React.FC<AdminPanelProps> = ({ menuItems, generatedMenu, onGenerateMenu, orders, tables, onProductAction }) => {
  const [concept, setConcept] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [activeTab, setActiveTab] = useState<'generator' | 'menu' | 'monitor'>('generator'); 

  const handleGenerateClick = () => {
    if (!concept) return;
    setIsGenerating(true);
    onGenerateMenu(concept);
    setTimeout(() => setIsGenerating(false), 2000); 
  };

  const handleApproveItem = async (item: MenuItem) => {
    try {
        const payload = {
            name: item.name,
            price: typeof item.price === 'string' ? parseFloat((item.price as string).replace('$','')) : item.price,
            category: item.category || "General",
            description: item.description
        };

        await api.post('/products/', payload);
        toast.success(`Producto "${item.name}" guardado en la Base de Datos`);
    } catch (error) {
        console.error(error);
        toast.error("Error al guardar producto");
    }
  };

  return (
    <div className="p-6 bg-slate-50 min-h-screen">
      <h1 className="text-3xl font-bold text-slate-800 mb-6 flex items-center gap-2">
        <SettingsIcon /> Panel de Administración
      </h1>

      {/* PESTAÑAS */}
      <div className="flex gap-4 mb-6 border-b">
        <button 
            onClick={() => setActiveTab('generator')}
            className={`pb-2 px-4 font-bold ${activeTab === 'generator' ? 'border-b-4 border-blue-600 text-blue-600' : 'text-slate-400'}`}
        >
            <Sparkles size={16} className="inline mr-2"/> Generador IA
        </button>
        <button 
            onClick={() => setActiveTab('menu')}
            className={`pb-2 px-4 font-bold ${activeTab === 'menu' ? 'border-b-4 border-orange-600 text-orange-600' : 'text-slate-400'}`}
        >
            Ψ Menú Actual ({menuItems.length})
        </button>
         <button 
            onClick={() => setActiveTab('monitor')} 
            className={`pb-2 px-4 font-bold ${activeTab === 'monitor' ? 'border-b-4 border-red-600 text-red-600' : 'text-slate-400'}`}
        >
            👁️ Monitor
        </button>
      </div>

      {/* RENDERIZADO CONDICIONAL POR PESTAÑA */}
      {activeTab === 'generator' && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Contenido del Generador IA... */}
          </div>
      )}

      {/* 🟢 ZONA DE MENÚ ACTUAL: USAMOS EL CRUD MANAGER 🟢 */}
      {activeTab === 'menu' && (
          <ProductManager 
              menuItems={menuItems} 
              onProductAction={onProductAction} // Ahora la prop existe y se pasa correctamente
          />
      )}
      
      {/* CORRECCIÓN: Se elimina el bloque duplicado de activeTab === 'menu' */}

      {/* 🟢 NUEVO CONTENIDO: MONITOR DE MESAS 🟢 */}
      {activeTab === 'monitor' && (
          <TableMonitor 
              tables={tables} 
              orders={orders} 
          />
      )}

    </div>
  );
};

// ... Resto de componentes y exportaciones (SettingsIcon y TableMonitor)

const SettingsIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.38a2 2 0 0 0-.73-2.73l-.15-.1a2 2 0 0 1-1-1.72v-.51a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z"/><circle cx="12" cy="12" r="3"/></svg>
);

export default AdminPanel;