import fs from 'fs/promises';
import path from 'path';
import { prisma } from '@/lib/prisma';
import { Document, Image, Page, Text, View, StyleSheet, pdf } from '@react-pdf/renderer';
import { format } from 'date-fns';
import { calculateTotalAmountDue, recalculateLoanAmounts, recalculatePaymentBalances } from '@/lib/payments';
import { addMonthsUtc, formatCurrency, formatPercent } from '@/lib/utils';

const LENDER_ADDRESS = ['PIM Income Fund LLC', '1750 SW Skyline Blvd, Ste 25', 'Portland, OR 97221'];
const LOGO_PATH = path.join(process.cwd(), 'public', 'pim-logo.png');

const styles = StyleSheet.create({
  page: { padding: 32, fontSize: 11, color: '#0f172a' },
  header: { marginBottom: 20 },
  logo: { width: 170, height: 50, objectFit: 'contain', marginBottom: 12 },
  title: { fontSize: 18, fontWeight: 700, marginBottom: 4 },
  subtitle: { fontSize: 12, marginBottom: 2 },
  sectionRow: { flexDirection: 'row', gap: 20, marginBottom: 18 },
  box: { flex: 1 },
  label: { fontSize: 9, textTransform: 'uppercase', color: '#475569', marginBottom: 4 },
  value: { marginBottom: 6 },
  grid: { flexDirection: 'row', flexWrap: 'wrap', rowGap: 8, columnGap: 12 },
  stat: { width: '48%' },
  tableHeader: { flexDirection: 'row', borderBottomWidth: 1, borderBottomColor: '#cbd5e1', paddingBottom: 6, marginBottom: 6, fontWeight: 700 },
  tableRow: { flexDirection: 'row', paddingVertical: 5, borderBottomWidth: 1, borderBottomColor: '#e2e8f0' },
  colDate: { width: '22%' },
  colDesc: { width: '50%', paddingRight: 8 },
  colAmount: { width: '28%', textAlign: 'right' },
});

function StatementDocument({ loan, statement }: any) {
  return (
    <Document>
      <Page size="LETTER" style={styles.page}>
        <View style={styles.header}>
          <Image src={LOGO_PATH} style={styles.logo} />
          <Text style={styles.title}>PIM Income Fund LLC</Text>
          {LENDER_ADDRESS.slice(1).map((line) => <Text key={line} style={styles.subtitle}>{line}</Text>)}
          <Text style={{ marginTop: 12, fontSize: 15, fontWeight: 700 }}>
            Mortgage Statement - {format(statement.statementDate, 'M/d/yyyy')}
          </Text>
        </View>

        <View style={styles.sectionRow}>
          <View style={styles.box}>
            <Text style={styles.label}>Borrower</Text>
            <Text style={styles.value}>{loan.borrowerName}</Text>
            {loan.borrowerAddress.split('\n').map((line: string) => <Text key={line}>{line}</Text>)}
            <Text style={[styles.label, { marginTop: 12 }]}>Property Address</Text>
            <Text>{loan.propertyStreet}</Text>
            <Text>{loan.propertyCity}, {loan.propertySt} {loan.propertyZip}</Text>
          </View>
          <View style={styles.box}>
            <Text style={styles.label}>Loan Details</Text>
            <View style={styles.grid}>
              {[
                ['Loan Number', loan.loanNumber],
                ['Principal Balance', formatCurrency(loan.principalBalance)],
                ['Interest Rate', formatPercent(loan.interestRate)],
                ['Reserve Balance', formatCurrency(loan.reserveBalance)],
                ['Maturity Date', format(loan.maturityDate, 'M/d/yyyy')],
                ['Payment Amount', formatCurrency(loan.monthlyPayment)],
                ['Total Amount Due', formatCurrency(statement.amountDue)],
                ['Due Date', statement.dueDate ? format(statement.dueDate, 'M/d/yyyy') : 'N/A'],
                ['Paid To Date', format(loan.paidToDate, 'M/d/yyyy')],
              ].map(([label, value]) => (
                <View key={label} style={styles.stat}>
                  <Text style={styles.label}>{label}</Text>
                  <Text>{value}</Text>
                </View>
              ))}
            </View>
          </View>
        </View>

        <Text style={[styles.label, { marginBottom: 10 }]}>Payment Activity</Text>
        <View style={styles.tableHeader}>
          <Text style={styles.colDate}>Date</Text>
          <Text style={styles.colDesc}>Description</Text>
          <Text style={styles.colAmount}>Amount</Text>
        </View>
        {loan.payments.map((payment: any) => (
          <View style={styles.tableRow} key={payment.id}>
            <Text style={styles.colDate}>{format(payment.paymentDate, 'M/d/yyyy')}</Text>
            <Text style={styles.colDesc}>{payment.description}</Text>
            <Text style={styles.colAmount}>{formatCurrency(payment.amount)}</Text>
          </View>
        ))}
      </Page>
    </Document>
  );
}

