# PIM Mortgage Statement Generator

Next.js 14 loan servicing dashboard for PIM Income Fund / PIM Rapid Lending.

## Features
- Dashboard with active loan summary metrics
- Loan detail pages with payment history and manual payment entry
- Statement generation workflow with PDF output
- Prisma + SQLite data layer
- Excel seed importer for the 20260215 source files

## Quick start
```bash
npm install
npx prisma generate
npx prisma db push
npm run seed
npm run dev
```

Open http://localhost:3000

## Data source
The seed script reads `data/excel-originals/*20260215.xlsx`, parses `Sheet2`, and deduplicates the WATOW 2nd lien file in favor of the explicit `2nd Lien` workbook.
