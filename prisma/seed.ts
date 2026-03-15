import { PrismaClient } from '@prisma/client';
import path from 'path';
import fs from 'fs';
import * as xlsx from 'xlsx';
import { calculateTotalAmountDue } from '../lib/payments';

const prisma = new PrismaClient();
const BORROWER_ADDRESS = '14660 Falls of Neuse Rd, Ste 149-119\nRaleigh, NC 27614';

const dedupePreference = ['2nd Lien', '1st Lien'];

const loanOverrides: Record<string, { paidToDate: string; dueDate: string | null; status?: string; totalAmountDue?: number; lienPosition?: string | null }> = {
  '20250327001': { paidToDate: '2026-02-01', dueDate: '2026-03-01' },
  '20250401001': { paidToDate: '2026-02-01', dueDate: '2026-03-01' },
  '20250401002': { paidToDate: '2026-02-01', dueDate: '2026-03-01' },
  '20250401003': { paidToDate: '2026-02-01', dueDate: '2026-03-01' },
  '20251203001': { paidToDate: '2026-02-01', dueDate: '2026-03-01' },
  '20260128001': { paidToDate: '2026-01-28', dueDate: '2026-02-01', lienPosition: '1st' },
  '20251219001': { paidToDate: '2026-01-28', dueDate: null, status: 'PAID_OFF', lienPosition: '2nd', totalAmountDue: 0 },
};

const parseFloatValue = (value: unknown) => {
  if (value instanceof Date) return Number(value);
  if (typeof value === 'number') return value;
  if (typeof value === 'string') return Number(value.replace(/[$,% ,]/g, ''));
  return 0;
};

const parseDateValue = (value: unknown) => {
  if (value instanceof Date) return value;
  if (typeof value === 'number') {
    const parsed = xlsx.SSF.parse_date_code(value);
    if (parsed) return new Date(Date.UTC(parsed.y, parsed.m - 1, parsed.d));
  }
  return new Date(String(value));
};

const cityStateZip = (raw: string) => {
  const match = raw.match(/^(.*?),\s*([A-Z]{2})\s+(\d{5}(?:-\d{4})?)$/);
  if (!match) return { city: raw, st: '', zip: '' };
  return { city: match[1].trim(), st: match[2], zip: match[3] };
};

async function main() {
  const dataDir = path.join(process.cwd(), 'data', 'excel-originals');
  const files = fs.readdirSync(dataDir)
    .filter((file) => file.includes('20260215') && file.endsWith('.xlsx'))
    .sort();

  const selected = new Map<string, { file: string; rank: number }>();

  for (const file of files) {
    const fullPath = path.join(dataDir, file);
    const workbook = xlsx.readFile(fullPath, { cellDates: true });
    const sheet = workbook.Sheets['Sheet2'];
    const loanNumber = String(sheet['E9']?.v ?? '').trim();
    const lowerFile = file.toLowerCase();
    const rank = dedupePreference.findIndex((tag) => lowerFile.includes(tag.toLowerCase()));
    const current = selected.get(loanNumber);
    if (!current || (rank !== -1 && (current.rank === -1 || rank < current.rank))) {
      selected.set(loanNumber, { file, rank });
    }
  }

  await prisma.payment.deleteMany();
  await prisma.statement.deleteMany();
  await prisma.loan.deleteMany();

  for (const { file } of selected.values()) {
    const fullPath = path.join(dataDir, file);
    const workbook = xlsx.readFile(fullPath, { cellDates: true });
    const sheet = workbook.Sheets['Sheet2'];

    const borrowerName = String(sheet['C9']?.v ?? '').trim();
    const loanNumber = String(sheet['E9']?.v ?? '').trim();
    const principalBalance = parseFloatValue(sheet['E10']?.v);
    const interestRate = parseFloatValue(sheet['E11']?.v);
    const reserveBalance = parseFloatValue(sheet['E12']?.v);
    const propertyStreet = String(sheet['C13']?.v ?? '').trim();
    const propertyCityStateZip = String(sheet['C14']?.v ?? '').trim();
    const maturityDate = parseDateValue(sheet['E13']?.v);
    const monthlyPayment = parseFloatValue(sheet['E14']?.v);
    const amountDueFromSheet = parseFloatValue(sheet['E15']?.v);
    const sheetDueDate = sheet['E16']?.v ? parseDateValue(sheet['E16']?.v) : null;
    const statementDateText = String(sheet['B7']?.v ?? '');
    const statementDateMatch = statementDateText.match(/(\d{1,2}\/\d{1,2}\/\d{4})/);
    const statementDate = statementDateMatch ? new Date(statementDateMatch[1]) : sheetDueDate ?? new Date();
    const { city, st, zip } = cityStateZip(propertyCityStateZip);
    const fileLienPosition = file.includes('1st Lien') ? '1st' : file.includes('2nd Lien') ? '2nd' : null;
    const override = loanOverrides[loanNumber];
    const paidToDate = override ? new Date(`${override.paidToDate}T00:00:00.000Z`) : sheetDueDate ?? statementDate;
    const dueDate = override ? (override.dueDate ? new Date(`${override.dueDate}T00:00:00.000Z`) : null) : sheetDueDate;
    const status = override?.status ?? 'CURRENT';

    const payments = [];
    for (let row = 21; row <= 200; row++) {
      const dateCell = sheet[`B${row}`]?.v;
      const description = String(sheet[`C${row}`]?.v ?? '').trim();
      const amountCell = sheet[`D${row}`]?.v;
      const balanceCell = sheet[`E${row}`]?.v;

      if (!dateCell && !description && !amountCell && !balanceCell) continue;
      if (!dateCell && !description && typeof amountCell === 'number') break;
      if (!dateCell || !description || typeof amountCell !== 'number') continue;

      payments.push({
        paymentDate: parseDateValue(dateCell),
        description,
        amount: parseFloatValue(amountCell),
        balance: parseFloatValue(balanceCell),
        source: /pre-paid/i.test(description)
          ? 'PREPAID'
          : /reserve/i.test(description)
            ? 'INTEREST_RESERVE'
            : /closing/i.test(description)
              ? 'CLOSING_PAYMENT'
              : 'DIRECT_PAY',
      });
    }

    const computedAmountDue = calculateTotalAmountDue({
      principalBalance,
      interestRate,
      monthlyPayment,
      paidToDate,
      statementDate,
      status,
    });
    const totalAmountDue = override?.totalAmountDue ?? computedAmountDue ?? amountDueFromSheet;

    await prisma.loan.create({
      data: {
        loanNumber,
        borrowerName,
        borrowerAddress: BORROWER_ADDRESS,
        propertyStreet,
        propertyCity: city,
        propertySt: st,
        propertyZip: zip,
        principalBalance,
        interestRate,
        maturityDate,
        monthlyPayment,
        reserveBalance,
        lienPosition: override?.lienPosition ?? fileLienPosition,
        status,
        paidToDate,
        dueDate,
        totalAmountDue,
        payments: { create: payments },
        statements: {
          create: {
            statementDate,
            dueDate,
            amountDue: totalAmountDue,
          },
        },
      },
    });
  }

  console.log(`Seeded ${selected.size} loans`);
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
