/**
 * Design tokens for the StanfordOS UI system.
 * All values map to Tailwind CSS classes via the @theme directive in index.css.
 *
 * Usage:
 *   import { tokens } from '@/components/ui/theme'
 *   <div className={tokens.colors.surface}>...</div>
 *
 * Architecture:
 *   tokens → CSS custom properties → Tailwind @theme → utility classes
 */

export const tokens = {
  // ── Spacing scale (in Tailwind units) ──
  spacing: {
    xs: 'p-1',        // 4px
    sm: 'p-2',        // 8px
    md: 'p-3',        // 12px
    lg: 'p-4',        // 16px
    xl: 'p-6',        // 24px
  },

  // ── Border radius ──
  radius: {
    sm: 'rounded-md',    // 6px
    md: 'rounded-lg',    // 8px
    lg: 'rounded-xl',    // 12px
    xl: 'rounded-2xl',   // 16px
    full: 'rounded-full',
  },

  // ── Shadow scale ──
  shadow: {
    none: '',
    sm: 'shadow-sm',
    md: 'shadow-card',
    lg: 'shadow-md',
    xl: 'shadow-elevated',
    modal: 'shadow-elevated',
  },

  // ── Semantic colors ──
  colors: {
    // Surfaces
    surface: {
      page: 'bg-surface-50',
      card: 'bg-white',
      hover: 'hover:bg-surface-50',
      active: 'bg-surface-100',
    },
    // Borders
    border: {
      default: 'border-surface-200',
      light: 'border-surface-100',
      hover: 'hover:border-surface-300',
    },
    // Text
    text: {
      primary: 'text-slate-900',
      secondary: 'text-slate-600',
      muted: 'text-slate-500',
      placeholder: 'text-slate-400',
    },
    // Primary / brand
    brand: {
      bg: 'bg-primary-800',
      bgHover: 'hover:bg-primary-700',
      text: 'text-white',
      gradient: 'bg-gradient-to-br from-primary-800 to-primary-900',
    },
    // Accent
    accent: {
      bg: 'bg-accent-500',
      bgHover: 'hover:bg-accent-600',
      text: 'text-accent-600',
      ring: 'focus:ring-accent-500/30',
    },
    // Semantic states
    danger: {
      bg: 'bg-red-50',
      text: 'text-red-600',
      border: 'border-red-200',
      solid: 'bg-red-600 hover:bg-red-700',
    },
    success: {
      bg: 'bg-emerald-50',
      text: 'text-emerald-700',
      border: 'border-emerald-200',
    },
    warning: {
      bg: 'bg-amber-50',
      text: 'text-amber-700',
      border: 'border-amber-200',
    },
    info: {
      bg: 'bg-sky-50',
      text: 'text-sky-700',
      border: 'border-sky-200',
    },
  },

  // ── Typography ──
  type: {
    h1: 'text-[26px] font-bold text-slate-900 tracking-tight',
    h2: 'text-lg font-bold text-slate-900',
    h3: 'text-base font-bold text-slate-800',
    body: 'text-sm text-slate-600',
    caption: 'text-xs text-slate-500',
    label: 'text-xs font-medium text-slate-500',
    overline: 'text-[11px] font-semibold tracking-wider text-slate-400 uppercase',
  },

  // ── Input base ──
  input: {
    base: 'w-full px-3 py-2.5 rounded-lg bg-slate-50 border border-slate-200 text-sm placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-accent-500/30 focus:border-accent-300 transition-all',
    error: 'border-red-300 bg-red-50/50',
    disabled: 'opacity-60 cursor-not-allowed',
  },

  // ── Button base ──
  button: {
    base: 'inline-flex items-center justify-center gap-2 text-sm font-semibold px-4 py-2.5 rounded-xl transition-all duration-200 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent-500 disabled:opacity-50 disabled:cursor-not-allowed active:scale-[0.98]',
    primary: 'bg-primary-800 hover:bg-primary-700 text-white shadow-sm shadow-primary-900/10',
    accent: 'bg-accent-500 hover:bg-accent-600 text-white shadow-sm',
    secondary: 'bg-white border border-surface-200 text-slate-600 hover:bg-surface-50 shadow-sm',
    ghost: 'text-slate-500 hover:text-slate-700 hover:bg-surface-100',
    danger: 'bg-red-600 hover:bg-red-700 text-white shadow-sm shadow-red-500/20',
  },
};

export default tokens;
