-- ReLoop Seed Data Migration: V2__seed_data.sql
-- Seed baseline material types suitable for circular economy, composting, and organic fertilizer production

INSERT INTO material_types (name, category, default_unit, description, active) VALUES
('Vegetable Waste', 'ORGANIC', 'KG', 'Organic kitchen and field vegetable residues, ideal for composting and microbial decomposition.', TRUE),
('Fruit Waste', 'ORGANIC', 'KG', 'Discarded pulp, peels, and spoiled fruits rich in sugars, ideal for organic fertilizer and bio-enzymes.', TRUE),
('Crop Residue & Stubble', 'ORGANIC', 'TON', 'Post-harvest wheat, paddy straw, and stalks suitable for mulching, bio-char, or composting.', TRUE),
('Sugarcane Bagasse', 'ORGANIC', 'TON', 'Fibrous residue remaining after crushing sugarcane, utilized in composting and biomass processing.', TRUE),
('Cattle Manure & Bio-Waste', 'ORGANIC', 'TON', 'Aged cow dung and farm animal slurry for direct enrichment of organic fertilizer units.', TRUE),
('Mustard & Oilseed Husk', 'ORGANIC', 'TON', 'Deoiled seed cake and pod residue for nitrogen-rich compost manufacturing.', TRUE);
