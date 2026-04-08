import { useState, useEffect, useRef } from "react";
import { motion } from "motion/react";
import { Plus, Edit, Trash2, Package, Image, Star, Eye, EyeOff, Upload, X, Check, AlertCircle, RefreshCw } from "lucide-react";
import { Button } from "../../components/ui/button";
import { Input } from "../../components/ui/input";
import { Textarea } from "../../components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "../../components/ui/card";
import { Badge } from "../../components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "../../components/ui/dialog";
import { Label } from "../../components/ui/label";
import { Switch } from "../../components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../../components/ui/select";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "../../components/ui/alert-dialog";
import { toast } from "sonner";
import { products as defaultProducts } from "../../data/products";
import { supabase } from "../../../lib/supabase";
import { appendAdminAuditLog, getAdminSession } from "../../utils/admin";

interface Product {
  id: string;
  name: string;
  price: number;
  originalPrice?: number;
  description: string;
  category: string; // Will be "men" | "women" | "accessories" | or custom categories
  style?: "minimal" | "extravagant"; // From original data
  image?: string; // Single image from original data
  images: string[]; // Array for admin management
  stock: number;
  featured: boolean;
  rating: number;
  reviews: number;
  tags: string[];
  sizes: string[];
  colors: string[];
  material?: string;
  careInstructions?: string;
  isNew?: boolean; // From original data
  createdAt: string;
  updatedAt: string;
}

function normalizeProductForStore(product: Product): Product {
  const normalizedImages = product.images ?? [];

  return {
    ...product,
    images: normalizedImages,
    image: normalizedImages[0] || product.image || "",
  };
}

interface FormData {
  name: string;
  price: string;
  originalPrice: string;
  description: string;
  category: string;
  style: "minimal" | "extravagant";
  images: string[];
  stock: string;
  featured: boolean;
  tags: string;
  sizes: string[];
  colors: string[];
  material: string;
  careInstructions: string;
}

const categories = [
  "Dresses", "Tops", "Bottoms", "Outerwear", "Accessories", "Shoes", "Bags", "Jewelry",
  "men", "women", "accessories" // Include original categories
];

const sizes = ["XS", "S", "M", "L", "XL", "XXL"];
const colors = ["Black", "White", "Red", "Blue", "Green", "Yellow", "Purple", "Pink", "Gray", "Brown"];

