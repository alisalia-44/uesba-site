// ===== ADMIN DASHBOARD JAVASCRIPT =====

// Data Storage (Local Storage)
const DataManager = {
    // Initialize data from localStorage or create default data
    init() {
        if (!localStorage.getItem('adminData')) {
            localStorage.setItem('adminData', JSON.stringify({
                activities: [],
                members: [],
                events: [],
                news: [],
                videos: [],
                messages: []
            }));
        }
    },

    // Get all data
    getData() {
        return JSON.parse(localStorage.getItem('adminData')) || {};
    },

    // Save data
    saveData(data) {
        localStorage.setItem('adminData', JSON.stringify(data));
    },

    // Add item
    addItem(category, item) {
        const data = this.getData();
        item.id = Date.now();
        data[category].push(item);
        this.saveData(data);
        return item;
    },

    // Update item
    updateItem(category, id, updatedItem) {
        const data = this.getData();
        const index = data[category].findIndex(item => item.id === id);
        if (index !== -1) {
            data[category][index] = { ...data[category][index], ...updatedItem, id };
            this.saveData(data);
        }
    },

    // Delete item
    deleteItem(category, id) {
        const data = this.getData();
        data[category] = data[category].filter(item => item.id !== id);
        this.saveData(data);
    },

    // Get items by category
    getItems(category) {
        const data = this.getData();
        return data[category] || [];
    }
};

// Current Editing State
let currentEditingId = null;
let currentEditingCategory = null;

// ===== DOM ELEMENTS =====
const sidebar = document.querySelector('.admin-sidebar');
const navButtons = document.querySelectorAll('.nav-btn');
const adminSections = document.querySelectorAll('.admin-section');
const pageTitle = document.getElementById('page-title');

// ===== INITIALIZATION =====
document.addEventListener('DOMContentLoaded', function() {
    DataManager.init();
    setupEventListeners();
    updateCurrentDate();
    loadAllData();
    setInterval(updateCurrentDate, 1000);
});

// ===== EVENT LISTENERS SETUP =====
function setupEventListeners() {
    // Navigation
    navButtons.forEach(btn => {
        btn.addEventListener('click', function() {
            switchSection(this.dataset.section);
        });
    });

    // Modal close on outside click
    document.querySelectorAll('.modal').forEach(modal => {
        modal.addEventListener('click', function(e) {
            if (e.target === this) {
                closeModal(this.id);
            }
        });
    });

    // Contact form for demo
    const contactForm = document.getElementById('contactForm');
    if (contactForm) {
        contactForm.addEventListener('submit', (e) => {
            e.preventDefault();
            saveMessage();
        });
    }
}

// ===== NAVIGATION & SECTIONS =====
function switchSection(sectionName) {
    // Update nav buttons
    navButtons.forEach(btn => btn.classList.remove('active'));
    document.querySelector(`[data-section="${sectionName}"]`).classList.add('active');

    // Update sections (show selected, hide others)
    adminSections.forEach(section => section.classList.remove('active'));
    const target = document.getElementById(`${sectionName}-section`);
    if (target) target.classList.add('active');

    // Update title
    const titles = {
        'dashboard': 'Tableau de bord',
        
        'members': 'Gestion des Membres du Bureau',
        'events': 'Gestion des Événements',
        'news': 'Gestion des Actualités',
        'videos': 'Gestion des Vidéos',
        'messages': 'Messages des Visiteurs'
    };
    if (pageTitle) pageTitle.textContent = titles[sectionName] || 'Tableau de bord';

    // Load section data
    if (sectionName === 'dashboard') loadDashboard();
    
    else if (sectionName === 'members') loadMembers();
    else if (sectionName === 'events') loadEvents();
    else if (sectionName === 'news') loadNews();
    else if (sectionName === 'videos') loadVideos();
}

// ===== DASHBOARD =====
function loadDashboard() {
    const data = DataManager.getData();
    
    document.getElementById('stat-members').textContent = data.members.length;
    document.getElementById('stat-events').textContent = data.events.length;
    document.getElementById('stat-news').textContent = data.news.length;
    document.getElementById('stat-messages').textContent = data.messages.length;
}

// ===== ACTIVITIES =====
function loadActivities() {
    const activities = DataManager.getItems('activities');
    const tbody = document.getElementById('activities-list');
    
    if (activities.length === 0) {
        tbody.innerHTML = '<tr class="empty-row"><td colspan="4">Aucune activité</td></tr>';
        return;
    }

    tbody.innerHTML = activities.map(activity => `
        <tr>
            <td><strong>${activity.title}</strong></td>
            <td>${truncateText(activity.description, 50)}</td>
            <td>${formatDate(activity.date)}</td>
            <td>
                <div class="table-actions">
                    <button class="btn-edit" onclick="openAddModal('activity', ${activity.id})">Modifier</button>
                    <button class="btn-danger" onclick="deleteActivity(${activity.id})">Supprimer</button>
                </div>
            </td>
        </tr>
    `).join('');
}

