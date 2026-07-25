import React from 'react';

export function Section({ title, description, children, border = true }) {
  return (
    <div className={`section sec ${border ? '' : 'no-border'}`}>
      <div className="sec-label">
        <h3>{title}</h3>
        <p>{description}</p>
      </div>
      <div className="sec-fields">
        {children}
      </div>
    </div>
  );
}

export function Field({ label, error, children, full = false, required = false, readonly = false }) {
  return (
    <div className={`field ${full ? 'full' : ''} ${readonly ? 'readonly' : ''}`}>
      <label>
        {label}
        {required && <span className="req">*</span>}
      </label>
      {children}
      {error && (
        <span className="field-error">
          <svg style={{ width: '12px', height: '12px' }} fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          {error}
        </span>
      )}
    </div>
  );
}

// Since the CSS handles styling of inputs, we just return empty string or pass it down.
// For backwards compatibility with the existing forms, we just return empty strings so they don't add random classes.
export const InputCls = (error) => error ? 'has-error' : '';
export const TextareaCls = (error) => error ? 'has-error' : '';
