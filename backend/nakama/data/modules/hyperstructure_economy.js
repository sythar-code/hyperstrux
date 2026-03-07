// Runtime JS for Nakama. Mirrors hyperstructure_economy.ts logic.

var ECONOMY_COLLECTION = "hyperstructure";
var ECONOMY_KEY = "economy_state_v1";
var INVENTORY_COLLECTION = "hyperstructure";
var INVENTORY_KEY = "inventory_state_v1";
var ALLIANCE_COLLECTION = "hyperstructure_alliance";
var ALLIANCE_PROFILE_COLLECTION = "hyperstructure";
var ALLIANCE_PROFILE_KEY = "alliance_profile_v1";
var PLAYER_PROFILE_COLLECTION = "player_profile";
var PLAYER_PROFILE_KEY = "profile_v1";
var ALLIANCES_PUBLIC_COLLECTION = "alliances";
var ALLIANCE_MEMBERS_COLLECTION = "alliance_members";
var ALLIANCE_INDEX_COLLECTION = "alliance_index";
var ALLIANCE_INBOX_COLLECTION = "alliance_inbox";
var ALLIANCE_INBOX_KEY = "inbox_v1";
var SYSTEM_USER_ID = "00000000-0000-0000-0000-000000000000";
var ECONOMY_WRITE_RETRIES = 6;
var INVENTORY_WRITE_RETRIES = 6;
var ALLIANCE_WRITE_RETRIES = 6;
var CREDIT_RATE_DEFAULT = 1;
var INVENTORY_STARTER_SEED_VERSION = 5;
var LEVEL_PRODUCTION_EXPONENT = 1.15;
var COST_MULTIPLIER = 1.55;
var TIME_MULTIPLIER = 1.45;
var STORAGE_BASE = 10000;
var STORAGE_MULTIPLIER = 1.6;
var DEFAULT_ALLIANCE_MEMBER_CAP = 30;
var ALLIANCE_VOTE_DURATION_SEC = 24 * 60 * 60;
var ALLIANCE_VOTE_MIN_PARTICIPATION = 0.4;
var ALLIANCE_CREATE_COST = {
  carbone: 50000,
  titane: 5000,
  osmium: 0,
  adamantium: 0
};
var MAP_COLLECTION = "hyperstructure_map";
var MAP_RESOURCE_FIELDS_KEY = "resource_fields_v1";
var MAP_WRITE_RETRIES = 6;
var MAP_TARGET_FIELD_COUNT = 36;
var MAP_WORLD_SIZE = 10000;
var MAP_PADDING = 360;
var MAP_CENTER_EXCLUSION = 520;
var MAP_FIELD_MIN_DISTANCE = 220;
var MAP_FIELD_PLAYER_EXCLUSION = 130;
var MAP_FIELD_MAX_SPAWN_ATTEMPTS = 240;
var MAP_TRAVEL_TIME_FACTOR = 42;
var MAP_MIN_TRAVEL_SECONDS = 120;
var MAP_MAX_TRAVEL_SECONDS = 1200;
var MAP_MIN_EXTRACTION_SECONDS = 3600;
var MAP_MAX_EXTRACTION_SECONDS = 7200;
var MAP_FIELD_MIN_LIFETIME_SEC = 48 * 60 * 60;
var MAP_FIELD_MAX_LIFETIME_SEC = 120 * 60 * 60;
var ALLIANCE_NAME_REGEX = /^[A-Za-z0-9 _-]+$/;
var ALLIANCE_TAG_REGEX = /^[A-Za-z0-9]+$/;
var ALLIANCE_BLOCKED_WORDS = ["admin", "mod", "nakama", "staff", "officiel"];
var ALLIANCE_INVITE_TTL_SEC = 72 * 60 * 60;

var LEADERBOARD_PLAYER_TOTAL = "hsg_player_total";
var LEADERBOARD_PLAYER_MILITARY = "hsg_player_military";
var LEADERBOARD_PLAYER_ECONOMY = "hsg_player_economy";
var LEADERBOARD_PLAYER_RESEARCH = "hsg_player_research";
var LEADERBOARD_ALLIANCE_TOTAL = "hsg_alliance_total";

var RESOURCE_POINT_WEIGHTS = {
  carbone: 10,
  titane: 63,
  osmium: 203,
  adamantium: 423,
  magmatite: 518,
  neodyme: 563,
  chronium: 672,
  aetherium: 774,
  isotope7: 884,
  singulite: 1000
};

var POINT_MULTIPLIERS = {
  building: 1.0,
  ship: 1.0,
  defense: 1.0,
  research: 1.0
};

var RESOURCE_RARITY = {
  carbone: 10,
  titane: 25,
  osmium: 45,
  adamantium: 65,
  magmatite: 72,
  neodyme: 75,
  chronium: 82,
  aetherium: 88,
  isotope7: 94,
  singulite: 100
};

var MAP_RESOURCE_BASE_AMOUNTS = {
  carbone: { min: 60000, max: 220000 },
  titane: { min: 30000, max: 120000 },
  osmium: { min: 10000, max: 45000 },
  adamantium: { min: 3500, max: 15000 },
  magmatite: { min: 2500, max: 10000 },
  neodyme: { min: 2200, max: 9000 },
  chronium: { min: 1400, max: 6500 },
  aetherium: { min: 1000, max: 4500 },
  isotope7: { min: 700, max: 3000 },
  singulite: { min: 250, max: 1200 }
};

var MAP_FIELD_RARITY_CONFIGS = {
  COMMON: {
    id: "COMMON",
    weight: 0.45,
    quantityMultiplier: 0.8,
    maxTier: 2,
    minTypes: 1,
    maxTypes: 2,
    workMin: 320000,
    workMax: 520000
  },
  UNCOMMON: {
    id: "UNCOMMON",
    weight: 0.28,
    quantityMultiplier: 1.0,
    maxTier: 3,
    minTypes: 2,
    maxTypes: 2,
    workMin: 380000,
    workMax: 620000
  },
  RARE: {
    id: "RARE",
    weight: 0.16,
    quantityMultiplier: 1.25,
    maxTier: 5,
    minTypes: 2,
    maxTypes: 3,
    workMin: 520000,
    workMax: 850000
  },
  EPIC: {
    id: "EPIC",
    weight: 0.08,
    quantityMultiplier: 1.6,
    maxTier: 7,
    minTypes: 3,
    maxTypes: 3,
    workMin: 680000,
    workMax: 1100000
  },
  LEGENDARY: {
    id: "LEGENDARY",
    weight: 0.025,
    quantityMultiplier: 2.1,
    maxTier: 9,
    minTypes: 3,
    maxTypes: 4,
    workMin: 900000,
    workMax: 1400000
  },
  MYTHIC: {
    id: "MYTHIC",
    weight: 0.005,
    quantityMultiplier: 3.0,
    maxTier: 10,
    minTypes: 4,
    maxTypes: 4,
    workMin: 1200000,
    workMax: 2000000
  }
};

var MAP_FIELD_QUALITY_CONFIGS = {
  POOR: { id: "POOR", weight: 0.2, quantityMultiplier: 0.7 },
  STANDARD: { id: "STANDARD", weight: 0.5, quantityMultiplier: 1.0 },
  RICH: { id: "RICH", weight: 0.25, quantityMultiplier: 1.4 },
  EXCEPTIONAL: { id: "EXCEPTIONAL", weight: 0.05, quantityMultiplier: 2.0 }
};

var MAP_FIELD_DROP_TABLE = [
  { itemId: "", weight: 35 },
  { itemId: "TIME_RIFT_300", weight: 50 },
  { itemId: "TIME_RIFT_3600", weight: 10 },
  { itemId: "TIME_RIFT_10800", weight: 4 },
  { itemId: "TIME_RIFT_43200", weight: 1 }
];

var MAP_HARVEST_UNIT_STATS = {
  pegase: { harvestSpeed: 120, harvestCapacity: 50, mapSpeed: 160 },
  argo: { harvestSpeed: 320, harvestCapacity: 200, mapSpeed: 140 },
  arche_spatiale: { harvestSpeed: 700, harvestCapacity: 500, mapSpeed: 110 },
  eclaireur_stellaire: { harvestSpeed: 10, harvestCapacity: 10, mapSpeed: 300 },
  foudroyant: { harvestSpeed: 5, harvestCapacity: 12, mapSpeed: 350 },
  aurore: { harvestSpeed: 8, harvestCapacity: 7, mapSpeed: 420 },
  spectre: { harvestSpeed: 12, harvestCapacity: 5, mapSpeed: 470 },
  tempest: { harvestSpeed: 15, harvestCapacity: 4, mapSpeed: 500 },
  titanide: { harvestSpeed: 18, harvestCapacity: 8, mapSpeed: 360 },
  colosse: { harvestSpeed: 20, harvestCapacity: 12, mapSpeed: 300 }
};

var BUILDING_DEFS = {
  carbone: { baseProductionPerSec: 3.0, baseBuildSeconds: 60 },
  titane: { baseProductionPerSec: 1.55, baseBuildSeconds: 120 },
  osmium: { baseProductionPerSec: 0.62, baseBuildSeconds: 240 },
  adamantium: { baseProductionPerSec: 0.25, baseBuildSeconds: 480 },
  magmatite: { baseProductionPerSec: 0.19, baseBuildSeconds: 900 },
  neodyme: { baseProductionPerSec: 0.17, baseBuildSeconds: 1200 },
  chronium: { baseProductionPerSec: 0.12, baseBuildSeconds: 1800 },
  aetherium: { baseProductionPerSec: 0.09, baseBuildSeconds: 2700 },
  isotope7: { baseProductionPerSec: 0.06, baseBuildSeconds: 3600 },
  singulite: { baseProductionPerSec: 0.045, baseBuildSeconds: 5400 },
  entrepot: { baseBuildSeconds: 120 }
};

var BASE_BUILDING_RESOURCE_COSTS = {
  carbone: { carbone: 400 },
  titane: { carbone: 800, titane: 200 },
  osmium: { carbone: 2000, titane: 800 },
  adamantium: { carbone: 6000, titane: 2500, osmium: 500 },
  magmatite: { carbone: 12000, titane: 5000 },
  neodyme: { carbone: 18000, titane: 8000, osmium: 2000 },
  chronium: { carbone: 35000, titane: 15000, osmium: 5000 },
  aetherium: { carbone: 80000, titane: 30000, osmium: 10000 },
  isotope7: { carbone: 150000, titane: 60000, osmium: 20000 },
  singulite: { carbone: 300000, titane: 120000, osmium: 50000, adamantium: 5000 },
  entrepot: { carbone: 1000, titane: 500 }
};

var HANGAR_UNIT_DEFS = {
  eclaireur_stellaire: { id: "eclaireur_stellaire", category: "ship", buildSeconds: 60, cost: { carbone: 2000, titane: 800 } },
  foudroyant: { id: "foudroyant", category: "ship", buildSeconds: 90, cost: { carbone: 3500, titane: 1200, osmium: 200 } },
  aurore: { id: "aurore", category: "ship", buildSeconds: 180, cost: { carbone: 8000, titane: 3000, osmium: 600 } },
  spectre: { id: "spectre", category: "ship", buildSeconds: 300, cost: { carbone: 15000, titane: 6000, osmium: 2000, adamantium: 200 } },
  tempest: { id: "tempest", category: "ship", buildSeconds: 420, cost: { carbone: 28000, titane: 12000, osmium: 4500, adamantium: 500 } },
  titanide: { id: "titanide", category: "ship", buildSeconds: 720, cost: { carbone: 60000, titane: 25000, osmium: 10000, adamantium: 1500 } },
  colosse: { id: "colosse", category: "ship", buildSeconds: 1200, cost: { carbone: 120000, titane: 50000, osmium: 20000, adamantium: 3000 } },
  pegase: { id: "pegase", category: "ship", buildSeconds: 80, cost: { carbone: 5000, titane: 2000 } },
  argo: { id: "argo", category: "ship", buildSeconds: 180, cost: { carbone: 12000, titane: 5000, osmium: 500 } },
  arche_spatiale: { id: "arche_spatiale", category: "ship", buildSeconds: 360, cost: { carbone: 25000, titane: 10000, osmium: 2500 } },
  projecteur_photonique: { id: "projecteur_photonique", category: "defense", buildSeconds: 90, cost: { carbone: 2500, titane: 1000 } },
  lame_de_plasma: { id: "lame_de_plasma", category: "defense", buildSeconds: 240, cost: { carbone: 8000, titane: 3500, osmium: 500 } },
  lanceur_orbitral: { id: "lanceur_orbitral", category: "defense", buildSeconds: 480, cost: { carbone: 15000, titane: 6000, osmium: 2000, adamantium: 200 } },
  champ_aegis: { id: "champ_aegis", category: "defense", buildSeconds: 900, cost: { carbone: 50000, titane: 20000, osmium: 5000, adamantium: 1000 } },
  tourelle_rafale: { id: "tourelle_rafale", category: "defense", buildSeconds: 120, cost: { carbone: 4000, titane: 1800 } },
  batterie_eclat: { id: "batterie_eclat", category: "defense", buildSeconds: 180, cost: { carbone: 6000, titane: 2500, osmium: 200 } },
  canon_ion_aiguillon: { id: "canon_ion_aiguillon", category: "defense", buildSeconds: 260, cost: { carbone: 12000, titane: 5000, osmium: 800 } },
  mine_orbitale_veille: { id: "mine_orbitale_veille", category: "defense", buildSeconds: 360, cost: { carbone: 18000, titane: 7000, osmium: 1600, adamantium: 100 } },
  canon_rail_longue_vue: { id: "canon_rail_longue_vue", category: "defense", buildSeconds: 540, cost: { carbone: 30000, titane: 12000, osmium: 4000, adamantium: 400 } },
  projecteur_emp_silence: { id: "projecteur_emp_silence", category: "defense", buildSeconds: 600, cost: { carbone: 24000, titane: 10000, osmium: 2000, neodyme: 600 } },
  mur_photonique_prisme: { id: "mur_photonique_prisme", category: "defense", buildSeconds: 720, cost: { carbone: 40000, titane: 18000, osmium: 6000, adamantium: 800 } },
  lance_gravitationnel_ancre: { id: "lance_gravitationnel_ancre", category: "defense", buildSeconds: 960, cost: { carbone: 90000, titane: 45000, osmium: 12000, adamantium: 2500, aetherium: 600 } }
};

var HANGAR_QUEUE_MAX = 64;

var RESOURCE_IDS = [
  "carbone",
  "titane",
  "osmium",
  "adamantium",
  "magmatite",
  "neodyme",
  "chronium",
  "aetherium",
  "isotope7",
  "singulite"
];

var TIME_BOOSTS_SECONDS = [60, 300, 3600, 10800, 43200];
var CHEST_SCALING_PER_AVG_LEVEL = 0.04;

var RESOURCE_TIERS = {
  carbone: 1,
  titane: 2,
  osmium: 3,
  adamantium: 4,
  magmatite: 5,
  neodyme: 6,
  chronium: 7,
  aetherium: 8,
  isotope7: 9,
  singulite: 10
};

var RESOURCE_CHEST_CONFIGS = {
  CLASSIC: {
    chestType: "CLASSIC",
    coefficientHours: 0.6
  },
  UNCOMMON: {
    chestType: "UNCOMMON",
    coefficientHours: 1.2
  },
  RARE: {
    chestType: "RARE",
    coefficientHours: 2.5
  },
  LEGENDARY: {
    chestType: "LEGENDARY",
    coefficientHours: 5
  },
  DIVINE: {
    chestType: "DIVINE",
    coefficientHours: 12
  }
};

var ITEM_DEFINITIONS = {
  TIME_RIFT_60: { id: "TIME_RIFT_60", name: "Faille Temporelle", category: "TIME_BOOST", metadata: { durationSeconds: 60 } },
  TIME_RIFT_300: { id: "TIME_RIFT_300", name: "Faille Temporelle", category: "TIME_BOOST", metadata: { durationSeconds: 300 } },
  TIME_RIFT_3600: { id: "TIME_RIFT_3600", name: "Faille Temporelle", category: "TIME_BOOST", metadata: { durationSeconds: 3600 } },
  TIME_RIFT_10800: { id: "TIME_RIFT_10800", name: "Faille Temporelle", category: "TIME_BOOST", metadata: { durationSeconds: 10800 } },
  TIME_RIFT_43200: { id: "TIME_RIFT_43200", name: "Faille Temporelle", category: "TIME_BOOST", metadata: { durationSeconds: 43200 } },
  RESOURCE_CHEST_CLASSIC: { id: "RESOURCE_CHEST_CLASSIC", name: "Coffre de Ressources", category: "RESOURCE_CRATE", metadata: { chestType: "CLASSIC" } },
  RESOURCE_CHEST_UNCOMMON: { id: "RESOURCE_CHEST_UNCOMMON", name: "Coffre de Ressources", category: "RESOURCE_CRATE", metadata: { chestType: "UNCOMMON" } },
  RESOURCE_CHEST_RARE: { id: "RESOURCE_CHEST_RARE", name: "Coffre de Ressources", category: "RESOURCE_CRATE", metadata: { chestType: "RARE" } },
  RESOURCE_CHEST_LEGENDARY: { id: "RESOURCE_CHEST_LEGENDARY", name: "Coffre de Ressources", category: "RESOURCE_CRATE", metadata: { chestType: "LEGENDARY" } },
  RESOURCE_CHEST_DIVINE: { id: "RESOURCE_CHEST_DIVINE", name: "Coffre de Ressources", category: "RESOURCE_CRATE", metadata: { chestType: "DIVINE" } }
};

var INVENTORY_STARTER_SEED = [];

function nowTs() {
  return Math.floor(Date.now() / 1000);
}

function floorSeconds(delta) {
  return Math.max(0, Math.floor(delta));
}

function defaultEconomyState() {
  var resources = {};
  for (var i = 0; i < RESOURCE_IDS.length; i++) resources[RESOURCE_IDS[i]] = { amount: 0 };

  var buildings = {};
  var keys = RESOURCE_IDS.concat(["entrepot"]);
  for (var j = 0; j < keys.length; j++) buildings[keys[j]] = { level: 0 };
  buildings.carbone.level = 1;
  buildings.titane.level = 1;
  buildings.entrepot.level = 1;

  return {
    version: 1,
    lastUpdateTs: nowTs(),
    resources: resources,
    buildings: buildings,
    premiumCredits: 0,
    building_upgrade_slot: null,
    building_construct_slot: null,
    research_slot: null,
    hangarQueue: [],
    hangarInventory: {},
    resourceExpedition: null,
    resourceReports: []
  };
}

function cloneState(s) {
  return JSON.parse(JSON.stringify(s));
}

function makeServerId(prefix, serverNowTs) {
  return prefix + "_" + serverNowTs + "_" + Math.floor(Math.random() * 1000000000).toString(36);
}

function ensureResourceExpeditionState(state) {
  if (!state || typeof state !== "object") return;
  if (!state.resourceExpedition || typeof state.resourceExpedition !== "object") {
    state.resourceExpedition = null;
  }
  if (!Array.isArray(state.resourceReports)) {
    state.resourceReports = [];
  } else if (state.resourceReports.length > 12) {
    state.resourceReports = state.resourceReports.slice(0, 12);
  }
}

function defaultMapFieldState() {
  return {
    version: 1,
    updatedAt: nowTs(),
    fields: [],
    totalSpawned: 0
  };
}

function normalizeMapFieldState(raw) {
  var state = raw && typeof raw === "object" ? raw : defaultMapFieldState();
  if (!Array.isArray(state.fields)) state.fields = [];
  if (!Number.isFinite(state.version)) state.version = 1;
  if (!Number.isFinite(state.updatedAt)) state.updatedAt = nowTs();
  if (!Number.isFinite(state.totalSpawned)) state.totalSpawned = 0;
  return state;
}

function hashString32(input) {
  var hash = 2166136261;
  var value = String(input || "");
  for (var i = 0; i < value.length; i++) {
    hash ^= value.charCodeAt(i);
    hash = Math.imul(hash, 16777619);
  }
  return hash >>> 0;
}

function mapPlayerToPlanetCoordinates(userId) {
  var seed = String(userId || "");
  var padding = MAP_PADDING;
  var range = Math.max(1, MAP_WORLD_SIZE - padding * 2);
  var x = padding + (hashString32(seed + "|x") % range);
  var y = padding + (hashString32(seed + "|y") % range);
  if (Math.abs(x - 5000) < 420 && Math.abs(y - 5000) < 420) {
    x = Math.min(MAP_WORLD_SIZE - padding, x + 520);
    y = Math.min(MAP_WORLD_SIZE - padding, y + 300);
  }
  return { x: x, y: y };
}

var MAP_PLAYER_BLOCKED_PREFIXES = ["probe-", "builder", "loadtest", "stress", "bot-", "autotest", "perf-"];

function isMapVisibleUsername(username) {
  var normalized = String(username || "").trim().toLowerCase();
  if (!normalized) return false;
  for (var i = 0; i < MAP_PLAYER_BLOCKED_PREFIXES.length; i++) {
    if (normalized.indexOf(MAP_PLAYER_BLOCKED_PREFIXES[i]) === 0) return false;
  }
  return true;
}

function listMapPlayers(nk, limit) {
  var safeLimit = Math.max(1, Math.min(10000, sanitizePositiveInt(limit || 5000)));
  if (!nk || typeof nk.sqlQuery !== "function") return [];
  var sql =
    "SELECT id, username, display_name FROM users " +
    "ORDER BY create_time DESC " +
    "LIMIT " + safeLimit;
  var rows = nk.sqlQuery(sql) || [];
  var out = [];
  var seen = {};
  for (var i = 0; i < rows.length; i++) {
    var row = rows[i] || {};
    var userId = String(row.id || "").trim();
    if (!userId || seen[userId]) continue;
    var username = String(row.username || row.display_name || "").trim();
    if (!username) username = "player-" + userId.slice(0, 8);
    if (!isMapVisibleUsername(username)) continue;
    seen[userId] = true;
    out.push({ userId: userId, username: username });
  }
  return out;
}

function pickByWeight(entries) {
  var total = 0;
  for (var i = 0; i < entries.length; i++) {
    var weight = Number(entries[i].weight || 0);
    if (!Number.isFinite(weight) || weight <= 0) continue;
    total += weight;
  }
  if (total <= 0) return entries.length > 0 ? entries[0] : null;

  var roll = Math.random() * total;
  for (var j = 0; j < entries.length; j++) {
    var w = Number(entries[j].weight || 0);
    if (!Number.isFinite(w) || w <= 0) continue;
    roll -= w;
    if (roll <= 0) return entries[j];
  }
  return entries[entries.length - 1];
}

function resourceWeightForField(resourceId, rarityConfig) {
  var rarity = RESOURCE_RARITY[resourceId] || 100;
  var base = 1 / rarity;
  var tier = RESOURCE_TIERS[resourceId] || 10;
  var tierScale = Math.max(1, rarityConfig.maxTier || 1);
  var advancedBias = 1 + ((tier - 1) / 9) * (tierScale / 10);
  return base * advancedBias;
}

function pickDistinctWeightedResources(allowedResourceIds, count, rarityConfig) {
  var target = Math.max(1, Math.min(count, allowedResourceIds.length));
  var remaining = allowedResourceIds.slice();
  var selected = [];
  while (selected.length < target && remaining.length > 0) {
    var weighted = [];
    for (var i = 0; i < remaining.length; i++) {
      weighted.push({
        resourceId: remaining[i],
        weight: resourceWeightForField(remaining[i], rarityConfig)
      });
    }
    var picked = pickByWeight(weighted);
    if (!picked) break;
    selected.push(picked.resourceId);
    var idx = remaining.indexOf(picked.resourceId);
    if (idx >= 0) remaining.splice(idx, 1);
  }
  return selected;
}

function readMapFieldState(nk) {
  var req = { collection: MAP_COLLECTION, key: MAP_RESOURCE_FIELDS_KEY, userId: SYSTEM_USER_ID };
  var read = nk.storageRead([req]);
  if (!read || read.length === 0) return { state: defaultMapFieldState(), version: "" };
  return { state: normalizeMapFieldState(read[0].value || defaultMapFieldState()), version: read[0].version || "" };
}

function distance2D(ax, ay, bx, by) {
  var dx = Number(ax || 0) - Number(bx || 0);
  var dy = Number(ay || 0) - Number(by || 0);
  return Math.sqrt(dx * dx + dy * dy);
}

function clampNumber(value, min, max) {
  var v = Number(value);
  if (!Number.isFinite(v)) v = min;
  if (v < min) return min;
  if (v > max) return max;
  return v;
}

function randomFloat(min, max) {
  var lo = Number.isFinite(min) ? min : 0;
  var hi = Number.isFinite(max) ? max : lo;
  if (hi < lo) {
    var t = hi;
    hi = lo;
    lo = t;
  }
  return lo + Math.random() * (hi - lo);
}

function mapFieldConfigList(configMap) {
  var out = [];
  var keys = Object.keys(configMap || {});
  for (var i = 0; i < keys.length; i++) out.push(configMap[keys[i]]);
  return out;
}

function pickMapFieldRarityConfig() {
  return pickByWeight(mapFieldConfigList(MAP_FIELD_RARITY_CONFIGS)) || MAP_FIELD_RARITY_CONFIGS.COMMON;
}

function pickMapFieldQualityConfig() {
  return pickByWeight(mapFieldConfigList(MAP_FIELD_QUALITY_CONFIGS)) || MAP_FIELD_QUALITY_CONFIGS.STANDARD;
}

function listMapPlayerPositions(nk) {
  var players = listMapPlayers(nk, 8000);
  var out = [];
  for (var i = 0; i < players.length; i++) {
    var planet = mapPlayerToPlanetCoordinates(players[i].userId);
    out.push({ userId: players[i].userId, x: planet.x, y: planet.y });
  }
  return out;
}

function isMapFieldPositionValid(x, y, existingFields, playerPositions) {
  var px = clampNumber(x, MAP_PADDING, MAP_WORLD_SIZE - MAP_PADDING);
  var py = clampNumber(y, MAP_PADDING, MAP_WORLD_SIZE - MAP_PADDING);
  var stations = [
    { x: 5000, y: 5000 },
    { x: 6650, y: 3550 },
    { x: 3180, y: 6390 },
    { x: 5870, y: 5480 },
    { x: 4180, y: 4320 },
    { x: 5450, y: 2980 }
  ];
  for (var s = 0; s < stations.length; s++) {
    if (distance2D(px, py, stations[s].x, stations[s].y) < MAP_CENTER_EXCLUSION) return false;
  }

  for (var i = 0; i < existingFields.length; i++) {
    var field = existingFields[i];
    if (!field || !field.id) continue;
    if (distance2D(px, py, field.x, field.y) < MAP_FIELD_MIN_DISTANCE) return false;
  }

  for (var j = 0; j < playerPositions.length; j++) {
    var p = playerPositions[j];
    if (distance2D(px, py, p.x, p.y) < MAP_FIELD_PLAYER_EXCLUSION) return false;
  }

  return true;
}

function buildMapFieldResources(rarityCfg, qualityCfg) {
  var allowed = [];
  for (var i = 0; i < RESOURCE_IDS.length; i++) {
    var rid = RESOURCE_IDS[i];
    if ((RESOURCE_TIERS[rid] || 10) <= rarityCfg.maxTier) allowed.push(rid);
  }
  if (allowed.length <= 0) allowed = ["carbone", "titane"];

  var typeCount = randomIntInclusive(rarityCfg.minTypes, rarityCfg.maxTypes);
  var selected = pickDistinctWeightedResources(allowed, typeCount, rarityCfg);
  if (selected.length <= 0) selected = [allowed[0]];

  var rows = [];
  for (var j = 0; j < selected.length; j++) {
    var resourceId = selected[j];
    var baseCfg = MAP_RESOURCE_BASE_AMOUNTS[resourceId] || { min: 5000, max: 12000 };
    var baseAmount = randomIntInclusive(baseCfg.min, baseCfg.max);
    var amount = Math.max(
      1,
      Math.floor(baseAmount * qualityCfg.quantityMultiplier * rarityCfg.quantityMultiplier)
    );
    rows.push({
      resourceId: resourceId,
      totalAmount: amount,
      remainingAmount: amount
    });
  }
  return rows;
}

function createMapField(nk, mapState, existingFields, playerPositions, serverNowTs) {
  var rarityCfg = pickMapFieldRarityConfig();
  var qualityCfg = pickMapFieldQualityConfig();
  var resources = buildMapFieldResources(rarityCfg, qualityCfg);

  var x = randomIntInclusive(MAP_PADDING, MAP_WORLD_SIZE - MAP_PADDING);
  var y = randomIntInclusive(MAP_PADDING, MAP_WORLD_SIZE - MAP_PADDING);
  var placed = false;
  for (var attempt = 0; attempt < MAP_FIELD_MAX_SPAWN_ATTEMPTS; attempt++) {
    var tx = randomIntInclusive(MAP_PADDING, MAP_WORLD_SIZE - MAP_PADDING);
    var ty = randomIntInclusive(MAP_PADDING, MAP_WORLD_SIZE - MAP_PADDING);
    if (!isMapFieldPositionValid(tx, ty, existingFields, playerPositions)) continue;
    x = tx;
    y = ty;
    placed = true;
    break;
  }
  if (!placed) {
    x = randomIntInclusive(1000, MAP_WORLD_SIZE - 1000);
    y = randomIntInclusive(1000, MAP_WORLD_SIZE - 1000);
  }

  var totalWork = randomIntInclusive(rarityCfg.workMin, rarityCfg.workMax);
  var life = randomIntInclusive(MAP_FIELD_MIN_LIFETIME_SEC, MAP_FIELD_MAX_LIFETIME_SEC);
  mapState.totalSpawned = sanitizePositiveInt(mapState.totalSpawned) + 1;

  return {
    id: makeServerId("fld", serverNowTs) + "_" + String(mapState.totalSpawned),
    x: x,
    y: y,
    rarityTier: rarityCfg.id,
    qualityTier: qualityCfg.id,
    resources: resources,
    totalExtractionWork: totalWork,
    remainingExtractionWork: totalWork,
    spawnedAt: serverNowTs,
    expiresAt: serverNowTs + life,
    occupiedByPlayerId: "",
    occupiedByUsername: "",
    occupyingFleetId: "",
    isOccupied: false,
    isVisible: true
  };
}

function normalizeMapField(field, serverNowTs) {
  if (!field || typeof field !== "object") return null;
  var id = String(field.id || "").trim();
  if (!id) return null;
  var x = clampNumber(field.x, MAP_PADDING, MAP_WORLD_SIZE - MAP_PADDING);
  var y = clampNumber(field.y, MAP_PADDING, MAP_WORLD_SIZE - MAP_PADDING);
  var resourcesIn = Array.isArray(field.resources) ? field.resources : [];
  var resources = [];
  for (var i = 0; i < resourcesIn.length; i++) {
    var row = resourcesIn[i] || {};
    var rid = String(row.resourceId || "").trim();
    if (!rid || RESOURCE_IDS.indexOf(rid) === -1) continue;
    var total = sanitizePositiveInt(row.totalAmount || row.amount || 0);
    var remaining = sanitizePositiveInt(row.remainingAmount);
    if (remaining <= 0) remaining = total;
    if (total <= 0 && remaining <= 0) continue;
    if (remaining > total && total > 0) remaining = total;
    resources.push({
      resourceId: rid,
      totalAmount: Math.max(total, remaining),
      remainingAmount: remaining
    });
  }
  if (resources.length <= 0) return null;
  var totalWork = Math.max(1, sanitizePositiveInt(field.totalExtractionWork || 0));
  var remainingWork = sanitizePositiveInt(field.remainingExtractionWork || totalWork);
  if (remainingWork > totalWork) remainingWork = totalWork;
  var spawnedAt = sanitizePositiveInt(field.spawnedAt || serverNowTs);
  var expiresAt = sanitizePositiveInt(field.expiresAt || (serverNowTs + MAP_FIELD_MIN_LIFETIME_SEC));
  return {
    id: id,
    x: x,
    y: y,
    rarityTier: String(field.rarityTier || "COMMON"),
    qualityTier: String(field.qualityTier || "STANDARD"),
    resources: resources,
    totalExtractionWork: totalWork,
    remainingExtractionWork: remainingWork,
    spawnedAt: spawnedAt,
    expiresAt: expiresAt,
    occupiedByPlayerId: String(field.occupiedByPlayerId || ""),
    occupiedByUsername: String(field.occupiedByUsername || ""),
    occupyingFleetId: String(field.occupyingFleetId || ""),
    isOccupied: Boolean(field.isOccupied),
    isVisible: field.isVisible !== false
  };
}

function compactMapFields(mapState, serverNowTs) {
  var next = [];
  var fields = Array.isArray(mapState.fields) ? mapState.fields : [];
  for (var i = 0; i < fields.length; i++) {
    var field = normalizeMapField(fields[i], serverNowTs);
    if (!field) continue;
    var hasRemaining = false;
    for (var j = 0; j < field.resources.length; j++) {
      if (field.resources[j].remainingAmount > 0) {
        hasRemaining = true;
        break;
      }
    }
    if (!field.isOccupied && (!hasRemaining || field.remainingExtractionWork <= 0)) continue;
    if (!field.isOccupied && field.expiresAt > 0 && field.expiresAt <= serverNowTs) continue;
    next.push(field);
  }
  mapState.fields = next;
  return mapState;
}

function ensureMapFieldsSeeded(nk, mapState, serverNowTs) {
  normalizeMapFieldState(mapState);
  compactMapFields(mapState, serverNowTs);
  if (mapState.fields.length >= MAP_TARGET_FIELD_COUNT) {
    mapState.updatedAt = serverNowTs;
    return mapState;
  }
  var playerPositions = listMapPlayerPositions(nk);
  while (mapState.fields.length < MAP_TARGET_FIELD_COUNT) {
    var created = createMapField(nk, mapState, mapState.fields, playerPositions, serverNowTs);
    mapState.fields.push(created);
  }
  mapState.updatedAt = serverNowTs;
  return mapState;
}

