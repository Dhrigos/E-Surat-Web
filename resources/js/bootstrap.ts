import axios from 'axios';

window.axios = axios;

window.axios.defaults.headers.common['X-Requested-With'] = 'XMLHttpRequest';

// CSRF Token is handled automatically by Axios via the XSRF-TOKEN cookie
// which Laravel sets on every response. We do not need to manually set X-CSRF-TOKEN
// from the meta tag, as that becomes stale after login (session regeneration).

// Optional: specific for Sanctum/SPA auth if used, though X-CSRF-TOKEN usually suffices for standard Laravel web routes
window.axios.defaults.withCredentials = true;
