
import { describe, expect, it } from "vitest";
import {
  createIncidentRecord,
  transitionIncident,
} from "./incident-lifecycle";

const criticalIncident = {
  machineId: "CNC-07",
  severity: "critical" as const,
  probableCause: "Possible spindle bearing degradation",
  recommendedAction: "Stop the machine and inspect the spindle bearing.",
  requiresHumanApproval: true,
};

const warningIncident = {
  machineId: "CNC-06",
  severity: "warning" as const,
  probableCause: "Abnormal operating temperature",
  recommendedAction: "Schedule a maintenance inspection.",
  requiresHumanApproval: false,
};

describe("incident lifecycle", () => {
  it("creates a new incident in detected state", () => {
    const incident = createIncidentRecord(criticalIncident);

    expect(incident.machineId).toBe("CNC-07");
    expect(incident.status).toBe("detected");
    expect(incident.severity).toBe("critical");
    expect(incident.history).toEqual(["detected"]);
  });

  it("moves an incident from detected to investigating", () => {
    const incident = createIncidentRecord(criticalIncident);

    const updated = transitionIncident(incident, "investigating");

    expect(updated.status).toBe("investigating");
    expect(updated.history).toEqual([
      "detected",
      "investigating",
    ]);
  });

  it("requires investigation before recommending an action", () => {
    const incident = createIncidentRecord(criticalIncident);

    expect(() =>
      transitionIncident(incident, "recommended"),
    ).toThrow();
  });

  it("requires human approval for a critical action", () => {
    let incident = createIncidentRecord(criticalIncident);

    incident = transitionIncident(incident, "investigating");
    incident = transitionIncident(incident, "recommended");
    incident = transitionIncident(incident, "awaiting_approval");

    expect(incident.status).toBe("awaiting_approval");

    expect(() =>
      transitionIncident(incident, "maintenance"),
    ).toThrow();
  });

  it("requires approval for critical incidents even when the input flag is false", () => {
    const criticalWithoutFlag = createIncidentRecord({
      ...criticalIncident,
      requiresHumanApproval: false,
    });

    let incident = transitionIncident(criticalWithoutFlag, "investigating");
    incident = transitionIncident(incident, "recommended");

    expect(incident.requiresHumanApproval).toBe(false);
    expect(() => transitionIncident(incident, "maintenance)).toThrow(
      "Human approval is required before maintenance",
    );
  });

  it("records explicit human approval before maintenance", () => {
    let incident = createIncidentRecord(criticalIncident);

    incident = transitionIncident(incident, "investigating");
    incident = transitionIncident(incident, "recommended");
    incident = transitionIncident(incident, "awaiting_approval");
    incident = transitionIncident(incident, "approved", {
      approvedBy: "factory-supervisor",
    });
    incident = transitionIncident(incident, "maintenance");

    expect(incident.status).toBe("maintenance");
    expect(incident.approvedBy).toBe("factory-supervisor");
  });

  it("allows a non-high-risk recommendation to proceed without approval", () => {
    let incident = createIncidentRecord(warningIncident);

    incident = transitionIncident(incident, "investigating");
    incident = transitionIncident(incident, "recommended");
    incident = transitionIncident(incident, "maintenance");

    expect(incident.status).toBe("maintenance");
    expect(incident.approvedBy).toBeNull();
  });

  it("tracks recovery and closure", () => {
    let incident = createIncidentRecord(warningIncident);

    incident = transitionIncident(incident, "investigating");
    incident = transitionIncident(incident, "recommended");
    incident = transitionIncident(incident, "maintenance");
    incident = transitionIncident(incident, "recovered");
    incident = transitionIncident(incident, "closed");

    expect(incident.status).toBe("closed");
    expect(incident.history).toEqual([
      "detected",
      "investigating",
      "recommended",
      "maintenance",
      "recovered",
      "closed",
    ]);
  });

  it("does not allow transitions after closure", () => {
    let incident = createIncidentRecord(warningIncident);

    incident = transitionIncident(incident, "investigating");
    incident = transitionIncident(incident, "recommended");
    incident = transitionIncident(incident, "maintenance");
    incident = transitionIncident(incident, "recovered");
    incident = transitionIncident(incident, "closed");

    expect(() =>
      transitionIncident(incident, "investigating"),
    ).toThrow();
  });

  it("does not mutate the previous incident record", () => {
    const original = createIncidentRecord(warningIncident);

    const updated = transitionIncident(original, "investigating");

    expect(original.status).toBe("detected");
    expect(updated.status).toBe("investigating");
  });
});
