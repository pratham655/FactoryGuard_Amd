import { MongoClient, type Collection } from "mongodb";
import {
  createIncidentRecord,
  transitionIncident,
  type IncidentInput,
  type IncidentRecord,
} from "@/lib/incident-lifecycle";

type StoreState = { records: Map<string, IncidentRecord> };
const globalStore = globalThis as typeof globalThis & {
  __factoryGuardIncidents?: StoreState;
  __factoryGuardMongoClient?: MongoClient;
};
const store = (globalStore.__factoryGuardIncidents ??= { records: new Map() });

function mongoConfig(): { uri: string; database: string } | null {
  const uri = process.env.MONGODB_URI?.trim();
  if (!uri) return null;
  return {
    uri,
    database: process.env.MONGODB_DB?.trim() || "factoryguard",
  };
}

async function incidentCollection(): Promise<Collection<IncidentRecord> | null> {
  const config = mongoConfig();
  if (!config) return null;

  const client =
    globalStore.__factoryGuardMongoClient ??
    (globalStore.__factoryGuardMongoClient = new MongoClient(config.uri));
  await client.connect();
  return client.db(config.database).collection<IncidentRecord>("incidents");
}

export async function addIncident(input: IncidentInput): Promise<IncidentRecord> {
  let record = createIncidentRecord(input);
  record = transitionIncident(record, "investigating");
  record = transitionIncident(record, "recommended");
  record = transitionIncident(record, "awaiting_approval");

  const collection = await incidentCollection();
  if (!collection) {
    store.records.set(record.id, record);
    return record;
  }

  await collection.insertOne(record);
  return record;
}

export async function getIncident(id: string): Promise<IncidentRecord | undefined> {
  const collection = await incidentCollection();
  if (!collection) return store.records.get(id);
  return (await collection.findOne({ id })) ?? undefined;
}

export async function decideIncident(
  id: string,
  decision: "approve" | "reject",
  operator: string,
  reason?: string,
): Promise<IncidentRecord> {
  const collection = await incidentCollection();
  const current = collection ? await collection.findOne({ id }) : store.records.get(id);
  if (!current) throw new Error("Incident not found");

  const updated = transitionIncident(
    current,
    decision === "approve" ? "approved" : "rejected",
    decision === "approve"
      ? { approvedBy: operator }
      : { rejectedBy: operator, rejectionReason: reason },
  );

  if (!collection) {
    // Recheck immediately before writing to reject duplicate decisions in the local fallback.
    if (store.records.get(id)?.status !== "awaiting_approval") {
      throw new Error("Incident has already been decided or is not awaiting approval");
    }
    store.records.set(id, updated);
    return updated;
  }

  // Compare-and-set: only one request can change an awaiting incident's decision.
  const result = await collection.updateOne(
    { id, status: "awaiting_approval" },
    {
      $set: {
        status: updated.status,
        history: updated.history,
        updatedAt: updated.updatedAt,
        approvedBy: updated.approvedBy,
        rejectedBy: updated.rejectedBy,
        rejectionReason: updated.rejectionReason,
      },
    },
  );
  if (result.modifiedCount !== 1) {
    throw new Error("Incident has already been decided or is not awaiting approval");
  }

  const saved = await collection.findOne({ id });
  if (!saved) throw new Error("Incident disappeared after decision update");
  return saved;
}
