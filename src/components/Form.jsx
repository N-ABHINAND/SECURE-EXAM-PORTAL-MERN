import React from 'react';

export function Field({ label, children }) {
  return (
    <div style={{ marginBottom: 12 }}>
      <div className="label">{label}</div>
      {children}
    </div>
  );
}

export function Button({ variant = 'default', ...props }) {
  const cls = variant === 'primary' ? 'btn btn-primary' : variant === 'danger' ? 'btn btn-danger' : 'btn';
  return <button className={cls} {...props} />;
}

export function TextInput(props) {
  return <input className="input" {...props} />;
}

export function TextArea(props) {
  return <textarea className="input" rows={props.rows || 4} {...props} />;
}
