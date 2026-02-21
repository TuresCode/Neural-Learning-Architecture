import React, { useEffect, useRef, useState, useCallback } from 'react';
import * as d3 from 'd3';
import { COLORS } from '../constants';

export const DetailedPCVisualizer: React.FC = () => {
  const svgRef  = useRef<SVGSVGElement>(null);
  const wrapRef = useRef<HTMLDivElement>(null);
  const timerRef     = useRef<ReturnType<typeof setInterval>[]>([]);
  const [isVisible, setIsVisible] = useState(false);

  const clearAll = () => { timerRef.current.forEach(clearInterval); timerRef.current = []; };

  const draw = useCallback(() => {
    if (!svgRef.current) return;
    const W = svgRef.current.getBoundingClientRect().width;
    const H = svgRef.current.getBoundingClientRect().height;
    if (W === 0 || H === 0) return;

    clearAll();
    const svg = d3.select(svgRef.current);
    svg.selectAll('*').remove();

    // ── Breakpoints ────────────────────────────────────────────────
    const isMobile = W < 480;
    const isTablet = W < 720;

    // ── Margins ───────────────────────────────────────────────────
    const mg = {
      top:    isMobile ? 28 : (isTablet ? 36 : 44),
      right:  isMobile ? 12 : (isTablet ? 36 : 52),
      bottom: isMobile ? 36 : (isTablet ? 44 : 52),
      left:   isMobile ? 12 : (isTablet ? 36 : 52),
    };
    const iW = W - mg.left - mg.right;
    const iH = H - mg.top  - mg.bottom;

    const g = svg.append('g').attr('transform', `translate(${mg.left},${mg.top})`);

    // ── Defs ───────────────────────────────────────────────────────
    const defs = svg.append('defs');

    const makeGlow = (id: string, color: string, sd = 4) => {
      const f = defs.append('filter').attr('id', id)
        .attr('x','-60%').attr('y','-60%').attr('width','220%').attr('height','220%');
      f.append('feGaussianBlur').attr('in','SourceGraphic').attr('stdDeviation', sd).attr('result','blur');
      f.append('feFlood').attr('flood-color', color).attr('flood-opacity', 0.6).attr('result','color');
      f.append('feComposite').attr('in','color').attr('in2','blur').attr('operator','in').attr('result','glow');
      const m = f.append('feMerge');
      m.append('feMergeNode').attr('in','glow');
      m.append('feMergeNode').attr('in','SourceGraphic');
    };
    makeGlow('glow-blue',  COLORS.prediction, isMobile ? 3 : 5);
    makeGlow('glow-green', COLORS.activation, isMobile ? 3 : 5);
    makeGlow('glow-red',   COLORS.error,      isMobile ? 3 : 5);

    const makeBoxGrad = (id: string, color: string) => {
      const gr = defs.append('linearGradient').attr('id', id)
        .attr('x1','0%').attr('y1','0%').attr('x2','0%').attr('y2','100%');
      gr.append('stop').attr('offset','0%').attr('stop-color', color).attr('stop-opacity', 0.12);
      gr.append('stop').attr('offset','100%').attr('stop-color','#1e293b').attr('stop-opacity', 0.9);
    };
    makeBoxGrad('box-lower',  COLORS.activation);
    makeBoxGrad('box-higher', COLORS.prediction);

    const rg = defs.append('radialGradient').attr('id','comp-grad')
      .attr('cx','50%').attr('cy','35%').attr('r','65%');
    rg.append('stop').attr('offset','0%').attr('stop-color', COLORS.error).attr('stop-opacity', 0.18);
    rg.append('stop').attr('offset','100%').attr('stop-color','#1e293b').attr('stop-opacity', 1);

    const makeArrow = (id: string, color: string) => {
      defs.append('marker').attr('id', id)
        .attr('viewBox','0 -5 10 10').attr('refX', 8).attr('refY', 0)
        .attr('markerWidth', isMobile ? 4 : 5).attr('markerHeight', isMobile ? 4 : 5)
        .attr('orient','auto')
        .append('path').attr('d','M0,-5L10,0L0,5Z').attr('fill', color);
    };
    makeArrow('arr-pred',  COLORS.prediction);
    makeArrow('arr-state', COLORS.activation);
    makeArrow('arr-error', COLORS.error);

    // ── Sizes ─────────────────────────────────────────────────────
    const boxW  = isMobile ? Math.min(56, iW * 0.22) : (isTablet ? 80  : 96);
    const boxH  = isMobile ? Math.min(86, iH * 0.60) : (isTablet ? 120 : 148);
    const compR = isMobile ? Math.min(20, iW * 0.09) : (isTablet ? 32  : 38);

    // ── Positions ─────────────────────────────────────────────────
    const cy      = iH / 2;
    const lowerCX  = boxW / 2;
    const higherCX = iW - boxW / 2;
    const compCX   = iW / 2;

    // ── Dot grid ──────────────────────────────────────────────────
    const step = isMobile ? 20 : 28;
    const gridG = g.append('g').attr('opacity', 0.03);
    for (let xi = 0; xi <= iW; xi += step)
      for (let yi = 0; yi <= iH; yi += step)
        gridG.append('circle').attr('cx', xi).attr('cy', yi).attr('r', 1).attr('fill','#94a3b8');

    // ── Box helper ────────────────────────────────────────────────
    const drawBox = (
      cx: number, bcY: number,
      label: string, sublabel: string,
      color: string, gradId: string
    ) => {
      const bx = cx - boxW / 2;
      const by = bcY - boxH / 2;
      const grp = g.append('g');

      grp.append('rect')
        .attr('x', bx-6).attr('y', by-6)
        .attr('width', boxW+12).attr('height', boxH+12).attr('rx', 14)
        .attr('fill', color).attr('opacity', 0.05)
        .attr('filter', `url(#glow-${color === COLORS.activation ? 'green' : 'blue'})`);

      grp.append('rect')
        .attr('x', bx).attr('y', by)
        .attr('width', boxW).attr('height', boxH).attr('rx', 10)
        .attr('fill', `url(#${gradId})`)
        .attr('stroke', color).attr('stroke-width', 1).attr('stroke-opacity', 0.45);

      grp.append('rect')
        .attr('x', bx+1).attr('y', by+1)
        .attr('width', boxW-2).attr('height', 3).attr('rx', 9)
        .attr('fill', color).attr('opacity', 0.7);

      const cols = 2;
      const rows = isMobile ? 3 : 4;
      const spX  = boxW / (cols + 1);
      const spY  = (boxH - 12) / (rows + 1);
      const dotR = isMobile ? 3 : 5;
      for (let r = 1; r <= rows; r++) {
        for (let c = 1; c <= cols; c++) {
          const nx = bx + c * spX;
          const ny = by + 11 + r * spY;
          if (c < cols)
            grp.append('line')
              .attr('x1', nx + dotR).attr('y1', ny)
              .attr('x2', nx + spX - dotR).attr('y2', ny)
              .attr('stroke', color).attr('stroke-width', 0.5).attr('opacity', 0.2);
          grp.append('circle').attr('cx', nx).attr('cy', ny).attr('r', dotR)
            .attr('fill','none').attr('stroke', color).attr('stroke-width', 1).attr('opacity', 0.4);
          grp.append('circle').attr('cx', nx).attr('cy', ny).attr('r', isMobile ? 1.2 : 1.8)
            .attr('fill', color).attr('opacity', 0.65);
        }
      }

      grp.append('text')
        .attr('x', cx).attr('y', by + boxH + (isMobile ? 14 : 20))
        .attr('text-anchor','middle').attr('fill', color)
        .attr('font-size', isMobile ? '8px' : '10px')
        .attr('font-family','ui-monospace, monospace').attr('font-weight','700')
        .attr('letter-spacing','0.07em').text(label);
      grp.append('text')
        .attr('x', cx).attr('y', by + boxH + (isMobile ? 24 : 34))
        .attr('text-anchor','middle').attr('fill','#475569')
        .attr('font-size', isMobile ? '7px' : '9px')
        .attr('font-family','ui-monospace, monospace').text(sublabel);
    };

    drawBox(lowerCX,  cy, 'LOWER LAYER',  '(Sensory / L)',     COLORS.activation, 'box-lower');
    drawBox(higherCX, cy, 'HIGHER LAYER', '(Abstract / L+1)', COLORS.prediction, 'box-higher');

    // ── Error unit ────────────────────────────────────────────────
    const comp = g.append('g').attr('transform', `translate(${compCX},${cy})`);

    comp.append('circle').attr('r', compR+12)
      .attr('fill', COLORS.error).attr('opacity', 0.04).attr('filter','url(#glow-red)');
    comp.append('circle').attr('r', compR+4)
      .attr('fill','none').attr('stroke', COLORS.error)
      .attr('stroke-width', 0.5).attr('stroke-dasharray','3,5').attr('opacity', 0.3);
    comp.append('circle').attr('r', compR)
      .attr('fill','url(#comp-grad)')
      .attr('stroke', COLORS.error).attr('stroke-width', 1.2).attr('stroke-opacity', 0.6);
    comp.append('text')
      .attr('text-anchor','middle').attr('dominant-baseline','central')
      .attr('fill', COLORS.error)
      .attr('font-size', isMobile ? '16px' : '24px')
      .attr('font-weight','300').attr('font-family','Georgia, serif').text('Σ');

    // badge above comparator
    const bW = isMobile ? 60 : 88;
    const bH = isMobile ? 14 : 18;
    const bY = -compR - (isMobile ? 18 : 26);
    comp.append('rect')
      .attr('x', -bW/2).attr('y', bY - bH/2)
      .attr('width', bW).attr('height', bH).attr('rx', 4)
      .attr('fill', COLORS.error).attr('fill-opacity', 0.1)
      .attr('stroke', COLORS.error).attr('stroke-width', 0.7).attr('stroke-opacity', 0.4);
    comp.append('text')
      .attr('x', 0).attr('y', bY)
      .attr('text-anchor','middle').attr('dominant-baseline','central')
      .attr('fill', COLORS.error)
      .attr('font-size', isMobile ? '6px' : '8px')
      .attr('font-family','ui-monospace, monospace').attr('font-weight','700')
      .attr('letter-spacing','0.12em').text('ERROR UNIT');

    // ── Paths ─────────────────────────────────────────────────────
    const line = d3.line<[number,number]>().curve(d3.curveCatmullRom.alpha(0.5));
    const sw   = isMobile ? 1.4 : 1.8;
    const lfs  = isMobile ? '7px' : '9px';

    // Vertical arc offsets
    const predArcY  = cy - (isMobile ? Math.min(22, iH*0.18) : (isTablet ? 30 : 42));
    const stateArcY = cy + (isMobile ? Math.min(18, iH*0.15) : (isTablet ? 22 : 30));
    // Error arc dips below — its own unobstructed lane
    const errDip    = isMobile ? Math.min(24, iH*0.20) : (isTablet ? 32 : 44);
    const errArcY   = cy + errDip;

    // Prediction: higherBox → comparator (top arc)
    const predPath = g.append('path')
      .datum<[number,number][]>([
        [higherCX - boxW/2, predArcY],
        [(compCX + higherCX) / 2, predArcY - (isMobile ? 10 : 16)],
        [compCX + compR + 2, cy - compR*0.55],
      ])
      .attr('d', line).attr('fill','none')
      .attr('stroke', COLORS.prediction).attr('stroke-width', sw)
      .attr('marker-end','url(#arr-pred)').attr('filter','url(#glow-blue)');

    g.append('text')
      .attr('x', (compCX + higherCX) / 2 + (isMobile ? 2 : 6))
      .attr('y', predArcY - (isMobile ? 14 : 24))
      .attr('text-anchor','middle').attr('fill', COLORS.prediction)
      .attr('font-size', lfs).attr('font-family','ui-monospace, monospace')
      .attr('font-weight','700').attr('letter-spacing','0.08em')
      .text(isMobile ? '↓ PREDICTION' : '↓ TOP-DOWN PREDICTION');

    // State: lowerBox → comparator (bottom arc)
    const statePath = g.append('path')
      .datum<[number,number][]>([
        [lowerCX + boxW/2, stateArcY],
        [(compCX + lowerCX) / 2, stateArcY + (isMobile ? 10 : 14)],
        [compCX - compR - 2, cy + compR*0.45],
      ])
      .attr('d', line).attr('fill','none')
      .attr('stroke', COLORS.activation).attr('stroke-width', sw)
      .attr('marker-end','url(#arr-state)').attr('filter','url(#glow-green)');

    g.append('text')
      .attr('x', (compCX + lowerCX) / 2)
      .attr('y', stateArcY + (isMobile ? 20 : 30))
      .attr('text-anchor','middle').attr('fill', COLORS.activation)
      .attr('font-size', lfs).attr('font-family','ui-monospace, monospace')
      .attr('font-weight','700').attr('letter-spacing','0.08em')
      .text(isMobile ? '↑ STATE' : '↑ ACTUAL STATE');

    // Error: comparator → higherBox — curves BELOW, own clear lane
    const errPath = g.append('path')
      .datum<[number,number][]>([
        [compCX + compR + 2, cy + compR * 0.6],
        [(compCX + higherCX) / 2, errArcY + (isMobile ? 6 : 10)],
        [higherCX - boxW/2, cy + (isMobile ? 12 : 18)],
      ])
      .attr('d', line).attr('fill','none')
      .attr('stroke', COLORS.error).attr('stroke-width', sw)
      .attr('marker-end','url(#arr-error)').attr('filter','url(#glow-red)');

    // Residual error pill — placed below the arc, never overlapping blue
    const eMidX = (compCX + higherCX) / 2 + 4;
    const eMidY = errArcY + (isMobile ? 20 : 28);
    const eBW   = isMobile ? 70 : 108;
    g.append('rect')
      .attr('x', eMidX - eBW/2).attr('y', eMidY - 8)
      .attr('width', eBW).attr('height', 16).attr('rx', 7)
      .attr('fill','#0f172a').attr('stroke', COLORS.error)
      .attr('stroke-width', 0.7).attr('stroke-opacity', 0.5);
    g.append('text')
      .attr('x', eMidX).attr('y', eMidY)
      .attr('text-anchor','middle').attr('dominant-baseline','central')
      .attr('fill', COLORS.error)
      .attr('font-size', isMobile ? '6.5px' : '8px')
      .attr('font-family','ui-monospace, monospace').attr('font-weight','700')
      .attr('letter-spacing','0.08em')
      .text('RESIDUAL ERROR');

    // ── Particles ─────────────────────────────────────────────────
    const spawn = (
      pathSel: d3.Selection<SVGPathElement, unknown, null, undefined>,
      color: string, delay: number, r = 4
    ) => {
      const node = pathSel.node();
      if (!node) return;
      const len = node.getTotalLength();
      const gId = color === COLORS.prediction ? 'glow-blue'
                : color === COLORS.activation  ? 'glow-green' : 'glow-red';
      const dot = g.append('circle').attr('r', r).attr('fill', color)
        .attr('filter',`url(#${gId})`).attr('opacity', 0).style('pointer-events','none');
      const ghost = g.append('circle').attr('r', r*1.7).attr('fill', color)
        .attr('opacity', 0).style('pointer-events','none');
      dot.transition().delay(delay).duration(0).attr('opacity', 0.95);
      ghost.transition().delay(delay+90).duration(0).attr('opacity', 0.2);
      const tw = () => (t: number) => {
        const p = node.getPointAtLength(t * len);
        return `translate(${p.x},${p.y})`;
      };
      dot.transition().delay(delay).duration(1700).ease(d3.easeSinInOut)
        .attrTween('transform', tw).on('end', function(){ d3.select(this).remove(); });
      ghost.transition().delay(delay+90).duration(1700).ease(d3.easeSinInOut)
        .attrTween('transform', tw).on('end', function(){ d3.select(this).remove(); });
    };

    const pR = isMobile ? 2.5 : 4;
    const runCycle = () => {
      spawn(predPath  as any, COLORS.prediction, 0,    pR);
      spawn(predPath  as any, COLORS.prediction, 320,  pR*0.65);
      spawn(statePath as any, COLORS.activation, 150,  pR);
      spawn(statePath as any, COLORS.activation, 470,  pR*0.65);
      spawn(errPath   as any, COLORS.error,      2100, pR);
      spawn(errPath   as any, COLORS.error,      2420, pR*0.65);
    };
    runCycle();
    timerRef.current.push(setInterval(runCycle, 3800));

    // pulse ring
    const doPulse = () => {
      g.append('circle')
        .attr('cx', compCX).attr('cy', cy).attr('r', compR)
        .attr('fill','none').attr('stroke', COLORS.error)
        .attr('stroke-width', 1.5).attr('opacity', 0.6)
        .transition().duration(1100).ease(d3.easeQuadOut)
        .attr('r', compR + (isMobile ? 18 : 24)).attr('opacity', 0).remove();
    };
    doPulse();
    timerRef.current.push(setInterval(doPulse, 3800));
  }, []);

  useEffect(() => {
    const t = setTimeout(() => { setIsVisible(true); draw(); }, 120);
    const ro = new ResizeObserver(() => draw());
    if (wrapRef.current) ro.observe(wrapRef.current);
    return () => { clearTimeout(t); ro.disconnect(); clearAll(); };
  }, [draw]);

  return (
    <div
      className="w-full h-full flex flex-col"
      style={{ opacity: isVisible ? 1 : 0, transition: 'opacity 0.5s ease' }}
    >
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-3 border-b border-slate-800 pb-5 mb-5 shrink-0">
        <div>
          <div className="flex items-center gap-2 mb-1.5">
            <div className="w-2 h-2 rounded-full bg-red-600 shadow-[0_0_8px_rgba(220,38,38,0.5)]" />
            <h3 className="text-[11px] sm:text-xs font-bold uppercase tracking-widest text-white">
              Predictive Coding — Local Layer Loop
            </h3>
          </div>
          <p className="text-[11px] text-slate-400 leading-relaxed max-w-lg">
            Predictions flow{' '}
            <span className="font-semibold" style={{ color: COLORS.prediction }}>top-down</span>.
            {' '}Only the{' '}
            <span className="font-semibold" style={{ color: COLORS.error }}>unpredicted residual</span>
            {' '}propagates{' '}
            <span className="font-semibold" style={{ color: COLORS.activation }}>bottom-up</span>.
          </p>
        </div>
        <div className="px-3 py-1 bg-slate-800 rounded-full border border-slate-700 text-[9px] font-mono text-slate-400 uppercase tracking-widest w-fit shrink-0">
          Local Error Loop
        </div>
      </div>

      {/* SVG canvas — fixed height to reduce vertical footprint */}
      <div
        ref={wrapRef}
        className="relative rounded-2xl overflow-hidden shrink-0"
        style={{
          height: '220px',
          background: 'radial-gradient(ellipse at 50% 55%, rgba(220,38,38,0.04) 0%, transparent 65%)',
        }}
      >
        <svg ref={svgRef} className="w-full h-full" />
      </div>

      {/* Legend cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mt-5 shrink-0">
        {[
          {
            color: COLORS.prediction,
            dot: 'bg-blue-600 shadow-[0_0_8px_rgba(37,99,235,0.5)]',
            num: '01', label: 'Top-Down Prediction',
            desc: 'Higher layers predict lower layer activity — abstract representations drive sensory expectations.',
          },
          {
            color: COLORS.activation,
            dot: 'bg-emerald-600 shadow-[0_0_8px_rgba(5,150,105,0.5)]',
            num: '02', label: 'Bottom-Up State',
            desc: 'Actual sensory input flows into the local error unit for comparison.',
          },
          {
            color: COLORS.error,
            dot: 'bg-red-600 shadow-[0_0_8px_rgba(220,38,38,0.5)]',
            num: '03', label: 'Residual Error',
            desc: 'Only the unpredicted difference (surprise) propagates upward to update higher layers.',
          },
        ].map(({ color, dot, num, label, desc }) => (
          <div key={num} className="p-4 rounded-2xl bg-slate-800/30 border border-slate-700/50">
            <h3 className="text-[10px] font-bold uppercase tracking-wider mb-2 flex items-center gap-2" style={{ color }}>
              <div className={`w-2 h-2 rounded-full shrink-0 ${dot}`} />
              {num}. {label}
            </h3>
            <p className="text-[11px] leading-relaxed text-slate-400">{desc}</p>
          </div>
        ))}
      </div>
    </div>
  );
};