# Especificación: Nutrition Tracker (NutriScan)

## 1. Visión General
Una aplicación web gratuita y sin anuncios para rastrear la ingesta nutricional. Los usuarios pueden escanuar etiquetas nutricionales de productos (como las de las imágenes adjuntas: chocolate, jugo, aceite de oliva) mediante OCR con IA, crear comidas personalizadas y rastrear nutrientes específicos.

## 2. Stack Tecnológico
- **Backend/Logic:** Node 24, ES Modules (`.mjs`), sin framework, sin build step.
- **Frontend/UI:** HTML5, CSS3, Vanilla JavaScript (ES Modules), sin framework.
- **Persistencia:** `localStorage` del navegador. No hay base de datos server-side.
- **OCR:** Módulo que llama a un endpoint OpenAI-compatible (configurable por el usuario).

## 3. Modelo de Datos

### 3.1. Producto (`Product`)
Representa un producto alimenticio escaneado o creado manualmente.

```typescript
interface Product {
  id: string; // UUID
  name: string; // Nombre del producto (ej: "Barra de Chocolate Sin Gluten")
  brand?: string; // Marca (ej: "Dr. Schär")
  servingSizeGrams: number; // Tamaño de la porción en gramos (ej: 30)
  servingSizeLabel?: string; // Etiqueta del tamaño de porción (ej: "1 Melto", "200 ml")
  nutritionPer100g: NutritionValues; // Valores nutricionales por 100g
  nutritionPerServing: NutritionValues; // Valores nutricionales por porción (calculado o extraído)
  imageUrl?: string; // Base64 o referencia a la imagen escaneada (opcional)
  createdAt: string; // ISO date string
}
```

### 3.2. Valores Nutricionales (`NutritionValues`)
Campos numéricos. Las unidades estándar son:
- Energía: kcal (kilocalorías) y kJ (kilojulios)
- Grasas: g (gramos)
  - `saturatedFat`: Grasas saturadas
- Carbohidratos: g (gramos)
  - `sugars`: Azúcares
  - `fiber`: Fibra
- Proteína: g (gramos)
- Sal/Sodio: g (gramos)
  - `salt`: Sal (equivalente a sodio * 2.5)

```typescript
interface NutritionValues {
  energyKcal: number;
  energyKj: number;
  fat: number;
  saturatedFat: number;
  carbohydrates: number;
  sugars: number;
  fiber: number;
  protein: number;
  salt: number;
}
```

### 3.3. Entrada de Comida (`FoodEntry`)
Una instancia de un producto en una comida.

```typescript
interface FoodEntry {
  id: string; // UUID
  productId: string; // Referencia al producto
  productName: string; // Copia del nombre para visualización (por si el producto cambia)
  grams: number; // Cantidad consumida en gramos
  nutrition: NutritionValues; // Valores nutricionales calculados para esa cantidad
}
```

### 3.4. Comida (`Meal`)
Un grupo de entradas de comida.

```typescript
interface Meal {
  id: string; // UUID
  name: string; // Nombre de la comida (ej: "Desayuno", "Almuerzo")
  date: string; // Fecha (YYYY-MM-DD)
  entries: FoodEntry[];
  createdAt: string; // ISO date string
}
```

### 3.5. Configuración de Usuario (`UserConfig`)
```typescript
interface UserConfig {
  ocrEndpoint: string; // URL del endpoint OpenAI-compatible (ej: "https://api.openai.com/v1")
  ocrApiKey: string; // Clave API
  ocrModel: string; // Modelo a usar (ej: "gpt-4o")
  trackedNutrients: string[]; // Lista de nutrientes a rastrear (default: ["energyKcal", "fat", "saturatedFat", "sugars", "protein", "salt"])
}
```

## 4. Módulos de Lógica (src/)

### 4.1. `src/storage.mjs`
Maneja la persistencia en `localStorage`.

