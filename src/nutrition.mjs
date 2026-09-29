const NUTRIENT_MAP = {
  // energyKcal
  'energy': 'energyKcal',
  'energie': 'energyKcal',
  'énergie': 'energyKcal',
  'energia': 'energyKcal',
  // energyKj
  'energykj': 'energyKj',
  'energy kj': 'energyKj',
  'kilojoule': 'energyKj',
  'kilojoules': 'energyKj',
  'kilojoule': 'energyKj',
  'kj': 'energyKj',
  // fat
  'fat': 'fat',
  'fett': 'fat',
  'matières grasses': 'fat',
  'vetten': 'fat',
  'grassi': 'fat',
  // saturatedFat
  'saturated fat': 'saturatedFat',
  'davon gesättigte fettsäuren': 'saturatedFat',
  'dont acides gras saturés': 'saturatedFat',
  'waarvan verzadigde vetzuren': 'saturatedFat',
  'di cui acidi grassi saturi': 'saturatedFat',
  'saturated fat': 'saturatedFat',
  // carbohydrates
  'carbohydrates': 'carbohydrates',
  'kohlenhydrate': 'carbohydrates',
  'glucides': 'carbohydrates',
  'koolhydraten': 'carbohydrates',
  'carboidrati': 'carbohydrates',
  // sugars
  'sugars': 'sugars',
  'davon zucker': 'sugars',
  'dont sucres': 'sugars',
  'waarvan suikers': 'sugars',
  'di cui zuccheri': 'sugars',
  // fiber
  'fiber': 'fiber',
  'ballaststoffe': 'fiber',
  'fibres alimentaires': 'fiber',
  'vezels': 'fiber',
  'fibra': 'fiber',
  'fibres': 'fiber',
  // protein
  'protein': 'protein',
  'eiweiß': 'protein',
  'protéines': 'protein',
  'eiwitten': 'protein',
  'proteine': 'protein',
  // salt
  'salt': 'salt',
  'salz': 'salt',
  'sel': 'salt',
  'zout': 'salt',
  'sale': 'salt',
};

export function calculateNutritionForGrams(nutritionPer100g, grams) {
  const factor = grams / 100;
  return {
    energyKcal: nutritionPer100g.energyKcal * factor,
    energyKj: nutritionPer100g.energyKj * factor,
    fat: nutritionPer100g.fat * factor,
    saturatedFat: nutritionPer100g.saturatedFat * factor,
    carbohydrates: nutritionPer100g.carbohydrates * factor,
    sugars: nutritionPer100g.sugars * factor,
    fiber: nutritionPer100g.fiber * factor,
    protein: nutritionPer100g.protein * factor,
    salt: nutritionPer100g.salt * factor,
  };
}

export function normalizeNutrientName(name) {
  const lowerName = name.toLowerCase().trim();
  if (NUTRIENT_MAP[lowerName]) {
    return NUTRIENT_MAP[lowerName];
  }
  // Try partial matching for compound names
  for (const [key, value] of Object.entries(NUTRIENT_MAP)) {
    if (lowerName.includes(key) || key.includes(lowerName)) {
      return value;
    }
  }
  return lowerName;
}