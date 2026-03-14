import {
  Atom,
  ChevronRight,
  Clock3,
  Coins,
  FlaskConical,
  Gauge,
  Layers3,
  Lock,
  Orbit,
  Rocket,
  Shield,
  Sparkles,
  Sword,
  Wrench,
  Zap
} from "lucide-react";
import { useEffect, useMemo, useState } from "react";

type UILanguage = "fr" | "en";
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
type ResourceCost = Partial<Record<ResourceId, number>>;
type TechnologyCategory = "eco" | "military" | "defense" | "unlock" | "energy" | "strategy";

type TechnologyRequirement = {
  id: string;
  level: number;
};

type TechnologyDef = {
  id: string;
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
  technologyId: string;
  targetLevel: number;
  startedAt: number;
  endAt: number;
  costPaid: ResourceCost;
};

type InventoryViewItem = {
  id: string;
  category: string;
  quantity: number;
  durationSeconds?: number | null;
};

type TechnologyCommandScreenProps = {
  language: UILanguage;
  technologyDefs: TechnologyDef[];
  technologyLevels: Record<string, number>;
  researchJob: ResearchJob | null;
  researchRemainingSeconds: number;
  researchTimeFactor: number;
  resourceAmounts: Record<string, number>;
  inventoryItems: InventoryViewItem[];
  inventoryLoading: boolean;
  inventoryActionLoadingId: string;
  onLaunchResearch: (techId: string) => void;
  onUseBoost: (itemId: string, quantity?: number, targetOverride?: "auto" | "building" | "hangar" | "research_local", queueId?: string) => void;
  getTechnologyName: (techId: string, fallback: string) => string;
  getTechnologyDescription: (techId: string, fallback: string) => string;
  getTechnologyEffect: (techId: string, fallback?: string) => string | undefined;
  getTechnologyCostForLevel: (tech: TechnologyDef, level: number) => ResourceCost;
  getTechnologyTimeForLevel: (tech: TechnologyDef, level: number) => number;
  areTechnologyRequirementsMet: (tech: TechnologyDef) => boolean;
  getRequirementsLabel: (tech: TechnologyDef) => string;
  formatBoostDurationLabel: (seconds: number) => string;
};

