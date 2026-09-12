export function getSubdomain() {
    const hostname = window.location.hostname;
    const root = (import.meta.env.VITE_ROOT_DOMAIN || '').toLowerCase();

    if (hostname === 'localhost' || hostname === '127.0.0.1') return null;

    if (root) {
        if (hostname === root || hostname === `www.${root}`) return null;
        const suffix = `.${root}`;
        if (!hostname.endsWith(suffix)) return null;
        const sub = hostname.slice(0, -suffix.length);
        if (!sub || sub === 'www' || sub === 'api' || sub === 'files') return null;
        return sub.split('.')[0];
    }

    const parts = hostname.split('.');
    if (parts.length < 2) return null;
    const subdomain = parts[0];
    if (subdomain === 'www') return null;
    return subdomain;
}