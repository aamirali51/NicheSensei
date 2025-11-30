import React from 'react';
import { Video } from '../types';
import { ResponsiveContainer, ScatterChart, Scatter, XAxis, YAxis, ZAxis, Tooltip, Cell, Legend } from 'recharts';

interface Props {
  videos: Video[];
  avgViews: number;
}

export const VideoAnalysis: React.FC<Props> = ({ videos, avgViews }) => {
  const sortedVideos = [...videos].sort((a, b) => b.outlierScore! - a.outlierScore!);

  const chartData = videos.map(v => ({
    name: v.title.length > 20 ? v.title.substring(0, 20) + '...' : v.title,
    views: v.views,
    outlier: v.outlierScore,
    date: new Date(v.uploadDate).getTime(),
    rawDate: v.uploadDate,
  }));

  return (
    <div className="space-y-6">
      <div className="bg-slate-800 p-6 rounded-xl border border-slate-700 shadow-sm">
        <h3 className="text-xl font-semibold text-white mb-4 flex items-center gap-2">
          Outlier Detection Chart
          <span className="text-xs font-normal text-slate-400 bg-slate-900 px-2 py-1 rounded">Score = Views / Avg</span>
        </h3>
        <div className="h-[300px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <ScatterChart margin={{ top: 20, right: 20, bottom: 20, left: 20 }}>
              <XAxis 
                type="number" 
                dataKey="date" 
                name="Date" 
                domain={['auto', 'auto']}
                tickFormatter={(unixTime) => new Date(unixTime).toLocaleDateString()}
                tick={{ fill: '#94a3b8' }}
              />
              <YAxis 
                type="number" 
                dataKey="views" 
                name="Views" 
                unit="" 
                tick={{ fill: '#94a3b8' }}
              />
              <ZAxis type="number" dataKey="outlier" range={[60, 400]} name="Outlier Score" />
              <Tooltip 
                cursor={{ strokeDasharray: '3 3' }} 
                content={({ active, payload }) => {
                  if (active && payload && payload.length) {
                    const data = payload[0].payload;
                    return (
                      <div className="bg-slate-900 p-3 border border-slate-700 rounded shadow-lg">
                        <p className="text-white font-medium">{data.name}</p>
                        <p className="text-emerald-400 text-sm">Views: {data.views.toLocaleString()}</p>
                        <p className="text-yellow-400 text-sm">Outlier Score: {data.outlier.toFixed(2)}x</p>
                        <p className="text-slate-400 text-xs">{data.rawDate}</p>
                      </div>
                    );
                  }
                  return null;
                }}
              />
              <Legend />
              <Scatter name="Videos" data={chartData} fill="#8884d8">
                {chartData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.outlier && entry.outlier >= 2 ? '#ef4444' : (entry.outlier && entry.outlier >= 1 ? '#10b981' : '#64748b')} />
                ))}
              </Scatter>
            </ScatterChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="bg-slate-800 rounded-xl border border-slate-700 overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-slate-300">
            <thead className="bg-slate-900/50 text-xs uppercase font-semibold text-slate-400">
              <tr>
                <th className="px-6 py-4">Video</th>
                <th className="px-6 py-4">Upload Date</th>
                <th className="px-6 py-4">Views</th>
                <th className="px-6 py-4 text-center">Outlier Score</th>
                <th className="px-6 py-4 text-center">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-700">
              {sortedVideos.map((video) => (
                <tr key={video.id} className="hover:bg-slate-700/30 transition-colors">
                  <td className="px-6 py-4 max-w-xs">
                    <div className="flex items-center gap-3">
                      <img src={video.thumbnailUrl} alt={video.title} className="w-20 h-12 object-cover rounded bg-slate-700" />
                      <div>
                        <p className="font-medium text-white line-clamp-2">{video.title}</p>
                        <span className="text-xs text-slate-500">{video.duration} • {video.type}</span>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">{video.uploadDate}</td>
                  <td className="px-6 py-4 whitespace-nowrap">{video.views.toLocaleString()}</td>
                  <td className="px-6 py-4 text-center font-mono">
                    <span className={`px-2 py-1 rounded text-xs font-bold ${
                      video.outlierScore && video.outlierScore >= 3 ? 'bg-red-500/20 text-red-400' :
                      video.outlierScore && video.outlierScore >= 1.5 ? 'bg-emerald-500/20 text-emerald-400' :
                      'text-slate-500'
                    }`}>
                      {video.outlierScore?.toFixed(2)}x
                    </span>
                  </td>
                  <td className="px-6 py-4 text-center">
                    {video.outlierScore && video.outlierScore >= 3 ? (
                      <span className="inline-flex items-center gap-1 text-red-400 text-xs font-bold uppercase tracking-wider">
                        Viral
                        <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20"><path d="M12.316 3.051a1 1 0 0 2.25 1.666L17.79 10H13a4 4 0 0 0-3.858 5.008 2.015 2.015 0 0 1-3.664-1.996l1.248-3.328A4 4 0 0 0 6.096 7H2.208a.998.998 0 0 1-.954-1.28l1.754-5.328a1 1 0 0 1 .95-.688h8.358z"/></svg>
                      </span>
                    ) : video.outlierScore && video.outlierScore >= 1.5 ? (
                      <span className="text-emerald-400 text-xs font-medium">Breakout</span>
                    ) : (
                      <span className="text-slate-600 text-xs">Standard</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
