import { useEffect, useRef, useCallback } from 'react';
import { X } from 'lucide-react';

/**
 * Production-grade accessible Modal component.
 *
 * Features:
 *   - Focus trap (cycles through focusable elements)
 *   - ESC to close
 *   - Click outside to close
 *   - ARIA attributes (role="dialog", aria-modal, aria-labelledby)
 *   - Body scroll lock
 *   - Portal-like stacking via z-index
 *   - Animated entrance
 *
 * @example
 *   <Modal open={showModal} onClose={() => setShowModal(false)} title="Edit student">
 *     <form>...</form>
 *     <Modal.Footer>
 *       <Button variant="secondary" onClick={onClose}>Cancel</Button>
 *       <Button onClick={handleSave}>Save</Button>
 *     </Modal.Footer>
 *   </Modal>
 *
 * @example With max width
 *   <Modal open={show} onClose={close} title="View" maxWidth="lg">
 *     <p>Content</p>
 *   </Modal>
 */

const maxWidthClasses = {
  sm: 'max-w-sm',
  md: 'max-w-md',
  lg: 'max-w-lg',
  xl: 'max-w-xl',
  '2xl': 'max-w-2xl',
};

export default function Modal({
  open,
  onClose,
  title,
  subtitle,
  children,
  maxWidth = 'md',
  className = '',
  showClose = true,
}) {
  const dialogRef = useRef(null);
  const previousActiveElement = useRef(null);

  // Focus trap
  const getFocusable = useCallback(() => {
    if (!dialogRef.current) return [];
    return dialogRef.current.querySelectorAll(
      'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
    );
  }, []);

  const trapFocus = useCallback((e) => {
    if (e.key !== 'Tab') return;
    const focusable = getFocusable();
    if (focusable.length === 0) return;
    const first = focusable[0];
    const last = focusable[focusable.length - 1];
    if (e.shiftKey) {
      if (document.activeElement === first) { e.preventDefault(); last.focus(); }
    } else {
      if (document.activeElement === last) { e.preventDefault(); first.focus(); }
    }
  }, [getFocusable]);

  // Handle ESC
  const handleKeyDown = useCallback((e) => {
    if (e.key === 'Escape') onClose();
    trapFocus(e);
  }, [onClose, trapFocus]);

  // Open/close effects
  useEffect(() => {
    if (open) {
      previousActiveElement.current = document.activeElement;
      document.body.style.overflow = 'hidden';
      // Focus first focusable element
      requestAnimationFrame(() => {
        const focusable = getFocusable();
        if (focusable.length > 0) focusable[0].focus();
      });
    } else {
      document.body.style.overflow = '';
      previousActiveElement.current?.focus();
    }
    return () => { document.body.style.overflow = ''; };
  }, [open, getFocusable]);

  if (!open) return null;

  const titleId = 'modal-title';

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center px-4 py-8"
      role="presentation"
      onKeyDown={handleKeyDown}
    >
      {/* Overlay */}
      <div
        className="absolute inset-0 bg-slate-900/50 backdrop-blur-sm animate-[fadeIn_0.15s_ease-out]"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Dialog */}
      <div
        ref={dialogRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby={title ? titleId : undefined}
        className={[
          'relative w-full bg-white rounded-2xl shadow-elevated',
          'animate-[fadeIn_0.2s_cubic-bezier(0.16,1,0.3,1)]',
          'max-h-[92vh] overflow-y-auto',
          maxWidthClasses[maxWidth] || maxWidthClasses.md,
          className,
        ].join(' ')}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        {(title || showClose) && (
          <div className="flex items-center justify-between px-6 py-4 border-b border-surface-100 sticky top-0 bg-white z-10 rounded-t-2xl">
            <div>
              {title && <h2 id={titleId} className="text-lg font-bold text-slate-900">{title}</h2>}
              {subtitle && <p className="text-xs text-slate-500 mt-0.5">{subtitle}</p>}
            </div>
            {showClose && (
              <button
                onClick={onClose}
                className="text-slate-400 hover:text-slate-600 p-1.5 rounded-lg hover:bg-surface-50 transition-colors"
                aria-label="Close"
              >
                <X size={20} />
              </button>
            )}
          </div>
        )}

        {/* Body */}
        <div className="p-6">
          {children}
        </div>
      </div>
    </div>
  );
}

/**
 * Convenience footer for modal actions.
 * Use inside <Modal> for consistent button placement.
 */
function ModalFooter({ children, className = '' }) {
  return (
    <div className={['flex items-center justify-end gap-3 pt-4 border-t border-surface-100 mt-2', className].join(' ')}>
      {children}
    </div>
  );
}

Modal.Footer = ModalFooter;
