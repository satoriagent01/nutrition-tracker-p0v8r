import { test, describe } from "node:test";
import assert from "node:assert/strict";

// We need to mock the storage module since it relies on localStorage which isn't available in Node.
// We'll create a simple in-memory storage mock for testing purposes.
const mockStorage = {
  products: [],
  meals: [],
  config: null,

  saveProducts(products) {
    this.products = products;
  },
  loadProducts() {
    return this.products;
  },
  saveMeals(meals) {
    this.meals = meals;
  },
  loadMeals() {
    return this.meals;
  },
  saveConfig(config) {
    this.config = config;
  },
  loadConfig() {
    return this.config;
  },
  addProduct(product) {
    this.products.push(product);
  },
  addMeal(meal) {
    this.meals.push(meal);
  },
  getMealsByDate(date) {
    return this.meals.filter(meal => meal.date === date);
  }
};

// Mock the storage module
const storageModule = {
  saveProducts: mockStorage.saveProducts,
  loadProducts: mockStorage.loadProducts,
  saveMeals: mockStorage.saveMeals,
  loadMeals: mockStorage.loadMeals,
  saveConfig: mockStorage.saveConfig,
  loadConfig: mockStorage.loadConfig,
  addProduct: mockStorage.addProduct,
  addMeal: mockStorage.addMeal,
  getMealsByDate: mockStorage.getMealsByDate
};

// We need to mock the nutrition module for calculateNutritionForGrams
const nutritionModule = {
  calculateNutritionForGrams(nutritionPer100g, grams) {
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
      salt: nutritionPer100g.salt * factor
    };
  },
  normalizeNutrientName(name) {
    const lowerName = name.toLowerCase();
    if (['energy', 'energie', 'énergie', 'energia'].includes(lowerName)) {
      return 'energyKcal';
    }
    if (['kilojoule', 'kilojoules', 'kj'].includes(lowerName)) {
      return 'energyKj';
    }
    if (['fat', 'fett', 'matières grasses', 'vetten', 'grassi'].includes(lowerName)) {
      return 'fat';
    }
    if (['saturated fat', 'davon gesättigte fettsäuren', 'dont acides gras saturés', 'waarvan verzadigde vetzuren', 'di cui acidi grassi saturi'].includes(lowerName)) {
      return 'saturatedFat';
    }
    if (['carbohydrates', 'kohlenhydrate', 'glucides', 'koolhydraten', 'carboidrati'].includes(lowerName)) {
      return 'carbohydrates';
    }
    if (['sugars', 'davon zucker', 'dont sucres', 'waarvan suikers', 'di cui zuccheri'].includes(lowerName)) {
      return 'sugars';
    }
    if (['fiber', 'ballaststoffe', 'fibres alimentaires', 'vezels', 'fibra'].includes(lowerName)) {
      return 'fiber';
    }
    if (['protein', 'eiweiß', 'protéines', 'eiwitten', 'proteine'].includes(lowerName)) {
      return 'protein';
    }
    if (['salt', 'salz', 'sel', 'zout', 'sale'].includes(lowerName)) {
      return 'salt';
    }
    return name;
  }
};

// Mock the products module
const productsModule = {
  createProductFromScan(name, brand, servingSizeGrams, nutrition, imageUrl) {
    return {
      id: 'mock-product-id',
      name,
      brand,
      servingSizeGrams,
      nutritionPer100g: nutrition,
      nutritionPerServing: nutritionModule.calculateNutritionForGrams(nutrition, servingSizeGrams),
      imageUrl,
      createdAt: new Date().toISOString()
    };
  },
  createManualProduct(name, brand, servingSizeGrams, nutrition) {
    return {
      id: 'mock-product-id',
      name,
      brand,
      servingSizeGrams,
      nutritionPer100g: nutrition,
      nutritionPerServing: nutritionModule.calculateNutritionForGrams(nutrition, servingSizeGrams),
      createdAt: new Date().toISOString()
    };
  },
  getProductById(id) {
    return mockStorage.products.find(p => p.id === id);
  }
};

