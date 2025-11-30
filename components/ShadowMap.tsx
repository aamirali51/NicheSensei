
import React from 'react';

interface Props {
  data: {
    nodes: { id: string; label: string; type: 'Source' | 'Copy'; date: string }[];
    edges: { from: string; to: string; weight: number }[];
  };
}

export const ShadowMap: React.FC<Props> = ({ data }) => {
  const sources = data.nodes.filter(n => n.type === 'Source');
  const copies = data.nodes.filter(n => n.type === 'Copy');

  return (
    <div className="bg-slate-900 p-6 rounded-xl border border-slate-800 overflow-x-auto">
      <h3 className="text-sm font-bold text-slate-400 uppercase tracking-wider mb-6">
        Influence Propagation Graph
      </h3>
      
      <div className="min-w-[500px] flex items-center gap-8 relative">
        {/* Source Column */}
        <div className="flex flex-col gap-4">
          <div className="text-xs text-slate-500 font-mono text-center mb-2">ORIGINS</div>
          {sources.map(source => (
            <div key={source.id} className="relative z-10 bg-indigo-900/50 border border-indigo-500 p-3 rounded-lg w-48 shadow-[0_0_15px_rgba(99,102,241,0.2)]">
              <p className="text-indigo-200 font-bold text-sm truncate">{source.label}</p>
              <p className="text-xs text-indigo-400/70 font-mono mt-1">{source.date}</p>
              
              {/* Connector dot */}
              <div className="absolute top-1/2 -right-1.5 w-3 h-3 bg-indigo-500 rounded-full border-2 border-slate-900 translate-y-[-50%]"></div>
            </div>
          ))}
        </div>

        {/* Edges Visualized as SVG Lines */}
        <div className="flex-1 h-[200px] relative border-l-2 border-dashed border-slate-800 mx-4">
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-slate-700 text-xs font-mono bg-slate-900 px-2">
            TIMELINE DELAY &rarr;
          </div>
        </div>

        {/* Copies Column */}
        <div className="flex flex-col gap-4">
          <div className="text-xs text-slate-500 font-mono text-center mb-2">DERIVATIVES & COPIES</div>
          {copies.map(copy => (
            <div key={copy.id} className="relative z-10 bg-slate-800 border border-slate-700 p-3 rounded-lg w-48 hover:border-red-500/50 transition-colors">
              <p className="text-slate-200 font-bold text-sm truncate">{copy.label}</p>
              <p className="text-xs text-slate-500 font-mono mt-1">{copy.date}</p>
              
               {/* Connector dot */}
              <div className="absolute top-1/2 -left-1.5 w-3 h-3 bg-slate-600 rounded-full border-2 border-slate-900 translate-y-[-50%]"></div>
            </div>
          ))}
        </div>
      </div>
      
      <p className="text-xs text-slate-600 mt-6 text-center italic">
        *Graph visualizes high-probability influence. Edges weighted by composite similarity score.
      </p>
    </div>
  );
};
