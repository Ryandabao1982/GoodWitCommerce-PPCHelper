
import React from 'react';

export const Footer: React.FC = () => {
  return (
    <footer className="bg-gray-100 dark:bg-gray-900 mt-auto">
      <div className="container mx-auto px-4 py-4 text-center text-gray-500 text-sm">
        <p>Powered by Google Gemini</p>
        <p>&copy; {new Date().getFullYear()} Amazon PPC Keyword Genius. All rights reserved.</p>
      </div>
    </footer>
  );
};