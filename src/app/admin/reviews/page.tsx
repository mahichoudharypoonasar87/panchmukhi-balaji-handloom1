"use client";

import { useState, useEffect } from "react";
import { collection, getDocs, query, orderBy, doc, updateDoc, deleteDoc } from "firebase/firestore";
import { db } from "@/lib/firebase/config";
import { Star, Trash2, CheckCircle, XCircle, Loader2, MessageSquare, Send } from "lucide-react";
import AdminLayout from "@/components/admin/AdminLayout";
import { Review } from "@/types";
import { formatDate, cn } from "@/lib/utils";
import toast from "react-hot-toast";

export default function AdminReviewsPage() {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [replyingId, setReplyingId] = useState<string | null>(null);
  const [replyText, setReplyText] = useState("");

  const fetchReviews = async () => {
    setLoading(true);
    try {
      const q = query(collection(db, "reviews"), orderBy("createdAt", "desc"));
      const snapshot = await getDocs(q);
      const data = snapshot.docs.map((d) => ({
        id: d.id,
        ...d.data(),
        createdAt: d.data().createdAt?.toDate() || new Date(),
      })) as Review[];
      setReviews(data);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReviews();
  }, []);

  const toggleApproval = async (id: string, current: boolean) => {
    try {
      await updateDoc(doc(db, "reviews", id), { isApproved: !current });
      setReviews((prev) => prev.map((r) => (r.id === id ? { ...r, isApproved: !current } : r)));
      toast.success(`Review ${!current ? "approved" : "hidden"}`);
    } catch {
      toast.error("Failed to update review");
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this review?")) return;
    try {
      await deleteDoc(doc(db, "reviews", id));
      setReviews((prev) => prev.filter((r) => r.id !== id));
      toast.success("Review deleted");
    } catch {
      toast.error("Failed to delete review");
    }
  };

  const handleReply = async (id: string) => {
    if (!replyText.trim()) return;
    try {
      await updateDoc(doc(db, "reviews", id), {
        reply: {
          text: replyText,
          respondedAt: new Date(),
          respondedBy: "Store Admin",
        },
      });
      setReviews((prev) =>
        prev.map((r) =>
          r.id === id
            ? { ...r, reply: { text: replyText, respondedAt: new Date(), respondedBy: "Store Admin" } }
            : r
        )
      );
      toast.success("Reply added!");
      setReplyingId(null);
      setReplyText("");
    } catch {
      toast.error("Failed to add reply");
    }
  };

  return (
    <AdminLayout>
      <div className="mb-6">
        <h1 className="font-display text-2xl font-bold text-[var(--foreground)]">Reviews</h1>
        <p className="text-[var(--muted)] text-sm font-utility">{reviews.length} total reviews</p>
      </div>

      {loading ? (
        <div className="flex items-center justify-center h-48">
          <Loader2 size={28} className="text-gold-500 animate-spin" />
        </div>
      ) : reviews.length === 0 ? (
        <div className="text-center py-16 rounded-3xl border border-[var(--border)]">
          <MessageSquare size={48} className="text-[var(--muted)] mx-auto mb-4" />
          <p className="text-[var(--foreground)] font-body font-semibold">No reviews yet</p>
        </div>
      ) : (
        <div className="space-y-4">
          {reviews.map((review) => (
            <div key={review.id} className="p-5 rounded-3xl bg-[var(--card-bg)] border border-[var(--border)]">
              <div className="flex items-start justify-between gap-3 mb-3">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-body font-semibold text-[var(--foreground)] text-sm">{review.userName}</span>
                    <span className={cn(
                      "px-2 py-0.5 rounded-full text-[9px] font-utility font-bold",
                      review.isApproved ? "bg-green-500/15 text-green-500" : "bg-orange-500/15 text-orange-400"
                    )}>
                      {review.isApproved ? "Approved" : "Hidden"}
                    </span>
                  </div>
                  <div className="flex items-center gap-1">
                    {[1, 2, 3, 4, 5].map((s) => (
                      <Star key={s} size={11} className={cn(s <= review.rating ? "text-gold-500 fill-current" : "text-[var(--border)]")} />
                    ))}
                  </div>
                </div>
                <span className="text-[var(--muted)] text-xs font-utility">{formatDate(review.createdAt)}</span>
              </div>

              <p className="text-[var(--foreground)] font-body font-semibold text-sm mb-1">{review.title}</p>
              <p className="text-[var(--muted)] text-sm font-body leading-relaxed mb-4">{review.comment}</p>

              {review.reply && (
                <div className="mb-4 pl-3 border-l-2 border-gold-500/30 bg-gold-500/5 p-3 rounded-r-xl">
                  <p className="text-gold-500 text-xs font-utility font-semibold mb-1">Store Reply:</p>
                  <p className="text-[var(--muted)] text-xs font-body">{review.reply.text}</p>
                </div>
              )}

              {replyingId === review.id && (
                <div className="flex gap-2 mb-4">
                  <input
                    value={replyText}
                    onChange={(e) => setReplyText(e.target.value)}
                    placeholder="Write a reply..."
                    className="input-luxury py-2 text-xs flex-1"
                  />
                  <button onClick={() => handleReply(review.id)} className="btn-gold py-2 px-3 text-xs">
                    <Send size={12} />
                  </button>
                </div>
              )}

              <div className="flex gap-2">
                <button
                  onClick={() => toggleApproval(review.id, review.isApproved)}
                  className={cn(
                    "flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-utility transition-all",
                    review.isApproved
                      ? "text-orange-400 hover:bg-orange-400/10"
                      : "text-green-500 hover:bg-green-500/10"
                  )}
                >
                  {review.isApproved ? <XCircle size={12} /> : <CheckCircle size={12} />}
                  {review.isApproved ? "Hide" : "Approve"}
                </button>
                {!review.reply && (
                  <button
                    onClick={() => setReplyingId(review.id)}
                    className="flex items-center gap-1 px-3 py-1.5 rounded-lg text-blue-400 hover:bg-blue-400/10 text-xs font-utility transition-all"
                  >
                    <MessageSquare size={12} /> Reply
                  </button>
                )}
                <button
                  onClick={() => handleDelete(review.id)}
                  className="flex items-center gap-1 px-3 py-1.5 rounded-lg text-crimson-400 hover:bg-crimson-400/10 text-xs font-utility transition-all"
                >
                  <Trash2 size={12} /> Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </AdminLayout>
  );
}
