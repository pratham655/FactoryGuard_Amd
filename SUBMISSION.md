# FactoryGuard — Hackathon Submission Notes

## One-line pitch

FactoryGuard is an AI-assisted industrial incident investigation dashboard that turns simulated factory telemetry into evidence-based fault hypotheses, prioritized maintenance recommendations, and human-reviewed incident workflows.

## Problem

Factory operators need to notice abnormal machine behavior early, understand why an incident may be occurring, and coordinate a safe response. Raw telemetry alone does not explain the likely cause or what to inspect next.

## Solution

FactoryGuard provides a simulated 10-machine factory control room with telemetry, incident detection, investigation evidence, recommended actions, incident history, and a human approval workflow. It is designed to keep operator decisions explicit rather than letting an AI response directly control machinery.

## Demo walkthrough

1. Open the deployed demo: https://factoryguard-amd.onrender.com
2. Enter through the Demo Operator flow.
3. Open a machine and inspect its current telemetry and status.
4. Trigger or inspect an available simulated fault scenario.
5. Run the incident investigation and review the evidence, probable cause, confidence, and recommended action.
6. Review the incident and demonstrate the human approval/rejection step.
7. If the scenario supports it, walk through maintenance, recovery, and closure.

Rehearse this flow once before recording or presenting. If the hosted demo is unavailable, run the app locally using the README instructions.

## Core capabilities

- Interactive monitoring for a simulated 10-machine factory.
- Simulated telemetry and controlled fault scenarios.
- Deterministic incident detection and evidence-backed investigation baseline.
- Recommended maintenance actions and explicit human approval for critical interventions.
- Incident persistence when MongoDB is configured.
- Incident lifecycle tracking through maintenance, recovery, and closure.
- Optional server-side model integration work isolated from the deterministic safety baseline.

## Technology

- Next.js App Router, React, TypeScript, Tailwind CSS
- MongoDB for durable incident records when configured
- Vitest, ESLint, and Next.js production build
- Optional OpenAI-compatible model endpoint / Evolus adapter work

## Verification and honest scope

The factory data and telemetry are simulated. FactoryGuard is a showcase, not a live industrial control system, and is not connected to real CNC/PLC hardware.

The Evolus/OpenRouter connection and AMD-hosted GPU inference must be described as complete only after a real end-to-end request has been configured and verified. A provider key being connected or a model appearing in a catalogue does not by itself prove successful inference in FactoryGuard or AMD GPU execution.

The Evolus adapter is available in the draft pull request and still needs real workspace configuration and end-to-end validation. Do not claim that an unverified external integration is live.

## Final pre-submission checklist

- [ ] Open the deployed app and rehearse the complete demo path.
- [ ] Confirm the GitHub repository and default branch are accessible to reviewers.
- [ ] Run `npm test`, `npm run lint`, and `npm run build` on the exact code being submitted.
- [ ] Add screenshots or a short demo video if the submission form permits them.
- [ ] Keep API keys, database credentials, and other secrets out of the repository and screenshots.
- [ ] Describe telemetry as simulated and external model/GPU integrations accurately.
- [ ] Submit the repository and deployed demo links in the hackathon form.