async function getLoanWithCalculatedPayments(loanId: number) {
  await recalculatePaymentBalances(loanId);
  await recalculateLoanAmounts(loanId);

  const loan = await prisma.loan.findUnique({
    where: { id: loanId },
    include: {
      payments: { orderBy: [{ paymentDate: 'desc' }, { createdAt: 'desc' }, { id: 'desc' }] },
      statements: { orderBy: { createdAt: 'desc' } },
    },
  });

  if (!loan) throw new Error('Loan not found');
  return loan;
}

async function toNodeBuffer(value: Buffer | Uint8Array | ReadableStream | NodeJS.ReadableStream) {
  if (Buffer.isBuffer(value)) return value;
  if (value instanceof Uint8Array) return Buffer.from(value);

  if ('getReader' in value) {
    const reader = value.getReader();
    const chunks: Uint8Array[] = [];

    while (true) {
      const { done, value: chunk } = await reader.read();
      if (done) break;
      if (chunk) chunks.push(chunk);
    }

    return Buffer.concat(chunks.map((chunk) => Buffer.from(chunk)));
  }

  const chunks: Buffer[] = [];

  for await (const chunk of value) {
    chunks.push(Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk));
  }

  return Buffer.concat(chunks);
}

export async function renderStatementPdfBuffer(statementId: number) {
  const statement = await prisma.statement.findUnique({
    where: { id: statementId },
    include: { loan: true },
  });

  if (!statement) throw new Error('Statement not found');

  const loan = await getLoanWithCalculatedPayments(statement.loanId);
  const pdfOutput = await pdf(
    <StatementDocument
      loan={loan}
      statement={{
        ...statement,
        amountDue: statement.amountDue,
        statementDate: statement.statementDate,
        dueDate: statement.dueDate,
      }}
    />,
  ).toBuffer();

  return toNodeBuffer(pdfOutput as Buffer | Uint8Array | ReadableStream | NodeJS.ReadableStream);
}

export async function ensureStatementPdf(statementId: number) {
  const statement = await prisma.statement.findUnique({ where: { id: statementId } });
  if (!statement) throw new Error('Statement not found');

  const outDir = path.join(process.cwd(), 'public', 'statements');
  await fs.mkdir(outDir, { recursive: true });
  const filename = `statement-${statement.id}.pdf`;
  const pdfPath = path.join(outDir, filename);

  const pdfBuffer = await renderStatementPdfBuffer(statement.id);
  await fs.writeFile(pdfPath, pdfBuffer);

  return prisma.statement.update({
    where: { id: statement.id },
    data: { pdfPath: `/statements/${filename}` },
    include: { loan: true },
  });
}

export async function generateStatementPdf({ loanId, month, year }: { loanId: number; month?: number; year?: number }) {
  const loan = await getLoanWithCalculatedPayments(loanId);

  const statementDate = month && year ? new Date(Date.UTC(year, month - 1, 15)) : new Date();
  const amountDue = calculateTotalAmountDue({
    principalBalance: loan.principalBalance,
    interestRate: loan.interestRate,
    monthlyPayment: loan.monthlyPayment,
    paidToDate: loan.paidToDate,
    statementDate,
    status: loan.status,
  });
  const computedDueDate = loan.dueDate ?? addMonthsUtc(loan.paidToDate, 1);

  await prisma.loan.update({
    where: { id: loan.id },
    data: { totalAmountDue: amountDue },
  });

  const statement = await prisma.statement.create({
    data: {
      loanId: loan.id,
      statementDate,
      dueDate: computedDueDate,
      amountDue,
    },
  });

  return ensureStatementPdf(statement.id);
}
