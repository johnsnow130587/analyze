
import React, { useState, useCallback } from 'react';
import { WebsiteInputForm } from './components/WebsiteInputForm';
import { AnalysisResultCard } from './components/AnalysisResultCard';
import { Loader } from './components/Loader';
import { type AnalysisResult } from './types';
import { analyzeWebsites } from './services/geminiService';
import { SparklesIcon } from './components/icons/SparklesIcon';
import { ExportButton } from './components/ExportButton';
import { ExportCsvButton } from './components/ExportCsvButton';

const initialUrls = ``;
const MAX_URLS = 500;

export default function App() {
  const [urls, setUrls] = useState<string>(initialUrls);
  const [analysisResults, setAnalysisResults] = useState<AnalysisResult[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [apiKey, setApiKey] = useState<string>('');
  const [mode, setMode] = useState<"fast" | "deep">("fast");

  const handleSubmit = useCallback(async () => {
    if (!apiKey.trim()) {
      setError("Please enter your Gemini API key.");
      return;
    }

    const urlList = urls.split('\n').map(url => url.trim()).filter(Boolean);
    if (urlList.length === 0) {
      setError("Please enter at least one URL.");
      return;
    }
    if (urlList.length > MAX_URLS) {
      setError(`You can analyze a maximum of ${MAX_URLS} URLs at a time.`);
      return;
    }

    setIsLoading(true);
    setError(null);
    setAnalysisResults([]);

    try {
      const results = await analyzeWebsites(urlList, apiKey.trim(), mode);
      setAnalysisResults(results);
    } catch (err) {
      console.error(err);
      setError(err instanceof Error ? err.message : "An unknown error occurred during analysis.");
    } finally {
      setIsLoading(false);
    }
  }, [urls, apiKey, mode]);

  return (
    <div className="min-h-screen bg-gray-900 text-white font-sans">
      <div className="relative isolate px-6 pt-14 lg:px-8">
        <div className="absolute inset-x-0 -top-40 -z-10 transform-gpu overflow-hidden blur-3xl sm:-top-80" aria-hidden="true">
          <div className="relative left-[calc(50%-11rem)] aspect-[1155/678] w-[36.125rem] -translate-x-1/2 rotate-[30deg] bg-gradient-to-tr from-[#ff80b5] to-[#9089fc] opacity-30 sm:left-[calc(50%-30rem)] sm:w-[72.1875rem]" style={{ clipPath: 'polygon(74.1% 44.1%, 100% 61.6%, 97.5% 26.9%, 85.5% 0.1%, 80.7% 2%, 72.5% 32.5%, 60.2% 62.4%, 52.4% 68.1%, 47.5% 58.3%, 45.2% 34.5%, 27.5% 76.7%, 0.1% 64.9%, 17.9% 100%, 27.6% 76.8%, 76.1% 97.7%, 74.1% 44.1%)' }}></div>
        </div>
        
        <header className="py-10 text-center">
          <h1 className="text-4xl md:text-5xl font-bold tracking-tight text-white flex items-center justify-center gap-3">
            <SparklesIcon className="w-10 h-10 text-indigo-400" />
            AI Website Traffic Analyzer
          </h1>
          <p className="mt-4 text-lg text-gray-400 max-w-2xl mx-auto">
            Paste a list of URLs to get AI-powered estimates on their niche, audience, and key performance metrics.
          </p>
        </header>

        <main className="container mx-auto px-4 py-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            <div className="lg:col-span-4 sticky top-8">
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-300 mb-1">
                  Gemini API key
                </label>
                <input
                  type="password"
                  value={apiKey}
                  onChange={(e) => setApiKey(e.target.value)}
                  placeholder="Enter your Gemini API key"
                  className="w-full rounded-md border border-gray-700 bg-gray-800 px-3 py-2 text-sm text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
                <p className="mt-1 text-xs text-gray-500">
                  Your key is used only in this browser session.
                </p>
              </div>
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-300 mb-1">
                  Analysis mode
                </label>
                <select
                  value={mode}
                  onChange={(e) => setMode(e.target.value as "fast" | "deep")}
                  className="w-full rounded-md border border-gray-700 bg-gray-800 px-3 py-2 text-sm text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                >
                  <option value="fast">Fast (good for many URLs)</option>
                  <option value="deep">Deep (slower, more detailed)</option>
                </select>
                <p className="mt-1 text-xs text-gray-500">
                  Deep mode uses a more powerful Gemini model for richer insights.
                </p>
              </div>
              <WebsiteInputForm 
                urls={urls} 
                setUrls={setUrls} 
                onSubmit={handleSubmit} 
                isLoading={isLoading} 
                maxUrls={MAX_URLS}
              />
            </div>

            <div className="lg:col-span-8">
              {isLoading && (
                <div className="flex flex-col items-center justify-center h-96 bg-gray-800/50 rounded-lg">
                  <Loader />
                  <p className="mt-4 text-lg text-gray-300 animate-pulse">Analyzing websites...</p>
                </div>
              )}
              
              {error && (
                <div className="bg-red-900/50 border border-red-700 text-red-300 px-4 py-3 rounded-lg" role="alert">
                  <strong className="font-bold">Error: </strong>
                  <span className="block sm:inline">{error}</span>
                </div>
              )}

              {!isLoading && analysisResults.length > 0 && (
                <>
                  <div className="mb-6 flex justify-end gap-4">
                    <ExportCsvButton results={analysisResults} />
                    <ExportButton />
                  </div>
                  <div id="results-container" className="space-y-6">
                    {analysisResults.map((result, index) => (
                      <AnalysisResultCard key={index} result={result} index={index} />
                    ))}
                  </div>
                </>
              )}

              {!isLoading && !error && analysisResults.length === 0 && (
                <div className="flex flex-col items-center justify-center h-96 bg-gray-800/50 rounded-lg p-8 text-center border-2 border-dashed border-gray-700">
                    <h2 className="text-2xl font-semibold text-gray-300">Analysis Results Will Appear Here</h2>
                    <p className="mt-2 text-gray-500">Enter some website URLs and click "Analyze" to get started.</p>
                </div>
              )}
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
