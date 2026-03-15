'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';

export function DeletePaymentButton({ paymentId }: { paymentId: number }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  async function onDelete() {
    if (!window.confirm('Are you sure?')) return;

    setLoading(true);

    try {
      const response = await fetch(`/api/payments/${paymentId}`, { method: 'DELETE' });
      if (!response.ok) {
        const payload = await response.json().catch(() => null);
        throw new Error(payload?.error ?? 'Failed to delete payment');
      }

      router.refresh();
    } finally {
      setLoading(false);
    }
  }

  return (
    <Button
      type="button"
      variant="ghost"
      size="sm"
      className="text-red-600 hover:bg-red-50 hover:text-red-700"
      disabled={loading}
      onClick={onDelete}
    >
      <Trash2 className="h-4 w-4" />
    </Button>
  );
}
