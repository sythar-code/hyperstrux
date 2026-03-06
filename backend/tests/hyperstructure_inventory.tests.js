/* eslint-disable no-console */
const assert = require("assert");
const runtime = require("../nakama/data/modules/hyperstructure_economy.js");

const {
  defaultEconomyState,
  defaultInventoryState,
  addItemToInventory,
  useTimeRift
} = runtime.__test;

function deepClone(v) {
  return JSON.parse(JSON.stringify(v));
}

function makeStorageId(collection, key, userId) {
  return `${collection}::${key}::${userId}`;
}

function createMockNakama() {
  const storage = new Map();
  const versionMap = new Map();

  return {
    _storage: storage,
    storageRead(requests) {
      const out = [];
      for (const req of requests) {
        const id = makeStorageId(req.collection, req.key, req.userId);
        if (!storage.has(id)) continue;
        out.push({
          collection: req.collection,
          key: req.key,
          userId: req.userId,
          value: deepClone(storage.get(id)),
          version: versionMap.get(id) || "1"
        });
      }
      return out;
    },
    storageWrite(writes) {
      for (const write of writes) {
        const id = makeStorageId(write.collection, write.key, write.userId);
        const currentVersion = versionMap.get(id) || "";
        const expected = typeof write.version === "string" ? write.version : "";
        if (expected !== currentVersion) {
          throw new Error("version check failed");
        }
      }
      const out = [];
      for (const write of writes) {
        const id = makeStorageId(write.collection, write.key, write.userId);
        const currentVersion = Number(versionMap.get(id) || "0");
        const nextVersion = String(currentVersion + 1);
        storage.set(id, deepClone(write.value));
        versionMap.set(id, nextVersion);
        out.push({ version: nextVersion });
      }
      return out;
    }
  };
}

function seedPlayer(nk, userId, itemId, quantity, queueEndOffsetSec) {
  const eco = defaultEconomyState();
  eco.building_construct_slot = {
    slot: "building_construct_slot",
    buildingId: "osmium",
    targetLevel: 1,
    startedAt: Math.floor(Date.now() / 1000) - 5,
    endAt: Math.floor(Date.now() / 1000) + queueEndOffsetSec,
    cost: { carbone: 2000, titane: 800 }
  };

  const inv = defaultInventoryState(userId);
  addItemToInventory(inv, itemId, quantity);

  nk.storageWrite([
    {
      collection: "hyperstructure",
      key: "economy_state_v1",
      userId,
      permissionRead: 0,
      permissionWrite: 0,
      version: "",
      value: eco
    },
    {
      collection: "hyperstructure",
      key: "inventory_state_v1",
      userId,
      permissionRead: 0,
      permissionWrite: 0,
      version: "",
      value: inv
    }
  ]);
}

function testUseItemQuantityOne() {
  const nk = createMockNakama();
  seedPlayer(nk, "u1", "TIME_RIFT_60", 1, 300);
  const result = useTimeRift(nk, "u1", "osmium", "TIME_RIFT_60");
  const item = result.inventory.items.find((it) => it.itemId === "TIME_RIFT_60");
  assert.strictEqual(item, undefined, "Item should be fully consumed at quantity=1");
}

function testUseItemQuantityMoreThanOne() {
  const nk = createMockNakama();
  seedPlayer(nk, "u2", "TIME_RIFT_300", 5, 900);
  const result = useTimeRift(nk, "u2", "osmium", "TIME_RIFT_300");
  const item = result.inventory.items.find((it) => it.itemId === "TIME_RIFT_300");
  assert.ok(item, "Item should still exist");
  assert.strictEqual(item.quantity, 4, "Quantity should decrement by exactly 1");
}

function testUseOnFinishedBuildingFails() {
  const nk = createMockNakama();
  seedPlayer(nk, "u3", "TIME_RIFT_60", 1, -2);
  assert.throws(() => useTimeRift(nk, "u3", "osmium", "TIME_RIFT_60"), /not in construction|already finished/i);
}

function testUseWithoutItemFails() {
  const nk = createMockNakama();
  seedPlayer(nk, "u4", "TIME_RIFT_60", 1, 300);
  useTimeRift(nk, "u4", "osmium", "TIME_RIFT_60");
  assert.throws(() => useTimeRift(nk, "u4", "osmium", "TIME_RIFT_60"), /Item not found|Not enough/i);
}

async function testConcurrentDoubleCallNoDuplication() {
  const nk = createMockNakama();
  seedPlayer(nk, "u5", "TIME_RIFT_60", 1, 300);

  const run = async () => useTimeRift(nk, "u5", "osmium", "TIME_RIFT_60");
  const results = await Promise.allSettled([run(), run()]);

  const success = results.filter((r) => r.status === "fulfilled").length;
  const failed = results.filter((r) => r.status === "rejected").length;
  assert.strictEqual(success, 1, "Exactly one call must succeed");
  assert.strictEqual(failed, 1, "Exactly one call must fail");

  const read = nk.storageRead([{ collection: "hyperstructure", key: "inventory_state_v1", userId: "u5" }]);
  const inv = read[0].value;
  const item = inv.items.find((it) => it.itemId === "TIME_RIFT_60");
  assert.strictEqual(item, undefined, "No duplication: quantity cannot go below zero");
}

async function run() {
  testUseItemQuantityOne();
  testUseItemQuantityMoreThanOne();
  testUseOnFinishedBuildingFails();
  testUseWithoutItemFails();
  await testConcurrentDoubleCallNoDuplication();
  console.log("inventory tests: OK");
}

run().catch((err) => {
  console.error("inventory tests: FAIL", err);
  process.exit(1);
});