- `saveProducts(products: Product[]): void`
- `loadProducts(): Product[]`
- `saveMeals(meals: Meal[]): void`
- `loadMeals(): Meal[]`
- `saveConfig(config: UserConfig): void`
- `loadConfig(): UserConfig`
- `addProduct(product: Product): void`
- `addMeal(meal: Meal): void`
- `getMealsByDate(date: string): Meal[]`

### 4.2. `src/ocr.mjs`
Interfaz para el OCR con IA.

- `extractNutrition(imageBase64: string): Promise<NutritionValues>`
  - Llama al endpoint configurado en `UserConfig`.
  - Envía la imagen y un prompt para extraer los valores nutricionales.
  - Devuelve los valores extraídos.
  - **Nota:** En pruebas, este módulo se mockea. En producción, llama a la API real.

### 4.3. `src/nutrition.mjs`
Lógica determinística para cálculos nutricionales.

- `calculateNutritionForGrams(nutritionPer100g: NutritionValues, grams: number): NutritionValues`
  - Escala los valores nutricionales basados en los gramos consumidos.
  - Ejemplo: Si `nutritionPer100g.energyKcal` es 500 y `grams` es 30, el resultado es `150`.
  - Retorna un nuevo objeto `NutritionValues`.

- `normalizeNutrientName(name: string): string`
  - Normaliza nombres de nutrientes de diferentes idiomas (alemán, holandés, francés, italiano, español) a los campos internos de `NutritionValues`.
  - Ejemplos de mapeo:
    - "Energie", "énergie", "energia", "energy" -> "energyKcal" (y "Kilojoule", "Kilojoules" -> "energyKj")
    - "Fett", "matières grasses", "vetten", "grassi", "fat" -> "fat"
    - "davon gesättigte Fettsäuren", "dont acides gras saturés", "waarvan verzadigde vetzuren", "di cui acidi grassi saturi", "saturated fat" -> "saturatedFat"
    - "Kohlenhydrate", "glucides", "koolhydraten", "carboidrati", "carbohydrates" -> "carbohydrates"
    - "davon Zucker", "dont sucres", "waarvan suikers", "di cui zuccheri", "sugars" -> "sugars"
    - "Ballaststoffe", "fibres alimentaires", "vezels", "fibra", "fiber" -> "fiber"
    - "Eiweiß", "protéines", "eiwitten", "proteine", "protein" -> "protein"
    - "Salz", "sel", "zout", "sale", "salt" -> "salt"

### 4.4. `src/products.mjs`
Gestión de productos.

- `createProductFromScan(name: string, brand: string, servingSizeGrams: number, nutrition: NutritionValues, imageUrl?: string): Product`
- `createManualProduct(name: string, brand: string, servingSizeGrams: number, nutrition: NutritionValues): Product`
- `getProductById(id: string): Product | undefined`

### 4.5. `src/meals.mjs`
Gestión de comidas.

- `createMeal(name: string, date: string): Meal`
- `addEntryToMeal(mealId: string, entry: FoodEntry): Meal`
- `getMealById(mealId: string): Meal | undefined`
- `getTotalNutritionForDate(date: string): NutritionValues`
  - Suma todos los nutrientes de todas las comidas del día.

## 5. Interfaz de Usuario (public/)

### 5.1. Pantalla de Escaneo (`scan.html`)
- El usuario toma o selecciona una foto de la etiqueta nutricional.
- Botón "Procesar Imagen" que llama a `ocr.extractNutrition()`.
- Muestra los valores extraídos para confirmación/edición.
- Campos editables: Nombre del producto, Marca, Tamaño de porción (gramos), y cada valor nutricional.
- Botón "Guardar Producto" que llama a `products.createProductFromScan()` y `storage.addProduct()`.

### 5.2. Pantalla de Lista de Productos (`products.html`)
- Lista todos los productos guardados.
- Botón "Crear Producto Manual" que lleva a un formulario.
- Al hacer clic en un producto, se puede ver su detalle.

### 5.3. Pantalla de Planificador de Comidas (`meals.html`)
- Selector de fecha.
- Lista de comidas para la fecha seleccionada.
- Botón "Nueva Comida".
- Dentro de una comida:
  - Botón "Agregar Producto" que abre un modal para seleccionar un producto de la lista y ingresar los gramos.
  - Muestra las entradas de la comida y el total nutricional.
  - Botón "Eliminar Entrada".

