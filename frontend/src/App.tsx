import { Client, Session } from "@heroiclabs/nakama-js";
import {
  ArrowUpCircle,
  Bed,
  DoorOpen,
  Droplet,
  Utensils,
  X,
  Zap,
  ZoomIn,
  ZoomOut,
  RefreshCw,
  Move,
  Shield,
  Users,
  Coins,
  Wifi,
  WifiOff,
  AlertCircle,
  LogOut,
  Play,
  UserRound,
  Save,
  Globe,
  Mail,
  Hexagon,
  Gem,
  Rocket,
  Crosshair,
  Swords,
  Filter,
  Navigation,
  MapPin,
  Plus,
  MessageCircle,
  Send,
  Package,
  Hourglass,
  BookOpen,
  Heart,
  Smile,
  ChevronRight
} from "lucide-react";
import { CSSProperties, FormEvent, Fragment, useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState } from "react";

type ResourceId =
  | "carbone"
  | "titane"
  | "osmium"
  | "adamantium"
  | "magmatite"
  | "neodyme"
  | "chronium"
  | "aetherium"
  | "isotope7"
  | "singulite";

type PopulationBuildingId =
  | "quartiers_residentiels"
  | "cantine_hydroponique"
  | "centre_medical"
  | "parc_orbital"
  | "academie_technique"
  | "universite_orbitale";

type RoomType = ResourceId | PopulationBuildingId | "entrepot" | "entrance";

interface Room {
  id: string;
  x: number;
  y: number;
  width: number;
  type: RoomType;
  level: number;
}

type ConstructionJob =
  | {
      id: string;
      mode: "build";
      roomType: RoomType;
      x: number;
      y: number;
      targetLevel: 1;
      endAt: number;
      startedAt: number;
      costPaid: ResourceCost;
    }
  | {
      id: string;
      mode: "upgrade";
      roomId: string;
      roomType: RoomType;
      targetLevel: number;
      endAt: number;
      startedAt: number;
      costPaid: ResourceCost;
    };

type TechnologyId =
  | "optimisation_extractive"
  | "compression_minerale"
  | "raffinement_avance"
  | "physique_quantique_appliquee"
  | "automatisation_industrielle"
  | "optimisation_logistique"
  | "propulsion_stellaire"
  | "moteurs_flux_neodyme"
  | "balistique_avancee"
  | "blindage_composite"
  | "ciblage_predictif"
  | "renforcement_orbital"
  | "architecture_defensive"
  | "amplification_photonique"
  | "stabilisation_plasma"
  | "balistique_orbitale"
  | "controle_electromagnetique"
  | "generateur_aegis"
  | "doctrine_escarmouche"
  | "doctrine_interception"
  | "doctrine_domination"
  | "architecture_capitale"
  | "maitrise_energie_quantique"
  | "stabilisation_singulite"
  | "commandement_escadre"
  | "analyse_tactique"
  | "ingenierie_modulaire";

type TechnologyCategory = "eco" | "military" | "defense" | "unlock" | "energy" | "strategy";

type TechnologyRequirement = {
  id: TechnologyId;
  level: number;
};

type TechnologyDef = {
  id: TechnologyId;
  name: string;
  category: TechnologyCategory;
  description: string;
  effectPerLevel?: string;
  baseCost: ResourceCost;
  baseTimeSec: number;
  maxLevel?: number;
  requires?: TechnologyRequirement[];
};

type ResearchJob = {
  id: string;
  technologyId: TechnologyId;
  targetLevel: number;
  startedAt: number;
  endAt: number;
  costPaid: ResourceCost;
};

type PopulationEventType = "festival_orbital" | "epidemie" | "greve_industrielle" | "decouverte_scientifique";
type PopulationCrisisType = "emeute" | "sabotage" | "secession";

type PopulationEventState = {
  type: PopulationEventType;
  startedAt: number;
  endsAt: number;
};

type PopulationCrisisState = {
  type: PopulationCrisisType;
  startedAt: number;
  endsAt: number;
};

type PopulationState = {
  total: number;
  foodStock: number;
  stability: number;
  isFamine: boolean;
  onboardingProtectionUntil: number;
  lastTickAt: number;
  lastEventRollAt: number;
  lastCrisisRollAt: number;
  activeEvent: PopulationEventState | null;
  activeCrisis: PopulationCrisisState | null;
};

type CivilizationTier = {
  id: "colonie" | "station" | "cite_orbitale" | "metropole_spatiale" | "megastructure_vivante";
  minPopulation: number;
  nameFr: string;
  nameEn: string;
};

type PopulationSnapshot = {
  totalPopulation: number;
  capacity: number;
  growthPerHour: number;
  migrationPerHour: number;
  foodStock: number;
  foodCapacity: number;
  foodProductionPerHour: number;
  foodConsumptionPerHour: number;
  foodBalancePerHour: number;
  stability: number;
  workers: number;
  engineers: number;
  scientists: number;
  requiredWorkers: number;
  availableWorkers: number;
  workforceMultiplier: number;
  productionMultiplier: number;
  constructionTimeFactor: number;
  researchTimeFactor: number;
  productionBonusPct: number;
  constructionSpeedBonusPct: number;
  researchSpeedBonusPct: number;
  stabilityBand: "excellent" | "normal" | "warning" | "trouble" | "revolt";
  isOverCapacity: boolean;
  foodShortage: boolean;
  housingScore: number;
  healthScore: number;
  leisureScore: number;
  attractivity: number;
  efficiencyPct: number;
  civilizationTier: CivilizationTier;
  activeEvent: PopulationEventState | null;
  activeCrisis: PopulationCrisisState | null;
  crisisPenaltyPct: number;
  eventProductionPct: number;
  eventResearchPct: number;
  onboardingProtectionActive: boolean;
  onboardingProtectionRemainingSec: number;
};

type MainMissionDefinition = {
  id: string;
  roomType: RoomType;
  targetLevel: number;
};

type MainMissionState = {
  activeMissionIds: string[];
  nextIndex: number;
  completedCount: number;
  skippedCount: number;
  totalRewardCredits: number;
  lastRewardCredits: number;
  lastRewardCount: number;
  lastCompletedAt: number;
  bootstrapped: boolean;
  finished: boolean;
};

const GRID_WIDTH = 14;
const CELL_WIDTH = 78;
const CELL_HEIGHT = 96;
const BASE_ZOOM = 1.2;
const MAX_ZOOM = BASE_ZOOM * 2;
const STARTING_CREDITS = 0;
const SAVE_KEY = "hsg_vault_state_v2";
const SAVE_KEY_USER_PREFIX = "hsg_vault_state_v3";
const SAVE_KEY_LEGACY_OWNER_KEY = "hsg_vault_state_v2_owner";
const AUTH_SESSION_KEY = "hsg_nakama_session_v1";
const UI_SCREEN_KEY = "hsg_ui_screen_v1";
const PROFILE_EMAIL_DRAFT_KEY = "hsg_profile_email_draft_v1";
const UI_LANG_KEY = "hsg_ui_lang_v1";
const INVENTORY_UI_NOTIFS_KEY = "hsg_inventory_notifs_v1";
const SCORE_DISPLAY_DIVISOR = 50000;
const TIME_BOOST_ITEM_IMAGE = "/room-images/item-acceleration.png";
const TIME_BOOST_IMAGE_BY_SECONDS: Record<number, string> = {
  60: "/room-images/Faille-Temporelle-1-min.png",
  300: "/room-images/Faille-Temporelle-5-min.png",
  3600: "/room-images/Faille-Temporelle-1-heure.png",
  10800: "/room-images/Faille-Temporelle-3-heure.png",
  43200: "/room-images/Faille-Temporelle-12-heure.png"
};

const formatDisplayedScoreValue = (rawScore: number) => {
  const safe = Math.max(0, Number(rawScore || 0));
  if (safe <= 0) return 0;
  return Math.max(1, Math.round(safe / SCORE_DISPLAY_DIVISOR));
};

function resolveTimeBoostImage(durationSeconds?: number | null) {
  const secs = Math.max(0, Math.floor(Number(durationSeconds ?? 0)));
  return TIME_BOOST_IMAGE_BY_SECONDS[secs] ?? TIME_BOOST_ITEM_IMAGE;
}

const vaultStorageKeyForUser = (userId?: string | null) =>
  userId && userId.trim().length > 0 ? `${SAVE_KEY_USER_PREFIX}_${userId}` : SAVE_KEY;
type UIScreen =
  | "home"
  | "game"
  | "hangar"
  | "population"
  | "alliance"
  | "ranking"
  | "profile"
  | "starmap"
  | "chat"
  | "resources"
  | "inventory"
  | "technology"
  | "wiki"
  | "inbox";
type UILanguage = "fr" | "en";

type RoomConfig = {
  name: string;
  width: number;
  color: string;
  icon: JSX.Element;
  image: string;
  maxLevel: number;
  baseCost: number;
  buildSecondsBase: number;
  buildGroup: "core" | "production" | "population" | "infrastructure";
  resourceId?: ResourceId;
};

const ROOM_CONFIG: Record<RoomType, RoomConfig> = {
  entrance: {
    name: "Spatioport Principal",
    width: 2,
    color: "room-entrance",
    icon: <DoorOpen size={20} />,
    image: "/room-images/spatioport-principal.png",
    maxLevel: 1,
    baseCost: 0,
    buildSecondsBase: 0,
    buildGroup: "core"
  },
  carbone: {
    name: "Raffinerie de Carbone",
    width: 3,
    color: "room-living",
    icon: <Bed size={20} />,
    image: "/room-images/batiment-carbone.png",
    maxLevel: 9999,
    baseCost: 120,
    buildSecondsBase: 60,
    buildGroup: "production",
    resourceId: "carbone"
  },
  titane: {
    name: "Fabrique de Titane",
    width: 3,
    color: "room-power",
    icon: <Zap size={20} />,
    image: "/room-images/batiment-titane.png",
    maxLevel: 9999,
    baseCost: 250,
    buildSecondsBase: 120,
    buildGroup: "production",
    resourceId: "titane"
  },
  osmium: {
    name: "Compacteur d'Osmium",
    width: 3,
    color: "room-food",
    icon: <Utensils size={20} />,
    image: "/room-images/batiment-osmium.png",
    maxLevel: 9999,
    baseCost: 540,
    buildSecondsBase: 240,
    buildGroup: "production",
    resourceId: "osmium"
  },
  adamantium: {
    name: "Synchrotron d'Adamantium",
    width: 3,
    color: "room-water",
    icon: <Droplet size={20} />,
    image: "/room-images/batiment-adamantium.png",
    maxLevel: 9999,
    baseCost: 980,
    buildSecondsBase: 480,
    buildGroup: "production",
    resourceId: "adamantium"
  },
  magmatite: {
    name: "Collecteur de Magmatite",
    width: 3,
    color: "room-power",
    icon: <Zap size={20} />,
    image: "/room-images/batiment-magmatite.png",
    maxLevel: 9999,
    baseCost: 1800,
    buildSecondsBase: 900,
    buildGroup: "production",
    resourceId: "magmatite"
  },
  neodyme: {
    name: "Extracteur de Neodyme",
    width: 3,
    color: "room-water",
    icon: <Droplet size={20} />,
    image: "/room-images/batiment-neodyme.png",
    maxLevel: 9999,
    baseCost: 2600,
    buildSecondsBase: 1200,
    buildGroup: "production",
    resourceId: "neodyme"
  },
  chronium: {
    name: "Accelerateur de Chronium",
    width: 3,
    color: "room-food",
    icon: <Utensils size={20} />,
    image: "/room-images/chronium.png",
    maxLevel: 9999,
    baseCost: 4200,
    buildSecondsBase: 1800,
    buildGroup: "production",
    resourceId: "chronium"
  },
  aetherium: {
    name: "Condensateur d'Aetherium",
    width: 3,
    color: "room-living",
    icon: <Bed size={20} />,
    image: "/room-images/aetherium.png",
    maxLevel: 9999,
    baseCost: 6400,
    buildSecondsBase: 2700,
    buildGroup: "production",
    resourceId: "aetherium"
  },
  isotope7: {
    name: "Centrifugeuse a Isotope-7",
    width: 3,
    color: "room-power",
    icon: <Zap size={20} />,
    image: "/room-images/batiment-isotope.png",
    maxLevel: 9999,
    baseCost: 9200,
    buildSecondsBase: 3600,
    buildGroup: "production",
    resourceId: "isotope7"
  },
  singulite: {
    name: "Forge a Singulite",
    width: 3,
    color: "room-entrance",
    icon: <DoorOpen size={20} />,
    image: "/room-images/batiment-singulite.png",
    maxLevel: 9999,
    baseCost: 14500,
    buildSecondsBase: 5400,
    buildGroup: "production",
    resourceId: "singulite"
  },
  quartiers_residentiels: {
    name: "Quartiers residentiels",
    width: 3,
    color: "room-living",
    icon: <Users size={20} />,
    image: "/room-images/habitat-orbital.png",
    maxLevel: 99,
    baseCost: 4200,
    buildSecondsBase: 720,
    buildGroup: "population"
  },
  cantine_hydroponique: {
    name: "Cantine hydroponique",
    width: 3,
    color: "room-food",
    icon: <Utensils size={20} />,
    image: "/room-images/bioforge-alimentaire.png",
    maxLevel: 99,
    baseCost: 3600,
    buildSecondsBase: 660,
    buildGroup: "population"
  },
  centre_medical: {
    name: "Centre medical",
    width: 2,
    color: "room-water",
    icon: <Shield size={20} />,
    image: "/room-images/cyclateur-hydrique.png",
    maxLevel: 80,
    baseCost: 5600,
    buildSecondsBase: 960,
    buildGroup: "population"
  },
  parc_orbital: {
    name: "Parc orbital",
    width: 2,
    color: "room-living",
    icon: <Gem size={20} />,
    image: "/room-images/accueil.png",
    maxLevel: 80,
    baseCost: 4800,
    buildSecondsBase: 900,
    buildGroup: "population"
  },
  academie_technique: {
    name: "Academie technique",
    width: 3,
    color: "room-power",
    icon: <BookOpen size={20} />,
    image: "/room-images/reacteur-fusion.png",
    maxLevel: 60,
    baseCost: 9200,
    buildSecondsBase: 1200,
    buildGroup: "population"
  },
  universite_orbitale: {
    name: "Universite orbitale",
    width: 3,
    color: "room-entrance",
    icon: <Hexagon size={20} />,
    image: "/room-images/spatioport-principal2.png",
    maxLevel: 60,
    baseCost: 13500,
    buildSecondsBase: 1500,
    buildGroup: "population"
  },
  entrepot: {
    name: "Entrepot Orbital",
    width: 2,
    color: "room-entrance",
    icon: <Shield size={20} />,
    image: "/room-images/entrepot.png",
    maxLevel: 9999,
    baseCost: 300,
    buildSecondsBase: 120,
    buildGroup: "infrastructure"
  }
};

const ROOM_NAME_EN: Record<RoomType, string> = {
  entrance: "Main Spaceport",
  carbone: "Carbon Refinery",
  titane: "Titanium Factory",
  osmium: "Osmium Compactor",
  adamantium: "Adamantium Synchrotron",
  magmatite: "Magmatite Collector",
  neodyme: "Neodymium Extractor",
  chronium: "Chronium Accelerator",
  aetherium: "Aetherium Condenser",
  isotope7: "Isotope-7 Centrifuge",
  singulite: "Singulite Forge",
  quartiers_residentiels: "Residential Quarters",
  cantine_hydroponique: "Hydroponic Canteen",
  centre_medical: "Medical Center",
  parc_orbital: "Orbital Park",
  academie_technique: "Technical Academy",
  universite_orbitale: "Orbital University",
  entrepot: "Orbital Warehouse"
};

const roomDisplayName = (type: RoomType, language: UILanguage): string =>
  language === "en" ? ROOM_NAME_EN[type] ?? ROOM_CONFIG[type].name : ROOM_CONFIG[type].name;

const PRODUCTION_BUILDING_SPRITE_SHEET = "/room-images/batiment.png";
const PRODUCTION_BUILDING_SPRITE_SHEET_WIDTH = 1024;
const PRODUCTION_BUILDING_SPRITE_SHEET_HEIGHT = 640;
const PRODUCTION_BUILDING_SPRITE_CELL_WIDTH = 512;
const PRODUCTION_BUILDING_SPRITE_CELL_HEIGHT = 128;
const PRODUCTION_BUILDING_SPRITE_INSET_LEFT = 12;
const PRODUCTION_BUILDING_SPRITE_INSET_RIGHT = 12;
const PRODUCTION_BUILDING_SPRITE_INSET_TOP = 16;
const PRODUCTION_BUILDING_SPRITE_INSET_BOTTOM = 16;

const PRODUCTION_BUILDING_SPRITE_SLOT: Partial<Record<RoomType, { col: number; row: number }>> = {
  chronium: { col: 1, row: 1 },
  aetherium: { col: 1, row: 2 }
};

const roomProductionSpriteStyle = (type: RoomType): CSSProperties | null => {
  const slot = PRODUCTION_BUILDING_SPRITE_SLOT[type];
  if (!slot) return null;
  const frameX = slot.col * PRODUCTION_BUILDING_SPRITE_CELL_WIDTH + PRODUCTION_BUILDING_SPRITE_INSET_LEFT;
  const frameY = slot.row * PRODUCTION_BUILDING_SPRITE_CELL_HEIGHT + PRODUCTION_BUILDING_SPRITE_INSET_TOP;
  const visibleWidth = Math.max(1, PRODUCTION_BUILDING_SPRITE_CELL_WIDTH - PRODUCTION_BUILDING_SPRITE_INSET_LEFT - PRODUCTION_BUILDING_SPRITE_INSET_RIGHT);
  const visibleHeight = Math.max(1, PRODUCTION_BUILDING_SPRITE_CELL_HEIGHT - PRODUCTION_BUILDING_SPRITE_INSET_TOP - PRODUCTION_BUILDING_SPRITE_INSET_BOTTOM);
  const sizeX = (PRODUCTION_BUILDING_SPRITE_SHEET_WIDTH / visibleWidth) * 100;
  const sizeY = (PRODUCTION_BUILDING_SPRITE_SHEET_HEIGHT / visibleHeight) * 100;
  const maxOffsetX = Math.max(1, PRODUCTION_BUILDING_SPRITE_SHEET_WIDTH - visibleWidth);
  const maxOffsetY = Math.max(1, PRODUCTION_BUILDING_SPRITE_SHEET_HEIGHT - visibleHeight);
  const x = Math.max(0, Math.min(100, (frameX / maxOffsetX) * 100));
  const y = Math.max(0, Math.min(100, (frameY / maxOffsetY) * 100));
  return {
    backgroundImage: `url(${PRODUCTION_BUILDING_SPRITE_SHEET})`,
    backgroundSize: `${sizeX}% ${sizeY}%`,
    backgroundPosition: `${x}% ${y}%`,
    backgroundRepeat: "no-repeat"
  };
};

const BUILDABLE_ROOMS: RoomType[] = [
  "osmium",
  "adamantium",
  "magmatite",
  "neodyme",
  "chronium",
  "aetherium",
  "isotope7",
  "singulite",
  "quartiers_residentiels",
  "cantine_hydroponique",
  "centre_medical",
  "parc_orbital",
  "academie_technique",
  "universite_orbitale",
  "entrepot"
];

const MAIN_MISSION_TARGET_LEVEL = 50;
const MAIN_MISSION_REWARD_MIN = 50;
const MAIN_MISSION_REWARD_MAX = 500;

const MAIN_MISSION_ROOM_ORDER: RoomType[] = [
  "carbone",
  "titane",
  "entrepot",
  "quartiers_residentiels",
  "cantine_hydroponique",
  "osmium",
  "adamantium",
  "magmatite",
  "neodyme",
  "centre_medical",
  "parc_orbital",
  "chronium",
  "aetherium",
  "academie_technique",
  "isotope7",
  "universite_orbitale",
  "singulite"
];

const MAIN_MISSION_START_LEVEL: Partial<Record<RoomType, number>> = {
  carbone: 2,
  titane: 2,
  entrepot: 1,
  quartiers_residentiels: 1,
  cantine_hydroponique: 1,
  osmium: 1,
  adamantium: 1,
  magmatite: 1,
  neodyme: 1,
  centre_medical: 1,
  parc_orbital: 1,
  chronium: 1,
  aetherium: 1,
  academie_technique: 1,
  isotope7: 1,
  universite_orbitale: 1,
  singulite: 1
};

const MAIN_MISSION_PLAN: MainMissionDefinition[] = (() => {
  const plan: MainMissionDefinition[] = [];
  let order = 0;
  for (let targetLevel = 1; targetLevel <= MAIN_MISSION_TARGET_LEVEL; targetLevel += 1) {
    for (const roomType of MAIN_MISSION_ROOM_ORDER) {
      const startLevel = MAIN_MISSION_START_LEVEL[roomType] ?? 1;
      if (targetLevel < startLevel) continue;
      plan.push({
        id: `main_mission_${order}_${roomType}_${targetLevel}`,
        roomType,
        targetLevel
      });
      order += 1;
    }
  }
  return plan;
})();

const MAIN_MISSION_BY_ID: Record<string, MainMissionDefinition> = MAIN_MISSION_PLAN.reduce((acc, mission) => {
  acc[mission.id] = mission;
  return acc;
}, {} as Record<string, MainMissionDefinition>);

const defaultMainMissionState = (): MainMissionState => ({
  activeMissionIds: [],
  nextIndex: 0,
  completedCount: 0,
  skippedCount: 0,
  totalRewardCredits: 0,
  lastRewardCredits: 0,
  lastRewardCount: 0,
  lastCompletedAt: 0,
  bootstrapped: false,
  finished: false
});

const RESOURCE_BASE_PRODUCTION: Record<ResourceId, number> = {
  carbone: 3.0,
  titane: 1.55,
  osmium: 0.62,
  adamantium: 0.25,
  magmatite: 0.19,
  neodyme: 0.17,
  chronium: 0.12,
  aetherium: 0.09,
  isotope7: 0.06,
  singulite: 0.045
};

const LEVEL_EXPONENT = 1.15;
const BUILD_COST_MULTIPLIER = 1.55;
const BUILD_TIME_MULTIPLIER = 1.45;
const TECH_COST_MULTIPLIER = 1.6;
const TECH_TIME_MULTIPLIER = 1.5;
const STORAGE_BASE = 10000;
const STORAGE_MULTIPLIER = 1.6;
const PRODUCTION_BONUS = 0;

const POPULATION_BASE_GROWTH_RATE_PER_HOUR = 0.004;
const POPULATION_MIN_VALUE = 120;
const POPULATION_MAX_VALUE = 2500000;
const POPULATION_BASE_CAPACITY = 3000;
const POPULATION_BASE_FOOD_PER_HOUR = 900;
const POPULATION_BASE_FOOD_CAPACITY = 1800;
const POPULATION_EVENT_ROLL_INTERVAL_MS = 15 * 60 * 1000;
const POPULATION_CRISIS_ROLL_INTERVAL_MS = 10 * 60 * 1000;
const POPULATION_ONBOARDING_PROTECTION_DAYS = 60;
const POPULATION_ONBOARDING_PROTECTION_MS = POPULATION_ONBOARDING_PROTECTION_DAYS * 24 * 60 * 60 * 1000;
const POPULATION_ONBOARDING_START_TOTAL = 3000;
const POPULATION_ONBOARDING_START_FOOD = 18000;
const POPULATION_ONBOARDING_START_STABILITY = 88;
const POPULATION_ONBOARDING_CAPACITY_BUFFER = 800;
const POPULATION_ONBOARDING_FREE_WORKFORCE_SHARE = 0.28;

const POPULATION_DEFAULT_EVENT_DURATION_SEC: Record<PopulationEventType, number> = {
  festival_orbital: 2 * 60 * 60,
  epidemie: 90 * 60,
  greve_industrielle: 70 * 60,
  decouverte_scientifique: 2 * 60 * 60
};

const POPULATION_DEFAULT_CRISIS_DURATION_SEC: Record<PopulationCrisisType, number> = {
  emeute: 45 * 60,
  sabotage: 35 * 60,
  secession: 30 * 60
};

const POPULATION_CIVILIZATION_TIERS: CivilizationTier[] = [
  { id: "colonie", minPopulation: 0, nameFr: "Colonie", nameEn: "Colony" },
  { id: "station", minPopulation: 500, nameFr: "Station", nameEn: "Station" },
  { id: "cite_orbitale", minPopulation: 2000, nameFr: "Cite orbitale", nameEn: "Orbital City" },
  { id: "metropole_spatiale", minPopulation: 8000, nameFr: "Metropole spatiale", nameEn: "Space Metropolis" },
  { id: "megastructure_vivante", minPopulation: 20000, nameFr: "Megastructure vivante", nameEn: "Living Megastructure" }
];

const POPULATION_BUILDING_EFFECTS: Partial<
  Record<
    PopulationBuildingId,
    {
      housingCapPerLevel?: number;
      foodPerHourPerLevel?: number;
      growthBonusPerLevel?: number;
      stabilityPerLevel?: number;
      leisurePerLevel?: number;
      healthPerLevel?: number;
      attractivityPerLevel?: number;
      engineerSharePerLevel?: number;
      scientistSharePerLevel?: number;
    }
  >
> = {
  quartiers_residentiels: { housingCapPerLevel: 1400, stabilityPerLevel: 0.4, attractivityPerLevel: 0.0025 },
  cantine_hydroponique: { foodPerHourPerLevel: 980, stabilityPerLevel: 0.35, attractivityPerLevel: 0.0015 },
  centre_medical: { growthBonusPerLevel: 0.04, stabilityPerLevel: 0.45, healthPerLevel: 0.08 },
  parc_orbital: { stabilityPerLevel: 0.9, leisurePerLevel: 0.12, attractivityPerLevel: 0.0045 },
  academie_technique: { engineerSharePerLevel: 0.008, attractivityPerLevel: 0.0018 },
  universite_orbitale: { scientistSharePerLevel: 0.007, attractivityPerLevel: 0.0022 }
};

const POPULATION_WORKFORCE_REQUIREMENTS: Partial<Record<ResourceId, number>> = {
  carbone: 50,
  titane: 60,
  osmium: 80,
  adamantium: 120,
  magmatite: 145,
  neodyme: 155,
  chronium: 185,
  aetherium: 225,
  isotope7: 270,
  singulite: 330
};

const POPULATION_SHIP_CREW_REQUIREMENTS: Record<string, number> = {
  eclaireur_stellaire: 5,
  foudroyant: 8,
  aurore: 11,
  spectre: 15,
  tempest: 22,
  titanide: 30,
  colosse: 80,
  pegase: 3,
  argo: 6,
  arche_spatiale: 16
};

const POPULATION_BUILD_UNLOCK_MIN: Partial<Record<PopulationBuildingId, number>> = {
  quartiers_residentiels: 0,
  cantine_hydroponique: 0,
  centre_medical: 500,
  parc_orbital: 500,
  academie_technique: 2000,
  universite_orbitale: 8000
};

const clampNumber = (value: number, min: number, max: number) => Math.max(min, Math.min(max, value));
const randomIntBetween = (min: number, max: number) => {
  const lo = Math.ceil(Math.min(min, max));
  const hi = Math.floor(Math.max(min, max));
  return Math.floor(Math.random() * (hi - lo + 1)) + lo;
};

const populationTierForValue = (population: number): CivilizationTier => {
  const safe = Math.max(0, Math.floor(Number(population || 0)));
  let current = POPULATION_CIVILIZATION_TIERS[0];
  for (const tier of POPULATION_CIVILIZATION_TIERS) {
    if (safe >= tier.minPopulation) current = tier;
  }
  return current;
};

const isPopulationBuildingUnlocked = (roomType: RoomType, population: number): boolean => {
  if (!(roomType in POPULATION_BUILD_UNLOCK_MIN)) return true;
  const minPopulation = POPULATION_BUILD_UNLOCK_MIN[roomType as PopulationBuildingId] ?? 0;
  return Math.max(0, Math.floor(Number(population || 0))) >= minPopulation;
};

const defaultPopulationState = (): PopulationState => {
  const now = Date.now();
  return {
    total: POPULATION_ONBOARDING_START_TOTAL,
    foodStock: POPULATION_ONBOARDING_START_FOOD,
    stability: POPULATION_ONBOARDING_START_STABILITY,
    isFamine: false,
    onboardingProtectionUntil: now + POPULATION_ONBOARDING_PROTECTION_MS,
    lastTickAt: now,
    lastEventRollAt: now,
    lastCrisisRollAt: now,
    activeEvent: null,
    activeCrisis: null
  };
};

const computeProductionPerSecond = (resourceId: ResourceId, level: number, bonusTotal = PRODUCTION_BONUS) =>
  RESOURCE_BASE_PRODUCTION[resourceId] * Math.pow(Math.max(1, level), LEVEL_EXPONENT) * (1 + bonusTotal);

const buildRoomLevelMap = (rooms: Room[]): Partial<Record<RoomType, number>> => {
  const out: Partial<Record<RoomType, number>> = {};
  for (const room of rooms) {
    out[room.type] = Math.max(out[room.type] ?? 0, room.level);
  }
  return out;
};

const getPopulationSnapshot = (
  rooms: Room[],
  state: PopulationState,
  unlockedResourceCount: number,
  baseProductionRates: Record<string, number>
): PopulationSnapshot => {
  const nowMs = Date.now();
  const onboardingProtectionUntil = Math.max(0, Math.floor(Number(state.onboardingProtectionUntil || 0)));
  const onboardingProtectionActive = onboardingProtectionUntil > nowMs;
  const onboardingProtectionRemainingSec = onboardingProtectionActive
    ? Math.max(0, Math.floor((onboardingProtectionUntil - nowMs) / 1000))
    : 0;
  const seededPopulation = onboardingProtectionActive
    ? Math.max(Math.floor(Number(state.total || 0)), POPULATION_ONBOARDING_START_TOTAL)
    : Math.floor(Number(state.total || 0));
  const nowTotalPopulation = clampNumber(seededPopulation, POPULATION_MIN_VALUE, POPULATION_MAX_VALUE);
  const roomLevels = buildRoomLevelMap(rooms);
  const popEffects = {
    housingCap: 0,
    foodPerHour: 0,
    growthBonus: 0,
    stability: 0,
    leisure: 0,
    health: 0,
    attractivity: 0,
    engineerShareBonus: 0,
    scientistShareBonus: 0
  };

  for (const [roomType, levelRaw] of Object.entries(roomLevels)) {
    const level = Math.max(0, Math.floor(Number(levelRaw || 0)));
    if (level <= 0) continue;
    const effects = POPULATION_BUILDING_EFFECTS[roomType as PopulationBuildingId];
    if (!effects) continue;
    popEffects.housingCap += (effects.housingCapPerLevel ?? 0) * level;
    popEffects.foodPerHour += (effects.foodPerHourPerLevel ?? 0) * level;
    popEffects.growthBonus += (effects.growthBonusPerLevel ?? 0) * level;
    popEffects.stability += (effects.stabilityPerLevel ?? 0) * level;
    popEffects.leisure += (effects.leisurePerLevel ?? 0) * level;
    popEffects.health += (effects.healthPerLevel ?? 0) * level;
    popEffects.attractivity += (effects.attractivityPerLevel ?? 0) * level;
    popEffects.engineerShareBonus += (effects.engineerSharePerLevel ?? 0) * level;
    popEffects.scientistShareBonus += (effects.scientistSharePerLevel ?? 0) * level;
  }

  const baseHousingCapacity = Math.max(
    POPULATION_BASE_CAPACITY,
    Math.floor(POPULATION_BASE_CAPACITY + popEffects.housingCap + (roomLevels.entrepot ?? 0) * 260)
  );
  const housingCapacity = onboardingProtectionActive
    ? Math.max(baseHousingCapacity, nowTotalPopulation + POPULATION_ONBOARDING_CAPACITY_BUFFER)
    : baseHousingCapacity;
  const baseFoodCapacity = Math.max(
    POPULATION_BASE_FOOD_CAPACITY,
    Math.floor(
      POPULATION_BASE_FOOD_CAPACITY +
        (roomLevels.cantine_hydroponique ?? 0) * 1900 +
        (roomLevels.quartiers_residentiels ?? 0) * 220
    )
  );
  const foodCapacity = onboardingProtectionActive
    ? Math.max(baseFoodCapacity, Math.floor(nowTotalPopulation * 8))
    : baseFoodCapacity;
  const onboardingFoodSupportPerHour = onboardingProtectionActive ? Math.floor(nowTotalPopulation * 1.05) : 0;
  const foodProductionPerHour = Math.max(0, POPULATION_BASE_FOOD_PER_HOUR + popEffects.foodPerHour + onboardingFoodSupportPerHour);
  const foodConsumptionPerHour = Math.max(0, nowTotalPopulation);
  const foodBalancePerHour = foodProductionPerHour - foodConsumptionPerHour;
  const foodShortage = !onboardingProtectionActive && state.foodStock <= 0 && foodBalancePerHour < 0;
  const isOverCapacity = nowTotalPopulation > housingCapacity;

  const engineerShareBase = 0.2 + popEffects.engineerShareBonus;
  const scientistShareBase = 0.1 + popEffects.scientistShareBonus;
  const specialistMax = 0.58;
  let engineerShare = Math.max(0.12, engineerShareBase);
  let scientistShare = Math.max(0.08, scientistShareBase);
  const specialistSum = engineerShare + scientistShare;
  if (specialistSum > specialistMax) {
    const scale = specialistMax / specialistSum;
    engineerShare *= scale;
    scientistShare *= scale;
  }
  let workerShare = Math.max(0.35, 1 - engineerShare - scientistShare);
  const shareSum = workerShare + engineerShare + scientistShare;
  workerShare /= shareSum;
  engineerShare /= shareSum;
  scientistShare /= shareSum;

  const engineers = Math.floor(nowTotalPopulation * engineerShare);
  const scientists = Math.floor(nowTotalPopulation * scientistShare);
  const workers = Math.max(0, nowTotalPopulation - engineers - scientists);

  let requiredWorkersRaw = 0;
  for (const resourceId of Object.keys(POPULATION_WORKFORCE_REQUIREMENTS) as ResourceId[]) {
    const roomLevel = Math.max(0, Math.floor(Number(roomLevels[resourceId] || 0)));
    if (roomLevel <= 0) continue;
    const baseReq = POPULATION_WORKFORCE_REQUIREMENTS[resourceId] ?? 0;
    if (baseReq <= 0) continue;
    const scaled = baseReq * (1 + (roomLevel - 1) * 0.15);
    requiredWorkersRaw += Math.max(0, Math.floor(scaled));
  }
  const softRequiredCap = Math.max(0, Math.floor(workers * (1 - POPULATION_ONBOARDING_FREE_WORKFORCE_SHARE)));
  const requiredWorkers = onboardingProtectionActive ? Math.min(requiredWorkersRaw, softRequiredCap) : requiredWorkersRaw;
  const availableWorkers = Math.max(0, workers - requiredWorkers);
  const workforceMultiplier =
    requiredWorkersRaw <= 0 || onboardingProtectionActive
      ? 1
      : clampNumber(workers / Math.max(1, requiredWorkersRaw), 0.12, 1);

  const popProductionBonusPct = Math.floor(nowTotalPopulation / 1000) * 0.01;
  const constructionSpeedBonusPct = Math.floor(engineers / 500) * 0.01;
  const researchSpeedBonusPct = Math.floor(scientists / 300) * 0.01;

  const baseStabilityValue = clampNumber(Number(state.stability || 0), 0, 100);
  const stabilityValue = onboardingProtectionActive
    ? Math.max(baseStabilityValue, POPULATION_ONBOARDING_START_STABILITY)
    : baseStabilityValue;
  let stabilityBand: PopulationSnapshot["stabilityBand"] = "normal";
  let stabilityProductionPct = 0;
  if (stabilityValue >= 90) {
    stabilityBand = "excellent";
    stabilityProductionPct = 0.08;
  } else if (stabilityValue >= 70) {
    stabilityBand = "normal";
    stabilityProductionPct = 0;
  } else if (stabilityValue >= 50) {
    stabilityBand = "warning";
    stabilityProductionPct = -0.06;
  } else if (stabilityValue >= 30) {
    stabilityBand = "trouble";
    stabilityProductionPct = -0.15;
  } else {
    stabilityBand = "revolt";
    stabilityProductionPct = -0.34;
  }

  let eventProductionPct = 0;
  let eventResearchPct = 0;
  if (state.activeEvent) {
    if (state.activeEvent.type === "festival_orbital") {
      eventProductionPct += 0.05;
    } else if (state.activeEvent.type === "decouverte_scientifique") {
      eventResearchPct += 0.15;
    } else if (!onboardingProtectionActive && state.activeEvent.type === "epidemie") {
      eventProductionPct -= 0.08;
    } else if (!onboardingProtectionActive && state.activeEvent.type === "greve_industrielle") {
      eventProductionPct -= 0.2;
    }
  }

  let crisisPenaltyPct = 0;
  let crisisConstructionPenalty = 0;
  if (state.activeCrisis && !onboardingProtectionActive) {
    if (state.activeCrisis.type === "emeute") {
      crisisPenaltyPct -= 0.35;
      crisisConstructionPenalty += 0.08;
    } else if (state.activeCrisis.type === "sabotage") {
      crisisPenaltyPct -= 0.5;
      crisisConstructionPenalty += 0.12;
    } else if (state.activeCrisis.type === "secession") {
      crisisPenaltyPct -= 0.22;
      crisisConstructionPenalty += 0.05;
    }
  }

  const overCapacityPenaltyPct = onboardingProtectionActive ? 0 : isOverCapacity ? -0.25 : 0;
  const faminePenaltyPct = onboardingProtectionActive ? 0 : foodShortage ? -0.18 : 0;
  const productionMultiplier = clampNumber(
    (1 +
      popProductionBonusPct +
      stabilityProductionPct +
      eventProductionPct +
      crisisPenaltyPct +
      overCapacityPenaltyPct +
      faminePenaltyPct) *
      workforceMultiplier,
    0.02,
    3
  );

  const constructionTimeFactor = clampNumber(
    1 - constructionSpeedBonusPct + crisisConstructionPenalty,
    0.45,
    1.65
  );
  const researchTimeFactor = clampNumber(
    1 / Math.max(0.2, 1 + researchSpeedBonusPct + eventResearchPct),
    0.4,
    1.8
  );

  const housingScore = clampNumber((housingCapacity - nowTotalPopulation) / Math.max(1, housingCapacity), -1, 1);
  const healthScore = clampNumber(popEffects.health, -1, 2);
  const leisureScore = clampNumber(popEffects.leisure, -1, 2.5);
  const baseProductionTotal = Object.values(baseProductionRates).reduce((sum, val) => sum + (Number(val) || 0), 0);
  const richnessScore = clampNumber(baseProductionTotal / 180, 0, 1.5);
  const attractivity = clampNumber(
    ((stabilityValue - 55) / 100) * 0.02 + leisureScore * 0.004 + healthScore * 0.003 + richnessScore * 0.003 + popEffects.attractivity,
    -0.01,
    0.06
  );
  const migrationPerHour = Math.max(0, nowTotalPopulation * Math.max(0, attractivity));

  const growthBasePerHour = nowTotalPopulation * POPULATION_BASE_GROWTH_RATE_PER_HOUR;
  let growthPerHour = 0;
  if (onboardingProtectionActive || (!isOverCapacity && !foodShortage)) {
    const stabilityGrowthFactor = clampNumber(0.55 + stabilityValue / 100, 0.2, 1.65);
    growthPerHour =
      growthBasePerHour * (1 + popEffects.growthBonus + healthScore * 0.2 + leisureScore * 0.1) * stabilityGrowthFactor +
      migrationPerHour;
  }

  return {
    totalPopulation: nowTotalPopulation,
    capacity: housingCapacity,
    growthPerHour: Math.max(0, growthPerHour),
    migrationPerHour,
    foodStock: clampNumber(Number(state.foodStock || 0), 0, foodCapacity),
    foodCapacity,
    foodProductionPerHour,
    foodConsumptionPerHour,
    foodBalancePerHour,
    stability: stabilityValue,
    workers,
    engineers,
    scientists,
    requiredWorkers,
    availableWorkers,
    workforceMultiplier,
    productionMultiplier,
    constructionTimeFactor,
    researchTimeFactor,
    productionBonusPct: (productionMultiplier - 1) * 100,
    constructionSpeedBonusPct: constructionSpeedBonusPct * 100,
    researchSpeedBonusPct: (1 / researchTimeFactor - 1) * 100,
    stabilityBand,
    isOverCapacity,
    foodShortage,
    housingScore,
    healthScore,
    leisureScore,
    attractivity,
    efficiencyPct: (productionMultiplier - 1) * 100,
    civilizationTier: populationTierForValue(nowTotalPopulation),
    activeEvent: state.activeEvent,
    activeCrisis: onboardingProtectionActive ? null : state.activeCrisis,
    crisisPenaltyPct: crisisPenaltyPct * 100,
    eventProductionPct: eventProductionPct * 100,
    eventResearchPct: eventResearchPct * 100,
    onboardingProtectionActive,
    onboardingProtectionRemainingSec
  };
};

const pickWeighted = <T,>(rows: Array<{ value: T; weight: number }>): T => {
  const safe = rows.filter((row) => Number.isFinite(row.weight) && row.weight > 0);
  if (safe.length <= 0) return rows[0].value;
  const total = safe.reduce((sum, row) => sum + row.weight, 0);
  let roll = Math.random() * total;
  for (const row of safe) {
    roll -= row.weight;
    if (roll <= 0) return row.value;
  }
  return safe[safe.length - 1].value;
};

const nextPopulationEvent = (nowMs: number): PopulationEventState => {
  const type = pickWeighted<PopulationEventType>([
    { value: "festival_orbital", weight: 28 },
    { value: "epidemie", weight: 17 },
    { value: "greve_industrielle", weight: 21 },
    { value: "decouverte_scientifique", weight: 14 }
  ]);
  const durationSec = POPULATION_DEFAULT_EVENT_DURATION_SEC[type] ?? 3600;
  return { type, startedAt: nowMs, endsAt: nowMs + durationSec * 1000 };
};

const nextPopulationCrisis = (nowMs: number): PopulationCrisisState => {
  const type = pickWeighted<PopulationCrisisType>([
    { value: "emeute", weight: 45 },
    { value: "sabotage", weight: 35 },
    { value: "secession", weight: 20 }
  ]);
  const durationSec = POPULATION_DEFAULT_CRISIS_DURATION_SEC[type] ?? 1800;
  return { type, startedAt: nowMs, endsAt: nowMs + durationSec * 1000 };
};

const populationEventLabel = (eventType: PopulationEventType, language: UILanguage) => {
  const map: Record<PopulationEventType, { fr: string; en: string }> = {
    festival_orbital: { fr: "Festival orbital", en: "Orbital Festival" },
    epidemie: { fr: "Epidemie", en: "Epidemic" },
    greve_industrielle: { fr: "Greve industrielle", en: "Industrial Strike" },
    decouverte_scientifique: { fr: "Decouverte scientifique", en: "Scientific Breakthrough" }
  };
  return language === "en" ? map[eventType].en : map[eventType].fr;
};

const populationCrisisLabel = (crisisType: PopulationCrisisType, language: UILanguage) => {
  const map: Record<PopulationCrisisType, { fr: string; en: string }> = {
    emeute: { fr: "Emeute", en: "Riot" },
    sabotage: { fr: "Sabotage", en: "Sabotage" },
    secession: { fr: "Secession", en: "Secession" }
  };
  return language === "en" ? map[crisisType].en : map[crisisType].fr;
};

const populationStabilityBandLabel = (band: PopulationSnapshot["stabilityBand"], language: UILanguage) => {
  const map: Record<PopulationSnapshot["stabilityBand"], { fr: string; en: string }> = {
    excellent: { fr: "Excellent", en: "Excellent" },
    normal: { fr: "Stable", en: "Stable" },
    warning: { fr: "Fragile", en: "Fragile" },
    trouble: { fr: "Troubles", en: "Unrest" },
    revolt: { fr: "Revolte", en: "Revolt" }
  };
  return language === "en" ? map[band].en : map[band].fr;
};

type ResourceCost = Partial<Record<ResourceId, number>>;

type HangarCategory = "ship" | "defense";

type HangarUnitDef = {
  id: string;
  category: HangarCategory;
  name: string;
  description: string;
  buildSeconds: number;
  cost: ResourceCost;
  force: number;
  endurance: number;
  speed?: number;
  capacity?: number;
  quantumPerHour?: number;
  range?: number;
  reload?: string;
};

type HangarQueueItem = {
  id: string;
  unitId: string;
  category: HangarCategory;
  quantity: number;
  startAt: number;
  endAt: number;
  batchCost: ResourceCost;
};

type HangarRpcSnapshot = {
  queue: HangarQueueItem[];
  inventory: Record<string, number>;
  resources: Record<string, number>;
  serverNowTs: number;
};

const HANGAR_UNIT_DEFS: HangarUnitDef[] = [
  {
    id: "eclaireur_stellaire",
    category: "ship",
    name: "Eclaireur Stellaire",
    description: "Reconnaissance rapide, ideal contre transport non escorte.",
    buildSeconds: 60,
    cost: { carbone: 2000, titane: 800 },
    force: 5,
    endurance: 40,
    speed: 120,
    capacity: 10,
    quantumPerHour: 1
  },
  {
    id: "foudroyant",
    category: "ship",
    name: "Foudroyant",
    description: "Intercepteur agile, excellent contre eclaireurs.",
    buildSeconds: 90,
    cost: { carbone: 3500, titane: 1200, osmium: 200 },
    force: 8,
    endurance: 65,
    speed: 160,
    capacity: 12,
    quantumPerHour: 1.2
  },
  {
    id: "aurore",
    category: "ship",
    name: "Aurore",
    description: "Corvette de frappe rapide a longue projection.",
    buildSeconds: 180,
    cost: { carbone: 8000, titane: 3000, osmium: 600 },
    force: 15,
    endurance: 120,
    speed: 450,
    capacity: 7,
    quantumPerHour: 2
  },
  {
    id: "spectre",
    category: "ship",
    name: "Spectre",
    description: "Assaut polyvalent, solide en engagements moyens.",
    buildSeconds: 300,
    cost: { carbone: 15000, titane: 6000, osmium: 2000, adamantium: 200 },
    force: 25,
    endurance: 260,
    speed: 900,
    capacity: 5,
    quantumPerHour: 3
  },
  {
    id: "tempest",
    category: "ship",
    name: "Tempest",
    description: "Frigate offensive haute cadence pour escadres lourdes.",
    buildSeconds: 420,
    cost: { carbone: 28000, titane: 12000, osmium: 4500, adamantium: 500 },
    force: 45,
    endurance: 550,
    speed: 1200,
    capacity: 4,
    quantumPerHour: 4
  },
  {
    id: "titanide",
    category: "ship",
    name: "Titanide",
    description: "Cuirasse median specialise contre fregates/corvettes.",
    buildSeconds: 720,
    cost: { carbone: 60000, titane: 25000, osmium: 10000, adamantium: 1500 },
    force: 85,
    endurance: 1100,
    speed: 850,
    capacity: 8,
    quantumPerHour: 6
  },
  {
    id: "colosse",
    category: "ship",
    name: "Colosse",
    description: "Plateforme lourde de percee, immense endurance.",
    buildSeconds: 1200,
    cost: { carbone: 120000, titane: 50000, osmium: 20000, adamantium: 3000 },
    force: 160,
    endurance: 2200,
    speed: 650,
    capacity: 12,
    quantumPerHour: 8
  },
  {
    id: "pegase",
    category: "ship",
    name: "Pegase",
    description: "Transport leger pour logistique rapide.",
    buildSeconds: 80,
    cost: { carbone: 5000, titane: 2000 },
    force: 0,
    endurance: 50,
    speed: 80,
    capacity: 50,
    quantumPerHour: 0.5
  },
  {
    id: "argo",
    category: "ship",
    name: "Argo",
    description: "Transport moyen pour convois de ressources.",
    buildSeconds: 180,
    cost: { carbone: 12000, titane: 5000, osmium: 500 },
    force: 0,
    endurance: 120,
    speed: 70,
    capacity: 200,
    quantumPerHour: 1
  },
  {
    id: "arche_spatiale",
    category: "ship",
    name: "Arche Spatiale",
    description: "Cargo lourd a tres haute capacite.",
    buildSeconds: 360,
    cost: { carbone: 25000, titane: 10000, osmium: 2500 },
    force: 0,
    endurance: 300,
    speed: 50,
    capacity: 500,
    quantumPerHour: 2
  },
  {
    id: "projecteur_photonique",
    category: "defense",
    name: "Projecteur Photonique",
    description: "Tourelle anti-leger a haute precision.",
    buildSeconds: 90,
    cost: { carbone: 2500, titane: 1000 },
    force: 15,
    endurance: 300,
    range: 5,
    reload: "3 sec"
  },
  {
    id: "lame_de_plasma",
    category: "defense",
    name: "Lame de Plasma",
    description: "Defense intermediaire contre escadres d'assaut.",
    buildSeconds: 240,
    cost: { carbone: 8000, titane: 3500, osmium: 500 },
    force: 45,
    endurance: 900,
    range: 7,
    reload: "5 sec"
  },
  {
    id: "lanceur_orbitral",
    category: "defense",
    name: "Lanceur Orbitral",
    description: "Batterie lourde de defense orbitale.",
    buildSeconds: 480,
    cost: { carbone: 15000, titane: 6000, osmium: 2000, adamantium: 200 },
    force: 90,
    endurance: 1800,
    range: 9,
    reload: "10 sec"
  },
  {
    id: "champ_aegis",
    category: "defense",
    name: "Champ Aegis",
    description: "Bouclier passif augmentant la tenue defensive.",
    buildSeconds: 900,
    cost: { carbone: 50000, titane: 20000, osmium: 5000, adamantium: 1000 },
    force: 0,
    endurance: 4000,
    range: 0,
    reload: "Passif"
  },
  {
    id: "tourelle_rafale",
    category: "defense",
    name: "Tourelle Cinetique Rafale",
    description: "Anti-escortes legeres et anti-spam.",
    buildSeconds: 120,
    cost: { carbone: 4000, titane: 1800 },
    force: 22,
    endurance: 450,
    range: 5,
    reload: "2 sec"
  },
  {
    id: "batterie_eclat",
    category: "defense",
    name: "Batterie Flak Eclat",
    description: "Defense anti-escadrilles rapides.",
    buildSeconds: 180,
    cost: { carbone: 6000, titane: 2500, osmium: 200 },
    force: 30,
    endurance: 650,
    range: 6,
    reload: "3 sec"
  },
  {
    id: "canon_ion_aiguillon",
    category: "defense",
    name: "Canon ION Aiguillon",
    description: "Plateforme polyvalente contre cibles moyennes.",
    buildSeconds: 260,
    cost: { carbone: 12000, titane: 5000, osmium: 800 },
    force: 55,
    endurance: 1100,
    range: 7,
    reload: "6 sec"
  },
  {
    id: "mine_orbitale_veille",
    category: "defense",
    name: "Mine Orbitale Veille",
    description: "Fort impact ponctuel, cadence lente.",
    buildSeconds: 360,
    cost: { carbone: 18000, titane: 7000, osmium: 1600, adamantium: 100 },
    force: 110,
    endurance: 900,
    range: 3,
    reload: "12 sec"
  },
  {
    id: "canon_rail_longue_vue",
    category: "defense",
    name: "Canon Rail Longue-Vue",
    description: "Longue portee specialise anti-lourd.",
    buildSeconds: 540,
    cost: { carbone: 30000, titane: 12000, osmium: 4000, adamantium: 400 },
    force: 140,
    endurance: 2200,
    range: 10,
    reload: "14 sec"
  },
  {
    id: "projecteur_emp_silence",
    category: "defense",
    name: "Projecteur EMP Silence",
    description: "Controle electronique: ralentit les flottes ennemies.",
    buildSeconds: 600,
    cost: { carbone: 24000, titane: 10000, osmium: 2000, neodyme: 600 },
    force: 35,
    endurance: 1600,
    range: 8,
    reload: "10 sec"
  },
  {
    id: "mur_photonique_prisme",
    category: "defense",
    name: "Mur Photonique Prisme",
    description: "Blindage passif massif anti-raid.",
    buildSeconds: 720,
    cost: { carbone: 40000, titane: 18000, osmium: 6000, adamantium: 800 },
    force: 0,
    endurance: 7500,
    range: 0,
    reload: "Passif"
  },
  {
    id: "lance_gravitationnel_ancre",
    category: "defense",
    name: "Lance Gravitationnel Ancre",
    description: "Defense endgame anti-capitales.",
    buildSeconds: 960,
    cost: { carbone: 90000, titane: 45000, osmium: 12000, adamantium: 2500, aetherium: 600 },
    force: 240,
    endurance: 5000,
    range: 9,
    reload: "18 sec"
  }
];

const HANGAR_UNIT_NAME_EN: Record<string, string> = {
  eclaireur_stellaire: "Stellar Scout",
  foudroyant: "Thunderbolt",
  aurore: "Aurora",
  spectre: "Specter",
  tempest: "Tempest",
  titanide: "Titanid",
  colosse: "Colossus",
  pegase: "Pegasus",
  argo: "Argo",
  arche_spatiale: "Space Ark",
  projecteur_photonique: "Photon Projector",
  lame_de_plasma: "Plasma Blade",
  lanceur_orbitral: "Orbital Launcher",
  champ_aegis: "Aegis Field",
  tourelle_rafale: "Rafale Kinetic Turret",
  batterie_eclat: "Shatter Flak Battery",
  canon_ion_aiguillon: "Stinger ION Cannon",
  mine_orbitale_veille: "Sentinel Orbital Mine",
  canon_rail_longue_vue: "Long-View Rail Cannon",
  projecteur_emp_silence: "Silence EMP Projector",
  mur_photonique_prisme: "Prism Photonic Wall",
  lance_gravitationnel_ancre: "Anchor Gravitational Lance"
};

const HANGAR_UNIT_DESCRIPTION_EN: Record<string, string> = {
  eclaireur_stellaire: "Fast reconnaissance, ideal against unescorted transports.",
  foudroyant: "Agile interceptor, excellent against scouts.",
  aurore: "Fast strike corvette with long projection range.",
  spectre: "Versatile assault ship, strong in medium engagements.",
  tempest: "High-rate offensive frigate for heavy squadrons.",
  titanide: "Midline armor ship specialized against frigates/corvettes.",
  colosse: "Heavy breakthrough platform with massive endurance.",
  pegase: "Light transport for rapid logistics.",
  argo: "Medium transport for resource convoys.",
  arche_spatiale: "Heavy cargo with very high capacity.",
  projecteur_photonique: "High-precision anti-light turret.",
  lame_de_plasma: "Mid-tier defense against assault squadrons.",
  lanceur_orbitral: "Heavy orbital defense battery.",
  champ_aegis: "Passive shield that increases defensive resilience.",
  tourelle_rafale: "Anti-light escort and anti-swarm platform.",
  batterie_eclat: "Defense specialized against fast squadrons.",
  canon_ion_aiguillon: "Versatile platform against medium targets.",
  mine_orbitale_veille: "High burst impact with slow cadence.",
  canon_rail_longue_vue: "Long-range platform specialized against heavy units.",
  projecteur_emp_silence: "Electronic control: slows enemy fleets.",
  mur_photonique_prisme: "Massive passive anti-raid armor.",
  lance_gravitationnel_ancre: "Endgame anti-capital defense platform."
};

const hangarUnitDisplayName = (unitId: string, fallback: string, language: UILanguage): string =>
  language === "en" ? HANGAR_UNIT_NAME_EN[unitId] ?? fallback : fallback;

const hangarUnitDisplayDescription = (unitId: string, fallback: string, language: UILanguage): string =>
  language === "en" ? HANGAR_UNIT_DESCRIPTION_EN[unitId] ?? fallback : fallback;

const HANGAR_SHIP_IMAGE_MAP: Record<string, string> = {
  eclaireur_stellaire: "/room-images/Eclaireur-Stellaire.png",
  foudroyant: "/room-images/Foudroyant.png",
  aurore: "/room-images/Aurore.png",
  spectre: "/room-images/Spectre.png",
  tempest: "/room-images/Tempest.png",
  titanide: "/room-images/Titanide.png",
  colosse: "/room-images/Colosse.png",
  pegase: "/room-images/Pegase.png",
  argo: "/room-images/Argo.png",
  arche_spatiale: "/room-images/Arche-Spatiale.png"
};

const HANGAR_DEFENSE_IMAGE_MAP: Record<string, string> = {
  projecteur_photonique: "/room-images/Projecteur-Photonique.png",
  lame_de_plasma: "/room-images/Lame-Plasma.png",
  lanceur_orbitral: "/room-images/Lanceur-Orbitral.png",
  champ_aegis: "/room-images/Champ-Aegis.png"
};

const BASE_BUILDING_RESOURCE_COSTS: Record<RoomType, ResourceCost> = {
  entrance: {},
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
  quartiers_residentiels: { carbone: 3000, titane: 1200 },
  cantine_hydroponique: { carbone: 2500, titane: 1100 },
  centre_medical: { carbone: 3800, titane: 1500, osmium: 300 },
  parc_orbital: { carbone: 3200, titane: 1300, osmium: 200 },
  academie_technique: { carbone: 6200, titane: 2400, osmium: 600 },
  universite_orbitale: { carbone: 9000, titane: 3200, osmium: 1200, adamantium: 100 },
  entrepot: { carbone: 1000, titane: 500 }
};

const TECHNOLOGY_DEFS: TechnologyDef[] = [
  {
    id: "optimisation_extractive",
    name: "Optimisation Extractive",
    category: "eco",
    description: "+3% production Carbone & Titane / niveau",
    effectPerLevel: "+3% CAR/TIT",
    baseCost: { carbone: 10000, titane: 5000 },
    baseTimeSec: 15 * 60
  },
  {
    id: "compression_minerale",
    name: "Compression Minerale",
    category: "eco",
    description: "+3% production Osmium & Adamantium / niveau",
    effectPerLevel: "+3% OSM/ADA",
    baseCost: { carbone: 25000, titane: 12000, osmium: 3000 },
    baseTimeSec: 30 * 60
  },
  {
    id: "raffinement_avance",
    name: "Raffinement Avance",
    category: "eco",
    description: "+4% production Magmatite & Neodyme / niveau",
    effectPerLevel: "+4% MAG/NEO",
    baseCost: { carbone: 40000, titane: 20000, osmium: 5000 },
    baseTimeSec: 45 * 60,
    maxLevel: 25
  },
  {
    id: "physique_quantique_appliquee",
    name: "Physique Quantique Appliquee",
    category: "eco",
    description: "+4% production Chronium/Aetherium/Isotope-7/Singulite / niveau",
    effectPerLevel: "+4% CHR/AET/ISO/SIN",
    baseCost: { carbone: 120000, titane: 50000, osmium: 15000, adamantium: 2000 },
    baseTimeSec: 90 * 60,
    maxLevel: 20
  },
  {
    id: "automatisation_industrielle",
    name: "Automatisation Industrielle",
    category: "eco",
    description: "-2% cout batiments / niveau",
    effectPerLevel: "-2% cout batiments",
    baseCost: { carbone: 60000, titane: 30000, osmium: 10000 },
    baseTimeSec: 60 * 60,
    maxLevel: 15
  },
  {
    id: "optimisation_logistique",
    name: "Optimisation Logistique",
    category: "eco",
    description: "-2% temps de construction batiments / niveau",
    effectPerLevel: "-2% temps batiments",
    baseCost: { carbone: 80000, titane: 40000, osmium: 15000 },
    baseTimeSec: 75 * 60,
    maxLevel: 15
  },
  {
    id: "propulsion_stellaire",
    name: "Propulsion Stellaire",
    category: "military",
    description: "+4% vitesse vaisseaux / niveau",
    effectPerLevel: "+4% vitesse flotte",
    baseCost: { carbone: 30000, titane: 15000, neodyme: 4000 },
    baseTimeSec: 40 * 60,
    maxLevel: 30
  },
  {
    id: "moteurs_flux_neodyme",
    name: "Moteurs a Flux Neodyme",
    category: "military",
    description: "+2% vitesse et -2% conso energie quantique / niveau",
    effectPerLevel: "+2% vitesse, -2% conso",
    baseCost: { carbone: 90000, titane: 40000, neodyme: 8000 },
    baseTimeSec: 75 * 60,
    maxLevel: 20,
    requires: [{ id: "propulsion_stellaire", level: 5 }]
  },
  {
    id: "balistique_avancee",
    name: "Balistique Avancee",
    category: "military",
    description: "+3% force vaisseaux / niveau",
    effectPerLevel: "+3% force flotte",
    baseCost: { carbone: 50000, titane: 20000, osmium: 6000 },
    baseTimeSec: 45 * 60
  },
  {
    id: "blindage_composite",
    name: "Blindage Composite",
    category: "military",
    description: "+3% endurance vaisseaux / niveau",
    effectPerLevel: "+3% endurance flotte",
    baseCost: { carbone: 70000, titane: 30000, adamantium: 10000 },
    baseTimeSec: 50 * 60
  },
  {
    id: "ciblage_predictif",
    name: "Ciblage Predictif",
    category: "military",
    description: "Reduit la variance combat jusqu'a +/-4%",
    effectPerLevel: "-0.3% variance (min +/-4%)",
    baseCost: { carbone: 120000, titane: 60000, chronium: 5000 },
    baseTimeSec: 95 * 60,
    maxLevel: 20
  },
  {
    id: "renforcement_orbital",
    name: "Renforcement Orbital",
    category: "defense",
    description: "+4% endurance defenses / niveau",
    effectPerLevel: "+4% endurance defenses",
    baseCost: { carbone: 85000, titane: 35000, osmium: 8000 },
    baseTimeSec: 70 * 60,
    maxLevel: 30
  },
  {
    id: "architecture_defensive",
    name: "Architecture Defensive",
    category: "defense",
    description: "+2% endurance defenses / niveau et socle des defenses avancees",
    effectPerLevel: "+2% endurance defenses",
    baseCost: { carbone: 60000, titane: 30000, osmium: 8000 },
    baseTimeSec: 60 * 60,
    maxLevel: 10
  },
  {
    id: "amplification_photonique",
    name: "Amplification Photonique",
    category: "defense",
    description: "+4% degats Projecteur Photonique / niveau",
    effectPerLevel: "+4% degats photonique",
    baseCost: { carbone: 95000, titane: 38000, osmium: 9000 },
    baseTimeSec: 70 * 60,
    maxLevel: 30
  },
  {
    id: "stabilisation_plasma",
    name: "Stabilisation Plasma",
    category: "defense",
    description: "+5% degats Lame de Plasma / niveau et debloque Lame de Plasma",
    effectPerLevel: "+5% plasma",
    baseCost: { carbone: 100000, titane: 40000, aetherium: 8000 },
    baseTimeSec: 80 * 60,
    maxLevel: 20
  },
  {
    id: "balistique_orbitale",
    name: "Balistique Orbitale",
    category: "defense",
    description: "+4% degats Lanceur Orbitral / niveau et debloque les plateformes balistiques",
    effectPerLevel: "+4% lanceur orbital",
    baseCost: { carbone: 90000, titane: 45000, osmium: 12000, neodyme: 800 },
    baseTimeSec: 80 * 60,
    maxLevel: 20,
    requires: [{ id: "renforcement_orbital", level: 3 }]
  },
  {
    id: "controle_electromagnetique",
    name: "Controle Electromagnetique",
    category: "defense",
    description: "+4% effet EMP / niveau et debloque Projecteur EMP Silence",
    effectPerLevel: "+4% effet EMP",
    baseCost: { carbone: 80000, titane: 35000, osmium: 5000, neodyme: 1000 },
    baseTimeSec: 80 * 60,
    maxLevel: 15
  },
  {
    id: "generateur_aegis",
    name: "Generateur Aegis",
    category: "defense",
    description: "+3% capacite bouclier Champ Aegis / niveau et debloque Champ Aegis",
    effectPerLevel: "+3% bouclier aegis",
    baseCost: { carbone: 150000, titane: 70000, adamantium: 15000, aetherium: 4000 },
    baseTimeSec: 100 * 60,
    maxLevel: 20
  },
  {
    id: "doctrine_escarmouche",
    name: "Doctrine d'Escarmouche",
    category: "unlock",
    description: "Debloque Eclaireur Stellaire et Foudroyant",
    effectPerLevel: "Debloque flotte legere",
    baseCost: { carbone: 20000, titane: 10000 },
    baseTimeSec: 20 * 60,
    maxLevel: 10
  },
  {
    id: "doctrine_interception",
    name: "Doctrine d'Interception",
    category: "unlock",
    description: "Debloque Aurore et Spectre",
    effectPerLevel: "Debloque intercepteurs",
    baseCost: { carbone: 50000, titane: 25000, osmium: 6000 },
    baseTimeSec: 40 * 60,
    maxLevel: 10,
    requires: [{ id: "doctrine_escarmouche", level: 3 }]
  },
  {
    id: "doctrine_domination",
    name: "Doctrine de Domination",
    category: "unlock",
    description: "Debloque Tempest et Titanide",
    effectPerLevel: "Debloque flotte lourde",
    baseCost: { carbone: 120000, titane: 60000, osmium: 15000, adamantium: 2000 },
    baseTimeSec: 75 * 60,
    maxLevel: 10,
    requires: [{ id: "doctrine_interception", level: 5 }]
  },
  {
    id: "architecture_capitale",
    name: "Architecture Capitale",
    category: "unlock",
    description: "Debloque Colosse et Arche Spatiale",
    effectPerLevel: "Debloque capital ships",
    baseCost: { carbone: 300000, titane: 150000, osmium: 40000, singulite: 5000 },
    baseTimeSec: 120 * 60,
    maxLevel: 5,
    requires: [{ id: "doctrine_domination", level: 5 }]
  },
  {
    id: "maitrise_energie_quantique",
    name: "Maitrise de l'Energie Quantique",
    category: "energy",
    description: "+5% production Isotope-7 et -2% conso flotte / niveau",
    effectPerLevel: "+5% ISO7, -2% conso",
    baseCost: { carbone: 110000, titane: 50000, isotope7: 8000 },
    baseTimeSec: 90 * 60,
    maxLevel: 20
  },
  {
    id: "stabilisation_singulite",
    name: "Stabilisation de Singulite",
    category: "energy",
    description: "+5% production Singulite / niveau",
    effectPerLevel: "+5% Singulite",
    baseCost: { carbone: 220000, titane: 100000, osmium: 25000, singulite: 3000 },
    baseTimeSec: 150 * 60,
    maxLevel: 10
  },
  {
    id: "commandement_escadre",
    name: "Commandement d'Escadre",
    category: "strategy",
    description: "+1 flotte active tous les 3 niveaux",
    effectPerLevel: "+1 flotte / 3 niveaux",
    baseCost: { carbone: 160000, titane: 80000, osmium: 20000, neodyme: 4000 },
    baseTimeSec: 110 * 60,
    maxLevel: 30
  },
  {
    id: "analyse_tactique",
    name: "Analyse Tactique",
    category: "strategy",
    description: "+2% efficacite globale flotte / niveau",
    effectPerLevel: "+2% efficacite",
    baseCost: { carbone: 180000, titane: 90000, osmium: 25000, chronium: 5000 },
    baseTimeSec: 120 * 60,
    maxLevel: 30
  },
  {
    id: "ingenierie_modulaire",
    name: "Ingenierie Modulaire",
    category: "strategy",
    description: "+1 slot module tous les 5 niveaux",
    effectPerLevel: "+1 slot / 5 niveaux",
    baseCost: { carbone: 220000, titane: 110000, osmium: 30000, adamantium: 7000 },
    baseTimeSec: 130 * 60,
    maxLevel: 30
  }
];

const TECHNOLOGY_NAME_EN: Record<TechnologyId, string> = {
  optimisation_extractive: "Extractive Optimization",
  compression_minerale: "Mineral Compression",
  raffinement_avance: "Advanced Refinement",
  physique_quantique_appliquee: "Applied Quantum Physics",
  automatisation_industrielle: "Industrial Automation",
  optimisation_logistique: "Logistics Optimization",
  propulsion_stellaire: "Stellar Propulsion",
  moteurs_flux_neodyme: "Neodymium Flux Engines",
  balistique_avancee: "Advanced Ballistics",
  blindage_composite: "Composite Armor",
  ciblage_predictif: "Predictive Targeting",
  renforcement_orbital: "Orbital Reinforcement",
  architecture_defensive: "Defensive Architecture",
  amplification_photonique: "Photonic Amplification",
  stabilisation_plasma: "Plasma Stabilization",
  balistique_orbitale: "Orbital Ballistics",
  controle_electromagnetique: "Electromagnetic Control",
  generateur_aegis: "Aegis Generator",
  doctrine_escarmouche: "Skirmish Doctrine",
  doctrine_interception: "Interception Doctrine",
  doctrine_domination: "Domination Doctrine",
  architecture_capitale: "Capital Architecture",
  maitrise_energie_quantique: "Quantum Energy Mastery",
  stabilisation_singulite: "Singulite Stabilization",
  commandement_escadre: "Squadron Command",
  analyse_tactique: "Tactical Analysis",
  ingenierie_modulaire: "Modular Engineering"
};

const TECHNOLOGY_DESCRIPTION_EN: Record<TechnologyId, string> = {
  optimisation_extractive: "+3% Carbon & Titanium production per level",
  compression_minerale: "+3% Osmium & Adamantium production per level",
  raffinement_avance: "+4% Magmatite & Neodymium production per level",
  physique_quantique_appliquee: "+4% Chronium/Aetherium/Isotope-7/Singulite production per level",
  automatisation_industrielle: "-2% building cost per level",
  optimisation_logistique: "-2% building construction time per level",
  propulsion_stellaire: "+4% ship speed per level",
  moteurs_flux_neodyme: "+2% speed and -2% quantum energy consumption per level",
  balistique_avancee: "+3% ship force per level",
  blindage_composite: "+3% ship endurance per level",
  ciblage_predictif: "Reduces combat variance down to +/-4%",
  renforcement_orbital: "+4% defense endurance per level",
  architecture_defensive: "+2% defense endurance per level and prerequisite for advanced defenses",
  amplification_photonique: "+4% Photon Projector damage per level",
  stabilisation_plasma: "+5% Plasma Blade damage per level and unlocks Plasma Blade",
  balistique_orbitale: "+4% Orbital Launcher damage per level and unlocks ballistic platforms",
  controle_electromagnetique: "+4% EMP effect per level and unlocks Silence EMP Projector",
  generateur_aegis: "+3% Aegis Field shield capacity per level and unlocks Aegis Field",
  doctrine_escarmouche: "Unlocks Stellar Scout and Thunderbolt",
  doctrine_interception: "Unlocks Aurora and Specter",
  doctrine_domination: "Unlocks Tempest and Titanid",
  architecture_capitale: "Unlocks Colossus and Space Ark",
  maitrise_energie_quantique: "+5% Isotope-7 production and -2% fleet consumption per level",
  stabilisation_singulite: "+5% Singulite production per level",
  commandement_escadre: "+1 active fleet every 3 levels",
  analyse_tactique: "+2% overall fleet efficiency per level",
  ingenierie_modulaire: "+1 module slot every 5 levels"
};

const TECHNOLOGY_EFFECT_EN: Partial<Record<TechnologyId, string>> = {
  optimisation_extractive: "+3% CAR/TIT",
  compression_minerale: "+3% OSM/ADA",
  raffinement_avance: "+4% MAG/NEO",
  physique_quantique_appliquee: "+4% CHR/AET/ISO/SIN",
  automatisation_industrielle: "-2% building cost",
  optimisation_logistique: "-2% building time",
  propulsion_stellaire: "+4% fleet speed",
  moteurs_flux_neodyme: "+2% speed, -2% consumption",
  balistique_avancee: "+3% fleet force",
  blindage_composite: "+3% fleet endurance",
  ciblage_predictif: "-0.3% variance (min +/-4%)",
  renforcement_orbital: "+4% defense endurance",
  architecture_defensive: "+2% defense endurance",
  amplification_photonique: "+4% photon damage",
  stabilisation_plasma: "+5% plasma damage",
  balistique_orbitale: "+4% orbital launcher",
  controle_electromagnetique: "+4% EMP effect",
  generateur_aegis: "+3% aegis shield",
  doctrine_escarmouche: "Light fleet unlock",
  doctrine_interception: "Interceptor unlock",
  doctrine_domination: "Heavy fleet unlock",
  architecture_capitale: "Capital ships unlock",
  maitrise_energie_quantique: "+5% ISO7, -2% consumption",
  stabilisation_singulite: "+5% Singulite",
  commandement_escadre: "+1 fleet / 3 levels",
  analyse_tactique: "+2% efficiency",
  ingenierie_modulaire: "+1 slot / 5 levels"
};

const technologyDisplayName = (techId: TechnologyId, fallback: string, language: UILanguage): string =>
  language === "en" ? TECHNOLOGY_NAME_EN[techId] ?? fallback : fallback;

const technologyDisplayDescription = (techId: TechnologyId, fallback: string, language: UILanguage): string =>
  language === "en" ? TECHNOLOGY_DESCRIPTION_EN[techId] ?? fallback : fallback;

const technologyDisplayEffect = (techId: TechnologyId, fallback: string | undefined, language: UILanguage): string | undefined =>
  language === "en" ? (TECHNOLOGY_EFFECT_EN[techId] ?? fallback) : fallback;

const defaultTechnologyLevels = (): Record<TechnologyId, number> => {
  const out = {} as Record<TechnologyId, number>;
  for (const def of TECHNOLOGY_DEFS) out[def.id] = 0;
  return out;
};

const costForLevel = (type: RoomType, level: number, globalFactor = 1): ResourceCost => {
  const factor = Math.pow(BUILD_COST_MULTIPLIER, Math.max(0, level - 1));
  const base = BASE_BUILDING_RESOURCE_COSTS[type] ?? {};
  const out: ResourceCost = {};
  for (const key of Object.keys(base) as ResourceId[]) {
    const amount = base[key] ?? 0;
    out[key] = Math.ceil(amount * factor * Math.max(0, globalFactor));
  }
  return out;
};

const canAffordCost = (amounts: Record<string, number>, cost: ResourceCost): boolean => {
  for (const key of Object.keys(cost) as ResourceId[]) {
    if ((amounts[key] ?? 0) < (cost[key] ?? 0)) return false;
  }
  return true;
};

const applyCostDelta = (base: Record<string, number>, cost: ResourceCost, sign: 1 | -1) => {
  const next = { ...base };
  for (const key of Object.keys(cost) as ResourceId[]) {
    const delta = (cost[key] ?? 0) * sign;
    next[key] = Math.max(0, (next[key] ?? 0) + delta);
  }
  return next;
};

const scaleCost = (cost: ResourceCost, quantity: number): ResourceCost => {
  const next: ResourceCost = {};
  const safe = Math.max(1, Math.floor(quantity));
  for (const key of Object.keys(cost) as ResourceId[]) {
    next[key] = Math.ceil((cost[key] ?? 0) * safe);
  }
  return next;
};

const maxCraftableFromResources = (amounts: Record<string, number>, unitCost: ResourceCost): number => {
  const keys = Object.keys(unitCost) as ResourceId[];
  if (keys.length === 0) return 0;
  let max = Number.POSITIVE_INFINITY;
  for (const key of keys) {
    const need = Math.max(1, Number(unitCost[key] ?? 0));
    const have = Math.max(0, Number(amounts[key] ?? 0));
    max = Math.min(max, Math.floor(have / need));
  }
  return Number.isFinite(max) ? Math.max(0, Math.floor(max)) : 0;
};

const formatCostLabel = (cost: ResourceCost, language: UILanguage = "fr") =>
  (Object.keys(cost) as ResourceId[])
    .map((k) => `${(cost[k] ?? 0).toLocaleString()} ${resourceDisplayName(k, language)}`)
    .join(" + ");

const resourceCostOrder = (cost: ResourceCost): ResourceId[] =>
  (RESOURCE_DEFS.map((r) => r.id).filter((id) => Number(cost[id as ResourceId] ?? 0) > 0) as ResourceId[]);

function ResourceCostDisplay({
  cost,
  available,
  language = "fr",
  compact = false,
  className = ""
}: {
  cost: ResourceCost;
  available: Record<string, number>;
  language?: UILanguage;
  compact?: boolean;
  className?: string;
}) {
  const entries = resourceCostOrder(cost).map((resourceId) => {
    const amount = Math.ceil(Number(cost[resourceId] ?? 0));
    const hasEnough = Math.floor(Number(available[resourceId] ?? 0)) >= amount;
    const name = resourceDisplayName(resourceId, language);
    return { resourceId, amount, hasEnough, name };
  });
  if (entries.length === 0) return <span>-</span>;
  return (
    <div className={`resource-cost-list ${compact ? "compact" : ""} ${className}`.trim()}>
      {entries.map((entry) => (
        <span key={`${entry.resourceId}_${entry.amount}`} className={`resource-cost-chip ${entry.hasEnough ? "enough" : "missing"}`}>
          <span className="top-resource-icon resource-cost-icon" style={getResourceMenuSpriteStyle(entry.resourceId)} />
          <span className="resource-cost-text">
            {entry.amount.toLocaleString()} {entry.name}
          </span>
        </span>
      ))}
    </div>
  );
}

const buildSecondsForLevel = (type: RoomType, level: number, globalFactor = 1) =>
  Math.max(1, Math.floor(ROOM_CONFIG[type].buildSecondsBase * Math.pow(BUILD_TIME_MULTIPLIER, Math.max(0, level - 1)) * Math.max(0, globalFactor)));

const technologyCostForLevel = (tech: TechnologyDef, level: number): ResourceCost => {
  const factor = Math.pow(TECH_COST_MULTIPLIER, Math.max(0, level - 1));
  const out: ResourceCost = {};
  for (const key of Object.keys(tech.baseCost) as ResourceId[]) {
    out[key] = Math.ceil((tech.baseCost[key] ?? 0) * factor);
  }
  return out;
};

const technologyTimeForLevel = (tech: TechnologyDef, level: number): number =>
  Math.max(1, Math.ceil(tech.baseTimeSec * Math.pow(TECH_TIME_MULTIPLIER, Math.max(0, level - 1))));

const SCORE_RESOURCE_WEIGHTS: Record<ResourceId, number> = {
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

const cumulativeTechResourceCost = (baseAmount: number, level: number) => {
  const lvl = Math.max(0, Math.floor(level));
  if (lvl <= 0 || baseAmount <= 0) return 0;
  if (Math.abs(TECH_COST_MULTIPLIER - 1) < 1e-9) return baseAmount * lvl;
  return baseAmount * ((Math.pow(TECH_COST_MULTIPLIER, lvl) - 1) / (TECH_COST_MULTIPLIER - 1));
};

const computeResearchInvestmentPoints = (levels: Record<TechnologyId, number>): number => {
  let total = 0;
  for (const tech of TECHNOLOGY_DEFS) {
    const level = Math.max(0, Math.floor(Number(levels[tech.id] ?? 0)));
    if (level <= 0) continue;
    for (const key of Object.keys(tech.baseCost) as ResourceId[]) {
      const baseAmount = Number(tech.baseCost[key] ?? 0);
      if (!Number.isFinite(baseAmount) || baseAmount <= 0) continue;
      total += cumulativeTechResourceCost(baseAmount, level) * (SCORE_RESOURCE_WEIGHTS[key] ?? 0);
    }
  }
  return Math.max(0, Math.floor(total));
};

const computeStorageCapacity = (entrepotLevel: number) =>
  Math.floor(STORAGE_BASE * Math.pow(STORAGE_MULTIPLIER, Math.max(0, entrepotLevel - 1)));

const makeId = () =>
  typeof crypto !== "undefined" && "randomUUID" in crypto
    ? crypto.randomUUID()
    : `room_${Date.now()}_${Math.floor(Math.random() * 9999)}`;

const formatDuration = (seconds: number) => {
  const s = Math.max(0, Math.floor(seconds));
  const h = Math.floor(s / 3600);
  const m = Math.floor((s % 3600) / 60);
  const sec = s % 60;
  if (h > 0) return `${h}h ${m.toString().padStart(2, "0")}m ${sec.toString().padStart(2, "0")}s`;
  return `${m.toString().padStart(2, "0")}:${sec.toString().padStart(2, "0")}`;
};

const formatBoostDurationLabel = (seconds: number) => {
  const s = Math.max(0, Math.floor(seconds));
  if (s % 3600 === 0) {
    const hours = s / 3600;
    return `${hours}h`;
  }
  if (s % 60 === 0) {
    const minutes = s / 60;
    return `${minutes} min`;
  }
  return `${s}s`;
};

const isRoomType = (value: string): value is RoomType =>
  value === "entrance" ||
  value === "carbone" ||
  value === "titane" ||
  value === "osmium" ||
  value === "adamantium" ||
  value === "magmatite" ||
  value === "neodyme" ||
  value === "chronium" ||
  value === "aetherium" ||
  value === "isotope7" ||
  value === "singulite" ||
  value === "quartiers_residentiels" ||
  value === "cantine_hydroponique" ||
  value === "centre_medical" ||
  value === "parc_orbital" ||
  value === "academie_technique" ||
  value === "universite_orbitale" ||
  value === "entrepot";

const defaultRooms = (): Room[] => [
  { id: "door", x: 0, y: 0, width: 2, type: "entrance", level: 1 },
  { id: "starter_carbone", x: 2, y: 0, width: 3, type: "carbone", level: 1 },
  { id: "starter_titane", x: 5, y: 0, width: 3, type: "titane", level: 1 }
];

const TECHNOLOGY_BY_ID: Record<TechnologyId, TechnologyDef> = TECHNOLOGY_DEFS.reduce((acc, def) => {
  acc[def.id] = def;
  return acc;
}, {} as Record<TechnologyId, TechnologyDef>);

const techLevelValue = (levels: Record<TechnologyId, number>, id: TechnologyId): number =>
  Math.max(0, Math.floor(Number(levels[id] ?? 0)));

const technologyRequirementsMet = (levels: Record<TechnologyId, number>, tech: TechnologyDef): boolean => {
  if (!tech.requires || tech.requires.length === 0) return true;
  return tech.requires.every((req) => techLevelValue(levels, req.id) >= req.level);
};

const technologyProductionBonuses = (levels: Record<TechnologyId, number>): Record<ResourceId, number> => {
  const bonuses = {
    carbone: 0,
    titane: 0,
    osmium: 0,
    adamantium: 0,
    magmatite: 0,
    neodyme: 0,
    chronium: 0,
    aetherium: 0,
    isotope7: 0,
    singulite: 0
  } as Record<ResourceId, number>;

  const extractive = techLevelValue(levels, "optimisation_extractive") * 0.03;
  bonuses.carbone += extractive;
  bonuses.titane += extractive;

  const minerale = techLevelValue(levels, "compression_minerale") * 0.03;
  bonuses.osmium += minerale;
  bonuses.adamantium += minerale;

  const raffinement = techLevelValue(levels, "raffinement_avance") * 0.04;
  bonuses.magmatite += raffinement;
  bonuses.neodyme += raffinement;

  const quantique = techLevelValue(levels, "physique_quantique_appliquee") * 0.04;
  bonuses.chronium += quantique;
  bonuses.aetherium += quantique;
  bonuses.isotope7 += quantique;
  bonuses.singulite += quantique;

  bonuses.isotope7 += techLevelValue(levels, "maitrise_energie_quantique") * 0.05;
  bonuses.singulite += techLevelValue(levels, "stabilisation_singulite") * 0.05;
  return bonuses;
};

const isHangarUnitUnlocked = (unitId: string, levels: Record<TechnologyId, number>): boolean => {
  if (unitId === "projecteur_photonique") return techLevelValue(levels, "amplification_photonique") >= 1;
  if (unitId === "lanceur_orbitral") return techLevelValue(levels, "balistique_orbitale") >= 1;
  if (unitId === "lame_de_plasma") return techLevelValue(levels, "stabilisation_plasma") >= 1;
  if (unitId === "champ_aegis") return techLevelValue(levels, "generateur_aegis") >= 1;
  if (unitId === "tourelle_rafale") return techLevelValue(levels, "architecture_defensive") >= 1;
  if (unitId === "batterie_eclat") return techLevelValue(levels, "architecture_defensive") >= 2;
  if (unitId === "canon_ion_aiguillon") return techLevelValue(levels, "amplification_photonique") >= 2;
  if (unitId === "mine_orbitale_veille") return techLevelValue(levels, "balistique_orbitale") >= 2;
  if (unitId === "canon_rail_longue_vue") return techLevelValue(levels, "balistique_orbitale") >= 4;
  if (unitId === "projecteur_emp_silence") {
    return techLevelValue(levels, "controle_electromagnetique") >= 1 && techLevelValue(levels, "moteurs_flux_neodyme") >= 3;
  }
  if (unitId === "mur_photonique_prisme") return techLevelValue(levels, "generateur_aegis") >= 3;
  if (unitId === "lance_gravitationnel_ancre") {
    return techLevelValue(levels, "generateur_aegis") >= 6 && techLevelValue(levels, "physique_quantique_appliquee") >= 3;
  }
  if (unitId === "eclaireur_stellaire" || unitId === "foudroyant") return techLevelValue(levels, "doctrine_escarmouche") >= 1;
  if (unitId === "aurore" || unitId === "spectre") return techLevelValue(levels, "doctrine_interception") >= 1;
  if (unitId === "tempest" || unitId === "titanide") return techLevelValue(levels, "doctrine_domination") >= 1;
  if (unitId === "colosse" || unitId === "arche_spatiale") return techLevelValue(levels, "architecture_capitale") >= 1;
  return true;
};

const RESOURCE_TECH_BONUS_SOURCES: Record<ResourceId, Array<{ id: TechnologyId; perLevel: number }>> = {
  carbone: [{ id: "optimisation_extractive", perLevel: 0.03 }],
  titane: [{ id: "optimisation_extractive", perLevel: 0.03 }],
  osmium: [{ id: "compression_minerale", perLevel: 0.03 }],
  adamantium: [{ id: "compression_minerale", perLevel: 0.03 }],
  magmatite: [{ id: "raffinement_avance", perLevel: 0.04 }],
  neodyme: [{ id: "raffinement_avance", perLevel: 0.04 }],
  chronium: [{ id: "physique_quantique_appliquee", perLevel: 0.04 }],
  aetherium: [{ id: "physique_quantique_appliquee", perLevel: 0.04 }],
  isotope7: [
    { id: "physique_quantique_appliquee", perLevel: 0.04 },
    { id: "maitrise_energie_quantique", perLevel: 0.05 }
  ],
  singulite: [
    { id: "physique_quantique_appliquee", perLevel: 0.04 },
    { id: "stabilisation_singulite", perLevel: 0.05 }
  ]
};

const getUnlockedResourceTechBonuses = (
  resourceId: ResourceId,
  levels: Record<TechnologyId, number>,
  language: UILanguage
): Array<{ techId: TechnologyId; name: string; level: number; bonusPercent: number }> => {
  const sources = RESOURCE_TECH_BONUS_SOURCES[resourceId] ?? [];
  return sources
    .map((src) => {
      const level = techLevelValue(levels, src.id);
      return {
        techId: src.id,
        name: technologyDisplayName(src.id, TECHNOLOGY_BY_ID[src.id].name, language),
        level,
        bonusPercent: level * src.perLevel * 100
      };
    })
    .filter((row) => row.level > 0);
};

type SectorEntityType = "station" | "world" | "resource";

interface SectorBaseEntity {
  id: string;
  x: number;
  y: number;
  name: string;
  type: SectorEntityType;
}

interface SectorStation extends SectorBaseEntity {
  type: "station";
  owner: string;
  hue: string;
  power: number;
  defense: number;
  isPlayer?: boolean;
}

interface SectorWorld extends SectorBaseEntity {
  type: "world";
  worldType: "gaia" | "desert" | "ice" | "forge";
  missions: string[];
}

interface SectorResource extends SectorBaseEntity {
  type: "resource";
  resourceType?: "alliage" | "helium3" | "cristal";
  amount?: number;
  fieldId?: string;
  rarityTier?: "COMMON" | "UNCOMMON" | "RARE" | "EPIC" | "LEGENDARY" | "MYTHIC";
  qualityTier?: "POOR" | "STANDARD" | "RICH" | "EXCEPTIONAL";
  resources?: Array<{ resourceId: ResourceId; totalAmount: number; remainingAmount: number }>;
  hiddenDetails?: boolean;
  isOccupied?: boolean;
  occupiedByPlayerId?: string;
  occupiedByUsername?: string;
  occupyingFleetId?: string;
  totalExtractionWork?: number;
  remainingExtractionWork?: number;
  spawnedAt?: number;
  expiresAt?: number;
}

interface SectorFleet {
  id: string;
  sourceId: string;
  targetId: string;
  startX: number;
  startY: number;
  targetX: number;
  targetY: number;
  progress: number;
  missionType: "attack" | "mine" | "mission";
  color: string;
}

type SectorEntity = SectorStation | SectorWorld | SectorResource;
type SectorMapPlayer = { userId: string; username: string; x: number; y: number; worldType: SectorWorld["worldType"]; isSelf: boolean };
type MapFieldServerDto = {
  id: string;
  x: number;
  y: number;
  rarityTier: SectorResource["rarityTier"];
  qualityTier: SectorResource["qualityTier"];
  resources: Array<{ resourceId: string; totalAmount: number; remainingAmount: number }>;
  totalExtractionWork: number;
  remainingExtractionWork: number;
  spawnedAt: number;
  expiresAt: number;
  occupiedByPlayerId: string;
  occupiedByUsername: string;
  occupyingFleetId: string;
  isOccupied: boolean;
  isVisible: boolean;
  hiddenDetails: boolean;
};
type MapExpeditionDto = {
  id: string;
  fieldId: string;
  status: "travel_to_field" | "extracting" | "returning";
  departureAt: number;
  arrivalAt: number;
  extractionStartAt: number;
  extractionEndAt: number;
  returnStartAt: number;
  returnEndAt: number;
  travelSeconds: number;
  extractionSeconds: number;
  totalHarvestSpeed: number;
  totalTransportCapacity: number;
  playerScore: number;
  scoreBonus: number;
  fleet: Array<{ unitId: string; quantity: number }>;
  snapshotResources: Partial<Record<ResourceId, number>>;
  collectedResources: Partial<Record<ResourceId, number>>;
  serverNowTs: number;
};
type MapHarvestShipRow = {
  unitId: string;
  quantity: number;
  harvestSpeed: number;
  harvestCapacity: number;
  mapSpeed: number;
};

type MapDailyHarvestQuestState = {
  cycleKey: string;
  extractionBestSeconds: number;
  extractionClaimed: boolean;
  collectedResources: number;
  collectionClaimed: boolean;
  processedReportIds: string[];
};

type DerivedMapExpeditionTimeline = {
  status: "travel_to_field" | "extracting" | "returning";
  startAt: number;
  endAt: number;
  progress: number;
  completed: boolean;
};

const deriveMapExpeditionTimeline = (
  expedition: MapExpeditionDto,
  nowTs: number
): DerivedMapExpeditionTimeline => {
  const fallbackStatus = String(expedition.status || "travel_to_field").trim().toLowerCase();
  const departureAt = Math.max(0, Math.floor(Number(expedition.departureAt ?? 0)));
  const travelSeconds = Math.max(0, Math.floor(Number(expedition.travelSeconds ?? 0)));
  const extractionSeconds = Math.max(0, Math.floor(Number(expedition.extractionSeconds ?? 0)));
  const arrivalAt =
    Math.max(0, Math.floor(Number(expedition.arrivalAt ?? 0))) ||
    (departureAt > 0 ? departureAt + travelSeconds : 0);
  const extractionStartAt =
    Math.max(0, Math.floor(Number(expedition.extractionStartAt ?? 0))) ||
    arrivalAt;
  const extractionEndAt =
    Math.max(0, Math.floor(Number(expedition.extractionEndAt ?? 0))) ||
    (extractionStartAt > 0 ? extractionStartAt + extractionSeconds : 0);
  const explicitReturnStartAt = Math.max(0, Math.floor(Number(expedition.returnStartAt ?? 0)));
  const explicitReturnEndAt = Math.max(0, Math.floor(Number(expedition.returnEndAt ?? 0)));
  const hasExplicitReturn =
    fallbackStatus === "returning" || explicitReturnStartAt > 0 || explicitReturnEndAt > 0;

  if (hasExplicitReturn) {
    const normalizedReturnStart =
      explicitReturnStartAt > 0
        ? explicitReturnStartAt
        : explicitReturnEndAt > 0
          ? Math.max(0, explicitReturnEndAt - travelSeconds)
          : Math.max(0, nowTs);
    const normalizedReturnEnd =
      explicitReturnEndAt > 0
        ? explicitReturnEndAt
        : normalizedReturnStart + Math.max(1, travelSeconds);
    if (normalizedReturnEnd > 0 && nowTs >= normalizedReturnEnd) {
      return {
        status: "returning",
        startAt: normalizedReturnStart,
        endAt: normalizedReturnEnd,
        progress: 1,
        completed: true
      };
    }
    const total = Math.max(1, normalizedReturnEnd - normalizedReturnStart);
    return {
      status: "returning",
      startAt: normalizedReturnStart,
      endAt: normalizedReturnEnd,
      progress: Math.max(0, Math.min(1, (nowTs - normalizedReturnStart) / total)),
      completed: false
    };
  }

  if (
    extractionStartAt > 0 &&
    extractionEndAt > 0 &&
    nowTs >= extractionStartAt &&
    nowTs < extractionEndAt
  ) {
    const total = Math.max(1, extractionEndAt - extractionStartAt);
    return {
      status: "extracting",
      startAt: extractionStartAt,
      endAt: extractionEndAt,
      progress: Math.max(0, Math.min(1, (nowTs - extractionStartAt) / total)),
      completed: false
    };
  }

  if (arrivalAt > 0 && nowTs < arrivalAt) {
    const total = Math.max(1, arrivalAt - departureAt);
    return {
      status: "travel_to_field",
      startAt: departureAt,
      endAt: arrivalAt,
      progress: Math.max(0, Math.min(1, (nowTs - departureAt) / total)),
      completed: false
    };
  }

  if (fallbackStatus === "extracting") {
    return {
      status: "extracting",
      startAt: extractionStartAt,
      endAt: extractionEndAt,
      progress: 0,
      completed: false
    };
  }
  return {
    status: "travel_to_field",
    startAt: departureAt,
    endAt: arrivalAt,
    progress: 0,
    completed: false
  };
};

const calculateMapHarvestScoreBonus = (playerScore: number, explicitScoreBonus?: number): number => {
  const provided = Number(explicitScoreBonus ?? 0);
  if (Number.isFinite(provided) && provided > 0) {
    return Math.max(1, Math.min(2, provided));
  }
  const safeScore = Math.max(1, Math.floor(Number(playerScore || 0)));
  return Math.max(1, Math.min(2, 1 + Math.log10(safeScore) * 0.05));
};

const calculateFleetTransportCapacity = (fleetRows: Array<{ unitId: string; quantity: number }>): number => {
  let totalTransportCapacity = 0;
  for (const row of Array.isArray(fleetRows) ? fleetRows : []) {
    const unitId = String(row?.unitId || "").trim();
    const quantity = Math.max(0, Math.floor(Number(row?.quantity || 0)));
    if (!unitId || quantity <= 0) continue;
    const stats = MAP_HARVEST_UNIT_STATS[unitId];
    if (!stats) continue;
    totalTransportCapacity += Math.max(0, Math.floor(Number(stats.harvestCapacity || 0))) * quantity;
  }
  return totalTransportCapacity;
};

const estimateMapExpeditionCollected = (
  expedition: MapExpeditionDto,
  snapshotOverride: Partial<Record<ResourceId, number>> | null,
  nowTs: number
): Partial<Record<ResourceId, number>> => {
  const timeline = deriveMapExpeditionTimeline(expedition, nowTs);
  const snapshot = snapshotOverride && typeof snapshotOverride === "object"
    ? snapshotOverride
    : expedition.snapshotResources && typeof expedition.snapshotResources === "object"
      ? expedition.snapshotResources
      : {};
  if (timeline.status !== "extracting") return {};
  const elapsed = Math.max(0, Math.floor(nowTs - timeline.startAt));
  const fleetHarvestSpeed = Math.max(0, Math.floor(Number(expedition.totalHarvestSpeed || 0)));
  const totalTransportCapacity = Math.max(
    0,
    Math.max(
      Math.floor(Number(expedition.totalTransportCapacity || 0)),
      calculateFleetTransportCapacity(expedition.fleet)
    )
  );
  const scoreBonus = calculateMapHarvestScoreBonus(expedition.playerScore, expedition.scoreBonus);
  if (elapsed <= 0 || fleetHarvestSpeed <= 0) return {};

  const harvestedByResource: Partial<Record<ResourceId, number>> = {};
  for (const [ridRaw, amountRaw] of Object.entries(snapshot)) {
    const rid = String(ridRaw || "").trim() as ResourceId;
    const maxAmount = Math.max(0, Math.floor(Number(amountRaw || 0)));
    if (maxAmount <= 0) continue;
    const rarity = Math.max(1, Math.floor(Number(RESOURCE_DEFS.find((row) => row.id === rid)?.rarity ?? 100)));
    const coefficient = 1 / rarity;
    const harvested = Math.max(0, Math.min(maxAmount, Math.floor(elapsed * fleetHarvestSpeed * scoreBonus * coefficient)));
    if (harvested > 0) harvestedByResource[rid] = harvested;
  }

  const totalPotential = Object.values(harvestedByResource).reduce(
    (sum, value) => sum + Math.max(0, Math.floor(Number(value || 0))),
    0
  );
  const scale = totalTransportCapacity > 0 && totalPotential > totalTransportCapacity
    ? totalTransportCapacity / totalPotential
    : 1;

  const collected: Partial<Record<ResourceId, number>> = {};
  for (const [ridRaw, amountRaw] of Object.entries(harvestedByResource)) {
    const rid = String(ridRaw || "").trim() as ResourceId;
    const value = Math.max(0, Math.floor(Number(amountRaw || 0) * scale));
    if (value > 0) collected[rid] = value;
  }
  return collected;
};

const SECTOR_MAP_SIZE = 10000;

const SECTOR_STATIONS: SectorStation[] = [
  { id: "st_1", x: 5000, y: 5000, name: "Nexus Aegis", type: "station", owner: "Vous", hue: "cyan", power: 9200, defense: 5400, isPlayer: true },
  { id: "st_2", x: 6650, y: 3550, name: "Consortium Ecarlate", type: "station", owner: "Faction rivale", hue: "red", power: 7600, defense: 4100 },
  { id: "st_3", x: 3180, y: 6390, name: "Cartel du Vide", type: "station", owner: "Faction neutre", hue: "violet", power: 4300, defense: 8300 }
];

const SECTOR_WORLDS: SectorWorld[] = [
  { id: "wd_1", x: 5870, y: 5480, name: "Eden-9", type: "world", worldType: "gaia", missions: ["Convoi diplomatique", "Extraction bio-medicale"] },
  { id: "wd_2", x: 4180, y: 4320, name: "Khepra Dune", type: "world", worldType: "desert", missions: ["Interception pirate", "Contrebande cryo"] },
  { id: "wd_3", x: 5450, y: 2980, name: "Frimas Delta", type: "world", worldType: "ice", missions: ["Scan anomalie", "Balise scientifique"] }
];

const SECTOR_RESOURCES: SectorResource[] = [];

const SECTOR_ENTITIES: SectorEntity[] = [...SECTOR_STATIONS, ...SECTOR_WORLDS, ...SECTOR_RESOURCES];

const SECTOR_ENTITY_NAME_EN: Record<string, string> = {
  st_1: "Aegis Nexus",
  st_2: "Crimson Consortium",
  st_3: "Void Cartel",
  wd_1: "Eden-9",
  wd_2: "Khepra Dune",
  wd_3: "Frimas Delta",
  rs_1: "Ferrometal Belt",
  rs_2: "Helium-3 Cloud",
  rs_3: "Crystal Cluster"
};

const SECTOR_STATION_OWNER_EN: Record<string, string> = {
  st_1: "You",
  st_2: "Rival faction",
  st_3: "Neutral faction"
};

const SECTOR_WORLD_MISSIONS_EN: Record<string, string[]> = {
  wd_1: ["Diplomatic convoy", "Bio-medical extraction"],
  wd_2: ["Pirate interception", "Cryo smuggling"],
  wd_3: ["Anomaly scan", "Scientific beacon"]
};

const sectorEntityDisplayName = (entity: SectorEntity, language: UILanguage): string =>
  language === "en" ? SECTOR_ENTITY_NAME_EN[entity.id] ?? entity.name : entity.name;

const sectorStationOwnerDisplay = (station: SectorStation, language: UILanguage): string =>
  language === "en" ? SECTOR_STATION_OWNER_EN[station.id] ?? station.owner : station.owner;

const sectorWorldMissionsDisplay = (world: SectorWorld, language: UILanguage): string[] =>
  language === "en" ? SECTOR_WORLD_MISSIONS_EN[world.id] ?? world.missions : world.missions;

const MAP_FIELD_RARITY_LABEL_FR: Record<string, string> = {
  COMMON: "Commun",
  UNCOMMON: "Inhabituel",
  RARE: "Rare",
  EPIC: "Epique",
  LEGENDARY: "Legendaire",
  MYTHIC: "Mythique"
};

const MAP_FIELD_RARITY_LABEL_EN: Record<string, string> = {
  COMMON: "Common",
  UNCOMMON: "Uncommon",
  RARE: "Rare",
  EPIC: "Epic",
  LEGENDARY: "Legendary",
  MYTHIC: "Mythic"
};

const MAP_FIELD_QUALITY_LABEL_FR: Record<string, string> = {
  POOR: "Pauvre",
  STANDARD: "Standard",
  RICH: "Riche",
  EXCEPTIONAL: "Exceptionnel"
};

const MAP_FIELD_QUALITY_LABEL_EN: Record<string, string> = {
  POOR: "Poor",
  STANDARD: "Standard",
  RICH: "Rich",
  EXCEPTIONAL: "Exceptional"
};

const MAP_HARVEST_UNIT_STATS: Record<string, { harvestSpeed: number; harvestCapacity: number; mapSpeed: number }> = {
  pegase: { harvestSpeed: 120, harvestCapacity: 50_000, mapSpeed: 160 },
  argo: { harvestSpeed: 320, harvestCapacity: 200_000, mapSpeed: 140 },
  arche_spatiale: { harvestSpeed: 700, harvestCapacity: 500_000, mapSpeed: 110 },
  eclaireur_stellaire: { harvestSpeed: 10, harvestCapacity: 10_000, mapSpeed: 300 },
  foudroyant: { harvestSpeed: 5, harvestCapacity: 12_000, mapSpeed: 350 },
  aurore: { harvestSpeed: 8, harvestCapacity: 7_000, mapSpeed: 420 },
  spectre: { harvestSpeed: 12, harvestCapacity: 5_000, mapSpeed: 470 },
  tempest: { harvestSpeed: 15, harvestCapacity: 4_000, mapSpeed: 500 },
  titanide: { harvestSpeed: 18, harvestCapacity: 8_000, mapSpeed: 360 },
  colosse: { harvestSpeed: 20, harvestCapacity: 12_000, mapSpeed: 300 }
};

const MAP_TRAVEL_TIME_FACTOR = 42;
const MAP_MIN_TRAVEL_SECONDS = 120;
const MAP_MAX_TRAVEL_SECONDS = 1200;
const MAP_MIN_EXTRACTION_SECONDS = 3600;
const MAP_MAX_EXTRACTION_SECONDS = 7200;

const PLANET_SPRITE_SHEET = "/room-images/sprite-sheet-planet.png";
const PLANET_SPRITE_TARGET_SIZE = 72;
const PLANET_SPRITE_SHEET_WIDTH = 1024;
const PLANET_SPRITE_SHEET_HEIGHT = 1536;
const PLANET_SPRITE_FRAMES: Record<SectorWorld["worldType"], { x: number; y: number; size: number }> = {
  // Real sprite coordinates (clean spherical planets, no rings).
  gaia: { x: 42, y: 242, size: 172 },
  desert: { x: 239, y: 242, size: 172 },
  ice: { x: 425, y: 242, size: 172 },
  forge: { x: 612, y: 240, size: 172 }
};

const PLAYER_PLANET_WORLD_TYPES: SectorWorld["worldType"][] = ["gaia", "desert", "ice", "forge"];
const MAP_PLAYER_BLOCKED_PREFIXES = ["probe-", "builder", "loadtest", "stress", "bot-", "autotest", "perf-"];

const hashString32 = (input: string): number => {
  let hash = 2166136261;
  for (let i = 0; i < input.length; i += 1) {
    hash ^= input.charCodeAt(i);
    hash = Math.imul(hash, 16777619);
  }
  return hash >>> 0;
};

const isMapVisibleUsername = (username: string): boolean => {
  const normalized = String(username || "").trim().toLowerCase();
  if (!normalized) return false;
  for (const prefix of MAP_PLAYER_BLOCKED_PREFIXES) {
    if (normalized.startsWith(prefix)) return false;
  }
  return true;
};

const mapPlayerToPlanetCoordinates = (userId: string): { x: number; y: number } => {
  const seed = String(userId || "");
  const padding = 360;
  const range = Math.max(1, SECTOR_MAP_SIZE - padding * 2);
  let x = padding + (hashString32(`${seed}|x`) % range);
  let y = padding + (hashString32(`${seed}|y`) % range);
  if (Math.abs(x - 5000) < 420 && Math.abs(y - 5000) < 420) {
    x = Math.min(SECTOR_MAP_SIZE - padding, x + 520);
    y = Math.min(SECTOR_MAP_SIZE - padding, y + 300);
  }
  return { x, y };
};

const mapPlayerToSectorPlanet = (
  player: { userId: string; username: string },
  currentUserId: string
): SectorMapPlayer => {
  const { x, y } = mapPlayerToPlanetCoordinates(player.userId);
  const hashType = hashString32(`${player.userId}|w`);
  const isSelf = player.userId === currentUserId;

  return {
    userId: player.userId,
    username: player.username,
    x,
    y,
    worldType: PLAYER_PLANET_WORLD_TYPES[hashType % PLAYER_PLANET_WORLD_TYPES.length],
    isSelf: isSelf
  };
};

const computeSectorPlayerPlanets = (
  players: Array<{ userId: string; username: string }>,
  currentUserId: string
): SectorMapPlayer[] => {
  const minDistance = 90;
  const minDistanceSq = minDistance * minDistance;
  const cellSize = minDistance;
  const padding = 360;
  const maxCoordinate = SECTOR_MAP_SIZE - padding;
  const clampCoord = (value: number) => Math.max(padding, Math.min(maxCoordinate, value));

  const grid = new Map<string, Array<{ x: number; y: number }>>();
  const placeable = (x: number, y: number) => {
    const cx = Math.floor(x / cellSize);
    const cy = Math.floor(y / cellSize);
    for (let gx = cx - 1; gx <= cx + 1; gx += 1) {
      for (let gy = cy - 1; gy <= cy + 1; gy += 1) {
        const bucket = grid.get(`${gx}:${gy}`);
        if (!bucket) continue;
        for (const point of bucket) {
          const dx = point.x - x;
          const dy = point.y - y;
          if (dx * dx + dy * dy < minDistanceSq) return false;
        }
      }
    }
    return true;
  };
  const registerPoint = (x: number, y: number) => {
    const cx = Math.floor(x / cellSize);
    const cy = Math.floor(y / cellSize);
    const key = `${cx}:${cy}`;
    const bucket = grid.get(key);
    if (bucket) bucket.push({ x, y });
    else grid.set(key, [{ x, y }]);
  };

  const uniquePlayers: Array<{ userId: string; username: string }> = [];
  const seen = new Set<string>();
  for (const player of players) {
    const userId = String(player.userId || "").trim();
    if (!userId || seen.has(userId)) continue;
    const username = String(player.username || "").trim() || userId.slice(0, 8);
    if (!isMapVisibleUsername(username)) continue;
    seen.add(userId);
    uniquePlayers.push({ userId, username });
  }

  uniquePlayers.sort((a, b) => {
    if (a.userId === currentUserId) return -1;
    if (b.userId === currentUserId) return 1;
    return a.userId.localeCompare(b.userId);
  });

  const output: SectorMapPlayer[] = [];
  for (const player of uniquePlayers) {
    const base = mapPlayerToSectorPlanet(player, currentUserId);
    const seedAngle = (hashString32(`${player.userId}|angle`) / 4294967295) * Math.PI * 2;
    let bestX = clampCoord(base.x);
    let bestY = clampCoord(base.y);
    let found = false;

    for (let ring = 0; ring <= 36 && !found; ring += 1) {
      const radius = ring * 48;
      const samples = ring === 0 ? 1 : Math.min(40, 10 + ring * 2);
      for (let sample = 0; sample < samples; sample += 1) {
        const angle = seedAngle + (sample / samples) * Math.PI * 2;
        const candidateX = clampCoord(bestX + Math.cos(angle) * radius);
        const candidateY = clampCoord(bestY + Math.sin(angle) * radius);
        if (!placeable(candidateX, candidateY)) continue;
        bestX = candidateX;
        bestY = candidateY;
        found = true;
        break;
      }
    }

    registerPoint(bestX, bestY);
    output.push({
      ...base,
      x: Math.round(bestX),
      y: Math.round(bestY)
    });
  }

  return output;
};

const mapFieldRarityDisplay = (tier: string | undefined, language: UILanguage): string => {
  const key = String(tier || "COMMON").toUpperCase();
  return language === "en"
    ? MAP_FIELD_RARITY_LABEL_EN[key] ?? MAP_FIELD_RARITY_LABEL_EN.COMMON
    : MAP_FIELD_RARITY_LABEL_FR[key] ?? MAP_FIELD_RARITY_LABEL_FR.COMMON;
};

const mapFieldQualityDisplay = (tier: string | undefined, language: UILanguage): string => {
  const key = String(tier || "STANDARD").toUpperCase();
  return language === "en"
    ? MAP_FIELD_QUALITY_LABEL_EN[key] ?? MAP_FIELD_QUALITY_LABEL_EN.STANDARD
    : MAP_FIELD_QUALITY_LABEL_FR[key] ?? MAP_FIELD_QUALITY_LABEL_FR.STANDARD;
};

const inferMapResourceType = (resourceId: string | undefined): SectorResource["resourceType"] => {
  const rid = String(resourceId || "").trim() as ResourceId;
  const tier = (RESOURCE_DEFS.find((r) => r.id === rid)?.rarity ?? 10);
  if (tier <= 30) return "alliage";
  if (tier <= 75) return "helium3";
  return "cristal";
};

const mapFieldDisplayName = (fieldId: string, language: UILanguage) =>
  language === "en"
    ? `Resource Field ${fieldId.slice(-4).toUpperCase()}`
    : `Champ de ressources ${fieldId.slice(-4).toUpperCase()}`;

const parseBooleanFlag = (value: unknown, fallback = false): boolean => {
  if (typeof value === "boolean") return value;
  if (typeof value === "number") return Number.isFinite(value) ? value !== 0 : fallback;
  if (typeof value === "string") {
    const normalized = value.trim().toLowerCase();
    if (normalized === "true" || normalized === "1" || normalized === "yes" || normalized === "y" || normalized === "on") {
      return true;
    }
    if (
      normalized === "false" ||
      normalized === "0" ||
      normalized === "no" ||
      normalized === "n" ||
      normalized === "off" ||
      normalized === ""
    ) {
      return false;
    }
  }
  return fallback;
};

const normalizeMapEntityId = (value: unknown): string => {
  const raw = String(value ?? "").trim();
  if (!raw) return "";
  const lowered = raw.toLowerCase();
  if (
    lowered === "false" ||
    lowered === "null" ||
    lowered === "undefined" ||
    lowered === "none" ||
    lowered === "0" ||
    lowered === "nan"
  ) {
    return "";
  }
  return raw;
};

const normalizeMapOccupiedFlag = (
  occupiedValue: unknown,
  occupiedByPlayerId: string,
  occupyingFleetId: string
): boolean =>
  parseBooleanFlag(occupiedValue, false) &&
  (occupiedByPlayerId.trim().length > 0 || occupyingFleetId.trim().length > 0);

const mapFieldToSectorEntity = (field: MapFieldServerDto, language: UILanguage): SectorResource => {
  const firstResource = field.resources && field.resources.length > 0 ? field.resources[0].resourceId : "carbone";
  const remaining = (field.resources || []).reduce((sum, row) => sum + Math.max(0, Math.floor(Number(row.remainingAmount || 0))), 0);
  const occupiedByPlayerId = normalizeMapEntityId(field.occupiedByPlayerId);
  const occupyingFleetId = normalizeMapEntityId(field.occupyingFleetId);
  const isOccupied = normalizeMapOccupiedFlag(field.isOccupied, occupiedByPlayerId, occupyingFleetId);
  return {
    id: `rf_${field.id}`,
    fieldId: field.id,
    x: Math.floor(Number(field.x || 0)),
    y: Math.floor(Number(field.y || 0)),
    name: mapFieldDisplayName(field.id, language),
    type: "resource",
    resourceType: inferMapResourceType(firstResource),
    amount: remaining,
    rarityTier: field.rarityTier,
    qualityTier: field.qualityTier,
    resources: (field.resources || [])
      .filter((row) => typeof row.resourceId === "string")
      .map((row) => ({
        resourceId: row.resourceId as ResourceId,
        totalAmount: Math.max(0, Math.floor(Number(row.totalAmount || 0))),
        remainingAmount: Math.max(0, Math.floor(Number(row.remainingAmount || 0)))
      })),
    hiddenDetails: parseBooleanFlag(field.hiddenDetails, false),
    isOccupied,
    occupiedByPlayerId,
    occupiedByUsername: String(field.occupiedByUsername || ""),
    occupyingFleetId,
    totalExtractionWork: Math.max(0, Math.floor(Number(field.totalExtractionWork || 0))),
    remainingExtractionWork: Math.max(0, Math.floor(Number(field.remainingExtractionWork || 0))),
    spawnedAt: Math.max(0, Math.floor(Number(field.spawnedAt || 0))),
    expiresAt: Math.max(0, Math.floor(Number(field.expiresAt || 0)))
  };
};

const estimateMapHarvestPlan = (
  fleetRows: Array<{ unitId: string; quantity: number }>,
  userId: string,
  fieldX: number,
  fieldY: number,
  fieldWork: number
) => {
  let totalHarvestSpeed = 0;
  let totalCapacity = 0;
  let weightedMapSpeed = 0;
  let totalShips = 0;
  for (const row of fleetRows) {
    const stats = MAP_HARVEST_UNIT_STATS[row.unitId];
    if (!stats) continue;
    const qty = Math.max(0, Math.floor(Number(row.quantity || 0)));
    if (qty <= 0) continue;
    totalHarvestSpeed += stats.harvestSpeed * qty;
    totalCapacity += stats.harvestCapacity * qty;
    weightedMapSpeed += stats.mapSpeed * qty;
    totalShips += qty;
  }
  const effectiveSpeed = totalShips > 0 ? weightedMapSpeed / totalShips : 0;
  const origin = mapPlayerToPlanetCoordinates(userId || "guest");
  const dx = fieldX - origin.x;
  const dy = fieldY - origin.y;
  const distance = Math.sqrt(dx * dx + dy * dy);
  const travelSeconds = effectiveSpeed > 0
    ? Math.max(MAP_MIN_TRAVEL_SECONDS, Math.min(MAP_MAX_TRAVEL_SECONDS, Math.floor((distance / effectiveSpeed) * MAP_TRAVEL_TIME_FACTOR)))
    : 0;
  const extractionSeconds = totalHarvestSpeed > 0
    ? Math.max(
        MAP_MIN_EXTRACTION_SECONDS,
        Math.min(MAP_MAX_EXTRACTION_SECONDS, Math.floor(Math.max(1, fieldWork) / totalHarvestSpeed))
      )
    : 0;
  return {
    totalHarvestSpeed,
    totalCapacity,
    travelSeconds,
    extractionSeconds
  };
};

const getPlanetSpriteStyle = (worldType: SectorWorld["worldType"]): CSSProperties => {
  const frame = PLANET_SPRITE_FRAMES[worldType] ?? { x: 42, y: 242, size: 172 };
  const scale = PLANET_SPRITE_TARGET_SIZE / frame.size;
  return {
    backgroundImage: `url(${PLANET_SPRITE_SHEET})`,
    backgroundRepeat: "no-repeat",
    backgroundSize: `${PLANET_SPRITE_SHEET_WIDTH * scale}px ${PLANET_SPRITE_SHEET_HEIGHT * scale}px`,
    backgroundPosition: `${-frame.x * scale}px ${-frame.y * scale}px`
  };
};

type ResourceSection = "construction" | "research";
type ResourceDef = {
  id: string;
  name: string;
  rarity: number;
  machine: string;
  section: ResourceSection;
};

type InventoryViewItem = {
  id: string;
  name: string;
  category: "TIME_BOOST" | "RESOURCE_CRATE" | "ATTACK_BOOST" | "OTHER";
  quantity: number;
  durationSeconds?: number;
  chestType?: "CLASSIC" | "UNCOMMON" | "RARE" | "LEGENDARY" | "DIVINE";
};

type InventoryBoostTarget = {
  id: string;
  target: "building" | "hangar" | "research_local";
  label: string;
  detail: string;
  remainingSeconds: number;
  queueId?: string;
};

type ChestLootSummary = {
  opened: number;
  rewards: Record<string, number>;
};

type InboxMessageType = "REWARD" | "COMBAT_REPORT" | "SYSTEM" | "PLAYER";

type InboxAttachment = {
  resources?: Partial<Record<ResourceId, number>>;
  items?: Array<{ itemId: string; quantity: number }>;
  credits?: number;
  chests?: Array<{ chestType: "CLASSIC" | "UNCOMMON" | "RARE" | "LEGENDARY" | "DIVINE"; quantity: number }>;
};

type InboxMessage = {
  id: string;
  type: InboxMessageType;
  title: string;
  body: string;
  fromUserId: string;
  fromUsername: string;
  toUserId: string;
  toUsername: string;
  direction: "IN" | "OUT";
  peerUserId: string;
  peerUsername: string;
  createdAt: number;
  expiresAt: number;
  read: boolean;
  claimed: boolean;
  hasAttachments: boolean;
  attachments: InboxAttachment;
  combatReport?: Record<string, any> | null;
  meta?: {
    kind?: string;
    dayKey?: string;
    noonTs?: number;
    streakDay?: number;
    rewardGenerated?: boolean;
    openedAt?: number;
  } | null;
};

type InboxUnreadCounts = {
  total: number;
  byType: Partial<Record<InboxMessageType, number>>;
};

type InboxRecipientSuggestion = {
  userId: string;
  username: string;
  displayName: string;
  avatarUrl: string;
};

const RESOURCE_DEFS: ResourceDef[] = [
  { id: "carbone", name: "Carbone", rarity: 10, machine: "Raffinerie de Carbone", section: "construction" },
  { id: "titane", name: "Titane", rarity: 25, machine: "Fabrique de Titane", section: "construction" },
  { id: "osmium", name: "Osmium", rarity: 45, machine: "Compacteur d'Osmium", section: "construction" },
  { id: "adamantium", name: "Adamantium", rarity: 65, machine: "Synchrotron d'Adamantium", section: "construction" },
  { id: "magmatite", name: "Magmatite", rarity: 72, machine: "Collecteur de Magmatite", section: "research" },
  { id: "neodyme", name: "Neodyme", rarity: 75, machine: "Extracteur de Neodyme", section: "research" },
  { id: "chronium", name: "Chronium", rarity: 82, machine: "Accelerateur de Chronium", section: "research" },
  { id: "aetherium", name: "Aetherium", rarity: 88, machine: "Condensateur d'Aetherium", section: "research" },
  { id: "isotope7", name: "Isotope-7", rarity: 94, machine: "Centrifugeuse a Isotope-7", section: "research" },
  { id: "singulite", name: "Singulite", rarity: 100, machine: "Forge a Singulite", section: "research" }
];

const RESOURCE_NAME_EN: Record<ResourceId, string> = {
  carbone: "Carbon",
  titane: "Titanium",
  osmium: "Osmium",
  adamantium: "Adamantium",
  magmatite: "Magmatite",
  neodyme: "Neodymium",
  chronium: "Chronium",
  aetherium: "Aetherium",
  isotope7: "Isotope-7",
  singulite: "Singulite"
};

const RESOURCE_MACHINE_EN: Record<ResourceId, string> = {
  carbone: "Carbon Refinery",
  titane: "Titanium Factory",
  osmium: "Osmium Compactor",
  adamantium: "Adamantium Synchrotron",
  magmatite: "Magmatite Collector",
  neodyme: "Neodymium Extractor",
  chronium: "Chronium Accelerator",
  aetherium: "Aetherium Condenser",
  isotope7: "Isotope-7 Centrifuge",
  singulite: "Singulite Forge"
};

const resourceDisplayName = (resourceId: ResourceId, language: UILanguage): string => {
  const fallback = RESOURCE_DEFS.find((r) => r.id === resourceId)?.name ?? resourceId;
  return language === "en" ? RESOURCE_NAME_EN[resourceId] ?? fallback : fallback;
};

const resourceMachineDisplay = (resourceId: ResourceId, language: UILanguage): string => {
  const fallback = RESOURCE_DEFS.find((r) => r.id === resourceId)?.machine ?? resourceId;
  return language === "en" ? RESOURCE_MACHINE_EN[resourceId] ?? fallback : fallback;
};

const RESOURCE_MENU_SPRITES: Record<string, { x: number; y: number }> = {
  carbone: { x: 10, y: 10 },
  titane: { x: 100, y: 10 },
  osmium: { x: 190, y: 10 },
  adamantium: { x: 280, y: 10 },
  magmatite: { x: 370, y: 10 },
  neodyme: { x: 460, y: 10 },
  chronium: { x: 10, y: 100 },
  aetherium: { x: 100, y: 100 },
  isotope7: { x: 190, y: 100 },
  singulite: { x: 280, y: 100 }
};
const RESOURCE_MENU_SPRITE_SCALE = 0.24;
const RESOURCE_MENU_SPRITE_WIDTH = 550;
const RESOURCE_MENU_SPRITE_HEIGHT = 820;

const getResourceMenuSpriteStyle = (resourceId: string): CSSProperties => {
  const coords = RESOURCE_MENU_SPRITES[resourceId] ?? { x: 10, y: 10 };
  return {
    backgroundPosition: `${-coords.x * RESOURCE_MENU_SPRITE_SCALE}px ${-coords.y * RESOURCE_MENU_SPRITE_SCALE}px`,
    backgroundSize: `${RESOURCE_MENU_SPRITE_WIDTH * RESOURCE_MENU_SPRITE_SCALE}px ${RESOURCE_MENU_SPRITE_HEIGHT * RESOURCE_MENU_SPRITE_SCALE}px`
  };
};

const RESOURCE_STORAGE_COLLECTION = "hyperstructure";
const RESOURCE_STORAGE_KEY = "resources_state_v1";
const PENDING_BUILD_ROOM_ID = "__pending_build__";
const BASE_UNLOCKED_RESOURCE_IDS = ["carbone", "titane"];

const createClient = () => {
  const host = import.meta.env.VITE_NAKAMA_HOST ?? "127.0.0.1";
  const port = import.meta.env.VITE_NAKAMA_PORT ?? "7550";
  const ssl =
    typeof import.meta.env.VITE_NAKAMA_SSL === "string"
      ? import.meta.env.VITE_NAKAMA_SSL === "true"
      : Boolean(import.meta.env.PROD);
  const configuredServerKey = import.meta.env.VITE_NAKAMA_SERVER_KEY;
  if (import.meta.env.PROD && !configuredServerKey) {
    throw new Error("Missing VITE_NAKAMA_SERVER_KEY in production environment.");
  }
  const serverKey = configuredServerKey ?? "defaultkey";
  // Use a longer timeout to absorb occasional heavy authoritative RPC cycles.
  return new Client(serverKey, host, port, ssl, 20000);
};

const saveSession = (session: Session) => {
  localStorage.setItem(AUTH_SESSION_KEY, JSON.stringify({ token: session.token, refreshToken: session.refresh_token }));
};

const clearSavedSession = () => localStorage.removeItem(AUTH_SESSION_KEY);

const parseJsonObject = (raw: unknown): Record<string, any> => {
  if (raw === null || raw === undefined) return {};

  if (typeof raw === "object") {
    return raw as Record<string, any>;
  }

  if (typeof raw !== "string") return {};
  if (!raw.trim()) return {};

  try {
    const parsed = JSON.parse(raw);
    if (parsed && typeof parsed === "object") return parsed as Record<string, any>;
    if (typeof parsed === "string") {
      try {
        const parsedTwice = JSON.parse(parsed);
        return parsedTwice && typeof parsedTwice === "object" ? (parsedTwice as Record<string, any>) : {};
      } catch {
        return {};
      }
    }
    return {};
  } catch {
    return {};
  }
};

const normalizeInventoryRpcItems = (rpcResponse: any): InventoryViewItem[] => {
  const parsed = parseJsonObject(rpcResponse?.payload ?? rpcResponse);
  const nested = parseJsonObject(parsed?.payload);
  const source = Array.isArray(parsed?.items) ? parsed.items : Array.isArray(nested?.items) ? nested.items : [];

  return source
    .filter((it: any) => it && typeof it.id === "string")
    .map((it: any) => ({
      id: String(it.id),
      name: typeof it.name === "string" ? it.name : String(it.id),
      category: (it.category as InventoryViewItem["category"]) ?? "OTHER",
      quantity: Math.max(0, Math.floor(Number(it.quantity ?? 0))),
      chestType:
        typeof it.chestType === "string" &&
        ["CLASSIC", "UNCOMMON", "RARE", "LEGENDARY", "DIVINE"].includes(it.chestType)
          ? (it.chestType as InventoryViewItem["chestType"])
          : undefined,
      durationSeconds:
        typeof it.durationSeconds === "number" && Number.isFinite(it.durationSeconds) ? Math.max(0, Math.floor(it.durationSeconds)) : undefined
    }))
    .filter((it: InventoryViewItem) => it.quantity > 0);
};

const extractInventoryMapDropNotifications = (rpcResponse: any): number => {
  const parsed = parseJsonObject(rpcResponse?.payload ?? rpcResponse);
  const nested = parseJsonObject(parsed?.payload);
  const source = Object.keys(nested).length > 0 ? nested : parsed;
  const raw = Number(source?.mapDropNotifications ?? 0);
  if (!Number.isFinite(raw)) return 0;
  return Math.max(0, Math.floor(raw));
};

const sanitizeInventoryNotificationMap = (raw: unknown): Record<string, number> => {
  const out: Record<string, number> = {};
  if (!raw || typeof raw !== "object") return out;
  for (const [keyRaw, qtyRaw] of Object.entries(raw as Record<string, unknown>)) {
    const key = String(keyRaw || "").trim();
    const qty = Math.max(0, Math.floor(Number(qtyRaw ?? 0)));
    if (!key || qty <= 0) continue;
    out[key] = qty;
  }
  return out;
};

const inventoryNotificationStorageKeyForUser = (userId: string): string =>
  `${INVENTORY_UI_NOTIFS_KEY}_${String(userId || "").trim()}`;

const readPersistedInventoryNotificationState = (
  userId: string
): { inboxBadgeCount: number; pending: Record<string, number>; visible: Record<string, number> } => {
  const fallback = { inboxBadgeCount: 0, pending: {}, visible: {} };
  const uid = String(userId || "").trim();
  if (!uid) return fallback;
  try {
    const raw = localStorage.getItem(inventoryNotificationStorageKeyForUser(uid));
    if (!raw) return fallback;
    const parsed = parseJsonObject(raw);
    const inboxBadgeCount = Math.max(0, Math.floor(Number(parsed?.inboxBadgeCount ?? 0)));
    return {
      inboxBadgeCount,
      pending: sanitizeInventoryNotificationMap(parsed?.pending),
      visible: sanitizeInventoryNotificationMap(parsed?.visible)
    };
  } catch {
    return fallback;
  }
};

const writePersistedInventoryNotificationState = (
  userId: string,
  state: { inboxBadgeCount: number; pending: Record<string, number>; visible: Record<string, number> }
) => {
  const uid = String(userId || "").trim();
  if (!uid) return;
  try {
    const payload = {
      inboxBadgeCount: Math.max(0, Math.floor(Number(state.inboxBadgeCount ?? 0))),
      pending: sanitizeInventoryNotificationMap(state.pending),
      visible: sanitizeInventoryNotificationMap(state.visible)
    };
    localStorage.setItem(inventoryNotificationStorageKeyForUser(uid), JSON.stringify(payload));
  } catch {
    // ignore storage quota/private mode issues
  }
};

const toInventoryChestItemId = (rawChestType: string): string => {
  const normalized = String(rawChestType || "").trim().toUpperCase();
  if (normalized === "DIVINE") return "RESOURCE_CHEST_DIVINE";
  if (normalized === "LEGENDARY") return "RESOURCE_CHEST_LEGENDARY";
  if (normalized === "RARE") return "RESOURCE_CHEST_RARE";
  if (normalized === "UNCOMMON") return "RESOURCE_CHEST_UNCOMMON";
  return "RESOURCE_CHEST_CLASSIC";
};

const extractInventoryItemNotificationsFromClaim = (claimPayload: any): { total: number; byItemId: Record<string, number> } => {
  const source = claimPayload && typeof claimPayload === "object" ? claimPayload : {};
  const rewards = source.rewards && typeof source.rewards === "object" ? source.rewards : {};
  const byItemId: Record<string, number> = {};
  let total = 0;

  const push = (rawItemId: string, rawQty: unknown) => {
    const itemId = String(rawItemId || "").trim();
    const qty = Math.max(0, Math.floor(Number(rawQty ?? 0)));
    if (!itemId || qty <= 0) return;
    byItemId[itemId] = Math.max(0, Math.floor(Number(byItemId[itemId] ?? 0))) + qty;
    total += qty;
  };

  const items = Array.isArray(rewards.items) ? rewards.items : [];
  for (const it of items) {
    push(String(it?.itemId || ""), it?.quantity);
  }

  const chests = Array.isArray(rewards.chests) ? rewards.chests : [];
  for (const ch of chests) {
    push(toInventoryChestItemId(String(ch?.chestType || "")), ch?.quantity);
  }

  return { total, byItemId };
};

const normalizeHangarRpcSnapshot = (rpcResponse: any): HangarRpcSnapshot | null => {
  const parsed = parseJsonObject(rpcResponse?.payload ?? rpcResponse);
  const nested = parseJsonObject(parsed?.payload);
  const source = parseJsonObject(parsed?.hangar ?? nested?.hangar ?? parsed);
  const queueSource = Array.isArray(source?.queue) ? source.queue : [];
  const inventorySource = source?.inventory && typeof source.inventory === "object" ? source.inventory : {};
  const resourcesSource = source?.resources && typeof source.resources === "object" ? source.resources : {};
  const serverNowTs = Number(source?.serverNowTs ?? Math.floor(Date.now() / 1000));

  const queue: HangarQueueItem[] = queueSource
    .filter((entry: any) => entry && typeof entry.id === "string" && typeof entry.unitId === "string")
    .map((entry: any) => {
      const rawCost = entry.batchCost && typeof entry.batchCost === "object" ? entry.batchCost : {};
      const batchCost: ResourceCost = {};
      for (const key of Object.keys(rawCost) as ResourceId[]) {
        const amount = Number(rawCost[key] ?? 0);
        if (Number.isFinite(amount) && amount > 0) batchCost[key] = Math.ceil(amount);
      }
      return {
        id: entry.id,
        unitId: entry.unitId,
        category: entry.category === "defense" ? "defense" : "ship",
        quantity: Math.max(1, Math.floor(Number(entry.quantity ?? 1))),
        startAt: Math.floor(Number(entry.startAt ?? Math.floor(Date.now() / 1000))) * 1000,
        endAt: Math.floor(Number(entry.endAt ?? Math.floor(Date.now() / 1000))) * 1000,
        batchCost
      } as HangarQueueItem;
    })
    .sort((a, b) => a.startAt - b.startAt);

  const inventory: Record<string, number> = {};
  for (const key of Object.keys(inventorySource)) {
    const qty = Number(inventorySource[key] ?? 0);
    if (Number.isFinite(qty) && qty > 0) inventory[key] = Math.floor(qty);
  }

  const resources: Record<string, number> = {};
  for (const def of RESOURCE_DEFS) {
    const raw = Number(resourcesSource[def.id] ?? 0);
    resources[def.id] = Number.isFinite(raw) && raw > 0 ? raw : 0;
  }

  return {
    queue,
    inventory,
    resources,
    serverNowTs: Number.isFinite(serverNowTs) ? Math.floor(serverNowTs) : Math.floor(Date.now() / 1000)
  };
};

const extractRpcErrorMessage = (err: unknown): string => {
  const anyErr = err as any;
  if (typeof anyErr?.message === "string" && anyErr.message.trim().length > 0) return anyErr.message.trim();
  if (typeof anyErr?.error === "string" && anyErr.error.trim().length > 0) return anyErr.error.trim();
  return "";
};

const getErrorStatusCode = (err: unknown): number => {
  if (err instanceof Response) return err.status;
  const anyErr = err as any;
  const direct = Number(anyErr?.status ?? anyErr?.statusCode);
  if (Number.isFinite(direct) && direct > 0) return direct;
  const nested = Number(anyErr?.response?.status ?? anyErr?.cause?.status);
  if (Number.isFinite(nested) && nested > 0) return nested;
  return 0;
};

const isUnauthorizedError = (err: unknown): boolean => {
  const status = getErrorStatusCode(err);
  if (status === 401) return true;
  const message = extractRpcErrorMessage(err).toLowerCase();
  return message.includes("401") || message.includes("unauthorized");
};

const isRequestTimeoutError = (err: unknown): boolean => {
  const message = extractRpcErrorMessage(err).toLowerCase();
  return message.includes("timed out") || message.includes("timeout");
};

export default function App() {
  const [screen, setScreen] = useState<UIScreen>(() => {
    const raw = localStorage.getItem(UI_SCREEN_KEY);
    return raw === "game" ||
      raw === "hangar" ||
      raw === "population" ||
      raw === "alliance" ||
      raw === "ranking" ||
      raw === "profile" ||
      raw === "starmap" ||
      raw === "chat" ||
      raw === "resources" ||
      raw === "inventory" ||
      raw === "technology" ||
      raw === "wiki" ||
      raw === "inbox"
      ? raw
      : "home";
  });

  const [rooms, setRooms] = useState<Room[]>(defaultRooms);
  const [constructionJob, setConstructionJob] = useState<ConstructionJob | null>(null);
  const [credits, setCredits] = useState<number>(STARTING_CREDITS);
  const [zoom, setZoom] = useState<number>(BASE_ZOOM);
  const [pan, setPan] = useState({ x: 0, y: 200 });
  const [panMode, setPanMode] = useState<boolean>(false);

  const [buildSlot, setBuildSlot] = useState<{ x: number; y: number } | null>(null);
  const [activeRoom, setActiveRoom] = useState<Room | null>(null);
  const [technologyLevels, setTechnologyLevels] = useState<Record<TechnologyId, number>>(defaultTechnologyLevels);
  const [researchJob, setResearchJob] = useState<ResearchJob | null>(null);

  const [isPanning, setIsPanning] = useState(false);
  const [lastMouse, setLastMouse] = useState({ x: 0, y: 0 });

  const [draggedRoom, setDraggedRoom] = useState<Room | null>(null);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  const [dragGridPos, setDragGridPos] = useState<{ x: number; y: number } | null>(null);
  const [hasDragged, setHasDragged] = useState(false);

  const [nakamaStatus, setNakamaStatus] = useState<"connecting" | "online" | "offline">("connecting");
  const [playerId, setPlayerId] = useState<string>("");

  const [session, setSession] = useState<Session | null>(null);
  const [authChecking, setAuthChecking] = useState(true);
  const [showAuth, setShowAuth] = useState(false);
  const [authMode, setAuthMode] = useState<"login" | "signup">("login");
  const [authEmail, setAuthEmail] = useState("");
  const [authPassword, setAuthPassword] = useState("");
  const [authUsername, setAuthUsername] = useState("");
  const [authLanguage, setAuthLanguage] = useState<"fr" | "en">("fr");
  const [uiLanguage, setUiLanguage] = useState<UILanguage>(() => {
    const raw = localStorage.getItem(UI_LANG_KEY);
    return raw === "en" ? "en" : "fr";
  });
  const [authError, setAuthError] = useState("");
  const [authLoading, setAuthLoading] = useState(false);
  const [profileUsername, setProfileUsername] = useState("");
  const [profileEmail, setProfileEmail] = useState("");
  const [profileLanguage, setProfileLanguage] = useState<"fr" | "en">("fr");
  const [profileAvatar, setProfileAvatar] = useState("/avatars/avatar-01.png");
  const [profileServerEmail, setProfileServerEmail] = useState("");
  const [profileLoading, setProfileLoading] = useState(false);
  const [profileError, setProfileError] = useState("");
  const [profileSaved, setProfileSaved] = useState("");
  const [resourceAmounts, setResourceAmounts] = useState<Record<string, number>>(() => {
    const init: Record<string, number> = {};
    for (const r of RESOURCE_DEFS) init[r.id] = 0;
    return init;
  });
  const [unlockedResourceIds, setUnlockedResourceIds] = useState<string[]>(BASE_UNLOCKED_RESOURCE_IDS);
  const [resourceLoading, setResourceLoading] = useState(false);
  const [resourceError, setResourceError] = useState("");
  const [resourceOfflineSeconds, setResourceOfflineSeconds] = useState(0);
  const [resourceLastSavedAt, setResourceLastSavedAt] = useState<number | null>(null);
  const [inventoryItems, setInventoryItems] = useState<InventoryViewItem[]>([]);
  const [inventoryLoading, setInventoryLoading] = useState(false);
  const [inventoryError, setInventoryError] = useState("");
  const [inventoryActionLoadingId, setInventoryActionLoadingId] = useState("");
  const [inventoryLastSyncAt, setInventoryLastSyncAt] = useState<number | null>(null);
  const [inventoryServerBadgeCount, setInventoryServerBadgeCount] = useState(0);
  const [inventoryInboxBadgeCount, setInventoryInboxBadgeCount] = useState(0);
  const [inventoryPendingItemNotifications, setInventoryPendingItemNotifications] = useState<Record<string, number>>({});
  const [inventoryVisibleItemNotifications, setInventoryVisibleItemNotifications] = useState<Record<string, number>>({});
  const [chestLootSummary, setChestLootSummary] = useState<ChestLootSummary | null>(null);
  const [hangarQueue, setHangarQueue] = useState<HangarQueueItem[]>([]);
  const [hangarInventory, setHangarInventory] = useState<Record<string, number>>({});
  const [hangarServerResources, setHangarServerResources] = useState<Record<string, number> | null>(null);
  const [hangarLoading, setHangarLoading] = useState(false);
  const [hangarError, setHangarError] = useState("");
  const [hangarActionBusy, setHangarActionBusy] = useState(false);
  const [playerScorePoints, setPlayerScorePoints] = useState<number>(0);
  const [playerScoreRank, setPlayerScoreRank] = useState<number>(0);
  const [rankingPlayers, setRankingPlayers] = useState<any[]>([]);
  const [rankingAlliances, setRankingAlliances] = useState<any[]>([]);
  const [rankingLoading, setRankingLoading] = useState(false);
  const [rankingError, setRankingError] = useState("");
  const [inboxUnreadCount, setInboxUnreadCount] = useState(0);
  const [nowMs, setNowMs] = useState<number>(Date.now());
  const [serverClockOffsetMs, setServerClockOffsetMs] = useState<number>(0);
  const [constructionFxRoomId, setConstructionFxRoomId] = useState<string>("");
  const [vaultHydrated, setVaultHydrated] = useState<boolean>(false);
  const [vaultHydratedUserId, setVaultHydratedUserId] = useState<string>("");
  const [populationState, setPopulationState] = useState<PopulationState>(() => defaultPopulationState());
  const [mainMissionState, setMainMissionState] = useState<MainMissionState>(() => defaultMainMissionState());
  const processedMapSyncReportIdsRef = useRef<Record<string, boolean>>({});

  const client = useMemo(() => createClient(), []);
  const transformRef = useRef<HTMLDivElement>(null);
  const previousScreenRef = useRef<UIScreen>(screen);
  const rankingRpcInFlightRef = useRef(false);
  const rankingRpcBackoffUntilRef = useRef(0);
  const l = (fr: string, en: string) => (uiLanguage === "en" ? en : fr);
  const inventoryMenuBadgeCount = Math.max(0, inventoryServerBadgeCount + inventoryInboxBadgeCount);
  const mapWarmCommandementEscadreLevel = Math.max(0, Math.floor(Number(technologyLevels.commandement_escadre ?? 0)));
  const mapWarmCacheKey = useMemo(
    () => (session?.user_id ? `hsg_map_cache_v1_${String(session.user_id)}` : ""),
    [session?.user_id]
  );
  const roomByType = useMemo(() => {
    const map: Partial<Record<RoomType, Room>> = {};
    for (const room of rooms) map[room.type] = room;
    return map;
  }, [rooms]);

  const invalidateSession = useCallback(() => {
    clearSavedSession();
    setSession(null);
    setPlayerId("");
    setNakamaStatus("offline");
    setAuthPassword("");
    setProfileSaved("");
    setProfileError("");
    setShowAuth(false);
    setAuthChecking(false);
    processedMapSyncReportIdsRef.current = {};
  }, []);
  const entrepotLevel = roomByType.entrepot?.level ?? 1;
  const productionBonusesByResource = useMemo(() => technologyProductionBonuses(technologyLevels), [technologyLevels]);
  const buildingCostReductionFactor = useMemo(() => {
    const lvl = techLevelValue(technologyLevels, "automatisation_industrielle");
    const reduction = Math.min(0.3, lvl * 0.02);
    return 1 - reduction;
  }, [technologyLevels]);
  const buildingTimeReductionFactorFromTech = useMemo(() => {
    const lvl = techLevelValue(technologyLevels, "optimisation_logistique");
    const reduction = Math.min(0.3, lvl * 0.02);
    return 1 - reduction;
  }, [technologyLevels]);
  const storageCapacity = useMemo(() => computeStorageCapacity(entrepotLevel), [entrepotLevel]);
  const baseResourceRates = useMemo(() => {
    const map: Record<string, number> = {};
    for (const r of RESOURCE_DEFS) {
      const room = roomByType[r.id as RoomType];
      const level = room?.level ?? 0;
      map[r.id] = level > 0 ? computeProductionPerSecond(r.id as ResourceId, level, productionBonusesByResource[r.id as ResourceId] ?? 0) : 0;
    }
    return map;
  }, [productionBonusesByResource, roomByType]);
  const populationSnapshot = useMemo(
    () => getPopulationSnapshot(rooms, populationState, unlockedResourceIds.length, baseResourceRates),
    [baseResourceRates, populationState, rooms, unlockedResourceIds.length]
  );
  const buildingTimeReductionFactor = useMemo(
    () => clampNumber(buildingTimeReductionFactorFromTech * populationSnapshot.constructionTimeFactor, 0.4, 2.2),
    [buildingTimeReductionFactorFromTech, populationSnapshot.constructionTimeFactor]
  );
  const researchTimeFactor = useMemo(
    () => clampNumber(populationSnapshot.researchTimeFactor, 0.4, 2.2),
    [populationSnapshot.researchTimeFactor]
  );
  const resourceRates = useMemo(() => {
    const map: Record<string, number> = {};
    for (const r of RESOURCE_DEFS) {
      const baseRate = Number(baseResourceRates[r.id] ?? 0);
      map[r.id] = Math.max(0, baseRate * populationSnapshot.productionMultiplier);
    }
    return map;
  }, [baseResourceRates, populationSnapshot.productionMultiplier]);
  const resourceAmountsRef = useRef<Record<string, number>>({});
  const resourceUnlockedRef = useRef<string[]>(BASE_UNLOCKED_RESOURCE_IDS);
  const resourceTickRef = useRef<number>(Date.now());
  const resourceRatesRef = useRef<Record<string, number>>({});
  const storageCapacityRef = useRef<number>(storageCapacity);
  const populationStateRef = useRef<PopulationState>(defaultPopulationState());
  const avatarOptions = useMemo(
    () => [
      "/avatars/avatar-01.png",
      "/avatars/avatar-02.png",
      "/avatars/avatar-03.png",
      "/avatars/avatar-04.png",
      "/avatars/avatar-05.png",
      "/avatars/avatar-06.png"
    ],
    []
  );

  const applyAccount = (account: Awaited<ReturnType<Client["getAccount"]>>, fallbackSession: Session | null) => {
    const username = account.user?.username ?? fallbackSession?.username ?? fallbackSession?.user_id ?? "player";
    const lang = account.user?.lang_tag === "en" ? "en" : "fr";
    const avatar = account.user?.avatar_url?.trim() ? account.user.avatar_url : "/avatars/avatar-01.png";
    const draftEmail = localStorage.getItem(PROFILE_EMAIL_DRAFT_KEY);
    const email = (draftEmail?.trim() || account.email || "").trim();

    setPlayerId(username.slice(0, 20));
    setProfileUsername(username);
    setProfileLanguage(lang);
    setUiLanguage(lang);
    setProfileAvatar(avatar);
    setProfileEmail(email);
    setProfileServerEmail(account.email ?? "");
  };

  const grantCreditsToServer = useCallback(
    async (amount: number, claimId?: string) => {
      const delta = Math.max(0, Math.floor(Number(amount || 0)));
      if (delta <= 0 || !session) return;
      try {
        const rpc = await client.rpc(
          session,
          "economy_grant_credits",
          JSON.stringify({
            amount: delta,
            claimId: String(claimId || "").trim()
          })
        );
        const parsed = parseJsonObject((rpc as any)?.payload ?? rpc);
        const nested = parseJsonObject(parsed?.payload);
        const source = Object.keys(nested).length > 0 ? nested : parsed;
        const nextCredits = Number(source?.credits ?? source?.state?.premiumCredits ?? NaN);
        if (Number.isFinite(nextCredits) && nextCredits >= 0) {
          setCredits(Math.floor(nextCredits));
        }
      } catch (err) {
        if (isUnauthorizedError(err)) {
          invalidateSession();
          return;
        }
        setCredits((prev) => prev + delta);
        if (import.meta.env.DEV) {
          // eslint-disable-next-line no-console
          console.error("credit grant sync error", err);
        }
      }
    },
    [client, invalidateSession, session]
  );

  const loadCreditsFromServer = useCallback(async () => {
    if (!session) return;
    try {
      const rpc = await client.rpc(session, "economy_get_state", "{}");
      const parsed = parseJsonObject((rpc as any)?.payload ?? rpc);
      const nested = parseJsonObject(parsed?.payload);
      const source = Object.keys(nested).length > 0 ? nested : parsed;
      const nextCredits = Number(source?.state?.premiumCredits ?? source?.premiumCredits ?? NaN);
      if (Number.isFinite(nextCredits) && nextCredits >= 0) {
        setCredits(Math.floor(nextCredits));
      }
    } catch (err) {
      if (isUnauthorizedError(err)) {
        invalidateSession();
        return;
      }
      if (import.meta.env.DEV) {
        // eslint-disable-next-line no-console
        console.error("credit load error", err);
      }
    }
  }, [client, invalidateSession, session]);

  const applyResourceProduction = (base: Record<string, number>, seconds: number, unlocked: string[]) => {
    if (seconds <= 0) return base;
    const allowed = new Set(unlocked);
    const next = { ...base };
    const rates = Object.keys(resourceRatesRef.current).length ? resourceRatesRef.current : resourceRates;
    const cap = storageCapacityRef.current || storageCapacity;
    for (const def of RESOURCE_DEFS) {
      if (!allowed.has(def.id)) continue;
      const current = next[def.id] ?? 0;
      // If stock already exceeds storage (e.g. chest/fleet delivery), keep overflow and block production.
      if (current >= cap) continue;
      const produced = current + (rates[def.id] ?? 0) * seconds;
      next[def.id] = Math.min(cap, produced);
    }
    return next;
  };

  const persistResources = async () => {
    if (!session) return;
    try {
      await client.writeStorageObjects(session, [
        {
          collection: RESOURCE_STORAGE_COLLECTION,
          key: RESOURCE_STORAGE_KEY,
          permission_read: 1,
          permission_write: 1,
          value: {
            amounts: resourceAmountsRef.current,
            unlocked: resourceUnlockedRef.current,
            lastTick: resourceTickRef.current
          }
        }
      ]);
      setResourceLastSavedAt(Date.now());
    } catch (err) {
      if (isUnauthorizedError(err)) {
        invalidateSession();
      }
    }
  };

  const loadInventory = async (ackMapDropNotifications = false) => {
    if (!session) {
      setInventoryItems([]);
      setInventoryError("");
      return;
    }

    setInventoryLoading(true);
    setInventoryError("");
    try {
      const rpc = await client.rpc(
        session,
        "getinventory",
        JSON.stringify({ ackMapDropNotifications: Boolean(ackMapDropNotifications) })
      );
      const sanitized = normalizeInventoryRpcItems(rpc as any);
      setInventoryItems(sanitized);
      setInventoryServerBadgeCount(extractInventoryMapDropNotifications(rpc as any));
      setInventoryLastSyncAt(Date.now());
    } catch (err) {
      if (isUnauthorizedError(err)) {
        invalidateSession();
        return;
      }
      setInventoryError(l("Impossible de charger l'inventaire.", "Unable to load inventory."));
      if (import.meta.env.DEV) {
        // eslint-disable-next-line no-console
        console.error("inventory load error", err);
      }
    } finally {
      setInventoryLoading(false);
    }
  };

  const refreshInventoryMenuBadge = async (silent = true) => {
    if (!session) {
      setInventoryServerBadgeCount(0);
      return;
    }
    try {
      const rpc = await client.rpc(session, "getinventorymeta", "{}");
      setInventoryServerBadgeCount(extractInventoryMapDropNotifications(rpc as any));
    } catch (err) {
      if (isUnauthorizedError(err)) {
        invalidateSession();
        return;
      }
      if (!silent && import.meta.env.DEV) {
        // eslint-disable-next-line no-console
        console.error("inventory menu badge load error", err);
      }
    }
  };

  const applyHangarSnapshot = (snapshot: HangarRpcSnapshot, syncResourceAmounts = false) => {
    setHangarQueue(snapshot.queue);
    setHangarInventory(snapshot.inventory);
    setHangarServerResources(snapshot.resources);
    if (syncResourceAmounts) {
      setResourceAmounts((prev) => {
        const next = { ...prev };
        for (const def of RESOURCE_DEFS) {
          const raw = Number(snapshot.resources[def.id] ?? next[def.id] ?? 0);
          if (Number.isFinite(raw) && raw >= 0) next[def.id] = raw;
        }
        return next;
      });
    }
    if (Number.isFinite(snapshot.serverNowTs) && snapshot.serverNowTs > 0) {
      setServerClockOffsetMs(snapshot.serverNowTs * 1000 - Date.now());
    }
  };

  const loadHangarState = async (silent = false) => {
    if (!session) {
      setHangarQueue([]);
      setHangarInventory({});
      setHangarServerResources(null);
      setHangarError("");
      return;
    }
    if (!silent) setHangarLoading(true);
    setHangarError("");
    try {
      const rpc = await client.rpc(
        session,
        "hangar_get_state",
        "{}"
      );
      const snapshot = normalizeHangarRpcSnapshot(rpc as any);
      if (!snapshot) throw new Error("Invalid hangar payload.");
      applyHangarSnapshot(snapshot, false);
    } catch (err) {
      if (isUnauthorizedError(err)) {
        invalidateSession();
        return;
      }
      const details = extractRpcErrorMessage(err);
      setHangarError(details || l("Impossible de charger le Hangar.", "Unable to load Hangar state."));
      if (import.meta.env.DEV) {
        // eslint-disable-next-line no-console
        console.error("hangar load error", err);
      }
    } finally {
      if (!silent) setHangarLoading(false);
    }
  };

  const loadRankingState = async (silent = false) => {
    if (!session) {
      setPlayerScorePoints(0);
      setPlayerScoreRank(0);
      setRankingPlayers([]);
      setRankingAlliances([]);
      setRankingError("");
      return;
    }

    const now = Date.now();
    if (rankingRpcInFlightRef.current) return;
    if (now < rankingRpcBackoffUntilRef.current) return;

    if (!silent) setRankingLoading(true);
    setRankingError("");
    rankingRpcInFlightRef.current = true;
    try {
      const clientProgress = {
        rooms: rooms.map((room) => ({
          type: room.type,
          level: Math.max(0, Math.floor(Number(room.level || 0)))
        })),
        researchPoints: computeResearchInvestmentPoints(technologyLevels)
      };
      const rpc = await client.rpc(session, "ranking_get_state", JSON.stringify({ limit: 50, clientProgress }));
      const parsed = parseJsonObject((rpc as any)?.payload ?? rpc);
      const nested = parseJsonObject(parsed?.payload);
      const source = Object.keys(nested).length > 0 ? nested : parsed;
      const player = source?.player && typeof source.player === "object" ? source.player : {};
      const points = Number(player?.points?.total ?? 0);
      const rank = Number(player?.rank ?? 0);
      setPlayerScorePoints(Number.isFinite(points) ? Math.max(0, Math.floor(points)) : 0);
      setPlayerScoreRank(Number.isFinite(rank) ? Math.max(0, Math.floor(rank)) : 0);
      setRankingPlayers(Array.isArray(source?.playerTop) ? source.playerTop : []);
      setRankingAlliances(Array.isArray(source?.allianceTop) ? source.allianceTop : []);
    } catch (err) {
      if (isUnauthorizedError(err)) {
        invalidateSession();
        return;
      }
      const details = extractRpcErrorMessage(err);
      if (isRequestTimeoutError(err)) {
        rankingRpcBackoffUntilRef.current = Date.now() + 12000;
      }
      const baseMsg = l("Impossible de charger le classement.", "Unable to load ranking.");
      setRankingError(details ? `${baseMsg} (${details})` : baseMsg);
      if (import.meta.env.DEV) {
        // eslint-disable-next-line no-console
        console.error("ranking load error", err);
      }
    } finally {
      rankingRpcInFlightRef.current = false;
      if (!silent) setRankingLoading(false);
    }
  };

  const refreshInboxUnread = async (silent = true) => {
    if (!session) {
      setInboxUnreadCount(0);
      return;
    }
    try {
      const rpc = await client.rpc(
        session,
        "rpc_inbox_list",
        JSON.stringify({ type: "ALL", limit: 1 })
      );
      const parsed = parseJsonObject((rpc as any)?.payload ?? rpc);
      const unread =
        parsed?.unread && typeof parsed.unread === "object"
          ? Number(parsed.unread.total ?? 0)
          : 0;
      setInboxUnreadCount(Number.isFinite(unread) ? Math.max(0, Math.floor(unread)) : 0);
    } catch (err) {
      if (isUnauthorizedError(err)) {
        invalidateSession();
        return;
      }
      if (!silent && import.meta.env.DEV) {
        // eslint-disable-next-line no-console
        console.error("inbox unread load error", err);
      }
    }
  };

  useEffect(() => {
    if (!session?.user_id) return;
    void loadCreditsFromServer();
  }, [loadCreditsFromServer, session?.user_id]);

  useEffect(() => {
    const resetToDefaults = () => {
      setRooms(defaultRooms());
      setConstructionJob(null);
      setCredits(STARTING_CREDITS);
      setZoom(BASE_ZOOM);
      setPan({ x: 0, y: 200 });
      setBuildSlot(null);
      setActiveRoom(null);
      setDraggedRoom(null);
      setTechnologyLevels(defaultTechnologyLevels());
      setResearchJob(null);
      setPopulationState(defaultPopulationState());
      setMainMissionState(defaultMainMissionState());
      setUnlockedResourceIds(BASE_UNLOCKED_RESOURCE_IDS);
    };

    setVaultHydrated(false);
    setVaultHydratedUserId("");
    resetToDefaults();

    const userId = session?.user_id ?? "";
    if (!userId) {
      setVaultHydrated(true);
      setVaultHydratedUserId("");
      return;
    }

    const scopedSaveKey = vaultStorageKeyForUser(userId);
    try {
      let raw = localStorage.getItem(scopedSaveKey);

      if (!raw) {
        const legacyRaw = localStorage.getItem(SAVE_KEY);
        if (legacyRaw) {
          const legacyOwner = localStorage.getItem(SAVE_KEY_LEGACY_OWNER_KEY);
          if (!legacyOwner || legacyOwner === userId) {
            localStorage.setItem(SAVE_KEY_LEGACY_OWNER_KEY, userId);
            localStorage.setItem(scopedSaveKey, legacyRaw);
            raw = legacyRaw;
          }
        }
      }

      if (!raw) {
        setVaultHydrated(true);
        return;
      }

      const parsed = JSON.parse(raw) as {
        rooms?: Array<Omit<Room, "type"> & { type: string }>;
        credits?: number;
        caps?: number;
        zoom?: number;
        pan?: { x: number; y: number };
        constructionJob?: ConstructionJob | null;
        technologyLevels?: Partial<Record<TechnologyId, number>>;
        researchJob?: ResearchJob | null;
        populationState?: Partial<PopulationState>;
        mainMissionState?: Partial<MainMissionState>;
      };

      if (parsed.technologyLevels && typeof parsed.technologyLevels === "object") {
        const restoredLevels = defaultTechnologyLevels();
        for (const def of TECHNOLOGY_DEFS) {
          const rawLevel = Number(parsed.technologyLevels[def.id] ?? 0);
          const safe = Math.max(0, Math.floor(Number.isFinite(rawLevel) ? rawLevel : 0));
          restoredLevels[def.id] = def.maxLevel ? Math.min(def.maxLevel, safe) : safe;
        }
        setTechnologyLevels(restoredLevels);
      }

      if (Array.isArray(parsed.rooms)) {
        const sanitizedRooms = parsed.rooms.filter((room) => isRoomType(room.type)).map((room) => ({ ...room, type: room.type as RoomType }));
        if (sanitizedRooms.length > 0) {
          const hasCarbone = sanitizedRooms.some((r) => r.type === "carbone");
          const hasTitane = sanitizedRooms.some((r) => r.type === "titane");
          const restoredRooms = [...sanitizedRooms];
          if (!hasCarbone) restoredRooms.push({ id: "starter_carbone", x: 2, y: 0, width: 3, type: "carbone", level: 1 });
          if (!hasTitane) restoredRooms.push({ id: "starter_titane", x: 5, y: 0, width: 3, type: "titane", level: 1 });

          let restoredJob: ConstructionJob | null =
            parsed.constructionJob && typeof parsed.constructionJob === "object" && typeof parsed.constructionJob.endAt === "number"
              ? parsed.constructionJob
              : null;

          // Anti-perte: si la construction est deja terminee au reload, on l'applique immediatement.
          if (restoredJob && restoredJob.endAt <= Date.now()) {
            if (restoredJob.mode === "build") {
              const cfg = ROOM_CONFIG[restoredJob.roomType];
              const alreadyExists = restoredRooms.some((room) => room.type === restoredJob!.roomType && restoredJob!.roomType !== "entrepot");
              if (!alreadyExists) {
                restoredRooms.push({
                  id: makeId(),
                  x: restoredJob.x,
                  y: restoredJob.y,
                  width: cfg.width,
                  type: restoredJob.roomType,
                  level: 1
                });
              }
            } else {
              for (let i = 0; i < restoredRooms.length; i += 1) {
                if (restoredRooms[i].id === restoredJob.roomId) {
                  restoredRooms[i] = { ...restoredRooms[i], level: restoredJob.targetLevel };
                  break;
                }
              }
            }
            restoredJob = null;
            localStorage.setItem(
              scopedSaveKey,
              JSON.stringify({
                rooms: restoredRooms,
                credits: typeof parsed.credits === "number" ? parsed.credits : typeof parsed.caps === "number" ? parsed.caps : STARTING_CREDITS,
                zoom: typeof parsed.zoom === "number" ? parsed.zoom : BASE_ZOOM,
                pan: parsed.pan && typeof parsed.pan.x === "number" && typeof parsed.pan.y === "number" ? parsed.pan : { x: 0, y: 200 },
                constructionJob: null,
                technologyLevels: parsed.technologyLevels ?? defaultTechnologyLevels(),
                researchJob: parsed.researchJob ?? null,
                populationState: parsed.populationState ?? defaultPopulationState(),
                mainMissionState: parsed.mainMissionState ?? defaultMainMissionState()
              })
            );
          }

          setRooms(restoredRooms);
          if (restoredJob) setConstructionJob(restoredJob);
        }
      }

      if (parsed.researchJob && typeof parsed.researchJob === "object" && typeof parsed.researchJob.endAt === "number") {
        const techId = String(parsed.researchJob.technologyId ?? "") as TechnologyId;
        if (techId in TECHNOLOGY_BY_ID) {
          setResearchJob(parsed.researchJob as ResearchJob);
        }
      }

      if (parsed.populationState && typeof parsed.populationState === "object") {
        const fallback = defaultPopulationState();
        const hasOnboardingProtectionUntil =
          typeof parsed.populationState.onboardingProtectionUntil === "number" &&
          Number.isFinite(parsed.populationState.onboardingProtectionUntil) &&
          parsed.populationState.onboardingProtectionUntil > 0;
        const onboardingProtectionUntil = hasOnboardingProtectionUntil
          ? Math.max(0, Math.floor(Number(parsed.populationState.onboardingProtectionUntil)))
          : Date.now() + POPULATION_ONBOARDING_PROTECTION_MS;
        const legacySeed = !hasOnboardingProtectionUntil;
        const rawPopulation = Math.floor(Number(parsed.populationState.total ?? fallback.total));
        const seededPopulation = legacySeed
          ? Math.max(rawPopulation, POPULATION_ONBOARDING_START_TOTAL)
          : rawPopulation;
        const rawFoodStock = Math.max(0, Number(parsed.populationState.foodStock ?? fallback.foodStock));
        const seededFoodStock = legacySeed
          ? Math.max(rawFoodStock, POPULATION_ONBOARDING_START_FOOD)
          : rawFoodStock;
        const rawStability = clampNumber(Number(parsed.populationState.stability ?? fallback.stability), 0, 100);
        const seededStability = legacySeed
          ? Math.max(rawStability, POPULATION_ONBOARDING_START_STABILITY)
          : rawStability;
        const nextPopulation: PopulationState = {
          total: clampNumber(
            seededPopulation,
            POPULATION_MIN_VALUE,
            POPULATION_MAX_VALUE
          ),
          foodStock: seededFoodStock,
          stability: seededStability,
          isFamine: Boolean(parsed.populationState.isFamine ?? fallback.isFamine),
          onboardingProtectionUntil,
          lastTickAt: Math.max(0, Math.floor(Number(parsed.populationState.lastTickAt ?? fallback.lastTickAt))),
          lastEventRollAt: Math.max(0, Math.floor(Number(parsed.populationState.lastEventRollAt ?? fallback.lastEventRollAt))),
          lastCrisisRollAt: Math.max(0, Math.floor(Number(parsed.populationState.lastCrisisRollAt ?? fallback.lastCrisisRollAt))),
          activeEvent:
            parsed.populationState.activeEvent &&
            typeof parsed.populationState.activeEvent === "object" &&
            typeof parsed.populationState.activeEvent.type === "string" &&
            typeof parsed.populationState.activeEvent.endsAt === "number"
              ? {
                  type: parsed.populationState.activeEvent.type as PopulationEventType,
                  startedAt: Math.max(0, Math.floor(Number(parsed.populationState.activeEvent.startedAt ?? Date.now()))),
                  endsAt: Math.max(0, Math.floor(Number(parsed.populationState.activeEvent.endsAt)))
                }
              : null,
          activeCrisis:
            parsed.populationState.activeCrisis &&
            typeof parsed.populationState.activeCrisis === "object" &&
            typeof parsed.populationState.activeCrisis.type === "string" &&
            typeof parsed.populationState.activeCrisis.endsAt === "number"
              ? {
                  type: parsed.populationState.activeCrisis.type as PopulationCrisisType,
                  startedAt: Math.max(0, Math.floor(Number(parsed.populationState.activeCrisis.startedAt ?? Date.now()))),
                  endsAt: Math.max(0, Math.floor(Number(parsed.populationState.activeCrisis.endsAt)))
                }
              : null
        };
        setPopulationState(nextPopulation);
      }

      if (parsed.mainMissionState && typeof parsed.mainMissionState === "object") {
        const fallback = defaultMainMissionState();
        const rawActive = Array.isArray(parsed.mainMissionState.activeMissionIds)
          ? parsed.mainMissionState.activeMissionIds
          : [];
        const activeMissionIds = rawActive
          .map((id) => String(id))
          .filter((id) => Boolean(MAIN_MISSION_BY_ID[id]))
          .slice(0, 2);
        const planLength = MAIN_MISSION_PLAN.length;
        const nextIndex = clampNumber(
          Math.max(0, Math.floor(Number(parsed.mainMissionState.nextIndex ?? fallback.nextIndex))),
          0,
          planLength
        );
        const completedCount = clampNumber(
          Math.max(0, Math.floor(Number(parsed.mainMissionState.completedCount ?? fallback.completedCount))),
          0,
          planLength
        );
        const skippedCount = Math.max(0, Math.floor(Number(parsed.mainMissionState.skippedCount ?? fallback.skippedCount)));
        const totalRewardCredits = Math.max(0, Math.floor(Number(parsed.mainMissionState.totalRewardCredits ?? fallback.totalRewardCredits)));
        const lastRewardCredits = Math.max(0, Math.floor(Number(parsed.mainMissionState.lastRewardCredits ?? fallback.lastRewardCredits)));
        const lastRewardCount = Math.max(0, Math.floor(Number(parsed.mainMissionState.lastRewardCount ?? fallback.lastRewardCount)));
        const lastCompletedAt = Math.max(0, Math.floor(Number(parsed.mainMissionState.lastCompletedAt ?? fallback.lastCompletedAt)));
        const finished = Boolean(parsed.mainMissionState.finished) || (nextIndex >= planLength && activeMissionIds.length <= 0);
        const bootstrappedRaw = Boolean(parsed.mainMissionState.bootstrapped);
        const needsRefill = bootstrappedRaw && !finished && activeMissionIds.length <= 0 && nextIndex < planLength;
        const bootstrapped = needsRefill ? false : bootstrappedRaw;
        setMainMissionState({
          activeMissionIds,
          nextIndex,
          completedCount,
          skippedCount,
          totalRewardCredits,
          lastRewardCredits,
          lastRewardCount,
          lastCompletedAt,
          bootstrapped,
          finished
        });
      }

      if (typeof parsed.credits === "number") setCredits(parsed.credits);
      else if (typeof parsed.caps === "number") setCredits(parsed.caps);
      if (typeof parsed.zoom === "number") setZoom(parsed.zoom);
      if (parsed.pan && typeof parsed.pan.x === "number" && typeof parsed.pan.y === "number") setPan(parsed.pan);
      // constructionJob est restaure dans le bloc rooms ci-dessus pour garantir la coherence rooms/job.
    } catch {
      // ignore malformed local save
    } finally {
      setVaultHydrated(true);
      setVaultHydratedUserId(userId);
    }
  }, [session?.user_id]);

  useEffect(() => {
    if (!vaultHydrated) return;
    if (!session?.user_id) return;
    if (vaultHydratedUserId !== session.user_id) return;
    const scopedSaveKey = vaultStorageKeyForUser(session.user_id);
    localStorage.setItem(
      scopedSaveKey,
      JSON.stringify({ rooms, credits, zoom, pan, constructionJob, technologyLevels, researchJob, populationState, mainMissionState })
    );
  }, [rooms, credits, zoom, pan, constructionJob, technologyLevels, researchJob, populationState, mainMissionState, vaultHydrated, vaultHydratedUserId, session?.user_id]);

  useEffect(() => {
    localStorage.setItem(UI_SCREEN_KEY, screen);
  }, [screen]);

  useEffect(() => {
    localStorage.setItem(UI_LANG_KEY, uiLanguage);
  }, [uiLanguage]);

  useEffect(() => {
    resourceAmountsRef.current = resourceAmounts;
  }, [resourceAmounts]);

  useEffect(() => {
    resourceUnlockedRef.current = unlockedResourceIds;
  }, [unlockedResourceIds]);

  useEffect(() => {
    const builtResourceIds = rooms
      .map((room) => ROOM_CONFIG[room.type].resourceId)
      .filter((id): id is ResourceId => Boolean(id));
    setUnlockedResourceIds((prev) => {
      const merged = new Set([...prev, ...builtResourceIds, ...BASE_UNLOCKED_RESOURCE_IDS]);
      return [...merged];
    });
  }, [rooms]);

  useEffect(() => {
    const userId = session?.user_id ?? "";
    if (!userId) return;
    if (!vaultHydrated || vaultHydratedUserId !== userId) return;
    setMainMissionState((prev) => {
      if (prev.bootstrapped) return prev;
      const roomLevels = buildRoomLevelMap(rooms);
      const activeMissionIds: string[] = [];
      let nextIndex = 0;
      let skippedCount = 0;
      while (activeMissionIds.length < 2 && nextIndex < MAIN_MISSION_PLAN.length) {
        const mission = MAIN_MISSION_PLAN[nextIndex];
        nextIndex += 1;
        const currentLevel = Math.max(0, Math.floor(Number(roomLevels[mission.roomType] ?? 0)));
        if (currentLevel >= mission.targetLevel) {
          skippedCount += 1;
          continue;
        }
        activeMissionIds.push(mission.id);
      }
      const finished = activeMissionIds.length <= 0 && nextIndex >= MAIN_MISSION_PLAN.length;
      return {
        ...prev,
        activeMissionIds,
        nextIndex,
        completedCount: 0,
        skippedCount,
        totalRewardCredits: 0,
        lastRewardCredits: 0,
        lastRewardCount: 0,
        lastCompletedAt: 0,
        bootstrapped: true,
        finished
      };
    });
  }, [rooms, session?.user_id, vaultHydrated, vaultHydratedUserId]);

  useEffect(() => {
    const userId = session?.user_id ?? "";
    if (!userId) return;
    if (!vaultHydrated || vaultHydratedUserId !== userId) return;
    if (!mainMissionState.bootstrapped || mainMissionState.finished) return;
    if (mainMissionState.activeMissionIds.length <= 0) return;

    const roomLevels = buildRoomLevelMap(rooms);
    const completedNow = mainMissionState.activeMissionIds
      .map((missionId) => MAIN_MISSION_BY_ID[missionId])
      .filter((mission): mission is MainMissionDefinition => Boolean(mission))
      .filter((mission) => Math.max(0, Math.floor(Number(roomLevels[mission.roomType] ?? 0))) >= mission.targetLevel);

    if (completedNow.length <= 0) return;

    const completedIds = new Set(completedNow.map((mission) => mission.id));
    let rewardCredits = 0;
    for (const _mission of completedNow) {
      rewardCredits += randomIntBetween(MAIN_MISSION_REWARD_MIN, MAIN_MISSION_REWARD_MAX);
    }

    setMainMissionState((prev) => {
      if (!prev.bootstrapped) return prev;
      const stillActive = prev.activeMissionIds.filter((id) => !completedIds.has(id));
      let nextIndex = prev.nextIndex;
      let skippedCount = 0;
      while (stillActive.length < 2 && nextIndex < MAIN_MISSION_PLAN.length) {
        const mission = MAIN_MISSION_PLAN[nextIndex];
        nextIndex += 1;
        const currentLevel = Math.max(0, Math.floor(Number(roomLevels[mission.roomType] ?? 0)));
        if (currentLevel >= mission.targetLevel) {
          skippedCount += 1;
          continue;
        }
        stillActive.push(mission.id);
      }
      const finished = stillActive.length <= 0 && nextIndex >= MAIN_MISSION_PLAN.length;
      return {
        ...prev,
        activeMissionIds: stillActive,
        nextIndex,
        completedCount: prev.completedCount + completedNow.length,
        skippedCount: prev.skippedCount + skippedCount,
        totalRewardCredits: prev.totalRewardCredits + rewardCredits,
        lastRewardCredits: rewardCredits,
        lastRewardCount: completedNow.length,
        lastCompletedAt: Date.now(),
        finished
      };
    });

    if (rewardCredits > 0) {
      const claimId = `main_mission_${completedNow.map((mission) => mission.id).sort().join("_")}`;
      void grantCreditsToServer(rewardCredits, claimId);
    }
  }, [grantCreditsToServer, rooms, session?.user_id, mainMissionState, vaultHydrated, vaultHydratedUserId]);

  useEffect(() => {
    resourceRatesRef.current = resourceRates;
    storageCapacityRef.current = storageCapacity;
  }, [resourceRates, storageCapacity]);

  useEffect(() => {
    populationStateRef.current = populationState;
  }, [populationState]);

  useEffect(() => {
    if (!session) {
      const reset: Record<string, number> = {};
      for (const r of RESOURCE_DEFS) reset[r.id] = 0;
      setResourceAmounts(reset);
      setUnlockedResourceIds(BASE_UNLOCKED_RESOURCE_IDS);
      setResourceOfflineSeconds(0);
      setResourceError("");
      setInventoryItems([]);
      setInventoryError("");
      setInventoryLastSyncAt(null);
      setInventoryServerBadgeCount(0);
      setInventoryInboxBadgeCount(0);
      setInventoryPendingItemNotifications({});
      setInventoryVisibleItemNotifications({});
      setHangarQueue([]);
      setHangarInventory({});
      setHangarServerResources(null);
      setHangarLoading(false);
      setHangarActionBusy(false);
      setHangarError("");
      setServerClockOffsetMs(0);
      return;
    }

    let canceled = false;
    const loadResources = async () => {
      setResourceLoading(true);
      setResourceError("");
      try {
        const read = await client.readStorageObjects(session, {
          object_ids: [{ collection: RESOURCE_STORAGE_COLLECTION, key: RESOURCE_STORAGE_KEY, user_id: session.user_id }]
        });
        const stored = read.objects?.[0]?.value as { amounts?: Record<string, number>; unlocked?: string[]; lastTick?: number } | undefined;
        const now = Date.now();
        const base: Record<string, number> = {};
        for (const r of RESOURCE_DEFS) base[r.id] = 0;

        if (stored?.amounts && typeof stored.amounts === "object") {
          for (const key of Object.keys(base)) {
            const v = stored.amounts[key];
            base[key] = typeof v === "number" && Number.isFinite(v) ? v : 0;
          }
        }

        const unlocked = Array.isArray(stored?.unlocked) && stored!.unlocked!.length > 0 ? stored!.unlocked! : BASE_UNLOCKED_RESOURCE_IDS;
        const lastTick = typeof stored?.lastTick === "number" && stored.lastTick > 0 ? stored.lastTick : now;
        const offlineSeconds = Math.max(0, Math.floor((now - lastTick) / 1000));
        const produced = applyResourceProduction(base, offlineSeconds, unlocked);

        if (canceled) return;
        setUnlockedResourceIds(unlocked);
        setResourceAmounts(produced);
        setResourceOfflineSeconds(offlineSeconds);
        resourceTickRef.current = now;
      } catch (err) {
        if (!canceled) {
          // Force logout when refresh token is invalid/expired to stop 401 loop.
          // Other errors keep current behavior and show a transient resource error.
          if (isUnauthorizedError(err)) {
            invalidateSession();
            return;
          }
          setResourceError(l("Impossible de charger les ressources.", "Unable to load resources."));
        }
      } finally {
        if (!canceled) setResourceLoading(false);
      }
    };

    void loadResources();
    return () => {
      canceled = true;
    };
  }, [client, session, uiLanguage]);

  useEffect(() => {
    if (!session) return;
    if (screen !== "inventory" && screen !== "hangar" && screen !== "technology") return;
    void loadInventory(screen === "inventory");
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [screen, session]);

  useEffect(() => {
    if (!session) {
      setHangarQueue([]);
      setHangarInventory({});
      setHangarServerResources(null);
      setHangarError("");
      return;
    }
    if (screen !== "hangar") return;
    void loadHangarState();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [screen, session]);

  useEffect(() => {
    if (!session || screen !== "hangar") return;
    const interval = setInterval(() => {
      if (!hangarActionBusy) void loadHangarState(true);
    }, 5000);
    return () => clearInterval(interval);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [screen, session, hangarActionBusy]);

  useEffect(() => {
    if (!session) {
      setPlayerScorePoints(0);
      setPlayerScoreRank(0);
      setRankingPlayers([]);
      setRankingAlliances([]);
      setRankingLoading(false);
      setRankingError("");
      return;
    }
    void loadRankingState(screen !== "ranking");
    const pollEveryMs = screen === "ranking" ? 15000 : 45000;
    const interval = setInterval(() => {
      void loadRankingState(true);
    }, pollEveryMs);
    return () => clearInterval(interval);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [screen, session]);

  useEffect(() => {
    if (!session) {
      setInboxUnreadCount(0);
      return;
    }
    void refreshInboxUnread(true);
    const interval = setInterval(() => {
      void refreshInboxUnread(true);
    }, 15000);
    return () => clearInterval(interval);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [session]);

  useEffect(() => {
    if (!session) {
      setInventoryServerBadgeCount(0);
      setInventoryInboxBadgeCount(0);
      setInventoryPendingItemNotifications({});
      setInventoryVisibleItemNotifications({});
      return;
    }
    if (screen === "inventory") {
      setInventoryServerBadgeCount(0);
      return;
    }
    void refreshInventoryMenuBadge(true);
    const interval = setInterval(() => {
      void refreshInventoryMenuBadge(true);
    }, 15000);
    return () => clearInterval(interval);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [screen, session]);

  useEffect(() => {
    const prev = previousScreenRef.current;
    if (screen === "inventory" && prev !== "inventory") {
      const next: Record<string, number> = {};
      for (const [itemId, qtyRaw] of Object.entries(inventoryPendingItemNotifications)) {
        const qty = Math.max(0, Math.floor(Number(qtyRaw ?? 0)));
        if (!itemId || qty <= 0) continue;
        next[itemId] = qty;
      }
      setInventoryVisibleItemNotifications(next);
      setInventoryPendingItemNotifications({});
      setInventoryInboxBadgeCount(0);
      setInventoryServerBadgeCount(0);
    } else if (prev === "inventory" && screen !== "inventory") {
      setInventoryVisibleItemNotifications({});
    }
    previousScreenRef.current = screen;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [screen]);

  useEffect(() => {
    if (!session) return;
    if (screen !== "game") return;
    if (!constructionJob) return;
    void loadInventory();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [session, screen, constructionJob?.id]);

  useEffect(() => {
    if (!session) return;
    if (screen !== "game") return;
    if (!activeRoom || !constructionJob) return;
    if (constructionJob.mode !== "upgrade" || constructionJob.roomId !== activeRoom.id) return;
    void loadInventory();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [session, screen, activeRoom?.id, constructionJob?.id]);

  useEffect(() => {
    if (!session || resourceLoading) return;
    const interval = setInterval(() => {
      const now = Date.now();
      const elapsed = Math.max(1, Math.floor((now - resourceTickRef.current) / 1000));
      setPopulationState((prev) => {
        const snapshot = getPopulationSnapshot(rooms, prev, unlockedResourceIds.length, baseResourceRates);
        const stepSeconds = Math.max(1, Math.min(300, Math.floor((now - Math.max(0, prev.lastTickAt || 0)) / 1000) || elapsed));
        const next: PopulationState = {
          ...prev,
          total: clampNumber(Math.floor(Number(prev.total || 0)), POPULATION_MIN_VALUE, POPULATION_MAX_VALUE),
          foodStock: Math.max(0, Number(prev.foodStock || 0)),
          stability: clampNumber(Number(prev.stability || 0), 0, 100),
          onboardingProtectionUntil:
            typeof prev.onboardingProtectionUntil === "number" &&
            Number.isFinite(prev.onboardingProtectionUntil) &&
            prev.onboardingProtectionUntil > 0
              ? Math.max(0, Math.floor(prev.onboardingProtectionUntil))
              : now + POPULATION_ONBOARDING_PROTECTION_MS,
          lastTickAt: now
        };
        const onboardingProtectionActive = next.onboardingProtectionUntil > now;

        if (next.activeEvent && next.activeEvent.endsAt <= now) next.activeEvent = null;
        if (next.activeCrisis && next.activeCrisis.endsAt <= now) next.activeCrisis = null;
        if (onboardingProtectionActive) {
          if (next.activeEvent?.type === "epidemie" || next.activeEvent?.type === "greve_industrielle") {
            next.activeEvent = null;
          }
          next.activeCrisis = null;
        }

        const foodDelta = snapshot.foodBalancePerHour * (stepSeconds / 3600);
        next.foodStock = clampNumber(next.foodStock + foodDelta, 0, snapshot.foodCapacity);
        const foodShortageNow = next.foodStock <= 0 && snapshot.foodBalancePerHour < 0;
        if (foodShortageNow && !onboardingProtectionActive && !next.isFamine) {
          next.stability = clampNumber(next.stability - 20, 0, 100);
          next.isFamine = true;
        } else if ((!foodShortageNow || onboardingProtectionActive) && next.isFamine) {
          next.isFamine = false;
        }

        const isOverCapacityNow = next.total > snapshot.capacity;
        let growth = snapshot.growthPerHour * (stepSeconds / 3600);
        if (!onboardingProtectionActive && (isOverCapacityNow || foodShortageNow)) growth = 0;
        const freeCapacity = Math.max(0, snapshot.capacity - next.total);
        next.total = clampNumber(Math.floor(next.total + Math.min(growth, freeCapacity)), POPULATION_MIN_VALUE, POPULATION_MAX_VALUE);

        let stabilityDriftPerHour = 0;
        stabilityDriftPerHour += snapshot.housingScore >= 0 ? 1.2 + snapshot.housingScore * 1.8 : snapshot.housingScore * 4.2;
        stabilityDriftPerHour += snapshot.foodBalancePerHour >= 0 ? 0.9 : -5.4;
        stabilityDriftPerHour += snapshot.leisureScore * 1.35;
        stabilityDriftPerHour += snapshot.healthScore * 1.1;
        if (!onboardingProtectionActive && isOverCapacityNow) stabilityDriftPerHour -= 4.2;
        if (!onboardingProtectionActive && foodShortageNow) stabilityDriftPerHour -= 6.2;
        if (next.activeEvent?.type === "festival_orbital") stabilityDriftPerHour += 2.4;
        if (!onboardingProtectionActive && next.activeEvent?.type === "epidemie") stabilityDriftPerHour -= 3.2;
        if (!onboardingProtectionActive && next.activeEvent?.type === "greve_industrielle") stabilityDriftPerHour -= 1.8;
        if (!onboardingProtectionActive && next.activeCrisis) stabilityDriftPerHour -= 4.8;
        next.stability = clampNumber(next.stability + stabilityDriftPerHour * (stepSeconds / 3600), 0, 100);

        if (!onboardingProtectionActive && now - next.lastEventRollAt >= POPULATION_EVENT_ROLL_INTERVAL_MS) {
          next.lastEventRollAt = now;
          if (!next.activeEvent && Math.random() < 0.28) {
            next.activeEvent = nextPopulationEvent(now);
          }
        }

        if (next.activeCrisis && next.activeCrisis.endsAt <= now) next.activeCrisis = null;
        if (
          !onboardingProtectionActive &&
          now - next.lastCrisisRollAt >= POPULATION_CRISIS_ROLL_INTERVAL_MS &&
          next.stability < 40
        ) {
          next.lastCrisisRollAt = now;
          const chance = clampNumber((40 - next.stability) / 60, 0.08, 0.55);
          if (!next.activeCrisis && Math.random() < chance) {
            const crisis = nextPopulationCrisis(now);
            next.activeCrisis = crisis;
            if (crisis.type === "secession") {
              next.total = clampNumber(Math.floor(next.total * 0.95), POPULATION_MIN_VALUE, POPULATION_MAX_VALUE);
            }
          }
        }
        return next;
      });
      setResourceAmounts((prev) => applyResourceProduction(prev, elapsed, resourceUnlockedRef.current));
      resourceTickRef.current = now;
    }, 1000);
    return () => clearInterval(interval);
  }, [baseResourceRates, resourceLoading, rooms, session, unlockedResourceIds.length]);

  useEffect(() => {
    if (!session?.user_id) return;
    const persisted = readPersistedInventoryNotificationState(session.user_id);
    setInventoryInboxBadgeCount(persisted.inboxBadgeCount);
    setInventoryPendingItemNotifications(persisted.pending);
    setInventoryVisibleItemNotifications(persisted.visible);
    processedMapSyncReportIdsRef.current = {};
  }, [session?.user_id]);

  useEffect(() => {
    if (!session?.user_id) return;
    writePersistedInventoryNotificationState(session.user_id, {
      inboxBadgeCount: inventoryInboxBadgeCount,
      pending: inventoryPendingItemNotifications,
      visible: inventoryVisibleItemNotifications
    });
  }, [session?.user_id, inventoryInboxBadgeCount, inventoryPendingItemNotifications, inventoryVisibleItemNotifications]);

  useEffect(() => {
    if (!session || resourceLoading) return;
    const interval = setInterval(() => {
      void persistResources();
    }, 10000);
    return () => clearInterval(interval);
  }, [resourceLoading, session]);

  useEffect(() => {
    if (!session) return;
    const onHidden = () => {
      if (document.visibilityState === "hidden") {
        void persistResources();
      }
    };
    document.addEventListener("visibilitychange", onHidden);
    return () => {
      document.removeEventListener("visibilitychange", onHidden);
      void persistResources();
    };
  }, [session]);

  useEffect(() => {
    const restore = async () => {
      setAuthChecking(true);
      setNakamaStatus("connecting");

      const raw = localStorage.getItem(AUTH_SESSION_KEY);
      if (!raw) {
        setNakamaStatus("offline");
        setAuthChecking(false);
        return;
      }

      try {
        const parsed = JSON.parse(raw) as { token?: string; refreshToken?: string };
        if (!parsed.token || !parsed.refreshToken) throw new Error("Invalid stored session");

        let restored = Session.restore(parsed.token, parsed.refreshToken);
        const now = Math.floor(Date.now() / 1000);

        if (restored.isexpired(now)) {
          if (restored.isrefreshexpired(now)) throw new Error("Refresh session expired");
          restored = await client.sessionRefresh(restored);
        }

        if (restored.isexpired(Math.floor(Date.now() / 1000))) throw new Error("Session expired");

        try {
          const account = await client.getAccount(restored);
          applyAccount(account, restored);
        } catch (err) {
          if (isUnauthorizedError(err)) throw err;
          setPlayerId((restored.username ?? restored.user_id ?? "player").slice(0, 20));
        }
        setSession(restored);
        setNakamaStatus("online");
        saveSession(restored);
      } catch {
        invalidateSession();
      } finally {
        setAuthChecking(false);
      }
    };

    void restore();
  }, [client]);

  useEffect(() => {
    if (!authChecking && !session && screen !== "home") {
      setScreen("home");
    }
  }, [authChecking, screen, session]);

  useEffect(() => {
    if (!session) return;
    let cancelled = false;
    let refreshing = false;

    const ensureSessionFresh = async () => {
      if (refreshing) return;
      const now = Math.floor(Date.now() / 1000);
      if (!session.isexpired(now)) return;
      if (session.isrefreshexpired(now)) {
        if (!cancelled) invalidateSession();
        return;
      }
      refreshing = true;
      try {
        const refreshed = await client.sessionRefresh(session);
        if (cancelled) return;
        setSession(refreshed);
        saveSession(refreshed);
        setNakamaStatus("online");
      } catch {
        if (!cancelled) invalidateSession();
      } finally {
        refreshing = false;
      }
    };

    void ensureSessionFresh();
    const interval = window.setInterval(() => {
      void ensureSessionFresh();
    }, 15000);

    return () => {
      cancelled = true;
      window.clearInterval(interval);
    };
  }, [client, session?.token, session?.refresh_token]);

  useEffect(() => {
    const timer = setInterval(() => setNowMs(Date.now()), 1000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    if (!session || !session.user_id || !mapWarmCacheKey) return;
    let cancelled = false;
    let playersInFlight = false;
    let stateInFlight = false;
    let lastPlayersWarmAt = 0;

    const writeMapWarmCache = (patch: Record<string, any>) => {
      try {
        const previous = parseJsonObject(sessionStorage.getItem(mapWarmCacheKey));
        const next = {
          ...previous,
          ...patch,
          cachedAtMs: Date.now()
        } as Record<string, any>;
        const serverNowTs = Number(next.serverNowTs ?? previous.serverNowTs ?? 0);
        if (Number.isFinite(serverNowTs) && serverNowTs > 0) {
          next.serverNowTs = Math.max(0, Math.floor(serverNowTs));
        }
        sessionStorage.setItem(mapWarmCacheKey, JSON.stringify(next));
      } catch {
        // ignore sessionStorage failures
      }
    };

    const warmPlayers = async (force = false) => {
      if (playersInFlight) return;
      const now = Date.now();
      if (!force && now - lastPlayersWarmAt < 30000) return;
      playersInFlight = true;
      try {
        const rpc = await client.rpc(session, "rpc_map_players", JSON.stringify({ limit: 2000 }));
        if (cancelled) return;
        const parsed = parseJsonObject((rpc as any)?.payload ?? rpc);
        const nested = parseJsonObject(parsed?.payload);
        const source = Object.keys(nested).length > 0 ? nested : parsed;
        const rowsRaw = Array.isArray(source?.players) ? source.players : [];
        const rows = rowsRaw
          .map((row: any) => ({
            userId: String(row?.userId || "").trim(),
            username: String(row?.username || "").trim()
          }))
          .filter((row: { userId: string; username: string }) => row.userId.length > 0)
          .map((row: { userId: string; username: string }) => ({
            ...row,
            username: row.username || row.userId.slice(0, 8)
          }));
        writeMapWarmCache({ players: rows });
        lastPlayersWarmAt = now;
      } catch (err) {
        if (isUnauthorizedError(err) && !cancelled) {
          invalidateSession();
        }
      } finally {
        playersInFlight = false;
      }
    };

    const warmMapState = async () => {
      if (stateInFlight) return;
      stateInFlight = true;
      try {
        const rpc = await client.rpc(
          session,
          "rpc_map_fields_state",
          JSON.stringify({ commandementEscadreLevel: mapWarmCommandementEscadreLevel })
        );
        if (cancelled) return;
        const parsed = parseJsonObject((rpc as any)?.payload ?? rpc);
        const nested = parseJsonObject(parsed?.payload);
        const source = Object.keys(nested).length > 0 ? nested : parsed;

        const expeditionsRaw = Array.isArray(source?.expeditions) ? source.expeditions : [];
        const fallbackExpedition = parseJsonObject(source?.expedition);
        let serverNowTs = 0;
        for (const row of expeditionsRaw) {
          const expedition = parseJsonObject(row);
          serverNowTs = Math.max(serverNowTs, Math.max(0, Math.floor(Number(expedition?.serverNowTs ?? 0))));
        }
        if (serverNowTs <= 0 && Object.keys(fallbackExpedition).length > 0) {
          serverNowTs = Math.max(0, Math.floor(Number(fallbackExpedition?.serverNowTs ?? 0)));
        }
        if (serverNowTs <= 0) {
          serverNowTs = Math.floor(Date.now() / 1000);
        }

        writeMapWarmCache({
          fields: Array.isArray(source?.fields) ? source.fields : [],
          expedition: source?.expedition ?? null,
          expeditions: expeditionsRaw,
          reports: Array.isArray(source?.reports) ? source.reports : [],
          harvestInventory: Array.isArray(source?.harvestInventory) ? source.harvestInventory : [],
          maxActiveExpeditions: Math.max(1, Math.floor(Number(source?.maxActiveExpeditions ?? 1))),
          serverNowTs
        });
      } catch (err) {
        if (isUnauthorizedError(err) && !cancelled) {
          invalidateSession();
        }
      } finally {
        stateInFlight = false;
      }
    };

    void warmPlayers(true);
    void warmMapState();

    const interval = window.setInterval(() => {
      void warmPlayers(screen === "starmap");
      void warmMapState();
    }, screen === "starmap" ? 6000 : 15000);

    return () => {
      cancelled = true;
      window.clearInterval(interval);
    };
  }, [client, invalidateSession, mapWarmCacheKey, mapWarmCommandementEscadreLevel, screen, session]);

  useEffect(() => {
    if (!constructionJob) return;
    if (nowMs < constructionJob.endAt) return;

    if (constructionJob.mode === "build") {
      const cfg = ROOM_CONFIG[constructionJob.roomType];
      setRooms((prev) => {
        if (prev.some((room) => room.type === constructionJob.roomType && constructionJob.roomType !== "entrepot")) {
          return prev;
        }
        const newId = makeId();
        setConstructionFxRoomId(newId);
        return [
          ...prev,
          {
            id: newId,
            x: constructionJob.x,
            y: constructionJob.y,
            width: cfg.width,
            type: constructionJob.roomType,
            level: 1
          }
        ];
      });
    } else {
      setRooms((prev) =>
        prev.map((room) => {
          if (room.id !== constructionJob.roomId) return room;
          setConstructionFxRoomId(room.id);
          return { ...room, level: constructionJob.targetLevel };
        })
      );
    }

    setConstructionJob(null);
  }, [constructionJob, nowMs]);

  useEffect(() => {
    if (!researchJob) return;
    if (nowMs < researchJob.endAt) return;
    setTechnologyLevels((prev) => ({
      ...prev,
      [researchJob.technologyId]: Math.max(prev[researchJob.technologyId] ?? 0, researchJob.targetLevel)
    }));
    setResearchJob(null);
  }, [nowMs, researchJob]);

  useEffect(() => {
    if (!constructionFxRoomId) return;
    const timer = setTimeout(() => setConstructionFxRoomId(""), 1800);
    return () => clearTimeout(timer);
  }, [constructionFxRoomId]);

  const stats = useMemo(() => {
    const total = {
      buildings: 0,
      unlocked: unlockedResourceIds.length,
      totalProduction: 0,
      storageCapacity,
      queueBusy: Boolean(constructionJob)
    };

    for (const room of rooms) {
      if (room.type === "entrance") continue;
      total.buildings += 1;
    }
    for (const id of unlockedResourceIds) {
      total.totalProduction += resourceRates[id] ?? 0;
    }

    return total;
  }, [constructionJob, resourceRates, rooms, storageCapacity, unlockedResourceIds]);

  const onAuthSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setAuthError("");

    const email = authEmail.trim().toLowerCase();
    const password = authPassword;
    const username = authUsername.trim();
    const language = authLanguage;

    if (!email || !password) {
      setAuthError(l("Email et mot de passe requis.", "Email and password required."));
      return;
    }

    if (authMode === "signup" && username.length < 3) {
      setAuthError(l("Pseudo minimum: 3 caracteres.", "Minimum username length: 3 characters."));
      return;
    }

    setAuthLoading(true);
    setNakamaStatus("connecting");

    try {
      const nextSession = authMode === "signup"
        ? await client.authenticateEmail(email, password, true, username, { lang: language })
        : await client.authenticateEmail(email, password, false);

      saveSession(nextSession);
      setSession(nextSession);
      try {
        const account = await client.getAccount(nextSession);
        applyAccount(account, nextSession);
      } catch {
        setPlayerId((nextSession.username ?? nextSession.user_id ?? "player").slice(0, 20));
      }
      setNakamaStatus("online");
      setAuthPassword("");
      setShowAuth(false);
      setUiLanguage(language);
      setScreen("game");
    } catch (err) {
      setNakamaStatus("offline");
      const status = getErrorStatusCode(err);
      const rawDetails = extractRpcErrorMessage(err);
      const details =
        typeof rawDetails === "string" && rawDetails.trim().length > 0
          ? rawDetails.trim().replace(/\s+/g, " ").slice(0, 160)
          : "";
      if (import.meta.env.DEV) {
        // eslint-disable-next-line no-console
        console.error("auth submit error", { status, details, err });
      }
      if (authMode === "signup") {
        if (status === 409 || details.toLowerCase().includes("already")) {
          setAuthError(l("Inscription impossible: email deja utilise.", "Sign-up failed: email already in use."));
        } else if (details) {
          setAuthError(l(`Inscription impossible (${details}).`, `Sign-up failed (${details}).`));
        } else {
          setAuthError(l("Inscription impossible. Reessaie dans quelques secondes.", "Sign-up failed. Try again in a few seconds."));
        }
      } else if (status === 401) {
        setAuthError(l("Connexion refusee. Verifie ton email (pas le pseudo) et ton mot de passe.", "Login denied. Check your email (not username) and password."));
      } else if (status >= 500) {
        setAuthError(l("Serveur indisponible temporairement. Reessaie.", "Server temporarily unavailable. Try again."));
      } else if (details) {
        setAuthError(l(`Connexion impossible (${details}).`, `Login failed (${details}).`));
      } else {
        setAuthError(l("Connexion refusee. Verifie email/mot de passe.", "Login failed. Check email/password."));
      }
    } finally {
      setAuthLoading(false);
    }
  };

  const logout = () => {
    invalidateSession();
    setScreen("home");
  };

  const saveProfile = async (e: FormEvent) => {
    e.preventDefault();
    if (!session) return;

    const username = profileUsername.trim();
    const email = profileEmail.trim();
    if (username.length < 3) {
      setProfileError("Pseudo minimum: 3 caracteres.");
      setProfileSaved("");
      return;
    }

    setProfileLoading(true);
    setProfileError("");
    setProfileSaved("");

    try {
      await client.updateAccount(session, {
        username,
        lang_tag: profileLanguage,
        avatar_url: profileAvatar
      });

      setPlayerId(username.slice(0, 20));
      localStorage.setItem(PROFILE_EMAIL_DRAFT_KEY, email);

      if (email && profileServerEmail && email.toLowerCase() !== profileServerEmail.toLowerCase()) {
        setProfileSaved("Profil enregistre. Email mis a jour localement.");
      } else {
        setProfileSaved("Profil mis a jour.");
      }
      setUiLanguage(profileLanguage);
    } catch {
      setProfileError("Impossible d'enregistrer le profil pour le moment.");
    } finally {
      setProfileLoading(false);
    }
  };

  const getGridCoords = (clientX: number, clientY: number) => {
    if (!transformRef.current) return null;
    const rect = transformRef.current.getBoundingClientRect();
    const xPx = (clientX - rect.left) / zoom;
    const yPx = (rect.bottom - clientY) / zoom;
    const gridX = Math.floor((xPx - 4) / CELL_WIDTH);
    const gridY = Math.floor((yPx - 4) / CELL_HEIGHT);
    return { x: gridX, y: gridY };
  };

  const isLocationValid = (room: Room, x: number, y: number) => {
    if (x < 0 || x + room.width > GRID_WIDTH || y < 0) return false;
    return !rooms.some((r) => {
      if (r.id === room.id) return false;
      return r.y === y && x < r.x + r.width && x + room.width > r.x;
    });
  };

  const getAvailableSpace = (startX: number, startY: number) => {
    let minX = startX;
    let maxX = startX;

    for (let x = startX - 1; x >= 0; x -= 1) {
      const blocked = rooms.some((r) => r.y === startY && x >= r.x && x < r.x + r.width);
      if (blocked) break;
      minX = x;
    }

    for (let x = startX + 1; x < GRID_WIDTH; x += 1) {
      const blocked = rooms.some((r) => r.y === startY && x >= r.x && x < r.x + r.width);
      if (blocked) break;
      maxX = x;
    }

    return { minX, maxX, width: maxX - minX + 1 };
  };

  const findAutoBuildSlot = (type: RoomType): { x: number; y: number } | null => {
    const width = ROOM_CONFIG[type].width;
    const searchMaxY = Math.max(8, Math.max(...rooms.map((r) => r.y), 0) + 4);
    for (let y = 0; y <= searchMaxY; y += 1) {
      for (let x = 0; x <= GRID_WIDTH - width; x += 1) {
        const blocked = rooms.some((r) => r.y === y && x < r.x + r.width && x + width > r.x);
        if (!blocked) return { x, y };
      }
    }
    return null;
  };

  const startBuildAt = (type: RoomType, slot: { x: number; y: number }) => {
    if (!session) return;
    if (constructionJob) return;
    if (rooms.some((room) => room.type === type)) return;
    if (!isPopulationBuildingUnlocked(type, populationSnapshot.totalPopulation)) return;

    const cost = costForLevel(type, 1, buildingCostReductionFactor);
    if (!canAffordCost(resourceAmountsRef.current, cost)) return;

    const cfg = ROOM_CONFIG[type];
    const space = getAvailableSpace(slot.x, slot.y);
    if (cfg.width > space.width) return;

    let finalX = slot.x;
    if (finalX + cfg.width - 1 > space.maxX) finalX = space.maxX - cfg.width + 1;
    finalX = Math.max(finalX, space.minX);

    setResourceAmounts((prev) => applyCostDelta(prev, cost, -1));
    setConstructionJob({
      id: makeId(),
      mode: "build",
      roomType: type,
      x: finalX,
      y: slot.y,
      targetLevel: 1,
      startedAt: Date.now(),
      endAt: Date.now() + buildSecondsForLevel(type, 1, buildingTimeReductionFactor) * 1000,
      costPaid: cost
    });
    const resourceId = ROOM_CONFIG[type].resourceId;
    if (resourceId && !unlockedResourceIds.includes(resourceId)) {
      setUnlockedResourceIds((prev) => [...prev, resourceId]);
    }
  };

  const onGridMouseDown = (e: React.MouseEvent) => {
    if (!session) return;
    const shouldPan = e.button === 2 || panMode;
    if (shouldPan) {
      e.preventDefault();
      setIsPanning(true);
      setLastMouse({ x: e.clientX, y: e.clientY });
    }
  };

  const onRoomMouseDown = (e: React.MouseEvent, room: Room) => {
    if (!session || panMode || e.button !== 0) return;
    e.stopPropagation();

    const coords = getGridCoords(e.clientX, e.clientY);
    if (!coords) return;

    setDraggedRoom(room);
    setHasDragged(false);
    setDragOffset({ x: coords.x - room.x, y: coords.y - room.y });
    setDragGridPos({ x: room.x, y: room.y });
  };

  const onGridMouseMove = (e: React.MouseEvent) => {
    if (!session) return;

    if (isPanning) {
      setPan((prev) => ({ x: prev.x + (e.clientX - lastMouse.x), y: prev.y + (e.clientY - lastMouse.y) }));
      setLastMouse({ x: e.clientX, y: e.clientY });
      return;
    }

    if (!draggedRoom) return;
    setHasDragged(true);

    const coords = getGridCoords(e.clientX, e.clientY);
    if (!coords) return;

    const clampedX = Math.max(0, Math.min(coords.x - dragOffset.x, GRID_WIDTH - draggedRoom.width));
    const clampedY = Math.max(0, coords.y - dragOffset.y);
    setDragGridPos({ x: clampedX, y: clampedY });
  };

  const onGridMouseUp = (e: React.MouseEvent) => {
    if (!session) return;

    if (e.button === 2 || isPanning) {
      setIsPanning(false);
      return;
    }

    if (e.button !== 0 || !draggedRoom) return;

    if (!hasDragged) {
      setActiveRoom(draggedRoom);
    } else if (dragGridPos && isLocationValid(draggedRoom, dragGridPos.x, dragGridPos.y)) {
      setRooms((prev) => prev.map((r) => (r.id === draggedRoom.id ? { ...r, x: dragGridPos.x, y: dragGridPos.y } : r)));
    }

    setDraggedRoom(null);
    setDragGridPos(null);
  };

  const onBuild = (type: RoomType) => {
    if (!buildSlot) return;
    if (!isPopulationBuildingUnlocked(type, populationSnapshot.totalPopulation)) return;
    startBuildAt(type, buildSlot);
    setBuildSlot(null);
  };

  const onUpgrade = (room: Room) => {
    if (!session) return;
    if (constructionJob) return;
    const cfg = ROOM_CONFIG[room.type];
    if (room.level >= cfg.maxLevel) return;

    const targetLevel = room.level + 1;
    const cost = costForLevel(room.type, targetLevel, buildingCostReductionFactor);
    if (!canAffordCost(resourceAmountsRef.current, cost)) return;

    setResourceAmounts((prev) => applyCostDelta(prev, cost, -1));
    setConstructionJob({
      id: makeId(),
      mode: "upgrade",
      roomId: room.id,
      roomType: room.type,
      targetLevel,
      startedAt: Date.now(),
      endAt: Date.now() + buildSecondsForLevel(room.type, targetLevel, buildingTimeReductionFactor) * 1000,
      costPaid: cost
    });
    setActiveRoom(null);
  };

  const onCancelConstruction = () => {
    if (!constructionJob) return;
    const refundable =
      constructionJob.costPaid && typeof constructionJob.costPaid === "object"
        ? (constructionJob.costPaid as ResourceCost)
        : {};
    setResourceAmounts((prev) => applyCostDelta(prev, refundable, 1));

    if (constructionJob.mode === "build") {
      const resourceId = ROOM_CONFIG[constructionJob.roomType].resourceId;
      if (resourceId) {
        setUnlockedResourceIds((prev) => {
          const isAlreadyBuilt = rooms.some((room) => room.type === constructionJob.roomType);
          if (isAlreadyBuilt || resourceId === "carbone" || resourceId === "titane") return prev;
          return prev.filter((id) => id !== resourceId);
        });
      }
    }

    setConstructionJob(null);
  };

  const resetAll = () => {
    if (session?.user_id) {
      localStorage.removeItem(vaultStorageKeyForUser(session.user_id));
      const legacyOwner = localStorage.getItem(SAVE_KEY_LEGACY_OWNER_KEY);
      if (legacyOwner === session.user_id) {
        localStorage.removeItem(SAVE_KEY);
        localStorage.removeItem(SAVE_KEY_LEGACY_OWNER_KEY);
      }
    } else {
      localStorage.removeItem(SAVE_KEY);
    }
    setRooms(defaultRooms());
    setCredits(STARTING_CREDITS);
    setZoom(BASE_ZOOM);
    setPan({ x: 0, y: 200 });
    setBuildSlot(null);
    setActiveRoom(null);
    setDraggedRoom(null);
    setConstructionJob(null);
    setTechnologyLevels(defaultTechnologyLevels());
    setResearchJob(null);
    setHangarQueue([]);
    setHangarInventory({});
    setHangarServerResources(null);
    setPopulationState(defaultPopulationState());
    setMainMissionState(defaultMainMissionState());
    setUnlockedResourceIds(BASE_UNLOCKED_RESOURCE_IDS);
    const resetAmounts: Record<string, number> = {};
    for (const r of RESOURCE_DEFS) resetAmounts[r.id] = 0;
    setResourceAmounts(resetAmounts);
  };

  const maxRoomY = rooms.length ? Math.max(...rooms.map((r) => r.y)) : 0;
  const dragY = dragGridPos?.y ?? 0;
  const gridHeight = Math.max(2, maxRoomY + 2, dragY + 2);
  const constructionRemainingSeconds = constructionJob ? Math.max(0, Math.floor((constructionJob.endAt - nowMs) / 1000)) : 0;
  const plannerItems = useMemo(() => {
    const items: Array<{
      key: string;
      mode: "construction" | "amelioration";
      roomType: RoomType;
      roomId?: string;
      name: string;
      targetLevel: number;
      etaSec: number;
      cost: ResourceCost;
    }> = [];

    for (const type of BUILDABLE_ROOMS) {
      const exists = rooms.some((r) => r.type === type);
      if (exists) continue;
      if (!isPopulationBuildingUnlocked(type, populationSnapshot.totalPopulation)) continue;
      const hasSlot = Boolean(findAutoBuildSlot(type));
      if (!hasSlot) continue;
      const cost = costForLevel(type, 1, buildingCostReductionFactor);
      const affordable = canAffordCost(resourceAmounts, cost);
      if (!affordable) continue;
      items.push({
        key: `build_${type}`,
        mode: "construction",
        roomType: type,
        name: roomDisplayName(type, uiLanguage),
        targetLevel: 1,
        etaSec: buildSecondsForLevel(type, 1, buildingTimeReductionFactor),
        cost
      });
    }

    for (const room of rooms) {
      if (room.type === "entrance") continue;
      const targetLevel = room.level + 1;
      const cost = costForLevel(room.type, targetLevel, buildingCostReductionFactor);
      const affordable = canAffordCost(resourceAmounts, cost);
      if (!affordable) continue;
      items.push({
        key: `upgrade_${room.id}`,
        mode: "amelioration",
        roomType: room.type,
        roomId: room.id,
        name: roomDisplayName(room.type, uiLanguage),
        targetLevel,
        etaSec: buildSecondsForLevel(room.type, targetLevel, buildingTimeReductionFactor),
        cost
      });
    }

    return items.slice(0, 14);
  }, [
    buildingCostReductionFactor,
    buildingTimeReductionFactor,
    populationSnapshot.totalPopulation,
    resourceAmounts,
    rooms,
    uiLanguage
  ]);

  const onPlannerLaunch = (item: {
    mode: "construction" | "amelioration";
    roomType: RoomType;
    roomId?: string;
  }) => {
    if (constructionJob) return;
    if (item.mode === "construction") {
      if (!isPopulationBuildingUnlocked(item.roomType, populationSnapshot.totalPopulation)) return;
      const slot = findAutoBuildSlot(item.roomType);
      if (!slot) return;
      startBuildAt(item.roomType, slot);
      return;
    }
    if (!item.roomId) return;
    const room = rooms.find((r) => r.id === item.roomId);
    if (!room) return;
    onUpgrade(room);
  };

  const activeMainMissions = useMemo(
    () =>
      mainMissionState.activeMissionIds
        .map((missionId) => MAIN_MISSION_BY_ID[missionId])
        .filter((mission): mission is MainMissionDefinition => Boolean(mission)),
    [mainMissionState.activeMissionIds]
  );
  const missionMainProgressPct = Math.max(
    0,
    Math.min(
      100,
      Math.round(
        ((mainMissionState.completedCount + mainMissionState.skippedCount) / Math.max(1, MAIN_MISSION_PLAN.length)) * 100
      )
    )
  );

  const launchResearch = (techId: TechnologyId) => {
    if (!session) return;
    if (researchJob) return;
    const def = TECHNOLOGY_BY_ID[techId];
    if (!def) return;
    const currentLevel = techLevelValue(technologyLevels, techId);
    if (def.maxLevel && currentLevel >= def.maxLevel) return;
    if (!technologyRequirementsMet(technologyLevels, def)) return;

    const targetLevel = currentLevel + 1;
    const cost = technologyCostForLevel(def, targetLevel);
    if (!canAffordCost(resourceAmountsRef.current, cost)) return;
    const baseDurationSec = technologyTimeForLevel(def, targetLevel);
    const durationSec = Math.max(1, Math.floor(baseDurationSec * researchTimeFactor));

    setResourceAmounts((prev) => applyCostDelta(prev, cost, -1));
    setResearchJob({
      id: makeId(),
      technologyId: techId,
      targetLevel,
      startedAt: Date.now(),
      endAt: Date.now() + durationSec * 1000,
      costPaid: cost
    });
  };

  const researchRemainingSeconds = researchJob ? Math.max(0, Math.floor((researchJob.endAt - nowMs) / 1000)) : 0;
  const displayedScorePoints = formatDisplayedScoreValue(playerScorePoints);
  const populationFillPct = clampNumber(
    (populationSnapshot.totalPopulation / Math.max(1, populationSnapshot.capacity)) * 100,
    0,
    100
  );
  const populationFoodFillPct = clampNumber(
    (populationSnapshot.foodStock / Math.max(1, populationSnapshot.foodCapacity)) * 100,
    0,
    100
  );
  const populationGrowthPctPerHour =
    populationSnapshot.totalPopulation > 0
      ? (populationSnapshot.growthPerHour / Math.max(1, populationSnapshot.totalPopulation)) * 100
      : 0;
  const populationProtectionDaysLeft = populationSnapshot.onboardingProtectionActive
    ? Math.max(1, Math.ceil(populationSnapshot.onboardingProtectionRemainingSec / 86400))
    : 0;
  const inventoryBoostTargets = useMemo<InventoryBoostTarget[]>(() => {
    const rows: InventoryBoostTarget[] = [];
    if (constructionJob) {
      rows.push({
        id: "building",
        target: "building",
        label: `${l("Batiment", "Building")} • ${roomDisplayName(constructionJob.roomType, uiLanguage)}`,
        detail:
          constructionJob.mode === "build"
            ? l("Construction en cours", "Construction in progress")
            : l("Amelioration en cours", "Upgrade in progress"),
        remainingSeconds: Math.max(0, Math.floor((constructionJob.endAt - nowMs) / 1000))
      });
    }
    if (hangarQueue.length > 0) {
      const active = hangarQueue[0];
      const unitDef = HANGAR_UNIT_DEFS.find((def) => def.id === active.unitId);
      const unitName = hangarUnitDisplayName(active.unitId, unitDef?.name ?? active.unitId, uiLanguage);
      rows.push({
        id: `hangar_${active.id}`,
        target: "hangar",
        queueId: active.id,
        label: `${l("Hangar", "Hangar")} • ${unitName} x${active.quantity}`,
        detail: l("Production en cours", "Production in progress"),
        remainingSeconds: Math.max(0, Math.floor((active.endAt - nowMs) / 1000))
      });
    }
    if (researchJob) {
      const techDef = TECHNOLOGY_BY_ID[researchJob.technologyId];
      const techName = techDef
        ? technologyDisplayName(techDef.id, techDef.name, uiLanguage)
        : researchJob.technologyId;
      rows.push({
        id: "research",
        target: "research_local",
        label: `${l("Recherche", "Research")} • ${techName} Lv.${researchJob.targetLevel}`,
        detail: l("Recherche active", "Research active"),
        remainingSeconds: Math.max(0, Math.floor((researchJob.endAt - nowMs) / 1000))
      });
    }
    return rows;
  }, [constructionJob, hangarQueue, nowMs, researchJob, uiLanguage]);

  const onUseInventoryItem = async (
    itemId: string,
    quantity = 1,
    targetOverride: "auto" | "building" | "hangar" | "research_local" = "auto",
    queueId?: string
  ) => {
    if (!session) {
      setInventoryError(l("Connexion requise.", "You must be signed in."));
      return;
    }
    const item = inventoryItems.find((it) => it.id === itemId);
    if (!item) {
      setInventoryError(l("Objet introuvable dans l'inventaire.", "Item not found in inventory."));
      return;
    }
    const isTimeBoost = item.category === "TIME_BOOST";
    const hasAnyBoostTarget = Boolean(constructionJob) || hangarQueue.length > 0 || Boolean(researchJob);
    if (isTimeBoost && targetOverride === "auto" && !hasAnyBoostTarget) {
      setInventoryError(
        l(
          "Aucune file active a accelerer (batiment, hangar ou recherche).",
          "No active queue to accelerate (building, hangar, or research)."
        )
      );
      return;
    }
    const resolvedTarget =
      targetOverride === "auto"
        ? constructionJob
          ? "building"
          : hangarQueue.length > 0
            ? "hangar"
            : "research_local"
        : targetOverride;
    if (isTimeBoost && resolvedTarget === "building" && !constructionJob) {
      setInventoryError(l("Aucune construction active a accelerer.", "No active construction to accelerate."));
      return;
    }
    if (isTimeBoost && resolvedTarget === "hangar" && hangarQueue.length === 0) {
      setInventoryError(l("Aucune production hangar a accelerer.", "No hangar production to accelerate."));
      return;
    }
    if (isTimeBoost && resolvedTarget === "research_local" && !researchJob) {
      setInventoryError(l("Aucune recherche active a accelerer.", "No active research to accelerate."));
      return;
    }

    const buildingId = resolvedTarget === "building" && constructionJob
      ? constructionJob.mode === "build"
        ? "building_construct_slot"
        : "building_upgrade_slot"
      : "";
    const safeQuantity = Math.max(1, Math.floor(Number(quantity) || 1));
    setInventoryActionLoadingId(itemId);
    setInventoryError("");
    try {
      const payload = JSON.stringify({
        itemId,
        quantity: safeQuantity,
        ...(isTimeBoost ? { target: resolvedTarget } : {}),
        ...(isTimeBoost && buildingId ? { buildingId } : {}),
        ...(isTimeBoost && resolvedTarget === "hangar" ? { queueId: queueId ?? hangarQueue[0]?.id ?? "" } : {})
      });
      const rpc = await client.rpc(session, "useitem", payload);
      const parsed = parseJsonObject((rpc as any)?.payload ?? rpc);
      const nested = parseJsonObject(parsed?.payload);
      const sanitized = normalizeInventoryRpcItems(rpc as any);
      setInventoryItems(sanitized);
      setInventoryLastSyncAt(Date.now());

      if (isTimeBoost) {
        const used = parseJsonObject(parsed?.used ?? nested?.used);
        const usedQuantity = Math.max(1, Math.floor(Number(used?.quantity ?? safeQuantity)));
        const usedSeconds = Math.max(0, Math.floor(Number(used?.durationSeconds ?? 0)));
        const fallbackPerItemSeconds = Math.max(0, Math.floor(Number(item.durationSeconds ?? 0)));
        const totalUsedSeconds = usedSeconds > 0 ? usedSeconds : fallbackPerItemSeconds * usedQuantity;
        if (totalUsedSeconds > 0) {
          if (resolvedTarget === "building") {
            setConstructionJob((prev) => {
              if (!prev) return prev;
              return { ...prev, endAt: Math.max(Date.now(), prev.endAt - totalUsedSeconds * 1000) };
            });
          } else if (resolvedTarget === "research_local") {
            setResearchJob((prev) => {
              if (!prev) return prev;
              return { ...prev, endAt: Math.max(Date.now(), prev.endAt - totalUsedSeconds * 1000) };
            });
          } else if (resolvedTarget === "hangar") {
            const snapshot = normalizeHangarRpcSnapshot(parsed?.hangar ? parsed : nested?.hangar ? nested : rpc);
            if (snapshot) {
              applyHangarSnapshot(snapshot, false);
            } else {
              void loadHangarState(true);
            }
          }
        }
      }

      if (item.category === "RESOURCE_CRATE") {
        const used = parseJsonObject(parsed?.used ?? nested?.used);
        const opened = Math.max(1, Math.floor(Number(used?.quantity ?? safeQuantity)));
        const rewards = parseJsonObject(parsed?.rewards ?? nested?.rewards);
        const rewardKeys = Object.keys(rewards).filter((k) => RESOURCE_DEFS.some((res) => res.id === k));
        if (rewardKeys.length > 0) {
          setResourceAmounts((prev) => {
            const next = { ...prev };
            for (const key of rewardKeys) {
              const gain = Math.max(0, Math.floor(Number(rewards[key] ?? 0)));
              if (gain <= 0) continue;
              next[key] = (next[key] ?? 0) + gain;
            }
            return next;
          });
        }
        setChestLootSummary({
          opened,
          rewards: rewardKeys.reduce<Record<string, number>>((acc, key) => {
            const gain = Math.max(0, Math.floor(Number(rewards[key] ?? 0)));
            if (gain > 0) acc[key] = gain;
            return acc;
          }, {})
        });
      }
    } catch (err) {
      if (isUnauthorizedError(err)) {
        invalidateSession();
        return;
      }
      const details =
        typeof (err as any)?.message === "string" && (err as any).message.trim().length > 0
          ? (err as any).message.trim()
          : "";
      setInventoryError(
        details
          ? `${l("Utilisation impossible:", "Unable to use item:")} ${details}`
          : l("Utilisation impossible pour le moment.", "Unable to use item right now.")
      );
      if (import.meta.env.DEV) {
        // eslint-disable-next-line no-console
        console.error("use item error", err);
      }
    } finally {
      setInventoryActionLoadingId("");
    }
  };

  const hangarCrewState = useMemo(() => {
    const crewUsedByInventory = Object.entries(hangarInventory).reduce((sum, [unitId, qtyRaw]) => {
      const qty = Math.max(0, Math.floor(Number(qtyRaw ?? 0)));
      if (qty <= 0) return sum;
      const crewPerUnit = Math.max(0, Math.floor(Number(POPULATION_SHIP_CREW_REQUIREMENTS[unitId] ?? 0)));
      if (crewPerUnit <= 0) return sum;
      return sum + crewPerUnit * qty;
    }, 0);
    const crewUsedByQueue = hangarQueue.reduce((sum, item) => {
      const qty = Math.max(0, Math.floor(Number(item.quantity ?? 0)));
      const crewPerUnit = Math.max(0, Math.floor(Number(POPULATION_SHIP_CREW_REQUIREMENTS[item.unitId] ?? 0)));
      if (qty <= 0 || crewPerUnit <= 0) return sum;
      return sum + crewPerUnit * qty;
    }, 0);
    const crewPool = Math.max(0, Math.floor(Number(populationSnapshot.availableWorkers ?? 0)));
    const used = Math.max(0, crewUsedByInventory + crewUsedByQueue);
    const free = Math.max(0, crewPool - used);
    return { crewPool, used, free };
  }, [hangarInventory, hangarQueue, populationSnapshot.availableWorkers]);

  const launchHangarProduction = async (unitId: string, quantity: number) => {
    if (!session) {
      setHangarError(l("Connexion requise.", "You must be signed in."));
      return;
    }
    const qty = Math.max(1, Math.floor(Number(quantity) || 1));
    const crewPerUnit = Math.max(0, Math.floor(Number(POPULATION_SHIP_CREW_REQUIREMENTS[unitId] ?? 0)));
    if (crewPerUnit > 0) {
      const crewRequired = crewPerUnit * qty;
      if (crewRequired > hangarCrewState.free) {
        setHangarError(
          l(
            `Equipage insuffisant (${crewRequired.toLocaleString()} requis, ${hangarCrewState.free.toLocaleString()} disponibles).`,
            `Not enough crew (${crewRequired.toLocaleString()} required, ${hangarCrewState.free.toLocaleString()} available).`
          )
        );
        return;
      }
    }
    setHangarActionBusy(true);
    setHangarError("");
    try {
      const rpc = await client.rpc(
        session,
        "hangar_start",
        JSON.stringify({
          unitId,
          quantity: qty
        })
      );
      const snapshot = normalizeHangarRpcSnapshot(rpc as any);
      if (!snapshot) throw new Error("Invalid hangar payload.");
      applyHangarSnapshot(snapshot, true);
    } catch (err) {
      if (isUnauthorizedError(err)) {
        invalidateSession();
        return;
      }
      const details = extractRpcErrorMessage(err);
      setHangarError(details || l("Lancement de production impossible.", "Unable to start production."));
      if (import.meta.env.DEV) {
        // eslint-disable-next-line no-console
        console.error("hangar start error", err);
      }
    } finally {
      setHangarActionBusy(false);
    }
  };

  const cancelHangarProduction = async (queueId: string) => {
    if (!session) {
      setHangarError(l("Connexion requise.", "You must be signed in."));
      return;
    }
    setHangarActionBusy(true);
    setHangarError("");
    try {
      const rpc = await client.rpc(
        session,
        "hangar_cancel",
        JSON.stringify({
          queueId
        })
      );
      const snapshot = normalizeHangarRpcSnapshot(rpc as any);
      if (!snapshot) throw new Error("Invalid hangar payload.");
      applyHangarSnapshot(snapshot, true);
    } catch (err) {
      if (isUnauthorizedError(err)) {
        invalidateSession();
        return;
      }
      const details = extractRpcErrorMessage(err);
      setHangarError(details || l("Annulation impossible.", "Unable to cancel production."));
      if (import.meta.env.DEV) {
        // eslint-disable-next-line no-console
        console.error("hangar cancel error", err);
      }
    } finally {
      setHangarActionBusy(false);
    }
  };

  const pendingBuildRoom = useMemo<Room | null>(() => {
    if (!constructionJob || constructionJob.mode !== "build") return null;
    const cfg = ROOM_CONFIG[constructionJob.roomType];
    return {
      id: PENDING_BUILD_ROOM_ID,
      x: constructionJob.x,
      y: constructionJob.y,
      width: cfg.width,
      type: constructionJob.roomType,
      level: 0
    };
  }, [constructionJob]);

  const occupied = Array.from({ length: gridHeight }, () => Array.from({ length: GRID_WIDTH }, () => false));
  for (const room of rooms) {
    if (room.id === draggedRoom?.id) continue;
    for (let i = 0; i < room.width; i += 1) {
      if (room.y < gridHeight && room.x + i < GRID_WIDTH) occupied[room.y][room.x + i] = true;
    }
  }
  if (pendingBuildRoom) {
    for (let i = 0; i < pendingBuildRoom.width; i += 1) {
      if (pendingBuildRoom.y < gridHeight && pendingBuildRoom.x + i < GRID_WIDTH) {
        occupied[pendingBuildRoom.y][pendingBuildRoom.x + i] = true;
      }
    }
  }

  const renderUnifiedMenu = () => (
    <div className="status-wrap">
      <button className="ghost-btn" onClick={() => setScreen("game")}><Play size={15} /> {l("Jeu", "Game")}</button>
      <button className="ghost-btn" onClick={() => setScreen("hangar")}><Swords size={15} /> {l("Hangar", "Hangar")}</button>
      <button className="ghost-btn" onClick={() => setScreen("population")}><Users size={15} /> {l("Population", "Population")}</button>
      <button className="ghost-btn" onClick={() => setScreen("starmap")}><Navigation size={15} /> {l("Carte", "Map")}</button>
      <button className="ghost-btn" onClick={() => setScreen("resources")}><Coins size={15} /> {l("Ressources", "Resources")}</button>
      <button className="ghost-btn" onClick={() => setScreen("technology")}><Hexagon size={15} /> {l("Technologie", "Technology")}</button>
      <button className="ghost-btn" onClick={() => setScreen("alliance")}><Shield size={15} /> {l("Alliance", "Alliance")}</button>
      <button className="ghost-btn" onClick={() => setScreen("ranking")}><ArrowUpCircle size={15} /> {l("Classement", "Ranking")}</button>
      <button className="ghost-btn" onClick={() => setScreen("wiki")}><BookOpen size={15} /> {l("Wiki", "Wiki")}</button>
      <button className="ghost-btn inbox-btn" onClick={() => setScreen("inventory")}>
        <Package size={15} /> {l("Inventaire", "Inventory")}
        {inventoryMenuBadgeCount > 0 ? <span className="menu-badge">{inventoryMenuBadgeCount > 99 ? "99+" : inventoryMenuBadgeCount}</span> : null}
      </button>
      <button className="ghost-btn inbox-btn" onClick={() => setScreen("inbox")}>
        <Mail size={15} /> {l("Inbox", "Inbox")}
        {inboxUnreadCount > 0 ? <span className="menu-badge">{inboxUnreadCount > 99 ? "99+" : inboxUnreadCount}</span> : null}
      </button>
      <button className="ghost-btn" onClick={() => setScreen("chat")}><MessageCircle size={15} /> {l("Chat", "Chat")}</button>
      <div className="user-menu">
        <button className="ghost-btn profile-chip" onClick={() => setScreen("profile")}><UserRound size={15} /> {playerId || l("Profil", "Profile")}</button>
        {session ? (
          <button className="user-logout-btn" onClick={logout}><LogOut size={14} /> {l("Deconnexion", "Logout")}</button>
        ) : null}
      </div>
    </div>
  );

  const getResourceStorageState = (
    resourceId: string,
    amountSource: Record<string, number> = resourceAmounts
  ): { state: "normal" | "warn" | "critical" | "blocked"; color: string } => {
    const amount = Number(amountSource[resourceId] ?? 0);
    const rate = Number(resourceRates[resourceId] ?? 0);
    const cap = Math.max(1, storageCapacity);
    const fillRatio = Math.max(0, Math.min(1, amount / cap));

    if (rate > 0 && amount >= cap) {
      return { state: "blocked", color: "#ff4d5d" };
    }

    if (fillRatio < 0.9) {
      return { state: "normal", color: "#e8f7ff" };
    }

    const riskRatio = Math.max(0, Math.min(1, (fillRatio - 0.9) / 0.1));
    const hue = Math.round(52 * (1 - riskRatio));
    const lightness = 62 - riskRatio * 8;
    const state = riskRatio >= 0.55 ? "critical" : "warn";
    return { state, color: `hsl(${hue} 96% ${lightness}%)` };
  };

  const serverClockLabel = new Intl.DateTimeFormat(uiLanguage === "fr" ? "fr-FR" : "en-US", {
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hour12: false
  }).format(new Date(nowMs + serverClockOffsetMs));
  const renderUnifiedHeader = () => (
    <header className="topbar">
      <div className="topbar-main">
        <div className="brand-wrap">
          <h1>{l("Hyperstructure Command", "Hyperstructure Command")}</h1>
          <span className="server-clock">{l("Heure serveur", "Server time")}: {serverClockLabel}</span>
        </div>
        {renderUnifiedMenu()}
      </div>
      <div className="topbar-resources">
        <div className="top-resource-strip">
          {RESOURCE_DEFS.filter(
            (r) =>
              unlockedResourceIds.includes(r.id) ||
              Number(resourceAmounts[r.id] ?? 0) > 0 ||
              Number(resourceRates[r.id] ?? 0) > 0
          ).map((r) => {
            const amount = Math.floor(resourceAmounts[r.id] ?? 0);
            const cap = Math.max(1, storageCapacity);
            const storageState = getResourceStorageState(r.id, resourceAmounts);
            const isBlocked = storageState.state === "blocked";
            const resourceName = resourceDisplayName(r.id, uiLanguage);
            return (
              <span key={r.id} className="top-resource-item" title={resourceName}>
                <span className="top-resource-icon" style={getResourceMenuSpriteStyle(r.id)} />
                <span className="top-resource-meta">
                  <small>{resourceName}</small>
                  <span className="top-resource-amount-wrap">
                    <strong className="top-resource-amount" style={{ color: storageState.color }}>
                      {amount.toLocaleString()}
                    </strong>
                    {isBlocked ? (
                      <span className="top-resource-blocked" aria-label={l("Entrepot plein", "Storage full")} tabIndex={0}>
                        <AlertCircle size={12} />
                        <span className="top-resource-blocked-tooltip">
                          <strong>{l("Entrepot plein", "Storage full")}</strong>
                          <span>
                            {uiLanguage === "fr"
                              ? `La production de ${resourceName} est bloquee, mais tu peux encore en acheminer, ou en ajouter via l'inventaire.`
                              : `${resourceName} production is blocked, but you can still ship more in or add it from inventory.`}
                          </span>
                        </span>
                      </span>
                    ) : null}
                  </span>
                </span>
              </span>
            );
          })}
        </div>
        <div className="topbar-credits">
          <div className="pill score">
            <Shield size={14} />
            {l("Score", "Score")}: {displayedScorePoints.toLocaleString()}
            <span className="score-rank">{l("Rang", "Rank")} #{playerScoreRank > 0 ? playerScoreRank : "-"}</span>
          </div>
          <div className="pill gold"><Coins size={15} /> {credits} Credits</div>
        </div>
      </div>
    </header>
  );

  return (
    <div className="app-shell">
      {screen === "home" ? (
        <HomeLanding
          session={session}
          authChecking={authChecking}
          playerId={playerId}
          nakamaStatus={nakamaStatus}
          language={uiLanguage}
          onOpenAuth={() => {
            setAuthMode("login");
            setShowAuth(true);
          }}
          onOpenSignup={() => {
            setAuthMode("signup");
            setShowAuth(true);
          }}
          onEnterGame={() => setScreen("game")}
        />
      ) : screen === "hangar" ? (
        <>
          {renderUnifiedHeader()}

          <HangarScreen
            language={uiLanguage}
            resourceAmounts={resourceAmounts}
            serverResourceAmounts={hangarServerResources}
            technologyLevels={technologyLevels}
            inventoryItems={inventoryItems}
            inventoryLoading={inventoryLoading}
            inventoryActionLoadingId={inventoryActionLoadingId}
            queue={hangarQueue}
            inventory={hangarInventory}
            nowMs={nowMs}
            loading={hangarLoading}
            actionBusy={hangarActionBusy}
            error={hangarError}
            serverResourcesReady={Boolean(hangarServerResources)}
            onQueue={launchHangarProduction}
            onCancelQueueItem={cancelHangarProduction}
            onUseBoost={onUseInventoryItem}
          />
        </>
      ) : screen === "starmap" ? (
        <>
          {renderUnifiedHeader()}

          <SectorMapScreen
            language={uiLanguage}
            client={client}
            session={session}
            currentUserId={session?.user_id ?? ""}
            currentUsername={profileUsername || playerId || ""}
            hangarInventory={hangarInventory}
            technologyLevels={technologyLevels}
            carbonProductionPerSec={Number(resourceRates.carbone ?? 0)}
            onGrantCredits={(amount, claimId) => {
              void grantCreditsToServer(amount, claimId);
            }}
            onMapStateSync={(payload) => {
              const nextResources = payload?.resources;
              if (nextResources && typeof nextResources === "object") {
                setResourceAmounts((prev) => {
                  const merged = { ...prev };
                  for (const def of RESOURCE_DEFS) {
                    const value = Number(nextResources[def.id] ?? merged[def.id] ?? 0);
                    if (Number.isFinite(value) && value >= 0) merged[def.id] = value;
                  }
                  return merged;
                });
              }
              const nextCredits = Number(payload?.credits ?? NaN);
              if (Number.isFinite(nextCredits) && nextCredits >= 0) {
                setCredits(Math.floor(nextCredits));
              }
              const syncReportId = String(payload?.syncReport?.id || "").trim();
              if (syncReportId && !processedMapSyncReportIdsRef.current[syncReportId]) {
                processedMapSyncReportIdsRef.current[syncReportId] = true;
                const mapDropNotifications = Number(payload?.mapDropNotifications ?? NaN);
                if (Number.isFinite(mapDropNotifications) && mapDropNotifications >= 0) {
                  setInventoryServerBadgeCount(Math.max(0, Math.floor(mapDropNotifications)));
                }
                void refreshInboxUnread(true);
              }
            }}
          />
        </>
      ) : screen === "chat" ? (
        <>
          {renderUnifiedHeader()}

          <ChatScreen
            client={client}
            session={session}
            playerId={playerId}
            enabled={screen === "chat"}
            language={uiLanguage}
          />
        </>
      ) : screen === "resources" ? (
        <>
          {renderUnifiedHeader()}

          <ResourceScreen
            language={uiLanguage}
            amounts={resourceAmounts}
            unlockedIds={unlockedResourceIds}
            rates={resourceRates}
            populationSnapshot={populationSnapshot}
            technologyLevels={technologyLevels}
            loading={resourceLoading}
            error={resourceError}
            offlineSeconds={resourceOfflineSeconds}
            lastSavedAt={resourceLastSavedAt}
          />
        </>
      ) : screen === "population" ? (
        <>
          {renderUnifiedHeader()}
          <PopulationScreen
            language={uiLanguage}
            snapshot={populationSnapshot}
            rooms={rooms}
            resourceAmounts={resourceAmounts}
            buildingCostReductionFactor={buildingCostReductionFactor}
            buildingTimeReductionFactor={buildingTimeReductionFactor}
            onNavigate={(target) => setScreen(target)}
          />
        </>
      ) : screen === "technology" ? (
        <>
          {renderUnifiedHeader()}

          <TechnologyScreen
            language={uiLanguage}
            technologyLevels={technologyLevels}
            researchJob={researchJob}
            researchRemainingSeconds={researchRemainingSeconds}
            researchTimeFactor={researchTimeFactor}
            resourceAmounts={resourceAmounts}
            inventoryItems={inventoryItems}
            inventoryLoading={inventoryLoading}
            inventoryActionLoadingId={inventoryActionLoadingId}
            onLaunchResearch={launchResearch}
            onUseBoost={onUseInventoryItem}
          />
        </>
      ) : screen === "alliance" ? (
        <>
          {renderUnifiedHeader()}
          <AllianceScreen
            language={uiLanguage}
            playerId={playerId}
            nowMs={nowMs}
            client={client}
            session={session}
            onRankingRefresh={() => void loadRankingState(true)}
            onUnauthorized={invalidateSession}
          />
        </>
      ) : screen === "ranking" ? (
        <>
          {renderUnifiedHeader()}
          <RankingScreen
            language={uiLanguage}
            loading={rankingLoading}
            error={rankingError}
            playerPoints={playerScorePoints}
            playerRank={playerScoreRank}
            players={rankingPlayers}
            alliances={rankingAlliances}
            onRefresh={() => void loadRankingState()}
          />
        </>
      ) : screen === "inventory" ? (
        <>
          {renderUnifiedHeader()}

          <InventoryScreen
            language={uiLanguage}
            loading={inventoryLoading}
            error={inventoryError}
            items={inventoryItems}
            lastSyncAt={inventoryLastSyncAt}
            hasActiveQueue={Boolean(constructionJob) || hangarQueue.length > 0 || Boolean(researchJob)}
            boostTargets={inventoryBoostTargets}
            actionLoadingId={inventoryActionLoadingId}
            newItemNotifications={inventoryVisibleItemNotifications}
            onUseItem={onUseInventoryItem}
          />
        </>
      ) : screen === "inbox" ? (
        <>
          {renderUnifiedHeader()}
          <InboxScreen
            language={uiLanguage}
            client={client}
            session={session}
            playerId={playerId}
            enabled={screen === "inbox"}
            onUnreadChange={(count) => setInboxUnreadCount(Math.max(0, Math.floor(count)))}
            onClaimApplied={(payload) => {
              const nextResources = payload?.state?.resources;
              if (nextResources && typeof nextResources === "object") {
                setResourceAmounts((prev) => {
                  const merged = { ...prev };
                  for (const def of RESOURCE_DEFS) {
                    const value = Number(nextResources[def.id] ?? merged[def.id] ?? 0);
                    merged[def.id] = Number.isFinite(value) && value >= 0 ? value : merged[def.id] ?? 0;
                  }
                  return merged;
                });
              }
              const nextCredits = Number(payload?.state?.credits ?? NaN);
              if (Number.isFinite(nextCredits) && nextCredits >= 0) {
                setCredits(Math.floor(nextCredits));
              }
              const claimNotif = extractInventoryItemNotificationsFromClaim(payload);
              if (claimNotif.total > 0) {
                setInventoryInboxBadgeCount((prev) => prev + claimNotif.total);
                setInventoryPendingItemNotifications((prev) => {
                  const next = { ...prev };
                  for (const [itemId, qtyRaw] of Object.entries(claimNotif.byItemId)) {
                    const qty = Math.max(0, Math.floor(Number(qtyRaw ?? 0)));
                    if (!itemId || qty <= 0) continue;
                    next[itemId] = Math.max(0, Math.floor(Number(next[itemId] ?? 0))) + qty;
                  }
                  return next;
                });
              }
              void loadInventory();
              void loadRankingState(true);
              void refreshInboxUnread(true);
            }}
          />
        </>
      ) : screen === "wiki" ? (
        <>
          {renderUnifiedHeader()}
          <WikiScreen language={uiLanguage} />
        </>
      ) : screen === "profile" ? (
        <>
          {renderUnifiedHeader()}

          <ProfileScreen
            language={uiLanguage}
            profileUsername={profileUsername}
            profileEmail={profileEmail}
            profileLanguage={profileLanguage}
            profileAvatar={profileAvatar}
            avatarOptions={avatarOptions}
            profileError={profileError}
            profileSaved={profileSaved}
            profileLoading={profileLoading}
            onUsernameChange={setProfileUsername}
            onEmailChange={setProfileEmail}
            onLanguageChange={(lang) => {
              setProfileLanguage(lang);
              setUiLanguage(lang);
            }}
            onAvatarChange={setProfileAvatar}
            onSubmit={saveProfile}
          />
        </>
      ) : (
        <>
          {renderUnifiedHeader()}

          <main className="game-layout">
            <aside className="left-panel">
              <h2>{l("Stats Hyperstructure", "Hyperstructure Stats")}</h2>
              <div className="hyperstats-panel">
                <StatLine icon={<Users size={16} />} label={l("Batiments actifs", "Active buildings")} value={stats.buildings} />
                <StatLine icon={<Gem size={16} />} label={l("Ressources debloquees", "Unlocked resources")} value={stats.unlocked} />
                <StatLine icon={<Zap size={16} />} label={l("Production totale/s", "Total production/s")} value={Number(stats.totalProduction.toFixed(3))} />
                <StatLine icon={<Shield size={16} />} label={l("Capacite entrepot", "Storage capacity")} value={stats.storageCapacity} />
                <StatLine icon={<RefreshCw size={16} />} label={l("File construction", "Construction queue")} value={stats.queueBusy ? 1 : 0} />
              </div>

              <div className="population-panel">
                <div className="population-panel-head">
                  <strong>{l("Stats population", "Population stats")}</strong>
                  <span className={`population-band ${populationSnapshot.stabilityBand}`}>
                    {populationStabilityBandLabel(populationSnapshot.stabilityBand, uiLanguage)}
                  </span>
                </div>

                <div className="population-meter">
                  <div className="population-meter-track">
                    <div style={{ width: `${populationFillPct}%` }} />
                  </div>
                  <p>
                    {populationSnapshot.totalPopulation.toLocaleString()} / {populationSnapshot.capacity.toLocaleString()}
                  </p>
                </div>

                <div className="population-grid">
                  <div>
                    <span>{l("Croissance", "Growth")}</span>
                    <strong className={`population-metric-value ${populationGrowthPctPerHour >= 0 ? "good" : "bad"}`}>
                      {populationGrowthPctPerHour >= 0 ? "+" : ""}{populationGrowthPctPerHour.toFixed(2)}%/h
                    </strong>
                  </div>
                  <div>
                    <span>{l("Stabilite", "Stability")}</span>
                    <strong>{populationSnapshot.stability.toFixed(1)}%</strong>
                  </div>
                  <div>
                    <span>{l("Travailleurs", "Workers")}</span>
                    <strong>{populationSnapshot.workers.toLocaleString()}</strong>
                  </div>
                  <div>
                    <span>{l("Ingenieurs", "Engineers")}</span>
                    <strong>{populationSnapshot.engineers.toLocaleString()}</strong>
                  </div>
                  <div>
                    <span>{l("Scientifiques", "Scientists")}</span>
                    <strong>{populationSnapshot.scientists.toLocaleString()}</strong>
                  </div>
                  <div>
                    <span>{l("Efficacite", "Efficiency")}</span>
                    <strong className={`population-metric-value ${populationSnapshot.efficiencyPct >= 0 ? "good" : "bad"}`}>
                      {populationSnapshot.efficiencyPct >= 0 ? "+" : ""}{populationSnapshot.efficiencyPct.toFixed(1)}%
                    </strong>
                  </div>
                </div>

                <div className="population-food">
                  <div className="population-food-track">
                    <div style={{ width: `${populationFoodFillPct}%` }} />
                  </div>
                  <p>
                    {l("Nourriture", "Food")}: {Math.floor(populationSnapshot.foodStock).toLocaleString()} / {populationSnapshot.foodCapacity.toLocaleString()}{" "}
                    ({populationSnapshot.foodBalancePerHour >= 0 ? "+" : ""}{populationSnapshot.foodBalancePerHour.toFixed(0)}/h)
                  </p>
                </div>

                <div className="population-meta">
                  {populationSnapshot.onboardingProtectionActive ? (
                    <p className="population-protection">
                      {l("Phase academie active", "Academy phase active")}:{" "}
                      <strong>
                        {populationProtectionDaysLeft.toLocaleString()} {l("jours restants", "days remaining")}
                      </strong>
                    </p>
                  ) : null}
                  <p>
                    {l("Niveau civilisation", "Civilization tier")}:{" "}
                    <strong>{l(populationSnapshot.civilizationTier.nameFr, populationSnapshot.civilizationTier.nameEn)}</strong>
                  </p>
                  <p>
                    {l("Equipage disponible", "Available crew")}:{" "}
                    <strong>{hangarCrewState.free.toLocaleString()}</strong>
                    {" / "}
                    {hangarCrewState.crewPool.toLocaleString()}
                  </p>
                  {populationSnapshot.activeEvent ? (
                    <p>
                      {l("Evenement", "Event")}:{" "}
                      <strong>{populationEventLabel(populationSnapshot.activeEvent.type, uiLanguage)}</strong>
                    </p>
                  ) : null}
                  {populationSnapshot.activeCrisis ? (
                    <p className="population-alert">
                      {l("Crise", "Crisis")}:{" "}
                      <strong>{populationCrisisLabel(populationSnapshot.activeCrisis.type, uiLanguage)}</strong>
                    </p>
                  ) : null}
                  {populationSnapshot.isOverCapacity ? (
                    <p className="population-alert">
                      {l("Surpopulation: production -25%", "Overcapacity: production -25%")}
                    </p>
                  ) : null}
                  {populationSnapshot.foodShortage ? (
                    <p className="population-alert">
                      {l("Famine: croissance arretee", "Famine: growth halted")}
                    </p>
                  ) : null}
                </div>
              </div>
            </aside>

            <section
              className={`vault-stage ${isPanning || draggedRoom ? "dragging" : ""}`}
              onMouseDown={onGridMouseDown}
              onMouseMove={onGridMouseMove}
              onMouseUp={onGridMouseUp}
              onMouseLeave={onGridMouseUp}
              onWheel={(e) => {
                if (!session) return;
                const next = zoom - e.deltaY * 0.002;
                setZoom(Math.max(0.35, Math.min(MAX_ZOOM, next)));
              }}
              onContextMenu={(e) => e.preventDefault()}
            >
              <div className="space-backdrop layer-nebula" />
              <div className="space-backdrop layer-stars-a" />
              <div className="space-backdrop layer-stars-b" />

              <div className="zoom-widget">
                <button onClick={() => setZoom((z) => Math.min(MAX_ZOOM, z + 0.1))}><ZoomIn size={16} /></button>
                <span>{Math.round((zoom / BASE_ZOOM) * 100)}%</span>
                <button onClick={() => setZoom((z) => Math.max(0.35, z - 0.1))}><ZoomOut size={16} /></button>
                <button className={panMode ? "active" : ""} onClick={() => setPanMode((v) => !v)}><Move size={16} /></button>
              </div>

              <div className="construction-stack">
                <details className="main-mission-spoiler">
                  <summary>
                    <span className="main-mission-summary-title">
                      {l("Mission principale", "Main mission")}
                    </span>
                    <span className="main-mission-summary-right">
                      {!mainMissionState.finished && activeMainMissions.length > 0 ? (
                        <span className="main-mission-badge">{activeMainMissions.length}</span>
                      ) : null}
                      <span>{missionMainProgressPct}%</span>
                    </span>
                  </summary>
                  <div className="main-mission-content">
                    <div className="main-mission-progress-bar">
                      <div style={{ width: `${missionMainProgressPct}%` }} />
                    </div>
                    <p className="main-mission-meta">
                      {l("Objectifs valides", "Validated objectives")}:{" "}
                      {(mainMissionState.completedCount + mainMissionState.skippedCount).toLocaleString()} / {MAIN_MISSION_PLAN.length.toLocaleString()}
                      {" • "}
                      {l("Credits gagnes", "Credits earned")}: {mainMissionState.totalRewardCredits.toLocaleString()}
                    </p>
                    {mainMissionState.finished ? (
                      <p className="main-mission-finished">
                        {l("Mission principale terminee: tous les batiments cibles sont au niveau 50.", "Main mission completed: all target buildings reached level 50.")}
                      </p>
                    ) : (
                      <div className="main-mission-list">
                        {activeMainMissions.map((mission) => {
                          const currentLevel = Math.max(0, Math.floor(Number(roomByType[mission.roomType]?.level ?? 0)));
                          const ratio = Math.max(0, Math.min(100, Math.round((currentLevel / Math.max(1, mission.targetLevel)) * 100)));
                          const completed = currentLevel >= mission.targetLevel;
                          const isPopulationMission = mission.roomType in POPULATION_BUILD_UNLOCK_MIN;
                          const populationRequired = isPopulationMission
                            ? (POPULATION_BUILD_UNLOCK_MIN[mission.roomType as PopulationBuildingId] ?? 0)
                            : 0;
                          const lockedByPopulation = isPopulationMission && !isPopulationBuildingUnlocked(mission.roomType, populationSnapshot.totalPopulation);
                          return (
                            <article
                              key={`main_mission_card_${mission.id}`}
                              className={`main-mission-item ${completed ? "done" : ""} ${lockedByPopulation ? "locked" : ""}`}
                            >
                              <header>
                                <strong>
                                  {roomDisplayName(mission.roomType, uiLanguage)} • Lv.{mission.targetLevel}
                                </strong>
                                <span>{MAIN_MISSION_REWARD_MIN} - {MAIN_MISSION_REWARD_MAX} Credits</span>
                              </header>
                              <p>
                                {completed
                                  ? l("Objectif atteint, validation en cours...", "Objective reached, validating...")
                                  : currentLevel <= 0
                                    ? `${l("Construire", "Build")} ${roomDisplayName(mission.roomType, uiLanguage)} ${l("niveau", "level")} ${mission.targetLevel}.`
                                    : `${l("Ameliorer", "Upgrade")} ${roomDisplayName(mission.roomType, uiLanguage)} ${l("jusqu'au niveau", "to level")} ${mission.targetLevel}.`}
                              </p>
                              <div className="main-mission-progress-bar compact">
                                <div style={{ width: `${ratio}%` }} />
                              </div>
                              <footer>
                                <small>
                                  {l("Progression", "Progress")}: {Math.min(currentLevel, mission.targetLevel).toLocaleString()} / {mission.targetLevel.toLocaleString()}
                                </small>
                                <small>{completed ? l("Termine", "Completed") : l("En cours", "In progress")}</small>
                              </footer>
                              {lockedByPopulation ? (
                                <p className="main-mission-lock">
                                  {l("Population requise", "Population required")}: {populationRequired.toLocaleString()}
                                </p>
                              ) : null}
                            </article>
                          );
                        })}
                      </div>
                    )}
                    {mainMissionState.lastRewardCredits > 0 ? (
                      <p className="main-mission-reward-line">
                        +{mainMissionState.lastRewardCredits.toLocaleString()} Credits{" "}
                        ({mainMissionState.lastRewardCount.toLocaleString()} {mainMissionState.lastRewardCount > 1 ? l("missions", "missions") : l("mission", "mission")})
                      </p>
                    ) : null}
                  </div>
                </details>

                {constructionJob ? (
                  <div className="construction-banner">
                    <div className="construction-head">
                      <strong>{l("Construction en cours", "Construction in progress")}</strong>
                      <div className="construction-head-actions">
                        <span>{constructionJob.mode === "build" ? l("Nouveau batiment", "New building") : l("Amelioration", "Upgrade")}</span>
                        <button
                          type="button"
                          className="construction-cancel-btn"
                          title={l("Annuler et rembourser", "Cancel and refund")}
                          onClick={onCancelConstruction}
                        >
                          <X size={14} />
                        </button>
                      </div>
                    </div>
                    <p className="construction-name">{roomDisplayName(constructionJob.roomType, uiLanguage)}</p>
                    <p className="construction-subline">{l("Niveau cible", "Target level")}: {constructionJob.targetLevel}</p>
                    <p
                      className={`construction-time ${
                        constructionRemainingSeconds <= 60 ? "danger" : constructionRemainingSeconds <= 300 ? "warn" : "ok"
                      }`}
                    >
                      {l("Temps restant", "Time left")}: {formatDuration(constructionRemainingSeconds)}
                    </p>
                  </div>
                ) : (
                  <div
                    className="construction-banner planner-banner"
                    onWheel={(e) => {
                      e.stopPropagation();
                    }}
                  >
                    <details className="planner-spoiler">
                      <summary>{l("Planificateur de modules", "Module planner")}</summary>
                      <div
                        className="planner-list"
                        onWheel={(e) => {
                          e.stopPropagation();
                        }}
                      >
                        {plannerItems.length === 0 ? (
                          <p className="planner-empty">{l("Aucun module disponible pour le moment.", "No module available at the moment.")}</p>
                        ) : (
                          plannerItems.map((item) => (
                            <article key={item.key} className="planner-item">
                              <header>
                                <strong>{item.name}</strong>
                                <span>{item.mode === "construction" ? l("Construction", "Construction") : l("Amelioration", "Upgrade")} N{item.targetLevel}</span>
                              </header>
                              <div className="planner-item-cost">
                                <ResourceCostDisplay cost={item.cost} available={resourceAmounts} language={uiLanguage} compact />
                              </div>
                              <div className="planner-row">
                                <small>{l("Temps", "Time")}: {formatDuration(item.etaSec)}</small>
                                <button type="button" className="planner-action-btn" onClick={() => onPlannerLaunch(item)}>
                                  {item.mode === "construction" ? l("Construire", "Build") : l("Ameliorer", "Upgrade")}
                                </button>
                              </div>
                            </article>
                          ))
                        )}
                      </div>
                    </details>
                  </div>
                )}
              </div>

              <div ref={transformRef} className="vault-transform" style={{ transform: `translate(${pan.x}px, ${pan.y}px) scale(${zoom})`, transformOrigin: "bottom center" }}>
                <div className="vault-grid" style={{ width: GRID_WIDTH * CELL_WIDTH + 8, height: gridHeight * CELL_HEIGHT + 8 }}>
                  <img src="/room-images/hyperstructure-haut.png" alt="" className="hyperstructure-cap top" />
                  <img src="/room-images/hyperstructure-bas.png" alt="" className="hyperstructure-cap bottom" />
                  <div className="vault-inner">
                    {occupied.map((row, y) =>
                      row.map((isFilled, x) => {
                        if (isFilled) return null;
                        return (
                          <button
                            key={`slot_${x}_${y}`}
                            className="slot-btn"
                            style={{ left: x * CELL_WIDTH, bottom: y * CELL_HEIGHT, width: CELL_WIDTH, height: CELL_HEIGHT }}
                            onClick={() => session && !panMode && setBuildSlot({ x, y })}
                          >
                            +
                          </button>
                        );
                      })
                    )}

                    {rooms.map((room) => {
                      const cfg = ROOM_CONFIG[room.type];
                      const spriteStyle = roomProductionSpriteStyle(room.type);
                      const isDraggingRoom = draggedRoom?.id === room.id;
                      const isUpgradingRoom = constructionJob?.mode === "upgrade" && constructionJob.roomId === room.id;
                      const isJustCompleted = constructionFxRoomId === room.id;

                      return (
                        <div
                          key={room.id}
                          className={`room-card ${cfg.color} ${isDraggingRoom ? "faded" : ""} ${isUpgradingRoom ? "constructing" : ""} ${isJustCompleted ? "completed-fx" : ""}`}
                          style={{ left: room.x * CELL_WIDTH, bottom: room.y * CELL_HEIGHT, width: room.width * CELL_WIDTH, height: CELL_HEIGHT }}
                          onMouseDown={(e) => onRoomMouseDown(e, room)}
                        >
                          {spriteStyle ? (
                            <span className="room-art room-art-sprite" style={spriteStyle} />
                          ) : (
                            <img
                              src={cfg.image}
                              alt={roomDisplayName(room.type, uiLanguage)}
                              className="room-art"
                              onError={(e) => {
                                (e.currentTarget as HTMLImageElement).style.display = "none";
                              }}
                            />
                          )}
                          <div className="room-meta">
                            <p className="room-name">{roomDisplayName(room.type, uiLanguage)}</p>
                            <p className="room-level">Lvl {room.level}</p>
                            <div className="room-action-row">
                              {room.type !== "entrance" ? (
                                <button
                                  type="button"
                                  className="room-upgrade-btn"
                                  onMouseDown={(e) => {
                                    e.preventDefault();
                                    e.stopPropagation();
                                  }}
                                  onClick={(e) => {
                                    e.preventDefault();
                                    e.stopPropagation();
                                    setActiveRoom(room);
                                  }}
                                >
                                  {l("Ameliorer", "Upgrade")}
                                </button>
                              ) : (
                                <span className="room-action-placeholder" aria-hidden="true" />
                              )}
                            </div>
                          </div>
                          {isUpgradingRoom ? (
                            <div className="room-construction-overlay">
                              <div className="room-clock">
                                <i className="room-clock-hand" />
                              </div>
                              <div className="room-construction-text">
                                <small>{l("Construction", "Construction")}</small>
                                <strong>{formatDuration(constructionRemainingSeconds)}</strong>
                              </div>
                            </div>
                          ) : null}
                        </div>
                      );
                    })}

                    {pendingBuildRoom ? (
                      <div
                        className={`room-card ${ROOM_CONFIG[pendingBuildRoom.type].color} constructing pending`}
                        style={{
                          left: pendingBuildRoom.x * CELL_WIDTH,
                          bottom: pendingBuildRoom.y * CELL_HEIGHT,
                          width: pendingBuildRoom.width * CELL_WIDTH,
                          height: CELL_HEIGHT
                        }}
                        onMouseDown={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                        }}
                        onClick={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          setActiveRoom(pendingBuildRoom);
                        }}
                        >
                          {roomProductionSpriteStyle(pendingBuildRoom.type) ? (
                            <span className="room-art room-art-sprite" style={roomProductionSpriteStyle(pendingBuildRoom.type)!} />
                          ) : (
                            <img
                              src={ROOM_CONFIG[pendingBuildRoom.type].image}
                              alt={roomDisplayName(pendingBuildRoom.type, uiLanguage)}
                              className="room-art"
                            />
                          )}
                        <div className="room-meta">
                          <p className="room-name">{roomDisplayName(pendingBuildRoom.type, uiLanguage)}</p>
                          <p className="room-level">{l("Chantier", "Build")}</p>
                        </div>
                        <div className="room-construction-overlay">
                          <div className="room-clock">
                            <i className="room-clock-hand" />
                          </div>
                          <div className="room-construction-text">
                            <small>{l("Construction", "Construction")}</small>
                            <strong>{formatDuration(constructionRemainingSeconds)}</strong>
                          </div>
                        </div>
                      </div>
                    ) : null}

                    {draggedRoom && dragGridPos && (
                      <div
                        className={`room-preview ${isLocationValid(draggedRoom, dragGridPos.x, dragGridPos.y) ? "valid" : "invalid"}`}
                        style={{ left: dragGridPos.x * CELL_WIDTH, bottom: dragGridPos.y * CELL_HEIGHT, width: draggedRoom.width * CELL_WIDTH, height: CELL_HEIGHT }}
                      />
                    )}
                  </div>
                </div>
              </div>
            </section>
          </main>

          <BuildModal
            language={uiLanguage}
            buildSlot={buildSlot}
            resourceAmounts={resourceAmounts}
            rooms={rooms}
            currentPopulation={populationSnapshot.totalPopulation}
            constructionJob={constructionJob}
            buildingCostReductionFactor={buildingCostReductionFactor}
            buildingTimeReductionFactor={buildingTimeReductionFactor}
            onBuild={onBuild}
            onClose={() => setBuildSlot(null)}
            getAvailableSpace={getAvailableSpace}
          />
          <UpgradeModal
            language={uiLanguage}
            room={activeRoom}
            resourceAmounts={resourceAmounts}
            constructionJob={constructionJob}
            buildingCostReductionFactor={buildingCostReductionFactor}
            buildingTimeReductionFactor={buildingTimeReductionFactor}
            productionBonusesByResource={productionBonusesByResource}
            inventoryItems={inventoryItems}
            inventoryLoading={inventoryLoading}
            inventoryActionLoadingId={inventoryActionLoadingId}
            inventoryError={inventoryError}
            constructionRemainingSeconds={constructionRemainingSeconds}
            onClose={() => setActiveRoom(null)}
            onUpgrade={onUpgrade}
            onUseBoost={onUseInventoryItem}
          />
        </>
      )}

      {chestLootSummary ? (
        <ChestLootModal
          language={uiLanguage}
          summary={chestLootSummary}
          onClose={() => setChestLootSummary(null)}
        />
      ) : null}

      {showAuth && !session ? (
        <AuthOverlay
          language={uiLanguage}
          authMode={authMode}
          authEmail={authEmail}
          authPassword={authPassword}
          authUsername={authUsername}
          authLanguage={authLanguage}
          authError={authError}
          authLoading={authLoading || authChecking}
          onModeChange={setAuthMode}
          onEmailChange={setAuthEmail}
          onPasswordChange={setAuthPassword}
          onUsernameChange={setAuthUsername}
          onLanguageChange={setAuthLanguage}
          onSubmit={onAuthSubmit}
          onClose={() => setShowAuth(false)}
        />
      ) : null}
    </div>
  );
}

function ChestLootModal({
  language,
  summary,
  onClose
}: {
  language: UILanguage;
  summary: ChestLootSummary;
  onClose: () => void;
}) {
  const l = (fr: string, en: string) => (language === "en" ? en : fr);
  const rewardRows = Object.entries(summary.rewards)
    .map(([resourceId, amount]) => ({
      resourceId,
      name: RESOURCE_DEFS.some((res) => res.id === resourceId)
        ? resourceDisplayName(resourceId as ResourceId, language)
        : resourceId,
      amount: Math.max(0, Math.floor(amount))
    }))
    .filter((row) => row.amount > 0)
    .sort((a, b) => b.amount - a.amount);

  return (
    <div className="modal-backdrop chest-loot-backdrop" onClick={onClose}>
      <div className="modal-card small chest-loot-modal" onClick={(e) => e.stopPropagation()}>
        <div className="chest-loot-sigil" />
        <h3>{l("Coffre ouvert", "Chest opened")}</h3>
        <p>
          {l("Coffres utilises", "Chests opened")}: <strong>x{summary.opened}</strong>
        </p>
        <div className="chest-loot-grid">
          {rewardRows.length === 0 ? (
            <div className="chest-loot-empty">{l("Aucune ressource obtenue.", "No resources gained.")}</div>
          ) : (
            rewardRows.map((row) => (
              <div key={row.resourceId} className="chest-loot-row">
                <span>{row.name}</span>
                <strong>+{row.amount.toLocaleString()}</strong>
              </div>
            ))
          )}
        </div>
        <button type="button" className="chest-loot-close" onClick={onClose}>
          {l("Continuer", "Continue")}
        </button>
      </div>
    </div>
  );
}

function HomeLanding({
  session,
  authChecking,
  playerId,
  nakamaStatus,
  language,
  onOpenAuth,
  onOpenSignup,
  onEnterGame
}: {
  session: Session | null;
  authChecking: boolean;
  playerId: string;
  nakamaStatus: "connecting" | "online" | "offline";
  language: UILanguage;
  onOpenAuth: () => void;
  onOpenSignup: () => void;
  onEnterGame: () => void;
}) {
  const l = (fr: string, en: string) => (language === "en" ? en : fr);
  return (
    <section className="home-screen">
      <div className="home-bg-grid" />
      <div className="home-bg-nebula" />
      <div className="home-bg-noise" />
      <div className="home-bg-scan" />
      <div className="home-bg-vignette" />
      <div className="home-ring ring-a" />
      <div className="home-ring ring-b" />
      <div className="home-ring ring-c" />

      <header className="home-top">
        <div className={`home-status ${nakamaStatus}`}>
          {nakamaStatus === "online" ? <Wifi size={14} /> : <WifiOff size={14} />}
          {nakamaStatus === "online" ? `${l("Connecte en tant que", "Connected as")} ${playerId}` : nakamaStatus === "connecting" ? l("Synchronisation", "Syncing core") : l("Reseau hors ligne", "Network offline")}
        </div>
      </header>

      <div className="home-content">
        <div className="home-hero-panel">
          <p className="home-kicker">{l("collecte //construit// combat", "collect // build // fight")}</p>
          <h1>
            {l("Construis ton", "Build Your")}
            <span> {l("Hyperstructure", "Hyperstructure")}</span>
          </h1>
          <p className="home-text">
            {l(
              "Une metropole verticale interstellaire. Des milliards de vies, une seule architecture. Stabilisez l'energie, l'eau et la bio-production avant l'effondrement de la grille.",
              "An interstellar vertical metropolis. Billions of lives, one single architecture. Stabilize power, water, and bio-production before grid collapse."
            )}
          </p>

          <div className="home-actions">
            {session ? (
              <button className="cta-main cta-prime" onClick={onEnterGame}><Play size={16} /> {l("Entrer dans le jeu", "Enter the game")}</button>
            ) : (
              <>
                <button className="cta-main cta-prime" disabled={authChecking} onClick={onOpenAuth}><Play size={16} /> {l("Se connecter", "Sign in")}</button>
                <button className="cta-alt cta-neon" disabled={authChecking} onClick={onOpenSignup}>{l("Creer un compte", "Create account")}</button>
              </>
            )}
          </div>

          {!session ? <p className="home-note">{l("Acces au jeu verrouille tant que non connecte.", "Game access is locked until you sign in.")}</p> : null}
        </div>

        <div className="home-city-wrap">
          <img
            src="/room-images/accueil.png"
            alt={l("Cite volante de l'hyperstructure", "Floating city of the hyperstructure")}
            className="home-city-image"
          />
        </div>
      </div>
    </section>
  );
}

function SectorMapScreen({
  language,
  client,
  session,
  currentUserId,
  currentUsername,
  hangarInventory,
  technologyLevels,
  carbonProductionPerSec,
  onMapStateSync,
  onGrantCredits
}: {
  language: UILanguage;
  client: Client;
  session: Session | null;
  currentUserId: string;
  currentUsername: string;
  hangarInventory: Record<string, number>;
  technologyLevels: Record<TechnologyId, number>;
  carbonProductionPerSec: number;
  onMapStateSync?: (payload: {
    resources?: Partial<Record<ResourceId, number>>;
    credits?: number;
    mapDropNotifications?: number;
    syncReport?: any;
  }) => void;
  onGrantCredits?: (amount: number, claimId?: string) => void | Promise<void>;
}) {
  const l = (fr: string, en: string) => (language === "en" ? en : fr);
  const initialMapZoom = 1.06;
  const DAILY_HARVEST_QUEST_TARGET_SECONDS = 5 * 60;
  const DAILY_HARVEST_QUEST_REWARD = 50;
  const DAILY_COLLECTION_QUEST_REWARD = 150;
  const [zoom, setZoom] = useState(initialMapZoom);
  const [isDragging, setIsDragging] = useState(false);
  const [lastMouse, setLastMouse] = useState({ x: 0, y: 0 });

  const [selectedEntity, setSelectedEntity] = useState<SectorEntity | null>(null);
  const [fleets, setFleets] = useState<SectorFleet[]>([]);
  const [actionMode, setActionMode] = useState<"none" | "attack" | "mine" | "mission">("none");
  const [sidebarTab, setSidebarTab] = useState<"navigation" | "quests">("navigation");
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [dailyHarvestQuestState, setDailyHarvestQuestState] = useState<MapDailyHarvestQuestState>({
    cycleKey: "",
    extractionBestSeconds: 0,
    extractionClaimed: false,
    collectedResources: 0,
    collectionClaimed: false,
    processedReportIds: []
  });

  const [filters, setFilters] = useState({ enemies: true, resources: true, missions: true });
  const [navX, setNavX] = useState("");
  const [navY, setNavY] = useState("");
  const [markers, setMarkers] = useState<Array<{ name: string; x: number; y: number }>>([]);
  const [mapPlayers, setMapPlayers] = useState<Array<{ userId: string; username: string }>>([]);
  const [mapFields, setMapFields] = useState<MapFieldServerDto[]>([]);
  const [mapExpedition, setMapExpedition] = useState<MapExpeditionDto | null>(null);
  const [mapExpeditions, setMapExpeditions] = useState<MapExpeditionDto[]>([]);
  const [mapReports, setMapReports] = useState<
    Array<{ id: string; fieldId: string; at: number; resources: Partial<Record<ResourceId, number>>; items?: Array<{ itemId: string; quantity: number }> }>
  >([]);
  const [mapHarvestInventory, setMapHarvestInventory] = useState<MapHarvestShipRow[]>([]);
  const [mapServerMaxActiveExpeditions, setMapServerMaxActiveExpeditions] = useState(1);
  const [mapLoadError, setMapLoadError] = useState("");
  const [mapActionError, setMapActionError] = useState("");
  const [mapActionBusy, setMapActionBusy] = useState(false);
  const [fleetDraft, setFleetDraft] = useState<Record<string, string>>({
    argo: "0",
    pegase: "0",
    arche_spatiale: "0"
  });
  const [fieldPopupId, setFieldPopupId] = useState<string | null>(null);
  const [mapNowMs, setMapNowMs] = useState(() => Date.now());
  const [mapServerSync, setMapServerSync] = useState<{ serverMs: number; localMs: number } | null>(null);
  const [viewportSize, setViewportSize] = useState({ width: 0, height: 0 });
  const [cameraCenter, setCameraCenter] = useState(() => mapPlayerToPlanetCoordinates(String(currentUserId || "guest")));
  const [mapCacheHydrated, setMapCacheHydrated] = useState(false);

  const commandementEscadreLevel = Math.max(0, Math.floor(Number(technologyLevels.commandement_escadre ?? 0)));
  const mapCacheKey = useMemo(() => `hsg_map_cache_v1_${String(currentUserId || "guest")}`, [currentUserId]);
  const dailyHarvestQuestStorageKey = useMemo(() => `hsg_map_daily_harvest_v1_${String(currentUserId || "guest")}`, [currentUserId]);
  const mapMaxActiveExpeditions = Math.max(1, mapServerMaxActiveExpeditions, 1 + Math.floor(commandementEscadreLevel / 3));
  const mapActiveBlockingExpeditions = useMemo(() => {
    const nowSec = Math.max(0, Math.floor(mapNowMs / 1000));
    return mapExpeditions.reduce((count, expedition) => {
      if (!expedition || typeof expedition !== "object") return count;
      const status = String(expedition.status || "").trim().toLowerCase();
      if (status === "returning") {
        const returnEndAt = Math.max(0, Math.floor(Number(expedition.returnEndAt ?? 0)));
        if (returnEndAt > 0 && returnEndAt <= nowSec) return count;
        return count + 1;
      }
      if (status === "travel_to_field") {
        const arrivalAt = Math.max(0, Math.floor(Number(expedition.arrivalAt ?? 0)));
        if (arrivalAt > 0 && arrivalAt <= nowSec) return count;
        return count + 1;
      }
      if (status === "extracting") {
        const extractionEndAt = Math.max(0, Math.floor(Number(expedition.extractionEndAt ?? 0)));
        if (extractionEndAt > 0 && extractionEndAt <= nowSec) return count;
        return count + 1;
      }
      return count;
    }, 0);
  }, [mapExpeditions, mapNowMs]);
  const canLaunchAnotherMapExpedition = mapActiveBlockingExpeditions < mapMaxActiveExpeditions;

  const containerRef = useRef<HTMLDivElement>(null);
  const mapOverdueSyncAtRef = useRef(0);
  const mapPlayersRpcInFlightRef = useRef(false);
  const mapPlayersRpcBackoffUntilRef = useRef(0);
  const mapStateRpcInFlightRef = useRef(false);
  const mapStateRpcBackoffUntilRef = useRef(0);
  const mapAutoCenterKeyRef = useRef("");

  const parseMapExpeditionRow = (expeditionRaw: Record<string, any>): MapExpeditionDto | null => {
    if (!expeditionRaw || typeof expeditionRaw !== "object") return null;
    const id = String(expeditionRaw.id || "").trim();
    if (!id) return null;
    const fleet = Array.isArray(expeditionRaw.fleet)
      ? expeditionRaw.fleet
          .map((row: any) => ({
            unitId: String(row?.unitId || "").trim(),
            quantity: Math.max(0, Math.floor(Number(row?.quantity ?? 0)))
          }))
          .filter((row: any) => row.unitId.length > 0 && row.quantity > 0)
      : [];
    const effectiveTransportCapacity = Math.max(
      0,
      Math.max(
        Math.floor(Number(expeditionRaw.totalTransportCapacity ?? 0)),
        calculateFleetTransportCapacity(fleet)
      )
    );
    return {
      id,
      fieldId: String(expeditionRaw.fieldId || ""),
      status: (String(expeditionRaw.status || "travel_to_field") as MapExpeditionDto["status"]),
      departureAt: Math.max(0, Math.floor(Number(expeditionRaw.departureAt ?? 0))),
      arrivalAt: Math.max(0, Math.floor(Number(expeditionRaw.arrivalAt ?? 0))),
      extractionStartAt: Math.max(0, Math.floor(Number(expeditionRaw.extractionStartAt ?? 0))),
      extractionEndAt: Math.max(0, Math.floor(Number(expeditionRaw.extractionEndAt ?? 0))),
      returnStartAt: Math.max(0, Math.floor(Number(expeditionRaw.returnStartAt ?? 0))),
      returnEndAt: Math.max(0, Math.floor(Number(expeditionRaw.returnEndAt ?? 0))),
      travelSeconds: Math.max(0, Math.floor(Number(expeditionRaw.travelSeconds ?? 0))),
      extractionSeconds: Math.max(0, Math.floor(Number(expeditionRaw.extractionSeconds ?? 0))),
      totalHarvestSpeed: Math.max(0, Math.floor(Number(expeditionRaw.totalHarvestSpeed ?? 0))),
      totalTransportCapacity: effectiveTransportCapacity,
      playerScore: Math.max(0, Math.floor(Number(expeditionRaw.playerScore ?? 0))),
      scoreBonus: Number.isFinite(Number(expeditionRaw.scoreBonus ?? 0)) ? Number(expeditionRaw.scoreBonus ?? 0) : 1,
      fleet,
      snapshotResources: (expeditionRaw.snapshotResources && typeof expeditionRaw.snapshotResources === "object"
        ? expeditionRaw.snapshotResources
        : {}) as Partial<Record<ResourceId, number>>,
      collectedResources: (expeditionRaw.collectedResources && typeof expeditionRaw.collectedResources === "object"
        ? expeditionRaw.collectedResources
        : {}) as Partial<Record<ResourceId, number>>,
      serverNowTs: Math.max(0, Math.floor(Number(expeditionRaw.serverNowTs ?? Math.floor(Date.now() / 1000))))
    };
  };

  useEffect(() => {
    if (!session) {
      setMapPlayers([]);
      return;
    }
    let cancelled = false;
    const loadPlayers = async () => {
      const now = Date.now();
      if (mapPlayersRpcInFlightRef.current) return;
      if (now < mapPlayersRpcBackoffUntilRef.current) return;
      mapPlayersRpcInFlightRef.current = true;
      try {
        const rpc = await client.rpc(session, "rpc_map_players", JSON.stringify({ limit: 2000 }));
        const parsed = parseJsonObject((rpc as any)?.payload ?? rpc);
        const nested = parseJsonObject(parsed?.payload);
        const source = Object.keys(nested).length > 0 ? nested : parsed;
        const rowsRaw = Array.isArray(source?.players) ? source.players : [];
        const rows = rowsRaw
          .map((row: any) => ({
            userId: String(row?.userId || "").trim(),
            username: String(row?.username || "").trim()
          }))
          .filter((row: { userId: string; username: string }) => row.userId.length > 0)
          .map((row: { userId: string; username: string }) => ({
            ...row,
            username: row.username || row.userId.slice(0, 8)
          }));
        if (!cancelled) setMapPlayers(rows);
      } catch (err) {
        if (isUnauthorizedError(err)) {
          invalidateSession();
          return;
        }
        if (isRequestTimeoutError(err)) {
          mapPlayersRpcBackoffUntilRef.current = Date.now() + 10000;
        }
        if (import.meta.env.DEV) {
          // eslint-disable-next-line no-console
          console.error("map players load error", err);
        }
      } finally {
        mapPlayersRpcInFlightRef.current = false;
      }
    };
    void loadPlayers();
    const interval = setInterval(() => void loadPlayers(), 60000);
    return () => {
      cancelled = true;
      clearInterval(interval);
    };
  }, [client, session]);

  useEffect(() => {
    if (!session) {
      setMapFields([]);
      setMapExpedition(null);
      setMapExpeditions([]);
      setMapReports([]);
      setMapHarvestInventory([]);
      setMapServerMaxActiveExpeditions(1);
      setMapLoadError("");
      return;
    }
    let cancelled = false;
    const loadMapState = async () => {
      const now = Date.now();
      if (mapStateRpcInFlightRef.current) return;
      if (now < mapStateRpcBackoffUntilRef.current) return;
      mapStateRpcInFlightRef.current = true;
      try {
        const rpc = await client.rpc(
          session,
          "rpc_map_fields_state",
          JSON.stringify({ commandementEscadreLevel })
        );
        const parsed = parseJsonObject((rpc as any)?.payload ?? rpc);
        const nested = parseJsonObject(parsed?.payload);
        const source = Object.keys(nested).length > 0 ? nested : parsed;
        const fieldsRaw = Array.isArray(source?.fields) ? source.fields : [];
        const expeditionRaw = parseJsonObject(source?.expedition);
        const expeditionsRaw = Array.isArray(source?.expeditions) ? source.expeditions : [];
        const reportsRaw = Array.isArray(source?.reports) ? source.reports : [];
        const harvestRaw = Array.isArray(source?.harvestInventory) ? source.harvestInventory : [];
        const maxActiveExpeditions = Math.max(1, Math.floor(Number(source?.maxActiveExpeditions ?? 1)));

        const nextFields: MapFieldServerDto[] = fieldsRaw
          .map((row: any) => {
            const occupiedByPlayerId = normalizeMapEntityId(row?.occupiedByPlayerId);
            const occupyingFleetId = normalizeMapEntityId(row?.occupyingFleetId);
            return {
              id: String(row?.id || "").trim(),
              x: Math.floor(Number(row?.x ?? 0)),
              y: Math.floor(Number(row?.y ?? 0)),
              rarityTier: String(row?.rarityTier || "COMMON").toUpperCase() as MapFieldServerDto["rarityTier"],
              qualityTier: String(row?.qualityTier || "STANDARD").toUpperCase() as MapFieldServerDto["qualityTier"],
              resources: Array.isArray(row?.resources)
                ? row.resources
                    .map((res: any) => ({
                      resourceId: String(res?.resourceId || "").trim(),
                      totalAmount: Math.max(0, Math.floor(Number(res?.totalAmount ?? 0))),
                      remainingAmount: Math.max(0, Math.floor(Number(res?.remainingAmount ?? 0)))
                    }))
                    .filter((res: any) => res.resourceId.length > 0)
                : [],
              totalExtractionWork: Math.max(0, Math.floor(Number(row?.totalExtractionWork ?? 0))),
              remainingExtractionWork: Math.max(0, Math.floor(Number(row?.remainingExtractionWork ?? 0))),
              spawnedAt: Math.max(0, Math.floor(Number(row?.spawnedAt ?? 0))),
              expiresAt: Math.max(0, Math.floor(Number(row?.expiresAt ?? 0))),
              occupiedByPlayerId,
              occupiedByUsername: String(row?.occupiedByUsername || ""),
              occupyingFleetId,
              isOccupied: normalizeMapOccupiedFlag(row?.isOccupied, occupiedByPlayerId, occupyingFleetId),
              isVisible: parseBooleanFlag(row?.isVisible, true),
              hiddenDetails: parseBooleanFlag(row?.hiddenDetails, false)
            };
          })
          .filter((row: MapFieldServerDto) => row.id.length > 0);

        const parsedExpeditions = expeditionsRaw
          .map((row: any) => parseMapExpeditionRow(parseJsonObject(row)))
          .filter((row: MapExpeditionDto | null): row is MapExpeditionDto => Boolean(row));
        const fallbackExpedition = parseMapExpeditionRow(expeditionRaw);
        const nextExpeditions = parsedExpeditions.length > 0
          ? parsedExpeditions
          : fallbackExpedition
            ? [fallbackExpedition]
            : [];
        const nextExpedition: MapExpeditionDto | null = nextExpeditions[0] ?? null;

        const nextReports = reportsRaw
          .map((row: any) => ({
            id: String(row?.id || "").trim(),
            fieldId: String(row?.fieldId || "").trim(),
            at: Math.max(0, Math.floor(Number(row?.at ?? 0))),
            resources: (row?.resources && typeof row.resources === "object" ? row.resources : {}) as Partial<Record<ResourceId, number>>,
            items: Array.isArray(row?.items)
              ? row.items
                  .map((item: any) => ({
                    itemId: String(item?.itemId || "").trim(),
                    quantity: Math.max(0, Math.floor(Number(item?.quantity ?? 0)))
                  }))
                  .filter((item: any) => item.itemId.length > 0 && item.quantity > 0)
              : []
          }))
          .filter((row: any) => row.id.length > 0);

        const nextHarvestInventory: MapHarvestShipRow[] = harvestRaw
          .map((row: any) => ({
            unitId: String(row?.unitId || "").trim(),
            quantity: Math.max(0, Math.floor(Number(row?.quantity ?? 0))),
            harvestSpeed: Math.max(0, Math.floor(Number(row?.harvestSpeed ?? 0))),
            harvestCapacity: Math.max(0, Math.floor(Number(row?.harvestCapacity ?? 0))),
            mapSpeed: Math.max(0, Math.floor(Number(row?.mapSpeed ?? 0)))
          }))
          .filter((row: MapHarvestShipRow) => row.unitId.length > 0 && row.quantity > 0);

        const stateRaw = parseJsonObject(source?.state);
        const stateResources =
          stateRaw?.resources && typeof stateRaw.resources === "object"
            ? (stateRaw.resources as Partial<Record<ResourceId, number>>)
            : undefined;
        const stateCredits = Number(stateRaw?.credits ?? NaN);
        const stateMapDropNotifications = Number(stateRaw?.mapDropNotifications ?? NaN);
        const syncReport = parseJsonObject(source?.syncReport);

        if (!cancelled) {
          setMapFields(nextFields);
          setMapExpeditions(nextExpeditions);
          setMapExpedition(nextExpedition);
          setMapReports(nextReports);
          setMapHarvestInventory(nextHarvestInventory);
          setMapServerMaxActiveExpeditions(maxActiveExpeditions);
          setMapLoadError("");
          onMapStateSync?.({
            resources: stateResources,
            credits: Number.isFinite(stateCredits) ? Math.max(0, Math.floor(stateCredits)) : undefined,
            mapDropNotifications: Number.isFinite(stateMapDropNotifications) ? Math.max(0, Math.floor(stateMapDropNotifications)) : undefined,
            syncReport: Object.keys(syncReport).length > 0 ? syncReport : null
          });
        }
      } catch (err) {
        if (isUnauthorizedError(err)) {
          invalidateSession();
          return;
        }
        if (isRequestTimeoutError(err)) {
          mapStateRpcBackoffUntilRef.current = Date.now() + 10000;
        }
        if (!cancelled) {
          const detail = extractRpcErrorMessage(err);
          const baseMsg = l("Impossible de charger les champs de ressources.", "Unable to load resource fields.");
          setMapLoadError(detail ? `${baseMsg} (${detail})` : baseMsg);
        }
        if (import.meta.env.DEV) {
          // eslint-disable-next-line no-console
          console.error("map fields load error", err);
        }
      } finally {
        mapStateRpcInFlightRef.current = false;
      }
    };

    if (!mapActionBusy) void loadMapState();
    const interval = setInterval(() => {
      if (!mapActionBusy) void loadMapState();
    }, 12000);
    return () => {
      cancelled = true;
      clearInterval(interval);
    };
  }, [client, commandementEscadreLevel, session, language, mapActionBusy]);

  useEffect(() => {
    const tick = setInterval(() => setMapNowMs(Date.now()), 1000);
    return () => clearInterval(tick);
  }, []);

  useEffect(() => {
    const displayedExpeditions = mapExpeditions.length > 0 ? mapExpeditions : (mapExpedition ? [mapExpedition] : []);
    if (displayedExpeditions.length <= 0) {
      setMapServerSync(null);
      return;
    }
    const freshestServerMs =
      displayedExpeditions.reduce(
        (max, expedition) => Math.max(max, Math.max(0, Math.floor(Number(expedition.serverNowTs || 0))) * 1000),
        0
      ) || 0;
    if (freshestServerMs <= 0) return;
    setMapServerSync((prev) => {
      const now = Date.now();
      if (prev) {
        const estimatedCurrentServerMs = prev.serverMs + Math.max(0, now - prev.localMs);
        if (estimatedCurrentServerMs >= freshestServerMs) return prev;
      }
      return {
        serverMs: freshestServerMs,
        localMs: now
      };
    });
  }, [mapExpedition, mapExpeditions]);

  const sectorPlayerPlanets = useMemo(() => {
    const selfId = String(currentUserId || "").trim();
    const selfUsername = String(currentUsername || "").trim() || selfId.slice(0, 8);
    const rows = Array.isArray(mapPlayers)
      ? mapPlayers.filter((player) => String(player.userId || "").trim() !== selfId)
      : [];
    if (selfId) {
      rows.unshift({ userId: selfId, username: selfUsername });
    }
    return computeSectorPlayerPlanets(rows, currentUserId);
  }, [currentUserId, currentUsername, mapPlayers]);

  const mapResourceEntities = useMemo(
    () => mapFields.map((field) => mapFieldToSectorEntity(field, language)),
    [language, mapFields]
  );

  const sectorEntities = useMemo(
    () => [...SECTOR_STATIONS, ...SECTOR_WORLDS, ...mapResourceEntities] as SectorEntity[],
    [mapResourceEntities]
  );

  const harvestAvailability = useMemo(() => {
    const fromServer: Record<string, number> = {};
    for (const row of mapHarvestInventory) fromServer[row.unitId] = Math.max(0, Math.floor(Number(row.quantity || 0)));
    const fallback: Record<string, number> = {};
    for (const key of Object.keys(MAP_HARVEST_UNIT_STATS)) {
      fallback[key] = Math.max(0, Math.floor(Number(hangarInventory[key] ?? 0)));
    }
    return Object.keys(fromServer).length > 0 ? { ...fallback, ...fromServer } : fallback;
  }, [hangarInventory, mapHarvestInventory]);

  useEffect(() => {
    setFleetDraft((prev) => {
      let changed = false;
      const next = { ...prev };
      for (const unitId of Object.keys(next)) {
        const available = Math.max(0, Math.floor(Number(harvestAvailability[unitId] ?? 0)));
        const current = Math.max(0, Math.floor(Number(next[unitId] ?? 0)));
        const clamped = Math.max(0, Math.min(available, current));
        if (clamped !== current || String(clamped) !== next[unitId]) {
          next[unitId] = String(clamped);
          changed = true;
        }
      }
      return changed ? next : prev;
    });
  }, [harvestAvailability]);

  const hasValidHarvestFleetSelection = useMemo(() => {
    for (const unitId of Object.keys(fleetDraft)) {
      const available = Math.max(0, Math.floor(Number(harvestAvailability[unitId] ?? 0)));
      const requested = Math.max(0, Math.floor(Number(fleetDraft[unitId] ?? 0)));
      const usable = Math.min(available, requested);
      if (usable > 0) return true;
    }
    return false;
  }, [fleetDraft, harvestAvailability]);

  const selfPlanetCoords = useMemo(() => {
    return mapPlayerToPlanetCoordinates(String(currentUserId || "guest"));
  }, [currentUserId]);

  const clampCameraCenter = useCallback((coords: { x: number; y: number }, targetZoom: number) => {
    const safeZoom = Math.max(0.01, targetZoom);
    const worldHalfWidth = viewportSize.width > 0 ? viewportSize.width / (2 * safeZoom) : 0;
    const worldHalfHeight = viewportSize.height > 0 ? viewportSize.height / (2 * safeZoom) : 0;
    const minX = Math.max(0, worldHalfWidth);
    const maxX = Math.min(SECTOR_MAP_SIZE, SECTOR_MAP_SIZE - worldHalfWidth);
    const minY = Math.max(0, worldHalfHeight);
    const maxY = Math.min(SECTOR_MAP_SIZE, SECTOR_MAP_SIZE - worldHalfHeight);
    return {
      x: Math.round(maxX >= minX ? Math.max(minX, Math.min(maxX, coords.x)) : SECTOR_MAP_SIZE / 2),
      y: Math.round(maxY >= minY ? Math.max(minY, Math.min(maxY, coords.y)) : SECTOR_MAP_SIZE / 2)
    };
  }, [viewportSize.height, viewportSize.width]);

  const pan = useMemo(
    () => ({
      x: viewportSize.width / 2 - cameraCenter.x * zoom,
      y: viewportSize.height / 2 - cameraCenter.y * zoom
    }),
    [cameraCenter.x, cameraCenter.y, viewportSize.height, viewportSize.width, zoom]
  );

  useEffect(() => {
    const node = containerRef.current;
    if (!node) return;
    const syncSize = () => setViewportSize({ width: node.clientWidth, height: node.clientHeight });
    syncSize();
    const onResize = () => syncSize();
    window.addEventListener("resize", onResize);
    let observer: ResizeObserver | null = null;
    if (typeof ResizeObserver !== "undefined") {
      observer = new ResizeObserver(syncSize);
      observer.observe(node);
    }
    return () => {
      window.removeEventListener("resize", onResize);
      observer?.disconnect();
    };
  }, []);

  const centerCameraOnCoords = useCallback((coords: { x: number; y: number }, targetZoom: number) => {
    const node = containerRef.current;
    if (!node) return false;
    const width = node.clientWidth;
    const height = node.clientHeight;
    if (width < 40 || height < 40) return false;
    setZoom(targetZoom);
    setCameraCenter(clampCameraCenter(coords, targetZoom));
    return true;
  }, [clampCameraCenter]);

  const focusMyPosition = useCallback((resetZoom: boolean) => {
    return centerCameraOnCoords(selfPlanetCoords, resetZoom ? initialMapZoom : zoom);
  }, [centerCameraOnCoords, initialMapZoom, selfPlanetCoords, zoom]);

  useEffect(() => {
    mapAutoCenterKeyRef.current = "";
  }, [currentUserId]);

  useLayoutEffect(() => {
    if (!session || !currentUserId) return;
    const centerKey = `${currentUserId}:${Math.round(selfPlanetCoords.x)}:${Math.round(selfPlanetCoords.y)}`;
    if (mapAutoCenterKeyRef.current === centerKey) return;

    let timerId = 0;
    let frameA = 0;
    let frameB = 0;

    timerId = window.setTimeout(() => {
      frameA = window.requestAnimationFrame(() => {
        frameB = window.requestAnimationFrame(() => {
          if (focusMyPosition(true)) {
            mapAutoCenterKeyRef.current = centerKey;
          }
        });
      });
    }, 0);

    return () => {
      if (timerId) window.clearTimeout(timerId);
      if (frameA) window.cancelAnimationFrame(frameA);
      if (frameB) window.cancelAnimationFrame(frameB);
    };
  }, [currentUserId, focusMyPosition, selfPlanetCoords.x, selfPlanetCoords.y, session]);

  const mapNowTs = useMemo(() => {
    if (!mapServerSync) return Math.floor(mapNowMs / 1000);
    return Math.floor((mapServerSync.serverMs + (mapNowMs - mapServerSync.localMs)) / 1000);
  }, [mapNowMs, mapServerSync]);

  const dailyQuestSchedule = useMemo(() => {
    const nowTs = Math.max(0, mapNowTs);
    const d = new Date(nowTs * 1000);
    const todayNoonTs = Math.floor(Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate(), 12, 0, 0) / 1000);
    const cycleStartTs = nowTs >= todayNoonTs ? todayNoonTs : todayNoonTs - 86400;
    const cycleEndTs = cycleStartTs + 86400;
    const cycleDate = new Date(cycleStartTs * 1000);
    const cycleKey = `${cycleDate.getUTCFullYear()}-${String(cycleDate.getUTCMonth() + 1).padStart(2, "0")}-${String(cycleDate.getUTCDate()).padStart(2, "0")}_12`;
    return {
      cycleKey,
      cycleStartTs,
      cycleEndTs,
      resetSeconds: Math.max(0, cycleEndTs - nowTs)
    };
  }, [mapNowTs]);

  const fieldPopupEntity = useMemo(() => {
    if (!fieldPopupId) return null;
    const row = mapResourceEntities.find((entity) => entity.id === fieldPopupId);
    return row ?? null;
  }, [fieldPopupId, mapResourceEntities]);

  const selectedFieldEntity = fieldPopupEntity;

  const selectedFieldPlan = useMemo(() => {
    if (!selectedFieldEntity) return null;
    const rows = Object.keys(fleetDraft).map((unitId) => ({
      unitId,
      quantity: Math.min(
        Math.max(0, Math.floor(Number(harvestAvailability[unitId] ?? 0))),
        Math.max(0, Math.floor(Number(fleetDraft[unitId] ?? 0)))
      )
    }));
    return estimateMapHarvestPlan(
      rows,
      currentUserId || "guest",
      selectedFieldEntity.x,
      selectedFieldEntity.y,
      Math.max(1, selectedFieldEntity.remainingExtractionWork ?? selectedFieldEntity.totalExtractionWork ?? 3600)
    );
  }, [currentUserId, fleetDraft, harvestAvailability, selectedFieldEntity]);

  const displayedMapExpeditions = useMemo(
    () => (mapExpeditions.length > 0 ? mapExpeditions : (mapExpedition ? [mapExpedition] : [])),
    [mapExpedition, mapExpeditions]
  );

  const derivedDisplayedMapExpeditions = useMemo(
    () =>
      displayedMapExpeditions
        .map((expedition) => ({
          expedition,
          timeline: deriveMapExpeditionTimeline(expedition, mapNowTs)
        }))
        .filter((row) => !row.timeline.completed),
    [displayedMapExpeditions, mapNowTs]
  );

  const dailyHarvestElapsedSeconds = useMemo(
    () =>
      derivedDisplayedMapExpeditions.reduce((max, row) => {
        if (row.timeline.status !== "extracting") return max;
        return Math.max(max, Math.max(0, mapNowTs - row.timeline.startAt));
      }, 0),
    [derivedDisplayedMapExpeditions, mapNowTs]
  );

  const dailyCollectionQuestTarget = useMemo(
    () => Math.max(1, Math.floor(Math.max(0, Number(carbonProductionPerSec || 0)) * 3600)),
    [carbonProductionPerSec]
  );

  const mapMovingExpeditionVisuals = useMemo(
    () =>
      derivedDisplayedMapExpeditions
        .map(({ expedition, timeline }) => {
          const field = mapFields.find((row) => row.id === expedition.fieldId);
          if (!field) return null;
          const status = timeline.status;
          if (status !== "travel_to_field" && status !== "returning") return null;
          const home = selfPlanetCoords;
          const fieldPoint = { x: field.x, y: field.y };
          const returning = status === "returning";
          const start = returning ? fieldPoint : home;
          const target = returning ? home : fieldPoint;
          const progress = timeline.progress;
          const dx = target.x - start.x;
          const dy = target.y - start.y;
          return {
            id: expedition.id,
            status,
            startX: start.x,
            startY: start.y,
            targetX: target.x,
            targetY: target.y,
            currentX: start.x + dx * progress,
            currentY: start.y + dy * progress,
            angle: Math.atan2(dy, dx) * (180 / Math.PI) + 90
          };
        })
        .filter(
          (
            visual
          ): visual is {
            id: string;
            status: string;
            startX: number;
            startY: number;
            targetX: number;
            targetY: number;
            currentX: number;
            currentY: number;
            angle: number;
          } => Boolean(visual)
        ),
    [derivedDisplayedMapExpeditions, mapFields, selfPlanetCoords]
  );

  const mapExtractionVisuals = useMemo(
    () =>
      derivedDisplayedMapExpeditions
        .map(({ expedition, timeline }) => {
          if (timeline.status !== "extracting") return null;
          const field = mapFields.find((row) => row.id === expedition.fieldId);
          if (!field) return null;
          return {
            id: expedition.id,
            currentX: field.x,
            currentY: field.y
          };
        })
        .filter(
          (
            visual
          ): visual is {
            id: string;
            currentX: number;
            currentY: number;
          } => Boolean(visual)
        ),
    [derivedDisplayedMapExpeditions, mapFields]
  );

  const entityLabelById = useMemo(() => {
    const output: Record<string, string> = {};
    for (const entity of sectorEntities) output[entity.id] = sectorEntityDisplayName(entity, language);
    return output;
  }, [language, sectorEntities]);

  const inFlightRows = useMemo(() => {
    const rows: Array<{
      id: string;
      title: string;
      route: string;
      detail: string;
      progress: number;
      remainingSeconds?: number;
      etaTs?: number;
      canRecall?: boolean;
      expeditionId?: string;
      targetCoords?: { x: number; y: number };
    }> = fleets
      .map((fleet) => {
        const missionLabel = fleet.missionType === "attack"
          ? (language === "en" ? "Combat fleet" : "Flotte de combat")
          : fleet.missionType === "mine"
            ? (language === "en" ? "Gathering fleet" : "Flotte de collecte")
            : (language === "en" ? "Mission fleet" : "Flotte de mission");
        const sourceName = entityLabelById[fleet.sourceId] ?? fleet.sourceId;
        const targetName = entityLabelById[fleet.targetId] ?? fleet.targetId;
        return {
          id: fleet.id,
          title: missionLabel,
          route: `${sourceName} → ${targetName}`,
          detail: `${Math.max(0, Math.min(100, Math.round(fleet.progress * 100)))}%`,
          progress: Math.max(0, Math.min(1, fleet.progress))
        };
      })
      .filter((row) => row.progress < 1);

    for (const { expedition, timeline } of derivedDisplayedMapExpeditions) {
      const field = mapFields.find((row) => row.id === expedition.fieldId);
      const fieldName = field ? mapFieldDisplayName(field.id, language) : mapFieldDisplayName(expedition.fieldId, language);
      const fieldCoords = field ? { x: field.x, y: field.y } : undefined;
      const status = timeline.status;
      const statusLabel = status === "extracting"
        ? (language === "en" ? "Harvesting fleet" : "Flotte en extraction")
        : status === "returning"
          ? (language === "en" ? "Returning fleet" : "Flotte en retour")
          : (language === "en" ? "Traveling fleet" : "Flotte en trajet");
      const route = status === "extracting"
        ? `${fieldName} • ${language === "en" ? "Harvesting in progress" : "Exploitation en cours"}`
        : status === "returning"
          ? `${fieldName} → ${language === "en" ? "Your planet" : "Votre planète"}`
          : `${language === "en" ? "Your planet" : "Votre planète"} → ${fieldName}`;
      const etaTs = timeline.endAt;
      const remainingSeconds = Math.max(0, etaTs - mapNowTs);
      if (remainingSeconds <= 0) continue;
      rows.unshift({
        id: `expedition_${expedition.id}`,
        title: statusLabel,
        route: fieldCoords ? `${route} [${fieldCoords.x}, ${fieldCoords.y}]` : route,
        detail: `${language === "en" ? "ETA" : "Arrivée"} ${new Date(etaTs * 1000).toLocaleTimeString()}`,
        progress: timeline.progress,
        remainingSeconds,
        etaTs,
        canRecall: status !== "returning",
        expeditionId: expedition.id,
        targetCoords: fieldCoords
      });
    }
    return rows;
  }, [derivedDisplayedMapExpeditions, entityLabelById, fleets, language, mapFields, mapNowTs]);

  const mapLiveExtractionOverlays = useMemo(() => {
    const validResourceIds = new Set<ResourceId>(RESOURCE_DEFS.map((def) => def.id as ResourceId));
    const normalizeResourceId = (raw: unknown): ResourceId | null => {
      const value = String(raw || "").trim().toLowerCase();
      if (!value || !validResourceIds.has(value as ResourceId)) return null;
      return value as ResourceId;
    };
    const toInt = (raw: unknown) => Math.max(0, Math.floor(Number(raw ?? 0)));

    return derivedDisplayedMapExpeditions
      .map(({ expedition, timeline }) => {
        if (timeline.status !== "extracting") return null;
        const field = mapFields.find((row) => row.id === expedition.fieldId);
        if (!field) return null;

        const fieldSnapshot: Partial<Record<ResourceId, number>> = {};
        if (Array.isArray(field.resources)) {
          for (const row of field.resources) {
            const rid = normalizeResourceId(row.resourceId);
            if (!rid) continue;
            fieldSnapshot[rid] = toInt(row.totalAmount);
          }
        }

        const expeditionSnapshot = expedition.snapshotResources && typeof expedition.snapshotResources === "object"
          ? expedition.snapshotResources
          : {};
        const serverCollected = expedition.collectedResources && typeof expedition.collectedResources === "object"
          ? expedition.collectedResources
          : {};

        const mergedSnapshot: Partial<Record<ResourceId, number>> = {};
        for (const [ridRaw, amountRaw] of Object.entries(fieldSnapshot)) {
          const rid = normalizeResourceId(ridRaw);
          if (!rid) continue;
          mergedSnapshot[rid] = toInt(amountRaw);
        }
        for (const [ridRaw, amountRaw] of Object.entries(expeditionSnapshot)) {
          const rid = normalizeResourceId(ridRaw);
          if (!rid) continue;
          mergedSnapshot[rid] = toInt(amountRaw);
        }

        const liveCollected: Partial<Record<ResourceId, number>> = {};
        for (const [ridRaw, amountRaw] of Object.entries(serverCollected)) {
          const rid = normalizeResourceId(ridRaw);
          if (!rid) continue;
          liveCollected[rid] = toInt(amountRaw);
        }

        const localEstimate = estimateMapExpeditionCollected(expedition, mergedSnapshot, mapNowTs);
        for (const [ridRaw, amountRaw] of Object.entries(localEstimate)) {
          const rid = normalizeResourceId(ridRaw);
          if (!rid) continue;
          liveCollected[rid] = Math.max(toInt(liveCollected[rid] ?? 0), toInt(amountRaw));
        }

        const orderedIds: ResourceId[] = [];
        const seen = new Set<ResourceId>();
        const addId = (raw: unknown) => {
          const rid = normalizeResourceId(raw);
          if (!rid || seen.has(rid)) return;
          seen.add(rid);
          orderedIds.push(rid);
        };
        if (Array.isArray(field.resources)) {
          for (const row of field.resources) addId(row.resourceId);
        }
        for (const rid of Object.keys(mergedSnapshot)) addId(rid);
        for (const rid of Object.keys(liveCollected)) addId(rid);

        return {
          id: expedition.id,
          x: field.x,
          y: field.y,
          cargoUsed: Object.values(liveCollected).reduce(
            (sum, value) => sum + Math.max(0, Math.floor(Number(value || 0))),
            0
          ),
          cargoCapacity: Math.max(0, Math.floor(Number(expedition.totalTransportCapacity || 0))),
          rows: orderedIds.map((resourceId) => ({
            resourceId,
            amount: toInt(liveCollected[resourceId] ?? 0)
          }))
        };
      })
      .filter(
        (
          overlay
        ): overlay is {
          id: string;
          x: number;
          y: number;
          cargoUsed: number;
          cargoCapacity: number;
          rows: Array<{ resourceId: ResourceId; amount: number }>;
        } => Boolean(overlay)
      );
  }, [derivedDisplayedMapExpeditions, mapFields, mapNowTs]);

  const primaryDisplayedExpedition = useMemo(() => {
    if (derivedDisplayedMapExpeditions.length <= 0) return null;
    return (
      derivedDisplayedMapExpeditions.find((row) => row.timeline.status !== "returning") ??
      derivedDisplayedMapExpeditions[0] ??
      null
    );
  }, [derivedDisplayedMapExpeditions]);

  const mapLiveCollectedRows = useMemo(
    () => {
      if (mapLiveExtractionOverlays.length <= 0) return [];
      const primaryId = primaryDisplayedExpedition?.expedition.id;
      if (!primaryId) return mapLiveExtractionOverlays[0].rows;
      const overlay = mapLiveExtractionOverlays.find((row) => row.id === primaryId);
      return overlay ? overlay.rows : mapLiveExtractionOverlays[0].rows;
    },
    [mapLiveExtractionOverlays, primaryDisplayedExpedition]
  );
  const primaryLiveExtractionOverlay = useMemo(
    () => {
      if (mapLiveExtractionOverlays.length <= 0) return null;
      const primaryId = primaryDisplayedExpedition?.expedition.id;
      if (!primaryId) return mapLiveExtractionOverlays[0] ?? null;
      return mapLiveExtractionOverlays.find((row) => row.id === primaryId) ?? mapLiveExtractionOverlays[0] ?? null;
    },
    [mapLiveExtractionOverlays, primaryDisplayedExpedition]
  );

  const primaryMapExpedition = primaryDisplayedExpedition?.expedition ?? null;
  const primaryExpeditionState = primaryDisplayedExpedition?.timeline ?? null;

  useEffect(() => {
    if (typeof window === "undefined") return;
    try {
      const raw = window.localStorage.getItem(dailyHarvestQuestStorageKey);
      if (!raw) {
        setDailyHarvestQuestState({
          cycleKey: dailyQuestSchedule.cycleKey,
          extractionBestSeconds: 0,
          extractionClaimed: false,
          collectedResources: 0,
          collectionClaimed: false,
          processedReportIds: []
        });
        return;
      }
      const parsed = JSON.parse(raw) as Partial<MapDailyHarvestQuestState>;
      const savedCycleKey = String(parsed?.cycleKey || "");
      if (savedCycleKey !== dailyQuestSchedule.cycleKey) {
        setDailyHarvestQuestState({
          cycleKey: dailyQuestSchedule.cycleKey,
          extractionBestSeconds: 0,
          extractionClaimed: false,
          collectedResources: 0,
          collectionClaimed: false,
          processedReportIds: []
        });
        return;
      }
      setDailyHarvestQuestState({
        cycleKey: savedCycleKey,
        extractionBestSeconds: Math.max(0, Math.min(DAILY_HARVEST_QUEST_TARGET_SECONDS, Math.floor(Number(parsed?.extractionBestSeconds ?? 0)))),
        extractionClaimed: Boolean(parsed?.extractionClaimed),
        collectedResources: Math.max(0, Math.floor(Number(parsed?.collectedResources ?? 0))),
        collectionClaimed: Boolean(parsed?.collectionClaimed),
        processedReportIds: Array.isArray(parsed?.processedReportIds)
          ? parsed!.processedReportIds!.map((id) => String(id || "").trim()).filter((id) => id.length > 0).slice(-100)
          : []
      });
    } catch {
      setDailyHarvestQuestState({
        cycleKey: dailyQuestSchedule.cycleKey,
        extractionBestSeconds: 0,
        extractionClaimed: false,
        collectedResources: 0,
        collectionClaimed: false,
        processedReportIds: []
      });
    }
  }, [DAILY_HARVEST_QUEST_TARGET_SECONDS, dailyHarvestQuestStorageKey, dailyQuestSchedule.cycleKey]);

  useEffect(() => {
    setDailyHarvestQuestState((prev) => {
      if (prev.cycleKey === dailyQuestSchedule.cycleKey) return prev;
      return {
        cycleKey: dailyQuestSchedule.cycleKey,
        extractionBestSeconds: 0,
        extractionClaimed: false,
        collectedResources: 0,
        collectionClaimed: false,
        processedReportIds: []
      };
    });
  }, [dailyQuestSchedule.cycleKey]);

  useEffect(() => {
    setDailyHarvestQuestState((prev) => {
      if (prev.cycleKey !== dailyQuestSchedule.cycleKey) {
        return {
          cycleKey: dailyQuestSchedule.cycleKey,
          extractionBestSeconds: 0,
          extractionClaimed: false,
          collectedResources: 0,
          collectionClaimed: false,
          processedReportIds: []
        };
      }
      const nextBest = Math.max(prev.extractionBestSeconds, Math.min(DAILY_HARVEST_QUEST_TARGET_SECONDS, dailyHarvestElapsedSeconds));
      if (nextBest === prev.extractionBestSeconds) return prev;
      return { ...prev, extractionBestSeconds: nextBest };
    });
  }, [DAILY_HARVEST_QUEST_TARGET_SECONDS, dailyHarvestElapsedSeconds, dailyQuestSchedule.cycleKey]);

  useEffect(() => {
    setDailyHarvestQuestState((prev) => {
      if (prev.cycleKey !== dailyQuestSchedule.cycleKey) {
        return {
          cycleKey: dailyQuestSchedule.cycleKey,
          extractionBestSeconds: 0,
          extractionClaimed: false,
          collectedResources: 0,
          collectionClaimed: false,
          processedReportIds: []
        };
      }
      const seen = new Set(prev.processedReportIds);
      let gained = 0;
      let changed = false;
      for (const report of mapReports) {
        const reportId = String(report?.id || "").trim();
        const reportAt = Math.max(0, Math.floor(Number(report?.at ?? 0)));
        if (!reportId || seen.has(reportId)) continue;
        if (reportAt < dailyQuestSchedule.cycleStartTs || reportAt >= dailyQuestSchedule.cycleEndTs) continue;
        seen.add(reportId);
        changed = true;
        const resources = report?.resources && typeof report.resources === "object" ? report.resources : {};
        gained += Object.values(resources).reduce((sum, value) => sum + Math.max(0, Math.floor(Number(value || 0))), 0);
      }
      if (!changed) return prev;
      return {
        ...prev,
        collectedResources: prev.collectedResources + gained,
        processedReportIds: Array.from(seen).slice(-120)
      };
    });
  }, [dailyQuestSchedule.cycleEndTs, dailyQuestSchedule.cycleKey, dailyQuestSchedule.cycleStartTs, mapReports]);

  useEffect(() => {
    if (typeof window === "undefined") return;
    try {
      window.localStorage.setItem(dailyHarvestQuestStorageKey, JSON.stringify(dailyHarvestQuestState));
    } catch {
      // ignore storage failures
    }
  }, [dailyHarvestQuestState, dailyHarvestQuestStorageKey]);

  const dailyHarvestQuestProgressSeconds = Math.min(
    DAILY_HARVEST_QUEST_TARGET_SECONDS,
    Math.max(dailyHarvestQuestState.extractionBestSeconds, dailyHarvestElapsedSeconds)
  );
  const dailyHarvestQuestComplete = dailyHarvestQuestProgressSeconds >= DAILY_HARVEST_QUEST_TARGET_SECONDS;
  const dailyCollectionQuestProgress = Math.min(dailyCollectionQuestTarget, Math.max(0, dailyHarvestQuestState.collectedResources));
  const dailyCollectionQuestComplete = dailyCollectionQuestProgress >= dailyCollectionQuestTarget;
  const dailyAvailableCount =
    (dailyHarvestQuestState.extractionClaimed ? 0 : 1) +
    (dailyHarvestQuestState.collectionClaimed ? 0 : 1);
  const dailyHarvestQuestProgressLabel = `${formatDuration(dailyHarvestQuestProgressSeconds)} / ${formatDuration(DAILY_HARVEST_QUEST_TARGET_SECONDS)}`;
  const dailyCollectionQuestProgressLabel = `${dailyCollectionQuestProgress.toLocaleString()} / ${dailyCollectionQuestTarget.toLocaleString()}`;
  const dailyHarvestQuestResetLabel = l(
    `Reset dans ${formatDuration(dailyQuestSchedule.resetSeconds)}`,
    `Reset in ${formatDuration(dailyQuestSchedule.resetSeconds)}`
  );
  const dailyQuestCards = useMemo(
    () => [
      {
        id: "extract_5m" as const,
        titleFr: "Extraction prolongee",
        titleEn: "Extended extraction",
        descriptionFr: "Exploiter un champ de ressources pendant plus de 5 minutes.",
        descriptionEn: "Harvest a resource field for more than 5 minutes.",
        progressLabel: dailyHarvestQuestProgressLabel,
        ratio: Math.min(100, Math.round((dailyHarvestQuestProgressSeconds / DAILY_HARVEST_QUEST_TARGET_SECONDS) * 100)),
        rewardFr: "50 Credits",
        rewardEn: "50 Credits",
        claimed: dailyHarvestQuestState.extractionClaimed,
        complete: dailyHarvestQuestComplete
      },
      {
        id: "collect_hourly" as const,
        titleFr: "Rendement journalier",
        titleEn: "Daily yield",
        descriptionFr: `Recolter ${dailyCollectionQuestTarget.toLocaleString()} ressources`,
        descriptionEn: `Collect ${dailyCollectionQuestTarget.toLocaleString()} resources`,
        progressLabel: dailyCollectionQuestProgressLabel,
        ratio: Math.min(100, Math.round((dailyCollectionQuestProgress / Math.max(1, dailyCollectionQuestTarget)) * 100)),
        rewardFr: "150 Credits",
        rewardEn: "150 Credits",
        claimed: dailyHarvestQuestState.collectionClaimed,
        complete: dailyCollectionQuestComplete
      }
    ],
    [
      DAILY_HARVEST_QUEST_TARGET_SECONDS,
      dailyCollectionQuestComplete,
      dailyCollectionQuestProgress,
      dailyCollectionQuestProgressLabel,
      dailyCollectionQuestTarget,
      dailyHarvestQuestComplete,
      dailyHarvestQuestProgressLabel,
      dailyHarvestQuestProgressSeconds,
      dailyHarvestQuestState.collectionClaimed,
      dailyHarvestQuestState.extractionClaimed
    ]
  );

  useEffect(() => {
    if (!selectedEntity) return;
    const exists = sectorEntities.some((entity) => entity.id === selectedEntity.id);
    if (!exists) setSelectedEntity(null);
  }, [sectorEntities, selectedEntity]);

  useEffect(() => {
    if (!fieldPopupId) return;
    const exists = mapResourceEntities.some((entity) => entity.id === fieldPopupId);
    if (!exists) setFieldPopupId(null);
  }, [fieldPopupId, mapResourceEntities]);

  useEffect(() => {
    if (!fieldPopupId) return;
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") setFieldPopupId(null);
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [fieldPopupId]);

  useEffect(() => {
    const interval = setInterval(() => {
      setFleets((prev) => {
        const next = prev.map((fleet) => ({ ...fleet, progress: fleet.progress + 0.006 }));
        return next.filter((fleet) => fleet.progress < 1);
      });
    }, 50);
    return () => clearInterval(interval);
  }, []);

  const handleMouseDown = (e: React.MouseEvent) => {
    if (e.button === 2 || e.button === 1) {
      setIsDragging(true);
      setLastMouse({ x: e.clientX, y: e.clientY });
    }
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging) return;
    const dx = e.clientX - lastMouse.x;
    const dy = e.clientY - lastMouse.y;
    setCameraCenter((prev) =>
      clampCameraCenter(
        {
          x: prev.x - dx / Math.max(0.01, zoom),
          y: prev.y - dy / Math.max(0.01, zoom)
        },
        zoom
      )
    );
    setLastMouse({ x: e.clientX, y: e.clientY });
  };

  const handleMouseUp = (e: React.MouseEvent) => {
    if (e.button === 2 || e.button === 1) setIsDragging(false);
  };

  const applyZoomAtPoint = useCallback((deltaY: number) => {
    setZoom((prevZoom) => {
      const delta = -deltaY * 0.0011;
      const nextZoom = Math.min(Math.max(prevZoom + delta, 0.22), 2.6);
      if (nextZoom === prevZoom) return prevZoom;
      setCameraCenter((prevCenter) => clampCameraCenter(prevCenter, nextZoom));
      return nextZoom;
    });
  }, [clampCameraCenter]);

  useEffect(() => {
    const node = containerRef.current;
    if (!node) return;
    const onWheel = (event: WheelEvent) => {
      event.preventDefault();
      event.stopPropagation();
      applyZoomAtPoint(event.deltaY);
    };
    node.addEventListener("wheel", onWheel, { passive: false });
    return () => {
      node.removeEventListener("wheel", onWheel);
    };
  }, [applyZoomAtPoint]);

  const navigateTo = (x: number, y: number) => {
    setCameraCenter(clampCameraCenter({ x, y }, zoom));
  };

  const onNavSubmit = (e: FormEvent) => {
    e.preventDefault();
    const x = parseInt(navX, 10);
    const y = parseInt(navY, 10);
    if (Number.isNaN(x) || Number.isNaN(y)) return;
    navigateTo(x, y);
  };

  const addMarker = () => {
    if (markers.length >= 5) return;
    const centerX = Math.round(cameraCenter.x);
    const centerY = Math.round(cameraCenter.y);
    const label = `${l("Secteur", "Sector")} ${centerX.toString().slice(0, 2)}-${centerY.toString().slice(0, 2)}`;
    setMarkers((prev) => [...prev, { name: label, x: centerX, y: centerY }]);
  };

  const removeMarker = (index: number) => {
    setMarkers((prev) => prev.filter((_, i) => i !== index));
  };

  const claimDailyQuest = (questId: "extract_5m" | "collect_hourly") => {
    if (questId === "extract_5m") {
      if (!dailyHarvestQuestComplete || dailyHarvestQuestState.extractionClaimed) return;
      setDailyHarvestQuestState((prev) => ({ ...prev, extractionClaimed: true }));
      onGrantCredits?.(DAILY_HARVEST_QUEST_REWARD, `daily_extract_${dailyQuestSchedule.cycleKey}`);
      return;
    }
    if (!dailyCollectionQuestComplete || dailyHarvestQuestState.collectionClaimed) return;
    setDailyHarvestQuestState((prev) => ({ ...prev, collectionClaimed: true }));
    onGrantCredits?.(DAILY_COLLECTION_QUEST_REWARD, `daily_collect_${dailyQuestSchedule.cycleKey}`);
  };

  const isVisible = (entity: SectorEntity) => {
    if (entity.type === "station" && entity.isPlayer) return true;
    if (entity.type === "station") return filters.enemies;
    if (entity.type === "resource") return filters.resources;
    if (entity.type === "world") return filters.missions;
    return true;
  };

  const handleEntityClick = (entity: SectorEntity) => {
    if (actionMode !== "none" && selectedEntity?.id === "st_1") {
      if (actionMode === "mine" && entity.type === "resource" && entity.fieldId) {
        const canLaunch = !mapActionBusy && canLaunchAnotherMapExpedition;
        if (canLaunch) {
          void launchHarvestOnField(entity.fieldId);
        }
        setActionMode("none");
        setSelectedEntity(null);
        return;
      }
      const color = actionMode === "attack" ? "#ff5f6c" : actionMode === "mine" ? "#ffc95f" : "#6bb8ff";
      const newFleet: SectorFleet = {
        id: `flt_${Date.now()}`,
        sourceId: selectedEntity.id,
        targetId: entity.id,
        startX: selectedEntity.x,
        startY: selectedEntity.y,
        targetX: entity.x,
        targetY: entity.y,
        progress: 0,
        missionType: actionMode,
        color
      };
      setFleets((prev) => [...prev, newFleet]);
      setActionMode("none");
      setSelectedEntity(null);
      return;
    }

    if (entity.type === "resource") {
      setFieldPopupId(entity.id);
      setSelectedEntity(null);
      setActionMode("none");
      return;
    }

    setSelectedEntity(entity);
    setFieldPopupId(null);
    setActionMode("none");
  };

  const applyMapPayload = (source: Record<string, any>) => {
    const rowsRaw = Array.isArray(source?.fields) ? source.fields : [];
    const nextFields: MapFieldServerDto[] = rowsRaw
      .map((row: any) => {
        const occupiedByPlayerId = normalizeMapEntityId(row?.occupiedByPlayerId);
        const occupyingFleetId = normalizeMapEntityId(row?.occupyingFleetId);
        return {
          id: String(row?.id || "").trim(),
          x: Math.floor(Number(row?.x ?? 0)),
          y: Math.floor(Number(row?.y ?? 0)),
          rarityTier: String(row?.rarityTier || "COMMON").toUpperCase() as MapFieldServerDto["rarityTier"],
          qualityTier: String(row?.qualityTier || "STANDARD").toUpperCase() as MapFieldServerDto["qualityTier"],
          resources: Array.isArray(row?.resources)
            ? row.resources
                .map((res: any) => ({
                  resourceId: String(res?.resourceId || "").trim(),
                  totalAmount: Math.max(0, Math.floor(Number(res?.totalAmount ?? 0))),
                  remainingAmount: Math.max(0, Math.floor(Number(res?.remainingAmount ?? 0)))
                }))
                .filter((res: any) => res.resourceId.length > 0)
            : [],
          totalExtractionWork: Math.max(0, Math.floor(Number(row?.totalExtractionWork ?? 0))),
          remainingExtractionWork: Math.max(0, Math.floor(Number(row?.remainingExtractionWork ?? 0))),
          spawnedAt: Math.max(0, Math.floor(Number(row?.spawnedAt ?? 0))),
          expiresAt: Math.max(0, Math.floor(Number(row?.expiresAt ?? 0))),
          occupiedByPlayerId,
          occupiedByUsername: String(row?.occupiedByUsername || ""),
          occupyingFleetId,
          isOccupied: normalizeMapOccupiedFlag(row?.isOccupied, occupiedByPlayerId, occupyingFleetId),
          isVisible: parseBooleanFlag(row?.isVisible, true),
          hiddenDetails: parseBooleanFlag(row?.hiddenDetails, false)
        };
      })
      .filter((row: MapFieldServerDto) => row.id.length > 0);
    setMapFields(nextFields);
    setMapServerMaxActiveExpeditions(Math.max(1, Math.floor(Number(source?.maxActiveExpeditions ?? 1))));

    const expeditionRaw = parseJsonObject(source?.expedition);
    const expeditionsRaw = Array.isArray(source?.expeditions) ? source.expeditions : [];
    const parsedExpeditions = expeditionsRaw
      .map((row: any) => parseMapExpeditionRow(parseJsonObject(row)))
      .filter((row: MapExpeditionDto | null): row is MapExpeditionDto => Boolean(row));
    const fallbackExpedition = parseMapExpeditionRow(expeditionRaw);
    const nextExpeditions = parsedExpeditions.length > 0
      ? parsedExpeditions
      : fallbackExpedition
        ? [fallbackExpedition]
        : [];
    setMapExpeditions(nextExpeditions);
    if (nextExpeditions.length > 0) {
      setMapExpedition(nextExpeditions[0]);
    } else {
      setMapExpedition(null);
    }

    if (Array.isArray(source?.harvestInventory)) {
      const nextHarvestInventory: MapHarvestShipRow[] = source.harvestInventory
        .map((row: any) => ({
          unitId: String(row?.unitId || "").trim(),
          quantity: Math.max(0, Math.floor(Number(row?.quantity ?? 0))),
          harvestSpeed: Math.max(0, Math.floor(Number(row?.harvestSpeed ?? 0))),
          harvestCapacity: Math.max(0, Math.floor(Number(row?.harvestCapacity ?? 0))),
          mapSpeed: Math.max(0, Math.floor(Number(row?.mapSpeed ?? 0)))
        }))
        .filter((row: MapHarvestShipRow) => row.unitId.length > 0 && row.quantity > 0);
      setMapHarvestInventory(nextHarvestInventory);
    }

    if (Array.isArray(source?.reports)) {
      const nextReports = source.reports
        .map((row: any) => ({
          id: String(row?.id || "").trim(),
          fieldId: String(row?.fieldId || "").trim(),
          at: Math.max(0, Math.floor(Number(row?.at ?? 0))),
          resources: (row?.resources && typeof row.resources === "object" ? row.resources : {}) as Partial<Record<ResourceId, number>>,
          items: Array.isArray(row?.items)
            ? row.items
                .map((item: any) => ({
                  itemId: String(item?.itemId || "").trim(),
                  quantity: Math.max(0, Math.floor(Number(item?.quantity ?? 0)))
                }))
                .filter((item: any) => item.itemId.length > 0 && item.quantity > 0)
            : []
        }))
        .filter((row: any) => row.id.length > 0);
      setMapReports(nextReports);
    }

    const stateRaw = parseJsonObject(source?.state);
    const stateResources =
      stateRaw?.resources && typeof stateRaw.resources === "object"
        ? (stateRaw.resources as Partial<Record<ResourceId, number>>)
        : undefined;
    const stateCredits = Number(stateRaw?.credits ?? NaN);
    const stateMapDropNotifications = Number(stateRaw?.mapDropNotifications ?? NaN);
    const syncReport = parseJsonObject(source?.syncReport);
    onMapStateSync?.({
      resources: stateResources,
      credits: Number.isFinite(stateCredits) ? Math.max(0, Math.floor(stateCredits)) : undefined,
      mapDropNotifications: Number.isFinite(stateMapDropNotifications) ? Math.max(0, Math.floor(stateMapDropNotifications)) : undefined,
      syncReport: Object.keys(syncReport).length > 0 ? syncReport : null
    });
  };

  useEffect(() => {
    setMapCacheHydrated(false);
  }, [currentUserId, mapCacheKey]);

  useLayoutEffect(() => {
    if (!session || !currentUserId) {
      setMapCacheHydrated(true);
      return;
    }
    try {
      const raw = sessionStorage.getItem(mapCacheKey);
      const parsed = parseJsonObject(raw);
      const cachedAtMs = Math.max(0, Math.floor(Number(parsed?.cachedAtMs ?? 0)));
      const cachedServerNowTs = Math.max(0, Math.floor(Number(parsed?.serverNowTs ?? 0)));
      if (cachedAtMs > 0 && cachedServerNowTs > 0) {
        setMapServerSync({
          serverMs: cachedServerNowTs * 1000,
          localMs: cachedAtMs
        });
      }
      if (Array.isArray(parsed?.players)) {
        const rows = parsed.players
          .map((row: any) => ({
            userId: String(row?.userId || "").trim(),
            username: String(row?.username || "").trim()
          }))
          .filter((row: { userId: string; username: string }) => row.userId.length > 0);
        if (rows.length > 0) setMapPlayers(rows);
      }
      if (parsed && typeof parsed === "object") {
        applyMapPayload(parsed);
      }
    } catch {
      // ignore malformed map cache
    } finally {
      setMapCacheHydrated(true);
    }
  }, [currentUserId, mapCacheKey, session]);

  useEffect(() => {
    if (!session || !currentUserId || !mapCacheHydrated) return;
    try {
      sessionStorage.setItem(
        mapCacheKey,
        JSON.stringify({
          cachedAtMs: Date.now(),
          serverNowTs: mapNowTs,
          players: mapPlayers,
          fields: mapFields,
          expedition: mapExpedition,
          expeditions: mapExpeditions,
          reports: mapReports,
          harvestInventory: mapHarvestInventory,
          maxActiveExpeditions: mapServerMaxActiveExpeditions
        })
      );
    } catch {
      // ignore storage quota errors
    }
  }, [
    currentUserId,
    mapCacheKey,
    mapExpedition,
    mapExpeditions,
    mapFields,
    mapHarvestInventory,
    mapPlayers,
    mapReports,
    mapServerMaxActiveExpeditions,
    mapCacheHydrated,
    session
  ]);

  useEffect(() => {
    if (!session || mapActionBusy) return;
    const displayedExpeditions = mapExpeditions.length > 0 ? mapExpeditions : (mapExpedition ? [mapExpedition] : []);
    if (displayedExpeditions.length <= 0) return;

    const hasOverdue = displayedExpeditions.some((expedition) => {
      const status = String(expedition?.status || "").trim().toLowerCase();
      const etaTs =
        status === "extracting"
          ? Math.max(0, Math.floor(Number(expedition?.extractionEndAt ?? 0)))
          : status === "returning"
            ? Math.max(0, Math.floor(Number(expedition?.returnEndAt ?? 0)))
            : Math.max(0, Math.floor(Number(expedition?.arrivalAt ?? 0)));
      return etaTs > 0 && etaTs <= mapNowTs;
    });

    if (!hasOverdue) return;
    const now = Date.now();
    if (now - mapOverdueSyncAtRef.current < 2500) return;
    mapOverdueSyncAtRef.current = now;

    let cancelled = false;
    const forceSync = async () => {
      const nowMs = Date.now();
      if (mapStateRpcInFlightRef.current) return;
      if (nowMs < mapStateRpcBackoffUntilRef.current) return;
      mapStateRpcInFlightRef.current = true;
      try {
        const rpc = await client.rpc(
          session,
          "rpc_map_fields_state",
          JSON.stringify({ commandementEscadreLevel })
        );
        if (cancelled) return;
        const parsed = parseJsonObject((rpc as any)?.payload ?? rpc);
        const nested = parseJsonObject(parsed?.payload);
        const source = Object.keys(nested).length > 0 ? nested : parsed;
        applyMapPayload(source);
      } catch (err) {
        if (isRequestTimeoutError(err)) {
          mapStateRpcBackoffUntilRef.current = Date.now() + 10000;
        }
      } finally {
        mapStateRpcInFlightRef.current = false;
      }
    };
    void forceSync();
    return () => {
      cancelled = true;
    };
  }, [applyMapPayload, client, commandementEscadreLevel, mapActionBusy, mapExpedition, mapExpeditions, mapNowTs, session]);

  const launchHarvestOnField = async (fieldId: string) => {
    if (!session) return;
    const fleetPayload = Object.keys(fleetDraft)
      .map((unitId) => ({
        unitId,
        quantity: Math.min(
          Math.max(0, Math.floor(Number(harvestAvailability[unitId] ?? 0))),
          Math.max(0, Math.floor(Number(fleetDraft[unitId] ?? 0)))
        )
      }))
      .filter((row) => row.quantity > 0);
    if (fleetPayload.length <= 0) {
      setMapActionError(
        l(
          "Aucun vaisseau de collecte disponible dans votre stock serveur.",
          "No harvesting ship is currently available in your server stock."
        )
      );
      return;
    }
    try {
      setMapActionBusy(true);
      setMapActionError("");
      const rpc = await client.rpc(
        session,
        "rpc_map_fields_start",
        JSON.stringify({ fieldId, fleet: fleetPayload, commandementEscadreLevel })
      );
      const parsed = parseJsonObject((rpc as any)?.payload ?? rpc);
      const nested = parseJsonObject(parsed?.payload);
      const source = Object.keys(nested).length > 0 ? nested : parsed;
      applyMapPayload(source);
    } catch (err) {
      let detail = extractRpcErrorMessage(err);
      if (!detail && err instanceof Response) {
        try {
          const raw = await err.text();
          const parsed = parseJsonObject(raw);
          detail =
            String(parsed.message || parsed.error || parsed.error_message || "").trim() ||
            raw.trim();
        } catch {
          // noop
        }
      }
      const detailLower = String(detail || "").toLowerCase();
      if (detailLower.includes("resource field is already occupied")) {
        detail = l(
          "Ce champ est deja occupe. Choisissez un champ libre.",
          "This field is already occupied. Choose a free field."
        );
      } else if (detailLower.includes("no harvestable resources unlocked for this field")) {
        detail = l(
          "Aucune ressource de ce champ n'est encore debloquee sur votre hyperstructure.",
          "No resource in this field is unlocked on your hyperstructure yet."
        );
      } else if (detailLower.includes("active fleet slot limit reached")) {
        detail = l(
          "Nombre maximal de flottes actives atteint pour votre niveau de Commandement d'Escadre.",
          "Maximum active fleet slots reached for your Squadron Command level."
        );
      }
      setMapActionError(
        detail
          ? `${l("Lancement de collecte impossible :", "Unable to launch harvesting:")} ${detail}`
          : l("Lancement de collecte impossible.", "Unable to launch harvesting.")
      );
      try {
        const now = Date.now();
        if (mapStateRpcInFlightRef.current || now < mapStateRpcBackoffUntilRef.current) {
          throw new Error("map state refresh skipped");
        }
        mapStateRpcInFlightRef.current = true;
        const rpcState = await client.rpc(
          session,
          "rpc_map_fields_state",
          JSON.stringify({ commandementEscadreLevel })
        );
        const parsedState = parseJsonObject((rpcState as any)?.payload ?? rpcState);
        const nestedState = parseJsonObject(parsedState?.payload);
        const sourceState = Object.keys(nestedState).length > 0 ? nestedState : parsedState;
        applyMapPayload(sourceState);
      } catch (refreshErr) {
        if (isRequestTimeoutError(refreshErr)) {
          mapStateRpcBackoffUntilRef.current = Date.now() + 10000;
        }
        // noop
      } finally {
        mapStateRpcInFlightRef.current = false;
      }
      if (import.meta.env.DEV) {
        // eslint-disable-next-line no-console
        console.error("map harvest start error", err);
      }
    } finally {
      setMapActionBusy(false);
      setActionMode("none");
    }
  };

  const recallHarvestFleet = async (expeditionId?: string) => {
    if (!session) return;
    try {
      setMapActionBusy(true);
      setMapActionError("");
      const rpc = await client.rpc(
        session,
        "rpc_map_fields_recall",
        JSON.stringify(expeditionId ? { expeditionId } : {})
      );
      const parsed = parseJsonObject((rpc as any)?.payload ?? rpc);
      const nested = parseJsonObject(parsed?.payload);
      const source = Object.keys(nested).length > 0 ? nested : parsed;
      applyMapPayload(source);
    } catch (err) {
      let detail = extractRpcErrorMessage(err);
      if (!detail && err instanceof Response) {
        try {
          const raw = await err.text();
          const parsed = parseJsonObject(raw);
          detail =
            String(parsed.message || parsed.error || parsed.error_message || "").trim() ||
            raw.trim();
        } catch {
          // noop
        }
      }
      const detailLower = String(detail || "").toLowerCase();
      if (detailLower.includes("expedition is already returning")) {
        detail = l("Cette flotte est deja en retour.", "This fleet is already returning.");
      } else if (detailLower.includes("no recallable expedition")) {
        detail = l("Aucune flotte rappelable pour le moment.", "No recallable fleet right now.");
      }

      let refreshed = false;
      try {
        const now = Date.now();
        if (mapStateRpcInFlightRef.current || now < mapStateRpcBackoffUntilRef.current) {
          throw new Error("map state refresh skipped");
        }
        mapStateRpcInFlightRef.current = true;
        const rpcState = await client.rpc(
          session,
          "rpc_map_fields_state",
          JSON.stringify({ commandementEscadreLevel })
        );
        const parsedState = parseJsonObject((rpcState as any)?.payload ?? rpcState);
        const nestedState = parseJsonObject(parsedState?.payload);
        const sourceState = Object.keys(nestedState).length > 0 ? nestedState : parsedState;
        applyMapPayload(sourceState);
        refreshed = true;
      } catch (refreshErr) {
        if (isRequestTimeoutError(refreshErr)) {
          mapStateRpcBackoffUntilRef.current = Date.now() + 10000;
        }
      } finally {
        mapStateRpcInFlightRef.current = false;
      }

      const base = l("Rappel impossible pour le moment.", "Unable to recall fleet right now.");
      const treatAsSyncedState =
        refreshed &&
        (detailLower.includes("expedition is already returning") ||
          detailLower.includes("no recallable expedition"));
      setMapActionError(treatAsSyncedState ? "" : detail ? `${base} (${detail})` : base);
      if (import.meta.env.DEV) {
        // eslint-disable-next-line no-console
        console.error("map harvest recall error", err);
      }
    } finally {
      setMapActionBusy(false);
    }
  };

  const resourceClass = (type: SectorResource["resourceType"]) => {
    if (type === "alliage") return "sector-resource-alliage";
    if (type === "helium3") return "sector-resource-helium";
    return "sector-resource-cristal";
  };

  const resourceTypeLabel = (type: SectorResource["resourceType"]) => {
    if (!type) return l("Multi-ressources", "Multi-resource");
    if (type === "alliage") return l("Alliage", "Alloy");
    if (type === "helium3") return l("Helium-3", "Helium-3");
    return l("Cristal", "Crystal");
  };

  const entityTypeLabel = (type: SectorEntityType) => {
    if (type === "station") return l("Station", "Station");
    if (type === "world") return l("Monde", "World");
    return l("Ressource", "Resource");
  };

  const formatFlightCountdown = (seconds: number) => {
    const safe = Math.max(0, Math.floor(Number(seconds || 0)));
    const hours = Math.floor(safe / 3600);
    const minutes = Math.floor((safe % 3600) / 60);
    const secs = safe % 60;
    return `${hours.toString().padStart(2, "0")}:${minutes.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  };

  const formatFlightEtaClock = (etaTs: number) =>
    new Date(Math.max(0, etaTs) * 1000).toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit"
    });

  const centerOnMyPosition = () => {
    focusMyPosition(false);
  };

  const isMyPlanetOutOfView = useMemo(() => {
    if (viewportSize.width <= 0 || viewportSize.height <= 0) return false;
    const screenX = selfPlanetCoords.x * zoom + pan.x;
    const screenY = selfPlanetCoords.y * zoom + pan.y;
    const margin = 46;
    return (
      screenX < margin ||
      screenY < margin ||
      screenX > viewportSize.width - margin ||
      screenY > viewportSize.height - margin
    );
  }, [pan.x, pan.y, selfPlanetCoords.x, selfPlanetCoords.y, viewportSize.height, viewportSize.width, zoom]);

  return (
    <main className={`sector-shell ${sidebarOpen ? "" : "sidebar-collapsed"}`}>
      <section
        ref={containerRef}
        className={`sector-viewport ${isDragging ? "dragging" : actionMode !== "none" ? "targeting" : ""}`}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
        onContextMenu={(e) => e.preventDefault()}
      >
        <div className="sector-stars layer-a" style={{ backgroundPosition: `${pan.x * 0.18}px ${pan.y * 0.18}px` }} />
        <div className="sector-stars layer-b" style={{ backgroundPosition: `${pan.x * 0.4}px ${pan.y * 0.4}px` }} />
        <div className="sector-nebula" />
        <div className="sector-top-stack">
          <aside
            className="sector-flight-overlay"
            onWheel={(e) => e.stopPropagation()}
            onMouseDown={(e) => e.stopPropagation()}
          >
            <details className="sector-flight-spoiler" open>
              <summary>
                <span className="sector-flight-head">
                  <Move size={14} />
                  <strong>{l("Flottes en vol", "Fleets in flight")}</strong>
                </span>
                <span className="sector-flight-summary-right">
                  <span>{inFlightRows.length}</span>
                  <span className="sector-flight-summary-caret">▾</span>
                </span>
              </summary>
              <div className="sector-flight-list">
                {inFlightRows.length <= 0 ? (
                  <p className="sector-empty">{l("Aucune flotte en transit.", "No fleet currently in transit.")}</p>
                ) : (
                  inFlightRows.map((row) => (
                    <article
                      key={row.id}
                      className={`sector-flight-item ${row.targetCoords ? "clickable" : ""}`}
                      onClick={() => {
                        if (!row.targetCoords) return;
                        navigateTo(row.targetCoords.x, row.targetCoords.y);
                      }}
                    >
                      <header>
                        <strong>{row.title}</strong>
                        {row.remainingSeconds == null ? <small>{row.detail}</small> : null}
                      </header>
                      <p>{row.route}</p>
                      {row.remainingSeconds != null && row.etaTs != null ? (
                        <div className="sector-flight-time-meta">
                          <span>{l("Temps restant", "Time left")}</span>
                          <strong className="sector-flight-time-value">{formatFlightCountdown(row.remainingSeconds)}</strong>
                          <span>{l("Arrivée", "Arrival")}</span>
                          <strong className="sector-flight-time-value">{formatFlightEtaClock(row.etaTs)}</strong>
                        </div>
                      ) : null}
                      <div className="sector-flight-progress">
                        <div style={{ width: `${Math.max(4, Math.min(100, Math.round(row.progress * 100)))}%` }} />
                      </div>
                      {row.canRecall ? (
                        <button
                          type="button"
                          className="sector-flight-return-btn"
                          onClick={(event) => {
                            event.stopPropagation();
                            void recallHarvestFleet(row.expeditionId);
                          }}
                          disabled={mapActionBusy}
                        >
                          {mapActionBusy ? l("Action...", "Processing...") : l("Retour", "Return")}
                        </button>
                      ) : null}
                    </article>
                  ))
                )}
              </div>
            </details>
          </aside>

          <aside
            className="sector-daily-overlay"
            onWheel={(e) => e.stopPropagation()}
            onMouseDown={(e) => e.stopPropagation()}
          >
            <details className="sector-daily-spoiler">
              <summary>
                <span className="sector-daily-head">
                  <Rocket size={14} />
                  <strong>{l("Missions quotidiennes", "Daily missions")}</strong>
                </span>
                <span className="sector-daily-summary-right">
                  <span className="sector-daily-badge">{dailyAvailableCount}</span>
                  <span className="sector-daily-summary-caret">▾</span>
                </span>
              </summary>
              <p className="sector-daily-reset">{dailyHarvestQuestResetLabel}</p>
              <div className="sector-daily-list">
                {dailyQuestCards.map((quest) => (
                  <article key={`daily_overlay_${quest.id}`} className="sector-daily-item">
                    <header>
                      <strong>{l(quest.titleFr, quest.titleEn)}</strong>
                      <span>{l(quest.rewardFr, quest.rewardEn)}</span>
                    </header>
                    <p className="sector-daily-desc">{l(quest.descriptionFr, quest.descriptionEn)}</p>
                    <div className="sector-daily-progress">
                      <div style={{ width: `${quest.ratio}%` }} />
                    </div>
                    <footer>
                      <small>{quest.progressLabel}</small>
                      <button
                        type="button"
                        className={quest.complete && !quest.claimed ? "ready" : ""}
                        disabled={!quest.complete || quest.claimed}
                        onClick={() => claimDailyQuest(quest.id)}
                      >
                        {quest.claimed
                          ? l("Recupere", "Claimed")
                          : quest.complete
                            ? l(quest.rewardFr, quest.rewardEn)
                            : l("En cours", "In progress")}
                      </button>
                    </footer>
                  </article>
                ))}
              </div>
            </details>
          </aside>
        </div>

        <div
          className="sector-transform-pan"
          style={{
            transform: `translate(${pan.x}px, ${pan.y}px)`,
            transition: "none"
          }}
        >
          <div
            className="sector-transform"
            style={{
              width: SECTOR_MAP_SIZE,
              height: SECTOR_MAP_SIZE,
              transform: `scale(${zoom})`,
              transformOrigin: "0 0",
              transition: "none"
            }}
          >
          <svg className="sector-grid" width={SECTOR_MAP_SIZE} height={SECTOR_MAP_SIZE}>
            <defs>
              <pattern id="sector-grid-pattern" width="200" height="200" patternUnits="userSpaceOnUse">
                <path d="M 200 0 L 0 0 0 200" fill="none" stroke="#28435a" strokeWidth="1" />
              </pattern>
            </defs>
            <rect width="100%" height="100%" fill="url(#sector-grid-pattern)" />
            {Array.from({ length: SECTOR_MAP_SIZE / 200 }).map((_, i) => {
              const v = i * 200;
              return (
                <g key={`axis_${i}`}>
                  <text x={v + 4} y={14} fill="#4f708a" fontSize="10" fontFamily="monospace">{v}</text>
                  {v > 0 ? <text x={4} y={v + 14} fill="#4f708a" fontSize="10" fontFamily="monospace">{v}</text> : null}
                </g>
              );
            })}
          </svg>

          <svg className="sector-fleet-layer" width={SECTOR_MAP_SIZE} height={SECTOR_MAP_SIZE}>
            {fleets.map((fleet) => {
              const cx = fleet.startX + (fleet.targetX - fleet.startX) * fleet.progress;
              const cy = fleet.startY + (fleet.targetY - fleet.startY) * fleet.progress;
              return (
                <g key={fleet.id}>
                  <line x1={fleet.startX} y1={fleet.startY} x2={fleet.targetX} y2={fleet.targetY} stroke={fleet.color} strokeWidth="2" strokeDasharray="10 10" opacity="0.24" />
                  <circle cx={cx} cy={cy} r="7" fill={fleet.color} className="sector-fleet-dot" />
                  <circle cx={cx} cy={cy} r="14" fill="none" stroke={fleet.color} strokeWidth="2" opacity="0.56" />
                </g>
              );
            })}

            {mapMovingExpeditionVisuals.map((visual) => (
              <g key={`map_expedition_${visual.id}`} className="sector-map-expedition-path">
                <line
                  x1={visual.startX}
                  y1={visual.startY}
                  x2={visual.targetX}
                  y2={visual.targetY}
                  stroke="#86d7ff"
                  strokeWidth="2.6"
                  strokeDasharray="11 10"
                  opacity="0.35"
                />
                <circle
                  cx={visual.currentX}
                  cy={visual.currentY}
                  r="12"
                  fill="rgba(120, 204, 255, 0.22)"
                />
                <g transform={`translate(${visual.currentX} ${visual.currentY}) rotate(${visual.angle})`}>
                  <path
                    d="M 0 -11 L 7 8 L 0 4 L -7 8 Z"
                    fill="#9adfff"
                    stroke="#e8f8ff"
                    strokeWidth="1.2"
                    className="sector-map-ship"
                  />
                </g>
              </g>
            ))}

            {mapExtractionVisuals.map((visual) => (
              <g key={`map_extraction_${visual.id}`} className="sector-map-expedition-path">
                <circle
                  cx={visual.currentX}
                  cy={visual.currentY}
                  r="18"
                  fill="none"
                  stroke="#aee6ff"
                  strokeWidth="2"
                  opacity="0.52"
                />
                <circle
                  cx={visual.currentX}
                  cy={visual.currentY}
                  r="8"
                  fill="#7ecfff"
                  className="sector-fleet-dot"
                />
              </g>
            ))}
          </svg>

          {mapLiveExtractionOverlays.map((overlay) => (
            <div
              key={`field_live_overlay_${overlay.id}`}
              className="sector-field-live-overlay"
              style={{ left: overlay.x, top: overlay.y - 68 }}
            >
              <p>{l("Ressources cumulées", "Accumulated resources")}</p>
              {overlay.rows.length <= 0 ? (
                <small>{l("Extraction en cours...", "Extraction in progress...")}</small>
              ) : (
                <>
                  {overlay.rows.map((row) => (
                    <div key={`field_live_gain_${overlay.id}_${row.resourceId}`} className="sector-field-live-row">
                      <span>{resourceDisplayName(row.resourceId, language)}</span>
                      <strong>+{row.amount.toLocaleString()}</strong>
                    </div>
                  ))}
                  <small className={`sector-field-live-capacity ${overlay.cargoCapacity > 0 && overlay.cargoUsed >= overlay.cargoCapacity ? "full" : ""}`}>
                    {l("Soute", "Cargo")}: {overlay.cargoUsed.toLocaleString()} / {overlay.cargoCapacity.toLocaleString()}
                    {overlay.cargoCapacity > 0 && overlay.cargoUsed >= overlay.cargoCapacity
                      ? ` • ${l("Pleine", "Full")}`
                      : ""}
                  </small>
                  {overlay.cargoCapacity > 0 && overlay.cargoUsed >= overlay.cargoCapacity ? (
                    <small className="sector-field-live-capacity-note">
                      {l("La flotte a atteint sa capacite cargo.", "The fleet has reached its cargo capacity.")}
                    </small>
                  ) : null}
                </>
              )}
            </div>
          ))}

          {sectorPlayerPlanets.map((playerPlanet) => (
            <div
              key={`player_planet_${playerPlanet.userId}`}
              className={`sector-player-world ${playerPlanet.isSelf ? "self" : ""}`}
              style={{ left: playerPlanet.x, top: playerPlanet.y }}
            >
              <span className="sector-player-tag">{playerPlanet.username}</span>
              <span className="sector-world">
                <span className="sector-world-sprite" style={getPlanetSpriteStyle(playerPlanet.worldType)} />
              </span>
            </div>
          ))}

          {sectorEntities.map((entity) => {
            const selected = selectedEntity?.id === entity.id;
            const targetable = actionMode !== "none" && entity.id !== "st_1";
            const visible = isVisible(entity);
            return (
              <button
                key={entity.id}
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  handleEntityClick(entity);
                }}
                className={`sector-entity ${targetable ? "targetable" : ""} ${visible ? "" : "muted"}`}
                style={{ left: entity.x, top: entity.y }}
              >
                {selected ? <span className="sector-select-ring" /> : null}
                {targetable ? <span className="sector-target-ring" /> : null}

                {entity.type === "station" ? (
                  <span className={`sector-core station-${entity.hue} ${entity.isPlayer ? "player" : ""}`}>
                    <Hexagon size={38} />
                  </span>
                ) : null}

                {entity.type === "world" ? (
                  <span className="sector-world">
                    <span className="sector-world-sprite" style={getPlanetSpriteStyle(entity.worldType)} />
                  </span>
                ) : null}

                {entity.type === "resource" ? (
                  <span className={`sector-resource ${resourceClass(entity.resourceType)}`}>
                    <Gem size={34} />
                  </span>
                ) : null}

                <span className="sector-label">
                  <strong>{sectorEntityDisplayName(entity, language)}</strong>
                  <small>[{entity.x}, {entity.y}]</small>
                </span>
              </button>
            );
          })}
          </div>
        </div>
      </section>

      <aside className={`sector-sidebar ${sidebarOpen ? "open" : "collapsed"}`}>
        <button
          type="button"
          className={`sector-sidebar-chevron ${sidebarOpen ? "open" : "collapsed"}`}
          onClick={() => setSidebarOpen((prev) => !prev)}
          aria-label={sidebarOpen ? l("Replier la barre laterale", "Collapse sidebar") : l("Ouvrir la barre laterale", "Open sidebar")}
          title={sidebarOpen ? l("Replier", "Collapse") : l("Ouvrir", "Open")}
        >
          <ChevronRight size={18} strokeWidth={2.5} />
          {!sidebarOpen && dailyAvailableCount > 0 ? (
            <span className="sector-sidebar-badge sector-sidebar-chevron-badge">{dailyAvailableCount > 99 ? "99+" : dailyAvailableCount}</span>
          ) : null}
        </button>

        {sidebarOpen ? (
          <>
            <div className="sector-sidebar-tabs">
              <button
                type="button"
                className={sidebarTab === "navigation" ? "active" : ""}
                onClick={() => setSidebarTab("navigation")}
              >
                <Navigation size={14} /> {l("Navigation", "Navigation")}
              </button>
              <button
                type="button"
                className={sidebarTab === "quests" ? "active" : ""}
                onClick={() => setSidebarTab("quests")}
              >
                <Rocket size={14} /> {l("Quete", "Quest")}
                {dailyAvailableCount > 0 ? (
                  <span className="sector-sidebar-badge">{dailyAvailableCount > 99 ? "99+" : dailyAvailableCount}</span>
                ) : null}
              </button>
            </div>

            {sidebarTab === "navigation" ? (
              <>
                <div className="sector-panel">
                  <button
                    type="button"
                    className={`sector-home-btn ${isMyPlanetOutOfView ? "alert" : ""}`}
                    onClick={centerOnMyPosition}
                  >
                    <MapPin size={14} /> {l("Ma position", "My position")}
                  </button>
                </div>

                <div className="sector-panel">
                  <h3><Filter size={15} /> {l("Filtres cartographiques", "Map filters")}</h3>
                  <label>
                    <input type="checkbox" checked={filters.enemies} onChange={(e) => setFilters((prev) => ({ ...prev, enemies: e.target.checked }))} />
                    {l("Stations rivales", "Rival stations")}
                  </label>
                  <label>
                    <input type="checkbox" checked={filters.resources} onChange={(e) => setFilters((prev) => ({ ...prev, resources: e.target.checked }))} />
                    {l("Champs de ressources", "Resource fields")}
                  </label>
                  <label>
                    <input type="checkbox" checked={filters.missions} onChange={(e) => setFilters((prev) => ({ ...prev, missions: e.target.checked }))} />
                    {l("Mondes de mission", "Mission worlds")}
                  </label>
                </div>

            <div className="sector-panel">
              <h3><Hourglass size={15} /> {l("Exploitation", "Harvesting")}</h3>
              {mapLoadError ? <p className="sector-map-error">{mapLoadError}</p> : null}
              {mapActionError ? <p className="sector-map-error">{mapActionError}</p> : null}
              {primaryMapExpedition && primaryExpeditionState ? (
                <div className="sector-map-expedition">
                  <div>
                    <span>{l("Statut", "Status")}</span>
                    <strong>
                      {primaryExpeditionState.status === "travel_to_field"
                        ? l("Trajet aller", "Traveling")
                        : primaryExpeditionState.status === "extracting"
                          ? l("Extraction", "Extracting")
                          : l("Retour", "Returning")}
                    </strong>
                  </div>
                  <div>
                    <span>{l("Fin estimee", "ETA")}</span>
                    <strong>
                      {new Date(primaryExpeditionState.endAt * 1000).toLocaleTimeString()}
                    </strong>
                  </div>
                  <div>
                    <span>{l("Vitesse de collecte", "Harvest speed")}</span>
                    <strong>{primaryMapExpedition.totalHarvestSpeed.toLocaleString()}</strong>
                  </div>
                  {primaryExpeditionState.status === "extracting" ? (
                    <div className="sector-map-live-gains">
                      <p>{l("Ressources cumulées", "Accumulated resources")}</p>
                      {mapLiveCollectedRows.length <= 0 ? (
                        <small>{l("Extraction en cours...", "Extraction in progress...")}</small>
                      ) : (
                        <>
                          {mapLiveCollectedRows.map((row) => (
                            <div key={`map_gain_${row.resourceId}`} className="sector-map-live-gain-row">
                              <span>{resourceDisplayName(row.resourceId, language)}</span>
                              <strong>+{row.amount.toLocaleString()}</strong>
                            </div>
                          ))}
                          {primaryLiveExtractionOverlay ? (
                            <>
                              <small className={`sector-field-live-capacity ${primaryLiveExtractionOverlay.cargoCapacity > 0 && primaryLiveExtractionOverlay.cargoUsed >= primaryLiveExtractionOverlay.cargoCapacity ? "full" : ""}`}>
                                {l("Soute", "Cargo")}: {primaryLiveExtractionOverlay.cargoUsed.toLocaleString()} / {primaryLiveExtractionOverlay.cargoCapacity.toLocaleString()}
                                {primaryLiveExtractionOverlay.cargoCapacity > 0 && primaryLiveExtractionOverlay.cargoUsed >= primaryLiveExtractionOverlay.cargoCapacity
                                  ? ` • ${l("Pleine", "Full")}`
                                  : ""}
                              </small>
                              {primaryLiveExtractionOverlay.cargoCapacity > 0 && primaryLiveExtractionOverlay.cargoUsed >= primaryLiveExtractionOverlay.cargoCapacity ? (
                                <small className="sector-field-live-capacity-note">
                                  {l("La flotte a atteint sa capacite cargo.", "The fleet has reached its cargo capacity.")}
                                </small>
                              ) : null}
                            </>
                          ) : null}
                        </>
                      )}
                    </div>
                  ) : null}
                  <button
                    type="button"
                    className="sector-save-marker"
                    onClick={() => void recallHarvestFleet(primaryMapExpedition.id)}
                    disabled={mapActionBusy || primaryExpeditionState.status === "returning"}
                  >
                    {mapActionBusy ? l("Action...", "Processing...") : l("Rappeler la flotte", "Recall fleet")}
                  </button>
                </div>
              ) : (
                <p className="sector-empty">{l("Aucune flotte en exploitation.", "No active harvesting fleet.")}</p>
              )}
              {mapReports.length > 0 ? (
                <div className="sector-map-reports">
                  {mapReports.slice(0, 2).map((row) => (
                    <article key={row.id}>
                      <strong>{l("Retour de flotte", "Fleet return")}</strong>
                      <small>{new Date(row.at * 1000).toLocaleString()}</small>
                    </article>
                  ))}
                </div>
              ) : null}
            </div>

            <div className="sector-panel">
              <h3><Navigation size={15} /> {l("Navigation", "Navigation")}</h3>
              <form onSubmit={onNavSubmit} className="sector-nav-form">
                <input type="number" placeholder="X" value={navX} onChange={(e) => setNavX(e.target.value)} />
                <input type="number" placeholder="Y" value={navY} onChange={(e) => setNavY(e.target.value)} />
                <button type="submit">GO</button>
              </form>
            </div>

            <div className="sector-panel grow">
              <div className="sector-markers-head">
                <h3><MapPin size={15} /> {l("Balises", "Bookmarks")}</h3>
                <span>{markers.length}/5</span>
              </div>
              <button type="button" className="sector-save-marker" onClick={addMarker} disabled={markers.length >= 5}>
                <Plus size={14} /> {l("Sauver la vue courante", "Save current view")}
              </button>

              <div className="sector-marker-list">
                {markers.length === 0 ? <p className="sector-empty">{l("Aucune balise enregistree.", "No bookmark saved.")}</p> : null}
                {markers.map((marker, idx) => (
                  <div key={`${marker.name}_${idx}`} className="sector-marker-item">
                    <button type="button" onClick={() => navigateTo(marker.x, marker.y)}>
                      <strong>{marker.name}</strong>
                      <small>[{marker.x}, {marker.y}]</small>
                    </button>
                    <button type="button" className="danger" onClick={() => removeMarker(idx)}><X size={15} /></button>
                  </div>
                ))}
              </div>
            </div>
              </>
            ) : (
              <div className="sector-panel grow quest-panel">
                <details className="quest-spoiler">
                  <summary>
                    <span className="quest-spoiler-title"><Rocket size={15} /> {l("Quetes quotidiennes", "Daily quests")}</span>
                    {dailyAvailableCount > 0 ? (
                      <span className="quest-badge">{dailyAvailableCount > 99 ? "99+" : dailyAvailableCount}</span>
                    ) : null}
                  </summary>
                  <p className="quest-reset">{dailyHarvestQuestResetLabel}</p>
                  <div className="quest-list">
                    {dailyQuestCards.map((quest) => (
                      <article key={quest.id} className="quest-card">
                        <header>
                          <strong>{l(quest.titleFr, quest.titleEn)}</strong>
                          <span>{l(quest.rewardFr, quest.rewardEn)}</span>
                        </header>
                        <p>{l(quest.descriptionFr, quest.descriptionEn)}</p>
                        <div className="quest-progress">
                          <div style={{ width: `${quest.ratio}%` }} />
                        </div>
                        <div className="quest-foot">
                          <small>{quest.progressLabel}</small>
                          <button
                            type="button"
                            className={quest.complete && !quest.claimed ? "ready" : ""}
                            disabled={!quest.complete || quest.claimed}
                            onClick={() => claimDailyQuest(quest.id)}
                          >
                            {quest.claimed
                              ? l("Recupere", "Claimed")
                              : quest.complete
                                ? l(quest.rewardFr, quest.rewardEn)
                                : l("En cours", "In progress")}
                          </button>
                        </div>
                      </article>
                    ))}
                  </div>
                </details>
              </div>
            )}

            <div className="sector-panel details">
              {selectedEntity ? (
                <>
                  <div className="sector-detail-head">
                    <div>
                      <h4>{sectorEntityDisplayName(selectedEntity, language)}</h4>
                      <p>
                        {entityTypeLabel(selectedEntity.type)}
                        {selectedEntity.type === "station"
                          ? ` • ${l("Proprietaire", "Owner")}: ${sectorStationOwnerDisplay(selectedEntity, language)}`
                          : ""}
                      </p>
                    </div>
                    <button type="button" onClick={() => { setSelectedEntity(null); setActionMode("none"); }}><X size={18} /></button>
                  </div>

              {selectedEntity.type === "station" ? (
                <div className="sector-detail-list">
                  <div><span><Swords size={14} /> {l("Puissance", "Power")}</span><strong>{selectedEntity.power}</strong></div>
                  <div><span><Shield size={14} /> {l("Defense", "Defense")}</span><strong>{selectedEntity.defense}</strong></div>

                  {selectedEntity.isPlayer ? (
                    <div className="sector-actions">
                      <p>{l("Selectionnez une action puis une cible", "Select an action, then a target")}</p>
                      <div>
                        <button type="button" className={actionMode === "attack" ? "active attack" : ""} onClick={() => setActionMode("attack")}><Crosshair size={14} /> {l("Attaque", "Attack")}</button>
                        <button type="button" className={actionMode === "mine" ? "active mine" : ""} onClick={() => setActionMode("mine")}><Gem size={14} /> {l("Collecte", "Gather")}</button>
                        <button type="button" className={actionMode === "mission" ? "active mission" : ""} onClick={() => setActionMode("mission")}><Rocket size={14} /> {l("Mission", "Mission")}</button>
                      </div>
                    </div>
                  ) : (
                    <button type="button" className="sector-war-btn"><Crosshair size={14} /> {l("Declarer l'hostilite", "Declare hostility")}</button>
                  )}
                </div>
              ) : null}

              {selectedEntity.type === "world" ? (
                <div className="sector-detail-list">
                  <p className="sector-list-title">{l("Missions disponibles", "Available missions")}</p>
                  <ul>
                    {sectorWorldMissionsDisplay(selectedEntity, language).map((m) => <li key={m}>{m}</li>)}
                  </ul>
                </div>
              ) : null}

              {selectedEntity.type === "resource" ? (
                <div className="sector-detail-list">
                  <div><span>{l("Type", "Type")}</span><strong>{resourceTypeLabel(selectedEntity.resourceType)}</strong></div>
                  <div><span>{l("Occupation", "Occupation")}</span><strong>{selectedEntity.isOccupied ? l("Occupe", "Occupied") : l("Libre", "Free")}</strong></div>
                  {selectedEntity.isOccupied && selectedEntity.occupiedByUsername ? (
                    <div><span>{l("Exploitant", "Operator")}</span><strong>{selectedEntity.occupiedByUsername}</strong></div>
                  ) : null}
                  {selectedEntity.hiddenDetails ? (
                    <p className="sector-empty">
                      {l(
                        "Contenu masque: ce champ est exploite par une flotte rivale.",
                        "Hidden content: this field is being harvested by a rival fleet."
                      )}
                    </p>
                  ) : (
                    <>
                      <div><span>{l("Rareté", "Rarity")}</span><strong>{mapFieldRarityDisplay(selectedEntity.rarityTier, language)}</strong></div>
                      <div><span>{l("Qualité", "Quality")}</span><strong>{mapFieldQualityDisplay(selectedEntity.qualityTier, language)}</strong></div>
                      <div><span>{l("Rendement restant", "Remaining yield")}</span><strong>{Math.max(0, Math.floor(Number(selectedEntity.amount ?? 0))).toLocaleString()}</strong></div>
                      {(selectedEntity.resources ?? []).map((row) => (
                        <div key={`rf_res_${selectedEntity.id}_${row.resourceId}`}>
                          <span>{resourceDisplayName(row.resourceId, language)}</span>
                          <strong>{Math.floor(row.remainingAmount).toLocaleString()} / {Math.floor(row.totalAmount).toLocaleString()}</strong>
                        </div>
                      ))}
                      <div>
                        <span>{l("Travail restant", "Remaining work")}</span>
                        <strong>{Math.floor(Number(selectedEntity.remainingExtractionWork ?? 0)).toLocaleString()}</strong>
                      </div>
                      {selectedFieldPlan ? (
                        <>
                          <div><span>{l("Trajet estime", "Estimated travel")}</span><strong>{Math.floor(selectedFieldPlan.travelSeconds / 60)}m {selectedFieldPlan.travelSeconds % 60}s</strong></div>
                          <div><span>{l("Extraction estimee", "Estimated extraction")}</span><strong>{Math.floor(selectedFieldPlan.extractionSeconds / 60)}m</strong></div>
                          <div><span>{l("Capacite cargo", "Cargo capacity")}</span><strong>{selectedFieldPlan.totalCapacity.toLocaleString()}</strong></div>
                        </>
                      ) : null}
                      {selectedEntity.fieldId && !selectedEntity.isOccupied ? (
                        <div className="sector-field-actions">
                          <div className="sector-field-actions-head">
                            <p>{l("Flotte de collecte", "Harvest fleet")}</p>
                            <span className="sector-field-slot-pill">
                              {l("Slots", "Slots")} {mapActiveBlockingExpeditions}/{mapMaxActiveExpeditions}
                            </span>
                          </div>
                          <div className="sector-field-grid">
                            {["argo", "pegase", "arche_spatiale"].map((unitId) => {
                              const available = Math.max(0, Math.floor(Number(harvestAvailability[unitId] ?? 0)));
                              const raw = fleetDraft[unitId] ?? "0";
                              return (
                                <label key={`fleet_${unitId}`} className="sector-field-unit-row">
                                  <span className="sector-field-unit-meta">
                                    <strong>{hangarUnitDisplayName(unitId, unitId, language)}</strong>
                                    <em>{l("Disponibles", "Available")}: {available}</em>
                                  </span>
                                  <input
                                    type="number"
                                    min={0}
                                    max={available}
                                    value={raw}
                                    onChange={(e) => {
                                      const next = Math.max(0, Math.min(available, Math.floor(Number(e.target.value || 0))));
                                      setFleetDraft((prev) => ({ ...prev, [unitId]: String(next) }));
                                    }}
                                  />
                                </label>
                              );
                            })}
                          </div>
                          <button
                            type="button"
                            className="sector-war-btn"
                            onClick={() => void launchHarvestOnField(selectedEntity.fieldId!)}
                            disabled={
                              mapActionBusy ||
                              !canLaunchAnotherMapExpedition ||
                              !hasValidHarvestFleetSelection
                            }
                          >
                            {mapActionBusy
                              ? l("Lancement...", "Launching...")
                              : !canLaunchAnotherMapExpedition
                                ? l("Slots max atteints", "Slots full")
                                : l("Lancer l'exploitation", "Start harvesting")}
                          </button>
                          {!canLaunchAnotherMapExpedition ? (
                            <p className="sector-empty">
                              {l(
                                "Nombre maximal de flottes actives atteint. Attendez un retour ou augmentez Commandement d'Escadre.",
                                "Maximum active fleet slots reached. Wait for a fleet return or increase Squadron Command."
                              )}
                            </p>
                          ) : null}
                        </div>
                      ) : null}
                      {selectedEntity.fieldId && selectedEntity.isOccupied ? (
                        <p className="sector-empty">
                          {l(
                            "Ce champ est deja occupe. Choisissez un champ libre.",
                            "This field is already occupied. Choose a free field."
                          )}
                        </p>
                      ) : null}
                    </>
                  )}
                </div>
              ) : null}
                </>
              ) : (
                <p className="sector-empty details-empty">{l("Selectionnez une entite pour afficher ses details tactiques.", "Select an entity to display tactical details.")}</p>
              )}
            </div>
          </>
        ) : null}
      </aside>

      {fieldPopupEntity ? (
        <div className="sector-field-modal-backdrop" onClick={() => setFieldPopupId(null)}>
          <div className="sector-field-modal" onClick={(e) => e.stopPropagation()}>
            <div className="sector-detail-head">
              <div>
                <h4>{sectorEntityDisplayName(fieldPopupEntity, language)}</h4>
                <p>
                  {l("Champ de ressources", "Resource field")} • [{fieldPopupEntity.x}, {fieldPopupEntity.y}]
                </p>
              </div>
              <button type="button" onClick={() => setFieldPopupId(null)}><X size={18} /></button>
            </div>

            {mapActionError ? <p className="sector-map-error">{mapActionError}</p> : null}

            <div className="sector-detail-list">
              <div><span>{l("Type", "Type")}</span><strong>{resourceTypeLabel(fieldPopupEntity.resourceType)}</strong></div>
              <div><span>{l("Occupation", "Occupation")}</span><strong>{fieldPopupEntity.isOccupied ? l("Occupe", "Occupied") : l("Libre", "Free")}</strong></div>
              {fieldPopupEntity.isOccupied && fieldPopupEntity.occupiedByUsername ? (
                <div><span>{l("Exploitant", "Operator")}</span><strong>{fieldPopupEntity.occupiedByUsername}</strong></div>
              ) : null}
              {fieldPopupEntity.hiddenDetails ? (
                <p className="sector-empty">
                  {l(
                    "Contenu masque: ce champ est exploite par une flotte rivale.",
                    "Hidden content: this field is being harvested by a rival fleet."
                  )}
                </p>
              ) : (
                <>
                  <div><span>{l("Rareté", "Rarity")}</span><strong>{mapFieldRarityDisplay(fieldPopupEntity.rarityTier, language)}</strong></div>
                  <div><span>{l("Qualité", "Quality")}</span><strong>{mapFieldQualityDisplay(fieldPopupEntity.qualityTier, language)}</strong></div>
                  <div><span>{l("Rendement restant", "Remaining yield")}</span><strong>{Math.max(0, Math.floor(Number(fieldPopupEntity.amount ?? 0))).toLocaleString()}</strong></div>
                  {(fieldPopupEntity.resources ?? []).map((row) => (
                    <div key={`rf_modal_res_${fieldPopupEntity.id}_${row.resourceId}`}>
                      <span>{resourceDisplayName(row.resourceId, language)}</span>
                      <strong>{Math.floor(row.remainingAmount).toLocaleString()} / {Math.floor(row.totalAmount).toLocaleString()}</strong>
                    </div>
                  ))}
                  <div>
                    <span>{l("Travail restant", "Remaining work")}</span>
                    <strong>{Math.floor(Number(fieldPopupEntity.remainingExtractionWork ?? 0)).toLocaleString()}</strong>
                  </div>
                  {selectedFieldPlan ? (
                    <>
                      <div><span>{l("Trajet estime", "Estimated travel")}</span><strong>{Math.floor(selectedFieldPlan.travelSeconds / 60)}m {selectedFieldPlan.travelSeconds % 60}s</strong></div>
                      <div><span>{l("Extraction estimee", "Estimated extraction")}</span><strong>{Math.floor(selectedFieldPlan.extractionSeconds / 60)}m</strong></div>
                      <div><span>{l("Capacite cargo", "Cargo capacity")}</span><strong>{selectedFieldPlan.totalCapacity.toLocaleString()}</strong></div>
                    </>
                  ) : null}
                  {fieldPopupEntity.fieldId && !fieldPopupEntity.isOccupied ? (
                    <div className="sector-field-actions">
                      <div className="sector-field-actions-head">
                        <p>{l("Flotte de collecte", "Harvest fleet")}</p>
                        <span className="sector-field-slot-pill">
                          {l("Slots", "Slots")} {mapActiveBlockingExpeditions}/{mapMaxActiveExpeditions}
                        </span>
                      </div>
                      <div className="sector-field-grid">
                        {["argo", "pegase", "arche_spatiale"].map((unitId) => {
                          const available = Math.max(0, Math.floor(Number(harvestAvailability[unitId] ?? 0)));
                          const raw = fleetDraft[unitId] ?? "0";
                          return (
                            <label key={`fleet_modal_${unitId}`} className="sector-field-unit-row">
                              <span className="sector-field-unit-meta">
                                <strong>{hangarUnitDisplayName(unitId, unitId, language)}</strong>
                                <em>{l("Disponibles", "Available")}: {available}</em>
                              </span>
                              <input
                                type="number"
                                min={0}
                                max={available}
                                value={raw}
                                onChange={(e) => {
                                  const next = Math.max(0, Math.min(available, Math.floor(Number(e.target.value || 0))));
                                  setFleetDraft((prev) => ({ ...prev, [unitId]: String(next) }));
                                }}
                              />
                            </label>
                          );
                        })}
                      </div>
                      <button
                        type="button"
                        className="sector-war-btn"
                        onClick={() => void launchHarvestOnField(fieldPopupEntity.fieldId!)}
                        disabled={
                          mapActionBusy ||
                          !canLaunchAnotherMapExpedition ||
                          !hasValidHarvestFleetSelection
                        }
                      >
                        {mapActionBusy
                          ? l("Lancement...", "Launching...")
                          : !canLaunchAnotherMapExpedition
                            ? l("Slots max atteints", "Slots full")
                            : l("Lancer l'exploitation", "Start harvesting")}
                      </button>
                      {!canLaunchAnotherMapExpedition ? (
                        <p className="sector-empty">
                          {l(
                            "Nombre maximal de flottes actives atteint. Attendez un retour ou augmentez Commandement d'Escadre.",
                            "Maximum active fleet slots reached. Wait for a fleet return or increase Squadron Command."
                          )}
                        </p>
                      ) : null}
                    </div>
                  ) : null}
                  {fieldPopupEntity.fieldId && fieldPopupEntity.isOccupied ? (
                    <p className="sector-empty">
                      {l(
                        "Ce champ est deja occupe. Choisissez un champ libre.",
                        "This field is already occupied. Choose a free field."
                      )}
                    </p>
                  ) : null}
                </>
              )}
            </div>
          </div>
        </div>
      ) : null}
    </main>
  );
}

function HangarScreen({
  language,
  resourceAmounts,
  serverResourceAmounts,
  technologyLevels,
  inventoryItems,
  inventoryLoading,
  inventoryActionLoadingId,
  queue,
  inventory,
  nowMs,
  loading,
  actionBusy,
  error,
  serverResourcesReady,
  onQueue,
  onCancelQueueItem,
  onUseBoost
}: {
  language: UILanguage;
  resourceAmounts: Record<string, number>;
  serverResourceAmounts: Record<string, number> | null;
  technologyLevels: Record<TechnologyId, number>;
  inventoryItems: InventoryViewItem[];
  inventoryLoading: boolean;
  inventoryActionLoadingId: string;
  queue: HangarQueueItem[];
  inventory: Record<string, number>;
  nowMs: number;
  loading: boolean;
  actionBusy: boolean;
  error: string;
  serverResourcesReady: boolean;
  onQueue: (unitId: string, quantity: number) => void | Promise<void>;
  onCancelQueueItem: (queueId: string) => void | Promise<void>;
  onUseBoost: (itemId: string, quantity?: number, targetOverride?: "auto" | "building" | "hangar" | "research_local", queueId?: string) => void;
}) {
  const l = (fr: string, en: string) => (language === "en" ? en : fr);
  const unitName = (def: HangarUnitDef) => hangarUnitDisplayName(def.id, def.name, language);
  const unitDescription = (def: HangarUnitDef) => hangarUnitDisplayDescription(def.id, def.description, language);
  const [tab, setTab] = useState<HangarCategory>("ship");
  const [quantityByUnit, setQuantityByUnit] = useState<Record<string, string>>({});
  const [boostItemId, setBoostItemId] = useState("");
  const [boostQuantityInput, setBoostQuantityInput] = useState("1");
  const resourceNameById = useMemo(
    () =>
      RESOURCE_DEFS.reduce(
        (acc, def) => {
          acc[def.id] = resourceDisplayName(def.id, language);
          return acc;
        },
        {} as Record<string, string>
      ),
    [language]
  );

  const defs = useMemo(
    () => HANGAR_UNIT_DEFS.filter((unit) => unit.category === tab),
    [tab]
  );
  const queueWithDefs = useMemo(
    () =>
      queue
        .map((item) => ({ item, def: HANGAR_UNIT_DEFS.find((unit) => unit.id === item.unitId) }))
        .filter((entry): entry is { item: HangarQueueItem; def: HangarUnitDef } => Boolean(entry.def)),
    [queue]
  );

  const builtUnitRows = useMemo(
    () =>
      Object.keys(inventory)
        .map((id) => {
          const def = HANGAR_UNIT_DEFS.find((unit) => unit.id === id);
          const qty = Math.max(0, Math.floor(Number(inventory[id] ?? 0)));
          return def && qty > 0 ? { def, qty } : null;
        })
        .filter((entry): entry is { def: HangarUnitDef; qty: number } => Boolean(entry)),
    [inventory]
  );
  const builtShips = useMemo(
    () =>
      builtUnitRows
        .filter((row) => row.def.category === "ship")
        .sort((a, b) => {
          if (b.def.force !== a.def.force) return b.def.force - a.def.force;
          if (b.def.endurance !== a.def.endurance) return b.def.endurance - a.def.endurance;
          return unitName(a.def).localeCompare(unitName(b.def));
        }),
    [builtUnitRows, language]
  );
  const builtDefenses = useMemo(
    () =>
      builtUnitRows
        .filter((row) => row.def.category === "defense")
        .sort((a, b) => {
          if (b.def.force !== a.def.force) return b.def.force - a.def.force;
          if (b.def.endurance !== a.def.endurance) return b.def.endurance - a.def.endurance;
          return unitName(a.def).localeCompare(unitName(b.def));
        }),
    [builtUnitRows, language]
  );
  const boostItems = useMemo(
    () =>
      inventoryItems
        .filter((item) => item.category === "TIME_BOOST" && (item.durationSeconds ?? 0) > 0 && item.quantity > 0)
        .sort((a, b) => (a.durationSeconds ?? 0) - (b.durationSeconds ?? 0)),
    [inventoryItems]
  );
  const activeQueueItem = queueWithDefs.length > 0 ? queueWithDefs[0].item : null;
  const selectedBoost = boostItems.find((item) => item.id === boostItemId) ?? (boostItems.length > 0 ? boostItems[0] : null);
  const requestedBoostQuantity = Math.max(1, Math.floor(Number(boostQuantityInput) || 1));
  const effectiveBoostQuantity = selectedBoost ? Math.min(requestedBoostQuantity, selectedBoost.quantity) : 0;
  const boostLoading = Boolean(selectedBoost) && inventoryActionLoadingId === selectedBoost.id;
  const canUseBoost = Boolean(activeQueueItem) && Boolean(selectedBoost) && effectiveBoostQuantity > 0 && !boostLoading && !inventoryLoading;
  useEffect(() => {
    if (boostItems.length === 0) {
      setBoostItemId("");
      return;
    }
    if (!boostItemId || !boostItems.some((item) => item.id === boostItemId)) {
      setBoostItemId(boostItems[0].id);
    }
  }, [boostItemId, boostItems]);

  return (
    <main className="hangar-shell">
      <section className="hangar-catalog">
        <header className="hangar-head">
          <h2>{l("Hangar Strategique", "Strategic Hangar")}</h2>
          <p>{l("Concevez vos flottes et defenses. Les statistiques detaillees s'affichent au clic.", "Design fleets and defenses. Detailed stats appear on click.")}</p>
          <div className="hangar-tabs">
            <button type="button" className={tab === "ship" ? "active" : ""} onClick={() => setTab("ship")}>
              <Rocket size={14} /> {l("Vaisseaux", "Ships")}
            </button>
            <button type="button" className={tab === "defense" ? "active" : ""} onClick={() => setTab("defense")}>
              <Shield size={14} /> {l("Defenses", "Defenses")}
            </button>
          </div>
        </header>
        {loading ? <p className="hangar-status-line">{l("Synchronisation Hangar...", "Syncing Hangar...")}</p> : null}
        {!loading && !serverResourcesReady ? (
          <p className="hangar-status-line">{l("Ressources serveur Hangar en attente...", "Hangar server resources pending...")}</p>
        ) : null}
        {error ? <p className="hangar-error-line">{error}</p> : null}

        <div className="hangar-grid">
          {defs.map((def) => {
            const qty = Math.max(1, Math.floor(Number(quantityByUnit[def.id] ?? 1) || 1));
            const authoritativeResources = serverResourceAmounts ?? resourceAmounts;
            const maxBuildable = maxCraftableFromResources(authoritativeResources, def.cost);
            const batchCost = scaleCost(def.cost, qty);
            const affordable = canAffordCost(authoritativeResources, batchCost);
            const unlocked = isHangarUnitUnlocked(def.id, technologyLevels);
            const costRows = (RESOURCE_DEFS.map((res) => res.id).filter(
              (resourceId) => Number(batchCost[resourceId as ResourceId] ?? 0) > 0
            ) as ResourceId[]).map((resourceId) => {
              const required = Math.ceil(Number(batchCost[resourceId] ?? 0));
              const available = Math.floor(Number(authoritativeResources[resourceId] ?? 0));
              return {
                id: resourceId,
                required,
                enough: available >= required,
                name: resourceNameById[resourceId] ?? resourceId
              };
            });
            const unlockHint =
              def.id === "projecteur_photonique"
                ? l("Requis: Amplification Photonique niv. 1", "Requires: Photonic Amplification lv. 1")
                : def.id === "lanceur_orbitral"
                  ? l("Requis: Balistique Orbitale niv. 1", "Requires: Orbital Ballistics lv. 1")
                  : def.id === "lame_de_plasma"
                ? l("Requis: Stabilisation Plasma niv. 1", "Requires: Plasma Stabilization lv. 1")
                : def.id === "champ_aegis"
                  ? l("Requis: Generateur Aegis niv. 1", "Requires: Aegis Generator lv. 1")
                  : def.id === "tourelle_rafale"
                    ? l("Requis: Architecture Defensive niv. 1", "Requires: Defensive Architecture lv. 1")
                    : def.id === "batterie_eclat"
                      ? l("Requis: Architecture Defensive niv. 2", "Requires: Defensive Architecture lv. 2")
                      : def.id === "canon_ion_aiguillon"
                        ? l("Requis: Amplification Photonique niv. 2", "Requires: Photonic Amplification lv. 2")
                        : def.id === "mine_orbitale_veille"
                          ? l("Requis: Balistique Orbitale niv. 2", "Requires: Orbital Ballistics lv. 2")
                          : def.id === "canon_rail_longue_vue"
                            ? l("Requis: Balistique Orbitale niv. 4", "Requires: Orbital Ballistics lv. 4")
                            : def.id === "projecteur_emp_silence"
                              ? l(
                                  "Requis: Controle Electromagnetique niv. 1 + Moteurs Flux Neodyme niv. 3",
                                  "Requires: Electromagnetic Control lv. 1 + Neodymium Flux Engines lv. 3"
                                )
                              : def.id === "mur_photonique_prisme"
                                ? l("Requis: Generateur Aegis niv. 3", "Requires: Aegis Generator lv. 3")
                                : def.id === "lance_gravitationnel_ancre"
                                  ? l(
                                      "Requis: Generateur Aegis niv. 6 + Physique Quantique Appliquee niv. 3",
                                      "Requires: Aegis Generator lv. 6 + Applied Quantum Physics lv. 3"
                                    )
                  : def.id === "eclaireur_stellaire" || def.id === "foudroyant"
                    ? l("Requis: Doctrine d'Escarmouche niv. 1", "Requires: Skirmish Doctrine lv. 1")
                    : def.id === "aurore" || def.id === "spectre"
                      ? l("Requis: Doctrine d'Interception niv. 1", "Requires: Interception Doctrine lv. 1")
                      : def.id === "tempest" || def.id === "titanide"
                        ? l("Requis: Doctrine de Domination niv. 1", "Requires: Domination Doctrine lv. 1")
                        : def.id === "colosse" || def.id === "arche_spatiale"
                          ? l("Requis: Architecture Capitale niv. 1", "Requires: Capital Architecture lv. 1")
                          : "";
            const produced = inventory[def.id] ?? 0;
            const unitImagePath = def.category === "ship" ? HANGAR_SHIP_IMAGE_MAP[def.id] : HANGAR_DEFENSE_IMAGE_MAP[def.id];
            return (
              <article key={def.id} className="hangar-card">
                <div className="hangar-card-head">
                  <strong>{unitName(def)}</strong>
                  <span>{def.category === "ship" ? l("Vaisseau", "Ship") : l("Defense", "Defense")}</span>
                </div>
                {!unlocked ? <p className="hangar-sync-note">{unlockHint}</p> : null}
                <div className="hangar-visual">
                  <img
                    src={unitImagePath || "/room-images/vaisseau.png"}
                    alt={unitName(def)}
                    className="hangar-ship-image"
                    onError={(e) => {
                      const img = e.currentTarget as HTMLImageElement;
                      if (!img.src.endsWith("/room-images/vaisseau.png")) {
                        img.src = "/room-images/vaisseau.png";
                      }
                    }}
                  />
                </div>
                <div className="hangar-card-availability">
                  <span>{l("Disponibles", "Owned")}: <b>{Math.floor(produced).toLocaleString()}</b></span>
                  <span>{l("Fabricable", "Buildable")}: <b>{maxBuildable.toLocaleString()}</b></span>
                </div>
                <p>{unitDescription(def)}</p>
                <div className="hangar-card-foot">
                  <small className="hangar-cost-title">{l("Cout", "Cost")}</small>
                  <div className="hangar-cost-list">
                    {costRows.map((row) => (
                      <span key={`${def.id}_${row.id}`} className={`hangar-cost-item ${row.enough ? "enough" : "missing"}`}>
                        <span className="top-resource-icon hangar-cost-icon" style={getResourceMenuSpriteStyle(row.id)} />
                        <span className="hangar-cost-value">
                          {row.required.toLocaleString()} {row.name}
                        </span>
                      </span>
                    ))}
                  </div>
                  <small className="hangar-time-badge"><Hourglass size={13} /> {l("Temps", "Build time")}: {formatDuration(def.buildSeconds * qty)}</small>
                </div>
                <details className="hangar-spoiler">
                  <summary>{l("Details du vaisseau", "Ship details")}</summary>
                  <div className="hangar-details-grid compact">
                    <div><small>{l("Force", "Force")}</small><b>{def.force}</b></div>
                    <div><small>{l("Endurance", "Endurance")}</small><b>{def.endurance}</b></div>
                    {def.category === "ship" ? (
                      <>
                        <div><small>{l("Vitesse", "Speed")}</small><b>{def.speed ?? 0}</b></div>
                        <div><small>{l("Capacite", "Capacity")}</small><b>{def.capacity ?? 0}</b></div>
                        <div><small>{l("Energie Q/h", "Quantum/h")}</small><b>{def.quantumPerHour ?? 0}</b></div>
                      </>
                    ) : (
                      <>
                        <div><small>{l("Portee", "Range")}</small><b>{def.range ?? 0}</b></div>
                        <div><small>{l("Recharge", "Reload")}</small><b>{def.reload ?? "-"}</b></div>
                      </>
                    )}
                  </div>
                </details>
                <div className="hangar-build-row">
                  <label>
                    {l("Quantite", "Quantity")}
                    <input
                      type="number"
                      min={1}
                      max={Math.max(1, maxBuildable)}
                      value={quantityByUnit[def.id] ?? "1"}
                      onChange={(e) => setQuantityByUnit((prev) => ({ ...prev, [def.id]: e.target.value }))}
                    />
                  </label>
                  <button
                    type="button"
                    disabled={!unlocked || !affordable || actionBusy || maxBuildable <= 0 || loading || !serverResourcesReady}
                    onClick={(e) => {
                      e.stopPropagation();
                      void onQueue(def.id, qty);
                    }}
                  >
                    {!unlocked
                      ? l("Prerequis manquants", "Missing requirements")
                      : actionBusy
                        ? l("Transmission...", "Transmitting...")
                        : l("Lancer", "Build")}
                  </button>
                </div>
              </article>
            );
          })}
        </div>
      </section>

      <aside className="hangar-queue">
        <div className="hangar-queue-panel">
          <h3>{l("File de production", "Production queue")}</h3>
          {queueWithDefs.length === 0 ? (
            <p className="hangar-empty">{l("Aucune fabrication en cours.", "No production in progress.")}</p>
          ) : (
            <div className="hangar-queue-list">
              {queueWithDefs.map(({ item, def }, index) => {
                const duration = Math.max(1, item.endAt - item.startAt);
                const elapsed = Math.max(0, Math.min(duration, nowMs - item.startAt));
                const ratio = Math.round((elapsed / duration) * 100);
                const remaining = Math.max(0, Math.floor((item.endAt - nowMs) / 1000));
                const waiting = nowMs < item.startAt;
                return (
                  <article key={item.id} className={`hangar-queue-item ${index === 0 ? "active" : ""}`}>
                    <header>
                      <strong>{unitName(def)}</strong>
                      <span className="hangar-queue-head-right">
                        <b>x{item.quantity}</b>
                        {index === 0 ? (
                          <button
                            type="button"
                            className="hangar-cancel-btn"
                            disabled={actionBusy}
                            onClick={() => void onCancelQueueItem(item.id)}
                            title={l("Annuler et rembourser", "Cancel and refund")}
                          >
                            <X size={13} />
                          </button>
                        ) : null}
                      </span>
                    </header>
                    <div className="hangar-queue-progress">
                      <div style={{ width: `${waiting ? 0 : ratio}%` }} />
                    </div>
                    <footer>
                      <small className="hangar-time-remaining">
                        {waiting ? l("En attente", "Queued") : l("Temps restant", "Time left")}: {formatDuration(remaining)}
                      </small>
                      <small>{formatCostLabel(item.batchCost, language)}</small>
                    </footer>
                  </article>
                );
              })}
            </div>
          )}
          {activeQueueItem ? (
            <div className="hangar-boost-panel">
              <strong>{l("Acceleration", "Acceleration")}</strong>
              {boostItems.length === 0 ? (
                <p>{l("Aucun accelerateur disponible.", "No accelerator available.")}</p>
              ) : (
                <div className="hangar-boost-row">
                  <select
                    value={selectedBoost?.id ?? ""}
                    onChange={(e) => {
                      setBoostItemId(e.target.value);
                      setBoostQuantityInput("1");
                    }}
                  >
                    {boostItems.map((item) => (
                      <option key={item.id} value={item.id}>
                        {formatBoostDurationLabel(item.durationSeconds ?? 0)} (x{item.quantity})
                      </option>
                    ))}
                  </select>
                  <input
                    type="number"
                    min={1}
                    max={selectedBoost?.quantity ?? 1}
                    value={boostQuantityInput}
                    onChange={(e) => setBoostQuantityInput(e.target.value)}
                  />
                  <button
                    type="button"
                    disabled={!canUseBoost}
                    onClick={() =>
                      selectedBoost
                        ? onUseBoost(selectedBoost.id, effectiveBoostQuantity, "hangar", activeQueueItem.id)
                        : undefined
                    }
                  >
                    {boostLoading ? l("Application...", "Applying...") : l("Utiliser", "Use")}
                  </button>
                </div>
              )}
            </div>
          ) : null}
        </div>

        <div className="hangar-queue-panel">
          <h3>{l("Stock militaire", "Military stock")}</h3>
          {builtShips.length === 0 ? (
            <p className="hangar-empty">{l("Aucune unite produite.", "No units produced yet.")}</p>
          ) : (
            <div className="hangar-stock-list">
              {builtShips.map(({ def, qty }) => (
                <div key={`stock_${def.id}`} className="hangar-stock-item">
                  <span>{unitName(def)}</span>
                  <strong>{qty.toLocaleString()}</strong>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="hangar-queue-panel">
          <h3>{l("Defenses", "Defenses")}</h3>
          {builtDefenses.length === 0 ? (
            <p className="hangar-empty">{l("Aucune defense produite.", "No defenses produced yet.")}</p>
          ) : (
            <div className="hangar-stock-list">
              {builtDefenses.map(({ def, qty }) => (
                <div key={`stock_${def.id}`} className="hangar-stock-item">
                  <span>{unitName(def)}</span>
                  <strong>{qty.toLocaleString()}</strong>
                </div>
              ))}
            </div>
          )}
        </div>
      </aside>
    </main>
  );
}

function AllianceScreenV2({
  language,
  playerId,
  nowMs,
  client,
  session,
  onRankingRefresh,
  onUnauthorized
}: {
  language: UILanguage;
  playerId: string;
  nowMs: number;
  client: Client;
  session: Session | null;
  onRankingRefresh: () => void;
  onUnauthorized: () => void;
}) {
  const l = (fr: string, en: string) => (language === "en" ? en : fr);

  const normalizeRole = (raw: any): "LEADER" | "OFFICER" | "MEMBER" => {
    const role = String(raw || "").toUpperCase();
    if (role === "LEADER" || role === "CHEF") return "LEADER";
    if (role === "OFFICER" || role === "CO_LEAD") return "OFFICER";
    return "MEMBER";
  };

  const roleLabel = (role: "LEADER" | "OFFICER" | "MEMBER") =>
    role === "LEADER" ? l("Chef", "Leader") : role === "OFFICER" ? l("Sous-chef", "Officer") : l("Membre", "Member");

  const [tab, setTab] = useState<"mine" | "search">("mine");
  const [loadingMine, setLoadingMine] = useState(false);
  const [mineError, setMineError] = useState("");
  const [actionError, setActionError] = useState("");
  const [actionSuccess, setActionSuccess] = useState("");
  const [actionBusy, setActionBusy] = useState("");

  const [createBusy, setCreateBusy] = useState(false);
  const [allianceData, setAllianceData] = useState<any | null>(null);
  const [inAlliance, setInAlliance] = useState(false);
  const [myRole, setMyRole] = useState<"LEADER" | "OFFICER" | "MEMBER">("MEMBER");

  const [createName, setCreateName] = useState("");
  const [createTag, setCreateTag] = useState("");
  const [createDescription, setCreateDescription] = useState("");
  const [createLogoUrl, setCreateLogoUrl] = useState("");

  const [editDescription, setEditDescription] = useState("");
  const [editLogoUrl, setEditLogoUrl] = useState("");
  const [editRecruiting, setEditRecruiting] = useState(true);

  const [searchQuery, setSearchQuery] = useState("");
  const [searchBusy, setSearchBusy] = useState(false);
  const [searchError, setSearchError] = useState("");
  const [searchItems, setSearchItems] = useState<any[]>([]);
  const [incomingInvites, setIncomingInvites] = useState<any[]>([]);
  const [pendingApplication, setPendingApplication] = useState<any | null>(null);
  const [inviteTargetUserId, setInviteTargetUserId] = useState("");
  const [applyMessage, setApplyMessage] = useState("");
  const [confirmModal, setConfirmModal] = useState<{
    title: string;
    message: string;
    onConfirm: () => void;
  } | null>(null);

  const parseRpcPayload = (rpcResponse: any) => {
    const parsed = parseJsonObject((rpcResponse as any)?.payload ?? rpcResponse);
    const nested = parseJsonObject(parsed?.payload);
    return Object.keys(nested).length > 0 ? nested : parsed;
  };

  const loadMyAlliance = async (silent = false) => {
    if (!session) {
      setInAlliance(false);
      setAllianceData(null);
      setMineError("");
      setMyRole("MEMBER");
      setIncomingInvites([]);
      setPendingApplication(null);
      return;
    }
    if (!silent) setLoadingMine(true);
    if (!silent) setMineError("");
    try {
      const rpc = await client.rpc(session, "rpc_get_my_alliance", "{}");
      const payload = parseRpcPayload(rpc);
      if (payload.ok === false) {
        throw new Error(String(payload.error || "Alliance load failed."));
      }
      const nextInAlliance = Boolean(payload.inAlliance);
      const nextAlliance = payload.alliance ?? null;
      setInAlliance(nextInAlliance);
      setAllianceData(nextAlliance);
      setIncomingInvites(Array.isArray(payload.invites) ? payload.invites : []);
      setPendingApplication(payload.pendingApplication ?? null);
      if (nextInAlliance) {
        const membersRaw = Array.isArray(nextAlliance?.members) ? nextAlliance.members : [];
        const selfMember = membersRaw.find((m: any) => String(m?.userId || "") === playerId);
        setMyRole(normalizeRole(payload.myRole ?? selfMember?.role));
      } else {
        setMyRole("MEMBER");
      }
    } catch (err) {
      if (isUnauthorizedError(err)) {
        onUnauthorized();
        return;
      }
      setMineError(extractRpcErrorMessage(err) || l("Impossible de charger l'alliance.", "Unable to load alliance."));
    } finally {
      if (!silent) setLoadingMine(false);
    }
  };

  const searchAlliances = async () => {
    if (!session) return;
    setSearchBusy(true);
    setSearchError("");
    try {
      const rpc = await client.rpc(
        session,
        "rpc_search_alliances",
        JSON.stringify({ query: searchQuery.trim(), limit: 30 })
      );
      const payload = parseRpcPayload(rpc);
      if (payload.ok === false) {
        throw new Error(String(payload.error || "Alliance search failed."));
      }
      setSearchItems(Array.isArray(payload.items) ? payload.items : []);
    } catch (err) {
      if (isUnauthorizedError(err)) {
        onUnauthorized();
        return;
      }
      setSearchError(extractRpcErrorMessage(err) || l("Recherche impossible.", "Search failed."));
    } finally {
      setSearchBusy(false);
    }
  };

  const askConfirm = (title: string, message: string, onConfirm: () => void) => {
    setConfirmModal({ title, message, onConfirm });
  };

  const runConfirmedAction = () => {
    const current = confirmModal;
    setConfirmModal(null);
    if (current) current.onConfirm();
  };

  const createAlliance = async () => {
    if (!session) {
      setActionError(l("Connexion requise.", "Sign-in required."));
      return;
    }
    setCreateBusy(true);
    setActionError("");
    setActionSuccess("");
    try {
      const rpc = await client.rpc(
        session,
        "rpc_create_alliance",
        JSON.stringify({
          name: createName,
          tag: createTag,
          description: createDescription,
          logoUrl: createLogoUrl
        })
      );
      const payload = parseRpcPayload(rpc);
      if (payload.ok === false) {
        throw new Error(String(payload.error || "Alliance creation failed."));
      }
      setInAlliance(Boolean(payload.inAlliance));
      setAllianceData(payload.alliance ?? null);
      setMyRole(normalizeRole(payload.myRole || "LEADER"));
      setCreateDescription("");
      setCreateLogoUrl("");
      setActionSuccess(l("Alliance creee.", "Alliance created."));
      onRankingRefresh();
      await loadMyAlliance(true);
      await searchAlliances();
    } catch (err) {
      if (isUnauthorizedError(err)) {
        onUnauthorized();
        return;
      }
      setActionError(extractRpcErrorMessage(err) || l("Creation d'alliance impossible.", "Alliance creation failed."));
    } finally {
      setCreateBusy(false);
    }
  };

  const leaveAlliance = async () => {
    if (!session) return;
    setActionBusy("leave");
    setActionError("");
    setActionSuccess("");
    try {
      const rpc = await client.rpc(session, "rpc_leave_alliance", "{}");
      const payload = parseRpcPayload(rpc);
      if (payload.ok === false) throw new Error(String(payload.error || "Leave alliance failed."));
      setInAlliance(false);
      setAllianceData(null);
      setMyRole("MEMBER");
      setActionSuccess(payload.disbanded ? l("Alliance dissoute.", "Alliance disbanded.") : l("Alliance quittee.", "Alliance left."));
      onRankingRefresh();
      await loadMyAlliance(true);
      await searchAlliances();
    } catch (err) {
      if (isUnauthorizedError(err)) {
        onUnauthorized();
        return;
      }
      setActionError(extractRpcErrorMessage(err) || l("Impossible de quitter l'alliance.", "Unable to leave alliance."));
    } finally {
      setActionBusy("");
    }
  };

  const updateAllianceSettings = async () => {
    if (!session) return;
    setActionBusy("settings");
    setActionError("");
    setActionSuccess("");
    try {
      const rpc = await client.rpc(
        session,
        "rpc_update_my_alliance",
        JSON.stringify({
          description: editDescription,
          logoUrl: editLogoUrl,
          isRecruiting: editRecruiting
        })
      );
      const payload = parseRpcPayload(rpc);
      if (payload.ok === false) throw new Error(String(payload.error || "Alliance update failed."));
      setInAlliance(Boolean(payload.inAlliance));
      setAllianceData(payload.alliance ?? null);
      setMyRole(normalizeRole(payload.myRole));
      setActionSuccess(l("Parametres mis a jour.", "Settings updated."));
      await loadMyAlliance(true);
      await searchAlliances();
    } catch (err) {
      if (isUnauthorizedError(err)) {
        onUnauthorized();
        return;
      }
      setActionError(extractRpcErrorMessage(err) || l("Mise a jour impossible.", "Update failed."));
    } finally {
      setActionBusy("");
    }
  };

  const applyToAlliance = async (allianceId: string) => {
    if (!session) return;
    setActionBusy(`apply_${allianceId}`);
    setActionError("");
    setActionSuccess("");
    try {
      const rpc = await client.rpc(
        session,
        "rpc_alliance_apply",
        JSON.stringify({
          allianceId,
          message: applyMessage
        })
      );
      const payload = parseRpcPayload(rpc);
      if (payload.ok === false) throw new Error(String(payload.error || "Apply failed."));
      setPendingApplication(payload.pendingApplication ?? null);
      setActionSuccess(l("Candidature envoyee.", "Application sent."));
      await loadMyAlliance(true);
      await searchAlliances();
    } catch (err) {
      if (isUnauthorizedError(err)) {
        onUnauthorized();
        return;
      }
      setActionError(extractRpcErrorMessage(err) || l("Candidature impossible.", "Application failed."));
    } finally {
      setActionBusy("");
    }
  };

  const reviewApplication = async (targetUserId: string, accept: boolean) => {
    if (!session) return;
    setActionBusy(`review_${targetUserId}_${accept ? "accept" : "reject"}`);
    setActionError("");
    setActionSuccess("");
    try {
      const rpc = await client.rpc(
        session,
        "rpc_alliance_review_application",
        JSON.stringify({
          targetUserId,
          accept
        })
      );
      const payload = parseRpcPayload(rpc);
      if (payload.ok === false) throw new Error(String(payload.error || "Review failed."));
      setInAlliance(Boolean(payload.inAlliance));
      setAllianceData(payload.alliance ?? null);
      setMyRole(normalizeRole(payload.myRole));
      setActionSuccess(accept ? l("Candidature acceptee.", "Application approved.") : l("Candidature refusee.", "Application rejected."));
      onRankingRefresh();
      await loadMyAlliance(true);
      await searchAlliances();
    } catch (err) {
      if (isUnauthorizedError(err)) {
        onUnauthorized();
        return;
      }
      setActionError(extractRpcErrorMessage(err) || l("Traitement impossible.", "Unable to process application."));
    } finally {
      setActionBusy("");
    }
  };

  const invitePlayer = async () => {
    if (!session) return;
    const targetUserId = inviteTargetUserId.trim();
    if (!targetUserId) {
      setActionError(l("Entrez un identifiant joueur.", "Enter a target player id."));
      return;
    }
    setActionBusy(`invite_${targetUserId}`);
    setActionError("");
    setActionSuccess("");
    try {
      const rpc = await client.rpc(
        session,
        "rpc_alliance_invite_player",
        JSON.stringify({
          targetUserId
        })
      );
      const payload = parseRpcPayload(rpc);
      if (payload.ok === false) throw new Error(String(payload.error || "Invite failed."));
      setInAlliance(Boolean(payload.inAlliance));
      setAllianceData(payload.alliance ?? null);
      setMyRole(normalizeRole(payload.myRole));
      setInviteTargetUserId("");
      setActionSuccess(l("Invitation envoyee.", "Invitation sent."));
      await loadMyAlliance(true);
    } catch (err) {
      if (isUnauthorizedError(err)) {
        onUnauthorized();
        return;
      }
      setActionError(extractRpcErrorMessage(err) || l("Invitation impossible.", "Unable to send invitation."));
    } finally {
      setActionBusy("");
    }
  };

  const respondInvite = async (allianceId: string, accept: boolean) => {
    if (!session) return;
    setActionBusy(`invite_reply_${allianceId}_${accept ? "yes" : "no"}`);
    setActionError("");
    setActionSuccess("");
    try {
      const rpc = await client.rpc(
        session,
        "rpc_alliance_respond_invite",
        JSON.stringify({
          allianceId,
          accept
        })
      );
      const payload = parseRpcPayload(rpc);
      if (payload.ok === false) throw new Error(String(payload.error || "Invite response failed."));
      if (accept) {
        setInAlliance(Boolean(payload.inAlliance));
        setAllianceData(payload.alliance ?? null);
        setMyRole(normalizeRole(payload.myRole));
        setActionSuccess(l("Invitation acceptee.", "Invitation accepted."));
      } else {
        setActionSuccess(l("Invitation refusee.", "Invitation declined."));
      }
      setIncomingInvites(Array.isArray(payload.invites) ? payload.invites : []);
      await loadMyAlliance(true);
      await searchAlliances();
    } catch (err) {
      if (isUnauthorizedError(err)) {
        onUnauthorized();
        return;
      }
      setActionError(extractRpcErrorMessage(err) || l("Reponse impossible.", "Unable to answer invitation."));
    } finally {
      setActionBusy("");
    }
  };

  const runMemberAction = async (
    action: "promote_officer" | "demote_officer" | "kick_member" | "transfer_leadership",
    targetUserId: string
  ) => {
    if (!session) return;
    setActionBusy(`${action}_${targetUserId}`);
    setActionError("");
    setActionSuccess("");
    try {
      const rpc = await client.rpc(
        session,
        "rpc_alliance_member_action",
        JSON.stringify({
          action,
          targetUserId
        })
      );
      const payload = parseRpcPayload(rpc);
      if (payload.ok === false) throw new Error(String(payload.error || "Member action failed."));
      setInAlliance(Boolean(payload.inAlliance));
      setAllianceData(payload.alliance ?? null);
      setMyRole(normalizeRole(payload.myRole));
      setActionSuccess(l("Action effectuee.", "Action completed."));
      onRankingRefresh();
      await loadMyAlliance(true);
      await searchAlliances();
    } catch (err) {
      if (isUnauthorizedError(err)) {
        onUnauthorized();
        return;
      }
      setActionError(extractRpcErrorMessage(err) || l("Action impossible.", "Action failed."));
    } finally {
      setActionBusy("");
    }
  };

  useEffect(() => {
    void loadMyAlliance();
    const interval = window.setInterval(() => {
      void loadMyAlliance(true);
    }, 4000);
    return () => window.clearInterval(interval);
  }, [session]);

  useEffect(() => {
    if (tab === "search") void searchAlliances();
  }, [tab]);

  useEffect(() => {
    if (!inAlliance || !allianceData) return;
    setEditDescription(String(allianceData.description || ""));
    setEditLogoUrl(String(allianceData.logoUrl || ""));
    setEditRecruiting(allianceData.isRecruiting !== false);
  }, [inAlliance, allianceData?.id, allianceData?.description, allianceData?.logoUrl, allianceData?.isRecruiting]);

  const membersRaw = Array.isArray(allianceData?.members) ? allianceData.members : [];
  const members = [...membersRaw]
    .map((m: any) => ({
      ...m,
      role: normalizeRole(m?.role),
      username: String(m?.username || m?.userId || "-")
    }))
    .sort((a, b) => {
      const rank = (role: "LEADER" | "OFFICER" | "MEMBER") => (role === "LEADER" ? 0 : role === "OFFICER" ? 1 : 2);
      const roleDiff = rank(a.role) - rank(b.role);
      if (roleDiff !== 0) return roleDiff;
      return a.username.localeCompare(b.username);
    });

  const leader = members.find((m: any) => m.role === "LEADER") ?? null;
  const officers = members.filter((m: any) => m.role === "OFFICER");
  const applications = Array.isArray(allianceData?.applications) ? allianceData.applications : [];
  const allianceInvites = Array.isArray(allianceData?.invites) ? allianceData.invites : [];
  const allianceLogs = Array.isArray(allianceData?.logs) ? allianceData.logs : [];

  return (
    <main className="alliance-shell">
      <section className="alliance-hero">
        <div>
          <h2>{l("Alliance", "Alliance")}</h2>
          <p>{l("Gestion d'alliance serveur autoritaire (Nakama).", "Server-authoritative alliance management (Nakama).")}</p>
          <small>{l("Joueur", "Player")}: {playerId || "-"} • {new Date(nowMs).toLocaleTimeString()}</small>
        </div>
      </section>

      <section className="alliance-mode-switch">
        <button className={tab === "mine" ? "active" : ""} onClick={() => setTab("mine")}>{l("Mon Alliance", "My Alliance")}</button>
        <button className={tab === "search" ? "active" : ""} onClick={() => setTab("search")}>{l("Rechercher", "Search")}</button>
      </section>

      {tab === "mine" ? (
        <section className="alliance-public">
          {loadingMine ? <p className="alliance-warning">{l("Chargement...", "Loading...")}</p> : null}
          {mineError ? <p className="alliance-warning">{mineError}</p> : null}
          {actionError ? <p className="alliance-warning">{actionError}</p> : null}
          {actionSuccess ? <p className="alliance-success">{actionSuccess}</p> : null}

          {!inAlliance ? (
            <article className="alliance-panel">
              <h3>{l("Creer une alliance", "Create Alliance")}</h3>
              <p>{l("Cout de creation", "Creation cost")}: 50 000 Carbone + 5 000 Titane</p>
              <div className="alliance-vote-create">
                <input type="text" maxLength={32} placeholder={l("Nom (3..32)", "Name (3..32)")} value={createName} onChange={(e) => setCreateName(e.target.value)} />
                <input type="text" maxLength={5} placeholder={l("Tag (2..5)", "Tag (2..5)")} value={createTag} onChange={(e) => setCreateTag(e.target.value.toUpperCase())} />
                <input type="text" maxLength={512} placeholder={l("Logo URL (optionnel)", "Logo URL (optional)")} value={createLogoUrl} onChange={(e) => setCreateLogoUrl(e.target.value)} />
                <button type="button" disabled={createBusy} onClick={() => void createAlliance()}>
                  {createBusy ? l("Creation...", "Creating...") : l("Creer", "Create")}
                </button>
              </div>
              <textarea
                maxLength={500}
                placeholder={l("Description (max 500)", "Description (max 500)")}
                value={createDescription}
                onChange={(e) => setCreateDescription(e.target.value)}
              />
            </article>
          ) : (
            <article className="alliance-public-head">
              <div className="alliance-logo">{allianceData?.tag || "ALY"}</div>
              <div>
                <h3>{allianceData?.name || "-"}</h3>
                <p>{l("Tag", "Tag")}: {allianceData?.tag || "-"}</p>
                <p>{l("Chef", "Leader")}: {leader?.username || leader?.userId || "-"}</p>
                <p>{l("Sous-chefs", "Officers")}: {officers.length}</p>
                <p>{l("Membres", "Members")}: {allianceData?.memberCount ?? members.length}</p>
                <p>{l("Niveau Bastion", "Bastion Level")}: {allianceData?.bastionLevel ?? 1}</p>
                <p>{l("Mon role", "My role")}: {roleLabel(myRole)}</p>
              </div>
              <div className="alliance-toolbar">
                <button
                  type="button"
                  className="alliance-danger-btn"
                  disabled={actionBusy === "leave"}
                  onClick={() =>
                    askConfirm(
                      myRole === "LEADER" && members.length === 1 ? l("Dissoudre l'alliance", "Disband alliance") : l("Quitter l'alliance", "Leave alliance"),
                      myRole === "LEADER" && members.length === 1
                        ? l("Cette action supprime l'alliance. Continuer ?", "This will permanently disband the alliance. Continue?")
                        : l("Confirmez-vous votre depart ?", "Do you confirm leaving the alliance?"),
                      () => void leaveAlliance()
                    )
                  }
                >
                  {actionBusy === "leave"
                    ? l("Traitement...", "Processing...")
                    : myRole === "LEADER" && members.length === 1
                      ? l("Dissoudre", "Disband")
                      : l("Quitter", "Leave")}
                </button>
              </div>
            </article>
          )}

          {!inAlliance ? (
            <>
              {pendingApplication ? (
                <article className="alliance-panel">
                  <h3>{l("Candidature en attente", "Pending application")}</h3>
                  <p>
                    {l("Alliance cible", "Target alliance")}: [{String(pendingApplication.tag || "-")}] {String(pendingApplication.name || "-")}
                  </p>
                </article>
              ) : null}

              {incomingInvites.length > 0 ? (
                <article className="alliance-panel">
                  <h3>{l("Invitations recues", "Incoming invitations")}</h3>
                  <div className="alliance-contrib-list">
                    {incomingInvites.map((invite: any) => {
                      const allianceId = String(invite.allianceId || "");
                      const key = `invite_reply_${allianceId}`;
                      return (
                        <div key={`${allianceId}_${invite.createdAt || 0}`} className="alliance-contrib-item alliance-member-row">
                          <span>
                            [{String(invite.allianceTag || "-")}] {String(invite.allianceName || allianceId || "-")}
                            <em className="alliance-role-badge role-open">{l("Invitation", "Invite")}</em>
                          </span>
                          <div className="alliance-member-actions">
                            <button
                              type="button"
                              disabled={actionBusy === `${key}_yes`}
                              onClick={() =>
                                askConfirm(
                                  l("Accepter l'invitation", "Accept invitation"),
                                  l("Voulez-vous rejoindre cette alliance ?", "Do you want to join this alliance?"),
                                  () => void respondInvite(allianceId, true)
                                )
                              }
                            >
                              {l("Accepter", "Accept")}
                            </button>
                            <button
                              type="button"
                              className="alliance-kick"
                              disabled={actionBusy === `${key}_no`}
                              onClick={() =>
                                askConfirm(
                                  l("Refuser l'invitation", "Decline invitation"),
                                  l("Voulez-vous refuser cette invitation ?", "Do you want to decline this invitation?"),
                                  () => void respondInvite(allianceId, false)
                                )
                              }
                            >
                              {l("Refuser", "Decline")}
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </article>
              ) : null}
            </>
          ) : null}

          {inAlliance ? (
            <article className="alliance-panel">
              {myRole === "LEADER" ? (
                <>
                  <h3>{l("Parametres alliance", "Alliance settings")}</h3>
                  <div className="alliance-settings-grid">
                    <input
                      type="text"
                      maxLength={512}
                      placeholder={l("Logo URL", "Logo URL")}
                      value={editLogoUrl}
                      onChange={(e) => setEditLogoUrl(e.target.value)}
                    />
                    <label className="alliance-checkline">
                      <input
                        type="checkbox"
                        checked={editRecruiting}
                        onChange={(e) => setEditRecruiting(e.target.checked)}
                      />
                      <span>{l("Alliance ouverte au recrutement", "Alliance open for recruiting")}</span>
                    </label>
                    <textarea
                      maxLength={500}
                      placeholder={l("Description alliance", "Alliance description")}
                      value={editDescription}
                      onChange={(e) => setEditDescription(e.target.value)}
                    />
                    <button type="button" disabled={actionBusy === "settings"} onClick={() => void updateAllianceSettings()}>
                      {actionBusy === "settings" ? l("Sauvegarde...", "Saving...") : l("Sauvegarder", "Save settings")}
                    </button>
                  </div>
                </>
              ) : (
                <p>{l("Seul le chef peut modifier les parametres d'alliance.", "Only the leader can edit alliance settings.")}</p>
              )}
            </article>
          ) : null}

          {inAlliance ? (
            <article className="alliance-panel">
              <h3>{l("Membres", "Members")}</h3>
              <div className="alliance-contrib-list">
                {members.map((member: any) => {
                  const role = normalizeRole(member.role);
                  const isSelf = String(member.userId) === playerId;
                  const canPromote = myRole === "LEADER" && role === "MEMBER" && !isSelf;
                  const canDemote = myRole === "LEADER" && role === "OFFICER" && !isSelf;
                  const canTransfer = myRole === "LEADER" && role !== "LEADER" && !isSelf;
                  const canKick = (myRole === "LEADER" && role !== "LEADER" && !isSelf) || (myRole === "OFFICER" && role === "MEMBER" && !isSelf);

                  return (
                    <div key={member.userId} className="alliance-contrib-item alliance-member-row">
                      <span>
                        {member.username}
                        <em className={`alliance-role-badge role-${String(role).toLowerCase()}`}>{roleLabel(role)}</em>
                      </span>
                      <div className="alliance-member-actions">
                        {canPromote ? (
                          <button
                            type="button"
                            disabled={actionBusy === `promote_officer_${member.userId}`}
                            onClick={() =>
                              askConfirm(
                                l("Promouvoir ce membre", "Promote this member"),
                                l("Le joueur deviendra sous-chef. Confirmer ?", "The player will become officer. Confirm?"),
                                () => void runMemberAction("promote_officer", member.userId)
                              )
                            }
                          >
                            {l("Promouvoir", "Promote")}
                          </button>
                        ) : null}
                        {canDemote ? (
                          <button
                            type="button"
                            disabled={actionBusy === `demote_officer_${member.userId}`}
                            onClick={() =>
                              askConfirm(
                                l("Retrograder ce sous-chef", "Demote this officer"),
                                l("Le joueur redeviendra membre. Confirmer ?", "The player will become member again. Confirm?"),
                                () => void runMemberAction("demote_officer", member.userId)
                              )
                            }
                          >
                            {l("Retrograder", "Demote")}
                          </button>
                        ) : null}
                        {canTransfer ? (
                          <button
                            type="button"
                            disabled={actionBusy === `transfer_leadership_${member.userId}`}
                            onClick={() =>
                              askConfirm(
                                l("Transferer le commandement", "Transfer leadership"),
                                l("Vous deviendrez membre. Confirmer le transfert ?", "You will become member. Confirm transfer?"),
                                () => void runMemberAction("transfer_leadership", member.userId)
                              )
                            }
                          >
                            {l("Nommer chef", "Transfer lead")}
                          </button>
                        ) : null}
                        {canKick ? (
                          <button
                            type="button"
                            className="alliance-kick"
                            disabled={actionBusy === `kick_member_${member.userId}`}
                            onClick={() =>
                              askConfirm(
                                l("Exclure ce membre", "Kick this member"),
                                l("Confirmer l'exclusion de ce membre ?", "Confirm kicking this member?"),
                                () => void runMemberAction("kick_member", member.userId)
                              )
                            }
                          >
                            {l("Exclure", "Kick")}
                          </button>
                        ) : null}
                      </div>
                    </div>
                  );
                })}
              </div>
            </article>
          ) : null}

          {inAlliance && (myRole === "LEADER" || myRole === "OFFICER") ? (
            <article className="alliance-panel">
              <h3>{l("Candidatures", "Applications")}</h3>
              {applications.length === 0 ? (
                <p>{l("Aucune candidature en attente.", "No pending application.")}</p>
              ) : (
                <div className="alliance-contrib-list">
                  {applications.map((row: any) => (
                    <div key={`app_${row.userId}`} className="alliance-contrib-item alliance-member-row">
                      <span>
                        {String(row.username || row.userId || "-")}
                        {row.message ? <small>{String(row.message)}</small> : null}
                      </span>
                      <div className="alliance-member-actions">
                        <button
                          type="button"
                          disabled={actionBusy === `review_${row.userId}_accept`}
                          onClick={() =>
                            askConfirm(
                              l("Accepter la candidature", "Approve application"),
                              l("Confirmer l'acceptation de ce joueur ?", "Confirm accepting this player?"),
                              () => void reviewApplication(String(row.userId), true)
                            )
                          }
                        >
                          {l("Accepter", "Approve")}
                        </button>
                        <button
                          type="button"
                          className="alliance-kick"
                          disabled={actionBusy === `review_${row.userId}_reject`}
                          onClick={() =>
                            askConfirm(
                              l("Refuser la candidature", "Reject application"),
                              l("Confirmer le refus de cette candidature ?", "Confirm rejecting this application?"),
                              () => void reviewApplication(String(row.userId), false)
                            )
                          }
                        >
                          {l("Refuser", "Reject")}
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </article>
          ) : null}

          {inAlliance && (myRole === "LEADER" || myRole === "OFFICER") ? (
            <article className="alliance-panel">
              <h3>{l("Inviter un joueur", "Invite player")}</h3>
              <div className="alliance-member-actions">
                <input
                  type="text"
                  placeholder={l("UserId du joueur", "Target player userId")}
                  value={inviteTargetUserId}
                  onChange={(e) => setInviteTargetUserId(e.target.value)}
                />
                <button
                  type="button"
                  disabled={actionBusy.startsWith("invite_")}
                  onClick={() =>
                    askConfirm(
                      l("Envoyer une invitation", "Send invitation"),
                      l("Confirmer l'envoi de cette invitation ?", "Confirm sending this invitation?"),
                      () => void invitePlayer()
                    )
                  }
                >
                  {l("Inviter", "Invite")}
                </button>
              </div>
              {allianceInvites.length > 0 ? (
                <div className="alliance-contrib-list">
                  {allianceInvites.map((inv: any) => (
                    <div key={`inv_${inv.targetUserId}`} className="alliance-contrib-item">
                      <span>{String(inv.targetUsername || inv.targetUserId || "-")}</span>
                      <strong>{l("Expire", "Expires")}: {new Date((Number(inv.expiresAt || 0) || 0) * 1000).toLocaleString()}</strong>
                    </div>
                  ))}
                </div>
              ) : (
                <p>{l("Aucune invitation active.", "No active invitation.")}</p>
              )}
            </article>
          ) : null}

          {inAlliance ? (
            <article className="alliance-panel">
              <h3>{l("Journal d'alliance", "Alliance log")}</h3>
              {allianceLogs.length === 0 ? (
                <p>{l("Aucune entree de journal.", "No log entry yet.")}</p>
              ) : (
                <div className="alliance-log-list">
                  {allianceLogs.map((log: any, idx: number) => (
                    <div key={`log_live_${idx}_${log.at || 0}`} className="alliance-log-item">
                      <span>{String(log.message || "-")}</span>
                      <small>
                        {new Date((Number(log.at || 0) || 0) * 1000).toLocaleString()} • {String(log.by || "-")}
                      </small>
                    </div>
                  ))}
                </div>
              )}
            </article>
          ) : null}
        </section>
      ) : (
        <section className="alliance-panel">
          <h3>{l("Rechercher des alliances", "Search alliances")}</h3>
          <div className="alliance-vote-create">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={l("Nom ou tag", "Name or tag")}
            />
            <button type="button" onClick={() => void searchAlliances()} disabled={searchBusy}>
              {searchBusy ? l("Recherche...", "Searching...") : l("Rechercher", "Search")}
            </button>
          </div>
          {!inAlliance ? (
            <div className="alliance-vote-create">
              <input
                type="text"
                value={applyMessage}
                maxLength={240}
                onChange={(e) => setApplyMessage(e.target.value)}
                placeholder={l("Message de candidature (optionnel)", "Application message (optional)")}
              />
            </div>
          ) : null}
          {searchError ? <p className="alliance-warning">{searchError}</p> : null}
          <div className="alliance-contrib-list">
            {searchItems.length === 0 ? (
              <p className="alliance-warning">{l("Aucune alliance trouvee.", "No alliance found.")}</p>
            ) : (
              searchItems.map((item) => (
                <div key={item.id} className="alliance-contrib-item alliance-member-row">
                  <span>
                    [{item.tag}] {item.name}
                    <em className={`alliance-role-badge ${item.isRecruiting ? "role-open" : "role-closed"}`}>
                      {item.isRecruiting ? l("Ouverte", "Open") : l("Fermee", "Closed")}
                    </em>
                  </span>
                  <div className="alliance-member-actions">
                    <strong>{(item.memberCount ?? 0).toLocaleString()} {l("membres", "members")}</strong>
                    {!inAlliance && item.isRecruiting && !pendingApplication ? (
                      <button
                        type="button"
                        disabled={actionBusy === `apply_${item.id}`}
                        onClick={() =>
                          askConfirm(
                            l("Envoyer une candidature", "Send application"),
                            l("Confirmer l'envoi de votre candidature ?", "Confirm sending your application?"),
                            () => void applyToAlliance(String(item.id))
                          )
                        }
                      >
                        {actionBusy === `apply_${item.id}` ? l("Envoi...", "Sending...") : l("Postuler", "Apply")}
                      </button>
                    ) : null}
                    {!inAlliance && pendingApplication && String(pendingApplication.allianceId || "") === String(item.id || "") ? (
                      <em className="alliance-role-badge role-member">{l("En attente", "Pending")}</em>
                    ) : null}
                  </div>
                </div>
              ))
            )}
          </div>
        </section>
      )}
    </main>
  );
}

function AllianceScreen({
  language,
  playerId,
  nowMs,
  client,
  session,
  onRankingRefresh,
  onUnauthorized
}: {
  language: UILanguage;
  playerId: string;
  nowMs: number;
  client: Client;
  session: Session | null;
  onRankingRefresh: () => void;
  onUnauthorized: () => void;
}) {
  return (
    <AllianceScreenV2
      language={language}
      playerId={playerId}
      nowMs={nowMs}
      client={client}
      session={session}
      onRankingRefresh={onRankingRefresh}
      onUnauthorized={onUnauthorized}
    />
  );

  type AllianceRole = "chef" | "co_lead" | "member";
  type AllianceTab = "overview" | "war" | "coordination" | "votes" | "log";
  type AllianceVoteTopic = "war" | "major_quest" | "bastion_invest" | "strategic_bonus";
  type AllianceVoteStatus = "active" | "accepted" | "rejected";
  type AllianceVote = {
    id: string;
    topic: AllianceVoteTopic;
    title: string;
    description: string;
    initiatedBy: string;
    startedAt: number;
    endAt: number;
    yesBy: string[];
    noBy: string[];
    status: AllianceVoteStatus;
  };

  const l = (fr: string, en: string) => (language === "en" ? en : fr);
  const [mode, setMode] = useState<"public" | "internal">("public");
  const [tab, setTab] = useState<AllianceTab>("overview");
  const [investInput, setInvestInput] = useState("10000");
  const [newVoteTopic, setNewVoteTopic] = useState<AllianceVoteTopic>("war");
  const [newVoteTitle, setNewVoteTitle] = useState("");
  const [newVoteDesc, setNewVoteDesc] = useState("");
  const [bastionLevel, setBastionLevel] = useState(12);
  const [bastionProgressPct, setBastionProgressPct] = useState(68);
  const currentUser = (playerId || "Operateur").slice(0, 24);

  const memberCount = 28;
  const allianceCap = 30;
  const activeSectorHours = 31;
  const strategicSectorsHeld = 2;
  const warPoints = 18450;
  const militaryPower = 9_840_000;
  const activityScore = 91;
  const currentRank = 7;

  const roleMap: Record<string, AllianceRole> = {
    Heimy: "chef",
    Vega: "co_lead",
    Orion: "co_lead",
    Nyx: "co_lead"
  };
  const currentRole = roleMap[currentUser] ?? "member";

  const [contributions, setContributions] = useState<Array<{ member: string; points: number; invested: number }>>([
    { member: "Heimy", points: 164000, invested: 730000 },
    { member: "Vega", points: 129000, invested: 560000 },
    { member: "Orion", points: 111000, invested: 492000 },
    { member: "Nyx", points: 98000, invested: 451000 },
    { member: currentUser, points: 32400, invested: 138000 }
  ]);

  const [votes, setVotes] = useState<AllianceVote[]>([
    {
      id: "vote_war_1",
      topic: "war",
      title: l("Declaration de guerre contre Vanta Dominion", "Declare war against Vanta Dominion"),
      description: l("Activation du preavis de 24h + cout de declaration.", "Enable 24h notice + declaration cost."),
      initiatedBy: "Heimy",
      startedAt: nowMs - 2 * 60 * 60 * 1000,
      endAt: nowMs + 22 * 60 * 60 * 1000,
      yesBy: ["Heimy", "Vega", "Orion"],
      noBy: ["Nyx"],
      status: "active"
    },
    {
      id: "vote_bastion_2",
      topic: "bastion_invest",
      title: l("Injection majeure dans le Bastion Orbital", "Major Orbital Bastion investment"),
      description: l("Engager 2.4M ressources pour accelerer le niveau suivant.", "Commit 2.4M resources to rush next bastion level."),
      initiatedBy: "Vega",
      startedAt: nowMs - 30 * 60 * 1000,
      endAt: nowMs + 23.5 * 60 * 60 * 1000,
      yesBy: ["Vega"],
      noBy: [],
      status: "active"
    },
    {
      id: "vote_bonus_0",
      topic: "strategic_bonus",
      title: l("Activation bonus vitesse flotte 12h", "Activate fleet speed bonus for 12h"),
      description: l("Consomme 1 charge strategique du Bastion.", "Consumes 1 strategic charge from Bastion."),
      initiatedBy: "Orion",
      startedAt: nowMs - 40 * 60 * 60 * 1000,
      endAt: nowMs - 16 * 60 * 60 * 1000,
      yesBy: ["Heimy", "Orion", "Nyx", "Vega"],
      noBy: ["Kai"],
      status: "accepted"
    }
  ]);

  const plannedAttacks = [
    { id: "atk1", target: "Forteresse Sigma-19", impactAt: nowMs + 34 * 60 * 1000, joined: 5, window: "±5 min" },
    { id: "atk2", target: "Relais de guerre K-412", impactAt: nowMs + 3 * 60 * 60 * 1000, joined: 3, window: "±5 min" }
  ];

  const stationedReinforcements = [
    { owner: "Vega", host: "Heimy", fleet: "Tempest x18, Titanide x4", quantumPerHour: 142 },
    { owner: "Nyx", host: "Orion", fleet: "Spectre x26, Foudroyant x40", quantumPerHour: 95 }
  ];

  const internalLog = [
    `${l("Connexion", "Login")} - Heimy`,
    `${l("Investissement Bastion", "Bastion investment")} +92 000`,
    `${l("Attaque allie detectee", "Ally attack detected")} Nyx -> Orion (${l("penalite reputation", "reputation penalty")} -10%)`,
    `${l("Renfort stationne", "Reinforcement stationed")} Vega -> Heimy`
  ];

  const topicLabel = (topic: AllianceVoteTopic) => {
    if (topic === "war") return l("Guerre", "War");
    if (topic === "major_quest") return l("Quete majeure", "Major quest");
    if (topic === "bastion_invest") return l("Investissement Bastion", "Bastion investment");
    return l("Bonus strategique", "Strategic bonus");
  };

  const voteComputed = useMemo(
    () =>
      votes.map((vote) => {
        const yes = vote.yesBy.length;
        const no = vote.noBy.length;
        const total = yes + no;
        const participation = memberCount > 0 ? total / memberCount : 0;
        const reachedQuorum = participation >= 0.4;
        const expired = nowMs >= vote.endAt;
        const accepted = reachedQuorum && yes > no;
        const status: AllianceVoteStatus = expired ? (accepted ? "accepted" : "rejected") : "active";
        return { vote, yes, no, total, participation, reachedQuorum, expired, status };
      }),
    [memberCount, nowMs, votes]
  );

  const castVote = (voteId: string, choice: "yes" | "no") => {
    setVotes((prev) =>
      prev.map((vote) => {
        if (vote.id !== voteId) return vote;
        if (nowMs >= vote.endAt) return vote;
        const yesBy = vote.yesBy.filter((name) => name !== currentUser);
        const noBy = vote.noBy.filter((name) => name !== currentUser);
        if (choice === "yes") yesBy.push(currentUser);
        else noBy.push(currentUser);
        return { ...vote, yesBy, noBy };
      })
    );
  };

  const launchVote = () => {
    if (currentRole === "member") return;
    const title = newVoteTitle.trim();
    if (!title) return;
    setVotes((prev) => [
      {
        id: `vote_${Date.now()}`,
        topic: newVoteTopic,
        title,
        description: newVoteDesc.trim() || l("Aucune description fournie.", "No description provided."),
        initiatedBy: currentUser,
        startedAt: nowMs,
        endAt: nowMs + 24 * 60 * 60 * 1000,
        yesBy: [currentUser],
        noBy: [],
        status: "active"
      },
      ...prev
    ]);
    setNewVoteTitle("");
    setNewVoteDesc("");
  };

  const investBastion = () => {
    const amount = Math.max(0, Math.floor(Number(investInput) || 0));
    if (amount <= 0) return;
    setContributions((prev) => {
      const index = prev.findIndex((row) => row.member === currentUser);
      if (index === -1) return [...prev, { member: currentUser, points: amount, invested: amount }];
      const next = [...prev];
      next[index] = {
        ...next[index],
        points: next[index].points + amount,
        invested: next[index].invested + amount
      };
      return next;
    });
    setBastionProgressPct((prev) => {
      const next = prev + amount / 120000;
      if (next < 100) return next;
      setBastionLevel((lvl) => lvl + Math.floor(next / 100));
      return next % 100;
    });
    setInvestInput("");
  };

  const topContributors = [...contributions].sort((a, b) => b.points - a.points);
  const rankingScore = Math.round(
    bastionLevel * 1000 * 0.3 + militaryPower * 0.3 + warPoints * 0.25 + activityScore * 100 * 0.15
  );

  return (
    <main className="alliance-shell">
      <section className="alliance-hero">
        <div>
          <h2>{l("Alliance // Aegis Helios", "Alliance // Aegis Helios")}</h2>
          <p>{l("Hyperstructure diplomatique, militaire et economique a gouvernance active.", "Diplomatic, military and economic hyperstructure with active governance.")}</p>
        </div>
        <div className="alliance-mode-switch">
          <button className={mode === "public" ? "active" : ""} onClick={() => setMode("public")}>{l("Page publique", "Public page")}</button>
          <button className={mode === "internal" ? "active" : ""} onClick={() => setMode("internal")}>{l("Page interne", "Internal page")}</button>
        </div>
      </section>

      {mode === "public" ? (
        <section className="alliance-public">
          <article className="alliance-public-head">
            <div className="alliance-logo">AH</div>
            <div>
              <h3>Aegis Helios</h3>
              <p>{l("Devise", "Motto")}: {l("Ordre orbital, puissance collective.", "Orbital order, collective power.")}</p>
              <p>{l("Description", "Description")}: {l("Alliance 4X orientee coordination, bastion commun et guerres saisonnieres.", "4X alliance focused on coordination, shared bastion and seasonal wars.")}</p>
            </div>
            <button type="button">{l("Candidater", "Apply")}</button>
          </article>

          <div className="alliance-public-grid">
            <article><small>{l("Niveau Bastion", "Bastion level")}</small><strong>{bastionLevel}</strong></article>
            <article><small>{l("Membres", "Members")}</small><strong>{memberCount}/{allianceCap}</strong></article>
            <article><small>{l("Puissance totale", "Total power")}</small><strong>{militaryPower.toLocaleString()}</strong></article>
            <article><small>{l("Classement", "Ranking")}</small><strong>#{currentRank}</strong></article>
            <article><small>{l("Points guerre", "War points")}</small><strong>{warPoints.toLocaleString()}</strong></article>
            <article><small>{l("Score global", "Global score")}</small><strong>{rankingScore.toLocaleString()}</strong></article>
          </div>

          <details className="alliance-spoiler">
            <summary>{l("Historique des guerres & stats globales", "War history & global stats")}</summary>
            <div className="alliance-public-history">
              <p>{l("Saison en cours", "Current season")}: 3 {l("guerres declarees", "wars declared")} / 2 {l("victoires", "wins")}</p>
              <p>{l("Dernier conflit", "Last conflict")}: Aegis Helios vs Vanta Dominion ({l("victoire", "victory")})</p>
              <p>{l("Secteurs strategiques controles", "Strategic sectors controlled")}: {strategicSectorsHeld}</p>
            </div>
          </details>
        </section>
      ) : (
        <section className="alliance-internal">
          <aside className="alliance-sidebar">
            <h3>{l("Commandement", "Command")}</h3>
            <p>{l("Role", "Role")}: <strong>{currentRole === "chef" ? l("Chef", "Leader") : currentRole === "co_lead" ? l("Sous-chef", "Co-leader") : l("Membre", "Member")}</strong></p>
            <p>{l("Votes requis", "Votes required")}: {l("Guerre, quete majeure, investissement massif, bonus temporaire", "War, major quest, major investment, temporary bonus")}</p>
            <p>{l("Cooldown recommande apres depart", "Recommended cooldown after leaving")}: 24h</p>
            <div className="alliance-tab-list">
              <button className={tab === "overview" ? "active" : ""} onClick={() => setTab("overview")}>{l("Tableau general", "Overview")}</button>
              <button className={tab === "war" ? "active" : ""} onClick={() => setTab("war")}>{l("Guerre", "War")}</button>
              <button className={tab === "coordination" ? "active" : ""} onClick={() => setTab("coordination")}>{l("Coordination", "Coordination")}</button>
              <button className={tab === "votes" ? "active" : ""} onClick={() => setTab("votes")}>{l("Votes", "Votes")}</button>
              <button className={tab === "log" ? "active" : ""} onClick={() => setTab("log")}>{l("Journal", "Log")}</button>
            </div>
          </aside>

          <div className="alliance-content">
            {tab === "overview" ? (
              <div className="alliance-panel">
                <h3>{l("Bastion Orbital d'Alliance", "Alliance Orbital Bastion")}</h3>
                <p>{l("Les ressources investies sont detruites (anti-inflation).", "Invested resources are destroyed (anti-inflation).")}</p>
                <div className="alliance-progress">
                  <div style={{ width: `${Math.min(100, Math.max(0, bastionProgressPct))}%` }} />
                </div>
                <p>{l("Progression niveau", "Level progress")}: {bastionProgressPct.toFixed(1)}%</p>
                <div className="alliance-invest-row">
                  <input
                    type="number"
                    min={1}
                    value={investInput}
                    onChange={(e) => setInvestInput(e.target.value)}
                    placeholder={l("Montant a investir", "Amount to invest")}
                  />
                  <button type="button" onClick={investBastion}>{l("Investir", "Invest")}</button>
                </div>
                <div className="alliance-contrib-list">
                  {topContributors.slice(0, 8).map((row, idx) => (
                    <div key={`contrib_${row.member}`} className="alliance-contrib-item">
                      <span>#{idx + 1} {row.member}</span>
                      <strong>{row.points.toLocaleString()} pts</strong>
                    </div>
                  ))}
                </div>
                <div className="alliance-note-box">
                  <strong>{l("Recompense quotidienne", "Daily reward")}</strong>
                  <span>{l("Coffre d'alliance + points contribution selon activite.", "Alliance chest + contribution points based on activity.")}</span>
                </div>
              </div>
            ) : null}

            {tab === "war" ? (
              <div className="alliance-panel">
                <h3>{l("Guerres d'alliance", "Alliance Wars")}</h3>
                <div className="alliance-war-grid">
                  <article><small>{l("Points de guerre", "War points")}</small><strong>{warPoints.toLocaleString()}</strong></article>
                  <article><small>{l("Preavis declaration", "Declaration notice")}</small><strong>24h</strong></article>
                  <article><small>{l("Victoire attaque groupee", "Group attack win")}</small><strong>+450</strong></article>
                  <article><small>{l("Pillage reussi", "Successful raid")}</small><strong>+120</strong></article>
                </div>
                <details className="alliance-spoiler">
                  <summary>{l("Objectifs galactiques actifs", "Active galactic objectives")}</summary>
                  <p>{l("Secteur Helios-7 sous controle. Bonus +5% production globale alliance et +5% vitesse flotte.", "Helios-7 sector under control. +5% alliance global production and +5% fleet speed.")}</p>
                  <p>{l("Maintien de presence", "Presence hold")}: {activeSectorHours}h / 48h</p>
                </details>
              </div>
            ) : null}

            {tab === "coordination" ? (
              <div className="alliance-panel">
                <h3>{l("Coordination militaire avancee", "Advanced Military Coordination")}</h3>
                <div className="alliance-coord-grid">
                  <article>
                    <h4>{l("Attaques groupees synchronisees", "Synchronized group attacks")}</h4>
                    {plannedAttacks.map((attack) => (
                      <div key={attack.id} className="alliance-coord-item">
                        <span>{attack.target}</span>
                        <small>{l("Impact", "Impact")}: {new Date(attack.impactAt).toLocaleTimeString()} ({attack.window})</small>
                        <em>{attack.joined} {l("participants", "participants")}</em>
                      </div>
                    ))}
                  </article>
                  <article>
                    <h4>{l("Renforts defensifs stationnes", "Stationed defensive reinforcements")}</h4>
                    {stationedReinforcements.map((row, idx) => (
                      <div key={`reinforcement_${idx}`} className="alliance-coord-item">
                        <span>{row.owner} {"->"} {row.host}</span>
                        <small>{row.fleet}</small>
                        <em>{row.quantumPerHour}/h Q</em>
                      </div>
                    ))}
                  </article>
                </div>
                <p className="alliance-warning">{l("Attaquer un allie reste possible mais applique -10% reputation alliance + log public interne.", "Attacking an ally remains possible but applies -10% alliance reputation + public internal log.")}</p>
              </div>
            ) : null}

            {tab === "votes" ? (
              <div className="alliance-panel">
                <h3>{l("Votes politiques (24h)", "Political Votes (24h)")}</h3>
                {currentRole !== "member" ? (
                  <div className="alliance-vote-create">
                    <select value={newVoteTopic} onChange={(e) => setNewVoteTopic(e.target.value as AllianceVoteTopic)}>
                      <option value="war">{topicLabel("war")}</option>
                      <option value="major_quest">{topicLabel("major_quest")}</option>
                      <option value="bastion_invest">{topicLabel("bastion_invest")}</option>
                      <option value="strategic_bonus">{topicLabel("strategic_bonus")}</option>
                    </select>
                    <input type="text" value={newVoteTitle} onChange={(e) => setNewVoteTitle(e.target.value)} placeholder={l("Titre du vote", "Vote title")} />
                    <input type="text" value={newVoteDesc} onChange={(e) => setNewVoteDesc(e.target.value)} placeholder={l("Description", "Description")} />
                    <button type="button" onClick={launchVote}>{l("Lancer un vote", "Launch vote")}</button>
                  </div>
                ) : null}

                <div className="alliance-vote-list">
                  {voteComputed.map((row) => {
                    const remaining = Math.max(0, Math.floor((row.vote.endAt - nowMs) / 1000));
                    return (
                      <article key={row.vote.id} className={`alliance-vote-card ${row.status}`}>
                        <header>
                          <strong>{row.vote.title}</strong>
                          <span>{topicLabel(row.vote.topic)}</span>
                        </header>
                        <p>{row.vote.description}</p>
                        <div className="alliance-vote-stats">
                          <small>{l("Oui", "Yes")}: {row.yes}</small>
                          <small>{l("Non", "No")}: {row.no}</small>
                          <small>{l("Participation", "Participation")}: {(row.participation * 100).toFixed(0)}%</small>
                          <small>{l("Quorum min.", "Min quorum")}: 40%</small>
                        </div>
                        <div className="alliance-vote-foot">
                          <em>
                            {row.status === "active"
                              ? `${l("Temps restant", "Time left")}: ${formatDuration(remaining)}`
                              : row.status === "accepted"
                                ? l("Resultat: adopte", "Result: approved")
                                : l("Resultat: rejete", "Result: rejected")}
                          </em>
                          {row.status === "active" ? (
                            <div className="alliance-vote-actions">
                              <button type="button" onClick={() => castVote(row.vote.id, "yes")}>{l("Voter Oui", "Vote Yes")}</button>
                              <button type="button" onClick={() => castVote(row.vote.id, "no")}>{l("Voter Non", "Vote No")}</button>
                            </div>
                          ) : null}
                        </div>
                      </article>
                    );
                  })}
                </div>
              </div>
            ) : null}

            {tab === "log" ? (
              <div className="alliance-panel">
                <h3>{l("Journal interne", "Internal Log")}</h3>
                <div className="alliance-log-list">
                  {internalLog.map((line, idx) => (
                    <div key={`log_${idx}`} className="alliance-log-item">
                      <span>{line}</span>
                      <small>{new Date(nowMs - idx * 18 * 60 * 1000).toLocaleTimeString()}</small>
                    </div>
                  ))}
                </div>
              </div>
            ) : null}
          </div>
        </section>
      )}

      {confirmModal ? (
        <div className="modal-backdrop" onClick={() => setConfirmModal(null)}>
          <div className="modal-card small" onClick={(e) => e.stopPropagation()}>
            <div className="modal-head">
              <h3>{confirmModal.title}</h3>
              <button type="button" onClick={() => setConfirmModal(null)}>
                <X size={16} />
              </button>
            </div>
            <p>{confirmModal.message}</p>
            <div className="alliance-member-actions">
              <button type="button" className="alliance-kick" onClick={() => setConfirmModal(null)}>
                {l("Annuler", "Cancel")}
              </button>
              <button type="button" onClick={runConfirmedAction}>
                {l("Confirmer", "Confirm")}
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </main>
  );
}

function RankingScreen({
  language,
  loading,
  error,
  playerPoints,
  playerRank,
  players,
  alliances,
  onRefresh
}: {
  language: UILanguage;
  loading: boolean;
  error: string;
  playerPoints: number;
  playerRank: number;
  players: any[];
  alliances: any[];
  onRefresh: () => void;
}) {
  const l = (fr: string, en: string) => (language === "en" ? en : fr);
  const [tab, setTab] = useState<"players" | "alliances">("players");

  const normalizeRows = (rows: any[], type: "players" | "alliances") =>
    rows.map((entry, index) => {
      const metadata = parseJsonObject(entry?.metadata);
      const rank = Math.max(1, Math.floor(Number(entry?.rank ?? index + 1)));
      const score = formatDisplayedScoreValue(Number(entry?.score ?? 0));
      const subscore = Math.max(0, Math.floor(Number(entry?.subscore ?? 0)));
      const ownerId = String(entry?.ownerId ?? "");
      const allianceId = String(metadata?.allianceId ?? "");
      const fallbackName = ownerId ? ownerId.slice(0, 10) : `#${rank}`;
      const label =
        type === "alliances"
          ? String(metadata?.name || entry?.username || fallbackName)
          : String(entry?.username || metadata?.username || fallbackName);
      const memberCount = Math.max(0, Math.floor(Number(metadata?.members ?? 0)));
      const tag = String(metadata?.tag || "");
      return {
        id: type === "alliances"
          ? String(allianceId || ownerId || `${type}_${rank}`)
          : String(entry?.ownerId ?? `${type}_${rank}`),
        rank,
        score,
        subscore,
        label,
        extra: type === "alliances" ? tag : "",
        memberCount
      };
    });

  const playerRows = useMemo(() => normalizeRows(players, "players"), [players]);
  const allianceRows = useMemo(() => normalizeRows(alliances, "alliances"), [alliances]);
  const rows = tab === "players" ? playerRows : allianceRows;
  const podium = rows.slice(0, 3);
  const subscoreLabel = tab === "players" ? l("Militaire", "Military") : l("Bastion", "Bastion");

  return (
    <main className="ranking-shell">
      <section className="ranking-hero ranking-hero-v2">
        <div>
          <h2>{l("Classement Galactique", "Galactic Ranking")}</h2>
          <p>{l("Scores serveur, classement live et progression inter-factions.", "Server scores, live ranking and inter-faction progression.")}</p>
        </div>
        <button type="button" onClick={onRefresh} disabled={loading} className="ranking-refresh-btn">
          {loading ? l("Actualisation...", "Refreshing...") : l("Actualiser", "Refresh")}
        </button>
      </section>

      <section className="ranking-summary-grid">
        <article className="ranking-summary-card">
          <small>{l("Votre score", "Your score")}</small>
          <strong>{formatDisplayedScoreValue(playerPoints).toLocaleString()}</strong>
        </article>
        <article className="ranking-summary-card">
          <small>{l("Votre rang", "Your rank")}</small>
          <strong>{playerRank > 0 ? `#${playerRank}` : "-"}</strong>
        </article>
        <article className="ranking-summary-card">
          <small>{tab === "players" ? l("Joueurs classes", "Ranked players") : l("Alliances classees", "Ranked alliances")}</small>
          <strong>{rows.length.toLocaleString()}</strong>
        </article>
      </section>

      <section className="ranking-tabs">
        <button type="button" className={tab === "players" ? "active" : ""} onClick={() => setTab("players")}>
          {l("Joueurs", "Players")}
        </button>
        <button type="button" className={tab === "alliances" ? "active" : ""} onClick={() => setTab("alliances")}>
          {l("Alliances", "Alliances")}
        </button>
      </section>

      {error ? <p className="ranking-error">{error}</p> : null}

      {podium.length > 0 ? (
        <section className="ranking-podium">
          {podium.map((row, idx) => (
            <article key={`podium_${row.id}`} className={`ranking-podium-card pos-${idx + 1}`}>
              <small>#{row.rank}</small>
              <strong>
                {row.extra ? `[${row.extra}] ` : ""}
                {row.label}
              </strong>
              <span>{row.score.toLocaleString()} pts</span>
            </article>
          ))}
        </section>
      ) : null}

      <section className="ranking-table-wrap ranking-table-wrap-v2">
        <div className="ranking-table-head">
          <span>#</span>
          <span>{tab === "players" ? l("Joueur", "Player") : l("Alliance", "Alliance")}</span>
          <span>{l("Score", "Score")}</span>
          <span>{subscoreLabel}</span>
        </div>
        {rows.length === 0 ? (
          <p className="ranking-empty">{loading ? l("Chargement...", "Loading...") : l("Aucune donnee.", "No data.")}</p>
        ) : (
          rows.map((row) => (
            <div key={row.id} className={`ranking-row rank-${Math.min(3, Math.max(1, row.rank))}`}>
              <span className="rank">#{row.rank}</span>
              <span className="label">
                <strong>
                  {row.extra ? `[${row.extra}] ` : ""}
                  {row.label}
                </strong>
                {tab === "alliances" ? (
                  <small>
                    {l("Membres", "Members")}: {row.memberCount.toLocaleString()}
                  </small>
                ) : (
                  <small>
                    {l("Profil", "Profile")}: {row.id.slice(0, 10)}
                  </small>
                )}
              </span>
              <strong className="score">{row.score.toLocaleString()}</strong>
              <span className="subscore">{row.subscore.toLocaleString()}</span>
            </div>
          ))
        )}
      </section>
    </main>
  );
}

function TechnologyScreen({
  language,
  technologyLevels,
  researchJob,
  researchRemainingSeconds,
  researchTimeFactor,
  resourceAmounts,
  inventoryItems,
  inventoryLoading,
  inventoryActionLoadingId,
  onLaunchResearch,
  onUseBoost
}: {
  language: UILanguage;
  technologyLevels: Record<TechnologyId, number>;
  researchJob: ResearchJob | null;
  researchRemainingSeconds: number;
  researchTimeFactor: number;
  resourceAmounts: Record<string, number>;
  inventoryItems: InventoryViewItem[];
  inventoryLoading: boolean;
  inventoryActionLoadingId: string;
  onLaunchResearch: (techId: TechnologyId) => void;
  onUseBoost: (itemId: string, quantity?: number, targetOverride?: "auto" | "building" | "hangar" | "research_local", queueId?: string) => void;
}) {
  const l = (fr: string, en: string) => (language === "en" ? en : fr);
  const [boostItemId, setBoostItemId] = useState("");
  const [boostQuantityInput, setBoostQuantityInput] = useState("1");
  const categories: Array<{ id: TechnologyCategory; title: string }> = [
    { id: "eco", title: l("Technologies Economiques", "Economic Tech") },
    { id: "military", title: l("Technologies Militaires", "Military Tech") },
    { id: "defense", title: l("Technologies Defensives", "Defensive Tech") },
    { id: "unlock", title: l("Deblocages Vaisseaux", "Ship Unlocks") },
    { id: "energy", title: l("Technologies Energetiques", "Energy Tech") },
    { id: "strategy", title: l("Technologies Strategiques", "Strategic Tech") }
  ];
  const activeTech = researchJob ? TECHNOLOGY_BY_ID[researchJob.technologyId] : null;
  const boostItems = useMemo(
    () =>
      inventoryItems
        .filter((item) => item.category === "TIME_BOOST" && (item.durationSeconds ?? 0) > 0 && item.quantity > 0)
        .sort((a, b) => (a.durationSeconds ?? 0) - (b.durationSeconds ?? 0)),
    [inventoryItems]
  );
  const selectedBoost = boostItems.find((item) => item.id === boostItemId) ?? (boostItems.length > 0 ? boostItems[0] : null);
  const requestedBoostQuantity = Math.max(1, Math.floor(Number(boostQuantityInput) || 1));
  const effectiveBoostQuantity = selectedBoost ? Math.min(requestedBoostQuantity, selectedBoost.quantity) : 0;
  const boostLoading = Boolean(selectedBoost) && inventoryActionLoadingId === selectedBoost.id;
  const canUseBoost = Boolean(researchJob) && Boolean(selectedBoost) && effectiveBoostQuantity > 0 && !inventoryLoading && !boostLoading;
  useEffect(() => {
    if (boostItems.length === 0) {
      setBoostItemId("");
      return;
    }
    if (!boostItemId || !boostItems.some((item) => item.id === boostItemId)) {
      setBoostItemId(boostItems[0].id);
    }
  }, [boostItemId, boostItems]);

  return (
    <main className="tech-shell">
      <section className="tech-overview">
        <h2>{l("Centre de Recherche", "Research Center")}</h2>
        <p>{l("Systeme technologique scalable: cout x1.6, temps x1.5, bonus cumulatifs multiplicatifs.", "Scalable tech system: cost x1.6, time x1.5, multiplicative stacked bonuses.")}</p>
        {researchJob && activeTech ? (
          <div className="tech-active-job">
            <strong>{l("Recherche en cours", "Research in progress")}</strong>
            <span>{technologyDisplayName(activeTech.id, activeTech.name, language)} - {l("Niveau cible", "Target level")} {researchJob.targetLevel}</span>
            <em>{l("Temps restant", "Time left")}: {formatDuration(researchRemainingSeconds)}</em>
            {boostItems.length > 0 ? (
              <div className="tech-boost-row">
                <select
                  value={selectedBoost?.id ?? ""}
                  onChange={(e) => {
                    setBoostItemId(e.target.value);
                    setBoostQuantityInput("1");
                  }}
                >
                  {boostItems.map((item) => (
                    <option key={item.id} value={item.id}>
                      {formatBoostDurationLabel(item.durationSeconds ?? 0)} (x{item.quantity})
                    </option>
                  ))}
                </select>
                <input
                  type="number"
                  min={1}
                  max={selectedBoost?.quantity ?? 1}
                  value={boostQuantityInput}
                  onChange={(e) => setBoostQuantityInput(e.target.value)}
                />
                <button
                  type="button"
                  disabled={!canUseBoost}
                  onClick={() =>
                    selectedBoost
                      ? onUseBoost(selectedBoost.id, effectiveBoostQuantity, "research_local")
                      : undefined
                  }
                >
                  {boostLoading ? l("Application...", "Applying...") : l("Accelerer", "Boost")}
                </button>
              </div>
            ) : (
              <span>{l("Aucun accelerateur disponible.", "No accelerator available.")}</span>
            )}
          </div>
        ) : (
          <div className="tech-active-job idle">
            <strong>{l("Aucune recherche active", "No active research")}</strong>
            <span>{l("Selectionnez une technologie pour lancer la file de recherche.", "Select a technology to start research.")}</span>
          </div>
        )}
      </section>

      {categories.map((cat) => {
        const list = TECHNOLOGY_DEFS.filter((def) => def.category === cat.id);
        if (list.length === 0) return null;
        return (
          <section key={cat.id} className="tech-category">
            <header>
              <h3>{cat.title}</h3>
            </header>
            <div className="tech-grid">
              {list.map((def) => {
                const currentLevel = techLevelValue(technologyLevels, def.id);
                const atMax = Boolean(def.maxLevel && currentLevel >= def.maxLevel);
                const targetLevel = currentLevel + 1;
                const nextCost = technologyCostForLevel(def, targetLevel);
                const nextTime = Math.max(1, Math.floor(technologyTimeForLevel(def, targetLevel) * researchTimeFactor));
                const reqMet = technologyRequirementsMet(technologyLevels, def);
                const canPay = canAffordCost(resourceAmounts, nextCost);
                const isCurrent = researchJob?.technologyId === def.id;
                const requirementsLabel = (def.requires ?? [])
                  .map((req) => `${technologyDisplayName(req.id, TECHNOLOGY_BY_ID[req.id].name, language)} Lv.${req.level}`)
                  .join(" + ");
                const disabled = atMax || !reqMet || !canPay || Boolean(researchJob);
                return (
                  <article key={def.id} className={`tech-card ${isCurrent ? "active" : ""}`}>
                    <div className="tech-card-head">
                      <strong>{technologyDisplayName(def.id, def.name, language)}</strong>
                      <span>Lv.{currentLevel}{def.maxLevel ? `/${def.maxLevel}` : ""}</span>
                    </div>
                    <p className="tech-desc">{technologyDisplayDescription(def.id, def.description, language)}</p>
                    {technologyDisplayEffect(def.id, def.effectPerLevel, language) ? (
                      <p className="tech-effect">{technologyDisplayEffect(def.id, def.effectPerLevel, language)}</p>
                    ) : null}
                    {!reqMet && requirementsLabel ? (
                      <p className="tech-req">{l("Requis", "Requires")}: {requirementsLabel}</p>
                    ) : null}
                    {!atMax ? (
                      <>
                        <div className="tech-cost">
                          <span className="tech-cost-label">{l("Cout niv. suivant", "Next level cost")}:</span>
                          <ResourceCostDisplay cost={nextCost} available={resourceAmounts} language={language} compact />
                        </div>
                        <p className="tech-time">{l("Temps niv. suivant", "Next level time")}: {formatDuration(nextTime)}</p>
                      </>
                    ) : (
                      <p className="tech-max">{l("Niveau maximum atteint", "Max level reached")}</p>
                    )}
                    <button
                      type="button"
                      className="tech-launch-btn"
                      disabled={disabled}
                      onClick={() => onLaunchResearch(def.id)}
                    >
                      {isCurrent
                        ? l("En recherche...", "Researching...")
                        : atMax
                          ? l("Max", "Max")
                          : !reqMet
                            ? l("Prerequis manquants", "Missing requirements")
                            : !canPay
                              ? l("Ressources insuffisantes", "Not enough resources")
                              : researchJob
                                ? l("File de recherche occupee", "Research slot busy")
                                : l("Lancer la recherche", "Start research")}
                    </button>
                  </article>
                );
              })}
            </div>
          </section>
        );
      })}
    </main>
  );
}

function WikiScreen({ language }: { language: UILanguage }) {
  const l = (fr: string, en: string) => (language === "en" ? en : fr);
  const [tutorialTrack, setTutorialTrack] = useState<"start" | "hour1" | "pitfalls">("start");
  const [buildingPhase, setBuildingPhase] = useState<"early" | "mid" | "late">("early");
  const [militaryPhase, setMilitaryPhase] = useState<"light" | "mid" | "heavy">("light");
  const [techPhase, setTechPhase] = useState<"base" | "advanced" | "endgame">("base");

  const buildingRows = useMemo(
    () =>
      RESOURCE_DEFS.map((res) => {
        const roomType = res.id as RoomType;
        const baseCost = BASE_BUILDING_RESOURCE_COSTS[roomType] ?? {};
        const baseTimeSec = ROOM_CONFIG[roomType]?.buildSecondsBase ?? 0;
        const baseProdSec = RESOURCE_BASE_PRODUCTION[res.id as ResourceId] ?? 0;
        return {
          ...res,
          name: resourceDisplayName(res.id, language),
          machine: resourceMachineDisplay(res.id, language),
          roomType,
          baseCost,
          baseTimeSec,
          baseProdSec
        };
      }),
    [language]
  );

  const ships = useMemo(
    () =>
      HANGAR_UNIT_DEFS
        .filter((unit) => unit.category === "ship")
        .map((unit) => ({ ...unit, name: hangarUnitDisplayName(unit.id, unit.name, language) })),
    [language]
  );
  const defenses = useMemo(
    () =>
      HANGAR_UNIT_DEFS
        .filter((unit) => unit.category === "defense")
        .map((unit) => ({ ...unit, name: hangarUnitDisplayName(unit.id, unit.name, language) })),
    [language]
  );
  const techRows = useMemo(
    () =>
      TECHNOLOGY_DEFS.map((tech) => ({
        ...tech,
        name: technologyDisplayName(tech.id, tech.name, language),
        description: technologyDisplayDescription(tech.id, tech.description, language),
        effectPerLevel: technologyDisplayEffect(tech.id, tech.effectPerLevel, language)
      })),
    [language]
  );

  const formatWikiCost = (cost: ResourceCost) => {
    const keys = Object.keys(cost) as ResourceId[];
    if (keys.length === 0) return "-";
    return keys.map((key) => `${(cost[key] ?? 0).toLocaleString()} ${resourceDisplayName(key, language)}`).join(" + ");
  };

  const tabDescription =
    buildingPhase === "early"
      ? l(
          "Phase initiale: priorite sur Carbone, Titane, Entrepot et cadence de construction.",
          "Early phase: prioritize Carbon, Titanium, Warehouse capacity, and build cadence."
        )
      : buildingPhase === "mid"
        ? l(
            "Phase intermediaire: expansion Osmium/Adamantium et stabilisation des reserves.",
            "Mid phase: expand Osmium/Adamantium and stabilize reserves."
          )
        : l(
            "Phase avancee: ressources de recherche et optimisation intensive via technologies.",
            "Late phase: scale research resources and optimize aggressively through technology."
          );

  const militaryDescription =
    militaryPhase === "light"
      ? l(
          "Combat leger: reconnaissance, pression rapide et interception logistique.",
          "Light combat: scouting, rapid pressure, and logistics interception."
        )
      : militaryPhase === "mid"
        ? l(
            "Combat moyen: flottes polyvalentes et defenses de maintien orbital.",
            "Mid combat: versatile fleets with sustained orbital defense."
          )
        : l(
            "Combat lourd: attrition longue, percee capitale et verrouillage orbital.",
            "Heavy combat: long attrition, capital breakthrough, and orbital lockdown."
          );

  const techDescription =
    techPhase === "base"
      ? l(
          "Technologies de base: acceleration economique et debloquages initiaux.",
          "Base technologies: economic acceleration and initial unlocks."
        )
      : techPhase === "advanced"
        ? l(
            "Technologies avancees: puissance militaire, defense et efficience energetique.",
            "Advanced technologies: military strength, defense scaling, and energy efficiency."
          )
        : l(
            "Technologies endgame: commandement, modules et optimisation strategique de haut niveau.",
          "Endgame technologies: command systems, modules, and high-level strategic optimization."
        );

  const tutorialCards = tutorialTrack === "start"
    ? [
        {
          id: "t_start_1",
          title: l("1. Stabiliser l'economie", "1. Stabilize economy"),
          text: l(
            "Montez Raffinerie de Carbone et Fabrique de Titane rapidement, puis posez un Entrepot pour eviter le blocage de production.",
            "Level up Carbon Refinery and Titanium Factory quickly, then build a Warehouse to avoid production cap lock."
          )
        },
        {
          id: "t_start_2",
          title: l("2. Garder la file active", "2. Keep queue active"),
          text: l(
            "Ne laissez jamais la file batiment vide. Meme une amelioration mineure vaut mieux qu'une file inactive.",
            "Never leave the building queue idle. Even a minor upgrade is better than an empty queue."
          )
        },
        {
          id: "t_start_3",
          title: l("3. Debloquer la chaine", "3. Unlock the chain"),
          text: l(
            "Visez Osmium puis Adamantium. Ces ressources ouvrent le mid game militaire et les technologies cle.",
            "Rush Osmium then Adamantium. These resources unlock military mid game and key technologies."
          )
        }
      ]
    : tutorialTrack === "hour1"
      ? [
          {
            id: "t_h1_1",
            title: l("Minute 0-15", "Minute 0-15"),
            text: l(
              "Optimisez Carbone/Titane, lancez vos premieres ameliorations et gardez le zoom sur le quadrillage pour enchaîner.",
              "Optimize Carbon/Titanium, start first upgrades, and stay focused on the grid to chain actions."
            )
          },
          {
            id: "t_h1_2",
            title: l("Minute 15-35", "Minute 15-35"),
            text: l(
              "Posez Entrepot, preparez Osmium, puis surveillez la barre de ressources en haut pour eviter les caps.",
              "Build Warehouse, prepare Osmium, and monitor top resource bar to avoid hitting caps."
            )
          },
          {
            id: "t_h1_3",
            title: l("Minute 35-60", "Minute 35-60"),
            text: l(
              "Lancez la premiere techno eco, ouvrez le Hangar, et preparez une composition legere pour la carte.",
              "Start first eco tech, open Hangar, and prepare a light composition for map operations."
            )
          }
        ]
      : [
          {
            id: "t_pit_1",
            title: l("Erreur: stock plein", "Mistake: storage full"),
            text: l(
              "Si la ressource atteint le cap, la production stoppe. Montez Entrepot avant d'enchainer des boosts.",
              "If a resource reaches cap, production stops. Upgrade Warehouse before chaining boosts."
            )
          },
          {
            id: "t_pit_2",
            title: l("Erreur: tech sans eco", "Mistake: tech before economy"),
            text: l(
              "Monter des technos trop tot ralentit tout. Priorisez production et file batiment active.",
              "Rushing tech too early slows everything down. Prioritize production and active building queue."
            )
          },
          {
            id: "t_pit_3",
            title: l("Erreur: flotte non specialisee", "Mistake: unspecialized fleet"),
            text: l(
              "Mixez reconnaissance, attaque et transport selon objectif. Une flotte unique est facile a contrer.",
              "Mix scouting, attack, and transport by objective. A single-type fleet is easy to counter."
            )
          }
        ];

  const tutorialChecklist = tutorialTrack === "start"
    ? [
        l("Ameliorer Carbone et Titane au moins niveau 3.", "Upgrade Carbon and Titanium to at least level 3."),
        l("Construire Entrepot Orbital niveau 1.", "Build Orbital Warehouse level 1."),
        l("Lancer une recherche economique.", "Start one economic research."),
        l("Ne jamais laisser la file batiment vide.", "Never leave the building queue idle.")
      ]
    : tutorialTrack === "hour1"
      ? [
          l("Verifier la carte et poser 1 balise utile.", "Check the map and save 1 useful bookmark."),
          l("Produire au moins 1 vaisseau de reco et 1 defense.", "Produce at least 1 scout ship and 1 defense."),
          l("Utiliser un accelerateur sur la bonne file.", "Use one accelerator on the right queue."),
          l("Verifier le ratio production/capacite.", "Check production/capacity ratio.")
        ]
      : [
          l("Eviter de depenser tous les coffres a cap plein.", "Avoid opening all chests while capped."),
          l("Ne pas ignorer les prerequis de doctrine.", "Do not ignore doctrine prerequisites."),
          l("Ne pas surinvestir militaire sans logistique.", "Do not overinvest in military without logistics."),
          l("Toujours verifier le cout du niveau suivant.", "Always check next-level cost before launch.")
        ];

  const tutorialRoadmap = [
    {
      phase: l("Session 1", "Session 1"),
      objective: l("Stabiliser l'economie de base", "Stabilize base economy"),
      actions: l(
        "Carbone/Titane niveaux 3+, Entrepot niveau 1, file batiment active.",
        "Carbon/Titanium level 3+, Warehouse level 1, active building queue."
      ),
      checkpoint: l("Aucun blocage de cap pendant 20 min.", "No storage-cap lock for 20 min.")
    },
    {
      phase: l("Session 2", "Session 2"),
      objective: l("Passer en mode expansion", "Move into expansion mode"),
      actions: l(
        "Debloquer Osmium + Adamantium, lancer 1 techno eco et 1 defense.",
        "Unlock Osmium + Adamantium, start 1 economy tech and 1 defense."
      ),
      checkpoint: l("Production multi-ressources stable.", "Stable multi-resource production.")
    },
    {
      phase: l("Session 3", "Session 3"),
      objective: l("Entrer dans le mid game", "Enter mid game"),
      actions: l(
        "Ouvrir Hangar en continu, doctrines de base, premieres operations carte.",
        "Run Hangar continuously, unlock base doctrines, launch first map operations."
      ),
      checkpoint: l("Flotte legere + defenses actives.", "Light fleet + active defenses.")
    }
  ];

  const tutorialFaq = [
    {
      q: l("Quand utiliser les accelerateurs ?", "When should I use accelerators?"),
      a: l(
        "Utilisez-les quand votre file est deja rentable (Osmium/Adamantium, techno cle, unite critique). Evitez de les depenser sur des niveaux faibles.",
        "Use them when your queue is already high value (Osmium/Adamantium, key tech, critical unit). Avoid spending them on low-value levels."
      )
    },
    {
      q: l("Pourquoi ma production s'arrete ?", "Why did my production stop?"),
      a: l(
        "Votre entrepot est plein. La production est clamp cote serveur. Montez l'Entrepot Orbital ou depensez des ressources.",
        "Your warehouse is full. Production is server-side clamped. Upgrade Orbital Warehouse or spend resources."
      )
    },
    {
      q: l("Comment progresser plus vite sans me bloquer ?", "How do I progress faster without stalling?"),
      a: l(
        "Gardez les 3 files actives (batiment, hangar, recherche), evitez les caps, et priorisez les prerequis qui debloquent les paliers suivants.",
        "Keep all 3 queues active (building, hangar, research), avoid caps, and prioritize prerequisites that unlock the next milestones."
      )
    }
  ];

  return (
    <main className="wiki-shell">
      <section className="wiki-hero">
        <h2>{l("Wiki Officiel Hyperstructure Command", "Hyperstructure Command Official Wiki")}</h2>
        <p>
          {l(
            "Reference strategique du jeu 4X: economie persistante 24/7, expansion militaire, progression technologique et domination orbitale.",
            "Strategic 4X reference: persistent 24/7 economy, military expansion, technology progression and orbital domination."
          )}
        </p>
        <div className="wiki-info-grid">
          <article className="wiki-info-card">
            <strong>{l("Economie", "Economy")}</strong>
            <span>{l("Production en continu, online/offline, serveur autoritaire.", "Continuous online/offline production, server-authoritative.")}</span>
          </article>
          <article className="wiki-info-card">
            <strong>{l("Militaire", "Military")}</strong>
            <span>{l("Flottes, defenses, ordre de tir et consommation quantique.", "Fleets, defenses, firing order and quantum consumption.")}</span>
          </article>
          <article className="wiki-info-card">
            <strong>{l("Technologies", "Technologies")}</strong>
            <span>{l("Scaling exponentiel, debloquages, bonus multiplicatifs.", "Exponential scaling, unlocks and multiplicative bonuses.")}</span>
          </article>
        </div>
      </section>

      <nav className="wiki-toc" aria-label={l("Sommaire Wiki", "Wiki table of contents")}>
        <h3>{l("Sommaire", "Contents")}</h3>
        <div className="wiki-toc-links">
          <a href="#wiki-tutoriel">{l("1. Tutoriel de progression", "1. Progression tutorial")}</a>
          <a href="#wiki-batiments">{l("2. Les Batiments", "2. Buildings")}</a>
          <a href="#wiki-population">{l("3. Population & Societe", "3. Population & Society")}</a>
          <a href="#wiki-vaisseaux">{l("4. Vaisseaux & Defenses", "4. Ships & Defenses")}</a>
          <a href="#wiki-technologies">{l("5. Les Technologies", "5. Technologies")}</a>
          <a href="#wiki-champs">{l("6. Carte & Champs de ressources", "6. Map & Resource fields")}</a>
          <a href="#wiki-inbox">{l("7. Messagerie & Recompenses", "7. Inbox & Rewards")}</a>
        </div>
      </nav>

      <section id="wiki-tutoriel" className="wiki-section">
        <header className="wiki-section-head">
          <h3>{l("1. Tutoriel de progression", "1. Progression tutorial")}</h3>
          <p>
            {l(
              "Parcours guide pour debutant: quoi faire, dans quel ordre, et comment eviter les erreurs qui ralentissent la progression.",
              "Guided beginner path: what to do, in which order, and how to avoid mistakes that slow progression."
            )}
          </p>
        </header>

        <div className="wiki-note">
          <strong>{l("Mode actif", "Active mode")}</strong>
          <span>
            {tutorialTrack === "start"
              ? l("Demarrage global", "Global kickoff")
              : tutorialTrack === "hour1"
                ? l("Plan 60 minutes", "60-minute plan")
                : l("Erreurs frequentes", "Common pitfalls")}
          </span>
        </div>

        <div className="wiki-tabs">
          <button className={tutorialTrack === "start" ? "active" : ""} onClick={() => setTutorialTrack("start")}>
            {l("Demarrage", "Start")}
          </button>
          <button className={tutorialTrack === "hour1" ? "active" : ""} onClick={() => setTutorialTrack("hour1")}>
            {l("Premiere heure", "First hour")}
          </button>
          <button className={tutorialTrack === "pitfalls" ? "active" : ""} onClick={() => setTutorialTrack("pitfalls")}>
            {l("A eviter", "Avoid")}
          </button>
        </div>

        <div className="wiki-info-grid wiki-tutorial-grid">
          {tutorialCards.map((card) => (
            <article key={card.id} className="wiki-info-card">
              <strong>{card.title}</strong>
              <span>{card.text}</span>
            </article>
          ))}
        </div>

        <article className="wiki-checklist">
          <h4>{l("Checklist immediate", "Immediate checklist")}</h4>
          <ul>
            {tutorialChecklist.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
        </article>

        <div className="wiki-table-wrap">
          <table className="wiki-table">
            <thead>
              <tr>
                <th>{l("Etape", "Stage")}</th>
                <th>{l("Objectif", "Objective")}</th>
                <th>{l("Actions cles", "Key actions")}</th>
                <th>{l("Validation", "Checkpoint")}</th>
              </tr>
            </thead>
            <tbody>
              {tutorialRoadmap.map((row) => (
                <tr key={row.phase}>
                  <td>{row.phase}</td>
                  <td>{row.objective}</td>
                  <td>{row.actions}</td>
                  <td>{row.checkpoint}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <details className="wiki-spoiler">
          <summary>{l("FAQ de progression", "Progression FAQ")}</summary>
          <div className="wiki-faq-list">
            {tutorialFaq.map((row) => (
              <article key={row.q} className="wiki-faq-item">
                <strong>{row.q}</strong>
                <span>{row.a}</span>
              </article>
            ))}
          </div>
        </details>
      </section>

      <section id="wiki-batiments" className="wiki-section">
        <header className="wiki-section-head">
          <h3>{l("2. Les Batiments", "2. Buildings")}</h3>
          <p>{l("La couche economique structure tout le gameplay: production, couts, temps, stockage.", "The economic layer structures all gameplay: production, costs, time and storage.")}</p>
        </header>

        <div className="wiki-note">
          <strong>{l("Note strategique", "Strategic note")}</strong>
          <span>{tabDescription}</span>
        </div>

        <div className="wiki-tabs">
          <button className={buildingPhase === "early" ? "active" : ""} onClick={() => setBuildingPhase("early")}>
            {l("Early game", "Early game")}
          </button>
          <button className={buildingPhase === "mid" ? "active" : ""} onClick={() => setBuildingPhase("mid")}>
            {l("Mid game", "Mid game")}
          </button>
          <button className={buildingPhase === "late" ? "active" : ""} onClick={() => setBuildingPhase("late")}>
            {l("Late game", "Late game")}
          </button>
        </div>

        <details className="wiki-spoiler">
          <summary>{l("Formules economiques (production, cout, temps, stockage)", "Economic formulas (production, cost, time, storage)")}</summary>
          <pre>
{`Production(n) = Production_base x n^1.15 x (1 + bonus_total)
Cost(n) = Cost_base x 1.55^(n - 1)
BuildTime(n) = BuildTime_base x 1.45^(n - 1)
Storage(n) = Storage_base x 1.6^(n - 1)`}
          </pre>
        </details>

        <details className="wiki-spoiler">
          <summary>{l("Scaling avance et logique serveur", "Advanced scaling and server logic")}</summary>
          <pre>
{l(
`- Calcul en float cote serveur
- Delta offline = floor(server_now - last_update)
- Clamp a la capacite entrepot pour la production
- Arrivages externes (coffres/flottes) autorises au-dessus du cap
- Affichage client arrondi`,
`- Server-side float calculations
- Offline delta = floor(server_now - last_update)
- Production clamped to warehouse capacity
- External deliveries (chests/fleets) can exceed cap
- Rounded values on client display`
)}
          </pre>
        </details>

        <h4>{l("Batiments de Construction", "Construction Buildings")}</h4>
        <div className="wiki-table-wrap">
          <table className="wiki-table">
            <thead>
              <tr>
                <th>{l("Ressource", "Resource")}</th>
                <th>{l("Rarete", "Rarity")}</th>
                <th>{l("Batiment", "Building")}</th>
                <th>{l("Prod. base/s", "Base prod/s")}</th>
                <th>{l("Cout base", "Base cost")}</th>
                <th>{l("Temps base", "Base time")}</th>
              </tr>
            </thead>
            <tbody>
              {buildingRows
                .filter((row) => row.section === "construction")
                .map((row) => (
                  <tr key={`wiki_building_${row.id}`}>
                    <td>{row.name}</td>
                    <td>{row.rarity}</td>
                    <td>{row.machine}</td>
                    <td>{row.baseProdSec.toFixed(3)}</td>
                    <td>{formatWikiCost(row.baseCost)}</td>
                    <td>{formatDuration(row.baseTimeSec)}</td>
                  </tr>
                ))}
            </tbody>
          </table>
        </div>

        <h4>{l("Batiments de Recherche", "Research Buildings")}</h4>
        <div className="wiki-table-wrap">
          <table className="wiki-table">
            <thead>
              <tr>
                <th>{l("Ressource", "Resource")}</th>
                <th>{l("Rarete", "Rarity")}</th>
                <th>{l("Batiment", "Building")}</th>
                <th>{l("Prod. base/s", "Base prod/s")}</th>
                <th>{l("Cout base", "Base cost")}</th>
                <th>{l("Temps base", "Base time")}</th>
              </tr>
            </thead>
            <tbody>
              {buildingRows
                .filter((row) => row.section === "research")
                .map((row) => (
                  <tr key={`wiki_research_building_${row.id}`}>
                    <td>{row.name}</td>
                    <td>{row.rarity}</td>
                    <td>{row.machine}</td>
                    <td>{row.baseProdSec.toFixed(3)}</td>
                    <td>{formatWikiCost(row.baseCost)}</td>
                    <td>{formatDuration(row.baseTimeSec)}</td>
                  </tr>
                ))}
            </tbody>
          </table>
        </div>
      </section>

      <section id="wiki-population" className="wiki-section">
        <header className="wiki-section-head">
          <h3>{l("3. Population & Societe", "3. Population & Society")}</h3>
          <p>
            {l(
              "La population pilote production, construction, recherche et stabilite. C'est une couche strategique majeure du jeu.",
              "Population drives production, construction, research, and stability. It is a major strategic layer."
            )}
          </p>
        </header>

        <div className="wiki-note">
          <strong>{l("Principe cle", "Key principle")}</strong>
          <span>
            {l(
              "La croissance est continue, mais les bonus ne s'appliquent que si votre colonie reste stable (logement, nourriture, ordre social).",
              "Growth is continuous, but bonuses apply only if your colony stays stable (housing, food, social order)."
            )}
          </span>
        </div>

        <div className="wiki-info-grid">
          <article className="wiki-info-card">
            <strong>{l("Classes de population", "Population classes")}</strong>
            <span>
              {l(
                "Travailleurs (economie), Ingenieurs (construction), Scientifiques (recherche). La repartition evolue avec les batiments civils.",
                "Workers (economy), Engineers (construction), Scientists (research). Distribution evolves with civil buildings."
              )}
            </span>
          </article>
          <article className="wiki-info-card">
            <strong>{l("Bonus directs", "Direct bonuses")}</strong>
            <span>
              {l(
                "+1% production globale / 1000 habitants, -1% temps construction / 500 ingenieurs, +1% vitesse recherche / 300 scientifiques.",
                "+1% global production / 1000 population, -1% construction time / 500 engineers, +1% research speed / 300 scientists."
              )}
            </span>
          </article>
          <article className="wiki-info-card">
            <strong>{l("Contraintes", "Constraints")}</strong>
            <span>
              {l(
                "Surpopulation = -25% production. Famine = croissance stop + chute de stabilite. Crises sociales possibles en stabilite basse.",
                "Overcapacity = -25% production. Famine = growth halt + stability drop. Social crises can occur at low stability."
              )}
            </span>
          </article>
        </div>

        <h4>{l("Variables et formules principales", "Core variables and formulas")}</h4>
        <div className="wiki-table-wrap">
          <table className="wiki-table">
            <thead>
              <tr>
                <th>{l("Variable", "Variable")}</th>
                <th>{l("Description", "Description")}</th>
                <th>{l("Regle / Formule", "Rule / Formula")}</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>{l("Population totale", "Total population")}</td>
                <td>{l("Habitants actifs de la colonie", "Active colony inhabitants")}</td>
                <td>{l("Base persistante + croissance horaire", "Persistent base + hourly growth")}</td>
              </tr>
              <tr>
                <td>{l("Capacite habitation", "Housing capacity")}</td>
                <td>{l("Plafond avant surpopulation", "Ceiling before overcapacity")}</td>
                <td>{l("Base 500 + bonus batiments civils", "Base 500 + civil building bonuses")}</td>
              </tr>
              <tr>
                <td>{l("Croissance", "Growth")}</td>
                <td>{l("Augmentation naturelle", "Natural increase")}</td>
                <td>{l("population x 0.004 / h + migration", "population x 0.004 / h + migration")}</td>
              </tr>
              <tr>
                <td>{l("Nourriture", "Food")}</td>
                <td>{l("Reserve de soutien", "Support reserve")}</td>
                <td>{l("Conso = population/h, prod via cantines", "Consumption = population/h, production via canteens")}</td>
              </tr>
              <tr>
                <td>{l("Stabilite", "Stability")}</td>
                <td>{l("Ordre social (0-100)", "Social order (0-100)")}</td>
                <td>{l("Influe directement la production et les crises", "Directly impacts production and crises")}</td>
              </tr>
            </tbody>
          </table>
        </div>

        <details className="wiki-spoiler">
          <summary>{l("Formules detaillees (version gameplay)", "Detailed formulas (gameplay version)")}</summary>
          <pre>
{l(
`Croissance_base/h = population x 0.004
Migration/h = population x attractivite
Croissance_finale/h = 0 si famine OU surpopulation
sinon Croissance_base x modificateurs + Migration

Bonus_prod_population = floor(population / 1000) x 1%
Bonus_construction = floor(ingenieurs / 500) x 1%
Bonus_recherche = floor(scientifiques / 300) x 1%

Surpopulation -> -25% production
Famine -> croissance stop + choc de stabilite
Stabilite faible -> malus prod + risque de crise`,
`Base_growth/h = population x 0.004
Migration/h = population x attractiveness
Final_growth/h = 0 if famine OR overcapacity
otherwise Base_growth x modifiers + Migration

Population_prod_bonus = floor(population / 1000) x 1%
Construction_bonus = floor(engineers / 500) x 1%
Research_bonus = floor(scientists / 300) x 1%

Overcapacity -> -25% production
Famine -> growth halt + stability shock
Low stability -> production penalties + crisis risk`
)}
          </pre>
        </details>

        <h4>{l("Repartition des classes", "Class distribution")}</h4>
        <div className="wiki-table-wrap">
          <table className="wiki-table">
            <thead>
              <tr>
                <th>{l("Classe", "Class")}</th>
                <th>{l("Ratio de base", "Base ratio")}</th>
                <th>{l("Effet principal", "Primary effect")}</th>
                <th>{l("Palier de bonus", "Bonus threshold")}</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>{l("Travailleurs", "Workers")}</td>
                <td>~70%</td>
                <td>{l("Alimentent les batiments de production", "Feed production buildings")}</td>
                <td>{l("Manque de travailleurs = rendement reduit", "Worker shortage = reduced yield")}</td>
              </tr>
              <tr>
                <td>{l("Ingenieurs", "Engineers")}</td>
                <td>~20%</td>
                <td>{l("Accelerent les constructions", "Speed up constructions")}</td>
                <td>500 {l("ingenieurs", "engineers")} = -1% {l("temps", "time")}</td>
              </tr>
              <tr>
                <td>{l("Scientifiques", "Scientists")}</td>
                <td>~10%</td>
                <td>{l("Accelerent les recherches", "Speed up research")}</td>
                <td>300 {l("scientifiques", "scientists")} = +1% {l("vitesse", "speed")}</td>
              </tr>
            </tbody>
          </table>
        </div>

        <h4>{l("Stabilite: bandes d'effet", "Stability effect bands")}</h4>
        <div className="wiki-table-wrap">
          <table className="wiki-table">
            <thead>
              <tr>
                <th>{l("Stabilite", "Stability")}</th>
                <th>{l("Etat", "State")}</th>
                <th>{l("Impact", "Impact")}</th>
              </tr>
            </thead>
            <tbody>
              <tr><td>90+</td><td>{l("Excellent", "Excellent")}</td><td>{l("Bonus de production", "Production bonus")}</td></tr>
              <tr><td>70-89</td><td>{l("Stable", "Stable")}</td><td>{l("Regime normal", "Normal regime")}</td></tr>
              <tr><td>50-69</td><td>{l("Fragile", "Fragile")}</td><td>{l("Malus legers", "Light penalties")}</td></tr>
              <tr><td>30-49</td><td>{l("Troubles", "Unrest")}</td><td>{l("Malus forts + risque crise", "Strong penalties + crisis risk")}</td></tr>
              <tr><td>&lt;30</td><td>{l("Revolte", "Revolt")}</td><td>{l("Impact severe sur l'economie", "Severe economic impact")}</td></tr>
            </tbody>
          </table>
        </div>

        <h4>{l("Main d'oeuvre et equipages", "Workforce and crews")}</h4>
        <div className="wiki-table-wrap">
          <table className="wiki-table">
            <thead>
              <tr>
                <th>{l("Bloc", "Block")}</th>
                <th>{l("Exigence niveau 1", "Level 1 requirement")}</th>
                <th>{l("Detail", "Detail")}</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>{l("Raffinerie Carbone", "Carbon Refinery")}</td>
                <td>50</td>
                <td>{l("Le besoin augmente avec les niveaux", "Requirement scales with levels")}</td>
              </tr>
              <tr>
                <td>{l("Fabrique Titane", "Titanium Factory")}</td>
                <td>60</td>
                <td>{l("Le besoin augmente avec les niveaux", "Requirement scales with levels")}</td>
              </tr>
              <tr>
                <td>{l("Compacteur Osmium", "Osmium Compactor")}</td>
                <td>80</td>
                <td>{l("Le besoin augmente avec les niveaux", "Requirement scales with levels")}</td>
              </tr>
              <tr>
                <td>{l("Synchrotron Adamantium", "Adamantium Synchrotron")}</td>
                <td>120</td>
                <td>{l("Le besoin augmente avec les niveaux", "Requirement scales with levels")}</td>
              </tr>
              <tr>
                <td>{l("Vaisseaux (equipage)", "Ships (crew)")}</td>
                <td>{l("Variable selon unite", "Varies by unit")}</td>
                <td>{l("Ex: Eclaireur 5, Titanide 30, Colosse 80", "Ex: Scout 5, Titanid 30, Colossus 80")}</td>
              </tr>
            </tbody>
          </table>
        </div>

        <h4>{l("Batiments civils de population", "Civil population buildings")}</h4>
        <div className="wiki-table-wrap">
          <table className="wiki-table">
            <thead>
              <tr>
                <th>{l("Batiment", "Building")}</th>
                <th>{l("Deblocage", "Unlock")}</th>
                <th>{l("Role", "Role")}</th>
              </tr>
            </thead>
            <tbody>
              <tr><td>{l("Quartiers residentiels", "Residential Quarters")}</td><td>0</td><td>{l("+capacite habitation, +stabilite", "+housing capacity, +stability")}</td></tr>
              <tr><td>{l("Cantine hydroponique", "Hydroponic Canteen")}</td><td>0</td><td>{l("+production nourriture", "+food production")}</td></tr>
              <tr><td>{l("Centre medical", "Medical Center")}</td><td>500</td><td>{l("+croissance, +sante, +stabilite", "+growth, +health, +stability")}</td></tr>
              <tr><td>{l("Parc orbital", "Orbital Park")}</td><td>500</td><td>{l("+loisirs, +stabilite", "+leisure, +stability")}</td></tr>
              <tr><td>{l("Academie technique", "Technical Academy")}</td><td>2000</td><td>{l("+part Ingenieurs", "+Engineer share")}</td></tr>
              <tr><td>{l("Universite orbitale", "Orbital University")}</td><td>8000</td><td>{l("+part Scientifiques", "+Scientist share")}</td></tr>
            </tbody>
          </table>
        </div>

        <h4>{l("Exemples concrets", "Concrete examples")}</h4>
        <div className="wiki-table-wrap">
          <table className="wiki-table">
            <thead>
              <tr>
                <th>{l("Situation", "Situation")}</th>
                <th>{l("Calcul", "Calculation")}</th>
                <th>{l("Resultat", "Result")}</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>{l("Population 12 450", "Population 12,450")}</td>
                <td>floor(12 450 / 1000) = 12</td>
                <td>{l("+12% production globale", "+12% global production")}</td>
              </tr>
              <tr>
                <td>{l("Ingenieurs 2 500", "Engineers 2,500")}</td>
                <td>floor(2 500 / 500) = 5</td>
                <td>{l("-5% temps de construction", "-5% construction time")}</td>
              </tr>
              <tr>
                <td>{l("Scientifiques 1 350", "Scientists 1,350")}</td>
                <td>floor(1 350 / 300) = 4</td>
                <td>{l("+4% vitesse de recherche", "+4% research speed")}</td>
              </tr>
              <tr>
                <td>{l("Croissance brute a 12 450 hab.", "Base growth at 12,450 pop")}</td>
                <td>12 450 x 0.004 = 49.8 /h</td>
                <td>{l("~50 habitants/h avant modifs", "~50 pop/h before modifiers")}</td>
              </tr>
            </tbody>
          </table>
        </div>

        <details className="wiki-spoiler">
          <summary>{l("FAQ population", "Population FAQ")}</summary>
          <div className="wiki-faq-list">
            <article className="wiki-faq-item">
              <strong>{l("Pourquoi ma population ne monte plus ?", "Why did my population stop growing?")}</strong>
              <span>{l("Cause principale: famine ou surpopulation. Verifiez nourriture et capacite habitation.", "Main causes: famine or overcapacity. Check food and housing capacity.")}</span>
            </article>
            <article className="wiki-faq-item">
              <strong>{l("Pourquoi ma production baisse alors que mes batiments montent ?", "Why is production lower while my buildings level up?")}</strong>
              <span>{l("Souvent manque de travailleurs, stabilite faible, ou crise sociale active.", "Usually worker shortage, low stability, or an active social crisis.")}</span>
            </article>
            <article className="wiki-faq-item">
              <strong>{l("Comment debloquer les batiments de population avances ?", "How do I unlock advanced population buildings?")}</strong>
              <span>{l("Atteignez les paliers de population (500, 2000, 8000) et maintenez une colonie stable.", "Reach population thresholds (500, 2,000, 8,000) and keep colony stability high.")}</span>
            </article>
          </div>
        </details>
      </section>

      <section id="wiki-vaisseaux" className="wiki-section">
        <header className="wiki-section-head">
          <h3>{l("4. Vaisseaux & Defenses", "4. Ships & Defenses")}</h3>
          <p>{l("Le systeme militaire combine puissance brute, endurance, vitesse, capacite et energie quantique.", "The military system combines raw power, endurance, speed, capacity and quantum energy.")}</p>
        </header>

        <div className="wiki-note">
          <strong>{l("Note strategique", "Strategic note")}</strong>
          <span>{militaryDescription}</span>
        </div>

        <div className="wiki-tabs">
          <button className={militaryPhase === "light" ? "active" : ""} onClick={() => setMilitaryPhase("light")}>
            {l("Combat leger", "Light combat")}
          </button>
          <button className={militaryPhase === "mid" ? "active" : ""} onClick={() => setMilitaryPhase("mid")}>
            {l("Combat moyen", "Mid combat")}
          </button>
          <button className={militaryPhase === "heavy" ? "active" : ""} onClick={() => setMilitaryPhase("heavy")}>
            {l("Combat lourd", "Heavy combat")}
          </button>
        </div>

        <details className="wiki-spoiler">
          <summary>{l("Formules de combat simplifiees", "Simplified combat formulas")}</summary>
          <pre>
{l(
`1) Tri des unites par vitesse
2) Tir: degats = force x random(0.9 -> 1.1) - endurance_cible
3) Clamp degats >= 0
4) Application simultanee des cycles
5) Consommation d'energie quantique selon distance et composition`,
`1) Sort units by speed
2) Shot: damage = force x random(0.9 -> 1.1) - target_endurance
3) Clamp damage >= 0
4) Apply cycles simultaneously
5) Consume quantum energy based on distance and fleet composition`
)}
          </pre>
        </details>

        <h4>{l("Vaisseaux", "Ships")}</h4>
        <div className="wiki-table-wrap">
          <table className="wiki-table">
            <thead>
              <tr>
                <th>{l("Nom", "Name")}</th>
                <th>{l("Force", "Force")}</th>
                <th>{l("Endurance", "Endurance")}</th>
                <th>{l("Vitesse", "Speed")}</th>
                <th>{l("Capacite", "Capacity")}</th>
                <th>{l("Energie/h", "Energy/h")}</th>
                <th>{l("Cout", "Cost")}</th>
              </tr>
            </thead>
            <tbody>
              {ships.map((ship) => (
                <tr key={`wiki_ship_${ship.id}`}>
                  <td>{ship.name}</td>
                  <td>{ship.force}</td>
                  <td>{ship.endurance}</td>
                  <td>{ship.speed ?? "-"}</td>
                  <td>{ship.capacity ?? "-"}</td>
                  <td>{ship.quantumPerHour ?? "-"}</td>
                  <td>{formatWikiCost(ship.cost)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <h4>{l("Defenses planetaires", "Planetary Defenses")}</h4>
        <div className="wiki-table-wrap">
          <table className="wiki-table">
            <thead>
              <tr>
                <th>{l("Nom", "Name")}</th>
                <th>{l("Force", "Force")}</th>
                <th>{l("Endurance", "Endurance")}</th>
                <th>{l("Portee", "Range")}</th>
                <th>{l("Recharge", "Reload")}</th>
                <th>{l("Cout", "Cost")}</th>
              </tr>
            </thead>
            <tbody>
              {defenses.map((defense) => (
                <tr key={`wiki_defense_${defense.id}`}>
                  <td>{defense.name}</td>
                  <td>{defense.force}</td>
                  <td>{defense.endurance}</td>
                  <td>{defense.range ?? "-"}</td>
                  <td>{defense.reload ?? "-"}</td>
                  <td>{formatWikiCost(defense.cost)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <section id="wiki-technologies" className="wiki-section">
        <header className="wiki-section-head">
          <h3>{l("5. Les Technologies", "5. Technologies")}</h3>
          <p>{l("Progression scientifique a croissance exponentielle: economie, combat, defense, commandement et energie.", "Exponential scientific progression: economy, combat, defense, command and energy.")}</p>
        </header>

        <div className="wiki-note">
          <strong>{l("Note strategique", "Strategic note")}</strong>
          <span>{techDescription}</span>
        </div>

        <div className="wiki-tabs">
          <button className={techPhase === "base" ? "active" : ""} onClick={() => setTechPhase("base")}>
            {l("Technologies de base", "Base technologies")}
          </button>
          <button className={techPhase === "advanced" ? "active" : ""} onClick={() => setTechPhase("advanced")}>
            {l("Technologies avancees", "Advanced technologies")}
          </button>
          <button className={techPhase === "endgame" ? "active" : ""} onClick={() => setTechPhase("endgame")}>
            {l("Technologies endgame", "Endgame technologies")}
          </button>
        </div>

        <details className="wiki-spoiler">
          <summary>{l("Formules de recherche", "Research formulas")}</summary>
          <pre>
{l(
`TechCost(n) = TechCost_base x 1.6^(n - 1)
TechTime(n) = TechTime_base x 1.5^(n - 1)
Les bonus se cumulent multiplicativement`,
`TechCost(n) = TechCost_base x 1.6^(n - 1)
TechTime(n) = TechTime_base x 1.5^(n - 1)
Bonuses stack multiplicatively`
)}
          </pre>
        </details>

        <div className="wiki-table-wrap">
          <table className="wiki-table">
            <thead>
              <tr>
                <th>{l("Technologie", "Technology")}</th>
                <th>{l("Categorie", "Category")}</th>
                <th>{l("Effet", "Effect")}</th>
                <th>{l("Niv. max", "Max lvl")}</th>
                <th>{l("Cout base", "Base cost")}</th>
                <th>{l("Temps base", "Base time")}</th>
              </tr>
            </thead>
            <tbody>
              {techRows
                .filter((tech) => {
                  if (techPhase === "base") return tech.category === "eco" || tech.category === "unlock";
                  if (techPhase === "advanced") return tech.category === "military" || tech.category === "defense" || tech.category === "energy";
                  return tech.category === "strategy" || tech.id === "architecture_capitale" || tech.id === "stabilisation_singulite";
                })
                .map((tech) => (
                  <tr key={`wiki_tech_${tech.id}`}>
                    <td>{tech.name}</td>
                    <td>{tech.category}</td>
                    <td>{tech.effectPerLevel ?? tech.description}</td>
                    <td>{tech.maxLevel ?? l("Illimite", "Unlimited")}</td>
                    <td>{formatWikiCost(tech.baseCost)}</td>
                    <td>{formatDuration(tech.baseTimeSec)}</td>
                  </tr>
                ))}
            </tbody>
          </table>
        </div>
      </section>

      <section id="wiki-champs" className="wiki-section">
        <header className="wiki-section-head">
          <h3>{l("6. Carte & Champs de ressources", "6. Map & Resource fields")}</h3>
          <p>
            {l(
              "Les champs de ressources ajoutent une economie opportuniste: trajet court, exploitation longue, risque PvP et gains differes au retour.",
              "Resource fields add an opportunistic economy: short travel, long extraction, PvP risk, and delayed rewards on return."
            )}
          </p>
        </header>

        <div className="wiki-note">
          <strong>{l("Boucle de gameplay", "Gameplay loop")}</strong>
          <span>
            {l(
              "Reperez un champ -> envoyez une flotte -> extrayez progressivement -> revenez avec ressources + bonus d'items.",
              "Find a field -> send a fleet -> extract progressively -> return with resources + bonus items."
            )}
          </span>
        </div>

        <div className="wiki-info-grid">
          <article className="wiki-info-card">
            <strong>{l("Spawn dynamique", "Dynamic spawn")}</strong>
            <span>
              {l(
                "Chaque champ a une rarete, une qualite et 1 a 4 ressources. Les positions evitent le chevauchement avec planetes et autres champs.",
                "Each field has a rarity, a quality tier, and 1 to 4 resources. Positions avoid overlaps with planets and other fields."
              )}
            </span>
          </article>
          <article className="wiki-info-card">
            <strong>{l("Exploitation en 3 phases", "3-phase extraction")}</strong>
            <span>
              {l(
                "Aller, extraction sur site, puis retour. Les ressources ne sont creditees qu'au retour de la flotte.",
                "Outbound, on-site extraction, then return. Resources are credited only when the fleet returns."
              )}
            </span>
          </article>
          <article className="wiki-info-card">
            <strong>{l("Information partielle", "Partial intel")}</strong>
            <span>
              {l(
                "Le proprietaire voit le contenu et le cumul en cours. Les rivaux voient seulement l'occupation et peuvent attaquer.",
                "The owner sees field contents and live extraction totals. Rivals only see occupancy status and can engage."
              )}
            </span>
          </article>
        </div>

        <h4>{l("Raretes de champs", "Field rarities")}</h4>
        <div className="wiki-table-wrap">
          <table className="wiki-table">
            <thead>
              <tr>
                <th>{l("Rarete", "Rarity")}</th>
                <th>{l("Probabilite", "Probability")}</th>
                <th>{l("Multiplicateur quantite", "Quantity multiplier")}</th>
                <th>{l("Types de ressources", "Resource types")}</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>{l("Commun", "Common")}</td>
                <td>45%</td>
                <td>x0.8</td>
                <td>1-2</td>
              </tr>
              <tr>
                <td>{l("Inhabituel", "Uncommon")}</td>
                <td>28%</td>
                <td>x1.0</td>
                <td>2</td>
              </tr>
              <tr>
                <td>{l("Rare", "Rare")}</td>
                <td>16%</td>
                <td>x1.25</td>
                <td>2-3</td>
              </tr>
              <tr>
                <td>{l("Epique", "Epic")}</td>
                <td>8%</td>
                <td>x1.6</td>
                <td>3</td>
              </tr>
              <tr>
                <td>{l("Legendaire", "Legendary")}</td>
                <td>2.5%</td>
                <td>x2.1</td>
                <td>3-4</td>
              </tr>
              <tr>
                <td>{l("Mythique", "Mythic")}</td>
                <td>0.5%</td>
                <td>x3.0</td>
                <td>4</td>
              </tr>
            </tbody>
          </table>
        </div>

        <h4>{l("Qualite interne du champ", "Field quality tiers")}</h4>
        <div className="wiki-table-wrap">
          <table className="wiki-table">
            <thead>
              <tr>
                <th>{l("Qualite", "Quality")}</th>
                <th>{l("Multiplicateur", "Multiplier")}</th>
                <th>{l("Distribution", "Distribution")}</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>{l("Pauvre", "Poor")}</td>
                <td>x0.70</td>
                <td>20%</td>
              </tr>
              <tr>
                <td>{l("Standard", "Standard")}</td>
                <td>x1.00</td>
                <td>50%</td>
              </tr>
              <tr>
                <td>{l("Riche", "Rich")}</td>
                <td>x1.40</td>
                <td>25%</td>
              </tr>
              <tr>
                <td>{l("Exceptionnel", "Exceptional")}</td>
                <td>x2.00</td>
                <td>5%</td>
              </tr>
            </tbody>
          </table>
        </div>

        <article className="wiki-checklist">
          <h4>{l("Procedure recommandee", "Recommended procedure")}</h4>
          <ul>
            <li>{l("1) Ouvrir la carte puis cibler un champ avec un trajet court.", "1) Open the map and pick a field with short travel.")}</li>
            <li>{l("2) Composer une flotte avec capacite transport + harvest speed suffisantes.", "2) Build a fleet with enough transport capacity + harvest speed.")}</li>
            <li>{l("3) Lancer la collecte depuis la fenetre du champ.", "3) Start collection from the field popup.")}</li>
            <li>{l("4) Surveiller la section Flottes en vol et le cumul visible sur le champ.", "4) Monitor In-flight fleets and live extraction shown on the field.")}</li>
            <li>{l("5) Rappeler la flotte si risque militaire ou capacite atteinte.", "5) Recall early if military risk is high or cargo is near full.")}</li>
            <li>{l("6) Recuperer les gains a l'arrivee via la messagerie de recompenses.", "6) Claim return gains through reward inbox messages.")}</li>
          </ul>
        </article>

        <details className="wiki-spoiler">
          <summary>{l("Formules de trajet/extraction", "Travel/extraction formulas")}</summary>
          <pre>
{`travelTime = max(120s, distance / fleetMapSpeed)
extractionTime = clamp(totalWork / totalHarvestSpeed, 3600s, 7200s)
collectedRatio = exploitedSeconds / extractionTime
collectedAmount = fieldAmount * collectedRatio
returnedAmount = min(collectedAmount, fleetTransportCapacity)`}
          </pre>
        </details>

        <h4>{l("Guide de composition de flotte de recolte", "Harvest fleet composition guide")}</h4>
        <div className="wiki-table-wrap">
          <table className="wiki-table">
            <thead>
              <tr>
                <th>{l("Profil", "Profile")}</th>
                <th>{l("Composition type", "Typical composition")}</th>
                <th>{l("Objectif", "Objective")}</th>
                <th>{l("Quand l'utiliser", "When to use it")}</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>{l("Eco securisee", "Safe economy")}</td>
                <td>
                  {l(
                    "Argo majoritaires + Pegase en support + 1-2 escadres d'escorte.",
                    "Argo majority + Pegase support + 1-2 escort squads."
                  )}
                </td>
                <td>
                  {l(
                    "Maximiser la capacite de retour avec un risque militaire modere.",
                    "Maximize return cargo with moderate military risk."
                  )}
                </td>
                <td>{l("Zones calmes ou heures creuses.", "Quiet zones or low-activity hours.")}</td>
              </tr>
              <tr>
                <td>{l("Collecte rapide", "Fast collection")}</td>
                <td>
                  {l(
                    "Pegase + Eclaireur Stellaire + petite escorte mobile.",
                    "Pegase + Stellar Scout + small mobile escort."
                  )}
                </td>
                <td>
                  {l(
                    "Arriver vite, extraire partiellement, recall avant contre-attaque.",
                    "Arrive fast, extract partially, recall before counterattack."
                  )}
                </td>
                <td>{l("Carte contestee, priorite au tempo.", "Contested map, tempo priority.")}</td>
              </tr>
              <tr>
                <td>{l("Champ dispute", "Contested field")}</td>
                <td>
                  {l(
                    "Arche Spatiale/Argo + Spectre/Tempest + noyau lourd (Titanide/Colosse).",
                    "Space Ark/Argo + Spectre/Tempest + heavy core (Titanide/Colossus)."
                  )}
                </td>
                <td>
                  {l(
                    "Tenue de position et protection du cargo pendant l'extraction.",
                    "Hold position and protect cargo during extraction."
                  )}
                </td>
                <td>{l("Secteurs hostiles ou cibles legendaires/mythiques.", "Hostile sectors or legendary/mythic targets.")}</td>
              </tr>
              <tr>
                <td>{l("Opportuniste", "Opportunist")}</td>
                <td>
                  {l(
                    "Petite flotte mixte orientee vitesse + capacite minimale rentable.",
                    "Small mixed fleet focused on speed + minimum profitable cargo."
                  )}
                </td>
                <td>
                  {l(
                    "Prendre plusieurs champs moyens plutot qu'un gros champ risqué.",
                    "Chain multiple medium fields instead of one risky large field."
                  )}
                </td>
                <td>{l("Sessions courtes et micro-management actif.", "Short sessions with active micro-management.")}</td>
              </tr>
            </tbody>
          </table>
        </div>

        <article className="wiki-checklist">
          <h4>{l("Regles de composition", "Composition rules")}</h4>
          <ul>
            <li>{l("Toujours valider la capacite transport avant le depart.", "Always validate transport capacity before launch.")}</li>
            <li>{l("Ajuster la puissance d'escorte selon la valeur du champ.", "Scale escort strength with field value.")}</li>
            <li>{l("Ne laissez pas une flotte lente sans couverture sur un champ riche.", "Do not leave a slow fleet uncovered on a rich field.")}</li>
            <li>{l("Utiliser le rappel anticipe pour verrouiller les gains deja extraits.", "Use early recall to secure already extracted gains.")}</li>
          </ul>
        </article>

        <details className="wiki-spoiler">
          <summary>{l("FAQ avancee PvP carte", "Advanced map PvP FAQ")}</summary>
          <div className="wiki-faq-list">
            <article className="wiki-faq-item">
              <strong>{l("Quand attaquer une flotte de collecte adverse ?", "When should I attack an enemy harvest fleet?")}</strong>
              <span>
                {l(
                  "Le meilleur timing est pendant l'extraction: la flotte est immobilisee sur champ et exposee. Une victoire coupe la collecte et peut annuler ses gains.",
                  "Best timing is during extraction: the fleet is stationary on the field and exposed. A win interrupts collection and can cancel its gains."
                )}
              </span>
            </article>
            <article className="wiki-faq-item">
              <strong>{l("Comment limiter les pertes en zone hostile ?", "How do I limit losses in hostile sectors?")}</strong>
              <span>
                {l(
                  "Preferez des cycles courts: extraction partielle + retour rapide. Le rendement theorique est plus faible, mais le rendement net est souvent meilleur.",
                  "Prefer short cycles: partial extraction + fast return. Theoretical yield is lower, but net yield is often better."
                )}
              </span>
            </article>
            <article className="wiki-faq-item">
              <strong>{l("Que voient les autres joueurs sur mon champ ?", "What do other players see on my field?")}</strong>
              <span>
                {l(
                  "Ils voient qu'il est occupe et par qui, mais pas les ressources exactes ni les quantites restantes.",
                  "They see that it is occupied and by whom, but not exact resources or remaining amounts."
                )}
              </span>
            </article>
            <article className="wiki-faq-item">
              <strong>{l("Pourquoi je ne recois pas les ressources instantanement ?", "Why don't I get resources instantly?")}</strong>
              <span>
                {l(
                  "Les ressources de champ sont creditees au retour de la flotte, via un message de recompense. C'est volontaire pour creer un vrai risque logistique.",
                  "Field resources are credited when the fleet returns, through a reward message. This is intentional to create real logistic risk."
                )}
              </span>
            </article>
            <article className="wiki-faq-item">
              <strong>{l("Cap entrepot plein: la collecte est-elle perdue ?", "Warehouse cap full: is harvesting lost?")}</strong>
              <span>
                {l(
                  "Non. Comme pour les arrivages externes, le retour de flotte peut depasser le cap de production passive.",
                  "No. As with external deliveries, fleet returns can exceed passive production cap."
                )}
              </span>
            </article>
          </div>
        </details>
      </section>

      <section id="wiki-inbox" className="wiki-section">
        <header className="wiki-section-head">
          <h3>{l("7. Messagerie & Recompenses", "7. Inbox & Rewards")}</h3>
          <p>
            {l(
              "La messagerie est persistante et separee du chat: rapports, recompenses, systeme et conversations joueurs.",
              "Inbox is persistent and separate from chat: reports, rewards, system messages, and player conversations."
            )}
          </p>
        </header>

        <div className="wiki-note">
          <strong>{l("Regle cle", "Key rule")}</strong>
          <span>
            {l(
              "Les recompenses avec pieces jointes sont generees et validees cote serveur (claim idempotent).",
              "Attachment rewards are generated and validated server-side (idempotent claim)."
            )}
          </span>
        </div>

        <h4>{l("Types de messages", "Message types")}</h4>
        <div className="wiki-table-wrap">
          <table className="wiki-table">
            <thead>
              <tr>
                <th>{l("Type", "Type")}</th>
                <th>{l("Contenu", "Content")}</th>
                <th>{l("Action", "Action")}</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>{l("Recompense", "Reward")}</td>
                <td>{l("Coffres, accelerateurs, butin de retour de flotte.", "Chests, accelerators, and fleet return loot.")}</td>
                <td>{l("Reclamer", "Claim")}</td>
              </tr>
              <tr>
                <td>{l("Combat", "Combat")}</td>
                <td>{l("Rapports de bataille et de pertes.", "Battle and loss reports.")}</td>
                <td>{l("Lire / archiver", "Read / archive")}</td>
              </tr>
              <tr>
                <td>{l("Systeme", "System")}</td>
                <td>{l("Annonces globales et evenements.", "Global announcements and events.")}</td>
                <td>{l("Lire", "Read")}</td>
              </tr>
              <tr>
                <td>{l("Joueur", "Player")}</td>
                <td>{l("Messages asynchrones regroupes par discussion.", "Asynchronous messages grouped by conversation.")}</td>
                <td>{l("Repondre", "Reply")}</td>
              </tr>
            </tbody>
          </table>
        </div>

        <h4>{l("Coffre quotidien de midi (heure serveur)", "Noon daily chest (server time)")}</h4>
        <p>
          {l(
            "Chaque jour a 12:00 serveur, un message de recompense est envoye. Le bouton Ouvrir ajoute les items directement a l'inventaire.",
            "Each day at 12:00 server time, a reward message is sent. The Open button adds items directly to inventory."
          )}
        </p>

        <div className="wiki-table-wrap">
          <table className="wiki-table">
            <thead>
              <tr>
                <th>{l("Acceleration garantie (x1)", "Guaranteed accelerator (x1)")}</th>
                <th>{l("Probabilite", "Probability")}</th>
              </tr>
            </thead>
            <tbody>
              <tr><td>{l("Faille Temporelle 1 min", "Time Rift 1 min")}</td><td>50%</td></tr>
              <tr><td>{l("Faille Temporelle 5 min", "Time Rift 5 min")}</td><td>35%</td></tr>
              <tr><td>{l("Faille Temporelle 1 h", "Time Rift 1 h")}</td><td>13%</td></tr>
              <tr><td>{l("Faille Temporelle 3 h", "Time Rift 3 h")}</td><td>1.8%</td></tr>
              <tr><td>{l("Faille Temporelle 12 h", "Time Rift 12 h")}</td><td>0.2%</td></tr>
            </tbody>
          </table>
        </div>

        <div className="wiki-table-wrap">
          <table className="wiki-table">
            <thead>
              <tr>
                <th>{l("Coffre de ressources garanti (x1)", "Guaranteed resource chest (x1)")}</th>
                <th>{l("Probabilite", "Probability")}</th>
              </tr>
            </thead>
            <tbody>
              <tr><td>{l("Classique", "Classic")}</td><td>60%</td></tr>
              <tr><td>{l("Inhabituel", "Uncommon")}</td><td>27%</td></tr>
              <tr><td>{l("Rare", "Rare")}</td><td>10%</td></tr>
              <tr><td>{l("Legendaire", "Legendary")}</td><td>2.7%</td></tr>
              <tr><td>{l("Divin", "Divine")}</td><td>0.3%</td></tr>
            </tbody>
          </table>
        </div>

        <details className="wiki-spoiler">
          <summary>{l("Regles serveur (anti-abus)", "Server rules (anti-abuse)")}</summary>
          <pre>
{l(
`- Un coffre quotidien max par joueur et par jour serveur
- Contenu genere cote serveur au moment du claim
- Claim idempotent: aucune double recompense possible
- Expiration des messages de recompense apres 72h
- +1 badge Inbox a reception, +1 badge Inventaire si item obtenu`,
`- One daily chest max per player per server day
- Content generated server-side at claim time
- Idempotent claim: no double reward possible
- Reward messages expire after 72h
- +1 Inbox badge on arrival, +1 Inventory badge when item is granted`
)}
          </pre>
        </details>
      </section>
    </main>
  );
}

function PopulationScreen({
  language,
  snapshot,
  rooms,
  resourceAmounts,
  buildingCostReductionFactor,
  buildingTimeReductionFactor,
  onNavigate
}: {
  language: UILanguage;
  snapshot: PopulationSnapshot;
  rooms: Room[];
  resourceAmounts: Record<string, number>;
  buildingCostReductionFactor: number;
  buildingTimeReductionFactor: number;
  onNavigate: (screen: UIScreen) => void;
}) {
  const l = (fr: string, en: string) => (language === "en" ? en : fr);
  const roomLevels = useMemo(() => buildRoomLevelMap(rooms), [rooms]);
  const populationFillPct = Math.max(0, Math.min(100, (snapshot.totalPopulation / Math.max(1, snapshot.capacity)) * 100));
  const foodFillPct = Math.max(0, Math.min(100, (snapshot.foodStock / Math.max(1, snapshot.foodCapacity)) * 100));
  const workforceLoadPct = Math.max(0, Math.min(100, (snapshot.requiredWorkers / Math.max(1, snapshot.workers)) * 100));
  const constructionSpeedPct = (1 / Math.max(0.01, snapshot.constructionTimeFactor) - 1) * 100;
  const researchSpeedPct = (1 / Math.max(0.01, snapshot.researchTimeFactor) - 1) * 100;

  const populationBuildingOrder: PopulationBuildingId[] = [
    "quartiers_residentiels",
    "cantine_hydroponique",
    "centre_medical",
    "parc_orbital",
    "academie_technique",
    "universite_orbitale"
  ];

  const nextPopulationUnlock = useMemo(() => {
    const rows = (Object.entries(POPULATION_BUILD_UNLOCK_MIN) as Array<[PopulationBuildingId, number]>)
      .filter(([, minPopulation]) => Number(minPopulation) > snapshot.totalPopulation)
      .sort((a, b) => a[1] - b[1]);
    if (rows.length <= 0) return null;
    const [roomType, minPopulation] = rows[0];
    return { roomType, minPopulation };
  }, [snapshot.totalPopulation]);

  const buildingRows = useMemo(() => {
    const formatPercent = (value: number) => `${value >= 0 ? "+" : ""}${(value * 100).toFixed(1)}%`;
    return populationBuildingOrder.map((roomType) => {
      const level = Math.max(0, Math.floor(Number(roomLevels[roomType] ?? 0)));
      const unlocked = isPopulationBuildingUnlocked(roomType, snapshot.totalPopulation);
      const unlockPopulation = POPULATION_BUILD_UNLOCK_MIN[roomType] ?? 0;
      const nextLevel = Math.max(1, level + 1);
      const nextCost = costForLevel(roomType, nextLevel, buildingCostReductionFactor);
      const nextTimeSec = buildSecondsForLevel(roomType, nextLevel, buildingTimeReductionFactor);
      const effects = POPULATION_BUILDING_EFFECTS[roomType] ?? {};
      const effectRows: string[] = [];
      if (effects.housingCapPerLevel) {
        effectRows.push(l(`+${Math.floor(effects.housingCapPerLevel).toLocaleString()} capacite habitation / niveau`, `+${Math.floor(effects.housingCapPerLevel).toLocaleString()} housing capacity / level`));
      }
      if (effects.foodPerHourPerLevel) {
        effectRows.push(l(`+${Math.floor(effects.foodPerHourPerLevel).toLocaleString()}/h nourriture / niveau`, `+${Math.floor(effects.foodPerHourPerLevel).toLocaleString()}/h food / level`));
      }
      if (effects.growthBonusPerLevel) {
        effectRows.push(l(`${formatPercent(effects.growthBonusPerLevel)} croissance / niveau`, `${formatPercent(effects.growthBonusPerLevel)} growth / level`));
      }
      if (effects.stabilityPerLevel) {
        effectRows.push(l(`+${effects.stabilityPerLevel.toFixed(2)} stabilite structurelle / niveau`, `+${effects.stabilityPerLevel.toFixed(2)} structural stability / level`));
      }
      if (effects.leisurePerLevel) {
        effectRows.push(l(`+${effects.leisurePerLevel.toFixed(2)} score loisirs / niveau`, `+${effects.leisurePerLevel.toFixed(2)} leisure score / level`));
      }
      if (effects.healthPerLevel) {
        effectRows.push(l(`+${effects.healthPerLevel.toFixed(2)} score sante / niveau`, `+${effects.healthPerLevel.toFixed(2)} health score / level`));
      }
      if (effects.engineerSharePerLevel) {
        effectRows.push(l(`${formatPercent(effects.engineerSharePerLevel)} part ingenieurs / niveau`, `${formatPercent(effects.engineerSharePerLevel)} engineers share / level`));
      }
      if (effects.scientistSharePerLevel) {
        effectRows.push(l(`${formatPercent(effects.scientistSharePerLevel)} part scientifiques / niveau`, `${formatPercent(effects.scientistSharePerLevel)} scientists share / level`));
      }
      return {
        roomType,
        level,
        unlocked,
        unlockPopulation,
        nextCost,
        nextTimeSec,
        effectRows
      };
    });
  }, [buildingCostReductionFactor, buildingTimeReductionFactor, language, roomLevels, snapshot.totalPopulation]);

  const adviceRows = useMemo(() => {
    const rows: Array<{
      id: string;
      tone: "good" | "warn" | "danger";
      title: string;
      text: string;
      actionLabel?: string;
      actionScreen?: UIScreen;
    }> = [];

    if (snapshot.isOverCapacity) {
      rows.push({
        id: "over_capacity",
        tone: "danger",
        title: l("Surpopulation active", "Overcapacity active"),
        text: l(
          "Votre production subit deja -25%. Priorite absolue: monter Quartiers residentiels pour augmenter la capacite.",
          "Your production already suffers -25%. Top priority: upgrade Residential Quarters to increase capacity."
        ),
        actionLabel: l("Ouvrir Jeu", "Open Game"),
        actionScreen: "game"
      });
    }

    if (snapshot.foodShortage || snapshot.foodBalancePerHour < 0) {
      rows.push({
        id: "food_shortage",
        tone: "danger",
        title: l("Nourriture critique", "Critical food"),
        text: l(
          "La croissance s'arrete et la stabilite chute. Montez Cantine hydroponique et securisez les ressources de base.",
          "Growth is halted and stability drops. Upgrade Hydroponic Canteen and secure base resources."
        ),
        actionLabel: l("Voir Ressources", "Open Resources"),
        actionScreen: "resources"
      });
    }

    if (snapshot.stability < 70) {
      rows.push({
        id: "stability_low",
        tone: "warn",
        title: l("Stabilite fragile", "Fragile stability"),
        text: l(
          "Sous 70%, des malus apparaissent. Parc orbital et Centre medical sont les leviers les plus efficaces.",
          "Below 70%, penalties apply. Orbital Park and Medical Center are your best levers."
        ),
        actionLabel: l("Aller a Jeu", "Go to Game"),
        actionScreen: "game"
      });
    }

    if (snapshot.requiredWorkers > snapshot.workers) {
      rows.push({
        id: "workers_short",
        tone: "warn",
        title: l("Main-d'oeuvre insuffisante", "Insufficient workforce"),
        text: l(
          "Vos exploitations tournent en sous-regime. Augmentez la population totale et evitez de surmultiplier les lignes de production.",
          "Your extraction lines are under-powered. Increase total population and avoid overexpanding production lines."
        ),
        actionLabel: l("Plan population", "Population plan"),
        actionScreen: "population"
      });
    }

    if (snapshot.growthPerHour <= 0) {
      rows.push({
        id: "growth_zero",
        tone: "warn",
        title: l("Croissance nulle", "Zero growth"),
        text: l(
          "Sans croissance, vous bloquez votre progression long terme. Verifiez capacite, nourriture et stabilite.",
          "Without growth, long-term progression stalls. Check capacity, food, and stability."
        ),
        actionLabel: l("Voir stats", "Review stats"),
        actionScreen: "population"
      });
    }

    if (!snapshot.isOverCapacity && !snapshot.foodShortage && snapshot.stability >= 85) {
      rows.push({
        id: "good_state",
        tone: "good",
        title: l("Etat sain", "Healthy state"),
        text: l(
          "Votre colonie est stable. Vous pouvez pousser les batiments avances (Academie, Universite) pour accelerer construction et recherche.",
          "Your colony is stable. You can push advanced buildings (Academy, University) to speed up construction and research."
        ),
        actionLabel: l("Ouvrir Technologie", "Open Technology"),
        actionScreen: "technology"
      });
    }

    if (rows.length < 3) {
      rows.push({
        id: "default_balance",
        tone: "good",
        title: l("Routine recommandee", "Recommended routine"),
        text: l(
          "Gardez un oeil sur 3 indicateurs: capacite habitation, balance nourriture, stabilite. Ajustez avant de lancer des upgrades lourds.",
          "Monitor 3 indicators: housing capacity, food balance, and stability. Adjust before launching heavy upgrades."
        ),
        actionLabel: l("Retour Jeu", "Back to Game"),
        actionScreen: "game"
      });
    }

    return rows.slice(0, 5);
  }, [language, snapshot]);

  const signedPct = (value: number) => `${value >= 0 ? "+" : ""}${value.toFixed(1)}%`;

  return (
    <main className="population-shell-page">
      <section className="population-hero">
        <div>
          <h2>{l("Centre de commandement population", "Population command center")}</h2>
          <p>
            {l(
              "Pilotez votre croissance, votre stabilite et vos bonus de production. Cette page explique chaque mecanique avec vos valeurs en direct.",
              "Control your growth, stability, and production modifiers. This page explains each mechanic with your live values."
            )}
          </p>
        </div>
        <div className="population-hero-actions">
          <button type="button" onClick={() => onNavigate("game")}>{l("Aller a Jeu", "Go to Game")}</button>
          <button type="button" onClick={() => onNavigate("resources")}>{l("Voir Ressources", "View Resources")}</button>
          <button type="button" onClick={() => onNavigate("technology")}>{l("Voir Technologie", "View Technology")}</button>
        </div>
      </section>

      <section className="population-kpi-grid-page">
        <article className="population-kpi-card">
          <small>{l("Population", "Population")}</small>
          <strong>{snapshot.totalPopulation.toLocaleString()} / {snapshot.capacity.toLocaleString()}</strong>
          <div className="population-kpi-track"><div style={{ width: `${populationFillPct}%` }} /></div>
        </article>
        <article className="population-kpi-card">
          <small>{l("Croissance totale", "Total growth")}</small>
          <strong>{snapshot.growthPerHour >= 0 ? "+" : ""}{snapshot.growthPerHour.toFixed(0)}/h</strong>
          <p>{l("Migration", "Migration")}: {snapshot.migrationPerHour >= 0 ? "+" : ""}{snapshot.migrationPerHour.toFixed(0)}/h</p>
        </article>
        <article className="population-kpi-card">
          <small>{l("Stabilite", "Stability")}</small>
          <strong>{snapshot.stability.toFixed(1)}%</strong>
          <p className={`population-band-text ${snapshot.stabilityBand}`}>
            {populationStabilityBandLabel(snapshot.stabilityBand, language)}
          </p>
        </article>
        <article className="population-kpi-card">
          <small>{l("Nourriture", "Food")}</small>
          <strong>{Math.floor(snapshot.foodStock).toLocaleString()} / {snapshot.foodCapacity.toLocaleString()}</strong>
          <div className="population-kpi-track food"><div style={{ width: `${foodFillPct}%` }} /></div>
          <p>{snapshot.foodBalancePerHour >= 0 ? "+" : ""}{snapshot.foodBalancePerHour.toFixed(0)}/h</p>
        </article>
        <article className="population-kpi-card">
          <small>{l("Main-d'oeuvre", "Workforce")}</small>
          <strong>{snapshot.requiredWorkers.toLocaleString()} / {snapshot.workers.toLocaleString()}</strong>
          <div className="population-kpi-track workforce"><div style={{ width: `${workforceLoadPct}%` }} /></div>
          <p>{l("Libre", "Free")}: {snapshot.availableWorkers.toLocaleString()}</p>
        </article>
        <article className="population-kpi-card">
          <small>{l("Niveau civilisation", "Civilization tier")}</small>
          <strong>{l(snapshot.civilizationTier.nameFr, snapshot.civilizationTier.nameEn)}</strong>
          <p>{l("Evenement", "Event")}: {snapshot.activeEvent ? populationEventLabel(snapshot.activeEvent.type, language) : l("Aucun", "None")}</p>
        </article>
      </section>

      <section className="population-main-grid">
        <article className="population-panel-card">
          <h3>{l("Bonus & malus actuels", "Current bonuses & penalties")}</h3>
          <ul className="population-impact-list">
            <li className={snapshot.productionBonusPct >= 0 ? "bonus" : "malus"}>
              {l("Production globale", "Global production")}: {signedPct(snapshot.productionBonusPct)}
            </li>
            <li className={constructionSpeedPct >= 0 ? "bonus" : "malus"}>
              {l("Vitesse construction", "Construction speed")}: {signedPct(constructionSpeedPct)}
            </li>
            <li className={researchSpeedPct >= 0 ? "bonus" : "malus"}>
              {l("Vitesse recherche", "Research speed")}: {signedPct(researchSpeedPct)}
            </li>
            <li className={snapshot.workforceMultiplier >= 1 ? "bonus" : "malus"}>
              {l("Efficacite main-d'oeuvre", "Workforce efficiency")}: {signedPct((snapshot.workforceMultiplier - 1) * 100)}
            </li>
            <li className={snapshot.foodBalancePerHour >= 0 ? "bonus" : "malus"}>
              {l("Balance nourriture", "Food balance")}: {snapshot.foodBalancePerHour >= 0 ? "+" : ""}{snapshot.foodBalancePerHour.toFixed(0)}/h
            </li>
          </ul>

          {nextPopulationUnlock ? (
            <p className="population-next-unlock">
              {l("Prochain debloquage", "Next unlock")}:{" "}
              <strong>{roomDisplayName(nextPopulationUnlock.roomType, language)}</strong>{" "}
              {l("a", "at")} {nextPopulationUnlock.minPopulation.toLocaleString()} {l("population", "population")}
            </p>
          ) : null}
        </article>

        <article className="population-panel-card">
          <h3>{l("Conseils actionnables", "Actionable guidance")}</h3>
          <div className="population-advice-stack">
            {adviceRows.map((row) => (
              <div key={row.id} className={`population-advice ${row.tone}`}>
                <strong>{row.title}</strong>
                <p>{row.text}</p>
                {row.actionLabel && row.actionScreen ? (
                  <button type="button" onClick={() => onNavigate(row.actionScreen)}>
                    {row.actionLabel}
                  </button>
                ) : null}
              </div>
            ))}
          </div>
        </article>
      </section>

      <section className="population-formula-card">
        <h3>{l("Comment fonctionne la population (didactique)", "How population works (didactic)")}</h3>
        <div className="population-formula-table-wrap">
          <table className="population-formula-table">
            <thead>
              <tr>
                <th>{l("Mecanique", "Mechanic")}</th>
                <th>{l("Regle", "Rule")}</th>
                <th>{l("Votre valeur actuelle", "Your current value")}</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>{l("Croissance naturelle", "Natural growth")}</td>
                <td>{l("Population x 0.4%/h (+ migration)", "Population x 0.4%/h (+ migration)")}</td>
                <td>{snapshot.growthPerHour >= 0 ? "+" : ""}{snapshot.growthPerHour.toFixed(0)}/h</td>
              </tr>
              <tr>
                <td>{l("Bonus production population", "Population production bonus")}</td>
                <td>{l("+1% par tranche de 1 000 habitants", "+1% per 1,000 inhabitants")}</td>
                <td>{l("Integre dans", "Included in")} {signedPct(snapshot.productionBonusPct)}</td>
              </tr>
              <tr>
                <td>{l("Ingenieurs", "Engineers")}</td>
                <td>{l("-1% temps construction / 500", "-1% construction time / 500")}</td>
                <td>{snapshot.engineers.toLocaleString()} ({signedPct(snapshot.constructionSpeedBonusPct)})</td>
              </tr>
              <tr>
                <td>{l("Scientifiques", "Scientists")}</td>
                <td>{l("+1% vitesse recherche / 300", "+1% research speed / 300")}</td>
                <td>{snapshot.scientists.toLocaleString()} ({signedPct(snapshot.researchSpeedBonusPct)})</td>
              </tr>
              <tr>
                <td>{l("Surpopulation", "Overcapacity")}</td>
                <td>{l("Si population > capacite: -25% production", "If population > capacity: -25% production")}</td>
                <td>{snapshot.isOverCapacity ? l("Actif", "Active") : l("Inactif", "Inactive")}</td>
              </tr>
              <tr>
                <td>{l("Nourriture", "Food")}</td>
                <td>{l("Si deficit: croissance arretee + malus", "If deficit: growth halted + penalties")}</td>
                <td>{snapshot.foodShortage ? l("Penurie active", "Shortage active") : l("Equilibre", "Balanced")}</td>
              </tr>
              <tr>
                <td>{l("Stabilite", "Stability")}</td>
                <td>{l("90+ bonus, 70-90 normal, <70 malus progressifs", "90+ bonus, 70-90 normal, <70 progressive penalties")}</td>
                <td>{snapshot.stability.toFixed(1)}% ({populationStabilityBandLabel(snapshot.stabilityBand, language)})</td>
              </tr>
            </tbody>
          </table>
        </div>
      </section>

      <section className="population-buildings-card">
        <h3>{l("Leviers de gestion: batiments population", "Management levers: population buildings")}</h3>
        <div className="population-building-grid">
          {buildingRows.map((row) => (
            <article key={row.roomType} className={`population-building-item ${row.unlocked ? "unlocked" : "locked"}`}>
              <header>
                <strong>{roomDisplayName(row.roomType, language)}</strong>
                <span>{l("Niveau", "Level")} {row.level}</span>
              </header>

              {!row.unlocked ? (
                <p className="population-building-lock">
                  {l("Deblocage a", "Unlock at")} {row.unlockPopulation.toLocaleString()} {l("population", "population")}
                </p>
              ) : null}

              <ul>
                {row.effectRows.length > 0 ? (
                  row.effectRows.map((effect) => <li key={`${row.roomType}_${effect}`}>{effect}</li>)
                ) : (
                  <li>{l("Effet passif de support population.", "Passive support effect for population.")}</li>
                )}
              </ul>

              <div className="population-building-cost">
                <small>{l("Cout prochain niveau", "Next level cost")}</small>
                <ResourceCostDisplay cost={row.nextCost} available={resourceAmounts} language={language} compact />
              </div>

              <p className="population-building-time">
                {l("Temps prochain niveau", "Next level time")}: {formatDuration(row.nextTimeSec)}
              </p>

              <button type="button" onClick={() => onNavigate("game")}>
                {l("Construire / ameliorer dans Jeu", "Build / upgrade in Game")}
              </button>
            </article>
          ))}
        </div>
      </section>
    </main>
  );
}

function ResourceScreen({
  language,
  amounts,
  unlockedIds,
  rates,
  populationSnapshot,
  technologyLevels,
  loading,
  error,
  offlineSeconds,
  lastSavedAt
}: {
  language: UILanguage;
  amounts: Record<string, number>;
  unlockedIds: string[];
  rates: Record<string, number>;
  populationSnapshot: PopulationSnapshot;
  technologyLevels: Record<TechnologyId, number>;
  loading: boolean;
  error: string;
  offlineSeconds: number;
  lastSavedAt: number | null;
}) {
  const l = (fr: string, en: string) => (language === "en" ? en : fr);
  const sectioned = useMemo(
    () => ({
      construction: RESOURCE_DEFS.filter((r) => r.section === "construction"),
      research: RESOURCE_DEFS.filter((r) => r.section === "research")
    }),
    []
  );

  const totalPerSecond = RESOURCE_DEFS.filter((r) => unlockedIds.includes(r.id)).reduce((sum, r) => sum + rates[r.id], 0);
  const globalResourceImpacts = useMemo(() => {
    const rows: Array<{ id: string; kind: "bonus" | "malus"; label: string }> = [];
    const formatPercent = (value: number) => `${value >= 0 ? "+" : ""}${value.toFixed(1)}%`;
    const pushRow = (id: string, value: number, frLabel: string, enLabel: string) => {
      if (!Number.isFinite(value) || Math.abs(value) < 0.05) return;
      rows.push({
        id,
        kind: value >= 0 ? "bonus" : "malus",
        label: `${l(frLabel, enLabel)}: ${formatPercent(value)}`
      });
    };

    const populationProductionPct = Math.floor(populationSnapshot.totalPopulation / 1000);
    pushRow("population", populationProductionPct, "Population active", "Active population");

    const stabilityImpactByBand: Record<PopulationSnapshot["stabilityBand"], number> = {
      excellent: 8,
      normal: 0,
      warning: -6,
      trouble: -15,
      revolt: -34
    };
    pushRow("stability", stabilityImpactByBand[populationSnapshot.stabilityBand] ?? 0, "Stabilite sociale", "Social stability");

    const workforcePenaltyPct = (populationSnapshot.workforceMultiplier - 1) * 100;
    pushRow("workforce", workforcePenaltyPct, "Main-d'oeuvre disponible", "Available workforce");

    if (populationSnapshot.isOverCapacity) {
      pushRow("capacity", -25, "Surpopulation (capacite depassee)", "Overcapacity (housing exceeded)");
    }
    if (populationSnapshot.foodShortage) {
      pushRow("food", -18, "Penurie alimentaire", "Food shortage");
    }

    pushRow("event", populationSnapshot.eventProductionPct, "Evenement en cours", "Active event");
    pushRow("crisis", populationSnapshot.crisisPenaltyPct, "Crise sociale", "Social crisis");
    pushRow(
      "total",
      populationSnapshot.productionBonusPct,
      "Impact total sur la production",
      "Total production impact"
    );
    return rows;
  }, [language, populationSnapshot]);

  return (
    <main className="resource-shell">
      <section className="resource-summary">
        <div className="resource-pill">
          <strong>{l("Production totale", "Total production")}</strong>
          <span>{totalPerSecond.toFixed(2)} / s</span>
        </div>
        <div className="resource-pill">
          <strong>{l("Simulation hors-ligne", "Offline simulation")}</strong>
          <span>{offlineSeconds > 0 ? `+${offlineSeconds}s` : l("Aucune", "None")}</span>
        </div>
        <div className="resource-pill">
          <strong>{l("Derniere sauvegarde", "Last save")}</strong>
          <span>{lastSavedAt ? new Date(lastSavedAt).toLocaleTimeString() : l("En attente", "Pending")}</span>
        </div>
      </section>

      {loading ? <p className="resource-state">{l("Chargement des ressources...", "Loading resources...")}</p> : null}
      {error ? <p className="resource-error">{error}</p> : null}

      <section className="resource-section">
        <h2>{l("Ressources de Base - Construction", "Base Resources - Construction")}</h2>
        <div className="resource-grid">
          {sectioned.construction.map((res) => {
            const unlocked = unlockedIds.includes(res.id);
            const techBonuses = getUnlockedResourceTechBonuses(res.id as ResourceId, technologyLevels, language);
            return (
              <article key={res.id} className="resource-card">
                <header>
                  <strong>{resourceDisplayName(res.id as ResourceId, language)}</strong>
                  <span>R{res.rarity}</span>
                </header>
                <p>{resourceMachineDisplay(res.id as ResourceId, language)}</p>
                {unlocked ? (
                  <>
                    <div className="resource-values">
                      <div>
                        <small>{l("Stock", "Stock")}</small>
                        <span>{Math.floor(amounts[res.id] ?? 0).toLocaleString()}</span>
                      </div>
                      <div>
                        <small>{l("Prod/sec", "Prod/sec")}</small>
                        <span>+{rates[res.id].toFixed(2)}</span>
                      </div>
                    </div>
                    {techBonuses.length > 0 ? (
                      <div className="resource-tech-bonus">
                        <small>{l("Bonus technologies actifs", "Active tech bonuses")}</small>
                        <ul>
                          {techBonuses.map((row) => (
                            <li key={`${res.id}_${row.techId}`}>
                              {row.name} Lv.{row.level}: +{row.bonusPercent.toFixed(1)}%
                            </li>
                          ))}
                        </ul>
                      </div>
                    ) : null}
                    {globalResourceImpacts.length > 0 ? (
                      <div className="resource-impact-list">
                        <small>{l("Bonus / malus actifs", "Active bonuses / penalties")}</small>
                        <ul>
                          {globalResourceImpacts.map((impact, impactIndex) => (
                            <li
                              key={`${res.id}_impact_${impact.id}_${impactIndex}`}
                              className={`resource-impact-item ${impact.kind}`}
                            >
                              {impact.label}
                            </li>
                          ))}
                        </ul>
                      </div>
                    ) : null}
                  </>
                ) : (
                  <div className="resource-lock">{l("Verrouille: technologie requise", "Locked: technology required")}</div>
                )}
              </article>
            );
          })}
        </div>
      </section>

      <section className="resource-section">
        <h2>{l("Ressources de Recherche - Haute Technologie", "Research Resources - High Technology")}</h2>
        <div className="resource-grid">
          {sectioned.research.map((res) => {
            const unlocked = unlockedIds.includes(res.id);
            const techBonuses = getUnlockedResourceTechBonuses(res.id as ResourceId, technologyLevels, language);
            return (
              <article key={res.id} className="resource-card">
                <header>
                  <strong>{resourceDisplayName(res.id as ResourceId, language)}</strong>
                  <span>R{res.rarity}</span>
                </header>
                <p>{resourceMachineDisplay(res.id as ResourceId, language)}</p>
                {unlocked ? (
                  <>
                    <div className="resource-values">
                      <div>
                        <small>{l("Stock", "Stock")}</small>
                        <span>{Math.floor(amounts[res.id] ?? 0).toLocaleString()}</span>
                      </div>
                      <div>
                        <small>{l("Prod/sec", "Prod/sec")}</small>
                        <span>+{rates[res.id].toFixed(2)}</span>
                      </div>
                    </div>
                    {techBonuses.length > 0 ? (
                      <div className="resource-tech-bonus">
                        <small>{l("Bonus technologies actifs", "Active tech bonuses")}</small>
                        <ul>
                          {techBonuses.map((row) => (
                            <li key={`${res.id}_${row.techId}`}>
                              {row.name} Lv.{row.level}: +{row.bonusPercent.toFixed(1)}%
                            </li>
                          ))}
                        </ul>
                      </div>
                    ) : null}
                    {globalResourceImpacts.length > 0 ? (
                      <div className="resource-impact-list">
                        <small>{l("Bonus / malus actifs", "Active bonuses / penalties")}</small>
                        <ul>
                          {globalResourceImpacts.map((impact, impactIndex) => (
                            <li
                              key={`${res.id}_impact_${impact.id}_${impactIndex}`}
                              className={`resource-impact-item ${impact.kind}`}
                            >
                              {impact.label}
                            </li>
                          ))}
                        </ul>
                      </div>
                    ) : null}
                  </>
                ) : (
                  <div className="resource-lock">{l("Verrouille: technologie requise", "Locked: technology required")}</div>
                )}
              </article>
            );
          })}
        </div>
      </section>
    </main>
  );
}

function InventoryScreen({
  language,
  loading,
  error,
  items,
  lastSyncAt,
  hasActiveQueue,
  boostTargets,
  actionLoadingId,
  newItemNotifications,
  onUseItem
}: {
  language: UILanguage;
  loading: boolean;
  error: string;
  items: InventoryViewItem[];
  lastSyncAt: number | null;
  hasActiveQueue: boolean;
  boostTargets: InventoryBoostTarget[];
  actionLoadingId: string;
  newItemNotifications: Record<string, number>;
  onUseItem: (
    itemId: string,
    quantity?: number,
    targetOverride?: "auto" | "building" | "hangar" | "research_local",
    queueId?: string
  ) => void;
}) {
  const l = (fr: string, en: string) => (language === "en" ? en : fr);
  const totalStacks = items.length;
  const totalQuantity = items.reduce((sum, it) => sum + it.quantity, 0);
  const [quantitiesByItem, setQuantitiesByItem] = useState<Record<string, string>>({});
  const [inventoryTab, setInventoryTab] = useState<"boosts" | "resources">("boosts");
  const [boostPickerItemId, setBoostPickerItemId] = useState("");
  const chestImageByType: Record<NonNullable<InventoryViewItem["chestType"]>, string> = {
    CLASSIC: "/room-images/coffre-classique.png",
    UNCOMMON: "/room-images/coffre-inhabituel.png",
    RARE: "/room-images/coffre-rare.png",
    LEGENDARY: "/room-images/coffre-legendaire.png",
    DIVINE: "/room-images/coffre-divin.png"
  };

  const resolveInventoryItemImage = (item: InventoryViewItem) => {
    if (item.category === "RESOURCE_CRATE") {
      const chestType = item.chestType ?? "CLASSIC";
      return chestImageByType[chestType] ?? chestImageByType.CLASSIC;
    }
    if (item.category === "TIME_BOOST") {
      return resolveTimeBoostImage(item.durationSeconds);
    }
    return "/room-images/item-acceleration.png";
  };

  const inventoryItemCategoryLabel = (item: InventoryViewItem) => {
    if (item.category === "RESOURCE_CRATE") return l("Coffre", "Chest");
    if (item.category === "TIME_BOOST") return l("Faille temporelle", "Time Rift");
    if (item.category === "ATTACK_BOOST") return l("Boost attaque", "Attack boost");
    return l("Objet", "Item");
  };

  const inventoryItemEffectLabel = (item: InventoryViewItem) => {
    if (item.category === "RESOURCE_CRATE") {
      const chestType = item.chestType ?? "CLASSIC";
      const chestLabel =
        chestType === "DIVINE"
          ? l("Divin", "Divine")
          : chestType === "LEGENDARY"
            ? l("Legendaire", "Legendary")
            : chestType === "RARE"
              ? l("Rare", "Rare")
              : chestType === "UNCOMMON"
              ? l("Inhabituel", "Uncommon")
              : l("Classique", "Classic");
      return (
        <>
          {language === "en" ? "Opens a " : "Ouvre un "}
          <span className="inventory-effect-highlight">
            {language === "en" ? `${chestLabel} chest` : `coffre ${chestLabel}`}
          </span>
          {language === "en" ? " (random resources)." : " (ressources aleatoires)."}
        </>
      );
    }
    if (item.category === "TIME_BOOST") {
      const secs = Math.max(0, Math.floor(Number(item.durationSeconds ?? 0)));
      if (secs > 0) {
        const durationLabel = formatBoostDurationLabel(secs);
        return (
          <>
            {language === "en" ? "Reduces active queue by " : "Reduit la file active de "}
            <span className="inventory-effect-highlight">{durationLabel}</span>
            .
          </>
        );
      }
      return l("Reduction de temps sur file active.", "Time reduction on active queue.");
    }
    return l("Effet special.", "Special effect.");
  };

  const acceleratorItems = useMemo(() => items.filter((item) => item.category === "TIME_BOOST"), [items]);
  const resourceItems = useMemo(() => items.filter((item) => item.category !== "TIME_BOOST"), [items]);
  const visibleItems = inventoryTab === "boosts" ? acceleratorItems : resourceItems;

  useEffect(() => {
    if (inventoryTab === "boosts" && acceleratorItems.length <= 0 && resourceItems.length > 0) {
      setInventoryTab("resources");
      return;
    }
    if (inventoryTab === "resources" && resourceItems.length <= 0 && acceleratorItems.length > 0) {
      setInventoryTab("boosts");
    }
  }, [acceleratorItems.length, inventoryTab, resourceItems.length]);

  return (
    <main className="inventory-shell">
      <section className="inventory-summary">
        <article className="inventory-pill">
          <strong>{l("Stacks actifs", "Active stacks")}</strong>
          <span>{totalStacks}</span>
        </article>
        <article className="inventory-pill">
          <strong>{l("Quantite totale", "Total quantity")}</strong>
          <span>{totalQuantity.toLocaleString()}</span>
        </article>
        <article className="inventory-pill">
          <strong>{l("Cible valide", "Valid target")}</strong>
          <span>{hasActiveQueue ? l("Batiment / Hangar / Recherche", "Building / Hangar / Research") : l("Aucune", "None")}</span>
        </article>
        <article className="inventory-pill">
          <strong>{l("Derniere sync", "Last sync")}</strong>
          <span>{lastSyncAt ? new Date(lastSyncAt).toLocaleTimeString() : l("Jamais", "Never")}</span>
        </article>
      </section>

      <div className="inventory-head-row">
        <h2>{l("Objets compte", "Account-bound items")}</h2>
      </div>

      <div className="inventory-category-tabs">
        <button
          type="button"
          className={inventoryTab === "boosts" ? "active" : ""}
          onClick={() => setInventoryTab("boosts")}
        >
          {l("Accelerateurs", "Accelerators")}
          <span>{acceleratorItems.length}</span>
        </button>
        <button
          type="button"
          className={inventoryTab === "resources" ? "active" : ""}
          onClick={() => setInventoryTab("resources")}
        >
          {l("Ressources", "Resources")}
          <span>{resourceItems.length}</span>
        </button>
      </div>

      {loading ? <p className="inventory-state">{l("Chargement inventaire...", "Loading inventory...")}</p> : null}
      {error ? <p className="inventory-error">{error}</p> : null}
      <section className="inventory-grid">
        {visibleItems.length === 0 ? (
          <article className="inventory-empty">
            <Package size={16} />
            <span>
              {inventoryTab === "boosts"
                ? l("Aucun accelerateur disponible.", "No accelerator available.")
                : l("Aucune ressource stockee dans cette categorie.", "No resource items in this category.")}
            </span>
          </article>
        ) : (
          visibleItems.map((item, itemIndex) => {
            const itemUiKey = `${item.id}__${itemIndex}`;
            const rawQty = Number(quantitiesByItem[itemUiKey] ?? 1);
            const qty = Math.max(1, Math.min(item.quantity, Math.floor(Number.isFinite(rawQty) ? rawQty : 1)));
            const newQty = Math.max(0, Math.floor(Number(newItemNotifications[item.id] ?? 0)));
            const perItemSeconds =
              item.category === "TIME_BOOST"
                ? Math.max(0, Math.floor(Number(item.durationSeconds ?? 0)))
                : 0;
            const totalReductionSeconds = perItemSeconds * qty;
            return (
            <article key={itemUiKey} className={`inventory-card ${newQty > 0 ? "is-new" : ""}`}>
              <div className="inventory-card-main">
                <div className="inventory-item-visual-wrap">
                  <img
                    src={resolveInventoryItemImage(item)}
                    alt={item.name}
                    className="inventory-item-visual"
                    loading="lazy"
                    onError={(e) => {
                      const img = e.currentTarget as HTMLImageElement;
                      if (!img.src.endsWith(TIME_BOOST_ITEM_IMAGE)) {
                        img.src = TIME_BOOST_ITEM_IMAGE;
                      }
                    }}
                  />
                  <span className="inventory-item-qty">x{item.quantity.toLocaleString()}</span>
                  {newQty > 0 ? (
                    <span className="inventory-item-new-badge">+{newQty.toLocaleString()}</span>
                  ) : null}
                </div>
                <div className="inventory-item-content">
                  <header>
                    <strong>{item.name}</strong>
                    <span>{inventoryItemCategoryLabel(item)}</span>
                  </header>
                  <p className="inventory-item-effect">{inventoryItemEffectLabel(item)}</p>
                </div>
              </div>
              <div className="inventory-action-row">
                <label>
                  <small>{l("Quantite", "Quantity")}</small>
                  <input
                    type="number"
                    min={1}
                    max={item.quantity}
                    value={quantitiesByItem[itemUiKey] ?? "1"}
                    onChange={(e) =>
                      setQuantitiesByItem((prev) => ({
                        ...prev,
                        [itemUiKey]: e.target.value
                      }))
                    }
                  />
                </label>
                <button
                  type="button"
                  className="inventory-use-btn"
                  disabled={
                    loading ||
                    actionLoadingId === item.id ||
                    (item.category === "TIME_BOOST" && !hasActiveQueue)
                  }
                  onClick={() => {
                    if (item.category === "TIME_BOOST") {
                      setBoostPickerItemId((prev) => (prev === itemUiKey ? "" : itemUiKey));
                      return;
                    }
                    onUseItem(item.id, qty);
                  }}
                >
                  <Hourglass size={14} />
                  {actionLoadingId === item.id
                    ? l("Activation...", "Activating...")
                    : item.category === "RESOURCE_CRATE"
                      ? l("Ouvrir le coffre", "Open chest")
                      : l("Utiliser", "Use")}
                </button>
              </div>
              {item.category === "TIME_BOOST" && boostPickerItemId === itemUiKey ? (
                <div className="inventory-target-picker">
                  <p className="inventory-target-picker-title">{l("Choisissez une file active", "Choose an active queue")}</p>
                  {totalReductionSeconds > 0 ? (
                    <p className="inventory-target-summary">
                      {l("Temps reduit total", "Total reduced time")}:
                      <strong>{formatBoostDurationLabel(totalReductionSeconds)}</strong>
                    </p>
                  ) : null}
                  {boostTargets.length <= 0 ? (
                    <p className="inventory-target-empty">
                      {l(
                        "Aucune cible disponible pour l'accelerateur.",
                        "No available target for this accelerator."
                      )}
                    </p>
                  ) : (
                    boostTargets.map((target) => (
                      <button
                        key={`${itemUiKey}_${target.id}`}
                        type="button"
                        className="inventory-target-row"
                        onClick={() => {
                          onUseItem(item.id, qty, target.target, target.queueId);
                          setBoostPickerItemId("");
                        }}
                        disabled={loading || actionLoadingId === item.id}
                      >
                        <span className="inventory-target-main">
                          <strong>{target.label}</strong>
                          <small>{target.detail}</small>
                          {totalReductionSeconds > 0 ? (
                            <small>
                              {l("Apres application", "After apply")}: {formatDuration(Math.max(0, target.remainingSeconds - totalReductionSeconds))}
                            </small>
                          ) : null}
                          {perItemSeconds > 0 ? (
                            <small>
                              {l("Necessaires pour terminer", "Needed to finish")}: {Math.max(1, Math.ceil(target.remainingSeconds / perItemSeconds))}
                            </small>
                          ) : null}
                        </span>
                        <span className="inventory-target-time">
                          {l("Restant", "Remaining")} {formatDuration(target.remainingSeconds)}
                        </span>
                      </button>
                    ))
                  )}
                </div>
              ) : null}
            </article>
          );
          })
        )}
      </section>
    </main>
  );
}

function InboxScreen({
  language,
  client,
  session,
  playerId,
  enabled,
  onUnreadChange,
  onClaimApplied
}: {
  language: UILanguage;
  client: Client;
  session: Session | null;
  playerId: string;
  enabled: boolean;
  onUnreadChange: (count: number) => void;
  onClaimApplied: (payload: any) => void;
}) {
  const l = (fr: string, en: string) => (language === "en" ? en : fr);
  const [tab, setTab] = useState<"ALL" | "COMBAT_REPORT" | "REWARD" | "SYSTEM" | "PLAYER">("ALL");
  const [items, setItems] = useState<InboxMessage[]>([]);
  const [cursor, setCursor] = useState("");
  const [hasMore, setHasMore] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [selectedId, setSelectedId] = useState("");
  const [selectedIds, setSelectedIds] = useState<Record<string, boolean>>({});
  const [unread, setUnread] = useState<InboxUnreadCounts>({ total: 0, byType: {} });
  const [actionBusy, setActionBusy] = useState(false);

  const [sendToUserId, setSendToUserId] = useState("");
  const [sendToResolvedUserId, setSendToResolvedUserId] = useState("");
  const [sendTitle, setSendTitle] = useState("");
  const [sendBody, setSendBody] = useState("");
  const [sendStatus, setSendStatus] = useState("");
  const [recipientSuggestions, setRecipientSuggestions] = useState<InboxRecipientSuggestion[]>([]);
  const [recipientLookupBusy, setRecipientLookupBusy] = useState(false);
  const [selectedThreadPeerId, setSelectedThreadPeerId] = useState("");
  const [threadItems, setThreadItems] = useState<InboxMessage[]>([]);
  const [threadCursor, setThreadCursor] = useState("");
  const [threadHasMore, setThreadHasMore] = useState(false);
  const [threadLoading, setThreadLoading] = useState(false);
  const [threadError, setThreadError] = useState("");
  const recipientInputRef = useRef<HTMLInputElement | null>(null);

  const selectedMessage = useMemo(() => items.find((m) => m.id === selectedId) ?? null, [items, selectedId]);
  const currentUserId = session?.user_id || "";
  const chestImageByType: Record<NonNullable<InventoryViewItem["chestType"]>, string> = {
    CLASSIC: "/room-images/coffre-classique.png",
    UNCOMMON: "/room-images/coffre-inhabituel.png",
    RARE: "/room-images/coffre-rare.png",
    LEGENDARY: "/room-images/coffre-legendaire.png",
    DIVINE: "/room-images/coffre-divin.png"
  };

  const chestTierLabel = (tier: NonNullable<InventoryViewItem["chestType"]>) => {
    if (tier === "DIVINE") return l("Divin", "Divine");
    if (tier === "LEGENDARY") return l("Legendaire", "Legendary");
    if (tier === "RARE") return l("Rare", "Rare");
    if (tier === "UNCOMMON") return l("Inhabituel", "Uncommon");
    return l("Classique", "Classic");
  };

  const parseAttachmentItem = (itemId: string, quantity: number): InventoryViewItem => {
    const safeId = String(itemId || "").trim();
    const normalized = safeId.toUpperCase();
    const qty = Math.max(1, Math.floor(Number(quantity || 0)));

    if (normalized.startsWith("TIME_RIFT_")) {
      const seconds = Math.max(0, Math.floor(Number(normalized.slice("TIME_RIFT_".length) || 0)));
      return {
        id: safeId,
        name: l("Faille temporelle", "Time Rift"),
        category: "TIME_BOOST",
        quantity: qty,
        durationSeconds: seconds
      };
    }

    if (normalized.startsWith("RESOURCE_CHEST_")) {
      const chestTypeRaw = normalized.slice("RESOURCE_CHEST_".length);
      const chestType = (
        chestTypeRaw === "DIVINE" ||
        chestTypeRaw === "LEGENDARY" ||
        chestTypeRaw === "RARE" ||
        chestTypeRaw === "UNCOMMON" ||
        chestTypeRaw === "CLASSIC"
      ) ? chestTypeRaw : "CLASSIC";
      return {
        id: safeId,
        name: l("Coffre de Ressources", "Resource Chest"),
        category: "RESOURCE_CRATE",
        quantity: qty,
        chestType
      };
    }

    return {
      id: safeId,
      name: safeId || l("Objet inconnu", "Unknown item"),
      category: "OTHER",
      quantity: qty
    };
  };

  const selectedAttachmentInventoryItems = useMemo(() => {
    if (!selectedMessage || !selectedMessage.hasAttachments) return [];
    const merged = new Map<string, InventoryViewItem>();
    const pushMerged = (item: InventoryViewItem) => {
      const key = `${item.category}|${item.id}|${item.durationSeconds ?? 0}|${item.chestType ?? ""}`;
      const existing = merged.get(key);
      if (!existing) {
        merged.set(key, { ...item });
        return;
      }
      existing.quantity = Math.max(0, Math.floor(Number(existing.quantity || 0))) + Math.max(0, Math.floor(Number(item.quantity || 0)));
    };

    const items = Array.isArray(selectedMessage.attachments.items) ? selectedMessage.attachments.items : [];
    for (const row of items) {
      const parsed = parseAttachmentItem(String(row?.itemId || ""), Math.max(0, Math.floor(Number(row?.quantity ?? 0))));
      if (parsed.quantity > 0) pushMerged(parsed);
    }

    const chests = Array.isArray(selectedMessage.attachments.chests) ? selectedMessage.attachments.chests : [];
    for (const row of chests) {
      const chestType = String(row?.chestType || "CLASSIC").toUpperCase();
      const normalizedType: NonNullable<InventoryViewItem["chestType"]> =
        chestType === "DIVINE" ||
        chestType === "LEGENDARY" ||
        chestType === "RARE" ||
        chestType === "UNCOMMON" ||
        chestType === "CLASSIC"
          ? (chestType as NonNullable<InventoryViewItem["chestType"]>)
          : "CLASSIC";
      const qty = Math.max(0, Math.floor(Number(row?.quantity ?? 0)));
      if (qty <= 0) continue;
      pushMerged({
        id: `RESOURCE_CHEST_${normalizedType}`,
        name: l("Coffre de Ressources", "Resource Chest"),
        category: "RESOURCE_CRATE",
        quantity: qty,
        chestType: normalizedType
      });
    }

    return Array.from(merged.values()).sort((a, b) => String(a.name).localeCompare(String(b.name)));
  }, [selectedMessage, language]);

  const resolveAttachmentItemImage = (item: InventoryViewItem) => {
    if (item.category === "RESOURCE_CRATE") {
      const chestType = item.chestType ?? "CLASSIC";
      return chestImageByType[chestType] ?? chestImageByType.CLASSIC;
    }
    if (item.category === "TIME_BOOST") {
      return resolveTimeBoostImage(item.durationSeconds);
    }
    return "/room-images/item-acceleration.png";
  };

  const attachmentCategoryLabel = (item: InventoryViewItem) => {
    if (item.category === "RESOURCE_CRATE") return l("Coffre", "Chest");
    if (item.category === "TIME_BOOST") return l("Faille temporelle", "Time Rift");
    if (item.category === "ATTACK_BOOST") return l("Boost attaque", "Attack boost");
    return l("Objet", "Item");
  };

  const attachmentEffectLabel = (item: InventoryViewItem) => {
    if (item.category === "RESOURCE_CRATE") {
      const chestType = item.chestType ?? "CLASSIC";
      const tierLabel = chestTierLabel(chestType);
      return language === "en"
        ? `Opens a ${tierLabel} chest (random resources).`
        : `Ouvre un coffre ${tierLabel} (ressources aleatoires).`;
    }
    if (item.category === "TIME_BOOST") {
      const secs = Math.max(0, Math.floor(Number(item.durationSeconds ?? 0)));
      return secs > 0
        ? (language === "en"
          ? `Reduces active queue by ${formatBoostDurationLabel(secs)}.`
          : `Reduit la file active de ${formatBoostDurationLabel(secs)}.`)
        : l("Reduction de temps sur file active.", "Time reduction on active queue.");
    }
    return item.id || l("Effet special.", "Special effect.");
  };

  const selectedMessageIsDailyNoonChest = useMemo(() => {
    if (!selectedMessage) return false;
    return (
      selectedMessage.type === "REWARD" &&
      String(selectedMessage.meta?.kind || "").toUpperCase() === "DAILY_NOON_CHEST"
    );
  }, [selectedMessage]);

  const playerThreadRows = useMemo(() => {
    const grouped = new Map<
      string,
      {
        peerUserId: string;
        peerUsername: string;
        last: InboxMessage;
        unreadIncoming: number;
      }
    >();

    for (const msg of items) {
      if (msg.type !== "PLAYER") continue;
      const peerUserId =
        msg.peerUserId ||
        (msg.direction === "OUT" ? msg.toUserId : msg.fromUserId) ||
        "";
      if (!peerUserId) continue;
      const peerUsername =
        msg.peerUsername ||
        (msg.direction === "OUT" ? msg.toUsername : msg.fromUsername) ||
        peerUserId;
      const incoming = msg.direction !== "OUT";

      const existing = grouped.get(peerUserId);
      if (!existing) {
        grouped.set(peerUserId, {
          peerUserId,
          peerUsername,
          last: msg,
          unreadIncoming: !msg.read && incoming ? 1 : 0
        });
        continue;
      }
      if (msg.createdAt > existing.last.createdAt) {
        existing.last = msg;
        existing.peerUsername = peerUsername || existing.peerUsername;
      }
      if (!msg.read && incoming) existing.unreadIncoming += 1;
    }

    return Array.from(grouped.values()).sort((a, b) => b.last.createdAt - a.last.createdAt);
  }, [items]);

  const selectedThread = useMemo(
    () => playerThreadRows.find((row) => row.peerUserId === selectedThreadPeerId) ?? null,
    [playerThreadRows, selectedThreadPeerId]
  );
  const visibleListItems = useMemo(() => {
    if (tab === "ALL") {
      // "Tous" garde les messages systeme/combat/recompenses.
      // Les messages joueurs sont accessibles sous forme de discussions dans l'onglet "Joueurs".
      return items
        .filter((m) => m.type !== "PLAYER")
        .sort((a, b) => b.createdAt - a.createdAt);
    }
    return [...items].sort((a, b) => b.createdAt - a.createdAt);
  }, [items, tab]);
  const selectedMessageReplyTargetUserId = useMemo(() => {
    if (!selectedMessage || selectedMessage.type !== "PLAYER") return "";
    return (
      selectedMessage.peerUserId ||
      (selectedMessage.direction === "OUT" ? selectedMessage.toUserId : selectedMessage.fromUserId) ||
      ""
    );
  }, [selectedMessage]);
  const canReplySelectedMessage = Boolean(
    selectedMessageReplyTargetUserId &&
      (!session?.user_id || selectedMessageReplyTargetUserId !== session.user_id)
  );
  const canRunDailyNoonTest = Boolean(session && enabled);

  const parseInboxResponse = (rpc: any) => {
    const parsed = parseJsonObject((rpc as any)?.payload ?? rpc);
    const source = parseJsonObject(parsed?.payload);
    const payload = Object.keys(source).length > 0 ? source : parsed;
    const rawItems = Array.isArray(payload?.items) ? payload.items : [];
    const mapped: InboxMessage[] = rawItems
      .filter((row: any) => row && typeof row.id === "string")
      .map((row: any) => ({
        id: String(row.id),
        type: (String(row.type || "SYSTEM").toUpperCase() as InboxMessageType),
        title: String(row.title || ""),
        body: String(row.body || ""),
        fromUserId: String(row.fromUserId || ""),
        fromUsername: String(row.fromUsername || ""),
        toUserId: String(row.toUserId || ""),
        toUsername: String(row.toUsername || ""),
        direction: String(row.direction || "IN").toUpperCase() === "OUT" ? "OUT" : "IN",
        peerUserId: String(row.peerUserId || ""),
        peerUsername: String(row.peerUsername || ""),
        createdAt: Math.max(0, Math.floor(Number(row.createdAt || 0))),
        expiresAt: Math.max(0, Math.floor(Number(row.expiresAt || 0))),
        read: Boolean(row.read),
        claimed: Boolean(row.claimed),
        hasAttachments: Boolean(row.hasAttachments),
        attachments: row.attachments && typeof row.attachments === "object" ? row.attachments : {},
        combatReport: row.combatReport && typeof row.combatReport === "object" ? row.combatReport : null,
        meta: row.meta && typeof row.meta === "object" ? row.meta : null
      }));
    const unreadRaw = payload?.unread && typeof payload.unread === "object" ? payload.unread : {};
    const unreadCounts: InboxUnreadCounts = {
      total: Math.max(0, Math.floor(Number(unreadRaw.total ?? 0))),
      byType: unreadRaw.byType && typeof unreadRaw.byType === "object" ? unreadRaw.byType : {}
    };
    return {
      items: mapped,
      nextCursor: typeof payload?.nextCursor === "string" ? payload.nextCursor : "",
      unread: unreadCounts
    };
  };

  const loadInbox = async (reset = false) => {
    if (!session) {
      setItems([]);
      setCursor("");
      setHasMore(false);
      setSelectedId("");
      setSelectedIds({});
      setUnread({ total: 0, byType: {} });
      onUnreadChange(0);
      return;
    }
    setLoading(true);
    setError("");
    try {
      const rpc = await client.rpc(
        session,
        "rpc_inbox_list",
        JSON.stringify({
          type: tab,
          cursor: reset ? "" : cursor,
          limit: 20
        })
      );
      const parsed = parseInboxResponse(rpc);
      setUnread(parsed.unread);
      onUnreadChange(parsed.unread.total);
      setCursor(parsed.nextCursor);
      setHasMore(Boolean(parsed.nextCursor));
      setItems((prev) => {
        const merged = reset ? [] : [...prev];
        const seen = new Set(merged.map((m) => m.id));
        for (const row of parsed.items) {
          if (seen.has(row.id)) {
            const idx = merged.findIndex((m) => m.id === row.id);
            if (idx >= 0) merged[idx] = row;
            continue;
          }
          merged.push(row);
          seen.add(row.id);
        }
        return merged;
      });
      setSelectedId((prev) => {
        if (prev && parsed.items.some((m) => m.id === prev)) return prev;
        const first = (reset ? parsed.items[0] : undefined) ?? (parsed.items.length > 0 ? parsed.items[0] : undefined);
        return first?.id ?? prev ?? "";
      });
      if (reset) setSelectedIds({});
    } catch (err) {
      if (isUnauthorizedError(err)) return;
      setError(l("Impossible de charger la messagerie.", "Unable to load inbox."));
      if (import.meta.env.DEV) {
        // eslint-disable-next-line no-console
        console.error("inbox load error", err);
      }
    } finally {
      setLoading(false);
    }
  };

  const loadPlayerThread = async (peerUserId: string, reset = false) => {
    if (!session || !peerUserId) {
      setThreadItems([]);
      setThreadCursor("");
      setThreadHasMore(false);
      return;
    }
    setThreadLoading(true);
    setThreadError("");
    try {
      const rpc = await client.rpc(
        session,
        "rpc_inbox_thread",
        JSON.stringify({
          peerUserId,
          cursor: reset ? "" : threadCursor,
          limit: 50
        })
      );
      const parsed = parseInboxResponse(rpc);
      setThreadCursor(parsed.nextCursor);
      setThreadHasMore(Boolean(parsed.nextCursor));
      setThreadItems((prev) => {
        const merged = reset ? [] : [...prev];
        const seen = new Set(merged.map((m) => m.id));
        for (const row of parsed.items) {
          if (seen.has(row.id)) {
            const idx = merged.findIndex((m) => m.id === row.id);
            if (idx >= 0) merged[idx] = row;
            continue;
          }
          merged.push(row);
          seen.add(row.id);
        }
        return merged.sort((a, b) => a.createdAt - b.createdAt);
      });
    } catch (err) {
      if (isUnauthorizedError(err)) return;
      setThreadError(l("Impossible de charger la conversation.", "Unable to load conversation."));
    } finally {
      setThreadLoading(false);
    }
  };

  const refreshAfterAction = async () => {
    await loadInbox(true);
    if (tab === "PLAYER" && selectedThreadPeerId) {
      await loadPlayerThread(selectedThreadPeerId, true);
    }
  };

  const readMessage = async (messageId: string, refresh = true) => {
    if (!session) return;
    try {
      await client.rpc(session, "rpc_inbox_read", JSON.stringify({ messageId }));
      setItems((prev) => prev.map((m) => (m.id === messageId ? { ...m, read: true } : m)));
      if (refresh) await refreshAfterAction();
    } catch (err) {
      if (import.meta.env.DEV) {
        // eslint-disable-next-line no-console
        console.error("inbox read error", err);
      }
    }
  };

  const deleteMessages = async (messageIds: string[]) => {
    if (!session || messageIds.length === 0) return;
    setActionBusy(true);
    setError("");
    try {
      await client.rpc(session, "rpc_inbox_delete", JSON.stringify({ messageIds }));
      setItems((prev) => prev.filter((m) => !messageIds.includes(m.id)));
      setSelectedIds({});
      if (selectedId && messageIds.includes(selectedId)) setSelectedId("");
      await refreshAfterAction();
    } catch (err) {
      setError(l("Suppression impossible.", "Delete failed."));
      if (import.meta.env.DEV) {
        // eslint-disable-next-line no-console
        console.error("inbox delete error", err);
      }
    } finally {
      setActionBusy(false);
    }
  };

  const claimMessage = async (messageId: string) => {
    if (!session) return;
    setActionBusy(true);
    setError("");
    try {
      const rpc = await client.rpc(session, "rpc_inbox_claim", JSON.stringify({ messageId }));
      const parsed = parseJsonObject((rpc as any)?.payload ?? rpc);
      onClaimApplied(parsed);
      await refreshAfterAction();
    } catch (err) {
      setError(l("Reclamation impossible.", "Claim failed."));
      if (import.meta.env.DEV) {
        // eslint-disable-next-line no-console
        console.error("inbox claim error", err);
      }
    } finally {
      setActionBusy(false);
    }
  };

  const sendPlayerMessage = async () => {
    if (!session) return;
    const to = (sendToResolvedUserId || sendToUserId).trim();
    const title = sendTitle.trim();
    const body = sendBody.trim();
    if (!to || !title || !body) {
      setSendStatus(l("Remplissez destinataire, titre et message.", "Fill recipient, title and body."));
      return;
    }
    setActionBusy(true);
    setSendStatus("");
    try {
      await client.rpc(
        session,
        "rpc_send_player_message",
        JSON.stringify({ toUserId: to, title, body })
      );
      setSendStatus(l("Message envoye.", "Message sent."));
      setSendBody("");
      setSendTitle("");
      await refreshAfterAction();
    } catch (err) {
      let detail = extractRpcErrorMessage(err);
      if (!detail && err instanceof Response) {
        try {
          const raw = await err.text();
          const parsed = parseJsonObject(raw);
          detail =
            String(parsed.message || parsed.error || parsed.error_message || "").trim() ||
            raw.trim();
        } catch {
          // noop
        }
      }
      setSendStatus(detail || l("Envoi impossible.", "Send failed."));
    } finally {
      setActionBusy(false);
    }
  };

  const spawnDailyNoonTestMessage = async () => {
    if (!session) return;
    setActionBusy(true);
    setSendStatus("");
    try {
      const rpc = await client.rpc(
        session,
        "rpc_inbox_daily_noon_test",
        JSON.stringify({ streakDay: 7 })
      );
      const parsed = parseJsonObject((rpc as any)?.payload ?? rpc);
      const nested = parseJsonObject(parsed?.payload);
      const source = Object.keys(nested).length > 0 ? nested : parsed;
      const created = parseJsonObject(source?.message);
      const createdId = String(created?.id || "").trim();

      setSendStatus(l("Coffre quotidien de test ajoute. Onglet Recompenses ouvert.", "Daily test chest added. Rewards tab opened."));
      if (tab !== "REWARD") {
        setTab("REWARD");
      } else {
        await loadInbox(true);
      }
      if (createdId) setSelectedId(createdId);
    } catch (err) {
      const details = extractRpcErrorMessage(err);
      setSendStatus(details || l("Generation test impossible.", "Test generation failed."));
    } finally {
      setActionBusy(false);
    }
  };

  const replyToSelectedMessage = () => {
    if (selectedThread) {
      setSendToUserId(selectedThread.peerUsername || selectedThread.peerUserId);
      setSendToResolvedUserId(selectedThread.peerUserId);
    } else if (selectedMessage && selectedMessage.type === "PLAYER") {
      const targetUserId =
        selectedMessage.peerUserId ||
        (selectedMessage.direction === "OUT" ? selectedMessage.toUserId : selectedMessage.fromUserId);
      const targetUsername =
        selectedMessage.peerUsername ||
        (selectedMessage.direction === "OUT" ? selectedMessage.toUsername : selectedMessage.fromUsername) ||
        targetUserId;
      if (!targetUserId) return;
      if (session?.user_id && targetUserId === session.user_id) return;
      setSendToUserId(targetUsername);
      setSendToResolvedUserId(targetUserId);
    } else {
      return;
    }

    if (!sendTitle.trim()) {
      const base = String(selectedMessage?.title || "").trim();
      setSendTitle((base ? `Re: ${base}` : "Re: ").slice(0, 80));
    }
    setSendStatus("");
    setTimeout(() => recipientInputRef.current?.focus(), 0);
  };

  useEffect(() => {
    if (!enabled || !session) {
      setRecipientSuggestions([]);
      setRecipientLookupBusy(false);
      return;
    }
    const query = sendToUserId.trim();
    if (query.length < 3) {
      setRecipientSuggestions([]);
      setRecipientLookupBusy(false);
      return;
    }

    let cancelled = false;
    setRecipientLookupBusy(true);
    const timer = window.setTimeout(async () => {
      try {
        const rpc = await client.rpc(
          session,
          "rpc_inbox_search_players",
          JSON.stringify({ query, limit: 8 })
        );
        if (cancelled) return;
        const parsed = parseJsonObject((rpc as any)?.payload ?? rpc);
        const nested = parseJsonObject(parsed?.payload);
        const source = Array.isArray(parsed?.items) ? parsed.items : Array.isArray(nested?.items) ? nested.items : [];
        const mapped: InboxRecipientSuggestion[] = source
          .filter((row: any) => row && typeof row.userId === "string")
          .map((row: any) => ({
            userId: String(row.userId),
            username: String(row.username || row.userId),
            displayName: String(row.displayName || ""),
            avatarUrl: String(row.avatarUrl || "")
          }))
          .filter((row) => row.userId !== session.user_id);
        setRecipientSuggestions(mapped);
      } catch {
        if (!cancelled) setRecipientSuggestions([]);
      } finally {
        if (!cancelled) setRecipientLookupBusy(false);
      }
    }, 220);

    return () => {
      cancelled = true;
      window.clearTimeout(timer);
    };
  }, [client, enabled, sendToUserId, session]);

  useEffect(() => {
    if (!enabled) return;
    void loadInbox(true);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [enabled, tab, session?.user_id]);

  useEffect(() => {
    if (tab !== "PLAYER") return;
    if (!selectedThreadPeerId && playerThreadRows.length > 0) {
      setSelectedThreadPeerId(playerThreadRows[0].peerUserId);
      return;
    }
    if (selectedThreadPeerId && !playerThreadRows.some((row) => row.peerUserId === selectedThreadPeerId)) {
      setSelectedThreadPeerId(playerThreadRows[0]?.peerUserId || "");
    }
  }, [playerThreadRows, selectedThreadPeerId, tab]);

  useEffect(() => {
    if (!enabled || !session) return;
    if (tab !== "PLAYER") return;
    if (!selectedThreadPeerId) {
      setThreadItems([]);
      setThreadCursor("");
      setThreadHasMore(false);
      return;
    }
    void loadPlayerThread(selectedThreadPeerId, true);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [enabled, session?.user_id, selectedThreadPeerId, tab]);

  useEffect(() => {
    if (tab === "PLAYER") return;
    if (!selectedId || visibleListItems.some((m) => m.id === selectedId)) return;
    setSelectedId(visibleListItems[0]?.id || "");
  }, [selectedId, tab, visibleListItems]);

  return (
    <main className="inbox-shell">
      <aside className="inbox-left">
        <header className="inbox-head">
          <h2>{l("Messagerie", "Inbox")}</h2>
          <span>{l("Non lus", "Unread")}: <b>{unread.total.toLocaleString()}</b></span>
        </header>

        <div className="inbox-tabs">
          {[
            { id: "ALL", label: l("Tous", "All") },
            { id: "COMBAT_REPORT", label: l("Combat", "Combat") },
            { id: "REWARD", label: l("Recompenses", "Rewards") },
            { id: "SYSTEM", label: l("Systeme", "System") },
            { id: "PLAYER", label: l("Joueurs", "Players") }
          ].map((t) => (
            <button key={t.id} type="button" className={tab === t.id ? "active" : ""} onClick={() => setTab(t.id as any)}>
              {t.label}
              <small>
                {t.id === "ALL"
                  ? unread.total
                  : Math.max(0, Math.floor(Number(unread.byType[t.id as InboxMessageType] ?? 0)))}
              </small>
            </button>
          ))}
        </div>

        {tab !== "PLAYER" ? (
          <div className="inbox-bulk">
            <button
              type="button"
              disabled={actionBusy || Object.keys(selectedIds).filter((id) => selectedIds[id]).length === 0}
              onClick={() => {
                const ids = Object.keys(selectedIds).filter((id) => selectedIds[id]);
                void Promise.all(ids.map((id) => readMessage(id, false))).then(() => void refreshAfterAction());
              }}
            >
              {l("Marquer lu", "Mark read")}
            </button>
            <button
              type="button"
              className="danger"
              disabled={actionBusy || Object.keys(selectedIds).filter((id) => selectedIds[id]).length === 0}
              onClick={() => {
                const ids = Object.keys(selectedIds).filter((id) => selectedIds[id]);
                void deleteMessages(ids);
              }}
            >
              {l("Supprimer", "Delete")}
            </button>
          </div>
        ) : null}

        <div className="inbox-list">
          {tab === "PLAYER"
            ? playerThreadRows.map((row) => (
                <article
                  key={row.peerUserId}
                  className={`inbox-item inbox-thread-item ${selectedThreadPeerId === row.peerUserId ? "active" : ""}`}
                  onClick={() => {
                    setSelectedThreadPeerId(row.peerUserId);
                    setSendToUserId(row.peerUsername || row.peerUserId);
                    setSendToResolvedUserId(row.peerUserId);
                  }}
                >
                  <div className="inbox-item-main">
                    <div className="inbox-item-top">
                      <strong>{row.peerUsername || row.peerUserId}</strong>
                      {row.unreadIncoming > 0 ? <span className="inbox-thread-unread">{row.unreadIncoming}</span> : null}
                    </div>
                    <span className="inbox-item-meta">
                      {new Date(row.last.createdAt * 1000).toLocaleString()}
                    </span>
                    <p>{row.last.body.slice(0, 110)}{row.last.body.length > 110 ? "..." : ""}</p>
                  </div>
                </article>
              ))
            : visibleListItems.map((msg) => (
                <article
                  key={msg.id}
                  className={`inbox-item ${selectedId === msg.id ? "active" : ""} ${msg.read ? "read" : "unread"}`}
                  onClick={() => {
                    setSelectedId(msg.id);
                    if (!msg.read) void readMessage(msg.id);
                  }}
                >
                  <label className="inbox-select">
                    <input
                      type="checkbox"
                      checked={Boolean(selectedIds[msg.id])}
                      onChange={(e) => {
                        const checked = e.target.checked;
                        setSelectedIds((prev) => ({ ...prev, [msg.id]: checked }));
                      }}
                      onClick={(e) => e.stopPropagation()}
                    />
                  </label>
                  <div className="inbox-item-main">
                    <div className="inbox-item-top">
                      <strong>{msg.title}</strong>
                      {!msg.read ? <span className="inbox-dot" /> : null}
                    </div>
                    <span className="inbox-item-meta">
                      {msg.type} • {new Date(msg.createdAt * 1000).toLocaleString()}
                    </span>
                    <p>{msg.body.slice(0, 120)}{msg.body.length > 120 ? "..." : ""}</p>
                  </div>
                </article>
              ))}

          {(tab === "PLAYER" ? playerThreadRows.length === 0 : visibleListItems.length === 0) && !loading ? (
            <p className="inbox-empty">{l("Aucun message.", "No messages.")}</p>
          ) : null}
          {loading ? <p className="inbox-empty">{l("Chargement...", "Loading...")}</p> : null}
          {tab !== "PLAYER" && hasMore ? (
            <button type="button" className="inbox-more" disabled={loading} onClick={() => void loadInbox(false)}>
              {l("Charger plus", "Load more")}
            </button>
          ) : null}
        </div>
      </aside>

      <section className="inbox-right">
        {tab === "PLAYER" ? (
          selectedThread ? (
            <div className="inbox-detail inbox-thread-detail">
              <header className="inbox-detail-head">
                <h3>{selectedThread.peerUsername || selectedThread.peerUserId}</h3>
                <span className="inbox-type-badge type-player">PLAYER</span>
              </header>
              <div className="inbox-thread-messages">
                {threadItems.map((msg) => {
                  const isOut = msg.direction === "OUT" || msg.fromUserId === currentUserId;
                  return (
                    <article
                      key={msg.id}
                      className={`inbox-thread-bubble ${isOut ? "out" : "in"} ${msg.read ? "read" : "unread"}`}
                      onClick={() => {
                        if (!msg.read && !isOut) void readMessage(msg.id);
                      }}
                    >
                      <p>{msg.body}</p>
                      <small>{new Date(msg.createdAt * 1000).toLocaleTimeString()}</small>
                    </article>
                  );
                })}
                {threadLoading ? <p className="inbox-empty">{l("Chargement...", "Loading...")}</p> : null}
                {!threadLoading && threadItems.length === 0 ? (
                  <p className="inbox-empty">{l("Aucun message dans cette conversation.", "No messages in this conversation.")}</p>
                ) : null}
                {threadHasMore ? (
                  <button
                    type="button"
                    className="inbox-more"
                    disabled={threadLoading}
                    onClick={() => void loadPlayerThread(selectedThread.peerUserId, false)}
                  >
                    {l("Charger plus", "Load more")}
                  </button>
                ) : null}
              </div>
              {threadError ? <p className="inbox-send-error">{threadError}</p> : null}
              <div className="inbox-detail-actions">
                <button
                  className="inbox-action-btn ghost"
                  type="button"
                  disabled={actionBusy || threadItems.every((m) => m.read || m.direction === "OUT")}
                  onClick={() => {
                    const unreadIncoming = threadItems.filter((m) => !m.read && m.direction !== "OUT").map((m) => m.id);
                    void Promise.all(unreadIncoming.map((id) => readMessage(id, false))).then(() => void refreshAfterAction());
                  }}
                >
                  {l("Marquer conversation lue", "Mark thread read")}
                </button>
                <button
                  className="inbox-action-btn reply"
                  type="button"
                  disabled={actionBusy}
                  onClick={replyToSelectedMessage}
                >
                  {l("Repondre", "Reply")}
                </button>
                <button
                  className="inbox-action-btn danger"
                  type="button"
                  disabled={actionBusy || threadItems.length === 0}
                  onClick={() => void deleteMessages(threadItems.map((m) => m.id))}
                >
                  {l("Supprimer conversation", "Delete conversation")}
                </button>
              </div>
            </div>
          ) : (
            <div className="inbox-empty-detail">{l("Selectionnez une conversation.", "Select a conversation.")}</div>
          )
        ) : selectedMessage ? (
          <div className="inbox-detail">
            <header className="inbox-detail-head">
              <h3>{selectedMessage.title}</h3>
              <span className={`inbox-type-badge type-${selectedMessage.type.toLowerCase()}`}>{selectedMessage.type}</span>
            </header>
            <div className="inbox-detail-meta">
              <span className="meta-chip">
                <strong>{l("De", "From")}</strong>
                <em>{selectedMessage.fromUsername || selectedMessage.fromUserId || l("Systeme", "System")}</em>
              </span>
              <span className="meta-chip">
                <strong>{l("Date", "Date")}</strong>
                <em>{new Date(selectedMessage.createdAt * 1000).toLocaleString()}</em>
              </span>
            </div>
            <p className="inbox-body">{selectedMessage.body}</p>

            {selectedMessage.combatReport ? (
              <details className="inbox-spoiler">
                <summary>{l("Details rapport de combat", "Combat report details")}</summary>
                <pre>{JSON.stringify(selectedMessage.combatReport, null, 2)}</pre>
              </details>
            ) : null}

            {selectedMessage.hasAttachments ? (
              <div className="inbox-attachments">
                <h4>{selectedMessageIsDailyNoonChest ? l("Coffre quotidien", "Daily chest") : l("Pieces jointes", "Attachments")}</h4>
                {selectedMessageIsDailyNoonChest && !selectedMessage.claimed ? (
                  <p>
                    {l(
                      "Recompense de midi non ouverte. Cliquez sur Ouvrir pour reveler le contenu.",
                      "Midday reward not opened yet. Click Open to reveal its content."
                    )}
                    {Number(selectedMessage.meta?.streakDay ?? 0) > 0
                      ? ` ${l("Palier", "Streak")} ${Math.floor(Number(selectedMessage.meta?.streakDay ?? 0))}/7.`
                      : ""}
                  </p>
                ) : (
                  <>
                    {selectedMessage.attachments.resources && Object.keys(selectedMessage.attachments.resources).length > 0 ? (
                      <ResourceCostDisplay cost={selectedMessage.attachments.resources as ResourceCost} available={{}} language={language} compact />
                    ) : null}
                    {selectedAttachmentInventoryItems.length > 0 ? (
                      <div className="inbox-attachment-grid">
                        {selectedAttachmentInventoryItems.map((item, index) => {
                          const qty = Math.max(0, Math.floor(Number(item.quantity || 0)));
                          const itemUiKey = `${item.id}_${item.category}_${item.durationSeconds ?? 0}_${item.chestType ?? ""}_${index}`;
                          return (
                            <article key={itemUiKey} className="inventory-card inbox-attachment-card">
                              <div className="inventory-card-main">
                                <div className="inventory-item-visual-wrap">
                                  <img
                                    src={resolveAttachmentItemImage(item)}
                                    alt={item.name}
                                    className="inventory-item-visual"
                                    loading="lazy"
                                  />
                                  <span className="inventory-item-qty">x{qty.toLocaleString()}</span>
                                </div>
                                <div className="inventory-item-content">
                                  <header>
                                    <strong>{item.category === "RESOURCE_CRATE" && item.chestType ? chestTierLabel(item.chestType) : item.name}</strong>
                                    <span>{attachmentCategoryLabel(item)}</span>
                                  </header>
                                  <p className="inventory-item-effect">{attachmentEffectLabel(item)}</p>
                                </div>
                              </div>
                            </article>
                          );
                        })}
                      </div>
                    ) : null}
                    {Number(selectedMessage.attachments.credits ?? 0) > 0 ? (
                      <p className="inbox-attachment-credits">
                        {l("Credits", "Credits")}: {Math.floor(Number(selectedMessage.attachments.credits ?? 0)).toLocaleString()}
                      </p>
                    ) : null}
                  </>
                )}
                <button
                  type="button"
                  className="inbox-action-btn primary"
                  disabled={actionBusy || selectedMessage.claimed || !selectedMessage.hasAttachments}
                  onClick={() => void claimMessage(selectedMessage.id)}
                >
                  {selectedMessage.claimed
                    ? l("Deja reclame", "Already claimed")
                    : selectedMessageIsDailyNoonChest
                      ? l("Ouvrir", "Open")
                      : l("Reclamer", "Claim")}
                </button>
              </div>
            ) : null}

            <div className="inbox-detail-actions">
              {selectedMessage.type === "PLAYER" ? (
                <button
                  className="inbox-action-btn reply"
                  type="button"
                  onClick={replyToSelectedMessage}
                  disabled={actionBusy || !canReplySelectedMessage}
                >
                  {l("Repondre", "Reply")}
                </button>
              ) : null}
              <button className="inbox-action-btn ghost" type="button" onClick={() => void readMessage(selectedMessage.id)} disabled={actionBusy || selectedMessage.read}>
                {l("Marquer lu", "Mark read")}
              </button>
              <button className="inbox-action-btn danger" type="button" onClick={() => void deleteMessages([selectedMessage.id])} disabled={actionBusy}>
                {l("Supprimer", "Delete")}
              </button>
            </div>
          </div>
        ) : (
          <div className="inbox-empty-detail">{l("Selectionnez un message.", "Select a message.")}</div>
        )}

        <div className="inbox-send-box">
          <h4>{l("Envoyer un message joueur", "Send player message")}</h4>
          <div className="inbox-recipient-wrap">
            <input
              ref={recipientInputRef}
              value={sendToUserId}
              onChange={(e) => {
                setSendToUserId(e.target.value);
                setSendToResolvedUserId("");
              }}
              placeholder={l("Destinataire (pseudo ou userId)", "Recipient (username or userId)")}
            />
            {recipientLookupBusy ? <span className="inbox-recipient-loading">{l("Recherche...", "Searching...")}</span> : null}
            {sendToUserId.trim().length >= 3 && recipientSuggestions.length > 0 ? (
              <div className="inbox-recipient-suggestions">
                {recipientSuggestions.map((row) => (
                  <button
                    key={row.userId}
                    type="button"
                    onClick={() => {
                      setSendToUserId(row.username);
                      setSendToResolvedUserId(row.userId);
                      setRecipientSuggestions([]);
                    }}
                  >
                    <img src={row.avatarUrl || "/avatars/avatar-01.png"} alt={row.username} />
                    <span>
                      <strong>{row.username}</strong>
                      {row.displayName ? <em>{row.displayName}</em> : null}
                    </span>
                  </button>
                ))}
              </div>
            ) : null}
          </div>
          <input value={sendTitle} onChange={(e) => setSendTitle(e.target.value)} placeholder={l("Titre", "Title")} />
          <textarea value={sendBody} onChange={(e) => setSendBody(e.target.value)} placeholder={l("Message", "Message")} />
          <button className="inbox-action-btn primary" type="button" onClick={() => void sendPlayerMessage()} disabled={actionBusy || !session || !enabled || playerId.length === 0}>
            {l("Envoyer", "Send")}
          </button>
          {canRunDailyNoonTest ? (
            <button
              className="inbox-action-btn ghost"
              type="button"
              onClick={() => void spawnDailyNoonTestMessage()}
              disabled={actionBusy || !session || !enabled}
            >
              {l("Tester coffre midi (admin)", "Test noon chest (admin)")}
            </button>
          ) : null}
          {sendStatus ? <p className="inbox-send-status">{sendStatus}</p> : null}
          {error ? <p className="inbox-send-error">{error}</p> : null}
        </div>
      </section>
    </main>
  );
}

type ChatMessageItem = {
  id: string;
  channelId: string;
  sender: string;
  senderId: string;
  content: string;
  createdAt: number;
  edited: boolean;
  likes: string[];
  rawPayload: Record<string, any>;
};

function ChatScreen({
  client,
  session,
  playerId,
  enabled,
  language
}: {
  client: Client;
  session: Session | null;
  playerId: string;
  enabled: boolean;
  language: UILanguage;
}) {
  const l = (fr: string, en: string) => (language === "en" ? en : fr);
  const [socketConnected, setSocketConnected] = useState(false);
  const [chatError, setChatError] = useState("");
  const [chatTab, setChatTab] = useState<"global" | "private">("global");
  const [globalInput, setGlobalInput] = useState("");
  const [privateTarget, setPrivateTarget] = useState("");
  const [privateInput, setPrivateInput] = useState("");
  const [privatePartner, setPrivatePartner] = useState("");
  const [privatePartnerId, setPrivatePartnerId] = useState("");
  const [globalMessages, setGlobalMessages] = useState<ChatMessageItem[]>([]);
  const [privateMessages, setPrivateMessages] = useState<ChatMessageItem[]>([]);
  const [connectingPrivate, setConnectingPrivate] = useState(false);
  const [userDirectory, setUserDirectory] = useState<Record<string, { id: string; username: string; avatarUrl: string }>>({});
  const [editingMessageId, setEditingMessageId] = useState("");
  const [editingDraft, setEditingDraft] = useState("");
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const emojiList = [
    "\u{1F600}",
    "\u{1F602}",
    "\u{1F60E}",
    "\u{1F525}",
    "\u{1F680}",
    "\u{1F6E1}\uFE0F",
    "\u26A1",
    "\u{1F4AC}",
    "\u2764\uFE0F",
    "\u{1F44D}",
    "\u{1F44F}",
    "\u{1F916}"
  ];

  const socketRef = useRef<any>(null);
  const globalChannelIdRef = useRef<string | null>(null);
  const privateChannelIdRef = useRef<string | null>(null);
  const currentPartnerRef = useRef<string>("");
  const [chatLikeMetaByMessage, setChatLikeMetaByMessage] = useState<Record<string, { count: number; hasLiked: boolean }>>({});

  const upsertMessages = (list: ChatMessageItem[], item: ChatMessageItem) => {
    const idx = list.findIndex((m) => m.id === item.id);
    if (idx === -1) return [...list, item].sort((a, b) => a.createdAt - b.createdAt).slice(-200);
    const copy = [...list];
    copy[idx] = item;
    return copy.sort((a, b) => a.createdAt - b.createdAt);
  };

  const parsePayload = (content: any): Record<string, any> => {
    if (typeof content === "string") {
      try {
        const parsed = JSON.parse(content);
        if (parsed && typeof parsed === "object") return parsed;
        return { message: String(parsed) };
      } catch {
        return { message: content };
      }
    }
    if (content && typeof content === "object") return content as Record<string, any>;
    return { message: "" };
  };

  const parseRpcPayload = (rpc: any): Record<string, any> => {
    const payload = parseJsonObject(rpc?.payload);
    return payload && typeof payload === "object" ? payload : {};
  };

  const hydrateLikesForMessages = async (channelId: string, messageIds: string[]) => {
    if (!session) return;
    const ids = [...new Set(messageIds.map((id) => String(id || "").trim()).filter(Boolean))].slice(0, 160);
    if (ids.length <= 0) return;
    try {
      const rpc = await client.rpc(session, "rpc_chat_get_likes", JSON.stringify({ channelId, messageIds: ids }));
      const payload = parseRpcPayload(rpc as any);
      const rawMap = payload?.likesByMessage && typeof payload.likesByMessage === "object" ? payload.likesByMessage : {};
      setChatLikeMetaByMessage((prev) => {
        const next = { ...prev };
        for (const id of ids) {
          const row = rawMap[id];
          const count = Number(row?.count ?? NaN);
          const hasLiked = Boolean(row?.hasLiked);
          if (Number.isFinite(count) && count >= 0) {
            next[id] = { count: Math.max(0, Math.floor(count)), hasLiked };
          }
        }
        return next;
      });
    } catch {
      // noop: keep chat usable if likes RPC is unavailable.
    }
  };

  const toMessage = (raw: any): ChatMessageItem => {
    const payload = parsePayload(raw?.content);
    const nested = payload.message && typeof payload.message === "object" ? (payload.message as Record<string, any>) : null;
    const parsed =
      typeof payload.message === "string"
        ? payload.message
        : typeof nested?.message === "string"
          ? nested.message
          : typeof payload.text === "string"
            ? payload.text
            : typeof nested?.text === "string"
              ? nested.text
              : "";
    const likeSource = Array.isArray(payload.likes)
      ? payload.likes
      : Array.isArray(nested?.likes)
        ? nested.likes
        : [];
    const likeIds = likeSource.filter((v: unknown) => typeof v === "string");
    const senderName =
      raw.username ??
      (typeof payload.from === "string" ? payload.from : undefined) ??
      (typeof nested?.from === "string" ? nested.from : undefined) ??
      "inconnu";
    const senderId =
      raw.user_id ??
      (typeof payload.fromId === "string" ? payload.fromId : undefined) ??
      (typeof nested?.fromId === "string" ? nested.fromId : undefined) ??
      "";
    const ts = raw.create_time ? Date.parse(raw.create_time) : Date.now();
    const normalizedPayload: Record<string, any> = {
      ...payload,
      message: parsed,
      likes: likeIds,
      from: senderName,
      fromId: senderId
    };
    return {
      id: raw.message_id ?? `${raw.username ?? "unknown"}_${ts}`,
      channelId: raw.channel_id ?? "",
      sender: senderName,
      senderId,
      content: parsed,
      createdAt: Number.isNaN(ts) ? Date.now() : ts,
      edited: Boolean(payload.edited),
      likes: likeIds,
      rawPayload: normalizedPayload
    };
  };

  const resolveUsersByIds = async (ids: string[]) => {
    if (!session) return;
    const unique = [...new Set(ids.filter(Boolean))];
    const missing = unique.filter((id) => !userDirectory[id]);
    if (!missing.length) return;
    try {
      const res = await client.getUsers(session, missing, undefined, undefined);
      const next: Record<string, { id: string; username: string; avatarUrl: string }> = {};
      for (const user of res.users ?? []) {
        if (!user.id) continue;
        next[user.id] = {
          id: user.id,
          username: user.username ?? `user_${user.id.slice(0, 6)}`,
          avatarUrl: user.avatar_url ?? ""
        };
      }
      if (Object.keys(next).length > 0) {
        setUserDirectory((prev) => ({ ...prev, ...next }));
      }
    } catch {
      // noop
    }
  };

  const privateSuggestions = useMemo(() => {
    const q = privateTarget.trim().toLowerCase();
    if (q.length < 2) return [];
    const all = Object.values(userDirectory);
    return all
      .filter((u) => u.username.toLowerCase().includes(q) && u.username.toLowerCase() !== playerId.toLowerCase())
      .sort((a, b) => {
        const aStarts = a.username.toLowerCase().startsWith(q) ? 0 : 1;
        const bStarts = b.username.toLowerCase().startsWith(q) ? 0 : 1;
        return aStarts - bStarts || a.username.localeCompare(b.username);
      })
      .slice(0, 8);
  }, [playerId, privateTarget, userDirectory]);

  const connectPrivate = async () => {
    if (!session || !socketRef.current) return;
    const targetRaw = privateTarget.trim();
    if (!targetRaw || targetRaw.toLowerCase() === playerId.toLowerCase()) {
      setChatError(l("Entrez un pseudo valide different du votre.", "Enter a valid username different from yours."));
      return;
    }

    setConnectingPrivate(true);
    setChatError("");
    try {
      let targetUser = privateSuggestions.find((u) => u.username.toLowerCase() === targetRaw.toLowerCase()) ?? null;
      if (!targetUser) {
        const exact = await client.getUsers(session, undefined, [targetRaw], undefined);
        const u = exact.users?.[0];
        if (u?.id) {
          targetUser = {
            id: u.id,
            username: u.username ?? targetRaw,
            avatarUrl: u.avatar_url ?? ""
          };
        }
      }

      if (!targetUser?.id) throw new Error("Target not found");

      const channel = await socketRef.current.joinChat(targetUser.id, 2, true, false);
      privateChannelIdRef.current = channel.id;
      currentPartnerRef.current = targetUser.username;
      setPrivatePartner(targetUser.username);
      setPrivatePartnerId(targetUser.id);
      setChatTab("private");
      setUserDirectory((prev) => ({
        ...prev,
        [targetUser!.id]: targetUser!
      }));

      const history = await client.listChannelMessages(session, channel.id, 30, true);
      const mapped = (history.messages ?? []).map(toMessage).sort((a, b) => a.createdAt - b.createdAt);
      setPrivateMessages(mapped);
      void hydrateLikesForMessages(channel.id, mapped.map((m) => m.id));
      await resolveUsersByIds(mapped.map((m) => m.senderId));
    } catch {
      setChatError(l("Impossible d'ouvrir la conversation privee. Verifiez le pseudo.", "Cannot open private conversation. Check the username."));
    } finally {
      setConnectingPrivate(false);
    }
  };

  const sendGlobal = async () => {
    if (!socketRef.current || !globalChannelIdRef.current) return;
    const content = globalInput.trim();
    if (!content) return;
    try {
      await socketRef.current.writeChatMessage(globalChannelIdRef.current, {
        message: content,
        from: playerId,
        fromId: session?.user_id ?? "",
        likes: []
      });
      setGlobalInput("");
    } catch (err: any) {
      const detail = typeof err?.message === "string" ? err.message : "Erreur inconnue";
      setChatError(`${l("Envoi global impossible", "Global send failed")}. (${detail})`);
    }
  };

  const sendPrivate = async () => {
    if (!socketRef.current || !privateChannelIdRef.current) return;
    const content = privateInput.trim();
    if (!content) return;
    try {
      await socketRef.current.writeChatMessage(privateChannelIdRef.current, {
        message: content,
        from: playerId,
        fromId: session?.user_id ?? "",
        likes: []
      });
      setPrivateInput("");
    } catch (err: any) {
      const detail = typeof err?.message === "string" ? err.message : "Erreur inconnue";
      setChatError(`${l("Envoi prive impossible", "Private send failed")}. (${detail})`);
    }
  };

  const startEdit = (msg: ChatMessageItem) => {
    setEditingMessageId(msg.id);
    setEditingDraft(msg.content);
  };

  const cancelEdit = () => {
    setEditingMessageId("");
    setEditingDraft("");
  };

  const saveEdit = async (msg: ChatMessageItem) => {
    if (!socketRef.current) return;
    const nextMessage = editingDraft.trim();
    if (!nextMessage) return;
    try {
      const payload = {
        ...msg.rawPayload,
        message: nextMessage,
        edited: true,
        likes: msg.likes
      };
      await socketRef.current.updateChatMessage(msg.channelId, msg.id, payload);
      const updated = { ...msg, content: nextMessage, edited: true, rawPayload: payload };
      if (msg.channelId === globalChannelIdRef.current) {
        setGlobalMessages((prev) => upsertMessages(prev, updated));
      } else if (msg.channelId === privateChannelIdRef.current) {
        setPrivateMessages((prev) => upsertMessages(prev, updated));
      }
      cancelEdit();
    } catch (err: any) {
      const detail = typeof err?.message === "string" ? err.message : "Erreur inconnue";
      setChatError(`${l("Edition impossible", "Edit failed")}. (${detail})`);
    }
  };

  const deleteMessage = async (msg: ChatMessageItem) => {
    if (!socketRef.current) return;
    try {
      await socketRef.current.removeChatMessage(msg.channelId, msg.id);
      if (msg.channelId === globalChannelIdRef.current) {
        setGlobalMessages((prev) => prev.filter((m) => m.id !== msg.id));
      } else if (msg.channelId === privateChannelIdRef.current) {
        setPrivateMessages((prev) => prev.filter((m) => m.id !== msg.id));
      }
      setChatLikeMetaByMessage((prev) => {
        if (!Object.prototype.hasOwnProperty.call(prev, msg.id)) return prev;
        const next = { ...prev };
        delete next[msg.id];
        return next;
      });
      if (editingMessageId === msg.id) cancelEdit();
    } catch (err: any) {
      const detail = typeof err?.message === "string" ? err.message : "Erreur inconnue";
      setChatError(`${l("Suppression impossible", "Delete failed")}. (${detail})`);
    }
  };

  const hasLikedMessage = (msg: ChatMessageItem) => {
    if (!session?.user_id) return false;
    const meta = chatLikeMetaByMessage[msg.id];
    if (meta) return Boolean(meta.hasLiked);
    return msg.likes.includes(session.user_id);
  };

  const likeCountForMessage = (msg: ChatMessageItem) => {
    const meta = chatLikeMetaByMessage[msg.id];
    if (meta) return Math.max(0, Math.floor(Number(meta.count || 0)));
    return msg.likes.length;
  };

  const toggleLike = async (msg: ChatMessageItem) => {
    if (!session?.user_id) return;
    try {
      const rpc = await client.rpc(
        session,
        "rpc_chat_toggle_like",
        JSON.stringify({ channelId: msg.channelId, messageId: msg.id })
      );
      const payload = parseRpcPayload(rpc as any);
      const count = Number(payload?.count ?? NaN);
      if (!Number.isFinite(count) || count < 0) {
        await hydrateLikesForMessages(msg.channelId, [msg.id]);
        return;
      }
      setChatLikeMetaByMessage((prev) => ({
        ...prev,
        [msg.id]: {
          count: Math.max(0, Math.floor(count)),
          hasLiked: Boolean(payload?.hasLiked)
        }
      }));
    } catch (err: any) {
      const detail = typeof err?.message === "string" ? err.message : "";
      const shouldFallbackLegacy =
        !!socketRef.current &&
        (detail.toLowerCase().includes("rpc_chat_toggle_like") ||
          detail.toLowerCase().includes("rpc function not found") ||
          detail.includes("404"));
      if (shouldFallbackLegacy) {
        try {
          const hasLiked = msg.likes.includes(session.user_id);
          const nextLikes = hasLiked ? msg.likes.filter((id) => id !== session.user_id) : [...msg.likes, session.user_id];
          const payload = {
            ...msg.rawPayload,
            message: msg.content,
            edited: msg.edited,
            likes: nextLikes
          };
          await socketRef.current.updateChatMessage(msg.channelId, msg.id, payload);
          const updated = { ...msg, likes: nextLikes, rawPayload: payload };
          if (msg.channelId === globalChannelIdRef.current) {
            setGlobalMessages((prev) => upsertMessages(prev, updated));
          } else if (msg.channelId === privateChannelIdRef.current) {
            setPrivateMessages((prev) => upsertMessages(prev, updated));
          }
          return;
        } catch (legacyErr: any) {
          const legacyDetail = typeof legacyErr?.message === "string" ? legacyErr.message : "Erreur inconnue";
          setChatError(`${l("Like impossible", "Like failed")}. (${legacyDetail})`);
          return;
        }
      }
      const errDetail = detail || "Erreur inconnue";
      setChatError(`${l("Like impossible", "Like failed")}. (${errDetail})`);
    }
  };

  useEffect(() => {
    if (!session || !enabled) return;
    let cancelled = false;

    const run = async () => {
      try {
        setChatError("");
        const useSSL = (import.meta.env.VITE_NAKAMA_SSL ?? "false") === "true";
        const socket = client.createSocket(useSSL, false);
        socketRef.current = socket;

        socket.ondisconnect = () => {
          if (!cancelled) setSocketConnected(false);
        };

        socket.onchannelmessage = (message: any) => {
          const mapped = toMessage(message);
          if (message.channel_id === globalChannelIdRef.current) {
            setGlobalMessages((prev) => upsertMessages(prev, mapped));
          } else if (message.channel_id === privateChannelIdRef.current) {
            setPrivateMessages((prev) => upsertMessages(prev, mapped));
          }
          void hydrateLikesForMessages(String(message.channel_id || ""), [mapped.id]);
          if (mapped.senderId) {
            void resolveUsersByIds([mapped.senderId]);
          }
        };

        await socket.connect(session, true);
        if (cancelled) return;
        setSocketConnected(true);

        const globalChannel = await socket.joinChat("hyperstructure-global", 1, true, false);
        globalChannelIdRef.current = globalChannel.id;
        if (Array.isArray(globalChannel.presences) && globalChannel.presences.length > 0) {
          setUserDirectory((prev) => {
            const next = { ...prev };
            for (const p of globalChannel.presences) {
              if (!p.user_id) continue;
              next[p.user_id] = {
                id: p.user_id,
                username: p.username ?? `user_${p.user_id.slice(0, 6)}`,
                avatarUrl: next[p.user_id]?.avatarUrl ?? ""
              };
            }
            return next;
          });
          void resolveUsersByIds(globalChannel.presences.map((p: any) => p.user_id ?? "").filter(Boolean));
        }
        const history = await client.listChannelMessages(session, globalChannel.id, 40, true);
        const mapped = (history.messages ?? []).map(toMessage).sort((a, b) => a.createdAt - b.createdAt);
        setGlobalMessages(mapped);
        void hydrateLikesForMessages(globalChannel.id, mapped.map((m) => m.id));
        await resolveUsersByIds(mapped.map((m) => m.senderId));
      } catch {
        if (!cancelled) setChatError(l("Connexion chat Nakama echouee.", "Nakama chat connection failed."));
      }
    };

    void run();

    return () => {
      cancelled = true;
      setSocketConnected(false);
      globalChannelIdRef.current = null;
      privateChannelIdRef.current = null;
      currentPartnerRef.current = "";
      setPrivatePartner("");
      setPrivatePartnerId("");
      setPrivateMessages([]);
      setChatLikeMetaByMessage({});
      if (socketRef.current) {
        try {
          socketRef.current.disconnect();
        } catch {
          // noop
        }
      }
      socketRef.current = null;
    };
  }, [client, enabled, session]);

  return (
    <main className="chat-shell">
      <aside className="chat-left">
        <div className="chat-connection">
          <span className={`chat-dot ${socketConnected ? "ok" : "bad"}`} />
          <strong>{socketConnected ? l("Liaison temps reel", "Realtime link") : l("Liaison hors ligne", "Offline link")}</strong>
        </div>

        <div className="chat-tabs">
          <button type="button" className={chatTab === "global" ? "active" : ""} onClick={() => setChatTab("global")}>
            <Users size={14} /> {l("Global", "Global")}
          </button>
          <button type="button" className={chatTab === "private" ? "active" : ""} onClick={() => setChatTab("private")}>
            <UserRound size={14} /> {l("Prive", "Private")}
          </button>
        </div>

        <div className="chat-private-box">
          <label>{l("Ouvrir une conversation privee", "Open a private conversation")}</label>
          <div>
            <input
              value={privateTarget}
              onChange={(e) => setPrivateTarget(e.target.value)}
              placeholder={l("Pseudo du joueur", "Player username")}
            />
            <button type="button" disabled={connectingPrivate} onClick={connectPrivate}>
              {connectingPrivate ? "..." : l("Ouvrir", "Open")}
            </button>
          </div>
          {privateSuggestions.length > 0 ? (
            <div className="chat-suggestions">
              {privateSuggestions.map((u) => (
                <button
                  key={u.id}
                  type="button"
                  onClick={() => setPrivateTarget(u.username)}
                >
                  <img src={u.avatarUrl || "/avatars/avatar-01.png"} alt={u.username} />
                  <span>{u.username}</span>
                </button>
              ))}
            </div>
          ) : null}
          <p>{privatePartner ? `${l("Conversation active", "Active conversation")}: ${privatePartner}` : l("Aucune conversation privee active.", "No active private conversation.")}</p>
        </div>
      </aside>

      <section className="chat-main">
        <header>
          <h2>{chatTab === "global" ? l("Canal Global Hyperstructure", "Hyperstructure Global Channel") : l("Messagerie Privee", "Private Messaging")}</h2>
          <span>{chatTab === "global" ? `${globalMessages.length} ${l("messages", "messages")}` : `${privateMessages.length} ${l("messages", "messages")}`}</span>
        </header>

        <div className="chat-messages">
          {(chatTab === "global" ? globalMessages : privateMessages).map((msg) => (
            <article key={msg.id} className={`chat-msg ${msg.sender === playerId ? "self" : ""}`}>
              <div className="chat-meta">
                <span className="chat-user">
                  <img
                    src={(msg.senderId && userDirectory[msg.senderId]?.avatarUrl) || "/avatars/avatar-01.png"}
                    alt={msg.sender}
                  />
                  <strong>{(msg.senderId && userDirectory[msg.senderId]?.username) || msg.sender}</strong>
                </span>
                <small>{new Date(msg.createdAt).toLocaleTimeString()}</small>
              </div>
              {editingMessageId === msg.id ? (
                <div className="chat-edit-box">
                  <input value={editingDraft} onChange={(e) => setEditingDraft(e.target.value)} />
                  <div>
                    <button type="button" onClick={() => void saveEdit(msg)}>{l("Sauver", "Save")}</button>
                    <button type="button" className="ghost" onClick={cancelEdit}>{l("Annuler", "Cancel")}</button>
                  </div>
                </div>
              ) : (
                <p>{msg.content}</p>
              )}
              <div className="chat-msg-actions">
                <button
                  type="button"
                  className={hasLikedMessage(msg) ? "active-like" : ""}
                  onClick={() => void toggleLike(msg)}
                >
                  <Heart size={12} /> {likeCountForMessage(msg)}
                </button>
                {msg.edited ? <span className="edited-tag">{l("modifie", "edited")}</span> : null}
                {(msg.senderId && msg.senderId === session?.user_id) || msg.sender === playerId ? (
                  <>
                    <button type="button" onClick={() => startEdit(msg)}>{l("Editer", "Edit")}</button>
                    <button type="button" className="danger" onClick={() => void deleteMessage(msg)}>{l("Supprimer", "Delete")}</button>
                  </>
                ) : null}
              </div>
            </article>
          ))}
          {(chatTab === "global" ? globalMessages.length === 0 : privateMessages.length === 0) ? (
            <p className="chat-empty">{l("Aucun message pour l'instant.", "No messages yet.")}</p>
          ) : null}
        </div>

        <form
          className="chat-composer"
          onSubmit={(e) => {
            e.preventDefault();
            if (chatTab === "global") {
              void sendGlobal();
            } else {
              void sendPrivate();
            }
          }}
        >
          <input
            value={chatTab === "global" ? globalInput : privateInput}
            onChange={(e) => {
              if (chatTab === "global") setGlobalInput(e.target.value);
              else setPrivateInput(e.target.value);
            }}
            placeholder={chatTab === "global" ? l("Ecrire dans le canal global...", "Write in global channel...") : l("Ecrire un message prive...", "Write a private message...")}
            disabled={!socketConnected || (chatTab === "private" && !privatePartnerId)}
          />
          <button type="button" className="emoji-btn" onClick={() => setShowEmojiPicker((v) => !v)}>
            <Smile size={16} />
          </button>
          <button type="submit" disabled={!socketConnected || (chatTab === "private" && !privatePartnerId)}>
            <Send size={14} /> {l("Envoyer", "Send")}
          </button>
        </form>

        {showEmojiPicker ? (
          <div className="emoji-picker">
            {emojiList.map((emoji) => (
              <button
                key={emoji}
                type="button"
                onClick={() => {
                  if (chatTab === "global") setGlobalInput((prev) => `${prev}${emoji}`);
                  else setPrivateInput((prev) => `${prev}${emoji}`);
                }}
              >
                {emoji}
              </button>
            ))}
          </div>
        ) : null}

        {chatError ? <div className="chat-error">{chatError}</div> : null}
      </section>
    </main>
  );
}

function AuthOverlay({
  language,
  authMode,
  authEmail,
  authPassword,
  authUsername,
  authLanguage,
  authError,
  authLoading,
  onModeChange,
  onEmailChange,
  onPasswordChange,
  onUsernameChange,
  onLanguageChange,
  onSubmit,
  onClose
}: {
  language: UILanguage;
  authMode: "login" | "signup";
  authEmail: string;
  authPassword: string;
  authUsername: string;
  authLanguage: "fr" | "en";
  authError: string;
  authLoading: boolean;
  onModeChange: (mode: "login" | "signup") => void;
  onEmailChange: (v: string) => void;
  onPasswordChange: (v: string) => void;
  onUsernameChange: (v: string) => void;
  onLanguageChange: (v: "fr" | "en") => void;
  onSubmit: (e: FormEvent) => void;
  onClose: () => void;
}) {
  const l = (fr: string, en: string) => (language === "en" ? en : fr);
  return (
    <div className="auth-overlay">
      <form className="auth-card" onSubmit={onSubmit}>
        <div className="auth-head">
          <h2>{authMode === "login" ? l("Connexion", "Login") : l("Inscription", "Sign up")}</h2>
          <button type="button" className="auth-close" onClick={onClose}><X size={16} /></button>
        </div>
        <p>{l("Ouvre ton noyau de commandement et laisse ton empreinte dans l'orbite noire.", "Open your command core and leave your mark in dark orbit.")}</p>

        <div className="auth-tabs">
          <button type="button" className={authMode === "login" ? "active" : ""} onClick={() => onModeChange("login")}>{l("Connexion", "Login")}</button>
          <button type="button" className={authMode === "signup" ? "active" : ""} onClick={() => onModeChange("signup")}>{l("Inscription", "Sign up")}</button>
        </div>

        {authMode === "signup" ? (
          <>
            <label>
              {l("Pseudo", "Username")}
              <input
                value={authUsername}
                onChange={(e) => onUsernameChange(e.target.value)}
                placeholder="CommandantNova"
                minLength={3}
                autoComplete="username"
                required
              />
            </label>
            <label>
              {l("Langue", "Language")}
              <select value={authLanguage} onChange={(e) => onLanguageChange(e.target.value === "en" ? "en" : "fr")}>
                <option value="fr">{l("Francais", "French")}</option>
                <option value="en">English</option>
              </select>
            </label>
          </>
        ) : null}

        <label>
          {l("Email (pas le pseudo)", "Email (not username)")}
          <input
            value={authEmail}
            onChange={(e) => onEmailChange(e.target.value)}
            placeholder={language === "en" ? "email@example.com" : "email@exemple.com"}
            type="email"
            autoComplete="email"
            required
          />
        </label>

        <label>
          {l("Mot de passe", "Password")}
          <input
            value={authPassword}
            onChange={(e) => onPasswordChange(e.target.value)}
            type="password"
            minLength={8}
            autoComplete={authMode === "signup" ? "new-password" : "current-password"}
            required
          />
        </label>

        {authError ? <div className="auth-error">{authError}</div> : null}

        <button type="submit" className="auth-submit" disabled={authLoading}>
          {authLoading ? l("Chargement...", "Loading...") : authMode === "login" ? l("Se connecter", "Sign in") : l("Creer le compte", "Create account")}
        </button>
      </form>
    </div>
  );
}

function ProfileScreen({
  language,
  profileUsername,
  profileEmail,
  profileLanguage,
  profileAvatar,
  avatarOptions,
  profileError,
  profileSaved,
  profileLoading,
  onUsernameChange,
  onEmailChange,
  onLanguageChange,
  onAvatarChange,
  onSubmit
}: {
  language: UILanguage;
  profileUsername: string;
  profileEmail: string;
  profileLanguage: "fr" | "en";
  profileAvatar: string;
  avatarOptions: string[];
  profileError: string;
  profileSaved: string;
  profileLoading: boolean;
  onUsernameChange: (v: string) => void;
  onEmailChange: (v: string) => void;
  onLanguageChange: (v: "fr" | "en") => void;
  onAvatarChange: (v: string) => void;
  onSubmit: (e: FormEvent) => void;
}) {
  const l = (fr: string, en: string) => (language === "en" ? en : fr);
  return (
    <main className="profile-layout">
      <form className="profile-card" onSubmit={onSubmit}>
        <h2>{l("Identite du Commandant", "Commander Identity")}</h2>
        <p>{l("Personnalisez votre presence dans le reseau de l'hyperstructure.", "Customize your presence in the hyperstructure network.")}</p>

        <div className="profile-grid">
          <label>
            {l("Pseudo", "Username")}
            <input value={profileUsername} onChange={(e) => onUsernameChange(e.target.value)} minLength={3} required />
          </label>

          <label>
            Email
            <input value={profileEmail} onChange={(e) => onEmailChange(e.target.value)} type="email" required />
          </label>

          <label>
            <Globe size={14} /> {l("Langue", "Language")}
            <select value={profileLanguage} onChange={(e) => onLanguageChange(e.target.value === "en" ? "en" : "fr")}>
              <option value="fr">{l("Francais", "French")}</option>
              <option value="en">English</option>
            </select>
          </label>
        </div>

        <div className="avatar-block">
          <p>{l("Choisir un avatar", "Choose an avatar")}</p>
          <div className="avatar-grid">
            {avatarOptions.map((avatar, idx) => (
              <button
                type="button"
                key={avatar}
                className={`avatar-option ${profileAvatar === avatar ? "active" : ""}`}
                onClick={() => onAvatarChange(avatar)}
                title={`Avatar ${idx + 1}`}
              >
                <img
                  src={avatar}
                  alt={`Avatar ${idx + 1}`}
                  onError={(e) => {
                    (e.currentTarget as HTMLImageElement).style.display = "none";
                  }}
                />
                <span>{idx + 1}</span>
              </button>
            ))}
          </div>
        </div>

        {profileError ? <div className="profile-msg error">{profileError}</div> : null}
        {profileSaved ? <div className="profile-msg ok">{profileSaved}</div> : null}

        <button type="submit" className="profile-save" disabled={profileLoading}>
          <Save size={16} />
          {profileLoading ? l("Enregistrement...", "Saving...") : l("Enregistrer le profil", "Save profile")}
        </button>

        <div className="profile-note">
          <Mail size={14} />
          <span>{l("Le pseudo, la langue et l'avatar sont synchronises. L'email saisi est conserve pour la prochaine etape securisee.", "Username, language and avatar are synced. Entered email is kept for the next secure step.")}</span>
        </div>
      </form>
    </main>
  );
}

function StatLine({ icon, label, value }: { icon: JSX.Element; label: string; value: number }) {
  return (
    <div className="stat-line">
      <span className="stat-label">
        {icon}
        <span>{label}</span>
      </span>
      <strong className="stat-value">{value.toLocaleString()}</strong>
    </div>
  );
}

function BuildModal({
  language,
  buildSlot,
  resourceAmounts,
  rooms,
  currentPopulation,
  constructionJob,
  buildingCostReductionFactor,
  buildingTimeReductionFactor,
  onBuild,
  onClose,
  getAvailableSpace
}: {
  language: UILanguage;
  buildSlot: { x: number; y: number } | null;
  resourceAmounts: Record<string, number>;
  rooms: Room[];
  currentPopulation: number;
  constructionJob: ConstructionJob | null;
  buildingCostReductionFactor: number;
  buildingTimeReductionFactor: number;
  onBuild: (type: RoomType) => void;
  onClose: () => void;
  getAvailableSpace: (x: number, y: number) => { minX: number; maxX: number; width: number };
}) {
  const l = (fr: string, en: string) => (language === "en" ? en : fr);
  const [buildTab, setBuildTab] = useState<"production" | "population">("production");

  const free = buildSlot
    ? getAvailableSpace(buildSlot.x, buildSlot.y)
    : { minX: 0, maxX: 0, width: 0 };
  const buildableTypes = buildSlot
    ? BUILDABLE_ROOMS.filter((type) => !rooms.some((r) => r.type === type))
    : [];
  const productionTypes = buildableTypes.filter((type) => {
    const group = ROOM_CONFIG[type].buildGroup;
    return group === "production" || group === "infrastructure";
  });
  const populationTypes = buildableTypes.filter((type) => ROOM_CONFIG[type].buildGroup === "population");
  const visibleTypes = buildTab === "production" ? productionTypes : populationTypes;

  useEffect(() => {
    if (buildTab === "production" && productionTypes.length <= 0 && populationTypes.length > 0) {
      setBuildTab("population");
      return;
    }
    if (buildTab === "population" && populationTypes.length <= 0 && productionTypes.length > 0) {
      setBuildTab("production");
    }
  }, [buildTab, populationTypes.length, productionTypes.length]);

  if (!buildSlot) return null;

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal-card" onClick={(e) => e.stopPropagation()}>
        <div className="modal-head">
          <h3>{l("Construire un module", "Build a module")}</h3>
          <button onClick={onClose}><X size={16} /></button>
        </div>

        <div className="build-tabs">
          <button
            type="button"
            className={buildTab === "production" ? "active" : ""}
            onClick={() => setBuildTab("production")}
          >
            {l("Production", "Production")}
            <span>{productionTypes.length}</span>
          </button>
          <button
            type="button"
            className={buildTab === "population" ? "active" : ""}
            onClick={() => setBuildTab("population")}
          >
            {l("Population", "Population")}
            <span>{populationTypes.length}</span>
          </button>
        </div>

        <div className="room-grid">
          {visibleTypes.map((type) => {
            const cfg = ROOM_CONFIG[type];
            const cost = costForLevel(type, 1, buildingCostReductionFactor);
            const affordable = canAffordCost(resourceAmounts, cost);
            const fits = cfg.width <= free.width;
            const populationUnlocked = isPopulationBuildingUnlocked(type, currentPopulation);
            const populationRequired = type in POPULATION_BUILD_UNLOCK_MIN
              ? POPULATION_BUILD_UNLOCK_MIN[type as PopulationBuildingId] ?? 0
              : 0;
            const disabled = !affordable || !fits || !populationUnlocked || Boolean(constructionJob);

            return (
              <button key={type} className={`build-item ${disabled ? "disabled" : ""}`} disabled={disabled} onClick={() => onBuild(type)}>
                <span className={`dot ${cfg.color}`}>{cfg.icon}</span>
                <span className="title">{roomDisplayName(type, language)}</span>
                <span>{l("Largeur", "Width")} {cfg.width}</span>
                <div className="build-item-cost">
                  <ResourceCostDisplay cost={cost} available={resourceAmounts} language={language} compact />
                </div>
                <span>{l("Temps", "Time")} {formatDuration(buildSecondsForLevel(type, 1, buildingTimeReductionFactor))}</span>
                {!populationUnlocked ? (
                  <em>
                    {l("Population requise", "Population required")} {populationRequired.toLocaleString()}
                  </em>
                ) : null}
                {!fits && <em>{l("Espace horizontal insuffisant", "Not enough horizontal space")}</em>}
                {!affordable && <em>{l("Ressources insuffisantes", "Not enough resources")}</em>}
                {constructionJob ? <em>{l("File de construction occupee", "Construction queue busy")}</em> : null}
              </button>
            );
          })}
          {visibleTypes.length === 0 ? (
            <p className="planner-empty">
              {buildTab === "production"
                ? l(
                    "Tous les modules de production constructibles ont deja ete deployes.",
                    "All buildable production modules are already deployed."
                  )
                : l(
                    "Aucun batiment de population disponible pour le moment.",
                    "No population building available yet."
                  )}
            </p>
          ) : null}
        </div>
      </div>
    </div>
  );
}

function UpgradeModal({
  language,
  room,
  resourceAmounts,
  constructionJob,
  buildingCostReductionFactor,
  buildingTimeReductionFactor,
  productionBonusesByResource,
  inventoryItems,
  inventoryLoading,
  inventoryActionLoadingId,
  inventoryError,
  constructionRemainingSeconds,
  onClose,
  onUpgrade,
  onUseBoost
}: {
  language: UILanguage;
  room: Room | null;
  resourceAmounts: Record<string, number>;
  constructionJob: ConstructionJob | null;
  buildingCostReductionFactor: number;
  buildingTimeReductionFactor: number;
  productionBonusesByResource: Record<ResourceId, number>;
  inventoryItems: InventoryViewItem[];
  inventoryLoading: boolean;
  inventoryActionLoadingId: string;
  inventoryError: string;
  constructionRemainingSeconds: number;
  onClose: () => void;
  onUpgrade: (room: Room) => void;
  onUseBoost: (itemId: string, quantity?: number) => void;
}) {
  const l = (fr: string, en: string) => (language === "en" ? en : fr);
  const [boostOpen, setBoostOpen] = useState(false);
  const [boostItemId, setBoostItemId] = useState("");
  const [boostQuantityInput, setBoostQuantityInput] = useState("1");
  const isRoomUnderUpgrade = Boolean(
    constructionJob && constructionJob.mode === "upgrade" && constructionJob.roomId === room?.id
  );
  const isPendingBuild = Boolean(
    constructionJob && constructionJob.mode === "build" && room?.id === PENDING_BUILD_ROOM_ID
  );
  const isRoomBusy = isRoomUnderUpgrade || isPendingBuild;
  const boostItems = useMemo(
    () =>
      inventoryItems
        .filter((item) => item.category === "TIME_BOOST" && (item.durationSeconds ?? 0) > 0 && item.quantity > 0)
        .sort((a, b) => (a.durationSeconds ?? 0) - (b.durationSeconds ?? 0)),
    [inventoryItems]
  );

  useEffect(() => {
    setBoostOpen(false);
    setBoostItemId("");
    setBoostQuantityInput("1");
  }, [room?.id]);

  useEffect(() => {
    if (!boostOpen) return;
    if (boostItems.length === 0) {
      setBoostItemId("");
      return;
    }
    if (!boostItemId || !boostItems.some((item) => item.id === boostItemId)) {
      setBoostItemId(boostItems[0].id);
      setBoostQuantityInput("1");
    }
  }, [boostItemId, boostItems, boostOpen]);

  useEffect(() => {
    if (isRoomBusy) return;
    setBoostOpen(false);
  }, [isRoomBusy]);

  if (!room) return null;

  const cfg = ROOM_CONFIG[room.type];
  const atMax = room.level >= cfg.maxLevel;
  const nextCost = costForLevel(room.type, room.level + 1, buildingCostReductionFactor);
  const canPay = canAffordCost(resourceAmounts, nextCost);
  const isResource = Boolean(cfg.resourceId);
  const effectiveLevel = isPendingBuild ? 0 : room.level;
  const current = isPendingBuild
    ? 0
    : cfg.resourceId
      ? computeProductionPerSecond(cfg.resourceId, effectiveLevel, productionBonusesByResource[cfg.resourceId] ?? 0)
      : room.type === "entrepot"
        ? computeStorageCapacity(effectiveLevel)
        : 0;
  const next = cfg.resourceId
    ? computeProductionPerSecond(cfg.resourceId, effectiveLevel + 1, productionBonusesByResource[cfg.resourceId] ?? 0)
    : room.type === "entrepot"
      ? computeStorageCapacity(effectiveLevel + 1)
      : 0;
  const deltaNext = Math.max(0, next - current);
  const projectionStart = Math.max(1, effectiveLevel - 1);
  const projectionLevels = Array.from({ length: 7 }, (_, idx) => projectionStart + idx).filter((lvl) => lvl <= effectiveLevel + 5);
  const selectedBoost = boostItems.find((item) => item.id === boostItemId) ?? (boostItems.length > 0 ? boostItems[0] : null);
  const requestedBoostQuantity = Math.max(1, Math.floor(Number(boostQuantityInput) || 1));
  const effectiveBoostQuantity = selectedBoost ? Math.min(requestedBoostQuantity, selectedBoost.quantity) : 0;
  const totalBoostSeconds = selectedBoost ? Math.max(0, Math.floor((selectedBoost.durationSeconds ?? 0) * effectiveBoostQuantity)) : 0;
  const remainingAfterBoost = Math.max(0, constructionRemainingSeconds - totalBoostSeconds);
  const boostLoading = Boolean(selectedBoost) && inventoryActionLoadingId === selectedBoost.id;
  const canUseBoost =
    isRoomBusy && Boolean(selectedBoost) && effectiveBoostQuantity > 0 && !boostLoading && !inventoryLoading;

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal-card small upgrade-modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-head">
          <h3>{roomDisplayName(room.type, language)}</h3>
          <button onClick={onClose}><X size={16} /></button>
        </div>

        <div className="upgrade-body">
          <div className="upgrade-level-line">
            <span>{l("Niveau", "Level")} {effectiveLevel}</span>
            <em>{isRoomBusy ? l("File occupee", "Queue busy") : l("Pret", "Ready")}</em>
          </div>
          <p className="upgrade-stat-main">
            {isResource ? l("Production/sec", "Production/sec") : room.type === "entrepot" ? l("Capacite stockage", "Storage capacity") : l("Structure", "Structure")}:
            <strong>{isResource ? current.toFixed(3) : Math.floor(current).toLocaleString()}</strong>
            {!atMax ? <span>{"-> "}{isResource ? next.toFixed(3) : Math.floor(next).toLocaleString()}</span> : null}
          </p>
          {!atMax && isResource ? (
            <p className="upgrade-next-gain">
              {l("Gain niveau suivant", "Next level gain")}: <strong>+{deltaNext.toFixed(3)}/s</strong> <span>(+{(deltaNext * 3600).toFixed(1)}/h)</span>
            </p>
          ) : null}
          {!atMax ? (
            <div className="upgrade-cost-line">
              <span className="upgrade-cost-label">{l("Cout", "Cost")}:</span>
              <ResourceCostDisplay cost={nextCost} available={resourceAmounts} language={language} compact />
            </div>
          ) : null}
          <p className="upgrade-time-line">
            {isPendingBuild ? l("Temps construction", "Construction time") : l("Temps prochain niveau", "Next level time")}:
            {" "}
            {formatDuration(buildSecondsForLevel(room.type, effectiveLevel + 1, buildingTimeReductionFactor))}
          </p>

          {isResource ? (
            <details className="upgrade-spoiler">
              <summary>{l("Projection production (n-1 a n+5)", "Production projection (n-1 to n+5)")}</summary>
              <div className="upgrade-projection-grid">
                <div className="head">{l("Niveau", "Level")}</div>
                <div className="head">/sec</div>
                <div className="head">{l("/heure", "/hour")}</div>
                {projectionLevels.map((lvl) => {
                  const valueSec = computeProductionPerSecond(cfg.resourceId!, lvl, productionBonusesByResource[cfg.resourceId!] ?? 0);
                  const valueHour = valueSec * 3600;
                  const marker = lvl === effectiveLevel ? "current" : lvl === effectiveLevel + 1 ? "next" : "";
                  return (
                    <Fragment key={`projection_${lvl}`}>
                      <div className={`cell ${marker}`}>N{lvl}</div>
                      <div className={`cell ${marker}`}>{valueSec.toFixed(3)}</div>
                      <div className={`cell ${marker}`}>{valueHour.toFixed(1)}</div>
                    </Fragment>
                  );
                })}
              </div>
            </details>
          ) : null}
        </div>

        {!constructionJob ? (
          <div className="upgrade-actions upgrade-only">
            <button className="ok" disabled={atMax || !canPay} onClick={() => onUpgrade(room)}>
              <ArrowUpCircle size={16} />
              {atMax ? l("NIVEAU MAX", "MAX LEVEL") : l("Ameliorer le module", "Upgrade module")}
            </button>
          </div>
        ) : null}

        {isRoomBusy ? (
          <div className="upgrade-actions boost-only">
            <button
              className="boost-toggle"
              disabled={inventoryLoading || boostItems.length === 0}
              onClick={() => setBoostOpen((prev) => !prev)}
            >
              <Hourglass size={16} />
              {inventoryLoading ? l("Chargement...", "Loading...") : boostOpen ? l("Fermer acceleration", "Close acceleration") : l("Acceleration", "Acceleration")}
            </button>
          </div>
        ) : null}

        {isRoomBusy && boostOpen ? (
          <div className="upgrade-boost-panel">
            <div className="upgrade-boost-grid">
              {boostItems.map((item) => {
                const active = selectedBoost?.id === item.id;
                return (
                  <button
                    type="button"
                    key={item.id}
                    className={`upgrade-boost-item ${active ? "active" : ""}`}
                    onClick={() => setBoostItemId(item.id)}
                  >
                    <img
                      src={resolveTimeBoostImage(item.durationSeconds)}
                      alt={item.name}
                      onError={(e) => {
                        const img = e.currentTarget as HTMLImageElement;
                        if (!img.src.endsWith(TIME_BOOST_ITEM_IMAGE)) {
                          img.src = TIME_BOOST_ITEM_IMAGE;
                        }
                      }}
                    />
                    <div className="upgrade-boost-item-meta">
                      <strong>{formatBoostDurationLabel(item.durationSeconds ?? 0)}</strong>
                      <span>{item.quantity.toLocaleString()} {l("dispo", "available")}</span>
                    </div>
                  </button>
                );
              })}
            </div>

            {selectedBoost ? (
              <div className="upgrade-boost-controls">
                <label htmlFor="boost-quantity">{l("Quantite", "Quantity")}</label>
                <input
                  id="boost-quantity"
                  type="number"
                  min={1}
                  max={selectedBoost.quantity}
                  value={boostQuantityInput}
                  onChange={(e) => setBoostQuantityInput(e.target.value)}
                />
                <p className="upgrade-boost-preview">
                  {l("Reduction", "Reduction")}: <strong>-{formatDuration(totalBoostSeconds)}</strong>
                  <span>
                    {constructionJob
                      ? ` | ${l("Restant", "Remaining")} ${formatDuration(constructionRemainingSeconds)} -> ${formatDuration(remainingAfterBoost)}`
                      : ""}
                  </span>
                </p>
                <button
                  type="button"
                  className="upgrade-boost-apply"
                  disabled={!canUseBoost}
                  onClick={() => {
                    if (!selectedBoost || effectiveBoostQuantity <= 0) return;
                    onUseBoost(selectedBoost.id, effectiveBoostQuantity);
                  }}
                >
                  {boostLoading
                    ? l("Activation...", "Activating...")
                    : `${l("Lancer", "Launch")} x${effectiveBoostQuantity} (${formatBoostDurationLabel(selectedBoost.durationSeconds ?? 0)})`}
                </button>
                {requestedBoostQuantity > selectedBoost.quantity ? (
                  <p className="upgrade-boost-note">{l("Quantite ajustee au stock disponible", "Quantity adjusted to available stock")} ({selectedBoost.quantity}).</p>
                ) : null}
              </div>
            ) : null}

            {inventoryError ? <p className="upgrade-boost-error">{inventoryError}</p> : null}
          </div>
        ) : null}
      </div>
    </div>
  );
}