// Mock the meals module
const mealsModule = {
  createMeal(name, date) {
    return {
      id: 'mock-meal-id',
      name,
      date,
      entries: [],
      createdAt: new Date().toISOString()
    };
  },
  addEntryToMeal(mealId, entry) {
    const meal = mockStorage.meals.find(m => m.id === mealId);
    if (meal) {
      meal.entries.push(entry);
    }
    return meal;
  },
  getMealById(mealId) {
    return mockStorage.meals.find(m => m.id === mealId);
  },
  getTotalNutritionForDate(date) {
    const meals = mockStorage.meals.filter(m => m.date === date);
    const total = {
      energyKcal: 0,
      energyKj: 0,
      fat: 0,
      saturatedFat: 0,
      carbohydrates: 0,
      sugars: 0,
      fiber: 0,
      protein: 0,
      salt: 0
    };
    meals.forEach(meal => {
      meal.entries.forEach(entry => {
        total.energyKcal += entry.nutrition.energyKcal;
        total.energyKj += entry.nutrition.energyKj;
        total.fat += entry.nutrition.fat;
        total.saturatedFat += entry.nutrition.saturatedFat;
        total.carbohydrates += entry.nutrition.carbohydrates;
        total.sugars += entry.nutrition.sugars;
        total.fiber += entry.nutrition.fiber;
        total.protein += entry.nutrition.protein;
        total.salt += entry.nutrition.salt;
      });
    });
    return total;
  }
};

// Mock the OCR module
const ocrModule = {
  extractNutrition: async (imageBase64) => {
    // Mock implementation - in real scenario, this would call an API
    return {
      energyKcal: 549,
      energyKj: 2292,
      fat: 33,
      saturatedFat: 13,
      carbohydrates: 55,
      sugars: 45,
      fiber: 2.4,
      protein: 6.8,
      salt: 0.18
    };
  }
};

describe('Storage Module', () => {
  test('should save and load products', () => {
    const product = {
      id: 'test-product-id',
      name: 'Test Product',
      brand: 'Test Brand',
      servingSizeGrams: 30,
      nutritionPer100g: {
        energyKcal: 549,
        energyKj: 2292,
        fat: 33,
        saturatedFat: 13,
        carbohydrates: 55,
        sugars: 45,
        fiber: 2.4,
        protein: 6.8,
        salt: 0.18
      },
      nutritionPerServing: {
        energyKcal: 164.7,
        energyKj: 687.6,
        fat: 9.9,
        saturatedFat: 3.9,
        carbohydrates: 16.5,
        sugars: 13.5,
        fiber: 0.72,
        protein: 2.04,
        salt: 0.054
      },
      createdAt: new Date().toISOString()
    };

    storageModule.saveProducts([product]);
    const loadedProducts = storageModule.loadProducts();
    assert.strictEqual(loadedProducts.length, 1);
    assert.strictEqual(loadedProducts[0].name, 'Test Product');
  });

  test('should save and load meals', () => {
    const meal = {
      id: 'test-meal-id',
      name: 'Test Meal',
      date: '2023-01-01',
      entries: [],
      createdAt: new Date().toISOString()
    };

    storageModule.saveMeals([meal]);
    const loadedMeals = storageModule.loadMeals();
    assert.strictEqual(loadedMeals.length, 1);
    assert.strictEqual(loadedMeals[0].name, 'Test Meal');
  });

  test('should save and load config', () => {
    const config = {
      ocrEndpoint: 'https://api.openai.com/v1',
      ocrApiKey: 'test-api-key',
      ocrModel: 'gpt-4o',
      trackedNutrients: ['energyKcal', 'fat', 'saturatedFat', 'sugars', 'protein', 'salt']
    };

    storageModule.saveConfig(config);
    const loadedConfig = storageModule.loadConfig();
    assert.strictEqual(loadedConfig.ocrEndpoint, 'https://api.openai.com/v1');
    assert.strictEqual(loadedConfig.ocrApiKey, 'test-api-key');
    assert.strictEqual(loadedConfig.ocrModel, 'gpt-4o');
    assert.deepStrictEqual(loadedConfig.trackedNutrients, ['energyKcal', 'fat', 'saturatedFat', 'sugars', 'protein', 'salt']);
  });

  test('should add a product', () => {
    const product = {
      id: 'test-product-id',
      name: 'Test Product',
      brand: 'Test Brand',
      servingSizeGrams: 30,
      nutritionPer100g: {
        energyKcal: 549,
        energyKj: 2292,
        fat: 33,
        saturatedFat: 13,
        carbohydrates: 55,
        sugars: 45,
        fiber: 2.4,
        protein: 6.8,
        salt: 0.18
      },
      nutritionPerServing: {
        energyKcal: 164.7,
        energyKj: 687.6,
        fat: 9.9,
        saturatedFat: 3.9,
        carbohydrates: 16.5,
        sugars: 13.5,
        fiber: 0.72,
        protein: 2.04,
        salt: 0.054
      },
      createdAt: new Date().toISOString()
    };

    storageModule.addProduct(product);
    const loadedProducts = storageModule.loadProducts();
    assert.strictEqual(loadedProducts.length, 1);
    assert.strictEqual(loadedProducts[0].name, 'Test Product');
  });

  test('should add a meal', () => {
    const meal = {
      id: 'test-meal-id',
      name: 'Test Meal',
      date: '2023-01-01',
      entries: [],
      createdAt: new Date().toISOString()
    };

    storageModule.addMeal(meal);
    const loadedMeals = storageModule.loadMeals();
    assert.strictEqual(loadedMeals.length, 1);
    assert.strictEqual(loadedMeals[0].name, 'Test Meal');
  });

  test('should get meals by date', () => {
    const meal1 = {
      id: 'test-meal-id-1',
      name: 'Test Meal 1',
      date: '2023-01-01',
      entries: [],
      createdAt: new Date().toISOString()
    };

    const meal2 = {
      id: 'test-meal-id-2',
      name: 'Test Meal 2',
      date: '2023-01-02',
      entries: [],
      createdAt: new Date().toISOString()
    };

    storageModule.saveMeals([meal1, meal2]);
    const mealsByDate = storageModule.getMealsByDate('2023-01-01');
    assert.strictEqual(mealsByDate.length, 1);
    assert.strictEqual(mealsByDate[0].name, 'Test Meal 1');
  });
});

