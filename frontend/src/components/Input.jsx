// src/components/Input.jsx
import React from 'react';

const Input = ({ label, type = 'text', value, onChange }) => (
  <div style={{ marginBottom: '1rem' }}>
    <label style={{ display: 'block', marginBottom: '0.5rem' }}>{label}</label>
    <input
      type={type}
      value={value}
      onChange={onChange}
      style={{
        padding: '0.5rem',
        width: '100%',
        border: '1px solid #ccc',
        borderRadius: '4px',
      }}
    />
  </div>
);

export default Input;