function findMapField(mapState, fieldId) {
  var fields = Array.isArray(mapState.fields) ? mapState.fields : [];
  for (var i = 0; i < fields.length; i++) {
    if (String(fields[i].id || "") === String(fieldId || "")) return fields[i];
  }
  return null;
}

function calculateFleetHarvestStats(economy, fleetInput) {
  ensureHangarState(economy);
  if (!Array.isArray(fleetInput) || fleetInput.length <= 0) throw new Error("Fleet payload is required.");
  var normalizedFleet = [];
  var consumed = {};
  var totalHarvestSpeed = 0;
  var totalTransportCapacity = 0;
  var weightedSpeed = 0;
  var shipCount = 0;

  for (var i = 0; i < fleetInput.length; i++) {
    var row = fleetInput[i] || {};
    var unitId = String(row.unitId || "").trim();
    var quantity = sanitizePositiveInt(Number(row.quantity || 0));
    if (!unitId || quantity <= 0) continue;
    if (!HANGAR_UNIT_DEFS[unitId] || HANGAR_UNIT_DEFS[unitId].category !== "ship") {
      throw new Error("Invalid ship unit in fleet: " + unitId);
    }
    var stats = MAP_HARVEST_UNIT_STATS[unitId];
    if (!stats) throw new Error("Ship cannot harvest: " + unitId);
    var already = consumed[unitId] || 0;
    var available = sanitizePositiveInt(economy.hangarInventory[unitId] || 0);
    if (already + quantity > available) throw new Error("Not enough available ships for " + unitId + ".");
    consumed[unitId] = already + quantity;
  }

  var keys = Object.keys(consumed);
  if (keys.length <= 0) throw new Error("Fleet payload is empty.");
  for (var j = 0; j < keys.length; j++) {
    var id = keys[j];
    var qty = consumed[id];
    var s = MAP_HARVEST_UNIT_STATS[id];
    normalizedFleet.push({ unitId: id, quantity: qty });
    totalHarvestSpeed += s.harvestSpeed * qty;
    totalTransportCapacity += s.harvestCapacity * qty;
    weightedSpeed += s.mapSpeed * qty;
    shipCount += qty;
  }

  var mapSpeed = shipCount > 0 ? weightedSpeed / shipCount : 0;
  if (totalHarvestSpeed <= 0) throw new Error("Fleet has no harvest speed.");
  if (totalTransportCapacity <= 0) throw new Error("Fleet has no transport capacity.");
  if (mapSpeed <= 0) throw new Error("Fleet has no travel speed.");

  return {
    fleet: normalizedFleet,
    totalHarvestSpeed: totalHarvestSpeed,
    totalTransportCapacity: totalTransportCapacity,
    mapSpeed: mapSpeed
  };
}

function calculateMapTravelSeconds(userId, fieldX, fieldY, mapSpeed) {
  var origin = mapPlayerToPlanetCoordinates(userId);
  var distance = distance2D(origin.x, origin.y, fieldX, fieldY);
  var raw = (distance / Math.max(1, mapSpeed)) * MAP_TRAVEL_TIME_FACTOR;
  return Math.floor(clampNumber(raw, MAP_MIN_TRAVEL_SECONDS, MAP_MAX_TRAVEL_SECONDS));
}

function calculateMapExtractionSeconds(totalWork, totalHarvestSpeed) {
  var raw = Number(totalWork || 0) / Math.max(1, Number(totalHarvestSpeed || 0));
  return Math.floor(clampNumber(raw, MAP_MIN_EXTRACTION_SECONDS, MAP_MAX_EXTRACTION_SECONDS));
}

function mapFieldResourcesToMap(field) {
  var out = {};
  var resources = Array.isArray(field.resources) ? field.resources : [];
  for (var i = 0; i < resources.length; i++) {
    var row = resources[i];
    var rid = String(row.resourceId || "").trim();
    if (!rid) continue;
    out[rid] = sanitizePositiveInt(row.remainingAmount || 0);
  }
  return out;
}

function writeMapToFieldResources(field, remainingByResource) {
  var resources = Array.isArray(field.resources) ? field.resources : [];
  for (var i = 0; i < resources.length; i++) {
    var row = resources[i];
    var rid = String(row.resourceId || "").trim();
    var total = sanitizePositiveInt(row.totalAmount || 0);
    var remaining = sanitizePositiveInt(remainingByResource[rid] || 0);
    if (remaining > total && total > 0) remaining = total;
    row.remainingAmount = remaining;
  }
}

function sumResourceMap(values) {
  var total = 0;
  var keys = Object.keys(values || {});
  for (var i = 0; i < keys.length; i++) total += sanitizePositiveInt(values[keys[i]] || 0);
  return total;
}

function settleHarvestAgainstField(field, expedition, progressRatio) {
  var ratio = clampNumber(progressRatio, 0, 1);
  var snapshot = expedition.snapshotResources && typeof expedition.snapshotResources === "object"
    ? expedition.snapshotResources
    : mapFieldResourcesToMap(field);
  var currentRemaining = mapFieldResourcesToMap(field);
  var potential = {};
  var keys = Object.keys(snapshot);
  for (var i = 0; i < keys.length; i++) {
    var rid = keys[i];
    var startAmount = sanitizePositiveInt(snapshot[rid] || 0);
    if (startAmount <= 0) continue;
    potential[rid] = Math.floor(startAmount * ratio);
  }

  var totalPotential = sumResourceMap(potential);
  var capacity = Math.max(0, sanitizePositiveInt(expedition.totalTransportCapacity || 0));
  var scale = 1;
  if (capacity > 0 && totalPotential > capacity) {
    scale = capacity / totalPotential;
  }

  var collected = {};
  var collectedTotal = 0;
  var pKeys = Object.keys(potential);
  for (var j = 0; j < pKeys.length; j++) {
    var resourceId = pKeys[j];
    var scaled = Math.floor((potential[resourceId] || 0) * scale);
    var current = sanitizePositiveInt(currentRemaining[resourceId] || 0);
    var picked = Math.max(0, Math.min(current, scaled));
    if (picked > 0) {
      collected[resourceId] = picked;
      currentRemaining[resourceId] = current - picked;
      collectedTotal += picked;
    }
  }

  var snapshotTotal = Math.max(1, sumResourceMap(snapshot));
  var workSpent = Math.floor((field.totalExtractionWork || 0) * (collectedTotal / snapshotTotal));
  field.remainingExtractionWork = Math.max(0, sanitizePositiveInt(field.remainingExtractionWork || 0) - workSpent);
  writeMapToFieldResources(field, currentRemaining);

  var hasRemaining = false;
  var resources = Array.isArray(field.resources) ? field.resources : [];
  for (var r = 0; r < resources.length; r++) {
    if (sanitizePositiveInt(resources[r].remainingAmount || 0) > 0) {
      hasRemaining = true;
      break;
    }
  }

  return {
    collected: collected,
    collectedTotal: collectedTotal,
    hasRemaining: hasRemaining
  };
}

function clearFieldOccupation(field) {
  if (!field) return;
  field.isOccupied = false;
  field.occupiedByPlayerId = "";
  field.occupiedByUsername = "";
  field.occupyingFleetId = "";
}

function rollMapFieldDrop() {
  var picked = pickByWeight(MAP_FIELD_DROP_TABLE);
  if (!picked || !picked.itemId) return { itemId: "", quantity: 0 };
  return { itemId: picked.itemId, quantity: 1 };
}

function pushMapReport(economy, report) {
  ensureResourceExpeditionState(economy);
  if (!report) return;
  economy.resourceReports.unshift(report);
  if (economy.resourceReports.length > 12) economy.resourceReports = economy.resourceReports.slice(0, 12);
}

function settleReturningExpedition(economy, inventory, expedition, serverNowTs) {
  var gains = expedition.collectedResources && typeof expedition.collectedResources === "object"
    ? expedition.collectedResources
    : {};
  var gainKeys = Object.keys(gains);
  var addedResources = {};
  for (var i = 0; i < gainKeys.length; i++) {
    var rid = gainKeys[i];
    var amount = sanitizePositiveInt(gains[rid] || 0);
    if (amount <= 0) continue;
    if (!economy.resources[rid]) economy.resources[rid] = { amount: 0 };
    economy.resources[rid].amount += amount;
    addedResources[rid] = amount;
  }

  var addedItems = [];
  var dropItemId = String(expedition.dropItemId || "").trim();
  var dropQuantity = sanitizePositiveInt(expedition.dropQuantity || 0);
  if (dropItemId && dropQuantity > 0 && ITEM_DEFINITIONS[dropItemId]) {
    addItemToInventory(inventory, dropItemId, dropQuantity);
    addedItems.push({ itemId: dropItemId, quantity: dropQuantity });
    inventory.mapDropNotifications = sanitizePositiveInt(inventory.mapDropNotifications || 0) + 1;
  }

  var report = {
    id: makeServerId("mrep", serverNowTs),
    fieldId: String(expedition.fieldId || ""),
    at: serverNowTs,
    resources: addedResources,
    items: addedItems
  };
  pushMapReport(economy, report);
  return report;
}

function estimateExpeditionCollected(expedition, serverNowTs) {
  var snapshot = expedition && expedition.snapshotResources && typeof expedition.snapshotResources === "object"
    ? expedition.snapshotResources
    : {};
  var startAt = sanitizePositiveInt(expedition && expedition.extractionStartAt || 0);
  var endAt = sanitizePositiveInt(expedition && expedition.extractionEndAt || 0);
  if (startAt <= 0 || endAt <= startAt) return {};
  var duration = Math.max(1, endAt - startAt);
  var elapsed = clampNumber(sanitizePositiveInt(serverNowTs || 0) - startAt, 0, duration);
  var ratio = elapsed / duration;

  var potential = {};
  var keys = Object.keys(snapshot);
  for (var i = 0; i < keys.length; i++) {
    var rid = keys[i];
    var startAmount = sanitizePositiveInt(snapshot[rid] || 0);
    if (startAmount <= 0) continue;
    potential[rid] = Math.floor(startAmount * ratio);
  }

  var totalPotential = sumResourceMap(potential);
  var capacity = Math.max(0, sanitizePositiveInt(expedition && expedition.totalTransportCapacity || 0));
  var scale = 1;
  if (capacity > 0 && totalPotential > capacity) {
    scale = capacity / totalPotential;
  }

  var collected = {};
  var pKeys = Object.keys(potential);
  for (var j = 0; j < pKeys.length; j++) {
    var resourceId = pKeys[j];
    var picked = Math.max(0, Math.floor((potential[resourceId] || 0) * scale));
    if (picked > 0) collected[resourceId] = picked;
  }
  return collected;
}

function mapHarvestReportBody(report) {
  var resourceNameById = {
    carbone: "Carbone",
    titane: "Titane",
    osmium: "Osmium",
    adamantium: "Adamantium",
    magmatite: "Magmatite",
    neodyme: "Neodyme",
    chronium: "Chronium",
    aetherium: "Aetherium",
    isotope7: "Isotope-7",
    singulite: "Singulite"
  };
  var lines = [];
  var resources = report && report.resources && typeof report.resources === "object" ? report.resources : {};
  var hasResourceGain = false;
  for (var i = 0; i < RESOURCE_IDS.length; i++) {
    var rid = RESOURCE_IDS[i];
    var amount = sanitizePositiveInt(resources[rid] || 0);
    if (amount <= 0) continue;
    hasResourceGain = true;
    lines.push("- " + (resourceNameById[rid] || rid) + ": +" + amount);
  }
  var items = Array.isArray(report && report.items) ? report.items : [];
  if (items.length > 0) {
    if (!hasResourceGain) lines.push("- Ressources: +0");
    lines.push("- Objets:");
    for (var j = 0; j < items.length; j++) {
      var row = items[j];
      var itemId = String(row && row.itemId || "").trim();
      var qty = sanitizePositiveInt(row && row.quantity || 0);
      if (!itemId || qty <= 0) continue;
      var itemDef = ITEM_DEFINITIONS[itemId];
      var itemName = itemDef && itemDef.name ? itemDef.name : itemId;
      lines.push("  • " + itemName + " x" + qty);
    }
  }
  if (lines.length <= 0) lines.push("- Aucun gain");
  return lines.join("\n");
}

function createMapHarvestRewardMessage(nk, userId, report) {
  if (!report || typeof report !== "object") return;
  var fieldSuffix = String(report.fieldId || "").slice(-4).toUpperCase();
  var title = "Rapport d'exploitation " + (fieldSuffix ? ("#" + fieldSuffix) : "");
  var body = "Votre flotte de collecte est revenue.\n\n" + mapHarvestReportBody(report);
  createRewardMessage(nk, userId, {}, title, body);
}

function serializeMapFieldForViewer(field, viewerUserId) {
  var isOwner = String(field.occupiedByPlayerId || "") === String(viewerUserId || "");
  var detailsVisible = !field.isOccupied || isOwner;
  var resources = [];
  if (detailsVisible) {
    for (var i = 0; i < field.resources.length; i++) {
      var row = field.resources[i];
      resources.push({
        resourceId: row.resourceId,
        totalAmount: sanitizePositiveInt(row.totalAmount || 0),
        remainingAmount: sanitizePositiveInt(row.remainingAmount || 0)
      });
    }
  }
  return {
    id: field.id,
    x: field.x,
    y: field.y,
    rarityTier: field.rarityTier,
    qualityTier: field.qualityTier,
    resources: resources,
    totalExtractionWork: detailsVisible ? sanitizePositiveInt(field.totalExtractionWork || 0) : 0,
    remainingExtractionWork: detailsVisible ? sanitizePositiveInt(field.remainingExtractionWork || 0) : 0,
    spawnedAt: sanitizePositiveInt(field.spawnedAt || 0),
    expiresAt: sanitizePositiveInt(field.expiresAt || 0),
    occupiedByPlayerId: String(field.occupiedByPlayerId || ""),
    occupiedByUsername: String(field.occupiedByUsername || ""),
    occupyingFleetId: String(field.occupyingFleetId || ""),
    isOccupied: Boolean(field.isOccupied),
    isVisible: field.isVisible !== false,
    hiddenDetails: !detailsVisible
  };
}

function serializeMapExpedition(expedition, serverNowTs) {
  if (!expedition || typeof expedition !== "object") return null;
  var status = String(expedition.status || "travel_to_field");
  var snapshotResources = expedition.snapshotResources && typeof expedition.snapshotResources === "object"
    ? expedition.snapshotResources
    : {};
  var collectedResources = expedition.collectedResources && typeof expedition.collectedResources === "object"
    ? expedition.collectedResources
    : {};
  if (status === "extracting") {
    collectedResources = estimateExpeditionCollected(expedition, serverNowTs);
  }
  return {
    id: String(expedition.id || ""),
    fieldId: String(expedition.fieldId || ""),
    status: status,
    departureAt: sanitizePositiveInt(expedition.departureAt || 0),
    arrivalAt: sanitizePositiveInt(expedition.arrivalAt || 0),
    extractionStartAt: sanitizePositiveInt(expedition.extractionStartAt || 0),
    extractionEndAt: sanitizePositiveInt(expedition.extractionEndAt || 0),
    returnStartAt: sanitizePositiveInt(expedition.returnStartAt || 0),
    returnEndAt: sanitizePositiveInt(expedition.returnEndAt || 0),
    travelSeconds: sanitizePositiveInt(expedition.travelSeconds || 0),
    extractionSeconds: sanitizePositiveInt(expedition.extractionSeconds || 0),
    totalHarvestSpeed: sanitizePositiveInt(expedition.totalHarvestSpeed || 0),
    totalTransportCapacity: sanitizePositiveInt(expedition.totalTransportCapacity || 0),
    fleet: Array.isArray(expedition.fleet) ? expedition.fleet : [],
    snapshotResources: snapshotResources,
    collectedResources: collectedResources,
    serverNowTs: serverNowTs
  };
}

function syncMapExpedition(economy, inventory, mapState, userId, username, serverNowTs) {
  ensureResourceExpeditionState(economy);
  var expedition = economy.resourceExpedition;
  if (!expedition) return { changed: false, report: null };
  var changed = false;
  var report = null;
  var field = findMapField(mapState, expedition.fieldId);

  if (expedition.status === "travel_to_field" && serverNowTs >= sanitizePositiveInt(expedition.arrivalAt || 0)) {
    expedition.status = "extracting";
    expedition.extractionStartAt = sanitizePositiveInt(expedition.arrivalAt || serverNowTs);
    expedition.extractionEndAt = expedition.extractionStartAt + sanitizePositiveInt(expedition.extractionSeconds || MAP_MIN_EXTRACTION_SECONDS);
    expedition.updatedAt = serverNowTs;
    changed = true;
  }

  if (expedition.status === "extracting" && serverNowTs >= sanitizePositiveInt(expedition.extractionEndAt || 0)) {
    if (field) {
      var fullOutcome = settleHarvestAgainstField(field, expedition, 1);
      expedition.collectedResources = fullOutcome.collected;
      var drop = rollMapFieldDrop();
      expedition.dropItemId = drop.itemId;
      expedition.dropQuantity = drop.quantity;
      clearFieldOccupation(field);
      if (!fullOutcome.hasRemaining) {
        field.remainingExtractionWork = 0;
        field.expiresAt = serverNowTs;
      }
    } else {
      expedition.collectedResources = {};
      expedition.dropItemId = "";
      expedition.dropQuantity = 0;
    }
    expedition.status = "returning";
    expedition.returnStartAt = serverNowTs;
    expedition.returnEndAt = serverNowTs + sanitizePositiveInt(expedition.travelSeconds || MAP_MIN_TRAVEL_SECONDS);
    expedition.updatedAt = serverNowTs;
    changed = true;
  }

  if (expedition.status === "returning" && serverNowTs >= sanitizePositiveInt(expedition.returnEndAt || 0)) {
    report = settleReturningExpedition(economy, inventory, expedition, serverNowTs);
    economy.resourceExpedition = null;
    changed = true;
  }

  return { changed: changed, report: report };
}

function startMapExpedition(economy, mapState, userId, username, fieldId, fleetInput, serverNowTs) {
  ensureResourceExpeditionState(economy);
  if (economy.resourceExpedition) throw new Error("An expedition is already active.");
  var field = findMapField(mapState, fieldId);
  if (!field) throw new Error("Resource field not found.");
  if (field.isOccupied) throw new Error("Resource field is already occupied.");
  var stats = calculateFleetHarvestStats(economy, fleetInput);
  var travelSeconds = calculateMapTravelSeconds(userId, field.x, field.y, stats.mapSpeed);
  var extractionSeconds = calculateMapExtractionSeconds(field.remainingExtractionWork, stats.totalHarvestSpeed);
  var snapshot = mapFieldResourcesToMap(field);

  var expedition = {
    id: makeServerId("exp", serverNowTs),
    playerId: userId,
    username: username || userId,
    fieldId: field.id,
    fieldRarityTier: String(field.rarityTier || "COMMON"),
    status: "travel_to_field",
    fleet: stats.fleet,
    totalHarvestSpeed: stats.totalHarvestSpeed,
    totalTransportCapacity: stats.totalTransportCapacity,
    mapSpeed: Math.floor(stats.mapSpeed),
    travelSeconds: travelSeconds,
    extractionSeconds: extractionSeconds,
    departureAt: serverNowTs,
    arrivalAt: serverNowTs + travelSeconds,
    extractionStartAt: 0,
    extractionEndAt: 0,
    returnStartAt: 0,
    returnEndAt: 0,
    snapshotResources: snapshot,
    collectedResources: {},
    dropItemId: "",
    dropQuantity: 0,
    updatedAt: serverNowTs
  };

  field.isOccupied = true;
  field.occupiedByPlayerId = userId;
  field.occupiedByUsername = username || userId;
  field.occupyingFleetId = expedition.id;

  economy.resourceExpedition = expedition;
  return expedition;
}

function recallMapExpedition(economy, mapState, serverNowTs) {
  ensureResourceExpeditionState(economy);
  var expedition = economy.resourceExpedition;
  if (!expedition) throw new Error("No active expedition.");
  if (expedition.status === "returning") throw new Error("Expedition is already returning.");
  var field = findMapField(mapState, expedition.fieldId);

  if (expedition.status === "travel_to_field") {
    if (field) clearFieldOccupation(field);
    expedition.collectedResources = {};
    expedition.dropItemId = "";
    expedition.dropQuantity = 0;
  } else if (expedition.status === "extracting") {
    if (field) {
      var startAt = sanitizePositiveInt(expedition.extractionStartAt || serverNowTs);
      var endAt = sanitizePositiveInt(expedition.extractionEndAt || (startAt + MAP_MIN_EXTRACTION_SECONDS));
      var duration = Math.max(1, endAt - startAt);
      var elapsed = clampNumber(serverNowTs - startAt, 0, duration);
      var ratio = elapsed / duration;
      var outcome = settleHarvestAgainstField(field, expedition, ratio);
      expedition.collectedResources = outcome.collected;
      if (outcome.collectedTotal > 0) {
        var rolled = rollMapFieldDrop();
        expedition.dropItemId = rolled.itemId;
        expedition.dropQuantity = rolled.quantity;
      } else {
        expedition.dropItemId = "";
        expedition.dropQuantity = 0;
      }
      clearFieldOccupation(field);
      if (!outcome.hasRemaining) {
        field.remainingExtractionWork = 0;
        field.expiresAt = serverNowTs;
      }
    } else {
      expedition.collectedResources = {};
      expedition.dropItemId = "";
      expedition.dropQuantity = 0;
    }
  }

  expedition.status = "returning";
  expedition.returnStartAt = serverNowTs;
  expedition.returnEndAt = serverNowTs + sanitizePositiveInt(expedition.travelSeconds || MAP_MIN_TRAVEL_SECONDS);
  expedition.updatedAt = serverNowTs;
  return expedition;
}

function withMapTransaction(nk, userId, username, update) {
  var lastError = "failed";
  for (var attempt = 0; attempt < MAP_WRITE_RETRIES; attempt++) {
    var ts = nowTs();
    var read = nk.storageRead([
      { collection: ECONOMY_COLLECTION, key: ECONOMY_KEY, userId: userId },
      { collection: INVENTORY_COLLECTION, key: INVENTORY_KEY, userId: userId },
      { collection: MAP_COLLECTION, key: MAP_RESOURCE_FIELDS_KEY, userId: SYSTEM_USER_ID }
    ]);

    var economyState = defaultEconomyState();
    var economyVersion = "";
    var inventoryState = defaultInventoryState(userId);
    var inventoryVersion = "";
    var mapState = defaultMapFieldState();
    var mapVersion = "";

    for (var i = 0; i < (read || []).length; i++) {
      var obj = read[i];
      if (obj.collection === ECONOMY_COLLECTION && obj.key === ECONOMY_KEY) {
        economyState = obj.value || defaultEconomyState();
        economyVersion = obj.version || "";
      } else if (obj.collection === INVENTORY_COLLECTION && obj.key === INVENTORY_KEY) {
        inventoryState = normalizeInventory(obj.value || defaultInventoryState(userId), userId);
        inventoryVersion = obj.version || "";
      } else if (obj.collection === MAP_COLLECTION && obj.key === MAP_RESOURCE_FIELDS_KEY) {
        mapState = normalizeMapFieldState(obj.value || defaultMapFieldState());
        mapVersion = obj.version || "";
      }
    }

    var economy = applyOfflineProduction(economyState, ts);
    var inventory = cloneInventory(inventoryState);
    ensureHangarState(economy);
    ensureResourceExpeditionState(economy);
    var mapFingerprintBefore = JSON.stringify(mapState.fields || []);
    ensureMapFieldsSeeded(nk, mapState, ts);
    var syncResult = syncMapExpedition(economy, inventory, mapState, userId, username, ts);
    var result = update(economy, inventory, mapState, ts, syncResult);
    ensureMapFieldsSeeded(nk, mapState, ts);

    var forcedDirty = false;
    if (result && typeof result === "object" && Object.prototype.hasOwnProperty.call(result, "__dirty")) {
      forcedDirty = Boolean(result.__dirty);
      delete result.__dirty;
    }
    var mapFingerprintAfter = JSON.stringify(mapState.fields || []);
    var mapChangedByMaintenance = mapFingerprintAfter !== mapFingerprintBefore;
    var shouldWrite = forcedDirty || syncResult.changed || mapChangedByMaintenance || !mapVersion;
    if (!shouldWrite) {
      return {
        economy: economy,
        inventory: inventory,
        mapState: mapState,
        result: result,
        syncResult: syncResult
      };
    }

    economy.version = (economy.version || 0) + 1;
    economy.lastUpdateTs = ts;
    inventory.version = (inventory.version || 0) + 1;
    inventory.updatedAt = ts;
    mapState.version = (mapState.version || 0) + 1;
    mapState.updatedAt = ts;

    try {
      var economyWrite = {
        collection: ECONOMY_COLLECTION,
        key: ECONOMY_KEY,
        userId: userId,
        permissionRead: 0,
        permissionWrite: 0,
        value: economy
      };
      if (economyVersion) economyWrite.version = economyVersion;

      var inventoryWrite = {
        collection: INVENTORY_COLLECTION,
        key: INVENTORY_KEY,
        userId: userId,
        permissionRead: 0,
        permissionWrite: 0,
        value: inventory
      };
      if (inventoryVersion) inventoryWrite.version = inventoryVersion;

      var mapWrite = {
        collection: MAP_COLLECTION,
        key: MAP_RESOURCE_FIELDS_KEY,
        userId: SYSTEM_USER_ID,
        permissionRead: 2,
        permissionWrite: 0,
        value: mapState
      };
      if (mapVersion) mapWrite.version = mapVersion;

      nk.storageWrite([economyWrite, inventoryWrite, mapWrite]);
      if (syncResult && syncResult.report) {
        try {
          createMapHarvestRewardMessage(nk, userId, syncResult.report);
        } catch (_postErr) {
          // Do not fail the map transaction if inbox creation fails.
        }
      }
      return {
        economy: economy,
        inventory: inventory,
        mapState: mapState,
        result: result,
        syncResult: syncResult
      };
    } catch (err) {
      lastError = String(err);
    }
  }
  throw new Error("Map transaction failed after retries: " + lastError);
}

function ensureHangarState(state) {
  ensureResourceExpeditionState(state);
  if (!Array.isArray(state.hangarQueue)) state.hangarQueue = [];
  if (!state.hangarInventory || typeof state.hangarInventory !== "object") state.hangarInventory = {};

  state.hangarQueue = state.hangarQueue
    .filter(function(entry) {
      return (
        entry &&
        typeof entry.id === "string" &&
        entry.id.length > 0 &&
        typeof entry.unitId === "string" &&
        !!HANGAR_UNIT_DEFS[entry.unitId] &&
        Number.isFinite(entry.startAt) &&
        Number.isFinite(entry.endAt)
      );
    })
    .map(function(entry) {
      var def = HANGAR_UNIT_DEFS[entry.unitId];
      var safeQty = Math.max(1, sanitizePositiveInt(entry.quantity));
      var safeStart = Math.floor(entry.startAt);
      var duration = Math.max(1, Math.floor((entry.endAt || (safeStart + def.buildSeconds)) - safeStart));
      var batchCost = {};
      var rawCost = entry.batchCost && typeof entry.batchCost === "object" ? entry.batchCost : {};
      var keys = Object.keys(rawCost);
      for (var i = 0; i < keys.length; i++) {
        var rid = keys[i];
        var amount = Number(rawCost[rid] || 0);
        if (Number.isFinite(amount) && amount > 0) batchCost[rid] = Math.ceil(amount);
      }
      return {
        id: entry.id,
        unitId: entry.unitId,
        category: def.category,
        quantity: safeQty,
        startAt: safeStart,
        endAt: safeStart + duration,
        batchCost: batchCost
      };
    });

  state.hangarQueue.sort(function(a, b) { return a.startAt - b.startAt; });

  var sanitizedInventory = {};
  var invKeys = Object.keys(state.hangarInventory);
  for (var j = 0; j < invKeys.length; j++) {
    var unitId = invKeys[j];
    var qty = sanitizePositiveInt(Number(state.hangarInventory[unitId] || 0));
    if (qty > 0) sanitizedInventory[unitId] = qty;
  }
  state.hangarInventory = sanitizedInventory;
  return state;
}

function defaultInventoryState(playerId) {
  return {
    playerId: playerId,
    items: [],
    mapDropNotifications: 0,
    version: 1,
    updatedAt: nowTs(),
    starterSeedVersion: 0
  };
}

function cloneInventory(s) {
  return JSON.parse(JSON.stringify(s));
}

function sanitizePositiveInt(value) {
  if (!Number.isFinite(value)) return 0;
  return Math.max(0, Math.floor(value));
}

function normalizeInventory(inventory, userId) {
  var next = cloneInventory(inventory);
  next.playerId = userId;
  next.items = (next.items || [])
    .filter(function(it) { return it && typeof it.itemId === "string" && it.itemId.length > 0; })
    .map(function(it) { return ({ itemId: it.itemId, quantity: sanitizePositiveInt(it.quantity) }); })
    .filter(function(it) { return it.quantity > 0; });
  if (typeof next.version !== "number" || !Number.isFinite(next.version)) next.version = 1;
  if (typeof next.updatedAt !== "number" || !Number.isFinite(next.updatedAt)) next.updatedAt = nowTs();
  if (typeof next.starterSeedVersion !== "number" || !Number.isFinite(next.starterSeedVersion)) {
    next.starterSeedVersion = INVENTORY_STARTER_SEED_VERSION;
  }
  next.mapDropNotifications = sanitizePositiveInt(next.mapDropNotifications || 0);
  return next;
}

function findInventoryIndex(inventory, itemId) {
  return inventory.items.findIndex(function(it) { return it.itemId === itemId; });
}

function addItemToInventory(inventory, itemId, quantity) {
  var q = sanitizePositiveInt(quantity);
  if (q <= 0) throw new Error("Quantity must be > 0.");
  if (!ITEM_DEFINITIONS[itemId]) throw new Error("Unknown itemId: " + itemId);
  var idx = findInventoryIndex(inventory, itemId);
  if (idx === -1) inventory.items.push({ itemId: itemId, quantity: q });
  else inventory.items[idx].quantity += q;
  return inventory;
}

function removeItemFromInventory(inventory, itemId, quantity) {
  var q = sanitizePositiveInt(quantity);
  if (q <= 0) throw new Error("Quantity must be > 0.");
  var idx = findInventoryIndex(inventory, itemId);
  if (idx === -1) throw new Error("Item not found: " + itemId);
  if (inventory.items[idx].quantity < q) throw new Error("Not enough " + itemId + ".");
  inventory.items[idx].quantity -= q;
  if (inventory.items[idx].quantity <= 0) inventory.items.splice(idx, 1);
  return inventory;
}

function storageCapacity(state) {
  var level = Math.max(1, state.buildings.entrepot.level);
  return STORAGE_BASE * Math.pow(STORAGE_MULTIPLIER, level - 1);
}

function calculateProduction(base, level, bonusTotal) {
  if (bonusTotal === void 0) bonusTotal = 0;
  if (level <= 0 || base <= 0) return 0;
  return base * Math.pow(level, LEVEL_PRODUCTION_EXPONENT) * (1 + bonusTotal);
}

function buildingCostsAtLevel(buildingId, level) {
  var base = BASE_BUILDING_RESOURCE_COSTS[buildingId];
  var factor = Math.pow(COST_MULTIPLIER, Math.max(0, level - 1));
  var out = {};
  var keys = Object.keys(base);
  for (var i = 0; i < keys.length; i++) {
    var k = keys[i];
    out[k] = Math.ceil((base[k] || 0) * factor);
  }
  return out;
}

function buildingTimeAtLevel(buildingId, level) {
  return BUILDING_DEFS[buildingId].baseBuildSeconds * Math.pow(TIME_MULTIPLIER, Math.max(0, level - 1));
}

function scaleResourceCost(base, quantity) {
  var out = {};
  var safeQuantity = Math.max(1, sanitizePositiveInt(quantity));
  var keys = Object.keys(base || {});
  for (var i = 0; i < keys.length; i++) {
    var rid = keys[i];
    var amount = Number(base[rid] || 0);
    if (!Number.isFinite(amount) || amount <= 0) continue;
    out[rid] = Math.ceil(amount * safeQuantity);
  }
  return out;
}

function completeHangarQueue(state, serverNowTs) {
  ensureHangarState(state);
  while (state.hangarQueue.length > 0 && state.hangarQueue[0].endAt <= serverNowTs) {
    var completed = state.hangarQueue.shift();
    state.hangarInventory[completed.unitId] = (state.hangarInventory[completed.unitId] || 0) + completed.quantity;
  }
  return state;
}

function startHangarProduction(state, unitId, quantity, serverNowTs) {
  ensureHangarState(state);
  completeHangarQueue(state, serverNowTs);
  if (state.hangarQueue.length >= HANGAR_QUEUE_MAX) throw new Error("Hangar queue limit reached (" + HANGAR_QUEUE_MAX + ").");

  var def = HANGAR_UNIT_DEFS[unitId];
  if (!def) throw new Error("Unknown hangar unit.");
  var safeQuantity = Math.max(1, sanitizePositiveInt(quantity));
  var batchCost = scaleResourceCost(def.cost, safeQuantity);

  var keys = Object.keys(batchCost);
  for (var i = 0; i < keys.length; i++) {
    var rid = keys[i];
    var required = batchCost[rid] || 0;
    if (state.resources[rid].amount < required) throw new Error("Insufficient " + rid + ". Need " + required + ".");
  }
  for (var j = 0; j < keys.length; j++) {
    var rid2 = keys[j];
    state.resources[rid2].amount -= batchCost[rid2] || 0;
  }

  var queueTail = state.hangarQueue[state.hangarQueue.length - 1];
  var startAt = Math.max(serverNowTs, (queueTail && queueTail.endAt) || serverNowTs);
  var duration = Math.max(1, floorSeconds(def.buildSeconds * safeQuantity));

  state.hangarQueue.push({
    id: makeServerId("hgr", serverNowTs),
    unitId: unitId,
    category: def.category,
    quantity: safeQuantity,
    startAt: startAt,
    endAt: startAt + duration,
    batchCost: batchCost
  });
  return state;
}

