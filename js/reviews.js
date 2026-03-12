// ═══════════════════════════════════════════════
// REVIEWS — Product Feedback Manager
// ═══════════════════════════════════════════════

const REVIEWS_KEY = 'kidvanaReviews';

function getReviews(productId) {
    const allReviews = JSON.parse(localStorage.getItem(REVIEWS_KEY)) || {};
    return allReviews[productId] || [];
}

function saveReview(productId, review) {
    const allReviews = JSON.parse(localStorage.getItem(REVIEWS_KEY)) || {};
    if (!allReviews[productId]) allReviews[productId] = [];

    // Add timestamp and ID
    review.id = Date.now();
    review.date = new Date().toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });

    allReviews[productId].unshift(review); // Newest first
    localStorage.setItem(REVIEWS_KEY, JSON.stringify(allReviews));
    return review;
}

function calculateAverageRating(productId) {
    const reviews = getReviews(productId);
    if (reviews.length === 0) return 0;
    const sum = reviews.reduce((acc, r) => acc + r.rating, 0);
    return (sum / reviews.length).toFixed(1);
}

function renderReviewsUI(productId) {
    const reviews = getReviews(productId);
    const container = document.getElementById('reviewsList');
    const avgLabel = document.getElementById('averageRatingLabel');
    const countLabel = document.getElementById('totalReviewsLabel');

    if (!container) return;

    if (reviews.length === 0) {
        container.innerHTML = '<p style="color:var(--gray-500); text-align:center; padding: 20px;">No reviews yet. Be the first to review!</p>';
        if (avgLabel) avgLabel.textContent = '0.0';
        if (countLabel) countLabel.textContent = '(0 reviews)';
        return;
    }

    if (avgLabel) avgLabel.textContent = calculateAverageRating(productId);
    if (countLabel) countLabel.textContent = `(${reviews.length} reviews)`;

    container.innerHTML = reviews.map(r => `
        <div class="review-item" style="padding: 16px 0; border-bottom: 1px solid var(--gray-100);">
            <div style="display:flex; justify-content:space-between; margin-bottom:4px;">
                <span style="font-weight:600; font-size:0.9rem;">${r.userName}</span>
                <span style="font-size:0.75rem; color:var(--gray-400);">${r.date}</span>
            </div>
            <div style="color:var(--accent-yellow); font-size:0.75rem; margin-bottom:8px;">
                ${'★'.repeat(r.rating)}${'☆'.repeat(5 - r.rating)}
            </div>
            <p style="font-size:0.85rem; color:var(--gray-600); line-height:1.5;">${r.comment}</p>
        </div>
    `).join('');
}

function handleReviewSubmit(e, productId) {
    e.preventDefault();
    const user = JSON.parse(localStorage.getItem('kidvanaUser'));

    if (!user) {
        showToast('Please login to write a review', 'error');
        openLoginModal();
        return;
    }

    const rating = parseInt(document.getElementById('reviewRating')?.value);
    const comment = document.getElementById('reviewComment')?.value;

    if (!rating || !comment) {
        showToast('Please provide rating and comment', 'error');
        return;
    }

    saveReview(productId, {
        userName: user.name,
        rating: rating,
        comment: comment
    });

    showToast('Review shared! Thank you ❤️', 'success');
    e.target.reset();
    renderReviewsUI(productId);
}
