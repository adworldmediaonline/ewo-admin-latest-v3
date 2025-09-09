import { cn } from '@/lib/utils';
import { AlertCircle, AlertTriangle, CheckCircle, Info } from 'lucide-react';

type ErrorType = {
  msg: string;
  type?: 'error' | 'warning' | 'info' | 'success';
  size?: 'sm' | 'md' | 'lg';
  showIcon?: boolean;
  className?: string;
};

const ErrorMsg = ({
  msg,
  type = 'error',
  size = 'sm',
  showIcon = true,
  className,
}: ErrorType) => {
  if (!msg) return null;

  const iconMap = {
    error: AlertCircle,
    warning: AlertTriangle,
    info: Info,
    success: CheckCircle,
  };

  const colorMap = {
    error: 'text-destructive',
    warning: 'text-amber-600',
    info: 'text-blue-600',
    success: 'text-green-600',
  };

  const sizeMap = {
    sm: 'text-xs',
    md: 'text-sm',
    lg: 'text-base',
  };

  const Icon = iconMap[type];

  return (
    <div
      className={cn(
        'flex items-start gap-2 p-2 rounded-md transition-all duration-200',
        {
          'bg-destructive/10 border border-destructive/20': type === 'error',
          'bg-amber-50 border border-amber-200': type === 'warning',
          'bg-blue-50 border border-blue-200': type === 'info',
          'bg-green-50 border border-green-200': type === 'success',
        },
        className
      )}
      role={type === 'error' ? 'alert' : 'status'}
      aria-live={type === 'error' ? 'assertive' : 'polite'}
    >
      {showIcon && Icon && (
        <Icon
          size={size === 'sm' ? 14 : size === 'md' ? 16 : 18}
          className={cn('flex-shrink-0 mt-0.5', colorMap[type])}
          aria-hidden="true"
        />
      )}
      <span
        className={cn(
          'leading-relaxed font-medium',
          colorMap[type],
          sizeMap[size]
        )}
      >
        {msg}
      </span>
    </div>
  );
};

export default ErrorMsg;
