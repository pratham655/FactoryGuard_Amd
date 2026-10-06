import { describe, expect, it } from "vitest";
import { getFactoryMachines } from "./factory-data";

describe("getFactoryMachines", () => {
  it("returns the factory machines with their latest telemetry", () => {
    const machines = getFactoryMachines();

    expect(machines.length).toBeGreaterThan(0);

    const cnc07 = machines.find((machine) => machine.id === "CNC-07");

    expect(cnc07).toBeDefined();
    expect(cnc07?.status).toBe("critical");
    expect(cnc07?.telemetry.temperature).toBe(91.4);
    expect(cnc07?.telemetry.vibration).toBe(8.7);
    expect(cnc07?.telemetry.errorCode).toBe("E-204");
  });

  it("contains normal machines as well as machines requiring attention", () => {
    const machines = getFactoryMachines();

    const normalMachines = machines.filter(
      (machine) => machine.status === "normal",
    );

    const attentionMachines = machines.filter(
      (machine) =>
        machine.status === "warning" || machine.status === "critical",
    );

    expect(normalMachines.length).toBeGreaterThan(0);
    expect(attentionMachines.length).toBeGreaterThan(0);
  });
});