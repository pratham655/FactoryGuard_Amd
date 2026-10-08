import { describe, expect, it } from "vitest";
import { renderToStaticMarkup } from "react-dom/server";
import MachinePage from "./page";

describe("Machine Workspace page", () => {
  it("renders CNC-07 machine workspace with telemetry and model", async () => {
    const pageElement = await MachinePage({
      params: Promise.resolve({ machineId: "CNC-07" }),
    });

    const html = renderToStaticMarkup(pageElement);

    expect(html).toContain("CNC-07");
    expect(html).toContain("DMG MORI NHX");
    expect(html).toContain("Production Line C");
    expect(html).toContain("AI INCIDENT INVESTIGATION");
    expect(html).toContain("91.4");
  });

  it("renders not found state for non-existent machine ID", async () => {
    const pageElement = await MachinePage({
      params: Promise.resolve({ machineId: "CNC-999" }),
    });

    const html = renderToStaticMarkup(pageElement);

    expect(html).toContain("Machine Not Found");
    expect(html).toContain("CNC-999");
  });
});
