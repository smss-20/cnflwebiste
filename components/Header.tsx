
import React, { useContext } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { AuthContext } from '../contexts/AuthContext';
import { UserRole } from '../types';
import { useData } from '../hooks/useData';

const Header: React.FC = () => {
  const authContext = useContext(AuthContext);
  const navigate = useNavigate();
  const { state } = useData();
  const { siteLogo } = state.siteSettings;


  if (!authContext) return null;
  const { user, logout } = authContext;

  const handleLogout = async () => {
    await logout();
    navigate('/');
  };

  return (
    <header className="bg-gray-800/50 backdrop-blur-sm shadow-lg sticky top-0 z-50">
      <div className="container mx-auto px-4 py-3 flex justify-between items-center">
        <Link to="/" className="text-xl md:text-2xl font-bold text-green-400 flex items-center">
          {siteLogo ? (
            <img src={siteLogo} alt="CNFL Logo" className="h-12 max-w-xs object-contain" />
          ) : (
            <div>
              <h1>Cricket Nagar Fantasy League</h1>
              <p className="text-xs text-gray-400 hidden sm:block">Build your dream team — play for fun, not for money!</p>
            </div>
          )}
        </Link>
        <nav className="flex items-center space-x-2 md:space-x-4">
          <Link to="/" className="text-gray-300 hover:text-green-400 transition-colors text-sm md:text-base">Home</Link>
          {user ? (
            <>
              {user.role === UserRole.ADMIN && (
                <Link to="/admin" className="text-gray-300 hover:text-green-400 transition-colors text-sm md:text-base">Admin</Link>
              )}
              {user.role === UserRole.PARTICIPANT && (
                <Link to="/participant" className="text-gray-300 hover:text-green-400 transition-colors text-sm md:text-base">Dashboard</Link>
              )}
              <button
                onClick={handleLogout}
                className="bg-red-600 hover:bg-red-700 text-white font-bold py-2 px-3 rounded-md text-sm md:text-base transition-colors"
              >
                Logout
              </button>
            </>
          ) : (
            <>
               <Link to="/auth" className="text-gray-300 hover:text-green-400 transition-colors text-sm md:text-base">Participant Login</Link>
               <Link to="/auth" className="bg-green-600 hover:bg-green-700 text-white font-bold py-2 px-3 rounded-md text-sm md:text-base transition-colors">Admin Login</Link>
            </>
          )}
        </nav>
      </div>
    </header>
  );
};

export default Header;