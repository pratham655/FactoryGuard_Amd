# FactoryGuard 🏭
### AI-Assisted Industrial Incident Intelligence for CNC Operations

FactoryGuard is an interactive industrial-operations prototype built around a **simulated 10-machine CNC factory**. It brings telemetry monitoring, fault detection, incident investigation, maintenance recommendations, operator decisions, and incident lifecycle tracking into one workflow.

**Live demo:** https://factoryguard-amd.onrender.com  
**GitHub repository:** https://github.com/pratham655/FactoryGuard_Amd

> **Hackathon demo boundary:** Factory telemetry and machine faults are simulated. FactoryGuard is a prototype—not an industrial control system—and is not connected to real CNC machines, PLCs, or plant sensors.

---

## Why FactoryGuard?

When a machine starts showing abnormal readings, a warning alone is not enough. Operators need to understand what triggered the incident, which observations support the diagnosis, what remains uncertain, and what action should be reviewed by a qualified person.

FactoryGuard demonstrates an evidence-led workflow:

**Detect → Investigate → Review evidence → Approve or reject → Maintain → Recover → Close**

Our goal is to explore how AI-assisted reasoning and accessible AI infrastructure can support clearer, more consistent industrial decision-making while keeping people in control.

## Key features

- **10-machine factory dashboard:** review the status of a simulated CNC fleet from a single operations view.
- **Telemetry monitoring:** inspect temperature, vibration, motor current, pressure, and fault codes where available.
- **Fault scenarios:** demonstrate simulated spindle degradation, thermal overload, vibration anomalies, motor overload, cooling issues, and lubrication problems.
- **Rule-based incident detection:** compare telemetry against configured thresholds and surface warning or critical conditions.
- **Incident investigation:** present observed readings, potential causes, and recommended next steps as distinct pieces of information.
- **AI-assisted chat:** an Evolus chat widget is integrated into the deployed dashboard and configured to support Italian-language interaction about simulated incidents.
- **Human-in-the-loop workflow:** operators can review proposed interventions and approve or reject them; the prototype does not directly control machinery.
- **Incident lifecycle:** follow supported incident transitions through maintenance, recovery, and closure.
- **Optional persistent storage:** MongoDB can store incident records when configured.
- **Responsive interface:** navigate factory status, machine details, incidents, maintenance, investigation, technical knowledge, and governance areas.

## AMD ecosystem exploration

FactoryGuard was developed for an industrial AI use case and explores the AMD developer ecosystem as a potential path for AI inference.

- **AMD Token Factory:** we accessed the Token Factory-compatible API endpoint and confirmed that its model catalogue was reachable during testing.
- **Model exploration:** we explored model options exposed through the provider configuration, including DeepSeek-family models, as candidates for incident-investigation workflows.
- **Practical application:** the intended use is to help explain telemetry, distinguish observed evidence from hypotheses, and produce operator-reviewable maintenance recommendations.
- **Deployment-aware design:** the application separates deterministic incident logic from optional model-based assistance so the core demo can still provide a baseline when an external model is unavailable.

**Integration status:** AMD Token Factory access and model-catalogue connectivity were explored, but a successful end-to-end AMD model inference request from the deployed FactoryGuard investigation backend has not been verified. We therefore do not claim that the live backend is currently executing inference on AMD GPUs. Verifying and documenting that end-to-end path is a clear next step.

## Demo walkthrough

