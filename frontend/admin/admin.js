// Vérification de l'authentification
if (!localStorage.getItem('token')) {
    window.location.href = 'login.html';
}
const BASE_URL = 'http://127.0.0.1:8000/api';
const STORAGE_URL = 'http://127.0.0.1:8000/storage/';

// État global
let currentEditingId = null;
window.__members = [];
window.__messages = [];
let isLoadingDashboard = false;
let isLoadingMessages = false;

// Initialisation
document.addEventListener('DOMContentLoaded', function () {
    setupEventListeners();
    updateCurrentDate();
    loadDashboard();
    setInterval(updateCurrentDate, 1000);
});

// --- NAVIGATION & UI ---
function updateCurrentDate() {
    const now = new Date();
    const options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit' };
    const dateElement = document.getElementById('current-date');
    if (dateElement) dateElement.textContent = now.toLocaleDateString('fr-FR', options);
}

function setupEventListeners() {
    // Navigation latérale
    document.querySelectorAll('.nav-btn').forEach(btn => {
        btn.addEventListener('click', function () {
            switchSection(this.dataset.section);
        });
    });

    // Fermeture des modals au clic extérieur
    document.querySelectorAll('.modal').forEach(modal => {
        modal.addEventListener('click', function (e) {
            if (e.target === this) closeModal(this.id);
        });
    });

    // Prévisualisation de la photo (ID synchronisé avec le HTML)
    setupImagePreview('memberPhoto', 'photoPreview');
    setupImagePreview('eventImage', 'eventImagePreview');
    setupImagePreview('newsImage', 'newsImagePreview');

    // Video admin controls (Events page video)
    setupVideoAdminControls();

    // Gestionnaire de soumission du formulaire membre
    const memberForm = document.getElementById('memberForm');
    if (memberForm) {
        memberForm.addEventListener('submit', saveMember);
    }
}

function setupImagePreview(inputId, previewId) {
    const input = document.getElementById(inputId);
    const preview = document.getElementById(previewId);
    if (input && preview) {
        input.addEventListener('change', (e) => {
            const file = e.target.files[0];
            if (file) {
                preview.src = URL.createObjectURL(file);
                preview.style.display = 'block';
            } else {
                preview.src = '';
                preview.style.display = 'none';
            }
        });
    }
}

function switchSection(sectionName) {
    document.querySelectorAll('.nav-btn').forEach(btn => btn.classList.remove('active'));
    const activeBtn = document.querySelector(`[data-section="${sectionName}"]`);
    if (activeBtn) activeBtn.classList.add('active');

    document.querySelectorAll('.admin-section').forEach(section => section.classList.remove('active'));
    const targetSection = document.getElementById(`${sectionName}-section`);
    if (targetSection) targetSection.classList.add('active');

    const titles = {
        dashboard: 'Tableau de bord',
        members: 'Gestion des Membres Bureau',
        events: 'Gestion des Événements',
        news: 'Gestion des Actualités',
        messages: 'Messages'
    };

    const pageTitle = document.getElementById('page-title');
    if (pageTitle) pageTitle.textContent = titles[sectionName] || 'Administration';

    if (sectionName === 'dashboard') loadDashboard();
    if (sectionName === 'members') loadMembers();
    if (sectionName === 'events') loadEvents && loadEvents();
    if (sectionName === 'news') loadNews && loadNews();
    if (sectionName === 'messages') loadMessages();
}

