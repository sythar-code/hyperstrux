import { Client, Session } from "@heroiclabs/nakama-js";
import {
  BellRing,
  Coins,
  HandCoins,
  Package,
  Shield,
  Sparkles,
  Store,
  TrendingUp,
  Wallet
} from "lucide-react";
import { FormEvent, useCallback, useEffect, useState } from "react";

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
type MarketSection = "public" | "alliance" | "myOrders" | "myTrades" | "private" | "stats";
type MarketType = "public" | "alliance" | "private";
type OrderSide = "buy" | "sell";

type Props = {
  language: UILanguage;
  client: Client;
  session: Session | null;
  playerId: string;
  resourceAmounts: Record<string, number>;
  onEconomyRefresh: () => Promise<void> | void;
  onEconomySnapshot?: (snapshot: { resources?: Record<string, number>; credits?: number; wallet?: { credits?: number } } | null | undefined) => void;
  onUnauthorized: () => void;
};

const RESOURCE_META: Array<{
  id: ResourceId;
  rarity: number;
  bundleSize: number;
  fr: string;
  en: string;
  icon: string;
}> = [
  { id: "carbone", rarity: 10, bundleSize: 1000, fr: "Carbone", en: "Carbon", icon: "/room-images/ressource-carbone.png" },
  { id: "titane", rarity: 25, bundleSize: 1000, fr: "Titane", en: "Titanium", icon: "/room-images/ressource-Titane.png" },
  { id: "osmium", rarity: 45, bundleSize: 100, fr: "Osmium", en: "Osmium", icon: "/room-images/ressource-Osmium.png" },
  { id: "adamantium", rarity: 65, bundleSize: 100, fr: "Adamantium", en: "Adamantium", icon: "/room-images/ressource-Adamantium.png" },
  { id: "magmatite", rarity: 72, bundleSize: 100, fr: "Magmatite", en: "Magmatite", icon: "/room-images/ressource-Magmatite.png" },
  { id: "neodyme", rarity: 75, bundleSize: 100, fr: "Neodyme", en: "Neodymium", icon: "/room-images/ressource-Neodyme.png" },
  { id: "chronium", rarity: 82, bundleSize: 100, fr: "Chronium", en: "Chronium", icon: "/room-images/ressource-Chronium.png" },
  { id: "aetherium", rarity: 88, bundleSize: 10, fr: "Aetherium", en: "Aetherium", icon: "/room-images/ressource-Aetherium.png" },
  { id: "isotope7", rarity: 94, bundleSize: 10, fr: "Isotope-7", en: "Isotope-7", icon: "/room-images/ressource-Isotope-7.png" },
  { id: "singulite", rarity: 100, bundleSize: 10, fr: "Singulite", en: "Singulite", icon: "/room-images/ressource-Singulite.png" }
];

const MARKET_FEE_BPS: Record<MarketType, { tax: number; listing: number; cancel: number }> = {
  public: { tax: 600, listing: 100, cancel: 50 },
  private: { tax: 200, listing: 0, cancel: 0 },
  alliance: { tax: 100, listing: 0, cancel: 0 }
};
const MARKET_ORDER_LIMITS: Record<ResourceId, { min: number; max: number }> = {
  carbone: { min: 10, max: 3000000 },
  titane: { min: 3000, max: 2000000 },
  osmium: { min: 500, max: 600000 },
  adamantium: { min: 200, max: 300000 },
  magmatite: { min: 150, max: 180000 },
  neodyme: { min: 120, max: 160000 },
  chronium: { min: 80, max: 120000 },
  aetherium: { min: 25, max: 40000 },
  isotope7: { min: 15, max: 25000 },
  singulite: { min: 5, max: 12000 }
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
  return extractRpcErrorMessage(err).toLowerCase().includes("unauthorized");
};

const scaledToCredits = (scaled: number) => Math.max(0, Number(scaled || 0)) / 1000;
const MARKET_UNLOCK_LEVEL: Partial<Record<MarketSection, number>> = {
  public: 1,
  private: 3,
  alliance: 8
};
const fmtSparkPath = (values: number[], width = 320, height = 72) => {
  if (values.length < 2) return "";
  const min = Math.min(...values);
  const max = Math.max(...values);
  const range = Math.max(1, max - min);
  return values
    .map((value, index) => {
      const x = (index / Math.max(1, values.length - 1)) * width;
      const y = height - ((value - min) / range) * height;
      return `${index === 0 ? "M" : "L"}${x.toFixed(1)} ${y.toFixed(1)}`;
    })
    .join(" ");
};

const getBuyableQuantityForCredits = (
  creditsScaled: number,
  unitPriceScaled: number,
  listingFeeBps: number,
  hardCap: number
) => {
  const safeCredits = Math.max(0, Math.floor(Number(creditsScaled || 0)));
  const safeUnitPrice = Math.max(0, Math.floor(Number(unitPriceScaled || 0)));
  const safeCap = Math.max(0, Math.floor(Number(hardCap || 0)));
  if (safeCredits <= 0 || safeUnitPrice <= 0 || safeCap <= 0) return 0;
  let low = 0;
  let high = Math.min(safeCap, Math.floor(safeCredits / safeUnitPrice));
  while (low < high) {
    const mid = Math.floor((low + high + 1) / 2);
    const gross = safeUnitPrice * mid;
    const total = gross + Math.round((gross * listingFeeBps) / 10000);
    if (total <= safeCredits) {
      low = mid;
    } else {
      high = mid - 1;
    }
  }
  return low;
};

