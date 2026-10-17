# FactoryGuard 🏭
### Intelligent Industry • AI-Assisted Incident Intelligence for CNC Operations

FactoryGuard is an interactive operations dashboard for a **simulated 10-machine CNC factory**. It brings machine telemetry, fault detection, incident investigation, maintenance recommendations, operator decisions, and incident lifecycle tracking into one workflow.

**Live demo:** https://factoryguard-amd.onrender.com  
**Source code:** https://github.com/pratham655/FactoryGuard_Amd

> **Demo and safety boundary:** All factory telemetry is simulated. FactoryGuard is a hackathon prototype, not an industrial control system. It is not connected to real CNC machines, PLCs, or plant sensors, and must not be used to control equipment or make real maintenance decisions.

---

## Contents

- [The problem](#the-problem)
- [What FactoryGuard does](#what-factoryguard-does)
- [Demo walkthrough](#demo-walkthrough)
- [How it works](#how-it-works)
- [Technology stack](#technology-stack)
- [Run locally](#run-locally)
- [Environment configuration](#environment-configuration)
- [Tests and quality checks](#tests-and-quality-checks)
- [AI and integration status](#ai-and-integration-status)
- [Safety, limitations, and next steps](#safety-limitations-and-next-steps)

## The problem

When a machine starts showing abnormal readings, an operator needs more than a red warning. They need to understand which readings triggered the incident, what the evidence supports, what remains uncertain, and what safe next step should be reviewed by a qualified person.

FactoryGuard demonstrates this workflow in one place: **detect → investigate → review evidence → approve or reject → maintain → recover → close**.

## What FactoryGuard does

- **Factory overview:** monitor a simulated fleet of 10 CNC machines and review overall factory status.
- **Telemetry monitoring:** inspect temperature, vibration, motor current, pressure, and fault codes where available.
- **Fault simulation:** demonstrate scenarios such as spindle degradation, thermal overload, vibration anomaly, motor overload, cooling failure, and lubrication issues.
- **Incident detection:** evaluate telemetry against configured rules and surface warning or critical conditions.
- **AI-assisted chat:** an Evolus website chat widget is integrated into the deployed dashboard. The widget is configured for Italian responses and can be used to discuss simulated incidents. Actual agent output depends on the Evolus workspace configuration and availability.
- **Evidence-based investigation:** present observed readings separately from possible causes and recommendations. The deterministic rule engine remains the fallback baseline.
- **Human-in-the-loop decisions:** operators review proposed interventions and can approve or reject them. The AI does not directly control machinery.
- **Incident lifecycle:** track supported transitions through maintenance, recovery, and closure.
- **Incident persistence:** MongoDB can persist incident records when configured; local or fallback in-memory data is not durable.
- **Responsive operations UI:** navigate factory status, machines, incidents, maintenance, investigations, technical knowledge, and governance sections.

## Demo walkthrough

1. Open the [live FactoryGuard demo](https://factoryguard-amd.onrender.com).
2. Enter through the demo operator flow if prompted.
3. Review the fleet overview and select a machine.
4. Open an active incident or exercise a supported simulated fault.
5. Review telemetry and run the investigation.
6. Open the Evolus chat widget and ask a question in Italian, for example:

   > Analizza l'incidente simulato CNC-07 usando tutte le telemetrie disponibili. Distingui le evidenze osservate dalle ipotesi e indica le incertezze.

7. Review the recommendation and demonstrate the operator approval/rejection flow.
8. Where available, follow the incident through maintenance, recovery, and closure.

**Suggested demo evidence:** capture the fleet overview, one detailed machine/incident view, the Italian chat response, and the human-approval step. Make it clear that the telemetry and machine faults are simulated.

## How it works

At a high level:

1. **Simulation and telemetry** provide the current state of each demo machine.
2. **Rule-based detection** compares readings with configured thresholds and identifies an incident severity.
3. **Investigation logic** creates a probable cause and recommended action from available evidence. Optional model integrations are advisory and can fall back to deterministic rules.
4. **Operator review** keeps critical decisions under human control.
5. **Incident storage and lifecycle** record supported decisions and progress when persistence is configured.

The system should not present a hypothesis as a confirmed physical diagnosis. Missing readings and uncertain causes should be called out explicitly.

## Technology stack

| Area | Technology |
|---|---|
| Web framework | Next.js App Router |
| UI | React, TypeScript, Tailwind CSS v4 |
| Icons | Lucide React |
| Testing | Vitest |
| Code quality/build | ESLint, Next.js production build |
| Incident persistence | MongoDB (optional configuration) |
| Optional inference path | OpenAI-compatible model endpoint |
| Website chat | Evolus widget, configured for Italian |

## Run locally

### Requirements

- Node.js compatible with the version in `package.json` (Node.js 22 LTS is a practical choice)
- npm
- Optional: MongoDB instance for persistent incident records
- Optional: reachable OpenAI-compatible model endpoint for inference experiments

### Install dependencies

```bash
npm ci
```

Create a local environment file.

**Windows PowerShell**
```powershell
Copy-Item .env.example .env.local
```

**macOS / Linux**
```bash
cp .env.example .env.local
```

Start the development server:

```bash
npm run dev
```

Open http://localhost:3000.

## Environment configuration

Set server-side values in `.env.local` for local development and in your deployment platform's environment settings for hosted deployments.

| Variable | Purpose |
|---|---|
| `MONGODB_URI` | MongoDB connection string for durable incident records |
| `MONGODB_DB` | Database name; defaults to `factoryguard` |
| `MONGODB_DNS_SERVERS` | Optional comma-separated DNS resolver IPs if MongoDB SRV lookup fails |
| `VLLM_BASE_URL` | Optional base URL for a reachable OpenAI-compatible inference endpoint |
| `VLLM_MODEL` | Optional model identifier served by that endpoint |
| `NEXT_PUBLIC_EVOLUS_WIDGET_TOKEN` | Public website-widget token used by the browser to load Evolus chat; it is not a server-side API key |

Only configure optional integrations if you have the corresponding valid credentials and endpoint. **Never commit secrets**, share API keys in screenshots, or expose server-side credentials through `NEXT_PUBLIC_*` variables. The widget token is intentionally client-visible; server API keys are not.

### MongoDB persistence

When `MONGODB_URI` is configured, incident records use the database named by `MONGODB_DB` (default `factoryguard`) and the `incidents` collection. Without MongoDB configuration, an in-memory fallback may be used; it is not durable and may be lost when the process restarts.

For MongoDB Atlas, create a database user with a strong password, configure network access for the deployment host, add the connection string as a server-side environment variable, redeploy, and verify that records and status changes persist. Use the least privilege practical for the demo and understand the exposure before allowing broad network access.

## Tests and quality checks

Run these checks before making a release:

```bash
npm test
npm run lint
npm run build
```

For watch mode:

```bash
npm run test:watch
```

A successful build or unit test does not, by itself, prove that external AI services are reachable. Test external integrations separately in the deployed environment.

## AI and integration status

### Evolus chat

The website chat widget is integrated into the dashboard and configured to prefer Italian (`it`). Its replies depend on the agent, model, and widget configuration in the Evolus workspace. The chat widget is a separate integration from the dashboard's incident-investigation API.

### Incident investigation

The deterministic rule engine provides a fallback baseline for severity, evidence, and recommendations. Optional model output must remain advisory; it must not override verified telemetry, incident severity, or mandatory human approval. Do not describe the dashboard's investigation backend as powered by Evolus unless the actual backend request has been configured and successfully verified end to end.

### AMD GPU inference

This repository targets an industrial AI demonstration, but **AMD GPU-backed inference must not be claimed as active unless an actual model endpoint is hosted on AMD infrastructure and a real FactoryGuard request has been verified end to end**. A provider key, model catalogue entry, or separate chat response is not proof of AMD GPU execution. Record reproducible runtime evidence before claiming this capability.

## Safety, limitations, and next steps

- **Simulated telemetry only:** no live CNC, PLC, or factory sensor integration.
- **Prototype, not industrial control:** never connect this demo to machinery or use it as the sole basis for maintenance decisions.
- **Human approval:** critical interventions require qualified human review and approved site procedures.
- **Demo access:** demo operator entry is not production-grade authentication or authorization.
- **Persistence:** incident records require MongoDB configuration; in-memory fallbacks and simulation state are not durable or distributed.
- **AI uncertainty:** model recommendations can be incomplete or wrong. Preserve evidence, uncertainty, and operator oversight.
- **External services:** availability and behavior depend on their own configuration, credentials, and network access.
- **Deployment:** verify the latest hosted build and repeat the demo smoke test before presenting.

### Practical next steps

1. Run tests, lint, and a production build on the final commit.
2. Smoke-test the deployed dashboard, simulation, incident investigation, persistence, and approval flow.
3. Verify the Italian Evolus chat and capture a clean demo screenshot.
4. If pursuing AMD inference, configure an AMD-hosted endpoint and document a reproducible end-to-end request.
5. Keep all claims aligned with what is actually running and verified.

---

Built as a demonstration of evidence-led industrial incident response, with operator oversight at the center.
