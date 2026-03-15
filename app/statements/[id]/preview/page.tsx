import { prisma } from '@/lib/prisma';
import { notFound, redirect } from 'next/navigation';

export default async function StatementPreviewPage({ params }: { params: { id: string } }) {
  const statement = await prisma.statement.findUnique({ where: { id: Number(params.id) } });
  if (!statement) notFound();
  if (statement.pdfPath) redirect(statement.pdfPath);
  notFound();
}
