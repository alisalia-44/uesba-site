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

// Utility: convert File to data URL (Promise)
function fileToDataUrl(file) {
    return new Promise((resolve) => {
        if (!file) return resolve('');
        try {
            const reader = new FileReader();
            reader.onload = () => resolve(reader.result || '');
            reader.onerror = () => resolve('');
            reader.readAsDataURL(file);
        } catch (e) {
            resolve('');
        }
    });
}

// preview wiring for detail image input
const detailImageInput = document.getElementById('detailImage');
if (detailImageInput) {
    detailImageInput.addEventListener('change', (ev) => {
        const f = ev.target.files && ev.target.files[0] ? ev.target.files[0] : null;
        const preview = document.getElementById('detailImagePreview');
        if (!preview) return;
        if (!f) {
            preview.src = '';
            preview.style.display = 'none';
            return;
        }
        const reader = new FileReader();
        reader.onload = (e) => {
            preview.src = e.target.result;
            preview.style.display = 'block';
        };
        reader.readAsDataURL(f);
    });
}

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
        'activities': 'Gestion des Activités',
        'members': 'Gestion des Membres du Bureau',
        'events': 'Gestion des Événements',
        'news': 'Gestion des Actualités',
        'videos': 'Gestion des Vidéos',
        'messages': 'Messages des Visiteurs'
    };
    pageTitle.textContent = titles[sectionName] || 'Tableau de bord';

    // Load section data
    if (sectionName === 'dashboard') loadDashboard();
    else if (sectionName === 'activities') loadActivities();
    else if (sectionName === 'members') loadMembers();
    else if (sectionName === 'events') loadEvents();
    else if (sectionName === 'news') loadNews();
    else if (sectionName === 'videos') loadVideos();
}

// ===== DASHBOARD =====
function loadDashboard() {
    const data = DataManager.getData();
    const setStat = (id, value) => {
        const el = document.getElementById(id);
        if (el) el.textContent = value;
    };
    setStat('stat-activities', (data.activities || []).length);
    setStat('stat-members', (data.members || []).length);
    setStat('stat-events', (data.events || []).length);
    setStat('stat-news', (data.news || []).length);
    setStat('stat-messages', (data.messages || []).length);
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
            'activity': 'Modifier l\'activité',
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
                document.getElementById('newsTitle').value = item.title;
                document.getElementById('newsContent').value = item.content;
                document.getElementById('newsDate').value = item.date;
                document.getElementById('newsImage').value = item.image || '';
            } else if (type === 'video') {
                document.getElementById('videoTitle').value = item.title;
                document.getElementById('videoUrl').value = item.url;
                document.getElementById('videoPage').value = item.page;
            }
        }
    } else {
        const titleElement = modalElement.querySelector('h2');
        const actionTexts = {
            'activity': 'Ajouter une Activité',
            'member': 'Ajouter un Membre',
            'event': 'Ajouter un Événement',
            'news': 'Ajouter une Actualité',
            'video': 'Ajouter une Vidéo'
        };
        titleElement.textContent = actionTexts[type];
    }

    openModal(modal);
}

function saveActivity(e) {
    e.preventDefault();
    
    const activity = {
        title: document.getElementById('activityTitle').value,
        description: document.getElementById('activityDescription').value,
        date: document.getElementById('activityDate').value
    };

    if (currentEditingId) {
        DataManager.updateItem('activities', currentEditingId, activity);
    } else {
        DataManager.addItem('activities', activity);
    }

    closeModal('activityModal');
    loadActivities();
    loadDashboard();
}

function deleteActivity(id) {
    if (confirm('Êtes-vous sûr de vouloir supprimer cette activité ?')) {
        DataManager.deleteItem('activities', id);
        loadActivities();
        loadDashboard();
    }
}

