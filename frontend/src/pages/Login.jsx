// src/pages/Login.jsx
import React, { useState } from 'react';
import Input from '../components/Input';
import colors from '../theme/colors';
import { loginUser } from '../api/authService';
import { useNavigate, Link } from 'react-router-dom';
import { toast } from 'react-toastify';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    try {
      const res = await loginUser({ email, password });
      localStorage.setItem('token', res.token);
      localStorage.setItem('user', JSON.stringify(res.user));
      console.log("Logged User Details: ", res.user);
      
      
      toast.success('Login Successful!');
      if (res.user.role === 'admin') {
        navigate('/admin-dashboard');
      }
      else if (res.user.role === 'user') {
        navigate('/user-dashboard');
      } 
    } catch (err) {
        const errorMessage = err.response?.data?.message || 'Login failed';
        setError(errorMessage);
        toast.error(error); // Show actual error message in toast
    }
  };

  return (
    <div style={containerStyle}>
      <h2>Login</h2>
      <form onSubmit={handleSubmit}>
        <Input label="Email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} />
        <Input label="Password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} />
        <button type="submit" style={buttonStyle}>Login</button>
      </form>

      <p style={{ marginTop: '1rem', textAlign: 'center' }}>
        Don't have an account?{' '}
        <Link to="/register" style={linkStyle}>Go to Register</Link>
      </p>
    </div>
  );
};

const containerStyle = {
  maxWidth: '400px',
  margin: 'auto',
  marginTop: '4rem',
  backgroundColor: colors.background,
  color: colors.text,
  padding: '2rem',
  borderRadius: '8px',
  boxShadow: `0 2px 8px ${colors.border}`,
};

const buttonStyle = {
  backgroundColor: colors.primary,
  color: '#fff',
  padding: '0.5rem 1rem',
  border: 'none',
  borderRadius: '4px',
  cursor: 'pointer',
  marginTop: '1rem',
  fontSize: '1rem',
};

const linkStyle = {
  color: colors.primary,
  textDecoration: 'underline',
  cursor: 'pointer',
};

export default Login;
