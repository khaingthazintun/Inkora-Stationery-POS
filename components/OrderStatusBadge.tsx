import React from 'react';
import { OrderStatus } from '@/lib/types';
import { getOrderStatusConfig } from '@/lib/utils';
import { Clock, CheckCircle2, XCircle, RefreshCw } from 'lucide-react';

interface OrderStatusBadgeProps {
  status: OrderStatus | string;
  showIcon?: boolean;
}

export default function OrderStatusBadge({ status, showIcon = true }: OrderStatusBadgeProps) {
  const config = getOrderStatusConfig(status);

  const getIcon = () => {
    switch (status?.toLowerCase()) {
      case 'pending':
        return <Clock className="w-3.5 h-3.5 text-amber-700" />;
      case 'processing':
        return <RefreshCw className="w-3.5 h-3.5 text-blue-600 animate-spin" />;
      case 'completed':
      case 'delivered':
        return <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />;
      case 'cancelled':
        return <XCircle className="w-3.5 h-3.5 text-rose-600" />;
      default:
        return <Clock className="w-3.5 h-3.5 text-stone-500" />;
    }
  };

  return (
    <span
      className={`inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-semibold rounded-full border shadow-2xs ${config.badgeClass}`}
    >
      {showIcon && getIcon()}
      <span>{config.label}</span>
    </span>
  );
}
