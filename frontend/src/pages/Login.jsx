import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import './Login.css';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setErrorMessage('');

    const result = await login(email, password);

    if (result.success) {
      setTimeout(() => {
        navigate('/dashboard');
      }, 500);
    } else {
      setErrorMessage(result.message);
      setIsLoading(false);
    }
  };

  return (
    <div className="login-container">
      <div className="background">
        <div className="shape"></div>
        <div className="shape"></div>
        <div className="shape"></div>
      </div>

      <form className="login-form" onSubmit={handleSubmit}>
        <h1 className="login-title">Welcome Back</h1>
        <p className="login-subtitle">Please login to your account</p>

        {errorMessage && (
          <div className="error-message">
            <span>⚠️</span> {errorMessage}
          </div>
        )}

        <div className="input-group">
          <label htmlFor="email">Email Address</label>
          <div className="input-wrapper">
            <span className="input-icon">📧</span>
            <input
              type="email"
              id="email"
              placeholder="admin@ecommerce.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              disabled={isLoading}
            />
          </div>
        </div>

        <div className="input-group">
          <label htmlFor="password">Password</label>
          <div className="input-wrapper">
            <span className="input-icon">🔒</span>
            <input
              type="password"
              id="password"
              placeholder="Enter your password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              disabled={isLoading}
            />
          </div>
        </div>

        <button 
          type="submit" 
          className={`login-button ${isLoading ? 'loading' : ''}`}
          disabled={isLoading}
        >
          {isLoading ? (
            <>
              <span className="spinner"></span>
              Logging in...
            </>
          ) : (
            'Login'
          )}
        </button>

        <div className="demo-credentials">
          <p>🎯 Demo Credentials:</p>
          <p><strong>Email:</strong> admin@ecommerce.com</p>
          <p><strong>Password:</strong> Admin@123</p>
        </div>
      </form>
    </div>
  );
};

export default Login;