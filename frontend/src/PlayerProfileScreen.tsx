import {
  ArrowLeft,
  Compass,
  Factory,
  FlaskConical,
  Medal,
  Orbit,
  Shield,
  Swords,
  Users
} from "lucide-react";

export type UILanguage = "fr" | "en";

export type PublicPlayerProfileView = {
  player: {
    userId: string;
    username: string;
    displayName: string;
    avatarUrl: string;
    createdAt: string;
  };
  commander: {
    commanderId: string;
    avatarUrl: string;
  };
  position: {
    x: number;
    y: number;
  };
  scores: {
    total: number;
    economy: number;
    research: number;
    military: number;
  };
  ranks: {
    total: number;
    economy: number;
    research: number;
    military: number;
  };
  stats: {
    productionPerHour: number;
    shipCount: number;
    defenseCount: number;
    storageCapacity: number;
    builtModules: number;
    totalBuildingLevels: number;
    activeConstruction: boolean;
    activeResearch: boolean;
  };
  alliance: null | {
    id: string;
    name: string;
    tag: string;
    memberCount: number;
    bastionLevel: number;
    techLevels: number;
    isRecruiting: boolean;
    pointsTotal: number;
    pointsEconomy: number;
    pointsResearch: number;
    pointsMilitary: number;
  };
};

type Props = {
  language: UILanguage;
  loading: boolean;
  error: string;
  profile: PublicPlayerProfileView | null;
  onBack: () => void;
  onOpenMap: (target: { userId: string; username: string; x: number; y: number }) => void;
};

const formatDisplayedScoreLabel = (rawScore: number) => {
  const safe = Math.max(0, Number(rawScore || 0)) / 50000;
  if (safe <= 0) return "0";
  return safe.toLocaleString(undefined, {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  });
};

const formatInteger = (raw: number) =>
  Math.max(0, Math.floor(Number(raw || 0))).toLocaleString();

const DEFAULT_PUBLIC_PROFILE_AVATAR = "/room-images/commandant1.png";