async function openAddModal(type, id = null) {
    console.log('openAddModal called', { type, id });
    currentEditingId = id;
    currentEditingCategory = type;

    const modals = {
        'activity': 'activityModal',
        'member': 'memberModal',
        'event': 'eventModal',
        'news': 'newsModal',
        'video': 'videoModal'
    };

    const modal = modals[type];
    const modalElement = document.getElementById(modal);

    // Clear form
    modalElement.querySelectorAll('input, textarea, select').forEach(field => {
        field.value = '';
    });

    // Update modal title
    if (id) {
        const titleElement = modalElement.querySelector('h2');
        const actionTexts = {
            
            'member': 'Modifier le membre',
            'event': 'Modifier l\'événement',
            'news': 'Modifier l\'actualité',
            'video': 'Modifier la vidéo'
        };
        titleElement.textContent = actionTexts[type];

        // Load existing data
        const data = DataManager.getData();
        const items = data[type + 's'] || data[type];
        const item = Array.isArray(items) ? items.find(i => i.id === id) : null;

            if (item) {
            // Populate form with item data
            if (type === 'activity') {
                document.getElementById('activityTitle').value = item.title;
                document.getElementById('activityDescription').value = item.description;
                document.getElementById('activityDate').value = item.date;
            } else if (type === 'member') {
                document.getElementById('memberName').value = item.name;
                if (document.getElementById('memberPrenom')) document.getElementById('memberPrenom').value = item.prenom || item.lastName || '';
                document.getElementById('memberPosition').value = item.position;
                document.getElementById('memberEmail').value = item.email || '';
                document.getElementById('memberPhone').value = item.phone || '';
                document.getElementById('memberImage').value = item.image || '';
            } else if (type === 'event') {
                // Try backend first (if available), otherwise fallback to local item
                let evt = null;
                try {
                    if (window.apiService && window.apiService.getEventDetail) {
                        const res = await window.apiService.getEventDetail(id);
                        console.log('openAddModal: backend event detail response', res);
                        if (res && res.success && res.data) {
                            evt = res.data.event || res.data.evenement || res.data || null;
                            // normalize collection shapes
                            if (evt && evt.data && Array.isArray(evt.data)) evt = evt.data[0];
                            if (Array.isArray(evt) && evt.length) evt = evt[0];
                        }
                    }
                } catch (err) {
                    console.warn('openAddModal: failed fetching backend event detail', err);
                }

                console.log('openAddModal: evt after backend/local lookup', evt);

                // If backend didn't return an event, try local storage (coerce id types when matching)
                if (!evt) {
                    const localItems = DataManager.getItems('events') || [];
                    const localMatch = localItems.find(i => String(i.id) === String(id));
                    if (localMatch) evt = localMatch;
                }

                // If we have event data, populate fields (handle different property names)
                if (evt) {
                    document.getElementById('eventTitle').value = evt.nom || evt.title || evt.name || '';
                    const rawDate = evt.date_evenement || evt.date || evt.date_event || '';
                    try {
                        const d = new Date(rawDate);
                        if (!isNaN(d)) document.getElementById('eventDate').value = d.toISOString().split('T')[0];
                        else document.getElementById('eventDate').value = rawDate || '';
                    } catch (e) {
                        document.getElementById('eventDate').value = rawDate || '';
                    }
                    document.getElementById('eventLocation').value = evt.lieu || evt.location || evt.lieu_event || '';
                    document.getElementById('eventDescription').value = evt.descriptions || evt.description || evt.content || '';
                    if (document.getElementById('eventType')) {
                        const t = (evt.type || '').toString();
                        document.getElementById('eventType').value = t === 'En_ligne' || t.toLowerCase().includes('en_ligne') || t.toLowerCase().includes('en') ? 'En_ligne' : 'presentiel';
                    }
                    // For file input we can't set a value; show preview if we have a URL
                    const preview = document.getElementById('eventImagePreview');
                    const fileInput = document.getElementById('eventImage');
                    try { fileInput.value = ''; } catch (e) {}
                    if (evt.photo || evt.image) {
                        const url = evt.photo || evt.image;
                        preview.src = url;
                        preview.style.display = 'block';
                    } else {
                        preview.src = '';
                        preview.style.display = 'none';
                    }
                }
            } else if (type === 'news') {
                document.getElementById('newsTitle').value = item.title || item.nom || '';
                document.getElementById('newsContent').value = item.content || item.descriptions || item.descript || '';
                // try several date fields
                const rawNewsDate = item.date || item.created_at || item.created || '';
                try {
                    const nd = new Date(rawNewsDate);
                    if (!isNaN(nd)) document.getElementById('newsDate').value = nd.toISOString().split('T')[0];
                    else document.getElementById('newsDate').value = rawNewsDate || '';
                } catch (e) {
                    document.getElementById('newsDate').value = rawNewsDate || '';
                }
                const newsFileInput = document.getElementById('newsImage');
                try { if (newsFileInput) newsFileInput.value = ''; } catch (e) {}
                const newsPreview = document.getElementById('newsImagePreview');
                const imageUrl = item.image || item.photo || '';
                if (newsPreview) {
                    if (imageUrl) {
                        newsPreview.src = imageUrl;
                        newsPreview.style.display = 'block';
                    } else {
                        newsPreview.src = '';
                        newsPreview.style.display = 'none';
                    }
                }
                // Populate category (handle different backend property names)
                let cat = item.categorie || item.category || item.categorie_nom || item.nom_categorie || '';
                cat = (cat || '').toString().toLowerCase();
                if (document.getElementById('newsCategory')) document.getElementById('newsCategory').value = cat;
                // update preview on file select
                if (newsFileInput && newsPreview) {
                    newsFileInput.addEventListener('change', (ev) => {
                        const f = ev.target.files && ev.target.files[0] ? ev.target.files[0] : null;
                        if (f) {
                            newsPreview.src = URL.createObjectURL(f);
                            newsPreview.style.display = 'block';
                        } else {
                            newsPreview.src = '';
                            newsPreview.style.display = 'none';
                        }
                    });
                }
            } else if (type === 'video') {
                document.getElementById('videoTitle').value = item.title;
                document.getElementById('videoUrl').value = item.url;
                document.getElementById('videoPage').value = item.page;
            }
        }
    } else {
        const titleElement = modalElement.querySelector('h2');
        const actionTexts = {
           
            'member': 'Ajouter un Membre',
            'event': 'Ajouter un Événement',
            'news': 'Ajouter une Actualité',
            'video': 'Ajouter une Vidéo'
        };
        titleElement.textContent = actionTexts[type];
    }

    openModal(modal);
}