// --- API HELPER ---
async function apiFetch(endpoint, options = {}) {
    const token = localStorage.getItem('token');
    const headers = new Headers(options.headers || {});
    headers.set('Accept', 'application/json');

    if (token) headers.set('Authorization', `Bearer ${token}`);
    
    // On ne met pas de Content-Type si c'est du FormData (le navigateur le fait automatiquement)
    if (!(options.body instanceof FormData) && !headers.has('Content-Type')) {
        headers.set('Content-Type', 'application/json');
    }

    const response = await fetch(`${BASE_URL}${endpoint}`, { ...options, headers });

    // try to parse JSON safely, keep raw text if parsing fails
    const text = await response.text().catch(() => '');
    let data;
    try {
        data = text ? JSON.parse(text) : null;
    } catch (e) {
        data = { __raw: text };
    }

    if (!response.ok) {
        // Token invalide ou expiré → rediriger vers login
        if (response.status === 401) {
            localStorage.removeItem('token');
            window.location.href = 'login.html';
            return;
        }

        const msg = data && data.errors ? Object.values(data.errors).flat().join('\n') : (data && (data.message || data.error) ? (data.message || data.error) : `Erreur ${response.status} ${response.statusText}`);
        const err = new Error(msg);
        err.status = response.status;
        err.raw = data;
        throw err;
    }
    return data;
}

// --- GESTION DES MEMBRES ---
async function loadMembers() {
    const list = document.getElementById('members-list') || document.getElementById('members');
    if (!list) return;

    try {
      const data = await apiFetch('/members');
      const members = Array.isArray(data[0]) ? data[0] : (Array.isArray(data) ? data : []);
        window.__members = members;

        if (!members.length) {
                    list.innerHTML = '<tr><td colspan="7">Aucun membre enregistré.</td></tr>';
            return;
        }

        list.innerHTML = members.map((m, idx) => {
            const photo = m.photo ? (String(m.photo).startsWith('http') ? m.photo : STORAGE_URL + m.photo) : '../img/default-user.png';
            const nom = m.nom || m.name || '';
            const prenom = m.prenom || '';
            const fullName = `${nom} ${prenom}`.trim() || (m.full_name || m.nom_complet || '—');
            const poste = m.poste ||'';
            const descriptions = m.descriptions || m.description || '';
            const email = m.email || m.mail || '';
            const annee = m.annePoste || m.anneePoste || '';
            const idVal = m.id || m.user_id || '';

            return `
            <tr>
                <td>${escapeHtml(String(idVal))}</td>
                <td><img src="${photo}" width="40" style="border-radius:50%"></td>
                <td>${escapeHtml(fullName)}</td>
                <td><span class="badge">${escapeHtml(poste || 'N/A')}</span></td>
                <td title="${escapeHtml(descriptions)}">${escapeHtml(descriptions.substring ? descriptions.substring(0, 100) : descriptions)}</td>
                <td>${escapeHtml(email || 'N/A')}</td>
                <td>${escapeHtml(annee || 'N/A')}</td>
                <td>
                    <button class="btn-edit" onclick="editMember(${idx})">Modifier</button>
                    <button class="btn-delete" onclick="deleteMember(${idVal})">Supprimer</button>
                </td>
            </tr>
        `;
        }).join('');
    } catch (e) {
        console.error('Erreur membres:', e);
        list.innerHTML = '<tr><td colspan="7">Erreur de chargement.</td></tr>';
    }
}

