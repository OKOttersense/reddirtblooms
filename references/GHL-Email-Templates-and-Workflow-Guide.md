# Red Dirt Blooms — GHL Email Templates & Workflow Setup Guide

**Version:** 1.0 | **Date:** June 2026  
**Platform:** GoHighLevel (GHL) Sub-Account  
**Domain:** reddirtblooms.ai

---

## Part 1: GHL Workflow Setup — Step-by-Step

### Prerequisites
- GHL Sub-Account with your Location ID set in Manus secrets
- Stripe webhook configured at `https://www.reddirtblooms.ai/api/stripe/webhook`
- GHL form embed active on `/florist-register`

---

### Workflow 1: Bloom Watch Subscriber Welcome

**Trigger:** Contact Tag Added → `bloom-watch-subscriber`

**Steps:**
1. Go to **Automation → Workflows → + New Workflow**
2. Name: `Bloom Watch — Welcome Series`
3. Trigger: **Contact Tag** → Tag Added → `bloom-watch-subscriber`
4. Add Action: **Send Email** → Template: `bloom-watch-welcome` (Template 1)
5. Add Action: **Wait** → 3 days
6. Add Action: **Send Email** → Template: `bloom-watch-nurture-1` (Template 2)
7. Add Action: **Wait** → 7 days
8. Add Action: **Send Email** → Template: `bloom-watch-nurture-2` (Template 3)
9. Save and **Publish**

---

### Workflow 2: Order Confirmation (Stripe Checkout Completed)

**Trigger:** Contact Tag Added → `rdb-order-placed`

> This tag is applied by the Stripe webhook handler when `checkout.session.completed` fires.

**Steps:**
1. New Workflow: `Order — Confirmation & Follow-Up`
2. Trigger: **Contact Tag** → `rdb-order-placed`
3. Action: **Send Email** → Template: `order-confirmation` (Template 4)
4. Wait: 2 days
5. Action: **Send Email** → Template: `order-care-tips` (Template 5)
6. Wait: 5 days
7. Action: **Send Email** → Template: `order-review-request` (Template 6)
8. Publish

---

### Workflow 3: Subscription Welcome (Bloom Box)

**Trigger:** Contact Tag Added → `rdb-subscription-active`

**Steps:**
1. New Workflow: `Subscription — Welcome & Onboarding`
2. Trigger: **Contact Tag** → `rdb-subscription-active`
3. Action: **Send Email** → Template: `subscription-welcome` (Template 7)
4. Wait: 1 day
5. Action: **Send Email** → Template: `subscription-what-to-expect` (Template 8)
6. Publish

---

### Workflow 4: Payment Failed

**Trigger:** Contact Tag Added → `rdb-payment-failed`

**Steps:**
1. New Workflow: `Payment — Failed Recovery`
2. Trigger: **Contact Tag** → `rdb-payment-failed`
3. Action: **Send Email** → Template: `payment-failed` (Template 9)
4. Wait: 2 days
5. Action: **Send SMS** → "Hi {{contact.first_name}}, your Red Dirt Blooms payment didn't go through. Reply HELP or visit reddirtblooms.ai to update your payment method."
6. Publish

---

### Workflow 5: Florist Application Received

**Trigger:** Contact Tag Added → `florist-applicant`

**Steps:**
1. New Workflow: `Florist — Application Received`
2. Trigger: **Contact Tag** → `florist-applicant`
3. Action: **Send Email** → Template: `florist-application-received` (Template 10)
4. Action: **Internal Notification** → Notify owner: "New florist application from {{contact.full_name}} — {{contact.company_name}}"
5. Publish

---

### Workflow 6: Florist Approved

**Trigger:** Contact Tag Added → `florist-approved`

> Applied by admin clicking "Approve" in `/admin` dashboard.

**Steps:**
1. New Workflow: `Florist — Approval & Onboarding`
2. Trigger: **Contact Tag** → `florist-approved`
3. Action: **Send Email** → Template: `florist-approved` (Template 11)
4. Wait: 1 day
5. Action: **Send Email** → Template: `florist-portal-guide` (Template 12)
6. Publish

---

### Workflow 7: Florist Declined

**Trigger:** Contact Tag Added → `florist-declined`

**Steps:**
1. New Workflow: `Florist — Application Declined`
2. Trigger: **Contact Tag** → `florist-declined`
3. Action: **Send Email** → Template: `florist-declined` (Template 13)
4. Publish

---

### Workflow 8: Harvest Blast (New Availability)

**Trigger:** Contact Tag Added → `rdb-harvest-blast`

> Use this when new varieties hit the Harvest Stand. Apply tag to all `florist-approved` contacts.

**Steps:**
1. New Workflow: `Florist — Harvest Blast`
2. Trigger: **Contact Tag** → `rdb-harvest-blast`
3. Action: **Send Email** → Template: `harvest-blast` (Template 14)
4. Action: **Remove Tag** → `rdb-harvest-blast` (so they can receive next blast)
5. Publish

---

### Workflow 9: Bouquet Bar Inquiry Received

**Trigger:** Contact Tag Added → `bouquet-bar-inquiry`