// ===== MEMBERS =====
async function loadMembers() {
    const tbody = document.getElementById('members-list');
    const token = localStorage.getItem('auth_token');

    // If admin logged in, try fetching members from backend
    if (token && window.apiService) {
        try {
            // try common endpoint names until one succeeds
            const tryPaths = ['/membres', '/membre', '/members'];
            let res = null;
            for (const p of tryPaths) {
                res = await window.apiService._request(p);
                if (res && res.success && res.data) break;
            }
            if (res && res.success && res.data) {
                // backend may return different shapes
                let items = [];
                if (Array.isArray(res.data)) items = res.data;
                else if (res.data.membres) items = Array.isArray(res.data.membres) ? res.data.membres : (res.data.membres.data || []);
                else if (res.data.membre) items = Array.isArray(res.data.membre) ? res.data.membre : (res.data.membre.data || []);
                else if (res.data.data && Array.isArray(res.data.data)) items = res.data.data;

                if (!items || items.length === 0) {
                    tbody.innerHTML = '<tr class="empty-row"><td colspan="5">Aucun membre</td></tr>';
                    return;
                }

                // cache for client-side checks
                window.__members = items;

                tbody.innerHTML = items.map(member => `
                    <tr>
                        <td><strong>${escapeHtml(member.nom || member.name || '')}</strong></td>
                        <td>${escapeHtml(member.poste || member.position || '')}</td>
                        <td>${escapeHtml(member.email || '-')}</td>
                        <td>${escapeHtml(member.telephone || member.phone || '-')}</td>
                        <td>
                            <div class="table-actions">
                                <button class="btn-edit" onclick="openAddModal('member', '${member.id || member.ID || ''}')">Modifier</button>
                                <button class="btn-danger" onclick="deleteMember('${member.id || member.ID || ''}')">Supprimer</button>
                            </div>
                        </td>
                    </tr>
                `).join('');
                return;
            }
        } catch (err) {
            console.warn('loadMembers: backend fetch failed, falling back to local', err);
        }
    }

    // Fallback: local storage
    const members = DataManager.getItems('members');
    if (!members || members.length === 0) {
        tbody.innerHTML = '<tr class="empty-row"><td colspan="5">Aucun membre</td></tr>';
        return;
    }

    tbody.innerHTML = members.map(member => `
        <tr>
            <td><strong>${escapeHtml(member.name)}</strong></td>
            <td>${escapeHtml(member.position)}</td>
            <td>${escapeHtml(member.email || '-')}</td>
            <td>${escapeHtml(member.phone || '-')}</td>
            <td>
                <div class="table-actions">
                    <button class="btn-edit" onclick="openAddModal('member', ${member.id})">Modifier</button>
                    <button class="btn-danger" onclick="deleteMember(${member.id})">Supprimer</button>
                </div>
            </td>
        </tr>
    `).join('');
}

function saveMember(e) {
    e.preventDefault();
    
    const member = {
        name: document.getElementById('memberName').value,
        prenom: document.getElementById('memberPrenom') ? document.getElementById('memberPrenom').value : '',
        position: document.getElementById('memberPosition').value,
        email: document.getElementById('memberEmail').value,
        phone: document.getElementById('memberPhone').value,
        image: document.getElementById('memberImage').value
    };

    const token = localStorage.getItem('auth_token');
    if (token && window.apiService) {
        // map fields to common backend names
        const payload = {
            nom: member.name,
            prenom: member.prenom,
            poste: member.position,
            email: member.email,
            telephone: member.phone,
            photo: member.image
        };
        if (currentEditingId) payload.id = currentEditingId;

        (async () => {
            try {
                let res;
                // Ensure we have a members cache; if not, try to fetch from server before creating to avoid 500 on duplicate email
                try {
                    if ((!window.__members || !Array.isArray(window.__members) || window.__members.length === 0) && window.apiService) {
                        const tryPaths = ['/membres','/membre','/users','/members'];
                        for (const p of tryPaths) {
                            const r = await window.apiService._request(p);
                            if (r && r.success && r.data) {
                                let items = [];
                                if (Array.isArray(r.data)) items = r.data;
                                else if (Array.isArray(r.data.membres)) items = r.data.membres;
                                else if (Array.isArray(r.data.users)) items = r.data.users;
                                else if (Array.isArray(r.data.data)) items = r.data.data;
                                if (items && items.length) { window.__members = items; break; }
                            }
                        }
                    }

                    const cache = window.__members || [];
                    if (payload.email) {
                        const dup = cache.find(m => String(m.email || '').toLowerCase() === String(payload.email).toLowerCase());
                        if (dup && !currentEditingId) {
                            alert('Un membre avec cet email existe déjà. Veuillez utiliser un autre email ou modifier le membre existant.');
                            return;
                        }
                        if (dup && currentEditingId && String(dup.id) !== String(currentEditingId)) {
                            alert('Cet email appartient à un autre membre. Utilisez un email différent.');
                            return;
                        }
                    }
                } catch (e) { console.warn('member duplicate check failed', e); }
                // basic validation
                if (!payload.nom || !payload.prenom) {
                    alert('Le nom et le prénom sont requis.');
                    return;
                }

                if (currentEditingId) res = await window.apiService.updateMembre(payload);
                else res = await window.apiService.createMembre(payload);
                if (!res.success) throw res.error || 'Erreur API';
                closeModal('memberModal');
                await loadMembers();
                loadDashboard();
                alert('Membre enregistré.');
                return;
            } catch (err) {
                console.error('Failed to save member via API', err);
                // try to detect SQL unique/email constraint
                try {
                    const raw = err && err.raw ? err.raw : null;
                    const msg = (raw && raw.message) ? raw.message : (err && err.message) ? err.message : null;
                    if (msg && /Integrity constraint violation|UNIQUE|Duplicate entry|23000/i.test(String(msg))) {
                        alert('Erreur: email déjà utilisé ou contrainte d\'unicité violée. Vérifiez l\'adresse email.');
                        return;
                    }
                } catch (e) { /* ignore */ }
                alert('Erreur lors de l\'enregistrement du membre. Voir console pour plus de détails.');
            }
        })();
        return;
    }

    // Fallback: local storage
    if (currentEditingId) {
        DataManager.updateItem('members', currentEditingId, member);
    } else {
        DataManager.addItem('members', member);
    }

    closeModal('memberModal');
    loadMembers();
    loadDashboard();
}

function deleteMember(id) {
    if (!confirm('Êtes-vous sûr de vouloir supprimer ce membre ?')) return;
    const token = localStorage.getItem('auth_token');
    if (token && window.apiService) {
        (async () => {
            try {
                const res = await window.apiService.deleteMembre({ id });
                if (!res.success) throw res.error || 'Erreur API';
                await loadMembers();
                loadDashboard();
                alert('Membre supprimé.');
            } catch (err) {
                console.error('Failed to delete member via API', err);
                alert('Erreur lors de la suppression du membre. Voir console pour détails.');
            }
        })();
        return;
    }

    // Fallback: local
    DataManager.deleteItem('members', id);
    loadMembers();
    loadDashboard();
}

