import { describe, expect, it } from "vitest";
import { getFactoryMachines } from "./factory-data";

describe("getFactoryMachines", () => {
  it("returns the complete 10-machine fleet", () => {
    const machines = getFactoryMachines();

    expect(machines).toHaveLength(10);

    expect(machines.map((machine) => machine.id)).toEqual([
      "CNC-01",
      "CNC-02",
      "CNC-03",
      "CNC-04",
      "CNC-05",
      "CNC-06",
      "CNC-07",
      "CNC-08",
      "CNC-09",
      "CNC-10",
    ]);
  });

  it("keeps CNC-07 as the critical hero machine", () => {
    const machines = getFactoryMachines();

    const cnc07 = machines.find((machine) => machine.id === "CNC-07");

    expect(cnc07).toBeDefined();
    expect(cnc07?.status).toBe("critical");
    expect(cnc07?.telemetry.temperature).toBe(91.4);
    expect(cnc07?.telemetry.vibration).toBe(8.7);
    expect(cnc07?.telemetry.errorCode).toBe("E-204");
  });

  it("contains both normal machines and machines requiring attention", () => {
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

  it("assigns every machine to a production line", () => {
    const machines = getFactoryMachines();

    for (const machine of machines) {
      expect(machine.line).toMatch(/^Production Line [A-D]$/);
    }
  });
});