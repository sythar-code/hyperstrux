import { Client, Session } from "@heroiclabs/nakama-js";
import {
  AlertTriangle,
  BadgeCheck,
  FileText,
  Gift,
  LayoutDashboard,
  LoaderCircle,
  LogOut,
  Map,
  Megaphone,
  RefreshCw,
  Search,
  Send,
  Shield,
  Users,
  Wrench
} from "lucide-react";
import { FormEvent, useCallback, useEffect, useMemo, useState } from "react";

type AdminTab = "dashboard" | "users" | "system" | "gifts" | "map" | "audit";

type AdminStatus = {
  ok: boolean;
  isAdmin: boolean;
  role: string;
  username: string;
  userId: string;
  bootstrapAvailable: boolean;
};

type AdminUserRow = {
  userId: string;
  username: string;
  displayName: string;
  avatarUrl: string;
  createdAt: string;
  disabledAt: string;
  adminRole: string;
};

type AdminUserDetails = {
  ok: boolean;
  user: AdminUserRow;
  economy: {
    credits: number;
    resources: Record<string, number>;
    buildings: Record<string, { level: number }>;
  };
  inventory: {
    items: Array<{
      id: string;
      name: string;
      category: string;
      quantity: number;
      durationSeconds?: number;
      chestType?: number | string;
    }>;
    totalStacks: number;
    totalUnits: number;
    mapDropNotifications: number;
  };
  profile: Record<string, unknown>;
};

type AdminAuditEntry = {
  id: string;
  actorUserId: string;
  actorUsername: string;
  action: string;
  targetSummary: Record<string, unknown>;
  payloadSummary: Record<string, unknown>;
  reason: string;
  createdAt: number;
};

type AdminMapFieldRow = {
  id: string;
  x: number;
  y: number;
  rarityTier: string;
  qualityTier: string;
  occupiedByPlayerId: string;
  occupiedByUsername: string;
  occupyingFleetId: string;
  expiresAt: number;
};

type AdminOverview = {
  ok: boolean;
  metrics: {
    totalUsers: number;
    disabledUsers: number;
    enabledAdmins: number;
    mapFields: number;
    occupiedFields: number;
    expiredFields: number;
    totalSpawnedFields: number;
    mapUpdatedAt: number;
  };
  recentUsers: AdminUserRow[];
  occupiedFields: AdminMapFieldRow[];
  auditPreview: AdminAuditEntry[];
};

type AdminAuditListResponse = {
  ok: boolean;
  items: AdminAuditEntry[];
  cursor: string;
};

type AdminMapOverview = {
  ok: boolean;
  summary: {
    totalFields: number;
    occupiedFields: number;
    visibleFields: number;
    hiddenFields: number;
    expiredFields: number;
    totalSpawned: number;
    updatedAt: number;
  };
  occupiedFields: AdminMapFieldRow[];
};

type AdminMapMaintenanceResponse = {
  ok: boolean;
  result: {
    usersScanned: number;
    usersTouched: number;
    reportsSettled: number;
    releasedFields: number;
    before: AdminMapOverview["summary"];
    after: AdminMapOverview["summary"];
    occupiedFields: AdminMapFieldRow[];
    errors: Array<{ userId: string; username: string; message: string }>;
  };
};

type GiftItemRow = {
  itemId: string;
  quantity: number;
};

const AUTH_SESSION_KEY = "hyperstrux_admin_session_v1";
const RESOURCE_IDS = [
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
] as const;

