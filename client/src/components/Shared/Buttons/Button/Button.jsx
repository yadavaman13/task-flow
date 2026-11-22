import { Loader2 } from 'lucide-react';
import './Button.scss';

export default function Button({
  children,
  variant = 'primary',
  size = 'md',
  icon: Icon,
  loading = false,
  disabled = false,
  type = 'button',
  onClick,
  className = '',
  ...rest
}) {
  const isDisabled = disabled || loading;

  return (
    <button
      type={type}
      className={`btn btn--${variant} btn--${size} ${className}`}
      onClick={onClick}
      disabled={isDisabled}
      {...rest}
    >
      {loading ? (
        <Loader2 className="btn__spinner" size={16} />
      ) : Icon ? (
        <Icon className="btn__icon" size={16} />
      ) : null}
      {children && <span className="btn__text">{children}</span>}
    </button>
  );
}
