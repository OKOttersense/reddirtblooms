# GoHighLevel AI Task Workflows — Step-by-Step Setup Guide

**Red Dirt Blooms — Internal Reference**
**Last Updated:** June 2026

---

## Overview

GoHighLevel's **AI Tasks** feature allows you to embed AI-generated work directly inside your automation workflows. Instead of manually writing proposals, researching leads, or analyzing competitors, you create a workflow that fires an AI Task at the right moment, stores the result, and routes it to the right person or record.

This guide covers four production-ready workflow patterns. Each section provides exact navigation steps, field values, and configuration notes so you can build the workflow from scratch inside GHL.

---

## Prerequisites

Before building any of these workflows, confirm the following are in place:

| Requirement | Where to Check |
|---|---|
| AI Tasks feature enabled on your GHL plan | Settings → Company → Subscription |
| At least one AI model configured | Settings → AI → AI Models |
| Custom field for Task ID storage created | Settings → Custom Fields → Contacts or Opportunities |
| Workflow builder access | Automations → Workflows |
| Relevant pipeline stages exist | CRM → Pipelines |

**Create the Task ID custom field first.** Go to **Settings → Custom Fields**, select **Contacts** or **Opportunities** (depending on your workflow), click **+ Add Field**, set the type to **Text**, and name it `AI Task ID`. You will map this field in every workflow below.

---

## How AI Tasks Work in GHL

When a workflow runs an **AI: Create Task** action, GHL sends your prompt to the configured AI model and returns a **Task ID**. The task runs asynchronously — meaning the result is not immediately available. The standard pattern is:

1. **Create Task** — fire the AI prompt, capture the Task ID.
2. **Store Task ID** — save it to a custom field on the contact or opportunity.
3. **Wait** — pause the workflow to give the AI time to complete (typically 1–5 minutes).
4. **Get Task** — retrieve the result using the stored Task ID.
5. **Act** — use the result in a note, email, internal notification, or next step.

This pattern applies to all four workflows below.

---

## Workflow 1: Proposal Generation

**Use Case:** When an opportunity moves to the "Proposal Requested" stage, automatically generate a tailored proposal draft and notify the sales representative.

### Step 1 — Create the Workflow

1. Navigate to **Automations → Workflows**.
2. Click **+ New Workflow**.
3. Select **Start from Scratch**.
4. Name it: `Proposal Generation — AI Task`.
5. Click **Save**.

### Step 2 — Add the Trigger

1. Click **+ Add Trigger**.
2. Select **Opportunity Stage Changed**.
3. Under **Filter**, set:
   - **Pipeline:** select your sales pipeline (e.g., "Florist Wholesale Pipeline").
   - **Stage:** select "Proposal Requested" (or whatever stage name you use).
4. Click **Save Trigger**.

### Step 3 — Add the AI: Create Task Action

1. Click **+** below the trigger to add an action.
2. Search for and select **AI: Create Task**.
3. Configure the fields:

| Field | Value |
|---|---|
| **Task Name** | `Generate Proposal for {{opportunity.name}}` |
| **Model** | Select your configured AI model (e.g., GPT-4o) |
| **Prompt** | See prompt below |
| **Output Format** | Text |

**Prompt to enter:**

```
You are a sales assistant for Red Dirt Blooms, an organic flower farm in Oklahoma. 
Write a professional wholesale proposal for the following florist:

Business Name: {{contact.company_name}}
Contact Name: {{contact.first_name}} {{contact.last_name}}
Email: {{contact.email}}
City: {{contact.city}}
Opportunity Value: {{opportunity.monetary_value}}
Notes: {{opportunity.notes}}

The proposal should include:
1. A warm, personalized opening paragraph referencing their business name and location.
2. A summary of Red Dirt Blooms' offerings (seasonal cuts, CSA subscriptions, specialty varieties).
3. Proposed pricing tier based on the opportunity value.
4. Next steps and a call to action to schedule a farm visit or call.
5. A professional closing.

Keep the tone warm, local, and farm-authentic. Avoid corporate language.
```

4. Click **Save Action**.

### Step 4 — Store the Task ID

1. Click **+** to add the next action.
2. Select **Update Contact** (or **Update Opportunity** if you prefer).
3. Find the **AI Task ID** custom field you created in Prerequisites.
4. In the value field, click the merge tag icon and select **AI Task → Task ID** from the previous step.
5. Click **Save Action**.

### Step 5 — Add a Wait Step

