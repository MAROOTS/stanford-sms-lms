import { converter } from 'culori';

const toOklch = converter('oklch');

// Pre-authored lightness (L) and chroma (C) per stop, taken directly from your
// index.css. Only hue (H) is swapped for the school's brand color — the
// visual rhythm (contrast, hover deltas) stays identical to your design.
const PRIMARY_STOPS = {
    50:  { l: 0.97, c: 0.01 },
    100: { l: 0.93, c: 0.02 },
    200: { l: 0.85, c: 0.05 },
    300: { l: 0.75, c: 0.08 },
    400: { l: 0.64, c: 0.12 },
    500: { l: 0.55, c: 0.17 },
    600: { l: 0.47, c: 0.18 },
    700: { l: 0.38, c: 0.15 },
    800: { l: 0.28, c: 0.12 },
    900: { l: 0.18, c: 0.08 },
    950: { l: 0.10, c: 0.05 },
};

const ACCENT_STOPS = {
    50:  { l: 0.97, c: 0.02 },
    100: { l: 0.93, c: 0.04 },
    200: { l: 0.87, c: 0.06 },
    300: { l: 0.79, c: 0.09 },
    400: { l: 0.70, c: 0.12 },
    500: { l: 0.62, c: 0.14 },
    600: { l: 0.52, c: 0.12 },
    700: { l: 0.42, c: 0.10 },
    800: { l: 0.33, c: 0.08 },
    900: { l: 0.24, c: 0.06 },
};

export function applyBrandColor(hex) {
    if (!hex) return;

    const parsed = toOklch(hex);
    if (!parsed || typeof parsed.h !== 'number') return; // pure gray hex has no hue — skip safely, keep defaults

    const hue = parsed.h;
    const root = document.documentElement.style;

    Object.entries(PRIMARY_STOPS).forEach(([stop, { l, c }]) => {
        root.setProperty(`--color-primary-${stop}`, `oklch(${l} ${c} ${hue})`);
    });

    Object.entries(ACCENT_STOPS).forEach(([stop, { l, c }]) => {
        root.setProperty(`--color-accent-${stop}`, `oklch(${l} ${c} ${hue})`);
    });

    // teal-accent is a single alias, not a scale stop — mirror the accent-500 look
    root.setProperty('--color-teal-accent', `oklch(${ACCENT_STOPS[500].l} ${ACCENT_STOPS[500].c} ${hue})`);
}

export function resetBrandColor() {
    const root = document.documentElement.style;
    Object.keys(PRIMARY_STOPS).forEach((stop) => root.removeProperty(`--color-primary-${stop}`));
    Object.keys(ACCENT_STOPS).forEach((stop) => root.removeProperty(`--color-accent-${stop}`));
    root.removeProperty('--color-teal-accent');
}