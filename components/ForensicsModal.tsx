
import React, { useState } from 'react';
import { DeepVideoReport } from '../types';
import { IconVideo, IconTarget } from './Icons';

interface Props {
  report: DeepVideoReport;
  onClose: () => void;
}

export const ForensicsModal: React.FC<Props> = ({ report, onClose }) => {
  const [activeTab, setActiveTab] = useState<'summary' | 'roadmap'>('summary');

  const getStatusColor = (status: string) => {
    switch(status) {
      case 'Original': return 'text-green-400 bg-green-900/20 border-green-800';
      case 'Likely Original': return 'text-emerald-400 bg-emerald-900/20 border-emerald-800';
      case 'Derivative': return 'text-yellow-400 bg-yellow-900/20 border-yellow-800';
      case 'Likely Copy': return 'text-red-400 bg-red-900/20 border-red-800';
      default: return 'text-slate-400 bg-slate-800 border-slate-700';
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 animate-fade-in">
      <div className="bg-slate-900 w-full max-w-4xl max-h-[90vh] rounded-2xl border border-slate-700 shadow-2xl overflow-hidden flex flex-col">
        
        {/* Header */}
        <div className="p-6 border-b border-slate-800 flex justify-between items-start bg-slate-900">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className={`px-3 py-1 rounded-full text-xs font-bold border uppercase tracking-wider ${getStatusColor(report.originalityStatus)}`}>
                {report.originalityStatus}
              </span>
              <span className="text-slate-500 text-sm font-mono">
                {report.originalityConfidencePct}% Confidence
              </span>
            </div>
            <h2 className="text-xl font-bold text-white line-clamp-1" title={report.videoTitle}>
              {report.videoTitle}
            </h2>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-white p-2">
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
          </button>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-slate-800 bg-slate-900/50">
          <button 
            onClick={() => setActiveTab('summary')}
            className={`px-6 py-3 text-sm font-bold border-b-2 transition-colors ${activeTab === 'summary' ? 'border-purple-500 text-white' : 'border-transparent text-slate-500 hover:text-slate-300'}`}
          >
            Forensic Summary
          </button>
          <button 
            onClick={() => setActiveTab('roadmap')}
            className={`px-6 py-3 text-sm font-bold border-b-2 transition-colors ${activeTab === 'roadmap' ? 'border-purple-500 text-white' : 'border-transparent text-slate-500 hover:text-slate-300'}`}
          >
            Replication Roadmap
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6 bg-slate-950">
          
          {activeTab === 'summary' && (
            <div className="space-y-8">
              {/* Scores */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="bg-slate-900 p-4 rounded-xl border border-slate-800">
                  <div className="text-xs text-slate-500 uppercase font-bold mb-1">Transcript Sim.</div>
                  <div className="text-2xl font-bold text-blue-400">{(report.transcriptSimilarity * 100).toFixed(0)}%</div>
                </div>
                <div className="bg-slate-900 p-4 rounded-xl border border-slate-800">
                  <div className="text-xs text-slate-500 uppercase font-bold mb-1">Title Sim.</div>
                  <div className="text-2xl font-bold text-purple-400">{(report.titleSimilarity * 100).toFixed(0)}%</div>
                </div>
                <div className="bg-slate-900 p-4 rounded-xl border border-slate-800">
                  <div className="text-xs text-slate-500 uppercase font-bold mb-1">Thumbnail Sim.</div>
                  <div className="text-2xl font-bold text-pink-400">{(report.thumbnailSimilarity * 100).toFixed(0)}%</div>
                </div>
                <div className="bg-slate-900 p-4 rounded-xl border border-slate-800">
                  <div className="text-xs text-slate-500 uppercase font-bold mb-1">Audio Match</div>
                  <div className="text-2xl font-bold text-orange-400">{(report.audioSimilarity * 100).toFixed(0)}%</div>
                </div>
              </div>

              {/* Attribution / Sources */}
              <div>
                <h3 className="text-lg font-bold text-white mb-4">Detected Source Candidates</h3>
                <div className="space-y-3">
                  {report.topMatches.map((match, i) => (
                    <div key={i} className="bg-slate-900 p-4 rounded-xl border border-slate-800 flex items-center justify-between">
                      <div>
                        <p className="text-white font-bold">{match.sourceChannelName}</p>
                        <p className="text-xs text-slate-400">Uploaded {Math.abs(match.timeDiffHours)} hrs {match.timeDiffHours > 0 ? 'before' : 'after'}</p>
                      </div>
                      <div className="text-right">
                        <span className="block text-xl font-bold text-red-400">{match.compositeCopyScore}%</span>
                        <span className="text-[10px] text-slate-500 uppercase">Composite Match</span>
                      </div>
                    </div>
                  ))}
                  {report.topMatches.length === 0 && (
                    <p className="text-slate-500 italic">No direct matches found. Content appears highly original.</p>
                  )}
                </div>
              </div>

              {/* Improvement Suggestions */}
              <div>
                 <h3 className="text-lg font-bold text-white mb-4">How to Improve/Differentiate</h3>
                 <ul className="space-y-2">
                   {report.improvementSuggestions.map((s, i) => (
                     <li key={i} className="flex items-start gap-3 text-slate-300 text-sm bg-slate-900/50 p-3 rounded-lg border border-slate-800/50">
                       <IconTarget className="w-5 h-5 text-green-500 shrink-0" />
                       {s}
                     </li>
                   ))}
                 </ul>
              </div>
            </div>
          )}

          {activeTab === 'roadmap' && (
            <div className="space-y-6">
              <div className="bg-indigo-900/20 border border-indigo-900 p-4 rounded-xl flex items-center gap-4">
                 <div className="bg-indigo-600 rounded-full p-2">
                    <IconVideo className="w-6 h-6 text-white" />
                 </div>
                 <div>
                   <h3 className="font-bold text-indigo-300">Target Micro-Niche: {report.microNiche.label}</h3>
                   <p className="text-sm text-slate-400">Beginner Opportunity Score: <span className="text-white font-bold">{report.microNiche.beginnerOpportunityScore}/100</span></p>
                 </div>
              </div>

              <div className="space-y-4">
                 {report.roadmap.map((item, idx) => (
                    <div key={idx} className="bg-slate-900 p-4 rounded-xl border border-slate-800 relative pl-10">
                       <span className="absolute left-0 top-0 bottom-0 w-8 bg-slate-800 flex items-center justify-center text-slate-500 font-mono text-sm border-r border-slate-700 rounded-l-xl font-bold">
                         {idx + 1}
                       </span>
                       <h4 className="font-bold text-white mb-2">{item.title}</h4>
                       <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                         <div className="bg-slate-950 p-2 rounded border border-slate-800">
                           <span className="text-purple-400 font-bold block mb-1">HOOK</span>
                           <span className="text-slate-300 italic">"{item.hook}"</span>
                         </div>
                         <div className="bg-slate-950 p-2 rounded border border-slate-800">
                           <span className="text-blue-400 font-bold block mb-1">STRUCTURE</span>
                           <span className="text-slate-300">{item.structure}</span>
                         </div>
                       </div>
                    </div>
                 ))}
              </div>
            </div>
          )}

        </div>
      </div>
    </div>
  );
};
