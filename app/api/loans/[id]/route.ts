import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(_: Request, { params }: { params: { id: string } }) {
  const loan = await prisma.loan.findUnique({
    where: { id: Number(params.id) },
    include: {
      payments: { orderBy: { paymentDate: 'desc' } },
      statements: { orderBy: { statementDate: 'desc' } },
    },
  });

  if (!loan) return NextResponse.json({ error: 'Not found' }, { status: 404 });
  return NextResponse.json(loan);
}
