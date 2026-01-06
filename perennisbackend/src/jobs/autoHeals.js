import { detectDrift } from "../lib/driftDetector.js";
import { replayLedger } from "../lib/ledgerReplay.js";

export async function autoHeal() {
  const drift = await detectDrift();

  if (!drift.hasDrift) {
    console.log("✓ No drift detected");
    return;
  }

  console.warn("⚠ Drift detected. Auto-heal starting…");

  const result = await replayLedger();

  console.log(`✓ Auto-heal complete. Events replayed: ${result.applied}`);
}
