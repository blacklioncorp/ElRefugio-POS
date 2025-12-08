import React, { useState } from 'react';
import type { MenuItem } from '../types';
import { Plus, Edit, Trash2, Save, X } from 'lucide-react';
import { api } from '../services/api';
import { toast } from 'sonner';

interface ProductManagerProps {
  menuItems: MenuItem[];
  onProductAction: () => void; // Función para forzar la recarga del menú en App.tsx
}

const ProductManager: React.FC<ProductManagerProps> = ({ menuItems, onProductAction }) => {
  // Estado para manejar la edición (null si no estamos editando)
  const [editingItem, setEditingItem] = useState<MenuItem | null>(null);
  
  // Estado para manejar la creación de un nuevo producto
  const [isCreating, setIsCreating] = useState(false);
  const [newItem, setNewItem] = useState<Omit<MenuItem, 'id'> & { id?: string }>({
    name: '',
    price: 0,
    category: '',
    description: '',
    is_active: true,
  });

  // --- LÓGICA DE ELIMINACIÓN (DELETE) ---
  const handleDelete = async (id: string) => {
    if (window.confirm(`¿Seguro que quieres ELIMINAR el producto con ID ${id}?`)) {
      try {
        await api.delete(`/products/${id}`);
        toast.success("Producto eliminado exitosamente.");
        onProductAction(); // Recarga la lista en App.tsx
      } catch (error) {
        console.error("Error al eliminar:", error);
        toast.error("Error al eliminar el producto.");
      }
    }
  };

  // --- LÓGICA DE CREACIÓN (CREATE) ---
  const handleCreateSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newItem.name || !newItem.price || !newItem.category) {
      toast.error("Rellena al menos Nombre, Precio y Categoría.");
      return;
    }
    try {
        await api.post('/products/', newItem);
        toast.success(`"${newItem.name}" creado con éxito.`);
        setIsCreating(false);
        setNewItem({ name: '', price: 0, category: '', description: '', is_active: true });
        onProductAction(); // Recarga la lista en App.tsx
    } catch (error) {
        console.error("Error al crear:", error);
        toast.error("Error al crear el producto.");
    }
  };

  // --- LÓGICA DE ACTUALIZACIÓN (UPDATE) ---
  const handleUpdateSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingItem) return;
    try {
        await api.put(`/products/${editingItem.id}`, editingItem);
        toast.success(`"${editingItem.name}" actualizado.`);
        setEditingItem(null);
        onProductAction(); // Recarga la lista en App.tsx
    } catch (error) {
        console.error("Error al actualizar:", error);
        toast.error("Error al actualizar el producto.");
    }
  };

  // --- RENDERIZADO DEL FORMULARIO DE EDICIÓN/CREACIÓN ---
  const renderForm = (item: MenuItem | (Omit<MenuItem, 'id'> & { id?: string }), isNew: boolean) => {
    const data = item;
    const setter = isNew ? setNewItem : setEditingItem;
    const handleSubmit = isNew ? handleCreateSubmit : handleUpdateSubmit;

    return (
      <form onSubmit={handleSubmit} className="p-4 bg-white border border-blue-400 rounded-lg shadow-xl mb-4">
        <h4 className="text-xl font-bold mb-3">{isNew ? 'Nuevo Producto' : `Editar: ${data.name}`}</h4>
        
        <div className="grid grid-cols-2 gap-4">
          <label className="block">
            <span className="text-sm font-medium">Nombre:</span>
            <input 
              type="text" 
              required
              value={data.name} 
              onChange={(e) => setter(prev => ({ ...prev, name: e.target.value }))}
              className="mt-1 block w-full border rounded-md p-2"
            />
          </label>
          <label className="block">
            <span className="text-sm font-medium">Precio ($):</span>
            <input 
              type="number" 
              required
              step="0.01" 
              value={data.price} 
              onChange={(e) => setter(prev => ({ ...prev, price: parseFloat(e.target.value) || 0 }))}
              className="mt-1 block w-full border rounded-md p-2"
            />
          </label>
          <label className="block">
            <span className="text-sm font-medium">Categoría:</span>
            <input 
              type="text" 
              required
              value={data.category} 
              onChange={(e) => setter(prev => ({ ...prev, category: e.target.value }))}
              className="mt-1 block w-full border rounded-md p-2"
            />
          </label>
          <label className="block flex items-center gap-2">
            <input 
              type="checkbox" 
              checked={data.is_active} 
              onChange={(e) => setter(prev => ({ ...prev, is_active: e.target.checked }))}
              className="h-4 w-4 text-blue-600 border-gray-300 rounded"
            />
            <span className="text-sm font-medium">Activo</span>
          </label>
        </div>
        
        <label className="block mt-4">
          <span className="text-sm font-medium">Descripción:</span>
          <textarea
            value={data.description || ''} 
            onChange={(e) => setter(prev => ({ ...prev, description: e.target.value }))}
            className="mt-1 block w-full border rounded-md p-2 min-h-[80px]"
          />
        </label>

        <div className="flex justify-end gap-2 mt-4">
          <button type="button" onClick={() => isNew ? setIsCreating(false) : setEditingItem(null)} className="flex items-center px-4 py-2 bg-slate-300 rounded-lg hover:bg-slate-400">
            <X size={18}/> Cancelar
          </button>
          <button type="submit" className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
            <Save size={18}/> {isNew ? 'Guardar Producto' : 'Actualizar'}
          </button>
        </div>
      </form>
    );
  };

  return (
    <div className="bg-white rounded-xl shadow border overflow-hidden">
      <div className="p-4 bg-slate-100 border-b flex justify-between items-center">
          <h3 className="font-bold text-slate-700">Inventario de Productos ({menuItems.length})</h3>
          <button 
              onClick={() => setIsCreating(true)}
              className="flex items-center gap-1 px-4 py-2 bg-green-500 text-white rounded-lg font-bold hover:bg-green-600 transition"
          >
              <Plus size={18}/> Añadir Nuevo
          </button>
      </div>

      {isCreating && renderForm(newItem, true)}
      {editingItem && renderForm(editingItem, false)}

      <div className="divide-y max-h-[70vh] overflow-y-auto">
          {menuItems.map(item => (
              <div key={item.id} className="p-4 flex justify-between items-center hover:bg-slate-50">
                  {/* Si el ítem está siendo editado, no lo mostramos en la lista normal */}
                  {editingItem?.id === item.id ? null : (
                      <>
                          <div>
                              <div className="font-bold text-slate-800">{item.name} 
                                {item.is_active === false && <span className="ml-2 text-red-500 text-xs">(Inactivo)</span>}
                              </div>
                              <div className="text-xs text-slate-400">{item.category}</div>
                              <p className="text-xs text-slate-500 mt-1">{item.description}</p>
                          </div>
                          <div className="flex items-center gap-4">
                              <div className="font-bold text-slate-600">${Number(item.price).toFixed(2)}</div>
                              <button onClick={() => setEditingItem(item)} className="text-blue-500 hover:text-blue-700 p-2 rounded hover:bg-blue-100 transition"><Edit size={18}/></button>
                              <button onClick={() => handleDelete(item.id)} className="text-red-500 hover:text-red-700 p-2 rounded hover:bg-red-100 transition"><Trash2 size={18}/></button>
                          </div>
                      </>
                  )}
              </div>
          ))}
          {(menuItems.length === 0 && !isCreating) && (
              <div className="p-8 text-center text-slate-400">No hay productos. Añade uno para empezar.</div>
          )}
      </div>
    </div>
  );
};

export default ProductManager;