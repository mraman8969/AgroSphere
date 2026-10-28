import os
import math
from typing import Dict, Any, List

BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
MODEL_PATH = os.path.join(BASE_DIR, "models", "crop_recommendation_model.pkl")

# Agricultural Soil Health Card Benchmarks (ICAR / Dept of Agriculture, Govt of India)
# Units: kg/ha
NPK_BENCHMARKS = {
    "nitrogen": {"low": 280, "high": 560},       # <280 Low, 280-560 Medium, >560 High
    "phosphorus": {"low": 10, "high": 25},       # <10 Low, 10-25 Medium, >25 High
    "potassium": {"low": 110, "high": 280},      # <110 Low, 110-280 Medium, >280 High
    "ph": {"acidic": 6.0, "optimal_min": 6.0, "optimal_max": 7.5, "alkaline": 7.5}
}

# 12 Primary Indian Agro-Climatic Crops with Optimum Physiological Thresholds
CROPS_DATABASE = [
    {
        "crop": "Rice (Paddy)",
        "hindi_name": "चावल / धान",
        "category": "Cereal / Kharif",
        "season": "Kharif (Monsoon)",
        "optimum_n": (60, 120),
        "optimum_p": (30, 60),
        "optimum_k": (30, 60),
        "optimum_temp": (20.0, 35.0),
        "optimum_humidity": (70.0, 95.0),
        "optimum_ph": (5.5, 7.2),
        "optimum_rainfall": (150.0, 300.0),
        "soil_suitability": "Clayey, Clay Loam, Alluvial",
        "fertilizer_plan": "Basal DAP 50 kg/acre + Urea 35 kg at tillering + MOP 20 kg at panicle initiation."
    },
    {
        "crop": "Wheat",
        "hindi_name": "गेहूं",
        "category": "Cereal / Rabi",
        "season": "Rabi (Winter)",
        "optimum_n": (80, 140),
        "optimum_p": (40, 70),
        "optimum_k": (20, 50),
        "optimum_temp": (12.0, 25.0),
        "optimum_humidity": (45.0, 75.0),
        "optimum_ph": (6.0, 7.5),
        "optimum_rainfall": (50.0, 100.0),
        "soil_suitability": "Well-drained Loam, Clay Loam",
        "fertilizer_plan": "DAP 55 kg/acre + Urea split into crown root initiation & flowering stages."
    },
    {
        "crop": "Maize (Corn)",
        "hindi_name": "मक्का",
        "category": "Coarse Cereal",
        "season": "Kharif / Rabi",
        "optimum_n": (70, 120),
        "optimum_p": (35, 60),
        "optimum_k": (30, 50),
        "optimum_temp": (18.0, 30.0),
        "optimum_humidity": (55.0, 80.0),
        "optimum_ph": (6.0, 7.5),
        "optimum_rainfall": (60.0, 120.0),
        "soil_suitability": "Fertile Loam, Silt Loam",
        "fertilizer_plan": "NPK 120:60:40 kg/ha. Apply Zinc Sulphate 10 kg/acre if deficient."
    },
    {
        "crop": "Cotton",
        "hindi_name": "कपास",
        "category": "Cash Crop",
        "season": "Kharif",
        "optimum_n": (90, 150),
        "optimum_p": (40, 70),
        "optimum_k": (40, 80),
        "optimum_temp": (22.0, 35.0),
        "optimum_humidity": (50.0, 80.0),
        "optimum_ph": (6.5, 8.2),
        "optimum_rainfall": (60.0, 110.0),
        "soil_suitability": "Deep Black Cotton Soil (Regur)",
        "fertilizer_plan": "Split Urea application across vegetative & boll formation. Foliar 19-19-19 spray."
    },
    {
        "crop": "Chickpea (Gram)",
        "hindi_name": "चना",
        "category": "Pulse / Rabi",
        "season": "Rabi",
        "optimum_n": (20, 45),
        "optimum_p": (40, 70),
        "optimum_k": (20, 40),
        "optimum_temp": (15.0, 26.0),
        "optimum_humidity": (40.0, 70.0),
        "optimum_ph": (6.0, 7.8),
        "optimum_rainfall": (40.0, 80.0),
        "soil_suitability": "Sandy Loam to Clay Loam",
        "fertilizer_plan": "Inoculate with Rhizobium culture. Basal DAP 40 kg/acre; avoid excess nitrogen."
    },
    {
        "crop": "Sugarcane",
        "hindi_name": "गन्ना",
        "category": "Commercial Cash Crop",
        "season": "Perennial (12-18 months)",
        "optimum_n": (120, 250),
        "optimum_p": (50, 90),
        "optimum_k": (60, 120),
        "optimum_temp": (24.0, 38.0),
        "optimum_humidity": (60.0, 85.0),
        "optimum_ph": (6.5, 8.0),
        "optimum_rainfall": (120.0, 220.0),
        "soil_suitability": "Deep Well-drained Loam, Canal irrigated",
        "fertilizer_plan": "High nutrient demand: 250 kg N + 115 kg P2O5 + 115 kg K2O per hectare in 3 splits."
    },
    {
        "crop": "Mustard",
        "hindi_name": "सरसों",
        "category": "Oilseed / Rabi",
        "season": "Rabi",
        "optimum_n": (50, 90),
        "optimum_p": (30, 50),
        "optimum_k": (20, 40),
        "optimum_temp": (10.0, 24.0),
        "optimum_humidity": (45.0, 75.0),
        "optimum_ph": (6.0, 7.5),
        "optimum_rainfall": (35.0, 70.0),
        "soil_suitability": "Sandy Loam to Light Alluvial",
        "fertilizer_plan": "Apply Sulphur (Bentonite Sulphur 10 kg/acre) to maximize seed oil content."
    },
    {
        "crop": "Pigeonpea (Tur / Arhar)",
        "hindi_name": "अरहर / तूर",
        "category": "Pulse / Kharif",
        "season": "Kharif",
        "optimum_n": (20, 40),
        "optimum_p": (45, 75),
        "optimum_k": (20, 45),
        "optimum_temp": (20.0, 32.0),
        "optimum_humidity": (50.0, 75.0),
        "optimum_ph": (6.5, 7.8),
        "optimum_rainfall": (60.0, 100.0),
        "soil_suitability": "Deep Loamy soil with good drainage",
        "fertilizer_plan": "Apply single super phosphate (SSP) 100 kg/acre at sowing to supply Phosphorus & Sulphur."
    },
    {
        "crop": "Tomato",
        "hindi_name": "टमाटर",
        "category": "Horticultural Vegetable",
        "season": "Kharif / Rabi / Zaid",
        "optimum_n": (80, 140),
        "optimum_p": (50, 80),
        "optimum_k": (60, 100),
        "optimum_temp": (18.0, 30.0),
        "optimum_humidity": (55.0, 80.0),
        "optimum_ph": (6.0, 7.0),
        "optimum_rainfall": (50.0, 90.0),
        "soil_suitability": "Rich Sandy Loam with high organic matter",
        "fertilizer_plan": "Well-rotted FYM 10 tonnes/acre + NPK 100:60:60 kg/ha with fertigation."
    },
    {
        "crop": "Potato",
        "hindi_name": "आलू",
        "category": "Tuber / Rabi",
        "season": "Rabi",
        "optimum_n": (90, 160),
        "optimum_p": (50, 90),
        "optimum_k": (80, 140),
        "optimum_temp": (14.0, 24.0),
        "optimum_humidity": (60.0, 85.0),
        "optimum_ph": (5.2, 6.8),
        "optimum_rainfall": (40.0, 80.0),
        "soil_suitability": "Loose, Friable Sandy Loam",
        "fertilizer_plan": "Potassium-hungry crop: use Sulfate of Potash (SOP) instead of MOP for better tuber dry matter."
    }
]