1. Open the [live FactoryGuard demo](https://factoryguard-amd.onrender.com).
2. Enter through the demo operator flow if prompted.
3. Review the fleet overview and select a machine.
4. Open an active incident or exercise a supported simulated fault.
5. Review the available telemetry and investigation.
6. Open the Evolus chat widget and ask a question in Italian, for example:

   > Analizza l'incidente simulato CNC-07 usando tutte le telemetrie disponibili. Distingui le evidenze osservate dalle ipotesi e indica le incertezze.

7. Review the recommendation and demonstrate the operator approval/rejection flow.
8. Where available, follow the incident through maintenance, recovery, and closure.

**Suggested presentation evidence:** the fleet overview, a detailed machine/incident view, the Italian chat response, and the human-approval step. Make clear that machine readings and faults are simulated.

## Example incident

The dashboard's CNC-07 demonstration context includes the following simulated observations:

| Signal | Example reading | Configured reference |
|---|---:|---:|
| Temperature | 91.4 °C | 80 °C limit |
| Vibration | 8.7 mm/s | 5.0 mm/s limit |
| Motor current | 17.8 A | Context reading |
| Pressure | 4.2 bar | Context reading |
| Fault code | E-204 | Reported simulated code |

These values illustrate how the interface can bring multiple signals into one investigation. They are demo values, not readings from real equipment, and should not be treated as a confirmed physical diagnosis.

## How it works

1. **Simulation and telemetry** provide the current state of each demo machine.
2. **Rule-based detection** compares readings with configured thresholds and identifies incident severity.
3. **Investigation logic** builds a probable cause, evidence summary, and recommended action from available information. Optional model integrations are advisory and can fall back to deterministic rules.
4. **Operator review** keeps consequential decisions under human control.
5. **Incident storage and lifecycle** record supported decisions and progress when persistence is configured.

The system should distinguish observed facts from hypotheses and identify missing data or uncertainty rather than presenting a possible cause as confirmed.

## Technology stack

| Area | Technology |
|---|---|
| Web framework | Next.js App Router |
| UI | React, TypeScript, Tailwind CSS v4 |
| Icons | Lucide React |
| Tests | Vitest |
| Code quality/build | ESLint, Next.js production build |
| Incident persistence | MongoDB (optional configuration) |
| Optional model integration | OpenAI-compatible inference endpoint |
| AI chat widget | Evolus widget, configured for Italian |
| AMD exploration | AMD Token Factory-compatible API/model catalogue |

## Run locally

### Requirements

- Node.js compatible with the version declared in `package.json` (Node.js 22 LTS is a practical choice)
- npm
- Optional: MongoDB instance for persistent incident records
- Optional: a reachable OpenAI-compatible model endpoint for inference experiments

### Install and start

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

Configure local values in `.env.local` and hosted values in your deployment platform's environment settings.

| Variable | Purpose |
|---|---|
| `MONGODB_URI` | MongoDB connection string for durable incident records |
| `MONGODB_DB` | Database name; defaults to `factoryguard` |
| `MONGODB_DNS_SERVERS` | Optional comma-separated DNS resolver IPs if MongoDB SRV lookup fails |
| `VLLM_BASE_URL` | Optional base URL for a reachable OpenAI-compatible inference endpoint |
| `VLLM_MODEL` | Optional model identifier served by that endpoint |
| `NEXT_PUBLIC_EVOLUS_WIDGET_TOKEN` | Public browser-side widget token used to load Evolus chat; not a server-side API key |

Only configure optional integrations when you have valid credentials and a reachable endpoint. **Never commit secrets or share API keys in screenshots.** Do not expose server-side credentials through `NEXT_PUBLIC_*` variables. The Evolus widget token is browser-visible by design; private API keys must remain server-side.

### MongoDB persistence

When `MONGODB_URI` is configured, incident records use the database named by `MONGODB_DB` (default `factoryguard`) and the `incidents` collection. Without MongoDB configuration, an in-memory fallback may be used; it is not durable and may be lost when the process restarts.

For MongoDB Atlas, create a database user, configure network access for the deployment host, set the connection string as a server-side environment variable, redeploy, and verify that records and status changes persist. Use appropriately limited permissions.

## Tests and quality checks

Run the checks before making a release:

```bash
npm test
npm run lint
npm run build
```

Run tests in watch mode:

```bash
npm run test:watch
```

Passing tests or a successful build does not prove that external AI services are reachable. Verify external integrations separately in the deployed environment.

## AI and integration notes

### Evolus chat widget

The website widget is integrated into the dashboard and configured to prefer Italian (`it`). Its replies depend on the agent, model, and widget settings in the Evolus workspace. The website chat widget is separate from the dashboard's incident-investigation API.

### Incident investigation

The deterministic rule engine provides a baseline for severity, evidence, and recommendations. Optional model output should remain advisory and must not override verified telemetry, incident severity, or required human approval. Do not describe the investigation backend as powered by a particular provider unless its actual backend request has been configured and verified end to end.

### AMD Token Factory and inference

AMD Token Factory was explored as a model-access route for the project. API endpoint/model-catalogue connectivity was observed during testing. A model-catalogue response or a separate chat-widget reply does **not** prove that FactoryGuard's backend completed an AMD model inference request, nor does it prove execution on AMD GPU hardware. Such claims require a reproducible end-to-end request and evidence of the serving infrastructure.

## Safety, limitations, and next steps

- **Simulated data:** no live CNC, PLC, or factory sensor integration.
- **Prototype only:** never connect this demo to machinery or use it as the sole basis for maintenance decisions.
- **Human approval:** consequential interventions require qualified human review and approved site procedures.
- **Demo access:** demo operator entry is not production-grade authentication or authorization.
- **Persistence:** durable incident records require MongoDB configuration; in-memory fallback data is not durable or distributed.
- **AI uncertainty:** model output can be incomplete or incorrect; preserve evidence, uncertainty, and operator oversight.
- **External services:** integrations depend on valid configuration, credentials, availability, and network access.
- **AMD inference:** end-to-end backend inference and AMD GPU execution remain to be verified before being claimed as active.

### Next steps

1. Repeat the deployed demo smoke test on the submission version.
2. Verify the Italian chat widget and capture clear screenshots.
3. Run tests, lint, and a production build on the final source.
4. If claiming AMD-powered inference, complete and document a real end-to-end model request from FactoryGuard through the AMD-hosted serving path.
5. Keep presentation and submission claims aligned with the behavior that can be demonstrated.

---

Built as an exploration of evidence-led industrial incident response, AI-assisted decision support, and human-supervised maintenance workflows.
