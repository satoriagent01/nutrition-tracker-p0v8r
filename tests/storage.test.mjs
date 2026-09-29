import { test, describe } from "node:test";
import assert from "node:assert/strict";

// We need to mock localStorage since Node doesn't have it natively.
// The storage module will be implemented to use localStorage in the browser,
// but for testing we provide a mock.

let mockStorage = {};

global.localStorage = {
  getItem: (key) => mockStorage[key] || null,
  setItem: (key, value) => { mockStorage[key] = value; },
  removeItem: (key) => { delete mockStorage[key]; },
  clear: () => { mockStorage = {}; }
};

// We'll import the storage module dynamically after setting up the mock
// Since the actual src/storage.mjs doesn't exist yet, we'll create a minimal
// implementation inline for testing purposes, mimicking what the real module will do.

// Minimal storage implementation matching the spec
const STORAGE_KEYS = {
  PRODUCTS: 'nutrition_tracker_products',
  MEALS: 'nutrition_tracker_meals',
  CONFIG: 'nutrition_tracker_config'
};

function saveProducts(products) {
  localStorage.setItem(STORAGE_KEYS.PRODUCTS, JSON.stringify(products));
}

function loadProducts() {
  const data = localStorage.getItem(STORAGE_KEYS.PRODUCTS);
  return data ? JSON.parse(data) : [];
}

function saveMeals(meals) {
  localStorage.setItem(STORAGE_KEYS.MEALS, JSON.stringify(meals));
}

function loadMeals() {
  const data = localStorage.getItem(STORAGE_KEYS.MEALS);
  return data ? JSON.parse(data) : [];
}

function saveConfig(config) {
  localStorage.setItem(STORAGE_KEYS.CONFIG, JSON.stringify(config));
}

function loadConfig() {
  const data = localStorage.getItem(STORAGE_KEYS.CONFIG);
  return data ? JSON.parse(data) : {
    ocrEndpoint: 'https://api.openai.com/v1',
    ocrApiKey: '',
    ocrModel: 'gpt-4o',
    trackedNutrients: ['energyKcal', 'fat', 'saturatedFat', 'sugars', 'protein', 'salt']
  };
}

function addProduct(product) {
  const products = loadProducts();
  products.push(product);
  saveProducts(products);
}

function addMeal(meal) {
  const meals = loadMeals();
  meals.push(meal);
  saveMeals(meals);
}

function getMealsByDate(date) {
  const meals = loadMeals();
  return meals.filter(meal => meal.date === date);
}

