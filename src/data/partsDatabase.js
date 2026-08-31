import partsCsv from '../../RoboticsPartDB/robotics_parts_directory_v5_school_project_prices.csv?raw';
import offersCsv from '../../RoboticsPartDB/robotics_online_offers_v5_school_project_prices.csv?raw';
import storesCsv from '../../RoboticsPartDB/robotics_local_stores_bengaluru_v5_school_project_prices.csv?raw';
import recipesCsv from '../../RoboticsPartDB/robot_recipes_v1.csv?raw';
import recipeBomCsv from '../../RoboticsPartDB/robot_recipe_bom_v1.csv?raw';
import howItWorksCsv from './howItWorksIndex.csv?raw';

function parseCsv(text) {
  const rows = [];
  let row = [];
  let value = '';
  let quoted = false;

  for (let index = 0; index < text.length; index += 1) {
    const character = text[index];
    const next = text[index + 1];

    if (character === '"' && quoted && next === '"') {
      value += '"';
      index += 1;
    } else if (character === '"') {
      quoted = !quoted;
    } else if (character === ',' && !quoted) {
      row.push(value.trim());
      value = '';
    } else if ((character === '\n' || character === '\r') && !quoted) {
      if (character === '\r' && next === '\n') index += 1;
      row.push(value.trim());
      if (row.some(Boolean)) rows.push(row);
      row = [];
      value = '';
    } else {
      value += character;
    }
  }

  row.push(value.trim());
  if (row.some(Boolean)) rows.push(row);

  const [rawHeaders = [], ...dataRows] = rows;
  const headers = rawHeaders.map((header) => header.replace(/^\uFEFF/, ''));
  return dataRows.map((cells) => Object.fromEntries(headers.map((header, index) => [header, cells[index] ?? ''])));
}

const parts = parseCsv(partsCsv);
const offers = parseCsv(offersCsv);
const stores = parseCsv(storesCsv);
const recipes = parseCsv(recipesCsv);
const recipeBom = parseCsv(recipeBomCsv);
const tutorials = parseCsv(howItWorksCsv);
const partsById = new Map(parts.map((part) => [part.part_id, part]));
const tutorialsByPart = new Map(tutorials.map((tutorial) => [tutorial.part_id, tutorial]));
const offersByPart = new Map();

for (const offer of offers) {
  const current = offersByPart.get(offer.part_id) ?? [];
  current.push(offer);
  offersByPart.set(offer.part_id, current);
}

const DOG_RECIPE_ID = 'ANIMALOID-DOG-2WD-VOICE-V1';
const dogRecipe = recipes.find((recipe) => recipe.recipe_id === DOG_RECIPE_ID);
const dogRecipeBom = recipeBom.filter((row) => row.recipe_id === DOG_RECIPE_ID);

const EXTRA_CAPABILITIES = [
  { label: 'Obstacle avoidance', words: ['avoid obstacle', 'avoid obstacles', 'obstacle avoidance'] },
  { label: 'Line following', words: ['line follow', 'follow line', 'track line'] },
  { label: 'Thermal or object-temperature sensing', words: ['thermal', 'heat source', 'warm object', 'object temperature'] },
  { label: 'Face recognition', words: ['recognise face', 'recognize face', 'face recognition'] },
  { label: 'GPS location', words: ['gps', 'location tracking', 'send location'] },
  { label: 'Person following', words: ['follow person', 'follow a person', 'human follow'] },
  { label: 'Walking legs', words: ['walking legs', 'walk on legs', 'four legs', 'quadruped', 'biped'] },
];

function hasAny(text, words) {
  return words.some((word) => text.includes(word));
}

function describeRecipe(recipe) {
  if (!recipe) return null;
  return {
    id: recipe.recipe_id,
    name: recipe.recipe_name,
    version: recipe.version,
    platform: recipe.platform,
    supportedOutcome: recipe.supported_outcome,
    prerequisites: recipe.prerequisites.split('|').filter(Boolean),
  };
}