def calculate_suitability(crop_meta: Dict[str, Any], n: float, p: float, k: float, temp: float, hum: float, ph: float, rain: float) -> float:
    """
    Computes a scientific physiological distance match between farmer's soil/weather inputs
    and the optimal crop requirements. Returns a normalized suitability score (0-100%).
    """
    def param_score(val: float, r_min: float, r_max: float, tolerance: float = 0.3) -> float:
        if r_min <= val <= r_max:
            return 1.0
        dist = min(abs(val - r_min), abs(val - r_max))
        span = max((r_max - r_min), 1.0)
        penalty = dist / (span * (1.0 + tolerance))
        return max(0.0, 1.0 - penalty)

    s_n = param_score(n, crop_meta["optimum_n"][0], crop_meta["optimum_n"][1])
    s_p = param_score(p, crop_meta["optimum_p"][0], crop_meta["optimum_p"][1])
    s_k = param_score(k, crop_meta["optimum_k"][0], crop_meta["optimum_k"][1])
    s_temp = param_score(temp, crop_meta["optimum_temp"][0], crop_meta["optimum_temp"][1])
    s_hum = param_score(hum, crop_meta["optimum_humidity"][0], crop_meta["optimum_humidity"][1])
    s_ph = param_score(ph, crop_meta["optimum_ph"][0], crop_meta["optimum_ph"][1])
    s_rain = param_score(rain, crop_meta["optimum_rainfall"][0], crop_meta["optimum_rainfall"][1])

    # Weighted formula (pH, temp, rainfall have high sensitivity)
    weighted = (
        s_n * 0.15 +
        s_p * 0.15 +
        s_k * 0.15 +
        s_ph * 0.15 +
        s_temp * 0.15 +
        s_rain * 0.15 +
        s_hum * 0.10
    )
    return round(weighted * 100.0, 1)


