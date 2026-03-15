import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { recalculatePaymentBalances } from '@/lib/payments';

export async function POST(request: Request) {
  const body = await request.json();
  const loanId = Number(body.loanId);
  const loan = await prisma.loan.findUnique({ where: { id: loanId } });
  if (!loan) return NextResponse.json({ error: 'Loan not found' }, { status: 404 });

  const payment = await prisma.payment.create({
    data: {
      loanId,
      paymentDate: new Date(body.paymentDate),
      amount: Number(body.amount),
      description: body.description,
      source: body.source,
      balance: 0,
    },
  });

  const balances = await recalculatePaymentBalances(loanId);
  const savedPayment = balances.find((item) => item.id === payment.id);

  return NextResponse.json({ ...payment, balance: savedPayment?.balance ?? payment.balance }, { status: 201 });
}
