import React, { useEffect, useState, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../api/axiosInstance';
import Sentiment from 'sentiment';

// StarRating component
const StarRating = ({ rating, setRating }) => (
  <div>
    {[1, 2, 3, 4, 5].map((i) => (
      <span
        key={i}
        onClick={() => setRating(i.toString())}
        style={{
          cursor: 'pointer',
          color: i <= Number(rating) ? '#ffc107' : '#e4e5e9',
          fontSize: '1.8rem',
          userSelect: 'none',
          transition: 'color 0.2s',
        }}
        aria-label={`${i} Star${i > 1 ? 's' : ''}`}
      >
        ★
      </span>
    ))}
  </div>
);

const sentimentAnalyzer = new Sentiment();

function Reviews() {
  const { trainerId } = useParams();
  const navigate = useNavigate();
  const currentUser = JSON.parse(localStorage.getItem('user')) || {};

  const [trainer, setTrainer] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [errors, setErrors] = useState([]);
  const [successMessage, setSuccessMessage] = useState('');

  // Modal & form state
  const [modalOpen, setModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState('add'); // add/edit
  const [currentReview, setCurrentReview] = useState(null);
  const [rating, setRating] = useState('');
  const [comment, setComment] = useState('');

  // Delete state
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [reviewToDelete, setReviewToDelete] = useState(null);

  // Filter state
  const [filterRating, setFilterRating] = useState('');
  const [filterKeyword, setFilterKeyword] = useState('');

  // Fetch trainer and reviews
  const fetchReviews = async () => {
    try {
      setLoading(true);
      const trainerRes = await api.get(`/trainers/${trainerId}`);
      setTrainer(trainerRes.data);

      const reviewsRes = await api.get(`/reviews/${trainerId}`);
      setReviews(reviewsRes.data);
    } catch (err) {
      setErrors([err.response?.data?.message || err.message || 'Failed to fetch data']);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReviews();
  }, [trainerId]);

  // Filtered reviews
  const filteredReviews = useMemo(() => {
    return reviews.filter((r) => {
      const matchRating = filterRating ? r.rating === Number(filterRating) : true;
      const matchKeyword = filterKeyword ? r.comment?.toLowerCase().includes(filterKeyword.toLowerCase()) : true;
      return matchRating && matchKeyword;
    });
  }, [reviews, filterRating, filterKeyword]);

  // Form validation
  const validateForm = () => {
    const errs = [];
    const r = Number(rating);
    if (!rating) errs.push('Rating is required');
    else if (!Number.isInteger(r) || r < 1 || r > 5) errs.push('Rating must be 1-5');
    if (comment.length > 500) errs.push('Comment max 500 characters');
    return errs;
  };

  // Open modals
  const openModal = (mode, review = null) => {
    setModalMode(mode);
    setCurrentReview(review);
    setRating(review?.rating?.toString() || '');
    setComment(review?.comment || '');
    setErrors([]);
    setSuccessMessage('');
    setModalOpen(true);
  };

  const closeModal = () => setModalOpen(false);

  // Submit review (add/edit)
  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrors([]);
    setSuccessMessage('');
    const errs = validateForm();
    if (errs.length) return setErrors(errs);

    try {
      const payload = modalMode === 'add'
        ? { rating: Number(rating), comment, clientName: currentUser.name || currentUser.username || 'Anonymous' }
        : { rating: Number(rating), comment };

      const url = modalMode === 'add' ? `/reviews/${trainerId}` : `/reviews/${currentReview._id}`;
      const method = modalMode === 'add' ? api.post : api.put;

      await method(url, payload);
      await fetchReviews();
      setSuccessMessage(modalMode === 'add' ? 'Review added!' : 'Review updated!');
      closeModal();
    } catch (err) {
      setErrors(err.response?.data?.errors?.map(e => e.msg) || [err.response?.data?.message || 'Failed']);
    }
  };

  // Delete review
  const handleDelete = async () => {
    if (!reviewToDelete) return;
    try {
      await api.delete(`/reviews/${reviewToDelete._id}`);
      await fetchReviews();
      setSuccessMessage('Review deleted!');
      setDeleteModalOpen(false);
    } catch (err) {
      setErrors(err.response?.data?.errors?.map(e => e.msg) || [err.response?.data?.message || 'Failed to delete']);
    }
  };

  // Check if current user can edit/delete
  const canEdit = (review) => review.clientName === (currentUser.name || currentUser.username);

  // Sentiment analysis
  const getSentimentLabel = (comment) => {
    if (!comment) return 'Neutral';
    const result = sentimentAnalyzer.analyze(comment);
    if (result.score > 0.2) return 'Positive';
    if (result.score < -0.2) return 'Negative';
    return 'Neutral';
  };

  const getSentimentColor = (sentiment) => {
    if (sentiment === 'Positive') return 'green';
    if (sentiment === 'Negative') return 'red';
    return 'gray';
  };

  return (
    <div className="container my-4" style={{ maxWidth: 700 }}>
      <button className="btn btn-outline-secondary mb-3" onClick={() => navigate(-1)}>&larr; Back</button>

      {/* Trainer */}
      {trainer && (
        <div className="card mb-4 shadow-sm">
          <div className="row g-0 align-items-center">
            <div className="col-md-4">
              <img src={trainer.imageUrl || '/default-trainer.png'} alt={trainer.name} className="img-fluid rounded-start" style={{ height: '100%', objectFit: 'cover' }} />
            </div>
            <div className="col-md-8">
              <div className="card-body">
                <h3>{trainer.name}</h3>
                <p><strong>Specialization:</strong> {trainer.specialization || 'N/A'}</p>
                <p><strong>Experience:</strong> {trainer.experience || 'N/A'} years</p>
                <p><strong>Bio:</strong> {trainer.bio || 'No bio available'}</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Messages */}
      {errors.length > 0 && <div className="alert alert-danger">{errors.map((e, idx) => <div key={idx}>{e}</div>)}</div>}
      {successMessage && <div className="alert alert-success">{successMessage}</div>}

      {/* Filters */}
      <div className="mb-3 d-flex gap-2 align-items-center flex-wrap">
        <label>Rating:</label>
        <select className="form-select w-auto" value={filterRating} onChange={e => setFilterRating(e.target.value)}>
          <option value="">All</option>
          {[1, 2, 3, 4, 5].map(r => <option key={r} value={r}>{r}★</option>)}
        </select>

        <label>Search:</label>
        <input type="text" className="form-control w-auto" placeholder="Keyword..." value={filterKeyword} onChange={e => setFilterKeyword(e.target.value)} />
      </div>

      <div className="mb-3 d-flex justify-content-between align-items-center">
        <h5>Reviews ({filteredReviews.length})</h5>
        {currentUser && <button className="btn btn-primary" onClick={() => openModal('add')}>Add Review</button>}
      </div>

      {/* Reviews list */}
      {loading ? <p>Loading...</p> :
        filteredReviews.length === 0 ? <p>No reviews found.</p> :
          filteredReviews.map((r) => {
            const sentiment = getSentimentLabel(r.comment);
            return (
              <div key={r._id} className="card mb-3 shadow-sm">
                <div className="card-body">
                  <div className="d-flex justify-content-between align-items-center">
                    <div>
                      {[...Array(5)].map((_, i) => <span key={i} style={{ color: i < r.rating ? '#ffc107' : '#e4e5e9', fontSize: '1.2rem' }}>★</span>)}
                      <small className="text-muted ms-2">by {r.clientName || 'User'}</small>
                    </div>
                    {canEdit(r) && (
                      <div>
                        <button className="btn btn-sm btn-outline-secondary me-2" onClick={() => openModal('edit', r)}>Edit</button>
                        <button className="btn btn-sm btn-outline-danger" onClick={() => { setReviewToDelete(r); setDeleteModalOpen(true); }}>Delete</button>
                      </div>
                    )}
                  </div>
                  <p className="mt-2">{r.comment || <em>No comment</em>}</p>
                  <p className="mt-1"><strong>Sentiment:</strong> <span style={{ color: getSentimentColor(sentiment) }}>{sentiment}</span></p>
                </div>
              </div>
            )
          })
      }

      {/* Add/Edit Modal */}
      {modalOpen && (
        <div className="modal fade show d-block" tabIndex="-1" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
          <div className="modal-dialog">
            <div className="modal-content">
              <form onSubmit={handleSubmit}>
                <div className="modal-header">
                  <h5>{modalMode === 'add' ? 'Add Review' : 'Edit Review'}</h5>
                  <button type="button" className="btn-close" onClick={closeModal}></button>
                </div>
                <div className="modal-body">
                  <label>Rating *</label>
                  <StarRating rating={rating} setRating={setRating} />
                  <div className="mb-3 mt-2">
                    <label>Comment</label>
                    <textarea className="form-control" rows="4" value={comment} onChange={e => setComment(e.target.value)} maxLength={500} />
                    <small className="text-end d-block">{comment.length}/500</small>
                  </div>
                </div>
                <div className="modal-footer">
                  <button type="button" className="btn btn-secondary" onClick={closeModal}>Cancel</button>
                  <button type="submit" className="btn btn-primary">{modalMode === 'add' ? 'Submit' : 'Update'}</button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Delete Modal */}
      {deleteModalOpen && reviewToDelete && (
        <div className="modal fade show d-block" tabIndex="-1" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
          <div className="modal-dialog modal-sm modal-dialog-centered">
            <div className="modal-content">
              <div className="modal-header">
                <h5>Confirm Delete</h5>
                <button type="button" className="btn-close" onClick={() => setDeleteModalOpen(false)}></button>
              </div>
              <div className="modal-body">
                Are you sure you want to delete this review?
                <p><strong>Rating:</strong> {[...Array(5)].map((_, i) => <span key={i} style={{ color: i < reviewToDelete.rating ? '#ffc107' : '#e4e5e9' }}>★</span>)}</p>
                <p><strong>Comment:</strong> {reviewToDelete.comment || <em>No comment</em>}</p>
              </div>
              <div className="modal-footer">
                <button className="btn btn-secondary" onClick={() => setDeleteModalOpen(false)}>Cancel</button>
                <button className="btn btn-danger" onClick={handleDelete}>Delete</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default Reviews;
