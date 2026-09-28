/**
 * ChessRules - Complete, robust chess rules and PGN engine
 * Fully compatible with standard Chess.js API
 */
(function(global) {
  'use strict';

  const BLACK = 'b';
  const WHITE = 'w';

  const EMPTY = -1;

  const PAWN = 'p';
  const KNIGHT = 'n';
  const BISHOP = 'b';
  const ROOK = 'r';
  const QUEEN = 'q';
  const KING = 'k';

  const SYMBOLS = 'pnbrqkPNBRQK';

  const DEFAULT_POSITION = 'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1';

  const POSSIBLE_RESULTS = ['1-0', '0-1', '1/2-1/2', '*'];

  const PAWN_OFFSETS = {
    b: [16, 32, 17, 15],
    w: [-16, -32, -17, -15]
  };

  const PIECE_OFFSETS = {
    n: [-18, -33, -31, -14, 18, 33, 31, 14],
    b: [-17, -15, 17, 15],
    r: [-16, 1, 16, -1],
    q: [-17, -16, -15, 1, 17, 16, 15, -1],
    k: [-17, -16, -15, 1, 17, 16, 15, -1]
  };

  const ATTACKS = [
    20, 0, 0, 0, 0, 0, 0, 24,  0, 0, 0, 0, 0, 0,20, 0,
     0,20, 0, 0, 0, 0, 24,  0,  0, 0, 0, 0, 0,20, 0, 0,
     0, 0,20, 0, 0, 24,  0,  0,  0, 0, 0,20, 0, 0, 0, 0,
     0, 0, 0,20, 24,  0,  0,  0,  0, 0,20, 0, 0, 0, 0, 0,
     0, 0, 0, 24,20,  0,  0,  0,  0,20,24, 0, 0, 0, 0, 0,
     0, 0, 24,  0, 0,20,  0,  0, 20, 0, 0,24, 0, 0, 0, 0,
     0, 24,  0,  0, 0, 0,20, 20,  0, 0, 0, 0,24, 0, 0, 0,
    24,  0,  0,  0, 0,  0,  0, 20,  0, 0, 0, 0, 0,24, 0, 0
  ];

  const RAYS = [
     17,  0,  0,  0,  0,  0,  0, 16,  0,  0,  0,  0,  0,  0, 15, 0,
      0, 17,  0,  0,  0,  0, 16,  0,  0,  0,  0,  0, 15,  0,  0, 0,
      0,  0, 17,  0,  0, 16,  0,  0,  0,  0, 15,  0,  0,  0,  0, 0,
      0,  0,  0, 17, 16,  0,  0,  0,  0, 15,  0,  0,  0,  0,  0, 0,
      0,  0,  0, 16, 17,  0,  0,  0, 15,  0,  0,  0,  0,  0,  0, 0,
      0,  0, 16,  0,  0, 17,  0, 15,  0,  0,  0,  0,  0,  0,  0, 0,
      0, 16,  0,  0,  0,  0, 17, 15,  0,  0,  0,  0,  0,  0,  0, 0,
     16,  0,  0,  0,  0,  0,  0, 17,  0,  0,  0,  0,  0,  0,  0, 0
  ];

  const SHIFTS = { p: 0, n: 1, b: 2, r: 3, q: 4, k: 5 };

  const FLAGS = {
    NORMAL: 'n',
    CAPTURE: 'c',
    BIG_PAWN: 'b',
    EP_CAPTURE: 'e',
    PROMOTION: 'p',
    KSIDE_CASTLE: 'k',
    QSIDE_CASTLE: 'q'
  };

  const BITS = {
    NORMAL: 1,
    CAPTURE: 2,
    BIG_PAWN: 4,
    EP_CAPTURE: 8,
    PROMOTION: 16,
    KSIDE_CASTLE: 32,
    QSIDE_CASTLE: 64
  };

  const RANK_1 = 7;
  const RANK_2 = 6;
  const RANK_7 = 1;
  const RANK_8 = 0;

  const SQUARES = {
    a8:   0, b8:   1, c8:   2, d8:   3, e8:   4, f8:   5, g8:   6, h8:   7,
    a7:  16, b7:  17, c7:  18, d7:  19, e7:  20, f7:  21, g7:  22, h7:  23,
    a6:  32, b6:  33, c6:  34, d6:  35, e6:  36, f6:  37, g6:  38, h6:  39,
    a5:  48, b5:  49, c5:  50, d5:  51, e5:  52, f5:  53, g5:  54, h5:  55,
    a4:  64, b4:  65, c4:  66, d4:  67, e4:  68, f4:  69, g4:  70, h4:  71,
    a3:  80, b3:  81, c3:  82, d3:  83, e3:  84, f3:  85, g3:  86, h3:  87,
    a2:  96, b2:  97, c2:  98, d2:  99, e2: 100, f2: 101, g2: 102, h2: 103,
    a1: 112, b1: 113, c1: 114, d1: 115, e1: 116, f1: 117, g1: 118, h1: 119
  };

  const ROOKS = {
    w: [{square: SQUARES.a1, flag: BITS.QSIDE_CASTLE},
        {square: SQUARES.h1, flag: BITS.KSIDE_CASTLE}],
    b: [{square: SQUARES.a8, flag: BITS.QSIDE_CASTLE},
        {square: SQUARES.h8, flag: BITS.KSIDE_CASTLE}]
  };

  class Chess {
    constructor(fen) {
      this.board = new Array(128);
      this.kings = {w: EMPTY, b: EMPTY};
      this.turn = WHITE;
      this.castling = {w: 0, b: 0};
      this.ep_square = EMPTY;
      this.half_moves = 0;
      this.move_number = 1;
      this.history_list = [];
      this.header_info = {};

      if (typeof fen === 'undefined') {
        this.load(DEFAULT_POSITION);
      } else {
        this.load(fen);
      }
    }

    clear() {
      this.board = new Array(128);
      this.kings = {w: EMPTY, b: EMPTY};
      this.turn = WHITE;
      this.castling = {w: 0, b: 0};
      this.ep_square = EMPTY;
      this.half_moves = 0;
      this.move_number = 1;
      this.history_list = [];
      this.header_info = {};
      this.update_setup(this.generate_fen());
    }

    reset() {
      this.load(DEFAULT_POSITION);
    }

    load(fen) {
      const tokens = fen.split(/\s+/);
      const position = tokens[0];
      let square = 0;

      if (!this.validate_fen(fen).valid) {
        return false;
      }

      this.clear();

      for (let i = 0; i < position.length; i++) {
        const piece = position.charAt(i);

        if (piece === '/') {
          square += 8;
        } else if (is_digit(piece)) {
          square += parseInt(piece, 10);
        } else {
          const color = (piece < 'a') ? WHITE : BLACK;
          this.put({type: piece.toLowerCase(), color: color}, algebraic(square));
          square++;
        }
      }

      this.turn = tokens[1];

      if (tokens[2].indexOf('K') > -1) {
        this.castling.w |= BITS.KSIDE_CASTLE;
      }
      if (tokens[2].indexOf('Q') > -1) {
        this.castling.w |= BITS.QSIDE_CASTLE;
      }
      if (tokens[2].indexOf('k') > -1) {
        this.castling.b |= BITS.KSIDE_CASTLE;
      }
      if (tokens[2].indexOf('q') > -1) {
        this.castling.b |= BITS.QSIDE_CASTLE;
      }

      this.ep_square = (tokens[3] === '-') ? EMPTY : SQUARES[tokens[3]];
      this.half_moves = parseInt(tokens[4], 10);
      this.move_number = parseInt(tokens[5], 10);

      this.update_setup(this.generate_fen());

      return true;
    }

    validate_fen(fen) {
      const errors = {
        0: 'No errors.',
        1: 'FEN string must contain six space-delimited fields.',
        2: '6th field (move number) must be a positive integer.',
        3: '5th field (half move counter) must be a non-negative integer.',
        4: '4th field (en-passant square) is invalid.',
        5: '3rd field (castling availability) is invalid.',
        6: '2nd field (turn) is invalid.',
        7: '1st field (piece positions) does not contain 8 \'/\'-delimited rows.',
        8: 'The piece positions field contains invalid characters.',
        9: 'One of the rows in piece positions has too many squares.',
        10: 'One of the rows in piece positions has too few squares.'
      };

      const tokens = fen.split(/\s+/);
      if (tokens.length !== 6) {
        return {valid: false, error_number: 1, error: errors[1]};
      }

      if (isNaN(tokens[5]) || (parseInt(tokens[5], 10) <= 0)) {
        return {valid: false, error_number: 2, error: errors[2]};
      }

      if (isNaN(tokens[4]) || (parseInt(tokens[4], 10) < 0)) {
        return {valid: false, error_number: 3, error: errors[3]};
      }

      if (!/^(-|[a-h][36])$/.test(tokens[3])) {
        return {valid: false, error_number: 4, error: errors[4]};
      }

      if (!/^(KQ?k?q?|Qk?q?|kq?|q|-)$/.test(tokens[2])) {
        return {valid: false, error_number: 5, error: errors[5]};
      }

      if (!/^(w|b)$/.test(tokens[1])) {
        return {valid: false, error_number: 6, error: errors[6]};
      }

      const rows = tokens[0].split('/');
      if (rows.length !== 8) {
        return {valid: false, error_number: 7, error: errors[7]};
      }

      for (let i = 0; i < rows.length; i++) {
        let sum_fields = 0;
        let previous_was_number = false;

        for (let k = 0; k < rows[i].length; k++) {
          if (!isNaN(rows[i][k])) {
            if (previous_was_number) {
              return {valid: false, error_number: 8, error: errors[8]};
            }
            sum_fields += parseInt(rows[i][k], 10);
            previous_was_number = true;
          } else {
            if (!/^[prnbqkPRNBQK]$/.test(rows[i][k])) {
              return {valid: false, error_number: 8, error: errors[8]};
            }
            sum_fields += 1;
            previous_was_number = false;
          }
        }
        if (sum_fields !== 8) {
          return {valid: false, error_number: sum_fields > 8 ? 9 : 10, error: errors[sum_fields > 8 ? 9 : 10]};
        }
      }

      return {valid: true, error_number: 0, error: errors[0]};
    }

    generate_fen() {
      let empty = 0;
      let fen = '';

      for (let i = SQUARES.a8; i <= SQUARES.h1; i++) {
        if (this.board[i] == null) {
          empty++;
        } else {
          if (empty > 0) {
            fen += empty;
            empty = 0;
          }
          const color = this.board[i].color;
          const piece = this.board[i].type;

          fen += (color === WHITE) ? piece.toUpperCase() : piece.toLowerCase();
        }

        if ((i + 1) & 0x88) {
          if (empty > 0) {
            fen += empty;
          }

          if (i !== SQUARES.h1) {
            fen += '/';
          }

          empty = 0;
          i += 8;
        }
      }

      let cflags = '';
      if (this.castling[WHITE] & BITS.KSIDE_CASTLE) { cflags += 'K'; }
      if (this.castling[WHITE] & BITS.QSIDE_CASTLE) { cflags += 'Q'; }
      if (this.castling[BLACK] & BITS.KSIDE_CASTLE) { cflags += 'k'; }
      if (this.castling[BLACK] & BITS.QSIDE_CASTLE) { cflags += 'q'; }

      cflags = cflags || '-';
      const epflags = (this.ep_square === EMPTY) ? '-' : algebraic(this.ep_square);

      return [fen, this.turn, cflags, epflags, this.half_moves, this.move_number].join(' ');
    }

    fen() {
      return this.generate_fen();
    }

    update_setup(fen) {
      if (this.history_list.length > 0) return;
      if (fen !== DEFAULT_POSITION) {
        this.header_info['SetUp'] = '1';
        this.header_info['FEN'] = fen;
      } else {
        delete this.header_info['SetUp'];
        delete this.header_info['FEN'];
      }
    }

    get(square) {
      const piece = this.board[SQUARES[square]];
      return (piece) ? {type: piece.type, color: piece.color} : null;
    }

    put(piece, square) {
      if (!('type' in piece && 'color' in piece)) return false;
      if (SYMBOLS.indexOf(piece.type.toLowerCase()) === -1) return false;
      if (!(square in SQUARES)) return false;

      const sq = SQUARES[square];
      if (piece.type === KING && !(this.kings[piece.color] === EMPTY || this.kings[piece.color] === sq)) {
        return false;
      }

      this.board[sq] = {type: piece.type, color: piece.color};
      if (piece.type === KING) {
        this.kings[piece.color] = sq;
      }

      this.update_setup(this.generate_fen());
      return true;
    }

    remove(square) {
      const piece = this.get(square);
      this.board[SQUARES[square]] = null;
      if (piece && piece.type === KING) {
        this.kings[piece.color] = EMPTY;
      }
      this.update_setup(this.generate_fen());
      return piece;
    }

    build_move(board, from, to, flags, promotion) {
      const move = {
        color: this.turn,
        from: from,
        to: to,
        flags: flags,
        piece: board[from].type
      };

      if (promotion) {
        move.flags |= BITS.PROMOTION;
        move.promotion = promotion;
      }

      if (board[to]) {
        move.captured = board[to].type;
      } else if (flags & BITS.EP_CAPTURE) {
        move.captured = PAWN;
      }
      return move;
    }

    generate_moves(options) {
      const moves = [];
      const us = this.turn;
      const them = swap_color(us);
      const second_rank = {b: RANK_7, w: RANK_2};

      let first_sq = SQUARES.a8;
      let last_sq = SQUARES.h1;
      let single_square = false;

      const legal = (typeof options !== 'undefined' && 'legal' in options) ? options.legal : true;

      if (typeof options !== 'undefined' && 'square' in options) {
        if (options.square in SQUARES) {
          first_sq = last_sq = SQUARES[options.square];
          single_square = true;
        } else {
          return [];
        }
      }

      for (let i = first_sq; i <= last_sq; i++) {
        if (i & 0x88) { i += 7; continue; }

        const piece = this.board[i];
        if (piece == null || piece.color !== us) continue;

        if (piece.type === PAWN) {
          let square = i + PAWN_OFFSETS[us][0];
          if (this.board[square] == null) {
            this.add_move(moves, this.build_move(this.board, i, square, BITS.NORMAL));

            square = i + PAWN_OFFSETS[us][1];
            if (second_rank[us] === rank(i) && this.board[square] == null) {
              this.add_move(moves, this.build_move(this.board, i, square, BITS.BIG_PAWN));
            }
          }

          for (let j = 2; j < 4; j++) {
            square = i + PAWN_OFFSETS[us][j];
            if (square & 0x88) continue;

            if (this.board[square] != null && this.board[square].color === them) {
              this.add_move(moves, this.build_move(this.board, i, square, BITS.CAPTURE));
            } else if (square === this.ep_square) {
              this.add_move(moves, this.build_move(this.board, i, this.ep_square, BITS.EP_CAPTURE));
            }
          }
        } else {
          for (let j = 0, len = PIECE_OFFSETS[piece.type].length; j < len; j++) {
            const offset = PIECE_OFFSETS[piece.type][j];
            let square = i;

            while (true) {
              square += offset;
              if (square & 0x88) break;

              if (this.board[square] == null) {
                this.add_move(moves, this.build_move(this.board, i, square, BITS.NORMAL));
              } else {
                if (this.board[square].color === us) break;
                this.add_move(moves, this.build_move(this.board, i, square, BITS.CAPTURE));
                break;
              }

              if (piece.type === 'n' || piece.type === 'k') break;
            }
          }
        }
      }

      if (!single_square || last_sq === this.kings[us]) {
        if (this.castling[us] & BITS.KSIDE_CASTLE) {
          const castling_from = this.kings[us];
          const castling_to = castling_from + 2;

          if (this.board[castling_from + 1] == null &&
              this.board[castling_to] == null &&
              !this.attacked(them, this.kings[us]) &&
              !this.attacked(them, castling_from + 1) &&
              !this.attacked(them, castling_to)) {
            this.add_move(moves, this.build_move(this.board, this.kings[us], castling_to, BITS.KSIDE_CASTLE));
          }
        }

        if (this.castling[us] & BITS.QSIDE_CASTLE) {
          const castling_from = this.kings[us];
          const castling_to = castling_from - 2;

          if (this.board[castling_from - 1] == null &&
              this.board[castling_from - 2] == null &&
              this.board[castling_from - 3] == null &&
              !this.attacked(them, this.kings[us]) &&
              !this.attacked(them, castling_from - 1) &&
              !this.attacked(them, castling_to)) {
            this.add_move(moves, this.build_move(this.board, this.kings[us], castling_to, BITS.QSIDE_CASTLE));
          }
        }
      }

      if (!legal) {
        return moves;
      }

      const legal_moves = [];
      for (let i = 0, len = moves.length; i < len; i++) {
        this.make_move(moves[i]);
        if (!this.king_attacked(us)) {
          legal_moves.push(moves[i]);
        }
        this.undo_move();
      }

      return legal_moves;
    }

    add_move(moves, move) {
      if (move.piece === PAWN && (rank(move.to) === RANK_8 || rank(move.to) === RANK_1)) {
        const pieces = [QUEEN, ROOK, BISHOP, KNIGHT];
        for (let i = 0; i < pieces.length; i++) {
          const move_copy = clone_move(move);
          move_copy.flags |= BITS.PROMOTION;
          move_copy.promotion = pieces[i];
          moves.push(move_copy);
        }
      } else {
        moves.push(move);
      }
    }

    attacked(color, square) {
      if (typeof square === 'string') {
        square = SQUARES[square];
        if (square === undefined) return false;
      }

      // 1. Pawns of target color
      const pawnOffsets = color === WHITE ? [15, 17] : [-15, -17];
      for (let p = 0; p < pawnOffsets.length; p++) {
        const sq = square + pawnOffsets[p];
        if (!(sq & 0x88)) {
          const piece = this.board[sq];
          if (piece && piece.color === color && piece.type === PAWN) return true;
        }
      }

      // 2. Knights
      const knightOffsets = [-18, -33, -31, -14, 18, 33, 31, 14];
      for (let n = 0; n < knightOffsets.length; n++) {
        const sq = square + knightOffsets[n];
        if (!(sq & 0x88)) {
          const piece = this.board[sq];
          if (piece && piece.color === color && piece.type === KNIGHT) return true;
        }
      }

      // 3. King
      const kingOffsets = [-17, -16, -15, 1, 17, 16, 15, -1];
      for (let k = 0; k < kingOffsets.length; k++) {
        const sq = square + kingOffsets[k];
        if (!(sq & 0x88)) {
          const piece = this.board[sq];
          if (piece && piece.color === color && piece.type === KING) return true;
        }
      }

      // 4. Diagonals (Bishop & Queen)
      const diagOffsets = [-17, -15, 17, 15];
      for (let d = 0; d < diagOffsets.length; d++) {
        const off = diagOffsets[d];
        let sq = square + off;
        while (!(sq & 0x88)) {
          const piece = this.board[sq];
          if (piece) {
            if (piece.color === color && (piece.type === BISHOP || piece.type === QUEEN)) return true;
            break;
          }
          sq += off;
        }
      }

      // 5. Orthogonals (Rook & Queen)
      const straightOffsets = [-16, 1, 16, -1];
      for (let s = 0; s < straightOffsets.length; s++) {
        const off = straightOffsets[s];
        let sq = square + off;
        while (!(sq & 0x88)) {
          const piece = this.board[sq];
          if (piece) {
            if (piece.color === color && (piece.type === ROOK || piece.type === QUEEN)) return true;
            break;
          }
          sq += off;
        }
      }

      return false;
    }

    king_attacked(color) {
      return this.attacked(swap_color(color), this.kings[color]);
    }

    in_check() {
      return this.king_attacked(this.turn);
    }

    in_checkmate() {
      return this.in_check() && this.generate_moves().length === 0;
    }

    in_stalemate() {
      return !this.in_check() && this.generate_moves().length === 0;
    }

    insufficient_material() {
      const pieces = {};
      const bishops = [];
      let num_pieces = 0;
      let sq_color = 0;

      for (let i = SQUARES.a8; i <= SQUARES.h1; i++) {
        sq_color = (sq_color + 1) % 2;
        if (i & 0x88) { i += 7; continue; }

        const piece = this.board[i];
        if (piece) {
          pieces[piece.type] = (piece.type in pieces) ? pieces[piece.type] + 1 : 1;
          if (piece.type === BISHOP) {
            bishops.push(sq_color);
          }
          num_pieces++;
        }
      }

      if (num_pieces === 2) { return true; }
      else if (num_pieces === 3 && (pieces[BISHOP] === 1 || pieces[KNIGHT] === 1)) { return true; }
      else if (num_pieces === pieces[BISHOP] + 2) {
        let sum = 0;
        const len = bishops.length;
        for (let i = 0; i < len; i++) { sum += bishops[i]; }
        if (sum === 0 || sum === len) { return true; }
      }

      return false;
    }

    in_threefold_repetition() {
      const hash = {};
      const moves = [];
      let repetition = false;

      while (true) {
        const move = this.undo_move();
        if (!move) break;
        moves.push(move);
      }

      while (true) {
        const fen = this.generate_fen().split(' ').slice(0, 4).join(' ');
        hash[fen] = (fen in hash) ? hash[fen] + 1 : 1;
        if (hash[fen] >= 3) {
          repetition = true;
        }

        if (moves.length === 0) break;
        this.make_move(moves.pop());
      }

      return repetition;
    }

    in_draw() {
      return this.half_moves >= 100 ||
             this.in_stalemate() ||
             this.insufficient_material() ||
             this.in_threefold_repetition();
    }

    game_over() {
      return this.half_moves >= 100 ||
             this.in_checkmate() ||
             this.in_stalemate() ||
             this.insufficient_material() ||
             this.in_threefold_repetition();
    }

    moves(options) {
      const ugly_moves = this.generate_moves(options);
      const moves = [];

      for (let i = 0, len = ugly_moves.length; i < len; i++) {
        if (typeof options !== 'undefined' && 'verbose' in options && options.verbose) {
          moves.push(this.make_pretty(ugly_moves[i]));
        } else {
          moves.push(this.move_to_san(ugly_moves[i], ugly_moves));
        }
      }

      return moves;
    }

    make_move(move) {
      const us = this.turn;
      const them = swap_color(us);
      this.history_list.push({
        move: move,
        kings: {b: this.kings.b, w: this.kings.w},
        turn: this.turn,
        castling: {b: this.castling.b, w: this.castling.w},
        ep_square: this.ep_square,
        half_moves: this.half_moves,
        move_number: this.move_number
      });

      this.board[move.to] = this.board[move.from];
      this.board[move.from] = null;

      if (move.flags & BITS.EP_CAPTURE) {
        if (this.turn === BLACK) {
          this.board[move.to - 16] = null;
        } else {
          this.board[move.to + 16] = null;
        }
      }

      if (move.flags & BITS.PROMOTION) {
        this.board[move.to] = {type: move.promotion, color: us};
      }

      if (this.board[move.to].type === KING) {
        this.kings[this.board[move.to].color] = move.to;

        if (move.flags & BITS.KSIDE_CASTLE) {
          const castling_to = move.to - 1;
          const castling_from = move.to + 1;
          this.board[castling_to] = this.board[castling_from];
          this.board[castling_from] = null;
        } else if (move.flags & BITS.QSIDE_CASTLE) {
          const castling_to = move.to + 1;
          const castling_from = move.to - 2;
          this.board[castling_to] = this.board[castling_from];
          this.board[castling_from] = null;
        }

        this.castling[us] = '';
      }

      if (this.castling[us]) {
        for (let i = 0, len = ROOKS[us].length; i < len; i++) {
          if (move.from === ROOKS[us][i].square &&
              this.castling[us] & ROOKS[us][i].flag) {
            this.castling[us] ^= ROOKS[us][i].flag;
            break;
          }
        }
      }

      if (this.castling[them]) {
        for (let i = 0, len = ROOKS[them].length; i < len; i++) {
          if (move.to === ROOKS[them][i].square &&
              this.castling[them] & ROOKS[them][i].flag) {
            this.castling[them] ^= ROOKS[them][i].flag;
            break;
          }
        }
      }

      if (move.flags & BITS.BIG_PAWN) {
        if (this.turn === 'b') {
          this.ep_square = move.to - 16;
        } else {
          this.ep_square = move.to + 16;
        }
      } else {
        this.ep_square = EMPTY;
      }

      if (move.piece === PAWN) {
        this.half_moves = 0;
      } else if (move.flags & (BITS.CAPTURE | BITS.EP_CAPTURE)) {
        this.half_moves = 0;
      } else {
        this.half_moves++;
      }

      if (this.turn === BLACK) {
        this.move_number++;
      }
      this.turn = swap_color(this.turn);
    }

    undo_move() {
      const old = this.history_list.pop();
      if (old == null) { return null; }

      const move = old.move;
      this.kings = old.kings;
      this.turn = old.turn;
      this.castling = old.castling;
      this.ep_square = old.ep_square;
      this.half_moves = old.half_moves;
      this.move_number = old.move_number;

      const us = this.turn;
      const them = swap_color(this.turn);

      this.board[move.from] = this.board[move.to];
      this.board[move.from].type = move.piece;
      this.board[move.to] = null;

      if (move.flags & BITS.CAPTURE) {
        this.board[move.to] = {type: move.captured, color: them};
      } else if (move.flags & BITS.EP_CAPTURE) {
        let index;
        if (us === BLACK) {
          index = move.to - 16;
        } else {
          index = move.to + 16;
        }
        this.board[index] = {type: PAWN, color: them};
      }

      if (move.flags & (BITS.KSIDE_CASTLE | BITS.QSIDE_CASTLE)) {
        let castling_to, castling_from;
        if (move.flags & BITS.KSIDE_CASTLE) {
          castling_to = move.to + 1;
          castling_from = move.to - 1;
        } else if (move.flags & BITS.QSIDE_CASTLE) {
          castling_to = move.to - 2;
          castling_from = move.to + 1;
        }

        this.board[castling_to] = this.board[castling_from];
        this.board[castling_from] = null;
      }

      return move;
    }

    undo() {
      const move = this.undo_move();
      return (move) ? this.make_pretty(move) : null;
    }

    move_to_san(move, moves) {
      let output = '';

      if (move.flags & BITS.KSIDE_CASTLE) {
        output = 'O-O';
      } else if (move.flags & BITS.QSIDE_CASTLE) {
        output = 'O-O-O';
      } else {
        const disambiguator = get_disambiguator(move, moves);

        if (move.piece !== PAWN) {
          output += move.piece.toUpperCase() + disambiguator;
        }

        if (move.flags & (BITS.CAPTURE | BITS.EP_CAPTURE)) {
          if (move.piece === PAWN) {
            output += algebraic(move.from)[0];
          }
          output += 'x';
        }

        output += algebraic(move.to);

        if (move.flags & BITS.PROMOTION) {
          output += '=' + move.promotion.toUpperCase();
        }
      }

      this.make_move(move);
      if (this.in_check()) {
        if (this.in_checkmate()) {
          output += '#';
        } else {
          output += '+';
        }
      }
      this.undo_move();

      return output;
    }

    move(move, options) {
      let move_obj = null;
      const moves = this.generate_moves();

      if (typeof move === 'string') {
        const clean = move.replace(/[+#?!]/g, '').trim();
        for (let i = 0; i < moves.length; i++) {
          if (clean === this.move_to_san(moves[i], moves).replace(/[+#?!]/g, '')) {
            move_obj = moves[i];
            break;
          }
        }
      } else if (typeof move === 'object') {
        for (let i = 0; i < moves.length; i++) {
          if (move.from === algebraic(moves[i].from) &&
              move.to === algebraic(moves[i].to) &&
              (!('promotion' in moves[i]) || move.promotion === moves[i].promotion)) {
            move_obj = moves[i];
            break;
          }
        }
      }

      if (!move_obj) {
        return null;
      }

      const pretty_move = this.make_pretty(move_obj);
      this.make_move(move_obj);
      return pretty_move;
    }

    make_pretty(ugly_move) {
      const move = clone_move(ugly_move);
      move.san = this.move_to_san(ugly_move, this.generate_moves({legal: true}));
      move.to = algebraic(move.to);
      move.from = algebraic(move.from);

      let flags = '';
      for (const flag in BITS) {
        if (BITS[flag] & move.flags) {
          flags += FLAGS[flag];
        }
      }
      move.flags = flags;
      return move;
    }

    history(options) {
      const reversed_history = [];
      const move_history = [];
      const verbose = (typeof options !== 'undefined' && 'verbose' in options && options.verbose);

      while (this.history_list.length > 0) {
        reversed_history.push(this.undo_move());
      }

      while (reversed_history.length > 0) {
        const move = reversed_history.pop();
        if (verbose) {
          move_history.push(this.make_pretty(move));
        } else {
          move_history.push(this.move_to_san(move, this.generate_moves({legal: true})));
        }
        this.make_move(move);
      }

      return move_history;
    }

    header() {
      for (let i = 0; i < arguments.length; i += 2) {
        if (typeof arguments[i] === 'string' && typeof arguments[i + 1] === 'string') {
          this.header_info[arguments[i]] = arguments[i + 1];
        }
      }
      return this.header_info;
    }

    load_pgn(pgn, options) {
      function mask(str) {
        return str.replace(/\\/g, '\\');
      }

      function parse_pgn_header(header) {
        const header_obj = {};
        const headers = header.split(/\r?\n/);
        for (let i = 0; i < headers.length; i++) {
          const match = headers[i].match(/^\s*\[(\w+)\s+"(.*)"\]\s*$/);
          if (match) {
            header_obj[match[1]] = match[2];
          }
        }
        return header_obj;
      }

      this.reset();

      // Safe header extraction without catastrophic ReDoS regex
      const lastBracket = pgn.lastIndexOf(']');
      let header_string = '';
      let ms = pgn;

      if (lastBracket !== -1) {
        header_string = pgn.substring(0, lastBracket + 1);
        ms = pgn.substring(lastBracket + 1);
      }

      const headers = parse_pgn_header(header_string);
      for (const key in headers) {
        this.header(key, headers[key]);
      }

      if (headers['SetUp'] === '1') {
        if (!('FEN' in headers && this.load(headers['FEN']))) {
          return false;
        }
      }

      // Remove comments and annotations
      ms = ms.replace(/\{[^}]*\}/g, ''); // strip comments
      ms = ms.replace(/;[^\r\n]*/g, ''); // strip end-of-line comments
      ms = ms.replace(/\$\d+/g, ''); // strip NAGs
      ms = ms.replace(/\s+/g, ' ').trim(); // normalize whitespace

      // Parse moves
      const tokens = ms.split(/\s+/);
      for (let i = 0; i < tokens.length; i++) {
        let token = tokens[i].trim();
        if (!token) continue;

        // Skip move numbers like "1.", "1...", "2."
        if (/^\d+\.+$/.test(token)) continue;
        token = token.replace(/^\d+\.+/, '');

        // Check if game end result
        if (POSSIBLE_RESULTS.indexOf(token) > -1) {
          break;
        }

        const move = this.move(token);
        if (move === null) {
          // Attempt stripped annotations
          const stripped = token.replace(/[!?+#]/g, '');
          const alt_move = this.move(stripped);
          if (alt_move === null) {
            console.warn('Failed parsing PGN move:', token);
            return false;
          }
        }
      }

      return true;
    }
  }

  function rank(i) {
    return i >> 4;
  }

  function file(i) {
    return i & 15;
  }

  function algebraic(i) {
    const f = file(i);
    const r = rank(i);
    return 'abcdefgh'.substring(f, f + 1) + '87654321'.substring(r, r + 1);
  }

  function swap_color(c) {
    return c === WHITE ? BLACK : WHITE;
  }

  function is_digit(c) {
    return '0123456789'.indexOf(c) !== -1;
  }

  function clone_move(move) {
    return {
      to: move.to,
      from: move.from,
      color: move.color,
      flags: move.flags,
      piece: move.piece,
      captured: move.captured,
      promotion: move.promotion
    };
  }

  function get_disambiguator(move, moves) {
    const from = move.from;
    const to = move.to;
    const piece = move.piece;

    let ambiguities = 0;
    let same_rank = 0;
    let same_file = 0;

    for (let i = 0, len = moves.length; i < len; i++) {
      const ambig_from = moves[i].from;
      const ambig_to = moves[i].to;
      const ambig_piece = moves[i].piece;

      if (piece === ambig_piece && from !== ambig_from && to === ambig_to) {
        ambiguities++;
        if (rank(from) === rank(ambig_from)) {
          same_rank++;
        }
        if (file(from) === file(ambig_from)) {
          same_file++;
        }
      }
    }

    if (ambiguities > 0) {
      if (same_rank > 0 && same_file > 0) {
        return algebraic(from);
      } else if (same_file > 0) {
        return algebraic(from)[1];
      } else {
        return algebraic(from)[0];
      }
    }

    return '';
  }

  global.Chess = Chess;

})(typeof window !== 'undefined' ? window : this);
