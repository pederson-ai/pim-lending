import { prisma } from '@/lib/prisma';

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
