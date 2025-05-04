'use client';

import { useEffect, useState } from 'react';
import { getReviews, submitReview } from '../services/api.service';

export default function ReviewSection() {
  const [reviews, setReviews] = useState<any[]>([]);
  const [name, setName] = useState('');
  const [comment, setComment] = useState('');
  const [rating, setRating] = useState(5);
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
      setRating(5);
      const updated = await getReviews();
      setReviews(updated);
    } catch (err) {
      console.error(err);
      alert('Failed to post review');
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <section className="max-w-3xl mx-auto mt-12 p-6 rounded border shadow space-y-6">
      <h2 className="text-xl font-semibold text-gray-800">Leave us a comment</h2>

      <form onSubmit={handleSubmit} className="space-y-3">
        <input
          type="text"
          placeholder="Your name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
          className="w-full px-3 py-2 border rounded"
        />
        <textarea
          placeholder="Your feedback"
          value={comment}
          onChange={(e) => setComment(e.target.value)}
          required
          className="w-full px-3 py-2 border rounded"
        />
        <div className="flex items-center gap-2">
          <label htmlFor="rating" className="text-sm">Rating:</label>
          <input
            id="rating"
            type="number"
            min={1}
            max={5}
            value={rating}
            onChange={(e) => setRating(Number(e.target.value))}
            className="w-16 px-2 py-1 border rounded"
          />
        </div>
        <button
          type="submit"
          disabled={submitting}
          className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700"
        >
          {submitting ? 'Submitting...' : 'Submit Review'}
        </button>
      </form>

      <div className="divide-y">
        {reviews.map((r) => (
          <div key={r.id} className="py-4">
            <p className="font-semibold">{r.name} <span className="text-yellow-500">★{r.rating}</span></p>
            <p className="text-sm text-gray-700">{r.comment}</p>
          </div>
        ))}
      </div>
    </section>
  );
}
