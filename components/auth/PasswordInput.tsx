import React, { useState } from 'react';
import { useLocale } from 'next-intl';

interface PasswordInputProps {
  value: string;
  onChange: (value: string) => void;
  label?: string;
  placeholder?: string;
  onError?: (error: string | null) => void;
}

function validatePassword(password: string): string | null {
  if (password.length < 8) return 'Password must be at least 8 characters.';
  if (/\s/.test(password)) return 'Password must not contain spaces.';
  if (!/[A-Za-z]/.test(password)) return 'Password must contain an English letter.';
  if (!/[0-9]/.test(password)) return 'Password must contain a number.';
  if (!/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password)) return 'Password must contain a special character.';
  if (/[^A-Za-z0-9!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password)) return 'Password must only contain English letters, numbers, and special characters.';
  return null;
}

const PasswordInput: React.FC<PasswordInputProps> = ({ value, onChange, label, placeholder, onError }) => {
  const [touched, setTouched] = useState(false);
  const [show, setShow] = useState(false);
  const locale = useLocale();
  const isRtl = locale === 'fa' || locale === 'fa-IR' || locale === 'ar' || locale === 'ar-AE';
  const validationError = touched ? validatePassword(value) : null;

  // Notify parent of error
  React.useEffect(() => {
    if (onError) onError(validationError);
    // eslint-disable-next-line
  }, [validationError, onError]);

  return (
    <div className="w-full relative">
      {label && <label className="mb-1 block text-sm font-medium">{label}</label>}
      <div className="relative flex items-center">
        <input
          type={show ? "text" : "password"}
          value={value}
          onChange={e => onChange(e.target.value)}
          onBlur={() => setTouched(true)}
          placeholder={placeholder}
          className={`w-full rounded border px-3 py-2 focus:border-blue-500 focus:outline-none`}
          autoComplete="new-password"
          inputMode="text"
          style={{ WebkitTextSecurity: show ? 'none' : 'disc' }}
          /* Hide default reveal icon in Chrome/Edge/Opera */
          css={{
            '::-ms-reveal': { display: 'none' },
            '::-webkit-credentials-auto-fill-button': { display: 'none' },
            '::-webkit-input-decoration': { display: 'none' },
          }}
        />
        <button
          type="button"
          tabIndex={-1}
          className={`absolute top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 ${isRtl ? 'left-3' : 'right-3'}`}
          onClick={() => setShow(s => !s)}
          aria-label={show ? "Hide password" : "Show password"}
          style={isRtl ? { left: '0.75rem' } : { right: '0.75rem' }}
        >
          {show ? (
            <svg width="20" height="20" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.94 17.94A10.06 10.06 0 0112 19c-5 0-9.27-3.11-10.44-7.44a1.99 1.99 0 010-1.12A10.06 10.06 0 016.06 6.06m1.42-1.42A9.98 9.98 0 0112 5c5 0 9.27 3.11 10.44 7.44a1.99 1.99 0 010 1.12A10.06 10.06 0 0117.94 17.94M9.88 9.88a3 3 0 104.24 4.24" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3l18 18" /></svg>
          ) : (
            <svg width="20" height="20" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.477 0 8.268 2.943 9.542 7-.274.857-.687 1.664-1.22 2.39M15.535 15.535A9.96 9.96 0 0112 17c-4.477 0-8.268-2.943-9.542-7a9.96 9.96 0 012.39-3.535" /></svg>
          )}
        </button>
      </div>
    </div>
  );
};

export default PasswordInput;
