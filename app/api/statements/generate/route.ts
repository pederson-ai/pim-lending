import { NextResponse } from 'next/server';
import { generateStatementPdf } from '@/lib/statements';

export async function POST(request: Request) {
  const body = await request.json();
  const statement = await generateStatementPdf({
    loanId: Number(body.loanId),
    month: body.month ? Number(body.month) : undefined,
    year: body.year ? Number(body.year) : undefined,
  });
  return NextResponse.json(statement, { status: 201 });
}
