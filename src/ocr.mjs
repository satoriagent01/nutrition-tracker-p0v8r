/**
 * OCR module - extracts nutrition data from food labels using an OpenAI-compatible endpoint.
 * In production, calls the configured API. For testing, can be mocked.
 */

const DEFAULT_CONFIG = {
  ocrEndpoint: 'https://api.openai.com/v1',
  ocrApiKey: '',
  ocrModel: 'gpt-4o',
};

/**
 * Extract nutrition values from a base64-encoded image of a food label.
 * Calls the configured OpenAI-compatible endpoint.
 *
 * @param {string} imageBase64 - Base64-encoded image data
 * @param {Object} [config] - Optional config override { ocrEndpoint, ocrApiKey, ocrModel }
 * @returns {Promise<NutritionValues>} Extracted nutrition values per 100g
 */
export async function extractNutrition(imageBase64, config) {
  const cfg = { ...DEFAULT_CONFIG, ...config };
  const endpoint = cfg.ocrEndpoint || DEFAULT_CONFIG.ocrEndpoint;
  const apiKey = cfg.ocrApiKey || DEFAULT_CONFIG.ocrApiKey;
  const model = cfg.ocrModel || DEFAULT_CONFIG.ocrModel;

  const response = await fetch(`${endpoint}/chat/completions`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model,
      messages: [
        {
          role: 'user',
          content: [
            {
              type: 'text',
              text: 'Extract the nutritional information from this food label. Return a JSON object with keys: energyKcal, energyKj, fat, saturatedFat, carbohydrates, sugars, fiber, protein, salt. All values should be per 100g (or per 100ml for liquids).',
            },
            {
              type: 'image_url',
              image_url: { url: imageBase64 },
            },
          ],
        },
      ],
      max_tokens: 500,
    }),
  });

  if (!response.ok) {
    throw new Error(`OCR API error: ${response.status} ${response.statusText}`);
  }

  const data = await response.json();
  const content = data.choices?.[0]?.message?.content || '';

  // Parse the JSON from the response
  try {
    // Try to extract JSON from the response text
    const jsonMatch = content.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      const parsed = JSON.parse(jsonMatch[0]);
      return {
        energyKcal: Number(parsed.energyKcal) || 0,
        energyKj: Number(parsed.energyKj) || 0,
        fat: Number(parsed.fat) || 0,
        saturatedFat: Number(parsed.saturatedFat) || 0,
        carbohydrates: Number(parsed.carbohydrates) || 0,
        sugars: Number(parsed.sugars) || 0,
        fiber: Number(parsed.fiber) || 0,
        protein: Number(parsed.protein) || 0,
        salt: Number(parsed.salt) || 0,
      };
    }
  } catch {
    // If parsing fails, return zeros
  }

  return {
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
}