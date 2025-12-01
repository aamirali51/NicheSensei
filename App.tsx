
import React, { useState, useEffect, useRef } from 'react';
import { analyzeNicheOrChannel, analyzeVideoDeepDive, analyzeChannelDeepDive } from './services/geminiService';
import { getChannelIdFromUrl, fetchRealChannelData } from './services/youtubeService';
import { exportAppState, importAppState } from './services/storageService';
import { AnalysisResult, LoadingState, DeepVideoReport, ChannelDrillDown, RealChannelData } from './types';
import { VideoAnalysis } from './components/VideoAnalysis';
import { StrategyPanel } from './components/StrategyPanel';
import { ForensicsModal } from './components/ForensicsModal';
import { ChannelDrillDownPanel } from './components/ChannelDrillDown';
import { LoadingOverlay } from './components/LoadingOverlay';
import { IconSearch, IconTrendingUp, IconUsers, IconSettings } from './components/Icons';

function App() {
  const [query, setQuery] = useState('');
  const [data, setData] = useState<AnalysisResult | null>(null);
  const [status, setStatus] = useState<LoadingState>('idle');
  const [loadingType, setLoadingType] = useState<'general' | 'video' | 'channel'>('general');
  const [apiKey, setApiKey] = useState('');
  const [youtubeApiKey, setYoutubeApiKey] = useState('');
  const [showSettings, setShowSettings] = useState(false);
  const [activeTab, setActiveTab] = useState<'overview' | 'competitors' | 'strategy'>('overview');
  
  // Advanced State
  const [videoReport, setVideoReport] = useState<DeepVideoReport | null>(null);
  const [channelDeepDive, setChannelDeepDive] = useState<ChannelDrillDown | null>(null);
  const [deepDiveLoading, setDeepDiveLoading] = useState(false);

  // File Input Ref for Import
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Auto-load API Key if available in env (for dev)
  useEffect(() => {
    if (process.env.API_KEY) {
      setApiKey(process.env.API_KEY);
    }
    // Note: Usually we don't put YouTube keys in process.env for client-side demo unless explicit
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
    setVideoReport(null);
    setChannelDeepDive(null);

    // Determine loading type based on query
    const isVideoUrl = query.includes('youtube.com/watch') || query.includes('youtu.be');
    setLoadingType(isVideoUrl ? 'video' : 'general');

    try {
      if (isVideoUrl) {
        const report = await analyzeVideoDeepDive(query, apiKey);
        setVideoReport(report);
        setStatus('success');
      } else {
        // HYBRID SEARCH LOGIC
        let realChannelData: RealChannelData | undefined;

        // Try to fetch REAL data if Youtube API Key is present AND it looks like a channel/user query
        // (Not applicable for generic niche keywords like "finance")
        if (youtubeApiKey && (query.includes('youtube.com') || query.startsWith('@') || query.length > 20)) {
           try {
             const channelId = await getChannelIdFromUrl(query, youtubeApiKey);
             if (channelId) {
               realChannelData = await fetchRealChannelData(channelId, youtubeApiKey);
             }
           } catch (ytError) {
             console.warn("YouTube API Fetch failed, falling back to simulation:", ytError);
             // We don't block the app, we just fall back to AI simulation
           }
        }

        const result = await analyzeNicheOrChannel(query, apiKey, realChannelData);
        setData(result);
        setStatus('success');
      }
    } catch (error) {
      console.error(error);
      setStatus('error');
    }
  };

  const handleChannelClick = async (channelName: string) => {
     if (!apiKey) return;
     setDeepDiveLoading(true);
     try {
       const result = await analyzeChannelDeepDive(channelName, apiKey);
       setChannelDeepDive(result);
     } catch (err) {
       console.error(err);
     } finally {
       setDeepDiveLoading(false);
     }
  };

  // Backup & Restore Handlers
  const handleExportBackup = () => {
    exportAppState({
      config: { apiKey, youtubeApiKey },
      lastAnalysis: data
    });
  };

  const handleImportBackup = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      const backup = await importAppState(file);
      
      if (backup.config?.apiKey) setApiKey(backup.config.apiKey);
      if (backup.config?.youtubeApiKey) setYoutubeApiKey(backup.config.youtubeApiKey);
      if (backup.lastAnalysis) {
        setData(backup.lastAnalysis);
        setStatus('success');
      }
      
      alert(`Restore successful! Loaded backup from ${new Date(backup.timestamp).toLocaleDateString()}`);
      setShowSettings(false);
    } catch (err: any) {
      alert(`Restore failed: ${err.message}`);
    } finally {
      // Reset input value so same file can be selected again if needed
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const ExampleQueries = ["True Crime Faceless", "AI News", "Stoicism", "Finance Automation"];

  return (
    <div className="min-h-screen bg-slate-950 text-slate-200 selection:bg-purple-500 selection:text-white overflow-x-hidden">
      {/* Header */}
      <header className="border-b border-slate-800 bg-slate-900/50 backdrop-blur-md sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2" onClick={() => { setData(null); setVideoReport(null); setQuery(''); }} style={{cursor: 'pointer'}}>
            <div className="w-8 h-8 bg-gradient-to-br from-purple-500 to-blue-600 rounded-lg flex items-center justify-center font-bold text-white shadow-lg shadow-purple-500/20">
              N
            </div>
            <span className="font-bold text-xl tracking-tight text-white">Niche<span className="text-purple-400">Sensei</span></span>
          </div>
          <button 
            onClick={() => setShowSettings(true)}
            className="p-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded-full transition-colors"
          >
            <IconSettings className="w-6 h-6" />
          </button>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-8 relative">
        
        {/* Search Section */}
        <div className="max-w-2xl mx-auto mb-12 text-center">
          <h1 className="text-3xl md:text-5xl font-bold text-white mb-6">
            Master the Algorithm with <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-blue-400">NicheSensei</span>
          </h1>
          <p className="text-slate-400 mb-8 text-lg">
            The AI engine for deep forensic analysis, competitor mapping, and high-probability niche discovery.
          </p>

          <form onSubmit={handleSearch} className="relative group">
            <div className="absolute inset-0 bg-gradient-to-r from-purple-500 to-blue-600 rounded-full blur opacity-25 group-hover:opacity-50 transition-opacity"></div>
            <div className="relative flex items-center bg-slate-900 border border-slate-700 rounded-full p-2 shadow-2xl">
              <IconSearch className="w-6 h-6 text-slate-500 ml-3" />
              <input 
                type="text" 
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Paste Channel, Video, or Niche..."
                className="bg-transparent border-none outline-none flex-1 px-4 py-3 text-white placeholder-slate-500"
              />
              <button 
                type="submit"
                disabled={status === 'analyzing'}
                className="bg-white text-slate-900 px-6 py-3 rounded-full font-bold hover:bg-slate-200 transition-colors disabled:opacity-50"
              >
                {status === 'analyzing' ? 'Scanning...' : 'Analyze'}
              </button>
            </div>
          </form>
          
          <div className="mt-4 flex flex-wrap justify-center gap-2">
            <span className="text-slate-500 text-sm">Ask Sensei:</span>
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
          <LoadingOverlay type={loadingType} />
        )}

        {/* Error State */}
        {status === 'error' && (
          <div className="text-center py-20">
            <p className="text-red-400 bg-red-900/20 inline-block px-4 py-2 rounded-lg border border-red-900">
              Sensei encountered an error. Please check your API Keys and try again.
            </p>
          </div>
        )}

        {/* MAIN DASHBOARD */}
        {status === 'success' && data && !videoReport && (
          <div className="animate-fade-in space-y-8">
            
            {/* Summary & High-Level Scores */}
            <div className="bg-gradient-to-br from-slate-900 to-slate-800 p-6 rounded-2xl border border-slate-700 relative overflow-hidden">
               <div className="absolute top-0 right-0 p-4 opacity-10">
                 <IconTrendingUp className="w-32 h-32 text-white" />
               </div>
               <h2 className="text-xl font-bold text-white mb-2">Sensei's Verdict</h2>
               <p className="text-slate-300 max-w-3xl mb-6 leading-relaxed">{data.summary}</p>
               
               <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="bg-slate-950/50 p-4 rounded-xl border border-slate-700/50">
                    <div className="text-slate-500 text-xs font-bold uppercase mb-1">Beginner Opportunity</div>
                    <div className={`text-3xl font-bold ${data.beginnerOpportunityScore > 70 ? 'text-green-400' : 'text-yellow-400'}`}>
                      {data.beginnerOpportunityScore}/100
                    </div>
                  </div>
                  <div className="bg-slate-950/50 p-4 rounded-xl border border-slate-700/50">
                    <div className="text-slate-500 text-xs font-bold uppercase mb-1">Success Probability</div>
                    <div className={`text-3xl font-bold ${data.successProbability > 70 ? 'text-green-400' : 'text-yellow-400'}`}>
                      {data.successProbability}%
                    </div>
                  </div>
                  <div className="bg-slate-950/50 p-4 rounded-xl border border-slate-700/50">
                    <div className="text-slate-500 text-xs font-bold uppercase mb-1">Global RPM Est.</div>
                    <div className="text-3xl font-bold text-blue-400">{data.globalMonetization?.avgRPM || 'N/A'}</div>
                  </div>
                  <div className="bg-slate-950/50 p-4 rounded-xl border border-slate-700/50">
                    <div className="text-slate-500 text-xs font-bold uppercase mb-1">Top Market</div>
                    <div className="text-xl font-bold text-white truncate">
                      {data.globalMonetization?.topRegions?.[0] || 'Global'}
                    </div>
                  </div>
               </div>
            </div>

            {/* Channel Audit (Conditional) */}
            {data.channelAudit && (
               <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                 <div className="bg-slate-800 p-5 rounded-xl border border-green-900/50">
                   <h3 className="font-bold text-green-400 mb-3 uppercase text-sm tracking-wider">Strengths</h3>
                   <ul className="space-y-2">
                     {data.channelAudit.strengths?.map((s, i) => (
                       <li key={i} className="text-sm text-slate-300 flex items-start gap-2">
                         <span className="text-green-500 mt-1">✓</span> {s}
                       </li>
                     )) || <li className="text-sm text-slate-500">No data available</li>}
                   </ul>
                 </div>
                 <div className="bg-slate-800 p-5 rounded-xl border border-red-900/50">
                   <h3 className="font-bold text-red-400 mb-3 uppercase text-sm tracking-wider">Weaknesses</h3>
                   <ul className="space-y-2">
                     {data.channelAudit.weaknesses?.map((w, i) => (
                       <li key={i} className="text-sm text-slate-300 flex items-start gap-2">
                         <span className="text-red-500 mt-1">✗</span> {w}
                       </li>
                     )) || <li className="text-sm text-slate-500">No data available</li>}
                   </ul>
                 </div>
                 <div className="bg-slate-800 p-5 rounded-xl border border-blue-900/50">
                   <h3 className="font-bold text-blue-400 mb-3 uppercase text-sm tracking-wider">Expansion Opps</h3>
                   <ul className="space-y-2">
                     {data.channelAudit.expansionOpportunities?.map((o, i) => (
                       <li key={i} className="text-sm text-slate-300 flex items-start gap-2">
                         <span className="text-blue-500 mt-1">➜</span> {o}
                       </li>
                     )) || <li className="text-sm text-slate-500">No data available</li>}
                   </ul>
                 </div>
               </div>
            )}

            {/* Navigation Tabs */}
            <div className="flex border-b border-slate-800">
              <button 
                onClick={() => setActiveTab('overview')}
                className={`px-6 py-4 font-medium text-sm transition-colors border-b-2 ${activeTab === 'overview' ? 'border-purple-500 text-white' : 'border-transparent text-slate-500 hover:text-slate-300'}`}
              >
                Deep Stats & Outliers
              </button>
              <button 
                onClick={() => setActiveTab('strategy')}
                className={`px-6 py-4 font-medium text-sm transition-colors border-b-2 ${activeTab === 'strategy' ? 'border-purple-500 text-white' : 'border-transparent text-slate-500 hover:text-slate-300'}`}
              >
                Micro-Niches & Roadmap
              </button>
              <button 
                onClick={() => setActiveTab('competitors')}
                className={`px-6 py-4 font-medium text-sm transition-colors border-b-2 ${activeTab === 'competitors' ? 'border-purple-500 text-white' : 'border-transparent text-slate-500 hover:text-slate-300'}`}
              >
                Competitor & Copy Analysis
              </button>
            </div>

            {/* Tab Content */}
            <div className="min-h-[500px]">
              {activeTab === 'overview' && (
                <VideoAnalysis videos={data.videos || []} avgViews={data.channelProfile?.avgViews || 0} />
              )}

              {activeTab === 'strategy' && (
                <StrategyPanel microNiches={data.microNiches || []} roadmap={data.contentRoadmap || []} apiKey={apiKey} />
              )}

              {activeTab === 'competitors' && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div className="space-y-4">
                    <h3 className="text-xl font-semibold text-white flex items-center gap-2">
                      <IconUsers className="w-6 h-6 text-slate-400" />
                      Similar Channels (Click for Deep Dive)
                    </h3>
                    <div className="space-y-4">
                      {data.competitors?.length ? data.competitors.map((comp, i) => (
                        <div 
                           key={i} 
                           onClick={() => handleChannelClick(comp.name)}
                           className="bg-slate-800 p-4 rounded-xl border border-slate-700 flex items-start justify-between cursor-pointer hover:border-purple-500 hover:shadow-lg hover:shadow-purple-500/10 transition-all group"
                        >
                          <div>
                            <h4 className="font-bold text-white group-hover:text-purple-400 transition-colors">{comp.name}</h4>
                            <p className="text-sm text-slate-400">{comp.subscribers} Subscribers</p>
                            <p className="text-xs text-slate-500 mt-2">{comp.notes}</p>
                          </div>
                          <div className="text-right">
                            <span className="block text-2xl font-bold text-purple-400">{comp.similarityScore}%</span>
                            <span className="text-xs text-slate-500 uppercase">Match</span>
                          </div>
                        </div>
                      )) : <p className="text-slate-500 italic">No similar channels detected.</p>}
                    </div>
                  </div>
                  
                  <div className="space-y-4">
                    <h3 className="text-xl font-semibold text-white flex items-center gap-2">
                      <IconTrendingUp className="w-6 h-6 text-slate-400" />
                      Shadow Analysis (Copycats)
                    </h3>
                    <div className="space-y-4">
                      {data.shadowAnalysis?.length ? data.shadowAnalysis.map((shadow, i) => (
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
                            Channel <span className="font-bold text-white cursor-pointer hover:text-blue-400 hover:underline" onClick={() => handleChannelClick(shadow.copycatChannel)}>{shadow.copycatChannel}</span> copied the concept with:
                          </p>
                          <p className="text-white font-medium italic mt-1">"{shadow.copycatTitle}"</p>
                          <div className="mt-3 pt-3 border-t border-slate-700/50">
                            <p className="text-xs text-slate-500">
                              <span className="font-bold text-slate-400">Insight:</span> {shadow.similarityReason}
                            </p>
                          </div>
                        </div>
                      )) : <p className="text-slate-500 italic">No shadow analysis data available.</p>}
                    </div>
                  </div>
                </div>
              )}
            </div>

          </div>
        )}
      </main>

      {/* MODALS AND PANELS */}

      {/* Video Forensics Modal */}
      {videoReport && (
        <ForensicsModal report={videoReport} onClose={() => setVideoReport(null)} />
      )}

      {/* Channel Deep Dive Panel */}
      {channelDeepDive && (
        <ChannelDrillDownPanel data={channelDeepDive} onClose={() => setChannelDeepDive(null)} />
      )}

      {/* Deep Dive Loading Overlay */}
      {deepDiveLoading && (
        <LoadingOverlay type='channel' />
      )}

      {/* Settings Modal */}
      {showSettings && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-[70] flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-700 p-8 rounded-2xl w-full max-w-md shadow-2xl overflow-y-auto max-h-[90vh]">
            <h2 className="text-2xl font-bold text-white mb-2">Configuration</h2>
            <p className="text-slate-400 mb-6 text-sm">To enable NicheSensei's analysis engine, please provide your API Keys.</p>
            
            <div className="space-y-4 mb-6">
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase mb-2">Google Gemini API Key (Required)</label>
                <input 
                  type="password" 
                  value={apiKey}
                  onChange={(e) => setApiKey(e.target.value)}
                  className="w-full bg-slate-800 border border-slate-700 text-white rounded-lg px-4 py-3 focus:ring-2 focus:ring-purple-500 outline-none"
                  placeholder="AIzaSy..."
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase mb-2">YouTube Data API Key (Optional)</label>
                <p className="text-[10px] text-slate-500 mb-2">Provide this to fetch verified real-time statistics instead of AI simulations.</p>
                <input 
                  type="password" 
                  value={youtubeApiKey}
                  onChange={(e) => setYoutubeApiKey(e.target.value)}
                  className="w-full bg-slate-800 border border-slate-700 text-white rounded-lg px-4 py-3 focus:ring-2 focus:ring-red-500 outline-none"
                  placeholder="AIzaSy..."
                />
              </div>
            </div>

            {/* Backup & Restore Section */}
            <div className="mb-6 pt-4 border-t border-slate-800">
               <label className="block text-xs font-bold text-slate-500 uppercase mb-3">Backup & Restore</label>
               <div className="grid grid-cols-2 gap-3">
                  <button
                    onClick={handleExportBackup}
                    className="flex items-center justify-center gap-2 bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-bold py-2 rounded-lg border border-slate-700 transition-colors"
                  >
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" /></svg>
                    Export Config
                  </button>
                  <label className="flex items-center justify-center gap-2 bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-bold py-2 rounded-lg border border-slate-700 transition-colors cursor-pointer">
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" /></svg>
                    Import Backup
                    <input 
                      type="file" 
                      ref={fileInputRef}
                      className="hidden" 
                      accept=".json"
                      onChange={handleImportBackup}
                    />
                  </label>
               </div>
            </div>
            
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
                Save Keys
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default App;
