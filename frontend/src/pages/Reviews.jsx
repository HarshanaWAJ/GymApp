import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import api from '../api/axiosInstance'; // Adjust path as needed

// StarRating component for selecting rating with stars
function StarRating({ rating, setRating }) {
  const stars = [];

  for (let i = 1; i <= 5; i++) {
    stars.push(
      <span
        key={i}
        onClick={() => setRating(i.toString())}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') setRating(i.toString());
        }}
        role="button"
        tabIndex={0}
        style={{
          cursor: 'pointer',
          color: i <= Number(rating) ? '#ffc107' : '#e4e5e9',
          fontSize: '1.8rem',
          userSelect: 'none',
          transition: 'color 0.2s',
        }}
        aria-label={`${i} Star${i > 1 ? 's' : ''}`}
        aria-pressed={i === Number(rating)}
      >
        ★
      </span>
    );
  }

  return <div>{stars}</div>;
}

function Reviews() {
  const { trainerId, username } = useParams();
  const currentUser = JSON.parse(localStorage.getItem('user')) || null;

  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [errors, setErrors] = useState([]);
  const [successMessage, setSuccessMessage] = useState('');

  // Modal state
  const [showModal, setShowModal] = useState(false);
  const [modalMode, setModalMode] = useState('add'); // 'add' or 'edit'
  const [currentReview, setCurrentReview] = useState(null);

  // Form state
  const [rating, setRating] = useState('');
  const [comment, setComment] = useState('');

  // Delete confirmation modal
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [reviewToDelete, setReviewToDelete] = useState(null);

  useEffect(() => {
    const fetchReviews = async () => {
      setLoading(true);
      try {
        const { data } = await api.get(`/reviews/${trainerId}`);
        setReviews(data);
      } catch (err) {
        setErrors([err.response?.data?.message || err.message || 'Failed to fetch reviews']);
      } finally {
        setLoading(false);
      }
    };
    fetchReviews();
  }, [trainerId]);

  const validateForm = () => {
    const errors = [];
    const ratingNumber = Number(rating);

    if (!rating) {
      errors.push('Rating is required');
    } else if (!Number.isInteger(ratingNumber) || ratingNumber < 1 || ratingNumber > 5) {
      errors.push('Rating must be an integer between 1 and 5');
    }

    if (comment.length > 500) {
      errors.push('Comment cannot exceed 500 characters');
    }

    return errors;
  };

  const openAddModal = () => {
    setModalMode('add');
    setCurrentReview(null);
    setRating('');
    setComment('');
    setErrors([]);
    setSuccessMessage('');
    setShowModal(true);
  };

  const openEditModal = (review) => {
    setModalMode('edit');
    setCurrentReview(review);
    setRating(review.rating.toString());
    setComment(review.comment || '');
    setErrors([]);
    setSuccessMessage('');
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrors([]);
    setSuccessMessage('');

    const validationErrors = validateForm();
    if (validationErrors.length > 0) {
      setErrors(validationErrors);
      return;
    }

    try {
      const url = modalMode === 'add' ? `/reviews/${trainerId}` : `/reviews/${currentReview._id}`;
      const method = modalMode === 'add' ? api.post : api.put;

      // Send clientName only when adding a review
      const payload =
        modalMode === 'add'
          ? {
              rating: Number(rating),
              comment,
              clientName: currentUser?.name || currentUser?.username || 'Anonymous',
            }
          : {
              rating: Number(rating),
              comment,
            };

      await method(url, payload);

      // Refresh reviews after success
      const { data } = await api.get(`/reviews/${trainerId}`);
      setReviews(data);

      setSuccessMessage(modalMode === 'add' ? 'Review submitted successfully!' : 'Review updated successfully!');
      setShowModal(false);
    } catch (err) {
      setErrors(
        err.response?.data?.errors?.map((e) => e.msg) ||
          [err.response?.data?.message || 'Failed to submit review']
      );
    }
  };

  const openDeleteModal = (review) => {
    setReviewToDelete(review);
    setShowDeleteModal(true);
  };

  const closeDeleteModal = () => {
    setShowDeleteModal(false);
    setReviewToDelete(null);
  };

  const handleDelete = async () => {
    if (!reviewToDelete) return;

    try {
      await api.delete(`/reviews/${reviewToDelete._id}`);

      // Refresh reviews
      const { data } = await api.get(`/reviews/${trainerId}`);
      setReviews(data);
      setSuccessMessage('Review deleted successfully!');
      closeDeleteModal();
    } catch (err) {
      setErrors(
        err.response?.data?.errors?.map((e) => e.msg) ||
          [err.response?.data?.message || 'Failed to delete review']
      );
    }
  };

  return (
    <div className="container my-4" style={{ maxWidth: 700 }}>
      <h2 className="mb-4">Reviews for {username || 'Trainer'}</h2>

      {errors.length > 0 && (
        <div className="alert alert-danger" role="alert">
          <ul className="mb-0">
            {errors.map((err, idx) => (
              <li key={idx}>{err}</li>
            ))}
          </ul>
        </div>
      )}

      {successMessage && (
        <div className="alert alert-success" role="alert">
          {successMessage}
        </div>
      )}

      <div className="mb-3 d-flex justify-content-between align-items-center">
        <h5>All Reviews ({reviews.length})</h5>
        {/* Show Add Review button for any logged-in user */}
        {currentUser && (
          <button className="btn btn-primary" onClick={openAddModal}>
            Add Review
          </button>
        )}
      </div>

      {loading ? (
        <div>Loading reviews...</div>
      ) : reviews.length === 0 ? (
        <p>No reviews yet.</p>
      ) : (
        reviews.map((review) => (
          <div key={review._id} className="card mb-3">
            <div className="card-body">
              <h6 className="card-title">
                {/* Display stars for rating */}
                {[...Array(5)].map((_, i) => (
                  <span
                    key={i}
                    style={{ color: i < review.rating ? '#ffc107' : '#e4e5e9', fontSize: '1.2rem' }}
                    aria-hidden="true"
                  >
                    ★
                  </span>
                ))}{' '}
                <small className="text-muted">by {review.clientName || 'User'}</small>
              </h6>
              <p className="card-text">{review.comment || <em>No comment</em>}</p>

              {/* Only allow edit/delete if current user is the reviewer */}
              {currentUser?._id === review.user && (
                <>
                  <button
                    className="btn btn-sm btn-outline-secondary me-2"
                    onClick={() => openEditModal(review)}
                  >
                    Edit
                  </button>
                  <button className="btn btn-sm btn-outline-danger" onClick={() => openDeleteModal(review)}>
                    Delete
                  </button>
                </>
              )}
            </div>
          </div>
        ))
      )}

      {/* Add/Edit Modal */}
      {showModal && (
        <div
          className="modal fade show d-block"
          tabIndex="-1"
          role="dialog"
          aria-labelledby="reviewModalLabel"
          aria-modal="true"
          style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}
        >
          <div className="modal-dialog" role="document">
            <div className="modal-content" style={{ zIndex: 1050 }}>
              <form onSubmit={handleSubmit}>
                <div className="modal-header">
                  <h5 className="modal-title" id="reviewModalLabel">
                    {modalMode === 'add' ? 'Add Review' : 'Edit Review'}
                  </h5>
                  <button type="button" className="btn-close" aria-label="Close" onClick={closeModal}></button>
                </div>
                <div className="modal-body">
                  <div className="mb-3">
                    <label className="form-label">
                      Rating (1-5) <span className="text-danger">*</span>
                    </label>
                    <StarRating rating={rating} setRating={setRating} />
                  </div>
                  <div className="mb-3">
                    <label htmlFor="commentInput" className="form-label">
                      Comment (optional)
                    </label>
                    <textarea
                      className="form-control"
                      id="commentInput"
                      rows="4"
                      maxLength={500}
                      value={comment}
                      onChange={(e) => setComment(e.target.value)}
                      placeholder="Write your review here (max 500 chars)"
                    />
                    <div className="form-text text-end">{comment.length} / 500 characters</div>
                  </div>
                </div>
                <div className="modal-footer">
                  <button type="button" className="btn btn-secondary" onClick={closeModal}>
                    Cancel
                  </button>
                  <button type="submit" className="btn btn-primary">
                    {modalMode === 'add' ? 'Submit Review' : 'Update Review'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteModal && (
        <div
          className="modal fade show d-block"
          tabIndex="-1"
          role="dialog"
          aria-labelledby="deleteModalLabel"
          aria-modal="true"
          style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}
        >
          <div className="modal-dialog modal-sm modal-dialog-centered" role="document">
            <div className="modal-content" style={{ zIndex: 1050 }}>
              <div className="modal-header">
                <h5 className="modal-title" id="deleteModalLabel">
                  Confirm Delete
                </h5>
                <button type="button" className="btn-close" aria-label="Close" onClick={closeDeleteModal}></button>
              </div>
              <div className="modal-body">
                Are you sure you want to delete this review?
                <p>
                  <strong>Rating:</strong>{' '}
                  {[...Array(5)].map((_, i) => (
                    <span
                      key={i}
                      style={{ color: i < reviewToDelete.rating ? '#ffc107' : '#e4e5e9', fontSize: '1.2rem' }}
                      aria-hidden="true"
                    >
                      ★
                    </span>
                  ))}
                </p>
                <p>
                  <strong>Comment:</strong> {reviewToDelete.comment || <em>No comment</em>}
                </p>
              </div>
              <div className="modal-footer">
                <button type="button" className="btn btn-secondary" onClick={closeDeleteModal}>
                  Cancel
                </button>
                <button type="button" className="btn btn-danger" onClick={handleDelete}>
                  Delete
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default Reviews;
