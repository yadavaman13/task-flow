import { useState, useEffect } from 'react';
import { User } from 'lucide-react';
import { formatInitials } from '@/utils/formatters';
import './Avatar.scss';

export default function Avatar({
  src,
  name = '',
  email = '',
  size = 'md',
  alt = '',
  className = '',
  ...props
}) {
  const [imgError, setImgError] = useState(false);

  useEffect(() => {
    setImgError(false);
  }, [src]);

  const initials = formatInitials(name || email || '');
  const sizeClass = `avatar--${size}`;

  return (
    <div className={`avatar ${sizeClass} ${className}`.trim()} {...props}>
      {src && !imgError ? (
        <img
          src={src}
          alt={alt || name || 'User avatar'}
          className="avatar__img"
          onError={() => setImgError(true)}
        />
      ) : (
        <span className="avatar__fallback">
          {initials || <User size={size === 'xs' ? 12 : size === 'sm' ? 14 : size === 'lg' ? 20 : size === 'xl' ? 26 : size === '2xl' ? 32 : 16} />}
        </span>
      )}
    </div>
  );
}