export default function PlayerProfileScreen({
  language,
  loading,
  error,
  profile,
  onBack,
  onOpenMap
}: Props) {
  const l = (fr: string, en: string) => (language === "en" ? en : fr);
  const avatarSrc = profile ? (profile.commander.avatarUrl || profile.player.avatarUrl || DEFAULT_PUBLIC_PROFILE_AVATAR) : DEFAULT_PUBLIC_PROFILE_AVATAR;
  const handleOpenMap = () => {
    if (!profile) return;
    onOpenMap({
      userId: profile.player.userId,
      username: profile.player.username,
      x: profile.position.x,
      y: profile.position.y
    });
  };

  const scoreCards = profile
    ? [
        { key: "total", label: l("Global", "Global"), value: profile.scores.total, rank: profile.ranks.total, icon: Medal },
        { key: "economy", label: l("Batiments", "Buildings"), value: profile.scores.economy, rank: profile.ranks.economy, icon: Factory },
        { key: "research", label: l("Technologie", "Technology"), value: profile.scores.research, rank: profile.ranks.research, icon: FlaskConical },
        { key: "military", label: l("Militaire", "Military"), value: profile.scores.military, rank: profile.ranks.military, icon: Swords }
      ]
    : [];

  return (
    <main className="player-profile-shell">
      <section className="player-profile-hero">
        <button type="button" className="player-profile-back" onClick={onBack}>
          <ArrowLeft size={16} />
          <span>{l("Retour au classement", "Back to ranking")}</span>
        </button>

        {profile ? (
          <div className="player-profile-hero-main">
            <div className="player-profile-avatar-wrap">
              <img
                className="player-profile-avatar"
                src={avatarSrc}
                alt={profile.player.username}
              />
            </div>

            <div className="player-profile-hero-copy">
              <small>{l("Dossier commandant", "Commander dossier")}</small>
              <h2>{profile.player.displayName || profile.player.username}</h2>
              <div className="player-profile-subline">
                <span>@{profile.player.username}</span>
                <span>{l("Profil", "Profile")}: {profile.player.userId.slice(0, 10)}</span>
                <button type="button" className="player-profile-map-link player-profile-map-link-inline" onClick={handleOpenMap}>
                  <span>{l("Carte", "Map")}</span>
                  <b>{profile.position.x} / {profile.position.y}</b>
                </button>
              </div>
              {profile.alliance ? (
                <div className="player-profile-alliance-chip">
                  <Users size={14} />
                  <span>
                    {profile.alliance.tag ? `[${profile.alliance.tag}] ` : ""}
                    {profile.alliance.name}
                  </span>
                </div>
              ) : (
                <div className="player-profile-alliance-chip empty">
                  <Users size={14} />
                  <span>{l("Sans alliance", "No alliance")}</span>
                </div>
              )}
            </div>
          </div>
        ) : (
          <div className="player-profile-hero-main">
            <div className="player-profile-hero-copy">
              <small>{l("Dossier commandant", "Commander dossier")}</small>
              <h2>{loading ? l("Chargement...", "Loading...") : l("Profil joueur", "Player profile")}</h2>
            </div>
          </div>
        )}
      </section>

      {error ? <p className="player-profile-error">{error}</p> : null}

      {loading && !profile ? (
        <section className="player-profile-grid">
          <article className="player-profile-card">
            <strong>{l("Chargement du dossier joueur...", "Loading player dossier...")}</strong>
          </article>
        </section>
      ) : null}

      {profile ? (
        <>
          <section className="player-profile-score-grid">
            {scoreCards.map((card) => {
              const Icon = card.icon;
              return (
                <article key={card.key} className="player-profile-score-card">
                  <div className="player-profile-score-head">
                    <span className="player-profile-score-icon">
                      <Icon size={16} />
                    </span>
                    <small>{card.label}</small>
                  </div>
                  <strong>{formatDisplayedScoreLabel(card.value)}</strong>
                  <span>{l("Rang", "Rank")}: {card.rank > 0 ? `#${card.rank}` : "-"}</span>
                </article>
              );
            })}
          </section>

          <section className="player-profile-grid">
            <article className="player-profile-card">
              <header>
                <span className="player-profile-card-icon">
                  <Compass size={16} />
                </span>
                <div>
                  <strong>{l("Position & activite", "Position & activity")}</strong>
                  <small>{l("Lecture publique de l'hyperstructure", "Public hyperstructure overview")}</small>
                </div>
              </header>
              <div className="player-profile-stat-grid">
                <button type="button" className="player-profile-map-link" onClick={handleOpenMap}>
                  <small>{l("Coordonnees carte", "Map coordinates")}</small>
                  <b>{profile.position.x} / {profile.position.y}</b>
                </button>
                <div>
                  <small>{l("Chantier actif", "Active construction")}</small>
                  <b>{profile.stats.activeConstruction ? l("Oui", "Yes") : l("Non", "No")}</b>
                </div>
                <div>
                  <small>{l("Recherche active", "Active research")}</small>
                  <b>{profile.stats.activeResearch ? l("Oui", "Yes") : l("Non", "No")}</b>
                </div>
                <div>
                  <small>{l("Compte cree", "Account created")}</small>
                  <b>{profile.player.createdAt ? new Date(profile.player.createdAt).toLocaleDateString() : "-"}</b>
                </div>
              </div>
            </article>

            <article className="player-profile-card">
              <header>
                <span className="player-profile-card-icon">
                  <Orbit size={16} />
                </span>
                <div>
                  <strong>{l("Statistiques empire", "Empire statistics")}</strong>
                  <small>{l("Vision agregee et non detail tactique", "Aggregate view, not tactical detail")}</small>
                </div>
              </header>
              <div className="player-profile-stat-grid">
                <div>
                  <small>{l("Production / h", "Production / h")}</small>
                  <b>{formatInteger(profile.stats.productionPerHour)}</b>
                </div>
                <div>
                  <small>{l("Capacite stockage", "Storage capacity")}</small>
                  <b>{formatInteger(profile.stats.storageCapacity)}</b>
                </div>
                <div>
                  <small>{l("Modules construits", "Built modules")}</small>
                  <b>{formatInteger(profile.stats.builtModules)}</b>
                </div>
                <div>
                  <small>{l("Niveaux cumules", "Combined levels")}</small>
                  <b>{formatInteger(profile.stats.totalBuildingLevels)}</b>
                </div>
                <div>
                  <small>{l("Vaisseaux", "Ships")}</small>
                  <b>{formatInteger(profile.stats.shipCount)}</b>
                </div>
                <div>
                  <small>{l("Defenses", "Defenses")}</small>
                  <b>{formatInteger(profile.stats.defenseCount)}</b>
                </div>
              </div>
            </article>

            <article className="player-profile-card">
              <header>
                <span className="player-profile-card-icon">
                  <Shield size={16} />
                </span>
                <div>
                  <strong>{l("Alliance", "Alliance")}</strong>
                  <small>{l("Position diplomatique du joueur", "Player diplomatic position")}</small>
                </div>
              </header>

              {profile.alliance ? (
                <div className="player-profile-alliance-panel">
                  <div className="player-profile-alliance-title">
                    <strong>
                      {profile.alliance.tag ? `[${profile.alliance.tag}] ` : ""}
                      {profile.alliance.name}
                    </strong>
                    <span>{profile.alliance.isRecruiting ? l("Recrute", "Recruiting") : l("Fermee", "Closed")}</span>
                  </div>
                  <div className="player-profile-stat-grid">
                    <div>
                      <small>{l("Membres", "Members")}</small>
                      <b>{formatInteger(profile.alliance.memberCount)}</b>
                    </div>
                    <div>
                      <small>{l("Niveau Nexus", "Nexus level")}</small>
                      <b>{formatInteger(profile.alliance.bastionLevel)}</b>
                    </div>
                    <div>
                      <small>{l("Technologies", "Technologies")}</small>
                      <b>{formatInteger(profile.alliance.techLevels)}</b>
                    </div>
                    <div>
                      <small>{l("Score alliance", "Alliance score")}</small>
                      <b>{formatDisplayedScoreLabel(profile.alliance.pointsTotal)}</b>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="player-profile-empty-card">
                  <Users size={18} />
                  <span>{l("Ce joueur n'appartient a aucune alliance.", "This player does not belong to any alliance.")}</span>
                </div>
              )}
            </article>
          </section>
        </>
      ) : null}
    </main>
  );
}
