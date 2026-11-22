import './Spinner.scss';

export default function Spinner({ size = 'md', className = '' }) {
  return (
    <div className={`spinner-wrapper ${className}`}>
      <div className={`spinner spinner--${size}`} role="status" aria-label="Loading">
        <span className="sr-only">Loading...</span>
      </div>
    </div>
  );
}
