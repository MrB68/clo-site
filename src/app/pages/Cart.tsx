import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Trash2, Plus, Minus, ArrowRight, ShoppingBag } from "lucide-react";
import { useProducts } from "../contexts/ProductsContext";

interface CartItem {
  productId: string;
  quantity: number;
  selectedSize: string;
  selectedColor: string;
}

interface LegacyCartItem {
  productId?: string | { id?: string; name?: string; price?: number; image?: string; category?: string };
  quantity?: number;
  selectedSize?: string;
  selectedColor?: string;
  size?: string;
  color?: string;
  product?: {
    id?: string;
    sizes?: string[];
    colors?: string[];
  };
}

function normalizeCartItems(value: string | null): CartItem[] {
  if (!value) {
    return [];
  }

  try {
    const parsed = JSON.parse(value);
    if (!Array.isArray(parsed)) {
      return [];
    }

    return parsed
      .map((item: LegacyCartItem) => {
        const rawProductId = item.productId;
        const productId =
          typeof rawProductId === "string"
            ? rawProductId
            : rawProductId?.id ?? item.product?.id;

        if (!productId) {
          return null;
        }

        return {
          productId,
          quantity:
            typeof item.quantity === "number" && item.quantity > 0
              ? item.quantity
              : 1,
          selectedSize:
            item.selectedSize ?? item.size ?? item.product?.sizes?.[0] ?? "One Size",
          selectedColor:
            item.selectedColor ?? item.color ?? item.product?.colors?.[0] ?? "Default",
        };
      })
      .filter((item): item is CartItem => item !== null);
  } catch {
    return [];
  }
}

export function Cart() {
  const { products } = useProducts();
  const navigate = useNavigate();

  const [cartItems, setCartItems] = useState<CartItem[]>(() =>
    normalizeCartItems(localStorage.getItem("cartItems"))
  );

  useEffect(() => {
    const loadCart = () => {
      setCartItems(normalizeCartItems(localStorage.getItem("cartItems")));
    };

    loadCart();
    window.addEventListener("cartUpdated", loadCart);
    window.addEventListener("storage", loadCart);

    return () => {
      window.removeEventListener("cartUpdated", loadCart);
      window.removeEventListener("storage", loadCart);
    };
  }, []);

  useEffect(() => {
    localStorage.setItem("cartItems", JSON.stringify(cartItems));
    window.dispatchEvent(new Event("cartUpdated"));
  }, [cartItems]);

  const populatedCartItems = cartItems
    .map((item) => ({
      ...item,
      product: products.find((product) => product.id === item.productId),
    }))
    .filter(
      (
        item
      ): item is CartItem & {
        product: NonNullable<(typeof products)[number]>;
      } => Boolean(item.product)
    );

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

  const subtotal = populatedCartItems.reduce(
    (sum, item) => sum + item.product.price * item.quantity,
    0
  );
  const totalItemCount = populatedCartItems.reduce(
    (sum, item) => sum + item.quantity,
    0
  );

  const shipping = subtotal > 100 ? 0 : 500;
  const total = subtotal + shipping;

  if (!products || products.length === 0) {
    return <div className="pt-20 text-center">Loading...</div>;
  }

  if (populatedCartItems.length === 0) {
    return (
      <div className="min-h-screen bg-white pt-20 text-black transition-colors duration-300 dark:bg-black dark:text-white">
        <div className="max-w-7xl mx-auto px-4 py-24 text-center space-y-6">
          <ShoppingBag size={64} className="mx-auto text-gray-400 dark:text-gray-500" />
          <h2 className="text-3xl">Your Cart is Empty</h2>
          <p className="text-gray-600 dark:text-gray-400">
            Looks like you haven't added anything yet.
          </p>
          <button
            type="button"
            onClick={() => window.location.assign("/shop")}
            className="inline-flex items-center gap-2 bg-black px-8 py-4 text-white transition-colors hover:bg-neutral-800 dark:bg-white dark:text-black dark:hover:bg-neutral-200"
          >
            Continue Shopping <ArrowRight size={18} />
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white pt-20 text-black transition-colors duration-300 dark:bg-black dark:text-white">
      {/* Header */}
      <div className="bg-black text-white py-16 text-center">
        <h1 className="text-4xl tracking-wider mb-2">YOUR CART</h1>
        <p className="text-gray-400 dark:text-gray-500">{totalItemCount} items</p>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-4 py-12 grid lg:grid-cols-3 gap-12">
        {/* Items */}
        <div className="lg:col-span-2 space-y-6">
          {populatedCartItems.map((item, index) => (
            <div key={index} className="flex gap-6 border-b border-black/10 pb-6 dark:border-white/10">
              {/* Image */}
              <Link
                to={`/product/${item.product.id}`}
                className="h-40 bg-gray-100 transition-colors duration-300 dark:bg-neutral-900"
              >
                <img
                  src={item.product.image}
                  alt={item.product.name}
                  className="h-full object-cover"
                />
              </Link>

              {/* Details */}
              <div className="flex-1 flex flex-col justify-between">
                <div>
                  <Link
                    to={`/product/${item.product.id}`}
                    className="text-lg"
                  >
                    {item.product.name}
                  </Link>

                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    {item.product.category}
                  </p>

                  <p className="text-sm">Size: {item.selectedSize}</p>
                  <p className="text-sm">Color: {item.selectedColor}</p>
                </div>

                <div className="flex justify-between items-center mt-4">
                  {/* Quantity */}
                  <div className="flex border border-black/15 dark:border-white/15">
                    <button
                      onClick={() => updateQuantity(index, -1)}
                      className="px-3 py-2 transition-colors hover:bg-gray-100 dark:hover:bg-neutral-900"
                    >
                      <Minus size={16} />
                    </button>
                    <span className="px-4">{item.quantity}</span>
                    <button
                      onClick={() => updateQuantity(index, 1)}
                      className="px-3 py-2 transition-colors hover:bg-gray-100 dark:hover:bg-neutral-900"
                    >
                      <Plus size={16} />
                    </button>
                  </div>

                  {/* Price */}
                  <p>NPR {(item.product.price * item.quantity).toLocaleString("en-NP")}</p>
                </div>
              </div>

              {/* Remove */}
              <button
                onClick={() => removeItem(index)}
                className="transition-colors hover:text-red-500"
              >
                <Trash2 size={18} />
              </button>
            </div>
          ))}
        </div>

        {/* Summary */}
        <div className="h-fit space-y-6 border border-black/10 bg-gray-50 p-8 transition-colors duration-300 dark:border-white/10 dark:bg-neutral-950">
          <h2 className="text-2xl">Order Summary</h2>

          <div className="flex justify-between">
            <span>Subtotal</span>
            <span>NPR {subtotal.toLocaleString("en-NP")}</span>
          </div>

          <div className="flex justify-between">
            <span>Shipping</span>
            <span>{shipping === 0 ? "Free" : `NPR ${shipping.toLocaleString("en-NP")}`}</span>
          </div>

          <div className="flex justify-between border-t border-black/10 pt-3 text-lg dark:border-white/10">
            <span>Total</span>
            <span>NPR {total.toLocaleString("en-NP")}</span>
          </div>

          <button
            type="button"
            onClick={() => window.location.assign("/checkout")}
            className="w-full bg-black py-4 text-white transition hover:bg-gray-900 dark:bg-white dark:text-black dark:hover:bg-neutral-200"
          >
            Checkout
          </button>
        </div>
      </div>
    </div>
  );
}
