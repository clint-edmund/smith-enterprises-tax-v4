-- ============================================================
-- Atlas
-- Ensure one primary tax return record per client and tax year
-- ============================================================

alter table public.tax_returns
add constraint tax_returns_client_year_unique
unique (client_id, tax_year);