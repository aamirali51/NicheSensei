import React, { useState, useEffect } from 'react';
import { analyzeNicheOrChannel } from './services/geminiService';
import { AnalysisResult, LoadingState } from './types';
import { VideoAnalysis } from './components/VideoAnalysis';
import { StrategyPanel } from './components/StrategyPanel';
import { IconSearch, IconTrendingUp, IconUsers, IconSettings } from './components/Icons';

function App() {
  const [query, setQuery] = useState('');
  const [data, setData] = useState<AnalysisResult | null>(null);
  const [status, setStatus] = useState<LoadingState>('idle');
  const [apiKey, setApiKey] = useState('');
  const [showSettings, setShowSettings] = useState(false);
  const [activeTab, setActiveTab] = useState<'overview' | 'competitors' | 'strategy'>('overview');

  // Auto-load API Key if available in env (for dev)
  useEffect(() => {
    if (process.env.API_KEY) {
      setApiKey(process.env.API_KEY);
    }
  }, []);

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!query.trim()) return;
    if (!apiKey) {
      setShowSettings(true);
      return;
    }

    setStatus('analyzing');
    setData(null);

    try {
      const result = await analyzeNicheOrChannel(query, apiKey);
      setData(result);
      setStatus('success');
    } catch (error) {
      console.error(error);
      setStatus('error');
    }
  };

  const ExampleQueries = ["True Crime", "Meditation Music", "Tech Reviews", "MrBeast"];

  return (
    <div className="min-h-screen bg-slate-950 text-slate-200 selection:bg-purple-500 selection:text-white">
      {/* Header */}
      <header className="border-b border-slate-800 bg-slate-900/50 backdrop-blur-md sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-gradient-to-br from-purple-500 to-blue-600 rounded-lg flex items-center justify-center font-bold text-white">
              F
            </div>
            <span className="font-bold text-xl tracking-tight text-white">Faceless<span className="text-purple-400">Tube</span></span>
          </div>
          <button 
            onClick={() => setShowSettings(true)}
            className="p-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded-full transition-colors"
          >
            <IconSettings className="w-6 h-6" />
          </button>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-8">
        
        {/* Search Section */}
        <div className="max-w-2xl mx-auto mb-12 text-center">
          <h1 className="text-3xl md:text-5xl font-bold text-white mb-6">
            Find Your <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-blue-400">Viral Niche</span>
          </h1>
          <p className="text-slate-400 mb-8 text-lg">
            Analyze any channel or keyword to uncover hidden opportunities, outliers, and monetization strategies.
          </p>

          <form onSubmit={handleSearch} className="relative group">
            <div className="absolute inset-0 bg-gradient-to-r from-purple-500 to-blue-600 rounded-full blur opacity-25 group-hover:opacity-50 transition-opacity"></div>
            <div className="relative flex items-center bg-slate-900 border border-slate-700 rounded-full p-2 shadow-2xl">
              <IconSearch className="w-6 h-6 text-slate-500 ml-3" />
              <input 
                type="text" 
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Enter a Channel Name (e.g. MagnatesMedia) or Niche (e.g. Stoicism)"
                className="bg-transparent border-none outline-none flex-1 px-4 py-3 text-white placeholder-slate-500"
              />
              <button 
                type="submit"
                disabled={status === 'analyzing'}
                className="bg-white text-slate-900 px-6 py-3 rounded-full font-bold hover:bg-slate-200 transition-colors disabled:opacity-50"
              >
                {status === 'analyzing' ? 'Analyzing...' : 'Analyze'}
              </button>
            </div>
          </form>
          
          <div className="mt-4 flex flex-wrap justify-center gap-2">
            <span className="text-slate-500 text-sm">Try:</span>
            {ExampleQueries.map(q => (
              <button 
                key={q} 
                onClick={() => { setQuery(q); }}
                className="text-xs text-slate-400 border border-slate-800 px-3 py-1 rounded-full hover:border-purple-500 hover:text-purple-400 transition-colors"
              >
                {q}
              </button>
            ))}
          </div>
        </div>

        {/* Loading State */}
        {status === 'analyzing' && (
          <div className="flex flex-col items-center justify-center py-20 animate-pulse">
            <div className="w-16 h-16 border-4 border-purple-500 border-t-transparent rounded-full animate-spin mb-4"></div>
            <p className="text-slate-400">AI is crunching YouTube data & strategies...</p>
          </div>
        )}

        {/* Error State */}
        {status === 'error' && (
          <div className="text-center py-20">
            <p className="text-red-400 bg-red-900/20 inline-block px-4 py-2 rounded-lg border border-red-900">
              Analysis failed. Please check your API Key and try again.
            </p>
          </div>
        )}

        {/* Dashboard */}
        {status === 'success' && data && (
          <div className="animate-fade-in space-y-8">
            
            {/* Stats Header */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="bg-slate-800 p-6 rounded-xl border border-slate-700">
                <p className="text-slate-500 text-xs uppercase font-bold mb-1">Target</p>
                <h2 className="text-2xl font-bold text-white truncate">{data.channelProfile.name}</h2>
                <p className="text-emerald-400 text-sm">{data.channelProfile.subscriberCount} Subs</p>
              </div>
              <div className="bg-slate-800 p-6 rounded-xl border border-slate-700">
                <p className="text-slate-500 text-xs uppercase font-bold mb-1">Average Views</p>
                <h2 className="text-2xl font-bold text-white">{data.channelProfile.avgViews.toLocaleString()}</h2>
              </div>
              <div className="bg-slate-800 p-6 rounded-xl border border-slate-700">
                <p className="text-slate-500 text-xs uppercase font-bold mb-1">Potential RPM</p>
                <h2 className="text-2xl font-bold text-blue-400">{data.globalMonetization.avgRPM}</h2>
              </div>
              <div className="bg-slate-800 p-6 rounded-xl border border-slate-700">
                <p className="text-slate-500 text-xs uppercase font-bold mb-1">Top Region</p>
                <h2 className="text-2xl font-bold text-white">{data.globalMonetization.topRegions[0]}</h2>
              </div>
            </div>

            {/* Navigation Tabs */}
            <div className="flex border-b border-slate-800">
              <button 
                onClick={() => setActiveTab('overview')}
                className={`px-6 py-4 font-medium text-sm transition-colors border-b-2 ${activeTab === 'overview' ? 'border-purple-500 text-white' : 'border-transparent text-slate-500 hover:text-slate-300'}`}
              >
                Videos & Outliers
              </button>
              <button 
                onClick={() => setActiveTab('strategy')}
                className={`px-6 py-4 font-medium text-sm transition-colors border-b-2 ${activeTab === 'strategy' ? 'border-purple-500 text-white' : 'border-transparent text-slate-500 hover:text-slate-300'}`}
              >
                Strategy & Niches
              </button>
              <button 
                onClick={() => setActiveTab('competitors')}
                className={`px-6 py-4 font-medium text-sm transition-colors border-b-2 ${activeTab === 'competitors' ? 'border-purple-500 text-white' : 'border-transparent text-slate-500 hover:text-slate-300'}`}
              >
                Competitor Intelligence
              </button>
            </div>

            {/* Tab Content */}
            <div className="min-h-[500px]">
              {activeTab === 'overview' && (
                <VideoAnalysis videos={data.videos} avgViews={data.channelProfile.avgViews} />
              )}

              {activeTab === 'strategy' && (
                <StrategyPanel subNiches={data.subNiches} strategies={data.contentStrategy} />
              )}

              {activeTab === 'competitors' && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div className="space-y-4">
                    <h3 className="text-xl font-semibold text-white flex items-center gap-2">
                      <IconUsers className="w-6 h-6 text-slate-400" />
                      Similar Channels
                    </h3>
                    <div className="space-y-4">
                      {data.competitors.map((comp, i) => (
                        <div key={i} className="bg-slate-800 p-4 rounded-xl border border-slate-700 flex items-start justify-between">
                          <div>
                            <h4 className="font-bold text-white">{comp.name}</h4>
                            <p className="text-sm text-slate-400">{comp.subscribers} Subscribers</p>
                            <p className="text-xs text-slate-500 mt-2">{comp.notes}</p>
                          </div>
                          <div className="text-right">
                            <span className="block text-2xl font-bold text-purple-400">{comp.similarityScore}%</span>
                            <span className="text-xs text-slate-500 uppercase">Match</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                  
                  <div className="space-y-4">
                    <h3 className="text-xl font-semibold text-white flex items-center gap-2">
                      <IconTrendingUp className="w-6 h-6 text-slate-400" />
                      Shadow Analysis (Copycats)
                    </h3>
                    <div className="space-y-4">
                      {data.shadowAnalysis.map((shadow, i) => (
                        <div key={i} className="bg-slate-800 p-4 rounded-xl border border-slate-700">
                          <div className="flex items-center gap-2 mb-2">
                            <span className={`px-2 py-0.5 rounded text-[10px] uppercase font-bold ${
                              shadow.performanceStatus === 'Better' ? 'bg-green-500/20 text-green-400' : 
                              shadow.performanceStatus === 'Worse' ? 'bg-red-500/20 text-red-400' : 'bg-slate-700 text-slate-400'
                            }`}>
                              Performed {shadow.performanceStatus}
                            </span>
                          </div>
                          <p className="text-sm text-slate-300">
                            Channel <span className="font-bold text-white">{shadow.copycatChannel}</span> copied the concept with:
                          </p>
                          <p className="text-white font-medium italic mt-1">"{shadow.copycatTitle}"</p>
                          <div className="mt-3 pt-3 border-t border-slate-700/50">
                            <p className="text-xs text-slate-500">
                              <span className="font-bold text-slate-400">Insight:</span> {shadow.similarityReason}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </div>

          </div>
        )}
      </main>

      {/* Settings Modal */}
      {showSettings && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-700 p-8 rounded-2xl w-full max-w-md shadow-2xl">
            <h2 className="text-2xl font-bold text-white mb-2">Configuration</h2>
            <p className="text-slate-400 mb-6 text-sm">To enable the AI analysis engine, please provide a Gemini API Key.</p>
            
            <label className="block text-xs font-bold text-slate-500 uppercase mb-2">Google Gemini API Key</label>
            <input 
              type="password" 
              value={apiKey}
              onChange={(e) => setApiKey(e.target.value)}
              className="w-full bg-slate-800 border border-slate-700 text-white rounded-lg px-4 py-3 mb-6 focus:ring-2 focus:ring-purple-500 outline-none"
              placeholder="AIzaSy..."
            />
            
            <div className="flex gap-4">
              <button 
                onClick={() => setShowSettings(false)}
                className="flex-1 bg-slate-800 text-white font-bold py-3 rounded-lg hover:bg-slate-700 transition-colors"
              >
                Cancel
              </button>
              <button 
                onClick={() => {
                   if(apiKey) setShowSettings(false);
                }}
                className="flex-1 bg-purple-600 text-white font-bold py-3 rounded-lg hover:bg-purple-500 transition-colors disabled:opacity-50"
                disabled={!apiKey}
              >
                Save Key
              </button>
            </div>
            <p className="mt-4 text-xs text-center text-slate-600">
              The key is stored only in your browser's memory.
            </p>
          </div>
        </div>
      )}
    </div>
  );
}

export default App;
