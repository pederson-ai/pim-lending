import { prisma } from '@/lib/prisma';

export async function getDashboardData() {
  const loans = await prisma.loan.findMany({
    include: {
      payments: { orderBy: { paymentDate: 'desc' } },
      statements: { orderBy: { dueDate: 'desc' } },
    },
    orderBy: { borrowerName: 'asc' },
  });

  const totalActiveLoans = loans.filter((loan) => loan.status === 'ACTIVE').length;
  const totalPrincipalOutstanding = loans.reduce((sum, loan) => sum + loan.principalBalance, 0);
  const totalInterestCollected = loans.reduce(
    (sum, loan) => sum + loan.payments.reduce((inner, payment) => inner + payment.amount, 0),
    0,
  );

  return { loans, summary: { totalActiveLoans, totalPrincipalOutstanding, totalInterestCollected } };
}

export async function getLoanDetail(id: number) {
  return prisma.loan.findUnique({
    where: { id },
    include: {
      payments: { orderBy: { paymentDate: 'desc' } },
      statements: { orderBy: { statementDate: 'desc' } },
    },
  });
}
