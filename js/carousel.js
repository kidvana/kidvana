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

function initAutoScrollRows() {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

    document.querySelectorAll('.product-scroll-row[data-auto-scroll]').forEach(row => {
        if (row.dataset.autoScrollBound === 'true') return;
        row.dataset.autoScrollBound = 'true';

        const intervalMs = Number(row.dataset.autoScroll) || 5000;
        let autoScrollTimer = null;

        function getScrollAmount() {
            const firstCard = row.querySelector('.product-card');
            if (!firstCard) return 320;

            const styles = window.getComputedStyle(row);
            const gap = parseFloat(styles.columnGap || styles.gap || 0) || 0;
            return firstCard.getBoundingClientRect().width + gap;
        }

        function stepScroll() {
            if (row.scrollWidth <= row.clientWidth) return;

            const scrollAmount = getScrollAmount();
            const reachedEnd = row.scrollLeft + row.clientWidth >= row.scrollWidth - scrollAmount;

            if (reachedEnd) {
                row.scrollTo({ left: 0, behavior: 'smooth' });
                return;
            }

            row.scrollBy({ left: scrollAmount, behavior: 'smooth' });
        }

        function startAutoScroll() {
            stopAutoScroll();
            autoScrollTimer = window.setInterval(stepScroll, intervalMs);
        }

        function stopAutoScroll() {
            if (autoScrollTimer) {
                window.clearInterval(autoScrollTimer);
                autoScrollTimer = null;
            }
        }

        row.addEventListener('mouseenter', stopAutoScroll);
        row.addEventListener('mouseleave', startAutoScroll);
        row.addEventListener('touchstart', stopAutoScroll, { passive: true });
        row.addEventListener('touchend', startAutoScroll, { passive: true });

        startAutoScroll();
    });
}

// Init on DOM ready
document.addEventListener('DOMContentLoaded', () => {
    initHeroCarousel();
    initScrollArrows();
    initAutoScrollRows();
});
