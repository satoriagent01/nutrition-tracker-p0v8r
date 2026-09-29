import { v4 as uuidv4 } from 'uuid';

// In-memory product store (in production this would use storage.mjs)
const products = new Map();

export function createProductFromScan(name, brand, servingSizeGrams, nutrition, imageUrl) {
  const id = uuidv4();
  const createdAt = new Date().toISOString();
  
  // Calculate nutritionPerServing from nutritionPer100g
  const factor = servingSizeGrams / 100;
  const nutritionPerServing = {
    energyKcal: nutrition.energyKcal * factor,
    energyKj: nutrition.energyKj * factor,
    fat: nutrition.fat * factor,
    saturatedFat: nutrition.saturatedFat * factor,
    carbohydrates: nutrition.carbohydrates * factor,
    sugars: nutrition.sugars * factor,
    fiber: nutrition.fiber * factor,
    protein: nutrition.protein * factor,
    salt: nutrition.salt * factor,
  };

  const product = {
    id,
    name,
    brand,
    servingSizeGrams,
    nutritionPer100g: { ...nutrition },
    nutritionPerServing,
    imageUrl,
    createdAt,
  };

  products.set(id, product);
  return product;
}

export function createManualProduct(name, brand, servingSizeGrams, nutrition) {
  return createProductFromScan(name, brand, servingSizeGrams, nutrition);
}

export function getProductById(id) {
  return products.get(id);
}