import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { recalculatePaymentBalances } from '@/lib/payments';

export async function GET(_: Request, { params }: { params: { id: string } }) {
  const loanId = Number(params.id);
  await recalculatePaymentBalances(loanId);

  const loan = await prisma.loan.findUnique({
    where: { id: loanId },
    include: {
      payments: { orderBy: [{ paymentDate: 'desc' }, { createdAt: 'desc' }, { id: 'desc' }] },
      statements: { orderBy: { statementDate: 'desc' } },
    },
  });

  if (!loan) return NextResponse.json({ error: 'Not found' }, { status: 404 });
  return NextResponse.json(loan);
}

export async function PATCH(request: Request, { params }: { params: { id: string } }) {
  const loanId = Number(params.id);
  const body = await request.json();

  const updated = await prisma.loan.update({
    where: { id: loanId },
    data: {
      borrowerEmail: body.borrowerEmail?.trim() || null,
      borrowerName: body.borrowerName?.trim(),
      borrowerAddress: body.borrowerAddress?.trim(),
      status: body.status?.trim(),
      reserveBalance: Number(body.reserveBalance ?? 0),
    },
  });

  return NextResponse.json(updated);
}
