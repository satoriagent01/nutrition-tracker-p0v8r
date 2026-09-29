const STORAGE_KEYS = {
  PRODUCTS: 'nutrition_tracker_products',
  MEALS: 'nutrition_tracker_meals',
  CONFIG: 'nutrition_tracker_config'
};

export { STORAGE_KEYS };

export function saveProducts(products) {
  localStorage.setItem(STORAGE_KEYS.PRODUCTS, JSON.stringify(products));
}

export function loadProducts() {
  const data = localStorage.getItem(STORAGE_KEYS.PRODUCTS);
  return data ? JSON.parse(data) : [];
}

export function saveMeals(meals) {
  localStorage.setItem(STORAGE_KEYS.MEALS, JSON.stringify(meals));
}

export function loadMeals() {
  const data = localStorage.getItem(STORAGE_KEYS.MEALS);
  return data ? JSON.parse(data) : [];
}

export function saveConfig(config) {
  localStorage.setItem(STORAGE_KEYS.CONFIG, JSON.stringify(config));
}

export function loadConfig() {
  const data = localStorage.getItem(STORAGE_KEYS.CONFIG);
  return data ? JSON.parse(data) : {
    ocrEndpoint: 'https://api.openai.com/v1',
    ocrApiKey: '',
    ocrModel: 'gpt-4o',
    trackedNutrients: ['energyKcal', 'fat', 'saturatedFat', 'sugars', 'protein', 'salt']
  };
}

export function addProduct(product) {
  const products = loadProducts();
  products.push(product);
  saveProducts(products);
}

export function addMeal(meal) {
  const meals = loadMeals();
  meals.push(meal);
  saveMeals(meals);
}

export function getMealsByDate(date) {
  const meals = loadMeals();
  return meals.filter(meal => meal.date === date);
}