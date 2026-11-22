import './Select.scss';

export default function Select({
  label,
  name,
  value,
  onChange,
  options = [],
  error,
  placeholder = 'Select an option',
  disabled = false,
  required = false,
  className = '',
  id,
  ...rest
}) {
  const selectId = id || name;

  return (
    <div className={`form-field ${error ? 'form-field--error' : ''} ${className}`}>
      {label && (
        <label htmlFor={selectId} className="form-field__label">
          {label}
          {required && <span className="form-field__required">*</span>}
        </label>
      )}
      <div className="select-wrapper">
        <select
          id={selectId}
          name={name}
          value={value ?? ''}
          onChange={onChange}
          disabled={disabled}
          required={required}
          className="form-field__select"
          {...rest}
        >
          {placeholder && (
            <option value="" disabled>
              {placeholder}
            </option>
          )}
          {options.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
      </div>
      {error && <span className="form-field__error">{error}</span>}
    </div>
  );
}
