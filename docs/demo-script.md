# Two-minute Loom demo script

## Before recording

- Open `http://localhost:3000` and keep the Network dashboard visible.
- Use the default **100,000** transactions and **PHP Liquidity Crisis** scenario.
- Record the browser tab or screen, not the Enterface editor. Aim for about 2 minutes; do not pause during the Guided Demo.

## Narration and clicks

1. **Open — 0:00–0:15**

   Say: “Payment systems usually optimize one transaction at a time. NETT sees every obligation together, removes offsetting flows, and settles only the difference.”

2. **Start — 0:15–0:25**

   Click **Guided 2-Min Demo**. Say: “This is a deterministic simulation of 100,000 cross-border payment obligations. It is simulated data—no real funds move.”

3. **Compression — 0:25–0:45**

   Let Judge Mode progress. Point to Gross Obligations, Matched / Offset, External Settlement, and Settlement Reduction.

   Say: “These are calculated by the clearing engine at runtime. The matching and netting steps remove reciprocal volume before any residual settlement is routed.”

4. **Autonomous recovery — 0:45–1:15**

   Let the PHP Liquidity Crisis run automatically. Point to the completed four Judge Mode checks, the valid plan, and recovery timing.

   Say: “NETT detects the liquidity constraint, writes it to shared state, re-runs matching, netting, liquidity, and routing, then validates a new plan without a manual recovery step.”

5. **Explainability — 1:15–1:30**

   Scroll to the Decision Log and open one **WHY?** item.

   Say: “Every material agent decision is inspectable. The calculations are deterministic TypeScript, so the route and settlement result can be audited.”

6. **Commercial value — 1:30–1:50**

   Click **Open ROI Analysis**. Point to **Without NETT**, **With NETT**, and **Customer Net Savings**.

   Say: “The same simulation output drives an editable commercial model, so a payment company can see its modeled savings before integration.”

7. **Close — 1:50–2:00**

   Say: “NETT gives high-volume cross-border payment companies a way to test historical obligations, reduce external settlement, and recover from market shocks—without changing code.”

## If there is extra time

Open **Agents** to show the five specialized agents and their shared-memory inspector, or return to Network and upload `data/sample-payments.csv` to demonstrate the customer-shaped data path.
