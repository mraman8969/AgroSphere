import os
import json
import io
import numpy as np
from PIL import Image

# Global singleton states
_INTERPRETER = None
_INPUT_DETAILS = None
_OUTPUT_DETAILS = None
_CLASS_NAMES = []
_DISEASE_KB = {}
_CLASS_LABELS = []

BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
MODEL_PATH = os.path.join(BASE_DIR, "models", "crop_disease_model.tflite")
CLASSES_PATH = os.path.join(BASE_DIR, "models", "classes.json")
KB_PATH = os.path.join(BASE_DIR, "data", "disease_kb.json")
LABELS_PATH = os.path.join(BASE_DIR, "data", "class_labels.json")


def load_knowledge_base():
    """Loads disease knowledge base and multilingual class metadata."""
    global _CLASS_NAMES, _DISEASE_KB, _CLASS_LABELS
    if os.path.exists(CLASSES_PATH):
        try:
            with open(CLASSES_PATH, "r", encoding="utf-8") as f:
                _CLASS_NAMES = json.load(f)
        except Exception as e:
            print(f"[!] Warning reading classes.json: {e}")

    if not _CLASS_NAMES:
        _CLASS_NAMES = [
            "Pepper__bell___Bacterial_spot", "Pepper__bell___healthy",
            "Potato___Early_blight", "Potato___Late_blight", "Potato___healthy",
            "Tomato_Bacterial_spot", "Tomato_Early_blight", "Tomato_Late_blight",
            "Tomato_Leaf_Mold", "Tomato_Septoria_leaf_spot",
            "Tomato_Spider_mites_Two_spotted_spider_mite", "Tomato__Target_Spot",
            "Tomato__Tomato_YellowLeaf__Curl_Virus", "Tomato__Tomato_mosaic_virus",
            "Tomato_healthy"
        ]

    if os.path.exists(KB_PATH):
        try:
            with open(KB_PATH, "r", encoding="utf-8") as f:
                data = json.load(f)
                _DISEASE_KB = data.get("diseases", {})
        except Exception as e:
            print(f"[!] Warning reading disease_kb.json: {e}")

    if os.path.exists(LABELS_PATH):
        try:
            with open(LABELS_PATH, "r", encoding="utf-8") as f:
                data = json.load(f)
                _CLASS_LABELS = data.get("classes", [])
        except Exception as e:
            print(f"[!] Warning reading class_labels.json: {e}")


def get_class_names():
    """Returns the loaded list of class names."""
    if not _CLASS_NAMES:
        load_knowledge_base()
    return _CLASS_NAMES


def get_interpreter():
    """Initializes and returns the TensorFlow Lite Interpreter."""
    global _INTERPRETER, _INPUT_DETAILS, _OUTPUT_DETAILS
    if _INTERPRETER is not None:
        return _INTERPRETER

    load_knowledge_base()

    if not os.path.exists(MODEL_PATH):
        print(f"[!] Model file not found at: {MODEL_PATH}")
        return None

    try:
        from ai_edge_litert.interpreter import Interpreter
        interpreter = Interpreter(model_path=MODEL_PATH)
        interpreter.allocate_tensors()
        _INPUT_DETAILS = interpreter.get_input_details()
        _OUTPUT_DETAILS = interpreter.get_output_details()
        _INTERPRETER = interpreter
        print(f"[✓] EfficientNetB0 TFLite Model loaded successfully from {MODEL_PATH}")
        return _INTERPRETER
    except Exception as e:
        print(f"[!] Failed to load TFLite interpreter: {e}")
        return None


def preprocess_image(image_bytes: bytes) -> np.ndarray:
    """
    Preprocesses uploaded image bytes according to the EfficientNetB0 training pipeline:
    1. Reads PIL image and converts to RGB
    2. Resizes to (224, 224) using bilinear interpolation
    3. Converts to float32 NumPy array with range [0.0, 255.0]
    4. Expands dims to (1, 224, 224, 3)
    """
    image = Image.open(io.BytesIO(image_bytes))
    if image.mode != "RGB":
        image = image.convert("RGB")

    image = image.resize((224, 224), Image.Resampling.BILINEAR)
    img_array = np.array(image, dtype=np.float32)
    return np.expand_dims(img_array, axis=0)


