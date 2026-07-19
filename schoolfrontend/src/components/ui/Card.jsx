/**
 * Card component with optional header, body, and footer sections.
 * Uses compound component pattern for maximum flexibility.
 *
 * @example
 *   <Card>
 *     <Card.Header title="Student details" action={<Button variant="ghost" size="sm">Edit</Button>} />
 *     <Card.Body>
 *       <p>Content goes here</p>
 *     </Card.Body>
 *     <Card.Footer>
 *       <Button variant="secondary">Cancel</Button>
 *       <Button>Save</Button>
 *     </Card.Footer>
 *   </Card>
 *
 * @example Simple card
 *   <Card padding>
 *     <h2>Simple card</h2>
 *   </Card>
 */

function CardRoot({ children, className = '', padding = false, hover = false }) {
  return (
    <div
      className={[
        'bg-white rounded-2xl border border-surface-200 shadow-card overflow-hidden',
        hover ? 'hover:shadow-elevated hover:-translate-y-0.5 transition-all duration-300' : '',
        className,
      ].join(' ')}
    >
      {children}
    </div>
  );
}

function CardHeader({ title, subtitle, action, className = '' }) {
  return (
    <div className={['flex items-center justify-between px-5 py-4 border-b border-surface-100 bg-surface-50/50', className].join(' ')}>
      <div>
        {title && <h3 className="text-sm font-bold text-slate-800">{title}</h3>}
        {subtitle && <p className="text-xs text-slate-500 mt-0.5">{subtitle}</p>}
      </div>
      {action && <div>{action}</div>}
    </div>
  );
}

function CardBody({ children, className = '', padding = true }) {
  return (
    <div className={[padding ? 'p-5' : '', className].join(' ')}>
      {children}
    </div>
  );
}

function CardFooter({ children, className = '' }) {
  return (
    <div className={['flex items-center justify-end gap-3 px-5 py-4 border-t border-surface-100 bg-surface-50/50', className].join(' ')}>
      {children}
    </div>
  );
}

const Card = Object.assign(CardRoot, {
  Header: CardHeader,
  Body: CardBody,
  Footer: CardFooter,
});

export default Card;
