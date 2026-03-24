// Mobile Menu Toggle
const mobileMenuBtn = document.getElementById('mobileMenuBtn');
const mobileMenu = document.getElementById('mobileMenu');

// Base storage URL for backend-hosted images
const STORAGE_URL = 'http://127.0.0.1:8000/storage/';

function resolvePhoto(photo) {
    if (!photo) return 'images/img.jpeg';
    if (typeof photo !== 'string') return 'images/img.jpeg';
    // absolute URL
    if (/^https?:\/\//i.test(photo)) return photo;
    // absolute path on server
    if (photo.startsWith('/')) return photo;
    // otherwise assume backend storage path and prefix
    return STORAGE_URL + photo.replace(/^\/+/, '');
}

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
    contactForm.addEventListener('submit', async (e) => {
        e.preventDefault();

        if (window.__CONTACT_SUBMIT_IN_PROGRESS) return;
        window.__CONTACT_SUBMIT_IN_PROGRESS = true;

        const formData = new FormData(contactForm);
        const data = Object.fromEntries(formData);

        // Basic validation
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!data.name || !data.email || !data.message || !emailRegex.test(data.email)) {
            alert('Veuillez remplir correctement les champs requis.');
            window.__CONTACT_SUBMIT_IN_PROGRESS = false;
            return;
        }

        try {
            // Prefer apiService if provided
            if (window.apiService && typeof window.apiService.sendMessage === 'function') {
                const payload = { nom_complet: data.name, email: data.email, message: data.message };
                const res = await window.apiService.sendMessage(payload);
                if (!res.success) {
                    console.error('Message send failed', res.error);
                    alert('Erreur lors de l\'envoi du message.');
                } else {
                    alert('Merci pour votre message ! Nous vous répondrons bientôt.');
                    contactForm.reset();
                }
            } else {
                // Fallback direct fetch
                const resp = await fetch('http://127.0.0.1:8000/api/messages', {
                    method: 'POST', headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ nom_complet: data.name, email: data.email, message: data.message })
                });
                if (!resp.ok) {
                    const err = await resp.json().catch(() => ({}));
                    console.error('Fallback message send failed', err);
                    alert('Erreur lors de l\'envoi du message.');
                } else {
                    alert('Merci pour votre message ! Nous vous répondrons bientôt.');
                    contactForm.reset();
                }
            }
        } catch (err) {
            console.error('Contact submit error:', err);
            alert('Erreur réseau lors de l\'envoi du message.');
        } finally {
            window.__CONTACT_SUBMIT_IN_PROGRESS = false;
        }
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

        // ===== PUBLIC EVENTS LISTING =====
        async function loadPublicEvents() {
            const container = document.getElementById('events-grid');
            if (!container) return;

            try {
                const res = await fetch('http://127.0.0.1:8000/api/evenements');
                if (!res.ok) throw new Error('Failed to fetch events');
                const json = await res.json();
                let events = [];
                if (json && json.evenement) {
                    // backend may return a paginator/resource with .data
                    if (Array.isArray(json.evenement)) events = json.evenement;
                    else if (json.evenement.data && Array.isArray(json.evenement.data)) events = json.evenement.data;
                    else events = [json.evenement];
                }

                if (!events || (Array.isArray(events) && events.length === 0)) {
                    container.innerHTML = '<p>Aucun événement pour le moment.</p>';
                    window._eventsCache = [];
                    return;
                }

                // classify events by date (avenir / en cours / passes) and cache them
                function parseDateStr(s) {
                    if (!s) return null;
                    // accept YYYY-MM-DD, ISO, or DD-MM-YYYY
                    if (/^\d{2}-\d{2}-\d{4}$/.test(s)) {
                        const [d, m, y] = s.split('-');
                        return new Date(`${y}-${m}-${d}`);
                    }
                    const d = new Date(s);
                    return isNaN(d.getTime()) ? null : d;
                }

                function classifyEventByDate(ev) {
                    const start = parseDateStr(ev.date_evenement || ev.date || ev.debut || ev.start_date);
                    const end = parseDateStr(ev.date_fin || ev.date_fin_evenement || ev.fin || ev.end_date) || start;
                    const now = new Date();
                    // compare dates at day precision
                    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
                    let enCours = false, estPasse = false;
                    if (start && end) {
                        const s = new Date(start.getFullYear(), start.getMonth(), start.getDate());
                        const e = new Date(end.getFullYear(), end.getMonth(), end.getDate());
                        if (e < today) estPasse = true;
                        else if (s > today) { enCours = false; estPasse = false; }
                        else if (s <= today && today <= e) enCours = true;
                    }
                    return { enCours: !!enCours, estPasse: !!estPasse };
                }

                events = events.map(ev => Object.assign({}, ev, classifyEventByDate(ev)));

                // cache events so status buttons can filter without re-fetching
                window._eventsCache = events;

                // render helper (exposed globally for simple filtering)
                window.renderEvents = function(list) {
                    if (!list || list.length === 0) {
                        container.innerHTML = '<p>Aucun événement pour le moment.</p>';
                        return;
                    }
                    container.innerHTML = list.map(ev => {
                        const date = ev.date_evenement || '';
                        const photo = resolvePhoto(ev.photo);
                        const typeLabel = ev.type || '';
                        return `
                            <div style="background: #fff; border-radius: 1.5rem; box-shadow: 0 2px 8px rgba(0,0,0,0.07); width: 350px; overflow: hidden; display: flex; flex-direction: column;">
                                <div style="position: relative;">
                                    <img src="${photo}" alt="${escapeHtml(ev.nom)}" style="width: 100%; height: 220px; object-fit: cover;">
                                    <span style="position: absolute; top: 1rem; right: 1rem; background: #e74c3c; color: #fff; border-radius: 1.5rem; padding: 0.5rem 1.2rem; font-weight: bold; font-size: 1rem;">${escapeHtml(typeLabel)}</span>
                                </div>
                                <div style="padding: 1.5rem 1.2rem 1rem 1.2rem; flex: 1; display: flex; flex-direction: column;">
                                    <div style="display: flex; flex-direction: column; flex: 1; justify-content: space-between; min-height: 220px;">
                                        <div>
                                            <div style="display: flex; align-items: center; gap: 0.5rem; color: #27ae60; font-size: 1rem; margin-bottom: 0.5rem;">
                                                <span style="font-size: 1.2rem;">&#128197;</span>
                                                <span>${escapeHtml(date)}</span>
                                            </div>
                                            <div style="display: flex; align-items: center; gap: 0.5rem; color: #555; font-size: 1rem; margin-bottom: 1rem;">
                                                <span style="font-size: 1.2rem;">&#128205;</span>
                                                <span>${escapeHtml(ev.lieu || '')}</span>
                                            </div>
                                            <h3 style="font-size: 1.3rem; font-weight: bold; margin: 0 0 0.5rem 0;">${escapeHtml(ev.nom)}</h3>
                                            <p style="color: #333; font-size: 1rem; margin-bottom: 1.5rem;">${escapeHtml(ev.descriptions || '')}</p>
                                        </div>
                                        <a href="event-details.html?id=${encodeURIComponent(ev.id || ev.ID || ev._id || '')}" style="background: #219653; color: #fff; border-radius: 0.5rem; padding: 0.7rem 2rem; text-align: center; text-decoration: none; font-weight: 600; margin-top: auto;">Voir Détails</a>
                                    </div>
                                </div>
                            </div>
                        `;
                    }).join('');
                };

                // initial render
                window.renderEvents(window._eventsCache || []);
            } catch (err) {
                console.error('Error loading events:', err);
                container.innerHTML = '<p>Impossible de charger les événements pour le moment.</p>';
            }
        }

        // If a home container exists, render the 3 latest events there (homepage)
        const homeContainer = document.getElementById('home-latest-events');
        if (homeContainer) {
            (async () => {
                try {
                    const res = await fetch('http://127.0.0.1:8000/api/evenements');
                    const json = await res.json().catch(() => null);
                    let eventsAll = [];
                    if (json && json.evenement) {
                        if (Array.isArray(json.evenement)) eventsAll = json.evenement;
                        else if (json.evenement.data && Array.isArray(json.evenement.data)) eventsAll = json.evenement.data;
                        else eventsAll = [json.evenement];
                    }
                    if (!eventsAll || eventsAll.length === 0) {
                        homeContainer.innerHTML = '<p>Aucun événement pour le moment.</p>';
                        return;
                    }
                    const latest = eventsAll.slice(0, 3);
                    homeContainer.innerHTML = latest.map(ev => {
                        const date = ev.date_evenement || ev.date || '';
                        const photo = resolvePhoto(ev.photo);
                        return `
                            <div style="background: #fff; border-radius: 1.5rem; box-shadow: 0 2px 8px rgba(0,0,0,0.07); width: 350px; overflow: hidden; display: flex; flex-direction: column;">
                                <div style="position: relative;">
                                    <img src="${photo}" alt="${escapeHtml(ev.nom || ev.title || '')}" style="width: 100%; height: 220px; object-fit: cover;">
                                </div>
                                <div style="padding: 1.5rem 1.2rem 1rem 1.2rem; flex: 1; display: flex; flex-direction: column;">
                                    <div style="display: flex; flex-direction: column; flex: 1; justify-content: space-between; min-height: 220px;">
                                        <div>
                                            <div style="display: flex; align-items: center; gap: 0.5rem; color: #27ae60; font-size: 1rem; margin-bottom: 0.5rem;">
                                                <span style="font-size: 1.2rem;">&#128197;</span>
                                                <span>${escapeHtml(date)}</span>
                                            </div>
                                            <h3 style="font-size: 1.3rem; font-weight: bold; margin: 0 0 0.5rem 0;">${escapeHtml(ev.nom || ev.title || '')}</h3>
                                            <p style="color: #333; font-size: 1rem; margin-bottom: 1.5rem;">${escapeHtml((ev.descriptions || ev.description || '').slice(0,140))}</p>
                                        </div>
                                        <a href="event-details.html?id=${encodeURIComponent(ev.id || ev.ID || ev._id || '')}" style="background: #219653; color: #fff; border-radius: 0.5rem; padding: 0.7rem 2rem; text-align: center; text-decoration: none; font-weight: 600; margin-top: auto;">Voir Détails</a>
                                    </div>
                                </div>
                            </div>
                        `;
                    }).join('');
                } catch (err) {
                    console.error('Error loading home events:', err);
                    homeContainer.innerHTML = '<p>Impossible de charger les événements.</p>';
                }
            })();
        }

        function escapeHtml(text) {
            if (!text) return '';
            return String(text)
                .replace(/&/g, '&amp;')
                .replace(/</g, '&lt;')
                .replace(/>/g, '&gt;')
                .replace(/"/g, '&quot;')
                .replace(/'/g, '&#39;');
        }

// Wire status buttons for events filtering (buttons exist in evenements.html)
(function wireEventStatusButtons(){
    const buttons = document.querySelectorAll('.status-btn');
    if (!buttons || buttons.length === 0) return;

    function applyActive(btn) {
        buttons.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
    }

    buttons.forEach(btn => {
        btn.addEventListener('click', () => {
            applyActive(btn);
            const status = btn.dataset.status;
            const all = window._eventsCache || [];
            let filtered = all;
            if (status === 'avenir') {
                filtered = all.filter(ev => !ev.enCours && !ev.estPasse);
            } else if (status === 'encours') {
                filtered = all.filter(ev => ev.enCours);
            } else if (status === 'passes') {
                filtered = all.filter(ev => ev.estPasse);
            }
            if (window.renderEvents) window.renderEvents(filtered);
        });
    });
})();



        // Auto-load events when on events page
        document.addEventListener('DOMContentLoaded', () => {
            loadPublicEvents();
        });

        // Auto-load actualites when on actualites page
        (function initActualites() {
            // load actualites only if container present
            const newsGrid = document.querySelector('.news-grid');
            if (!newsGrid) return;

            const tabs = document.querySelectorAll('.news-tab');
            const normalizeCat = (s) => String(s || '').toLowerCase().trim().replace(/s$/,'');

            async function loadPublicActualites(filter = 'all') {
                try {
                    // try to ask backend for filtered category first
                    let url = 'http://127.0.0.1:8000/api/actualites';
                    const norm = normalizeCat(filter);
                    if (filter && filter !== 'all') {
                        // backend may expect singular category (e.g., 'annonce')
                        url += '?categorie=' + encodeURIComponent(norm);
                    }

                    const res = await fetch(url, { cache: 'no-store' });
                    if (!res.ok) throw new Error('Failed to fetch actualites');
                    const json = await res.json().catch(() => null);
                    let list = [];

                    if (json && json.actualites) list = Array.isArray(json.actualites) ? json.actualites : (json.actualites.data || []);
                    if ((!list || list.length === 0) && Array.isArray(json)) list = json;
                    if ((!list || list.length === 0) && json && json.data && Array.isArray(json.data)) list = json.data;

                    // fallback: if backend returned full list and we requested a category, filter client-side
                    if (norm && norm !== 'all') {
                        list = (list || []).filter(item => normalizeCat(item.categorie) === norm);
                    }

                    if (!list || list.length === 0) {
                        newsGrid.innerHTML = '<p>Aucune actualité pour le moment.</p>';
                        return;
                    }

                    newsGrid.innerHTML = list.map(item => {
                        const photo = resolvePhoto(item.photo);
                        const categorie = item.categorie || '';
                        const title = item.nom || item.title || '';
                        const desc = (item.descriptions || item.descript || '').slice(0, 220);
                        const nid = encodeURIComponent(item.id || item.ID || item._id || '');
                        return `
                            <article class="news-card" data-category="${escapeHtml(categorie)}">
                                <div class="news-image news-image-badge">
                                    <span class="news-badge badge-green">${escapeHtml(categorie || 'Actualité')}</span>
                                    <img src="${photo}" alt="${escapeHtml(title)}">
                                </div>
                                <div class="news-content">
                                    <h3 style="display:flex; align-items:center; gap:8px; margin:0;">
                                        <img src="https://img.icons8.com/ios-glyphs/20/000000/news.png" alt="icon" style="width:18px; height:18px;"> 
                                        ${escapeHtml(title)}
                                    </h3>
                                    <p style="display:flex; align-items:flex-start; gap:8px; margin:0.6rem 0 1rem 0;">
                                        <img src="https://img.icons8.com/ios-glyphs/16/888888/document--v1.png" alt="icon-desc" style="width:14px; height:14px; margin-top:3px;">
                                        ${escapeHtml(desc)}
                                    </p>
                                    <a href="actualite-details.html?id=${nid}" class="news-btn">Lire l'Article</a>
                                </div>
                            </article>
                        `;
                    }).join('');
                } catch (err) {
                    console.error('Error loading actualites:', err);
                    newsGrid.innerHTML = '<p>Impossible de charger les actualités pour le moment.</p>';
                }
            }

            // wire tabs
            if (tabs && tabs.length) {
                tabs.forEach(tab => {
                    tab.addEventListener('click', (e) => {
                        tabs.forEach(t => t.classList.remove('active'));
                        tab.classList.add('active');
                        const filter = tab.dataset.filter || 'all';
                        loadPublicActualites(filter);
                    });
                });
            }

            // initial load (respect an active tab if present)
            const active = Array.from(tabs || []).find(t => t.classList.contains('active'));
            loadPublicActualites(active ? (active.dataset.filter || 'all') : 'all');
        })();

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

