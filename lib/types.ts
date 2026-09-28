export type UserRole = 'customer' | 'admin';

export interface Profile {
  id: string;
  email: string;
  full_name: string;
  phone?: string;
  address?: string;
  role: UserRole;
  created_at: string;
  updated_at?: string;
}

export interface Category {
  id: string;
  name: string;
  slug: string;
  description?: string;
  icon?: string;
  is_active: boolean;
  created_at: string;
}

export interface Product {
  id: string;
  category_id: string;
  name: string;
  slug?: string;
  description: string;
  price: number; // in MMK
  stock: number;
  stock_quantity: number;
  image_url: string;
  is_active: boolean;
  featured?: boolean;
  specifications?: Record<string, string>;
  created_at: string;
  updated_at?: string;
}

export interface CartItem {
  id: string;
  user_id?: string;
  product_id: string;
  product: Product;
  quantity: number;
  created_at?: string;
}

export type OrderStatus = 'pending' | 'processing' | 'completed' | 'cancelled';

export interface OrderItem {
  id: string;
  order_id: string;
  product_id: string;
  product_name: string;
  price: number;
  quantity: number;
  subtotal: number;
  image_url?: string;
}

export interface Order {
  id: string;
  order_number: string;
  user_id?: string | null;
  total_amount: number;
  status: OrderStatus;
  customer_name: string;
  phone: string;
  delivery_address: string;
  address?: string;
  notes?: string;
  payment_method: 'cod';
  created_at: string;
  updated_at?: string;
  items?: OrderItem[];
}

export interface DashboardStats {
  totalSales: number;
  totalOrders: number;
  totalProducts: number;
  lowStockCount: number;
  totalRevenue: number;
}