function matchDogRecipe(brief) {
  const projectText = brief.project.toLowerCase();
  const behaviourText = brief.behaviors.toLowerCase();
  const isDogProject = hasAny(projectText, ['dog', 'puppy', 'canine']);

  if (!isDogProject) {
    return {
      matchType: 'none',
      unsupportedRequirements: ['The only V1 recipe is a dog-shaped robot with hidden wheels and phone-assisted left/right commands.'],
      extraCapabilities: [],
    };
  }

  const hasVoice = hasAny(behaviourText, ['voice', 'spoken', 'hear', 'listen', 'say', 'command']);
  const hasDirection = hasAny(behaviourText, ['left', 'right', 'direction']);
  const extraCapabilities = EXTRA_CAPABILITIES
    .filter((capability) => hasAny(`${projectText} ${behaviourText}`, capability.words))
    .map((capability) => capability.label);
  const unsupportedRequirements = [...extraCapabilities];

  if (!hasVoice) unsupportedRequirements.unshift('Phone-assisted voice control is not clearly requested.');
  if (!hasDirection) unsupportedRequirements.unshift('A left or right movement command is not clearly requested.');

  return {
    matchType: unsupportedRequirements.length ? 'partial' : 'exact',
    unsupportedRequirements: [...new Set(unsupportedRequirements)],
    extraCapabilities,
  };
}

function decoratePart(part) {
  const partOffers = offersByPart.get(part.part_id) ?? [];
  const tutorial = tutorialsByPart.get(part.part_id);
  const cheapestLead = partOffers.reduce((best, offer) => {
    if (!offer.price_inr?.trim()) return best;
    const price = Number(offer.price_inr);
    if (!Number.isFinite(price) || price <= 0) return best;
    return !best || price < Number(best.price_inr) ? offer : best;
  }, null);

  return {
    ...part,
    priceEstimate: {
      min: Number(part.price_min_inr),
      typical: Number(part.school_project_price_inr || part.price_typical_inr),
      max: Number(part.price_max_inr),
      confidence: part.price_confidence,
      basis: part.price_basis,
      asOf: part.price_as_of,
      note: part.school_price_note,
    },
    tutorial: tutorial ? {
      file: `/how-it-works/${tutorial.tutorial_file}`,
      title: tutorial.part_name,
    } : null,
    priceLead: cheapestLead,
    searchLinks: [
      { label: 'Search Robu', url: part.online_search_robu },
      { label: 'Search Robocraze', url: part.online_search_robocraze },
      { label: 'Search Amazon India', url: part.online_search_amazon_in },
    ].filter((link) => link.url),
  };
}

export const databaseStats = {
  parts: parts.length,
  categories: new Set(parts.map((part) => part.category)).size,
  priceLeads: offers.length,
  bengaluruStores: stores.length,
};

export function isBengaluruLocation(location = '') {
  const normalised = location.toLowerCase();
  return normalised.includes('bengaluru') || normalised.includes('bangalore');
}

export function buildPartsPlan(brief) {
  const recipeMatch = matchDogRecipe(brief);
  const notes = [];
  const gaps = [];
  const selectedParts = recipeMatch.matchType === 'none' ? [] : dogRecipeBom.map((bomRow) => {
    const part = partsById.get(bomRow.part_id);
    if (!part) {
      gaps.push(`Recipe slot ${bomRow.slot_id} refers to missing part ${bomRow.part_id}.`);
      return null;
    }
    return decoratePart({ ...part, usual_qty: bomRow.qty, recipeRole: bomRow.role, recipeReason: bomRow.reason });
  }).filter(Boolean);

  if (recipeMatch.matchType !== 'none') {
    notes.push('Voice route in this catalogue: a phone recognises the spoken word, then sends a command through the HC-05 Bluetooth module. The database does not yet contain a standalone word-recognition module.');
  }

  if (recipeMatch.extraCapabilities.includes('Thermal or object-temperature sensing')) {
    gaps.push('The expanded catalogue contains thermal-camera options, but this V1 cannot safely choose the exact camera, computer and power setup for a beginner build. DHT11 is not a substitute because it measures nearby air.');
  }

  if (!isBengaluruLocation(brief.country)) {
    notes.push('Local store details are currently available only for Bangalore. Your parts plan is still shown, and you can use the online searches for your city.');
  }

  if (!brief.country.toLowerCase().includes('india')) {
    notes.push('Seller searches and price leads in this database are India-focused; use the specifications to search in the selected country.');
  }

  notes.push(`The budget is ${brief.budget}. Price ranges are planning estimates dated ${parts[0]?.price_as_of || 'in the catalogue'}, not live quotes or stock confirmations.`);

  return {
    recipe: describeRecipe(dogRecipe),
    matchType: recipeMatch.matchType,
    parts: selectedParts,
    notes,
    gaps,
    unsupportedRequirements: recipeMatch.unsupportedRequirements,
    isPartial: recipeMatch.matchType !== 'exact' || gaps.length > 0,
  };
}

export function getLocalStores(country) {
  if (!isBengaluruLocation(country)) return [];
  return stores.filter((store) => store.record_type === 'store_directory');
}

export const parsedRowCounts = { parts: parts.length, offers: offers.length, stores: stores.length };
