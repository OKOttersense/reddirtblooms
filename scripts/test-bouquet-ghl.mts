/**
 * End-to-end test: Bouquet Bar inquiry → GHL contact + opportunity
 */
import 'dotenv/config';
import { syncContactToGHL, createBouquetOpportunity } from '../server/ghl.ts';

const testEmail = `bouquet-e2e-${Date.now()}@reddirtblooms-test.com`;
const testName = 'Jane Test Wedding';

console.log('--- Step 1: Sync contact (bouquet-bar-inquiry tag) ---');
const contactId = await syncContactToGHL({
  email: testEmail,
  name: testName,
  phone: '405-555-0123',
  tags: ['bouquet-bar-inquiry'],
  source: 'Bouquet Bar Inquiry Form',
  customFields: [
    { key: 'event_type', field_value: 'Wedding' },
    { key: 'event_date', field_value: '2026-10-15' },
    { key: 'budget', field_value: '$500-$1000' },
  ],
});
console.log('Contact ID:', contactId);

if (!contactId) {
  console.error('FAIL: No contact created');
  process.exit(1);
}

console.log('\n--- Step 2: Create opportunity in New Inquiry stage ---');
const oppId = await createBouquetOpportunity(contactId, testName, 'Wedding', '2026-10-15');
console.log('Opportunity ID:', oppId);

if (!oppId) {
  console.error('FAIL: No opportunity created');
  process.exit(1);
}

// Verify
await new Promise(r => setTimeout(r, 2000));
const verifyRes = await fetch(
  `https://services.leadconnectorhq.com/opportunities/${oppId}`,
  { headers: { Authorization: `Bearer ${process.env.GHL_PRIVATE_API_KEY}`, Version: '2021-07-28' } }
);
const verifyData = await verifyRes.json() as { opportunity?: { id: string; name: string; status: string; pipelineStageId: string } };
const opp = verifyData.opportunity;
console.log('\nVerification:');
console.log('  Name:', opp?.name);
console.log('  Status:', opp?.status);
console.log('  Stage ID:', opp?.pipelineStageId);
console.log('  Expected stage ID: 200dafcb-dfa8-4bf9-a871-79eca32640f1 (New Inquiry)');
console.log('  Stage match:', opp?.pipelineStageId === '200dafcb-dfa8-4bf9-a871-79eca32640f1' ? '✅ PASS' : '❌ FAIL');

// Cleanup
await fetch(`https://services.leadconnectorhq.com/opportunities/${oppId}`, {
  method: 'DELETE',
  headers: { Authorization: `Bearer ${process.env.GHL_PRIVATE_API_KEY}`, Version: '2021-07-28' },
});
await fetch(`https://services.leadconnectorhq.com/contacts/${contactId}`, {
  method: 'DELETE',
  headers: { Authorization: `Bearer ${process.env.GHL_API_KEY}`, Version: '2021-07-28' },
});
console.log('\nCleanup done');
