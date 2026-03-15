'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { getStatementPdfUrl } from '@/lib/statement-urls';

export function GenerateStatementButton({ loanId, month, year, label = 'Generate Statement' }: { loanId: number; month?: number; year?: number; label?: string }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  async function generate() {
    setLoading(true);
    const response = await fetch('/api/statements/generate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ loanId, month, year }),
    });
    const data = await response.json();
    setLoading(false);
    router.refresh();
    if (data?.pdfPath) window.open(data.pdfPath, '_blank');
  }

  return <Button onClick={generate} disabled={loading}>{loading ? 'Generating...' : label}</Button>;
}
