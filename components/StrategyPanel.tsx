import React from 'react';
import { SubNicheOpportunity, ContentStrategy } from '../types';
import { IconTarget, IconDollar, IconVideo } from './Icons';

interface Props {
  subNiches: SubNicheOpportunity[];
  strategies: ContentStrategy[];
}

export const StrategyPanel: React.FC<Props> = ({ subNiches, strategies }) => {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      
      {/* Sub-Niches */}
      <div className="space-y-4">
        <h3 className="text-xl font-semibold text-white flex items-center gap-2">
          <IconTarget className="w-6 h-6 text-purple-400" />
          Profitable Sub-Niches
        </h3>
        <div className="space-y-3">
          {subNiches.map((niche, idx) => (
            <div key={idx} className="bg-slate-800 p-5 rounded-xl border border-slate-700 hover:border-purple-500/50 transition-colors">
              <div className="flex justify-between items-start mb-2">
                <h4 className="font-bold text-lg text-white">{niche.name}</h4>
                <span className={`px-2 py-1 rounded text-xs font-bold ${
                  niche.successProbability > 80 ? 'bg-green-500/20 text-green-400' : 
                  niche.successProbability > 50 ? 'bg-yellow-500/20 text-yellow-400' : 'bg-red-500/20 text-red-400'
                }`}>
                  {niche.successProbability}% Success Rate
                </span>
              </div>
              <div className="flex gap-4 text-sm text-slate-400 mb-3">
                <span className="flex items-center gap-1">
                  <span className={`w-2 h-2 rounded-full ${
                    niche.competitionLevel === 'Low' ? 'bg-emerald-500' : 'bg-red-500'
                  }`}></span>
                  Comp: {niche.competitionLevel}
                </span>
                <span className="flex items-center gap-1">
                  <IconDollar className="w-3 h-3" />
                  RPM: {niche.rpmEstimate}
                </span>
              </div>
              <div>
                <p className="text-xs uppercase text-slate-500 font-semibold mb-1">Recommended Topics:</p>
                <div className="flex flex-wrap gap-2">
                  {niche.recommendedTopics.map((topic, i) => (
                    <span key={i} className="bg-slate-700/50 text-slate-300 text-xs px-2 py-1 rounded border border-slate-700">
                      {topic}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Content Ideas */}
      <div className="space-y-4">
        <h3 className="text-xl font-semibold text-white flex items-center gap-2">
          <IconVideo className="w-6 h-6 text-blue-400" />
          Faceless Content Ideas
        </h3>
        <div className="space-y-3">
          {strategies.map((strat, idx) => (
            <div key={idx} className="bg-slate-800 p-5 rounded-xl border border-slate-700 relative overflow-hidden">
              <div className="absolute top-0 right-0 w-16 h-16 bg-blue-500/10 rounded-bl-full -mr-4 -mt-4"></div>
              <h4 className="font-bold text-white mb-2 pr-4">"{strat.title}"</h4>
              <div className="space-y-2 text-sm text-slate-300">
                <div className="flex items-start gap-2">
                  <span className="text-blue-400 font-medium whitespace-nowrap">Format:</span>
                  <span>{strat.format}</span>
                </div>
                <div className="flex items-start gap-2">
                  <span className="text-blue-400 font-medium whitespace-nowrap">Tech:</span>
                  <span>{strat.facelessTechnique}</span>
                </div>
                <div className="mt-3 p-3 bg-slate-900/50 rounded-lg border border-slate-800">
                  <span className="text-xs text-slate-500 uppercase font-bold block mb-1">The Hook</span>
                  <p className="italic text-slate-200">"{strat.hook}"</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

    </div>
  );
};
