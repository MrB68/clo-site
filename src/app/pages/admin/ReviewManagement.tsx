import { useState, useEffect } from "react";
import { motion } from "motion/react";
import { Star, ThumbsUp, ThumbsDown, MessageSquare, Eye, Check, X, Filter } from "lucide-react";
import { toast } from "sonner";
import { appendAdminAuditLog, getAdminSession } from "../../utils/admin";
import { getCustomerProfileByEmail } from "../../utils/customerProfile";
import { supabase } from "../../../lib/supabase";

type Review = any;

export function ReviewManagement() {
  const adminSession = getAdminSession();
  const [reviews, setReviews] = useState<Review[]>([]);
  const [filteredReviews, setFilteredReviews] = useState<Review[]>([]);
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [ratingFilter, setRatingFilter] = useState<string>("all");
  const [selectedReview, setSelectedReview] = useState<Review | null>(null);
  const [showReviewModal, setShowReviewModal] = useState(false);
  const [replyDraft, setReplyDraft] = useState("");

  useEffect(() => {
  const fetchReviews = async () => {
    const { data, error } = await supabase
      .from("reviews")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Review fetch error:", error);
      return;
    }

    setReviews(data || []);
    setFilteredReviews(data || []);
  };

  fetchReviews();
}, []);
  useEffect(() => {
    let filtered = reviews;

    // Status filter
    if (statusFilter !== "all") {
      filtered = filtered.filter(review => review.status === statusFilter);
    }

    // Rating filter
    if (ratingFilter !== "all") {
      filtered = filtered.filter(review => review.rating.toString() === ratingFilter);
    }

    setFilteredReviews(filtered);
  }, [reviews, statusFilter, ratingFilter]);

  useEffect(() => {
    setReplyDraft(selectedReview?.adminReply ?? "");
  }, [selectedReview]);

  const getStatusColor = (status: Review['status']) => {
    switch (status) {
      case "pending":
        return "bg-yellow-100 text-yellow-800";
      case "approved":
        return "bg-green-100 text-green-800";
      case "rejected":
        return "bg-red-100 text-red-800";
    }
  };

  const getStatusLabel = (status: Review['status']) => {
    switch (status) {
      case "pending":
        return "Pending";
      case "approved":
        return "Approved";
      case "rejected":
        return "Rejected";
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const renderStars = (rating: number) => {
    return (
      <div className="flex gap-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <Star
            key={star}
            size={14}
            className={`${
              star <= rating ? "text-yellow-400 fill-current" : "text-gray-300"
            }`}
          />
        ))}
      </div>
    );
  };

  const handleReviewAction = async (reviewId: string, action: 'approve' | 'reject') => {
  // Update UI
  setReviews((prev) =>
    prev.map((review) =>
      review.id === reviewId
        ? { ...review, status: action === "approve" ? "approved" : "rejected" }
        : review
    )
  );

  // Update DB
  const { error } = await supabase
    .from("reviews")
    .update({
      status: action === "approve" ? "approved" : "rejected"
    })
    .eq("id", reviewId);

  if (error) {
    console.error("Failed to update review:", error);
  }

  const updatedReview = reviews.find((r) => r.id === reviewId);

  if (updatedReview && adminSession) {
    appendAdminAuditLog({
      adminId: adminSession.id,
      adminName: adminSession.name,
      adminEmail: adminSession.email,
      branch: adminSession.branch,
      action: action === "approve" ? "approved" : "rejected",
      entityType: "review",
      entityName: updatedReview.productName,
      details: `Review by ${updatedReview.customerEmail} marked ${action}d.`,
    });
  }
};

 const handleSaveReply = () => {
  if (!selectedReview || !adminSession) {
    return;
  }

  const trimmedReply = replyDraft.trim();
  if (!trimmedReply) {
    toast.error("Please enter a reply before saving.");
    return;
  }

  setReviews((prev) => {
    const nextReviews = prev.map((review) =>
      review.id === selectedReview.id
        ? {
            ...review,
            adminReply: trimmedReply,
            adminReplyAt: new Date().toISOString(),
            adminReplyBy: adminSession.name,
          }
        : review
    );

    const updatedReview = nextReviews.find((review) => review.id === selectedReview.id) ?? null;
    setSelectedReview(updatedReview);

    appendAdminAuditLog({
      adminId: adminSession.id,
      adminName: adminSession.name,
      adminEmail: adminSession.email,
      branch: adminSession.branch,
      action: "replied",
      entityType: "review",
      entityName: selectedReview.productName,
      details: `Replied to review by ${selectedReview.customerEmail}.`,
    });

    return nextReviews;
  });

  toast.success("Review reply saved.");
};

  const getReviewStats = () => {
    const total = reviews.length;
    const approved = reviews.filter(r => r.status === 'approved').length;
    const pending = reviews.filter(r => r.status === 'pending').length;
    const rejected = reviews.filter(r => r.status === 'rejected').length;
    const averageRating = total
      ? reviews.reduce((sum, r) => sum + r.rating, 0) / total
      : 0;

    return { total, approved, pending, rejected, averageRating };
  };

  const stats = getReviewStats();

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold tracking-widest uppercase">Review Management</h2>
        <div className="text-sm text-gray-600 tracking-wider">
          {filteredReviews.length} of {reviews.length} reviews
        </div>
      </div>

      {/* Review Stats */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-6">
        <div className="bg-white p-6 rounded-lg shadow-sm">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-blue-100 rounded-lg">
              <MessageSquare size={24} className="text-blue-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600 tracking-wider uppercase">Total Reviews</p>
              <p className="text-2xl font-bold tracking-wider">{stats.total}</p>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-green-100 rounded-lg">
              <Check size={24} className="text-green-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600 tracking-wider uppercase">Approved</p>
              <p className="text-2xl font-bold tracking-wider">{stats.approved}</p>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-yellow-100 rounded-lg">
              <Eye size={24} className="text-yellow-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600 tracking-wider uppercase">Pending</p>
              <p className="text-2xl font-bold tracking-wider">{stats.pending}</p>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-red-100 rounded-lg">
              <X size={24} className="text-red-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600 tracking-wider uppercase">Rejected</p>
              <p className="text-2xl font-bold tracking-wider">{stats.rejected}</p>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-purple-100 rounded-lg">
              <Star size={24} className="text-purple-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600 tracking-wider uppercase">Avg Rating</p>
              <p className="text-2xl font-bold tracking-wider">{stats.averageRating.toFixed(1)}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white p-6 rounded-lg shadow-sm">
        <div className="flex items-center gap-4">
          <Filter size={16} className="text-gray-400" />
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 flex-1">
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-4 py-2 border border-gray-300 focus:outline-none focus:border-black tracking-wider"
            >
              <option value="all">All Statuses</option>
              <option value="pending">Pending</option>
              <option value="approved">Approved</option>
              <option value="rejected">Rejected</option>
            </select>

            <select
              value={ratingFilter}
              onChange={(e) => setRatingFilter(e.target.value)}
              className="px-4 py-2 border border-gray-300 focus:outline-none focus:border-black tracking-wider"
            >
              <option value="all">All Ratings</option>
              <option value="5">5 Stars</option>
              <option value="4">4 Stars</option>
              <option value="3">3 Stars</option>
              <option value="2">2 Stars</option>
              <option value="1">1 Star</option>
            </select>

            <button
              onClick={() => {
                setStatusFilter("all");
                setRatingFilter("all");
              }}
              className="px-4 py-2 bg-gray-100 hover:bg-gray-200 transition-colors tracking-wider uppercase text-sm"
            >
              Clear Filters
            </button>
          </div>
        </div>
      </div>

      {/* Reviews List */}
      <div className="space-y-4">
        {filteredReviews.map((review) => (
          <motion.div
            key={review.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white rounded-lg shadow-sm p-6 hover:shadow-md transition-shadow"
          >
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-start gap-4">
                {getCustomerProfileByEmail(review.customerEmail)?.profileImage ? (
                  <img
                    src={getCustomerProfileByEmail(review.customerEmail)?.profileImage}
                    alt={review.customerName}
                    className="h-12 w-12 rounded-full object-cover"
                  />
                ) : (
                  <div className="flex h-12 w-12 items-center justify-center rounded-full bg-black text-sm font-semibold uppercase tracking-wider text-white">
                    {review.customerName
                      .split(" ")
                      .map((part: any[]) => part[0])
                      .join("")
                      .slice(0, 2)}
                  </div>
                )}
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <h3 className="font-semibold tracking-wider">{review.customerName}</h3>
                    {review.verified && (
                      <span className="px-2 py-1 bg-green-100 text-green-800 text-xs font-medium rounded-full tracking-wider uppercase">
                        Verified Purchase
                      </span>
                    )}
                    <span className={`px-2 py-1 text-xs font-medium rounded-full tracking-wider uppercase ${getStatusColor(review.status)}`}>
                      {getStatusLabel(review.status)}
                    </span>
                  </div>
                  <p className="text-sm text-gray-600 tracking-wider mb-2">
                    {review.productName} • {formatDate(review.date)}
                  </p>
                  <div className="flex items-center gap-2 mb-3">
                    {renderStars(review.rating)}
                    <span className="text-sm text-gray-600 tracking-wider">
                      {review.rating}/5
                    </span>
                  </div>
                  <h4 className="font-medium tracking-wider mb-2">{review.title}</h4>
                  <p className="text-gray-700 tracking-wider leading-relaxed">{review.comment}</p>

                  {review.images && review.images.length > 0 && (
                    <div className="flex gap-2 mt-3">
                      {review.images.map((image: string | undefined, index: number) => (
                        <img
                          key={index}
                          src={image}
                          alt={`Review image ${index + 1}`}
                          className="w-16 h-16 object-cover rounded cursor-pointer hover:opacity-80 transition-opacity"
                          onClick={() => {
                            setSelectedReview(review);
                            setShowReviewModal(true);
                          }}
                        />
                      ))}
                    </div>
                  )}
                </div>
              </div>

              <div className="flex items-center gap-2">
                <div className="text-center">
                  <div className="flex items-center gap-1 text-sm text-gray-600">
                    <ThumbsUp size={14} />
                    <span className="tracking-wider">{review.helpful}</span>
                  </div>
                  <div className="flex items-center gap-1 text-sm text-gray-600">
                    <ThumbsDown size={14} />
                    <span className="tracking-wider">{review.notHelpful}</span>
                  </div>
                </div>

                {review.status === 'pending' && (
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleReviewAction(review.id, 'approve')}
                      className="p-2 bg-green-100 hover:bg-green-200 text-green-700 rounded transition-colors"
                      title="Approve Review"
                    >
                      <Check size={16} />
                    </button>
                    <button
                      onClick={() => handleReviewAction(review.id, 'reject')}
                      className="p-2 bg-red-100 hover:bg-red-200 text-red-700 rounded transition-colors"
                      title="Reject Review"
                    >
                      <X size={16} />
                    </button>
                  </div>
                )}
              </div>
            </div>

            <div className="flex justify-between items-center pt-4 border-t border-gray-100">
              <button
                onClick={() => {
                  setSelectedReview(review);
                  setShowReviewModal(true);
                }}
                className="text-sm text-gray-600 hover:text-black transition-colors tracking-wider uppercase"
              >
                View Full Details
              </button>

              <div className="text-xs text-gray-500 tracking-wider">
                Review ID: {review.id}
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Review Detail Modal */}
      {showReviewModal && selectedReview && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto"
          >
            <div className="p-6 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-xl font-semibold tracking-wider">Review Details</h3>
                  <p className="text-gray-600 tracking-wider">Review ID: {selectedReview.id}</p>
                </div>
                <button
                  onClick={() => setShowReviewModal(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  ✕
                </button>
              </div>
            </div>

            <div className="p-6 space-y-6">
              {/* Review Header */}
              <div className="flex items-start justify-between">
                <div>
                  <div className="flex items-center gap-3 mb-2">
                    {getCustomerProfileByEmail(selectedReview.customerEmail)?.profileImage ? (
                      <img
                        src={getCustomerProfileByEmail(selectedReview.customerEmail)?.profileImage}
                        alt={selectedReview.customerName}
                        className="h-12 w-12 rounded-full object-cover"
                      />
                    ) : (
                      <div className="flex h-12 w-12 items-center justify-center rounded-full bg-black text-sm font-semibold uppercase tracking-wider text-white">
                        {selectedReview.customerName
                          .split(" ")
                          .map((part: any[]) => part[0])
                          .join("")
                          .slice(0, 2)}
                      </div>
                    )}
                    <h4 className="text-lg font-semibold tracking-wider">{selectedReview.customerName}</h4>
                    {selectedReview.verified && (
                      <span className="px-2 py-1 bg-green-100 text-green-800 text-xs font-medium rounded-full tracking-wider uppercase">
                        Verified Purchase
                      </span>
                    )}
                    <span className={`px-3 py-1 text-sm font-medium rounded-full tracking-wider uppercase ${getStatusColor(selectedReview.status)}`}>
                      {getStatusLabel(selectedReview.status)}
                    </span>
                  </div>
                  <p className="text-gray-600 tracking-wider mb-3">
                    {selectedReview.productName} • {formatDate(selectedReview.date)}
                  </p>
                  <div className="flex items-center gap-2">
                    {renderStars(selectedReview.rating)}
                    <span className="text-lg font-medium tracking-wider ml-2">
                      {selectedReview.rating}/5
                    </span>
                  </div>
                </div>

                <div className="text-right">
                  <div className="flex items-center gap-4 text-sm text-gray-600">
                    <div className="flex items-center gap-1">
                      <ThumbsUp size={16} />
                      <span className="tracking-wider">{selectedReview.helpful}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <ThumbsDown size={16} />
                      <span className="tracking-wider">{selectedReview.notHelpful}</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Review Content */}
              <div>
                <h5 className="font-medium tracking-wider mb-2">{selectedReview.title}</h5>
                <p className="text-gray-700 tracking-wider leading-relaxed">{selectedReview.comment}</p>
              </div>

              <div>
                <label className="block font-medium tracking-wider mb-2">Admin Reply</label>
                <textarea
                  value={replyDraft}
                  onChange={(event) => setReplyDraft(event.target.value)}
                  rows={4}
                  placeholder="Write a response that will appear on the product review."
                  className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:outline-none focus:border-black tracking-wider"
                />
                {selectedReview.adminReply && selectedReview.adminReplyAt && (
                  <p className="mt-2 text-sm text-gray-500 tracking-wider">
                    Last updated by {selectedReview.adminReplyBy || "Admin"} on {formatDate(selectedReview.adminReplyAt)}
                  </p>
                )}
              </div>

              {/* Review Images */}
              {selectedReview.images && selectedReview.images.length > 0 && (
                <div>
                  <h5 className="font-medium tracking-wider mb-3">Review Images</h5>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                    {selectedReview.images.map((image: string | undefined, index: number) => (
                      <img
                        key={index}
                        src={image}
                        alt={`Review image ${index + 1}`}
                        className="w-full h-32 object-cover rounded cursor-pointer hover:opacity-80 transition-opacity"
                      />
                    ))}
                  </div>
                </div>
              )}

              {/* Actions */}
              <div className="flex gap-3 pt-4 border-t border-gray-200">
                {selectedReview.status === 'pending' && (
                  <>
                    <button
                      onClick={() => {
                        handleReviewAction(selectedReview.id, 'approve');
                        setShowReviewModal(false);
                      }}
                      className="flex-1 px-4 py-2 bg-green-600 text-white hover:bg-green-700 transition-colors tracking-wider uppercase text-sm"
                    >
                      Approve Review
                    </button>
                    <button
                      onClick={() => {
                        handleReviewAction(selectedReview.id, 'reject');
                        setShowReviewModal(false);
                      }}
                      className="flex-1 px-4 py-2 bg-red-600 text-white hover:bg-red-700 transition-colors tracking-wider uppercase text-sm"
                    >
                      Reject Review
                    </button>
                  </>
                )}
                <button
                  onClick={handleSaveReply}
                  className="flex-1 px-4 py-2 bg-blue-600 text-white hover:bg-blue-700 transition-colors tracking-wider uppercase text-sm"
                >
                  Save Reply
                </button>
                <button
                  onClick={() => setShowReviewModal(false)}
                  className="px-4 py-2 bg-gray-600 text-white hover:bg-gray-700 transition-colors tracking-wider uppercase text-sm"
                >
                  Close
                </button>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
}
