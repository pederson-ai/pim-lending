import fs from 'fs/promises';
import path from 'path';
import { prisma } from '@/lib/prisma';
import { Document, Page, Text, View, StyleSheet, pdf } from '@react-pdf/renderer';
import { format } from 'date-fns';

const LENDER_ADDRESS = ['PIM Income Fund LLC', '1750 SW Skyline Blvd, Ste 25', 'Portland, OR 97221'];

const styles = StyleSheet.create({
  page: { padding: 32, fontSize: 11, color: '#0f172a' },
  header: { marginBottom: 20 },
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
  colDate: { width: '18%' },
  colDesc: { width: '46%', paddingRight: 8 },
  colAmount: { width: '18%', textAlign: 'right' },
  colBalance: { width: '18%', textAlign: 'right' },
});

function formatCurrency(value: number) {
  return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(value ?? 0);
}

function formatPercent(value: number) {
  return `${(value * 100).toFixed(2)}%`;
}

function StatementDocument({ loan, statement }: any) {
  return (
    <Document>
      <Page size="LETTER" style={styles.page}>
        <View style={styles.header}>
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
                ['Amount Due', formatCurrency(statement.amountDue)],
                ['Due Date', format(statement.dueDate, 'M/d/yyyy')],
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
          <Text style={styles.colAmount}>Amount/Interest</Text>
          <Text style={styles.colBalance}>Balance</Text>
        </View>
        {loan.payments.map((payment: any) => (
          <View style={styles.tableRow} key={payment.id}>
            <Text style={styles.colDate}>{format(payment.paymentDate, 'M/d/yyyy')}</Text>
            <Text style={styles.colDesc}>{payment.description}</Text>
            <Text style={styles.colAmount}>{formatCurrency(payment.amount)}</Text>
            <Text style={styles.colBalance}>{formatCurrency(payment.balance)}</Text>
          </View>
        ))}
      </Page>
    </Document>
  );
}

export async function generateStatementPdf({ loanId, month, year }: { loanId: number; month?: number; year?: number }) {
  const loan = await prisma.loan.findUnique({
    where: { id: loanId },
    include: {
      payments: { orderBy: { paymentDate: 'desc' } },
      statements: { orderBy: { createdAt: 'desc' } },
    },
  });

  if (!loan) throw new Error('Loan not found');

  const statementDate = month && year ? new Date(Date.UTC(year, month - 1, 15)) : new Date();
  const dueDate = month && year ? new Date(Date.UTC(year, month - 1, 1)) : loan.statements[0]?.dueDate ?? new Date();
  const amountDue = loan.monthlyPayment;

  const statement = await prisma.statement.create({
    data: {
      loanId: loan.id,
      statementDate,
      dueDate,
      amountDue,
    },
  });

  const outDir = path.join(process.cwd(), 'public', 'statements');
  await fs.mkdir(outDir, { recursive: true });
  const filename = `statement-${statement.id}.pdf`;
  const pdfPath = path.join(outDir, filename);

  const blob = await pdf(<StatementDocument loan={loan} statement={{ ...statement, amountDue, statementDate, dueDate }} />).toBuffer();
  await fs.writeFile(pdfPath, blob);

  const updated = await prisma.statement.update({
    where: { id: statement.id },
    data: { pdfPath: `/statements/${filename}` },
    include: { loan: true },
  });

  return updated;
}
