export interface StoredReview {
  id: string;
  orderId: string;
  customerName: string;
  customerEmail: string;
  productName: string;
  productId: string;
  rating: number;
  title: string;
  comment: string;
  date: string;
  status: "pending" | "approved" | "rejected";
  helpful: number;
  notHelpful: number;
  verified: boolean;
  images?: string[];
  adminReply?: string;
  adminReplyAt?: string;
  adminReplyBy?: string;
}

import { supabase } from "../../lib/supabase";
const REVIEWS_STORAGE_KEY = "productReviews";

export function getStoredReviews(): StoredReview[] {
  if (typeof window === "undefined") {
    return [];
  }

  const savedReviews = localStorage.getItem(REVIEWS_STORAGE_KEY);
  if (!savedReviews) {
    return [];
  }

  try {
    const parsedReviews = JSON.parse(savedReviews);
    if (!Array.isArray(parsedReviews)) {
      return [];
    }

    return parsedReviews.map((review) => ({
      ...review,
      customerName:
        review?.customerName?.trim() ||
        review?.customerEmail?.split("@")[0] ||
        "User",
      adminReply: typeof review?.adminReply === "string" ? review.adminReply : "",
      adminReplyAt: typeof review?.adminReplyAt === "string" ? review.adminReplyAt : "",
      adminReplyBy: typeof review?.adminReplyBy === "string" ? review.adminReplyBy : "",
    }));
  } catch {
    return [];
  }
}

export function saveStoredReviews(reviews: StoredReview[]) {
  if (typeof window === "undefined") {
    return;
  }

  localStorage.setItem(REVIEWS_STORAGE_KEY, JSON.stringify(reviews));
  window.dispatchEvent(new Event("reviewsUpdated"));
}

export async function appendStoredReview(
  review: Omit<StoredReview, "id" | "date" | "status" | "helpful" | "notHelpful" | "verified">
): Promise<void> {
  const nextReview: StoredReview = {
    ...review,
    customerName: review.customerName?.trim() || review.customerEmail?.split("@")[0] || "User",
    id: `review-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    date: new Date().toISOString(),
    status: "pending",
    helpful: 0,
    notHelpful: 0,
    verified: true,
    adminReply: "",
    adminReplyAt: "",
    adminReplyBy: "",
  };

  const existingReviews = getStoredReviews();
  saveStoredReviews([nextReview, ...existingReviews]);

  // ALSO save to DB (map to snake_case columns)
  try {
    const payload = {
      order_id: nextReview.orderId || null,
      customer_name: nextReview.customerName?.trim() || nextReview.customerEmail?.split("@")[0] || "User",
      product_id: nextReview.productId || null,
      product_name: nextReview.productName || null,
      rating: Number(nextReview.rating) || 0,
      title: nextReview.title || "",
      comment: nextReview.comment || "",
      status: "pending",
    };

    console.log("REVIEW INSERT PAYLOAD:", payload);

    const { data, error } = await supabase
      .from("reviews")
      .insert([payload])
      .select();

    if (error) {
      console.error("SUPABASE INSERT ERROR (reviews):", error.message, error.details);
    } else {
      console.log("REVIEW INSERT SUCCESS:", data);
    }
  } catch (e) {
    console.error("Unexpected error inserting review:", e);
  }
}

export function hasReviewForOrderProduct(
  orderId: string,
  productId: string,
  customerEmail: string
) {
  return getStoredReviews().some(
    (review) =>
      review.orderId === orderId &&
      review.productId === productId &&
      review.customerEmail.toLowerCase() === customerEmail.toLowerCase()
  );
}
