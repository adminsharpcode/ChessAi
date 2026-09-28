/**
 * MoveClassifier - Chess.com Exact Move Classification & CAPS Accuracy Score System
 * Badges: Brilliant (!!), Great (!), Best, Excellent, Good, Book, Inaccuracy (?!), Mistake (?), Blunder (??), Miss
 */
(function(global) {
  'use strict';

  const BADGES = {
    BRILLIANT: {
      id: 'brilliant',
      symbol: '!!',
      name: 'Brilliant',
      color: '#26c2a3',
      bg: 'linear-gradient(135deg, #1fa388 0%, #2ed8b6 100%)',
      icon: '💎',
      desc: 'A spectacular sacrifice that maintains or increases a decisive advantage!'
    },
    GREAT: {
      id: 'great',
      symbol: '!',
      name: 'Great Move',
      color: '#5c8bb0',
      bg: 'linear-gradient(135deg, #446d8d 0%, #689ec8 100%)',
      icon: '🔷',
      desc: 'The only winning move found in a difficult, razor-sharp position.'
    },
    BEST: {
      id: 'best',
      symbol: '★',
      name: 'Best Move',
      color: '#81b64c',
      bg: 'linear-gradient(135deg, #629924 0%, #81b64c 100%)',
      icon: '⭐',
      desc: 'The top engine recommendation.'
    },
    EXCELLENT: {
      id: 'excellent',
      symbol: '✓',
      name: 'Excellent',
      color: '#95c65c',
      bg: 'linear-gradient(135deg, #7ba845 0%, #a2d665 100%)',
      icon: '🟢',
      desc: 'Nearly as strong as the best move, keeping full control.'
    },
    GOOD: {
      id: 'good',
      symbol: '✓',
      name: 'Good',
      color: '#a3a19d',
      bg: 'linear-gradient(135deg, #74726e 0%, #95938f 100%)',
      icon: '🔵',
      desc: 'A solid, playable move.'
    },
    BOOK: {
      id: 'book',
      symbol: '📖',
      name: 'Book Move',
      color: '#c29b61',
      bg: 'linear-gradient(135deg, #99743a 0%, #c49957 100%)',
      icon: '📖',
      desc: 'Standard opening theory.'
    },
    INACCURACY: {
      id: 'inaccuracy',
      symbol: '?!',
      name: 'Inaccuracy',
      color: '#f5b700',
      bg: 'linear-gradient(135deg, #cca010 0%, #f7c93e 100%)',
      icon: '🟡',
      desc: 'A slight slip that gives away part of your advantage.'
    },
    MISTAKE: {
      id: 'mistake',
      symbol: '?',
      name: 'Mistake',
      color: '#e58f2a',
      bg: 'linear-gradient(135deg, #cf7711 0%, #f09f41 100%)',
      icon: '🟠',
      desc: 'A significant error that hurts your position.'
    },
    BLUNDER: {
      id: 'blunder',
      symbol: '??',
      name: 'Blunder',
      color: '#fa412d',
      bg: 'linear-gradient(135deg, #c72513 0%, #fa4c39 100%)',
      icon: '🔴',
      desc: 'A terrible tactical error that swings the game.'
    },
    MISS: {
      id: 'miss',
      symbol: '✗',
      name: 'Miss',
      color: '#ea3567',
      bg: 'linear-gradient(135deg, #b91c49 0%, #f44d7d 100%)',
      icon: '❌',
      desc: 'Overlooked a winning tactical strike or checkmate.'
    }
  };

  class MoveClassifier {
    /**
     * Converts raw centipawn evaluation into winning percentage probability (0..100)
     */
    static winPercentage(cp) {
      if (cp === null || cp === undefined) return 50;
      // Formula matching Chess.com / Lichess win probability sigmoid:
      // winChance = 50 + 50 * (2 / (1 + exp(-0.00368208 * cp)) - 1)
      return 100 / (1 + Math.exp(-0.00368208 * cp));
    }

    /**
     * Calculates move accuracy using Chess.com's CAPS2 exponential decay formula
     */
    static calculateMoveAccuracy(winBefore, winAfter) {
      const drop = Math.max(0, winBefore - winAfter);
      if (drop <= 0.1) return 100;
      // CAPS formula based on win percentage loss
      const accuracy = 103.1668 * Math.exp(-0.04354 * (drop * 2.5)) - 3.1669;
      return Math.max(0, Math.min(100, Math.round(accuracy * 10) / 10));
    }

    /**
     * Classifies a played move based on engine evaluation shift and tactical context
     * @param {object} params
     *   - playedMove: verbose move object
     *   - bestMove: verbose engine recommended move
     *   - evalBefore: cp eval before move (from player's perspective)
     *   - evalAfter: cp eval after move (from player's perspective)
     *   - moveHistorySAN: array of SAN moves up to this point
     *   - isSacrifice: boolean whether move gave up higher material without immediate recapture
     */
    static classify(params) {
      const { playedMove, bestMove, evalBefore, evalAfter, moveHistorySAN, isSacrifice } = params;

      // 1. Check if Book Move (📖)
      if (global.OpeningExplorer && global.OpeningExplorer.isBookMove(moveHistorySAN)) {
        return BADGES.BOOK;
      }

      const playedSAN = playedMove.san;
      const bestSAN = bestMove ? bestMove.san : null;

      const winBefore = this.winPercentage(evalBefore);
      const winAfter = this.winPercentage(evalAfter);
      const cpLoss = Math.max(0, evalBefore - evalAfter);
      const winLoss = Math.max(0, winBefore - winAfter);

      // Check if move matches engine top choice
      const isTopEngine = bestSAN && (playedSAN === bestSAN || (playedMove.from === bestMove.from && playedMove.to === bestMove.to));

      // 2. Check for Brilliant (!!)
      // Sacrifice of piece that is best or near-best move and remains winning/decisive
      if (isSacrifice && (isTopEngine || cpLoss < 25) && evalAfter > 150) {
        return BADGES.BRILLIANT;
      }

      // High-advantage preservation: If player remains overwhelmingly winning (win chance >= 98% or eval >= 600) with minimal win loss
      if ((winAfter >= 98 || evalAfter >= 600) && winLoss < 2.5) {
        if (isTopEngine || cpLoss < 25) return BADGES.BEST;
        if (cpLoss < 100) return BADGES.EXCELLENT;
        return BADGES.GOOD;
      }

      // 3. Check for Miss (❌)
      // Was a winning opportunity (+250 or mate) but player overlooked it and dropped below +100
      if (evalBefore >= 250 && evalAfter < 120 && cpLoss >= 180) {
        return BADGES.MISS;
      }

      // 4. Check for Blunder (??)
      // Large loss of material or evaluation (>= 250 cp loss or win probability drop > 25%)
      if (cpLoss >= 250 || winLoss >= 25) {
        return BADGES.BLUNDER;
      }

      // 5. Check for Mistake (?)
      // Medium loss (120 to 250 cp loss or win probability drop 12-25%)
      if (cpLoss >= 120 || winLoss >= 12) {
        return BADGES.MISTAKE;
      }

      // 6. Check for Inaccuracy (?!)
      // Slight slip (50 to 120 cp loss or win probability drop 5-12%)
      if (cpLoss >= 50 || winLoss >= 5) {
        return BADGES.INACCURACY;
      }

      // 7. Check for Great Move (!)
      // Position was precarious / difficult (near 0 or slightly worse) and player found the only winning move
      if (isTopEngine && evalBefore < 100 && evalAfter > 80 && winLoss < 1) {
        return BADGES.GREAT;
      }

      // 8. Best Move (★)
      if (isTopEngine || cpLoss < 15) {
        return BADGES.BEST;
      }

      // 9. Excellent (✓)
      if (cpLoss < 30) {
        return BADGES.EXCELLENT;
      }

      // 10. Good
      return BADGES.GOOD;
    }

    /**
     * Estimates player Elo rating based on CAPS accuracy and Centipawn Loss (ACPL)
     */
    static estimateElo(accuracy, acpl) {
      if (accuracy >= 97) return Math.round(2500 + (accuracy - 97) * 150);
      if (accuracy >= 90) return Math.round(2000 + (accuracy - 90) * 60);
      if (accuracy >= 80) return Math.round(1500 + (accuracy - 80) * 45);
      if (accuracy >= 70) return Math.round(1100 + (accuracy - 70) * 35);
      if (accuracy >= 55) return Math.round(750 + (accuracy - 55) * 22);
      return Math.max(400, Math.round(500 + (accuracy - 40) * 15));
    }
  }

  global.BADGES = BADGES;
  global.MoveClassifier = MoveClassifier;

})(typeof window !== 'undefined' ? window : this);