// ===== EVENTS =====
function loadEvents() {
    const tbody = document.getElementById('events-list');
    const token = localStorage.getItem('auth_token');

    // If admin logged in, fetch events from backend
    if (token) {
        if (window.apiService) {
            window.apiService.getEvents().then(res => {
                if (!res.success) {
                    // fallback to local data
                    renderEventsFromList(DataManager.getItems('events'));
                    return;
                }
                const items = (res.data && res.data.evenement && res.data.evenement.data) ? res.data.evenement.data : (res.data && res.data.evenement) ? res.data.evenement : (res.data || []);
                if (!items.length) {
                    tbody.innerHTML = '<tr class="empty-row"><td colspan="6">Aucun événement</td></tr>';
                    return;
                }
                tbody.innerHTML = items.map(event => {
                    const title = event.nom || event.title || '';
                    const date = event.date_evenement || event.date || '';
                    const location = event.lieu || event.location || '';
                    const description = event.descriptions || event.description || event.content || '';
                    const id = event.id || event.ID || '';
                    return `
                        <tr>
                            <td><strong>${escapeHtml(title)}</strong></td>
                            <td>${formatDate(date)}</td>
                            <td>${escapeHtml(location)}</td>
                            <td>${truncateText(escapeHtml(description), 40)}</td>
                            <td>
                                <div class="table-actions">
                                    <button class="btn-edit" onclick="editEventDetails(${id})" style="background: #28a745; color: white; border-color: #28a745;">Détails</button>
                                </div>
                            </td>
                            <td>
                                <div class="table-actions">
                                    <button class="btn-edit" onclick="openAddModal('event', ${id})">Modifier</button>
                                    <button class="btn-danger" onclick="deleteEvent(${id})">Supprimer</button>
                                </div>
                            </td>
                        </tr>
                    `;
                }).join('');
            }).catch(() => {
                renderEventsFromList(DataManager.getItems('events'));
            });
            return;
        }

        // direct fetch fallback if apiService not available
        fetch('http://127.0.0.1:8000/api/evenements', { headers: { 'Authorization': 'Bearer ' + token } })
            .then(r => r.json())
            .then(json => {
                const items = (json && json.evenement && json.evenement.data) ? json.evenement.data : (json && json.evenement) ? json.evenement : (json || []);
                if (!items.length) {
                    tbody.innerHTML = '<tr class="empty-row"><td colspan="6">Aucun événement</td></tr>';
                    return;
                }
                tbody.innerHTML = items.map(event => {
                    const title = event.nom || event.title || '';
                    const date = event.date_evenement || event.date || '';
                    const location = event.lieu || event.location || '';
                    const description = event.descriptions || event.description || '';
                    const id = event.id || '';
                    return `
                        <tr>
                            <td><strong>${escapeHtml(title)}</strong></td>
                            <td>${formatDate(date)}</td>
                            <td>${escapeHtml(location)}</td>
                            <td>${truncateText(escapeHtml(description), 40)}</td>
                            <td>
                                <div class="table-actions">
                                    <button class="btn-edit" onclick="editEventDetails(${id})" style="background: #28a745; color: white; border-color: #28a745;">Détails</button>
                                </div>
                            </td>
                            <td>
                                <div class="table-actions">
                                    <button class="btn-edit" onclick="openAddModal('event', ${id})">Modifier</button>
                                    <button class="btn-danger" onclick="deleteEvent(${id})">Supprimer</button>
                                </div>
                            </td>
                        </tr>
                    `;
                }).join('');
            }).catch(() => renderEventsFromList(DataManager.getItems('events')));
        return;
    }

    // Fallback: render from local DataManager
    renderEventsFromList(DataManager.getItems('events'));
}

function renderEventsFromList(events) {
    const tbody = document.getElementById('events-list');
    if (!events || events.length === 0) {
        tbody.innerHTML = '<tr class="empty-row"><td colspan="6">Aucun événement</td></tr>';
        return;
    }
    tbody.innerHTML = events.map(event => `
        <tr>
            <td><strong>${escapeHtml(event.title || event.nom || '')}</strong></td>
            <td>${formatDate(event.date || event.date_evenement || '')}</td>
            <td>${escapeHtml(event.location || event.lieu || '')}</td>
            <td>${truncateText(escapeHtml(event.description || event.descriptions || ''), 40)}</td>
            <td>
                <div class="table-actions">
                    <button class="btn-edit" onclick="editEventDetails(${event.id})" style="background: #28a745; color: white; border-color: #28a745;">Détails</button>
                </div>
            </td>
            <td>
                <div class="table-actions">
                    <button class="btn-edit" onclick="openAddModal('event', ${event.id})">Modifier</button>
                    <button class="btn-danger" onclick="deleteEvent(${event.id})">Supprimer</button>
                </div>
            </td>
        </tr>
    `).join('');
}