async function saveMember(e) {
    e.preventDefault();

    const id = (document.getElementById('memberId') && document.getElementById('memberId').value) ? document.getElementById('memberId').value.trim() : '';
    const nom = document.getElementById('memberName').value.trim();
    const prenom = document.getElementById('memberPrenom').value.trim();
    const poste = (document.getElementById('memberPoste') ? document.getElementById('memberPoste').value.trim() : (document.getElementById('memberPosition') ? document.getElementById('memberPosition').value.trim() : ''));
    const annePoste = document.getElementById('memberAnnePoste').value.trim();
    const descriptions = document.getElementById('memberDescriptions').value.trim();
    const email = document.getElementById('memberEmail').value.trim();
    const photoFile = document.getElementById('memberPhoto').files[0];

    // Vérification des champs requis
    if (!nom || !prenom || !email ) {
        alert("Veuillez renseigner au minimum Nom, Prénom,  et Email .");
        return;
    }

    // Vérifier duplicata d'email côté client (prévenir l'erreur SQL UNIQUE)
    try {
        // Si on a un token, recharger la liste depuis l'API pour être à jour
        if (localStorage.getItem('token')) {
            try {
                const mdata = await apiFetch('/members');
                const fresh = Array.isArray(mdata[0]) ? mdata[0] : (Array.isArray(mdata) ? mdata : []);
                window.__members = fresh;
            } catch (e) {
                console.warn('Impossible de rafraîchir la liste des membres avant validation', e);
            }
        }

        if (window.__members && Array.isArray(window.__members)) {
            const found = window.__members.find(m => m.email && String(m.email).trim().toLowerCase() === String(email).trim().toLowerCase());
            if (found) {
                // création -> email déjà utilisé
                if (!id) {
                    alert('Cet email est déjà utilisé par un autre membre.');
                    return;
                }
                // modification -> si email appartient à un autre id
                if (id && String(found.id) !== String(id)) {
                    alert('Cet email est déjà utilisé par un autre membre.');
                    return;
                }
            }
        }
    } catch (e) { console.warn('Client-side duplicate check failed', e); }

    try {
        // FormData obligatoire pour gérer les fichiers
        const formData = new FormData();
        formData.append('nom', nom);
        formData.append('prenom', prenom);
        // backend may expect English/alternate field names
        formData.append('name', nom);
        formData.append('poste', poste);
        formData.append('annePoste', annePoste);
        formData.append('anneePoste', annePoste);
        formData.append('descriptions', descriptions);
        formData.append('description', descriptions);
        formData.append('email', email);
        if (photoFile) {
            // append under the expected backend name
            formData.append('photo', photoFile);
            // also append under the input name as a fallback for some setups
            try { formData.append('memberPhoto', photoFile); } catch(e) { /* ignore */ }
        }

            // Debug: afficher les paires FormData envoyées
            try {
                console.log('Submitting create-membre FormData:');
                for (const p of formData.entries()) console.log(p[0], p[1]);
            } catch (e) { console.log('FormData log failed', e); }

            // Use apiFetch helper which applies auth header and handles FormData
            try {
                const result = await apiFetch('/create-membre', { method: 'POST', body: formData });
                const message = (result && result.message) ? result.message : 'Membre ajouté avec succès !';
                alert(message);
                closeModal('memberModal');
                document.getElementById('memberForm').reset();
                await loadMembers(); // recharge la liste des membres
                return;
            } catch (err) {
                console.error('saveMember error', err);
                // apiFetch throws Error with err.raw when response not ok
                if (err && err.raw) {
                    // If backend returned validation errors
                    const raw = err.raw;
                    if (raw.errors) {
                        const msgs = Object.values(raw.errors).flat().join('\n');
                        alert(msgs);
                        return;
                    }
                    // raw may be { __raw: '<html>...</html>' } or { message: '...' }
                    const plain = raw.__raw ? String(raw.__raw) : (raw.message || raw.error || JSON.stringify(raw));
                    if (plain.toLowerCase().includes('unique') || plain.includes('users.email') || plain.includes('UNIQUE constraint')) {
                        alert('Cet email est déjà utilisé. Choisissez un autre email.');
                        return;
                    }
                    alert(plain);
                    return;
                }
                alert(err.message || 'Erreur lors de la création du membre.');
                return;
            }

    } catch (error) {
        console.error('saveMember exception', error);
        alert("Erreur lors de la création du membre.");
    }
}

function editMember(index) {
    const m = window.__members[index];
    if (!m) return;

    document.getElementById('memberModalTitle').textContent = 'Modifier le Membre';
    document.getElementById('memberId').value = m.id || m.user_id || '';
    document.getElementById('memberName').value = m.nom || m.name || '';
    document.getElementById('memberPrenom').value = m.prenom || '';
    document.getElementById('memberEmail').value = m.email || m.mail || '';
    document.getElementById('memberPosition').value = m.poste || m.position || m.title || '';
    document.getElementById('memberAnnePoste').value = m.annePoste || m.anneePoste || '';
    document.getElementById('memberDescriptions').value = m.descriptions || m.description || '';

    const preview = document.getElementById('photoPreview');
    if (preview && m.photo) {
        preview.src = (String(m.photo).startsWith('http') ? m.photo : STORAGE_URL + m.photo);
        preview.style.display = 'block';
    }

    openModal('memberModal');
}