**Steps:**
1. New Workflow: `Bouquet Bar — Inquiry Follow-Up`
2. Trigger: **Contact Tag** → `bouquet-bar-inquiry`
3. Action: **Send Email** → Template: `bouquet-bar-received` (Template 15)
4. Wait: 1 day
5. Action: **Internal Notification** → "Bouquet Bar inquiry from {{contact.full_name}}"
6. Publish

---

### Workflow 10: Re-engagement (Inactive Bloom Watch)

**Trigger:** Contact Tag Added → `bloom-watch-inactive`

**Steps:**
1. New Workflow: `Bloom Watch — Re-engagement`
2. Trigger: **Contact Tag** → `bloom-watch-inactive`
3. Action: **Send Email** → Template: `reengagement` (Template 16)
4. Wait: 7 days
5. Action: **If/Else** → Email Opened? → No → Remove Tag `bloom-watch-subscriber`
6. Publish

---

## Part 2: GHL Email Templates (Ready to Paste)

> **How to use:** GHL → Marketing → Emails → Templates → + New Template → HTML editor → paste below.

---

### Template 1: Bloom Watch Welcome
**Subject:** You're on the list — Red Dirt Blooms is growing for you 🌸

```html
<div style="font-family: Georgia, serif; max-width: 600px; margin: 0 auto; background: #F5F0E8; padding: 40px 32px;">
  <div style="text-align: center; margin-bottom: 32px;">
    <p style="font-family: 'Courier New', monospace; font-size: 11px; letter-spacing: 3px; color: #B5451B; text-transform: uppercase; margin: 0 0 8px;">Red Dirt Blooms</p>
    <h1 style="font-size: 32px; color: #2A1F1A; margin: 0; font-weight: 700;">You're on Bloom Watch.</h1>
  </div>
  <p style="color: #2A1F1A; font-size: 16px; line-height: 1.7;">Hi {{contact.first_name}},</p>
  <p style="color: #2A1F1A; font-size: 16px; line-height: 1.7;">Welcome to Bloom Watch — you're officially first in line when our flowers are ready to cut.</p>
  <p style="color: #2A1F1A; font-size: 16px; line-height: 1.7;">Right now we're growing over 26 varieties from seed in the red Oklahoma dirt — celosias, zinnias, gomphrena, marigolds, strawflowers, and more. Each one started from seed, grown without pesticides or synthetic fertilizers.</p>
  <p style="color: #2A1F1A; font-size: 16px; line-height: 1.7;">When something's ready, you'll be the first to know.</p>
  <div style="background: #2A1F1A; padding: 24px; text-align: center; margin: 32px 0; border-radius: 4px;">
    <p style="color: #E8A020; font-size: 12px; letter-spacing: 2px; text-transform: uppercase; margin: 0 0 8px;">While you wait</p>
    <p style="color: #F5F0E8; font-size: 15px; margin: 0 0 16px;">See what's growing right now — 26 varieties with live growth stage updates.</p>
    <a href="https://www.reddirtblooms.ai/whats-in-the-ground" style="background: #B5451B; color: #F5F0E8; padding: 12px 28px; text-decoration: none; font-size: 14px; font-weight: 600; border-radius: 3px; display: inline-block;">See What's Growing →</a>
  </div>
  <p style="color: #2A1F1A; font-size: 15px; line-height: 1.7;">See you at the stand,<br><strong>Lance</strong><br><em style="color: #7A8C6E; font-size: 13px;">Red Dirt Blooms — Norman, Oklahoma</em></p>
  <hr style="border: none; border-top: 1px solid #2A1F1A20; margin: 32px 0;">
  <p style="color: #2A1F1A80; font-size: 12px; text-align: center;">You signed up for Bloom Watch at reddirtblooms.ai. <a href="{{unsubscribe_link}}" style="color: #B5451B;">Unsubscribe</a></p>
</div>
```

---

### Template 2: Bloom Watch Nurture 1 (Day 3)
**Subject:** 120 seeds at a time — here's how we grow

