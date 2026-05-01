// Product review persistence and rendering

const REVIEWS_KEY = 'kidvanaReviews';

function getReviews(productId) {
    const allReviews = JSON.parse(localStorage.getItem(REVIEWS_KEY) || '{}');
    return allReviews[productId] || [];
}

function saveReview(productId, review) {
    const allReviews = JSON.parse(localStorage.getItem(REVIEWS_KEY) || '{}');
    if (!allReviews[productId]) allReviews[productId] = [];

    review.id = Date.now();
    review.date = new Date().toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });
    allReviews[productId].unshift(review);
    localStorage.setItem(REVIEWS_KEY, JSON.stringify(allReviews));
    return review;
}

function calculateAverageRating(productId) {
    const reviews = getReviews(productId);
    if (!reviews.length) return 0;
    const sum = reviews.reduce((total, review) => total + review.rating, 0);
    return (sum / reviews.length).toFixed(1);
}

function renderReviewsUI(productId, mountId = 'reviewsSectionContent') {
    const mountNode = typeof mountId === 'string' ? document.getElementById(mountId) : mountId;
    if (!mountNode) return;

    const reviews = getReviews(productId);
    const averageRating = reviews.length ? calculateAverageRating(productId) : '0.0';

    mountNode.innerHTML = `
        <div class="section-header reveal">
            <div>
                <h2>Customer Reviews</h2>
                <p class="section-subtitle">
                    <strong id="averageRatingLabel">${averageRating}</strong>
                    <span id="totalReviewsLabel">(${reviews.length} reviews)</span>
                </p>
            </div>
        </div>
        <div style="display:grid; grid-template-columns:1.1fr 1fr; gap:32px;">
            <div class="support-card" style="margin-bottom:0;">
                <h3 style="margin-bottom:16px;">What shoppers are saying</h3>
                <div id="reviewsList">
                    ${reviews.length ? '' : '<p style="color:var(--gray-500); text-align:center; padding:20px;">No reviews yet. Be the first to review.</p>'}
                </div>
            </div>
            <div class="support-card" style="margin-bottom:0;">
                <h3 style="margin-bottom:16px;">Write a review</h3>
                <form id="reviewForm">
                    <div class="form-group">
                        <label class="form-label" for="reviewRating">Rating</label>
                        <select id="reviewRating" class="form-input" required>
                            <option value="">Select rating</option>
                            <option value="5">5 - Excellent</option>
                            <option value="4">4 - Very good</option>
                            <option value="3">3 - Good</option>
                            <option value="2">2 - Fair</option>
                            <option value="1">1 - Poor</option>
                        </select>
                    </div>
                    <div class="form-group">
                        <label class="form-label" for="reviewComment">Your Review</label>
                        <textarea id="reviewComment" class="form-input" rows="5" placeholder="Share quality, fit, delivery, or overall experience." required></textarea>
                    </div>
                    <button type="submit" class="btn btn-primary">Submit Review</button>
                </form>
            </div>
        </div>
    `;

    const container = document.getElementById('reviewsList');
    if (container && reviews.length) {
        container.innerHTML = reviews.map(review => `
            <div class="review-item" style="padding:16px 0; border-bottom:1px solid var(--gray-100);">
                <div style="display:flex; justify-content:space-between; margin-bottom:4px;">
                    <span style="font-weight:600; font-size:0.9rem;">${review.userName}</span>
                    <span style="font-size:0.75rem; color:var(--gray-400);">${review.date}</span>
                </div>
                <div style="color:var(--accent-yellow); font-size:0.75rem; margin-bottom:8px;">
                    ${'&#9733;'.repeat(review.rating)}${'&#9734;'.repeat(5 - review.rating)}
                </div>
                <p style="font-size:0.85rem; color:var(--gray-600); line-height:1.5;">${review.comment}</p>
            </div>
        `).join('');
    }

    document.getElementById('reviewForm')?.addEventListener('submit', (event) => handleReviewSubmit(event, productId));
}

function handleReviewSubmit(event, productId) {
    event.preventDefault();
    const user = typeof getAuthUser === 'function' ? getAuthUser() : JSON.parse(localStorage.getItem('kidvanaUser') || 'null');

    if (!user) {
        showToast('Please login to write a review', 'error');
        openLoginModal();
        return;
    }

    const rating = Number(document.getElementById('reviewRating')?.value || 0);
    const comment = document.getElementById('reviewComment')?.value.trim();
    if (!rating || !comment) {
        showToast('Please provide rating and comment', 'error');
        return;
    }

    saveReview(productId, {
        userName: user.name,
        rating,
        comment
    });

    showToast('Review shared. Thank you!', 'success');
    renderReviewsUI(productId);
}