function cancelHangarProduction(state, queueId, serverNowTs) {
  ensureHangarState(state);
  completeHangarQueue(state, serverNowTs);
  if (state.hangarQueue.length === 0) throw new Error("No active hangar production.");

  var idx = 0;
  if (queueId) {
    idx = state.hangarQueue.findIndex(function(entry) { return entry.id === queueId; });
  }
  if (idx < 0) throw new Error("Hangar queue item not found.");

  var canceled = state.hangarQueue[idx];
  var keys = Object.keys(canceled.batchCost || {});
  for (var i = 0; i < keys.length; i++) {
    var rid = keys[i];
    state.resources[rid].amount += canceled.batchCost[rid] || 0;
  }
  state.hangarQueue.splice(idx, 1);

  var shiftSeconds = Math.max(0, canceled.endAt - serverNowTs);
  if (shiftSeconds > 0) {
    for (var j = idx; j < state.hangarQueue.length; j++) {
      var entry = state.hangarQueue[j];
      entry.startAt = Math.max(serverNowTs, entry.startAt - shiftSeconds);
      entry.endAt = Math.max(entry.startAt + 1, entry.endAt - shiftSeconds);
    }
  }

  return { state: state, canceled: canceled };
}

function serializeResourceAmounts(state) {
  var out = {};
  for (var i = 0; i < RESOURCE_IDS.length; i++) {
    var rid = RESOURCE_IDS[i];
    out[rid] = Number(state.resources[rid].amount || 0);
  }
  return out;
}

function syncResourcesFromClientSnapshot(state, snapshot) {
  // Client snapshots are intentionally ignored in production runtime.
  // Resource authority must stay server-side to prevent forged balances.
  return;
}

function syncBuildingLevelsFromClientSnapshot(state, snapshot) {
  // Client snapshots are intentionally ignored in production runtime.
  // Building progression must stay server-side to prevent forged levels.
  return;
}

function serializeHangarState(state, serverNowTs) {
  ensureHangarState(state);
  var queue = state.hangarQueue.map(function(entry) {
    return {
      id: entry.id,
      unitId: entry.unitId,
      category: entry.category,
      quantity: entry.quantity,
      startAt: entry.startAt,
      endAt: entry.endAt,
      batchCost: Object.assign({}, entry.batchCost)
    };
  });
  return {
    serverNowTs: serverNowTs,
    resources: serializeResourceAmounts(state),
    queue: queue,
    inventory: Object.assign({}, state.hangarInventory)
  };
}

function produceWindow(state, fromTs, toTs) {
  var deltaSeconds = floorSeconds(toTs - fromTs);
  if (deltaSeconds <= 0) return;
  var cap = storageCapacity(state);

  for (var i = 0; i < RESOURCE_IDS.length; i++) {
    var resourceId = RESOURCE_IDS[i];
    var current = state.resources[resourceId].amount;
    if (current >= cap) continue;
    var level = state.buildings[resourceId].level;
    var base = BUILDING_DEFS[resourceId].baseProductionPerSec || 0;
    var perSecond = calculateProduction(base, level, 0);
    if (perSecond <= 0) continue;
    state.resources[resourceId].amount = Math.min(cap, current + perSecond * deltaSeconds);
  }
}

function completeQueueEntry(state, slot) {
  var entry = state[slot];
  if (!entry) return;
  state.buildings[entry.buildingId].level = Math.max(state.buildings[entry.buildingId].level, entry.targetLevel);
  state[slot] = null;
}

function applyOfflineProduction(state, serverNowTs) {
  var next = cloneState(state);
  ensureHangarState(next);
  if (serverNowTs <= next.lastUpdateTs) {
    completeHangarQueue(next, serverNowTs);
    return next;
  }

  var events = [];
  var slots = ["building_upgrade_slot", "building_construct_slot", "research_slot"];
  for (var i = 0; i < slots.length; i++) {
    var slot = slots[i];
    var entry = next[slot];
    if (entry && entry.endAt <= serverNowTs) events.push({ slot: slot, at: entry.endAt });
  }
  events.sort(function(a, b) { return a.at - b.at; });

  var cursor = next.lastUpdateTs;
  for (var j = 0; j < events.length; j++) {
    var event = events[j];
    if (event.at > cursor) {
      produceWindow(next, cursor, event.at);
      cursor = event.at;
    }
    completeQueueEntry(next, event.slot);
  }
  if (serverNowTs > cursor) produceWindow(next, cursor, serverNowTs);
  completeHangarQueue(next, serverNowTs);
  next.lastUpdateTs = serverNowTs;
  return next;
}

function launchUpgradeOrBuild(state, slot, buildingId, serverNowTs) {
  if (slot === "research_slot") throw new Error("research_slot reserved for future technology pipeline.");
  if (state[slot]) throw new Error(slot + " is currently busy.");

  var currentLevel = state.buildings[buildingId].level;
  var targetLevel = currentLevel + 1;
  var costs = buildingCostsAtLevel(buildingId, targetLevel);
  var keys = Object.keys(costs);
  for (var i = 0; i < keys.length; i++) {
    var rid = keys[i];
    var req = costs[rid] || 0;
    if (state.resources[rid].amount < req) throw new Error("Insufficient " + rid + ". Need " + req + ".");
  }
  for (var j = 0; j < keys.length; j++) {
    var rid2 = keys[j];
    state.resources[rid2].amount -= costs[rid2] || 0;
  }

  var duration = floorSeconds(buildingTimeAtLevel(buildingId, targetLevel));
  state[slot] = {
    slot: slot,
    buildingId: buildingId,
    targetLevel: targetLevel,
    startedAt: serverNowTs,
    endAt: serverNowTs + duration,
    cost: costs
  };
  return state;
}

function cancelUpgrade(state, slot) {
  var entry = state[slot];
  if (!entry) throw new Error("No active queue in " + slot + ".");
  var keys = Object.keys(entry.cost || {});
  for (var i = 0; i < keys.length; i++) {
    var rid = keys[i];
    state.resources[rid].amount += entry.cost[rid] || 0;
  }
  state[slot] = null;
  return state;
}

function applyTimeBoost(state, slot, reduceSeconds, serverNowTs) {
  var entry = state[slot];
  if (!entry) throw new Error("No active queue in " + slot + ".");
  var safeReduce = Math.max(0, Math.floor(reduceSeconds));
  entry.endAt = Math.max(serverNowTs, entry.endAt - safeReduce);
  if (entry.endAt <= serverNowTs) completeQueueEntry(state, slot);
  return state;
}

function finishWithCredits(state, slot, serverNowTs, creditRate, spendCredits) {
  if (creditRate === void 0) creditRate = CREDIT_RATE_DEFAULT;
  if (spendCredits === void 0) spendCredits = true;
  var entry = state[slot];
  if (!entry) throw new Error("No active queue in " + slot + ".");

  var remainingSeconds = Math.max(0, entry.endAt - serverNowTs);
  var creditCost = Math.ceil((remainingSeconds / 60) * creditRate);
  if (spendCredits && state.premiumCredits < creditCost) throw new Error("Not enough premium credits.");
  if (spendCredits) state.premiumCredits -= creditCost;

  entry.endAt = serverNowTs;
  completeQueueEntry(state, slot);
  return { state: state, creditCost: creditCost };
}

function randomIntInclusive(min, max) {
  var lo = Math.floor(Math.min(min, max));
  var hi = Math.floor(Math.max(min, max));
  return lo + Math.floor(Math.random() * (hi - lo + 1));
}

function pickDistinctRandomResources(pool, wantedCount) {
  var selected = [];
  var remaining = pool.slice();
  var target = Math.max(1, Math.min(wantedCount, remaining.length));
  while (selected.length < target && remaining.length > 0) {
    var pickedIdx = Math.floor(Math.random() * remaining.length);
    selected.push(remaining[pickedIdx]);
    remaining.splice(pickedIdx, 1);
  }
  return selected;
}

function getProducedResources(state) {
  var out = [];
  for (var i = 0; i < RESOURCE_IDS.length; i++) {
    var resourceId = RESOURCE_IDS[i];
    var level = state.buildings[resourceId].level;
    var base = BUILDING_DEFS[resourceId].baseProductionPerSec || 0;
    var perSecond = calculateProduction(base, level, 0);
    if (perSecond <= 0) continue;
    out.push({
      resourceId: resourceId,
      tier: RESOURCE_TIERS[resourceId] || 10,
      perSecond: perSecond,
      perHour: perSecond * 3600,
      level: level
    });
  }
  return out;
}

function averageBuildingLevel(state) {
  var total = 0;
  var count = 0;
  for (var i = 0; i < RESOURCE_IDS.length; i++) {
    var lvl = state.buildings[RESOURCE_IDS[i]].level;
    if (lvl > 0) {
      total += lvl;
      count += 1;
    }
  }
  if (count <= 0) return 1;
  return total / count;
}

function averageProductionPerHour(produced) {
  if (!produced || produced.length === 0) return 0;
  var total = 0;
  for (var i = 0; i < produced.length; i++) total += produced[i].perHour;
  return total / produced.length;
}

function majorUpgradeCost(state) {
  var majorBuilding = "carbone";
  var majorLevel = state.buildings.carbone.level;
  for (var i = 0; i < RESOURCE_IDS.length; i++) {
    var rid = RESOURCE_IDS[i];
    if (state.buildings[rid].level > majorLevel) {
      majorBuilding = rid;
      majorLevel = state.buildings[rid].level;
    }
  }
  var nextLevel = Math.max(1, state.buildings[majorBuilding].level + 1);
  var costs = buildingCostsAtLevel(majorBuilding, nextLevel);
  var total = 0;
  var keys = Object.keys(costs);
  for (var j = 0; j < keys.length; j++) total += costs[keys[j]] || 0;
  if (total > 0) return total;
  var fallback = buildingCostsAtLevel("carbone", state.buildings.carbone.level + 1);
  return Math.max(1, fallback.carbone || 1);
}

function calculateChestRewards(state, chestType, quantity) {
  var cfg = RESOURCE_CHEST_CONFIGS[chestType];
  if (!cfg) throw new Error("Unsupported chest type: " + chestType);
  var q = sanitizePositiveInt(quantity);
  if (q <= 0) throw new Error("Chest quantity must be > 0.");

  var produced = getProducedResources(state);
  if (produced.length === 0) throw new Error("No produced resources available for chest rewards.");

  var avgLevel = averageBuildingLevel(state);
  var avgProductionHour = averageProductionPerHour(produced);
  var scalingFactor = 1 + avgLevel * CHEST_SCALING_PER_AVG_LEVEL;
  var gains = {};

  for (var chestIdx = 0; chestIdx < q; chestIdx++) {
    var adjustedPool = avgProductionHour * cfg.coefficientHours * scalingFactor;
    var drawCount = randomIntInclusive(2, 4);
    var picks = pickDistinctRandomResources(produced, drawCount);
    if (picks.length <= 0) continue;
    var baseShare = adjustedPool / picks.length;
    for (var p = 0; p < picks.length; p++) {
      var pick = picks[p];
      var variance = 0.92 + Math.random() * 0.16;
      var finalAmount = Math.max(0, Math.floor(baseShare * variance));
      if (finalAmount <= 0) continue;
      gains[pick.resourceId] = (gains[pick.resourceId] || 0) + finalAmount;
    }
  }

  return { gains: gains, opened: q };
}

function openChest(nk, playerId, itemId, quantity, logger) {
  var itemDef = ITEM_DEFINITIONS[itemId];
  if (!itemDef) throw new Error("Unknown itemId: " + itemId);
  if (itemDef.category !== "RESOURCE_CRATE") throw new Error("Item category is not RESOURCE_CRATE.");
  var chestType = String((itemDef.metadata && itemDef.metadata.chestType) || "").trim();
  if (!RESOURCE_CHEST_CONFIGS[chestType]) throw new Error("Invalid chest type.");
  var q = sanitizePositiveInt(quantity);
  if (q <= 0) throw new Error("Invalid quantity.");

  var tx = withEconomyInventoryTransaction(nk, playerId, function(economy, inventory) {
    removeItemFromInventory(inventory, itemId, q);
    var rewards = calculateChestRewards(economy, chestType, q);
    var keys = Object.keys(rewards.gains);
    for (var i = 0; i < keys.length; i++) {
      var rid = keys[i];
      var gain = rewards.gains[rid] || 0;
      if (gain > 0) economy.resources[rid].amount += gain;
    }
    return rewards;
  });

  if (logger && typeof logger.info === "function") {
    logger.info(
      "resource_chest_open user=" + playerId +
      " item=" + itemId +
      " chestType=" + chestType +
      " quantity=" + tx.result.opened +
      " gains=" + JSON.stringify(tx.result.gains)
    );
  }

  return {
    inventory: tx.inventory,
    economy: tx.economy,
    gains: tx.result.gains,
    opened: tx.result.opened
  };
}

function readEconomyState(nk, userId) {
  var read = nk.storageRead([{ collection: ECONOMY_COLLECTION, key: ECONOMY_KEY, userId: userId }]);
  if (!read || read.length === 0) return { state: defaultEconomyState(), version: "" };
  var obj = read[0];
  return { state: obj.value || defaultEconomyState(), version: obj.version || "" };
}

function readInventoryState(nk, userId) {
  var read = nk.storageRead([{ collection: INVENTORY_COLLECTION, key: INVENTORY_KEY, userId: userId }]);
  if (!read || read.length === 0) return { state: defaultInventoryState(userId), version: "" };
  var obj = read[0];
  return { state: normalizeInventory(obj.value || defaultInventoryState(userId), userId), version: obj.version || "" };
}

function writeEconomyState(nk, userId, state, expectedVersion) {
  var req = {
    collection: ECONOMY_COLLECTION,
    key: ECONOMY_KEY,
    userId: userId,
    permissionRead: 0,
    permissionWrite: 0,
    value: state
  };
  if (expectedVersion) req.version = expectedVersion;
  var write = nk.storageWrite([req]);
  return (write[0] && write[0].version) || "";
}

function writeInventoryState(nk, userId, state, expectedVersion) {
  var req = {
    collection: INVENTORY_COLLECTION,
    key: INVENTORY_KEY,
    userId: userId,
    permissionRead: 0,
    permissionWrite: 0,
    value: state
  };
  if (expectedVersion) req.version = expectedVersion;
  var write = nk.storageWrite([req]);
  return (write[0] && write[0].version) || "";
}

function defaultAllianceProfile() {
  return { allianceId: "", role: "member", joinedAt: 0 };
}

function defaultAllianceState(allianceId, ownerUserId, ownerUsername, body, serverNowTs) {
  return {
    id: allianceId,
    tag: String(body.tag || "ALLY").slice(0, 6).toUpperCase(),
    name: String(body.name || "Alliance").slice(0, 32),
    motto: String(body.motto || "").slice(0, 96),
    description: String(body.description || "").slice(0, 512),
    logo: String(body.logo || "").slice(0, 128),
    memberCap: sanitizePositiveInt(body.memberCap || DEFAULT_ALLIANCE_MEMBER_CAP) || DEFAULT_ALLIANCE_MEMBER_CAP,
    bastionLevel: 1,
    bastionProgress: 0,
    investedResources: {},
    contributionPoints: {},
    members: [
      {
        userId: ownerUserId,
        username: ownerUsername || ownerUserId,
        role: "chef",
        joinedAt: serverNowTs
      }
    ],
    votes: [],
    logs: [
      { at: serverNowTs, type: "alliance_created", message: "Alliance created.", by: ownerUsername || ownerUserId }
    ],
    warPoints: 0,
    militaryPower: 0,
    cachedMemberScores: {},
    cachedTotalScore: 0,
    updatedAt: serverNowTs
  };
}

function readAllianceProfile(nk, userId) {
  var read = nk.storageRead([{ collection: ALLIANCE_PROFILE_COLLECTION, key: ALLIANCE_PROFILE_KEY, userId: userId }]);
  if (!read || read.length === 0) return { state: defaultAllianceProfile(), version: "" };
  return { state: read[0].value || defaultAllianceProfile(), version: read[0].version || "" };
}

function writeAllianceProfile(nk, userId, state, expectedVersion) {
  var req = {
    collection: ALLIANCE_PROFILE_COLLECTION,
    key: ALLIANCE_PROFILE_KEY,
    userId: userId,
    permissionRead: 0,
    permissionWrite: 0,
    value: state
  };
  if (expectedVersion) req.version = expectedVersion;
  var write = nk.storageWrite([req]);
  return (write[0] && write[0].version) || "";
}

function readAllianceState(nk, allianceId) {
  var read = nk.storageRead([{ collection: ALLIANCE_COLLECTION, key: allianceId }]);
  if (!read || read.length === 0) return { state: null, version: "" };
  return { state: read[0].value || null, version: read[0].version || "" };
}

function writeAllianceState(nk, allianceId, state, expectedVersion) {
  var req = {
    collection: ALLIANCE_COLLECTION,
    key: allianceId,
    permissionRead: 0,
    permissionWrite: 0,
    value: state
  };
  if (expectedVersion) req.version = expectedVersion;
  var write = nk.storageWrite([req]);
  return (write[0] && write[0].version) || "";
}

function defaultPlayerProfile() {
  return { allianceId: "", pendingAllianceApplicationId: "", updatedAt: 0 };
}

function readPlayerProfile(nk, userId) {
  var read = nk.storageRead([{ collection: PLAYER_PROFILE_COLLECTION, key: PLAYER_PROFILE_KEY, userId: userId }]);
  if (!read || read.length === 0) return { state: defaultPlayerProfile(), version: "" };
  return { state: read[0].value || defaultPlayerProfile(), version: read[0].version || "" };
}

function readStorageObject(nk, collection, key, userId) {
  var req = { collection: collection, key: key };
  if (userId) req.userId = userId;
  var read = nk.storageRead([req]);
  if (!read || read.length === 0) return { state: null, version: "" };
  return { state: read[0].value || null, version: read[0].version || "" };
}

function defaultAllianceInbox(userId) {
  return {
    userId: userId || "",
    invites: [],
    updatedAt: 0
  };
}

function readAllianceInbox(nk, userId) {
  var read = nk.storageRead([{ collection: ALLIANCE_INBOX_COLLECTION, key: ALLIANCE_INBOX_KEY, userId: userId }]);
  if (!read || read.length === 0) return { state: defaultAllianceInbox(userId), version: "" };
  return { state: read[0].value || defaultAllianceInbox(userId), version: read[0].version || "" };
}

function sanitizeAllianceName(raw) {
  return String(raw || "").replace(/\s+/g, " ").trim();
}

function sanitizeAllianceTag(raw) {
  return String(raw || "").trim().toUpperCase();
}

function validateAllianceCreatePayload(body) {
  var name = sanitizeAllianceName(body.name);
  var tag = sanitizeAllianceTag(body.tag);
  var description = String(body.description || "").trim();
  var logoUrl = String(body.logoUrl || "").trim();

  if (name.length < 3 || name.length > 32) throw new Error("Alliance name must be 3..32 characters.");
  if (!ALLIANCE_NAME_REGEX.test(name)) throw new Error("Alliance name contains invalid characters.");
  if (tag.length < 2 || tag.length > 5) throw new Error("Alliance tag must be 2..5 characters.");
  if (!ALLIANCE_TAG_REGEX.test(tag)) throw new Error("Alliance tag must be alphanumeric only.");
  if (description.length > 500) throw new Error("Alliance description max length is 500.");
  if (logoUrl.length > 512) throw new Error("Alliance logo URL max length is 512.");

  var lowerName = name.toLowerCase();
  var lowerTag = tag.toLowerCase();
  for (var i = 0; i < ALLIANCE_BLOCKED_WORDS.length; i++) {
    var blocked = ALLIANCE_BLOCKED_WORDS[i];
    if (!blocked) continue;
    if (lowerName.indexOf(blocked) !== -1 || lowerTag.indexOf(blocked) !== -1) {
      throw new Error("Alliance name/tag contains restricted words.");
    }
  }

  return { name: name, tag: tag, description: description, logoUrl: logoUrl };
}

function hasEnoughResourcesForCost(economy, cost) {
  for (var rid in cost) {
    if (!Object.prototype.hasOwnProperty.call(cost, rid)) continue;
    var needed = Number(cost[rid] || 0);
    if (needed <= 0) continue;
    var available = Number((economy.resources[rid] && economy.resources[rid].amount) || 0);
    if (available < needed) return false;
  }
  return true;
}

function applyResourceCost(economy, cost) {
  for (var rid in cost) {
    if (!Object.prototype.hasOwnProperty.call(cost, rid)) continue;
    var needed = Number(cost[rid] || 0);
    if (needed <= 0) continue;
    economy.resources[rid].amount -= needed;
  }
}

function getAllianceMemberList(alliance, leaderUserId, now) {
  if (Array.isArray(alliance.members) && alliance.members.length > 0) return alliance.members;
  return [
    {
      userId: leaderUserId,
      username: leaderUserId,
      role: "chef",
      joinedAt: now
    }
  ];
}

function buildAllianceDto(alliance, members) {
  var memberList = Array.isArray(members) ? members : getAllianceMemberList(alliance, alliance.leaderUserId || "", nowTs());
  var leader = null;
  var officers = [];
  for (var i = 0; i < memberList.length; i++) {
    if (memberList[i].role === "chef" || memberList[i].role === "LEADER") leader = memberList[i];
    if (memberList[i].role === "co_lead" || memberList[i].role === "OFFICER") officers.push(memberList[i]);
  }
  return {
    id: alliance.id,
    name: alliance.name,
    tag: alliance.tag,
    description: alliance.description || "",
    logoUrl: alliance.logoUrl || alliance.logo || "",
    createdAt: Number(alliance.createdAt || nowTs()),
    leaderUserId: alliance.leaderUserId || (leader && leader.userId) || "",
    officersUserIds: Array.isArray(alliance.officersUserIds) ? alliance.officersUserIds : officers.map(function (m) { return m.userId; }),
    memberCount: Array.isArray(memberList) ? memberList.length : Number(alliance.memberCount || 0),
    isRecruiting: alliance.isRecruiting !== false,
    publicStats: alliance.publicStats || { pointsTotauxAlliance: Number(alliance.cachedTotalScore || 0), warsWon: 0, warsLost: 0 },
    bastionLevel: Number(alliance.bastionLevel || 1),
    bastionInvested: alliance.bastionInvested || alliance.investedResources || {},
    members: memberList,
    applications: Array.isArray(alliance.applications) ? alliance.applications : [],
    invites: Array.isArray(alliance.invites) ? alliance.invites : [],
    logs: Array.isArray(alliance.logs) ? alliance.logs.slice(0, 80) : []
  };
}

function buildAlliancePublicState(alliance, members) {
  var memberList = Array.isArray(members) ? members : getAllianceMemberList(alliance, alliance.leaderUserId || "", nowTs());
  var leaderUserId = String(alliance.leaderUserId || "");
  if (!leaderUserId) {
    for (var i = 0; i < memberList.length; i++) {
      if (memberList[i].role === "LEADER" || memberList[i].role === "chef") {
        leaderUserId = String(memberList[i].userId || "");
        break;
      }
    }
  }
  var officerIds = Array.isArray(alliance.officersUserIds)
    ? alliance.officersUserIds.slice(0, 3)
    : memberList
        .filter(function(m) { return m.role === "OFFICER" || m.role === "co_lead"; })
        .slice(0, 3)
        .map(function(m) { return m.userId; });

  return {
    id: String(alliance.id || ""),
    name: String(alliance.name || ""),
    tag: String(alliance.tag || ""),
    description: String(alliance.description || ""),
    logoUrl: String(alliance.logoUrl || alliance.logo || ""),
    createdAt: sanitizePositiveInt(alliance.createdAt || nowTs()),
    leaderUserId: leaderUserId,
    officersUserIds: officerIds,
    memberCount: Array.isArray(memberList) ? memberList.length : sanitizePositiveInt(alliance.memberCount || 0),
    isRecruiting: alliance.isRecruiting !== false,
    publicStats: alliance.publicStats || {
      pointsTotauxAlliance: Number(alliance.cachedTotalScore || 0),
      warsWon: 0,
      warsLost: 0
    },
    bastionLevel: Number(alliance.bastionLevel || 1),
    bastionInvested: alliance.bastionInvested || alliance.investedResources || {},
    updatedAt: sanitizePositiveInt(alliance.updatedAt || nowTs())
  };
}

function normalizeAllianceMemberRole(roleRaw) {
  var role = String(roleRaw || "").toUpperCase();
  if (role === "CHEF" || role === "LEADER") return "LEADER";
  if (role === "CO_LEAD" || role === "OFFICER") return "OFFICER";
  return "MEMBER";
}

function normalizeAllianceMembers(rawMembers, fallbackLeaderUserId, now) {
  var source = Array.isArray(rawMembers) ? rawMembers : [];
  var seen = {};
  var members = [];
  for (var i = 0; i < source.length; i++) {
    var entry = source[i] || {};
    var userId = String(entry.userId || "").trim();
    if (!userId || seen[userId]) continue;
    seen[userId] = true;
    members.push({
      userId: userId,
      username: String(entry.username || userId),
      role: normalizeAllianceMemberRole(entry.role),
      joinedAt: sanitizePositiveInt(entry.joinedAt || now)
    });
  }

  var leaderId = String(fallbackLeaderUserId || "").trim();
  if (leaderId && !seen[leaderId]) {
    members.push({
      userId: leaderId,
      username: leaderId,
      role: "LEADER",
      joinedAt: now
    });
  }
  return members;
}

function rebuildAllianceLeadership(alliance, members, now) {
  var safeMembers = normalizeAllianceMembers(members, alliance.leaderUserId || "", now);
  var leaderIndex = -1;
  var officers = [];
  for (var i = 0; i < safeMembers.length; i++) {
    if (safeMembers[i].role === "LEADER" && leaderIndex === -1) {
      leaderIndex = i;
      continue;
    }
    if (safeMembers[i].role === "LEADER") safeMembers[i].role = "MEMBER";
    if (safeMembers[i].role === "OFFICER") officers.push(i);
  }

  if (leaderIndex === -1 && safeMembers.length > 0) {
    safeMembers[0].role = "LEADER";
    leaderIndex = 0;
  }

  if (officers.length > 3) {
    for (var j = 3; j < officers.length; j++) {
      safeMembers[officers[j]].role = "MEMBER";
    }
    officers = officers.slice(0, 3);
  }

  alliance.members = safeMembers;
  alliance.leaderUserId = leaderIndex >= 0 ? safeMembers[leaderIndex].userId : "";
  alliance.officersUserIds = officers.map(function (idx) { return safeMembers[idx].userId; });
  alliance.memberCount = safeMembers.length;
  alliance.updatedAt = now;
  return safeMembers;
}

function computeAllianceCachedTotal(alliance) {
  var total = 0;
  var scores = alliance.cachedMemberScores || {};
  for (var userId in scores) {
    if (!Object.prototype.hasOwnProperty.call(scores, userId)) continue;
    total += sanitizePositiveInt(scores[userId] || 0);
  }
  alliance.cachedTotalScore = total;
}

function readAllianceCompositeState(nk, allianceId) {
  var privateRead = readStorageObject(nk, ALLIANCE_COLLECTION, allianceId, "");
  var publicRead = readStorageObject(nk, ALLIANCES_PUBLIC_COLLECTION, allianceId, "");
  var membersRead = readStorageObject(nk, ALLIANCE_MEMBERS_COLLECTION, allianceId, "");
  var alliance = privateRead.state || publicRead.state || null;
  var members = [];
  if (membersRead.state && Array.isArray(membersRead.state.members)) members = membersRead.state.members;
  if (alliance && members.length === 0) members = getAllianceMemberList(alliance, alliance.leaderUserId || "", nowTs());
  if (alliance) {
    var ts = nowTs();
    cleanAllianceInvites(alliance, ts);
    cleanAllianceApplications(alliance, ts);
    alliance.logs = Array.isArray(alliance.logs) ? alliance.logs : [];
  }
  return {
    alliance: alliance,
    members: members,
    privateVersion: privateRead.version || "",
    publicVersion: publicRead.version || "",
    membersVersion: membersRead.version || ""
  };
}

function makeStorageWriteReq(collection, key, userId, value, expectedVersion, permissionRead, permissionWrite) {
  var req = {
    collection: collection,
    key: key,
    value: value,
    permissionRead: permissionRead,
    permissionWrite: permissionWrite
  };
  if (userId) req.userId = userId;
  if (expectedVersion) req.version = expectedVersion;
  return req;
}

function cleanAllianceInvites(alliance, serverNowTs) {
  var invites = Array.isArray(alliance.invites) ? alliance.invites : [];
  var kept = [];
  for (var i = 0; i < invites.length; i++) {
    var it = invites[i] || {};
    var targetUserId = String(it.targetUserId || "").trim();
    if (!targetUserId) continue;
    var expiresAt = Number(it.expiresAt || 0);
    if (expiresAt > 0 && expiresAt <= serverNowTs) continue;
    kept.push({
      targetUserId: targetUserId,
      targetUsername: String(it.targetUsername || targetUserId),
      byUserId: String(it.byUserId || ""),
      byUsername: String(it.byUsername || ""),
      createdAt: sanitizePositiveInt(it.createdAt || serverNowTs),
      expiresAt: sanitizePositiveInt(it.expiresAt || (serverNowTs + ALLIANCE_INVITE_TTL_SEC))
    });
  }
  alliance.invites = kept;
  return kept;
}

function cleanAllianceApplications(alliance, serverNowTs) {
  var applications = Array.isArray(alliance.applications) ? alliance.applications : [];
  var kept = [];
  var seen = {};
  for (var i = 0; i < applications.length; i++) {
    var row = applications[i] || {};
    var userId = String(row.userId || "").trim();
    if (!userId || seen[userId]) continue;
    seen[userId] = true;
    kept.push({
      userId: userId,
      username: String(row.username || userId),
      message: String(row.message || "").slice(0, 240),
      createdAt: sanitizePositiveInt(row.createdAt || serverNowTs)
    });
  }
  alliance.applications = kept;
  return kept;
}

function cleanInboxInvites(inbox, serverNowTs) {
  var invites = Array.isArray(inbox.invites) ? inbox.invites : [];
  var kept = [];
  var seen = {};
  for (var i = 0; i < invites.length; i++) {
    var row = invites[i] || {};
    var allianceId = String(row.allianceId || "").trim();
    if (!allianceId) continue;
    var dedupeKey = allianceId + "::" + String(row.targetUserId || "");
    if (seen[dedupeKey]) continue;
    seen[dedupeKey] = true;
    var expiresAt = Number(row.expiresAt || 0);
    if (expiresAt > 0 && expiresAt <= serverNowTs) continue;
    kept.push({
      allianceId: allianceId,
      allianceName: String(row.allianceName || ""),
      allianceTag: String(row.allianceTag || ""),
      byUserId: String(row.byUserId || ""),
      byUsername: String(row.byUsername || ""),
      targetUserId: String(row.targetUserId || inbox.userId || ""),
      createdAt: sanitizePositiveInt(row.createdAt || serverNowTs),
      expiresAt: sanitizePositiveInt(row.expiresAt || (serverNowTs + ALLIANCE_INVITE_TTL_SEC))
    });
  }
  inbox.invites = kept;
  inbox.updatedAt = serverNowTs;
  return kept;
}

function sumWeightedResources(costs) {
  var total = 0;
  for (var rid in costs) {
    if (!Object.prototype.hasOwnProperty.call(costs, rid)) continue;
    var amount = Number(costs[rid] || 0);
    if (!Number.isFinite(amount) || amount <= 0) continue;
    total += amount * (RESOURCE_POINT_WEIGHTS[rid] || 0);
  }
  return total;
}

function cumulativeApproxCost(baseAmount, level) {
  var lvl = Math.max(0, sanitizePositiveInt(level));
  if (lvl <= 0 || baseAmount <= 0) return 0;
  if (Math.abs(COST_MULTIPLIER - 1) < 1e-9) return baseAmount * lvl;
  return baseAmount * ((Math.pow(COST_MULTIPLIER, lvl) - 1) / (COST_MULTIPLIER - 1));
}

