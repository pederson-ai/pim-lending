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
    principalBalance: number;
    interestRate: number;
    monthlyPayment: number;
    maturityDate: Date | string;
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
    principalBalance: String(loan.principalBalance),
    interestRate: String(loan.interestRate),
    monthlyPayment: String(loan.monthlyPayment),
    maturityDate: formatDateInput(loan.maturityDate),
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
        principalBalance: Number(form.principalBalance),
        interestRate: Number(form.interestRate),
        monthlyPayment: Number(form.monthlyPayment),
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
    <form onSubmit={onSubmit} className="grid gap-4 rounded-lg border border-slate-200 p-4">
      <h3 className="text-lg font-semibold text-slate-900">Edit Loan</h3>

      <div className="grid gap-4 md:grid-cols-2">
        <div>
          <label className="mb-1 block text-sm font-medium text-slate-700">Borrower Name</label>
          <input className="w-full rounded-md border border-slate-300 px-3 py-2" value={form.borrowerName} onChange={(e) => setForm({ ...form, borrowerName: e.target.value })} required />
        </div>
        <div>
          <label className="mb-1 block text-sm font-medium text-slate-700">Borrower Email(s)</label>
          <input className="w-full rounded-md border border-slate-300 px-3 py-2" type="text" value={form.borrowerEmail} onChange={(e) => setForm({ ...form, borrowerEmail: e.target.value })} />
          <p className="mt-1 text-xs text-slate-500">Multiple emails separated by commas</p>
        </div>
      </div>

      <div>
        <label className="mb-1 block text-sm font-medium text-slate-700">Borrower Address</label>
        <textarea className="w-full min-h-20 rounded-md border border-slate-300 px-3 py-2" value={form.borrowerAddress} onChange={(e) => setForm({ ...form, borrowerAddress: e.target.value })} required />
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <div>
          <label className="mb-1 block text-sm font-medium text-slate-700">Principal Balance</label>
          <input className="w-full rounded-md border border-slate-300 px-3 py-2" type="number" step="0.01" value={form.principalBalance} onChange={(e) => setForm({ ...form, principalBalance: e.target.value })} required />
        </div>
        <div>
          <label className="mb-1 block text-sm font-medium text-slate-700">Interest Rate (decimal, e.g. 0.13 = 13%)</label>
          <input className="w-full rounded-md border border-slate-300 px-3 py-2" type="number" step="0.0001" value={form.interestRate} onChange={(e) => setForm({ ...form, interestRate: e.target.value })} required />
        </div>
        <div>
          <label className="mb-1 block text-sm font-medium text-slate-700">Monthly Payment</label>
          <input className="w-full rounded-md border border-slate-300 px-3 py-2" type="number" step="0.01" value={form.monthlyPayment} onChange={(e) => setForm({ ...form, monthlyPayment: e.target.value })} required />
        </div>
        <div>
          <label className="mb-1 block text-sm font-medium text-slate-700">Maturity Date</label>
          <input className="w-full rounded-md border border-slate-300 px-3 py-2" type="date" value={form.maturityDate} onChange={(e) => setForm({ ...form, maturityDate: e.target.value })} required />
        </div>
        <div>
          <label className="mb-1 block text-sm font-medium text-slate-700">Reserve Balance</label>
          <input className="w-full rounded-md border border-slate-300 px-3 py-2" type="number" step="0.01" value={form.reserveBalance} onChange={(e) => setForm({ ...form, reserveBalance: e.target.value })} required />
        </div>
        <div>
          <label className="mb-1 block text-sm font-medium text-slate-700">Lien Position</label>
          <select className="w-full rounded-md border border-slate-300 px-3 py-2" value={form.lienPosition} onChange={(e) => setForm({ ...form, lienPosition: e.target.value })}>
            {lienOptions.map((option) => <option key={option || 'blank'} value={option}>{option || 'None'}</option>)}
          </select>
        </div>
        <div>
          <label className="mb-1 block text-sm font-medium text-slate-700">Status</label>
          <select className="w-full rounded-md border border-slate-300 px-3 py-2" value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value })}>
            {statusOptions.map((status) => <option key={status} value={status}>{status}</option>)}
          </select>
        </div>
        <div>
          <label className="mb-1 block text-sm font-medium text-slate-700">Paid To Date</label>
          <input className="w-full rounded-md border border-slate-300 px-3 py-2" type="date" value={form.paidToDate} onChange={(e) => setForm({ ...form, paidToDate: e.target.value })} required />
        </div>
        <div>
          <label className="mb-1 block text-sm font-medium text-slate-700">Due Date</label>
          <input className="w-full rounded-md border border-slate-300 px-3 py-2" type="date" value={form.dueDate} onChange={(e) => setForm({ ...form, dueDate: e.target.value })} />
        </div>
      </div>

      <div className="flex gap-2">
        <Button type="submit" disabled={saving}>{saving ? 'Saving...' : 'Save Changes'}</Button>
        <Button type="button" variant="outline" onClick={() => setOpen(false)}>Cancel</Button>
      </div>
    </form>
  );
}
