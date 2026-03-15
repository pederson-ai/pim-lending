import fs from 'fs/promises';
import path from 'path';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  const result = await prisma.statement.deleteMany({});
  const statementsDir = path.join(process.cwd(), 'public', 'statements');

  try {
    const entries = await fs.readdir(statementsDir);
    await Promise.all(
      entries
        .filter((entry) => entry !== '.gitkeep')
        .map((entry) => fs.unlink(path.join(statementsDir, entry))),
    );
  } catch (error) {
    const code = (error as NodeJS.ErrnoException).code;
    if (code !== 'ENOENT') throw error;
  }

  console.log(`Deleted ${result.count} statements and cleared public/statements.`);
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
