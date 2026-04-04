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

export function appendStoredReview(
  review: Omit<StoredReview, "id" | "date" | "status" | "helpful" | "notHelpful" | "verified">
) {
  const nextReview: StoredReview = {
    ...review,
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
