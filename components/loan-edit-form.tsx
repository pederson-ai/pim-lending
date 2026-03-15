'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { formatDateInput } from '@/lib/utils';

const lienOptions = ['', '1st', '2nd', '3rd'];
const statusOptions = ['CURRENT', 'PAST_DUE', 'PAID_OFF', 'MATURED'];

export function LoanEditForm({
  loan,
}: {
  loan: {
    id: number;
    borrowerEmail: string | null;
    borrowerName: string;
    borrowerAddress: string;
    status: string;
    reserveBalance: number;
    lienPosition: string | null;
    paidToDate: Date | string;
    dueDate: Date | string | null;
  };
}) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({
    borrowerEmail: loan.borrowerEmail ?? '',
    borrowerName: loan.borrowerName,
    borrowerAddress: loan.borrowerAddress,
    status: loan.status,
    reserveBalance: String(loan.reserveBalance ?? 0),
    lienPosition: loan.lienPosition ?? '',
    paidToDate: formatDateInput(loan.paidToDate),
    dueDate: formatDateInput(loan.dueDate),
  });

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);

    const response = await fetch(`/api/loans/${loan.id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        ...form,
        reserveBalance: Number(form.reserveBalance),
      }),
    });

    setSaving(false);
    if (!response.ok) return;

    setOpen(false);
    router.refresh();
  }

  if (!open) {
    return <Button variant="outline" onClick={() => setOpen(true)}>Edit Loan</Button>;
  }

  return (
    <form onSubmit={onSubmit} className="grid gap-3 rounded-lg border border-slate-200 p-4">
      <input className="rounded-md border border-slate-300 px-3 py-2" placeholder="Borrower name" value={form.borrowerName} onChange={(e) => setForm({ ...form, borrowerName: e.target.value })} required />
      <input className="rounded-md border border-slate-300 px-3 py-2" type="text" placeholder="Borrower emails (comma-separated)" value={form.borrowerEmail} onChange={(e) => setForm({ ...form, borrowerEmail: e.target.value })} />
      <p className="text-xs text-slate-500 -mt-2">Multiple emails separated by commas</p>
      <textarea className="min-h-24 rounded-md border border-slate-300 px-3 py-2" placeholder="Borrower address" value={form.borrowerAddress} onChange={(e) => setForm({ ...form, borrowerAddress: e.target.value })} required />
      <div className="grid gap-3 md:grid-cols-2">
        <select className="rounded-md border border-slate-300 px-3 py-2" value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value })}>
          {statusOptions.map((status) => <option key={status} value={status}>{status}</option>)}
        </select>
        <input className="rounded-md border border-slate-300 px-3 py-2" type="number" step="0.01" placeholder="Reserve balance" value={form.reserveBalance} onChange={(e) => setForm({ ...form, reserveBalance: e.target.value })} required />
        <select className="rounded-md border border-slate-300 px-3 py-2" value={form.lienPosition} onChange={(e) => setForm({ ...form, lienPosition: e.target.value })}>
          {lienOptions.map((option) => <option key={option || 'blank'} value={option}>{option || 'None'}</option>)}
        </select>
        <input className="rounded-md border border-slate-300 px-3 py-2" type="date" value={form.paidToDate} onChange={(e) => setForm({ ...form, paidToDate: e.target.value })} required />
        <input className="rounded-md border border-slate-300 px-3 py-2" type="date" value={form.dueDate} onChange={(e) => setForm({ ...form, dueDate: e.target.value })} />
      </div>
      <div className="flex gap-2">
        <Button type="submit" disabled={saving}>{saving ? 'Saving...' : 'Save Changes'}</Button>
        <Button type="button" variant="outline" onClick={() => setOpen(false)}>Cancel</Button>
      </div>
    </form>
  );
}
