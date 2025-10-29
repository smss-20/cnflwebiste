import React, { useState } from 'react';
import { useAuth } from '../hooks/useAuth';
import { useNavigate } from 'react-router-dom';

const AuthPage: React.FC = () => {
  const [isRegister, setIsRegister] = useState(false);
  const { login, register } = useAuth();
  const navigate = useNavigate();
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);

  // Common state
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  
  // Register specific state
  const [fullName, setFullName] = useState('');
  const [fbLink, setFbLink] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);

    if (isRegister) {
      if (password !== confirmPassword) {
        setError("Passwords do not match.");
        setLoading(false);
        return;
      }
      const { error: registerError } = await register(fullName, email, fbLink, password);
      if (registerError) {
        setError(registerError.message);
      } else {
        setSuccess("Registration successful! You are now logged in.");
        // The router in App.tsx will handle navigation once the user state changes.
        setTimeout(() => navigate('/participant'), 1000);
      }
    } else {
      const { error: loginError } = await login(email, password);
      if (loginError) {
        setError(loginError.message);
      } else {
        // Successful login, router will redirect
      }
    }
    setLoading(false);
  };

  return (
    <div className="flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8 bg-gray-800 p-10 rounded-xl shadow-lg">
        <div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-green-400">
            {isRegister ? 'Create your account' : 'Sign in to your account'}
          </h2>
          <p className="mt-2 text-center text-sm text-gray-400">
            Or{' '}
            <button onClick={() => setIsRegister(!isRegister)} className="font-medium text-green-500 hover:text-green-400">
              {isRegister ? 'sign in to an existing account' : 'create a new account'}
            </button>
          </p>
        </div>
        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          <div className="rounded-md shadow-sm -space-y-px">
            {isRegister && (
              <>
                 <input id="full-name" name="fullName" type="text" required value={fullName} onChange={e => setFullName(e.target.value)} className="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-700 bg-gray-900 placeholder-gray-500 text-white rounded-t-md focus:outline-none focus:ring-green-500 focus:border-green-500 focus:z-10 sm:text-sm" placeholder="Full Name" />
                 <input id="fb-link" name="fbLink" type="url" required value={fbLink} onChange={e => setFbLink(e.target.value)} className="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-700 bg-gray-900 placeholder-gray-500 text-white focus:outline-none focus:ring-green-500 focus:border-green-500 focus:z-10 sm:text-sm" placeholder="Facebook Profile Link" />
              </>
            )}
            <input id="email-address" name="email" type="email" autoComplete="email" required value={email} onChange={e => setEmail(e.target.value)} className={`appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-700 bg-gray-900 placeholder-gray-500 text-white ${isRegister ? '' : 'rounded-t-md'} focus:outline-none focus:ring-green-500 focus:border-green-500 focus:z-10 sm:text-sm`} placeholder="Email address" />
            <input id="password" name="password" type="password" autoComplete="current-password" required value={password} onChange={e => setPassword(e.target.value)} className={`appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-700 bg-gray-900 placeholder-gray-500 text-white ${isRegister ? '' : 'rounded-b-md'} focus:outline-none focus:ring-green-500 focus:border-green-500 focus:z-10 sm:text-sm`} placeholder="Password" />
            {isRegister && (
              <input id="confirm-password" name="confirmPassword" type="password" required value={confirmPassword} onChange={e => setConfirmPassword(e.target.value)} className="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-700 bg-gray-900 placeholder-gray-500 text-white rounded-b-md focus:outline-none focus:ring-green-500 focus:border-green-500 focus:z-10 sm:text-sm" placeholder="Confirm Password" />
            )}
          </div>
          
          {error && <p className="text-red-500 text-sm text-center">{error}</p>}
          {success && <p className="text-green-500 text-sm text-center">{success}</p>}

          <div>
            <button type="submit" disabled={loading} className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-800 focus:ring-green-500 disabled:bg-gray-500">
              {loading ? 'Processing...' : (isRegister ? 'Register' : 'Sign in')}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AuthPage;