// src/types.ts

// Definición estricta de Roles
export type UserRole = 'WAITER' | 'KITCHEN' | 'ADMIN' | 'DELIVERY'; 

export interface User {
  username: string;
  role: UserRole;
}

export type AppView = 'WAITER' | 'KITCHEN' | 'ADMIN' | 'DELIVERY';

export interface MenuCategory {
  id: string;
  name: string;
  icon: string;
}

export interface MenuItem {
  id: string; // Puede ser número convertido a string
  name: string;
  price: number;
  category: string; // Coincide con la API de Python
  description?: string;
  imageUrl?: string;
  is_active?: boolean;
  // Soporte legacy para el frontend viejo
  categoryId?: string; 
}

export interface OrderItem {
  menuItem: MenuItem;
  quantity: number;
  note?: string;       // <--- NUEVO: Anotación del mesero
  extraCharge?: number; // <--- NUEVO: Cargo extra por personalización
}

// Enum para estados de orden (Mejor que strings sueltos)
export enum OrderStatus {
  PENDING = 'PENDING',
  READY = 'READY',
  DELIVERED = 'DELIVERED',
  CANCELLED = 'CANCELLED',
  PAID = 'PAID'
}

export interface Order {
  id: any; // Flexible para aceptar strings o numbers
  type: 'DINE_IN' | 'TAKE_AWAY' | 'DELIVERY';
  tableId?: string;
  items: OrderItem[];
  status: OrderStatus | string; // Flexible para recibir de API
  timestamp: number;
  dateStr?: string;
  total?: number;
}

export interface Table {
  id: string;
  number: number;
  isOccupied: boolean;
}