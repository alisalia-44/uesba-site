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

    // Update sections
    adminSections.forEach(section => section.classList.remove('active'));
    document.getElementById(`${sectionName}-section`).classList.add('active');

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
    else if (sectionName === 'messages') loadMessages();
}

// ===== DASHBOARD =====
function loadDashboard() {
    const data = DataManager.getData();
    document.getElementById('stat-activities').textContent = data.activities.length;
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

function openAddModal(type, id = null) {
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
                document.getElementById('eventTitle').value = item.title;
                document.getElementById('eventDate').value = item.date;
                document.getElementById('eventLocation').value = item.location;
                document.getElementById('eventDescription').value = item.description;
                document.getElementById('eventImage').value = item.image || '';
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
    const events = DataManager.getItems('events');
    const tbody = document.getElementById('events-list');
    
    if (events.length === 0) {
        tbody.innerHTML = '<tr class="empty-row"><td colspan="6">Aucun événement</td></tr>';
        return;
    }

    tbody.innerHTML = events.map(event => `
        <tr>
            <td><strong>${event.title}</strong></td>
            <td>${formatDate(event.date)}</td>
            <td>${event.location}</td>
            <td>${truncateText(event.description, 40)}</td>
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

function saveEvent(e) {
    e.preventDefault();
    
    const event = {
        title: document.getElementById('eventTitle').value,
        date: document.getElementById('eventDate').value,
        location: document.getElementById('eventLocation').value,
        description: document.getElementById('eventDescription').value,
        image: document.getElementById('eventImage').value
    };

    if (currentEditingId) {
        DataManager.updateItem('events', currentEditingId, event);
    } else {
        DataManager.addItem('events', event);
    }

    closeModal('eventModal');
    loadEvents();
    loadDashboard();
}

function deleteEvent(id) {
    if (confirm('Êtes-vous sûr de vouloir supprimer cet événement ?')) {
        DataManager.deleteItem('events', id);
        loadEvents();
        loadDashboard();
    }
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
    const messages = DataManager.getItems('messages');
    const container = document.getElementById('messages-list');
    
    if (messages.length === 0) {
        container.innerHTML = '<div class="empty-state"><p>Aucun message</p></div>';
        return;
    }

    container.innerHTML = messages.map(message => `
        <div class="message-card" onclick="viewMessage(${message.id})">
            <div class="message-header">
                <div>
                    <div class="message-sender">${message.name}</div>
                    <div class="message-email">${message.email}</div>
                </div>
                <div class="message-date">${formatDate(message.date)}</div>
            </div>
            <div class="message-subject">${message.subject || 'Pas de sujet'}</div>
            <div class="message-body">${message.message}</div>
        </div>
    `).join('');
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
        localStorage.removeItem('uesba_user');
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