async function saveEvent(e) {
    e.preventDefault();
    const token = localStorage.getItem('auth_token');

    const title = document.getElementById('eventTitle').value;
    const date = document.getElementById('eventDate').value;
    const location = document.getElementById('eventLocation').value;
    const description = document.getElementById('eventDescription').value;
    const type = document.getElementById('eventType') ? document.getElementById('eventType').value : 'presentiel';
    const imageInput = document.getElementById('eventImage');
    const file = imageInput && imageInput.files && imageInput.files[0] ? imageInput.files[0] : null;

    // Update preview when user selects a file
    const previewEl = document.getElementById('eventImagePreview');
    if (imageInput) {
        imageInput.addEventListener('change', (ev) => {
            const f = ev.target.files && ev.target.files[0] ? ev.target.files[0] : null;
            if (f && previewEl) {
                previewEl.src = URL.createObjectURL(f);
                previewEl.style.display = 'block';
            } else if (previewEl) {
                previewEl.src = '';
                previewEl.style.display = 'none';
            }
        });
    }

    if (token && window.apiService) {
        const payload = {
            nom_event: title,
            description_event: description,
            date_event: date,
            type: type,
            lieu: location
        };
        if (file) payload.photo = file;
        if (currentEditingId) payload.id = currentEditingId;

        try {
            console.log('Saving event via apiService, payload keys:', Object.keys(payload), 'payloadSample:', { nom_event: payload.nom_event, date_event: payload.date_event, type: payload.type, lieu: payload.lieu });
            if (payload.photo) console.log('payload.photo is', payload.photo instanceof File ? 'File(' + payload.photo.name + ')' : typeof payload.photo);
            let res;
            if (currentEditingId) {
                res = await window.apiService.updateEvenement(payload);
            } else {
                res = await window.apiService.createEvenement(payload);
            }
            if (!res.success) throw res.error || 'Erreur API';
            closeModal('eventModal');
            await loadEvents();
            loadDashboard();
            alert('Événement enregistré.');
            return;
        } catch (err) {
            // Show detailed error to help debugging (validation errors, status, raw response)
            console.error('Failed to save event via API', err);
            const status = err && err.status ? err.status : 'unknown';
            const raw = err && err.raw ? err.raw : null;
            if (raw && (raw.errors || raw.input || raw.message)) {
                console.error('API response:', raw);
                const details = raw.message ? raw.message : JSON.stringify(raw.errors || raw);
                alert('Erreur API: ' + details + ' (status: ' + status + ')');
            } else if (err && err.message) {
                alert('Erreur API: ' + err.message + ' (status: ' + status + ')');
            } else {
                alert('Erreur lors de l\'enregistrement de l\'événement. Voir console pour détails.');
            }
            return;
        }
    }

    if (token && !window.apiService) {
        // use direct fetch to call backend endpoints
        const fd = new FormData();
        fd.append('nom_event', title);
        fd.append('description_event', description);
        fd.append('date_event', date);
        fd.append('type', type);
        fd.append('lieu', location);
        if (file) fd.append('photo', file);
        if (currentEditingId) fd.append('id', currentEditingId);

        try {
            // debug: log FormData entries
            for (const pair of fd.entries()) {
                console.log('FormData', pair[0], pair[1] instanceof File ? ('File(' + pair[1].name + ')') : pair[1]);
            }
            let url = 'http://127.0.0.1:8000/api/create-evenement';
            let method = 'POST';
            if (currentEditingId) {
                // Use POST with method override for multipart PUT compatibility
                fd.append('_method', 'PUT');
                url = 'http://127.0.0.1:8000/api/update-evenement';
                method = 'POST';
            }
            const resp = await fetch(url, { method, headers: { 'Authorization': 'Bearer ' + token }, body: fd });
            // Try to parse JSON, otherwise fall back to raw text for better debugging
            let json = null;
            let text = null;
            try {
                json = await resp.json();
            } catch (e) {
                try { text = await resp.text(); } catch (e2) { text = null; }
            }
            if (!resp.ok) {
                console.error('create-evenement failed', { status: resp.status, body: json, text });
                const message = (json && (json.message || json.error)) ? (json.message || json.error) : (text ? text : ('status ' + resp.status));
                alert('Erreur API: ' + message);
                return;
            }
            console.log('create-evenement response', json || text);
            closeModal('eventModal');
            await loadEvents();
            loadDashboard();
            alert('Événement enregistré.');
            return;
        } catch (err) {
            console.error('Failed to save event via fetch', err);
            alert('Erreur lors de l\'enregistrement de l\'événement.');
            return;
        }
    }

    // Fallback: local storage
    const event = { title, date, location, description, image: file ? file.name : '' };
    if (currentEditingId) {
        DataManager.updateItem('events', currentEditingId, event);
    } else {
        DataManager.addItem('events', event);
    }

    closeModal('eventModal');
    loadEvents();
    loadDashboard();
}

async function deleteEvent(id) {
    if (!confirm('Êtes-vous sûr de vouloir supprimer cet événement ?')) return;
    const token = localStorage.getItem('auth_token');
    if (token && window.apiService) {
        try {
            const res = await window.apiService.deleteEvenement({ id });
            if (!res.success) throw res.error || 'Erreur API';
            await loadEvents();
            loadDashboard();
            alert('Événement supprimé.');
            return;
        } catch (err) {
            console.error('Failed to delete event via API', err);
            const raw = err && err.raw ? err.raw : null;
            if (raw && (raw.message || raw.errors)) {
                console.error('API response:', raw);
                alert('Erreur API: ' + (raw.message || JSON.stringify(raw.errors)));
            } else if (err && err.message) {
                alert('Erreur API: ' + err.message);
            } else {
                alert('Erreur lors de la suppression de l\'événement. Voir console pour détails.');
            }
            return;
        }
    }

    if (token && !window.apiService) {
        try {
            const resp = await fetch('http://127.0.0.1:8000/api/delete-evenement', {
                method: 'DELETE',
                headers: { 'Authorization': 'Bearer ' + token, 'Content-Type': 'application/json' },
                body: JSON.stringify({ id })
            });
            let json = null;
            try {
                json = await resp.json();
            } catch (parseErr) {
                // Response was not JSON (likely an HTML error page). Capture text for debugging.
                const text = await resp.text().catch(() => null);
                console.error('Non-JSON response from delete-evenement:', text);
                json = { message: text || 'Non-JSON response', __raw: text };
            }
            if (!resp.ok) throw json;
            await loadEvents();
            loadDashboard();
            alert('Événement supprimé.');
            return;
        } catch (err) {
            console.error('Failed to delete event via fetch', err);
            if (err && err.message) {
                alert('Erreur API: ' + err.message);
            } else if (err && err.__raw) {
                alert('Erreur API (html): voir console pour la réponse complète.');
            } else {
                alert('Erreur lors de la suppression de l\'événement. Voir console pour détails.');
            }
            return;
        }
    }

    // Fallback: local
    DataManager.deleteItem('events', id);
    loadEvents();
    loadDashboard();
}

// ===== NEWS =====
async function loadNews() {
    const tbody = document.getElementById('news-list');
    const token = localStorage.getItem('auth_token');

    if (token && window.apiService) {
        try {
            const res = await window.apiService.getActualites();
            if (res && res.success && res.data) {
                let items = [];
                if (Array.isArray(res.data)) items = res.data;
                else if (res.data.actualites) items = Array.isArray(res.data.actualites) ? res.data.actualites : (res.data.actualites.data || []);
                else if (res.data.actualite) items = Array.isArray(res.data.actualite) ? res.data.actualite : (res.data.actualite.data || []);
                else if (res.data.data && Array.isArray(res.data.data)) items = res.data.data;

                if (!items || items.length === 0) {
                    tbody.innerHTML = '<tr class="empty-row"><td colspan="5">Aucune actualité</td></tr>';
                    return;
                }

                tbody.innerHTML = items.map(item => `
                    <tr>
                        <td><strong>${escapeHtml(item.nom || item.title || '')}</strong></td>
                        <td>${truncateText(escapeHtml(item.descriptions || item.content || ''), 50)}</td>
                        <td>${item.created_at ? formatDate(item.created_at) : '-'}</td>
                        <td>
                            <div class="table-actions">
                                <button class="btn-edit" onclick="editNewsArticle('${item.id || item.ID || ''}')" style="background: #28a745; color: white; border-color: #28a745;">Article</button>
                            </div>
                        </td>
                        <td>
                            <div class="table-actions">
                                <button class="btn-edit" onclick="openAddModal('news', '${item.id || item.ID || ''}')">Modifier</button>
                                <button class="btn-danger" onclick="deleteNews('${item.id || item.ID || ''}')">Supprimer</button>
                            </div>
                        </td>
                    </tr>
                `).join('');
                return;
            }
        } catch (err) {
            console.warn('loadNews: backend fetch failed, falling back to local', err);
        }
    }

    // Fallback: local storage
    const news = DataManager.getItems('news');
    if (!news || news.length === 0) {
        tbody.innerHTML = '<tr class="empty-row"><td colspan="5">Aucune actualité</td></tr>';
        return;
    }

    tbody.innerHTML = news.map(item => `
        <tr>
            <td><strong>${escapeHtml(item.title)}</strong></td>
            <td>${truncateText(escapeHtml(item.content), 50)}</td>
            <td>${item.created_at ? formatDate(item.created_at) : '-'}</td>
            <td>
                <div class="table-actions">
                    <button class="btn-edit" onclick="editNewsArticle(${item.id})" style="background: #28a745; color: white; border-color: #28a745;">Article</button>
                </div>
            </td>
            <td>
                <div class="table-actions">
                    <button class="btn-edit" onclick="openAddModal('news', ${item.id})">Modifier</button>
                    <button class="btn-danger" onclick="deleteNews(${item.id})">Supprimer</button>
                </div>
            </td>
        </tr>
    `).join('');
}

