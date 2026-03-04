// Mobile Menu Toggle
const mobileMenuBtn = document.getElementById('mobileMenuBtn');
const mobileMenu = document.getElementById('mobileMenu');

if (mobileMenuBtn && mobileMenu) {
    mobileMenuBtn.addEventListener('click', () => {
        mobileMenu.classList.toggle('active');
        mobileMenuBtn.classList.toggle('active');
    });

    // Close mobile menu when clicking outside
    document.addEventListener('click', (e) => {
        if (!mobileMenu.contains(e.target) && !mobileMenuBtn.contains(e.target)) {
            mobileMenu.classList.remove('active');
            mobileMenuBtn.classList.remove('active');
        }
    });
}

// Navigation Links
const navLinks = document.querySelectorAll('.nav-link, .mobile-nav-link');

navLinks.forEach(link => {
    link.addEventListener('click', (e) => {
        const page = link.getAttribute('data-page');

        if (page) {
            // Remove active class from all links
            document.querySelectorAll('.nav-link, .mobile-nav-link').forEach(l => {
                l.classList.remove('active');
            });

            // Add active class to clicked link
            link.classList.add('active');

            // Close mobile menu if open
            if (mobileMenu) {
                mobileMenu.classList.remove('active');
                if (mobileMenuBtn) {
                    mobileMenuBtn.classList.remove('active');
                }
            }

            // Navigate to page
            window.location.href = page;
        }
    });
});

// Carousel Functionality
const carousel = document.querySelector('.carousel');
if (carousel) {
    const cards = carousel.querySelectorAll('.activity-card');
    const dots = carousel.querySelectorAll('.dot');
    const prevBtn = carousel.querySelector('.carousel-prev');
    const nextBtn = carousel.querySelector('.carousel-next');
    let currentIndex = 0;

    function showCard(index) {
        if (cards.length === 0) return;
        // Hide all cards
        cards.forEach(card => card.classList.remove('active'));
        if (dots.length > 0) dots.forEach(dot => dot.classList.remove('active'));

        // Show current card
        if (cards[index]) {
            cards[index].classList.add('active');
        }
        if (dots[index]) {
            dots[index].classList.add('active');
        }

        currentIndex = index;
    }

    function nextCard() {
        if (cards.length === 0) return;
        const nextIndex = (currentIndex + 1) % cards.length;
        showCard(nextIndex);
    }

    function prevCard() {
        if (cards.length === 0) return;
        const prevIndex = (currentIndex - 1 + cards.length) % cards.length;
        showCard(prevIndex);
    }

    // Event listeners
    if (nextBtn) {
        nextBtn.addEventListener('click', nextCard);
    }

    if (prevBtn) {
        prevBtn.addEventListener('click', prevCard);
    }

    if (dots.length > 0) {
        dots.forEach((dot, index) => {
            dot.addEventListener('click', () => showCard(index));
        });
    }

    // Auto-play carousel
    let autoplayInterval = setInterval(nextCard, 5000);

    // Pause autoplay on hover
    carousel.addEventListener('mouseenter', () => {
        clearInterval(autoplayInterval);
    });

    carousel.addEventListener('mouseleave', () => {
        autoplayInterval = setInterval(nextCard, 5000);
    });

    // Show first card
    showCard(0);
}

// Scroll Reveal Animation
const observerOptions = {
    threshold: 0.2,
    rootMargin: '0px 0px -50px 0px'
};

const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.classList.add('revealed');
        }
    });
}, observerOptions);

// Observe sections
const activitiesSections = document.querySelectorAll('.activities-section, .executive-section');
if (activitiesSections.length > 0) {
    activitiesSections.forEach(section => {
        section.classList.add('scroll-reveal');
        observer.observe(section);
    });
}
// Observe executive cards with stagger
const executiveCards = document.querySelectorAll('.executive-card');
if (executiveCards.length > 0) {
    executiveCards.forEach((card, index) => {
        card.classList.add('stagger-item');
        card.style.transitionDelay = `${index * 0.1}s`;
        observer.observe(card);
    });
}

// Observe news and event cards
const newsEventCards = document.querySelectorAll('.news-card, .event-card');
if (newsEventCards.length > 0) {
    newsEventCards.forEach((card, index) => {
        card.classList.add('stagger-item');
        card.style.transitionDelay = `${index * 0.1}s`;
        observer.observe(card);
    });
}

