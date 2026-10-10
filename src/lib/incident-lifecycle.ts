
export type IncidentSeverity = "normal" | "warning" | "critical";

export type IncidentStatus =
  | "detected"
  | "investigating"
  | "recommended"
  | "awaiting_approval"
  | "approved"
  | "rejected"
  | "maintenance"
  | "recovered"
  | "closed";

export type IncidentInput = {
  machineId: string;
  severity: IncidentSeverity;
  probableCause: string | null;
  recommendedAction: string;
  requiresHumanApproval: boolean;
};

export type IncidentRecord = IncidentInput & {
  id: string;
  status: IncidentStatus;
  history: IncidentStatus[];
  createdAt: string;
  updatedAt: string;
  approvedBy: string | null;
  rejectedBy: string | null;
  rejectionReason: string | null;
};

type TransitionMetadata = {
  approvedBy?: string;
  rejectedBy?: string;
  rejectionReason?: string;
};

const allowedTransitions: Record<
  IncidentStatus,
  IncidentStatus[]
> = {
  detected: ["investigating"],
  investigating: ["recommended"],
  recommended: ["awaiting_approval", "maintenance"],
  awaiting_approval: ["approved", "rejected"],
  approved: ["maintenance"],
  rejected: ["closed"],
  maintenance: ["recovered"],
  recovered: ["closed"],
  closed: [],
};

export function createIncidentRecord(
  input: IncidentInput,
): IncidentRecord {
  if (!input.machineId.trim()) {
    throw new Error("Machine ID is required");
  }

  if (!input.recommendedAction.trim()) {
    throw new Error("Recommended action is required");
  }

  const now = new Date().toISOString();

  return {
    ...input,
    id: crypto.randomUUID(),
    status: "detected",
    history: ["detected"],
    createdAt: now,
    updatedAt: now,
    approvedBy: null,
    rejectedBy: null,
    rejectionReason: null,
  };
}

export function transitionIncident(
  incident: IncidentRecord,
  nextStatus: IncidentStatus,
  metadata: TransitionMetadata = {},
): IncidentRecord {
  const allowed = allowedTransitions[incident.status];

  if (!allowed.includes(nextStatus)) {
    throw new Error(
      `Invalid incident transition: ${incident.status} -> ${nextStatus}`,
    );
  }

  // Critical incidents always require approval, even if an upstream
  // investigation payload incorrectly sets requiresHumanApproval to false.
  const approvalRequired =
    incident.severity === "critical" || incident.requiresHumanApproval;

  if (
    approvalRequired &&
    nextStatus === "maintenance" &&
    incident.status !== "approved"
  ) {
    throw new Error(
      "Human approval is required before maintenance",
    );
  }

  if (nextStatus === "approved" && !metadata.approvedBy?.trim()) {
    throw new Error("Approver identity is required");
  }

  if (nextStatus === "rejected") {
    if (!metadata.rejectedBy?.trim()) {
      throw new Error("Rejector identity is required");
    }

    if (!metadata.rejectionReason?.trim()) {
      throw new Error("Rejection reason is required");
    }
  }

  return {
    ...incident,
    status: nextStatus,
    history: [...incident.history, nextStatus],
    updatedAt: new Date().toISOString(),
    approvedBy:
      nextStatus === "approved"
        ? metadata.approvedBy!.trim()
        : incident.approvedBy,
    rejectedBy:
      nextStatus === "rejected"
        ? metadata.rejectedBy!.trim()
        : incident.rejectedBy,
    rejectionReason:
      nextStatus === "rejected"
        ? metadata.rejectionReason!.trim()
        : incident.rejectionReason,
  };
}