# Extended targeted clinical knowledge for all 15 classes
_TARGETED_KB = {
    "pepper bell bacterial spot": {
        "name_en": "Pepper Bell Bacterial Spot",
        "name_hi": "शिमला मिर्च का जीवाणु धब्बा रोग",
        "name_mr": "ढोबळी मिरचीचा जिवाणूजन्य करपा",
        "crop": "Pepper Bell (शिमला मिर्च)",
        "pathogen": "Xanthomonas campestris pv. vesicatoria (Bacteria)",
        "spread_factors": "Warm, wet weather (24-30°C) with water splashing during rainfall or overhead irrigation.",
        "treatments": {
            "organic": [
                "Foliar spray of Copper Hydroxide (2g/L) mixed with 1% cow urine.",
                "Seed soaking in 50°C hot water for 25 minutes prior to sowing to kill seed-borne bacteria.",
                "Spray bio-control agent Pseudomonas fluorescens (5g/L water) every 10 days."
            ],
            "chemical": [
                "Spray Copper Oxychloride 50 WP @ 2.5 g/L combined with Streptocycline @ 1 g per 10 L of water.",
                "Apply Kasugamycin 3% SL @ 2 ml/L water if bacterial lesions spread rapidly."
            ],
            "cultural": [
                "Avoid overhead irrigation; use drip to prevent splashing bacteria.",
                "Eradicate nightshade weed hosts near the perimeter of the crop.",
                "Rotate with non-solanaceous crops (maize, pulses) for at least 2 seasons."
            ]
        }
    },
    "tomato septoria leaf spot": {
        "name_en": "Tomato Septoria Leaf Spot",
        "name_hi": "टमाटर का सेप्टोरिया पत्ता धब्बा",
        "name_mr": "टोमॅटोचा सेप्टोरिया पानांवरील ठिपके",
        "crop": "Tomato (टमाटर)",
        "pathogen": "Septoria lycopersici (Fungus)",
        "spread_factors": "Moderate temperatures (20-25°C) with extended leaf wetness and high relative humidity (>80%).",
        "treatments": {
            "organic": [
                "Foliar spray of 5% Neem Seed Kernel Extract (NSKE) or pure Neem Oil (5ml/L).",
                "Apply bio-fungicide Trichoderma harzianum @ 5g/L on foliage and root zone.",
                "Bordeaux Mixture (1%) foliar spray as an organic protective barrier."
            ],
            "chemical": [
                "Spray Chlorothalonil 75% WP @ 2 g/L or Mancozeb 75% WP @ 2.5 g/L on early symptoms.",
                "For active spreading, spray Azoxystrobin 18.2% + Difenoconazole 11.4% SC @ 1 ml/L water.",
                "Repeat fungicide application at 10-14 day intervals during rainy spells."
            ],
            "cultural": [
                "Prune bottom 12 inches of leaves to improve airflow and eliminate ground splash.",
                "Apply organic straw mulch around the base of tomato plants.",
                "Stake plants upright to keep foliage off the damp ground."
            ]
        }
    },
    "tomato bacterial spot": {
        "name_en": "Tomato Bacterial Spot",
        "name_hi": "टमाटर का जीवाणु धब्बा रोग",
        "name_mr": "टोमॅटोचा जिवाणूजन्य ठिपके रोग",
        "crop": "Tomato (टमाटर)",
        "pathogen": "Xanthomonas perforans / vesicatoria (Bacteria)",
        "spread_factors": "High humidity (>85%) and warm temperatures with splashing raindrops or overhead sprinkling.",
        "treatments": {
            "organic": [
                "Apply Copper Hydroxide @ 2g/L combined with organic fatty acid emulsifier.",
                "Foliar spray of bio-agent Bacillus subtilis @ 5g/L to outcompete pathogenic bacteria.",
                "Use certified disease-free seeds or hot water treat at 50°C for 25 minutes."
            ],
            "chemical": [
                "Spray Copper Oxychloride 50 WP (2.5 g/L) + Streptocycline (1 g in 10 L water).",
                "Kasugamycin 3% SL @ 2 ml/L water during overcast humid weather."
            ],
            "cultural": [
                "Do not handle or prune wet plants to prevent manual transmission.",
                "Sterilize pruning shears with 10% bleach solution between plant rows.",
                "Plow down plant residue immediately after harvest."
            ]
        }
    },
    "tomato leaf mold": {
        "name_en": "Tomato Leaf Mold",
        "name_hi": "टमाटर का पत्ती फफूंद रोग",
        "name_mr": "टोमॅटोचा पानांवरील बुरशीजन्य रोग",
        "crop": "Tomato (टमाटर)",
        "pathogen": "Passalora fulva (Fungus)",
        "spread_factors": "Polyhouse / greenhouse environment with high relative humidity (>85%) and temperature 22-26°C.",
        "treatments": {
            "organic": [
                "Spray Potassium Bicarbonate (3g/L) or baking soda solution to alter leaf surface pH.",
                "Apply bio-agent Trichoderma viride @ 5g/L water on leaf underside.",
                "Neem oil spray (5ml/L) as preventive anti-fungal coating."
            ],
            "chemical": [
                "Spray Difenoconazole 25% EC @ 1 ml/L or Hexaconazole 5% SC @ 2 ml/L.",
                "Prophylactic spray of Mancozeb 75% WP @ 2.5 g/L."
            ],
            "cultural": [
                "Increase ventilation and airflow in polyhouse to reduce humidity below 80%.",
                "Water strictly at root zone via drip lines; avoid wetting upper leaf canopy.",
                "Prune dense canopy to ensure sunlight reaches internal foliage."
            ]
        }
    },
    "tomato spider mites two spotted spider mite": {
        "name_en": "Tomato Two-Spotted Spider Mite",
        "name_hi": "टमाटर लाल मकड़ी कीट प्रकोप",
        "name_mr": "टोमॅटोवरील लाल कोळी कीड",
        "crop": "Tomato (टमाटर)",
        "pathogen": "Tetranychus urticae (Arachnid Pest)",
        "spread_factors": "Hot, dry, and dusty conditions (above 30°C with low humidity <50%).",
        "treatments": {
            "organic": [
                "Spray Wettable Sulfur 80% WP @ 3 g/L (do not mix with oil sprays).",
                "High-pressure clean water spray directed at the undersides of leaves to knock off mites and webbing.",
                "Spray Neem Oil (5-7 ml/L water) with liquid soap thoroughly wetting leaf undersides."
            ],
            "chemical": [
                "Spray Spiromesifen 22.9% SC (Oberon) @ 1 ml/L of water.",
                "Alternatively spray Abamectin 1.9% EC @ 0.75 ml/L water.",
                "Alternate acaricides with different modes of action to prevent rapid resistance."
            ],
            "cultural": [
                "Keep farm borders and access paths free of dusty weeds.",
                "Maintain overhead micro-sprinklers in arid spells to elevate ambient humidity.",
                "Remove and bag heavily infested leaf clusters immediately."
            ]
        }
    },
    "tomato target spot": {
        "name_en": "Tomato Target Spot",
        "name_hi": "टमाटर टारगेट स्पॉट (गोल धब्बा)",
        "name_mr": "टोमॅटोवरील टार्गेट स्पॉट रोग",
        "crop": "Tomato (टमाटर)",
        "pathogen": "Corynespora cassiicola (Fungus)",
        "spread_factors": "Warm (25-32°C) and humid weather with prolonged leaf moisture.",
        "treatments": {
            "organic": [
                "Bordeaux Mixture (1%) or Copper Oxychloride @ 2.5 g/L protective spray.",
                "Trichoderma harzianum @ 5 g/L foliar spray every 10 days.",
                "Spray Dashparni Ark (organic fermented botanical extract 10%) for fungal deterrence."
            ],
            "chemical": [
                "Spray Pyraclostrobin 20% WG @ 1 g/L or Azoxystrobin @ 1 ml/L.",
                "Mancozeb 75% WP @ 2.5 g/L as early preventative barrier."
            ],
            "cultural": [
                "Remove volunteer weeds and destroy infected plant debris.",
                "Maintain wider row spacing to facilitate rapid canopy drying."
            ]
        }
    },
    "tomato tomato yellowleaf curl virus": {
        "name_en": "Tomato Yellow Leaf Curl Virus (TYLCV)",
        "name_hi": "टमाटर पीला पत्ती मरोड़िया वायरस",
        "name_mr": "टोमॅटोचा पिवळा पर्णगुच्छ विषाणू",
        "crop": "Tomato (टमाटर)",
        "pathogen": "Begomovirus (Transmitted by Whitefly Bemisia tabaci)",
        "spread_factors": "High whitefly vector populations in warm, dry weather.",
        "treatments": {
            "organic": [
                "Install Yellow Sticky Traps @ 20 traps per acre to catch vector whiteflies.",
                "Spray 5% Neem Seed Kernel Extract (NSKE) or Fish Oil Rosin Soap (FOS) @ 5g/L.",
                "Cover nursery beds with 40-mesh insect netting for the first 30 days."
            ],
            "chemical": [
                "Vector management: Spray Imidacloprid 17.8% SL @ 0.5 ml/L or Thiamethoxam 25% WG @ 0.3 g/L.",
                "Spray Spirotetramat 11.01% + Imidacloprid 11.01% SC (Movento Energy) @ 1 ml/L if whitefly pressure is severe.",
                "Note: Viruses cannot be cured by chemicals; control the whitefly vector immediately."
            ],
            "cultural": [
                "Rogue out (uproot) and bury severely curled and stunted plants to prevent vector transmission.",
                "Plant barrier crops like maize, sorghum, or pearl millet (4 rows) around the tomato field border."
            ]
        }
    },
    "tomato tomato mosaic virus": {
        "name_en": "Tomato Mosaic Virus (ToMV)",
        "name_hi": "टमाटर मोज़ेक वायरस",
        "name_mr": "टोमॅटोचा मोझॅक विषाणू रोग",
        "crop": "Tomato (टमाटर)",
        "pathogen": "Tobamovirus (Mechanically transmitted by hands, tools, contaminated seed)",
        "spread_factors": "Direct physical contact, pruning tools, worker clothing, and contaminated soil debris.",
        "treatments": {
            "organic": [
                "Spray 10% non-fat dry milk solution before pruning (milk proteins neutralize mechanical virus particles).",
                "Seed soaking in 10% Trisodium Phosphate (TSP) solution for 30 minutes followed by thorough rinsing.",
                "Spray Panchagavya (3%) to enhance overall crop vigor and tolerance."
            ],
            "chemical": [
                "No direct virucides exist. Disinfect pruning tools with 20% skimmed milk or 0.5% bleach solution.",
                "Apply micro-nutrient foliar spray (Zinc + Boron) to alleviate chlorosis."
            ],
            "cultural": [
                "Wash hands thoroughly with soap before handling tomato seedlings.",
                "Prohibit tobacco use/smoking in the greenhouse or farm field (tobacco carries mosaic virus).",
                "Immediately pull out and burn infected mottled plants."
            ]
        }
    }
}


