import React from 'react';
import colors from '../theme/colors';

const Button = ({ children }) => {
  return (
    <button
      style={{
        padding: '0.5rem 1rem',
        backgroundColor: colors.primary,
        color: '#fff',
        border: 'none',
        borderRadius: '4px',
        cursor: 'pointer',
      }}
    >
      {children}
    </button>
  );
};

export default Button;