async function deleteMember(id) {
    if (!confirm('Supprimer ce membre ?')) return;

    const formData = new FormData();
    formData.append('id', id);
    formData.append('_method', 'DELETE');

    try {
        await apiFetch('/delete-membre', {
            method: 'POST',
            body: formData
        });
        loadMembers();
        loadDashboard();
    } catch (e) {
        alert(e.message);
    }
}
// --- GESTION DES MESSAGES ---
async function loadMessages() {
    if (isLoadingMessages) return;
    isLoadingMessages = true;
    const container = document.getElementById('messages-list');
    if (!container) {
        isLoadingMessages = false;
        return;
    }
    try {
        const data = await apiFetch('/messages');
        const messages = normalizeMessagesPayload(data);
        window.__messages = messages;
        if (!messages.length) {
            container.innerHTML = '<div class="empty-state">Aucun message reçu.</div>';
            return;
        }
        container.innerHTML = messages.map((msg, idx) => `
            <div class="message-card" style="border: 1px solid #ddd; padding: 15px; margin-bottom: 10px; border-radius: 8px; background:#fff;">
                <h4>${escapeHtml(msg.nom_complet || 'Visiteur')}</h4>
                <p>${escapeHtml(msg.message.substring(0, 100))}...</p>
                <button class="btn-secondary" onclick="viewMessageDetail(${idx})">Lire</button>
                <button class="btn-danger" style="background:#e74c3c; color:white; border:none; padding:5px; border-radius:4px;" onclick="deleteMessage(${msg.id})">Supprimer</button>
            </div>
        `).join('');
    } catch (e) {
        container.innerHTML = 'Erreur messages.';
    } finally {
        isLoadingMessages = false;
    }
}

function viewMessageDetail(idx) {
    const msg = window.__messages[idx];
    const detail = document.getElementById('messageDetail');
    if (msg && detail) {
        detail.innerHTML = `
            <p><strong>De:</strong> ${escapeHtml(msg.nom_complet)} (${escapeHtml(msg.email)})</p>
            <p><strong>Message:</strong><br>${escapeHtml(msg.message)}</p>
        `;
        openModal('messageModal');
    }
}

async function deleteMessage(id) {
    if (!confirm('Supprimer ce message ?')) return;
    try {
        await apiFetch(`/messages/${id}`, { method: 'DELETE' });
        loadMessages();
        loadDashboard();
    } catch (e) { alert(e.message); }
}

// --- DASHBOARD STATS ---
async function loadDashboard() {
    if (isLoadingDashboard) return;
    isLoadingDashboard = true;
    try {
        const data = await apiFetch('/dash');

        document.getElementById('stat-members').textContent = data.nb_membre || 0;
        document.getElementById('stat-events').textContent = data.nb_event || 0;
        document.getElementById('stat-news').textContent = data.nb_actu || 0;
        document.getElementById('stat-messages').textContent = data.nb_message || 0;

    } catch (e) { console.error('Erreur Dashboard:', e); }
    finally {
        isLoadingDashboard = false;
    }
}

// --- UTILS ---
function openModal(id) { document.getElementById(id).classList.add('show'); }

function closeModal(id) {
    const modal = document.getElementById(id);
    if (modal) {
        modal.classList.remove('show');
        const form = modal.querySelector('form');
        if (form) form.reset();
        const preview = modal.querySelector('img[id$="Preview"]');
        if (preview) preview.style.display = 'none';
    }
}

function openAddModal(type) {
    if (type === 'member') {
        document.getElementById('memberModalTitle').textContent = 'Ajouter un Membre';
        document.getElementById('memberId').value = '';
        openModal('memberModal');
        return;
    }
    if (type === 'event') {
        const modal = document.getElementById('eventModal');
        if (modal) {
            document.getElementById('eventModalTitle').textContent = 'Ajouter un Événement';
            const form = document.getElementById('eventForm'); if (form) form.reset();
            openModal('eventModal');
        }
        return;
    }
    if (type === 'news') {
        const modal = document.getElementById('newsModal');
        if (modal) {
            document.getElementById('newsModalTitle').textContent = 'Ajouter une Actualité';
            const form = document.getElementById('newsForm'); if (form) form.reset();
            const hid = document.getElementById('newsId'); if (hid) hid.value = '';
            openModal('newsModal');
        }
        return;
    }
}

