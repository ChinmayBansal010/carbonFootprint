from flask import Flask, request, render_template, send_file
import re
import os
import requests
import json
from io import BytesIO

app = Flask(__name__)

# HF_TOKEN = os.getenv("HF_TOKEN")
HF_TOKEN = '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'
HF_MODEL = "mistralai/Mistral-7B-Instruct-v0.1"

TRANSPORT_FACTORS = {
    "personal": {
        "car": 0.12,
        "bike": 0.08,
        "electric_car": 0.04,
        "electric_scooter": 0.02,
        "bicycle": 0.0,
        "walk": 0.0
    },
    "public": {
        "bus": 0.06,
        "metro": 0.04,
        "train": 0.05,
        "diesel_train": 0.07,
        "auto": 0.09,
        "cab": 0.13,
        "e_rickshaw": 0.01
    },
    "air": {
        "flight_domestic": 0.18,
        "flight_international": 0.22
    }
}

SHOPPING_FACTORS = {
    "clothes": 2.0,
    "gadgets": 6.0,
    "groceries": 1.2
}

WATER_FACTORS = {
    "tap": 0.25,
    "bottled": 1.5
}

PLASTIC_FACTORS = {
    "PET": 6.0,
    "HDPE": 4.0,
    "PVC": 5.0
}

FOOD_FACTORS = {
    "meat": 7.0,
    "beef": 60.0,
    "lamb": 24.0,
    "chicken": 6.0,
    "fish": 5.0,
    "egg": 4.5,
    "milk": 3.0,
    "paneer": 4.0,
    "cheese": 10.0,
    "rice": 2.5,
    "wheat": 1.3,
    "vegetables": 0.5,
    "fruits": 0.4,
    "vegan": 1.2,
    "junk": 7.0,
    "processed": 8.0
}

# Utility
def flatten_transport_factors():
    all_factors = {}
    for key, category in TRANSPORT_FACTORS.items():
        all_factors.update(category)
    return all_factors

# Main Calculation
def calculate_carbon(
    transport_data={},               # e.g., {"car": 10, "metro": 5}
    electricity_kwh=0,
    food_data={},                    # e.g., {"chicken": 0.4, "milk": 1.0}
    shopping_spend=0,
    shopping_type="clothes",
    flight_km=0,
    flight_type="domestic",         # renamed from flight_class
    water_liters=0,
    water_type="tap",
    plastic_kg=0,
    plastic_type="PET"
):
    result = {}
    total = 0
    unknowns = {"food": [], "plastic": []}

    # 🚗 Transport
    all_transport = flatten_transport_factors()
    transport_emissions = 0
    transport_details = {}

    for mode, km in transport_data.items():
        factor = all_transport.get(mode.lower(), 0)
        emission = round(km * factor, 2)
        transport_details[mode] = emission
        transport_emissions += emission

    result["transport_details"] = transport_details
    result["transport_total"] = round(transport_emissions, 2)
    total += transport_emissions

    # ⚡ Electricity
    elec_emission = round(electricity_kwh * 0.7, 2)
    result["electricity_kwh"] = elec_emission
    total += elec_emission

    # 🥩 Food
    food_emissions = 0
    food_breakdown = {}
    for item, qty in food_data.items():
        item_lower = item.lower()
        factor = FOOD_FACTORS.get(item_lower, None)
        if factor is None:
            unknowns["food"].append(item)
            factor = 5.0
        emission = round(qty * factor, 2)
        food_breakdown[item] = emission
        food_emissions += emission

    result["food_details"] = food_breakdown
    result["food_total"] = round(food_emissions, 2)
    total += food_emissions

    # 🛒 Shopping
    shop_factor = SHOPPING_FACTORS.get(shopping_type.lower(), 1.5)
    shop_emission = round((shopping_spend / 100) * shop_factor, 2)
    result["shopping_spend"] = shop_emission
    total += shop_emission

    # ✈️ Flights
    if flight_km > 0 and flight_type:
        key = "flight_" + flight_type.lower()
        air_factor = TRANSPORT_FACTORS["air"].get(key, 0.18)
        flight_emission = round(flight_km * air_factor, 2)
        result["flight_km"] = flight_emission
        total += flight_emission

    # 🚿 Water
    water_factor = WATER_FACTORS.get(water_type.lower(), 0.25)
    water_emission = round((water_liters / 100) * water_factor, 2)
    result["water_liters"] = water_emission
    total += water_emission

    # 🧴 Plastic
    plastic_type = plastic_type.upper()
    plastic_factor = PLASTIC_FACTORS.get(plastic_type, None)
    if plastic_factor is None:
        unknowns["plastic"].append(plastic_type)
        plastic_factor = 5.0
    plastic_emission = round(plastic_kg * plastic_factor, 2)
    result["plastic_kg"] = plastic_emission
    total += plastic_emission

    # 📊 Category Breakdown
    if total > 0:
        result["category_percentages"] = {
            "transport": round(transport_emissions / total * 100, 1),
            "electricity": round(elec_emission / total * 100, 1),
            "food": round(food_emissions / total * 100, 1),
            "shopping": round(shop_emission / total * 100, 1),
            "flight": round(flight_emission / total * 100, 1) if flight_km else 0.0,
            "water": round(water_emission / total * 100, 1),
            "plastic": round(plastic_emission / total * 100, 1)
        }

    # 🌍 Final Total
    result["total_emission"] = round(total, 2)
    result["unknown_inputs"] = unknowns
    return result

