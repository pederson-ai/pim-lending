'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';

export function SendStatementButton({ statementId, label = 'Send' }: { statementId: number; label?: string }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function sendStatement() {
    setLoading(true);
    setError(null);

    const response = await fetch(`/api/statements/${statementId}/send`, {
      method: 'POST',
    });

    const data = await response.json().catch(() => null);

    if (!response.ok) {
      setError(data?.error ?? 'Failed to send statement');
      setLoading(false);
      return;
    }

    setLoading(false);
    router.refresh();
  }

  return (
    <div className="space-y-1">
      <Button onClick={sendStatement} disabled={loading} variant="outline">
        {loading ? 'Sending...' : label}
      </Button>
      {error ? <div className="text-xs text-red-600">{error}</div> : null}
    </div>
  );
}
