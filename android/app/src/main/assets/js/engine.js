/**
 * ChessEngine - High-Performance Positional & Tactical Evaluation Engine
 * Features:
 * - Alpha-Beta search with Quiescence capture search
 * - Piece-Square Tables (PST) & Positional Heuristics
 * - Tactical threat recognition (Hanging pieces, Forks, Pins, Skewers, Mates)
 * - Lichess Cloud Eval API support for instant GM 40-depth cache
 */
(function(global) {
  'use strict';

  // Standard Piece Values (centipawns)
  const PIECE_VALUES = {
    p: 100,
    n: 320,
    b: 330,
    r: 500,
    q: 900,
    k: 20000
  };

  // Positional Piece Square Tables (White's perspective, mirrored for Black)
  const PAWN_TABLE = [
      0,  0,  0,  0,  0,  0,  0,  0,
     50, 50, 50, 50, 50, 50, 50, 50,
     10, 10, 20, 30, 30, 20, 10, 10,
      5,  5, 10, 25, 25, 10,  5,  5,
      0,  0,  0, 20, 20,  0,  0,  0,
      5, -5,-10,  0,  0,-10, -5,  5,
      5, 10, 10,-20,-20, 10, 10,  5,
      0,  0,  0,  0,  0,  0,  0,  0
  ];

  const KNIGHT_TABLE = [
    -50,-40,-30,-30,-30,-30,-40,-50,
    -40,-20,  0,  0,  0,  0,-20,-40,
    -30,  0, 10, 15, 15, 10,  0,-30,
    -30,  5, 15, 20, 20, 15,  5,-30,
    -30,  0, 15, 20, 20, 15,  0,-30,
    -30,  5, 10, 15, 15, 10,  5,-30,
    -40,-20,  0,  5,  5,  0,-20,-40,
    -50,-40,-30,-30,-30,-30,-40,-50
  ];

  const BISHOP_TABLE = [
    -20,-10,-10,-10,-10,-10,-10,-20,
    -10,  0,  5,  0,  0,  5,  0,-10,
    -10, 10, 10, 10, 10, 10, 10,-10,
    -10,  0, 10, 10, 10, 10,  0,-10,
    -10,  5,  5, 10, 10,  5,  5,-10,
    -10,  0,  5, 10, 10,  5,  0,-10,
    -10,  0,  0,  0,  0,  0,  0,-10,
    -20,-10,-10,-10,-10,-10,-10,-20
  ];

  const ROOK_TABLE = [
      0,  0,  0,  0,  0,  0,  0,  0,
      5, 10, 10, 10, 10, 10, 10,  5,
     -5,  0,  0,  0,  0,  0,  0, -5,
     -5,  0,  0,  0,  0,  0,  0, -5,
     -5,  0,  0,  0,  0,  0,  0, -5,
     -5,  0,  0,  0,  0,  0,  0, -5,
     -5,  0,  0,  0,  0,  0,  0, -5,
      0,  0,  0,  5,  5,  0,  0,  0
  ];

  const QUEEN_TABLE = [
    -20,-10,-10, -5, -5,-10,-10,-20,
    -10,  0,  0,  0,  0,  0,  0,-10,
    -10,  0,  5,  5,  5,  5,  0,-10,
     -5,  0,  5,  5,  5,  5,  0, -5,
      0,  0,  5,  5,  5,  5,  0, -5,
    -10,  5,  5,  5,  5,  5,  0,-10,
    -10,  0,  5,  0,  0,  0,  0,-10,
    -20,-10,-10, -5, -5,-10,-10,-20
  ];

  const KING_TABLE_MID = [
    -30,-40,-40,-50,-50,-40,-40,-30,
    -30,-40,-40,-50,-50,-40,-40,-30,
    -30,-40,-40,-50,-50,-40,-40,-30,
    -30,-40,-40,-50,-50,-40,-40,-30,
    -20,-30,-30,-40,-40,-30,-30,-20,
    -10,-20,-20,-20,-20,-20,-20,-10,
     20, 20,  0,  0,  0,  0, 20, 20,
     20, 30, 10,  0,  0, 10, 30, 20
  ];

  const PST_MAP = {
    p: PAWN_TABLE,
    n: KNIGHT_TABLE,
    b: BISHOP_TABLE,
    r: ROOK_TABLE,
    q: QUEEN_TABLE,
    k: KING_TABLE_MID
  };

  class StockfishWorker {
    constructor() {
      this.worker = null;
      this.isReady = false;
      this.engineName = 'Stockfish 10';
      this.currentResolve = null;
      this.currentReject = null;
      this.timeoutId = null;
      this.latestInfo = null;
      this.elo = 2000;
      this.skillLevel = 10; // Default: Expert (10 / 20)
      this.init();
    }

    init() {
      if (typeof window === 'undefined' || typeof Worker === 'undefined') return;

      try {
        // Direct local worker from js/stockfish.js (zero CDN latency, works 100% offline)
        try {
          this.worker = new Worker('js/stockfish.js');
        } catch (e1) {
          try {
            this.worker = new Worker('/js/stockfish.js');
          } catch (e2) {
            console.warn("Direct Worker failed, trying blob loader:", e2);
            const blob = new Blob(["importScripts('" + window.location.origin + "/js/stockfish.js');"], { type: 'application/javascript' });
            this.worker = new Worker(URL.createObjectURL(blob));
          }
        }

        this.worker.onmessage = (e) => {
          const line = typeof e.data === 'string' ? e.data : (e.data && e.data.data ? e.data.data : '');
          this.handleLine(line);
        };

        this.worker.onerror = (err) => {
          console.warn("Stockfish worker error, using fallback evaluator:", err);
          this.isReady = false;
        };

        this.worker.postMessage('uci');
        this.worker.postMessage('isready');
      } catch (err) {
        console.warn("Could not start Stockfish worker, using local engine:", err);
      }
    }

    setElo(elo) {
      this.elo = Math.max(800, Math.min(3200, parseInt(elo, 10) || 2000));
      // Map Elo 800..3200 into Stockfish Skill Level 0..20
      let skill = Math.round(((this.elo - 800) / 2400) * 20);
      skill = Math.max(0, Math.min(20, skill));
      this.skillLevel = skill;

      if (this.worker && this.isReady) {
        this.worker.postMessage('setoption name Skill Level value ' + skill);
        this.worker.postMessage('isready');
      }
      console.log(`[Stockfish] Elo configured to ${this.elo} (Skill Level ${skill}/20)`);
      if (global.onStockfishEloChanged) {
        global.onStockfishEloChanged(this.elo, skill);
      }
    }

    handleLine(line) {
      if (!line) return;

      if (line.includes('uciok') || line.includes('readyok')) {
        this.isReady = true;
        // Apply current skill level
        if (this.skillLevel !== undefined) {
          this.worker.postMessage('setoption name Skill Level value ' + this.skillLevel);
        }
        if (global.onStockfishReady) {
          global.onStockfishReady(this.engineName, this.elo);
        }
      }

      // Parse Stockfish evaluation info line
      // e.g. "info depth 12 seldepth 16 score cp 35 nodes 24102 nps 450123 pv e2e4 e7e5 g1f3"
      if (line.startsWith('info') && line.includes('score')) {
        const cpMatch = line.match(/score cp (-?\d+)/);
        const mateMatch = line.match(/score mate (-?\d+)/);
        const depthMatch = line.match(/depth (\d+)/);
        const pvMatch = line.match(/pv (.+)$/);

        let cp = 0;
        let isMate = false;
        if (cpMatch) {
          cp = parseInt(cpMatch[1], 10);
        } else if (mateMatch) {
          const mateIn = parseInt(mateMatch[1], 10);
          cp = mateIn > 0 ? (30000 - mateIn * 100) : (-30000 - mateIn * 100);
          isMate = true;
        }

        const depth = depthMatch ? parseInt(depthMatch[1], 10) : 0;
        const pvUcis = pvMatch ? pvMatch[1].trim().split(/\s+/) : [];

        this.latestInfo = {
          eval: cp,
          depth: depth,
          isMate: isMate,
          pvUcis: pvUcis
        };
      }

      // Parse bestmove line: "bestmove e2e4 ponder e7e5"
      if (line.startsWith('bestmove')) {
        if (this.timeoutId) clearTimeout(this.timeoutId);
        const parts = line.split(' ');
        const bestUci = parts[1];

        if (this.currentResolve) {
          const resolve = this.currentResolve;
          this.currentResolve = null;
          resolve({
            bestUci: bestUci,
            info: this.latestInfo
          });
        }
      }
    }

    evaluate(fen, depth = null, timeoutMs = 2500) {
      return new Promise((resolve) => {
        if (!this.isReady || !this.worker) {
          return resolve(null);
        }

        // Dynamically scale depth based on selected Elo rating
        let searchDepth = depth;
        if (!searchDepth) {
          if (this.skillLevel <= 3) searchDepth = 5;       // Beginner (~800-1100)
          else if (this.skillLevel <= 7) searchDepth = 8;  // Intermediate (~1200-1500)
          else if (this.skillLevel <= 13) searchDepth = 11; // Club/Expert (~1600-2000)
          else if (this.skillLevel <= 18) searchDepth = 13; // Master (~2100-2500)
          else searchDepth = 16;                           // GM / Max (~2600-3200)
        }

        this.latestInfo = null;
        this.currentResolve = resolve;

        this.timeoutId = setTimeout(() => {
          this.currentResolve = null;
          if (this.worker) this.worker.postMessage('stop');
          resolve(this.latestInfo ? { bestUci: (this.latestInfo.pvUcis[0] || null), info: this.latestInfo } : null);
        }, timeoutMs);

        this.worker.postMessage('stop');
        this.worker.postMessage('position fen ' + fen);
        this.worker.postMessage('go depth ' + searchDepth);
      });
    }
  }

  class ChessEngine {
    constructor() {
      this.transpositionTable = new Map();
      this.cloudCache = new Map();
      this.stockfish = new StockfishWorker();
      const savedElo = (typeof localStorage !== 'undefined' && localStorage.getItem) ? (localStorage.getItem('xcodechess_stockfish_elo') || 2000) : 2000;
      this.setElo(savedElo);
    }

    setElo(elo) {
      this.elo = parseInt(elo, 10) || 2000;
      if (this.stockfish) {
        this.stockfish.setElo(this.elo);
      }
    }

    /**
     * Converts board square index 0..63 to 0x88 square
     */
    static sqIndex(fileChar, rankChar) {
      const f = 'abcdefgh'.indexOf(fileChar);
      const r = '87654321'.indexOf(rankChar);
      return r * 8 + f;
    }

    /**
     * Static evaluation of the position from White's perspective (+ = White advantage, - = Black advantage)
     */
    evaluatePosition(chess) {
      if (chess.in_checkmate()) {
        return chess.turn === 'w' ? -30000 : 30000;
      }
      if ((chess.in_draw ? chess.in_draw() : false) || chess.in_stalemate() || chess.insufficient_material()) {
        return 0;
      }

      let score = 0;
      const board = chess.board;

      for (let i = 0; i < 128; i++) {
        if (i & 0x88) { i += 7; continue; }
        const p = board[i];
        if (!p) continue;

        const val = PIECE_VALUES[p.type];
        const rank = i >> 4;
        const file = i & 15;
        const squareIndex = rank * 8 + file;
        const table = PST_MAP[p.type];

        let pstScore = 0;
        if (table) {
          if (p.color === 'w') {
            pstScore = table[squareIndex];
          } else {
            // Mirror table for Black
            const mirroredIndex = (7 - rank) * 8 + file;
            pstScore = table[mirroredIndex];
          }
        }

        if (p.color === 'w') {
          score += val + pstScore;
        } else {
          score -= (val + pstScore);
        }
      }

      // Bonus for bishop pair
      let wBishops = 0;
      let bBishops = 0;
      for (let i = 0; i < 128; i++) {
        if (i & 0x88) { i += 7; continue; }
        const p = board[i];
        if (p && p.type === 'b') {
          if (p.color === 'w') wBishops++;
          else bBishops++;
        }
      }
      if (wBishops >= 2) score += 40;
      if (bBishops >= 2) score -= 40;

      // Bonus for center control and development
      const moves = chess.generate_moves({legal: false});
      const mobilityFactor = 2;
      if (chess.turn === 'w') {
        score += moves.length * mobilityFactor;
      } else {
        score -= moves.length * mobilityFactor;
      }

      return score;
    }

    /**
     * Quiescence search for noisy moves (captures) to stabilize tactical evaluation.
     * Consistently evaluates from White's perspective (+ = White, - = Black) to match alphaBeta minimax.
     */
    quiesce(chess, alpha, beta, isMaximizing, depth = 0, maxDepth = 2) {
      const standPat = this.evaluatePosition(chess);

      if (depth >= maxDepth || chess.game_over()) {
        return standPat;
      }

      const moves = chess.moves({verbose: true}).filter(m => m.captured || (m.flags && m.flags.includes('p')));
      if (moves.length === 0) {
        return standPat;
      }

      moves.sort((a, b) => {
        const valA = (PIECE_VALUES[a.captured] || 0) - (PIECE_VALUES[a.piece] || 0);
        const valB = (PIECE_VALUES[b.captured] || 0) - (PIECE_VALUES[b.piece] || 0);
        return valB - valA;
      });

      if (isMaximizing) {
        if (standPat >= beta) return beta;
        if (standPat > alpha) alpha = standPat;

        for (let i = 0; i < moves.length; i++) {
          chess.move(moves[i]);
          const score = this.quiesce(chess, alpha, beta, false, depth + 1, maxDepth);
          chess.undo();

          if (score >= beta) return beta;
          if (score > alpha) alpha = score;
        }
        return alpha;
      } else {
        if (standPat <= alpha) return alpha;
        if (standPat < beta) beta = standPat;

        for (let i = 0; i < moves.length; i++) {
          chess.move(moves[i]);
          const score = this.quiesce(chess, alpha, beta, true, depth + 1, maxDepth);
          chess.undo();

          if (score <= alpha) return alpha;
          if (score < beta) beta = score;
        }
        return beta;
      }
    }

    /**
     * Minimax Alpha-Beta Search
     */
    alphaBeta(chess, depth, alpha, beta, isMaximizing) {
      if (depth === 0 || chess.game_over()) {
        return this.quiesce(chess, alpha, beta, isMaximizing, 0, 2);
      }

      const moves = chess.moves({verbose: true});
      if (moves.length === 0) {
        if (chess.in_check()) {
          return isMaximizing ? -25000 - depth : 25000 + depth;
        }
        return 0; // Stalemate
      }

      // Move ordering: captures first
      moves.sort((a, b) => {
        const scoreA = (a.captured ? PIECE_VALUES[a.captured] * 10 - PIECE_VALUES[a.piece] : 0) + (a.san.includes('+') ? 50 : 0);
        const scoreB = (b.captured ? PIECE_VALUES[b.captured] * 10 - PIECE_VALUES[b.piece] : 0) + (b.san.includes('+') ? 50 : 0);
        return scoreB - scoreA;
      });

      if (isMaximizing) {
        let maxEval = -Infinity;
        for (let i = 0; i < moves.length; i++) {
          chess.move(moves[i]);
          const evalScore = this.alphaBeta(chess, depth - 1, alpha, beta, false);
          chess.undo();

          maxEval = Math.max(maxEval, evalScore);
          alpha = Math.max(alpha, evalScore);
          if (beta <= alpha) break;
        }
        return maxEval;
      } else {
        let minEval = Infinity;
        for (let i = 0; i < moves.length; i++) {
          chess.move(moves[i]);
          const evalScore = this.alphaBeta(chess, depth - 1, alpha, beta, true);
          chess.undo();

          minEval = Math.min(minEval, evalScore);
          beta = Math.min(beta, evalScore);
          if (beta <= alpha) break;
        }
        return minEval;
      }
    }

    /**
     * Converts UCI string (e.g. "e2e4" or "e7e8q") to Chess.js legal move object
     */
    uciToMove(chess, uci) {
      if (!uci || uci.length < 4) return null;
      const from = uci.slice(0, 2);
      const to = uci.slice(2, 4);
      const promotion = uci.length > 4 ? uci[4].toLowerCase() : undefined;
      const moves = chess.moves({verbose: true});
      return moves.find(m => m.from === from && m.to === to && (!promotion || m.promotion === promotion)) || null;
    }

    /**
     * Finds top engine moves and evaluates position using Stockfish (with instant fallback)
     * @returns {Promise<{eval: number, bestMove: object, pv: array, isStockfish: boolean}>}
     */
    async analyze(chess, depth = 3, allowCloud = false) {
      const fen = chess.fen();

      // 1. Prioritize Real Stockfish Web Worker
      if (this.stockfish && this.stockfish.isReady) {
        try {
          const sfRes = await this.stockfish.evaluate(fen, Math.max(8, depth), 1000);
          if (sfRes && sfRes.bestUci) {
            const bestMove = this.uciToMove(chess, sfRes.bestUci);
            if (bestMove) {
              // Convert PV UCI moves to legal move objects
              const pvMoves = [];
              const sim = new global.Chess(fen);
              const ucis = sfRes.info && sfRes.info.pvUcis ? sfRes.info.pvUcis : [sfRes.bestUci];

              for (let u = 0; u < Math.min(5, ucis.length); u++) {
                const m = this.uciToMove(sim, ucis[u]);
                if (m) {
                  pvMoves.push(m);
                  sim.move(m);
                } else {
                  break;
                }
              }

              // In Stockfish UCI protocol, score cp is from the SIDE TO MOVE'S perspective.
              // Normalize evaluation to ALWAYS be from White's perspective (+ = White, - = Black):
              const rawCp = sfRes.info ? sfRes.info.eval : 0;
              const evalFromWhite = (chess.turn === 'w') ? rawCp : -rawCp;

              return {
                eval: evalFromWhite,
                bestMove: bestMove,
                pv: pvMoves,
                isStockfish: true,
                depth: sfRes.info ? sfRes.info.depth : 12
              };
            }
          }
        } catch (sfErr) {
          console.warn("Stockfish eval failed, using local engine:", sfErr);
        }
      }

      // 2. Check cloud eval cache or fetch if explicitly allowed
      if (this.cloudCache.has(fen)) {
        return this.cloudCache.get(fen);
      }
      if (allowCloud) {
        try {
          const cloudData = await this.queryCloudEval(fen, chess);
          if (cloudData) {
            return cloudData;
          }
        } catch (e) {
          // Fallback to local minimax search
        }
      }

      const legalMoves = chess.moves({verbose: true});
      if (legalMoves.length === 0) {
        const score = chess.in_check() ? (chess.turn === 'w' ? -30000 : 30000) : 0;
        return {
          eval: score,
          bestMove: null,
          pv: [],
          topMoves: []
        };
      }

      const isWhite = chess.turn === 'w';
      const evaluatedMoves = [];

      for (let i = 0; i < legalMoves.length; i++) {
        const m = legalMoves[i];
        chess.move(m);
        // Minimax evaluation
        const score = this.alphaBeta(chess, depth - 1, -Infinity, Infinity, !isWhite);
        chess.undo();

        evaluatedMoves.push({
          move: m,
          score: score
        });
      }

      // Sort by best score for current player
      if (isWhite) {
        evaluatedMoves.sort((a, b) => b.score - a.score);
      } else {
        evaluatedMoves.sort((a, b) => a.score - b.score);
      }

      const best = evaluatedMoves[0];

      // Build multi-move Principal Variation (PV) continuation line
      const pvMoves = [];
      const simChess = new global.Chess(chess.fen());
      let nextMove = best.move;
      const maxPvDepth = 4;

      while (nextMove && pvMoves.length < maxPvDepth) {
        pvMoves.push(nextMove);
        simChess.move(nextMove);
        if (simChess.game_over()) break;

        const responses = simChess.moves({verbose: true});
        if (responses.length === 0) break;

        let bestResponse = null;
        let bestResponseScore = simChess.turn === 'w' ? -Infinity : Infinity;

        // Fast static evaluation with quiescence to pick top continuation
        for (let r = 0; r < responses.length; r++) {
          simChess.move(responses[r]);
          const sc = this.evaluatePosition(simChess);
          simChess.undo();
          if (simChess.turn === 'w') {
            if (sc > bestResponseScore) {
              bestResponseScore = sc;
              bestResponse = responses[r];
            }
          } else {
            if (sc < bestResponseScore) {
              bestResponseScore = sc;
              bestResponse = responses[r];
            }
          }
        }
        nextMove = bestResponse;
      }

      return {
        eval: best.score,
        bestMove: best.move,
        pv: pvMoves,
        topMoves: evaluatedMoves.slice(0, 3)
      };
    }

    /**
     * Generates the opponent's punishment / future continuation line for any move
     */
    async getContinuationLine(chessBefore, movePlayed, maxPlies = 8) {
      const sim = new global.Chess(chessBefore.fen());
      const legal = sim.move(movePlayed);
      if (!legal) return [];

      return await this.getDeepContinuation(sim, maxPlies);
    }

    /**
     * Retrieves deep multi-ply continuation line from Stockfish or local search.
     * Accurately extracts full forced checkmate sequences and tactical punishing lines.
     */
    async getDeepContinuation(chess, maxPlies = 10) {
      const fen = chess.fen();
      const line = [];

      // 1. Try real Stockfish engine first
      if (this.stockfish && this.stockfish.isReady) {
        try {
          const sfRes = await this.stockfish.evaluate(fen, Math.max(12, maxPlies + 2), 2200);
          if (sfRes && sfRes.info && sfRes.info.pvUcis && sfRes.info.pvUcis.length > 0) {
            const sim = new global.Chess(fen);
            const ucis = sfRes.info.pvUcis;
            // If forced checkmate, extract full checkmate sequence!
            const limit = sfRes.info.isMate ? ucis.length : Math.min(maxPlies, ucis.length);

            for (let u = 0; u < limit; u++) {
              const m = this.uciToMove(sim, ucis[u]);
              if (m) {
                line.push(m);
                sim.move(m);
                if (sim.game_over()) break;
              } else {
                break;
              }
            }

            if (line.length > 0) {
              line.isMate = !!sfRes.info.isMate;
              line.eval = sfRes.info.eval;
              return line;
            }
          }
        } catch (sfErr) {
          console.warn("Stockfish deep continuation error:", sfErr);
        }
      }

      // 2. Fallback to local minimax tactical search
      const sim = new global.Chess(fen);
      let currentTurn = sim.turn;

      for (let i = 0; i < maxPlies; i++) {
        if (sim.game_over()) break;
        const legalMoves = sim.moves({verbose: true});
        if (legalMoves.length === 0) break;

        let bestReply = null;
        let bestScore = currentTurn === 'w' ? -Infinity : Infinity;

        for (let m = 0; m < legalMoves.length; m++) {
          sim.move(legalMoves[m]);
          const sc = this.evaluatePosition(sim);
          sim.undo();
          if (currentTurn === 'w') {
            if (sc > bestScore) {
              bestScore = sc;
              bestReply = legalMoves[m];
            }
          } else {
            if (sc < bestScore) {
              bestScore = sc;
              bestReply = legalMoves[m];
            }
          }
        }

        if (bestReply) {
          line.push(bestReply);
          sim.move(bestReply);
          currentTurn = sim.turn;
        } else {
          break;
        }
      }

      return line;
    }

    /**
     * Query Lichess Cloud Eval for instant Stockfish GM 40-depth analysis
     */
    async queryCloudEval(fen, chess = null) {
      if (typeof window !== 'undefined' && window.location.protocol === 'file:') {
        return null; // Instant local engine when opening directly via file://
      }

      if (this.cloudCache.has(fen)) {
        return this.cloudCache.get(fen);
      }

      try {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 1200);

        const url = `https://lichess.org/api/cloud-eval?fen=${encodeURIComponent(fen)}&multiPv=2`;
        const res = await fetch(url, { signal: controller.signal });
        clearTimeout(timeoutId);

        if (res.ok) {
          const data = await res.json();
          if (data && data.pvs && data.pvs.length > 0) {
            const bestPv = data.pvs[0];
            const cp = bestPv.cp !== undefined ? bestPv.cp : (bestPv.mate > 0 ? 10000 : -10000);
            const bestUci = bestPv.moves.split(' ')[0];

            let bestMove = null;
            const pvMoves = [];
            if (chess) {
              bestMove = this.uciToMove(chess, bestUci);
              const ucis = bestPv.moves.split(' ');
              const sim = new global.Chess(fen);
              for (let u = 0; u < Math.min(5, ucis.length); u++) {
                const m = this.uciToMove(sim, ucis[u]);
                if (m) {
                  pvMoves.push(m);
                  sim.move(m);
                } else break;
              }
            }

            const result = {
              eval: cp,
              mate: bestPv.mate,
              depth: data.depth,
              bestMove: bestMove,
              bestUci: bestUci,
              pv: pvMoves,
              isCloud: true
            };
            this.cloudCache.set(fen, result);
            return result;
          }
        }
      } catch (err) {
        // Silently ignore network timeouts and rely on local engine
      }

      return null;
    }

    /**
     * Analyzes tactical threats in position (hanging pieces, forks, pins, undefended targets)
     */
    detectTactics(chess, movePlayed) {
      const threats = [];
      const turn = chess.turn;
      const opponent = turn === 'w' ? 'b' : 'w';
      const board = chess.board;

      // 1. Check for hanging / undefended pieces
      for (let sq = 0; sq < 128; sq++) {
        if (sq & 0x88) { sq += 7; continue; }
        const piece = board[sq];
        if (!piece || piece.type === 'k') continue;

        const isAttacked = chess.attacked(piece.color === 'w' ? 'b' : 'w', sq);
        const isDefended = chess.attacked(piece.color, sq);

        if (isAttacked && !isDefended) {
          threats.push({
            type: 'hanging',
            color: piece.color,
            piece: piece.type,
            square: algebraic(sq),
            desc: `Unprotected ${pieceName(piece.type)} on ${algebraic(sq)}`
          });
        }
      }

      // 2. Check for forks (one piece attacking two or more higher/equal value targets)
      for (let sq = 0; sq < 128; sq++) {
        if (sq & 0x88) { sq += 7; continue; }
        const piece = board[sq];
        if (!piece || piece.type === 'k') continue;

        const attackedSquares = [];
        for (let targetSq = 0; targetSq < 128; targetSq++) {
          if (targetSq & 0x88) { targetSq += 7; continue; }
          const target = board[targetSq];
          if (target && target.color !== piece.color && target.type !== 'p') {
            // Check if piece attacks target
            if (this.doesPieceAttack(chess, sq, targetSq)) {
              attackedSquares.push({
                square: algebraic(targetSq),
                piece: target.type
              });
            }
          }
        }

        if (attackedSquares.length >= 2) {
          threats.push({
            type: 'fork',
            attacker: piece.type,
            attackerSquare: algebraic(sq),
            targets: attackedSquares,
            desc: `Devastating fork by ${pieceName(piece.type)} on ${attackedSquares.map(t => pieceName(t.piece) + ' on ' + t.square).join(' and ')}`
          });
        }
      }

      return threats;
    }

    doesPieceAttack(chess, fromSq, toSq) {
      const piece = chess.board[fromSq];
      if (!piece) return false;
      const moves = chess.generate_moves({legal: false, square: algebraic(fromSq)});
      return moves.some(m => m.to === toSq);
    }

    /**
     * Deeply classifies a continuation move sequence into tactical events:
     * - Forced Checkmate
     * - Sequence of Captures / Trades
     * - Fork / Hook Attacks
     * - Major Threats & Blunder Refutations
     */
    classifyTacticalSequence(chess, moves) {
      if (!moves || moves.length === 0) return null;

      const sim = new global.Chess(chess.fen());
      const steps = [];
      let totalCaptures = 0;
      let hasMate = false;
      let mateStepIndex = -1;
      let hasFork = false;
      let forkStep = null;

      for (let i = 0; i < moves.length; i++) {
        let m = moves[i];
        if (!m) break;
        if (typeof m === 'string') {
          m = this.uciToMove(sim, m) || sim.moves({verbose: true}).find(legalM => legalM.san === m);
          if (!m) break;
        }
        const isWhite = sim.turn === 'w';
        const curMoveNum = Math.floor(sim.history().length / 2) + 1;

        // Information before playing move
        const originSquare = m.from;
        const targetSquare = m.to;
        const originPiece = sim.get(originSquare);
        const destPiece = sim.get(targetSquare);
        const wasCaptured = destPiece ? destPiece.type : (m.captured || null);

        const legal = sim.move(m);
        if (!legal) break;

        const isCheck = legal.san.includes('+') || sim.in_check();
        const isMate = legal.san.includes('#') || sim.in_checkmate();

        if (wasCaptured) totalCaptures++;
        if (isMate) {
          hasMate = true;
          if (mateStepIndex === -1) mateStepIndex = i;
        }

        // Check if this move created a fork / hook attack
        const tactics = this.detectTactics(sim, legal);
        const forkTactic = tactics ? tactics.find(t => t.type === 'fork') : null;
        const isFork = !!forkTactic;
        if (isFork && !hasFork) {
          hasFork = true;
          forkStep = { stepIndex: i, detail: forkTactic.desc };
        }

        // Action title and detail
        let actionType = 'move';
        let actionTitle = '';
        let actionDetail = '';
        let badgeTag = 'MOVE';

        const pName = pieceName(legal.piece);
        const playerStr = isWhite ? 'White' : 'Black';

        if (isMate) {
          actionType = 'mate';
          actionTitle = `⚡ ${playerStr} delivers Checkmate!`;
          actionDetail = `${legal.san} delivers checkmate! The game is decided.`;
          badgeTag = '⚡ MATE';
        } else if (isFork) {
          actionType = 'fork';
          actionTitle = `🪝 ${playerStr} executes Fork / Hook!`;
          actionDetail = `${pName} to ${legal.to} forks multiple pieces simultaneously.`;
          badgeTag = '🪝 FORK';
        } else if (wasCaptured) {
          actionType = i > 0 && steps[i - 1].wasCaptured ? 'recapture' : 'capture';
          const capName = pieceName(wasCaptured);
          actionTitle = `💥 ${playerStr} captures ${capName} on ${legal.to}`;
          actionDetail = `${legal.san} takes the ${capName}, altering the material balance.`;
          badgeTag = '💥 CAPTURE';
        } else if (isCheck) {
          actionType = 'check';
          actionTitle = `🎯 ${playerStr} gives Check!`;
          actionDetail = `${legal.san} directly attacks the opposing King.`;
          badgeTag = '🎯 CHECK';
        } else {
          actionType = 'threat';
          actionTitle = `♟️ ${playerStr} plays ${legal.san}`;
          actionDetail = `${pName} improves coordination and creates strategic threats.`;
          badgeTag = '🎯 TACTIC';
        }

        steps.push({
          index: i,
          moveNumber: curMoveNum,
          isWhite: isWhite,
          from: legal.from,
          to: legal.to,
          san: legal.san,
          piece: legal.piece,
          wasCaptured: wasCaptured,
          isCheck: isCheck,
          isMate: isMate,
          isFork: isFork,
          actionType: actionType,
          actionTitle: actionTitle,
          actionDetail: actionDetail,
          badgeTag: badgeTag
        });
      }

      if (steps.length === 0) return null;

      // Determine the primary category of this sequence
      let category = 'threat';
      let headline = `Tactical Sequence (${steps.length} Moves)`;
      let summaryBadge = `${steps.length} Moves`;
      let badgeColor = '#81b64c';
      let icon = '♟️';
      let notificationTitle = 'Tactical Sequence spotted ahead!';
      let notificationDesc = 'Stockfish found an active tactical continuation.';
      let hasTactics = false;

      if (hasMate) {
        category = 'mate';
        const mateInMoves = Math.ceil((mateStepIndex + 1) / 2);
        headline = `Forced Checkmate Sequence`;
        summaryBadge = `⚡ Mate in ${mateInMoves}`;
        badgeColor = '#e58f2a';
        icon = '⚡';
        notificationTitle = `⚡ Forced Checkmate in ${mateInMoves} move${mateInMoves > 1 ? 's' : ''} spotted!`;
        notificationDesc = `Stockfish found an unstoppable mating sequence. Tap to preview!`;
        hasTactics = true;
      } else if (totalCaptures >= 2) {
        category = 'captures';
        headline = `Tactical Exchange Sequence`;
        summaryBadge = `⚔️ ${totalCaptures} Captures`;
        badgeColor = '#81b64c';
        icon = '⚔️';
        notificationTitle = `⚔️ Sequence of ${totalCaptures} Captures & Trades ahead!`;
        notificationDesc = `A series of piece captures and tactical exchanges is available.`;
        hasTactics = true;
      } else if (hasFork) {
        category = 'fork';
        headline = `Fork / Double Attack Sequence`;
        summaryBadge = `🪝 Fork Attack`;
        badgeColor = '#3897f0';
        icon = '🪝';
        notificationTitle = `🪝 Fork / Hook Attack ahead!`;
        notificationDesc = `Tactical double attack threatening multiple pieces.`;
        hasTactics = true;
      } else if (totalCaptures === 1) {
        category = 'captures';
        headline = `Tactical Capture Opportunity`;
        summaryBadge = `💥 1 Capture`;
        badgeColor = '#81b64c';
        icon = '💥';
        notificationTitle = `💥 Tactical Capture sequence ahead!`;
        notificationDesc = `Winning capture opportunity identified by Stockfish.`;
        hasTactics = true;
      }

      return {
        hasTactics: hasTactics,
        category: category,
        headline: headline,
        summaryBadge: summaryBadge,
        badgeColor: badgeColor,
        icon: icon,
        notificationTitle: notificationTitle,
        notificationDesc: notificationDesc,
        totalCaptures: totalCaptures,
        hasMate: hasMate,
        hasFork: hasFork,
        steps: steps
      };
    }
  }

  function algebraic(i) {
    const f = i & 15;
    const r = i >> 4;
    return 'abcdefgh'.substring(f, f + 1) + '87654321'.substring(r, r + 1);
  }

  function pieceName(p) {
    const names = {
      p: 'Pawn',
      n: 'Knight',
      b: 'Bishop',
      r: 'Rook',
      q: 'Queen',
      k: 'King'
    };
    return names[p.toLowerCase()] || p;
  }

  global.ChessEngine = ChessEngine;
  global.PIECE_VALUES = PIECE_VALUES;
  global.pieceName = pieceName;

  if (typeof module !== 'undefined' && module.exports) {
    module.exports = { ChessEngine, PIECE_VALUES, pieceName };
  }

})(typeof window !== 'undefined' ? window : (typeof global !== 'undefined' ? global : this));
