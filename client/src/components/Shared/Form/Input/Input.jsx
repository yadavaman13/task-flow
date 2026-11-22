import './Input.scss';

export default function Input({
  label,
  name,
  type = 'text',
  value,
  onChange,
  error,
  placeholder,
  disabled = false,
  required = false,
  className = '',
  id,
  ...rest
}) {
  const inputId = id || name;

  return (
    <div className={`form-field ${error ? 'form-field--error' : ''} ${className}`}>
      {label && (
        <label htmlFor={inputId} className="form-field__label">
          {label}
          {required && <span className="form-field__required">*</span>}
        </label>
      )}
      <input
        id={inputId}
        name={name}
        type={type}
        value={value ?? ''}
        onChange={onChange}
        placeholder={placeholder}
        disabled={disabled}
        required={required}
        className="form-field__input"
        {...rest}
      />
      {error && <span className="form-field__error">{error}</span>}
    </div>
  );
}