// Counter Animation for Stats
const statNumbers = document.querySelectorAll('.stat-number');
if (statNumbers.length > 0) {
    const animateCounter = (element) => {
        const target = parseInt(element.getAttribute('data-target'));
        const duration = 2000;
        const increment = target / (duration / 16);
        let current = 0;

        const updateCounter = () => {
            current += increment;
            if (current < target) {
                element.textContent = Math.floor(current);
                requestAnimationFrame(updateCounter);
            } else {
                element.textContent = target;
            }
        };
        updateCounter();
    };
    const statsObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                animateCounter(entry.target);
                statsObserver.unobserve(entry.target);
            }
        });
    }, { threshold: 0.5 });

    statNumbers.forEach(stat => {
        statsObserver.observe(stat);
    });
}

// Contact Form Handling
const contactForm = document.getElementById('contactForm');

if (contactForm) {
    contactForm.addEventListener('submit', (e) => {
        e.preventDefault();

        // Get form data
        const formData = new FormData(contactForm);
        const data = Object.fromEntries(formData);

        // Simple validation
        if (!data.name || !data.email || !data.subject || !data.message) {
            alert('Veuillez remplir tous les champs obligatoires.');
            return;
        }

        // Email validation
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(data.email)) {
            alert('Veuillez entrer une adresse email valide.');
            return;
        }

        // Simulate form submission
        alert('Merci pour votre message ! Nous vous répondrons dans les plus brefs délais.');
        contactForm.reset();

        // In a real application, you would send the data to a server here
        console.log('Form data:', data);
    });
}

// Smooth Scroll for Anchor Links
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        const href = this.getAttribute('href');
        if (href !== '#' && href.length > 1) {
            e.preventDefault();
            const target = document.querySelector(href);
            if (target) {
                target.scrollIntoView({
                    behavior: 'smooth',
                    block: 'start'
                });
            }
        }
    });
});

// Header Scroll Effect
let lastScroll = 0;
const header = document.getElementById('header');

window.addEventListener('scroll', () => {
    const currentScroll = window.pageYOffset;

    if (currentScroll > 100) {
        header.style.boxShadow = '0 4px 20px rgba(0, 0, 0, 0.1)';
    } else {
        header.style.boxShadow = '0 2px 10px rgba(0, 0, 0, 0.1)';
    }

    lastScroll = currentScroll;
});

// Page Transition
document.body.classList.add('page-transition');

// Set active navigation based on current page
const currentPage = window.location.pathname.split('/').pop() || 'index.html';
document.querySelectorAll('.nav-link, .mobile-nav-link').forEach(link => {
    const linkPage = link.getAttribute('data-page');
    if (linkPage === currentPage) {
        link.classList.add('active');
    }
});

// Initialize first card in carousel
const slides = document.querySelectorAll('.news-slide');
const next = document.querySelector('.next');
const prev = document.querySelector('.prev');
let current = 0;

if (slides.length > 0) {
        function showSlide(index) {
                slides.forEach(slide => slide.classList.remove('active'));
                if (slides[index]) slides[index].classList.add('active');
        }

        if (next) {
                next.addEventListener('click', () => {
                        current = (current + 1) % slides.length;
                        showSlide(current);
                });
        }

        if (prev) {
                prev.addEventListener('click', () => {
                        current = (current - 1 + slides.length) % slides.length;
                        showSlide(current);
                });
        }

        // Optionnel : slider automatique toutes les 5 secondes
        setInterval(() => {
                current = (current + 1) % slides.length;
                showSlide(current);
        }, 5000);

        showSlide(0);
}

//propos

// Animation des compteurs

        const counters = document.querySelectorAll('.counter');
        const speed = 200;

        const animateCounters = () => {
            counters.forEach(counter => {
                const target = +counter.getAttribute('data-target');
                const count = +counter.innerText;
                const increment = target / speed;

                if (count < target) {
                    counter.innerText = Math.ceil(count + increment);
                    setTimeout(animateCounters, 10);
                } else {
                    counter.innerText = target + "+";
                }
            });
        }

        // Déclencher l'animation au défilement
        const statsBg = document.querySelector('.stats-bg');
        if (statsBg) {
            const statsBgObserverOptions = {
                threshold: 0.5
            };

            const statsBgObserver = new IntersectionObserver((entries) => {
                entries.forEach(entry => {
                    if (entry.isIntersecting) {
                        animateCounters();
                    }
                });
            }, statsBgObserverOptions);

            statsBgObserver.observe(statsBg);
        }