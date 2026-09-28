/**
 * ChessCoach - The Conversational AI Chess Coach
 * Authentic Chess.com Game Review Explanations & Free AI API Integration
 */
(function(global) {
  'use strict';

  class ChessCoach {
    constructor() {
      this.synth = typeof window !== 'undefined' ? window.speechSynthesis : null;
      this.voice = null;
      this.voiceEnabled = false;
      this.customApiKey = (typeof localStorage !== 'undefined' && localStorage && localStorage.getItem) ? (localStorage.getItem('chess_gemini_api_key') || '') : '';
      this.initVoice();
    }

    initVoice() {
      if (!this.synth) return;
      const loadVoices = () => {
        const voices = this.synth.getVoices();
        this.voice = voices.find(v => v.lang.startsWith('en') && (v.name.includes('Google') || v.name.includes('Natural') || v.name.includes('Daniel') || v.name.includes('David'))) ||
                     voices.find(v => v.lang.startsWith('en')) || null;
      };
      loadVoices();
      if (this.synth.onvoiceschanged !== undefined) {
        this.synth.onvoiceschanged = loadVoices;
      }
    }

    speak(text) {
      if (!this.synth || !this.voiceEnabled || !text) return;
      this.synth.cancel();
      const cleanText = text.replace(/[*#_`]/g, '');
      const utterance = new SpeechSynthesisUtterance(cleanText);
      if (this.voice) utterance.voice = this.voice;
      utterance.rate = 1.05;
      utterance.pitch = 1.0;
      this.synth.speak(utterance);
    }

    stopSpeaking() {
      if (this.synth) this.synth.cancel();
    }

    /**
     * Converts SAN move to include chess piece glyph (e.g. Qxd3 -> ♛xd3)
     */
    static formatGlyph(san, isBlack) {
      if (!san) return '';
      const p = san[0];
      const glyphs = {
        K: isBlack ? '♚' : '♔',
        Q: isBlack ? '♛' : '♕',
        R: isBlack ? '♜' : '♖',
        B: isBlack ? '♝' : '♗',
        N: isBlack ? '♞' : '♘'
      };
      if (glyphs[p]) {
        return glyphs[p] + san.substring(1);
      }
      return san;
    }

    /**
     * Formats an array of continuation moves into Chess.com notation string
     * e.g. "12... ♛xd3 13. cxd3" or "8. f4 exf4 9. ♗xf4"
     */
    static formatContinuation(startPly, moves) {
      if (!moves || moves.length === 0) return '';
      const parts = [];
      let currentPly = startPly;

      for (let i = 0; i < moves.length; i++) {
        const move = moves[i];
        const moveNum = Math.floor(currentPly / 2) + 1;
        const isBlack = (currentPly % 2 === 1);
        const glyph = ChessCoach.formatGlyph(move.san, isBlack);

        if (i === 0) {
          if (isBlack) {
            parts.push(`${moveNum}... ${glyph}`);
          } else {
            parts.push(`${moveNum}. ${glyph}`);
          }
        } else {
          if (!isBlack) {
            parts.push(`${moveNum}. ${glyph}`);
          } else {
            parts.push(glyph);
          }
        }
        currentPly++;
      }

      return parts.join(' ');
    }

    /**
     * Generates exact Chess.com style coaching explanation
     */
    explainMove(context) {
      const {
        badge,
        playedMove,
        bestMove,
        moveNumber,
        isWhite,
        opening,
        tactics,
        cpLoss,
        evalScore,
        continuationMoves
      } = context;

      const san = playedMove.san;
      const glyphMove = ChessCoach.formatGlyph(san, !isWhite);
      const isBlack = !isWhite;
      const opp = isWhite ? 'Black' : 'White';
      const piece = global.pieceName ? global.pieceName(playedMove.piece).toLowerCase() : playedMove.piece;

      let shortDescription = '';
      let badgeLabel = `${glyphMove} is a ${badge.name.toLowerCase()}`;

      // 1. BOOK MOVES
      if (badge.id === 'book') {
        badgeLabel = `${glyphMove} is a book move`;
        if (opening && opening.plan) {
          shortDescription = opening.plan;
        } else if (playedMove.piece === 'p') {
          shortDescription = isWhite ? 
            "You strike at the center! Gaining control of the board and space." :
            "Your opponent is quietly setting up shop, ready to push into the center!";
        } else if (playedMove.piece === 'n') {
          shortDescription = "This develops and helps to control the central dark squares.";
        } else if (playedMove.piece === 'b') {
          shortDescription = "This active bishop development stakes a claim along the diagonal.";
        } else {
          shortDescription = "Standard opening development theory, establishing piece coordination.";
        }
      }

      // 2. BRILLIANT (!!)
      else if (badge.id === 'brilliant') {
        badgeLabel = `${glyphMove} is brilliant!!`;
        shortDescription = `A spectacular sacrifice! You gave up material with decisive tactical vision.`;
      }

      // 3. GREAT MOVE (!)
      else if (badge.id === 'great') {
        badgeLabel = `${glyphMove} is a great move`;
        shortDescription = `The only move to maintain your edge in a razor-sharp tactical position!`;
      }

      // 4. BEST MOVE (★)
      else if (badge.id === 'best') {
        badgeLabel = `${glyphMove} is the best move`;
        if (playedMove.flags && (playedMove.flags.includes('k') || playedMove.flags.includes('q'))) {
          shortDescription = "You castle and tuck your King into safety while connecting the rooks.";
        } else if (playedMove.captured) {
          shortDescription = `Winning free material and eliminating ${opp}'s active piece.`;
        } else if (playedMove.piece === 'p') {
          shortDescription = "Solid pawn push tightening your grip over key transit squares.";
        } else {
          shortDescription = `This develops your ${piece} and improves your overall coordination.`;
        }
      }

      // 5. EXCELLENT / GOOD
      else if (badge.id === 'excellent' || badge.id === 'good') {
        badgeLabel = `${glyphMove} is ${badge.name.toLowerCase()}`;
        if (bestMove && bestMove.san !== san) {
          const bestGlyph = ChessCoach.formatGlyph(bestMove.san, isBlack);
          shortDescription = `A solid move, though ${bestGlyph} was slightly more incisive.`;
        } else {
          shortDescription = "A calm, solid move keeping the position well-balanced.";
        }
      }

      // 6. MISS (❌)
      else if (badge.id === 'miss') {
        badgeLabel = `${glyphMove} is a miss`;
        if (bestMove) {
          const bestPiece = global.pieceName ? global.pieceName(bestMove.piece).toLowerCase() : 'piece';
          if (bestMove.captured) {
            shortDescription = `Your best move was to win free material with ${ChessCoach.formatGlyph(bestMove.san, isBlack)}.`;
          } else if (bestMove.piece === 'p') {
            shortDescription = `Your best move was to attack the knight with a pawn (${ChessCoach.formatGlyph(bestMove.san, isBlack)}).`;
          } else {
            shortDescription = `Your best move was ${ChessCoach.formatGlyph(bestMove.san, isBlack)}, seizing a winning advantage.`;
          }
        } else {
          shortDescription = "You missed a decisive tactical strike!";
        }
      }

      // 7. MISTAKE (?)
      else if (badge.id === 'mistake') {
        badgeLabel = `${glyphMove} is a mistake`;
        if (evalScore > -0.5 && evalScore < 0.5) {
          shortDescription = "You let your advantage slip. The game is now close to equal.";
        } else {
          shortDescription = "An inaccurate move that hands the momentum over to your opponent.";
        }
      }

      // 8. BLUNDER (??)
      else if (badge.id === 'blunder') {
        badgeLabel = `${glyphMove} is a blunder`;
        if (tactics && tactics.length > 0) {
          const hanging = tactics.filter(t => t.type === 'hanging' && t.color === (isWhite ? 'w' : 'b'));
          if (hanging.length > 0) {
            shortDescription = `This hangs the ${global.pieceName(hanging[0].piece).toLowerCase()} on ${hanging[0].square}!`;
          } else {
            shortDescription = "A major blunder that severely damages your position.";
          }
        } else {
          shortDescription = "A critical blunder that swings the evaluation drastically.";
        }
      }

      // 9. INACCURACY (?!)
      else {
        badgeLabel = `${glyphMove} is an inaccuracy`;
        shortDescription = "A slight slip that gives away part of your advantage.";
      }

      // Format continuation line
      const nextPly = (moveNumber - 1) * 2 + (isWhite ? 1 : 2);
      const continuationFormatted = continuationMoves && continuationMoves.length > 0 ?
        ChessCoach.formatContinuation(nextPly, continuationMoves) : '';

      return {
        badgeLabel: badgeLabel,
        shortDescription: shortDescription,
        continuationFormatted: continuationFormatted,
        continuationMoves: continuationMoves || [],
        bestMoveSan: bestMove ? bestMove.san : null,
        bestMoveGlyph: bestMove ? ChessCoach.formatGlyph(bestMove.san, isBlack) : null
      };
    }

    /**
     * Optional Free AI API call to generate dynamic natural coach commentary
     */
    async fetchAIEnhancedText(context) {
      try {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 2500);

        const prompt = `You are a Chess.com Game Review AI Coach. In 1 concise, educational sentence (under 14 words), explain this move:
Player: ${context.isWhite ? 'White' : 'Black'}, Move: ${context.playedMove.san}, Classification: ${context.badge.name}, Best was: ${context.bestMove ? context.bestMove.san : 'N/A'}. Style: friendly, instructive, Chess.com tone. No quotes.`;

        const url = `https://text.pollinations.ai/${encodeURIComponent(prompt)}?model=openai`;
        const res = await fetch(url, { signal: controller.signal });
        clearTimeout(timeoutId);

        if (res.ok) {
          const text = await res.text();
          if (text && text.trim().length > 5 && text.trim().length < 140) {
            return text.trim().replace(/^["']|["']$/g, '');
          }
        }
      } catch (e) {
        // Fall back seamlessly to pre-built explanations
      }
      return null;
    }

    /**
     * Answers interactive questions about the current position
     */
    answerQuestion(question, chess, analysis) {
      const q = question.toLowerCase().trim();
      const bestMove = analysis && analysis.bestMove ? analysis.bestMove.san : null;
      const evalScore = analysis ? (analysis.eval / 100).toFixed(2) : '0.00';
      const evalText = parseFloat(evalScore) > 0 ? `+${evalScore}` : evalScore;

      if (q.includes('best move') || q.includes('what to play') || q.includes('hint')) {
        return `The engine's top choice here is **${bestMove}** (${evalText}). It maximizes piece activity and controls critical central squares.`;
      }
      if (q.includes('why') && (q.includes('bad') || q.includes('blunder') || q.includes('mistake') || q.includes('miss'))) {
        return `In this position, mistakes often give away an undefended piece or allow the opponent to seize a strong tactical initiative. Always check what squares are under threat!`;
      }
      if (q.includes('king') && q.includes('safe')) {
        if (chess.in_check()) {
          return `⚠️ Your King is currently in check! You must respond immediately.`;
        }
        return `Keep your pawn shelter intact in front of your King and watch out for open files leading to your back rank.`;
      }
      if (q.includes('who is winning') || q.includes('eval')) {
        return `The computer evaluation is **${evalText}**. Stay focused on tactical discipline and piece coordination!`;
      }

      return `Looking at this board: The evaluation is **${evalText}**. The best continuation recommended by the engine is **${bestMove || 'to develop your pieces'}**.`;
    }
  }

  global.ChessCoach = ChessCoach;

})(typeof window !== 'undefined' ? window : this);
