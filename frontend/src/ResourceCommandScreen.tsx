import {
  Activity,
  ArrowRight,
  BookOpen,
  Boxes,
  Coins,
  FlaskConical,
  Gauge,
  Layers3,
  Lock,
  ShieldAlert,
  Sparkles,
  Wrench,
  Zap
} from "lucide-react";
import { useMemo, useState } from "react";

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
type ResourceNavScreen = "game" | "resources" | "technology" | "population";
type ResourceSection = "construction" | "research";

type ResourceTechBonusRow = {
  techId: string;
  name: string;
  level: number;
  bonusPercent: number;
};

type ResourceImpactRow = {
  id: string;
  kind: "bonus" | "malus";
  label: string;
};

type ResourceCardRow = {
  id: ResourceId;
  name: string;
  machine: string;
  section: ResourceSection;
  rarity: number;
  unlocked: boolean;
  amount: number;
  rate: number;
  techBonuses: ResourceTechBonusRow[];
};

type ResourceCommandScreenProps = {
  language: UILanguage;
  loading: boolean;
  error: string;
  offlineSeconds: number;
  lastSavedAt: number | null;
  totalPerSecond: number;
  constructionPerSecond: number;
  researchPerSecond: number;
  unlockedCount: number;
  totalCount: number;
  impactRows: ResourceImpactRow[];
  constructionRows: ResourceCardRow[];
  researchRows: ResourceCardRow[];
  onNavigate: (screen: ResourceNavScreen) => void;
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

export default function ResourceCommandScreen({
  language,
  loading,
  error,
  offlineSeconds,
  lastSavedAt,
  totalPerSecond,
  constructionPerSecond,
  researchPerSecond,
  unlockedCount,
  totalCount,
  impactRows,
  constructionRows,
  researchRows,
  onNavigate
}: ResourceCommandScreenProps) {
  const l = (fr: string, en: string) => (language === "en" ? en : fr);
  const [tab, setTab] = useState<ResourceSection>("construction");
  const visibleRows = tab === "construction" ? constructionRows : researchRows;
  const positiveImpacts = impactRows.filter((row) => row.kind === "bonus");
  const negativeImpacts = impactRows.filter((row) => row.kind === "malus");

  const strongestRows = useMemo(
    () =>
      [...constructionRows, ...researchRows]
        .filter((row) => row.unlocked)
        .sort((a, b) => (b.rate || 0) - (a.rate || 0))
        .slice(0, 3),
    [constructionRows, researchRows]
  );

  const economyState =
    negativeImpacts.length >= 3
      ? l("Sous penalites", "Under penalties")
      : totalPerSecond > 0 && positiveImpacts.length >= negativeImpacts.length
        ? l("Extraction stable", "Stable extraction")
        : l("A surveiller", "Monitor closely");

  const tabMeta: Record<ResourceSection, { title: string; summary: string }> = {
    construction: {
      title: l("Base industrielle", "Industrial base"),
      summary: l(
        "Ces ressources font tourner les constructions, le hangar et l'ossature de ton economie.",
        "These resources sustain construction, the hangar and the backbone of your economy."
      )
    },
    research: {
      title: l("Haute technologie", "High technology"),
      summary: l(
        "Ces ressources arrivent plus tard et servent a pousser la recherche, les paliers lourds et les investissements de specialisation.",
        "These resources arrive later and support research, heavy tiers and specialization investments."
      )
    }
  };

  return (
    <main className="resource-v2-shell">
      <section className="resource-v2-hero">
        <div className="resource-v2-hero-copy">
          <span className="resource-v2-eyebrow">{l("Tableau industriel", "Industrial board")}</span>
          <h2>{l("Commandement des ressources", "Resource command")}</h2>
          <p>
            {l(
              "Lis rapidement ce qui produit, ce qui freine ton economie et quelle ressource merite le prochain investissement. La page est organisee pour separer clairement la base industrielle et la haute technologie.",
              "Read quickly what produces, what slows your economy and which resource deserves the next upgrade. The page is organized to clearly separate the industrial base and high technology."
            )}
          </p>
          <div className="resource-v2-action-row">
            <button type="button" onClick={() => onNavigate("game")}>
              <Wrench size={15} />
              <span>{l("Retour Jeu", "Back to Game")}</span>
            </button>
            <button type="button" onClick={() => onNavigate("technology")}>
              <BookOpen size={15} />
              <span>{l("Ouvrir Technologie", "Open Technology")}</span>
            </button>
            <button type="button" onClick={() => onNavigate("population")}>
              <ShieldAlert size={15} />
              <span>{l("Voir Population", "Open Population")}</span>
            </button>
          </div>
        </div>

        <div className="resource-v2-hero-side">
          <article className="resource-v2-state-card">
            <small>{l("Etat general", "Overall state")}</small>
            <strong>{economyState}</strong>
            <span>{l("Ressources debloquees", "Unlocked resources")}: {unlockedCount} / {totalCount}</span>
            <p>
              {l("Derniere sauvegarde", "Last save")}:{" "}
              <b>{lastSavedAt ? new Date(lastSavedAt).toLocaleTimeString() : l("En attente", "Pending")}</b>
            </p>
          </article>
          <article className="resource-v2-state-card accent">
            <small>{l("Simulation hors ligne", "Offline simulation")}</small>
            <strong>{offlineSeconds > 0 ? `+${offlineSeconds}s` : l("Aucune", "None")}</strong>
            <p>
              {l(
                "Les stocks se resynchronisent avec ton dernier etat connu. Ce bloc te dit surtout si une reprise de session vient de recalculer ta production.",
                "Stocks are resynced from your last known state. This block mainly tells you whether a session resume just recalculated your production."
              )}
            </p>
          </article>
        </div>
      </section>

      <section className="resource-v2-kpis">
        <article className="resource-v2-kpi total">
          <small>{l("Production totale", "Total production")}</small>
          <strong>{totalPerSecond.toFixed(2)} / s</strong>
          <span>{l("Cadence globale en direct", "Live global cadence")}</span>
        </article>
        <article className="resource-v2-kpi">
          <small>{l("Base industrielle", "Industrial base")}</small>
          <strong>{constructionPerSecond.toFixed(2)} / s</strong>
          <span>{l("Construction et economie", "Construction and economy")}</span>
        </article>
        <article className="resource-v2-kpi">
          <small>{l("Haute technologie", "High technology")}</small>
          <strong>{researchPerSecond.toFixed(2)} / s</strong>
          <span>{l("Recherche et paliers rares", "Research and rare tiers")}</span>
        </article>
        <article className="resource-v2-kpi">
          <small>{l("Ressources ouvertes", "Open resources")}</small>
          <strong>{unlockedCount}</strong>
          <span>{l("sur", "out of")} {totalCount}</span>
        </article>
      </section>

      <div className="resource-v2-layout">
        <div className="resource-v2-main">
          <section className="resource-v2-panel">
            <div className="resource-v2-panel-head">
              <strong>{l("Lecture des sections", "Section overview")}</strong>
              <span>{l("Navigation rapide", "Quick navigation")}</span>
            </div>
            <div className="resource-v2-tabrow">
              <button type="button" className={tab === "construction" ? "active" : ""} onClick={() => setTab("construction")}>
                <Boxes size={15} />
                <span>{l("Base industrielle", "Industrial base")}</span>
              </button>
              <button type="button" className={tab === "research" ? "active" : ""} onClick={() => setTab("research")}>
                <FlaskConical size={15} />
                <span>{l("Haute technologie", "High technology")}</span>
              </button>
            </div>
            <div className="resource-v2-tab-brief">
              <strong>{tabMeta[tab].title}</strong>
              <p>{tabMeta[tab].summary}</p>
            </div>
          </section>

          {loading ? <p className="resource-v2-state">{l("Chargement des ressources...", "Loading resources...")}</p> : null}
          {error ? <p className="resource-v2-error">{error}</p> : null}

          <section className="resource-v2-grid">
            {visibleRows.map((row) => (
              <article key={row.id} className={`resource-v2-card ${row.unlocked ? "unlocked" : "locked"}`}>
                <div className="resource-v2-card-bg" />
                <header>
                  <div className="resource-v2-heading">
                    <img src={RESOURCE_IMAGE_MAP[row.id]} alt="" aria-hidden="true" />
                    <div>
                      <small>{row.machine}</small>
                      <strong>{row.name}</strong>
                    </div>
                  </div>
                  <span className="resource-v2-rarity">R{row.rarity}</span>
                </header>

                {row.unlocked ? (
                  <>
                    <div className="resource-v2-values">
                      <div>
                        <small>{l("Stock", "Stock")}</small>
                        <strong>{Math.floor(row.amount).toLocaleString()}</strong>
                      </div>
                      <div>
                        <small>{l("Production", "Production")}</small>
                        <strong>+{row.rate.toFixed(2)} / s</strong>
                      </div>
                    </div>

                    {row.techBonuses.length > 0 ? (
                      <div className="resource-v2-bonus-row">
                        {row.techBonuses.map((bonus) => (
                          <span key={`${row.id}_${bonus.techId}`} className="resource-v2-bonus-chip">
                            <Sparkles size={12} />
                            <b>{bonus.name}</b>
                            <span>Lv.{bonus.level}</span>
                            <em>+{bonus.bonusPercent.toFixed(1)}%</em>
                          </span>
                        ))}
                      </div>
                    ) : (
                      <p className="resource-v2-muted">{l("Aucun bonus techno actif.", "No active tech bonus.")}</p>
                    )}

                    <details className="resource-v2-details">
                      <summary>{l("Analyse de ressource", "Resource analysis")}</summary>
                      <div className="resource-v2-details-body">
                        <div>
                          <small>{l("Role", "Role")}</small>
                          <p>
                            {tab === "construction"
                              ? l(
                                  "Cette ressource soutient directement la construction, le hangar et le rythme economique global.",
                                  "This resource directly supports construction, the hangar and your global economic tempo."
                                )
                              : l(
                                  "Cette ressource sert surtout aux technologies, paliers rares et investissements de specialisation.",
                                  "This resource mostly supports technologies, rare tiers and specialization investments."
                                )}
                          </p>
                        </div>
                        <div>
                          <small>{l("Machine source", "Source structure")}</small>
                          <p>{row.machine}</p>
                        </div>
                        <div>
                          <small>{l("Diagnostic", "Diagnostic")}</small>
                          <p>
                            {row.rate > 0
                              ? l("La ligne produit correctement. Priorise-la seulement si ton rythme de depense la depasse.", "This line produces correctly. Prioritize it only if spending outpaces it.")
                              : l("Cette ressource est debloquee mais ne produit pas encore. Verifie tes batiments, files et modificateurs.", "This resource is unlocked but not producing yet. Check your buildings, queues and modifiers.")}
                          </p>
                        </div>
                      </div>
                    </details>
                  </>
                ) : (
                  <div className="resource-v2-locked-box">
                    <Lock size={15} />
                    <div>
                      <strong>{l("Verrouillee", "Locked")}</strong>
                      <p>{l("Debloque cette ressource via la progression technologique et tes batiments avances.", "Unlock this resource through technology progression and advanced structures.")}</p>
                    </div>
                  </div>
                )}
              </article>
            ))}
          </section>
        </div>

        <aside className="resource-v2-sidebar">
          <section className="resource-v2-sidecard">
            <div className="resource-v2-panel-head compact">
              <strong>{l("Modificateurs globaux", "Global modifiers")}</strong>
              <span>{l("Impact direct", "Direct impact")}</span>
            </div>
            {impactRows.length <= 0 ? (
              <p className="resource-v2-muted">{l("Aucun bonus ou malus significatif actif.", "No significant bonus or penalty is active.")}</p>
            ) : (
              <ul className="resource-v2-impact-list">
                {impactRows.map((row) => (
                  <li key={row.id} className={row.kind}>
                    <Activity size={14} />
                    <span>{row.label}</span>
                  </li>
                ))}
              </ul>
            )}
          </section>

          <section className="resource-v2-sidecard">
            <div className="resource-v2-panel-head compact">
              <strong>{l("Lignes fortes", "Strongest lines")}</strong>
              <span>{l("Priorite naturelle", "Natural priority")}</span>
            </div>
            <div className="resource-v2-strong-list">
              {strongestRows.map((row) => (
                <div key={`strong_${row.id}`} className="resource-v2-strong-item">
                  <img src={RESOURCE_IMAGE_MAP[row.id]} alt="" aria-hidden="true" />
                  <div>
                    <strong>{row.name}</strong>
                    <span>{row.machine}</span>
                  </div>
                  <b>+{row.rate.toFixed(2)}/s</b>
                </div>
              ))}
            </div>
          </section>

          <section className="resource-v2-sidecard">
            <div className="resource-v2-panel-head compact">
              <strong>{l("Routines conseillees", "Recommended routines")}</strong>
              <span>{l("Memo", "Memo")}</span>
            </div>
            <div className="resource-v2-doctrine">
              <p><Gauge size={14} /> <span>{l("Ne pousse la haute technologie que lorsque ta base industrielle tient deja le rythme.", "Push high technology only once your industrial base already holds the pace.")}</span></p>
              <p><Coins size={14} /> <span>{l("Si plusieurs malus rouges s'accumulent, traite d'abord population et stabilite avant d'ouvrir de nouvelles lignes.", "If several red penalties stack up, fix population and stability before opening new lines.")}</span></p>
              <p><Zap size={14} /> <span>{l("Une ressource rare qui produit peu n'est pas un probleme si elle n'est pas encore ton goulot d'etranglement.", "A rare resource producing little is not a problem if it is not yet your bottleneck.")}</span></p>
            </div>
          </section>
        </aside>
      </div>
    </main>
  );
}
