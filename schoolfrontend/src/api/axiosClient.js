import axios from 'axios';

const axiosClient = axios.create({
    baseURL: 'http://localhost:8080/api',
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

        if (error.response?.status === 401 && !isPublicAuthEndpoint && !originalRequest._retry) {
            const storage = getStorage();
            const refreshToken = storage.getItem('refreshToken');

            if (!refreshToken) {
                clearSessionAndRedirect();
                return Promise.reject(error);
            }

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
                // plain axios here, not axiosClient — avoids re-triggering this same interceptor
                const { data } = await axios.post('http://localhost:8080/api/auth/refresh', { refreshToken });
                storage.setItem('accessToken', data.accessToken);
                storage.setItem('refreshToken', data.refreshToken);
                processQueue(null, data.accessToken);
                originalRequest.headers.Authorization = `Bearer ${data.accessToken}`;
                return axiosClient(originalRequest);
            } catch (refreshError) {
                processQueue(refreshError, null);
                clearSessionAndRedirect();
                return Promise.reject(refreshError);
            } finally {
                isRefreshing = false;
            }
        }

        return Promise.reject(error);
    }
);

export default axiosClient;