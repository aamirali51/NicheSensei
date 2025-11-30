
import React, { useState } from 'react';
import { MicroNiche, RoadmapItem } from '../types';
import { IconTarget, IconDollar, IconVideo, IconChevronDown } from './Icons';

interface Props {
  microNiches: MicroNiche[];
  roadmap: RoadmapItem[];
}

const NicheCard = ({ niche }: { niche: MicroNiche }) => {
  const [expanded, setExpanded] = useState(false);

  return (
    <div className="bg-slate-800 p-5 rounded-xl border border-slate-700 hover:border-purple-500/50 transition-colors">
      <div className="flex justify-between items-start mb-3">
        <div>
           <h4 className="font-bold text-lg text-white">{niche.name}</h4>
           {niche.subNiches && niche.subNiches.length > 0 && (
             <div className="text-xs text-slate-500 mt-1">
               Sub-niches: {niche.subNiches.join(', ')}
             </div>
           )}
        </div>
        <div className="text-right">
          <span className={`px-2 py-1 rounded text-xs font-bold block mb-1 ${
            niche.successProbability > 75 ? 'bg-green-500/20 text-green-400' : 
            niche.successProbability > 40 ? 'bg-yellow-500/20 text-yellow-400' : 'bg-red-500/20 text-red-400'
          }`}>
            {niche.successProbability}% Success Prob
          </span>
          <span className="text-[10px] text-slate-500">
             Dominance: {(niche.dominanceRatio * 100).toFixed(0)}%
          </span>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 gap-2 mb-4">
        <div className="bg-slate-900/50 p-2 rounded border border-slate-700/50">
          <div className="text-[10px] text-slate-500 uppercase">Demand</div>
          <div className="w-full bg-slate-700 h-1.5 rounded-full mt-1">
            <div className="bg-blue-400 h-1.5 rounded-full" style={{ width: `${niche.demandScore}%` }}></div>
          </div>
        </div>
        <div className="bg-slate-900/50 p-2 rounded border border-slate-700/50">
          <div className="text-[10px] text-slate-500 uppercase">Competition</div>
          <div className="w-full bg-slate-700 h-1.5 rounded-full mt-1">
            <div className="bg-red-400 h-1.5 rounded-full" style={{ width: `${niche.competitionScore}%` }}></div>
          </div>
        </div>
      </div>

      <div className="flex justify-between items-center text-xs text-slate-400 mb-3 border-b border-slate-700 pb-3">
          <div className="flex items-center gap-1">
            <IconDollar className="w-3 h-3 text-emerald-500" />
            RPM Class: <span className="text-slate-200">{niche.monetizationClass}</span>
          </div>
          <div>
            Saturation: <span className="text-slate-200">{niche.saturationLevel}</span>
          </div>
      </div>

      {/* Why It Works Section */}
      <div className="bg-slate-900/40 p-3 rounded-lg border border-slate-700/50 mb-3">
        <p className="text-xs text-slate-300 italic">
          <span className="text-purple-400 font-bold not-italic">Why it works: </span>
          {niche.whyItWorks}
        </p>
      </div>

      <div>
        <p className="text-[10px] uppercase text-slate-500 font-semibold mb-2">Keywords:</p>
        <div className="flex flex-wrap gap-2 mb-3">
          {niche.keywords.slice(0, 4).map((topic, i) => (
            <span key={i} className="bg-slate-700/50 text-slate-300 text-xs px-2 py-1 rounded border border-slate-700">
              {topic}
            </span>
          ))}
        </div>
      </div>

      {/* Expandable Ideas */}
      <button 
        onClick={() => setExpanded(!expanded)}
        className="w-full flex items-center justify-center gap-2 py-2 bg-slate-700/30 hover:bg-slate-700/50 rounded-lg text-xs font-bold text-slate-400 transition-colors"
      >
        {expanded ? 'Hide Video Ideas' : `View 10 Sample Ideas`}
        <IconChevronDown className={`w-3 h-3 transition-transform ${expanded ? 'rotate-180' : ''}`} />
      </button>

      {expanded && (
        <div className="mt-3 space-y-1 animate-slide-in">
          {niche.sampleIdeas && niche.sampleIdeas.length > 0 ? niche.sampleIdeas.map((idea, idx) => (
             <div key={idx} className="flex gap-2 text-xs text-slate-300 p-2 bg-slate-900/50 rounded border border-slate-800">
                <span className="text-slate-500 font-mono">{idx + 1}.</span>
                <span>{idea}</span>
             </div>
          )) : <div className="text-xs text-slate-500 italic p-2">No ideas generated.</div>}
        </div>
      )}
    </div>
  );
};

export const StrategyPanel: React.FC<Props> = ({ microNiches, roadmap }) => {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      
      {/* Micro-Niche Clusters */}
      <div className="space-y-4">
        <h3 className="text-xl font-semibold text-white flex items-center gap-2">
          <IconTarget className="w-6 h-6 text-purple-400" />
          Micro-Niche Clusters (Auto-Discovered)
        </h3>
        <div className="space-y-3">
          {microNiches.map((niche, idx) => (
            <NicheCard key={idx} niche={niche} />
          ))}
          {microNiches.length === 0 && <p className="text-slate-500 italic">No specific niches detected.</p>}
        </div>
      </div>

      {/* 10-Video Roadmap (Global) */}
      <div className="space-y-4">
        <h3 className="text-xl font-semibold text-white flex items-center gap-2">
          <IconVideo className="w-6 h-6 text-blue-400" />
          General Launch Roadmap
        </h3>
        <div className="space-y-4">
          {roadmap.map((item, idx) => (
            <div key={idx} className="bg-slate-800 p-0 rounded-xl border border-slate-700 relative overflow-hidden flex">
              <div className="w-10 bg-slate-900 flex items-center justify-center border-r border-slate-700 text-slate-500 font-mono font-bold">
                {idx + 1}
              </div>
              <div className="p-4 flex-1">
                <h4 className="font-bold text-white text-md mb-2">{item.title}</h4>
                <div className="space-y-2 text-sm">
                   <div className="bg-slate-900/30 p-2 rounded border-l-2 border-purple-500">
                      <span className="text-xs text-purple-400 font-bold uppercase block mb-0.5">The Hook</span>
                      <p className="text-slate-300 italic">"{item.hook}"</p>
                   </div>
                   <div className="grid grid-cols-2 gap-4 mt-2">
                      <div>
                        <span className="text-[10px] text-slate-500 uppercase font-bold">Retention Structure</span>
                        <p className="text-slate-300 text-xs">{item.structure}</p>
                      </div>
                      <div>
                        <span className="text-[10px] text-slate-500 uppercase font-bold">CTA Strategy</span>
                        <p className="text-slate-300 text-xs">{item.ctaStrategy}</p>
                      </div>
                   </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

    </div>
  );
};
