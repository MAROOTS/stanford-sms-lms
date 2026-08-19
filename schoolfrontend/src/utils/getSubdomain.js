export function getSubdomain() {
    const hostname = window.location.hostname; // "stanford.localhost", "localhost", "stanford.yourapp.com"

    if (hostname === 'localhost') return null; // bare address → no tenant (Platform Admin area)

    const parts = hostname.split('.');
    if (parts.length < 2) return null;

    const subdomain = parts[0];
    if (subdomain === 'www') return null;
    return subdomain;
}