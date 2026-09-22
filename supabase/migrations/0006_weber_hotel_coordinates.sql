-- ═════════════════════════════════════════════════════════════════════
-- 0006_weber_hotel_coordinates.sql
-- Corrects the Weber Hotel evacuation-center row to its real location.
-- Previous 10.4010, 124.0000 was an approximate/town-center guess. The
-- trusted pin is Google Maps plus code CX5W+JW Liloan, Cebu
-- (https://maps.app.goo.gl/bStDNjaUej5TWi6q8) = 10.4096078505586°N,
-- 123.99722509210399°E.
-- ═════════════════════════════════════════════════════════════════════

update evacuation_centers
set lat = 10.4096078505586,
    lon = 123.99722509210399
where id = 'd4444444-4444-4444-8444-444444444444';