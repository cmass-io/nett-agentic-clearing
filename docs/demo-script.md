# NETT Loom demo: structure and word-for-word copy

Target length: **3:30–4:00**. Keep the camera on. Record the browser window with NETT open at `http://localhost:3000`.

## Before recording

- Put the NETT Network dashboard on screen.
- Select **100,000** transactions and **PHP Liquidity Crisis**.
- Keep the browser zoomed so the Judge Mode panel and KPI cards fit on screen.
- Close unrelated tabs, notifications, and private windows.
- Test your microphone and camera, then take one breath before starting.
- Do not open browser DevTools. NETT's Decision Log is the clearest app-native execution log for judges.

## Video structure

| Time | Section | Screen |
| --- | --- | --- |
| 0:00–0:25 | Team introduction | Camera prominent; NETT dashboard behind you |
| 0:25–0:50 | Elevator pitch | Dashboard hero and controls |
| 0:50–2:25 | Live core-loop demo | Guided Demo, KPIs, network, shock, Decision Log |
| 2:25–3:05 | How it was built | Agents page and shared memory |
| 3:05–3:35 | Commercial impact | Analysis page and ROI cards |
| 3:35–4:00 | “So what?” close | Analysis buying moment or Network dashboard |

## Word-for-word script and screen actions

### 1. Introduce the team — 0:00–0:25

**Screen:** Camera on. Keep the NETT dashboard visible behind you.

**Say:**

> “Hi, I’m **[YOUR NAME]**. I’m the **[YOUR ROLE—for example: product builder and engineer]** behind NETT. I designed the product, built the clearing simulation and agent workflow, and created the live demo and commercial model. **[If applicable: I worked with TEAMMATE NAME, who led THEIR AREA.]**”

If you are the only team member, remove the bracketed teammate sentence. Keep this section under 30 seconds.

### 2. Deliver the elevator pitch — 0:25–0:50

**Screen:** Make the dashboard the focus. Point to “Clear the network. Settle only the difference.”

**Say:**

> “Cross-border payment companies usually settle transactions one at a time, even when money moving in opposite directions could cancel out. NETT is an agentic clearing network for high-volume payment organizations. It looks at every obligation together, removes offsetting flows, routes only the remaining difference, and automatically recovers when liquidity or settlement rails change. That means less external liquidity, lower modeled cost, and an auditable path to settlement.”

### 3. Run the live core loop — 0:50–2:25

#### Start the network — 0:50–1:05

**Action:** Click **Guided 2-Min Demo** once.

**Say:**

> “I’m running 100,000 seeded, simulated cross-border obligations through the real engine. This is a reproducible simulation; no real funds move.”

#### Show compression — 1:05–1:30

**Action:** Let Judge Mode progress. Point to **Gross Obligations**, **Matched / Offset**, **External Settlement**, and **Settlement Reduction**.

**Say:**

> “The Matching Agent finds reciprocal currency flows. The Netting Agent collapses the residuals into conserved currency positions. NETT then checks liquidity and routes only what still needs external settlement. These numbers are calculated at runtime—they are not hard-coded dashboard results.”

#### Show the network and agents — 1:30–1:50

**Action:** Scroll just enough to show the currency network and Active Agents panel.

**Say:**

> “Five specialized agents coordinate through one shared network state: orchestration, matching, netting, liquidity, and routing. The graph shows the residual settlement routes, while the agent panel shows which responsibilities completed.”

#### Show autonomous shock recovery — 1:50–2:10

**Action:** Let the Guided Demo trigger the PHP Liquidity Crisis. Point to the completed four-step Judge Mode rail, valid plan, shock comparison, and measured recovery time.

**Say:**

> “Now PHP deployable liquidity falls below the normal route requirement. NETT detects the event, writes it to shared state, reopens the optimization loop, reruns the clearing agents, and validates a new plan without another user action. The previous result, new result, modeled cost change, and actual recovery time remain visible.”

#### Show the execution log — 2:10–2:25

**Action:** Scroll to **Decision Log** and open one **WHY?** item.

**Say:**

> “This Decision Log is the system’s live execution record. Every material choice includes its reason and result, while the monetary calculations stay deterministic and testable.”

### 4. Explain how it was built — 2:25–3:05

**Action:** Click **Agents**. Point to the five agent cards and Shared Memory inspector.

**Say:**

> “NETT is built with Next.js, React, TypeScript, and Tailwind. Zustand provides the shared agent state, Recharts powers the economics visualization, and Vitest verifies matching, conservation, liquidity, routing, and shock recovery. Under the hood, deterministic TypeScript engines perform the financial arithmetic and constrained route optimization. The engineering challenge was keeping every obligation conserved while agents reacted to changing liquidity without producing an invalid route. Shared state, explicit invariants, and a deterministic fallback keep the demo fast, inspectable, and reliable.”

### 5. Show commercial impact — 3:05–3:35

**Action:** Click **Analysis**. Point to the waterfall, editable assumptions, **Without NETT**, **With NETT**, and **Customer Net Savings**.

**Say:**

> “The active simulation feeds directly into the analysis page. A payment company can edit the modeled cost assumptions and compare settlement economics before and after NETT. The values are clearly labeled as modeled assumptions, creating an obvious buying moment: upload historical obligations, measure compression, and evaluate a pilot before integration.”

### 6. Answer “So what?” — 3:35–4:00

**Screen:** Keep the ROI cards and “Deploy NETT on Your Payment Network” section visible. Look toward the camera for the final sentence.

**Say:**

> “So what? High-volume payment organizations tie up capital because obligations are optimized independently and disruptions require manual intervention. NETT shows a better operating model: clear the network collectively, settle only the difference, and recover transparently when conditions change. Next, we would pilot this with a payment processor’s historical data, validate the savings model, and connect approved settlement infrastructure. NETT is a simulation today, but the path to a commercial pilot is concrete.”

## Optional 15-second CSV proof

Only include this if the main recording is comfortably under 4:30.

**Action:** Return to **Network**, click **Upload payment CSV**, and point to the downloadable sample.

**Say:**

> “A customer can also test representative historical obligations through the same pipeline using the documented CSV format—without changing application code.”

## Recording guardrails

- Keep the final video under 5 minutes.
- Click **Guided 2-Min Demo** only once and let it complete.
- Do not claim the modeled savings are market prices or guaranteed results.
- Do not describe the simulation as moving or settling real funds.
- If you stumble, pause, repeat the sentence, and continue; a natural walkthrough is better than heavy editing.
- End on the product screen, not the recorder controls.

## Final title and description copy

**Loom title:** `NETT — Agentic Clearing for Global Payments | Hackathon Demo`

**Loom description:**

> NETT is a deterministic multi-agent clearing simulation for high-volume cross-border payment networks. This demo shows 100,000 simulated obligations, network-wide matching and netting, autonomous recovery from a PHP liquidity crisis, inspectable agent decisions, editable modeled economics, and a clear path to a customer pilot.

> Repository: https://github.com/cmass-io/nett-agentic-clearing
