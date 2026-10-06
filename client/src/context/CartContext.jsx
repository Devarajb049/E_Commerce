import React, { createContext, useContext, useState, useEffect, useMemo, useCallback } from 'react';
import { useToast } from './ToastContext';

const CartContext = createContext(null);

const STORAGE_KEY = 'clickcart_cart_v1';
const TAX_RATE = 0.18; // 18% GST

export const CartProvider = ({ children }) => {
  const { success, error, info } = useToast();

  // Initialize cart from localStorage if present
  const [items, setItems] = useState(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      return saved ? JSON.parse(saved) : [];
    } catch (err) {
      console.warn('Failed to parse saved cart items from storage:', err);
      return [];
    }
  });

  // Save to localStorage whenever cart changes
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
    } catch (err) {
      console.warn('Failed to persist cart items to storage:', err);
    }
  }, [items]);

  // Add product to cart with stock validation
  const addToCart = useCallback((product, quantity = 1) => {
    const qtyToAdd = Math.max(1, parseInt(quantity, 10) || 1);

    if (product.stock_quantity <= 0) {
      error(`'${product.product_name}' is currently out of stock.`);
      return false;
    }

    setItems((prevItems) => {
      const existingIndex = prevItems.findIndex((item) => item.product_id === product.product_id);

      if (existingIndex > -1) {
        const currentQty = prevItems[existingIndex].quantity;
        const newQty = currentQty + qtyToAdd;

        if (newQty > product.stock_quantity) {
          error(`Only ${product.stock_quantity} units available in stock.`);
          return prevItems;
        }

        const updated = [...prevItems];
        updated[existingIndex] = {
          ...updated[existingIndex],
          quantity: newQty
        };
        success(`Updated quantity for '${product.product_name}' (${newQty})`);
        return updated;
      } else {
        if (qtyToAdd > product.stock_quantity) {
          error(`Only ${product.stock_quantity} units available in stock.`);
          return prevItems;
        }

        success(`Added '${product.product_name}' to your ClickCart!`);
        return [
          ...prevItems,
          {
            product_id: product.product_id,
            product_name: product.product_name,
            price: parseFloat(product.price),
            stock_quantity: product.stock_quantity,
            image_url: product.image_url,
            category_name: product.category_name,
            quantity: qtyToAdd
          }
        ];
      }
    });

    return true;
  }, [success, error]);

  // Remove specific item from cart
  const removeFromCart = useCallback((productId) => {
    setItems((prevItems) => {
      const itemToRemove = prevItems.find((item) => item.product_id === productId);
      if (itemToRemove) {
        info(`Removed '${itemToRemove.product_name}' from cart.`);
      }
      return prevItems.filter((item) => item.product_id !== productId);
    });
  }, [info]);

  // Increase item quantity by 1
  const increaseQuantity = useCallback((productId) => {
    setItems((prevItems) =>
      prevItems.map((item) => {
        if (item.product_id === productId) {
          if (item.quantity + 1 > item.stock_quantity) {
            error(`Maximum available stock reached (${item.stock_quantity}).`);
            return item;
          }
          return { ...item, quantity: item.quantity + 1 };
        }
        return item;
      })
    );
  }, [error]);

  // Decrease item quantity by 1
  const decreaseQuantity = useCallback((productId) => {
    setItems((prevItems) =>
      prevItems.reduce((acc, item) => {
        if (item.product_id === productId) {
          if (item.quantity > 1) {
            acc.push({ ...item, quantity: item.quantity - 1 });
          } else {
            info(`Removed '${item.product_name}' from cart.`);
          }
        } else {
          acc.push(item);
        }
        return acc;
      }, [])
    );
  }, [info]);

  // Clear entire cart
  const clearCart = useCallback(() => {
    setItems([]);
    info('Cart has been cleared.');
  }, [info]);

  // Calculations using array reduce
  const subtotal = useMemo(() => {
    return items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
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