// --- GESTION DES ACTUALITES ---
// --- GESTION DES EVENEMENTS ---
async function loadEvents() {
    const list = document.getElementById('events-list');
    if (!list) return;
    try {
        const res = await apiService.getEvents();
        if (!res.success) throw new Error(res.error && res.error.message ? res.error.message : 'Erreur API');
        const data = res.data || {};
        // backend returns { evenement: [...] } via EventRessource::collection
        const events = Array.isArray(data.evenement) ? data.evenement : (Array.isArray(data.data) ? data.data : []);
        window.__events = events;

        if (!events.length) {
            list.innerHTML = '<tr><td colspan="8">Aucun événement.</td></tr>';
            return;
        }

        list.innerHTML = events.map((ev, idx) => {
            const photo = ev.photo || '../img/default-event.png';
            const title = ev.nom || ev.nom_event || ev.titre || ev.title || '';
            const date = ev.date_evenement || ev.date_event || ev.date || ev.created_at || '';
            const lieu = ev.lieu || ev.location || '';
            const desc = ev.descriptions || ev.description || ev.description_event || '';
            const idVal = ev.id || ev.event_id || '';
            return `
                <tr>
                    <td>${escapeHtml(String(idVal))}</td>
                    <td><img src="${photo}" width="60" style="border-radius:6px; max-height:60px; object-fit:cover;" /></td>
                    <td>${escapeHtml(title)}</td>
                    <td>${escapeHtml(date)}</td>
                    <td>${escapeHtml(lieu)}</td>
                    <td>${escapeHtml(desc.substring ? desc.substring(0,120) : desc)}</td>
                    <td><button class="btn-secondary" onclick="viewEventDetails(${idx})">Détails</button></td>
                    <td>
                        <button class="btn-edit" onclick="editEvent(${idx})">Modifier</button>
                        <button class="btn-delete" onclick="deleteEvent(${idVal})">Supprimer</button>
                    </td>
                </tr>
            `;
        }).join('');

    } catch (e) {
        console.error('Erreur chargement evenements', e);
        list.innerHTML = '<tr><td colspan="6">Erreur de chargement.</td></tr>';
    }
}

async function saveEvent(e) {
    e.preventDefault();
    const id = (document.getElementById('eventId') && document.getElementById('eventId').value) ? document.getElementById('eventId').value.trim() : '';
    const titre = document.getElementById('eventTitle').value.trim();
    const date = document.getElementById('eventDate').value;
    const lieu = document.getElementById('eventLocation').value.trim();
    const type = document.getElementById('eventType').value;
    const description = document.getElementById('eventDescription').value.trim();
    const image = document.getElementById('eventImage').files[0];

    if (!titre || !date || !lieu) {
        alert('Veuillez renseigner Titre, Date et Lieu.');
        return;
    }

    try {
        // map frontend fields to backend expected names
        const payload = {
            nom_event: titre,
            description_event: description,
            date_event: date,
            type: type,
            lieu: lieu
        };
        if (image) payload.photo = image;
        if (id) payload.id = id;

        let res;
        if (id) res = await apiService.updateEvenement(payload);
        else res = await apiService.createEvenement(payload);

        if (!res.success) throw new Error(res.error && res.error.message ? res.error.message : 'Erreur API');

        alert(res.data && res.data.message ? res.data.message : (id ? 'Événement modifié' : 'Événement créé'));
        closeModal('eventModal');
        const form = document.getElementById('eventForm'); if (form) form.reset();
        loadEvents();
        loadDashboard();
    } catch (err) {
        console.error('saveEvent error', err);
        alert(err.message || 'Erreur lors de l\'enregistrement');
    }
}