```html
<div style="font-family: Georgia, serif; max-width: 600px; margin: 0 auto; background: #F5F0E8; padding: 40px 32px;">
  <p style="font-family: 'Courier New', monospace; font-size: 11px; letter-spacing: 3px; color: #B5451B; text-transform: uppercase; margin: 0 0 24px;">Red Dirt Blooms — From the Field</p>
  <h2 style="font-size: 26px; color: #2A1F1A; margin: 0 0 20px; font-weight: 700;">Why we start 120 seeds at a time</h2>
  <p style="color: #2A1F1A; font-size: 16px; line-height: 1.7;">Hi {{contact.first_name}},</p>
  <p style="color: #2A1F1A; font-size: 16px; line-height: 1.7;">Here's something most people don't know about small flower farms: variety is everything, and variety requires scale.</p>
  <p style="color: #2A1F1A; font-size: 16px; line-height: 1.7;">We start each variety in batches of approximately 120 seeds. That's the minimum number that gives us enough plants to produce meaningful cuts across the full season, handle germination losses, and still offer you a genuine selection when you order.</p>
  <p style="color: #2A1F1A; font-size: 16px; line-height: 1.7;">With 26+ varieties in the ground, that's thousands of individual plants — all started by hand, transplanted by hand, and harvested by hand. No shortcuts. No greenhouses. Just Oklahoma dirt, Oklahoma sun, and a lot of early mornings.</p>
  <div style="border-left: 3px solid #B5451B; padding-left: 16px; margin: 24px 0;">
    <p style="color: #2A1F1A; font-size: 15px; line-height: 1.7; margin: 0; font-style: italic;">"We grow what we love, and we love what we grow. Every bunch that leaves this farm was started from a single seed."</p>
  </div>
  <a href="https://www.reddirtblooms.ai/whats-in-the-ground" style="background: #B5451B; color: #F5F0E8; padding: 12px 28px; text-decoration: none; font-size: 14px; font-weight: 600; border-radius: 3px; display: inline-block; margin-top: 16px;">See All 26 Varieties →</a>
  <p style="color: #2A1F1A; font-size: 15px; line-height: 1.7; margin-top: 32px;">— Lance<br><em style="color: #7A8C6E; font-size: 13px;">Red Dirt Blooms</em></p>
  <hr style="border: none; border-top: 1px solid #2A1F1A20; margin: 32px 0;">
  <p style="color: #2A1F1A80; font-size: 12px; text-align: center;"><a href="{{unsubscribe_link}}" style="color: #B5451B;">Unsubscribe</a></p>
</div>
```

---

### Template 3: Bloom Watch Nurture 2 (Day 10)
**Subject:** The Harvest Stand is open — here's how it works

```html
<div style="font-family: Georgia, serif; max-width: 600px; margin: 0 auto; background: #F5F0E8; padding: 40px 32px;">
  <p style="font-family: 'Courier New', monospace; font-size: 11px; letter-spacing: 3px; color: #B5451B; text-transform: uppercase; margin: 0 0 24px;">Red Dirt Blooms — How It Works</p>
  <h2 style="font-size: 26px; color: #2A1F1A; margin: 0 0 20px; font-weight: 700;">From red dirt to your door</h2>
  <p style="color: #2A1F1A; font-size: 16px; line-height: 1.7;">Hi {{contact.first_name}},</p>
  <ol style="color: #2A1F1A; font-size: 15px; line-height: 2; padding-left: 20px;">
    <li><strong>Choose your variety and bunch size</strong> — 2, 4, or 6 stems per bunch</li>
    <li><strong>We cut your order fresh on harvest day</strong> — usually within 24–48 hours</li>
    <li><strong>We condition the stems</strong> — overnight in cool water before they leave the farm</li>
    <li><strong>You pick up or we deliver</strong> — OKC metro area</li>
  </ol>
  <p style="color: #2A1F1A; font-size: 16px; line-height: 1.7;">No cold chain. No boxes. No days in transit. Cut-to-door in under 48 hours.</p>
  <div style="background: #2A1F1A; padding: 24px; text-align: center; margin: 32px 0; border-radius: 4px;">
    <a href="https://www.reddirtblooms.ai/harvest-stand" style="background: #B5451B; color: #F5F0E8; padding: 12px 28px; text-decoration: none; font-size: 14px; font-weight: 600; border-radius: 3px; display: inline-block;">Browse the Harvest Stand →</a>
  </div>
  <p style="color: #2A1F1A; font-size: 15px; line-height: 1.7;">— Lance<br><em style="color: #7A8C6E; font-size: 13px;">Red Dirt Blooms</em></p>
  <hr style="border: none; border-top: 1px solid #2A1F1A20; margin: 32px 0;">
  <p style="color: #2A1F1A80; font-size: 12px; text-align: center;"><a href="{{unsubscribe_link}}" style="color: #B5451B;">Unsubscribe</a></p>
</div>
```

---

### Template 4: Order Confirmation
**Subject:** Your Red Dirt Blooms order is confirmed ✓

```html
<div style="font-family: Georgia, serif; max-width: 600px; margin: 0 auto; background: #F5F0E8; padding: 40px 32px;">
  <div style="text-align: center; margin-bottom: 32px;">
    <p style="font-family: 'Courier New', monospace; font-size: 11px; letter-spacing: 3px; color: #B5451B; text-transform: uppercase; margin: 0 0 8px;">Red Dirt Blooms</p>
    <h1 style="font-size: 28px; color: #2A1F1A; margin: 0; font-weight: 700;">Order Confirmed</h1>
  </div>
  <p style="color: #2A1F1A; font-size: 16px; line-height: 1.7;">Hi {{contact.first_name}},</p>
  <p style="color: #2A1F1A; font-size: 16px; line-height: 1.7;">Your order is confirmed and we're getting your flowers ready.</p>
  <div style="background: #2A1F1A10; border-left: 3px solid #7A8C6E; padding: 16px 20px; margin: 20px 0;">
    <p style="color: #2A1F1A; font-size: 14px; line-height: 1.8; margin: 0;">
      ✓ <strong>Order received</strong> — we'll cut your flowers fresh on harvest day<br>
      ✓ <strong>Conditioning</strong> — stems rest overnight in cool water<br>
      ✓ <strong>Pickup/Delivery</strong> — we'll contact you to coordinate timing
    </p>
  </div>
  <p style="color: #2A1F1A; font-size: 16px; line-height: 1.7;">Questions? Reply to this email or reach us at hello@reddirtblooms.ai.</p>
  <p style="color: #2A1F1A; font-size: 15px; line-height: 1.7; margin-top: 32px;">Thank you for supporting a local farm,<br><strong>Lance</strong><br><em style="color: #7A8C6E; font-size: 13px;">Red Dirt Blooms — Norman, Oklahoma</em></p>
  <hr style="border: none; border-top: 1px solid #2A1F1A20; margin: 32px 0;">
  <p style="color: #2A1F1A80; font-size: 12px; text-align: center;"><a href="{{unsubscribe_link}}" style="color: #B5451B;">Unsubscribe</a></p>
</div>
```

