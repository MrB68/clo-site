import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { supabase } from '../../lib/supabase';
export interface Product {
  id: string;
  name: string;
  price: number;
  originalPrice?: number;
  category: string;
  style?: "minimal" | "extravagant";
  image?: string;
  images?: string[];
  description: string;
  sizes: string[];
  colors: string[];
  isNew?: boolean;
  stock?: number;
  featured?: boolean;
  rating?: number;
  reviews?: number;
  tags?: string[];
  material?: string;
  careInstructions?: string;
  createdAt?: string;
  updatedAt?: string;
  sales_count?: number;
  slug?: string;
}

interface ProductsContextType {
  products: Product[];
  refreshProducts: () => void;
}

const ProductsContext = createContext<ProductsContextType | undefined>(undefined);

// Default products for production: empty array
const defaultProducts: Product[] = [];

// Load products from localStorage if available (admin updates), otherwise use defaults
const loadProducts = (): Product[] => {
  try {
    const savedProducts = localStorage.getItem("mainProducts");
    if (savedProducts) {
      const parsedProducts = JSON.parse(savedProducts);
      // Map admin-saved products to main app format
      return parsedProducts.map((p: any) => ({
        ...p,
        // Prefer the first admin-managed image when available
        image: p.images && p.images.length > 0 ? p.images[0] : (p.image || ''),
        // Set defaults for admin fields if not present
        stock: p.stock ?? 10,
        featured: p.featured ?? false,
        rating: p.rating ?? 0,
        reviews: p.reviews ?? 0,
        tags: p.tags ?? [],
        material: p.material ?? '',
        careInstructions: p.careInstructions ?? '',
        createdAt: p.createdAt ?? new Date().toISOString(),
        updatedAt: p.updatedAt ?? new Date().toISOString(),
        // Ensure category is valid
        category: p.category || 'women',
        style: p.style || 'minimal'
      }));
    }
  } catch (error) {
    console.warn("Failed to load products from localStorage:", error);
  }

  return defaultProducts;
};

export const ProductsProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [products, setProducts] = useState<Product[]>([]);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const { data, error } = await supabase
          .from('products')
          .select('*');

        if (error || !data) {
          // Fallback to local/default products to avoid blank UI
          const fallback = loadProducts();
          setProducts(fallback);
        } else {
          setProducts((data || []).map((p: any) => ({
            ...p,
            image: p?.image || p?.images?.[0] || "",
            images: Array.isArray(p?.images) ? p.images : (p?.image ? [p.image] : []),
            sizes: p?.sizes || [],
            colors: p?.colors || [],
            description: p?.description || "",
            price: p?.price ?? 0,
            originalPrice: p?.original_price ?? null,
            category: p?.category || "women",
            style: p?.style || "minimal",
            stock: p?.stock ?? 10,
            featured: p?.featured ?? false,
            rating: p?.rating ?? 0,
            reviews: p?.reviews ?? 0,
            tags: p?.tags ?? [],
            material: p?.material ?? "",
            careInstructions: p?.care_instructions ?? "",
            createdAt: p?.created_at ?? new Date().toISOString(),
            updatedAt: p?.updated_at ?? new Date().toISOString(),
            sales_count: p?.sales_count ?? 0,
            slug: p?.slug || p?.id,
          })));
        }
      } catch (e) {
        const fallback = loadProducts();
        setProducts(fallback);
      }
    };

    fetchProducts();
  }, []);

  // 🔥 REALTIME: listen for product updates (stock changes, edits, etc.)
  useEffect(() => {
    const channel = supabase
      .channel("products-realtime")
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "products",
        },
        (payload) => {
          const newProduct = payload.new as any;
          const oldProduct = payload.old as any;

          setProducts((prev) => {
            // DELETE
            if (payload.eventType === "DELETE") {
              return prev.filter((p) => p.id !== oldProduct.id);
            }

            // UPDATE
            if (payload.eventType === "UPDATE") {
              return prev.map((p) =>
                p.id === newProduct.id
                  ? {
                      ...p,
                      ...newProduct,
                      image: newProduct?.image || newProduct?.images?.[0] || "",
                      images: Array.isArray(newProduct?.images)
                        ? newProduct.images
                        : newProduct?.image
                        ? [newProduct.image]
                        : [],
                      sizes: newProduct?.sizes || [],
                      colors: newProduct?.colors || [],
                      stock: newProduct?.stock ?? p.stock,
                      updatedAt: newProduct?.updated_at ?? new Date().toISOString(),
                    }
                  : p
              );
            }

            // INSERT
            if (payload.eventType === "INSERT") {
              return [
                {
                  ...newProduct,
                  image: newProduct?.image || newProduct?.images?.[0] || "",
                  images: Array.isArray(newProduct?.images)
                    ? newProduct.images
                    : newProduct?.image
                    ? [newProduct.image]
                    : [],
                  sizes: newProduct?.sizes || [],
                  colors: newProduct?.colors || [],
                  description: newProduct?.description || "",
                  price: newProduct?.price ?? 0,
                  originalPrice: newProduct?.original_price ?? null,
                  category: newProduct?.category || "women",
                  style: newProduct?.style || "minimal",
                  stock: newProduct?.stock ?? 10,
                  featured: newProduct?.featured ?? false,
                  rating: newProduct?.rating ?? 0,
                  reviews: newProduct?.reviews ?? 0,
                  tags: newProduct?.tags ?? [],
                  material: newProduct?.material ?? "",
                  careInstructions: newProduct?.care_instructions ?? "",
                  createdAt: newProduct?.created_at ?? new Date().toISOString(),
                  updatedAt: newProduct?.updated_at ?? new Date().toISOString(),
                  sales_count: newProduct?.sales_count ?? 0,
                  slug: newProduct?.slug || newProduct?.id,
                },
                ...prev,
              ];
            }

            return prev;
          });
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const refreshProducts = async () => {
    const { data, error } = await supabase.from('products').select('*');

    if (error || !data) {
      const fallback = loadProducts();
      setProducts(fallback);
      return;
    }

    setProducts((data || []).map((p: any) => ({
      ...p,
      image: p?.image || p?.images?.[0] || "",
      images: Array.isArray(p?.images) ? p.images : (p?.image ? [p.image] : []),
      sizes: p?.sizes || [],
      colors: p?.colors || [],
      description: p?.description || "",
      price: p?.price ?? 0,
      originalPrice: p?.original_price ?? null,
      category: p?.category || "women",
      style: p?.style || "minimal",
      stock: p?.stock ?? 10,
      featured: p?.featured ?? false,
      rating: p?.rating ?? 0,
      reviews: p?.reviews ?? 0,
      tags: p?.tags ?? [],
      material: p?.material ?? "",
      careInstructions: p?.care_instructions ?? "",
      createdAt: p?.created_at ?? new Date().toISOString(),
      updatedAt: p?.updated_at ?? new Date().toISOString(),
      sales_count: p?.sales_count ?? 0,
      slug: p?.slug || p?.id,
    })));
  };

  return (
    <ProductsContext.Provider value={{ products, refreshProducts }}>
      {children}
    </ProductsContext.Provider>
  );
};

export const useProducts = () => {
  const context = useContext(ProductsContext);
  if (context === undefined) {
    // Return safe fallback instead of crashing app
    return { products: [], refreshProducts: async () => {} };
  }
  return context;
};

// Export default products for backward compatibility
export const products = loadProducts();
