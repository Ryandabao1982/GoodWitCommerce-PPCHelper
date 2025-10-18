import React from 'react';

export const Footer: React.FC = () => {
  return (
    <footer className="bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700 mt-auto">
      <div className="container mx-auto px-4 py-6">
        <div className="flex flex-col md:flex-row justify-between items-center text-sm text-gray-600 dark:text-gray-400">
          <p className="mb-2 md:mb-0">
            © 2024 Amazon PPC Keyword Genius - Made with ❤️ for Amazon sellers
          </p>
          <p>
            Version 1.4.0 | Powered by Google Gemini AI
          </p>
        </div>
      </div>
    </footer>
  );
};
