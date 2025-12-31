// Client-side NLP matching for city Q&A
// No API costs - all processing happens in the browser

/**
 * Calculate similarity between query and tip using keyword matching
 * @param {string} query - User's question
 * @param {object} tip - Tip object with text and keywords
 * @returns {number} - Similarity score (0-1)
 */
function calculateSimilarity(query, tip) {
  const queryLower = query.toLowerCase();
  const tipTextLower = tip.text.toLowerCase();

  let score = 0;

  // 1. Direct text matching (highest weight)
  const queryWords = queryLower.split(/\s+/).filter(w => w.length > 2);
  queryWords.forEach(word => {
    if (tipTextLower.includes(word)) {
      score += 3;
    }
  });

  // 2. Keyword matching (medium weight)
  if (tip.keywords) {
    tip.keywords.forEach(keyword => {
      if (queryLower.includes(keyword)) {
        score += 5;
      }
    });
  }

  // 3. Category matching (lower weight)
  const categoryLower = tip.category.toLowerCase();
  if (queryLower.includes(categoryLower) ||
      categoryLower.split('&').some(cat => queryLower.includes(cat.trim()))) {
    score += 2;
  }

  return score;
}

/**
 * Enhanced question patterns with common travel queries
 */
const questionPatterns = {
  transportation: ['get around', 'transport', 'travel', 'bus', 'train', 'metro', 'taxi', 'uber', 'ola', 'drive', 'car', 'bike', 'dart', 'luas', 'rickshaw', 'auto', 'commute', 'namma metro'],
  food: ['eat', 'food', 'restaurant', 'drink', 'pub', 'bar', 'coffee', 'breakfast', 'lunch', 'dinner', 'dosa', 'biryani', 'guinness', 'pint', 'darshini', 'mtr'],
  budget: ['cheap', 'budget', 'free', 'save', 'discount', 'affordable', 'money', 'cost', 'expensive', 'price'],
  attractions: ['see', 'visit', 'attraction', 'sightseeing', 'museum', 'park', 'temple', 'church', 'monument', 'gallery', 'lalbagh', 'cubbon', 'trinity'],
  culture: ['culture', 'etiquette', 'custom', 'tradition', 'people', 'language', 'avoid', 'taboo', 'respect', 'greeting', 'kannada', 'irish'],
  safety: ['safe', 'safety', 'danger', 'avoid', 'scam', 'pickpocket', 'night', 'area'],
  weather: ['weather', 'climate', 'rain', 'pack', 'clothing', 'jacket', 'umbrella', 'season', 'temperature'],
  accommodation: ['stay', 'hotel', 'accommodation', 'sleep', 'hostel', 'airbnb'],
  nightlife: ['nightlife', 'party', 'club', 'pub', 'bar', 'brewery', 'beer', 'drinks'],
  shopping: ['shop', 'shopping', 'buy', 'market', 'mall', 'store', 'souvenir'],
};

/**
 * Detect question intent from user query
 * @param {string} query - User's question
 * @returns {string[]} - Array of matching categories
 */
function detectIntent(query) {
  const queryLower = query.toLowerCase();
  const matchedCategories = [];

  Object.entries(questionPatterns).forEach(([category, patterns]) => {
    if (patterns.some(pattern => queryLower.includes(pattern))) {
      matchedCategories.push(category);
    }
  });

  return matchedCategories;
}

/**
 * Find relevant tips for a user's question
 * @param {string} query - User's question
 * @param {Array} tips - Array of tip objects
 * @param {number} limit - Maximum number of results (default: 5)
 * @returns {Array} - Sorted array of relevant tips with scores
 */
export function findRelevantTips(query, tips, limit = 5) {
  if (!query || query.trim().length < 3) {
    return [];
  }

  // Calculate similarity scores for all tips
  const scoredTips = tips.map(tip => ({
    ...tip,
    score: calculateSimilarity(query, tip)
  }));

  // Filter out tips with zero score and sort by score
  const relevantTips = scoredTips
    .filter(tip => tip.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, limit);

  return relevantTips;
}

/**
 * Generate a helpful response when no matches are found
 * @param {string} query - User's question
 * @param {string} cityName - Name of the city
 * @returns {object} - Fallback response object
 */
export function generateFallbackResponse(query, cityName) {
  const intents = detectIntent(query);

  let suggestions = [];

  if (intents.includes('transportation')) {
    suggestions.push('Try asking: "How do I get around ' + cityName + '?"');
  }
  if (intents.includes('food')) {
    suggestions.push('Try asking: "Where should I eat in ' + cityName + '?"');
  }
  if (intents.includes('budget')) {
    suggestions.push('Try asking: "What are free things to do in ' + cityName + '?"');
  }

  if (suggestions.length === 0) {
    suggestions = [
      'Try asking about transportation, food, or attractions',
      'Browse through the tips carousel below for more information',
      'Use the quick suggestions to get started',
    ];
  }

  return {
    message: `I couldn't find specific tips for "${query}". Here are some suggestions:`,
    suggestions,
    showQuickSuggestions: true,
  };
}

/**
 * Format tips into a readable response
 * @param {Array} tips - Array of relevant tips
 * @param {string} query - Original user query
 * @returns {object} - Formatted response object
 */
export function formatResponse(tips, query) {
  if (tips.length === 0) {
    return null;
  }

  // Group tips by category
  const tipsByCategory = tips.reduce((acc, tip) => {
    if (!acc[tip.category]) {
      acc[tip.category] = [];
    }
    acc[tip.category].push(tip);
    return acc;
  }, {});

  return {
    query,
    totalResults: tips.length,
    tipsByCategory,
    allTips: tips,
  };
}

/**
 * Main function to answer a user's question
 * @param {string} query - User's question
 * @param {Array} tips - Array of city tips
 * @param {string} cityName - Name of the city
 * @returns {object} - Complete response object
 */
export function answerQuestion(query, tips, cityName) {
  const relevantTips = findRelevantTips(query, tips, 5);

  if (relevantTips.length === 0) {
    return generateFallbackResponse(query, cityName);
  }

  const formattedResponse = formatResponse(relevantTips, query);

  return {
    success: true,
    ...formattedResponse,
  };
}

/**
 * Get suggested questions based on available tips
 * @param {Array} tips - Array of city tips
 * @returns {Array} - Array of suggested question strings
 */
export function getSuggestedQuestions(tips) {
  const categories = [...new Set(tips.map(tip => tip.category))];

  const suggestions = [];

  categories.forEach(category => {
    const categoryLower = category.toLowerCase();
    if (categoryLower.includes('transport')) {
      suggestions.push('How do I get around the city?');
    } else if (categoryLower.includes('eating')) {
      suggestions.push('Where should I eat and drink?');
    } else if (categoryLower.includes('budget')) {
      suggestions.push('What free things can I do?');
    } else if (categoryLower.includes('culture') || categoryLower.includes('etiquette')) {
      suggestions.push('What cultural norms should I know?');
    } else if (categoryLower.includes('safety') || categoryLower.includes('weather')) {
      suggestions.push('What should I pack and know about safety?');
    }
  });

  return [...new Set(suggestions)]; // Remove duplicates
}