function computePlayerPointBreakdown(state) {
  var economy = 0;
  var militaryShips = 0;
  var militaryDefenses = 0;
  var research = Number(state.researchPoints || 0);

  for (var bId in BASE_BUILDING_RESOURCE_COSTS) {
    if (!Object.prototype.hasOwnProperty.call(BASE_BUILDING_RESOURCE_COSTS, bId)) continue;
    var lvl = Math.max(0, sanitizePositiveInt((state.buildings[bId] && state.buildings[bId].level) || 0));
    if (lvl <= 0) continue;
    var base = BASE_BUILDING_RESOURCE_COSTS[bId] || {};
    var weighted = 0;
    for (var rid in base) {
      if (!Object.prototype.hasOwnProperty.call(base, rid)) continue;
      weighted += cumulativeApproxCost(Number(base[rid] || 0), lvl) * (RESOURCE_POINT_WEIGHTS[rid] || 0);
    }
    economy += weighted * POINT_MULTIPLIERS.building;
  }

  ensureHangarState(state);
  for (var unitId in state.hangarInventory) {
    if (!Object.prototype.hasOwnProperty.call(state.hangarInventory, unitId)) continue;
    var qty = sanitizePositiveInt(state.hangarInventory[unitId] || 0);
    if (qty <= 0) continue;
    var def = HANGAR_UNIT_DEFS[unitId];
    if (!def) continue;
    var weightedCost = sumWeightedResources(def.cost) * qty;
    if (def.category === "ship") militaryShips += weightedCost * POINT_MULTIPLIERS.ship;
    else militaryDefenses += weightedCost * POINT_MULTIPLIERS.defense;
  }

  var military = militaryShips + militaryDefenses;
  var researchScore = research * POINT_MULTIPLIERS.research;
  var total = economy + military + researchScore;
  return {
    total: Math.max(0, Math.floor(total)),
    economy: Math.max(0, Math.floor(economy)),
    military: Math.max(0, Math.floor(military)),
    research: Math.max(0, Math.floor(researchScore))
  };
}

function applyClientProgressMirror(state, snapshot) {
  if (!snapshot || typeof snapshot !== "object") return false;
  var changed = false;

  var rooms = Array.isArray(snapshot.rooms) ? snapshot.rooms : [];
  for (var i = 0; i < rooms.length; i++) {
    var row = rooms[i] || {};
    var roomType = String(row.type || "").trim();
    if (!roomType || !state.buildings || !Object.prototype.hasOwnProperty.call(state.buildings, roomType)) continue;
    var nextLevel = sanitizePositiveInt(Number(row.level || 0));
    if (nextLevel <= 0) continue;
    var currentLevel = sanitizePositiveInt(Number((state.buildings[roomType] && state.buildings[roomType].level) || 0));
    if (nextLevel > currentLevel) {
      state.buildings[roomType].level = nextLevel;
      changed = true;
    }
  }

  var snapshotResearch = sanitizePositiveInt(Number(snapshot.researchPoints || 0));
  var currentResearch = sanitizePositiveInt(Number(state.researchPoints || 0));
  if (snapshotResearch > currentResearch) {
    state.researchPoints = snapshotResearch;
    changed = true;
  }

  return changed;
}

function readEconomyStateForRanking(nk, userId, body, logger) {
  var ts = nowTs();
  var snapshot = body && body.clientProgress && typeof body.clientProgress === "object" ? body.clientProgress : null;
  if (!snapshot) return applyOfflineProduction(readEconomyState(nk, userId).state, ts);

  var lastError = "";
  for (var i = 0; i < ECONOMY_WRITE_RETRIES; i++) {
    var read = readEconomyState(nk, userId);
    var hydrated = applyOfflineProduction(read.state, ts);
    var mutable = cloneState(hydrated);
    var changed = applyClientProgressMirror(mutable, snapshot);
    if (!changed) return hydrated;
    mutable.version = (mutable.version || 0) + 1;
    mutable.lastUpdateTs = ts;
    try {
      writeEconomyState(nk, userId, mutable, read.version);
      return mutable;
    } catch (err) {
      lastError = String(err);
    }
  }
  if (logger && typeof logger.warn === "function") {
    logger.warn("ranking snapshot merge failed user=" + userId + " error=" + lastError);
  }
  return applyOfflineProduction(readEconomyState(nk, userId).state, ts);
}

function safeLeaderboardCreate(nk, logger, id) {
  try {
    nk.leaderboardCreate(id, true, "desc", "best", "", {}, true);
  } catch (e) {
    if (logger) logger.debug("leaderboard create skipped for " + id + ": " + e);
  }
}

function safeLeaderboardWrite(nk, logger, leaderboardId, ownerId, username, score, subscore, metadata) {
  try {
    nk.leaderboardRecordWrite(leaderboardId, ownerId, username || ownerId, sanitizePositiveInt(score), sanitizePositiveInt(subscore || 0), metadata || {});
  } catch (e) {
    if (logger && typeof logger.warn === "function") logger.warn("leaderboard write failed " + leaderboardId + ": " + e);
  }
}

function resolveAllianceLeaderboardOwnerId(alliance, fallbackUserId) {
  var ownerId = String(alliance && alliance.leaderUserId || "").trim();
  if (ownerId) return ownerId;
  var members = alliance && Array.isArray(alliance.members) ? alliance.members : [];
  for (var i = 0; i < members.length; i++) {
    var role = String(members[i].role || "").toLowerCase();
    if (role === "leader" || role === "chef") {
      var leaderId = String(members[i].userId || "").trim();
      if (leaderId) return leaderId;
    }
  }
  if (members.length > 0) {
    var firstId = String(members[0].userId || "").trim();
    if (firstId) return firstId;
  }
  return String(fallbackUserId || "").trim();
}

function updateAllianceMemberScore(nk, logger, userId, username, points) {
  var legacyProfileRead = readAllianceProfile(nk, userId);
  var legacyProfile = legacyProfileRead.state || defaultAllianceProfile();
  var playerProfileRead = readPlayerProfile(nk, userId);
  var playerProfile = playerProfileRead.state || defaultPlayerProfile();
  var allianceId = String((playerProfile && playerProfile.allianceId) || legacyProfile.allianceId || "").trim();
  if (!allianceId) return;

  for (var i = 0; i < ALLIANCE_WRITE_RETRIES; i++) {
    var allianceRead = readAllianceState(nk, allianceId);
    var alliance = allianceRead.state;
    if (!alliance) return;
    if (!alliance.cachedMemberScores || typeof alliance.cachedMemberScores !== "object") alliance.cachedMemberScores = {};
    alliance.cachedMemberScores[userId] = sanitizePositiveInt(points.total);
    alliance.cachedTotalScore = 0;
    for (var owner in alliance.cachedMemberScores) {
      if (!Object.prototype.hasOwnProperty.call(alliance.cachedMemberScores, owner)) continue;
      alliance.cachedTotalScore += sanitizePositiveInt(alliance.cachedMemberScores[owner]);
    }
    alliance.updatedAt = nowTs();
    try {
      writeAllianceState(nk, alliance.id, alliance, allianceRead.version);
      var leaderboardOwnerId = resolveAllianceLeaderboardOwnerId(alliance, userId);
      if (leaderboardOwnerId) {
        safeLeaderboardWrite(nk, logger, LEADERBOARD_ALLIANCE_TOTAL, leaderboardOwnerId, alliance.name, alliance.cachedTotalScore, alliance.bastionLevel || 0, {
          allianceId: alliance.id || "",
          name: alliance.name || "",
          tag: alliance.tag || "",
          members: Array.isArray(alliance.members) ? alliance.members.length : 0
        });
      }
      return;
    } catch (e) {
      if (i === ALLIANCE_WRITE_RETRIES - 1 && logger) logger.warn("alliance score update failed: " + e);
    }
  }
}

function syncPlayerPoints(nk, logger, userId, username, state) {
  var points = computePlayerPointBreakdown(state);
  safeLeaderboardWrite(nk, logger, LEADERBOARD_PLAYER_TOTAL, userId, username, points.total, points.military, points);
  safeLeaderboardWrite(nk, logger, LEADERBOARD_PLAYER_MILITARY, userId, username, points.military, points.total, points);
  safeLeaderboardWrite(nk, logger, LEADERBOARD_PLAYER_ECONOMY, userId, username, points.economy, points.total, points);
  safeLeaderboardWrite(nk, logger, LEADERBOARD_PLAYER_RESEARCH, userId, username, points.research, points.total, points);
  updateAllianceMemberScore(nk, logger, userId, username, points);
  return points;
}

function normalizeAllianceVotes(alliance, serverNowTs) {
  alliance.votes = Array.isArray(alliance.votes) ? alliance.votes : [];
  for (var i = 0; i < alliance.votes.length; i++) {
    var vote = alliance.votes[i];
    vote.yesBy = Array.isArray(vote.yesBy) ? vote.yesBy : [];
    vote.noBy = Array.isArray(vote.noBy) ? vote.noBy : [];
    if (vote.status !== "active") continue;
    if (serverNowTs < Number(vote.endAt || 0)) continue;
    var participation = (vote.yesBy.length + vote.noBy.length) / Math.max(1, (alliance.members || []).length);
    var accepted = participation >= ALLIANCE_VOTE_MIN_PARTICIPATION && vote.yesBy.length > vote.noBy.length;
    vote.status = accepted ? "accepted" : "rejected";
  }
}

function withStateTransaction(nk, userId, update) {
  var lastError = "failed";
  for (var i = 0; i < ECONOMY_WRITE_RETRIES; i++) {
    var ts = nowTs();
    var read = readEconomyState(nk, userId);
    var hydrated = applyOfflineProduction(read.state, ts);
    var mutable = cloneState(hydrated);
    var result = update(mutable, ts);
    mutable.version = (mutable.version || 0) + 1;
    mutable.lastUpdateTs = ts;
    try {
      writeEconomyState(nk, userId, mutable, read.version);
      return { state: mutable, result: result };
    } catch (err) {
      lastError = String(err);
    }
  }
  throw new Error("State transaction failed after retries: " + lastError);
}

function withInventoryTransaction(nk, userId, update) {
  var lastError = "failed";
  for (var i = 0; i < INVENTORY_WRITE_RETRIES; i++) {
    var ts = nowTs();
    var read = readInventoryState(nk, userId);
    var mutable = cloneInventory(read.state);
    var result = update(mutable, ts);
    mutable.version = (mutable.version || 0) + 1;
    mutable.updatedAt = ts;
    try {
      writeInventoryState(nk, userId, mutable, read.version);
      return { inventory: mutable, result: result };
    } catch (err) {
      lastError = String(err);
    }
  }
  throw new Error("Inventory transaction failed after retries: " + lastError);
}

function withEconomyInventoryTransaction(nk, userId, update) {
  var lastError = "failed";
  for (var i = 0; i < ECONOMY_WRITE_RETRIES; i++) {
    var ts = nowTs();
    var read = nk.storageRead([
      { collection: ECONOMY_COLLECTION, key: ECONOMY_KEY, userId: userId },
      { collection: INVENTORY_COLLECTION, key: INVENTORY_KEY, userId: userId }
    ]);

    var economyState = defaultEconomyState();
    var economyVersion = "";
    var inventoryState = defaultInventoryState(userId);
    var inventoryVersion = "";

    for (var j = 0; j < (read || []).length; j++) {
      var obj = read[j];
      if (obj.collection === ECONOMY_COLLECTION && obj.key === ECONOMY_KEY) {
        economyState = obj.value || defaultEconomyState();
        economyVersion = obj.version || "";
      }
      if (obj.collection === INVENTORY_COLLECTION && obj.key === INVENTORY_KEY) {
        inventoryState = normalizeInventory(obj.value || defaultInventoryState(userId), userId);
        inventoryVersion = obj.version || "";
      }
    }

    var hydratedEconomy = applyOfflineProduction(economyState, ts);
    var mutableEconomy = cloneState(hydratedEconomy);
    var mutableInventory = cloneInventory(inventoryState);
    var result = update(mutableEconomy, mutableInventory, ts);

    mutableEconomy.version = (mutableEconomy.version || 0) + 1;
    mutableEconomy.lastUpdateTs = ts;
    mutableInventory.version = (mutableInventory.version || 0) + 1;
    mutableInventory.updatedAt = ts;

    try {
      var economyWrite = {
        collection: ECONOMY_COLLECTION,
        key: ECONOMY_KEY,
        userId: userId,
        permissionRead: 0,
        permissionWrite: 0,
        value: mutableEconomy
      };
      if (economyVersion) economyWrite.version = economyVersion;

      var inventoryWrite = {
        collection: INVENTORY_COLLECTION,
        key: INVENTORY_KEY,
        userId: userId,
        permissionRead: 0,
        permissionWrite: 0,
        value: mutableInventory
      };
      if (inventoryVersion) inventoryWrite.version = inventoryVersion;

      nk.storageWrite([economyWrite, inventoryWrite]);
      return { economy: mutableEconomy, inventory: mutableInventory, result: result };
    } catch (err) {
      lastError = String(err);
    }
  }
  throw new Error("Economy+Inventory transaction failed after retries: " + lastError);
}

function parsePayload(payload) {
  if (!payload) return {};
  try {
    var parsed = JSON.parse(payload);
    if (parsed && typeof parsed === "object") return parsed;
    if (typeof parsed === "string") {
      try {
        var parsedTwice = JSON.parse(parsed);
        return parsedTwice && typeof parsedTwice === "object" ? parsedTwice : {};
      } catch (_err) {
        return {};
      }
    }
    return {};
  } catch (_a) {
    return {};
  }
}

function requireUserId(ctx) {
  if (!ctx.userId) throw new Error("Authentication required.");
  return ctx.userId;
}

function resolveQueueSlotForBuilding(state, buildingId) {
  if (buildingId === "building_construct_slot" || buildingId === "building_upgrade_slot" || buildingId === "research_slot") {
    if (!state[buildingId]) throw new Error("No active queue in " + buildingId + ".");
    return buildingId;
  }
  var slots = ["building_construct_slot", "building_upgrade_slot"];
  for (var i = 0; i < slots.length; i++) {
    var slot = slots[i];
    var entry = state[slot];
    if (entry && entry.buildingId === buildingId) return slot;
  }
  throw new Error("Building is not in construction or upgrade.");
}

function serializeInventoryItems(inventory) {
  var out = [];
  for (var i = 0; i < inventory.items.length; i++) {
    var it = inventory.items[i];
    var def = ITEM_DEFINITIONS[it.itemId];
    if (!def) continue;
    var durationSeconds = typeof (def.metadata && def.metadata.durationSeconds) === "number"
      ? Math.max(0, Math.floor(def.metadata.durationSeconds))
      : undefined;
    var chestType = typeof (def.metadata && def.metadata.chestType) === "string" && RESOURCE_CHEST_CONFIGS[def.metadata.chestType]
      ? def.metadata.chestType
      : undefined;
    out.push({
      id: def.id,
      name: def.name,
      category: def.category,
      quantity: it.quantity,
      durationSeconds: durationSeconds,
      chestType: chestType
    });
  }
  out.sort(function(a, b) { return a.id.localeCompare(b.id); });
  return out;
}

function getInventory(nk, playerId) {
  return readInventoryState(nk, playerId).state;
}

function addItem(nk, playerId, itemId, quantity) {
  var tx = withInventoryTransaction(nk, playerId, function(inv) { return addItemToInventory(inv, itemId, quantity); });
  return tx.inventory;
}

function removeItem(nk, playerId, itemId, quantity) {
  var tx = withInventoryTransaction(nk, playerId, function(inv) { return removeItemFromInventory(inv, itemId, quantity); });
  return tx.inventory;
}

function useTimeRift(nk, playerId, buildingId, itemId, quantity) {
  var itemDef = ITEM_DEFINITIONS[itemId];
  if (!itemDef) throw new Error("Unknown itemId: " + itemId);
  if (itemDef.category !== "TIME_BOOST") throw new Error("Item category is not TIME_BOOST.");
  var perItemSeconds = sanitizePositiveInt(Number((itemDef.metadata && itemDef.metadata.durationSeconds) || 0));
  if (perItemSeconds <= 0) throw new Error("Invalid TIME_BOOST duration.");
  var quantitySafe = sanitizePositiveInt(Number(quantity || 1));
  if (quantitySafe <= 0) throw new Error("Invalid quantity.");
  var durationSeconds = perItemSeconds * quantitySafe;
  var isSlotId = buildingId === "building_construct_slot" || buildingId === "building_upgrade_slot" || buildingId === "research_slot";
  if (!isSlotId && !BUILDING_DEFS[buildingId]) throw new Error("Building does not exist.");

  var tx = withEconomyInventoryTransaction(nk, playerId, function(economy, inventory, serverNowTs) {
    var slot = null;
    var entry = null;
    var appliedOnServer = false;
    if (isSlotId) {
      slot = buildingId;
      entry = economy[slot];
      if (entry && entry.endAt > serverNowTs) {
        applyTimeBoost(economy, slot, durationSeconds, serverNowTs);
        appliedOnServer = true;
      }
    } else {
      slot = resolveQueueSlotForBuilding(economy, buildingId);
      entry = economy[slot];
      if (!entry) throw new Error("No active queue in " + slot + ".");
      if (entry.endAt <= serverNowTs) throw new Error("Target building queue is already finished.");
      applyTimeBoost(economy, slot, durationSeconds, serverNowTs);
      appliedOnServer = true;
    }
    removeItemFromInventory(inventory, itemId, quantitySafe);
    return { slot: slot, usedSeconds: durationSeconds, usedQuantity: quantitySafe, appliedOnServer: appliedOnServer };
  });

  return {
    inventory: tx.inventory,
    economy: tx.economy,
    usedSeconds: tx.result.usedSeconds,
    usedQuantity: tx.result.usedQuantity,
    slot: tx.result.slot,
    appliedOnServer: tx.result.appliedOnServer
  };
}

function useTimeRiftOnHangar(nk, playerId, itemId, quantity, queueId) {
  var itemDef = ITEM_DEFINITIONS[itemId];
  if (!itemDef) throw new Error("Unknown itemId: " + itemId);
  if (itemDef.category !== "TIME_BOOST") throw new Error("Item category is not TIME_BOOST.");
  var perItemSeconds = sanitizePositiveInt(Number((itemDef.metadata && itemDef.metadata.durationSeconds) || 0));
  if (perItemSeconds <= 0) throw new Error("Invalid TIME_BOOST duration.");
  var quantitySafe = sanitizePositiveInt(Number(quantity || 1));
  if (quantitySafe <= 0) throw new Error("Invalid quantity.");
  var durationSeconds = perItemSeconds * quantitySafe;

  var tx = withEconomyInventoryTransaction(nk, playerId, function(economy, inventory, serverNowTs) {
    ensureHangarState(economy);
    completeHangarQueue(economy, serverNowTs);
    if (economy.hangarQueue.length === 0) throw new Error("No active hangar production.");

    var index = queueId ? economy.hangarQueue.findIndex(function(entry) { return entry.id === queueId; }) : 0;
    if (index < 0) throw new Error("Hangar queue item not found.");
    var target = economy.hangarQueue[index];
    if (target.endAt <= serverNowTs) throw new Error("Selected hangar queue is already finished.");

    var remaining = Math.max(0, target.endAt - serverNowTs);
    var effectiveReduction = Math.min(durationSeconds, remaining);
    if (effectiveReduction <= 0) throw new Error("No remaining hangar time to reduce.");

    target.endAt = Math.max(serverNowTs, target.endAt - effectiveReduction);
    for (var i = index + 1; i < economy.hangarQueue.length; i++) {
      var entry = economy.hangarQueue[i];
      entry.startAt = Math.max(serverNowTs, entry.startAt - effectiveReduction);
      entry.endAt = Math.max(entry.startAt + 1, entry.endAt - effectiveReduction);
    }
    completeHangarQueue(economy, serverNowTs);

    removeItemFromInventory(inventory, itemId, quantitySafe);
    return {
      usedSeconds: durationSeconds,
      usedQuantity: quantitySafe,
      appliedOnServer: true,
      hangar: serializeHangarState(economy, serverNowTs)
    };
  });

  return {
    inventory: tx.inventory,
    economy: tx.economy,
    usedSeconds: tx.result.usedSeconds,
    usedQuantity: tx.result.usedQuantity,
    appliedOnServer: tx.result.appliedOnServer,
    hangar: tx.result.hangar
  };
}

function consumeTimeRiftForLocalTarget(nk, playerId, itemId, quantity) {
  var itemDef = ITEM_DEFINITIONS[itemId];
  if (!itemDef) throw new Error("Unknown itemId: " + itemId);
  if (itemDef.category !== "TIME_BOOST") throw new Error("Item category is not TIME_BOOST.");
  var perItemSeconds = sanitizePositiveInt(Number((itemDef.metadata && itemDef.metadata.durationSeconds) || 0));
  if (perItemSeconds <= 0) throw new Error("Invalid TIME_BOOST duration.");
  var quantitySafe = sanitizePositiveInt(Number(quantity || 1));
  if (quantitySafe <= 0) throw new Error("Invalid quantity.");
  var durationSeconds = perItemSeconds * quantitySafe;

  var tx = withInventoryTransaction(nk, playerId, function(inventory) {
    removeItemFromInventory(inventory, itemId, quantitySafe);
    return { usedSeconds: durationSeconds, usedQuantity: quantitySafe };
  });

  return {
    inventory: tx.inventory,
    usedSeconds: tx.result.usedSeconds,
    usedQuantity: tx.result.usedQuantity
  };
}

function rpcEconomyGetState(ctx, _logger, nk, _payload) {
  var userId = requireUserId(ctx);
  var tx = withStateTransaction(nk, userId, function(s) { return s; });
  return JSON.stringify({ ok: true, state: tx.state });
}

function rpcEconomyStartBuilding(ctx, _logger, nk, payload) {
  var userId = requireUserId(ctx);
  var body = parsePayload(payload);
  var buildingId = body.buildingId;
  var slot = body.slot || "building_construct_slot";
  if (!buildingId || !BUILDING_DEFS[buildingId]) throw new Error("Invalid buildingId.");
  if (["building_construct_slot", "building_upgrade_slot", "research_slot"].indexOf(slot) === -1) throw new Error("Invalid slot.");
  var tx = withStateTransaction(nk, userId, function(s, ts) { return launchUpgradeOrBuild(s, slot, buildingId, ts); });
  return JSON.stringify({ ok: true, state: tx.state });
}

function rpcEconomyCancel(ctx, _logger, nk, payload) {
  var userId = requireUserId(ctx);
  var body = parsePayload(payload);
  if (!body.slot) throw new Error("Missing slot.");
  var tx = withStateTransaction(nk, userId, function(s) { return cancelUpgrade(s, body.slot); });
  return JSON.stringify({ ok: true, state: tx.state });
}

function rpcEconomyApplyBoost(ctx, _logger, nk, payload) {
  requireUserId(ctx);
  throw new Error("Endpoint disabled. Use inventory item consumption RPC.");
}

function rpcEconomyFinishWithCredits(ctx, _logger, nk, payload) {
  var userId = requireUserId(ctx);
  var body = parsePayload(payload);
  if (!body.slot) throw new Error("Missing slot.");
  var rate = CREDIT_RATE_DEFAULT;
  var tx = withStateTransaction(nk, userId, function(s, ts) { return finishWithCredits(s, body.slot, ts, rate, true); });
  return JSON.stringify({ ok: true, creditCost: tx.result.creditCost, state: tx.state });
}

function rpcEconomyDebugSeed(ctx, _logger, nk, payload) {
  requireUserId(ctx);
  throw new Error("Debug endpoint disabled in production.");
}

function rpcHangarGetState(ctx, _logger, nk, payload) {
  var userId = requireUserId(ctx);
  parsePayload(payload);
  var tx = withStateTransaction(nk, userId, function(state, ts) {
    completeHangarQueue(state, ts);
    return serializeHangarState(state, ts);
  });
  return JSON.stringify({ ok: true, hangar: tx.result });
}

function rpcHangarStart(ctx, _logger, nk, payload) {
  var userId = requireUserId(ctx);
  var body = parsePayload(payload);
  var unitId = String(body.unitId || "").trim();
  var quantity = sanitizePositiveInt(Number(body.quantity || 1));
  if (!unitId || !HANGAR_UNIT_DEFS[unitId]) throw new Error("Invalid unitId.");
  if (quantity <= 0) throw new Error("Invalid quantity.");

  var tx = withStateTransaction(nk, userId, function(state, ts) {
    startHangarProduction(state, unitId, quantity, ts);
    return serializeHangarState(state, ts);
  });
  return JSON.stringify({ ok: true, hangar: tx.result });
}

function rpcHangarCancel(ctx, _logger, nk, payload) {
  var userId = requireUserId(ctx);
  var body = parsePayload(payload);
  var queueIdRaw = String(body.queueId || "").trim();
  var queueId = queueIdRaw.length > 0 ? queueIdRaw : undefined;
  var tx = withStateTransaction(nk, userId, function(state, ts) {
    var canceled = cancelHangarProduction(state, queueId, ts).canceled;
    return { canceledId: canceled.id, hangar: serializeHangarState(state, ts) };
  });
  return JSON.stringify({ ok: true, canceledId: tx.result.canceledId, hangar: tx.result.hangar });
}

function rpcInventoryGet(ctx, _logger, nk, payload) {
  var userId = requireUserId(ctx);
  var body = parsePayload(payload);
  var ackMapDropNotifications = Boolean(body && body.ackMapDropNotifications);
  var tx = withInventoryTransaction(nk, userId, function(inv) {
    if ((inv.starterSeedVersion || 0) < INVENTORY_STARTER_SEED_VERSION) {
      for (var i = 0; i < INVENTORY_STARTER_SEED.length; i++) {
        var seed = INVENTORY_STARTER_SEED[i];
        var idx = findInventoryIndex(inv, seed.itemId);
        if (idx === -1) {
          addItemToInventory(inv, seed.itemId, seed.quantity);
          continue;
        }
        if (inv.items[idx].quantity < seed.quantity) {
          inv.items[idx].quantity = seed.quantity;
        }
      }
      inv.starterSeedVersion = INVENTORY_STARTER_SEED_VERSION;
    }
    if (ackMapDropNotifications && sanitizePositiveInt(inv.mapDropNotifications || 0) > 0) {
      inv.mapDropNotifications = 0;
    }
    return inv;
  });
  var inventory = tx.inventory;
  return JSON.stringify({
    ok: true,
    items: serializeInventoryItems(inventory),
    mapDropNotifications: sanitizePositiveInt(inventory.mapDropNotifications || 0)
  });
}

function rpcInventoryMeta(ctx, _logger, nk, payload) {
  var userId = requireUserId(ctx);
  var body = parsePayload(payload);
  var ackMapDropNotifications = Boolean(body && body.ackMapDropNotifications);
  if (!ackMapDropNotifications) {
    var readOnly = readInventoryState(nk, userId);
    var readInventory = normalizeInventory(readOnly.state || defaultInventoryState(userId), userId);
    return JSON.stringify({
      ok: true,
      mapDropNotifications: sanitizePositiveInt(readInventory.mapDropNotifications || 0)
    });
  }

  var tx = withInventoryTransaction(nk, userId, function(inv) {
    if (sanitizePositiveInt(inv.mapDropNotifications || 0) > 0) {
      inv.mapDropNotifications = 0;
    }
    return inv;
  });
  return JSON.stringify({
    ok: true,
    mapDropNotifications: sanitizePositiveInt(tx.inventory.mapDropNotifications || 0)
  });
}

function rpcInventoryUseItem(ctx, _logger, nk, payload) {
  var userId = requireUserId(ctx);
  var body = parsePayload(payload);
  var itemId = String(body.itemId || "").trim();
  var buildingId = String(body.buildingId || "").trim();
  var queueId = String(body.queueId || "").trim();
  var target = String(body.target || "building").trim().toLowerCase();
  var quantity = sanitizePositiveInt(Number(body.quantity || 1));
  if (!itemId) throw new Error("Missing itemId.");
  if (quantity <= 0) throw new Error("Invalid quantity.");

  var itemDef = ITEM_DEFINITIONS[itemId];
  if (!itemDef) throw new Error("Unknown itemId.");

  if (itemDef.category === "TIME_BOOST") {
    if (target === "hangar") {
      var hangarResult = useTimeRiftOnHangar(nk, userId, itemId, quantity, queueId.length > 0 ? queueId : undefined);
      return JSON.stringify({
        ok: true,
        used: {
          itemId: itemId,
          category: itemDef.category,
          target: "hangar",
          quantity: hangarResult.usedQuantity,
          durationSeconds: hangarResult.usedSeconds,
          appliedOnServer: true
        },
        items: serializeInventoryItems(hangarResult.inventory),
        state: hangarResult.economy,
        hangar: hangarResult.hangar
      });
    }

    if (target === "research_local") {
      var localResult = consumeTimeRiftForLocalTarget(nk, userId, itemId, quantity);
      return JSON.stringify({
        ok: true,
        used: {
          itemId: itemId,
          category: itemDef.category,
          target: "research_local",
          quantity: localResult.usedQuantity,
          durationSeconds: localResult.usedSeconds,
          appliedOnServer: false
        },
        items: serializeInventoryItems(localResult.inventory)
      });
    }

    if (!buildingId) throw new Error("Missing buildingId.");
    var result = useTimeRift(nk, userId, buildingId, itemId, quantity);
    return JSON.stringify({
      ok: true,
      used: {
        itemId: itemId,
        category: itemDef.category,
        target: "building",
        quantity: result.usedQuantity,
        durationSeconds: result.usedSeconds,
        slot: result.slot,
        appliedOnServer: result.appliedOnServer
      },
      items: serializeInventoryItems(result.inventory),
      state: result.economy
    });
  }

  if (itemDef.category === "RESOURCE_CRATE") {
    var chest = openChest(nk, userId, itemId, quantity, _logger);
    return JSON.stringify({
      ok: true,
      used: {
        itemId: itemId,
        category: itemDef.category,
        quantity: chest.opened
      },
      rewards: chest.gains,
      items: serializeInventoryItems(chest.inventory),
      state: chest.economy
    });
  }
  throw new Error("Unsupported item category: " + itemDef.category);
}

function userAllianceRole(alliance, userId) {
  var members = Array.isArray(alliance.members) ? alliance.members : [];
  for (var i = 0; i < members.length; i++) {
    if (members[i].userId === userId) return members[i].role || "member";
  }
  return "";
}

function appendAllianceLog(alliance, type, message, by, atTs) {
  alliance.logs = Array.isArray(alliance.logs) ? alliance.logs : [];
  alliance.logs.unshift({
    at: atTs,
    type: type,
    message: message,
    by: by
  });
  if (alliance.logs.length > 120) alliance.logs = alliance.logs.slice(0, 120);
}

function rpcCreateAlliance(ctx, logger, nk, payload) {
  try {
    var userId = requireUserId(ctx);
    var username = ctx.username || userId;
    var body = parsePayload(payload);
    var parsed = validateAllianceCreatePayload(body);

    for (var attempt = 0; attempt < ALLIANCE_WRITE_RETRIES; attempt++) {
      var ts = nowTs();
      var economyRead = readEconomyState(nk, userId);
      var economy = applyOfflineProduction(economyRead.state, ts);
      var legacyProfileRead = readAllianceProfile(nk, userId);
      var legacyProfile = legacyProfileRead.state || defaultAllianceProfile();
      var playerProfileRead = readPlayerProfile(nk, userId);
      var playerProfile = playerProfileRead.state || defaultPlayerProfile();

      var existingAllianceId = String(playerProfile.allianceId || legacyProfile.allianceId || "").trim();
      if (existingAllianceId) throw new Error("You are already in an alliance.");
      if (!hasEnoughResourcesForCost(economy, ALLIANCE_CREATE_COST)) throw new Error("Insufficient resources to create alliance.");

      var nameIndexKey = "name:" + parsed.name.toLowerCase();
      var tagIndexKey = "tag:" + parsed.tag.toLowerCase();
      var indexRead = nk.storageRead([
        { collection: ALLIANCE_INDEX_COLLECTION, key: nameIndexKey },
        { collection: ALLIANCE_INDEX_COLLECTION, key: tagIndexKey }
      ]);
      for (var i = 0; i < indexRead.length; i++) {
        if (indexRead[i] && indexRead[i].value && indexRead[i].value.allianceId) {
          if (indexRead[i].key === nameIndexKey) throw new Error("Alliance name already taken.");
          if (indexRead[i].key === tagIndexKey) throw new Error("Alliance tag already taken.");
        }
      }

      var allianceId = "alliance_" + ts + "_" + Math.floor(Math.random() * 1000000).toString(36);
      var baseAlliance = defaultAllianceState(allianceId, userId, username, {
        name: parsed.name,
        tag: parsed.tag,
        description: parsed.description,
        logo: parsed.logoUrl
      }, ts);
      baseAlliance.logoUrl = parsed.logoUrl;
      baseAlliance.createdAt = ts;
      baseAlliance.leaderUserId = userId;
      baseAlliance.officersUserIds = [];
      baseAlliance.memberCount = 1;
      baseAlliance.isRecruiting = true;
      baseAlliance.publicStats = { pointsTotauxAlliance: 0, warsWon: 0, warsLost: 0 };
      baseAlliance.bastionLevel = 1;
      baseAlliance.bastionInvested = {};
      baseAlliance.applications = [];
      baseAlliance.invites = [];
      baseAlliance.contributionPoints = {};
      baseAlliance.contributionPoints[userId] = 0;
      baseAlliance.members = [
        {
          userId: userId,
          username: username,
          role: "chef",
          joinedAt: ts
        }
      ];

      var membersState = {
        allianceId: allianceId,
        members: [
          {
            userId: userId,
            username: username,
            role: "LEADER",
            joinedAt: ts
          }
        ],
        updatedAt: ts
      };

      applyResourceCost(economy, ALLIANCE_CREATE_COST);
      economy.version = (economy.version || 0) + 1;
      economy.lastUpdateTs = ts;

      legacyProfile.allianceId = allianceId;
      legacyProfile.role = "chef";
      legacyProfile.joinedAt = ts;

      playerProfile.allianceId = allianceId;
      playerProfile.pendingAllianceApplicationId = "";
      playerProfile.updatedAt = ts;

      var writes = [];
      var economyWrite = {
        collection: ECONOMY_COLLECTION,
        key: ECONOMY_KEY,
        userId: userId,
        permissionRead: 0,
        permissionWrite: 0,
        value: economy
      };
      if (economyRead.version) economyWrite.version = economyRead.version;
      writes.push(economyWrite);

      var legacyProfileWrite = {
        collection: ALLIANCE_PROFILE_COLLECTION,
        key: ALLIANCE_PROFILE_KEY,
        userId: userId,
        permissionRead: 0,
        permissionWrite: 0,
        value: legacyProfile
      };
      if (legacyProfileRead.version) legacyProfileWrite.version = legacyProfileRead.version;
      writes.push(legacyProfileWrite);

      var playerProfileWrite = {
        collection: PLAYER_PROFILE_COLLECTION,
        key: PLAYER_PROFILE_KEY,
        userId: userId,
        permissionRead: 0,
        permissionWrite: 0,
        value: playerProfile
      };
      if (playerProfileRead.version) playerProfileWrite.version = playerProfileRead.version;
      writes.push(playerProfileWrite);

      writes.push({
      collection: ALLIANCE_COLLECTION,
      key: allianceId,
      permissionRead: 0,
      permissionWrite: 0,
      value: baseAlliance,
      version: "*"
    });

      writes.push({
      collection: ALLIANCES_PUBLIC_COLLECTION,
      key: allianceId,
      permissionRead: 2,
      permissionWrite: 0,
      value: buildAlliancePublicState(baseAlliance, membersState.members),
      version: "*"
    });

      writes.push({
      collection: ALLIANCE_MEMBERS_COLLECTION,
      key: allianceId,
      permissionRead: 0,
      permissionWrite: 0,
      value: membersState,
      version: "*"
    });

      writes.push({
      collection: ALLIANCE_INDEX_COLLECTION,
      key: nameIndexKey,
      permissionRead: 0,
      permissionWrite: 0,
      value: { allianceId: allianceId, type: "name", value: parsed.name, createdAt: ts },
      version: "*"
    });

      writes.push({
      collection: ALLIANCE_INDEX_COLLECTION,
      key: tagIndexKey,
      permissionRead: 0,
      permissionWrite: 0,
      value: { allianceId: allianceId, type: "tag", value: parsed.tag, createdAt: ts },
      version: "*"
    });

      try {
        nk.storageWrite(writes);
        var points = syncPlayerPoints(nk, logger, userId, username, economy);
        if (logger && typeof logger.info === "function") logger.info("alliance_create user=" + userId + " alliance=" + allianceId);
        return JSON.stringify({
          ok: true,
          inAlliance: true,
          alliance: buildAllianceDto(baseAlliance, membersState.members),
          creationCost: ALLIANCE_CREATE_COST,
          points: points
        });
      } catch (errWrite) {
        var msg = String(errWrite || "").toLowerCase();
        var retriable = msg.indexOf("version") >= 0 || msg.indexOf("optimistic") >= 0 || msg.indexOf("conflict") >= 0;
        if (!retriable || attempt === ALLIANCE_WRITE_RETRIES - 1) {
          if (msg.indexOf("name:") >= 0) throw new Error("Alliance name already taken.");
          if (msg.indexOf("tag:") >= 0) throw new Error("Alliance tag already taken.");
          throw errWrite;
        }
      }
    }
    throw new Error("Alliance creation failed after retries.");
  } catch (err) {
    var msgOut = String((err && err.message) || err || "Alliance creation failed.");
    return JSON.stringify({ ok: false, error: msgOut, inAlliance: false });
  }
}

