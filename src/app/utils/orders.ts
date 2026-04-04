export interface StoredOrderItem {
  id: string;
  name: string;
  quantity: number;
  price: number;
  adminRemark?: string;
}

export interface StoredExchangeRequest {
  status: "pending" | "approved" | "rejected";
  reason: string;
  images: string[];
  requestedAt: string;
  adminMessage?: string;
  reviewedAt?: string;
  reviewedBy?: string;
}

export interface StoredOrder {
  id: string;
  customerName: string;
  customerEmail: string;
  date: string;
  status:
    | "pending"
    | "processing"
    | "shipped"
    | "delivered"
    | "cancelled"
    | "returned"
    | "exchange_requested";
  total: number;
  items: StoredOrderItem[];
  source: "website" | "instagram" | "facebook" | "tiktok";
  shippingAddress: string;
  trackingNumber?: string;
  phone?: string;
  branch?: string;
  exchangeRequest?: StoredExchangeRequest;
}

const ORDERS_STORAGE_KEY = "customerOrders";

function inferOrderBranch(order: Partial<StoredOrder>) {
  const branch = order.branch?.trim();
  if (branch) {
    return branch;
  }

  const shippingAddress = order.shippingAddress?.toLowerCase() ?? "";

  if (
    shippingAddress.includes("pokhara") ||
    shippingAddress.includes("gandaki") ||
    shippingAddress.includes("kaski") ||
    shippingAddress.includes("damauli")
  ) {
    return "Gandaki Branch";
  }

  if (
    shippingAddress.includes("kathmandu") ||
    shippingAddress.includes("lalitpur") ||
    shippingAddress.includes("bhaktapur") ||
    shippingAddress.includes("bagmati") ||
    shippingAddress.includes("bharatpur") ||
    shippingAddress.includes("banepa")
  ) {
    return "Bagmati Branch";
  }

  return "Head Office";
}

function normalizeStoredOrder(order: Partial<StoredOrder>): StoredOrder | null {
  if (
    !order.id ||
    !order.customerName ||
    !order.customerEmail ||
    !order.date ||
    !order.status ||
    typeof order.total !== "number" ||
    !Array.isArray(order.items) ||
    !order.source ||
    !order.shippingAddress
  ) {
    return null;
  }

  return {
    id: order.id,
    customerName: order.customerName,
    customerEmail: order.customerEmail,
    date: order.date,
    status: order.status,
    total: order.total,
    items: order.items.map((item) => ({
      ...item,
      adminRemark: typeof item?.adminRemark === "string" ? item.adminRemark : "",
    })),
    source: order.source,
    shippingAddress: order.shippingAddress,
    trackingNumber: order.trackingNumber,
    phone: order.phone,
    branch: inferOrderBranch(order),
    exchangeRequest:
      order.exchangeRequest &&
      typeof order.exchangeRequest.reason === "string" &&
      Array.isArray(order.exchangeRequest.images) &&
      typeof order.exchangeRequest.requestedAt === "string" &&
      (order.exchangeRequest.status === "pending" ||
        order.exchangeRequest.status === "approved" ||
        order.exchangeRequest.status === "rejected")
        ? {
            status: order.exchangeRequest.status,
            reason: order.exchangeRequest.reason,
            images: order.exchangeRequest.images.filter(
              (image): image is string => typeof image === "string"
            ),
            requestedAt: order.exchangeRequest.requestedAt,
            adminMessage:
              typeof order.exchangeRequest.adminMessage === "string"
                ? order.exchangeRequest.adminMessage
                : "",
            reviewedAt:
              typeof order.exchangeRequest.reviewedAt === "string"
                ? order.exchangeRequest.reviewedAt
                : undefined,
            reviewedBy:
              typeof order.exchangeRequest.reviewedBy === "string"
                ? order.exchangeRequest.reviewedBy
                : undefined,
          }
        : undefined,
  };
}

export function getStoredOrders(): StoredOrder[] {
  if (typeof window === "undefined") {
    return [];
  }

  const savedOrders = localStorage.getItem(ORDERS_STORAGE_KEY);
  if (!savedOrders) {
    return [];
  }

  try {
    const parsedOrders = JSON.parse(savedOrders);
    if (!Array.isArray(parsedOrders)) {
      return [];
    }

    return parsedOrders
      .map((order) => normalizeStoredOrder(order))
      .filter((order): order is StoredOrder => order !== null);
  } catch {
    return [];
  }
}

export function saveStoredOrders(orders: StoredOrder[]) {
  if (typeof window === "undefined") {
    return;
  }

  localStorage.setItem(
    ORDERS_STORAGE_KEY,
    JSON.stringify(orders.map((order) => ({ ...order, branch: inferOrderBranch(order) })))
  );
  window.dispatchEvent(new Event("ordersUpdated"));
}

export function appendStoredOrder(order: StoredOrder) {
  const existingOrders = getStoredOrders();
  saveStoredOrders([order, ...existingOrders]);
}

// Future API integration:
// Replace localStorage reads/writes in this file with API calls when backend order persistence is available.