const RESOURCE_ICON_BY_ID: Record<ResourceId, string> = {
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

const CATEGORY_META: Record<
  TechnologyCategory,
  {
    icon: typeof Atom;
    accentClass: string;
    titleFr: string;
    titleEn: string;
    eyebrowFr: string;
    eyebrowEn: string;
    summaryFr: string;
    summaryEn: string;
    tacticalFr: string;
    tacticalEn: string;
  }
> = {
  eco: {
    icon: FlaskConical,
    accentClass: "eco",
    titleFr: "Economie orbitale",
    titleEn: "Orbital economy",
    eyebrowFr: "Production & cadence",
    eyebrowEn: "Production & tempo",
    summaryFr: "Accroit la base industrielle, reduit les couts et garantit une croissance stable.",
    summaryEn: "Expands the industrial base, lowers costs, and stabilizes long-term growth.",
    tacticalFr: "Priorite du debut de partie. Sans cette branche, tout le reste avance trop lentement.",
    tacticalEn: "Early-game priority. Without this branch, everything else moves too slowly."
  },
  military: {
    icon: Sword,
    accentClass: "military",
    titleFr: "Doctrine offensive",
    titleEn: "Offensive doctrine",
    eyebrowFr: "Force de frappe",
    eyebrowEn: "Strike power",
    summaryFr: "Ameliore l'impact direct des flottes de combat et la tenue des escadres.",
    summaryEn: "Improves direct fleet damage output and battle-line durability.",
    tacticalFr: "Montez-la quand la carte devient disputee et que vos recolteurs doivent etre escortes.",
    tacticalEn: "Scale it when the map becomes contested and harvesters need escorts."
  },
  defense: {
    icon: Shield,
    accentClass: "defense",
    titleFr: "Architecture defensive",
    titleEn: "Defensive architecture",
    eyebrowFr: "Tenue orbitale",
    eyebrowEn: "Orbital resilience",
    summaryFr: "Renforce les plateformes fixes, les boucliers et les contre-mesures stationnaires.",
    summaryEn: "Strengthens fixed platforms, shields, and stationary countermeasures.",
    tacticalFr: "Indispensable si ton hyperstructure devient une cible frequente ou si tu veux tenir hors ligne.",
    tacticalEn: "Mandatory if your hyperstructure becomes a frequent target or you need offline resilience."
  },
  unlock: {
    icon: Rocket,
    accentClass: "unlock",
    titleFr: "Doctrines de debloquage",
    titleEn: "Unlock doctrines",
    eyebrowFr: "Nouvelles coques",
    eyebrowEn: "New hull frames",
    summaryFr: "Ouvre les escadres et plateformes majeures qui changent vraiment le meta-jeu.",
    summaryEn: "Unlocks the squadrons and platforms that truly shift your meta-game.",
    tacticalFr: "Planifie cette branche par palier. Chaque doctrine ouvre un nouveau style d'expansion ou d'attaque.",
    tacticalEn: "Plan this branch by tier. Each doctrine opens a new expansion or attack pattern."
  },
  energy: {
    icon: Zap,
    accentClass: "energy",
    titleFr: "Energie profonde",
    titleEn: "Deep energy systems",
    eyebrowFr: "Ressources rares",
    eyebrowEn: "Rare resource control",
    summaryFr: "Optimise les ressources tardives et les economies les plus sensibles du systeme.",
    summaryEn: "Optimizes late-tier resources and the most sensitive economies in the system.",
    tacticalFr: "Branche de transition vers le haut niveau. Elle paie seulement si la production de base est deja propre.",
    tacticalEn: "Late-tier transition branch. It only pays off once your baseline production is already clean."
  },
  strategy: {
    icon: Orbit,
    accentClass: "strategy",
    titleFr: "Commandement strategique",
    titleEn: "Strategic command",
    eyebrowFr: "Projection globale",
    eyebrowEn: "Global projection",
    summaryFr: "Augmente le nombre de flottes, l'efficacite generale et les capacites systemiques.",
    summaryEn: "Raises fleet count, overall efficiency, and systemic strategic capacity.",
    tacticalFr: "Tres forte au mid/late game quand tu dois tenir plusieurs fronts en meme temps.",
    tacticalEn: "Extremely strong in mid/late game when you need to hold several fronts at once."
  }
};

const CATEGORY_ORDER: TechnologyCategory[] = ["eco", "military", "defense", "unlock", "energy", "strategy"];

const TECH_GUIDANCE: Partial<Record<string, { fr: string; en: string }>> = {
  optimisation_extractive: {
    fr: "Base de tout le debut de partie. Monte-la avant de surinvestir ailleurs si ton carbone ou titane plafonne.",
    en: "Foundation of the early game. Raise it before overinvesting elsewhere if carbon or titanium is bottlenecking."
  },
  automatisation_industrielle: {
    fr: "Excellente pour gagner du score et du tempo a long terme. Plus tu la prends tot, plus elle amortit vite.",
    en: "Excellent for long-term score and tempo. The earlier you take it, the faster it pays for itself."
  },
  optimisation_logistique: {
    fr: "Priorite directe si tes files batiment s'etirent ou si tu joues en sessions courtes.",
    en: "Direct priority if your building queues feel too long or you play in short sessions."
  },
  balistique_avancee: {
    fr: "Premier vrai levier d'attaque. Monte-la si tu veux punir les champs adverses ou soutenir ton alliance.",
    en: "First real attack lever. Raise it if you want to punish enemy fields or support your alliance."
  },
  blindage_composite: {
    fr: "Meilleure avec des flottes deja denses. Elle convertit tes investissements precedents en endurance reelle.",
    en: "Best once your fleets are already dense. It converts previous investment into real staying power."
  },
  architecture_defensive: {
    fr: "Branche charniere pour ne pas subir les raids. Debloque des plateformes qui changent vraiment la defense.",
    en: "Core defensive branch to stop suffering raids. Unlocks platforms that materially change defense."
  },
  doctrine_escarmouche: {
    fr: "A prendre des que tu veux exister sur la carte. Sans elle, tu ne controles ni reco ni interception legere.",
    en: "Take it as soon as you want to matter on the map. Without it, you control neither scouting nor light interception."
  },
  doctrine_domination: {
    fr: "Palier militaire fort. Debloque les coques qui font vraiment peur sur les champs de ressources.",
    en: "Major military tier. Unlocks the hulls that truly threaten resource fields."
  },
  architecture_capitale: {
    fr: "Tres puissante mais tres exigeante. Ne la rush pas tant que l'economie et le carburant ne suivent pas.",
    en: "Very powerful but very demanding. Do not rush it before your economy and fuel budget can sustain it."
  },
  commandement_escadre: {
    fr: "L'une des meilleures technos strategiques. Elle ouvre du multi-front reel et change le controle de carte.",
    en: "One of the strongest strategic technologies. It unlocks real multi-front play and changes map control."
  }
};

function formatDuration(seconds: number) {
  const safe = Math.max(0, Math.floor(Number(seconds) || 0));
  const hours = Math.floor(safe / 3600);
  const minutes = Math.floor((safe % 3600) / 60);
  const secs = safe % 60;
  if (hours > 0) return `${hours}h ${minutes.toString().padStart(2, "0")}m ${secs.toString().padStart(2, "0")}s`;
  return `${minutes.toString().padStart(2, "0")}m ${secs.toString().padStart(2, "0")}s`;
}

function canAffordCost(amounts: Record<string, number>, cost: ResourceCost) {
  return (Object.keys(cost) as ResourceId[]).every((id) => (amounts[id] ?? 0) >= (cost[id] ?? 0));
}

function resourceLabel(resourceId: ResourceId, language: UILanguage) {
  const fr: Record<ResourceId, string> = {
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
  const en = fr;
  return language === "en" ? en[resourceId] : fr[resourceId];
}

function guidanceForTech(techId: string, category: TechnologyCategory, language: UILanguage) {
  const specific = TECH_GUIDANCE[techId];
  if (specific) return language === "en" ? specific.en : specific.fr;
  const meta = CATEGORY_META[category];
  return language === "en" ? meta.tacticalEn : meta.tacticalFr;
}

export default function TechnologyCommandScreen({
  language,
  technologyDefs,
  technologyLevels,
  researchJob,
  researchRemainingSeconds,
  researchTimeFactor,
  resourceAmounts,
  inventoryItems,
  inventoryLoading,
  inventoryActionLoadingId,
  onLaunchResearch,
  onUseBoost,
  getTechnologyName,
  getTechnologyDescription,
  getTechnologyEffect,
  getTechnologyCostForLevel,
  getTechnologyTimeForLevel,
  areTechnologyRequirementsMet,
  getRequirementsLabel,
  formatBoostDurationLabel
}: TechnologyCommandScreenProps) {
  const l = (fr: string, en: string) => (language === "en" ? en : fr);
  const [activeCategory, setActiveCategory] = useState<TechnologyCategory>("eco");
  const [boostItemId, setBoostItemId] = useState("");
  const [boostQuantityInput, setBoostQuantityInput] = useState("1");

  const categories = useMemo(
    () =>
      CATEGORY_ORDER.map((id) => {
        const meta = CATEGORY_META[id];
        return {
          id,
          icon: meta.icon,
          accentClass: meta.accentClass,
          title: language === "en" ? meta.titleEn : meta.titleFr,
          eyebrow: language === "en" ? meta.eyebrowEn : meta.eyebrowFr,
          summary: language === "en" ? meta.summaryEn : meta.summaryFr,
          tactical: language === "en" ? meta.tacticalEn : meta.tacticalFr
        };
      }),
    [language]
  );

  const boostItems = useMemo(
    () =>
      inventoryItems
        .filter((item) => item.category === "TIME_BOOST" && (item.durationSeconds ?? 0) > 0 && item.quantity > 0)
        .sort((a, b) => (a.durationSeconds ?? 0) - (b.durationSeconds ?? 0)),
    [inventoryItems]
  );

  useEffect(() => {
    if (boostItems.length === 0) {
      setBoostItemId("");
      return;
    }
    if (!boostItemId || !boostItems.some((item) => item.id === boostItemId)) {
      setBoostItemId(boostItems[0].id);
    }
  }, [boostItemId, boostItems]);

  const selectedBoost = boostItems.find((item) => item.id === boostItemId) ?? (boostItems.length > 0 ? boostItems[0] : null);
  const requestedBoostQuantity = Math.max(1, Math.floor(Number(boostQuantityInput) || 1));
  const effectiveBoostQuantity = selectedBoost ? Math.min(requestedBoostQuantity, selectedBoost.quantity) : 0;
  const boostLoading = Boolean(selectedBoost) && inventoryActionLoadingId === selectedBoost.id;
  const canUseBoost = Boolean(researchJob) && Boolean(selectedBoost) && effectiveBoostQuantity > 0 && !inventoryLoading && !boostLoading;

  const categoryRows = useMemo(
    () =>
      categories.map((category) => {
        const defs = technologyDefs.filter((def) => def.category === category.id);
        const totalLevels = defs.reduce((sum, def) => sum + Math.max(0, Math.floor(Number(technologyLevels[def.id] ?? 0))), 0);
        const completed = defs.filter((def) => {
          const current = Math.max(0, Math.floor(Number(technologyLevels[def.id] ?? 0)));
          return def.maxLevel ? current >= def.maxLevel : current > 0;
        }).length;
        return { ...category, defs, totalLevels, completed };
      }),
    [categories, technologyDefs, technologyLevels]
  );

  const selectedCategory = categoryRows.find((row) => row.id === activeCategory) ?? categoryRows[0];

  const activeTech = researchJob ? technologyDefs.find((def) => def.id === researchJob.technologyId) ?? null : null;
  const totalLevels = technologyDefs.reduce((sum, def) => sum + Math.max(0, Math.floor(Number(technologyLevels[def.id] ?? 0))), 0);
  const unlockedTechnologies = technologyDefs.filter((def) => Math.max(0, Math.floor(Number(technologyLevels[def.id] ?? 0))) > 0).length;
  const maxedTechnologies = technologyDefs.filter((def) => {
    const current = Math.max(0, Math.floor(Number(technologyLevels[def.id] ?? 0)));
    return Boolean(def.maxLevel && current >= def.maxLevel);
  }).length;

  return (
    <main className="tech-v4-shell">
      <section className={`tech-v4-hero ${selectedCategory?.accentClass ?? "eco"}`}>
        <div className="tech-v4-hero-copy">
          <span className="tech-v4-eyebrow">{selectedCategory?.eyebrow ?? l("Doctrine scientifique", "Science doctrine")}</span>
          <h2>{selectedCategory?.title ?? l("Commandement scientifique", "Scientific command")}</h2>
          <p>{selectedCategory?.summary ?? l("Recherchez, specialisez, debloquez et imposez votre tempo technologique.", "Research, specialize, unlock, and dictate your technological tempo.")}</p>
          <div className="tech-v4-tabrow">
            {categoryRows.map((category) => {
              const Icon = category.icon;
              return (
                <button
                  key={`tech_tab_${category.id}`}
                  type="button"
                  className={activeCategory === category.id ? "active" : ""}
                  onClick={() => setActiveCategory(category.id)}
                >
                  <Icon size={15} />
                  {category.title}
                </button>
              );
            })}
          </div>
          <div className="tech-v4-doctrine-banner">
            <Sparkles size={16} />
            <div>
              <strong>{l("Lecture strategique", "Strategic reading")}</strong>
              <span>{selectedCategory?.tactical}</span>
            </div>
          </div>
        </div>
        <div className="tech-v4-hero-stats">
          <article className="tech-v4-kpi">
            <small>{l("Niveaux cumules", "Total levels")}</small>
            <strong>{totalLevels.toLocaleString()}</strong>
            <span>{l("Progression scientifique globale", "Global scientific progression")}</span>
          </article>
          <article className="tech-v4-kpi">
            <small>{l("Technos actives", "Researched techs")}</small>
            <strong>{unlockedTechnologies.toLocaleString()}</strong>
            <span>{l("Branches deja amorcees", "Branches already started")}</span>
          </article>
          <article className="tech-v4-kpi">
            <small>{l("Palier max", "Maxed techs")}</small>
            <strong>{maxedTechnologies.toLocaleString()}</strong>
            <span>{l("Modules deja finalises", "Technologies already capped")}</span>
          </article>
          <article className="tech-v4-kpi">
            <small>{l("Facteur labo", "Lab factor")}</small>
            <strong>{researchTimeFactor.toFixed(2)}x</strong>
            <span>{l("Temps reconfigure par bonus locaux", "Research time after local bonuses")}</span>
          </article>
        </div>
      </section>

      <div className="tech-v4-layout">
        <aside className="tech-v4-sidebar">
          <section className="tech-v4-panel">
            <div className="tech-v4-panel-head">
              <strong>{l("Recherche active", "Active research")}</strong>
              <span>{researchJob ? l("En file", "Queued") : l("Idle", "Idle")}</span>
            </div>
            {researchJob && activeTech ? (
              <>
                <div className="tech-v4-active-card">
                  <span className="tech-v4-badge">{l("Niveau cible", "Target level")} {researchJob.targetLevel}</span>
                  <strong>{getTechnologyName(activeTech.id, activeTech.name)}</strong>
                  <small>{getTechnologyEffect(activeTech.id, activeTech.effectPerLevel) ?? l("Amelioration cumulative", "Cumulative improvement")}</small>
                  <div className="tech-v4-active-meta">
                    <span><Clock3 size={14} /> {formatDuration(researchRemainingSeconds)}</span>
                    <span><Gauge size={14} /> {l("Labo", "Lab")} {researchTimeFactor.toFixed(2)}x</span>
                  </div>
                </div>
                <div className="tech-v4-boost-box">
                  <div className="tech-v4-panel-head compact">
                    <strong>{l("Accelerateurs", "Accelerators")}</strong>
                    <span>{l("Inventaire", "Inventory")}</span>
                  </div>
                  {boostItems.length === 0 ? (
                    <p className="tech-v4-empty small">{l("Aucun accelerateur de recherche disponible.", "No research accelerator available.")}</p>
                  ) : (
                    <div className="tech-v4-boost-controls">
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
                        onClick={() => (selectedBoost ? onUseBoost(selectedBoost.id, effectiveBoostQuantity, "research_local") : undefined)}
                      >
                        {boostLoading ? l("Application...", "Applying...") : l("Accelerer", "Boost")}
                      </button>
                    </div>
                  )}
                </div>
              </>
            ) : (
              <p className="tech-v4-empty">{l("Aucune recherche active. Ouvre une branche et lance un palier utile.", "No active research. Open a branch and launch a meaningful tier.")}</p>
            )}
          </section>

          <section className="tech-v4-panel">
            <div className="tech-v4-panel-head">
              <strong>{l("Diagnostic de branche", "Branch diagnostics")}</strong>
              <span>{selectedCategory?.title}</span>
            </div>
            {selectedCategory ? (
              <div className="tech-v4-branch-metrics">
                <div>
                  <small>{l("Modeles", "Tech nodes")}</small>
                  <b>{selectedCategory.defs.length.toLocaleString()}</b>
                </div>
                <div>
                  <small>{l("Niveaux cumules", "Total levels")}</small>
                  <b>{selectedCategory.totalLevels.toLocaleString()}</b>
                </div>
                <div>
                  <small>{l("Technos ouvertes", "Opened techs")}</small>
                  <b>{selectedCategory.completed.toLocaleString()}</b>
                </div>
                <div>
                  <small>{l("Priorite", "Priority")}</small>
                  <b>{selectedCategory.eyebrow}</b>
                </div>
              </div>
            ) : null}
          </section>

          <section className="tech-v4-panel">
            <div className="tech-v4-panel-head">
              <strong>{l("Cadre doctrinal", "Doctrine frame")}</strong>
              <span>{l("Conseil", "Advice")}</span>
            </div>
            <div className="tech-v4-note-stack">
              <p>{selectedCategory?.tactical}</p>
              <p>
                {l(
                  "Ne lance pas une techno juste parce qu'elle est disponible. Priorise celles qui debloquent du score, du rythme ou un avantage tactique immediat.",
                  "Do not launch a technology just because it is available. Prioritize the ones that unlock score, tempo, or immediate tactical value."
                )}
              </p>
            </div>
          </section>
        </aside>

        <section className="tech-v4-catalog">
          <div className="tech-v4-catalog-head">
            <div>
              <span className="tech-v4-eyebrow">{selectedCategory?.eyebrow}</span>
              <h3>{selectedCategory?.title}</h3>
              <p>
                {l(
                  "Cartes compactes, hover d'intel rapide et spoiler de doctrine pour garder la page lisible meme avec beaucoup de technologies.",
                  "Compact cards, quick intel hover, and doctrine spoilers keep the page readable even with a large tech roster."
                )}
              </p>
            </div>
            <div className="tech-v4-head-summary">
              <span>{selectedCategory?.defs.length.toLocaleString()} {l("technos", "techs")}</span>
              <span>{selectedCategory?.totalLevels.toLocaleString()} {l("niveaux", "levels")}</span>
            </div>
          </div>

          <div className="tech-v4-grid">
            {(selectedCategory?.defs ?? []).map((def) => {
              const currentLevel = Math.max(0, Math.floor(Number(technologyLevels[def.id] ?? 0)));
              const targetLevel = currentLevel + 1;
              const atMax = Boolean(def.maxLevel && currentLevel >= def.maxLevel);
              const reqMet = areTechnologyRequirementsMet(def);
              const nextCost = getTechnologyCostForLevel(def, targetLevel);
              const nextTime = Math.max(1, Math.floor(getTechnologyTimeForLevel(def, targetLevel) * researchTimeFactor));
              const canPay = canAffordCost(resourceAmounts, nextCost);
              const isCurrent = researchJob?.technologyId === def.id;
              const statusLabel = isCurrent
                ? l("En recherche", "Researching")
                : atMax
                  ? l("Max", "Max")
                  : !reqMet
                    ? l("Prerequis", "Prerequisite")
                    : canPay
                      ? l("Pret", "Ready")
                      : l("A financer", "Funding needed");

              return (
                <article key={def.id} className={`tech-v4-card ${isCurrent ? "active" : ""} ${!reqMet ? "locked" : ""}`}>
                  <div className="tech-v4-card-top">
                    <span className="tech-v4-badge">{statusLabel}</span>
                    <span className="tech-v4-badge subtle">
                      {l("Niv.", "Lv.")} {currentLevel}{def.maxLevel ? `/${def.maxLevel}` : ""}
                    </span>
                  </div>
                  <div className="tech-v4-card-main">
                    <div className="tech-v4-card-headline">
                      <strong>{getTechnologyName(def.id, def.name)}</strong>
                      <small>{getTechnologyDescription(def.id, def.description)}</small>
                    </div>
                    <div className="tech-v4-card-kpis">
                      <span>
                        <small>{l("Effet", "Effect")}</small>
                        <b>{getTechnologyEffect(def.id, def.effectPerLevel) ?? l("Progression systemique", "Systemic progression")}</b>
                      </span>
                      <span>
                        <small>{l("Temps suivant", "Next time")}</small>
                        <b>{atMax ? "-" : formatDuration(nextTime)}</b>
                      </span>
                    </div>
                    {!atMax ? (
                      <div className="tech-v4-costs">
                        {(Object.keys(nextCost) as ResourceId[]).map((resourceId) => {
                          const amount = nextCost[resourceId] ?? 0;
                          return (
                            <span key={`${def.id}_${resourceId}`} className={canPay ? "" : (resourceAmounts[resourceId] ?? 0) < amount ? "insufficient" : ""}>
                              <img src={RESOURCE_ICON_BY_ID[resourceId]} alt={resourceLabel(resourceId, language)} />
                              <small>{resourceLabel(resourceId, language)}</small>
                              <b>{amount.toLocaleString()}</b>
                            </span>
                          );
                        })}
                      </div>
                    ) : (
                      <div className="tech-v4-max-line">{l("Niveau maximum atteint.", "Maximum level reached.")}</div>
                    )}
                    <button
                      type="button"
                      className="tech-v4-launch-btn"
                      disabled={atMax || !reqMet || !canPay || Boolean(researchJob)}
                      onClick={() => onLaunchResearch(def.id)}
                    >
                      {isCurrent
                        ? l("Recherche en cours", "Research in progress")
                        : atMax
                          ? l("Palier complet", "Tier complete")
                          : !reqMet
                            ? l("Prerequis manquants", "Missing prerequisites")
                            : !canPay
                              ? l("Ressources insuffisantes", "Not enough resources")
                              : researchJob
                                ? l("File occupee", "Research slot busy")
                                : l("Lancer la recherche", "Start research")}
                    </button>
                  </div>

                  <div className="tech-v4-hover-intel">
                    <div className="tech-v4-hover-head">
                      <strong>{l("Intel rapide", "Quick intel")}</strong>
                      <span>{selectedCategory?.title}</span>
                    </div>
                    <p>{guidanceForTech(def.id, def.category, language)}</p>
                    {!reqMet && def.requires?.length ? (
                      <ul>
                        <li>{getRequirementsLabel(def)}</li>
                      </ul>
                    ) : null}
                  </div>

                  <details className="tech-v4-details">
                    <summary>
                      {l("Doctrine & detail", "Doctrine & details")}
                      <ChevronRight size={14} />
                    </summary>
                    <div className="tech-v4-details-grid">
                      <div>
                        <small>{l("Branche", "Branch")}</small>
                        <b>{selectedCategory?.title}</b>
                      </div>
                      <div>
                        <small>{l("Cible", "Target")}</small>
                        <b>{l("Niveau", "Level")} {targetLevel}</b>
                      </div>
                      <div>
                        <small>{l("Prerequis", "Requirements")}</small>
                        <b>{def.requires?.length ? getRequirementsLabel(def) : l("Aucun", "None")}</b>
                      </div>
                      <div>
                        <small>{l("Temps de base", "Base time")}</small>
                        <b>{formatDuration(def.baseTimeSec)}</b>
                      </div>
                    </div>
                    <div className="tech-v4-doctrine-copy">
                      <p>{guidanceForTech(def.id, def.category, language)}</p>
                      <p>
                        {l(
                          "Le cout et le temps montent avec chaque palier. Lance cette recherche quand son impact immediat justifie l'immobilisation de la file scientifique.",
                          "Cost and time increase with each tier. Start this research when its immediate impact justifies locking the research queue."
                        )}
                      </p>
                    </div>
                  </details>
                </article>
              );
            })}
          </div>
        </section>
      </div>
    </main>
  );
}
