/**
 * Calculate nutrition values for a given number of grams,
 * scaling from per-100g values.
 */
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

/**
 * Map of known nutrient name variants (lowercase) to internal field names.
 */
const NUTRIENT_MAP = {
  // German
  'energie': 'energyKcal',
  'kilojoule': 'energyKj',
  'fett': 'fat',
  'davon gesättigte fettensäuren': 'saturatedFat',
  'kohlenhydrate': 'carbohydrates',
  'davon zucker': 'sugars',
  'ballaststoffe': 'fiber',
  'eiweiß': 'protein',
  'salz': 'salt',
  // French
  'énergie': 'energyKcal',
  'matières grasses': 'fat',
  'dont acides gras saturés': 'saturatedFat',
  'glucides': 'carbohydrates',
  'dont sucres': 'sugars',
  'fibres alimentaires': 'fiber',
  'protéines': 'protein',
  'sel': 'salt',
  // Dutch
  'energie': 'energyKcal',
  'vetten': 'fat',
  'waarvan verzadigde vetzuren': 'saturatedFat',
  'koolhydraten': 'carbohydrates',
  'waarvan suikers': 'sugars',
  'vezels': 'fiber',
  'eiwitten': 'protein',
  'zout': 'salt',
  // Italian
  'energia': 'energyKcal',
  'grassi': 'fat',
  'di cui acidi grassi saturi': 'saturatedFat',
  'carboidrati': 'carbohydrates',
  'di cui zuccheri': 'sugars',
  'fibra': 'fiber',
  'proteine': 'protein',
  'sale': 'salt',
  // English
  'energy': 'energyKcal',
  'kilojoules': 'energyKj',
  'fat': 'fat',
  'saturated fat': 'saturatedFat',
  'carbohydrates': 'carbohydrates',
  'sugars': 'sugars',
  'fiber': 'fiber',
  'protein': 'protein',
  'salt': 'salt',
};

/**
 * Normalize a nutrient name to the internal field name.
 *
 * @param {string} name - Nutrient name (e.g. "Energy", "Fett", "protein")
 * @returns {string} Normalized field name (e.g. "energyKcal", "fat", "protein")
 */
export function normalizeNutrientName(name) {
  const lowerName = name.toLowerCase().trim();
  if (NUTRIENT_MAP[lowerName]) {
    return NUTRIENT_MAP[lowerName];
  }
  // If no mapping found, return the lowercase name as-is
  return lowerName;
}