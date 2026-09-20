# NETT hackathon submission packet

Use this page to complete the Airtable submission after the Loom recording and repository publication.

## Project title

**NETT — Agentic Clearing for Global Payments**

## Short write-up (220 words)

Cross-border payment companies often settle transactions one at a time, even when opposing payment flows could offset each other. That approach consumes unnecessary external liquidity, creates higher modeled settlement costs, and makes it harder to react quickly when a corridor or currency pool is disrupted.

NETT is a multi-agent clearing simulation for payment processors, fintechs, marketplaces, remittance companies, payroll platforms, and financial institutions with high volumes of multi-currency obligations. Instead of treating each payment independently, NETT analyzes the full obligation network. Its specialized matching, netting, liquidity, and routing agents share one inspectable network state: they offset opposing flows, calculate conserved net positions, check simulated liquidity reserve floors, and select valid settlement routes under cost, time, capacity, and risk constraints.

The live Guided Demo runs 100,000 seeded simulated obligations, then introduces a PHP liquidity crisis. NETT autonomously detects the condition, re-optimizes the network, validates a new settlement plan, and exposes the reasoning behind each major decision. The analysis screen turns calculated engine output into editable modeled economics, showing the difference between conventional settlement and a NETT-optimized network.

The impact is practical: a payments organization can upload representative historical obligations, see modeled settlement compression and savings, and identify a clear path to a pilot. NETT is a hackathon prototype using simulated data only; it does not custody, transmit, or settle real funds.

## Airtable fields to paste

| Field | Value |
| --- | --- |
| Project title | NETT — Agentic Clearing for Global Payments |
| Demo video | Add your Loom URL after recording |
| Public repository | https://github.com/cmass-io/nett-agentic-clearing |
| Deployed URL or app capture | https://nett-agentic-clearing.vercel.app |
| Team roster | Add your name, role, and preferred contact information |
| Short write-up | Use the text above |

## Final pre-submit checklist

- [ ] Loom recording is 2–5 minutes and shows the Guided Demo core loop.
- [ ] Loom URL is added above.
- [x] GitHub repository is public with a readable README.
- [x] GitHub URL is added above.
- [x] A fresh clone installed successfully and passed tests, lint, and production build verification.
- [x] Vercel production deployment is live at https://nett-agentic-clearing.vercel.app.
- [x] The stable production alias returned HTTP 200 without authentication and is ready for public judge access.
- [ ] Team roster is complete.
- [ ] Submission uses the short write-up above.
