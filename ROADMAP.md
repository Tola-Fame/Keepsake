# Roadmap

## Paused: free and paid versions

Paused because charging money adds running costs. Figures below are from third-party pricing summaries (November 2026); confirm on each company's pricing page before starting.

| Cost | Why it's needed | Price |
|---|---|---|
| Vercel Pro plan | Vercel's free Hobby plan is for personal, non-commercial use only. A site that takes payments needs Pro. | About $20 per team member per month, plus usage above the included amounts |
| Stripe (card payments) | Takes card payments and subscriptions. No monthly fee. | About 2.9% + $0.30 per successful US card payment; extra for international cards and currency conversion |

### Planned rules

- **Free version:** each account can download up to **2 albums**, each with up to **10 pages**.
- **Paid version:** no download limits. Price and billing period (one-time or monthly) to be decided.

### Notes for when this is built

- Limits can only be enforced reliably for signed-in users. Albums made without an account live in the visitor's browser, which they can clear at any time. Downloading would need to require sign-in.
- PDFs and images are created in the visitor's browser. To enforce limits strictly, the server must record each download and approve it before the file is made. The record would go in a new `download` table: user, album, page count, date.
- Payments: Stripe Checkout for purchase, a Stripe webhook to mark the account as paid, and a `plan` column on the user.
