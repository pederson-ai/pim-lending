import { prisma } from '@/lib/prisma';
import { addMonthsUtc, daysBetweenUtc, firstDayOfNextMonthUtc, roundCurrency } from '@/lib/utils';

export function calculateRunningBalances<T extends { id: number; amount: number; paymentDate: Date; createdAt?: Date }>(
  payments: T[],
  monthlyPayment: number,
) {
  const ordered = [...payments].sort((a, b) => {
    const dateDiff = new Date(a.paymentDate).getTime() - new Date(b.paymentDate).getTime();
    if (dateDiff !== 0) return dateDiff;
    const createdDiff = (a.createdAt ? new Date(a.createdAt).getTime() : 0) - (b.createdAt ? new Date(b.createdAt).getTime() : 0);
    if (createdDiff !== 0) return createdDiff;
    return a.id - b.id;
  });

  let outstandingBalance = 0;

  return ordered.map((payment) => {
    outstandingBalance = Math.max(0, outstandingBalance + monthlyPayment - payment.amount);
    return { ...payment, balance: Number(outstandingBalance.toFixed(2)) };
  });
}

export function calculateTotalAmountDue({
  principalBalance,
  interestRate,
  monthlyPayment,
  paidToDate,
  statementDate,
  status,
}: {
  principalBalance: number;
  interestRate: number;
  monthlyPayment: number;
  paidToDate: Date | string;
  statementDate: Date | string;
  status?: string;
}) {
  if (status === 'PAID_OFF') return 0;

  const paidDate = new Date(paidToDate);
  const asOfDate = new Date(statementDate);
  const monthlyInterest = principalBalance * interestRate / 12;
  let total = 0;
  let cursor: Date;

  if (paidDate.getUTCDate() !== 1) {
    const nextMonthStart = firstDayOfNextMonthUtc(paidDate);
    const stubDays = daysBetweenUtc(paidDate, nextMonthStart);
    total += principalBalance * interestRate / 360 * stubDays;
    cursor = nextMonthStart;
  } else {
    cursor = new Date(Date.UTC(paidDate.getUTCFullYear(), paidDate.getUTCMonth(), 1));
  }

  while (cursor.getTime() <= asOfDate.getTime()) {
    total += monthlyPayment || monthlyInterest;
    cursor = addMonthsUtc(cursor, 1);
  }

  return roundCurrency(total);
}

export function deriveStoredLoanStatus({
  status,
  dueDate,
  asOfDate = new Date(),
}: {
  status: string;
  dueDate?: Date | string | null;
  asOfDate?: Date;
}) {
  if (status === 'MATURED' || status === 'PAID_OFF') return status;
  if (!dueDate) return 'CURRENT';

  return asOfDate.getTime() > new Date(dueDate).getTime() ? 'PAST_DUE' : 'CURRENT';
}

async function updateLoanComputedFields(loanId: number, statementDate = new Date()) {
  const loan = await prisma.loan.findUnique({ where: { id: loanId } });
  if (!loan) throw new Error('Loan not found');

  const totalAmountDue = calculateTotalAmountDue({
    principalBalance: loan.principalBalance,
    interestRate: loan.interestRate,
    monthlyPayment: loan.monthlyPayment,
    paidToDate: loan.paidToDate,
    statementDate,
    status: loan.status,
  });

  const dynamicStatus = deriveStoredLoanStatus({
    status: loan.status,
    dueDate: loan.dueDate,
    asOfDate: new Date(),
  });

  return prisma.loan.update({
    where: { id: loanId },
    data: {
      totalAmountDue,
      status: dynamicStatus,
    },
  });
}

export async function recalculatePaymentBalances(loanId: number) {
  const loan = await prisma.loan.findUnique({
    where: { id: loanId },
    include: {
      payments: {
        orderBy: [{ paymentDate: 'asc' }, { createdAt: 'asc' }, { id: 'asc' }],
      },
    },
  });

  if (!loan) throw new Error('Loan not found');

  const recalculated = calculateRunningBalances(loan.payments, loan.monthlyPayment);

  if (recalculated.length === 0) return recalculated;

  await prisma.$transaction(
    recalculated.map((payment) =>
      prisma.payment.update({
        where: { id: payment.id },
        data: { balance: payment.balance },
      }),
    ),
  );

  return recalculated;
}

export async function recalculateLoanAmounts(loanId: number, statementDate = new Date()) {
  return updateLoanComputedFields(loanId, statementDate);
}

export async function recalculateLoanFromPayments(loanId: number, statementDate = new Date()) {
  const loan = await prisma.loan.findUnique({
    where: { id: loanId },
    include: {
      payments: {
        orderBy: [{ paymentDate: 'asc' }, { createdAt: 'asc' }, { id: 'asc' }],
      },
    },
  });

  if (!loan) throw new Error('Loan not found');

  let paidToDate = new Date(loan.paidToDate);

  if (loan.payments.length > 0) {
    paidToDate = new Date(loan.payments[0].paymentDate);

    for (const payment of loan.payments) {
      if (payment.amount >= loan.monthlyPayment) {
        paidToDate = addMonthsUtc(paidToDate, 1);
      }
    }
  }

  const dueDate = loan.status === 'PAID_OFF' ? null : addMonthsUtc(paidToDate, 1);

  await prisma.loan.update({
    where: { id: loanId },
    data: {
      paidToDate,
      dueDate,
    },
  });

  await recalculatePaymentBalances(loanId);
  return updateLoanComputedFields(loanId, statementDate);
}

export async function recordPaymentAndUpdateLoan({
  loanId,
  paymentDate,
  amount,
  description,
  source,
}: {
  loanId: number;
  paymentDate: Date;
  amount: number;
  description: string;
  source: string;
}) {
  const loan = await prisma.loan.findUnique({ where: { id: loanId } });
  if (!loan) throw new Error('Loan not found');

  const shouldAdvanceDates = amount >= loan.monthlyPayment && loan.status !== 'PAID_OFF';
  const nextPaidToDate = shouldAdvanceDates ? addMonthsUtc(loan.paidToDate, 1) : loan.paidToDate;
  const nextDueDate = shouldAdvanceDates && loan.dueDate ? addMonthsUtc(loan.dueDate, 1) : loan.dueDate;

  const payment = await prisma.payment.create({
    data: {
      loanId,
      paymentDate,
      amount,
      description,
      source,
      balance: 0,
    },
  });

  await prisma.loan.update({
    where: { id: loanId },
    data: {
      paidToDate: nextPaidToDate,
      dueDate: nextDueDate,
    },
  });

  const balances = await recalculatePaymentBalances(loanId);
  await updateLoanComputedFields(loanId, paymentDate);
  const savedPayment = balances.find((item) => item.id === payment.id);

  return { ...payment, balance: savedPayment?.balance ?? payment.balance };
}

export async function deletePaymentAndUpdateLoan(paymentId: number) {
  const payment = await prisma.payment.findUnique({ where: { id: paymentId } });
  if (!payment) throw new Error('Payment not found');

  await prisma.payment.delete({ where: { id: paymentId } });

  return recalculateLoanFromPayments(payment.loanId, new Date());
}
