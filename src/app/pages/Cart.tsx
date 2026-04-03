import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { motion } from "motion/react";
import { Trash2, Plus, Minus, ArrowRight, ShoppingBag } from "lucide-react";
import { useProducts } from "../contexts/ProductsContext";

interface CartItem {
  product: any;
  quantity: number;
  selectedSize: string;
  selectedColor: string;
}

export function Cart() {
  const { products } = useProducts();

  const [cartItems, setCartItems] = useState<CartItem[]>([]);

  // ✅ Initialize only when products are loaded
  useEffect(() => {
    if (products && products.length > 0) {
      setCartItems([
        {
          product: products[0],
          quantity: 1,
          selectedSize: "M",
          selectedColor: "Black",
        },
        {
          product: products[4],
          quantity: 2,
          selectedSize: "L",
          selectedColor: "Blue",
        },
      ]);
    }
  }, [products]);

  const updateQuantity = (index: number, delta: number) => {
    setCartItems((items) =>
      items.map((item, i) =>
        i === index
          ? { ...item, quantity: Math.max(1, item.quantity + delta) }
          : item
      )
    );
  };

  const removeItem = (index: number) => {
    setCartItems((items) => items.filter((_, i) => i !== index));
  };

  // ✅ Safe subtotal calculation
  const subtotal = cartItems.reduce(
    (sum, item) => sum + (item.product?.price || 0) * item.quantity,
    0
  );

  const shipping = subtotal > 100 ? 0 : 15;
  const total = subtotal + shipping;

  // ✅ Loading state
  if (!products || products.length === 0) {
    return <div className="pt-20 text-center">Loading...</div>;
  }

  // ✅ Empty cart
  if (cartItems.length === 0) {
    return (
      <div className="pt-20 min-h-screen">
        <div className="max-w-7xl mx-auto px-4 py-24 text-center space-y-6">
          <ShoppingBag size={64} className="mx-auto text-gray-400" />
          <h2 className="text-3xl">Your Cart is Empty</h2>
          <p className="text-gray-600">
            Looks like you haven't added anything yet.
          </p>
          <Link
            to="/shop"
            className="inline-flex items-center gap-2 bg-black text-white px-8 py-4"
          >
            Continue Shopping <ArrowRight size={18} />
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="pt-20">
      {/* Header */}
      <div className="bg-black text-white py-16 text-center">
        <h1 className="text-4xl tracking-wider mb-2">YOUR CART</h1>
        <p className="text-gray-400">{cartItems.length} items</p>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-4 py-12 grid lg:grid-cols-3 gap-12">
        {/* Items */}
        <div className="lg:col-span-2 space-y-6">
          {cartItems.map((item, index) => (
            <div key={index} className="flex gap-6 border-b pb-6">
              {/* Image */}
              <Link
                to={`/product/${item.product?.id}`}
                className="h-40 bg-gray-100"
              >
                <img
                  src={item.product?.image}
                  alt={item.product?.name}
                  className="h-full object-cover"
                />
              </Link>

              {/* Details */}
              <div className="flex-1 flex flex-col justify-between">
                <div>
                  <Link
                    to={`/product/${item.product?.id}`}
                    className="text-lg"
                  >
                    {item.product?.name}
                  </Link>

                  <p className="text-sm text-gray-500">
                    {item.product?.category}
                  </p>

                  <p className="text-sm">Size: {item.selectedSize}</p>
                  <p className="text-sm">Color: {item.selectedColor}</p>
                </div>

                <div className="flex justify-between items-center mt-4">
                  {/* Quantity */}
                  <div className="flex border">
                    <button onClick={() => updateQuantity(index, -1)}>
                      <Minus size={16} />
                    </button>
                    <span className="px-4">{item.quantity}</span>
                    <button onClick={() => updateQuantity(index, 1)}>
                      <Plus size={16} />
                    </button>
                  </div>

                  {/* Price */}
                  <p>
                    $
                    {(
                      (item.product?.price || 0) * item.quantity
                    ).toFixed(2)}
                  </p>
                </div>
              </div>

              {/* Remove */}
              <button onClick={() => removeItem(index)}>
                <Trash2 size={18} />
              </button>
            </div>
          ))}
        </div>

        {/* Summary */}
        <div className="bg-gray-50 p-8 space-y-6 h-fit">
          <h2 className="text-2xl">Order Summary</h2>

          <div className="flex justify-between">
            <span>Subtotal</span>
            <span>${subtotal.toFixed(2)}</span>
          </div>

          <div className="flex justify-between">
            <span>Shipping</span>
            <span>{shipping === 0 ? "Free" : `$${shipping}`}</span>
          </div>

          <div className="flex justify-between text-lg border-t pt-3">
            <span>Total</span>
            <span>${total.toFixed(2)}</span>
          </div>

          <button className="w-full bg-black text-white py-4">
            Checkout
          </button>
        </div>
      </div>
    </div>
  );
}