export function ProductManagement() {
  const adminSession = getAdminSession();
  const [products, setProducts] = useState<Product[]>([]);
  const [collections, setCollections] = useState<any[]>([]);

  const fetchCollections = async () => {
    const { data, error } = await supabase.from("collections").select("*");
    if (!error && data) {
      setCollections(data);
    }
  };
  const [newCollection, setNewCollection] = useState("");
  const [collectionImage, setCollectionImage] = useState("");
  const [collectionImageFileInput, setCollectionImageFileInput] = useState<HTMLInputElement | null>(null);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("all");

  // Form state for add/edit product
  const [formData, setFormData] = useState<FormData>({
    name: "",
    price: "",
    originalPrice: "",
    description: "",
    category: "",
    style: "minimal",
    images: [],
    stock: "",
    featured: false,
    tags: "",
    sizes: [],
    colors: [],
    material: "",
    careInstructions: ""
  });

  // Image URL input state
  const [imageUrlInput, setImageUrlInput] = useState("");

  useEffect(() => {
    const fetchProducts = async () => {
      const { data, error } = await supabase.from('products').select('*');

      if (error) {
        console.error('Error fetching products:', error);
      } else {
        setProducts((data || []).map((p: any) => ({
          ...p,
          originalPrice: p?.original_price ?? undefined,
          images: Array.isArray(p?.images) ? p.images : (p?.image ? [p.image] : []),
          image: p?.image || (Array.isArray(p?.images) && p.images[0]) || "",
          stock: p?.stock ?? 10,
          featured: p?.featured ?? false,
          tags: p?.tags ?? [],
          material: p?.material ?? "",
          careInstructions: p?.care_instructions ?? "",
          rating: p?.rating ?? 0,
          reviews: p?.reviews ?? 0,
          createdAt: p?.created_at ?? new Date().toISOString(),
          updatedAt: p?.updated_at ?? new Date().toISOString()
        })));
      }
    };

    fetchProducts();
    fetchCollections();
  }, []);

  useEffect(() => {
    const uniqueCategories = Array.from(new Set(products.map(p => p.category)));
    // setCollections(uniqueCategories); // Don't override fetched collections
  }, [products]);

  const saveProducts = async (updatedProducts: Product[]) => {
    try {
      for (const product of updatedProducts) {
        const dbProduct = {
          id: product.id,
          name: product.name,
          price: product.price,
          original_price: product.originalPrice ?? null,
          description: product.description,
          category: product.category,
          style: product.style,
          image: product.image,
          images: product.images,
          stock: product.stock,
          featured: product.featured,
          tags: product.tags,
          sizes: product.sizes,
          colors: product.colors,
          material: product.material,
          care_instructions: product.careInstructions,
          rating: product.rating,
          reviews: product.reviews,
          created_at: product.createdAt,
          updated_at: new Date().toISOString(),
        };

        const { error } = await supabase.from("products").upsert(dbProduct);

        if (error) {
          console.error("Save error:", error);
          throw error;
        }
      }

      setProducts(updatedProducts);
      toast.success("Changes saved to database");
    } catch (error) {
      console.error("Error saving products:", error);
      toast.error("Failed to save changes");
    }
  };

  const resetForm = () => {
    setFormData({
      name: "",
      price: "",
      originalPrice: "",
      description: "",
      category: "",
      style: "minimal",
      images: [],
      stock: "",
      featured: false,
      tags: "",
      sizes: [],
      colors: [],
      material: "",
      careInstructions: ""
    });
    setImageUrlInput("");
  };

  const handleAddProduct = async () => {
    // Sanitize and prepare the new product object
    const newProduct: any = {
  id: crypto.randomUUID(), // ✅ ADD THIS

  name: formData.name || "Untitled",
  price: Number(formData.price) || 0,
  original_price: formData.originalPrice ? Number(formData.originalPrice) : null,
  description: formData.description || "",
  category: formData.category || "general",
  style: formData.style || "minimal",
  image: formData.images?.[0] || "",
  images: formData.images || [],
  stock: Number(formData.stock) || 0,
  featured: formData.featured ?? false,
  rating: 0,
  reviews: 0,
  tags: formData.tags ? formData.tags.split(',').map(t => t.trim()) : [],
  sizes: formData.sizes || [],
  colors: formData.colors || [],
  material: formData.material || "",
  care_instructions: formData.careInstructions || "",
  created_at: new Date().toISOString(),
  updated_at: new Date().toISOString()
};

    // Debug log before insert
    console.log("INSERTING PRODUCT:", newProduct);

    const { error } = await supabase.from('products').insert([newProduct]);
    if (error) {
      console.error("SUPABASE ERROR:", error?.message, error?.details, error?.hint);
      toast.error('Failed to add product');
      return;
    }

    // UI: add new product to local state
    const uiProduct: Product = {
  ...newProduct,
  originalPrice: newProduct.original_price ?? undefined,
  careInstructions: newProduct.care_instructions ?? "",
  createdAt: newProduct.created_at,
  updatedAt: newProduct.updated_at,
};

setProducts(prev => [...prev, uiProduct]);

    if (adminSession) {
      appendAdminAuditLog({
        adminId: adminSession.id,
        adminName: adminSession.name,
        adminEmail: adminSession.email,
        branch: adminSession.branch,
        action: "added",
        entityType: "product",
        entityName: newProduct.name,
        details: `Created a new ${newProduct.style ?? "minimal"} product.`,
      });
    }

    setIsAddDialogOpen(false);
    resetForm();
  };

  const handleEditProduct = async () => {
    if (!editingProduct) return;

    const updatedProduct: Product = {
      ...editingProduct,
      name: formData.name,
      price: parseFloat(formData.price),
      originalPrice: formData.originalPrice ? parseFloat(formData.originalPrice) : undefined,
      description: formData.description,
      category: formData.category,
      style: formData.style,
      image: formData.images[0] || editingProduct.image || "",
      images: formData.images,
      stock: parseInt(formData.stock),
      featured: formData.featured,
      tags: formData.tags.split(',').map(tag => tag.trim()).filter(tag => tag),
      sizes: formData.sizes,
      colors: formData.colors,
      material: formData.material,
      careInstructions: formData.careInstructions,
      updatedAt: new Date().toISOString()
    };

    const { error } = await supabase
  .from('products')
  .update({
    name: updatedProduct.name,
    price: updatedProduct.price,
    original_price: updatedProduct.originalPrice ?? null,
    description: updatedProduct.description,
    category: updatedProduct.category,
    style: updatedProduct.style,
    image: updatedProduct.image,
    images: updatedProduct.images,
    stock: updatedProduct.stock,
    featured: updatedProduct.featured,
    tags: updatedProduct.tags,
    sizes: updatedProduct.sizes,
    colors: updatedProduct.colors,
    material: updatedProduct.material,
    care_instructions: updatedProduct.careInstructions,
    updated_at: new Date().toISOString(),
  })
  .eq('id', editingProduct.id);

    if (error) {
      console.error(error);
      toast.error('Failed to update product');
      return;
    }

    setProducts(prev => prev.map(p => p.id === editingProduct.id ? updatedProduct : p));

    if (adminSession) {
      appendAdminAuditLog({
        adminId: adminSession.id,
        adminName: adminSession.name,
        adminEmail: adminSession.email,
        branch: adminSession.branch,
        action: "edited",
        entityType: "product",
        entityName: updatedProduct.name,
        details: `Updated product details and inventory settings.`,
      });
    }
    setEditingProduct(null);
    resetForm();
  };

  const handleDeleteProduct = async (product: Product) => {
    try {
      // 1. Insert into recycle_bin
      await supabase.from("recycle_bin").insert([
        {
          entity_type: "product",
          entity_name: product.name,
          payload: product,
          deleted_by: adminSession?.email || "admin",
        },
      ]);

      // 2. Delete from products table
      await supabase.from("products").delete().eq("id", product.id);

      // 3. Update UI
      setProducts((prev) => prev.filter((p) => p.id !== product.id));

      // 4. Audit log
      if (adminSession) {
        appendAdminAuditLog({
          adminId: adminSession.id,
          adminName: adminSession.name,
          adminEmail: adminSession.email,
          branch: adminSession.branch,
          action: "deleted",
          entityType: "product",
          entityName: product.name,
          details: "Moved product to recycle bin",
        });
      }

      toast.success("Product moved to recycle bin");
    } catch (error) {
      console.error(error);
      toast.error("Delete failed");
    }
  };

  const startEdit = (product: Product) => {
    setEditingProduct(product);
    setFormData({
      name: product.name,
      price: product.price.toString(),
      originalPrice: product.originalPrice?.toString() || "",
      description: product.description,
      category: product.category,
      style: product.style || "minimal",
      images: product.images,
      stock: product.stock.toString(),
      featured: product.featured,
      tags: product.tags.join(', '),
      sizes: product.sizes || [],
      colors: product.colors || [],
      material: product.material || "",
      careInstructions: product.careInstructions || ""
    });
  };

  const toggleFeature = (productId: string) => {
    const updatedProducts = products.map(p =>
      p.id === productId ? { ...p, featured: !p.featured, updatedAt: new Date().toISOString() } : p
    );
    saveProducts(updatedProducts);
    const updatedProduct = updatedProducts.find((product) => product.id === productId);
    if (updatedProduct && adminSession) {
      appendAdminAuditLog({
        adminId: adminSession.id,
        adminName: adminSession.name,
        adminEmail: adminSession.email,
        branch: adminSession.branch,
        action: updatedProduct.featured ? "featured" : "unfeatured",
        entityType: "product",
        entityName: updatedProduct.name,
        details: `Changed featured visibility.`,
      });
    }
  };

  const updateStock = (productId: string, newStock: number) => {
    const updatedProducts = products.map(p =>
      p.id === productId ? { ...p, stock: Math.max(0, newStock), updatedAt: new Date().toISOString() } : p
    );
    saveProducts(updatedProducts);
  };

  const filteredProducts = products.filter(product => {
    const matchesSearch = product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         product.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === "all" || product.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const addImageUrl = () => {
    if (imageUrlInput.trim()) {
      setFormData(prev => ({ ...prev, images: [...prev.images, imageUrlInput.trim()] }));
      setImageUrlInput(""); // Clear the input after adding
    }
  };

  const fileToOptimizedDataUrl = (file: File) =>
    new Promise<string>((resolve, reject) => {
      const reader = new FileReader();

      reader.onload = () => {
        const image = new window.Image();
        image.onload = () => {
          const canvas = document.createElement("canvas");
          const maxDimension = 1400;
          const scale = Math.min(
            1,
            maxDimension / image.width,
            maxDimension / image.height
          );

          canvas.width = Math.max(1, Math.round(image.width * scale));
          canvas.height = Math.max(1, Math.round(image.height * scale));

          const context = canvas.getContext("2d");
          if (!context) {
            reject(new Error("Unable to process image"));
            return;
          }

          context.drawImage(image, 0, 0, canvas.width, canvas.height);
          resolve(canvas.toDataURL("image/jpeg", 0.82));
        };

        image.onerror = () => reject(new Error("Unable to load uploaded image"));
        image.src = reader.result as string;
      };

      reader.onerror = () => reject(new Error("Unable to read uploaded image"));
      reader.readAsDataURL(file);
    });

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (!files) return;

    const maxFileSize = 5 * 1024 * 1024; // 5MB limit
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/gif'];

    for (const file of Array.from(files)) {
      if (file.size > maxFileSize) {
        alert(`File "${file.name}" is too large. Maximum size is 5MB.`);
        continue;
      }

      if (!allowedTypes.includes(file.type)) {
        alert(`File "${file.name}" is not a supported image type. Please use JPEG, PNG, WebP, or GIF.`);
        continue;
      }

      try {
        const dataUrl = await fileToOptimizedDataUrl(file);
        setFormData(prev => ({ ...prev, images: [...prev.images, dataUrl] }));
      } catch {
        alert(`File "${file.name}" could not be processed. Please try another image.`);
      }
    }

    // Clear the input
    event.target.value = '';
  };

  const removeImage = (index: number) => {
    setFormData(prev => ({ ...prev, images: prev.images.filter((_, i) => i !== index) }));
  };

  const toggleSize = (size: string) => {
    setFormData(prev => ({
      ...prev,
      sizes: prev.sizes.includes(size)
        ? prev.sizes.filter(s => s !== size)
        : [...prev.sizes, size]
    }));
  };

  const toggleColor = (color: string) => {
    setFormData(prev => ({
      ...prev,
      colors: prev.colors.includes(color)
        ? prev.colors.filter(c => c !== color)
        : [...prev.colors, color]
    }));
  };

  return (
    <div className="space-y-6 dark bg-gray-900 text-white min-h-screen">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Product Management</h2>
          <p className="text-gray-600 dark:text-gray-300">Manage your product catalog, inventory, and features</p>
        </div>
        <div className="flex gap-3">
          <Button
            variant="outline"
            onClick={() => {
              // Sync products from Supabase
              const fetchProducts = async () => {
                const { data, error } = await supabase.from('products').select('*');

                if (error) {
                  console.error('Error fetching products:', error);
                  toast.error('Failed to sync with database');
                  return;
                }

                setProducts((data || []).map((p: any) => ({
                  ...p,
                  originalPrice: p?.original_price ?? undefined,
                  images: Array.isArray(p?.images) ? p.images : (p?.image ? [p.image] : []),
                  image: p?.image || (Array.isArray(p?.images) && p.images[0]) || "",
                  stock: p?.stock ?? 10,
                  featured: p?.featured ?? false,
                  tags: p?.tags ?? [],
                  material: p?.material ?? "",
                  careInstructions: p?.care_instructions ?? "",
                  rating: p?.rating ?? 0,
                  reviews: p?.reviews ?? 0,
                  createdAt: p?.created_at ?? new Date().toISOString(),
                  updatedAt: p?.updated_at ?? new Date().toISOString()
                })));

                toast.success('Synced with database');
              };

              fetchProducts();
            }}
            className="flex items-center gap-2"
          >
            <RefreshCw size={16} />
            Sync Products
          </Button>
          <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
            <DialogTrigger asChild>
              <Button className="flex items-center gap-2">
                <Plus size={16} />
                Add Product
              </Button>
            </DialogTrigger>
            <DialogContent className="w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col p-0 sm:p-0">
              <div className="overflow-y-auto flex-1">
                <div className="p-6 sm:p-8">
                  <DialogHeader className="mb-6">
                    <DialogTitle>Add New Product</DialogTitle>
                    <p className="sr-only">
                      Fill the form to add a new product to your store
                    </p>
                  </DialogHeader>
                  <ProductForm
                    formData={formData}
                    setFormData={setFormData}
                    collections={collections}
                    onSubmit={handleAddProduct}
                    onCancel={() => {
                      setIsAddDialogOpen(false);
                      resetForm();
                    }}
                    addImageUrl={addImageUrl}
                    handleFileUpload={handleFileUpload}
                    removeImage={removeImage}
                    toggleSize={toggleSize}
                    toggleColor={toggleColor}
                    submitLabel="Add Product"
                    imageUrlInput={imageUrlInput}
                    setImageUrlInput={setImageUrlInput}
                  />
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Collection Management */}
      <div className="flex flex-col gap-3 border p-4 rounded-lg">
        <h3 className="text-lg font-semibold">Collections</h3>

        <div className="flex gap-2">
          <Input
            placeholder="New collection name"
            value={newCollection}
            onChange={(e) => setNewCollection(e.target.value)}
            className="dark:bg-gray-800 dark:border-gray-700 dark:text-white"
          />
          <div className="flex flex-col gap-2">
            <Input
              placeholder="Collection image URL (optional)"
              value={collectionImage}
              onChange={(e) => setCollectionImage(e.target.value)}
              className="dark:bg-gray-800 dark:border-gray-700 dark:text-white"
            />
            <Input
              type="file"
              accept="image/*"
              onChange={async (e) => {
                const file = e.target.files?.[0];
                if (!file) return;

                try {
                  const dataUrl = await fileToOptimizedDataUrl(file);
                  setCollectionImage(dataUrl);
                  toast.success("Image uploaded");
                } catch {
                  toast.error("Failed to process image");
                }
              }}
              className="dark:bg-gray-800 dark:border-gray-700 dark:text-white"
            />
          </div>
          <Button
            onClick={() => {
              const addCollection = async () => {
                const name = newCollection.trim();
                const slug = name.toLowerCase().replace(/\s+/g, "-");
                if (!name) {
                  toast.error("Collection name cannot be empty.");
                  return;
                }

                const existing = collections.find(
                  (col: any) => col.name.toLowerCase() === name.toLowerCase()
                );

                if (existing) {
                  // Update existing collection (ensure slug is correct)
                  const { error } = await supabase
                    .from("collections")
                    .update({ slug })
                    .eq("name", existing.name);

                  if (error) {
                    console.error("UPDATE COLLECTION ERROR:", error);
                    toast.error(error.message || "Failed to update collection");
                    return;
                  }

                  setCollections(prev =>
                    prev.map((c: any) =>
                      c.name.toLowerCase() === name.toLowerCase() ? { ...c, slug } : c
                    )
                  );

                  toast.success("Collection updated");
                  setNewCollection("");
                  setCollectionImage("");
                  return;
                }

                // Insert new collection
                const { data, error } = await supabase
                  .from("collections")
                  .insert([{ name, slug, image: collectionImage }])
                  .select();

                if (error) {
                  console.error("ADD COLLECTION ERROR:", error);
                  toast.error(error.message || "Failed to add collection");
                  return;
                }

                console.log("Inserted collection:", data);
                setCollections(prev => [...prev, { name, slug, image: collectionImage }]);
                setNewCollection("");
                setCollectionImage("");
                toast.success("Collection added");
              };
              addCollection();
            }}
          >
            Add
          </Button>
        </div>

        {collectionImage && (
          <img
            src={collectionImage}
            alt="Collection Preview"
            className="w-24 h-24 object-cover rounded border"
          />
        )}

        <div className="flex flex-wrap gap-2">
          {collections.map((col: any) => (
            <div key={col.slug} className="flex items-center gap-2 border px-3 py-1 rounded">
              <span>{col.name}</span>
              <button
                onClick={() => {
                  const deleteCollection = async () => {
                    const { error } = await supabase.from("collections").delete().eq("name", col.name);
                    if (error) {
                      toast.error("Failed to remove collection");
                      return;
                    }

                    setCollections(prev => prev.filter((c: any) => c.name !== col.name));
                    toast.success("Collection removed");
                  };
                  deleteCollection();
                }}
                className="text-red-500"
              >
                ✕
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Filters */}
      <div className="flex gap-4">
        <Input
          placeholder="Search products..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="max-w-sm dark:bg-gray-800 dark:border-gray-700 dark:text-white"
        />
        <Select value={selectedCategory} onValueChange={setSelectedCategory}>
          <SelectTrigger className="w-48 dark:bg-gray-800 dark:border-gray-700 dark:text-white">
            <SelectValue placeholder="All Categories" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Categories</SelectItem>
            {collections.map((category: any) => (
              <SelectItem key={category.slug} value={category.slug}>
                {category.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Products Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredProducts.map((product) => (
          <motion.div
            key={product.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
          >
            <Card className="h-full dark:bg-gray-800 dark:border-gray-700">
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <CardTitle className="text-xl line-clamp-2">{product.name}</CardTitle>
                    <div className="flex items-center gap-2 mt-1">
                      <Badge variant="secondary">{product.category}</Badge>
                      <Badge variant="outline">{product.style || "minimal"}</Badge>
                      {product.featured && <Badge variant="default">Featured</Badge>}
                    </div>
                  </div>
                  <div className="flex gap-1">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => toggleFeature(product.id)}
                      className={product.featured ? "text-yellow-600" : ""}
                    >
                      {product.featured ? <Eye size={20} /> : <EyeOff size={20} />}
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => startEdit(product)}
                    >
                      <Edit size={20} />
                    </Button>
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button variant="ghost" size="sm" className="text-red-600 hover:text-red-700">
                          <Trash2 size={20} />
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>Delete Product</AlertDialogTitle>
                          <AlertDialogDescription>
                            Are you sure you want to delete "{product.name}"? This action cannot be undone.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Cancel</AlertDialogCancel>
                          <AlertDialogAction
                            onClick={() => handleDeleteProduct(product)}
                            className="bg-red-600 hover:bg-red-700"
                          >
                            Delete
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                {product.images.length > 0 && (
                  <div className="aspect-square rounded-lg overflow-hidden bg-gray-100 dark:bg-gray-800">
                    <img
                      src={product.images[0]}
                      alt={product.name}
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        e.currentTarget.src = "/api/placeholder/300/300";
                      }}
                    />
                  </div>
                )}

                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-2xl font-bold text-gray-900 dark:text-white">
                      ${product.price}
                    </span>
                    {product.originalPrice && (
                      <span className="text-sm text-gray-400 dark:text-gray-400 line-through">
                        ${product.originalPrice}
                      </span>
                    )}
                  </div>

                  <div className="flex items-center gap-2">
                    <Package size={16} className="text-gray-400 dark:text-gray-400" />
                    <span className="text-sm text-gray-600 dark:text-gray-300">
                      Stock: {product.stock}
                    </span>
                  </div>

                  <div className="flex items-center gap-2">
                    <Star size={16} className="text-yellow-500 fill-current" />
                    <span className="text-sm text-gray-600 dark:text-gray-300">
                      {product.rating} ({product.reviews} reviews)
                    </span>
                  </div>
                </div>

                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => updateStock(product.id, product.stock - 1)}
                    disabled={product.stock <= 0}
                    className="dark:border-gray-600 dark:text-white"
                  >
                    -1
                  </Button>
                  <Input
                    type="number"
                    value={product.stock}
                    onChange={(e) => updateStock(product.id, parseInt(e.target.value) || 0)}
                    className="w-20 text-center dark:bg-gray-800 dark:border-gray-700 dark:text-white"
                    min="0"
                  />
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => updateStock(product.id, product.stock + 1)}
                    className="dark:border-gray-600 dark:text-white"
                  >
                    +1
                  </Button>
                </div>

                {product.tags.length > 0 && (
                  <div className="flex flex-wrap gap-1">
                    {product.tags.map((tag, index) => (
                      <Badge key={index} variant="outline" className="text-xs">
                        {tag}
                      </Badge>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      {/* Edit Product Dialog */}
      <Dialog open={!!editingProduct} onOpenChange={(open) => !open && setEditingProduct(null)}>
        <DialogContent className="w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col p-0 sm:p-0 dark:bg-gray-900 dark:text-white">
          <div className="overflow-y-auto flex-1">
            <div className="p-6 sm:p-8">
              <DialogHeader className="mb-6">
                <DialogTitle>Edit Product</DialogTitle>
                <p className="sr-only">
                  Update product details and save changes
                </p>
              </DialogHeader>
              {editingProduct && (
                <ProductForm
                  formData={formData}
                  setFormData={setFormData}
                  collections={collections}
                  onSubmit={handleEditProduct}
                  onCancel={() => {
                    setEditingProduct(null);
                    resetForm();
                  }}
                  addImageUrl={addImageUrl}
                  handleFileUpload={handleFileUpload}
                  removeImage={removeImage}
                  toggleSize={toggleSize}
                  toggleColor={toggleColor}
                  submitLabel="Update Product"
                  imageUrlInput={imageUrlInput}
                  setImageUrlInput={setImageUrlInput}
                />
              )}
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}

interface ProductFormProps {
  formData: FormData;
  setFormData: (data: FormData | ((prev: FormData) => FormData)) => void;
  collections: any[];
  onSubmit: () => void;
  onCancel: () => void;
  addImageUrl: () => void;
  handleFileUpload: (event: React.ChangeEvent<HTMLInputElement>) => void;
  removeImage: (index: number) => void;
  toggleSize: (size: string) => void;
  toggleColor: (color: string) => void;
  submitLabel: string;
  imageUrlInput: string;
  setImageUrlInput: (value: string) => void;
}

function ProductForm({
  formData,
  setFormData,
  collections,
  onSubmit,
  onCancel,
  addImageUrl,
  handleFileUpload,
  removeImage,
  toggleSize,
  toggleColor,
  submitLabel,
  imageUrlInput,
  setImageUrlInput
}: ProductFormProps) {
  return (
    <div className="space-y-6">
      {/* Basic Information Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="space-y-2">
          <Label htmlFor="name">Product Name</Label>
          <Input
            id="name"
            value={formData.name}
            onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
            placeholder="Enter product name"
            className="text-base dark:bg-gray-800 dark:border-gray-700 dark:text-white"
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="category">Category</Label>
          <Select value={formData.category} onValueChange={(value) => setFormData(prev => ({ ...prev, category: value }))}>
            <SelectTrigger className="text-base dark:bg-gray-800 dark:border-gray-700 dark:text-white">
              <SelectValue placeholder="Select category" />
            </SelectTrigger>
            <SelectContent>
              {collections.map((category: any) => (
                <SelectItem key={category.slug} value={category.slug}>{category.name}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-2">
          <Label htmlFor="style">Style Section</Label>
          <Select
            value={formData.style}
            onValueChange={(value: "minimal" | "extravagant") =>
              setFormData((prev) => ({ ...prev, style: value }))
            }
          >
            <SelectTrigger className="text-base dark:bg-gray-800 dark:border-gray-700 dark:text-white">
              <SelectValue placeholder="Select style section" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="minimal">Minimal</SelectItem>
              <SelectItem value="extravagant">Extravagant</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Pricing Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="space-y-2">
          <Label htmlFor="price">Price ($)</Label>
          <Input
            id="price"
            type="number"
            step="0.01"
            value={formData.price}
            onChange={(e) => setFormData(prev => ({ ...prev, price: e.target.value }))}
            placeholder="0.00"
            className="text-base dark:bg-gray-800 dark:border-gray-700 dark:text-white"
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="originalPrice">Original Price ($)</Label>
          <Input
            id="originalPrice"
            type="number"
            step="0.01"
            value={formData.originalPrice}
            onChange={(e) => setFormData(prev => ({ ...prev, originalPrice: e.target.value }))}
            placeholder="0.00 (optional)"
            className="text-base dark:bg-gray-800 dark:border-gray-700 dark:text-white"
          />
        </div>
      </div>

      {/* Description Section */}
      <div className="space-y-2">
        <Label htmlFor="description">Description</Label>
        <Textarea
          id="description"
          value={formData.description}
          onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
          placeholder="Enter product description"
          rows={4}
          className="text-base resize-none dark:bg-gray-800 dark:border-gray-700 dark:text-white"
        />
      </div>

      {/* Stock and Featured Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="space-y-2">
          <Label htmlFor="stock">Stock Quantity</Label>
          <Input
            id="stock"
            type="number"
            value={formData.stock}
            onChange={(e) => setFormData(prev => ({ ...prev, stock: e.target.value }))}
            placeholder="0"
            min="0"
            className="text-base dark:bg-gray-800 dark:border-gray-700 dark:text-white"
          />
        </div>
        <div className="flex items-center space-x-3 pt-8">
          <input
            type="checkbox"
            id="featured"
            checked={formData.featured}
            onChange={(e) => setFormData(prev => ({ ...prev, featured: e.target.checked }))}
            className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500"
          />
          <Label htmlFor="featured" className="text-base font-medium">Featured Product</Label>
        </div>
      </div>

      {/* Images Section */}
      <div className="space-y-3">
        <Label className="text-base font-medium">Images</Label>
        <div className="space-y-3">
          {formData.images.map((image: string, index: number) => (
            <div key={index} className="flex items-center gap-3 p-3 border border-gray-200 dark:border-gray-700 rounded-lg">
              <img
                src={image}
                alt={`Preview ${index + 1}`}
                className="w-12 h-12 object-cover rounded-md border"
                onError={(e) => {
                  e.currentTarget.src = "/api/placeholder/48/48";
                }}
              />
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
                  {image.startsWith('data:') ? `Uploaded image ${index + 1}` : 'URL image'}
                </p>
                <p className="text-xs text-gray-400 dark:text-gray-400 truncate">
                  {image.startsWith('data:') ? 'From file upload' : image}
                </p>
              </div>
              <Button variant="outline" size="sm" onClick={() => removeImage(index)} className="shrink-0 dark:border-gray-600 dark:text-white">
                <X size={14} />
              </Button>
            </div>
          ))}

          {/* URL Input Section */}
          <div className="flex flex-col sm:flex-row gap-3">
            <Input
              value={imageUrlInput}
              onChange={(e) => setImageUrlInput(e.target.value)}
              placeholder="Enter image URL (https://...)"
              className="flex-1 text-base min-w-0 dark:bg-gray-800 dark:border-gray-700 dark:text-white"
            />
            <Button variant="outline" onClick={addImageUrl} disabled={!imageUrlInput.trim()} className="px-4 sm:px-6 flex-shrink-0 dark:border-gray-600 dark:text-white">
              <Image size={16} className="mr-2" />
              <span className="hidden sm:inline">Add URL</span>
              <span className="sm:hidden">Add</span>
            </Button>
          </div>

          {/* File Upload Section */}
          <div className="border-2 border-dashed border-gray-300 dark:border-gray-700 rounded-lg p-6 text-center hover:border-gray-400 dark:hover:border-gray-400 transition-colors">
            <Upload size={24} className="mx-auto text-gray-400 dark:text-gray-400 mb-2" />
            <div className="space-y-2">
              <Input
                type="file"
                accept="image/*"
                multiple
                onChange={handleFileUpload}
                className="file:mr-4 file:py-3 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-medium file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100 file:cursor-pointer dark:bg-gray-800 dark:border-gray-700 dark:text-white"
              />
              <p className="text-sm text-gray-600 dark:text-gray-300">
                Or drag and drop images here
              </p>
            </div>
          </div>

          <p className="text-sm text-gray-400 dark:text-gray-400 bg-gray-50 dark:bg-gray-800 p-3 rounded-md">
            <strong>Supported formats:</strong> JPEG, PNG, WebP, GIF • <strong>Max size:</strong> 5MB per file • <strong>Multiple uploads allowed</strong>
          </p>
        </div>
      </div>

      {/* Sizes and Colors Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="space-y-3">
          <Label className="text-base font-medium">Available Sizes</Label>
          <div className="flex flex-wrap gap-2">
            {sizes.map(size => (
              <Button
                key={size}
                variant={formData.sizes.includes(size) ? "default" : "outline"}
                size="sm"
                onClick={() => toggleSize(size)}
                className="flex-shrink-0 px-3 py-2 text-sm"
              >
                {size}
              </Button>
            ))}
          </div>
        </div>

        <div className="space-y-3">
          <Label className="text-base font-medium">Available Colors</Label>
          <div className="flex flex-wrap gap-2">
            {colors.map(color => (
              <Button
                key={color}
                variant={formData.colors.includes(color) ? "default" : "outline"}
                size="sm"
                onClick={() => toggleColor(color)}
                className="flex-shrink-0 px-4 py-2 text-sm"
              >
                {color}
              </Button>
            ))}
          </div>
        </div>
      </div>

      {/* Additional Details Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="space-y-2 min-w-0">
          <Label htmlFor="material" className="text-base font-medium">Material</Label>
          <Input
            id="material"
            value={formData.material}
            onChange={(e) => setFormData(prev => ({ ...prev, material: e.target.value }))}
            placeholder="e.g., Cotton, Silk, Leather"
            className="text-base w-full break-words dark:bg-gray-800 dark:border-gray-700 dark:text-white"
          />
        </div>

        <div className="space-y-2 min-w-0">
          <Label htmlFor="tags" className="text-base font-medium">Tags (comma-separated)</Label>
          <Input
            id="tags"
            value={formData.tags}
            onChange={(e) => setFormData(prev => ({ ...prev, tags: e.target.value }))}
            placeholder="e.g., summer, casual, trendy"
            className="text-base w-full break-words dark:bg-gray-800 dark:border-gray-700 dark:text-white"
          />
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="careInstructions" className="text-base font-medium">Care Instructions</Label>
        <Textarea
          id="careInstructions"
          value={formData.careInstructions}
          onChange={(e) => setFormData(prev => ({ ...prev, careInstructions: e.target.value }))}
          placeholder="Washing and care instructions"
          rows={3}
          className="text-base resize-none dark:bg-gray-800 dark:border-gray-700 dark:text-white"
        />
      </div>

      <div className="flex justify-end gap-2 pt-4">
        <Button variant="outline" onClick={onCancel} className="dark:border-gray-600 dark:text-white">
          Cancel
        </Button>
        <Button onClick={onSubmit}>
          {submitLabel}
        </Button>
      </div>
    </div>
  );
}
