import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { format } from 'date-fns';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatCurrency(value: number | null | undefined) {
  return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(value ?? 0);
}

export function formatPercent(value: number | null | undefined) {
  return `${((value ?? 0) * 100).toFixed(2)}%`;
}

export function formatDate(value: Date | string | null | undefined) {
  if (!value) return 'N/A';
  return format(new Date(value), 'MMM d, yyyy');
}

export function formatDateInput(value: Date | string | null | undefined) {
  if (!value) return '';
  const date = new Date(value);
  return new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate())).toISOString().slice(0, 10);
}

export function addMonthsUtc(date: Date | string, months: number) {
  const current = new Date(date);
  return new Date(Date.UTC(current.getUTCFullYear(), current.getUTCMonth() + months, current.getUTCDate()));
}

export function firstDayOfNextMonthUtc(date: Date | string) {
  const current = new Date(date);
  return new Date(Date.UTC(current.getUTCFullYear(), current.getUTCMonth() + 1, 1));
}

export function daysBetweenUtc(start: Date | string, end: Date | string) {
  const startDate = new Date(start);
  const endDate = new Date(end);
  return Math.max(0, Math.round((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24)));
}

export function roundCurrency(value: number) {
  return Number(value.toFixed(2));
}

export function deriveLoanStatus({
  status,
  dueDate,
}: {
  status: string;
  dueDate?: Date | string | null;
}) {
  if (status === 'MATURED' || status === 'PAID_OFF') {
    return { label: status === 'PAID_OFF' ? 'Paid Off' : 'Matured', tone: 'slate' as const };
  }

  if (!dueDate) {
    return { label: 'Current', tone: 'green' as const };
  }

  const now = new Date();
  const due = new Date(dueDate);

  if (now.getTime() > due.getTime()) {
    return { label: 'Past Due', tone: 'red' as const };
  }

  return { label: 'Current', tone: 'green' as const };
}