function rpcGetMyAlliance(ctx, _logger, nk) {
  var userId = requireUserId(ctx);
  var playerProfileRead = readPlayerProfile(nk, userId);
  var legacyProfileRead = readAllianceProfile(nk, userId);
  var playerProfile = playerProfileRead.state || defaultPlayerProfile();
  var allianceId = String(
    (playerProfile && playerProfile.allianceId) ||
    (legacyProfileRead.state && legacyProfileRead.state.allianceId) ||
    ""
  ).trim();

  var ts = nowTs();
  var inboxRead = readAllianceInbox(nk, userId);
  var inbox = inboxRead.state || defaultAllianceInbox(userId);
  var invitesBefore = Array.isArray(inbox.invites) ? inbox.invites.length : 0;
  cleanInboxInvites(inbox, ts);
  if (Array.isArray(inbox.invites) && inbox.invites.length !== invitesBefore) {
    try {
      nk.storageWrite([makeStorageWriteReq(ALLIANCE_INBOX_COLLECTION, ALLIANCE_INBOX_KEY, userId, inbox, inboxRead.version || "", 0, 0)]);
    } catch (_writeInboxErr) {}
  }

  if (!allianceId) {
    var pendingId = String(playerProfile.pendingAllianceApplicationId || "").trim();
    var pending = null;
    if (pendingId) {
      var pendingAllianceRead = readStorageObject(nk, ALLIANCES_PUBLIC_COLLECTION, pendingId, "");
      var pendingAlliance = pendingAllianceRead.state || null;
      if (pendingAlliance) {
        pending = {
          allianceId: pendingId,
          name: String(pendingAlliance.name || ""),
          tag: String(pendingAlliance.tag || "")
        };
      } else {
        playerProfile.pendingAllianceApplicationId = "";
        try {
          nk.storageWrite([makeStorageWriteReq(PLAYER_PROFILE_COLLECTION, PLAYER_PROFILE_KEY, userId, playerProfile, playerProfileRead.version || "", 0, 0)]);
        } catch (_clearPendingErr) {}
      }
    }
    return JSON.stringify({ ok: true, inAlliance: false, invites: inbox.invites || [], pendingApplication: pending });
  }

  var allianceRead = readStorageObject(nk, ALLIANCES_PUBLIC_COLLECTION, allianceId, "");
  if (!allianceRead.state) {
    allianceRead = readAllianceState(nk, allianceId);
  }
  var alliance = allianceRead.state || null;
  if (!alliance) return JSON.stringify({ ok: true, inAlliance: false, invites: inbox.invites || [], pendingApplication: null });

  var composite = readAllianceCompositeState(nk, allianceId);
  if (composite.alliance) alliance = composite.alliance;
  var members = composite.members && composite.members.length > 0
    ? composite.members
    : getAllianceMemberList(alliance, alliance.leaderUserId || userId, ts);
  members = rebuildAllianceLeadership(alliance, members, ts);
  var myRole = "MEMBER";
  for (var i = 0; i < members.length; i++) {
    if (members[i].userId === userId) {
      myRole = members[i].role || "MEMBER";
      break;
    }
  }

  var dto = buildAllianceDto(alliance, members);
  if (myRole !== "LEADER" && myRole !== "OFFICER") {
    dto.applications = [];
    dto.invites = [];
  }

  return JSON.stringify({
    ok: true,
    inAlliance: true,
    myRole: myRole,
    alliance: dto,
    invites: inbox.invites || [],
    pendingApplication: null
  });
}

function rpcSearchAlliances(_ctx, _logger, nk, payload) {
  var body = parsePayload(payload);
  var query = String(body.query || "").trim().toLowerCase();
  var cursor = String(body.cursor || "");
  var limit = Math.max(5, Math.min(50, sanitizePositiveInt(body.limit || 20)));

  var listed = null;
  try {
    listed = nk.storageList(null, ALLIANCES_PUBLIC_COLLECTION, limit, cursor);
  } catch (_e) {
    try {
      listed = nk.storageList("", ALLIANCES_PUBLIC_COLLECTION, limit, cursor);
    } catch (_e2) {
      listed = { objects: [], cursor: "" };
    }
  }

  var objects = Array.isArray(listed.objects) ? listed.objects : [];
  var items = [];
  for (var i = 0; i < objects.length; i++) {
    var value = objects[i].value || {};
    var name = String(value.name || "");
    var tag = String(value.tag || "");
    if (query && name.toLowerCase().indexOf(query) === -1 && tag.toLowerCase().indexOf(query) === -1) continue;
    items.push({
      id: String(value.id || objects[i].key || ""),
      name: name,
      tag: tag,
      memberCount: sanitizePositiveInt(value.memberCount || (Array.isArray(value.members) ? value.members.length : 0)),
      bastionLevel: sanitizePositiveInt(value.bastionLevel || 1),
      isRecruiting: value.isRecruiting !== false,
      logoUrl: String(value.logoUrl || value.logo || "")
    });
  }

  return JSON.stringify({
    ok: true,
    items: items,
    nextCursor: String(listed.cursor || "")
  });
}

function toLegacyAllianceRole(role) {
  if (role === "LEADER") return "chef";
  if (role === "OFFICER") return "co_lead";
  return "member";
}

function findAllianceMemberIndex(members, userId) {
  for (var i = 0; i < members.length; i++) {
    if (members[i].userId === userId) return i;
  }
  return -1;
}

function isVersionConflictError(err) {
  var msg = String(err || "").toLowerCase();
  return msg.indexOf("version") >= 0 || msg.indexOf("optimistic") >= 0 || msg.indexOf("conflict") >= 0;
}

function rpcUpdateMyAlliance(ctx, _logger, nk, payload) {
  try {
    var userId = requireUserId(ctx);
    var username = ctx.username || userId;
    var body = parsePayload(payload);
    var hasDescription = Object.prototype.hasOwnProperty.call(body, "description");
    var hasLogo = Object.prototype.hasOwnProperty.call(body, "logoUrl");
    var hasRecruiting = Object.prototype.hasOwnProperty.call(body, "isRecruiting");
    if (!hasDescription && !hasLogo && !hasRecruiting) {
      throw new Error("No update fields provided.");
    }

    var nextDescription = hasDescription ? String(body.description || "").trim() : null;
    var nextLogoUrl = hasLogo ? String(body.logoUrl || "").trim() : null;
    var nextRecruiting = hasRecruiting ? Boolean(body.isRecruiting) : null;
    if (nextDescription !== null && nextDescription.length > 500) throw new Error("Alliance description max length is 500.");
    if (nextLogoUrl !== null && nextLogoUrl.length > 512) throw new Error("Alliance logo URL max length is 512.");

    for (var attempt = 0; attempt < ALLIANCE_WRITE_RETRIES; attempt++) {
      var playerProfileRead = readPlayerProfile(nk, userId);
      var legacyProfileRead = readAllianceProfile(nk, userId);
      var allianceId = String(
        (playerProfileRead.state && playerProfileRead.state.allianceId) ||
        (legacyProfileRead.state && legacyProfileRead.state.allianceId) ||
        ""
      ).trim();
      if (!allianceId) throw new Error("You are not in an alliance.");

      var composite = readAllianceCompositeState(nk, allianceId);
      var alliance = composite.alliance;
      if (!alliance) throw new Error("Alliance not found.");

      var ts = nowTs();
      var members = rebuildAllianceLeadership(alliance, composite.members, ts);
      var actorIndex = findAllianceMemberIndex(members, userId);
      if (actorIndex < 0) throw new Error("You are not a member of this alliance.");
      var actorRole = members[actorIndex].role;
      if (actorRole !== "LEADER") throw new Error("Leader role required.");

      if (nextDescription !== null) alliance.description = nextDescription;
      if (nextLogoUrl !== null) {
        alliance.logoUrl = nextLogoUrl;
        alliance.logo = nextLogoUrl;
      }
      if (nextRecruiting !== null) alliance.isRecruiting = nextRecruiting;
      appendAllianceLog(alliance, "settings_update", username + " updated alliance settings.", username, ts);
      alliance.updatedAt = ts;

      var membersState = {
        allianceId: allianceId,
        members: members,
        updatedAt: ts
      };

      try {
        nk.storageWrite([
          makeStorageWriteReq(ALLIANCE_COLLECTION, allianceId, "", alliance, composite.privateVersion || "*", 0, 0),
          makeStorageWriteReq(ALLIANCES_PUBLIC_COLLECTION, allianceId, "", buildAlliancePublicState(alliance, members), composite.publicVersion || "*", 2, 0),
          makeStorageWriteReq(ALLIANCE_MEMBERS_COLLECTION, allianceId, "", membersState, composite.membersVersion || "*", 0, 0)
        ]);
        return JSON.stringify({
          ok: true,
          inAlliance: true,
          myRole: actorRole,
          alliance: buildAllianceDto(alliance, members)
        });
      } catch (errWrite) {
        if (attempt === ALLIANCE_WRITE_RETRIES - 1 || !isVersionConflictError(errWrite)) throw errWrite;
      }
    }

    throw new Error("Alliance update failed after retries.");
  } catch (err) {
    return JSON.stringify({ ok: false, error: String((err && err.message) || err || "Alliance update failed.") });
  }
}

function rpcJoinAlliance(ctx, _logger, nk, payload) {
  try {
    var userId = requireUserId(ctx);
    var username = ctx.username || userId;
    var body = parsePayload(payload);
    var allianceId = String(body.allianceId || "").trim();
    if (!allianceId) throw new Error("Missing allianceId.");

    for (var attempt = 0; attempt < ALLIANCE_WRITE_RETRIES; attempt++) {
      var ts = nowTs();
      var playerProfileRead = readPlayerProfile(nk, userId);
      var legacyProfileRead = readAllianceProfile(nk, userId);
      var playerProfile = playerProfileRead.state || defaultPlayerProfile();
      var legacyProfile = legacyProfileRead.state || defaultAllianceProfile();
      var existingAllianceId = String(playerProfile.allianceId || legacyProfile.allianceId || "").trim();
      if (existingAllianceId && existingAllianceId !== allianceId) throw new Error("Leave your current alliance first.");

      var composite = readAllianceCompositeState(nk, allianceId);
      var alliance = composite.alliance;
      if (!alliance) throw new Error("Alliance not found.");
      if (alliance.isRecruiting === false) throw new Error("Alliance is not recruiting.");

      var members = rebuildAllianceLeadership(alliance, composite.members, ts);
      var myIndex = findAllianceMemberIndex(members, userId);
      if (myIndex < 0) {
        var cap = sanitizePositiveInt(alliance.memberCap || DEFAULT_ALLIANCE_MEMBER_CAP) || DEFAULT_ALLIANCE_MEMBER_CAP;
        if (members.length >= cap) throw new Error("Alliance is full.");
        members.push({
          userId: userId,
          username: username,
          role: "MEMBER",
          joinedAt: ts
        });
        appendAllianceLog(alliance, "member_join", username + " joined alliance.", username, ts);
      }

      members = rebuildAllianceLeadership(alliance, members, ts);
      var myRole = "MEMBER";
      var idx = findAllianceMemberIndex(members, userId);
      if (idx >= 0) myRole = members[idx].role;

      playerProfile.allianceId = allianceId;
      playerProfile.pendingAllianceApplicationId = "";
      playerProfile.updatedAt = ts;
      legacyProfile.allianceId = allianceId;
      legacyProfile.role = toLegacyAllianceRole(myRole);
      legacyProfile.joinedAt = legacyProfile.joinedAt || ts;
      var inboxRead = readAllianceInbox(nk, userId);
      var inbox = inboxRead.state || defaultAllianceInbox(userId);
      cleanInboxInvites(inbox, ts);
      inbox.invites = (inbox.invites || []).filter(function (it) { return String(it.allianceId || "") !== allianceId; });

      var membersState = {
        allianceId: allianceId,
        members: members,
        updatedAt: ts
      };

      try {
        nk.storageWrite([
          makeStorageWriteReq(PLAYER_PROFILE_COLLECTION, PLAYER_PROFILE_KEY, userId, playerProfile, playerProfileRead.version || "", 0, 0),
          makeStorageWriteReq(ALLIANCE_PROFILE_COLLECTION, ALLIANCE_PROFILE_KEY, userId, legacyProfile, legacyProfileRead.version || "", 0, 0),
          makeStorageWriteReq(ALLIANCE_INBOX_COLLECTION, ALLIANCE_INBOX_KEY, userId, inbox, inboxRead.version || "", 0, 0),
          makeStorageWriteReq(ALLIANCE_COLLECTION, allianceId, "", alliance, composite.privateVersion || "*", 0, 0),
          makeStorageWriteReq(ALLIANCES_PUBLIC_COLLECTION, allianceId, "", buildAlliancePublicState(alliance, members), composite.publicVersion || "*", 2, 0),
          makeStorageWriteReq(ALLIANCE_MEMBERS_COLLECTION, allianceId, "", membersState, composite.membersVersion || "*", 0, 0)
        ]);
        return JSON.stringify({
          ok: true,
          inAlliance: true,
          myRole: myRole,
          alliance: buildAllianceDto(alliance, members)
        });
      } catch (errWrite) {
        if (attempt === ALLIANCE_WRITE_RETRIES - 1 || !isVersionConflictError(errWrite)) throw errWrite;
      }
    }
    throw new Error("Join alliance failed after retries.");
  } catch (err) {
    return JSON.stringify({ ok: false, error: String((err && err.message) || err || "Join alliance failed.") });
  }
}

function rpcLeaveAlliance(ctx, _logger, nk) {
  try {
    var userId = requireUserId(ctx);
    var username = ctx.username || userId;

    for (var attempt = 0; attempt < ALLIANCE_WRITE_RETRIES; attempt++) {
      var ts = nowTs();
      var playerProfileRead = readPlayerProfile(nk, userId);
      var legacyProfileRead = readAllianceProfile(nk, userId);
      var playerProfile = playerProfileRead.state || defaultPlayerProfile();
      var legacyProfile = legacyProfileRead.state || defaultAllianceProfile();
      var allianceId = String(playerProfile.allianceId || legacyProfile.allianceId || "").trim();
      if (!allianceId) {
        return JSON.stringify({ ok: true, inAlliance: false, alliance: null });
      }

      var composite = readAllianceCompositeState(nk, allianceId);
      var alliance = composite.alliance;
      if (!alliance) {
        playerProfile.allianceId = "";
        playerProfile.pendingAllianceApplicationId = "";
        playerProfile.updatedAt = ts;
        legacyProfile = defaultAllianceProfile();
        nk.storageWrite([
          makeStorageWriteReq(PLAYER_PROFILE_COLLECTION, PLAYER_PROFILE_KEY, userId, playerProfile, playerProfileRead.version || "", 0, 0),
          makeStorageWriteReq(ALLIANCE_PROFILE_COLLECTION, ALLIANCE_PROFILE_KEY, userId, legacyProfile, legacyProfileRead.version || "", 0, 0)
        ]);
        return JSON.stringify({ ok: true, inAlliance: false, alliance: null });
      }

      var members = rebuildAllianceLeadership(alliance, composite.members, ts);
      var myIndex = findAllianceMemberIndex(members, userId);
      if (myIndex < 0) {
        playerProfile.allianceId = "";
        playerProfile.pendingAllianceApplicationId = "";
        playerProfile.updatedAt = ts;
        legacyProfile = defaultAllianceProfile();
        nk.storageWrite([
          makeStorageWriteReq(PLAYER_PROFILE_COLLECTION, PLAYER_PROFILE_KEY, userId, playerProfile, playerProfileRead.version || "", 0, 0),
          makeStorageWriteReq(ALLIANCE_PROFILE_COLLECTION, ALLIANCE_PROFILE_KEY, userId, legacyProfile, legacyProfileRead.version || "", 0, 0)
        ]);
        return JSON.stringify({ ok: true, inAlliance: false, alliance: null });
      }

      var myRole = members[myIndex].role;
      if (myRole === "LEADER" && members.length > 1) {
        throw new Error("Transfer leadership before leaving alliance.");
      }

      members.splice(myIndex, 1);
      if (alliance.cachedMemberScores && typeof alliance.cachedMemberScores === "object") {
        delete alliance.cachedMemberScores[userId];
        computeAllianceCachedTotal(alliance);
      }

      playerProfile.allianceId = "";
      playerProfile.pendingAllianceApplicationId = "";
      playerProfile.updatedAt = ts;
      legacyProfile = defaultAllianceProfile();

      if (members.length === 0) {
        var nameIndexKey = "name:" + String(alliance.name || "").toLowerCase();
        var tagIndexKey = "tag:" + String(alliance.tag || "").toLowerCase();

        nk.storageWrite([
          makeStorageWriteReq(PLAYER_PROFILE_COLLECTION, PLAYER_PROFILE_KEY, userId, playerProfile, playerProfileRead.version || "", 0, 0),
          makeStorageWriteReq(ALLIANCE_PROFILE_COLLECTION, ALLIANCE_PROFILE_KEY, userId, legacyProfile, legacyProfileRead.version || "", 0, 0)
        ]);
        nk.storageDelete([
          { collection: ALLIANCE_COLLECTION, key: allianceId },
          { collection: ALLIANCES_PUBLIC_COLLECTION, key: allianceId },
          { collection: ALLIANCE_MEMBERS_COLLECTION, key: allianceId },
          { collection: ALLIANCE_INDEX_COLLECTION, key: nameIndexKey },
          { collection: ALLIANCE_INDEX_COLLECTION, key: tagIndexKey }
        ]);
        return JSON.stringify({ ok: true, inAlliance: false, alliance: null, disbanded: true });
      }

      appendAllianceLog(alliance, "member_leave", username + " left alliance.", username, ts);
      members = rebuildAllianceLeadership(alliance, members, ts);
      var membersState = {
        allianceId: allianceId,
        members: members,
        updatedAt: ts
      };

      try {
        nk.storageWrite([
          makeStorageWriteReq(PLAYER_PROFILE_COLLECTION, PLAYER_PROFILE_KEY, userId, playerProfile, playerProfileRead.version || "", 0, 0),
          makeStorageWriteReq(ALLIANCE_PROFILE_COLLECTION, ALLIANCE_PROFILE_KEY, userId, legacyProfile, legacyProfileRead.version || "", 0, 0),
          makeStorageWriteReq(ALLIANCE_COLLECTION, allianceId, "", alliance, composite.privateVersion || "*", 0, 0),
          makeStorageWriteReq(ALLIANCES_PUBLIC_COLLECTION, allianceId, "", buildAlliancePublicState(alliance, members), composite.publicVersion || "*", 2, 0),
          makeStorageWriteReq(ALLIANCE_MEMBERS_COLLECTION, allianceId, "", membersState, composite.membersVersion || "*", 0, 0)
        ]);
        return JSON.stringify({ ok: true, inAlliance: false, alliance: null });
      } catch (errWrite) {
        if (attempt === ALLIANCE_WRITE_RETRIES - 1 || !isVersionConflictError(errWrite)) throw errWrite;
      }
    }
    throw new Error("Leave alliance failed after retries.");
  } catch (err) {
    return JSON.stringify({ ok: false, error: String((err && err.message) || err || "Leave alliance failed.") });
  }
}

function rpcAllianceMemberAction(ctx, _logger, nk, payload) {
  try {
    var userId = requireUserId(ctx);
    var username = ctx.username || userId;
    var body = parsePayload(payload);
    var action = String(body.action || "").trim();
    var targetUserId = String(body.targetUserId || "").trim();
    if (!action) throw new Error("Missing action.");
    if (!targetUserId) throw new Error("Missing targetUserId.");

    for (var attempt = 0; attempt < ALLIANCE_WRITE_RETRIES; attempt++) {
      var ts = nowTs();
      var playerProfileRead = readPlayerProfile(nk, userId);
      var legacyProfileRead = readAllianceProfile(nk, userId);
      var allianceId = String(
        (playerProfileRead.state && playerProfileRead.state.allianceId) ||
        (legacyProfileRead.state && legacyProfileRead.state.allianceId) ||
        ""
      ).trim();
      if (!allianceId) throw new Error("You are not in an alliance.");

      var composite = readAllianceCompositeState(nk, allianceId);
      var alliance = composite.alliance;
      if (!alliance) throw new Error("Alliance not found.");

      var members = rebuildAllianceLeadership(alliance, composite.members, ts);
      var actorIndex = findAllianceMemberIndex(members, userId);
      if (actorIndex < 0) throw new Error("You are not a member of this alliance.");
      var targetIndex = findAllianceMemberIndex(members, targetUserId);
      if (targetIndex < 0) throw new Error("Target user is not a member.");
      var actorRole = members[actorIndex].role;
      var targetRole = members[targetIndex].role;
      var targetUsername = members[targetIndex].username || targetUserId;
      var kicked = false;

      if (action === "promote_officer") {
        if (actorRole !== "LEADER") throw new Error("Leader role required.");
        if (targetRole === "LEADER") throw new Error("Cannot promote current leader.");
        if (targetRole !== "OFFICER") {
          var officersCount = 0;
          for (var i = 0; i < members.length; i++) if (members[i].role === "OFFICER") officersCount++;
          if (officersCount >= 3) throw new Error("Officer limit reached (3).");
          members[targetIndex].role = "OFFICER";
        }
      } else if (action === "demote_officer") {
        if (actorRole !== "LEADER") throw new Error("Leader role required.");
        if (targetRole !== "OFFICER") throw new Error("Target is not an officer.");
        members[targetIndex].role = "MEMBER";
      } else if (action === "transfer_leadership") {
        if (actorRole !== "LEADER") throw new Error("Leader role required.");
        if (targetUserId === userId) throw new Error("Cannot transfer leadership to yourself.");
        if (targetRole === "LEADER") throw new Error("Target is already leader.");
        members[actorIndex].role = "MEMBER";
        members[targetIndex].role = "LEADER";
      } else if (action === "kick_member") {
        if (targetUserId === userId) throw new Error("Use leave alliance action for yourself.");
        if (targetRole === "LEADER") throw new Error("Cannot kick alliance leader.");
        if (actorRole !== "LEADER" && actorRole !== "OFFICER") throw new Error("Insufficient role.");
        if (actorRole === "OFFICER" && targetRole !== "MEMBER") throw new Error("Officers can kick members only.");
        members.splice(targetIndex, 1);
        kicked = true;
        if (alliance.cachedMemberScores && typeof alliance.cachedMemberScores === "object") {
          delete alliance.cachedMemberScores[targetUserId];
          computeAllianceCachedTotal(alliance);
        }
      } else {
        throw new Error("Unknown member action.");
      }

      members = rebuildAllianceLeadership(alliance, members, ts);
      appendAllianceLog(alliance, "member_action", username + " executed " + action + " on " + targetUsername + ".", username, ts);

      var membersState = {
        allianceId: allianceId,
        members: members,
        updatedAt: ts
      };

      var writes = [
        makeStorageWriteReq(ALLIANCE_COLLECTION, allianceId, "", alliance, composite.privateVersion || "*", 0, 0),
        makeStorageWriteReq(ALLIANCES_PUBLIC_COLLECTION, allianceId, "", buildAlliancePublicState(alliance, members), composite.publicVersion || "*", 2, 0),
        makeStorageWriteReq(ALLIANCE_MEMBERS_COLLECTION, allianceId, "", membersState, composite.membersVersion || "*", 0, 0)
      ];

      var targetLegacyRead = readAllianceProfile(nk, targetUserId);
      var targetLegacy = targetLegacyRead.state || defaultAllianceProfile();
      if (kicked) {
        var targetPlayerRead = readPlayerProfile(nk, targetUserId);
        var targetPlayer = targetPlayerRead.state || defaultPlayerProfile();
        targetPlayer.allianceId = "";
        targetPlayer.pendingAllianceApplicationId = "";
        targetPlayer.updatedAt = ts;
        targetLegacy = defaultAllianceProfile();
        writes.push(makeStorageWriteReq(PLAYER_PROFILE_COLLECTION, PLAYER_PROFILE_KEY, targetUserId, targetPlayer, targetPlayerRead.version || "", 0, 0));
      } else {
        var updatedTargetRole = "MEMBER";
        var updatedTargetIndex = findAllianceMemberIndex(members, targetUserId);
        if (updatedTargetIndex >= 0) updatedTargetRole = members[updatedTargetIndex].role;
        targetLegacy.allianceId = allianceId;
        targetLegacy.role = toLegacyAllianceRole(updatedTargetRole);
        targetLegacy.joinedAt = targetLegacy.joinedAt || ts;
      }
      writes.push(makeStorageWriteReq(ALLIANCE_PROFILE_COLLECTION, ALLIANCE_PROFILE_KEY, targetUserId, targetLegacy, targetLegacyRead.version || "", 0, 0));

      if (action === "transfer_leadership") {
        var actorLegacy = legacyProfileRead.state || defaultAllianceProfile();
        actorLegacy.allianceId = allianceId;
        actorLegacy.role = "member";
        actorLegacy.joinedAt = actorLegacy.joinedAt || ts;
        writes.push(makeStorageWriteReq(ALLIANCE_PROFILE_COLLECTION, ALLIANCE_PROFILE_KEY, userId, actorLegacy, legacyProfileRead.version || "", 0, 0));
      }

      try {
        nk.storageWrite(writes);
        var myIndexNew = findAllianceMemberIndex(members, userId);
        var myRole = myIndexNew >= 0 ? members[myIndexNew].role : "MEMBER";
        return JSON.stringify({
          ok: true,
          inAlliance: true,
          myRole: myRole,
          alliance: buildAllianceDto(alliance, members)
        });
      } catch (errWrite) {
        if (attempt === ALLIANCE_WRITE_RETRIES - 1 || !isVersionConflictError(errWrite)) throw errWrite;
      }
    }

    throw new Error("Alliance member action failed after retries.");
  } catch (err) {
    return JSON.stringify({ ok: false, error: String((err && err.message) || err || "Alliance member action failed.") });
  }
}

function rpcAllianceApply(ctx, _logger, nk, payload) {
  try {
    var userId = requireUserId(ctx);
    var username = ctx.username || userId;
    var body = parsePayload(payload);
    var allianceId = String(body.allianceId || "").trim();
    var message = String(body.message || "").trim().slice(0, 240);
    if (!allianceId) throw new Error("Missing allianceId.");

    for (var attempt = 0; attempt < ALLIANCE_WRITE_RETRIES; attempt++) {
      var ts = nowTs();
      var playerProfileRead = readPlayerProfile(nk, userId);
      var legacyProfileRead = readAllianceProfile(nk, userId);
      var playerProfile = playerProfileRead.state || defaultPlayerProfile();
      var legacyProfile = legacyProfileRead.state || defaultAllianceProfile();
      if (String(playerProfile.allianceId || legacyProfile.allianceId || "").trim()) throw new Error("Leave your current alliance first.");
      var existingPending = String(playerProfile.pendingAllianceApplicationId || "").trim();
      if (existingPending && existingPending !== allianceId) throw new Error("You already have a pending application.");

      var composite = readAllianceCompositeState(nk, allianceId);
      var alliance = composite.alliance;
      if (!alliance) throw new Error("Alliance not found.");
      if (alliance.isRecruiting === false) throw new Error("Alliance is not recruiting.");
      cleanAllianceApplications(alliance, ts);

      var hasAlreadyApplied = false;
      for (var i = 0; i < alliance.applications.length; i++) {
        if (alliance.applications[i].userId === userId) {
          hasAlreadyApplied = true;
          break;
        }
      }
      if (!hasAlreadyApplied) {
        alliance.applications.unshift({
          userId: userId,
          username: username,
          message: message,
          createdAt: ts
        });
        if (alliance.applications.length > 150) alliance.applications = alliance.applications.slice(0, 150);
        appendAllianceLog(alliance, "application", username + " applied to the alliance.", username, ts);
      }

      playerProfile.pendingAllianceApplicationId = allianceId;
      playerProfile.updatedAt = ts;

      try {
        nk.storageWrite([
          makeStorageWriteReq(PLAYER_PROFILE_COLLECTION, PLAYER_PROFILE_KEY, userId, playerProfile, playerProfileRead.version || "", 0, 0),
          makeStorageWriteReq(ALLIANCE_COLLECTION, allianceId, "", alliance, composite.privateVersion || "*", 0, 0),
          makeStorageWriteReq(ALLIANCES_PUBLIC_COLLECTION, allianceId, "", buildAlliancePublicState(alliance, members), composite.publicVersion || "*", 2, 0)
        ]);
        return JSON.stringify({
          ok: true,
          pendingApplication: {
            allianceId: allianceId,
            name: String(alliance.name || ""),
            tag: String(alliance.tag || ""),
            message: message
          }
        });
      } catch (errWrite) {
        if (attempt === ALLIANCE_WRITE_RETRIES - 1 || !isVersionConflictError(errWrite)) throw errWrite;
      }
    }

    throw new Error("Apply failed after retries.");
  } catch (err) {
    return JSON.stringify({ ok: false, error: String((err && err.message) || err || "Apply failed.") });
  }
}