function saveNews(e) {
    e.preventDefault();

    const token = localStorage.getItem('auth_token');

    const newsImageEl = document.getElementById('newsImage');
    const newsImageFile = newsImageEl && newsImageEl.files && newsImageEl.files[0] ? newsImageEl.files[0] : null;

    const payload = {
        nom: document.getElementById('newsTitle').value.trim(),
        descriptions: document.getElementById('newsContent').value.trim(),
        categorie: document.getElementById('newsCategory') ? document.getElementById('newsCategory').value : ''
    };
    if (newsImageFile) payload.photo = newsImageFile;
    if (currentEditingId) payload.id = currentEditingId;

    if (token && window.apiService) {
        (async () => {
            try {
                // Client-side validation: ensure categorie is present and valid
                const validCats = ['annonce', 'academique', 'social'];
                if (!payload.categorie || !validCats.includes(payload.categorie)) {
                    alert('Catégorie manquante ou invalide. Choisissez une catégorie valide.');
                    return;
                }

                // If frontend provided a photo URL as string, remove it; only File objects should be sent
                if (payload.photo && typeof payload.photo === 'string') delete payload.photo;

                console.log('saveNews payload before API call:', payload, 'photoIsFile:', newsImageFile ? true : false);

                let res;
                if (currentEditingId) {
                    res = await window.apiService.updateActualite(payload);
                } else {
                    res = await window.apiService.createActualite(payload);
                }

                if (!res.success) throw res.error;

                closeModal('newsModal');
                loadNews();
                loadDashboard();
                alert('Actualité enregistrée avec succès ✅');

            } catch (err) {
                console.error('Erreur API:', err);
                alert('Erreur lors de l\'enregistrement ❌');
            }
        })();

        return;
    }

    // If we have a token but no apiService, try direct fetch to backend endpoints
    if (token && !window.apiService) {
        (async () => {
            try {
                const categoryValue = document.getElementById('newsCategory') ? document.getElementById('newsCategory').value : '';

                // If a file is selected, send multipart FormData
                if (newsImageFile) {
                    const fd = new FormData();
                    fd.append('nom', payload.nom);
                    fd.append('descriptions', payload.descriptions);
                    fd.append('categorie', categoryValue);
                    fd.append('photo', newsImageFile);
                    if (currentEditingId) fd.append('id', currentEditingId);
                    let url = currentEditingId ? 'http://127.0.0.1:8000/api/update-actualite' : 'http://127.0.0.1:8000/api/create-actualite';
                    const resp = await fetch(url, { method: 'POST', headers: { 'Authorization': 'Bearer ' + token }, body: fd });
                    let json = null; try { json = await resp.json(); } catch (e) { json = null; }
                    if (!resp.ok) {
                        console.error('create/update actualite (multipart) failed', { status: resp.status, body: json });
                        const message = (json && (json.message || json.error)) ? (json.message || json.error) : ('status ' + resp.status);
                        alert('Erreur API: ' + message);
                        return;
                    }
                    closeModal('newsModal');
                    await loadNews();
                    loadDashboard();
                    alert('Actualité enregistrée.');
                    return;
                }

                // No file: send JSON as before
                const body = {
                    nom: payload.nom,
                    descriptions: payload.descriptions,
                    categorie: categoryValue
                };
                let url = 'http://127.0.0.1:8000/api/create-actualite';
                let method = 'POST';
                if (currentEditingId) {
                    url = 'http://127.0.0.1:8000/api/update-actualite';
                    method = 'POST';
                    body.id = currentEditingId;
                    body._method = 'PUT';
                }
                const resp = await fetch(url, {
                    method,
                    headers: { 'Content-Type': 'application/json', 'Authorization': 'Bearer ' + token },
                    body: JSON.stringify(body)
                });
                let json = null; try { json = await resp.json(); } catch (e) { json = null; }
                if (!resp.ok) {
                    console.error('create/update actualite failed', { status: resp.status, body: json });
                    const message = (json && (json.message || json.error)) ? (json.message || json.error) : ('status ' + resp.status);
                    alert('Erreur API: ' + message);
                    return;
                }
                closeModal('newsModal');
                await loadNews();
                loadDashboard();
                alert('Actualité enregistrée.');
                return;
            } catch (err) {
                console.error('Failed to save actualite via fetch', err);
                alert('Erreur lors de l\'enregistrement de l\'actualité. Voir console.');
            }
        })();

        return;
    }

    // Fallback: local storage
    // Ensure local copy includes category for local fallback
    payload.category = document.getElementById('newsCategory') ? document.getElementById('newsCategory').value : '';
    if (currentEditingId) {
        DataManager.updateItem('news', currentEditingId, payload);
    } else {
        DataManager.addItem('news', payload);
    }

    closeModal('newsModal');
    loadNews();
    loadDashboard();

}

function deleteNews(id) {
    if (!confirm('Êtes-vous sûr de vouloir supprimer cette actualité ?')) return;

    const token = localStorage.getItem('auth_token');

    if (token && window.apiService) {
        (async () => {
            try {
                const res = await window.apiService.deleteActualite({ id }); // ✅ correction ici

                if (!res.success) throw res.error || 'Erreur API';

                await loadNews();
                loadDashboard();

                alert('Actualité supprimée.');
            } catch (err) {
                console.error('Failed to delete actualite via API', err);
                alert('Erreur lors de la suppression de l\'actualité.');
            }
        })();

        // ⚠️ OPTIONNEL → tu peux le garder SI tu es dans une fonction
        return;
    }

    // fallback local
    DataManager.deleteItem('news', id);
    loadNews();
    loadDashboard();
}

