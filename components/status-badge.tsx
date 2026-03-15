import { CheckCircle2, CircleSlash, XCircle } from 'lucide-react';
import { deriveLoanStatus } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';

export function StatusBadge({ status, dueDate }: { status: string; dueDate?: Date | string | null }) {
  const resolved = deriveLoanStatus({ status, dueDate });

  const style = {
    green: 'bg-emerald-100 text-emerald-700',
    red: 'bg-red-100 text-red-700',
    slate: 'bg-slate-200 text-slate-700',
  }[resolved.tone];

  const icon = {
    green: <CheckCircle2 className="mr-1 h-3.5 w-3.5" />,
    red: <XCircle className="mr-1 h-3.5 w-3.5" />,
    slate: <CircleSlash className="mr-1 h-3.5 w-3.5" />,
  }[resolved.tone];

  return <Badge className={style}>{icon}{resolved.label}</Badge>;
}
