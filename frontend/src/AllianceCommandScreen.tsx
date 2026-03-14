import { Client, Session } from "@heroiclabs/nakama-js";
import {
  ChevronRight,
  Clock3,
  Coins,
  Crown,
  Factory,
  Flag,
  FlaskConical,
  HandCoins,
  Medal,
  Pickaxe,
  Plus,
  Radar,
  Rocket,
  ScrollText,
  Search,
  Settings2,
  Shield,
  Sparkles,
  Swords,
  Target,
  Users,
  Wrench
} from "lucide-react";
import { CSSProperties, FormEvent, useCallback, useEffect, useMemo, useRef, useState } from "react";

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
type AllianceRole = "LEADER" | "OFFICER" | "MEMBER";
type AllianceMode = "command" | "directory";
type AllianceView = "overview" | "bastion" | "tech" | "quests" | "operations" | "votes" | "members" | "log" | "settings";
type BranchId = "logistics" | "industry" | "military" | "exploration" | "diplomacy";
type OperationKind = "attack" | "defense" | "harvest" | "logistics";
type VoteTopic = "war" | "major_quest" | "bastion_invest" | "strategic_bonus";

type Props = {
  language: UILanguage;
  playerId: string;
  nowMs: number;
  client: Client;
  session: Session | null;
  resourceAmounts: Record<string, number>;
  onRankingRefresh: () => void;
  onEconomyRefresh: () => Promise<void> | void;
  onUnauthorized: () => void;
};

const RESOURCE_IDS: ResourceId[] = ["carbone", "titane", "osmium", "adamantium", "magmatite", "neodyme", "chronium", "aetherium", "isotope7", "singulite"];
const RESOURCE_LABELS: Record<ResourceId, { fr: string; en: string }> = {
  carbone: { fr: "Carbone", en: "Carbon" },
  titane: { fr: "Titane", en: "Titanium" },
  osmium: { fr: "Osmium", en: "Osmium" },
  adamantium: { fr: "Adamantium", en: "Adamantium" },
  magmatite: { fr: "Magmatite", en: "Magmatite" },
  neodyme: { fr: "Neodyme", en: "Neodymium" },
  chronium: { fr: "Chronium", en: "Chronium" },
  aetherium: { fr: "Aetherium", en: "Aetherium" },
  isotope7: { fr: "Isotope-7", en: "Isotope-7" },
  singulite: { fr: "Singulite", en: "Singulite" }
};
const CREATE_COST: Partial<Record<ResourceId, number>> = { carbone: 50000, titane: 5000 };
const VIEW_META: Array<{ id: AllianceView; fr: string; en: string; icon: typeof Shield }> = [
  { id: "overview", fr: "Vue d'ensemble", en: "Overview", icon: Shield },
  { id: "bastion", fr: "Nexus commun", en: "Shared nexus", icon: Wrench },
  { id: "tech", fr: "Arbre techno", en: "Tech tree", icon: FlaskConical },
  { id: "quests", fr: "Quetes coop", en: "Co-op quests", icon: Sparkles },
  { id: "operations", fr: "Operations", en: "Operations", icon: Target },
  { id: "votes", fr: "Votes", en: "Votes", icon: Flag },
  { id: "members", fr: "Membres", en: "Members", icon: Users },
  { id: "log", fr: "Journal", en: "Log", icon: ScrollText },
  { id: "settings", fr: "Parametres", en: "Settings", icon: Settings2 }
];
const BRANCH_META: Record<BranchId, { icon: typeof Rocket; color: string; fr: string; en: string; shortFr: string; shortEn: string; tipFr: string; tipEn: string }> = {
  logistics: { icon: Rocket, color: "#66e3ff", fr: "Logistique", en: "Logistics", shortFr: "Flottes et vitesse", shortEn: "Fleet reach and speed", tipFr: "A prioriser pour la projection sur la carte.", tipEn: "Prioritize for map projection." },
  industry: { icon: Factory, color: "#9cff8f", fr: "Industrie", en: "Industry", shortFr: "Production et rendement", shortEn: "Production and output", tipFr: "Branche la plus rentable pour une croissance saine.", tipEn: "Best early branch for stable growth." },
  military: { icon: Swords, color: "#ff7e7e", fr: "Militaire", en: "Military", shortFr: "Puissance et endurance", shortEn: "Power and endurance", tipFr: "A pousser avant une phase de domination PvP.", tipEn: "Push before a PvP domination phase." },
  exploration: { icon: Radar, color: "#c48dff", fr: "Exploration", en: "Exploration", shortFr: "Champs et accelerateurs", shortEn: "Fields and accelerators", tipFr: "Tres fort pour les alliances opportunistes sur carte.", tipEn: "Very strong for map-opportunistic alliances." },
  diplomacy: { icon: Shield, color: "#ffd36a", fr: "Diplomatie", en: "Diplomacy", shortFr: "Commerce et soutien", shortEn: "Trade and support", tipFr: "Optimise l'entraide et la coordination large echelle.", tipEn: "Optimizes aid and large-scale coordination." }
};
const OPERATION_LABELS: Record<OperationKind, { fr: string; en: string }> = {
  attack: { fr: "Assaut", en: "Attack" },
  defense: { fr: "Defense", en: "Defense" },
  harvest: { fr: "Collecte", en: "Harvest" },
  logistics: { fr: "Logistique", en: "Logistics" }
};
const VOTE_LABELS: Record<string, { fr: string; en: string }> = {
  war: { fr: "Guerre", en: "War" },
  major_quest: { fr: "Quete majeure", en: "Major quest" },
  bastion_invest: { fr: "Investissement bastion", en: "Bastion investment" },
  strategic_bonus: { fr: "Doctrine strategique", en: "Strategic doctrine" }
};

const parseJsonObject = (value: unknown): Record<string, any> => {
  if (!value) return {};
  if (typeof value === "string") {
    try {
      const parsed = JSON.parse(value);
      return parsed && typeof parsed === "object" ? (parsed as Record<string, any>) : {};
    } catch {
      return {};
    }
  }
  return typeof value === "object" ? (value as Record<string, any>) : {};
};

