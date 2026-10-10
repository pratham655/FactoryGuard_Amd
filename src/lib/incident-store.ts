import {
  createIncidentRecord,
  transitionIncident,
  type IncidentInput,
  type IncidentRecord,
  type IncidentStatus,
} from "@/lib/incident-lifecycle";

type StoreState = { records: Map<string, IncidentRecord> };
const globalStore = globalThis as typeof globalThis & { __factoryGuardIncidents?: StoreState };
const store = (globalStore.__factoryGuardIncidents ??= { records: new Map() });

export function addIncident(input: IncidentInput): IncidentRecord {
  const record = createIncidentRecord(input);
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

  const nextStatus: IncidentStatus = decision === "approve" ? "approved" : "rejected";
  const updated = transitionIncident(current, nextStatus, decision === "approve"
    ? { approvedBy: operator }
    : { rejectedBy: operator, rejectionReason: reason });
  store.records.set(id, updated);
  return updated;
}
