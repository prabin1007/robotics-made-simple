import partsCsv from '../../RoboticsPartDB/robotics_parts_directory_v2_buy_links.csv?raw';
import offersCsv from '../../RoboticsPartDB/robotics_online_offers_seed.csv?raw';
import storesCsv from '../../RoboticsPartDB/robotics_local_stores_bengaluru_seed.csv?raw';
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
  { words: ['ambient temperature', 'room temperature', 'humidity'], partId: 'SNS-005' },
  { words: ['motion', 'movement detector'], partId: 'SNS-006' },
  { words: ['tilt', 'gesture', 'rotation'], partId: 'SNS-009' },
  { words: ['display', 'show text', 'screen'], partId: 'OUT-005' },
  { words: ['beep', 'buzzer', 'alarm'], partId: 'OUT-003' },
];

function hasAny(text, words) {
  return words.some((word) => text.includes(word));
}

function decoratePart(part) {
  const partOffers = offersByPart.get(part.part_id) ?? [];
  const tutorial = tutorialsByPart.get(part.part_id);
  const cheapestLead = partOffers.reduce((best, offer) => {
    const price = Number(offer.price_inr);
    if (!Number.isFinite(price)) return best;
    return !best || price < Number(best.price_inr) ? offer : best;
  }, null);

  return {
    ...part,
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

export function buildPartsPlan(brief) {
  const text = `${brief.project} ${brief.behaviors}`.toLowerCase();
  const selectedIds = new Set(BASE_PART_IDS);
  const notes = [];
  const gaps = [];

  for (const rule of FEATURE_RULES) {
    if (hasAny(text, rule.words)) selectedIds.add(rule.partId);
  }

  if (hasAny(text, ['voice', 'speak', 'command', 'listen', 'instruction'])) {
    selectedIds.add('COM-001');
    notes.push('Voice route in this catalogue: a phone recognises the spoken word, then sends a command through the HC-05 Bluetooth module. The database does not yet contain a standalone word-recognition module.');
  }

  if (hasAny(text, ['follow person', 'follow a person', 'human follow'])) {
    selectedIds.add('SNS-001');
    notes.push('The HC-SR04 can follow distance to the nearest object; it cannot confirm that the object is a person.');
  }

  if (hasAny(text, ['thermal', 'heat source', 'warm object', 'object temperature'])) {
    gaps.push('No non-contact object-temperature or thermal-array sensor exists in the current catalogue. DHT11 is not a substitute because it measures nearby air.');
  }

  if (!brief.country.toLowerCase().includes('india')) {
    notes.push('Seller searches and price leads in this database are India-focused; use the specifications to search in the selected country.');
  }

  notes.push(`The budget is ${brief.budget}. Only ${offers.length} dated price leads exist, so this V1 does not claim the full plan fits the budget.`);

  return {
    parts: [...selectedIds].map((partId) => partsById.get(partId)).filter(Boolean).map(decoratePart),
    notes,
    gaps,
  };
}

export function getLocalStores(country) {
  const location = country.toLowerCase();
  if (!location.includes('india') && !location.includes('bengaluru') && !location.includes('bangalore')) return [];
  return stores;
}

export const parsedRowCounts = { parts: parts.length, offers: offers.length, stores: stores.length };
