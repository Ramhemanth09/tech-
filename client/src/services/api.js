let cachedCsrfToken = null;

function getCookie(name) {
  const match = document.cookie.match(new RegExp('(^|;\\s*)(' + name + ')=([^;]*)'));
  return match ? decodeURIComponent(match[3]) : null;
}

// Get or fetch CSRF token
export async function getCsrfToken() {
  const cookieToken = getCookie('XSRF-TOKEN');
  if (cookieToken) {
    cachedCsrfToken = cookieToken;
    return cachedCsrfToken;
  }

  if (cachedCsrfToken) return cachedCsrfToken;

  try {
    const res = await fetch('/api/csrf-token', { credentials: 'include' });
    const data = await res.json();
    if (data.success && data.data?.csrfToken) {
      cachedCsrfToken = data.data.csrfToken;
      return cachedCsrfToken;
    }
  } catch (err) {
    console.warn('[API] Could not fetch CSRF token:', err);
  }
  return '';
}

export async function apiRequest(endpoint, options = {}) {
  const method = (options.method || 'GET').toUpperCase();
  const headers = {
    Accept: 'application/json',
    ...(options.headers || {}),
  };

  // Add CSRF token for state-changing calls
  if (['POST', 'PATCH', 'PUT', 'DELETE'].includes(method)) {
    const token = await getCsrfToken();
    if (token) {
      headers['X-CSRF-Token'] = token;
    }
  }

  // Handle FormData vs JSON
  let body = options.body;
  if (body && !(body instanceof FormData) && typeof body === 'object') {
    headers['Content-Type'] = 'application/json';
    body = JSON.stringify(body);
  }

  const response = await fetch(endpoint, {
    ...options,
    method,
    headers,
    body,
    credentials: 'include',
  });

  const json = await response.json().catch(() => ({
    success: false,
    error: { message: `HTTP ${response.status} Error` },
  }));

  if (!response.ok || json.success === false) {
    const errorMsg = json.error?.message || `Request failed with status ${response.status}`;
    const error = new Error(errorMsg);
    error.status = response.status;
    error.details = json.error?.details;
    throw error;
  }

  if (json.data?.csrfToken) {
    cachedCsrfToken = json.data.csrfToken;
  }

  return json;
}

export const api = {
  get: (endpoint, options = {}) => apiRequest(endpoint, { ...options, method: 'GET' }),
  post: (endpoint, body, options = {}) => apiRequest(endpoint, { ...options, method: 'POST', body }),
  patch: (endpoint, body, options = {}) => apiRequest(endpoint, { ...options, method: 'PATCH', body }),
  delete: (endpoint, options = {}) => apiRequest(endpoint, { ...options, method: 'DELETE' }),
};
