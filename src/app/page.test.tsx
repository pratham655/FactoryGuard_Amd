import { describe, expect, it } from "vitest";
import { renderToStaticMarkup } from "react-dom/server";
import Home from "./page";

describe("FactoryGuard dashboard", () => {
  it("renders the FactoryGuard heading", () => {
    const html = renderToStaticMarkup(<Home />);

    expect(html).toContain("FactoryGuard");
  });

  it("renders the factory status section", () => {
    const html = renderToStaticMarkup(<Home />);

    expect(html).toContain("Factory Status");
  });

  it("renders the machine monitoring section", () => {
    const html = renderToStaticMarkup(<Home />);

    expect(html).toContain("Machine Monitoring");
  });
});