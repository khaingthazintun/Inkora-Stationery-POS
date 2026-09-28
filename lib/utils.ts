import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { OrderStatus } from './types';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatMMK(amount: number): string {
  return `${amount.toLocaleString('en-US')} MMK`;
}

export function formatDate(dateString: string): string {
  try {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    }).format(date);
  } catch {
    return dateString;
  }
}

export function generateOrderNumber(): string {
  const randomNum = Math.floor(10000 + Math.random() * 90000);
  return `INK-${randomNum}`;
}

export function getStockStatus(stock: number): {
  label: string;
  badgeClass: string;
  textClass: string;
  isAvailable: boolean;
} {
  if (stock <= 0) {
    return {
      label: 'Out of Stock',
      badgeClass: 'bg-red-50 text-red-700 border-red-200',
      textClass: 'text-red-600',
      isAvailable: false,
    };
  }
  if (stock <= 10) {
    return {
      label: `Low Stock (${stock} left)`,
      badgeClass: 'bg-amber-50 text-amber-700 border-amber-200',
      textClass: 'text-amber-600',
      isAvailable: true,
    };
  }
  return {
    label: `In Stock (${stock})`,
    badgeClass: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    textClass: 'text-emerald-600',
    isAvailable: true,
  };
}

export function getOrderStatusConfig(status: OrderStatus | string): {
  label: string;
  badgeClass: string;
  stepIndex: number;
} {
  switch (status?.toLowerCase()) {
    case 'pending':
      return {
        label: 'Pending',
        badgeClass: 'bg-amber-50 text-amber-800 border-amber-200',
        stepIndex: 0,
      };
    case 'processing':
      return {
        label: 'Processing',
        badgeClass: 'bg-blue-50 text-blue-800 border-blue-200',
        stepIndex: 1,
      };
    case 'completed':
    case 'delivered':
      return {
        label: 'Completed',
        badgeClass: 'bg-emerald-50 text-emerald-800 border-emerald-200',
        stepIndex: 2,
      };
    case 'cancelled':
      return {
        label: 'Cancelled',
        badgeClass: 'bg-rose-50 text-rose-800 border-rose-200',
        stepIndex: -1,
      };
    default:
      return {
        label: status || 'Pending',
        badgeClass: 'bg-stone-50 text-stone-800 border-stone-200',
        stepIndex: 0,
      };
  }
}