const RESOURCE_LABELS: Record<(typeof RESOURCE_IDS)[number], string> = {
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

const ITEM_OPTIONS = [
  { id: "TIME_RIFT_60", label: "Faille Temporelle 1 min" },
  { id: "TIME_RIFT_300", label: "Faille Temporelle 5 min" },
  { id: "TIME_RIFT_3600", label: "Faille Temporelle 1 h" },
  { id: "TIME_RIFT_10800", label: "Faille Temporelle 3 h" },
  { id: "TIME_RIFT_43200", label: "Faille Temporelle 12 h" },
  { id: "RESOURCE_CHEST_CLASSIC", label: "Coffre Classique" },
  { id: "RESOURCE_CHEST_UNCOMMON", label: "Coffre Inhabituel" },
  { id: "RESOURCE_CHEST_RARE", label: "Coffre Rare" },
  { id: "RESOURCE_CHEST_LEGENDARY", label: "Coffre Legendaire" },
  { id: "RESOURCE_CHEST_DIVINE", label: "Coffre Divin" }
];

const TAB_META: Array<{ id: AdminTab; label: string; icon: typeof LayoutDashboard }> = [
  { id: "dashboard", label: "Dashboard", icon: LayoutDashboard },
  { id: "users", label: "Utilisateurs", icon: Users },
  { id: "system", label: "Message systeme", icon: Megaphone },
  { id: "gifts", label: "Cadeaux", icon: Gift },
  { id: "map", label: "Carte & maintenance", icon: Map },
  { id: "audit", label: "Audit", icon: FileText }
];

function getClient() {
  const host = import.meta.env.VITE_NAKAMA_HOST ?? "127.0.0.1";
  const port = import.meta.env.VITE_NAKAMA_PORT ?? "7550";
  const ssl = typeof import.meta.env.VITE_NAKAMA_SSL === "string"
    ? import.meta.env.VITE_NAKAMA_SSL === "true"
    : Boolean(import.meta.env.PROD);
  const serverKey = import.meta.env.VITE_NAKAMA_SERVER_KEY;
  if (!serverKey) throw new Error("Missing VITE_NAKAMA_SERVER_KEY in admin/.env");
  return new Client(serverKey, host, port, ssl, 20000);
}

function saveSession(session: Session) {
  localStorage.setItem(AUTH_SESSION_KEY, JSON.stringify({ token: session.token, refreshToken: session.refresh_token }));
}

function parseRpcPayload<T>(payload: unknown): T {
  if (!payload) return {} as T;
  if (typeof payload === "string") return JSON.parse(payload) as T;
  if (typeof payload === "object") return payload as T;
  return {} as T;
}

function extractErrorMessage(err: unknown) {
  if (typeof err === "string") return err;
  if (err && typeof err === "object") {
    const anyErr = err as { message?: string; error?: string };
    if (anyErr.message) return anyErr.message;
    if (anyErr.error) return anyErr.error;
  }
  return "Erreur inconnue.";
}

function formatDateTime(raw: string) {
  if (!raw) return "-";
  const date = new Date(raw);
  if (Number.isNaN(date.getTime())) return raw;
  return date.toLocaleString("fr-FR");
}

function formatTimestamp(raw: number) {
  if (!raw) return "-";
  return new Date(raw * 1000).toLocaleString("fr-FR");
}

function formatCount(value: number) {
  return Number(value || 0).toLocaleString("fr-FR");
}

function formatSummaryValue(value: unknown) {
  if (value === null || value === undefined || value === "") return "-";
  if (typeof value === "number") return Number.isFinite(value) ? value.toLocaleString("fr-FR") : String(value);
  if (typeof value === "boolean") return value ? "oui" : "non";
  if (Array.isArray(value)) return value.length ? JSON.stringify(value) : "-";
  if (typeof value === "object") return JSON.stringify(value);
  return String(value);
}

function getSummaryEntries(value: unknown) {
  if (!value || typeof value !== "object" || Array.isArray(value)) return [];
  return Object.entries(value as Record<string, unknown>);
}

function AuditSummary({ value }: { value: unknown }) {
  const entries = getSummaryEntries(value);
  if (entries.length === 0) return <span className="audit-summary-empty">-</span>;
  return (
    <div className="audit-summary-list">
      {entries.map(([key, entry]) => (
        <div key={key} className="audit-summary-row">
          <span className="audit-summary-key">{key}</span>
          <code className="audit-summary-value">{formatSummaryValue(entry)}</code>
        </div>
      ))}
    </div>
  );
}

export default function App() {
  const client = useMemo(() => getClient(), []);
  const [session, setSession] = useState<Session | null>(null);
  const [authChecking, setAuthChecking] = useState(true);
  const [authLoading, setAuthLoading] = useState(false);
  const [authError, setAuthError] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [adminStatus, setAdminStatus] = useState<AdminStatus | null>(null);
  const [adminLoading, setAdminLoading] = useState(false);
  const [adminError, setAdminError] = useState("");
  const [activeTab, setActiveTab] = useState<AdminTab>("dashboard");

  const [overview, setOverview] = useState<AdminOverview | null>(null);
  const [overviewLoading, setOverviewLoading] = useState(false);
  const [overviewError, setOverviewError] = useState("");

  const [auditData, setAuditData] = useState<AdminAuditListResponse>({ ok: true, items: [], cursor: "" });
  const [auditLoading, setAuditLoading] = useState(false);
  const [auditError, setAuditError] = useState("");

  const [mapOverview, setMapOverview] = useState<AdminMapOverview | null>(null);
  const [mapLoading, setMapLoading] = useState(false);
  const [mapError, setMapError] = useState("");
  const [mapMaintenanceReason, setMapMaintenanceReason] = useState("Maintenance manuelle");
  const [mapMaintenanceLoading, setMapMaintenanceLoading] = useState(false);
  const [mapMaintenanceError, setMapMaintenanceError] = useState("");
  const [mapMaintenanceMessage, setMapMaintenanceMessage] = useState("");
  const [mapMaintenanceResult, setMapMaintenanceResult] = useState<AdminMapMaintenanceResponse["result"] | null>(null);

  const [userSearchInput, setUserSearchInput] = useState("");
  const [userQuery, setUserQuery] = useState("");
  const [users, setUsers] = useState<AdminUserRow[]>([]);
  const [usersLoading, setUsersLoading] = useState(false);
  const [usersError, setUsersError] = useState("");
  const [selectedUserId, setSelectedUserId] = useState("");
  const [selectedUser, setSelectedUser] = useState<AdminUserDetails | null>(null);
  const [selectedUserLoading, setSelectedUserLoading] = useState(false);
  const [selectedUserError, setSelectedUserError] = useState("");

  const [systemForm, setSystemForm] = useState({
    titleFr: "",
    titleEn: "",
    bodyFr: "",
    bodyEn: "",
    reason: ""
  });
  const [systemLoading, setSystemLoading] = useState(false);
  const [systemMessage, setSystemMessage] = useState("");
  const [systemError, setSystemError] = useState("");

  const [giftMode, setGiftMode] = useState<"one" | "all">("one");
  const [giftTarget, setGiftTarget] = useState("");
  const [giftTitle, setGiftTitle] = useState("Cadeau administrateur");
  const [giftBody, setGiftBody] = useState("Une recompense vous attend dans votre inbox.");
  const [giftReason, setGiftReason] = useState("");
  const [giftCredits, setGiftCredits] = useState("0");
  const [giftResources, setGiftResources] = useState<Record<string, string>>(() => Object.fromEntries(RESOURCE_IDS.map((id) => [id, "0"])));
  const [giftItems, setGiftItems] = useState<GiftItemRow[]>([{ itemId: ITEM_OPTIONS[0].id, quantity: 1 }]);
  const [giftLoading, setGiftLoading] = useState(false);
  const [giftMessage, setGiftMessage] = useState("");
  const [giftError, setGiftError] = useState("");

  const clearSession = useCallback(() => {
    localStorage.removeItem(AUTH_SESSION_KEY);
    setSession(null);
    setAdminStatus(null);
    setOverview(null);
    setAuditData({ ok: true, items: [], cursor: "" });
    setMapOverview(null);
    setUsers([]);
    setSelectedUser(null);
    setSelectedUserId("");
  }, []);

  const callRpc = useCallback(async <T,>(rpcId: string, payload?: Record<string, unknown>) => {
    if (!session) throw new Error("Session absente.");
    const response = await client.rpc(session, rpcId, payload ? JSON.stringify(payload) : "{}");
    return parseRpcPayload<T>(response.payload);
  }, [client, session]);

  const refreshAdminStatus = useCallback(async () => {
    if (!session) return;
    setAdminLoading(true);
    setAdminError("");
    try {
      const status = await callRpc<AdminStatus>("admin_status");
      setAdminStatus(status);
    } catch (err) {
      const message = extractErrorMessage(err);
      setAdminError(message);
      if (message.toLowerCase().includes("unauthorized")) clearSession();
    } finally {
      setAdminLoading(false);
    }
  }, [callRpc, clearSession, session]);

  const loadOverview = useCallback(async () => {
    setOverviewLoading(true);
    setOverviewError("");
    try {
      setOverview(await callRpc<AdminOverview>("admin_overview"));
    } catch (err) {
      setOverviewError(extractErrorMessage(err));
    } finally {
      setOverviewLoading(false);
    }
  }, [callRpc]);

  const loadAudit = useCallback(async () => {
    setAuditLoading(true);
    setAuditError("");
    try {
      setAuditData(await callRpc<AdminAuditListResponse>("admin_audit_list", { limit: 60 }));
    } catch (err) {
      setAuditError(extractErrorMessage(err));
    } finally {
      setAuditLoading(false);
    }
  }, [callRpc]);

  const loadMapOverview = useCallback(async () => {
    setMapLoading(true);
    setMapError("");
    try {
      setMapOverview(await callRpc<AdminMapOverview>("admin_map_overview", { limit: 120 }));
    } catch (err) {
      setMapError(extractErrorMessage(err));
    } finally {
      setMapLoading(false);
    }
  }, [callRpc]);

  const refreshOperationalData = useCallback(async () => {
    await Promise.all([loadOverview(), loadAudit(), loadMapOverview()]);
  }, [loadAudit, loadMapOverview, loadOverview]);

  useEffect(() => {
    const restore = async () => {
      const raw = localStorage.getItem(AUTH_SESSION_KEY);
      if (!raw) {
        setAuthChecking(false);
        return;
      }
      try {
        const parsed = JSON.parse(raw) as { token?: string; refreshToken?: string };
        if (!parsed.token || !parsed.refreshToken) throw new Error("Session admin invalide.");
        let restored = Session.restore(parsed.token, parsed.refreshToken);
        const now = Math.floor(Date.now() / 1000);
        if (restored.isexpired(now)) {
          if (restored.isrefreshexpired(now)) throw new Error("Session admin expiree.");
          restored = await client.sessionRefresh(restored);
        }
        saveSession(restored);
        setSession(restored);
      } catch {
        localStorage.removeItem(AUTH_SESSION_KEY);
      } finally {
        setAuthChecking(false);
      }
    };
    void restore();
  }, [client]);

  useEffect(() => {
    if (!session) return;
    void refreshAdminStatus();
  }, [refreshAdminStatus, session]);

  useEffect(() => {
    if (!session || !adminStatus?.isAdmin) return;
    void refreshOperationalData();
  }, [adminStatus?.isAdmin, refreshOperationalData, session]);

  useEffect(() => {
    if (!session || !adminStatus?.isAdmin) return;
    const loadUsers = async () => {
      setUsersLoading(true);
      setUsersError("");
      try {
        const result = await callRpc<{ ok: boolean; items: AdminUserRow[] }>("admin_users_search", { query: userQuery });
        setUsers(result.items || []);
        if (result.items && result.items.length > 0) {
          setSelectedUserId((current) => {
            if (current && result.items.some((row) => row.userId === current)) return current;
            return result.items[0].userId;
          });
        } else {
          setSelectedUserId("");
          setSelectedUser(null);
        }
      } catch (err) {
        setUsers([]);
        setSelectedUserId("");
        setSelectedUser(null);
        setUsersError(extractErrorMessage(err));
      } finally {
        setUsersLoading(false);
      }
    };
    void loadUsers();
  }, [adminStatus?.isAdmin, callRpc, session, userQuery]);

  useEffect(() => {
    if (!session || !adminStatus?.isAdmin || !selectedUserId) return;
    const loadSelectedUser = async () => {
      setSelectedUserLoading(true);
      setSelectedUserError("");
      try {
        setSelectedUser(await callRpc<AdminUserDetails>("admin_user_get", { userId: selectedUserId }));
      } catch (err) {
        setSelectedUser(null);
        setSelectedUserError(extractErrorMessage(err));
      } finally {
        setSelectedUserLoading(false);
      }
    };
    void loadSelectedUser();
  }, [adminStatus?.isAdmin, callRpc, selectedUserId, session]);

  const onLogin = async (event: FormEvent) => {
    event.preventDefault();
    setAuthLoading(true);
    setAuthError("");
    try {
      const nextSession = await client.authenticateEmail(email.trim().toLowerCase(), password, false);
      saveSession(nextSession);
      setPassword("");
      setSession(nextSession);
    } catch (err) {
      const message = extractErrorMessage(err);
      if (message.toLowerCase().includes("unauthorized")) {
        setAuthError("Connexion refusee. Utilise l'email du compte admin, pas le pseudo.");
      } else {
        setAuthError(message);
      }
    } finally {
      setAuthLoading(false);
    }
  };

  const bootstrapAdmin = async () => {
    setAdminLoading(true);
    setAdminError("");
    try {
      await callRpc("admin_bootstrap_self");
      await refreshAdminStatus();
    } catch (err) {
      setAdminError(extractErrorMessage(err));
    } finally {
      setAdminLoading(false);
    }
  };

  const submitUserSearch = (event?: FormEvent) => {
    event?.preventDefault();
    setUserQuery(userSearchInput.trim());
  };

  const sendSystemMessage = async (event: FormEvent) => {
    event.preventDefault();
    const trimmedReason = systemForm.reason.trim();
    if (trimmedReason.length < 3) {
      setSystemError("La raison admin est obligatoire (minimum 3 caracteres).");
      setSystemMessage("");
      return;
    }
    setSystemLoading(true);
    setSystemError("");
    setSystemMessage("");
    try {
      const result = await callRpc<{ ok: boolean; message: { stats?: { delivered: number; failed: number; attempted: number } } }>(
        "admin_send_system_message",
        { ...systemForm, reason: trimmedReason }
      );
      const stats = result.message?.stats;
      setSystemMessage(
        stats ? `Message envoye. Delivres: ${stats.delivered} / ${stats.attempted}, echecs: ${stats.failed}.` : "Message envoye."
      );
      setSystemForm({ titleFr: "", titleEn: "", bodyFr: "", bodyEn: "", reason: "" });
      await Promise.all([loadAudit(), loadOverview()]);
    } catch (err) {
      setSystemError(extractErrorMessage(err));
    } finally {
      setSystemLoading(false);
    }
  };

  const sendGift = async (event: FormEvent) => {
    event.preventDefault();
    const trimmedReason = giftReason.trim();
    if (trimmedReason.length < 3) {
      setGiftError("La raison admin est obligatoire (minimum 3 caracteres).");
      setGiftMessage("");
      return;
    }
    setGiftLoading(true);
    setGiftError("");
    setGiftMessage("");
    try {
      const resources = Object.fromEntries(
        RESOURCE_IDS.map((id) => [id, Math.max(0, Math.floor(Number(giftResources[id] || "0")))])
      );
      const items = giftItems
        .map((row) => ({ itemId: row.itemId, quantity: Math.max(0, Math.floor(Number(row.quantity || 0))) }))
        .filter((row) => row.itemId && row.quantity > 0);
      const payload = {
        targetMode: giftMode,
        target: giftMode === "one" ? giftTarget.trim() : "",
        title: giftTitle,
        body: giftBody,
        reason: trimmedReason,
        credits: Math.max(0, Math.floor(Number(giftCredits || "0"))),
        resources,
        items
      };
      const result = await callRpc<{ ok: boolean; result: { delivered: number; failed: number; attempted: number } }>(
        "admin_send_gift",
        payload
      );
      setGiftMessage(`Cadeau envoye. Delivres: ${result.result.delivered} / ${result.result.attempted}, echecs: ${result.result.failed}.`);
      await Promise.all([loadAudit(), loadOverview()]);
    } catch (err) {
      setGiftError(extractErrorMessage(err));
    } finally {
      setGiftLoading(false);
    }
  };

  const runMapMaintenance = async (event: FormEvent) => {
    event.preventDefault();
    const trimmedReason = mapMaintenanceReason.trim();
    if (trimmedReason.length < 3) {
      setMapMaintenanceError("La raison admin est obligatoire (minimum 3 caracteres).");
      setMapMaintenanceMessage("");
      return;
    }
    setMapMaintenanceLoading(true);
    setMapMaintenanceError("");
    setMapMaintenanceMessage("");
    try {
      const result = await callRpc<AdminMapMaintenanceResponse>("admin_map_maintenance", { reason: trimmedReason });
      setMapMaintenanceResult(result.result);
      setMapMaintenanceMessage(
        `Maintenance terminee. Joueurs scannes: ${formatCount(result.result.usersScanned)} | champs liberes: ${formatCount(result.result.releasedFields)}.`
      );
      await Promise.all([loadAudit(), loadOverview(), loadMapOverview()]);
    } catch (err) {
      setMapMaintenanceError(extractErrorMessage(err));
    } finally {
      setMapMaintenanceLoading(false);
    }
  };

  const addGiftItemRow = () => setGiftItems((current) => [...current, { itemId: ITEM_OPTIONS[0].id, quantity: 1 }]);
  const updateGiftItemRow = (index: number, next: Partial<GiftItemRow>) => {
    setGiftItems((current) => current.map((row, rowIndex) => (rowIndex === index ? { ...row, ...next } : row)));
  };
  const removeGiftItemRow = (index: number) => {
    setGiftItems((current) => current.filter((_, rowIndex) => rowIndex !== index));
  };

  const selectedUserBuildingCount = Object.keys(selectedUser?.economy.buildings || {}).length;

  if (authChecking) {
    return (
      <div className="admin-screen center-screen">
        <LoaderCircle className="spin" />
        <span>Verification de la session admin...</span>
      </div>
    );
  }

  if (!session) {
    return (
      <div className="admin-screen login-screen">
        <div className="login-card">
          <div className="brand">
            <Shield size={20} />
            <div>
              <strong>Hyperstrux Admin</strong>
              <span>Back-office separe, securise par Nakama</span>
            </div>
          </div>
          <form onSubmit={onLogin}>
            <label>
              <span>Email admin</span>
              <input value={email} onChange={(e) => setEmail(e.target.value)} type="email" autoComplete="email" required />
            </label>
            <label>
              <span>Mot de passe</span>
              <input value={password} onChange={(e) => setPassword(e.target.value)} type="password" autoComplete="current-password" required />
            </label>
            {authError ? <div className="form-error">{authError}</div> : null}
            <button type="submit" className="primary-btn" disabled={authLoading}>
              {authLoading ? <LoaderCircle className="spin small" /> : <Shield size={16} />}
              Se connecter
            </button>
          </form>
        </div>
      </div>
    );
  }

  if (adminLoading && !adminStatus) {
    return (
      <div className="admin-screen center-screen">
        <LoaderCircle className="spin" />
        <span>Verification des droits admin...</span>
      </div>
    );
  }

  if (!adminStatus?.isAdmin) {
    return (
      <div className="admin-screen center-screen">
        <div className="access-card">
          <AlertTriangle size={22} />
          <h1>Acces admin refuse</h1>
          <p>
            Compte connecte : <strong>{adminStatus?.username || session.username || session.user_id}</strong>
          </p>
          {adminError ? <div className="form-error">{adminError}</div> : null}
          {adminStatus?.bootstrapAvailable ? (
            <button type="button" className="primary-btn" onClick={bootstrapAdmin} disabled={adminLoading}>
              {adminLoading ? <LoaderCircle className="spin small" /> : <BadgeCheck size={16} />}
              Initialiser ce compte comme superadmin
            </button>
          ) : null}
          <button type="button" className="ghost-btn" onClick={clearSession}>
            <LogOut size={16} />
            Deconnexion
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="admin-screen shell">
      <aside className="sidebar">
        <div className="brand brand-shell">
          <Shield size={18} />
          <div>
            <strong>Hyperstrux Admin</strong>
            <span>{adminStatus.username} | {adminStatus.role}</span>
          </div>
        </div>

        <section className="sidebar-summary">
          <div className="summary-chip"><span>Joueurs</span><strong>{overview ? formatCount(overview.metrics.totalUsers) : "-"}</strong></div>
          <div className="summary-chip"><span>Admins</span><strong>{overview ? formatCount(overview.metrics.enabledAdmins) : "-"}</strong></div>
          <div className="summary-chip summary-alert"><span>Carte occupee</span><strong>{overview ? formatCount(overview.metrics.occupiedFields) : "-"}</strong></div>
        </section>

        <nav className="side-nav">
          {TAB_META.map((tab) => {
            const Icon = tab.icon;
            return (
              <button key={tab.id} className={activeTab === tab.id ? "active" : ""} onClick={() => setActiveTab(tab.id)}>
                <Icon size={16} />
                {tab.label}
              </button>
            );
          })}
        </nav>

        <div className="sidebar-footer">
          <button className="ghost-btn" onClick={() => void Promise.all([refreshAdminStatus(), refreshOperationalData()])}>
            <RefreshCw size={16} />
            Rafraichir
          </button>
          <button className="ghost-btn" onClick={clearSession}>
            <LogOut size={16} />
            Deconnexion
          </button>
        </div>
      </aside>

      <main className="content">
        {activeTab === "dashboard" ? (
          <section className="panel">
            <header className="panel-head">
              <div>
                <h1>Dashboard d'exploitation</h1>
                <p>Vue synthese du jeu, de la carte globale et des dernieres actions admin.</p>
              </div>
              <button className="ghost-btn" onClick={() => void refreshOperationalData()}>
                <RefreshCw size={16} />
                Actualiser le dashboard
              </button>
            </header>

            {overviewError ? <div className="form-error">{overviewError}</div> : null}
            <div className="metric-grid metric-grid-large">
              <article className="metric-card emphasis-card">
                <span>Joueurs inscrits</span>
                <strong>{overview ? formatCount(overview.metrics.totalUsers) : overviewLoading ? "..." : "-"}</strong>
                <small>Comptes presents dans Nakama</small>
              </article>
              <article className="metric-card">
                <span>Admins actifs</span>
                <strong>{overview ? formatCount(overview.metrics.enabledAdmins) : overviewLoading ? "..." : "-"}</strong>
                <small>Comptes avec droits admin</small>
              </article>
              <article className="metric-card alert-card">
                <span>Champs occupes</span>
                <strong>{overview ? formatCount(overview.metrics.occupiedFields) : overviewLoading ? "..." : "-"}</strong>
                <small>Occupation globale de la carte</small>
              </article>
              <article className="metric-card">
                <span>Champs expires</span>
                <strong>{overview ? formatCount(overview.metrics.expiredFields) : overviewLoading ? "..." : "-"}</strong>
                <small>Verification utile avant maintenance</small>
              </article>
              <article className="metric-card">
                <span>Champs totaux</span>
                <strong>{overview ? formatCount(overview.metrics.mapFields) : overviewLoading ? "..." : "-"}</strong>
                <small>Snapshot courant de la carte</small>
              </article>
              <article className="metric-card">
                <span>Derniere maj carte</span>
                <strong>{overview ? formatTimestamp(overview.metrics.mapUpdatedAt) : overviewLoading ? "..." : "-"}</strong>
                <small>Horodatage stockage global</small>
              </article>
            </div>

            <div className="dashboard-grid">
              <section className="detail-card">
                <div className="subsection-head">
                  <h3>Derniers joueurs</h3>
                  <button className="ghost-btn" onClick={() => setActiveTab("users")}>
                    <Users size={14} />
                    Ouvrir gestion utilisateurs
                  </button>
                </div>
                <div className="list-stack">
                  {overviewLoading ? <div className="placeholder-row">Chargement...</div> : null}
                  {!overviewLoading && (!overview || overview.recentUsers.length === 0) ? <div className="placeholder-row">Aucun joueur charge.</div> : null}
                  {overview?.recentUsers.map((user) => (
                    <button
                      key={user.userId}
                      type="button"
                      className="list-row"
                      onClick={() => {
                        setSelectedUserId(user.userId);
                        setUserSearchInput(user.username);
                        setUserQuery(user.username);
                        setActiveTab("users");
                      }}
                    >
                      <div>
                        <strong>{user.username}</strong>
                        <span>{user.displayName || user.userId}</span>
                      </div>
                      <small>{formatDateTime(user.createdAt)}</small>
                    </button>
                  ))}
                </div>
              </section>

              <section className="detail-card">
                <div className="subsection-head">
                  <h3>Champs actuellement occupes</h3>
                  <button className="ghost-btn" onClick={() => setActiveTab("map")}>
                    <Map size={14} />
                    Ouvrir maintenance carte
                  </button>
                </div>
                <div className="list-stack compact-list">
                  {overviewLoading ? <div className="placeholder-row">Chargement...</div> : null}
                  {!overviewLoading && (!overview || overview.occupiedFields.length === 0) ? <div className="placeholder-row">Aucun champ occupe.</div> : null}
                  {overview?.occupiedFields.map((field) => (
                    <div key={field.id} className="list-row static-row">
                      <div>
                        <strong>{field.id}</strong>
                        <span>{field.occupiedByUsername || field.occupiedByPlayerId || "Inconnu"} | [{field.x}, {field.y}]</span>
                      </div>
                      <small>{field.rarityTier || "-"}</small>
                    </div>
                  ))}
                </div>
              </section>

              <section className="detail-card">
                <div className="subsection-head">
                  <h3>Dernieres actions admin</h3>
                  <button className="ghost-btn" onClick={() => setActiveTab("audit")}>
                    <FileText size={14} />
                    Ouvrir audit
                  </button>
                </div>
                <div className="audit-list audit-preview-list">
                  {overviewLoading ? <div className="placeholder-row">Chargement...</div> : null}
                  {!overviewLoading && (!overview || overview.auditPreview.length === 0) ? <div className="placeholder-row">Aucune action audit.</div> : null}
                  {overview?.auditPreview.map((entry) => (
                    <article key={entry.id} className="audit-card">
                      <div className="audit-head">
                        <strong>{entry.action}</strong>
                        <small>{formatTimestamp(entry.createdAt)}</small>
                      </div>
                      <span>{entry.actorUsername || entry.actorUserId}</span>
                      <p>{entry.reason || "Sans raison"}</p>
                    </article>
                  ))}
                </div>
              </section>
            </div>
          </section>
        ) : null}

        {activeTab === "users" ? (
          <section className="panel">
            <header className="panel-head">
              <div>
                <h1>Gestion utilisateurs</h1>
                <p>Recherche, inspection des comptes, ressources, credits, inventaire et preparation de cadeaux cibles.</p>
              </div>
              <form className="search-bar search-form" onSubmit={submitUserSearch}>
                <Search size={16} />
                <input value={userSearchInput} onChange={(e) => setUserSearchInput(e.target.value)} placeholder="Pseudo, display name ou userId" />
                <button type="submit" className="ghost-btn compact-btn">Chercher</button>
              </form>
            </header>

            {usersError ? <div className="form-error">{usersError}</div> : null}
            <div className="users-layout">
              <div className="users-list">
                {usersLoading ? <div className="placeholder-row">Chargement des utilisateurs...</div> : null}
                {!usersLoading && users.length === 0 ? <div className="placeholder-row">Aucun resultat.</div> : null}
                {users.map((user) => (
                  <button
                    key={user.userId}
                    type="button"
                    className={`user-row ${selectedUserId === user.userId ? "active" : ""}`}
                    onClick={() => setSelectedUserId(user.userId)}
                  >
                    <div>
                      <strong>{user.username}</strong>
                      <span>{user.displayName || "Sans display name"}</span>
                    </div>
                    <small>{user.adminRole || "joueur"}</small>
                  </button>
                ))}
              </div>

              <div className="user-details">
                {selectedUserLoading ? <div className="placeholder-card">Chargement du compte...</div> : null}
                {!selectedUserLoading && selectedUserError ? <div className="form-error">{selectedUserError}</div> : null}
                {!selectedUserLoading && !selectedUser && !selectedUserError ? <div className="placeholder-card">Selectionne un utilisateur pour voir son compte.</div> : null}
                {selectedUser ? (
                  <>
                    <section className="detail-card user-hero-card">
                      <div className="user-hero-head">
                        <div>
                          <h2>{selectedUser.user.username}</h2>
                          <p>{selectedUser.user.displayName || "Sans display name"}</p>
                        </div>
                        <span className="role-pill">{selectedUser.user.adminRole || "joueur"}</span>
                      </div>
                      <div className="detail-grid user-meta-grid">
                        <div><span>User ID</span><strong>{selectedUser.user.userId}</strong></div>
                        <div><span>Creation</span><strong>{formatDateTime(selectedUser.user.createdAt)}</strong></div>
                        <div><span>Batiments suivis</span><strong>{formatCount(selectedUserBuildingCount)}</strong></div>
                        <div><span>Stacks inventaire</span><strong>{formatCount(selectedUser.inventory.totalStacks)}</strong></div>
                      </div>
                      <div className="detail-actions">
                        <button
                          type="button"
                          className="ghost-btn"
                          onClick={() => {
                            setGiftMode("one");
                            setGiftTarget(selectedUser.user.userId);
                            setActiveTab("gifts");
                          }}
                        >
                          <Gift size={14} />
                          Preparer un cadeau pour ce joueur
                        </button>
                      </div>
                    </section>

                    <section className="detail-card">
                      <div className="subsection-head">
                        <h3>Ressources et credits</h3>
                        <small>Snapshot economie</small>
                      </div>
                      <div className="resource-grid">
                        {RESOURCE_IDS.map((id) => (
                          <div key={id} className="metric-box">
                            <span>{RESOURCE_LABELS[id]}</span>
                            <strong>{Number(selectedUser.economy.resources[id] || 0).toLocaleString("fr-FR")}</strong>
                          </div>
                        ))}
                        <div className="metric-box metric-credit">
                          <span>Credits</span>
                          <strong>{selectedUser.economy.credits.toLocaleString("fr-FR")}</strong>
                        </div>
                      </div>
                    </section>
                    <section className="detail-card">
                      <div className="subsection-head">
                        <h3>Inventaire</h3>
                        <small>{formatCount(selectedUser.inventory.totalUnits)} unites</small>
                      </div>
                      <div className="detail-grid compact-grid">
                        <div><span>Piles</span><strong>{selectedUser.inventory.totalStacks}</strong></div>
                        <div><span>Quantite totale</span><strong>{selectedUser.inventory.totalUnits}</strong></div>
                        <div><span>Notif. map</span><strong>{selectedUser.inventory.mapDropNotifications}</strong></div>
                      </div>
                      <div className="inventory-stack-list">
                        {selectedUser.inventory.items.length === 0 ? <div className="placeholder-row">Inventaire vide.</div> : null}
                        {selectedUser.inventory.items.map((item) => (
                          <div key={item.id} className="inventory-row">
                            <span>{item.name} ({item.id})</span>
                            <strong>x{item.quantity}</strong>
                          </div>
                        ))}
                      </div>
                    </section>
                  </>
                ) : null}
              </div>
            </div>
          </section>
        ) : null}

        {activeTab === "system" ? (
          <section className="panel">
            <header className="panel-head">
              <div>
                <h1>Message systeme global</h1>
                <p>Diffuse un message inbox SYSTEM localise a l'ensemble des joueurs, avec version francaise et anglaise.</p>
              </div>
            </header>
            <form className="admin-form" onSubmit={sendSystemMessage}>
              <div className="dual-language-grid">
                <label>
                  <span>Titre FR</span>
                  <input
                    value={systemForm.titleFr}
                    onChange={(e) => setSystemForm((current) => ({ ...current, titleFr: e.target.value }))}
                    placeholder="Ex: Maintenance programmee"
                    required
                  />
                </label>
                <label>
                  <span>Title EN</span>
                  <input
                    value={systemForm.titleEn}
                    onChange={(e) => setSystemForm((current) => ({ ...current, titleEn: e.target.value }))}
                    placeholder="Ex: Scheduled maintenance"
                    required
                  />
                </label>
                <label>
                  <span>Message FR</span>
                  <textarea
                    value={systemForm.bodyFr}
                    onChange={(e) => setSystemForm((current) => ({ ...current, bodyFr: e.target.value }))}
                    rows={8}
                    placeholder="Version francaise du message systeme"
                    required
                  />
                </label>
                <label>
                  <span>Message EN</span>
                  <textarea
                    value={systemForm.bodyEn}
                    onChange={(e) => setSystemForm((current) => ({ ...current, bodyEn: e.target.value }))}
                    rows={8}
                    placeholder="English version of the system message"
                    required
                  />
                </label>
              </div>
              <label>
                <span>Raison admin</span>
                <input
                  value={systemForm.reason}
                  onChange={(e) => setSystemForm((current) => ({ ...current, reason: e.target.value }))}
                  placeholder="Ex: annonce maintenance, compensation, communication systeme"
                  required
                />
              </label>
              {systemError ? <div className="form-error">{systemError}</div> : null}
              {systemMessage ? <div className="form-success">{systemMessage}</div> : null}
              <button type="submit" className="primary-btn" disabled={systemLoading}>
                {systemLoading ? <LoaderCircle className="spin small" /> : <Send size={16} />}
                Envoyer a tous les joueurs
              </button>
            </form>
          </section>
        ) : null}

        {activeTab === "gifts" ? (
          <section className="panel">
            <header className="panel-head">
              <div>
                <h1>Cadeaux inbox</h1>
                <p>Envoie un inbox REWARD a un joueur ou a tous les joueurs avec ressources, credits et items.</p>
              </div>
            </header>

            <form className="admin-form" onSubmit={sendGift}>
              <div className="mode-row">
                <button type="button" className={giftMode === "one" ? "active" : ""} onClick={() => setGiftMode("one")}>Un joueur</button>
                <button type="button" className={giftMode === "all" ? "active" : ""} onClick={() => setGiftMode("all")}>Tous les joueurs</button>
              </div>

              {giftMode === "one" ? (
                <label>
                  <span>Destinataire (pseudo ou userId)</span>
                  <input value={giftTarget} onChange={(e) => setGiftTarget(e.target.value)} required />
                </label>
              ) : null}

              <label>
                <span>Titre</span>
                <input value={giftTitle} onChange={(e) => setGiftTitle(e.target.value)} required />
              </label>

              <label>
                <span>Message</span>
                <textarea value={giftBody} onChange={(e) => setGiftBody(e.target.value)} rows={5} required />
              </label>

              <label>
                <span>Raison admin</span>
                <input
                  value={giftReason}
                  onChange={(e) => setGiftReason(e.target.value)}
                  placeholder="Ex: compensation combat, cadeau evenement, remboursement"
                  required
                />
              </label>

              <div className="subsection">
                <h3>Credits</h3>
                <input value={giftCredits} onChange={(e) => setGiftCredits(e.target.value)} type="number" min="0" />
              </div>

              <div className="subsection">
                <h3>Ressources</h3>
                <div className="resource-grid edit-grid">
                  {RESOURCE_IDS.map((id) => (
                    <label key={id} className="resource-input">
                      <span>{RESOURCE_LABELS[id]}</span>
                      <input
                        value={giftResources[id]}
                        onChange={(e) => setGiftResources((current) => ({ ...current, [id]: e.target.value }))}
                        type="number"
                        min="0"
                      />
                    </label>
                  ))}
                </div>
              </div>

              <div className="subsection">
                <div className="subsection-head">
                  <h3>Items</h3>
                  <button type="button" className="ghost-btn" onClick={addGiftItemRow}>
                    <Gift size={14} />
                    Ajouter un item
                  </button>
                </div>
                <div className="gift-items">
                  {giftItems.map((row, index) => (
                    <div key={`${row.itemId}-${index}`} className="gift-item-row">
                      <select value={row.itemId} onChange={(e) => updateGiftItemRow(index, { itemId: e.target.value })}>
                        {ITEM_OPTIONS.map((item) => (
                          <option key={item.id} value={item.id}>{item.label}</option>
                        ))}
                      </select>
                      <input
                        value={row.quantity}
                        onChange={(e) => updateGiftItemRow(index, { quantity: Math.max(0, Math.floor(Number(e.target.value || 0))) })}
                        type="number"
                        min="0"
                      />
                      <button type="button" className="ghost-btn danger-btn" onClick={() => removeGiftItemRow(index)}>
                        Retirer
                      </button>
                    </div>
                  ))}
                </div>
              </div>
              {giftError ? <div className="form-error">{giftError}</div> : null}
              {giftMessage ? <div className="form-success">{giftMessage}</div> : null}
              <button type="submit" className="primary-btn" disabled={giftLoading}>
                {giftLoading ? <LoaderCircle className="spin small" /> : <Gift size={16} />}
                Envoyer le cadeau
              </button>
            </form>
          </section>
        ) : null}

        {activeTab === "map" ? (
          <section className="panel">
            <header className="panel-head">
              <div>
                <h1>Carte & maintenance</h1>
                <p>Surveille l'occupation des champs, visualise l'etat global et lance une maintenance serveur explicite.</p>
              </div>
              <button className="ghost-btn" onClick={() => void loadMapOverview()}>
                <RefreshCw size={16} />
                Actualiser la carte
              </button>
            </header>

            {mapError ? <div className="form-error">{mapError}</div> : null}
            <div className="metric-grid">
              <article className="metric-card"><span>Champs totaux</span><strong>{mapOverview ? formatCount(mapOverview.summary.totalFields) : mapLoading ? "..." : "-"}</strong></article>
              <article className="metric-card alert-card"><span>Champs occupes</span><strong>{mapOverview ? formatCount(mapOverview.summary.occupiedFields) : mapLoading ? "..." : "-"}</strong></article>
              <article className="metric-card"><span>Champs expires</span><strong>{mapOverview ? formatCount(mapOverview.summary.expiredFields) : mapLoading ? "..." : "-"}</strong></article>
              <article className="metric-card"><span>Total spawne</span><strong>{mapOverview ? formatCount(mapOverview.summary.totalSpawned) : mapLoading ? "..." : "-"}</strong></article>
            </div>

            <div className="dashboard-grid dashboard-grid-map">
              <section className="detail-card">
                <div className="subsection-head">
                  <h3>Maintenance manuelle</h3>
                  <small>Tick global + nettoyage coherence carte</small>
                </div>
                <form className="admin-form" onSubmit={runMapMaintenance}>
                  <label>
                    <span>Raison admin</span>
                    <input
                      value={mapMaintenanceReason}
                      onChange={(e) => setMapMaintenanceReason(e.target.value)}
                      placeholder="Ex: correction de carte, nettoyage apres bug, maintenance exploitation"
                      required
                    />
                  </label>
                  {mapMaintenanceError ? <div className="form-error">{mapMaintenanceError}</div> : null}
                  {mapMaintenanceMessage ? <div className="form-success">{mapMaintenanceMessage}</div> : null}
                  <button type="submit" className="primary-btn" disabled={mapMaintenanceLoading}>
                    {mapMaintenanceLoading ? <LoaderCircle className="spin small" /> : <Wrench size={16} />}
                    Lancer la maintenance
                  </button>
                </form>
                {mapMaintenanceResult ? (
                  <div className="detail-grid compact-grid maintenance-grid">
                    <div><span>Joueurs scannes</span><strong>{formatCount(mapMaintenanceResult.usersScanned)}</strong></div>
                    <div><span>Comptes touches</span><strong>{formatCount(mapMaintenanceResult.usersTouched)}</strong></div>
                    <div><span>Rapports regles</span><strong>{formatCount(mapMaintenanceResult.reportsSettled)}</strong></div>
                    <div><span>Champs liberes</span><strong>{formatCount(mapMaintenanceResult.releasedFields)}</strong></div>
                  </div>
                ) : null}
                {mapMaintenanceResult?.errors?.length ? (
                  <div className="list-stack compact-list">
                    {mapMaintenanceResult.errors.map((entry) => (
                      <div key={`${entry.userId}-${entry.message}`} className="list-row static-row error-row">
                        <div>
                          <strong>{entry.username}</strong>
                          <span>{entry.userId}</span>
                        </div>
                        <small>{entry.message}</small>
                      </div>
                    ))}
                  </div>
                ) : null}
              </section>

              <section className="detail-card">
                <div className="subsection-head">
                  <h3>Champs occupes</h3>
                  <small>{mapOverview ? formatCount(mapOverview.occupiedFields.length) : "0"} lignes chargees</small>
                </div>
                <div className="table-shell">
                  <table className="admin-table">
                    <thead>
                      <tr>
                        <th>Champ</th>
                        <th>Coord.</th>
                        <th>Occupant</th>
                        <th>Rareté</th>
                        <th>Expire</th>
                      </tr>
                    </thead>
                    <tbody>
                      {mapLoading ? <tr><td colSpan={5}>Chargement...</td></tr> : null}
                      {!mapLoading && (!mapOverview || mapOverview.occupiedFields.length === 0) ? <tr><td colSpan={5}>Aucun champ occupe.</td></tr> : null}
                      {mapOverview?.occupiedFields.map((field) => (
                        <tr key={field.id}>
                          <td>{field.id}</td>
                          <td>[{field.x}, {field.y}]</td>
                          <td>{field.occupiedByUsername || field.occupiedByPlayerId || "-"}</td>
                          <td>{field.rarityTier || "-"}</td>
                          <td>{formatTimestamp(field.expiresAt)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </section>
            </div>
          </section>
        ) : null}

        {activeTab === "audit" ? (
          <section className="panel">
            <header className="panel-head">
              <div>
                <h1>Journal d'audit</h1>
                <p>Trace serveur des actions admin sensibles pour le support, la moderation et la maintenance.</p>
              </div>
              <button className="ghost-btn" onClick={() => void loadAudit()}>
                <RefreshCw size={16} />
                Actualiser l'audit
              </button>
            </header>
            {auditError ? <div className="form-error">{auditError}</div> : null}
            <div className="audit-list">
              {auditLoading ? <div className="placeholder-row">Chargement de l'audit...</div> : null}
              {!auditLoading && auditData.items.length === 0 ? <div className="placeholder-row">Aucune entree.</div> : null}
              {auditData.items.map((entry) => (
                <article key={entry.id} className="audit-card audit-card-full">
                  <div className="audit-head">
                    <div>
                      <strong>{entry.action}</strong>
                      <span>{entry.actorUsername || entry.actorUserId}</span>
                    </div>
                    <small>{formatTimestamp(entry.createdAt)}</small>
                  </div>
                  <div className="audit-body">
                    <p><strong>Raison :</strong> {entry.reason || "Sans raison"}</p>
                    <div className="audit-summary-block">
                      <strong>Cible</strong>
                      <AuditSummary value={entry.targetSummary} />
                    </div>
                    <div className="audit-summary-block">
                      <strong>Charge utile</strong>
                      <AuditSummary value={entry.payloadSummary} />
                    </div>
                  </div>
                </article>
              ))}
            </div>
          </section>
        ) : null}
      </main>
    </div>
  );
}

