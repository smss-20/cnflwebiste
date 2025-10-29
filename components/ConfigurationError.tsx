import React from 'react';

interface ConfigurationErrorProps {
  title: string;
  description: string;
}

const ConfigurationError: React.FC<ConfigurationErrorProps> = ({ title, description }) => {
  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-900 text-white p-4">
      <div className="max-w-2xl w-full bg-red-900/50 border-2 border-red-500 rounded-lg p-8 text-center shadow-2xl">
        <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 mx-auto text-red-400 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
        </svg>
        <h1 className="text-3xl font-bold text-red-300 mb-2">{title}</h1>
        <p className="text-lg text-red-200 mb-6">{description}</p>
        <div className="text-left bg-gray-800 p-4 rounded-md font-mono text-sm">
          <p className="text-gray-400">Action Required:</p>
          <p className="mt-2">1. Read the setup guide: <code className="bg-gray-700 px-1 rounded">gihub_vcxel_supabase.txt</code></p>
          <p className="mt-1">2. Edit the configuration file: <code className="bg-gray-700 px-1 rounded">supabase/client.ts</code></p>
        </div>
      </div>
    </div>
  );
};

export default ConfigurationError;
