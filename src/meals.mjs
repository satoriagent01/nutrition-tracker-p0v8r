import { v4 as uuidv4 } from 'uuid';

// In-memory meal store
const meals = new Map();

export function createMeal(name, date) {
  const id = uuidv4();
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

export function addEntryToMeal(mealId, entry) {
  const meal = meals.get(mealId);
  if (!meal) {
    throw new Error(`Meal with id ${mealId} not found`);
  }
  
  meal.entries.push(entry);
  return meal;
}

export function getMealById(mealId) {
  return meals.get(mealId);
}

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
        const n = entry.nutrition;
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