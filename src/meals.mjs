/**
 * Meals module - create meals, add entries, get total nutrition for date.
 */

/** In-memory meal store */
const meals = new Map();

/** Simple UUID v4 generator without external dependencies */
function generateId() {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0;
    const v = c === 'x' ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
}

/**
 * Create a meal.
 *
 * @param {string} name - Meal name
 * @param {string} date - Date string (YYYY-MM-DD)
 * @returns {Object} The created meal
 */
export function createMeal(name, date) {
  const id = generateId();
  const createdAt = new Date().toISOString();

  const meal = {
    id,
    name,
    date,
    entries: [],
    createdAt,
  };

  meals.set(id, meal);
  return meal;
}

/**
 * Add an entry to a meal.
 *
 * @param {string} mealId - Meal ID
 * @param {Object} entry - Entry object with product info and nutrition
 * @returns {Object} The updated meal
 */
export function addEntryToMeal(mealId, entry) {
  const meal = meals.get(mealId);
  if (!meal) {
    throw new Error(`Meal with id ${mealId} not found`);
  }

  meal.entries.push(entry);
  return meal;
}

/**
 * Get a meal by its ID.
 *
 * @param {string} mealId - Meal ID
 * @returns {Object|undefined} The meal or undefined
 */
export function getMealById(mealId) {
  return meals.get(mealId);
}

/**
 * Get total nutrition for all meals on a given date.
 *
 * @param {string} date - Date string (YYYY-MM-DD)
 * @returns {Object} Total nutrition values
 */
export function getTotalNutritionForDate(date) {
  let total = {
    energyKcal: 0,
    energyKj: 0,
    fat: 0,
    saturatedFat: 0,
    carbohydrates: 0,
    sugars: 0,
    fiber: 0,
    protein: 0,
    salt: 0,
  };

  for (const meal of meals.values()) {
    if (meal.date === date) {
      for (const entry of meal.entries) {
        const n = entry.nutrition || {};
        total.energyKcal += n.energyKcal || 0;
        total.energyKj += n.energyKj || 0;
        total.fat += n.fat || 0;
        total.saturatedFat += n.saturatedFat || 0;
        total.carbohydrates += n.carbohydrates || 0;
        total.sugars += n.sugars || 0;
        total.fiber += n.fiber || 0;
        total.protein += n.protein || 0;
        total.salt += n.salt || 0;
      }
    }
  }

  return total;
}