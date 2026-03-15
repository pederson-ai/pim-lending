import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { recalculateLoanAmounts } from '@/lib/payments';

export async function GET() {
  const loanIds = await prisma.loan.findMany({ select: { id: true }, orderBy: { borrowerName: 'asc' } });

  for (const { id } of loanIds) {
    await recalculateLoanAmounts(id);
  }

  const loans = await prisma.loan.findMany({ orderBy: { borrowerName: 'asc' } });
  return NextResponse.json(loans);
}

export async function POST(request: Request) {
  const body = await request.json();
  const loan = await prisma.loan.create({
    data: {
      loanNumber: body.loanNumber,
      borrowerName: body.borrowerName,
      borrowerAddress: body.borrowerAddress,
      borrowerEmail: body.borrowerEmail?.trim() || null,
      propertyStreet: body.propertyStreet,
      propertyCity: body.propertyCity,
      propertySt: body.propertySt,
      propertyZip: body.propertyZip,
      principalBalance: Number(body.principalBalance),
      interestRate: Number(body.interestRate),
      maturityDate: new Date(body.maturityDate),
      monthlyPayment: Number(body.monthlyPayment),
      reserveBalance: Number(body.reserveBalance ?? 0),
      lienPosition: body.lienPosition?.trim() || null,
      status: body.status || 'CURRENT',
      paidToDate: new Date(body.paidToDate),
      dueDate: body.dueDate ? new Date(body.dueDate) : null,
      totalAmountDue: 0,
    },
  });

  const refreshed = await recalculateLoanAmounts(loan.id);
  return NextResponse.json(refreshed, { status: 201 });
}
