
import React from 'react';
import { useData } from '../hooks/useData';

const Footer: React.FC = () => {
  const { state } = useData();
  const { contactInfo } = state.siteSettings;

  return (
    <footer className="bg-gray-800 py-6 mt-12">
      <div className="container mx-auto px-4 text-center text-gray-400">
        <div className="mb-4">
          <p className="font-bold text-lg text-yellow-400">DISCLAIMER</p>
          <p className="max-w-2xl mx-auto">
            This is not a gambling website. No money or transactions are involved — only for entertainment. Cricket Nagar Fantasy League (CNFL) is a simulation game for fun and friendly competition.
          </p>
        </div>
        {contactInfo && (
          <div className="mt-4 border-t border-gray-700 pt-4">
            <p className="font-bold text-md text-gray-200">Contact Info</p>
            <p className="max-w-2xl mx-auto whitespace-pre-line">{contactInfo}</p>
          </div>
        )}
        <p className="mt-6">&copy; {new Date().getFullYear()} Cricket Nagar Fantasy League. All Rights Reserved.</p>
      </div>
    </footer>
  );
};

export default Footer;
