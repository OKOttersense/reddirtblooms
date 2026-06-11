/**
 * Fetch stage IDs for the Bouquet Bar pipeline by searching for opportunities
 * in that pipeline — GHL returns pipelineStage info in opportunity results.
 * If no opportunities exist, try creating a dummy one to get stage IDs back.
 */
import 'dotenv/config';

const PIPELINE_ID = 'oqXWWwrxP30GmEp3DDbi';
const LOCATION_ID = process.env.GHL_LOCATION_ID;
const PRIVATE_KEY = process.env.GHL_PRIVATE_API_KEY;
const BASE = 'https://services.leadconnectorhq.com';
const HEADERS = {
  Authorization: `Bearer ${PRIVATE_KEY}`,
  Version: '2021-07-28',
  'Content-Type': 'application/json',
};

// Try searching opportunities in this pipeline
const searchRes = await fetch(
  `${BASE}/opportunities/search?location_id=${LOCATION_ID}&pipeline_id=${PIPELINE_ID}&limit=25`,
  { headers: HEADERS }
);
console.log('Search status:', searchRes.status);
const searchData = await searchRes.json() as {
  opportunities?: { id: string; pipelineStage?: { id: string; name: string } }[];
  meta?: unknown;
};
console.log('Opportunities found:', searchData.opportunities?.length ?? 0);
if (searchData.opportunities?.length) {
  for (const opp of searchData.opportunities) {
    console.log('Stage:', opp.pipelineStage?.name, '|', opp.pipelineStage?.id);
  }
}

// Try GET all pipelines list
const listRes = await fetch(
  `${BASE}/opportunities/pipelines/?locationId=${LOCATION_ID}`,
  { headers: HEADERS }
);
console.log('\nPipelines list status:', listRes.status);
const listText = await listRes.text();
console.log(listText.slice(0, 2000));
