ALTER TABLE fee_invoices ADD COLUMN due_date DATE;
ALTER TABLE fee_invoices ADD COLUMN last_overdue_reminder_at TIMESTAMP;