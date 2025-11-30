
import React from 'react';
import { ChannelDrillDown } from '../types';
import { ShadowMap } from './ShadowMap';

interface Props {
  data: ChannelDrillDown;
  onClose: () => void;
}

export const ChannelDrillDownPanel: React.FC<Props> = ({ data, onClose }) => {
  return (
    <div className="fixed inset-y-0 right-0 z-50 w-full max-w-2xl bg-slate-950 border-l border-slate-800 shadow-2xl overflow-y-auto animate-slide-in">
      
      {/* Header */}
      <div className="sticky top-0 bg-slate-900/90 backdrop-blur-md p-6 border-b border-slate-800 flex justify-between items-center z-10">
        <div>
          <h2 className="text-2xl font-bold text-white">{data.channelName}</h2>
          <p className="text-slate-400 text-sm">{data.subscriberCount} Subscribers • Deep Dive</p>
        </div>
        <button onClick={onClose} className="p-2 bg-slate-800 rounded-full hover:bg-slate-700 text-slate-400 hover:text-white transition-colors">
           <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
        </button>
      </div>

      <div className="p-6 space-y-8">
        
        {/* Scores */}
        <div className="grid grid-cols-2 gap-4">
          <div className="bg-slate-900 p-5 rounded-xl border border-slate-800">
             <div className="text-slate-500 text-xs font-bold uppercase mb-2">Originator Score</div>
             <div className="text-3xl font-bold text-emerald-400">{data.originatorScore}/100</div>
             <p className="text-xs text-slate-500 mt-2">Likelihood to start trends</p>
          </div>
          <div className="bg-slate-900 p-5 rounded-xl border border-slate-800">
             <div className="text-slate-500 text-xs font-bold uppercase mb-2">Copy Behavior</div>
             <div className="text-3xl font-bold text-orange-400">{data.copyBehaviorScore}/100</div>
             <p className="text-xs text-slate-500 mt-2">Tendency to replicate others</p>
          </div>
        </div>

        {/* Shadow Map */}
        <div>
          <h3 className="text-lg font-bold text-white mb-4">Competitor Influence Map</h3>
          <ShadowMap data={data.shadowMapData} />
        </div>

        {/* Copy Events List */}
        <div>
          <h3 className="text-lg font-bold text-white mb-4">Recent Copy Events</h3>
          <div className="space-y-3">
             {data.copyEvents.map((event, i) => (
                <div key={i} className="bg-slate-900 p-4 rounded-xl border border-slate-800 text-sm">
                   <div className="flex items-center justify-between mb-2">
                      <span className={`px-2 py-0.5 rounded text-[10px] uppercase font-bold ${
                          event.copyOutcome === 'Success' ? 'bg-green-900/30 text-green-400' : 'bg-red-900/30 text-red-400'
                      }`}>
                         Outcome: {event.copyOutcome}
                      </span>
                      <span className="text-slate-500 text-xs">{event.copyType} Copy</span>
                   </div>
                   <p className="text-slate-300">
                      <span className="text-purple-400 font-bold">{event.copyChannelName}</span> copied 
                      <span className="text-blue-400 font-bold"> {event.sourceChannelName}</span>
                   </p>
                   <div className="mt-2 text-xs text-slate-500 flex gap-4">
                      <span>Transcript Sim: {(event.transcriptSimilarity * 100).toFixed(0)}%</span>
                      <span>Title Sim: {(event.titleSimilarity * 100).toFixed(0)}%</span>
                   </div>
                </div>
             ))}
             {data.copyEvents.length === 0 && <p className="text-slate-500 italic">No significant copy events detected recently.</p>}
          </div>
        </div>

        {/* Vulnerabilities / Recommended Niches */}
        <div>
           <h3 className="text-lg font-bold text-white mb-4">Attack Opportunities (Vulnerabilities)</h3>
           <div className="space-y-3">
             {data.recommendedMicroNiches.map((niche, i) => (
               <div key={i} className="bg-gradient-to-r from-indigo-900/20 to-slate-900 p-4 rounded-xl border border-indigo-500/30">
                  <div className="flex justify-between items-start">
                     <h4 className="font-bold text-indigo-300">{niche.name}</h4>
                     <span className="text-green-400 font-bold text-sm">{niche.successProbability}% Prob.</span>
                  </div>
                  <p className="text-xs text-slate-400 mt-1">Monetization: {niche.monetizationClass} RPM</p>
                  <div className="flex flex-wrap gap-1 mt-2">
                     {niche.keywords.slice(0, 3).map(k => (
                        <span key={k} className="text-[10px] bg-slate-800 px-2 py-1 rounded text-slate-300">{k}</span>
                     ))}
                  </div>
               </div>
             ))}
           </div>
        </div>

      </div>
    </div>
  );
};
