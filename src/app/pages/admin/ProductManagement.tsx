import { useState, useEffect, useRef } from "react";
import { motion } from "motion/react";
import { Plus, Edit, Trash2, Package, Image, Star, Eye, EyeOff, Upload, X } from "lucide-react";
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
import { products as defaultProducts } from "../../data/products";

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

interface FormData {
  name: string;
  price: string;
  originalPrice: string;
  description: string;
  category: string;
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
  const [products, setProducts] = useState<Product[]>([]);
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
    // Load products from localStorage (same as main app) or use default data
    const savedProducts = localStorage.getItem('mainProducts');
    if (savedProducts) {
      const parsedProducts = JSON.parse(savedProducts);
      setProducts(parsedProducts.map((p: any) => ({
        ...p,
        images: p.images || (p.image ? [p.image] : []), // Handle both old and new formats
        stock: p.stock || 10,
        featured: p.featured || false,
        tags: p.tags || [],
        material: p.material || "",
        careInstructions: p.careInstructions || "",
        rating: p.rating || 0,
        reviews: p.reviews || 0,
        createdAt: p.createdAt || new Date().toISOString(),
        updatedAt: new Date().toISOString()
      })));
    } else {
      // Load from default products and enhance them
      setProducts(defaultProducts.map((p: any) => ({
        ...p,
        images: p.image ? [p.image] : [], // Convert single image to array
        stock: p.stock || 10,
        featured: p.featured || false,
        tags: p.tags || [],
        material: p.material || "",
        careInstructions: p.careInstructions || "",
        rating: p.rating || 0,
        reviews: p.reviews || 0,
        createdAt: p.createdAt || new Date().toISOString(),
        updatedAt: new Date().toISOString()
      })));
    }
  }, []);

  const saveProducts = (updatedProducts: Product[]) => {
    setProducts(updatedProducts);
    localStorage.setItem('mainProducts', JSON.stringify(updatedProducts));
    // Also update the admin-specific storage for consistency
    localStorage.setItem('adminProducts', JSON.stringify(updatedProducts));
    // Dispatch custom event to notify main app of product updates
    window.dispatchEvent(new CustomEvent('productsUpdated'));
  };

  const resetForm = () => {
    setFormData({
      name: "",
      price: "",
      originalPrice: "",
      description: "",
      category: "",
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

  const handleAddProduct = () => {
    const newProduct: Product = {
      id: Date.now().toString(),
      name: formData.name,
      price: parseFloat(formData.price),
      originalPrice: formData.originalPrice ? parseFloat(formData.originalPrice) : undefined,
      description: formData.description,
      category: formData.category,
      images: formData.images,
      stock: parseInt(formData.stock),
      featured: formData.featured,
      rating: 0,
      reviews: 0,
      tags: formData.tags.split(',').map(tag => tag.trim()).filter(tag => tag),
      sizes: formData.sizes,
      colors: formData.colors,
      material: formData.material,
      careInstructions: formData.careInstructions,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    const updatedProducts = [...products, newProduct];
    saveProducts(updatedProducts);
    setIsAddDialogOpen(false);
    resetForm();
  };

  const handleEditProduct = () => {
    if (!editingProduct) return;

    const updatedProduct: Product = {
      ...editingProduct,
      name: formData.name,
      price: parseFloat(formData.price),
      originalPrice: formData.originalPrice ? parseFloat(formData.originalPrice) : undefined,
      description: formData.description,
      category: formData.category,
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

    const updatedProducts = products.map(p => p.id === editingProduct.id ? updatedProduct : p);
    saveProducts(updatedProducts);
    setEditingProduct(null);
    resetForm();
  };

  const handleDeleteProduct = (productId: string) => {
    const updatedProducts = products.filter(p => p.id !== productId);
    saveProducts(updatedProducts);
  };

  const startEdit = (product: Product) => {
    setEditingProduct(product);
    setFormData({
      name: product.name,
      price: product.price.toString(),
      originalPrice: product.originalPrice?.toString() || "",
      description: product.description,
      category: product.category,
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

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (!files) return;

    const maxFileSize = 5 * 1024 * 1024; // 5MB limit
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/gif'];

    Array.from(files).forEach(file => {
      if (file.size > maxFileSize) {
        alert(`File "${file.name}" is too large. Maximum size is 5MB.`);
        return;
      }

      if (!allowedTypes.includes(file.type)) {
        alert(`File "${file.name}" is not a supported image type. Please use JPEG, PNG, WebP, or GIF.`);
        return;
      }

      const reader = new FileReader();
      reader.onload = (e) => {
        const dataUrl = e.target?.result as string;
        setFormData(prev => ({ ...prev, images: [...prev.images, dataUrl] }));
      };
      reader.readAsDataURL(file);
    });

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
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Product Management</h2>
          <p className="text-gray-600 dark:text-gray-400">Manage your product catalog, inventory, and features</p>
        </div>
        <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
          <DialogTrigger asChild>
            <Button className="flex items-center gap-2">
              <Plus size={16} />
              Add Product
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-4xl max-h-[95vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Add New Product</DialogTitle>
            </DialogHeader>
            <ProductForm
              formData={formData}
              setFormData={setFormData}
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
          </DialogContent>
        </Dialog>
      </div>

      {/* Filters */}
      <div className="flex gap-4">
        <Input
          placeholder="Search products..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="max-w-sm"
        />
        <Select value={selectedCategory} onValueChange={setSelectedCategory}>
          <SelectTrigger className="w-48">
            <SelectValue placeholder="All Categories" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Categories</SelectItem>
            {categories.map(category => (
              <SelectItem key={category} value={category}>{category}</SelectItem>
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
            <Card className="h-full">
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <CardTitle className="text-xl line-clamp-2">{product.name}</CardTitle>
                    <div className="flex items-center gap-2 mt-1">
                      <Badge variant="secondary">{product.category}</Badge>
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
                            onClick={() => handleDeleteProduct(product.id)}
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
                      <span className="text-sm text-gray-500 line-through">
                        ${product.originalPrice}
                      </span>
                    )}
                  </div>

                  <div className="flex items-center gap-2">
                    <Package size={16} className="text-gray-500" />
                    <span className="text-sm text-gray-600 dark:text-gray-400">
                      Stock: {product.stock}
                    </span>
                  </div>

                  <div className="flex items-center gap-2">
                    <Star size={16} className="text-yellow-500 fill-current" />
                    <span className="text-sm text-gray-600 dark:text-gray-400">
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
                  >
                    -1
                  </Button>
                  <Input
                    type="number"
                    value={product.stock}
                    onChange={(e) => updateStock(product.id, parseInt(e.target.value) || 0)}
                    className="w-20 text-center"
                    min="0"
                  />
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => updateStock(product.id, product.stock + 1)}
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
        <DialogContent className="max-w-4xl max-h-[95vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Edit Product</DialogTitle>
          </DialogHeader>
          {editingProduct && (
            <ProductForm
              formData={formData}
              setFormData={setFormData}
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
        </DialogContent>
      </Dialog>
    </div>
  );
}

interface ProductFormProps {
  formData: FormData;
  setFormData: (data: FormData | ((prev: FormData) => FormData)) => void;
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
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-2">
          <Label htmlFor="name">Product Name</Label>
          <Input
            id="name"
            value={formData.name}
            onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
            placeholder="Enter product name"
            className="text-base"
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="category">Category</Label>
          <Select value={formData.category} onValueChange={(value) => setFormData(prev => ({ ...prev, category: value }))}>
            <SelectTrigger className="text-base">
              <SelectValue placeholder="Select category" />
            </SelectTrigger>
            <SelectContent>
              {categories.map(category => (
                <SelectItem key={category} value={category}>{category}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Pricing Section */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-2">
          <Label htmlFor="price">Price ($)</Label>
          <Input
            id="price"
            type="number"
            step="0.01"
            value={formData.price}
            onChange={(e) => setFormData(prev => ({ ...prev, price: e.target.value }))}
            placeholder="0.00"
            className="text-base"
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
            className="text-base"
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
          className="text-base resize-none"
        />
      </div>

      {/* Stock and Featured Section */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-2">
          <Label htmlFor="stock">Stock Quantity</Label>
          <Input
            id="stock"
            type="number"
            value={formData.stock}
            onChange={(e) => setFormData(prev => ({ ...prev, stock: e.target.value }))}
            placeholder="0"
            min="0"
            className="text-base"
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
            <div key={index} className="flex items-center gap-3 p-3 border border-gray-200 rounded-lg">
              <img
                src={image}
                alt={`Preview ${index + 1}`}
                className="w-12 h-12 object-cover rounded-md border"
                onError={(e) => {
                  e.currentTarget.src = "/api/placeholder/48/48";
                }}
              />
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-900 truncate">
                  {image.startsWith('data:') ? `Uploaded image ${index + 1}` : 'URL image'}
                </p>
                <p className="text-xs text-gray-500 truncate">
                  {image.startsWith('data:') ? 'From file upload' : image}
                </p>
              </div>
              <Button variant="outline" size="sm" onClick={() => removeImage(index)} className="shrink-0">
                <X size={14} />
              </Button>
            </div>
          ))}

          {/* URL Input Section */}
          <div className="flex gap-3">
            <Input
              value={imageUrlInput}
              onChange={(e) => setImageUrlInput(e.target.value)}
              placeholder="Enter image URL (https://...)"
              className="flex-1 text-base"
            />
            <Button variant="outline" onClick={addImageUrl} disabled={!imageUrlInput.trim()} className="px-6">
              <Image size={16} className="mr-2" />
              Add URL
            </Button>
          </div>

          {/* File Upload Section */}
          <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-gray-400 transition-colors">
            <Upload size={24} className="mx-auto text-gray-400 mb-2" />
            <div className="space-y-2">
              <Input
                type="file"
                accept="image/*"
                multiple
                onChange={handleFileUpload}
                className="file:mr-4 file:py-3 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-medium file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100 file:cursor-pointer"
              />
              <p className="text-sm text-gray-600">
                Or drag and drop images here
              </p>
            </div>
          </div>

          <p className="text-sm text-gray-500 bg-gray-50 p-3 rounded-md">
            <strong>Supported formats:</strong> JPEG, PNG, WebP, GIF • <strong>Max size:</strong> 5MB per file • <strong>Multiple uploads allowed</strong>
          </p>
        </div>
      </div>

      {/* Sizes and Colors Section */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-3">
          <Label className="text-base font-medium">Available Sizes</Label>
          <div className="flex flex-wrap gap-2">
            {sizes.map(size => (
              <Button
                key={size}
                variant={formData.sizes.includes(size) ? "default" : "outline"}
                size="sm"
                onClick={() => toggleSize(size)}
                className="min-w-12"
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
                className="min-w-16"
              >
                {color}
              </Button>
            ))}
          </div>
        </div>
      </div>

      {/* Additional Details Section */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-2">
          <Label htmlFor="material" className="text-base font-medium">Material</Label>
          <Input
            id="material"
            value={formData.material}
            onChange={(e) => setFormData(prev => ({ ...prev, material: e.target.value }))}
            placeholder="e.g., Cotton, Silk, Leather"
            className="text-base"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="tags" className="text-base font-medium">Tags (comma-separated)</Label>
          <Input
            id="tags"
            value={formData.tags}
            onChange={(e) => setFormData(prev => ({ ...prev, tags: e.target.value }))}
            placeholder="e.g., summer, casual, trendy"
            className="text-base"
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
          className="text-base resize-none"
        />
      </div>

      <div className="flex justify-end gap-2 pt-4">
        <Button variant="outline" onClick={onCancel}>
          Cancel
        </Button>
        <Button onClick={onSubmit}>
          {submitLabel}
        </Button>
      </div>
    </div>
  );
}