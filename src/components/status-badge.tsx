import type { OrderStatus } from '@/lib/types';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { Circle, CheckCircle2, Truck, RefreshCw, XCircle } from 'lucide-react';

type StatusBadgeProps = {
  status: OrderStatus;
  className?: string;
};

const statusConfig: Record<OrderStatus, { label: string; icon: React.ReactNode; className: string }> = {
  Pending: {
    label: 'Pending',
    icon: <Circle className="h-3 w-3" />,
    className: 'bg-chart-4/20 text-chart-4 border-chart-4/30 hover:bg-chart-4/30',
  },
  Processing: {
    label: 'Processing',
    icon: <RefreshCw className="h-3 w-3 animate-spin" />,
    className: 'bg-primary/20 text-primary border-primary/30 hover:bg-primary/30',
  },
  Shipped: {
    label: 'Shipped',
    icon: <Truck className="h-3 w-3" />,
    className: 'bg-accent/80 text-accent-foreground border-accent/30 hover:bg-accent',
  },
  Delivered: {
    label: 'Delivered',
    icon: <CheckCircle2 className="h-3 w-3" />,
    className: 'bg-chart-2/20 text-chart-2 border-chart-2/30 hover:bg-chart-2/30',
  },
  Cancelled: {
    label: 'Cancelled',
    icon: <XCircle className="h-3 w-3" />,
    className: 'bg-destructive/20 text-destructive border-destructive/30 hover:bg-destructive/30',
  },
};

export function StatusBadge({ status, className }: StatusBadgeProps) {
  const config = statusConfig[status];
  if (!config) return null;

  return (
    <Badge variant="outline" className={cn('gap-1.5 pl-2 font-medium', config.className, className)}>
      {config.icon}
      <span>{config.label}</span>
    </Badge>
  );
}
