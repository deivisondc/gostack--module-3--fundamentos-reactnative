import React, {
  createContext,
  useState,
  useCallback,
  useContext,
  useEffect,
} from 'react';

import AsyncStorage from '@react-native-community/async-storage';

interface Product {
  id: string;
  title: string;
  image_url: string;
  price: number;
  quantity: number;
}

interface CartContext {
  products: Product[];
  addToCart(item: Omit<Product, 'quantity'>): void;
  increment(id: string): void;
  decrement(id: string): void;
}

const CartContext = createContext<CartContext | null>(null);

const CartProvider: React.FC = ({ children }) => {
  const [products, setProducts] = useState<Product[]>([]);

  useEffect(() => {
    async function loadProducts(): Promise<void> {
      const productsJSON = await AsyncStorage.getItem(
        '@Desafio-GoStack:Products',
      );

      if (productsJSON) {
        setProducts(JSON.parse(productsJSON));
      }
    }

    loadProducts();
  }, []);

  const addToCart = useCallback(
    async product => {
      const productsUpdated = products.map(productMap => {
        if (productMap.id === product.id) {
          return {
            ...productMap,
            quantity: productMap.quantity + 1,
          };
        }

        return productMap;
      });

      if (productsUpdated.findIndex(f => f.id === product.id) === -1) {
        productsUpdated.push({
          ...product,
          quantity: 1,
        });
      }

      setProducts(productsUpdated);

      await AsyncStorage.setItem(
        '@Desafio-GoStack:Products',
        JSON.stringify(productsUpdated),
      );
    },
    [products],
  );

  const increment = useCallback(
    async id => {
      const productsUpdated = products.map(product => {
        if (product.id === id) {
          return {
            ...product,
            quantity: product.quantity + 1,
          };
        }

        return product;
      });

      setProducts(productsUpdated);

      await AsyncStorage.setItem(
        '@Desafio-GoStack:Products',
        JSON.stringify(productsUpdated),
      );
    },
    [products],
  );

  const decrement = useCallback(
    async id => {
      const productIndex = products.findIndex(product => product.id === id);

      let allProducts = products;
      if (productIndex > -1 && products[productIndex].quantity === 1) {
        allProducts = products.filter(product => product.id !== id);
      }

      const productsUpdated = allProducts.map(product => {
        if (product.id === id) {
          return {
            ...product,
            quantity: product.quantity - 1,
          };
        }

        return product;
      });

      setProducts(productsUpdated);

      await AsyncStorage.setItem(
        '@Desafio-GoStack:Products',
        JSON.stringify(productsUpdated),
      );
    },
    [products],
  );

  const value = React.useMemo(
    () => ({ addToCart, increment, decrement, products }),
    [products, addToCart, increment, decrement],
  );

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
};

function useCart(): CartContext {
  const context = useContext(CartContext);

  if (!context) {
    throw new Error(`useCart must be used within a CartProvider`);
  }

  return context;
}

export { CartProvider, useCart };