def enrich_prediction(class_name: str, confidence: float):
    """
    Enriches raw model output with treatment recommendations,
    multilingual names (English, Hindi, Marathi), and pathogen severity.
    """
    import re
    is_healthy = "healthy" in class_name.lower()
    
    # Normalize string: replace any sequence of underscores with a single space
    def normalize_key(s):
        return re.sub(r"[_\s]+", " ", (s or "").lower()).strip()

    target_norm = normalize_key(class_name)

    # Check targeted clinical knowledge base first
    targeted_entry = _TARGETED_KB.get(target_norm)

    # Find matching KB entry
    kb_data = None
    if not targeted_entry:
        for k, v in _DISEASE_KB.items():
            if normalize_key(k) == target_norm:
                kb_data = v
                break
        if not kb_data:
            for k, v in _DISEASE_KB.items():
                k_norm = normalize_key(k)
                if target_norm in k_norm or k_norm in target_norm:
                    kb_data = v
                    break

    # Find matching label entry for regional names
    label_info = None
    for item in _CLASS_LABELS:
        if normalize_key(item.get("key", "")) == target_norm:
            label_info = item
            break
    if not label_info:
        for item in _CLASS_LABELS:
            k_norm = normalize_key(item.get("key", ""))
            if target_norm in k_norm or k_norm in target_norm:
                label_info = item
                break

    # Parse clean names
    parts = re.split(r"[_\s]+", class_name.strip())
    crop = parts[0] if parts else "Crop"
    disease_suffix = " ".join(parts[1:]) if len(parts) > 1 else ("Healthy Leaf" if is_healthy else "Disease")
    clean_display = f"{crop} {disease_suffix}"

    # Determine severity based on confidence & pathogen
    if is_healthy:
        severity = "Healthy Crop"
        severity_code = "healthy"
        pathogen = "None (Healthy Foliage)"
        spread_factors = "No active foliar pathogens detected."
        treatments = {
            "organic": [
                "Maintain balanced nutrition with Farm Yard Manure (FYM) or Vermicompost.",
                "Preventive spraying of diluted Panchagavya (3%) once in 15 days to bolster natural plant immunity.",
                "Ensure proper soil aeration and organic mulching."
            ],
            "chemical": [
                "No chemical fungicides or bactericides required. Avoid unnecessary chemical exposure."
            ],
            "cultural": [
                "Conduct regular field scouting once a week.",
                "Maintain adequate plant spacing to allow sunlight penetration and air circulation.",
                "Adopt clean drip fertigation practices."
            ]
        }
    elif targeted_entry:
        severity = "Moderate - Action Recommended" if confidence > 0.80 else "Early Detection - Preventive Stage"
        severity_code = "moderate" if confidence > 0.80 else "early"
        pathogen = targeted_entry["pathogen"]
        spread_factors = targeted_entry["spread_factors"]
        treatments = targeted_entry["treatments"]
        crop = targeted_entry.get("crop", crop)
    else:
        if confidence > 0.80:
            severity = "Moderate - Action Recommended"
            severity_code = "moderate"
        else:
            severity = "Early Detection - Preventive Stage"
            severity_code = "early"

        treatments = {
            "organic": [
                "Foliar spray of Neem Oil (5ml/L water) with mild soap as preventive barrier.",
                "Apply bio-agent Trichoderma viride or Pseudomonas fluorescens (5g/L water) to soil and leaf canopy.",
                "Spray Cow Urine (Gomutra 10%) fermented with Dashparni Ark to enhance systemic immunity."
            ],
            "chemical": [
                "Apply prophylactic protective fungicide Mancozeb 75% WP @ 2.5 g/L of water.",
                "For active spreading lesions, consult extension agronomist for targeted bactericide or systemic triazole fungicide (e.g. Ridomil Gold @ 2.5 g/L)."
            ],
            "cultural": [
                "Prune and safely burn or bury infected lower leaves outside the field.",
                "Use drip irrigation instead of overhead sprinklers to minimize leaf wetness duration.",
                "Maintain 3-year crop rotation avoiding continuous Solanaceous plantings."
            ]
        }
        spread_factors = "Humid warm conditions (22-28°C) accompanied by frequent rains or morning dew."
        pathogen = "Fungal / Bacterial Plant Pathogen"

    if kb_data and not is_healthy and not targeted_entry:
        treatments = kb_data.get("treatments", treatments)
        spread_factors = kb_data.get("spread_factors", spread_factors)
        pathogen = kb_data.get("pathogen", pathogen)
        crop = kb_data.get("crop", crop)

    if targeted_entry:
        name_en = targeted_entry["name_en"]
        name_hi = targeted_entry["name_hi"]
        name_mr = targeted_entry["name_mr"]
    else:
        name_en = label_info.get("name_en") if label_info else (kb_data.get("name") if kb_data else clean_display)
        name_hi = label_info.get("name_hi") if label_info else (kb_data.get("hindi_name") if kb_data else clean_display)
        name_mr = label_info.get("name_mr") if label_info else (kb_data.get("marathi_name") if kb_data else clean_display)

    return {
        "is_healthy": is_healthy,
        "crop": crop,
        "name_en": name_en,
        "name_hi": name_hi,
        "name_mr": name_mr,
        "pathogen": pathogen,
        "severity": severity,
        "severity_code": severity_code,
        "spread_factors": spread_factors,
        "treatments": treatments
    }


