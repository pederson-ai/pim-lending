'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { paymentSources } from '@/lib/types';
import { formatCurrency } from '@/lib/utils';

export function PaymentForm({ loanId, defaultAmount }: { loanId: number; defaultAmount: number }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    paymentDate: new Date().toISOString().slice(0, 10),
    amount: String(defaultAmount),
    description: '',
    source: 'DIRECT_PAY',
  });

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    await fetch('/api/payments', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ...form, loanId, amount: Number(form.amount) }),
    });
    setLoading(false);
    setForm((current) => ({ ...current, description: '' }));
    router.refresh();
  }

  return (
    <form onSubmit={onSubmit} className="grid gap-3 md:grid-cols-2">
      <input className="rounded-md border border-slate-300 px-3 py-2" type="date" value={form.paymentDate} onChange={(e) => setForm({ ...form, paymentDate: e.target.value })} required />
      <div className="space-y-1">
        <input className="w-full rounded-md border border-slate-300 px-3 py-2" type="number" step="0.01" value={form.amount} onChange={(e) => setForm({ ...form, amount: e.target.value })} required />
        <p className="text-xs text-slate-500">Suggested monthly payment: {formatCurrency(defaultAmount)}</p>
      </div>
      <input className="rounded-md border border-slate-300 px-3 py-2 md:col-span-2" placeholder="Description" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} required />
      <select className="rounded-md border border-slate-300 px-3 py-2" value={form.source} onChange={(e) => setForm({ ...form, source: e.target.value })}>
        {paymentSources.map((source) => <option key={source} value={source}>{source}</option>)}
      </select>
      <Button disabled={loading}>{loading ? 'Saving...' : 'Record Payment'}</Button>
    </form>
  );
}
