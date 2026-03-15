import Link from 'next/link';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { PageShell } from '@/components/page-shell';
import { getDashboardData } from '@/lib/data';
import { formatCurrency, formatDate, formatPercent } from '@/lib/utils';
import { StatusBadge } from '@/components/status-badge';

export default async function HomePage() {
  const { loans, summary } = await getDashboardData();

  return (
    <PageShell title="Loan Servicing Dashboard" description="Mortgage statements, payment activity, and loan monitoring for PIM Income Fund.">
      <div className="grid gap-4 md:grid-cols-3">
        <Card><CardHeader><CardTitle>Total Active Loans</CardTitle></CardHeader><CardContent><div className="text-3xl font-bold">{summary.totalActiveLoans}</div></CardContent></Card>
        <Card><CardHeader><CardTitle>Total Principal Outstanding</CardTitle></CardHeader><CardContent><div className="text-3xl font-bold">{formatCurrency(summary.totalPrincipalOutstanding)}</div></CardContent></Card>
        <Card><CardHeader><CardTitle>Total Interest Collected</CardTitle></CardHeader><CardContent><div className="text-3xl font-bold">{formatCurrency(summary.totalInterestCollected)}</div></CardContent></Card>
      </div>

      <Card className="mt-6">
        <CardHeader><CardTitle>Active Loans</CardTitle></CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="min-w-full text-sm">
              <thead className="border-b border-slate-200 text-left text-slate-500">
                <tr>
                  <th className="py-3 pr-4">Borrower</th>
                  <th className="py-3 pr-4">Loan Number</th>
                  <th className="py-3 pr-4">Principal</th>
                  <th className="py-3 pr-4">Rate</th>
                  <th className="py-3 pr-4">Maturity</th>
                  <th className="py-3 pr-4">Monthly Payment</th>
                  <th className="py-3 pr-4">Status</th>
                </tr>
              </thead>
              <tbody>
                {loans.map((loan) => (
                  <tr key={loan.id} className="border-b border-slate-100 hover:bg-slate-50">
                    <td className="py-4 pr-4 font-medium text-slate-900"><Link href={`/loans/${loan.id}`}>{loan.borrowerName}</Link></td>
                    <td className="py-4 pr-4">{loan.loanNumber}</td>
                    <td className="py-4 pr-4">{formatCurrency(loan.principalBalance)}</td>
                    <td className="py-4 pr-4">{formatPercent(loan.interestRate)}</td>
                    <td className="py-4 pr-4">{formatDate(loan.maturityDate)}</td>
                    <td className="py-4 pr-4">{formatCurrency(loan.monthlyPayment)}</td>
                    <td className="py-4 pr-4"><StatusBadge maturityDate={loan.maturityDate} dueDate={loan.statements[0]?.dueDate} /></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </PageShell>
  );
}
