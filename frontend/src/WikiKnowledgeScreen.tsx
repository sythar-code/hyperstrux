import { useState } from "react";

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

type WikiBuildingRow = {
  id: string;
  name: string;
  machine: string;
  section: string;
  rarity: number;
  baseCost: ResourceCost;
  baseTimeSec: number;
  baseProdSec: number;
};

type WikiFleetRow = {
  id: string;
  name: string;
  force: number;
  endurance: number;
  speed?: number;
  capacity?: number;
  quantumPerHour?: number;
  cost: ResourceCost;
};

type WikiTechRow = {
  id: string;
  name: string;
  description: string;
  effectPerLevel?: string;
  category: TechnologyCategory;
  baseCost: ResourceCost;
  baseTimeSec: number;
  maxLevel?: number;
  requires?: Array<{ id: string; level: number }>; 
};

type WikiKnowledgeScreenProps = {
  language: UILanguage;
  buildingRows: WikiBuildingRow[];
  ships: WikiFleetRow[];
  defenses: WikiFleetRow[];
  techRows: WikiTechRow[];
  formatWikiCost: (cost: ResourceCost) => string;
};

function formatDuration(seconds: number) {
  const safe = Math.max(0, Math.floor(Number(seconds) || 0));
  const hours = Math.floor(safe / 3600);
  const minutes = Math.floor((safe % 3600) / 60);
  const secs = safe % 60;
  if (hours > 0) return `${hours}h ${minutes.toString().padStart(2, "0")}m ${secs.toString().padStart(2, "0")}s`;
  return `${minutes.toString().padStart(2, "0")}m ${secs.toString().padStart(2, "0")}s`;
}