def predict_disease(image_bytes: bytes):
    """Executes real neural inference using the EfficientNetB0 TFLite model."""
    interpreter = get_interpreter()
    if interpreter is None:
        raise RuntimeError("TFLite Model interpreter not available. Ensure crop_disease_model.tflite is present.")

    input_tensor = preprocess_image(image_bytes)

    # Set input tensor
    interpreter.set_tensor(_INPUT_DETAILS[0]["index"], input_tensor)
    interpreter.invoke()

    # Get raw logits/probabilities
    raw_output = interpreter.get_tensor(_OUTPUT_DETAILS[0]["index"])[0]
    probabilities = raw_output.astype(np.float32)

    # Apply softmax if needed
    if abs(float(np.sum(probabilities)) - 1.0) > 0.05:
        exp_preds = np.exp(probabilities - np.max(probabilities))
        probabilities = exp_preds / np.sum(exp_preds)

    class_idx = int(np.argmax(probabilities))
    confidence = float(probabilities[class_idx])
    class_name = _CLASS_NAMES[class_idx] if class_idx < len(_CLASS_NAMES) else f"Class_{class_idx}"

    # Top 3 predictions for diagnostic transparency
    top_indices = np.argsort(probabilities)[::-1][:min(3, len(probabilities))]
    top_predictions = []
    for idx in top_indices:
        name = _CLASS_NAMES[idx] if idx < len(_CLASS_NAMES) else f"Class_{idx}"
        clean_item_name = name.replace("___", " ").replace("__", " ").replace("_", " ")
        top_predictions.append({
            "class_index": int(idx),
            "class_name": clean_item_name,
            "raw_key": name,
            "confidence": round(float(probabilities[idx]) * 100.0, 2)
        })

    enrichment = enrich_prediction(class_name, confidence)

    return {
        "success": True,
        "model_type": "EfficientNetB0 (TensorFlow Lite)",
        "class_index": class_idx,
        "raw_class_name": class_name,
        "confidence_percentage": round(confidence * 100.0, 2),
        "confidence": round(confidence, 4),
        "top_predictions": top_predictions,
        **enrichment
    }