---

### Template 5: Order Care Tips (Day 2)
**Subject:** How to make your Red Dirt Blooms last 10+ days

```html
<div style="font-family: Georgia, serif; max-width: 600px; margin: 0 auto; background: #F5F0E8; padding: 40px 32px;">
  <p style="font-family: 'Courier New', monospace; font-size: 11px; letter-spacing: 3px; color: #B5451B; text-transform: uppercase; margin: 0 0 24px;">Red Dirt Blooms — Flower Care</p>
  <h2 style="font-size: 26px; color: #2A1F1A; margin: 0 0 20px; font-weight: 700;">5 steps to 10+ days of blooms</h2>
  <p style="color: #2A1F1A; font-size: 16px; line-height: 1.7;">Hi {{contact.first_name}},</p>
  <ol style="color: #2A1F1A; font-size: 15px; line-height: 2.2; padding-left: 20px;">
    <li><strong>Re-cut stems at a 45° angle</strong> immediately when you get them home</li>
    <li><strong>Use a clean vase</strong> with fresh, room-temperature water</li>
    <li><strong>Change the water every 2 days</strong> and re-cut stems each time</li>
    <li><strong>Keep away from direct sunlight</strong>, heat vents, and ripening fruit</li>
    <li><strong>Remove any leaves</strong> that fall below the waterline</li>
  </ol>
  <p style="color: #2A1F1A; font-size: 16px; line-height: 1.7;">Gomphrena and strawflowers can be air-dried upside down — they'll last indefinitely and hold their color beautifully.</p>
  <p style="color: #2A1F1A; font-size: 15px; line-height: 1.7; margin-top: 32px;">Enjoy every bloom,<br><strong>Lance</strong><br><em style="color: #7A8C6E; font-size: 13px;">Red Dirt Blooms</em></p>
  <hr style="border: none; border-top: 1px solid #2A1F1A20; margin: 32px 0;">
  <p style="color: #2A1F1A80; font-size: 12px; text-align: center;"><a href="{{unsubscribe_link}}" style="color: #B5451B;">Unsubscribe</a></p>
</div>
```

---

### Template 6: Review Request (Day 7)
**Subject:** How were your blooms? (quick question)

```html
<div style="font-family: Georgia, serif; max-width: 600px; margin: 0 auto; background: #F5F0E8; padding: 40px 32px;">
  <h2 style="font-size: 26px; color: #2A1F1A; margin: 0 0 20px; font-weight: 700;">How were your flowers?</h2>
  <p style="color: #2A1F1A; font-size: 16px; line-height: 1.7;">Hi {{contact.first_name}},</p>
  <p style="color: #2A1F1A; font-size: 16px; line-height: 1.7;">It's been about a week since your Red Dirt Blooms order. We'd love to know how your flowers held up.</p>
  <p style="color: #2A1F1A; font-size: 16px; line-height: 1.7;">If you loved them, a quick Google review or Facebook mention means the world to a small farm. If something wasn't right, just reply to this email — we'll make it right.</p>
  <div style="text-align: center; margin: 32px 0;">
    <a href="https://www.reddirtblooms.ai/harvest-stand" style="background: #B5451B; color: #F5F0E8; padding: 12px 28px; text-decoration: none; font-size: 14px; font-weight: 600; border-radius: 3px; display: inline-block;">Order Again →</a>
  </div>
  <p style="color: #2A1F1A; font-size: 15px; line-height: 1.7;">Thank you for supporting local,<br><strong>Lance</strong><br><em style="color: #7A8C6E; font-size: 13px;">Red Dirt Blooms</em></p>
  <hr style="border: none; border-top: 1px solid #2A1F1A20; margin: 32px 0;">
  <p style="color: #2A1F1A80; font-size: 12px; text-align: center;"><a href="{{unsubscribe_link}}" style="color: #B5451B;">Unsubscribe</a></p>
</div>
```

---

### Template 7: Subscription Welcome
**Subject:** Welcome to your Bloom Share — here's what to expect

