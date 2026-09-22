-- ═════════════════════════════════════════════════════════════════════
-- 0005_remove_cotcot_reference.sql
-- Removes the Cotcot Barangay Hall row entirely. Migration 0004 kept it
-- as an unconfirmed "reference point" EC; the product decision is to
-- drop it so the roster lists only the six documented evacuation
-- centers (Tiltilon ES, Liloan Central School, Panphil B. Francisco
-- Gymnasium, Weber Hotel, Yati ES, Calero IS).
-- ═════════════════════════════════════════════════════════════════════

delete from evacuation_centers
where id = '11111111-1111-4111-8111-111111111111';