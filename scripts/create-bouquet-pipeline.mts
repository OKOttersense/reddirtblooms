/**
 * Creates the Bouquet Bar pipeline in GHL with 5 stages.
 * Run once — prints pipeline ID and stage IDs to hardcode in ghl.ts.
 */
import 'dotenv/config';

const PRIVATE_KEY = process.env.GHL_PRIVATE_API_KEY;
const LOCATION_ID = process.env.GHL_LOCATION_ID;
const BASE = 'https://services.leadconnectorhq.com';
const HEADERS = {
  Authorization: `Bearer ${PRIVATE_KEY}`,
  Version: '2021-07-28',
  'Content-Type': 'application/json',
};

if (!PRIVATE_KEY || !LOCATION_ID) {
  console.error('Missing GHL_PRIVATE_API_KEY or GHL_LOCATION_ID');
  process.exit(1);
}

// Create the pipeline
const res = await fetch(`${BASE}/opportunities/pipelines/`, {
  method: 'POST',
  headers: HEADERS,
  body: JSON.stringify({
    locationId: LOCATION_ID,
    name: 'Bouquet Bar',
    stages: [
      { name: 'New Inquiry', position: 0 },
      { name: 'Quoted',      position: 1 },
      { name: 'Booked',      position: 2 },
      { name: 'Completed',   position: 3 },
      { name: 'Lost',        position: 4 },
    ],
  }),
});

const text = await res.text();
console.log('Status:', res.status);
console.log('Response:', text);

if (!res.ok) {
  console.error('Failed to create pipeline');
  process.exit(1);
}

const data = JSON.parse(text) as {
  pipeline?: { id: string; name: string; stages?: { id: string; name: string; position: number }[] };
};

const pipeline = data.pipeline;
if (!pipeline) {
  console.error('No pipeline in response');
  process.exit(1);
}

console.log('\n=== Bouquet Bar Pipeline Created ===');
console.log('Pipeline ID:', pipeline.id);
console.log('\nStage IDs:');
for (const stage of pipeline.stages ?? []) {
  console.log(`  ${stage.name.padEnd(15)} | ${stage.id}`);
}