function rpcAllianceReviewApplication(ctx, _logger, nk, payload) {
  try {
    var userId = requireUserId(ctx);
    var username = ctx.username || userId;
    var body = parsePayload(payload);
    var targetUserId = String(body.targetUserId || "").trim();
    var accept = Boolean(body.accept);
    if (!targetUserId) throw new Error("Missing targetUserId.");

    for (var attempt = 0; attempt < ALLIANCE_WRITE_RETRIES; attempt++) {
      var ts = nowTs();
      var actorProfileRead = readPlayerProfile(nk, userId);
      var actorLegacyRead = readAllianceProfile(nk, userId);
      var allianceId = String(
        (actorProfileRead.state && actorProfileRead.state.allianceId) ||
        (actorLegacyRead.state && actorLegacyRead.state.allianceId) ||
        ""
      ).trim();
      if (!allianceId) throw new Error("You are not in an alliance.");

      var composite = readAllianceCompositeState(nk, allianceId);
      var alliance = composite.alliance;
      if (!alliance) throw new Error("Alliance not found.");
      var members = rebuildAllianceLeadership(alliance, composite.members, ts);
      var actorIndex = findAllianceMemberIndex(members, userId);
      if (actorIndex < 0) throw new Error("You are not a member of this alliance.");
      var actorRole = members[actorIndex].role;
      if (actorRole !== "LEADER" && actorRole !== "OFFICER") throw new Error("Leader or officer role required.");

      cleanAllianceApplications(alliance, ts);
      var appIndex = -1;
      var app = null;
      for (var i = 0; i < alliance.applications.length; i++) {
        if (alliance.applications[i].userId === targetUserId) {
          appIndex = i;
          app = alliance.applications[i];
          break;
        }
      }
      if (appIndex < 0 || !app) throw new Error("Application not found.");
      alliance.applications.splice(appIndex, 1);

      var writes = [];
      var targetProfileRead = readPlayerProfile(nk, targetUserId);
      var targetProfile = targetProfileRead.state || defaultPlayerProfile();
      var targetLegacyRead = readAllianceProfile(nk, targetUserId);
      var targetLegacy = targetLegacyRead.state || defaultAllianceProfile();

      if (accept) {
        var targetAllianceId = String(targetProfile.allianceId || targetLegacy.allianceId || "").trim();
        if (targetAllianceId && targetAllianceId !== allianceId) throw new Error("Target user is already in another alliance.");

        var targetMemberIndex = findAllianceMemberIndex(members, targetUserId);
        if (targetMemberIndex < 0) {
          var cap = sanitizePositiveInt(alliance.memberCap || DEFAULT_ALLIANCE_MEMBER_CAP) || DEFAULT_ALLIANCE_MEMBER_CAP;
          if (members.length >= cap) throw new Error("Alliance is full.");
          members.push({
            userId: targetUserId,
            username: String(app.username || targetUserId),
            role: "MEMBER",
            joinedAt: ts
          });
        }

        targetProfile.allianceId = allianceId;
        targetProfile.pendingAllianceApplicationId = "";
        targetProfile.updatedAt = ts;
        targetLegacy.allianceId = allianceId;
        targetLegacy.role = "member";
        targetLegacy.joinedAt = targetLegacy.joinedAt || ts;

        cleanAllianceInvites(alliance, ts);
        alliance.invites = (alliance.invites || []).filter(function (it) { return String(it.targetUserId || "") !== targetUserId; });

        var targetInboxRead = readAllianceInbox(nk, targetUserId);
        var targetInbox = targetInboxRead.state || defaultAllianceInbox(targetUserId);
        cleanInboxInvites(targetInbox, ts);
        targetInbox.invites = (targetInbox.invites || []).filter(function (it) { return String(it.allianceId || "") !== allianceId; });
        writes.push(makeStorageWriteReq(ALLIANCE_INBOX_COLLECTION, ALLIANCE_INBOX_KEY, targetUserId, targetInbox, targetInboxRead.version || "", 0, 0));

        appendAllianceLog(alliance, "application_accept", username + " accepted " + (app.username || targetUserId) + ".", username, ts);
      } else {
        if (String(targetProfile.pendingAllianceApplicationId || "").trim() === allianceId) {
          targetProfile.pendingAllianceApplicationId = "";
          targetProfile.updatedAt = ts;
        }
        appendAllianceLog(alliance, "application_reject", username + " rejected " + (app.username || targetUserId) + ".", username, ts);
      }

      members = rebuildAllianceLeadership(alliance, members, ts);
      var membersState = {
        allianceId: allianceId,
        members: members,
        updatedAt: ts
      };

      writes.push(
        makeStorageWriteReq(PLAYER_PROFILE_COLLECTION, PLAYER_PROFILE_KEY, targetUserId, targetProfile, targetProfileRead.version || "", 0, 0),
        makeStorageWriteReq(ALLIANCE_PROFILE_COLLECTION, ALLIANCE_PROFILE_KEY, targetUserId, targetLegacy, targetLegacyRead.version || "", 0, 0),
        makeStorageWriteReq(ALLIANCE_COLLECTION, allianceId, "", alliance, composite.privateVersion || "*", 0, 0),
        makeStorageWriteReq(ALLIANCES_PUBLIC_COLLECTION, allianceId, "", buildAlliancePublicState(alliance, members), composite.publicVersion || "*", 2, 0),
        makeStorageWriteReq(ALLIANCE_MEMBERS_COLLECTION, allianceId, "", membersState, composite.membersVersion || "*", 0, 0)
      );

      try {
        nk.storageWrite(writes);
        return JSON.stringify({
          ok: true,
          inAlliance: true,
          myRole: actorRole,
          alliance: buildAllianceDto(alliance, members)
        });
      } catch (errWrite) {
        if (attempt === ALLIANCE_WRITE_RETRIES - 1 || !isVersionConflictError(errWrite)) throw errWrite;
      }
    }
    throw new Error("Review application failed after retries.");
  } catch (err) {
    return JSON.stringify({ ok: false, error: String((err && err.message) || err || "Review application failed.") });
  }
}

function rpcAllianceInvitePlayer(ctx, _logger, nk, payload) {
  try {
    var userId = requireUserId(ctx);
    var username = ctx.username || userId;
    var body = parsePayload(payload);
    var targetUserId = String(body.targetUserId || "").trim();
    if (!targetUserId) throw new Error("Missing targetUserId.");
    if (targetUserId === userId) throw new Error("Cannot invite yourself.");

    for (var attempt = 0; attempt < ALLIANCE_WRITE_RETRIES; attempt++) {
      var ts = nowTs();
      var actorProfileRead = readPlayerProfile(nk, userId);
      var actorLegacyRead = readAllianceProfile(nk, userId);
      var allianceId = String(
        (actorProfileRead.state && actorProfileRead.state.allianceId) ||
        (actorLegacyRead.state && actorLegacyRead.state.allianceId) ||
        ""
      ).trim();
      if (!allianceId) throw new Error("You are not in an alliance.");

      var composite = readAllianceCompositeState(nk, allianceId);
      var alliance = composite.alliance;
      if (!alliance) throw new Error("Alliance not found.");

      var members = rebuildAllianceLeadership(alliance, composite.members, ts);
      var actorIndex = findAllianceMemberIndex(members, userId);
      if (actorIndex < 0) throw new Error("You are not a member of this alliance.");
      var actorRole = members[actorIndex].role;
      if (actorRole !== "LEADER" && actorRole !== "OFFICER") throw new Error("Leader or officer role required.");

      var targetProfileRead = readPlayerProfile(nk, targetUserId);
      var targetLegacyRead = readAllianceProfile(nk, targetUserId);
      var targetProfile = targetProfileRead.state || defaultPlayerProfile();
      var targetLegacy = targetLegacyRead.state || defaultAllianceProfile();
      if (String(targetProfile.allianceId || targetLegacy.allianceId || "").trim()) throw new Error("Target user is already in an alliance.");

      var targetInboxRead = readAllianceInbox(nk, targetUserId);
      var targetInbox = targetInboxRead.state || defaultAllianceInbox(targetUserId);
      cleanInboxInvites(targetInbox, ts);
      cleanAllianceInvites(alliance, ts);

      var existsInvite = false;
      for (var i = 0; i < alliance.invites.length; i++) {
        if (String(alliance.invites[i].targetUserId || "") === targetUserId) {
          existsInvite = true;
          alliance.invites[i].expiresAt = ts + ALLIANCE_INVITE_TTL_SEC;
          alliance.invites[i].createdAt = ts;
          alliance.invites[i].byUserId = userId;
          alliance.invites[i].byUsername = username;
          break;
        }
      }
      var invitePayload = {
        allianceId: allianceId,
        allianceName: String(alliance.name || ""),
        allianceTag: String(alliance.tag || ""),
        byUserId: userId,
        byUsername: username,
        targetUserId: targetUserId,
        createdAt: ts,
        expiresAt: ts + ALLIANCE_INVITE_TTL_SEC
      };
      if (!existsInvite) {
        alliance.invites.unshift({
          targetUserId: targetUserId,
          targetUsername: targetUserId,
          byUserId: userId,
          byUsername: username,
          createdAt: ts,
          expiresAt: ts + ALLIANCE_INVITE_TTL_SEC
        });
      }
      targetInbox.invites = (targetInbox.invites || []).filter(function (it) {
        return String(it.allianceId || "") !== allianceId;
      });
      targetInbox.invites.unshift(invitePayload);
      if (targetInbox.invites.length > 120) targetInbox.invites = targetInbox.invites.slice(0, 120);

      appendAllianceLog(alliance, "invite", username + " invited " + targetUserId + ".", username, ts);
      members = rebuildAllianceLeadership(alliance, members, ts);
      var membersState = {
        allianceId: allianceId,
        members: members,
        updatedAt: ts
      };

      try {
        nk.storageWrite([
          makeStorageWriteReq(ALLIANCE_COLLECTION, allianceId, "", alliance, composite.privateVersion || "*", 0, 0),
          makeStorageWriteReq(ALLIANCES_PUBLIC_COLLECTION, allianceId, "", buildAlliancePublicState(alliance, members), composite.publicVersion || "*", 2, 0),
          makeStorageWriteReq(ALLIANCE_MEMBERS_COLLECTION, allianceId, "", membersState, composite.membersVersion || "*", 0, 0),
          makeStorageWriteReq(ALLIANCE_INBOX_COLLECTION, ALLIANCE_INBOX_KEY, targetUserId, targetInbox, targetInboxRead.version || "", 0, 0)
        ]);
        return JSON.stringify({
          ok: true,
          inAlliance: true,
          myRole: actorRole,
          alliance: buildAllianceDto(alliance, members)
        });
      } catch (errWrite) {
        if (attempt === ALLIANCE_WRITE_RETRIES - 1 || !isVersionConflictError(errWrite)) throw errWrite;
      }
    }
    throw new Error("Invite failed after retries.");
  } catch (err) {
    return JSON.stringify({ ok: false, error: String((err && err.message) || err || "Invite failed.") });
  }
}

function rpcAllianceRespondInvite(ctx, _logger, nk, payload) {
  try {
    var userId = requireUserId(ctx);
    var username = ctx.username || userId;
    var body = parsePayload(payload);
    var allianceId = String(body.allianceId || "").trim();
    var accept = Boolean(body.accept);
    if (!allianceId) throw new Error("Missing allianceId.");

    for (var attempt = 0; attempt < ALLIANCE_WRITE_RETRIES; attempt++) {
      var ts = nowTs();
      var inboxRead = readAllianceInbox(nk, userId);
      var inbox = inboxRead.state || defaultAllianceInbox(userId);
      cleanInboxInvites(inbox, ts);

      var inviteIndex = -1;
      for (var i = 0; i < inbox.invites.length; i++) {
        if (String(inbox.invites[i].allianceId || "") === allianceId) {
          inviteIndex = i;
          break;
        }
      }
      if (inviteIndex < 0) throw new Error("Invite not found or expired.");
      inbox.invites.splice(inviteIndex, 1);

      var playerProfileRead = readPlayerProfile(nk, userId);
      var legacyProfileRead = readAllianceProfile(nk, userId);
      var playerProfile = playerProfileRead.state || defaultPlayerProfile();
      var legacyProfile = legacyProfileRead.state || defaultAllianceProfile();
      if (String(playerProfile.allianceId || legacyProfile.allianceId || "").trim()) throw new Error("Leave current alliance first.");

      if (!accept) {
        nk.storageWrite([
          makeStorageWriteReq(ALLIANCE_INBOX_COLLECTION, ALLIANCE_INBOX_KEY, userId, inbox, inboxRead.version || "", 0, 0)
        ]);
        return JSON.stringify({ ok: true, accepted: false, invites: inbox.invites || [] });
      }

      var composite = readAllianceCompositeState(nk, allianceId);
      var alliance = composite.alliance;
      if (!alliance) throw new Error("Alliance not found.");

      var members = rebuildAllianceLeadership(alliance, composite.members, ts);
      var memberIndex = findAllianceMemberIndex(members, userId);
      if (memberIndex < 0) {
        var cap = sanitizePositiveInt(alliance.memberCap || DEFAULT_ALLIANCE_MEMBER_CAP) || DEFAULT_ALLIANCE_MEMBER_CAP;
        if (members.length >= cap) throw new Error("Alliance is full.");
        members.push({
          userId: userId,
          username: username,
          role: "MEMBER",
          joinedAt: ts
        });
      }

      cleanAllianceInvites(alliance, ts);
      alliance.invites = (alliance.invites || []).filter(function (it) { return String(it.targetUserId || "") !== userId; });

      playerProfile.allianceId = allianceId;
      playerProfile.pendingAllianceApplicationId = "";
      playerProfile.updatedAt = ts;
      legacyProfile.allianceId = allianceId;
      legacyProfile.role = "member";
      legacyProfile.joinedAt = legacyProfile.joinedAt || ts;

      appendAllianceLog(alliance, "invite_accept", username + " joined via invitation.", username, ts);
      members = rebuildAllianceLeadership(alliance, members, ts);
      var membersState = {
        allianceId: allianceId,
        members: members,
        updatedAt: ts
      };

      try {
        nk.storageWrite([
          makeStorageWriteReq(ALLIANCE_INBOX_COLLECTION, ALLIANCE_INBOX_KEY, userId, inbox, inboxRead.version || "", 0, 0),
          makeStorageWriteReq(PLAYER_PROFILE_COLLECTION, PLAYER_PROFILE_KEY, userId, playerProfile, playerProfileRead.version || "", 0, 0),
          makeStorageWriteReq(ALLIANCE_PROFILE_COLLECTION, ALLIANCE_PROFILE_KEY, userId, legacyProfile, legacyProfileRead.version || "", 0, 0),
          makeStorageWriteReq(ALLIANCE_COLLECTION, allianceId, "", alliance, composite.privateVersion || "*", 0, 0),
          makeStorageWriteReq(ALLIANCES_PUBLIC_COLLECTION, allianceId, "", buildAlliancePublicState(alliance, members), composite.publicVersion || "*", 2, 0),
          makeStorageWriteReq(ALLIANCE_MEMBERS_COLLECTION, allianceId, "", membersState, composite.membersVersion || "*", 0, 0)
        ]);
        return JSON.stringify({
          ok: true,
          accepted: true,
          inAlliance: true,
          myRole: "MEMBER",
          invites: inbox.invites || [],
          alliance: buildAllianceDto(alliance, members)
        });
      } catch (errWrite) {
        if (attempt === ALLIANCE_WRITE_RETRIES - 1 || !isVersionConflictError(errWrite)) throw errWrite;
      }
    }
    throw new Error("Respond invite failed after retries.");
  } catch (err) {
    return JSON.stringify({ ok: false, error: String((err && err.message) || err || "Respond invite failed.") });
  }
}

function rpcAllianceCreate(ctx, logger, nk, payload) {
  var userId = requireUserId(ctx);
  var username = ctx.username || userId;
  var body = parsePayload(payload);
  var now = nowTs();

  var profileRead = readAllianceProfile(nk, userId);
  var profile = profileRead.state || defaultAllianceProfile();
  if (profile.allianceId) throw new Error("Already in an alliance.");

  var allianceId = "alliance_" + now + "_" + Math.floor(Math.random() * 1000000).toString(36);
  var alliance = defaultAllianceState(allianceId, userId, username, body, now);
  writeAllianceState(nk, allianceId, alliance, "");

  profile.allianceId = allianceId;
  profile.role = "chef";
  profile.joinedAt = now;
  writeAllianceProfile(nk, userId, profile, profileRead.version);

  var economy = readEconomyState(nk, userId).state;
  syncPlayerPoints(nk, logger, userId, username, economy);

  return JSON.stringify({ ok: true, alliance: alliance, profile: profile });
}

function rpcAllianceJoin(ctx, logger, nk, payload) {
  var userId = requireUserId(ctx);
  var username = ctx.username || userId;
  var body = parsePayload(payload);
  var allianceId = String(body.allianceId || "").trim();
  if (!allianceId) throw new Error("Missing allianceId.");

  var profileRead = readAllianceProfile(nk, userId);
  var profile = profileRead.state || defaultAllianceProfile();
  if (profile.allianceId && profile.allianceId !== allianceId) throw new Error("Leave current alliance first.");

  for (var i = 0; i < ALLIANCE_WRITE_RETRIES; i++) {
    var read = readAllianceState(nk, allianceId);
    var alliance = read.state;
    if (!alliance) throw new Error("Alliance not found.");
    alliance.members = Array.isArray(alliance.members) ? alliance.members : [];

    var exists = false;
    for (var j = 0; j < alliance.members.length; j++) {
      if (alliance.members[j].userId === userId) {
        exists = true;
        profile.role = alliance.members[j].role || "member";
        break;
      }
    }

    if (!exists) {
      if (alliance.members.length >= (alliance.memberCap || DEFAULT_ALLIANCE_MEMBER_CAP)) throw new Error("Alliance is full.");
      alliance.members.push({
        userId: userId,
        username: username,
        role: "member",
        joinedAt: nowTs()
      });
      appendAllianceLog(alliance, "member_join", username + " joined alliance.", username, nowTs());
      profile.role = "member";
    }

    profile.allianceId = allianceId;
    profile.joinedAt = profile.joinedAt || nowTs();
    alliance.updatedAt = nowTs();

    try {
      writeAllianceState(nk, allianceId, alliance, read.version);
      writeAllianceProfile(nk, userId, profile, profileRead.version);
      var economy = readEconomyState(nk, userId).state;
      syncPlayerPoints(nk, logger, userId, username, economy);
      return JSON.stringify({ ok: true, alliance: alliance, profile: profile });
    } catch (err) {
      if (i === ALLIANCE_WRITE_RETRIES - 1) throw err;
    }
  }
  throw new Error("Join alliance failed.");
}

function rpcAllianceLeave(ctx, _logger, nk) {
  var userId = requireUserId(ctx);
  var username = ctx.username || userId;
  var profileRead = readAllianceProfile(nk, userId);
  var profile = profileRead.state || defaultAllianceProfile();
  if (!profile.allianceId) return JSON.stringify({ ok: true, alliance: null, profile: defaultAllianceProfile() });

  for (var i = 0; i < ALLIANCE_WRITE_RETRIES; i++) {
    var read = readAllianceState(nk, profile.allianceId);
    var alliance = read.state;
    if (!alliance) break;
    alliance.members = (alliance.members || []).filter(function (m) { return m.userId !== userId; });
    delete (alliance.cachedMemberScores || {})[userId];
    appendAllianceLog(alliance, "member_leave", username + " left alliance.", username, nowTs());

    if (alliance.members.length > 0) {
      var hasChief = false;
      for (var j = 0; j < alliance.members.length; j++) {
        if (alliance.members[j].role === "chef") hasChief = true;
      }
      if (!hasChief) alliance.members[0].role = "chef";
      alliance.updatedAt = nowTs();
      try {
        writeAllianceState(nk, alliance.id, alliance, read.version);
      } catch (errWrite) {
        if (i === ALLIANCE_WRITE_RETRIES - 1) throw errWrite;
        continue;
      }
    } else {
      nk.storageDelete([{ collection: ALLIANCE_COLLECTION, key: alliance.id }]);
    }
    break;
  }

  var emptyProfile = defaultAllianceProfile();
  writeAllianceProfile(nk, userId, emptyProfile, profileRead.version);
  return JSON.stringify({ ok: true, alliance: null, profile: emptyProfile });
}

function rpcAllianceGetState(ctx, logger, nk, payload) {
  var userId = requireUserId(ctx);
  var username = ctx.username || userId;
  var body = parsePayload(payload);
  var profileRead = readAllianceProfile(nk, userId);
  var profile = profileRead.state || defaultAllianceProfile();
  var allianceId = String(body.allianceId || profile.allianceId || "").trim();

  var economy = readEconomyState(nk, userId).state;
  var points = syncPlayerPoints(nk, logger, userId, username, economy);
  if (!allianceId) {
    return JSON.stringify({ ok: true, profile: profile, alliance: null, points: points });
  }

  var allianceRead = readAllianceState(nk, allianceId);
  var alliance = allianceRead.state;
  if (!alliance) return JSON.stringify({ ok: true, profile: profile, alliance: null, points: points });

  normalizeAllianceVotes(alliance, nowTs());
  try {
    writeAllianceState(nk, allianceId, alliance, allianceRead.version);
  } catch (_e) {
    // ignore stale write race
  }

  return JSON.stringify({
    ok: true,
    profile: profile,
    alliance: alliance,
    points: points,
    role: userAllianceRole(alliance, userId) || profile.role || "member"
  });
}

function rpcAllianceInvest(ctx, logger, nk, payload) {
  var userId = requireUserId(ctx);
  var username = ctx.username || userId;
  var body = parsePayload(payload);
  var resources = body.resources && typeof body.resources === "object" ? body.resources : {};
  var now = nowTs();

  var profileRead = readAllianceProfile(nk, userId);
  var profile = profileRead.state || defaultAllianceProfile();
  if (!profile.allianceId) throw new Error("Join an alliance first.");

  for (var attempt = 0; attempt < ALLIANCE_WRITE_RETRIES; attempt++) {
    var economyRead = readEconomyState(nk, userId);
    var economy = applyOfflineProduction(economyRead.state, now);
    var allianceRead = readAllianceState(nk, profile.allianceId);
    var alliance = allianceRead.state;
    if (!alliance) throw new Error("Alliance not found.");

    var totalContribution = 0;
    var costByResource = {};
    for (var i = 0; i < RESOURCE_IDS.length; i++) {
      var rid = RESOURCE_IDS[i];
      var amount = sanitizePositiveInt(Number(resources[rid] || 0));
      if (amount <= 0) continue;
      if (economy.resources[rid].amount < amount) throw new Error("Insufficient " + rid + ".");
      costByResource[rid] = amount;
      totalContribution += amount * (RESOURCE_POINT_WEIGHTS[rid] || 0);
    }
    if (totalContribution <= 0) throw new Error("No resources provided.");

    for (var ridPay in costByResource) {
      economy.resources[ridPay].amount -= costByResource[ridPay];
    }

    alliance.investedResources = alliance.investedResources || {};
    for (var ridInv in costByResource) {
      alliance.investedResources[ridInv] = sanitizePositiveInt(alliance.investedResources[ridInv] || 0) + costByResource[ridInv];
    }
    alliance.contributionPoints = alliance.contributionPoints || {};
    alliance.contributionPoints[userId] = sanitizePositiveInt(alliance.contributionPoints[userId] || 0) + totalContribution;
    alliance.bastionProgress = Number(alliance.bastionProgress || 0) + totalContribution / 500000;
    while (alliance.bastionProgress >= 1) {
      alliance.bastionLevel = sanitizePositiveInt(alliance.bastionLevel || 1) + 1;
      alliance.bastionProgress -= 1;
    }
    appendAllianceLog(alliance, "invest", username + " invested in bastion.", username, now);
    alliance.updatedAt = now;
    economy.version = (economy.version || 0) + 1;
    economy.lastUpdateTs = now;

    try {
      nk.storageWrite([
        {
          collection: ECONOMY_COLLECTION,
          key: ECONOMY_KEY,
          userId: userId,
          permissionRead: 0,
          permissionWrite: 0,
          value: economy,
          version: economyRead.version || undefined
        },
        {
          collection: ALLIANCE_COLLECTION,
          key: alliance.id,
          userId: "",
          permissionRead: 2,
          permissionWrite: 0,
          value: alliance,
          version: allianceRead.version || undefined
        }
      ]);
      var points = syncPlayerPoints(nk, logger, userId, username, economy);
      return JSON.stringify({ ok: true, alliance: alliance, points: points, invested: costByResource });
    } catch (errWrite) {
      if (attempt === ALLIANCE_WRITE_RETRIES - 1) throw errWrite;
    }
  }
  throw new Error("Alliance invest failed.");
}

function rpcAllianceLaunchVote(ctx, _logger, nk, payload) {
  var userId = requireUserId(ctx);
  var username = ctx.username || userId;
  var body = parsePayload(payload);
  var topic = String(body.topic || "").trim() || "war";
  var title = String(body.title || "").trim();
  var description = String(body.description || "").trim();
  if (!title) throw new Error("Missing vote title.");

  var profile = readAllianceProfile(nk, userId).state || defaultAllianceProfile();
  if (!profile.allianceId) throw new Error("Join an alliance first.");

  for (var i = 0; i < ALLIANCE_WRITE_RETRIES; i++) {
    var read = readAllianceState(nk, profile.allianceId);
    var alliance = read.state;
    if (!alliance) throw new Error("Alliance not found.");
    var role = userAllianceRole(alliance, userId);
    if (role !== "chef" && role !== "co_lead") throw new Error("Only leader/co-leaders can launch a vote.");

    normalizeAllianceVotes(alliance, nowTs());
    alliance.votes.unshift({
      id: "vote_" + nowTs() + "_" + Math.floor(Math.random() * 100000).toString(36),
      topic: topic,
      title: title.slice(0, 96),
      description: description.slice(0, 512),
      initiatedBy: username,
      startedAt: nowTs(),
      endAt: nowTs() + ALLIANCE_VOTE_DURATION_SEC,
      yesBy: [userId],
      noBy: [],
      status: "active"
    });
    appendAllianceLog(alliance, "vote_launch", username + " launched a vote: " + title, username, nowTs());
    alliance.updatedAt = nowTs();
    try {
      writeAllianceState(nk, alliance.id, alliance, read.version);
      return JSON.stringify({ ok: true, alliance: alliance });
    } catch (err) {
      if (i === ALLIANCE_WRITE_RETRIES - 1) throw err;
    }
  }
  throw new Error("Vote launch failed.");
}

function rpcAllianceCastVote(ctx, _logger, nk, payload) {
  var userId = requireUserId(ctx);
  var body = parsePayload(payload);
  var voteId = String(body.voteId || "").trim();
  var choice = String(body.choice || "").toLowerCase();
  if (!voteId) throw new Error("Missing voteId.");
  if (choice !== "yes" && choice !== "no") throw new Error("Invalid choice.");

  var profile = readAllianceProfile(nk, userId).state || defaultAllianceProfile();
  if (!profile.allianceId) throw new Error("Join an alliance first.");

  for (var i = 0; i < ALLIANCE_WRITE_RETRIES; i++) {
    var read = readAllianceState(nk, profile.allianceId);
    var alliance = read.state;
    if (!alliance) throw new Error("Alliance not found.");
    normalizeAllianceVotes(alliance, nowTs());
    var found = null;
    for (var j = 0; j < alliance.votes.length; j++) {
      if (alliance.votes[j].id === voteId) {
        found = alliance.votes[j];
        break;
      }
    }
    if (!found) throw new Error("Vote not found.");
    if (found.status !== "active") throw new Error("Vote already closed.");
    if (nowTs() >= Number(found.endAt || 0)) throw new Error("Vote already ended.");

    found.yesBy = (found.yesBy || []).filter(function (id) { return id !== userId; });
    found.noBy = (found.noBy || []).filter(function (id) { return id !== userId; });
    if (choice === "yes") found.yesBy.push(userId);
    else found.noBy.push(userId);
    alliance.updatedAt = nowTs();
    try {
      writeAllianceState(nk, alliance.id, alliance, read.version);
      return JSON.stringify({ ok: true, alliance: alliance });
    } catch (errWrite) {
      if (i === ALLIANCE_WRITE_RETRIES - 1) throw errWrite;
    }
  }
  throw new Error("Vote cast failed.");
}

var INBOX_COLLECTION = "hsg_inbox_v1";
var INBOX_META_KEY = "__meta__";
var INBOX_RATE_KEY_PREFIX = "__rate__:";
var INBOX_TYPES = ["REWARD", "COMBAT_REPORT", "SYSTEM", "PLAYER"];
var INBOX_LIST_LIMIT_DEFAULT = 20;
var INBOX_LIST_LIMIT_MAX = 50;
var INBOX_LIST_BATCH = 60;
var INBOX_LIST_SCAN_MAX = 8;
var INBOX_PLAYER_MSG_TITLE_MAX = 80;
var INBOX_PLAYER_MSG_BODY_MAX = 3000;
var INBOX_SEND_LIMIT_PER_HOUR = 30;
var INBOX_SEND_TARGET_COOLDOWN_SEC = 20;
var INBOX_SYSTEM_BROADCAST_BATCH = 500;
var INBOX_SYSTEM_BROADCAST_MAX_USERS = 100000;
var INBOX_DAILY_NOON_EXPIRY_SEC = 72 * 60 * 60;
var INBOX_DAILY_NOON_META_KIND = "DAILY_NOON_CHEST";
var INBOX_DAILY_NOON_ACCELERATOR_TABLE = [
  { itemId: "TIME_RIFT_60", weight: 50 },
  { itemId: "TIME_RIFT_300", weight: 35 },
  { itemId: "TIME_RIFT_3600", weight: 13 },
  { itemId: "TIME_RIFT_10800", weight: 1.8 },
  { itemId: "TIME_RIFT_43200", weight: 0.2 }
];
var INBOX_DAILY_NOON_CHEST_TABLE = [
  { chestType: "CLASSIC", weight: 60 },
  { chestType: "UNCOMMON", weight: 27 },
  { chestType: "RARE", weight: 10 },
  { chestType: "LEGENDARY", weight: 2.7 },
  { chestType: "DIVINE", weight: 0.3 }
];
var INBOX_DAILY_NOON_BONUS_TABLE = [
  { kind: "none", weight: 70 },
  { kind: "item", itemId: "TIME_RIFT_60", quantity: 1, weight: 15 },
  { kind: "item", itemId: "TIME_RIFT_300", quantity: 1, weight: 8 },
  { kind: "chest", chestType: "CLASSIC", quantity: 1, weight: 5 },
  { kind: "chest", chestType: "UNCOMMON", quantity: 1, weight: 1.5 },
  { kind: "item", itemId: "TIME_RIFT_3600", quantity: 1, weight: 0.4 },
  { kind: "chest", chestType: "RARE", quantity: 1, weight: 0.1 }
];
var INBOX_DAILY_NOON_STREAK_DAY7_BONUS = {
  itemId: "TIME_RIFT_10800",
  chestType: "LEGENDARY",
  itemQuantity: 1,
  chestQuantity: 1
};
var INBOX_DAILY_NOON_TEST_ALLOWED_USERS = { "heimy": true };

function defaultInboxMeta() {
  return {
    version: 1,
    updatedAt: nowTs(),
    unreadTotal: 0,
    unreadByType: {
      REWARD: 0,
      COMBAT_REPORT: 0,
      SYSTEM: 0,
      PLAYER: 0
    },
    dailyNoon: {
      lastDayKey: "",
      lastNoonTs: 0,
      streakDay: 0,
      lastMessageId: ""
    }
  };
}

function defaultInboxRate() {
  return {
    version: 1,
    windowStart: nowTs(),
    sentInWindow: 0,
    lastByTarget: {}
  };
}

function formatServerDayKey(dateObj) {
  var y = dateObj.getFullYear();
  var m = String(dateObj.getMonth() + 1).padStart(2, "0");
  var d = String(dateObj.getDate()).padStart(2, "0");
  return y + "-" + m + "-" + d;
}

function getServerNoonSchedule(serverNowTs) {
  var nowSafe = Math.max(1, sanitizePositiveInt(serverNowTs || nowTs()));
  var nowDate = new Date(nowSafe * 1000);
  var todayNoonDate = new Date(
    nowDate.getFullYear(),
    nowDate.getMonth(),
    nowDate.getDate(),
    12,
    0,
    0,
    0
  );
  var todayNoonTs = Math.floor(todayNoonDate.getTime() / 1000);
  var todayKey = formatServerDayKey(nowDate);
  var yesterdayDate = new Date(
    nowDate.getFullYear(),
    nowDate.getMonth(),
    nowDate.getDate() - 1,
    12,
    0,
    0,
    0
  );
  var yesterdayKey = formatServerDayKey(yesterdayDate);
  return {
    nowTs: nowSafe,
    todayKey: todayKey,
    yesterdayKey: yesterdayKey,
    todayNoonTs: todayNoonTs
  };
}

function buildInboxMessageId(serverNowTs) {
  var nowSafe = Math.max(1, sanitizePositiveInt(serverNowTs || nowTs()));
  var reverse = String(9999999999 - nowSafe).padStart(10, "0");
  var rand = Math.floor(Math.random() * 1679616).toString(36).padStart(4, "0");
  return reverse + "_" + nowSafe + "_" + rand;
}

function normalizeInboxAttachments(attachments) {
  var out = {
    resources: {},
    items: [],
    credits: 0,
    chests: []
  };
  if (!attachments || typeof attachments !== "object") return out;

  var resources = attachments.resources && typeof attachments.resources === "object" ? attachments.resources : {};
  for (var i = 0; i < RESOURCE_IDS.length; i++) {
    var rid = RESOURCE_IDS[i];
    var amount = Math.max(0, Math.floor(Number(resources[rid] || 0)));
    if (amount > 0) out.resources[rid] = amount;
  }

  var credits = Math.max(0, Math.floor(Number(attachments.credits || 0)));
  out.credits = credits;

  var items = Array.isArray(attachments.items) ? attachments.items : [];
  for (var j = 0; j < items.length; j++) {
    var it = items[j];
    var itemId = String(it && it.itemId ? it.itemId : "").trim();
    var qty = Math.max(0, Math.floor(Number(it && it.quantity ? it.quantity : 0)));
    if (!itemId || qty <= 0 || !ITEM_DEFINITIONS[itemId]) continue;
    out.items.push({ itemId: itemId, quantity: qty });
  }

  var chests = Array.isArray(attachments.chests) ? attachments.chests : [];
  for (var k = 0; k < chests.length; k++) {
    var c = chests[k];
    var chestType = String(c && c.chestType ? c.chestType : "").trim().toUpperCase();
    var cQty = Math.max(0, Math.floor(Number(c && c.quantity ? c.quantity : 0)));
    if (!chestType || cQty <= 0) continue;
    if (!RESOURCE_CHEST_CONFIGS[chestType]) continue;
    out.chests.push({ chestType: chestType, quantity: cQty });
  }

  return out;
}

function normalizeInboxMessageMeta(metaRaw) {
  if (!metaRaw || typeof metaRaw !== "object") return {};
  var kind = String(metaRaw.kind || "").trim().toUpperCase();
  if (kind !== INBOX_DAILY_NOON_META_KIND) return {};
  return {
    kind: INBOX_DAILY_NOON_META_KIND,
    dayKey: String(metaRaw.dayKey || "").trim(),
    noonTs: sanitizePositiveInt(metaRaw.noonTs || 0),
    streakDay: Math.max(1, Math.min(7, sanitizePositiveInt(metaRaw.streakDay || 1))),
    rewardGenerated: Boolean(metaRaw.rewardGenerated),
    openedAt: sanitizePositiveInt(metaRaw.openedAt || 0)
  };
}

