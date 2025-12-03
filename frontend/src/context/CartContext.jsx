import { createContext, useState, useContext, useEffect } from 'react';

const CartContext = createContext();

export const CartProvider = ({ children }) => {
  // Load cart from localStorage on mount
  const [cartItems, setCartItems] = useState(() => {
    const savedCart = localStorage.getItem('cart');
    return savedCart ? JSON.parse(savedCart) : [];
  });

  // Save cart to localStorage whenever it changes
  useEffect(() => {
    localStorage.setItem('cart', JSON.stringify(cartItems));
  }, [cartItems]);

  // Add item to cart with stock validation
  const addToCart = (product) => {
    setCartItems((prevItems) => {
      // Check if item already exists in cart
      const existingItem = prevItems.find(item => item._id === product._id);
      
      if (existingItem) {
        // Check if adding more would exceed stock
        const currentQuantity = existingItem.quantity;
        const productStock = product.stock || 0;
        
        if (currentQuantity >= productStock) {
          // Can't add more, return existing items
          return prevItems;
        }
        
        // Increase quantity if within stock limits
        return prevItems.map(item =>
          item._id === product._id
            ? { ...item, quantity: item.quantity + 1 }
            : item
        );
      } else {
        // Check if product is in stock before adding
        if (product.stock === 0) {
          return prevItems;
        }
        
        // Add new item with quantity 1 and include stock info
        return [...prevItems, { 
          ...product, 
          quantity: 1,
          maxStock: product.stock // Store max stock for validation
        }];
      }
    });
  };

  // Remove item from cart
  const removeFromCart = (productId) => {
    setCartItems((prevItems) =>
      prevItems.filter(item => item._id !== productId)
    );
  };

  // Update item quantity with stock validation
  const updateQuantity = (productId, quantity) => {
    if (quantity <= 0) {
      removeFromCart(productId);
      return;
    }

    setCartItems((prevItems) =>
      prevItems.map(item => {
        if (item._id === productId) {
          // Get max stock (either from stored maxStock or product stock)
          const maxStock = item.maxStock || item.stock || 0;
          // Ensure quantity doesn't exceed stock
          const finalQuantity = Math.min(quantity, maxStock);
          
          return { ...item, quantity: finalQuantity };
        }
        return item;
      })
    );
  };

  // Clear entire cart
  const clearCart = () => {
    setCartItems([]);
  };

  // Calculate total price
  const getCartTotal = () => {
    return cartItems.reduce((total, item) => total + (item.price * item.quantity), 0);
  };

  // Get total number of items
  const getCartCount = () => {
    return cartItems.reduce((count, item) => count + item.quantity, 0);
  };

  // Check if an item has reached max stock in cart
  const isMaxQuantity = (productId) => {
    const item = cartItems.find(item => item._id === productId);
    if (!item) return false;
    
    const maxStock = item.maxStock || item.stock || 0;
    return item.quantity >= maxStock;
  };

  // Get stock left for a product (considering what's already in cart)
  const getStockLeft = (productId) => {
    const item = cartItems.find(item => item._id === productId);
    if (!item) return null;
    
    const maxStock = item.maxStock || item.stock || 0;
    return Math.max(0, maxStock - item.quantity);
  };

  // Check if item is in cart
  const isInCart = (productId) => {
    return cartItems.some(item => item._id === productId);
  };

  // Get quantity of specific item in cart
  const getItemQuantity = (productId) => {
    const item = cartItems.find(item => item._id === productId);
    return item ? item.quantity : 0;
  };

  return (
    <CartContext.Provider
      value={{
        cartItems,
        addToCart,
        removeFromCart,
        updateQuantity,
        clearCart,
        getCartTotal,
        getCartCount,
        isMaxQuantity,
        getStockLeft,
        isInCart,
        getItemQuantity
      }}
    >
      {children}
    </CartContext.Provider>
  );
};

// Custom hook to use cart context
export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within CartProvider');
  }
  return context;
};