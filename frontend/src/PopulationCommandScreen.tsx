import {
  ArrowRight,
  BookOpen,
  Coins,
  FlaskConical,
  Rocket,
  Shield,
  Sparkles,
  Users,
  Utensils,
  Wrench
} from "lucide-react";

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
type PopulationBuildingId =
  | "quartiers_residentiels"
  | "cantine_hydroponique"
  | "centre_medical"
  | "parc_orbital"
  | "academie_technique"
  | "universite_orbitale";
type PopulationNavScreen = "game" | "resources" | "technology" | "hangar" | "population";

type PopulationSnapshot = {
  totalPopulation: number;
  capacity: number;
  growthPerHour: number;
  migrationPerHour: number;
  foodStock: number;
  foodCapacity: number;
  foodBalancePerHour: number;
  stability: number;
  workers: number;
  engineers: number;
  scientists: number;
  requiredWorkers: number;
  availableWorkers: number;
  workforceMultiplier: number;
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
  civilizationTier: {
    nameFr: string;
    nameEn: string;
  };
};

type PopulationAdviceRow = {
  id: string;
  tone: "good" | "warn" | "danger";
  title: string;
  text: string;
  actionLabel?: string;
  actionScreen?: PopulationNavScreen;
};

type PopulationBuildingRow = {
  roomType: PopulationBuildingId;
  name: string;
  image: string;
  level: number;
  unlocked: boolean;
  unlockPopulation: number;
  nextCostEntries: Array<{
    resourceId: ResourceId;
    amount: number;
    affordable: boolean;
  }>;
  nextTimeSec: number;
  effectRows: string[];
};

type PopulationCommandScreenProps = {
  language: UILanguage;
  snapshot: PopulationSnapshot;
  adviceRows: PopulationAdviceRow[];
  buildingRows: PopulationBuildingRow[];
  nextPopulationUnlock: { name: string; minPopulation: number } | null;
  stabilityBandLabel: string;
  activeEventLabel: string | null;
  activeCrisisLabel: string | null;
  onNavigate: (screen: PopulationNavScreen) => void;
};

