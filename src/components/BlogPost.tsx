import React from 'react';
import { motion } from 'motion/react';
import { BookOpen, ExternalLink, Quote, ArrowRight } from 'lucide-react';

export const BlogPost: React.FC = () => {
  return (
    <motion.article 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="max-w-4xl mx-auto space-y-12 pb-20"
    >
      {/* Hero Section */}
      <header className="space-y-6 text-center">
        <div className="flex flex-col items-center gap-4">
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-emerald-500/10 border border-emerald-500/20 rounded-full text-emerald-500 text-[10px] font-bold uppercase tracking-widest">
            Research Deep Dive
          </div>
          <div className="text-[10px] font-mono text-slate-500 uppercase tracking-[0.3em]">
            Published by <span className="text-emerald-500 font-bold">Turescode</span>
          </div>
        </div>
        <h1 className="text-4xl md:text-5xl font-bold text-white tracking-tight leading-tight">
          The Architecture of Learning: <br/>
          <span className="text-slate-400 font-light italic">Backpropagation vs. Predictive Coding</span>
        </h1>
        <p className="text-lg text-slate-400 max-w-2xl mx-auto leading-relaxed">
          Exploring the fundamental gap between how machines learn and how biological brains might actually process information.
        </p>
      </header>

      {/* Content */}
      <div className="prose prose-invert prose-slate max-w-none space-y-8 text-slate-300 leading-relaxed">
        <section className="space-y-4">
          <h2 className="text-2xl font-semibold text-white">The Quest for Biological Plausibility</h2>
          <p>
            For decades, the field of Artificial Intelligence has been dominated by a single algorithm: <strong>Backpropagation (BP)</strong>. While BP has enabled the current revolution in Deep Learning, from Large Language Models to computer vision, a nagging question remains for neuroscientists: <em>Is this how the brain actually works?</em>
          </p>
          <p>
            The consensus is largely "no." While BP is mathematically elegant and computationally efficient, it faces several "biological implausibility" hurdles—most notably the <strong>Weight Transport Problem</strong>. In BP, the backward pass requires the exact same weights used in the forward pass, a feat that biological synapses, which are often unidirectional, cannot easily replicate.
          </p>
        </section>

        <section className="p-8 bg-slate-800/30 border border-slate-700/50 rounded-3xl relative overflow-hidden">
          <Quote className="absolute top-4 right-4 text-slate-700 w-12 h-12 -z-10" />
          <p className="text-lg italic text-white font-serif leading-relaxed">
            "The brain is a inference engine. It doesn't just react to sensory input; it actively predicts it. Learning is the process of minimizing the surprise when those predictions fail."
          </p>
          <div className="mt-4 text-sm font-mono text-emerald-500">— Theoretical Framework of the Bayesian Brain</div>
        </section>

        <section className="space-y-4">
          <h2 className="text-2xl font-semibold text-white">Predictive Coding: The Brain as a Prediction Machine</h2>
          <p>
            <strong>Predictive Coding (PC)</strong> offers a compelling alternative. First popularized in the context of the visual cortex by Rao and Ballard (1999), PC suggests that the brain is organized hierarchically to minimize <strong>prediction error</strong>.
          </p>
          <p>
            In this framework, higher-level layers generate "top-down" predictions about the state of lower-level layers. The lower layers then compare these predictions with their actual activity (sensory input) and send only the <strong>residual error</strong>—the part of the signal that wasn't predicted—back up the hierarchy.
          </p>
          <ul className="list-disc pl-6 space-y-2 text-slate-400">
            <li><strong>Local Learning:</strong> Unlike BP, which requires global error signals, PC learning happens locally at each synapse.</li>
            <li><strong>Simultaneous Processing:</strong> Inference and learning can happen at the same time across all layers.</li>
            <li><strong>Energy Efficiency:</strong> By only processing "surprise," the brain saves massive amounts of metabolic energy.</li>
          </ul>
        </section>

        <section className="grid grid-cols-1 md:grid-cols-2 gap-8 py-8">
          <div className="space-y-3">
            <h3 className="text-lg font-medium text-emerald-500">Backpropagation</h3>
            <div className="text-sm space-y-2">
              <p><strong>Goal:</strong> Minimize a global cost function.</p>
              <p><strong>Flow:</strong> Sequential (Forward then Backward).</p>
              <p><strong>Hardware:</strong> Optimized for GPUs and synchronous clusters.</p>
            </div>
          </div>
          <div className="space-y-3">
            <h3 className="text-lg font-medium text-blue-500">Predictive Coding</h3>
            <div className="text-sm space-y-2">
              <p><strong>Goal:</strong> Minimize local prediction errors.</p>
              <p><strong>Flow:</strong> Recurrent and Simultaneous.</p>
              <p><strong>Hardware:</strong> Optimized for neuromorphic and asynchronous systems.</p>
            </div>
          </div>
        </section>

        <section className="space-y-4">
          <h2 className="text-2xl font-semibold text-white">The Path to AGI: Is Efficiency the Key?</h2>
          <p>
            As we push toward <strong>Artificial General Intelligence (AGI)</strong>, the brute-force scaling of Backpropagation-based models faces a looming wall: energy consumption. Modern LLMs require massive data centers and megawatts of power, whereas the human brain operates on roughly 20 watts—the power of a dim lightbulb.
          </p>
          <p>
            Predictive Coding may be the architectural breakthrough needed to bridge this gap. By shifting from global optimization to <strong>local inference</strong>, PC enables asynchronous, decentralized learning that is far more compatible with the next generation of <em>neuromorphic hardware</em>.
          </p>
          <p>
            If AGI requires a system that can learn continuously in real-time from a stream of sensory data—rather than static datasets—then the "Prediction Machine" model isn't just a biological curiosity; it's a blueprint for the most efficient intelligence framework we know of.
          </p>
        </section>

        <div className="pt-12 flex justify-center">
          <button 
            onClick={() => window.dispatchEvent(new CustomEvent('switch-tab', { detail: 'backprop' }))}
            className="flex items-center gap-2 px-8 py-4 bg-emerald-600 hover:bg-emerald-500 text-white rounded-2xl font-bold shadow-lg shadow-emerald-900/20 transition-all active:scale-95 group"
          >
            Explore the Models
            <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
          </button>
        </div>

        {/* References */}
        <section className="pt-12 border-t border-slate-800 space-y-6">
          <div className="flex items-center gap-2 text-white font-semibold">
            <BookOpen size={18} className="text-emerald-500" />
            <h3>Key References</h3>
          </div>
          <ul className="space-y-4 text-sm text-slate-500 font-mono">
            <li className="flex gap-4 group">
              <span className="text-emerald-500 shrink-0">[01]</span>
              <span>
                Rao, R. P., & Ballard, D. H. (1999). <span className="text-slate-400">Predictive coding in the visual cortex: a functional interpretation of some extra-classical receptive-field effects.</span> Nature Neuroscience.
                <a href="https://www.nature.com/articles/nn0199_79" target="_blank" className="inline-flex items-center gap-1 ml-2 text-blue-500 hover:underline"><ExternalLink size={10} /></a>
              </span>
            </li>
            <li className="flex gap-4 group">
              <span className="text-emerald-500 shrink-0">[02]</span>
              <span>
                Friston, K. (2010). <span className="text-slate-400">The free-energy principle: a rough guide to the brain?</span> Nature Reviews Neuroscience.
                <a href="https://www.nature.com/articles/nrn2787" target="_blank" className="inline-flex items-center gap-1 ml-2 text-blue-500 hover:underline"><ExternalLink size={10} /></a>
              </span>
            </li>
            <li className="flex gap-4 group">
              <span className="text-emerald-500 shrink-0">[03]</span>
              <span>
                Whittington, J. C., & Bogacz, R. (2017). <span className="text-slate-400">An Approximation of Backpropagation that Uses Local Learning.</span> Neural Computation.
                <a href="https://pubmed.ncbi.nlm.nih.gov/28333583/" target="_blank" className="inline-flex items-center gap-1 ml-2 text-blue-500 hover:underline"><ExternalLink size={10} /></a>
              </span>
            </li>
            <li className="flex gap-4 group">
              <span className="text-emerald-500 shrink-0">[04]</span>
              <span>
                Hinton, G. E. (2022). <span className="text-slate-400">The Forward-Forward Algorithm: Some Preliminary Investigations.</span> arXiv preprint.
                <a href="https://arxiv.org/abs/2212.13345" target="_blank" className="inline-flex items-center gap-1 ml-2 text-blue-500 hover:underline"><ExternalLink size={10} /></a>
              </span>
            </li>
          </ul>
        </section>
      </div>
    </motion.article>
  );
};