def extract_number(groups):
    for g in groups:
        if g and re.match(r"^\d+(\.\d+)?$", g):
            return float(g)
    return 0

def parse_input_to_data(user_input):
    import re
    user_input = user_input.lower()
    transport_data = {}
    food_data = {}
    electricity_kwh = 0
    shopping_spend = 0
    shopping_type = "clothes"
    flight_km = 0
    flight_type = "domestic"
    water_liters = 0
    water_type = "tap"
    plastic_kg = 0
    plastic_type = "PET"

    aliases = {
        "scooty": "electric_scooter",
        "scooter": "electric_scooter",
        "bike": "bike",
        "ev": "electric_car",
        "electric bike": "electric_bike",
        "metro train": "metro",
        "cab": "cab",
        "rickshaw": "auto",
        "auto rickshaw": "auto",
        "train": "train",
        "aeroplane": "flight",
        "airplane": "flight",
        "cycle": "bicycle",
        "walked": "walk",
        "e-car": "electric_car",
        "e-bike": "electric_bike",
    }

    def convert_to_standard(num, unit):
        if num is None:
            return 0
        try:
            value = float(num)
        except ValueError:
            return 0
        if not unit:
            return value
        unit = unit.lower()
        if unit in ["g", "gram", "grams"]:
            return value / 1000
        elif unit in ["ml", "milliliter", "milliliters"]:
            return value / 1000
        elif unit in ["kg", "kgs", "kilogram", "kilograms"]:
            return value
        elif unit in ["l", "liters", "litres", "liter"]:
            return value
        elif unit in ["km", "kilometers", "kilometres"]:
            return value
        elif unit == "miles":
            return value * 1.60934
        return value

    # Replace aliases first to normalize terms
    for alias, replacement in aliases.items():
        user_input = re.sub(rf"\b{re.escape(alias)}\b", replacement, user_input)

    # --- TRANSPORT PATTERNS ---
    transport_factors = flatten_transport_factors()
    for mode in transport_factors.keys():
        patterns = [
            rf"{mode}.*?(\d+(\.\d+)?)\s*(km|kilometers?|miles)",
            rf"(\d+(\.\d+)?)\s*(km|kilometers?|miles).*?{mode}",
            rf"(rode|used|took|travelled|drove|drive|commuted|covered|went by|on a|cycled).*?{mode}.*?(\d+(\.\d+)?)\s*(km|kilometers?|miles)",
            rf"distance.*?(\d+(\.\d+)?)\s*(km|kilometers?|miles).*?{mode}",
            rf"i.*?{mode}.*?(\d+(\.\d+)?)\s*(km|kilometers?|miles)",
            rf"{mode}.*?(covered|went|ran|moved|trip|journey|ride|travelled).*?(\d+(\.\d+)?)\s*(km|kilometers?|miles)",
            rf"{mode}.*?(\d+(\.\d+)?)(km|kilometers?|miles).*?(ride|travel)?",
            rf"{mode}.*?(commuted|traveled|used).*?(\d+(\.\d+)?)\s*(km|kilometers?|miles)",
            rf"drove\s+(\d+(\.\d+)?)\s*(km|kilometers?|miles)\s+in\s+a\s+{mode}",
            rf"used\s+a\s+{mode}\s+for\s+(\d+(\.\d+)?)\s*(km|kilometers?|miles)",
            rf"travelled\s+by\s+{mode}\s+for\s+(\d+(\.\d+)?)\s*(km|kilometers?|miles)",
            rf"{mode}.*?distance\s+of\s+(\d+(\.\d+)?)\s*(km|kilometers?|miles)",
        ]
        for pattern in patterns:
            for match in re.finditer(pattern, user_input):
                groups = match.groups()
                num = next((g for g in groups if g and re.match(r"\d+(\.\d+)?", g)), None)
                unit = next((g for g in groups if g and g.lower() in ["km", "kilometers", "miles"]), None)
                if num and unit:
                    km = convert_to_standard(num, unit)
                    transport_data[mode] = transport_data.get(mode, 0) + km

    # --- ELECTRICITY PATTERNS ---
    electricity_patterns = [
        r"(\d+(\.\d+)?)\s*(kwh|kilowatt-hours?)",
        r"(used|consumed|used up).*?(\d+(\.\d+)?)\s*(kwh|kilowatt-hours?)",
        r"electricity.*?(\d+(\.\d+)?)\s*(kwh|kilowatt-hours?)",
        r"(\d+(\.\d+)?)\s*(kwh|kilowatt-hours?)\s*used",
        r"used\s+(\d+(\.\d+)?)\s*(units|kwh|kilowatt-hours?)\s*of\s*electricity",
    ]
    for pattern in electricity_patterns:
        for match in re.finditer(pattern, user_input):
            groups = match.groups()
            num = next((g for g in groups if g and re.match(r"\d+(\.\d+)?", g)), None)
            if num:
                electricity_kwh += convert_to_standard(num, "kwh")

    # --- FOOD PATTERNS ---
    for item in FOOD_FACTORS:
        patterns = [
            rf"(\d+(\.\d+)?).*?(kg|kgs|g|gram|grams|l|liters?|litres?|ml|milliliter|milliliters).*?{item}",
            rf"{item}.*?(\d+(\.\d+)?).*?(kg|kgs|g|gram|grams|l|liters?|litres?|ml|milliliters)",
            rf"ate.*?{item}.*?(\d+(\.\d+)?).*?(g|kg|l|ml)",
            rf"{item}.*?(amount|weighed|measured|totaled).*?(\d+(\.\d+)?).*?(g|kg|l|ml)",
            rf"consumed.*?(\d+(\.\d+)?).*?(g|kg|l|ml).*?{item}",
            rf"drank.*?(\d+(\.\d+)?).*?(ml|l|liters?)\s+of\s+{item}",
            rf"{item}.*?(quantity|amount|weight).*?(\d+(\.\d+)?).*?(g|kg|l|ml)",
            rf"{item}.*?(had|took|used).*?(\d+(\.\d+)?)\s*(g|kg|l|ml)",
            rf"{item}.*?(\d+(\.\d+)?)\s*(g|kg|l|ml)",
            rf"(\d+(\.\d+)?)\s*(g|kg|l|ml)\s*of\s*{item}",
        ]
        for pattern in patterns:
            for match in re.finditer(pattern, user_input):
                groups = match.groups()
                num = next((g for g in groups if g and re.match(r"\d+(\.\d+)?", g)), None)
                unit = next((g for g in groups if g and g.lower() in ["kg", "kgs", "g", "gram", "grams", "l", "liters", "litres", "ml", "milliliters"]), None)
                if num and unit:
                    value = convert_to_standard(num, unit)
                    food_data[item] = food_data.get(item, 0) + value

    # --- SHOPPING PATTERNS ---
    shopping_patterns = [
        r"(\d+)\s*rs.*?(clothes|gadgets|groceries)",
        r"spent\s*(\d+)\s*rs on (clothes|gadgets|groceries)",
        r"(clothes|gadgets|groceries).*?purchase.*?(\d+)\s*rs",
        r"bought\s*(clothes|gadgets|groceries)?\s*for\s*(\d+)\s*rs",
        r"purchased\s*(clothes|gadgets|groceries)?\s*worth\s*(\d+)\s*rs",
        r"shopping.*?(\d+)\s*rs",
    ]
    for pattern in shopping_patterns:
        for match in re.finditer(pattern, user_input):
            groups = match.groups()
            # Try to find numbers and category in groups
            for g in groups:
                if g and g.isdigit():
                    shopping_spend += int(g)
                elif g in SHOPPING_FACTORS:
                    shopping_type = g

    # --- FLIGHT PATTERNS ---
    flight_patterns = [
        r"(took|had|used|went on|travelled by)?\s*(a)?\s*(domestic|international|business|economy)?\s*flight.*?(\d+(\.\d+)?)\s*(km|kilometers?|miles)",
        r"flight.*?(domestic|international|business|economy)?.*?(\d+(\.\d+)?)\s*(km|kilometers?|miles)",
        r"flew\s*(domestic|international|business|economy)?\s*(\d+(\.\d+)?)\s*(km|kilometers?|miles)",
        r"(\d+(\.\d+)?)\s*(km|kilometers?|miles)\s*(flight|flight distance|flight km|flown)",
    ]
    for pattern in flight_patterns:
        for match in re.finditer(pattern, user_input):
            groups = match.groups()
            ftype = None
            distance = None
            unit = None
            # Extract flight_type & distance/unit
            for g in groups:
                if g in ["domestic", "international", "business", "economy"]:
                    ftype = g
                elif g and re.match(r"\d+(\.\d+)?", str(g)):
                    distance = g
                elif g and g.lower() in ["km", "kilometers", "miles"]:
                    unit = g
            if ftype:
                flight_type = ftype
            if distance and unit:
                flight_km += convert_to_standard(distance, unit)

    # --- WATER PATTERNS ---
    water_patterns = [
        r"(\d+(\.\d+)?)\s*(liters?|litres?|l|ml).*?water.*?(tap|bottled)?",
        r"(tap|bottled).*?water.*?(\d+(\.\d+)?)\s*(liters?|litres?|l|ml)",
        r"drank\s*(\d+(\.\d+)?)\s*(liters?|litres?|l|ml)\s*of\s*(tap|bottled)?\s*water",
        r"used\s*(\d+(\.\d+)?)\s*(liters?|litres?|l|ml)\s*water",
    ]
    for pattern in water_patterns:
        for match in re.finditer(pattern, user_input):
            groups = match.groups()
            num = next((g for g in groups if g and re.match(r"\d+(\.\d+)?", str(g))), None)
            unit = next((g for g in groups if g and g.lower() in ["liters", "litres", "l", "ml"]), None)
            wtype = next((g for g in groups if g in ["tap", "bottled"]), None)
            if wtype:
                water_type = wtype
            if num and unit:
                water_liters += convert_to_standard(num, unit)

    # --- PLASTIC PATTERNS ---
    plastic_patterns = [
        r"(\d+(\.\d+)?)\s*(kg|g|gram|grams).*?plastic.*?(pet|hdpe|pvc)?",
        r"plastic.*?(pet|hdpe|pvc)?.*?(\d+(\.\d+)?)\s*(kg|g|gram|grams)",
        r"used\s*(\d+(\.\d+)?)\s*(kg|g|gram|grams)\s*of\s*(pet|hdpe|pvc)?\s*plastic",
    ]
    for pattern in plastic_patterns:
        for match in re.finditer(pattern, user_input):
            groups = match.groups()
            num = next((g for g in groups if g and re.match(r"\d+(\.\d+)?", str(g))), None)
            unit = next((g for g in groups if g and g.lower() in ["kg", "g", "gram", "grams"]), None)
            ptype = next((g for g in groups if g and g.upper() in ["PET", "HDPE", "PVC"]), None)
            if ptype:
                plastic_type = ptype.upper()
            if num and unit:
                plastic_kg += convert_to_standard(num, unit)

    # Debug prints (optional)
    print("🚗 Transport Data:", transport_data)
    print("⚡ Electricity (kWh):", electricity_kwh)
    print("🥩 Food Data:", food_data)
    print("🛒 Shopping Spend:", shopping_spend)
    print("✈️ Flight KM:", flight_km)
    print("🛫 Flight Type:", flight_type)
    print("💧 Water (liters):", water_liters)
    print("🧴 Plastic (kg):", plastic_kg)
    print("🧴 Plastic Type:", plastic_type)

    return calculate_carbon(
        transport_data=transport_data,
        electricity_kwh=electricity_kwh,
        food_data=food_data,
        shopping_spend=shopping_spend,
        shopping_type=shopping_type,
        flight_km=flight_km,
        flight_type=flight_type,
        water_liters=water_liters,
        water_type=water_type,
        plastic_kg=plastic_kg,
        plastic_type=plastic_type
    )



@app.route('/', methods=['GET', 'POST'])
def index():
    result = None
    user_input = ""
    if request.method == 'POST':
        user_input = request.form.get("user_input", "")
        if user_input.strip():
            result = parse_input_to_data(user_input)
    return render_template("index.html", result=result, user_input=user_input)

@app.route('/download-report', methods=['POST'])
def download_report():
    user_input = request.form.get("user_input", "")
    result = parse_input_to_data(user_input)
    summary = f"""
Total Emissions: {result['total_emission']} kg CO₂
Breakdown:
Transport: {result['transport_total']} kg
Electricity: {result['electricity_kwh']} kg
Food: {result['food_total']} kg
Shopping: {result['shopping_spend']} kg
Flight: {result.get('flight_km', 0)} kg
Water: {result['water_liters']} kg
Plastic: {result['plastic_kg']} kg
"""
    buffer = BytesIO()
    buffer.write(summary.encode())
    buffer.seek(0)
    return send_file(buffer, as_attachment=True, download_name="carbon_summary.txt", mimetype='text/plain')

if __name__ == '__main__':
    app.run(host="0.0.0.0", port=int(os.environ.get("PORT", 5000)))