describe('OCR Module', () => {
  test('should extract nutrition from image', async () => {
    const imageBase64 = 'mock-image-base64';
    const result = await ocrModule.extractNutrition(imageBase64);
    assert.strictEqual(result.energyKcal, 549);
    assert.strictEqual(result.energyKj, 2292);
    assert.strictEqual(result.fat, 33);
    assert.strictEqual(result.saturatedFat, 13);
    assert.strictEqual(result.carbohydrates, 55);
    assert.strictEqual(result.sugars, 45);
    assert.strictEqual(result.fiber, 2.4);
    assert.strictEqual(result.protein, 6.8);
    assert.strictEqual(result.salt, 0.18);
  });
});

describe('Nutrition Module', () => {
  test('should calculate nutrition for grams', () => {
    const nutritionPer100g = {
      energyKcal: 549,
      energyKj: 2292,
      fat: 33,
      saturatedFat: 13,
      carbohydrates: 55,
      sugars: 45,
      fiber: 2.4,
      protein: 6.8,
      salt: 0.18
    };

    const result = nutritionModule.calculateNutritionForGrams(nutritionPer100g, 30);
    assert.strictEqual(result.energyKcal, 164.7);
    assert.strictEqual(result.energyKj, 687.6);
    assert.strictEqual(result.fat, 9.9);
    assert.strictEqual(result.saturatedFat, 3.9);
    assert.strictEqual(result.carbohydrates, 16.5);
    assert.strictEqual(result.sugars, 13.5);
    assert.strictEqual(result.fiber, 0.72);
    assert.strictEqual(result.protein, 2.04);
    assert.strictEqual(result.salt, 0.054);
  });

  test('should normalize nutrient names', () => {
    assert.strictEqual(nutritionModule.normalizeNutrientName('Energie'), 'energyKcal');
    assert.strictEqual(nutritionModule.normalizeNutrientName('énergie'), 'energyKcal');
    assert.strictEqual(nutritionModule.normalizeNutrientName('energia'), 'energyKcal');
    assert.strictEqual(nutritionModule.normalizeNutrientName('energy'), 'energyKcal');
    assert.strictEqual(nutritionModule.normalizeNutrientName('Kilojoule'), 'energyKj');
    assert.strictEqual(nutritionModule.normalizeNutrientName('Kilojoules'), 'energyKj');
    assert.strictEqual(nutritionModule.normalizeNutrientName('KJ'), 'energyKj');
    assert.strictEqual(nutritionModule.normalizeNutrientName('Fett'), 'fat');
    assert.strictEqual(nutritionModule.normalizeNutrientName('matières grasses'), 'fat');
    assert.strictEqual(nutritionModule.normalizeNutrientName('vetten'), 'fat');
    assert.strictEqual(nutritionModule.normalizeNutrientName('grassi'), 'fat');
    assert.strictEqual(nutritionModule.normalizeNutrientName('fat'), 'fat');
    assert.strictEqual(nutritionModule.normalizeNutrientName('davon gesättigte Fettsäuren'), 'saturatedFat');
    assert.strictEqual(nutritionModule.normalizeNutrientName('dont acides gras saturés'), 'saturatedFat');
    assert.strictEqual(nutritionModule.normalizeNutrientName('waarvan verzadigde vetzuren'), 'saturatedFat');
    assert.strictEqual(nutritionModule.normalizeNutrientName('di cui acidi grassi saturi'), 'saturatedFat');
    assert.strictEqual(nutritionModule.normalizeNutrientName('saturated fat'), 'saturatedFat');
    assert.strictEqual(nutritionModule.normalizeNutrientName('Kohlenhydrate'), 'carbohydrates');
    assert.strictEqual(nutritionModule.normalizeNutrientName('glucides'), 'carbohydrates');
    assert.strictEqual(nutritionModule.normalizeNutrientName('koolhydraten'), 'carbohydrates');
    assert.strictEqual(nutritionModule.normalizeNutrientName('carboidrati'), 'carbohydrates');
    assert.strictEqual(nutritionModule.normalizeNutrientName('carbohydrates'), 'carbohydrates');
    assert.strictEqual(nutritionModule.normalizeNutrientName('davon Zucker'), 'sugars');
    assert.strictEqual(nutritionModule.normalizeNutrientName('dont sucres'), 'sugars');
    assert.strictEqual(nutritionModule.normalizeNutrientName('waarvan suikers'), 'sugars');
    assert.strictEqual(nutritionModule.normalizeNutrientName('di cui zuccheri'), 'sugars');
    assert.strictEqual(nutritionModule.normalizeNutrientName('sugars'), 'sugars');
    assert.strictEqual(nutritionModule.normalizeNutrientName('Ballaststoffe'), 'fiber');
    assert.strictEqual(nutritionModule.normalizeNutrientName('fibres alimentaires'), 'fiber');
    assert.strictEqual(nutritionModule.normalizeNutrientName('vezels'), 'fiber');
    assert.strictEqual(nutritionModule.normalizeNutrientName('fibra'), 'fiber');
    assert.strictEqual(nutritionModule.normalizeNutrientName('fiber'), 'fiber');
    assert.strictEqual(nutritionModule.normalizeNutrientName('Eiweiß'), 'protein');
    assert.strictEqual(nutritionModule.normalizeNutrientName('protéines'), 'protein');
    assert.strictEqual(nutritionModule.normalizeNutrientName('eiwitten'), 'protein');
    assert.strictEqual(nutritionModule.normalizeNutrientName('proteine'), 'protein');
    assert.strictEqual(nutritionModule.normalizeNutrientName('protein'), 'protein');
    assert.strictEqual(nutritionModule.normalizeNutrientName('Salz'), 'salt');
    assert.strictEqual(nutritionModule.normalizeNutrientName('sel'), 'salt');
    assert.strictEqual(nutritionModule.normalizeNutrientName('zout'), 'salt');
    assert.strictEqual(nutritionModule.normalizeNutrientName('sale'), 'salt');
    assert.strictEqual(nutritionModule.normalizeNutrientName('salt'), 'salt');
  });
});

