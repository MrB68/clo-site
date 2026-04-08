import { useState } from "react";
import { supabase } from "../../lib/supabase";

export default function TrackOrder() {
  const [email, setEmail] = useState("");
  const [orderCode, setOrderCode] = useState("");
  const [order, setOrder] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleTrack = async () => {
    setError("");
    setOrder(null);

    if (!email || !orderCode) {
      setError("Please enter email and order code");
      return;
    }

    setLoading(true);

    const { data, error } = await supabase
      .from("orders")
      .select("*")
      .eq("customer_email", email.toLowerCase())
      .eq("order_code", orderCode)
      .single();

    setLoading(false);

    if (error || !data) {
      setError("Order not found");
      return;
    }

    setOrder(data);
  };

  return (
    <div className="min-h-screen bg-black text-white pt-24 px-4">
      <div className="max-w-xl mx-auto space-y-6">
        <h1 className="text-3xl text-center tracking-wider">
          TRACK YOUR ORDER
        </h1>

        {/* Inputs */}
        <input
          type="email"
          placeholder="Enter your email"
          className="w-full p-3 bg-neutral-900 border border-white/10"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />

        <input
          type="text"
          placeholder="Enter order code"
          className="w-full p-3 bg-neutral-900 border border-white/10"
          value={orderCode}
          onChange={(e) => setOrderCode(e.target.value)}
        />

        <button
          onClick={handleTrack}
          className="w-full bg-white text-black py-3"
        >
          {loading ? "Checking..." : "Track Order"}
        </button>

        {error && <p className="text-red-500 text-sm">{error}</p>}

        {/* Result */}
        {order && (
          <div className="border border-white/10 p-4 space-y-3">
            <p><strong>Order Code:</strong> {order.order_code}</p>
            <p><strong>Status:</strong> {order.status}</p>
            <p><strong>Total:</strong> NPR {order.total}</p>

            <div>
              <strong>Items:</strong>
              {order.items?.map((item: any, i: number) => (
                <div key={i} className="text-sm text-gray-400">
                  {item.name} × {item.quantity}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}