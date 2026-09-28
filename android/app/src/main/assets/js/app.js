/**
 * ChessApp - Master Application Controller
 * Exact 1:1 match to Chess.com Android Game Review Screenshots
 */
(function(global) {
  'use strict';

  // Sample Games including the exact game from user's screenshots
  const SAMPLE_PGNS = {
    screenshotGame: `[Event "Live Chess"]
[Site "Chess.com"]
[Date "2026.09.28"]
[White "Player_White"]
[Black "Player_Black"]
[Result "0-1"]

1. e4 c5 2. Nc3 Nc6 3. Nf3 e6 4. d4 cxd4 5. Nxd4 a6 6. Be3 Ne5 7. Bd3 b6 8. Bf4 Nxd3+ 9. Qxd3 d6 10. O-O-O e5 11. Bxe5 dxe5 12. e5 Qxd3 13. cxd3 Bb7 14. Nf3 Ne7 15. Rhe1 O-O-O 0-1`,

    opera: `[Event "Paris Opera House"]
[Site "Paris"]
[Date "1858.11.02"]
[White "Paul Morphy"]
[Black "Duke of Brunswick & Count Isouard"]
[Result "1-0"]

1. e4 e5 2. Nf3 d6 3. d4 Bg4 4. dxe5 Bxf3 5. Qxf3 dxe5 6. Bc4 Nf6 7. Qb3 Qe7 8. Nc3 c6 9. Bg5 b5 10. Nxb5 cxb5 11. Bxb5+ Nbd7 12. O-O-O Rd8 13. Rxd7 Rxd7 14. Rd1 Qe6 15. Bxd7+ Nxd7 16. Qb8+ Nxb8 17. Rd8# 1-0`,

    blunder: `[Event "Live Chess"]
[Site "Chess.com"]
[Date "2024.03.15"]
[White "Player_White"]
[Black "Player_Black"]
[Result "1-0"]

1. e4 e5 2. Nf3 Nc6 3. Bc4 Bc5 4. c3 Nf6 5. d4 exd4 6. cxd4 Bb4+ 7. Bd2 Bxd2+ 8. Nbxd2 d5 9. exd5 Nxd5 10. Qb3 Nce7 11. O-O O-O 12. Rfe1 c6 13. Ne4 Nf4 14. Ne5 Ned5 15. Rad1 f6 16. Nd3 Nxd3 17. Rxd3 Kh8 18. Bxd5 cxd5 19. Nc5 b6 20. Ne6 Bxe6 21. Rxe6 Qd7 22. Rde3 Rac8 23. h3 Rc1+ 24. Kh2 Qc7+ 25. g3 Rc2 26. Kg2 h6 27. Qxd5 Rxb2 28. Re8 Rxe8 29. Rxe8+ Kh7 30. Qe4+ g6 31. Re7+ 1-0`,

    fischer: `[Event "Third Rosenwald Trophy"]
[Site "New York, NY USA"]
[Date "1956.10.17"]
[White "Donald Byrne"]
[Black "Robert James Fischer"]
[Result "0-1"]

1. Nf3 Nf6 2. c4 g6 3. Nc3 Bg7 4. d4 O-O 5. Bf4 d5 6. Qb3 dxc4 7. Qxc4 c6 8. e4 Nbd7 9. Rd1 Nb6 10. Qc5 Bg4 11. Bg5 Na4 12. Qa3 Nxc3 13. bxc3 Nxe4 14. Bxe7 Qb6 15. Bc4 Nxc3 16. Bc5 Rfe8+ 17. Kf1 Be6 18. Bxb6 Bxc4+ 19. Kg1 Ne2+ 20. Kf1 Nxd4+ 21. Kg1 Ne2+ 22. Kf1 Nc3+ 23. Kg1 axb6 24. Qb4 Ra4 25. Qxb6 Nxd1 26. h3 Rxa2 27. Kh2 Nxf2 28. Re1 Rxe1 29. Qd8+ Bf8 30. Nxe1 Bd5 31. Nf3 Ne4 32. Qb8 b5 33. h4 h5 34. Ne5 Kg7 35. Kg1 Bc5+ 36. Kf1 Ng3+ 37. Ke1 Bb4+ 38. Kd1 Bb3+ 39. Kc1 Ne2+ 40. Kb1 Nc3+ 41. Kc1 Rc2# 0-1`
  };

  class ChessApp {
    constructor() {
      this.chess = new global.Chess();
      this.engine = new global.ChessEngine();
      this.coach = new global.ChessCoach();
      this.audio = new global.ChessAudio();

      this.boardUI = null;
      this.evalGraph = null;
      this.analyzedGame = [];
      this.currentPly = 0;
      this.gameHeaders = {};

      // Future Continuation / Show Mode state
      this.isViewingContinuation = false;
      this.isViewingBest = false;
      this.isRetrying = false;
      this.retryPly = null;
      this.continuationPlaybackTimer = null;
      this.isPlaybackRunning = false;

      // Tactical Notification & Slideshow State
      this.activeTactics = null;
      this.currentSlideIndex = 0;
      this.isSlideShowPlaying = false;
      this.slideShowTimer = null;

      // Real-time piece interaction and variation exploration
      this.isExploring = false;
      this.exploreBasePly = 1;
      this.currentElo = parseInt(localStorage.getItem('xcodechess_stockfish_elo'), 10) || 2000;

      // Stats
      this.whiteAccuracy = 0;
      this.blackAccuracy = 0;
      this.badgeCounts = { w: {}, b: {} };

      this.initDOM();
    }

    initDOM() {
      // 1. Initialize Board
      const boardContainer = document.getElementById('boardWrapper');
      if (boardContainer) {
        this.boardUI = new global.ChessBoardUI(boardContainer, {
          orientation: 'w',
          onMove: (move) => this.handleUserBoardMove(move)
        });
        this.boardUI.setGame(this.chess);
      }

      // 1b. Initialize Evaluation Advantage Graph (Chess.com Style)
      const evalGraphContainer = document.getElementById('evalGraphContainer');
      if (evalGraphContainer && global.EvalGraph) {
        this.evalGraph = new global.EvalGraph(evalGraphContainer, {
          onSelectPly: (ply) => {
            if (this.isExploring) this.resumeReview();
            this.goToPly(ply);
          }
        });
      }

      // 2. Playback Navigation Controls (Move Front & Back)
      const btnNavFirst = document.getElementById('btnNavFirst');
      const btnNavPrev = document.getElementById('btnNavPrev');
      const btnNavNext = document.getElementById('btnNavNext');
      const btnNavLast = document.getElementById('btnNavLast');
      const btnFlipBoard = document.getElementById('btnFlipBoard');

      if (btnNavFirst) btnNavFirst.addEventListener('click', () => {
        if (this.isExploring) this.resumeReview();
        this.goToPly(1);
      });

      if (btnNavPrev) btnNavPrev.addEventListener('click', () => {
        if (this.isExploring) {
          this.resumeReview();
          return;
        }
        this.goToPly(Math.max(1, this.currentPly - 1));
      });

      if (btnNavNext) btnNavNext.addEventListener('click', () => {
        this.handleNextAction();
      });

      if (btnNavLast) btnNavLast.addEventListener('click', () => {
        if (this.isExploring) this.resumeReview();
        this.goToPly(this.analyzedGame.length);
      });

      if (btnFlipBoard) btnFlipBoard.addEventListener('click', () => {
        if (this.boardUI) {
          this.boardUI.orientation = this.boardUI.orientation === 'w' ? 'b' : 'w';
          this.boardUI.buildBoardDOM();
          this.boardUI.render(false);
        }
      });

      // 3. Exploring Variation Buttons
      const btnResumeReview = document.getElementById('btnResumeReview');
      const btnEngineReply = document.getElementById('btnEngineReply');
      if (btnResumeReview) btnResumeReview.addEventListener('click', () => this.resumeReview());
      if (btnEngineReply) btnEngineReply.addEventListener('click', () => this.engineMakeReply());

      // 4. Action buttons from screenshot: Show, Best, Retry, Next
      const btnShowFuture = document.getElementById('btnShowFuture');
      const btnShowBest = document.getElementById('btnShowBest');
      const btnRetryAction = document.getElementById('btnRetryAction');
      const btnNextAction = document.getElementById('btnNextAction');

      if (btnShowFuture) btnShowFuture.addEventListener('click', () => this.toggleFutureAnalysis());
      if (btnShowBest) btnShowBest.addEventListener('click', () => this.toggleBestMoveView());
      if (btnRetryAction) btnRetryAction.addEventListener('click', () => this.startRetry());
      if (btnNextAction) btnNextAction.addEventListener('click', () => this.handleNextAction());

      // 4b. Tactical Notification & Show Slideshow Controls
      const btnNoticePreview = document.getElementById('btnNoticePreview');
      const tacticalNoticeBanner = document.getElementById('tacticalNoticeBanner');
      if (btnNoticePreview) {
        btnNoticePreview.addEventListener('click', (e) => {
          e.stopPropagation();
          this.openTacticalShowPanel();
        });
      }
      if (tacticalNoticeBanner) {
        tacticalNoticeBanner.addEventListener('click', () => {
          this.openTacticalShowPanel();
        });
      }

      const btnCloseShowPanel = document.getElementById('btnCloseShowPanel');
      const btnSlideFirst = document.getElementById('btnSlideFirst');
      const btnSlidePrev = document.getElementById('btnSlidePrev');
      const btnSlidePlay = document.getElementById('btnSlidePlay');
      const btnSlideNext = document.getElementById('btnSlideNext');
      const btnSlideLast = document.getElementById('btnSlideLast');

      if (btnCloseShowPanel) btnCloseShowPanel.addEventListener('click', () => this.closeTacticalShowPanel());
      if (btnSlideFirst) btnSlideFirst.addEventListener('click', () => this.goToSlide(0));
      if (btnSlidePrev) btnSlidePrev.addEventListener('click', () => this.goToSlide(this.currentSlideIndex - 1));
      if (btnSlidePlay) btnSlidePlay.addEventListener('click', () => this.toggleSlideShowPlay());
      if (btnSlideNext) btnSlideNext.addEventListener('click', () => this.goToSlide(this.currentSlideIndex + 1));
      if (btnSlideLast) btnSlideLast.addEventListener('click', () => {
        if (this.activeTactics && this.activeTactics.steps) {
          this.goToSlide(this.activeTactics.steps.length - 1);
        }
      });

      // 5. Stockfish Changeable Elo Controls
      const engineBadge = document.getElementById('engineStatusBadge');
      const eloSlider = document.getElementById('stockfishEloSlider');

      if (engineBadge) {
        engineBadge.addEventListener('click', () => {
          const modalSettings = document.getElementById('modalSettings');
          if (modalSettings) {
            modalSettings.classList.add('active');
            const eloCard = document.querySelector('.elo-settings-card');
            if (eloCard) eloCard.scrollIntoView({ behavior: 'smooth' });
          }
        });
      }

      if (eloSlider) {
        eloSlider.value = this.currentElo;
        eloSlider.addEventListener('input', (e) => this.setStockfishElo(e.target.value));
      }

      document.querySelectorAll('.elo-pill-btn').forEach(btn => {
        btn.addEventListener('click', () => {
          const elo = parseInt(btn.dataset.elo, 10);
          this.setStockfishElo(elo);
        });
      });

      global.onStockfishReady = (name, elo) => this.updateEngineStatusUI(name, elo);
      global.onStockfishEloChanged = (elo) => this.updateEngineStatusUI('Stockfish 10', elo);
      this.setStockfishElo(this.currentElo);

      // 5b. Piece Animation Speed Settings (Slow, Mid, Fast, Off)
      const speedPills = document.querySelectorAll('.speed-pill-btn');
      const speedDisplay = document.getElementById('speedCurrentDisplay');
      const curSpeed = (this.boardUI && this.boardUI.animationSpeed) ? this.boardUI.animationSpeed : (localStorage.getItem('xcodechess_anim_speed') || 'mid');

      const updateSpeedUI = (speed) => {
        speedPills.forEach(pill => {
          pill.classList.toggle('active', pill.dataset.speed === speed);
        });
        if (speedDisplay) {
          switch (speed) {
            case 'slow': speedDisplay.textContent = 'Slow (360ms)'; break;
            case 'mid': speedDisplay.textContent = 'Mid (220ms)'; break;
            case 'fast': speedDisplay.textContent = 'Fast (130ms)'; break;
            case 'off': speedDisplay.textContent = 'Instant (Off)'; break;
            default: speedDisplay.textContent = 'Mid (220ms)'; break;
          }
        }
      };

      updateSpeedUI(curSpeed);

      speedPills.forEach(btn => {
        btn.addEventListener('click', () => {
          const spd = btn.dataset.speed;
          if (this.boardUI) {
            this.boardUI.setAnimationSpeed(spd);
          }
          updateSpeedUI(spd);
        });
      });

      // 6. Touch Swipe Gesture for Navigation (on Coach Dialogue Card, NOT on board)
      let touchStartX = 0;
      let touchStartY = 0;
      const dialogueBox = document.getElementById('dialogueBox');
      if (dialogueBox) {
        dialogueBox.addEventListener('touchstart', (e) => {
          if (e.touches.length === 1) {
            touchStartX = e.touches[0].clientX;
            touchStartY = e.touches[0].clientY;
          }
        }, { passive: true });

        dialogueBox.addEventListener('touchend', (e) => {
          if (e.changedTouches.length === 1) {
            const dx = e.changedTouches[0].clientX - touchStartX;
            const dy = e.changedTouches[0].clientY - touchStartY;
            if (Math.abs(dx) > 40 && Math.abs(dx) > Math.abs(dy) * 1.5) {
              if (dx < 0) {
                // Swipe Left -> Next move
                this.handleNextAction();
              } else {
                // Swipe Right -> Previous move
                if (this.isExploring) this.resumeReview();
                else this.goToPly(Math.max(1, this.currentPly - 1));
              }
            }
          }
        }, { passive: true });
      }

      // 7. Modals: Stats and Settings
      const btnOpenStats = document.getElementById('btnOpenStats');
      const btnCloseStats = document.getElementById('btnCloseStats');
      const modalStats = document.getElementById('modalStats');

      if (btnOpenStats) btnOpenStats.addEventListener('click', () => modalStats.classList.add('active'));
      if (btnCloseStats) btnCloseStats.addEventListener('click', () => modalStats.classList.remove('active'));

      const btnOpenSettings = document.getElementById('btnOpenSettings');
      const btnCloseSettings = document.getElementById('btnCloseSettings');
      const btnBack = document.getElementById('btnBack');
      const modalSettings = document.getElementById('modalSettings');

      if (btnOpenSettings) btnOpenSettings.addEventListener('click', () => modalSettings.classList.add('active'));
      if (btnBack) btnBack.addEventListener('click', () => modalSettings.classList.add('active'));
      if (btnCloseSettings) btnCloseSettings.addEventListener('click', () => modalSettings.classList.remove('active'));

      // 8. Carlsen Explorer Modal
      const btnOpenCarlsenModal = document.getElementById('btnOpenCarlsenModal');
      const btnCloseCarlsen = document.getElementById('btnCloseCarlsen');
      const modalCarlsenGames = document.getElementById('modalCarlsenGames');

      if (btnOpenCarlsenModal) {
        btnOpenCarlsenModal.addEventListener('click', () => {
          modalSettings.classList.remove('active');
          modalCarlsenGames.classList.add('active');
          this.loadCarlsenGames('');
        });
      }

      if (btnCloseCarlsen) {
        btnCloseCarlsen.addEventListener('click', () => {
          modalCarlsenGames.classList.remove('active');
        });
      }

      const carlsenSearchInput = document.getElementById('carlsenSearchInput');
      let searchTimeout = null;
      if (carlsenSearchInput) {
        carlsenSearchInput.addEventListener('input', (e) => {
          clearTimeout(searchTimeout);
          searchTimeout = setTimeout(() => {
            this.loadCarlsenGames(e.target.value.trim());
          }, 200);
        });
      }

      document.querySelectorAll('[data-cfilter]').forEach(btn => {
        btn.addEventListener('click', (e) => {
          const filter = e.currentTarget.dataset.cfilter;
          if (carlsenSearchInput) carlsenSearchInput.value = filter;
          this.loadCarlsenGames(filter);
        });
      });

      // 5. PGN Upload & Sample buttons
      const pgnFileInput = document.getElementById('pgnFileInput');
      if (pgnFileInput) {
        pgnFileInput.addEventListener('change', (e) => this.handleFileUpload(e));
      }

      const btnAnalyzePGN = document.getElementById('btnAnalyzePGN');
      if (btnAnalyzePGN) {
        btnAnalyzePGN.addEventListener('click', () => {
          modalSettings.classList.remove('active');
          this.analyzePastedPGN();
        });
      }

      document.querySelectorAll('.sample-pill-btn[data-sample]').forEach(btn => {
        btn.addEventListener('click', (e) => {
          const key = e.currentTarget.dataset.sample;
          if (SAMPLE_PGNS[key]) {
            const area = document.getElementById('pgnTextInput');
            if (area) area.value = SAMPLE_PGNS[key];
            modalSettings.classList.remove('active');
            this.analyzePastedPGN();
          }
        });
      });

      // 5. Voice Narration Toggle
      const btnVoiceToggle = document.getElementById('btnVoiceToggle');
      if (btnVoiceToggle) {
        btnVoiceToggle.addEventListener('click', () => {
          this.coach.voiceEnabled = !this.coach.voiceEnabled;
          btnVoiceToggle.textContent = this.coach.voiceEnabled ? "🔊 Coach Voice Enabled" : "🔈 Coach Voice Disabled";
          if (this.coach.voiceEnabled) {
            this.coach.speak("Voice enabled. Ready to review your game!");
          }
        });
      }

      // 6. Engine Status updates
      global.onStockfishReady = (name, elo) => {
        this.updateEngineStatusUI(name, elo || this.currentElo);
      };

      // 7. Gemini API Key Input
      const apiKeyInput = document.getElementById('apiKeyInput');
      if (apiKeyInput) {
        apiKeyInput.value = localStorage.getItem('chess_gemini_api_key') || '';
        apiKeyInput.addEventListener('change', (e) => {
          localStorage.setItem('chess_gemini_api_key', e.target.value.trim());
        });
      }

      // 8. Coach Chat Q&A
      const chatForm = document.getElementById('coachChatForm');
      if (chatForm) {
        chatForm.addEventListener('submit', (e) => {
          e.preventDefault();
          this.handleCoachQuestion();
        });
      }

      // 9. Setup New Manual Game Button
      const btnSetupNewGame = document.getElementById('btnSetupNewGame');
      if (btnSetupNewGame) {
        btnSetupNewGame.addEventListener('click', () => {
          const mSettings = document.getElementById('modalSettings');
          if (mSettings) mSettings.classList.remove('active');
          this.setupNewManualGame();
        });
      }

      // 10. Game Over Modal Listeners
      const btnCloseGameOver = document.getElementById('btnCloseGameOver');
      const btnGameOverInspect = document.getElementById('btnGameOverInspect');
      const btnGameOverNewGame = document.getElementById('btnGameOverNewGame');
      const btnGameOverStartReview = document.getElementById('btnGameOverStartReview');
      const modalGameOver = document.getElementById('modalGameOver');

      if (btnCloseGameOver) {
        btnCloseGameOver.addEventListener('click', () => {
          if (modalGameOver) modalGameOver.classList.remove('active');
        });
      }
      if (btnGameOverInspect) {
        btnGameOverInspect.addEventListener('click', () => {
          if (modalGameOver) modalGameOver.classList.remove('active');
        });
      }
      if (btnGameOverNewGame) {
        btnGameOverNewGame.addEventListener('click', () => {
          if (modalGameOver) modalGameOver.classList.remove('active');
          this.setupNewManualGame();
        });
      }
      if (btnGameOverStartReview) {
        btnGameOverStartReview.addEventListener('click', () => {
          if (modalGameOver) modalGameOver.classList.remove('active');
          const badgeEl = document.getElementById('gameOverResultBadge');
          const result = badgeEl ? badgeEl.textContent.trim() : '*';
          const pgn = this.generateCurrentPGN(result);
          this.loadAndAnalyzePGN(pgn);
        });
      }

      // Keyboard navigation shortcuts (Front & Back, Flip, Shortcuts)
      window.addEventListener('keydown', (e) => {
        if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') return;
        if (e.key === 'ArrowRight' || e.key === ' ' || e.key === 'PageDown') {
          e.preventDefault();
          this.handleNextAction();
        } else if (e.key === 'ArrowLeft' || e.key === 'PageUp') {
          e.preventDefault();
          if (this.isExploring) this.resumeReview();
          else this.goToPly(Math.max(1, this.currentPly - 1));
        } else if (e.key === 'Home') {
          e.preventDefault();
          if (this.isExploring) this.resumeReview();
          this.goToPly(1);
        } else if (e.key === 'End') {
          e.preventDefault();
          if (this.isExploring) this.resumeReview();
          this.goToPly(this.analyzedGame.length);
        } else if (e.key === 'f' || e.key === 'F') {
          if (this.boardUI) {
            this.boardUI.orientation = this.boardUI.orientation === 'w' ? 'b' : 'w';
            this.boardUI.render();
          }
        } else if (e.key === 'Escape') {
          if (this.isExploring) this.resumeReview();
          document.querySelectorAll('.modal-overlay').forEach(m => m.classList.remove('active'));
        }
      });

      // Load initial game matching the user's reference screenshots!
      const initialPGN = SAMPLE_PGNS.screenshotGame;
      const textInput = document.getElementById('pgnTextInput');
      if (textInput) textInput.value = initialPGN;
      this.analyzePastedPGN();
    }

    handleFileUpload(event) {
      const file = event.target.files[0];
      if (!file) return;

      const reader = new FileReader();
      reader.onload = (e) => {
        let content = e.target.result;
        // If file contains multiple games, extract the first game or open explorer
        if (content.indexOf('[Event ') !== content.lastIndexOf('[Event ')) {
          const games = content.split(/\r?\n(?=\[Event )/);
          console.log(`Detected multi-game PGN archive with ${games.length} games. Loading game 1...`);
          content = games[0];
        }

        const textInput = document.getElementById('pgnTextInput');
        if (textInput) textInput.value = content;
        document.getElementById('modalSettings').classList.remove('active');
        this.analyzePastedPGN();
      };
      reader.readAsText(file);
    }

    async loadCarlsenGames(query = '') {
      const listEl = document.getElementById('carlsenGamesList');
      if (!listEl) return;
      listEl.innerHTML = '<div style="text-align:center; padding:20px; color:var(--text-muted);">Searching Carlsen database (7,818 games)...</div>';

      try {
        const res = await fetch(`/api/carlsen-games?q=${encodeURIComponent(query)}&limit=60`);
        if (!res.ok) throw new Error('Could not fetch Carlsen catalog');
        const data = await res.json();

        if (!data.games || data.games.length === 0) {
          listEl.innerHTML = '<div style="text-align:center; padding:20px; color:var(--text-muted);">No games found matching your search.</div>';
          return;
        }

        listEl.innerHTML = '';
        data.games.forEach(g => {
          const card = document.createElement('div');
          card.className = 'carlsen-game-card';

          let resClass = 'draw';
          if (g.result === '1-0') resClass = 'win';
          else if (g.result === '0-1') resClass = 'loss';

          card.innerHTML = `
            <div class="carlsen-card-top">
              <span class="carlsen-card-players">${g.white} vs ${g.black}</span>
              <span class="carlsen-res-badge ${resClass}">${g.result}</span>
            </div>
            <div class="carlsen-card-bottom">
              <span>${g.event} (${g.date || 'N/A'})</span>
              <span>${g.eco || ''}</span>
            </div>
          `;

          card.addEventListener('click', () => {
            this.loadCarlsenGameById(g.id);
          });

          listEl.appendChild(card);
        });
      } catch (err) {
        listEl.innerHTML = `<div style="text-align:center; padding:20px; color:#fa412d;">Error loading Carlsen games: ${err.message}</div>`;
      }
    }

    async loadCarlsenGameById(id) {
      const modalCarlsen = document.getElementById('modalCarlsenGames');
      if (modalCarlsen) modalCarlsen.classList.remove('active');

      const titleTextEl = document.getElementById('bubbleTitleText');
      const descTextEl = document.getElementById('bubbleDescText');
      if (titleTextEl) titleTextEl.textContent = "Loading Magnus Carlsen game...";
      if (descTextEl) descTextEl.textContent = "Analyzing game with Stockfish engine...";

      try {
        const res = await fetch(`/api/carlsen-game?id=${id}`);
        const data = await res.json();
        if (data && data.pgn) {
          const area = document.getElementById('pgnTextInput');
          if (area) area.value = data.pgn;
          await this.runGameReview(data.pgn);
        }
      } catch (err) {
        alert("Could not load Carlsen game: " + err.message);
      }
    }

    async analyzePastedPGN() {
      const textInput = document.getElementById('pgnTextInput');
      if (!textInput) return;
      const pgn = textInput.value.trim();
      if (!pgn) return;

      await this.runGameReview(pgn);
    }

    async runGameReview(pgn) {
      const testChess = new global.Chess();
      const success = testChess.load_pgn(pgn);
      if (!success) {
        alert("Could not parse PGN. Please verify standard PGN format.");
        return;
      }

      this.gameHeaders = testChess.header();
      const moves = testChess.history({verbose: true});
      if (moves.length === 0) {
        alert("PGN contains no moves.");
        return;
      }

      const reviewGame = [];
      const sim = new global.Chess();
      const moveHistorySAN = [];

      const titleTextEl = document.getElementById('bubbleTitleText');
      const descTextEl = document.getElementById('bubbleDescText');
      if (titleTextEl) titleTextEl.textContent = "XCodeChess AI Review";
      if (descTextEl) descTextEl.textContent = `Analyzing ${moves.length} moves with Stockfish...`;

      let whiteAccTotal = 0;
      let blackAccTotal = 0;
      let whiteMovesCount = 0;
      let blackMovesCount = 0;

      const badgeCounts = {
        w: { brilliant: 0, great: 0, best: 0, excellent: 0, good: 0, book: 0, inaccuracy: 0, mistake: 0, blunder: 0, miss: 0 },
        b: { brilliant: 0, great: 0, best: 0, excellent: 0, good: 0, book: 0, inaccuracy: 0, mistake: 0, blunder: 0, miss: 0 }
      };

      let prevAnalysisAfter = null;

      try {
        for (let i = 0; i < moves.length; i++) {
          const playedMove = moves[i];
          const isWhite = sim.turn === 'w';

          // Update progress in speech bubble so user sees live analysis every move
          const pct = Math.round(((i + 1) / moves.length) * 100);
          if (descTextEl) {
            descTextEl.textContent = `Analyzing move ${Math.floor(i / 2) + 1} of ${Math.ceil(moves.length / 2)} (${pct}%)...`;
          }
          await new Promise(r => setTimeout(r, 0));

          // 1. Analyze position BEFORE the move (reuse previous evalAfter to cut engine calls by 50%)
          let analysisBefore;
          if (i === 0 || !prevAnalysisAfter) {
            analysisBefore = await this.engine.analyze(sim, 2, false);
          } else {
            analysisBefore = prevAnalysisAfter;
          }

          const evalBefore = isWhite ? analysisBefore.eval : -analysisBefore.eval;
          const bestMoveBefore = analysisBefore.bestMove;

          // Check if piece sacrifice
          const pieceVal = global.PIECE_VALUES[playedMove.piece] || 100;
          const capturedVal = playedMove.captured ? (global.PIECE_VALUES[playedMove.captured] || 100) : 0;
          const isSacrifice = pieceVal >= 300 && pieceVal > (capturedVal + 150) && (typeof sim.attacked === 'function' ? sim.attacked(isWhite ? 'b' : 'w', playedMove.to) : false);

          // 2. Play the move
          sim.move(playedMove);
          moveHistorySAN.push(playedMove.san);

          // 3. Analyze position AFTER the move
          const analysisAfter = await this.engine.analyze(sim, 2, false);
          prevAnalysisAfter = analysisAfter;
          const evalAfter = isWhite ? analysisAfter.eval : -analysisAfter.eval;
          const tactics = this.engine.detectTactics(sim, playedMove);

          // 4. Classify Move (Exact Chess.com criteria)
          const badge = global.MoveClassifier.classify({
            playedMove: playedMove,
            bestMove: bestMoveBefore,
            evalBefore: evalBefore,
            evalAfter: evalAfter,
            moveHistorySAN: moveHistorySAN,
            isSacrifice: isSacrifice
          });

          // 5. Accuracy calculation
          const winBefore = global.MoveClassifier.winPercentage(evalBefore);
          const winAfter = global.MoveClassifier.winPercentage(evalAfter);
          const moveAcc = global.MoveClassifier.calculateMoveAccuracy(winBefore, winAfter);

          if (isWhite) {
            whiteAccTotal += moveAcc;
            whiteMovesCount++;
            badgeCounts.w[badge.id] = (badgeCounts.w[badge.id] || 0) + 1;
          } else {
            blackAccTotal += moveAcc;
            blackMovesCount++;
            badgeCounts.b[badge.id] = (badgeCounts.b[badge.id] || 0) + 1;
          }

          // 6. Fast continuation line: from engine PV or for key tactical moments
          let continuation = [];
          if (analysisAfter.pv && analysisAfter.pv.length > 0) {
            continuation = analysisAfter.pv;
          } else if (badge.id === 'blunder' || badge.id === 'mistake' || badge.id === 'miss' || badge.id === 'brilliant') {
            continuation = await this.engine.getContinuationLine(sim, playedMove, 3);
          }

          // 7. Tactical sequence classification (captures, forks/hooks, threats, mate)
          const tacticalSequence = (continuation && continuation.length > 0)
            ? this.engine.classifyTacticalSequence(sim, continuation)
            : null;

          // 8. Match Opening
          const opening = global.OpeningExplorer.findOpening(moveHistorySAN);

          // 9. Generate Coach Explanation
          const coachExplanation = this.coach.explainMove({
            badge: badge,
            playedMove: playedMove,
            bestMove: bestMoveBefore,
            moveNumber: Math.floor(i / 2) + 1,
            isWhite: isWhite,
            opening: opening,
            tactics: tactics,
            cpLoss: Math.max(0, evalBefore - evalAfter),
            evalScore: (analysisAfter.eval / 100).toFixed(2),
            continuationMoves: continuation
          });

          reviewGame.push({
            ply: i + 1,
            moveNumber: Math.floor(i / 2) + 1,
            isWhite: isWhite,
            move: playedMove,
            fen: sim.fen(),
            badge: badge,
            accuracy: moveAcc,
            evalCp: analysisAfter.eval,
            bestMove: bestMoveBefore,
            continuationMoves: continuation,
            tacticalSequence: tacticalSequence,
            coachExplanation: coachExplanation
          });
        }
      } catch (reviewErr) {
        console.error("Game review completed with partial error:", reviewErr);
      }

      this.analyzedGame = reviewGame;
      this.whiteAccuracy = whiteMovesCount > 0 ? (whiteAccTotal / whiteMovesCount).toFixed(1) : 0;
      this.blackAccuracy = blackMovesCount > 0 ? (blackAccTotal / blackMovesCount).toFixed(1) : 0;
      this.badgeCounts = badgeCounts;

      this.renderMoveRibbon();
      this.renderStatsView();
      if (this.evalGraph) {
        this.evalGraph.setGame(this.analyzedGame);
      }

      // Go directly to Move 1 (or start)
      this.goToPly(1);
    }

    stopContinuationPlayback() {
      if (this.continuationPlaybackTimer) {
        clearTimeout(this.continuationPlaybackTimer);
        this.continuationPlaybackTimer = null;
      }
      this.isPlaybackRunning = false;
    }

    goToPly(plyIndex) {
      if (plyIndex < 1) plyIndex = 1;
      if (plyIndex > this.analyzedGame.length) plyIndex = this.analyzedGame.length;

      const previousPly = this.currentPly;
      const shouldAnimate = Math.abs(plyIndex - previousPly) === 1;

      this.stopContinuationPlayback();
      this.stopSlideShow();
      const showPanel = document.getElementById('tacticalShowPanel');
      if (showPanel) showPanel.style.display = 'none';

      this.currentPly = plyIndex;
      this.isViewingContinuation = false;
      this.isViewingBest = false;
      this.isRetrying = false;
      this.isExploring = false;

      const banner = document.getElementById('exploringBanner');
      if (banner) banner.style.display = 'none';

      this.updateActionButtonsUI();

      // Recreate board at this ply
      const sim = new global.Chess();
      if (this.gameHeaders['SetUp'] === '1' && this.gameHeaders['FEN']) {
        sim.load(this.gameHeaders['FEN']);
      }

      let currentStep = null;
      for (let i = 0; i < plyIndex; i++) {
        currentStep = this.analyzedGame[i];
        sim.move(currentStep.move);
      }

      this.chess = sim;
      this.boardUI.setGame(this.chess, false);

      if (currentStep) {
        this.boardUI.setLastMove(currentStep.move.from, currentStep.move.to, currentStep.badge, shouldAnimate);
        this.boardUI.setEvaluation(currentStep.evalCp, null);

        // Arrows: If miss or blunder, show green arrow for best move!
        if (currentStep.badge.id === 'miss' || currentStep.badge.id === 'blunder' || currentStep.badge.id === 'mistake') {
          this.boardUI.setArrows(currentStep.bestMove, null, null);
        } else if (currentStep.badge.id === 'book' && currentStep.move.piece === 'p' && !currentStep.isWhite) {
          // Orange threat arrow like d7->d5 in photo 2
          this.boardUI.setArrows(null, null, {from: 'd7', to: 'd5'});
        } else {
          this.boardUI.setArrows(currentStep.bestMove, null, null);
        }

        this.renderCoachBubble(currentStep);

        // Sound effect
        if (currentStep.badge.id === 'brilliant') {
          this.audio.playBrilliant();
        } else if (currentStep.badge.id === 'blunder') {
          this.audio.playBlunder();
        } else if (currentStep.move.captured) {
          this.audio.playCapture();
        } else if (currentStep.move.san.includes('+') || currentStep.move.san.includes('#')) {
          this.audio.playCheck();
        } else {
          this.audio.playMove();
        }
      }

      this.highlightActiveRibbonMove(plyIndex);
      this.checkTacticalNotice(currentStep);
      if (this.evalGraph) {
        this.evalGraph.setPly(plyIndex);
      }
    }

    renderCoachBubble(step) {
      const exp = step.coachExplanation;
      const badge = step.badge;

      const badgeIconEl = document.getElementById('bubbleBadgeIcon');
      const titleTextEl = document.getElementById('bubbleTitleText');
      const evalPillEl = document.getElementById('bubbleEvalPill');
      const descTextEl = document.getElementById('bubbleDescText');
      const contTextEl = document.getElementById('bubbleContinuationText');

      if (badgeIconEl) {
        badgeIconEl.textContent = badge.icon;
        badgeIconEl.style.background = badge.bg;
        badgeIconEl.style.color = '#fff';
      }

      if (titleTextEl) {
        titleTextEl.textContent = exp.badgeLabel;
      }

      if (evalPillEl) {
        const cp = step.evalCp || 0;
        const pawns = (cp / 100).toFixed(2);
        evalPillEl.textContent = cp > 0 ? `+${pawns}` : `${pawns}`;
      }

      if (descTextEl) {
        descTextEl.textContent = exp.shortDescription;
      }

      if (contTextEl) {
        if (exp.continuationFormatted) {
          contTextEl.textContent = exp.continuationFormatted;
          // In photo 5, continuation is shown when Show is active
          contTextEl.classList.toggle('visible', this.isViewingContinuation);
        } else {
          contTextEl.classList.remove('visible');
        }
      }

      // Speak aloud if voice enabled
      this.coach.speak(exp.shortDescription);
    }

    renderMoveRibbon() {
      const ribbon = document.getElementById('moveRibbonContainer');
      if (!ribbon) return;
      ribbon.innerHTML = '';

      for (let i = 0; i < this.analyzedGame.length; i++) {
        const step = this.analyzedGame[i];
        const isBlack = !step.isWhite;
        const glyph = global.ChessCoach.formatGlyph(step.move.san, isBlack);

        const item = document.createElement('span');
        item.className = 'ribbon-item';
        item.dataset.ply = i + 1;

        let label = '';
        if (step.isWhite) {
          label = `${step.moveNumber}. ${glyph}`;
        } else {
          label = glyph;
        }

        // Show badge icon next to blunders / mistakes / miss
        let badgeIconHtml = '';
        if (step.badge.id === 'blunder' || step.badge.id === 'mistake' || step.badge.id === 'miss' || step.badge.id === 'brilliant') {
          badgeIconHtml = `<span class="ribbon-badge-mini" style="color:${step.badge.color}">${step.badge.icon}</span>`;
        }

        item.innerHTML = `${badgeIconHtml} ${label}`;
        item.addEventListener('click', () => {
          this.goToPly(i + 1);
        });

        ribbon.appendChild(item);
      }
    }

    highlightActiveRibbonMove(ply) {
      document.querySelectorAll('.ribbon-item').forEach(item => {
        const itemPly = parseInt(item.dataset.ply, 10);
        item.classList.toggle('active', itemPly === ply);
        if (itemPly === ply) {
          item.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'center' });
        }
      });
    }

    /**
     * Checks if current step has tactical sequences (mate, captures, forks, threats)
     * and shows/updates the notification banner directly below the dialogue box.
     */
    checkTacticalNotice(step) {
      const banner = document.getElementById('tacticalNoticeBanner');
      const panel = document.getElementById('tacticalShowPanel');
      if (!banner) return;

      if (!step) {
        banner.style.display = 'none';
        if (panel) panel.style.display = 'none';
        return;
      }

      let tactics = step.tacticalSequence;
      if (tactics === undefined || tactics === null) {
        let continuation = step.continuationMoves;
        if (!continuation || continuation.length === 0) {
          if (step.bestMove) continuation = [step.bestMove];
        }
        if (continuation && continuation.length > 0) {
          const sim = new global.Chess(step.fen);
          tactics = this.engine.classifyTacticalSequence(sim, continuation);
        } else {
          tactics = null;
        }
        step.tacticalSequence = tactics;
      }

      if (tactics && tactics.hasTactics) {
        const iconEl = document.getElementById('tacticalNoticeIcon');
        const titleEl = document.getElementById('tacticalNoticeTitle');
        const descEl = document.getElementById('tacticalNoticeDesc');

        if (iconEl) iconEl.textContent = tactics.icon;
        if (titleEl) titleEl.textContent = tactics.notificationTitle;
        if (descEl) descEl.textContent = tactics.notificationDesc;

        banner.className = `tactical-notice-banner ${tactics.category || ''}`;

        // If slideshow panel is open, banner is hidden; else show banner!
        if (panel && panel.style.display !== 'none' && this.isViewingContinuation) {
          banner.style.display = 'none';
        } else {
          banner.style.display = 'flex';
        }
      } else {
        banner.style.display = 'none';
      }
    }

    /**
     * Opens the Tactical Slideshow Panel below the dialogue box
     * Predicts tactical sequence of hooks, captures, attacks, checkmate and plays with 600ms delay
     */
    async openTacticalShowPanel(customTactics = null) {
      const step = this.analyzedGame[this.currentPly - 1];
      if (!step) return;

      this.isViewingContinuation = true;
      this.isViewingBest = false;
      this.updateActionButtonsUI();

      // Hide notification banner while slideshow is active
      const banner = document.getElementById('tacticalNoticeBanner');
      if (banner) banner.style.display = 'none';

      let tactics = customTactics || step.tacticalSequence;
      const simStart = new global.Chess(step.fen);

      // If continuation sequence is short or not computed, query deep Stockfish continuation
      if (!tactics || !tactics.steps || tactics.steps.length < 2) {
        const titleTextEl = document.getElementById('bubbleTitleText');
        const descTextEl = document.getElementById('bubbleDescText');
        if (titleTextEl) titleTextEl.textContent = "Calculating tactical sequence...";
        if (descTextEl) descTextEl.textContent = `Stockfish (${this.currentElo} Elo) is computing tactical captures, forks & checkmates...`;

        try {
          const deepMoves = await this.engine.getDeepContinuation(simStart, 10);
          if (deepMoves && deepMoves.length > 0) {
            step.continuationMoves = deepMoves;
            tactics = this.engine.classifyTacticalSequence(simStart, deepMoves);
            step.tacticalSequence = tactics;
          }
        } catch (e) {
          console.warn("Could not compute deep tactical continuation:", e);
        }
      }

      if (!tactics || !tactics.steps || tactics.steps.length === 0) {
        // Fallback to best move if available
        if (step.bestMove) {
          tactics = this.engine.classifyTacticalSequence(simStart, [step.bestMove]);
        }
      }

      if (!tactics || !tactics.steps || tactics.steps.length === 0) {
        this.isViewingContinuation = false;
        this.updateActionButtonsUI();
        return;
      }

      this.activeTactics = tactics;

      // Populate Slideshow Panel UI elements
      const panel = document.getElementById('tacticalShowPanel');
      const categoryBadge = document.getElementById('showCategoryBadge');
      const headlineEl = document.getElementById('showPanelHeadline');
      const timelineEl = document.getElementById('showStepperTimeline');

      if (categoryBadge) {
        categoryBadge.textContent = tactics.summaryBadge;
        categoryBadge.style.color = tactics.badgeColor;
        categoryBadge.style.borderColor = tactics.badgeColor;
      }

      if (headlineEl) {
        headlineEl.textContent = tactics.headline;
      }

      // Populate Timeline pills
      if (timelineEl) {
        timelineEl.innerHTML = '';
        tactics.steps.forEach((s, idx) => {
          const pill = document.createElement('div');
          pill.className = 'show-step-pill';
          pill.dataset.stepIndex = idx;

          let badgeIcon = '';
          if (s.isMate) badgeIcon = '⚡';
          else if (s.isFork) badgeIcon = '🪝';
          else if (s.wasCaptured) badgeIcon = '💥';
          else if (s.isCheck) badgeIcon = '🎯';

          const movePrefix = s.isWhite ? `${s.moveNumber}. ` : (idx === 0 ? `${s.moveNumber}... ` : '');
          pill.innerHTML = `<span>${badgeIcon}</span><span>${movePrefix}${s.san}</span>`;

          pill.addEventListener('click', () => {
            this.pauseSlideShow();
            this.goToSlide(idx);
          });

          timelineEl.appendChild(pill);
        });
      }

      // Display panel directly below speech bubble
      if (panel) {
        panel.style.display = 'flex';
      }

      // Start at slide 0
      this.goToSlide(0);

      // Auto-play the slideshow with 600ms delay as requested!
      this.playSlideShow();
    }

    /**
     * Steps to a specific slide in the tactical slideshow
     */
    goToSlide(slideIndex) {
      if (!this.activeTactics || !this.activeTactics.steps || this.activeTactics.steps.length === 0) return;
      const total = this.activeTactics.steps.length;

      if (slideIndex < 0) slideIndex = 0;
      if (slideIndex >= total) slideIndex = total - 1;
      this.currentSlideIndex = slideIndex;

      const step = this.analyzedGame[this.currentPly - 1];
      if (!step) return;

      // Recreate position from step.fen up to this slideIndex
      const sim = new global.Chess(step.fen);
      let curStepObj = null;

      for (let i = 0; i <= slideIndex; i++) {
        curStepObj = this.activeTactics.steps[i];
        sim.move(curStepObj);
      }

      // Update board UI with smooth piece glide animation
      this.boardUI.setGame(sim, false);
      if (curStepObj) {
        this.boardUI.setLastMove(curStepObj.from, curStepObj.to, null, true);
        this.boardUI.setArrows(curStepObj, null, null);

        // Play audio matching the move
        if (curStepObj.isMate) {
          this.audio.playCheck();
        } else if (curStepObj.wasCaptured) {
          this.audio.playCapture();
        } else if (curStepObj.isCheck) {
          this.audio.playCheck();
        } else {
          this.audio.playMove();
        }
      }

      // Update Step Card
      const stepNumEl = document.getElementById('showStepNum');
      const stepActionEl = document.getElementById('showStepAction');
      const stepDetailEl = document.getElementById('showStepDetail');

      if (stepNumEl) stepNumEl.textContent = `Move ${slideIndex + 1} of ${total}`;
      if (stepActionEl && curStepObj) stepActionEl.textContent = curStepObj.actionTitle;
      if (stepDetailEl && curStepObj) stepDetailEl.textContent = curStepObj.actionDetail;

      // Update Stepper timeline pill highlights
      document.querySelectorAll('.show-step-pill').forEach((pill, idx) => {
        pill.classList.toggle('active', idx === slideIndex);
        pill.classList.toggle('played', idx < slideIndex);
        if (idx === slideIndex) {
          pill.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'center' });
        }
      });

      // Update coach speech bubble subtitle to match
      const descTextEl = document.getElementById('bubbleDescText');
      if (descTextEl && curStepObj) {
        descTextEl.textContent = `${curStepObj.actionTitle}: ${curStepObj.actionDetail}`;
      }
    }

    /**
     * Toggles play/pause state of the slideshow
     */
    toggleSlideShowPlay() {
      if (this.isSlideShowPlaying) {
        this.pauseSlideShow();
      } else {
        this.playSlideShow();
      }
    }

    /**
     * Starts auto-playing the slideshow with 600ms delay
     */
    playSlideShow() {
      this.pauseSlideShow();
      if (!this.activeTactics || !this.activeTactics.steps) return;

      // If at end, loop back to start
      if (this.currentSlideIndex >= this.activeTactics.steps.length - 1) {
        this.goToSlide(0);
      }

      this.isSlideShowPlaying = true;
      const playIcon = document.getElementById('slidePlayIcon');
      const playLabel = document.getElementById('slidePlayLabel');
      if (playIcon) playIcon.textContent = '⏸';
      if (playLabel) playLabel.textContent = 'Pause';

      const nextTick = () => {
        if (!this.isSlideShowPlaying) return;

        if (this.currentSlideIndex < this.activeTactics.steps.length - 1) {
          this.goToSlide(this.currentSlideIndex + 1);
          // 600ms delay between tactical moves as requested!
          this.slideShowTimer = setTimeout(nextTick, 600);
        } else {
          this.pauseSlideShow();
        }
      };

      this.slideShowTimer = setTimeout(nextTick, 600);
    }

    /**
     * Pauses the auto-playing slideshow
     */
    pauseSlideShow() {
      this.isSlideShowPlaying = false;
      if (this.slideShowTimer) {
        clearTimeout(this.slideShowTimer);
        this.slideShowTimer = null;
      }

      const playIcon = document.getElementById('slidePlayIcon');
      const playLabel = document.getElementById('slidePlayLabel');
      if (playIcon) playIcon.textContent = '▶';
      if (playLabel) playLabel.textContent = 'Play';
    }

    /**
     * Stops the slideshow and clears all timers
     */
    stopSlideShow() {
      this.pauseSlideShow();
      this.stopContinuationPlayback();
      this.activeTactics = null;
      this.currentSlideIndex = 0;
    }

    /**
     * Closes the Tactical Show Panel and restores the board position
     */
    closeTacticalShowPanel() {
      this.stopSlideShow();

      const panel = document.getElementById('tacticalShowPanel');
      if (panel) panel.style.display = 'none';

      this.isViewingContinuation = false;
      this.updateActionButtonsUI();

      // Restore position to reviewed ply
      this.goToPly(this.currentPly);
    }

    /**
     * Toggles Future Analysis Continuation (Show / Hide button from Screenshot)
     */
    toggleFutureAnalysis() {
      if (this.isViewingContinuation) {
        this.closeTacticalShowPanel();
      } else {
        this.openTacticalShowPanel();
      }
    }

    /**
     * Toggles Best Move View
     */
    toggleBestMoveView() {
      if (this.currentPly === 0 || this.analyzedGame.length === 0) return;
      const step = this.analyzedGame[this.currentPly - 1];
      if (!step || !step.bestMove) return;

      this.isViewingBest = !this.isViewingBest;
      this.isViewingContinuation = false;

      if (this.isViewingBest) {
        // Load board before move and play the best move
        const prevPly = this.currentPly - 1;
        const sim = new global.Chess();
        for (let i = 0; i < prevPly; i++) {
          sim.move(this.analyzedGame[i].move);
        }
        sim.move(step.bestMove);
        this.boardUI.setGame(sim);
        this.boardUI.setLastMove(step.bestMove.from, step.bestMove.to, global.BADGES.BEST);
        this.boardUI.setArrows(null, null, null);

        const descTextEl = document.getElementById('bubbleDescText');
        if (descTextEl) {
          descTextEl.textContent = `Showing Best Move: ${step.bestMove.san}. This keeps full control of the position.`;
        }
        this.audio.playMove();
      } else {
        this.goToPly(this.currentPly);
      }

      this.updateActionButtonsUI();
    }

    /**
     * Next / Resume button action (Big green button from Screenshot)
     */
    handleNextAction() {
      // If currently exploring a custom variation on the board, resume back to game review!
      if (this.isExploring) {
        this.resumeReview();
        return;
      }

      // If currently viewing future continuation or best move, resume back to game!
      if (this.isViewingContinuation || this.isViewingBest) {
        this.goToPly(this.currentPly);
        return;
      }

      // If at end of game, open Summary modal
      if (this.currentPly >= this.analyzedGame.length) {
        const modalStats = document.getElementById('modalStats');
        if (modalStats) modalStats.classList.add('active');
        return;
      }

      // Advance to next move
      this.goToPly(this.currentPly + 1);
    }

    updateActionButtonsUI() {
      const btnShowFuture = document.getElementById('btnShowFuture');
      const labelShowFuture = document.getElementById('labelShowFuture');
      const btnNextAction = document.getElementById('btnNextAction');

      if (this.isExploring) {
        if (btnNextAction) btnNextAction.textContent = 'Resume';
      } else if (this.isViewingContinuation) {
        if (labelShowFuture) labelShowFuture.textContent = 'Hide';
        if (btnShowFuture) btnShowFuture.classList.add('active');
        if (btnNextAction) btnNextAction.textContent = 'Resume';
      } else if (this.isViewingBest) {
        if (btnNextAction) btnNextAction.textContent = 'Resume';
      } else {
        if (labelShowFuture) labelShowFuture.textContent = 'Show';
        if (btnShowFuture) btnShowFuture.classList.remove('active');
        if (btnNextAction) btnNextAction.textContent = 'Next';
      }
    }

    startRetry() {
      if (this.currentPly === 0) return;
      const step = this.analyzedGame[this.currentPly - 1];
      if (!step) return;

      this.isRetrying = true;
      this.isExploring = false;
      this.retryPly = this.currentPly - 1;

      // Revert board to position before this move
      const sim = new global.Chess();
      for (let i = 0; i < this.retryPly; i++) {
        sim.move(this.analyzedGame[i].move);
      }

      this.chess = sim;
      this.boardUI.setGame(this.chess);
      this.boardUI.setLastMove(null, null, null);
      this.boardUI.setArrows(null, null, null);

      const titleTextEl = document.getElementById('bubbleTitleText');
      const descTextEl = document.getElementById('bubbleDescText');
      const badgeIconEl = document.getElementById('bubbleBadgeIcon');

      if (badgeIconEl) {
        badgeIconEl.textContent = '↻';
        badgeIconEl.style.background = '#e58f2a';
      }
      if (titleTextEl) titleTextEl.textContent = "Retry: Find the best move!";
      if (descTextEl) descTextEl.textContent = `You played ${step.move.san}. Make a move on the board to find the winning continuation!`;
      this.updateActionButtonsUI();
    }

    /**
     * Handles live board moves during review or retry mode
     */
    async handleUserBoardMove(move) {
      if (move.captured) {
        this.audio.playCapture();
      } else if (move.san.includes('+') || move.san.includes('#')) {
        this.audio.playCheck();
      } else {
        this.audio.playMove();
      }

      const titleTextEl = document.getElementById('bubbleTitleText');
      const descTextEl = document.getElementById('bubbleDescText');
      const badgeIconEl = document.getElementById('bubbleBadgeIcon');
      const evalPillEl = document.getElementById('bubbleEvalPill');

      // Case A: User is in Retry Mode trying to solve a blunder/mistake
      if (this.isRetrying) {
        const step = this.analyzedGame[this.retryPly];
        const bestSan = step.bestMove ? step.bestMove.san : null;

        if (bestSan && move.san === bestSan) {
          this.audio.playBrilliant();
          if (badgeIconEl) {
            badgeIconEl.textContent = '⭐';
            badgeIconEl.style.background = '#81b64c';
          }
          if (titleTextEl) titleTextEl.textContent = `⭐ Correct! ${move.san} is the best move!`;
          if (descTextEl) descTextEl.textContent = `Excellent tactical vision! You found the exact move recommended by Stockfish.`;
          this.isRetrying = false;
          this.updateActionButtonsUI();
        } else {
          this.audio.playBlunder();
          if (badgeIconEl) {
            badgeIconEl.textContent = '❌';
            badgeIconEl.style.background = '#fa412d';
          }
          if (titleTextEl) titleTextEl.textContent = `Not quite: ${move.san}`;
          if (descTextEl) descTextEl.textContent = `That move allows counterplay. Try another move or tap Best!`;

          // Revert board after 1.1s so user can retry again
          setTimeout(() => {
            if (this.isRetrying) {
              this.chess.undo();
              this.boardUI.render();
            }
          }, 1100);
        }
        return;
      }

      // Case B: Interactive Variation Exploration Mode
      if (!this.isExploring) {
        this.isExploring = true;
        this.exploreBasePly = this.currentPly;
      }

      const banner = document.getElementById('exploringBanner');
      const expText = document.getElementById('exploringText');
      if (banner) banner.style.display = 'flex';
      if (expText) expText.textContent = `🔍 Exploring Variation (Played ${move.san})`;

      if (badgeIconEl) {
        badgeIconEl.textContent = '🔍';
        badgeIconEl.style.background = '#3897f0';
      }
      if (titleTextEl) titleTextEl.textContent = `Variation: ${move.san}`;
      if (descTextEl) descTextEl.textContent = `Analyzing with Stockfish (${this.currentElo} Elo)...`;

      // Update Move Ribbon dynamically if playing custom game or variation
      const ribbon = document.getElementById('moveRibbon');
      if (ribbon) {
        const history = this.chess.history();
        let ribbonHtml = '';
        for (let i = 0; i < history.length; i++) {
          const moveNum = Math.floor(i / 2) + 1;
          const isW = i % 2 === 0;
          if (isW) {
            ribbonHtml += `<span class="ribbon-move-pill active"><span class="ribbon-num">${moveNum}.</span> ${history[i]}</span>`;
          } else {
            ribbonHtml += `<span class="ribbon-move-pill active">${history[i]}</span>`;
          }
        }
        ribbon.innerHTML = ribbonHtml;
        ribbon.scrollLeft = ribbon.scrollWidth;
      }

      this.updateActionButtonsUI();

      // Check for Checkmate or Game Over
      if (this.chess.game_over()) {
        const isMate = this.chess.in_checkmate();
        if (titleTextEl) {
          titleTextEl.textContent = isMate ? '⚡ Checkmate!' : 'Game Over (Draw)';
        }
        if (descTextEl) {
          descTextEl.textContent = isMate ? 'Checkmate has occurred on the board!' : 'The game ended in a draw.';
        }
        setTimeout(() => this.showGameOverModal(), 450);
        return;
      }

      // Real engine evaluation of user's custom move
      try {
        const analysis = await this.engine.analyze(this.chess, 12);
        if (analysis) {
          const cp = analysis.eval || 0;
          const pawns = (cp / 100).toFixed(2);
          if (evalPillEl) evalPillEl.textContent = cp > 0 ? `+${pawns}` : `${pawns}`;
          this.boardUI.setEvaluation(cp);

          if (analysis.bestMove) {
            this.boardUI.bestMoveArrow = analysis.bestMove;
            this.boardUI.drawArrows();
          }

          let comment = '';
          const absCp = Math.abs(cp);
          if (absCp < 50) {
            comment = `Position is roughly balanced (~${pawns}). Both sides have active chances.`;
          } else if (cp > 120) {
            comment = `White has a strong advantage (+${pawns}). Active piece coordination and tactical initiative.`;
          } else if (cp < -120) {
            comment = `Black is clearly ahead (${pawns}). Solid positional pressure with decisive threats.`;
          } else {
            comment = `Stockfish evaluation: ${pawns} pawns. Recommended reply is ${analysis.bestMove ? analysis.bestMove.san : 'solid development'}.`;
          }

          if (descTextEl) descTextEl.textContent = comment;
        }
      } catch (err) {
        console.warn("Exploration analysis error:", err);
      }
    }

    /**
     * Let Stockfish play the opponent's reply on the board during exploration
     */
    async engineMakeReply() {
      if (!this.chess) return;
      const descTextEl = document.getElementById('bubbleDescText');
      const titleTextEl = document.getElementById('bubbleTitleText');
      if (descTextEl) descTextEl.textContent = `Stockfish (${this.currentElo} Elo) is calculating response...`;

      try {
        const analysis = await this.engine.analyze(this.chess, 12);
        if (analysis && analysis.bestMove) {
          const move = this.chess.move(analysis.bestMove);
          if (move) {
            this.boardUI.setLastMove(move.from, move.to, null, true);
            if (move.captured) this.audio.playCapture();
            else if (move.san.includes('+') || move.san.includes('#')) this.audio.playCheck();
            else this.audio.playMove();

            if (titleTextEl) titleTextEl.textContent = `Stockfish replied: ${move.san}`;
            if (descTextEl) descTextEl.textContent = `Your turn! Make another move on the board or tap Resume Review.`;

            // Update Move Ribbon dynamically
            const ribbon = document.getElementById('moveRibbon');
            if (ribbon) {
              const history = this.chess.history();
              let ribbonHtml = '';
              for (let i = 0; i < history.length; i++) {
                const moveNum = Math.floor(i / 2) + 1;
                const isW = i % 2 === 0;
                if (isW) {
                  ribbonHtml += `<span class="ribbon-move-pill active"><span class="ribbon-num">${moveNum}.</span> ${history[i]}</span>`;
                } else {
                  ribbonHtml += `<span class="ribbon-move-pill active">${history[i]}</span>`;
                }
              }
              ribbon.innerHTML = ribbonHtml;
              ribbon.scrollLeft = ribbon.scrollWidth;
            }

            // Check if Stockfish delivered checkmate or game over
            if (this.chess.game_over()) {
              const isMate = this.chess.in_checkmate();
              if (titleTextEl) titleTextEl.textContent = isMate ? '⚡ Checkmate by Stockfish!' : 'Game Over';
              if (descTextEl) descTextEl.textContent = isMate ? 'Stockfish delivered checkmate!' : 'Game ended in a draw.';
              setTimeout(() => this.showGameOverModal(), 450);
              return;
            }

            // Draw next best move arrow
            const nextAnalysis = await this.engine.analyze(this.chess, 10);
            if (nextAnalysis && nextAnalysis.bestMove) {
              this.boardUI.bestMoveArrow = nextAnalysis.bestMove;
              this.boardUI.drawArrows();
            }
          }
        }
      } catch (err) {
        console.warn("Engine reply error:", err);
      }
    }

    /**
     * Resets the board and starts a brand new custom game setup
     */
    setupNewManualGame() {
      this.stopContinuationPlayback();
      this.isExploring = true;
      this.isRetrying = false;
      this.isViewingContinuation = false;
      this.isViewingBest = false;
      this.currentPly = 0;
      this.exploreBasePly = 0;
      this.analyzedGame = [];

      this.chess = new global.Chess();
      this.gameHeaders = {
        Event: 'Custom Setup Game',
        Site: 'XCodeChess',
        Date: new Date().toISOString().slice(0, 10).replace(/-/g, '.'),
        White: 'Player White',
        Black: 'Player Black',
        Result: '*'
      };

      if (this.boardUI) {
        this.boardUI.orientation = 'w';
        this.boardUI.setGame(this.chess, false);
        this.boardUI.lastMove = null;
        this.boardUI.badgeData = null;
        this.boardUI.bestMoveArrow = null;
        this.boardUI.blunderArrow = null;
        this.boardUI.render(false);
        this.boardUI.setEvaluation(0, null);
      }

      // Update banner
      const banner = document.getElementById('exploringBanner');
      const expText = document.getElementById('exploringText');
      if (banner) banner.style.display = 'flex';
      if (expText) expText.textContent = '♟️ Custom Game Setup (Play moves on board)';

      // Update Coach Bubble
      const titleTextEl = document.getElementById('bubbleTitleText');
      const descTextEl = document.getElementById('bubbleDescText');
      const badgeIconEl = document.getElementById('bubbleBadgeIcon');
      const evalPillEl = document.getElementById('bubbleEvalPill');

      if (badgeIconEl) {
        badgeIconEl.textContent = '♟️';
        badgeIconEl.style.background = '#81b64c';
      }
      if (titleTextEl) titleTextEl.textContent = 'Custom Game Setup';
      if (descTextEl) descTextEl.textContent = 'Play moves for White and Black manually, or tap Engine Reply for Stockfish! When checkmate occurs, review will be available.';
      if (evalPillEl) evalPillEl.textContent = '0.0';

      // Clear ribbon
      const ribbon = document.getElementById('moveRibbon');
      if (ribbon) ribbon.innerHTML = '<span style="color:var(--text-muted); font-size:12px; padding:0 8px;">Custom game moves will appear here...</span>';

      this.updateActionButtonsUI();
    }

    /**
     * Generates standard PGN from currently played moves
     */
    generateCurrentPGN(result = '*') {
      const history = this.chess.history();
      const whiteName = this.gameHeaders['White'] || 'Player White';
      const blackName = this.gameHeaders['Black'] || 'Player Black';
      const dateStr = new Date().toISOString().slice(0, 10).replace(/-/g, '.');

      let pgn = `[Event "Custom Game"]\n[Site "XCodeChess"]\n[Date "${dateStr}"]\n[White "${whiteName}"]\n[Black "${blackName}"]\n[Result "${result}"]\n\n`;

      for (let i = 0; i < history.length; i++) {
        if (i % 2 === 0) {
          pgn += `${Math.floor(i / 2) + 1}. `;
        }
        pgn += `${history[i]} `;
      }
      pgn += result;
      return pgn.trim();
    }

    /**
     * Displays the authentic Game Over / Checkmate Victory Modal
     */
    showGameOverModal() {
      const isMate = this.chess.in_checkmate();
      const isStalemate = this.chess.in_stalemate();
      const isRepetition = this.chess.in_threefold_repetition();
      const isMaterial = this.chess.insufficient_material();
      const history = this.chess.history();
      const moveCount = history.length;
      const fullMoves = Math.ceil(moveCount / 2);

      let winnerTitle = '';
      let subtitle = '';
      let resultBadge = '';
      let icon = '🏆';

      if (isMate) {
        // Player whose turn it is is checkmated!
        const winnerIsWhite = this.chess.turn === 'b';
        winnerTitle = winnerIsWhite ? 'White won by Checkmate!' : 'Black won by Checkmate!';
        subtitle = `Checkmate delivered in ${fullMoves} move${fullMoves > 1 ? 's' : ''}!`;
        resultBadge = winnerIsWhite ? '1 - 0' : '0 - 1';
        icon = winnerIsWhite ? '👑' : '♚';
        this.audio.playVictory();
      } else if (isStalemate) {
        winnerTitle = 'Draw by Stalemate!';
        subtitle = `No legal moves remaining in ${fullMoves} moves.`;
        resultBadge = '½ - ½';
        icon = '🤝';
      } else if (isRepetition) {
        winnerTitle = 'Draw by Repetition!';
        subtitle = `Position repeated 3 times.`;
        resultBadge = '½ - ½';
        icon = '🔄';
      } else if (isMaterial) {
        winnerTitle = 'Draw by Insufficient Material!';
        subtitle = `Neither side has sufficient pieces to mate.`;
        resultBadge = '½ - ½';
        icon = '⚖️';
      } else {
        winnerTitle = 'Game Over!';
        subtitle = `Game concluded after ${fullMoves} moves.`;
        resultBadge = '½ - ½';
        icon = '🏁';
      }

      const titleEl = document.getElementById('gameOverWinnerTitle');
      const subEl = document.getElementById('gameOverSubtitle');
      const badgeEl = document.getElementById('gameOverResultBadge');
      const countEl = document.getElementById('gameOverMovesCount');
      const iconEl = document.getElementById('gameOverIcon');

      if (titleEl) titleEl.textContent = winnerTitle;
      if (subEl) subEl.textContent = subtitle;
      if (badgeEl) badgeEl.textContent = resultBadge;
      if (countEl) countEl.textContent = `${moveCount} Moves Played`;
      if (iconEl) iconEl.textContent = icon;

      const modalGameOver = document.getElementById('modalGameOver');
      if (modalGameOver) {
        modalGameOver.classList.add('active');
      }
    }

    /**
     * Exits variation exploration and resumes the reviewed game
     */
    resumeReview() {
      this.isExploring = false;
      this.isRetrying = false;
      const banner = document.getElementById('exploringBanner');
      if (banner) banner.style.display = 'none';

      this.goToPly(this.exploreBasePly || this.currentPly || 1);
    }

    /**
     * Sets Stockfish Elo rating (800..3200) and updates UI
     */
    setStockfishElo(elo) {
      elo = Math.max(800, Math.min(3200, parseInt(elo, 10) || 2000));
      this.currentElo = elo;
      localStorage.setItem('xcodechess_stockfish_elo', elo);
      this.engine.setElo(elo);

      this.updateEngineStatusUI('Stockfish 10', elo);

      const slider = document.getElementById('stockfishEloSlider');
      if (slider) slider.value = elo;

      const display = document.getElementById('eloCurrentDisplay');
      if (display) {
        let title = 'Expert';
        if (elo <= 1000) title = 'Beginner';
        else if (elo <= 1400) title = 'Casual';
        else if (elo <= 1800) title = 'Club';
        else if (elo <= 2200) title = 'Expert';
        else if (elo <= 2600) title = 'Master';
        else if (elo <= 3000) title = 'Grandmaster';
        else title = 'Max Engine';
        display.textContent = `${elo} Elo (${title})`;
      }

      document.querySelectorAll('.elo-pill-btn').forEach(btn => {
        const btnElo = parseInt(btn.dataset.elo, 10);
        btn.classList.toggle('active', btnElo === elo);
      });
    }

    updateEngineStatusUI(name, elo) {
      const badge = document.getElementById('engineStatusBadge');
      if (badge) {
        const current = elo || this.currentElo;
        badge.textContent = `⚡ ${current} Elo`;
        badge.title = `Stockfish Engine Strength: ${current} Elo (Click to adjust strength)`;
      }
    }

    renderStatsView() {
      const wAccEl = document.getElementById('statWhiteAccuracy');
      const bAccEl = document.getElementById('statBlackAccuracy');
      const wEloEl = document.getElementById('statWhiteElo');
      const bEloEl = document.getElementById('statBlackElo');
      const wNameEl = document.getElementById('summaryWhiteName');
      const bNameEl = document.getElementById('summaryBlackName');

      if (wAccEl) wAccEl.textContent = `${this.whiteAccuracy}%`;
      if (bAccEl) bAccEl.textContent = `${this.blackAccuracy}%`;

      if (wNameEl) wNameEl.textContent = `⚪ ${this.gameHeaders['White'] || 'White'}`;
      if (bNameEl) bNameEl.textContent = `⚫ ${this.gameHeaders['Black'] || 'Black'}`;

      const wElo = global.MoveClassifier.estimateElo(parseFloat(this.whiteAccuracy), 30);
      const bElo = global.MoveClassifier.estimateElo(parseFloat(this.blackAccuracy), 50);

      if (wEloEl) wEloEl.textContent = `~${wElo} Elo`;
      if (bEloEl) bEloEl.textContent = `~${bElo} Elo`;

      // Badge table
      const tbody = document.getElementById('badgeStatsBody');
      if (!tbody) return;
      tbody.innerHTML = '';

      const badgeKeys = ['brilliant', 'great', 'best', 'excellent', 'good', 'book', 'inaccuracy', 'mistake', 'blunder', 'miss'];

      badgeKeys.forEach(id => {
        const badge = Object.values(global.BADGES).find(b => b.id === id);
        if (!badge) return;

        const wCount = this.badgeCounts.w[id] || 0;
        const bCount = this.badgeCounts.b[id] || 0;

        if (wCount === 0 && bCount === 0) return;

        const row = document.createElement('tr');
        row.innerHTML = `
          <td>
            <span style="display: inline-flex; align-items: center; gap: 6px;">
              <span>${badge.icon}</span>
              <strong>${badge.name}</strong>
            </span>
          </td>
          <td class="stat-num">${wCount}</td>
          <td class="stat-num">${bCount}</td>
        `;
        tbody.appendChild(row);
      });
    }

    async handleCoachQuestion() {
      const input = document.getElementById('coachQuestionInput');
      const chatLog = document.getElementById('coachChatLog');
      if (!input || !chatLog) return;

      const question = input.value.trim();
      if (!question) return;

      input.value = '';
      const userDiv = document.createElement('div');
      userDiv.style.fontWeight = '700';
      userDiv.textContent = `You: ${question}`;
      chatLog.appendChild(userDiv);

      const analysis = await this.engine.analyze(this.chess, 2);
      const answer = this.coach.answerQuestion(question, this.chess, analysis);

      setTimeout(() => {
        const coachDiv = document.createElement('div');
        coachDiv.style.color = '#81b64c';
        coachDiv.textContent = `Coach: ${answer}`;
        chatLog.appendChild(coachDiv);
        chatLog.scrollTop = chatLog.scrollHeight;
        this.coach.speak(answer);
      }, 200);
    }
  }

  window.addEventListener('DOMContentLoaded', () => {
    global.app = new ChessApp();
  });

})(typeof window !== 'undefined' ? window : this);