export default function WikiKnowledgeScreen({
  language,
  buildingRows,
  ships,
  defenses,
  techRows,
  formatWikiCost
}: WikiKnowledgeScreenProps) {
  const l = (fr: string, en: string) => (language === "en" ? en : fr);
  const [tutorialTrack, setTutorialTrack] = useState<"start" | "hour1" | "pitfalls">("start");
  const [buildingPhase, setBuildingPhase] = useState<"early" | "mid" | "late">("early");
  const [militaryPhase, setMilitaryPhase] = useState<"light" | "mid" | "heavy">("light");
  const [techPhase, setTechPhase] = useState<"base" | "advanced" | "endgame">("base");

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
              "Optimisez Carbone/Titane, lancez vos premieres ameliorations et gardez le zoom sur le quadrillage pour encha�ner.",
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
    <main className="wiki-shell wiki-v2-shell">
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
          <a href="#wiki-combat">{l("7. Combat & Interceptions", "7. Combat & interceptions")}</a>
          <a href="#wiki-alliance">{l("8. Alliances & Coordination", "8. Alliances & coordination")}</a>
          <a href="#wiki-inbox">{l("9. Messagerie & Recompenses", "9. Inbox & Rewards")}</a>
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
                    "Prendre plusieurs champs moyens plutot qu'un gros champ risqu�.",
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

      <section id="wiki-combat" className="wiki-section">
        <header className="wiki-section-head">
          <h3>{l("7. Combat & Interceptions", "7. Combat & interceptions")}</h3>
          <p>
            {l(
              "Les combats sur champs de ressources sont resolves integralement cote serveur. L'impact tranche l'issue immediatement: pertes, retraite, pillage et rapport d'inbox.",
              "Resource-field combat is resolved fully server-side. Impact resolves the outcome immediately: losses, retreat, looting, and an inbox combat report."
            )}
          </p>
        </header>

        <div className="wiki-note">
          <strong>{l("Regle cle", "Key rule")}</strong>
          <span>
            {l(
              "Une flotte adverse ne peut etre interceptee que pendant l'extraction. L'attaque coupe la recolte au moment de l'impact.",
              "An enemy fleet can only be intercepted while extracting. The attack cuts harvesting at the exact moment of impact."
            )}
          </span>
        </div>

        <div className="wiki-info-grid">
          <article className="wiki-info-card">
            <strong>{l("Resolution serveur", "Server resolution")}</strong>
            <span>
              {l(
                "Le client n'envoie jamais les pertes ni le butin. Le serveur recalcule la flotte d'attaque, la flotte defenseuse et applique les pertes au hangar des deux joueurs.",
                "The client never sends losses or loot. The server recalculates the attacking fleet, the defending fleet, and applies losses to both hangars."
              )}
            </span>
          </article>
          <article className="wiki-info-card">
            <strong>{l("Statistiques prises en compte", "Stats considered")}</strong>
            <span>
              {l(
                "Force, endurance, vitesse, capacite de pillage et role tactique de chaque unite. Le moteur gere deja vaisseaux + defenses, meme si les champs utilisent aujourd'hui surtout des vaisseaux.",
                "Force, endurance, speed, loot capacity, and tactical role for each unit. The engine already supports ships + defenses, even if fields currently use ships most of the time."
              )}
            </span>
          </article>
          <article className="wiki-info-card">
            <strong>{l("Rapport a l'impact", "Impact report")}</strong>
            <span>
              {l(
                "Attaquant et defenseur recoivent immediatement un rapport complet dans Inbox: lieu, issue, pertes, survivants, cargo protege et butin.",
                "Attacker and defender immediately receive a full inbox report: location, outcome, losses, survivors, protected cargo, and loot."
              )}
            </span>
          </article>
        </div>

        <h4>{l("Sequence d'un combat sur champ", "Resource-field combat sequence")}</h4>
        <div className="wiki-table-wrap">
          <table className="wiki-table">
            <thead>
              <tr>
                <th>{l("Etape", "Step")}</th>
                <th>{l("Ce qui se passe", "What happens")}</th>
                <th>{l("Effet gameplay", "Gameplay effect")}</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>{l("1. Verrouillage de cible", "1. Target lock")}</td>
                <td>{l("Le champ doit etre occupe par une flotte en extraction, pas simplement en trajet.", "The field must be occupied by a fleet currently extracting, not just travelling.")}</td>
                <td>{l("Pas d'attaque fantome sur une flotte absente.", "No ghost attack on an absent fleet.")}</td>
              </tr>
              <tr>
                <td>{l("2. Gel du cargo", "2. Cargo snapshot")}</td>
                <td>{l("Le serveur calcule exactement ce qui a deja ete recolte au moment de l'impact.", "The server calculates exactly what has already been harvested at the moment of impact.")}</td>
                <td>{l("Les gains partiels deviennent un enjeu reel.", "Partial gains become a real stake.")}</td>
              </tr>
              <tr>
                <td>{l("3. Rounds de combat", "3. Combat rounds")}</td>
                <td>{l("Le moteur simule plusieurs rounds d'echange de degats et enregistre les pertes des deux camps.", "The engine simulates multiple damage-exchange rounds and records both sides' losses.")}</td>
                <td>{l("Une flotte fragile peut gagner si son alpha strike suffit.", "A fragile fleet can still win if its alpha strike is enough.")}</td>
              </tr>
              <tr>
                <td>{l("4. Resolution", "4. Resolution")}</td>
                <td>{l("Victoire attaquant, victoire defenseur ou destruction mutuelle.", "Attacker victory, defender victory, or mutual destruction.")}</td>
                <td>{l("La recolte est toujours interrompue a la fin du combat.", "Harvesting is always interrupted once the battle ends.")}</td>
              </tr>
              <tr>
                <td>{l("5. Post-impact", "5. Post-impact")}</td>
                <td>{l("Le champ est libere, la flotte survivante repart ou le butin est applique directement.", "The field is freed, the surviving fleet retreats, or loot is applied directly.")}</td>
                <td>{l("Le tempo carte change instantanement.", "Map tempo changes immediately.")}</td>
              </tr>
            </tbody>
          </table>
        </div>

        <h4>{l("Issues possibles", "Possible outcomes")}</h4>
        <div className="wiki-table-wrap">
          <table className="wiki-table">
            <thead>
              <tr>
                <th>{l("Issue", "Outcome")}</th>
                <th>{l("Attaquant", "Attacker")}</th>
                <th>{l("Defenseur", "Defender")}</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>{l("Victoire offensive", "Offensive victory")}</td>
                <td>{l("Pille une partie du cargo deja extrait selon sa capacite survivante.", "Loots part of the already extracted cargo according to surviving loot capacity.")}</td>
                <td>{l("Flotte de recolte detruite. Le champ est libere.", "Harvest fleet is destroyed. The field is freed.")}</td>
              </tr>
              <tr>
                <td>{l("Defense tient", "Defense holds")}</td>
                <td>{l("Subit des pertes et repart sans gain.", "Takes losses and leaves without loot.")}</td>
                <td>{l("La flotte de recolte rentre avec ce qu'elle avait deja accumule.", "The harvest fleet returns with what it had already accumulated.")}</td>
              </tr>
              <tr>
                <td>{l("Destruction mutuelle", "Mutual destruction")}</td>
                <td>{l("Escadre perdue.", "Fleet destroyed.")}</td>
                <td>{l("Escadre de recolte perdue, aucun retour.", "Harvest fleet destroyed, no return cargo.")}</td>
              </tr>
            </tbody>
          </table>
        </div>

        <article className="wiki-checklist">
          <h4>{l("Conseils tactiques", "Tactical advice")}</h4>
          <ul>
            <li>{l("Interceptez pendant l'extraction, jamais pendant l'aller si vous cherchez a couper un revenu.", "Intercept during extraction, not outbound travel, if your goal is to cut income.")}</li>
            <li>{l("Apportez assez de capacite de pillage si vous voulez monetiser la victoire.", "Bring enough loot capacity if you want to monetize the win.")}</li>
            <li>{l("Une flotte de recolte riche mais lente est une cible prioritaire.", "A slow but rich harvesting fleet is a priority target.")}</li>
            <li>{l("Verifier le rapport de combat dans Inbox apres chaque impact pour ajuster votre doctrine.", "Review every combat report in the inbox after impact to refine your doctrine.")}</li>
          </ul>
        </article>

        <details className="wiki-spoiler">
          <summary>{l("Ce que contient un rapport de combat", "What a combat report contains")}</summary>
          <div className="wiki-faq-list">
            <article className="wiki-faq-item">
              <strong>{l("Lieu & horodatage", "Location & timestamp")}</strong>
              <span>{l("Champ cible, coordonnees et heure exacte de l'impact.", "Target field, coordinates, and exact impact time.")}</span>
            </article>
            <article className="wiki-faq-item">
              <strong>{l("Composition initiale", "Initial composition")}</strong>
              <span>{l("Vaisseaux engages par chaque camp avant l'echange de tirs.", "Ships committed by each side before the exchange of fire.")}</span>
            </article>
            <article className="wiki-faq-item">
              <strong>{l("Survivants & pertes", "Survivors & losses")}</strong>
              <span>{l("Unites restantes, unites detruites et bilan round par round.", "Remaining units, destroyed units, and round-by-round breakdown.")}</span>
            </article>
            <article className="wiki-faq-item">
              <strong>{l("Cargo protege / pille", "Protected / looted cargo")}</strong>
              <span>{l("Ce que le defenseur a sauve ou ce que l'attaquant a reussi a extraire du raid.", "What the defender saved or what the attacker managed to loot from the raid.")}</span>
            </article>
          </div>
        </details>
      </section>

      <section id="wiki-alliance" className="wiki-section">
        <header className="wiki-section-head">
          <h3>{l("8. Alliances & Coordination", "8. Alliances & coordination")}</h3>
          <p>
            {l(
              "La page Alliance est un centre de commandement cooperatif: recrutement, progression collective, operations, gouvernance et pilotage du Nexus commun.",
              "The Alliance page is a cooperative command center: recruitment, shared progression, operations, governance, and control of the shared Nexus."
            )}
          </p>
        </header>

        <div className="wiki-note">
          <strong>{l("Structure", "Structure")}</strong>
          <span>
            {l(
              "50 membres max, 1 chef, jusqu'a 3 sous-chefs, progression collective par investissements, recherches et quetes.",
              "50 members max, 1 leader, up to 3 officers, with collective progression through investments, research, and quests."
            )}
          </span>
        </div>

        <h4>{l("Roles & droits", "Roles & permissions")}</h4>
        <div className="wiki-table-wrap">
          <table className="wiki-table">
            <thead>
              <tr>
                <th>{l("Role", "Role")}</th>
                <th>{l("Pouvoirs principaux", "Main powers")}</th>
                <th>{l("Usage ideal", "Best use")}</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>{l("Chef", "Leader")}</td>
                <td>{l("Controle total: promotion, exclusion, transfert du commandement, votes, quetes, tech, parametres.", "Full control: promotions, kicks, leadership transfer, votes, quests, tech, settings.")}</td>
                <td>{l("Fixer la doctrine et arbitrer les decisions strategiques.", "Set doctrine and arbitrate strategic decisions.")}</td>
              </tr>
              <tr>
                <td>{l("Sous-chef", "Officer")}</td>
                <td>{l("Gere quetes, recrutement, operations et soutien de progression.", "Handles quests, recruitment, operations, and progression support.")}</td>
                <td>{l("Relayer le commandement sur des plages horaires differentes.", "Relay command across different time windows.")}</td>
              </tr>
              <tr>
                <td>{l("Membre", "Member")}</td>
                <td>{l("Investit, contribue a la recherche, suit les operations, participe aux votes et quetes.", "Invests, funds research, follows operations, and participates in votes and quests.")}</td>
                <td>{l("Executer rapidement les priorites et alimenter la progression commune.", "Execute priorities quickly and feed shared progression.")}</td>
              </tr>
            </tbody>
          </table>
        </div>

        <h4>{l("Tout ce que permet la page Alliance", "Everything the Alliance page allows")}</h4>
        <div className="wiki-table-wrap">
          <table className="wiki-table">
            <thead>
              <tr>
                <th>{l("Zone", "Area")}</th>
                <th>{l("Ce que vous pouvez faire", "What you can do")}</th>
                <th>{l("Interet strategique", "Strategic value")}</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>{l("Mon alliance", "My alliance")}</td>
                <td>{l("Voir la situation globale, les membres, le rang, le niveau Nexus et les alertes de pilotage.", "See global status, members, rank, Nexus level, and command alerts.")}</td>
                <td>{l("Donne une lecture immediate de l'etat de la coalition.", "Provides an immediate reading of coalition health.")}</td>
              </tr>
              <tr>
                <td>{l("Repertoire", "Directory")}</td>
                <td>{l("Chercher une alliance, consulter son profil public, postuler ou accepter/refuser une invitation.", "Search alliances, inspect public profiles, apply, or accept/decline invitations.")}</td>
                <td>{l("Permet de recruter proprement et de comparer les coalitions.", "Supports clean recruitment and coalition comparison.")}</td>
              </tr>
              <tr>
                <td>{l("Vue d'ensemble", "Overview")}</td>
                <td>{l("Lire les KPIs, le rang, les points de guerre, la production, les contributeurs et les conseils de pilotage.", "Read KPIs, rank, war points, production, top contributors, and command advice.")}</td>
                <td>{l("Permet au chef de savoir quoi corriger en priorite.", "Lets leadership know what to fix first.")}</td>
              </tr>
              <tr>
                <td>{l("Nexus commun", "Shared Nexus")}</td>
                <td>{l("Investir des ressources dans la megastructure d'alliance et faire monter le niveau collectif.", "Invest resources in the alliance megastructure and level it up collectively.")}</td>
                <td>{l("Debloque des paliers de puissance et de prestige a long terme.", "Unlocks long-term power and prestige thresholds.")}</td>
              </tr>
              <tr>
                <td>{l("Arbre techno", "Tech tree")}</td>
                <td>{l("Financer cinq branches: logistique, industrie, militaire, exploration et diplomatie.", "Fund five branches: logistics, industry, military, exploration, and diplomacy.")}</td>
                <td>{l("Oriente le profil de l'alliance selon son plan de jeu.", "Shapes the alliance profile around its game plan.")}</td>
              </tr>
              <tr>
                <td>{l("Quetes coop", "Co-op quests")}</td>
                <td>{l("Suivre des objectifs collectifs puis distribuer la recompense a tous les membres.", "Track shared objectives then distribute the reward to all members.")}</td>
                <td>{l("Excellent moteur d'activite et de cohesion.", "Excellent driver of activity and cohesion.")}</td>
              </tr>
              <tr>
                <td>{l("Operations", "Operations")}</td>
                <td>{l("Publier des ordres d'assaut, defense, collecte ou logistique avec cible, note et horaire.", "Publish attack, defense, harvest, or logistics orders with target, note, and schedule.")}</td>
                <td>{l("Transforme l'alliance en etat-major plutot qu'en simple chat.", "Turns the alliance into a staff command center rather than a simple chat.")}</td>
              </tr>
              <tr>
                <td>{l("Votes", "Votes")}</td>
                <td>{l("Lancer des votes de guerre, doctrine, quete majeure ou investissement critique.", "Launch war, doctrine, major quest, or critical investment votes.")}</td>
                <td>{l("Cadre les decisions importantes sans improvisation.", "Frames major decisions without improvisation.")}</td>
              </tr>
              <tr>
                <td>{l("Membres", "Members")}</td>
                <td>{l("Promouvoir, retrograder, exclure, transferer le commandement, traiter les candidatures et invitations.", "Promote, demote, kick, transfer leadership, and manage applications and invites.")}</td>
                <td>{l("Assure une gouvernance claire et scalable.", "Maintains clear, scalable governance.")}</td>
              </tr>
              <tr>
                <td>{l("Journal", "Log")}</td>
                <td>{l("Suivre les investissements, recherches, arrivées, votes, operations et changements de roster.", "Track investments, research, joins, votes, operations, and roster changes.")}</td>
                <td>{l("Offre une memoire strategique de l'alliance.", "Provides strategic memory for the alliance.")}</td>
              </tr>
              <tr>
                <td>{l("Parametres", "Settings")}</td>
                <td>{l("Changer devise, description, logo et ouverture au recrutement.", "Change motto, description, logo, and recruitment status.")}</td>
                <td>{l("Controle l'identite publique et la qualite du recrutement.", "Controls public identity and recruitment quality.")}</td>
              </tr>
            </tbody>
          </table>
        </div>

        <article className="wiki-checklist">
          <h4>{l("Boucle de progression recommandee", "Recommended progression loop")}</h4>
          <ul>
            <li>{l("1) Recruter jusqu'a remplir un noyau actif avant de viser le cap 50.", "1) Recruit an active core before chasing the 50-member cap.")}</li>
            <li>{l("2) Ouvrir Industrie ou Logistique en premier selon votre style de carte.", "2) Open Industry or Logistics first depending on your map style.")}</li>
            <li>{l("3) Faire tourner en continu le Nexus commun avec des contributions modestes mais frequentes.", "3) Keep the shared Nexus moving with modest but frequent contributions.")}</li>
            <li>{l("4) Maintenir un tableau d'operations vivant pour la carte et le PvP.", "4) Keep the operations board alive for map play and PvP.")}</li>
            <li>{l("5) Utiliser les votes pour les decisions majeures, pas pour la micro-gestion.", "5) Use votes for major decisions, not micro-management.")}</li>
          </ul>
        </article>

        <details className="wiki-spoiler">
          <summary>{l("Conseils de commandement d'alliance", "Alliance command tips")}</summary>
          <div className="wiki-faq-list">
            <article className="wiki-faq-item">
              <strong>{l("Chef trop seul = progression lente", "Leader alone = slow progress")}</strong>
              <span>{l("Nommez vite 1 a 3 sous-chefs pour couvrir recrutement, quetes et operations sur plusieurs plages horaires.", "Promote 1 to 3 officers early to cover recruitment, quests, and operations across multiple time windows.")}</span>
            </article>
            <article className="wiki-faq-item">
              <strong>{l("Le Nexus doit tourner en continu", "The Nexus must keep moving")}</strong>
              <span>{l("Un petit investissement quotidien de tous les membres vaut souvent mieux qu'un gros effort ponctuel.", "Small daily investments from everyone are usually better than one large sporadic effort.")}</span>
            </article>
            <article className="wiki-faq-item">
              <strong>{l("Les operations remplacent le flou", "Operations replace ambiguity")}</strong>
              <span>{l("Une cible, un horaire et une note tactique reduisent enormement les erreurs de coordination.", "A target, schedule, and tactical note drastically reduce coordination mistakes.")}</span>
            </article>
            <article className="wiki-faq-item">
              <strong>{l("Le repertoire sert aussi au renseignement", "The directory is also intel")}</strong>
              <span>{l("Comparer niveau, recrutement, doctrine publique et rythme de progression aide a situer vos rivaux et partenaires.", "Comparing level, recruitment, public doctrine, and progression pace helps place rivals and partners.")}</span>
            </article>
          </div>
        </details>
      </section>

      <section id="wiki-inbox" className="wiki-section">
        <header className="wiki-section-head">
          <h3>{l("9. Messagerie & Recompenses", "9. Inbox & Rewards")}</h3>
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

