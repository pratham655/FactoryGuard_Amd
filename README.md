# FactoryGuard 🏭

**AI-assisted industrial incident investigation and maintenance planning for a simulated factory.**

FactoryGuard is a web dashboard for monitoring a simulated 10-machine CNC factory, spotting abnormal telemetry, investigating incidents, and reviewing evidence-based maintenance recommendations. It combines a deterministic investigation baseline with an explicit human approval workflow.

> **Demo boundary:** FactoryGuard uses simulated machine telemetry. It is a hackathon demonstration, not an industrial control system, and is not connected to live CNC/PLC hardware.

## Links

- **Live demo:** https://factoryguard-amd.onrender.com
- **GitHub repository:** https://github.com/pratham655/FactoryGuard_Amd
- **Submission notes:** [SUBMISSION.md](./SUBMISSION.md)

## Why FactoryGuard?

Abnormal machine readings are only the beginning of an incident response. Operators also need to understand what the readings suggest, what evidence supports a hypothesis, and which checks should happen next.

FactoryGuard brings these steps together in one workflow: monitor a machine, inspect an incident, review the evidence and recommendations, and keep operational decisions under human control.

## Key features

- **Factory overview:** monitor a simulated fleet of 10 machines.
- **Telemetry and status:** inspect machine readings and reported condition.
- **Fault scenarios:** exercise simulated issues such as spindle degradation, thermal overload, vibration anomaly, motor overload, cooling failure, and lubrication problems.
- **Incident investigation:** view a deterministic, evidence-based investigation with a probable cause and recommended actions.
- **Human approval:** review and approve or reject proposed interventions instead of allowing an AI response to directly control machinery.
- **Incident lifecycle:** follow incidents through maintenance, recovery, and closure where supported by the workflow.
- **Incident records:** MongoDB-backed persistence is available when configured; otherwise, development/test environments can use an in-memory fallback.
- **Optional model integration:** server-side model endpoint and Evolus integration work are separate from the deterministic safety baseline and must be configured and verified before being presented as live.

## Demo walkthrough

1. Open the [FactoryGuard live demo](https://factoryguard-amd.onrender.com).
2. Enter using the demo operator flow if it is available.
3. Select a machine and inspect its status and telemetry.
4. Trigger or open a supported simulated fault scenario.
5. Run the investigation and review the evidence, probable cause, confidence, and recommended action.
6. Review the incident and demonstrate the human approval/rejection step.
7. Where supported, advance the incident through maintenance, recovery, and closure.

The deployed demo may reset simulated state when the server restarts. Rehearse the flow before presenting.

## Tech stack

- **Framework:** Next.js App Router
- **UI:** React, TypeScript, Tailwind CSS v4, Lucide
- **Data:** MongoDB (optional server-side persistence)
- **Testing:** Vitest
- **Code quality:** ESLint and the Next.js production build
- **Optional inference:** OpenAI-compatible endpoint; the Evolus adapter is being developed separately and is not confirmed as a live integration in the default branch

## Run locally

### Requirements

- Node.js compatible with the Next.js version in `package.json` (Node.js 22 LTS is a practical choice)
- npm
- Optional MongoDB deployment for persistent incident records
- Optional reachable OpenAI-compatible model endpoint for inference experiments

### Install and start

```bash
npm ci
```

Create your local environment file.

**Windows PowerShell**
```powershell
Copy-Item .env.example .env.local
```

**macOS/Linux**
```bash
cp .env.example .env.local
```

Then run the development server:

```bash
npm run dev
```

Open http://localhost:3000.

## Environment variables

All values below are server-side. Keep secrets out of browser code and source control.

| Variable | Required? | Description |
|---|---|---|
| `MONGODB_URI` | No | MongoDB connection string. Configure this to persist incident records. |
| `MONGODB_DB` | No | Database name; defaults to `factoryguard`. |
| `MONGODB_DNS_SERVERS` | No | Optional comma-separated DNS resolver IPs if MongoDB SRV lookup fails. |
| `VLLM_BASE_URL` | No | Base URL of a reachable OpenAI-compatible inference endpoint. |
| `VLLM_MODEL` | No | Model identifier served by that endpoint. |

Never commit `.env.local`, real API keys, or database credentials. Do not prefix server-only secrets with `NEXT_PUBLIC_`.

### MongoDB persistence

When `MONGODB_URI` is configured, incident records are stored in the database named by `MONGODB_DB` (default `factoryguard`) in the `incidents` collection. Without it, an in-memory fallback may be used; that data is not durable and can be lost on restart.

For MongoDB Atlas, create a database user with a strong password, configure network access for the deployment host, set the server-side environment variables, redeploy, and verify that an investigation and its status changes are persisted. Avoid broad network access unless your deployment constraints require it and you understand the exposure.

## Development checks

Run the tests, lint, and production build before submitting changes:

```bash
npm test
npm run lint
npm run build
```

Watch tests during development:

```bash
npm run test:watch
```

## Safety and limitations

- **Simulated data only:** no real CNC, PLC, or factory sensors are connected.
- **Not for operational control:** do not use this demo to control equipment or make real maintenance decisions.
- **Demo access is not production authentication:** do not use it to protect sensitive data or real industrial systems.
- **Model output is advisory:** it must not override trusted severity, verified evidence, or required human approval.
- **Persistence depends on configuration:** in-memory simulation state and fallback records are not durable or distributed.
- **External integrations require proof:** a saved provider key or a model appearing in a provider catalogue does not prove that FactoryGuard has completed a real inference request.
- **AMD inference is not verified in the default branch:** do not claim AMD GPU execution without a configured AMD-hosted endpoint and reproducible end-to-end evidence.

## Project status

The repository includes the FactoryGuard dashboard, simulated machine scenarios, incident investigation logic, lifecycle workflow, and automated test setup. Further integrations and deployment configuration should be verified against the actual environment before being described as complete.

For a concise pitch, demo steps, and submission checklist, see [SUBMISSION.md](./SUBMISSION.md).
