export function getSubdomain() {
    const hostname = window.location.hostname.toLowerCase();
    const root = (import.meta.env.VITE_ROOT_DOMAIN || '').toLowerCase();

    if (hostname === 'localhost') return null;
    if (hostname.endsWith('.localhost')) {
        const sub = hostname.slice(0, -'.localhost'.length);
        return sub && sub !== 'www' ? sub.split('.')[0] : null;
    }

    if (!root) return null;
    if (hostname === root || hostname === `www.${root}`) return null;
    if (!hostname.endsWith(`.${root}`)) return null;

    const sub = hostname.slice(0, -(root.length + 1));
    if (!sub || sub === 'www' || sub === 'files') return null;
    return sub.split('.')[0];
}