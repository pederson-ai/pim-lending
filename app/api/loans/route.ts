import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET() {
  const loans = await prisma.loan.findMany({ orderBy: { borrowerName: 'asc' } });
  return NextResponse.json(loans);
}

export async function POST(request: Request) {
  const body = await request.json();
  const loan = await prisma.loan.create({ data: body });
  return NextResponse.json(loan, { status: 201 });
}
