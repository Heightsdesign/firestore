// src/services/api.service.ts

const BASE_URL = 'http://127.0.0.1:8000/api'; // or your deployed backend URL

export async function getReviews() {
  const res = await fetch(`${BASE_URL}/reviews/`);
  if (!res.ok) throw new Error('Failed to fetch reviews');
  return res.json();
}

export async function submitReview(data: {
  name: string;
  rating: number;
  comment: string;
}) {
  const res = await fetch(`${BASE_URL}/reviews/`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error('Failed to submit review');
  return res.json();
}
