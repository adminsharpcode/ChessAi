const fs = require('fs');
const path = require('path');

const OPENINGS = [
  // ECO A: Flank Openings & Unusual Lines (A00 - A99)
  { moves: ['a3'], eco: 'A00', name: "Anderssen's Opening", plan: "A passive, waiting move preparing b4 while observing Black's plan." },
  { moves: ['a4'], eco: 'A00', name: "Ware Opening", plan: "An eccentric flank push with queenside space intentions." },
  { moves: ['b4'], eco: 'A00', name: "Polish / Sokolsky Opening", plan: "Seeks early queenside flank expansion and fianchetto on b2 to control the long diagonal." },
  { moves: ['b4', 'e5', 'Bb2'], eco: 'A00', name: "Sokolsky Opening: Outflank Variation", plan: "Direct counter-pressure against Black's e5 pawn from the flank." },
  { moves: ['g4'], eco: 'A00', name: "Grob Opening", plan: "Aggressive, double-edged kingside expansion targeting f5 and h5." },
  { moves: ['c3'], eco: 'A00', name: "Saragossa Opening", plan: "Solid pawn support preparing a later d4 push." },
  { moves: ['Nc3'], eco: 'A00', name: "Van Geet / Dunst Opening", plan: "Flexible minor piece development preparing e4 or d4." },
  { moves: ['b3'], eco: 'A01', name: "Nimzo-Larsen Attack", plan: "Hypermodern control of the central dark squares via a fianchettoed Queen's Bishop on b2." },
  { moves: ['b3', 'e5', 'Bb2', 'Nc6'], eco: 'A01', name: "Nimzo-Larsen: Modern Variation", plan: "Direct battle over the central dark squares e5 and d4." },
  { moves: ['b3', 'd5', 'Bb2'], eco: 'A01', name: "Nimzo-Larsen: Classical Variation", plan: "White targets e5 and pressurizes Black's central d5 outpost." },
  { moves: ['f4'], eco: 'A02', name: "Bird's Opening", plan: "Controls e5 from the flank, aiming for a Dutch Defense in reverse." },
  { moves: ['f4', 'd5'], eco: 'A03', name: "Bird's Opening: Dutch Variation", plan: "Solid central confrontation fighting for key dark squares." },
  { moves: ['f4', 'e5'], eco: 'A02', name: "Bird's Opening: From's Gambit", plan: "A sharp tactical gambit challenging White's weakened kingside diagonals." },
  { moves: ['Nf3'], eco: 'A04', name: "Réti Opening", plan: "Hypermodern control of central squares without committing central pawns early." },
  { moves: ['Nf3', 'd5'], eco: 'A06', name: "Réti Opening: King's Knight Variation", plan: "Symmetrical struggle where White seeks counterplay against Black's d5 pawn." },
  { moves: ['Nf3', 'd5', 'c4'], eco: 'A09', name: "Réti Opening: Réti Gambit", plan: "White offers a flank pawn to deflect Black from the center and control d5." },
  { moves: ['Nf3', 'd5', 'g3'], eco: 'A07', name: "King's Indian Attack", plan: "White adopts a flexible kingside fianchetto, aiming for e4 and a kingside initiative." },
  { moves: ['c4'], eco: 'A10', name: "English Opening", plan: "Claims central influence on d5 from the flank, keeping flexible pawn structures." },
  { moves: ['c4', 'e5'], eco: 'A20', name: "English Opening: King's English", plan: "Reversed Sicilian setup where Black takes central space and White counters on the queenside." },
  { moves: ['c4', 'e5', 'Nc3'], eco: 'A21', name: "English: Reversed Sicilian", plan: "Direct control of d5 and early pressure on the central diagonal." },
  { moves: ['c4', 'e5', 'Nc3', 'Nf6', 'Nf3', 'Nc6'], eco: 'A28', name: "English: Four Knights Variation", plan: "Classical piece development fighting for central dominance." },
  { moves: ['c4', 'c5'], eco: 'A30', name: "English Opening: Symmetrical Variation", plan: "Mirrored pawn battle for d4 and d5 control." },
  { moves: ['c4', 'c5', 'Nf3', 'Nf6', 'd4', 'cxd4', 'Nxd4'], eco: 'A34', name: "English: Symmetrical Open", plan: "White opens the center and aims for active piece play." },
  { moves: ['c4', 'Nf6'], eco: 'A15', name: "English Opening: Anglo-Indian", plan: "Black maintains flexibility, preparing either ...e6, ...g6, or ...c5." },
  { moves: ['d4'], eco: 'A40', name: "Queen's Pawn Opening", plan: "Establishes a solid central pawn on d4, controlling e5 and opening diagonals." },
  { moves: ['d4', 'Nf6'], eco: 'A45', name: "Indian Defense", plan: "Hypermodern defense preventing White's immediate e4 push." },
  { moves: ['d4', 'Nf6', 'Bg5'], eco: 'A45', name: "Trompowsky Attack", plan: "Aggressive bishop pin targeting Black's knight to disrupt Black's pawn structure." },
  { moves: ['d4', 'Nf6', 'Nf3', 'e6', 'Bg5'], eco: 'A46', name: "Torre Attack", plan: "Solid development placing the bishop outside the pawn chain before playing e3." },
  { moves: ['d4', 'd5', 'Bf4'], eco: 'D00', name: "London System", plan: "Rock-solid setup developing the dark-squared bishop early, followed by e3 and c3." },
  { moves: ['d4', 'd5', 'Nf3', 'Nf6', 'Bf4'], eco: 'D02', name: "London System: Main Line", plan: "Creates an impenetrable pawn pyramid with an active bishop on f4." },
  { moves: ['d4', 'd5', 'Nf3', 'Nf6', 'e3'], eco: 'D05', name: "Colle System", plan: "Harmonious setup preparing Bd3, Nbd2, and a decisive central break with e4." },
  { moves: ['d4', 'c5'], eco: 'A43', name: "Old Benoni Defense", plan: "Immediate strike against White's d4 pawn, fighting for dark-square control." },
  { moves: ['d4', 'Nf6', 'c4', 'c5', 'd5'], eco: 'A56', name: "Benoni Defense", plan: "White claims space on d5 while Black prepares queenside counterplay." },
  { moves: ['d4', 'Nf6', 'c4', 'c5', 'd5', 'b5'], eco: 'A57', name: "Benko Gambit", plan: "Black sacrifices a flank pawn for permanent queenside pressure along the a- and b-files." },
  { moves: ['d4', 'Nf6', 'c4', 'c5', 'd5', 'e6', 'Nc3', 'exd5', 'cxd5', 'd6'], eco: 'A60', name: "Modern Benoni", plan: "Dynamic asymmetrical struggle: White has central pawns, Black has an active queenside pawn majority." },
  { moves: ['d4', 'Nf6', 'c4', 'e5'], eco: 'A51', name: "Budapest Gambit", plan: "Tactical gambit challenging White's central control immediately." },
  { moves: ['d4', 'f5'], eco: 'A80', name: "Dutch Defense", plan: "Black stakes a claim on e4 and aims for an aggressive kingside attack." },
  { moves: ['d4', 'f5', 'g3', 'Nf6', 'Bg2', 'g6'], eco: 'A87', name: "Leningrad Dutch", plan: "Combines Dutch king-safety pressure with a Kings Indian style kingside fianchetto." },
  { moves: ['d4', 'f5', 'c4', 'e6', 'g3', 'd5', 'Bg2', 'c6'], eco: 'A90', name: "Dutch Defense: Stonewall", plan: "Immovable pawn wedge on d5, e6, and f5, creating strong grip on e4." },

  // ECO B: Semi-Open Games other than French (B00 - B99)
  { moves: ['e4'], eco: 'B00', name: "King's Pawn Opening", plan: "Controls central squares d5 and f5, opening paths for Queen and Bishop." },
  { moves: ['e4', 'Nc6'], eco: 'B00', name: "Nimzowitsch Defense", plan: "Unorthodox knight defense applying pressure to d4 and e5." },
  { moves: ['e4', 'b6'], eco: 'B00', name: "Owen's Defense", plan: "Fianchettoes Queen's Bishop to b7 to pressurize e4." },
  { moves: ['e4', 'a6'], eco: 'B00', name: "St. George Defense", plan: "Prepares b5 to expand on the queenside." },
  { moves: ['e4', 'd5'], eco: 'B01', name: "Scandinavian Defense", plan: "Direct central challenge to White's e4 pawn on move 1." },
  { moves: ['e4', 'd5', 'exd5', 'Qxd5', 'Nc3', 'Qa5'], eco: 'B01', name: "Scandinavian: Main Line", plan: "Black queen retreats to a5 while maintaining active piece development." },
  { moves: ['e4', 'd5', 'exd5', 'Nf6'], eco: 'B01', name: "Scandinavian: Modern Variation", plan: "Recovers the d5 pawn with a knight to avoid early queen exposure." },
  { moves: ['e4', 'Nf6'], eco: 'B02', name: "Alekhine's Defense", plan: "Provokes White's central pawns forward to later undermine them with ...d6." },
  { moves: ['e4', 'Nf6', 'e5', 'Nd5', 'd4', 'd6'], eco: 'B03', name: "Alekhine's Defense: Four Pawns Preview", plan: "White gains massive central space; Black prepares to attack the overextended pawn center." },
  { moves: ['e4', 'Nf6', 'e5', 'Nd5', 'd4', 'd6', 'Nf3'], eco: 'B04', name: "Alekhine: Modern Variation", plan: "White solidifies central control without pushing too aggressively." },
  { moves: ['e4', 'g6'], eco: 'B06', name: "Modern Defense", plan: "Hypermodern kingside fianchetto waiting to strike at White's center." },
  { moves: ['e4', 'd6', 'd4', 'Nf6', 'Nc3', 'g6'], eco: 'B07', name: "Pirc Defense", plan: "Flexible defense allowing White central pawns before counter-attacking with ...e5 or ...c5." },
  { moves: ['e4', 'd6', 'd4', 'Nf6', 'Nc3', 'g6', 'f4'], eco: 'B09', name: "Pirc Defense: Austrian Attack", plan: "Fierce three-pawn assault aiming for a rapid kingside breakthrough." },
  { moves: ['e4', 'c6'], eco: 'B10', name: "Caro-Kann Defense", plan: "Solid preparation for ...d5, establishing a durable central pawn barrier." },
  { moves: ['e4', 'c6', 'd4', 'd5'], eco: 'B12', name: "Caro-Kann: Classical Setup", plan: "Central confrontation where Black keeps a clean pawn structure and develops the light-squared bishop." },
  { moves: ['e4', 'c6', 'd4', 'd5', 'e5'], eco: 'B12', name: "Caro-Kann: Advance Variation", plan: "White claims space; Black plays ...Bf5 before locking the pawn chain with ...e6." },
  { moves: ['e4', 'c6', 'd4', 'd5', 'e5', 'Bf5'], eco: 'B12', name: "Caro-Kann: Advance, Bishop Out", plan: "Active bishop outside the pawn chain gives Black comfortable equality." },
  { moves: ['e4', 'c6', 'd4', 'd5', 'Nc3', 'dxe4', 'Nxe4', 'Bf5'], eco: 'B18', name: "Caro-Kann: Classical (Capablanca)", plan: "Black develops bishop with tempo on White's knight before retreating to g6." },
  { moves: ['e4', 'c6', 'd4', 'd5', 'Nc3', 'dxe4', 'Nxe4', 'Nd7'], eco: 'B17', name: "Caro-Kann: Steinitz / Karpov", plan: "Prepares ...Ngf6 without allowing doubled pawns." },
  { moves: ['e4', 'c6', 'd4', 'd5', 'exd5', 'cxd5', 'c4'], eco: 'B13', name: "Caro-Kann: Panov-Botvinnik Attack", plan: "White creates an isolated queen's pawn in exchange for dynamic piece activity." },
  { moves: ['e4', 'c5'], eco: 'B20', name: "Sicilian Defense", plan: "The most popular counter-attacking defense: trades a flank pawn for central dominance." },
  { moves: ['e4', 'c5', 'c3'], eco: 'B22', name: "Sicilian Defense: Alapin Variation", plan: "Prepares an immediate d4 to establish an ideal two-pawn center." },
  { moves: ['e4', 'c5', 'Nc3'], eco: 'B23', name: "Closed Sicilian", plan: "White avoids early central opening, opting for a kingside fianchetto and gradual attack." },
  { moves: ['e4', 'c5', 'd4', 'cxd4', 'c3'], eco: 'B21', name: "Sicilian: Smith-Morra Gambit", plan: "White sacrifices a pawn for rapid development and open c- and d-files." },
  { moves: ['e4', 'c5', 'Nf3'], eco: 'B27', name: "Sicilian Defense: Open Variation Prep", plan: "Standard preparation for 3. d4 opening the central files." },
  { moves: ['e4', 'c5', 'Nf3', 'd6', 'd4', 'cxd4', 'Nxd4', 'Nf6', 'Nc3', 'a6'], eco: 'B90', name: "Sicilian Najdorf", plan: "The sharpest defense in chess: controls b5 and prepares queenside counter-attacks." },
  { moves: ['e4', 'c5', 'Nf3', 'd6', 'd4', 'cxd4', 'Nxd4', 'Nf6', 'Nc3', 'a6', 'Be3'], eco: 'B90', name: "Sicilian Najdorf: English Attack", plan: "White plans f3, Qd2, and g4 with opposite-side castling and a deadly kingside pawn storm." },
  { moves: ['e4', 'c5', 'Nf3', 'd6', 'd4', 'cxd4', 'Nxd4', 'Nf6', 'Nc3', 'a6', 'Bg5'], eco: 'B95', name: "Sicilian Najdorf: Classical 6.Bg5", plan: "Sharp tactical theoretical battle putting immediate pressure on Black's knight." },
  { moves: ['e4', 'c5', 'Nf3', 'd6', 'd4', 'cxd4', 'Nxd4', 'Nf6', 'Nc3', 'g6'], eco: 'B70', name: "Sicilian Dragon", plan: "Black fianchettoes on g7, aiming deadly diagonal laser pressure towards White's queenside." },
  { moves: ['e4', 'c5', 'Nf3', 'd6', 'd4', 'cxd4', 'Nxd4', 'Nf6', 'Nc3', 'g6', 'Be3', 'Bg7', 'f3', 'O-O', 'Qd2'], eco: 'B75', name: "Sicilian Dragon: Yugoslav Attack", plan: "Mutual attacks: White storms the kingside with h4-h5, Black counters on the half-open c-file." },
  { moves: ['e4', 'c5', 'Nf3', 'Nc6', 'd4', 'cxd4', 'Nxd4', 'Nf6', 'Nc3', 'e5'], eco: 'B33', name: "Sicilian Sveshnikov", plan: "Black takes central space with ...e5, accepting a backward d6 pawn for immense piece activity." },
  { moves: ['e4', 'c5', 'Nf3', 'e6', 'd4', 'cxd4', 'Nxd4', 'Nc6'], eco: 'B44', name: "Sicilian Taimanov", plan: "Extremely flexible setup retaining options for ...a6, ...Qc7, and central counter-strikes." },
  { moves: ['e4', 'c5', 'Nf3', 'e6', 'd4', 'cxd4', 'Nxd4', 'a6'], eco: 'B41', name: "Sicilian Kan", plan: "Quiet, solid prophylactic system controlling b5 and keeping kingside options open." },
  { moves: ['e4', 'c5', 'Nf3', 'd6', 'd4', 'cxd4', 'Nxd4', 'Nf6', 'Nc3', 'Nc6'], eco: 'B56', name: "Classical Sicilian", plan: "Natural development putting pressure on White's d4 knight." },
  { moves: ['e4', 'c5', 'Nf3', 'Nc6', 'd4', 'cxd4', 'Nxd4', 'g6'], eco: 'B34', name: "Accelerated Dragon", plan: "Reaches Dragon structure without playing d6, saving a tempo for ...d5." },

  // ECO C: Open Games & French Defense (C00 - C99)
  { moves: ['e4', 'e6'], eco: 'C00', name: "French Defense", plan: "Solid counter-attacking system preparing ...d5 while blunting White's f7 attacking diagonal." },
  { moves: ['e4', 'e6', 'd4', 'd5'], eco: 'C00', name: "French Defense: Normal Continuation", plan: "White has more space, Black challenges the center and attacks White's d4 chain." },
  { moves: ['e4', 'e6', 'd4', 'd5', 'e5'], eco: 'C02', name: "French: Advance Variation", plan: "White locks the center; Black immediately attacks the base with ...c5 and ...Qb6." },
  { moves: ['e4', 'e6', 'd4', 'd5', 'Nc3', 'Bb4'], eco: 'C15', name: "French: Winawer Variation", plan: "Sharp, unbalanced pin: Black offers the bishop pair to ruin White's queenside pawn structure." },
  { moves: ['e4', 'e6', 'd4', 'd5', 'Nc3', 'Nf6'], eco: 'C10', name: "French: Classical Variation", plan: "Solid knight development maintaining pressure on White's e4 outpost." },
  { moves: ['e4', 'e6', 'd4', 'd5', 'Nd2'], eco: 'C03', name: "French: Tarrasch Variation", plan: "White avoids the Winawer pin and keeps the c-pawn free to support d4." },
  { moves: ['e4', 'e6', 'd4', 'd5', 'exd5', 'exd5'], eco: 'C01', name: "French: Exchange Variation", plan: "Symmetrical pawn structure leading to balanced, classical piece maneuver battles." },
  { moves: ['e4', 'e5'], eco: 'C20', name: "Open Game", plan: "Direct central confrontation battling for d4 and f4 control." },
  { moves: ['e4', 'e5', 'Bc4'], eco: 'C23', name: "Bishop's Opening", plan: "Rapid bishop deployment targeting f7 without committing the king's knight." },
  { moves: ['e4', 'e5', 'Nc3'], eco: 'C25', name: "Vienna Game", plan: "Controls d5 before choosing between f4 (Vienna Gambit) or quiet development." },
  { moves: ['e4', 'e5', 'f4'], eco: 'C30', name: "King's Gambit", plan: "Romantic, aggressive sacrifice of the f-pawn to demolish Black's center and open the f-file." },
  { moves: ['e4', 'e5', 'f4', 'exf4'], eco: 'C34', name: "King's Gambit Accepted", plan: "Black accepts the material; White aims for rapid development and central conquest." },
  { moves: ['e4', 'e5', 'Nf3'], eco: 'C40', name: "King's Knight Opening", plan: "Attacks Black's e5 pawn with tempo, initiating active central play." },
  { moves: ['e4', 'e5', 'Nf3', 'd6'], eco: 'C41', name: "Philidor Defense", plan: "Solid pawn defense of e5, though it restricts Black's dark-squared bishop." },
  { moves: ['e4', 'e5', 'Nf3', 'Nf6'], eco: 'C42', name: "Petroff Defense (Russian Game)", plan: "Symmetrical counter-attack on White's e4 pawn, renowned for drawing resilience." },
  { moves: ['e4', 'e5', 'Nf3', 'Nf6', 'Nxe5', 'd6', 'Nf3', 'Nxe4', 'd4', 'd5'], eco: 'C42', name: "Petroff: Classical Main Line", plan: "Balanced central outposts; White seeks initiative with active bishops." },
  { moves: ['e4', 'e5', 'Nf3', 'Nc6'], eco: 'C44', name: "Open Game: Normal Continuation", plan: "Natural knight development defending e5 and controlling d4." },
  { moves: ['e4', 'e5', 'Nf3', 'Nc6', 'd4'], eco: 'C44', name: "Scotch Game", plan: "Immediate strike in the center, blowing open central lines for active piece play." },
  { moves: ['e4', 'e5', 'Nf3', 'Nc6', 'd4', 'exd4', 'Nxd4'], eco: 'C45', name: "Scotch: Open Main Line", plan: "Central piece dominance for White; Black develops with ...Bc5 or ...Nf6." },
  { moves: ['e4', 'e5', 'Nf3', 'Nc6', 'c3'], eco: 'C44', name: "Ponziani Opening", plan: "Prepares an imposing d4 central pawn front." },
  { moves: ['e4', 'e5', 'Nf3', 'Nc6', 'Nc3', 'Nf6'], eco: 'C47', name: "Four Knights Game", plan: "Symmetrical, classical development with solid foundational principles." },
  { moves: ['e4', 'e5', 'Nf3', 'Nc6', 'Bc4'], eco: 'C50', name: "Italian Game", plan: "Direct pressure against Black's f7 weakness, the most sensitive square in Black's camp." },
  { moves: ['e4', 'e5', 'Nf3', 'Nc6', 'Bc4', 'Bc5'], eco: 'C53', name: "Giuoco Piano", plan: "The quiet game: both sides mobilize bishops to active posts and vie for center control." },
  { moves: ['e4', 'e5', 'Nf3', 'Nc6', 'Bc4', 'Bc5', 'c3', 'Nf6', 'd3'], eco: 'C50', name: "Giuoco Pianissimo", plan: "Patient positional maneuvering preparing a future d4 or b4 push." },
  { moves: ['e4', 'e5', 'Nf3', 'Nc6', 'Bc4', 'Bc5', 'b4'], eco: 'C51', name: "Evans Gambit", plan: "Audacious wing gambit sacrificing a pawn to build a massive center and dominate diagonals." },
  { moves: ['e4', 'e5', 'Nf3', 'Nc6', 'Bc4', 'Nf6'], eco: 'C55', name: "Two Knights Defense", plan: "Active counter-challenge on White's e4 pawn." },
  { moves: ['e4', 'e5', 'Nf3', 'Nc6', 'Bc4', 'Nf6', 'Ng5'], eco: 'C57', name: "Fried Liver Attack Preparation", plan: "Double attack against the f7 pawn, forcing tactical complications." },
  { moves: ['e4', 'e5', 'Nf3', 'Nc6', 'Bb5'], eco: 'C60', name: "Ruy Lopez (Spanish Opening)", plan: "The Royal Game: pins the defender of e5 and establishes long-term positional pressure." },
  { moves: ['e4', 'e5', 'Nf3', 'Nc6', 'Bb5', 'a6'], eco: 'C68', name: "Ruy Lopez: Morphy Defense", plan: "Questions the bishop immediately, forcing White to declare intentions." },
  { moves: ['e4', 'e5', 'Nf3', 'Nc6', 'Bb5', 'a6', 'Bxc6'], eco: 'C68', name: "Ruy Lopez: Exchange Variation", plan: "White damages Black's queenside pawns and aims for a winning king and pawn endgame." },
  { moves: ['e4', 'e5', 'Nf3', 'Nc6', 'Bb5', 'a6', 'Ba4', 'Nf6', 'O-O', 'Be7', 'Re1', 'b5', 'Bb3', 'd6', 'c3', 'O-O'], eco: 'C92', name: "Ruy Lopez: Closed Main Line", plan: "Grandmaster battleground: White builds toward d4 while Black fights for queenside counterplay." },
  { moves: ['e4', 'e5', 'Nf3', 'Nc6', 'Bb5', 'a6', 'Ba4', 'Nf6', 'O-O', 'Be7', 'Re1', 'b5', 'Bb3', 'O-O', 'c3', 'd5'], eco: 'C89', name: "Ruy Lopez: Marshall Attack", plan: "Legendary pawn sacrifice for overwhelming initiative and kingside attacking chances." },
  { moves: ['e4', 'e5', 'Nf3', 'Nc6', 'Bb5', 'Nf6'], eco: 'C65', name: "Ruy Lopez: Berlin Defense", plan: "The Berlin Wall: solid endgame resilience made famous by Kramnik against Kasparov." },

  // ECO D: Closed & Semi-Closed Games (D00 - D99)
  { moves: ['d4', 'd5'], eco: 'D00', name: "Closed Game", plan: "Solid central pawn confrontation fighting for e4 and e5 dominance." },
  { moves: ['d4', 'd5', 'c4'], eco: 'D06', name: "Queen's Gambit", plan: "Offers a wing pawn to gain superior central control on d4 and e4." },
  { moves: ['d4', 'd5', 'c4', 'dxc4'], eco: 'D20', name: "Queen's Gambit Accepted", plan: "Black takes the pawn, intending to return it later while completing rapid development." },
  { moves: ['d4', 'd5', 'c4', 'c6'], eco: 'D10', name: "Slav Defense", plan: "Reinforces d5 without blocking the light-squared bishop's diagonal." },
  { moves: ['d4', 'd5', 'c4', 'c6', 'Nf3', 'Nf6', 'Nc3', 'dxc4'], eco: 'D15', name: "Slav: Open Main Line", plan: "Black temporarily captures on c4 and plans ...Bf5 or ...b5 expansion." },
  { moves: ['d4', 'd5', 'c4', 'c6', 'Nf3', 'Nf6', 'Nc3', 'e6'], eco: 'D43', name: "Semi-Slav Defense", plan: "The most dynamic response to the Queen's Gambit: rock-solid triangle on c6, d5, e6." },
  { moves: ['d4', 'd5', 'c4', 'c6', 'Nf3', 'Nf6', 'Nc3', 'e6', 'e3', 'Nbd7', 'Bd3', 'dxc4', 'Bxc4', 'b5'], eco: 'D47', name: "Semi-Slav: Meran Variation", plan: "Explosive counter-strike where Black expands with ...b5 and strikes with ...c5." },
  { moves: ['d4', 'd5', 'c4', 'e6'], eco: 'D30', name: "Queen's Gambit Declined", plan: "Classical defense anchoring d5, creating an unyielding central fortress." },
  { moves: ['d4', 'd5', 'c4', 'e6', 'Nc3', 'Nf6', 'Bg5', 'Be7', 'e3', 'O-O', 'Nf3', 'Nbd7'], eco: 'D60', name: "QGD: Orthodox Defense", plan: "The gold standard of classical defense: solid, patient development." },
  { moves: ['d4', 'd5', 'c4', 'e6', 'Nc3', 'Nf6', 'cxd5', 'exd5'], eco: 'D35', name: "QGD: Exchange Variation", plan: "White initiates the minority attack on the queenside using b4-b5." },
  { moves: ['d4', 'd5', 'c4', 'e6', 'Nc3', 'Nf6', 'Nf3', 'c5'], eco: 'D40', name: "Semi-Tarrasch Defense", plan: "Black immediately challenges White's d4 pawn center." },
  { moves: ['d4', 'd5', 'c4', 'Nc6'], eco: 'D07', name: "Chigorin Defense", plan: "Unorthodox minor piece counter-attack prioritizing rapid development over pawn stability." },
  { moves: ['d4', 'Nf6', 'c4', 'g6', 'Nc3', 'd5'], eco: 'D80', name: "Grünfeld Defense", plan: "Modern masterpiece: Black allows White a huge pawn center, then attacks it relentlessly." },
  { moves: ['d4', 'Nf6', 'c4', 'g6', 'Nc3', 'd5', 'cxd5', 'Nxd5', 'e4', 'Nxc3', 'bxc3', 'Bg7'], eco: 'D85', name: "Grünfeld: Exchange Variation", plan: "White holds a massive center; Black chips away with ...c5 and dark-square pressure." },
  { moves: ['d4', 'Nf6', 'c4', 'e6', 'g3'], eco: 'E00', name: "Catalan Opening", plan: "Combines Queen's Gambit with a lethal kingside fianchetto along the h1-a8 diagonal." },
  { moves: ['d4', 'Nf6', 'c4', 'e6', 'g3', 'd5', 'Bg2', 'Be7', 'Nf3', 'O-O'], eco: 'E06', name: "Catalan: Closed Main Line", plan: "Subtle positional squeeze where White's g2 bishop exerts long-term pressure." },

  // ECO E: Indian Defenses (E00 - E99)
  { moves: ['d4', 'Nf6', 'c4', 'e6', 'Nf3', 'b6'], eco: 'E12', name: "Queen's Indian Defense", plan: "Black controls the central e4 square by placing the bishop on b7." },
  { moves: ['d4', 'Nf6', 'c4', 'e6', 'Nf3', 'Bb4+'], eco: 'E11', name: "Bogo-Indian Defense", plan: "Speedy piece development offering to trade the dark-squared bishop." },
  { moves: ['d4', 'Nf6', 'c4', 'e6', 'Nc3', 'Bb4'], eco: 'E20', name: "Nimzo-Indian Defense", plan: "One of Black's most respected defenses: pins the c3 knight to prevent e4 and fight for e4 control." },
  { moves: ['d4', 'Nf6', 'c4', 'e6', 'Nc3', 'Bb4', 'e3'], eco: 'E40', name: "Nimzo-Indian: Rubinstein Variation", plan: "Solid central reinforcement preparing Bd3 and Ne2." },
  { moves: ['d4', 'Nf6', 'c4', 'e6', 'Nc3', 'Bb4', 'Qc2'], eco: 'E32', name: "Nimzo-Indian: Classical (Capablanca)", plan: "Avoids doubled c-pawns by protecting the knight with the Queen." },
  { moves: ['d4', 'Nf6', 'c4', 'e6', 'Nc3', 'Bb4', 'a3', 'Bxc3+', 'bxc3'], eco: 'E24', name: "Nimzo-Indian: Sämisch Variation", plan: "White accepts doubled pawns to secure the bishop pair and build a massive center." },
  { moves: ['d4', 'Nf6', 'c4', 'g6', 'Nc3', 'Bg7'], eco: 'E60', name: "King's Indian Defense", plan: "Dynamic counter-attacking defense: Black allows White the center, then launches a ferocious kingside attack." },
  { moves: ['d4', 'Nf6', 'c4', 'g6', 'Nc3', 'Bg7', 'e4', 'd6'], eco: 'E70', name: "King's Indian: Basic Setup", plan: "Solid pawn wedge on d6 and g6, preparing ...e5 or ...c5." },
  { moves: ['d4', 'Nf6', 'c4', 'g6', 'Nc3', 'Bg7', 'e4', 'd6', 'Nf3', 'O-O', 'Be2', 'e5', 'O-O', 'Nc6', 'd5', 'Ne7'], eco: 'E97', name: "King's Indian: Mar del Plata Main Line", plan: "Classic opposite-side storm: White breaks on the queenside (c5), Black charges the King (f5-f4-g5-g4)." },
  { moves: ['d4', 'Nf6', 'c4', 'g6', 'Nc3', 'Bg7', 'e4', 'd6', 'f3'], eco: 'E80', name: "King's Indian: Sämisch Variation", plan: "Solidifies e4 with f3, preparing Be3, Qd2, and opposite-side castling." },
  { moves: ['d4', 'Nf6', 'c4', 'g6', 'Nc3', 'Bg7', 'e4', 'd6', 'Be2', 'O-O', 'Bg5'], eco: 'E73', name: "King's Indian: Averbakh Variation", plan: "Pins the knight to discourage Black's standard ...e5 break." }
];

const fileContent = `/**
 * Complete Opening Database (ECO A00 - E99) & Strategic Opening Plans
 * Identifies Book Moves (📖) and explains opening theory
 */
(function(global) {
  'use strict';

  const OPENING_BOOK = ${JSON.stringify(OPENINGS, null, 2)};

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

})(typeof window !== 'undefined' ? window : this);
`;

const targetPath = path.join(__dirname, '..', 'js', 'openings.js');
fs.writeFileSync(targetPath, fileContent, 'utf8');
console.log('Successfully wrote comprehensive ECO A00-E99 Opening Database to ' + targetPath);