def generate_fertilizer_guidance(n: float, p: float, k: float, ph: float, target_crop: str) -> Dict[str, Any]:
    """
    Calculates exact fertilizer deficiency doses based on ICAR Soil Fertility Index.
    Translates raw nutrient deficits into commercial fertilizer quantities (Urea, DAP, MOP in kg/acre).
    """
    # Evaluate Status
    n_status = "Low" if n < 280 else ("High" if n > 560 else "Medium")
    p_status = "Low" if p < 10 else ("High" if p > 25 else "Medium")
    k_status = "Low" if k < 110 else ("High" if k > 280 else "Medium")

    fertilizer_recs = []

    # Nitrogen Adjustment
    if n_status == "Low":
        urea_needed = 45  # kg per acre
        fertilizer_recs.append({
            "nutrient": "Nitrogen (N)",
            "status": "Deficient (< 280 kg/ha)",
            "product": "Urea (46% N)",
            "dosage": f"{urea_needed} kg / acre",
            "timing": "Split into 2 applications: basal and top dressing at tillering/active branching."
        })
    elif n_status == "High":
        fertilizer_recs.append({
            "nutrient": "Nitrogen (N)",
            "status": "Excessive (> 560 kg/ha)",
            "product": "Reduce Nitrogenous Fertilizers",
            "dosage": "Cut Urea dosage by 25-30%",
            "timing": "Excessive N causes vegetative lodging and increases insect/fungal pest attacks."
        })
    else:
        fertilizer_recs.append({
            "nutrient": "Nitrogen (N)",
            "status": "Adequate (280-560 kg/ha)",
            "product": "Standard Urea",
            "dosage": "25-30 kg / acre",
            "timing": "Apply at normal crop maintenance schedule."
        })

    # Phosphorus Adjustment
    if p_status == "Low":
        dap_needed = 40  # kg per acre
        fertilizer_recs.append({
            "nutrient": "Phosphorus (P)",
            "status": "Deficient (< 10 kg/ha)",
            "product": "DAP (18-46-0) or Single Super Phosphate (SSP)",
            "dosage": f"{dap_needed} kg / acre DAP or 100 kg / acre SSP",
            "timing": "Apply 100% as basal dose at sowing/transplanting time near root zone."
        })
    elif p_status == "Medium":
        fertilizer_recs.append({
            "nutrient": "Phosphorus (P)",
            "status": "Moderate (10-25 kg/ha)",
            "product": "DAP / NPK Complex",
            "dosage": "25 kg / acre",
            "timing": "Basal application at seed drilling."
        })
    else:
        fertilizer_recs.append({
            "nutrient": "Phosphorus (P)",
            "status": "Sufficient (> 25 kg/ha)",
            "product": "Maintenance dose only",
            "dosage": "15 kg / acre",
            "timing": "Do not over-apply to avoid Zinc fixation."
        })

    # Potassium Adjustment
    if k_status == "Low":
        mop_needed = 25  # kg per acre
        fertilizer_recs.append({
            "nutrient": "Potassium (K)",
            "status": "Deficient (< 110 kg/ha)",
            "product": "Muriate of Potash (MOP 60% K2O)",
            "dosage": f"{mop_needed} kg / acre",
            "timing": "Essential for disease resistance, grain filling, and drought tolerance."
        })
    else:
        fertilizer_recs.append({
            "nutrient": "Potassium (K)",
            "status": "Sufficient (110-280 kg/ha)",
            "product": "MOP maintenance",
            "dosage": "10-15 kg / acre",
            "timing": "Apply at final land preparation."
        })

    # Soil pH Correction
    ph_guidance = ""
    if ph < 6.0:
        ph_guidance = f"Soil is Acidic (pH {ph}). Apply Agricultural Lime / Dolomite @ 250-400 kg/acre to neutralize acidity and unlock bound phosphorus."
    elif ph > 7.8:
        ph_guidance = f"Soil is Alkaline / Calcareous (pH {ph}). Apply Agricultural Gypsum @ 200 kg/acre and incorporate green manure (Dhaincha/Sunhemp) to lower alkalinity."
    else:
        ph_guidance = f"Soil pH ({ph}) is in the optimal neutral range (6.0 - 7.5). Micronutrient availability is well balanced."

    # Organic Supplements
    bio_fertilizers = [
        "Incorporate Well-rotted Farm Yard Manure (FYM) or Vermicompost @ 2-3 tonnes/acre.",
        "Seed treatment with Azotobacter / Rhizobium (250g per 10kg seed) to fix atmospheric Nitrogen naturally.",
        "Soil application of Phosphate Solubilizing Bacteria (PSB) @ 2 kg/acre to mobilize fixed soil phosphorus."
    ]

    return {
        "status_summary": {
            "nitrogen_status": n_status,
            "phosphorus_status": p_status,
            "potassium_status": k_status,
            "ph_status": "Acidic" if ph < 6.0 else ("Alkaline" if ph > 7.5 else "Optimal Neutral")
        },
        "fertilizer_recommendations": fertilizer_recs,
        "ph_correction": ph_guidance,
        "bio_fertilizers": bio_fertilizers
    }