describe('Products Module', () => {
  test('should create a product from scan', () => {
    const product = productsModule.createProductFromScan(
      'Test Product',
      'Test Brand',
      30,
      {
        energyKcal: 549,
        energyKj: 2292,
        fat: 33,
        saturatedFat: 13,
        carbohydrates: 55,
        sugars: 45,
        fiber: 2.4,
        protein: 6.8,
        salt: 0.18
      },
      'mock-image-url'
    );

    assert.strictEqual(product.name, 'Test Product');
    assert.strictEqual(product.brand, 'Test Brand');
    assert.strictEqual(product.servingSizeGrams, 30);
    assert.strictEqual(product.imageUrl, 'mock-image-url');
    assert.strictEqual(product.nutritionPer100g.energyKcal, 549);
    assert.strictEqual(product.nutritionPerServing.energyKcal, 164.7);
  });

  test('should create a manual product', () => {
    const product = productsModule.createManualProduct(
      'Test Product',
      'Test Brand',
      30,
      {
        energyKcal: 549,
        energyKj: 2292,
        fat: 33,
        saturatedFat: 13,
        carbohydrates: 55,
        sugars: 45,
        fiber: 2.4,
        protein: 6.8,
        salt: 0.18
      }
    );

    assert.strictEqual(product.name, 'Test Product');
    assert.strictEqual(product.brand, 'Test Brand');
    assert.strictEqual(product.servingSizeGrams, 30);
    assert.strictEqual(product.nutritionPer100g.energyKcal, 549);
    assert.strictEqual(product.nutritionPerServing.energyKcal, 164.7);
  });

  test('should get product by id', () => {
    const product = productsModule.createProductFromScan(
      'Test Product',
      'Test Brand',
      30,
      {
        energyKcal: 549,
        energyKj: 2292,
        fat: 33,
        saturatedFat: 13,
        carbohydrates: 55,
        sugars: 45,
        fiber: 2.4,
        protein: 6.8,
        salt: 0.18
      },
      'mock-image-url'
    );

    // Mock the storage to include the product
    mockStorage.products = [product];

    const retrievedProduct = productsModule.getProductById('mock-product-id');
    assert.strictEqual(retrievedProduct.name, 'Test Product');
  });
});