```html
<div style="font-family: Georgia, serif; max-width: 600px; margin: 0 auto; background: #F5F0E8; padding: 40px 32px;">
  <div style="text-align: center; margin-bottom: 32px;">
    <p style="font-family: 'Courier New', monospace; font-size: 11px; letter-spacing: 3px; color: #B5451B; text-transform: uppercase; margin: 0 0 8px;">Red Dirt Blooms</p>
    <h1 style="font-size: 28px; color: #2A1F1A; margin: 0; font-weight: 700;">Welcome to Your Bloom Share</h1>
  </div>
  <p style="color: #2A1F1A; font-size: 16px; line-height: 1.7;">Hi {{contact.first_name}},</p>
  <p style="color: #2A1F1A; font-size: 16px; line-height: 1.7;">You're officially a Bloom Share member. From June through October, fresh Oklahoma flowers are coming your way.</p>
  <div style="background: #2A1F1A; padding: 24px; margin: 24px 0; border-radius: 4px;">
    <p style="color: #E8A020; font-size: 12px; letter-spacing: 2px; text-transform: uppercase; margin: 0 0 12px;">Your Bloom Share</p>
    <p style="color: #F5F0E8; font-size: 15px; line-height: 1.8; margin: 0;">
      ✓ Farm-cut bouquets, June through October<br>
      ✓ Seasonal variety — no two deliveries the same<br>
      ✓ Organically grown, no pesticides<br>
      ✓ Cut-to-door in under 48 hours<br>
      ✓ We'll contact you before each delivery to coordinate
    </p>
  </div>
  <p style="color: #2A1F1A; font-size: 15px; line-height: 1.7; margin-top: 32px;">So glad you're part of this,<br><strong>Lance</strong><br><em style="color: #7A8C6E; font-size: 13px;">Red Dirt Blooms — Norman, Oklahoma</em></p>
  <hr style="border: none; border-top: 1px solid #2A1F1A20; margin: 32px 0;">
  <p style="color: #2A1F1A80; font-size: 12px; text-align: center;"><a href="{{unsubscribe_link}}" style="color: #B5451B;">Unsubscribe</a></p>
</div>
```

---

### Template 8: Subscription What to Expect (Day 1)
**Subject:** Your first delivery is coming — here's how it works

```html
<div style="font-family: Georgia, serif; max-width: 600px; margin: 0 auto; background: #F5F0E8; padding: 40px 32px;">
  <h2 style="font-size: 26px; color: #2A1F1A; margin: 0 0 20px; font-weight: 700;">Before your first delivery</h2>
  <p style="color: #2A1F1A; font-size: 16px; line-height: 1.7;">Hi {{contact.first_name}},</p>
  <p style="color: #2A1F1A; font-size: 15px; line-height: 2; padding-left: 16px; border-left: 3px solid #7A8C6E;">
    <strong>Timing:</strong> We'll email you 24–48 hours before each delivery to confirm your window.<br>
    <strong>Pickup vs. Delivery:</strong> We'll confirm your preference before the first delivery.<br>
    <strong>Variety:</strong> Each bouquet is different — we cut what's at peak that week.<br>
    <strong>Weather:</strong> Oklahoma weather can shift harvest timing. We'll always communicate changes.
  </p>
  <p style="color: #2A1F1A; font-size: 16px; line-height: 1.7;">Have a vase ready. Your first bouquet is going to be worth it.</p>
  <a href="https://www.reddirtblooms.ai/whats-in-the-ground" style="background: #B5451B; color: #F5F0E8; padding: 12px 28px; text-decoration: none; font-size: 14px; font-weight: 600; border-radius: 3px; display: inline-block; margin-top: 16px;">See What's Growing Now →</a>
  <p style="color: #2A1F1A; font-size: 15px; line-height: 1.7; margin-top: 32px;">— Lance<br><em style="color: #7A8C6E; font-size: 13px;">Red Dirt Blooms</em></p>
  <hr style="border: none; border-top: 1px solid #2A1F1A20; margin: 32px 0;">
  <p style="color: #2A1F1A80; font-size: 12px; text-align: center;"><a href="{{unsubscribe_link}}" style="color: #B5451B;">Unsubscribe</a></p>
</div>
```

---

### Template 9: Payment Failed
**Subject:** Action needed — your Red Dirt Blooms payment didn't go through

```html
<div style="font-family: Georgia, serif; max-width: 600px; margin: 0 auto; background: #F5F0E8; padding: 40px 32px;">
  <div style="background: #B5451B15; border: 1px solid #B5451B40; padding: 16px 20px; border-radius: 4px; margin-bottom: 28px;">
    <p style="color: #B5451B; font-size: 14px; font-weight: 600; margin: 0;">⚠ Payment not processed</p>
  </div>
  <p style="color: #2A1F1A; font-size: 16px; line-height: 1.7;">Hi {{contact.first_name}},</p>
  <p style="color: #2A1F1A; font-size: 16px; line-height: 1.7;">We weren't able to process your recent payment for Red Dirt Blooms. This can happen when a card expires, has insufficient funds, or the billing information doesn't match.</p>
  <div style="text-align: center; margin: 32px 0;">
    <a href="https://www.reddirtblooms.ai/harvest-stand" style="background: #B5451B; color: #F5F0E8; padding: 12px 28px; text-decoration: none; font-size: 14px; font-weight: 600; border-radius: 3px; display: inline-block;">Update Payment Method →</a>
  </div>
  <p style="color: #2A1F1A; font-size: 15px; line-height: 1.7; margin-top: 32px;">— Lance<br><em style="color: #7A8C6E; font-size: 13px;">Red Dirt Blooms</em></p>
  <hr style="border: none; border-top: 1px solid #2A1F1A20; margin: 32px 0;">
  <p style="color: #2A1F1A80; font-size: 12px; text-align: center;"><a href="{{unsubscribe_link}}" style="color: #B5451B;">Unsubscribe</a></p>
</div>
```