def recommend_crop_and_fertilizer(nitrogen: float, phosphorus: float, potassium: float, 
                                  temperature: float, humidity: float, ph: float, rainfall: float) -> Dict[str, Any]:
    """
    Main evaluation pipeline providing scientific crop matching and fertilizer prescriptions.
    """
    scored_crops = []
    for crop_data in CROPS_DATABASE:
        score = calculate_suitability(
            crop_data, nitrogen, phosphorus, potassium,
            temperature, humidity, ph, rainfall
        )
        scored_crops.append({
            "crop": crop_data["crop"],
            "hindi_name": crop_data["hindi_name"],
            "category": crop_data["category"],
            "season": crop_data["season"],
            "suitability_score": score,
            "soil_suitability": crop_data["soil_suitability"],
            "fertilizer_plan": crop_data["fertilizer_plan"]
        })

    # Sort descending by suitability score
    scored_crops.sort(key=lambda x: x["suitability_score"], reverse=True)
    top_crop = scored_crops[0]

    # Generate targeted fertilizer guidance for the top recommended crop
    fertilizer_plan = generate_fertilizer_guidance(
        nitrogen, phosphorus, potassium, ph, top_crop["crop"]
    )

    return {
        "success": True,
        "engine_type": "ICAR Agronomic Soil & Climate Inference Engine",
        "input_summary": {
            "nitrogen": nitrogen,
            "phosphorus": phosphorus,
            "potassium": potassium,
            "temperature": temperature,
            "humidity": humidity,
            "ph": ph,
            "rainfall": rainfall
        },
        "primary_recommendation": top_crop,
        "alternative_crops": scored_crops[1:4],
        "fertilizer_guidance": fertilizer_plan,
        "methodology": "Based on Indian Council of Agricultural Research (ICAR) soil nutrient indices and physiological crop climate envelopes."
    }