### 5.4. Pantalla de Rastreo (`dashboard.html`)
- Muestra el resumen nutricional del día seleccionado.
- Gráficos o barras de progreso para los nutrientes rastreados.
- Opción para cambiar la fecha.

### 5.5. Pantalla de Configuración (`settings.html`)
- Campos para configurar el endpoint OCR, API Key y Modelo.
- Lista de nutrientes a rastrear (checkboxes).

## 6. Criterios de Aceptación

### AC-1: Escaneo de Etiquetas
- Dado que el usuario sube una imagen de una etiqueta nutricional (como las de las imágenes adjuntas),
- Cuando el usuario procesa la imagen,
- Entonces el OCR extrae los valores nutricionales (energía, grasas, carbohidratos, proteínas, sal, etc.) y los presenta para confirmación.

### AC-2: Normalización Multilingüe
- Dado que las etiquetas pueden estar en alemán, holandés, francés, italiano o español,
- Cuando el OCR extrae los nombres de los nutrientes,
- Entonces el sistema los normaliza a los campos internos definidos (ej: "Energie" -> "energyKcal").

### AC-3: Cálculo Nutricional
- Dado que un producto tiene valores nutricionales por 100g,
- Cuando el usuario agrega una entrada de comida con X gramos,
- Entonces los valores nutricionales de la entrada se calculan escalando los valores por 100g a X gramos.

### AC-4: Persistencia de Datos
- Dado que el usuario guarda un producto o una comida,
- Entonces los datos se almacenan en `localStorage` y persisten entre sesiones del navegador.

### AC-5: Rastreo de Nutrientes
- Dado que el usuario tiene una lista de nutrientes para rastrear,
- Cuando el usuario revisa el dashboard,
- Entonces se muestran los totales diarios de esos nutrientes para todas las comidas del día.

### AC-6: Creación Manual de Productos
- Dado que no hay una etiqueta para escanear,
- Cuando el usuario crea un producto manualmente,
- Entonces puede ingresar el nombre, marca, tamaño de porción y valores nutricionales.

### AC-7: Configuración de OCR
- Dado que el usuario configura su endpoint OCR, API Key y modelo,
- Entonces el sistema usa esa configuración para procesar las imágenes.

## 7. Ejemplos de las Imágenes Adjuntas

### Imagen 1 (Chocolate)
- **Producto:** Barra de chocolate sin gluten (Dr. Schär)
- **Idiomas:** Alemán, Francés, Holandés, Italiano
- **Valores por 100g:**
  - Energía: 2292 kJ / 549 kcal
  - Grasas: 33 g
  - Grasas saturadas: 13 g
  - Carbohidratos: 55 g
  - Azúcares: 45 g
  - Fibra: 2.4 g
  - Proteína: 6.8 g
  - Sal: 0.18 g
- **Tamaño de porción:** 30 g (1 Melto)

### Imagen 2 (Jugo)
- **Producto:** Versgeperst Appel-Sinaasappel- en Mangosap (Jugo de manzana, naranja y mango)
- **Idioma:** Holandés
- **Valores por 100 ml:**
  - Energía: 199 kJ / 47 kcal
  - Grasas: 0 g
  - Carbohidratos: 11 g
  - Azúcares: 10 g
  - Proteína: 0.7 g
  - Sal: 0 g
- **Tamaño de porción:** 200 ml (1 glas)

### Imagen 3 (Aceite de Oliva)
- **Producto:** Extra Olijfolie van de Eerste Persing (Aceite de oliva virgen extra)
- **Idioma:** Holandés
- **Valores por 100 ml:**
  - Energía: 3404 kJ / 828 kcal
  - Grasas: 92 g
  - Grasas saturadas: 14 g
  - Carbohidratos: 0 g
  - Azúcares: 0 g
  - Proteína: 0 g
  - Sal: 0 g
- **Tamaño de porción:** 200 ml