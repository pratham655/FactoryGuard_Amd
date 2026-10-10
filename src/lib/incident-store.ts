import {
  createIncidentRecord,
  transitionIncident,
  type IncidentInput,
  type IncidentRecord,
} from "@/lib/incident-lifecycle";

type StoreState = { records: Map<string, IncidentRecord> };
const globalStore = globalThis as typeof globalThis & { __factoryGuardIncidents?: StoreState };
const store = (globalStore.__factoryGuardIncidents ??= { records: new Map() });

export function addIncident(input: IncidentInput): IncidentRecord {
  let record = createIncidentRecord(input);
  record = transitionIncident(record, "investigating");
  record = transitionIncident(record, "recommended");
  record = transitionIncident(record, "awaiting_approval");
  store.records.set(record.id, record);
  return record;
}

export function getIncident(id: string): IncidentRecord | undefined {
  return store.records.get(id);
}

export function decideIncident(
  id: string,
  decision: "approve" | "reject",
  operator: string,
  reason?: string,
): IncidentRecord {
  const current = getIncident(id);
  if (!current) throw new Error("Incident not found");

  const updated = transitionIncident(
    current,
    decision === "approve" ? "approved" : "rejected",
    decision === "approve"
      ? { approvedBy: operator }
      : { rejectedBy: operator, rejectionReason: reason },
  );
  store.records.set(id, updated);
  return updated;
}
