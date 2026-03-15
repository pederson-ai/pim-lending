'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';

const lienOptions = ['', '1st', '2nd', '3rd'];

const initialForm = {
  loanNumber: '',
  borrowerName: '',
  borrowerAddress: '',
  borrowerEmail: '',
  propertyStreet: '',
  propertyCity: '',
  propertySt: '',
  propertyZip: '',
  principalBalance: '',
  interestRate: '',
  maturityDate: '',
  monthlyPayment: '',
  reserveBalance: '0',
  lienPosition: '',
  paidToDate: '',
  dueDate: '',
};

export function NewLoanForm() {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState(initialForm);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);

    const response = await fetch('/api/loans', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        ...form,
        principalBalance: Number(form.principalBalance),
        interestRate: Number(form.interestRate),
        monthlyPayment: Number(form.monthlyPayment),
        reserveBalance: Number(form.reserveBalance),
      }),
    });

    setSaving(false);
    if (!response.ok) return;

    setForm(initialForm);
    setOpen(false);
    router.refresh();
  }

  if (!open) {
    return <Button onClick={() => setOpen(true)}>New Loan</Button>;
  }

  return (
    <form onSubmit={onSubmit} className="grid gap-3 rounded-lg border border-slate-200 p-4">
      <div className="grid gap-3 md:grid-cols-2">
        <input className="rounded-md border border-slate-300 px-3 py-2" placeholder="Loan number" value={form.loanNumber} onChange={(e) => setForm({ ...form, loanNumber: e.target.value })} required />
        <input className="rounded-md border border-slate-300 px-3 py-2" placeholder="Borrower name" value={form.borrowerName} onChange={(e) => setForm({ ...form, borrowerName: e.target.value })} required />
      </div>
      <textarea className="min-h-24 rounded-md border border-slate-300 px-3 py-2" placeholder="Borrower address" value={form.borrowerAddress} onChange={(e) => setForm({ ...form, borrowerAddress: e.target.value })} required />
      <input className="rounded-md border border-slate-300 px-3 py-2" placeholder="Borrower email(s)" value={form.borrowerEmail} onChange={(e) => setForm({ ...form, borrowerEmail: e.target.value })} />
      <div className="grid gap-3 md:grid-cols-2">
        <input className="rounded-md border border-slate-300 px-3 py-2" placeholder="Property street" value={form.propertyStreet} onChange={(e) => setForm({ ...form, propertyStreet: e.target.value })} required />
        <input className="rounded-md border border-slate-300 px-3 py-2" placeholder="Property city" value={form.propertyCity} onChange={(e) => setForm({ ...form, propertyCity: e.target.value })} required />
        <input className="rounded-md border border-slate-300 px-3 py-2" placeholder="State" value={form.propertySt} onChange={(e) => setForm({ ...form, propertySt: e.target.value })} required />
        <input className="rounded-md border border-slate-300 px-3 py-2" placeholder="ZIP" value={form.propertyZip} onChange={(e) => setForm({ ...form, propertyZip: e.target.value })} required />
        <input className="rounded-md border border-slate-300 px-3 py-2" type="number" step="0.01" placeholder="Principal balance" value={form.principalBalance} onChange={(e) => setForm({ ...form, principalBalance: e.target.value })} required />
        <input className="rounded-md border border-slate-300 px-3 py-2" type="number" step="0.0001" placeholder="Interest rate" value={form.interestRate} onChange={(e) => setForm({ ...form, interestRate: e.target.value })} required />
        <input className="rounded-md border border-slate-300 px-3 py-2" type="date" placeholder="Maturity date" value={form.maturityDate} onChange={(e) => setForm({ ...form, maturityDate: e.target.value })} required />
        <input className="rounded-md border border-slate-300 px-3 py-2" type="number" step="0.01" placeholder="Monthly payment" value={form.monthlyPayment} onChange={(e) => setForm({ ...form, monthlyPayment: e.target.value })} required />
        <input className="rounded-md border border-slate-300 px-3 py-2" type="number" step="0.01" placeholder="Reserve balance" value={form.reserveBalance} onChange={(e) => setForm({ ...form, reserveBalance: e.target.value })} required />
        <select className="rounded-md border border-slate-300 px-3 py-2" value={form.lienPosition} onChange={(e) => setForm({ ...form, lienPosition: e.target.value })}>
          {lienOptions.map((option) => <option key={option || 'blank'} value={option}>{option || 'None'}</option>)}
        </select>
        <input className="rounded-md border border-slate-300 px-3 py-2" type="date" value={form.paidToDate} onChange={(e) => setForm({ ...form, paidToDate: e.target.value })} required />
        <input className="rounded-md border border-slate-300 px-3 py-2" type="date" value={form.dueDate} onChange={(e) => setForm({ ...form, dueDate: e.target.value })} />
      </div>
      <div className="flex gap-2">
        <Button type="submit" disabled={saving}>{saving ? 'Saving...' : 'Create Loan'}</Button>
        <Button type="button" variant="outline" onClick={() => setOpen(false)}>Cancel</Button>
      </div>
    </form>
  );
}
