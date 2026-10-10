import {
  createIncidentRecord,
  transitionIncident,
  type IncidentInput,
  type IncidentRecord,
} from "@/lib/incident-lifecycle";

type StoreState = { records: Map<string, IncidentRecord> };
const globalStore = globalThis as typeof globalThis & { __factoryGuardIncidents?: StoreState };
const store = (globalStore.__factoryGuardIncidents ??= { records: new Map() });

type DatabaseIncident = {
  id: string;
  machine_id: string;
  severity: IncidentRecord["severity"];
  probable_cause: string | null;
  recommended_action: string;
  requires_human_approval: boolean;
  status: IncidentRecord["status"];
  history: IncidentRecord["history"];
  created_at: string;
  updated_at: string;
  approved_by: string | null;
  rejected_by: string | null;
  rejection_reason: string | null;
};

function databaseConfig(): { url: string; key: string } | null {
  const url = process.env.SUPABASE_URL?.trim() || process.env.NEXT_PUBLIC_SUPABASE_URL?.trim();
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY?.trim();
  return url && key ? { url: url.replace(/\/+$/, ""), key } : null;
}

function toDatabase(record: IncidentRecord): DatabaseIncident {
  return {
    id: record.id,
    machine_id: record.machineId,
    severity: record.severity,
    probable_cause: record.probableCause,
    recommended_action: record.recommendedAction,
    requires_human_approval: record.requiresHumanApproval,
    status: record.status,
    history: record.history,
    created_at: record.createdAt,
    updated_at: record.updatedAt,
    approved_by: record.approvedBy,
    rejected_by: record.rejectedBy,
    rejection_reason: record.rejectionReason,
  };
}

function fromDatabase(row: DatabaseIncident): IncidentRecord {
  return {
    id: row.id,
    machineId: row.machine_id,
    severity: row.severity,
    probableCause: row.probable_cause,
    recommendedAction: row.recommended_action,
    requiresHumanApproval: row.requires_human_approval,
    status: row.status,
    history: row.history,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
    approvedBy: row.approved_by,
    rejectedBy: row.rejected_by,
    rejectionReason: row.rejection_reason,
  };
}

async function databaseRequest<T>(
  config: { url: string; key: string },
  path: string,
  init: RequestInit = {},
): Promise<T> {
  const response = await fetch(`${config.url}/rest/v1/${path}`, {
    ...init,
    headers: {
      apikey: config.key,
      Authorization: `Bearer ${config.key}`,
      "Content-Type": "application/json",
      ...(init.headers ?? {}),
    },
    cache: "no-store",
  });
  if (!response.ok) {
    const detail = await response.text();
    throw new Error(`Incident database request failed (${response.status}): ${detail.slice(0, 300)}`);
  }
  if (response.status === 204) return undefined as T;
  return response.json() as Promise<T>;
}

export async function addIncident(input: IncidentInput): Promise<IncidentRecord> {
  let record = createIncidentRecord(input);
  record = transitionIncident(record, "investigating");
  record = transitionIncident(record, "recommended");
  record = transitionIncident(record, "awaiting_approval");

  const config = databaseConfig();
  if (!config) {
    store.records.set(record.id, record);
    return record;
  }

  const rows = await databaseRequest<DatabaseIncident[]>(
    config,
    "factoryguard_incidents",
    {
      method: "POST",
      headers: { Prefer: "return=representation" },
      body: JSON.stringify(toDatabase(record)),
    },
  );
  if (!rows[0]) throw new Error("Incident database did not return the created record");
  return fromDatabase(rows[0]);
}

export async function getIncident(id: string): Promise<IncidentRecord | undefined> {
  const config = databaseConfig();
  if (!config) return store.records.get(id);

  const rows = await databaseRequest<DatabaseIncident[]>(
    config,
    `factoryguard_incidents?select=*&id=eq.${encodeURIComponent(id)}&limit=1`,
  );
  return rows[0] ? fromDatabase(rows[0]) : undefined;
}

export async function decideIncident(
  id: string,
  decision: "approve" | "reject",
  operator: string,
  reason?: string,
): Promise<IncidentRecord> {
  const config = databaseConfig();
  const current = await getIncident(id);
  if (!current) throw new Error("Incident not found");

  const updated = transitionIncident(
    current,
    decision === "approve" ? "approved" : "rejected",
    decision === "approve"
      ? { approvedBy: operator }
      : { rejectedBy: operator, rejectionReason: reason },
  );

  if (!config) {
    // Check again immediately before writing so duplicate decisions are rejected in the local fallback.
    if (store.records.get(id)?.status !== current.status) {
      throw new Error("Incident has already been decided");
    }
    store.records.set(id, updated);
    return updated;
  }

  const rows = await databaseRequest<DatabaseIncident[]>(
    config,
    `factoryguard_incidents?id=eq.${encodeURIComponent(id)}&status=eq.awaiting_approval`,
    {
      method: "PATCH",
      headers: { Prefer: "return=representation" },
      body: JSON.stringify({
        status: updated.status,
        history: updated.history,
        updated_at: updated.updatedAt,
        approved_by: updated.approvedBy,
        rejected_by: updated.rejectedBy,
        rejection_reason: updated.rejectionReason,
      }),
    },
  );
  if (!rows[0]) throw new Error("Incident has already been decided or is not awaiting approval");
  return fromDatabase(rows[0]);
}
