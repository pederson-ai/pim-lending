import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { format } from 'date-fns';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatCurrency(value: number) {
  return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(value ?? 0);
}

export function formatPercent(value: number) {
  return `${((value ?? 0) * 100).toFixed(2)}%`;
}

export function formatDate(value: Date | string | null | undefined) {
  if (!value) return '—';
  return format(new Date(value), 'MMM d, yyyy');
}

export function loanStatusMeta(maturityDate: Date | string, latestDueDate?: Date | string | null) {
  const now = new Date();
  const maturity = new Date(maturityDate);
  const due = latestDueDate ? new Date(latestDueDate) : null;
  const diffDays = Math.ceil((maturity.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));

  if (due && due < now) return { label: 'Past Due', tone: 'red' as const };
  if (diffDays <= 60) return { label: 'Maturing Soon', tone: 'yellow' as const };
  return { label: 'Current', tone: 'green' as const };
}
