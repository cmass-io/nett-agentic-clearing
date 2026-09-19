# Modeled economics

All economics are assumptions for product discovery, not market claims.

`withoutNett = gross obligations × (traditional settlement bps + FX bps) / 10,000`

`withNettBeforeFee = external settlement × (local settlement bps + FX bps) / 10,000 + one-day liquidity carrying cost + engine modeled route cost`

`grossSavings = max(0, withoutNett − withNettBeforeFee)`

`NETT fee = grossSavings × fee percentage`

`customerNetSavings = grossSavings − NETT fee`

The analysis page exposes every variable. A buyer can replace defaults with internal assumptions, upload historical obligations, and evaluate a platform plus performance-fee model against their own modeled baseline.
