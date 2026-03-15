import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { recordPaymentAndUpdateLoan } from '@/lib/payments';

export async function POST(request: Request) {
  const body = await request.json();
  const loanId = Number(body.loanId);
  const loan = await prisma.loan.findUnique({ where: { id: loanId } });
  if (!loan) return NextResponse.json({ error: 'Loan not found' }, { status: 404 });

  const payment = await recordPaymentAndUpdateLoan({
    loanId,
    paymentDate: new Date(body.paymentDate),
    amount: Number(body.amount),
    description: body.description,
    source: body.source,
  });

  return NextResponse.json(payment, { status: 201 });
}
