import { test, describe } from "node:test";
import assert from "node:assert/strict";
import { calculateNutritionForGrams, normalizeNutrientName } from "../src/nutrition.mjs";

describe("calculateNutritionForGrams", () => {
  test("AC-3: Scales energy correctly for 30g of chocolate (549 kcal per 100g)", () => {
    const nutritionPer100g = {
      energyKcal: 549,
      energyKj: 2292,
      fat: 33,
      saturatedFat: 13,
      carbohydrates: 55,
      sugars: 45,
      fiber: 2.4,
      protein: 6.8,
      salt: 0.18,
    };
    const result = calculateNutritionForGrams(nutritionPer100g, 30);
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

  test("Scales correctly for 100g (no change)", () => {
    const nutritionPer100g = {
      energyKcal: 100,
      energyKj: 400,
      fat: 10,
      saturatedFat: 2,
      carbohydrates: 20,
      sugars: 5,
      fiber: 1,
      protein: 5,
      salt: 0.5,
    };
    const result = calculateNutritionForGrams(nutritionPer100g, 100);
    assert.strictEqual(result.energyKcal, 100);
    assert.strictEqual(result.energyKj, 400);
    assert.strictEqual(result.fat, 10);
    assert.strictEqual(result.saturatedFat, 2);
    assert.strictEqual(result.carbohydrates, 20);
    assert.strictEqual(result.sugars, 5);
    assert.strictEqual(result.fiber, 1);
    assert.strictEqual(result.protein, 5);
    assert.strictEqual(result.salt, 0.5);
  });

  test("Scales correctly for 200ml juice (47 kcal per 100ml)", () => {
    const nutritionPer100g = {
      energyKcal: 47,
      energyKj: 199,
      fat: 0,
      saturatedFat: 0,
      carbohydrates: 11,
      sugars: 10,
      fiber: 0,
      protein: 0.7,
      salt: 0,
    };
    const result = calculateNutritionForGrams(nutritionPer100g, 200);
    assert.strictEqual(result.energyKcal, 94);
    assert.strictEqual(result.energyKj, 398);
    assert.strictEqual(result.fat, 0);
    assert.strictEqual(result.saturatedFat, 0);
    assert.strictEqual(result.carbohydrates, 22);
    assert.strictEqual(result.sugars, 20);
    assert.strictEqual(result.fiber, 0);
    assert.strictEqual(result.protein, 1.4);
    assert.strictEqual(result.salt, 0);
  });

  test("Scales correctly for olive oil (828 kcal per 100ml)", () => {
    const nutritionPer100g = {
      energyKcal: 828,
      energyKj: 3404,
      fat: 92,
      saturatedFat: 14,
      carbohydrates: 0,
      sugars: 0,
      fiber: 0,
      protein: 0,
      salt: 0,
    };
    const result = calculateNutritionForGrams(nutritionPer100g, 200);
    assert.strictEqual(result.energyKcal, 1656);
    assert.strictEqual(result.energyKj, 6808);
    assert.strictEqual(result.fat, 184);
    assert.strictEqual(result.saturatedFat, 28);
    assert.strictEqual(result.carbohydrates, 0);
    assert.strictEqual(result.sugars, 0);
    assert.strictEqual(result.fiber, 0);
    assert.strictEqual(result.protein, 0);
    assert.strictEqual(result.salt, 0);
  });
});

describe("normalizeNutrientName", () => {
  test("AC-2: Normalizes German 'Energie' to 'energyKcal'", () => {
    assert.strictEqual(normalizeNutrientName("Energie"), "energyKcal");
  });

  test("Normalizes German 'Kilojoule' to 'energyKj'", () => {
    assert.strictEqual(normalizeNutrientName("Kilojoule"), "energyKj");
  });

  test("Normalizes German 'Fett' to 'fat'", () => {
    assert.strictEqual(normalizeNutrientName("Fett"), "fat");
  });

  test("Normalizes German 'davon gesättigte Fettsäuren' to 'saturatedFat'", () => {
    assert.strictEqual(normalizeNutrientName("davon gesättigte Fettsäuren"), "saturatedFat");
  });

  test("Normalizes German 'Kohlenhydrate' to 'carbohydrates'", () => {
    assert.strictEqual(normalizeNutrientName("Kohlenhydrate"), "carbohydrates");
  });

  test("Normalizes German 'davon Zucker' to 'sugars'", () => {
    assert.strictEqual(normalizeNutrientName("davon Zucker"), "sugars");
  });

  test("Normalizes German 'Ballaststoffe' to 'fiber'", () => {
    assert.strictEqual(normalizeNutrientName("Ballaststoffe"), "fiber");
  });

  test("Normalizes German 'Eiweiß' to 'protein'", () => {
    assert.strictEqual(normalizeNutrientName("Eiweiß"), "protein");
  });

  test("Normalizes German 'Salz' to 'salt'", () => {
    assert.strictEqual(normalizeNutrientName("Salz"), "salt");
  });

  test("Normalizes French 'énergie' to 'energyKcal'", () => {
    assert.strictEqual(normalizeNutrientName("énergie"), "energyKcal");
  });

  test("Normalizes French 'matières grasses' to 'fat'", () => {
    assert.strictEqual(normalizeNutrientName("matières grasses"), "fat");
  });

  test("Normalizes French 'dont acides gras saturés' to 'saturatedFat'", () => {
    assert.strictEqual(normalizeNutrientName("dont acides gras saturés"), "saturatedFat");
  });

  test("Normalizes French 'glucides' to 'carbohydrates'", () => {
    assert.strictEqual(normalizeNutrientName("glucides"), "carbohydrates");
  });

  test("Normalizes French 'dont sucres' to 'sugars'", () => {
    assert.strictEqual(normalizeNutrientName("dont sucres"), "sugars");
  });

  test("Normalizes French 'fibres alimentaires' to 'fiber'", () => {
    assert.strictEqual(normalizeNutrientName("fibres alimentaires"), "fiber");
  });

  test("Normalizes French 'protéines' to 'protein'", () => {
    assert.strictEqual(normalizeNutrientName("protéines"), "protein");
  });

  test("Normalizes French 'sel' to 'salt'", () => {
    assert.strictEqual(normalizeNutrientName("sel"), "salt");
  });

  test("Normalizes Dutch 'energie' to 'energyKcal'", () => {
    assert.strictEqual(normalizeNutrientName("energie"), "energyKcal");
  });

  test("Normalizes Dutch 'vetten' to 'fat'", () => {
    assert.strictEqual(normalizeNutrientName("vetten"), "fat");
  });

  test("Normalizes Dutch 'waarvan verzadigde vetzuren' to 'saturatedFat'", () => {
    assert.strictEqual(normalizeNutrientName("waarvan verzadigde vetzuren"), "saturatedFat");
  });

  test("Normalizes Dutch 'koolhydraten' to 'carbohydrates'", () => {
    assert.strictEqual(normalizeNutrientName("koolhydraten"), "carbohydrates");
  });

  test("Normalizes Dutch 'waarvan suikers' to 'sugars'", () => {
    assert.strictEqual(normalizeNutrientName("waarvan suikers"), "sugars");
  });

  test("Normalizes Dutch 'vezels' to 'fiber'", () => {
    assert.strictEqual(normalizeNutrientName("vezels"), "fiber");
  });

  test("Normalizes Dutch 'eiwitten' to 'protein'", () => {
    assert.strictEqual(normalizeNutrientName("eiwitten"), "protein");
  });

  test("Normalizes Dutch 'zout' to 'salt'", () => {
    assert.strictEqual(normalizeNutrientName("zout"), "salt");
  });

  test("Normalizes Italian 'energia' to 'energyKcal'", () => {
    assert.strictEqual(normalizeNutrientName("energia"), "energyKcal");
  });

  test("Normalizes Italian 'grassi' to 'fat'", () => {
    assert.strictEqual(normalizeNutrientName("grassi"), "fat");
  });

  test("Normalizes Italian 'di cui acidi grassi saturi' to 'saturatedFat'", () => {
    assert.strictEqual(normalizeNutrientName("di cui acidi grassi saturi"), "saturatedFat");
  });

  test("Normalizes Italian 'carboidrati' to 'carbohydrates'", () => {
    assert.strictEqual(normalizeNutrientName("carboidrati"), "carbohydrates");
  });

  test("Normalizes Italian 'di cui zuccheri' to 'sugars'", () => {
    assert.strictEqual(normalizeNutrientName("di cui zuccheri"), "sugars");
  });

  test("Normalizes Italian 'fibra' to 'fiber'", () => {
    assert.strictEqual(normalizeNutrientName("fibra"), "fiber");
  });

  test("Normalizes Italian 'proteine' to 'protein'", () => {
    assert.strictEqual(normalizeNutrientName("proteine"), "protein");
  });

  test("Normalizes Italian 'sale' to 'salt'", () => {
    assert.strictEqual(normalizeNutrientName("sale"), "salt");
  });

  test("Normalizes English 'energy' to 'energyKcal'", () => {
    assert.strictEqual(normalizeNutrientName("energy"), "energyKcal");
  });

  test("Normalizes English 'fat' to 'fat'", () => {
    assert.strictEqual(normalizeNutrientName("fat"), "fat");
  });

  test("Normalizes English 'saturated fat' to 'saturatedFat'", () => {
    assert.strictEqual(normalizeNutrientName("saturated fat"), "saturatedFat");
  });

  test("Normalizes English 'carbohydrates' to 'carbohydrates'", () => {
    assert.strictEqual(normalizeNutrientName("carbohydrates"), "carbohydrates");
  });

  test("Normalizes English 'sugars' to 'sugars'", () => {
    assert.strictEqual(normalizeNutrientName("sugars"), "sugars");
  });

  test("Normalizes English 'fiber' to 'fiber'", () => {
    assert.strictEqual(normalizeNutrientName("fiber"), "fiber");
  });

  test("Normalizes English 'protein' to 'protein'", () => {
    assert.strictEqual(normalizeNutrientName("protein"), "protein");
  });

  test("Normalizes English 'salt' to 'salt'", () => {
    assert.strictEqual(normalizeNutrientName("salt"), "salt");
  });

  test("Returns empty string for unknown nutrient", () => {
    assert.strictEqual(normalizeNutrientName("unknown"), "");
  });
});