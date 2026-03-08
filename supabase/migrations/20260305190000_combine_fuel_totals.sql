-- Combine high/low fuel columns into total fuel columns
-- This migration adds auto_fuel_total and teleop_fuel_total,
-- backfills them from the existing high/low columns,
-- then drops the old columns.

ALTER TABLE public.match_entries
  ADD COLUMN auto_fuel_total INT NOT NULL DEFAULT 0,
  ADD COLUMN teleop_fuel_total INT NOT NULL DEFAULT 0;

-- Backfill existing rows using simple total fuel counts
UPDATE public.match_entries
SET
  auto_fuel_total = COALESCE(auto_fuel_high, 0) + COALESCE(auto_fuel_low, 0),
  teleop_fuel_total = COALESCE(teleop_fuel_high, 0) + COALESCE(teleop_fuel_low, 0);

-- Drop old split columns now that totals are in place
ALTER TABLE public.match_entries
  DROP COLUMN auto_fuel_high,
  DROP COLUMN auto_fuel_low,
  DROP COLUMN teleop_fuel_high,
  DROP COLUMN teleop_fuel_low;

