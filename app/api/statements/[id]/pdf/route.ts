import { prisma } from '@/lib/prisma';
import fs from 'fs/promises';
import path from 'path';

export async function GET(_: Request, { params }: { params: { id: string } }) {
  const statement = await prisma.statement.findUnique({ where: { id: Number(params.id) } });
  if (!statement?.pdfPath) return new Response('Not found', { status: 404 });
  const filePath = path.join(process.cwd(), 'public', statement.pdfPath.replace(/^\//, ''));
  const file = await fs.readFile(filePath);
  return new Response(file, { headers: { 'Content-Type': 'application/pdf' } });
}