const extractRpcErrorMessage = (err: unknown): string => {
  const anyErr = err as any;
  if (typeof anyErr?.message === "string" && anyErr.message.trim()) return anyErr.message.trim();
  if (typeof anyErr?.error === "string" && anyErr.error.trim()) return anyErr.error.trim();
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

const normalizeRole = (raw: unknown): AllianceRole => {
  const role = String(raw || "").toUpperCase();
  if (role === "LEADER" || role === "CHEF") return "LEADER";
  if (role === "OFFICER" || role === "CO_LEAD") return "OFFICER";
  return "MEMBER";
};

const emptyDraft = (): Record<ResourceId, string> => ({
  carbone: "", titane: "", osmium: "", adamantium: "", magmatite: "", neodyme: "", chronium: "", aetherium: "", isotope7: "", singulite: ""
});

const toResourceMap = (draft: Record<ResourceId, string>): Partial<Record<ResourceId, number>> => {
  const out: Partial<Record<ResourceId, number>> = {};
  for (const id of RESOURCE_IDS) {
    const value = Math.max(0, Math.floor(Number(draft[id] || 0)));
    if (value > 0) out[id] = value;
  }
  return out;
};

const isUuidLike = (value: string) => /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(value.trim());

export default function AllianceCommandScreen({ language, playerId, nowMs, client, session, resourceAmounts, onRankingRefresh, onEconomyRefresh, onUnauthorized }: Props) {
  const l = (fr: string, en: string) => (language === "en" ? en : fr);
  const num = useMemo(() => new Intl.NumberFormat(language === "fr" ? "fr-FR" : "en-US"), [language]);
  const fmt = (value: number) => num.format(Math.max(0, Math.floor(Number(value || 0))));
  const pct = (value: number) => `${Math.max(0, Number(value || 0)).toFixed(1)}%`;
  const roleLabel = (role: AllianceRole) => role === "LEADER" ? l("Chef", "Leader") : role === "OFFICER" ? l("Sous-chef", "Officer") : l("Membre", "Member");
  const resourceLabel = (id: string) => (language === "fr" ? RESOURCE_LABELS[id as ResourceId]?.fr : RESOURCE_LABELS[id as ResourceId]?.en) || id;
  const dateLabel = (value: number) => !value ? l("Jamais", "Never") : new Date(value * 1000).toLocaleString(language === "fr" ? "fr-FR" : "en-US");
  const rankLabel = (rank: number) => !rank ? l("Non classee", "Unranked") : `${l("Rang", "Rank")} #${fmt(rank)}`;
  const parseRpcPayload = (rpcResponse: any) => {
    const parsed = parseJsonObject((rpcResponse as any)?.payload ?? rpcResponse);
    const nested = parseJsonObject(parsed?.payload);
    return Object.keys(nested).length > 0 ? nested : parsed;
  };
  const rewardLines = (reward: any): string[] => {
    if (!reward) return [];
    const rows: string[] = [];
    const resources = reward.attachments?.resources ?? {};
    for (const id of RESOURCE_IDS) {
      const amount = Number(resources[id] || 0);
      if (amount > 0) rows.push(`${fmt(amount)} ${resourceLabel(id)}`);
    }
    for (const item of reward.attachments?.items ?? []) rows.push(`${item.itemId} x${fmt(item.quantity)}`);
    for (const chest of reward.attachments?.chests ?? []) rows.push(`${chest.chestType} x${fmt(chest.quantity)}`);
    if (Number(reward.attachments?.credits || 0) > 0) rows.push(`${fmt(Number(reward.attachments?.credits || 0))} ${l("credits", "credits")}`);
    return rows;
  };
  const allianceLogoStyle = (logoUrl?: string): CSSProperties | undefined => {
    const url = String(logoUrl || "").trim();
    if (!url) return undefined;
    return {
      backgroundImage: `linear-gradient(180deg, rgba(7, 16, 30, 0.18), rgba(7, 16, 30, 0.82)), url("${url.replace(/"/g, '\\"')}")`,
      backgroundSize: "cover",
      backgroundPosition: "center"
    };
  };

  const rootRef = useRef<HTMLElement | null>(null);
  const uiAudioCtxRef = useRef<AudioContext | null>(null);
  const [mode, setMode] = useState<AllianceMode>("command");
  const [view, setView] = useState<AllianceView>("overview");
  const [loading, setLoading] = useState(false);
  const [loadError, setLoadError] = useState("");
  const [actionError, setActionError] = useState("");
  const [actionSuccess, setActionSuccess] = useState("");
  const [busyKey, setBusyKey] = useState("");
  const [inAlliance, setInAlliance] = useState(false);
  const [myRole, setMyRole] = useState<AllianceRole>("MEMBER");
  const [allianceData, setAllianceData] = useState<any | null>(null);
  const [incomingInvites, setIncomingInvites] = useState<any[]>([]);
  const [pendingApplication, setPendingApplication] = useState<any | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchBusy, setSearchBusy] = useState(false);
  const [searchError, setSearchError] = useState("");
  const [searchItems, setSearchItems] = useState<any[]>([]);
  const [createName, setCreateName] = useState("");
  const [createTag, setCreateTag] = useState("");
  const [createMotto, setCreateMotto] = useState("");
  const [createDescription, setCreateDescription] = useState("");
  const [createLogoUrl, setCreateLogoUrl] = useState("");
  const [editMotto, setEditMotto] = useState("");
  const [editDescription, setEditDescription] = useState("");
  const [editLogoUrl, setEditLogoUrl] = useState("");
  const [editRecruiting, setEditRecruiting] = useState(true);
  const [applyMessage, setApplyMessage] = useState("");
  const [inviteTarget, setInviteTarget] = useState("");
  const [bastionDraft, setBastionDraft] = useState<Record<ResourceId, string>>(emptyDraft);
  const [techDraft, setTechDraft] = useState<Record<ResourceId, string>>(emptyDraft);
  const [selectedBranchId, setSelectedBranchId] = useState<BranchId>("industry");
  const [voteTopic, setVoteTopic] = useState<VoteTopic>("major_quest");
  const [voteTitle, setVoteTitle] = useState("");
  const [voteDescription, setVoteDescription] = useState("");
  const [operationTitle, setOperationTitle] = useState("");
  const [operationTarget, setOperationTarget] = useState("");
  const [operationNote, setOperationNote] = useState("");
  const [operationKind, setOperationKind] = useState<OperationKind>("harvest");
  const [operationScheduledAt, setOperationScheduledAt] = useState("");

  const rpcCall = async (rpcId: string, body: Record<string, any> = {}) => {
    if (!session) throw new Error(l("Connexion requise.", "Sign-in required."));
    const rpc = await client.rpc(session, rpcId, JSON.stringify(body));
    return parseRpcPayload(rpc);
  };

  const loadMyAlliance = async (silent = false) => {
    if (!session) {
      setInAlliance(false);
      setAllianceData(null);
      setIncomingInvites([]);
      setPendingApplication(null);
      setMyRole("MEMBER");
      setLoadError("");
      return;
    }
    if (!silent) {
      setLoading(true);
      setLoadError("");
    }
    try {
      const payload = await rpcCall("rpc_get_my_alliance");
      if (payload.ok === false) throw new Error(String(payload.error || "Alliance load failed."));
      const nextAlliance = payload.alliance ?? null;
      setInAlliance(Boolean(payload.inAlliance));
      setAllianceData(nextAlliance);
      setIncomingInvites(Array.isArray(payload.invites) ? payload.invites : []);
      setPendingApplication(payload.pendingApplication ?? null);
      if (payload.inAlliance && nextAlliance) {
        const selfMember = (Array.isArray(nextAlliance.members) ? nextAlliance.members : []).find((member: any) => String(member?.userId || "") === playerId);
        setMyRole(normalizeRole(payload.myRole ?? selfMember?.role));
      } else {
        setMyRole("MEMBER");
      }
    } catch (err) {
      if (isUnauthorizedError(err)) {
        onUnauthorized();
        return;
      }
      setLoadError(extractRpcErrorMessage(err) || l("Impossible de charger l'alliance.", "Unable to load alliance."));
    } finally {
      if (!silent) setLoading(false);
    }
  };

  const searchAlliances = async () => {
    if (!session) return;
    setSearchBusy(true);
    setSearchError("");
    try {
      const payload = await rpcCall("rpc_search_alliances", { query: searchQuery.trim(), limit: 30 });
      if (payload.ok === false) throw new Error(String(payload.error || "Alliance search failed."));
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

  const runAction = async (busy: string, task: () => Promise<void>) => {
    setBusyKey(busy);
    setActionError("");
    setActionSuccess("");
    try {
      await task();
    } catch (err) {
      if (isUnauthorizedError(err)) {
        onUnauthorized();
        return;
      }
      setActionError(extractRpcErrorMessage(err) || l("Action impossible.", "Action failed."));
    } finally {
      setBusyKey("");
    }
  };
  const branchTarget = (branchId: BranchId, level: number) => {
    const base = branchId === "logistics" ? 180000 : branchId === "industry" ? 220000 : branchId === "military" ? 260000 : branchId === "exploration" ? 200000 : 160000;
    return Math.max(1, Math.floor(base * Math.pow(1.55, Math.max(0, level))));
  };

  const createAlliance = async (event: FormEvent) => {
    event.preventDefault();
    await runAction("create", async () => {
      const payload = await rpcCall("rpc_create_alliance", { name: createName, tag: createTag, motto: createMotto, description: createDescription, logoUrl: createLogoUrl });
      if (payload.ok === false) throw new Error(String(payload.error || "Alliance creation failed."));
      setCreateName("");
      setCreateTag("");
      setCreateMotto("");
      setCreateDescription("");
      setCreateLogoUrl("");
      setActionSuccess(l("Alliance creee.", "Alliance created."));
      await onEconomyRefresh();
      onRankingRefresh();
      await loadMyAlliance(true);
      await searchAlliances();
      setMode("command");
      setView("overview");
    });
  };

  const updateAllianceSettings = async () => {
    await runAction("settings", async () => {
      const payload = await rpcCall("rpc_update_my_alliance", { motto: editMotto, description: editDescription, logoUrl: editLogoUrl, isRecruiting: editRecruiting });
      if (payload.ok === false) throw new Error(String(payload.error || "Alliance update failed."));
      setActionSuccess(l("Parametres mis a jour.", "Settings updated."));
      await loadMyAlliance(true);
      await searchAlliances();
    });
  };

  const leaveAlliance = async () => {
    await runAction("leave", async () => {
      const payload = await rpcCall("rpc_leave_alliance");
      if (payload.ok === false) throw new Error(String(payload.error || "Leave alliance failed."));
      setActionSuccess(payload.disbanded ? l("Alliance dissoute.", "Alliance disbanded.") : l("Alliance quittee.", "Alliance left."));
      onRankingRefresh();
      await loadMyAlliance(true);
      await searchAlliances();
    });
  };

  const applyToAlliance = async (allianceId: string) => {
    await runAction(`apply_${allianceId}`, async () => {
      const payload = await rpcCall("rpc_alliance_apply", { allianceId, message: applyMessage.trim() });
      if (payload.ok === false) throw new Error(String(payload.error || "Apply failed."));
      setActionSuccess(l("Candidature envoyee.", "Application sent."));
      await loadMyAlliance(true);
      await searchAlliances();
    });
  };

  const reviewApplication = async (targetUserId: string, accept: boolean) => {
    await runAction(`review_${targetUserId}_${accept ? "yes" : "no"}`, async () => {
      const payload = await rpcCall("rpc_alliance_review_application", { targetUserId, accept });
      if (payload.ok === false) throw new Error(String(payload.error || "Review failed."));
      setActionSuccess(accept ? l("Candidature acceptee.", "Application approved.") : l("Candidature refusee.", "Application rejected."));
      onRankingRefresh();
      await loadMyAlliance(true);
      await searchAlliances();
    });
  };

  const invitePlayer = async () => {
    const target = inviteTarget.trim();
    if (!target) {
      setActionError(l("Entrez un pseudo ou un userId.", "Enter a username or user id."));
      return;
    }
    await runAction(`invite_${target}`, async () => {
      const payload = await rpcCall("rpc_alliance_invite_player", isUuidLike(target) ? { targetUserId: target } : { username: target });
      if (payload.ok === false) throw new Error(String(payload.error || "Invite failed."));
      setInviteTarget("");
      setActionSuccess(l("Invitation envoyee.", "Invitation sent."));
      await loadMyAlliance(true);
    });
  };

  const respondInvite = async (allianceId: string, accept: boolean) => {
    await runAction(`invite_${allianceId}_${accept ? "yes" : "no"}`, async () => {
      const payload = await rpcCall("rpc_alliance_respond_invite", { allianceId, accept });
      if (payload.ok === false) throw new Error(String(payload.error || "Invite response failed."));
      setActionSuccess(accept ? l("Invitation acceptee.", "Invitation accepted.") : l("Invitation refusee.", "Invitation declined."));
      onRankingRefresh();
      await loadMyAlliance(true);
      await searchAlliances();
    });
  };

  const memberAction = async (action: string, targetUserId: string) => {
    await runAction(`${action}_${targetUserId}`, async () => {
      const payload = await rpcCall("rpc_alliance_member_action", { action, targetUserId });
      if (payload.ok === false) throw new Error(String(payload.error || "Member action failed."));
      setActionSuccess(l("Action membre effectuee.", "Member action completed."));
      onRankingRefresh();
      await loadMyAlliance(true);
      await searchAlliances();
    });
  };

  const investBastion = async () => {
    await runAction("invest", async () => {
      const payload = await rpcCall("rpc_alliance_invest", { resources: toResourceMap(bastionDraft) });
      if (payload.ok === false) throw new Error(String(payload.error || "Alliance invest failed."));
      setBastionDraft(emptyDraft());
      setActionSuccess(l("Ressources investies dans le Nexus.", "Resources invested into the nexus."));
      await onEconomyRefresh();
      onRankingRefresh();
      await loadMyAlliance(true);
    });
  };

  const fundTech = async () => {
    await runAction(`tech_${selectedBranchId}`, async () => {
      const payload = await rpcCall("rpc_alliance_contribute_tech", { branchId: selectedBranchId, resources: toResourceMap(techDraft) });
      if (payload.ok === false) throw new Error(String(payload.error || "Alliance tech funding failed."));
      setTechDraft(emptyDraft());
      setActionSuccess(l("Branche technologique financee.", "Tech branch funded."));
      await onEconomyRefresh();
      onRankingRefresh();
      await loadMyAlliance(true);
    });
  };

  const claimQuest = async (questId: string) => {
    await runAction(`quest_${questId}`, async () => {
      const payload = await rpcCall("rpc_alliance_claim_quest", { questId });
      if (payload.ok === false) throw new Error(String(payload.error || "Quest claim failed."));
      setActionSuccess(l("Recompense envoyee a tous les membres.", "Reward delivered to all members."));
      onRankingRefresh();
      await loadMyAlliance(true);
    });
  };

  const launchVote = async (event: FormEvent) => {
    event.preventDefault();
    await runAction("vote_launch", async () => {
      const payload = await rpcCall("rpc_alliance_launch_vote", { topic: voteTopic, title: voteTitle, description: voteDescription });
      if (payload.ok === false) throw new Error(String(payload.error || "Vote launch failed."));
      setVoteTitle("");
      setVoteDescription("");
      setActionSuccess(l("Vote lance.", "Vote launched."));
      await loadMyAlliance(true);
    });
  };

  const castVote = async (voteId: string, choice: "yes" | "no") => {
    await runAction(`vote_${voteId}_${choice}`, async () => {
      const payload = await rpcCall("rpc_alliance_cast_vote", { voteId, choice });
      if (payload.ok === false) throw new Error(String(payload.error || "Vote failed."));
      setActionSuccess(l("Vote enregistre.", "Vote recorded."));
      await loadMyAlliance(true);
    });
  };

  const manageOperation = async (action: "create" | "toggle_status" | "cancel" | "delete", operationId = "") => {
    await runAction(`operation_${action}_${operationId || "new"}`, async () => {
      const body: Record<string, any> = { action, operationId };
      if (action === "create") {
        body.title = operationTitle;
        body.target = operationTarget;
        body.note = operationNote;
        body.kind = operationKind;
        if (operationScheduledAt) body.scheduledAt = Math.floor(new Date(operationScheduledAt).getTime() / 1000);
      }
      const payload = await rpcCall("rpc_alliance_manage_operation", body);
      if (payload.ok === false) throw new Error(String(payload.error || "Operation failed."));
      if (action === "create") {
        setOperationTitle("");
        setOperationTarget("");
        setOperationNote("");
        setOperationScheduledAt("");
        setOperationKind("harvest");
      }
      setActionSuccess(action === "create" ? l("Operation ajoutee.", "Operation added.") : l("Operation mise a jour.", "Operation updated."));
      await loadMyAlliance(true);
    });
  };

  useEffect(() => {
    void loadMyAlliance();
    const interval = window.setInterval(() => void loadMyAlliance(true), 8000);
    return () => window.clearInterval(interval);
  }, [session, playerId]);

  useEffect(() => {
    if (mode === "directory" && session) void searchAlliances();
  }, [mode, session]);

  useEffect(() => {
    if (!allianceData) return;
    setEditMotto(String(allianceData.motto || ""));
    setEditDescription(String(allianceData.description || ""));
    setEditLogoUrl(String(allianceData.logoUrl || ""));
    setEditRecruiting(allianceData.isRecruiting !== false);
  }, [allianceData?.id, allianceData?.motto, allianceData?.description, allianceData?.logoUrl, allianceData?.isRecruiting]);

  const playUiClickSound = useCallback(() => {
    if (typeof window === "undefined") return;
    const AudioCtor = window.AudioContext || (window as typeof window & { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
    if (!AudioCtor) return;
    try {
      if (!uiAudioCtxRef.current) uiAudioCtxRef.current = new AudioCtor();
      const ctx = uiAudioCtxRef.current;
      if (!ctx) return;
      if (ctx.state === "suspended") {
        void ctx.resume().catch(() => undefined);
      }
      const now = ctx.currentTime;
      const master = ctx.createGain();
      master.gain.setValueAtTime(0.0001, now);
      master.gain.exponentialRampToValueAtTime(0.055, now + 0.01);
      master.gain.exponentialRampToValueAtTime(0.0001, now + 0.14);
      master.connect(ctx.destination);

      const oscA = ctx.createOscillator();
      const oscB = ctx.createOscillator();
      const filter = ctx.createBiquadFilter();
      filter.type = "bandpass";
      filter.frequency.setValueAtTime(1480, now);
      filter.Q.value = 2.4;

      oscA.type = "triangle";
      oscB.type = "square";
      oscA.frequency.setValueAtTime(1240, now);
      oscA.frequency.exponentialRampToValueAtTime(880, now + 0.12);
      oscB.frequency.setValueAtTime(880, now);
      oscB.frequency.exponentialRampToValueAtTime(620, now + 0.12);

      oscA.connect(filter);
      oscB.connect(filter);
      filter.connect(master);

      oscA.start(now);
      oscB.start(now);
      oscA.stop(now + 0.12);
      oscB.stop(now + 0.13);
    } catch {
      // UI feedback should never block the page.
    }
  }, []);

  useEffect(() => {
    const root = rootRef.current;
    if (!root) return;
    const onClick = (event: Event) => {
      const target = event.target as HTMLElement | null;
      if (!target) return;
      const interactive = target.closest("button, summary, .alliance-branch-card");
      if (!interactive) return;
      const disabled = interactive instanceof HTMLButtonElement ? interactive.disabled : interactive.getAttribute("aria-disabled") === "true";
      if (disabled) return;
      playUiClickSound();
    };
    root.addEventListener("click", onClick);
    return () => root.removeEventListener("click", onClick);
  }, [playUiClickSound]);

  const members = useMemo(() => {
    const source = Array.isArray(allianceData?.members) ? allianceData.members : [];
    return [...source]
      .map((member: any) => ({ ...member, role: normalizeRole(member?.role), username: String(member?.username || member?.userId || "-") }))
      .sort((a, b) => {
        const rank = (role: AllianceRole) => (role === "LEADER" ? 0 : role === "OFFICER" ? 1 : 2);
        const diff = rank(a.role) - rank(b.role);
        return diff !== 0 ? diff : a.username.localeCompare(b.username);
      });
  }, [allianceData?.members]);

  const leader = members.find((member: any) => member.role === "LEADER") ?? null;
  const officers = members.filter((member: any) => member.role === "OFFICER");
  const overview = allianceData?.overview ?? null;
  const publicStats = allianceData?.publicStats ?? {};
  const techTree = allianceData?.techTree ?? {};
  const operations = Array.isArray(allianceData?.operations) ? allianceData.operations : [];
  const votes = Array.isArray(allianceData?.votes) ? allianceData.votes : [];
  const quests = Array.isArray(allianceData?.quests) ? allianceData.quests : [];
  const logs = Array.isArray(allianceData?.logs) ? allianceData.logs : [];
  const applications = Array.isArray(allianceData?.applications) ? allianceData.applications : [];
  const allianceInvites = Array.isArray(allianceData?.invites) ? allianceData.invites : [];
  const branch = techTree[selectedBranchId] ?? { id: selectedBranchId, level: 0, progressWeighted: 0, investedResources: {} };
  const canManageAlliance = myRole === "LEADER" || myRole === "OFFICER";
  const canEditSettings = myRole === "LEADER";

  const memberRows = useMemo(() => {
    const statsMap = new Map((overview?.memberStats ?? []).map((row: any) => [String(row.userId), row]));
    const contributionPoints = allianceData?.contributionPoints ?? {};
    return members.map((member: any) => ({
      userId: member.userId,
      username: member.username,
      role: member.role,
      contributionXp: Number(contributionPoints[member.userId] || statsMap.get(member.userId)?.contributionXp || 0),
      productionPerHour: Number(statsMap.get(member.userId)?.productionPerHour || 0),
      fleets: Number(statsMap.get(member.userId)?.fleets || 0)
    })).sort((a, b) => b.contributionXp - a.contributionXp);
  }, [members, overview?.memberStats, allianceData?.contributionPoints]);

  const insights = useMemo(() => {
    const rows: Array<{ title: string; body: string }> = [];
    if (!inAlliance || !allianceData || !overview) return rows;
    if (members.length < Math.min(12, Number(allianceData.memberCap || 50))) rows.push({ title: l("Recrutement", "Recruitment"), body: l("Votre alliance n'est pas pleine. Plus de membres = plus de capital de recherche et de quetes completes plus vite.", "Your alliance is not full. More members means more research capital and faster quest completion.") });
    if (Number(overview.techLevels || 0) < Math.max(3, Math.floor(Number(allianceData.bastionLevel || 1) / 3))) rows.push({ title: l("Retard techno", "Tech lag"), body: l("Le Nexus progresse plus vite que l'arbre techno. Reallouez une partie des dons vers une branche commune.", "The nexus is growing faster than the tech tree. Redirect part of the funding into a common branch.") });
    if (operations.filter((operation: any) => String(operation.kind) === "harvest" && String(operation.status) === "active").length === 0) rows.push({ title: l("Carte sous-exploitee", "Map underused"), body: l("Aucune operation de collecte active. Utilisez le tableau d'operations pour signaler les champs prioritaires.", "No active harvest operation. Use the operations board to mark priority fields.") });
    if (rows.length === 0) rows.push({ title: l("Alliance stable", "Stable alliance"), body: l("Votre coalition est saine. Specialisez maintenant les branches techno selon votre doctrine.", "Your coalition is healthy. Now specialize tech branches around your doctrine.") });
    return rows;
  }, [allianceData, inAlliance, members.length, operations, overview]);
  const renderCreatePanel = () => (
    <section className="alliance-panel alliance-panel-v3">
      <div className="alliance-section-head">
        <div>
          <p className="alliance-eyebrow">{l("Fonder une coalition", "Create a coalition")}</p>
          <h3>{l("Lancer votre alliance Hyperstrux", "Launch your Hyperstrux alliance")}</h3>
        </div>
        <div className="alliance-cost-chip"><HandCoins size={16} /><span>{Object.entries(CREATE_COST).map(([k, v]) => `${fmt(Number(v))} ${resourceLabel(k)}`).join(" + ")}</span></div>
      </div>
      <form className="alliance-form-grid" onSubmit={(event) => void createAlliance(event)}>
        <label><span>{l("Nom", "Name")}</span><input value={createName} maxLength={32} onChange={(event) => setCreateName(event.target.value)} /></label>
        <label><span>{l("Tag", "Tag")}</span><input value={createTag} maxLength={5} onChange={(event) => setCreateTag(event.target.value.toUpperCase())} /></label>
        <label><span>{l("Devise", "Motto")}</span><input value={createMotto} maxLength={96} onChange={(event) => setCreateMotto(event.target.value)} /></label>
        <label><span>{l("Logo URL", "Logo URL")}</span><input value={createLogoUrl} maxLength={512} onChange={(event) => setCreateLogoUrl(event.target.value)} /></label>
        <label className="alliance-form-span-2"><span>{l("Description", "Description")}</span><textarea value={createDescription} maxLength={500} onChange={(event) => setCreateDescription(event.target.value)} /></label>
        <div className="alliance-form-actions alliance-form-span-2"><button type="submit" className="alliance-primary-btn" disabled={busyKey === "create"}><Plus size={16} /><span>{busyKey === "create" ? l("Creation...", "Creating...") : l("Creer l'alliance", "Create alliance")}</span></button></div>
      </form>
      <div className="alliance-onboarding-grid">
        <article className="alliance-mini-card"><strong>{l("Bastion commun", "Shared nexus")}</strong><p>{l("Investissements illimites, progression longue duree.", "Unlimited investment, long-term progression.")}</p></article>
        <article className="alliance-mini-card"><strong>{l("Arbre techno", "Tech tree")}</strong><p>{l("Cinq branches pour modeler la doctrine de l'alliance.", "Five branches to shape alliance doctrine.")}</p></article>
        <article className="alliance-mini-card"><strong>{l("Quetes coop", "Co-op quests")}</strong><p>{l("Des objectifs communs qui recompensent tous les membres.", "Shared goals that reward every member.")}</p></article>
      </div>
    </section>
  );

  const renderDirectory = () => (
    <section className="alliance-directory-shell">
      <section className="alliance-panel alliance-panel-v3">
        <div className="alliance-section-head"><div><p className="alliance-eyebrow">{l("Repertoire galactique", "Galactic directory")}</p><h3>{l("Cartographier les alliances actives", "Map active alliances")}</h3></div></div>
        <div className="alliance-search-bar"><Search size={16} /><input value={searchQuery} onChange={(event) => setSearchQuery(event.target.value)} placeholder={l("Nom, tag ou mot-cle", "Name, tag or keyword")} /><button type="button" className="alliance-primary-btn" disabled={searchBusy} onClick={() => void searchAlliances()}>{searchBusy ? l("Recherche...", "Searching...") : l("Rechercher", "Search")}</button></div>
        {!inAlliance ? <label className="alliance-inline-field"><span>{l("Message de candidature", "Application message")}</span><input value={applyMessage} maxLength={240} onChange={(event) => setApplyMessage(event.target.value)} /></label> : null}
        {searchError ? <p className="alliance-warning">{searchError}</p> : null}
      </section>
      <section className="alliance-search-grid">
        {searchItems.length === 0 ? <article className="alliance-panel alliance-panel-v3"><p>{l("Aucune alliance visible pour cette recherche.", "No alliance visible for this search.")}</p></article> : searchItems.map((item: any) => {
          const pendingHere = String(pendingApplication?.allianceId || "") === String(item.id || "");
          return (
            <article key={item.id} className="alliance-search-card">
              <div className="alliance-search-head">
                <div className="alliance-logo alliance-logo-small" style={allianceLogoStyle(item.logoUrl)}>{String(item.tag || "ALY").slice(0, 5)}</div>
                <div><h4>[{item.tag}] {item.name}</h4><p>{item.motto || l("Sans devise affichee.", "No motto published.")}</p></div>
                <span className={`alliance-role-badge ${item.isRecruiting ? "role-open" : "role-closed"}`}>{item.isRecruiting ? l("Ouverte", "Open") : l("Fermee", "Closed")}</span>
              </div>
              <p className="alliance-search-description">{item.description || l("Aucune doctrine publiee.", "No doctrine published.")}</p>
              <div className="alliance-inline-metrics">
                <span><Users size={14} /> {fmt(Number(item.memberCount || 0))} / {fmt(Number(item.memberCap || 50))}</span>
                <span><Wrench size={14} /> {l("Nexus niv.", "Nexus lvl")} {fmt(Number(item.bastionLevel || 1))}</span>
                <span><FlaskConical size={14} /> {fmt(Number(item.techLevels || 0))}</span>
                <span><Swords size={14} /> {fmt(Number(item.publicStats?.pvpVictories || 0))} PvP</span>
              </div>
              <div className="alliance-search-footer">
                <strong>{l("Score alliance", "Alliance score")}: {fmt(Number(item.publicStats?.pointsTotauxAlliance || 0))}</strong>
                {!inAlliance && item.isRecruiting && !pendingApplication ? <button type="button" className="alliance-primary-btn" disabled={busyKey === `apply_${item.id}`} onClick={() => window.confirm(l("Envoyer votre candidature ?", "Send your application?")) && void applyToAlliance(String(item.id))}>{busyKey === `apply_${item.id}` ? l("Envoi...", "Sending...") : l("Postuler", "Apply")}</button> : null}
                {!inAlliance && pendingHere ? <span className="alliance-role-badge role-member">{l("En attente", "Pending")}</span> : null}
              </div>
            </article>
          );
        })}
      </section>
    </section>
  );

  const renderOverview = () => (
    <>
      <section className="alliance-dashboard-grid">
        <article className="alliance-stat-card"><small>{l("Niveau alliance", "Alliance level")}</small><strong>{fmt(Number(overview?.level || allianceData?.bastionLevel || 1))}</strong><span>{pct(Number(overview?.progressPct || 0))}</span></article>
        <article className="alliance-stat-card"><small>{l("Classement global", "Global ranking")}</small><strong>{rankLabel(Number(allianceData?.rank || 0))}</strong><span>{fmt(Number(publicStats.pointsTotauxAlliance || 0))}</span></article>
        <article className="alliance-stat-card"><small>{l("Puissance militaire", "Military power")}</small><strong>{fmt(Number(overview?.totals?.totalPower || 0))}</strong><span>{fmt(Number(overview?.totals?.totalFleets || 0))} {l("flottes", "fleets")}</span></article>
        <article className="alliance-stat-card"><small>{l("Production globale", "Global production")}</small><strong>{fmt(Number(overview?.totals?.totalProductionPerHour || 0))}/h</strong><span>{fmt(Number(overview?.totals?.totalContributionXp || 0))} XP</span></article>
      </section>
      <section className="alliance-split-grid">
        <article className="alliance-panel alliance-panel-v3">
          <div className="alliance-section-head"><div><p className="alliance-eyebrow">{l("Bastion commun", "Shared bastion")}</p><h3>{l("Citadelle orbitale", "Orbital citadel")}</h3></div></div>
          <div className="alliance-progress alliance-progress-large"><div style={{ width: `${Math.max(0, Math.min(100, Number(overview?.progressPct || 0)))}%` }} /></div>
          <div className="alliance-progress-meta"><span>{fmt(Number(overview?.xpIntoLevel || 0))} / {fmt(Number(overview?.xpToNext || 0))} XP</span><span>{pct(Number(overview?.progressPct || 0))}</span></div>
          <div className="alliance-bonus-columns">
            <div><strong>{l("Bonus debloques", "Unlocked bonuses")}</strong><ul className="alliance-bonus-list">{(overview?.unlockedBastionBonuses?.unlocked || []).map((bonus: any) => <li key={`bonus_${bonus.level}_${bonus.type}`} className="alliance-bonus-chip"><span>{l("Niv.", "Lvl")} {bonus.level}</span><strong>{bonus.label}</strong></li>)}</ul></div>
            <div><strong>{l("Prochains paliers", "Next milestones")}</strong><ul className="alliance-bonus-list alliance-bonus-list-next">{(overview?.unlockedBastionBonuses?.next || []).map((bonus: any) => <li key={`next_${bonus.level}_${bonus.type}`} className="alliance-bonus-chip muted"><span>{l("Niv.", "Lvl")} {bonus.level}</span><strong>{bonus.label}</strong></li>)}</ul></div>
          </div>
        </article>
        <article className="alliance-panel alliance-panel-v3">
          <div className="alliance-section-head"><div><p className="alliance-eyebrow">{l("Lecture strategique", "Strategic reading")}</p><h3>{l("Priorites recommandees", "Recommended priorities")}</h3></div></div>
          <div className="alliance-insight-list">{insights.map((row, index) => <article key={`insight_${index}`} className="alliance-insight-card"><strong>{row.title}</strong><p>{row.body}</p></article>)}</div>
          <div className="alliance-log-list">{logs.slice(0, 6).map((entry: any, index: number) => <div key={`log_preview_${index}_${entry.at}`} className="alliance-log-item"><span>{entry.message}</span><small>{dateLabel(Number(entry.at || 0))}{entry.by ? ` - ${entry.by}` : ""}</small></div>)}</div>
        </article>
      </section>
    </>
  );

  const renderBastion = () => (
    <>
      <section className="alliance-panel alliance-panel-v3">
        <div className="alliance-section-head"><div><p className="alliance-eyebrow">{l("Nexus de coalition", "Coalition nexus")}</p><h3>{l("Investir dans la megastructure commune", "Invest into the shared megastructure")}</h3></div><div className="alliance-level-pill"><Wrench size={16} /><span>{l("Niveau", "Level")} {fmt(Number(overview?.level || allianceData?.bastionLevel || 1))}</span></div></div>
        <div className="alliance-progress alliance-progress-large"><div style={{ width: `${Math.max(0, Math.min(100, Number(overview?.progressPct || 0)))}%` }} /></div>
        <div className="alliance-resource-grid">{RESOURCE_IDS.map((id) => <label key={`bastion_${id}`} className="alliance-resource-card"><div><strong>{resourceLabel(id)}</strong><small>{l("Disponible", "Available")}: {fmt(Number(resourceAmounts[id] || 0))}</small></div><input type="number" min={0} step={1} value={bastionDraft[id]} onChange={(event) => setBastionDraft((current) => ({ ...current, [id]: event.target.value }))} /></label>)}</div>
        <div className="alliance-form-actions"><button type="button" className="alliance-primary-btn" disabled={busyKey === "invest"} onClick={() => void investBastion()}><HandCoins size={16} /><span>{busyKey === "invest" ? l("Injection...", "Injecting...") : l("Investir dans le Nexus", "Fund the nexus")}</span></button></div>
      </section>
      <section className="alliance-split-grid">
        <article className="alliance-panel alliance-panel-v3"><div className="alliance-section-head"><div><p className="alliance-eyebrow">{l("Ressources versees", "Invested resources")}</p><h3>{l("Historique d'investissement", "Investment ledger")}</h3></div></div><div className="alliance-contrib-list">{RESOURCE_IDS.map((id) => <div key={`inv_${id}`} className="alliance-contrib-item"><span>{resourceLabel(id)}</span><strong>{fmt(Number(allianceData?.investedResources?.[id] || overview?.totalInvestedResources?.[id] || 0))}</strong></div>)}</div></article>
        <article className="alliance-panel alliance-panel-v3"><div className="alliance-section-head"><div><p className="alliance-eyebrow">{l("Top contributeurs", "Top contributors")}</p><h3>{l("Qui porte le Nexus", "Who carries the nexus")}</h3></div></div><div className="alliance-contrib-list">{memberRows.slice(0, 8).map((row) => <div key={`row_${row.userId}`} className="alliance-contrib-item"><span>{row.username}<small>{roleLabel(row.role)}</small></span><strong>{fmt(row.contributionXp)} XP</strong></div>)}</div></article>
      </section>
    </>
  );

  const renderTech = () => (
    <>
      <section className="alliance-branch-grid">{(Object.keys(BRANCH_META) as BranchId[]).map((id) => { const meta = BRANCH_META[id]; const row = techTree[id] ?? { level: 0, progressWeighted: 0 }; const target = branchTarget(id, Number(row.level || 0)); const Icon = meta.icon; return <article key={id} className={`alliance-branch-card${selectedBranchId === id ? " selected" : ""}`} onClick={() => setSelectedBranchId(id)}><header><span className="alliance-branch-icon" style={{ color: meta.color }}><Icon size={18} /></span><div><strong>{language === "fr" ? meta.fr : meta.en}</strong><small>{language === "fr" ? meta.shortFr : meta.shortEn}</small></div></header><div className="alliance-inline-metrics"><span>{l("Niveau", "Level")} {fmt(Number(row.level || 0))}</span><span>{fmt(Number(row.progressWeighted || 0))} / {fmt(target)}</span></div><div className="alliance-progress"><div style={{ width: `${Math.max(0, Math.min(100, (Number(row.progressWeighted || 0) / target) * 100))}%` }} /></div></article>; })}</section>
      <section className="alliance-panel alliance-panel-v3"><div className="alliance-section-head"><div><p className="alliance-eyebrow">{language === "fr" ? BRANCH_META[selectedBranchId].fr : BRANCH_META[selectedBranchId].en}</p><h3>{l("Console de financement techno", "Tech funding console")}</h3><p>{language === "fr" ? BRANCH_META[selectedBranchId].tipFr : BRANCH_META[selectedBranchId].tipEn}</p></div><div className="alliance-level-pill"><FlaskConical size={16} /><span>{l("Niveau", "Level")} {fmt(Number(branch.level || 0))}</span></div></div><div className="alliance-progress alliance-progress-large"><div style={{ width: `${Math.max(0, Math.min(100, (Number(branch.progressWeighted || 0) / branchTarget(selectedBranchId, Number(branch.level || 0))) * 100))}%` }} /></div><div className="alliance-progress-meta"><span>{fmt(Number(branch.progressWeighted || 0))}</span><span>{l("Cout du prochain niveau", "Next level cost")}: {fmt(branchTarget(selectedBranchId, Number(branch.level || 0)))}</span></div><div className="alliance-resource-grid">{RESOURCE_IDS.map((id) => <label key={`tech_${id}`} className="alliance-resource-card"><div><strong>{resourceLabel(id)}</strong><small>{l("Disponible", "Available")}: {fmt(Number(resourceAmounts[id] || 0))}</small></div><input type="number" min={0} step={1} value={techDraft[id]} onChange={(event) => setTechDraft((current) => ({ ...current, [id]: event.target.value }))} /></label>)}</div><div className="alliance-form-actions"><button type="button" className="alliance-primary-btn" disabled={busyKey === `tech_${selectedBranchId}`} onClick={() => void fundTech()}><FlaskConical size={16} /><span>{busyKey === `tech_${selectedBranchId}` ? l("Financement...", "Funding...") : l("Financer cette branche", "Fund this branch")}</span></button></div></section>
    </>
  );
  const renderQuests = () => (
    <section className="alliance-quest-grid">
      {quests.length === 0 ? <article className="alliance-panel alliance-panel-v3"><p>{l("Aucune quete d'alliance n'est disponible.", "No alliance quest is available.")}</p></article> : quests.map((quest: any) => { const rows = rewardLines(quest.reward); const alreadyClaimed = Number(quest.claimedTier || 0) >= Number(quest.tier || 0); const canClaim = (myRole === "LEADER" || myRole === "OFFICER") && quest.completed && !alreadyClaimed; return <article key={quest.id} className="alliance-quest-card"><header><span className="alliance-branch-icon"><Pickaxe size={18} /></span><div><strong>{quest.title}</strong><small>{l("Palier", "Tier")} {fmt(Number(quest.tier || 1))}</small></div></header><p>{quest.description}</p><div className="alliance-progress alliance-progress-large"><div style={{ width: `${Math.max(0, Math.min(100, Number(quest.progressPct || 0)))}%` }} /></div><div className="alliance-progress-meta"><span>{fmt(Number(quest.progress || 0))} / {fmt(Number(quest.target || 0))}</span><span>{pct(Number(quest.progressPct || 0))}</span></div><div className="alliance-quest-reward-list">{rows.map((row) => <span key={`${quest.id}_${row}`}>{row}</span>)}</div><div className="alliance-search-footer">{alreadyClaimed ? <span className="alliance-role-badge role-member">{l("Deja recuperee", "Already claimed")}</span> : null}{!alreadyClaimed && !canClaim ? <span className="alliance-role-badge role-officer">{l("Chef / sous-chef requis", "Leader / officer required")}</span> : null}{canClaim ? <button type="button" className="alliance-primary-btn" disabled={busyKey === `quest_${quest.id}`} onClick={() => void claimQuest(String(quest.id))}>{busyKey === `quest_${quest.id}` ? l("Distribution...", "Distributing...") : l("Distribuer la recompense", "Distribute reward")}</button> : null}</div></article>; })}
    </section>
  );

  const renderOperations = () => (
    <>
      <section className="alliance-panel alliance-panel-v3"><div className="alliance-section-head"><div><p className="alliance-eyebrow">{l("Planification", "Planning")}</p><h3>{l("Tableau des operations", "Operations board")}</h3></div></div><div className="alliance-form-grid"><label><span>{l("Type", "Type")}</span><select value={operationKind} onChange={(event) => setOperationKind(event.target.value as OperationKind)}>{(Object.keys(OPERATION_LABELS) as OperationKind[]).map((kind) => <option key={kind} value={kind}>{language === "fr" ? OPERATION_LABELS[kind].fr : OPERATION_LABELS[kind].en}</option>)}</select></label><label><span>{l("Cible", "Target")}</span><input value={operationTarget} onChange={(event) => setOperationTarget(event.target.value)} /></label><label className="alliance-form-span-2"><span>{l("Titre", "Title")}</span><input value={operationTitle} maxLength={96} onChange={(event) => setOperationTitle(event.target.value)} /></label><label className="alliance-form-span-2"><span>{l("Note tactique", "Tactical note")}</span><textarea value={operationNote} maxLength={320} onChange={(event) => setOperationNote(event.target.value)} /></label><label><span>{l("Execution prevue", "Scheduled time")}</span><input type="datetime-local" value={operationScheduledAt} onChange={(event) => setOperationScheduledAt(event.target.value)} /></label><div className="alliance-form-actions"><button type="button" className="alliance-primary-btn" disabled={busyKey === "operation_create_new"} onClick={() => void manageOperation("create")}><Plus size={16} /><span>{busyKey === "operation_create_new" ? l("Creation...", "Creating...") : l("Ajouter l'operation", "Add operation")}</span></button></div></div></section>
      <section className="alliance-operations-grid">{operations.length === 0 ? <article className="alliance-panel alliance-panel-v3"><p>{l("Aucune operation ouverte.", "No operation is open.")}</p></article> : operations.map((operation: any) => <article key={operation.id} className={`alliance-operation-card status-${operation.status}`}><header><div><strong>{operation.title}</strong><small>{language === "fr" ? OPERATION_LABELS[operation.kind as OperationKind]?.fr || operation.kind : OPERATION_LABELS[operation.kind as OperationKind]?.en || operation.kind}</small></div><span className={`alliance-role-badge role-${operation.status === "completed" ? "member" : operation.status === "cancelled" ? "closed" : "open"}`}>{operation.status === "completed" ? l("Terminee", "Completed") : operation.status === "cancelled" ? l("Annulee", "Cancelled") : l("Active", "Active")}</span></header><p>{operation.note || l("Aucune note tactique.", "No tactical note.")}</p><div className="alliance-inline-metrics"><span><Target size={14} /> {operation.target || l("Cible a definir", "Target TBD")}</span><span><Users size={14} /> {operation.ownerUsername || operation.ownerUserId}</span><span><Clock3 size={14} /> {operation.scheduledAt ? dateLabel(Number(operation.scheduledAt)) : l("Sans horaire", "No schedule")}</span></div><div className="alliance-member-actions"><button type="button" disabled={busyKey === `operation_toggle_status_${operation.id}`} onClick={() => void manageOperation("toggle_status", operation.id)}>{operation.status === "completed" ? l("Reouvrir", "Reopen") : l("Marquer terminee", "Mark complete")}</button><button type="button" className="alliance-kick" disabled={busyKey === `operation_cancel_${operation.id}`} onClick={() => void manageOperation("cancel", operation.id)}>{l("Annuler", "Cancel")}</button><button type="button" className="alliance-danger-btn" disabled={busyKey === `operation_delete_${operation.id}`} onClick={() => void manageOperation("delete", operation.id)}>{l("Supprimer", "Delete")}</button></div></article>)}</section>
    </>
  );

  const renderVotes = () => (
    <>
      <section className="alliance-panel alliance-panel-v3"><div className="alliance-section-head"><div><p className="alliance-eyebrow">{l("Gouvernance", "Governance")}</p><h3>{l("Lancer un vote strategique", "Launch a strategic vote")}</h3></div></div><form className="alliance-form-grid" onSubmit={(event) => void launchVote(event)}><label><span>{l("Sujet", "Topic")}</span><select value={voteTopic} onChange={(event) => setVoteTopic(event.target.value as VoteTopic)}>{Object.entries(VOTE_LABELS).map(([key, label]) => <option key={key} value={key}>{language === "fr" ? label.fr : label.en}</option>)}</select></label><label className="alliance-form-span-2"><span>{l("Titre", "Title")}</span><input value={voteTitle} maxLength={96} onChange={(event) => setVoteTitle(event.target.value)} /></label><label className="alliance-form-span-2"><span>{l("Argumentaire", "Argumentation")}</span><textarea value={voteDescription} maxLength={512} onChange={(event) => setVoteDescription(event.target.value)} /></label><div className="alliance-form-actions alliance-form-span-2"><button type="submit" className="alliance-primary-btn" disabled={!canManageAlliance || busyKey === "vote_launch"}><Flag size={16} /><span>{busyKey === "vote_launch" ? l("Lancement...", "Launching...") : l("Lancer le vote", "Launch vote")}</span></button></div></form></section>
      <section className="alliance-vote-list">{votes.length === 0 ? <article className="alliance-panel alliance-panel-v3"><p>{l("Aucun vote en cours.", "No vote is running.")}</p></article> : votes.map((vote: any) => { const yesCount = Array.isArray(vote.yesBy) ? vote.yesBy.length : 0; const noCount = Array.isArray(vote.noBy) ? vote.noBy.length : 0; const myChoice = Array.isArray(vote.yesBy) && vote.yesBy.includes(playerId) ? "yes" : Array.isArray(vote.noBy) && vote.noBy.includes(playerId) ? "no" : ""; const canVote = String(vote.status) === "active" && Date.now() < Number(vote.endAt || 0) * 1000; return <article key={vote.id} className={`alliance-vote-card ${String(vote.status || "active")}`}><header><strong>{vote.title}</strong><span>{language === "fr" ? VOTE_LABELS[String(vote.topic)]?.fr || vote.topic : VOTE_LABELS[String(vote.topic)]?.en || vote.topic}</span></header><p>{vote.description}</p><div className="alliance-vote-stats"><small>{l("Oui", "Yes")}: {fmt(yesCount)}</small><small>{l("Non", "No")}: {fmt(noCount)}</small><small>{l("Fin", "Ends")}: {dateLabel(Number(vote.endAt || 0))}</small><small>{l("Initie par", "Initiated by")}: {vote.initiatedBy}</small></div><div className="alliance-vote-foot"><em>{myChoice === "yes" ? l("Vous avez vote OUI.", "You voted YES.") : myChoice === "no" ? l("Vous avez vote NON.", "You voted NO.") : l("Pas encore de vote enregistre.", "No vote recorded yet.")}</em><div className="alliance-vote-actions"><button type="button" disabled={!canVote || busyKey === `vote_${vote.id}_yes`} onClick={() => void castVote(vote.id, "yes")}>{l("Voter oui", "Vote yes")}</button><button type="button" disabled={!canVote || busyKey === `vote_${vote.id}_no`} onClick={() => void castVote(vote.id, "no")}>{l("Voter non", "Vote no")}</button></div></div></article>; })}</section>
    </>
  );

  const renderMembers = () => (
    <>
      <section className="alliance-split-grid">
        <article className="alliance-panel alliance-panel-v3"><div className="alliance-section-head"><div><p className="alliance-eyebrow">{l("Roster", "Roster")}</p><h3>{l("Membres actifs", "Active members")}</h3></div></div><div className="alliance-contrib-list">{memberRows.map((row) => { const isSelf = row.userId === playerId; const canPromote = myRole === "LEADER" && row.role === "MEMBER" && !isSelf; const canDemote = myRole === "LEADER" && row.role === "OFFICER" && !isSelf; const canTransfer = myRole === "LEADER" && row.role !== "LEADER" && !isSelf; const canKick = (myRole === "LEADER" && row.role !== "LEADER" && !isSelf) || (myRole === "OFFICER" && row.role === "MEMBER" && !isSelf); return <div key={row.userId} className="alliance-member-card"><div className="alliance-member-core"><div><strong>{row.username}</strong><small>{roleLabel(row.role)}</small></div><div className="alliance-member-stats"><span>{fmt(row.contributionXp)} XP</span><span>{fmt(row.productionPerHour)}/h</span><span>{fmt(row.fleets)} {l("flottes", "fleets")}</span></div></div><div className="alliance-member-actions">{canPromote ? <button type="button" onClick={() => window.confirm(l("Promouvoir ce membre ?", "Promote this member?")) && void memberAction("promote_officer", row.userId)}>{l("Promouvoir", "Promote")}</button> : null}{canDemote ? <button type="button" onClick={() => window.confirm(l("Retrograder ce sous-chef ?", "Demote this officer?")) && void memberAction("demote_officer", row.userId)}>{l("Retrograder", "Demote")}</button> : null}{canTransfer ? <button type="button" onClick={() => window.confirm(l("Transferer le commandement ?", "Transfer leadership?")) && void memberAction("transfer_leadership", row.userId)}>{l("Nommer chef", "Make leader")}</button> : null}{canKick ? <button type="button" className="alliance-kick" onClick={() => window.confirm(l("Exclure ce membre ?", "Kick this member?")) && void memberAction("kick_member", row.userId)}>{l("Exclure", "Kick")}</button> : null}</div></div>; })}</div></article>
        <article className="alliance-panel alliance-panel-v3"><div className="alliance-section-head"><div><p className="alliance-eyebrow">{l("Recrutement", "Recruitment")}</p><h3>{l("Candidatures et invitations", "Applications and invites")}</h3></div></div>{canManageAlliance ? <div className="alliance-form-grid compact"><label className="alliance-form-span-2"><span>{l("Pseudo ou userId", "Username or userId")}</span><input value={inviteTarget} onChange={(event) => setInviteTarget(event.target.value)} /></label><div className="alliance-form-actions alliance-form-span-2"><button type="button" className="alliance-primary-btn" disabled={busyKey.startsWith("invite_")} onClick={() => void invitePlayer()}><Plus size={16} /><span>{l("Envoyer une invitation", "Send invitation")}</span></button></div></div> : <p>{l("Seul le commandement peut gerer le recrutement.", "Only command staff can manage recruitment.")}</p>}<div className="alliance-subsection"><strong>{l("Candidatures en attente", "Pending applications")}</strong>{applications.length === 0 ? <p>{l("Aucune candidature.", "No application.")}</p> : null}<div className="alliance-contrib-list">{applications.map((application: any) => <div key={`app_${application.userId}`} className="alliance-contrib-item alliance-member-row"><span>{application.username}{application.message ? <small>{application.message}</small> : null}</span>{canManageAlliance ? <div className="alliance-member-actions"><button type="button" onClick={() => window.confirm(l("Accepter cette candidature ?", "Approve this application?")) && void reviewApplication(application.userId, true)}>{l("Accepter", "Approve")}</button><button type="button" className="alliance-kick" onClick={() => window.confirm(l("Refuser cette candidature ?", "Reject this application?")) && void reviewApplication(application.userId, false)}>{l("Refuser", "Reject")}</button></div> : null}</div>)}</div></div><div className="alliance-subsection"><strong>{l("Invitations actives", "Active invitations")}</strong>{allianceInvites.length === 0 ? <p>{l("Aucune invitation active.", "No active invitation.")}</p> : null}<div className="alliance-contrib-list">{allianceInvites.map((invite: any) => <div key={`invite_${invite.targetUserId}_${invite.expiresAt}`} className="alliance-contrib-item"><span>{invite.targetUsername || invite.targetUserId || "-"}</span><strong>{l("Expire", "Expires")}: {invite.expiresAt ? dateLabel(Number(invite.expiresAt || 0)) : l("Bientot", "Soon")}</strong></div>)}</div></div></article>
      </section>
    </>
  );

  const renderLog = () => <section className="alliance-panel alliance-panel-v3"><div className="alliance-section-head"><div><p className="alliance-eyebrow">{l("Historique", "History")}</p><h3>{l("Journal chronologique", "Chronological log")}</h3></div></div><div className="alliance-log-list alliance-log-list-deep">{logs.length === 0 ? <p>{l("Aucune entree de journal.", "No log entry yet.")}</p> : null}{logs.map((entry: any, index: number) => <div key={`log_${index}_${entry.at}`} className="alliance-log-item"><span>{entry.message}</span><small>{dateLabel(Number(entry.at || 0))}{entry.by ? ` - ${entry.by}` : ""}</small></div>)}</div></section>;

  const renderSettings = () => <section className="alliance-panel alliance-panel-v3"><div className="alliance-section-head"><div><p className="alliance-eyebrow">{l("Commandement", "Command")}</p><h3>{l("Parametres d'alliance", "Alliance settings")}</h3></div></div>{canEditSettings ? <div className="alliance-form-grid"><label><span>{l("Devise", "Motto")}</span><input value={editMotto} maxLength={96} onChange={(event) => setEditMotto(event.target.value)} /></label><label><span>{l("Logo URL", "Logo URL")}</span><input value={editLogoUrl} maxLength={512} onChange={(event) => setEditLogoUrl(event.target.value)} /></label><label className="alliance-form-span-2"><span>{l("Description", "Description")}</span><textarea value={editDescription} maxLength={500} onChange={(event) => setEditDescription(event.target.value)} /></label><label className="alliance-checkline alliance-form-span-2"><input type="checkbox" checked={editRecruiting} onChange={(event) => setEditRecruiting(event.target.checked)} /><span>{l("Alliance ouverte au recrutement", "Alliance open to recruitment")}</span></label><div className="alliance-form-actions alliance-form-span-2"><button type="button" className="alliance-primary-btn" disabled={busyKey === "settings"} onClick={() => void updateAllianceSettings()}><Settings2 size={16} /><span>{busyKey === "settings" ? l("Sauvegarde...", "Saving...") : l("Sauvegarder", "Save settings")}</span></button></div></div> : <div className="alliance-note-box"><strong>{l("Acces restreint", "Restricted access")}</strong><span>{l("Seul le chef modifie la fiche publique. Les sous-chefs pilotent le quotidien.", "Only the leader edits the public profile. Officers drive day-to-day coordination.")}</span></div>}</section>;

  const renderCommand = () => {
    if (!inAlliance || !allianceData) {
      return <div className="alliance-onboarding-stack">{renderCreatePanel()}{pendingApplication ? <section className="alliance-panel alliance-panel-v3"><div className="alliance-section-head"><div><p className="alliance-eyebrow">{l("Candidature en attente", "Pending application")}</p><h3>[{String(pendingApplication.tag || "-")}] {String(pendingApplication.name || "-")}</h3></div></div></section> : null}{incomingInvites.length > 0 ? <section className="alliance-panel alliance-panel-v3"><div className="alliance-section-head"><div><p className="alliance-eyebrow">{l("Invitations", "Invitations")}</p><h3>{l("Coalitions qui vous ouvrent leurs portes", "Coalitions inviting you")}</h3></div></div><div className="alliance-contrib-list">{incomingInvites.map((invite: any) => <div key={`incoming_${invite.allianceId}_${invite.createdAt}`} className="alliance-contrib-item alliance-member-row"><span>[{String(invite.allianceTag || "-")}] {String(invite.allianceName || invite.allianceId || "-")}<small>{l("Invite par", "Invited by")} {invite.byUsername || invite.byUserId || "-"}</small></span><div className="alliance-member-actions"><button type="button" onClick={() => window.confirm(l("Accepter cette invitation ?", "Accept this invitation?")) && void respondInvite(String(invite.allianceId || ""), true)}>{l("Accepter", "Accept")}</button><button type="button" className="alliance-kick" onClick={() => window.confirm(l("Refuser cette invitation ?", "Decline this invitation?")) && void respondInvite(String(invite.allianceId || ""), false)}>{l("Refuser", "Decline")}</button></div></div>)}</div></section> : null}</div>;
    }
    return <div className="alliance-command-layout"><aside className="alliance-sidebar-v3"><div className="alliance-sidebar-head"><div className="alliance-logo" style={allianceLogoStyle(allianceData.logoUrl)}>{String(allianceData.tag || "ALY").slice(0, 5)}</div><div><strong>{allianceData.name}</strong><small>{allianceData.motto || l("Aucune devise", "No motto")}</small></div></div><div className="alliance-view-nav">{VIEW_META.map((entry) => { const Icon = entry.icon; return <button key={entry.id} type="button" className={view === entry.id ? "active" : ""} onClick={() => setView(entry.id)}><Icon size={16} /><span>{language === "fr" ? entry.fr : entry.en}</span><ChevronRight size={14} /></button>; })}</div><div className="alliance-sidebar-meta"><span><Crown size={14} /> {leader?.username || leader?.userId || "-"}</span><span><Users size={14} /> {fmt(Number(allianceData.memberCount || 0))} / {fmt(Number(allianceData.memberCap || 50))}</span><span><Medal size={14} /> {rankLabel(Number(allianceData.rank || 0))}</span></div><button type="button" className="alliance-danger-btn alliance-danger-full" disabled={busyKey === "leave"} onClick={() => window.confirm(myRole === "LEADER" && members.length === 1 ? l("Cette action dissout l'alliance. Continuer ?", "This action disbands the alliance. Continue?") : l("Confirmer votre depart ?", "Confirm leaving the alliance?")) && void leaveAlliance()}>{myRole === "LEADER" && members.length === 1 ? l("Dissoudre l'alliance", "Disband alliance") : l("Quitter l'alliance", "Leave alliance")}</button></aside><section className="alliance-content-v3"><section className="alliance-hero alliance-hero-v3"><div className="alliance-identity"><p className="alliance-eyebrow">{l("Centre de commandement d'alliance", "Alliance command center")}</p><h2>[{allianceData.tag}] {allianceData.name}</h2><p>{allianceData.description || l("Aucune doctrine publiee.", "No doctrine published.")}</p><div className="alliance-inline-metrics"><span><Shield size={14} /> {roleLabel(myRole)}</span><span><Coins size={14} /> {fmt(Number(publicStats.pointsTotauxAlliance || 0))} {l("points alliance", "alliance points")}</span><span><Swords size={14} /> {fmt(Number(overview?.pvpVictories || publicStats.pvpVictories || 0))} PvP</span><span><Clock3 size={14} /> {new Date(nowMs).toLocaleTimeString(language === "fr" ? "fr-FR" : "en-US")}</span></div></div><div className="alliance-summary-grid"><article className="alliance-summary-card"><small>{l("Membres", "Members")}</small><strong>{fmt(Number(allianceData.memberCount || 0))}</strong><span>{fmt(officers.length)} {l("sous-chefs", "officers")}</span></article><article className="alliance-summary-card"><small>{l("Niveau Nexus", "Nexus level")}</small><strong>{fmt(Number(allianceData.bastionLevel || 1))}</strong><span>{pct(Number(overview?.progressPct || 0))}</span></article><article className="alliance-summary-card"><small>{l("Technologies", "Technologies")}</small><strong>{fmt(Number(overview?.techLevels || 0))}</strong><span>{l("branches actives", "active branches")}</span></article><article className="alliance-summary-card"><small>{l("Points de guerre", "War points")}</small><strong>{fmt(Number(allianceData.warPoints || 0))}</strong><span>{fmt(Number(publicStats.warsWon || 0))} / {fmt(Number(publicStats.warsLost || 0))}</span></article></div></section>{view === "overview" ? renderOverview() : null}{view === "bastion" ? renderBastion() : null}{view === "tech" ? renderTech() : null}{view === "quests" ? renderQuests() : null}{view === "operations" ? renderOperations() : null}{view === "votes" ? renderVotes() : null}{view === "members" ? renderMembers() : null}{view === "log" ? renderLog() : null}{view === "settings" ? renderSettings() : null}</section></div>;
  };

  return <main ref={rootRef} className="alliance-shell alliance-shell-v3"><section className="alliance-topbar"><div className="alliance-mode-switch alliance-mode-switch-v3"><button className={mode === "command" ? "active" : ""} onClick={() => setMode("command")}><Shield size={16} /><span>{l("Mon alliance", "My alliance")}</span></button><button className={mode === "directory" ? "active" : ""} onClick={() => setMode("directory")}><Search size={16} /><span>{l("Repertoire", "Directory")}</span></button></div></section>{loading ? <p className="alliance-warning">{l("Chargement de l'etat-major d'alliance...", "Loading alliance command data...")}</p> : null}{loadError ? <p className="alliance-warning">{loadError}</p> : null}{actionError ? <p className="alliance-warning">{actionError}</p> : null}{actionSuccess ? <p className="alliance-success">{actionSuccess}</p> : null}{mode === "directory" ? renderDirectory() : renderCommand()}</main>;
}