function isDailyNoonChestMessage(msg) {
  return Boolean(
    msg &&
      msg.meta &&
      typeof msg.meta === "object" &&
      String(msg.meta.kind || "").toUpperCase() === INBOX_DAILY_NOON_META_KIND
  );
}

function inboxMessageHasClaimable(msg) {
  if (!msg || typeof msg !== "object") return false;
  if (inboxHasClaimable(msg.attachments)) return true;
  if (isDailyNoonChestMessage(msg) && sanitizePositiveInt(msg.claimedAt || 0) <= 0) return true;
  return false;
}

function buildDailyNoonRewardPack(streakDay) {
  var day = Math.max(1, Math.min(7, sanitizePositiveInt(streakDay || 1)));
  var attachments = {
    resources: {},
    items: [],
    credits: 0,
    chests: []
  };

  var accel = pickByWeight(INBOX_DAILY_NOON_ACCELERATOR_TABLE);
  if (accel && accel.itemId && ITEM_DEFINITIONS[accel.itemId]) {
    attachments.items.push({ itemId: accel.itemId, quantity: 1 });
  }

  var chest = pickByWeight(INBOX_DAILY_NOON_CHEST_TABLE);
  if (chest && chest.chestType && RESOURCE_CHEST_CONFIGS[chest.chestType]) {
    attachments.chests.push({ chestType: chest.chestType, quantity: 1 });
  }

  var bonus = pickByWeight(INBOX_DAILY_NOON_BONUS_TABLE);
  if (bonus && bonus.kind === "item" && bonus.itemId && ITEM_DEFINITIONS[bonus.itemId]) {
    attachments.items.push({
      itemId: bonus.itemId,
      quantity: Math.max(1, sanitizePositiveInt(bonus.quantity || 1))
    });
  } else if (bonus && bonus.kind === "chest" && bonus.chestType && RESOURCE_CHEST_CONFIGS[bonus.chestType]) {
    attachments.chests.push({
      chestType: bonus.chestType,
      quantity: Math.max(1, sanitizePositiveInt(bonus.quantity || 1))
    });
  }

  // Weekly fidelity milestone.
  if (day === 7) {
    if (INBOX_DAILY_NOON_STREAK_DAY7_BONUS.itemId && ITEM_DEFINITIONS[INBOX_DAILY_NOON_STREAK_DAY7_BONUS.itemId]) {
      attachments.items.push({
        itemId: INBOX_DAILY_NOON_STREAK_DAY7_BONUS.itemId,
        quantity: Math.max(1, sanitizePositiveInt(INBOX_DAILY_NOON_STREAK_DAY7_BONUS.itemQuantity || 1))
      });
    }
    if (INBOX_DAILY_NOON_STREAK_DAY7_BONUS.chestType && RESOURCE_CHEST_CONFIGS[INBOX_DAILY_NOON_STREAK_DAY7_BONUS.chestType]) {
      attachments.chests.push({
        chestType: INBOX_DAILY_NOON_STREAK_DAY7_BONUS.chestType,
        quantity: Math.max(1, sanitizePositiveInt(INBOX_DAILY_NOON_STREAK_DAY7_BONUS.chestQuantity || 1))
      });
    }
  }

  return normalizeInboxAttachments(attachments);
}

function inboxHasClaimable(attachments) {
  if (!attachments || typeof attachments !== "object") return false;
  if (Number(attachments.credits || 0) > 0) return true;
  var resources = attachments.resources && typeof attachments.resources === "object" ? attachments.resources : {};
  for (var i = 0; i < RESOURCE_IDS.length; i++) {
    if (Number(resources[RESOURCE_IDS[i]] || 0) > 0) return true;
  }
  var items = Array.isArray(attachments.items) ? attachments.items : [];
  for (var j = 0; j < items.length; j++) {
    if (Number(items[j] && items[j].quantity ? items[j].quantity : 0) > 0) return true;
  }
  var chests = Array.isArray(attachments.chests) ? attachments.chests : [];
  for (var k = 0; k < chests.length; k++) {
    if (Number(chests[k] && chests[k].quantity ? chests[k].quantity : 0) > 0) return true;
  }
  return false;
}

function normalizeInboxMessage(raw, key, userId) {
  var value = raw && typeof raw === "object" ? raw : {};
  var typeRaw = String(value.type || "SYSTEM").toUpperCase();
  var type = INBOX_TYPES.indexOf(typeRaw) >= 0 ? typeRaw : "SYSTEM";
  var attachments = normalizeInboxAttachments(value.attachments);
  var meta = normalizeInboxMessageMeta(value.meta);
  var fromUserId = String(value.fromUserId || "");
  var fromUsername = String(value.fromUsername || "");
  var toUserId = String(value.toUserId || "");
  var toUsername = String(value.toUsername || "");
  var directionRaw = String(value.direction || "").toUpperCase();
  var direction = directionRaw === "OUT" || directionRaw === "IN" ? directionRaw : (fromUserId && fromUserId === userId ? "OUT" : "IN");
  var peerUserId = String(value.peerUserId || (direction === "OUT" ? toUserId : fromUserId) || "");
  var peerUsername = String(value.peerUsername || (direction === "OUT" ? toUsername : fromUsername) || "");
  return {
    id: key || String(value.id || ""),
    userId: userId,
    type: type,
    title: String(value.title || "").slice(0, 140),
    body: String(value.body || "").slice(0, 8000),
    fromUserId: fromUserId,
    fromUsername: fromUsername,
    toUserId: toUserId,
    toUsername: toUsername,
    direction: direction,
    peerUserId: peerUserId,
    peerUsername: peerUsername,
    createdAt: Math.max(0, Math.floor(Number(value.createdAt || nowTs()))),
    expiresAt: Math.max(0, Math.floor(Number(value.expiresAt || 0))),
    readAt: Math.max(0, Math.floor(Number(value.readAt || 0))),
    deletedAt: Math.max(0, Math.floor(Number(value.deletedAt || 0))),
    expiredAt: Math.max(0, Math.floor(Number(value.expiredAt || 0))),
    claimedAt: Math.max(0, Math.floor(Number(value.claimedAt || 0))),
    claimTxId: String(value.claimTxId || ""),
    combatReport: value.combatReport && typeof value.combatReport === "object" ? value.combatReport : null,
    attachments: attachments,
    meta: meta
  };
}

function inboxMessageToClient(msg) {
  return {
    id: msg.id,
    type: msg.type,
    title: msg.title,
    body: msg.body,
    fromUserId: msg.fromUserId,
    fromUsername: msg.fromUsername,
    toUserId: msg.toUserId || "",
    toUsername: msg.toUsername || "",
    direction: msg.direction || (msg.fromUserId === msg.userId ? "OUT" : "IN"),
    peerUserId: msg.peerUserId || "",
    peerUsername: msg.peerUsername || "",
    createdAt: msg.createdAt,
    expiresAt: msg.expiresAt,
    read: Number(msg.readAt || 0) > 0,
    readAt: msg.readAt || 0,
    deleted: Number(msg.deletedAt || 0) > 0,
    expired: Number(msg.expiredAt || 0) > 0,
    claimed: Number(msg.claimedAt || 0) > 0,
    claimedAt: msg.claimedAt || 0,
    hasAttachments: inboxMessageHasClaimable(msg),
    attachments: msg.attachments,
    combatReport: msg.combatReport,
    meta: msg.meta && typeof msg.meta === "object" ? msg.meta : {}
  };
}

function parseInboxTypeFilter(typeRaw) {
  var t = String(typeRaw || "").trim().toUpperCase();
  if (!t || t === "ALL") return "";
  return INBOX_TYPES.indexOf(t) >= 0 ? t : "";
}

function inboxTypeMatches(msg, typeFilter) {
  if (!typeFilter) return true;
  return String(msg.type || "") === typeFilter;
}

function readInboxMeta(nk, userId) {
  var read = nk.storageRead([{ collection: INBOX_COLLECTION, key: INBOX_META_KEY, userId: userId }]);
  if (!read || read.length === 0) return { state: defaultInboxMeta(), version: "" };
  var raw = read[0].value && typeof read[0].value === "object" ? read[0].value : {};
  var base = defaultInboxMeta();
  for (var i = 0; i < INBOX_TYPES.length; i++) {
    var tp = INBOX_TYPES[i];
    base.unreadByType[tp] = Math.max(0, Math.floor(Number((raw.unreadByType || {})[tp] || 0)));
  }
  base.unreadTotal = Math.max(0, Math.floor(Number(raw.unreadTotal || 0)));
  base.updatedAt = Math.max(0, Math.floor(Number(raw.updatedAt || nowTs())));
  base.version = Math.max(1, Math.floor(Number(raw.version || 1)));
  var dailyNoonRaw = raw.dailyNoon && typeof raw.dailyNoon === "object" ? raw.dailyNoon : {};
  base.dailyNoon = {
    lastDayKey: String(dailyNoonRaw.lastDayKey || ""),
    lastNoonTs: sanitizePositiveInt(dailyNoonRaw.lastNoonTs || 0),
    streakDay: Math.max(0, Math.min(7, sanitizePositiveInt(dailyNoonRaw.streakDay || 0))),
    lastMessageId: String(dailyNoonRaw.lastMessageId || "")
  };
  return { state: base, version: read[0].version || "" };
}

function incrementUnread(meta, type, by) {
  var delta = Math.max(0, Math.floor(Number(by || 0)));
  if (delta <= 0) return;
  var t = INBOX_TYPES.indexOf(type) >= 0 ? type : "SYSTEM";
  meta.unreadTotal = Math.max(0, Math.floor(Number(meta.unreadTotal || 0)) + delta);
  meta.unreadByType[t] = Math.max(0, Math.floor(Number(meta.unreadByType[t] || 0)) + delta);
  meta.updatedAt = nowTs();
}

function decrementUnread(meta, type, by) {
  var delta = Math.max(0, Math.floor(Number(by || 0)));
  if (delta <= 0) return;
  var t = INBOX_TYPES.indexOf(type) >= 0 ? type : "SYSTEM";
  meta.unreadTotal = Math.max(0, Math.floor(Number(meta.unreadTotal || 0)) - delta);
  meta.unreadByType[t] = Math.max(0, Math.floor(Number(meta.unreadByType[t] || 0)) - delta);
  meta.updatedAt = nowTs();
}

function chestTypeToItemId(chestType) {
  var t = String(chestType || "").toUpperCase();
  if (t === "CLASSIC") return "RESOURCE_CHEST_CLASSIC";
  if (t === "UNCOMMON") return "RESOURCE_CHEST_UNCOMMON";
  if (t === "RARE") return "RESOURCE_CHEST_RARE";
  if (t === "LEGENDARY") return "RESOURCE_CHEST_LEGENDARY";
  if (t === "DIVINE") return "RESOURCE_CHEST_DIVINE";
  return "";
}

function ensureEconomyForClaim(raw) {
  var state = raw && typeof raw === "object" ? raw : defaultEconomyState();
  if (!state.resources || typeof state.resources !== "object") state.resources = {};
  for (var i = 0; i < RESOURCE_IDS.length; i++) {
    var rid = RESOURCE_IDS[i];
    var cur = state.resources[rid];
    var amount = cur && typeof cur === "object" ? Number(cur.amount || 0) : 0;
    state.resources[rid] = { amount: Number.isFinite(amount) && amount > 0 ? amount : 0 };
  }
  state.premiumCredits = Math.max(0, Math.floor(Number(state.premiumCredits || 0)));
  state.version = Math.max(1, Math.floor(Number(state.version || 1)));
  state.lastUpdateTs = Math.max(0, Math.floor(Number(state.lastUpdateTs || nowTs())));
  return state;
}

function ensureInventoryForClaim(raw, userId) {
  var inv = raw && typeof raw === "object" ? raw : defaultInventoryState(userId);
  if (!Array.isArray(inv.items)) inv.items = [];
  inv.playerId = String(inv.playerId || userId);
  inv.mapDropNotifications = sanitizePositiveInt(inv.mapDropNotifications || 0);
  inv.version = Math.max(1, Math.floor(Number(inv.version || 1)));
  inv.updatedAt = Math.max(0, Math.floor(Number(inv.updatedAt || nowTs())));
  return inv;
}

function createInboxMessageForUser(nk, userId, data) {
  for (var attempt = 0; attempt < ECONOMY_WRITE_RETRIES; attempt++) {
    var now = nowTs();
    var metaRead = readInboxMeta(nk, userId);
    var meta = metaRead.state;
    var messageId = buildInboxMessageId(now);
    var message = normalizeInboxMessage({
      id: messageId,
      type: data.type,
      title: data.title,
      body: data.body,
      fromUserId: data.fromUserId || "",
      fromUsername: data.fromUsername || "",
      createdAt: now,
      expiresAt: Math.max(0, Math.floor(Number(data.expiresAt || 0))),
      attachments: data.attachments || {},
      meta: data.meta || {},
      combatReport: data.combatReport || null,
      readAt: 0,
      deletedAt: 0,
      expiredAt: 0,
      claimedAt: 0,
      claimTxId: ""
    }, messageId, userId);

    incrementUnread(meta, message.type, 1);
    meta.version = Math.max(1, Math.floor(Number(meta.version || 1))) + 1;

    var writes = [
      {
        collection: INBOX_COLLECTION,
        key: messageId,
        userId: userId,
        permissionRead: 0,
        permissionWrite: 0,
        value: message
      },
      {
        collection: INBOX_COLLECTION,
        key: INBOX_META_KEY,
        userId: userId,
        permissionRead: 0,
        permissionWrite: 0,
        value: meta
      }
    ];
    if (metaRead.version) writes[1].version = metaRead.version;

    try {
      nk.storageWrite(writes);
      return message;
    } catch (err) {
      if (attempt === ECONOMY_WRITE_RETRIES - 1) throw err;
    }
  }
  throw new Error("Inbox create failed.");
}

function createRewardMessage(nk, userId, attachments, title, body) {
  var safeTitle = String(title || "Recompense").trim().slice(0, 140) || "Recompense";
  var safeBody = String(body || "").trim().slice(0, 8000);
  return createInboxMessageForUser(nk, userId, {
    type: "REWARD",
    title: safeTitle,
    body: safeBody,
    attachments: normalizeInboxAttachments(attachments || {}),
    expiresAt: nowTs() + 60 * 60 * 24 * 60
  });
}

function createCombatReportMessage(nk, userId, reportData) {
  var data = reportData && typeof reportData === "object" ? reportData : {};
  var title = String(data.title || "Rapport de combat").slice(0, 140);
  var body = String(data.summary || data.body || "").slice(0, 8000);
  return createInboxMessageForUser(nk, userId, {
    type: "COMBAT_REPORT",
    title: title,
    body: body,
    attachments: normalizeInboxAttachments(data.attachments || {}),
    combatReport: {
      attacker: data.attacker || null,
      defender: data.defender || null,
      result: data.result || "unknown",
      loot: data.loot || {},
      losses: data.losses || {},
      battleAt: Math.max(0, Math.floor(Number(data.battleAt || nowTs())))
    },
    expiresAt: nowTs() + 60 * 60 * 24 * 30
  });
}

function listAllUserIdsForInboxBroadcast(nk) {
  if (!nk || typeof nk.sqlQuery !== "function") {
    throw new Error("Broadcast system message requires sqlQuery support.");
  }
  var ids = [];
  var offset = 0;
  var batch = Math.max(50, Math.min(1000, INBOX_SYSTEM_BROADCAST_BATCH));
  var hardCap = Math.max(batch, INBOX_SYSTEM_BROADCAST_MAX_USERS);

  while (ids.length < hardCap) {
    var query = "SELECT id FROM users ORDER BY id LIMIT " + batch + " OFFSET " + offset;
    var rows = nk.sqlQuery(query) || [];
    if (!Array.isArray(rows) || rows.length === 0) break;

    for (var i = 0; i < rows.length; i++) {
      var id = String((rows[i] && rows[i].id) || "").trim();
      if (!id) continue;
      ids.push(id);
      if (ids.length >= hardCap) break;
    }

    if (rows.length < batch) break;
    offset += batch;
  }

  return ids;
}

function createSystemMessage(nk, userIdOrBroadcast, title, body) {
  var safeTitle = String(title || "Annonce systeme").trim().slice(0, 140) || "Annonce systeme";
  var safeBody = String(body || "").trim().slice(0, 8000);
  if (String(userIdOrBroadcast || "").toLowerCase() === "broadcast") {
    var userIds = listAllUserIdsForInboxBroadcast(nk);
    var created = 0;
    var failed = 0;
    var lastId = "";
    for (var i = 0; i < userIds.length; i++) {
      try {
        var message = createInboxMessageForUser(nk, userIds[i], {
          type: "SYSTEM",
          title: safeTitle,
          body: safeBody,
          attachments: {},
          expiresAt: nowTs() + 60 * 60 * 24 * 30
        });
        lastId = message.id;
        created += 1;
      } catch (_) {
        failed += 1;
      }
    }
    return {
      id: lastId || buildInboxMessageId(nowTs()),
      type: "SYSTEM",
      title: safeTitle,
      body: safeBody,
      createdAt: nowTs(),
      stats: { attempted: userIds.length, delivered: created, failed: failed }
    };
  }
  return createInboxMessageForUser(nk, String(userIdOrBroadcast || ""), {
    type: "SYSTEM",
    title: safeTitle,
    body: safeBody,
    attachments: {},
    expiresAt: nowTs() + 60 * 60 * 24 * 30
  });
}

function ensureDailyNoonRewardMessage(nk, userId) {
  for (var attempt = 0; attempt < ECONOMY_WRITE_RETRIES; attempt++) {
    var schedule = getServerNoonSchedule(nowTs());
    if (schedule.nowTs < schedule.todayNoonTs) return null;

    var metaRead = readInboxMeta(nk, userId);
    var meta = metaRead.state || defaultInboxMeta();
    if (!meta.dailyNoon || typeof meta.dailyNoon !== "object") {
      meta.dailyNoon = {
        lastDayKey: "",
        lastNoonTs: 0,
        streakDay: 0,
        lastMessageId: ""
      };
    }

    if (String(meta.dailyNoon.lastDayKey || "") === schedule.todayKey) return null;

    var previous = String(meta.dailyNoon.lastDayKey || "");
    var streak = previous === schedule.yesterdayKey
      ? Math.max(1, Math.min(7, sanitizePositiveInt(meta.dailyNoon.streakDay || 0) + 1))
      : 1;

    var messageId = buildInboxMessageId(schedule.todayNoonTs);
    var message = normalizeInboxMessage({
      id: messageId,
      type: "REWARD",
      title: "Recompense quotidienne",
      body:
        "Coffre Quotidien de Midi.\nOuvrez ce coffre pour recevoir des objets de progression.",
      createdAt: schedule.todayNoonTs,
      expiresAt: schedule.todayNoonTs + INBOX_DAILY_NOON_EXPIRY_SEC,
      attachments: {},
      meta: {
        kind: INBOX_DAILY_NOON_META_KIND,
        dayKey: schedule.todayKey,
        noonTs: schedule.todayNoonTs,
        streakDay: streak,
        rewardGenerated: false,
        openedAt: 0
      },
      readAt: 0,
      deletedAt: 0,
      expiredAt: 0,
      claimedAt: 0,
      claimTxId: ""
    }, messageId, userId);

    incrementUnread(meta, "REWARD", 1);
    meta.dailyNoon.lastDayKey = schedule.todayKey;
    meta.dailyNoon.lastNoonTs = schedule.todayNoonTs;
    meta.dailyNoon.streakDay = streak;
    meta.dailyNoon.lastMessageId = messageId;
    meta.version = Math.max(1, Math.floor(Number(meta.version || 1))) + 1;

    var writes = [
      {
        collection: INBOX_COLLECTION,
        key: messageId,
        userId: userId,
        permissionRead: 0,
        permissionWrite: 0,
        value: message
      },
      {
        collection: INBOX_COLLECTION,
        key: INBOX_META_KEY,
        userId: userId,
        permissionRead: 0,
        permissionWrite: 0,
        value: meta
      }
    ];
    if (metaRead.version) writes[1].version = metaRead.version;

    try {
      nk.storageWrite(writes);
      return message;
    } catch (err) {
      if (attempt === ECONOMY_WRITE_RETRIES - 1) throw err;
    }
  }
  return null;
}

function rpcInboxList(ctx, _logger, nk, payload) {
  var userId = requireUserId(ctx);
  ensureDailyNoonRewardMessage(nk, userId);
  var body = parsePayload(payload);
  var typeFilter = parseInboxTypeFilter(body.type);
  var limit = Math.max(1, Math.min(INBOX_LIST_LIMIT_MAX, sanitizePositiveInt(body.limit || INBOX_LIST_LIMIT_DEFAULT)));
  var cursor = String(body.cursor || "");
  var nextCursor = cursor;
  var items = [];
  var toExpire = [];
  var now = nowTs();

  for (var scan = 0; scan < INBOX_LIST_SCAN_MAX && items.length < limit; scan++) {
    var page = nk.storageList(userId, INBOX_COLLECTION, INBOX_LIST_BATCH, nextCursor);
    var objects = page && Array.isArray(page.objects) ? page.objects : [];
    nextCursor = page && page.cursor ? page.cursor : "";
    if (objects.length === 0) break;

    for (var i = 0; i < objects.length; i++) {
      var obj = objects[i];
      if (!obj || !obj.key) continue;
      if (obj.key === INBOX_META_KEY || String(obj.key).indexOf(INBOX_RATE_KEY_PREFIX) === 0) continue;
      var msg = normalizeInboxMessage(obj.value, obj.key, userId);
      if (msg.deletedAt > 0 || msg.expiredAt > 0) continue;
      if (msg.expiresAt > 0 && now >= msg.expiresAt) {
        toExpire.push(msg.id);
        continue;
      }
      if (!inboxTypeMatches(msg, typeFilter)) continue;
      items.push(inboxMessageToClient(msg));
      if (items.length >= limit) break;
    }

    if (!nextCursor) break;
  }

  if (toExpire.length > 0) {
    try {
      rpcInboxDelete(ctx, _logger, nk, JSON.stringify({ messageIds: toExpire, _expireOnly: true }));
    } catch (_) {
      // noop
    }
  }

  var meta = readInboxMeta(nk, userId).state;
  return JSON.stringify({
    ok: true,
    items: items,
    nextCursor: nextCursor || "",
    unread: {
      total: Math.max(0, Math.floor(Number(meta.unreadTotal || 0))),
      byType: meta.unreadByType
    }
  });
}

function rpcInboxRead(ctx, _logger, nk, payload) {
  var userId = requireUserId(ctx);
  ensureDailyNoonRewardMessage(nk, userId);
  var body = parsePayload(payload);
  var messageId = String(body.messageId || "").trim();
  if (!messageId) throw new Error("Missing messageId.");

  for (var attempt = 0; attempt < ECONOMY_WRITE_RETRIES; attempt++) {
    var read = nk.storageRead([
      { collection: INBOX_COLLECTION, key: messageId, userId: userId },
      { collection: INBOX_COLLECTION, key: INBOX_META_KEY, userId: userId }
    ]);
    var msgObj = null;
    var metaObj = null;
    for (var i = 0; i < (read || []).length; i++) {
      var row = read[i];
      if (row.key === messageId) msgObj = row;
      else if (row.key === INBOX_META_KEY) metaObj = row;
    }
    if (!msgObj) throw new Error("Message not found.");
    var msg = normalizeInboxMessage(msgObj.value, messageId, userId);
    var meta = metaObj ? readInboxMeta(nk, userId).state : defaultInboxMeta();
    if (msg.deletedAt > 0 || msg.expiredAt > 0) throw new Error("Message is not available.");

    if (msg.readAt > 0) {
      return JSON.stringify({ ok: true, message: inboxMessageToClient(msg), alreadyRead: true });
    }

    msg.readAt = nowTs();
    decrementUnread(meta, msg.type, 1);
    meta.version = Math.max(1, Math.floor(Number(meta.version || 1))) + 1;

    var writes = [
      {
        collection: INBOX_COLLECTION,
        key: messageId,
        userId: userId,
        permissionRead: 0,
        permissionWrite: 0,
        value: msg,
        version: msgObj.version || undefined
      },
      {
        collection: INBOX_COLLECTION,
        key: INBOX_META_KEY,
        userId: userId,
        permissionRead: 0,
        permissionWrite: 0,
        value: meta
      }
    ];
    if (metaObj && metaObj.version) writes[1].version = metaObj.version;
    try {
      nk.storageWrite(writes);
      return JSON.stringify({ ok: true, message: inboxMessageToClient(msg), alreadyRead: false });
    } catch (err) {
      if (attempt === ECONOMY_WRITE_RETRIES - 1) throw err;
    }
  }
  throw new Error("Inbox read failed.");
}

function rpcInboxDelete(ctx, _logger, nk, payload) {
  var userId = requireUserId(ctx);
  var body = parsePayload(payload);
  var idsRaw = Array.isArray(body.messageIds) ? body.messageIds : [];
  var expireOnly = body._expireOnly === true;
  var ids = [];
  var seen = {};
  for (var i = 0; i < idsRaw.length; i++) {
    var id = String(idsRaw[i] || "").trim();
    if (!id || seen[id]) continue;
    seen[id] = true;
    ids.push(id);
  }
  if (ids.length === 0) throw new Error("Missing messageIds.");
  if (ids.length > 100) throw new Error("Too many messageIds.");

  var deleted = [];
  for (var idx = 0; idx < ids.length; idx++) {
    var messageId = ids[idx];
    for (var attempt = 0; attempt < ECONOMY_WRITE_RETRIES; attempt++) {
      var read = nk.storageRead([
        { collection: INBOX_COLLECTION, key: messageId, userId: userId },
        { collection: INBOX_COLLECTION, key: INBOX_META_KEY, userId: userId }
      ]);
      var msgObj = null;
      var metaObj = null;
      for (var j = 0; j < (read || []).length; j++) {
        var row = read[j];
        if (row.key === messageId) msgObj = row;
        else if (row.key === INBOX_META_KEY) metaObj = row;
      }
      if (!msgObj) break;
      var msg = normalizeInboxMessage(msgObj.value, messageId, userId);
      if (msg.deletedAt > 0 || msg.expiredAt > 0) {
        deleted.push(messageId);
        break;
      }
      var meta = metaObj ? readInboxMeta(nk, userId).state : defaultInboxMeta();
      if (msg.readAt <= 0) decrementUnread(meta, msg.type, 1);
      if (expireOnly) msg.expiredAt = nowTs();
      msg.deletedAt = nowTs();
      meta.version = Math.max(1, Math.floor(Number(meta.version || 1))) + 1;

      var writes = [
        {
          collection: INBOX_COLLECTION,
          key: messageId,
          userId: userId,
          permissionRead: 0,
          permissionWrite: 0,
          value: msg,
          version: msgObj.version || undefined
        },
        {
          collection: INBOX_COLLECTION,
          key: INBOX_META_KEY,
          userId: userId,
          permissionRead: 0,
          permissionWrite: 0,
          value: meta
        }
      ];
      if (metaObj && metaObj.version) writes[1].version = metaObj.version;

      try {
        nk.storageWrite(writes);
        deleted.push(messageId);
        break;
      } catch (err) {
        if (attempt === ECONOMY_WRITE_RETRIES - 1) throw err;
      }
    }
  }

  var metaFinal = readInboxMeta(nk, userId).state;
  return JSON.stringify({
    ok: true,
    deleted: deleted,
    unread: { total: metaFinal.unreadTotal, byType: metaFinal.unreadByType }
  });
}

function rpcInboxClaim(ctx, _logger, nk, payload) {
  var userId = requireUserId(ctx);
  ensureDailyNoonRewardMessage(nk, userId);
  var body = parsePayload(payload);
  var messageId = String(body.messageId || "").trim();
  if (!messageId) throw new Error("Missing messageId.");

  for (var attempt = 0; attempt < ECONOMY_WRITE_RETRIES; attempt++) {
    var read = nk.storageRead([
      { collection: INBOX_COLLECTION, key: messageId, userId: userId },
      { collection: INBOX_COLLECTION, key: INBOX_META_KEY, userId: userId },
      { collection: ECONOMY_COLLECTION, key: ECONOMY_KEY, userId: userId },
      { collection: INVENTORY_COLLECTION, key: INVENTORY_KEY, userId: userId }
    ]);

    var msgObj = null;
    var metaObj = null;
    var economyObj = null;
    var inventoryObj = null;
    for (var i = 0; i < (read || []).length; i++) {
      var row = read[i];
      if (row.collection === INBOX_COLLECTION && row.key === messageId) msgObj = row;
      else if (row.collection === INBOX_COLLECTION && row.key === INBOX_META_KEY) metaObj = row;
      else if (row.collection === ECONOMY_COLLECTION && row.key === ECONOMY_KEY) economyObj = row;
      else if (row.collection === INVENTORY_COLLECTION && row.key === INVENTORY_KEY) inventoryObj = row;
    }

    if (!msgObj) throw new Error("Message not found.");
    var msg = normalizeInboxMessage(msgObj.value, messageId, userId);
    if (msg.deletedAt > 0 || msg.expiredAt > 0) throw new Error("Message is not available.");
    if (msg.expiresAt > 0 && nowTs() >= msg.expiresAt) throw new Error("Message expired.");

    if (msg.claimedAt > 0) {
      return JSON.stringify({
        ok: true,
        alreadyClaimed: true,
        message: inboxMessageToClient(msg)
      });
    }

    if (isDailyNoonChestMessage(msg)) {
      var chestMeta = msg.meta && typeof msg.meta === "object" ? msg.meta : {};
      if (!inboxHasClaimable(msg.attachments)) {
        msg.attachments = buildDailyNoonRewardPack(chestMeta.streakDay || 1);
      }
      chestMeta.rewardGenerated = true;
      chestMeta.openedAt = nowTs();
      msg.meta = normalizeInboxMessageMeta(chestMeta);
    }

    if (!inboxHasClaimable(msg.attachments)) throw new Error("No claimable attachments.");

    var meta = metaObj ? readInboxMeta(nk, userId).state : defaultInboxMeta();
    var economy = ensureEconomyForClaim(economyObj && economyObj.value ? economyObj.value : null);
    var inventory = ensureInventoryForClaim(inventoryObj && inventoryObj.value ? inventoryObj.value : null, userId);

    var rewards = {
      resources: {},
      items: [],
      credits: 0,
      chests: []
    };
    var resources = msg.attachments.resources || {};
    for (var r = 0; r < RESOURCE_IDS.length; r++) {
      var rid = RESOURCE_IDS[r];
      var amount = Math.max(0, Math.floor(Number(resources[rid] || 0)));
      if (amount <= 0) continue;
      economy.resources[rid].amount += amount;
      rewards.resources[rid] = amount;
    }
    var credits = Math.max(0, Math.floor(Number(msg.attachments.credits || 0)));
    if (credits > 0) {
      economy.premiumCredits = Math.max(0, Math.floor(Number(economy.premiumCredits || 0)) + credits);
      rewards.credits = credits;
    }
    var items = Array.isArray(msg.attachments.items) ? msg.attachments.items : [];
    for (var it = 0; it < items.length; it++) {
      var itemId = String(items[it].itemId || "").trim();
      var qty = Math.max(0, Math.floor(Number(items[it].quantity || 0)));
      if (!itemId || qty <= 0 || !ITEM_DEFINITIONS[itemId]) continue;
      addItemToInventory(inventory, itemId, qty);
      rewards.items.push({ itemId: itemId, quantity: qty });
    }
    var chests = Array.isArray(msg.attachments.chests) ? msg.attachments.chests : [];
    for (var c = 0; c < chests.length; c++) {
      var chestType = String(chests[c].chestType || "").toUpperCase();
      var cQty = Math.max(0, Math.floor(Number(chests[c].quantity || 0)));
      if (cQty <= 0) continue;
      var chestItemId = chestTypeToItemId(chestType);
      if (!chestItemId || !ITEM_DEFINITIONS[chestItemId]) continue;
      addItemToInventory(inventory, chestItemId, cQty);
      rewards.chests.push({ chestType: chestType, quantity: cQty });
    }

    if (msg.readAt <= 0) {
      msg.readAt = nowTs();
      decrementUnread(meta, msg.type, 1);
    }
    msg.claimedAt = nowTs();
    msg.claimTxId = "claim_" + nowTs() + "_" + Math.floor(Math.random() * 100000).toString(36);

    economy.version = Math.max(1, Math.floor(Number(economy.version || 1))) + 1;
    economy.lastUpdateTs = nowTs();
    inventory.version = Math.max(1, Math.floor(Number(inventory.version || 1))) + 1;
    inventory.updatedAt = nowTs();
    meta.version = Math.max(1, Math.floor(Number(meta.version || 1))) + 1;

    var writes = [
      {
        collection: INBOX_COLLECTION,
        key: messageId,
        userId: userId,
        permissionRead: 0,
        permissionWrite: 0,
        value: msg,
        version: msgObj.version || undefined
      },
      {
        collection: INBOX_COLLECTION,
        key: INBOX_META_KEY,
        userId: userId,
        permissionRead: 0,
        permissionWrite: 0,
        value: meta
      },
      {
        collection: ECONOMY_COLLECTION,
        key: ECONOMY_KEY,
        userId: userId,
        permissionRead: 0,
        permissionWrite: 0,
        value: economy
      },
      {
        collection: INVENTORY_COLLECTION,
        key: INVENTORY_KEY,
        userId: userId,
        permissionRead: 0,
        permissionWrite: 0,
        value: inventory
      }
    ];
    if (metaObj && metaObj.version) writes[1].version = metaObj.version;
    if (economyObj && economyObj.version) writes[2].version = economyObj.version;
    if (inventoryObj && inventoryObj.version) writes[3].version = inventoryObj.version;

    try {
      nk.storageWrite(writes);
      return JSON.stringify({
        ok: true,
        alreadyClaimed: false,
        message: inboxMessageToClient(msg),
        rewards: rewards,
        state: {
          resources: serializeResourceAmounts(economy),
          credits: Math.max(0, Math.floor(Number(economy.premiumCredits || 0)))
        },
        unread: {
          total: meta.unreadTotal,
          byType: meta.unreadByType
        }
      });
    } catch (errWrite) {
      if (attempt === ECONOMY_WRITE_RETRIES - 1) throw errWrite;
    }
  }
  throw new Error("Inbox claim failed.");
}