const RESOURCE_IMAGE_MAP: Record<ResourceId, string> = {
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

const RESOURCE_NAME_FR: Record<ResourceId, string> = {
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

const POPULATION_GUIDE: Record<
  PopulationBuildingId,
  {
    titleFr: string;
    titleEn: string;
    roleFr: string;
    roleEn: string;
    timingFr: string;
    timingEn: string;
    watchFr: string;
    watchEn: string;
  }
> = {
  quartiers_residentiels: {
    titleFr: "Base d'expansion",
    titleEn: "Expansion backbone",
    roleFr: "Augmente la capacite d'habitation. C'est le batiment qui debloque le plus simplement plus de population, plus de travailleurs et plus de marge pour toute la colonie.",
    roleEn: "Raises housing capacity. This is the simplest building for unlocking more population, more workers and more room for the whole colony.",
    timingFr: "Montez-le avant de pousser trop vite vos lignes de production. Des qu'une penalite de surpopulation approche, c'est la priorite absolue.",
    timingEn: "Upgrade it before pushing production lines too fast. As soon as overcapacity is close, this becomes top priority.",
    watchFr: "Si vous l'ignorez, vous perdez vite en production globale. C'est le meilleur levier pour soutenir aussi la flotte sur le long terme.",
    watchEn: "If you ignore it, overall production drops quickly. It is also the best long-term lever to support fleet logistics."
  },
  cantine_hydroponique: {
    titleFr: "Stabilisateur de croissance",
    titleEn: "Growth stabilizer",
    roleFr: "Produit la nourriture qui permet a la croissance de continuer. Sans elle, la colonie se fige et la stabilite finit par plonger.",
    roleEn: "Produces the food that keeps growth running. Without it, the colony stalls and stability eventually drops.",
    timingFr: "Montez-la des que votre balance nourriture se rapproche de zero. C'est le second pilier apres les quartiers residentiels.",
    timingEn: "Upgrade it as soon as your food balance gets close to zero. It is the second pillar after Residential Quarters.",
    watchFr: "Une balance negative bloque d'abord la croissance, puis fragilise toute l'economie. Ne laissez jamais ce batiment en retard.",
    watchEn: "A negative balance first halts growth, then weakens the whole economy. Do not let this building fall behind."
  },
  centre_medical: {
    titleFr: "Lissage des crises",
    titleEn: "Crisis smoothing",
    roleFr: "Ameliore la sante et soutient la croissance stable. Il reduit le risque de degradations lentes quand la colonie grossit.",
    roleEn: "Improves health and supports steady growth. It reduces slow degradation risks as the colony grows.",
    timingFr: "A ajouter une fois le logement et la nourriture stabilises. Tres utile avant de lancer une grosse phase d'industrialisation.",
    timingEn: "Add it once housing and food are stable. Very useful before a major industrial expansion phase.",
    watchFr: "Ce n'est pas votre premier batiment de population. Il brille surtout quand la colonie a deja atteint une taille moyenne.",
    watchEn: "It is not your first population building. It shines once the colony has already reached medium scale."
  },
  parc_orbital: {
    titleFr: "Tampon de stabilite",
    titleEn: "Stability buffer",
    roleFr: "Ameliore la stabilite et les loisirs. Il sert a absorber les malus sociaux et a garder une production propre quand la pression monte.",
    roleEn: "Improves stability and leisure. It absorbs social penalties and keeps production clean when pressure rises.",
    timingFr: "Montez-le si la stabilite descend sous 80% ou si vous voulez preparer une phase de croissance rapide sans crise.",
    timingEn: "Upgrade it if stability drops below 80% or if you want to prepare fast growth without triggering crises.",
    watchFr: "Il ne remplace ni la nourriture ni le logement. C'est un amortisseur, pas une fondation.",
    watchEn: "It does not replace food or housing. It is a shock absorber, not a foundation."
  },
  academie_technique: {
    titleFr: "Levier ingenieurs",
    titleEn: "Engineer lever",
    roleFr: "Convertit une partie de la population en ingenieurs et accelere les chantiers. C'est un batiment avance pour pousser le tempo de construction.",
    roleEn: "Converts part of the population into engineers and speeds up construction. It is an advanced building used to push construction tempo.",
    timingFr: "A utiliser apres avoir stabilise logement, nourriture et workforce. Tres bon en milieu de partie, mauvais si votre colonie manque deja de marge.",
    timingEn: "Use it after housing, food and workforce are stable. Excellent in midgame, bad if your colony already lacks margin.",
    watchFr: "Il peut reduire la part de travailleurs libres. Si votre economie est tendue, montez-le plus tard.",
    watchEn: "It can reduce the share of free workers. If your economy is tight, upgrade it later."
  },
  universite_orbitale: {
    titleFr: "Levier scientifiques",
    titleEn: "Scientist lever",
    roleFr: "Convertit une partie de la population en scientifiques et accelere la recherche. C'est un outil de specialisation tardive.",
    roleEn: "Converts part of the population into scientists and accelerates research. It is a late specialization tool.",
    timingFr: "A monter lorsque votre base economique est deja solide et que la recherche devient votre goulot d'etranglement principal.",
    timingEn: "Upgrade it once your economic base is already solid and research becomes your main bottleneck.",
    watchFr: "Comme l'Academie, elle consomme de la flexibilite en workforce. A eviter trop tot.",
    watchEn: "Like the Academy, it consumes workforce flexibility. Avoid it too early."
  }
};

const formatDuration = (seconds: number) => {
  const total = Math.max(0, Math.floor(Number(seconds) || 0));
  const hours = Math.floor(total / 3600);
  const minutes = Math.floor((total % 3600) / 60);
  const secs = total % 60;
  if (hours > 0) {
    return `${hours.toString().padStart(2, "0")}:${minutes.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  }
  return `${minutes.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
};

export default function PopulationCommandScreen({
  language,
  snapshot,
  adviceRows,
  buildingRows,
  nextPopulationUnlock,
  stabilityBandLabel,
  activeEventLabel,
  activeCrisisLabel,
  onNavigate
}: PopulationCommandScreenProps) {
  const l = (fr: string, en: string) => (language === "en" ? en : fr);
  const populationFillPct = Math.max(0, Math.min(100, (snapshot.totalPopulation / Math.max(1, snapshot.capacity)) * 100));
  const foodFillPct = Math.max(0, Math.min(100, (snapshot.foodStock / Math.max(1, snapshot.foodCapacity)) * 100));
  const workforceLoadPct = Math.max(0, Math.min(100, (snapshot.requiredWorkers / Math.max(1, snapshot.workers)) * 100));
  const constructionSpeedPct = (1 / Math.max(0.01, snapshot.constructionTimeFactor) - 1) * 100;
  const researchSpeedPct = (1 / Math.max(0.01, snapshot.researchTimeFactor) - 1) * 100;
  const signedPct = (value: number) => `${value >= 0 ? "+" : ""}${value.toFixed(1)}%`;
  const productivityState =
    snapshot.isOverCapacity || snapshot.foodShortage || snapshot.stability < 70
      ? l("Sous pression", "Under pressure")
      : snapshot.stability >= 85 && snapshot.foodBalancePerHour >= 0
        ? l("Colonie saine", "Healthy colony")
        : l("Sous controle", "Under control");

  return (
    <main className="population-v3-shell">
      <section className="population-v3-hero">
        <div className="population-v3-hero-copy">
          <span className="population-v3-eyebrow">{l("Centre civique", "Civic command")}</span>
          <h2>{l("Commandement population", "Population command")}</h2>
          <p>
            {l(
              "Cette page te dit clairement ce qui fait grandir ta colonie, ce qui la bloque, et quels batiments monter ensuite. La population ne sert plus a te bloquer artificiellement au hangar.",
              "This page tells you clearly what grows your colony, what blocks it, and which buildings to upgrade next. Population no longer hard-blocks your hangar."
            )}
          </p>
          <div className="population-v3-action-row">
            <button type="button" onClick={() => onNavigate("game")}>
              <Wrench size={15} />
              <span>{l("Retour Jeu", "Back to Game")}</span>
            </button>
            <button type="button" onClick={() => onNavigate("resources")}>
              <Coins size={15} />
              <span>{l("Voir Ressources", "Open Resources")}</span>
            </button>
            <button type="button" onClick={() => onNavigate("hangar")}>
              <Rocket size={15} />
              <span>{l("Voir Hangar", "Open Hangar")}</span>
            </button>
            <button type="button" onClick={() => onNavigate("technology")}>
              <BookOpen size={15} />
              <span>{l("Voir Technologie", "Open Technology")}</span>
            </button>
          </div>
        </div>

        <div className="population-v3-hero-side">
          <article className="population-v3-state-card">
            <small>{l("Etat general", "Overall state")}</small>
            <strong>{productivityState}</strong>
            <span>{l("Niveau civilisation", "Civilization tier")}: {l(snapshot.civilizationTier.nameFr, snapshot.civilizationTier.nameEn)}</span>
            {nextPopulationUnlock ? (
              <p>
                {l("Prochain debloquage", "Next unlock")}: <b>{nextPopulationUnlock.name}</b>{" "}
                {l("a", "at")} {nextPopulationUnlock.minPopulation.toLocaleString()}
              </p>
            ) : null}
          </article>
          <article className="population-v3-state-card accent">
            <small>{l("Doctrine flotte", "Fleet doctrine")}</small>
            <strong>{l("L'equipage ne bloque plus la construction", "Crew no longer blocks construction")}</strong>
            <p>
              {l(
                "Tu peux construire tes vaisseaux si tu as les ressources. La population libre sert maintenant surtout a lire la pression logistique de ta colonie.",
                "You can build ships as long as you have the resources. Free population is now mostly a logistics pressure indicator."
              )}
            </p>
          </article>
        </div>
      </section>

      <section className="population-v3-kpis">
        <article className="population-v3-kpi population">
          <small>{l("Population", "Population")}</small>
          <strong>{snapshot.totalPopulation.toLocaleString()} / {snapshot.capacity.toLocaleString()}</strong>
          <div className="population-v3-track"><div style={{ width: `${populationFillPct}%` }} /></div>
          <span>{l("Pression habitat", "Housing pressure")}: {populationFillPct.toFixed(0)}%</span>
        </article>
        <article className="population-v3-kpi growth">
          <small>{l("Croissance", "Growth")}</small>
          <strong>{snapshot.growthPerHour >= 0 ? "+" : ""}{snapshot.growthPerHour.toFixed(0)}/h</strong>
          <span>{l("Migration", "Migration")}: {snapshot.migrationPerHour >= 0 ? "+" : ""}{snapshot.migrationPerHour.toFixed(0)}/h</span>
        </article>
        <article className="population-v3-kpi food">
          <small>{l("Nourriture", "Food")}</small>
          <strong>{Math.floor(snapshot.foodStock).toLocaleString()} / {snapshot.foodCapacity.toLocaleString()}</strong>
          <div className="population-v3-track food"><div style={{ width: `${foodFillPct}%` }} /></div>
          <span>{l("Balance", "Balance")}: {snapshot.foodBalancePerHour >= 0 ? "+" : ""}{snapshot.foodBalancePerHour.toFixed(0)}/h</span>
        </article>
        <article className="population-v3-kpi stability">
          <small>{l("Stabilite", "Stability")}</small>
          <strong>{snapshot.stability.toFixed(1)}%</strong>
          <span>{stabilityBandLabel}</span>
        </article>
        <article className="population-v3-kpi workforce">
          <small>{l("Workforce", "Workforce")}</small>
          <strong>{snapshot.requiredWorkers.toLocaleString()} / {snapshot.workers.toLocaleString()}</strong>
          <div className="population-v3-track workforce"><div style={{ width: `${workforceLoadPct}%` }} /></div>
          <span>{l("Libre", "Free")}: {snapshot.availableWorkers.toLocaleString()}</span>
        </article>
        <article className="population-v3-kpi modifiers">
          <small>{l("Modificateurs", "Modifiers")}</small>
          <strong>{signedPct(snapshot.productionBonusPct)}</strong>
          <span>{l("Construction", "Construction")}: {signedPct(constructionSpeedPct)} | {l("Recherche", "Research")}: {signedPct(researchSpeedPct)}</span>
        </article>
      </section>

      <div className="population-v3-layout">
        <div className="population-v3-main">
          <section className="population-v3-panel">
            <div className="population-v3-panel-head">
              <strong>{l("Comprendre la colonie en 4 leviers", "Understand the colony in 4 levers")}</strong>
              <span>{l("Lecture rapide", "Quick read")}</span>
            </div>
            <div className="population-v3-system-grid">
              <article className="population-v3-system-card">
                <div className="population-v3-system-icon"><Users size={16} /></div>
                <strong>{l("1. Le logement ouvre toute la suite", "1. Housing unlocks everything else")}</strong>
                <p>
                  {l(
                    "Si la capacite est trop basse, toute la colonie plafonne. Plus de quartiers residentiels signifie plus d'habitants, donc plus de travailleurs et plus de marge.",
                    "If capacity is too low, the whole colony caps out. More Residential Quarters means more inhabitants, more workers and more margin."
                  )}
                </p>
                <span>{l("Score habitat", "Housing score")}: {snapshot.housingScore.toFixed(2)}</span>
              </article>
              <article className="population-v3-system-card">
                <div className="population-v3-system-icon"><Utensils size={16} /></div>
                <strong>{l("2. La nourriture garde la croissance en vie", "2. Food keeps growth alive")}</strong>
                <p>
                  {l(
                    "Une balance positive te laisse grandir. Une balance negative coupe d'abord la croissance, puis degrade la stabilite. La cantine hydroponique doit rester devant la demande.",
                    "A positive balance lets you grow. A negative balance first stops growth, then hurts stability. The Hydroponic Canteen must stay ahead of demand."
                  )}
                </p>
                <span>{snapshot.foodShortage ? l("Penurie active", "Shortage active") : l("Flux sous controle", "Flow under control")}</span>
              </article>
              <article className="population-v3-system-card">
                <div className="population-v3-system-icon"><Shield size={16} /></div>
                <strong>{l("3. La stabilite protege ton rendement", "3. Stability protects your output")}</strong>
                <p>
                  {l(
                    "Sous 70%, les malus commencent. Le parc orbital amortit les crises et le centre medical maintient une croissance plus propre.",
                    "Below 70%, penalties start. The Orbital Park absorbs crises and the Medical Center keeps growth cleaner."
                  )}
                </p>
                <span>{l("Etat", "State")}: {stabilityBandLabel}</span>
              </article>
              <article className="population-v3-system-card accent">
                <div className="population-v3-system-icon"><Rocket size={16} /></div>
                <strong>{l("4. Les vaisseaux ne sont plus bloques", "4. Ships are no longer hard-blocked")}</strong>
                <p>
                  {l(
                    "Tu peux lancer une production de vaisseaux sans etre bloque par un manque d'equipage. La population libre reste un indicateur de tension logistique, pas un verrou artificiel.",
                    "You can start ship production without being blocked by crew shortage. Free population stays a logistics tension indicator, not an artificial lock."
                  )}
                </p>
                <span>{l("Travailleurs libres", "Free workers")}: {snapshot.availableWorkers.toLocaleString()}</span>
              </article>
            </div>
          </section>

          <section className="population-v3-panel">
            <div className="population-v3-panel-head">
              <strong>{l("Priorites conseillees", "Recommended priorities")}</strong>
              <span>{l("Actions concretes", "Concrete actions")}</span>
            </div>
            <div className="population-v3-advice-list">
              {adviceRows.map((row) => (
                <article key={row.id} className={`population-v3-advice ${row.tone}`}>
                  <div>
                    <strong>{row.title}</strong>
                    <p>{row.text}</p>
                  </div>
                  {row.actionLabel && row.actionScreen ? (
                    <button type="button" onClick={() => onNavigate(row.actionScreen)}>
                      <span>{row.actionLabel}</span>
                      <ArrowRight size={15} />
                    </button>
                  ) : null}
                </article>
              ))}
            </div>
          </section>

          <section className="population-v3-panel">
            <div className="population-v3-panel-head">
              <strong>{l("Batiments civils", "Civil buildings")}</strong>
              <span>{l("Leviers de progression", "Progression levers")}</span>
            </div>
            <div className="population-v3-building-grid">
              {buildingRows.map((row) => {
                const guide = POPULATION_GUIDE[row.roomType];
                return (
                  <article
                    key={row.roomType}
                    className={`population-v3-building ${row.unlocked ? "unlocked" : "locked"}`}
                    style={{ ["--population-building-image" as string]: `url("${row.image}")` }}
                  >
                    <div className="population-v3-building-overlay" />
                    <header>
                      <div>
                        <small>{guide ? l(guide.titleFr, guide.titleEn) : l("Batiment civil", "Civil building")}</small>
                        <strong>{row.name}</strong>
                      </div>
                      <span>{l("Niv.", "Lvl")} {row.level}</span>
                    </header>

                    {!row.unlocked ? (
                      <p className="population-v3-lock">
                        {l("Debloque a", "Unlocks at")} {row.unlockPopulation.toLocaleString()} {l("population", "population")}
                      </p>
                    ) : null}

                    <ul className="population-v3-effect-list">
                      {row.effectRows.map((effect) => (
                        <li key={`${row.roomType}_${effect}`}>{effect}</li>
                      ))}
                    </ul>

                    <div className="population-v3-costs">
                      {row.nextCostEntries.map((entry) => (
                        <span
                          key={`${row.roomType}_${entry.resourceId}`}
                          className={`population-v3-cost-chip ${entry.affordable ? "ok" : "low"}`}
                        >
                          <img
                            src={RESOURCE_IMAGE_MAP[entry.resourceId]}
                            alt=""
                            aria-hidden="true"
                          />
                          <b>{language === "en" ? RESOURCE_NAME_EN[entry.resourceId] : RESOURCE_NAME_FR[entry.resourceId]}</b>
                          <span>{Math.floor(entry.amount).toLocaleString()}</span>
                        </span>
                      ))}
                    </div>

                    <div className="population-v3-building-footer">
                      <span>{l("Prochain niveau", "Next level")}: {formatDuration(row.nextTimeSec)}</span>
                      <button type="button" onClick={() => onNavigate("game")}>
                        {l("Ouvrir Jeu", "Open Game")}
                      </button>
                    </div>

                    <details className="population-v3-details">
                      <summary>{l("Comprendre ce batiment", "Understand this building")}</summary>
                      <div className="population-v3-details-body">
                        <div>
                          <small>{l("A quoi il sert", "What it does")}</small>
                          <p>{guide ? l(guide.roleFr, guide.roleEn) : l("Soutient la colonie.", "Supports the colony.")}</p>
                        </div>
                        <div>
                          <small>{l("Quand le monter", "When to upgrade it")}</small>
                          <p>{guide ? l(guide.timingFr, guide.timingEn) : l("A monter quand ce levier devient critique.", "Upgrade it when this lever becomes critical.")}</p>
                        </div>
                        <div>
                          <small>{l("Point d'attention", "Watch point")}</small>
                          <p>{guide ? l(guide.watchFr, guide.watchEn) : l("Surveille son cout avant de pousser trop vite.", "Watch its cost before pushing too fast.")}</p>
                        </div>
                      </div>
                    </details>
                  </article>
                );
              })}
            </div>
          </section>
        </div>

        <aside className="population-v3-sidebar">
          <section className="population-v3-sidecard">
            <div className="population-v3-panel-head compact">
              <strong>{l("Diagnostic instantane", "Instant diagnostic")}</strong>
              <span>{l("Direct", "Live")}</span>
            </div>
            <ul className="population-v3-side-list">
              <li className={snapshot.productionBonusPct >= 0 ? "good" : "bad"}>
                <span>{l("Production globale", "Global production")}</span>
                <b>{signedPct(snapshot.productionBonusPct)}</b>
              </li>
              <li className={constructionSpeedPct >= 0 ? "good" : "bad"}>
                <span>{l("Construction", "Construction")}</span>
                <b>{signedPct(constructionSpeedPct)}</b>
              </li>
              <li className={researchSpeedPct >= 0 ? "good" : "bad"}>
                <span>{l("Recherche", "Research")}</span>
                <b>{signedPct(researchSpeedPct)}</b>
              </li>
              <li className={snapshot.workforceMultiplier >= 1 ? "good" : "bad"}>
                <span>{l("Workforce", "Workforce")}</span>
                <b>{signedPct((snapshot.workforceMultiplier - 1) * 100)}</b>
              </li>
            </ul>
          </section>

          <section className="population-v3-sidecard">
            <div className="population-v3-panel-head compact">
              <strong>{l("Lecture des risques", "Risk reading")}</strong>
              <span>{l("A surveiller", "Watch")}</span>
            </div>
            <div className="population-v3-risk-list">
              <div>
                <Users size={14} />
                <div>
                  <strong>{l("Habitat", "Housing")}</strong>
                  <span>{snapshot.isOverCapacity ? l("Surpopulation active", "Overcapacity active") : l("Capacite sous controle", "Capacity under control")}</span>
                </div>
              </div>
              <div>
                <Utensils size={14} />
                <div>
                  <strong>{l("Nourriture", "Food")}</strong>
                  <span>{snapshot.foodShortage ? l("Penurie en cours", "Shortage active") : l("Flux positif ou stable", "Positive or stable flow")}</span>
                </div>
              </div>
              <div>
                <Shield size={14} />
                <div>
                  <strong>{l("Stabilite", "Stability")}</strong>
                  <span>{stabilityBandLabel}</span>
                </div>
              </div>
              <div>
                <FlaskConical size={14} />
                <div>
                  <strong>{l("Specialisation", "Specialization")}</strong>
                  <span>
                    {snapshot.engineers.toLocaleString()} {l("ingenieurs", "engineers")} • {snapshot.scientists.toLocaleString()} {l("scientifiques", "scientists")}
                  </span>
                </div>
              </div>
            </div>
            {activeEventLabel ? (
              <p className="population-v3-event-line">
                <Sparkles size={14} />
                <span>{l("Evenement", "Event")}: <b>{activeEventLabel}</b></span>
              </p>
            ) : null}
            {activeCrisisLabel ? (
              <p className="population-v3-event-line danger">
                <Shield size={14} />
                <span>{l("Crise", "Crisis")}: <b>{activeCrisisLabel}</b></span>
              </p>
            ) : null}
          </section>

          <section className="population-v3-sidecard">
            <div className="population-v3-panel-head compact">
              <strong>{l("Repere simple", "Simple rule")}</strong>
              <span>{l("Memo", "Memo")}</span>
            </div>
            <div className="population-v3-doctrine-list">
              <p>
                <b>{l("1.", "1.")}</b> {l("D'abord logement.", "Housing first.")}
              </p>
              <p>
                <b>{l("2.", "2.")}</b> {l("Ensuite nourriture.", "Then food.")}
              </p>
              <p>
                <b>{l("3.", "3.")}</b> {l("Puis stabilite.", "Then stability.")}
              </p>
              <p>
                <b>{l("4.", "4.")}</b> {l("Ingenieurs et scientifiques seulement quand la base tourne deja bien.", "Engineers and scientists only once the base is already stable.")}
              </p>
            </div>
          </section>
        </aside>
      </div>
    </main>
  );
}
