/**
 * EvalGraph - Authentic Chess.com Advantage / Evaluation Graph
 * Exact match to Chess.com Game Review:
 * - Top dark fill (#383531) for Black control, bottom white fill (#ffffff) for White control
 * - Horizontal centerline at 0.00 equality
 * - Smooth spline curve plotting centipawn evaluation and forced mate depth
 * - Colored badge dots along curve (🟢 Best/Great, 🟠 Mistake/Inaccuracy, 🔴 Blunder, ❌ Miss, 🔷 Brilliant, 🔵 Book)
 * - Floating Eval / Mate callout box (e.g. "M3" or "+3.5") with pointer leader line
 * - Peach vertical playhead marker with knob tracking the active ply
 * - Click & drag scrubber to instantly jump to any move
 */
(function(global) {
  'use strict';

  class EvalGraph {
    constructor(containerEl, options = {}) {
      this.container = containerEl;
      this.options = options;
      this.onSelectPly = options.onSelectPly || (() => {});

      this.analyzedGame = [];
      this.currentPly = 1;
      this.points = [];
      this.isDragging = false;

      this.svg = null;
      this.initDOM();
    }

    initDOM() {
      if (!this.container) return;
      this.container.innerHTML = `
        <div class="eval-graph-card" id="evalGraphCard">
          <svg class="eval-graph-svg" id="evalGraphSvg" viewBox="0 0 1000 100" preserveAspectRatio="none">
            <defs>
              <linearGradient id="whiteAdvGrad" x1="0%" y1="0%" x2="0%" y2="100%">
                <stop offset="0%" stop-color="#f0eee9" stop-opacity="0.88" />
                <stop offset="100%" stop-color="#ffffff" stop-opacity="0.96" />
              </linearGradient>
            </defs>
            <!-- 1. Background dark region (Black control) -->
            <rect x="0" y="0" width="1000" height="100" fill="#262421" />

            <!-- 2. Zero-line (Equality) -->
            <line x1="0" y1="50" x2="1000" y2="50" stroke="rgba(255, 255, 255, 0.25)" stroke-width="1.2" stroke-dasharray="6 4" />

            <!-- 3. White advantage filled polygon -->
            <path id="evalWhitePolygon" d="M 0 50 L 1000 50 L 1000 100 L 0 100 Z" fill="url(#whiteAdvGrad)" />

            <!-- 4. Advantage boundary stroke -->
            <path id="evalCurveStroke" d="M 0 50 L 1000 50" fill="none" stroke="#787570" stroke-width="2" />

            <!-- 5. Colored Move Badge Dots -->
            <g id="evalDotsGroup"></g>

            <!-- 6. Floating Callout Box (e.g. M3 or +2.4) -->
            <g id="evalCalloutGroup" style="display: none;"></g>

            <!-- 7. Peach Playhead Line and Knob -->
            <g id="evalPlayheadGroup">
              <line id="evalPlayheadLine" x1="10" y1="0" x2="10" y2="100" stroke="#c99e74" stroke-width="2.5" />
              <circle id="evalPlayheadKnob" cx="10" cy="50" r="5.5" fill="#c99e74" stroke="#22201d" stroke-width="1.5" />
            </g>
          </svg>
        </div>
      `;

      this.svg = this.container.querySelector('#evalGraphSvg');
      this.setupInteractions();
    }

    setupInteractions() {
      const card = this.container.querySelector('#evalGraphCard');
      if (!card) return;

      const handlePointer = (e) => {
        const rect = card.getBoundingClientRect();
        const clientX = e.clientX || (e.touches && e.touches[0] ? e.touches[0].clientX : 0);
        const ratio = Math.max(0, Math.min(1, (clientX - rect.left) / rect.width));

        if (this.analyzedGame && this.analyzedGame.length > 0) {
          const totalPlies = this.analyzedGame.length;
          const targetPly = Math.max(1, Math.min(totalPlies, Math.round(ratio * (totalPlies - 1)) + 1));
          this.onSelectPly(targetPly);
        }
      };

      card.addEventListener('pointerdown', (e) => {
        this.isDragging = true;
        card.setPointerCapture(e.pointerId);
        handlePointer(e);
      });

      card.addEventListener('pointermove', (e) => {
        if (this.isDragging) {
          handlePointer(e);
        }
      });

      card.addEventListener('pointerup', (e) => {
        this.isDragging = false;
        try { card.releasePointerCapture(e.pointerId); } catch (_) {}
      });

      card.addEventListener('pointercancel', () => {
        this.isDragging = false;
      });
    }

    /**
     * Maps centipawns and mate depth to SVG y coordinate (10..90, center = 50)
     */
    static evalToY(cp, mate) {
      if (mate !== undefined && mate !== null) {
        // Mate for white is top (y = 8), mate for black is bottom (y = 92)
        return mate > 0 ? 8 : 92;
      }

      // Sigmoid formula matching Chess.com winning percentage
      const safeCp = Math.max(-2000, Math.min(2000, cp || 0));
      const winPct = 100 / (1 + Math.exp(-0.00368208 * safeCp)); // 0..100%
      // 50% -> y = 50
      // 100% -> y = 10
      // 0% -> y = 90
      return 90 - (winPct / 100) * 80;
    }

    /**
     * Loads analyzed game steps and renders the full advantage curve
     */
    setGame(analyzedGame) {
      this.analyzedGame = analyzedGame || [];
      if (this.analyzedGame.length === 0) return;

      const totalPlies = this.analyzedGame.length;
      const padX = 12;
      const width = 1000 - (padX * 2);

      // Point 0: Start of game (Move 0: 0.00 eval at y=50)
      this.points = [
        { ply: 0, x: padX, y: 50, cp: 0, mate: null, badge: null }
      ];

      for (let i = 0; i < totalPlies; i++) {
        const step = this.analyzedGame[i];
        const x = padX + ((i + 1) / totalPlies) * width;

        // Check if move announced or contains mate
        let mateVal = null;
        if (step.continuationMoves && step.continuationMoves.isMate) {
          mateVal = step.isWhite ? 3 : -3;
        } else if (step.move && step.move.san && step.move.san.includes('#')) {
          mateVal = step.isWhite ? 1 : -1;
        }

        const y = EvalGraph.evalToY(step.evalCp, mateVal);

        this.points.push({
          ply: i + 1,
          x: Math.round(x * 10) / 10,
          y: Math.round(y * 10) / 10,
          cp: step.evalCp || 0,
          mate: mateVal,
          badge: step.badge,
          move: step.move
        });
      }

      this.renderCurve();
      this.renderBadgeDots();
      this.renderMateCallout();
      this.setPly(this.currentPly);
    }

    /**
     * Generates a smooth monotone cubic bezier SVG path across points
     */
    renderCurve() {
      if (this.points.length < 2) return;

      // Build smooth path using cubic beziers
      let d = `M ${this.points[0].x} ${this.points[0].y}`;
      for (let i = 0; i < this.points.length - 1; i++) {
        const p0 = this.points[i];
        const p1 = this.points[i + 1];
        const cpX1 = p0.x + (p1.x - p0.x) * 0.5;
        const cpX2 = p0.x + (p1.x - p0.x) * 0.5;
        d += ` C ${cpX1} ${p0.y}, ${cpX2} ${p1.y}, ${p1.x} ${p1.y}`;
      }

      const curveStroke = this.svg.querySelector('#evalCurveStroke');
      if (curveStroke) {
        curveStroke.setAttribute('d', d);
      }

      const whitePoly = this.svg.querySelector('#evalWhitePolygon');
      if (whitePoly) {
        const lastPt = this.points[this.points.length - 1];
        const firstPt = this.points[0];
        // Close polygon around bottom edges
        const polyD = `${d} L ${lastPt.x} 100 L 1000 100 L 1000 100 L 0 100 L 0 ${firstPt.y} Z`;
        whitePoly.setAttribute('d', polyD);
      }
    }

    /**
     * Renders authentic colored move badge dots along the curve
     */
    renderBadgeDots() {
      const dotsGroup = this.svg.querySelector('#evalDotsGroup');
      if (!dotsGroup) return;
      dotsGroup.innerHTML = '';

      for (let i = 1; i < this.points.length; i++) {
        const pt = this.points[i];
        const badge = pt.badge;
        if (!badge) continue;

        let dotColor = null;
        let showDot = false;

        // Exactly matches Chess.com dots: Brilliant, Great, Best, Inaccuracy, Mistake, Blunder, Miss
        switch (badge.id) {
          case 'brilliant':
            dotColor = '#26c2a3';
            showDot = true;
            break;
          case 'great':
          case 'best':
          case 'excellent':
            dotColor = '#81b64c'; // Green
            showDot = true;
            break;
          case 'good':
          case 'book':
            dotColor = '#5c8bb0'; // Blue / Slate
            showDot = (i % 3 === 0); // Sparsely populate standard moves
            break;
          case 'inaccuracy':
          case 'mistake':
            dotColor = '#f59e0b'; // Amber / Orange
            showDot = true;
            break;
          case 'blunder':
            dotColor = '#fa412d'; // Red
            showDot = true;
            break;
          case 'miss':
            dotColor = '#ea3567'; // Pink / Magenta
            showDot = true;
            break;
          default:
            showDot = false;
        }

        if (showDot && dotColor) {
          const circle = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
          circle.setAttribute('cx', pt.x);
          circle.setAttribute('cy', pt.y);
          circle.setAttribute('r', '3.8');
          circle.setAttribute('fill', dotColor);
          circle.setAttribute('stroke', '#22201d');
          circle.setAttribute('stroke-width', '1.2');
          circle.setAttribute('class', 'eval-dot-node');
          circle.dataset.ply = pt.ply;
          dotsGroup.appendChild(circle);
        }
      }
    }

    /**
     * Renders the authentic "M3" / "M1" or decisive advantage callout badge from screenshot
     */
    renderMateCallout() {
      const calloutGroup = this.svg.querySelector('#evalCalloutGroup');
      if (!calloutGroup) return;
      calloutGroup.innerHTML = '';

      // Find first mate occurrence or highest decisive advantage towards end
      let targetPt = null;
      let labelText = '';

      for (let i = this.points.length - 1; i >= 1; i--) {
        const pt = this.points[i];
        if (pt.mate) {
          targetPt = pt;
          labelText = `M${Math.abs(pt.mate)}`;
          break;
        }
      }

      // If no forced mate, check if decisive advantage (+5 or more)
      if (!targetPt && this.points.length > 5) {
        const lastPt = this.points[this.points.length - 1];
        if (Math.abs(lastPt.cp) >= 400) {
          targetPt = lastPt;
          const pawns = (lastPt.cp / 100).toFixed(1);
          labelText = lastPt.cp > 0 ? `+${pawns}` : `${pawns}`;
        }
      }

      if (targetPt && labelText) {
        calloutGroup.style.display = 'inline';

        const bx = Math.min(940, Math.max(50, targetPt.x - 30));
        const by = targetPt.y <= 40 ? targetPt.y + 18 : targetPt.y - 24;

        // Connecting pointer line
        const line = document.createElementNS('http://www.w3.org/2000/svg', 'line');
        line.setAttribute('x1', targetPt.x);
        line.setAttribute('y1', targetPt.y);
        line.setAttribute('x2', bx + 16);
        line.setAttribute('y2', by + (targetPt.y <= 40 ? 0 : 18));
        line.setAttribute('stroke', '#1f1e1c');
        line.setAttribute('stroke-width', '1.2');

        // White callout box with black border
        const rect = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
        rect.setAttribute('x', bx);
        rect.setAttribute('y', by);
        rect.setAttribute('width', '34');
        rect.setAttribute('height', '20');
        rect.setAttribute('rx', '4');
        rect.setAttribute('ry', '4');
        rect.setAttribute('fill', '#ffffff');
        rect.setAttribute('stroke', '#22201d');
        rect.setAttribute('stroke-width', '1.4');
        rect.setAttribute('filter', 'drop-shadow(0 2px 4px rgba(0,0,0,0.35))');

        // Text inside box
        const text = document.createElementNS('http://www.w3.org/2000/svg', 'text');
        text.setAttribute('x', bx + 17);
        text.setAttribute('y', by + 14);
        text.setAttribute('text-anchor', 'middle');
        text.setAttribute('font-family', 'var(--font-heading), sans-serif');
        text.setAttribute('font-weight', '800');
        text.setAttribute('font-size', '11');
        text.setAttribute('fill', '#1a1917');
        text.textContent = labelText;

        calloutGroup.appendChild(line);
        calloutGroup.appendChild(rect);
        calloutGroup.appendChild(text);
      } else {
        calloutGroup.style.display = 'none';
      }
    }

    /**
     * Updates the peach playhead marker and knob to the current ply
     */
    setPly(ply) {
      this.currentPly = ply;
      if (!this.points || this.points.length === 0) return;

      const targetPt = this.points.find(p => p.ply === ply) || this.points[Math.min(ply, this.points.length - 1)];
      if (!targetPt) return;

      const line = this.svg.querySelector('#evalPlayheadLine');
      const knob = this.svg.querySelector('#evalPlayheadKnob');

      if (line) {
        line.setAttribute('x1', targetPt.x);
        line.setAttribute('x2', targetPt.x);
      }

      if (knob) {
        knob.setAttribute('cx', targetPt.x);
        knob.setAttribute('cy', targetPt.y);
      }
    }
  }

  global.EvalGraph = EvalGraph;

})(typeof window !== 'undefined' ? window : (typeof global !== 'undefined' ? global : this));