// ===== VIDEOS =====
function loadVideos() {
    const videos = DataManager.getItems('videos');
    const tbody = document.getElementById('videos-list');
    
    if (videos.length === 0) {
        tbody.innerHTML = '<tr class="empty-row"><td colspan="4">Aucune vidéo</td></tr>';
        return;
    }

    tbody.innerHTML = videos.map(video => `
        <tr>
            <td><strong>${video.title}</strong></td>
            <td><a href="${video.url}" target="_blank" style="color: var(--primary-color);">Voir vidéo</a></td>
            <td>${capitalizeFirst(video.page)}</td>
            <td>
                <div class="table-actions">
                    <button class="btn-edit" onclick="openAddModal('video', ${video.id})">Modifier</button>
                    <button class="btn-danger" onclick="deleteVideo(${video.id})">Supprimer</button>
                </div>
            </td>
        </tr>
    `).join('');
}

function saveVideo(e) {
    e.preventDefault();
    
    const video = {
        title: document.getElementById('videoTitle').value,
        url: document.getElementById('videoUrl').value,
        page: document.getElementById('videoPage').value
    };

    if (currentEditingId) {
        DataManager.updateItem('videos', currentEditingId, video);
    } else {
        DataManager.addItem('videos', video);
    }

    closeModal('videoModal');
    loadVideos();
    loadDashboard();
}

function deleteVideo(id) {
    if (confirm('Êtes-vous sûr de vouloir supprimer cette vidéo ?')) {
        DataManager.deleteItem('videos', id);
        loadVideos();
        loadDashboard();
    }
}

// ===== MESSAGES =====
function loadMessages() {
    const container = document.getElementById('messages-list');

    // If admin is logged in (auth_token), fetch from backend
    const token = localStorage.getItem('auth_token');
    if (token) {
        fetch('http://127.0.0.1:8000/api/messages', {
            headers: { 'Authorization': 'Bearer ' + token }
        }).then(r => r.json()).then(json => {
            const msgs = (json && json.data) ? json.data : [];
            if (!msgs.length) {
                container.innerHTML = '<div class="empty-state"><p>Aucun message</p></div>';
                document.getElementById('stat-messages').textContent = 0;
                return;
            }

            // Render cards with view + delete actions
            container.innerHTML = msgs.map((m) => `
                <div class="message-card" data-remote-id="${m.id}">
                    <div class="message-header">
                        <div>
                            <div class="message-sender">${m.nom_complet || ''}</div>
                            <div class="message-email">${m.email || ''}</div>
                        </div>
                        <div class="message-date">${formatDate(m.created_at || m.created)}</div>
                    </div>
                    <div class="message-subject">${m.subject || 'Pas de sujet'}</div>
                    <div class="message-body">${m.message || ''}</div>
                    <div style="margin-top:8px; display:flex; gap:8px;">
                        <button class="btn-edit" data-action="view" data-id="${m.id}">Afficher</button>
                        <button class="btn-danger" data-action="delete" data-id="${m.id}">Supprimer</button>
                    </div>
                </div>
            `).join('');

            // Save remote messages temporarily for viewMessageRemote
            window.__remoteMessages = msgs;
            // update dashboard message count
            try { document.getElementById('stat-messages').textContent = msgs.length; } catch (e) {}

            // Attach delegated handlers for view/delete
            container.querySelectorAll('button[data-action="view"]').forEach(btn => {
                btn.addEventListener('click', (ev) => {
                    ev.stopPropagation();
                    const id = btn.getAttribute('data-id');
                    const msgsList = window.__remoteMessages || [];
                    const idx = msgsList.findIndex(m => String(m.id) === String(id));
                    if (idx !== -1) viewMessageRemote(idx);
                });
            });
            container.querySelectorAll('button[data-action="delete"]').forEach(btn => {
                btn.addEventListener('click', (ev) => {
                    ev.stopPropagation();
                    const id = btn.getAttribute('data-id');
                    deleteMessageRemote(id);
                });
            });
        }).catch(err => {
            console.error('Failed to load messages from API', err);
            // fallback to local storage
            const messages = DataManager.getItems('messages');
            renderLocalMessages(messages, container);
        });
        return;
    }

    // Fallback: local storage messages (demo)
    const messages = DataManager.getItems('messages');
    renderLocalMessages(messages, container);
}

function renderLocalMessages(messages, container) {
    if (!messages || messages.length === 0) {
        container.innerHTML = '<div class="empty-state"><p>Aucun message</p></div>';
        try { document.getElementById('stat-messages').textContent = 0; } catch (e) {}
        return;
    }
    container.innerHTML = messages.map(message => `
        <div class="message-card" data-local-id="${message.id}">
            <div class="message-header">
                <div>
                    <div class="message-sender">${message.name}</div>
                    <div class="message-email">${message.email}</div>
                </div>
                <div class="message-date">${formatDate(message.date)}</div>
            </div>
            <div class="message-subject">${message.subject || 'Pas de sujet'}</div>
            <div class="message-body">${message.message}</div>
            <div style="margin-top:8px; display:flex; gap:8px;">
                <button class="btn-edit" data-action="view-local" data-id="${message.id}">Afficher</button>
                <button class="btn-danger" data-action="delete-local" data-id="${message.id}">Supprimer</button>
            </div>
        </div>
    `).join('');

    // Attach handlers
    container.querySelectorAll('button[data-action="view-local"]').forEach(btn => {
        btn.addEventListener('click', (ev) => {
            ev.stopPropagation();
            const id = btn.getAttribute('data-id');
            viewMessage(Number(id));
        });
    });
    container.querySelectorAll('button[data-action="delete-local"]').forEach(btn => {
        btn.addEventListener('click', (ev) => {
            ev.stopPropagation();
            const id = Number(btn.getAttribute('data-id'));
            if (!confirm('Confirmez-vous la suppression de ce message local ?')) return;
            DataManager.deleteItem('messages', id);
            renderLocalMessages(DataManager.getItems('messages'), container);
            try { document.getElementById('stat-messages').textContent = DataManager.getItems('messages').length; } catch (e) {}
        });
    });
}

