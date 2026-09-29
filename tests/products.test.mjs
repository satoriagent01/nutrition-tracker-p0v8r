import { test, describe } from "node:test";
import assert from "node:assert/strict";
import { createProductFromScan, createManualProduct, getProductById } from "../src/products.mjs";

describe("Products Module", () => {
  describe("createProductFromScan", () => {
    test("should create a product from scan data (AC-1)", () => {
      const product = createProductFromScan(
        "Barra de Chocolate Sin Gluten",
        "Dr. Schär",
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
        "data:image/png;base64,..."
      );

      assert.equal(product.name, "Barra de Chocolate Sin Gluten");
      assert.equal(product.brand, "Dr. Schär");
      assert.equal(product.servingSizeGrams, 30);
      assert.equal(product.nutritionPer100g.energyKcal, 549);
      assert.equal(product.nutritionPer100g.energyKj, 2292);
      assert.equal(product.nutritionPer100g.fat, 33);
      assert.equal(product.nutritionPer100g.saturatedFat, 13);
      assert.equal(product.nutritionPer100g.carbohydrates, 55);
      assert.equal(product.nutritionPer100g.sugars, 45);
      assert.equal(product.nutritionPer100g.fiber, 2.4);
      assert.equal(product.nutritionPer100g.protein, 6.8);
      assert.equal(product.nutritionPer100g.salt, 0.18);
      assert.ok(product.imageUrl);
      assert.ok(product.id);
      assert.ok(product.createdAt);
    });

    test("should create a product from scan data without image (AC-1)", () => {
      const product = createProductFromScan(
        "Jugo de Manzana",
        "Marca X",
        200,
        {
          energyKcal: 47,
          energyKj: 199,
          fat: 0,
          saturatedFat: 0,
          carbohydrates: 11,
          sugars: 10,
          fiber: 0,
          protein: 0.7,
          salt: 0
        }
      );

      assert.equal(product.name, "Jugo de Manzana");
      assert.equal(product.brand, "Marca X");
      assert.equal(product.servingSizeGrams, 200);
      assert.equal(product.nutritionPer100g.energyKcal, 47);
      assert.equal(product.nutritionPer100g.energyKj, 199);
      assert.equal(product.nutritionPer100g.fat, 0);
      assert.equal(product.nutritionPer100g.saturatedFat, 0);
      assert.equal(product.nutritionPer100g.carbohydrates, 11);
      assert.equal(product.nutritionPer100g.sugars, 10);
      assert.equal(product.nutritionPer100g.fiber, 0);
      assert.equal(product.nutritionPer100g.protein, 0.7);
      assert.equal(product.nutritionPer100g.salt, 0);
      assert.equal(product.imageUrl, undefined);
      assert.ok(product.id);
      assert.ok(product.createdAt);
    });
  });

  describe("createManualProduct", () => {
    test("should create a manual product (AC-6)", () => {
      const product = createManualProduct(
        "Pollo a la Plancha",
        "Casa",
        150,
        {
          energyKcal: 239,
          energyKj: 1000,
          fat: 4.3,
          saturatedFat: 1.3,
          carbohydrates: 0,
          sugars: 0,
          fiber: 0,
          protein: 27,
          salt: 0.1
        }
      );

      assert.equal(product.name, "Pollo a la Plancha");
      assert.equal(product.brand, "Casa");
      assert.equal(product.servingSizeGrams, 150);
      assert.equal(product.nutritionPer100g.energyKcal, 239);
      assert.equal(product.nutritionPer100g.energyKj, 1000);
      assert.equal(product.nutritionPer100g.fat, 4.3);
      assert.equal(product.nutritionPer100g.saturatedFat, 1.3);
      assert.equal(product.nutritionPer100g.carbohydrates, 0);
      assert.equal(product.nutritionPer100g.sugars, 0);
      assert.equal(product.nutritionPer100g.fiber, 0);
      assert.equal(product.nutritionPer100g.protein, 27);
      assert.equal(product.nutritionPer100g.salt, 0.1);
      assert.equal(product.imageUrl, undefined);
      assert.ok(product.id);
      assert.ok(product.createdAt);
    });
  });

  describe("getProductById", () => {
    test("should return a product by ID", () => {
      const product = createProductFromScan(
        "Aceite de Oliva",
        "Marca Y",
        200,
        {
          energyKcal: 828,
          energyKj: 3404,
          fat: 92,
          saturatedFat: 14,
          carbohydrates: 0,
          sugars: 0,
          fiber: 0,
          protein: 0,
          salt: 0
        }
      );

      const retrievedProduct = getProductById(product.id);
      assert.equal(retrievedProduct.id, product.id);
      assert.equal(retrievedProduct.name, product.name);
      assert.equal(retrievedProduct.brand, product.brand);
      assert.equal(retrievedProduct.servingSizeGrams, product.servingSizeGrams);
      assert.deepStrictEqual(retrievedProduct.nutritionPer100g, product.nutritionPer100g);
    });

    test("should return undefined for non-existent ID", () => {
      const retrievedProduct = getProductById("non-existent-id");
      assert.equal(retrievedProduct, undefined);
    });
  });
});