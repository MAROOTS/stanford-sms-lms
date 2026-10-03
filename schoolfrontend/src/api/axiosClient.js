import axios from 'axios';

const apiRoot = (import.meta.env.VITE_API_URL || '').replace(/\/$/, '');
export const apiBase = `${apiRoot}/api`;

const axiosClient = axios.create({
    baseURL: apiBase,
});

function getStorage() {
    return localStorage.getItem('accessToken')
        ? localStorage
        : sessionStorage;
}

axiosClient.interceptors.request.use((config) => {
    const token = getStorage().getItem('accessToken');

    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }

    return config;
});

let isRefreshing = false;
let refreshQueue = [];

function processQueue(error, token = null) {
    refreshQueue.forEach(({ resolve, reject }) => {
        if (error) {
            reject(error);
        } else {
            resolve(token);
        }
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

function isAuthFailure(error) {
    const s = error.response?.status;
    const msg = (
        error.response?.data?.message || ''
    ).toLowerCase();

    if (s === 401) {
        return true;
    }

    if (
        s === 403 &&
        (
            msg.includes('expired') ||
            msg.includes('jwt') ||
            msg.includes('unauthorized') ||
            msg.includes('full authentication') ||
            msg.includes('access denied')
        )
    ) {
        return true;
    }

    return false;
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

        /*
         * 403 → log out immediately if the account is suspended.
         *
         * Keep this check before the general authentication-failure
         * handling because a suspended response should not attempt
         * an access-token refresh first.
         */
        if (error.response?.status === 403) {
            const msg = (
                error.response?.data?.message || ''
            ).toLowerCase();

            if (msg.includes('suspended')) {
                clearSessionAndRedirect();
                return Promise.reject(error);
            }
        }

        /*
         * 401 and authentication-related 403 responses are treated
         * as session/authentication failures.
         *
         * For example, Spring Security may return 403 when an expired
         * JWT reaches a protected endpoint.
         */
        if (
            isAuthFailure(error) &&
            !isPublicAuthEndpoint
        ) {
            const storage = getStorage();
            const refreshToken = storage.getItem('refreshToken');

            /*
             * If another request is already refreshing the session,
             * wait for that refresh to finish and then retry this
             * original request with the new access token.
             */
            if (!originalRequest._retry && refreshToken) {

                if (isRefreshing) {
                    return new Promise((resolve, reject) => {
                        refreshQueue.push({
                            resolve,
                            reject,
                        });
                    }).then((newToken) => {
                        originalRequest.headers.Authorization =
                            `Bearer ${newToken}`;

                        return axiosClient(originalRequest);
                    });
                }

                /*
                 * Mark this request so it cannot repeatedly trigger
                 * another refresh cycle.
                 */
                originalRequest._retry = true;
                isRefreshing = true;

                try {
                    const { data } = await axios.post(
                        `${apiBase}/auth/refresh`,
                        {
                            refreshToken,
                        }
                    );

                    storage.setItem(
                        'accessToken',
                        data.accessToken
                    );

                    storage.setItem(
                        'refreshToken',
                        data.refreshToken
                    );

                    /*
                     * Release every request that was waiting for
                     * this refresh.
                     */
                    processQueue(
                        null,
                        data.accessToken
                    );

                    originalRequest.headers.Authorization =
                        `Bearer ${data.accessToken}`;

                    return axiosClient(originalRequest);

                } catch {
                    /*
                     * Refresh failed, so every queued request should
                     * stop rather than continuing into page-level
                     * .catch() handlers.
                     */
                    processQueue(
                        new Error('session'),
                        null
                    );

                    clearSessionAndRedirect();

                    /*
                     * Never reject this request normally.
                     * This prevents downstream loaders such as:
                     *
                     * .catch(() => setError(...))
                     *
                     * from painting an error card after logout.
                     */
                    return new Promise(() => {});
                } finally {
                    isRefreshing = false;
                }
            }

            /*
             * Authentication failed and there is no usable refresh
             * token, or this request already attempted a refresh.
             */
            clearSessionAndRedirect();

            /*
             * Keep the promise pending so page-level catch handlers
             * do not turn session expiry into a red error card.
             */
            return new Promise(() => {});
        }

        return Promise.reject(error);
    }
);

export default axiosClient;