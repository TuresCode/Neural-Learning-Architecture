/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Activity, 
  Zap, 
  ArrowRight, 
  Info, 
  RefreshCw, 
  Play, 
  Pause,
  Layers,
  Cpu,
  BrainCircuit
} from 'lucide-react';
import { NetworkVisualizer } from './components/NetworkVisualizer';
import { DetailedPCVisualizer } from './components/DetailedPCVisualizer';
import { BlogPost } from './components/BlogPost';
import { NETWORK_LAYERS, COLORS } from './constants';
import { cn } from './lib/utils';

export default function App() {
  const [isAnimating, setIsAnimating] = useState(true);
  const [currentPhase, setCurrentPhase] = useState<0 | 1 | 2>(0); // 0: Idle, 1: Forward/Prediction, 2: Backward/Error
  const [activations, setActivations] = useState<number[][]>([]);
  const [errors, setErrors] = useState<number[][]>([]);
  const [activeTab, setActiveTab] = useState<'intro' | 'backprop' | 'predictive'>('intro');

  useEffect(() => {
    const handleSwitchTab = (e: any) => setActiveTab(e.detail);
    window.addEventListener('switch-tab', handleSwitchTab);
    return () => window.removeEventListener('switch-tab', handleSwitchTab);
  }, []);

  const generateData = useCallback(() => {
    const newActivations = NETWORK_LAYERS.map(count => 
      Array.from({ length: count }, () => Math.random())
    );
    const newErrors = NETWORK_LAYERS.map(count => 
      Array.from({ length: count }, () => Math.random() * 0.4)
    );
    setActivations(newActivations);
    setErrors(newErrors);
  }, []);

  useEffect(() => {
    generateData();
  }, [generateData]);

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isAnimating) {
      interval = setInterval(() => {
        setCurrentPhase(p => {
          if (p === 0) return 1;
          if (p === 1) return 2;
          generateData();
          return 0;
        });
      }, 5000);
    }
    return () => clearInterval(interval);
  }, [isAnimating, generateData]);

  const getPhaseDescription = () => {
    if (activeTab === 'backprop') {
      if (currentPhase === 1) return "Forward Pass: Input signals propagate through weights to generate a final output prediction.";
      if (currentPhase === 2) return "Backward Pass: Global error is calculated at the output and pushed back to update all synapses.";
      return "Idle: Waiting for next training sample.";
    } else {
      if (currentPhase === 1) return "Top-Down Prediction: Higher layers project their internal model downward to predict lower-level activity.";
      if (currentPhase === 2) return "Bottom-Up Error: Lower layers send only the 'surprise' (prediction error) upward to update the model.";
      return "Idle: Local synapses are stabilizing their predictions.";
    }
  };

  return (
    <div className="min-h-screen bg-[#0f172a] text-slate-300 font-sans selection:bg-emerald-500/30">
      {/* Header */}
      <header className="border-b border-slate-800 bg-slate-900/80 backdrop-blur-sm sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 md:px-6 h-auto md:h-14 py-4 md:py-0 flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <BrainCircuit className="text-emerald-500 w-5 h-5" />
            <h1 className="text-sm font-semibold tracking-tight text-white">
              Neural Learning Architectures
            </h1>
          </div>

          <nav className="flex items-center gap-1 bg-slate-800/30 p-1 rounded-lg border border-slate-700/50 overflow-x-auto max-w-full no-scrollbar">
            {(['intro', 'backprop', 'predictive'] as const).map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={cn(
                  "px-3 md:px-4 py-1.5 md:py-1 rounded text-[10px] md:text-[11px] font-medium transition-all capitalize whitespace-nowrap",
                  activeTab === tab 
                    ? "bg-slate-700 text-white shadow-sm" 
                    : "text-slate-500 hover:text-slate-300"
                )}
              >
                {tab === 'intro' ? 'Introduction' : tab === 'backprop' ? 'Backpropagation' : 'Predictive Coding'}
              </button>
            ))}
          </nav>

          <div className="hidden md:flex items-center gap-3">
            {activeTab !== 'intro' && (
              <button 
                onClick={() => setIsAnimating(!isAnimating)}
                className="flex items-center gap-2 px-3 py-1 bg-slate-800 hover:bg-slate-700 rounded text-[11px] font-medium transition-colors"
              >
                {isAnimating ? <><Pause size={12} /> Pause</> : <><Play size={12} /> Resume</>}
              </button>
            )}
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-6 py-10">
        <AnimatePresence mode="wait">
          {activeTab === 'intro' ? (
            <BlogPost key="blog" />
          ) : (
            <motion.div 
              key={activeTab}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="space-y-12"
            >
              {/* Theory Section - Horizontal Layout */}
              <section className="space-y-6">
                <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 border-b border-slate-800 pb-6">
                  <div className="max-w-2xl">
                    <h2 className="text-xl md:text-2xl font-semibold text-white mb-2">
                      {activeTab === 'backprop' ? 'Classical AI: Backpropagation' : 'Biological Intelligence: Predictive Coding'}
                    </h2>
                    <p className="text-sm md:text-base text-slate-400">
                      {activeTab === 'backprop' 
                        ? 'Modern AI uses global optimization to minimize error. Information flows forward, while gradients flow backward to update every weight in the system.' 
                        : 'The brain is a generative model that minimizes surprise. Higher layers predict lower ones, and only the unpredicted "residual error" is passed up.'}
                    </p>
                  </div>
                  <div className="bg-slate-800/50 border border-slate-700/50 p-4 rounded-xl w-full md:min-w-[300px] md:w-auto">
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="text-[10px] font-bold uppercase tracking-widest text-emerald-500 flex items-center gap-2">
                        <Activity size={12} /> Live Process Status
                      </h4>
                      <button 
                        onClick={() => setIsAnimating(!isAnimating)}
                        className="md:hidden p-1 bg-slate-700 rounded text-white"
                      >
                        {isAnimating ? <Pause size={12} /> : <Play size={12} />}
                      </button>
                    </div>
                    <div className="text-xs font-mono text-slate-300">
                      {getPhaseDescription()}
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  {activeTab === 'backprop' ? (
                    <>
                      <div className="p-5 rounded-2xl bg-slate-800/30 border border-slate-700/50">
                        <h3 className="text-xs font-bold uppercase tracking-wider text-emerald-500 mb-3">01. Global View</h3>
                        <p className="text-xs leading-relaxed text-slate-400">
                          Requires a central "supervisor" that knows the state of every neuron to calculate the exact gradient for every weight.
                        </p>
                      </div>
                      <div className="p-5 rounded-2xl bg-slate-800/30 border border-slate-700/50">
                        <h3 className="text-xs font-bold uppercase tracking-wider text-emerald-500 mb-3">02. Weight Transport</h3>
                        <p className="text-xs leading-relaxed text-slate-400">
                          The "Backward Pass" uses the same weights as the "Forward Pass," a feat that biological synapses cannot easily perform.
                        </p>
                      </div>
                      <div className="p-5 rounded-2xl bg-slate-800/30 border border-slate-700/50">
                        <h3 className="text-xs font-bold uppercase tracking-wider text-emerald-500 mb-3">03. High Efficiency</h3>
                        <p className="text-xs leading-relaxed text-slate-400">
                          Extremely powerful for static datasets where global gradients can be calculated precisely across massive batches.
                        </p>
                      </div>
                    </>
                  ) : (
                    <>
                      <div className="p-5 rounded-2xl bg-slate-800/30 border border-slate-700/50">
                        <h3 className="text-xs font-bold uppercase tracking-wider text-blue-500 mb-3">01. Local Inference</h3>
                        <p className="text-xs leading-relaxed text-slate-400">
                          Each layer acts as an independent agent, trying to explain the activity of the layer below it using its own internal model.
                        </p>
                      </div>
                      <div className="p-5 rounded-2xl bg-slate-800/30 border border-slate-700/50">
                        <h3 className="text-xs font-bold uppercase tracking-wider text-blue-500 mb-3">02. Surprise Minimization</h3>
                        <p className="text-xs leading-relaxed text-slate-400">
                          The brain doesn't process raw data; it processes the "prediction error"—the part of the world it didn't expect.
                        </p>
                      </div>
                      <div className="p-5 rounded-2xl bg-slate-800/30 border border-slate-700/50">
                        <h3 className="text-xs font-bold uppercase tracking-wider text-blue-500 mb-3">03. Bio-Plausibility</h3>
                        <p className="text-xs leading-relaxed text-slate-400">
                          Matches the hierarchical, feedback-heavy structure of the human cortex where feedback outnumbers feedforward connections.
                        </p>
                      </div>
                    </>
                  )}
                </div>
              </section>

              {/* Visualization Section - Full Width */}
              <section className="space-y-8">
                <div className="bg-slate-900/50 border border-slate-800 rounded-3xl p-4 md:p-8 flex flex-col shadow-2xl h-[500px] md:h-[600px]">
                  <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4 shrink-0">
                    <div className="flex flex-wrap items-center gap-4 md:gap-6">
                      <div className="flex items-center gap-2">
                        <div className="w-2 md:w-3 h-2 md:h-3 rounded-full bg-emerald-600 shadow-[0_0_10px_rgba(5,150,105,0.5)]" />
                        <span className="text-[10px] md:text-xs uppercase tracking-widest text-slate-400 font-medium">Activation</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="w-2 md:w-3 h-2 md:h-3 rounded-full bg-red-600 shadow-[0_0_10px_rgba(220,38,38,0.5)]" />
                        <span className="text-[10px] md:text-xs uppercase tracking-widest text-slate-400 font-medium">Error Signal</span>
                      </div>
                      {activeTab === 'predictive' && (
                        <div className="flex items-center gap-2">
                          <div className="w-2 md:w-3 h-2 md:h-3 rounded-full bg-blue-600 shadow-[0_0_10px_rgba(37,99,235,0.5)]" />
                          <span className="text-[10px] md:text-xs uppercase tracking-widest text-slate-400 font-medium">Prediction</span>
                        </div>
                      )}
                    </div>
                    <div className="px-3 py-1 bg-slate-800 rounded-full border border-slate-700 text-[9px] md:text-[10px] font-mono text-slate-400 uppercase tracking-widest w-fit">
                      {activeTab === 'backprop' ? 'Backpropagation' : activeTab === 'predictive' ? 'Predictive Coding' : activeTab} • Phase {currentPhase}
                    </div>
                  </div>

                  <div className="flex-1 relative">
                    <NetworkVisualizer 
                      type={activeTab as 'backprop' | 'predictive'}
                      layers={NETWORK_LAYERS}
                      activations={activations}
                      errors={errors}
                      isAnimating={isAnimating}
                      currentStep={currentPhase}
                    />
                  </div>
                </div>

                {activeTab === 'predictive' && (
                  <motion.div
                    initial={{ opacity: 0, y: 40 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="h-[850px] md:h-[800px]"
                  >
                    <DetailedPCVisualizer />
                  </motion.div>
                )}

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pb-12">
                  <div className="p-6 bg-slate-900/40 rounded-2xl border border-slate-800 flex flex-col items-center text-center">
                    <div className="text-[10px] uppercase tracking-[0.2em] text-slate-500 mb-2">Connectivity</div>
                    <div className="text-lg font-semibold text-white">
                      {activeTab === 'backprop' ? 'Global Feedforward' : 'Local Feedback Loops'}
                    </div>
                  </div>
                  <div className="p-6 bg-slate-900/40 rounded-2xl border border-slate-800 flex flex-col items-center text-center">
                    <div className="text-[10px] uppercase tracking-[0.2em] text-slate-500 mb-2">Learning Signal</div>
                    <div className="text-lg font-semibold text-white">
                      {activeTab === 'backprop' ? 'Gradient Descent' : 'Inference Error'}
                    </div>
                  </div>
                  <div className="p-6 bg-slate-900/40 rounded-2xl border border-slate-800 flex flex-col items-center text-center">
                    <div className="text-[10px] uppercase tracking-[0.2em] text-slate-500 mb-2">Cortical Match</div>
                    <div className="text-lg font-semibold text-white">
                      {activeTab === 'backprop' ? 'Low Correlation' : 'High Correlation'}
                    </div>
                  </div>
                </div>
              </section>
            </motion.div>
          )}
        </AnimatePresence>
      </main>
    </div>
  );
}
