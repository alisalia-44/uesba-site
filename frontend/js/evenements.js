// evenements.js - loads a single event detail and renders it
const evenementsManager = (function(){
    let current = null;

    function normalizeApiEvent(e){
        if (!e) return null;
        return {
            id: e.id || e.ID || e.ID_event || e.ID_evenement || e.nom || e.title || '',
            title: e.nom || e.title || e.name || '',
            date: e.date_evenement || e.date || e.date_event || '',
            location: e.lieu || e.location || '',
            summary: e.descriptions || e.description || e.content || '',
            detail: e.detail_description || e.details || e.full_description || '',
            // Prefer the admin-set detail image when present
            photo: e.detail_photo || e.detailImage || e.detail_image || e.photo || e.image || ''
        };
    }

    async function getEvenementDetail(id) {
        // Try API first (if available)
        try {
            if (window.apiService && window.apiService.getEventDetail) {
                const res = await window.apiService.getEventDetail(id);
                if (res && res.success && res.data) {
                    // backend shape may vary
                    let evt = null;
                    if (res.data.evenement) evt = Array.isArray(res.data.evenement) ? res.data.evenement[0] : res.data.evenement;
                    else if (res.data.event) evt = res.data.event;
                    else evt = res.data;
                    current = normalizeApiEvent(evt);
                    return current;
                }
            }
        } catch (err) {
            console.warn('evenementsManager: API detail fetch failed', err);
        }

        // Fallback: read adminData from localStorage
        try {
            const raw = localStorage.getItem('adminData');
            if (raw) {
                const data = JSON.parse(raw);
                const events = data.events || [];
                const match = events.find(e => String(e.id) === String(id));
                if (match) {
                    current = normalizeApiEvent(match);
                    // prefer admin detail fields if present
                    if (match.detail_description) current.detail = match.detail_description;
                    // prefer admin detail image if present
                    if (match.detail_photo) current.photo = match.detail_photo;
                    return current;
                }
            }
        } catch (e) {
            console.warn('evenementsManager: local fallback failed', e);
        }

        // As a last resort, try to find event in a cached window.__events if present
        if (window.__events && Array.isArray(window.__events)) {
            const m = window.__events.find(e => String(e.id) === String(id) || String(e.ID) === String(id));
            if (m) {
                current = normalizeApiEvent(m);
                return current;
            }
        }

        current = null;
        throw new Error('Événement non trouvé');
    }

    function renderDetail(containerId) {
        const container = document.getElementById(containerId);
        if (!container) return;
        if (!current) {
            container.innerHTML = '<div class="error">Événement introuvable</div>';
            return;
        }

        const title = current.title || 'Événement';
        const date = current.date || '';
        const location = current.location || '';
        const summary = current.summary || '';
        const detail = current.detail || '';
        const photo = current.photo || 'images/img.jpeg';

        container.innerHTML = `
            <div style="max-width:900px;margin:0 auto;background:#fff;padding:18px;border-radius:10px;">
                <h1>${escapeHtml(title)}</h1>
                <div class="evenement-meta">
                    <span><strong>Date:</strong> ${escapeHtml(date)}</span>
                    <span><strong>Lieu:</strong> ${escapeHtml(location)}</span>
                </div>
                <div style="margin:18px 0;">
                    <img src="${escapeHtml(photo)}" alt="${escapeHtml(title)}" style="width:100%;max-height:420px;object-fit:cover;border-radius:8px;" />
                </div>
                <div class="evenement-content">
                    <h3>Résumé</h3>
                    <p>${escapeHtml(summary)}</p>
                    ${detail ? ('<h3>Détails</h3><div>' + escapeHtml(detail).replace(/\n/g,'<br>') + '</div>') : ''}
                </div>
            </div>
        `;
    }

    function escapeHtml(text){
        if (!text) return '';
        return String(text)
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/"/g, '&quot;')
            .replace(/'/g, '&#39;');
    }

    // Expose
    return {
        getEvenementDetail,
        renderDetail,
        _getCurrent: () => current
    };
})();

// expose globally for pages that call it
if (typeof window !== 'undefined') window.evenementsManager = evenementsManager;
