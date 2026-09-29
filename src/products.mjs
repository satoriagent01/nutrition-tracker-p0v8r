/**
 * Products module - create products from scan or manually, get by id.
 */

import { calculateNutritionForGrams } from './nutrition.mjs';

/** In-memory product store (in production this would use storage.mjs) */
const products = new Map();

/** Simple UUID v4 generator without external dependencies */
function generateId() {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0;
    const v = c === 'x' ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
}

/**
 * Create a product from scan data.
 *
 * @param {string} name - Product name
 * @param {string} brand - Brand name
 * @param {number} servingSizeGrams - Serving size in grams
 * @param {Object} nutrition - Nutrition per 100g
 * @param {string} [imageUrl] - Base64 image URL (optional)
 * @returns {Object} The created product
 */
export function createProductFromScan(name, brand, servingSizeGrams, nutrition, imageUrl) {
  const id = generateId();
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

/**
 * Create a manual product (same structure as scan but no imageUrl).
 *
 * @param {string} name - Product name
 * @param {string} brand - Brand name
 * @param {number} servingSizeGrams - Serving size in grams
 * @param {Object} nutrition - Nutrition per 100g
 * @returns {Object} The created product
 */
export function createManualProduct(name, brand, servingSizeGrams, nutrition) {
  return createProductFromScan(name, brand, servingSizeGrams, nutrition, undefined);
}

/**
 * Get a product by its ID.
 *
 * @param {string} productId - Product ID
 * @returns {Object|undefined} The product or undefined
 */
export function getProductById(productId) {
  return products.get(productId);
}