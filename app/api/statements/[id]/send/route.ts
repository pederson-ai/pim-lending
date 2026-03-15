import { NextResponse } from 'next/server';
import { format } from 'date-fns';
import { prisma } from '@/lib/prisma';
import { ensureStatementPdf, renderStatementPdfBuffer } from '@/lib/statements';
import { sendMailWithAttachment } from '@/lib/ms-graph';

export async function POST(_: Request, { params }: { params: { id: string } }) {
  const statementId = Number(params.id);

  const statement = await prisma.statement.findUnique({
    where: { id: statementId },
    include: { loan: true },
  });

  if (!statement) return NextResponse.json({ error: 'Statement not found' }, { status: 404 });
  if (!statement.loan.borrowerEmail) {
    return NextResponse.json({ error: 'Borrower email is missing for this loan. Edit the loan to add email addresses.' }, { status: 400 });
  }

  const emailAddresses = statement.loan.borrowerEmail.split(',').map((e: string) => e.trim()).filter(Boolean);
  if (emailAddresses.length === 0) {
    return NextResponse.json({ error: 'No valid email addresses found for this loan' }, { status: 400 });
  }

  await ensureStatementPdf(statement.id);
  const pdfBuffer = await renderStatementPdfBuffer(statement.id);
  const monthYear = format(statement.statementDate, 'MMMM yyyy');
  const filename = `PIM-Mortgage-Statement-${format(statement.statementDate, 'yyyy-MM')}.pdf`;

  await sendMailWithAttachment({
    to: emailAddresses,
    subject: `PIM Income Fund - Mortgage Statement - ${monthYear}`,
    html: `<p>Dear ${statement.loan.borrowerName},</p><p>Please find your mortgage statement for ${monthYear} attached.</p><p>If you have any questions, please reply to this email.</p><p>Regards,<br />PIM Income Fund LLC</p>`,
    filename,
    contentBytes: pdfBuffer.toString('base64'),
  });

  const updated = await prisma.statement.update({
    where: { id: statement.id },
    data: {
      sentAt: new Date(),
      sentTo: emailAddresses.join(', '),
    },
    include: { loan: true },
  });

  return NextResponse.json(updated);
}
