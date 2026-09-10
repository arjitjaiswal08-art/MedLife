import axios from 'axios'

// Dynamically determine the correct API base URL
export const getApiBaseUrl = (): string => {
  const envUrl = process.env.NEXT_PUBLIC_API_URL

  if (typeof window !== 'undefined') {
    const isLocal =
      window.location.hostname === 'localhost' ||
      window.location.hostname === '127.0.0.1'

    // If we have a custom remote backend configured (e.g. Render / Railway / API domain)
    if (envUrl && !envUrl.includes('localhost') && !envUrl.includes('127.0.0.1')) {
      return envUrl
    }

    // When running on production, mobile phone, or without an external backend,
    // use the robust built-in Next.js serverless API routes on the same origin.
    if (!isLocal || !envUrl) {
      return '/api/v1'
    }
  }

  return envUrl || '/api/v1'
}

export const api = axios.create({
  baseURL: getApiBaseUrl(),
  headers: { 'Content-Type': 'application/json' },
  timeout: 15000,
})

// Attach JWT token from localStorage on every request & ensure non-localhost baseURL on mobile/prod
api.interceptors.request.use((config) => {
  if (typeof window !== 'undefined') {
    const isLocal =
      window.location.hostname === 'localhost' ||
      window.location.hostname === '127.0.0.1'

    // Guard against any stale localhost baseURL when on mobile or deployed domain
    if (!isLocal && config.baseURL && (config.baseURL.includes('localhost') || config.baseURL.includes('127.0.0.1'))) {
      config.baseURL = '/api/v1'
    }

    const token = localStorage.getItem('access_token')
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
  }
  return config
})

// Auto-fallback on network error + Auto-refresh on 401
api.interceptors.response.use(
  (res) => res,
  async (error) => {
    const original = error.config

    // 1. If connection to external API failed (Network Error, Mixed Content, or timeout),
    // automatically fallback to the built-in Next.js /api/v1 routes!
    if (
      original &&
      !original._fallbackRetry &&
      typeof window !== 'undefined' &&
      original.baseURL !== '/api/v1'
    ) {
      original._fallbackRetry = true
      original.baseURL = '/api/v1'
      console.warn('Backend connection failed; smoothly falling back to built-in HealthCARE API...')
      return api(original)
    }

    // 2. Auto-refresh on 401
    if (error.response?.status === 401 && !original._retry) {
      original._retry = true
      try {
        const refreshToken = localStorage.getItem('refresh_token')
        if (refreshToken) {
          const res = await axios.post(`${getApiBaseUrl()}/auth/refresh`, {
            refresh_token: refreshToken,
          })
          localStorage.setItem('access_token', res.data.access_token)
          original.headers.Authorization = `Bearer ${res.data.access_token}`
          return api(original)
        }
      } catch {
        localStorage.removeItem('access_token')
        localStorage.removeItem('refresh_token')
        window.location.href = '/login'
      }
    }
    return Promise.reject(error)
  }
)

// ─── Service Functions ────────────────────────────────────

export const symptomsService = {
  analyze: (symptomText: string, city?: string, language?: string) =>
    api.post('/analyze-symptoms', { symptom_text: symptomText, city, language }),
}

export const placesService = {
  nearby: (params: Record<string, unknown>) =>
    api.get('/places/nearby', { params }),

  detail: (placeId: string) =>
    api.get(`/places/${placeId}`),

  route: (placeId: string, fromLat?: number, fromLng?: number) =>
    api.get('/places/route', {
      params: { to_place_id: placeId, from_lat: fromLat, from_lng: fromLng },
    }),
}

export const feesService = {
  get: (specialistType: string, city?: string) =>
    api.get('/fees', { params: { specialist_type: specialistType, city } }),
}

export const savedService = {
  list: () => api.get('/saved'),
  save: (data: Record<string, unknown>) => api.post('/saved', data),
  remove: (id: string) => api.delete(`/saved/${id}`),
}

export const historyService = {
  list: (limit = 10) => api.get('/history', { params: { limit } }),
  deleteItem: (id: string) => api.delete(`/history/${id}`),
  clearAll: () => api.delete('/history'),
}

export const feedbackService = {
  submit: (data: Record<string, unknown>) => api.post('/feedback', data),
}

export const authService = {
  signup: (email: string, password: string, displayName?: string) =>
    api.post('/auth/signup', { email, password, display_name: displayName }),
  login: (email: string, password: string) =>
    api.post('/auth/login', { email, password }),
  logout: (refreshToken: string) =>
    api.post('/auth/logout', { refresh_token: refreshToken }),
}

export const usersService = {
  getProfile: () => api.get('/users/me'),
  updateProfile: (data: Record<string, unknown>) => api.put('/users/me', data),
}
