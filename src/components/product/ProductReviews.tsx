"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Star, ThumbsUp, MessageSquare, User } from "lucide-react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useAuth } from "@/context/AuthContext";
import { getProductReviews, createReview } from "@/lib/firebase/firestore";
import { Review } from "@/types";
import { reviewSchema, ReviewFormData } from "@/lib/validations";
import { formatDate, cn } from "@/lib/utils";
import toast from "react-hot-toast";

interface ProductReviewsProps {
  productId: string;
  productName: string;
}

export default function ProductReviews({
  productId,
  productName,
}: ProductReviewsProps) {
  const { user, userProfile } = useAuth();
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [hoveredRating, setHoveredRating] = useState(0);

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<ReviewFormData>({
    resolver: zodResolver(reviewSchema),
    defaultValues: { rating: 0, title: "", comment: "" },
  });

  const rating = watch("rating");

  useEffect(() => {
    getProductReviews(productId)
      .then(setReviews)
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [productId]);

  const onSubmit = async (data: ReviewFormData) => {
    if (!user || !userProfile) {
      toast.error("Please login to submit a review");
      return;
    }
    try {
      await createReview({
        productId,
        userId: user.uid,
        userName: userProfile.displayName || "Anonymous",
        userPhoto: userProfile.photoURL,
        orderId: "manual",
        rating: data.rating,
        title: data.title,
        comment: data.comment,
        likes: 0,
        isVerified: false,
        isApproved: true,
      });
      toast.success("Review submitted successfully!");
      reset();
      setShowForm(false);
      // Refresh reviews
      const updatedReviews = await getProductReviews(productId);
      setReviews(updatedReviews);
    } catch {
      toast.error("Failed to submit review");
    }
  };

  const avgRating =
    reviews.length > 0
      ? reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length
      : 0;

  const ratingDistribution = [5, 4, 3, 2, 1].map((star) => ({
    star,
    count: reviews.filter((r) => r.rating === star).length,
    pct:
      reviews.length > 0
        ? (reviews.filter((r) => r.rating === star).length / reviews.length) *
          100
        : 0,
  }));

  return (
    <div>
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-8 gap-4">
        <div>
          <p className="section-subtitle">Customer Feedback</p>
          <h2 className="font-display text-2xl font-bold text-[var(--foreground)]">
            Reviews & Ratings
          </h2>
        </div>
        {user && (
          <button
            onClick={() => setShowForm(!showForm)}
            className="btn-luxury text-xs"
          >
            <MessageSquare size={14} />
            Write a Review
          </button>
        )}
      </div>

      {/* Rating Summary */}
      {reviews.length > 0 && (
        <div className="grid sm:grid-cols-2 gap-6 mb-8 p-6 rounded-3xl bg-[var(--card-bg)] border border-[var(--border)]">
          {/* Average */}
          <div className="flex items-center gap-4">
            <div className="text-center">
              <div className="font-display text-5xl font-bold text-gold-gradient">
                {avgRating.toFixed(1)}
              </div>
              <div className="flex items-center justify-center gap-0.5 mt-1">
                {[1, 2, 3, 4, 5].map((s) => (
                  <Star
                    key={s}
                    size={14}
                    className={cn(
                      s <= Math.round(avgRating)
                        ? "text-gold-500 fill-current"
                        : "text-[var(--border)]"
                    )}
                  />
                ))}
              </div>
              <p className="text-[var(--muted)] text-xs font-utility mt-1">
                {reviews.length} reviews
              </p>
            </div>
          </div>

          {/* Distribution */}
          <div className="space-y-2">
            {ratingDistribution.map(({ star, count, pct }) => (
              <div key={star} className="flex items-center gap-2">
                <span className="text-[var(--muted)] text-xs font-utility w-3">
                  {star}
                </span>
                <Star size={10} className="text-gold-500 fill-current flex-shrink-0" />
                <div className="flex-1 h-1.5 bg-[var(--border)] rounded-full overflow-hidden">
                  <div
                    className="h-full bg-gold-500 rounded-full transition-all"
                    style={{ width: `${pct}%` }}
                  />
                </div>
                <span className="text-[var(--muted)] text-xs font-utility w-4 text-right">
                  {count}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Review Form */}
      {showForm && user && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8 p-6 rounded-3xl bg-[var(--card-bg)] border border-gold-500/30"
        >
          <h3 className="font-display text-lg font-bold text-[var(--foreground)] mb-4">
            Write a Review for {productName}
          </h3>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            {/* Star Rating */}
            <div>
              <label className="text-[var(--foreground)] text-xs font-utility font-semibold uppercase tracking-wide block mb-2">
                Your Rating *
              </label>
              <div className="flex items-center gap-1">
                {[1, 2, 3, 4, 5].map((s) => (
                  <button
                    key={s}
                    type="button"
                    onMouseEnter={() => setHoveredRating(s)}
                    onMouseLeave={() => setHoveredRating(0)}
                    onClick={() => setValue("rating", s, { shouldValidate: true })}
                    className="p-0.5"
                  >
                    <Star
                      size={28}
                      className={cn(
                        "transition-colors",
                        s <= (hoveredRating || rating)
                          ? "text-gold-500 fill-current"
                          : "text-[var(--border)]"
                      )}
                    />
                  </button>
                ))}
              </div>
              {errors.rating && (
                <p className="text-crimson-400 text-xs mt-1">{errors.rating.message}</p>
              )}
            </div>

            {/* Title */}
            <div>
              <label className="text-[var(--foreground)] text-xs font-utility font-semibold uppercase tracking-wide block mb-1.5">
                Review Title *
              </label>
              <input
                {...register("title")}
                placeholder="Summarise your experience..."
                className="input-luxury"
              />
              {errors.title && (
                <p className="text-crimson-400 text-xs mt-1">{errors.title.message}</p>
              )}
            </div>

            {/* Comment */}
            <div>
              <label className="text-[var(--foreground)] text-xs font-utility font-semibold uppercase tracking-wide block mb-1.5">
                Your Review *
              </label>
              <textarea
                {...register("comment")}
                placeholder="Share your detailed experience about quality, fabric, delivery..."
                rows={4}
                className="input-luxury resize-none"
              />
              {errors.comment && (
                <p className="text-crimson-400 text-xs mt-1">{errors.comment.message}</p>
              )}
            </div>

            <div className="flex gap-3">
              <button
                type="submit"
                disabled={isSubmitting}
                className="btn-luxury text-sm"
              >
                {isSubmitting ? (
                  <div className="w-4 h-4 border-2 border-current/50 border-t-current rounded-full animate-spin" />
                ) : (
                  "Submit Review"
                )}
              </button>
              <button
                type="button"
                onClick={() => setShowForm(false)}
                className="btn-outline text-sm"
              >
                Cancel
              </button>
            </div>
          </form>
        </motion.div>
      )}

      {/* Reviews List */}
      {loading ? (
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="p-4 rounded-2xl border border-[var(--border)]">
              <div className="skeleton h-4 w-24 mb-2 rounded" />
              <div className="skeleton h-3 w-full mb-1 rounded" />
              <div className="skeleton h-3 w-3/4 rounded" />
            </div>
          ))}
        </div>
      ) : reviews.length === 0 ? (
        <div className="text-center py-12 border border-[var(--border)] rounded-3xl">
          <MessageSquare size={40} className="text-[var(--muted)] mx-auto mb-3" />
          <p className="text-[var(--foreground)] font-body font-semibold mb-1">
            No reviews yet
          </p>
          <p className="text-[var(--muted)] text-sm font-utility">
            Be the first to review this product!
          </p>
          {user && (
            <button
              onClick={() => setShowForm(true)}
              className="btn-luxury text-xs mt-4"
            >
              Write a Review
            </button>
          )}
        </div>
      ) : (
        <div className="space-y-4">
          {reviews.map((review, i) => (
            <motion.div
              key={review.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
              className="p-5 rounded-3xl bg-[var(--card-bg)] border border-[var(--border)]"
            >
              <div className="flex items-start gap-3">
                {review.userPhoto ? (
                  <img
                    src={review.userPhoto}
                    alt={review.userName}
                    className="w-9 h-9 rounded-full object-cover border-2 border-gold-500/30 flex-shrink-0"
                  />
                ) : (
                  <div className="w-9 h-9 rounded-full bg-gold-500/20 border border-gold-500/30 flex items-center justify-center flex-shrink-0">
                    <User size={16} className="text-gold-500" />
                  </div>
                )}

                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between flex-wrap gap-2">
                    <div>
                      <p className="font-body font-semibold text-[var(--foreground)] text-sm">
                        {review.userName}
                        {review.isVerified && (
                          <span className="ml-2 text-green-500 text-[10px] font-utility">
                            ✓ Verified Purchase
                          </span>
                        )}
                      </p>
                      <div className="flex items-center gap-1 mt-0.5">
                        {[1, 2, 3, 4, 5].map((s) => (
                          <Star
                            key={s}
                            size={11}
                            className={cn(
                              s <= review.rating
                                ? "text-gold-500 fill-current"
                                : "text-[var(--border)]"
                            )}
                          />
                        ))}
                      </div>
                    </div>
                    <span className="text-[var(--muted)] text-xs font-utility">
                      {formatDate(review.createdAt)}
                    </span>
                  </div>

                  <h4 className="font-body font-semibold text-[var(--foreground)] text-sm mt-2 mb-1">
                    {review.title}
                  </h4>
                  <p className="text-[var(--muted)] text-sm font-body leading-relaxed">
                    {review.comment}
                  </p>

                  {/* Store Reply */}
                  {review.reply && (
                    <div className="mt-3 pl-3 border-l-2 border-gold-500/30">
                      <p className="text-gold-500 text-xs font-utility font-semibold mb-1">
                        Store Response
                      </p>
                      <p className="text-[var(--muted)] text-xs font-body">
                        {review.reply.text}
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}