function editEvent(index) {
    const ev = (window.__events && window.__events[index]) ? window.__events[index] : null;
    if (!ev) return;
    document.getElementById('eventModalTitle').textContent = 'Modifier un Événement';
    document.getElementById('eventId').value = ev.id || ev.event_id || '';
    document.getElementById('eventTitle').value = ev.nom || ev.nom_event || ev.titre || ev.title || '';
    document.getElementById('eventDate').value = ev.date_evenement || ev.date_event || ev.date || '';
    document.getElementById('eventLocation').value = ev.lieu || ev.location || '';
    document.getElementById('eventType').value = ev.type || ev.event_type || document.getElementById('eventType').value;
    document.getElementById('eventDescription').value = ev.descriptions || ev.description || ev.description_event || '';
    const preview = document.getElementById('eventImagePreview');
    if (preview && ev.photo) { preview.src = (String(ev.photo).startsWith('http') ? ev.photo : STORAGE_URL + ev.photo); preview.style.display = 'block'; }
    openModal('eventModal');
}

async function deleteEvent(id) {
    if (!confirm('Supprimer cet événement ?')) return;
    try {
        const res = await apiService.deleteEvenement({ id });
        if (!res.success) throw new Error(res.error && res.error.message ? res.error.message : 'Erreur API');
        loadEvents();
        loadDashboard();
    } catch (e) {
        console.error('deleteEvent', e);
        alert(e.message || 'Erreur suppression');
    }
}
async function loadNews() {
    const list = document.getElementById('news-list');
    if (!list) return;
    try {
        const res = await apiService.getActualites();
        if (!res.success) throw new Error(res.error && res.error.message ? res.error.message : 'Erreur API');
        const data = res.data || {};
        const actualites = Array.isArray(data.actualites) ? data.actualites : (Array.isArray(data.data) ? data.data : []);
        window.__actualites = actualites;

        if (!actualites.length) {
            list.innerHTML = '<tr><td colspan="7">Aucune actualité.</td></tr>';
            return;
        }

        list.innerHTML = actualites.map((a, idx) => {
            const idVal = a.id || a.actu_id || '';
            const nom = a.nom || a.title || '';
            const content = a.descriptions || a.description || '';
            const categorie = a.categorie || '';
            const photo = a.photo ? (String(a.photo).startsWith('http') ? a.photo : STORAGE_URL + a.photo) : '../img/default-news.png';
            const preview = content && content.substring ? content.substring(0, 200) : content;
            const detailsUrl = `actualite-details.html?id=${encodeURIComponent(idVal)}`;
            return `
                <tr>
                    <td>${escapeHtml(String(idVal))}</td>
                    <td><img src="${photo}" alt="${escapeHtml(nom)}" width="80" style="border-radius:6px; object-fit:cover; border:1px solid #ddd;" /></td>
                    <td>${escapeHtml(nom)}</td>
                    <td title="${escapeHtml(content)}">${escapeHtml(preview)}</td>
                    <td>${escapeHtml(categorie)}</td>
                    <td><a class="btn-primary" href="${detailsUrl}">Article</a></td>
                    <td>
                        <button class="btn-edit" onclick="editNews(${idx})">Modifier</button>
                        <button class="btn-delete" onclick="deleteNews(${idVal})">Supprimer</button>
                    </td>
                </tr>
            `;
        }).join('');

    } catch (e) {
        console.error('Erreur chargement actualites', e);
        list.innerHTML = '<tr><td colspan="5">Erreur de chargement.</td></tr>';
    }
}