export default function MarketCommandScreen({
  language,
  client,
  session,
  playerId,
  resourceAmounts,
  onEconomyRefresh,
  onEconomySnapshot,
  onUnauthorized
}: Props) {
  const l = useCallback((fr: string, en: string) => (language === "en" ? en : fr), [language]);
  const locale = language === "fr" ? "fr-FR" : "en-US";
  const fmtQty = (value: number) => Math.max(0, Math.floor(Number(value || 0))).toLocaleString(locale);
  const fmtCredits = (scaled: number) => scaledToCredits(scaled).toLocaleString(locale, { minimumFractionDigits: 0, maximumFractionDigits: 3 });
  const resourceLabel = (id: ResourceId) => (language === "en" ? RESOURCE_META.find((row) => row.id === id)?.en : RESOURCE_META.find((row) => row.id === id)?.fr) || id;
  const dateLabel = (ts: number) => (ts > 0 ? new Date(ts * 1000).toLocaleString(locale) : l("Jamais", "Never"));

  const [section, setSection] = useState<MarketSection>("public");
  const [selectedResource, setSelectedResource] = useState<ResourceId>("carbone");
  const [wallet, setWallet] = useState({ credits: 0, creditSubunits: 0, reservedCredits: 0 });
  const [reservedResources, setReservedResources] = useState<Record<string, number>>({});
  const [marketAccess, setMarketAccess] = useState<any>({
    bourseLevel: 0,
    orderCap: 0,
    publicUnlocked: false,
    privateUnlocked: false,
    allianceUnlocked: false,
    alertsUnlocked: false,
    advancedHistoryUnlocked: false
  });
  const [alerts, setAlerts] = useState<any[]>([]);
  const [profile, setProfile] = useState<any>({});
  const [book, setBook] = useState<any>(null);
  const [myOrders, setMyOrders] = useState<any[]>([]);
  const [myTrades, setMyTrades] = useState<any[]>([]);
  const [privateContracts, setPrivateContracts] = useState<any[]>([]);
  const [stats, setStats] = useState<any>(null);
  const [bookLoading, setBookLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [actionBusy, setActionBusy] = useState("");
  const [orderSide, setOrderSide] = useState<OrderSide>("buy");
  const [priceInput, setPriceInput] = useState("");
  const [quantityInput, setQuantityInput] = useState("");
  const [contractTarget, setContractTarget] = useState("");
  const [contractHours, setContractHours] = useState("24");
  const [alertPriceInput, setAlertPriceInput] = useState("");
  const [alertCondition, setAlertCondition] = useState<"above" | "below">("above");
  const rpc = useCallback(
    async (rpcId: string, body: Record<string, any> = {}) => {
      if (!session) throw new Error("Missing session.");
      try {
        const res = await client.rpc(session, rpcId, JSON.stringify(body));
        const parsed = parseJsonObject((res as any)?.payload ?? res);
        const nested = parseJsonObject(parsed?.payload);
        return Object.keys(nested).length > 0 ? nested : parsed;
      } catch (err) {
        if (err instanceof Response) {
          try {
            const raw = await err.text();
            const parsed = parseJsonObject(raw);
            const detail =
              String(parsed?.message || parsed?.error || parsed?.msg || "").trim() ||
              String(raw || "").trim();
            if (detail) throw new Error(detail);
          } catch (parseErr) {
            if (parseErr instanceof Error && parseErr.message.trim()) throw parseErr;
          }
        }
        throw err;
      }
    },
    [client, session]
  );

  const fail = useCallback(
    (err: unknown, fallbackFr: string, fallbackEn: string) => {
      if (isUnauthorizedError(err)) {
        onUnauthorized();
        return "";
      }
      return extractRpcErrorMessage(err) || l(fallbackFr, fallbackEn);
    },
    [l, onUnauthorized]
  );

  const loadWallet = useCallback(async () => {
    if (!session) return;
    try {
      const payload = await rpc("rpc_market_get_wallet");
      setWallet({
        credits: Math.max(0, Math.floor(Number((payload?.wallet?.credits ?? payload?.wallet?.orbitalCredits) || 0))),
        creditSubunits: Math.max(0, Math.floor(Number(payload?.wallet?.creditSubunits || 0))),
        reservedCredits: Math.max(0, Math.floor(Number(payload?.wallet?.reservedCredits || 0)))
      });
      setReservedResources(payload?.reservedResources && typeof payload.reservedResources === "object" ? payload.reservedResources : {});
      setMarketAccess(payload?.marketAccess || {});
      setAlerts(Array.isArray(payload?.alerts) ? payload.alerts : []);
      setProfile(payload?.profile || {});
      onEconomySnapshot?.(payload);
    } catch (err) {
      const message = fail(err, "Impossible de charger le wallet marche.", "Unable to load market wallet.");
      if (message) setError(message);
    }
  }, [fail, onEconomySnapshot, rpc, session]);

  const loadBook = useCallback(
    async (marketType: MarketType) => {
      if (!session) return;
      setBookLoading(true);
      try {
        const rpcId = marketType === "alliance" ? "rpc_market_get_alliance_book" : "rpc_market_get_book";
        const payload = await rpc(rpcId, { marketType, resourceType: selectedResource, limit: 30 });
        setBook(payload);
      } catch (err) {
        const message = fail(err, "Impossible de charger le carnet d'ordres.", "Unable to load the order book.");
        if (message) setError(message);
      } finally {
        setBookLoading(false);
      }
    },
    [fail, rpc, selectedResource, session]
  );

  const refreshLists = useCallback(async () => {
    if (!session) return;
    const [ordersPayload, tradesPayload, contractsPayload, statsPayload] = await Promise.all([
      rpc("rpc_market_get_my_orders").catch(() => ({ items: [] })),
      rpc("rpc_market_get_my_trades").catch(() => ({ items: [] })),
      rpc("rpc_market_list_private_contracts").catch(() => ({ items: [] })),
      rpc("rpc_market_get_player_market_stats").catch(() => ({ stats: null }))
    ]);
    setMyOrders(Array.isArray(ordersPayload?.items) ? ordersPayload.items : []);
    setMyTrades(Array.isArray(tradesPayload?.items) ? tradesPayload.items : []);
    setPrivateContracts(Array.isArray(contractsPayload?.items) ? contractsPayload.items : []);
    setStats(statsPayload?.stats ?? null);
  }, [rpc, session]);

  const refreshAfterMutation = useCallback(
    async (marketType?: MarketType) => {
      await Promise.all([loadWallet(), refreshLists(), onEconomyRefresh()]);
      if (marketType === "public" || marketType === "alliance") await loadBook(marketType);
    },
    [loadBook, loadWallet, onEconomyRefresh, refreshLists]
  );

  useEffect(() => {
    if (!session) return;
    void Promise.all([loadWallet(), refreshLists()]);
  }, [session?.user_id]);

  useEffect(() => {
    if (!session) return;
    if (section === "public") {
      if (!marketAccess.publicUnlocked) {
        setBook(null);
        return;
      }
      void loadBook("public");
    }
    if (section === "alliance") {
      if (!marketAccess.allianceUnlocked) {
        setBook(null);
        return;
      }
      void loadBook("alliance");
    }
  }, [session?.user_id, section, selectedResource, marketAccess.publicUnlocked, marketAccess.allianceUnlocked]);

  const activeMarketType: MarketType = section === "alliance" ? "alliance" : "public";
  const activeMarketUnlocked =
    activeMarketType === "alliance" ? Boolean(marketAccess.allianceUnlocked) : Boolean(marketAccess.publicUnlocked);
  const sectionLocked =
    (section === "public" && !marketAccess.publicUnlocked) ||
    (section === "private" && !marketAccess.privateUnlocked) ||
    (section === "alliance" && !marketAccess.allianceUnlocked);
  const meta = RESOURCE_META.find((row) => row.id === selectedResource)!;
  const quantity = Math.max(0, Math.floor(Number(quantityInput || 0)));
  const displayPrice = Math.max(0, Number(priceInput || 0));
  const unitPrice = Math.max(0, Math.round((displayPrice * 1000) / meta.bundleSize));
  const quantityLimits = MARKET_ORDER_LIMITS[selectedResource];
  const grossScaled = unitPrice * quantity;
  const feeCfg = MARKET_FEE_BPS[activeMarketType];
  const listingFeeScaled = orderSide === "buy" ? Math.round((grossScaled * feeCfg.listing) / 10000) : 0;
  const executionTaxScaled = Math.round((grossScaled * feeCfg.tax) / 10000);
  const availableResourceQty = Math.max(0, Math.floor(Number(resourceAmounts[selectedResource] || 0)));
  const selectedReservedResourceQty = Math.max(0, Math.floor(Number(reservedResources[selectedResource] || 0)));
  const displayCredits = Math.max(0, Math.floor(Number(wallet.credits || 0)));
  const availableCreditsScaled = displayCredits * 1000 + Math.max(0, Math.floor(Number(wallet.creditSubunits || 0)));
  const reservedCreditsScaled = Math.max(0, Math.floor(Number(wallet.reservedCredits || 0))) * 1000;
  const bestBidScaled = Math.max(0, Math.floor(Number(book?.bestBid || 0))) * meta.bundleSize;
  const bestAskScaled = Math.max(0, Math.floor(Number(book?.bestAsk || 0))) * meta.bundleSize;
  const lastTradeScaled = Math.max(0, Math.floor(Number(book?.stats24h?.lastPrice || 0))) * meta.bundleSize;
  const spreadScaled = bestBidScaled > 0 && bestAskScaled > 0 ? Math.max(0, bestAskScaled - bestBidScaled) : 0;
  const tradeCount24h = Math.max(0, Math.floor(Number(book?.stats24h?.tradeCount || 0)));
  const maxBuyQuantity = getBuyableQuantityForCredits(availableCreditsScaled, unitPrice, feeCfg.listing, quantityLimits.max);
  const quantityWithinBounds = quantity >= quantityLimits.min && quantity <= quantityLimits.max;
  const canSubmit =
    activeMarketUnlocked &&
    unitPrice > 0 &&
    quantity > 0 &&
    quantityWithinBounds &&
    (orderSide === "buy" ? grossScaled + listingFeeScaled <= availableCreditsScaled : quantity <= availableResourceQty);
  const snapshotValues = (book?.snapshots || []).map((row: any) => scaledToCredits(Number(row.closePrice || row.openPrice || 0)));
  const sparkPath = fmtSparkPath(snapshotValues);
  const submitBlockReason = !activeMarketUnlocked
    ? l("Ce marche n'est pas encore debloque.", "This market is not unlocked yet.")
    : unitPrice <= 0
      ? l("Renseigne un prix par lot valide.", "Set a valid price per bundle.")
      : quantity <= 0
        ? l("Renseigne une quantite valide.", "Set a valid quantity.")
        : !quantityWithinBounds
          ? l(
              `Quantite hors bornes. Utilise entre ${fmtQty(quantityLimits.min)} et ${fmtQty(quantityLimits.max)} unites.`,
              `Quantity outside limits. Use between ${fmtQty(quantityLimits.min)} and ${fmtQty(quantityLimits.max)} units.`
            )
          : orderSide === "buy" && grossScaled + listingFeeScaled > availableCreditsScaled
            ? l("Credits insuffisants pour couvrir achat + frais.", "Insufficient credits to cover buy order and fees.")
            : orderSide === "sell" && quantity > availableResourceQty
              ? l("Stock disponible insuffisant pour cette vente.", "Insufficient available stock for this sale.")
              : "";
  const orderDeskHint = orderSide === "buy"
    ? l(
        "Les credits sont reserves immediatement. Si un vendeur correspond au prix, la livraison est instantanee.",
        "Credits are reserved immediately. If a seller matches the price, delivery is instant."
      )
    : l(
        "La ressource est retiree du stock disponible et placee en reserve tant que l'ordre reste ouvert.",
        "The resource is removed from available stock and reserved while the order stays open."
      );

  const fillQty = (ratio: number) => {
    if (orderSide === "buy") {
      const target = unitPrice > 0 ? Math.floor(maxBuyQuantity * ratio) : 0;
      setQuantityInput(String(target));
      return;
    }
    setQuantityInput(String(Math.floor(availableResourceQty * ratio)));
  };

  const applyMutationPayload = useCallback(
    async (payload: Record<string, any> | null | undefined, marketType?: MarketType) => {
      const account = payload?.account && typeof payload.account === "object" ? payload.account : payload;
      if (account?.wallet && typeof account.wallet === "object") {
        setWallet({
          credits: Math.max(0, Math.floor(Number((account.wallet.credits ?? account.wallet.orbitalCredits) || 0))),
          creditSubunits: Math.max(0, Math.floor(Number(account.wallet.creditSubunits || 0))),
          reservedCredits: Math.max(0, Math.floor(Number(account.wallet.reservedCredits || 0)))
        });
      }
      if (account?.reservedResources && typeof account.reservedResources === "object") {
        setReservedResources(account.reservedResources);
      }
      if (account?.marketAccess && typeof account.marketAccess === "object") {
        setMarketAccess((prev: any) => ({ ...prev, ...account.marketAccess }));
      }
      onEconomySnapshot?.(account);
      await refreshAfterMutation(marketType);
    },
    [onEconomySnapshot, refreshAfterMutation]
  );

  const prefillFromBookOrder = useCallback(
    (order: any, side: OrderSide) => {
      const nextResource = String(order?.resourceType || "").trim() as ResourceId;
      if (!RESOURCE_META.some((row) => row.id === nextResource)) return;
      const nextPrice = Math.max(0, Number(order?.displayBundlePrice || 0));
      const remaining = Math.max(0, Math.floor(Number(order?.remainingQuantity || 0)));
      const rawUnitPrice = Math.max(0, Math.floor(Number(order?.unitPrice || 0)));
      const limits = MARKET_ORDER_LIMITS[nextResource];
      let nextQuantity = Math.min(remaining, limits.max);
      if (side === "buy") {
        const marketType = order?.marketType === "alliance" ? "alliance" : "public";
        nextQuantity = Math.min(
          nextQuantity,
          getBuyableQuantityForCredits(availableCreditsScaled, rawUnitPrice, MARKET_FEE_BPS[marketType].listing, nextQuantity)
        );
      } else {
        const available = Math.max(0, Math.floor(Number(resourceAmounts[nextResource] || 0)));
        nextQuantity = Math.min(nextQuantity, available);
      }
      setSelectedResource(nextResource);
      setOrderSide(side);
      setPriceInput(nextPrice > 0 ? String(nextPrice) : "");
      setQuantityInput(nextQuantity > 0 ? String(nextQuantity) : "");
      setSection(order?.marketType === "alliance" ? "alliance" : "public");
    },
    [availableCreditsScaled, resourceAmounts]
  );

  const getExecutableBookQuantity = useCallback(
    (order: any, side: OrderSide) => {
      const nextResource = String(order?.resourceType || "").trim() as ResourceId;
      if (!RESOURCE_META.some((row) => row.id === nextResource)) return 0;
      const limits = MARKET_ORDER_LIMITS[nextResource];
      const remaining = Math.max(0, Math.floor(Number(order?.remainingQuantity || 0)));
      const rawUnitPrice = Math.max(0, Math.floor(Number(order?.unitPrice || 0)));
      let nextQuantity = Math.min(remaining, limits.max);
      if (side === "buy") {
        const marketType = order?.marketType === "alliance" ? "alliance" : "public";
        nextQuantity = Math.min(
          nextQuantity,
          getBuyableQuantityForCredits(availableCreditsScaled, rawUnitPrice, MARKET_FEE_BPS[marketType].listing, nextQuantity)
        );
      } else {
        nextQuantity = Math.min(nextQuantity, Math.max(0, Math.floor(Number(resourceAmounts[nextResource] || 0))));
      }
      return Math.max(0, nextQuantity);
    },
    [availableCreditsScaled, resourceAmounts]
  );

  const getBookActionState = useCallback(
    (order: any, side: OrderSide) => {
      const nextResource = String(order?.resourceType || "").trim() as ResourceId;
      const limits = RESOURCE_META.some((row) => row.id === nextResource) ? MARKET_ORDER_LIMITS[nextResource] : null;
      const remaining = Math.max(0, Math.floor(Number(order?.remainingQuantity || 0)));
      const ownOrder = side === "buy"
        ? String(order?.sellerPlayerId || "") === session?.user_id
        : String(order?.buyerPlayerId || "") === session?.user_id;
      const executable = getExecutableBookQuantity(order, side);
      if (ownOrder) {
        return {
          disabled: true,
          label: l("Votre ordre", "Your order"),
          hint: l("Auto-trade bloque.", "Self-trading blocked."),
          executable
        };
      }
      if (!limits) {
        return {
          disabled: true,
          label: l("Indisponible", "Unavailable"),
          hint: l("Actif invalide.", "Invalid asset."),
          executable
        };
      }
      if (remaining < limits.min) {
        return {
          disabled: true,
          label: l("Reliquat trop faible", "Remaining lot too small"),
          hint: l("Le reliquat de l'ordre est sous le minimum autorise.", "The remaining order size is below the allowed minimum."),
          executable
        };
      }
      if (executable < limits.min) {
        return {
          disabled: true,
          label: side === "buy" ? l("Credits insuff.", "Insufficient credits") : l("Stock insuff.", "Insufficient stock"),
          hint: side === "buy"
            ? l("Augmente tes credits ou reduis la cible.", "Increase your credits or target a smaller order.")
            : l("Tu n'as pas assez de stock libre pour prendre cet ordre.", "You do not have enough free stock to fill this order."),
          executable
        };
      }
      return {
        disabled: false,
        label: side === "buy" ? l("Acheter", "Buy") : l("Vendre", "Sell"),
        hint: `${l("Execution max", "Max fill")} ${fmtQty(executable)}`,
        executable
      };
    },
    [fmtQty, getExecutableBookQuantity, l, session?.user_id]
  );

  const executeBookOrder = useCallback(
    async (order: any, side: OrderSide) => {
      const nextResource = String(order?.resourceType || "").trim() as ResourceId;
      if (!RESOURCE_META.some((row) => row.id === nextResource)) return;
      const ownerId = side === "buy" ? String(order?.sellerPlayerId || "") : String(order?.buyerPlayerId || "");
      if (ownerId && ownerId === session?.user_id) {
        setError(l("Impossible de traiter votre propre ordre.", "You cannot trade against your own order."));
        return;
      }
      const limits = MARKET_ORDER_LIMITS[nextResource];
      const rawUnitPrice = Math.max(0, Math.floor(Number(order?.unitPrice || 0)));
      const nextQuantity = getExecutableBookQuantity(order, side);
      if (nextQuantity < limits.min) {
        setError(
          side === "buy"
            ? l("Quantite insuffisante ou credits insuffisants pour acheter cet ordre.", "Insufficient quantity or credits to buy this order.")
            : l("Quantite insuffisante ou stock insuffisant pour vendre sur cet ordre.", "Insufficient quantity or stock to sell into this order.")
        );
        prefillFromBookOrder(order, side);
        return;
      }
      setActionBusy(`book_${order.id}`);
      setError("");
      setSuccess("");
      try {
        const payload = await rpc("rpc_market_create_order", {
          marketType: order?.marketType === "alliance" ? "alliance" : "public",
          orderType: side,
          resourceType: nextResource,
          quantity: nextQuantity,
          unitPrice: rawUnitPrice
        });
        setSelectedResource(nextResource);
        setOrderSide(side);
        setPriceInput(String(Math.max(0, Number(order?.displayBundlePrice || 0))));
        setQuantityInput("");
        setSuccess(side === "buy" ? l("Achat transmis.", "Buy order submitted.") : l("Vente transmise.", "Sell order submitted."));
        await applyMutationPayload(payload, order?.marketType === "alliance" ? "alliance" : "public");
      } catch (err) {
        const message = fail(err, "Ordre refuse.", "Order rejected.");
        if (message) setError(message);
      } finally {
        setActionBusy("");
      }
    },
    [applyMutationPayload, fail, getExecutableBookQuantity, l, prefillFromBookOrder, rpc, session?.user_id]
  );

  const submitOrder = async (event: FormEvent) => {
    event.preventDefault();
    if (!session) return;
    if (!activeMarketUnlocked) {
      setError(
        l(
          `Bourse Orbitale niveau ${MARKET_UNLOCK_LEVEL[section] || 1} requise pour ce marche.`,
          `Orbital Exchange level ${MARKET_UNLOCK_LEVEL[section] || 1} required for this market.`
        )
      );
      return;
    }
    if (!quantityWithinBounds) {
      setError(
        l(
          `Quantite invalide. Bornes pour ${resourceLabel(selectedResource)} : min ${fmtQty(quantityLimits.min)}, max ${fmtQty(quantityLimits.max)}.`,
          `Invalid quantity. ${resourceLabel(selectedResource)} bounds: min ${fmtQty(quantityLimits.min)}, max ${fmtQty(quantityLimits.max)}.`
        )
      );
      return;
    }
    if (!canSubmit) return;
    setActionBusy("order");
    setError("");
    setSuccess("");
    try {
      const payload = await rpc("rpc_market_create_order", { marketType: activeMarketType, orderType: orderSide, resourceType: selectedResource, quantity, unitPrice });
      setSuccess(l("Ordre place.", "Order placed."));
      setQuantityInput("");
      await applyMutationPayload(payload, activeMarketType);
    } catch (err) {
      const message = fail(err, "Ordre refuse.", "Order rejected.");
      if (message) setError(message);
    } finally {
      setActionBusy("");
    }
  };

  const cancelOrder = async (orderId: string, marketType: MarketType) => {
    setActionBusy(`cancel_${orderId}`);
    setError("");
    setSuccess("");
    try {
      const payload = await rpc("rpc_market_cancel_order", { orderId });
      setSuccess(l("Ordre annule.", "Order cancelled."));
      await applyMutationPayload(payload, marketType);
    } catch (err) {
      const message = fail(err, "Annulation impossible.", "Unable to cancel order.");
      if (message) setError(message);
    } finally {
      setActionBusy("");
    }
  };

  const submitPrivateContract = async () => {
    if (!marketAccess.privateUnlocked) {
      setError(l("Bourse Orbitale niveau 3 requise pour les contrats prives.", "Orbital Exchange level 3 required for private contracts."));
      return;
    }
    setActionBusy("contract");
    setError("");
    setSuccess("");
    try {
      const payload = await rpc("rpc_market_create_private_contract", {
        orderType: orderSide,
        resourceType: selectedResource,
        quantity,
        unitPrice,
        targetUsername: contractTarget.trim(),
        expiresAt: Math.floor(Date.now() / 1000) + Math.max(1, Math.floor(Number(contractHours || 24))) * 3600
      });
      setSuccess(l("Contrat prive emis.", "Private contract sent."));
      setContractTarget("");
      setQuantityInput("");
      await applyMutationPayload(payload);
    } catch (err) {
      const message = fail(err, "Creation du contrat impossible.", "Unable to create private contract.");
      if (message) setError(message);
    } finally {
      setActionBusy("");
    }
  };
  const respondContract = async (contractId: string, action: "accept" | "decline") => {
    setActionBusy(`${action}_${contractId}`);
    setError("");
    setSuccess("");
    try {
      const payload = await rpc(action === "accept" ? "rpc_market_accept_private_contract" : "rpc_market_decline_private_contract", { contractId });
      setSuccess(action === "accept" ? l("Contrat accepte.", "Contract accepted.") : l("Contrat refuse.", "Contract declined."));
      await applyMutationPayload(payload);
    } catch (err) {
      const message = fail(err, "Action impossible sur le contrat.", "Unable to process contract.");
      if (message) setError(message);
    } finally {
      setActionBusy("");
    }
  };

  const createAlert = async () => {
    const scaled = Math.max(1, Math.round((Math.max(0, Number(alertPriceInput || 0)) * 1000) / meta.bundleSize));
    setActionBusy("alert");
    setError("");
    try {
      const payload = await rpc("rpc_market_create_alert", { resourceType: selectedResource, conditionType: alertCondition, targetPrice: scaled });
      setAlerts(Array.isArray(payload?.alerts) ? payload.alerts : []);
      setAlertPriceInput("");
    } catch (err) {
      const message = fail(err, "Creation alerte impossible.", "Unable to create alert.");
      if (message) setError(message);
    } finally {
      setActionBusy("");
    }
  };

  const removeAlert = async (alertId: string) => {
    setActionBusy(`alert_${alertId}`);
    try {
      const payload = await rpc("rpc_market_delete_alert", { alertId });
      setAlerts(Array.isArray(payload?.alerts) ? payload.alerts : []);
    } catch (err) {
      const message = fail(err, "Suppression alerte impossible.", "Unable to delete alert.");
      if (message) setError(message);
    } finally {
      setActionBusy("");
    }
  };

  const sections: Array<{ id: MarketSection; label: string; locked?: boolean; icon: any }> = [
    { id: "public", label: l("Marche public", "Public market"), locked: !marketAccess.publicUnlocked, icon: Store },
    { id: "alliance", label: l("Marche alliance", "Alliance market"), locked: !marketAccess.allianceUnlocked, icon: Shield },
    { id: "myOrders", label: l("Mes ordres", "My orders"), icon: Coins },
    { id: "myTrades", label: l("Mes transactions", "My trades"), icon: TrendingUp },
    { id: "private", label: l("Contrats prives", "Private contracts"), locked: !marketAccess.privateUnlocked, icon: HandCoins },
    { id: "stats", label: l("Statistiques", "Statistics"), icon: Sparkles }
  ];
  const activeMarketLabel = activeMarketType === "alliance" ? l("Alliance", "Alliance") : l("Public", "Public");
  const orderDeskTitle = orderSide === "buy" ? l("Ticket d'achat", "Buy ticket") : l("Ticket de vente", "Sell ticket");
  const orderDeskActionLabel = orderSide === "buy" ? l("Placer l'ordre d'achat", "Place buy order") : l("Placer l'ordre de vente", "Place sell order");
  const orderDeskAvailableLabel = orderSide === "buy" ? l("Credits disponibles", "Available credits") : l("Stock disponible", "Available stock");
  const orderDeskAvailableValue = orderSide === "buy" ? `${fmtQty(displayCredits)} Credits` : fmtQty(availableResourceQty);
  const orderDeskCapLabel = orderSide === "buy" ? l("Capacite immediate", "Immediate capacity") : l("Capacite de vente", "Sale capacity");
  const orderDeskCapValue = orderSide === "buy" ? fmtQty(maxBuyQuantity) : fmtQty(Math.min(quantityLimits.max, availableResourceQty));

  return (
    <main className="market-shell">
      <section className="market-hero">
        <div className="market-hero-copy">
          <small>{l("Bourse orbitale", "Orbital exchange")}</small>
          <h2>{l("Marche des ressources", "Resource market")}</h2>
          <p>{l("Carnet d'ordres global, contrats prives et marche d'alliance. Le marche utilise directement tes credits standards et immobilise seulement ce qui est reserve sur les ordres.", "Global order book, private contracts and alliance market. The market uses your standard credits directly and only locks what is reserved on active orders.")}</p>
        </div>
        <div className="market-hero-kpis">
          <article><small>{l("Bourse Orbitale", "Orbital Exchange")}</small><strong>Nv {fmtQty(marketAccess.bourseLevel)}</strong></article>
          <article><small>{l("Credits dispo", "Available credits")}</small><strong>{fmtQty(displayCredits)} Credits</strong></article>
          <article><small>{l("Credits reserves", "Reserved credits")}</small><strong>{fmtCredits(reservedCreditsScaled)} Credits</strong></article>
          <article><small>{l("Ordres actifs", "Open orders")}</small><strong>{fmtQty((profile?.activeOrders || []).length)} / {fmtQty(marketAccess.orderCap)}</strong></article>
        </div>
      </section>

      <nav className="market-tabs">
        {sections.map((item) => {
          const Icon = item.icon;
          return (
            <button key={item.id} type="button" className={`${section === item.id ? "is-active" : ""}${item.locked ? " is-locked" : ""}`} disabled={item.locked} onClick={() => !item.locked && setSection(item.id)}>
              <Icon size={15} />
              <span>{item.label}</span>
            </button>
          );
        })}
      </nav>

      {error ? <p className="market-inline-error">{error}</p> : null}
      {success ? <p className="market-inline-success">{success}</p> : null}

      {sectionLocked ? (
        <section className="market-unlock-card">
          <header className="market-panel-head">
            <h3>{l("Acces verrouille", "Access locked")}</h3>
            <span>
              {l("Bourse Orbitale", "Orbital Exchange")} Nv {fmtQty(MARKET_UNLOCK_LEVEL[section] || 1)}
            </span>
          </header>
          <p>
            {section === "public"
              ? l(
                  "Le marche public se debloque avec Bourse Orbitale niveau 1. Construis ce batiment dans Jeu pour publier tes premiers ordres.",
                  "The public market unlocks with Orbital Exchange level 1. Build this structure in Game to publish your first orders."
                )
              : section === "private"
                ? l(
                    "Les contrats prives se debloquent avec Bourse Orbitale niveau 3.",
                    "Private contracts unlock with Orbital Exchange level 3."
                  )
                : l(
                    "Le marche d'alliance se debloque avec Bourse Orbitale niveau 8 et une alliance active.",
                    "The alliance market unlocks with Orbital Exchange level 8 and an active alliance."
                  )}
          </p>
          <div className="market-unlock-kpis">
            <article>
              <small>{l("Niveau actuel", "Current level")}</small>
              <strong>{fmtQty(marketAccess.bourseLevel)}</strong>
            </article>
            <article>
              <small>{l("Niveau requis", "Required level")}</small>
              <strong>{fmtQty(MARKET_UNLOCK_LEVEL[section] || 1)}</strong>
            </article>
            <article>
              <small>{l("Ordres max a ce niveau", "Order cap at this level")}</small>
              <strong>{fmtQty(marketAccess.orderCap)}</strong>
            </article>
          </div>
        </section>
      ) : section === "public" || section === "alliance" ? (
        <section className="market-grid">
          <aside className="market-left">
            <article className="market-book-panel market-resource-panel">
              <header className="market-panel-head">
                <div>
                  <h3>{l("Ressources", "Resources")}</h3>
                  <p className="market-panel-copy">{l("Choisis un actif puis pilote ton ordre depuis le ticket a droite.", "Pick an asset, then drive your order from the ticket on the right.")}</p>
                </div>
                <span>{fmtQty(RESOURCE_META.length)}</span>
              </header>
              <div className="market-resource-list">
                {RESOURCE_META.map((row) => {
                  const available = Math.max(0, Math.floor(Number(resourceAmounts[row.id] || 0)));
                  const reserved = Math.max(0, Math.floor(Number(reservedResources[row.id] || 0)));
                  return (
                    <button key={row.id} type="button" className={`market-resource-card${row.id === selectedResource ? " is-active" : ""}`} onClick={() => setSelectedResource(row.id)}>
                      <img src={row.icon} alt={language === "en" ? row.en : row.fr} />
                      <div className="market-resource-card-copy">
                        <strong>{language === "en" ? row.en : row.fr}</strong>
                        <span>{l("Rareté", "Rarity")} {row.rarity} · {l("Lot", "Bundle")} {fmtQty(row.bundleSize)}</span>
                        <small>{l("Dispo", "Avail.")} {fmtQty(available)} · {l("Reserve", "Reserved")} {fmtQty(reserved)}</small>
                      </div>
                    </button>
                  );
                })}
              </div>
            </article>
          </aside>

          <section className="market-center">
            <article className="market-book-panel market-book-hero">
              <div className="market-asset-header"><img src={meta.icon} alt={language === "en" ? meta.en : meta.fr} /><div><strong>{language === "en" ? meta.en : meta.fr}</strong><span>{l("Prix affiches par lot de", "Displayed per bundle of")} {fmtQty(meta.bundleSize)} · {activeMarketLabel}</span></div></div>
              <p className="market-panel-copy">{l("Lis le spread pour voir la tension du carnet, puis utilise le ticket pour poser un ordre limite ou executer une contrepartie existante.", "Read the spread to judge book tension, then use the ticket to place a limit order or execute an existing counterparty.")}</p>
              <div className="market-book-hero-metrics">
                <div><small>{l("Dernier prix", "Last price")}</small><strong>{fmtCredits(lastTradeScaled)} Credits</strong></div>
                <div><small>{l("Meilleure offre", "Best bid")}</small><strong>{fmtCredits(bestBidScaled)} Credits</strong></div>
                <div><small>{l("Meilleure demande", "Best ask")}</small><strong>{fmtCredits(bestAskScaled)} Credits</strong></div>
                <div><small>{l("Spread", "Spread")}</small><strong>{spreadScaled > 0 ? `${fmtCredits(spreadScaled)} Credits` : l("Aucun", "None")}</strong></div>
                <div><small>{l("Volume 24h", "24h volume")}</small><strong>{fmtQty(book?.stats24h?.volume || 0)}</strong></div>
                <div><small>{l("Executions 24h", "24h trades")}</small><strong>{fmtQty(tradeCount24h)}</strong></div>
              </div>
              <div className="market-focus-strip">
                <article><span>{l("Stock dispo", "Available stock")}</span><strong>{fmtQty(availableResourceQty)}</strong></article>
                <article><span>{l("Reserve sur ordres", "Reserved on orders")}</span><strong>{fmtQty(selectedReservedResourceQty)}</strong></article>
                <article><span>{orderDeskCapLabel}</span><strong>{orderDeskCapValue}</strong></article>
                <article><span>{l("Bornes ordre", "Order bounds")}</span><strong>{fmtQty(quantityLimits.min)} - {fmtQty(quantityLimits.max)}</strong></article>
              </div>
              <div className="market-chart">{sparkPath ? <svg viewBox="0 0 320 72" preserveAspectRatio="none"><path d={sparkPath} /></svg> : <div className="market-chart-empty">{l("Pas assez d'historique.", "Not enough history yet.")}</div>}</div>
            </article>
            <article className="market-book-panel">
              <header className="market-panel-head"><div><h3>{l("Carnet d'ordres", "Order book")}</h3><p className="market-panel-copy">{l("Clique une ligne pour pre-remplir le ticket. Le bouton de droite execute l'ordre tout de suite si tes fonds le permettent.", "Click a row to prefill the ticket. The right-side button executes the order immediately if your funds allow it.")}</p></div><span>{activeMarketLabel}</span></header>
              {bookLoading ? <p className="market-loading">{l("Chargement...", "Loading...")}</p> : null}
              <div className="market-book-columns">
                <div className="market-book-side market-book-side--sell">
                  <header><strong>{l("Ventes", "Sells")}</strong><span>{l("Tu achetes a partir de ces offres.", "You buy from these offers.")}</span></header>
                  <div className="market-book-rows">
                    {(book?.sellOrders || []).map((order: any) => {
                      const actionState = getBookActionState(order, "buy");
                      return (
                        <div key={order.id} className="market-book-entry">
                          <button type="button" className="market-book-row sell" onClick={() => prefillFromBookOrder(order, "buy")}>
                            <div className="market-book-row-main">
                              <b>{Number(order.displayBundlePrice || 0).toLocaleString(locale, { maximumFractionDigits: 3 })} Credits</b>
                              <strong>{fmtQty(order.remainingQuantity)}</strong>
                            </div>
                            <div className="market-book-row-meta">
                              <span>{l("Total", "Total")} {fmtCredits(Number(order.unitPrice || 0) * Number(order.remainingQuantity || 0))} Credits</span>
                              <span>{l("Vendeur", "Seller")} {(order?.sellerUsername || order?.sellerPlayerId || "-")}</span>
                            </div>
                          </button>
                          <div className="market-book-action-wrap">
                            <button
                              type="button"
                              className="market-book-action market-book-action--buy"
                              disabled={actionState.disabled || actionBusy === `book_${order.id}`}
                              onClick={() => void executeBookOrder(order, "buy")}
                            >
                              {actionBusy === `book_${order.id}` ? l("Achat...", "Buying...") : actionState.label}
                            </button>
                            <small>{actionState.hint}</small>
                          </div>
                        </div>
                      );
                    })}
                    {(book?.sellOrders || []).length === 0 ? <p className="market-empty">{l("Aucune vente ouverte.", "No open sell order.")}</p> : null}
                  </div>
                </div>
                <div className="market-book-side market-book-side--buy">
                  <header><strong>{l("Achats", "Buys")}</strong><span>{l("Tu vends directement dans ces demandes.", "You sell directly into these bids.")}</span></header>
                  <div className="market-book-rows">
                    {(book?.buyOrders || []).map((order: any) => {
                      const actionState = getBookActionState(order, "sell");
                      return (
                        <div key={order.id} className="market-book-entry">
                          <button type="button" className="market-book-row buy" onClick={() => prefillFromBookOrder(order, "sell")}>
                            <div className="market-book-row-main">
                              <b>{Number(order.displayBundlePrice || 0).toLocaleString(locale, { maximumFractionDigits: 3 })} Credits</b>
                              <strong>{fmtQty(order.remainingQuantity)}</strong>
                            </div>
                            <div className="market-book-row-meta">
                              <span>{l("Total", "Total")} {fmtCredits(Number(order.unitPrice || 0) * Number(order.remainingQuantity || 0))} Credits</span>
                              <span>{l("Acheteur", "Buyer")} {(order?.buyerUsername || order?.buyerPlayerId || "-")}</span>
                            </div>
                          </button>
                          <div className="market-book-action-wrap">
                            <button
                              type="button"
                              className="market-book-action market-book-action--sell"
                              disabled={actionState.disabled || actionBusy === `book_${order.id}`}
                              onClick={() => void executeBookOrder(order, "sell")}
                            >
                              {actionBusy === `book_${order.id}` ? l("Vente...", "Selling...") : actionState.label}
                            </button>
                            <small>{actionState.hint}</small>
                          </div>
                        </div>
                      );
                    })}
                    {(book?.buyOrders || []).length === 0 ? <p className="market-empty">{l("Aucun achat ouvert.", "No open buy order.")}</p> : null}
                  </div>
                </div>
              </div>
            </article>

            <article className="market-book-panel"><header className="market-panel-head"><h3>{l("Dernieres executions", "Recent trades")}</h3></header><div className="market-trade-list">{(book?.recentTrades || []).map((trade: any) => <div key={trade.id} className="market-trade-row"><strong>{Number(trade.displayBundlePrice || 0).toLocaleString(locale, { maximumFractionDigits: 3 })} Credits</strong><span>{fmtQty(trade.quantity)} {resourceLabel(trade.resourceType)}</span><span>{dateLabel(trade.createdAt)}</span></div>)}{(book?.recentTrades || []).length === 0 ? <p className="market-empty">{l("Aucune execution recente.", "No recent trade.")}</p> : null}</div></article>
          </section>

          <aside className="market-right">
            <article className="market-order-card market-order-card--sticky">
              <header className="market-panel-head"><div><h3>{orderDeskTitle}</h3><p className="market-panel-copy">{orderDeskHint}</p></div><span>{activeMarketType === "alliance" ? l("Taxe 1%", "1% tax") : l("Taxe 6%", "6% tax")}</span></header>
              <div className={`market-ticket-badge is-${orderSide}`}>
                <span>{orderDeskTitle}</span>
                <strong>{language === "en" ? meta.en : meta.fr}</strong>
              </div>
              <form className="market-order-form" onSubmit={submitOrder}>
                <div className="market-side-switch"><button type="button" className={orderSide === "buy" ? "active buy" : ""} onClick={() => setOrderSide("buy")}>{l("Acheter", "Buy")}</button><button type="button" className={orderSide === "sell" ? "active sell" : ""} onClick={() => setOrderSide("sell")}>{l("Vendre", "Sell")}</button></div>
                <div className="market-order-context">
                  <div><span>{l("Ressource", "Asset")}</span><strong>{language === "en" ? meta.en : meta.fr}</strong></div>
                  <div><span>{l("Marche", "Market")}</span><strong>{activeMarketLabel}</strong></div>
                  <div><span>{orderDeskAvailableLabel}</span><strong>{orderDeskAvailableValue}</strong></div>
                  <div><span>{orderDeskCapLabel}</span><strong>{orderDeskCapValue}</strong></div>
                </div>
                <label><span>{l("Prix par lot", "Price per bundle")}</span><input type="number" min="0" step="0.001" value={priceInput} onChange={(e) => setPriceInput(e.target.value)} /></label>
                <label><span>{l("Quantite", "Quantity")}</span><input type="number" min="0" step="1" value={quantityInput} onChange={(e) => setQuantityInput(e.target.value)} /></label>
                <p className={`market-hint${quantity > 0 && !quantityWithinBounds ? " is-danger" : ""}`}>
                  {l("Bornes ordre", "Order bounds")}: {fmtQty(quantityLimits.min)} - {fmtQty(quantityLimits.max)}
                  {l(" unités", " units")}
                </p>
                <div className="market-quick-qty">{[0.25, 0.5, 0.75, 1].map((ratio) => <button key={ratio} type="button" onClick={() => fillQty(ratio)}>{ratio < 1 ? `${Math.round(ratio * 100)}%` : "MAX"}</button>)}</div>
                <div className="market-order-summary"><div><span>{l("Lot", "Bundle")}</span><strong>{fmtQty(meta.bundleSize)}</strong></div><div><span>{l("Montant brut", "Gross total")}</span><strong>{fmtCredits(grossScaled)} Credits</strong></div><div><span>{l("Frais de mise", "Listing fee")}</span><strong>{fmtCredits(listingFeeScaled)} Credits</strong></div><div><span>{l("Taxe execution", "Execution tax")}</span><strong>{fmtCredits(executionTaxScaled)} Credits</strong></div><div><span>{l("Reserve apres ordre", "Reserved after order")}</span><strong>{orderSide === "buy" ? `${fmtCredits(grossScaled + listingFeeScaled)} Credits` : fmtQty(quantity)}</strong></div><div><span>{orderDeskAvailableLabel}</span><strong>{orderDeskAvailableValue}</strong></div></div>
                <p className={`market-hint${submitBlockReason ? " is-danger" : ""}`}>{submitBlockReason || l("Le ticket est pret. Clique sur confirmer pour publier un ordre limite.", "Your ticket is ready. Confirm to publish a limit order.")}</p>
                <button type="submit" className="market-primary-btn" disabled={actionBusy === "order" || !canSubmit}>{actionBusy === "order" ? l("Transmission...", "Submitting...") : orderDeskActionLabel}</button>
              </form>
            </article>

            <article className="market-wallet-card"><header className="market-panel-head"><div><h3>{l("Wallet", "Wallet")}</h3><p className="market-panel-copy">{l("Vue rapide des liquidites et de ce qui est immobilise sur le marche.", "Quick view of your liquid funds and what is currently immobilized on the market.")}</p></div><Wallet size={15} /></header><div className="market-wallet-grid"><div><small>{l("Credits", "Credits")}</small><strong>{fmtQty(displayCredits)} Credits</strong></div><div><small>{l("Credits reserves", "Reserved credits")}</small><strong>{fmtCredits(reservedCreditsScaled)} Credits</strong></div></div><details className="market-spoiler"><summary>{l("Ressources reservees", "Reserved resources")}</summary><div className="market-reserved-list">{RESOURCE_META.map((row) => { const amount = Math.max(0, Math.floor(Number(reservedResources[row.id] || 0))); if (amount <= 0) return null; return <div key={row.id}><span>{language === "en" ? row.en : row.fr}</span><strong>{fmtQty(amount)}</strong></div>; })}{RESOURCE_META.every((row) => Math.max(0, Math.floor(Number(reservedResources[row.id] || 0))) <= 0) ? <p className="market-empty">{l("Aucune reserve.", "No reserve.")}</p> : null}</div></details></article>
            {marketAccess.alertsUnlocked ? <article className="market-wallet-card"><header className="market-panel-head"><h3>{l("Alertes prix", "Price alerts")}</h3><BellRing size={15} /></header><div className="market-alert-form"><select value={alertCondition} onChange={(e) => setAlertCondition(e.target.value as "above" | "below")}><option value="above">{l("Au-dessus", "Above")}</option><option value="below">{l("En dessous", "Below")}</option></select><input type="number" min="0" step="0.001" value={alertPriceInput} onChange={(e) => setAlertPriceInput(e.target.value)} placeholder={l("Prix / lot", "Price / bundle")} /><button type="button" onClick={() => void createAlert()} disabled={actionBusy === "alert"}>{l("Ajouter", "Add")}</button></div><div className="market-alert-list">{alerts.filter((row) => String(row.resourceType || "") === selectedResource).map((row) => <div key={row.id} className="market-alert-row"><span>{row.conditionType === "above" ? l("Au-dessus", "Above") : l("En dessous", "Below")} {fmtCredits(Number(row.targetPrice || 0) * meta.bundleSize)} Credits</span><button type="button" onClick={() => void removeAlert(String(row.id || ""))} disabled={actionBusy === `alert_${row.id}`}>{l("Retirer", "Remove")}</button></div>)}</div></article> : null}
          </aside>
        </section>
      ) : null}

      {section === "myOrders" ? <section className="market-stack"><header className="market-panel-head"><h3>{l("Mes ordres", "My orders")}</h3><span>{fmtQty(myOrders.length)}</span></header><div className="market-order-list">{myOrders.map((order) => <article key={order.id} className="market-order-entry"><div className="market-order-entry-main"><img src={RESOURCE_META.find((row) => row.id === order.resourceType)?.icon} alt={resourceLabel(order.resourceType)} /><div><strong>{order.orderType === "buy" ? l("Achat", "Buy") : l("Vente", "Sell")} · {resourceLabel(order.resourceType)}</strong><span>{order.marketType} · {order.status}</span><small>{l("Reste", "Remaining")}: {fmtQty(order.remainingQuantity)} / {fmtQty(order.totalQuantity)} · {Number(order.displayBundlePrice || 0).toLocaleString(locale, { maximumFractionDigits: 3 })} Credits</small></div></div><div className="market-order-entry-side"><small>{dateLabel(order.updatedAt || order.createdAt)}</small>{(order.status === "open" || order.status === "partially_filled") && order.marketType !== "private" ? <button type="button" onClick={() => void cancelOrder(order.id, order.marketType)} disabled={Boolean(actionBusy)}>{l("Annuler", "Cancel")}</button> : null}</div></article>)}{myOrders.length === 0 ? <p className="market-empty">{l("Aucun ordre.", "No order.")}</p> : null}</div></section> : null}
      {section === "myTrades" ? <section className="market-stack"><header className="market-panel-head"><h3>{l("Mes transactions", "My trades")}</h3><span>{fmtQty(myTrades.length)}</span></header><div className="market-trade-list market-trade-list--wide">{myTrades.map((trade) => <article key={trade.id} className="market-trade-card"><div className="market-trade-card-main"><img src={RESOURCE_META.find((row) => row.id === trade.resourceType)?.icon} alt={resourceLabel(trade.resourceType)} /><div><strong>{resourceLabel(trade.resourceType)}</strong><span>{fmtQty(trade.quantity)} · {Number(trade.displayBundlePrice || 0).toLocaleString(locale, { maximumFractionDigits: 3 })} Credits / {fmtQty(Number(trade.displayBundleSize || 0))}</span><small>{dateLabel(trade.createdAt)}</small></div></div><div className="market-trade-card-side"><b>{fmtCredits(Number(trade.totalPrice || 0))} Credits</b><small>{l("Taxe", "Tax")}: {fmtCredits(Number(trade.taxAmount || 0))} Credits</small></div></article>)}{myTrades.length === 0 ? <p className="market-empty">{l("Aucune transaction.", "No trade.")}</p> : null}</div></section> : null}

      {section === "private" ? <section className="market-contracts-shell"><article className="market-order-card"><header className="market-panel-head"><h3>{l("Contrat prive", "Private contract")}</h3><span>{l("Taxe 2%", "2% tax")}</span></header><div className="market-order-form"><label><span>{l("Joueur cible", "Target player")}</span><input value={contractTarget} onChange={(e) => setContractTarget(e.target.value)} placeholder={l("Pseudo ou userId", "Username or userId")} /></label><label><span>{l("Prix par lot", "Price per bundle")}</span><input type="number" min="0" step="0.001" value={priceInput} onChange={(e) => setPriceInput(e.target.value)} /></label><label><span>{l("Quantite", "Quantity")}</span><input type="number" min="0" step="1" value={quantityInput} onChange={(e) => setQuantityInput(e.target.value)} /></label><label><span>{l("Expiration (h)", "Expiry (h)")}</span><input type="number" min="1" max="168" step="1" value={contractHours} onChange={(e) => setContractHours(e.target.value)} /></label><button type="button" className="market-primary-btn" onClick={() => void submitPrivateContract()} disabled={!contractTarget.trim() || !canSubmit || actionBusy === "contract"}>{l("Envoyer", "Send")}</button></div></article><article className="market-book-panel"><header className="market-panel-head"><h3>{l("Contrats actifs", "Active contracts")}</h3><span>{fmtQty(privateContracts.length)}</span></header><div className="market-contract-list">{privateContracts.map((contract) => { const isOwner = (contract.orderType === "sell" ? contract.sellerPlayerId : contract.buyerPlayerId) === session?.user_id; return <article key={contract.id} className="market-contract-card"><div className="market-contract-main"><img src={RESOURCE_META.find((row) => row.id === contract.resourceType)?.icon} alt={resourceLabel(contract.resourceType)} /><div><strong>{contract.orderType === "buy" ? l("Contrat d'achat", "Purchase contract") : l("Contrat de vente", "Sale contract")} · {resourceLabel(contract.resourceType)}</strong><span>{fmtQty(contract.remainingQuantity)} · {Number(contract.displayBundlePrice || 0).toLocaleString(locale, { maximumFractionDigits: 3 })} Credits / {fmtQty(Number(contract.displayBundleSize || 0))}</span><small>{l("Emetteur", "Issuer")}: {(contract.orderType === "sell" ? contract.sellerUsername : contract.buyerUsername) || "-"}</small><small>{l("Cible", "Target")}: {contract.targetUsername || contract.targetPlayerId || "-"}</small></div></div><div className="market-contract-actions"><small>{dateLabel(contract.expiresAt)}</small>{!isOwner && (contract.status === "open" || contract.status === "partially_filled") ? <><button type="button" onClick={() => void respondContract(contract.id, "accept")} disabled={Boolean(actionBusy)}>{l("Accepter", "Accept")}</button><button type="button" className="danger" onClick={() => void respondContract(contract.id, "decline")} disabled={Boolean(actionBusy)}>{l("Refuser", "Decline")}</button></> : null}</div></article>; })}{privateContracts.length === 0 ? <p className="market-empty">{l("Aucun contrat prive actif.", "No active private contract.")}</p> : null}</div></article></section> : null}

      {section === "stats" ? <section className="market-stats-grid"><article className="market-wallet-card"><header className="market-panel-head"><h3>{l("Performance", "Performance")}</h3><TrendingUp size={15} /></header><div className="market-wallet-grid"><div><small>{l("Achats cumules", "Total bought")}</small><strong>{fmtCredits(Number(stats?.totalBoughtScaled || 0))} Credits</strong></div><div><small>{l("Ventes cumulees", "Total sold")}</small><strong>{fmtCredits(Number(stats?.totalSoldScaled || 0))} Credits</strong></div><div><small>{l("Frais payes", "Fees paid")}</small><strong>{fmtCredits(Number(stats?.totalFeesPaidScaled || 0))} Credits</strong></div><div><small>{l("Volume echange", "Trade volume")}</small><strong>{fmtCredits(Number(stats?.totalTradeVolumeScaled || 0))} Credits</strong></div></div></article><article className="market-wallet-card"><header className="market-panel-head"><h3>{l("Ressources echangees", "Exchanged resources")}</h3><Package size={15} /></header><div className="market-reserved-list">{RESOURCE_META.map((row) => <div key={row.id}><span>{language === "en" ? row.en : row.fr}</span><strong>+{fmtQty(Number(stats?.totalBoughtUnits?.[row.id] || 0))} / -{fmtQty(Number(stats?.totalSoldUnits?.[row.id] || 0))}</strong></div>)}</div></article></section> : null}
    </main>
  );
}
