from flask import Flask, request, render_template, send_file
import re
import os
from io import BytesIO

app = Flask(__name__)

# Constants

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
    for category in TRANSPORT_FACTORS.values():
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
    plastic_factor = PLASTIC_FACTORS.get(plastic_type.upper(), None)
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

    for mode in flatten_transport_factors().keys():
        patterns = [
            rf"{mode}.*?(\d+(\.\d+)?)\s*(km|kilometers?)",
            rf"(\d+(\.\d+)?)\s*(km|kilometers?)\s*(on|in|through|by)?\s*{mode}",
            rf"(rode|used|took|travelled|drove|drive).*?{mode}.*?(\d+(\.\d+)?)\s*(km|kilometers?)"
        ]
        for pattern in patterns:
            for match in re.finditer(pattern, user_input):
                num = extract_number(match.groups())
                transport_data[mode] = transport_data.get(mode, 0) + num

    for match in re.finditer(r"(electricity|power|consumed|used).*?(\d+(\.\d+)?)\s*(kwh|kilowatt-hours?)", user_input):
        electricity_kwh += extract_number(match.groups())

    for item in FOOD_FACTORS:
        matched = False
        patterns = [
            rf"{item}.*?(\d+(\.\d+)?)\s*(kg|kgs|liter|litre|liters|l)?",
            rf"(\d+(\.\d+)?)\s*(kg|kgs|liter|litre|liters|l)?\s*(of\s)?{item}",
            rf"(ate|had|consumed|ordered|bought).*?(\d+(\.\d+)?)\s*(kg|kgs|liter|litre|liters|l)?\s*{item}"
        ]
        for pattern in patterns:
            for match in re.finditer(pattern, user_input):
                num = extract_number(match.groups())
                food_data[item] = food_data.get(item, 0) + num
                matched = True
        if matched:
            continue

    for pattern in [r"spent.*?(\d+)\s*rs.*?(clothes|gadgets|groceries)?", r"(bought|purchased).*?(clothes|gadgets|groceries).*?(\d+)\s*rs"]:
        for match in re.finditer(pattern, user_input):
            if "spent" in match.group(0):
                shopping_spend += int(match.group(1))
                if match.group(2):
                    shopping_type = match.group(2)
            else:
                shopping_type = match.group(2)
                shopping_spend += int(match.group(3))

    for match in re.finditer(r"(flew|flight|travelled|went).*?(\d+(\.\d+)?)\s*(km|kilometers?).*?(business|economy|domestic|international)?", user_input):
        flight_km += extract_number(match.groups())
        for word in match.groups():
            if word in ["business", "economy", "domestic", "international"]:
                flight_type = word

    for pattern in [
        r"(tap|bottled)?\s*water.*?(\d+(\.\d+)?)\s*(liters|litres|liter|litre|l)",
        r"(drank|used|consumed).*?(\d+(\.\d+)?)\s*(liters|litres|liter|litre|l)\s*(tap|bottled)?\s*water"
    ]:
        for match in re.finditer(pattern, user_input):
            num = extract_number(match.groups())
            water_liters += num
            if "bottled" in match.groups():
                water_type = "bottled"
            elif "tap" in match.groups():
                water_type = "tap"

    for pattern in [
        r"(pet|hdpe|pvc)?\s*plastic.*?(\d+(\.\d+)?)\s*(kg|kgs)?",
        r"(\d+(\.\d+)?)\s*(kg|kgs)?\s*(of\s)?(pet|hdpe|pvc)?\s*plastic",
        r"(used|had|bought).*?(\d+(\.\d+)?)\s*(kg|kgs)?\s*(pet|hdpe|pvc)?\s*plastic"
    ]:
        for match in re.finditer(pattern, user_input):
            num = extract_number(match.groups())
            if num:
                plastic_kg = num
            for word in match.groups():
                if word and word.upper() in ["PET", "HDPE", "PVC"]:
                    plastic_type = word.upper()

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