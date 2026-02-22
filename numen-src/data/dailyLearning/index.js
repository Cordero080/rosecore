// Daily Learning Data - Index
// Exports all learning categories for easy importing

import techJargon from "./techJargon.json";
import bigO from "./bigO.json";
import loops from "./loops.json";
import methods from "./methods.json";
import vocabulary from "./vocabulary.json";
import mythology from "./mythology.json";
import {
  TRANSLATIONS,
  getTranslatedItem,
  getUILabel,
  getCategoryName,
} from "./translations";

// Get today's items based on day of year (everyone sees the same word each day)
const getDayOfYear = () => {
  const now = new Date();
  const start = new Date(now.getFullYear(), 0, 0);
  const diff = now - start;
  const oneDay = 1000 * 60 * 60 * 24;
  return Math.floor(diff / oneDay);
};

// Seeded random - produces consistent "random" number for same seed
// Same day = same word for all users, but order feels random
const seededRandom = (seed) => {
  const x = Math.sin(seed * 9999) * 10000;
  return x - Math.floor(x);
};

// Get item for today from a category using seeded randomization
// Ensures variety even with large word lists - doesn't just go 1,2,3...
export const getTodayItem = (category) => {
  const dayOfYear = getDayOfYear();
  // Use category length as part of seed so different categories get different words
  const seed = dayOfYear + category.length * 1000;
  const index = Math.floor(seededRandom(seed) * category.length);
  return category[index];
};

// Get all of today's learning items
export const getTodayLearning = () => ({
  techJargon: getTodayItem(techJargon),
  bigO: getTodayItem(bigO),
  loop: getTodayItem(loops),
  method: getTodayItem(methods),
  vocabulary: getTodayItem(vocabulary),
  mythology: getTodayItem(mythology),
});

// Export raw data for the full /learn page
export { techJargon, bigO, loops, methods, vocabulary, mythology };

// Export translations
export { TRANSLATIONS, getTranslatedItem, getUILabel, getCategoryName };

// Category metadata
export const CATEGORIES = [
  { id: "techJargon", name: "Tech", icon: "💻", data: techJargon },
  { id: "bigO", name: "Big O", icon: "📊", data: bigO },
  { id: "loop", name: "Loop", icon: "🔄", data: loops },
  { id: "method", name: "Method", icon: "⚡", data: methods },
  { id: "vocabulary", name: "Vocab", icon: "📚", data: vocabulary },
  { id: "mythology", name: "Myth", icon: "🏛️", data: mythology },
];
