import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function POST(request: Request) {
  const body = await request.json();
  const loan = await prisma.loan.findUnique({ where: { id: Number(body.loanId) } });
  if (!loan) return NextResponse.json({ error: 'Loan not found' }, { status: 404 });

  const payment = await prisma.payment.create({
    data: {
      loanId: Number(body.loanId),
      paymentDate: new Date(body.paymentDate),
      amount: Number(body.amount),
      description: body.description,
      source: body.source,
      balance: 0,
    },
  });

  return NextResponse.json(payment, { status: 201 });
}
