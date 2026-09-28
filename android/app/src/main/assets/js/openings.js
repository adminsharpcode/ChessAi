/**
 * Complete Opening Database (ECO A00 - E99) & Strategic Opening Plans
 * Identifies Book Moves (📖) and explains opening theory
 */
(function(global) {
  'use strict';

  const OPENING_BOOK = [
  {
    "moves": [
      "a3"
    ],
    "eco": "A00",
    "name": "Anderssen's Opening",
    "plan": "A subtle waiting move preparing b4 while watching Black's plan."
  },
  {
    "moves": [
      "a4"
    ],
    "eco": "A00",
    "name": "Ware Opening",
    "plan": "Wing pawn thrust probing queenside space."
  },
  {
    "moves": [
      "b4"
    ],
    "eco": "A00",
    "name": "Polish / Sokolsky Opening",
    "plan": "Aggressive queenside flank expansion aiming for an early fianchetto on b2."
  },
  {
    "moves": [
      "b4",
      "e5",
      "Bb2"
    ],
    "eco": "A00",
    "name": "Sokolsky: Outflank Variation",
    "plan": "Direct pressure against Black's e5 pawn from the flank."
  },
  {
    "moves": [
      "b4",
      "e5",
      "Bb2",
      "Bxb4",
      "Bxe5"
    ],
    "eco": "A00",
    "name": "Sokolsky: Exchange Line",
    "plan": "White trades flank pawn for central pawn and open long diagonal."
  },
  {
    "moves": [
      "g4"
    ],
    "eco": "A00",
    "name": "Grob Opening",
    "plan": "Double-edged kingside expansion targeting f5 and h5."
  },
  {
    "moves": [
      "g4",
      "d5",
      "Bg2",
      "c6",
      "h3"
    ],
    "eco": "A00",
    "name": "Grob: Spike Variation",
    "plan": "Solidifies g4 pawn while controlling the long diagonal."
  },
  {
    "moves": [
      "c3"
    ],
    "eco": "A00",
    "name": "Saragossa Opening",
    "plan": "Solid pawn support preparing a later d4 push."
  },
  {
    "moves": [
      "Nc3"
    ],
    "eco": "A00",
    "name": "Van Geet / Dunst Opening",
    "plan": "Flexible minor piece development preparing e4 or d4."
  },
  {
    "moves": [
      "Nc3",
      "d5",
      "e4",
      "dxe4",
      "Nxe4"
    ],
    "eco": "A00",
    "name": "Van Geet: Dunst Gambit",
    "plan": "White invites open center piece play."
  },
  {
    "moves": [
      "h3"
    ],
    "eco": "A00",
    "name": "Clemenz Opening",
    "plan": "Quiet prophylaxis preventing enemy pieces on g4."
  },
  {
    "moves": [
      "h4"
    ],
    "eco": "A00",
    "name": "Desprez Opening",
    "plan": "Flank probe on the kingside."
  },
  {
    "moves": [
      "Nh3"
    ],
    "eco": "A00",
    "name": "Amar / Paris Opening",
    "plan": "Eccentric knight development preparing g3 and Nf4."
  },
  {
    "moves": [
      "Na3"
    ],
    "eco": "A00",
    "name": "Sodium Attack",
    "plan": "Knight developed to flank, ready to jump to c4."
  },
  {
    "moves": [
      "b3"
    ],
    "eco": "A01",
    "name": "Nimzo-Larsen Attack",
    "plan": "Hypermodern control of central dark squares from b2."
  },
  {
    "moves": [
      "b3",
      "e5",
      "Bb2"
    ],
    "eco": "A01",
    "name": "Nimzo-Larsen: Modern Variation",
    "plan": "Direct fight over the e5 and d4 squares."
  },
  {
    "moves": [
      "b3",
      "e5",
      "Bb2",
      "Nc6"
    ],
    "eco": "A01",
    "name": "Nimzo-Larsen: Modern, 2...Nc6",
    "plan": "Black defends e5 naturally; White prepares e3 and Bb5."
  },
  {
    "moves": [
      "b3",
      "e5",
      "Bb2",
      "Nc6",
      "e3",
      "d5",
      "Bb5"
    ],
    "eco": "A01",
    "name": "Nimzo-Larsen: Pin Line",
    "plan": "White pins the defender of e5 to win central control."
  },
  {
    "moves": [
      "b3",
      "d5",
      "Bb2"
    ],
    "eco": "A01",
    "name": "Nimzo-Larsen: Classical Variation",
    "plan": "White targets e5 and pressurizes Black's d5 outpost."
  },
  {
    "moves": [
      "b3",
      "Nf6",
      "Bb2",
      "g6"
    ],
    "eco": "A01",
    "name": "Nimzo-Larsen: Indian Variation",
    "plan": "Double fianchetto battle across opposing long diagonals."
  },
  {
    "moves": [
      "f4"
    ],
    "eco": "A02",
    "name": "Bird's Opening",
    "plan": "Controls e5 from the flank, aiming for a Dutch Defense in reverse."
  },
  {
    "moves": [
      "f4",
      "e5"
    ],
    "eco": "A02",
    "name": "Bird's Opening: From's Gambit",
    "plan": "A sharp tactical gambit challenging White's weakened kingside diagonals."
  },
  {
    "moves": [
      "f4",
      "e5",
      "fxe5",
      "d6",
      "exd6",
      "Bxd6",
      "Nf3"
    ],
    "eco": "A02",
    "name": "From's Gambit: Main Line",
    "plan": "Black sacrifices a pawn for rapid kingside attack targeting h2 and e1."
  },
  {
    "moves": [
      "f4",
      "d5"
    ],
    "eco": "A03",
    "name": "Bird's Opening: Dutch Variation",
    "plan": "Solid central confrontation fighting for key dark squares."
  },
  {
    "moves": [
      "f4",
      "d5",
      "Nf3",
      "Nf6",
      "e3",
      "g6"
    ],
    "eco": "A03",
    "name": "Bird's: Classical Setup",
    "plan": "White builds an Stonewall formation or kingside attack with Ne5."
  },
  {
    "moves": [
      "Nf3"
    ],
    "eco": "A04",
    "name": "Réti Opening",
    "plan": "Hypermodern control of central squares without committing central pawns early."
  },
  {
    "moves": [
      "Nf3",
      "Nf6"
    ],
    "eco": "A05",
    "name": "Réti: Symmetrical Line",
    "plan": "Both sides develop knights and keep central structures flexible."
  },
  {
    "moves": [
      "Nf3",
      "d5"
    ],
    "eco": "A06",
    "name": "Réti Opening: King's Knight Variation",
    "plan": "Symmetrical struggle where White seeks counterplay against Black's d5 pawn."
  },
  {
    "moves": [
      "Nf3",
      "d5",
      "g3"
    ],
    "eco": "A07",
    "name": "King's Indian Attack (Barcza System)",
    "plan": "White adopts a flexible kingside fianchetto, aiming for e4 and a kingside initiative."
  },
  {
    "moves": [
      "Nf3",
      "d5",
      "g3",
      "Nf6",
      "Bg2",
      "c6",
      "O-O",
      "Bg4"
    ],
    "eco": "A08",
    "name": "King's Indian Attack: Yugoslav Line",
    "plan": "Black develops bishop actively before castling."
  },
  {
    "moves": [
      "Nf3",
      "d5",
      "c4"
    ],
    "eco": "A09",
    "name": "Réti Opening: Réti Gambit",
    "plan": "White offers a flank pawn to deflect Black from the center and control d5."
  },
  {
    "moves": [
      "Nf3",
      "d5",
      "c4",
      "d4"
    ],
    "eco": "A09",
    "name": "Réti: Advance Variation",
    "plan": "Black seizes space with ...d4, which White later undermines with e3 or b4."
  },
  {
    "moves": [
      "Nf3",
      "d5",
      "c4",
      "dxc4",
      "Na3"
    ],
    "eco": "A09",
    "name": "Réti: Accepted Variation",
    "plan": "White quickly recovers the c4 pawn with dynamic piece play."
  },
  {
    "moves": [
      "c4"
    ],
    "eco": "A10",
    "name": "English Opening",
    "plan": "Claims central influence on d5 from the flank, keeping flexible pawn structures."
  },
  {
    "moves": [
      "c4",
      "e6"
    ],
    "eco": "A13",
    "name": "English: Agincourt Defense",
    "plan": "Solid defense keeping options open for ...d5."
  },
  {
    "moves": [
      "c4",
      "Nf6"
    ],
    "eco": "A15",
    "name": "English Opening: Anglo-Indian",
    "plan": "Black maintains flexibility, preparing either ...e6, ...g6, or ...c5."
  },
  {
    "moves": [
      "c4",
      "Nf6",
      "Nf3",
      "c5",
      "g3",
      "b6",
      "Bg2",
      "Bb7"
    ],
    "eco": "A15",
    "name": "English: Hedgehog Prep",
    "plan": "Double fianchetto setup leading to Hedgehog structures."
  },
  {
    "moves": [
      "c4",
      "e5"
    ],
    "eco": "A20",
    "name": "English Opening: King's English",
    "plan": "Reversed Sicilian setup where Black takes central space and White counters on the queenside."
  },
  {
    "moves": [
      "c4",
      "e5",
      "Nc3"
    ],
    "eco": "A21",
    "name": "English: Reversed Sicilian",
    "plan": "Direct control of d5 and early pressure on the central diagonal."
  },
  {
    "moves": [
      "c4",
      "e5",
      "Nc3",
      "Nf6",
      "Nf3",
      "Nc6"
    ],
    "eco": "A28",
    "name": "English: Four Knights Variation",
    "plan": "Classical piece development fighting for central dominance."
  },
  {
    "moves": [
      "c4",
      "e5",
      "Nc3",
      "Nc6",
      "g3",
      "g6",
      "Bg2",
      "Bg7"
    ],
    "eco": "A25",
    "name": "English: Closed System",
    "plan": "Both sides fianchetto king's bishops and maneuver for long-term breaks."
  },
  {
    "moves": [
      "c4",
      "c5"
    ],
    "eco": "A30",
    "name": "English Opening: Symmetrical Variation",
    "plan": "Mirrored pawn battle for d4 and d5 control."
  },
  {
    "moves": [
      "c4",
      "c5",
      "Nf3",
      "Nf6",
      "d4",
      "cxd4",
      "Nxd4"
    ],
    "eco": "A34",
    "name": "English: Symmetrical Open",
    "plan": "White opens the center and aims for active piece play."
  },
  {
    "moves": [
      "c4",
      "c5",
      "Nc3",
      "Nc6",
      "g3",
      "g6",
      "Bg2",
      "Bg7"
    ],
    "eco": "A36",
    "name": "English: Symmetrical Fianchetto",
    "plan": "Deep strategic maneuver battle across the central diagonals."
  },
  {
    "moves": [
      "d4"
    ],
    "eco": "A40",
    "name": "Queen's Pawn Opening",
    "plan": "Establishes a solid central pawn on d4, controlling e5 and opening diagonals."
  },
  {
    "moves": [
      "d4",
      "e5"
    ],
    "eco": "A40",
    "name": "Englund Gambit",
    "plan": "Tactical gambit testing White's knowledge of the e5 pawn defense."
  },
  {
    "moves": [
      "d4",
      "e5",
      "dxe5",
      "Nc6",
      "Nf3",
      "Qe7"
    ],
    "eco": "A40",
    "name": "Englund Gambit: Main Line",
    "plan": "Black attacks e5 three times; White holds with Bf4 or develops rapidly."
  },
  {
    "moves": [
      "d4",
      "c5"
    ],
    "eco": "A43",
    "name": "Old Benoni Defense",
    "plan": "Immediate strike against White's d4 pawn, fighting for dark-square control."
  },
  {
    "moves": [
      "d4",
      "c5",
      "d5",
      "e5"
    ],
    "eco": "A44",
    "name": "Old Benoni: Czech Style",
    "plan": "Locks the center and prepares kingside piece play."
  },
  {
    "moves": [
      "d4",
      "Nf6"
    ],
    "eco": "A45",
    "name": "Indian Defense",
    "plan": "Hypermodern defense preventing White's immediate e4 push."
  },
  {
    "moves": [
      "d4",
      "Nf6",
      "Bg5"
    ],
    "eco": "A45",
    "name": "Trompowsky Attack",
    "plan": "Aggressive bishop pin targeting Black's knight to disrupt Black's pawn structure."
  },
  {
    "moves": [
      "d4",
      "Nf6",
      "Bg5",
      "e6"
    ],
    "eco": "A45",
    "name": "Trompowsky: Classical Defense",
    "plan": "Black prepares ...d5 or ...c5 while neutralizing the pin."
  },
  {
    "moves": [
      "d4",
      "Nf6",
      "Bg5",
      "Ne4"
    ],
    "eco": "A45",
    "name": "Trompowsky: 2...Ne4 Counter",
    "plan": "Attacks the bishop immediately and fights for dynamic initiative."
  },
  {
    "moves": [
      "d4",
      "Nf6",
      "Nf3",
      "e6",
      "Bg5"
    ],
    "eco": "A46",
    "name": "Torre Attack",
    "plan": "Solid development placing the bishop outside the pawn chain before playing e3."
  },
  {
    "moves": [
      "d4",
      "Nf6",
      "Nf3",
      "b6",
      "g3",
      "Bb7",
      "Bg2"
    ],
    "eco": "A48",
    "name": "King's Indian / Queen's Indian Hybrid",
    "plan": "Fianchetto battle with flexible central pawn plans."
  },
  {
    "moves": [
      "d4",
      "Nf6",
      "c4",
      "e5"
    ],
    "eco": "A51",
    "name": "Budapest Gambit",
    "plan": "Tactical gambit challenging White's central control immediately."
  },
  {
    "moves": [
      "d4",
      "Nf6",
      "c4",
      "e5",
      "dxe5",
      "Ng4"
    ],
    "eco": "A52",
    "name": "Budapest Gambit: Adler Variation",
    "plan": "Black knight hunts the e5 pawn; tactical piece play ensues."
  },
  {
    "moves": [
      "d4",
      "Nf6",
      "c4",
      "c5",
      "d5"
    ],
    "eco": "A56",
    "name": "Benoni Defense",
    "plan": "White claims space on d5 while Black prepares queenside counterplay."
  },
  {
    "moves": [
      "d4",
      "Nf6",
      "c4",
      "c5",
      "d5",
      "b5"
    ],
    "eco": "A57",
    "name": "Benko Gambit",
    "plan": "Black sacrifices a flank pawn for permanent queenside pressure along the a- and b-files."
  },
  {
    "moves": [
      "d4",
      "Nf6",
      "c4",
      "c5",
      "d5",
      "b5",
      "cxb5",
      "a6"
    ],
    "eco": "A58",
    "name": "Benko Gambit: Half-Accepted",
    "plan": "Black continues the sacrifice to open the a- and b-files."
  },
  {
    "moves": [
      "d4",
      "Nf6",
      "c4",
      "c5",
      "d5",
      "b5",
      "cxb5",
      "a6",
      "bxa6",
      "g6",
      "Nc3",
      "Bxa6"
    ],
    "eco": "A59",
    "name": "Benko Gambit: Fully Accepted",
    "plan": "Long-term queenside pressure against White's a2 and b2 pawns."
  },
  {
    "moves": [
      "d4",
      "Nf6",
      "c4",
      "c5",
      "d5",
      "e6",
      "Nc3",
      "exd5",
      "cxd5",
      "d6"
    ],
    "eco": "A60",
    "name": "Modern Benoni",
    "plan": "Dynamic asymmetrical struggle: White has central pawns, Black has an active queenside pawn majority."
  },
  {
    "moves": [
      "d4",
      "Nf6",
      "c4",
      "c5",
      "d5",
      "e6",
      "Nc3",
      "exd5",
      "cxd5",
      "d6",
      "e4",
      "g6",
      "Nf3",
      "Bg7"
    ],
    "eco": "A70",
    "name": "Modern Benoni: Classical",
    "plan": "White aims for e5 central break; Black counters on the e-file and queenside."
  },
  {
    "moves": [
      "d4",
      "f5"
    ],
    "eco": "A80",
    "name": "Dutch Defense",
    "plan": "Black stakes a claim on e4 and aims for an aggressive kingside attack."
  },
  {
    "moves": [
      "d4",
      "f5",
      "Bg5"
    ],
    "eco": "A80",
    "name": "Dutch Defense: Hopton Attack",
    "plan": "Annoying bishop pin preventing ...Nf6."
  },
  {
    "moves": [
      "d4",
      "f5",
      "e4"
    ],
    "eco": "A83",
    "name": "Dutch: Staunton Gambit",
    "plan": "White offers a central pawn to blow open lines against the uncastled Black king."
  },
  {
    "moves": [
      "d4",
      "f5",
      "g3",
      "Nf6",
      "Bg2",
      "g6"
    ],
    "eco": "A87",
    "name": "Leningrad Dutch",
    "plan": "Combines Dutch king-safety pressure with a King's Indian style kingside fianchetto."
  },
  {
    "moves": [
      "d4",
      "f5",
      "c4",
      "e6",
      "g3",
      "d5",
      "Bg2",
      "c6"
    ],
    "eco": "A90",
    "name": "Dutch Defense: Stonewall",
    "plan": "Immovable pawn wedge on d5, e6, and f5, creating strong grip on e4."
  },
  {
    "moves": [
      "d4",
      "f5",
      "c4",
      "Nf6",
      "g3",
      "e6",
      "Bg2",
      "Be7",
      "Nf3",
      "O-O",
      "O-O",
      "d6"
    ],
    "eco": "A96",
    "name": "Classical Dutch",
    "plan": "Patient setup preparing ...Qe8 and ...e5 central breakthrough."
  },
  {
    "moves": [
      "e4"
    ],
    "eco": "B00",
    "name": "King's Pawn Opening",
    "plan": "Controls central squares d5 and f5, opening paths for Queen and Bishop."
  },
  {
    "moves": [
      "e4",
      "Nc6"
    ],
    "eco": "B00",
    "name": "Nimzowitsch Defense",
    "plan": "Unorthodox knight defense applying pressure to d4 and e5."
  },
  {
    "moves": [
      "e4",
      "b6"
    ],
    "eco": "B00",
    "name": "Owen's Defense",
    "plan": "Fianchettoes Queen's Bishop to b7 to pressurize e4."
  },
  {
    "moves": [
      "e4",
      "a6"
    ],
    "eco": "B00",
    "name": "St. George Defense",
    "plan": "Prepares b5 to expand on the queenside."
  },
  {
    "moves": [
      "e4",
      "d5"
    ],
    "eco": "B01",
    "name": "Scandinavian Defense",
    "plan": "Direct central challenge to White's e4 pawn on move 1."
  },
  {
    "moves": [
      "e4",
      "d5",
      "exd5",
      "Qxd5",
      "Nc3",
      "Qa5"
    ],
    "eco": "B01",
    "name": "Scandinavian: Main Line",
    "plan": "Black queen retreats to a5 while maintaining active piece development."
  },
  {
    "moves": [
      "e4",
      "d5",
      "exd5",
      "Qxd5",
      "Nc3",
      "Qd6"
    ],
    "eco": "B01",
    "name": "Scandinavian: Gubinsky-Melts (3...Qd6)",
    "plan": "Queen on d6 supports rapid development and queenside castling."
  },
  {
    "moves": [
      "e4",
      "d5",
      "exd5",
      "Qxd5",
      "Nc3",
      "Qd8"
    ],
    "eco": "B01",
    "name": "Scandinavian: 3...Qd8",
    "plan": "Safe retreat; Black aims for solid Caro-Kann like pawn structure."
  },
  {
    "moves": [
      "e4",
      "d5",
      "exd5",
      "Nf6"
    ],
    "eco": "B01",
    "name": "Scandinavian: Modern Variation",
    "plan": "Recovers the d5 pawn with a knight to avoid early queen exposure."
  },
  {
    "moves": [
      "e4",
      "d5",
      "exd5",
      "Nf6",
      "d4",
      "Nxd5",
      "Nf3",
      "g6"
    ],
    "eco": "B01",
    "name": "Scandinavian: Modern Fianchetto",
    "plan": "Black develops bishop to g7 to put pressure on White's d4 center."
  },
  {
    "moves": [
      "e4",
      "Nf6"
    ],
    "eco": "B02",
    "name": "Alekhine's Defense",
    "plan": "Provokes White's central pawns forward to later undermine them with ...d6."
  },
  {
    "moves": [
      "e4",
      "Nf6",
      "e5",
      "Nd5",
      "d4",
      "d6"
    ],
    "eco": "B03",
    "name": "Alekhine: Four Pawns Preview",
    "plan": "White gains massive central space; Black prepares to attack the overextended pawn center."
  },
  {
    "moves": [
      "e4",
      "Nf6",
      "e5",
      "Nd5",
      "d4",
      "d6",
      "c4",
      "Nb6",
      "f4"
    ],
    "eco": "B03",
    "name": "Alekhine: Four Pawns Attack",
    "plan": "Aggressive pawn charge by White; Black seeks counterplay with ...dxe5 and ...Nc6."
  },
  {
    "moves": [
      "e4",
      "Nf6",
      "e5",
      "Nd5",
      "d4",
      "d6",
      "Nf3"
    ],
    "eco": "B04",
    "name": "Alekhine: Modern Variation",
    "plan": "White solidifies central control without pushing too aggressively."
  },
  {
    "moves": [
      "e4",
      "Nf6",
      "e5",
      "Nd5",
      "d4",
      "d6",
      "Nf3",
      "Bg4",
      "Be2",
      "e6"
    ],
    "eco": "B05",
    "name": "Alekhine: Modern, 4...Bg4",
    "plan": "Pin on the knight challenges White's grip on the center."
  },
  {
    "moves": [
      "e4",
      "g6"
    ],
    "eco": "B06",
    "name": "Modern Defense",
    "plan": "Hypermodern kingside fianchetto waiting to strike at White's center."
  },
  {
    "moves": [
      "e4",
      "g6",
      "d4",
      "Bg7",
      "Nc3",
      "d6"
    ],
    "eco": "B06",
    "name": "Modern: Standard Setup",
    "plan": "Flexible pawn structure allowing ...c6, ...a6, or ...e5."
  },
  {
    "moves": [
      "e4",
      "d6",
      "d4",
      "Nf6",
      "Nc3",
      "g6"
    ],
    "eco": "B07",
    "name": "Pirc Defense",
    "plan": "Flexible defense allowing White central pawns before counter-attacking with ...e5 or ...c5."
  },
  {
    "moves": [
      "e4",
      "d6",
      "d4",
      "Nf6",
      "Nc3",
      "g6",
      "Be3",
      "c6",
      "Qd2"
    ],
    "eco": "B07",
    "name": "Pirc: 150 Attack",
    "plan": "English Attack setup aiming for Bh6 and kingside mating threats."
  },
  {
    "moves": [
      "e4",
      "d6",
      "d4",
      "Nf6",
      "Nc3",
      "g6",
      "f4"
    ],
    "eco": "B09",
    "name": "Pirc Defense: Austrian Attack",
    "plan": "Fierce three-pawn assault aiming for a rapid kingside breakthrough."
  },
  {
    "moves": [
      "e4",
      "d6",
      "d4",
      "Nf6",
      "Nc3",
      "g6",
      "f4",
      "Bg7",
      "Nf3",
      "O-O"
    ],
    "eco": "B09",
    "name": "Pirc: Austrian Main Line",
    "plan": "Sharp tactical theoretical battle over central control."
  },
  {
    "moves": [
      "e4",
      "c6"
    ],
    "eco": "B10",
    "name": "Caro-Kann Defense",
    "plan": "Solid preparation for ...d5, establishing a durable central pawn barrier."
  },
  {
    "moves": [
      "e4",
      "c6",
      "d4",
      "d5"
    ],
    "eco": "B12",
    "name": "Caro-Kann: Classical Setup",
    "plan": "Central confrontation where Black keeps a clean pawn structure and develops the light-squared bishop."
  },
  {
    "moves": [
      "e4",
      "c6",
      "d4",
      "d5",
      "e5"
    ],
    "eco": "B12",
    "name": "Caro-Kann: Advance Variation",
    "plan": "White claims space; Black plays ...Bf5 before locking the pawn chain with ...e6."
  },
  {
    "moves": [
      "e4",
      "c6",
      "d4",
      "d5",
      "e5",
      "Bf5"
    ],
    "eco": "B12",
    "name": "Caro-Kann: Advance, Bishop Out",
    "plan": "Active bishop outside the pawn chain gives Black comfortable equality."
  },
  {
    "moves": [
      "e4",
      "c6",
      "d4",
      "d5",
      "e5",
      "Bf5",
      "h4"
    ],
    "eco": "B12",
    "name": "Caro-Kann: Tal Attack",
    "plan": "White probes the bishop with h4-g4, creating sharp attacking chances."
  },
  {
    "moves": [
      "e4",
      "c6",
      "d4",
      "d5",
      "e5",
      "c5"
    ],
    "eco": "B12",
    "name": "Caro-Kann: Arkell-Khenkin (Advance c5)",
    "plan": "Immediate strike at the base of White's pawn chain on d4."
  },
  {
    "moves": [
      "e4",
      "c6",
      "d4",
      "d5",
      "Nc3",
      "dxe4",
      "Nxe4",
      "Bf5"
    ],
    "eco": "B18",
    "name": "Caro-Kann: Classical (Capablanca)",
    "plan": "Black develops bishop with tempo on White's knight before retreating to g6."
  },
  {
    "moves": [
      "e4",
      "c6",
      "d4",
      "d5",
      "Nc3",
      "dxe4",
      "Nxe4",
      "Nd7"
    ],
    "eco": "B17",
    "name": "Caro-Kann: Steinitz / Karpov",
    "plan": "Prepares ...Ngf6 without allowing doubled pawns."
  },
  {
    "moves": [
      "e4",
      "c6",
      "d4",
      "d5",
      "exd5",
      "cxd5",
      "c4"
    ],
    "eco": "B13",
    "name": "Caro-Kann: Panov-Botvinnik Attack",
    "plan": "White creates an isolated queen's pawn in exchange for dynamic piece activity."
  },
  {
    "moves": [
      "e4",
      "c6",
      "d4",
      "d5",
      "exd5",
      "cxd5",
      "Bd3"
    ],
    "eco": "B13",
    "name": "Caro-Kann: Exchange Variation",
    "plan": "Solid classical play avoiding the Panov complications."
  },
  {
    "moves": [
      "e4",
      "c6",
      "Nc3",
      "d5",
      "Nf3"
    ],
    "eco": "B10",
    "name": "Caro-Kann: Two Knights Variation",
    "plan": "Flexible development challenging Black to commit early."
  },
  {
    "moves": [
      "e4",
      "c5"
    ],
    "eco": "B20",
    "name": "Sicilian Defense",
    "plan": "The most popular counter-attacking defense: trades a flank pawn for central dominance."
  },
  {
    "moves": [
      "e4",
      "c5",
      "c3"
    ],
    "eco": "B22",
    "name": "Sicilian Defense: Alapin Variation",
    "plan": "Prepares an immediate d4 to establish an ideal two-pawn center."
  },
  {
    "moves": [
      "e4",
      "c5",
      "c3",
      "d5",
      "exd5",
      "Qxd5",
      "d4",
      "Nf6"
    ],
    "eco": "B22",
    "name": "Sicilian: Alapin, 2...d5",
    "plan": "Black attacks White's center immediately with piece pressure on d4."
  },
  {
    "moves": [
      "e4",
      "c5",
      "c3",
      "Nf6",
      "e5",
      "Nd5",
      "d4",
      "cxd4"
    ],
    "eco": "B22",
    "name": "Sicilian: Alapin, 2...Nf6",
    "plan": "Knight provoked to d5; Black fights for counterplay against e5."
  },
  {
    "moves": [
      "e4",
      "c5",
      "Nc3"
    ],
    "eco": "B23",
    "name": "Closed Sicilian",
    "plan": "White avoids early central opening, opting for a kingside fianchetto and gradual attack."
  },
  {
    "moves": [
      "e4",
      "c5",
      "Nc3",
      "Nc6",
      "g3",
      "g6",
      "Bg2",
      "Bg7",
      "d3",
      "d6"
    ],
    "eco": "B24",
    "name": "Closed Sicilian: Main Line",
    "plan": "Mutual maneuvering: White builds toward f4, Black expands with ...Rb8 and ...b5."
  },
  {
    "moves": [
      "e4",
      "c5",
      "d4",
      "cxd4",
      "c3"
    ],
    "eco": "B21",
    "name": "Sicilian: Smith-Morra Gambit",
    "plan": "White sacrifices a pawn for rapid development and open c- and d-files."
  },
  {
    "moves": [
      "e4",
      "c5",
      "d4",
      "cxd4",
      "c3",
      "dxc3",
      "Nxc3",
      "Nc6",
      "Nf3",
      "e6",
      "Bc4"
    ],
    "eco": "B21",
    "name": "Smith-Morra: Accepted",
    "plan": "White enjoys rapid piece activity targeting f7 and d6."
  },
  {
    "moves": [
      "e4",
      "c5",
      "f4"
    ],
    "eco": "B21",
    "name": "Sicilian: Grand Prix Attack",
    "plan": "Aggressive pawn assault on the kingside preparing Bc4, Nf3, and f5."
  },
  {
    "moves": [
      "e4",
      "c5",
      "b4"
    ],
    "eco": "B20",
    "name": "Sicilian: Wing Gambit",
    "plan": "Wing pawn sacrifice to deflect Black's c5 pawn and dominate the center."
  },
  {
    "moves": [
      "e4",
      "c5",
      "Nf3"
    ],
    "eco": "B27",
    "name": "Sicilian Defense: Open Variation Prep",
    "plan": "Standard preparation for 3. d4 opening the central files."
  },
  {
    "moves": [
      "e4",
      "c5",
      "Nf3",
      "Nc6",
      "Bb5"
    ],
    "eco": "B30",
    "name": "Sicilian: Rossolimo Variation",
    "plan": "White avoids Open Sicilian theory by pinning the knight and doubling Black's c-pawns."
  },
  {
    "moves": [
      "e4",
      "c5",
      "Nf3",
      "d6",
      "Bb5+"
    ],
    "eco": "B51",
    "name": "Sicilian: Moscow Variation",
    "plan": "Active check: trades light-squared bishops and simplifies."
  },
  {
    "moves": [
      "e4",
      "c5",
      "Nf3",
      "d6",
      "d4",
      "cxd4",
      "Nxd4",
      "Nf6",
      "Nc3",
      "a6"
    ],
    "eco": "B90",
    "name": "Sicilian Najdorf",
    "plan": "The sharpest defense in chess: controls b5 and prepares queenside counter-attacks."
  },
  {
    "moves": [
      "e4",
      "c5",
      "Nf3",
      "d6",
      "d4",
      "cxd4",
      "Nxd4",
      "Nf6",
      "Nc3",
      "a6",
      "Be3"
    ],
    "eco": "B90",
    "name": "Sicilian Najdorf: English Attack",
    "plan": "White plans f3, Qd2, and g4 with opposite-side castling and a deadly kingside pawn storm."
  },
  {
    "moves": [
      "e4",
      "c5",
      "Nf3",
      "d6",
      "d4",
      "cxd4",
      "Nxd4",
      "Nf6",
      "Nc3",
      "a6",
      "Bg5"
    ],
    "eco": "B95",
    "name": "Sicilian Najdorf: Classical 6.Bg5",
    "plan": "Sharp tactical theoretical battle putting immediate pressure on Black's knight."
  },
  {
    "moves": [
      "e4",
      "c5",
      "Nf3",
      "d6",
      "d4",
      "cxd4",
      "Nxd4",
      "Nf6",
      "Nc3",
      "a6",
      "Bc4"
    ],
    "eco": "B86",
    "name": "Sicilian Najdorf: Fischer-Sozin Attack",
    "plan": "Fischer's favorite weapon: bishop targets the f7 weakness directly."
  },
  {
    "moves": [
      "e4",
      "c5",
      "Nf3",
      "d6",
      "d4",
      "cxd4",
      "Nxd4",
      "Nf6",
      "Nc3",
      "a6",
      "h3"
    ],
    "eco": "B90",
    "name": "Sicilian Najdorf: Adams Attack",
    "plan": "Modern aggressive probe preparing g4."
  },
  {
    "moves": [
      "e4",
      "c5",
      "Nf3",
      "d6",
      "d4",
      "cxd4",
      "Nxd4",
      "Nf6",
      "Nc3",
      "g6"
    ],
    "eco": "B70",
    "name": "Sicilian Dragon",
    "plan": "Black fianchettoes on g7, aiming deadly diagonal laser pressure towards White's queenside."
  },
  {
    "moves": [
      "e4",
      "c5",
      "Nf3",
      "d6",
      "d4",
      "cxd4",
      "Nxd4",
      "Nf6",
      "Nc3",
      "g6",
      "Be3",
      "Bg7",
      "f3",
      "O-O",
      "Qd2"
    ],
    "eco": "B75",
    "name": "Sicilian Dragon: Yugoslav Attack",
    "plan": "Mutual attacks: White storms the kingside with h4-h5, Black counters on the half-open c-file."
  },
  {
    "moves": [
      "e4",
      "c5",
      "Nf3",
      "Nc6",
      "d4",
      "cxd4",
      "Nxd4",
      "Nf6",
      "Nc3",
      "e5"
    ],
    "eco": "B33",
    "name": "Sicilian Sveshnikov",
    "plan": "Black takes central space with ...e5, accepting a backward d6 pawn for immense piece activity."
  },
  {
    "moves": [
      "e4",
      "c5",
      "Nf3",
      "Nc6",
      "d4",
      "cxd4",
      "Nxd4",
      "Nf6",
      "Nc3",
      "e5",
      "Ndb5",
      "d6",
      "Bg5",
      "a6",
      "Na3",
      "b5"
    ],
    "eco": "B33",
    "name": "Sicilian Sveshnikov: Main Line",
    "plan": "Explosive piece struggle fighting over the key d5 outpost."
  },
  {
    "moves": [
      "e4",
      "c5",
      "Nf3",
      "e6",
      "d4",
      "cxd4",
      "Nxd4",
      "Nc6"
    ],
    "eco": "B44",
    "name": "Sicilian Taimanov",
    "plan": "Extremely flexible setup retaining options for ...a6, ...Qc7, and central counter-strikes."
  },
  {
    "moves": [
      "e4",
      "c5",
      "Nf3",
      "e6",
      "d4",
      "cxd4",
      "Nxd4",
      "a6"
    ],
    "eco": "B41",
    "name": "Sicilian Kan",
    "plan": "Quiet, solid prophylactic system controlling b5 and keeping kingside options open."
  },
  {
    "moves": [
      "e4",
      "c5",
      "Nf3",
      "d6",
      "d4",
      "cxd4",
      "Nxd4",
      "Nf6",
      "Nc3",
      "e6"
    ],
    "eco": "B80",
    "name": "Sicilian Scheveningen",
    "plan": "Small center with pawns on d6 and e6, extremely resilient and flexible."
  },
  {
    "moves": [
      "e4",
      "c5",
      "Nf3",
      "Nc6",
      "d4",
      "cxd4",
      "Nxd4",
      "g6"
    ],
    "eco": "B34",
    "name": "Accelerated Dragon",
    "plan": "Reaches Dragon structure without playing d6, saving a tempo for ...d5."
  },
  {
    "moves": [
      "e4",
      "e6"
    ],
    "eco": "C00",
    "name": "French Defense",
    "plan": "Solid counter-attacking system preparing ...d5 while blunting White's f7 attacking diagonal."
  },
  {
    "moves": [
      "e4",
      "e6",
      "d4",
      "d5"
    ],
    "eco": "C00",
    "name": "French Defense: Normal Continuation",
    "plan": "White has more space, Black challenges the center and attacks White's d4 chain."
  },
  {
    "moves": [
      "e4",
      "e6",
      "d4",
      "d5",
      "e5"
    ],
    "eco": "C02",
    "name": "French: Advance Variation",
    "plan": "White locks the center; Black immediately attacks the base with ...c5 and ...Qb6."
  },
  {
    "moves": [
      "e4",
      "e6",
      "d4",
      "d5",
      "e5",
      "c5",
      "c3",
      "Nc6",
      "Nf3",
      "Qb6"
    ],
    "eco": "C02",
    "name": "French: Advance, Main Line",
    "plan": "Black piles maximum pressure on the d4 pawn."
  },
  {
    "moves": [
      "e4",
      "e6",
      "d4",
      "d5",
      "Nc3",
      "Bb4"
    ],
    "eco": "C15",
    "name": "French: Winawer Variation",
    "plan": "Sharp, unbalanced pin: Black offers the bishop pair to ruin White's queenside pawn structure."
  },
  {
    "moves": [
      "e4",
      "e6",
      "d4",
      "d5",
      "Nc3",
      "Bb4",
      "e5",
      "c5",
      "a3",
      "Bxc3+",
      "bxc3"
    ],
    "eco": "C18",
    "name": "French: Winawer Main Line",
    "plan": "White attacks the kingside with Qg4; Black attacks the doubled queenside pawns."
  },
  {
    "moves": [
      "e4",
      "e6",
      "d4",
      "d5",
      "Nc3",
      "Nf6"
    ],
    "eco": "C10",
    "name": "French: Classical Variation",
    "plan": "Solid knight development maintaining pressure on White's e4 outpost."
  },
  {
    "moves": [
      "e4",
      "e6",
      "d4",
      "d5",
      "Nd2"
    ],
    "eco": "C03",
    "name": "French: Tarrasch Variation",
    "plan": "White avoids the Winawer pin and keeps the c-pawn free to support d4."
  },
  {
    "moves": [
      "e4",
      "e6",
      "d4",
      "d5",
      "Nd2",
      "c5"
    ],
    "eco": "C07",
    "name": "French: Open Tarrasch",
    "plan": "Black strikes at d4 immediately, accepting an isolated pawn for piece activity."
  },
  {
    "moves": [
      "e4",
      "e6",
      "d4",
      "d5",
      "Nd2",
      "Nf6"
    ],
    "eco": "C05",
    "name": "French: Closed Tarrasch",
    "plan": "Black attacks e4, provoking e5 before redirecting the knight to d7."
  },
  {
    "moves": [
      "e4",
      "e6",
      "d4",
      "d5",
      "exd5",
      "exd5"
    ],
    "eco": "C01",
    "name": "French: Exchange Variation",
    "plan": "Symmetrical pawn structure leading to balanced, classical piece maneuver battles."
  },
  {
    "moves": [
      "e4",
      "e5"
    ],
    "eco": "C20",
    "name": "Open Game",
    "plan": "Direct central confrontation battling for d4 and f4 control."
  },
  {
    "moves": [
      "e4",
      "e5",
      "Bc4"
    ],
    "eco": "C23",
    "name": "Bishop's Opening",
    "plan": "Rapid bishop deployment targeting f7 without committing the king's knight."
  },
  {
    "moves": [
      "e4",
      "e5",
      "Bc4",
      "Nf6"
    ],
    "eco": "C24",
    "name": "Bishop's Opening: Berlin Defense",
    "plan": "Black counter-attacks e4 immediately."
  },
  {
    "moves": [
      "e4",
      "e5",
      "Nc3"
    ],
    "eco": "C25",
    "name": "Vienna Game",
    "plan": "Controls d5 before choosing between f4 (Vienna Gambit) or quiet development."
  },
  {
    "moves": [
      "e4",
      "e5",
      "Nc3",
      "Nf6",
      "f4"
    ],
    "eco": "C29",
    "name": "Vienna Gambit",
    "plan": "Aggressive gambit strike; Black responds with ...d5."
  },
  {
    "moves": [
      "e4",
      "e5",
      "Nc3",
      "Nf6",
      "g3"
    ],
    "eco": "C26",
    "name": "Vienna: Paulsen Variation",
    "plan": "Quiet positional system preparing Bg2 and Nge2."
  },
  {
    "moves": [
      "e4",
      "e5",
      "d4",
      "exd4",
      "Qxd4"
    ],
    "eco": "C21",
    "name": "Center Game",
    "plan": "Early Queen development in the center; Black plays ...Nc6 with tempo."
  },
  {
    "moves": [
      "e4",
      "e5",
      "d4",
      "exd4",
      "c3"
    ],
    "eco": "C21",
    "name": "Danish Gambit",
    "plan": "Double pawn sacrifice for monstrous bishop diagonals toward Black's kingside."
  },
  {
    "moves": [
      "e4",
      "e5",
      "f4"
    ],
    "eco": "C30",
    "name": "King's Gambit",
    "plan": "Romantic, aggressive sacrifice of the f-pawn to demolish Black's center and open the f-file."
  },
  {
    "moves": [
      "e4",
      "e5",
      "f4",
      "exf4"
    ],
    "eco": "C34",
    "name": "King's Gambit Accepted",
    "plan": "Black accepts the material; White aims for rapid development and central conquest."
  },
  {
    "moves": [
      "e4",
      "e5",
      "f4",
      "exf4",
      "Nf3",
      "g5"
    ],
    "eco": "C38",
    "name": "King's Gambit: Classical Defense",
    "plan": "Black tenaciously holds the extra f4 pawn with ...g5."
  },
  {
    "moves": [
      "e4",
      "e5",
      "f4",
      "exf4",
      "Bc4"
    ],
    "eco": "C33",
    "name": "King's Gambit: Bishop's Gambit",
    "plan": "White prioritizes bishop development toward f7 over king safety."
  },
  {
    "moves": [
      "e4",
      "e5",
      "f4",
      "d5"
    ],
    "eco": "C31",
    "name": "King's Gambit: Falkbeer Counter-Gambit",
    "plan": "Black refuses the pawn and strikes immediately in the center with ...d5."
  },
  {
    "moves": [
      "e4",
      "e5",
      "Nf3"
    ],
    "eco": "C40",
    "name": "King's Knight Opening",
    "plan": "Attacks Black's e5 pawn with tempo, initiating active central play."
  },
  {
    "moves": [
      "e4",
      "e5",
      "Nf3",
      "d6"
    ],
    "eco": "C41",
    "name": "Philidor Defense",
    "plan": "Solid pawn defense of e5, though it restricts Black's dark-squared bishop."
  },
  {
    "moves": [
      "e4",
      "e5",
      "Nf3",
      "d6",
      "d4",
      "exd4",
      "Nxd4"
    ],
    "eco": "C41",
    "name": "Philidor: Exchange Variation",
    "plan": "White gains superior central space and free piece diagonals."
  },
  {
    "moves": [
      "e4",
      "e5",
      "Nf3",
      "Nf6"
    ],
    "eco": "C42",
    "name": "Petroff Defense (Russian Game)",
    "plan": "Symmetrical counter-attack on White's e4 pawn, renowned for drawing resilience."
  },
  {
    "moves": [
      "e4",
      "e5",
      "Nf3",
      "Nf6",
      "Nxe5",
      "d6",
      "Nf3",
      "Nxe4",
      "d4",
      "d5"
    ],
    "eco": "C42",
    "name": "Petroff: Classical Main Line",
    "plan": "Balanced central outposts; White seeks initiative with active bishops."
  },
  {
    "moves": [
      "e4",
      "e5",
      "Nf3",
      "Nc6"
    ],
    "eco": "C44",
    "name": "Open Game: Normal Continuation",
    "plan": "Natural knight development defending e5 and controlling d4."
  },
  {
    "moves": [
      "e4",
      "e5",
      "Nf3",
      "Nc6",
      "d4"
    ],
    "eco": "C44",
    "name": "Scotch Game",
    "plan": "Immediate strike in the center, blowing open central lines for active piece play."
  },
  {
    "moves": [
      "e4",
      "e5",
      "Nf3",
      "Nc6",
      "d4",
      "exd4",
      "Nxd4"
    ],
    "eco": "C45",
    "name": "Scotch: Open Main Line",
    "plan": "Central piece dominance for White; Black develops with ...Bc5 or ...Nf6."
  },
  {
    "moves": [
      "e4",
      "e5",
      "Nf3",
      "Nc6",
      "d4",
      "exd4",
      "Nxd4",
      "Bc5"
    ],
    "eco": "C45",
    "name": "Scotch: Classical Variation",
    "plan": "Bishop targets the d4 knight with tempo."
  },
  {
    "moves": [
      "e4",
      "e5",
      "Nf3",
      "Nc6",
      "d4",
      "exd4",
      "Nxd4",
      "Nf6"
    ],
    "eco": "C45",
    "name": "Scotch: Mieses Variation",
    "plan": "Counter-attacks e4, provoking knight exchanges and dynamic imbalances."
  },
  {
    "moves": [
      "e4",
      "e5",
      "Nf3",
      "Nc6",
      "c3"
    ],
    "eco": "C44",
    "name": "Ponziani Opening",
    "plan": "Prepares an imposing d4 central pawn front."
  },
  {
    "moves": [
      "e4",
      "e5",
      "Nf3",
      "Nc6",
      "Nc3",
      "Nf6"
    ],
    "eco": "C47",
    "name": "Four Knights Game",
    "plan": "Symmetrical, classical development with solid foundational principles."
  },
  {
    "moves": [
      "e4",
      "e5",
      "Nf3",
      "Nc6",
      "Nc3",
      "Nf6",
      "Bb5"
    ],
    "eco": "C48",
    "name": "Four Knights: Spanish Variation",
    "plan": "Pins the knight to create long-term structural pressure."
  },
  {
    "moves": [
      "e4",
      "e5",
      "Nf3",
      "Nc6",
      "Bc4"
    ],
    "eco": "C50",
    "name": "Italian Game",
    "plan": "Direct pressure against Black's f7 weakness, the most sensitive square in Black's camp."
  },
  {
    "moves": [
      "e4",
      "e5",
      "Nf3",
      "Nc6",
      "Bc4",
      "Bc5"
    ],
    "eco": "C53",
    "name": "Giuoco Piano",
    "plan": "The quiet game: both sides mobilize bishops to active posts and vie for center control."
  },
  {
    "moves": [
      "e4",
      "e5",
      "Nf3",
      "Nc6",
      "Bc4",
      "Bc5",
      "c3",
      "Nf6",
      "d3"
    ],
    "eco": "C50",
    "name": "Giuoco Pianissimo",
    "plan": "Patient positional maneuvering preparing a future d4 or b4 push."
  },
  {
    "moves": [
      "e4",
      "e5",
      "Nf3",
      "Nc6",
      "Bc4",
      "Bc5",
      "c3",
      "Nf6",
      "d4"
    ],
    "eco": "C54",
    "name": "Giuoco Piano: Center Attack",
    "plan": "Classical pawn breakthrough creating a dominant pawn duo on d4 and e4."
  },
  {
    "moves": [
      "e4",
      "e5",
      "Nf3",
      "Nc6",
      "Bc4",
      "Bc5",
      "b4"
    ],
    "eco": "C51",
    "name": "Evans Gambit",
    "plan": "Audacious wing gambit sacrificing a pawn to build a massive center and dominate diagonals."
  },
  {
    "moves": [
      "e4",
      "e5",
      "Nf3",
      "Nc6",
      "Bc4",
      "Bc5",
      "b4",
      "Bxb4",
      "c3",
      "Ba5"
    ],
    "eco": "C52",
    "name": "Evans Gambit Accepted",
    "plan": "White controls the center and rapid castling; Black retreats bishop safely."
  },
  {
    "moves": [
      "e4",
      "e5",
      "Nf3",
      "Nc6",
      "Bc4",
      "Nf6"
    ],
    "eco": "C55",
    "name": "Two Knights Defense",
    "plan": "Active counter-challenge on White's e4 pawn."
  },
  {
    "moves": [
      "e4",
      "e5",
      "Nf3",
      "Nc6",
      "Bc4",
      "Nf6",
      "Ng5"
    ],
    "eco": "C57",
    "name": "Fried Liver Attack Preparation",
    "plan": "Double attack against the f7 pawn, forcing tactical complications."
  },
  {
    "moves": [
      "e4",
      "e5",
      "Nf3",
      "Nc6",
      "Bc4",
      "Nf6",
      "Ng5",
      "d5",
      "exd5",
      "Na5"
    ],
    "eco": "C58",
    "name": "Two Knights: Main Line",
    "plan": "Black gives up a pawn to displace White's bishop and seize initiative."
  },
  {
    "moves": [
      "e4",
      "e5",
      "Nf3",
      "Nc6",
      "Bc4",
      "Nf6",
      "Ng5",
      "d5",
      "exd5",
      "Nxd5",
      "Nxf7"
    ],
    "eco": "C57",
    "name": "Fried Liver Attack (Fegatello)",
    "plan": "Legendary knight sacrifice tearing open the Black king in the center."
  },
  {
    "moves": [
      "e4",
      "e5",
      "Nf3",
      "Nc6",
      "Bb5"
    ],
    "eco": "C60",
    "name": "Ruy Lopez (Spanish Opening)",
    "plan": "The Royal Game: pins the defender of e5 and establishes long-term positional pressure."
  },
  {
    "moves": [
      "e4",
      "e5",
      "Nf3",
      "Nc6",
      "Bb5",
      "a6"
    ],
    "eco": "C68",
    "name": "Ruy Lopez: Morphy Defense",
    "plan": "Questions the bishop immediately, forcing White to declare intentions."
  },
  {
    "moves": [
      "e4",
      "e5",
      "Nf3",
      "Nc6",
      "Bb5",
      "a6",
      "Bxc6"
    ],
    "eco": "C68",
    "name": "Ruy Lopez: Exchange Variation",
    "plan": "White damages Black's queenside pawns and aims for a winning king and pawn endgame."
  },
  {
    "moves": [
      "e4",
      "e5",
      "Nf3",
      "Nc6",
      "Bb5",
      "a6",
      "Ba4"
    ],
    "eco": "C70",
    "name": "Ruy Lopez: Retreat Line",
    "plan": "Maintains the pin and prepares castling."
  },
  {
    "moves": [
      "e4",
      "e5",
      "Nf3",
      "Nc6",
      "Bb5",
      "a6",
      "Ba4",
      "Nf6"
    ],
    "eco": "C78",
    "name": "Ruy Lopez: Closed Setup",
    "plan": "Black develops knight to natural square and attacks e4."
  },
  {
    "moves": [
      "e4",
      "e5",
      "Nf3",
      "Nc6",
      "Bb5",
      "a6",
      "Ba4",
      "Nf6",
      "O-O",
      "Be7",
      "Re1",
      "b5",
      "Bb3",
      "d6",
      "c3",
      "O-O"
    ],
    "eco": "C92",
    "name": "Ruy Lopez: Closed Main Line",
    "plan": "Grandmaster battleground: White builds toward d4 while Black fights for queenside counterplay."
  },
  {
    "moves": [
      "e4",
      "e5",
      "Nf3",
      "Nc6",
      "Bb5",
      "a6",
      "Ba4",
      "Nf6",
      "O-O",
      "Be7",
      "Re1",
      "b5",
      "Bb3",
      "O-O",
      "c3",
      "d5"
    ],
    "eco": "C89",
    "name": "Ruy Lopez: Marshall Attack",
    "plan": "Legendary pawn sacrifice for overwhelming initiative and kingside attacking chances."
  },
  {
    "moves": [
      "e4",
      "e5",
      "Nf3",
      "Nc6",
      "Bb5",
      "Nf6"
    ],
    "eco": "C65",
    "name": "Ruy Lopez: Berlin Defense",
    "plan": "The Berlin Wall: solid endgame resilience made famous by Kramnik against Kasparov."
  },
  {
    "moves": [
      "e4",
      "e5",
      "Nf3",
      "Nc6",
      "Bb5",
      "Nf6",
      "O-O",
      "Nxe4",
      "d4",
      "Nd6",
      "Bxc6",
      "dxc6",
      "dxe5",
      "Nf5",
      "Qxd8+",
      "Kxd8"
    ],
    "eco": "C67",
    "name": "Ruy Lopez: Berlin Endgame",
    "plan": "The legendary fortress: Black's king is displaced, but the bishop pair holds firm."
  },
  {
    "moves": [
      "d4",
      "d5"
    ],
    "eco": "D00",
    "name": "Closed Game",
    "plan": "Solid central pawn confrontation fighting for e4 and e5 dominance."
  },
  {
    "moves": [
      "d4",
      "d5",
      "Bf4"
    ],
    "eco": "D00",
    "name": "London System",
    "plan": "Rock-solid setup developing the dark-squared bishop early, followed by e3 and c3."
  },
  {
    "moves": [
      "d4",
      "d5",
      "Nf3",
      "Nf6",
      "Bf4"
    ],
    "eco": "D02",
    "name": "London System: Main Line",
    "plan": "Creates an impenetrable pawn pyramid with an active bishop on f4."
  },
  {
    "moves": [
      "d4",
      "d5",
      "Nf3",
      "Nf6",
      "Bf4",
      "c5",
      "e3",
      "Nc6",
      "c3"
    ],
    "eco": "D02",
    "name": "London System: Classical Setup",
    "plan": "White forms a solid triangle supporting d4, aiming for Ne5."
  },
  {
    "moves": [
      "d4",
      "d5",
      "Nc3",
      "Nf6",
      "Bf4"
    ],
    "eco": "D00",
    "name": "Jobava London System",
    "plan": "Dynamic hybrid with rapid Nc3 and active minor piece pressure."
  },
  {
    "moves": [
      "d4",
      "d5",
      "Nf3",
      "Nf6",
      "e3"
    ],
    "eco": "D05",
    "name": "Colle System",
    "plan": "Harmonious setup preparing Bd3, Nbd2, and a decisive central break with e4."
  },
  {
    "moves": [
      "d4",
      "d5",
      "c4"
    ],
    "eco": "D06",
    "name": "Queen's Gambit",
    "plan": "Offers a wing pawn to gain superior central control on d4 and e4."
  },
  {
    "moves": [
      "d4",
      "d5",
      "c4",
      "dxc4"
    ],
    "eco": "D20",
    "name": "Queen's Gambit Accepted",
    "plan": "Black takes the pawn, intending to return it later while completing rapid development."
  },
  {
    "moves": [
      "d4",
      "d5",
      "c4",
      "dxc4",
      "Nf3",
      "Nf6",
      "e3",
      "e6",
      "Bxc4",
      "c5"
    ],
    "eco": "D27",
    "name": "QGA: Classical Main Line",
    "plan": "Black strikes at d4 while completing harmonious development."
  },
  {
    "moves": [
      "d4",
      "d5",
      "c4",
      "c6"
    ],
    "eco": "D10",
    "name": "Slav Defense",
    "plan": "Reinforces d5 without blocking the light-squared bishop's diagonal."
  },
  {
    "moves": [
      "d4",
      "d5",
      "c4",
      "c6",
      "Nf3",
      "Nf6",
      "Nc3",
      "dxc4"
    ],
    "eco": "D15",
    "name": "Slav: Open Main Line",
    "plan": "Black temporarily captures on c4 and plans ...Bf5 or ...b5 expansion."
  },
  {
    "moves": [
      "d4",
      "d5",
      "c4",
      "c6",
      "Nf3",
      "Nf6",
      "Nc3",
      "a6"
    ],
    "eco": "D15",
    "name": "Slav: Chebanenko (Chameleon)",
    "plan": "Prophylactic ...a6 preparing ...b5 without commiting the center."
  },
  {
    "moves": [
      "d4",
      "d5",
      "c4",
      "c6",
      "Nf3",
      "Nf6",
      "Nc3",
      "e6"
    ],
    "eco": "D43",
    "name": "Semi-Slav Defense",
    "plan": "The most dynamic response to the Queen's Gambit: rock-solid triangle on c6, d5, e6."
  },
  {
    "moves": [
      "d4",
      "d5",
      "c4",
      "c6",
      "Nf3",
      "Nf6",
      "Nc3",
      "e6",
      "e3",
      "Nbd7",
      "Bd3",
      "dxc4",
      "Bxc4",
      "b5"
    ],
    "eco": "D47",
    "name": "Semi-Slav: Meran Variation",
    "plan": "Explosive counter-strike where Black expands with ...b5 and strikes with ...c5."
  },
  {
    "moves": [
      "d4",
      "d5",
      "c4",
      "c6",
      "Nf3",
      "Nf6",
      "Nc3",
      "e6",
      "Bg5",
      "dxc4",
      "e4",
      "b5"
    ],
    "eco": "D44",
    "name": "Semi-Slav: Botvinnik Variation",
    "plan": "Extremely razor-sharp theoretical line with heavy piece sacrifice ideas."
  },
  {
    "moves": [
      "d4",
      "d5",
      "c4",
      "e6"
    ],
    "eco": "D30",
    "name": "Queen's Gambit Declined",
    "plan": "Classical defense anchoring d5, creating an unyielding central fortress."
  },
  {
    "moves": [
      "d4",
      "d5",
      "c4",
      "e6",
      "Nc3",
      "Nf6",
      "Bg5",
      "Be7",
      "e3",
      "O-O",
      "Nf3",
      "Nbd7"
    ],
    "eco": "D60",
    "name": "QGD: Orthodox Defense",
    "plan": "The gold standard of classical defense: solid, patient development."
  },
  {
    "moves": [
      "d4",
      "d5",
      "c4",
      "e6",
      "Nc3",
      "Nf6",
      "Bg5",
      "Be7",
      "e3",
      "O-O",
      "Nf3",
      "h6",
      "Bh4",
      "b6"
    ],
    "eco": "D58",
    "name": "QGD: Tartakower Defense",
    "plan": "Black fianchettoes the light-squared bishop on b7 to solve passive piece issues."
  },
  {
    "moves": [
      "d4",
      "d5",
      "c4",
      "e6",
      "Nc3",
      "Nf6",
      "cxd5",
      "exd5"
    ],
    "eco": "D35",
    "name": "QGD: Exchange Variation",
    "plan": "White initiates the minority attack on the queenside using b4-b5."
  },
  {
    "moves": [
      "d4",
      "d5",
      "c4",
      "e6",
      "Nc3",
      "Nf6",
      "Nf3",
      "c5"
    ],
    "eco": "D40",
    "name": "Semi-Tarrasch Defense",
    "plan": "Black immediately challenges White's d4 pawn center."
  },
  {
    "moves": [
      "d4",
      "d5",
      "c4",
      "e6",
      "Nc3",
      "c5"
    ],
    "eco": "D32",
    "name": "Tarrasch Defense",
    "plan": "Direct central break leading to an isolated queen pawn position with great piece freedom."
  },
  {
    "moves": [
      "d4",
      "d5",
      "c4",
      "Nc6"
    ],
    "eco": "D07",
    "name": "Chigorin Defense",
    "plan": "Unorthodox minor piece counter-attack prioritizing rapid development over pawn stability."
  },
  {
    "moves": [
      "d4",
      "Nf6",
      "c4",
      "g6",
      "Nc3",
      "d5"
    ],
    "eco": "D80",
    "name": "Grünfeld Defense",
    "plan": "Modern masterpiece: Black allows White a huge pawn center, then attacks it relentlessly."
  },
  {
    "moves": [
      "d4",
      "Nf6",
      "c4",
      "g6",
      "Nc3",
      "d5",
      "cxd5",
      "Nxd5",
      "e4",
      "Nxc3",
      "bxc3",
      "Bg7"
    ],
    "eco": "D85",
    "name": "Grünfeld: Exchange Variation",
    "plan": "White holds a massive center; Black chips away with ...c5 and dark-square pressure."
  },
  {
    "moves": [
      "d4",
      "Nf6",
      "c4",
      "g6",
      "Nc3",
      "d5",
      "Nf3",
      "Bg7",
      "Qb3"
    ],
    "eco": "D96",
    "name": "Grünfeld: Russian System",
    "plan": "Queen targets d5 and b7, challenging Black's pawn structure."
  },
  {
    "moves": [
      "d4",
      "Nf6",
      "c4",
      "e6",
      "g3"
    ],
    "eco": "E00",
    "name": "Catalan Opening",
    "plan": "Combines Queen's Gambit with a lethal kingside fianchetto along the h1-a8 diagonal."
  },
  {
    "moves": [
      "d4",
      "Nf6",
      "c4",
      "e6",
      "g3",
      "d5",
      "Bg2",
      "Be7",
      "Nf3",
      "O-O"
    ],
    "eco": "E06",
    "name": "Catalan: Closed Main Line",
    "plan": "Subtle positional squeeze where White's g2 bishop exerts long-term pressure."
  },
  {
    "moves": [
      "d4",
      "Nf6",
      "c4",
      "e6",
      "g3",
      "d5",
      "Bg2",
      "dxc4"
    ],
    "eco": "E04",
    "name": "Catalan: Open Defense",
    "plan": "Black takes the c4 pawn and aims for rapid development with ...c5 or ...a6."
  },
  {
    "moves": [
      "d4",
      "Nf6",
      "c4",
      "e6",
      "Nf3",
      "b6"
    ],
    "eco": "E12",
    "name": "Queen's Indian Defense",
    "plan": "Black controls the central e4 square by placing the bishop on b7."
  },
  {
    "moves": [
      "d4",
      "Nf6",
      "c4",
      "e6",
      "Nf3",
      "b6",
      "g3",
      "Ba6"
    ],
    "eco": "E15",
    "name": "Queen's Indian: Nimzowitsch Variation",
    "plan": "Counter-intuitive bishop sortie to a6 attacking White's c4 pawn."
  },
  {
    "moves": [
      "d4",
      "Nf6",
      "c4",
      "e6",
      "Nf3",
      "Bb4+"
    ],
    "eco": "E11",
    "name": "Bogo-Indian Defense",
    "plan": "Speedy piece development offering to trade the dark-squared bishop."
  },
  {
    "moves": [
      "d4",
      "Nf6",
      "c4",
      "e6",
      "Nc3",
      "Bb4"
    ],
    "eco": "E20",
    "name": "Nimzo-Indian Defense",
    "plan": "One of Black's most respected defenses: pins the c3 knight to prevent e4 and fight for e4 control."
  },
  {
    "moves": [
      "d4",
      "Nf6",
      "c4",
      "e6",
      "Nc3",
      "Bb4",
      "e3"
    ],
    "eco": "E40",
    "name": "Nimzo-Indian: Rubinstein Variation",
    "plan": "Solid central reinforcement preparing Bd3 and Ne2."
  },
  {
    "moves": [
      "d4",
      "Nf6",
      "c4",
      "e6",
      "Nc3",
      "Bb4",
      "Qc2"
    ],
    "eco": "E32",
    "name": "Nimzo-Indian: Classical (Capablanca)",
    "plan": "Avoids doubled c-pawns by protecting the knight with the Queen."
  },
  {
    "moves": [
      "d4",
      "Nf6",
      "c4",
      "e6",
      "Nc3",
      "Bb4",
      "a3",
      "Bxc3+",
      "bxc3"
    ],
    "eco": "E24",
    "name": "Nimzo-Indian: Sämisch Variation",
    "plan": "White accepts doubled pawns to secure the bishop pair and build a massive center."
  },
  {
    "moves": [
      "d4",
      "Nf6",
      "c4",
      "e6",
      "Nc3",
      "Bb4",
      "f3"
    ],
    "eco": "E20",
    "name": "Nimzo-Indian: Shirov / Gheorghiu Line",
    "plan": "Direct preparation for an immediate e4 push."
  },
  {
    "moves": [
      "d4",
      "Nf6",
      "c4",
      "g6",
      "Nc3",
      "Bg7"
    ],
    "eco": "E60",
    "name": "King's Indian Defense",
    "plan": "Dynamic counter-attacking defense: Black allows White the center, then launches a ferocious kingside attack."
  },
  {
    "moves": [
      "d4",
      "Nf6",
      "c4",
      "g6",
      "Nc3",
      "Bg7",
      "e4",
      "d6"
    ],
    "eco": "E70",
    "name": "King's Indian: Basic Setup",
    "plan": "Solid pawn wedge on d6 and g6, preparing ...e5 or ...c5."
  },
  {
    "moves": [
      "d4",
      "Nf6",
      "c4",
      "g6",
      "Nc3",
      "Bg7",
      "e4",
      "d6",
      "Nf3",
      "O-O",
      "Be2",
      "e5"
    ],
    "eco": "E91",
    "name": "King's Indian: Classical Setup",
    "plan": "Black locks horns in the center with ...e5, preparing kingside storm."
  },
  {
    "moves": [
      "d4",
      "Nf6",
      "c4",
      "g6",
      "Nc3",
      "Bg7",
      "e4",
      "d6",
      "Nf3",
      "O-O",
      "Be2",
      "e5",
      "O-O",
      "Nc6",
      "d5",
      "Ne7"
    ],
    "eco": "E97",
    "name": "King's Indian: Mar del Plata Main Line",
    "plan": "Classic opposite-side storm: White breaks on the queenside (c5), Black charges the King (f5-f4-g5-g4)."
  },
  {
    "moves": [
      "d4",
      "Nf6",
      "c4",
      "g6",
      "Nc3",
      "Bg7",
      "e4",
      "d6",
      "f3"
    ],
    "eco": "E80",
    "name": "King's Indian: Sämisch Variation",
    "plan": "Solidifies e4 with f3, preparing Be3, Qd2, and opposite-side castling."
  },
  {
    "moves": [
      "d4",
      "Nf6",
      "c4",
      "g6",
      "Nc3",
      "Bg7",
      "e4",
      "d6",
      "Be2",
      "O-O",
      "Bg5"
    ],
    "eco": "E73",
    "name": "King's Indian: Averbakh Variation",
    "plan": "Pins the knight to discourage Black's standard ...e5 break."
  },
  {
    "moves": [
      "d4",
      "Nf6",
      "c4",
      "g6",
      "Nc3",
      "Bg7",
      "e4",
      "d6",
      "f4"
    ],
    "eco": "E76",
    "name": "King's Indian: Four Pawns Attack",
    "plan": "Aggressive pawn wall; Black counters with ...c5 blowing open lines."
  },
  {
    "moves": [
      "d4",
      "Nf6",
      "c4",
      "g6",
      "g3",
      "Bg7",
      "Bg2",
      "O-O",
      "Nf3",
      "d6",
      "O-O"
    ],
    "eco": "E62",
    "name": "King's Indian: Fianchetto System",
    "plan": "White neutralizes Black's kingside attack by fianchettoing on g2."
  }
];

  class OpeningExplorer {
    static findOpening(moveList) {
      if (!moveList || moveList.length === 0) return null;

      let bestMatch = null;
      let maxMatchLen = 0;

      for (let i = 0; i < OPENING_BOOK.length; i++) {
        const book = OPENING_BOOK[i];
        if (book.moves.length <= moveList.length) {
          let match = true;
          for (let m = 0; m < book.moves.length; m++) {
            if (book.moves[m] !== moveList[m]) {
              match = false;
              break;
            }
          }
          if (match && book.moves.length > maxMatchLen) {
            bestMatch = book;
            maxMatchLen = book.moves.length;
          }
        }
      }

      return bestMatch;
    }

    static isBookMove(moveList) {
      if (!moveList || moveList.length === 0) return false;
      // Allow book classification up to move 15
      if (moveList.length > 30) return false;

      for (let i = 0; i < OPENING_BOOK.length; i++) {
        const book = OPENING_BOOK[i];
        if (book.moves.length >= moveList.length) {
          let match = true;
          for (let m = 0; m < moveList.length; m++) {
            if (book.moves[m] !== moveList[m]) {
              match = false;
              break;
            }
          }
          if (match) return true;
        }
      }
      return false;
    }
  }

  global.OpeningExplorer = OpeningExplorer;
  global.OPENING_BOOK = OPENING_BOOK;

  if (typeof module !== 'undefined' && module.exports) {
    module.exports = { OpeningExplorer, OPENING_BOOK };
  }

})(typeof window !== 'undefined' ? window : (typeof global !== 'undefined' ? global : this));
