import axios from 'axios';


const apiRoot = (import.meta.env.VITE_API_URL || '').replace(/\/$/, '');
export const apiBase = `${apiRoot}/api`;

const axiosClient = axios.create({
    baseURL: apiBase,
});

function getStorage() {
    return localStorage.getItem('accessToken') ? localStorage : sessionStorage;
}

axiosClient.interceptors.request.use((config) => {
    const token = getStorage().getItem('accessToken');
    if (token) config.headers.Authorization = `Bearer ${token}`;
    return config;
});

let isRefreshing = false;
let refreshQueue = [];

function processQueue(error, token = null) {
    refreshQueue.forEach(({ resolve, reject }) => {
        if (error) reject(error);
        else resolve(token);
    });
    refreshQueue = [];
}

function clearSessionAndRedirect() {
    ['accessToken', 'refreshToken', 'user'].forEach((key) => {
        localStorage.removeItem(key);
        sessionStorage.removeItem(key);
    });
    window.location.href = '/login';
}

axiosClient.interceptors.response.use(
    (response) => response,
    async (error) => {
        const originalRequest = error.config;

        const isPublicAuthEndpoint =
            originalRequest?.url?.includes('/auth/login') ||
            originalRequest?.url?.includes('/auth/refresh') ||
            originalRequest?.url?.includes('/auth/forgot-password') ||
            originalRequest?.url?.includes('/auth/reset-password') ||
            originalRequest?.url?.includes('/auth/resend-verification');

        // 401 → try refresh, otherwise log out
        if (error.response?.status === 401 && !isPublicAuthEndpoint) {
            const storage = getStorage();
            const refreshToken = storage.getItem('refreshToken');

            if (!originalRequest._retry && refreshToken) {
                if (isRefreshing) {
                    return new Promise((resolve, reject) => {
                        refreshQueue.push({ resolve, reject });
                    }).then((newToken) => {
                        originalRequest.headers.Authorization = `Bearer ${newToken}`;
                        return axiosClient(originalRequest);
                    });
                }

                originalRequest._retry = true;
                isRefreshing = true;
                try {
                    const { data } = await axios.post(`${apiBase}/auth/refresh`, { refreshToken });
                    storage.setItem('accessToken', data.accessToken);
                    storage.setItem('refreshToken', data.refreshToken);
                    processQueue(null, data.accessToken);
                    originalRequest.headers.Authorization = `Bearer ${data.accessToken}`;
                    return axiosClient(originalRequest);
                } catch {
                    processQueue(new Error('session'), null);
                    clearSessionAndRedirect();
                    return new Promise(() => {});
                } finally {
                    isRefreshing = false;
                }
            }

            clearSessionAndRedirect();
            return new Promise(() => {});
        }

        // 403 → log out if account is suspended
        if (error.response?.status === 403) {
            const msg = (error.response?.data?.message || '').toLowerCase();
            if (msg.includes('suspended')) {
                clearSessionAndRedirect();
                return Promise.reject(error);
            }
        }

        return Promise.reject(error);
    }
);

export default axiosClient;