---

### Template 10: Florist Application Received
**Subject:** We got your application — Red Dirt Blooms Wholesale

```html
<div style="font-family: Georgia, serif; max-width: 600px; margin: 0 auto; background: #0D0805; padding: 40px 32px;">
  <div style="text-align: center; margin-bottom: 32px;">
    <p style="font-family: 'Courier New', monospace; font-size: 11px; letter-spacing: 3px; color: #D4A853; text-transform: uppercase; margin: 0 0 8px;">Red Dirt Blooms — Wholesale</p>
    <h1 style="font-size: 26px; color: #F5F0E8; margin: 0; font-weight: 700;">Application Received</h1>
  </div>
  <p style="color: #F5F0E8; font-size: 16px; line-height: 1.7;">Hi {{contact.first_name}},</p>
  <p style="color: #C8C0B0; font-size: 16px; line-height: 1.7;">Thank you for applying to the Red Dirt Blooms Florist Portal. We've received your application and will review it within 24–48 hours.</p>
  <div style="background: #1A1208; border: 1px solid #2A1F10; padding: 20px; border-radius: 4px; margin: 24px 0;">
    <p style="color: #D4A853; font-size: 12px; letter-spacing: 2px; text-transform: uppercase; margin: 0 0 8px;">What we offer florists</p>
    <p style="color: #C8C0B0; font-size: 14px; line-height: 1.8; margin: 0;">
      ✓ Farm-direct pricing on 10-stem bunches<br>
      ✓ Weekly availability list — first come, first served<br>
      ✓ Organically grown, no pesticides<br>
      ✓ OKC metro pickup and delivery
    </p>
  </div>
  <p style="color: #C8C0B0; font-size: 15px; line-height: 1.7; margin-top: 32px;">We'll be in touch soon,<br><strong style="color: #F5F0E8;">Lance</strong><br><em style="color: #7A8C6E; font-size: 13px;">Red Dirt Blooms</em></p>
  <hr style="border: none; border-top: 1px solid #F5F0E810; margin: 32px 0;">
  <p style="color: #F5F0E840; font-size: 12px; text-align: center;"><a href="{{unsubscribe_link}}" style="color: #B5451B;">Unsubscribe</a></p>
</div>
```

---

### Template 11: Florist Approved
**Subject:** You're approved — welcome to the Red Dirt Blooms Florist Portal

```html
<div style="font-family: Georgia, serif; max-width: 600px; margin: 0 auto; background: #0D0805; padding: 40px 32px;">
  <div style="text-align: center; margin-bottom: 32px;">
    <p style="font-family: 'Courier New', monospace; font-size: 11px; letter-spacing: 3px; color: #D4A853; text-transform: uppercase; margin: 0 0 8px;">Red Dirt Blooms — Wholesale</p>
    <h1 style="font-size: 26px; color: #F5F0E8; margin: 0; font-weight: 700;">You're Approved ✓</h1>
  </div>
  <p style="color: #F5F0E8; font-size: 16px; line-height: 1.7;">Hi {{contact.first_name}},</p>
  <p style="color: #C8C0B0; font-size: 16px; line-height: 1.7;">Your application to the Red Dirt Blooms Florist Portal has been approved. You now have access to our wholesale harvest board.</p>
  <div style="background: #B5451B; padding: 24px; text-align: center; margin: 28px 0; border-radius: 4px;">
    <p style="color: #F5F0E8; font-size: 15px; margin: 0 0 16px;">Log in with the email and password you created during registration.</p>
    <a href="https://www.reddirtblooms.ai/florist-login" style="background: #F5F0E8; color: #B5451B; padding: 12px 28px; text-decoration: none; font-size: 14px; font-weight: 700; border-radius: 3px; display: inline-block;">Log In to the Florist Portal →</a>
  </div>
  <p style="color: #C8C0B0; font-size: 15px; line-height: 1.7; margin-top: 32px;">Welcome to the farm,<br><strong style="color: #F5F0E8;">Lance</strong><br><em style="color: #7A8C6E; font-size: 13px;">Red Dirt Blooms</em></p>
  <hr style="border: none; border-top: 1px solid #F5F0E810; margin: 32px 0;">
  <p style="color: #F5F0E840; font-size: 12px; text-align: center;"><a href="{{unsubscribe_link}}" style="color: #B5451B;">Unsubscribe</a></p>
</div>
```

---

### Template 12: Florist Portal Guide (Day 1 after approval)
**Subject:** How to use the Florist Portal — quick guide

