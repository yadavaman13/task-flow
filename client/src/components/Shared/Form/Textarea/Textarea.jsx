import './Textarea.scss';

export default function Textarea({
  label,
  name,
  value,
  onChange,
  error,
  rows = 3,
  placeholder,
  disabled = false,
  required = false,
  className = '',
  id,
  ...rest
}) {
  const textareaId = id || name;

  return (
    <div className={`form-field ${error ? 'form-field--error' : ''} ${className}`}>
      {label && (
        <label htmlFor={textareaId} className="form-field__label">
          {label}
          {required && <span className="form-field__required">*</span>}
        </label>
      )}
      <textarea
        id={textareaId}
        name={name}
        value={value ?? ''}
        onChange={onChange}
        rows={rows}
        placeholder={placeholder}
        disabled={disabled}
        required={required}
        className="form-field__textarea"
        {...rest}
      />
      {error && <span className="form-field__error">{error}</span>}
    </div>
  );
}
