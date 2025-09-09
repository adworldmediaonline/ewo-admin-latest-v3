import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { AlertCircle, CheckCircle2, Eye, EyeOff } from 'lucide-react';
import { useState } from 'react';
import { FieldErrors, UseFormRegister } from 'react-hook-form';
import ErrorMsg from '../common/error-msg';

export default function FormField({
  title,
  isRequired,
  bottomTitle,
  type = 'text',
  placeHolder,
  register,
  errors,
  defaultValue,
  step,
  icon,
  showPasswordToggle = false,
}: {
  title: string;
  isRequired: boolean;
  bottomTitle?: string;
  type?: string;
  placeHolder: string;
  register: UseFormRegister<any>;
  errors: FieldErrors<any>;
  defaultValue?: string | number;
  step?: string | number;
  icon?: React.ReactNode;
  showPasswordToggle?: boolean;
}) {
  const [showPassword, setShowPassword] = useState(false);
  const fieldName = title.split(' ').join('_');
  const fieldError = errors?.[fieldName];
  const hasError = !!fieldError;
  const fieldValue = defaultValue;

  // Determine input state
  const inputType = showPasswordToggle && showPassword ? 'text' : type;

  return (
    <div className="space-y-2">
      {/* Label */}
      {title && (
        <Label
          htmlFor={fieldName}
          className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 flex items-center gap-1"
        >
          {title}
          {isRequired && <span className="text-destructive">*</span>}
          {icon && <span className="text-muted-foreground">{icon}</span>}
        </Label>
      )}

      {/* Input Container */}
      <div className="relative">
        <Input
          {...register(fieldName, {
            required: isRequired ? `${title} is required!` : false,
          })}
          type={inputType}
          id={fieldName}
          placeholder={placeHolder}
          defaultValue={defaultValue}
          step={step}
          className={`transition-all duration-200 ${
            hasError
              ? 'border-destructive focus:border-destructive focus:ring-destructive/20'
              : fieldValue
              ? 'border-green-500 focus:border-green-500 focus:ring-green-500/20'
              : 'focus:border-primary focus:ring-primary/20'
          } ${icon ? 'pl-10' : ''} ${showPasswordToggle ? 'pr-10' : ''}`}
          aria-describedby={
            bottomTitle ? `${fieldName}-description` : undefined
          }
          aria-invalid={hasError}
        />

        {/* Left Icon */}
        {icon && (
          <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground">
            {icon}
          </div>
        )}

        {/* Password Toggle */}
        {showPasswordToggle && (
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute right-3 top-1/2 transform -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
            aria-label={showPassword ? 'Hide password' : 'Show password'}
          >
            {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
          </button>
        )}

        {/* Success/Error Icon */}
        {(hasError || (fieldValue && !hasError)) && (
          <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
            {hasError ? (
              <AlertCircle size={16} className="text-destructive" />
            ) : (
              <CheckCircle2 size={16} className="text-green-500" />
            )}
          </div>
        )}
      </div>

      {/* Error Message */}
      {hasError && <ErrorMsg msg={fieldError.message as string} />}

      {/* Helper Text */}
      {bottomTitle && !hasError && (
        <p
          id={`${fieldName}-description`}
          className="text-xs text-muted-foreground leading-relaxed"
        >
          {bottomTitle}
        </p>
      )}

      {/* Character Count for text inputs */}
      {type === 'text' && placeHolder && (
        <div className="text-xs text-muted-foreground text-right">
          {fieldValue?.toString().length || 0} / 100
        </div>
      )}
    </div>
  );
}
