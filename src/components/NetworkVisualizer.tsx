import React, { useEffect, useRef, useMemo, useCallback } from 'react';
import * as d3 from 'd3';
import { Neuron, Link, COLORS } from '../constants';

interface NetworkVisualizerProps {
  type: 'backprop' | 'predictive';
  layers: number[];
  activations: number[][];
  errors: number[][];
  isAnimating: boolean;
  currentStep: number;
}

export const NetworkVisualizer: React.FC<NetworkVisualizerProps> = ({
  type,
  layers,
  activations,
  errors,
  isAnimating,
  currentStep,
}) => {
  const svgRef  = useRef<SVGSVGElement>(null);
  const wrapRef = useRef<HTMLDivElement>(null);

  /* ── Nodes ─────────────────────────────────────────────────────── */
  const nodes = useMemo(() => {
    const n: Neuron[] = [];
    layers.forEach((count, lIndex) => {
      for (let i = 0; i < count; i++) {
        n.push({
          id: `l${lIndex}-n${i}`,
          layer: lIndex,
          index: i,
          activation: activations[lIndex]?.[i] || 0,
          error: errors[lIndex]?.[i] || 0,
        });
      }
    });
    return n;
  }, [layers, activations, errors]);

  /* ── Links ─────────────────────────────────────────────────────── */
  const links = useMemo(() => {
    const l: Link[] = [];
    for (let i = 0; i < layers.length - 1; i++) {
      for (let j = 0; j < layers[i]; j++) {
        for (let k = 0; k < layers[i + 1]; k++) {
          if (type === 'backprop') {
            l.push({ source: `l${i}-n${j}`, target: `l${i+1}-n${k}`, weight: Math.random(), direction: 'up' });
          } else {
            l.push({ source: `l${i}-n${j}`,   target: `l${i+1}-n${k}`, weight: Math.random(), direction: 'up' });
            l.push({ source: `l${i+1}-n${k}`, target: `l${i}-n${j}`,   weight: Math.random(), direction: 'down' });
          }
        }
      }
    }
    return l;
  }, [layers, type]);

  /* ── Draw ──────────────────────────────────────────────────────── */
  const draw = useCallback(() => {
    if (!svgRef.current) return;
    const W = svgRef.current.getBoundingClientRect().width;
    const H = svgRef.current.getBoundingClientRect().height;
    if (!W || !H) return;

    const svg = d3.select(svgRef.current);
    svg.selectAll('*').remove();

    const isMobile = W < 520;
    const isTablet = W < 800;

    // Margins — small top/bottom to reduce vertical spread
    const mg = {
      top:    isMobile ? 24 : 32,
      right:  isMobile ? 16 : 40,
      bottom: isMobile ? 10 : 16,
      left:   isMobile ? 16 : 40,
    };
    const iW = W - mg.left - mg.right;
    const iH = H - mg.top  - mg.bottom;

    const g = svg.append('g').attr('transform', `translate(${mg.left},${mg.top})`);

    // Node radius derived from a compressed vertical band
    const maxNodes = Math.max(...layers);
    // Use only 55% of height for the neuron spread so they sit compact
    const usableH = iH * 0.55;
    const radiusFromHeight = usableH / (maxNodes * 2.4);
    const nodeR = Math.max(isMobile ? 5 : 7, Math.min(isMobile ? 9 : 13, radiusFromHeight));

    // X: evenly spread layers across full width
    const xScale = d3.scalePoint<number>()
      .domain(d3.range(layers.length))
      .range([0, iW])
      .padding(isMobile ? 0.3 : 0.2);

    // Y: neurons centred in a compressed band — high padding = tighter spread
    const getYScale = (layerIndex: number) =>
      d3.scalePoint<number>()
        .domain(d3.range(layers[layerIndex]))
        .range([iH * 0.2, iH * 0.8])
        .padding(isMobile ? 0.8 : 0.7);

    const nodeMap = new Map(nodes.map(n => [n.id, n]));

    // Defs: glow filters for particles
    const defs = svg.append('defs');
    const makeGlow = (id: string, color: string) => {
      const f = defs.append('filter').attr('id', id)
        .attr('x','-80%').attr('y','-80%').attr('width','260%').attr('height','260%');
      f.append('feGaussianBlur').attr('in','SourceGraphic').attr('stdDeviation', isMobile ? 2 : 3).attr('result','blur');
      f.append('feFlood').attr('flood-color', color).attr('flood-opacity', 0.7).attr('result','color');
      f.append('feComposite').attr('in','color').attr('in2','blur').attr('operator','in').attr('result','glow');
      const m = f.append('feMerge');
      m.append('feMergeNode').attr('in','glow');
      m.append('feMergeNode').attr('in','SourceGraphic');
    };
    makeGlow('glow-act',  COLORS.activation);
    makeGlow('glow-err',  COLORS.error);
    makeGlow('glow-pred', COLORS.prediction);

    // Layer labels — only Input / Output on mobile to avoid crowding
    layers.forEach((_, lIndex) => {
      const show = isMobile
        ? (lIndex === 0 || lIndex === layers.length - 1)
        : true;
      if (!show) return;
      const label = lIndex === 0 ? 'Input'
        : lIndex === layers.length - 1 ? 'Output'
        : `H${lIndex}`;
      g.append('text')
        .attr('x', xScale(lIndex)!)
        .attr('y', -10)
        .attr('text-anchor', 'middle')
        .attr('fill', '#475569')
        .attr('font-size', isMobile ? '8px' : '10px')
        .attr('font-family', 'ui-monospace, monospace')
        .attr('letter-spacing', '0.06em')
        .text(label);
    });

    // Links
    g.selectAll('.link')
      .data(links)
      .enter()
      .append('line')
      .attr('x1', d => xScale(nodeMap.get(d.source)!.layer)!)
      .attr('y1', d => getYScale(nodeMap.get(d.source)!.layer)(nodeMap.get(d.source)!.index)!)
      .attr('x2', d => xScale(nodeMap.get(d.target)!.layer)!)
      .attr('y2', d => getYScale(nodeMap.get(d.target)!.layer)(nodeMap.get(d.target)!.index)!)
      .attr('stroke', d => {
        if (type === 'predictive')
          return d.direction === 'down' ? COLORS.prediction : COLORS.error;
        return COLORS.neutral;
      })
      .attr('stroke-dasharray', d =>
        type === 'predictive' && d.direction === 'down' ? '4,4' : '0'
      )
      // fewer, lighter links on mobile to reduce visual noise
      .attr('opacity', isMobile ? 0.08 : 0.15)
      .attr('stroke-width', isMobile ? 0.6 : 1);

    // Nodes
    const nodeGroups = g.selectAll('.node')
      .data(nodes)
      .enter()
      .append('g')
      .attr('transform', d =>
        `translate(${xScale(d.layer)},${getYScale(d.layer)(d.index)})`
      );

    nodeGroups.append('circle')
      .attr('r', nodeR)
      .attr('fill', COLORS.bg)
      .attr('stroke', '#334155')
      .attr('stroke-width', isMobile ? 0.8 : 1);

    nodeGroups.append('circle')
      .attr('r', d => nodeR * 0.72 * Math.abs(d.activation))
      .attr('fill', COLORS.activation)
      .attr('opacity', 0.45);

    nodeGroups.append('circle')
      .attr('r', nodeR + (isMobile ? 2 : 3))
      .attr('fill', 'none')
      .attr('stroke', COLORS.error)
      .attr('stroke-width', d => (isMobile ? 1.2 : 2) * Math.abs(d.error))
      .attr('opacity', d => Math.abs(d.error) > 0.05 ? 0.55 : 0);

    // Animation
    if (!isAnimating) return;

    const particles = g.append('g');

    const animateParticle = (
      sourceId: string,
      targetId: string,
      color: string,
      delay = 0,
      glowId = 'glow-act'
    ) => {
      const source = nodeMap.get(sourceId)!;
      const target = nodeMap.get(targetId)!;
      particles.append('circle')
        .attr('r', isMobile ? 2 : 3)
        .attr('fill', color)
        .attr('filter', `url(#${glowId})`)
        .attr('cx', xScale(source.layer)!)
        .attr('cy', getYScale(source.layer)(source.index)!)
        .attr('opacity', 0.9)
        .transition()
        .delay(delay)
        .duration(isMobile ? 550 : 800)
        .ease(d3.easeCubicInOut)
        .attr('cx', xScale(target.layer)!)
        .attr('cy', getYScale(target.layer)(target.index)!)
        .attr('opacity', 0)
        .remove();
    };

    // Backprop
    if (type === 'backprop') {
      if (currentStep === 1) {
        for (let lIndex = 0; lIndex < layers.length - 1; lIndex++) {
          links
            .filter(l => nodeMap.get(l.source)!.layer === lIndex && nodeMap.get(l.target)!.layer === lIndex + 1)
            .forEach(l => animateParticle(l.source, l.target, COLORS.activation, lIndex * (isMobile ? 400 : 600), 'glow-act'));
        }
      }
      if (currentStep === 2) {
        for (let lIndex = layers.length - 1; lIndex > 0; lIndex--) {
          links
            .filter(l => nodeMap.get(l.source)!.layer === lIndex - 1 && nodeMap.get(l.target)!.layer === lIndex)
            .forEach(l => animateParticle(l.target, l.source, COLORS.error, (layers.length - lIndex - 1) * (isMobile ? 400 : 600), 'glow-err'));
        }
      }
    }

    // Predictive coding
    if (type === 'predictive') {
      if (currentStep === 1) {
        links
          .filter(l => l.direction === 'down')
          .forEach(l => animateParticle(l.source, l.target, COLORS.prediction, 0, 'glow-pred'));
      }
      if (currentStep === 2) {
        links
          .filter(l => l.direction === 'up')
          .forEach(l => animateParticle(l.source, l.target, COLORS.error, 0, 'glow-err'));
      }
    }
  }, [nodes, links, layers, isAnimating, type, currentStep]);

  useEffect(() => {
    draw();
    const ro = new ResizeObserver(() => draw());
    if (wrapRef.current) ro.observe(wrapRef.current);
    return () => ro.disconnect();
  }, [draw]);

  return (
    <div ref={wrapRef} className="w-full relative bg-slate-900/50 rounded-xl border border-slate-800 overflow-hidden" style={{ height: 'clamp(280px, 40vh, 480px)' }}>
      <div className="absolute top-5 left-3 z-10">
        <span className="text-[9px] md:text-[10px] font-mono uppercase tracking-widest text-slate-500">
          {type === 'backprop'
            ? 'Sequential Forward + Backward Gradient Flow'
            : 'Bidirectional Predictive Inference'}
        </span>
      </div>
      <svg ref={svgRef} className="w-full h-full" />
    </div>
  );
};