async function saveNews(e) {
    e.preventDefault();
    const id = (document.getElementById('newsId') && document.getElementById('newsId').value) ? document.getElementById('newsId').value.trim() : '';
    const nom = document.getElementById('newsTitle').value.trim();
    const descriptions = document.getElementById('newsContent').value.trim();
    const categorie = document.getElementById('newsCategory').value;
    const photoFile = document.getElementById('newsImage').files[0];
    const dateInput = document.getElementById('newsDate') ? document.getElementById('newsDate').value : '';

    if (!nom || !descriptions || !categorie) {
        alert('Veuillez remplir le titre, le contenu et la catégorie.');
        return;
    }

    try {
        const payload = { nom, descriptions, categorie };
        if (dateInput) payload.date = dateInput;
        if (photoFile) payload.photo = photoFile;
        if (id) payload.id = id;

        let res;
        if (id) {
            // update
            res = await apiService.updateActualite(payload);
        } else {
            res = await apiService.createActualite(payload);
        }

        if (!res.success) throw new Error(res.error && res.error.message ? res.error.message : 'Erreur API');

        alert(res.data && res.data.message ? res.data.message : (id ? 'Actualité modifiée' : 'Actualité créée'));
        closeModal('newsModal');
        const form = document.getElementById('newsForm'); if (form) form.reset();
        loadNews();
        loadDashboard();
    } catch (err) {
        console.error('saveNews error', err);
        alert(err.message || 'Erreur lors de l\'enregistrement.');
    }
}

function editNews(index) {
    const a = (window.__actualites && window.__actualites[index]) ? window.__actualites[index] : null;
    if (!a) return;
    document.getElementById('newsModalTitle').textContent = 'Modifier l\'actualité';
    document.getElementById('newsId').value = a.id || a.actu_id || '';
    document.getElementById('newsTitle').value = a.nom || a.title || '';
    document.getElementById('newsContent').value = a.descriptions || a.description || '';
    const cat = document.getElementById('newsCategory'); if (cat) cat.value = a.categorie || cat.value;
    const dateInput = document.getElementById('newsDate'); if (dateInput) dateInput.value = a.created_at ? a.created_at.split('T')[0] : (a.date || '');
    const preview = document.getElementById('newsImagePreview');
    if (preview && a.photo) {
        preview.src = (String(a.photo).startsWith('http') ? a.photo : STORAGE_URL + a.photo);
        preview.style.display = 'block';
    }
    openModal('newsModal');
}

async function deleteNews(id) {
    if (!confirm('Supprimer cette actualité ?')) return;
    try {
        const res = await apiService.deleteActualite(id);
        if (!res.success) throw new Error(res.error && res.error.message ? res.error.message : 'Erreur API');
        loadNews();
        loadDashboard();
    } catch (e) {
        console.error('deleteNews', e);
        alert(e.message || 'Erreur suppression');
    }
}

function escapeHtml(str) {
    if (!str) return '';
    const div = document.createElement('div');
    div.textContent = str;
    return div.innerHTML;
}

function normalizeMessagesPayload(data) {
    if (Array.isArray(data)) return data;
    if (data.mail && Array.isArray(data.mail)) return data.mail;
    if (data.data && Array.isArray(data.data)) return data.data;
    return [];
}



function viewEventDetails(index) {
    const ev = (window.__events && window.__events[index]) ? window.__events[index] : null;
    if (!ev) return;
    const title = ev.nom || ev.nom_event || ev.titre || ev.title || '';
    const date = ev.date_evenement || ev.date_event || ev.date || '';
    const lieu = ev.lieu || ev.location || '';
    const desc = ev.descriptions || ev.description || ev.description_event || '';
    const photo = ev.photo ? (String(ev.photo).startsWith('http') ? ev.photo : STORAGE_URL + ev.photo) : '';

    const titleEl = document.getElementById('eventDetailTitle'); if (titleEl) titleEl.textContent = title || 'Détail événement';
    const dateEl = document.getElementById('eventDetailDate'); if (dateEl) dateEl.textContent = date;
    const lieuEl = document.getElementById('eventDetailLieu'); if (lieuEl) lieuEl.textContent = lieu;
    const descEl = document.getElementById('eventDetailDescription'); if (descEl) descEl.textContent = desc;
    const photoEl = document.getElementById('eventDetailPhoto');
    if (photoEl) {
        if (photo) { photoEl.src = photo; photoEl.style.display = 'block'; } else { photoEl.style.display = 'none'; }
    }

    const editBtn = document.getElementById('eventDetailEditBtn');
    if (editBtn) {
        editBtn.onclick = function () { closeModal('eventDetailModal'); editEvent(index); };
    }

    openModal('eventDetailModal');
}

