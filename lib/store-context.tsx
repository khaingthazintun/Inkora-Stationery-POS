'use client';

import React, {
  createContext,
  useContext,
  useEffect,
  useState,
  useMemo,
  useCallback,
  useRef,
} from 'react';
import {
  Product,
  Category,
  CartItem,
  Order,
  Profile,
  UserRole,
  OrderStatus,
  DashboardStats,
} from './types';
import {
  INITIAL_CATEGORIES,
  INITIAL_PRODUCTS,
  INITIAL_ORDERS,
  DEMO_PROFILES,
} from './initial-data';
import { generateOrderNumber } from './utils';
import { isAdminEmail, setAdminCookie } from './auth';
import { supabase, isSupabaseConfigured } from './supabase/client';

interface StoreContextType {
  isInitialized: boolean;
  isLiveSupabase: boolean;
  supabaseError: string | null;

  // Auth
  currentUser: Profile | null;
  setCurrentUser: (user: Profile | null) => void;
  login: (
    email: string,
    password?: string,
    preferredRole?: UserRole
  ) => Promise<{ success: boolean; role?: UserRole; error?: string }>;
  register: (data: {
    email: string;
    fullName: string;
    password?: string;
    phone?: string;
    address?: string;
  }) => Promise<{ success: boolean; role?: UserRole; error?: string }>;
  logout: () => Promise<void>;
  isAdmin: boolean;

  // Products
  products: Product[];
  categories: Category[];
  addProduct: (product: Omit<Product, 'id' | 'created_at'>) => Promise<{ success: boolean; error?: string }>;
  updateProduct: (id: string, updates: Partial<Product>) => Promise<{ success: boolean; error?: string }>;
  deleteProduct: (id: string) => Promise<{ success: boolean; error?: string }>;
  toggleProductActive: (id: string) => Promise<{ success: boolean; error?: string }>;
  updateProductStock: (id: string, stock: number) => Promise<{ success: boolean; error?: string }>;

  // Categories
  addCategory: (category: Omit<Category, 'id' | 'created_at'>) => Promise<{ success: boolean; error?: string }>;
  updateCategory: (id: string, updates: Partial<Category>) => Promise<{ success: boolean; error?: string }>;
  deleteCategory: (id: string) => Promise<{ success: boolean; error?: string }>;

  // Cart
  cart: CartItem[];
  addToCart: (
    product: Product,
    quantity?: number
  ) => { success: boolean; requireAuth?: boolean; message?: string };
  updateCartQuantity: (productId: string, quantity: number) => void;
  removeFromCart: (productId: string) => void;
  clearCart: () => void;
  cartCount: number;
  cartTotal: number;

  // Orders
  orders: Order[];
  createOrder: (orderData: {
    customer_name: string;
    phone: string;
    delivery_address: string;
    notes?: string;
    payment_method?: 'cod';
  }) => Promise<{ success: boolean; order?: Order; error?: string }>;
  updateOrderStatus: (orderId: string, status: OrderStatus) => Promise<{ success: boolean; error?: string }>;
  getOrderById: (orderId: string) => Order | undefined;

  // Stats
  dashboardStats: DashboardStats;
  reloadFromSupabase: () => Promise<void>;
}

const StoreContext = createContext<StoreContextType | undefined>(undefined);

const STORAGE_KEYS = {
  PRODUCTS: 'inkora_products_v2',
  CATEGORIES: 'inkora_categories_v2',
  ORDERS: 'inkora_orders_v2',
  CART: 'inkora_cart_v2',
  USER: 'inkora_user_v2',
};

