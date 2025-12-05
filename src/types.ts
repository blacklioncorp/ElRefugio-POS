// src/types.ts

// Enums (Importante: Vite necesita que estos tengan 'export')
export enum OrderStatus {
  PENDING = 'PENDING',
  COOKING = 'COOKING',
  READY = 'READY',
  OUT_FOR_DELIVERY = 'OUT_FOR_DELIVERY',
  DELIVERED = 'DELIVERED',
  PAID = 'PAID',
  CANCELLED = 'CANCELLED'
}

// Types
export type OrderType = 'DINE_IN' | 'DELIVERY';
export type UserRole = 'WAITER' | 'COOK' | 'ADMIN';
export type AppView = 'WAITER' | 'KITCHEN' | 'DELIVERY' | 'ADMIN';

// Interfaces
export interface User {
  username: string;
  role: UserRole;
}

export interface CustomerDetails {
  name: string;
  address: string;
  phone: string;
}

export interface MenuItem {
  id: string;
  categoryId: string;
  name: string;
  description: string;
  price: number;
  imageUrl?: string;
}

export interface MenuCategory {
  id: string;
  name: string;
  icon: string;
}

export interface OrderItem {
  menuItem: MenuItem;
  quantity: number;
  notes?: string;
}

export interface Order {
  id: string;
  type: OrderType;
  tableId?: string;
  customer?: CustomerDetails;
  items: OrderItem[];
  status: OrderStatus;
  timestamp: number;
  completedTimestamp?: number;
  dateStr: string;
  total: number;
}

export interface Table {
  id: string;
  number: number;
  isOccupied: boolean;
}