async function logout() {
    try {
        await apiFetch('/logout', { method: 'POST' });
    } catch (e) {
        console.error(e);
    }

    localStorage.removeItem('token');
    window.location.href = 'login.html';
}

// Video admin controls
function setupVideoAdminControls() {
    const video = document.getElementById('adminPageVideo');
    const pickBtn = document.getElementById('adminPickVideoBtn');
    const fileInput = document.getElementById('adminVideoFileInput');
    const urlInput = document.getElementById('adminVideoUrlInput');
    const setUrlBtn = document.getElementById('adminSetVideoUrlBtn');
    const uploadBtn = document.getElementById('adminUploadVideoBtn');
    const deleteBtn = document.getElementById('adminDeleteVideoBtn');
    const msg = document.getElementById('adminVideoMsg');
    if (!video) return;

    function showMsg(text, isError) {
        if (!msg) return; msg.textContent = text || '';
        msg.style.color = isError ? '#c0392b' : '#2c3e50';
    }

    if (pickBtn && fileInput) pickBtn.addEventListener('click', () => fileInput.click());

    if (fileInput) {
        fileInput.addEventListener('change', () => {
            const f = fileInput.files && fileInput.files[0];
            if (!f) return;
            const url = URL.createObjectURL(f);
            video.src = url; video.load();
            showMsg('Aperçu prêt. Cliquez Téléverser pour envoyer au serveur.', false);
        });
    }

    if (setUrlBtn && urlInput) {
        setUrlBtn.addEventListener('click', () => {
            const u = (urlInput.value || '').trim();
            if (!u) { showMsg('Entrez une URL valide.', true); return; }
            video.src = u; video.load();
            showMsg('Vidéo définie depuis l’URL (aperçu). Cliquez Téléverser si vous voulez la rendre permanente.', false);
        });
    }

    if (uploadBtn) {
        uploadBtn.addEventListener('click', async () => {
            const f = fileInput.files && fileInput.files[0];
            const urlVal = (urlInput.value || '').trim();
            if (!f && !urlVal) { showMsg('Choisissez un fichier ou entrez une URL avant de téléverser.', true); return; }
            showMsg('Téléversement en cours...', false);
            try {
                // prefer file upload if present
                if (f) {
                    const fd = new FormData(); fd.append('video', f);
                    const data = await apiFetch('/upload-page-video', { method: 'POST', body: fd });
                    // backend should return { url: '...' }
                    const remote = (data && (data.url || data.path)) ? (data.url || data.path) : null;
                    if (remote) video.src = remote;
                    showMsg('Téléversement réussi.', false);
                } else if (urlVal) {
                    // if user provided URL, send to backend to persist (if API supports)
                    const body = { url: urlVal };
                    await apiFetch('/set-page-video-url', { method: 'POST', body: JSON.stringify(body) });
                    video.src = urlVal;
                    showMsg('URL enregistrée côté serveur (si prise en charge).', false);
                }
                video.load();
                loadDashboard();
            } catch (e) {
                console.error('Upload page video error', e);
                showMsg('Échec du téléversement: ' + (e.message || e), true);
            }
        });
    }

    if (deleteBtn) {
        deleteBtn.addEventListener('click', async () => {
            if (!confirm('Supprimer la vidéo de la page Événements ?')) return;
            try {
                await apiFetch('/delete-page-video', { method: 'DELETE' });
                video.pause(); video.removeAttribute('src'); video.load();
                showMsg('Vidéo supprimée côté serveur (si disponible).', false);
                loadDashboard();
            } catch (e) {
                console.warn('Server delete failed', e);
                // still remove locally
                video.pause(); video.removeAttribute('src'); video.load();
                showMsg('Vidéo supprimée localement. Suppression serveur échouée.', true);
            }
        });
    }
}