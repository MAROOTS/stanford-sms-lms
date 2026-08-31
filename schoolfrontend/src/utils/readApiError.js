function messageFromBody(data) {
    if (!data) return null;
    if (typeof data.message === 'string' && data.message.trim()) return data.message;
    return null;
}

export function readApiError(err, fallbacks = {}) {
    const status = err.response?.status;
    const message = messageFromBody(err.response?.data);

    if (status === 403) {
        return {
            kind: 'forbidden',
            title: "You don't have access to this",
            description: message && !message.toLowerCase().includes('permission to perform')
                ? message
                : (fallbacks.forbidden || 'You are not allowed to view or change this. Ask an administrator if you think this is a mistake.'),
        };
    }
    if (status === 404) {
        return {
            kind: 'notfound',
            title: fallbacks.notFoundTitle || 'Not found',
            description: message || fallbacks.notFound || 'This record could not be found.',
        };
    }
    if (status === 400) {
        return {
            kind: 'mismatch',
            title: fallbacks.mismatchTitle || "That combination isn't valid",
            description: message || fallbacks.mismatch || 'Check your selection and try again.',
        };
    }
    return {
        kind: 'error',
        title: fallbacks.errorTitle || 'Something went wrong',
        description: message || fallbacks.error || 'Please try again in a moment.',
    };
}

/** Use when the request used responseType: 'blob' (PDFs). */
export async function readApiErrorAsync(err, fallbacks) {
    const data = err.response?.data;
    if (data instanceof Blob) {
        try {
            const parsed = JSON.parse(await data.text());
            return readApiError({ ...err, response: { ...err.response, data: parsed } }, fallbacks);
        } catch {
            /* not JSON — fall through */
        }
    }
    return readApiError(err, fallbacks);
}