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

## Integration status

### Evolus agent chat adapter — initial implementation, not yet end-to-end verified

The optional server-side chat adapter is being added on `feat/evolus-agent-chat`. It uses the documented OpenAI-compatible endpoint `https://api.evolus.ai/v1/chat/completions`, a server-only Bearer API key and the Evolus model reference `<applicationId>:<agentId>`.

Configure these server-side variables only after creating an API key and agent in the actual Evolus event workspace:

- `EVOLUS_API_KEY`: application API key from the Evolus workspace.
- `EVOLUS_MODEL`: the exact `applicationId:agentId` value for the agent.

This adapter is an integration slice, not proof of an end-to-end Evolus workflow. Workspace credentials, connected model, agent setup, and live requests have not been verified here. It does not by itself satisfy the partner award's requirement to use at least two Evolus building blocks. Before describing the solution as AMD-powered, configure and verify the agent's model endpoint on AMD infrastructure and preserve real runtime evidence. The deterministic investigation engine still owns severity, evidence and the human-approval gate; invalid setup, malformed answers and provider errors fall back to that engine.

### AMD GPU-backed inference — not yet verified in FactoryGuard

Confirm actual GPU/runtime access and supported ROCm/software versions, serve a compatible open model with vLLM on AMD infrastructure, point the server-side configuration at that endpoint, and capture repeatable evidence from the real FactoryGuard investigation request. AMD credit submission, an endpoint URL, or a generic model response alone do not prove AMD execution. The public deployed demo must not be described as AMD-inference-enabled until the live request is successfully tested end to end.

## Current limitations

- Telemetry is simulated; no live CNC/PLC or production equipment is connected.
- Risk/health/production estimates are demo heuristics and require plant-specific validation before any real operational use.
- Simulation state is in memory and is not distributed or durable.
- Live AMD GPU inference and Evolus AI integration remain planned work.
