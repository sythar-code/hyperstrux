import { Client, Session } from "@heroiclabs/nakama-js";
import * as THREE from "three";
import AllianceCommandScreen from "./AllianceCommandScreen";
import PopulationCommandScreen from "./PopulationCommandScreen";
import ResourceCommandScreen from "./ResourceCommandScreen";
import TechnologyCommandScreen from "./TechnologyCommandScreen";
import WikiKnowledgeScreen from "./WikiKnowledgeScreen";
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
  ChevronRight,
  SlidersHorizontal
} from "lucide-react";
import {
  CSSProperties,
  FocusEvent,
  FormEvent,
  Fragment,
  useCallback,
  useEffect,
  useLayoutEffect,
  useMemo,
  useRef,
  useState
} from "react";

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

type CommanderId = "selene_voss" | "kael_ardent" | "lyra_nova" | "orion_hale";

type CommanderDef = {
  id: CommanderId;
  nameFr: string;
  nameEn: string;
  titleFr: string;
  titleEn: string;
  descriptionFr: string;
  descriptionEn: string;
  bonusLabelFr: string;
  bonusLabelEn: string;
  accent: string;
  image: string;
  productionMultiplier?: number;
  buildingTimeFactor?: number;
  researchTimeFactor?: number;
  storageMultiplier?: number;
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
const PROFILE_COMMANDER_COLLECTION = "hyperstructure_profile";
const PROFILE_COMMANDER_KEY = "commander_state_v1";
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
  const scaled = safe / SCORE_DISPLAY_DIVISOR;
  return Math.max(0.01, Math.round(scaled * 100) / 100);
};

const formatDisplayedScoreLabel = (rawScore: number) => {
  const safe = formatDisplayedScoreValue(rawScore);
  if (safe <= 0) return "0";
  return safe.toLocaleString(undefined, {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  });
};

function resolveTimeBoostImage(durationSeconds?: number | null) {
  const secs = Math.max(0, Math.floor(Number(durationSeconds ?? 0)));
  return TIME_BOOST_IMAGE_BY_SECONDS[secs] ?? TIME_BOOST_ITEM_IMAGE;
}

const DEFAULT_COMMANDER_ID: CommanderId = "selene_voss";

const COMMANDER_DEFS: Record<CommanderId, CommanderDef> = {
  selene_voss: {
    id: "selene_voss",
    nameFr: "Selene Voss",
    nameEn: "Selene Voss",
    titleFr: "Architecte des Flux",
    titleEn: "Flux Architect",
    descriptionFr: "Optimise les chaines de production et stabilise les rendements de l'hyperstructure.",
    descriptionEn: "Optimizes production chains and stabilizes hyperstructure output.",
    bonusLabelFr: "Production globale +8%",
    bonusLabelEn: "Global production +8%",
    accent: "#60d7c2",
    image: "/room-images/commandant1.png",
    productionMultiplier: 1.08
  },
  kael_ardent: {
    id: "kael_ardent",
    nameFr: "Kael Ardent",
    nameEn: "Kael Ardent",
    titleFr: "Maitre des Chantiers",
    titleEn: "Dockmaster",
    descriptionFr: "Coordonne les equipes de construction pour reduire les temps de chantier.",
    descriptionEn: "Coordinates construction crews to reduce build times.",
    bonusLabelFr: "Temps de construction -10%",
    bonusLabelEn: "Construction time -10%",
    accent: "#6db9ff",
    image: "/room-images/commandant4.png",
    buildingTimeFactor: 0.9
  },
  lyra_nova: {
    id: "lyra_nova",
    nameFr: "Lyra Nova",
    nameEn: "Lyra Nova",
    titleFr: "Directrice Scientifique",
    titleEn: "Science Director",
    descriptionFr: "Accelere les cycles de recherche et la priorisation des laboratoires.",
    descriptionEn: "Accelerates research cycles and laboratory prioritization.",
    bonusLabelFr: "Temps de recherche -10%",
    bonusLabelEn: "Research time -10%",
    accent: "#9e8cff",
    image: "/room-images/commandant3.png",
    researchTimeFactor: 0.9
  },
  orion_hale: {
    id: "orion_hale",
    nameFr: "Orion Hale",
    nameEn: "Orion Hale",
    titleFr: "Strategiste Logistique",
    titleEn: "Logistics Strategist",
    descriptionFr: "Renforce les chaines de stockage et retarde la saturation des entrepots.",
    descriptionEn: "Strengthens storage chains and delays warehouse saturation.",
    bonusLabelFr: "Capacite d'entrepot +15%",
    bonusLabelEn: "Storage capacity +15%",
    accent: "#f0b86f",
    image: "/room-images/commandant2.png",
    storageMultiplier: 1.15
  }
};

const COMMANDER_IDS = Object.keys(COMMANDER_DEFS) as CommanderId[];

const commanderLabel = (commanderId: CommanderId, language: UILanguage) =>
  language === "en" ? COMMANDER_DEFS[commanderId].nameEn : COMMANDER_DEFS[commanderId].nameFr;

const commanderTitle = (commanderId: CommanderId, language: UILanguage) =>
  language === "en" ? COMMANDER_DEFS[commanderId].titleEn : COMMANDER_DEFS[commanderId].titleFr;

const commanderDescription = (commanderId: CommanderId, language: UILanguage) =>
  language === "en" ? COMMANDER_DEFS[commanderId].descriptionEn : COMMANDER_DEFS[commanderId].descriptionFr;

const commanderBonusLabel = (commanderId: CommanderId, language: UILanguage) =>
  language === "en" ? COMMANDER_DEFS[commanderId].bonusLabelEn : COMMANDER_DEFS[commanderId].bonusLabelFr;

const commanderIdFromAvatar = (avatarUrl?: string | null): CommanderId =>
  COMMANDER_IDS.find((id) => COMMANDER_DEFS[id].image === (avatarUrl || "").trim()) ?? DEFAULT_COMMANDER_ID;

type LoginIntroBackdropId = "void" | "orbital" | "collapse" | "command";
type LoginIntroSpeaker = "system" | "kael" | "lyra" | "title";

type LoginIntroScene = {
  id: number;
  speaker: LoginIntroSpeaker;
  backdrop: LoginIntroBackdropId;
  accent?: "amber" | "cyan";
  side?: "left" | "right";
  textFr: string;
  textEn: string;
  autoAdvanceMs?: number;
};

const LOGIN_INTRO_SCENES: LoginIntroScene[] = [
  {
    id: 0,
    speaker: "system",
    backdrop: "void",
    textFr:
      "ANNÉE 2847\n\nLes mondes habitables sont tombés les uns après les autres.\nIl ne reste plus que des hyperstructures, des routes minières… et le vide.",
    textEn:
      "YEAR 2847\n\nThe habitable worlds have fallen one by one.\nOnly hyperstructures, mining routes and the void remain.",
    autoAdvanceMs: 2200
  },
  {
    id: 1,
    speaker: "kael",
    backdrop: "orbital",
    accent: "amber",
    side: "left",
    textFr:
      "Le dernier relevé orbital est sans appel.\nLes réserves faciles sont épuisées.\nLes prochaines semaines se joueront sur l’acier, le carburant et la discipline.",
    textEn:
      "The latest orbital scan is conclusive. Easy reserves are gone. The coming weeks will be decided by steel, fuel and discipline."
  },
  {
    id: 2,
    speaker: "lyra",
    backdrop: "orbital",
    accent: "cyan",
    side: "right",
    textFr:
      "Les alliances se reforment déjà.\nLes champs de ressources attirent les flottes, les opportunistes et les prédateurs.\nDésormais, chaque départ est une décision stratégique.",
    textEn:
      "Alliances are already reforming. Resource fields attract fleets, opportunists and predators. Every launch becomes a strategic decision."
  },
  {
    id: 3,
    speaker: "system",
    backdrop: "collapse",
    textFr:
      "Autour de votre hyperstructure, les anciennes orbites ne sont plus que des cicatrices lumineuses.\nLe trafic civil se mêle aux convois militaires dans un même flux de survie.",
    textEn:
      "[Around your hyperstructure, former orbits are now little more than luminous scars.]\n[Civilian traffic blends into military convoys.]",
    autoAdvanceMs: 1800
  },
  {
    id: 4,
    speaker: "kael",
    backdrop: "command",
    accent: "amber",
    side: "left",
    textFr:
      "Votre structure n’est pas prête.\nLes entrepôts saturent.\nLes chantiers manquent de cadence.\nLa moindre erreur logistique se paiera en retard, en famine… ou en pertes.",
    textEn:
      "Your structure is not ready. Warehouses saturate. Shipyards lack tempo. The smallest logistical failure will be paid in delays, hunger or losses."
  },
  {
    id: 5,
    speaker: "lyra",
    backdrop: "command",
    accent: "cyan",
    side: "right",
    textFr:
      "{player}, vos priorités sont claires :\nstabiliser la population, ouvrir les chaînes de production, sécuriser les champs de ressources,\net ne jamais laisser l’ennemi imposer le tempo.",
    textEn:
      "{player}, your priorities are simple: stabilize the population, expand production chains, secure resource fields and never let the enemy set the tempo."
  },
  {
    id: 6,
    speaker: "kael",
    backdrop: "command",
    accent: "amber",
    side: "left",
    textFr:
      "Construisez plus vite que vos rivaux.\nRécoltez avant eux.\nRenforcez vos flottes avant qu’ils ne découvrent vos faiblesses.",
    textEn:
      "Build faster than your rivals. Harvest before they do. Reinforce your fleets before they discover your weaknesses."
  },
  {
    id: 7,
    speaker: "lyra",
    backdrop: "command",
    accent: "cyan",
    side: "right",
    textFr:
      "Vous ne dirigez pas une simple station.\nVous dirigez une civilisation suspendue dans le vide.\nChaque module, chaque recherche, chaque escadre peut faire pencher l’avenir.",
    textEn:
      "You are not running a simple station. You are leading a civilization suspended in the void. Every module, every research cycle, every squadron matters."
  },
  {
    id: 8,
    speaker: "title",
    backdrop: "void",
    textFr: "HYPERSTRUX\nPROTOCOLE DE COMMANDEMENT",
    textEn: "HYPERSTRUX\nCOMMAND PROTOCOL",
    autoAdvanceMs: 2600
  }
];

const LOGIN_INTRO_BACKDROP_STYLES: Record<LoginIntroBackdropId, CSSProperties> = {
  void: {
    background:
      "radial-gradient(circle at 50% -10%, rgba(89, 176, 255, 0.18), transparent 32%), linear-gradient(180deg, #01040a 0%, #02050d 45%, #000103 100%)"
  },
  orbital: {
    background:
      "radial-gradient(circle at 18% 18%, rgba(77, 155, 255, 0.16), transparent 24%), radial-gradient(circle at 82% 76%, rgba(35, 197, 255, 0.1), transparent 22%), linear-gradient(160deg, #04101a 0%, #071726 45%, #02060d 100%)"
  },
  collapse: {
    background:
      "radial-gradient(circle at 24% 42%, rgba(255, 108, 59, 0.16), transparent 24%), radial-gradient(circle at 78% 18%, rgba(101, 167, 255, 0.12), transparent 22%), linear-gradient(180deg, #140606 0%, #120a16 52%, #04030a 100%)"
  },
  command: {
    background:
      "radial-gradient(circle at 50% 100%, rgba(0, 209, 255, 0.14), transparent 28%), radial-gradient(circle at 50% 0%, rgba(79, 130, 255, 0.12), transparent 20%), linear-gradient(180deg, #03101b 0%, #041523 40%, #01070d 100%)"
  }
};

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
  | "settings"
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

type BuildGuideEntry = {
  roleFr: string;
  roleEn: string;
  detailsFr: string[];
  detailsEn: string[];
  tipsFr: string[];
  tipsEn: string[];
};

