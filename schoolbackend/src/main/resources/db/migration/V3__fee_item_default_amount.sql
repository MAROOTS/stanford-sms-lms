-- V3: Add default_amount to fee_items
ALTER TABLE public.fee_items ADD COLUMN IF NOT EXISTS default_amount numeric(12,2);