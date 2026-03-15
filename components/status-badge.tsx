import { AlertTriangle, CheckCircle2, XCircle } from 'lucide-react';
import { loanStatusMeta } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';

export function StatusBadge({ maturityDate, dueDate }: { maturityDate: Date | string; dueDate?: Date | string | null }) {
  const status = loanStatusMeta(maturityDate, dueDate);

  const style = {
    green: 'bg-emerald-100 text-emerald-700',
    red: 'bg-red-100 text-red-700',
    yellow: 'bg-amber-100 text-amber-700',
  }[status.tone];

  const icon = {
    green: <CheckCircle2 className="mr-1 h-3.5 w-3.5" />,
    red: <XCircle className="mr-1 h-3.5 w-3.5" />,
    yellow: <AlertTriangle className="mr-1 h-3.5 w-3.5" />,
  }[status.tone];

  return <Badge className={style}>{icon}{status.label}</Badge>;
}
