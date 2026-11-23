import { useState } from 'react';
import { Eye, EyeOff } from 'lucide-react';
import './Input.scss';

export default function Input({
  label,
  name,
  type = 'text',
  value,
  onChange,
  error,
  helperText,
  placeholder,
  disabled = false,
  required = false,
  className = '',
  id,
  showPasswordToggle = type === 'password',
  ...rest
}) {
  const inputId = id || name;
  const [showPassword, setShowPassword] = useState(false);

  const isPassword = type === 'password';
  const effectiveType = isPassword && showPasswordToggle ? (showPassword ? 'text' : 'password') : type;

  return (
    <div className={`form-field ${error ? 'form-field--error' : ''} ${className}`}>
      {label && (
        <label htmlFor={inputId} className="form-field__label">
          {label}
          {required && <span className="form-field__required">*</span>}
        </label>
      )}
      <div className="form-field__input-wrapper">
        <input
          id={inputId}
          name={name}
          type={effectiveType}
          value={value ?? ''}
          onChange={onChange}
          placeholder={placeholder}
          disabled={disabled}
          required={required}
          className={`form-field__input ${isPassword && showPasswordToggle ? 'form-field__input--with-toggle' : ''}`}
          {...rest}
        />
        {isPassword && showPasswordToggle && (
          <button
            type="button"
            className="form-field__password-toggle"
            onClick={() => setShowPassword((prev) => !prev)}
            aria-label={showPassword ? 'Hide password' : 'Show password'}
            tabIndex={-1}
            disabled={disabled}
          >
            {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
          </button>
        )}
      </div>
      {error && <span className="form-field__error">{error}</span>}
      {helperText && !error && <span className="form-field__helper">{helperText}</span>}
    </div>
  );
}
