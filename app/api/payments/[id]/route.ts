import { NextResponse } from 'next/server';
import { deletePaymentAndUpdateLoan } from '@/lib/payments';

export async function DELETE(_: Request, { params }: { params: { id: string } }) {
  try {
    const updatedLoan = await deletePaymentAndUpdateLoan(Number(params.id));
    return NextResponse.json(updatedLoan);
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to delete payment';
    const status = message === 'Payment not found' ? 404 : 500;

    return NextResponse.json({ error: message }, { status });
  }
}
