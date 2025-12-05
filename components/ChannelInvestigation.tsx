
import React, { useState } from 'react';
import { ChannelInvestigationReport, VideoTopicInfo } from '../types';
import { ResponsiveContainer, LineChart, Line, XAxis, YAxis, Tooltip, PieChart, Pie, Cell } from 'recharts';
import { IconSearch, IconTrendingUp, IconTarget, IconUsers } from './Icons';

interface Props {
  data: ChannelInvestigationReport;
}

const COLORS = ['#8884d8', '#82ca9d', '#ffc658', '#ff8042'];

export const ChannelInvestigation: React.FC<Props> = ({ data }) => {
  const [activeTab, setActiveTab] = useState<'overview' | 'forensics' | 'growth'>('overview');

  const pieData = [
    { name: 'Shorts', value: data.contentMix.shortsPct },
    { name: 'Long Form', value: data.contentMix.longFormPct },
  ].filter(d => d.value > 0);

  const downloadReport = () => {
    const jsonString = JSON.stringify(data, null, 2);
    const blob = new Blob([jsonString], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${data.channelInfo.title.replace(/\s+/g, '_')}_Investigation.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-8 animate-fade-in">
      
      {/* Simulation Warning Banner */}
      {data.isSimulation && (
         <div className="bg-yellow-900/30 text-yellow-200 p-3 text-center text-sm border border-yellow-700/50 rounded-lg flex items-center justify-center gap-2">
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>
            <span><strong>Simulation Mode:</strong> Displaying estimated data. Add a YouTube API Key in Settings for verified real-time accuracy.</span>
         </div>
      )}

      {/* Header Profile */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-purple-600/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2"></div>
        
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6 relative z-10">
           <div className="flex items-center gap-4">
             <div className="w-16 h-16 bg-slate-800 rounded-full flex items-center justify-center border-2 border-slate-700 font-bold text-3xl text-slate-500 overflow-hidden">
               {/* Use the first letter as fallback avatar */}
               {data.channelInfo.title.charAt(0)}
             </div>
             <div>
               <h1 className="text-2xl font-bold text-white">{data.channelInfo.title}</h1>
               <div className="flex flex-wrap gap-2 text-sm text-slate-400 mt-1">
                 <span>{data.channelInfo.subscriberCount} Subs</span>
                 <span>•</span>
                 <span>{data.channelInfo.videoCount} Videos</span>
                 <span>•</span>
                 <span className="text-purple-400 font-medium">{data.channelInfo.detectedNiche}</span>
               </div>
             </div>
           </div>

           <div className="flex gap-3">
              <button onClick={downloadReport} className="bg-slate-800 hover:bg-slate-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors border border-slate-700">
                Download Report
              </button>
              <div className="bg-slate-950 px-4 py-2 rounded-lg border border-slate-800 text-center">
                 <div className="text-[10px] text-slate-500 uppercase font-bold">New Creator Success</div>
                 <div className={`text-xl font-bold ${data.successProbabilityForNewCreator >= 70 ? 'text-green-400' : 'text-yellow-400'}`}>
                    {data.successProbabilityForNewCreator}%
                 </div>
              </div>
           </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-slate-800">
        <button onClick={() => setActiveTab('overview')} className={`px-6 py-3 font-medium text-sm border-b-2 transition-colors ${activeTab === 'overview' ? 'border-purple-500 text-white' : 'border-transparent text-slate-500'}`}>Overview</button>
        <button onClick={() => setActiveTab('forensics')} className={`px-6 py-3 font-medium text-sm border-b-2 transition-colors ${activeTab === 'forensics' ? 'border-purple-500 text-white' : 'border-transparent text-slate-500'}`}>Forensics & Risk</button>
        <button onClick={() => setActiveTab('growth')} className={`px-6 py-3 font-medium text-sm border-b-2 transition-colors ${activeTab === 'growth' ? 'border-purple-500 text-white' : 'border-transparent text-slate-500'}`}>Growth Roadmap</button>
      </div>

      {/* Tab Content */}
      {activeTab === 'overview' && (
         <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Visual Analytics */}
            <div className="lg:col-span-2 space-y-6">
               {/* Line Chart */}
               <div className="bg-slate-800 p-6 rounded-xl border border-slate-700">
                  <h3 className="text-white font-bold mb-4">Channel Views Trend (Estimated)</h3>
                  <div className="h-[250px] w-full">
                     <ResponsiveContainer width="100%" height="100%">
                        <LineChart data={data.visualAnalytics?.viewsHistory || []}>
                           <XAxis dataKey="date" hide />
                           <YAxis stroke="#64748b" fontSize={12} tickFormatter={(v) => `${(v/1000).toFixed(0)}k`} />
                           <Tooltip contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', color: '#fff' }} />
                           <Line type="monotone" dataKey="views" stroke="#8b5cf6" strokeWidth={3} dot={false} />
                        </LineChart>
                     </ResponsiveContainer>
                  </div>
               </div>

               {/* Video Table */}
               <div className="bg-slate-800 rounded-xl border border-slate-700 overflow-hidden">
                  <div className="p-4 border-b border-slate-700">
                    <h3 className="text-white font-bold">Recent Video Performance</h3>
                  </div>
                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-sm text-slate-400">
                      <thead className="bg-slate-900/50 text-xs uppercase font-semibold">
                        <tr>
                          <th className="px-4 py-3">Video Title</th>
                          <th className="px-4 py-3">Topic</th>
                          <th className="px-4 py-3 text-center">CTR Pred.</th>
                          <th className="px-4 py-3 text-center">SEO Score</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-700">
                        {data.recentVideosAnalysis?.map((v, i) => (
                           <tr key={i} className="hover:bg-slate-700/20">
                              <td className="px-4 py-3 text-white max-w-xs truncate" title={v.title}>{v.title}</td>
                              <td className="px-4 py-3">
                                <span className="px-2 py-1 bg-slate-700 rounded text-xs text-slate-300">{v.topic}</span>
                              </td>
                              <td className="px-4 py-3 text-center text-xs">
                                 <span className={v.predictedCTR === 'High' ? 'text-green-400 font-bold' : 'text-slate-400'}>{v.predictedCTR}</span>
                              </td>
                              <td className="px-4 py-3 text-center">
                                 <div className="w-full bg-slate-700 h-1.5 rounded-full">
                                    <div className="bg-blue-500 h-1.5 rounded-full" style={{ width: `${v.titleSeoScore}%` }}></div>
                                 </div>
                              </td>
                           </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
               </div>
            </div>

            {/* Side Panel */}
            <div className="space-y-6">
               {/* Content Mix */}
               <div className="bg-slate-800 p-6 rounded-xl border border-slate-700">
                  <h3 className="text-white font-bold mb-4">Content Mix</h3>
                  <div className="h-[200px] w-full flex items-center justify-center relative">
                     <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                           <Pie data={pieData} innerRadius={60} outerRadius={80} paddingAngle={5} dataKey="value">
                              {pieData.map((entry, index) => (
                                 <Cell key={`cell-${index}`} fill={entry.name === 'Shorts' ? '#f43f5e' : '#3b82f6'} />
                              ))}
                           </Pie>
                        </PieChart>
                     </ResponsiveContainer>
                     <div className="absolute text-center">
                       <div className="text-2xl font-bold text-white">{data.channelInfo.videoCount}</div>
                       <div className="text-[10px] text-slate-500 uppercase">Total Uploads</div>
                     </div>
                  </div>
                  <div className="flex justify-center gap-6 mt-4">
                     <div className="flex items-center gap-2 text-xs text-slate-300">
                        <div className="w-3 h-3 bg-blue-500 rounded-full"></div> Long Form ({data.contentMix.longFormPct}%)
                     </div>
                     <div className="flex items-center gap-2 text-xs text-slate-300">
                        <div className="w-3 h-3 bg-rose-500 rounded-full"></div> Shorts ({data.contentMix.shortsPct}%)
                     </div>
                  </div>
               </div>

               {/* Competitors List */}
               <div className="bg-slate-800 p-6 rounded-xl border border-slate-700">
                  <h3 className="text-white font-bold mb-4">Top Competitors</h3>
                  <div className="space-y-3">
                     {data.competitors?.map((comp, i) => (
                        <div key={i} className="flex justify-between items-center text-sm border-b border-slate-700 pb-2 last:border-0 last:pb-0">
                           <div>
                              <div className="text-white font-medium">{comp.name}</div>
                              <div className="text-xs text-slate-500">{comp.subscriberCount} subs</div>
                           </div>
                           <div className="text-right">
                              <div className="text-xs font-bold text-purple-400">{comp.overlapPercentage}%</div>
                              <div className="text-[10px] text-slate-600">Overlap</div>
                           </div>
                        </div>
                     ))}
                  </div>
               </div>
            </div>
         </div>
      )}

      {activeTab === 'forensics' && (
         <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-slate-800 p-8 rounded-xl border border-slate-700 flex flex-col items-center justify-center text-center">
               <div className="text-sm font-bold text-slate-500 uppercase mb-4">Content Originality Score</div>
               <div className="relative w-40 h-40 flex items-center justify-center">
                  <svg className="w-full h-full transform -rotate-90">
                     <circle cx="80" cy="80" r="70" stroke="#1e293b" strokeWidth="12" fill="none" />
                     <circle cx="80" cy="80" r="70" stroke={data.forensics.originalityScore > 70 ? '#10b981' : '#f59e0b'} strokeWidth="12" fill="none" strokeDasharray="440" strokeDashoffset={440 - (440 * data.forensics.originalityScore / 100)} strokeLinecap="round" />
                  </svg>
                  <div className="absolute text-4xl font-bold text-white">{data.forensics.originalityScore}</div>
               </div>
               <p className="text-slate-400 mt-4 max-w-sm">{data.forensics.notes}</p>
            </div>

            <div className="space-y-4">
               <div className="bg-slate-800 p-6 rounded-xl border border-slate-700 flex items-center justify-between">
                  <div>
                     <h3 className="text-white font-bold">Copy Risk Score</h3>
                     <p className="text-xs text-slate-500">Probability of copying others</p>
                  </div>
                  <div className={`text-2xl font-bold ${data.forensics.copyRiskScore < 30 ? 'text-green-400' : 'text-red-400'}`}>
                     {data.forensics.copyRiskScore}/100
                  </div>
               </div>
               
               <div className="bg-slate-800 p-6 rounded-xl border border-slate-700 flex items-center justify-between">
                  <div>
                     <h3 className="text-white font-bold">Reused Content Risk</h3>
                     <p className="text-xs text-slate-500">Risk of demonetization</p>
                  </div>
                  <div className={`px-3 py-1 rounded text-sm font-bold ${
                     data.forensics.reusedContentRisk === 'Low' ? 'bg-green-900/30 text-green-400' : 
                     data.forensics.reusedContentRisk === 'High' ? 'bg-red-900/30 text-red-400' : 'bg-yellow-900/30 text-yellow-400'
                  }`}>
                     {data.forensics.reusedContentRisk}
                  </div>
               </div>

               <div className="bg-slate-800 p-6 rounded-xl border border-slate-700 flex items-center justify-between">
                  <div>
                     <h3 className="text-white font-bold">AI Content Detected</h3>
                     <p className="text-xs text-slate-500">Voiceover or Script</p>
                  </div>
                  <div className={`px-3 py-1 rounded text-sm font-bold ${data.forensics.aiContentDetected ? 'bg-purple-900/30 text-purple-400' : 'bg-slate-700 text-slate-400'}`}>
                     {data.forensics.aiContentDetected ? 'YES' : 'NO'}
                  </div>
               </div>
            </div>
         </div>
      )}

      {activeTab === 'growth' && (
         <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
               <div className="bg-indigo-900/20 border border-indigo-800 p-6 rounded-xl">
                  <h3 className="text-indigo-400 font-bold mb-2 uppercase text-sm">30 Day Projection</h3>
                  <p className="text-white text-lg leading-relaxed">{data.growthPrediction.oneMonthProjection}</p>
               </div>
               <div className="bg-blue-900/20 border border-blue-800 p-6 rounded-xl">
                  <h3 className="text-blue-400 font-bold mb-2 uppercase text-sm">90 Day Projection</h3>
                  <p className="text-white text-lg leading-relaxed">{data.growthPrediction.threeMonthProjection}</p>
               </div>
            </div>

            <div className="bg-slate-800 p-6 rounded-xl border border-slate-700">
               <h3 className="text-white font-bold mb-4">Unique Angles & Pitfalls</h3>
               <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div>
                     <h4 className="text-green-400 text-sm font-bold uppercase mb-3">Opportunities</h4>
                     <ul className="space-y-2">
                        {data.growthPrediction.uniqueAngles.map((angle, i) => (
                           <li key={i} className="flex gap-2 text-slate-300 text-sm">
                              <span className="text-green-500">➜</span> {angle}
                           </li>
                        ))}
                     </ul>
                  </div>
                  <div>
                     <h4 className="text-red-400 text-sm font-bold uppercase mb-3">Potential Pitfalls</h4>
                     <ul className="space-y-2">
                        {data.growthPrediction.potentialPitfalls.map((pitfall, i) => (
                           <li key={i} className="flex gap-2 text-slate-300 text-sm">
                              <span className="text-red-500">⚠</span> {pitfall}
                           </li>
                        ))}
                     </ul>
                  </div>
               </div>
            </div>
         </div>
      )}

    </div>
  );
};
