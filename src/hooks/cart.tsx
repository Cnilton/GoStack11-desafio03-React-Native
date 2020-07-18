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
  increment(id: string): Promise<void>;
  decrement(id: string): Promise<void>;
}

const CartContext = createContext<CartContext | null>(null);

const CartProvider: React.FC = ({ children }) => {
  const [products, setProducts] = useState<Product[]>([]);

  useEffect(() => {
    async function loadProducts(): Promise<void> {
      // TODO LOAD ITEMS FROM ASYNC STORAGE
      const loadedProducts: string | null = await AsyncStorage.getItem(
        'products',
      );
      if (loadedProducts) {
        const parsedProducts: Product[] = JSON.parse(loadedProducts);
        setProducts([...parsedProducts]);
      }
    }

    loadProducts();
  }, []);

  const addToCart = useCallback(
    async (product: Product) => {
      // TODO ADD A NEW ITEM TO THE CARTconst newProduct;
      let isProductedAlreadyAdded = false;
      products.map(productItem => {
        if (productItem.id === product.id) {
          isProductedAlreadyAdded = true;
        }
      });
      if (isProductedAlreadyAdded) {
        const index = products.findIndex(
          productItem => product.id === productItem.id,
        );
        products[index].quantity += 1;
        setProducts([...products]);
        await AsyncStorage.setItem('products', JSON.stringify(products));
      } else {
        const newProduct = product;
        newProduct.quantity = 1;
        setProducts([...products, newProduct]);
        await AsyncStorage.setItem(
          'products',
          JSON.stringify([...products, newProduct]),
        );
      }
    },
    [products, setProducts],
  );

  const increment = useCallback(
    async (id: string) => {
      // TODO INCREMENTS A PRODUCT QUANTITY IN THE CART
      for (let i = 0; i < products.length; i++) {
        if (products[i].id === id) {
          products[i].quantity += 1;
        }
      }

      setProducts([...products]);
      await AsyncStorage.setItem('products', JSON.stringify(products));
    },
    [products, setProducts],
  );

  const decrement = useCallback(
    async (id: string) => {
      // TODO DECREMENTS A PRODUCT QUANTITY IN THE CART
      let deleteIndex = -1;
      for (let i = 0; i < products.length; i++) {
        if (products[i].id === id) {
          if (products[i].quantity == 1) {
            deleteIndex = i;
          } else {
            products[i].quantity -= 1;
          }
        }
      }

      if (deleteIndex >= 0) {
        products.splice(deleteIndex, 1);
      }

      setProducts([...products]);
      await AsyncStorage.setItem('products', JSON.stringify(products));
    },
    [products, setProducts],
  );

  const value = React.useMemo(
    () => ({ addToCart, increment, decrement, products }),
    [addToCart, increment, decrement, products],
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