1. Click **+** to add the next action.
2. Select **Wait**.
3. Set the duration to **3 minutes** (adjust based on your AI model's typical response time).
4. Click **Save Action**.

### Step 6 — Add the AI: Get Task Action

1. Click **+** to add the next action.
2. Search for and select **AI: Get Task**.
3. In the **Task ID** field, click the merge tag icon and select the **AI Task ID** custom field you just populated.
4. Click **Save Action**.

### Step 7 — Create an Internal Note

1. Click **+** to add the next action.
2. Select **Create Note** (under CRM or Contact actions).
3. In the **Note Body** field, enter:

```
AI-Generated Proposal Draft:

{{ai_task.result}}

---
Generated automatically on {{now | date: "%B %d, %Y"}} when opportunity moved to Proposal Requested stage.
```

4. Click **Save Action**.

### Step 8 — Notify the Sales Representative

1. Click **+** to add the next action.
2. Select **Send Internal Notification** (or **Send Email** to an internal address).
3. Configure:
   - **To:** your email or the assigned user's email.
   - **Subject:** `Proposal Draft Ready — {{contact.company_name}}`
   - **Body:** `A proposal draft has been generated for {{contact.first_name}} {{contact.last_name}} at {{contact.company_name}}. Review it in the contact notes before your next touchpoint.`
4. Click **Save Action**.

### Step 9 — Publish

1. Toggle the workflow status from **Draft** to **Published** in the top-right corner.
2. Click **Save**.

---

## Workflow 2: Lead Research Automation

**Use Case:** When a new form is submitted (florist application, Bloom Watch signup, or Bouquet Bar inquiry), automatically research the contact's company and deliver a summary to the assigned user before outreach begins.

### Step 1 — Create the Workflow

1. Navigate to **Automations → Workflows**.
2. Click **+ New Workflow → Start from Scratch**.
3. Name it: `Lead Research — AI Task`.
4. Click **Save**.

### Step 2 — Add the Trigger

1. Click **+ Add Trigger**.
2. Select **Form Submitted** (or **Tag Added** if you prefer to trigger on a specific tag like `florist-applicant`).
3. If using Form Submitted:
   - Select the specific form (e.g., "Florist Wholesale Application").
4. If using Tag Added:
   - Set the tag filter to `florist-applicant`.
5. Click **Save Trigger**.

### Step 3 — Add the AI: Create Task Action

1. Click **+** and select **AI: Create Task**.
2. Configure:

| Field | Value |
|---|---|
| **Task Name** | `Lead Research — {{contact.company_name}}` |
| **Model** | Your configured AI model |
| **Prompt** | See prompt below |

**Prompt to enter:**

```
You are a research assistant. A new florist has applied to the Red Dirt Blooms wholesale program.

Research and summarize the following:

Business Name: {{contact.company_name}}
Contact Name: {{contact.first_name}} {{contact.last_name}}
Email: {{contact.email}}
City: {{contact.city}}
Website: {{contact.website}}
Phone: {{contact.phone}}

Provide:
1. A brief summary of what type of florist or floral business this appears to be (retail shop, event florist, wedding specialist, etc.) based on the name, city, and any available context.
2. The likely buying patterns for a florist of this type (volume, seasonality, variety preferences).
3. 2–3 personalized conversation starters the sales rep could use on the first call.
4. Any red flags or positive signals worth noting.

Keep the summary under 300 words. Be direct and actionable.
```

3. Click **Save Action**.

### Step 4 — Store the Task ID

1. Click **+** → **Update Contact**.
2. Map **AI Task ID** field → **AI Task → Task ID**.
3. Click **Save Action**.

### Step 5 — Add a Wait Step

1. Click **+** → **Wait** → set to **2 minutes**.
2. Click **Save Action**.

### Step 6 — Add the AI: Get Task Action

1. Click **+** → **AI: Get Task**.
2. Map Task ID from the **AI Task ID** custom field.
3. Click **Save Action**.

### Step 7 — Add Research Summary to the Record

1. Click **+** → **Create Note**.
2. Note body:

```
Lead Research Summary (AI-Generated):

{{ai_task.result}}

---
Auto-generated on form submission. Review before first outreach.
```

3. Click **Save Action**.

### Step 8 — Notify the Assigned User

1. Click **+** → **Send Internal Notification**.
2. Subject: `New Lead Research Ready — {{contact.company_name}}`
3. Body: `{{contact.first_name}} {{contact.last_name}} just submitted an application. AI research summary is in their contact notes. Review before reaching out.`
4. Click **Save Action**.

### Step 9 — Publish

Toggle to **Published** and save.

---

## Workflow 3: Website Research for Prospecting

**Use Case:** When an opportunity is created or moves to a prospecting stage, analyze the prospect's website and generate a personalized outreach email draft.

### Step 1 — Create the Workflow

1. Navigate to **Automations → Workflows → + New Workflow → Start from Scratch**.
2. Name it: `Website Research — AI Prospecting`.
3. Click **Save**.

### Step 2 — Add the Trigger

Choose one of the following triggers based on your process:

**Option A — Opportunity Created:**
1. Click **+ Add Trigger** → **Opportunity Created**.
2. Filter by pipeline if needed.

**Option B — Stage Changed:**
1. Click **+ Add Trigger** → **Opportunity Stage Changed**.
2. Set stage to your prospecting stage (e.g., "Research Needed").

Click **Save Trigger**.

### Step 3 — Add the AI: Create Task Action

1. Click **+** → **AI: Create Task**.
2. Configure:

| Field | Value |
|---|---|
| **Task Name** | `Website Research — {{contact.company_name}}` |
| **Model** | Your configured AI model |
| **Prompt** | See prompt below |

**Prompt to enter:**

```
You are a prospecting assistant for Red Dirt Blooms, an organic flower farm in Oklahoma.

A new wholesale prospect has been identified. Based on the information below, analyze their website and business, then draft a personalized outreach email.

Prospect Details:
Business Name: {{contact.company_name}}
Contact Name: {{contact.first_name}} {{contact.last_name}}
Website: {{contact.website}}
City: {{contact.city}}
Opportunity Notes: {{opportunity.notes}}

Tasks:
1. Based on the business name, city, and website URL, describe what type of floral business this likely is and what their customers probably care about.
2. Identify 2–3 specific ways Red Dirt Blooms' locally grown, organic, seasonal flowers could benefit this business.
3. Write a short, personalized outreach email (under 150 words) that:
   - Opens with a specific reference to their business or location.
   - Briefly introduces Red Dirt Blooms.
   - Offers one clear value proposition.
   - Ends with a low-friction call to action (reply, quick call, or farm visit).

Tone: warm, direct, farmer-authentic. Not salesy.
```

3. Click **Save Action**.

### Step 4 — Store the Task ID

1. Click **+** → **Update Contact** → map **AI Task ID** → **AI Task → Task ID**.
2. Click **Save Action**.

### Step 5 — Add a Wait Step

1. Click **+** → **Wait** → **3 minutes**.
2. Click **Save Action**.

### Step 6 — Add the AI: Get Task Action

1. Click **+** → **AI: Get Task** → map Task ID from **AI Task ID** field.
2. Click **Save Action**.

### Step 7 — Choose Output Path

**Option A — Log Internally (Recommended First):**
1. Click **+** → **Create Note**.
2. Body: `Website Research + Outreach Draft:\n\n{{ai_task.result}}\n\n---\nAuto-generated. Review and edit before sending.`
3. Click **Save Action**.

**Option B — Send as Email Draft:**
1. Click **+** → **Send Email**.
2. To: `{{contact.email}}`
3. Subject: `Growing something special in Oklahoma — {{contact.company_name}}`
4. Body: `{{ai_task.result}}`
5. Note: Only use this option after reviewing a sample output to confirm quality.

### Step 8 — Notify the Assigned User

1. Click **+** → **Send Internal Notification**.
2. Subject: `Outreach Draft Ready — {{contact.company_name}}`
3. Body: `Website research and email draft are in the contact notes for {{contact.company_name}}. Review and send when ready.`
4. Click **Save Action**.

### Step 9 — Publish

Toggle to **Published** and save.

---

## Workflow 4: Competitor Research and Content Generation

**Use Case:** When an opportunity enters a "Content Strategy" stage, analyze competitor messaging and generate differentiated content ideas, then notify the marketing team.

### Step 1 — Create the Workflow

1. Navigate to **Automations → Workflows → + New Workflow → Start from Scratch**.
2. Name it: `Competitor Research — Content Strategy`.
3. Click **Save**.

### Step 2 — Add the Trigger

1. Click **+ Add Trigger** → **Opportunity Stage Changed**.
2. Set:
   - **Pipeline:** your content or marketing pipeline.
   - **Stage:** "Content Strategy" (create this stage in your pipeline first if it does not exist).
3. Click **Save Trigger**.

### Step 3 — Add the AI: Create Task Action

1. Click **+** → **AI: Create Task**.
2. Configure:

| Field | Value |
|---|---|
| **Task Name** | `Competitor Research — {{opportunity.name}}` |
| **Model** | Your configured AI model |
| **Prompt** | See prompt below |

**Prompt to enter:**

```
You are a content strategist for Red Dirt Blooms, an organic flower farm in Oklahoma that sells direct-to-consumer and wholesale to local florists.

Red Dirt Blooms' differentiators:
- 100% Oklahoma-grown, no imports
- No chemicals, ever
- Hyper-seasonal, limited availability creates urgency
- Personal farm story and transparency
- Serves OKC metro area

Opportunity Context:
Name: {{opportunity.name}}
Notes: {{opportunity.notes}}
Contact: {{contact.company_name}}

Tasks:
1. Identify the top 3 types of competitors Red Dirt Blooms faces in the OKC market (e.g., grocery store floral departments, national flower delivery services, other local farms). For each, describe their typical messaging and what customers like about them.
2. For each competitor type, identify one messaging gap or weakness Red Dirt Blooms can exploit.
3. Generate 5 content ideas (social posts, blog topics, or email subject lines) that directly counter competitor messaging and reinforce Red Dirt Blooms' differentiators.
4. Write one ready-to-use Instagram caption (under 100 words, no hashtags) that positions Red Dirt Blooms against the "imported flowers" narrative.

Be specific, tactical, and grounded in what actually resonates with local Oklahoma buyers.
```

3. Click **Save Action**.

### Step 4 — Store the Task ID

1. Click **+** → **Update Opportunity** (use opportunity-level custom field if you created one, otherwise use contact-level).
2. Map **AI Task ID** → **AI Task → Task ID**.
3. Click **Save Action**.

### Step 5 — Add a Wait Step

1. Click **+** → **Wait** → **5 minutes** (competitor research prompts are longer and may take more time).
2. Click **Save Action**.

### Step 6 — Add the AI: Get Task Action

1. Click **+** → **AI: Get Task** → map Task ID from **AI Task ID** field.
2. Click **Save Action**.

### Step 7 — Generate Differentiated Content

1. Click **+** → **Create Note** on the opportunity or contact.
2. Note body:

```
Competitor Research + Content Ideas (AI-Generated):

{{ai_task.result}}

---
Generated when opportunity entered Content Strategy stage.
Review with marketing team before publishing any content.
```

3. Click **Save Action**.

### Step 8 — Notify the Marketing Team

1. Click **+** → **Send Internal Notification** (or **Send Email** to your marketing address).
2. Subject: `Content Strategy Brief Ready — {{opportunity.name}}`
3. Body: `Competitor research and content ideas are ready for {{opportunity.name}}. Review in the opportunity notes and schedule a content planning session.`
4. Click **Save Action**.

### Step 9 — Publish

Toggle to **Published** and save.

---

## Merge Fields Quick Reference

The following merge fields are available in all AI Task prompts. Use them to personalize every output automatically.

| Merge Field | What It Inserts |
|---|---|
| `{{contact.first_name}}` | Contact's first name |
| `{{contact.last_name}}` | Contact's last name |
| `{{contact.email}}` | Contact's email address |
| `{{contact.phone}}` | Contact's phone number |
| `{{contact.city}}` | Contact's city |
| `{{contact.company_name}}` | Business name (maps to GHL `company_name` field) |
| `{{contact.website}}` | Contact's website URL |
| `{{opportunity.name}}` | Opportunity name |
| `{{opportunity.monetary_value}}` | Opportunity dollar value |
| `{{opportunity.notes}}` | Notes on the opportunity |
| `{{custom_values.your_field}}` | Any custom value you've created |
| `{{now}}` | Current date/time (use with Liquid filters) |

---

## Best Practices and Troubleshooting

**Task ID storage is non-negotiable.** If you skip the Store Task ID step, the Get Task action has nothing to retrieve. Always store the Task ID immediately after the Create Task action, before the Wait step.

**Wait times are estimates.** If your AI model is slow or the prompt is long, increase the Wait step to 5–10 minutes. You can also add a conditional branch after Get Task to check whether the result is empty and retry if needed.

**Review before automating outbound sends.** For Workflows 3 and 4, start by logging results as internal notes rather than sending emails automatically. Review 10–20 outputs to calibrate prompt quality before enabling auto-send.

**Prompt iteration is part of the process.** Your first prompt will not be perfect. After running each workflow 5–10 times, review the outputs and refine the prompt. Small changes in specificity produce large changes in output quality.

**Test with a real contact.** Use a test contact with complete data (name, company, city, website) to verify the workflow fires correctly and the AI result appears in the note before publishing to production.

| Issue | Likely Cause | Fix |
|---|---|---|
| Get Task returns empty | Wait time too short | Increase Wait to 5–10 minutes |
| Task ID field is blank | Merge tag mapped incorrectly | Re-map AI Task → Task ID in the Update Contact step |
| Workflow does not fire | Trigger filter too narrow | Check pipeline and stage names match exactly |
| AI output is generic | Prompt lacks specifics | Add more contact merge fields and explicit instructions |
| Notification not received | Internal notification misconfigured | Verify the recipient email in the notification action |

---

*This document is an internal reference for Red Dirt Blooms operations. Update prompts seasonally as product offerings and messaging evolve.*