// Open remote message by index in __remoteMessages
function viewMessageRemote(index) {
    const msgs = window.__remoteMessages || [];
    const m = msgs[index];
    if (!m) return;
    const detailDiv = document.getElementById('messageDetail');
    detailDiv.innerHTML = `
        <p><strong>De:</strong> ${m.nom_complet || ''}</p>
        <p><strong>Email:</strong> <a href="mailto:${m.email}">${m.email}</a></p>
        <p><strong>Date:</strong> ${formatDate(m.created_at || m.created)}</p>
        <p><strong>Message:</strong></p>
        <p style="white-space: pre-wrap; background: white; padding: 15px; border-radius: 6px; border: 1px solid var(--border-color);">${m.message || ''}</p>
    `;
    openModal('messageModal');
}

/**
 * Delete a remote message by id (API)
 */
async function deleteMessageRemote(id) {
    if (!confirm('Confirmez-vous la suppression de ce message ?')) return;
    const token = localStorage.getItem('auth_token');
    if (!token) {
        alert('Action non autorisée. Veuillez vous connecter.');
        return;
    }

    try {
        const resp = await fetch(`http://127.0.0.1:8000/api/messages/${encodeURIComponent(id)}`, {
            method: 'DELETE',
            headers: { 'Authorization': 'Bearer ' + token, 'Content-Type': 'application/json' }
        });
        const json = await resp.json().catch(() => null);
        if (!resp.ok) {
            console.error('Delete message failed', { status: resp.status, body: json });
            alert('Erreur lors de la suppression du message. Voir la console pour plus de détails.');
            return;
        }

        // Remove from DOM
        const el = document.querySelector(`[data-remote-id="${id}"]`);
        if (el && el.parentNode) el.parentNode.removeChild(el);

        // Update local cache and count
        if (window.__remoteMessages) {
            window.__remoteMessages = window.__remoteMessages.filter(m => String(m.id) !== String(id));
            try { document.getElementById('stat-messages').textContent = window.__remoteMessages.length; } catch (e) {}
        }

        alert('Message supprimé.');
    } catch (err) {
        console.error('Error deleting message:', err);
        alert('Erreur réseau lors de la suppression du message.');
    }
}

function viewMessage(id) {
    const messages = DataManager.getItems('messages');
    const message = messages.find(m => m.id === id);
    
    if (message) {
        const detailDiv = document.getElementById('messageDetail');
        detailDiv.innerHTML = `
            <p><strong>De:</strong> ${message.name}</p>
            <p><strong>Email:</strong> <a href="mailto:${message.email}">${message.email}</a></p>
            <p><strong>Téléphone:</strong> ${message.phone || 'Non fourni'}</p>
            <p><strong>Sujet:</strong> ${message.subject || 'Pas de sujet'}</p>
            <p><strong>Date:</strong> ${formatDate(message.date)}</p>
            <p><strong>Message:</strong></p>
            <p style="white-space: pre-wrap; background: white; padding: 15px; border-radius: 6px; border: 1px solid var(--border-color);">${message.message}</p>
        `;
        openModal('messageModal');
    }
}

function saveMessage() {
    const form = document.querySelector('.contact-form'); // Adjust selector as needed
    if (!form) return;

    const message = {
        name: form.querySelector('[name="name"]')?.value || '',
        email: form.querySelector('[name="email"]')?.value || '',
        phone: form.querySelector('[name="phone"]')?.value || '',
        subject: form.querySelector('[name="subject"]')?.value || '',
        message: form.querySelector('[name="message"]')?.value || '',
        date: new Date().toISOString().split('T')[0]
    };

    DataManager.addItem('messages', message);
    form.reset();
    alert('Message envoyé avec succès!');
    loadMessages();
    loadDashboard();
}

// ===== MODAL FUNCTIONS =====
function openModal(modalId) {
    const modal = document.getElementById(modalId);
    modal.classList.add('show');
    document.body.style.overflow = 'hidden';
}

function closeModal(modalId) {
    const modal = document.getElementById(modalId);
    modal.classList.remove('show');
    document.body.style.overflow = 'auto';
    currentEditingId = null;
    currentEditingCategory = null;
}

// ===== UTILITY FUNCTIONS =====
function formatDate(dateString) {
    const options = { year: 'numeric', month: 'long', day: 'numeric' };
    return new Date(dateString).toLocaleDateString('fr-FR', options);
}

function truncateText(text, length) {
    return text.length > length ? text.substring(0, length) + '...' : text;
}

function escapeHtml(text) {
    if (text === undefined || text === null) return '';
    return String(text).replace(/[&<>"']/g, function (s) {
        return ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":"&#39;"})[s];
    });
}

function capitalizeFirst(text) {
    return text.charAt(0).toUpperCase() + text.slice(1);
}

function updateCurrentDate() {
    const dateElement = document.getElementById('current-date');
    const options = { 
        weekday: 'long', 
        year: 'numeric', 
        month: 'long', 
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    };
    const now = new Date().toLocaleDateString('fr-FR', options);
    if (dateElement) dateElement.textContent = now;
}

function logout() {
    if (confirm('Êtes-vous sûr de vouloir vous déconnecter ?')) {
        localStorage.removeItem('auth_token');
        localStorage.removeItem('auth_user');
        window.location.href = 'login.html';
    }
}

// ===== EVENT & NEWS DETAILS =====
function editEventDetails(id) {
    const events = DataManager.getItems('events');
    const event = events.find(e => e.id === id);
    if (event) {
        localStorage.setItem('editEventId', id);
        window.open('event-details.html?id=' + id, '_blank');
    }
}

function editNewsArticle(id) {
    const news = DataManager.getItems('news');
    const item = news.find(n => n.id === id);
    if (item) {
        localStorage.setItem('editNewsId', id);
        window.open('actualite-details.html?id=' + id, '_blank');
    }
}

// ===== DATA LOADING =====
function loadAllData() {
    loadDashboard();
    loadMessages();
}

// Export functions for global access
window.openAddModal = openAddModal;
window.closeModal = closeModal;
window.saveActivity = saveActivity;
window.deleteActivity = deleteActivity;
window.saveMember = saveMember;
window.deleteMember = deleteMember;
window.saveEvent = saveEvent;
window.deleteEvent = deleteEvent;
window.saveNews = saveNews;
window.deleteNews = deleteNews;
window.viewMessage = viewMessage;
window.logout = logout;
window.switchSection = switchSection;
window.editEventDetails = editEventDetails;
window.editNewsArticle = editNewsArticle;