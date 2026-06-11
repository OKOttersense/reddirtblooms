/**
 * Fetch all GHL pipelines and stage IDs
 */
import "dotenv/config";

const GHL_BASE = "https://services.leadconnectorhq.com";
const GHL_VERSION = "2021-07-28";

function ghlHeaders() {
  return {
    Authorization: `Bearer ${process.env.GHL_API_KEY}`,
    Version: GHL_VERSION,
    "Content-Type": "application/json",
  };
}

const res = await fetch(`${GHL_BASE}/opportunities/pipelines?locationId=${process.env.GHL_LOCATION_ID}`, {
  headers: ghlHeaders(),
});

if (!res.ok) {
  console.error("Failed:", res.status, await res.text());
  process.exit(1);
}

const data = await res.json() as { pipelines?: Array<{ id: string; name: string; stages?: Array<{ id: string; name: string; position: number }> }> };

for (const pipeline of data.pipelines ?? []) {
  console.log(`\nPipeline: "${pipeline.name}" — ID: ${pipeline.id}`);
  for (const stage of (pipeline.stages ?? []).sort((a, b) => a.position - b.position)) {
    console.log(`  Stage: "${stage.name}" — ID: ${stage.id}`);
  }
}
