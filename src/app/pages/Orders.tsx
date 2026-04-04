import { Link } from "react-router-dom";
import { motion } from "motion/react";
import { useEffect, useMemo, useState } from "react";
import { ArrowLeft, Package, Clock, CheckCircle, Truck, XCircle } from "lucide-react";
import { toast } from "sonner";
import { useAuth } from "../contexts/AuthContext";
import { useProducts } from "../contexts/ProductsContext";
import { supabase } from "../../lib/supabase";
import { StoredReview } from "../utils/reviews";

type CustomerOrder = any;

export function Orders() {
  const { user } = useAuth();
  const { products } = useProducts();
  const [storedOrders, setStoredOrders] = useState<any[]>([]);
  const [storedReviews, setStoredReviews] = useState<any[]>([]);
  const [reviewDraft, setReviewDraft] = useState({
    orderId: "",
    productId: "",
    productName: "",
    rating: 5,
    title: "",
    comment: "",
  });
  const [reviewModalOpen, setReviewModalOpen] = useState(false);
  const [selectedOrderDetails, setSelectedOrderDetails] = useState<CustomerOrder | null>(null);
  const [selectedTrackingOrder, setSelectedTrackingOrder] = useState<CustomerOrder | null>(null);
  const [selectedExchangeOrder, setSelectedExchangeOrder] = useState<CustomerOrder | null>(null);
  const [exchangeDraft, setExchangeDraft] = useState({
    reason: "",
    images: [] as string[],
  });

  useEffect(() => {
    const fetchOrders = async () => {
      if (!user) return;

      const { data, error } = await supabase
        .from("orders")
        .select("*")
        .eq("customer_id", user.id)
        .order("created_at", { ascending: false });

      if (!error) {
        setStoredOrders(data || []);
      }
    };

    fetchOrders();
  }, [user]);

  useEffect(() => {
    const channel = supabase
      .channel("orders")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "orders" },
        () => {
          if (user) {
            supabase
              .from("orders")
              .select("*")
              .eq("customer_id", user.id)
              .then(({ data }) => setStoredOrders(data || []));
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user]);

  const visibleOrders = useMemo(() => {
    const ordersToRender = storedOrders;
    return ordersToRender.map((order) => ({
      ...order,
      items: order.items.map((item: any) => ({
        ...item,
        image:
          products.find((product) => product.id === item.id)?.image ||
          products.find((product) => product.id === item.id)?.images?.[0] ||
          "https://images.unsplash.com/photo-1441986300917-64674bd600d8?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1080",
      })),
    }));
  }, [products, storedOrders]);

  if (!user) {
    return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white text-black p-8 rounded-lg shadow-lg max-w-md w-full text-center"
        >
          <h1 className="text-2xl font-bold mb-4 tracking-widest uppercase">
            Access Denied
          </h1>
          <p className="text-gray-600 mb-6 tracking-wider">
            Please sign in to view your orders.
          </p>
          <Link
            to="/signin"
            className="inline-block bg-black text-white px-6 py-3 hover:bg-gray-800 transition-colors tracking-widest uppercase text-sm"
          >
            Sign In
          </Link>
        </motion.div>
      </div>
    );
  }

  const getStatusIcon = (status: CustomerOrder["status"]) => {
    switch (status) {
      case "pending":
        return <Clock size={16} className="text-yellow-500" />;
      case "processing":
        return <Package size={16} className="text-blue-500" />;
      case "shipped":
        return <Truck size={16} className="text-purple-500" />;
      case "delivered":
        return <CheckCircle size={16} className="text-green-500" />;
      case "cancelled":
        return <XCircle size={16} className="text-red-500" />;
      case "returned":
        return <XCircle size={16} className="text-orange-500" />;
      case "exchange_requested":
        return <Package size={16} className="text-cyan-600" />;
    }
  };

  const getStatusText = (status: CustomerOrder["status"]) => {
    switch (status) {
      case "pending":
        return "Order Placed";
      case "processing":
        return "Processing";
      case "shipped":
        return "Shipped";
      case "delivered":
        return "Delivered";
      case "cancelled":
        return "Cancelled";
      case "returned":
        return "Returned";
      case "exchange_requested":
        return "Exchange Request";
    }
  };

  const getExchangeStatusLabel = (order: CustomerOrder) => {
    switch (order.exchangeRequest?.status) {
      case "pending":
        return "Exchange Request Pending";
      case "approved":
        return "Exchange Request Approved";
      case "rejected":
        return "Exchange Request Rejected";
      default:
        return "";
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const fileToDataUrl = (file: File) =>
    new Promise<string>((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = () => reject(new Error("Unable to read file"));
      reader.readAsDataURL(file);
    });

  const openReviewModal = (orderId: string, productId: string, productName: string) => {
    setReviewDraft({
      orderId,
      productId,
      productName,
      rating: 5,
      title: "",
      comment: "",
    });
    setReviewModalOpen(true);
  };

  const handleSubmitReview = async () => {
    if (!user) {
      return;
    }

    if (!reviewDraft.title.trim() || !reviewDraft.comment.trim()) {
      toast.error("Please complete the review title and comment");
      return;
    }

    await supabase.from("reviews").insert([
      {
        order_id: reviewDraft.orderId,
        customer_name: user.name || "User",
        customer_email: user.email,
        product_id: reviewDraft.productId,
        product_name: reviewDraft.productName,
        rating: reviewDraft.rating,
        title: reviewDraft.title.trim(),
        comment: reviewDraft.comment.trim(),
        status: "pending",
      },
    ]);

    setReviewModalOpen(false);
    toast.success("Review submitted for admin approval");
  };

  const hasSubmittedReview = (orderId: string, productId: string) =>
    storedReviews.some(
      (review) =>
        review.orderId === orderId &&
        review.productId === productId &&
        review.customerEmail.toLowerCase() === user.email.toLowerCase()
    );

  const getSubmittedReview = (orderId: string, productId: string) =>
    storedReviews.find(
      (review) =>
        review.orderId === orderId &&
        review.productId === productId &&
        review.customerEmail.toLowerCase() === user.email.toLowerCase()
    );

  const getReviewStatusLabel = (status: StoredReview["status"]) => {
    switch (status) {
      case "pending":
        return "Review Pending Approval";
      case "approved":
        return "Review Approved";
      case "rejected":
        return "Review Needs Update";
    }
  };

  const handleExchangeImagesChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files ?? []).slice(0, 3);
    if (files.length === 0) {
      return;
    }

    try {
      const imageData = await Promise.all(files.map((file) => fileToDataUrl(file)));
      setExchangeDraft((current) => ({ ...current, images: imageData }));
    } catch {
      toast.error("Unable to read the selected exchange images");
    }
  };

  const openExchangeModal = (order: CustomerOrder) => {
    setSelectedExchangeOrder(order);
    setExchangeDraft({
      reason: order.exchangeRequest?.reason ?? "",
      images: order.exchangeRequest?.images ?? [],
    });
  };

  const handleSubmitExchangeRequest = async () => {
    if (!selectedExchangeOrder) {
      return;
    }

    if (!exchangeDraft.reason.trim()) {
      toast.error("Please write the reason for the exchange request");
      return;
    }

    const { error } = await supabase
      .from("orders")
      .update({
        status: "exchange_requested",
        exchangeRequest: {
          status: "pending",
          reason: exchangeDraft.reason.trim(),
          images: exchangeDraft.images,
          requestedAt: new Date().toISOString(),
        },
      })
      .eq("id", selectedExchangeOrder.id);

    if (!error) {
      toast.success("Exchange request sent for admin review");
      setSelectedExchangeOrder(null);
      setExchangeDraft({ reason: "", images: [] });
    }
  };

  const trackingSteps: CustomerOrder["status"][] = [
    "pending",
    "processing",
    "shipped",
    "delivered",
  ];

  const getTrackingStepState = (order: CustomerOrder, step: CustomerOrder["status"]) => {
    if (order.status === "cancelled") {
      return "cancelled";
    }

    if (order.status === "returned") {
      return step === "delivered" ? "complete" : trackingSteps.indexOf(step) <= 2 ? "complete" : "upcoming";
    }

    const currentIndex = trackingSteps.indexOf(
      order.status === "exchange_requested" ? "delivered" : order.status
    );
    const stepIndex = trackingSteps.indexOf(step);
    if (stepIndex <= currentIndex) {
      return "complete";
    }
    return "upcoming";
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-black text-white py-6 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <Link
            to="/profile"
            className="inline-flex items-center gap-2 text-gray-300 hover:text-white transition-colors"
          >
            <ArrowLeft size={16} />
            <span className="text-sm tracking-wider uppercase">Back to Profile</span>
          </Link>
          <h1 className="text-2xl tracking-widest uppercase">My Orders</h1>
          <div></div> {/* Spacer for flex layout */}
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {visibleOrders.length === 0 ? (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center py-16"
          >
            <Package size={64} className="mx-auto text-gray-300 mb-4" />
            <h2 className="text-2xl font-semibold mb-2 tracking-widest uppercase">
              No Orders Yet
            </h2>
            <p className="text-gray-600 mb-6 tracking-wider">
              You haven't placed any orders yet. Start shopping to see your orders here.
            </p>
            <Link
              to="/shop"
              className="inline-block bg-black text-white px-6 py-3 hover:bg-gray-800 transition-colors tracking-widest uppercase text-sm"
            >
              Start Shopping
            </Link>
          </motion.div>
        ) : (
          <div className="space-y-6">
            {visibleOrders.map((order, index) => (
              <motion.div
                key={order.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className="bg-white rounded-lg shadow-sm overflow-hidden"
              >
                {/* Order Header */}
                <div className="bg-gray-50 px-6 py-4 border-b">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="font-semibold tracking-wider uppercase">
                        Order #{order.id}
                      </h3>
                      <p className="text-sm text-gray-600 tracking-wider">
                        Placed on {formatDate(order.date)}
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      {getStatusIcon(order.status)}
                      <span className="text-sm font-medium tracking-wider uppercase">
                        {getStatusText(order.status)}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Order Items */}
                <div className="px-6 py-4">
                  {order.items.map((item: any) => (
                    <div key={item.id} className="mb-4 last:mb-0">
                      <div className="flex items-center gap-4">
                      <img
                        src={item.image}
                        alt={item.name}
                        className="w-16 h-16 object-cover rounded"
                      />
                      <div className="flex-1">
                        <h4 className="font-medium tracking-wider">{item.name}</h4>
                        <p className="text-sm text-gray-600 tracking-wider">
                          Quantity: {item.quantity}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="font-medium tracking-wider">
                          NPR {item.price.toLocaleString()}
                        </p>
                        {order.status === "delivered" ? (
                          hasSubmittedReview(order.id, item.id) ? (
                            <p className="mt-2 text-xs uppercase tracking-wider text-green-600">
                              {getReviewStatusLabel(
                                getSubmittedReview(order.id, item.id)?.status ?? "pending"
                              )}
                            </p>
                          ) : (
                            <button
                              type="button"
                              onClick={() => openReviewModal(order.id, item.id, item.name)}
                              className="mt-2 text-xs uppercase tracking-wider text-blue-600 hover:text-blue-800"
                            >
                              Write Review
                            </button>
                          )
                        ) : null}
                      </div>
                    </div>
                      {order.exchangeRequest ? (
                        <div className="mt-3 rounded-lg border border-amber-200 bg-amber-50 p-4">
                          <p className="text-xs uppercase tracking-wider text-amber-700">
                            {getExchangeStatusLabel(order)}
                          </p>
                          <p className="mt-2 text-sm text-gray-700">
                            {order.exchangeRequest.reason}
                          </p>
                          {order.exchangeRequest.adminMessage ? (
                            <div className="mt-3 rounded border border-amber-200 bg-white/70 p-3">
                              <p className="text-xs uppercase tracking-wider text-gray-500">
                                Admin Message
                              </p>
                              <p className="mt-2 text-sm text-gray-700">
                                {order.exchangeRequest.adminMessage}
                              </p>
                            </div>
                          ) : null}
                          {order.exchangeRequest.reviewedBy ? (
                            <p className="mt-2 text-xs uppercase tracking-wider text-gray-500">
                              Reviewed by {order.exchangeRequest.reviewedBy}
                            </p>
                          ) : null}
                        </div>
                      ) : null}
                      {(() => {
                        const submittedReview = getSubmittedReview(order.id, item.id);
                        if (!submittedReview?.adminReply) {
                          return null;
                        }

                        return (
                          <div className="mt-3 rounded-lg border border-black/10 bg-gray-50 p-4">
                            <p className="text-xs uppercase tracking-wider text-gray-500">
                              Reply from {submittedReview.adminReplyBy || "Admin"}
                            </p>
                            <p className="mt-2 text-sm text-gray-700">
                              {submittedReview.adminReply}
                            </p>
                          </div>
                        );
                      })()}
                    </div>
                  ))}
                </div>

                {/* Order Footer */}
                <div className="bg-gray-50 px-6 py-4 border-t">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <button
                        type="button"
                        onClick={() => setSelectedOrderDetails(order)}
                        className="text-sm text-blue-600 hover:text-blue-800 tracking-wider uppercase"
                      >
                        View Details
                      </button>
                      <button
                        type="button"
                        onClick={() => setSelectedTrackingOrder(order)}
                        className="text-sm text-blue-600 hover:text-blue-800 tracking-wider uppercase"
                        disabled={
                          order.status === "cancelled" ||
                          order.status === "returned" ||
                          order.status === "exchange_requested"
                        }
                      >
                        Track Order
                      </button>
                      {order.status === "delivered" && !order.exchangeRequest ? (
                        <button
                          type="button"
                          onClick={() => openExchangeModal(order)}
                          className="text-sm text-amber-700 hover:text-amber-900 tracking-wider uppercase"
                        >
                          Request Exchange
                        </button>
                      ) : null}
                    </div>
                    <div className="text-right">
                      <p className="text-sm text-gray-600 tracking-wider uppercase">
                        Total
                      </p>
                      <p className="font-semibold tracking-wider">
                        NPR {order.total.toLocaleString()}
                      </p>
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>

      {reviewModalOpen ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.96 }}
            animate={{ opacity: 1, scale: 1 }}
            className="w-full max-w-xl rounded-lg bg-white shadow-xl"
          >
            <div className="border-b px-6 py-4">
              <h3 className="text-xl font-semibold tracking-wider uppercase">
                Review {reviewDraft.productName}
              </h3>
              <p className="mt-1 text-sm text-gray-600">
                Your review will appear after admin approval.
              </p>
            </div>
            <div className="space-y-4 px-6 py-6">
              <div>
                <label className="mb-2 block text-sm uppercase tracking-wider text-gray-500">
                  Rating
                </label>
                <select
                  value={reviewDraft.rating}
                  onChange={(event) =>
                    setReviewDraft((current) => ({
                      ...current,
                      rating: Number(event.target.value),
                    }))
                  }
                  className="w-full border border-gray-300 px-4 py-3 focus:border-black focus:outline-none"
                >
                  {[5, 4, 3, 2, 1].map((rating) => (
                    <option key={rating} value={rating}>
                      {rating} Star{rating !== 1 ? "s" : ""}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="mb-2 block text-sm uppercase tracking-wider text-gray-500">
                  Title
                </label>
                <input
                  type="text"
                  value={reviewDraft.title}
                  onChange={(event) =>
                    setReviewDraft((current) => ({
                      ...current,
                      title: event.target.value,
                    }))
                  }
                  className="w-full border border-gray-300 px-4 py-3 focus:border-black focus:outline-none"
                  placeholder="Short review title"
                />
              </div>
              <div>
                <label className="mb-2 block text-sm uppercase tracking-wider text-gray-500">
                  Review
                </label>
                <textarea
                  value={reviewDraft.comment}
                  onChange={(event) =>
                    setReviewDraft((current) => ({
                      ...current,
                      comment: event.target.value,
                    }))
                  }
                  rows={5}
                  className="w-full resize-none border border-gray-300 px-4 py-3 focus:border-black focus:outline-none"
                  placeholder="Share what you liked, sizing, quality, and overall experience"
                />
              </div>
            </div>
            <div className="flex justify-end gap-3 border-t px-6 py-4">
              <button
                type="button"
                onClick={() => setReviewModalOpen(false)}
                className="px-4 py-2 text-sm uppercase tracking-wider text-gray-600 hover:text-black"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleSubmitReview}
                className="bg-black px-5 py-2 text-sm uppercase tracking-wider text-white transition-colors hover:bg-gray-800"
              >
                Submit Review
              </button>
            </div>
          </motion.div>
        </div>
      ) : null}

      {selectedOrderDetails ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.96 }}
            animate={{ opacity: 1, scale: 1 }}
            className="w-full max-w-2xl rounded-lg bg-white shadow-xl"
          >
            <div className="flex items-center justify-between border-b px-6 py-4">
              <h3 className="text-xl font-semibold tracking-wider uppercase">
                Order Details
              </h3>
              <button
                type="button"
                onClick={() => setSelectedOrderDetails(null)}
                className="text-sm uppercase tracking-wider text-gray-500 hover:text-black"
              >
                Close
              </button>
            </div>
            <div className="space-y-6 px-6 py-6">
              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <p className="text-xs uppercase tracking-wider text-gray-500">Order ID</p>
                  <p className="mt-1 text-sm">{selectedOrderDetails.id}</p>
                </div>
                <div>
                  <p className="text-xs uppercase tracking-wider text-gray-500">Status</p>
                  <p className="mt-1 text-sm">{getStatusText(selectedOrderDetails.status)}</p>
                </div>
                <div>
                  <p className="text-xs uppercase tracking-wider text-gray-500">Placed On</p>
                  <p className="mt-1 text-sm">{formatDate(selectedOrderDetails.date)}</p>
                </div>
                <div>
                  <p className="text-xs uppercase tracking-wider text-gray-500">Total</p>
                  <p className="mt-1 text-sm">NPR {selectedOrderDetails.total.toLocaleString()}</p>
                </div>
              </div>
              <div>
                <p className="text-xs uppercase tracking-wider text-gray-500">Shipping Address</p>
                <p className="mt-1 text-sm text-gray-700">{selectedOrderDetails.shippingAddress}</p>
              </div>
              <div>
                <p className="text-xs uppercase tracking-wider text-gray-500">Items</p>
                <div className="mt-3 space-y-3">
                  {selectedOrderDetails.items.map((item: any) => (
                    <div key={item.id} className="flex items-center justify-between rounded border border-gray-200 px-4 py-3">
                      <div className="flex items-center gap-3">
                        <img src={item.image} alt={item.name} className="h-12 w-12 rounded object-cover" />
                        <div>
                          <p className="text-sm font-medium">{item.name}</p>
                          <p className="text-xs text-gray-500">Qty: {item.quantity}</p>
                        </div>
                      </div>
                      <p className="text-sm font-medium">NPR {item.price.toLocaleString()}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      ) : null}

      {selectedTrackingOrder ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.96 }}
            animate={{ opacity: 1, scale: 1 }}
            className="w-full max-w-xl rounded-lg bg-white shadow-xl"
          >
            <div className="flex items-center justify-between border-b px-6 py-4">
              <h3 className="text-xl font-semibold tracking-wider uppercase">Track Order</h3>
              <button
                type="button"
                onClick={() => setSelectedTrackingOrder(null)}
                className="text-sm uppercase tracking-wider text-gray-500 hover:text-black"
              >
                Close
              </button>
            </div>
            <div className="space-y-4 px-6 py-6">
              {trackingSteps.map((step) => {
                const state = getTrackingStepState(selectedTrackingOrder, step);
                return (
                  <div key={step} className="flex items-start gap-3">
                    <div
                      className={`mt-1 h-3 w-3 rounded-full ${
                        state === "complete"
                          ? "bg-green-500"
                          : state === "cancelled"
                            ? "bg-red-500"
                            : "bg-gray-300"
                      }`}
                    />
                    <div>
                      <p className="text-sm font-medium uppercase tracking-wider">
                        {getStatusText(step)}
                      </p>
                      <p className="text-xs text-gray-500">
                        {state === "complete"
                          ? "Completed"
                          : state === "cancelled"
                            ? "Order cancelled before this stage"
                            : "Waiting"}
                      </p>
                    </div>
                  </div>
                );
              })}
              {selectedTrackingOrder.trackingNumber ? (
                <div className="rounded-lg border border-gray-200 bg-gray-50 px-4 py-3">
                  <p className="text-xs uppercase tracking-wider text-gray-500">Tracking Number</p>
                  <p className="mt-1 text-sm">{selectedTrackingOrder.trackingNumber}</p>
                </div>
              ) : null}
            </div>
          </motion.div>
        </div>
      ) : null}

      {selectedExchangeOrder ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.96 }}
            animate={{ opacity: 1, scale: 1 }}
            className="w-full max-w-xl rounded-lg bg-white shadow-xl"
          >
            <div className="border-b px-6 py-4">
              <h3 className="text-xl font-semibold tracking-wider uppercase">
                Request Exchange
              </h3>
              <p className="mt-1 text-sm text-gray-600">
                Add the reason and photos. Exchange only proceeds after admin approval.
              </p>
            </div>
            <div className="space-y-4 px-6 py-6">
              <div>
                <label className="mb-2 block text-sm uppercase tracking-wider text-gray-500">
                  Reason
                </label>
                <textarea
                  value={exchangeDraft.reason}
                  onChange={(event) =>
                    setExchangeDraft((current) => ({ ...current, reason: event.target.value }))
                  }
                  rows={5}
                  className="w-full resize-none border border-gray-300 px-4 py-3 focus:border-black focus:outline-none"
                  placeholder="Describe the sizing issue, defect, or exchange reason"
                />
              </div>
              <div>
                <label className="mb-2 block text-sm uppercase tracking-wider text-gray-500">
                  Photos
                </label>
                <input
                  type="file"
                  accept="image/*"
                  multiple
                  onChange={handleExchangeImagesChange}
                  className="w-full text-sm"
                />
                <p className="mt-2 text-xs text-gray-500">
                  You can upload up to 3 images.
                </p>
                {exchangeDraft.images.length > 0 ? (
                  <div className="mt-3 grid grid-cols-3 gap-3">
                    {exchangeDraft.images.map((image, index) => (
                      <img
                        key={`${index}-${image.slice(0, 20)}`}
                        src={image}
                        alt={`Exchange proof ${index + 1}`}
                        className="h-24 w-full rounded object-cover"
                      />
                    ))}
                  </div>
                ) : null}
              </div>
            </div>
            <div className="flex justify-end gap-3 border-t px-6 py-4">
              <button
                type="button"
                onClick={() => setSelectedExchangeOrder(null)}
                className="px-4 py-2 text-sm uppercase tracking-wider text-gray-600 hover:text-black"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleSubmitExchangeRequest}
                className="bg-black px-5 py-2 text-sm uppercase tracking-wider text-white transition-colors hover:bg-gray-800"
              >
                Send Request
              </button>
            </div>
          </motion.div>
        </div>
      ) : null}
    </div>
  );
}
