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

// Default products with NPR pricing
const defaultProducts: Product[] = [
  {
    id: "1",
    name: "Classic Black Jacket",
    price: 39867,
    category: "women",
    style: "minimal",
    image: "https://images.unsplash.com/photo-1513188447171-ecf00455f051?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxmYXNoaW9uJTIwbW9kZWwlMjBibGFjayUyMGNsb3RoaW5nJTIwbWluaW1hbHxlbnwxfHx8fDE3NzUwNDY2NTZ8MA&ixlib=rb-4.1.0&q=80&w=1080",
    images: ["https://images.unsplash.com/photo-1513188447171-ecf00455f051?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxmYXNoaW9uJTIwbW9kZWwlMjBibGFjayUyMGNsb3RoaW5nJTIwbWluaW1hbHxlbnwxfHx8fDE3NzUwNDY2NTZ8MA&ixlib=rb-4.1.0&q=80&w=1080"],
    description: "Premium black jacket crafted from high-quality materials. Perfect for any occasion.",
    sizes: ["XS", "S", "M", "L", "XL"],
    colors: ["Black", "Navy"],
    isNew: true,
    stock: 10,
    featured: false,
    rating: 0,
    reviews: 0,
    tags: [],
    material: "",
    careInstructions: "",
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: "2",
    name: "Modern Essentials Top",
    price: 17157,
    category: "women",
    style: "minimal",
    image: "https://images.unsplash.com/photo-1745962978987-010bc11e700c?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHx3b21hbiUyMG1vZGVybiUyMGZhc2hpb24lMjBjbG90aGluZ3xlbnwxfHx8fDE3NzUwNDY2NTZ8MA&ixlib=rb-4.1.0&q=80&w=1080",
    images: ["https://images.unsplash.com/photo-1745962978987-010bc11e700c?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHx3b21hbiUyMG1vZGVybiUyMGZhc2hpb24lMjBjbG90aGluZ3xlbnwxfHx8fDE3NzUwNDY2NTZ8MA&ixlib=rb-4.1.0&q=80&w=1080"],
    description: "Clean-cut modern top with minimalist design. Versatile and timeless.",
    sizes: ["XS", "S", "M", "L", "XL"],
    colors: ["White", "Beige", "Black"],
    isNew: true,
    stock: 10,
    featured: false,
    rating: 0,
    reviews: 0,
    tags: [],
    material: "",
    careInstructions: "",
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: "3",
    name: "Urban Streetwear Set",
    price: 33117,
    category: "men",
    style: "minimal",
    image: "https://images.unsplash.com/photo-1642400997435-f4b7c0f68ce9?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxtYW4lMjBmYXNoaW9uJTIwc3RyZWV0d2VhciUyMG1vZGVsfGVufDF8fHx8MTc3NTA0NjY1N3ww&ixlib=rb-4.1.0&q=80&w=1080",
    images: ["https://images.unsplash.com/photo-1642400997435-f4b7c0f68ce9?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxtYW4lMjBmYXNoaW9uJTIwc3RyZWV0d2VhciUyMG1vZGVsfGVufDF8fHx8MTc3NTA0NjY1N3ww&ixlib=rb-4.1.0&q=80&w=1080"],
    description: "Contemporary streetwear for the modern man. Comfortable and stylish.",
    sizes: ["S", "M", "L", "XL", "XXL"],
    colors: ["Black", "Gray", "Olive"],
    isNew: false,
    stock: 10,
    featured: false,
    rating: 0,
    reviews: 0,
    tags: [],
    material: "",
    careInstructions: "",
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: "4",
    name: "Minimalist Accessories",
    price: 10507,
    category: "accessories",
    style: "minimal",
    image: "https://images.unsplash.com/photo-1628453208660-b0dd0daac755?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxmYXNoaW9uJTIwYWNjZXNzb3JpZXMlMjBtaW5pbWFsJTIwYmFja2dyb3VuZHxlbnwxfHx8fDE3NzUwNDY2NTd8MA&ixlib=rb-4.1.0&q=80&w=1080",
    images: ["https://images.unsplash.com/photo-1628453208660-b0dd0daac755?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxmYXNoaW9uJTIwYWNjZXNzb3JpZXMlMjBtaW5pbWFsJTIwYmFja2dyb3VuZHxlbnwxfHx8fDE3NzUwNDY2NTd8MA&ixlib=rb-4.1.0&q=80&w=1080"],
    description: "Elegant accessories to complement your style. Simple yet sophisticated.",
    sizes: ["One Size"],
    colors: ["Gold", "Silver", "Rose Gold"],
    isNew: false,
    stock: 10,
    featured: false,
    rating: 0,
    reviews: 0,
    tags: [],
    material: "",
    careInstructions: "",
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: "5",
    name: "Premium Denim Jacket",
    price: 46417,
    category: "men",
    style: "minimal",
    image: "https://images.unsplash.com/photo-1551283279-166ab6d719af?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxwcmVtaXVtJTIwamFja2V0JTIwZmFzaGlvbiUyMGNsb3RoaW5nfGVufDF8fHx8MTc3NTA0NjY1N3ww&ixlib=rb-4.1.0&q=80&w=1080",
    images: ["https://images.unsplash.com/photo-1551283279-166ab6d719af?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxwcmVtaXVtJTIwamFja2V0JTIwZmFzaGlvbiUyMGNsb3RoaW5nfGVufDF8fHx8MTc3NTA0NjY1N3ww&ixlib=rb-4.1.0&q=80&w=1080"],
    description: "Classic denim jacket with modern cuts. A wardrobe essential.",
    sizes: ["S", "M", "L", "XL", "XXL"],
    colors: ["Blue", "Black", "Light Wash"],
    isNew: true,
    stock: 10,
    featured: false,
    rating: 0,
    reviews: 0,
    tags: [],
    material: "",
    careInstructions: "",
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: "6",
    name: "Essential White Tee",
    price: 7847,
    category: "women",
    style: "minimal",
    image: "https://images.unsplash.com/photo-1692003509966-80ca67c85068?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHx3aGl0ZSUyMHQtc2hpcnQlMjBmYXNoaW9uJTIwbWluaW1hbHxlbnwxfHx8fDE3NzUwNDY2NTh8MA&ixlib=rb-4.1.0&q=80&w=1080",
    images: ["https://images.unsplash.com/photo-1692003509966-80ca67c85068?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHx3aGl0ZSUyMHQtc2hpcnQlMjBmYXNoaW9uJTIwbWluaW1hbHxlbnwxfHx8fDE3NzUwNDY2NTh8MA&ixlib=rb-4.1.0&q=80&w=1080"],
    description: "Pure white essential tee. Perfect fit, premium cotton.",
    sizes: ["XS", "S", "M", "L", "XL"],
    colors: ["White", "Off-White", "Cream"],
    isNew: false,
    stock: 10,
    featured: false,
    rating: 0,
    reviews: 0,
    tags: [],
    material: "",
    careInstructions: "",
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: "7",
    name: "Signature Denim",
    price: 25137,
    category: "women",
    style: "minimal",
    image: "https://images.unsplash.com/photo-1758018230837-89188346c36f?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxkZW5pbSUyMGplYW5zJTIwZmFzaGlvbiUyMHBob3RvZ3JhcGh5fGVufDF8fHx8MTc3NTA0NjY1OHww&ixlib=rb-4.1.0&q=80&w=1080",
    images: ["https://images.unsplash.com/photo-1758018230837-89188346c36f?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxkZW5pbSUyMGplYW5zJTIwZmFzaGlvbiUyMHBob3RvZ3JhcGh5fGVufDF8fHx8MTc3NTA0NjY1OHww&ixlib=rb-4.1.0&q=80&w=1080"],
    description: "Premium denim crafted for comfort and style. Timeless design.",
    sizes: ["24", "26", "28", "30", "32"],
    colors: ["Indigo", "Black", "Light Blue"],
    isNew: false,
    stock: 10,
    featured: false,
    rating: 0,
    reviews: 0,
    tags: [],
    material: "",
    careInstructions: "",
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: "8",
    name: "Leather Sneakers",
    price: 30457,
    category: "accessories",
    style: "minimal",
    image: "https://images.unsplash.com/photo-1758542988948-b95a6c4aa68b?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxsZWF0aGVyJTIwc2hvZXMlMjBmYXNoaW9uJTIwcHJvZHVjdHxlbnwxfHx8fDE3NzUwNDY2NTh8MA&ixlib=rb-4.1.0&q=80&w=1080",
    images: ["https://images.unsplash.com/photo-1758542988948-b95a6c4aa68b?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxsZWF0aGVyJTIwc2hvZXMlMjBmYXNoaW9uJTIwcHJvZHVjdHxlbnwxfHx8fDE3NzUwNDY2NTh8MA&ixlib=rb-4.1.0&q=80&w=1080"],
    description: "Handcrafted leather sneakers. Where luxury meets comfort.",
    sizes: ["36", "37", "38", "39", "40", "41", "42", "43"],
    colors: ["White", "Black", "Tan"],
    isNew: true,
    stock: 10,
    featured: false,
    rating: 0,
    reviews: 0,
    tags: [],
    material: "",
    careInstructions: "",
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: "9",
    name: "Runway Collection Piece",
    price: 66367,
    category: "women",
    style: "extravagant",
    image: "https://images.unsplash.com/photo-1765815442424-5acf90d01e41?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxmYXNoaW9uJTIwcnVud2F5JTIwbW9kZWwlMjBlZGl0b3JpYWx8ZW58MXx8fHwxNzc1MDQ2NjU5fDA&ixlib=rb-4.1.0&q=80&w=1080",
    images: ["https://images.unsplash.com/photo-1765815442424-5acf90d01e41?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxmYXNoaW9uJTIwcnVud2F5JTIwbW9kZWwlMjBlZGl0b3JpYWx8ZW58MXx8fHwxNzc1MDQ2NjU5fDA&ixlib=rb-4.1.0&q=80&w=1080"],
    description: "Exclusive runway piece. Limited edition, editorial quality.",
    sizes: ["XS", "S", "M", "L"],
    colors: ["Black"],
    isNew: true,
    stock: 10,
    featured: false,
    rating: 0,
    reviews: 0,
    tags: [],
    material: "",
    careInstructions: "",
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: "10",
    name: "Beige Overcoat",
    price: 53067,
    category: "women",
    style: "minimal",
    image: "https://images.unsplash.com/photo-1770644935626-f61d233f4827?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHx3b21hbiUyMGJlaWdlJTIwY29hdCUyMGZhc2hpb258ZW58MXx8fHwxNzc1MDQ2NjU5fDA&ixlib=rb-4.1.0&q=80&w=1080",
    images: ["https://images.unsplash.com/photo-1770644935626-f61d233f4827?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHx3b21hbiUyMGJlaWdlJTIwY29hdCUyMGZhc2hpb258ZW58MXx8fHwxNzc1MDQ2NjU5fDA&ixlib=rb-4.1.0&q=80&w=1080"],
    description: "Elegant beige overcoat in premium wool blend. Timeless sophistication.",
    sizes: ["XS", "S", "M", "L", "XL"],
    colors: ["Beige", "Camel", "Gray"],
    isNew: false,
    stock: 10,
    featured: false,
    rating: 0,
    reviews: 0,
    tags: [],
    material: "",
    careInstructions: "",
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: "11",
    name: "Black Knit Sweater",
    price: 21147,
    category: "men",
    style: "minimal",
    image: "https://images.unsplash.com/photo-1624910996561-daeb5bd84fc0?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxibGFjayUyMHN3ZWF0ZXIlMjBmYXNoaW9uJTIwbWluaW1hbHxlbnwxfHx8fDE3NzUwNDY2NTl8MA&ixlib=rb-4.1.0&q=80&w=1080",
    images: ["https://images.unsplash.com/photo-1624910996561-daeb5bd84fc0?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxibGFjayUyMHN3ZWF0ZXIlMjBmYXNoaW9uJTIwbWluaW1hbHxlbnwxfHx8fDE3NzUwNDY2NTl8MA&ixlib=rb-4.1.0&q=80&w=1080"],
    description: "Luxurious black knit sweater. Soft, warm, and effortlessly stylish.",
    sizes: ["S", "M", "L", "XL", "XXL"],
    colors: ["Black", "Charcoal", "Navy"],
    isNew: false,
    stock: 10,
    featured: false,
    rating: 0,
    reviews: 0,
    tags: [],
    material: "",
    careInstructions: "",
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: "12",
    name: "Statement Outerwear",
    price: 59717,
    category: "men",
    style: "extravagant",
    image: "https://images.unsplash.com/photo-1771775735322-2abfea815153?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxmYXNoaW9uJTIwYnJhbmQlMjBsaWZlc3R5bGUlMjBzdG9yZXxlbnwxfHx8fDE3NzUwNDY2NjB8MA&ixlib=rb-4.1.0&q=80&w=1080",
    images: ["https://images.unsplash.com/photo-1771775735322-2abfea815153?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxmYXNoaW9uJTIwYnJhbmQlMjBsaWZlc3R5bGUlMjBzdG9yZXxlbnwxfHx8fDE3NzUwNDY2NjB8MA&ixlib=rb-4.1.0&q=80&w=1080"],
    description: "Bold statement piece for the fashion-forward. Premium construction.",
    sizes: ["S", "M", "L", "XL"],
    colors: ["Black", "Olive", "Burgundy"],
    isNew: true,
    stock: 10,
    featured: false,
    rating: 0,
    reviews: 0,
    tags: [],
    material: "",
    careInstructions: "",
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  // Extravagant Collection
  {
    id: "13",
    name: "Luxury Editorial Coat",
    price: 899,
    category: "women",
    style: "extravagant",
    image: "https://images.unsplash.com/photo-1719518411339-5158cea86caf?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxleHRyYXZhZ2FudCUyMGx1eHVyeSUyMGZhc2hpb24lMjBlZGl0b3JpYWx8ZW58MXx8fHwxNzc1MTQwNDU0fDA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral",
    images: ["https://images.unsplash.com/photo-1719518411339-5158cea86caf?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxleHRyYXZhZ2FudCUyMGx1eHVyeSUyMGZhc2hpb24lMjBlZGl0b3JpYWx8ZW58MXx8fHwxNzc1MTQwNDU0fDA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral"],
    description: "Dramatic luxury piece with architectural silhouette. For those who dare to stand out.",
    sizes: ["XS", "S", "M", "L"],
    colors: ["Black", "White"],
    isNew: true,
    stock: 10,
    featured: false,
    rating: 0,
    reviews: 0,
    tags: [],
    material: "",
    careInstructions: "",
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: "14",
    name: "Avant-Garde Designer Piece",
    price: 1299,
    category: "women",
    style: "extravagant",
    image: "https://images.unsplash.com/photo-1765815442424-5acf90d01e41?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxhdmFudCUyMGdhcmRlJTIwZmFzaGlvbiUyMGRlc2lnbmVyJTIwY2xvdGhpbmd8ZW58MXx8fHwxNzc1MTQwNDU0fDA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral",
    images: ["https://images.unsplash.com/photo-1765815442424-5acf90d01e41?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxhdmFudCUyMGdhcmRlJTIwZmFzaGlvbiUyMGRlc2lnbmVyJTIwY2xvdGhpbmd8ZW58MXx8fHwxNzc1MTQwNDU0fDA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral"],
    description: "Sculptural avant-garde design. Art meets fashion in this masterpiece.",
    sizes: ["S", "M", "L"],
    colors: ["Black"],
    isNew: true,
    stock: 10,
    featured: false,
    rating: 0,
    reviews: 0,
    tags: [],
    material: "",
    careInstructions: "",
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: "15",
    name: "Haute Couture Drama",
    price: 1599,
    category: "women",
    style: "extravagant",
    image: "https://images.unsplash.com/photo-1761932975421-48f2cc7483dd?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxoYXV0ZSUyMGNvdXR1cmUlMjBkcmFtYXRpYyUyMGZhc2hpb258ZW58MXx8fHwxNzc1MTQwNDU1fDA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral",
    images: ["https://images.unsplash.com/photo-1761932975421-48f2cc7483dd?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxoYXV0ZSUyMGNvdXR1cmUlMjBkcmFtYXRpYyUyMGZhc2hpb258ZW58MXx8fHwxNzc1MTQwNDU1fDA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral"],
    description: "Haute couture statement piece with dramatic proportions. Unforgettable presence.",
    sizes: ["XS", "S", "M"],
    colors: ["Black", "White"],
    isNew: true,
    stock: 10,
    featured: false,
    rating: 0,
    reviews: 0,
    tags: [],
    material: "",
    careInstructions: "",
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: "16",
    name: "Bold Statement Ensemble",
    price: 799,
    category: "men",
    style: "extravagant",
    image: "https://images.unsplash.com/photo-1767249632745-8ce4a930c11b?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxib2xkJTIwc3RhdGVtZW50JTIwZmFzaGlvbiUyMHBpZWNlfGVufDF8fHx8MTc3NTE0MDQ1NXww&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral",
    images: ["https://images.unsplash.com/photo-1767249632745-8ce4a930c11b?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxib2xkJTIwc3RhdGVtZW50JTIwZmFzaGlvbiUyMHBpZWNlfGVufDF8fHx8MTc3NTE0MDQ1NXww&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral"],
    description: "Commanding presence in every room. Bold design for the confident.",
    sizes: ["S", "M", "L", "XL"],
    colors: ["Black", "White"],
    isNew: false,
    stock: 10,
    featured: false,
    rating: 0,
    reviews: 0,
    tags: [],
    material: "",
    careInstructions: "",
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
];

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
      const { data, error } = await supabase
        .from('products')
        .select('*');

      if (error) {
        console.error('Supabase error:', error);
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
    };

    fetchProducts();
  }, []);

  const refreshProducts = async () => {
    const { data, error } = await supabase.from('products').select('*');

    if (error) {
      console.error('Refresh error:', error);
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
    throw new Error('useProducts must be used within a ProductsProvider');
  }
  return context;
};

// Export default products for backward compatibility
export const products = loadProducts();
