import axios from 'axios';

const BASE_URL = 'http://127.0.0.1:8000/api';

const api = axios.create({
	baseURL: BASE_URL,
	headers: {
		'Accept': 'application/json',
	},
});

// Attach bearer token from localStorage if present
api.interceptors.request.use((config) => {
	try {
		const token = localStorage.getItem('auth_token');
		if (token) {
			config.headers = config.headers || {};
			config.headers.Authorization = `Bearer ${token}`;
		}
	} catch (e) {
		// localStorage might not be available in some environments
	}
	return config;
}, (error) => Promise.reject(error));

function _formatError(err) {
	if (!err) return { message: 'Unknown error' };
	if (err.response) {
		const data = err.response.data;
		const message = data && (data.message || data.error) ? (data.message || data.error) : JSON.stringify(data);
		return { message, status: err.response.status, raw: data };
	}
	return { message: err.message || String(err) };
}

function _appendFormData(fd, obj) {
	Object.keys(obj || {}).forEach((key) => {
		const val = obj[key];
		if (val === undefined || val === null) return;
		// If array, append each
		if (Array.isArray(val)) {
			val.forEach((v) => fd.append(`${key}[]`, v));
		} else {
			fd.append(key, val);
		}
	});
}

const apiService = {
	// Auth
	async login(credentials) {
		try {
			const res = await api.post('/login', credentials);
			return { success: true, data: res.data };
		} catch (err) {
			return { success: false, error: _formatError(err) };
		}
	},

	async logout() {
		try {
			const res = await api.post('/logout');
			return { success: true, data: res.data };
		} catch (err) {
			return { success: false, error: _formatError(err) };
		}
	},

	// Admin / Dashboard
	async getDash() {
		try {
			const res = await api.get('/dash');
			return { success: true, data: res.data };
		} catch (err) {
			return { success: false, error: _formatError(err) };
		}
	},

	// Actualites
	async getActualites() {
		try {
			const res = await api.get('/actualites');
			return { success: true, data: res.data };
		} catch (err) {
			return { success: false, error: _formatError(err) };
		}
	},

	async getActualiteDetail(id) {
		try {
			const res = await api.post(`/actualite/${encodeURIComponent(id)}`);
			return { success: true, data: res.data };
		} catch (err) {
			return { success: false, error: _formatError(err) };
		}
	},

	async createActualite(payload = {}) {
		try {
			const fd = new FormData();
			_appendFormData(fd, payload);
			const res = await api.post('/create-actualite', fd, { headers: { 'Content-Type': 'multipart/form-data' } });
			return { success: true, data: res.data };
		} catch (err) {
			return { success: false, error: _formatError(err) };
		}
	},

	async deleteActualite(payload = {}) {
		try {
			const res = await api.delete('/delete-actualite', { data: payload });
			return { success: true, data: res.data };
		} catch (err) {
			return { success: false, error: _formatError(err) };
		}
	},

	async updateActualite(payload = {}) {
		try {
			const fd = new FormData();
			_appendFormData(fd, payload);
			// Use POST + method override for multipart uploads (PUT with multipart may not include files in PHP)
			fd.append('_method', 'PUT');
			const res = await api.post('/update-actualite', fd, { headers: { 'Content-Type': 'multipart/form-data' } });
			return { success: true, data: res.data };
		} catch (err) {
			return { success: false, error: _formatError(err) };
		}
	},

	// Evenements
	async getEvents() {
		try {
			const res = await api.get('/evenements');
			return { success: true, data: res.data };
		} catch (err) {
			return { success: false, error: _formatError(err) };
		}
	},

	async getEventDetail(id) {
		try {
			const res = await api.post(`/evenement/${encodeURIComponent(id)}`);
			return { success: true, data: res.data };
		} catch (err) {
			return { success: false, error: _formatError(err) };
		}
	},

	async createEvenement(payload = {}) {
		try {
			const fd = new FormData();
			_appendFormData(fd, payload);
			const res = await api.post('/create-evenement', fd, { headers: { 'Content-Type': 'multipart/form-data' } });
			return { success: true, data: res.data };
		} catch (err) {
			return { success: false, error: _formatError(err) };
		}
	},

	async deleteEvenement(payload = {}) {
		try {
			const res = await api.delete('/delete-evenement', { data: payload });
			return { success: true, data: res.data };
		} catch (err) {
			return { success: false, error: _formatError(err) };
		}
	},

	async updateEvenement(payload = {}) {
		try {
			const fd = new FormData();
			_appendFormData(fd, payload);
			// Use POST with method override because multipart PUT does not reliably send files in PHP
			fd.append('_method', 'PUT');
			const res = await api.post('/update-evenement', fd, { headers: { 'Content-Type': 'multipart/form-data' } });
			return { success: true, data: res.data };
		} catch (err) {
			return { success: false, error: _formatError(err) };
		}
	},

	// Membres / Users
	async createMembre(payload = {}) {
		try {
			const fd = new FormData();
			_appendFormData(fd, payload);
			const res = await api.post('/create-membre', fd, { headers: { 'Content-Type': 'multipart/form-data' } });
			return { success: true, data: res.data };
		} catch (err) {
			return { success: false, error: _formatError(err) };
		}
	},

	async deleteMembre(payload = {}) {
		try {
			const res = await api.delete('/delete-membre', { data: payload });
			return { success: true, data: res.data };
		} catch (err) {
			return { success: false, error: _formatError(err) };
		}
	},

	async updateMembre(payload = {}) {
		try {
			const fd = new FormData();
			_appendFormData(fd, payload);
			// Use POST + _method=PUT for file uploads compatibility
			fd.append('_method', 'PUT');
			const res = await api.post('/update-membre', fd, { headers: { 'Content-Type': 'multipart/form-data' } });
			return { success: true, data: res.data };
		} catch (err) {
			return { success: false, error: _formatError(err) };
		}
	},

	async getMailList() {
		try {
			const res = await api.get('/mail-list');
			return { success: true, data: res.data };
		} catch (err) {
			return { success: false, error: _formatError(err) };
		}
	},

	async setMemberPast(payload = {}) {
		try {
			const res = await api.patch('/set-member-past', payload);
			return { success: true, data: res.data };
		} catch (err) {
			return { success: false, error: _formatError(err) };
		}
	},

	// Misc
	async sendMail() {
		try {
			const res = await api.get('/send-mail');
			return { success: true, data: res.data };
		} catch (err) {
			return { success: false, error: _formatError(err) };
		}
	},
};

// Expose for module systems and global window
export default apiService;
if (typeof window !== 'undefined') window.apiService = apiService;