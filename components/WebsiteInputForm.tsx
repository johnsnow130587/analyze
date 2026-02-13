
import React, { useState, useEffect } from 'react';

interface WebsiteInputFormProps {
  urls: string;
  setUrls: (urls: string) => void;
  onSubmit: () => void;
  isLoading: boolean;
  maxUrls: number;
}

export const WebsiteInputForm: React.FC<WebsiteInputFormProps> = ({ urls, setUrls, onSubmit, isLoading, maxUrls }) => {
  const [currentUrlCount, setCurrentUrlCount] = useState(0);
  const [isOverLimit, setIsOverLimit] = useState(false);

  useEffect(() => {
    const count = urls.split('\n').map(url => url.trim()).filter(Boolean).length;
    setCurrentUrlCount(count);
    setIsOverLimit(count > maxUrls);
  }, [urls, maxUrls]);
  
  return (
    <div className="bg-gray-800/60 backdrop-blur-sm border border-gray-700 rounded-lg p-6 shadow-2xl">
      <h2 className="text-xl font-semibold text-white mb-4">Websites to Analyze</h2>
      <p className="text-sm text-gray-400 mb-4">Enter one URL per line. The more URLs, the longer the analysis will take.</p>
      
      <textarea
        value={urls}
        onChange={(e) => setUrls(e.target.value)}
        placeholder="e.g.&#10;https://www.google.com&#10;https://www.github.com"
        className="w-full h-64 p-3 bg-gray-900 border border-gray-600 rounded-md text-gray-300 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors duration-200 resize-y"
        disabled={isLoading}
      />
      
      <div className={`text-right text-sm mt-2 font-medium ${isOverLimit ? 'text-red-400' : 'text-gray-400'}`}>
          {currentUrlCount} / {maxUrls}
      </div>

      <button
        onClick={onSubmit}
        disabled={isLoading || isOverLimit}
        className="mt-4 w-full flex justify-center items-center px-6 py-3 border border-transparent text-base font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:bg-indigo-900 disabled:text-gray-400 disabled:cursor-not-allowed transition-all duration-200"
      >
        {isLoading ? (
          <>
            <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            Analyzing...
          </>
        ) : (
          'Analyze Websites'
        )}
      </button>
    </div>
  );
};