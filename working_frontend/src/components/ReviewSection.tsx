'use client';

import { useEffect, useState } from 'react';
import { getReviews, submitReview } from '../services/api.service';
import styles from './StarRating.module.css';

export default function ReviewSection() {
  const [reviews, setReviews] = useState<any[]>([]);
  const [name, setName] = useState('');
  const [comment, setComment] = useState('');
  const [rating, setRating] = useState(0);
  const [hover, setHover] = useState<number | null>(null);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    getReviews().then(setReviews).catch(console.error);
  }, []);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    try {
      await submitReview({ name, rating, comment });
      setName('');
      setComment('');
      setRating(0);
      const updated = await getReviews();
      setReviews(updated);
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <section className="max-w-4xl mx-auto mt-24 px-4 sm:px-6 py-12 bg-gray-50 rounded shadow">
      <h2 className="text-xl font-semibold text-center mb-8 text-gray-800">
        What others are saying
      </h2>

      {/* ---------- FORM ---------- */}
      <form onSubmit={handleSubmit} className="space-y-4 mb-10">
        <div>
          <label className="block text-sm font-medium mb-1">Your name</label>
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
            placeholder="Jane Doe"
            className="w-full px-3 py-2 border rounded"
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Your feedback</label>
          <textarea
            rows={3}
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            required
            placeholder="Leave a comment…"
            className="w-full px-3 py-2 border rounded"
          />
        </div>

        {/* ---------- STARS ---------- */}
        <div className="flex items-center gap-2">
          <span className="text-sm">Rating:</span>
          {[1, 2, 3, 4, 5].map((star) => {
            const filled = star <= (hover ?? rating);
            return (
              <svg
                key={star}
                onMouseEnter={() => setHover(star)}
                onMouseLeave={() => setHover(null)}
                onClick={() => setRating(star)}
                className={`${styles.star} ${filled ? styles.active : ''}`}
                viewBox="0 0 20 20"
              >
                <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.286 3.966a1 1 0 00.95.69h4.173c.969 0 1.371 1.24.588 1.81l-3.378 2.455a1 1 0 00-.364 1.118l1.287 3.966c.3.921-.755 1.688-1.538 1.118L10 13.347l-3.375 2.455c-.783.57-1.838-.197-1.539-1.118l1.287-3.966a1 1 0 00-.364-1.118L2.63 9.393c-.783-.57-.38-1.81.588-1.81h4.174a1 1 0 00.949-.69l1.286-3.966z" />
              </svg>
            );
          })}
        </div>

        <button
          disabled={submitting}
          className="px-4 py-2 bg-yellow-500 hover:bg-yellow-600 text-white rounded disabled:opacity-50"
        >
          {submitting ? 'Submitting…' : 'Submit Review'}
        </button>
      </form>

      {/* ---------- LIST ---------- */}
      <div className="space-y-6">
        {reviews.length === 0 && (
          <p className="text-sm text-gray-500 italic text-center">
            No reviews yet. Be the first!
          </p>
        )}
        {reviews.map((rev: any) => (
          <div key={rev.id}>
            <p className="font-semibold">
              {rev.name}{' '}
              <span className="text-yellow-500">★{rev.rating}</span>
            </p>
            <p className="text-sm text-gray-600">{rev.comment}</p>
          </div>
        ))}
      </div>
    </section>
  );
}
