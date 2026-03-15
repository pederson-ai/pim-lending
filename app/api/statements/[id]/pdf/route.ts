import { prisma } from '@/lib/prisma';
import { renderStatementPdfBuffer } from '@/lib/statements';

export async function GET(_: Request, { params }: { params: { id: string } }) {
  const statementId = Number(params.id);
  const statement = await prisma.statement.findUnique({ where: { id: statementId } });
  if (!statement) return new Response('Not found', { status: 404 });

  const file = await renderStatementPdfBuffer(statementId);
  return new Response(file, {
    headers: {
      'Content-Type': 'application/pdf',
      'Content-Disposition': `inline; filename="statement-${statementId}.pdf"`,
    },
  });
}