// ===== MEMBERS =====
function loadMembers() {
    const members = DataManager.getItems('members');
    const tbody = document.getElementById('members-list');
    
    if (members.length === 0) {
        tbody.innerHTML = '<tr class="empty-row"><td colspan="5">Aucun membre</td></tr>';
        return;
    }

    tbody.innerHTML = members.map(member => `
        <tr>
            <td><strong>${member.name}</strong></td>
            <td>${member.position}</td>
            <td>${member.email || '-'}</td>
            <td>${member.phone || '-'}</td>
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
        position: document.getElementById('memberPosition').value,
        email: document.getElementById('memberEmail').value,
        phone: document.getElementById('memberPhone').value,
        image: document.getElementById('memberImage').value
    };

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
    if (confirm('Êtes-vous sûr de vouloir supprimer ce membre ?')) {
        DataManager.deleteItem('members', id);
        loadMembers();
        loadDashboard();
    }
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
                                    <button class="btn-edit" onclick="openEventDetailModal(${id})" style="background: #28a745; color: white; border-color: #28a745;">Détails</button>
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
                                    <button class="btn-edit" onclick="openEventDetailModal(${id})" style="background: #28a745; color: white; border-color: #28a745;">Détails</button>
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



// Open modal to edit event details (description + pdf)
async function openEventDetailModal(id) {
    const modal = document.getElementById('eventDetailModal');
    const form = document.getElementById('eventDetailForm');
    document.getElementById('detailEventId').value = id;
    // PDF handling removed

    // Try to get event from backend first, otherwise from local storage
    let evt = null;
    try {
        if (window.apiService && window.apiService.getEventDetail) {
            const res = await window.apiService.getEventDetail(id);
            if (res && res.success && res.data) evt = res.data.event || res.data || null;
        }
    } catch (e) {
        console.warn('openEventDetailModal: backend lookup failed', e);
    }
    if (!evt) {
        const local = DataManager.getItems('events') || [];
        evt = local.find(i => String(i.id) === String(id));
    }

    const dateEl = document.getElementById('detailDate');
    const locEl = document.getElementById('detailLocation');
    const descEl = document.getElementById('detailDescription');
    const detailImageInput = document.getElementById('detailImage');
    const detailImagePreview = document.getElementById('detailImagePreview');
    // populate date and location if available
    if (evt) {
        try { dateEl.value = evt.date_evenement || evt.date || evt.date_event || evt.date || ''; } catch(e) {}
        try { locEl.value = evt.lieu || evt.location || evt.lieu_event || ''; } catch(e) {}
        // populate detail image preview if available
        try {
            const imgVal = evt.detail_photo || evt.detailImage || evt.detail_image || evt.photo || '';
            if (imgVal && detailImagePreview) {
                detailImagePreview.src = imgVal;
                detailImagePreview.style.display = 'block';
            } else if (detailImagePreview) {
                detailImagePreview.src = '';
                detailImagePreview.style.display = 'none';
            }
        } catch (e) {}
    } else {
        try { dateEl.value = ''; locEl.value = ''; } catch(e) {}
    }

    // wire preview on file selection
    if (detailImageInput && detailImagePreview) {
        detailImageInput.addEventListener('change', (ev) => {
            const f = ev.target.files && ev.target.files[0] ? ev.target.files[0] : null;
            if (f) {
                detailImagePreview.src = URL.createObjectURL(f);
                detailImagePreview.style.display = 'block';
            } else {
                detailImagePreview.src = '';
                detailImagePreview.style.display = 'none';
            }
        });
    }

    descEl.value = (evt && (evt.detail_description || evt.details || evt.full_description)) ? (evt.detail_description || evt.details || evt.full_description) : (evt && (evt.description || evt.descriptions) ? (evt.description || evt.descriptions) : '');
    // PDF selection/upload removed: nothing to set here

    openModal('eventDetailModal');
}

// Save event details (description + selected or uploaded PDF)
async function saveEventDetails(e) {
    e.preventDefault();
    const id = document.getElementById('detailEventId').value;
    const description = document.getElementById('detailDescription').value;
    const detailDate = document.getElementById('detailDate') ? document.getElementById('detailDate').value : '';
    const detailLocation = document.getElementById('detailLocation') ? document.getElementById('detailLocation').value : '';
    // PDF fields removed — no file/select handling

    // If backend available, try to update event with details (best-effort)
    const token = localStorage.getItem('auth_token');
    if (token && window.apiService) {
        const payload = { id };
        if (description) payload.detail_description = description;
        // PDF removed from payload
        // include detail image file if provided
        const detailImageInput = document.getElementById('detailImage');
        const uploadedDetailImage = detailImageInput && detailImageInput.files && detailImageInput.files[0] ? detailImageInput.files[0] : null;
        if (uploadedDetailImage) payload.detail_photo = uploadedDetailImage;
        if (detailDate) payload.date_event = detailDate;
        if (detailLocation) payload.lieu = detailLocation;
        try {
            const res = await (window.apiService.updateEvenement ? window.apiService.updateEvenement(payload) : Promise.resolve({ success: false }));
            if (!res.success) throw res.error || 'API error';
            closeModal('eventDetailModal');
            await loadEvents();
            alert('Détails enregistrés (backend).');
            return;
        } catch (err) {
            console.warn('saveEventDetails: backend save failed, falling back to local', err);
        }
    }

    // Fallback: save into local storage DataManager.events
    const items = DataManager.getItems('events') || [];
    const idx = items.findIndex(i => String(i.id) === String(id));
    if (idx !== -1) {
        const item = items[idx];
        const updated = { ...item };
        if (description) updated.detail_description = description;
        // PDF removed from local update
        if (detailDate) updated.date = detailDate;
        if (detailLocation) updated.location = detailLocation;
        // handle detail image locally (convert to data URL if file provided)
        try {
            const detailImageInput = document.getElementById('detailImage');
            const uploadedDetailImage = detailImageInput && detailImageInput.files && detailImageInput.files[0] ? detailImageInput.files[0] : null;
            if (uploadedDetailImage) {
                const d = await fileToDataUrl(uploadedDetailImage);
                if (d) updated.detail_photo = d;
            }
        } catch (e) {}
        DataManager.updateItem('events', item.id, updated);
        closeModal('eventDetailModal');
        loadEvents();
        loadDashboard();
        alert('Détails enregistrés (local).');
        return;
    }

    // If event not found locally, create a lightweight local record so details are preserved.
    try {
        const data = DataManager.getData();
        data.events = data.events || [];
        // coerce id to number when possible
        const coercedId = (typeof id === 'string' && /^\d+$/.test(id)) ? Number(id) : id;
        const newItem = {
            id: coercedId,
            title: '',
            date: detailDate || '',
            location: detailLocation || '',
            description: '',
            detail_description: description || ''
        };
        // if detail image file provided, convert to data URL and save
        try {
            const detailImageInput = document.getElementById('detailImage');
            const uploadedDetailImage = detailImageInput && detailImageInput.files && detailImageInput.files[0] ? detailImageInput.files[0] : null;
            if (uploadedDetailImage) {
                const d = await fileToDataUrl(uploadedDetailImage);
                if (d) newItem.detail_photo = d;
            }
        } catch (e) {}
        // avoid duplicate id if exists unexpectedly
        if (!data.events.find(e => String(e.id) === String(coercedId))) {
            data.events.push(newItem);
            DataManager.saveData(data);
        } else {
            // if exists by coincidence, update it
            const existing = data.events.find(e => String(e.id) === String(coercedId));
            existing.detail_description = description || existing.detail_description || '';
            DataManager.saveData(data);
        }

        closeModal('eventDetailModal');
        loadEvents();
        loadDashboard();
        alert('Détails enregistrés localement.');
        return;
    } catch (err) {
        console.error('saveEventDetails fallback create failed', err);
        alert('Événement introuvable pour enregistrer les détails.');
    }
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
                    <button class="btn-edit" onclick="openEventDetailModal(${event.id})" style="background: #28a745; color: white; border-color: #28a745;">Détails</button>
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
    // Fallback: local storage. If an image file was selected, convert to data URL so it persists.
    const makeDataUrl = (f) => new Promise((resolve) => {
        if (!f) return resolve('');
        try {
            const reader = new FileReader();
            reader.onload = () => resolve(reader.result || '');
            reader.onerror = () => resolve(f.name || '');
            reader.readAsDataURL(f);
        } catch (e) {
            resolve(f.name || '');
        }
    });

    const photoData = file ? await makeDataUrl(file) : undefined;
    const event = { title, date, location, description };
    if (photoData !== undefined && photoData !== '') event.photo = photoData;
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
function loadNews() {
    const news = DataManager.getItems('news');
    const tbody = document.getElementById('news-list');
    
    if (news.length === 0) {
        tbody.innerHTML = '<tr class="empty-row"><td colspan="5">Aucune actualité</td></tr>';
        return;
    }

    tbody.innerHTML = news.map(item => `
        <tr>
            <td><strong>${item.title}</strong></td>
            <td>${truncateText(item.content, 50)}</td>
            <td>${formatDate(item.date)}</td>
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
    
    const news = {
        title: document.getElementById('newsTitle').value,
        content: document.getElementById('newsContent').value,
        date: document.getElementById('newsDate').value,
        image: document.getElementById('newsImage').value
    };

    if (currentEditingId) {
        DataManager.updateItem('news', currentEditingId, news);
    } else {
        DataManager.addItem('news', news);
    }

    closeModal('newsModal');
    loadNews();
    loadDashboard();
}

function deleteNews(id) {
    if (confirm('Êtes-vous sûr de vouloir supprimer cette actualité ?')) {
        DataManager.deleteItem('news', id);
        loadNews();
        loadDashboard();
    }
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
            // Render remote messages with action buttons (Voir, Supprimer)
            container.innerHTML = msgs.map((m, idx) => `
                <div class="message-card" data-remote-id="${m.id}">
                    <div class="message-header">
                        <div>
                            <div class="message-sender">${m.nom_complet || ''}</div>
                            <div class="message-email">${m.email || ''}</div>
                        </div>
                        <div style="display:flex; gap:8px; align-items:center;">
                            <div class="message-date">${formatDate(m.created_at || m.created)}</div>
                            <div>
                                <button class="btn-primary" onclick="viewMessageRemote(${idx}); event.stopPropagation();">Voir</button>
                                <button class="btn-danger" onclick="deleteRemoteMessage('${m.id}'); event.stopPropagation();">Supprimer</button>
                            </div>
                        </div>
                    </div>
                    <div class="message-subject">${m.subject || 'Pas de sujet'}</div>
                    <div class="message-body">${m.message || ''}</div>
                </div>
            `).join('');

            // Save remote messages temporarily for viewMessageRemote
            window.__remoteMessages = msgs;
            // update dashboard message count
            try { document.getElementById('stat-messages').textContent = msgs.length; } catch (e) {}
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
        <div class="message-card">
            <div class="message-header">
                <div>
                    <div class="message-sender">${message.name}</div>
                    <div class="message-email">${message.email}</div>
                </div>
                <div style="display:flex; gap:8px; align-items:center;">
                    <div class="message-date">${formatDate(message.date)}</div>
                    <div>
                        <button class="btn-primary" onclick="viewMessage(${message.id}); event.stopPropagation();">Voir</button>
                        <button class="btn-danger" onclick="deleteMessage(${message.id}); event.stopPropagation();">Supprimer</button>
                    </div>
                </div>
            </div>
            <div class="message-subject">${message.subject || 'Pas de sujet'}</div>
            <div class="message-body">${message.message}</div>
        </div>
    `).join('');
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

// Delete a local message by id
function deleteMessage(id) {
    if (!confirm('Supprimer ce message local ? Cette action est irréversible.')) return;
    DataManager.deleteItem('messages', id);
    loadMessages();
    loadDashboard();
}

// Attempt to delete a remote message via API (if available)
async function deleteRemoteMessage(remoteId) {
    if (!confirm('Supprimer ce message distant ? Cette action enverra une requête au serveur.')) return;
    const token = localStorage.getItem('auth_token');
    try {
        if (token && window.apiService && window.apiService.deleteMessage) {
            const res = await window.apiService.deleteMessage({ id: remoteId });
            if (!res.success) throw res.error || 'Erreur API';
            alert('Message supprimé côté serveur.');
            loadMessages();
            loadDashboard();
            return;
        }

        if (token) {
            const resp = await fetch('http://127.0.0.1:8000/api/delete-message', {
                method: 'DELETE',
                headers: { 'Authorization': 'Bearer ' + token, 'Content-Type': 'application/json' },
                body: JSON.stringify({ id: remoteId })
            });

            if (resp.ok) {
                alert('Message supprimé côté serveur.');
                loadMessages();
                loadDashboard();
                return;
            }

            // Friendly error handling: avoid showing raw HTML pages (404) to the user
            const status = resp.status;
            let bodyText = await resp.text().catch(() => null);
            // If 404, offer to remove the message from the UI as a fallback
            if (status === 404) {
                console.warn('deleteRemoteMessage: 404 response body:', bodyText);
                const removeLocal = confirm('Endpoint introuvable (404). Voulez-vous supprimer le message de l\'interface localement ? (ne supprime pas côté serveur)');
                if (removeLocal) {
                    // remove DOM nodes with data-remote-id
                    try {
                        document.querySelectorAll(`[data-remote-id="${remoteId}"]`).forEach(n => n.remove());
                    } catch (e) {}
                    // remove from cached remote messages
                    try {
                        if (window.__remoteMessages) window.__remoteMessages = window.__remoteMessages.filter(m => String(m.id) !== String(remoteId));
                        const count = (window.__remoteMessages || []).length;
                        document.getElementById('stat-messages').textContent = count;
                    } catch (e) {}
                    return;
                }
                throw new Error('Endpoint introuvable (404). Vérifiez l\'URL de l\'API.');
            }

            if (bodyText) {
                const looksLikeHtml = /<!DOCTYPE\s+html|<html/i.test(bodyText);
                if (looksLikeHtml) {
                    throw new Error('Erreur serveur: HTTP ' + status);
                }
                try {
                    const parsed = JSON.parse(bodyText);
                    const msg = parsed.message || parsed.error || JSON.stringify(parsed);
                    throw new Error('Erreur API: ' + (msg || ('HTTP ' + status)));
                } catch (e) {
                    const short = bodyText.replace(/<[^>]+>/g, '').trim().slice(0, 200);
                    throw new Error('Erreur serveur: ' + (short || ('HTTP ' + status)));
                }
            }

            throw new Error('Erreur réseau: HTTP ' + status);
        }

        alert('Impossible de supprimer le message distant : pas d\'authentification ou d\'API disponible.');
    } catch (err) {
        console.error('deleteRemoteMessage failed', err);
        alert('Erreur lors de la suppression distante : ' + (err && err.message ? err.message : err));
    }
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
    dateElement.textContent = now;
}

function logout() {
    if (confirm('Êtes-vous sûr de vouloir vous déconnecter ?')) {
        localStorage.removeItem('auth_token');
        localStorage.removeItem('auth_user');
        window.location.href = 'login.html';
    }
}

// ===== EVENT & NEWS DETAILS =====
function openEventDetailsPage(id) {
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
window.openEventDetailModal = openEventDetailModal;
window.openEventDetailsPage = openEventDetailsPage;
window.editNewsArticle = editNewsArticle;
window.saveEventDetails = saveEventDetails;
