import { useState, useEffect } from "react";
import { motion } from "motion/react";
import { Star, ThumbsUp, ThumbsDown, MessageSquare, Eye, Check, X, Filter } from "lucide-react";

interface Review {
  id: string;
  customerName: string;
  customerEmail: string;
  productName: string;
  productId: string;
  rating: number;
  title: string;
  comment: string;
  date: string;
  status: 'pending' | 'approved' | 'rejected';
  helpful: number;
  notHelpful: number;
  verified: boolean;
  images?: string[];
}

const mockReviews: Review[] = [
  {
    id: "1",
    customerName: "Sarah Johnson",
    customerEmail: "sarah.j@email.com",
    productName: "Minimalist White Shirt",
    productId: "prod-1",
    rating: 5,
    title: "Absolutely perfect!",
    comment: "This shirt is exactly what I was looking for. The fit is perfect and the quality is outstanding. Will definitely buy more from this brand.",
    date: "2024-01-15",
    status: "approved",
    helpful: 12,
    notHelpful: 1,
    verified: true,
    images: ["https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHx3aGl0ZSUyMHNoaXJ0fGVufDF8fHx8MTc3NTA0NjY2Mnww&ixlib=rb-4.1.0&q=80&w=1080"]
  },
  {
    id: "2",
    customerName: "Mike Chen",
    customerEmail: "mike.chen@email.com",
    productName: "Streetwear Hoodie",
    productId: "prod-2",
    rating: 4,
    title: "Great quality, runs a bit small",
    comment: "Love the design and the material feels premium. However, it runs a bit small so I recommend sizing up. Overall very satisfied with the purchase.",
    date: "2024-01-14",
    status: "approved",
    helpful: 8,
    notHelpful: 2,
    verified: true
  },
  {
    id: "3",
    customerName: "Anonymous",
    customerEmail: "anon@example.com",
    productName: "Designer Jeans",
    productId: "prod-3",
    rating: 2,
    title: "Not what I expected",
    comment: "The jeans arrived with a tear in the fabric. Very disappointed with the quality control. I expected better from this brand.",
    date: "2024-01-13",
    status: "pending",
    helpful: 3,
    notHelpful: 5,
    verified: false
  },
  {
    id: "4",
    customerName: "Emma Davis",
    customerEmail: "emma.davis@email.com",
    productName: "Luxury Dress",
    productId: "prod-4",
    rating: 5,
    title: "Stunning piece!",
    comment: "This dress exceeded my expectations. The craftsmanship is incredible and it fits like a dream. Perfect for special occasions.",
    date: "2024-01-12",
    status: "approved",
    helpful: 15,
    notHelpful: 0,
    verified: true,
    images: [
      "https://images.unsplash.com/photo-1595777457583-95e059d581b8?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxsdXh1cnklMjBkcmVzc3xlbnwxfHx8fDE3NzUwNDY2NjJ8MA&ixlib=rb-4.1.0&q=80&w=1080",
      "https://images.unsplash.com/photo-1539008835657-9e8e9680c956?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxlbGVnYW50JTIwZHJlc3N8ZW58MXx8fHwxNzc1MDQ2NjYyMHww&ixlib=rb-4.1.0&q=80&w=1080"
    ]
  },
  {
    id: "5",
    customerName: "Alex Rodriguez",
    customerEmail: "alex.rodriguez@email.com",
    productName: "Casual Sneakers",
    productId: "prod-5",
    rating: 3,
    title: "Decent but not great",
    comment: "The sneakers are comfortable and look good, but they started to show wear after just a few weeks. For the price, I expected better durability.",
    date: "2024-01-11",
    status: "pending",
    helpful: 4,
    notHelpful: 3,
    verified: true
  },
  {
    id: "6",
    customerName: "Lisa Wang",
    customerEmail: "lisa.wang@email.com",
    productName: "Designer Bag",
    productId: "prod-6",
    rating: 1,
    title: "Poor quality",
    comment: "The bag arrived damaged and the stitching is coming apart. This is unacceptable for a designer item. I want a refund.",
    date: "2024-01-10",
    status: "rejected",
    helpful: 2,
    notHelpful: 8,
    verified: true
  }
];

export function ReviewManagement() {
  const [reviews, setReviews] = useState<Review[]>(mockReviews);
  const [filteredReviews, setFilteredReviews] = useState<Review[]>(mockReviews);
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [ratingFilter, setRatingFilter] = useState<string>("all");
  const [selectedReview, setSelectedReview] = useState<Review | null>(null);
  const [showReviewModal, setShowReviewModal] = useState(false);

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

  const handleReviewAction = (reviewId: string, action: 'approve' | 'reject') => {
    setReviews(prev => prev.map(review =>
      review.id === reviewId
        ? { ...review, status: action === 'approve' ? 'approved' : 'rejected' }
        : review
    ));
  };

  const getReviewStats = () => {
    const total = reviews.length;
    const approved = reviews.filter(r => r.status === 'approved').length;
    const pending = reviews.filter(r => r.status === 'pending').length;
    const rejected = reviews.filter(r => r.status === 'rejected').length;
    const averageRating = reviews.reduce((sum, r) => sum + r.rating, 0) / total;

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
                      {review.images.map((image, index) => (
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

              {/* Review Images */}
              {selectedReview.images && selectedReview.images.length > 0 && (
                <div>
                  <h5 className="font-medium tracking-wider mb-3">Review Images</h5>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                    {selectedReview.images.map((image, index) => (
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
                <button className="flex-1 px-4 py-2 bg-blue-600 text-white hover:bg-blue-700 transition-colors tracking-wider uppercase text-sm">
                  Reply to Review
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