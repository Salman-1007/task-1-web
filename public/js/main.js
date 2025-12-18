// Menu Toggle Navigation
const menuBtn = document.querySelector('.menu');
const overlay = document.getElementById('overlayMenu');
const closeBtn = document.getElementById('closeBtn');

if (menuBtn && overlay && closeBtn) {
    menuBtn.addEventListener('click', () => {
        overlay.classList.add('active');
    });

    closeBtn.addEventListener('click', () => {
        overlay.classList.remove('active');
    });
}

// Testimonials Carousel (for home page)
const slides = document.querySelectorAll('.testimonial-slide');
if (slides.length > 0) {
    let currentSlide = 0;

    function showSlide(index) {
        slides.forEach((slide, i) => {
            slide.style.opacity = (i === index) ? '1' : '0';
        });
    }

    function nextSlide() {
        currentSlide = (currentSlide + 1) % slides.length;
        showSlide(currentSlide);
    }

    // Auto rotate every 4 seconds
    setInterval(nextSlide, 4000);

    // Start from first
    showSlide(0);
}

