
import React, { useMemo, useState } from 'react';
import { getAllOrders, getAllProducts } from './marketplaceStorage';
import './ReviewsRatings.css';

const ReviewsRatings = ({ profile, onBack }) => {
  const buyerKey = String(
    profile?.email || profile?.id || profile?.userId || ''
  ).toLowerCase();

  const [orders] = useState(() => getAllOrders());
  const [products] = useState(() => getAllProducts());

  const [reviews, setReviews] = useState(() => {
    try {
      return JSON.parse(
        localStorage.getItem(`agrosphere_reviews_${buyerKey}`)
      ) || [];
    } catch {
      return [];
    }
  });

  const [form, setForm] = useState({
    productId: '',
    rating: 5,
    title: '',
    comment: '',
  });

  const [filter, setFilter] = useState('All');
  const [message, setMessage] = useState('');

  const myOrders = useMemo(() => {
    return orders.filter(order => {
      const key = String(
        order.buyerKey ||
        order.buyerEmail ||
        order.customerEmail ||
        ''
      ).toLowerCase();

      return key === buyerKey;
    });
  }, [orders, buyerKey]);

  // Only products included in this buyer's orders can be reviewed.
  const purchasedProducts = useMemo(() => {
    const purchasedIds = new Set();

    myOrders.forEach(order => {
      (order.items || []).forEach(item => {
        const id = item.productId || item.id;
        if (id) purchasedIds.add(String(id));
      });
    });

    return products.filter(product =>
      purchasedIds.has(String(product.id || product.productId))
    );
  }, [myOrders, products]);

  const selectedProduct = purchasedProducts.find(product =>
    String(product.id || product.productId) === form.productId
  );

  const filteredReviews = reviews.filter(review => {
    if (filter === 'All') return true;
    return String(review.rating) === filter;
  });

  const handleSubmit = event => {
    event.preventDefault();

    if (!form.productId || !form.title.trim() || !form.comment.trim()) {
      setMessage('Please complete all required fields.');
      return;
    }

    const alreadyReviewed = reviews.some(
      review => String(review.productId) === form.productId
    );

    if (alreadyReviewed) {
      setMessage('You have already reviewed this product.');
      return;
    }

    const review = {
      id: crypto.randomUUID(),
      productId: form.productId,
      productName:
        selectedProduct?.name ||
        selectedProduct?.productName ||
        selectedProduct?.title ||
        'Product',
      rating: Number(form.rating),
      title: form.title.trim(),
      comment: form.comment.trim(),
      createdAt: new Date().toISOString(),
    };

    const updated = [review, ...reviews];

    setReviews(updated);
    localStorage.setItem(
      `agrosphere_reviews_${buyerKey}`,
      JSON.stringify(updated)
    );

    setForm({
      productId: '',
      rating: 5,
      title: '',
      comment: '',
    });

    setMessage('Thank you! Your review has been submitted.');
  };

  const averageRating = reviews.length
    ? (
        reviews.reduce((sum, review) => sum + Number(review.rating), 0) /
        reviews.length
      ).toFixed(1)
    : '0.0';

  const getStars = rating =>
    '★'.repeat(Number(rating)) + '☆'.repeat(5 - Number(rating));

  return (
    <div className="reviews-page">
      <header className="reviews-header">
        <button className="reviews-back" onClick={onBack}>
          ← Back to Dashboard
        </button>

        <span className="reviews-eyebrow">BUYER EXPERIENCE</span>
        <h1>Reviews & Ratings</h1>
        <p>Share your experience and help other buyers make informed choices.</p>
      </header>

      <div className="reviews-summary">
        <div className="reviews-summary-card">
          <span className="reviews-summary-label">Your Reviews</span>
          <strong>{reviews.length}</strong>
          <small>Submitted reviews</small>
        </div>

        <div className="reviews-summary-card">
          <span className="reviews-summary-label">Average Rating</span>
          <strong>{averageRating} <span className="summary-star">★</span></strong>
          <small>Based on your reviews</small>
        </div>

        <div className="reviews-summary-card">
          <span className="reviews-summary-label">Eligible Products</span>
          <strong>{purchasedProducts.length}</strong>
          <small>Products from your orders</small>
        </div>
      </div>

      <div className="reviews-layout">
        <section className="review-form-card">
          <h2>Write a Review</h2>
          <p>Review a product you have purchased.</p>

          <form onSubmit={handleSubmit}>
            <label>Select Purchased Product *</label>
            <select
              value={form.productId}
              onChange={e =>
                setForm({ ...form, productId: e.target.value })
              }
              required
            >
              <option value="">Choose a product</option>
              {purchasedProducts.map(product => {
                const id = product.id || product.productId;
                return (
                  <option key={id} value={id}>
                    {product.name || product.productName || product.title}
                  </option>
                );
              })}
            </select>

            <label>Your Rating *</label>
            <div className="review-rating-options">
              {[1, 2, 3, 4, 5].map(star => (
                <button
                  key={star}
                  type="button"
                  className={star <= form.rating ? 'active' : ''}
                  onClick={() => setForm({ ...form, rating: star })}
                  aria-label={`${star} star rating`}
                >
                  ★
                </button>
              ))}
              <span>{form.rating} out of 5</span>
            </div>

            <label>Review Title *</label>
            <input
              type="text"
              placeholder="Summarize your experience"
              value={form.title}
              onChange={e =>
                setForm({ ...form, title: e.target.value })
              }
              required
            />

            <label>Your Feedback *</label>
            <textarea
              rows="5"
              placeholder="Tell other buyers about the product quality..."
              value={form.comment}
              onChange={e =>
                setForm({ ...form, comment: e.target.value })
              }
              required
            />

            {message && (
              <div className="review-message">{message}</div>
            )}

            <button type="submit" className="review-submit">
              Submit Review
            </button>
          </form>
        </section>

        <section className="review-history-card">
          <div className="review-history-heading">
            <div>
              <h2>Your Reviews</h2>
              <p>All feedback submitted by you.</p>
            </div>
            <span>{reviews.length} Total</span>
          </div>

          <div className="review-filter">
            {['All', '5', '4', '3', '2', '1'].map(value => (
              <button
                key={value}
                type="button"
                className={filter === value ? 'selected' : ''}
                onClick={() => setFilter(value)}
              >
                {value === 'All' ? 'All' : `${value} ★`}
              </button>
            ))}
          </div>

          {filteredReviews.length === 0 ? (
            <div className="review-empty">
              <span>⭐</span>
              <h3>No reviews found</h3>
              <p>Your submitted product reviews will appear here.</p>
            </div>
          ) : (
            <div className="review-list">
              {filteredReviews.map(review => (
                <article className="review-item" key={review.id}>
                  <div className="review-item-top">
                    <strong>{review.productName}</strong>
                    <span>
                      {new Date(review.createdAt).toLocaleDateString()}
                    </span>
                  </div>

                  <div className="review-stars">
                    {getStars(review.rating)}
                  </div>

                  <h3>{review.title}</h3>
                  <p>{review.comment}</p>
                </article>
              ))}
            </div>
          )}
        </section>
      </div>
    </div>
  );
};

export default ReviewsRatings;
