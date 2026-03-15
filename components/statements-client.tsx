'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';

export function StatementsToolbar({ loans }: { loans: { id: number }[] }) {
  const today = new Date();
  const [month, setMonth] = useState(today.getUTCMonth() + 1);
  const [year, setYear] = useState(today.getUTCFullYear());
  const [loading, setLoading] = useState(false);

  async function generateAll() {
    setLoading(true);
    for (const loan of loans) {
      await fetch('/api/statements/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ loanId: loan.id, month, year }),
      });
    }
    setLoading(false);
    window.location.reload();
  }

  return (
    <div className="mb-6 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
      <div className="flex gap-3">
        <select className="rounded-md border border-slate-300 px-3 py-2" value={month} onChange={(e) => setMonth(Number(e.target.value))}>
          {Array.from({ length: 12 }, (_, i) => i + 1).map((value) => <option key={value} value={value}>{value}</option>)}
        </select>
        <select className="rounded-md border border-slate-300 px-3 py-2" value={year} onChange={(e) => setYear(Number(e.target.value))}>
          {[2026, 2027, 2028].map((value) => <option key={value} value={value}>{value}</option>)}
        </select>
      </div>
      <Button onClick={generateAll} disabled={loading}>{loading ? 'Generating...' : 'Generate All'}</Button>
    </div>
  );
}
