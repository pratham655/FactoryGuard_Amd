# FactoryGuard

FactoryGuard is an AI-assisted industrial incident-response dashboard for a simulated 10-machine factory. It correlates machine telemetry, presents evidence and remediation guidance, and routes high-risk actions through a human decision workflow.

## Requirements

- Node.js compatible with the installed Next.js version
- npm
- Optional: MongoDB Atlas for durable incident storage
- Optional: a reachable OpenAI-compatible vLLM endpoint

## Run locally

```bash
npm install
cp .env.example .env.local
npm run dev
```

On Windows PowerShell, use `Copy-Item .env.example .env.local` instead of `cp`. Open http://localhost:3000.

## Environment configuration

- `VLLM_BASE_URL`: optional OpenAI-compatible vLLM API base URL
- `VLLM_MODEL`: model name exposed by that endpoint
- `MONGODB_URI`: server-only MongoDB connection string
- `MONGODB_DB`: database name (defaults to `factoryguard`)

Keep `MONGODB_URI` private. Never expose it in client code or commit real credentials. When `MONGODB_URI` is configured, incidents are stored in the MongoDB database named by `MONGODB_DB`. If it is absent, the app uses a process-local in-memory fallback for development/tests; that fallback is not durable and must not be treated as production persistence.

## Enable durable incident storage

1. Create a free MongoDB Atlas cluster and a database user.
2. Configure Network Access so your development environment can reach the cluster.
3. Put `MONGODB_URI` and `MONGODB_DB=factoryguard` in the root `.env.local` file.
4. Restart the development server and run an investigation.
5. Confirm the record appears in the `factoryguard` database's `incidents` collection and that an approval/rejection updates its status and history.

The MongoDB driver connects from server-side code only. The current operator field records a supplied name or staff ID; it does not authenticate the operator. Add real authentication/authorization before production use.

## Verification

```bash
npm test
npm run lint
npm run build
```

## Incident workflow

Investigation creates an incident with a status history. The approval API validates the decision, requires an operator identity, requires a reason for rejection, and rejects decisions that are no longer awaiting approval. MongoDB decision writes use a status-filtered update to prevent competing decisions from both succeeding.

## Current limitations

- The local fallback is in-memory and resets with the process.
- Operator identity is not yet verified against an authenticated account.
- A successful test of the vLLM adapter does not prove a live model endpoint is reachable; verify live inference separately.
- Maintenance/recovery UI and lifecycle transitions still need end-to-end completion.
