import React, { createContext, useContext, useState, useEffect, useMemo, useCallback, useRef } from 'react';
import { useAuth } from './AuthContext';
import { useToast } from './ToastContext';
import api from '../services/api';

const CartContext = createContext(null);

export const GUEST_CART_STORAGE_KEY = 'clickcart_guest_cart';
const TAX_RATE = 0.18; // 18% GST

export const CartProvider = ({ children }) => {
  const { isAuthenticated } = useAuth();
  const { success, error, info } = useToast();

  // 1. Guest items loaded from localStorage
  const [guestItems, setGuestItems] = useState(() => {
    try {
      const saved = localStorage.getItem(GUEST_CART_STORAGE_KEY);
      return saved ? JSON.parse(saved) : [];
    } catch (err) {
      console.warn('Failed to parse guest cart from localStorage:', err);
      return [];
    }
  });

  // 2. Authenticated user server items
  const [serverItems, setServerItems] = useState([]);
  const [isLoadingServerCart, setIsLoadingServerCart] = useState(false);
  const isMergingRef = useRef(false);

  // Synchronize guest items to localStorage whenever changed
  useEffect(() => {
    if (!isAuthenticated) {
      try {
        localStorage.setItem(GUEST_CART_STORAGE_KEY, JSON.stringify(guestItems));
      } catch (err) {
        console.warn('Failed to save guest cart to localStorage:', err);
      }
    }
  }, [guestItems, isAuthenticated]);

  // Fetch server cart for authenticated user
  const fetchServerCart = useCallback(async () => {
    try {
      setIsLoadingServerCart(true);
      const res = await api.getCart();
      if (res.success && res.data) {
        const fetched = res.data.items || [];
        setServerItems(fetched);
        return fetched;
      }
    } catch (err) {
      console.error('Failed to fetch server cart:', err);
    } finally {
      setIsLoadingServerCart(false);
    }
    return [];
  }, []);

  // Merge guest cart after authentication (Rule #6)
  const mergeGuestCart = useCallback(async () => {
    if (isMergingRef.current) return;
    isMergingRef.current = true;

    try {
      const stored = localStorage.getItem(GUEST_CART_STORAGE_KEY);
      const localGuestItems = stored ? JSON.parse(stored) : [];

      if (localGuestItems.length > 0) {
        const payload = localGuestItems.map((item) => ({
          productId: item.product_id,
          product_id: item.product_id,
          quantity: item.quantity
        }));

        const res = await api.mergeCart(payload);

        if (res.success && res.data) {
          // Clear guest cart ONLY after merge succeeds (Rule #6)
          localStorage.removeItem(GUEST_CART_STORAGE_KEY);
          setGuestItems([]);
          setServerItems(res.data.items || []);

          if (res.data.adjustments && res.data.adjustments.length > 0) {
            info('Some item quantities were adjusted to match current catalog stock.');
          } else {
            success('Your cart items have been synced to your account.');
          }
          return res.data.items;
        }
      } else {
        // No guest items to merge; simply fetch user's existing cart from server
        return await fetchServerCart();
      }
    } catch (err) {
      console.error('Cart merge error:', err);
      // Fallback: fetch existing server cart without discarding local guest cart
      await fetchServerCart();
    } finally {
      isMergingRef.current = false;
    }
  }, [fetchServerCart, success, info]);

  // Sync server cart whenever authentication state changes
  useEffect(() => {
    if (isAuthenticated) {
      mergeGuestCart();
    } else {
      setServerItems([]);
      try {
        const saved = localStorage.getItem(GUEST_CART_STORAGE_KEY);
        setGuestItems(saved ? JSON.parse(saved) : []);
      } catch {
        setGuestItems([]);
      }
    }
  }, [isAuthenticated, mergeGuestCart]);

  // Current active items based on authentication state
  const items = useMemo(() => {
    return isAuthenticated ? serverItems : guestItems;
  }, [isAuthenticated, serverItems, guestItems]);

  // Add to cart (Guest: localStorage | Authenticated: Server API)
  const addToCart = useCallback(
    async (product, quantity = 1) => {
      const qtyToAdd = Math.max(1, parseInt(quantity, 10) || 1);
      const pId = parseInt(product.product_id || product.id, 10);
      const stock = parseInt(product.stock_quantity ?? product.stock ?? 0, 10);

      if (stock <= 0) {
        error(`'${product.product_name || product.name}' is currently out of stock.`);
        return false;
      }

      if (!isAuthenticated) {
        // Guest shopping: LocalStorage persistence
        setGuestItems((prevItems) => {
          const existingIndex = prevItems.findIndex((item) => item.product_id === pId);

          if (existingIndex > -1) {
            const currentQty = prevItems[existingIndex].quantity;
            const newQty = currentQty + qtyToAdd;

            if (newQty > stock) {
              error(`Only ${stock} units available in stock.`);
              return prevItems;
            }

            const updated = [...prevItems];
            updated[existingIndex] = {
              ...updated[existingIndex],
              quantity: newQty
            };
            success(`Updated quantity for '${product.product_name || product.name}' (${newQty})`);
            return updated;
          } else {
            if (qtyToAdd > stock) {
              error(`Only ${stock} units available in stock.`);
              return prevItems;
            }

            success(`Added '${product.product_name || product.name}' to your cart!`);
            return [
              ...prevItems,
              {
                product_id: pId,
                product_name: product.product_name || product.name,
                name: product.product_name || product.name,
                price: parseFloat(product.price),
                original_price: product.original_price ? parseFloat(product.original_price) : null,
                stock_quantity: stock,
                stock: stock,
                image_url: product.image_url || product.image,
                image: product.image_url || product.image,
                category_name: product.category_name,
                quantity: qtyToAdd
              }
            ];
          }
        });
        return true;
      } else {
        // Authenticated user: Server-side API persistence
        try {
          const res = await api.addToCart(pId, qtyToAdd);
          if (res.success) {
            success(res.message || `Added '${product.product_name || product.name}' to cart!`);
            await fetchServerCart();
            return true;
          }
        } catch (err) {
          error(err.message || 'Could not add product to cart.');
          return false;
        }
      }
    },
    [isAuthenticated, fetchServerCart, success, error]
  );

  // Increase quantity by 1
  const increaseQuantity = useCallback(
    async (productId) => {
      const pId = parseInt(productId, 10);

      if (!isAuthenticated) {
        setGuestItems((prevItems) =>
          prevItems.map((item) => {
            if (item.product_id === pId) {
              const maxStock = item.stock_quantity ?? item.stock ?? 99;
              if (item.quantity + 1 > maxStock) {
                error(`Maximum available stock reached (${maxStock}).`);
                return item;
              }
              return { ...item, quantity: item.quantity + 1 };
            }
            return item;
          })
        );
      } else {
        const item = serverItems.find((i) => i.product_id === pId);
        if (!item) return;
        const maxStock = item.stock_quantity ?? item.stock ?? 99;
        if (item.quantity + 1 > maxStock) {
          error(`Maximum available stock reached (${maxStock}).`);
          return;
        }

        try {
          await api.updateCartItem(item.cart_item_id || item.id, item.quantity + 1);
          await fetchServerCart();
        } catch (err) {
          error(err.message || 'Failed to update item quantity.');
        }
      }
    },
    [isAuthenticated, serverItems, fetchServerCart, error]
  );

  // Decrease quantity by 1
  const decreaseQuantity = useCallback(
    async (productId) => {
      const pId = parseInt(productId, 10);

      if (!isAuthenticated) {
        setGuestItems((prevItems) =>
          prevItems.reduce((acc, item) => {
            if (item.product_id === pId) {
              if (item.quantity > 1) {
                acc.push({ ...item, quantity: item.quantity - 1 });
              } else {
                info(`Removed '${item.product_name || item.name}' from cart.`);
              }
            } else {
              acc.push(item);
            }
            return acc;
          }, [])
        );
      } else {
        const item = serverItems.find((i) => i.product_id === pId);
        if (!item) return;

        try {
          if (item.quantity > 1) {
            await api.updateCartItem(item.cart_item_id || item.id, item.quantity - 1);
          } else {
            await api.removeCartItem(item.cart_item_id || item.id);
            info(`Removed '${item.product_name || item.name}' from cart.`);
          }
          await fetchServerCart();
        } catch (err) {
          error(err.message || 'Failed to update item quantity.');
        }
      }
    },
    [isAuthenticated, serverItems, fetchServerCart, info, error]
  );

  // Remove specific item from cart
  const removeFromCart = useCallback(
    async (productId) => {
      const pId = parseInt(productId, 10);

      if (!isAuthenticated) {
        setGuestItems((prevItems) => {
          const itemToRemove = prevItems.find((item) => item.product_id === pId);
          if (itemToRemove) {
            info(`Removed '${itemToRemove.product_name || itemToRemove.name}' from cart.`);
          }
          return prevItems.filter((item) => item.product_id !== pId);
        });
      } else {
        const item = serverItems.find((i) => i.product_id === pId);
        if (!item) return;

        try {
          await api.removeCartItem(item.cart_item_id || item.id);
          info(`Removed '${item.product_name || item.name}' from cart.`);
          await fetchServerCart();
        } catch (err) {
          error(err.message || 'Failed to remove item from cart.');
        }
      }
    },
    [isAuthenticated, serverItems, fetchServerCart, info, error]
  );

  // Clear entire cart
  const clearCart = useCallback(async () => {
    if (!isAuthenticated) {
      setGuestItems([]);
      localStorage.removeItem(GUEST_CART_STORAGE_KEY);
      info('Cart has been cleared.');
    } else {
      try {
        await api.clearCart();
        setServerItems([]);
        info('Cart has been cleared.');
      } catch (err) {
        error(err.message || 'Failed to clear cart.');
      }
    }
  }, [isAuthenticated, info, error]);

  // Derived financial calculations
  const subtotal = useMemo(() => {
    return items.reduce((sum, item) => sum + item.price * item.quantity, 0);
  }, [items]);

  const tax = useMemo(() => {
    return Math.round(subtotal * TAX_RATE * 100) / 100;
  }, [subtotal]);

  const total = useMemo(() => {
    return Math.round((subtotal + tax) * 100) / 100;
  }, [subtotal, tax]);

  const totalItemsCount = useMemo(() => {
    return items.reduce((count, item) => count + item.quantity, 0);
  }, [items]);

  return (
    <CartContext.Provider
      value={{
        items,
        addToCart,
        removeFromCart,
        increaseQuantity,
        decreaseQuantity,
        clearCart,
        mergeGuestCart,
        fetchServerCart,
        isLoadingServerCart,
        subtotal,
        tax,
        total,
        totalItemsCount,
        taxRate: TAX_RATE
      }}
    >
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
};

export default CartContext;
