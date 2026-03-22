// Lightweight fetch-based API wrapper so frontend works without bundler
const BASE_URL = (window && window.__API_BASE__) ? window.__API_BASE__ : 'http://127.0.0.1:8000/api';

function _getAuthHeader() {
	try {
		const token = localStorage.getItem('auth_token');
		return token ? { 'Authorization': 'Bearer ' + token } : {};
	} catch (e) {
		return {};
	}
}

async function _safeJson(resp) {
	const text = await resp.text().catch(() => '');
	try { return text ? JSON.parse(text) : null; } catch (e) { return { __raw: text }; }
}

function _buildError(status, data) {
	return { message: (data && (data.message || data.error)) ? (data.message || data.error) : 'API error', status, raw: data };
}

function _appendFormData(fd, obj) {
	Object.keys(obj || {}).forEach((key) => {
		const val = obj[key];
		if (val === undefined || val === null) return;
		if (Array.isArray(val)) {
			val.forEach((v) => fd.append(`${key}[]`, v));
		} else {
			fd.append(key, val);
		}
	});
}

const apiService = {
	async _request(path, opts = {}) {
		const url = BASE_URL + path;
		const headers = Object.assign({ 'Accept': 'application/json' }, opts.headers || {}, _getAuthHeader());
		const cfg = Object.assign({}, opts, { headers });
		try {
			const resp = await fetch(url, cfg);
			const data = await _safeJson(resp);
			if (!resp.ok) return { success: false, error: _buildError(resp.status, data) };
			return { success: true, data };
		} catch (err) {
			return { success: false, error: { message: err.message || String(err) } };
		}
	},

	// Auth
	async login(credentials) {
		return await this._request('/login', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(credentials) });
	},
	async logout() { return await this._request('/logout', { method: 'POST' }); },

	// Dashboard
	async getDash() { return await this._request('/dash'); },

	// Actualites
	async getActualites() { return await this._request('/actualites'); },
	async getActualiteDetail(id) { return await this._request(`/actualite/${encodeURIComponent(id)}`); },
	async createActualite(payload = {}) {
		const fd = new FormData(); _appendFormData(fd, payload);
		return await this._request('/create-actualite', { method: 'POST', body: fd });
	},
	async updateActualite(payload = {}) {
		const fd = new FormData(); _appendFormData(fd, payload); fd.append('_method', 'PUT');
		return await this._request('/update-actualite', { method: 'POST', body: fd });
	},
	async deleteActualite(id) {
	return await this._request(`/delete-actualite/${encodeURIComponent(id)}`, {
		method: 'DELETE'
	});
	},

	// Evenements
	async getEvents() { return await this._request('/evenements'); },
	async getEventDetail(id) { return await this._request(`/evenement/${encodeURIComponent(id)}`); },
	async createEvenement(payload = {}) {
		const fd = new FormData(); _appendFormData(fd, payload); return await this._request('/create-evenement', { method: 'POST', body: fd });
	},
	async updateEvenement(payload = {}) { const fd = new FormData(); _appendFormData(fd, payload); fd.append('_method', 'PUT'); return await this._request('/update-evenement', { method: 'POST', body: fd }); },
	async deleteEvenement(payload = {}) { return await this._request('/delete-evenement', { method: 'DELETE', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) }); },

	// Membres
	async createMembre(payload = {}) { const fd = new FormData(); _appendFormData(fd, payload); return await this._request('/create-membre', { method: 'POST', body: fd }); },
	async updateMembre(payload = {}) { const fd = new FormData(); _appendFormData(fd, payload); fd.append('_method', 'PUT'); return await this._request('/update-membre', { method: 'POST', body: fd }); },
	async deleteMembre(payload = {}) { return await this._request('/delete-membre', { method: 'DELETE', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) }); },

	// Messages
	async getMessages() { return await this._request('/messages'); },
	async sendMessage(payload = {}) { return await this._request('/messages', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) }); },

	// Misc
	async getMailList() { return await this._request('/mail-list'); },
	async setMemberPast(payload = {}) { return await this._request('/set-member-past', { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) }); },
	async sendMail() { return await this._request('/send-mail'); }
};

// expose globally for non-module pages
if (typeof window !== 'undefined') window.apiService = apiService;
export default apiService;