function isUuidLike(value) {
  var v = String(value || "").trim();
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(v);
}

function escapeSqlLiteral(value) {
  return String(value || "").replace(/'/g, "''");
}

function resolveInboxRecipient(nk, rawRecipient) {
  var raw = String(rawRecipient || "")
    .replace(/[\u200B-\u200D\uFEFF]/g, "")
    .trim();
  if (!raw) throw new Error("Missing recipient.");

  if (isUuidLike(raw)) {
    if (nk && typeof nk.usersGetId === "function") {
      var usersById = nk.usersGetId([raw]) || [];
      if (!Array.isArray(usersById) || usersById.length === 0) {
        throw new Error("Recipient not found.");
      }
      var byId = usersById[0] || {};
      return { userId: raw, username: String(byId.username || byId.display_name || raw) };
    }
    return { userId: raw, username: raw };
  }

  if (nk && typeof nk.usersGetUsername === "function") {
    var usersByName = nk.usersGetUsername([raw]) || [];
    if (Array.isArray(usersByName) && usersByName.length > 0 && usersByName[0] && usersByName[0].id) {
      return {
        userId: String(usersByName[0].id),
        username: String(usersByName[0].username || usersByName[0].display_name || usersByName[0].id)
      };
    }
  }

  if (nk && typeof nk.sqlQuery === "function") {
    var escaped = escapeSqlLiteral(raw.toLowerCase());
    var query =
      "SELECT id, username, display_name FROM users " +
      "WHERE " +
      "lower(username) = '" + escaped + "' " +
      "OR lower(display_name) = '" + escaped + "' " +
      "OR lower(username) LIKE '" + escaped + "%' " +
      "OR lower(display_name) LIKE '" + escaped + "%' " +
      "ORDER BY " +
      "CASE " +
      "WHEN lower(username) = '" + escaped + "' THEN 0 " +
      "WHEN lower(display_name) = '" + escaped + "' THEN 1 " +
      "WHEN lower(username) LIKE '" + escaped + "%' THEN 2 " +
      "ELSE 3 END, " +
      "create_time DESC " +
      "LIMIT 5";
    var rows = nk.sqlQuery(query) || [];
    if (Array.isArray(rows) && rows.length > 0) {
      var row = rows[0] || {};
      var rowId = String(row.id || "").trim();
      if (rowId) {
        return {
          userId: rowId,
          username: String(row.username || row.display_name || rowId)
        };
      }
    }
  }

  throw new Error("Recipient not found. Use exact username or userId.");
}

function resolveInboxRecipientUserId(nk, rawRecipient) {
  return resolveInboxRecipient(nk, rawRecipient).userId;
}

function rpcSendPlayerMessage(ctx, _logger, nk, payload) {
  var fromUserId = requireUserId(ctx);
  var fromUsername = ctx.username || fromUserId;
  var body = parsePayload(payload);
  var recipientRaw = String(body.toUserId || body.toUsername || body.to || "").trim();
  var recipient = resolveInboxRecipient(nk, recipientRaw);
  var toUserId = recipient.userId;
  var toUsername = recipient.username || toUserId;
  var title = String(body.title || "").trim();
  var content = String(body.body || "").trim();
  if (toUserId === fromUserId) throw new Error("Cannot message yourself.");
  if (!title) throw new Error("Missing title.");
  if (!content) throw new Error("Missing body.");
  if (title.length > INBOX_PLAYER_MSG_TITLE_MAX) throw new Error("Title too long.");
  if (content.length > INBOX_PLAYER_MSG_BODY_MAX) throw new Error("Body too long.");

  var rateKey = INBOX_RATE_KEY_PREFIX + fromUserId;
  for (var attempt = 0; attempt < ECONOMY_WRITE_RETRIES; attempt++) {
    var read = nk.storageRead([
      { collection: INBOX_COLLECTION, key: rateKey, userId: fromUserId },
      { collection: INBOX_COLLECTION, key: INBOX_META_KEY, userId: toUserId }
    ]);
    var rateObj = null;
    var targetMetaObj = null;
    for (var i = 0; i < (read || []).length; i++) {
      if (read[i].key === rateKey && read[i].userId === fromUserId) rateObj = read[i];
      if (read[i].key === INBOX_META_KEY && read[i].userId === toUserId) targetMetaObj = read[i];
    }

    var now = nowTs();
    var rate = defaultInboxRate();
    if (rateObj && rateObj.value && typeof rateObj.value === "object") {
      rate.windowStart = Math.max(0, Math.floor(Number(rateObj.value.windowStart || now)));
      rate.sentInWindow = Math.max(0, Math.floor(Number(rateObj.value.sentInWindow || 0)));
      rate.lastByTarget = rateObj.value.lastByTarget && typeof rateObj.value.lastByTarget === "object" ? rateObj.value.lastByTarget : {};
      rate.version = Math.max(1, Math.floor(Number(rateObj.value.version || 1)));
    }
    if (now - rate.windowStart >= 3600) {
      rate.windowStart = now;
      rate.sentInWindow = 0;
      rate.lastByTarget = {};
    }
    if (rate.sentInWindow >= INBOX_SEND_LIMIT_PER_HOUR) throw new Error("Rate limit reached (hourly).");
    var lastToTarget = Math.max(0, Math.floor(Number(rate.lastByTarget[toUserId] || 0)));
    if (now - lastToTarget < INBOX_SEND_TARGET_COOLDOWN_SEC) {
      throw new Error("Rate limit reached (target cooldown).");
    }

    var targetMeta = defaultInboxMeta();
    if (targetMetaObj && targetMetaObj.value && typeof targetMetaObj.value === "object") {
      targetMeta = readInboxMeta(nk, toUserId).state;
    }
    incrementUnread(targetMeta, "PLAYER", 1);
    targetMeta.version = Math.max(1, Math.floor(Number(targetMeta.version || 1))) + 1;

    var incomingMessageId = buildInboxMessageId(now);
    var incomingMessage = normalizeInboxMessage({
      id: incomingMessageId,
      type: "PLAYER",
      title: title,
      body: content,
      fromUserId: fromUserId,
      fromUsername: fromUsername,
      toUserId: toUserId,
      toUsername: toUsername,
      direction: "IN",
      peerUserId: fromUserId,
      peerUsername: fromUsername,
      createdAt: now,
      expiresAt: now + 60 * 60 * 24 * 30,
      attachments: {},
      combatReport: null
    }, incomingMessageId, toUserId);

    var outgoingMessageId = buildInboxMessageId(now);
    var outgoingMessage = normalizeInboxMessage({
      id: outgoingMessageId,
      type: "PLAYER",
      title: title,
      body: content,
      fromUserId: fromUserId,
      fromUsername: fromUsername,
      toUserId: toUserId,
      toUsername: toUsername,
      direction: "OUT",
      peerUserId: toUserId,
      peerUsername: toUsername,
      createdAt: now,
      readAt: now,
      expiresAt: now + 60 * 60 * 24 * 30,
      attachments: {},
      combatReport: null
    }, outgoingMessageId, fromUserId);

    rate.sentInWindow += 1;
    rate.lastByTarget[toUserId] = now;
    rate.updatedAt = now;
    rate.version = Math.max(1, Math.floor(Number(rate.version || 1))) + 1;

    var writes = [
      {
        collection: INBOX_COLLECTION,
        key: incomingMessageId,
        userId: toUserId,
        permissionRead: 0,
        permissionWrite: 0,
        value: incomingMessage
      },
      {
        collection: INBOX_COLLECTION,
        key: INBOX_META_KEY,
        userId: toUserId,
        permissionRead: 0,
        permissionWrite: 0,
        value: targetMeta
      },
      {
        collection: INBOX_COLLECTION,
        key: rateKey,
        userId: fromUserId,
        permissionRead: 0,
        permissionWrite: 0,
        value: rate
      },
      {
        collection: INBOX_COLLECTION,
        key: outgoingMessageId,
        userId: fromUserId,
        permissionRead: 0,
        permissionWrite: 0,
        value: outgoingMessage
      }
    ];
    if (targetMetaObj && targetMetaObj.version) writes[1].version = targetMetaObj.version;
    if (rateObj && rateObj.version) writes[2].version = rateObj.version;

    try {
      nk.storageWrite(writes);
      return JSON.stringify({
        ok: true,
        messageId: incomingMessageId,
        mirrorMessageId: outgoingMessageId,
        sentAt: now,
        toUserId: toUserId,
        toUsername: toUsername
      });
    } catch (errWrite) {
      if (attempt === ECONOMY_WRITE_RETRIES - 1) throw errWrite;
    }
  }
  throw new Error("Send player message failed.");
}

function rpcInboxSearchPlayers(ctx, _logger, nk, payload) {
  var userId = requireUserId(ctx);
  var body = parsePayload(payload);
  var queryRaw = String(body.query || "").replace(/[\u200B-\u200D\uFEFF]/g, "").trim().toLowerCase();
  var limit = Math.max(1, Math.min(12, sanitizePositiveInt(body.limit || 8)));
  if (queryRaw.length < 3) {
    return JSON.stringify({ ok: true, items: [] });
  }
  if (!nk || typeof nk.sqlQuery !== "function") {
    throw new Error("Player search unavailable on this runtime.");
  }

  var escaped = escapeSqlLiteral(queryRaw);
  var escapedUserId = escapeSqlLiteral(userId);
  var sql =
    "SELECT id, username, display_name, avatar_url FROM users " +
    "WHERE id <> '" + escapedUserId + "' AND (" +
    "lower(username) LIKE '" + escaped + "%' OR " +
    "lower(display_name) LIKE '" + escaped + "%')" +
    " ORDER BY " +
    "CASE " +
    "WHEN lower(username) = '" + escaped + "' THEN 0 " +
    "WHEN lower(display_name) = '" + escaped + "' THEN 1 " +
    "WHEN lower(username) LIKE '" + escaped + "%' THEN 2 " +
    "ELSE 3 END, " +
    "username ASC " +
    "LIMIT " + limit;

  var rows = nk.sqlQuery(sql) || [];
  var items = [];
  for (var i = 0; i < rows.length; i++) {
    var row = rows[i] || {};
    var id = String(row.id || "").trim();
    if (!id) continue;
    var username = String(row.username || "").trim();
    var displayName = String(row.display_name || "").trim();
    var avatarUrl = String(row.avatar_url || "").trim();
    items.push({
      userId: id,
      username: username || displayName || id,
      displayName: displayName,
      avatarUrl: avatarUrl
    });
  }
  return JSON.stringify({ ok: true, items: items });
}

function rpcInboxThread(ctx, _logger, nk, payload) {
  var userId = requireUserId(ctx);
  ensureDailyNoonRewardMessage(nk, userId);
  var body = parsePayload(payload);
  var peerRaw = String(body.peerUserId || body.peerUsername || body.peer || "").trim();
  if (!peerRaw) throw new Error("Missing peer.");
  var peer = resolveInboxRecipient(nk, peerRaw);
  var peerUserId = peer.userId;
  var limit = Math.max(1, Math.min(INBOX_LIST_LIMIT_MAX, sanitizePositiveInt(body.limit || 40)));
  var cursor = String(body.cursor || "");
  var nextCursor = cursor;
  var items = [];
  var toExpire = [];
  var now = nowTs();

  for (var scan = 0; scan < INBOX_LIST_SCAN_MAX && items.length < limit; scan++) {
    var page = nk.storageList(userId, INBOX_COLLECTION, INBOX_LIST_BATCH, nextCursor);
    var objects = page && Array.isArray(page.objects) ? page.objects : [];
    nextCursor = page && page.cursor ? page.cursor : "";
    if (objects.length === 0) break;

    for (var i = 0; i < objects.length; i++) {
      var obj = objects[i];
      if (!obj || !obj.key) continue;
      if (obj.key === INBOX_META_KEY || String(obj.key).indexOf(INBOX_RATE_KEY_PREFIX) === 0) continue;
      var msg = normalizeInboxMessage(obj.value, obj.key, userId);
      if (msg.type !== "PLAYER") continue;
      if (msg.deletedAt > 0 || msg.expiredAt > 0) continue;
      if (msg.expiresAt > 0 && now >= msg.expiresAt) {
        toExpire.push(msg.id);
        continue;
      }
      if (String(msg.peerUserId || "") !== peerUserId) continue;
      items.push(inboxMessageToClient(msg));
      if (items.length >= limit) break;
    }

    if (!nextCursor) break;
  }

  if (toExpire.length > 0) {
    try {
      rpcInboxDelete(ctx, _logger, nk, JSON.stringify({ messageIds: toExpire, _expireOnly: true }));
    } catch (_) {
      // noop
    }
  }

  return JSON.stringify({
    ok: true,
    peer: { userId: peerUserId, username: peer.username || peerUserId },
    items: items,
    nextCursor: nextCursor || ""
  });
}

function rpcInboxDailyNoonTest(ctx, _logger, nk, payload) {
  var userId = requireUserId(ctx);
  var username = String(ctx.username || "").trim();
  if (!INBOX_DAILY_NOON_TEST_ALLOWED_USERS[String(username).toLowerCase()]) {
    throw new Error("Forbidden.");
  }
  var body = parsePayload(payload);
  var streakDay = Math.max(1, Math.min(7, sanitizePositiveInt(body.streakDay || 1)));
  var now = nowTs();
  var dayKey = "test-" + formatServerDayKey(new Date(now * 1000)) + "-" + Math.floor(Math.random() * 100000).toString(36);
  var message = createInboxMessageForUser(nk, userId, {
    type: "REWARD",
    title: "Recompense quotidienne (TEST)",
    body: "Coffre Quotidien de Midi de test.\nCliquez sur Ouvrir pour recevoir la recompense.",
    attachments: {},
    meta: {
      kind: INBOX_DAILY_NOON_META_KIND,
      dayKey: dayKey,
      noonTs: now,
      streakDay: streakDay,
      rewardGenerated: false,
      openedAt: 0
    },
    expiresAt: now + INBOX_DAILY_NOON_EXPIRY_SEC
  });
  return JSON.stringify({
    ok: true,
    message: inboxMessageToClient(message)
  });
}

function serializeHarvestInventory(economy) {
  ensureHangarState(economy);
  var rows = [];
  var keys = Object.keys(economy.hangarInventory || {});
  for (var i = 0; i < keys.length; i++) {
    var unitId = keys[i];
    var available = sanitizePositiveInt(economy.hangarInventory[unitId] || 0);
    if (available <= 0) continue;
    var stats = MAP_HARVEST_UNIT_STATS[unitId];
    if (!stats) continue;
    rows.push({
      unitId: unitId,
      quantity: available,
      harvestSpeed: stats.harvestSpeed,
      harvestCapacity: stats.harvestCapacity,
      mapSpeed: stats.mapSpeed
    });
  }
  rows.sort(function(a, b) {
    if (b.harvestSpeed !== a.harvestSpeed) return b.harvestSpeed - a.harvestSpeed;
    return String(a.unitId).localeCompare(String(b.unitId));
  });
  return rows;
}

function rpcMapFieldsState(ctx, _logger, nk, payload) {
  var userId = requireUserId(ctx);
  var username = ctx.username || userId;
  parsePayload(payload);

  var tx = withMapTransaction(nk, userId, username, function(economy, _inventory, mapState, ts, syncResult) {
    var fields = [];
    for (var i = 0; i < mapState.fields.length; i++) {
      fields.push(serializeMapFieldForViewer(mapState.fields[i], userId));
    }
    return {
      serverNowTs: ts,
      fields: fields,
      expedition: serializeMapExpedition(economy.resourceExpedition, ts),
      reports: Array.isArray(economy.resourceReports) ? economy.resourceReports.slice(0, 8) : [],
      harvestInventory: serializeHarvestInventory(economy),
      syncReport: syncResult && syncResult.report ? syncResult.report : null
    };
  });

  return JSON.stringify({
    ok: true,
    serverNowTs: tx.result.serverNowTs,
    fields: tx.result.fields,
    expedition: tx.result.expedition,
    reports: tx.result.reports,
    harvestInventory: tx.result.harvestInventory,
    syncReport: tx.result.syncReport
  });
}

function rpcMapFieldsStart(ctx, _logger, nk, payload) {
  var userId = requireUserId(ctx);
  var username = ctx.username || userId;
  var body = parsePayload(payload);
  var fieldId = String(body.fieldId || "").trim();
  var fleet = Array.isArray(body.fleet) ? body.fleet : [];
  if (!fieldId) throw new Error("Missing fieldId.");
  if (!Array.isArray(fleet) || fleet.length <= 0) throw new Error("Missing fleet payload.");

  var tx = withMapTransaction(nk, userId, username, function(economy, _inventory, mapState, ts, syncResult) {
    var expedition = startMapExpedition(economy, mapState, userId, username, fieldId, fleet, ts);
    var selectedField = findMapField(mapState, fieldId);
    var fields = [];
    for (var i = 0; i < mapState.fields.length; i++) {
      fields.push(serializeMapFieldForViewer(mapState.fields[i], userId));
    }
    return {
      __dirty: true,
      serverNowTs: ts,
      expedition: serializeMapExpedition(expedition, ts),
      selectedField: selectedField ? serializeMapFieldForViewer(selectedField, userId) : null,
      fields: fields,
      syncReport: syncResult && syncResult.report ? syncResult.report : null
    };
  });

  return JSON.stringify({
    ok: true,
    serverNowTs: tx.result.serverNowTs,
    expedition: tx.result.expedition,
    selectedField: tx.result.selectedField,
    fields: tx.result.fields,
    syncReport: tx.result.syncReport
  });
}

function rpcMapFieldsRecall(ctx, _logger, nk, payload) {
  var userId = requireUserId(ctx);
  var username = ctx.username || userId;
  parsePayload(payload);

  var tx = withMapTransaction(nk, userId, username, function(economy, _inventory, mapState, ts, syncResult) {
    var expedition = recallMapExpedition(economy, mapState, ts);
    var fields = [];
    for (var i = 0; i < mapState.fields.length; i++) {
      fields.push(serializeMapFieldForViewer(mapState.fields[i], userId));
    }
    return {
      __dirty: true,
      serverNowTs: ts,
      expedition: serializeMapExpedition(expedition, ts),
      fields: fields,
      reports: Array.isArray(economy.resourceReports) ? economy.resourceReports.slice(0, 8) : [],
      syncReport: syncResult && syncResult.report ? syncResult.report : null
    };
  });

  return JSON.stringify({
    ok: true,
    serverNowTs: tx.result.serverNowTs,
    expedition: tx.result.expedition,
    fields: tx.result.fields,
    reports: tx.result.reports,
    syncReport: tx.result.syncReport
  });
}

function rpcMapPlayers(ctx, _logger, nk, payload) {
  requireUserId(ctx);
  var body = parsePayload(payload);
  var limit = Math.max(1, Math.min(5000, sanitizePositiveInt(body.limit || 5000)));
  var out = listMapPlayers(nk, limit);
  return JSON.stringify({ ok: true, players: out });
}

function safeLeaderboardRecordsList(nk, logger, leaderboardId, limit, ownerId) {
  try {
    var ownerIds = ownerId ? [ownerId] : [];
    var result = nk.leaderboardRecordsList(leaderboardId, ownerIds, limit || 50, "", 0);
    return {
      records: (result && result.records) || [],
      ownerRecords: (result && result.ownerRecords) || []
    };
  } catch (err) {
    if (logger) logger.debug("leaderboard list failed " + leaderboardId + ": " + err);
    return { records: [], ownerRecords: [] };
  }
}

function seedAllianceLeaderboardFromStorage(nk, logger, maxRows) {
  var seedLimit = Math.max(1, Math.min(200, sanitizePositiveInt(maxRows || 50)));
  var cursor = "";
  var seeded = 0;
  var sourceCollection = ALLIANCE_COLLECTION;

  for (var page = 0; page < 20 && seeded < seedLimit; page++) {
    var listed = null;
    var pageSize = Math.max(1, Math.min(100, seedLimit - seeded));
    try {
      listed = nk.storageList(SYSTEM_USER_ID, sourceCollection, pageSize, cursor);
    } catch (_e) {
      try {
        listed = nk.storageList(null, sourceCollection, pageSize, cursor);
      } catch (_e2) {
        try {
          listed = nk.storageList("", sourceCollection, pageSize, cursor);
        } catch (_e3) {
          listed = { objects: [], cursor: "" };
        }
      }
    }

    var objects = listed && Array.isArray(listed.objects) ? listed.objects : [];
    if (objects.length === 0) break;

    for (var i = 0; i < objects.length && seeded < seedLimit; i++) {
      var obj = objects[i] || {};
      var value = obj.value || {};
      var allianceId = String(value.id || obj.key || "").trim();
      if (!allianceId) continue;

      var name = String(value.name || allianceId);
      var tag = String(value.tag || "");
      var memberCount = sanitizePositiveInt(value.memberCount || (Array.isArray(value.members) ? value.members.length : 0));
      var bastionLevel = Math.max(1, sanitizePositiveInt(value.bastionLevel || 1));
      var publicStats = value.publicStats && typeof value.publicStats === "object" ? value.publicStats : {};
      var totalScore = sanitizePositiveInt(Number(publicStats.pointsTotauxAlliance || value.cachedTotalScore || 0));
      var leaderboardOwnerId = resolveAllianceLeaderboardOwnerId(value, "");
      if (!leaderboardOwnerId) continue;

      safeLeaderboardWrite(
        nk,
        logger,
        LEADERBOARD_ALLIANCE_TOTAL,
        leaderboardOwnerId,
        name,
        totalScore,
        bastionLevel,
        { allianceId: allianceId, tag: tag, members: memberCount, name: name }
      );
      seeded += 1;
    }

    cursor = String((listed && listed.cursor) || "");
    if (!cursor) break;
  }
}

function buildAllianceRowsFromPublicStorage(nk, maxRows) {
  var limit = Math.max(1, Math.min(200, sanitizePositiveInt(maxRows || 50)));
  var cursor = "";
  var rows = [];

  for (var page = 0; page < 20 && rows.length < limit; page++) {
    var listed = null;
    var pageSize = Math.max(1, Math.min(100, limit - rows.length));
    try {
      listed = nk.storageList(null, ALLIANCES_PUBLIC_COLLECTION, pageSize, cursor);
    } catch (_e) {
      try {
        listed = nk.storageList("", ALLIANCES_PUBLIC_COLLECTION, pageSize, cursor);
      } catch (_e2) {
        listed = { objects: [], cursor: "" };
      }
    }

    var objects = listed && Array.isArray(listed.objects) ? listed.objects : [];
    if (objects.length === 0) break;

    for (var i = 0; i < objects.length && rows.length < limit; i++) {
      var obj = objects[i] || {};
      var value = obj.value || {};
      var allianceId = String(value.id || obj.key || "").trim();
      if (!allianceId) continue;
      var name = String(value.name || allianceId);
      var tag = String(value.tag || "");
      var memberCount = sanitizePositiveInt(value.memberCount || 0);
      var bastionLevel = Math.max(1, sanitizePositiveInt(value.bastionLevel || 1));
      var publicStats = value.publicStats && typeof value.publicStats === "object" ? value.publicStats : {};
      var score = sanitizePositiveInt(Number(publicStats.pointsTotauxAlliance || value.cachedTotalScore || 0));
      rows.push({
        ownerId: allianceId,
        username: name,
        score: score,
        subscore: bastionLevel,
        rank: 0,
        metadata: {
          allianceId: allianceId,
          name: name,
          tag: tag,
          members: memberCount
        }
      });
    }

    cursor = String((listed && listed.cursor) || "");
    if (!cursor) break;
  }

  rows.sort(function(a, b) {
    if (b.score !== a.score) return b.score - a.score;
    if (b.subscore !== a.subscore) return b.subscore - a.subscore;
    return String(a.username || "").localeCompare(String(b.username || ""));
  });
  for (var r = 0; r < rows.length; r++) rows[r].rank = r + 1;
  return rows.slice(0, limit);
}

function migrateAlliancePublicStorage(nk, logger) {
  var cursor = "";
  for (var page = 0; page < 200; page++) {
    var listed = null;
    try {
      listed = nk.storageList(null, ALLIANCES_PUBLIC_COLLECTION, 100, cursor);
    } catch (_e) {
      try {
        listed = nk.storageList("", ALLIANCES_PUBLIC_COLLECTION, 100, cursor);
      } catch (_e2) {
        listed = { objects: [], cursor: "" };
      }
    }
    var objects = listed && Array.isArray(listed.objects) ? listed.objects : [];
    if (objects.length === 0) break;

    for (var i = 0; i < objects.length; i++) {
      var obj = objects[i] || {};
      var allianceId = String(obj.key || "").trim();
      if (!allianceId) continue;
      try {
        var composite = readAllianceCompositeState(nk, allianceId);
        if (!composite.alliance) continue;
        var ts = nowTs();
        var members = rebuildAllianceLeadership(composite.alliance, composite.members, ts);
        var membersState = { allianceId: allianceId, members: members, updatedAt: ts };
        var writes = [
          makeStorageWriteReq(
            ALLIANCES_PUBLIC_COLLECTION,
            allianceId,
            "",
            buildAlliancePublicState(composite.alliance, members),
            composite.publicVersion || obj.version || "",
            2,
            0
          ),
          makeStorageWriteReq(
            ALLIANCE_COLLECTION,
            allianceId,
            "",
            composite.alliance,
            composite.privateVersion || "",
            0,
            0
          ),
          makeStorageWriteReq(
            ALLIANCE_MEMBERS_COLLECTION,
            allianceId,
            "",
            membersState,
            composite.membersVersion || "",
            0,
            0
          )
        ];
        nk.storageWrite(writes);
      } catch (errWrite) {
        if (logger && typeof logger.debug === "function") {
          logger.debug("alliance_public_migration skipped id=" + allianceId + " err=" + errWrite);
        }
      }
    }

    cursor = String((listed && listed.cursor) || "");
    if (!cursor) break;
  }
}

function rpcRankingGetState(ctx, logger, nk, payload) {
  var userId = requireUserId(ctx);
  var username = ctx.username || userId;
  var body = parsePayload(payload);
  var limit = Math.max(5, Math.min(100, sanitizePositiveInt(body.limit || 50)));

  // Use hydrated state so finished queues/offline progression are reflected in points.
  // If client progress snapshot is provided, merge it once (monotonic levels only) before scoring.
  var economy = readEconomyStateForRanking(nk, userId, body, logger);
  var playerPoints = syncPlayerPoints(nk, logger, userId, username, economy);
  var totalRows = safeLeaderboardRecordsList(nk, logger, LEADERBOARD_PLAYER_TOTAL, limit, userId);
  var allianceRows = safeLeaderboardRecordsList(nk, logger, LEADERBOARD_ALLIANCE_TOTAL, limit, null);
  if (!allianceRows.records || allianceRows.records.length === 0) {
    seedAllianceLeaderboardFromStorage(nk, logger, limit);
    allianceRows = safeLeaderboardRecordsList(nk, logger, LEADERBOARD_ALLIANCE_TOTAL, limit, null);
    if (!allianceRows.records || allianceRows.records.length === 0) {
      allianceRows = { records: buildAllianceRowsFromPublicStorage(nk, limit), ownerRecords: [] };
    }
  }

  var ownerRankRecord = totalRows.ownerRecords && totalRows.ownerRecords[0] ? totalRows.ownerRecords[0] : null;
  var playerRank = ownerRankRecord ? sanitizePositiveInt(ownerRankRecord.rank || 0) : 0;
  if (Array.isArray(totalRows.records)) {
    for (var i = 0; i < totalRows.records.length; i++) {
      var row = totalRows.records[i];
      if (String(row.ownerId || "") !== userId) continue;
      row.score = playerPoints.total;
      row.subscore = playerPoints.military;
      if (!playerRank) playerRank = sanitizePositiveInt(row.rank || 0);
      break;
    }
  }

  var profile = readAllianceProfile(nk, userId).state || defaultAllianceProfile();
  return JSON.stringify({
    ok: true,
    player: {
      userId: userId,
      username: username,
      points: playerPoints,
      rank: playerRank
    },
    playerTop: totalRows.records || [],
    allianceTop: allianceRows.records || [],
    allianceProfile: profile
  });
}

function InitModule(_ctx, logger, _nk, initializer) {
  safeLeaderboardCreate(_nk, logger, LEADERBOARD_PLAYER_TOTAL);
  safeLeaderboardCreate(_nk, logger, LEADERBOARD_PLAYER_MILITARY);
  safeLeaderboardCreate(_nk, logger, LEADERBOARD_PLAYER_ECONOMY);
  safeLeaderboardCreate(_nk, logger, LEADERBOARD_PLAYER_RESEARCH);
  safeLeaderboardCreate(_nk, logger, LEADERBOARD_ALLIANCE_TOTAL);
  migrateAlliancePublicStorage(_nk, logger);
  seedAllianceLeaderboardFromStorage(_nk, logger, 200);

  initializer.registerRpc("economy_get_state", rpcEconomyGetState);
  initializer.registerRpc("economy_start_building", rpcEconomyStartBuilding);
  initializer.registerRpc("economy_cancel", rpcEconomyCancel);
  initializer.registerRpc("economy_apply_boost", rpcEconomyApplyBoost);
  initializer.registerRpc("economy_finish_with_credits", rpcEconomyFinishWithCredits);
  initializer.registerRpc("hangar_get_state", rpcHangarGetState);
  initializer.registerRpc("hangar_start", rpcHangarStart);
  initializer.registerRpc("hangar_cancel", rpcHangarCancel);
  initializer.registerRpc("getInventory", rpcInventoryGet);
  initializer.registerRpc("getInventoryMeta", rpcInventoryMeta);
  initializer.registerRpc("useItem", rpcInventoryUseItem);
  initializer.registerRpc("ranking_get_state", rpcRankingGetState);
  initializer.registerRpc("rpc_create_alliance", rpcCreateAlliance);
  initializer.registerRpc("rpc_get_my_alliance", rpcGetMyAlliance);
  initializer.registerRpc("rpc_search_alliances", rpcSearchAlliances);
  initializer.registerRpc("rpc_update_my_alliance", rpcUpdateMyAlliance);
  initializer.registerRpc("rpc_join_alliance", rpcJoinAlliance);
  initializer.registerRpc("rpc_leave_alliance", rpcLeaveAlliance);
  initializer.registerRpc("rpc_alliance_member_action", rpcAllianceMemberAction);
  initializer.registerRpc("rpc_alliance_apply", rpcAllianceApply);
  initializer.registerRpc("rpc_alliance_review_application", rpcAllianceReviewApplication);
  initializer.registerRpc("rpc_alliance_invite_player", rpcAllianceInvitePlayer);
  initializer.registerRpc("rpc_alliance_respond_invite", rpcAllianceRespondInvite);
  initializer.registerRpc("rpc_inbox_list", rpcInboxList);
  initializer.registerRpc("rpc_inbox_read", rpcInboxRead);
  initializer.registerRpc("rpc_inbox_delete", rpcInboxDelete);
  initializer.registerRpc("rpc_inbox_claim", rpcInboxClaim);
  initializer.registerRpc("rpc_send_player_message", rpcSendPlayerMessage);
  initializer.registerRpc("rpc_inbox_search_players", rpcInboxSearchPlayers);
  initializer.registerRpc("rpc_inbox_thread", rpcInboxThread);
  initializer.registerRpc("rpc_inbox_daily_noon_test", rpcInboxDailyNoonTest);
  initializer.registerRpc("rpc_map_players", rpcMapPlayers);
  initializer.registerRpc("rpc_map_fields_state", rpcMapFieldsState);
  initializer.registerRpc("rpc_map_fields_start", rpcMapFieldsStart);
  initializer.registerRpc("rpc_map_fields_recall", rpcMapFieldsRecall);
  logger.info("Loaded hyperstructure economy runtime module (JS).");
}

if (typeof module !== "undefined" && module.exports) {
  module.exports = {
    __test: {
      defaultEconomyState: defaultEconomyState,
      defaultInventoryState: defaultInventoryState,
      addItemToInventory: addItemToInventory,
      removeItemFromInventory: removeItemFromInventory,
      resolveQueueSlotForBuilding: resolveQueueSlotForBuilding,
      applyTimeBoost: applyTimeBoost,
      useTimeRift: useTimeRift,
      startHangarProduction: startHangarProduction,
      cancelHangarProduction: cancelHangarProduction,
      completeHangarQueue: completeHangarQueue,
      getProducedResources: getProducedResources,
      calculateChestRewards: calculateChestRewards,
      openChest: openChest,
      ITEM_DEFINITIONS: ITEM_DEFINITIONS,
      withEconomyInventoryTransaction: withEconomyInventoryTransaction,
      normalizeInboxAttachments: normalizeInboxAttachments,
      inboxMessageToClient: inboxMessageToClient,
      createRewardMessage: createRewardMessage,
      createCombatReportMessage: createCombatReportMessage,
      createSystemMessage: createSystemMessage
    }
  };
}