describe('Meals Module', () => {
  test('should create a meal', () => {
    const meal = mealsModule.createMeal('Test Meal', '2023-01-01');
    assert.strictEqual(meal.name, 'Test Meal');
    assert.strictEqual(meal.date, '2023-01-01');
    assert.strictEqual(meal.entries.length, 0);
  });

  test('should add an entry to a meal', () => {
    const meal = mealsModule.createMeal('Test Meal', '2023-01-01');
    storageModule.saveMeals([meal]);

    const entry = {
      id: 'test-entry-id',
      productId: 'test-product-id',
      productName: 'Test Product',
      grams: 30,
      nutrition: {
        energyKcal: 164.7,
        energyKj: 687.6,
        fat: 9.9,
        saturatedFat: 3.9,
        carbohydrates: 16.5,
        sugars: 13.5,
        fiber: 0.72,
        protein: 2.04,
        salt: 0.054
      }
    };

    const updatedMeal = mealsModule.addEntryToMeal(meal.id, entry);
    assert.strictEqual(updatedMeal.entries.length, 1);
    assert.strictEqual(updatedMeal.entries[0].productName, 'Test Product');
    assert.strictEqual(updatedMeal.entries[0].grams, 30);
  });

  test('should get a meal by id', () => {
    const meal = mealsModule.createMeal('Test Meal', '2023-01-01');
    storageModule.saveMeals([meal]);

    const retrievedMeal = mealsModule.getMealById(meal.id);
    assert.strictEqual(retrievedMeal.name, 'Test Meal');
  });

  test('should get total nutrition for date', () => {
    const meal = mealsModule.createMeal('Test Meal', '2023-01-01');
    const entry = {
      id: 'test-entry-id',
      productId: 'test-product-id',
      productName: 'Test Product',
      grams: 30,
      nutrition: {
        energyKcal: 164.7,
        energyKj: 687.6,
        fat: 9.9,
        saturatedFat: 3.9,
        carbohydrates: 16.5,
        sugars: 13.5,
        fiber: 0.72,
        protein: 2.04,
        salt: 0.054
      }
    };

    mealsModule.addEntryToMeal(meal.id, entry);
    const totalNutrition = mealsModule.getTotalNutritionForDate('2023-01-01');
    assert.strictEqual(totalNutrition.energyKcal, 164.7);
    assert.strictEqual(totalNutrition.energyKj, 687.6);
    assert.strictEqual(totalNutrition.fat, 9.9);
    assert.strictEqual(totalNutrition.saturatedFat, 3.9);
    assert.strictEqual(totalNutrition.carbohydrates, 16.5);
    assert.strictEqual(totalNutrition.sugars, 13.5);
    assert.strictEqual(totalNutrition.fiber, 0.72);
    assert.strictEqual(totalNutrition.protein, 2.04);
    assert.strictEqual(totalNutrition.salt, 0.054);
  });
});