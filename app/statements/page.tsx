export const dynamic = 'force-dynamic';

import Link from 'next/link';
import { prisma } from '@/lib/prisma';
import { PageShell } from '@/components/page-shell';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { formatCurrency, formatDate } from '@/lib/utils';
import { StatementsToolbar } from '@/components/statements-client';
import { GenerateStatementButton } from '@/components/generate-statement-button';
import { SendStatementButton } from '@/components/send-statement-button';
import { recalculateLoanAmounts } from '@/lib/payments';
import { getStatementPdfUrl } from '@/lib/statement-urls';

export default async function StatementsPage() {
  const loanIds = await prisma.loan.findMany({ select: { id: true } });
  await Promise.all(loanIds.map(({ id }) => recalculateLoanAmounts(id)));

  const loans = await prisma.loan.findMany({
    where: { status: { not: 'PAID_OFF' } },
    include: { statements: { orderBy: { createdAt: 'desc' }, take: 1 } },
    orderBy: { borrowerName: 'asc' },
  });

  return (
    <PageShell title="Statement Generation" description="Generate monthly mortgage statements for active loans.">
      <StatementsToolbar loans={loans.map((loan) => ({ id: loan.id }))} />
      <Card>
        <CardHeader><CardTitle>Active Loans</CardTitle></CardHeader>
        <CardContent>
          <table className="text-sm">
            <thead className="border-b border-slate-200 text-left text-slate-500">
              <tr><th className="py-3 pr-4">Borrower</th><th className="py-3 pr-4">Loan Number</th><th className="py-3 pr-4">Total Amount Due</th><th className="py-3 pr-4">Latest Statement</th><th className="py-3 pr-4">Email</th><th className="py-3 pr-4">Actions</th></tr>
            </thead>
            <tbody>
              {loans.map((loan) => {
                const latestStatement = loan.statements[0];

                return (
                  <tr key={loan.id} className="border-b border-slate-100">
                    <td className="py-3 pr-4">{loan.borrowerName}</td>
                    <td className="py-3 pr-4">{loan.loanNumber}</td>
                    <td className="py-3 pr-4">{formatCurrency(loan.totalAmountDue)}</td>
                    <td className="py-3 pr-4">{latestStatement ? <Link href={getStatementPdfUrl(latestStatement.id)} target="_blank" className="text-blue-700">{formatDate(latestStatement.statementDate)}</Link> : 'Not generated'}</td>
                    <td className="py-3 pr-4">{loan.borrowerEmail ?? 'Missing email'}</td>
                    <td className="py-3 pr-4">
                      <div className="flex flex-wrap gap-2">
                        <GenerateStatementButton loanId={loan.id} label="Generate" />
                        {latestStatement ? <SendStatementButton statementId={latestStatement.id} /> : null}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </CardContent>
      </Card>
    </PageShell>
  );
}
