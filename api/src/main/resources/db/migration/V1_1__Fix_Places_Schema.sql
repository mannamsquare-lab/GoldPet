-- Fix legacy schema issue where places table has checkin_count column
-- This column is not in the V1 definition but exists in some environments causing V2 insert failure
ALTER TABLE places DROP COLUMN IF EXISTS checkin_count;
