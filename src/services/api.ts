import { MenuItem, Order } from '../types';

const API_URL = 'https://el-refugio-api-server.onrender.com';
export const api = {
  // 1. Obtener Productos
  getProducts: async (): Promise<MenuItem[]> => {
    try {
      const response = await fetch(`${API_URL}/products/`);
      if (!response.ok) throw new Error('Error al conectar con servidor');
      const data = await response.json();
      
      return data.map((p: any) => ({
        id: p.id.toString(),
        name: p.name,
        price: p.price,
        categoryId: p.category,
        description: "Deliciosa opción del menú",
        imageUrl: "" 
      }));
    } catch (error) {
      console.error("Fallo de conexión (Productos):", error);
      return [];
    }
  },

  // 2. Obtener Pedidos (¡NUEVO!)
  getOrders: async (): Promise<Order[]> => {
    try {
      const response = await fetch(`${API_URL}/orders/`);
      if (!response.ok) return [];
      const data = await response.json();

      // Transformar de Python a React
      return data.map((o: any) => ({
        id: o.id.toString(),
        tableId: o.table_id, // Python usa guión bajo, React usa camelCase
        type: o.table_id === 'DOMICILIO' ? 'DELIVERY' : 'DINE_IN',
        status: o.status,
        total: o.total,
        timestamp: Date.now(), // En un sistema real, Python debería enviar esto
        items: o.items.map((i: any) => ({
           menuItem: { name: "Item", price: 0 }, // Simplificado para visualizar rápido
           quantity: i.quantity,
           notes: i.notes
        }))
      }));
    } catch (error) {
      console.error("Fallo de conexión (Pedidos):", error);
      return [];
    }
  },

  // 3. Crear Orden
  createOrder: async (order: any) => {
    const payload = {
      table_id: order.tableId || "DOMICILIO",
      items: order.items.map((i: any) => ({
        product_id: parseInt(i.menuItem.id),
        quantity: i.quantity,
        notes: i.notes || ""
      }))
    };
    
    const response = await fetch(`${API_URL}/orders/`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });
    return await response.json();
  }
};