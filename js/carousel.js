// ═══════════════════════════════════════════════
// CAROUSEL & SCROLL — Hero banner + product rows
// ═══════════════════════════════════════════════

// ── Hero Carousel ──
function initHeroCarousel() {
    const slides = document.querySelectorAll('.hero-slide');
    const dots = document.querySelectorAll('.hero-dot');
    if (slides.length === 0) return;

    let current = 0;
    let interval;

    function goToSlide(index) {
        slides.forEach(s => s.classList.remove('active'));
        dots.forEach(d => d.classList.remove('active'));
        current = index;
        slides[current].classList.add('active');
        if (dots[current]) dots[current].classList.add('active');
    }

    function nextSlide() {
        goToSlide((current + 1) % slides.length);
    }

    function startAutoplay() {
        interval = setInterval(nextSlide, 4500);
    }

    function stopAutoplay() {
        clearInterval(interval);
    }

    // Dot click
    dots.forEach((dot, i) => {
        dot.addEventListener('click', () => {
            stopAutoplay();
            goToSlide(i);
            startAutoplay();
        });
    });

    // Touch swipe support
    const carousel = document.querySelector('.hero-carousel');
    if (carousel) {
        let startX = 0;
        carousel.addEventListener('touchstart', e => {
            startX = e.touches[0].clientX;
            stopAutoplay();
        }, { passive: true });

        carousel.addEventListener('touchend', e => {
            const diff = startX - e.changedTouches[0].clientX;
            if (Math.abs(diff) > 50) {
                if (diff > 0) nextSlide();
                else goToSlide((current - 1 + slides.length) % slides.length);
            }
            startAutoplay();
        }, { passive: true });
    }

    goToSlide(0);
    startAutoplay();
}

// ── Product Scroll Arrows ──
function initScrollArrows() {
    document.querySelectorAll('.scroll-section').forEach(section => {
        const row = section.querySelector('.product-scroll-row');
        const leftArr = section.querySelector('.scroll-arrow.left');
        const rightArr = section.querySelector('.scroll-arrow.right');

        if (!row) return;

        const scrollAmount = 440;

        if (leftArr) {
            leftArr.addEventListener('click', () => {
                row.scrollBy({ left: -scrollAmount, behavior: 'smooth' });
            });
        }

        if (rightArr) {
            rightArr.addEventListener('click', () => {
                row.scrollBy({ left: scrollAmount, behavior: 'smooth' });
            });
        }
    });
}

// Init on DOM ready
document.addEventListener('DOMContentLoaded', () => {
    initHeroCarousel();
    initScrollArrows();
});