```html
<div style="font-family: Georgia, serif; max-width: 600px; margin: 0 auto; background: #0D0805; padding: 40px 32px;">
  <h2 style="font-size: 24px; color: #F5F0E8; margin: 0 0 20px; font-weight: 700;">Your quick-start guide to the portal</h2>
  <p style="color: #C8C0B0; font-size: 16px; line-height: 1.7;">Hi {{contact.first_name}},</p>
  <ol style="color: #C8C0B0; font-size: 15px; line-height: 2.2; padding-left: 20px;">
    <li><strong style="color: #F5F0E8;">Log in at</strong> reddirtblooms.ai/florist-login</li>
    <li><strong style="color: #F5F0E8;">Check the Harvest Board</strong> — updated each harvest day</li>
    <li><strong style="color: #F5F0E8;">Place your order</strong> — select varieties and quantities, checkout via Stripe</li>
    <li><strong style="color: #F5F0E8;">Track your orders</strong> — view order history and status in your dashboard</li>
    <li><strong style="color: #F5F0E8;">Browse the Portfolio</strong> — see our full variety catalog</li>
  </ol>
  <p style="color: #C8C0B0; font-size: 16px; line-height: 1.7;">Orders are first-come, first-served. When something's available, move fast.</p>
  <a href="https://www.reddirtblooms.ai/florist-portal" style="background: #B5451B; color: #F5F0E8; padding: 12px 28px; text-decoration: none; font-size: 14px; font-weight: 600; border-radius: 3px; display: inline-block; margin-top: 16px;">Go to Harvest Board →</a>
  <p style="color: #C8C0B0; font-size: 15px; line-height: 1.7; margin-top: 32px;">— Lance<br><em style="color: #7A8C6E; font-size: 13px;">Red Dirt Blooms</em></p>
  <hr style="border: none; border-top: 1px solid #F5F0E810; margin: 32px 0;">
  <p style="color: #F5F0E840; font-size: 12px; text-align: center;"><a href="{{unsubscribe_link}}" style="color: #B5451B;">Unsubscribe</a></p>
</div>
```

---

### Template 13: Florist Application Declined
**Subject:** Red Dirt Blooms — Application Update

```html
<div style="font-family: Georgia, serif; max-width: 600px; margin: 0 auto; background: #0D0805; padding: 40px 32px;">
  <p style="color: #C8C0B0; font-size: 16px; line-height: 1.7;">Hi {{contact.first_name}},</p>
  <p style="color: #C8C0B0; font-size: 16px; line-height: 1.7;">Thank you for your interest in the Red Dirt Blooms Florist Portal. After reviewing your application, we're not able to approve your account at this time.</p>
  <p style="color: #C8C0B0; font-size: 16px; line-height: 1.7;">This is often due to capacity limits or geographic constraints in our current season. If you'd like to discuss your application or try again next season, please reach out at hello@reddirtblooms.ai.</p>
  <p style="color: #C8C0B0; font-size: 16px; line-height: 1.7;">You're welcome to continue shopping through our public Harvest Stand at reddirtblooms.ai/harvest-stand.</p>
  <p style="color: #C8C0B0; font-size: 15px; line-height: 1.7; margin-top: 32px;">Thank you for understanding,<br><strong style="color: #F5F0E8;">Lance</strong><br><em style="color: #7A8C6E; font-size: 13px;">Red Dirt Blooms</em></p>
  <hr style="border: none; border-top: 1px solid #F5F0E810; margin: 32px 0;">
  <p style="color: #F5F0E840; font-size: 12px; text-align: center;"><a href="{{unsubscribe_link}}" style="color: #B5451B;">Unsubscribe</a></p>
</div>
```

---

### Template 14: Harvest Blast (New Availability)
**Subject:** 🌸 New varieties just hit the board — order before they're gone

```html
<div style="font-family: Georgia, serif; max-width: 600px; margin: 0 auto; background: #0D0805; padding: 40px 32px;">
  <div style="text-align: center; margin-bottom: 32px;">
    <p style="font-family: 'Courier New', monospace; font-size: 11px; letter-spacing: 3px; color: #D4A853; text-transform: uppercase; margin: 0 0 8px;">Red Dirt Blooms — Harvest Update</p>
    <h1 style="font-size: 28px; color: #F5F0E8; margin: 0; font-weight: 700;">Fresh Cut. Available Now.</h1>
  </div>
  <p style="color: #C8C0B0; font-size: 16px; line-height: 1.7;">New varieties are live on the Harvest Board. These are first-come, first-served — when they're gone, they're gone until next week's cut.</p>
  <div style="background: #B5451B; padding: 24px; text-align: center; margin: 28px 0; border-radius: 4px;">
    <a href="https://www.reddirtblooms.ai/florist-portal" style="background: #F5F0E8; color: #B5451B; padding: 12px 28px; text-decoration: none; font-size: 14px; font-weight: 700; border-radius: 3px; display: inline-block;">View Harvest Board →</a>
  </div>
  <p style="color: #C8C0B0; font-size: 15px; line-height: 1.7; margin-top: 32px;">Cut fresh this morning,<br><strong style="color: #F5F0E8;">Lance</strong><br><em style="color: #7A8C6E; font-size: 13px;">Red Dirt Blooms</em></p>
  <hr style="border: none; border-top: 1px solid #F5F0E810; margin: 32px 0;">
  <p style="color: #F5F0E840; font-size: 12px; text-align: center;"><a href="{{unsubscribe_link}}" style="color: #B5451B;">Unsubscribe</a></p>
</div>
```

---

### Template 15: Bouquet Bar Inquiry Received
**Subject:** Got your Bouquet Bar request — we'll be in touch soon

