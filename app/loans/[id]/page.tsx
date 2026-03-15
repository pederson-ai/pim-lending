import { notFound } from 'next/navigation';
import Link from 'next/link';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { PageShell } from '@/components/page-shell';
import { getLoanDetail } from '@/lib/data';
import { formatCurrency, formatDate, formatPercent } from '@/lib/utils';
import { PaymentForm } from '@/components/payment-form';
import { GenerateStatementButton } from '@/components/generate-statement-button';

export default async function LoanDetailPage({ params }: { params: { id: string } }) {
  const loan = await getLoanDetail(Number(params.id));
  if (!loan) notFound();

  return (
    <PageShell title={loan.borrowerName} description={`Loan ${loan.loanNumber}`}>
      <div className="grid gap-6 lg:grid-cols-[1.2fr_0.8fr]">
        <div className="space-y-6">
          <Card>
            <CardHeader><CardTitle>Loan Details</CardTitle></CardHeader>
            <CardContent>
              <div className="grid gap-4 md:grid-cols-2 text-sm">
                <div><div className="text-slate-500">Borrower Address</div><div className="whitespace-pre-line font-medium">{loan.borrowerAddress}</div></div>
                <div><div className="text-slate-500">Property Address</div><div className="font-medium">{loan.propertyStreet}<br />{loan.propertyCity}, {loan.propertySt} {loan.propertyZip}</div></div>
                <div><div className="text-slate-500">Principal Balance</div><div className="font-medium">{formatCurrency(loan.principalBalance)}</div></div>
                <div><div className="text-slate-500">Interest Rate</div><div className="font-medium">{formatPercent(loan.interestRate)}</div></div>
                <div><div className="text-slate-500">Maturity Date</div><div className="font-medium">{formatDate(loan.maturityDate)}</div></div>
                <div><div className="text-slate-500">Monthly Payment</div><div className="font-medium">{formatCurrency(loan.monthlyPayment)}</div></div>
                <div><div className="text-slate-500">Reserve Balance</div><div className="font-medium">{formatCurrency(loan.reserveBalance)}</div></div>
                <div><div className="text-slate-500">Lien Position</div><div className="font-medium">{loan.lienPosition ?? '—'}</div></div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader><CardTitle>Payment History</CardTitle></CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="text-sm">
                  <thead className="border-b border-slate-200 text-left text-slate-500">
                    <tr><th className="py-2 pr-4">Date</th><th className="py-2 pr-4">Description</th><th className="py-2 pr-4">Amount</th><th className="py-2 pr-4">Balance</th></tr>
                  </thead>
                  <tbody>
                    {loan.payments.map((payment) => (
                      <tr key={payment.id} className="border-b border-slate-100">
                        <td className="py-3 pr-4">{formatDate(payment.paymentDate)}</td>
                        <td className="py-3 pr-4">{payment.description}</td>
                        <td className="py-3 pr-4">{formatCurrency(payment.amount)}</td>
                        <td className="py-3 pr-4">{formatCurrency(payment.balance)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="space-y-6">
          <Card>
            <CardHeader><CardTitle>Actions</CardTitle></CardHeader>
            <CardContent className="space-y-4">
              <PaymentForm loanId={loan.id} defaultAmount={loan.monthlyPayment} />
              <GenerateStatementButton loanId={loan.id} />
            </CardContent>
          </Card>

          <Card>
            <CardHeader><CardTitle>Past Statements</CardTitle></CardHeader>
            <CardContent>
              <div className="space-y-3 text-sm">
                {loan.statements.map((statement) => (
                  <div key={statement.id} className="rounded-lg border border-slate-200 p-3">
                    <div className="font-medium">{formatDate(statement.statementDate)}</div>
                    <div className="text-slate-500">Due {formatDate(statement.dueDate)} · {formatCurrency(statement.amountDue)}</div>
                    <div className="mt-2 flex gap-3">
                      {statement.pdfPath ? <Link className="text-blue-700" href={statement.pdfPath} target="_blank">Preview PDF</Link> : null}
                      <span className="text-slate-500">{statement.sentAt ? `Sent to ${statement.sentTo}` : 'Not sent'}</span>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </PageShell>
  );
}
