# FactoryGuard

FactoryGuard is an AI-assisted incident-response dashboard for a **simulated 10-machine CNC factory**. It combines simulated telemetry, a deterministic rule-based investigation engine, evidence and recommendations, demo operator decisions, and incident maintenance/recovery lifecycle tracking.

## Current project status

- **Roadmap phases 1–6:** implemented — safety rules, lifecycle, incident persistence, dashboard functionality, frontend/backend integration, and factory simulation.
- **Phase 7 — reliability:** automated regression coverage includes lifecycle safety, demo operator access, concurrent approval decisions, scenario telemetry, and investigation evidence. Run the full test, lint, and production-build checks on the latest commit before release.
- **Phase 8 — release readiness:** CI workflow, environment-variable template, and setup/deployment checklist are committed. **Deployment is not yet verified**; configure MongoDB settings, confirm the GitHub Actions run, deploy to Render, and complete the post-deployment smoke test.
- **Planned separately:** AMD GPU-backed model inference and Evolus AI integration. Neither should be treated as complete until the live integration is configured and tested.
- **Important boundary:** the machine telemetry is simulated. This project is not connected to live CNC/PLC hardware and is not an industrial control system.

## Technology stack

- Next.js App Router, React, TypeScript and Tailwind CSS
- Demo-only operator entry (no external identity provider)
- MongoDB for durable incident records
- Deterministic incident investigation and an optional OpenAI-compatible vLLM endpoint
- Vitest, ESLint and the Next.js production build

## Requirements

- Node.js supported by the installed Next.js version (Node.js 22 LTS is a practical choice)
- npm
- MongoDB Atlas or another supported MongoDB deployment for durable incident storage
- Optional: a reachable OpenAI-compatible vLLM endpoint

## Run locally

Install dependencies:

```bash
npm ci
```

Create a local environment file:

**Windows PowerShell**
```powershell
Copy-Item .env.example .env.local
```

**macOS/Linux**
```bash
cp .env.example .env.local
```

No authentication credentials are required for the public demo. Configure MongoDB in the root `.env.local` if you want incident records to survive server restarts. Then run:

```bash
npm run dev
```

Open http://localhost:3000.

## Environment variables

| Variable | Purpose |
|---|---|
| `MONGODB_URI` | Server-only MongoDB connection string |
| `MONGODB_DB` | Database name; defaults to `factoryguard` |
| `MONGODB_DNS_SERVERS` | Optional comma-separated DNS resolver IPs if SRV lookup fails |
| `VLLM_BASE_URL` | Optional server-side OpenAI-compatible vLLM base URL |
| `VLLM_MODEL` | Model name served by the configured endpoint |

Never expose MongoDB credentials or model endpoint credentials to browser code. Do not commit `.env.local` or real secrets. The repository ignores `.env*`; commit only the placeholder `.env.example`.

## MongoDB persistence

When `MONGODB_URI` is configured, incident records are stored in the database named by `MONGODB_DB` (default `factoryguard`) in the `incidents` collection. Without `MONGODB_URI`, the application uses a process-local in-memory fallback for development/tests; that fallback is not durable and is not suitable as production persistence.

To configure MongoDB Atlas:

1. Create a cluster and database user.
2. Configure Atlas Network Access to allow connections from the deployment host. For a public demo on a host without fixed outbound IPs, Atlas may require `0.0.0.0/0`; use a strong database password and least-privilege database user, and understand that this allows connection attempts from any IP.
3. Add the full Atlas connection string to the host's server-side environment as `MONGODB_URI` and set `MONGODB_DB=factoryguard`.
4. Restart/redeploy, create an investigation, and verify the record appears in the `incidents` collection.
5. Verify that decisions and lifecycle changes update the saved status/history.

If the default DNS resolver cannot resolve the Atlas SRV record, configure `MONGODB_DNS_SERVERS` with a resolver permitted by your network. Do not add this workaround unless it is needed.

## Authentication and incident safety

- The app uses a fixed Demo Operator identity so reviewers can enter without third-party sign-in.
- Demo mode does not provide real authentication or authorization. It is only for this simulated showcase; do not connect it to real equipment or sensitive production data.
- Critical incidents require human approval before maintenance.
- Decision and lifecycle updates use status checks to reject stale or competing transitions.
- The deterministic rule engine remains the safety baseline. Optional model output is advisory and must not override severity, verified evidence or mandatory approval.

## Verification

Run all three checks before merging/deploying:

```bash
npm test
npm run lint
npm run build
```

## Simulation and incident workflow

The simulation supports start, pause, reset, tick advancement, and controlled scenarios: spindle degradation, thermal overload, vibration anomaly, motor overload, cooling failure and lubrication issue.

Typical demo path:

1. Open the FactoryGuard demo sign-in page and continue as Demo Operator.
2. Select a machine and inject a fault scenario.
3. Run an investigation and inspect the evidence/recommendation.
4. Review the saved incident.
5. Approve or reject the proposed intervention as the operator.
6. If approved, advance through maintenance, recovery and closure.

Simulation state is currently process-memory based, so it may reset when the server restarts or when multiple server instances do not share memory. Incident persistence is separate and requires MongoDB configuration.

## Phase 7 — reliability checklist

- Exercise the complete scenario-to-closure workflow.
- Verify demo entry, input validation, competing decisions and lifecycle transitions.
- Test competing approval/rejection requests and lifecycle transitions.
- Test missing incidents, invalid payloads, database outage/error paths and simulation reset/isolation.
- Review logs and errors for accidental secret disclosure.

## Phase 8 — deployment checklist

- Set MongoDB and optional model endpoint values in the deployment platform's server-side environment settings.
- Keep this deployment in demo-only mode; do not treat the demo entry page as a security boundary.
- Confirm MongoDB network access and durable writes from the deployed runtime.
- Deploy, then smoke-test sign-in, dashboard, simulation, investigation, saved incident restore, decisions and lifecycle transitions.
- Confirm the simulation's in-memory limitations are acceptable for the demo and rehearse a fallback if model inference is unavailable.

## Planned integrations (not yet complete)

### AMD GPU-backed inference

Confirm GPU/runtime access and supported ROCm/software versions, serve a compatible model (for example through vLLM where supported), configure the server-side endpoint, test latency and failure fallback, and document reproducible demo evidence. AMD credits or an endpoint request alone do not mean GPU inference is integrated.

### Evolus AI

First confirm the exact Evolus AI product, API documentation, credentials and supported workflow. Implement a server-side adapter only after its contract is known; validate schema, authentication, timeouts and outages. Preserve the deterministic safety engine and human approval rules.

## Current limitations

- Telemetry is simulated; no live CNC/PLC or production equipment is connected.
- Risk/health/production estimates are demo heuristics and require plant-specific validation before any real operational use.
- Simulation state is in memory and is not distributed or durable.
- Live AMD GPU inference and Evolus AI integration remain planned work.