```html
<div style="font-family: Georgia, serif; max-width: 600px; margin: 0 auto; background: #F5F0E8; padding: 40px 32px;">
  <p style="font-family: 'Courier New', monospace; font-size: 11px; letter-spacing: 3px; color: #B5451B; text-transform: uppercase; margin: 0 0 24px;">Red Dirt Blooms — Bouquet Bar</p>
  <h2 style="font-size: 26px; color: #2A1F1A; margin: 0 0 20px; font-weight: 700;">We got your request ✓</h2>
  <p style="color: #2A1F1A; font-size: 16px; line-height: 1.7;">Hi {{contact.first_name}},</p>
  <p style="color: #2A1F1A; font-size: 16px; line-height: 1.7;">Thank you for reaching out about your special event. We've received your Bouquet Bar inquiry and will get back to you within 24 hours to discuss details, availability, and pricing.</p>
  <a href="https://www.reddirtblooms.ai/florist-portfolio" style="background: #B5451B; color: #F5F0E8; padding: 12px 28px; text-decoration: none; font-size: 14px; font-weight: 600; border-radius: 3px; display: inline-block; margin-top: 8px;">Browse the Portfolio →</a>
  <p style="color: #2A1F1A; font-size: 15px; line-height: 1.7; margin-top: 32px;">Talk soon,<br><strong>Lance</strong><br><em style="color: #7A8C6E; font-size: 13px;">Red Dirt Blooms — Norman, Oklahoma</em></p>
  <hr style="border: none; border-top: 1px solid #2A1F1A20; margin: 32px 0;">
  <p style="color: #2A1F1A80; font-size: 12px; text-align: center;"><a href="{{unsubscribe_link}}" style="color: #B5451B;">Unsubscribe</a></p>
</div>
```

---

### Template 16: Re-engagement
**Subject:** Still want to hear from us?

```html
<div style="font-family: Georgia, serif; max-width: 600px; margin: 0 auto; background: #F5F0E8; padding: 40px 32px;">
  <h2 style="font-size: 26px; color: #2A1F1A; margin: 0 0 20px; font-weight: 700;">Still want to hear from us?</h2>
  <p style="color: #2A1F1A; font-size: 16px; line-height: 1.7;">Hi {{contact.first_name}},</p>
  <p style="color: #2A1F1A; font-size: 16px; line-height: 1.7;">It's been a while since we've heard from you. We want to make sure our emails are still useful — if you'd like to keep getting Bloom Watch updates, no action needed.</p>
  <p style="color: #2A1F1A; font-size: 16px; line-height: 1.7;">If you'd rather not hear from us, that's okay too. Just click unsubscribe below.</p>
  <div style="text-align: center; margin: 32px 0;">
    <a href="https://www.reddirtblooms.ai/harvest-stand" style="background: #B5451B; color: #F5F0E8; padding: 12px 28px; text-decoration: none; font-size: 14px; font-weight: 600; border-radius: 3px; display: inline-block;">Yes, Keep Me Updated →</a>
  </div>
  <p style="color: #2A1F1A; font-size: 15px; line-height: 1.7;">— Lance<br><em style="color: #7A8C6E; font-size: 13px;">Red Dirt Blooms</em></p>
  <hr style="border: none; border-top: 1px solid #2A1F1A20; margin: 32px 0;">
  <p style="color: #2A1F1A80; font-size: 12px; text-align: center;"><a href="{{unsubscribe_link}}" style="color: #B5451B;">Unsubscribe</a></p>
</div>
```

---

## Part 3: GHL Tag Reference

| Tag | Applied By | Triggers Workflow |
|---|---|---|
| `bloom-watch-subscriber` | Bloom Watch form (website) | Bloom Watch Welcome Series |
| `rdb-order-placed` | Stripe webhook (checkout.session.completed) | Order Confirmation |
| `rdb-subscription-active` | Stripe webhook (subscription product) | Subscription Welcome |
| `rdb-payment-failed` | Stripe webhook (payment_intent.payment_failed) | Payment Failed Recovery |
| `florist-applicant` | GHL form submission | Florist Application Received |
| `florist-approved` | Admin approves in /admin dashboard | Florist Approval & Onboarding |
| `florist-declined` | Admin declines in /admin dashboard | Florist Declined |
| `rdb-harvest-blast` | Admin applies manually to florist-approved contacts | Harvest Blast |
| `bouquet-bar-inquiry` | Bouquet Bar form submission | Bouquet Bar Follow-Up |
| `bloom-watch-inactive` | Manual / automation filter (60+ days no open) | Re-engagement |

---

## Part 4: Custom Fields to Create in GHL

Go to **Settings → Custom Fields → + Add Field**:

| Field Name | Field Key | Type |
|---|---|---|
| Business Name | `business_name` | Text |
| Event Type | `event_type` | Text |
| Event Date | `event_date` | Date |
| Order Items | `order_items` | Text Area |
| Order Total | `order_total` | Text |
| Subscription Type | `subscription_type` | Text |
| Florist Website | `florist_website` | URL |

---

*Document generated by Manus for Red Dirt Blooms — reddirtblooms.ai*