const BUILD_GUIDE_CONTENT: Partial<Record<RoomType, BuildGuideEntry>> = {
  carbone: {
    roleFr: "Base absolue de ton economie. Le carbone finance presque tout le debut de partie.",
    roleEn: "Absolute foundation of your economy. Carbon funds almost everything early on.",
    detailsFr: [
      "Produit la ressource la plus demandee pour les constructions, upgrades et debuts de tech.",
      "Sert de socle a toute la chaine industrielle : si le carbone manque, tout ralentit.",
      "Consomme des travailleurs, donc il faut suivre ta population en parallele."
    ],
    detailsEn: [
      "Produces the most demanded resource for buildings, upgrades and early tech.",
      "Acts as the base of the whole industrial chain: if carbon stalls, everything stalls.",
      "Consumes workers, so population growth must keep up."
    ],
    tipsFr: [
      "Priorite debut de partie : garde toujours plusieurs niveaux d'avance sur tes besoins immediats.",
      "Monte-le avant de forcer les ressources avancees, sinon tu bloques toute ta progression.",
      "Si ton personnel libre baisse trop, tu as peut-etre surdeveloppe la production trop vite."
    ],
    tipsEn: [
      "Early priority: keep it a few levels ahead of your immediate needs.",
      "Upgrade it before forcing advanced resources or your whole progression will choke.",
      "If free staffing drops too much, you likely expanded production too fast."
    ]
  },
  titane: {
    roleFr: "Deuxieme pilier economique. Le titane accompagne presque toutes les structures serieuses.",
    roleEn: "Second economic pillar. Titanium supports almost every serious structure.",
    detailsFr: [
      "Monte en meme temps que le carbone sur tout le mid game.",
      "Devient vite un cout recurrent pour hangar, technologies et batiments civils.",
      "Comme le carbone, il mobilise des travailleurs."
    ],
    detailsEn: [
      "Should grow alongside carbon through the whole mid game.",
      "Quickly becomes a recurring cost for hangar, technologies and civic buildings.",
      "Like carbon, it ties up workers."
    ],
    tipsFr: [
      "Evite de laisser le titane trop loin derriere le carbone.",
      "Si tu prepares une phase militaire ou population, monte le titane avant.",
      "Surveille ton entrepot : un titane bloque coupe ton rythme de construction."
    ],
    tipsEn: [
      "Do not let titanium lag too far behind carbon.",
      "If you plan a military or population phase, push titanium first.",
      "Watch your storage: blocked titanium kills your building tempo."
    ]
  },
  osmium: {
    roleFr: "Premier palier de ressource avancee. Il debloque une economie plus dense.",
    roleEn: "First advanced resource tier. It unlocks a denser economy.",
    detailsFr: [
      "Intervient dans les batiments plus techniques et les paliers de progression du milieu de partie.",
      "Chaque niveau demande davantage de main-d'oeuvre qu'une simple mine de carbone ou titane.",
      "C'est souvent la premiere vraie ressource qui crée des goulets."
    ],
    detailsEn: [
      "Used in more technical buildings and mid-game progression tiers.",
      "Each level demands more workforce than a simple carbon or titanium line.",
      "It is often the first resource that creates real bottlenecks."
    ],
    tipsFr: [
      "Ne l'ouvre pas trop tot si ta population n'est pas stable.",
      "Monte-le quand ton carbone et ton titane sont deja confortables.",
      "Si tes files ralentissent, regarde d'abord si l'osmium manque."
    ],
    tipsEn: [
      "Do not unlock it too early if your population is unstable.",
      "Scale it when carbon and titanium already feel comfortable.",
      "If your queues slow down, check osmium first."
    ]
  },
  adamantium: {
    roleFr: "Ressource lourde pour les paliers solides du mid/late game.",
    roleEn: "Heavy resource for solid mid/late-game tiers.",
    detailsFr: [
      "Sert aux batiments plus chers, aux composantes plus militaires et aux progressions robustes.",
      "Demande une economie de base deja saine pour etre rentable.",
      "Mobilise beaucoup de travailleurs par niveau."
    ],
    detailsEn: [
      "Feeds pricier buildings, stronger military layers and robust progression steps.",
      "Needs a healthy base economy to be worth it.",
      "Consumes a lot of workers per level."
    ],
    tipsFr: [
      "N'investis pas dedans si ton carbone/titane/osmium sont encore tendus.",
      "Monte-le par paliers pour accompagner tes besoins, pas par reflexe.",
      "Si ta population souffre, ce batiment est souvent trop cher en workforce."
    ],
    tipsEn: [
      "Do not invest in it while carbon, titanium or osmium still feel tight.",
      "Scale it in steps to match demand, not by reflex.",
      "If your population is strained, this building is often too workforce-heavy."
    ]
  },
  magmatite: {
    roleFr: "Ressource avancee de specialisation. Elle sert a densifier ton compte.",
    roleEn: "Advanced specialization resource used to deepen your account.",
    detailsFr: [
      "Entre dans les chaines plus exigeantes de progression.",
      "Ne sert vraiment que si ton economie de base tient deja sans assistance.",
      "Chaque niveau augmente la pression sur la main-d'oeuvre."
    ],
    detailsEn: [
      "Feeds more demanding progression chains.",
      "Only becomes truly useful once your base economy runs comfortably.",
      "Each level increases workforce pressure."
    ],
    tipsFr: [
      "Considere-la comme un luxe controle, pas comme une priorite debut/mid.",
      "Monte-la quand tu sais deja pourquoi tu en as besoin.",
      "Si ton personnel logistique manque, ralentis ici avant de couper les batiments de base."
    ],
    tipsEn: [
      "Treat it as controlled luxury, not as an early or mid-game priority.",
      "Upgrade it when you know exactly why you need it.",
      "If staffing is tight, slow this line before cutting core production."
    ]
  },
  neodyme: {
    roleFr: "Ressource de propulsion et de sophistication industrielle.",
    roleEn: "Resource tied to propulsion and industrial sophistication.",
    detailsFr: [
      "Sert a soutenir des paliers plus techniques et des compositions plus avancees.",
      "A besoin d'une population deja saine pour ne pas peser sur tout le reste.",
      "Coute cher en temps et en main-d'oeuvre."
    ],
    detailsEn: [
      "Supports more technical tiers and advanced compositions.",
      "Needs a healthy population base or it drags down everything else.",
      "Expensive in both time and workforce."
    ],
    tipsFr: [
      "Monte-le quand tu prevois une vraie acceleration technologique ou hangar.",
      "N'essaie pas de le spam : quelques niveaux bien places suffisent souvent.",
      "Associe-le a Quartiers residentiels si ton personnel libre descend trop."
    ],
    tipsEn: [
      "Scale it when you plan a real tech or hangar acceleration.",
      "Do not spam it: a few well-timed levels are often enough.",
      "Pair it with Residential Quarters if free staffing drops too far."
    ]
  },
  chronium: {
    roleFr: "Ressource tardive orientee optimisation et paliers technologiques eleves.",
    roleEn: "Late resource focused on optimization and higher tech tiers.",
    detailsFr: [
      "Intervient quand le compte commence a se specialiser fortement.",
      "Chaque niveau est couteux, donc il doit repondre a un besoin concret.",
      "Il augmente la charge de workforce plus qu'une ressource de base."
    ],
    detailsEn: [
      "Becomes relevant once the account starts specializing heavily.",
      "Each level is expensive and should answer a concrete need.",
      "It stresses workforce more than baseline resources."
    ],
    tipsFr: [
      "Monte-le seulement si ta boucle carbone/titane/osmium est deja solide.",
      "Ne le construis pas pour la collection : construis-le pour un objectif.",
      "Si ta production globale s'affaisse, verifie d'abord la workforce."
    ],
    tipsEn: [
      "Only scale it once carbon, titanium and osmium are already solid.",
      "Do not build it for collection value: build it for a goal.",
      "If total output drops, check workforce first."
    ]
  },
  aetherium: {
    roleFr: "Ressource haut de gamme pour les structures et technologies d'excellence.",
    roleEn: "Premium resource for high-end structures and advanced technologies.",
    detailsFr: [
      "Sert a franchir des caps de compte plus ambitieux.",
      "Devient utile quand le reste de l'economie tourne deja en continu.",
      "Peut facilement cannibaliser ta workforce si tu l'ouvres trop vite."
    ],
    detailsEn: [
      "Helps push the account through more ambitious tiers.",
      "Becomes useful once the rest of your economy already runs smoothly.",
      "Can easily cannibalize workforce if unlocked too early."
    ],
    tipsFr: [
      "Attends d'avoir une bonne stabilite et une nourriture confortable.",
      "Monte-le progressivement, pas avant d'avoir absorbe les couts precedents.",
      "Si tu manques de marge logistique, ce n'est jamais la priorite."
    ],
    tipsEn: [
      "Wait until stability and food are comfortable.",
      "Scale it progressively, not before you have absorbed previous costs.",
      "If you need more logistics headroom, this is never the first priority."
    ]
  },
  isotope7: {
    roleFr: "Ressource rare pour les paliers lourds et les projets de fin de milieu de partie.",
    roleEn: "Rare resource for heavy tiers and late-mid-game projects.",
    detailsFr: [
      "Demande deja un compte bien stabilise.",
      "Cree peu de valeur si ta base economique reste bancale.",
      "Son cout de mise a niveau doit etre compense par un vrai besoin."
    ],
    detailsEn: [
      "Requires a well-stabilized account first.",
      "Creates little value if your core economy is still shaky.",
      "Its upgrade cost should answer a real need."
    ],
    tipsFr: [
      "Priorise ce batiment seulement quand ton ecosysteme population/ressources tient seul.",
      "Si tu bloques sur l'equipage, reporte-le sans hesiter.",
      "Il sert a accelerer une fin de plan, pas a sauver un debut fragile."
    ],
    tipsEn: [
      "Prioritize it only once your population/resource ecosystem stands on its own.",
      "If crew is the issue, postpone it immediately.",
      "It accelerates the end of a plan, not a fragile early game."
    ]
  },
  singulite: {
    roleFr: "Sommet de la chaine industrielle. Ressource d'elite et de prestige.",
    roleEn: "Peak of the industrial chain. Elite and prestige resource.",
    detailsFr: [
      "Ne devient rentable que tres tard, avec une economie enorme derriere.",
      "Mobilise beaucoup de temps, de couts et de travailleurs.",
      "C'est un batiment de cap final, pas de transition."
    ],
    detailsEn: [
      "Only becomes worthwhile very late with a massive economy behind it.",
      "Consumes a lot of time, costs and workers.",
      "It is a final-cap building, not a transition tool."
    ],
    tipsFr: [
      "Ne le construis que si tout le reste tient deja sans tension.",
      "Chaque niveau doit servir un objectif concret de late game.",
      "Si tu veux simplement respirer en economie, investis ailleurs d'abord."
    ],
    tipsEn: [
      "Only build it when everything else already runs without strain.",
      "Each level should serve a concrete late-game goal.",
      "If you just need breathing room in your economy, invest elsewhere first."
    ]
  },
  quartiers_residentiels: {
    roleFr: "Batiment cle de la population : plus de capacite, donc plus d'habitants, plus de travailleurs et plus de marge logistique.",
    roleEn: "Key population building: more housing means more people, more workers and more logistics headroom.",
    detailsFr: [
      "Augmente la capacite habitation. Si ta population depasse cette capacite, tu subis des malus.",
      "Ajoute aussi un peu de stabilite et d'attractivite.",
      "C'est le batiment numero un pour debloquer plus de main-d'oeuvre libre."
    ],
    detailsEn: [
      "Raises housing capacity. If population exceeds this cap, you take penalties.",
      "Also adds a bit of stability and attractiveness.",
      "It is the number one building for unlocking more free workforce."
    ],
    tipsFr: [
      "Si ta colonie manque de marge logistique, commence ici.",
      "Si tu vois un malus de surpopulation, c'est ta priorite absolue.",
      "Monte-le avant d'ajouter trop de nouvelles lignes de production."
    ],
    tipsEn: [
      "If your colony lacks logistics headroom, start here.",
      "If you see an overcapacity penalty, this is absolute priority.",
      "Upgrade it before adding too many new production lines."
    ]
  },
  cantine_hydroponique: {
    roleFr: "Le moteur alimentaire de ta colonie. Sans nourriture, la croissance s'effondre.",
    roleEn: "Your colony's food engine. Without food, growth collapses.",
    detailsFr: [
      "Produit la nourriture horaire necessaire a la population.",
      "Soutient aussi la stabilite et un peu l'attractivite.",
      "Une balance nourriture negative finit par bloquer ta croissance."
    ],
    detailsEn: [
      "Produces the hourly food your population needs.",
      "Also supports stability and a bit of attractiveness.",
      "A negative food balance eventually stops your growth."
    ],
    tipsFr: [
      "Garde toujours une balance nourriture positive.",
      "Si ta population ne monte plus, verifie d'abord cette ligne.",
      "Monte-la en tandem avec Quartiers residentiels."
    ],
    tipsEn: [
      "Keep your food balance positive at all times.",
      "If population stopped growing, check this first.",
      "Upgrade it alongside Residential Quarters."
    ]
  },
  centre_medical: {
    roleFr: "Batiment de croissance et de fiabilisation sociale.",
    roleEn: "Growth and social reliability building.",
    detailsFr: [
      "Ameliore la croissance naturelle via le bonus de sante.",
      "Apporte aussi de la stabilite.",
      "Devient important quand tu veux accelerer une vraie montee en population."
    ],
    detailsEn: [
      "Improves natural growth through health bonuses.",
      "Also provides stability.",
      "Becomes important when you want to truly accelerate population growth."
    ],
    tipsFr: [
      "Monte-le quand ton socle Quartiers + Cantine est deja en place.",
      "Tres utile si tu veux soutenir plus de workforce sans crise.",
      "Bon investissement apres 500 population."
    ],
    tipsEn: [
      "Upgrade it once Residential Quarters + Canteen are already online.",
      "Very useful if you want more workforce without crises.",
      "A strong investment after 500 population."
    ]
  },
  parc_orbital: {
    roleFr: "Stabilite, loisirs et attractivite : il rend la colonie plus saine et plus accueillante.",
    roleEn: "Stability, leisure and attractiveness: it makes the colony healthier and more appealing.",
    detailsFr: [
      "Ameliore fortement la stabilite sociale.",
      "Augmente aussi l'attractivite, donc la migration positive.",
      "Reduit le risque de crise ou de colonie sous tension."
    ],
    detailsEn: [
      "Strongly improves social stability.",
      "Also boosts attractiveness and therefore positive migration.",
      "Reduces the risk of crises or a colony under strain."
    ],
    tipsFr: [
      "Excellent batiment de confort quand tu pousses la population.",
      "Tres bon choix si tes malus viennent surtout de la stabilite.",
      "Ne remplace pas Quartiers et Cantine : il les complete."
    ],
    tipsEn: [
      "Excellent comfort building when pushing population upward.",
      "Very good if your penalties mostly come from stability.",
      "It does not replace Quarters or Canteen: it complements them."
    ]
  },
  academie_technique: {
    roleFr: "Convertit une partie de la population en ingenieurs pour accelerer la construction.",
    roleEn: "Converts part of your population into engineers to speed up construction.",
    detailsFr: [
      "Augmente la part d'ingenieurs dans la population.",
      "Plus d'ingenieurs = meilleures vitesses de construction.",
      "Mais cette specialisation peut reduire la part de travailleurs libres."
    ],
    detailsEn: [
      "Increases the share of engineers within the population.",
      "More engineers means faster construction speeds.",
      "But this specialization can reduce the share of free workers."
    ],
    tipsFr: [
      "Tres fort si tu chaines les constructions en continu.",
      "A eviter trop tot si ton probleme principal est la marge workforce.",
      "Monte-le quand ton economie et ta population sont deja stables."
    ],
    tipsEn: [
      "Very strong if you chain building queues continuously.",
      "Avoid it too early if your main problem is workforce margin.",
      "Upgrade it when your economy and population are already stable."
    ]
  },
  universite_orbitale: {
    roleFr: "Convertit une partie de la population en scientifiques pour accelerer la recherche.",
    roleEn: "Converts part of your population into scientists to speed up research.",
    detailsFr: [
      "Augmente la part de scientifiques.",
      "Plus de scientifiques = recherches plus rapides.",
      "Comme l'Academie, elle peut reduire la part de travailleurs et donc la marge logistique disponible."
    ],
    detailsEn: [
      "Increases the scientist share.",
      "More scientists means faster research.",
      "Like the Academy, it can reduce the worker share and therefore available logistics headroom."
    ],
    tipsFr: [
      "Monte-la pour une phase de technologie, pas pour relancer une economie bloquee.",
      "Si ta marge workforce est tendue, ce batiment n'est pas prioritaire.",
      "Tres forte une fois ta population haute et stable."
    ],
    tipsEn: [
      "Upgrade it for a technology phase, not to rescue a blocked economy.",
      "If workforce margin is tight, this building is not a priority.",
      "Very strong once your population is high and stable."
    ]
  },
  entrepot: {
    roleFr: "Infrastructure de stockage. Il protege ton rythme economique et aide aussi la capacite globale de la colonie.",
    roleEn: "Storage infrastructure. It protects your economic tempo and also helps colony capacity.",
    detailsFr: [
      "Augmente la reserve maximale de ressources.",
      "Empeche les blocages de production quand les stocks touchent le plafond.",
      "Contribue aussi indirectement a la capacite de la colonie dans la formule population."
    ],
    detailsEn: [
      "Raises maximum resource storage.",
      "Prevents production blocks when stockpiles hit the cap.",
      "Also contributes indirectly to colony capacity in the population formula."
    ],
    tipsFr: [
      "A monter des que tu commences a saturer tes ressources.",
      "Excellent batiment de confort pour soutenir une economie en croissance.",
      "Tres rentable avant une session longue hors ligne."
    ],
    tipsEn: [
      "Upgrade it as soon as your resources start capping.",
      "Excellent comfort building to support a growing economy.",
      "Very efficient before a long offline session."
    ]
  }
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
type HangarUnitFamily =
  | "screening"
  | "assault"
  | "capital"
  | "logistics"
  | "point_defense"
  | "heavy_battery"
  | "shield_control";

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

const HANGAR_UNIT_FAMILY_BY_ID: Record<string, HangarUnitFamily> = {
  eclaireur_stellaire: "screening",
  foudroyant: "screening",
  aurore: "assault",
  spectre: "assault",
  tempest: "assault",
  titanide: "capital",
  colosse: "capital",
  pegase: "logistics",
  argo: "logistics",
  arche_spatiale: "logistics",
  projecteur_photonique: "point_defense",
  tourelle_rafale: "point_defense",
  batterie_eclat: "point_defense",
  lame_de_plasma: "heavy_battery",
  canon_ion_aiguillon: "heavy_battery",
  lanceur_orbitral: "heavy_battery",
  mine_orbitale_veille: "heavy_battery",
  canon_rail_longue_vue: "heavy_battery",
  lance_gravitationnel_ancre: "heavy_battery",
  champ_aegis: "shield_control",
  projecteur_emp_silence: "shield_control",
  mur_photonique_prisme: "shield_control"
};

const HANGAR_UNIT_PRIORITY_BY_ID: Record<string, number> = {
  eclaireur_stellaire: 10,
  foudroyant: 20,
  aurore: 30,
  spectre: 40,
  tempest: 50,
  titanide: 60,
  colosse: 70,
  pegase: 80,
  argo: 90,
  arche_spatiale: 100,
  projecteur_photonique: 10,
  tourelle_rafale: 20,
  batterie_eclat: 30,
  lame_de_plasma: 40,
  canon_ion_aiguillon: 50,
  lanceur_orbitral: 60,
  mine_orbitale_veille: 70,
  canon_rail_longue_vue: 80,
  projecteur_emp_silence: 90,
  champ_aegis: 100,
  mur_photonique_prisme: 110,
  lance_gravitationnel_ancre: 120
};

const HANGAR_UNIT_FUEL_BASE_PER_1000: Record<string, number> = {
  eclaireur_stellaire: 2,
  foudroyant: 3,
  aurore: 5,
  spectre: 7,
  tempest: 10,
  titanide: 14,
  colosse: 20,
  pegase: 1,
  argo: 2,
  arche_spatiale: 4
};

const HANGAR_FAMILY_META: Record<
  HangarUnitFamily,
  {
    labelFr: string;
    labelEn: string;
    summaryFr: string;
    summaryEn: string;
    tacticalFr: string;
    tacticalEn: string;
    importanceFr: string;
    importanceEn: string;
  }
> = {
  screening: {
    labelFr: "Ecran & interception",
    labelEn: "Screening & interception",
    summaryFr: "Ouvre le combat, chasse les petits raids et protege vos lignes.",
    summaryEn: "Starts the fight, hunts light raids, and protects your lines.",
    tacticalFr: "Montez-les tot pour escorter vos recoltes et couper les transports adverses.",
    tacticalEn: "Build them early to escort harvest fleets and cut enemy transports.",
    importanceFr: "Escadre cle",
    importanceEn: "Core wing"
  },
  assault: {
    labelFr: "Assaut de ligne",
    labelEn: "Line assault",
    summaryFr: "Coeur offensif de votre flotte pour les combats de carte et les percees.",
    summaryEn: "Main offensive line for map fights and breakthroughs.",
    tacticalFr: "Base ideale pour attaquer des recolteurs et imposer le tempo.",
    tacticalEn: "Ideal backbone to hit harvesters and dictate tempo.",
    importanceFr: "Priorite offensive",
    importanceEn: "Offensive priority"
  },
  capital: {
    labelFr: "Capitaux & briseurs",
    labelEn: "Capital ships & breakers",
    summaryFr: "Pieces lourdes, lentes et cheres, mais decisives quand la ligne tient.",
    summaryEn: "Heavy, slow and expensive pieces that decide fights once the line holds.",
    tacticalFr: "Ajoutez-les apres une vraie base industrielle et une escorte solide.",
    tacticalEn: "Add them after building a real industrial base and solid escort.",
    importanceFr: "Endgame",
    importanceEn: "Endgame"
  },
  logistics: {
    labelFr: "Logistique & transport",
    labelEn: "Logistics & transport",
    summaryFr: "Soute, recolte et soutien. Faibles en combat, essentiels a l'economie.",
    summaryEn: "Cargo, harvesting and support. Weak in combat, essential for economy.",
    tacticalFr: "Montez-les regulierement pour accelerer la carte sans sacrifier toute votre production.",
    tacticalEn: "Scale them steadily to accelerate map play without sacrificing all production.",
    importanceFr: "Soutien",
    importanceEn: "Support"
  },
  point_defense: {
    labelFr: "Perimetre leger",
    labelEn: "Light perimeter",
    summaryFr: "Anti-raid rapide pour absorber les petites vagues et proteger l'orbite.",
    summaryEn: "Fast anti-raid layer to absorb small waves and protect orbit.",
    tacticalFr: "Parfait pour lisser les premieres menaces et couvrir vos structures fragiles.",
    tacticalEn: "Ideal to smooth early threats and cover fragile structures.",
    importanceFr: "Couche defensive",
    importanceEn: "Defensive layer"
  },
  heavy_battery: {
    labelFr: "Batteries lourdes",
    labelEn: "Heavy batteries",
    summaryFr: "Plateformes specialisees contre les escadres de ligne et les lourds.",
    summaryEn: "Platforms specialized against line fleets and heavy units.",
    tacticalFr: "A combiner avec des ecrans legers ou des boucliers pour durer.",
    tacticalEn: "Pair with light screens or shields to hold longer.",
    importanceFr: "Ancrage",
    importanceEn: "Anchor"
  },
  shield_control: {
    labelFr: "Boucliers & controle",
    labelEn: "Shields & control",
    summaryFr: "Absorbe, ralentit et verrouille le tempo des combats defensifs.",
    summaryEn: "Absorbs, slows and controls the rhythm of defensive fights.",
    tacticalFr: "Excellent pour faire tenir une defense lourde et gagner du temps.",
    tacticalEn: "Excellent to make heavy defenses hold and buy time.",
    importanceFr: "Support defensif",
    importanceEn: "Defensive support"
  }
};

const HANGAR_CATEGORY_FAMILY_ORDER: Record<HangarCategory, HangarUnitFamily[]> = {
  ship: ["logistics", "screening", "assault", "capital"],
  defense: ["point_defense", "shield_control", "heavy_battery"]
};

const hangarUnitFamilyOf = (unitId: string): HangarUnitFamily =>
  HANGAR_UNIT_FAMILY_BY_ID[unitId] ?? "assault";

const hangarUnitPriorityOf = (unitId: string): number =>
  Number(HANGAR_UNIT_PRIORITY_BY_ID[unitId] ?? 999);

const hangarUnitFuelBasePer1000 = (unitId: string): number =>
  Math.max(0, Number(HANGAR_UNIT_FUEL_BASE_PER_1000[unitId] ?? 0));

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

const hangarUnitUnlockHint = (unitId: string, language: UILanguage): string => {
  const t = (fr: string, en: string) => (language === "en" ? en : fr);
  if (unitId === "projecteur_photonique") return t("Requis: Amplification Photonique niv. 1", "Requires: Photonic Amplification lv. 1");
  if (unitId === "lanceur_orbitral") return t("Requis: Balistique Orbitale niv. 1", "Requires: Orbital Ballistics lv. 1");
  if (unitId === "lame_de_plasma") return t("Requis: Stabilisation Plasma niv. 1", "Requires: Plasma Stabilization lv. 1");
  if (unitId === "champ_aegis") return t("Requis: Generateur Aegis niv. 1", "Requires: Aegis Generator lv. 1");
  if (unitId === "tourelle_rafale") return t("Requis: Architecture Defensive niv. 1", "Requires: Defensive Architecture lv. 1");
  if (unitId === "batterie_eclat") return t("Requis: Architecture Defensive niv. 2", "Requires: Defensive Architecture lv. 2");
  if (unitId === "canon_ion_aiguillon") return t("Requis: Amplification Photonique niv. 2", "Requires: Photonic Amplification lv. 2");
  if (unitId === "mine_orbitale_veille") return t("Requis: Balistique Orbitale niv. 2", "Requires: Orbital Ballistics lv. 2");
  if (unitId === "canon_rail_longue_vue") return t("Requis: Balistique Orbitale niv. 4", "Requires: Orbital Ballistics lv. 4");
  if (unitId === "projecteur_emp_silence") {
    return t(
      "Requis: Controle Electromagnetique niv. 1 + Moteurs Flux Neodyme niv. 3",
      "Requires: Electromagnetic Control lv. 1 + Neodymium Flux Engines lv. 3"
    );
  }
  if (unitId === "mur_photonique_prisme") return t("Requis: Generateur Aegis niv. 3", "Requires: Aegis Generator lv. 3");
  if (unitId === "lance_gravitationnel_ancre") {
    return t(
      "Requis: Generateur Aegis niv. 6 + Physique Quantique Appliquee niv. 3",
      "Requires: Aegis Generator lv. 6 + Applied Quantum Physics lv. 3"
    );
  }
  if (unitId === "eclaireur_stellaire" || unitId === "foudroyant") return t("Requis: Doctrine d'Escarmouche niv. 1", "Requires: Skirmish Doctrine lv. 1");
  if (unitId === "aurore" || unitId === "spectre") return t("Requis: Doctrine d'Interception niv. 1", "Requires: Interception Doctrine lv. 1");
  if (unitId === "tempest" || unitId === "titanide") return t("Requis: Doctrine de Domination niv. 1", "Requires: Domination Doctrine lv. 1");
  if (unitId === "colosse" || unitId === "arche_spatiale") return t("Requis: Architecture Capitale niv. 1", "Requires: Capital Architecture lv. 1");
  return "";
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
  missionKind: "harvest" | "attack";
  targetPlayerId: string;
  targetUsername: string;
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
  fuelCostCredits: number;
  playerScore: number;
  scoreBonus: number;
  fleet: Array<{ unitId: string; quantity: number }>;
  snapshotResources: Partial<Record<ResourceId, number>>;
  collectedResources: Partial<Record<ResourceId, number>>;
  serverNowTs: number;
};
type MapPublicExpeditionDto = {
  id: string;
  playerId: string;
  username: string;
  fieldId: string;
  missionKind: "harvest" | "attack";
  targetPlayerId: string;
  targetUsername: string;
  status: "travel_to_field" | "extracting" | "returning";
  departureAt: number;
  arrivalAt: number;
  extractionStartAt: number;
  extractionEndAt: number;
  returnStartAt: number;
  returnEndAt: number;
  travelSeconds: number;
  serverNowTs: number;
};
type MapHarvestShipRow = {
  unitId: string;
  quantity: number;
  harvestSpeed: number;
  harvestCapacity: number;
  mapSpeed: number;
};

type MapCombatShipRow = {
  unitId: string;
  quantity: number;
  force: number;
  endurance: number;
  speed: number;
  lootCapacity: number;
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

const MAP_FUEL_DISTANCE_NORMALIZER = 1000;
const MAP_FUEL_MIN_DISTANCE_FACTOR = 0.8;
const MAP_FUEL_ATTACK_MULTIPLIER = 1.2;
const MAP_FUEL_HARVEST_MULTIPLIER = 1;

const estimateMapFleetFuelCredits = (
  fleetRows: Array<{ unitId: string; quantity: number }>,
  userId: string,
  fieldX: number,
  fieldY: number,
  missionKind: "harvest" | "attack" = "harvest"
) => {
  const origin = mapPlayerToPlanetCoordinates(userId || "guest");
  const dx = fieldX - origin.x;
  const dy = fieldY - origin.y;
  const distance = Math.sqrt(dx * dx + dy * dy);
  const distanceFactor = Math.max(MAP_FUEL_MIN_DISTANCE_FACTOR, distance / MAP_FUEL_DISTANCE_NORMALIZER);
  const missionMultiplier = missionKind === "attack" ? MAP_FUEL_ATTACK_MULTIPLIER : MAP_FUEL_HARVEST_MULTIPLIER;
  const totalBase = fleetRows.reduce((sum, row) => {
    const qty = Math.max(0, Math.floor(Number(row.quantity || 0)));
    if (qty <= 0) return sum;
    return sum + hangarUnitFuelBasePer1000(String(row.unitId || "")) * qty;
  }, 0);
  if (totalBase <= 0) return 0;
  return Math.max(1, Math.ceil(totalBase * distanceFactor * missionMultiplier));
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
    distance,
    totalHarvestSpeed,
    totalCapacity,
    travelSeconds,
    extractionSeconds,
    fuelCredits: estimateMapFleetFuelCredits(fleetRows, userId, fieldX, fieldY, "harvest")
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

const MISSION_WORLD_SHADER_NOISE = `
  vec3 mod289(vec3 x) { return x - floor(x * (1.0 / 289.0)) * 289.0; }
  vec4 mod289(vec4 x) { return x - floor(x * (1.0 / 289.0)) * 289.0; }
  vec4 permute(vec4 x) { return mod289(((x * 34.0) + 1.0) * x); }
  vec4 taylorInvSqrt(vec4 r) { return 1.79284291400159 - 0.85373472095314 * r; }

  float snoise(vec3 v) {
    const vec2 C = vec2(1.0 / 6.0, 1.0 / 3.0);
    const vec4 D = vec4(0.0, 0.5, 1.0, 2.0);
    vec3 i = floor(v + dot(v, C.yyy));
    vec3 x0 = v - i + dot(i, C.xxx);
    vec3 g = step(x0.yzx, x0.xyz);
    vec3 l = 1.0 - g;
    vec3 i1 = min(g.xyz, l.zxy);
    vec3 i2 = max(g.xyz, l.zxy);
    vec3 x1 = x0 - i1 + C.xxx;
    vec3 x2 = x0 - i2 + C.yyy;
    vec3 x3 = x0 - D.yyy;
    i = mod289(i);
    vec4 p = permute(permute(permute(
      i.z + vec4(0.0, i1.z, i2.z, 1.0))
      + i.y + vec4(0.0, i1.y, i2.y, 1.0))
      + i.x + vec4(0.0, i1.x, i2.x, 1.0));
    float n_ = 0.142857142857;
    vec3 ns = n_ * D.wyz - D.xzx;
    vec4 j = p - 49.0 * floor(p * ns.z * ns.z);
    vec4 x_ = floor(j * ns.z);
    vec4 y_ = floor(j - 7.0 * x_);
    vec4 x = x_ * ns.x + ns.yyyy;
    vec4 y = y_ * ns.x + ns.yyyy;
    vec4 h = 1.0 - abs(x) - abs(y);
    vec4 b0 = vec4(x.xy, y.xy);
    vec4 b1 = vec4(x.zw, y.zw);
    vec4 s0 = floor(b0) * 2.0 + 1.0;
    vec4 s1 = floor(b1) * 2.0 + 1.0;
    vec4 sh = -step(h, vec4(0.0));
    vec4 a0 = b0.xzyw + s0.xzyw * sh.xxyy;
    vec4 a1 = b1.xzyw + s1.xzyw * sh.zzww;
    vec3 p0 = vec3(a0.xy, h.x);
    vec3 p1 = vec3(a0.zw, h.y);
    vec3 p2 = vec3(a1.xy, h.z);
    vec3 p3 = vec3(a1.zw, h.w);
    vec4 norm = taylorInvSqrt(vec4(dot(p0, p0), dot(p1, p1), dot(p2, p2), dot(p3, p3)));
    p0 *= norm.x;
    p1 *= norm.y;
    p2 *= norm.z;
    p3 *= norm.w;
    vec4 m = max(0.6 - vec4(dot(x0, x0), dot(x1, x1), dot(x2, x2), dot(x3, x3)), 0.0);
    m = m * m;
    return 42.0 * dot(m * m, vec4(dot(p0, x0), dot(p1, x1), dot(p2, x2), dot(p3, x3)));
  }

  float fbm(vec3 p) {
    float total = 0.0;
    float amplitude = 0.5;
    float frequency = 1.0;
    for (int i = 0; i < 3; i++) {
      total += snoise(p * frequency) * amplitude;
      amplitude *= 0.5;
      frequency *= 2.0;
    }
    return total;
  }
`;

const MISSION_WORLD_SHELL_VERTEX = `
  varying vec3 vNormal;
  varying vec3 vViewPosition;

  void main() {
    vNormal = normalize(normalMatrix * normal);
    vec4 mvPosition = modelViewMatrix * vec4(position, 1.0);
    vViewPosition = -mvPosition.xyz;
    gl_Position = projectionMatrix * mvPosition;
  }
`;

const MISSION_WORLD_SHELL_FRAGMENT = `
  varying vec3 vNormal;
  varying vec3 vViewPosition;
  uniform vec3 uColor;
  uniform float uOpacity;

  void main() {
    float fresnel = pow(1.0 - dot(normalize(vNormal), normalize(vViewPosition)), 2.5);
    gl_FragColor = vec4(uColor, fresnel * uOpacity);
  }
`;

const MISSION_WORLD_PLASMA_VERTEX = `
  varying vec3 vPosition;
  varying vec3 vNormal;
  varying vec3 vViewPosition;

  void main() {
    vPosition = position;
    vNormal = normalize(normalMatrix * normal);
    vec4 mvPosition = modelViewMatrix * vec4(position, 1.0);
    vViewPosition = -mvPosition.xyz;
    gl_Position = projectionMatrix * mvPosition;
  }
`;

const MISSION_WORLD_PLASMA_FRAGMENT = `
  uniform float uTime;
  uniform float uScale;
  uniform float uBrightness;
  uniform float uThreshold;
  uniform vec3 uColorDeep;
  uniform vec3 uColorMid;
  uniform vec3 uColorBright;

  varying vec3 vPosition;
  varying vec3 vNormal;
  varying vec3 vViewPosition;

  ${MISSION_WORLD_SHADER_NOISE}

  void main() {
    vec3 p = vPosition * uScale;
    vec3 q = vec3(
      fbm(p + vec3(0.0, uTime * 0.05, 0.0)),
      fbm(p + vec3(5.2, 1.3, 2.8) + uTime * 0.05),
      fbm(p + vec3(2.2, 8.4, 0.5) - uTime * 0.02)
    );
    float density = fbm(p + 2.0 * q);
    float t = (density + 0.4) * 0.8;
    float alpha = smoothstep(uThreshold, 0.7, t);
    vec3 color = mix(uColorDeep, uColorMid, smoothstep(uThreshold, 0.5, t));
    color = mix(color, uColorBright, smoothstep(0.5, 0.8, t));
    color = mix(color, vec3(1.0), smoothstep(0.8, 1.0, t));
    float facing = dot(normalize(vNormal), normalize(vViewPosition));
    float depthFactor = (facing + 1.0) * 0.5;
    float finalAlpha = alpha * (0.03 + 0.97 * depthFactor);
    gl_FragColor = vec4(color * uBrightness, finalAlpha);
  }
`;

const MAP_ORB_PRESETS = {
  world: {
    colorDeep: 0x001433,
    colorMid: 0x0084ff,
    colorBright: 0x00ffe1,
    brightness: 1.31,
    threshold: 0.072,
    scale: 0.1404,
    timeScale: 0.78,
    particleColor: 0xcaf5ff
  },
  resource: {
    colorDeep: 0x2a0008,
    colorMid: 0xff2348,
    colorBright: 0xff7a3d,
    brightness: 1.22,
    threshold: 0.078,
    scale: 0.1404,
    timeScale: 0.78,
    particleColor: 0xffd4c6
  }
} as const;

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
    titleFr?: string;
    titleEn?: string;
    bodyFr?: string;
    bodyEn?: string;
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

const RESOURCE_ICON_IMAGES: Record<ResourceId, string> = {
  carbone: "/room-images/ressource-carbone.png",
  titane: "/room-images/ressource-Titane.png",
  osmium: "/room-images/ressource-Osmium.png",
  adamantium: "/room-images/ressource-Adamantium.png",
  magmatite: "/room-images/ressource-Magmatite.png",
  neodyme: "/room-images/ressource-Neodyme.png",
  chronium: "/room-images/ressource-Chronium.png",
  aetherium: "/room-images/ressource-Aetherium.png",
  isotope7: "/room-images/ressource-Isotope-7.png",
  singulite: "/room-images/ressource-Singulite.png"
};

const normalizeResourceIconId = (resourceId: unknown): ResourceId | null => {
  const raw = String(resourceId || "").trim().toLowerCase();
  if (!raw) return null;
  if (raw === "isotope-7" || raw === "isotope_7") return "isotope7";
  if (
    raw === "carbone" ||
    raw === "titane" ||
    raw === "osmium" ||
    raw === "adamantium" ||
    raw === "magmatite" ||
    raw === "neodyme" ||
    raw === "chronium" ||
    raw === "aetherium" ||
    raw === "isotope7" ||
    raw === "singulite"
  ) {
    return raw;
  }
  return null;
};

const getResourceIconPath = (resourceId: unknown): string | null => {
  const normalized = normalizeResourceIconId(resourceId);
  return normalized ? RESOURCE_ICON_IMAGES[normalized] ?? null : null;
};

const getResourceIconStyle = (resourceId: unknown): CSSProperties => {
  const path = getResourceIconPath(resourceId);
  return path
    ? {
        backgroundImage: `url("${path}")`
      }
    : {};
};

const getResourceMenuSpriteStyle = (resourceId: string): CSSProperties => getResourceIconStyle(resourceId);
const getTopbarResourceSpriteStyle = (resourceId: string): CSSProperties => getResourceIconStyle(resourceId);

function ResourceTextWithIcon({
  resourceId,
  language,
  className = "",
  iconClassName = ""
}: {
  resourceId: string;
  language: UILanguage;
  className?: string;
  iconClassName?: string;
}) {
  const normalized = normalizeResourceIconId(resourceId);
  const label = normalized ? resourceDisplayName(normalized, language) : String(resourceId || "");
  const iconPath = getResourceIconPath(resourceId);
  return (
    <span className={`resource-inline-label ${className}`.trim()}>
      {iconPath ? (
        <span className={`top-resource-icon resource-inline-icon ${iconClassName}`.trim()} style={getResourceIconStyle(resourceId)} />
      ) : null}
      <span>{label}</span>
    </span>
  );
}

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

const extractInventoryItemNotificationsFromMapReport = (reportPayload: any): { total: number; byItemId: Record<string, number> } => {
  const source = reportPayload && typeof reportPayload === "object" ? reportPayload : {};
  const items = Array.isArray(source.items) ? source.items : [];
  const byItemId: Record<string, number> = {};
  let total = 0;

  for (const item of items) {
    const itemId = String(item?.itemId || "").trim();
    const quantity = Math.max(0, Math.floor(Number(item?.quantity ?? 0)));
    if (!itemId || quantity <= 0) continue;
    byItemId[itemId] = Math.max(0, Math.floor(Number(byItemId[itemId] ?? 0))) + quantity;
    total += quantity;
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
      raw === "settings" ||
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
  const [profileMenuOpen, setProfileMenuOpen] = useState(false);
  const profileMenuCloseTimeoutRef = useRef<number | null>(null);

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
  const [showLoginIntro, setShowLoginIntro] = useState(false);
  const [loginIntroPlayerName, setLoginIntroPlayerName] = useState("");
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
  const [profileAvatar, setProfileAvatar] = useState(COMMANDER_DEFS[DEFAULT_COMMANDER_ID].image);
  const [profileCommanderId, setProfileCommanderId] = useState<CommanderId>(DEFAULT_COMMANDER_ID);
  const [activeCommanderId, setActiveCommanderId] = useState<CommanderId>(DEFAULT_COMMANDER_ID);
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
  const [persistedMapCache, setPersistedMapCache] = useState<Record<string, any> | null>(null);
  const processedMapSyncReportIdsRef = useRef<Record<string, boolean>>({});

  const client = useMemo(() => createClient(), []);
  const transformRef = useRef<HTMLDivElement>(null);
  const previousScreenRef = useRef<UIScreen>(screen);
  const rankingRpcInFlightRef = useRef(false);
  const rankingRpcBackoffUntilRef = useRef(0);
  const rankingSyncInFlightRef = useRef(false);
  const l = (fr: string, en: string) => (uiLanguage === "en" ? en : fr);
  const inventoryMenuBadgeCount = Math.max(0, inventoryServerBadgeCount + inventoryInboxBadgeCount);
  const mapWarmCacheKey = useMemo(
    () => (session?.user_id ? `hsg_map_cache_v1_${String(session.user_id)}` : ""),
    [session?.user_id]
  );
  useEffect(() => {
    if (!mapWarmCacheKey) {
      setPersistedMapCache(null);
      return;
    }
    try {
      const parsed = parseJsonObject(sessionStorage.getItem(mapWarmCacheKey));
      setPersistedMapCache(Object.keys(parsed).length > 0 ? parsed : null);
    } catch {
      setPersistedMapCache(null);
    }
  }, [mapWarmCacheKey]);
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
    setProfileAvatar(COMMANDER_DEFS[DEFAULT_COMMANDER_ID].image);
    setProfileCommanderId(DEFAULT_COMMANDER_ID);
    setActiveCommanderId(DEFAULT_COMMANDER_ID);
    setShowAuth(false);
    setShowLoginIntro(false);
    setLoginIntroPlayerName("");
    setAuthChecking(false);
    processedMapSyncReportIdsRef.current = {};
  }, []);
  const entrepotLevel = roomByType.entrepot?.level ?? 1;
  const productionBonusesByResource = useMemo(() => technologyProductionBonuses(technologyLevels), [technologyLevels]);
  const commanderBonus = useMemo(
    () => COMMANDER_DEFS[activeCommanderId] ?? COMMANDER_DEFS[DEFAULT_COMMANDER_ID],
    [activeCommanderId]
  );
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
  const storageCapacity = useMemo(
    () => Math.max(0, Math.floor(computeStorageCapacity(entrepotLevel) * (commanderBonus.storageMultiplier ?? 1))),
    [commanderBonus.storageMultiplier, entrepotLevel]
  );
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
    () =>
      clampNumber(
        buildingTimeReductionFactorFromTech * populationSnapshot.constructionTimeFactor * (commanderBonus.buildingTimeFactor ?? 1),
        0.4,
        2.2
      ),
    [buildingTimeReductionFactorFromTech, commanderBonus.buildingTimeFactor, populationSnapshot.constructionTimeFactor]
  );
  const researchTimeFactor = useMemo(
    () => clampNumber(populationSnapshot.researchTimeFactor * (commanderBonus.researchTimeFactor ?? 1), 0.4, 2.2),
    [commanderBonus.researchTimeFactor, populationSnapshot.researchTimeFactor]
  );
  const resourceRates = useMemo(() => {
    const map: Record<string, number> = {};
    for (const r of RESOURCE_DEFS) {
      const baseRate = Number(baseResourceRates[r.id] ?? 0);
      map[r.id] = Math.max(0, baseRate * populationSnapshot.productionMultiplier * (commanderBonus.productionMultiplier ?? 1));
    }
    return map;
  }, [baseResourceRates, commanderBonus.productionMultiplier, populationSnapshot.productionMultiplier]);
  const resourceAmountsRef = useRef<Record<string, number>>({});
  const resourceUnlockedRef = useRef<string[]>(BASE_UNLOCKED_RESOURCE_IDS);
  const resourceTickRef = useRef<number>(Date.now());
  const resourceRatesRef = useRef<Record<string, number>>({});
  const storageCapacityRef = useRef<number>(storageCapacity);
  const populationStateRef = useRef<PopulationState>(defaultPopulationState());
  const commanderOptions = useMemo(() => COMMANDER_IDS.map((id) => COMMANDER_DEFS[id]), []);

  const applyAccount = (account: Awaited<ReturnType<Client["getAccount"]>>, fallbackSession: Session | null) => {
    const username = account.user?.username ?? fallbackSession?.username ?? fallbackSession?.user_id ?? "player";
    const lang = account.user?.lang_tag === "en" ? "en" : "fr";
    const avatar = account.user?.avatar_url?.trim() ? account.user.avatar_url : COMMANDER_DEFS[DEFAULT_COMMANDER_ID].image;
    const commanderId = commanderIdFromAvatar(avatar);
    const draftEmail = localStorage.getItem(PROFILE_EMAIL_DRAFT_KEY);
    const email = (draftEmail?.trim() || account.email || "").trim();

    setPlayerId(username.slice(0, 20));
    setProfileUsername(username);
    setProfileLanguage(lang);
    setUiLanguage(lang);
    setProfileAvatar(COMMANDER_DEFS[commanderId].image);
    setProfileCommanderId(commanderId);
    setActiveCommanderId(commanderId);
    setProfileEmail(email);
    setProfileServerEmail(account.email ?? "");
  };

  const finishLoginIntro = useCallback(() => {
    setShowLoginIntro(false);
    setScreen("game");
  }, []);

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

  const refreshEconomyHeaderState = useCallback(async () => {
    if (!session) return;
    try {
      const rpc = await client.rpc(session, "economy_get_state", "{}");
      const parsed = parseJsonObject((rpc as any)?.payload ?? rpc);
      const nested = parseJsonObject(parsed?.payload);
      const source = Object.keys(nested).length > 0 ? nested : parsed;
      const resourceSource =
        (source?.state?.resources && typeof source.state.resources === "object" ? source.state.resources : null) ??
        (source?.resources && typeof source.resources === "object" ? source.resources : null);
      if (resourceSource) {
        setResourceAmounts((prev) => {
          const next = { ...prev };
          for (const def of RESOURCE_DEFS) {
            const row = (resourceSource as Record<string, any>)[def.id];
            const raw = Number(row && typeof row === "object" ? row.amount : row);
            if (Number.isFinite(raw) && raw >= 0) next[def.id] = raw;
          }
          return next;
        });
      }
      const nextCredits = Number(source?.state?.premiumCredits ?? source?.premiumCredits ?? NaN);
      if (Number.isFinite(nextCredits) && nextCredits >= 0) {
        setCredits(Math.floor(nextCredits));
      }
      const buildingSource =
        (source?.state?.buildings && typeof source.state.buildings === "object" ? source.state.buildings : null) ??
        (source?.buildings && typeof source.buildings === "object" ? source.buildings : null);
      if (buildingSource) {
        setUnlockedResourceIds((prev) => {
          const next = new Set<string>(prev);
          for (const base of BASE_UNLOCKED_RESOURCE_IDS) next.add(base);
          for (const def of RESOURCE_DEFS) {
            const rawLevel = Number((buildingSource as Record<string, any>)[def.id]?.level ?? 0);
            if (Number.isFinite(rawLevel) && rawLevel > 0) next.add(def.id);
          }
          return Array.from(next);
        });
      }
      resourceTickRef.current = Date.now();
    } catch (err) {
      if (isUnauthorizedError(err)) {
        invalidateSession();
        return;
      }
      if (import.meta.env.DEV) {
        // eslint-disable-next-line no-console
        console.error("economy header refresh error", err);
      }
    }
  }, [client, invalidateSession, session]);

  const loadCommanderProfile = useCallback(async () => {
    if (!session) return;
    try {
      const read = await client.readStorageObjects(session, {
        object_ids: [{ collection: PROFILE_COMMANDER_COLLECTION, key: PROFILE_COMMANDER_KEY, user_id: session.user_id }]
      });
      const stored = read.objects?.[0]?.value as { commanderId?: string } | undefined;
      const nextCommanderId = COMMANDER_IDS.includes(stored?.commanderId as CommanderId)
        ? (stored!.commanderId as CommanderId)
        : commanderIdFromAvatar(profileAvatar);
      setProfileCommanderId(nextCommanderId);
      setActiveCommanderId(nextCommanderId);
      setProfileAvatar(COMMANDER_DEFS[nextCommanderId].image);
    } catch (err) {
      if (isUnauthorizedError(err)) {
        invalidateSession();
      }
    }
  }, [client, invalidateSession, profileAvatar, session]);

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
      const rpc = await client.rpc(session, "ranking_get_state", JSON.stringify({ limit: 50 }));
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

  const syncRankingProgress = async () => {
    if (!session) return;
    if (rankingSyncInFlightRef.current) return;

    rankingSyncInFlightRef.current = true;
    try {
      const progress = {
        rooms: rooms.map((room) => ({
          type: room.type,
          level: Math.max(0, Math.floor(Number(room.level || 0)))
        })),
        researchPoints: computeResearchInvestmentPoints(technologyLevels)
      };
      const rpc = await client.rpc(session, "ranking_sync_progress", JSON.stringify({ progress }));
      const parsed = parseJsonObject((rpc as any)?.payload ?? rpc);
      const nested = parseJsonObject(parsed?.payload);
      const source = Object.keys(nested).length > 0 ? nested : parsed;
      const points = Number(source?.points?.total ?? 0);
      if (Number.isFinite(points)) {
        setPlayerScorePoints(Math.max(0, Math.floor(points)));
      }
    } catch (err) {
      if (isUnauthorizedError(err)) {
        invalidateSession();
        return;
      }
      if (import.meta.env.DEV) {
        // eslint-disable-next-line no-console
        console.error("ranking sync error", err);
      }
    } finally {
      rankingSyncInFlightRef.current = false;
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
        const [read, economyRpc] = await Promise.all([
          client.readStorageObjects(session, {
            object_ids: [{ collection: RESOURCE_STORAGE_COLLECTION, key: RESOURCE_STORAGE_KEY, user_id: session.user_id }]
          }),
          client.rpc(session, "economy_get_state", "{}").catch(() => null)
        ]);
        const stored = read.objects?.[0]?.value as { amounts?: Record<string, number>; unlocked?: string[]; lastTick?: number } | undefined;
        const parsedEconomy = parseJsonObject((economyRpc as any)?.payload ?? economyRpc);
        const nestedEconomy = parseJsonObject(parsedEconomy?.payload);
        const economySource = Object.keys(nestedEconomy).length > 0 ? nestedEconomy : parsedEconomy;
        const now = Date.now();
        const storedBase: Record<string, number> = {};
        const serverBase: Record<string, number> = {};
        for (const r of RESOURCE_DEFS) {
          storedBase[r.id] = 0;
          serverBase[r.id] = 0;
        }

        if (stored?.amounts && typeof stored.amounts === "object") {
          for (const key of Object.keys(storedBase)) {
            const v = stored.amounts[key];
            storedBase[key] = typeof v === "number" && Number.isFinite(v) ? v : 0;
          }
        }

        const serverResources =
          (economySource?.state?.resources && typeof economySource.state.resources === "object" ? economySource.state.resources : null) ??
          (economySource?.resources && typeof economySource.resources === "object" ? economySource.resources : null);
        if (serverResources) {
          for (const key of Object.keys(serverBase)) {
            const row = (serverResources as Record<string, any>)[key];
            const raw = Number(row && typeof row === "object" ? row.amount : row);
            serverBase[key] = Number.isFinite(raw) && raw > 0 ? raw : 0;
          }
        }

        const storedUnlocked = Array.isArray(stored?.unlocked) && stored!.unlocked!.length > 0 ? stored!.unlocked! : BASE_UNLOCKED_RESOURCE_IDS;
        const serverBuildings =
          (economySource?.state?.buildings && typeof economySource.state.buildings === "object" ? economySource.state.buildings : null) ??
          (economySource?.buildings && typeof economySource.buildings === "object" ? economySource.buildings : null);
        const serverUnlockedSet = new Set<string>(BASE_UNLOCKED_RESOURCE_IDS);
        if (serverBuildings) {
          for (const r of RESOURCE_DEFS) {
            const rawLevel = Number((serverBuildings as Record<string, any>)[r.id]?.level ?? 0);
            if ((Number.isFinite(rawLevel) && rawLevel > 0) || Number(serverBase[r.id] || 0) > 0) {
              serverUnlockedSet.add(r.id);
            }
          }
        }

        const storedTotal = Object.values(storedBase).reduce((sum, value) => sum + Math.max(0, Number(value || 0)), 0);
        const serverTotal = Object.values(serverBase).reduce((sum, value) => sum + Math.max(0, Number(value || 0)), 0);
        const hasStoredSnapshot = Boolean(stored?.amounts && typeof stored.amounts === "object");
        const shouldUseServerSeed =
          serverTotal > 0 &&
          (!hasStoredSnapshot || storedTotal <= 0 || storedTotal < serverTotal * 0.02);

        const seedAmounts = shouldUseServerSeed ? serverBase : storedBase;
        const unlocked = Array.from(new Set([...(shouldUseServerSeed ? Array.from(serverUnlockedSet) : storedUnlocked), ...Array.from(serverUnlockedSet)]));
        const lastTick =
          shouldUseServerSeed
            ? now
            : typeof stored?.lastTick === "number" && stored.lastTick > 0
              ? stored.lastTick
              : now;
        const offlineSeconds = Math.max(0, Math.floor((now - lastTick) / 1000));
        const produced = applyResourceProduction(seedAmounts, offlineSeconds, unlocked);

        if (canceled) return;
        setUnlockedResourceIds(unlocked);
        setResourceAmounts(produced);
        setResourceOfflineSeconds(shouldUseServerSeed ? 0 : offlineSeconds);
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
    void loadCommanderProfile();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [session?.user_id]);

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
        setPersistedMapCache(next);
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

    void warmPlayers(true);

    const interval = window.setInterval(() => {
      void warmPlayers(screen === "starmap");
    }, screen === "starmap" ? 6000 : 15000);

    return () => {
      cancelled = true;
      window.clearInterval(interval);
    };
  }, [client, invalidateSession, mapWarmCacheKey, screen, session]);

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

      let nextPlayerName = (nextSession.username ?? nextSession.user_id ?? "player").slice(0, 20);
      let nextUiLanguage = authMode === "signup" ? language : uiLanguage;
      saveSession(nextSession);
      setSession(nextSession);
      try {
        const account = await client.getAccount(nextSession);
        applyAccount(account, nextSession);
        nextPlayerName = (account.user?.username ?? nextSession.username ?? nextSession.user_id ?? "player").slice(0, 20);
        nextUiLanguage = account.user?.lang_tag === "en" ? "en" : "fr";
      } catch {
        setPlayerId((nextSession.username ?? nextSession.user_id ?? "player").slice(0, 20));
      }
      setNakamaStatus("online");
      setAuthPassword("");
      setShowAuth(false);
      setUiLanguage(nextUiLanguage);
      if (authMode === "login") {
        setLoginIntroPlayerName(nextPlayerName);
        setShowLoginIntro(true);
      } else {
        setScreen("game");
      }
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

  const rankingClientProgressKey = useMemo(
    () =>
      JSON.stringify({
        rooms: rooms
          .map((room) => ({
            type: room.type,
            level: Math.max(0, Math.floor(Number(room.level || 0)))
          }))
          .sort((a, b) => String(a.type).localeCompare(String(b.type))),
        researchLevels: TECHNOLOGY_DEFS.map((def) => ({
          id: def.id,
          level: Math.max(0, Math.floor(Number(technologyLevels[def.id] ?? 0)))
        })),
        constructionJob: constructionJob
          ? {
              mode: constructionJob.mode,
              roomType: constructionJob.roomType,
              targetLevel: constructionJob.targetLevel,
              costPaid: constructionJob.costPaid
            }
          : null,
        researchJob: researchJob
          ? {
              technologyId: researchJob.technologyId,
              targetLevel: researchJob.targetLevel,
              costPaid: researchJob.costPaid
            }
          : null
      }),
    [constructionJob, researchJob, rooms, technologyLevels]
  );

  useEffect(() => {
    if (!session) {
      return;
    }
    if (!vaultHydrated || vaultHydratedUserId !== session.user_id) {
      return;
    }
    void syncRankingProgress();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [rankingClientProgressKey, session, vaultHydrated, vaultHydratedUserId]);

  const topbarAudioCtxRef = useRef<AudioContext | null>(null);
  const playTopbarClickSound = useCallback(() => {
    if (typeof window === "undefined") return;
    const AudioCtor = window.AudioContext || (window as typeof window & { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
    if (!AudioCtor) return;
    try {
      if (!topbarAudioCtxRef.current) {
        topbarAudioCtxRef.current = new AudioCtor();
      }
      const ctx = topbarAudioCtxRef.current;
      if (!ctx) return;
      if (ctx.state === "suspended") {
        void ctx.resume().catch(() => undefined);
      }

      const now = ctx.currentTime;
      const master = ctx.createGain();
      master.gain.setValueAtTime(0.0001, now);
      master.gain.exponentialRampToValueAtTime(0.085, now + 0.012);
      master.gain.exponentialRampToValueAtTime(0.0001, now + 0.18);
      master.connect(ctx.destination);

      const oscA = ctx.createOscillator();
      const oscB = ctx.createOscillator();
      const filter = ctx.createBiquadFilter();
      filter.type = "bandpass";
      filter.frequency.setValueAtTime(1600, now);
      filter.Q.value = 1.6;

      oscA.type = "square";
      oscB.type = "triangle";
      oscA.frequency.setValueAtTime(1320, now);
      oscA.frequency.exponentialRampToValueAtTime(960, now + 0.12);
      oscB.frequency.setValueAtTime(880, now);
      oscB.frequency.exponentialRampToValueAtTime(660, now + 0.16);

      oscA.connect(filter);
      oscB.connect(filter);
      filter.connect(master);

      oscA.start(now);
      oscB.start(now);
      oscA.stop(now + 0.16);
      oscB.stop(now + 0.18);
    } catch {
      // Ignore audio failures; navigation must stay responsive.
    }
  }, []);

  const navigateFromTopbar = useCallback((nextScreen: UIScreen) => {
    playTopbarClickSound();
    setScreen(nextScreen);
  }, [playTopbarClickSound]);

  const clearProfileMenuCloseTimeout = useCallback(() => {
    if (profileMenuCloseTimeoutRef.current !== null) {
      window.clearTimeout(profileMenuCloseTimeoutRef.current);
      profileMenuCloseTimeoutRef.current = null;
    }
  }, []);

  const openProfileMenu = useCallback(() => {
    clearProfileMenuCloseTimeout();
    setProfileMenuOpen(true);
  }, [clearProfileMenuCloseTimeout]);

  const closeProfileMenu = useCallback(
    (delayMs = 0) => {
      clearProfileMenuCloseTimeout();
      if (delayMs <= 0) {
        setProfileMenuOpen(false);
        return;
      }
      profileMenuCloseTimeoutRef.current = window.setTimeout(() => {
        setProfileMenuOpen(false);
        profileMenuCloseTimeoutRef.current = null;
      }, delayMs);
    },
    [clearProfileMenuCloseTimeout]
  );

  const navigateFromProfileMenu = useCallback(
    (nextScreen: UIScreen) => {
      closeProfileMenu(0);
      navigateFromTopbar(nextScreen);
    },
    [closeProfileMenu, navigateFromTopbar]
  );

  const handleProfileMenuBlur = useCallback(
    (event: FocusEvent<HTMLDivElement>) => {
      const nextTarget = event.relatedTarget as Node | null;
      if (nextTarget && event.currentTarget.contains(nextTarget)) return;
      closeProfileMenu(1200);
    },
    [closeProfileMenu]
  );

  useEffect(() => () => clearProfileMenuCloseTimeout(), [clearProfileMenuCloseTimeout]);

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
      const commander = COMMANDER_DEFS[profileCommanderId] ?? COMMANDER_DEFS[DEFAULT_COMMANDER_ID];
      await client.updateAccount(session, {
        username,
        lang_tag: profileLanguage,
        avatar_url: commander.image
      });
      await client.writeStorageObjects(session, [
        {
          collection: PROFILE_COMMANDER_COLLECTION,
          key: PROFILE_COMMANDER_KEY,
          permission_read: 1,
          permission_write: 1,
          value: {
            commanderId: commander.id
          }
        }
      ]);

      setPlayerId(username.slice(0, 20));
      setProfileAvatar(commander.image);
      setActiveCommanderId(commander.id);
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
        label: `${l("Batiment", "Building")} � ${roomDisplayName(constructionJob.roomType, uiLanguage)}`,
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
        label: `${l("Hangar", "Hangar")} � ${unitName} x${active.quantity}`,
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
        label: `${l("Recherche", "Research")} � ${techName} Lv.${researchJob.targetLevel}`,
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

  const topbarNavItems: Array<{
    screen: UIScreen;
    label: string;
    icon: typeof Play;
    badge?: number;
  }> = [
    { screen: "game", label: l("Jeu", "Game"), icon: Play },
    { screen: "hangar", label: l("Hangar", "Hangar"), icon: Swords },
    { screen: "starmap", label: l("Carte", "Map"), icon: Navigation },
    { screen: "technology", label: l("Technologie", "Technology"), icon: Hexagon },
    { screen: "alliance", label: l("Alliance", "Alliance"), icon: Shield },
    { screen: "ranking", label: l("Classement", "Ranking"), icon: ArrowUpCircle },
    { screen: "inventory", label: l("Inventaire", "Inventory"), icon: Package, badge: inventoryMenuBadgeCount },
    { screen: "inbox", label: l("Inbox", "Inbox"), icon: Mail, badge: inboxUnreadCount },
    { screen: "chat", label: l("Chat", "Chat"), icon: MessageCircle }
  ];

  const renderUnifiedMenu = () => (
    <div className="status-wrap topbar-nav">
      <div className="topbar-nav-scroll">
        {topbarNavItems.map((item) => {
          const Icon = item.icon;
          const isActive = screen === item.screen;
          const badge = Math.max(0, Math.floor(Number(item.badge ?? 0)));
          return (
            <button
              key={item.screen}
              className={`topbar-nav-btn${isActive ? " topbar-nav-btn--active" : ""}${badge > 0 ? " topbar-nav-btn--with-badge" : ""}`}
              onClick={() => navigateFromTopbar(item.screen)}
              title={item.label}
              aria-label={item.label}
            >
              <Icon size={15} />
              <span className="topbar-nav-label">{item.label}</span>
              {badge > 0 ? <span className="menu-badge">{badge > 99 ? "99+" : badge}</span> : null}
            </button>
          );
        })}
      </div>
      <div
        className={`user-menu topbar-user-menu${profileMenuOpen ? " is-open" : ""}`}
        onMouseEnter={openProfileMenu}
        onMouseLeave={() => closeProfileMenu(1400)}
        onFocusCapture={openProfileMenu}
        onBlur={handleProfileMenuBlur}
        onKeyDown={(event) => {
          if (event.key === "Escape") {
            closeProfileMenu(0);
            const button = event.currentTarget.querySelector<HTMLButtonElement>(".topbar-profile-btn");
            button?.focus();
          }
        }}
      >
        <button
          className={`topbar-nav-btn topbar-profile-btn${screen === "profile" || screen === "settings" ? " topbar-nav-btn--active" : ""}`}
          onClick={() => navigateFromProfileMenu("profile")}
          title={playerId || l("Profil", "Profile")}
          aria-label={playerId || l("Profil", "Profile")}
          aria-haspopup={session ? "menu" : undefined}
          aria-expanded={session ? profileMenuOpen : undefined}
        >
          <UserRound size={15} />
          <span className="topbar-nav-label topbar-profile-label">{playerId || l("Profil", "Profile")}</span>
        </button>
        {session ? (
          <div className="user-menu-dropdown" role="menu" aria-label={l("Menu joueur", "Player menu")}>
            <button
              type="button"
              className={`user-menu-action${screen === "profile" ? " is-active" : ""}`}
              onClick={() => navigateFromProfileMenu("profile")}
              role="menuitem"
            >
              <UserRound size={15} />
              <span>{l("Profil", "Profile")}</span>
            </button>
            <button
              type="button"
              className={`user-menu-action${screen === "settings" ? " is-active" : ""}`}
              onClick={() => navigateFromProfileMenu("settings")}
              role="menuitem"
            >
              <SlidersHorizontal size={15} />
              <span>{l("Parametres", "Settings")}</span>
            </button>
            <button
              type="button"
              className={`user-menu-action${screen === "wiki" ? " is-active" : ""}`}
              onClick={() => navigateFromProfileMenu("wiki")}
              role="menuitem"
            >
              <BookOpen size={15} />
              <span>{l("Wiki", "Wiki")}</span>
            </button>
            <button
              type="button"
              className="user-menu-action user-menu-action--danger"
              onClick={() => {
                closeProfileMenu(0);
                playTopbarClickSound();
                logout();
              }}
              role="menuitem"
            >
              <LogOut size={15} />
              <span>{l("Deconnexion", "Logout")}</span>
            </button>
          </div>
        ) : null}
      </div>
    </div>
  );

  const getResourceStorageState = (
    resourceId: string,
    amountSource: Record<string, number> = resourceAmounts
  ): { state: "normal" | "warn" | "critical" | "blocked"; color: string } => {
    const amount = Number(amountSource[resourceId] ?? 0);
    const cap = Math.max(1, storageCapacity);
    const fillRatio = Math.max(0, Math.min(1, amount / cap));

    if (amount >= cap) {
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
          <button type="button" className="brand-link" onClick={() => navigateFromTopbar("game")}>
            <span className="brand-link__eyebrow">{l("Protocole orbital", "Orbital protocol")}</span>
            <span className="brand-link__wordmark">
              Hyper<span>strux</span>
            </span>
          </button>
          <div className="server-clock-panel" aria-label={l("Heure serveur", "Server time")}>
            <span className="server-clock-label">{l("Heure serveur", "Server time")}</span>
            <strong className="server-clock-value">{serverClockLabel}</strong>
          </div>
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
                <span className="top-resource-icon" style={getTopbarResourceSpriteStyle(r.id)} />
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
          <span className="top-credit-item" title="Credits">
            <span className="top-credit-icon">
              <Coins size={16} />
            </span>
            <span className="top-credit-meta">
              <small>Credits</small>
              <strong>{credits.toLocaleString()} Credits</strong>
            </span>
          </span>
        </div>
        <div className="topbar-credits">
          <div className="top-score-panel">
            <div className="top-score-panel__metric top-score-panel__metric--score">
              <span className="top-score-panel__label">{l("Score", "Score")}</span>
              <strong className="top-score-panel__value">{formatDisplayedScoreLabel(playerScorePoints)}</strong>
            </div>
            <div className="top-score-panel__metric top-score-panel__metric--rank">
              <span className="top-score-panel__rank-label">{l("Rang", "Rank")}</span>
              <span className="top-score-panel__rank-value">#{playerScoreRank > 0 ? playerScoreRank : "-"}</span>
            </div>
          </div>
        </div>
      </div>
    </header>
  );

  const starmapPanel = (
    <>
      {renderUnifiedHeader()}

      <SectorMapScreen
        active={screen === "starmap"}
        language={uiLanguage}
        client={client}
        session={session}
        currentUserId={session?.user_id ?? ""}
        currentUsername={profileUsername || playerId || ""}
        hangarInventory={hangarInventory}
        technologyLevels={technologyLevels}
        carbonProductionPerSec={Number(resourceRates.carbone ?? 0)}
        initialMapCache={persistedMapCache}
        onPersistMapCache={setPersistedMapCache}
        onGrantCredits={(amount, claimId) => {
          void grantCreditsToServer(amount, claimId);
        }}
        onMapStateSync={(payload) => {
          const nextCredits = Number(payload?.credits ?? NaN);
          if (Number.isFinite(nextCredits) && nextCredits >= 0) {
            setCredits(Math.floor(nextCredits));
          }
          const syncReportId = String(payload?.syncReport?.id || "").trim();
          if (syncReportId && !processedMapSyncReportIdsRef.current[syncReportId]) {
            processedMapSyncReportIdsRef.current[syncReportId] = true;
            const syncResources =
              payload?.syncReport?.resources && typeof payload.syncReport.resources === "object"
                ? payload.syncReport.resources
                : null;
            if (syncResources) {
              setResourceAmounts((prev) => {
                const next = { ...prev };
                for (const def of RESOURCE_DEFS) {
                  const gain = Math.max(0, Math.floor(Number(syncResources[def.id] ?? 0)));
                  if (gain <= 0) continue;
                  next[def.id] = Math.max(0, Number(next[def.id] ?? 0)) + gain;
                }
                return next;
              });
            }
            const mapDropNotifications = Number(payload?.mapDropNotifications ?? NaN);
            if (Number.isFinite(mapDropNotifications) && mapDropNotifications >= 0) {
              setInventoryServerBadgeCount(Math.max(0, Math.floor(mapDropNotifications)));
            }
            const mapItemNotif = extractInventoryItemNotificationsFromMapReport(payload?.syncReport);
            if (mapItemNotif.total > 0) {
              if (screen === "inventory") {
                setInventoryVisibleItemNotifications((prev) => {
                  const next = { ...prev };
                  for (const [itemId, qtyRaw] of Object.entries(mapItemNotif.byItemId)) {
                    const qty = Math.max(0, Math.floor(Number(qtyRaw ?? 0)));
                    if (!itemId || qty <= 0) continue;
                    next[itemId] = Math.max(0, Math.floor(Number(next[itemId] ?? 0))) + qty;
                  }
                  return next;
                });
                void loadInventory(true);
              } else {
                setInventoryPendingItemNotifications((prev) => {
                  const next = { ...prev };
                  for (const [itemId, qtyRaw] of Object.entries(mapItemNotif.byItemId)) {
                    const qty = Math.max(0, Math.floor(Number(qtyRaw ?? 0)));
                    if (!itemId || qty <= 0) continue;
                    next[itemId] = Math.max(0, Math.floor(Number(next[itemId] ?? 0))) + qty;
                  }
                  return next;
                });
              }
            }
            void refreshInboxUnread(true);
          }
        }}
      />
    </>
  );

  return (
    <div className="app-shell">
      {screen === "starmap" ? null : screen === "home" ? (
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
            onNavigate={setScreen}
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
            resourceAmounts={resourceAmounts}
            onRankingRefresh={() => void loadRankingState(true)}
            onEconomyRefresh={refreshEconomyHeaderState}
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
      ) : screen === "profile" || screen === "settings" ? (
        <>
          {renderUnifiedHeader()}

          <ProfileScreen
            language={uiLanguage}
            title={screen === "settings" ? l("Parametres du compte", "Account settings") : l("Identite du Commandant", "Commander Identity")}
            subtitle={
              screen === "settings"
                ? l(
                    "Reglez votre compte, votre langue et votre commandant actif depuis ce centre de configuration.",
                    "Adjust your account, language, and active commander from this control center."
                  )
                : l(
                    "Personnalisez votre presence dans le reseau de l'hyperstructure.",
                    "Customize your presence in the hyperstructure network."
                  )
            }
            profileUsername={profileUsername}
            profileEmail={profileEmail}
            profileLanguage={profileLanguage}
            profileAvatar={profileAvatar}
            profileCommanderId={profileCommanderId}
            commanderOptions={commanderOptions}
            profileError={profileError}
            profileSaved={profileSaved}
            profileLoading={profileLoading}
            onUsernameChange={setProfileUsername}
            onEmailChange={setProfileEmail}
            onLanguageChange={(lang) => {
              setProfileLanguage(lang);
              setUiLanguage(lang);
            }}
            onCommanderChange={(commanderId) => {
              setProfileCommanderId(commanderId);
              setProfileAvatar(COMMANDER_DEFS[commanderId].image);
            }}
            onSubmit={saveProfile}
          />
        </>
      ) : (
        <>
          {renderUnifiedHeader()}

          <main className="game-layout">
            <aside className="left-panel">
              <div className="hyperstats-panel">
                <h2>{l("Stats Hyperstructure", "Hyperstructure Stats")}</h2>
                <StatLine icon={<Users size={16} />} label={l("Batiments actifs", "Active buildings")} value={stats.buildings} />
                <StatLine icon={<Gem size={16} />} label={l("Ressources debloquees", "Unlocked resources")} value={stats.unlocked} />
                <StatLine icon={<Zap size={16} />} label={l("Production totale/s", "Total production/s")} value={Number(stats.totalProduction.toFixed(3))} />
                <StatLine icon={<Shield size={16} />} label={l("Capacite entrepot", "Storage capacity")} value={stats.storageCapacity} />
                <StatLine icon={<RefreshCw size={16} />} label={l("File construction", "Construction queue")} value={stats.queueBusy ? 1 : 0} />
                <div className="left-panel-actions">
                  <button type="button" className="left-panel-link" onClick={() => navigateFromTopbar("resources")}>
                    <Coins size={15} />
                    <span>{l("Ressources", "Resources")}</span>
                  </button>
                </div>
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
                    {l("Personnel flotte estime", "Estimated fleet staffing")}:{" "}
                    <strong>{hangarCrewState.free.toLocaleString()}</strong>
                    {" / "}
                    {hangarCrewState.crewPool.toLocaleString()}
                    {" "}
                    <span className="population-meta-inline-note">
                      {l("(indicatif)", "(advisory)")}
                    </span>
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
                <div className="left-panel-actions">
                  <button type="button" className="left-panel-link left-panel-link--population" onClick={() => navigateFromTopbar("population")}>
                    <Users size={15} />
                    <span>{l("Population", "Population")}</span>
                  </button>
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
                      {" � "}
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
                                  {roomDisplayName(mission.roomType, uiLanguage)} � Lv.{mission.targetLevel}
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

      {session ? (
        <div style={{ display: screen === "starmap" ? "block" : "none" }} aria-hidden={screen !== "starmap"}>
          {starmapPanel}
        </div>
      ) : null}

      {chestLootSummary ? (
        <ChestLootModal
          language={uiLanguage}
          summary={chestLootSummary}
          onClose={() => setChestLootSummary(null)}
        />
      ) : null}

      {showLoginIntro && session ? (
        <LoginIntroCinematic
          language={uiLanguage}
          playerName={loginIntroPlayerName || profileUsername || playerId}
          onComplete={finishLoginIntro}
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
                <ResourceTextWithIcon resourceId={row.resourceId} language={language} className="chest-loot-label" />
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
  active,
  language,
  client,
  session,
  currentUserId,
  currentUsername,
  hangarInventory,
  technologyLevels,
  carbonProductionPerSec,
  initialMapCache,
  onPersistMapCache,
  onMapStateSync,
  onGrantCredits
}: {
  active: boolean;
  language: UILanguage;
  client: Client;
  session: Session | null;
  currentUserId: string;
  currentUsername: string;
  hangarInventory: Record<string, number>;
  technologyLevels: Record<TechnologyId, number>;
  carbonProductionPerSec: number;
  initialMapCache?: Record<string, any> | null;
  onPersistMapCache?: (payload: Record<string, any> | null) => void;
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
  const [mapPublicExpeditions, setMapPublicExpeditions] = useState<MapPublicExpeditionDto[]>([]);
  const [mapReports, setMapReports] = useState<
    Array<{ id: string; fieldId: string; at: number; resources: Partial<Record<ResourceId, number>>; items?: Array<{ itemId: string; quantity: number }> }>
  >([]);
  const [mapHarvestInventory, setMapHarvestInventory] = useState<MapHarvestShipRow[]>([]);
  const [mapCombatInventory, setMapCombatInventory] = useState<MapCombatShipRow[]>([]);
  const [mapServerMaxActiveExpeditions, setMapServerMaxActiveExpeditions] = useState(1);
  const [mapLoadError, setMapLoadError] = useState("");
  const [mapActionError, setMapActionError] = useState("");
  const [mapActionBusy, setMapActionBusy] = useState(false);
  const [fleetDraft, setFleetDraft] = useState<Record<string, string>>({
    argo: "0",
    pegase: "0",
    arche_spatiale: "0"
  });
  const [attackFleetDraft, setAttackFleetDraft] = useState<Record<string, string>>({});
  const [fieldPopupId, setFieldPopupId] = useState<string | null>(null);
  const [mapNowMs, setMapNowMs] = useState(() => Date.now());
  const [mapServerSync, setMapServerSync] = useState<{ serverMs: number; localMs: number } | null>(null);
  const [viewportSize, setViewportSize] = useState({ width: 0, height: 0 });
  const [cameraCenter, setCameraCenter] = useState(() => mapPlayerToPlanetCoordinates(String(currentUserId || "guest")));
  const [mapCacheHydrated, setMapCacheHydrated] = useState(false);
  const [mapLiveStateHydrated, setMapLiveStateHydrated] = useState(false);
  const initialMapCacheRef = useRef<Record<string, any> | null>(initialMapCache ?? null);

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
  const lastPersistedMapCacheJsonRef = useRef("");

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
      missionKind: String(expeditionRaw.missionKind || "").trim().toLowerCase() === "attack" ? "attack" : "harvest",
      targetPlayerId: String(expeditionRaw.targetPlayerId || "").trim(),
      targetUsername: String(expeditionRaw.targetUsername || "").trim(),
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
      fuelCostCredits: Math.max(0, Math.floor(Number(expeditionRaw.fuelCostCredits ?? 0))),
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

  const parseMapCombatInventoryRows = (rowsRaw: any[]): MapCombatShipRow[] =>
    (Array.isArray(rowsRaw) ? rowsRaw : [])
      .map((row: any) => ({
        unitId: String(row?.unitId || "").trim(),
        quantity: Math.max(0, Math.floor(Number(row?.quantity ?? 0))),
        force: Math.max(0, Math.floor(Number(row?.force ?? 0))),
        endurance: Math.max(0, Math.floor(Number(row?.endurance ?? 0))),
        speed: Math.max(0, Math.floor(Number(row?.speed ?? 0))),
        lootCapacity: Math.max(0, Math.floor(Number(row?.lootCapacity ?? 0)))
      }))
      .filter((row: MapCombatShipRow) => row.unitId.length > 0 && row.quantity > 0);

  const parsePublicMapExpeditionRow = (expeditionRaw: Record<string, any>): MapPublicExpeditionDto | null => {
    if (!expeditionRaw || typeof expeditionRaw !== "object") return null;
    const id = String(expeditionRaw.id || "").trim();
    const playerId = String(expeditionRaw.playerId || "").trim();
    const fieldId = String(expeditionRaw.fieldId || "").trim();
    if (!id || !playerId || !fieldId) return null;
    const status = String(expeditionRaw.status || "travel_to_field").trim().toLowerCase();
    if (status !== "travel_to_field" && status !== "extracting" && status !== "returning") return null;
    return {
      id,
      playerId,
      username: String(expeditionRaw.username || playerId).trim() || playerId,
      fieldId,
      missionKind: String(expeditionRaw.missionKind || "").trim().toLowerCase() === "attack" ? "attack" : "harvest",
      targetPlayerId: String(expeditionRaw.targetPlayerId || "").trim(),
      targetUsername: String(expeditionRaw.targetUsername || "").trim(),
      status: status as MapPublicExpeditionDto["status"],
      departureAt: Math.max(0, Math.floor(Number(expeditionRaw.departureAt ?? 0))),
      arrivalAt: Math.max(0, Math.floor(Number(expeditionRaw.arrivalAt ?? 0))),
      extractionStartAt: Math.max(0, Math.floor(Number(expeditionRaw.extractionStartAt ?? 0))),
      extractionEndAt: Math.max(0, Math.floor(Number(expeditionRaw.extractionEndAt ?? 0))),
      returnStartAt: Math.max(0, Math.floor(Number(expeditionRaw.returnStartAt ?? 0))),
      returnEndAt: Math.max(0, Math.floor(Number(expeditionRaw.returnEndAt ?? 0))),
      travelSeconds: Math.max(0, Math.floor(Number(expeditionRaw.travelSeconds ?? 0))),
      serverNowTs: Math.max(0, Math.floor(Number(expeditionRaw.serverNowTs ?? Math.floor(Date.now() / 1000))))
    };
  };

  const cachedMapPayload = useMemo(() => {
    const propSeed = initialMapCache && Object.keys(initialMapCache).length > 0 ? initialMapCache : null;
    if (propSeed) return parseJsonObject(propSeed);
    if (typeof window === "undefined") return {};
    return parseJsonObject(sessionStorage.getItem(mapCacheKey));
  }, [initialMapCache, mapCacheKey]);

  const cachedMapPlayers = useMemo(
    () =>
      (Array.isArray(cachedMapPayload.players) ? cachedMapPayload.players : [])
        .map((row: any) => ({
          userId: String(row?.userId || "").trim(),
          username: String(row?.username || "").trim()
        }))
        .filter((row: { userId: string; username: string }) => row.userId.length > 0)
        .map((row: { userId: string; username: string }) => ({
          ...row,
          username: row.username || row.userId.slice(0, 8)
        })),
    [cachedMapPayload]
  );

  const cachedMapFields = useMemo(
    () =>
      (Array.isArray(cachedMapPayload.fields) ? cachedMapPayload.fields : [])
        .map((row: any) => {
          const occupiedByPlayerId = normalizeMapEntityId(row?.occupiedByPlayerId);
          const occupyingFleetId = normalizeMapEntityId(row?.occupyingFleetId);
          const id = String(row?.id || "").trim();
          if (!id) return null;
          return {
            id,
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
        .filter((row: MapFieldServerDto | null): row is MapFieldServerDto => Boolean(row)),
    [cachedMapPayload]
  );

  const cachedMapCombatInventory = useMemo(
    () => parseMapCombatInventoryRows(Array.isArray(cachedMapPayload.combatInventory) ? cachedMapPayload.combatInventory : []),
    [cachedMapPayload]
  );

  const cachedDisplayedMapExpeditions = useMemo(() => {
    const expeditionsRaw = Array.isArray(cachedMapPayload.expeditions) ? cachedMapPayload.expeditions : [];
    const parsedExpeditions = expeditionsRaw
      .map((row: any) => parseMapExpeditionRow(parseJsonObject(row)))
      .filter((row: MapExpeditionDto | null): row is MapExpeditionDto => Boolean(row));
    if (parsedExpeditions.length > 0) return parsedExpeditions;
    const fallbackExpedition = parseMapExpeditionRow(parseJsonObject(cachedMapPayload.expedition));
    return fallbackExpedition ? [fallbackExpedition] : [];
  }, [cachedMapPayload]);

  const cachedPublicMapExpeditions = useMemo(
    () =>
      (Array.isArray(cachedMapPayload.publicExpeditions) ? cachedMapPayload.publicExpeditions : [])
        .map((row: any) => parsePublicMapExpeditionRow(parseJsonObject(row)))
        .filter((row: MapPublicExpeditionDto | null): row is MapPublicExpeditionDto => Boolean(row)),
    [cachedMapPayload]
  );

  const liveDisplayedMapExpeditions = useMemo(
    () => (mapExpeditions.length > 0 ? mapExpeditions : (mapExpedition ? [mapExpedition] : [])),
    [mapExpedition, mapExpeditions]
  );
  const displayedPublicMapExpeditions = useMemo(
    () => (mapPublicExpeditions.length > 0 ? mapPublicExpeditions : (!mapLiveStateHydrated ? cachedPublicMapExpeditions : [])),
    [cachedPublicMapExpeditions, mapLiveStateHydrated, mapPublicExpeditions]
  );
  const displayedMapPlayers = mapPlayers.length > 0 ? mapPlayers : cachedMapPlayers;
  const displayedMapFields = mapFields.length > 0 ? mapFields : cachedMapFields;
  const hasTrackedMapExpedition =
    liveDisplayedMapExpeditions.length > 0 || (!mapLiveStateHydrated && cachedDisplayedMapExpeditions.length > 0);
  const hasObservedForeignMapActivity = useMemo(
    () =>
      displayedPublicMapExpeditions.length > 0 ||
      displayedMapFields.some(
        (field) =>
          Boolean(field.isOccupied) &&
          normalizeMapEntityId(field.occupiedByPlayerId || "") !== "" &&
          normalizeMapEntityId(field.occupiedByPlayerId || "") !== normalizeMapEntityId(currentUserId)
      ),
    [currentUserId, displayedMapFields, displayedPublicMapExpeditions]
  );
  const mapStateRefreshIntervalMs = hasTrackedMapExpedition || hasObservedForeignMapActivity ? 4000 : 8000;

  useEffect(() => {
    if (!active) return;
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
  }, [active, client, session]);

  useEffect(() => {
    if (!active) return;
    if (!session) {
      setMapFields([]);
      setMapExpedition(null);
      setMapExpeditions([]);
      setMapPublicExpeditions([]);
      setMapReports([]);
      setMapHarvestInventory([]);
      setMapCombatInventory([]);
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
        if (!cancelled) {
          applyMapPayload(source);
          setMapLoadError("");
          setMapLiveStateHydrated(true);
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
    }, mapStateRefreshIntervalMs);
    return () => {
      cancelled = true;
      clearInterval(interval);
    };
  }, [active, client, commandementEscadreLevel, session, mapActionBusy, mapStateRefreshIntervalMs]);

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
    const rows = Array.isArray(displayedMapPlayers)
      ? displayedMapPlayers.filter((player) => String(player.userId || "").trim() !== selfId)
      : [];
    if (selfId) {
      rows.unshift({ userId: selfId, username: selfUsername });
    }
    return computeSectorPlayerPlanets(rows, currentUserId);
  }, [currentUserId, currentUsername, displayedMapPlayers]);

  const mapPlanetCoordsByUserId = useMemo(() => {
    const next = new Map<string, { x: number; y: number }>();
    for (const playerPlanet of sectorPlayerPlanets) {
      const userId = String(playerPlanet.userId || "").trim();
      if (!userId) continue;
      next.set(userId, { x: playerPlanet.x, y: playerPlanet.y });
    }
    return next;
  }, [sectorPlayerPlanets]);

  const mapResourceEntities = useMemo(
    () => displayedMapFields.map((field) => mapFieldToSectorEntity(field, language)),
    [displayedMapFields, language]
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

  const combatAvailability = useMemo(() => {
    const fromServer: Record<string, number> = {};
    const cached: Record<string, number> = {};
    for (const row of mapCombatInventory) fromServer[row.unitId] = Math.max(0, Math.floor(Number(row.quantity || 0)));
    for (const row of cachedMapCombatInventory) cached[row.unitId] = Math.max(0, Math.floor(Number(row.quantity || 0)));
    const fallback: Record<string, number> = {};
    for (const def of HANGAR_UNIT_DEFS) {
      if (def.category !== "ship") continue;
      fallback[def.id] = Math.max(0, Math.floor(Number(hangarInventory[def.id] ?? 0)));
    }
    if (Object.keys(fromServer).length > 0) return { ...fallback, ...cached, ...fromServer };
    if (Object.keys(cached).length > 0) return { ...fallback, ...cached };
    return fallback;
  }, [cachedMapCombatInventory, hangarInventory, mapCombatInventory]);

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

  useEffect(() => {
    setAttackFleetDraft((prev) => {
      let changed = false;
      const next = { ...prev };
      for (const unitId of Object.keys(next)) {
        const available = Math.max(0, Math.floor(Number(combatAvailability[unitId] ?? 0)));
        const current = Math.max(0, Math.floor(Number(next[unitId] ?? 0)));
        const clamped = Math.max(0, Math.min(available, current));
        if (clamped !== current || String(clamped) !== next[unitId]) {
          next[unitId] = String(clamped);
          changed = true;
        }
      }
      return changed ? next : prev;
    });
  }, [combatAvailability]);

  const hasValidHarvestFleetSelection = useMemo(() => {
    for (const unitId of Object.keys(fleetDraft)) {
      const available = Math.max(0, Math.floor(Number(harvestAvailability[unitId] ?? 0)));
      const requested = Math.max(0, Math.floor(Number(fleetDraft[unitId] ?? 0)));
      const usable = Math.min(available, requested);
      if (usable > 0) return true;
    }
    return false;
  }, [fleetDraft, harvestAvailability]);

  const combatInventoryById = useMemo(() => {
    const out: Record<string, MapCombatShipRow> = {};
    for (const row of [...cachedMapCombatInventory, ...mapCombatInventory]) {
      if (!row || !row.unitId) continue;
      out[row.unitId] = row;
    }
    return out;
  }, [cachedMapCombatInventory, mapCombatInventory]);

  const availableCombatShipRows = useMemo(
    () =>
      HANGAR_UNIT_DEFS
        .filter((def) => def.category === "ship")
        .map((def) => {
          const serverRow = combatInventoryById[def.id];
          return {
            unitId: def.id,
            quantity: Math.max(0, Math.floor(Number(combatAvailability[def.id] ?? 0))),
            force: Math.max(0, Math.floor(Number(serverRow?.force ?? def.force ?? 0))),
            endurance: Math.max(0, Math.floor(Number(serverRow?.endurance ?? def.endurance ?? 0))),
            speed: Math.max(0, Math.floor(Number(serverRow?.speed ?? def.speed ?? 0))),
            lootCapacity: Math.max(
              0,
              Math.floor(Number(serverRow?.lootCapacity ?? MAP_HARVEST_UNIT_STATS[def.id]?.harvestCapacity ?? 0))
            )
          };
        })
        .filter((row) => row.quantity > 0),
    [combatAvailability, combatInventoryById]
  );

  const availableAttackShipRows = useMemo(
    () => availableCombatShipRows.filter((row) => row.force > 0),
    [availableCombatShipRows]
  );

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

  useEffect(() => {
    initialMapCacheRef.current = initialMapCache ?? null;
  }, [currentUserId, initialMapCache]);

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
  const fieldPopupOccupiedBySelf = Boolean(
    fieldPopupEntity &&
    fieldPopupEntity.isOccupied &&
    normalizeMapEntityId(fieldPopupEntity.occupiedByPlayerId || "") === currentUserId
  );
  const fieldPopupOccupiedByRival = Boolean(
    fieldPopupEntity &&
    fieldPopupEntity.isOccupied &&
    normalizeMapEntityId(fieldPopupEntity.occupiedByPlayerId || "") !== "" &&
    normalizeMapEntityId(fieldPopupEntity.occupiedByPlayerId || "") !== currentUserId
  );

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

  const selectedAttackPlan = useMemo(() => {
    const rows = Object.keys(attackFleetDraft)
      .map((unitId) => {
        const available = Math.max(0, Math.floor(Number(combatAvailability[unitId] ?? 0)));
        const requested = Math.max(0, Math.floor(Number(attackFleetDraft[unitId] ?? 0)));
        const quantity = Math.min(available, requested);
        if (quantity <= 0) return null;
        const stats = combatInventoryById[unitId];
        const fallback = HANGAR_UNIT_DEFS.find((row) => row.id === unitId);
        const force = Math.max(0, Math.floor(Number(stats?.force ?? fallback?.force ?? 0)));
        if (force <= 0) return null;
        return {
          unitId,
          quantity,
          force,
          endurance: Math.max(0, Math.floor(Number(stats?.endurance ?? fallback?.endurance ?? 0))),
          speed: Math.max(0, Math.floor(Number(stats?.speed ?? fallback?.speed ?? 0))),
          lootCapacity: Math.max(
            0,
            Math.floor(Number(stats?.lootCapacity ?? MAP_HARVEST_UNIT_STATS[unitId]?.harvestCapacity ?? 0))
          )
        };
      })
      .filter((row): row is NonNullable<typeof row> => Boolean(row));
    if (rows.length <= 0) return null;
    let totalForce = 0;
    let totalEndurance = 0;
    let totalLootCapacity = 0;
    let weightedSpeed = 0;
    let shipCount = 0;
    for (const row of rows) {
      totalForce += row.force * row.quantity;
      totalEndurance += row.endurance * row.quantity;
      totalLootCapacity += row.lootCapacity * row.quantity;
      weightedSpeed += row.speed * row.quantity;
      shipCount += row.quantity;
    }
    const origin = selectedFieldEntity ? mapPlayerToPlanetCoordinates(currentUserId || "guest") : null;
    const dx = origin && selectedFieldEntity ? selectedFieldEntity.x - origin.x : 0;
    const dy = origin && selectedFieldEntity ? selectedFieldEntity.y - origin.y : 0;
    const distance = Math.sqrt(dx * dx + dy * dy);
    const travelSeconds =
      shipCount > 0 && weightedSpeed > 0
        ? Math.max(
            MAP_MIN_TRAVEL_SECONDS,
            Math.min(MAP_MAX_TRAVEL_SECONDS, Math.floor((distance / (weightedSpeed / shipCount)) * MAP_TRAVEL_TIME_FACTOR))
          )
        : 0;
    return {
      fleet: rows.map((row) => ({ unitId: row.unitId, quantity: row.quantity })),
      totalForce,
      totalEndurance,
      totalLootCapacity,
      averageSpeed: shipCount > 0 ? Math.round(weightedSpeed / shipCount) : 0,
      distance,
      travelSeconds,
      fuelCredits:
        selectedFieldEntity
          ? estimateMapFleetFuelCredits(
              rows.map((row) => ({ unitId: row.unitId, quantity: row.quantity })),
              currentUserId || "guest",
              selectedFieldEntity.x,
              selectedFieldEntity.y,
              "attack"
            )
          : 0
    };
  }, [attackFleetDraft, combatAvailability, combatInventoryById, currentUserId, selectedFieldEntity]);

  const selectedAttackHasCombatForce = useMemo(
    () => Boolean(selectedAttackPlan && selectedAttackPlan.totalForce > 0),
    [selectedAttackPlan]
  );

  const fieldPopupResourceCount = useMemo(
    () => (fieldPopupEntity?.resources ?? []).filter((row) => Math.max(0, Math.floor(Number(row?.remainingAmount ?? 0))) > 0).length,
    [fieldPopupEntity]
  );
  const fieldPopupRemainingTotal = useMemo(
    () =>
      (fieldPopupEntity?.resources ?? []).reduce(
        (sum, row) => sum + Math.max(0, Math.floor(Number(row?.remainingAmount ?? 0))),
        0
      ),
    [fieldPopupEntity]
  );

  const setHarvestFleetDraftForUnit = useCallback(
    (unitId: string, mode: "max" | "clear") => {
      const available = Math.max(0, Math.floor(Number(harvestAvailability[unitId] ?? 0)));
      setFleetDraft((prev) => ({ ...prev, [unitId]: String(mode === "max" ? available : 0) }));
    },
    [harvestAvailability]
  );

  const fillAllHarvestFleetDraft = useCallback(() => {
    setFleetDraft((prev) => {
      const next = { ...prev };
      for (const unitId of Object.keys(MAP_HARVEST_UNIT_STATS)) {
        next[unitId] = String(Math.max(0, Math.floor(Number(harvestAvailability[unitId] ?? 0))));
      }
      return next;
    });
  }, [harvestAvailability]);

  const clearAllHarvestFleetDraft = useCallback(() => {
    setFleetDraft((prev) => {
      const next = { ...prev };
      for (const unitId of Object.keys(MAP_HARVEST_UNIT_STATS)) {
        next[unitId] = "0";
      }
      return next;
    });
  }, []);

  const setAttackFleetDraftForUnit = useCallback(
    (unitId: string, mode: "max" | "clear") => {
      const available = Math.max(0, Math.floor(Number(combatAvailability[unitId] ?? 0)));
      setAttackFleetDraft((prev) => ({ ...prev, [unitId]: String(mode === "max" ? available : 0) }));
    },
    [combatAvailability]
  );

  const fillAllAttackFleetDraft = useCallback(() => {
    setAttackFleetDraft((prev) => {
      const next = { ...prev };
      for (const [unitId, quantity] of Object.entries(combatAvailability)) {
        next[unitId] = String(Math.max(0, Math.floor(Number(quantity ?? 0))));
      }
      return next;
    });
  }, [combatAvailability]);

  const clearAllAttackFleetDraft = useCallback(() => {
    setAttackFleetDraft((prev) => {
      const next = { ...prev };
      for (const unitId of Object.keys(next)) next[unitId] = "0";
      return next;
    });
  }, []);

  const hasValidAttackFleetSelection = useMemo(
    () => selectedAttackHasCombatForce,
    [selectedAttackHasCombatForce]
  );

  const buildAttackFleetPayload = useCallback(
    (allowAutoFill = false) => {
      const draftedRows = Object.keys(attackFleetDraft)
        .map((unitId) => {
          const quantity = Math.min(
            Math.max(0, Math.floor(Number(combatAvailability[unitId] ?? 0))),
            Math.max(0, Math.floor(Number(attackFleetDraft[unitId] ?? 0)))
          );
          if (quantity <= 0) return null;
          const stats = combatInventoryById[unitId];
          const fallback = HANGAR_UNIT_DEFS.find((entry) => entry.id === unitId);
          const force = Math.max(0, Math.floor(Number(stats?.force ?? fallback?.force ?? 0)));
          if (force <= 0) return null;
          return { unitId, quantity };
        })
        .filter((row): row is { unitId: string; quantity: number } => Boolean(row))
        .filter((row) => row.quantity > 0);
      if (draftedRows.length > 0) return draftedRows;
      if (!allowAutoFill) return [];
      return availableAttackShipRows
        .filter((row) => row.quantity > 0)
        .map((row) => ({ unitId: row.unitId, quantity: row.quantity }));
    },
    [attackFleetDraft, availableAttackShipRows, combatAvailability, combatInventoryById]
  );

  const hasCombatCapableAutoAttackFleet = useMemo(
    () => availableAttackShipRows.some((row) => row.quantity > 0),
    [availableAttackShipRows]
  );

  const displayedMapExpeditions = useMemo(
    () => (liveDisplayedMapExpeditions.length > 0 ? liveDisplayedMapExpeditions : (!mapLiveStateHydrated ? cachedDisplayedMapExpeditions : [])),
    [cachedDisplayedMapExpeditions, liveDisplayedMapExpeditions, mapLiveStateHydrated]
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

  const derivedPublicMapExpeditions = useMemo(
    () =>
      displayedPublicMapExpeditions
        .map((expedition) => ({
          expedition,
          timeline: deriveMapExpeditionTimeline(
            {
              ...expedition,
              extractionSeconds: Math.max(0, expedition.extractionEndAt - expedition.extractionStartAt)
            } as MapExpeditionDto,
            mapNowTs
          )
        }))
        .filter((row) => !row.timeline.completed),
    [displayedPublicMapExpeditions, mapNowTs]
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
          const field = displayedMapFields.find((row) => row.id === expedition.fieldId);
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
    [derivedDisplayedMapExpeditions, displayedMapFields, selfPlanetCoords]
  );

  const publicMapMovingExpeditionVisuals = useMemo(
    () =>
      derivedPublicMapExpeditions
        .map(({ expedition, timeline }) => {
          const field = displayedMapFields.find((row) => row.id === expedition.fieldId);
          if (!field) return null;
          const status = timeline.status;
          if (status !== "travel_to_field" && status !== "returning") return null;
          const home = mapPlanetCoordsByUserId.get(expedition.playerId) ?? mapPlayerToPlanetCoordinates(expedition.playerId);
          const fieldPoint = { x: field.x, y: field.y };
          const returning = status === "returning";
          const start = returning ? fieldPoint : home;
          const target = returning ? home : fieldPoint;
          const progress = timeline.progress;
          const dx = target.x - start.x;
          const dy = target.y - start.y;
          const hostileToSelf =
            expedition.missionKind === "attack" &&
            normalizeMapEntityId(expedition.targetPlayerId) === normalizeMapEntityId(currentUserId);
          return {
            id: expedition.id,
            status,
            startX: start.x,
            startY: start.y,
            targetX: target.x,
            targetY: target.y,
            currentX: start.x + dx * progress,
            currentY: start.y + dy * progress,
            angle: Math.atan2(dy, dx) * (180 / Math.PI) + 90,
            lineColor: hostileToSelf ? "#ff6072" : "#86d7ff",
            haloColor: hostileToSelf ? "rgba(255, 96, 114, 0.18)" : "rgba(120, 204, 255, 0.16)",
            shipFill: hostileToSelf ? "#ff8895" : "#8fd9ff",
            shipStroke: hostileToSelf ? "#ffe4e8" : "#dff5ff"
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
            lineColor: string;
            haloColor: string;
            shipFill: string;
            shipStroke: string;
          } => Boolean(visual)
        ),
    [currentUserId, derivedPublicMapExpeditions, displayedMapFields, mapPlanetCoordsByUserId]
  );

  const incomingHostileFieldAttacks = useMemo(() => {
    const selfId = normalizeMapEntityId(currentUserId);
    if (!selfId) return [];
    const earliestByField = new Map<
      string,
      {
        fieldId: string;
        attackerPlayerId: string;
        attackerUsername: string;
        impactTs: number;
        remainingSeconds: number;
        attackCount: number;
      }
    >();
    for (const { expedition, timeline } of derivedPublicMapExpeditions) {
      if (expedition.missionKind !== "attack") continue;
      if (normalizeMapEntityId(expedition.targetPlayerId) !== selfId) continue;
      if (timeline.status !== "travel_to_field") continue;
      const remainingSeconds = Math.max(0, timeline.endAt - mapNowTs);
      if (remainingSeconds <= 0) continue;
      const existing = earliestByField.get(expedition.fieldId);
      if (!existing || timeline.endAt < existing.impactTs) {
        earliestByField.set(expedition.fieldId, {
          fieldId: expedition.fieldId,
          attackerPlayerId: expedition.playerId,
          attackerUsername: String(expedition.username || expedition.playerId).trim() || expedition.playerId,
          impactTs: timeline.endAt,
          remainingSeconds,
          attackCount: existing ? existing.attackCount + 1 : 1
        });
      } else {
        existing.attackCount += 1;
      }
    }
    return Array.from(earliestByField.values()).sort((a, b) => a.impactTs - b.impactTs);
  }, [currentUserId, derivedPublicMapExpeditions, mapNowTs]);

  const incomingHostileFieldAttackByFieldId = useMemo(() => {
    const output: Record<
      string,
      {
        fieldId: string;
        attackerPlayerId: string;
        attackerUsername: string;
        impactTs: number;
        remainingSeconds: number;
        attackCount: number;
      }
    > = {};
    for (const attack of incomingHostileFieldAttacks) {
      output[attack.fieldId] = attack;
    }
    return output;
  }, [incomingHostileFieldAttacks]);

  const incomingHostileFieldAttackRows = useMemo(
    () =>
      incomingHostileFieldAttacks.map((attack) => {
        const field = displayedMapFields.find((row) => row.id === attack.fieldId);
        return {
          ...attack,
          fieldLabel: field ? mapFieldDisplayName(field.id, language) : mapFieldDisplayName(attack.fieldId, language),
          fieldCoords: field ? { x: field.x, y: field.y } : null
        };
      }),
    [displayedMapFields, incomingHostileFieldAttacks, language]
  );

  const mapExtractionVisuals = useMemo(
    () =>
      derivedDisplayedMapExpeditions
        .map(({ expedition, timeline }) => {
          if (timeline.status !== "extracting") return null;
          const field = displayedMapFields.find((row) => row.id === expedition.fieldId);
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
    [derivedDisplayedMapExpeditions, displayedMapFields]
  );

  const entityLabelById = useMemo(() => {
    const output: Record<string, string> = {};
    for (const entity of sectorEntities) output[entity.id] = sectorEntityDisplayName(entity, language);
    return output;
  }, [language, sectorEntities]);

  const mapInFlightHarvestSummaryById = useMemo(() => {
    const validResourceIds = new Set<ResourceId>(RESOURCE_DEFS.map((def) => def.id as ResourceId));
    const normalizeResourceId = (raw: unknown): ResourceId | null => {
      const value = String(raw || "").trim().toLowerCase();
      if (!value || !validResourceIds.has(value as ResourceId)) return null;
      return value as ResourceId;
    };
    const toInt = (raw: unknown) => Math.max(0, Math.floor(Number(raw ?? 0)));
    const output: Record<
      string,
      {
        rows: Array<{ resourceId: ResourceId; amount: number }>;
        cargoUsed: number;
        cargoCapacity: number;
      }
    > = {};

    for (const { expedition, timeline } of derivedDisplayedMapExpeditions) {
      if (timeline.status !== "extracting" && timeline.status !== "returning") continue;
      const field = displayedMapFields.find((row) => row.id === expedition.fieldId);

      const mergedSnapshot: Partial<Record<ResourceId, number>> = {};
      if (field && Array.isArray(field.resources)) {
        for (const row of field.resources) {
          const rid = normalizeResourceId(row.resourceId);
          if (!rid) continue;
          mergedSnapshot[rid] = toInt(row.totalAmount);
        }
      }
      if (expedition.snapshotResources && typeof expedition.snapshotResources === "object") {
        for (const [ridRaw, amountRaw] of Object.entries(expedition.snapshotResources)) {
          const rid = normalizeResourceId(ridRaw);
          if (!rid) continue;
          mergedSnapshot[rid] = toInt(amountRaw);
        }
      }

      const liveCollected: Partial<Record<ResourceId, number>> = {};
      if (expedition.collectedResources && typeof expedition.collectedResources === "object") {
        for (const [ridRaw, amountRaw] of Object.entries(expedition.collectedResources)) {
          const rid = normalizeResourceId(ridRaw);
          if (!rid) continue;
          liveCollected[rid] = toInt(amountRaw);
        }
      }

      if (timeline.status === "extracting") {
        const localEstimate = estimateMapExpeditionCollected(expedition, mergedSnapshot, mapNowTs);
        for (const [ridRaw, amountRaw] of Object.entries(localEstimate)) {
          const rid = normalizeResourceId(ridRaw);
          if (!rid) continue;
          liveCollected[rid] = Math.max(toInt(liveCollected[rid] ?? 0), toInt(amountRaw));
        }
      }

      const orderedIds: ResourceId[] = [];
      const seen = new Set<ResourceId>();
      const addId = (raw: unknown) => {
        const rid = normalizeResourceId(raw);
        if (!rid || seen.has(rid)) return;
        seen.add(rid);
        orderedIds.push(rid);
      };
      if (field && Array.isArray(field.resources)) {
        for (const row of field.resources) addId(row.resourceId);
      }
      for (const rid of Object.keys(mergedSnapshot)) addId(rid);
      for (const rid of Object.keys(liveCollected)) addId(rid);

      output[expedition.id] = {
        rows: orderedIds
          .map((resourceId) => ({
            resourceId,
            amount: toInt(liveCollected[resourceId] ?? 0)
          }))
          .filter((row) => row.amount > 0),
        cargoUsed: Object.values(liveCollected).reduce(
          (sum, value) => sum + Math.max(0, Math.floor(Number(value || 0))),
          0
        ),
        cargoCapacity: Math.max(0, Math.floor(Number(expedition.totalTransportCapacity || 0)))
      };
    }

    return output;
  }, [derivedDisplayedMapExpeditions, displayedMapFields, mapNowTs]);

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
      harvestRows?: Array<{ resourceId: ResourceId; amount: number }>;
      cargoUsed?: number;
      cargoCapacity?: number;
      incomingAttack?: {
        attackerUsername: string;
        impactTs: number;
        remainingSeconds: number;
        attackCount: number;
      };
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
          route: `${sourceName} -> ${targetName}`,
          detail: `${Math.max(0, Math.min(100, Math.round(fleet.progress * 100)))}%`,
          progress: Math.max(0, Math.min(1, fleet.progress))
        };
      })
      .filter((row) => row.progress < 1);

    for (const { expedition, timeline } of derivedDisplayedMapExpeditions) {
      const field = displayedMapFields.find((row) => row.id === expedition.fieldId);
      const fieldName = field ? mapFieldDisplayName(field.id, language) : mapFieldDisplayName(expedition.fieldId, language);
      const fieldCoords = field ? { x: field.x, y: field.y } : undefined;
      const status = timeline.status;
      const isAttackMission = expedition.missionKind === "attack";
      const targetUsername = String(expedition.targetUsername || "").trim();
      const statusLabel = isAttackMission
        ? status === "returning"
          ? (language === "en" ? "Returning attack fleet" : "Flotte d'attaque en retour")
          : (language === "en" ? "Attack fleet" : "Flotte d'attaque")
        : status === "extracting"
          ? (language === "en" ? "Harvesting fleet" : "Flotte en extraction")
          : status === "returning"
            ? (language === "en" ? "Returning fleet" : "Flotte en retour")
            : (language === "en" ? "Traveling fleet" : "Flotte en trajet");
      const route = isAttackMission
        ? status === "returning"
          ? `${fieldName} -> ${language === "en" ? "Your planet" : "Votre planete"}`
          : `${language === "en" ? "Your planet" : "Votre planete"} -> ${fieldName}${targetUsername ? ` • ${language === "en" ? "Target" : "Cible"} ${targetUsername}` : ""}`
        : status === "extracting"
          ? `${fieldName} - ${language === "en" ? "Harvesting in progress" : "Exploitation en cours"}`
          : status === "returning"
            ? `${fieldName} -> ${language === "en" ? "Your planet" : "Votre planete"}`
            : `${language === "en" ? "Your planet" : "Votre planete"} -> ${fieldName}`;
      const etaTs = timeline.endAt;
      const remainingSeconds = Math.max(0, etaTs - mapNowTs);
      if (remainingSeconds <= 0) continue;
      const harvestSummary = mapInFlightHarvestSummaryById[expedition.id];
      const incomingAttack =
        !isAttackMission && status !== "returning"
          ? incomingHostileFieldAttackByFieldId[expedition.fieldId]
          : undefined;
      rows.unshift({
        id: `expedition_${expedition.id}`,
        title: statusLabel,
        route: fieldCoords ? `${route} [${fieldCoords.x}, ${fieldCoords.y}]` : route,
        detail: `${language === "en" ? "ETA" : "Arrivee"} ${new Date(etaTs * 1000).toLocaleTimeString()}`,
        progress: timeline.progress,
        remainingSeconds,
        etaTs,
        canRecall: status !== "returning",
        expeditionId: expedition.id,
        targetCoords: fieldCoords,
        harvestRows: harvestSummary?.rows ?? [],
        cargoUsed: harvestSummary?.cargoUsed ?? 0,
        cargoCapacity: harvestSummary?.cargoCapacity ?? 0,
        incomingAttack: incomingAttack
          ? {
              attackerUsername: incomingAttack.attackerUsername,
              impactTs: incomingAttack.impactTs,
              remainingSeconds: incomingAttack.remainingSeconds,
              attackCount: incomingAttack.attackCount
            }
          : undefined
      });
    }
    return rows;
  }, [derivedDisplayedMapExpeditions, displayedMapFields, entityLabelById, fleets, incomingHostileFieldAttackByFieldId, language, mapInFlightHarvestSummaryById, mapNowTs]);

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
        const field = displayedMapFields.find((row) => row.id === expedition.fieldId);
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
  }, [derivedDisplayedMapExpeditions, displayedMapFields, mapNowTs]);

  const primaryDisplayedExpedition = useMemo(() => {
    if (derivedDisplayedMapExpeditions.length <= 0) return null;
    return (
      derivedDisplayedMapExpeditions.find((row) => row.timeline.status !== "returning") ??
      derivedDisplayedMapExpeditions[0] ??
      null
    );
  }, [derivedDisplayedMapExpeditions]);

  const primaryInFlightHarvestSummary = useMemo(() => {
    const primaryId = primaryDisplayedExpedition?.expedition.id;
    if (!primaryId) return null;
    return mapInFlightHarvestSummaryById[primaryId] ?? null;
  }, [mapInFlightHarvestSummaryById, primaryDisplayedExpedition]);

  const mapLiveCollectedRows = useMemo(
    () => {
      const primaryId = primaryDisplayedExpedition?.expedition.id;
      if (primaryId && primaryInFlightHarvestSummary?.rows?.length) return primaryInFlightHarvestSummary.rows;
      if (mapLiveExtractionOverlays.length <= 0) return [];
      if (!primaryId) return mapLiveExtractionOverlays[0].rows;
      const overlay = mapLiveExtractionOverlays.find((row) => row.id === primaryId);
      return overlay ? overlay.rows : mapLiveExtractionOverlays[0].rows;
    },
    [mapLiveExtractionOverlays, primaryDisplayedExpedition, primaryInFlightHarvestSummary]
  );
  const primaryLiveExtractionOverlay = useMemo(
    () => {
      if (primaryInFlightHarvestSummary) {
        return {
          id: primaryDisplayedExpedition?.expedition.id || "",
          x: 0,
          y: 0,
          rows: primaryInFlightHarvestSummary.rows,
          cargoUsed: primaryInFlightHarvestSummary.cargoUsed,
          cargoCapacity: primaryInFlightHarvestSummary.cargoCapacity
        };
      }
      if (mapLiveExtractionOverlays.length <= 0) return null;
      const primaryId = primaryDisplayedExpedition?.expedition.id;
      if (!primaryId) return mapLiveExtractionOverlays[0] ?? null;
      return mapLiveExtractionOverlays.find((row) => row.id === primaryId) ?? mapLiveExtractionOverlays[0] ?? null;
    },
    [mapLiveExtractionOverlays, primaryDisplayedExpedition, primaryInFlightHarvestSummary]
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

  function applyMapPayload(source: Record<string, any>) {
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

    const publicExpeditionsRaw = Array.isArray(source?.publicExpeditions) ? source.publicExpeditions : [];
    const nextPublicExpeditions = publicExpeditionsRaw
      .map((row: any) => parsePublicMapExpeditionRow(parseJsonObject(row)))
      .filter((row: MapPublicExpeditionDto | null): row is MapPublicExpeditionDto => Boolean(row));
    setMapPublicExpeditions(nextPublicExpeditions);

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

    if (Array.isArray(source?.combatInventory)) {
      setMapCombatInventory(parseMapCombatInventoryRows(source.combatInventory));
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
    setMapLiveStateHydrated(false);
    lastPersistedMapCacheJsonRef.current = "";
  }, [currentUserId, mapCacheKey]);

  useLayoutEffect(() => {
    if (!session || !currentUserId) {
      setMapCacheHydrated(true);
      return;
    }
    try {
      const seed =
        initialMapCacheRef.current && Object.keys(initialMapCacheRef.current).length > 0
          ? initialMapCacheRef.current
          : parseJsonObject(sessionStorage.getItem(mapCacheKey));
      const parsed = parseJsonObject(seed);
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
      const nextCachePayload = {
        cachedAtMs: Date.now(),
        serverNowTs: mapNowTs,
        players: displayedMapPlayers,
        fields: displayedMapFields,
        expedition: liveDisplayedMapExpeditions[0] ?? null,
        expeditions: liveDisplayedMapExpeditions,
        publicExpeditions: displayedPublicMapExpeditions,
        reports: mapReports,
        harvestInventory: mapHarvestInventory,
        combatInventory: mapCombatInventory,
        maxActiveExpeditions: mapServerMaxActiveExpeditions
      };
      const nextCacheJson = JSON.stringify(nextCachePayload);
      if (lastPersistedMapCacheJsonRef.current === nextCacheJson) return;
      lastPersistedMapCacheJsonRef.current = nextCacheJson;
      sessionStorage.setItem(mapCacheKey, nextCacheJson);
      onPersistMapCache?.(nextCachePayload);
    } catch {
      // ignore storage quota errors
    }
  }, [
    currentUserId,
    mapCacheKey,
    displayedMapFields,
    displayedMapPlayers,
    displayedPublicMapExpeditions,
    liveDisplayedMapExpeditions,
    mapHarvestInventory,
    mapCombatInventory,
    mapReports,
    mapServerMaxActiveExpeditions,
    mapCacheHydrated,
    onPersistMapCache,
    session
  ]);

  useEffect(() => {
    if (!active) return;
    if (!session || mapActionBusy) return;
    if (displayedMapExpeditions.length <= 0) return;

    const hasOverdue = displayedMapExpeditions.some((expedition) => {
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
  }, [active, client, commandementEscadreLevel, displayedMapExpeditions, mapActionBusy, mapNowTs, session]);

  const launchHarvestOnField = async (fieldId: string) => {
    if (!session) return;
    const liveField = displayedMapFields.find((row) => String(row.id || "") === String(fieldId || ""));
    const liveOccupiedByPlayerId = normalizeMapEntityId(liveField?.occupiedByPlayerId);
    const occupiedBySelf =
      Boolean(liveField?.isOccupied) &&
      Boolean(liveOccupiedByPlayerId) &&
      liveOccupiedByPlayerId === normalizeMapEntityId(currentUserId);
    const occupiedByRival =
      Boolean(liveField?.isOccupied) &&
      Boolean(liveOccupiedByPlayerId) &&
      liveOccupiedByPlayerId !== normalizeMapEntityId(currentUserId);

    if (occupiedBySelf) {
      setMapActionError(
        l(
          "Votre flotte exploite deja ce champ. Utilisez Retour dans Flottes en vol.",
          "Your fleet is already harvesting this field. Use Return in Fleets in flight."
        )
      );
      setActionMode("none");
      return;
    }

    if (occupiedByRival) {
      await launchAttackOnField(fieldId, { autoFromHarvest: true, allowAutoFill: true });
      setActionMode("none");
      return;
    }

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
        const autoAttackLaunched = await launchAttackOnField(fieldId, {
          autoFromHarvest: true,
          allowAutoFill: true,
          keepBusy: true
        });
        if (autoAttackLaunched) {
          return;
        }
        detail = l(
          "Ce champ est deja occupe et aucune flotte de combat automatique n'est disponible.",
          "This field is already occupied and no automatic combat fleet is available."
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
      } else if (detailLower.includes("not enough credits for fleet fuel")) {
        detail = l(
          "Credits insuffisants pour payer le carburant de cette mission.",
          "Not enough credits to pay this mission fuel cost."
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
  }

  const launchAttackOnField = async (
    fieldId: string,
    options?: { autoFromHarvest?: boolean; allowAutoFill?: boolean; keepBusy?: boolean }
  ) => {
    if (!session) return;
    const fleetPayload = buildAttackFleetPayload(Boolean(options?.allowAutoFill));
    if (fleetPayload.length <= 0) {
      setMapActionError(
        options?.autoFromHarvest
          ? l(
              "Champ occupe : aucune escadre de combat disponible pour lancer une interception automatique.",
              "Occupied field: no combat squadron is available to launch an automatic interception."
            )
          : l(
              "Aucun vaisseau de combat disponible dans votre stock serveur.",
              "No combat ship is currently available in your server stock."
            )
      );
      return false;
    }
    const payloadForce = fleetPayload.reduce((sum, row) => {
      const unitId = String(row?.unitId || "").trim();
      const quantity = Math.max(0, Math.floor(Number(row?.quantity ?? 0)));
      if (!unitId || quantity <= 0) return sum;
      const stats = combatInventoryById[unitId];
      const fallback = HANGAR_UNIT_DEFS.find((entry) => entry.id === unitId);
      const force = Math.max(0, Math.floor(Number(stats?.force ?? fallback?.force ?? 0)));
      return sum + force * quantity;
    }, 0);
    if (payloadForce <= 0) {
      setMapActionError(
        l(
          "Attaque impossible : selectionnez au moins un vaisseau de combat offensif. Les transporteurs seuls ne peuvent pas attaquer.",
          "Attack unavailable: select at least one combat ship. Transports alone cannot attack."
        )
      );
      return false;
    }
    try {
      if (!options?.keepBusy) setMapActionBusy(true);
      setMapActionError("");
      const rpc = await client.rpc(
        session,
        "rpc_map_fields_attack",
        JSON.stringify({ fieldId, fleet: fleetPayload })
      );
      const parsed = parseJsonObject((rpc as any)?.payload ?? rpc);
      const nested = parseJsonObject(parsed?.payload);
      const source = Object.keys(nested).length > 0 ? nested : parsed;
      applyMapPayload(source);
      return true;
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
      if (detailLower.includes("attack fleet has no combat-capable ships")) {
        detail = l(
          "Aucun vaisseau de combat offensif n'est selectionne. Les transporteurs ne peuvent pas attaquer.",
          "No offensive combat ship is selected. Transports cannot attack."
        );
      } else if (detailLower.includes("not enough credits for fleet fuel")) {
        detail = l(
          "Credits insuffisants pour payer le carburant de cette mission.",
          "Not enough credits to pay this mission fuel cost."
        );
      }
      setMapActionError(
        detail
          ? `${l("Attaque impossible", "Attack unavailable")}: ${detail}`
          : l("Attaque impossible pour le moment.", "Unable to attack right now.")
      );
      if (import.meta.env.DEV) {
        // eslint-disable-next-line no-console
        console.error("map attack error", err);
      }
      return false;
    } finally {
      if (!options?.keepBusy) setMapActionBusy(false);
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

  const visibleMapOrbEntities = useMemo(
    () =>
      sectorEntities.filter(
        (entity): entity is SectorWorld | SectorResource =>
          (entity.type === "world" || entity.type === "resource") && isVisible(entity)
      ),
    [isVisible, sectorEntities]
  );

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
        {incomingHostileFieldAttacks.length > 0 ? (
          <div className="sector-under-attack-overlay" aria-hidden="true">
            <div className="sector-under-attack-frame" />
            <div className="sector-under-attack-stack">
              {incomingHostileFieldAttackRows.map((attack) => (
                <div key={`incoming_attack_${attack.fieldId}_${attack.impactTs}`} className="sector-under-attack-banner">
                  <AlertCircle size={16} />
                  <div className="sector-under-attack-banner-copy">
                    <strong>{l("Alerte combat", "Combat alert")}</strong>
                    <small>
                      {attack.fieldLabel}
                      {attack.fieldCoords ? ` [${attack.fieldCoords.x}, ${attack.fieldCoords.y}]` : ""}
                    </small>
                  </div>
                  <div className="sector-under-attack-banner-metrics">
                    <span>
                      {l("Impact", "Impact")} {formatFlightEtaClock(attack.impactTs)}
                    </span>
                    <span>
                      {l("Dans", "In")} {formatFlightCountdown(attack.remainingSeconds)}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ) : null}
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
                  <span className="sector-flight-summary-caret">v</span>
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
                      {row.incomingAttack ? (
                        <div className="sector-flight-attack-alert">
                          <div className="sector-flight-attack-alert-head">
                            <AlertCircle size={14} />
                            <strong>{l("Flotte attaquante", "Attacking fleet")}</strong>
                          </div>
                          <div className="sector-flight-attack-alert-target">
                            <span>{row.incomingAttack.attackerUsername}</span>
                            {row.incomingAttack.attackCount > 1 ? (
                              <small>+{row.incomingAttack.attackCount - 1}</small>
                            ) : null}
                          </div>
                          <div className="sector-flight-attack-alert-times">
                            <span>{l("Impact", "Impact")}</span>
                            <strong>{formatFlightEtaClock(row.incomingAttack.impactTs)}</strong>
                            <span>{l("Dans", "In")}</span>
                            <strong>{formatFlightCountdown(row.incomingAttack.remainingSeconds)}</strong>
                          </div>
                        </div>
                      ) : null}
                      {row.harvestRows && row.harvestRows.length > 0 ? (
                        <div className="sector-flight-resource-meta">
                          <span className="sector-flight-resource-title">
                            {l("Ressources recoltees", "Harvested resources")}
                          </span>
                          <div className="sector-flight-resource-list">
                            {row.harvestRows.map((resourceRow) => (
                              <div key={`${row.id}_${resourceRow.resourceId}`} className="sector-flight-resource-row">
                                <ResourceTextWithIcon resourceId={resourceRow.resourceId} language={language} />
                                <strong>+{resourceRow.amount.toLocaleString()}</strong>
                              </div>
                            ))}
                          </div>
                          {typeof row.cargoCapacity === "number" && row.cargoCapacity > 0 ? (
                            <small className={`sector-flight-resource-cargo ${typeof row.cargoUsed === "number" && row.cargoUsed >= row.cargoCapacity ? "full" : ""}`}>
                              {l("Soute", "Cargo")}: {Math.max(0, Math.floor(Number(row.cargoUsed ?? 0))).toLocaleString()} / {row.cargoCapacity.toLocaleString()}
                            </small>
                          ) : null}
                        </div>
                      ) : null}
                      {row.remainingSeconds != null && row.etaTs != null ? (
                        <div className="sector-flight-time-meta">
                          <span>{l("Temps restant", "Time left")}</span>
                          <strong className="sector-flight-time-value">{formatFlightCountdown(row.remainingSeconds)}</strong>
                          <span>{l("Arrivee", "Arrival")}</span>
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
                  <span className="sector-daily-summary-caret">v</span>
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

            {publicMapMovingExpeditionVisuals.map((visual) => (
              <g key={`map_public_expedition_${visual.id}`} className="sector-map-expedition-path public">
                <line
                  x1={visual.startX}
                  y1={visual.startY}
                  x2={visual.targetX}
                  y2={visual.targetY}
                  stroke={visual.lineColor}
                  strokeWidth="2.2"
                  strokeDasharray="11 10"
                  opacity="0.34"
                />
                <circle
                  cx={visual.currentX}
                  cy={visual.currentY}
                  r="10"
                  fill={visual.haloColor}
                />
                <g transform={`translate(${visual.currentX} ${visual.currentY}) rotate(${visual.angle})`}>
                  <path
                    d="M 0 -10 L 6 7 L 0 3 L -6 7 Z"
                    fill={visual.shipFill}
                    stroke={visual.shipStroke}
                    strokeWidth="1"
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
              <p>{l("Ressources cumulees", "Accumulated resources")}</p>
              {overlay.rows.length <= 0 ? (
                <small>{l("Extraction en cours...", "Extraction in progress...")}</small>
              ) : (
                <>
                  {overlay.rows.map((row) => (
                    <div key={`field_live_gain_${overlay.id}_${row.resourceId}`} className="sector-field-live-row">
                      <ResourceTextWithIcon resourceId={row.resourceId} language={language} />
                      <strong>+{row.amount.toLocaleString()}</strong>
                    </div>
                  ))}
                  <small className={`sector-field-live-capacity ${overlay.cargoCapacity > 0 && overlay.cargoUsed >= overlay.cargoCapacity ? "full" : ""}`}>
                    {l("Soute", "Cargo")}: {overlay.cargoUsed.toLocaleString()} / {overlay.cargoCapacity.toLocaleString()}
                    {overlay.cargoCapacity > 0 && overlay.cargoUsed >= overlay.cargoCapacity
                      ? ` - ${l("Pleine", "Full")}`
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
                className={`sector-entity ${entity.type === "world" || entity.type === "resource" ? "orb-entity" : ""} ${entity.type === "world" ? "world-entity" : ""} ${entity.type === "resource" ? "resource-entity" : ""} ${targetable ? "targetable" : ""} ${visible ? "" : "muted"}`}
                style={{ left: entity.x, top: entity.y }}
              >
                {selected ? <span className="sector-select-ring" /> : null}
                {targetable ? <span className="sector-target-ring" /> : null}

                {entity.type === "resource" &&
                entity.isOccupied &&
                entity.occupiedByUsername &&
                normalizeMapEntityId(entity.occupiedByPlayerId || "") !== normalizeMapEntityId(currentUserId) ? (
                  <>
                    <span className="sector-harvester-warning" aria-hidden="true">!</span>
                    <span className="sector-harvester-tag">{entity.occupiedByUsername}</span>
                  </>
                ) : null}

                {entity.type === "station" ? (
                  <span className={`sector-core station-${entity.hue} ${entity.isPlayer ? "player" : ""}`}>
                    <Hexagon size={38} />
                  </span>
                ) : null}

                {entity.type === "world" || entity.type === "resource" ? (
                  <span
                    className={`sector-world sector-mission-world-anchor ${entity.type === "resource" ? "sector-resource-orb-anchor" : ""}`}
                  />
                ) : null}

                <span
                  className={`sector-label ${entity.type === "world" ? "mission-world-label" : ""} ${entity.type === "resource" ? "resource-orb-label" : ""}`}
                >
                  <strong>{sectorEntityDisplayName(entity, language)}</strong>
                  {entity.type !== "world" ? <small>[{entity.x}, {entity.y}]</small> : null}
                </span>
              </button>
            );
          })}
          </div>
        </div>
        <MissionWorldLayer orbs={visibleMapOrbEntities} pan={pan} zoom={zoom} viewportSize={viewportSize} />
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
              <h3><Hourglass size={15} /> {primaryMapExpedition?.missionKind === "attack" ? l("Interception", "Interception") : l("Exploitation", "Harvesting")}</h3>
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
                  {primaryMapExpedition.missionKind === "attack" ? (
                    <div>
                      <span>{l("Cible", "Target")}</span>
                      <strong>
                        {String(primaryMapExpedition.targetUsername || "").trim() || l("Flotte ennemie", "Enemy fleet")}
                      </strong>
                    </div>
                  ) : null}
                  <div>
                    <span>{l("Fin estimee", "ETA")}</span>
                    <strong>
                      {new Date(primaryExpeditionState.endAt * 1000).toLocaleTimeString()}
                    </strong>
                  </div>
                  <div>
                    <span>{primaryMapExpedition.missionKind === "attack" ? l("Capacite de butin", "Loot capacity") : l("Vitesse de collecte", "Harvest speed")}</span>
                    <strong>
                      {primaryMapExpedition.missionKind === "attack"
                        ? primaryMapExpedition.totalTransportCapacity.toLocaleString()
                        : primaryMapExpedition.totalHarvestSpeed.toLocaleString()}
                    </strong>
                  </div>
                  {primaryMapExpedition.missionKind === "attack" ? (
                    mapLiveCollectedRows.length > 0 ? (
                      <div className="sector-map-live-gains">
                        <p>{l("Butin embarque", "Loot onboard")}</p>
                        {mapLiveCollectedRows.map((row) => (
                          <div key={`map_attack_loot_${row.resourceId}`} className="sector-map-live-gain-row">
                            <ResourceTextWithIcon resourceId={row.resourceId} language={language} />
                            <strong>+{row.amount.toLocaleString()}</strong>
                          </div>
                        ))}
                        <small className={`sector-field-live-capacity ${primaryMapExpedition.totalTransportCapacity > 0 && (primaryLiveExtractionOverlay?.cargoUsed ?? 0) >= primaryMapExpedition.totalTransportCapacity ? "full" : ""}`}>
                          {l("Soute", "Cargo")}: {(primaryLiveExtractionOverlay?.cargoUsed ?? 0).toLocaleString()} / {primaryMapExpedition.totalTransportCapacity.toLocaleString()}
                        </small>
                      </div>
                    ) : null
                  ) : primaryExpeditionState.status === "extracting" ? (
                    <div className="sector-map-live-gains">
                      <p>{l("Ressources cumulees", "Accumulated resources")}</p>
                      {mapLiveCollectedRows.length <= 0 ? (
                        <small>{l("Extraction en cours...", "Extraction in progress...")}</small>
                      ) : (
                        <>
                          {mapLiveCollectedRows.map((row) => (
                            <div key={`map_gain_${row.resourceId}`} className="sector-map-live-gain-row">
                              <ResourceTextWithIcon resourceId={row.resourceId} language={language} />
                              <strong>+{row.amount.toLocaleString()}</strong>
                            </div>
                          ))}
                          {primaryLiveExtractionOverlay ? (
                            <>
                              <small className={`sector-field-live-capacity ${primaryLiveExtractionOverlay.cargoCapacity > 0 && primaryLiveExtractionOverlay.cargoUsed >= primaryLiveExtractionOverlay.cargoCapacity ? "full" : ""}`}>
                                {l("Soute", "Cargo")}: {primaryLiveExtractionOverlay.cargoUsed.toLocaleString()} / {primaryLiveExtractionOverlay.cargoCapacity.toLocaleString()}
                                {primaryLiveExtractionOverlay.cargoCapacity > 0 && primaryLiveExtractionOverlay.cargoUsed >= primaryLiveExtractionOverlay.cargoCapacity
                                  ? ` - ${l("Pleine", "Full")}`
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
                          ? ` - ${l("Proprietaire", "Owner")}: ${sectorStationOwnerDisplay(selectedEntity, language)}`
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
                      <div><span>{l("Rarete", "Rarity")}</span><strong>{mapFieldRarityDisplay(selectedEntity.rarityTier, language)}</strong></div>
                      <div><span>{l("Qualite", "Quality")}</span><strong>{mapFieldQualityDisplay(selectedEntity.qualityTier, language)}</strong></div>
                      <div><span>{l("Rendement restant", "Remaining yield")}</span><strong>{Math.max(0, Math.floor(Number(selectedEntity.amount ?? 0))).toLocaleString()}</strong></div>
                      {(selectedEntity.resources ?? []).map((row) => (
                        <div key={`rf_res_${selectedEntity.id}_${row.resourceId}`}>
                          <ResourceTextWithIcon resourceId={row.resourceId} language={language} />
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
                          <div><span>{l("Carburant mission", "Mission fuel")}</span><strong>{selectedFieldPlan.fuelCredits.toLocaleString()} {l("Credits", "Credits")}</strong></div>
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
                        fieldPopupOccupiedByRival ? (
                          <div className="sector-field-actions">
                            <div className="sector-field-actions-head">
                              <p>{l("Champ rival", "Rival field")}</p>
                              <span className="sector-field-slot-pill alert">
                                {selectedEntity.occupiedByUsername || l("Rivale", "Rival")}
                              </span>
                            </div>
                            <button
                              type="button"
                              className="sector-war-btn attack"
                              onClick={() => void launchAttackOnField(selectedEntity.fieldId!, { autoFromHarvest: true, allowAutoFill: true })}
                              disabled={mapActionBusy || !hasCombatCapableAutoAttackFleet}
                            >
                              {mapActionBusy ? l("Engagement...", "Engaging...") : l("Attaquer le champ", "Attack the field")}
                            </button>
                            <p className="sector-empty">
                              {hasCombatCapableAutoAttackFleet
                                ? l(
                                    "Une tentative de collecte sur un champ rival est convertie en attaque automatique.",
                                    "A harvesting attempt on a rival field is converted into an automatic attack."
                                  )
                                : l(
                                    "Aucune escadre de combat disponible pour une attaque automatique.",
                                    "No combat squadron is available for an automatic attack."
                                  )}
                            </p>
                          </div>
                        ) : (
                          <p className="sector-empty">
                            {l(
                              "Ce champ est deja occupe. Choisissez un champ libre.",
                              "This field is already occupied. Choose a free field."
                            )}
                          </p>
                        )
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
                  {l("Champ de ressources", "Resource field")} - [{fieldPopupEntity.x}, {fieldPopupEntity.y}]
                </p>
              </div>
              <button type="button" onClick={() => setFieldPopupId(null)}><X size={18} /></button>
            </div>

            {mapActionError ? <p className="sector-map-error">{mapActionError}</p> : null}

            <div className="sector-field-modal-body">
              <section className="sector-field-priority">
                <div className="sector-field-priority-head">
                  <span className={`sector-field-status-badge ${fieldPopupEntity.isOccupied ? "occupied" : "free"}`}>
                    {fieldPopupEntity.isOccupied ? l("Occupe", "Occupied") : l("Libre", "Free")}
                  </span>
                  <span className="sector-field-type-badge">{resourceTypeLabel(fieldPopupEntity.resourceType)}</span>
                  {!fieldPopupEntity.hiddenDetails ? (
                    <>
                      <span className="sector-field-info-badge">{mapFieldRarityDisplay(fieldPopupEntity.rarityTier, language)}</span>
                      <span className="sector-field-info-badge">{mapFieldQualityDisplay(fieldPopupEntity.qualityTier, language)}</span>
                    </>
                  ) : null}
                </div>

                {fieldPopupEntity.isOccupied && fieldPopupEntity.occupiedByUsername ? (
                  <p className="sector-field-operator">
                    {l("Exploite par", "Harvested by")} <strong>{fieldPopupEntity.occupiedByUsername}</strong>
                  </p>
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
                    <div className="sector-field-brief">
                      <article className="sector-field-brief-card">
                        <span>{l("Ressources detectees", "Detected resources")}</span>
                        <strong>{fieldPopupResourceCount.toLocaleString()}</strong>
                      </article>
                      <article className="sector-field-brief-card">
                        <span>{l("Volume restant", "Remaining volume")}</span>
                        <strong>{fieldPopupRemainingTotal.toLocaleString()}</strong>
                      </article>
                      <article className="sector-field-brief-card">
                        <span>{l("Travail restant", "Remaining work")}</span>
                        <strong>{Math.max(0, Math.floor(Number(fieldPopupEntity.remainingExtractionWork ?? 0))).toLocaleString()}</strong>
                      </article>
                    </div>
                    <details className="sector-field-spoiler">
                      <summary>{l("Contenu du champ", "Field contents")}</summary>
                      <div className="sector-field-spoiler-content">
                        <div className="sector-field-resource-strip">
                          {(fieldPopupEntity.resources ?? []).map((row) => (
                            <article key={`rf_modal_res_${fieldPopupEntity.id}_${row.resourceId}`} className="sector-field-resource-card">
                              <ResourceTextWithIcon resourceId={row.resourceId} language={language} className="sector-field-resource-label" />
                              <strong>{Math.floor(row.remainingAmount).toLocaleString()}</strong>
                              <small>{l("sur", "of")} {Math.floor(row.totalAmount).toLocaleString()}</small>
                            </article>
                          ))}
                        </div>
                      </div>
                    </details>
                  </>
                )}
              </section>

              {!fieldPopupEntity.hiddenDetails && fieldPopupEntity.fieldId && !fieldPopupEntity.isOccupied ? (
                <section className="sector-field-command-panel">
                  <div className="sector-field-command-head">
                    <div>
                      <h5>{l("Envoi de flotte", "Fleet dispatch")}</h5>
                      <p>{l("Composez votre flotte de collecte et lancez l'exploitation.", "Build your harvesting fleet and launch the operation.")}</p>
                    </div>
                    <span className="sector-field-slot-pill">
                      {l("Slots", "Slots")} {mapActiveBlockingExpeditions}/{mapMaxActiveExpeditions}
                    </span>
                  </div>

                  <div className="sector-field-action-row">
                    <button type="button" className="sector-field-quick-fill" onClick={fillAllHarvestFleetDraft}>
                      {l("Tout envoyer", "Send all")}
                    </button>
                    <button type="button" className="sector-field-quick-fill subtle" onClick={clearAllHarvestFleetDraft}>
                      {l("Reinitialiser", "Reset")}
                    </button>
                    {["pegase", "argo", "arche_spatiale"].map((unitId) => (
                      <button
                        key={`fill_${unitId}`}
                        type="button"
                        className="sector-field-quick-fill subtle"
                        onClick={() => setHarvestFleetDraftForUnit(unitId, "max")}
                        title={hangarUnitDisplayDescription(unitId, unitId, language)}
                      >
                        {l("Tout", "All")} {hangarUnitDisplayName(unitId, unitId, language)}
                      </button>
                    ))}
                  </div>

                  <div className="sector-field-command-stats">
                    <article>
                      <span>{l("Distance", "Distance")}</span>
                      <strong>{selectedFieldPlan ? `${Math.round(selectedFieldPlan.distance).toLocaleString()} u` : "--"}</strong>
                    </article>
                    <article>
                      <span>{l("Trajet estime", "Estimated travel")}</span>
                      <strong>
                        {selectedFieldPlan
                          ? `${Math.floor(selectedFieldPlan.travelSeconds / 60)}m ${selectedFieldPlan.travelSeconds % 60}s`
                          : "--"}
                      </strong>
                    </article>
                    <article>
                      <span>{l("Extraction estimee", "Estimated extraction")}</span>
                      <strong>
                        {selectedFieldPlan
                          ? `${Math.floor(selectedFieldPlan.extractionSeconds / 60)}m`
                          : "--"}
                      </strong>
                    </article>
                    <article>
                      <span>{l("Capacite cargo", "Cargo capacity")}</span>
                      <strong>{selectedFieldPlan ? selectedFieldPlan.totalCapacity.toLocaleString() : "--"}</strong>
                    </article>
                    <article>
                      <span>{l("Debit total", "Total harvest speed")}</span>
                      <strong>{selectedFieldPlan ? selectedFieldPlan.totalHarvestSpeed.toLocaleString() : "--"}</strong>
                    </article>
                    <article>
                      <span>{l("Carburant", "Fuel")}</span>
                      <strong>
                        {selectedFieldPlan ? `${selectedFieldPlan.fuelCredits.toLocaleString()} ${l("Credits", "Credits")}` : "--"}
                      </strong>
                    </article>
                  </div>

                  <details className="sector-field-spoiler">
                    <summary>{l("Comparer les coques de collecte", "Compare harvesting hulls")}</summary>
                    <div className="sector-field-spoiler-content">
                      <div className="sector-field-compare">
                        {["pegase", "argo", "arche_spatiale"].map((unitId) => {
                          const stats = MAP_HARVEST_UNIT_STATS[unitId];
                          const shipImage = HANGAR_SHIP_IMAGE_MAP[unitId];
                          const maxHarvest = Math.max(...["pegase", "argo", "arche_spatiale"].map((id) => Number(MAP_HARVEST_UNIT_STATS[id]?.harvestSpeed ?? 0)));
                          const maxCargo = Math.max(...["pegase", "argo", "arche_spatiale"].map((id) => Number(MAP_HARVEST_UNIT_STATS[id]?.harvestCapacity ?? 0)));
                          const maxSpeed = Math.max(...["pegase", "argo", "arche_spatiale"].map((id) => Number(MAP_HARVEST_UNIT_STATS[id]?.mapSpeed ?? 0)));
                          return (
                            <article key={`fleet_compare_${unitId}`} className={`sector-field-compare-card ${unitId.replace(/_/g, "-")}`}>
                              <div className="sector-field-compare-head">
                                {shipImage ? (
                                  <img
                                    src={shipImage}
                                    alt={hangarUnitDisplayName(unitId, unitId, language)}
                                    className="sector-field-compare-ship"
                                  />
                                ) : null}
                                <div>
                                  <strong>{hangarUnitDisplayName(unitId, unitId, language)}</strong>
                                  <small>{hangarUnitDisplayDescription(unitId, unitId, language)}</small>
                                </div>
                              </div>
                              <div className="sector-field-compare-meters">
                                <div>
                                  <span>{l("Recolte", "Harvest")}</span>
                                  <b>{Math.max(0, Math.floor(Number(stats?.harvestSpeed ?? 0)))}</b>
                                  <i><em style={{ width: `${maxHarvest > 0 ? (Number(stats?.harvestSpeed ?? 0) / maxHarvest) * 100 : 0}%` }} /></i>
                                </div>
                                <div>
                                  <span>{l("Cargo", "Cargo")}</span>
                                  <b>{Math.max(0, Math.floor(Number(stats?.harvestCapacity ?? 0))).toLocaleString()}</b>
                                  <i><em style={{ width: `${maxCargo > 0 ? (Number(stats?.harvestCapacity ?? 0) / maxCargo) * 100 : 0}%` }} /></i>
                                </div>
                                <div>
                                  <span>{l("Vitesse", "Speed")}</span>
                                  <b>{Math.max(0, Math.floor(Number(stats?.mapSpeed ?? 0)))}</b>
                                  <i><em style={{ width: `${maxSpeed > 0 ? (Number(stats?.mapSpeed ?? 0) / maxSpeed) * 100 : 0}%` }} /></i>
                                </div>
                              </div>
                            </article>
                          );
                        })}
                      </div>
                    </div>
                  </details>

                  <div className="sector-field-command-grid">
                    {["argo", "pegase", "arche_spatiale"].map((unitId) => {
                      const available = Math.max(0, Math.floor(Number(harvestAvailability[unitId] ?? 0)));
                      const raw = fleetDraft[unitId] ?? "0";
                      const currentQty = Math.max(0, Math.min(available, Math.floor(Number(raw || 0))));
                      const stats = MAP_HARVEST_UNIT_STATS[unitId];
                      const shipImage = HANGAR_SHIP_IMAGE_MAP[unitId];
                      const selectedHarvest = currentQty * Math.max(0, Math.floor(Number(stats?.harvestSpeed ?? 0)));
                      const selectedCargo = currentQty * Math.max(0, Math.floor(Number(stats?.harvestCapacity ?? 0)));
                      const selectedSpeed = currentQty > 0 ? Math.max(0, Math.floor(Number(stats?.mapSpeed ?? 0))) : 0;
                      const unitRole = unitId === "pegase"
                        ? l("Collecte rapide", "Rapid harvester")
                        : unitId === "argo"
                          ? l("Convoyeur equilibre", "Balanced convoy")
                          : l("Cargo massif", "Heavy cargo");
                      return (
                        <article
                          key={`fleet_modal_${unitId}`}
                          className={`sector-field-unit-card ${currentQty > 0 ? "selected" : ""} ${unitId.replace(/_/g, "-")}`}
                        >
                          <div className="sector-field-unit-media">
                            {shipImage ? (
                              <img
                                src={shipImage}
                                alt={hangarUnitDisplayName(unitId, unitId, language)}
                                className="sector-field-unit-ship"
                              />
                            ) : null}
                            <span className="sector-field-unit-role">{unitRole}</span>
                            <span className="sector-field-unit-available">
                              {available.toLocaleString()} {l("disponibles", "available")}
                            </span>
                            <span className="sector-field-unit-count">
                              {l("Selection", "Selected")} {currentQty}
                            </span>
                          </div>

                          <div className="sector-field-unit-card-head">
                            <div>
                              <strong>{hangarUnitDisplayName(unitId, unitId, language)}</strong>
                              <p>
                                {hangarUnitDisplayDescription(
                                  unitId,
                                  l("Vaisseau dedie a l'exploitation des champs.", "Ship specialized in field harvesting."),
                                  language
                                )}
                              </p>
                              <small>{l("En reserve", "In reserve")}: {available}</small>
                            </div>
                            <span className="sector-field-unit-tag">{available > 0 ? l("Pret", "Ready") : l("Vide", "Empty")}</span>
                          </div>

                          <div className="sector-field-unit-toolbar">
                            <button
                              type="button"
                              className="sector-field-mini-btn"
                              onClick={() => setHarvestFleetDraftForUnit(unitId, "max")}
                              disabled={mapActionBusy || available <= 0}
                            >
                              MAX
                            </button>
                            <button
                              type="button"
                              className="sector-field-mini-btn subtle"
                              onClick={() => setHarvestFleetDraftForUnit(unitId, "clear")}
                              disabled={mapActionBusy || currentQty <= 0}
                            >
                              {l("RAZ", "CLR")}
                            </button>
                          </div>

                          <div className="sector-field-unit-stats">
                            <span>
                              <small>{l("Recolte", "Harvest")}</small>
                              <b>{Math.max(0, Math.floor(Number(stats?.harvestSpeed ?? 0)))}</b>
                            </span>
                            <span>
                              <small>{l("Cargo", "Cargo")}</small>
                              <b>{Math.max(0, Math.floor(Number(stats?.harvestCapacity ?? 0))).toLocaleString()}</b>
                            </span>
                            <span>
                              <small>{l("Vitesse", "Speed")}</small>
                              <b>{Math.max(0, Math.floor(Number(stats?.mapSpeed ?? 0)))}</b>
                            </span>
                          </div>

                          <div className="sector-field-quantity-picker">
                            <button
                              type="button"
                              onClick={() => setFleetDraft((prev) => ({ ...prev, [unitId]: String(Math.max(0, currentQty - 1)) }))}
                              disabled={mapActionBusy || currentQty <= 0}
                            >
                              -
                            </button>
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
                            <button
                              type="button"
                              onClick={() => setFleetDraft((prev) => ({ ...prev, [unitId]: String(Math.min(available, currentQty + 1)) }))}
                              disabled={mapActionBusy || currentQty >= available}
                            >
                              +
                            </button>
                          </div>

                          <div className="sector-field-unit-contrib">
                            <span>
                              <small>{l("Debit mission", "Mission harvest")}</small>
                              <b>{selectedHarvest.toLocaleString()}</b>
                            </span>
                            <span>
                              <small>{l("Cargo mission", "Mission cargo")}</small>
                              <b>{selectedCargo.toLocaleString()}</b>
                            </span>
                            <span>
                              <small>{l("Vitesse mission", "Mission speed")}</small>
                              <b>{selectedSpeed.toLocaleString()}</b>
                            </span>
                          </div>
                        </article>
                      );
                    })}
                  </div>

                  <div className="sector-field-command-foot">
                    <div className="sector-field-launch-brief">
                      <span>{l("Distance", "Distance")} <strong>{selectedFieldPlan ? `${Math.round(selectedFieldPlan.distance).toLocaleString()} u` : "--"}</strong></span>
                      <span>{l("Carburant", "Fuel")} <strong>{selectedFieldPlan ? `${selectedFieldPlan.fuelCredits.toLocaleString()} ${l("Credits", "Credits")}` : "--"}</strong></span>
                    </div>
                    <button
                      type="button"
                      className="sector-war-btn sector-field-launch-btn"
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
                          : l("Envoyer la flotte", "Send fleet")}
                    </button>
                    <p>
                      {!canLaunchAnotherMapExpedition
                        ? l(
                            "Nombre maximal de flottes actives atteint. Attendez un retour ou augmentez Commandement d'Escadre.",
                            "Maximum active fleet slots reached. Wait for a fleet return or increase Squadron Command."
                          )
                        : !hasValidHarvestFleetSelection
                          ? l("Selectionnez au moins un vaisseau de collecte.", "Select at least one harvesting ship.")
                          : selectedFieldPlan
                            ? l(
                                `Verifiez le trajet, le cargo, le debit et le carburant (${selectedFieldPlan.fuelCredits.toLocaleString()} credits) avant d'envoyer la flotte.`,
                                `Check travel time, cargo, throughput and fuel (${selectedFieldPlan.fuelCredits.toLocaleString()} credits) before dispatching the fleet.`
                              )
                            : l("Verifiez le trajet, le cargo et le debit avant d'envoyer la flotte.", "Check travel time, cargo and harvest speed before dispatching the fleet.")}
                    </p>
                  </div>
                </section>
              ) : null}

              {fieldPopupEntity.fieldId && fieldPopupOccupiedByRival ? (
                <section className="sector-field-command-panel attack">
                  <div className="sector-field-command-head">
                    <div>
                      <h5>{l("Interception de flotte", "Fleet interception")}</h5>
                      <p>
                        {l(
                          "Assemblez une escadre pour frapper la flotte adverse pendant l'extraction. Le combat est resolu cote serveur.",
                          "Assemble a strike force to hit the enemy fleet during extraction. Combat is resolved server-side."
                        )}
                      </p>
                    </div>
                    <span className="sector-field-slot-pill alert">{l("Cible", "Target")} {fieldPopupEntity.occupiedByUsername || l("Rivale", "Rival")}</span>
                  </div>

                  <div className="sector-field-action-row">
                    <button type="button" className="sector-field-quick-fill" onClick={fillAllAttackFleetDraft}>
                      {l("Tout engager", "Engage all")}
                    </button>
                    <button type="button" className="sector-field-quick-fill subtle" onClick={clearAllAttackFleetDraft}>
                      {l("Reinitialiser", "Reset")}
                    </button>
                  </div>

                  <div className="sector-field-command-stats">
                    <article>
                      <span>{l("Distance", "Distance")}</span>
                      <strong>{selectedAttackPlan ? `${Math.round(selectedAttackPlan.distance).toLocaleString()} u` : "--"}</strong>
                    </article>
                    <article>
                      <span>{l("Impact estime", "Estimated impact")}</span>
                      <strong>
                        {selectedAttackPlan
                          ? `${Math.floor(selectedAttackPlan.travelSeconds / 60)}m ${selectedAttackPlan.travelSeconds % 60}s`
                          : "--"}
                      </strong>
                    </article>
                    <article>
                      <span>{l("Puissance", "Firepower")}</span>
                      <strong>{selectedAttackPlan ? selectedAttackPlan.totalForce.toLocaleString() : "--"}</strong>
                    </article>
                    <article>
                      <span>{l("Endurance", "Endurance")}</span>
                      <strong>{selectedAttackPlan ? selectedAttackPlan.totalEndurance.toLocaleString() : "--"}</strong>
                    </article>
                    <article>
                      <span>{l("Capture max", "Loot cap")}</span>
                      <strong>{selectedAttackPlan ? selectedAttackPlan.totalLootCapacity.toLocaleString() : "--"}</strong>
                    </article>
                    <article>
                      <span>{l("Vitesse moyenne", "Average speed")}</span>
                      <strong>{selectedAttackPlan ? selectedAttackPlan.averageSpeed.toLocaleString() : "--"}</strong>
                    </article>
                    <article>
                      <span>{l("Carburant", "Fuel")}</span>
                      <strong>
                        {selectedAttackPlan ? `${selectedAttackPlan.fuelCredits.toLocaleString()} ${l("Credits", "Credits")}` : "--"}
                      </strong>
                    </article>
                  </div>

                  {availableAttackShipRows.length <= 0 ? (
                    <p className="sector-empty">
                      {l(
                        "Aucun vaisseau de combat offensif n'est disponible. Construisez d'abord une escadre dans le Hangar.",
                        "No offensive combat ship is available. Build a strike wing in the Hangar first."
                      )}
                    </p>
                  ) : (
                  <div className="sector-field-command-grid">
                    {availableAttackShipRows.map((row) => {
                      const unitId = row.unitId;
                      const available = Math.max(0, Math.floor(Number(row.quantity ?? 0)));
                      const raw = attackFleetDraft[unitId] ?? "0";
                      const currentQty = Math.max(0, Math.min(available, Math.floor(Number(raw || 0))));
                      const shipImage = HANGAR_SHIP_IMAGE_MAP[unitId];
                      const selectedForce = currentQty * row.force;
                      const selectedEndurance = currentQty * row.endurance;
                      const selectedLoot = currentQty * row.lootCapacity;
                      return (
                        <article
                          key={`fleet_attack_${unitId}`}
                          className={`sector-field-unit-card ${currentQty > 0 ? "selected" : ""} ${unitId.replace(/_/g, "-")}`}
                        >
                          <div className="sector-field-unit-media">
                            {shipImage ? (
                              <img
                                src={shipImage}
                                alt={hangarUnitDisplayName(unitId, unitId, language)}
                                className="sector-field-unit-ship"
                              />
                            ) : null}
                            <span className="sector-field-unit-role">
                              {l("Escadre d'assaut", "Strike wing")}
                            </span>
                            <span className="sector-field-unit-available">
                              {available.toLocaleString()} {l("disponibles", "available")}
                            </span>
                            <span className="sector-field-unit-count">
                              {l("Selection", "Selected")} {currentQty}
                            </span>
                          </div>

                          <div className="sector-field-unit-card-head">
                            <div>
                              <strong>{hangarUnitDisplayName(unitId, unitId, language)}</strong>
                              <p>{hangarUnitDisplayDescription(unitId, unitId, language)}</p>
                              <small>{l("En reserve", "In reserve")}: {available}</small>
                            </div>
                            <span className="sector-field-unit-tag">
                              {available <= 0
                                ? l("Vide", "Empty")
                                : row.force > 0
                                  ? l("Combat", "Combat")
                                  : l("Transport", "Transport")}
                            </span>
                          </div>

                          <div className="sector-field-unit-toolbar">
                            <button
                              type="button"
                              className="sector-field-mini-btn"
                              onClick={() => setAttackFleetDraftForUnit(unitId, "max")}
                              disabled={mapActionBusy || available <= 0}
                            >
                              MAX
                            </button>
                            <button
                              type="button"
                              className="sector-field-mini-btn subtle"
                              onClick={() => setAttackFleetDraftForUnit(unitId, "clear")}
                              disabled={mapActionBusy || currentQty <= 0}
                            >
                              {l("RAZ", "CLR")}
                            </button>
                          </div>

                          <div className="sector-field-unit-stats">
                            <span>
                              <small>{l("Force", "Force")}</small>
                              <b>{row.force.toLocaleString()}</b>
                            </span>
                            <span>
                              <small>{l("Endurance", "Endurance")}</small>
                              <b>{row.endurance.toLocaleString()}</b>
                            </span>
                            <span>
                              <small>{l("Vitesse", "Speed")}</small>
                              <b>{row.speed.toLocaleString()}</b>
                            </span>
                          </div>

                          <div className="sector-field-quantity-picker">
                            <button
                              type="button"
                              onClick={() => setAttackFleetDraft((prev) => ({ ...prev, [unitId]: String(Math.max(0, currentQty - 1)) }))}
                              disabled={mapActionBusy || currentQty <= 0}
                            >
                              -
                            </button>
                            <input
                              type="number"
                              min={0}
                                    max={available}
                              value={raw}
                              onChange={(e) => {
                                const next = Math.max(0, Math.min(available, Math.floor(Number(e.target.value || 0))));
                                setAttackFleetDraft((prev) => ({ ...prev, [unitId]: String(next) }));
                              }}
                            />
                            <button
                              type="button"
                              onClick={() => setAttackFleetDraft((prev) => ({ ...prev, [unitId]: String(Math.min(available, currentQty + 1)) }))}
                              disabled={mapActionBusy || currentQty >= available}
                            >
                              +
                            </button>
                          </div>

                          <div className="sector-field-unit-contrib">
                            <span>
                              <small>{l("Force mission", "Mission force")}</small>
                              <b>{selectedForce.toLocaleString()}</b>
                            </span>
                            <span>
                              <small>{l("Tenue mission", "Mission endurance")}</small>
                              <b>{selectedEndurance.toLocaleString()}</b>
                            </span>
                            <span>
                              <small>{l("Capture mission", "Mission loot")}</small>
                              <b>{selectedLoot.toLocaleString()}</b>
                            </span>
                          </div>
                        </article>
                      );
                    })}
                  </div>
                  )}

                  <div className="sector-field-command-foot">
                    <div className="sector-field-launch-brief danger">
                      <span>{l("Distance", "Distance")} <strong>{selectedAttackPlan ? `${Math.round(selectedAttackPlan.distance).toLocaleString()} u` : "--"}</strong></span>
                      <span>{l("Carburant", "Fuel")} <strong>{selectedAttackPlan ? `${selectedAttackPlan.fuelCredits.toLocaleString()} ${l("Credits", "Credits")}` : "--"}</strong></span>
                    </div>
                    <button
                      type="button"
                      className="sector-war-btn sector-field-launch-btn"
                      onClick={() => void launchAttackOnField(fieldPopupEntity.fieldId!)}
                      disabled={mapActionBusy || !hasValidAttackFleetSelection}
                    >
                      {mapActionBusy
                        ? l("Engagement...", "Engaging...")
                        : l("Attaquer le champ", "Attack the field")}
                    </button>
                    <p>
                      {!hasValidAttackFleetSelection
                        ? selectedAttackPlan && selectedAttackPlan.fleet.length > 0 && !selectedAttackHasCombatForce
                          ? l(
                              "Ajoutez au moins un vaisseau de combat. Les transporteurs seuls ne peuvent pas lancer l'assaut.",
                              "Add at least one combat ship. Transports alone cannot launch the assault."
                            )
                          : l("Selectionnez au moins une escadre de combat.", "Select at least one combat squadron.")
                        : selectedAttackPlan
                          ? l(
                              `Une attaque sur un champ interrompt l'exploitation. Le gagnant repart avec le cargo qu'il parvient a securiser. Carburant estime: ${selectedAttackPlan.fuelCredits.toLocaleString()} credits.`,
                              `An attack on a field interrupts harvesting. The winner leaves with the cargo it can secure. Estimated fuel: ${selectedAttackPlan.fuelCredits.toLocaleString()} credits.`
                            )
                          : l(
                              "Une attaque sur un champ interrompt l'exploitation. Le gagnant repart avec le cargo qu'il parvient a securiser.",
                              "An attack on a field interrupts harvesting. The winner leaves with the cargo it can secure."
                            )}
                    </p>
                  </div>
                </section>
              ) : null}

              {fieldPopupEntity.fieldId && fieldPopupOccupiedBySelf ? (
                <p className="sector-empty">
                  {l(
                    "Votre flotte exploite deja ce champ. Utilisez Retour dans Flottes en vol pour interrompre l'extraction.",
                    "Your fleet is already harvesting this field. Use Return in Fleets in flight to interrupt extraction."
                  )}
                </p>
              ) : null}

              {fieldPopupEntity.fieldId && fieldPopupEntity.isOccupied && !fieldPopupOccupiedByRival && !fieldPopupOccupiedBySelf ? (
                <p className="sector-empty">
                  {l(
                    "Ce champ est deja occupe. Choisissez un champ libre.",
                    "This field is already occupied. Choose a free field."
                  )}
                </p>
              ) : null}

              <details className="sector-field-spoiler">
                <summary>{l("Details du champ", "Field details")}</summary>
                <div className="sector-detail-list">
                  <div><span>{l("Type", "Type")}</span><strong>{resourceTypeLabel(fieldPopupEntity.resourceType)}</strong></div>
                  <div><span>{l("Occupation", "Occupation")}</span><strong>{fieldPopupEntity.isOccupied ? l("Occupe", "Occupied") : l("Libre", "Free")}</strong></div>
                  {fieldPopupEntity.isOccupied && fieldPopupEntity.occupiedByUsername ? (
                    <div><span>{l("Exploitant", "Operator")}</span><strong>{fieldPopupEntity.occupiedByUsername}</strong></div>
                  ) : null}
                  {!fieldPopupEntity.hiddenDetails ? (
                    <>
                      <div><span>{l("Rarete", "Rarity")}</span><strong>{mapFieldRarityDisplay(fieldPopupEntity.rarityTier, language)}</strong></div>
                      <div><span>{l("Qualite", "Quality")}</span><strong>{mapFieldQualityDisplay(fieldPopupEntity.qualityTier, language)}</strong></div>
                      <div><span>{l("Rendement restant", "Remaining yield")}</span><strong>{Math.max(0, Math.floor(Number(fieldPopupEntity.amount ?? 0))).toLocaleString()}</strong></div>
                      <div>
                        <span>{l("Travail restant", "Remaining work")}</span>
                        <strong>{Math.floor(Number(fieldPopupEntity.remainingExtractionWork ?? 0)).toLocaleString()}</strong>
                      </div>
                    </>
                  ) : null}
                </div>
              </details>
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
  const familyLabel = (family: HangarUnitFamily) => (language === "en" ? HANGAR_FAMILY_META[family].labelEn : HANGAR_FAMILY_META[family].labelFr);
  const familySummary = (family: HangarUnitFamily) => (language === "en" ? HANGAR_FAMILY_META[family].summaryEn : HANGAR_FAMILY_META[family].summaryFr);
  const familyTactical = (family: HangarUnitFamily) => (language === "en" ? HANGAR_FAMILY_META[family].tacticalEn : HANGAR_FAMILY_META[family].tacticalFr);
  const familyImportance = (family: HangarUnitFamily) => (language === "en" ? HANGAR_FAMILY_META[family].importanceEn : HANGAR_FAMILY_META[family].importanceFr);
  const [tab, setTab] = useState<HangarCategory>("ship");
  const [familyFilter, setFamilyFilter] = useState<"all" | HangarUnitFamily>("all");
  const [quantityByUnit, setQuantityByUnit] = useState<Record<string, string>>({});
  const [boostItemId, setBoostItemId] = useState("");
  const [boostQuantityInput, setBoostQuantityInput] = useState("1");

  useEffect(() => {
    setFamilyFilter("all");
  }, [tab]);

  const authoritativeResources = serverResourceAmounts ?? resourceAmounts;
  const defs = useMemo(() => HANGAR_UNIT_DEFS.filter((unit) => unit.category === tab), [tab]);
  const familyOrder = useMemo(() => HANGAR_CATEGORY_FAMILY_ORDER[tab], [tab]);
  const visibleDefs = useMemo(
    () =>
      defs
        .filter((unit) => isHangarUnitUnlocked(unit.id, technologyLevels))
        .sort((a, b) => {
          const familyDelta = familyOrder.indexOf(hangarUnitFamilyOf(a.id)) - familyOrder.indexOf(hangarUnitFamilyOf(b.id));
          if (familyDelta !== 0) return familyDelta;
          return hangarUnitPriorityOf(a.id) - hangarUnitPriorityOf(b.id);
        }),
    [defs, familyOrder, technologyLevels]
  );
  const readyFamilies = useMemo(
    () => familyOrder.filter((family) => visibleDefs.some((def) => hangarUnitFamilyOf(def.id) === family)),
    [familyOrder, visibleDefs]
  );
  const visibleFamilySections = useMemo(
    () =>
      (familyFilter === "all" ? readyFamilies : readyFamilies.filter((family) => family === familyFilter)).map((family) => ({
        family,
        defs: visibleDefs.filter((def) => hangarUnitFamilyOf(def.id) === family)
      })),
    [familyFilter, readyFamilies, visibleDefs]
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
        .sort((a, b) => hangarUnitPriorityOf(a.def.id) - hangarUnitPriorityOf(b.def.id)),
    [builtUnitRows]
  );
  const builtDefenses = useMemo(
    () =>
      builtUnitRows
        .filter((row) => row.def.category === "defense")
        .sort((a, b) => hangarUnitPriorityOf(a.def.id) - hangarUnitPriorityOf(b.def.id)),
    [builtUnitRows]
  );
  const currentReserveRows = useMemo(
    () =>
      builtUnitRows
        .filter((row) => row.def.category === tab)
        .sort((a, b) => {
          const familyDelta = familyOrder.indexOf(hangarUnitFamilyOf(a.def.id)) - familyOrder.indexOf(hangarUnitFamilyOf(b.def.id));
          if (familyDelta !== 0) return familyDelta;
          return hangarUnitPriorityOf(a.def.id) - hangarUnitPriorityOf(b.def.id);
        }),
    [builtUnitRows, familyOrder, tab]
  );
  const reserveByFamily = useMemo(
    () =>
      readyFamilies.map((family) => {
        const rows = currentReserveRows.filter((row) => hangarUnitFamilyOf(row.def.id) === family);
        const totalUnits = rows.reduce((sum, row) => sum + row.qty, 0);
        const totalForce = rows.reduce((sum, row) => sum + Math.max(0, row.def.force) * row.qty, 0);
        return { family, totalUnits, totalForce };
      }),
    [currentReserveRows, readyFamilies]
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

  const totalCombatReserve = useMemo(
    () => builtShips.reduce((sum, row) => sum + Math.max(0, row.def.force) * row.qty, 0),
    [builtShips]
  );
  const totalHarvestLift = useMemo(
    () =>
      builtShips.reduce(
        (sum, row) => sum + Math.max(0, Number(MAP_HARVEST_UNIT_STATS[row.def.id]?.harvestCapacity ?? 0)) * row.qty,
        0
      ),
    [builtShips]
  );
  const totalHullReserve = useMemo(
    () => builtShips.reduce((sum, row) => sum + Math.max(0, row.def.endurance) * row.qty, 0),
    [builtShips]
  );
  const totalDefensePower = useMemo(
    () => builtDefenses.reduce((sum, row) => sum + Math.max(0, row.def.force) * row.qty, 0),
    [builtDefenses]
  );
  const totalQueuedUnits = useMemo(
    () => queueWithDefs.reduce((sum, entry) => sum + Math.max(0, entry.item.quantity), 0),
    [queueWithDefs]
  );

  const unitRoleLabel = (def: HangarUnitDef) => {
    const family = hangarUnitFamilyOf(def.id);
    if (def.category === "defense") return familyLabel(family);
    if (family === "logistics") return l("Soutien economique", "Economic support");
    if (family === "screening") return l("Interception", "Interception");
    if (family === "assault") return l("Assaut principal", "Main assault");
    return l("Briseur lourd", "Heavy breaker");
  };

  const unitStrategicAdvice = (def: HangarUnitDef) => {
    switch (def.id) {
      case "pegase":
        return l("Ideal pour ouvrir vite la carte et tester de petits champs. Escortez-le si un voisin peut intercepter.", "Ideal to open the map quickly and test small fields. Escort it if a neighbor can intercept.");
      case "argo":
        return l("C'est le convoyeur de travail. Bon compromis entre soute, vitesse et resilience pour vos rotations quotidiennes.", "This is your workhorse convoy. Good balance between cargo, speed and resilience for everyday rotations.");
      case "arche_spatiale":
        return l("A reserver aux longues routes ou aux champs tres riches. Sans escorte, sa perte coute cher.", "Use it on long routes or very rich fields. Without escort, losing it is expensive.");
      case "eclaireur_stellaire":
        return l("Excellent premier ecran. Sert a poursuivre les petits raids et a proteger vos transporteurs.", "Excellent first screen. Used to chase light raids and protect your haulers.");
      case "foudroyant":
        return l("Intercepteur superieur pour verrouiller la carte et couper les recolteurs adverses.", "Stronger interceptor to lock the map and cut enemy harvesters.");
      case "aurore":
        return l("Premier vrai outil offensif. A utiliser en meute pour forcer les replis rapides.", "First true offensive tool. Use it in packs to force fast retreats.");
      case "spectre":
        return l("Polyvalent et rentable. Tient bien la ligne contre des escadres moyennes.", "Flexible and efficient. Holds the line well against medium squadrons.");
      case "tempest":
        return l("Cle de vos frappes de terrain. Tres bon choix pour punir les recoltes ennemies.", "Key ship for field strikes. Excellent to punish enemy harvest runs.");
      case "titanide":
        return l("Stabilise la ligne lourde et absorbe les retours de feu. A coupler avec une vraie escorte.", "Stabilizes the heavy line and absorbs return fire. Pair it with a real escort.");
      case "colosse":
        return l("Unite decisive de fin de palier. A sortir seulement si votre economie peut suivre le carburant et les pertes.", "Decisive late-tier unit. Build it only if your economy can support the fuel and losses.");
      case "projecteur_photonique":
        return l("Premier verrou anti-raid de l'hyperstructure. Placez-le tot pour absorber les tests adverses.", "First anti-raid lock for your hyperstructure. Deploy it early to absorb enemy probes.");
      case "tourelle_rafale":
        return l("Couverture rapide contre les vagues legeres. Efficace pour proteger une economie encore fragile.", "Fast cover against light waves. Effective to protect a still-fragile economy.");
      case "batterie_eclat":
        return l("Excellente contre les escadres rapides. A combiner avec un bouclier pour durer.", "Excellent against fast squadrons. Pair it with shields to last.");
      case "lame_de_plasma":
        return l("Bonne batterie de transition pour les combats plus lourds autour de l'hyperstructure.", "Good transition battery for heavier fights around the hyperstructure.");
      case "canon_ion_aiguillon":
        return l("Plateforme polyvalente de milieu de palier. Solide contre les assauts moyens.", "Versatile mid-tier platform. Solid against medium assaults.");
      case "mine_orbitale_veille":
        return l("Impact brutal mais cadence lente. Ideal pour casser une pointe adverse au premier contact.", "High burst with slow cadence. Ideal to break an enemy spearhead on first impact.");
      case "canon_rail_longue_vue":
        return l("Tres bon contre les lourds. Donnez-lui du temps avec des ecrans et des boucliers.", "Excellent against heavy hulls. Buy it time with screens and shields.");
      case "projecteur_emp_silence":
        return l("Outil de controle. Il ralentit le rythme adverse et rend vos batteries plus rentables.", "Control tool. It slows the enemy pace and makes your batteries more efficient.");
      case "champ_aegis":
        return l("Base defensive prioritaire si vous voulez tenir sous pression. Il donne du temps a tout le reste.", "Priority defensive core if you want to hold under pressure. It buys time for everything else.");
      case "mur_photonique_prisme":
        return l("Mur de fatigue contre les vagues de raids. Excellent si vous attendez de longues sequences de harcelement.", "Attrition wall against raid waves. Excellent if you expect long harassment sequences.");
      case "lance_gravitationnel_ancre":
        return l("Piece terminale anti-capital. A deployer seulement quand votre base industrielle est deja stabilisee.", "Final anti-capital piece. Deploy it only once your industrial base is already stable.");
      default:
        return familyTactical(hangarUnitFamilyOf(def.id));
    }
  };

  return (
    <main className="hangar-v4-shell">
      <section className="hangar-v4-hero">
        <div className="hangar-v4-hero-copy">
          <span className="hangar-v4-eyebrow">{l("Doctrine navale", "Naval doctrine")}</span>
          <h2>{l("Hangar de projection", "Projection hangar")}</h2>
          <p>
            {l(
              "Ordonnez vos productions par famille, cachez les modeles encore verrouilles et pilotez la reserve comme un theatre d'operations compact.",
              "Command production by family, hide still-locked frames, and manage your reserve like a compact operations theater."
            )}
          </p>
          <div className="hangar-v4-tabrow">
            <button type="button" className={tab === "ship" ? "active" : ""} onClick={() => setTab("ship")}>
              <Rocket size={15} /> {l("Escadres", "Squadrons")}
            </button>
            <button type="button" className={tab === "defense" ? "active" : ""} onClick={() => setTab("defense")}>
              <Shield size={15} /> {l("Defenses", "Defenses")}
            </button>
          </div>
          <div className="hangar-v4-doctrine-banner">
            <Coins size={16} />
            <div>
              <strong>{l("Carburant tactique en credits", "Credit-based tactical fuel")}</strong>
              <span>
                {l(
                  "Chaque mission carte consomme des credits selon le type de coque, la distance et le role de la flotte.",
                  "Each map mission consumes credits based on hull class, distance and fleet role."
                )}
              </span>
            </div>
          </div>
        </div>
        <div className="hangar-v4-hero-stats">
          <article className="hangar-v4-kpi">
            <small>{l("File active", "Active queue")}</small>
            <strong>{totalQueuedUnits.toLocaleString()}</strong>
            <span>{activeQueueItem ? `${queueWithDefs[0]?.def ? unitName(queueWithDefs[0].def) : l("Production", "Production")} x${activeQueueItem.quantity}` : l("Aucune production", "No production")}</span>
          </article>
          <article className="hangar-v4-kpi">
            <small>{l("Puissance de reserve", "Reserve power")}</small>
            <strong>{totalCombatReserve.toLocaleString()}</strong>
            <span>{l("Force offensive stockee", "Stored offensive firepower")}</span>
          </article>
          <article className="hangar-v4-kpi">
            <small>{l("Soute logistique", "Logistics lift")}</small>
            <strong>{totalHarvestLift.toLocaleString()}</strong>
            <span>{l("Capacite de transport disponible", "Available haul capacity")}</span>
          </article>
          <article className="hangar-v4-kpi">
            <small>{l("Couverture defensive", "Defensive screen")}</small>
            <strong>{totalDefensePower.toLocaleString()}</strong>
            <span>{l("Feu stationnaire cumule", "Total static firepower")}</span>
          </article>
        </div>
      </section>

      <div className="hangar-v4-layout">
        <aside className="hangar-v4-sidebar">
          <section className="hangar-v4-panel">
            <div className="hangar-v4-panel-head">
              <strong>{l("Production tactique", "Tactical production")}</strong>
              <span>{l("Temps reel", "Real-time")}</span>
            </div>
            {loading ? <p className="hangar-v4-status">{l("Synchronisation Hangar...", "Syncing Hangar...")}</p> : null}
            {!loading && !serverResourcesReady ? (
              <p className="hangar-v4-status">{l("Ressources serveur Hangar en attente...", "Hangar server resources pending...")}</p>
            ) : null}
            {error ? <p className="hangar-v4-error">{error}</p> : null}
            {queueWithDefs.length === 0 ? (
              <p className="hangar-v4-empty">{l("Aucune fabrication en cours.", "No production in progress.")}</p>
            ) : (
              <div className="hangar-v4-queue-list">
                {queueWithDefs.map(({ item, def }, index) => {
                  const duration = Math.max(1, item.endAt - item.startAt);
                  const elapsed = Math.max(0, Math.min(duration, nowMs - item.startAt));
                  const ratio = Math.round((elapsed / duration) * 100);
                  const remaining = Math.max(0, Math.floor((item.endAt - nowMs) / 1000));
                  const waiting = nowMs < item.startAt;
                  return (
                    <article key={item.id} className={`hangar-v4-queue-item ${index === 0 ? "active" : ""}`}>
                      <header>
                        <div>
                          <strong>{unitName(def)}</strong>
                          <small>{item.quantity.toLocaleString()} {l("unites", "units")}</small>
                        </div>
                        {index === 0 ? (
                          <button
                            type="button"
                            className="hangar-v4-cancel"
                            disabled={actionBusy}
                            onClick={() => void onCancelQueueItem(item.id)}
                            title={l("Annuler et rembourser", "Cancel and refund")}
                          >
                            <X size={14} />
                          </button>
                        ) : null}
                      </header>
                      <div className="hangar-v4-progress"><div style={{ width: `${waiting ? 0 : ratio}%` }} /></div>
                      <footer>
                        <span>{waiting ? l("En attente", "Queued") : l("Temps restant", "Time left")}</span>
                        <strong>{formatDuration(remaining)}</strong>
                      </footer>
                    </article>
                  );
                })}
              </div>
            )}
            {activeQueueItem ? (
              <div className="hangar-v4-boost-box">
                <div className="hangar-v4-panel-head compact">
                  <strong>{l("Acceleration", "Acceleration")}</strong>
                  <span>{l("Inventaire", "Inventory")}</span>
                </div>
                {boostItems.length === 0 ? (
                  <p className="hangar-v4-empty small">{l("Aucun accelerateur disponible.", "No accelerator available.")}</p>
                ) : (
                  <div className="hangar-v4-boost-controls">
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
          </section>

          <section className="hangar-v4-panel">
            <div className="hangar-v4-panel-head">
              <strong>{tab === "ship" ? l("Reserve operationnelle", "Operational reserve") : l("Ligne defensive", "Defensive line")}</strong>
              <span>{tab === "ship" ? builtShips.reduce((sum, row) => sum + row.qty, 0).toLocaleString() : builtDefenses.reduce((sum, row) => sum + row.qty, 0).toLocaleString()}</span>
            </div>
            {currentReserveRows.length === 0 ? (
              <p className="hangar-v4-empty">{tab === "ship" ? l("Aucune coque disponible pour le moment.", "No hull available yet.") : l("Aucune defense disponible pour le moment.", "No defense available yet.")}</p>
            ) : (
              <div className="hangar-v4-reserve-list">
                {reserveByFamily
                  .filter((row) => row.totalUnits > 0)
                  .map((row) => (
                    <div key={`reserve_family_${row.family}`} className="hangar-v4-reserve-family">
                      <span>{familyLabel(row.family)}</span>
                      <strong>{row.totalUnits.toLocaleString()}</strong>
                      <small>{row.totalForce > 0 ? `${row.totalForce.toLocaleString()} ${l("force", "force")}` : l("Soutien", "Support")}</small>
                    </div>
                  ))}
              </div>
            )}
          </section>

          <section className="hangar-v4-panel">
            <div className="hangar-v4-panel-head">
              <strong>{l("Doctrine carburant", "Fuel doctrine")}</strong>
              <span>{l("Map", "Map")}</span>
            </div>
            <div className="hangar-v4-fuel-note">
              <div>
                <Coins size={15} />
                <span>{l("Base / 1000 distance", "Base / 1000 distance")}</span>
              </div>
              <strong>{l("importance de coque + distance", "hull importance + distance")}</strong>
            </div>
            <p className="hangar-v4-copy-note">
              {l(
                "Une mission de recolte consomme moins qu'une attaque. Plus la coque est lourde et plus la route est longue, plus le cout en credits augmente.",
                "A harvesting mission consumes less than an attack. The heavier the hull and the longer the route, the higher the credit cost."
              )}
            </p>
            <div className="hangar-v4-mini-metrics">
              <span>{l("Coques", "Hulls")}: {builtShips.reduce((sum, row) => sum + row.qty, 0).toLocaleString()}</span>
              <span>{l("Endurance stockee", "Stored hull")}: {totalHullReserve.toLocaleString()}</span>
            </div>
          </section>
        </aside>

        <section className="hangar-v4-catalog">
          <div className="hangar-v4-catalog-head">
            <div>
              <span className="hangar-v4-eyebrow">{tab === "ship" ? l("Catalogue d'escadres", "Squadron catalog") : l("Catalogue defensif", "Defense catalog")}</span>
              <h3>{tab === "ship" ? l("Vaisseaux classes par role", "Ships ordered by role") : l("Defenses classees par fonction", "Defenses ordered by function")}</h3>
              <p>
                {l(
                  "Les modeles verrouilles restent masques jusqu'au debloquage. Les cartes donnent la synthese, le hover ouvre le renseignement rapide et les spoilers gardent les details hors du flux principal.",
                  "Locked models stay hidden until unlocked. Cards show the summary, hover opens quick intel, and spoilers keep deep details out of the main flow."
                )}
              </p>
            </div>
            <div className="hangar-v4-family-pills">
              <button type="button" className={familyFilter === "all" ? "active" : ""} onClick={() => setFamilyFilter("all")}>
                {l("Toutes", "All")}
              </button>
              {readyFamilies.map((family) => (
                <button
                  key={`family_filter_${family}`}
                  type="button"
                  className={familyFilter === family ? "active" : ""}
                  onClick={() => setFamilyFilter(family)}
                >
                  {familyLabel(family)}
                </button>
              ))}
            </div>
          </div>

          {visibleFamilySections.length === 0 ? (
            <div className="hangar-v4-empty-state">
              <strong>{l("Aucun modele debloque dans cette categorie.", "No unlocked model in this category.")}</strong>
              <p>
                {tab === "ship"
                  ? l("Developpez les doctrines militaires et l'architecture capitale pour ouvrir de nouvelles coques.", "Develop military doctrines and capital architecture to unlock new hulls.")
                  : l("Faites progresser l'architecture defensive, les boucliers et la balistique pour ouvrir de nouvelles plateformes.", "Progress defensive architecture, shielding and ballistics to unlock new platforms.")}
              </p>
            </div>
          ) : (
            visibleFamilySections.map(({ family, defs: familyDefs }) => (
              <section key={`family_section_${family}`} className="hangar-v4-family-section">
                <header className="hangar-v4-family-head">
                  <div>
                    <span className="hangar-v4-eyebrow">{familyImportance(family)}</span>
                    <h4>{familyLabel(family)}</h4>
                    <p>{familySummary(family)}</p>
                  </div>
                  <div className="hangar-v4-family-meta">
                    <span>{familyDefs.length.toLocaleString()} {tab === "ship" ? l("modeles visibles", "visible models") : l("plateformes visibles", "visible platforms")}</span>
                    <span>{familyTactical(family)}</span>
                  </div>
                </header>

                <div className="hangar-v4-grid">
                  {familyDefs.map((def) => {
                    const requestedQty = Math.max(1, Math.floor(Number(quantityByUnit[def.id] ?? 1) || 1));
                    const maxBuildable = maxCraftableFromResources(authoritativeResources, def.cost);
                    const batchCost = scaleCost(def.cost, requestedQty);
                    const affordable = canAffordCost(authoritativeResources, batchCost);
                    const unitImagePath = def.category === "ship" ? HANGAR_SHIP_IMAGE_MAP[def.id] : HANGAR_DEFENSE_IMAGE_MAP[def.id];
                    const produced = Math.max(0, Math.floor(Number(inventory[def.id] ?? 0)));
                    const fuelBase = def.category === "ship" ? hangarUnitFuelBasePer1000(def.id) : 0;
                    const hoverImage = unitImagePath || "/room-images/vaisseau.png";
                    return (
                      <article key={def.id} className={`hangar-v4-card ${def.category} ${family.replace(/_/g, "-")}`}>
                        <div className="hangar-v4-card-bg" style={{ backgroundImage: `url(${hoverImage})` }} />
                        <div className="hangar-v4-card-top">
                          <span className="hangar-v4-badge">{unitRoleLabel(def)}</span>
                          <span className="hangar-v4-badge subtle">{familyImportance(family)}</span>
                        </div>
                        <div className="hangar-v4-card-main">
                          <div className="hangar-v4-card-media">
                            <img
                              src={hoverImage}
                              alt={unitName(def)}
                              className="hangar-v4-card-ship"
                              onError={(e) => {
                                const img = e.currentTarget as HTMLImageElement;
                                if (!img.src.endsWith("/room-images/vaisseau.png")) img.src = "/room-images/vaisseau.png";
                              }}
                            />
                          </div>
                          <div className="hangar-v4-card-headline">
                            <strong>{unitName(def)}</strong>
                            <small>{unitDescription(def)}</small>
                          </div>
                          <div className="hangar-v4-card-stock">
                            <span>{l("En service", "Owned")} <b>{produced.toLocaleString()}</b></span>
                            <span>{l("Fabricable", "Buildable")} <b>{maxBuildable.toLocaleString()}</b></span>
                          </div>
                          <div className="hangar-v4-card-stats">
                            <span>
                              <small>{l("Force", "Force")}</small>
                              <b>{def.force.toLocaleString()}</b>
                            </span>
                            <span>
                              <small>{l("Endurance", "Endurance")}</small>
                              <b>{def.endurance.toLocaleString()}</b>
                            </span>
                            <span>
                              <small>{def.category === "ship" ? l("Vitesse", "Speed") : l("Portee", "Range")}</small>
                              <b>{def.category === "ship" ? Math.max(0, Number(def.speed ?? 0)).toLocaleString() : String(def.range ?? "-")}</b>
                            </span>
                            <span>
                              <small>{def.category === "ship" ? l("Carburant / 1000", "Fuel / 1000") : l("Rechargement", "Reload")}</small>
                              <b>{def.category === "ship" ? `${fuelBase.toLocaleString()} ${l("cr", "cr")}` : String(def.reload ?? "-")}</b>
                            </span>
                          </div>
                          <ResourceCostDisplay cost={batchCost} available={authoritativeResources} language={language} compact className="hangar-v4-costs" />
                          <div className="hangar-v4-build-row">
                            <label>
                              <span>{l("Quantite", "Quantity")}</span>
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
                              disabled={!affordable || actionBusy || maxBuildable <= 0 || loading || !serverResourcesReady}
                              onClick={() => void onQueue(def.id, requestedQty)}
                            >
                              {actionBusy ? l("Transmission...", "Transmitting...") : l("Lancer la serie", "Queue batch")}
                            </button>
                          </div>
                        </div>

                        <div className="hangar-v4-hover-intel">
                          <div className="hangar-v4-hover-head">
                            <strong>{l("Renseignement rapide", "Quick intel")}</strong>
                            <span>{familyLabel(family)}</span>
                          </div>
                          <p>{familySummary(family)}</p>
                          <ul>
                            <li>{unitStrategicAdvice(def)}</li>
                            <li>
                              {def.category === "ship"
                                ? l(
                                    `Base carburant: ${fuelBase.toLocaleString()} credits par 1000 distance. Les attaques coutent plus qu'une collecte.`,
                                    `Fuel base: ${fuelBase.toLocaleString()} credits per 1000 distance. Attacks cost more than harvesting.`
                                  )
                                : l("Plateforme stationnaire: pas de carburant, mais une vraie dette industrielle a la production.", "Stationary platform: no fuel, but a real industrial debt when built.")}
                            </li>
                          </ul>
                        </div>

                        <details className="hangar-v4-details">
                          <summary>{l("Doctrine & fiche", "Doctrine & sheet")}</summary>
                          <div className="hangar-v4-details-grid">
                            <div>
                              <small>{l("Categorie", "Category")}</small>
                              <b>{def.category === "ship" ? l("Vaisseau", "Ship") : l("Defense", "Defense")}</b>
                            </div>
                            <div>
                              <small>{l("Famille", "Family")}</small>
                              <b>{familyLabel(family)}</b>
                            </div>
                            <div>
                              <small>{l("Temps unite", "Unit build time")}</small>
                              <b>{formatDuration(def.buildSeconds)}</b>
                            </div>
                            <div>
                              <small>{l("Temps serie", "Batch time")}</small>
                              <b>{formatDuration(def.buildSeconds * requestedQty)}</b>
                            </div>
                            <div>
                              <small>{def.category === "ship" ? l("Capacite / coque", "Cargo / hull") : l("Cadence", "Cadence")}</small>
                              <b>{def.category === "ship" ? Number(def.capacity ?? 0).toLocaleString() : String(def.reload ?? "-")}</b>
                            </div>
                            <div>
                              <small>{def.category === "ship" ? l("Q / h", "Quantum / h") : l("Carburant", "Fuel")}</small>
                              <b>{def.category === "ship" ? Number(def.quantumPerHour ?? 0).toLocaleString() : l("Stationnaire", "Static")}</b>
                            </div>
                          </div>
                          <div className="hangar-v4-doctrine-copy">
                            <p>{familyTactical(family)}</p>
                            <p>{unitStrategicAdvice(def)}</p>
                            {def.category === "ship" ? (
                              <p>
                                {l(
                                  `Carburant de reference: ${fuelBase.toLocaleString()} credits / 1000 distance. Plus la flotte est lourde et plus la route est longue, plus la mission coutera cher.`,
                                  `Reference fuel: ${fuelBase.toLocaleString()} credits / 1000 distance. The heavier the fleet and the longer the route, the more expensive the mission becomes.`
                                )}
                              </p>
                            ) : null}
                          </div>
                        </details>
                      </article>
                    );
                  })}
                </div>
              </section>
            ))
          )}
        </section>
      </div>
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
          <small>{l("Joueur", "Player")}: {playerId || "-"} � {new Date(nowMs).toLocaleTimeString()}</small>
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
                        {new Date((Number(log.at || 0) || 0) * 1000).toLocaleString()} � {String(log.by || "-")}
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
  resourceAmounts,
  onRankingRefresh,
  onEconomyRefresh,
  onUnauthorized
}: {
  language: UILanguage;
  playerId: string;
  nowMs: number;
  client: Client;
  session: Session | null;
  resourceAmounts: Record<string, number>;
  onRankingRefresh: () => void;
  onEconomyRefresh: () => Promise<void> | void;
  onUnauthorized: () => void;
}) {
  return (
    <AllianceCommandScreen
      language={language}
      playerId={playerId}
      nowMs={nowMs}
      client={client}
      session={session}
      resourceAmounts={resourceAmounts}
      onRankingRefresh={onRankingRefresh}
      onEconomyRefresh={onEconomyRefresh}
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
    { id: "atk1", target: "Forteresse Sigma-19", impactAt: nowMs + 34 * 60 * 1000, joined: 5, window: "�5 min" },
    { id: "atk2", target: "Relais de guerre K-412", impactAt: nowMs + 3 * 60 * 60 * 1000, joined: 3, window: "�5 min" }
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
      const score = formatDisplayedScoreLabel(Number(entry?.score ?? 0));
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
          <strong>{formatDisplayedScoreLabel(playerPoints)}</strong>
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
              <span>{row.score} pts</span>
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
              <strong className="score">{row.score}</strong>
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
  return (
    <TechnologyCommandScreen
      language={language}
      technologyDefs={TECHNOLOGY_DEFS}
      technologyLevels={technologyLevels}
      researchJob={researchJob}
      researchRemainingSeconds={researchRemainingSeconds}
      researchTimeFactor={researchTimeFactor}
      resourceAmounts={resourceAmounts}
      inventoryItems={inventoryItems}
      inventoryLoading={inventoryLoading}
      inventoryActionLoadingId={inventoryActionLoadingId}
      onLaunchResearch={onLaunchResearch}
      onUseBoost={onUseBoost}
      getTechnologyName={(techId, fallback) => technologyDisplayName(techId as TechnologyId, fallback, language)}
      getTechnologyDescription={(techId, fallback) => technologyDisplayDescription(techId as TechnologyId, fallback, language)}
      getTechnologyEffect={(techId, fallback) => technologyDisplayEffect(techId as TechnologyId, fallback, language)}
      getTechnologyCostForLevel={technologyCostForLevel}
      getTechnologyTimeForLevel={technologyTimeForLevel}
      areTechnologyRequirementsMet={(tech) => technologyRequirementsMet(technologyLevels, tech as TechnologyDef)}
      getRequirementsLabel={(tech) =>
        (tech.requires ?? [])
          .map((req) => `${technologyDisplayName(req.id as TechnologyId, TECHNOLOGY_BY_ID[req.id as TechnologyId].name, language)} Lv.${req.level}`)
          .join(" + ")
      }
      formatBoostDurationLabel={formatBoostDurationLabel}
    />
  );
}
function WikiScreen({ language }: { language: UILanguage }) {
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

  return (
    <WikiKnowledgeScreen
      language={language}
      buildingRows={buildingRows}
      ships={ships}
      defenses={defenses}
      techRows={techRows}
      formatWikiCost={formatWikiCost}
    />
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
  const populationBuildingOrder: PopulationBuildingId[] = [
    "quartiers_residentiels",
    "cantine_hydroponique",
    "centre_medical",
    "parc_orbital",
    "academie_technique",
    "universite_orbitale"
  ];

  const roomLevels = useMemo(() => buildRoomLevelMap(rooms), [rooms]);

  const nextPopulationUnlock = useMemo(() => {
    const rows = (Object.entries(POPULATION_BUILD_UNLOCK_MIN) as Array<[PopulationBuildingId, number]>)
      .filter(([, minPopulation]) => Number(minPopulation) > snapshot.totalPopulation)
      .sort((a, b) => a[1] - b[1]);
    if (rows.length <= 0) return null;
    const [roomType, minPopulation] = rows[0];
    return {
      name: roomDisplayName(roomType, language),
      minPopulation
    };
  }, [language, snapshot.totalPopulation]);

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
        effectRows.push(
          language === "en"
            ? `+${Math.floor(effects.housingCapPerLevel).toLocaleString()} housing capacity / level`
            : `+${Math.floor(effects.housingCapPerLevel).toLocaleString()} capacite habitation / niveau`
        );
      }
      if (effects.foodPerHourPerLevel) {
        effectRows.push(
          language === "en"
            ? `+${Math.floor(effects.foodPerHourPerLevel).toLocaleString()}/h food / level`
            : `+${Math.floor(effects.foodPerHourPerLevel).toLocaleString()}/h nourriture / niveau`
        );
      }
      if (effects.growthBonusPerLevel) {
        effectRows.push(
          language === "en"
            ? `${formatPercent(effects.growthBonusPerLevel)} growth / level`
            : `${formatPercent(effects.growthBonusPerLevel)} croissance / niveau`
        );
      }
      if (effects.stabilityPerLevel) {
        effectRows.push(
          language === "en"
            ? `+${effects.stabilityPerLevel.toFixed(2)} structural stability / level`
            : `+${effects.stabilityPerLevel.toFixed(2)} stabilite structurelle / niveau`
        );
      }
      if (effects.leisurePerLevel) {
        effectRows.push(
          language === "en"
            ? `+${effects.leisurePerLevel.toFixed(2)} leisure score / level`
            : `+${effects.leisurePerLevel.toFixed(2)} score loisirs / niveau`
        );
      }
      if (effects.healthPerLevel) {
        effectRows.push(
          language === "en"
            ? `+${effects.healthPerLevel.toFixed(2)} health score / level`
            : `+${effects.healthPerLevel.toFixed(2)} score sante / niveau`
        );
      }
      if (effects.engineerSharePerLevel) {
        effectRows.push(
          language === "en"
            ? `${formatPercent(effects.engineerSharePerLevel)} engineers share / level`
            : `${formatPercent(effects.engineerSharePerLevel)} part ingenieurs / niveau`
        );
      }
      if (effects.scientistSharePerLevel) {
        effectRows.push(
          language === "en"
            ? `${formatPercent(effects.scientistSharePerLevel)} scientists share / level`
            : `${formatPercent(effects.scientistSharePerLevel)} part scientifiques / niveau`
        );
      }
      const nextCostEntries = (Object.entries(nextCost) as Array<[ResourceId, number]>)
        .filter(([, amount]) => Number(amount) > 0)
        .map(([resourceId, amount]) => ({
          resourceId,
          amount,
          affordable: Math.floor(Number(resourceAmounts[resourceId] ?? 0)) >= Math.floor(Number(amount ?? 0))
        }));
      return {
        roomType,
        name: roomDisplayName(roomType, language),
        image: ROOM_CONFIG[roomType].image,
        level,
        unlocked,
        unlockPopulation,
        nextCostEntries,
        nextTimeSec,
        effectRows
      };
    });
  }, [buildingCostReductionFactor, buildingTimeReductionFactor, language, resourceAmounts, roomLevels, snapshot.totalPopulation]);

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
        title: language === "en" ? "Overcapacity active" : "Surpopulation active",
        text:
          language === "en"
            ? "Your production already suffers -25%. Top priority: upgrade Residential Quarters to increase capacity."
            : "Votre production subit deja -25%. Priorite absolue: monter Quartiers residentiels pour augmenter la capacite.",
        actionLabel: language === "en" ? "Open Game" : "Ouvrir Jeu",
        actionScreen: "game"
      });
    }

    if (snapshot.foodShortage || snapshot.foodBalancePerHour < 0) {
      rows.push({
        id: "food_shortage",
        tone: "danger",
        title: language === "en" ? "Critical food" : "Nourriture critique",
        text:
          language === "en"
            ? "Growth is halted and stability drops. Upgrade Hydroponic Canteen and secure base resources."
            : "La croissance s'arrete et la stabilite chute. Montez Cantine hydroponique et securisez les ressources de base.",
        actionLabel: language === "en" ? "Open Resources" : "Voir Ressources",
        actionScreen: "resources"
      });
    }

    if (snapshot.stability < 70) {
      rows.push({
        id: "stability_low",
        tone: "warn",
        title: language === "en" ? "Fragile stability" : "Stabilite fragile",
        text:
          language === "en"
            ? "Below 70%, penalties apply. Orbital Park and Medical Center are your best levers."
            : "Sous 70%, des malus apparaissent. Parc orbital et Centre medical sont les leviers les plus efficaces.",
        actionLabel: language === "en" ? "Go to Game" : "Aller a Jeu",
        actionScreen: "game"
      });
    }

    if (snapshot.requiredWorkers > snapshot.workers) {
      rows.push({
        id: "workers_short",
        tone: "warn",
        title: language === "en" ? "Insufficient workforce" : "Main-d'oeuvre insuffisante",
        text:
          language === "en"
            ? "Your extraction lines are under-powered. Increase total population and avoid overexpanding production lines."
            : "Vos exploitations tournent en sous-regime. Augmentez la population totale et evitez de surmultiplier les lignes de production.",
        actionLabel: language === "en" ? "Population plan" : "Plan population",
        actionScreen: "population"
      });
    }

    if (snapshot.growthPerHour <= 0) {
      rows.push({
        id: "growth_zero",
        tone: "warn",
        title: language === "en" ? "Zero growth" : "Croissance nulle",
        text:
          language === "en"
            ? "Without growth, long-term progression stalls. Check capacity, food, and stability."
            : "Sans croissance, vous bloquez votre progression long terme. Verifiez capacite, nourriture et stabilite.",
        actionLabel: language === "en" ? "Review stats" : "Voir stats",
        actionScreen: "population"
      });
    }

    if (!snapshot.isOverCapacity && !snapshot.foodShortage && snapshot.stability >= 85) {
      rows.push({
        id: "good_state",
        tone: "good",
        title: language === "en" ? "Healthy state" : "Etat sain",
        text:
          language === "en"
            ? "Your colony is stable. You can push advanced buildings (Academy, University) to speed up construction and research."
            : "Votre colonie est stable. Vous pouvez pousser les batiments avances (Academie, Universite) pour accelerer construction et recherche.",
        actionLabel: language === "en" ? "Open Technology" : "Ouvrir Technologie",
        actionScreen: "technology"
      });
    }

    if (rows.length < 3) {
      rows.push({
        id: "default_balance",
        tone: "good",
        title: language === "en" ? "Recommended routine" : "Routine recommandee",
        text:
          language === "en"
            ? "Monitor 3 indicators: housing capacity, food balance, and stability. Adjust before launching heavy upgrades."
            : "Gardez un oeil sur 3 indicateurs: capacite habitation, balance nourriture, stabilite. Ajustez avant de lancer des upgrades lourds.",
        actionLabel: language === "en" ? "Back to Game" : "Retour Jeu",
        actionScreen: "game"
      });
    }

    return rows.slice(0, 5);
  }, [language, snapshot]);

  return (
    <PopulationCommandScreen
      language={language}
      snapshot={snapshot}
      adviceRows={adviceRows}
      buildingRows={buildingRows}
      nextPopulationUnlock={nextPopulationUnlock}
      stabilityBandLabel={populationStabilityBandLabel(snapshot.stabilityBand, language)}
      activeEventLabel={snapshot.activeEvent ? populationEventLabel(snapshot.activeEvent.type, language) : null}
      activeCrisisLabel={snapshot.activeCrisis ? populationCrisisLabel(snapshot.activeCrisis.type, language) : null}
      onNavigate={onNavigate as (screen: "game" | "resources" | "technology" | "hangar" | "population") => void}
    />
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
  lastSavedAt,
  onNavigate
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
  onNavigate: (screen: UIScreen) => void;
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
  const constructionPerSecond = sectioned.construction.reduce((sum, row) => sum + (unlockedIds.includes(row.id) ? rates[row.id] : 0), 0);
  const researchPerSecond = sectioned.research.reduce((sum, row) => sum + (unlockedIds.includes(row.id) ? rates[row.id] : 0), 0);

  const impactRows = useMemo(() => {
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
    pushRow("total", populationSnapshot.productionBonusPct, "Impact total sur la production", "Total production impact");
    return rows;
  }, [language, populationSnapshot]);

  const buildResourceRows = (defs: ResourceDef[]) =>
    defs.map((res) => ({
      id: res.id as ResourceId,
      name: resourceDisplayName(res.id as ResourceId, language),
      machine: resourceMachineDisplay(res.id as ResourceId, language),
      section: res.section,
      rarity: res.rarity,
      unlocked: unlockedIds.includes(res.id),
      amount: Math.floor(amounts[res.id] ?? 0),
      rate: rates[res.id] ?? 0,
      techBonuses: getUnlockedResourceTechBonuses(res.id as ResourceId, technologyLevels, language)
    }));

  return (
    <ResourceCommandScreen
      language={language}
      loading={loading}
      error={error}
      offlineSeconds={offlineSeconds}
      lastSavedAt={lastSavedAt}
      totalPerSecond={totalPerSecond}
      constructionPerSecond={constructionPerSecond}
      researchPerSecond={researchPerSecond}
      unlockedCount={unlockedIds.length}
      totalCount={RESOURCE_DEFS.length}
      impactRows={impactRows}
      constructionRows={buildResourceRows(sectioned.construction)}
      researchRows={buildResourceRows(sectioned.research)}
      onNavigate={onNavigate as (screen: "game" | "resources" | "technology" | "population") => void}
    />
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

  const inboxDisplayTitle = (message: InboxMessage) => {
    const meta = message.meta && typeof message.meta === "object" ? message.meta : null;
    const localized = language === "en" ? String(meta?.titleEn || "").trim() : String(meta?.titleFr || "").trim();
    return localized || message.title;
  };

  const inboxDisplayBody = (message: InboxMessage) => {
    const meta = message.meta && typeof message.meta === "object" ? message.meta : null;
    const localized = language === "en" ? String(meta?.bodyEn || "").trim() : String(meta?.bodyFr || "").trim();
    return localized || message.body;
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

  const combatUnitDefs = useMemo(() => new Map(HANGAR_UNIT_DEFS.map((def) => [def.id, def])), []);

  const resolveCombatUnitImage = (unitId: string) =>
    HANGAR_SHIP_IMAGE_MAP[unitId] ?? HANGAR_DEFENSE_IMAGE_MAP[unitId] ?? "/room-images/item-acceleration.png";

  const normalizeCombatFleetRows = (rowsRaw: unknown) => {
    const rows = Array.isArray(rowsRaw) ? rowsRaw : [];
    return rows
      .map((row) => {
        const source = row && typeof row === "object" ? (row as Record<string, any>) : {};
        const unitId = String(source.unitId || "").trim();
        const quantity = Math.max(0, Math.floor(Number(source.quantity || 0)));
        const def = combatUnitDefs.get(unitId);
        const fallbackName = def?.name || unitId || l("Unite inconnue", "Unknown unit");
        return {
          unitId,
          quantity,
          category: def?.category || String(source.category || "ship"),
          force: Math.max(0, Number(source.force ?? def?.force ?? 0)),
          endurance: Math.max(0, Number(source.endurance ?? def?.endurance ?? 0)),
          speed: Math.max(0, Number(source.speed ?? def?.speed ?? 0)),
          name: hangarUnitDisplayName(unitId, fallbackName, language),
          image: resolveCombatUnitImage(unitId)
        };
      })
      .filter((row) => row.unitId && row.quantity > 0)
      .sort((a, b) => b.quantity - a.quantity);
  };

  const normalizeCombatLossRows = (lossesRaw: unknown) => {
    const source = lossesRaw && typeof lossesRaw === "object" ? (lossesRaw as Record<string, unknown>) : {};
    return Object.entries(source)
      .map(([unitId, quantityRaw]) => {
        const quantity = Math.max(0, Math.floor(Number(quantityRaw || 0)));
        const def = combatUnitDefs.get(unitId);
        const fallbackName = def?.name || unitId || l("Unite inconnue", "Unknown unit");
        return {
          unitId,
          quantity,
          category: def?.category || "ship",
          name: hangarUnitDisplayName(unitId, fallbackName, language),
          image: resolveCombatUnitImage(unitId)
        };
      })
      .filter((row) => row.quantity > 0)
      .sort((a, b) => b.quantity - a.quantity);
  };

  const normalizeCombatResources = (resourceRaw: unknown) =>
    RESOURCE_DEFS.map((def) => {
      const amount = Math.max(0, Math.floor(Number((resourceRaw as Record<string, unknown> | null | undefined)?.[def.id] || 0)));
      return amount > 0
        ? {
            resourceId: def.id,
            amount,
            name: resourceDisplayName(def.id, language)
          }
        : null;
    }).filter(Boolean) as Array<{ resourceId: ResourceId; amount: number; name: string }>;

  const summarizeCombatFleet = (rows: Array<{ quantity: number; force?: number; endurance?: number }>) => {
    let units = 0;
    let force = 0;
    let endurance = 0;
    for (const row of rows) {
      const quantity = Math.max(0, Math.floor(Number(row.quantity || 0)));
      units += quantity;
      force += Math.max(0, Number(row.force || 0)) * quantity;
      endurance += Math.max(0, Number(row.endurance || 0)) * quantity;
    }
    return { units, force, endurance };
  };

  const normalizeCombatSummary = (summaryRaw: unknown, fallbackRows: Array<{ quantity: number; force?: number; endurance?: number }>) => {
    const fallback = summarizeCombatFleet(fallbackRows);
    const source = summaryRaw && typeof summaryRaw === "object" ? (summaryRaw as Record<string, any>) : {};
    return {
      units: Math.max(0, Math.floor(Number(source.units ?? source.totalUnits ?? fallback.units))),
      force: Math.max(0, Math.floor(Number(source.force ?? source.totalForce ?? fallback.force))),
      endurance: Math.max(0, Math.floor(Number(source.endurance ?? source.totalEndurance ?? fallback.endurance)))
    };
  };

  const selectedCombatReport = useMemo(() => {
    if (!selectedMessage?.combatReport || typeof selectedMessage.combatReport !== "object") return null;
    const report = selectedMessage.combatReport as Record<string, any>;
    const attacker = report.attacker && typeof report.attacker === "object" ? report.attacker : {};
    const defender = report.defender && typeof report.defender === "object" ? report.defender : {};
    const perspective =
      String(attacker.userId || "") === currentUserId
        ? "attacker"
        : String(defender.userId || "") === currentUserId
          ? "defender"
          : "observer";
    const result = String(report.result || "unknown").trim().toLowerCase();
    const resultLabel =
      result === "attacker"
        ? perspective === "attacker"
          ? l("Victoire offensive", "Offensive victory")
          : perspective === "defender"
            ? l("Defaite defensive", "Defensive defeat")
            : l("Victoire attaquant", "Attacker victory")
        : result === "defender"
          ? perspective === "defender"
            ? l("Defense reussie", "Defense held")
            : perspective === "attacker"
              ? l("Offensive repoussee", "Attack repelled")
              : l("Victoire defenseur", "Defender victory")
          : result === "mutual"
            ? l("Destruction mutuelle", "Mutual destruction")
            : l("Issue inconnue", "Unknown outcome");
    const resultTone = result === "attacker" ? "attacker" : result === "defender" ? "defender" : result === "mutual" ? "mutual" : "neutral";
    const location = report.location && typeof report.location === "object" ? report.location : {};
    const attackerFleet = normalizeCombatFleetRows(attacker.fleet);
    const defenderFleet = normalizeCombatFleetRows(defender.fleet);
    const attackerSurvivors = normalizeCombatFleetRows(report.attackerSurvivors);
    const defenderSurvivors = normalizeCombatFleetRows(report.defenderSurvivors);
    const attackerRetreated = result === "defender" && attackerSurvivors.length > 0;
    const defenderRouted = result === "attacker" && defenderSurvivors.length > 0;
    const rounds = Array.isArray(report.rounds)
      ? report.rounds
          .map((round) => {
            const source = round && typeof round === "object" ? (round as Record<string, any>) : {};
            const attackerLosses = normalizeCombatLossRows(source.attackerLosses);
            const defenderLosses = normalizeCombatLossRows(source.defenderLosses);
            return {
              round: Math.max(0, Math.floor(Number(source.round || 0))),
              attackerLosses,
              defenderLosses
            };
          })
          .filter((round) => round.round > 0 && (round.attackerLosses.length > 0 || round.defenderLosses.length > 0))
      : [];
    return {
      battleType: String(report.battleType || "generic"),
      fieldId: String(report.fieldId || ""),
      locationLabel: String(location.label || "").trim(),
      battleAt: Math.max(0, Math.floor(Number(report.battleAt || 0))),
      perspective,
      result,
      resultLabel,
      resultTone,
      attacker: {
        userId: String(attacker.userId || ""),
        username: String(attacker.username || attacker.userId || l("Attaquant", "Attacker")),
        fleet: attackerFleet,
        survivors: attackerSurvivors,
        survivorLabel: attackerRetreated ? l("Survivants en repli", "Retreating survivors") : l("Survivants", "Survivors"),
        losses: normalizeCombatLossRows(report.losses?.attacker),
        summary: normalizeCombatSummary(report.attackerSummary, attackerSurvivors)
      },
      defender: {
        userId: String(defender.userId || ""),
        username: String(defender.username || defender.userId || l("Defenseur", "Defender")),
        fleet: defenderFleet,
        survivors: defenderSurvivors,
        survivorLabel: defenderRouted ? l("Survivants en fuite", "Routed survivors") : l("Survivants", "Survivors"),
        losses: normalizeCombatLossRows(report.losses?.defender),
        summary: normalizeCombatSummary(report.defenderSummary, defenderSurvivors)
      },
      loot: normalizeCombatResources(report.loot),
      protectedCargo: normalizeCombatResources(report.protectedCargo),
      rounds
    };
  }, [selectedMessage, currentUserId, language]);

  const renderCombatFleetRows = (
    rows: Array<{ unitId: string; quantity: number; name: string; image: string }>,
    emptyLabel: string,
    tone: "attacker" | "defender" | "neutral"
  ) => (
    <div className={`combat-fleet-list tone-${tone}`}>
      {rows.length <= 0 ? (
        <p className="combat-empty">{emptyLabel}</p>
      ) : (
        rows.map((row) => (
          <article key={`${tone}_${row.unitId}_${row.quantity}_${row.name}`} className="combat-fleet-row">
            <img
              src={row.image}
              alt={row.name}
              className="combat-fleet-row-image"
              loading="lazy"
              onError={(event) => {
                const img = event.currentTarget as HTMLImageElement;
                if (!img.src.endsWith("/room-images/item-acceleration.png")) {
                  img.src = "/room-images/item-acceleration.png";
                }
              }}
            />
            <span className="combat-fleet-row-name">{row.name}</span>
            <strong className="combat-fleet-row-qty">x{row.quantity.toLocaleString()}</strong>
          </article>
        ))
      )}
    </div>
  );

  const renderCombatResourceRows = (
    rows: Array<{ resourceId: ResourceId; amount: number; name: string }>,
    emptyLabel: string,
    tone: "loot" | "protected"
  ) => (
    <div className={`combat-resource-list tone-${tone}`}>
      {rows.length <= 0 ? (
        <p className="combat-empty">{emptyLabel}</p>
      ) : (
        rows.map((row) => (
          <article key={`${tone}_${row.resourceId}_${row.amount}`} className="combat-resource-row">
            <span className="top-resource-icon combat-resource-icon" style={getResourceMenuSpriteStyle(row.resourceId)} />
            <span className="combat-resource-name">{row.name}</span>
            <strong className="combat-resource-qty">+{row.amount.toLocaleString()}</strong>
          </article>
        ))
      )}
    </div>
  );

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
                      <strong>{inboxDisplayTitle(msg)}</strong>
                      {!msg.read ? <span className="inbox-dot" /> : null}
                    </div>
                    <span className="inbox-item-meta">
                      {msg.type} - {new Date(msg.createdAt * 1000).toLocaleString()}
                    </span>
                    <p>{inboxDisplayBody(msg).slice(0, 120)}{inboxDisplayBody(msg).length > 120 ? "..." : ""}</p>
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
              <h3>{inboxDisplayTitle(selectedMessage)}</h3>
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
            <p className="inbox-body">{inboxDisplayBody(selectedMessage)}</p>

            {selectedCombatReport ? (
              <section className="inbox-combat-report">
                <header className="combat-report-head">
                  <div className="combat-report-head-main">
                    <span className={`combat-result-chip tone-${selectedCombatReport.resultTone}`}>{selectedCombatReport.resultLabel}</span>
                    <strong>{selectedCombatReport.locationLabel || l("Zone de combat non identifiee", "Unidentified combat zone")}</strong>
                  </div>
                  <div className="combat-report-head-meta">
                    <span>{l("Impact", "Impact")}: {selectedCombatReport.battleAt ? new Date(selectedCombatReport.battleAt * 1000).toLocaleString() : "-"}</span>
                    {selectedCombatReport.rounds.length > 0 ? (
                      <span>{l("Rounds", "Rounds")}: {selectedCombatReport.rounds.length.toLocaleString()}</span>
                    ) : null}
                  </div>
                </header>

                <div className="combat-side-grid">
                  <article className="combat-side-card attacker">
                    <header className="combat-side-head">
                      <div>
                        <small>{l("Attaquant", "Attacker")}</small>
                        <strong>{selectedCombatReport.attacker.username}</strong>
                      </div>
                      <span className="combat-side-chip">{selectedCombatReport.attacker.summary.units.toLocaleString()} {l("unites", "units")}</span>
                    </header>
                    <div className="combat-side-stats">
                      <span>{l("Force", "Force")}: {Math.floor(Number(selectedCombatReport.attacker.summary.force || 0)).toLocaleString()}</span>
                      <span>{l("Endurance", "Endurance")}: {Math.floor(Number(selectedCombatReport.attacker.summary.endurance || 0)).toLocaleString()}</span>
                    </div>
                    <div className="combat-block">
                      <h4>{l("Composition engagee", "Committed fleet")}</h4>
                      {renderCombatFleetRows(selectedCombatReport.attacker.fleet, l("Aucune unite detaillee.", "No units listed."), "attacker")}
                    </div>
                    <div className="combat-block">
                      <h4>{selectedCombatReport.attacker.survivorLabel}</h4>
                      {renderCombatFleetRows(selectedCombatReport.attacker.survivors, l("Aucun survivant.", "No survivors."), "neutral")}
                    </div>
                    <div className="combat-block">
                      <h4>{l("Pertes subies", "Losses taken")}</h4>
                      {renderCombatFleetRows(selectedCombatReport.attacker.losses, l("Aucune perte.", "No losses."), "attacker")}
                    </div>
                  </article>

                  <article className="combat-side-card defender">
                    <header className="combat-side-head">
                      <div>
                        <small>{l("Defenseur", "Defender")}</small>
                        <strong>{selectedCombatReport.defender.username}</strong>
                      </div>
                      <span className="combat-side-chip">{selectedCombatReport.defender.summary.units.toLocaleString()} {l("unites", "units")}</span>
                    </header>
                    <div className="combat-side-stats">
                      <span>{l("Force", "Force")}: {Math.floor(Number(selectedCombatReport.defender.summary.force || 0)).toLocaleString()}</span>
                      <span>{l("Endurance", "Endurance")}: {Math.floor(Number(selectedCombatReport.defender.summary.endurance || 0)).toLocaleString()}</span>
                    </div>
                    <div className="combat-block">
                      <h4>{l("Composition engagee", "Committed fleet")}</h4>
                      {renderCombatFleetRows(selectedCombatReport.defender.fleet, l("Aucune unite detaillee.", "No units listed."), "defender")}
                    </div>
                    <div className="combat-block">
                      <h4>{selectedCombatReport.defender.survivorLabel}</h4>
                      {renderCombatFleetRows(selectedCombatReport.defender.survivors, l("Aucun survivant.", "No survivors."), "neutral")}
                    </div>
                    <div className="combat-block">
                      <h4>{l("Pertes subies", "Losses taken")}</h4>
                      {renderCombatFleetRows(selectedCombatReport.defender.losses, l("Aucune perte.", "No losses."), "defender")}
                    </div>
                  </article>
                </div>

                <div className="combat-outcome-grid">
                  <article className="combat-outcome-card tone-loot">
                    <header>
                      <strong>{l("Butin capture", "Loot captured")}</strong>
                      <span>{selectedCombatReport.loot.length > 0 ? l("Credite immediatement", "Granted immediately") : l("Aucun", "None")}</span>
                    </header>
                    {renderCombatResourceRows(selectedCombatReport.loot, l("Aucun butin sur ce combat.", "No loot from this combat."), "loot")}
                  </article>
                  <article className="combat-outcome-card tone-protected">
                    <header>
                      <strong>{l("Cargo protege", "Protected cargo")}</strong>
                      <span>{selectedCombatReport.protectedCargo.length > 0 ? l("Sauve au moment de l'impact", "Saved at impact") : l("Aucun", "None")}</span>
                    </header>
                    {renderCombatResourceRows(selectedCombatReport.protectedCargo, l("Aucun cargo sauve sur cette issue.", "No cargo protected in this outcome."), "protected")}
                  </article>
                </div>

                {selectedCombatReport.rounds.length > 0 ? (
                  <details className="inbox-spoiler combat-rounds-spoiler">
                    <summary>{l("Chronologie des rounds", "Round timeline")}</summary>
                    <div className="combat-rounds-list">
                      {selectedCombatReport.rounds.map((round) => (
                        <article key={`round_${round.round}`} className="combat-round-card">
                          <header>
                            <strong>{l("Round", "Round")} {round.round.toLocaleString()}</strong>
                          </header>
                          <div className="combat-round-grid">
                            <div>
                              <small>{l("Pertes attaquant", "Attacker losses")}</small>
                              {renderCombatFleetRows(round.attackerLosses, l("Aucune perte.", "No losses."), "attacker")}
                            </div>
                            <div>
                              <small>{l("Pertes defenseur", "Defender losses")}</small>
                              {renderCombatFleetRows(round.defenderLosses, l("Aucune perte.", "No losses."), "defender")}
                            </div>
                          </div>
                        </article>
                      ))}
                    </div>
                  </details>
                ) : null}
              </section>
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

function LoginIntroCinematic({
  language,
  playerName,
  onComplete
}: {
  language: UILanguage;
  playerName: string;
  onComplete: () => void;
}) {
  const [sceneIndex, setSceneIndex] = useState(0);
  const [displayedText, setDisplayedText] = useState("");
  const [typing, setTyping] = useState(true);
  const typingTimerRef = useRef<number | null>(null);
  const autoAdvanceTimerRef = useRef<number | null>(null);
  const typingRef = useRef(true);
  const textRef = useRef("");
  const sceneIndexRef = useRef(0);
  const autoAdvanceMsRef = useRef<number | undefined>(undefined);
  const playerLabel = playerName.trim().length > 0 ? playerName.trim() : language === "en" ? "Commander" : "Commandant";
  const scene = LOGIN_INTRO_SCENES[sceneIndex] ?? LOGIN_INTRO_SCENES[0];
  const fullText = (language === "en" ? scene.textEn : scene.textFr).replace(/\{player\}/g, playerLabel);
  const isTitle = scene.speaker === "title";
  const isSystem = scene.speaker === "system";
  const progressPct = ((sceneIndex + 1) / LOGIN_INTRO_SCENES.length) * 100;

  const clearIntroTimers = useCallback(() => {
    if (typingTimerRef.current !== null) {
      window.clearTimeout(typingTimerRef.current);
      typingTimerRef.current = null;
    }
    if (autoAdvanceTimerRef.current !== null) {
      window.clearTimeout(autoAdvanceTimerRef.current);
      autoAdvanceTimerRef.current = null;
    }
  }, []);

  const advanceScene = useCallback(() => {
    clearIntroTimers();
    const currentIndex = sceneIndexRef.current;
    if (typingRef.current) {
      setDisplayedText(textRef.current);
      setTyping(false);
      typingRef.current = false;
      const autoAdvanceMs = autoAdvanceMsRef.current;
      if (typeof autoAdvanceMs === "number" && autoAdvanceMs > 0) {
        autoAdvanceTimerRef.current = window.setTimeout(() => {
          if (currentIndex >= LOGIN_INTRO_SCENES.length - 1) onComplete();
          else setSceneIndex(currentIndex + 1);
        }, autoAdvanceMs);
      }
      return;
    }
    if (currentIndex >= LOGIN_INTRO_SCENES.length - 1) {
      onComplete();
      return;
    }
    setSceneIndex(currentIndex + 1);
  }, [clearIntroTimers, onComplete]);

  useEffect(() => {
    textRef.current = fullText;
    sceneIndexRef.current = sceneIndex;
    autoAdvanceMsRef.current = scene.autoAdvanceMs;
  }, [fullText, scene.autoAdvanceMs, sceneIndex]);

  useEffect(() => {
    clearIntroTimers();
    setDisplayedText("");
    setTyping(true);
    typingRef.current = true;
    let cursor = 0;
    const stepDelay = isTitle ? 34 : isSystem ? 18 : 24;

    const tick = () => {
      cursor += 1;
      if (cursor >= fullText.length) {
        setDisplayedText(fullText);
        setTyping(false);
        typingRef.current = false;
        if (typeof scene.autoAdvanceMs === "number" && scene.autoAdvanceMs > 0) {
          autoAdvanceTimerRef.current = window.setTimeout(() => {
            if (sceneIndex >= LOGIN_INTRO_SCENES.length - 1) onComplete();
            else setSceneIndex(sceneIndex + 1);
          }, scene.autoAdvanceMs);
        }
        return;
      }
      setDisplayedText(fullText.slice(0, cursor));
      typingTimerRef.current = window.setTimeout(tick, stepDelay);
    };

    typingTimerRef.current = window.setTimeout(tick, 180);

    return clearIntroTimers;
  }, [clearIntroTimers, fullText, isSystem, isTitle, onComplete, scene.autoAdvanceMs, sceneIndex]);

  useEffect(() => {
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = previousOverflow;
    };
  }, []);

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.code === "Space" || event.code === "Enter" || event.code === "ArrowRight") {
        event.preventDefault();
        advanceScene();
      } else if (event.code === "Escape") {
        event.preventDefault();
        onComplete();
      }
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [advanceScene, onComplete]);

  useEffect(() => () => clearIntroTimers(), [clearIntroTimers]);

  const speakerLabel =
    scene.speaker === "kael"
      ? language === "en"
        ? "Dr Kael Ardent"
        : "Dr Kael Ardent"
      : scene.speaker === "lyra"
        ? language === "en"
          ? "Dr Lyra Nova"
          : "Dr Lyra Nova"
        : "";

  return (
    <div className="login-intro-overlay" onClick={advanceScene}>
      <div className="login-intro-backdrop" style={LOGIN_INTRO_BACKDROP_STYLES[scene.backdrop]} />
      <div className="login-intro-stars login-intro-stars-a" />
      <div className="login-intro-stars login-intro-stars-b" />
      <div className={`login-intro-atmo login-intro-atmo-${scene.backdrop}`} />
      <div className="login-intro-vignette" />
      <div className="login-intro-letterbox login-intro-letterbox-top" />
      <div className="login-intro-letterbox login-intro-letterbox-bottom" />
      <div className="login-intro-scanline" />

      <button
        type="button"
        className="login-intro-skip"
        onClick={(event) => {
          event.stopPropagation();
          onComplete();
        }}
      >
        <X size={14} />
        <span>{language === "en" ? "Skip intro" : "Passer l'intro"}</span>
      </button>

      {!isTitle ? (
        <>
          <div className="login-intro-hud">
            <span>{language === "en" ? "Authentication complete" : "Connexion authentifiee"}</span>
            <strong>{language === "en" ? "Command uplink" : "Liaison de commandement"}</strong>
          </div>
          <div className="login-intro-progress">
            <div className="login-intro-progress-bar" style={{ width: `${progressPct}%` }} />
          </div>
        </>
      ) : null}

      {!isTitle ? (
        <div className="login-intro-portraits">
          <div className={`login-intro-portrait login-intro-portrait-left ${scene.speaker === "kael" ? "active" : ""}`}>
            <div className="login-intro-portrait-frame">
              <img src={COMMANDER_DEFS.kael_ardent.image} alt="Dr Kael Ardent" />
            </div>
            <span>KAEL ARDENT</span>
          </div>
          <div className={`login-intro-portrait login-intro-portrait-right ${scene.speaker === "lyra" ? "active" : ""}`}>
            <div className="login-intro-portrait-frame">
              <img src={COMMANDER_DEFS.lyra_nova.image} alt="Dr Lyra Nova" />
            </div>
            <span>LYRA NOVA</span>
          </div>
        </div>
      ) : null}

      <div className={`login-intro-stage ${isTitle ? "title" : isSystem ? "system" : "dialogue"}`}>
        {isTitle ? (
          <div className="login-intro-title-card">
            <div className="login-intro-title-kicker">
              {language === "en" ? "Heimy Game presents" : "Heimy Game presente"}
            </div>
            <div className="login-intro-title-main">
              {displayedText.split("\n").map((line, index) => (
                <span key={`${line}_${index}`}>{line}</span>
              ))}
            </div>
            <div className="login-intro-title-sub">
              {typing ? (language === "en" ? "Decrypting..." : "Decryptage...") : language === "en" ? "Launching command deck" : "Ouverture du pont de commandement"}
            </div>
          </div>
        ) : isSystem ? (
          <div className="login-intro-system-card">
            <div className="login-intro-system-tag">{language === "en" ? "System relay" : "Relais systeme"}</div>
            <p>{displayedText}</p>
          </div>
        ) : (
          <div className={`login-intro-dialog-card ${scene.accent === "amber" ? "amber" : "cyan"}`}>
            <div className="login-intro-dialog-header">
              <span>{speakerLabel}</span>
              <small>{scene.accent === "amber" ? (language === "en" ? "Operations" : "Operations") : language === "en" ? "Research" : "Recherche"}</small>
            </div>
            <p>{displayedText}</p>
            {!typing ? (
              <div className="login-intro-continue">
                <ChevronRight size={14} />
                <span>{language === "en" ? "Continue" : "Continuer"}</span>
              </div>
            ) : null}
          </div>
        )}
      </div>

      <div className="login-intro-footer">
        <div className="login-intro-seq">
          {language === "en" ? "Sequence" : "Sequence"} {String(sceneIndex + 1).padStart(2, "0")} / {String(LOGIN_INTRO_SCENES.length).padStart(2, "0")}
        </div>
        <div className="login-intro-hint">
          <Play size={12} />
          <span>{language === "en" ? "Click, Enter or Space" : "Clique, Entree ou Espace"}</span>
        </div>
      </div>
    </div>
  );
}

function ProfileScreen({
  language,
  title,
  subtitle,
  profileUsername,
  profileEmail,
  profileLanguage,
  profileAvatar,
  profileCommanderId,
  commanderOptions,
  profileError,
  profileSaved,
  profileLoading,
  onUsernameChange,
  onEmailChange,
  onLanguageChange,
  onCommanderChange,
  onSubmit
}: {
  language: UILanguage;
  title: string;
  subtitle: string;
  profileUsername: string;
  profileEmail: string;
  profileLanguage: "fr" | "en";
  profileAvatar: string;
  profileCommanderId: CommanderId;
  commanderOptions: CommanderDef[];
  profileError: string;
  profileSaved: string;
  profileLoading: boolean;
  onUsernameChange: (v: string) => void;
  onEmailChange: (v: string) => void;
  onLanguageChange: (v: "fr" | "en") => void;
  onCommanderChange: (v: CommanderId) => void;
  onSubmit: (e: FormEvent) => void;
}) {
  const l = (fr: string, en: string) => (language === "en" ? en : fr);
  const activeCommander = COMMANDER_DEFS[profileCommanderId] ?? COMMANDER_DEFS[DEFAULT_COMMANDER_ID];
  return (
    <main className="profile-layout">
      <form className="profile-card" onSubmit={onSubmit}>
        <h2>{title}</h2>
        <p>{subtitle}</p>

        <div className="profile-grid">
          <label>
            <span className="profile-field-label"><UserRound size={14} /> {l("Pseudo", "Username")}</span>
            <input value={profileUsername} onChange={(e) => onUsernameChange(e.target.value)} minLength={3} required />
          </label>

          <label>
            <span className="profile-field-label"><Mail size={14} /> Email</span>
            <input value={profileEmail} onChange={(e) => onEmailChange(e.target.value)} type="email" required />
          </label>

          <label>
            <span className="profile-field-label"><Globe size={14} /> {l("Langue", "Language")}</span>
            <select value={profileLanguage} onChange={(e) => onLanguageChange(e.target.value === "en" ? "en" : "fr")}>
              <option value="fr">{l("Francais", "French")}</option>
              <option value="en">English</option>
            </select>
          </label>
        </div>

        <div className="avatar-block">
          <p>{l("Choisir un commandant", "Choose a commander")}</p>
          <CommanderSelect
            language={language}
            commanderId={profileCommanderId}
            commanderOptions={commanderOptions}
            onChange={onCommanderChange}
          />
          <div className="profile-commander-summary" style={{ ["--commander-accent" as string]: activeCommander.accent }}>
            <CommanderPortrait commanderId={activeCommander.id} className="profile-commander-portrait" />
            <div>
              <strong>{commanderLabel(activeCommander.id, language)}</strong>
              <small>{commanderTitle(activeCommander.id, language)}</small>
              <p>{commanderDescription(activeCommander.id, language)}</p>
              <em>{commanderBonusLabel(activeCommander.id, language)}</em>
            </div>
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

function CommanderSelect({
  language,
  commanderId,
  commanderOptions,
  onChange
}: {
  language: UILanguage;
  commanderId: CommanderId;
  commanderOptions: CommanderDef[];
  onChange: (id: CommanderId) => void;
}) {
  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement | null>(null);
  const l = (fr: string, en: string) => (language === "en" ? en : fr);
  const selected = COMMANDER_DEFS[commanderId] ?? COMMANDER_DEFS[DEFAULT_COMMANDER_ID];

  useEffect(() => {
    if (!open) return;
    const onPointerDown = (event: MouseEvent) => {
      if (!rootRef.current?.contains(event.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", onPointerDown);
    return () => document.removeEventListener("mousedown", onPointerDown);
  }, [open]);

  return (
    <div className={`commander-select ${open ? "open" : ""}`} ref={rootRef}>
      <button
        type="button"
        className="commander-select-trigger"
        style={{ ["--commander-accent" as string]: selected.accent }}
        onClick={() => setOpen((prev) => !prev)}
      >
        <CommanderPortrait commanderId={selected.id} className="commander-select-avatar" />
        <div className="commander-select-copy">
          <span>{l("Commandant actif", "Active commander")}</span>
          <strong>{commanderLabel(selected.id, language)}</strong>
          <small>{commanderTitle(selected.id, language)}</small>
          <em>{commanderBonusLabel(selected.id, language)}</em>
        </div>
        <span className="commander-select-toggle">
          <ChevronRight size={18} className="commander-select-chevron" />
        </span>
      </button>

      {open ? (
        <div className="commander-picker-panel">
          {commanderOptions.map((commander) => (
            <button
              type="button"
              key={commander.id}
              className={`commander-option ${commanderId === commander.id ? "active" : ""}`}
              style={{ ["--commander-accent" as string]: commander.accent }}
              onClick={() => {
                onChange(commander.id);
                setOpen(false);
              }}
            >
              <CommanderPortrait commanderId={commander.id} className="commander-option-portrait" />
              <div className="commander-option-copy">
                <small>{commanderTitle(commander.id, language)}</small>
                <strong>{commanderLabel(commander.id, language)}</strong>
                <em>{commanderBonusLabel(commander.id, language)}</em>
              </div>
            </button>
          ))}
        </div>
      ) : null}
    </div>
  );
}

function CommanderPortrait({
  commanderId,
  className
}: {
  commanderId: CommanderId;
  className: string;
}) {
  const commander = COMMANDER_DEFS[commanderId] ?? COMMANDER_DEFS[DEFAULT_COMMANDER_ID];
  return (
    <img
      className={className}
      src={commander.image}
      alt={commander.nameEn}
      loading="lazy"
      decoding="async"
    />
  );
}

function MissionWorldLayer({
  orbs,
  pan,
  zoom,
  viewportSize
}: {
  orbs: Array<SectorWorld | SectorResource>;
  pan: { x: number; y: number };
  zoom: number;
  viewportSize: { width: number; height: number };
}) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const latestStateRef = useRef({ orbs, pan, zoom, viewportSize });

  useEffect(() => {
    latestStateRef.current = { orbs, pan, zoom, viewportSize };
  }, [orbs, pan, viewportSize, zoom]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const renderer = new THREE.WebGLRenderer({
      canvas,
      alpha: true,
      antialias: true,
      powerPreference: "high-performance"
    });
    renderer.setClearColor(0x000000, 0);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 1.5));

    const scene = new THREE.Scene();
    const camera = new THREE.OrthographicCamera(-1, 1, 1, -1, 0.1, 1000);
    camera.position.z = 120;

    const coreGeo = new THREE.SphereGeometry(0.9, 56, 56);

    const plasmaGeo = new THREE.SphereGeometry(0.988, 74, 74);
    const particleCount = 140;
    const particlePositions = new Float32Array(particleCount * 3);
    const particleSizes = new Float32Array(particleCount);
    for (let i = 0; i < particleCount; i += 1) {
      const radius = 0.9 * Math.cbrt(Math.random());
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.acos(2 * Math.random() - 1);
      particlePositions[i * 3] = radius * Math.sin(phi) * Math.cos(theta);
      particlePositions[i * 3 + 1] = radius * Math.sin(phi) * Math.sin(theta);
      particlePositions[i * 3 + 2] = radius * Math.cos(phi);
      particleSizes[i] = Math.random();
    }

    const particleGeo = new THREE.BufferGeometry();
    particleGeo.setAttribute("position", new THREE.BufferAttribute(particlePositions, 3));
    particleGeo.setAttribute("aSize", new THREE.BufferAttribute(particleSizes, 1));

    const createParticleMaterial = (particleColor: number) =>
      new THREE.ShaderMaterial({
        uniforms: {
          uTime: { value: 0 },
          uColor: { value: new THREE.Color(particleColor) }
        },
        vertexShader: `
          uniform float uTime;
          attribute float aSize;
          varying float vAlpha;

          void main() {
            vec3 pos = position;
            pos.y += sin(uTime * 0.2 + pos.x) * 0.02;
            pos.x += cos(uTime * 0.15 + pos.z) * 0.02;
            vec4 mvPosition = modelViewMatrix * vec4(pos, 1.0);
            gl_Position = projectionMatrix * mvPosition;
            float baseSize = 7.0 * aSize + 3.0;
            gl_PointSize = baseSize;
            vAlpha = 0.76 + 0.24 * sin(uTime + aSize * 10.0);
          }
        `,
        fragmentShader: `
          uniform vec3 uColor;
          varying float vAlpha;

          void main() {
            vec2 uv = gl_PointCoord - vec2(0.5);
            float dist = length(uv);
            if (dist > 0.5) discard;
            float glow = 1.0 - (dist * 2.0);
            glow = pow(glow, 1.8);
            gl_FragColor = vec4(uColor, glow * vAlpha);
          }
        `,
        transparent: true,
        blending: THREE.AdditiveBlending,
        depthWrite: false
      });

    const createMaterialSet = (preset: (typeof MAP_ORB_PRESETS)[keyof typeof MAP_ORB_PRESETS]) => ({
      coreMat: new THREE.MeshBasicMaterial({
        color: new THREE.Color(preset.colorMid),
        transparent: true,
        opacity: 0.34
      }),
      plasmaMat: new THREE.ShaderMaterial({
        uniforms: {
          uTime: { value: 0 },
          uScale: { value: preset.scale },
          uBrightness: { value: preset.brightness },
          uThreshold: { value: preset.threshold },
          uColorDeep: { value: new THREE.Color(preset.colorDeep) },
          uColorMid: { value: new THREE.Color(preset.colorMid) },
          uColorBright: { value: new THREE.Color(preset.colorBright) }
        },
        vertexShader: MISSION_WORLD_PLASMA_VERTEX,
        fragmentShader: MISSION_WORLD_PLASMA_FRAGMENT,
        transparent: true,
        blending: THREE.AdditiveBlending,
        side: THREE.DoubleSide,
        depthWrite: false
      }),
      particleMat: createParticleMaterial(preset.particleColor)
    });

    const materialSets = {
      world: createMaterialSet(MAP_ORB_PRESETS.world),
      resource: createMaterialSet(MAP_ORB_PRESETS.resource)
    } as const;
    const worldGroups = new Map<
      string,
      {
        group: THREE.Group;
        plasma: THREE.Mesh;
        particles: THREE.Points;
        kind: "world" | "resource";
        spinX: number;
        spinY: number;
      }
    >();
    let lastWidth = 0;
    let lastHeight = 0;

    const ensureSize = (width: number, height: number) => {
      const safeWidth = Math.max(1, Math.floor(width));
      const safeHeight = Math.max(1, Math.floor(height));
      if (safeWidth === lastWidth && safeHeight === lastHeight) return;
      lastWidth = safeWidth;
      lastHeight = safeHeight;
      renderer.setSize(safeWidth, safeHeight, false);
      camera.left = -safeWidth / 2;
      camera.right = safeWidth / 2;
      camera.top = safeHeight / 2;
      camera.bottom = -safeHeight / 2;
      camera.updateProjectionMatrix();
    };

    const createWorldGroup = (worldId: string, kind: "world" | "resource") => {
      const group = new THREE.Group();
      const materials = materialSets[kind];
      const core = new THREE.Mesh(coreGeo, materials.coreMat);
      const plasma = new THREE.Mesh(plasmaGeo, materials.plasmaMat);
      const particles = new THREE.Points(particleGeo, materials.particleMat);
      core.frustumCulled = false;
      plasma.frustumCulled = false;
      particles.frustumCulled = false;
      group.add(core);
      group.add(plasma);
      group.add(particles);
      const hash = Array.from(worldId).reduce((acc, char) => acc + char.charCodeAt(0), 0);
      const entry = {
        group,
        plasma,
        particles,
        kind,
        spinX: 0.0012 + (hash % 5) * 0.00016,
        spinY: 0.0034 + (hash % 7) * 0.00018
      };
      scene.add(group);
      worldGroups.set(worldId, entry);
      return entry;
    };

    const syncWorldGroups = (nextWorlds: Array<SectorWorld | SectorResource>) => {
      const nextIds = new Set(nextWorlds.map((world) => world.id));
      for (const world of nextWorlds) {
        const kind = world.type === "resource" ? "resource" : "world";
        if (!worldGroups.has(world.id)) createWorldGroup(world.id, kind);
      }
      for (const [worldId, entry] of worldGroups.entries()) {
        if (nextIds.has(worldId)) continue;
        scene.remove(entry.group);
        worldGroups.delete(worldId);
      }
    };

    const clock = new THREE.Clock();
    let frameId = 0;
    let destroyed = false;

    const animate = () => {
      if (destroyed) return;
      const elapsed = clock.getElapsedTime();
      const current = latestStateRef.current;
      ensureSize(current.viewportSize.width, current.viewportSize.height);
      syncWorldGroups(current.orbs);

      materialSets.world.plasmaMat.uniforms.uTime.value = elapsed * MAP_ORB_PRESETS.world.timeScale;
      materialSets.resource.plasmaMat.uniforms.uTime.value = elapsed * MAP_ORB_PRESETS.resource.timeScale;
      materialSets.world.particleMat.uniforms.uTime.value = elapsed;
      materialSets.resource.particleMat.uniforms.uTime.value = elapsed;

      const sphereDiameter = Math.max(12, 76 * current.zoom);
      const sphereScale = sphereDiameter / 1.976;
      const particleScale = Math.max(0.72, Math.min(1.85, 0.78 + current.zoom * 0.4));

      for (const world of current.orbs) {
        const entry = worldGroups.get(world.id);
        if (!entry) continue;
        const screenX = current.pan.x + world.x * current.zoom;
        const screenY = current.pan.y + world.y * current.zoom;
        const visible =
          screenX >= -90 &&
          screenX <= current.viewportSize.width + 90 &&
          screenY >= -90 &&
          screenY <= current.viewportSize.height + 90;

        entry.group.visible = visible;
        if (!visible) continue;

        entry.group.position.set(
          screenX - current.viewportSize.width / 2,
          current.viewportSize.height / 2 - screenY,
          0
        );
        entry.group.scale.setScalar(sphereScale);
        entry.particles.scale.setScalar(particleScale);
        entry.plasma.rotation.y = elapsed * 0.08;
        entry.group.rotation.x += entry.spinX;
        entry.group.rotation.y += entry.spinY;
      }

      renderer.render(scene, camera);
      frameId = window.requestAnimationFrame(animate);
    };

    animate();

    return () => {
      destroyed = true;
      if (frameId) window.cancelAnimationFrame(frameId);
      for (const entry of worldGroups.values()) {
        scene.remove(entry.group);
      }
      worldGroups.clear();
      coreGeo.dispose();
      particleGeo.dispose();
      plasmaGeo.dispose();
      materialSets.world.coreMat.dispose();
      materialSets.world.plasmaMat.dispose();
      materialSets.world.particleMat.dispose();
      materialSets.resource.coreMat.dispose();
      materialSets.resource.plasmaMat.dispose();
      materialSets.resource.particleMat.dispose();
      renderer.dispose();
    };
  }, []);

  return <canvas ref={canvasRef} className="sector-mission-world-layer" aria-hidden="true" />;
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
            const guide = BUILD_GUIDE_CONTENT[type];
            const cost = costForLevel(type, 1, buildingCostReductionFactor);
            const affordable = canAffordCost(resourceAmounts, cost);
            const fits = cfg.width <= free.width;
            const populationUnlocked = isPopulationBuildingUnlocked(type, currentPopulation);
            const populationRequired = type in POPULATION_BUILD_UNLOCK_MIN
              ? POPULATION_BUILD_UNLOCK_MIN[type as PopulationBuildingId] ?? 0
              : 0;
            const disabled = !affordable || !fits || !populationUnlocked || Boolean(constructionJob);
            const guideRole = guide ? l(guide.roleFr, guide.roleEn) : "";
            const guideDetails = guide ? (language === "en" ? guide.detailsEn : guide.detailsFr) : [];
            const guideTips = guide ? (language === "en" ? guide.tipsEn : guide.tipsFr) : [];
            const buildWarnings = [
              !populationUnlocked
                ? `${l("Population requise", "Population required")} ${populationRequired.toLocaleString()}`
                : null,
              !fits ? l("Espace horizontal insuffisant", "Not enough horizontal space") : null,
              !affordable ? l("Ressources insuffisantes", "Not enough resources") : null,
              constructionJob ? l("File de construction occupee", "Construction queue busy") : null
            ].filter(Boolean) as string[];

            return (
              <article key={type} className={`build-item ${disabled ? "disabled" : ""}`}>
                <div className="build-item-bg" style={{ backgroundImage: `url(${cfg.image})` }} aria-hidden="true" />
                <div className="build-item-overlay" aria-hidden="true" />
                <div className="build-item-shell">
                  <div className="build-item-head">
                    <div className="build-item-title-wrap">
                      <span className={`dot ${cfg.color}`}>{cfg.icon}</span>
                      <span className="title">{roomDisplayName(type, language)}</span>
                    </div>
                    <span className="build-item-group">
                      {cfg.buildGroup === "population"
                        ? l("Population", "Population")
                        : cfg.buildGroup === "infrastructure"
                          ? l("Infrastructure", "Infrastructure")
                          : l("Production", "Production")}
                    </span>
                  </div>

                  <div className="build-item-stats">
                    <div className="build-item-stat">
                      <small>{l("Largeur", "Width")}</small>
                      <strong>{cfg.width}</strong>
                    </div>
                    <div className="build-item-stat">
                      <small>{l("Temps", "Time")}</small>
                      <strong>{formatDuration(buildSecondsForLevel(type, 1, buildingTimeReductionFactor))}</strong>
                    </div>
                    <div className="build-item-stat">
                      <small>{l("Cap", "Cap")}</small>
                      <strong>{cfg.maxLevel >= 9999 ? l("Libre", "Open") : cfg.maxLevel}</strong>
                    </div>
                  </div>

                  {guideRole ? <p className="build-item-role">{guideRole}</p> : null}

                  <div className="build-item-cost">
                    <ResourceCostDisplay cost={cost} available={resourceAmounts} language={language} compact />
                  </div>

                  {guide ? (
                    <details className="build-item-spoiler">
                      <summary>{l("Comprendre ce batiment", "Understand this building")}</summary>
                      <div className="build-item-spoiler-body">
                        <section className="build-item-section">
                          <h4>{l("Utilite", "Purpose")}</h4>
                          <ul>
                            {guideDetails.map((entry, index) => (
                              <li key={`${type}-detail-${index}`}>{entry}</li>
                            ))}
                          </ul>
                        </section>
                        <section className="build-item-section">
                          <h4>{l("Conseils strategiques", "Strategic advice")}</h4>
                          <ul>
                            {guideTips.map((entry, index) => (
                              <li key={`${type}-tip-${index}`}>{entry}</li>
                            ))}
                          </ul>
                        </section>
                      </div>
                    </details>
                  ) : null}

                  {buildWarnings.length > 0 ? (
                    <div className="build-item-warnings">
                      {buildWarnings.map((warning) => (
                        <em key={`${type}-${warning}`}>{warning}</em>
                      ))}
                    </div>
                  ) : null}

                  <button
                    type="button"
                    className="build-item-action"
                    disabled={disabled}
                    onClick={() => onBuild(type)}
                  >
                    {disabled ? l("Indisponible", "Unavailable") : l("Construire", "Build")}
                  </button>
                </div>
              </article>
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













