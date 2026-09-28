/**
 * ChessBoardUI - Interactive, Touch-Friendly Chessboard for Android & Web
 * Features:
 * - High-DPI Vector SVGs for pieces
 * - Tap-to-move & Drag-and-drop support (Mobile / Desktop)
 * - Last move highlights, check glow, legal move indicators
 * - Floating Chess.com Move Badges (!!, !, ★, ?, ??, etc.)
 * - Engine Arrows (Best move green arrow, blunder red arrow)
 * - Animated Vertical Evaluation Bar
 */
(function(global) {
  'use strict';

  // Crisp standard SVG chess piece definitions
  const PIECE_SVGS = {
    wp: `<svg viewBox="0 0 45 45"><path d="M22.5 9c-2.21 0-4 1.79-4 4 0 .89.29 1.71.78 2.38C17.33 16.5 16 18.59 16 21c0 2.03.94 3.84 2.41 5.03-3 1.06-7.41 5.55-7.41 13.47h23c0-7.92-4.41-12.41-7.41-13.47 1.47-1.19 2.41-3 2.41-5.03 0-2.41-1.33-4.5-3.28-5.62.49-.67.78-1.49.78-2.38 0-2.21-1.79-4-4-4z" fill="#fff" stroke="#1f1e1b" stroke-width="1.5" stroke-linecap="round"/></svg>`,
    wn: `<svg viewBox="0 0 45 45"><path d="M22 10c10.5 1 16.5 8 16 29H15c0-9 10-6.5 8-21" fill="#fff" stroke="#1f1e1b" stroke-width="1.5"/><path d="M24 18c.38 2.91-5.55 7.37-8 9-3 2-2.82 4.34-5 4-1.042-.94 1.41-3.04 0-3-1 0 .19 1.23-1 2-1 0-4.003 1-4-4 0-2 6-12 6-12s1.89-1.9 2-3.5c-.73-.994-.5-2-.5-3 1-1 3 2.5 3 2.5h2s.78-1.992 2.5-3c1 0 1 3 1 3" fill="#fff" stroke="#1f1e1b" stroke-width="1.5"/><circle cx="9.5" cy="25.5" r="1" fill="#1f1e1b"/></svg>`,
    wb: `<svg viewBox="0 0 45 45"><g fill="none" fill-rule="evenodd" stroke="#1f1e1b" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><g fill="#fff" stroke-linecap="butt"><path d="M9 36c3.39-.97 10.11.43 13.5-2 3.39 2.43 10.11 1.03 13.5 2 0 0 1.65.54 3 2-.68.97-1.65.99-3 .5-3.39-.97-10.11.46-13.5-1-3.39 1.46-10.11.03-13.5 1-1.354.49-2.323.47-3-.5 1.354-1.94 3-2 3-2zM15 32c2.5 2.5 12.5 2.5 15 0 .5-1.5 0-2 0-2 0-2.5-2.5-4-2.5-4 5.5-1.5 6-11.5-5-15.5-11 4-10.5 14-5 15.5 0 0-2.5 1.5-2.5 4 0 0-.5.5 0 2zM25 8a2.5 2.5 0 1 1-5 0 2.5 2.5 0 1 1 5 0z"/></g><path d="M17.5 26h10M15 30h15M22.5 15.5v5M20 18h5"/></g></svg>`,
    wr: `<svg viewBox="0 0 45 45"><g fill="#fff" fill-rule="evenodd" stroke="#1f1e1b" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M9 39h27v-3H9v3zM12 36v-4h21v4H12zM11 14V9h4v2h5V9h5v2h5V9h4v5" stroke-linecap="butt"/><path d="M34 14l-3 3H14l-3-3"/><path d="M31 17v12.5H14V17"/><path d="M31 29.5l1.5 2.5h-20l1.5-2.5"/><path d="M11 14h23"/></g></svg>`,
    wq: `<svg viewBox="0 0 45 45"><g fill="#fff" fill-rule="evenodd" stroke="#1f1e1b" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M8 12a2 2 0 1 1-4 0 2 2 0 1 1 4 0zM24.5 7.5a2 2 0 1 1-4 0 2 2 0 1 1 4 0zM41 12a2 2 0 1 1-4 0 2 2 0 1 1 4 0zM16 8.5a2 2 0 1 1-4 0 2 2 0 1 1 4 0zM33 8.5a2 2 0 1 1-4 0 2 2 0 1 1 4 0z"/><path d="M9 26c8.5-1.5 21-1.5 27 0l2-12-7 11V11l-5.5 13.5-3-15-3 15-5.5-14V25L7 14l2 12zM9 26c0 2 1.5 2 2.5 4 1 1.5 1 1 .5 3.5-1.5 1-1.5 2.5-1.5 2.5-1.5 1.5.5 2.5.5 2.5 6.5 1 16.5 1 23 0 0 0 2-1 .5-2.5 0 0 0-1.5-1.5-2.5-.5-2.5-.5-2 .5-3.5 1-2 2.5-2 2.5-4-8.5-1.5-18.5-1.5-27 0z"/><path d="M11.5 30c3.5-1 18.5-1 22 0M12 33.5c6-1 15-1 21 0"/></g></svg>`,
    wk: `<svg viewBox="0 0 45 45"><g fill="none" fill-rule="evenodd" stroke="#1f1e1b" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M22.5 11.63V6M20 8h5" stroke-linejoin="miter"/><path d="M22.5 25s4.5-7.5 3-10.5c0 0-1-2.5-3-2.5s-3 2.5-3 2.5c-1.5 3 3 10.5 3 10.5" fill="#fff" stroke-linecap="butt"/><path d="M11.5 37c5.5 3.5 15.5 3.5 21 0v-7s9-4.5 6-10.5c-4-6.5-13.5-3.5-16 4V23v--.5C21 16 11.5 13 7.5 19.5c-3 6 5 10 5 10v7.5" fill="#fff"/><path d="M11.5 30c5.5-3 15.5-3 21 0M11.5 33.5c5.5-3 15.5-3 21 0M11.5 37c5.5-3 15.5-3 21 0"/></g></svg>`,

    bp: `<svg viewBox="0 0 45 45"><path d="M22.5 9c-2.21 0-4 1.79-4 4 0 .89.29 1.71.78 2.38C17.33 16.5 16 18.59 16 21c0 2.03.94 3.84 2.41 5.03-3 1.06-7.41 5.55-7.41 13.47h23c0-7.92-4.41-12.41-7.41-13.47 1.47-1.19 2.41-3 2.41-5.03 0-2.41-1.33-4.5-3.28-5.62.49-.67.78-1.49.78-2.38 0-2.21-1.79-4-4-4z" fill="#262522" stroke="#fff" stroke-width="1.2" stroke-linecap="round"/></svg>`,
    bn: `<svg viewBox="0 0 45 45"><path d="M22 10c10.5 1 16.5 8 16 29H15c0-9 10-6.5 8-21" fill="#262522" stroke="#fff" stroke-width="1.2"/><path d="M24 18c.38 2.91-5.55 7.37-8 9-3 2-2.82 4.34-5 4-1.042-.94 1.41-3.04 0-3-1 0 .19 1.23-1 2-1 0-4.003 1-4-4 0-2 6-12 6-12s1.89-1.9 2-3.5c-.73-.994-.5-2-.5-3 1-1 3 2.5 3 2.5h2s.78-1.992 2.5-3c1 0 1 3 1 3" fill="#262522" stroke="#fff" stroke-width="1.2"/><circle cx="9.5" cy="25.5" r="1" fill="#fff"/></svg>`,
    bb: `<svg viewBox="0 0 45 45"><g fill="none" fill-rule="evenodd" stroke="#fff" stroke-width="1.2" stroke-linecap="round" stroke-linejoin="round"><g fill="#262522" stroke-linecap="butt"><path d="M9 36c3.39-.97 10.11.43 13.5-2 3.39 2.43 10.11 1.03 13.5 2 0 0 1.65.54 3 2-.68.97-1.65.99-3 .5-3.39-.97-10.11.46-13.5-1-3.39 1.46-10.11.03-13.5 1-1.354.49-2.323.47-3-.5 1.354-1.94 3-2 3-2zM15 32c2.5 2.5 12.5 2.5 15 0 .5-1.5 0-2 0-2 0-2.5-2.5-4-2.5-4 5.5-1.5 6-11.5-5-15.5-11 4-10.5 14-5 15.5 0 0-2.5 1.5-2.5 4 0 0-.5.5 0 2zM25 8a2.5 2.5 0 1 1-5 0 2.5 2.5 0 1 1 5 0z"/></g><path d="M17.5 26h10M15 30h15M22.5 15.5v5M20 18h5"/></g></svg>`,
    br: `<svg viewBox="0 0 45 45"><g fill="#262522" fill-rule="evenodd" stroke="#fff" stroke-width="1.2" stroke-linecap="round" stroke-linejoin="round"><path d="M9 39h27v-3H9v3zM12 36v-4h21v4H12zM11 14V9h4v2h5V9h5v2h5V9h4v5" stroke-linecap="butt"/><path d="M34 14l-3 3H14l-3-3"/><path d="M31 17v12.5H14V17"/><path d="M31 29.5l1.5 2.5h-20l1.5-2.5"/><path d="M11 14h23"/></g></svg>`,
    bq: `<svg viewBox="0 0 45 45"><g fill="#262522" fill-rule="evenodd" stroke="#fff" stroke-width="1.2" stroke-linecap="round" stroke-linejoin="round"><path d="M8 12a2 2 0 1 1-4 0 2 2 0 1 1 4 0zM24.5 7.5a2 2 0 1 1-4 0 2 2 0 1 1 4 0zM41 12a2 2 0 1 1-4 0 2 2 0 1 1 4 0zM16 8.5a2 2 0 1 1-4 0 2 2 0 1 1 4 0zM33 8.5a2 2 0 1 1-4 0 2 2 0 1 1 4 0z"/><path d="M9 26c8.5-1.5 21-1.5 27 0l2-12-7 11V11l-5.5 13.5-3-15-3 15-5.5-14V25L7 14l2 12zM9 26c0 2 1.5 2 2.5 4 1 1.5 1 1 .5 3.5-1.5 1-1.5 2.5-1.5 2.5-1.5 1.5.5 2.5.5 2.5 6.5 1 16.5 1 23 0 0 0 2-1 .5-2.5 0 0 0-1.5-1.5-2.5-.5-2.5-.5-2 .5-3.5 1-2 2.5-2 2.5-4-8.5-1.5-18.5-1.5-27 0z"/><path d="M11.5 30c3.5-1 18.5-1 22 0M12 33.5c6-1 15-1 21 0"/></g></svg>`,
    bk: `<svg viewBox="0 0 45 45"><g fill="none" fill-rule="evenodd" stroke="#fff" stroke-width="1.2" stroke-linecap="round" stroke-linejoin="round"><path d="M22.5 11.63V6M20 8h5" stroke-linejoin="miter"/><path d="M22.5 25s4.5-7.5 3-10.5c0 0-1-2.5-3-2.5s-3 2.5-3 2.5c-1.5 3 3 10.5 3 10.5" fill="#262522" stroke-linecap="butt"/><path d="M11.5 37c5.5 3.5 15.5 3.5 21 0v-7s9-4.5 6-10.5c-4-6.5-13.5-3.5-16 4V23v--.5C21 16 11.5 13 7.5 19.5c-3 6 5 10 5 10v7.5" fill="#262522"/><path d="M11.5 30c5.5-3 15.5-3 21 0M11.5 33.5c5.5-3 15.5-3 21 0M11.5 37c5.5-3 15.5-3 21 0"/></g></svg>`
  };

  class ChessBoardUI {
    constructor(containerElement, options = {}) {
      this.container = containerElement;
      this.orientation = options.orientation || 'w';
      this.onMove = options.onMove || null;
      this.interactive = options.interactive !== false;

      this.chess = null;
      this.selectedSquare = null;
      this.lastMove = null;
      this.badgeData = null;
      this.bestMoveArrow = null;
      this.blunderArrow = null;

      this.animationSpeed = options.animationSpeed || (function() {
        try { return localStorage.getItem('xcodechess_anim_speed') || 'mid'; } catch (e) { return 'mid'; }
      })();
      this.cleanupAnimations = null;

      this.squareElements = {};
      this.buildBoardDOM();
    }

    buildBoardDOM() {
      this.container.innerHTML = '';
      this.container.classList.add('chess-board-wrapper');

      // 1. Eval Bar Container
      const evalContainer = document.createElement('div');
      evalContainer.className = 'eval-bar-container';
      evalContainer.id = 'evalBarContainer';
      evalContainer.innerHTML = `
        <div class="eval-bar-track">
          <div class="eval-bar-fill" id="evalBarFill" style="height: 50%;"></div>
        </div>
        <div class="eval-bar-score" id="evalBarScore">0.0</div>
      `;
      this.container.appendChild(evalContainer);

      // 2. The 8x8 Board Container
      const boardElement = document.createElement('div');
      boardElement.className = 'chess-board-grid';
      this.boardElement = boardElement;

      // SVG Overlay for Arrows
      const svgOverlay = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
      svgOverlay.setAttribute('class', 'board-arrow-overlay');
      svgOverlay.setAttribute('viewBox', '0 0 800 800');
      svgOverlay.innerHTML = `
        <defs>
          <marker id="arrow-green" markerWidth="6" markerHeight="6" refX="4" refY="3" orient="auto">
            <path d="M 0 0 L 6 3 L 0 6 z" fill="#81b64c" />
          </marker>
          <marker id="arrow-red" markerWidth="6" markerHeight="6" refX="4" refY="3" orient="auto">
            <path d="M 0 0 L 6 3 L 0 6 z" fill="#fa412d" />
          </marker>
          <marker id="arrow-orange" markerWidth="6" markerHeight="6" refX="4" refY="3" orient="auto">
            <path d="M 0 0 L 6 3 L 0 6 z" fill="#ea580c" />
          </marker>
          <marker id="arrow-blue" markerWidth="6" markerHeight="6" refX="4" refY="3" orient="auto">
            <path d="M 0 0 L 6 3 L 0 6 z" fill="#3897f0" />
          </marker>
        </defs>
        <g id="arrowLayer"></g>
      `;
      boardElement.appendChild(svgOverlay);
      this.arrowLayer = svgOverlay.querySelector('#arrowLayer');

      // Build 64 squares (respecting orientation)
      const files = this.orientation === 'b' ? ['h', 'g', 'f', 'e', 'd', 'c', 'b', 'a'] : ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h'];
      const ranks = this.orientation === 'b' ? ['1', '2', '3', '4', '5', '6', '7', '8'] : ['8', '7', '6', '5', '4', '3', '2', '1'];

      for (let r = 0; r < 8; r++) {
        for (let f = 0; f < 8; f++) {
          const file = files[f];
          const rank = ranks[r];
          const sq = file + rank;
          const isLight = (r + f) % 2 === 0;

          const sqDiv = document.createElement('div');
          sqDiv.className = `board-sq ${isLight ? 'light-sq' : 'dark-sq'}`;
          sqDiv.dataset.square = sq;

          // Coordinate labels
          if (f === 0) {
            const rankLabel = document.createElement('span');
            rankLabel.className = 'sq-label rank-label';
            rankLabel.textContent = rank;
            sqDiv.appendChild(rankLabel);
          }
          if (r === 7) {
            const fileLabel = document.createElement('span');
            fileLabel.className = 'sq-label file-label';
            fileLabel.textContent = file;
            sqDiv.appendChild(fileLabel);
          }

          // Piece container
          const pieceHolder = document.createElement('div');
          pieceHolder.className = 'sq-piece';
          sqDiv.appendChild(pieceHolder);

          // Direct click listener: instant tap-to-move on moveable squares
          sqDiv.addEventListener('click', (e) => {
            if (this._recentlyDragged) return;
            this.handleSquareClick(sq, e);
          });

          boardElement.appendChild(sqDiv);
          this.squareElements[sq] = sqDiv;
        }
      }

      this.container.appendChild(boardElement);
      this.setupPointerInteraction();
    }

    findNearestLegalSquare(clientX, clientY, legalSquares) {
      if (!legalSquares || legalSquares.length === 0) return null;

      // 1. Direct hit check
      const directSq = this.getSquareFromPoint(clientX, clientY);
      if (directSq && legalSquares.includes(directSq)) {
        return directSq;
      }

      // 2. Measure square size for magnetic snap calculation
      let sqWidth = 45;
      if (this.boardElement) {
        const bRect = this.boardElement.getBoundingClientRect();
        if (bRect.width > 0) sqWidth = bRect.width / 8;
      }
      const maxMagneticDistance = sqWidth * 1.5; // Snap if within 1.5 square widths

      let bestSq = null;
      let minDistance = Infinity;

      for (let i = 0; i < legalSquares.length; i++) {
        const sq = legalSquares[i];
        const el = this.squareElements[sq];
        if (!el) continue;
        const r = el.getBoundingClientRect();
        const centerX = r.left + r.width / 2;
        const centerY = r.top + r.height / 2;
        const dist = Math.hypot(clientX - centerX, clientY - centerY);

        if (dist < minDistance) {
          minDistance = dist;
          bestSq = sq;
        }
      }

      if (minDistance <= maxMagneticDistance) {
        return bestSq;
      }
      return null;
    }

    getSquareFromPoint(clientX, clientY) {
      if (!this.boardElement) return null;

      // 1. Direct DOM elementFromPoint lookup
      try {
        const el = document.elementFromPoint(clientX, clientY);
        const sqEl = el?.closest('.board-sq');
        if (sqEl && sqEl.dataset && sqEl.dataset.square) {
          return sqEl.dataset.square;
        }
      } catch (_) {}

      // 2. Bounding rectangle math lookup
      const rect = this.boardElement.getBoundingClientRect();
      const margin = 25;
      if (
        clientX < rect.left - margin ||
        clientX > rect.right + margin ||
        clientY < rect.top - margin ||
        clientY > rect.bottom + margin
      ) {
        return null;
      }
      const relX = Math.max(0, Math.min(rect.width - 1, clientX - rect.left));
      const relY = Math.max(0, Math.min(rect.height - 1, clientY - rect.top));
      const fIdx = Math.min(7, Math.max(0, Math.floor((relX / rect.width) * 8)));
      const rIdx = Math.min(7, Math.max(0, Math.floor((relY / rect.height) * 8)));
      const files = this.orientation === 'b' ? ['h', 'g', 'f', 'e', 'd', 'c', 'b', 'a'] : ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h'];
      const ranks = this.orientation === 'b' ? ['1', '2', '3', '4', '5', '6', '7', '8'] : ['8', '7', '6', '5', '4', '3', '2', '1'];
      return files[fIdx] + ranks[rIdx];
    }

    selectSquare(sq) {
      if (!sq || !this.chess) {
        this.clearSelection();
        return;
      }
      const piece = this.chess.get(sq);
      if (piece && piece.color === this.chess.turn) {
        this.selectedSquare = sq;
        for (const s in this.squareElements) {
          this.squareElements[s].classList.toggle('selected', s === sq);
        }
        this.highlightLegalMoves(sq);
      } else {
        this.clearSelection();
      }
    }

    clearSelection() {
      this.selectedSquare = null;
      for (const s in this.squareElements) {
        this.squareElements[s].classList.remove('selected');
      }
      this.clearLegalHighlights();
    }

    attemptMove(fromSq, toSq) {
      if (!this.chess || !fromSq || !toSq || fromSq === toSq) return false;

      const moveAttempt = {
        from: fromSq,
        to: toSq,
        promotion: 'q'
      };

      const legalMove = this.chess.move(moveAttempt);
      if (legalMove) {
        this.selectedSquare = null;
        this.clearLegalHighlights();
        this.lastMove = { from: fromSq, to: toSq, san: legalMove.san };
        if (this.onMove) {
          this.onMove(legalMove);
        }
        this.render(false);
        return true;
      }
      return false;
    }

    updateDragHover(sq) {
      if (this._currentDragHoverSq === sq) return;
      if (this._currentDragHoverSq && this.squareElements[this._currentDragHoverSq]) {
        this.squareElements[this._currentDragHoverSq].classList.remove('drag-hover');
      }
      this._currentDragHoverSq = sq;
      if (sq && this.squareElements[sq]) {
        this.squareElements[sq].classList.add('drag-hover');
      }
    }

    clearDragHover() {
      if (this._currentDragHoverSq && this.squareElements[this._currentDragHoverSq]) {
        this.squareElements[this._currentDragHoverSq].classList.remove('drag-hover');
      }
      this._currentDragHoverSq = null;
    }

    handleSquareClick(sq, event) {
      if (!this.interactive || !this.chess) return;

      const piece = this.chess.get(sq);

      // Case 1: A piece was ALREADY selected on the board
      if (this.selectedSquare) {
        // 1a. Clicked same square -> Deselect
        if (this.selectedSquare === sq) {
          this.clearSelection();
          return;
        }

        // 1b. Clicked a moveable destination -> Execute Move!
        const moved = this.attemptMove(this.selectedSquare, sq);
        if (moved) return;

        // 1c. Clicked another friendly piece -> Switch selection
        if (piece && piece.color === this.chess.turn) {
          this.selectSquare(sq);
          return;
        }

        // 1d. Clicked an invalid/empty square -> Deselect
        this.clearSelection();
        return;
      }

      // Case 2: No piece previously selected
      if (piece && piece.color === this.chess.turn) {
        this.selectSquare(sq);
      }
    }

    setupPointerInteraction() {
      if (this._cleanupPointerListeners) {
        this._cleanupPointerListeners();
        this._cleanupPointerListeners = null;
      }

      let isDragging = false;
      let startSquare = null;
      let startX = 0;
      let startY = 0;
      let lastX = 0;
      let lastY = 0;
      let dragEl = null;
      let dragPieceHolder = null;
      let activeLegalDests = [];
      let isTouchActive = false;
      let previousSelectedSquare = null;

      const cleanupDrag = () => {
        this.clearDragHover();
        if (dragEl) {
          try { dragEl.remove(); } catch (_) {}
          dragEl = null;
        }
        if (dragPieceHolder) {
          dragPieceHolder.style.opacity = '1';
          dragPieceHolder = null;
        }
        const strayClones = document.querySelectorAll('.dragging-piece-clone');
        for (let i = 0; i < strayClones.length; i++) {
          try { strayClones[i].remove(); } catch (_) {}
        }
        for (const s in this.squareElements) {
          const ph = this.squareElements[s].querySelector('.sq-piece');
          if (ph) ph.style.opacity = '1';
        }
        isDragging = false;
        startSquare = null;
        activeLegalDests = [];
      };

      this.cleanupAllClones = cleanupDrag;

      // Handle press start
      const handlePressStart = (clientX, clientY, targetEl) => {
        if (!this.interactive || !this.chess) return;

        const sq = this.getSquareFromPoint(clientX, clientY) ||
                   targetEl?.closest('.board-sq')?.dataset?.square;
        if (!sq) return;

        startX = clientX;
        startY = clientY;
        lastX = clientX;
        lastY = clientY;
        isDragging = false;
        startSquare = sq;
        previousSelectedSquare = this.selectedSquare;

        const piece = this.chess.get(sq);
        const isFriendly = piece && piece.color === this.chess.turn;

        // Check if user clicked/tapped a moveable square for currently selected piece
        if (this.selectedSquare && this.selectedSquare !== sq) {
          const legalMoves = this.chess.moves({ square: this.selectedSquare, verbose: true });
          const isLegalDest = legalMoves.some(m => m.to === sq);
          if (isLegalDest) {
            // TAP-TO-MOVE / CLICK-MOVEABLE-SQUARE INSTANT TRIGGER!
            this.attemptMove(this.selectedSquare, sq);
            startSquare = null;
            return;
          }
        }

        // Cache legal moves for potential drag or selection
        if (isFriendly) {
          activeLegalDests = this.chess.moves({ square: sq, verbose: true }).map(m => m.to);
          this.selectSquare(sq);
        } else {
          activeLegalDests = [];
        }
      };

      // Handle press move
      const handlePressMove = (clientX, clientY) => {
        if (!startSquare) return;
        lastX = clientX;
        lastY = clientY;

        const dist = Math.hypot(clientX - startX, clientY - startY);

        // Initiate drag if moved past 5px threshold
        if (!isDragging && dist > 5) {
          const piece = this.chess.get(startSquare);
          if (!piece || piece.color !== this.chess.turn) return;

          const sqEl = this.squareElements[startSquare];
          if (!sqEl) return;
          const pieceHolder = sqEl.querySelector('.sq-piece');
          if (!pieceHolder || !pieceHolder.innerHTML) return;

          isDragging = true;
          dragPieceHolder = pieceHolder;

          dragEl = document.createElement('div');
          dragEl.className = 'dragging-piece-clone';
          dragEl.innerHTML = pieceHolder.innerHTML;

          const size = sqEl.getBoundingClientRect().width;
          dragEl.style.width = `${size}px`;
          dragEl.style.height = `${size}px`;
          dragEl.style.left = `${clientX - size / 2}px`;
          dragEl.style.top = `${clientY - size / 2}px`;
          document.body.appendChild(dragEl);

          // Fade original piece
          pieceHolder.style.opacity = '0.2';
        }

        if (isDragging && dragEl) {
          const size = parseFloat(dragEl.style.width) || 50;
          dragEl.style.left = `${clientX - size / 2}px`;
          dragEl.style.top = `${clientY - size / 2}px`;

          // Dynamic magnetic snap hover to nearest legal square!
          const nearestLegalSq = this.findNearestLegalSquare(clientX, clientY, activeLegalDests);
          this.updateDragHover(nearestLegalSq);
        }
      };

      // Handle press release
      const handlePressEnd = (clientX, clientY) => {
        const wasDragging = isDragging;
        const fromSq = startSquare;
        const hoverSq = this._currentDragHoverSq;
        const finalX = (clientX !== undefined && !isNaN(clientX) && clientX > 0) ? clientX : lastX;
        const finalY = (clientY !== undefined && !isNaN(clientY) && clientY > 0) ? clientY : lastY;

        if (wasDragging) {
          this._recentlyDragged = true;
          setTimeout(() => { this._recentlyDragged = false; }, 120);
        }

        cleanupDrag();

        if (wasDragging && fromSq) {
          // DRAG & DROP RELEASE: Land on magnetic nearest legal square or direct hit!
          const targetSq = hoverSq ||
                           this.findNearestLegalSquare(finalX, finalY, activeLegalDests) ||
                           this.getSquareFromPoint(finalX, finalY);

          if (targetSq && targetSq !== fromSq) {
            const moved = this.attemptMove(fromSq, targetSq);
            if (!moved) {
              this.selectSquare(fromSq);
            }
          } else {
            this.selectSquare(fromSq);
          }
        } else if (!wasDragging && fromSq) {
          // TAP / CLICK RELEASE:
          if (fromSq === previousSelectedSquare) {
            // Tapped the already-selected piece again -> Deselect!
            this.clearSelection();
          }
        }
      };

      let lastTouchTime = 0;

      // 1. Native Mobile Touch Events (Primary on Android & iOS)
      const onTouchStart = (e) => {
        if (!e.touches || e.touches.length === 0) return;
        lastTouchTime = Date.now();
        isTouchActive = true;
        const t = e.touches[0];
        const sq = this.getSquareFromPoint(t.clientX, t.clientY) || t.target?.closest('.board-sq')?.dataset?.square;
        const piece = sq && this.chess ? this.chess.get(sq) : null;
        const isFriendly = piece && piece.color === this.chess.turn;
        const isSelectedMove = this.selectedSquare && activeLegalDests.includes(sq);

        if (isFriendly || isSelectedMove) {
          try { if (e.cancelable) e.preventDefault(); } catch (_) {}
        }
        handlePressStart(t.clientX, t.clientY, t.target);
      };

      const onTouchMove = (e) => {
        if (!isTouchActive || !e.touches || e.touches.length === 0) return;
        const t = e.touches[0];
        if (isDragging) {
          try { if (e.cancelable) e.preventDefault(); } catch (_) {}
        }
        handlePressMove(t.clientX, t.clientY);
      };

      const onTouchEnd = (e) => {
        if (!isTouchActive) return;
        isTouchActive = false;
        const t = (e.changedTouches && e.changedTouches.length > 0) ? e.changedTouches[0] : (e.touches && e.touches.length > 0 ? e.touches[0] : null);
        const cx = t ? t.clientX : lastX;
        const cy = t ? t.clientY : lastY;
        if (isDragging) {
          try { if (e.cancelable) e.preventDefault(); } catch (_) {}
        }
        handlePressEnd(cx, cy);
      };

      const onTouchCancel = () => {
        isTouchActive = false;
        cleanupDrag();
      };

      this.boardElement.addEventListener('touchstart', onTouchStart, { passive: false });
      window.addEventListener('touchmove', onTouchMove, { passive: false });
      window.addEventListener('touchend', onTouchEnd, { passive: false });
      window.addEventListener('touchcancel', onTouchCancel);

      // 2. Mouse / Pointer Events (Desktop & unified touch fallback)
      const onPointerDown = (e) => {
        if (Date.now() - lastTouchTime < 300) return; // Prevent double trigger from synthetic events
        handlePressStart(e.clientX, e.clientY, e.target);
      };

      const onPointerMove = (e) => {
        if (isTouchActive) return;
        handlePressMove(e.clientX, e.clientY);
      };

      const onPointerUp = (e) => {
        if (isTouchActive) return;
        handlePressEnd(e.clientX, e.clientY);
      };

      this.boardElement.addEventListener('pointerdown', onPointerDown);
      window.addEventListener('pointermove', onPointerMove);
      window.addEventListener('pointerup', onPointerUp);
      window.addEventListener('blur', cleanupDrag);

      this._cleanupPointerListeners = () => {
        if (this.boardElement) {
          this.boardElement.removeEventListener('touchstart', onTouchStart);
          this.boardElement.removeEventListener('pointerdown', onPointerDown);
        }
        window.removeEventListener('touchmove', onTouchMove);
        window.removeEventListener('touchend', onTouchEnd);
        window.removeEventListener('touchcancel', onTouchCancel);
        window.removeEventListener('pointermove', onPointerMove);
        window.removeEventListener('pointerup', onPointerUp);
        window.removeEventListener('blur', cleanupDrag);
      };
    }

    getAnimationDuration() {
      switch (this.animationSpeed) {
        case 'slow': return 360;
        case 'mid': return 220;
        case 'fast': return 130;
        case 'off': return 0;
        default: return 220;
      }
    }

    setAnimationSpeed(speed) {
      this.animationSpeed = speed;
      try {
        localStorage.setItem('xcodechess_anim_speed', speed);
      } catch (e) {}
    }

    setGame(chess, animate = false) {
      this.chess = chess;
      this.render(animate);
    }

    render(animate = false) {
      if (!this.chess) return;

      // Purge any orphan dragging clones and captured ghosts
      const strayClones = document.querySelectorAll('.dragging-piece-clone');
      for (let i = 0; i < strayClones.length; i++) {
        try { strayClones[i].remove(); } catch (_) {}
      }

      // Cancel any active animation cleanup
      if (this.cleanupAnimations) {
        this.cleanupAnimations();
        this.cleanupAnimations = null;
      }
      if (this.boardElement) {
        const oldGhosts = this.boardElement.querySelectorAll('.sq-piece-captured-ghost');
        for (let i = 0; i < oldGhosts.length; i++) oldGhosts[i].remove();
      }

      const duration = this.getAnimationDuration();
      const shouldAnimate = animate && duration > 0 && this.lastMove && this.lastMove.from && this.lastMove.to && (this.lastMove.from !== this.lastMove.to);

      let prevCapturedHtml = '';
      let fromSqEl = null;
      let toSqEl = null;

      if (shouldAnimate) {
        fromSqEl = this.squareElements[this.lastMove.from];
        toSqEl = this.squareElements[this.lastMove.to];
        if (toSqEl) {
          const destHolder = toSqEl.querySelector('.sq-piece');
          if (destHolder && destHolder.innerHTML && destHolder.style.display !== 'none') {
            prevCapturedHtml = destHolder.innerHTML;
          }
        }
      }

      const inCheck = this.chess.in_check();
      const kingSq = this.chess.kings[this.chess.turn];
      const checkSquareName = kingSq !== -1 ? algebraic(kingSq) : null;

      // Update pieces on each square
      for (const sq in this.squareElements) {
        const sqEl = this.squareElements[sq];
        const piece = this.chess.get(sq);
        const pieceHolder = sqEl.querySelector('.sq-piece');

        // Clear square classes
        sqEl.classList.remove('selected', 'legal-dest', 'legal-capture', 'last-move-sq', 'last-move-mistake', 'in-check', 'drag-hover');

        // Check if selected
        if (this.selectedSquare === sq) {
          sqEl.classList.add('selected');
        }

        // Check if last move
        if (this.lastMove && (this.lastMove.from === sq || this.lastMove.to === sq)) {
          const isErrorBadge = this.badgeData && (this.badgeData.id === 'blunder' || this.badgeData.id === 'mistake' || this.badgeData.id === 'miss');
          if (isErrorBadge) {
            sqEl.classList.add('last-move-mistake');
          } else {
            sqEl.classList.add('last-move-sq');
          }
        }

        // Check if in check
        if (inCheck && sq === checkSquareName) {
          sqEl.classList.add('in-check');
        }

        // Update piece graphic
        if (piece) {
          const key = piece.color + piece.type;
          pieceHolder.innerHTML = PIECE_SVGS[key] || '';
          pieceHolder.style.display = 'flex';
          pieceHolder.style.transition = '';
          pieceHolder.style.transform = '';
          pieceHolder.style.zIndex = '10';
        } else {
          pieceHolder.innerHTML = '';
          pieceHolder.style.display = 'none';
          pieceHolder.style.transition = '';
          pieceHolder.style.transform = '';
          pieceHolder.style.zIndex = '';
        }

        // Remove old badge
        const oldBadge = sqEl.querySelector('.floating-badge');
        if (oldBadge) oldBadge.remove();
      }

      // Maintain legal move dots if piece is selected
      if (this.selectedSquare) {
        this.highlightLegalMoves(this.selectedSquare);
      } else {
        this.clearLegalHighlights();
      }

      // Show move badge on destination square if available
      if (this.badgeData && this.lastMove && this.lastMove.to) {
        const destSq = this.squareElements[this.lastMove.to];
        if (destSq) {
          const badgeEl = document.createElement('div');
          badgeEl.className = 'floating-badge';
          badgeEl.style.background = this.badgeData.bg;
          badgeEl.innerHTML = `<span class="badge-icon">${this.badgeData.icon}</span>`;
          badgeEl.title = `${this.badgeData.name}: ${this.badgeData.desc}`;
          destSq.appendChild(badgeEl);
        }
      }

      // Draw SVG Engine Arrows
      this.drawArrows();

      // Trigger Piece Glide Animation
      if (shouldAnimate && fromSqEl && toSqEl) {
        const movingPieceHolder = toSqEl.querySelector('.sq-piece');
        if (movingPieceHolder && movingPieceHolder.innerHTML) {
          const fromRect = fromSqEl.getBoundingClientRect();
          const toRect = toSqEl.getBoundingClientRect();
          const dx = fromRect.left - toRect.left;
          const dy = fromRect.top - toRect.top;

          if (fromRect.width > 0 && (dx !== 0 || dy !== 0)) {
            // 1. Ghost of captured piece
            let ghostEl = null;
            if (prevCapturedHtml) {
              ghostEl = document.createElement('div');
              ghostEl.className = 'sq-piece-captured-ghost';
              ghostEl.innerHTML = prevCapturedHtml;
              ghostEl.style.transition = `opacity ${duration}ms ease-out, transform ${duration}ms ease-out`;
              toSqEl.appendChild(ghostEl);
              requestAnimationFrame(() => {
                ghostEl.style.opacity = '0';
                ghostEl.style.transform = 'scale(0.65)';
              });
            }

            // 2. Castling detection
            let rookAnim = null;
            const movedPiece = this.chess.get(this.lastMove.to);
            if (movedPiece && movedPiece.type === 'k') {
              const f1 = this.lastMove.from.charCodeAt(0) - 97;
              const f2 = this.lastMove.to.charCodeAt(0) - 97;
              if (Math.abs(f1 - f2) === 2) {
                let rFrom, rTo;
                if (this.lastMove.to === 'g1') { rFrom = 'h1'; rTo = 'f1'; }
                else if (this.lastMove.to === 'c1') { rFrom = 'a1'; rTo = 'd1'; }
                else if (this.lastMove.to === 'g8') { rFrom = 'h8'; rTo = 'f8'; }
                else if (this.lastMove.to === 'c8') { rFrom = 'a8'; rTo = 'd8'; }

                if (rFrom && rTo && this.squareElements[rFrom] && this.squareElements[rTo]) {
                  const rFromEl = this.squareElements[rFrom];
                  const rToEl = this.squareElements[rTo];
                  const rHolder = rToEl.querySelector('.sq-piece');
                  if (rHolder) {
                    const rfRect = rFromEl.getBoundingClientRect();
                    const rtRect = rToEl.getBoundingClientRect();
                    rookAnim = {
                      holder: rHolder,
                      dx: rfRect.left - rtRect.left,
                      dy: rfRect.top - rtRect.top
                    };
                  }
                }
              }
            }

            // 3. Set start position
            movingPieceHolder.style.transition = 'none';
            movingPieceHolder.style.transform = `translate(${dx}px, ${dy}px)`;
            movingPieceHolder.style.zIndex = '40';
            movingPieceHolder.style.pointerEvents = 'none';

            if (rookAnim) {
              rookAnim.holder.style.transition = 'none';
              rookAnim.holder.style.transform = `translate(${rookAnim.dx}px, ${rookAnim.dy}px)`;
              rookAnim.holder.style.zIndex = '39';
              rookAnim.holder.style.pointerEvents = 'none';
            }

            // Force reflow
            void movingPieceHolder.offsetWidth;

            // 4. Animate to destination
            const animTimer = setTimeout(() => {
              const ease = 'cubic-bezier(0.2, 0, 0.2, 1)';
              movingPieceHolder.style.transition = `transform ${duration}ms ${ease}`;
              movingPieceHolder.style.transform = 'translate(0px, 0px)';

              if (rookAnim) {
                rookAnim.holder.style.transition = `transform ${duration}ms ${ease}`;
                rookAnim.holder.style.transform = 'translate(0px, 0px)';
              }
            }, 10);

            const cleanup = () => {
              clearTimeout(animTimer);
              if (movingPieceHolder) {
                movingPieceHolder.style.transition = '';
                movingPieceHolder.style.transform = '';
                movingPieceHolder.style.zIndex = '10';
                movingPieceHolder.style.pointerEvents = '';
              }
              if (rookAnim && rookAnim.holder) {
                rookAnim.holder.style.transition = '';
                rookAnim.holder.style.transform = '';
                rookAnim.holder.style.zIndex = '10';
                rookAnim.holder.style.pointerEvents = '';
              }
              if (ghostEl && ghostEl.parentNode) {
                ghostEl.remove();
              }
            };

            const endTimer = setTimeout(cleanup, duration + 40);
            this.cleanupAnimations = () => {
              cleanup();
              clearTimeout(endTimer);
            };
          }
        }
      }
    }

    handleSquareClick(sq, event) {
      if (!this.interactive || !this.chess) return;

      if (this.selectedSquare) {
        if (this.selectedSquare === sq) {
          this.clearSelection();
          return;
        }

        const moved = this.attemptMove(this.selectedSquare, sq);
        if (moved) return;

        const piece = this.chess.get(sq);
        if (piece && piece.color === this.chess.turn) {
          this.selectSquare(sq);
          return;
        }

        this.clearSelection();
        return;
      }

      this.selectSquare(sq);
    }

    highlightLegalMoves(square) {
      this.clearLegalHighlights();
      if (!this.chess) return;

      const moves = this.chess.moves({square: square, verbose: true});
      for (let i = 0; i < moves.length; i++) {
        const dest = moves[i].to;
        const sqEl = this.squareElements[dest];
        if (sqEl) {
          if (moves[i].captured) {
            sqEl.classList.add('legal-capture');
          } else {
            sqEl.classList.add('legal-dest');
          }
        }
      }
    }

    clearLegalHighlights() {
      for (const sq in this.squareElements) {
        this.squareElements[sq].classList.remove('legal-dest', 'legal-capture');
      }
    }

    setEvaluation(evalCp, mateIn) {
      const fillEl = document.getElementById('evalBarFill');
      const scoreEl = document.getElementById('evalBarScore');
      if (!fillEl || !scoreEl) return;

      if (mateIn !== null && mateIn !== undefined) {
        scoreEl.textContent = `M${Math.abs(mateIn)}`;
        const percent = mateIn > 0 ? 100 : 0;
        fillEl.style.height = `${percent}%`;
        return;
      }

      const cp = evalCp || 0;
      // Convert cp to percentage using sigmoid
      const winProb = 100 / (1 + Math.exp(-0.00368208 * cp));
      fillEl.style.height = `${winProb}%`;

      const pawns = (cp / 100).toFixed(1);
      scoreEl.textContent = cp > 0 ? `+${pawns}` : `${pawns}`;
    }

    setArrows(bestMove, blunderMove, threatMove) {
      this.bestMoveArrow = bestMove;
      this.blunderArrow = blunderMove;
      this.threatArrow = threatMove;
      this.drawArrows();
    }

    drawArrows() {
      if (!this.arrowLayer) return;
      this.arrowLayer.innerHTML = '';

      if (this.threatArrow) {
        this.renderArrow(this.threatArrow.from, this.threatArrow.to, '#ea580c', 'arrow-orange');
      }
      if (this.blunderArrow) {
        this.renderArrow(this.blunderArrow.from, this.blunderArrow.to, '#fa412d', 'arrow-red');
      }
      if (this.bestMoveArrow) {
        this.renderArrow(this.bestMoveArrow.from, this.bestMoveArrow.to, '#81b64c', 'arrow-green');
      }
    }

    renderArrow(fromSq, toSq, color, markerId) {
      if (!fromSq || !toSq || fromSq === toSq) return;

      const f1 = 'abcdefgh'.indexOf(fromSq[0]);
      const r1 = '87654321'.indexOf(fromSq[1]);
      const f2 = 'abcdefgh'.indexOf(toSq[0]);
      const r2 = '87654321'.indexOf(toSq[1]);

      if (f1 === -1 || r1 === -1 || f2 === -1 || r2 === -1) return;

      const x1 = f1 * 100 + 50;
      const y1 = r1 * 100 + 50;
      const x2 = f2 * 100 + 50;
      const y2 = r2 * 100 + 50;

      // Adjust endpoint slightly before square center so marker doesn't overshoot
      const dx = x2 - x1;
      const dy = y2 - y1;
      const len = Math.sqrt(dx * dx + dy * dy);
      const shorten = 26;
      const endX = x2 - (dx / len) * shorten;
      const endY = y2 - (dy / len) * shorten;

      const line = document.createElementNS('http://www.w3.org/2000/svg', 'line');
      line.setAttribute('x1', x1);
      line.setAttribute('y1', y1);
      line.setAttribute('x2', endX);
      line.setAttribute('y2', endY);
      line.setAttribute('stroke', color);
      line.setAttribute('stroke-width', '18');
      line.setAttribute('stroke-linecap', 'round');
      line.setAttribute('opacity', '0.85');
      line.setAttribute('marker-end', `url(#${markerId})`);

      this.arrowLayer.appendChild(line);
    }

    setLastMove(from, to, badge = null, animate = true) {
      this.lastMove = { from, to };
      this.badgeData = badge;
      this.render(animate);
    }
  }

  function algebraic(i) {
    const f = i & 15;
    const r = i >> 4;
    return 'abcdefgh'.substring(f, f + 1) + '87654321'.substring(r, r + 1);
  }

  global.ChessBoardUI = ChessBoardUI;

})(typeof window !== 'undefined' ? window : this);