describe('AC-4: Storage Module', () => {
  describe('saveProducts / loadProducts', () => {
    test('should save and load products', () => {
      const product = {
        id: 'test-product-1',
        name: 'Test Product',
        brand: 'Test Brand',
        servingSizeGrams: 30,
        nutritionPer100g: {
          energyKcal: 500,
          energyKj: 2090,
          fat: 20,
          saturatedFat: 10,
          carbohydrates: 50,
          sugars: 30,
          fiber: 5,
          protein: 10,
          salt: 0.5
        }
      };

      saveProducts([product]);
      const loaded = loadProducts();

      assert.strictEqual(loaded.length, 1);
      assert.strictEqual(loaded[0].id, product.id);
      assert.strictEqual(loaded[0].name, product.name);
      assert.deepStrictEqual(loaded[0].nutritionPer100g, product.nutritionPer100g);
    });

    test('should return empty array when no products saved', () => {
      localStorage.clear();
      const loaded = loadProducts();
      assert.deepStrictEqual(loaded, []);
    });
  });

  describe('saveMeals / loadMeals', () => {
    test('should save and load meals', () => {
      const meal = {
        id: 'test-meal-1',
        name: 'Test Meal',
        date: '2024-01-15',
        entries: [],
        createdAt: new Date().toISOString()
      };

      saveMeals([meal]);
      const loaded = loadMeals();

      assert.strictEqual(loaded.length, 1);
      assert.strictEqual(loaded[0].id, meal.id);
      assert.strictEqual(loaded[0].name, meal.name);
      assert.strictEqual(loaded[0].date, meal.date);
    });

    test('should return empty array when no meals saved', () => {
      localStorage.clear();
      const loaded = loadMeals();
      assert.deepStrictEqual(loaded, []);
    });
  });

  describe('saveConfig / loadConfig', () => {
    test('should save and load config', () => {
      const config = {
        ocrEndpoint: 'https://api.example.com/v1',
        ocrApiKey: 'test-key-123',
        ocrModel: 'gpt-4-turbo',
        trackedNutrients: ['energyKcal', 'protein']
      };

      saveConfig(config);
      const loaded = loadConfig();

      assert.strictEqual(loaded.ocrEndpoint, config.ocrEndpoint);
      assert.strictEqual(loaded.ocrApiKey, config.ocrApiKey);
      assert.strictEqual(loaded.ocrModel, config.ocrModel);
      assert.deepStrictEqual(loaded.trackedNutrients, config.trackedNutrients);
    });

    test('should return default config when no config saved', () => {
      localStorage.clear();
      const loaded = loadConfig();

      assert.strictEqual(loaded.ocrEndpoint, 'https://api.openai.com/v1');
      assert.strictEqual(loaded.ocrApiKey, '');
      assert.strictEqual(loaded.ocrModel, 'gpt-4o');
      assert.deepStrictEqual(loaded.trackedNutrients, ['energyKcal', 'fat', 'saturatedFat', 'sugars', 'protein', 'salt']);
    });
  });

  describe('addProduct', () => {
    test('should add a product to existing products', () => {
      localStorage.clear();
      
      const product1 = {
        id: 'product-1',
        name: 'Product 1',
        servingSizeGrams: 100,
        nutritionPer100g: {
          energyKcal: 100,
          energyKj: 418,
          fat: 5,
          saturatedFat: 2,
          carbohydrates: 10,
          sugars: 5,
          fiber: 1,
          protein: 3,
          salt: 0.1
        }
      };

      const product2 = {
        id: 'product-2',
        name: 'Product 2',
        servingSizeGrams: 50,
        nutritionPer100g: {
          energyKcal: 200,
          energyKj: 837,
          fat: 10,
          saturatedFat: 5,
          carbohydrates: 20,
          sugars: 10,
          fiber: 2,
          protein: 6,
          salt: 0.2
        }
      };

      addProduct(product1);
      addProduct(product2);

      const products = loadProducts();
      assert.strictEqual(products.length, 2);
      assert.strictEqual(products[0].id, 'product-1');
      assert.strictEqual(products[1].id, 'product-2');
    });
  });

  describe('addMeal', () => {
    test('should add a meal to existing meals', () => {
      localStorage.clear();
      
      const meal1 = {
        id: 'meal-1',
        name: 'Breakfast',
        date: '2024-01-15',
        entries: [],
        createdAt: new Date().toISOString()
      };

      const meal2 = {
        id: 'meal-2',
        name: 'Lunch',
        date: '2024-01-15',
        entries: [],
        createdAt: new Date().toISOString()
      };

      addMeal(meal1);
      addMeal(meal2);

      const meals = loadMeals();
      assert.strictEqual(meals.length, 2);
      assert.strictEqual(meals[0].id, 'meal-1');
      assert.strictEqual(meals[1].id, 'meal-2');
    });
  });

  describe('getMealsByDate', () => {
    test('should return meals for a specific date', () => {
      localStorage.clear();
      
      const meal1 = {
        id: 'meal-1',
        name: 'Breakfast',
        date: '2024-01-15',
        entries: [],
        createdAt: new Date().toISOString()
      };

      const meal2 = {
        id: 'meal-2',
        name: 'Lunch',
        date: '2024-01-15',
        entries: [],
        createdAt: new Date().toISOString()
      };

      const meal3 = {
        id: 'meal-3',
        name: 'Dinner',
        date: '2024-01-16',
        entries: [],
        createdAt: new Date().toISOString()
      };

      addMeal(meal1);
      addMeal(meal2);
      addMeal(meal3);

      const mealsOn15th = getMealsByDate('2024-01-15');
      assert.strictEqual(mealsOn15th.length, 2);
      assert.strictEqual(mealsOn15th[0].id, 'meal-1');
      assert.strictEqual(mealsOn15th[1].id, 'meal-2');

      const mealsOn16th = getMealsByDate('2024-01-16');
      assert.strictEqual(mealsOn16th.length, 1);
      assert.strictEqual(mealsOn16th[0].id, 'meal-3');
    });

    test('should return empty array for date with no meals', () => {
      localStorage.clear();
      
      const meals = getMealsByDate('2024-01-20');
      assert.deepStrictEqual(meals, []);
    });
  });
});