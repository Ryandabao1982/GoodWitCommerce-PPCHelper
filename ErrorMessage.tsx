
import React from 'react';

interface ErrorMessageProps {
  message: string;
}

export const ErrorMessage: React.FC<ErrorMessageProps> = ({ message }) => {
  return (
    <div className="bg-red-50 dark:bg-red-900/50 border border-red-300 dark:border-red-700 text-red-700 dark:text-red-200 px-4 py-3 rounded-lg relative" role="alert">
        <div className="flex">
            <div className="py-1">
                <svg className="fill-current h-6 w-6 text-red-500 dark:text-red-400 mr-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20"><path d="M10 18a8 8 0 1 1 0 -16 8 8 0 0 1 0 16zm-1-5v2h2v-2h-2zm0-8v6h2V5h-2z"/></svg>
            </div>
            <div>
                <strong className="font-bold">An error occurred.</strong>
                <span className="block sm:inline ml-1">{message}</span>
            </div>
        </div>
    </div>
  );
};