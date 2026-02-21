# Monthly Mortgage Statement Generator

## Overview
Automate the generation and delivery of monthly mortgage statements for PIM Income Fund / PIM Rapid Lending borrowers. Currently servicing 6 loans, managed manually via individual Excel files.

## Current Manual Process (What We're Replacing)
1. Open each borrower's Excel file (6 total)
2. Check if last month's payment was received
3. If paid: add a new row with payment date, amount, and balance ($0 if current)
4. Update statement date (e.g., 1/15 → 2/15)
5. Update payment due date (e.g., 2/1 → 3/1)
6. Update Reserve Balance if payment came from interest reserve
7. Static fields carry forward: Loan Number, Principal Balance, Interest Rate, Maturity Date, Payment Amount, Property Address, Borrower Name, Borrower Address
8. Manually generate PDF statement
9. Manually email to borrower

## Requirements

### Phase 1: Core Statement Engine
- [ ] **Data model** for loans with all required fields:
  - Loan Number
  - Borrower Name & Address
  - Borrower Email
  - Property Address
  - Principal Balance
  - Interest Rate
  - Maturity Date
  - Monthly Payment Amount
  - Reserve Balance (for interest reserve loans)
  - Statement Date
  - Payment Due Date
- [ ] **Payment history tracking**: date received, amount, running balance
- [ ] **Import existing data** from Lance's 6 Excel files (one-time migration)
- [ ] **Web dashboard** to view all loans, payment status, and history

### Phase 2: PDF Statement Generation
- [ ] Generate professional PDF mortgage statements matching current format
- [ ] Statement should include:
  - Borrower info & property address
  - Loan terms (number, rate, maturity, principal balance)
  - Current payment due (amount + due date)
  - Payment history table (last 12 months or all payments)
  - Reserve balance (if applicable)
  - PIM Income Fund branding/contact info
- [ ] Preview statement in browser before sending

### Phase 3: Automated Email Delivery
- [ ] Draft email with PDF attached to each borrower
- [ ] Review/approve before sending (don't auto-send yet — Lance reviews first)
- [ ] Track sent status per borrower per month
- [ ] **Monthly trigger**: on the 20th of each month, generate all statements and queue for review

### Phase 4: Monthly Workflow
- [ ] On the 20th: system generates statements for all active loans
- [ ] Dashboard shows: ✅ paid / ❌ unpaid / ⏳ pending for each borrower
- [ ] Lance (or Fred) marks payments received, system updates balances
- [ ] One-click "generate & send all" after review

## Technical Recommendations

### Stack (suggested)
- **Frontend**: Next.js (React) — good for dashboard + future borrower portal
- **Backend**: Next.js API routes or separate Express server
- **Database**: SQLite (via Prisma or Drizzle) — simple, no separate DB server needed. Can migrate to Postgres later.
- **PDF Generation**: `@react-pdf/renderer` or `puppeteer` (HTML → PDF)
- **Email**: Nodemailer via SMTP (Lance's Microsoft 365 account) or Resend
- **Hosting**: Mac Mini (Will's machine) for dev, can deploy to Vercel/Railway later

### Data Migration
Lance will provide 6 Excel files. The app should have a one-time import script that reads them and populates the database.

### Future Vision (Don't Build Yet — Just Design For It)
This is Module 1 of a larger PIM lending platform:
- **Module 2**: Borrower portal — prospective borrowers log in, submit loan applications
- **Module 3**: Automated underwriting — initial loan screening/scoring
- **Module 4**: Conditional Loan Approval generation and delivery
- Design the data model with this future in mind (separate borrower accounts, loan applications table, etc.)

## Acceptance Criteria
1. Can view all 6 loans and their payment history in a web dashboard
2. Can record a payment (date, amount, source: direct pay vs. reserve)
3. System auto-updates balances and next due dates
4. Generates a clean, professional PDF statement
5. Can email statement to borrower with one click
6. Monthly reminder/trigger on the 20th

## Getting Started
1. Clone this repo
2. Set up the Next.js project
3. Define the data model (loans, payments, borrowers)
4. Import the Excel files Lance provides
5. Build the dashboard view first, then layer in PDF + email

## Resources
- Excel files: Lance will drop in the repo or shared folder
- PIM branding/logo: TBD (ask Lance)
- Email sending: coordinate with Fred for SMTP credentials
