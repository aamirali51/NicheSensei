
import React, { useState, useEffect } from 'react';

interface Props {
  type: 'general' | 'video' | 'channel';
}

const STEPS = {
  general: [
    "Authenticating with YouTube Data API v3...",
    "Fetching verified channel statistics & uploads...",
    "Computing Z-Scores across real video history...",
    "Clustering high-RPM sub-niches using advanced NLP embeddings...",
    "Mapping competitor shadow networks & detecting copycat chains...",
    "Calculating Success Probability based on market saturation & demand...",
    "Synthesizing actionable 10-video roadmap for immediate dominance."
  ],
  video: [
    "Extracting video metadata & transcript...",
    "Generating audio fingerprint & visual hashes...",
    "Scanning global database for source candidates...",
    "Computing multi-modal similarity scores (Transcript, Audio, Visual)...",
    "Evaluating originality status & attribution...",
    "Identifying high-value micro-niche opportunities...",
    "Building precise replication roadmap..."
  ],
  channel: [
    "Profiling complete channel history & upload velocity...",
    "Mapping full competitor influence graph...",
    "Detecting originator vs. copycat behavioral patterns...",
    "Identifying structural content vulnerabilities...",
    "Calculating competitive entry points...",
    "Finalizing deep dive intelligence report..."
  ]
};

const FOOTER_NOTES = {
  general: "Sensei is analyzing verified data points to find your winning angle.",
  video: "Forensic engine is comparing content against a vast database of recent uploads.",
  channel: "Deep dive mode activated: uncovering hidden competitor weaknesses."
};

export const LoadingOverlay: React.FC<Props> = ({ type }) => {
  const [currentStep, setCurrentStep] = useState(0);
  const steps = STEPS[type];

  useEffect(() => {
    // Animate through steps, but hang on the last one until process finishes
    const interval = setInterval(() => {
      setCurrentStep((prev) => {
        if (prev < steps.length - 1) return prev + 1;
        return prev;
      });
    }, 800); // Advance every 800ms

    return () => clearInterval(interval);
  }, [steps.length]);

  return (
    <div className="flex flex-col items-center justify-center py-16 animate-fade-in px-4">
      {/* Central Tech Spinner */}
      <div className="relative w-24 h-24 mb-10">
        <div className="absolute inset-0 border-t-4 border-purple-500 border-solid rounded-full animate-spin"></div>
        <div className="absolute inset-3 border-r-4 border-blue-500 border-solid rounded-full animate-spin-reverse"></div>
        <div className="absolute inset-0 flex items-center justify-center">
          <span className="text-2xl font-bold text-white animate-pulse">N</span>
        </div>
      </div>

      {/* Steps Container */}
      <div className="w-full max-w-lg bg-slate-900/80 border border-slate-800 rounded-xl p-6 backdrop-blur-md shadow-2xl">
        <h3 className="text-sm font-bold text-purple-400 uppercase tracking-widest mb-4 border-b border-slate-800 pb-2 flex justify-between">
          <span>Sensei Protocol</span>
          <span className="text-slate-600">v2.5.0</span>
        </h3>
        <div className="space-y-3">
          {steps.map((step, index) => {
            const isCompleted = index < currentStep;
            const isCurrent = index === currentStep;
            const isPending = index > currentStep;

            return (
              <div 
                key={index} 
                className={`flex items-start gap-3 text-sm transition-all duration-300 ${
                  isPending ? 'opacity-30' : 'opacity-100'
                }`}
              >
                {/* Status Icon */}
                <div className={`w-5 h-5 mt-0.5 flex-shrink-0 flex items-center justify-center rounded-full border ${
                  isCompleted 
                    ? 'bg-green-500/20 border-green-500 text-green-500' 
                    : isCurrent 
                      ? 'bg-purple-500/20 border-purple-500 text-purple-400 animate-pulse'
                      : 'border-slate-700 bg-slate-800'
                }`}>
                  {isCompleted && (
                    <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                    </svg>
                  )}
                  {isCurrent && (
                    <div className="w-1.5 h-1.5 bg-purple-500 rounded-full"></div>
                  )}
                </div>

                {/* Text */}
                <span className={`font-mono leading-relaxed ${
                  isCompleted ? 'text-slate-400' : 
                  isCurrent ? 'text-white font-bold' : 
                  'text-slate-600'
                }`}>
                  {step}
                </span>
              </div>
            );
          })}
        </div>
        
        {/* Progress Bar */}
        <div className="mt-6 h-1 w-full bg-slate-800 rounded-full overflow-hidden mb-4">
          <div 
            className="h-full bg-gradient-to-r from-purple-500 to-blue-500 transition-all duration-500 ease-out"
            style={{ width: `${((currentStep + 1) / steps.length) * 100}%` }}
          ></div>
        </div>

        {/* Footer Note */}
        <div className="bg-slate-950/50 p-3 rounded border border-slate-800 text-xs text-slate-500 italic leading-relaxed text-center">
          {FOOTER_NOTES[type]}
        </div>
      </div>
    </div>
  );
};