export const StoreProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isInitialized, setIsInitialized] = useState(false);
  const [isLiveSupabase, setIsLiveSupabase] = useState(false);
  const [supabaseError, setSupabaseError] = useState<string | null>(null);

  // Guards against overwriting storage on initial mount
  const hasLoadedStorage = useRef(false);

  const [currentUser, setCurrentUser] = useState<Profile | null>(null);
  const [products, setProducts] = useState<Product[]>(INITIAL_PRODUCTS);
  const [categories, setCategories] = useState<Category[]>(INITIAL_CATEGORIES);
  const [orders, setOrders] = useState<Order[]>(INITIAL_ORDERS);
  const [cart, setCart] = useState<CartItem[]>([]);

  // Sync state with Supabase (if tables are accessible)
  const reloadFromSupabase = useCallback(async () => {
    if (!supabase || !isSupabaseConfigured) {
      return;
    }

    try {
      // 1. Fetch Categories
      const { data: catData, error: catError } = await supabase
        .from('categories')
        .select('*')
        .order('name');

      if (!catError && catData && catData.length > 0) {
        const loadedCats = catData.map((c: any) => ({
          id: c.id,
          name: c.name,
          slug: c.slug || c.id,
          description: c.description,
          icon: c.icon,
          is_active: c.is_active ?? true,
          created_at: c.created_at || new Date().toISOString(),
        }));
        setCategories(loadedCats);
        try {
          localStorage.setItem(STORAGE_KEYS.CATEGORIES, JSON.stringify(loadedCats));
        } catch {}
        setIsLiveSupabase(true);
        setSupabaseError(null);
      } else if (catError) {
        setSupabaseError(catError.message);
      }

      // 2. Fetch Products
      const { data: prodData, error: prodError } = await supabase
        .from('products')
        .select('*')
        .order('name');

      if (!prodError && prodData && prodData.length > 0) {
        const loadedProds: Product[] = prodData.map((p: any) => {
          const stockVal = p.stock ?? p.stock_quantity ?? 0;
          return {
            id: p.id,
            category_id: p.category_id,
            name: p.name,
            slug: p.slug || p.id,
            description: p.description || '',
            price: Number(p.price) || 0,
            stock: stockVal,
            stock_quantity: stockVal,
            image_url:
              p.image_url ||
              'https://images.unsplash.com/photo-1583485088034-697b5bc54ccd?auto=format&fit=crop&w=600&q=80',
            is_active: p.is_active ?? true,
            featured: Boolean(p.featured),
            specifications: p.specifications || {},
            created_at: p.created_at || new Date().toISOString(),
            updated_at: p.updated_at,
          };
        });

        // Safely merge with existing local products so we never revert deducted stock on refresh
        setProducts((prev) => {
          const merged = loadedProds.map((lp) => {
            const localMatch = prev.find((p) => p.id === lp.id);
            if (localMatch) {
              const localStock = localMatch.stock ?? localMatch.stock_quantity ?? 0;
              const remoteStock = lp.stock ?? lp.stock_quantity ?? 0;
              // If local stock was decremented from purchase, preserve the decremented value
              const safeStock = Math.min(localStock, remoteStock);
              return {
                ...lp,
                stock: safeStock,
                stock_quantity: safeStock,
              };
            }
            return lp;
          });
          try {
            localStorage.setItem(STORAGE_KEYS.PRODUCTS, JSON.stringify(merged));
          } catch {}
          return merged;
        });

        setIsLiveSupabase(true);
        setSupabaseError(null);
      }

      // 3. Fetch Orders
      const { data: ordData, error: ordError } = await supabase
        .from('orders')
        .select('*, order_items(*)')
        .order('created_at', { ascending: false });

      if (!ordError && ordData && ordData.length > 0) {
        const loadedOrds: Order[] = ordData.map((o: any) => ({
          id: o.id,
          order_number: o.order_number,
          user_id: o.user_id,
          total_amount: Number(o.total_amount) || 0,
          status: (o.status || 'pending').toLowerCase() as OrderStatus,
          customer_name: o.customer_name,
          phone: o.phone,
          delivery_address: o.delivery_address || o.address || '',
          address: o.address || o.delivery_address || '',
          notes: o.notes,
          payment_method: 'cod',
          created_at: o.created_at,
          updated_at: o.updated_at,
          items: (o.order_items || []).map((it: any) => ({
            id: it.id,
            order_id: it.order_id,
            product_id: it.product_id,
            product_name: it.product_name,
            price: Number(it.price) || 0,
            quantity: it.quantity,
            subtotal: Number(it.subtotal) || Number(it.price) * it.quantity,
            image_url: it.image_url,
          })),
        }));

        setOrders((prev) => {
          const remoteIds = new Set(loadedOrds.map((o) => o.id));
          const localOnly = prev.filter((o) => !remoteIds.has(o.id));
          const merged = [...localOnly, ...loadedOrds];
          try {
            localStorage.setItem(STORAGE_KEYS.ORDERS, JSON.stringify(merged));
          } catch {}
          return merged;
        });
      }
    } catch (err: any) {
      console.warn('Supabase fetch note:', err.message);
      setSupabaseError(err.message);
    }
  }, []);

  // 1. Initial Mount: Read localStorage synchronously BEFORE any save effects can run
  useEffect(() => {
    try {
      // Load user
      const storedUser = localStorage.getItem(STORAGE_KEYS.USER);
      if (storedUser) {
        const parsedUser: Profile = JSON.parse(storedUser);
        setCurrentUser(parsedUser);
        const adminCheck = parsedUser.role === 'admin' || isAdminEmail(parsedUser.email);
        setAdminCookie(adminCheck);
      } else {
        setCurrentUser(null);
        setAdminCookie(false);
      }

      // Load products (Crucial: preserves deducted stock across refreshes!)
      const storedProducts = localStorage.getItem(STORAGE_KEYS.PRODUCTS);
      if (storedProducts) {
        const parsed = JSON.parse(storedProducts);
        if (Array.isArray(parsed) && parsed.length > 0) {
          setProducts(parsed);
        }
      } else {
        // First visit: save initial products to storage
        localStorage.setItem(STORAGE_KEYS.PRODUCTS, JSON.stringify(INITIAL_PRODUCTS));
      }

      // Load categories
      const storedCategories = localStorage.getItem(STORAGE_KEYS.CATEGORIES);
      if (storedCategories) {
        const parsed = JSON.parse(storedCategories);
        if (Array.isArray(parsed) && parsed.length > 0) {
          setCategories(parsed);
        }
      } else {
        localStorage.setItem(STORAGE_KEYS.CATEGORIES, JSON.stringify(INITIAL_CATEGORIES));
      }

      // Load orders
      const storedOrders = localStorage.getItem(STORAGE_KEYS.ORDERS);
      if (storedOrders) {
        const parsed = JSON.parse(storedOrders);
        if (Array.isArray(parsed) && parsed.length > 0) {
          setOrders(parsed);
        }
      } else {
        localStorage.setItem(STORAGE_KEYS.ORDERS, JSON.stringify(INITIAL_ORDERS));
      }

      // Load cart
      const storedCart = localStorage.getItem(STORAGE_KEYS.CART);
      if (storedCart) {
        const parsed = JSON.parse(storedCart);
        if (Array.isArray(parsed)) {
          setCart(parsed);
        }
      }
    } catch (e) {
      console.error('Failed to load initial cache:', e);
    } finally {
      // Mark storage loaded so subsequent changes are safely saved
      hasLoadedStorage.current = true;
      setIsInitialized(true);
    }

    // Attempt live Supabase sync
    reloadFromSupabase();
  }, [reloadFromSupabase]);

  // 2. Safe save effects (ONLY fire after initial storage load completes!)
  useEffect(() => {
    if (!hasLoadedStorage.current) return;
    try {
      if (currentUser) {
        localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(currentUser));
        const adminCheck = currentUser.role === 'admin' || isAdminEmail(currentUser.email);
        setAdminCookie(adminCheck);
      } else {
        localStorage.removeItem(STORAGE_KEYS.USER);
        setAdminCookie(false);
      }
    } catch (e) {
      console.error(e);
    }
  }, [currentUser]);



  useEffect(() => {
    if (!hasLoadedStorage.current) return;
    try {
      localStorage.setItem(STORAGE_KEYS.CART, JSON.stringify(cart));
    } catch (e) {
      console.error(e);
    }
  }, [cart]);

  const isAdmin = useMemo(() => {
    if (!currentUser) return false;
    return currentUser.role === 'admin' || isAdminEmail(currentUser.email);
  }, [currentUser]);

  // Auth Handlers
  const login = async (email: string, password?: string, preferredRole?: UserRole) => {
    const cleanEmail = email.trim().toLowerCase();
    const isTargetAdmin = isAdminEmail(cleanEmail) || preferredRole === 'admin';
    const userRole: UserRole = isTargetAdmin ? 'admin' : 'customer';

    // 1. Try Supabase Auth sign in if password provided
    if (supabase && password) {
      try {
        const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
          email: cleanEmail,
          password: password,
        });

        if (!authError && authData.user) {
          const profile: Profile = {
            id: authData.user.id,
            email: cleanEmail,
            full_name: authData.user.user_metadata?.full_name || cleanEmail.split('@')[0],
            role: isTargetAdmin ? 'admin' : ((authData.user.user_metadata?.role as UserRole) || 'customer'),
            created_at: authData.user.created_at,
          };
          setCurrentUser(profile);
          setAdminCookie(isTargetAdmin);
          return { success: true, role: profile.role };
        }
      } catch (err) {
        console.warn('Supabase Auth direct sign-in note, proceeding with demo profile');
      }
    }

    // 2. Demo profile login support (PRD Section 9)
    const existingDemo = DEMO_PROFILES.find((p) => p.email.toLowerCase() === cleanEmail);
    if (existingDemo) {
      const user: Profile = {
        ...existingDemo,
        role: userRole,
      };
      setCurrentUser(user);
      setAdminCookie(isTargetAdmin);
      return { success: true, role: userRole };
    }

    // 3. User login for any email
    const newUser: Profile = {
      id: `user-${Date.now()}`,
      email: cleanEmail,
      full_name: cleanEmail.split('@')[0],
      role: userRole,
      created_at: new Date().toISOString(),
    };
    setCurrentUser(newUser);
    setAdminCookie(isTargetAdmin);
    return { success: true, role: userRole };
  };

  const register = async (data: {
    email: string;
    fullName: string;
    password?: string;
    phone?: string;
    address?: string;
  }) => {
    const cleanEmail = data.email.trim().toLowerCase();
    // Security check: Normal signup must ALWAYS create role = customer (PRD Section 27)
    const userRole: UserRole = isAdminEmail(cleanEmail) ? 'admin' : 'customer';

    if (supabase && data.password) {
      try {
        const { data: authData, error: authErr } = await supabase.auth.signUp({
          email: cleanEmail,
          password: data.password,
          options: {
            data: {
              full_name: data.fullName,
              role: userRole,
            },
          },
        });

        if (!authErr && authData.user) {
          const newUser: Profile = {
            id: authData.user.id,
            email: cleanEmail,
            full_name: data.fullName,
            phone: data.phone,
            address: data.address,
            role: userRole,
            created_at: authData.user.created_at,
          };
          setCurrentUser(newUser);
          setAdminCookie(userRole === 'admin');
          return { success: true, role: userRole };
        }
      } catch (e: any) {
        console.warn('Supabase signUp fallback:', e.message);
      }
    }

    const newUser: Profile = {
      id: `user-${Date.now()}`,
      email: cleanEmail,
      full_name: data.fullName,
      phone: data.phone,
      address: data.address,
      role: userRole,
      created_at: new Date().toISOString(),
    };
    setCurrentUser(newUser);
    setAdminCookie(userRole === 'admin');
    return { success: true, role: userRole };
  };

  const logout = async () => {
    if (supabase) {
      try {
        await supabase.auth.signOut();
      } catch {}
    }
    setCurrentUser(null);
    setAdminCookie(false);
    try {
      localStorage.removeItem(STORAGE_KEYS.USER);
    } catch {}
  };

  // Cart Handlers
  const addToCart = (product: Product, quantity = 1) => {
    if (!currentUser) {
      return {
        success: false,
        requireAuth: true,
        message: 'Please sign in to add items to your cart.',
      };
    }

    const currentStock = product.stock ?? product.stock_quantity ?? 0;
    if (currentStock <= 0) {
      return { success: false, message: 'This stationery item is currently out of stock.' };
    }

    setCart((prev) => {
      const existing = prev.find((item) => item.product_id === product.id);
      let updatedCart: CartItem[];
      if (existing) {
        const newQty = existing.quantity + quantity;
        if (newQty > currentStock) {
          return prev;
        }
        updatedCart = prev.map((item) =>
          item.product_id === product.id ? { ...item, quantity: newQty } : item
        );
      } else {
        updatedCart = [
          ...prev,
          {
            id: `cart-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
            user_id: currentUser.id,
            product_id: product.id,
            product,
            quantity: Math.min(quantity, currentStock),
            created_at: new Date().toISOString(),
          },
        ];
      }
      try {
        localStorage.setItem(STORAGE_KEYS.CART, JSON.stringify(updatedCart));
      } catch {}
      return updatedCart;
    });

    return { success: true };
  };

  const updateCartQuantity = (productId: string, quantity: number) => {
    const product = products.find((p) => p.id === productId);
    const maxStock = product ? (product.stock ?? product.stock_quantity ?? 0) : 999;

    if (quantity <= 0) {
      removeFromCart(productId);
      return;
    }

    const validQty = Math.min(quantity, maxStock);
    setCart((prev) => {
      const nextCart = prev.map((item) =>
        item.product_id === productId ? { ...item, quantity: validQty } : item
      );
      try {
        localStorage.setItem(STORAGE_KEYS.CART, JSON.stringify(nextCart));
      } catch {}
      return nextCart;
    });
  };

  const removeFromCart = (productId: string) => {
    setCart((prev) => {
      const nextCart = prev.filter((item) => item.product_id !== productId);
      try {
        localStorage.setItem(STORAGE_KEYS.CART, JSON.stringify(nextCart));
      } catch {}
      return nextCart;
    });
  };

  const clearCart = () => {
    setCart([]);
    try {
      localStorage.setItem(STORAGE_KEYS.CART, JSON.stringify([]));
    } catch {}
  };

  const cartCount = useMemo(() => {
    return cart.reduce((total, item) => total + item.quantity, 0);
  }, [cart]);

  const cartTotal = useMemo(() => {
    return cart.reduce((total, item) => total + item.product.price * item.quantity, 0);
  }, [cart]);

  // Order Placement & Synchronous Stock Deduction (PRD Section 12, 13, 21)
  const createOrder = async (orderData: {
    customer_name: string;
    phone: string;
    delivery_address: string;
    notes?: string;
    payment_method?: 'cod';
  }) => {
    if (cart.length === 0) {
      return { success: false, error: 'Your cart is empty.' };
    }

    // 1. Stock validation
    for (const item of cart) {
      const prod = products.find((p) => p.id === item.product_id);
      const stock = prod ? (prod.stock ?? prod.stock_quantity ?? 0) : 0;
      if (stock < item.quantity) {
        return {
          success: false,
          error: `Insufficient stock for "${item.product.name}". Available: ${stock}, In Cart: ${item.quantity}`,
        };
      }
    }

    const newOrderNumber = generateOrderNumber();
    const newOrderId = `ord-${Date.now()}`;
    const orderItems = cart.map((item) => ({
      id: `item-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
      order_id: newOrderId,
      product_id: item.product_id,
      product_name: item.product.name,
      price: item.product.price,
      quantity: item.quantity,
      subtotal: item.product.price * item.quantity,
      image_url: item.product.image_url,
    }));

    const finalTotal = cartTotal;

    // 2. Synchronously calculate and write deducted stock to memory & localStorage!
    const updatedProducts = products.map((prod) => {
      const cartMatch = cart.find((c) => c.product_id === prod.id);
      if (cartMatch) {
        const current = prod.stock ?? prod.stock_quantity ?? 0;
        const nextStock = Math.max(0, current - cartMatch.quantity);
        return {
          ...prod,
          stock: nextStock,
          stock_quantity: nextStock,
          updated_at: new Date().toISOString(),
        };
      }
      return prod;
    });

    // Instant synchronous localStorage save ensures page refresh keeps deducted stock!
    setProducts(updatedProducts);
    try {
      localStorage.setItem(STORAGE_KEYS.PRODUCTS, JSON.stringify(updatedProducts));
    } catch {}

    const newOrder: Order = {
      id: newOrderId,
      order_number: newOrderNumber,
      user_id: currentUser?.id || null,
      total_amount: finalTotal,
      status: 'pending',
      customer_name: orderData.customer_name,
      phone: orderData.phone,
      delivery_address: orderData.delivery_address,
      notes: orderData.notes,
      payment_method: 'cod',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      items: orderItems,
    };

    const updatedOrders = [newOrder, ...orders];
    setOrders(updatedOrders);
    try {
      localStorage.setItem(STORAGE_KEYS.ORDERS, JSON.stringify(updatedOrders));
    } catch {}

    clearCart();

    // 3. Sync to Supabase in background
    const sb = supabase;
    if (sb) {
      try {
        // Attempt atomic RPC
        sb.rpc('place_order_atomic', {
          p_user_id: currentUser?.id && currentUser.id.startsWith('user-') ? null : currentUser?.id || null,
          p_order_number: newOrderNumber,
          p_total_amount: finalTotal,
          p_customer_name: orderData.customer_name,
          p_phone: orderData.phone,
          p_delivery_address: orderData.delivery_address,
          p_notes: orderData.notes || '',
          p_payment_method: 'cod',
          p_items: orderItems,
        }).then(({ error: rpcErr }) => {
          if (rpcErr) {
            // Fallback direct product stock update
            cart.forEach((c) => {
              const pMatch = updatedProducts.find((p) => p.id === c.product_id);
              if (pMatch) {
                sb.from('products')
                  .update({
                    stock: pMatch.stock,
                    stock_quantity: pMatch.stock_quantity,
                    updated_at: new Date().toISOString(),
                  })
                  .eq('id', c.product_id);
              }
            });
          }
        });
      } catch (e) {
        console.warn('Supabase order sync note:', e);
      }
    }

    return { success: true, order: newOrder };
  };

  const updateOrderStatus = async (orderId: string, status: OrderStatus) => {
    const updated = orders.map((ord) =>
      ord.id === orderId
        ? { ...ord, status, updated_at: new Date().toISOString() }
        : ord
    );
    setOrders(updated);
    try {
      localStorage.setItem(STORAGE_KEYS.ORDERS, JSON.stringify(updated));
    } catch {}

    if (supabase) {
      try {
        await supabase
          .from('orders')
          .update({ status: status.toLowerCase(), updated_at: new Date().toISOString() })
          .eq('id', orderId);
      } catch {}
    }

    return { success: true };
  };

  const getOrderById = (orderId: string) => {
    return orders.find((o) => o.id === orderId || o.order_number === orderId);
  };

  // Product Management (PRD Section 22)
  const addProduct = async (productData: Omit<Product, 'id' | 'created_at'>) => {
    const newId = `prod-${Date.now()}`;
    const newProd: Product = {
      ...productData,
      id: newId,
      stock: productData.stock ?? productData.stock_quantity ?? 0,
      stock_quantity: productData.stock ?? productData.stock_quantity ?? 0,
      created_at: new Date().toISOString(),
    };

    const updated = [newProd, ...products];
    setProducts(updated);
    try {
      localStorage.setItem(STORAGE_KEYS.PRODUCTS, JSON.stringify(updated));
    } catch {}

    if (supabase) {
      try {
        await supabase.from('products').insert([
          {
            id: newProd.id,
            category_id: newProd.category_id,
            name: newProd.name,
            slug: newProd.slug || newProd.id,
            description: newProd.description,
            price: newProd.price,
            stock: newProd.stock,
            stock_quantity: newProd.stock_quantity,
            image_url: newProd.image_url,
            is_active: newProd.is_active,
            featured: newProd.featured || false,
          },
        ]);
      } catch (err: any) {
        console.warn('Supabase addProduct note:', err.message);
      }
    }

    return { success: true };
  };

  const updateProduct = async (id: string, updates: Partial<Product>) => {
    const stockVal = updates.stock ?? updates.stock_quantity;
    const finalUpdates = {
      ...updates,
      ...(stockVal !== undefined ? { stock: stockVal, stock_quantity: stockVal } : {}),
      updated_at: new Date().toISOString(),
    };

    const updated = products.map((p) => (p.id === id ? { ...p, ...finalUpdates } : p));
    setProducts(updated);
    try {
      localStorage.setItem(STORAGE_KEYS.PRODUCTS, JSON.stringify(updated));
    } catch {}

    if (supabase) {
      try {
        await supabase.from('products').update(finalUpdates).eq('id', id);
      } catch {}
    }

    return { success: true };
  };

  const deleteProduct = async (id: string) => {
    const updated = products.filter((p) => p.id !== id);
    setProducts(updated);
    try {
      localStorage.setItem(STORAGE_KEYS.PRODUCTS, JSON.stringify(updated));
    } catch {}

    if (supabase) {
      try {
        await supabase.from('products').delete().eq('id', id);
      } catch {}
    }

    return { success: true };
  };

  const toggleProductActive = async (id: string) => {
    const prod = products.find((p) => p.id === id);
    if (!prod) return { success: false, error: 'Product not found' };
    return updateProduct(id, { is_active: !prod.is_active });
  };

  const updateProductStock = async (id: string, stock: number) => {
    return updateProduct(id, { stock: Math.max(0, stock), stock_quantity: Math.max(0, stock) });
  };

  // Category Management (PRD Section 23)
  const addCategory = async (categoryData: Omit<Category, 'id' | 'created_at'>) => {
    const newId = `cat-${Date.now()}`;
    const newCat: Category = {
      ...categoryData,
      id: newId,
      created_at: new Date().toISOString(),
    };

    const updated = [...categories, newCat];
    setCategories(updated);
    try {
      localStorage.setItem(STORAGE_KEYS.CATEGORIES, JSON.stringify(updated));
    } catch {}

    if (supabase) {
      try {
        await supabase.from('categories').insert([
          {
            id: newCat.id,
            name: newCat.name,
            slug: newCat.slug,
            description: newCat.description,
            icon: newCat.icon,
            is_active: newCat.is_active,
          },
        ]);
      } catch {}
    }

    return { success: true };
  };

  const updateCategory = async (id: string, updates: Partial<Category>) => {
    const updated = categories.map((c) => (c.id === id ? { ...c, ...updates } : c));
    setCategories(updated);
    try {
      localStorage.setItem(STORAGE_KEYS.CATEGORIES, JSON.stringify(updated));
    } catch {}

    if (supabase) {
      try {
        await supabase.from('categories').update(updates).eq('id', id);
      } catch {}
    }

    return { success: true };
  };

  const deleteCategory = async (id: string) => {
    const updated = categories.filter((c) => c.id !== id);
    setCategories(updated);
    try {
      localStorage.setItem(STORAGE_KEYS.CATEGORIES, JSON.stringify(updated));
    } catch {}

    if (supabase) {
      try {
        await supabase.from('categories').delete().eq('id', id);
      } catch {}
    }

    return { success: true };
  };

  // Dashboard Stats (PRD Section 16)
  const dashboardStats: DashboardStats = useMemo(() => {
    const totalSales = orders.reduce((sum, ord) => sum + ord.total_amount, 0);
    const lowStockCount = products.filter(
      (p) => (p.stock ?? p.stock_quantity ?? 0) <= 10
    ).length;

    return {
      totalSales,
      totalRevenue: totalSales,
      totalOrders: orders.length,
      totalProducts: products.length,
      lowStockCount,
    };
  }, [orders, products]);

  return (
    <StoreContext.Provider
      value={{
        isInitialized,
        isLiveSupabase,
        supabaseError,
        currentUser,
        setCurrentUser,
        login,
        register,
        logout,
        isAdmin,
        products,
        categories,
        addProduct,
        updateProduct,
        deleteProduct,
        toggleProductActive,
        updateProductStock,
        addCategory,
        updateCategory,
        deleteCategory,
        cart,
        addToCart,
        updateCartQuantity,
        removeFromCart,
        clearCart,
        cartCount,
        cartTotal,
        orders,
        createOrder,
        updateOrderStatus,
        getOrderById,
        dashboardStats,
        reloadFromSupabase,
      }}
    >
      {children}
    </StoreContext.Provider>
  );
};

export const useStore = () => {
  const context = useContext(StoreContext);
  if (!context) {
    throw new Error('useStore must be used within a StoreProvider');
  }
  return context;
};
