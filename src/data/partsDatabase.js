import partsCsv from '../../RoboticsPartDB/robotics_parts_directory_v5_school_project_prices.csv?raw';
import offersCsv from '../../RoboticsPartDB/robotics_online_offers_v5_school_project_prices.csv?raw';
import storesCsv from '../../RoboticsPartDB/robotics_local_stores_bengaluru_v5_school_project_prices.csv?raw';
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
const tutorials = parseCsv(howItWorksCsv);
const partsById = new Map(parts.map((part) => [part.part_id, part]));
const tutorialsByPart = new Map(tutorials.map((tutorial) => [tutorial.part_id, tutorial]));
const offersByPart = new Map();

for (const offer of offers) {
  const current = offersByPart.get(offer.part_id) ?? [];
  current.push(offer);
  offersByPart.set(offer.part_id, current);
}

const BASE_PART_IDS = [
  'CTRL-001', 'MOT-001', 'DRV-001', 'PWR-001',
  'CON-001', 'CON-002', 'CON-003', 'CON-005',
  'MECH-001', 'MECH-002', 'MECH-003', 'MECH-004', 'TOOL-002',
];

const FEATURE_RULES = [
  { words: ['avoid', 'obstacle', 'distance', 'near'], partId: 'SNS-001' },
  { words: ['line follow', 'follow line', 'track line'], partId: 'SNS-003' },
  { words: ['light', 'dark'], partId: 'SNS-004' },
  { words: ['temperature', 'humidity'], partId: 'SNS-005' },
  { words: ['motion', 'movement detector'], partId: 'SNS-006' },
  { words: ['sound', 'clap', 'noise'], partId: 'SNS-008' },
  { words: ['tilt', 'gesture', 'rotation'], partId: 'SNS-009' },
  { words: ['display', 'show text', 'screen'], partId: 'OUT-005' },
  { words: ['beep', 'buzzer', 'alarm'], partId: 'OUT-003' },
];

const SUPPORTED_BEHAVIOURS = [
  ['move', 'drive', 'forward', 'backward', 'reverse', 'left', 'right', 'turn', 'stop', 'wheel'],
  ['avoid', 'obstacle', 'distance', 'near'],
  ['line follow', 'follow line', 'track line'],
  ['light', 'dark'],
  ['temperature', 'humidity'],
  ['motion', 'movement detector'],
  ['sound', 'clap', 'noise'],
  ['tilt', 'gesture', 'rotation'],
  ['display', 'show text', 'screen'],
  ['beep', 'buzzer', 'alarm'],
  ['voice', 'speak', 'spoken', 'hear', 'command', 'listen', 'instruction'],
  ['follow person', 'follow a person', 'human follow'],
];

const UNSUPPORTED_PLATFORMS = ['fly', 'flying', 'drone', 'airborne', 'swim', 'underwater', 'boat', 'walking legs', 'walk on legs', 'biped'];

function hasAny(text, words) {
  return words.some((word) => text.includes(word));
}

function findUnsupportedRequirements(brief) {
  const requirements = brief.behaviors
    .split(/\r?\n|[,;.]+|\b(?:and then|then|and|but)\b/i)
    .map((requirement) => requirement.trim())
    .filter(Boolean);

  const unsupported = requirements.filter((requirement) => {
    const normalised = requirement.toLowerCase();
    return !SUPPORTED_BEHAVIOURS.some((words) => hasAny(normalised, words));
  });

  const projectText = `${brief.project} ${brief.behaviors}`.toLowerCase();
  if (hasAny(projectText, UNSUPPORTED_PLATFORMS)) {
    unsupported.unshift('This V1 supports ground robots with wheels, not flying, swimming, or walking-leg robots');
  }

  return [...new Set(unsupported)];
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
  const text = `${brief.project} ${brief.behaviors}`.toLowerCase();
  const requestsObjectTemperature = hasAny(text, ['thermal', 'heat source', 'warm object', 'object temperature']);
  const selectedIds = new Set(BASE_PART_IDS);
  const notes = [];
  const gaps = [];
  const unsupportedRequirements = findUnsupportedRequirements(brief);

  for (const rule of FEATURE_RULES) {
    if (rule.partId === 'SNS-005') {
      const requestsAirTemperatureOrHumidity = text.includes('humidity')
        || (text.includes('temperature') && !requestsObjectTemperature);
      if (requestsAirTemperatureOrHumidity) selectedIds.add(rule.partId);
    } else if (hasAny(text, rule.words)) {
      selectedIds.add(rule.partId);
    }
  }

  if (hasAny(text, ['voice', 'speak', 'spoken', 'hear', 'command', 'listen', 'instruction'])) {
    selectedIds.add('COM-001');
    notes.push('Voice route in this catalogue: a phone recognises the spoken word, then sends a command through the HC-05 Bluetooth module. The database does not yet contain a standalone word-recognition module.');
  }

  if (hasAny(text, ['follow person', 'follow a person', 'human follow'])) {
    selectedIds.add('SNS-001');
    notes.push('The HC-SR04 can follow distance to the nearest object; it cannot confirm that the object is a person.');
  }

  if (requestsObjectTemperature) {
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
    parts: [...selectedIds].map((partId) => partsById.get(partId)).filter(Boolean).map(decoratePart),
    notes,
    gaps,
    unsupportedRequirements,
    isPartial: unsupportedRequirements.length > 0 || gaps.length > 0,
  };
}

export function getLocalStores(country) {
  if (!isBengaluruLocation(country)) return [];
  return stores.filter((store) => store.record_type === 'store_directory');
}

export const parsedRowCounts = { parts: parts.length, offers: offers.length, stores: stores.length };
